/**
 * Illustrated renderer for the desk-move rig — outlined line-art figure
 * (clothed office worker) on transparent background, for the light theme.
 *
 * Draws a solved engine frame (rig.mjs forward()) with volume: tapered limbs,
 * a shaped torso, hands, shoes, hair, and office furniture. Each body layer is
 * drawn twice — an ink "outline" pass (shape + thick stroke) and a fill pass on
 * top — so overlapping shapes inside a layer merge into one clean silhouette.
 *
 * Art is original to this project.
 */

import { forward, step, GROUND, CANVAS } from './rig.mjs';

export const PALETTE = {
  ink: '#1F2428',
  shirt: '#DDE7E1', // light sage
  shirtShade: '#C9D8CF',
  trousers: '#2F3B45',
  trousersFar: '#46525C',
  skin: '#F0D7C3',
  skinFar: '#E3C6B0',
  hair: '#2A211D',
  shoe: '#1F2428',
  wood: '#E9DFCF',
  chair: '#2F5D50', // sage primary
  chairSoft: '#3F7263',
  metal: '#8C918F',
  hot: '#FF2472',
};

const OUTLINE = 3.2;
const rad = (d) => (d * Math.PI) / 180;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const len = (a) => Math.hypot(a[0], a[1]);
const angleOf = (v) => (Math.atan2(v[0], v[1]) * 180) / Math.PI;
const f = (n) => (Math.round(n * 10) / 10).toString();

/** Smooth closed path through points (Catmull-Rom → cubic Bézier). */
function smoothClosed(points, tension = 0.5) {
  const n = points.length;
  let d = `M${f(points[0][0])},${f(points[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const c1 = [p1[0] + ((p2[0] - p0[0]) * tension) / 3, p1[1] + ((p2[1] - p0[1]) * tension) / 3];
    const c2 = [p2[0] - ((p3[0] - p1[0]) * tension) / 3, p2[1] - ((p3[1] - p1[1]) * tension) / 3];
    d += ` C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return `${d} Z`;
}

/** Tapered capsule from a to b with widths wa / wb (round ends). */
function capsule(a, b, wa, wb) {
  const dir = angleOf(sub(b, a));
  const pts = [];
  const N = 6;
  // end b half-circle
  for (let i = 0; i <= N; i++) pts.push(step(b, dir + 90 - (180 * i) / N, wb / 2));
  // end a half-circle
  for (let i = 0; i <= N; i++) pts.push(step(a, dir - 90 - (180 * i) / N, wa / 2));
  return `M${pts.map(([x, y]) => `${f(x)},${f(y)}`).join(' L')} Z`;
}

/** A layer: list of { d, fill } shapes drawn as one merged outlined silhouette. */
function layer(shapes) {
  const outline = shapes.map((s) => `<path d="${s.d}" fill="${PALETTE.ink}" stroke="${PALETTE.ink}" stroke-width="${OUTLINE * 2}" stroke-linejoin="round"/>`).join('');
  const fill = shapes.map((s) => `<path d="${s.d}" fill="${s.fill}"/>`).join('');
  return outline + fill;
}

const W = {
  upper: [21, 17], fore: [16, 12.5], thigh: [31, 22], shin: [21, 15],
};

function armShapes(arm, shirt, skin) {
  const [sh, el, wr, hand] = arm;
  const handTip = step(wr, angleOf(sub(hand, wr)), 15);
  return [
    { d: capsule(sh, el, W.upper[0], W.upper[1]), fill: shirt },
    { d: capsule(el, wr, W.fore[0], W.fore[1]), fill: shirt },
    { d: capsule(wr, handTip, 13, 10), fill: skin },
  ];
}

function legShapes(leg, trousers) {
  const [hip, kn, an, toe] = leg;
  const footDir = angleOf(sub(toe, an));
  const heel = step(an, footDir + 180, 6);
  const tip = step(an, footDir, len(sub(toe, an)) + 4);
  return [
    { d: capsule(hip, kn, W.thigh[0], W.thigh[1]), fill: trousers },
    { d: capsule(kn, an, W.shin[0], W.shin[1]), fill: trousers },
    { d: capsule(heel, tip, 15, 12), fill: PALETTE.shoe },
  ];
}

