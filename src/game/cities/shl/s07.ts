// SHL-07 Mawsmai (marathon, round 1: the room and its first beat): the limestone cave at Sohra. Stalactites hang
// over the path and grow one step towards the floor at every drip you hear; a stalactite that has met its stump is
// a wall, and it stays shut a moment before it breaks and starts again. Pass each while it is open. A jump that
// bumps one stops its growth for a few drips, but only that one, and only for a while.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box } from './entities';
import { taraScript, FL } from './common';
import { lines as L } from './lines';

/** Dad fits under a tip while the gap to the floor is at least this (px) */
export const FIT = 18;

export interface Stal {
  c: number;
  /** gap between the tip and the floor, px */
  gap: number;
  closed: (w: World) => boolean;
  s: { period: number; step: number; g0: number; shut: number; freeze: number; lastDrip: number; shutAt: number };
}

/**
 * A stalactite over column c: starts `g0` px off the floor, grows `step` px at every drip (`period` s), is a wall for
 * `shut` s once it meets the floor, then breaks and starts again. A head bump freezes its growth for 3 s.
 */
export function stal(w: World, list: Stal[], c: number, o: { g0: number; step: number; period: number; shut?: number; phase?: number }) {
  const s = { period: o.period, step: o.step, g0: o.g0, shut: o.shut ?? 2.0, freeze: 0, lastDrip: -1, shutAt: -1 };
  const st: Stal = { c, gap: o.g0, closed: () => st.gap < FIT, s };
  list.push(st);
  const phase = o.phase ?? 0;
  w.add(
    new Rig(px(c), 0, 16, FL, {
      layer: 3,
      cause: 'shl-maw',
      inset: 2,
      live: () => st.gap < FIT,
      tick: (r, w2) => {
        const p = w2.player;
        const inside = p.x + p.w > r.x + 2 && p.x < r.x + r.w - 2;
        if (st.s.shutAt >= 0) {
          // shut: breaks after `shut` seconds and starts again from the top
          if ((w2.tick - st.s.shutAt) / 120 >= st.s.shut) {
            st.s.shutAt = -1;
            st.gap = st.s.g0;
            w2.sfx('snap', r.x + 8, FL - 40);
          }
          return;
        }
        if (st.s.freeze > 0) st.s.freeze--;
        // the drip: one step of growth per period
        const k = Math.floor((w2.tick / 120 + phase) / st.s.period);
        if (st.s.lastDrip < 0) st.s.lastDrip = k;
        if (k !== st.s.lastDrip) {
          st.s.lastDrip = k;
          if (st.s.freeze <= 0) {
            st.gap = Math.max(0, st.gap - st.s.step);
            w2.sfx('click', r.x + 8, FL - st.gap);
            if (st.gap < FIT) {
              st.s.shutAt = w2.tick;
              // the cause: it came down on you, or you walked into a wall
              if (r.hazard) r.hazard.cause = inside ? 'shl-maw' : 'shl-shut';
            }
          }
        }
        // a head bump while open freezes it for 3 s
        if (inside && st.gap >= FIT && p.y <= FL - st.gap + 2 && p.vy < 0 && st.s.freeze <= 0) {
          st.s.freeze = 360;
          w2.sfx('bonk', r.x + 8, FL - st.gap);
        }
        if (!inside && r.hazard && st.gap < FIT) r.hazard.cause = 'shl-shut';
      },
      paint: (ctx, r, w2) => {
        const tipY = FL - st.gap;
        // the stalactite: a pale tapering cone from the cave roof to the tip
        ctx.fillStyle = st.s.freeze > 0 ? '#D9E4DC' : '#C9D3CC';
        ctx.beginPath();
        ctx.moveTo(r.x - 2, 0);
        ctx.lineTo(r.x + 18, 0);
        ctx.lineTo(r.x + 8, tipY);
        ctx.closePath();
        ctx.fill();
        box(ctx, r.x + 6, tipY - 6, 4, 6, '#AEBBB3');
        // the stump on the floor
        ctx.fillStyle = '#AEBBB3';
        ctx.beginPath();
        ctx.moveTo(r.x, FL);
        ctx.lineTo(r.x + 16, FL);
        ctx.lineTo(r.x + 8, FL - 6);
        ctx.closePath();
        ctx.fill();
        // the drip on its way down
        if (st.gap >= FIT && st.s.shutAt < 0) {
          const t = (((w2.tick / 120 + phase) % st.s.period) + st.s.period) % st.s.period;
          const k = t / st.s.period;
          box(ctx, r.x + 7, tipY + (FL - tipY) * k, 2, 4, '#BFE0F0');
        }
        if (st.gap < FIT) box(ctx, r.x + 2, 0, 12, FL, 'rgba(201,211,204,0.9)');
      },
    }),
  );
  return st;
}

