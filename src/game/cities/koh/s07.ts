// KOH-07 Kath ka Gari (marathon): a wooden cart down the lanes of Kohima. There is no brake: the cart rolls from each
// landing and gathers speed until the straw bale at the next. You steer by LEANING, which here is where you stand on
// the plank: at the back the nose lifts (it skims a pothole, it hits a low beam); at the front the nose drops (it
// ducks a beam, it drops into a pothole). Read the obstacle ahead and take your place early, because the cart only
// gets quicker. A slick patch spins the cart: for the next second your lean is mirrored, so lean out of it.
// Every landing is a hidden checkpoint; a ride is at most ~7 s.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { Rig, box, folk } from './entities';
import { FL, since, taraScript } from './common';
import { lines as L, NPC } from './lines';

export type ObKind = 'hole' | 'beam' | 'slick';
export interface Ob {
  /** world px of the obstacle */
  x: number;
  k: ObKind;
  done: boolean;
}
export interface Cart {
  deck: Rig;
  v: number;
  v0: number;
  a: number;
  /** tick the ride started (-1: waiting at the landing) */
  t0: number;
  /** px where the cart starts braking into the bale */
  stopX: number;
  obs: Ob[];
  stopped: boolean;
  /** -1 nose up (Dad at the back), 0 level, 1 nose down (Dad at the front) */
  nose: number;
  /** obstacles drawn faint, announced by sound (the mist stretch) */
  mist: boolean;
  /** a shed roof from x0 to x1: under it the beams are the shed's rafters, lower than a lane beam */
  shed?: [number, number];
}

export const DECK_W = 48;
/** the plank's solid is flush with the lane (Dad walks on to it); it is drawn 6 px above */
export const DECK_Y = FL;

/**
 * a cart waiting at column c0 that rolls right once Dad stands on it, speeding up from v0 to v1 px/s by the bale at
 * column cBale (it brakes into it). `obs`: [tiles from c0, kind].
 */
