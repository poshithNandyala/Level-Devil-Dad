// KOH-04 Dzükou: the cold meadow. Lilies stand in a bog; only an OPEN lily is a stand, and they open in a wave that
// travels left to right (chase its head: the pad ahead opens as you reach it). The icy stream across the middle
// numbs you (half speed) and a second in it is the end: jump it. Past the stream the wave comes the other way, from
// the far rim towards you: wait on the stone until the pad next to you opens (then every pad beyond is already
// open) and run through before they close in the order they opened.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { Rig, box } from './entities';
import { FL, cyc, ditch, since, taraScript } from './common';
import { lines as L, NPC } from './lines';

export interface Lilies {
  pads: Rig[];
  /** seconds a pad is open after it opens */
  open: number;
  /** when pad i opens within the period */
  at: number[];
  period: number;
  phase: number;
  /** 0-based pads that never open (buds) */
  buds: number[];
}

/**
 * n lilies two tiles apart from column c0 over a bog. `dir` 1: the wave runs left to right from `phase`; -1: right to
 * left. `gap` seconds between neighbours, `open` seconds each stays open, `period` the wave's repeat.
 */
export function lilies(w: World, c0: number, n: number, key: string, o: { dir: 1 | -1; gap: number; open: number; period: number; phase?: number; buds?: number[]; bog?: boolean }): Lilies {
  const st: Lilies = { pads: [], open: o.open, at: [], period: o.period, phase: o.phase ?? 0, buds: o.buds ?? [] };
  for (let i = 0; i < n; i++) st.at.push(o.dir > 0 ? i * o.gap : (n - 1 - i) * o.gap);
  if (o.bog !== false) ditch(w, px(c0) - 10, px(c0 + 2 * n) + 2, 'koh-daldal', FL + 8, ['rgba(60,70,40,0.95)', 'rgba(30,36,20,0.98)']);
  const isOpen = (i: number, w2: World) => {
    if (st.buds.includes(i)) return false;
    const t = cyc(w2, st.period, st.phase);
    return t >= st.at[i] && t < st.at[i] + st.open;
  };
  for (let i = 0; i < n; i++) {
    const pad = w.add(
      new Rig(px(c0 + 2 * i) + 5, FL - 4, 22, 4, {
        solid: true,
        layer: 2,
        tick: (r, w2) => {
          const op = isOpen(i, w2);
          r.s.open = op;
          r.setSolid(op);
          // how far into its opening it is (for the drawing)
          const t = cyc(w2, st.period, st.phase);
          r.s.k = op ? Math.min(1, (t - st.at[i]) / 0.15) : 0;
          r.s.left = op ? st.at[i] + st.open - t : 0;
        },
        paint: (ctx, r) => {
          // the stalk, and the flower: a bud, or open petals that are a pad
          box(ctx, r.x + 10, r.y + 4, 2, FL + 12 - (r.y + 4), '#4F7F4A');
          if (st.buds.includes(i)) {
            box(ctx, r.x + 8, r.y - 2, 6, 8, '#6B8E5A');
            return;
          }
          const k = r.s.open ? (r.s.k ?? 1) : 0;
          if (k <= 0) {
            box(ctx, r.x + 7, r.y - 4, 8, 10, '#C9D4B0');
            return;
          }
          const closing = (r.s.left ?? 1) < 0.3;
          ctx.fillStyle = closing ? '#D9D2C0' : '#F8F6F0';
          ctx.beginPath();
          ctx.ellipse(r.x + 11, r.y + 3, 11 * k, 3.5, 0, 0, Math.PI * 2);
          ctx.fill();
          box(ctx, r.x + 9, r.y, 4, 3, '#E0B04A');
        },
      }),
    );
    pad.setSolid(false);
    st.pads.push(pad);
  }
  w.flags[key] = st;
  return st;
}

/** the icy stream: columns c0..c1, a shallow strip; in it you move at half speed and after a second you go numb */
export function stream(w: World, c0: number, c1: number, key: string) {
  const st = { inT: -1, numb: 0 };
  w.flags[key] = st;
  const x0 = px(c0);
  const x1 = px(c1 + 1);
  w.onTick((w2) => {
    const p = w2.player;
    const inWater = p.cx > x0 && p.cx < x1 && p.y + p.h >= FL - 2;
    if (inWater) {
      if (st.inT < 0) st.inT = w2.tick;
      st.numb = Math.min(1, since(w2, st.inT) / 0.75);
      p.speedMul = 0.4;
      if (since(w2, st.inT) >= 0.75) w2.die('koh-thand');
    } else {
      st.inT = -1;
      if (st.numb > 0) {
        st.numb = Math.max(0, st.numb - 1 / 120);
        p.speedMul = 0.5 + 0.5 * (1 - st.numb);
      } else p.speedMul = 1;
    }
  });
  w.add(
    new Paint((ctx, w2) => {
      const g = ctx.createLinearGradient(0, FL - 2, 0, FL + 16);
      g.addColorStop(0, 'rgba(190,220,235,0.85)');
      g.addColorStop(1, 'rgba(90,130,160,0.95)');
      ctx.fillStyle = g;
      ctx.fillRect(x0, FL - 2, x1 - x0, 18);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      for (let x = x0 + ((w2.tick * 0.6) % 10); x < x1 - 4; x += 10) ctx.fillRect(x, FL - 1 + ((x / 10) % 2), 4, 1);
    }, -1),
  );
  return st;
}

