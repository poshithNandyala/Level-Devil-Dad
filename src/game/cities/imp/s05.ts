// IMP-05 Phumdi Dock: floating mats drift toward the anchored one and CLICK into it, and two mats that have
// clicked are one mat. The click is a shove: the whole merged mat lurches the way the newcomer was travelling,
// and whoever stands at the FAR end (the end away from the newcomer) is pitched into the lake; whoever stands at
// the closing seam is carried. So the read is: which mat arrives next, and from where? Its wake says. Stand at
// THAT seam. The gap you are looking at is not the one that closes first.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, matArt, perTick } from './entities';
import { FL, hut, lake, since, taraScript } from './common';
import { lines as L, NPC } from './lines';

export const LURCH = { zone: px(1.6), dur: 0.35 };

export interface MatSpec {
  /** left column at the start */
  c: number;
  /** width in tiles */
  w: number;
  /** drift px/s (sign = direction); 0 = the anchored mat */
  v: number;
  /** reeds drawn on it */
  reeds?: boolean;
  hut?: boolean;
  /** the mat starts under the pier: sunk and not solid until its left edge passes this column */
  under?: number;
}
export interface DockState {
  t0: number;
  mats: Rig[];
  /** the merged body's extent in px */
  body: [number, number];
  /** last click: tick and the far edge side (-1 left end, 1 right end) */
  click: { t: number; far: -1 | 1 } | null;
  clicks: number;
}

/** a dock of drifting mats; the clock starts when Dad passes `trigger` (tile x) */
export function dock(w: World, key: string, specs: MatSpec[], trigger: number) {
  const st: DockState = { t0: -1, mats: [], body: [0, 0], click: null, clicks: 0 };
  w.flags[key] = st;
  const anchored = specs.findIndex((m) => m.v === 0);
  st.body = [px(specs[anchored].c), px(specs[anchored].c + specs[anchored].w)];
  specs.forEach((m, i) => {
    const r = w.add(
      new Rig(px(m.c), FL - 6, px(m.w), 10, {
        layer: -4, // behind the tiles: a mat starting under the pier is hidden until it drifts out
        solid: true,
        tick: (rr, w2) => {
          if (st.t0 < 0 || rr.s.v === 0) return;
          if (m.under !== undefined && rr.solid!.collidable === false && rr.x + rr.w >= px(m.under)) {
            rr.setSolid(true);
            rr.moveTo(w2, rr.x, FL - 6);
          }
          const nx = rr.x + perTick(rr.s.v);
          // touching the body: snap to it, stop, and the body lurches the way this mat was going
          if (rr.s.v > 0 && nx + rr.w >= st.body[0]) {
            rr.moveTo(w2, st.body[0] - rr.w, rr.y);
            st.body[0] = rr.x;
            rr.s.v = 0;
            st.click = { t: w2.tick, far: 1 };
            st.clicks++;
            w2.sfx('thud', rr.x + rr.w, FL - 4);
          } else if (rr.s.v < 0 && nx <= st.body[1]) {
            rr.moveTo(w2, st.body[1], rr.y);
            st.body[1] = rr.x + rr.w;
            rr.s.v = 0;
            st.click = { t: w2.tick, far: -1 };
            st.clicks++;
            w2.sfx('thud', rr.x, FL - 4);
          } else rr.moveTo(w2, nx, rr.y);
        },
        paint: (ctx, rr, w2) => {
          matArt(ctx, rr.x, rr.y, rr.w, rr.h + 6, { reeds: m.reeds });
          if (m.hut) hut(ctx, rr.x + rr.w / 2 - 15, rr.y + 1);
          // the wake: ripples trailing a drifting mat on the side it comes from
          if (rr.s.v !== 0 && st.t0 >= 0) {
            const dir = Math.sign(rr.s.v);
            ctx.strokeStyle = 'rgba(220,240,235,0.6)';
            ctx.lineWidth = 1;
            for (let i = 1; i <= 3; i++) {
              const x = dir > 0 ? rr.x - i * 7 - ((w2.tick / 6) % 7) : rr.x + rr.w + i * 7 + ((w2.tick / 6) % 7);
              ctx.beginPath();
              ctx.moveTo(x, rr.y + 4);
              ctx.lineTo(x - dir * 4, rr.y + 8);
              ctx.stroke();
            }
          }
        },
      }),
    );
    r.s.v = m.v;
    r.s.i = i;
    if (m.under !== undefined) {
      r.setSolid(false);
      r.moveTo(w, r.x, FL + 8);
    }
    st.mats.push(r);
  });
  // the lurch: the far end of the body pitches whoever stands there for a moment after a click
  w.add(
    new Rig(0, FL - 30, LURCH.zone, 30, {
      layer: 3,
      cause: 'imp-lurch',
      inset: 1,
      live: (_r, w2) => !!st.click && since(w2, st.click.t) < LURCH.dur,
      tick: (r) => {
        if (!st.click) return;
        r.x = st.click.far < 0 ? st.body[0] : st.body[1] - LURCH.zone;
      },
      paint: (ctx, r, w2) => {
        if (!st.click || since(w2, st.click.t) >= LURCH.dur + 0.2) return;
        // spray at the far end
        for (let i = 0; i < 5; i++) box(ctx, r.x + i * 5 + 1, FL - 14 - (i % 3) * 4, 3, 3, 'rgba(220,240,235,0.8)');
      },
    }),
  );
  onPass(w, px(trigger), (w2) => {
    if (st.t0 < 0) st.t0 = w2.tick;
  });
  return st;
}