export function cart(w: World, c0: number, cBale: number, key: string, o: { v0: number; v1: number; obs: [number, ObKind][]; mist?: boolean; shed?: [number, number] }): Cart {
  const x0 = px(c0);
  const stopX = px(cBale) - DECK_W - 24;
  const dist = Math.max(1, stopX - x0);
  // v1^2 = v0^2 + 2 a dist
  const a = (o.v1 * o.v1 - o.v0 * o.v0) / (2 * dist);
  const st: Cart = { deck: null as any, v: 0, v0: o.v0, a, t0: -1, stopX, obs: o.obs.map(([t, k]) => ({ x: px(c0 + t), k, done: false })), stopped: false, nose: 0, mist: !!o.mist, shed: o.shed ? [px(o.shed[0]), px(o.shed[1])] : undefined };
  const deck = w.add(
    new Rig(x0, DECK_Y, DECK_W, 6, {
      solid: true,
      layer: 2,
      tick: (r, w2) => {
        const p = w2.player;
        const riding = w2.standing(r.solid!);
        if (st.t0 < 0) {
          if (riding) {
            st.t0 = w2.tick;
            st.v = st.v0;
            w2.sfx('creak', r.x, r.y);
          } else return;
        }
        // the lean: where Dad stands on the plank
        const rel = p.cx - (r.x + DECK_W / 2);
        st.nose = riding ? (rel > 5 ? 1 : rel < -5 ? -1 : 0) : 0;
        r.s.nose = st.nose;
        if (!st.stopped) {
          if (r.x < st.stopX) st.v = Math.min(st.v + st.a / 120, 400);
          else st.v = Math.max(0, st.v - 700 / 120);
          if (st.v === 0 && r.x >= st.stopX) {
            st.stopped = true;
            w2.sfx('thud', r.x + DECK_W, r.y);
          }
        }
        const nx = r.x + st.v / 120;
        const front = nx + DECK_W;
        for (const ob of st.obs) {
          if (ob.done || front < ob.x) continue;
          ob.done = true;
          if (!riding) continue;
          if (ob.k === 'slick') {
            w2.flipControls(1.3);
            w2.sfx('slide', ob.x, FL);
          } else if (ob.k === 'hole' && st.nose !== -1) {
            w2.sfx('crack', ob.x, FL);
            w2.die('koh-gaddha');
          } else if (ob.k === 'beam' && st.nose !== 1) {
            w2.sfx('bonk', ob.x, FL - 30);
            w2.die('koh-balli');
          }
          // the mist stretch: the next obstacle is announced by sound as this one is passed
          if (st.mist) {
            const next = st.obs.find((q) => !q.done);
            if (next) w2.sfx(next.k === 'hole' ? 'splash' : next.k === 'beam' ? 'creak' : 'slide', next.x, FL - 20);
          }
        }
        r.solid!.velX = st.v;
        if (nx !== r.x) r.moveTo(w2, nx, DECK_Y);
      },
      paint: (ctx, r, w2) => {
        const tilt = (r.s.nose ?? 0) * 3;
        const ry = r.y - 6;
        // wheels
        ctx.fillStyle = '#2B1A12';
        ctx.beginPath();
        ctx.arc(r.x + 9, FL - 5, 5, 0, Math.PI * 2);
        ctx.arc(r.x + DECK_W - 9, FL - 5, 5, 0, Math.PI * 2);
        ctx.fill();
        // the plank, tilted by the lean
        ctx.fillStyle = '#A1887F';
        ctx.beginPath();
        ctx.moveTo(r.x, ry + tilt);
        ctx.lineTo(r.x + DECK_W, ry - tilt);
        ctx.lineTo(r.x + DECK_W, ry - tilt + 5);
        ctx.lineTo(r.x, ry + tilt + 5);
        ctx.closePath();
        ctx.fill();
        // the front board
        box(ctx, r.x + DECK_W - 3, ry - 8 - tilt, 3, 10, '#6D4C41');
        void w2;
      },
    }),
  );
  // the front board keeps Dad on the plank (the back is open: lean too far back and you step off on to the scree)
  const board = (dx: number) =>
    w.add(
      new Rig(x0 + dx, DECK_Y - 10, 3, 10, {
        solid: true,
        layer: 2,
        tick: (r, w2) => {
          const nx = deck.x + dx;
          if (nx !== r.x) r.moveTo(w2, nx, DECK_Y - 10);
        },
        paint: () => {},
      }),
    );
  board(DECK_W - 3);
  // the obstacles and the bale
  w.add(
    new Paint((ctx, w2) => {
      const faint = st.mist ? 0.35 : 1;
      for (const ob of st.obs) {
        ctx.globalAlpha = ob.done ? 1 : faint;
        if (ob.k === 'hole') {
          box(ctx, ob.x - 2, FL - 1, 14, 6, '#1E130C');
          box(ctx, ob.x, FL - 2, 10, 1, '#5A3A28');
        } else if (ob.k === 'beam') {
          box(ctx, ob.x - 2, FL - 36, 6, 7, '#C9B870');
          box(ctx, ob.x - 2, FL - 36, 6, 2, '#E6D898');
          box(ctx, ob.x - 60, FL - 70, 2, 70, '#5D4037');
          box(ctx, ob.x + 4, FL - 70, 2, 70, '#5D4037');
          box(ctx, ob.x - 60, FL - 36, 66, 2, '#C9B870');
        } else {
          box(ctx, ob.x - 10, FL - 2, 30, 3, 'rgba(120,160,190,0.75)');
        }
      }
      ctx.globalAlpha = 1;
      if (st.shed) {
        box(ctx, st.shed[0], FL - 76, st.shed[1] - st.shed[0], 8, '#5D4037');
        for (let x = st.shed[0]; x < st.shed[1]; x += 48) box(ctx, x, FL - 68, 3, 68, '#5D4037');
      }
      if (st.mist) {
        ctx.fillStyle = 'rgba(214,226,232,0.45)';
        ctx.fillRect(x0 + DECK_W + 40, FL - 90, stopX - x0, 92);
      }
      // the straw bale
      box(ctx, px(cBale) - 16, FL - 18, 18, 18, '#D4B55A');
      box(ctx, px(cBale) - 16, FL - 12, 18, 1, '#8A7232');
      box(ctx, px(cBale) - 16, FL - 6, 18, 1, '#8A7232');
      void w2;
    }, -1),
  );
  // the lane between the landings is loose scree: on foot you go down with it; only the cart crosses it
  w.add(
    new Rig(x0 + DECK_W + 8, FL - 2, Math.max(0, stopX + 44 - (x0 + DECK_W + 8)), 30, {
      layer: 1,
      cause: 'koh-dhalan',
      inset: 0,
      live: (_r, w2) => !w2.standing(deck.solid!),
      paint: (ctx, r) => {
        ctx.fillStyle = 'rgba(90,58,40,0.55)';
        for (let x = r.x; x < r.x + r.w - 6; x += 9) ctx.fillRect(x, FL - 2 + ((x / 9) % 3), 5, 2);
      },
    }),
  );
  st.deck = deck;
  w.flags[key] = st;
  return st;
}

