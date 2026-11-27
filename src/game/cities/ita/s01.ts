// ITA-01 Namaste Itanagar: the welcome tour with two bites at Ita Fort. The path runs over two low brick walls of the
// fort. Every brick has mortar round it except one: the loose brick (dark gap, a crack) is held by nothing, and the
// knock of a landing moves it. On the first wall it is under your feet and gives way on to the fort's old iron. On
// the second wall the loose brick is over your head, in the gate's arch, and it drops on whoever lands below it.
import type { LevelDef, World } from '../../world';
import { tour } from '../../levels/tour';
import type { Grid } from '../../levels/grid';
import { Paint, tara } from '../../levels/endkit';
import { onPass } from '../../levels/trolls';
import { px } from '../../levels/kit';
import { Rig, box, brick, perTick } from './entities';
import { lines as L, NPC } from './lines';

const FL = 240;
/** the two walls: first column of each; the loose brick's column; the arch's column */
export const WALLS = { a: 64, aLoose: 65, b: 78, bArch: 80 };

/** the iron under the loose brick: live once the brick has gone */
function iron(w: World, c: number, st: { gone: boolean }) {
  w.add(
    new Rig(px(c), FL - 30, 16, 30, {
      layer: 1,
      cause: 'ita-ita',
      inset: 3,
      live: () => st.gone,
      paint: (ctx, r) => {
        // the hollow in the wall; once the brick has gone, three rusted spikes stand up through it
        box(ctx, r.x, FL - 16, 16, 16, '#3F1A0E');
        if (st.gone) for (let i = 0; i < 3; i++) box(ctx, r.x + 2 + i * 5, FL - 28, 2, 26, '#6E5A4A');
      },
    }),
  );
}

/** the loose brick in the first wall's top: a solid that gives way the moment Dad stands on it */
function looseBrick(w: World, c: number) {
  const st = { gone: false, t: 0 };
  w.flags.ita1a = st;
  iron(w, c, st);
  const r = w.add(
    new Rig(px(c), FL - 16, 16, 16, {
      solid: true,
      layer: 2,
      tick: (b, w2) => {
        if (!st.gone && w2.standing(b.solid!)) {
          st.gone = true;
          st.t = w2.tick;
          w2.sfx('crack', b.x, b.y);
        }
        if (st.gone) {
          // it drops out of the wall and is gone
          b.setSolid(false);
          const k = (w2.tick - st.t) / 120;
          b.y = FL - 16 + Math.min(40, k * k * 400);
          if (k > 0.6) b.on = false;
        }
      },
      paint: (ctx, b) => brick(ctx, b.x, b.y, 16, 16, false, st.gone ? 0.3 : 0.06),
    }),
  );
  return r;
}

/** the arch over the second wall: its loose brick drops on whoever lands on the wall below it */
function archBrick(w: World, c: number) {
  const st = { falling: false, t: 0 };
  w.flags.ita1b = st;
  w.add(
    new Rig(px(c), FL - 16 - 54, 16, 14, {
      layer: 3,
      cause: 'ita-pop',
      inset: 2,
      live: () => st.falling,
      tick: (b, w2) => {
        const p = w2.player;
        if (!st.falling && p.onGround && p.cx >= b.x - 2 && p.cx < b.x + 16 && p.y + p.h <= FL - 15) {
          st.falling = true;
          st.t = w2.tick;
          w2.sfx('crack', b.x, b.y);
        }
        if (st.falling && b.y < FL - 16 - 14) b.y = Math.min(FL - 30, b.y + perTick(560) * Math.min(1.5, 0.4 + (w2.tick - st.t) / 40));
        if (st.falling && b.y >= FL - 30 && (w2.tick - st.t) / 120 > 0.9) b.on = false;
      },
      paint: (ctx, b) => brick(ctx, b.x, b.y, 16, 14, false, st.falling ? 0.2 : -0.08),
    }),
  );
  w.add(
    new Paint((ctx) => {
      // the gate's arch: two brick piers and a lintel of mortared bricks over the wall, the loose one in the middle
      const x = px(c);
      for (let y = FL - 16 - 54; y < FL - 16; y += 14) {
        brick(ctx, x - 18, y, 16, 14, true);
        brick(ctx, x + 18, y, 16, 14, true);
      }
      brick(ctx, x - 18, FL - 16 - 68, 16, 14, true);
      brick(ctx, x, FL - 16 - 68, 16, 14, true);
      brick(ctx, x + 18, FL - 16 - 68, 16, 14, true);
    }, -4),
  );
}

/** the walls' mortared bricks are ground tiles; draw them as bricks with mortar */
function wallArt(w: World, c0: number, skip: number) {
  w.add(
    new Paint((ctx) => {
      for (let c = c0; c < c0 + 4; c++) if (c !== skip) brick(ctx, px(c), FL - 16, 16, 16, true);
    }, 1),
  );
}

export const tourLevel = (): LevelDef =>
  tour({
    id: 'ITA-01',
    city: 'ITA',
    name: 'Namaste, Itanagar!',
    nameEn: 'Hello, Itanagar!',
    tagline: 'The capital of the dawn hills. Mind the fort’s bricks.',
    lines: [L.hello, NPC.sab, NPC.dhoop, NPC.pikaPila, NPC.momo, 'Subah jaldi aao, Dad. | Come early, Dad.'],
    shouts: [
      [18, NPC.pikaPila],
      [46, NPC.momo],
    ],
    ride: 'cart',
    item: 'ita-pikapila',
    signs: [
      [8, 'GANGA LAKE', 'Gyakar Sinyi'],
      [34, 'NAHARLAGUN RD', 'to the station'],
      [100, 'ITA FORT', 'ita = brick'],
    ],
    props: [
      ['lamp', 4, {}],
      ['stall', 28, { label: 'MOMO' }],
      ['lamp', 58, {}],
      ['crowd', 86, { n: 2 }],
      ['lamp', 108, {}],
    ],
    things: [],
    hint: 'A walk round Itanagar: hop the drain, climb the steps, hop the posts and the parked Sumo. Then two low walls of Ita Fort. Every brick has pale mortar round it but one: the loose brick has a dark gap and a crack, and the knock of a landing moves it. On the first wall it is under your feet and gives way: land on the mortared bricks. On the second wall it is over your head, in the arch: do not land under it.',
    cps: [20, 36, 50, 59, 72, 101],
    paint: (g: Grid) => {
      g.fill(WALLS.a, WALLS.a + 3, 14, 14, '#');
      g.put(WALLS.aLoose, 14, '.');
      g.fill(WALLS.b, WALLS.b + 3, 14, 14, '#');
    },
    extra: (w: World) => {
      wallArt(w, WALLS.a, WALLS.aLoose);
      wallArt(w, WALLS.b, -1);
      looseBrick(w, WALLS.aLoose);
      archBrick(w, WALLS.bArch);
      onPass(w, px(WALLS.a - 6), (w2) => tara(w2, L.intro[0], 2.4));
      onPass(w, px(WALLS.b - 6), (w2) => tara(w2, 'Rukna mat, kood jao! | Don’t stop, jump!', 2.2));
    },
  });

export const meta01 = { family: 'brick-hop-mortar-vs-loose', betrayals: ['brick-pop'], ending: 'ita-tour-fort-wall' };