export function cave(w: World, c0: number, c1: number) {
  w.add(
    new Paint((ctx) => {
      box(ctx, px(c0), 0, px(c1 - c0 + 1), 70, '#2A352F');
      for (let x = px(c0); x < px(c1 + 1); x += 22) box(ctx, x + 6, 70, 6, 10 + ((x * 7) % 9), '#3A4842');
    }, -2),
  );
}

export function room(): LevelDef {
  return {
    id: 'SHL-07',
    city: 'SHL',
    index: 7,
    name: 'Mawsmai',
    nameEn: 'The growing cave',
    tagline: 'Every drip you hear is a step closer to the floor.',
    hint: 'Stalactites hang over the path. At every drip one grows a step towards the floor; when it meets its stump it is a wall for a moment, then it breaks and starts again from the top. Pass each while there is room under it: count the drips, go when it has just broken. A jump that bumps one freezes it for a few drips, but only that one.',
    par: 40,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const list: Stal[] = [];
      w.flags.shl7 = list;
      cave(w, 0, 31);
      stal(w, list, 9, { g0: 60, step: 10, period: 1.0, phase: 0.2 });
      stal(w, list, 15, { g0: 54, step: 10, period: 0.7, phase: 0.5 });
      stal(w, list, 22, { g0: 60, step: 10, period: 0.55, phase: 0.5 });
      onPass(w, px(4), (w2) => tara(w2, L.intro[5], 2.2));
      sign(w, 3, 10.2, 3, 'MAWSMAI', 'shop', null, 'limestone cave');
      rival(w, 29, 15, -1, taraScript(7));
      collectible(w, 'shl-pumaloi', 18.5, 11.4);
    },
  };
}

/** act: the narrow gallery, the labelled momentum beat: eight stalactites dripping fast; once you go, keep going */
export const act: Act = {
  id: 'shl07-krem',
  w: 36,
  advice: 'The narrow gallery: seven stalactites, all dripping fast and all starting high together. Once the first has broken, go, and keep going: a stop under any of them is the end of the gallery for you.',
  cps: [2],
  paint: () => {},
  build: (w, c) => {
    const list = w.flags.shl7 as Stal[];
    cave(w, c.x, c.x + 35);
    for (let i = 0; i < 7; i++) stal(w, list, c.x + 6 + i * 3.5, { g0: 70, step: 10, period: 0.7, shut: 1.6, phase: 0.0 });
    sign(w, c.x + 2, 10.4, 3, 'KREM', 'shop', null, 'the gallery');
  },
};

/** ending: the column that has just closed behind the door's arch: pass as it breaks */
export const ending: Ending = {
  space: 12,
  advice: 'One last stalactite over the door’s arch, the slowest in the cave: wait for it to meet the floor and break, then walk through.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    const list = w.flags.shl7 as Stal[];
    w.flags.twist = 'column';
    cave(w, D - 12, D + 4);
    stal(w, list, D - 3, { g0: 60, step: 12, period: 1.4, shut: 2.4, phase: 0.3 });
  },
};

export const meta07 = { family: 'drip-growth-gate-pairs', betrayals: ['drip-growth'], ending: 'shl-column' };
