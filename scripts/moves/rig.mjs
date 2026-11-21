/**
 * Unwind figure engine — solves, animates and validates desk-move poses.
 *
 * Authoring model (see poses.mjs):
 *  - A pose says where the body is (seated on the chair / standing / free),
 *    how the spine bends, and where hands and feet go. Targets are anchors on
 *    the body or furniture ("knee.R", "head.R", "desk.edge", "hand.R", ...),
 *    not raw coordinates, so contacts are exact.
 *  - Elbows and knees bend the anatomical way automatically (elbows flex
 *    forward, knees flex backward, and in front view both point outward).
 *  - Keyframes are solved to joint angles; in-betweens interpolate angles in
 *    anatomical ranges (arms swing through the front, not through the body).
 *    A hand or foot whose target is the same in both keys stays planted.
 *  - validateFrame() checks joint limits, reach, ground, seat contact and
 *    hand/head collisions; the generator refuses to ship a move that fails.
 *
 * Angles (degrees): 0 = down, 90 = screen-right, 180 = up, -90 = screen-left.
 * Side view faces screen-right. In front view "L" is the screen-left limb.
 */

export const CANVAS = 512;
export const GROUND = 452;
export const ANKLE_Y = 444;
export const SEAT_Y = 364;
export const DESK_Y = 300;
export const CHAIR_SIDE_X = 224;
export const CHAIR_FRONT_X = 256;
export const DESK_X = 352;

export const BODY = {
  torso: 112,
  neck: 18,
  headR: 22,
  upper: 64,
  fore: 58,
  hand: 15,
  thigh: 84,
  shin: 84,
  foot: 26,
  shoulderHalf: 34,
  hipHalf: 18,
  sitDepth: 12, // pelvis joint height above the seat surface
};

// ── Math ────────────────────────────────────────────────────────────────

const rad = (d) => (d * Math.PI) / 180;
export const step = (p, a, len) => [p[0] + len * Math.sin(rad(a)), p[1] + len * Math.cos(rad(a))];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
export const angleOf = (v) => (Math.atan2(v[0], v[1]) * 180) / Math.PI;
/** Normalize an angle into [lo, lo + 360). */
const wrap = (a, lo = -180) => {
  let x = (a - lo) % 360;
  if (x < 0) x += 360;
  return x + lo;
};
const lerp = (a, b, t) => a + (b - a) * t;
const lerpPt = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

function bezier(p0, p1, p2, p3, t) {
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
}

