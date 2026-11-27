// ITA-02 Ek Ek Karke: the cane bridge over the river. One lane of slats; porters come across from the far end and
// nothing passes on the deck. Bays hang under the deck: a shallow one (a seat one tile down) and a deep one (two
// tiles down, on long cane loops). A head-load porter clears any bay. The porter dragging a cane bundle does not:
// his bundle hangs over the edge and sweeps the shallow bay. Read the load, take the deep bay.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, folk, perTick } from './entities';
import { FL, since, taraScript } from './common';
import { lines as L, NPC } from './lines';

export interface Porter {
  /** seconds after the trigger he steps on at the far end */
  at: number;
  /** px/s */
  v: number;
  /** drags a cane bundle that hangs below the deck (sweeps the shallow bays) */
  bundle?: boolean;
}
export interface Deck {
  t0: number;
  c0: number;
  c1: number;
  porters: Rig[];
  spec: Porter[];
}

/** the river under the deck */
function river(w: World, x0: number, x1: number) {
  w.add(
    new Paint((ctx, w2) => {
      box(ctx, x0, FL + 16, x1 - x0, 32, '#5A7A6A');
      ctx.strokeStyle = 'rgba(230,240,235,0.45)';
      ctx.lineWidth = 0.8;
      for (let x = x0 + ((w2.tick * 0.4) % 18); x < x1 - 8; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, FL + 24);
        ctx.lineTo(x + 8, FL + 24);
        ctx.stroke();
      }
    }, -3),
  );
}

/** the deck art: slats and the cane handrail loops */
function deckArt(w: World, c0: number, c1: number, bays: { c: number; deep: boolean }[]) {
  w.add(
    new Paint((ctx) => {
      for (let c = c0; c <= c1; c++) {
        if (bays.some((b) => c === b.c || c === b.c + 1)) continue;
        box(ctx, px(c), FL - 3, 16, 3, '#A88A4A');
        box(ctx, px(c) + 2, FL - 3, 2, 3, '#6B5A2A');
        box(ctx, px(c) + 9, FL - 3, 2, 3, '#6B5A2A');
      }
      // the handrail: a cane rope sagging between posts
      ctx.strokeStyle = '#C9B06A';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px(c0), FL - 30);
      for (let c = c0; c < c1; c += 6) ctx.quadraticCurveTo(px(c) + 48, FL - 22, px(c) + 96, FL - 30);
      ctx.stroke();
      for (let c = c0; c <= c1; c += 6) box(ctx, px(c) + 7, FL - 32, 2, 32, '#8A6A3A');
      // the bays: cane loops down to the seat
      for (const b of bays) {
        const depth = b.deep ? 32 : 16;
        box(ctx, px(b.c) + 2, FL, 2, depth, '#C9B06A');
        box(ctx, px(b.c) + 28, FL, 2, depth, '#C9B06A');
        box(ctx, px(b.c), FL + depth - 3, 32, 3, '#A88A4A');
      }
    }, 1),
  );
}

/** porters crossing the deck from the far end, each on his cue; `key` holds the state for the tests */
export function deck(w: World, c0: number, c1: number, trigger: number, spec: Porter[], bays: { c: number; deep: boolean }[], key: string, period = 0): Deck {
  const st: Deck = { t0: -1, c0, c1, porters: [], spec };
  w.flags[key] = st;
  river(w, px(c0) - 8, px(c1 + 1) + 8);
  deckArt(w, c0, c1, bays);
  onPass(w, px(trigger), (w2) => {
    st.t0 = w2.tick;
  });
  spec.forEach((p, i) => {
    const r = w.add(
      new Rig(px(c1 + 1), FL - 28, 12, 28, {
        layer: 3,
        cause: 'ita-bhaar',
        inset: 1,
        live: (r2) => r2.on,
        tick: (r2, w2) => {
          if (st.t0 < 0) {
            r2.on = false;
            return;
          }
          let t = since(w2, st.t0) - p.at;
          if (period > 0 && t >= 0) t = t % period;
          if (t < 0) {
            r2.on = false;
            return;
          }
          r2.x = Math.max(px(c0) - 30, px(c1 + 1) - t * p.v);
          r2.on = r2.x > px(c0) - 30;
          r2.s.t = t;
        },
        paint: (ctx, r2, w2) => {
          const step = ((w2.tick >> 3) % 2) as number;
          folk(ctx, r2.x + 6, r2.y + step, 28, p.bundle ? '#2F6B4F' : '#D7262E', { load: p.bundle ? undefined : '#C9B06A' });
          if (p.bundle) {
            // the cane bundle on his shoulder, trailing behind him and over the edge of the deck
            box(ctx, r2.x + 8, r2.y + 4, 30, 4, '#C9B06A');
            box(ctx, r2.x + 26, r2.y + 6, 4, 46, '#C9B06A');
            box(ctx, r2.x + 30, r2.y + 8, 3, 40, '#A88A4A');
          }
        },
      }),
    );
    r.on = false;
    st.porters.push(r);
    if (p.bundle) {
      // the bundle's trailing end: a deadly box hanging below the deck behind him, one tile deep
      w.add(
        new Rig(0, FL - 2, 14, 18, {
          layer: 3,
          cause: 'ita-bans',
          inset: 1,
          live: () => r.on,
          tick: (b) => {
            b.x = r.x + 24;
            b.on = r.on;
          },
          paint: () => {},
        }),
      );
    }
    void i;
  });
  return st;
}

/** a bay: two columns of the deck open, a one-way seat one tile (shallow) or two tiles (deep) below */
export function carveBay(g: Grid, c: number, deep: boolean) {
  for (const cc of [c, c + 1]) {
    g.put(cc, 15, '.');
    if (deep) g.put(cc, 16, '.');
    g.put(cc, deep ? 17 : 16, '=');
  }
}

