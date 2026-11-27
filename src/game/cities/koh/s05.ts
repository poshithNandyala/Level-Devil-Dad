// KOH-05 Dhol Gach: the log drum at the ford. The carved log is the only way over the stream and a crew hauls it
// across on a rope: on every shout it surges forward, holds a moment, then rolls back half the way. Ride it and
// step off at the TOP of the surge that first touches the far bank: after the roll-back there is a gap, and whoever
// stays aboard is hauled on under the drum hut's lintel. Acts: two logs and two crews (only your log's crew moves
// your log: read whose rope it is), and a double shout at the end (the log climbs the bank: do not stand where it
// lands).
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { Rig, box, folk } from './entities';
import { FL, ditch, since, taraScript } from './common';
import { lines as L } from './lines';

export const LOG_H = 12;
/** the log's top sits flush with the banks; it climbs a tile on to the drum stand at the far bank */
export const DECK = FL;

export interface Log {
  rig: Rig;
  /** tick the hauling started (-1: not yet) */
  t0: number;
  /** cycle length, surge tiles, hold s, roll-back tiles */
  P: number;
  surge: number;
  hold: number;
  roll: number;
  /** the pause between the two shouts of a double (s) */
  gap: number;
  /** cycles that are double shouts (the second surge follows after `hold`) */
  doubles: number[];
  x0: number;
  xMax: number;
  /** +1 while surging, 0 holding, -1 rolling back, 2 resting at the end */
  phase: number;
  cycle: number;
  /** the crew's colour and bank x (for the drawing) */
  crew: { x: number; colour: string; name: string };
  shoutT: number;
}

function logX(st: Log, t: number): { x: number; phase: number; cycle: number } {
  if (t < 0) return { x: st.x0, phase: 0, cycle: -1 };
  const T = 16;
  const s = 0.5;
  const ease = (u: number) => 1 - (1 - u) * (1 - u);
  // the last cycle is the first whose top reaches xMax; after it the crew stops and the log rests, rolled back
  let base = st.x0;
  let nLast = 0;
  for (;;) {
    const top = base + st.surge * T * (st.doubles.includes(nLast) ? 2 : 1);
    if (top >= st.xMax || nLast > 60) break;
    base += (st.surge - st.roll + (st.doubles.includes(nLast) ? st.surge : 0)) * T;
    nLast++;
  }
  // a double cycle is longer by its second surge and the pause before it
  const dur = (k: number) => st.P + (st.doubles.includes(k) ? s + st.gap : 0);
  let n = 0;
  let tStart = 0;
  while (n <= nLast && t >= tStart + dur(n)) {
    tStart += dur(n);
    n++;
  }
  if (n > nLast) {
    const top = base + st.surge * T * (st.doubles.includes(nLast) ? 2 : 1);
    return { x: top - st.roll * T, phase: 2, cycle: nLast };
  }
  const tc = t - tStart;
  base = st.x0;
  for (let k = 0; k < n; k++) base += (st.surge - st.roll + (st.doubles.includes(k) ? st.surge : 0)) * T;
  const dbl = st.doubles.includes(n);
  let x: number;
  let phase: number;
  if (tc < s) {
    x = base + st.surge * T * ease(tc / s);
    phase = 1;
  } else if (dbl && tc < s + st.gap) {
    x = base + st.surge * T;
    phase = 0;
  } else if (dbl && tc < 2 * s + st.gap) {
    x = base + st.surge * T + st.surge * T * ease((tc - s - st.gap) / s);
    phase = 1;
  } else {
    const top = base + st.surge * T * (dbl ? 2 : 1);
    const t1 = dbl ? 2 * s + st.gap : s;
    if (tc < t1 + st.hold) {
      x = top;
      phase = 0;
    } else {
      const u = (tc - t1 - st.hold) / (st.P - s - st.hold);
      x = top - st.roll * T * Math.min(1, u);
      phase = -1;
    }
  }
  return { x, phase, cycle: n };
}