/** Both two-bone IK solutions: [{ a1, a2, joint, end, short }] (short = px the target was out of reach). */
function ikSolutions(root, target, l1, l2) {
  const d = sub(target, root);
  const raw = Math.hypot(d[0], d[1]);
  const dd = Math.min(Math.max(raw, Math.abs(l1 - l2) + 0.01), l1 + l2 - 0.01);
  const base = angleOf(d);
  const cos = (l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd);
  const off = (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
  return [1, -1].map((sign) => {
    const a1 = base + sign * off;
    const joint = step(root, a1, l1);
    const a2 = angleOf(sub(target, joint));
    return { a1, a2, joint, end: step(joint, a2, l2), short: Math.max(0, raw - (l1 + l2)) };
  });
}

// ── Torso / head ────────────────────────────────────────────────────────

function torsoGeometry(p) {
  const front = p.view === 'front';
  const pelvis = p.pelvis;
  const top = step(pelvis, p.spine, BODY.torso);
  const perp = p.spine - 90;
  const bow = (p.curve ?? 0) * 34;
  const c1 = step(step(pelvis, p.spine, BODY.torso * 0.33), perp, -bow);
  const c2 = step(step(pelvis, p.spine, BODY.torso * 0.72), perp, -bow);
  const spine = Array.from({ length: 13 }, (_, i) => bezier(pelvis, c1, c2, top, i / 12));
  const topDir = angleOf(sub(top, spine[11]));
  const neckEnd = step(top, p.neck, BODY.neck);
  const headC = step(neckEnd, p.neck, BODY.headR + 5);
  const twist = p.twist ?? 0;
  const half = front ? BODY.shoulderHalf * (1 - 0.45 * Math.abs(twist)) : 0;
  const shPerp = topDir - 90;
  const lift = (p.shrug ?? 0) * 16;
  const chest = spine[10];
  const shCenter = step(step(step(chest, shPerp, front ? twist * 10 : 0), topDir, lift), shPerp, front ? 0 : (p.protract ?? 0) * 12);
  const shL = step(shCenter, shPerp, -half);
  const shR = step(shCenter, shPerp, half);
  const hh = front ? BODY.hipHalf : 0;
  const hipL = step(pelvis, perp, -hh);
  const hipR = step(pelvis, perp, hh);
  return { front, pelvis, top, topDir, neckEnd, headC, spine, shL, shR, hipL, hipR };
}

/** Body + furniture anchors available to limb targets. */
function anchorPoint(name, g, p, limbs) {
  const r = BODY.headR;
  const faceDir = p.neck - 90; // side view: facing; front view: screen-right
  const backDir = p.neck + 90;
  const sp = g.spine;
  const frontOfSpine = p.spine - 90;
  const props = p.props ?? [];
  const chairProp = props.find((x) => x.type === 'chairSide' || x.type === 'chairFront');
  const deskProp = props.find((x) => x.type === 'desk');
  const chairX = chairProp?.x ?? (g.front ? CHAIR_FRONT_X : CHAIR_SIDE_X);
  const deskX = deskProp?.x ?? DESK_X;
  const hang = (sh, side) => {
    const down = p.spine + 180;
    const pt = step(sh, down, BODY.upper + BODY.fore - 6);
    return g.front ? step(pt, down + 90, side * -10) : step(pt, down - 90, 6);
  };
  const table = {
    'hang.L': () => hang(g.shL, -1),
    'hang.R': () => hang(g.shR, 1),
    'head.top': () => step(g.headC, p.neck, r + 2),
    'head.front': () => step(g.headC, faceDir, r + 4),
    'head.back': () => step(g.headC, backDir, r + 4),
    'head.R': () => step(g.headC, faceDir, r + 4), // front view: screen-right side of the head
    'head.L': () => step(g.headC, backDir, r + 4),
    nape: () => step(step(g.headC, backDir, r * 0.6), p.neck + 180, r * 0.6),
    chest: () => (g.front ? sp[9] : step(sp[9], frontOfSpine, 22)),
    sternum: () => (g.front ? step(sp[9], p.spine, 6) : step(sp[10], frontOfSpine, 20)),
    belly: () => (g.front ? sp[5] : step(sp[5], frontOfSpine, 22)),
    lowerBack: () => step(sp[3], p.spine + 90, 24),
    'seat.front': () => [chairX + 48, SEAT_Y - 4],
    'seat.L': () => [chairX - 62, SEAT_Y - 4],
    'seat.R': () => [chairX + 62, SEAT_Y - 4],
    'chairBack.top': () => (g.front ? [chairX, SEAT_Y - 152] : [chairX - 56, SEAT_Y - 126]),
    'desk.edge': () => [deskX + 10, DESK_Y - 8],
  };
  if (table[name]) return table[name]();
  const m = /^(knee|ankle|hip|thigh|toe|hand|wrist|elbow|shoulder)\.([LR])$/.exec(name);
  if (m) {
    const [, part, side] = m;
    const leg = limbs[`leg${side}`];
    const arm = limbs[`arm${side}`];
    const need = (x, what) => {
      if (!x) throw new Error(`anchor ${name} used before ${what}${side} is solved`);
      return x;
    };
    switch (part) {
      case 'hip': return side === 'L' ? g.hipL : g.hipR;
      case 'shoulder': return side === 'L' ? g.shL : g.shR;
      case 'knee': return need(leg, 'leg').pts[1];
      case 'ankle': return need(leg, 'leg').pts[2];
      case 'toe': return need(leg, 'leg').pts[3];
      case 'thigh': {
        const [h, k] = need(leg, 'leg').pts;
        const mid = lerpPt(h, k, 0.6);
        return g.front ? mid : step(mid, angleOf(sub(k, h)) + 90, 12); // top surface of the thigh
      }
      case 'hand': return need(arm, 'arm').pts[3];
      case 'wrist': return need(arm, 'arm').pts[2];
      case 'elbow': return need(arm, 'arm').pts[1];
    }
  }
  throw new Error(`unknown anchor "${name}"`);
}

function resolveTarget(spec, g, p, limbs) {
  if (Array.isArray(spec)) return spec;
  const base = anchorPoint(spec.at, g, p, limbs);
  return [base[0] + (spec.dx ?? 0), base[1] + (spec.dy ?? 0)];
}

// ── Anatomical bend choice ──────────────────────────────────────────────

function pickLateral(sols, g) {
  // front view: elbows / knees point away from the body's midline
  const mid = g.pelvis[0];
  return Math.abs(sols[0].joint[0] - mid) >= Math.abs(sols[1].joint[0] - mid) ? sols[0] : sols[1];
}

function pickArm(sols, g) {
  if (g.front) {
    // Elbow out to the side and away from the face (a straight cross-body arm
    // keeps its elbow low instead of flipping up past the head).
    const mid = g.pelvis[0];
    const score = (s) => Math.abs(s.joint[0] - mid) + 0.8 * dist(s.joint, g.headC);
    return score(sols[0]) >= score(sols[1]) ? sols[0] : sols[1];
  }
  // side view: the elbow flexes forward — forearm rotates toward +angle from the upper arm
  const ok = (s) => {
    const flex = wrap(s.a2 - s.a1);
    return flex >= -5 && flex <= 175;
  };
  return ok(sols[0]) || !ok(sols[1]) ? sols[0] : sols[1];
}

function pickLeg(sols, g) {
  if (g.front) return pickLateral(sols, g);
  // side view: the knee flexes backward — shin rotates toward -angle from the thigh
  const ok = (s) => {
    const flex = wrap(s.a2 - s.a1);
    return flex <= 5 && flex >= -175;
  };
  return ok(sols[0]) || !ok(sols[1]) ? sols[0] : sols[1];
}

// ── Solve a keyframe pose → joint frame ─────────────────────────────────

const ARM_KEYS = ['armL', 'armR'];
const LEG_KEYS = ['legL', 'legR'];

function placePelvis(p) {
  if (p.base === 'seated') {
    const chairX = p.view === 'front' ? CHAIR_FRONT_X : CHAIR_SIDE_X;
    return [chairX + (p.view === 'front' ? 0 : -10) + (p.seatShift ?? 0), SEAT_Y - BODY.sitDepth];
  }
  if (p.base === 'standing') {
    // Highest pelvis that keeps both planted ankles reachable with soft knees.
    const x = p.x ?? 256;
    const hh = p.view === 'front' ? BODY.hipHalf : 0;
    let y = -Infinity;
    for (const [k, sign] of [['legL', -1], ['legR', 1]]) {
      const a = p[k].ankle;
      if (!Array.isArray(a)) continue;
      const reach = (BODY.thigh * (p[k].thighK ?? 1) + BODY.shin) * 0.985;
      const dx = a[0] - (x + sign * hh);
      y = Math.max(y, a[1] - Math.sqrt(Math.max(0, reach * reach - dx * dx)));
    }
    return [x, y + (p.drop ?? 0)];
  }
  return p.pelvis;
}

const solveCache = new WeakMap();

export function solveKey(spec) {
  if (solveCache.has(spec)) return solveCache.get(spec);
  const p = { curve: 0, twist: 0, shrug: 0, protract: 0, face: 0, ...spec };
  p.pelvis = placePelvis(p);
  const g = torsoGeometry(p);
  const limbs = {};
  for (const k of LEG_KEYS) {
    const L = p[k];
    const hip = k === 'legL' ? g.hipL : g.hipR;
    const target = resolveTarget(L.ankle, g, p, limbs);
    const sols = ikSolutions(hip, target, BODY.thigh * (L.thighK ?? 1), BODY.shin);
    const s = L.bend ? sols[L.bend > 0 ? 0 : 1] : pickLeg(sols, g);
    const toe = step(s.end, L.toe ?? 90, BODY.foot * (L.footK ?? 1));
    limbs[k] = { a1: s.a1, a2: s.a2, af: L.toe ?? 90, target, short: s.short, pts: [hip, s.joint, s.end, toe], spec: L };
  }
  // Arms: solve the one the other hand refers to first.
  const dependsOn = (k) => {
    const at = p[k].hand?.at ?? '';
    const other = k === 'armL' ? 'R' : 'L';
    return /^(hand|wrist|elbow)\./.test(at) && at.endsWith(other);
  };
  const order = dependsOn('armL') ? ['armR', 'armL'] : ['armL', 'armR'];
  for (const k of order) {
    const A = p[k];
    const sh = k === 'armL' ? g.shL : g.shR;
    const target = resolveTarget(A.hand, g, p, limbs);
    const sols = ikSolutions(sh, target, BODY.upper, BODY.fore);
    const s = A.elbowUp ? (sols[0].joint[1] <= sols[1].joint[1] ? sols[0] : sols[1]) : A.bend ? sols[A.bend > 0 ? 0 : 1] : pickArm(sols, g);
    const aw = typeof A.wrist === 'number' ? A.wrist : s.a2;
    limbs[k] = { a1: s.a1, a2: s.a2, aw, target, short: s.short, pts: [sh, s.joint, s.end, step(s.end, aw, BODY.hand)], spec: A };
  }
  const frame = {
    view: p.view, base: p.base, pelvis: p.pelvis, spine: p.spine, curve: p.curve, twist: p.twist,
    shrug: p.shrug, protract: p.protract, neck: p.neck, face: p.face,
    hot: p.hot ?? [], props: p.props ?? [],
    limbs: Object.fromEntries(Object.entries(limbs).map(([k, v]) => {
      const tgt = v.spec.hand ?? v.spec.ankle;
      return [k, {
        a1: v.a1, a2: v.a2, aw: v.aw, af: v.af, target: v.target, short: v.short,
        thighK: v.spec.thighK ?? 1, footK: v.spec.footK ?? 1, layer: v.spec.layer ?? 'auto', bend: v.spec.bend ?? 0,
        elbowUp: Boolean(v.spec.elbowUp),
        anchored: Array.isArray(tgt) ? null : tgt.at,
      }];
    })),
  };
  solveCache.set(spec, frame);
  return frame;
}

// ── Forward kinematics → drawable skeleton ──────────────────────────────

export function forward(frame) {
  const g = torsoGeometry(frame);
  const out = { ...g };
  for (const k of ARM_KEYS) {
    const L = frame.limbs[k];
    const sh = k === 'armL' ? g.shL : g.shR;
    const el = step(sh, L.a1, BODY.upper);
    const wr = step(el, L.a2, BODY.fore);
    out[k] = [sh, el, wr, step(wr, L.aw, BODY.hand)];
  }
  for (const k of LEG_KEYS) {
    const L = frame.limbs[k];
    const hip = k === 'legL' ? g.hipL : g.hipR;
    const kn = step(hip, L.a1, BODY.thigh * L.thighK);
    const an = step(kn, L.a2, BODY.shin);
    out[k] = [hip, kn, an, step(an, L.af, BODY.foot * L.footK)];
  }
  return out;
}

// ── Interpolation ───────────────────────────────────────────────────────

/** Lower bound of the anatomical window for the upper bone, relative to the torso's down axis. */
function relWindow(view, k) {
  if (view === 'side') return -100; // swing through the front: [-100, 260)
  return k.endsWith('L') ? -260 : -100; // front view: each side swings out laterally
}

const fwdCache = new WeakMap();
const fwdOf = (frame) => {
  if (!fwdCache.has(frame)) fwdCache.set(frame, forward(frame));
  return fwdCache.get(frame);
};

/**
 * In-between frame. `plan[k]` picks how an arm travels when its contact
 * changes: 'angle' (joint angles swing through the anatomical range) or
 * 'reach' (the wrist moves in a straight line, IK solves the elbow).
 */
export function interpolate(A, B, t, plan = {}) {
  const out = {
    view: t < 0.5 ? A.view : B.view,
    base: A.base === B.base ? A.base : 'free',
    pelvis: lerpPt(A.pelvis, B.pelvis, t),
    hot: t < 0.5 ? A.hot : B.hot,
    props: t < 0.5 ? A.props : B.props,
    limbs: {},
  };
  for (const key of ['spine', 'curve', 'twist', 'shrug', 'protract', 'neck', 'face']) out[key] = lerp(A[key], B[key], t);
  const g = torsoGeometry(out);
  for (const k of [...LEG_KEYS, ...ARM_KEYS]) {
    const a = A.limbs[k];
    const b = B.limbs[k];
    const isArm = k.startsWith('arm');
    const planted = dist(a.target, b.target) < 0.5 && !a.short && !b.short;
    const lo = relWindow(A.view, k);
    const relA = wrap(a.a1 - (A.spine + 180), lo);
    const relB = wrap(b.a1 - (B.spine + 180), lo);
    let a1 = out.spine + 180 + lerp(relA, relB, t);
    let a2 = a1 + lerp(wrap(a.a2 - a.a1), wrap(b.a2 - b.a1), t);
    const reach = isArm && !planted && plan[k] === 'reach';
    if (planted || reach) {
      // Planted: keep the contact exact. Reach: wrist travels in a straight line.
      const root = isArm ? (k === 'armL' ? g.shL : g.shR) : k === 'legL' ? g.hipL : g.hipR;
      const thighK = lerp(a.thighK, b.thighK, t);
      const target = planted ? a.target : lerpPt(fwdOf(A)[k][2], fwdOf(B)[k][2], t);
      const sols = ikSolutions(root, target, isArm ? BODY.upper : BODY.thigh * thighK, isArm ? BODY.fore : BODY.shin);
      const up = isArm && (t < 0.5 ? a.elbowUp : b.elbowUp);
      const s = up ? (sols[0].joint[1] <= sols[1].joint[1] ? sols[0] : sols[1]) : a.bend ? sols[a.bend > 0 ? 0 : 1] : isArm ? pickArm(sols, g) : pickLeg(sols, g);
      a1 = s.a1;
      a2 = s.a2;
    }
    const tipA = wrap((isArm ? a.aw : a.af) - a.a2);
    const tipB = wrap((isArm ? b.aw : b.af) - b.a2);
    const tip = a2 + lerp(tipA, tipB, t);
    out.limbs[k] = {
      a1, a2,
      aw: isArm ? tip : undefined,
      af: isArm ? undefined : tip,
      thighK: lerp(a.thighK, b.thighK, t),
      footK: lerp(a.footK, b.footK, t),
      target: planted ? a.target : [NaN, NaN],
      short: 0,
      bend: a.bend,
      elbowUp: t < 0.5 ? a.elbowUp : b.elbowUp,
      layer: t < 0.5 ? a.layer : b.layer,
      anchored: t < 0.5 ? a.anchored : b.anchored,
    };
  }
  return out;
}

const ease = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);

