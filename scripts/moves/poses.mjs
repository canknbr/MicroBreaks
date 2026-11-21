/**
 * Keyframed poses for every drawn desk move (engine: rig.mjs).
 *
 * Each move: { keys: [{ pose, hold, move }], still: key index for the list thumbnail }.
 * Poses place the body with `base` (seated on the chair / standing / free) and
 * attach hands and feet to anchors ({ at: 'knee.R' }, { at: 'desk.edge' }, …)
 * so contacts are exact. Elbows and knees bend anatomically on their own.
 * `node scripts/generate-move-library.mjs` validates every frame before shipping.
 */

import { ANKLE_Y as AY, CHAIR_SIDE_X, CHAIR_FRONT_X, DESK_X } from './rig.mjs';

const CHAIR_SIDE = { type: 'chairSide', x: CHAIR_SIDE_X };
const CHAIR_FRONT = { type: 'chairFront', x: CHAIR_FRONT_X };
const DESK = { type: 'desk', x: DESK_X };

const at = (name, dx = 0, dy = 0) => ({ at: name, dx, dy });

// ── Bases ───────────────────────────────────────────────────────────────

/** Seated, side view, facing right. */
const seatSide = {
  view: 'side', base: 'seated', spine: 179, neck: 178,
  legL: { ankle: [290, AY], toe: 92 }, legR: { ankle: [302, AY], toe: 92 },
  armL: { hand: at('thigh.L', 4) }, armR: { hand: at('thigh.R', 10) },
  props: [CHAIR_SIDE],
};
/** Seated, front view. */
const seatFront = {
  view: 'front', base: 'seated', spine: 180, neck: 180,
  legL: { ankle: [230, AY], toe: -100, thighK: 0.16, footK: 0.6 },
  legR: { ankle: [282, AY], toe: 100, thighK: 0.16, footK: 0.6 },
  armL: { hand: at('knee.L', -4, 2) }, armR: { hand: at('knee.R', 4, 2) },
  props: [CHAIR_FRONT],
};
/** Standing, side view, facing right. */
const standSide = {
  view: 'side', base: 'standing', x: 226, spine: 180, neck: 179,
  legL: { ankle: [222, AY], toe: 92 }, legR: { ankle: [232, AY], toe: 92 },
  armL: { hand: at('hang.L') }, armR: { hand: at('hang.R') },
  props: [],
};
/** Standing, front view. */
const standFront = {
  view: 'front', base: 'standing', x: 256, spine: 180, neck: 180,
  legL: { ankle: [238, AY], toe: -100, footK: 0.6 }, legR: { ankle: [274, AY], toe: 100, footK: 0.6 },
  armL: { hand: at('hang.L') }, armR: { hand: at('hang.R') },
  props: [],
};

const merge = (base, o) => {
  const out = { ...base, ...o };
  for (const k of ['armL', 'armR', 'legL', 'legR']) if (o[k]) out[k] = { ...base[k], ...o[k] };
  return out;
};
const SS = (o = {}) => merge(seatSide, o);
const SF = (o = {}) => merge(seatFront, o);
const TS = (o = {}) => merge(standSide, o);
const TF = (o = {}) => merge(standFront, o);
const key = (pose, hold = 700, move = 900) => ({ pose, hold, move });

// Hand placements reused across moves
const handsOnKnees = { armL: { hand: at('knee.L', -8, -10) }, armR: { hand: at('knee.R', -6, -10) } };
const gripSeat = { armL: { hand: at('seat.front', -34, 0) }, armR: { hand: at('seat.front', -26, 0) } };
const onDesk = { armL: { hand: at('desk.edge', 4) }, armR: { hand: at('desk.edge', 12) } };
const behindHead = { armL: { hand: at('head.L', 4, -4), layer: 'back' }, armR: { hand: at('head.R', -4, -4), layer: 'back' } };

