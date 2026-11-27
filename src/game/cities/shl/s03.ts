// SHL-03 Sway: the 1932 suspension bridge at Dawki over the clear Umngot. The deck swings to your own step:
// run along it and the swing builds until it throws you; walk in short bursts and it stays flat; a boat's wake
// adds a swing of its own, so let the boat pass while you stand on a tower, not on the deck.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, perTick } from './entities';
import { taraScript, FL } from './common';
import { lines as L } from './lines';

/** the swing: per tick of running on a deck, per tick of standing (cleared), the throw, the creak */
export const SWAY = { gain: 1 / 150, calm: 1 / 60, throwAt: 1.0, creakAt: 0.6 };

export interface SwayState {
  e: number;
  decks: Rig[];
  on: (w: World) => Rig | undefined;
  creaked: boolean;
  wakes: { x0: number; x1: number; period: number; phase: number; at: (w: World) => number }[];
}

/** the shared swing state of a stage (one Dad, one swing) */
export function swayState(w: World, key: string): SwayState {
  const st: SwayState = { e: 0, decks: [], on: (w2) => st.decks.find((d) => d.solid && w2.standing(d.solid)), creaked: false, wakes: [] };
  w.flags[key] = st;
  return st;
}

/** a span of deck between two towers (tiles c0..c1 inclusive) over the river, hung from cables */
export function span(w: World, st: SwayState, c0: number, c1: number, cause = 'shl-sway', wet = false) {
  const deck = w.add(
    new Rig(px(c0), FL, px(c1 - c0 + 1), 16, {
      solid: true,
      layer: 2,
      tick: (r, w2) => {
        const p = w2.player;
        const here = r.solid && w2.standing(r.solid);
        if (here) {
          // wet planks: when you stop you slide on for a moment, and the slide swings the deck like a step
          if (wet) {
            if (Math.abs(p.vx) > 60) r.s.slide = 30;
            else if (r.s.slide > 0) {
              r.s.slide--;
              p.x += perTick(70);
            }
          }
          const sliding = wet && r.s.slide > 0 && Math.abs(p.vx) <= 60;
          if (Math.abs(p.vx) > 60) st.e += SWAY.gain;
          else if (sliding) st.e += SWAY.gain * 3;
          else st.e = Math.max(0, st.e - SWAY.calm);
          if (st.e >= SWAY.creakAt && !st.creaked) {
            st.creaked = true;
            w2.sfx('creak', p.cx, FL);
          }
          if (st.e < SWAY.creakAt * 0.5) st.creaked = false;
          if (st.e >= SWAY.throwAt) w2.die(cause);
        }
      },
      paint: (ctx, r, w2) => {
        const sw = Math.sin((w2.tick / 120) * 2 * Math.PI * 0.9) * st.e * 7;
        const here = r.solid && w2.standing(r.solid);
        const dy = here ? sw : 0;
        // cables
        ctx.strokeStyle = '#3E4D47';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(r.x, FL - 70);
        ctx.quadraticCurveTo(r.x + r.w / 2, FL - 10 + dy, r.x + r.w, FL - 70);
        ctx.stroke();
        for (let x = r.x + 8; x < r.x + r.w; x += 16) {
          const k = (x - r.x) / r.w;
          const cy = FL - 70 + (FL - 10 + dy - (FL - 70)) * (4 * k * (1 - k)) * 0.5;
          ctx.beginPath();
          ctx.moveTo(x, cy);
          ctx.lineTo(x, FL + dy);
          ctx.stroke();
        }
        // the wooden deck, planks
        box(ctx, r.x, FL + dy, r.w, 6, wet ? '#3F3324' : '#6B4F2E');
        for (let x = r.x; x < r.x + r.w; x += 8) box(ctx, x, FL + dy, 1, 6, wet ? '#2A2218' : '#4A3620');
        if (wet) {
          ctx.fillStyle = 'rgba(190,224,240,0.8)';
          for (let x = r.x + 5; x < r.x + r.w; x += 13) ctx.fillRect(x, FL + dy + 6 + ((w2.tick * 2 + x) % 20), 1, 4);
        }
        box(ctx, r.x, FL + dy - 2, r.w, 2, st.e >= SWAY.creakAt && here ? '#D7262E' : '#8A6A3E');
      },
    }),
  );
  if (deck.solid) deck.solid.velX = 0;
  st.decks.push(deck);
  return deck;
}

/** the river under cols c0..c1: deadly, and so clear the boats look afloat in air */
export function river(w: World, c0: number, c1: number) {
  w.add(
    new Rig(px(c0), FL + 22, px(c1 - c0 + 1), 30, {
      layer: 0,
      cause: 'shl-dawki',
      inset: 0,
      paint: (ctx, r, w2) => {
        ctx.fillStyle = 'rgba(120,200,210,0.35)';
        ctx.fillRect(r.x, FL + 18, r.w, 60);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        for (let x = r.x + ((w2.tick / 3) % 14); x < r.x + r.w - 6; x += 14) ctx.fillRect(x, FL + 20, 6, 1);
        // river stones on the bed
        for (let x = r.x + 6; x < r.x + r.w; x += 11) box(ctx, x, FL + 62 + ((x * 7) % 5), 5, 3, '#9FB0A8');
      },
    }),
  );
}

/** a tower: two tiles of stone pier (solid ground in the map), drawn tall with the cable saddle */
export function tower(w: World, c: number) {
  w.add(
    new Paint((ctx) => {
      box(ctx, px(c) + 2, FL - 74, 12, 74, '#5C6F66');
      box(ctx, px(c) + 4, FL - 78, 8, 4, '#3E4D47');
      box(ctx, px(c) + 3, FL - 40, 10, 2, '#3E4D47');
    }, -1),
  );
}