/**
 * a hauled log: rests with its back at column c0 (5 tiles long), hauled towards the right until its back passes column
 * cStop; the crew stands at column cCrew. Hauling starts when Dad steps on to the log (or with `startWith`'s log, `delay` seconds later).
 */
export function log(w: World, c0: number, cStop: number, cCrew: number, key: string, o: { P?: number; surge?: number; hold?: number; roll?: number; doubles?: number[]; gap?: number; colour?: string; name?: string; startWith?: string; delay?: number; bank?: number }): Log {
  const W = 5 * 16;
  const st: Log = {
    rig: null as any,
    t0: -1,
    P: o.P ?? 2.0,
    surge: o.surge ?? 3,
    hold: o.hold ?? 0.4,
    roll: o.roll ?? 1.5,
    gap: o.gap ?? o.hold ?? 0.4,
    doubles: o.doubles ?? [],
    x0: px(c0),
    xMax: px(cStop),
    phase: 0,
    cycle: -1,
    crew: { x: px(cCrew), colour: o.colour ?? '#C0392B', name: o.name ?? 'HO' },
    shoutT: -999,
  };
  const rig = w.add(
    new Rig(st.x0, DECK, W, LOG_H, {
      solid: true,
      layer: 2,
      tick: (r, w2) => {
        if (st.t0 < 0) {
          const starter = o.startWith ? (w2.flags[o.startWith] as Log) : null;
          if (starter ? starter.t0 >= 0 : w2.standing(r.solid!)) st.t0 = starter ? starter.t0 + Math.round((o.delay ?? 0) * 120) : w2.tick;
        }
        const t = st.t0 < 0 ? -1 : since(w2, st.t0);
        if (st.t0 >= 0 && t < 0) return;
        const p = logX(st, t);
        if (p.cycle !== st.cycle && p.cycle >= 0 && p.phase !== 2) {
          st.cycle = p.cycle;
          st.shoutT = w2.tick;
          w2.sfx('honk', st.crew.x, FL - 30);
          w2.say(`${st.crew.name}! | ${st.crew.name}!`, st.crew.x, FL - 40, 0.6, 'npc');
        } else if (p.phase === 1 && st.phase === 0 && st.doubles.includes(p.cycle)) {
          // the second shout of a double
          st.shoutT = w2.tick;
          w2.sfx('honk', st.crew.x, FL - 30);
          w2.say(`${st.crew.name}! ${st.crew.name}! | ${st.crew.name}! ${st.crew.name}!`, st.crew.x, FL - 40, 0.6, 'npc');
        }
        st.phase = p.phase;
        const nx = Math.round(p.x * 2) / 2;
        // once its front is on the far bank the log climbs a tile on to the drum stand (whoever rides it goes up too)
        const rise = 16 * Math.max(0, Math.min(1, (nx + W - px(o.bank ?? cStop)) / 16));
        const ny = DECK - Math.round(rise);
        r.solid!.velX = (nx - r.x) * 120;
        if (nx !== r.x || ny !== r.y) r.moveTo(w2, nx, ny);
        r.s.phase = p.phase;
      },
      paint: (ctx, r, w2) => {
        // the carved log: a dark cylinder with a lighter top and the carved mouth
        box(ctx, r.x, r.y, r.w, r.h, '#4E342E');
        box(ctx, r.x, r.y, r.w, 3, '#8D6E63');
        box(ctx, r.x, r.y + r.h - 2, r.w, 2, '#2B1A12');
        box(ctx, r.x + r.w - 10, r.y + 3, 8, 6, '#2B1A12');
        for (let k = 6; k < r.w - 12; k += 14) box(ctx, r.x + k, r.y + 4, 5, 5, '#6D4C41');
        // the rope to the crew
        box(ctx, r.x + r.w, r.y + 4, Math.max(0, st.crew.x - 12 - (r.x + r.w)), 2, st.crew.colour);
        // the crew: four haulers leaning on the shout
        const lean = since(w2, st.shoutT) < 0.5 ? 4 : 0;
        for (let i = 0; i < 4; i++) folk(ctx, st.crew.x + i * 12 + lean, FL - 26 + ((w2.tick >> 4) + i) % 2, 26, i % 2 ? st.crew.colour : '#1B1B1B');
      },
    }),
  );
  st.rig = rig;
  w.flags[key] = st;
  return st;
}

