// ITA-04 Santra Seedhi: the orange terraces of Dambuk. A terrace wall too high to jump, and three empty cane baskets
// flat on the ground before it. Jump under the orange tree's branch and it drops two oranges at the trunk that roll
// downhill, to the right, and fill the baskets in order: a full basket is a step, and three shakes build the stair.
// The oranges rolling past kill whoever is on the ground in their way, so shake from the uphill side of the trunk.
// Over the shaking spot hangs the harvester's full basket on its pulley rope, and every shake lets it down a notch:
// the fourth shake drops it on the shaker. Count your shakes.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, perTick } from './entities';
import { FL, since, taraScript } from './common';
import { lines as L } from './lines';

export interface Basket {
  /** first column (2 wide) */
  c: number;
  /** oranges it takes to be full */
  cap: number;
  n: number;
  rig?: Rig;
}
export interface Tree {
  /** the trunk's column; the branch spans trunk - 2 .. trunk + 4 */
  trunk: number;
  /** shakes before the hanging basket over trunk - 2 drops */
  notches: number;
  shakes: number;
  dropped: boolean;
  dropT: number;
  lastShake: number;
}
export interface Grove {
  trees: Tree[];
  baskets: Basket[];
  /** rolling oranges */
  oranges: Rig[];
  gy: number;
}

function orangeArt(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.fillStyle = '#F28C28';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFC078';
  ctx.fillRect(x - 2, y - r + 2, 2, 2);
}