/** a step of road, no cart: the landing between rides */
const landing = (w: World, c: number, line?: string) => {
  w.add(
    new Paint((ctx) => {
      box(ctx, px(c), FL - 2, 32, 2, '#B07A52');
    }, -1),
  );
  if (line) w.when((w2) => w2.player.cx > px(c), (w2) => w2.guide(line));
};

export function room(): LevelDef {
  return {
    id: 'KOH-07',
    city: 'KOH',
    index: 7,
    name: 'Kath ka Gari',
    nameEn: 'The wooden cart',
    tagline: 'Downhill on a plank with wheels. There is no brake.',
    hint: 'The lane is loose scree: on foot you go down with it, so ride. Stand on the plank and it rolls, and it only gets quicker: there is no brake until the straw bale at the landing. Where you stand is the steering: at the back the nose lifts and skims a pothole; at the front the nose drops and ducks under a low beam. Read what is ahead and take your place early.',
    par: 40,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      cart(w, 6, 27, 'koh7', { v0: 90, v1: 130, obs: [[8, 'beam'], [13, 'hole']] });
      w.add(
        new Rig(px(3), 0, 1, 1, {
          paint: () => {},
          tick: (_r, w2) => {
            if (w2.tick === 1) tara(w2, L.taunt[1], 2.4);
          },
        }),
      );
      w.when(
        (w2) => w2.player.cx > px(3),
        (w2) => w2.guide(NPC.kewhi),
      );
      sign(w, 2, 10.4, 3.4, 'KATH GARI', 'shop', null, 'no brake');
      rival(w, 28, 15, -1, taraScript(7));
      collectible(w, 'koh-bamboo-shoot', 20, 11.6);
    },
  };
}

/** one ride: the cart waits 6 tiles in, the bale is 8 tiles before the act's end */
function ride(id: string, name: string, advice: string, wd: number, o: { v0: number; v1: number; obs: [number, ObKind][]; mist?: boolean; shed?: [number, number]; line?: string }): Act {
  return {
    id,
    w: wd,
    advice,
    cps: [],
    build: (w, c) => {
      landing(w, c.x + 1, o.line);
      cart(w, c.x + 6, c.x + wd - 7, c.f('cart'), { v0: o.v0, v1: o.v1, obs: o.obs, mist: o.mist, shed: o.shed ? [c.x + o.shed[0], c.x + o.shed[1]] : undefined });
      sign(w, c.x + 2, 10.4, 3, name, 'shop', null, '');
    },
  };
}

