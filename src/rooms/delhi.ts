// Delhi Metro machinery for the rooms: a moving walkway with opinions, fare gates and
// a card reader. Each one watches Dad's buttons.
import { Solid } from '../game/body';
import { DT, TILE } from '../game/constants';
import type { World } from '../game/world';
import { RoomProp } from './props';

/**
 * A moving walkway over tiles tx..tx+n-1 on row `ty` (its tiles are '%' in the map).
 * It carries Dad right at `speed`; while he presses right on it, it throws itself into
 * reverse (`back`). Standing still is the way across.
 */
export function walkway(w: World, tx: number, ty: number, n: number, o: { speed?: number; back?: number } = {}) {
  const p = w.add(new RoomProp('walkway', tx, ty, n, 1, -1));
  const speed = o.speed ?? 72;
  const back = o.back ?? -190;
  let v = speed;
  let pressing = 0;
  w.onTick((w2) => {
    const d = w2.player;
    const on = d.onGround && d.y + d.h === p.y && d.x + d.w > p.x && d.x < p.x + p.w;
    // it notices him walking on it (a moment's grace after he lands), and goes into
    // reverse for as long as he keeps pressing right
    pressing = on && w2.input.right ? pressing + 1 : 0;
    v = pressing > 36 ? back : speed;
    p.k += v * DT;
    p.on = v < 0;
    if (on) d.pushVx += v;
  });
  // the comb plate at its start: the teeth a walkway disappears into
  w.hazards.push({
    active: true,
    cause: 'comb',
    hits: (x, y, ww, h) => x < p.x + 5 && x + ww > p.x && y + h > p.y - 5 && y < p.y,
  });
  return p;
}

/** a fare gate standing at tx on the floor row `floorTy` (decor unless it's a closed barrier) */
export function fareGate(w: World, tx: number, floorTy: number, closed = false) {
  const g = w.add(new RoomProp('gate', tx, floorTy - 3, 1, 3, -1));
  g.k = closed ? 0 : 1;
  let solid: Solid | null = null;
  if (closed) {
    solid = new Solid(g.x + 2, g.y, TILE - 4, 3 * TILE);
    w.solids.push(solid);
  }
  return {
    prop: g,
    open(w2: World) {
      if (g.k >= 1) return;
      g.k = 1;
      g.tick = w2.tick;
      if (solid) solid.collidable = false;
      w2.sfx('beep');
    },
  };
}

/** a card reader on a post: bonk it from below (a jump) to tap your card */
export function cardReader(w: World, tx: number, ty: number, onTap: (w: World) => void) {
  const r = w.add(new RoomProp('reader', tx, ty, 1, 1, -1));
  w.when(
    (w2) => w2.events.some((e) => e.type === 'bonk' && e.x >= r.x - 8 && e.x <= r.x + r.w + 8 && Math.abs(e.y - (r.y + r.h)) < 6),
    (w2) => {
      r.tick = w2.tick;
      r.on = true;
      w2.sfx('beep');
      onTap(w2);
    },
  );
  return r;
}