export function room(): LevelDef {
  return {
    id: 'KOH-04',
    city: 'KOH',
    index: 4,
    name: 'Dzükou',
    nameEn: 'The cold meadow',
    tagline: 'Lilies open in a wave. The stream is colder than it looks.',
    hint: 'Only an open lily is a stand, and they open in a wave from the left: chase the head of the wave, the next pad opens as you reach it. The stream in the middle numbs you and a second in it is the end: jump it from the last pad to the stone. Past the stone the wave comes the other way, from the rim towards you: wait on the stone until the pad next to you opens (every pad beyond it is already open) and run straight through.',
    par: 36,
    map: Grid.ground(15).fill(5, 12, 15, 17, '.').fill(13, 15, 15, 15, '~').fill(16, 17, 14, 14, '#').fill(18, 25, 15, 17, '.').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      lilies(w, 5, 4, 'koh4a', { dir: 1, gap: 0.45, open: 1.3, period: 4.5, phase: 0 });
      stream(w, 13, 15, 'koh4s');
      lilies(w, 18, 4, 'koh4b', { dir: -1, gap: 0.45, open: 3.0, period: 4.5, phase: 0 });
      w.add(
        new Rig(px(3), 0, 1, 1, {
          paint: () => {},
          tick: (_r, w2) => {
            if (w2.tick === 1) tara(w2, L.taunt[0], 2.4);
          },
        }),
      );
      w.when(
        (w2) => w2.player.cx > px(16) && w2.player.cx < px(18),
        (w2) => w2.guide(NPC.cold),
      );
      sign(w, 2, 10.4, 3.4, 'DZUKOU', 'shop', null, '2438 m');
      rival(w, 27, 15, -1, taraScript(4));
      collectible(w, 'koh-lily', 16.5, 9.6);
    },
  };
}

/** the second meadow: every third lily is a bud that never opens, so the chase has a long jump in it; the far half comes the other way again */
export const actKali: Act = {
  id: 'koh04-kali',
  w: 37,
  advice: 'More lilies, and some are buds that never open: a stalk with no flower. Chase the wave as before and jump a bud from the open pad before it to the one after. Jump the stream, wait on the stone for the near pad to open, then run through.',
  cps: [],
  paint: (g, c) => {
    // the bog starts 6 tiles past the act's checkpoint (a tap-jump from it lands short of it)
    g.fill(c.x + 6, c.x + 17, 15, 17, '.').fill(c.x + 18, c.x + 20, 15, 15, '~').fill(c.x + 21, c.x + 22, 14, 14, '#').fill(c.x + 23, c.x + 32, 15, 17, '.');
  },
  build: (w, c) => {
    lilies(w, c.x + 6, 6, 'koh4c', { dir: 1, gap: 0.45, open: 1.3, period: 5.4, phase: 0, buds: [2] });
    stream(w, c.x + 18, c.x + 20, 'koh4t');
    lilies(w, c.x + 23, 5, 'koh4d', { dir: -1, gap: 0.45, open: 3.4, period: 5.4, phase: 0 });
    sign(w, c.x + 2, 10.4, 3, 'KALI', 'shop', null, 'buds');
  },
};

export const ending: Ending = {
  space: 12,
  advice: 'The door stands on the rim’s great lily. It opens on the wave’s beat and closes again: step on while it is open, and off it on to the rim at once.',
  paint: (g, D) => {
    g.fill(D - 7, D - 1, 15, 17, '.');
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'rim-lily';
    const st = lilies(w, D - 7, 3, 'koh4e', { dir: 1, gap: 0.6, open: 1.5, period: 4.2, phase: 0 });
    void st;
    w.add(
      new Paint((ctx) => {
        box(ctx, px(D) - 4, FL - 2, 4, 20, '#6D4C41');
      }, -1),
    );
    void d;
  },
};

export const meta04 = { family: 'bloom-wave-platforms-cold-slows', betrayals: ['bloom-wave'], ending: 'koh-rim-lily' };
