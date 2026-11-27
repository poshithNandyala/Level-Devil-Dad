// SHL-09 Eight-Day Market (tough): Ïewduh on its slope, the stalls on counters over the drain. The market keeps
// an eight-day week: every stall has a plate with the day it is closed, and the board at each market arch shows
// the day. Each arch you pass is a new day. A closed stall is a frame with a cloth over it and no boards: step on
// it and you are in the drain. The board is only paint: the arches are the days.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, folk } from './entities';
import { taraScript, FL } from './common';
import { lines as L } from './lines';

export const PITCH_W = 3;
export const TOP = FL - 16;
const TARPS = ['#D7262E', '#2F6BB0', '#E8B04B', '#4E8A3E', '#8A4A8F', '#C8D86B', '#5AA7C9', '#B9A25A'];

export interface Pitch {
  x: number;
  w: number;
  plate: number;
  /** closed on this day (the plate), or because its keeper has packed up */
  closedOn: (day: number, w: World) => boolean;
  cause: (day: number) => string;
  packed: boolean;
}
export interface Market {
  day: number;
  dayAt: number;
  pitches: Pitch[];
  /** arch x (px) and the day it turns to */
  arches: { x: number; passed: boolean }[];
  cause: string;
}

export function market(w: World, key: string): Market {
  const st: Market = { day: 0, dayAt: -1, pitches: [], arches: [], cause: 'shl-nala' };
  w.flags[key] = st;
  return st;
}

/** a market arch at column c: passing it turns the day; its board shows the day, or lies, or is blank */
export function arch(w: World, st: Market, c: number, o: { board?: 'day' | 'blank' | number; keeper?: boolean } = {}) {
  const a = { x: px(c), passed: false };
  st.arches.push(a);
  onPass(w, px(c), (w2) => {
    if (a.passed) return;
    a.passed = true;
    st.day = (st.day % 8) + 1;
    st.dayAt = w2.tick;
    w2.sfx('click', px(c), FL - 60);
  });
  w.add(
    new Paint((ctx) => {
      const x = px(c);
      box(ctx, x - 14, FL - 72, 4, 72, '#6B4F2E');
      box(ctx, x + 10, FL - 72, 4, 72, '#6B4F2E');
      box(ctx, x - 18, FL - 80, 36, 8, '#6B4F2E');
      box(ctx, x - 16, FL - 78, 32, 2, '#C8D86B');
      // the board hanging from the arch
      const shown = o.board === 'blank' ? '' : typeof o.board === 'number' ? String(o.board) : String(a.passed ? st.day : (st.day % 8) + 1);
      const flipped = typeof o.board === 'number';
      box(ctx, x - 10, FL - 68, 20, 14, flipped ? '#C9A56B' : '#F4F7F2');
      box(ctx, x - 10, FL - 68, 20, 2, '#3E4D47');
      ctx.fillStyle = '#22302B';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      if (shown) ctx.fillText(`DAY ${shown}`, x, FL - 57);
      else ctx.fillText('--', x, FL - 57);
      ctx.textAlign = 'left';
      if (o.keeper) folk(ctx, x + 22, FL - 26, 26, '#8A4A8F');
    }, -3),
  );
  return a;
}

/**
 * A row of stalls over the drain: a tile of drain at column c0, then one continuous counter of three-tile pitches,
 * then a tile of drain. Plates give each stall the day it is closed; a closed stall's counter is a cloth over a
 * frame with no boards: it is not solid. `pack` names a pitch (index) whose keeper takes the boards off when Dad
 * passes `pack.at` (a column). The drain under the row is deadly. Row columns: c0 .. c0 + 3n + 1; bank at c0 + 3n + 2.
 */
