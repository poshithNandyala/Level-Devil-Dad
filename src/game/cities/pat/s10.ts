// PAT-10 Setu se Golghar: the finale, only Patna's own ideas. A handcart is parked at the start of each part, and
// the sacks on it are the rule: on the bridge every plate whose number is a multiple of the sack count is gone
// (the Setu), on the pontoon every section numbered that way is awash (the Pipa Pul), and at the door the pad
// with that number is the one that opens it (the Golghar granary). Read the cart, count the plates.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, lock, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { Rig, box } from './entities';
import { taraScript } from './common';
import { pontoon } from './s05';
import { seams, under } from './s06';
import { stairBuild, stairPaint } from './s04';
import { lines as L } from './lines';

const FL = 240;

/** a handcart with n sacks, parked: the count is the rule of the part */
function cart(w: World, x: number, n: number) {
  w.add(
    new Paint((ctx) => {
      box(ctx, x, FL - 14, 30, 8, '#6B3F1C');
      ctx.fillStyle = '#1D1A1A';
      ctx.beginPath();
      ctx.arc(x + 7, FL - 4, 4, 0, Math.PI * 2);
      ctx.arc(x + 23, FL - 4, 4, 0, Math.PI * 2);
      ctx.fill();
      box(ctx, x - 8, FL - 18, 10, 2, '#8A5A2B');
      for (let i = 0; i < n; i++) {
        box(ctx, x + 2 + (i % 3) * 9, FL - 24 - Math.floor(i / 3) * 8, 8, 9, '#C9A56B');
        box(ctx, x + 2 + (i % 3) * 9, FL - 24 - Math.floor(i / 3) * 8, 8, 2, '#E3C58A');
      }
    }, 2),
  );
}

export function room(): LevelDef {
  const N = 3;
  const cols = [5, 9, 13, 17, 21, 25];
  return {
    id: 'PAT-10',
    city: 'PAT',
    index: 10,
    name: 'Setu se Golghar',
    nameEn: 'From the bridge to the granary',
    tagline: 'Everything Patna taught you, with a handcart to read.',
    hint: 'Read the sacks on the handcart at the start of each part. On the bridge, every plate whose number is a multiple of that count is missing: jump those seams, walk the others (a plate flips if you land on it from a jump). On the pontoon, every section numbered that way is awash: jump over it. At the granary door, step only on the pad with the same number as the sacks on its cart.',
    par: 90,
    map: (() => {
      const g = Grid.ground(15).put(1, 14, '@').put(30, 14, 'E');
      for (const c of cols) g.fill(c, c + 1, 15, 17, '.');
      return g.rows();
    })(),
    build(w: World) {
      door(w);
      w.flags.pat10N = N;
      cart(w, px(2), N);
      const list: [number, number, boolean][] = cols.map((c, i) => [c, i + 1, (i + 1) % N !== 0]);
      seams(w, list, 'pat10');
      for (const [c, , present] of list) under(w, c, c + 1, present ? 'pat-taala' : 'pat-jod');
      w.add(
        new Rig(px(3), 0, 1, 1, {
          paint: () => {},
          tick: (_r, w2) => {
            if (w2.tick === 1) tara(w2, L.win[1], 2.4);
          },
        }),
      );
      sign(w, 6.6, 6.4, 4.6, 'GANDHI SETU', 'shop', null, 'load: 3 sacks');
      rival(w, 28, 15, -1, taraScript(10));
      collectible(w, 'pat-litti', 11, 11.6);
    },
  };
}

const NP = 4;
export const act1: Act = {
  id: 'pat10-pipa',
  w: 46,
  advice: 'The cart at the foot of the pontoon carries four sacks: every fourth section is awash. Walk the others, and jump over the fourth and the eighth from the edge of the section before.',
  cps: [],
  paint: (g, c) => {
    g.fill(c.x + 5, c.x + 5 + 25 - 1, 15, 17, '.');
  },
  build: (w, c) => {
    const pt = pontoon(w, c.x + 5, 10, [], 'pat10p');
    pt.secs.forEach((s, i) => {
      if ((i + 1) % NP === 0) s.s.awash = true;
    });
    cart(w, px(c.x + 1), NP);
    sign(w, c.x + 1.2, 10.4, 3, 'PIPA PUL', 'shop', null, 'load: 4 sacks');
  },
};

