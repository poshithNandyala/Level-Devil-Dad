// PAT-04 Golghar: the round granary with its two one-way stairs. Porters carry sacks DOWN the stair you climb
// (they came up the other one), so the stair is only safe between them; a second porter steps out of a door on the
// landing. Act: the dome fills with grain from the floor. Door: it opens into you.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, folk, perTick } from './entities';
import { cyc, since, taraScript } from './common';
import { lines as L } from './lines';

const FL = 240;
/** the stair: four steps of two columns from column 3 to 10, the landing from 11 to 18 (64 px up), then the way down */
export const STAIR = { c0: 3, steps: 4, top: 64, landing: [11, 18] as [number, number], period: 8, topEmerge: 1.0, midEmerge: 4.4, midCol: 7 };

/** where the stair surface is at column x (px): the height of the step under it */
const stairY = (x: number) => {
  const c = x / 16;
  const k = Math.min(4, Math.max(0, Math.floor((c - STAIR.c0) / 2) + 1));
  return FL - k * 16;
};

function porter(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  // a porter bent under a full sack, walking down
  folk(ctx, x, y + 14, 28, '#2F6BB0');
  box(ctx, x - 8, y, 16, 16, '#C9A56B');
  box(ctx, x - 8, y, 16, 3, '#E3C58A');
  void t;
}

export function room(): LevelDef {
  return {
    id: 'PAT-04',
    city: 'PAT',
    index: 4,
    name: 'Golghar',
    nameEn: 'The round granary',
    tagline: 'Porters climbed one stair with the grain and came down the other. Nobody told the stairs.',
    hint: 'The stair you climb is the one the porters come down, with a sack on their heads: you cannot hop a sack. Wait at the bottom until one has gone by, then climb. A second porter steps out of the door on the landing a few seconds later, so wait for him too, then go up in one go. Over the top and down the far stair to the door.',
    par: 22,
    map: (() => {
      const g = Grid.ground(15);
      for (let i = 0; i < STAIR.steps; i++) g.fill(STAIR.c0 + i * 2, STAIR.c0 + i * 2 + 1, 14 - i, 14, '#');
      g.fill(11, 18, 11, 14, '#');
      for (let i = 0; i < STAIR.steps; i++) g.fill(19 + i * 2, 19 + i * 2 + 1, 11 + i, 14, '#');
      return g.put(1, 14, '@').put(30, 14, 'E').rows();
    })(),
    build(w: World) {
      door(w);
      const st = { t0: -1 };
      w.flags.pat4 = st;
      onPass(w, px(1), (w2) => {
        st.t0 = w2.tick;
        tara(w2, L.win[1], 2.4);
      });
      // porters: A walks down from the top of the landing, B from a door at the mid landing, every `period` seconds
      const mk = (emerge: number, fromCol: number, key: string) =>
        w.add(
          new Rig(px(fromCol), 0, 16, 44, {
            layer: 3,
            cause: 'pat-bojh',
            inset: 2,
            live: (r) => !!r.on,
            tick: (r, w2) => {
              if (st.t0 < 0) {
                r.on = false;
                return;
              }
              const t = since(w2, st.t0) - emerge;
              const k = ((t % STAIR.period) + STAIR.period) % STAIR.period;
              const walk = ((fromCol - 2) * 16) / 56;
              r.on = t >= 0 && k < walk;
              if (r.on) {
                r.x = px(fromCol) - k * 56;
                r.y = stairY(r.x + 8) - 44;
                r.s.k = k;
              }
            },
            paint: (ctx, r, w2) => porter(ctx, r.x + 8, r.y, w2.tick),
          }),
        );
      w.flags.pat4p = { a: mk(STAIR.topEmerge, 11, 'a'), b: mk(STAIR.midEmerge, STAIR.midCol, 'b') };
      w.add(
        new Paint((ctx) => {
          // the great dome behind, the landing door (a dark arch at column 7), and arrows painted on the stair
          box(ctx, px(STAIR.midCol) - 4, FL - 48 - 26, 14, 26, '#2B1A10');
          for (let i = 0; i < 4; i++) box(ctx, px(STAIR.c0 + i * 2) + 8, FL - 18 - i * 16, 8, 2, '#D7262E');
        }, -4),
      );
      sign(w, 21, 6.2, 4.4, 'GOLGHAR', 'shop', null, '1786 granary');
      rival(w, 14, 10, 1, taraScript(4));
      collectible(w, 'pat-khaja', 15, 8.4);
    },
  };
}