/** Trouser seat/waistband around the pelvis — merges with the legs layer. */
function hipsShape(s) {
  if (s.front) {
    // Waistband + lap: a wide, flat pill across the hips.
    const across = angleOf(sub(s.hipR, s.hipL));
    const c = step(s.pelvis, angleOf(sub(s.spine[0], s.spine[3])), 4);
    return { d: capsule(step(c, across, -20), step(c, across, 20), 30, 30), fill: PALETTE.trousers };
  }
  const a = s.spine[2];
  const b = step(s.pelvis, angleOf(sub(s.spine[0], s.spine[2])), 4);
  return { d: capsule(a, b, 35, 37), fill: PALETTE.trousers };
}

function torsoShape(s, pose) {
  const sp = s.spine;
  const n = sp.length - 1;
  const left = [];
  const right = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const dir = angleOf(sub(sp[Math.min(i + 1, n)], sp[Math.max(i - 1, 0)]));
    let half;
    if (s.front) {
      const shoulders = len(sub(s.shR, s.shL)) / 2 + 3;
      half = 29 + (shoulders - 29) * Math.pow(t, 1.8) - 4 * Math.sin(Math.PI * t * 0.9);
      if (t > 0.8) half *= 1 - (t - 0.8) * 1.1; // rounded shoulder line
    } else {
      // side profile: hips → waist → chest → shoulders
      half = 19 + 4 * Math.sin(Math.PI * Math.min(1, t * 1.15)) - (t > 0.9 ? (t - 0.9) * 40 : 0);
    }
    const lean = s.front ? 0 : (t > 0.45 && t < 0.95 ? 3 : 0); // chest slightly forward in profile
    left.push(step(sp[i], dir - 90, -(half - lean)));
    right.push(step(sp[i], dir - 90, half + lean));
  }
  const pts = [...left, ...right.reverse()];
  return { d: smoothClosed(pts, 0.6), fill: PALETTE.shirt };
}

function headShapes(s, pose) {
  const c = s.headC;
  const r = 22;
  const dir = pose.neck; // head "up" direction
  const neckA = s.top;
  const neckB = step(s.neckEnd, dir, 4);
  const shapes = [{ d: capsule(neckA, neckB, 15, 13), fill: PALETTE.skin }];
  // skull: slightly egg-shaped
  const skull = [];
  for (let i = 0; i < 16; i++) {
    const a = (360 * i) / 16;
    const rr = r * (1 + 0.08 * Math.cos(rad(a))); // longer along the head axis
    skull.push(step(c, dir + a, rr));
  }
  shapes.push({ d: smoothClosed(skull, 0.9), fill: PALETTE.skin });
  if (!s.front) {
    // nose bump on the facing side (side view faces +x relative to head axis)
    const nose = step(step(c, dir - 90, r - 1), dir + 180, 1);
    shapes.push({ d: capsule(step(nose, dir, 3), step(nose, dir - 90, 5), 7, 5), fill: PALETTE.skin });
  } else {
    // ears: slide opposite to where the face turns, so a head turn reads clearly
    const face = Math.max(-1, Math.min(1, pose.face ?? 0));
    for (const side of [-1, 1]) {
      const visible = 1 - Math.max(0, side * face) * 0.85; // ear on the turned-to side tucks away
      const ear = step(step(c, dir - 90, side * (r - 1) - face * 7), dir + 180, 2);
      const w = 9 * visible;
      if (w > 2) shapes.push({ d: capsule(step(ear, dir, 5), step(ear, dir + 180, 4), w, w * 0.8), fill: PALETTE.skin });
    }
  }
  return shapes;
}

/** Front view: a short nose line that follows the head turn. */
function faceMarks(s, pose) {
  if (!s.front) return '';
  const face = Math.max(-1, Math.min(1, pose.face ?? 0));
  const c = s.headC;
  const dir = pose.neck;
  const base = step(step(c, dir - 90, face * 13), dir + 180, 6);
  const tip = step(base, dir - 90, face * 4);
  const top = step(base, dir, 7);
  return `<polyline points="${f(top[0])},${f(top[1])} ${f(base[0])},${f(base[1])} ${f(tip[0])},${f(tip[1])}" fill="none" stroke="${PALETTE.ink}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.75"/>`;
}