/** a boat under the span c0..c1, every `period` s: its wake adds a swing to a deck Dad is on at that moment */
export function wake(w: World, st: SwayState, c0: number, c1: number, period: number, phase: number) {
  const wk = { x0: px(c0), x1: px(c1 + 1), period, phase, at: (w2: World) => ((((w2.tick / 120 + phase) % period) + period) % period) };
  st.wakes.push(wk);
  const boat = w.add(
    new Rig(px(c0), FL + 34, 30, 10, {
      layer: 1,
      tick: (r, w2) => {
        const t = wk.at(w2);
        const k = t / period;
        r.x = wk.x0 - 40 + (wk.x1 - wk.x0 + 80) * k;
        // the wake reaches the deck when the boat is under its middle
        const mid = (wk.x0 + wk.x1) / 2;
        const hit = r.x + 15 >= mid && r.x + 15 - perTick((wk.x1 - wk.x0 + 80) / period) < mid;
        if (hit) {
          const on = st.on(w2);
          // the wake is a full swing: anyone on that span goes
          if (on && on.x <= mid && on.x + on.w >= mid) {
            st.e = Math.max(st.e, SWAY.throwAt);
            w2.die('shl-wake');
          }
          w2.sfx('splash', mid, FL + 30);
        }
      },
      paint: (ctx, r, w2) => {
        box(ctx, r.x, r.y, r.w, 6, '#8A5A2B');
        box(ctx, r.x + 4, r.y - 8, 4, 8, '#D7262E');
        box(ctx, r.x + 22, r.y - 6, 3, 6, '#C68B59');
        // the ripples behind it
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        for (let i = 1; i < 4; i++) ctx.fillRect(r.x - i * 9, r.y + 7 + (i % 2), 6, 1);
        void w2;
      },
    }),
  );
  return boat;
}

export function room(): LevelDef {
  return {
    id: 'SHL-03',
    city: 'SHL',
    index: 3,
    name: 'Sway',
    nameEn: 'The Dawki bridge',
    tagline: 'The 1932 span over the Umngot. It moves when you do.',
    hint: 'The deck swings to your own step: run along it and the swing builds until it throws you off. Walk it in short bursts, a few steps and a stop, a few steps and a stop, and it stays flat. The red line on the deck shows the swing building.',
    par: 22,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').fill(8, 24, 15, 17, '.').rows(),
    build(w: World) {
      door(w);
      const st = swayState(w, 'shl3');
      river(w, 8, 24);
      tower(w, 6);
      tower(w, 25);
      span(w, st, 8, 24);
      onPass(w, px(4), (w2) => tara(w2, L.intro[1], 2.2));
      sign(w, 3, 10.2, 3, 'DAWKI', 'shop', null, 'Umngot bridge, 1932');
      rival(w, 29, 15, -1, taraScript(3));
      collectible(w, 'shl-pumaloi', 16, 11.4);
    },
  };
}

/** act: two more spans; a boat passes under the second and its wake adds a swing: let it pass from the tower */
export const act: Act = {
  id: 'shl03-wake',
  w: 44,
  advice: 'Two more spans. Boats go under the second one, and a boat’s wake adds a swing of its own to whoever is on the deck. Cross the first span in bursts, stand on the tower while the boat passes, then cross the second in bursts before the next.',
  cps: [2, 22],
  paint: (g, c) => {
    g.fill(c.x + 4, c.x + 18, 15, 17, '.');
    g.fill(c.x + 23, c.x + 39, 15, 17, '.');
  },
  build: (w, c) => {
    const st = w.flags.shl3 as SwayState;
    river(w, c.x + 4, c.x + 18);
    river(w, c.x + 23, c.x + 39);
    tower(w, c.x + 2);
    tower(w, c.x + 20);
    tower(w, c.x + 40);
    span(w, st, c.x + 4, c.x + 18);
    span(w, st, c.x + 23, c.x + 39);
    wake(w, st, c.x + 23, c.x + 39, 6.5, 0.5);
    sign(w, c.x + 20.5, 10.4, 3, 'BOATS', 'shop', null, 'afloat in air');
  },
};

/** act 2: a span whose planks are wet: after every stop you slide on a moment, and the slide swings the deck too */
export const actWet: Act = {
  id: 'shl03-wet',
  w: 32,
  advice: 'The last span’s planks are wet. When you stop you slide on for a moment, and the slide swings the deck like a step does: stop earlier than you think, and stand longer, before each burst. The deck stops a tile short of the far tower: a stop near its end slides you off into the river, so make your last stop well back and hop the gap.',
  cps: [1],
  paint: (g, c) => {
    g.fill(c.x + 4, c.x + 26, 15, 17, '.');
  },
  build: (w, c) => {
    const st = w.flags.shl3 as SwayState;
    river(w, c.x + 4, c.x + 26);
    tower(w, c.x + 2);
    tower(w, c.x + 27);
    // the deck ends a tile short of the far tower: the wet slide carries whoever stops near its end into the river
    span(w, st, c.x + 4, c.x + 25, 'shl-slip', true);
    sign(w, c.x + 1, 10.4, 3, 'WET', 'shop', null, 'planks after rain');
  },
};

/** the plain door of 03 lives in endings.ts (QA F2: the toll bar re-asked the room's rule) */
export const ending: Ending | null = null;

export const meta03 = { family: 'bridge-swing-matches-step-cadence', betrayals: ['cadence-swing'], ending: 'shl-tollbar' };