export const act: Act = {
  id: 'pat04-anaaj',
  w: 30,
  advice: 'Inside the dome: a sunk floor with the grain being tipped in. It rises steadily. Climb the grain and step off at the ledge on the right once it is up level with it, and not later than the roof allows.',
  cps: [1],
  paint: (g, c) => {
    g.fill(c.x + 3, c.x + 18, 15, 16, '.');
    g.fill(c.x + 3, c.x + 18, 17, 17, '#');
    g.fill(c.x + 19, c.x + 24, 10, 17, '#');
  },
  build: (w, c) => {
    const st = { t0: -1 };
    w.flags.pat4a = st;
    onPass(w, c.X(2), (w2) => {
      st.t0 = w2.tick;
    });
    // the grain: a solid floor rising 16 px/s from the sunk floor
    const grain = w.add(
      new Rig(c.X(3), 272, px(16), 120, {
        solid: true,
        layer: 2,
        tick: (r, w2) => {
          if (st.t0 < 0) return;
          const y = Math.max(96, 272 - since(w2, st.t0) * 16);
          r.moveTo(w2, r.x, Math.round(y));
        },
        paint: (ctx, r) => {
          box(ctx, r.x, r.y, r.w, 40, '#E3B04B');
          for (let i = 0; i < 20; i++) box(ctx, r.x + ((i * 37) % r.w), r.y + 2 + ((i * 11) % 8), 3, 2, '#F5D07A');
        },
      }),
    );
    w.flags.pat4g = grain;
    // the roof of the dome: the grain buries anyone it lifts to the top
    w.add(
      new Rig(c.X(3), 0, px(16), 122, {
        layer: 3,
        cause: 'pat-anaaj',
        inset: 0,
        paint: (ctx, r) => {
          box(ctx, r.x, r.y, r.w, 110, '#6B4A2C');
          for (let i = 0; i < 8; i++) box(ctx, r.x + i * 32 + 8, 110, 10, 12, '#6B4A2C');
        },
      }),
    );
    sign(w, c.x + 20, 5.4, 4, 'KHIDKI', 'shop', null, 'window');
  },
};

export const ending: Ending = {
  space: 14,
  advice: 'The door of Golghar opens inwards, into you: it swings out across the road in front of it. Stay well back until it has swung, then walk in while it is open.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    const P = 5;
    const lock = { open: false };
    w.flags.pat4e = lock;
    w.flags.twist = 'shut';
    const leaf = w.add(
      new Rig(d.x + 2, FL - 34, 12, 34, {
        layer: 3,
        cause: 'pat-bhitar',
        inset: 1,
        live: (_r, w2) => {
          const t = cyc(w2, P, 0);
          return (t >= 1.4 && t < 2.2) || (t >= 3.4 && t < 4.2);
        },
        tick: (r, w2) => {
          const t = cyc(w2, P, 0);
          const out = t < 1.4 ? 0 : t < 2.2 ? (t - 1.4) / 0.8 : t < 3.4 ? 1 : t < 4.2 ? 1 - (t - 3.4) / 0.8 : 0;
          r.x = d.x + 2 - out * 60;
          lock.open = t >= 2.2 && t < 3.4;
          w2.flags.twist = lock.open ? 'open' : 'shut';
        },
        paint: (ctx, r) => {
          box(ctx, r.x, r.y, r.w, r.h, '#6B3F1C');
          box(ctx, r.x + 2, r.y + 2, r.w - 4, r.h - 4, '#8A5A2B');
          box(ctx, r.x + 8, r.y + 16, 2, 3, '#E8C547');
        },
      }),
    );
    leaf.layer = 3;
    d.onReach = (w2) => {
      if (lock.open) w2.win('door');
      else w2.sfx('thud', d.x + 8, d.y + 16);
    };
    void D;
  },
};

export const meta04 = { family: 'one-way-stairs-rising-grain', betrayals: ['one-way-porters'], ending: 'pat-bhitar' };
