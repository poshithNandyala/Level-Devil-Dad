// Little players for the new ways to move: swimming to points, climbing palms, kicking up walls.
import type { World } from '../src/game/world';
import type { Step } from './runner';

export type Move = 'L' | 'R' | '';
export type Out = { move: Move; jump: boolean };

export interface SwimPt {
  /** where Dad's middle should get to (px) */
  x: number;
  y: number;
  /** close enough (px) */
  tx?: number;
  ty?: number;
  /** sink or rise to the right depth before moving on sideways */
  yFirst?: boolean;
  /** hover there until this is true */
  wait?: (w: World) => boolean;
}

/** swim through the points in order: tap to rise, hold to hover, let go to sink */
export function swimPolicy(pts: SwimPt[]) {
  let i = 0,
    last = -99,
    world: World | null = null;
  return (w: World): Out => {
    if (world !== w) {
      world = w;
      i = 0;
      last = -99;
    }
    const p = w.player;
    let pt = pts[Math.min(i, pts.length - 1)];
    const near = (q: SwimPt) => Math.abs(q.x - p.cx) < (q.tx ?? 4) && Math.abs(q.y - p.cy) < (q.ty ?? 5);
    while (i < pts.length && near(pt) && (!pt.wait || pt.wait(w))) {
      i++;
      pt = pts[Math.min(i, pts.length - 1)];
    }
    const dx = pt.x - p.cx,
      dy = pt.y - p.cy;
    let jump: boolean;
    const band = (pt.ty ?? 5) - 1;
    if (dy < -Math.max(8, band + 3)) {
      // rise: a stroke every so often (the button has to come up between strokes)
      if (w.tick - last >= 14) {
        if (w.input.jump) jump = false;
        else {
          jump = true;
          last = w.tick;
        }
      } else jump = true;
    } else if (dy > band) jump = false;
    else jump = true;
    const yOk = !pt.yFirst || Math.abs(dy) < 8;
    const move: Move = yOk && Math.abs(dx) > 3 ? (dx > 0 ? 'R' : 'L') : '';
    return { move, jump };
  };
}

export const swim = (pts: SwimPt[], until: (w: World) => boolean, note = 'swim', max = 4000): Step => ({ policy: swimPolicy(pts), until, max, note });

// ------------------------------------------------------------------ palms
import type { Climbable } from '../src/game/player';
/** Dad hangs on this palm */
export const gripping = (c: () => Climbable | undefined) => (w: World) => !!w.player.grip && w.player.grip === c();
/** Dad hangs on any palm */
export const onPalm = (w: World) => !!w.player.grip;
/** standing on a palm's crown (or anything) after climbing */
export const standing = (w: World) => w.player.onGround && !w.player.grip;

// ------------------------------------------------------------------ running on the lagoon
/** run flat out, hopping weed beds and rocks just before them (a tap hop) */
export function skimmer(until: (w: World) => boolean, hold = 10) {
  let left = 0;
  return (w: World): Out => {
    const p = w.player;
    if (left > 0) {
      left--;
      return { move: 'R', jump: true };
    }
    if (until(w)) return { move: 'R', jump: false };
    if (!p.onGround) return { move: 'R', jump: false };
    const sk = w.entities.filter((e: any) => e.weed !== undefined && e.x0 !== undefined) as any[];
    let need = false;
    for (const s of sk) {
      for (const [a, b] of s.weed as [number, number][]) if (a - p.cx < 7 && a - p.cx > -2 && b > p.cx) need = true;
      // nearing the end of the water with a step up (a rock) or nothing: hop
    }
    // a rock or wall ahead
    if (w.solidAt(p.x + p.w + 6, p.y + 2, 4, p.h - 4)) need = true;
    if (need && !w.input.jump) {
      left = hold - 1;
      return { move: 'R', jump: true };
    }
    return { move: 'R', jump: false };
  };
}

// ------------------------------------------------------------------ chawl walls
/** can Dad kick off the wall on this side right now? */
export const canKick = (w: World, side: number) => {
  const p = w.player;
  const x = side > 0 ? p.x + p.w : p.x - 1;
  return !!w.solidAt(side > 0 ? p.x + 1 : p.x - 1, p.y + 2, p.w, p.h - 4) && w.kickAt(x, p.y + 2, p.h - 4);
};

/** kick up a gali between a left wall face xL and a right wall face xR (px), then step off on to the roof
 *  at roofY on the `exit` side. `ok(w, side)` can veto a kick (wet paint, spikes ahead) */
export function kicker(o: { xL: number; xR: number; roofY: number; exit: 'L' | 'R'; ok?: (w: World, side: number) => boolean; hold?: number }) {
  let next = 1,
    left = 0,
    world: World | null = null;
  return (w: World): Out => {
    if (world !== w) {
      world = w;
      next = 1;
      left = 0;
    }
    const p = w.player;
    const dir: Move = next > 0 ? 'R' : 'L';
    if (left > 0) {
      left--;
      return { move: dir, jump: true };
    }
    if (p.y + p.h <= o.roofY - 1) return { move: o.exit, jump: false };
    if (p.onGround) {
      if (w.input.jump) return { move: 'R', jump: false };
      next = 1;
      left = (o.hold ?? 11) + 2;
      return { move: 'R', jump: true };
    }
    // at the top of the exit wall: just hold on to it and step up on to the roof
    const exitSide = o.exit === 'R' ? 1 : -1;
    if (next === exitSide && p.y + p.h <= o.roofY + 7 && canKick(w, next)) return { move: o.exit, jump: false };
    if (canKick(w, next) && (!o.ok || o.ok(w, next)) && !w.input.jump) {
      next = -next;
      left = o.hold ?? 11;
      return { move: next > 0 ? 'R' : 'L', jump: true };
    }
    return { move: dir, jump: false };
  };
}