/** Count arm problems (head collisions, folded / wrong-way elbows) in one frame. */
function armProblems(frame, k) {
  const s = fwdOf(frame);
  const [, el, wr, tip] = s[k];
  const L = frame.limbs[k];
  let n = 0;
  const onHead = /^head\.|^nape$/.test(L.anchored ?? '');
  if (L.layer !== 'back') {
    for (const p of onHead ? [el] : [el, wr, tip]) if (dist(p, s.headC) < BODY.headR * 0.75) n++;
    if (!onHead && distToSegment(s.headC, el, wr) < BODY.headR * 0.55) n++;
  }
  const flex = wrap(L.a2 - L.a1);
  if (frame.view === 'side' ? flex < -8 || flex > 165 : Math.abs(flex) > 165) n++;
  return n;
}

const planCache = new WeakMap();

/** Per arm, choose the in-between method with fewer problems for this transition. */
export function planTransition(A, B) {
  let byB = planCache.get(A);
  if (!byB) planCache.set(A, (byB = new WeakMap()));
  if (byB.has(B)) return byB.get(B);
  const plan = {};
  for (const k of ARM_KEYS) {
    const score = (method) => {
      let n = 0;
      for (let i = 1; i < 10; i++) n += armProblems(interpolate(A, B, i / 10, { [k]: method }), k);
      return n;
    };
    plan[k] = score('reach') < score('angle') ? 'reach' : 'angle';
  }
  byB.set(B, plan);
  return plan;
}