/** the drum hut's lintel over the far bank: whoever is still on the log when it is hauled under it is knocked off */
export function lintel(w: World, cx: number, cause = 'koh-shahtir') {
  w.add(
    new Rig(px(cx), FL - 40, 10, 16, {
      layer: 3,
      cause,
      inset: 0,
      paint: (ctx, r) => {
        box(ctx, r.x - 2, r.y, 14, 16, '#5D4037');
        box(ctx, r.x + 2, 0, 6, r.y, '#5D4037');
      },
    }),
  );
}

/** the stream under the ford: deadly water from column c0 to c1 */
export const ford = (w: World, c0: number, c1: number) => ditch(w, px(c0), px(c1 + 1), 'koh-nala', FL + 4, ['rgba(120,150,150,0.9)', 'rgba(50,70,70,0.97)']);

export function room(): LevelDef {
  return {
    id: 'KOH-05',
    city: 'KOH',
    index: 5,
    name: 'Dhol Gach',
    nameEn: 'The log drum',
    tagline: 'A crew hauls the drum across the ford. You ride it.',
    hint: 'The crew hauls the log across the stream on their shouts: it surges forward, holds a moment, then rolls back most of the way. Ride it, and do not run off its front. Step off on to the far bank at the top of the surge that first touches it: after the roll-back there is a gap, and whoever stays on is hauled on under the drum hut’s lintel.',
    par: 40,
    map: Grid.ground(15).fill(6, 15, 15, 17, '.').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      ford(w, 6, 15);
      log(w, 6, 17, 22, 'koh5', { P: 1.3, surge: 4, roll: 2.5, bank: 16 });
      lintel(w, 15.8);
      w.add(
        new Rig(px(3), 0, 1, 1, {
          paint: () => {},
          tick: (_r, w2) => {
            if (w2.tick === 1) tara(w2, L.taunt[1], 2.4);
          },
        }),
      );
      sign(w, 2, 10.4, 3.4, 'DHOL GACH', 'shop', null, 'the log drum');
      rival(w, 27, 15, -1, taraScript(5));
      collectible(w, 'koh-drum', 10.5, 10.6);
    },
  };
}

/** two logs, two crews: the red crew's shout moves the red-roped log, the white crew's the other; step across at the top of YOUR log's surge; the white crew ends with a double shout */
export const actDui: Act = {
  id: 'koh05-dui',
  w: 30,
  advice: 'Two logs end to end and two crews, each with its own rope and its own shout: a shout moves only the log on its rope, and the other log stands where it is. Step from the first log to the second at the top of the FIRST log’s surge, when their ends touch. The white crew ends with a double shout: step off at the first top and keep going, the second surge brings the log on to the bank where you stood.',
  cps: [],
  paint: (g, c) => {
    g.fill(c.x + 3, c.x + 19, 15, 17, '.');
  },
  build: (w, c) => {
    ford(w, c.x + 3, c.x + 19);
    log(w, c.x + 3, c.x + 7, c.x + 18, 'koh5a', { colour: '#C0392B', name: 'HO', P: 1.5, surge: 3, roll: 2, bank: 99 });
    const b = log(w, c.x + 12, c.x + 16, c.x + 24, 'koh5b', { colour: '#F2EFE4', name: 'HEI', P: 1.5, surge: 3, roll: 2, doubles: [0], gap: 0.9, startWith: 'koh5a', delay: 3.0, bank: c.x + 20 });
    // the log climbing the bank rolls over whoever stands on the strip just ahead of its front (a solid would only shove
    // him up on to its back): a ground-level box that leads the front while the second surge climbs
    w.add(
      new Rig(0, DECK - 14, 26, 18, {
        layer: 1,
        cause: 'koh-dhol',
        inset: 0,
        live: () => b.phase === 1 && b.rig.x + 80 > px(c.x + 20) + 4,
        tick: (r) => {
          r.x = b.rig.x + 80 - 8;
        },
        paint: () => {},
      }),
    );
    sign(w, c.x + 1, 10.4, 3, 'DUI DOL', 'shop', null, 'two crews');
  },
};