/** the room: the anchored mat has a hut pole; a small mat from the bank side comes first (fast, close), the big one
 * ahead comes second (slow, far). The eye goes to the big one. */
export const ROOM_MATS: MatSpec[] = [
  { c: 7, w: 6, v: 0, hut: true },
  { c: 1, w: 3, v: 30, under: 5 },
  { c: 16, w: 5, v: -16, reeds: true },
];

export function room(): LevelDef {
  return {
    id: 'IMP-05',
    city: 'IMP',
    index: 5,
    name: 'Phumdi Dock',
    nameEn: 'The floating dock',
    tagline: 'Mats drift in and click together. A click is a shove.',
    hint: 'Drifting mats click into the anchored one and become one mat, and the click shoves the whole mat the way the newcomer was going: whoever stands at the far end is pitched into the lake, whoever stands at the closing seam is carried. Read the wakes: the mat that arrives first is not always the one you are looking at. Stand at the seam that closes next, then the next, then cross.',
    par: 50,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').fill(5, 19, 15, 17, '.').rows(),
    build(w: World) {
      door(w);
      lake(w, 5, 20);
      dock(w, 'imp5', ROOM_MATS, 7.2);
      onPass(w, px(3), (w2) => tara(w2, L.intro[3], 2.2));
      sign(w, 1.5, 10.4, 3.6, 'PHUMDI', 'green', null, 'floating dock');
      rival(w, 29.5, 15, -1, taraScript(5));
      collectible(w, 'imp-kauna', 10, 10.6);
      w.add(new Paint((ctx) => box(ctx, px(4) + 8, FL - 26, 3, 26, '#6E4B2A'), -2));
    },
  };
}

/** act 1: your mat is the anchored one again, but three mats come: a near slow one ahead, a far fast one from behind
 * that overtakes it, then the one ahead. Two seams to be at, in the right order. */
export const act: Act = {
  id: 'imp05-ahum',
  w: 44,
  advice: 'Three mats come to the anchored one: the one ahead is close but slow; the one from behind is far but fast and clicks first. Be at the back seam for it, then at the front seam for the slow one, then the third comes from behind again: back seam. Cross when all three are one.',
  cps: [30],
  paint: (g, c) => {
    g.fill(c.x + 3, c.x + 27, 15, 17, '.');
  },
  build: (w, c) => {
    lake(w, c.x + 3, c.x + 28);
    dock(
      w,
      'imp5b',
      [
        { c: c.x + 14, w: 6, v: 0, hut: true },
        { c: c.x + 24, w: 5, v: -14, reeds: true },
        { c: c.x + 4, w: 4, v: 60 },
        { c: c.x - 2, w: 3, v: 22, under: c.x + 3 },
      ],
      c.x + 3.5,
    );
    sign(w, c.x + 1.5, 10.4, 3.4, 'PHUMSHANG', 'shop', null, 'the hut on the mat');
    onPass(w, c.X(3), (w2) => w2.say(NPC.excuse, c.X(17), FL - 60, 2.2, 'npc'));
  },
};

/** act 2: the clicks come from one side twice, then the other: the far end swaps as the body grows */
export const act2: Act = {
  id: 'imp05-yaam',
  w: 46,
  advice: 'Two mats come from the front one after the other, then one from behind. At each click the far end is the one to be away from: after two clicks from the front the far end is the back, so for the third click walk forward to the back seam... which is now where you began. Read each wake before you move.',
  cps: [34],
  paint: (g, c) => {
    g.fill(c.x + 3, c.x + 25, 15, 17, '.');
  },
  build: (w, c) => {
    lake(w, c.x + 3, c.x + 26);
    dock(
      w,
      'imp5c',
      [
        { c: c.x + 10, w: 5, v: 0, hut: true },
        { c: c.x + 20, w: 4, v: -40 },
        { c: c.x + 26, w: 4, v: -12, reeds: true },
        { c: c.x + 5, w: 3, v: 6 },
      ],
      c.x + 3.5,
    );
    sign(w, c.x + 43, 10.4, 3.4, 'SENDRA', 'green', null, 'the island');
  },
};

export const meta05 = { family: 'drifting-mats-merge-seam', betrayals: ['merge-seam'], ending: 'imp-hut-door-plain' };