const BAYS_ROOM = [
  { c: 12, deep: false },
  { c: 18, deep: true },
];

export function room(): LevelDef {
  return {
    id: 'ITA-02',
    city: 'ITA',
    index: 2,
    name: 'Ek Ek Karke',
    nameEn: 'One at a time',
    tagline: 'A cane bridge, one lane wide. Someone is already on it.',
    hint: 'The cane bridge is one lane: a porter steps on at the far end and walks at you, and nothing passes him on the deck. Bays hang under the deck: a shallow seat one tile down, and a deep one on long loops. A porter with a basket on his head clears either. The one dragging a cane bundle does not: it hangs over the edge and sweeps the shallow bay. Read the load, get into the deep bay before he reaches you, and climb out when both have gone by.',
    par: 22,
    map: (() => {
      const g = Grid.ground(15).put(1, 14, '@').put(30, 14, 'E');
      // the river under the deck, the two bays carved down into it
      g.fill(6, 27, 16, 17, '.');
      for (const b of BAYS_ROOM) carveBay(g, b.c, b.deep);
      return g.rows();
    })(),
    build(w: World) {
      door(w);
      deck(w, 6, 27, 7, [{ at: 0, v: 52 }, { at: 3.2, v: 56, bundle: true }], BAYS_ROOM, 'ita2');
      onPass(w, px(7), (w2) => tara(w2, L.intro[0], 2.4));
      w.add(
        new Paint((ctx) => {
          // a local at the near end, by the bridge post
          folk(ctx, px(4) + 8, FL - 28, 28, '#F2D16B');
        }, -1),
      );
      onPass(w, px(3), (w2) => w2.say(NPC.ekEk, px(4) + 8, FL - 34, 2.2, 'npc'));
      sign(w, 2, 10.4, 3.4, 'SIANG PUL', 'shop', null, 'cane bridge');
      rival(w, 29, 15, -1, taraScript(2));
      collectible(w, 'ita-pikapila', 15, 11.4);
    },
  };
}

const BAYS_ACT = [
  { c: 9, deep: false },
  { c: 16, deep: false },
  { c: 22, deep: true },
  { c: 29, deep: false },
];

/** act: a longer deck; a head-load porter first, then two bundles close together; only the deep bay in the middle is clear */
export const act: Act = {
  id: 'ita02-dusra',
  w: 42,
  advice: 'The long span: three porters this time, a basket first and then two cane bundles close behind. Only the deep bay in the middle of the span clears a bundle, so be in it before the first bundle reaches you, and wait there until all three have gone by.',
  cps: [37],
  paint: (g, c) => {
    g.fill(c.x + 4, c.x + 35, 16, 17, '.');
    for (const b of BAYS_ACT) carveBay(g, c.x + b.c, b.deep);
  },
  build: (w, c) => {
    deck(w, c.x + 4, c.x + 35, c.x + 5, [{ at: 0, v: 54 }, { at: 3.0, v: 58, bundle: true }, { at: 5.6, v: 58, bundle: true }], BAYS_ACT.map((b) => ({ c: c.x + b.c, deep: b.deep })), 'ita2a');
    sign(w, c.x + 1, 10.4, 3, 'LAMBA PUL', 'shop', null, 'the long span');
  },
};

/** ending: the far bank's cane gate is held open by the weight on the deck: it stays up while a porter is on the span and
 *  slams down when the span is empty. Cross the last stretch right behind the porter, not after he has stepped off. */
export const ending: Ending = {
  space: 20,
  advice: 'The gate on the far bank is a cane bar on a counterweight: it hangs open while a porter is on the last span and slams down the moment the span is empty. Let him pass you in the bay, then follow close behind him and go through while he still holds it open.',
  paint: (g, D) => {
    g.fill(D - 16, D - 3, 16, 17, '.');
    carveBay(g, D - 10, true);
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'gate';
    const st = deck(w, D - 16, D - 3, D - 24, [{ at: 0, v: 50 }], [{ c: D - 10, deep: true }], 'ita2e', 11);
    const gate = { down: 1, t: 0 };
    w.flags.ita2g = gate;
    // the gate bar: a cane pole across the path just before the door; solid when down, deadly while falling
    const bar = w.add(
      new Rig(px(D - 2), FL - 40, 8, 40, {
        layer: 3,
        solid: true,
        cause: 'ita-phatak',
        inset: 0,
        live: () => gate.t > 0,
        tick: (b, w2) => {
          const porter = st.porters[0];
          const onSpan = porter.on && porter.x > px(D - 16) - 8;
          const target = onSpan ? 0 : 1;
          const prev = gate.down;
          gate.down += (target - gate.down) * (target > gate.down ? 0.08 : 0.04);
          if (Math.abs(target - gate.down) < 0.01) gate.down = target;
          gate.t = target === 1 && prev < 0.98 && gate.down > 0.2 ? 1 : 0;
          const h = Math.round(gate.down * 40);
          b.setSolid(gate.down > 0.5);
          b.moveTo(w2, px(D - 2), FL - h);
          b.h = h;
          if (b.solid) b.solid.h = Math.max(1, h);
        },
        paint: (ctx, b) => {
          box(ctx, b.x, b.y, 8, b.h, '#C9B06A');
          box(ctx, b.x + 8, FL - 48, 3, 48, '#8A6A3A');
          box(ctx, b.x - 6, FL - 50 - Math.round((1 - gate.down) * 20), 20, 6, '#6B5A2A');
        },
      }),
    );
    bar.s.gate = gate;
    void perTick;
  },
};

export const meta02 = { family: 'one-lane-bridge-oncoming-bays', betrayals: ['oncoming-bay'], ending: 'ita-phatak' };
