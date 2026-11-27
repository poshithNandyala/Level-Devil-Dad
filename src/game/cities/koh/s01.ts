// KOH-01 Bhal ase, Kohima: the welcome tour with one Kohima bite. At the top of the lane stairs an open drain crosses
// the lane, and a bamboo handrail rod has been laid across it like a bridge. It is round: step on it and it rolls
// under your feet (your feet go backwards faster than you run) and after a moment it rolls out of its brackets and
// drops into the drain with you. Jump the drain; the rod is for hands.
import type { LevelDef, World } from '../../world';
import { tour } from '../../levels/tour';
import type { Grid } from '../../levels/grid';
import { Paint, tara } from '../../levels/endkit';
import { px } from '../../levels/kit';
import { Rig, box } from './entities';
import { FL, bamboo, ditch } from './common';
import { lines as L, NPC } from './lines';

/** the drain: open columns 65-67; the rod lies across them at floor level */
export const DRAIN = { x0: 65, x1: 67 };

function rod(w: World) {
  const st = { load: 0, gone: false, spin: 0 };
  w.flags.koh1 = st;
  ditch(w, px(DRAIN.x0), px(DRAIN.x1 + 1), 'koh-nala');
  const r = w.add(
    new Rig(px(DRAIN.x0), FL - 4, px(DRAIN.x1 - DRAIN.x0 + 1), 6, {
      solid: true,
      layer: 2,
      tick: (r2, w2) => {
        if (st.gone) {
          // falling into the drain
          r2.moveTo(w2, r2.x, Math.min(FL + 30, r2.y + 2.2));
          if (r2.y >= FL + 30) r2.on = false;
          return;
        }
        const on = w2.standing(r2.solid!);
        if (on) {
          st.load++;
          st.spin += 1;
          if (st.load >= 24) {
            // rolled out of its brackets: whoever is on it goes with it
            st.gone = true;
            r2.setSolid(false);
            w2.die('koh-rod');
            w2.sfx('thud', r2.x + r2.w / 2, FL);
          }
        } else st.load = Math.max(0, st.load - 2);
      },
      paint: (ctx, r2) => {
        if (!r2.on) return;
        bamboo(ctx, r2.x, r2.y, r2.w, r2.h, st.spin);
        // the brackets at both ends
        if (!st.gone) {
          box(ctx, r2.x - 1, FL - 8, 3, 8, '#5D4037');
          box(ctx, r2.x + r2.w - 2, FL - 8, 3, 8, '#5D4037');
        }
      },
    }),
  );
  // the rod is a roller: whoever stands on it is carried backwards
  r.solid!.slippery = true;
  r.solid!.velX = -150;
  w.onTick((w2) => {
    if (!st.gone && w2.standing(r.solid!)) w2.player.x -= 150 / 120;
  });
  w.add(
    new Paint((ctx) => {
      // the drain's walls
      box(ctx, px(DRAIN.x0) - 2, FL, 2, 24, '#4F2419');
      box(ctx, px(DRAIN.x1 + 1), FL, 2, 24, '#4F2419');
    }, -1),
  );
  w.when(
    (w2) => w2.player.cx > px(DRAIN.x0 - 9) && w2.player.cx < px(DRAIN.x0 - 2),
    (w2) => tara(w2, L.taunt[0], 2.2),
  );
}

export const tourLevel = (): LevelDef =>
  tour({
    id: 'KOH-01',
    city: 'KOH',
    name: 'Bhal ase, Kohima!',
    nameEn: 'Hello, Kohima!',
    tagline: 'Kewhi-ra, on the ridges. Mind the handrail.',
    lines: [L.hello, NPC.kewhi, NPC.cold, NPC.bhat, 'Thik thak, Dad? Hill is steep. | Fine, Dad? The hill is steep.', 'Thik thak! Aage jabi. | Great! Go ahead.'],
    shouts: [
      [18, NPC.paisa],
      [46, 'Galho khabi? Garom ase. | Will you eat galho? It’s hot.'],
    ],
    ride: 'cart',
    item: 'koh-galho',
    signs: [
      [8, 'BOC JUNCTION', 'line taxis'],
      [34, 'NAGA BAZAAR', 'baskets'],
      [100, 'KISAMA', '12 km'],
    ],
    props: [
      ['lamp', 4, {}],
      ['stall', 28, { label: 'GALHO' }],
      ['lamp', 58, {}],
      ['crowd', 80, { n: 2 }],
      ['lamp', 106, {}],
    ],
    things: [],
    hint: 'A walk round Kohima: hop the ditch, climb the lane stairs, hop the posts and the parked cart. At the top of the lane an open drain crosses it, with a bamboo handrail laid over it. It is round: stand on it and it rolls you backwards, then rolls out of its brackets and drops into the drain. Jump the drain.',
    cps: [20, 36, 50, 58, 75, 101],
    paint: (g: Grid) => {
      g.fill(DRAIN.x0, DRAIN.x1, 15, 16, '.');
    },
    extra: (w: World) => {
      rod(w);
    },
  });

export const meta01 = { family: 'rolling-handrail-rod', betrayals: ['grab-rolls'], ending: 'koh-tour-drain-rod' };
