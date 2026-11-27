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
  s: { period: number; step: number; g0: number; shut: number; freeze: number; lastDrip: number; shutAt: number; stump: number; bumpAt?: number };
}

/**
 * A stalactite over column c: starts `g0` px off the floor, grows `step` px at every drip (`period` s), is a wall for
 * `shut` s once it meets the floor, then breaks and starts again. A head bump freezes its growth for 3 s.
 */
export function stal(w: World, list: Stal[], c: number, o: { g0: number; step: number; period: number; shut?: number; phase?: number; from?: number; startGap?: number; minGap?: number; pairStep?: number; pillar?: boolean; wet?: boolean }) {
  const s = { period: o.period, step: o.step, g0: o.g0, shut: o.shut ?? 2.0, freeze: 0, lastDrip: -1, shutAt: -1, stump: 6 };
  const st: Stal = { c, gap: o.startGap ?? o.g0, closed: () => st.gap < FIT, s };
  list.push(st);
  const phase = o.phase ?? 0;
  // the drip clock: the stage clock, or (with `from`) the moment Dad passes that column
  const clk = { t0: o.from === undefined ? 0 : -1 };
  if (o.from !== undefined) onPass(w, px(o.from), (w2) => (clk.t0 = w2.tick));
  const tsec = (w2: World) => (clk.t0 < 0 ? -1 : (w2.tick - clk.t0) / 120);
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
            st.s.stump = 6;
            // a fresh start: the first drip comes a whole period after the break
            st.s.lastDrip = Math.floor((tsec(w2) + phase) / st.s.period);
            w2.sfx('snap', r.x + 8, FL - 40);
          }
          return;
        }
        if (st.s.freeze > 0) st.s.freeze--;
        if (tsec(w2) < 0) return;
        // the drip: one step of growth per period
        const k = Math.floor((tsec(w2) + phase) / st.s.period);
        if (st.s.lastDrip < 0) st.s.lastDrip = k;
        if (k !== st.s.lastDrip) {
          st.s.lastDrip = k;
          // the stump grows too (a pair): its growth is not stopped by a tap on the stalactite
          if (o.pairStep) {
            st.s.stump += o.pairStep;
            st.gap = Math.max(0, st.gap - o.pairStep);
          }
          if (st.s.freeze <= 0) {
            st.gap = Math.max(0, st.gap - st.s.step);
            // the sound: a high click from a long fall, a deep plop when it is nearly down
            w2.sfx(st.gap > 36 ? 'click' : 'thud', r.x + 8, FL - st.gap);
          }
          if (o.minGap !== undefined) st.gap = Math.max(o.minGap, st.gap);
          if (st.gap < FIT) {
            st.s.shutAt = w2.tick;
            // the cause: it came down on you, or you walked into a wall; a pair that shut by its stump says so
            if (r.hazard) r.hazard.cause = inside ? (o.pairStep && st.s.freeze > 0 ? 'shl-stump' : 'shl-maw') : 'shl-shut';
          }
        }
        // a head bump while open freezes it for 3 s; a wet one (it glistens) sheds three drips at once instead
        if (inside && st.gap >= FIT && p.y <= FL - st.gap + 2 && p.vy < 0 && st.s.freeze <= 0 && w2.tick - (st.s.bumpAt ?? -99) > 30) {
          st.s.bumpAt = w2.tick;
          if (o.wet) {
            st.gap = Math.max(0, st.gap - 3 * st.s.step);
            w2.sfx('splash', r.x + 8, FL - st.gap);
            if (st.gap < FIT) {
              st.s.shutAt = w2.tick;
              if (r.hazard) r.hazard.cause = 'shl-wet';
            }
          } else {
            st.s.freeze = 360;
            w2.sfx('bonk', r.x + 8, FL - st.gap);
          }
        }
        if (!inside && r.hazard && st.gap < FIT) r.hazard.cause = 'shl-shut';
      },
      paint: (ctx, r, w2) => {
        const tipY = FL - st.gap;
        // the stalactite: a pale tapering cone from the cave roof to the tip
        ctx.fillStyle = st.s.freeze > 0 ? '#D9E4DC' : o.wet ? '#B7D4E6' : '#C9D3CC';
        ctx.beginPath();
        ctx.moveTo(r.x - 2, 70);
        ctx.lineTo(r.x + 18, 70);
        ctx.lineTo(r.x + 8, tipY);
        ctx.closePath();
        ctx.fill();
        box(ctx, r.x + 6, tipY - 6, 4, 6, '#AEBBB3');
        if (o.wet) for (let i = 0; i < 3; i++) box(ctx, r.x + 5 + i * 3, 90 + ((w2.tick * 2 + i * 37) % Math.max(1, tipY - 96)), 1, 4, 'rgba(255,255,255,0.8)');
        // the stump on the floor (a pair's stump grows), or the pool it drips into
        if (o.minGap !== undefined) {
          box(ctx, r.x - 6, FL - 3, 28, 3, 'rgba(120,200,210,0.8)');
          box(ctx, r.x - 8, FL - 1, 32, 1, 'rgba(255,255,255,0.5)');
        } else {
          ctx.fillStyle = '#AEBBB3';
          ctx.beginPath();
          ctx.moveTo(r.x - 2, FL);
          ctx.lineTo(r.x + 18, FL);
          ctx.lineTo(r.x + 8, FL - st.s.stump);
          ctx.closePath();
          ctx.fill();
        }
        // a rock pillar in front: the tip is hidden, the drip is heard
        if (o.pillar) box(ctx, r.x - 4, 60, 24, FL - 60 - 30, '#3A4842');
        // the drip on its way down
        if (st.gap >= FIT && st.s.shutAt < 0 && tsec(w2) >= 0) {
          const t = (((tsec(w2) + phase) % st.s.period) + st.s.period) % st.s.period;
          const k = t / st.s.period;
          box(ctx, r.x + 7, tipY + (FL - tipY) * k, 2, 4, '#BFE0F0');
        }
        if (st.gap < FIT) box(ctx, r.x + 2, 70, 12, FL - 70, 'rgba(201,211,204,0.9)');
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
    // the gallery's clock starts at its checkpoint, one drip from shutting: the break comes 2.3 s after it, every try
    for (let i = 0; i < 7; i++) stal(w, list, c.x + 6 + i * 3.5, { g0: 70, step: 10, period: 0.7, shut: 1.6, phase: 0.0, from: c.x + 2, startGap: 20 });
    sign(w, c.x + 2, 10.4, 3, 'KREM', 'shop', null, 'the gallery');
  },
};