/** two short fords, a quick crew then a slow one: the top is what you watch, not the count of shouts */
export const actChadhai: Act = {
  id: 'koh05-chadhai',
  w: 34,
  advice: 'Two more fords. The first crew is quick and the second slow, and each log rolls back further than it did: watch the log, not the shouts, and step off at the top of the surge that touches the bank.',
  cps: [15],
  paint: (g, c) => {
    g.fill(c.x + 3, c.x + 12, 15, 17, '.').fill(c.x + 18, c.x + 28, 15, 17, '.');
  },
  build: (w, c) => {
    ford(w, c.x + 3, c.x + 12);
    log(w, c.x + 3, c.x + 12, c.x + 15, 'koh5c', { P: 1.1, surge: 3, roll: 2, colour: '#2E7D32', name: 'HO', bank: c.x + 13 });
    lintel(w, c.x + 10.6);
    ford(w, c.x + 18, c.x + 28);
    log(w, c.x + 18, c.x + 26, c.x + 31, 'koh5d', { P: 2.0, surge: 4, roll: 3, colour: '#E0B04A', name: 'HOI', bank: c.x + 29 });
    lintel(w, c.x + 25.4);
    sign(w, c.x + 1, 10.4, 3, 'CHADHAI', 'shop', null, 'the climb');
  },
};

export const ending: Ending = {
  space: 14,
  advice: 'The drum rests across the hut’s doorway, and the crew rocks it: it rolls a tile towards you and back every few seconds. Hop over it as it rolls away from you.',
  paint: () => {},
  build(w, d) {
    const x0 = d.x - 70;
    w.flags.twist = 'rocking-drum';
    const st = { t0: -1 };
    w.flags.koh5e = st;
    w.when(
      (w2) => w2.player.cx > d.x - px(12),
      (w2) => {
        st.t0 = w2.tick;
      },
    );
    const drum = w.add(
      new Rig(x0, FL - LOG_H, 36, LOG_H, {
        solid: true,
        layer: 2,
        cause: 'koh-dhol',
        inset: 3,
        live: (r) => (r.s.v ?? 0) < -10,
        tick: (r, w2) => {
          const P = 3.0;
          const t = st.t0 < 0 ? 0 : ((since(w2, st.t0) % P) + P) % P;
          // rests 1.6 s, rolls one tile towards Dad over 0.5 s, back over 0.9 s
          const k = t < 1.6 ? 0 : t < 2.1 ? (t - 1.6) / 0.5 : 1 - (t - 2.1) / 0.9;
          const nx = Math.round(x0 - k * 16);
          r.s.v = (nx - r.x) * 120;
          if (nx !== r.x) r.moveTo(w2, nx, FL - LOG_H);
        },
        paint: (ctx, r) => {
          box(ctx, r.x, r.y, r.w, r.h, '#4E342E');
          box(ctx, r.x, r.y, r.w, 3, '#8D6E63');
          box(ctx, r.x + 6, r.y + 4, 6, 5, '#2B1A12');
        },
      }),
    );
    w.flags.koh5drum = drum;
    w.add(
      new Paint((ctx) => {
        // the hut's posts and roof
        box(ctx, d.x - 90, FL - 70, 6, 70, '#5D4037');
        box(ctx, d.x + 20, FL - 70, 6, 70, '#5D4037');
        ctx.fillStyle = '#4E3B2A';
        ctx.beginPath();
        ctx.moveTo(d.x - 100, FL - 68);
        ctx.lineTo(d.x - 30, FL - 100);
        ctx.lineTo(d.x + 36, FL - 68);
        ctx.closePath();
        ctx.fill();
      }, -3),
    );
  },
};

export const meta05 = { family: 'crew-beat-log-platform', betrayals: ['crew-surge'], ending: 'koh-rocking-drum' };