export function row(w: World, st: Market, c0: number, plates: number[], o: { pack?: { i: number; at: number }; causeFor?: (plate: number, day: number) => string } = {}) {
  const n = plates.length;
  const x0 = px(c0);
  const x1 = px(c0 + n * 3 + 2);
  const pitches: Pitch[] = [];
  plates.forEach((plate, i) => {
    const x = px(c0 + 1 + i * 3);
    const p: Pitch = {
      x,
      w: px(PITCH_W),
      plate,
      packed: false,
      closedOn: (day) => p.packed || plate === day,
      cause: (day) => (p.packed ? 'shl-pack' : o.causeFor ? o.causeFor(plate, day) : 'shl-closed'),
    };
    pitches.push(p);
    st.pitches.push(p);
    const r = w.add(
      new Rig(x, TOP, px(PITCH_W), 16, {
        solid: true,
        layer: 2,
        tick: (rr, w2) => {
          const closed = p.closedOn(st.day, w2);
          rr.setSolid(!closed);
          const pl = w2.player;
          // Dad over this pitch at counter height: remember what would take him
          if (pl.x + pl.w > x + 2 && pl.x < x + rr.w - 2 && pl.y + pl.h >= TOP - 4 && pl.y + pl.h <= TOP + 20) st.cause = closed ? p.cause(st.day) : 'shl-nala';
        },
        paint: (ctx, rr, w2) => {
          const closed = p.closedOn(st.day, w2);
          // legs and the cloth front down to the drain
          box(ctx, rr.x + 2, TOP, 3, 24, '#6B4F2E');
          box(ctx, rr.x + rr.w - 5, TOP, 3, 24, '#6B4F2E');
          box(ctx, rr.x, TOP + 2, rr.w, 22, TARPS[(plate - 1) % 8]);
          // the counter boards (only on an open stall; a closed one shows the frame's edge and nothing on it)
          if (!closed) {
            box(ctx, rr.x - 1, TOP, rr.w + 2, 4, '#8A6A3E');
            box(ctx, rr.x - 1, TOP, rr.w + 2, 1, '#C9A56B');
            // the goods
            for (let k = 0; k < 3; k++) box(ctx, rr.x + 4 + k * 9, TOP - 5, 6, 5, k % 2 ? '#E8B04B' : '#4E8A3E');
          } else {
            box(ctx, rr.x - 1, TOP, rr.w + 2, 2, '#4A3620');
          }
          // the tarp on poles and the plate: the day it is closed
          box(ctx, rr.x + 3, TOP - 44, 2, 40, '#6B4F2E');
          box(ctx, rr.x + rr.w - 5, TOP - 44, 2, 40, '#6B4F2E');
          box(ctx, rr.x - 3, TOP - 48, rr.w + 6, 6, TARPS[(plate - 1) % 8]);
          box(ctx, rr.x + rr.w / 2 - 7, TOP - 40, 14, 10, '#F4F7F2');
          ctx.fillStyle = '#22302B';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(String(plate), rr.x + rr.w / 2, TOP - 32);
          ctx.textAlign = 'left';
          // the keeper, packing up or standing
          if (o.pack && o.pack.i === i) {
            if (p.packed) {
              box(ctx, rr.x + 6, TOP - 30, 20, 3, '#8A6A3E');
              folk(ctx, rr.x + rr.w + 8, TOP - 26, 26, '#2F6BB0');
            } else folk(ctx, rr.x + rr.w / 2, TOP - 26, 26, '#2F6BB0');
          }
        },
      }),
    );
    if (r.solid) r.solid.velX = 0;
  });
  if (o.pack) {
    const p = pitches[o.pack.i];
    onPass(w, px(o.pack.at), (w2) => {
      const t0 = w2.tick;
      w2.when((w3) => w3.tick - t0 >= 30, (w3) => {
        p.packed = true;
        w3.sfx('thud', p.x, TOP);
      });
    });
  }
  // the drain under the row
  w.add(
    new Rig(x0, FL + 2, x1 - x0, 30, {
      layer: 0,
      cause: 'shl-nala',
      inset: 0,
      tick: (r) => {
        if (r.hazard) r.hazard.cause = st.cause;
      },
      paint: (ctx, r, w2) => {
        box(ctx, r.x, FL + 4, r.w, 40, '#3E4D47');
        ctx.fillStyle = 'rgba(120,170,180,0.6)';
        ctx.fillRect(r.x, FL + 8, r.w, 36);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        for (let x = r.x + ((w2.tick / 3) % 14); x < r.x + r.w - 6; x += 14) ctx.fillRect(x, FL + 10, 6, 1);
      },
    }),
  );
  return pitches;
}

export function room(): LevelDef {
  return {
    id: 'SHL-09',
    city: 'SHL',
    index: 9,
    name: 'Eight-Day Market',
    nameEn: 'Ïewduh',
    tagline: 'The biggest market in the hills. Every stall has its day off.',
    hint: 'The market keeps an eight-day week, and after day 8 comes day 1. Every stall has a plate with the day it is closed, and a closed stall is only a cloth over a frame: step on it and you are in the drain. The board at each arch shows the day, and each arch you pass is a new day. Hop counter to counter and jump right over the stall whose plate is today.',
    par: 30,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').fill(6, 19, 15, 17, '.').rows(),
    build(w: World) {
      door(w);
      const st = market(w, 'shl9');
      arch(w, st, 3.5);
      row(w, st, 6, [3, 1, 4, 2]);
      onPass(w, px(2), (w2) => tara(w2, L.intro[7], 2.2));
      sign(w, 22, 10.2, 3.4, 'ÏEWDUH', 'shop', null, 'the eight-day market');
      rival(w, 29, 15, -1, taraScript(9));
      collectible(w, 'shl-pumaloi', 12.5, 10.0);
    },
  };
}