/** act 2 (shelter beat): the drip storm: the whole roof comes down together; the stalactite over the pool never meets a stump */
export const actPool: Act = {
  id: 'shl07-pool',
  w: 40,
  advice: 'A drip storm: the whole roof of this stretch comes down together every few seconds. One stalactite drips into a pool, and a drip into water builds no stump: it never meets the floor. Get under it before the roof comes down, stand in the pool through the shut, and go on at the break.',
  cps: [2],
  paint: () => {},
  build: (w, c) => {
    const list = w.flags.shl7 as Stal[];
    cave(w, c.x, c.x + 39);
    for (let i = 0; i < 7; i++) {
      const pool = i === 3;
      stal(w, list, c.x + 8 + i * 3.5, { g0: 70, step: 10, period: 0.45, shut: 1.8, phase: 0, from: c.x + 2, startGap: 70, minGap: pool ? 30 : undefined });
    }
    sign(w, c.x + 2, 10.4, 3, 'THE POOL', 'shop', null, 'no stump grows in water');
  },
};

/** act 3 (sound beat): the tips are hidden behind rock pillars; the drip's sound says how far it has to fall */
export const actPlop: Act = {
  id: 'shl07-plop',
  w: 36,
  advice: 'Rock pillars hide the tips of these three. Listen: a high click is a drip with a long way to fall, a stalactite still high; a deep plop is one nearly down. Pass each on its clicks, never on its plops, and never on the snap you hear from another.',
  cps: [2],
  paint: () => {},
  build: (w, c) => {
    const list = w.flags.shl7 as Stal[];
    cave(w, c.x, c.x + 35);
    stal(w, list, c.x + 10, { g0: 66, step: 8, period: 0.8, shut: 2.0, phase: 0.0, from: c.x + 2, startGap: 42, pillar: true });
    stal(w, list, c.x + 18, { g0: 66, step: 11, period: 0.6, shut: 2.0, phase: 0.0, from: c.x + 2, startGap: 33, pillar: true });
    stal(w, list, c.x + 26, { g0: 66, step: 8, period: 1.0, shut: 2.0, phase: 0.0, from: c.x + 2, startGap: 50, pillar: true });
    sign(w, c.x + 2, 10.4, 3, 'LISTEN', 'shop', null, 'click or plop');
  },
};

/** act 4 (the tap): two stalactites close together on different clocks: freeze the first with a head bump, wait under it for the second */
export const actKnock: Act = {
  id: 'shl07-knock',
  w: 30,
  advice: 'Two stalactites a step and a half apart, each on its own clock, and there is no moment when both are open for long. Jump and bump your head on the first: it freezes for a few drips. Wait under it, and go when the second breaks.',
  cps: [2],
  paint: () => {},
  build: (w, c) => {
    const list = w.flags.shl7 as Stal[];
    cave(w, c.x, c.x + 29);
    stal(w, list, c.x + 12, { g0: 50, step: 10, period: 0.5, shut: 1.2, phase: 0.0, from: c.x + 2, startGap: 50 });
    stal(w, list, c.x + 14.5, { g0: 50, step: 10, period: 0.5, shut: 1.2, phase: 1.0, from: c.x + 2, startGap: 20 });
    sign(w, c.x + 2, 10.4, 3, 'BUMP IT', 'shop', null, 'a frozen one waits for you');
  },
};

/** act 5 (pairs): stalagmites grow up to meet the stalactites: a tap freezes the top, the stump keeps coming */
export const actPairs: Act = {
  id: 'shl07-pairs',
  w: 34,
  advice: 'Here the stumps grow too: each pair closes from both ends. A bump freezes only the stalactite you hit; its stump keeps rising, so a frozen pair still shuts, half as fast. Bump, then go through at once.',
  cps: [2],
  paint: () => {},
  build: (w, c) => {
    const list = w.flags.shl7 as Stal[];
    cave(w, c.x, c.x + 33);
    stal(w, list, c.x + 12, { g0: 60, step: 8, period: 0.5, shut: 1.4, phase: 0.0, from: c.x + 2, startGap: 60, pairStep: 6 });
    stal(w, list, c.x + 22, { g0: 60, step: 8, period: 0.5, shut: 1.4, phase: 1.5, from: c.x + 2, startGap: 60, pairStep: 6 });
    sign(w, c.x + 2, 10.4, 3, 'PAIRS', 'shop', null, 'the stump grows too');
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