export const MOVES = {
  // ── Neck & shoulders ─────────────────────────────────────────────────
  'neck-side-tilt': {
    still: 1,
    keys: [
      key(SF({}), 500),
      // Head tips to screen-left; the same-side hand rests over the crown on the far side.
      key(SF({ neck: 206, armL: { hand: at('head.R', -4, -2) }, hot: ['neck'] }), 1400),
      key(SF({}), 500),
      key(SF({ neck: 154, armR: { hand: at('head.L', 4, -2) }, hot: ['neck'] }), 1400),
    ],
  },
  'chin-to-chest': {
    still: 1,
    keys: [
      key(SS({ ...handsOnKnees }), 600),
      key(SS({ ...handsOnKnees, spine: 177, neck: 132, hot: ['neck'] }), 1600),
    ],
  },
  'chin-tuck': {
    still: 1,
    keys: [
      key(SS({ ...handsOnKnees, neck: 162 }), 600, 700),
      key(SS({ ...handsOnKnees, neck: 186, hot: ['neck'] }), 1200, 700),
    ],
  },
  'neck-rotation': {
    still: 1,
    keys: [
      key(SF({}), 500),
      key(SF({ face: -1, hot: ['neck'] }), 1300),
      key(SF({}), 500),
      key(SF({ face: 1, hot: ['neck'] }), 1300),
    ],
  },
  'shoulder-shrugs': {
    still: 1,
    keys: [
      key(SF({}), 400, 600),
      key(SF({ shrug: 1, hot: ['shoulders'] }), 900, 700),
    ],
  },
  'shoulder-rolls': {
    still: 2,
    keys: [
      key(SS({}), 0, 450),
      key(SS({ protract: 1, shrug: 0.3, hot: ['shoulders'] }), 0, 450),
      key(SS({ shrug: 1, hot: ['shoulders'] }), 0, 450),
      key(SS({ protract: -1, shrug: 0.3, hot: ['shoulders'] }), 0, 450),
    ],
  },
  'cross-body-shoulder': {
    still: 1,
    keys: [
      key(SF({}), 500),
      key(SF({ armR: { hand: at('shoulder.R', -104, 6) }, armL: { hand: at('elbow.R', 14, 8) }, hot: ['armR', 'shoulders'] }), 1400),
      key(SF({}), 500),
      key(SF({ armL: { hand: at('shoulder.L', 104, 6) }, armR: { hand: at('elbow.L', -14, 8) }, hot: ['armL', 'shoulders'] }), 1400),
    ],
  },

  // ── Back ─────────────────────────────────────────────────────────────
  'seated-cat-cow': {
    still: 1,
    keys: [
      key(SS({ ...handsOnKnees, spine: 170, curve: 0.8, neck: 146, hot: ['spine'] }), 900, 1100),
      key(SS({ ...handsOnKnees, spine: 184, curve: -0.6, neck: 198, hot: ['spine'] }), 900, 1100),
    ],
  },
  'seated-twist': {
    still: 1,
    keys: [
      key(SF({}), 500),
      key(SF({ twist: 0.9, face: -0.9, armL: { hand: at('chairBack.top', -60, 96) }, armR: { hand: at('knee.L', 4, -10) }, hot: ['spine'] }), 1400),
      key(SF({}), 500),
      key(SF({ twist: -0.9, face: 0.9, armR: { hand: at('chairBack.top', 60, 96) }, armL: { hand: at('knee.R', -4, -10) }, hot: ['spine'] }), 1400),
    ],
  },
  'seated-side-bend': {
    still: 2,
    keys: [
      key(SF({}), 400, 700),
      // Arm sweeps out to the side first, then up and over — never across the face.
      key(SF({ armR: { hand: at('shoulder.R', 108, -40) }, armL: { hand: at('seat.L', 14, 0) } }), 0, 700),
      key(SF({ spine: 194, curve: 0.55, neck: 202, armR: { hand: at('shoulder.R', -14, -116) }, armL: { hand: at('seat.L', 14, 0) }, hot: ['spine', 'armR'] }), 1300, 700),
      key(SF({ armR: { hand: at('shoulder.R', 108, -40) }, armL: { hand: at('seat.L', 14, 0) } }), 0, 700),
      key(SF({}), 400, 700),
      key(SF({ armL: { hand: at('shoulder.L', -108, -40) }, armR: { hand: at('seat.R', -14, 0) } }), 0, 700),
      key(SF({ spine: 166, curve: -0.55, neck: 158, armL: { hand: at('shoulder.L', 14, -116) }, armR: { hand: at('seat.R', -14, 0) }, hot: ['spine', 'armL'] }), 1300, 700),
      key(SF({ armL: { hand: at('shoulder.L', -108, -40) }, armR: { hand: at('seat.R', -14, 0) } }), 0, 700),
    ],
  },
  'seated-forward-fold': {
    still: 1,
    keys: [
      key(SS({ ...handsOnKnees }), 600, 1200),
      key(SS({ spine: 120, curve: 0.9, neck: 70, armL: { hand: at('ankle.L', 2, -34), wrist: 30 }, armR: { hand: at('ankle.R', 4, -32), wrist: 30 }, hot: ['spine'] }), 1800, 1200),
    ],
  },
  'upper-back-round': {
    still: 1,
    keys: [
      key(SS({ armL: { hand: [318, 270] }, armR: { hand: [324, 272] } }), 500),
      key(SS({ spine: 172, curve: 0.9, neck: 142, protract: 1, armL: { hand: [334, 282], wrist: 90 }, armR: { hand: [338, 284], wrist: 90 }, hot: ['spine', 'shoulders'] }), 1500),
    ],
  },
  'scapula-squeeze': {
    still: 1,
    keys: [
      key(SS({ armL: { hand: [318, 282], wrist: 90 }, armR: { hand: [324, 284], wrist: 90 } }), 500, 700),
      key(SS({ protract: -1, neck: 180, armL: { hand: at('chest', -8, 4), wrist: 90 }, armR: { hand: at('chest', -4, 6), wrist: 90 }, hot: ['shoulders'] }), 1100, 700),
    ],
  },
  'desk-dog': {
    still: 1,
    keys: [
      key(TS({ x: 250, spine: 140, neck: 140, legL: { ankle: [246, AY] }, legR: { ankle: [256, AY] }, ...onDesk, props: [DESK] }), 600, 1100),
      key(TS({ x: 160, spine: 96, curve: -0.12, neck: 98, legL: { ankle: [164, AY] }, legR: { ankle: [174, AY] }, ...onDesk, props: [DESK], hot: ['spine', 'shoulders'] }), 1800, 1100),
    ],
  },
  'standing-back-bend': {
    still: 1,
    keys: [
      key(TS({ armL: { hand: at('lowerBack', -2, 4), wrist: 0 }, armR: { hand: at('lowerBack', 2, 6), wrist: 0 } }), 600),
      key(TS({ spine: 194, curve: -0.6, neck: 202, armL: { hand: at('lowerBack', -2, 4), wrist: 0 }, armR: { hand: at('lowerBack', 2, 6), wrist: 0 }, hot: ['spine'] }), 1400),
    ],
  },

  // ── Chest ────────────────────────────────────────────────────────────
  'chest-opener': {
    still: 1,
    keys: [
      key(SF({}), 500),
      key(SF({ curve: -0.2, neck: 182, ...behindHead, hot: ['chest'] }), 1500),
    ],
  },
  'behind-back-clasp': {
    still: 1,
    keys: [
      key(SS({ seatShift: 26, legL: { ankle: [318, AY] }, legR: { ankle: [330, AY] }, armL: { hand: at('lowerBack', -14, 22) }, armR: { hand: at('lowerBack', -10, 24) } }), 500),
      key(SS({ seatShift: 26, legL: { ankle: [318, AY] }, legR: { ankle: [330, AY] }, spine: 184, curve: -0.35, neck: 192, protract: -1, armL: { hand: at('lowerBack', -40, 12) }, armR: { hand: at('lowerBack', -36, 14) }, hot: ['chest'] }), 1400),
    ],
  },
  'w-to-y-raise': {
    still: 1,
    keys: [
      key(SF({ armL: { hand: at('shoulder.L', -34, -44), wrist: 180 }, armR: { hand: at('shoulder.R', 34, -44), wrist: 180 } }), 400, 900),
      key(SF({ armL: { hand: at('shoulder.L', -46, -108) }, armR: { hand: at('shoulder.R', 46, -108) }, hot: ['chest', 'shoulders'] }), 700, 900),
    ],
  },
  'desk-push-up': {
    still: 1,
    keys: [
      key({ view: 'side', base: 'free', pelvis: [184, 306], spine: 128, neck: 128, legL: { ankle: [110, AY], toe: 104 }, legR: { ankle: [120, AY], toe: 104 }, ...onDesk, props: [DESK] }, 300, 900),
      key({ view: 'side', base: 'free', pelvis: [190, 318], spine: 118, neck: 118, legL: { ankle: [110, AY], toe: 104 }, legR: { ankle: [120, AY], toe: 104 }, ...onDesk, props: [DESK], hot: ['chest', 'armR'] }, 300, 900),
    ],
  },

  // ── Arms & wrists ────────────────────────────────────────────────────
  'wrist-flexor-stretch': {
    still: 1,
    keys: [
      key(SS({ armR: { hand: [320, 254], wrist: 90 } }), 500),
      // Palm out, fingers drawn back toward you by the other hand.
      key(SS({ armR: { hand: [320, 254], wrist: 172 }, armL: { hand: at('hand.R', 0, 2), wrist: 170 }, hot: ['wristR'] }), 1500),
    ],
  },
  'wrist-extensor-stretch': {
    still: 1,
    keys: [
      key(SS({ armR: { hand: [320, 254], wrist: 90 } }), 500),
      key(SS({ armR: { hand: [320, 254], wrist: 8 }, armL: { hand: at('hand.R', 2, -2), wrist: 20 }, hot: ['wristR'] }), 1500),
    ],
  },
  'wrist-circles': {
    still: 1,
    keys: [
      key(SS({ armR: { hand: [300, 280], wrist: 90 }, armL: { hand: [294, 282], wrist: 90 }, hot: ['wristR', 'wristL'] }), 0, 380),
      key(SS({ armR: { hand: [300, 280], wrist: 160 }, armL: { hand: [294, 282], wrist: 160 }, hot: ['wristR', 'wristL'] }), 0, 380),
      key(SS({ armR: { hand: [300, 280], wrist: 90 }, armL: { hand: [294, 282], wrist: 90 }, hot: ['wristR', 'wristL'] }), 0, 380),
      key(SS({ armR: { hand: [300, 280], wrist: 20 }, armL: { hand: [294, 282], wrist: 20 }, hot: ['wristR', 'wristL'] }), 0, 380),
    ],
  },
  'prayer-stretch': {
    still: 1,
    keys: [
      key(SF({ armL: { hand: at('sternum', -3, 6), wrist: 180 }, armR: { hand: at('sternum', 3, 6), wrist: 180 } }), 500, 1000),
      key(SF({ armL: { hand: at('belly', -3, 0), wrist: 180 }, armR: { hand: at('belly', 3, 0), wrist: 180 }, hot: ['wristL', 'wristR'] }), 1500, 1000),
    ],
  },
  'overhead-triceps': {
    still: 1,
    keys: [
      key(SF({}), 500),
      key(SF({ armR: { hand: at('nape', -8, 0), layer: 'back', elbowUp: true }, armL: { hand: at('elbow.R', -10, 6), layer: 'back', elbowUp: true }, hot: ['armR'] }), 1400),
      key(SF({}), 500),
      key(SF({ armL: { hand: at('nape', 8, 0), layer: 'back', elbowUp: true }, armR: { hand: at('elbow.L', 10, 6), layer: 'back', elbowUp: true }, hot: ['armL'] }), 1400),
    ],
  },

  // ── Core ─────────────────────────────────────────────────────────────
  'seated-knee-lift': {
    still: 1,
    keys: [
      key(SS({ ...gripSeat }), 300, 700),
      key(SS({ ...gripSeat, spine: 172, curve: 0.25, legR: { ankle: [298, 382], toe: 100 }, hot: ['spine', 'hips'] }), 600, 700),
      key(SS({ ...gripSeat }), 300, 700),
      key(SS({ ...gripSeat, spine: 172, curve: 0.25, legL: { ankle: [286, 382], toe: 100 }, hot: ['spine', 'hips'] }), 600, 700),
    ],
  },
  'seated-oblique-crunch': {
    still: 1,
    keys: [
      key(SF({ ...behindHead }), 300, 800),
      key(SF({ ...behindHead, spine: 196, curve: 0.5, neck: 200, legL: { ankle: [226, 404], thighK: 0.45 }, hot: ['spine'] }), 600, 800),
      key(SF({ ...behindHead }), 300, 800),
      key(SF({ ...behindHead, spine: 164, curve: -0.5, neck: 160, legR: { ankle: [286, 404], thighK: 0.45 }, hot: ['spine'] }), 600, 800),
    ],
  },
  'standing-side-reach': {
    still: 2,
    keys: [
      key(TF({}), 300, 600),
      key(TF({ armR: { hand: at('shoulder.R', 108, -40) } }), 0, 600),
      key(TF({ spine: 194, curve: 0.55, neck: 202, armR: { hand: at('shoulder.R', -14, -116) }, armL: { hand: at('hang.L', -6, -6) }, hot: ['spine', 'armR'] }), 1200, 600),
      key(TF({ armR: { hand: at('shoulder.R', 108, -40) } }), 0, 600),
      key(TF({}), 300, 600),
      key(TF({ armL: { hand: at('shoulder.L', -108, -40) } }), 0, 600),
      key(TF({ spine: 166, curve: -0.55, neck: 158, armL: { hand: at('shoulder.L', 14, -116) }, armR: { hand: at('hang.R', 6, -6) }, hot: ['spine', 'armL'] }), 1200, 600),
      key(TF({ armL: { hand: at('shoulder.L', -108, -40) } }), 0, 600),
    ],
  },

  // ── Legs ─────────────────────────────────────────────────────────────
  'chair-squat': {
    still: 1,
    keys: [
      key(SS({ spine: 158, neck: 164, armL: { hand: [304, 300] }, armR: { hand: [310, 302] } }), 300, 1100),
      key(TS({ x: 280, legL: { ankle: [290, AY] }, legR: { ankle: [302, AY] }, armL: { hand: [342, 284] }, armR: { hand: [348, 286] }, props: [CHAIR_SIDE], hot: ['legR', 'legL'] }), 500, 1100),
    ],
  },
  'calf-raise': {
    still: 1,
    keys: [
      key(TS({ x: 322, legL: { ankle: [318, AY] }, legR: { ankle: [328, AY] }, armL: { hand: at('desk.edge', 0) }, armR: { hand: at('desk.edge', 6) }, props: [DESK] }), 300, 700),
      key(TS({ x: 322, legL: { ankle: [318, AY - 18], toe: 52 }, legR: { ankle: [328, AY - 18], toe: 52 }, armL: { hand: at('desk.edge', -4, -16) }, armR: { hand: at('desk.edge', 2, -16) }, props: [DESK], hot: ['calves'] }), 700, 700),
    ],
  },
  'seated-figure-four': {
    still: 1,
    keys: [
      key(SF({}), 400, 1000),
      key(SF({ legR: { ankle: at('knee.L', 12, -10), toe: -160, thighK: 0.62, bend: -1 }, armR: { hand: at('knee.R', -6, -12) }, armL: { hand: at('ankle.R', 4, -8) }, hot: ['hips', 'legR'] }), 1500, 1000),
    ],
  },
  'seated-hamstring': {
    still: 1,
    keys: [
      key(SS({ seatShift: 24, legR: { ankle: [384, AY - 6], toe: 150 }, legL: { ankle: [314, AY] }, armL: { hand: at('thigh.L', 2) }, armR: { hand: at('thigh.R', 6) } }), 500, 1100),
      key(SS({ seatShift: 24, legR: { ankle: [384, AY - 6], toe: 150 }, legL: { ankle: [314, AY] }, spine: 146, curve: -0.05, neck: 142, armL: { hand: at('knee.R', 2, -10) }, armR: { hand: at('knee.R', 8, -10) }, hot: ['legR'] }), 1500, 1100),
    ],
  },
  'standing-quad': {
    still: 1,
    keys: [
      key(TS({ x: 312, legL: { ankle: [308, AY] }, legR: { ankle: [316, AY] }, armR: { hand: at('desk.edge', 4) }, props: [DESK] }), 400, 1000),
      key(TS({ x: 312, legL: { ankle: [308, AY] }, legR: { ankle: at('hip.R', -26, 18), toe: 170, footK: 0.8 }, armL: { hand: at('ankle.R', 0, 2) }, armR: { hand: at('desk.edge', 4) }, props: [DESK], hot: ['legR'] }), 1500, 1000),
    ],
  },
  'hip-flexor-stretch': {
    still: 1,
    keys: [
      key(TS({ x: 318, legL: { ankle: [312, AY] }, legR: { ankle: [324, AY] }, ...onDesk, props: [DESK] }), 400, 1000),
      key(TS({ x: 276, drop: 26, spine: 182, legL: { ankle: [198, AY], toe: 112, footK: 0.8 }, legR: { ankle: [342, AY] }, ...onDesk, props: [DESK], hot: ['hips', 'legL'] }), 1500, 1000),
    ],
  },
  'ankle-circles': {
    still: 1,
    keys: [
      key(SS({ ...gripSeat, legR: { ankle: [350, 402], toe: 140 }, hot: ['calves'] }), 0, 400),
      key(SS({ ...gripSeat, legR: { ankle: [350, 402], toe: 80 }, hot: ['calves'] }), 0, 400),
      key(SS({ ...gripSeat, legR: { ankle: [350, 402], toe: 30 }, hot: ['calves'] }), 0, 400),
      key(SS({ ...gripSeat, legR: { ankle: [350, 402], toe: 80 }, hot: ['calves'] }), 0, 400),
    ],
  },
  'seated-leg-extension': {
    still: 1,
    keys: [
      key(SS({ ...gripSeat }), 300, 800),
      key(SS({ ...gripSeat, legR: { ankle: [370, 366], toe: 172 }, hot: ['legR'] }), 900, 800),
    ],
  },
  'standing-leg-raise': {
    still: 1,
    keys: [
      key(TF({ armR: { hand: at('chairBack.top', -8, 2) }, props: [{ type: 'chairFront', x: 372 }] }), 300, 800),
      key(TF({ spine: 174, armR: { hand: at('chairBack.top', -8, 2) }, legL: { ankle: [172, 420], toe: -120, footK: 0.6 }, props: [{ type: 'chairFront', x: 372 }], hot: ['hips', 'legL'] }), 700, 800),
    ],
  },
  'single-leg-balance': {
    still: 1,
    keys: [
      key(TS({ x: 312, legL: { ankle: [308, AY] }, legR: { ankle: [316, AY] }, armR: { hand: at('desk.edge', 4) }, props: [DESK] }), 500, 900),
      key(TS({ x: 312, legL: { ankle: [308, AY] }, legR: { ankle: [352, 366], toe: 96 }, armR: { hand: at('desk.edge', 4) }, armL: { hand: at('hang.L', 6, -4) }, props: [DESK], hot: ['legL', 'hips'] }), 1800, 900),
    ],
  },

  // ── Low-impact energizers ────────────────────────────────────────────
  'march-in-place': {
    still: 0,
    keys: [
      key(TS({ legR: { ankle: [282, 372], toe: 100 }, armR: { hand: [196, 300] }, armL: { hand: [270, 290] } }), 0, 420),
      key(TS({}), 0, 420),
      key(TS({ legL: { ankle: [274, 372], toe: 100 }, armL: { hand: [196, 300] }, armR: { hand: [274, 290] } }), 0, 420),
      key(TS({}), 0, 420),
    ],
  },
  'seated-march': {
    still: 0,
    keys: [
      key(SS({ ...gripSeat, legR: { ankle: [312, 404] } }), 0, 420),
      key(SS({ ...gripSeat }), 0, 420),
      key(SS({ ...gripSeat, legL: { ankle: [298, 404] } }), 0, 420),
      key(SS({ ...gripSeat }), 0, 420),
    ],
  },
  'step-jacks': {
    still: 1,
    keys: [
      key(TF({}), 100, 500),
      key(TF({ legL: { ankle: [196, AY], toe: -100, footK: 0.6 }, armL: { hand: at('shoulder.L', -44, -110) }, armR: { hand: at('shoulder.R', 44, -110) }, hot: ['armL', 'armR'] }), 100, 500),
      key(TF({}), 100, 500),
      key(TF({ legR: { ankle: [316, AY], toe: 100, footK: 0.6 }, armL: { hand: at('shoulder.L', -44, -110) }, armR: { hand: at('shoulder.R', 44, -110) }, hot: ['armL', 'armR'] }), 100, 500),
    ],
  },
  'cross-body-reach': {
    still: 1,
    keys: [
      key(TF({}), 100, 550),
      key(TF({ twist: 0.6, face: -0.5, armR: { hand: at('shoulder.R', -80, -86) }, hot: ['spine', 'armR'] }), 200, 550),
      key(TF({}), 100, 550),
      key(TF({ twist: -0.6, face: 0.5, armL: { hand: at('shoulder.L', 80, -86) }, hot: ['spine', 'armL'] }), 200, 550),
    ],
  },
};
