// ITA-09 Ita: the brick walls of the fort. A wall is a column of bricks across the road. Lean on it and the bottom
// brick comes out: a hole you can walk through, if the brick above is set in fresh pale mortar (a bonded course holds
// like a lintel). Under dry dark mortar nothing holds: the courses above slump down into the hole, on to whoever is in
// it. The top course of every wall carries the fort's iron spikes, and they come down with it: a slumped wall is a
// spiked stub, hop it. Read the mortar before you pull.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, brick } from './entities';
import { FL, since, taraScript } from './common';
import { lines as L } from './lines';

export const LEAN = 0.45;
const SLUMP = 0.3;
/** seconds the pulled brick stays in the hole (solid, not deadly) once the courses above have started down */
const CRUMBLE = 0.2;

export interface Wall {
  c: number;
  /** courses from the ground up: true = fresh pale mortar (bonded) */
  bonded: boolean[];
  /** bricks left, bottom first (each a Rig) */
  bricks: Rig[];
  /** the hole at the bottom is open (walk through) */
  hole: boolean;
  slumpT: number;
  lean: number;
  pulls: number;
  /** the pulled brick, still in the hole for a moment */
  crumbling: Rig | null;
}

/** a wall of bricks one tile thick at column c; `key` holds the state for the tests */
export function wall(w: World, c: number, bonded: boolean[], key: string): Wall {
  const st: Wall = { c, bonded, bricks: [], hole: false, slumpT: -1, lean: 0, pulls: 0, crumbling: null };
  w.flags[key] = st;
  const n = bonded.length;
  for (let i = 0; i < n; i++) {
    const r = w.add(
      new Rig(px(c), FL - 16 * (i + 1), 16, 16, {
        solid: true,
        layer: 2,
        cause: 'ita-malba',
        // a brick coming down inside the wall's column cannot hit a man standing flush against its face (a 1 px touch under lag)
        inset: 2,
        live: (q) => q.s.falling === true,
        paint: (ctx, q, w2) => {
          const out = q.s.crumbleT !== undefined ? 6 + since(w2, q.s.crumbleT) * 20 : (q.s.out ?? 0);
          brick(ctx, q.x - out, q.y, 16, 16, q.s.bonded === true, q.s.crumbleT !== undefined ? -0.15 : 0);
          if (q.s.bonded) {
            ctx.fillStyle = '#EDE4CC';
            ctx.fillRect(q.x - out, q.y - 2, 16, 3);
          }
          if (q.s.top) {
            // the fort's iron spikes on the top course
            for (let k = 0; k < 3; k++) box(ctx, q.x + 2 + k * 5, q.y - 8, 2, 8, '#5A5A62');
            if ((q.s.spikeLive as boolean) && (w2.tick >> 3) % 2 === 0) for (let k = 0; k < 3; k++) box(ctx, q.x + 1 + k * 5, q.y - 12, 4, 2, '#E8E0D0');
          }
        },
      }),
    );
    r.s.bonded = bonded[i];
    r.s.top = i === n - 1;
    st.bricks.push(r);
  }
  // the spikes on the top brick: deadly to stand on or hit, wherever that brick is
  w.add(
    new Rig(px(c), 0, 16, 8, {
      layer: 3,
      cause: 'ita-kaanta',
      inset: 1,
      live: () => st.bricks.length > 0,
      tick: (q) => {
        const top = st.bricks[st.bricks.length - 1];
        if (top) q.y = top.y - 8;
      },
      paint: () => {},
    }),
  );
  // the lean: Dad pressing on the bottom brick for a moment pulls it out
  w.add(
    new Rig(0, 0, 0, 0, {
      layer: 1,
      paint: () => {},
      tick: (_q, w2) => {
        const bottom = st.bricks[0];
        if (!bottom) return;
        // the pulled brick crumbles away a moment after the slump has begun
        if (st.crumbling && since(w2, st.crumbling.s.crumbleT) >= CRUMBLE) {
          st.crumbling.setSolid(false);
          st.crumbling.on = false;
          st.crumbling.alive = false;
          st.crumbling = null;
        }
        // slumping: the courses above fall into the hole
        if (st.slumpT >= 0) {
          const k = Math.min(1, since(w2, st.slumpT) / SLUMP);
          st.bricks.forEach((b, i) => {
            const target = FL - 16 * (i + 1);
            const from = target - 16;
            b.setSolid(false);
            b.moveTo(w2, b.x, Math.round(from + (target - from) * k));
            b.s.falling = k < 1;
          });
          if (k >= 1) {
            st.slumpT = -1;
            st.bricks.forEach((b) => {
              b.s.falling = false;
              b.setSolid(true);
            });
          }
          return;
        }
        if (st.hole) return;
        const p = w2.player;
        const leaning = p.onGround && w2.input.right && Math.abs(p.x + p.w - bottom.x) <= 1 && p.y + p.h > bottom.y + 4;
        st.lean = leaning ? st.lean + 1 / 120 : 0;
        bottom.s.out = Math.min(6, st.lean * 14);
        if (st.lean >= LEAN) {
          st.lean = 0;
          st.pulls++;
          w2.sfx('crack', bottom.x, FL);
          st.bricks.shift();
          if (st.bricks.length === 0 || st.bricks[0].s.bonded) {
            // the bottom brick comes out and crumbles; under fresh mortar the course above holds: a doorway
            bottom.setSolid(false);
            bottom.on = false;
            bottom.alive = false;
            if (st.bricks.length) {
              st.hole = true;
              w2.sfx('thud', bottom.x, FL);
            }
            return;
          }
          // dry mortar above: the courses come down behind the pulled brick, which is still in the hole for a moment
          // (it blocks the puller for CRUMBLE s, so a hand that is slow to let go is not a death; a walk in still is)
          st.slumpT = w2.tick;
          bottom.s.crumbleT = w2.tick;
          st.crumbling = bottom;
          w2.sfx('rumble', bottom.x, FL - 20);
        }
      },
    }),
  );
  return st;
}