function hairShape(s, pose) {
  const c = s.headC;
  const r = 23.5;
  const dir = pose.neck;
  const pts = [];
  if (s.front) {
    const face = Math.max(-1, Math.min(1, pose.face ?? 0));
    for (let i = 0; i <= 12; i++) pts.push(step(c, dir - 100 + (200 * i) / 12, r + 1));
    pts.push(step(c, dir + 75 + face * 12, r * 0.45));
    pts.push(step(c, dir + face * 20, r * 0.62));
    pts.push(step(c, dir - 70 + face * 12, r * 0.5));
  } else {
    // covers top and back of the head (back = +90 from facing side)
    for (let i = 0; i <= 12; i++) pts.push(step(c, dir - 40 + (190 * i) / 12, r + 1));
    pts.push(step(c, dir + 120, r * 0.55));
    pts.push(step(c, dir + 40, r * 0.5));
    pts.push(step(c, dir - 25, r * 0.7));
  }
  return { d: smoothClosed(pts, 0.7), fill: PALETTE.hair };
}

// ── Furniture ────────────────────────────────────────────────────────────

function roundRect(x, y, w, h, r) {
  return `M${f(x + r)},${f(y)} H${f(x + w - r)} Q${f(x + w)},${f(y)} ${f(x + w)},${f(y + r)} V${f(y + h - r)} Q${f(x + w)},${f(y + h)} ${f(x + w - r)},${f(y + h)} H${f(x + r)} Q${f(x)},${f(y + h)} ${f(x)},${f(y + h - r)} V${f(y + r)} Q${f(x)},${f(y)} ${f(x + r)},${f(y)} Z`;
}

function chairSide({ x = 224, y = 364, back = -1 } = {}) {
  const seatW = 96;
  const sx = x - seatW / 2;
  const bx = x + back * 50;
  const shapes = [
    { d: roundRect(x - 4, y + 12, 8, GROUND - y - 30, 3), fill: PALETTE.metal },
    { d: roundRect(x - 52, GROUND - 22, 104, 7, 3.5), fill: PALETTE.metal },
    { d: capsule([bx, y - 6], [bx + back * 10, y - 130], 18, 22), fill: PALETTE.chair },
    { d: roundRect(sx, y - 2, seatW, 16, 8), fill: PALETTE.chair },
  ];
  const wheels = [x - 46, x + 46].map((wx) => ({ d: capsule([wx, GROUND - 6], [wx + 0.1, GROUND - 6], 12, 12), fill: PALETTE.ink }));
  return layer([...shapes, ...wheels]);
}

function chairFront({ x = 256, y = 364 } = {}) {
  return layer([
    { d: roundRect(x - 4, y + 12, 8, GROUND - y - 30, 3), fill: PALETTE.metal },
    { d: roundRect(x - 60, GROUND - 22, 120, 7, 3.5), fill: PALETTE.metal },
    { d: roundRect(x - 54, y - 150, 108, 132, 26), fill: PALETTE.chair },
    { d: roundRect(x - 62, y - 2, 124, 16, 8), fill: PALETTE.chairSoft },
    ...[x - 54, x, x + 54].map((wx) => ({ d: capsule([wx, GROUND - 6], [wx + 0.1, GROUND - 6], 12, 12), fill: PALETTE.ink })),
  ]);
}

function desk({ x = 352, y = 300, w = 160 } = {}) {
  return layer([
    { d: roundRect(x + 10, y + 10, 10, GROUND - y - 10, 3), fill: PALETTE.wood },
    { d: roundRect(x + w - 24, y + 10, 10, GROUND - y - 10, 3), fill: PALETTE.wood },
    { d: roundRect(x, y - 2, w, 14, 4), fill: PALETTE.wood },
  ]);
}

function deskFront({ x = 256, y = 300, w = 300 } = {}) {
  return layer([
    { d: roundRect(x - w / 2 + 12, y + 10, 10, GROUND - y - 10, 3), fill: PALETTE.wood },
    { d: roundRect(x + w / 2 - 22, y + 10, 10, GROUND - y - 10, 3), fill: PALETTE.wood },
    { d: roundRect(x - w / 2, y - 2, w, 14, 4), fill: PALETTE.wood },
  ]);
}