const A = 'The next lane: ';
export const acts: Act[] = [
  ride('koh07-mod', 'MOD', A + 'a hole, then a beam, then a hole. Back, front, back, each before the cart gets there.', 50, { v0: 100, v1: 140, obs: [[8, 'hole'], [16, 'beam'], [25, 'hole'], [33, 'beam']] }),
  ride('koh07-tez', 'TEZ', A + 'quicker, and the beams come in pairs: stay at the front through both, then back for the hole at the end.', 54, { v0: 110, v1: 170, obs: [[8, 'beam'], [14, 'beam'], [24, 'hole'], [31, 'beam'], [38, 'hole']] }),
  ride('koh07-chikna', 'CHIKNA', A + 'the shiny patch is wet: the cart spins on it and for a second your lean is mirrored. Lean the wrong way on purpose until it rights itself.', 54, { v0: 100, v1: 150, obs: [[9, 'hole'], [15, 'slick'], [22, 'beam'], [30, 'hole'], [38, 'beam']] }),
  ride('koh07-kohra', 'KOHRA', A + 'mist. You cannot see the lane, but each obstacle you pass sounds the next: a splash is a hole ahead, a creak is a beam.', 56, { v0: 100, v1: 150, obs: [[8, 'beam'], [16, 'hole'], [24, 'beam'], [32, 'hole'], [40, 'hole']], mist: true, line: NPC.cold }),
  ride('koh07-dhalan', 'DHALAN', A + 'the steepest: the cart is quickest here, so take your place the moment you are past the one before.', 58, { v0: 120, v1: 200, obs: [[8, 'hole'], [15, 'beam'], [22, 'hole'], [29, 'beam'], [36, 'hole'], [43, 'beam']] }),
  ride('koh07-dui-chikna', 'DUI CHIKNA', A + 'two wet patches. After the first your lean is mirrored; after the second it is mirrored again, back to normal.', 58, { v0: 100, v1: 160, obs: [[8, 'beam'], [14, 'slick'], [21, 'hole'], [27, 'slick'], [34, 'beam'], [42, 'hole']] }),
  ride('koh07-bazaar', 'BAZAAR', A + 'past the bazaar the beams are awnings, low and close together. Front, front, then a hole, then front again.', 56, { v0: 110, v1: 170, obs: [[8, 'beam'], [13, 'beam'], [20, 'hole'], [26, 'beam'], [31, 'beam'], [40, 'hole']] }),
  ride('koh07-kohra-dui', 'KOHRA DUI', A + 'mist again, and a wet patch in it: listen for the slide.', 58, { v0: 100, v1: 150, obs: [[8, 'hole'], [15, 'beam'], [22, 'slick'], [29, 'hole'], [36, 'beam'], [43, 'hole']], mist: true }),
  ride('koh07-chhaon', 'CHHAON', A + 'a long shed over the lane (the shelter beat): its rafters are beams, one after another, so stay at the front the whole way under it, and go back only for the hole where it ends.', 58, { v0: 100, v1: 150, obs: [[8, 'beam'], [12, 'beam'], [16, 'beam'], [20, 'beam'], [24, 'beam'], [31, 'hole'], [40, 'beam']], shed: [7, 26] }),
  ride('koh07-khonoma', 'KHONOMA', A + 'towards Khonoma: holes in a row, then one beam between them. Back, back, front, back.', 54, { v0: 100, v1: 150, obs: [[8, 'hole'], [14, 'hole'], [21, 'beam'], [28, 'hole'], [36, 'hole']] }),
  ride('koh07-jotsoma', 'JOTSOMA', A + 'the Jotsoma turn: a wet patch right after a beam, so the hole after it wants the mirrored lean.', 56, { v0: 110, v1: 160, obs: [[8, 'beam'], [12, 'slick'], [19, 'hole'], [27, 'beam'], [35, 'hole'], [42, 'beam']] }),
  ride('koh07-tez-dui', 'TEZ DUI', A + 'quicker again, and the gaps between the obstacles are short: commit early.', 56, { v0: 120, v1: 190, obs: [[8, 'hole'], [13, 'beam'], [18, 'hole'], [23, 'beam'], [29, 'hole'], [35, 'beam'], [42, 'hole']] }),
  ride('koh07-kohra-teen', 'KOHRA TEEN', A + 'the thickest mist: nothing to see at all. The sound after each obstacle names the next.', 58, { v0: 100, v1: 150, obs: [[8, 'hole'], [15, 'hole'], [22, 'beam'], [29, 'hole'], [36, 'beam'], [43, 'beam']], mist: true }),
  ride('koh07-bazaar-dui', 'BAZAAR DUI', A + 'the lower bazaar: awnings and potholes alternate, and a wet patch in the middle.', 58, { v0: 110, v1: 170, obs: [[8, 'beam'], [14, 'hole'], [20, 'beam'], [25, 'slick'], [31, 'hole'], [37, 'beam'], [44, 'hole']] }),
  ride('koh07-dhalan-dui', 'DHALAN DUI', A + 'the second steep lane: the quickest yet. Two beams, two holes, a beam.', 60, { v0: 130, v1: 210, obs: [[8, 'beam'], [14, 'beam'], [21, 'hole'], [27, 'hole'], [34, 'beam'], [42, 'hole']] }),
  ride('koh07-mod-teen', 'MOD TEEN', A + 'three bends: beam, hole, beam, hole, each a little closer than the last.', 56, { v0: 110, v1: 170, obs: [[8, 'beam'], [16, 'hole'], [23, 'beam'], [29, 'hole'], [34, 'beam'], [42, 'hole']] }),
  ride('koh07-chikna-teen', 'CHIKNA TEEN', A + 'three wet patches in one lane: mirrored, back, mirrored again. Count them.', 60, { v0: 100, v1: 160, obs: [[8, 'hole'], [12, 'slick'], [18, 'beam'], [23, 'slick'], [29, 'hole'], [34, 'slick'], [40, 'beam'], [47, 'hole']] }),
  ride('koh07-aakhri', 'AAKHRI', A + 'the last lane down to the garage: everything at once, and quick.', 60, { v0: 120, v1: 210, obs: [[8, 'beam'], [14, 'hole'], [20, 'beam'], [26, 'slick'], [32, 'hole'], [38, 'beam'], [45, 'hole']] }),
];

