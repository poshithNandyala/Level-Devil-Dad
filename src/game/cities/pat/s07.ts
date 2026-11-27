// PAT-07 Tempo: a marathon on a shared tempo. The deck leans to whichever side has more weight: riders board on
// the kerb (right) side, a truck overtaking on the road (left) side pulls the other way. Pass an arch or a hump
// while leaning and you scrape it. Stand where the weights cancel. Act two: the tempo stand, where the gap between
// two parked tempos closes as a third backs in. Door: the hand-hauled basket lift.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { Rig, box, folk } from './entities';
import { cyc, since, taraScript } from './common';
import { tempoArt } from './s01';
import { lines as L } from './lines';

const FL = 240;
const DECK_W = 112;
const DECK_Y = 224;
const V = 80;

export interface Beat {
  /** tempo centre x (px) where a passenger boards (+1) or alights (-1), at a halt */
  stops: { at: number; d: number }[];
  /** a truck overtaking on the road side while the centre is in [a, b] */
  trucks: { a: number; b: number }[];
  /** things to scrape: x (px) and the cause */
  scrapes: { x: number; cause: string; kind: 'arch' | 'hump' }[];
}
export const BEATS: Beat = { stops: [], trucks: [], scrapes: [] };

export interface TempoState {
  rig: Rig;
  /** passengers on the kerb side */
  P: number;
  truck: boolean;
  lean: number;
  cx: number;
  halted: boolean;
}

/** build the tempo in the room; acts add beats to it through w.flags.pat7 */
function tempo(w: World, x0: number): TempoState {
  const st = { P: 0, PL: 0, truck: false, lean: 0, cx: 0, halted: true, beats: { stops: [] as { at: number; d: number; side?: 'L'; done?: boolean; t?: number }[], trucks: [] as { a: number; b: number; side?: 'R' }[], scrapes: [] as { x: number; cause: string; kind: 'arch' | 'hump'; done?: boolean }[] }, rig: null as unknown as Rig, go: -1, v: 0, boarded: false, stopAt: Infinity, base: 0 };
  const rig = w.add(
    new Rig(x0, DECK_Y, DECK_W, 12, {
      solid: true,
      layer: 2,
      tick: (r, w2) => {
        const p = w2.player;
        const cx = r.x + DECK_W / 2;
        st.cx = cx;
        // the room: a passenger climbs on at 1.5 s; the tempo pulls out at 3.5 s
        const t = w2.tick / 120;
        if (t >= 1.5 && !st.boarded) {
          st.boarded = true;
          st.P += 1;
        }
        // stops: halt at each beat's x for 2.5 s; the passenger boards (or gets off) as it halts
        let hold = false;
        for (const s of st.beats.stops) {
          if (!s.done && cx >= s.at) {
            s.done = true;
            s.t = w2.tick;
            if (s.side === 'L') st.PL = Math.max(0, st.PL + s.d);
            else st.P = Math.max(0, st.P + s.d);
            w2.sfx('honk', cx, FL - 30);
          }
          if (s.t !== undefined && w2.tick - s.t < 300) hold = true;
        }
        const leaving = t >= 3.5 && !hold && cx < st.stopAt;
        st.halted = !leaving;
        st.v = leaving ? Math.min(V, st.v + 100 / 120) : Math.max(0, st.v - 200 / 120);
        r.solid!.velX = st.v;
        if (st.v > 0) r.moveTo(w2, r.x + st.v / 120, r.y);
        // weights
        st.truck = st.beats.trucks.some((q) => cx >= q.a && cx <= q.b && !q.side);
        const kerbTruck = st.beats.trucks.some((q) => cx >= q.a && cx <= q.b && q.side === 'R');
        const onDeck = w2.standing(r.solid!);
        const rel = p.cx - cx;
        const dadR = onDeck && rel > 12 ? 1 : 0;
        const dadL = onDeck && rel < -12 ? 1 : 0;
        const net = st.P - st.PL + (kerbTruck ? 1 : 0) + dadR - ((st.truck ? 1 : 0) + dadL);
        st.lean = Math.max(-1, Math.min(1, net));
        st.base = st.P - st.PL + (kerbTruck ? 1 : 0) - (st.truck ? 1 : 0);
        // scraping: pass an arch or a hump with the deck out of true
        for (const sc of st.beats.scrapes) {
          if (!sc.done && Math.abs(cx - sc.x) < 34 && st.lean !== 0 && onDeck) {
            sc.done = true;
            w2.die(sc.cause);
          }
        }
      },
      paint: (ctx, r) => {
        ctx.save();
        ctx.translate(r.x + DECK_W / 2, r.y + 12);
        ctx.rotate(st.lean * 0.07);
        tempoArt(ctx, -DECK_W / 2, -50, DECK_W, 50);
        // the riders on the kerb side
        for (let i = 0; i < st.P; i++) folk(ctx, DECK_W / 2 - 14 - i * 9, -44, 20, ['#D7262E', '#2F6BB0'][i % 2]);
        for (let i = 0; i < st.PL; i++) folk(ctx, -DECK_W / 2 + 14 + i * 9, -44, 20, ['#8A4A8F', '#6F8F3A'][i % 2]);
        ctx.restore();
      },
    }),
  );
  st.rig = rig;
  w.flags.pat7 = st;
  return st as unknown as TempoState;
}

