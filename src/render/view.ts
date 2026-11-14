import { ROOM_H, ROOM_W } from '../game/constants';

export interface Safe {
  l: number;
  r: number;
  t: number;
  b: number;
}

export interface View {
  W: number; // CSS px
  H: number;
  dpr: number;
  s: number; // world px -> CSS px
  ox: number; // room offset in CSS px
  oy: number;
  safe: Safe;
}

/**
 * Scale so the 18 rows fill the height (and at least one 32-column screen fits the safe width).
 * ox is the left edge of the safe area: the camera decides which part of the level sits there,
 * and the scenery runs edge to edge (no bars).
 */
export function computeView(W: number, H: number, dpr: number, safe: Safe): View {
  const wSafe = Math.max(100, W - safe.l - safe.r);
  const s = Math.min(wSafe / ROOM_W, H / ROOM_H);
  const ox = safe.l;
  const oy = (H - ROOM_H * s) / 2;
  return { W, H, dpr, s, ox, oy, safe };
}

export function readSafeArea(): Safe {
  const probe = document.getElementById('safe-probe');
  if (!probe) return { l: 0, r: 0, t: 0, b: 0 };
  const cs = getComputedStyle(probe);
  const n = (v: string) => parseFloat(v) || 0;
  return { l: n(cs.paddingLeft), r: n(cs.paddingRight), t: n(cs.paddingTop), b: n(cs.paddingBottom) };
}