/** the hole's lintel is the bonded course: a walk-through at ground level needs the bricks above to stay up, which they do */
function fortArt(w: World, c0: number, c1: number) {
  w.add(
    new Paint((ctx) => {
      for (let x = px(c0); x < px(c1); x += 40) {
        box(ctx, x, 60, 30, 60, '#6A3A28');
        for (let y = 64; y < 118; y += 6) box(ctx, x + ((y / 6) % 2) * 4, y, 24, 1, '#4A2A1C');
      }
    }, -4),
  );
}

export function room(): LevelDef {
  return {
    id: 'ITA-09',
    city: 'ITA',
    index: 9,
    name: 'Ita',
    nameEn: 'Brick',
    tagline: 'The fort is brick on brick. Some of the mortar is fresh.',
    hint: 'Each wall is a column of bricks. Lean on it and the bottom brick comes out. If the brick above it is set in fresh pale mortar the course holds and the hole is a doorway: walk through. Under dry dark mortar the wall slumps into the hole, on to whoever is in it. The top course carries the fort’s spikes, so a slumped wall is a spiked stub you cannot stand on: pull it down to one brick, step back each time, and hop over it. Read the mortar first.',
    par: 40,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      fortArt(w, 0, 32);
      wall(w, 8, [false, true, false], 'ita9a');
      wall(w, 15, [false, false, false], 'ita9b');
      wall(w, 23, [false, true, true], 'ita9c');
      onPass(w, px(3), (w2) => tara(w2, L.intro[7], 2.4));
      sign(w, 2, 10.4, 3.4, 'ITA FORT', 'shop', null, 'ita = brick');
      rival(w, 28, 15, -1, taraScript(9));
      collectible(w, 'ita-momo', 19, 11.4);
    },
  };
}

/** act: the rampart. Taller walls, bonded courses higher up (two pulls before the hole), and one wall with no bond at all. */
export const act: Act = {
  id: 'ita09-deewar',
  w: 40,
  advice: 'The rampart: taller walls, and the fresh mortar sits higher: some holes take two pulls before the bonded course is the lintel, and the slump that comes in between is the trap. Pull, step back, read again. The wall with no fresh mortar at all comes down to a spiked stub: hop it.',
  cps: [36],
  build: (w, c) => {
    fortArt(w, c.x, c.x + 40);
    wall(w, c.x + 5, [false, false, true, false], 'ita9d');
    wall(w, c.x + 13, [false, true, false, false], 'ita9e');
    wall(w, c.x + 21, [false, false, false, false], 'ita9f');
    wall(w, c.x + 30, [false, false, true, true], 'ita9g');
    sign(w, c.x + 1, 10.4, 3, 'DEEWAR', 'shop', null, 'the rampart');
  },
};

// The door is plain. The two-brick spiked gate wall ("pull once, step back, hop the stub") was this stage's act rule a
// second time, not a new idea, and was cut. The finale's act B puts that stub under the fort's arch instead.
export const meta09 = { family: 'pull-brick-pile-slumps', betrayals: ['pull-brick-slump'], ending: 'ita-plain-fort-gate' };