function wall({ x = 430 } = {}) {
  return layer([{ d: roundRect(x - 5, 60, 10, GROUND - 60, 3), fill: PALETTE.wood }]);
}

const PROPS = { chairSide, chairFront, desk, deskFront, wall };
const FOREGROUND = new Set(['deskFront']);

// ── Render ───────────────────────────────────────────────────────────────

export function renderIllustrated(pose, { background, box, glowId = 'glow' } = {}) {
  const s = forward(pose);
  const hot = new Set(pose.hot ?? []);
  const out = [];
  if (background) out.push(`<rect x="-${CANVAS}" y="-${CANVAS}" width="${CANVAS * 3}" height="${CANVAS * 3}" fill="${background}"/>`);

  // floor shadow
  out.push(`<ellipse cx="${f(s.pelvis[0] + 20)}" cy="${GROUND + 2}" rx="150" ry="9" fill="${PALETTE.ink}" opacity="0.07"/>`);
  for (const pr of pose.props ?? []) if (!FOREGROUND.has(pr.type)) out.push(PROPS[pr.type](pr));

  // Target-zone halo (soft accent), behind the body
  const glow = [];
  const blob = (p, r) => `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${r}" fill="${PALETTE.hot}"/>`;
  if (hot.has('neck')) glow.push(blob(s.neckEnd, 30));
  if (hot.has('spine')) s.spine.filter((_, i) => i % 3 === 0).forEach((p) => glow.push(blob(p, 34)));
  if (hot.has('shoulders')) glow.push(blob(s.spine[10], 36));
  if (hot.has('chest')) glow.push(blob(s.spine[9], 38));
  for (const k of ['armL', 'armR']) if (hot.has(k)) s[k].slice(0, 3).forEach((p) => glow.push(blob(p, 22)));
  for (const [k, a] of [['wristL', 'armL'], ['wristR', 'armR']]) if (hot.has(k)) glow.push(blob(s[a][2], 24));
  for (const k of ['legL', 'legR']) if (hot.has(k)) s[k].slice(0, 3).forEach((p) => glow.push(blob(p, 26)));
  if (hot.has('hips')) glow.push(blob(s.pelvis, 38));
  if (hot.has('calves')) for (const k of ['legL', 'legR']) s[k].slice(1, 3).forEach((p) => glow.push(blob(p, 22)));
  if (glow.length) out.push(`<g opacity="0.22" filter="url(#${glowId})">${glow.join('')}</g>`);

  const front = s.front;
  const behind = (k) => pose.limbs?.[k]?.layer === 'back';
  const body = () => {
    out.push(layer([...headShapes(s, pose), torsoShape(s, pose)]));
    out.push(layer([hairShape(s, pose)]));
    out.push(faceMarks(s, pose));
  };
  const arm = (k, far = false) =>
    out.push(layer(armShapes(s[k], far ? PALETTE.shirtShade : PALETTE.shirt, far ? PALETTE.skinFar : PALETTE.skin)));
  // Arms flagged layer:'back' (e.g. a hand behind the head) go behind the body.
  for (const k of ['armL', 'armR']) if (behind(k)) arm(k, !front || k === 'armL');
  if (front) {
    // Front view: torso first, legs come toward the viewer over the hem.
    body();
    out.push(layer([hipsShape(s), ...legShapes(s.legL, PALETTE.trousers), ...legShapes(s.legR, PALETTE.trousers)]));
    if (!behind('armL')) arm('armL');
  } else {
    // Side view: far limbs (shaded) behind the body.
    out.push(layer(legShapes(s.legL, PALETTE.trousersFar)));
    if (!behind('armL')) arm('armL', true);
    body();
    out.push(layer([hipsShape(s), ...legShapes(s.legR, PALETTE.trousers)]));
  }
  if (!behind('armR')) arm('armR');

  for (const pr of pose.props ?? []) if (FOREGROUND.has(pr.type)) out.push(PROPS[pr.type](pr));

  const defs = `<defs><filter id="${glowId}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter></defs>`;
  const vb = box ?? [0, 0, CANVAS, CANVAS];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" width="${CANVAS}" height="${CANVAS}">${defs}${out.join('')}</svg>`;
}