/** act 1: a second arch and the day turns: yesterday's closed stall is open and another is closed */
export const actTwo: Act = {
  id: 'shl09-sngi',
  w: 26,
  advice: 'Another arch: another day. The stall that was closed is open, and the one with today’s plate is the frame. Read the board, then jump the stall whose plate matches.',
  paint: (g, c) => {
    g.fill(c.x + 6, c.x + 19, 15, 17, '.');
  },
  build: (w, c) => {
    const st = w.flags.shl9 as Market;
    arch(w, st, c.x + 2);
    row(w, st, c.x + 6, [4, 2, 1, 3]);
    sign(w, c.x + 22, 10.4, 3, 'DAY TWO', 'shop', null, 'the plates stay, the day moves');
  },
};

/** act 2: two arches with blank boards (washed by the rain): the arches are the days, count them */
export const actBlank: Act = {
  id: 'shl09-kot',
  w: 46,
  advice: 'The rain has washed the boards blank. The arches are still the days: count them. The third arch is day three, the fourth is day four.',
  cps: [21.5],
  paint: (g, c) => {
    g.fill(c.x + 6, c.x + 19, 15, 17, '.');
    g.fill(c.x + 27, c.x + 40, 15, 17, '.');
  },
  build: (w, c) => {
    const st = w.flags.shl9 as Market;
    arch(w, st, c.x + 2, { board: 'blank' });
    row(w, st, c.x + 6, [4, 2, 3, 5]);
    arch(w, st, c.x + 24, { board: 'blank' });
    row(w, st, c.x + 27, [5, 3, 4, 6]);
    sign(w, c.x + 43, 10.4, 3, 'WASHED', 'shop', null, 'no boards: count the arches');
  },
};

/** act 3: a long row with the arch in its middle: the day turns while you are on the counters */
export const actMid: Act = {
  id: 'shl09-pdeng',
  w: 38,
  advice: 'A long row, and the arch stands in the middle of it. The day turns as you pass under it: a stall beyond the arch with tomorrow’s plate is a frame by the time you reach it. Read the plates beyond the arch with the next day in mind.',
  paint: (g, c) => {
    g.fill(c.x + 6, c.x + 31, 15, 17, '.');
  },
  build: (w, c) => {
    const st = w.flags.shl9 as Market;
    arch(w, st, c.x + 2);
    // one long counter; the arch stands on the counter between pitch 4 and 5 and turns the day to six
    row(w, st, c.x + 6, [4, 5, 7, 8, 8, 6, 7, 5], { causeFor: (plate, day) => (plate === 6 && day === 6 ? 'shl-shift' : 'shl-closed') });
    arch(w, st, c.x + 19);
    sign(w, c.x + 34, 10.4, 3, 'MID-ROW', 'shop', null, 'the arch stands in the row');
  },
};

/** act 4: the keeper of an open stall has sold out and packs up as you come: boards off means closed, plate or no plate */
export const actPack: Act = {
  id: 'shl09-doh',
  w: 30,
  advice: 'The fish stall has sold out: its keeper takes the boards off as you come, whatever its plate says. A stall with its boards leaning against the frame is closed too. Today’s plate is one frame; the packed stall is another.',
  paint: (g, c) => {
    g.fill(c.x + 6, c.x + 22, 15, 17, '.');
  },
  build: (w, c) => {
    const st = w.flags.shl9 as Market;
    arch(w, st, c.x + 2);
    row(w, st, c.x + 6, [1, 7, 2, 8, 3], { pack: { i: 3, at: c.x + 8 } });
    sign(w, c.x + 25, 10.4, 3, 'SOLD OUT', 'shop', null, 'boards off, stall shut');
  },
};

/** ending: the last arch's board was flipped by a keeper (it shows yesterday); after day 8 comes day 1 */
export const ending: Ending = {
  space: 22,
  advice: 'The keeper by the last arch has flipped its board: it shows yesterday. Trust the arches, not the paint: this is the eighth day, and the stall with plate 8 is the frame.',
  paint: (g, D) => {
    g.fill(D - 17, D - 4, 15, 17, '.');
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    const st = w.flags.shl9 as Market;
    w.flags.twist = 'board';
    arch(w, st, D - 20, { board: 7, keeper: true });
    row(w, st, D - 17, [6, 8, 7, 1], { causeFor: (plate) => (plate === 8 ? 'shl-board' : 'shl-closed') });
  },
};

export const meta09 = { family: 'day-cycle-rearranged-stalls', betrayals: ['day-cycle'], ending: 'shl-board' };