/** keys: [{ pose, hold, move }] → [{ frame, ms, key, t? }], looping back to key 0. */
export function sampleFrames(keys, fps) {
  const frameMs = Math.round(1000 / fps);
  const solved = keys.map((k) => solveKey(k.pose));
  const frames = [];
  keys.forEach((key, i) => {
    const A = solved[i];
    const B = solved[(i + 1) % keys.length];
    frames.push({ frame: A, ms: Math.max(frameMs, key.hold ?? 600), key: i });
    if (keys.length > 1) {
      const n = Math.max(2, Math.round((key.move ?? 900) / frameMs));
      const plan = planTransition(A, B);
      for (let f = 1; f < n; f++) frames.push({ frame: interpolate(A, B, ease(f / n), plan), ms: frameMs, key: i, t: f / n });
    }
  });
  return frames;
}

// ── Validation ──────────────────────────────────────────────────────────

function distToSegment(p, a, b) {
  const ab = sub(b, a);
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / (ab[0] ** 2 + ab[1] ** 2 || 1)));
  return dist(p, [a[0] + ab[0] * t, a[1] + ab[1] * t]);
}

/** Problems for one frame (empty = OK). `where` labels the frame in messages. */
export function validateFrame(frame, where) {
  const issues = [];
  const s = forward(frame);
  const bad = (msg) => issues.push(`${where}: ${msg}`);
  const pts = [s.headC, s.top, ...s.armL, ...s.armR, ...s.legL, ...s.legR];
  if (pts.some(([x, y]) => !Number.isFinite(x) || !Number.isFinite(y))) {
    bad('non-finite joint');
    return issues;
  }

  for (const k of [...ARM_KEYS, ...LEG_KEYS]) {
    if (frame.limbs[k].short > 2) bad(`${k} target out of reach by ${frame.limbs[k].short.toFixed(1)}px`);
  }

  if (frame.view === 'side') {
    for (const k of ARM_KEYS) {
      const L = frame.limbs[k];
      const flex = wrap(L.a2 - L.a1);
      if (flex < -8 || flex > 165) bad(`${k} elbow bends the wrong way (${flex.toFixed(0)}°)`);
      const rel = wrap(L.a1 - (frame.spine + 180), -100);
      if (rel < -80 || rel > 200) bad(`${k} shoulder out of range (${rel.toFixed(0)}°)`);
    }
    for (const k of LEG_KEYS) {
      const L = frame.limbs[k];
      const flex = wrap(L.a2 - L.a1);
      if (flex > 8 || flex < -165) bad(`${k} knee bends the wrong way (${flex.toFixed(0)}°)`);
      const rel = wrap(L.a1 - (frame.spine + 180), -100);
      if (rel < -50 || rel > 150) bad(`${k} hip out of range (${rel.toFixed(0)}°)`);
    }
  } else {
    for (const k of ARM_KEYS) {
      const L = frame.limbs[k];
      const flex = Math.abs(wrap(L.a2 - L.a1));
      if (flex > 165) bad(`${k} elbow folded through itself (${flex.toFixed(0)}°)`);
    }
  }
  const neckRel = wrap(frame.neck - s.topDir);
  if (Math.abs(neckRel) > 75) bad(`neck bent ${neckRel.toFixed(0)}° from the spine`);

  for (const k of [...LEG_KEYS, ...ARM_KEYS]) {
    if (s[k].some((p) => p[1] > GROUND + 1.5)) bad(`${k} goes below the floor`);
  }

  if (frame.base === 'seated' && Math.abs(s.pelvis[1] - (SEAT_Y - BODY.sitDepth)) > 1) bad('pelvis left the seat');

  // Hands / forearms must not pass through the head.
  for (const k of ARM_KEYS) {
    const [, el, wr, tip] = s[k];
    const onHead = /^head\.|^nape$/.test(frame.limbs[k].anchored ?? '');
    const behind = frame.limbs[k].layer === 'back';
    if (behind) continue;
    for (const p of onHead ? [el] : [el, wr, tip]) {
      if (dist(p, s.headC) < BODY.headR * 0.75) bad(`${k} passes through the head`);
    }
    if (!onHead && distToSegment(s.headC, el, wr) < BODY.headR * 0.55) bad(`${k} forearm crosses the face`);
  }
  return issues;
}

// ── Framing ─────────────────────────────────────────────────────────────

/** Square crop that keeps every frame of a move in view. */
export function fitBox(frames, { pad = 46, min = 300 } = {}) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const frame of frames) {
    const s = forward(frame);
    const pts = [s.top, s.pelvis, ...s.spine, ...s.armL, ...s.armR, ...s.legL, ...s.legR, [s.headC[0], s.headC[1] - BODY.headR]];
    for (const [x, y] of pts) {
      x0 = Math.min(x0, x); x1 = Math.max(x1, x);
      y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
  }
  y1 = Math.max(y1, GROUND);
  const side = Math.min(CANVAS, Math.max(min, x1 - x0 + pad * 2, y1 - y0 + pad * 2));
  const cx = (x0 + x1) / 2;
  let x = Math.round(cx - side / 2);
  let y = Math.round(y1 + pad * 0.6 - side);
  x = Math.max(0, Math.min(CANVAS - side, x));
  y = Math.max(0, Math.min(CANVAS - side, y));
  return [x, y, Math.round(side), Math.round(side)];
}
