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
import { pontoon, sackDeck } from './s05';
import { seams, under, liftSeams, cart, type Lift } from './s06';
import { stairBuild, stairPaint } from './s04';
import { row, jam, type Hoard } from './s03';
import { tempo, road } from './s07';
import { lines as L } from './lines';

const FL = 240;

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
    hint: 'Read the sacks on the handcart at the start of each part. On the bridge, every plate whose number is a multiple of that count is missing: the plate is only a tarp over the gap: jump those seams from the deck, walk the others. On the pontoon, every section numbered that way is awash: jump over it. At the granary door, step only on the pad with the same number as the sacks on its cart.',
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
      for (const [c] of list) under(w, c, c + 1, 'pat-jod');
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
    // carrying the room's count on to this cart's pontoon is its own death
    pt.water!.hazard!.cause = 'pat-bhaar';
    pt.secs.forEach((q) => (q.hazard!.cause = 'pat-bhaar'));
    cart(w, px(c.x + 1), NP);
    sign(w, c.x + 1.2, 10.4, 3, 'PIPA PUL', 'shop', null, 'load: 4 sacks');
  },
};

/** the Setu again, with five sacks on the cart: every fifth plate is gone */
export const actSetu: Act = {
  id: 'pat10-sau',
  w: 62,
  advice: 'Back on the bridge, and the cart at the foot of it carries five sacks: every fifth plate is a tarp, the five and the ten. Walk the plates, jump the tarps.',
  cps: [],
  paint: (g, c) => {
    for (let i = 0; i < 10; i++) g.fill(c.x + 6 + i * 5, c.x + 7 + i * 5, 15, 17, '.');
  },
  build: (w, c) => {
    const list: [number, number, boolean][] = [];
    for (let i = 0; i < 10; i++) list.push([c.x + 6 + i * 5, i + 1, (i + 1) % 5 !== 0]);
    seams(w, list, 'pat10b');
    for (const [col] of list) under(w, col, col + 1, 'pat-ginti');
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

/** the pontoon with the porters at work: the cart's three sacks say every third section gets loaded; the second sack slides */
export const actBori: Act = {
  id: 'pat10-bori',
  w: 62,
  advice: 'The cart at the foot of the pontoon carries three sacks: the third and the sixth section are about to be loaded, each staying awash while its sack lies there. Wait at the end of the section before the third. The sixth sack hangs over the seventh and slides back on to the sixth along its rope: keep off the section where the rope ends.',
  cps: [27],
  paint: (g, c) => {
    g.fill(c.x + 5, c.x + 5 + 50 - 1, 15, 17, '.');
  },
  build: (w, c) => {
    sackDeck(w, c.x + 5, 20, 'pat10s', [
      { k: 2, at: 1.2, dur: 4.0 },
      { k: 5, from: 6, at: 7.0, dur: 4.0 },
    ]);
    cart(w, px(c.x + 1), 3);
    sign(w, c.x + 1.2, 10.4, 3, 'PIPA PUL', 'shop', null, 'load: 3 sacks');
  },
};

/** the Setu in traffic: the cart's two sacks say plates two and four are the ones the trucks lift; the second has a second truck behind it */
export const actGaadi: Act = {
  id: 'pat10-gaadi',
  w: 70,
  advice: 'The cart at the foot of this stretch carries two sacks: the plates numbered two and four are the ones a truck lifts out of its seat, shaking a second before. Wait on the deck. Where a second truck follows the first, the plate is back for a breath and still shaking: cross only when it is in and still.',
  cps: [20, 34],
  paint: (g, c) => {
    for (let i = 0; i < 6; i++) g.fill(c.x + 6 + i * 9, c.x + 7 + i * 9, 15, 17, '.');
  },
  build: (w, c) => {
    const cols = Array.from({ length: 6 }, (_, i) => c.x + 6 + i * 9);
    const lifts: Lift[] = [
      { k: 1, at: 1.0, dur: 3.0 },
      { k: 3, at: 6.0, dur: 2.4 },
      { k: 3, at: 8.7, dur: 2.4 },
    ];
    liftSeams(w, c.x, cols, 'pat10c', [1, 2, 3, 4, 5, 6], lifts, px(c.x + 2));
    cart(w, px(c.x + 1), 2);
    sign(w, c.x + 1.2, 10.4, 3, 'SETU', 'shop', null, 'load: 2 sacks');
  },
};

/** Ashok Rajpath again: the cart's three sacks say which bell is the one that narrows the banners (the third), and the rolls
 *  only ever show the next swap, so the first two bells (which only grow them) teach you to stand where you are */
export const actRoll: Act = {
  id: 'pat10-roll',
  w: 38,
  advice: 'The coaching lane again, with a cart of three sacks at the foot: the banners grow at the first two bells, and only the third bell narrows them, from the right end for some and from the left for others. Each roll shows the next swap only. Wait on the first, plain hoarding until the third bell has rung, then cross.',
  cps: [5.5],
  paint: (g, c) => {
    g.fill(c.x + 4, c.x + 26, 15, 17, '.');
  },
  build: (w, c) => {
    const S: Hoard[] = [
      { c0: c.x + 4, w0: 4, swaps: [] },
      { c0: c.x + 8, w0: 4, swaps: [{ bell: 0, w: 6, anchor: 'L' }, { bell: 2, w: 4, anchor: 'R' }] },
      { c0: c.x + 15, w0: 3, swaps: [{ bell: 1, w: 6, anchor: 'L' }, { bell: 2, w: 4, anchor: 'L' }] },
      { c0: c.x + 21, w0: 5, swaps: [{ bell: 2, w: 4, anchor: 'L' }] },
    ];
    row(w, S, [2.0, 4.4, 6.8], px(c.x + 2), 'pat10r');
    jam(w, c.x + 4, c.x + 26, S);
    cart(w, px(c.x + 1), 3);
    sign(w, c.x + 1.2, 10.4, 3, 'RAJPATH', 'shop', null, 'load: 3 sacks');
  },
};

/** the shared tempo again, with sacks for riders: a sack loaded on the road side weighs as much as a rider */
export const actTempo: Act = {
  id: 'pat10-tempo',
  w: 86,
  advice: 'The shared tempo once more, and the sacks the porters load count as riders: one on the kerb side at the first halt, one on the road side at the second, which cancels it, and one comes off at the last. Stand opposite the heavier side before every hump and arch, and in the middle where it is level. A truck on the kerb side pulls the other way.',
  cps: [12, 38, 59],
  paint: () => {},
  build: (w, c) => {
    tempo(w, px(c.x + 4), { trigger: px(c.x + 2), rider: false });
    road(w, c, { stops: [[16, 1], [34, 1, 'L'], [56, -1]], trucks: [[22, 30], [44, 52, 'R']], scrapes: [[26, 'arch'], [40, 'arch'], [48, 'hump'], [64, 'arch']] }, [[1, 'ADDA', 'tempo stand']]);
    (w.flags.pat7 as { stopAt: number }).stopAt = c.X(74);
  },
};

export const act2: Act = {
  id: 'pat10-anaaj',
  w: 20,
  cp0: false,
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
