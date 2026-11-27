// IMP-08 Sasta Sabse Pehle (HWIK): Ima Keithel, the mothers' market. Stalls in a row over the drain, each with
// its price on a board. The mothers sell cheapest first: step on the stalls in RISING price order, and a stall
// cheaper than one you have already stood on drops its shutter on you. Nothing says so before the first death;
// the death line and the boards say it all after. Skip a stall by jumping over it. In the second hall some prices
// are written in Meitei (ama, ani, ahum: one, two, three), which the board at the entrance taught.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import { Paint, tara, text } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, folk } from './entities';
import { FL, lake, since, taraScript } from './common';
import { lines as L, NPC } from './lines';

/** stalls are 40 px counters 8 px apart: the gaps are narrower than Dad, so the row is walked; an out-of-order
 * stall is skipped by jumping over it (8 + 40 + 8 = 56 px, a held jump) */
export const STALL = { wpx: 40, gappx: 8, h: 16, drop: 0.22 };
/** columns a row of n stalls spans (for the pit under it) */
export const stallSpan = (n: number) => Math.ceil((n * (STALL.wpx + STALL.gappx) - STALL.gappx) / 16);
export type Price = number | 'AMA' | 'ANI' | 'AHUM';
const value = (p: Price) => (p === 'AMA' ? 1 : p === 'ANI' ? 2 : p === 'AHUM' ? 3 : p);

export interface RowState {
  last: number;
  /** index of the stall whose shutter is dropping, -1 none */
  dropping: number;
  t0: number;
  stood: number[];
}

/** a row of stalls starting at column c0; returns the state */
export function stalls(w: World, key: string, c0: number, prices: Price[]) {
  const st: RowState = { last: 0, dropping: -1, t0: 0, stood: [] };
  w.flags[key] = st;
  prices.forEach((p, i) => {
    const x = px(c0) + i * (STALL.wpx + STALL.gappx);
    const counter = w.add(
      new Rig(x, FL - STALL.h, STALL.wpx, STALL.h, {
        layer: 1,
        solid: true,
        tick: (r, w2) => {
          if (!w2.standing(r.solid!) || st.dropping >= 0) return;
          const v = value(p);
          if (st.stood[st.stood.length - 1] === i) return;
          st.stood.push(i);
          if (v > st.last) st.last = v;
          else {
            st.dropping = i;
            st.t0 = w2.tick;
            w2.sfx('thud', x, FL - 40);
          }
        },
        paint: (ctx, r) => {
          box(ctx, r.x, r.y, r.w, r.h, '#8A6A3A');
          box(ctx, r.x, r.y, r.w, 3, '#C9A56B');
          // the goods: baskets of greens and chillies
          for (let k = 0; k < 3; k++) box(ctx, r.x + 4 + k * 14, r.y - 6, 10, 6, k % 2 ? '#4F7A2A' : '#D7262E');
          // the mother behind her stall
          folk(ctx, r.x + r.w / 2, r.y - 34, 26, ['#D86C8A', '#2F6BB0', '#E8C860'][i % 3], { phanek: '#8A4A8F' });
        },
      }),
    );
    void counter;
    // the shutter: hangs under the awning; drops on the counter when this stall is stepped on out of order
    w.add(
      new Rig(x - 2, FL - STALL.h - 44, STALL.wpx + 4, 30, {
        layer: 3,
        cause: 'imp-shutter',
        inset: 2,
        live: () => st.dropping === i,
        tick: (r, w2) => {
          const k = st.dropping === i ? Math.min(1, since(w2, st.t0) / STALL.drop) : 0;
          r.y = FL - STALL.h - 44 + k * 30;
        },
        paint: (ctx, r) => {
          box(ctx, r.x, r.y, r.w, r.h, '#5E5236');
          for (let yy = 3; yy < r.h; yy += 5) box(ctx, r.x, r.y + yy, r.w, 1, '#3E3524');
          // the price board on the awning, big enough to read on a phone
          box(ctx, r.x + 4, FL - STALL.h - 62, r.w - 8, 16, '#F2E6C4');
          text(ctx, typeof p === 'number' ? `₹${p}` : p, r.x + r.w / 2, FL - STALL.h - 50, 11, '#2E2A1E', 'rgba(0,0,0,0)');
        },
      }),
    );
  });
  // the awning over the row
  const wd = prices.length * (STALL.wpx + STALL.gappx) - STALL.gappx;
  w.add(
    new Paint((ctx) => {
      box(ctx, px(c0) - 8, FL - STALL.h - 70, wd + 16, 8, '#7A4A3A');
      box(ctx, px(c0) - 8, FL - STALL.h - 74, wd + 16, 4, '#5E3A2E');
    }, -2),
  );
  return st;
}

export function room(): LevelDef {
  const prices: Price[] = [10, 30, 20, 40, 60, 50, 70];
  const span = stallSpan(prices.length);
  return {
    id: 'IMP-08',
    city: 'IMP',
    index: 8,
    name: 'Sasta Sabse Pehle',
    nameEn: 'Cheapest first',
    tagline: 'Ima Keithel. Five thousand mothers, one rule.',
    hint: 'The mothers sell cheapest first: step on the stalls in rising price order. A stall cheaper than one you have already stood on drops its shutter on you. Read the boards and jump over any stall that would break the order.',
    par: 36,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').fill(5, 5 + span, 15, 17, '.').rows(),
    build(w: World) {
      door(w);
      lake(w, 5, 5 + span + 1, 'imp-nala');
      stalls(w, 'imp8', 5, prices);
      onPass(w, px(2), (w2) => tara(w2, L.intro[6], 2.2));
      sign(w, 1.6, 10.4, 4.2, 'IMA KEITHEL', 'green', null, 'ama 1 · ani 2 · ahum 3');
      onPass(w, px(3), (w2) => w2.say(NPC.expensive, px(9), FL - 70, 2.4, 'npc'));
      rival(w, 30.5, 15, -1, taraScript(8));
      collectible(w, 'imp-umorok', 5 + 4 * 3 + 1, 9.4);
    },
  };
}

/** act: the second hall; two boards are in Meitei (the entrance board taught them) */
export const act: Act = {
  id: 'imp08-ani',
  w: 36,
  advice: 'The second hall’s boards: ama, ani, ahum are one, two, three (the board at the entrance says so). Rising order again, and over any stall that breaks it.',
  cps: [32],
  paint: (g, c) => {
    g.fill(c.x + 3, c.x + 3 + stallSpan(6) - 1, 15, 17, '.');
  },
  build: (w, c) => {
    const prices: Price[] = ['AMA', 4, 'ANI', 'AHUM', 5, 6];
    lake(w, c.x + 3, c.x + 3 + stallSpan(6), 'imp-nala');
    stalls(w, c.f('row'), c.x + 3, prices);
    sign(w, c.x + 30, 10.4, 3.4, 'KEITHEL', 'green', null, 'second hall');
  },
};

export const meta08 = { family: 'price-order-stalls', betrayals: ['ordered-by-number'], ending: 'imp-keithel-door-plain' };
