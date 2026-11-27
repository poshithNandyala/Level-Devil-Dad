// ITA-03 Mithun Maidan: a row of mithun across a wet meadow. The ground between them is deep mud. A mithun grazing
// (head down) stands square in the lane and its back is a step; when it tosses its head up (the lift) it throws
// whoever is on it, and while its head is up it has wandered back out of the lane: there is nothing to land on. The
// herd follows the lead: the lead dips, the others dip after it in order, and lift in the same order. The young one
// is out of step: it grazes for a moment and lifts long before the others.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box } from './entities';
import { FL, since, taraScript } from './common';
import { lines as L, NPC } from './lines';

export interface Graze {
  /** first column of the animal (3 tiles wide) */
  c: number;
  /** seconds after the trigger it first dips */
  dip: number;
  /** seconds it grazes (head down, a step) */
  graze: number;
  /** seconds its head is up (gone from the lane) */
  up: number;
  /** a young one: smaller, out of step */
  young?: boolean;
}
export type Phase = 'up' | 'down' | 'lift';
export const LIFT = 0.5;

/** the animal's phase at `t` seconds after the trigger */
export function phaseAt(g: Graze, t: number): { ph: Phase; left: number } {
  if (t < g.dip) return { ph: 'up', left: g.dip - t };
  const P = g.graze + LIFT + g.up;
  const k = (t - g.dip) % P;
  if (k < g.graze) return { ph: 'down', left: g.graze - k };
  if (k < g.graze + LIFT) return { ph: 'lift', left: g.graze + LIFT - k };
  return { ph: 'up', left: P - k };
}

export interface Herd {
  t0: number;
  spec: Graze[];
  rigs: Rig[];
}

function mud(w: World, x0: number, x1: number) {
  w.add(
    new Rig(x0, FL + 10, x1 - x0, 40, {
      layer: 4,
      cause: 'ita-keechad',
      inset: 0,
      paint: (ctx, r) => {
        box(ctx, r.x, r.y - 6, r.w, 46, '#4A3A28');
        box(ctx, r.x, r.y - 6, r.w, 3, '#6A5A3A');
        for (let x = r.x + 6; x < r.x + r.w - 6; x += 17) box(ctx, x, r.y + 2, 6, 2, '#5E8C4A');
      },
    }),
  );
}

function mithunArt(ctx: CanvasRenderingContext2D, x: number, y: number, ph: Phase, young: boolean, k: number) {
  // a big dark bovine with pale legs and a wide forehead; head on the right
  const s = young ? 0.72 : 1;
  const bw = 48 * s,
    bh = 20 * s;
  const yy = ph === 'up' ? y - 10 : y;
  const alpha = ph === 'up' ? 0.55 : 1;
  ctx.save();
  ctx.globalAlpha = alpha;
  // legs
  for (const lx of [6, 14, bw - 16, bw - 8]) box(ctx, x + lx, yy + bh, 4, 24 * s - (ph === 'up' ? 6 : 0), '#D8CBB4');
  // body
  box(ctx, x, yy, bw, bh, '#2B241F');
  box(ctx, x, yy, bw, 3, '#4A3F36');
  // head: down (grazing) or up (tossing / alert)
  const hx = x + bw - 2;
  if (ph === 'down') {
    box(ctx, hx, yy + 8, 12, 18, '#2B241F');
    box(ctx, hx + 2, yy + 22, 10, 5, '#3A3028');
    box(ctx, hx - 2, yy + 4, 16, 3, '#E8E0D0');
  } else {
    const toss = ph === 'lift' ? Math.sin(k * Math.PI) * 10 : 0;
    box(ctx, hx, yy - 10 - toss, 12, 20, '#2B241F');
    box(ctx, hx - 4, yy - 14 - toss, 20, 4, '#E8E0D0');
    box(ctx, hx - 6, yy - 20 - toss, 4, 8, '#E8E0D0');
    box(ctx, hx + 14, yy - 20 - toss, 4, 8, '#E8E0D0');
  }
  ctx.restore();
}