/** an arch (a hoarding gate) or a hump in the road, drawn where the tempo will scrape it */
function obstacle(w: World, x: number, kind: 'arch' | 'hump') {
  w.add(
    new Paint((ctx) => {
      if (kind === 'arch') {
        box(ctx, x - 40, FL - 74, 5, 74, '#6B3F1C');
        box(ctx, x + 36, FL - 74, 5, 74, '#6B3F1C');
        box(ctx, x - 40, FL - 78, 81, 8, '#D7262E');
        box(ctx, x - 36, FL - 76, 73, 2, '#F2B705');
      } else {
        ctx.fillStyle = '#7A6A58';
        ctx.beginPath();
        ctx.moveTo(x - 30, FL);
        ctx.quadraticCurveTo(x, FL - 16, x + 30, FL);
        ctx.fill();
        for (let i = -2; i <= 2; i++) box(ctx, x + i * 9 - 2, FL - 7 + Math.abs(i), 4, 2, '#F2B705');
      }
    }, 3),
  );
}

export function room(): LevelDef {
  return {
    id: 'PAT-07',
    city: 'PAT',
    index: 7,
    name: 'Tempo',
    nameEn: 'The shared tempo',
    tagline: 'Seats six, carries twelve, and leans toward whoever got on last.',
    hint: 'Climb on the tempo before it pulls out. The deck tips towards the heavier side: riders board on the kerb side (right), so you stand on the road side (left) to even it, and a truck overtaking on the road side pulls the other way, so when it is passing stand in the middle. A tilted deck scrapes every arch and hump: balance before each one, not at it.',
    par: 70,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const st = tempo(w, px(10)) as unknown as { beats: { scrapes: { x: number; cause: string; kind: 'arch' | 'hump' }[] } };
      st.beats.scrapes.push({ x: px(27), cause: 'pat-torana', kind: 'arch' });
      obstacle(w, px(27), 'arch');
      w.add(
        new Paint((ctx) => {
          // the tempo stand: a shelter and a kerb
          box(ctx, px(2), FL - 36, 3, 36, '#555');
          box(ctx, px(2) - 12, FL - 42, 40, 6, '#2F6BB0');
        }, -4),
      );
      sign(w, 6, 10.4, 3.4, 'TEMPO STAND', 'shop', null, 'Dak Bungalow');
      rival(w, 4, 15, 1, taraScript(7));
      collectible(w, 'pat-kulhad', 23.5, 8.6);
    },
  };
}

