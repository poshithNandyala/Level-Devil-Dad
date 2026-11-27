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
  /** closed on this day (the plate) */
  closedOn: (day: number, w: World) => boolean;
  cause: (day: number) => string;
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
 * frame with no boards: it is not solid. The drain under the row is deadly; `drainCause` is its line (and `causeFor`
 * a closed counter's). Row columns: c0 .. c0 + 3n + 1; bank at c0 + 3n + 2.
 */
export function row(w: World, st: Market, c0: number, plates: number[], o: { causeFor?: (plate: number, day: number) => string; dryOn?: number; drainCause?: string } = {}) {
  const n = plates.length;
  const x0 = px(c0);
  const x1 = px(c0 + n * 3 + 2);
  const pitches: Pitch[] = [];
  // what this row's drain says: the row's own line until Dad stands over a closed counter, then that counter's
  const nala = o.drainCause ?? 'shl-nala';
  let over = nala;
  plates.forEach((plate, i) => {
    const x = px(c0 + 1 + i * 3);
    const p: Pitch = {
      x,
      w: px(PITCH_W),
      plate,
      closedOn: (day) => plate === day,
      cause: (day) => (o.causeFor ? o.causeFor(plate, day) : 'shl-closed'),
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
          if (pl.x + pl.w > x + 2 && pl.x < x + rr.w - 2 && pl.y + pl.h >= TOP - 4 && pl.y + pl.h <= TOP + 20) {
            over = closed ? p.cause(st.day) : nala;
            st.cause = over;
          }
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
        },
      }),
    );
    if (r.solid) r.solid.velX = 0;
  });
  // the drain under the row; on the market's holiday (`dryOn`) the sluice is shut and the bed is dry: a floor two tiles down
  const dry = (w2: World) => o.dryOn !== undefined && st.day === o.dryOn;
  const bed = w.add(
    new Rig(x0, FL + 32, x1 - x0, 16, {
      solid: true,
      layer: 1,
      tick: (r, w2) => r.setSolid(dry(w2)),
      paint: () => {},
    }),
  );
  if (bed.solid) bed.solid.velX = 0;
  w.add(
    new Rig(x0, FL + 2, x1 - x0, 30, {
      layer: 0,
      cause: nala,
      inset: 0,
      live: (_r, w2) => !dry(w2),
      tick: (r, w2) => {
        const pl = w2.player;
        if (!pitches.some((p) => pl.x + pl.w > p.x + 2 && pl.x < p.x + p.w - 2)) over = nala;
        if (r.hazard) r.hazard.cause = over;
      },
      paint: (ctx, r, w2) => {
        box(ctx, r.x, FL + 4, r.w, 40, '#3E4D47');
        if (dry(w2)) {
          // the dry bed: stones, a trickle
          box(ctx, r.x, FL + 30, r.w, 14, '#5C6F66');
          for (let x = r.x + 6; x < r.x + r.w; x += 11) box(ctx, x, FL + 28 + ((x * 7) % 3), 5, 3, '#9FB0A8');
          return;
        }
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

// Cut in fix round 1 (QA F6: one play of their own each, the other being the room's NAIVE or FIX): `shl09-sngi` (another
// arch, another day: the room's read with the day advanced) and `shl09-doh` (the sold-out stall: no second trap of its
// own that is not the room's plate read). The days now run: room 1; kot 2, 3; pdeng 4, 5; holiday 6, then 7 and 8.

/** act: two arches with blank boards (washed by the rain): the arches are the days, count them. Each row's fall has its own line */
export const actBlank: Act = {
  id: 'shl09-kot',
  w: 46,
  advice: 'The rain has washed the boards blank. The arches are still the days: count them. The second arch is day two, the third is day three.',
  cps: [21.5],
  paint: (g, c) => {
    g.fill(c.x + 6, c.x + 19, 15, 17, '.');
    g.fill(c.x + 27, c.x + 40, 15, 17, '.');
  },
  build: (w, c) => {
    const st = w.flags.shl9 as Market;
    arch(w, st, c.x + 2, { board: 'blank' });
    row(w, st, c.x + 6, [4, 2, 3, 5], { causeFor: () => 'shl-kot-two' });
    arch(w, st, c.x + 24, { board: 'blank' });
    row(w, st, c.x + 27, [5, 3, 4, 6], { causeFor: () => 'shl-kot-three' });
    sign(w, c.x + 43, 10.4, 3, 'WASHED', 'shop', null, 'no boards: count the arches');
  },
};

/** act 2: a long row with the arch in its middle: the day turns while you are on the counters */
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
    // one long counter; the arch stands on the counter between pitch 4 and 5 and turns the day from four to five
    row(w, st, c.x + 6, [7, 4, 8, 6, 8, 5, 7, 6], { causeFor: (plate, day) => (plate === 5 && day === 5 ? 'shl-shift' : 'shl-closed') });
    arch(w, st, c.x + 19);
    sign(w, c.x + 34, 10.4, 3, 'MID-ROW', 'shop', null, 'the arch stands in the row');
  },
};

/** act 3: the market's day off: every stall a frame and the sluice shut, so the drain bed is dry; then a double arch turns two days at once */
export const actHoliday: Act = {
  id: 'shl09-sngi-khlieh',
  w: 58,
  advice: 'The sixth day is the market’s day off: every stall is a frame, and the sluice is shut, so the drain bed is dry. Drop into the bed and walk under the frames. Then a double arch, two gates a step apart: two days at once, so count gates, not arches: seven and eight. The sluice is open again under that row.',
  cps: [30],
  paint: (g, c) => {
    g.fill(c.x + 6, c.x + 25, 15, 17, '.');
    // the dry bed of the holiday row: a floor two tiles down
    g.fill(c.x + 6, c.x + 25, 17, 17, '#');
    g.fill(c.x + 37, c.x + 50, 15, 17, '.');
  },
  build: (w, c) => {
    const st = w.flags.shl9 as Market;
    arch(w, st, c.x + 2);
    row(w, st, c.x + 6, [6, 6, 6, 6, 6, 6], { dryOn: 6 });
    arch(w, st, c.x + 32);
    arch(w, st, c.x + 33.2);
    row(w, st, c.x + 37, [7, 8, 2, 4], { causeFor: () => 'shl-two-gates', drainCause: 'shl-sluice' });
    sign(w, c.x + 28, 10.4, 3, 'DAY OFF', 'shop', null, 'day six: everything shut');
    sign(w, c.x + 53, 10.4, 3, 'TWO GATES', 'shop', null, 'two days at once');
  },
};

/** the plain door of 09 lives in endings.ts (QA F2: the flipped board re-asked `kot`'s count) */
export const ending: Ending | null = null;

export const meta09 = { family: 'day-cycle-rearranged-stalls', betrayals: ['day-cycle'], ending: 'shl-board' };
