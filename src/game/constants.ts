// Core tuning. World units are pixels; one tile is 16px; one room is 32x18 tiles.
export const TILE = 16;
export const COLS = 32;
export const ROWS = 18;
export const ROOM_W = TILE * COLS; // 512
export const ROOM_H = TILE * ROWS; // 288

// Fixed simulation rate. Everything gameplay-related counts in ticks so a
// room behaves identically on every retry ("surprising on discovery,
// consistent on retry").
export const TPS = 120;
export const DT = 1 / TPS;
export const secs = (s: number) => Math.round(s * TPS);

export const PHYS = {
  width: 10,
  height: 14,
  maxRun: 140,
  accelGround: 1900,
  decelGround: 2600,
  turnGround: 3600,
  accelAir: 1500,
  decelAir: 900,
  turnAir: 2600,
  overSpeedReduce: 520,
  gravityUp: 1150,
  gravityDown: 1750,
  apexHangVy: 40,
  apexHangMul: 0.55,
  jumpVel: 375,
  jumpCut: 0.5,
  /** a jump always lasts at least this long before release can cut it: a quick tap still clears 2 tiles */
  minJump: 0.11,
  /** airborne step-up onto a ledge the feet only just missed (px) */
  ledgeAssist: 7,
  maxFall: 410,
  coyote: 0.09,
  jumpBuffer: 0.12,
  cornerCorrect: 4,
  // slippery (monsoon) ground
  wetAccel: 520,
  wetDecel: 260,
  // fresh tar: a slow shuffle
  stickyRun: 42,
};

/** a physics profile: the old long stages use PHYS; the new rooms use ROOM_PHYS */
export type Phys = typeof PHYS & {
  /** every jump is the same height: no cut on release, and the rise ignores the button */
  fixedJump?: boolean;
};

/**
 * Rooms: one screen, short and sharp. A fixed-height jump (one tap is always the same
 * jump, so every trap can be measured to the pixel), quick starts and stops, and the
 * forgiveness numbers from research (83 ms coyote, 117 ms buffer).
 * Rise 40.7 px (2.5 tiles: a 2-tile wall clears, 3 never does); airtime 0.55 s;
 * range at a run 66 px (a 3-tile gap has 230 ms of slack, a 4-tile gap is only for experts).
 */
export const ROOM_PHYS: Phys = {
  ...PHYS,
  maxRun: 120,
  accelGround: 2400,
  decelGround: 3200,
  turnGround: 4800,
  accelAir: 2000,
  decelAir: 1400,
  turnAir: 3200,
  gravityUp: 1050,
  gravityDown: 1600,
  apexHangVy: 40,
  apexHangMul: 0.55,
  jumpVel: 290,
  ledgeAssist: 4,
  maxFall: 420,
  coyote: 0.083,
  jumpBuffer: 0.117,
  cornerCorrect: 4,
  fixedJump: true,
};

export type CityId = 'TVM' | 'KVT' | 'CHN' | 'PDY' | 'BLR' | 'AMR' | 'HYD' | 'PNJ' | 'BOM' | 'DMN' | 'GNR' | 'JAI' | 'BPL' | 'RPR' | 'RNC';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const rect = (x: number, y: number, w: number, h: number): Rect => ({ x, y, w, h });

export function overlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function overlapXYWH(ax: number, ay: number, aw: number, ah: number, b: Rect): boolean {
  return ax < b.x + b.w && ax + aw > b.x && ay < b.y + b.h && ay + ah > b.y;
}

export const approach = (v: number, target: number, step: number) =>
  v < target ? Math.min(v + step, target) : Math.max(v - step, target);

export const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const ease = {
  linear: (t: number) => t,
  inOut: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  out: (t: number) => 1 - (1 - t) * (1 - t),
  in: (t: number) => t * t,
  back: (t: number) => {
    const c1 = 1.70158,
      c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};
export type EaseName = keyof typeof ease;