/** a row of mithun from the trigger column; `key` holds the state for the tests */
export function herd(w: World, trigger: number, spec: Graze[], key: string): Herd {
  const st: Herd = { t0: -1, spec, rigs: [] };
  w.flags[key] = st;
  onPass(w, px(trigger), (w2) => {
    st.t0 = w2.tick;
  });
  for (const g of spec) {
    const wd = g.young ? 32 : 48;
    const r = w.add(
      new Rig(px(g.c), FL - 20, wd, 20, {
        solid: true,
        layer: 2,
        cause: 'ita-seeng',
        inset: 0,
        live: (r2) => r2.s.ph === 'lift',
        tick: (r2, w2) => {
          const t = st.t0 < 0 ? -1 : since(w2, st.t0);
          const { ph, left } = st.t0 < 0 ? { ph: 'up' as Phase, left: 99 } : phaseAt(g, t);
          r2.s.ph = ph;
          r2.s.left = left;
          r2.setSolid(ph !== 'up');
          // the toss: the deadly box is the back and the air over it
          r2.y = FL - 20;
          r2.h = 20;
          if (ph === 'lift') {
            r2.y = FL - 44;
            r2.h = 44;
          }
          if (ph === 'lift' && left > LIFT - 0.02) w2.sfx('snort', r2.x, r2.y);
        },
        paint: (ctx, r2) => mithunArt(ctx, r2.x, FL - 20, r2.s.ph ?? 'up', !!g.young, 1 - (r2.s.left ?? 0) / LIFT),
      }),
    );
    r.s.ph = 'up';
    r.setSolid(false);
    st.rigs.push(r);
  }
  return st;
}

const ROOM: Graze[] = [
  { c: 7, dip: 1.5, graze: 3.5, up: 3.0 },
  { c: 11, dip: 2.2, graze: 4.5, up: 3.0 },
  { c: 15, dip: 2.0, graze: 1.0, up: 2.0, young: true },
  { c: 19, dip: 3.6, graze: 4.5, up: 3.0 },
];

export function room(): LevelDef {
  return {
    id: 'ITA-03',
    city: 'ITA',
    index: 3,
    name: 'Mithun Maidan',
    nameEn: 'The mithun meadow',
    tagline: 'Big, calm, and chewing. Mostly calm.',
    hint: 'The meadow between the mithun is deep mud. A mithun grazing, head down, stands in the lane and its back is a step; when its head is up it has wandered back out of the lane and there is nothing to land on, and the toss as it lifts throws you. The herd follows the lead: the lead dips first and the others dip after it, in order. Go when the lead dips. The young one is out of step: it lifts long before the others, so wait on the one before it until it has tossed and dipped again.',
    par: 24,
    map: Grid.ground(15).fill(6, 22, 15, 17, '.').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      mud(w, px(6), px(23));
      herd(w, 3, ROOM, 'ita3');
      onPass(w, px(4), (w2) => tara(w2, L.intro[1], 2.4));
      w.add(new Paint((ctx) => box(ctx, px(2), FL - 30, 2, 30, '#8A6A3A'), -1));
      onPass(w, px(3), (w2) => w2.say(NPC.mithun, px(3), FL - 36, 2.2, 'npc'));
      sign(w, 2, 10.4, 3.4, 'MAIDAN', 'shop', null, 'the herd');
      rival(w, 28, 15, -1, taraScript(3));
      collectible(w, 'ita-momo', 13, 10.4);
    },
  };
}

const JHUND: Graze[] = [
  { c: 5, dip: 1.4, graze: 4.5, up: 3.0 },
  { c: 9, dip: 2.0, graze: 1.0, up: 2.0, young: true },
  { c: 13, dip: 2.6, graze: 4.5, up: 3.0 },
  { c: 17, dip: 3.3, graze: 4.5, up: 3.0 },
  { c: 21, dip: 2.4, graze: 1.0, up: 2.0, young: true },
  { c: 25, dip: 4.0, graze: 4.5, up: 3.0 },
];

/** act: a bigger herd with two young ones in it, the first right behind the lead */
export const act: Act = {
  id: 'ita03-jhund',
  w: 36,
  advice: 'A bigger herd, and two young ones in it: the second animal and the fifth. Go on the lead’s dip, and before each young one wait on the back behind it until it has tossed and dipped again, then cross it at once.',
  cps: [32],
  paint: (g, c) => {
    g.fill(c.x + 4, c.x + 28, 15, 17, '.');
  },
  build: (w, c) => {
    mud(w, c.X(4), c.X(29));
    herd(w, c.x + 1, JHUND.map((g) => ({ ...g, c: c.x + g.c })), 'ita3a');
    sign(w, c.x + 1, 10.4, 3, 'JHUND', 'shop', null, 'the big herd');
  },
};

// The door is plain. The pen gate held up by the grazing head ("cross while its head is down") was this stage's own
// graze-cycle rule a second time, not a new idea, and was cut.
export const meta03 = { family: 'living-platforms-graze-cycle', betrayals: ['graze-cycle'], ending: 'ita-plain-pen' };