/** a truck overtaking on the road side: a long cab drawn passing behind the tempo */
function truckArt(w: World, a: number, b: number) {
  w.add(
    new Paint((ctx, w2) => {
      const st = w2.flags.pat7 as { cx: number };
      if (st.cx >= a - 120 && st.cx <= b + 120) {
        const k = Math.max(0, Math.min(1, (st.cx - (a - 100)) / (b - a + 200)));
        const tx = st.cx - 200 + k * 420;
        box(ctx, tx, FL - 54, 92, 44, '#3B6EA5');
        box(ctx, tx + 70, FL - 62, 22, 18, '#F2B705');
        box(ctx, tx, FL - 12, 92, 4, '#222');
        ctx.fillStyle = '#1D1A1A';
        for (const wx of [14, 36, 78]) {
          ctx.beginPath();
          ctx.arc(tx + wx, FL - 8, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }, -5),
  );
}

export const act1: Act = {
  id: 'pat07-sadak',
  w: 70,
  advice: 'The road: a truck overtakes on your side, so stand in the middle while it passes and over the first hump. Then the rider is alone again, so back to the road side for the second hump. At the next halt the rider gets off: stand in the middle for the arch.',
  cps: [20, 45],
  build: (w, c) => {
    const st = w.flags.pat7 as { beats: { trucks: { a: number; b: number; side?: 'R' }[]; scrapes: { x: number; cause: string; kind: 'arch' | 'hump' }[]; stops: { at: number; d: number }[] } };
    // centre positions (px): the act starts at c.x; the tempo centre is ~ 7 tiles behind the door
    const X = (t: number) => c.X(t);
    st.beats.trucks.push({ a: X(10), b: X(26) });
    truckArt(w, X(10), X(26));
    st.beats.scrapes.push({ x: X(18), cause: 'pat-dhakka', kind: 'hump' });
    obstacle(w, X(18), 'hump');
    st.beats.scrapes.push({ x: X(34), cause: 'pat-dhakka', kind: 'hump' });
    obstacle(w, X(34), 'hump');
    st.beats.stops.push({ at: X(46), d: -1 });
    st.beats.scrapes.push({ x: X(60), cause: 'pat-torana', kind: 'arch' });
    obstacle(w, X(60), 'arch');
    sign(w, c.x + 44, 10.4, 3, 'HALT', 'shop', null, 'get off here');
  },
};

type Beats = { stopAt: number; beats: { trucks: { a: number; b: number; side?: 'R' }[]; scrapes: { x: number; cause: string; kind: 'arch' | 'hump' }[]; stops: { at: number; d: number; side?: 'L' }[] } };
/** an act of the road made only of beats (stops, trucks, scrapes), given as [kind, column, ...] in act columns */
function road(w: World, c: { X: (t: number) => number; x: number }, b: { stops?: [number, number, 'L'?][]; trucks?: [number, number, 'R'?][]; scrapes?: [number, 'arch' | 'hump'][] }, signs: [number, string, string][]) {
  const st = w.flags.pat7 as Beats;
  for (const [at, d, side] of b.stops ?? []) st.beats.stops.push({ at: c.X(at), d, side });
  for (const [a, e, side] of b.trucks ?? []) {
    st.beats.trucks.push({ a: c.X(a), b: c.X(e), side });
    truckArt(w, c.X(a), c.X(e));
  }
  for (const [x, kind] of b.scrapes ?? []) {
    st.beats.scrapes.push({ x: c.X(x), cause: kind === 'arch' ? 'pat-torana' : 'pat-dhakka', kind });
    obstacle(w, c.X(x), kind);
  }
  for (const [t, label, sub] of signs) sign(w, c.x + t, 10.4, 3.2, label, 'shop', null, sub);
}

/** the bridge: a rider gets on on the ROAD side, so the deck leans the other way from before */
export const actPul: Act = {
  id: 'pat07-pul',
  w: 92,
  advice: 'Over the bridge: this time the rider who gets on sits on the road side, so the lean is the other way round: stand on the kerb side for the first hump and the arch. When he gets off, level again. Then a truck on the road side with a hump in it, and nobody else aboard: the kerb side again. Then a last arch.',
  cps: [47.5],
  build: (w, c) => road(w, c, { stops: [[10, 1, 'L'], [46, -1, 'L']], trucks: [[54, 70]], scrapes: [[24, 'hump'], [34, 'arch'], [62, 'hump'], [82, 'arch']] }, [[4, 'PUL', 'the bridge']]),
};

/** the haat: riders on both sides, so they cancel, then one leaves */
export const actHaat: Act = {
  id: 'pat07-haat',
  w: 92,
  advice: 'The haat: a rider on the kerb side, then one on the road side: they cancel, so stand in the middle for the hump. When the kerb rider gets off, the road side is heavy: kerb side for the arch. Then a kerb-side truck evens it up again, with a hump in it, and the last rider gets off.',
  cps: [26, 40, 63],
  build: (w, c) => road(w, c, { stops: [[8, 1], [20, 1, 'L'], [46, -1], [84, -1, 'L']], trucks: [[64, 80, 'R']], scrapes: [[34, 'hump'], [56, 'arch'], [72, 'hump']] }, [[4, 'HAAT', 'weekly market']]),
};

/** the mandi: the shelter beat (a halt right before a hump: balance during it) and the momentum beat (no stops, three in a row) */
export const actMandi: Act = {
  id: 'pat07-mandi',
  w: 92,
  advice: 'The mandi: a rider gets on, a road-side truck comes alongside and evens it, a hump in the middle of it. A second rider gets on at the halt: a heavy kerb side with the truck still pulling the other way, so the road side for the next hump. Then no halts at all: an arch, a hump and an arch, one after another.',
  cps: [14, 62],
  build: (w, c) => road(w, c, { stops: [[8, 1], [40, 1], [56, -1], [82, -1]], trucks: [[20, 34], [44, 60]], scrapes: [[27, 'hump'], [52, 'hump'], [72, 'arch'], [78, 'hump'], [86, 'arch']] }, [[4, 'MANDI', 'grain market']]),
};

export const act2: Act = {
  id: 'pat07-adda',
  w: 76,
  advice: 'The last stretch into the stand: a truck passes on the kerb side this time, pushing the other way, then a hump, then two arches with a rider getting on between them. Work out who is pulling which side before each one. The tempo stops at the stand: hop off, and cross the lane between the two parked tempos only while the third is out of it: it backs in to close the gap and drives out again.',
  cps: [8, 30],
  build: (w, c) => {
    const st = w.flags.pat7 as { stopAt: number; beats: { trucks: { a: number; b: number; side?: 'R' }[]; scrapes: { x: number; cause: string; kind: 'arch' | 'hump' }[]; stops: { at: number; d: number }[] } };
    const X = (t: number) => c.X(t);
    st.beats.trucks.push({ a: X(6), b: X(22), side: 'R' });
    st.beats.scrapes.push({ x: X(14), cause: 'pat-dhakka', kind: 'hump' });
    obstacle(w, X(14), 'hump');
    st.beats.stops.push({ at: X(28), d: 1 });
    st.beats.scrapes.push({ x: X(40), cause: 'pat-torana', kind: 'arch' });
    obstacle(w, X(40), 'arch');
    st.stopAt = X(44);
    sign(w, c.x + 49.5, 10.4, 3.2, 'ADDA', 'shop', null, 'tempo stand');
    // the stand: two parked tempos with a lane between them; a third backs in from the road to close it, waits, and leaves
    const P = 7;
    const lane0 = px(c.x + 59);
    const ph = (w2: World) => cyc(w2, P, 0);
    for (const [x0, flip] of [[c.x + 53, false], [c.x + 63, true]] as [number, boolean][])
      w.add(new Rig(px(x0), FL - 40, 80, 40, { layer: -3, paint: (ctx, r) => tempoArt(ctx, r.x, r.y - 10, r.w, 50, flip) }));
    const third = w.add(
      new Rig(lane0 + 130, FL - 44, 56, 44, {
        layer: 3,
        cause: 'pat-bhid',
        inset: 2,
        live: (r) => r.s.k > 0.02,
        tick: (r, w2) => {
          const t = ph(w2);
          // 0-2.6 out of the lane, 2.6-3.8 backs in, 3.8-5.8 parked in it, 5.8-7 drives out
          const k = t < 2.6 ? 0 : t < 3.8 ? (t - 2.6) / 1.2 : t < 5.8 ? 1 : 1 - (t - 5.8) / 1.2;
          r.s.k = k;
          r.x = lane0 - 4 + (1 - k) * 134;
        },
        paint: (ctx, r) => tempoArt(ctx, r.x, r.y, 56, 44, true),
      }),
    );
    w.flags.pat7g = { third, lane0, P };
  },
};

export const ending: Ending = {
  space: 14,
  advice: 'The door is up on the loft above the stand. Step into the hauled basket at the bottom, ride it up, and step off at the top at once: the rope slips if you linger.',
  paint: (g, D) => {
    g.put(D, 14, '.');
    g.fill(D - 1, D + 4, 10, 14, '#');
    g.fill(D - 4, D - 2, 15, 16, '.');
    g.put(D + 1, 9, 'E');
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'basket';
    const P = 9;
    const basket = w.add(
      new Rig(px(D - 4) + 4, FL, 40, 8, {
        solid: true,
        layer: 2,
        cause: 'pat-rassi',
        inset: -1,
        live: (b) => b.s.snap === true,
        tick: (b, w2) => {
          const t = cyc(w2, P, 0);
          // down 0-2, up 2-4.5, top 4.5-6.2, then the rope slips and it drops 6.2-6.5 and rests down
          const k = t < 2 ? 0 : t < 4.5 ? (t - 2) / 2.5 : t < 6.2 ? 1 : t < 6.6 ? 1 - (t - 6.2) / 0.4 : 0;
          b.s.snap = t >= 6.2 && t < 6.6;
          b.s.k = k;
          b.moveTo(w2, b.x, FL - k * 80);
        },
        paint: (ctx, b) => {
          box(ctx, b.x + 19, 0, 2, b.y, '#8A6A3A');
          box(ctx, b.x - 6, FL - 2, 52, 2, 'rgba(0,0,0,0.25)');
          box(ctx, b.x, b.y, b.w, 8, '#C9A56B');
          box(ctx, b.x, b.y - 8, 3, 8, '#8A6A3A');
          box(ctx, b.x + b.w - 3, b.y - 8, 3, 8, '#8A6A3A');
        },
      }),
    );
    w.flags.pat7b = basket;
  },
};

export const meta07 = { family: 'vehicle-leans-to-rider-side', betrayals: ['lean-balance', 'parked-gap-closes'], ending: 'pat-hauled-basket' };
void since;
void tara;
void L;