export const ending: Ending = {
  space: 14,
  advice: 'The garage door at the bottom of the lane opens only for a cart that bumps it nose first: ride the last cart at the FRONT all the way, and the door swings up. Walk in under it.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'garage-nose';
    const st = { open: false };
    w.flags.koh7g = st;
    const c = cart(w, D - 12, D - 1, 'koh7e', { v0: 90, v1: 120, obs: [] });
    // the door is shut until the cart's nose bumps it: a nose-up cart bumps the lintel instead and stops short, so you walk into a shut door (and back to the cart)
    const shut = w.add(
      new Rig(d.x, FL - 32, 16, 32, {
        solid: true,
        layer: 3,
        tick: (r, w2) => {
          if (!st.open && c.stopped && c.nose === 1) {
            st.open = true;
            r.setSolid(false);
            w2.sfx('creak', d.x, FL - 20);
          }
        },
        paint: (ctx, r) => {
          if (st.open) {
            box(ctx, r.x - 2, FL - 40, 20, 4, '#7A6A5A');
            return;
          }
          box(ctx, r.x, r.y, r.w, r.h, '#7A6A5A');
          box(ctx, r.x, r.y, r.w, 2, '#9A8A7A');
          for (let k = 6; k < r.h; k += 6) box(ctx, r.x, r.y + k, r.w, 1, '#5A4A3A');
        },
      }),
    );
    void shut;
    w.add(
      new Paint((ctx) => {
        box(ctx, d.x - 6, FL - 44, 28, 6, '#5D4037');
        box(ctx, d.x - 6, FL - 44, 4, 44, '#5D4037');
        box(ctx, d.x + 18, FL - 44, 4, 44, '#5D4037');
        folk(ctx, d.x + 30, FL - 26, 26, '#C0392B');
      }, -3),
    );
  },
};

export const meta07 = { family: 'downhill-cart-lean-steer', betrayals: ['cart-steer'], ending: 'koh-garage-nose' };