/** the grove on ground level `gy` (px): trees whose shake rolls oranges right into the baskets; `key` holds the state */
export function grove(w: World, trees: { trunk: number; notches: number }[], baskets: { c: number; cap: number }[], key: string, wallX: number, gy = FL): Grove {
  const st: Grove = { trees: trees.map((t) => ({ ...t, shakes: 0, dropped: false, dropT: 0, lastShake: -99 })), baskets: baskets.map((b) => ({ ...b, n: 0 })), oranges: [], gy };
  w.flags[key] = st;
  const BR = gy - 54;
  // baskets: a flat cane mat when empty, a stack of oranges in a cane basket as they fill
  for (const b of st.baskets) {
    b.rig = w.add(
      new Rig(px(b.c), gy - 2, 32, 2, {
        solid: true,
        layer: 2,
        tick: (r, w2) => {
          const h = Math.max(2, b.n * 16);
          if (r.h !== h) {
            r.h = h;
            r.solid!.h = h;
            r.moveTo(w2, r.x, gy - h);
          }
        },
        paint: (ctx, r) => {
          box(ctx, r.x, r.y, 32, r.h, '#B08A4A');
          box(ctx, r.x + 2, r.y + 2, 28, Math.max(0, r.h - 2), '#C9A66A');
          for (let k = 0; k < b.n; k++) for (let i = 0; i < 3; i++) orangeArt(ctx, r.x + 6 + i * 10, gy - 8 - k * 16, 5);
          box(ctx, r.x, r.y, 32, 2, '#8A6A3A');
          // the rim is higher on the downhill side: a rolling orange goes in from the left
          box(ctx, r.x + 28, r.y - 3, 4, 3, '#8A6A3A');
        },
      }),
    );
  }
  for (const t of st.trees) {
    const bx0 = px(t.trunk - 2),
      bx1 = px(t.trunk + 5);
    // the shake: Dad's head in the branch while in the air
    w.add(
      new Rig(bx0, BR, bx1 - bx0, 16, {
        layer: 1,
        tick: (_r, w2) => {
          const p = w2.player;
          if (!p.onGround && p.y <= BR + 14 && p.cx >= bx0 && p.cx < bx1 && since(w2, t.lastShake) > 0.6) {
            t.lastShake = w2.tick;
            t.shakes++;
            w2.sfx('creak', p.cx, BR);
            for (const dx of [0, 14]) {
              const o = w2.add(
                new Rig(px(t.trunk) + 6 + dx, gy - 12, 12, 12, {
                  layer: 3,
                  cause: 'ita-santra',
                  inset: 1,
                  tick: (r, w3) => {
                    r.x += perTick(110);
                    // into the first basket with room (from its left rim); at the wall the pile stops
                    for (const b of st.baskets) {
                      if (b.n < b.cap && r.x + 6 >= px(b.c) + 4 && r.x + 6 < px(b.c) + 20) {
                        b.n++;
                        r.on = false;
                        r.alive = false;
                        w3.sfx('thud', r.x, gy);
                        return;
                      }
                    }
                    if (r.x + 12 >= wallX) {
                      r.on = false;
                      r.alive = false;
                    }
                  },
                  paint: (ctx, r) => orangeArt(ctx, r.x + 6, r.y + 6, 6),
                }),
              );
              st.oranges.push(o);
            }
            if (t.shakes >= t.notches && !t.dropped) {
              t.dropped = true;
              t.dropT = w2.tick;
              w2.sfx('snap', bx0, BR);
            }
          }
        },
        paint: () => {},
      }),
    );
    // the hanging basket over the shaking spot: a notch lower per shake, and down on the last
    const hang = w.add(
      new Rig(px(t.trunk - 2), BR - 90, 32, 28, {
        layer: 3,
        cause: 'ita-tokri',
        inset: 2,
        live: (_r, w2) => t.dropped && since(w2, t.dropT) < 0.9,
        tick: (r, w2) => {
          const top = BR - 90 + Math.min(t.shakes, t.notches - 1) * 14;
          if (!t.dropped) r.y += (top - r.y) * 0.2;
          else r.y = Math.min(gy - 28, r.y + perTick(520) * Math.min(1.6, 0.3 + since(w2, t.dropT) * 3));
        },
        paint: (ctx, r) => {
          box(ctx, r.x + 15, 0, 2, Math.max(0, r.y), '#6B5A2A');
          box(ctx, r.x, r.y, 32, 28, '#B08A4A');
          box(ctx, r.x + 2, r.y + 2, 28, 24, '#C9A66A');
          for (let k = 0; k < 2; k++) for (let i = 0; i < 3; i++) orangeArt(ctx, r.x + 6 + i * 10, r.y + 8 + k * 11, 5);
          // the notches on the pulley post: one lights per shake
          for (let k = 0; k < t.notches; k++) box(ctx, r.x + 34, BR - 90 + k * 14, 6, 2, k < t.shakes ? '#F28C28' : '#E8E0D0');
        },
      }),
    );
    void hang;
    // the tree: trunk and canopy with oranges, behind everything
    w.add(
      new Paint((ctx) => {
        box(ctx, px(t.trunk) + 4, BR, 8, gy - BR, '#6B4A2A');
        ctx.fillStyle = '#3F7A3A';
        ctx.beginPath();
        ctx.ellipse(px(t.trunk) + 20, BR - 10, 64, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        box(ctx, bx0, BR + 4, bx1 - bx0, 4, '#6B4A2A');
        for (let i = 0; i < 7; i++) orangeArt(ctx, bx0 + 8 + i * 15, BR - 8 - (i % 3) * 7, 4);
      }, -3),
    );
  }
  return st;
}

export const WALL = 19;
const BASKETS_ROOM = [
  { c: 13, cap: 1 },
  { c: 15, cap: 2 },
  { c: 17, cap: 3 },
];

export function room(): LevelDef {
  return {
    id: 'ITA-04',
    city: 'ITA',
    index: 4,
    name: 'Santra Seedhi',
    nameEn: 'The orange stair',
    tagline: 'The steps up the terrace are not built yet. The tree builds them.',
    hint: 'The terrace wall is too high, and the baskets before it lie flat and empty. Jump under the orange tree’s branch and two oranges drop at the trunk and roll downhill, to the right, and fill the baskets in order: a full basket is a step. The rolling oranges kill whoever is on the ground in their way, so shake from the uphill side of the trunk, left of it. The harvester’s full basket hangs over that spot and comes down a notch with every shake: three shakes fill the stair, the fourth drops it on you.',
    par: 30,
    map: (() => {
      const g = Grid.ground(15).put(1, 14, '@');
      g.fill(WALL, 31, 12, 14, '#');
      g.put(30, 11, 'E');
      return g.rows();
    })(),
    build(w: World) {
      door(w);
      grove(w, [{ trunk: 7, notches: 4 }], BASKETS_ROOM, 'ita4', px(WALL));
      onPass(w, px(3), (w2) => tara(w2, L.intro[2], 2.4));
      sign(w, 2, 10.4, 3.4, 'DAMBUK', 'shop', null, 'orange groves');
      rival(w, 27, 12, -1, taraScript(4));
      collectible(w, 'ita-santra', 16, 9.4);
    },
  };
}

/** act: a higher terrace, two trees. Each tree's basket drops on its third shake, and the stair needs four: two from each. */
export const act: Act = {
  id: 'ita04-upar',
  w: 40,
  advice: 'The upper terrace is higher still: four baskets, eight oranges, four shakes. Two trees stand uphill of them, and each one’s hanging basket drops on its third shake. Shake each tree twice, from its uphill side, and the stair is built with both baskets still up. Then drop off the far end of the terrace.',
  cps: [34],
  paint: (g, c) => {
    g.fill(c.x, c.x + 39, 12, 14, '#');
    g.fill(c.x + 25, c.x + 31, 8, 11, '#');
  },
  build: (w, c) => {
    grove(
      w,
      [
        { trunk: c.x + 4, notches: 3 },
        { trunk: c.x + 11, notches: 3 },
      ],
      [
        { c: c.x + 17, cap: 1 },
        { c: c.x + 19, cap: 2 },
        { c: c.x + 21, cap: 2 },
        { c: c.x + 23, cap: 3 },
      ],
      'ita4a',
      c.X(25),
      FL - 48,
    );
    sign(w, c.x + 1, 7.4, 3, 'UPAR', 'shop', null, 'the upper terrace');
  },
};

/** ending: the packing shed. A loader on the roof drops a crate on the doorstep every few seconds, and the rope's shadow
 *  slides along the step to where the next one will land. Read the shadow, and cross behind it right after a drop. */
export const ending: Ending = {
  space: 14,
  advice: 'The packing shed: a loader on the roof drops a crate on the doorstep every few seconds, and before each drop the rope’s shadow slides along the step to where the crate will land. Read where the shadow is going: cross right after a drop, and never stand where it has stopped.',
  paint: (g, D) => {
    g.fill(D - 14, D + 4, 12, 14, '#');
    g.put(D, 11, 'E');
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'peti';
    const top = FL - 48;
    const P = 3.0;
    const x0 = px(D - 8),
      x1 = px(D - 3);
    const spots = [0, 0.75, 0.25, 1, 0.5];
    const spotX = (k: number) => x0 + spots[((k % spots.length) + spots.length) % spots.length] * (x1 - x0);
    const st = { P, x0, x1, spotX };
    w.flags.ita4e = st;
    w.add(
      new Rig(0, top - 100, 24, 30, {
        layer: 3,
        cause: 'ita-peti',
        inset: 2,
        live: (r) => r.s.live === true,
        tick: (r, w2) => {
          const t = w2.tick / 120;
          const k = Math.floor(t / P);
          const f = (t - k * P) / P;
          // the shadow slides from the last spot to the next one over the first 60% of the cycle; the crate comes down in the last 0.35 s
          const slide = Math.min(1, f / 0.6);
          const sx = spotX(k - 1) + (spotX(k) - spotX(k - 1)) * slide;
          r.s.sx = sx;
          const dropF = Math.max(0, (f - (1 - 0.35 / P)) / (0.35 / P));
          r.x = spotX(k) - 12;
          r.y = top - 30 - 70 * (1 - dropF);
          r.s.live = dropF > 0.5;
        },
        paint: (ctx, r) => {
          box(ctx, r.x + 11, 0, 2, Math.max(0, r.y), '#6B5A2A');
          box(ctx, r.x, r.y, 24, 30, '#B08A4A');
          box(ctx, r.x + 2, r.y + 2, 20, 26, '#C9A66A');
          box(ctx, r.x + 10, r.y, 4, 30, '#8A6A3A');
          ctx.fillStyle = 'rgba(0,0,0,0.35)';
          ctx.fillRect(Math.round((r.s.sx ?? r.x) - 12), top - 2, 24, 3);
        },
      }),
    );
  },
};

export const meta04 = { family: 'fruit-rolls-into-baskets-as-steps', betrayals: ['fruit-steps'], ending: 'ita-peti' };