/** the Setu again, with five sacks on the cart: every fifth plate is gone */
export const actSetu: Act = {
  id: 'pat10-sau',
  w: 62,
  advice: 'Back on the bridge, and the cart at the foot of it carries five sacks: every fifth plate is gone, the five and the ten. Walk the plates, jump the gaps.',
  cps: [20, 42],
  paint: (g, c) => {
    for (let i = 0; i < 10; i++) g.fill(c.x + 6 + i * 5, c.x + 7 + i * 5, 15, 17, '.');
  },
  build: (w, c) => {
    const list: [number, number, boolean][] = [];
    for (let i = 0; i < 10; i++) list.push([c.x + 6 + i * 5, i + 1, (i + 1) % 5 !== 0]);
    seams(w, list, 'pat10b');
    for (const [col, , present] of list) under(w, col, col + 1, present ? 'pat-taala' : 'pat-jod');
    cart(w, px(c.x + 1), 5);
    sign(w, c.x + 1.2, 10.4, 3, 'SETU', 'shop', null, 'load: 5 sacks');
  },
};

/** Golghar's stairs again, on the way to the granary: the porters come down the stair you climb */
export const actStair: Act = {
  id: 'pat10-sidhi',
  w: 34,
  advice: 'Golghar’s stair once more: the porters come down it with their sacks, one from the top and one from the door on the landing. Wait at the foot until both have gone by, then go up in one go and down the far stair.',
  cps: [],
  paint: (g, c) => stairPaint(g, c.x + 2),
  build: (w, c) => {
    stairBuild(w, c.x + 2, 'pat10g', false);
    sign(w, c.x + 22, 6.4, 4.4, 'GOLGHAR', 'shop', null, 'the granary');
  },
};

export const act2: Act = {
  id: 'pat10-anaaj',
  w: 20,
  advice: 'The granary yard: a plain walk to the door, and a breath before the last count.',
  cps: [],
  paint: () => {},
  build: (w, c) => {
    sign(w, c.x + 6, 10.4, 3.4, 'GOLGHAR', 'shop', null, 'the granary');
  },
};

export const ending: Ending = {
  space: 22,
  advice: 'The granary door is shut. The cart beside it carries two sacks: step only on the pad numbered two, and hop over the others, or a stack of sacks comes down on you.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    const N = 2;
    const L2 = lock(w, d, 'Tani dubaara kaha. | Say that again.');
    w.flags.pat10e = { pads: [] as { x: number; n: number }[], lock: L2 };
    w.flags.twist = 'pads';
    cart(w, px(D - 22), N);
    for (let i = 0; i < 4; i++) {
      const n = i + 1;
      const x = px(D - 18 + i * 4);
      (w.flags.pat10e.pads as { x: number; n: number }[]).push({ x, n });
      const sack = w.add(
        new Rig(x - 24, 0, 72, 40, {
          layer: 3,
          cause: 'pat-bora',
          inset: 4,
          live: (r) => r.s.fall >= 0,
          tick: (r, w2) => {
            const p = w2.player;
            if (r.s.fall === undefined) {
              r.s.fall = -1;
              r.y = -40;
            }
            if (r.s.fall < 0 && p.onGround && p.cx >= x + 4 && p.cx < x + 20 && p.y + p.h >= FL - 1) {
              if (n === N) {
                if (!L2.open) L2.unlock();
              } else r.s.fall = w2.tick;
            }
            if (r.s.fall >= 0) {
              const t = (w2.tick - r.s.fall) / 120;
              r.y = Math.min(FL - 40, -40 + t * t * 1400);
              if (t > 1.4) {
                r.s.fall = -1;
                r.y = -40;
              }
            }
          },
          paint: (ctx, r) => {
            if (r.s.fall >= 0) for (let i = 0; i < 3; i++) box(ctx, r.x + 4 + i * 22, r.y + 6, 20, 30, '#C9A56B');
          },
        }),
      );
      sack.s.fall = -1;
      w.add(
        new Paint((ctx) => {
          box(ctx, x, FL - 2, 24, 2, '#3A2A1E');
          box(ctx, x + 2, FL - 2, 20, 1, '#C9A56B');
          ctx.fillStyle = '#F5E6C0';
          ctx.font = '800 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(String(n), x + 12, FL - 6);
        }, 1),
      );
    }
  },
};

export const meta10 = { family: 'finale-setu-plate-count', betrayals: ['plate-count-under-cart'], ending: 'pat-ginti-pad' };
