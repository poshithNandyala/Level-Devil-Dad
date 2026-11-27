// Proven routes for Patna: every stage's room, its acts and its door, plus the plays that must die.
// Found by tests/city-tests.ts; merged into SOLUTIONS, NAIVE, FIX, MISTAKES, ACT_ROUTES and ENDING_POLICIES.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import { Step, X, and, ground, done } from '../runner';
import type { CityTests } from '../city-tests';
import { LEVEL_BY_ID } from '../../src/game/levels';
import { extent } from '../../src/game/cities/pat/s03';

type Move = 'L' | 'R' | '';
type Out = { move: Move; jump: boolean };
interface Mem {
  hold: number;
  [k: string]: any;
}
type Policy = (w: World, m: Mem, d: Door) => Out;
const px = (t: number) => t * 16;
const FLOOR_PX = 15 * 16;
const go = (move: Move): Out => ({ move, jump: false });
const toward = (w: World, x: number, slack = 2): Move => {
  const c = w.player.cx;
  return c < x - slack ? 'R' : c > x + slack ? 'L' : '';
};
void toward;
void go;
void px;
void FLOOR_PX;
/** on the road (not up on a deck), standing, at or past column x */
const road = (x: number) => and(ground, X(x), (w: World) => w.player.y >= 224);
const hop = (at: number, note: string, ticks = 12): Step[] => [
  { hold: 'R', until: X(at), max: 900 },
  { hold: 'R', jump: ticks, ticks, note },
  { hold: 'R', until: ground, max: 300 },
];

// ------------------------------------------------------------------ PAT-01
const tourRoute = (): Step[] => [
  ...hop(10.4, 'a shallow ditch'),
  ...hop(20.7, 'a step up'),
  ...hop(22.7, 'a step up'),
  ...hop(36.6, 'a post'),
  ...hop(39.6, 'a post'),
  ...hop(42.6, 'a post'),
  { hold: 'R', until: X(49.8), max: 900 },
  { hold: 'R', jump: 14, ticks: 14, note: 'hop the parked cart' },
  { hold: 'R', until: (w) => w.player.onGround && w.player.y > 220, max: 400 },
  { hold: 'R', until: X(65.4), max: 600, note: 'the horn: up on the kerb board' },
  { hold: 'R', jump: 13, ticks: 13, note: 'up on the kerb board' },
  { hold: 'R', until: ground, max: 200 },
  { hold: '', until: (w) => !!w.flags.pat1?.crowd?.s.boarded, max: 900, note: 'let the crowd go by underneath' },
  { hold: 'R', until: road(88), max: 900, note: 'on, before the tempo pulls out' },
  ...hop(89.4, 'the low wall'),
  { hold: 'R', until: X(92.4), max: 300 },
  { hold: 'R', jump: 12, ticks: 12, note: 'up on the deck' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', until: road(100.5), max: 600, note: 'off the deck' },
  { hold: '', until: (w) => w.flags.pat1h?.phase === 'down', max: 600, note: 'wait for the hoarding to land' },
  { hold: 'R', until: X(102.8), max: 300 },
  { hold: 'R', jump: 14, ticks: 14, note: 'hop the hoarding' },
  { hold: 'R', until: done, max: 900 },
];

// ------------------------------------------------------------------ PAT-02
const t2 = (w: World) => (w.tick - w.flags.pat2.t0) / 120;
const room02 = (): Step[] => [
  { hold: 'R', until: X(6.5), max: 600 },
  { hold: '', until: (w) => w.flags.pat2.t0 >= 0 && t2(w) >= 1.3, max: 400, note: 'the first strike goes in at the crack: wait' },
  { hold: 'R', until: X(13.2), max: 300, note: 'on, between the cracks' },
  { hold: '', until: (w) => t2(w) >= 3.2, max: 600, note: 'the second strike' },
  { hold: 'R', until: X(19.2), max: 300 },
  { hold: '', until: (w) => t2(w) >= 5.05, max: 600, note: 'the third strike' },
  { hold: 'R', until: X(27), max: 600, note: 'out of the bed before the rake' },
];
/** the act's bed: behind the rolling litti until its strike has gone, then past it */
function pastMarker(w: World): Out {
  const st = w.flags.pat2a as { t0: number; x: number };
  const p = w.player;
  if (st.t0 < 0 || st.x === 0) return go('R');
  const into = ((w.tick - st.t0) / 120) % 2.6;
  const t = (w.tick - st.t0) / 120;
  if (p.cx > st.x + 30) return go('R');
  if (p.cx > st.x - 40 && p.cx < st.x + 30) return go('R');
  if (p.cx > st.x - 90 && !(t >= 1.5 && into >= 0.6 && into <= 1.2)) return go('');
  return go('R');
}
/** behind each litti until its strike has gone, then past it (only the first `n` of them) */
const pastMarkers = (key: string, n = 9): ((w: World) => Out) => (w) => {
  const st = w.flags[key] as { t0: number; xs: number[]; offs: number[] };
  const p = w.player;
  const i = st.xs.findIndex((x, k) => k < n && (x === 0 || p.cx <= x + 30));
  if (i < 0 || st.t0 < 0 || st.xs[i] === 0) return go('R');
  const x = st.xs[i];
  const t = (w.tick - st.t0) / 120 + st.offs[i];
  const into = t % 2.6;
  if (p.cx > x - 40) return go('R');
  if (p.cx > x - 90 && !(t >= 1.5 && into >= 0.6 && into <= 1.2)) return go('');
  return go('R');
};
const act02 = (x: number): Step[] => [{ policy: pastMarker, until: and(ground, X(x + 33)), max: 3000, note: 'behind the litti, then past it' }, { hold: 'R', until: X(x + 35.4), max: 400 }];
/** both pestles of the door: cross one just after it lifts, wait in the gap */
function pestles(w: World): Out {
  const cols = w.flags.pat2e as { x: number; w: number; s: { period: number; phase: number; down: number } }[];
  const p = w.player;
  const next = cols.find((c) => p.cx < c.x + c.w);
  if (!next) return go('R');
  const t = (((w.tick / 120 + next.s.phase) % next.s.period) + next.s.period) % next.s.period;
  const inside = p.cx >= next.x - 8;
  const open = t >= next.s.down + 0.1 && t <= next.s.down + 0.9;
  if (inside || open) return go('R');
  if (p.cx < next.x - 22) return go('R');
  return go('');
}
const pestlePolicy: Policy = (w) => pestles(w);

// ------------------------------------------------------------------ PAT-04
const t4 = (w: World) => (w.tick - w.flags.pat4.t0) / 120;
const climb4 = (): Step[] => [
  { hold: '', until: (w) => w.flags.pat4.t0 >= 0 && t4(w) >= 6.0, max: 1200, note: 'wait at the foot: both porters have been and gone' },
  ...hop(1.7, 'the first step'),
  ...hop(3.7, 'the second step'),
  ...hop(5.7, 'the third step'),
  ...hop(7.7, 'the fourth step'),
  { hold: 'R', until: and(ground, X(27)), max: 900, note: 'over the landing and down the far stair' },
];
const room04 = (): Step[] => [...climb4(), { hold: 'R', until: X(29), max: 300 }];
const act04 = (x: number): Step[] => [
  { hold: 'R', until: (w) => w.player.y > 235, max: 600, note: 'down into the dome' },
  { hold: '', until: (w) => w.flags.pat4g.y <= 166, max: 1500, note: 'let the grain lift you to the ledge' },
  { hold: 'R', until: and(ground, X(x + 20.5), (w) => w.player.y <= 150), max: 300, note: 'step off on to the ledge' },
  { hold: 'R', until: X(x + 29.4), max: 600 },
];
/** the door of Golghar: stay back while it swings, walk in once it has swung */
const leafPolicy: Policy = (w, _m, d) => {
  const t = (w.tick / 120) % 5;
  const p = w.player;
  if (t >= 2.2 && t < 3.0) return go('R');
  if (p.cx < d.x - 80) return go('R');
  if (p.cx > d.x - 70 && t < 2.2 && p.cx < d.x - 62) return go('');
  return go(t >= 3.0 && p.cx > d.x - 62 ? 'R' : '');
};

// ------------------------------------------------------------------ PAT-05
/** across a pontoon: run on, and jump over any section the cart is on or about to be on, from the edge of the one before */
function deckPolicy(key: string, from: number): (w: World) => Out {
  let W: World | null = null;
  let jt = 0;
  return (w) => {
    if (W !== w) {
      W = w;
      jt = 0;
    }
    if (jt > 0) {
      jt--;
      return { move: 'R', jump: true };
    }
    const pt = w.flags[key] as { secs: { x: number }[]; carts: { s: { cx: number; dir: number } }[] };
    const p = w.player;
    // on the bank: wait for the cart to start rolling back towards you, then go and jump its section
    if (p.cx < pt.secs[0].x - 4) {
      if (p.cx < pt.secs[0].x - 14) return go('R');
      const c = pt.carts[0].s;
      return go(c.cx > pt.secs[from].x && c.cx < pt.secs[from].x + 80 && c.dir < 0 ? 'R' : '');
    }
    const ni = pt.secs.find((s) => s.x >= p.x + p.w - 6);
    if (ni && p.onGround && ni.x - (p.x + p.w) < 10 && pt.carts.some((c) => Math.abs(c.s.cx - (ni.x + 20)) < 28)) {
      jt = 15;
      return { move: 'R', jump: true };
    }
    return go('R');
  };
}
const room05 = (): Step[] => [{ policy: deckPolicy('pat5', 3), until: and(ground, X(21.2)), max: 1500, note: 'over the pontoon, jumping the cart’s section' }, { hold: 'R', until: X(29), max: 300 }];
const act05 = (x: number): Step[] => [{ policy: deckPolicy('pat5a', 3), until: and(ground, X(x + 29.2)), max: 2500, note: 'across the long deck' }, { hold: 'R', until: X(x + 36), max: 300 }];
/** the last float: wait at the bank edge for it to come back in, then walk aboard to the door */
const floatPolicy: Policy = (w) => {
  const f = w.flags.pat5e as { s: { x0: number } };
  const st = w.flags.pat5t as { t0: number };
  const p = w.player;
  const t = st.t0 < 0 ? 0 : (((w.tick - st.t0) / 120) % 10 + 10) % 10;
  if (t >= 8.0 || t < 0.2) return go('R');
  if (p.cx < f.s.x0 - 14) return go('R');
  return go('');
};

// ------------------------------------------------------------------ PAT-06
const room06 = (): Step[] => [
  { hold: 'R', until: X(18.0), max: 900, note: 'over plates 1 and 2: walk' },
  { hold: 'R', jump: 12, ticks: 12, note: 'the seam with no plate: jump, deck to deck' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', until: X(29), max: 600, note: 'plate 4: walk' },
];
const act06 = (x: number): Step[] => [
  { hold: 'R', until: X(x + 12.0), max: 900 },
  { hold: 'R', jump: 12, ticks: 12, note: 'plate 2 is a tarp (two sacks)' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', until: X(x + 26.0), max: 900 },
  { hold: 'R', jump: 12, ticks: 12, note: 'so is 4' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', until: X(x + 39.0), max: 900 },
  { hold: 'R', jump: 12, ticks: 12, note: 'and 6' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', until: X(x + 43.4), max: 600 },
];
/** the booth: step on the strip, stand still while the barrier slams, walk in when it is up */
const tollPolicy: Policy = (w) => {
  const st = w.flags.pat6e as { down: number };
  if (st.down >= 0 && (w.tick - st.down) / 120 < 3.2) return go('');
  return go('R');
};

// ------------------------------------------------------------------ PAT-07
type T7 = { cx: number; base: number; P: number; rig: { x: number; y: number }; stopAt: number; beats: { stops: { t?: number }[] } };
/** board the tempo, keep it level (stand opposite the heavier side), step off at the stand, cross the lane when the third is out */
function rideBalanced(withTruck: boolean, wide: boolean, force?: number, boardX = px(20)): (w: World) => Out {
  let W: World | null = null;
  let jt = 0;
  return (w) => {
    if (W !== w) {
      W = w;
      jt = 0;
    }
    if (jt > 0) {
      jt--;
      return { move: 'R', jump: true };
    }
    const st = w.flags.pat7 as T7;
    const p = w.player;
    const riding = p.onGround && p.y + p.h <= 224 + 1 && p.cx > st.rig.x - 2 && p.cx < st.rig.x + 114;
    if (!riding && p.cx < st.rig.x - 4 && st.rig.x < boardX) {
      if (p.onGround && p.cx > st.rig.x - 16) {
        jt = 12;
        return { move: 'R', jump: true };
      }
      return go('R');
    }
    const g = wide ? undefined : (w.flags.pat7g as { lane0: number; P: number } | undefined);
    if (riding && st.cx >= st.stopAt - 1) return go('R');
    if (riding) {
      const base = force ?? (withTruck ? st.base : st.P);
      const off = base > 0 ? -34 : base < 0 ? 34 : 0;
      return go(toward(w, st.cx + off, 4));
    }
    if (g && p.onGround) {
      const t = ((w.tick / 120) % g.P + g.P) % g.P;
      if (p.cx < g.lane0 - 34) return go('R');
      if (p.cx < g.lane0 - 20 && !(t < 1.4)) return go('');
      return go('R');
    }
    return go('R');
  };
}
const room07 = (): Step[] => [{ policy: rideBalanced(true, false), until: X(31.5), max: 2400, note: 'on to the tempo, to the road side while the rider sits on the kerb side' }];
const act07a = (x: number): Step[] => [{ policy: rideBalanced(true, false), until: X(x + 69), max: 4000, note: 'balance for the truck, the humps, the halt and the arch' }];
const act07b = (x: number): Step[] => [{ policy: rideBalanced(true, false), until: X(x + 75.2), max: 4500, note: 'the kerb-side truck, the rider, the stand and the lane' }];
/** the hauled basket: step in when it is down, off at the top at once */
const basketPolicy: Policy = (w, _m, d) => {
  const b = w.flags.pat7b as { x: number; y: number; s: { k: number } };
  const p = w.player;
  const t = (w.tick / 120) % 9;
  void d;
  if (b.s.k >= 0.97 && p.y + p.h <= 161) return go('R');
  if (p.cx > b.x + 4 && p.cx < b.x + 38 && p.y + p.h > 200) return go('');
  if (p.cx < b.x - 26) return go('R');
  return go(b.s.k < 0.01 && t < 1.5 ? 'R' : '');
};

// ------------------------------------------------------------------ PAT-08
const room08 = (): Step[] => [...hop(5.5, 'jump the hatch with 2 bricks'), ...hop(10.5, 'and the one with 4'), ...hop(15.5, 'and the one with 1'), { hold: 'R', until: X(34), max: 400, note: 'step on the hatch with 3 bricks' }];
const act08 = (x: number): Step[] => [...hop(x + 23.1, 'hop the last cell’s well'), { hold: 'R', until: X(x + 33.4), max: 600 }];
/** the library mound: jump the three decoy hatches, walk into the cell with no bricks */
const moundPolicy: Policy = (w, m) => {
  const hs = (w.flags.pat8e as { x: number }[]).slice().sort((a, b) => a.x - b.x);
  const p = w.player;
  if (m.hold > 0) return { move: 'R', jump: true };
  const h = hs.find((q) => q.x + 24 > p.x);
  if (h && p.onGround && w.tick > (m.cool ?? 0) && p.x + p.w >= h.x - 19 && p.x < h.x) {
    m.hold = 11;
    m.cool = w.tick + 45;
    return { move: 'R', jump: true };
  }
  return go('R');
};

// ------------------------------------------------------------------ PAT-09
type G9 = { t0: number; x0: number; x1: number; horse: { x: number } };
/** walk in the gap right behind the horse, at his pace */
function followHorse(key: string): (w: World) => Out {
  return (w) => {
    const g = w.flags[key] as G9;
    const p = w.player;
    if (g.t0 < 0 || g.horse.x > g.x1 + 40) return go('R');
    const want = g.horse.x - 26;
    return go(p.cx < want - 4 ? 'R' : p.cx > want + 6 ? 'L' : '');
  };
}
const room09 = (): Step[] => [{ policy: followHorse('pat9'), until: and(ground, X(28.5)), max: 3000, note: 'right behind the horse through the crowd' }, { hold: 'R', until: X(31.5), max: 300 }];
/** the wheel: an empty gondola on the way down, off at the far bank on its way up */
function wheelRide(key = 'pat9w'): (w: World) => Out {
  let W: World | null = null;
  let jt = 0;
  let cool = 0;
  let tgt: unknown = null;
  return (w) => {
    if (W !== w) {
      W = w;
      jt = 0;
      cool = 0;
      tgt = null;
    }
    if (jt > 0) {
      jt--;
      const t0 = tgt as unknown as { x: number } | null;
      return { move: t0 && w.player.cx >= t0.x + 8 ? '' : 'R', jump: true };
    }
    const st = w.flags[key] as { cx: number; occ: boolean[]; gond: { s: { th: number }; solid: any }[] };
    const p = w.player;
    const deg = (r: number) => (r * 180) / Math.PI;
    const edgeL = st.cx - 72;
    if (p.cx > st.cx + 74) return go('R');
    const on = st.gond.find((g) => w.standing(g.solid));
    if (on) {
      tgt = null;
      const d = deg(on.s.th);
      const gx = (on as unknown as { x: number }).x;
      if (d >= 14 && p.x + p.w < gx + 29) return go('R');
      if (d >= 22 && d <= 34 && w.tick > cool) {
        jt = 12;
        cool = w.tick + 60;
        return { move: 'R', jump: true };
      }
      return go('');
    }
    if (p.cx < edgeL - 8) return go('R');
    if (!p.onGround) {
      const t = tgt as unknown as { x: number } | null;
      return go(!t || p.cx < t.x + 8 ? 'R' : '');
    }
    if (p.onGround && w.tick > cool) {
      const occ = st.occ;
      const k = st.gond.findIndex((g, i) => !occ[i] && deg(g.s.th) >= -50 && deg(g.s.th) <= -38);
      if (k >= 0) {
        tgt = st.gond[k];
        jt = 12;
        cool = w.tick + 60;
        return { move: 'R', jump: true };
      }
    }
    return go('');
  };
}
const act09 = (x: number): Step[] => [
  { policy: wheelRide(), until: and(ground, X(x + 18.5)), max: 3000, note: 'across on an empty gondola' },
  { policy: followHorse('pat9b'), until: and(ground, X(x + 56)), max: 3000, note: 'behind the faster horse, waiting when he stops' },
  { hold: 'R', until: X(x + 59.4), max: 300 },
];
/** the spinning gate: go in just after an arm has swept by */
const gatePolicy: Policy = (w) => {
  const e = w.flags.pat9e as { A: number; pivx: number };
  const p = w.player;
  const a = ((w.tick / 120) * e.A) % Math.PI;
  const dist = e.pivx - p.cx;
  if (dist > 60) return go('R');
  if (dist > 40 && !(a >= 0.72 && a <= 1.5)) return go('');
  return go('R');
};

// ------------------------------------------------------------------ PAT-10
/** run right and jump over the obstacles starting at the given x (px), each from `aim` px before its edge */
function hopOver(xs: (w: World) => number[], aim: number): (w: World) => Out {
  let W: World | null = null;
  let jt = 0;
  let cool = 0;
  return (w) => {
    if (W !== w) {
      W = w;
      jt = 0;
      cool = 0;
    }
    if (jt > 0) {
      jt--;
      return { move: 'R', jump: true };
    }
    const p = w.player;
    if (!p.onGround) return go('R');
    const o = xs(w).filter((x) => p.x < x).sort((a, b) => a - b)[0];
    if (o !== undefined && w.tick > cool && p.x + p.w >= o - aim) {
      jt = 12;
      cool = w.tick + 45;
      return { move: 'R', jump: true };
    }
    return go('R');
  };
}
const room10 = (): Step[] => [{ policy: hopOver(() => [13 * 16, 25 * 16], 6), until: and(ground, X(30)), max: 1500, note: 'walk the plates, jump the gaps at 3 and 6' }];
const act10a = (x: number): Step[] => [
  { hold: 'R', until: X(x + 3), max: 600 },
  {
    policy: hopOver((w) => (w.flags.pat10p.secs as { x: number; s: { awash?: boolean } }[]).filter((s) => s.s.awash).map((s) => s.x), 4),
    until: and(ground, X(x + 31)),
    max: 2000,
    note: 'the fourth section and the eighth are awash: jump them',
  },
  { hold: 'R', until: X(x + 45.4), max: 600 },
];
const act10b = (x: number): Step[] => [{ hold: 'R', until: X(x + 19.4), max: 600 }];
/** the granary: hop every pad but the one numbered like the sacks (two) */
const padPolicy: Policy = (w, m) => {
  const e = w.flags.pat10e as { pads: { x: number; n: number }[] };
  const p = w.player;
  if (m.hold > 0) return { move: 'R', jump: true };
  if (!p.onGround) return go('R');
  const h = e.pads.filter((q) => q.n !== 2 && p.x < q.x + 24).sort((a, b) => a.x - b.x)[0];
  if (h && w.tick > (m.cool ?? 0) && p.x + p.w >= h.x - 19 && p.x < h.x) {
    m.hold = 11;
    m.cool = w.tick + 45;
    return { move: 'R', jump: true };
  }
  return go('R');
};

// ------------------------------------------------------------------ PAT-03
const t3 = (key: string) => (w: World) => (w.flags[key].t0 < 0 ? -1 : (w.tick - w.flags[key].t0) / 120);
const room03 = (): Step[] => [
  { hold: 'R', until: X(12.6), max: 600, note: 'along the first hoardings' },
  { hold: '', until: (w) => t3('pat3')(w) >= 1.55, max: 600, note: 'the first bell: this roll is wider, so it only grows' },
  { hold: 'R', until: X(15.9), max: 300, note: 'to the right end of it' },
  { hold: 'R', jump: 12, ticks: 12, note: 'across to the narrowed one' },
  { hold: 'R', until: ground, max: 200 },
  { hold: '', until: (w) => t3('pat3')(w) >= 3.85, max: 600, note: 'the second bell: stay on the one that is not changing' },
  { hold: 'R', until: X(20.1), max: 300, note: 'to its right end' },
  { hold: 'R', jump: 12, ticks: 12, note: 'across to the last hoarding' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', until: X(27), max: 400 },
];
const act03 = (x: number): Step[] => [
  { hold: 'R', until: X(x + 7.2), max: 700, note: 'over the first hoarding' },
  { hold: 'R', jump: 12, ticks: 12, note: 'on to the second' },
  { hold: 'R', until: ground, max: 200 },
  { hold: '', until: (w) => t3('pat3a')(w) >= 1.55, max: 600, note: 'the first bell: it grows towards you' },
  { hold: 'R', until: X(x + 14.0), max: 300 },
  { hold: 'R', jump: 12, ticks: 12, note: 'across to the third' },
  { hold: 'R', until: and(ground, X(x + 16.5)), max: 200 },
  { hold: 'R', until: X(x + 19.4), max: 200, note: 'to its right end, before it narrows' },
  { hold: '', until: (w) => t3('pat3a')(w) >= 3.7, max: 600, note: 'the second bell' },
  { hold: 'R', until: X(x + 20.2), max: 200 },
  { hold: 'R', jump: 12, ticks: 12, note: 'on to the fourth' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', until: X(x + 26.0), max: 300, note: 'to its right end, before the third bell' },
  { hold: 'R', jump: 12, ticks: 12, note: 'off to the far bank' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', until: X(x + 33.4), max: 600 },
];
/** a row of hoardings: wait on the plain first one until the last bell has rung, then cross, jumping the gaps that are left */
function laneWalk(key: string): (w: World) => Out {
  let hopper: ((w: World) => Out) | null = null;
  let W: World | null = null;
  return (w) => {
    if (W !== w) {
      W = w;
      hopper = hopOver((w2) => {
        const r = w2.flags[key] as { bells: number[]; specs: { c0: number; w0: number; swaps: any[] }[] };
        const fin = r.specs.map((sp) => extent(sp, r.bells, 99));
        return fin.map((e, i) => e.x + e.w).filter((end, i) => i === fin.length - 1 || fin[i + 1].x - end > 8);
      }, 4);
    }
    const r = w.flags[key] as { t0: number; bells: number[]; specs: { c0: number }[] };
    const t = r.t0 < 0 ? -1 : (w.tick - r.t0) / 120;
    if (w.player.cx > r.specs[0].c0 * 16 + 40 && t < r.bells[r.bells.length - 1] + 0.6) return go('');
    return hopper!(w);
  };
}
const BELLC = { T: 3.4, A: 0.7, L: 160, piv: 240 - 183, phase: [0, 1.7] };
/** the bell rope: cross under a bell only while it is out at the far end of its swing */
function bellsPolicy(w: World): Out {
  const e = w.flags.pat3e as { xs: number[] };
  const p = w.player;
  const bobAt = (i: number, tau: number) => {
    const th = BELLC.A * Math.sin((((w.tick + tau * 120) / 120 + BELLC.phase[i]) * 2 * Math.PI) / BELLC.T);
    return { x: e.xs[i] + BELLC.L * Math.sin(th) - 9, y: BELLC.piv + BELLC.L * Math.cos(th) - 4 };
  };
  const hitOne = (i: number, px0: number, tau: number) => {
    const b = bobAt(i, tau);
    return b.y + 19 > 223 && px0 + 13 > b.x + 1 && px0 - 3 < b.x + 17;
  };
  // the nearest bell ahead: would walking on past it hit it (with some slack for a slow start)?
  const i = e.xs.findIndex((x) => x + 62 > p.x + 10);
  if (i < 0) return go('R');
  if (p.cx > e.xs[i] - 64) return go('R');
  const dur = Math.max(0.3, (e.xs[i] + 62 - p.x) / 140) + 0.2;
  let goOk = true;
  for (const lag of [0.04, 0.12, 0.22]) for (let tau = 0; tau <= dur; tau += 0.01) if (hitOne(i, p.x + 140 * Math.max(0, tau - lag), tau)) goOk = false;
  return go(goOk ? 'R' : '');
}

// ------------------------------------------------------------------ length pass: gates
/** walk right; wait at the edge of the next gate (a section, a seam) while `closed(w, ahead)` says it is, or soon will be, shut */
function gateWalk(gates: (w: World) => { x: number; closed: (ahead: number) => boolean }[], started: (w: World) => boolean, aheads = [0, 0.25, 0.5, 0.75, 1.0]): (w: World) => Out {
  return (w) => {
    const p = w.player;
    if (!started(w)) return go('R');
    const g = gates(w).filter((q) => q.x + 1 > p.x + p.w - 4).sort((a, b) => a.x - b.x)[0];
    if (!g) return go('R');
    if (p.x + p.w >= g.x - 22 && p.x < g.x + 4) {
      for (const ahead of aheads) if (g.closed(ahead)) return go('');
    }
    return go('R');
  };
}
/** the sack deck: wait at the end of the section before a loaded one */
const sackWalk = (key: string, byHang = false) =>
  gateWalk(
    (w) => {
      const pt = w.flags[key] as { secs: { x: number }[] };
      const st = w.flags[key + 't'] as { t0: number; plan: { k: number; at: number; dur: number; from?: number }[] };
      return pt.secs.map((s, i) => ({
        x: s.x,
        closed: (ahead: number) => {
          const t = (w.tick / 120) - st.t0 / 120 + ahead;
          return st.plan.some((q) => (byHang ? (q.from ?? q.k) : q.k) === i && t >= q.at - 0.1 && t < q.at + q.dur + 0.1);
        },
      }));
    },
    (w) => w.flags[key + 't'].t0 >= 0,
  );
/** the lifting plates: wait on the deck while the seam's plate is out or about to be */
const liftWalk = (key: string, blind = false) =>
  gateWalk(
    (w) => {
      const st = w.flags[key] as { t0: number; cols: number[]; lifts: { k: number; at: number; dur: number }[] };
      return st.cols.map((c, k) => ({
        x: c * 16,
        closed: (ahead: number) => {
          const t = (w.tick - st.t0) / 120 + ahead;
          return st.lifts.some((q) => q.k === k && t >= q.at - (blind ? 0 : 1.1) && t < q.at + q.dur + (blind ? 0 : 0.2));
        },
      }));
    },
    (w) => w.flags[key].t0 >= 0,
    blind ? [0] : undefined,
  );

function solutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  S['PAT-01'] = tourRoute();
  S['PAT-02'] = room02();
  lengthen('PAT-02', 0, []);
  S['PAT-03'] = room03();
  lengthen('PAT-03', 0, []);
  S['PAT-04'] = room04();
  lengthen('PAT-04', 0, []);
  S['PAT-05'] = room05();
  lengthen('PAT-05', 0, []);
  S['PAT-06'] = room06();
  lengthen('PAT-06', 0, []);
  S['PAT-07'] = room07();
  lengthen('PAT-07', 0, []);
  S['PAT-08'] = room08();
  lengthen('PAT-08', 0, []);
  S['PAT-09'] = room09();
  lengthen('PAT-09', 0, []);
  S['PAT-10'] = room10();
  lengthen('PAT-10', 0, []);
}

const upTo = (n: number) => tourRoute().slice(0, n);
const naive: Record<string, { steps: Step[]; cause?: string }> = {
  'PAT-03': { steps: [{ hold: 'R', until: X(6), max: 400 }, ...Array.from({ length: 30 }, (): Step => ({ hold: 'R', jump: 20, ticks: 26 }))], cause: 'pat-jam' },
  'PAT-10': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'pat-jod' },
  'PAT-09': { steps: [{ hold: 'R', until: X(9), max: 400 }, ...Array.from({ length: 30 }, (): Step => ({ hold: 'R', jump: 20, ticks: 26 }))], cause: 'pat-bheed' },
  'PAT-08': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'pat-kua' },
  'PAT-07': { steps: [{ hold: 'R', until: X(8.6), max: 400 }, { hold: 'R', jump: 12, ticks: 12, note: 'on to the tempo' }, { hold: 'R', until: (w) => w.player.onGround && w.player.cx >= w.flags.pat7.cx - 4, max: 300, note: 'stand in the middle' }, { hold: '', until: done, max: 2400 }], cause: 'pat-torana' },
  'PAT-06': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'pat-jod' },
  'PAT-05': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'pat-ganga' },
  'PAT-04': { steps: [{ hold: 'R', until: X(2), max: 300 }, ...Array.from({ length: 30 }, (): Step => ({ hold: 'R', jump: 20, ticks: 26 }))], cause: 'pat-bojh' },
  'PAT-02': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'pat-angara' },
  'PAT-01': { steps: [...upTo(21), { hold: 'R', until: done, max: 2400 }], cause: 'pat-bheed' },
};
const fix: Record<string, { steps: Step[]; cause?: string }> = {
  'PAT-03': { steps: [...room03().slice(0, 2), { hold: '', until: done, max: 900, note: 'stay on the one that grew' }], cause: 'pat-jam' },
  'PAT-10': { steps: [...room10(), { hold: 'R', until: done, max: 2400, note: 'the room’s count, on into the pontoon' }], cause: 'pat-bhaar' },
  'PAT-09': { steps: [...room09().slice(0, 1), { hold: 'R', until: X(39.5), max: 400, note: 'the first gondola that comes' }, { hold: 'R', jump: 14, ticks: 14 }, { hold: '', until: done, max: 600 }], cause: 'pat-jhoola' },
  'PAT-08': { steps: [...hop(5.5, 'skip the first hatch'), { hold: 'R', until: done, max: 900 }], cause: 'pat-kua' },
  'PAT-07': { steps: [{ policy: rideBalanced(false, false), until: done, max: 4500, note: 'stand on the road side whatever happens' }], cause: 'pat-dhakka' },
  'PAT-06': { steps: [...room06(), { hold: 'R', until: done, max: 2400, note: 'the room’s count (three) on to a truck with two sacks' }], cause: 'pat-ginti' },
  'PAT-05': { steps: [{ hold: 'R', until: X(7.2), max: 600 }, { hold: '', until: (w) => w.flags.pat5.carts[0].s.cx > 236 && w.flags.pat5.carts[0].s.dir > 0, max: 900, note: 'let the cart go by down the deck' }, { hold: 'R', until: X(9.5), max: 300, note: 'step on to the high section behind it' }, { hold: '', until: done, max: 1800, note: 'and wait there' }], cause: 'pat-pipa' },
  'PAT-04': { steps: [{ hold: '', until: (w) => w.flags.pat4.t0 >= 0 && t4(w) >= 3.7, max: 800 }, ...climb4().slice(1)], cause: 'pat-bojh' },
  'PAT-02': { steps: [...room02().slice(0, 4), { hold: '', until: done, max: 1500 }], cause: 'pat-chimta' },
  'PAT-01': { steps: [...upTo(24), { hold: '', until: done, max: 1500 }], cause: 'pat-tempo' },
};
// ------------------------------------------------------------------ length pass: a NAIVE and a FIX for every added act
const ROOMS: Record<string, () => Step[]> = { 'PAT-03': room03, 'PAT-02': room02, 'PAT-04': room04, 'PAT-05': room05, 'PAT-06': room06, 'PAT-07': room07, 'PAT-09': room09, 'PAT-10': room10 };
const ACT_ORDER: Record<string, string[]> = {
  'PAT-03': ['pat03-batch', 'pat03-patti'],
  'PAT-02': ['pat02-chokha', 'pat02-bhatti'],
  'PAT-04': ['pat04-sidhi', 'pat04-anaaj'],
  'PAT-05': ['pat05-ghat', 'pat05-sangam', 'pat05-bori'],
  'PAT-06': ['pat06-sau', 'pat06-nau', 'pat06-ginti', 'pat06-gaadi'],
  'PAT-07': ['pat07-sadak', 'pat07-pul', 'pat07-haat', 'pat07-mandi', 'pat07-adda'],
  'PAT-09': ['pat09-jhoola', 'pat09-ghoda', 'pat09-wapsi'],
  'PAT-10': ['pat10-pipa', 'pat10-sau', 'pat10-bori', 'pat10-roll', 'pat10-sidhi', 'pat10-tempo', 'pat10-gaadi', 'pat10-anaaj'],
};
const actX0 = (id: string, act: string) => LEVEL_BY_ID.get(id)!.parts!.find((p) => p.kind === act)!.x0;
const prefix = (id: string, act: string): Step[] => [...ROOMS[id](), ...ACT_ORDER[id].slice(0, ACT_ORDER[id].indexOf(act)).flatMap((a) => actRoutes[a](actX0(id, a)))];
/** the stage up to the act (route), then `steps` played from the act's first column; built when the test runs */
const inAct = (id: string, act: string, what: string, steps: (x: number) => Step[], cause?: string) => ({
  what,
  get steps(): Step[] {
    return [...prefix(id, act), ...steps(actX0(id, act))];
  },
  cause,
});
const runOn: Step[] = [{ hold: 'R', until: done, max: 5000 }];
const stair2 = (x: number, wait: number): Step[] => [
  { hold: 'R', until: X(x + 3.2), max: 600, note: 'to the foot of the second flight' },
  { hold: '', until: (w) => w.flags.pat4b.t0 >= 0 && (w.tick - w.flags.pat4b.t0) / 120 >= wait, max: 2400, note: 'all the porters have been and gone' },
  ...hop(x + 3.7, 'the first step'),
  ...hop(x + 5.7, 'the second step'),
  ...hop(x + 7.7, 'the third step'),
  ...hop(x + 9.7, 'the fourth step'),
  { hold: 'R', until: and(ground, X(x + 29)), max: 900, note: 'over the landing and down the far stair' },
  { hold: 'R', until: X(x + 33.4), max: 300 },
];
const ACT_MISTAKES: Record<string, ReturnType<typeof inAct>[]> = {
  'PAT-03': [
    inAct('PAT-03', 'pat03-patti', 'stop on the left part of the third hoarding', (x) => [{ hold: 'R', until: X(x + 13.5), max: 900 }, { hold: '', until: done, max: 1500 }], 'pat-jam'),
    inAct('PAT-03', 'pat03-patti', 'wait at the right end of the second hoarding before the bell', (x) => [{ hold: 'R', until: X(x + 11.9), max: 900 }, { hold: '', until: done, max: 1500 }], 'pat-patti'),
  ],
  'PAT-02': [
    inAct('PAT-02', 'pat02-bhatti', 'stand in the first litti’s path', (x) => [{ hold: 'R', until: X(x + 10.0), max: 600 }, { hold: '', until: done, max: 900 }], 'pat-angara'),
    inAct('PAT-02', 'pat02-bhatti', 'get past the first litti, then run on past the second', () => [{ policy: pastMarkers('pat2b', 1), until: done, max: 5000 }], 'pat-doosra'),
  ],
  'PAT-04': [
    inAct('PAT-04', 'pat04-sidhi', 'climb behind the first porter', (x) => [{ hold: 'R', until: X(x + 2), max: 300 }, ...Array.from({ length: 30 }, (): Step => ({ hold: 'R', jump: 20, ticks: 26 }))], 'pat-bojh'),
    inAct('PAT-04', 'pat04-sidhi', 'wait for two porters, as on the first flight, then climb', (x) => stair2(x, 6.0), 'pat-sidhi'),
  ],
  'PAT-05': [
    inAct('PAT-05', 'pat05-bori', 'run on across the loading deck', () => runOn),
    inAct('PAT-05', 'pat05-bori', 'wait before the section the second sack hangs over (it slides back)', () => [{ policy: sackWalk('pat5s', true), until: done, max: 6000 }], 'pat-bori'),
  ],
  'PAT-06': [
    inAct('PAT-06', 'pat06-ginti', 'run on past the truck that is being unloaded', () => runOn, 'pat-ginti'),
    inAct('PAT-06', 'pat06-ginti', 'count the first truck once it is unloaded and carry on with its count', (x) => [{ hold: 'R', until: X(x + 3), max: 600 }, { hold: '', until: (w) => w.flags.pat6t.done, max: 1500 }, { policy: hopOver(() => [2, 4, 6, 8, 10, 12].map((n) => (x + 10 + (n - 1) * 8) * 16), 6), until: done, max: 4000 }], 'pat-load'),
    inAct('PAT-06', 'pat06-gaadi', 'run on over the lifting plates', () => runOn),
    inAct('PAT-06', 'pat06-gaadi', 'cross the moment the plate is back, ignoring that it shakes (the second truck)', () => [{ policy: liftWalk('pat6c', true), until: done, max: 9000 }], 'pat-gaadi'),
  ],
  'PAT-07': [
    inAct('PAT-07', 'pat07-pul', 'stand still in the middle', () => [{ hold: '', until: done, max: 5000 }], 'pat-dhakka'),
    inAct('PAT-07', 'pat07-pul', 'stay on the kerb side for ever (the rider got off)', () => [{ policy: rideBalanced(false, false, -1), until: done, max: 6000 }], 'pat-torana'),
    inAct('PAT-07', 'pat07-haat', 'stand still in the middle', () => [{ hold: '', until: done, max: 5000 }]),
    inAct('PAT-07', 'pat07-haat', 'balance for the riders on the kerb side only', () => [{ policy: rideBalanced(false, false), until: done, max: 6000 }]),
    inAct('PAT-07', 'pat07-mandi', 'stand still in the middle', () => [{ hold: '', until: done, max: 5000 }]),
    inAct('PAT-07', 'pat07-mandi', 'balance for the riders on the kerb side only', () => [{ policy: rideBalanced(false, false), until: done, max: 6000 }]),
  ],
  'PAT-09': [
    inAct('PAT-09', 'pat09-wapsi', 'hop the horse into the crowd', (x) => [{ hold: 'R', until: X(x + 9), max: 600 }, ...Array.from({ length: 30 }, (): Step => ({ hold: 'R', jump: 20, ticks: 26 }))], 'pat-bheed'),
    inAct('PAT-09', 'pat09-wapsi', 'let the horse go and follow late', (x) => [{ hold: 'R', until: X(x + 7.5), max: 600 }, { hold: '', until: (w) => w.flags.pat9d.horse.x > w.flags.pat9d.x0 + 420, max: 1500 }, { hold: 'R', until: done, max: 2000 }], 'pat-bheed'),
  ],
  'PAT-10': [
    inAct('PAT-10', 'pat10-roll', 'run on across the hoardings', () => runOn, 'pat-jam'),
    inAct('PAT-10', 'pat10-roll', 'wait on the right end of the grown third hoarding for the last bell', (x) => [{ hold: 'R', until: X(x + 5), max: 600 }, { hold: '', until: (w) => (w.tick - w.flags.pat10r.t0) / 120 >= 5.0, max: 1500 }, { policy: hopOver(() => [(x + 14) * 16], 6), until: X(x + 19.8), max: 1200 }, { hold: '', until: done, max: 1500 }], 'pat-patti'),
    inAct('PAT-10', 'pat10-tempo', 'ride in the middle all the way', () => [{ policy: rideBalanced(true, false, 0, 1e9), until: done, max: 6000 }], 'pat-dhakka'),
    inAct('PAT-10', 'pat10-tempo', 'ride on the road side all the way (the habit of the first halt)', () => [{ policy: rideBalanced(true, false, 1, 1e9), until: done, max: 6000 }], 'pat-torana'),
    inAct('PAT-10', 'pat10-bori', 'run on across the loading deck', () => runOn),
    inAct('PAT-10', 'pat10-bori', 'wait before the section the second sack hangs over (it slides back)', () => [{ policy: sackWalk('pat10s', true), until: done, max: 6000 }], 'pat-bori'),
    inAct('PAT-10', 'pat10-gaadi', 'run on over the lifting plates', () => runOn),
    inAct('PAT-10', 'pat10-gaadi', 'cross the moment the plate is back, ignoring that it shakes (the second truck)', () => [{ policy: liftWalk('pat10c', true), until: done, max: 9000 }], 'pat-gaadi'),
  ],
};

const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {
  'PAT-03': ACT_MISTAKES['PAT-03'],
  'PAT-04': ACT_MISTAKES['PAT-04'],
  'PAT-10': ACT_MISTAKES['PAT-10'],
  'PAT-09': ACT_MISTAKES['PAT-09'],
  'PAT-06': ACT_MISTAKES['PAT-06'],
  'PAT-05': ACT_MISTAKES['PAT-05'],
  'PAT-02': [...ACT_MISTAKES['PAT-02'], { what: 'run on into the second bed, where the litti is', steps: [...room02(), { hold: 'R', until: X(34.3), max: 400 }, { hold: '', ticks: 235 }, { hold: 'R', until: done, max: 2400 }], cause: 'pat-angara' }],
  'PAT-07': [...ACT_MISTAKES['PAT-07'], { what: 'walk straight through the lane at the stand', steps: [{ policy: rideBalanced(true, false), until: (w) => !!w.flags.pat7g && w.player.onGround && w.player.y > 220 && w.player.cx > w.flags.pat7g.lane0 - 50, max: 16000 }, { hold: '', until: (w) => w.flags.pat7g.third.s.k > 0.7, max: 1200 }, { hold: 'R', until: done, max: 600 }], cause: 'pat-bhid' }],
  'PAT-08': [{ what: 'the hatch with 1 brick', steps: [...hop(5.5, ''), ...hop(10.5, ''), { hold: 'R', until: done, max: 900 }], cause: 'pat-kua' }],
  'PAT-01': [{ what: 'run on at the hoarding', steps: [...upTo(32), { hold: 'R', until: done, max: 900 }], cause: 'pat-hoarding' }],
};
const actRoutes: Record<string, (x: number) => Step[]> = {
  'pat02-chokha': act02,
  'pat02-bhatti': (x) => [{ policy: pastMarkers('pat2b'), until: and(ground, X(x + 48)), max: 5000, note: 'behind each litti, then past it' }, { hold: 'R', until: X(x + 49.4), max: 400 }],
  'pat03-batch': act03,
  'pat04-anaaj': act04,
  'pat04-sidhi': (x) => stair2(x, 9.0),
  'pat03-patti': (x) => [{ policy: laneWalk('pat3b'), until: and(ground, X(x + 27.5)), max: 5000, note: 'wait for the last bell, then cross' }, { hold: 'R', until: X(x + 35.4), max: 400 }],
  'pat05-ghat': act05,
  'pat05-bori': (x) => [{ policy: sackWalk('pat5s'), until: and(ground, X(x + 54.6)), max: 5000, note: 'wait at the end of the section before the one the sack lands on' }, { hold: 'R', until: X(x + 61.4), max: 400 }],
  'pat06-ginti': (x) => [
    { hold: 'R', until: X(x + 3), max: 600, note: 'to the truck being unloaded' },
    { hold: '', until: (w) => w.flags.pat6t.done, max: 1500, note: 'wait until the porter has finished: two sacks are left' },
    { policy: hopOver(() => [2, 4, 6].map((n) => (x + 10 + (n - 1) * 8) * 16), 6), until: X(x + 56), max: 2500, note: 'jump the tarps numbered 2, 4 and 6' },
    { hold: '', until: (w) => w.flags.pat6u.done, max: 1500, note: 'the second truck is being loaded: wait, three sacks' },
    { policy: hopOver(() => [9, 12].map((n) => (x + 10 + (n - 1) * 8) * 16), 6), until: and(ground, X(x + 112)), max: 3000, note: 'jump the tarps numbered 9 and 12' },
    { hold: 'R', until: X(x + 119), max: 400 },
  ],
  'pat06-gaadi': (x) => [{ policy: liftWalk('pat6c'), until: and(ground, X(x + 65.4)), max: 9000, note: 'cross a seam only while its plate is in and still' }],
  'pat05-sangam': (x) => [{ policy: deckPolicy('pat5b', 3), until: and(ground, X(x + 34.2)), max: 4000, note: 'across the longest deck' }, { hold: 'R', until: X(x + 45.4), max: 400 }],
  'pat06-nau': (x) => [{ policy: hopOver(() => [18, 36].map((c) => (x + c) * 16), 6), until: and(ground, X(x + 57.4)), max: 2000, note: 'walk the plates, jump the gaps at 3 and 6' }],
  'pat10-bori': (x) => [{ policy: sackWalk('pat10s'), until: and(ground, X(x + 55.6)), max: 8000, note: 'wait before each loaded section' }, { hold: 'R', until: X(x + 61.4), max: 600 }],
  'pat10-gaadi': (x) => [{ policy: liftWalk('pat10c'), until: and(ground, X(x + 69.4)), max: 9000, note: 'wait for each lifted plate to be back in and still' }],
  'pat10-roll': (x) => [{ policy: laneWalk('pat10r'), until: and(ground, X(x + 27.5)), max: 5000, note: 'wait for the third bell, then cross' }, { hold: 'R', until: X(x + 37), max: 400 }],
  'pat10-tempo': (x) => [{ policy: rideBalanced(true, false, undefined, 1e9), until: X(x + 76), max: 8000, note: 'balance for each halt, truck, hump and arch' }, { hold: 'R', until: X(x + 85), max: 600 }],
  'pat10-sidhi': (x) => [
    { hold: 'R', until: X(x + 3.2), max: 600, note: 'to the foot of the stair' },
    { hold: '', until: (w) => w.flags.pat10g.t0 >= 0 && (w.tick - w.flags.pat10g.t0) / 120 >= 6.0, max: 1500, note: 'both porters have been and gone' },
    ...hop(x + 3.7, 'the first step'),
    ...hop(x + 5.7, 'the second step'),
    ...hop(x + 7.7, 'the third step'),
    ...hop(x + 9.7, 'the fourth step'),
    { hold: 'R', until: and(ground, X(x + 29)), max: 900, note: 'over the landing and down the far stair' },
    { hold: 'R', until: X(x + 33.4), max: 300 },
  ],
  'pat10-sau': (x) => [{ policy: hopOver(() => [5, 10].map((i) => (x + 6 + (i - 1) * 5) * 16), 6), until: and(ground, X(x + 61.4)), max: 2500, note: 'jump the fifth plate’s gap and the tenth’s' }],
  'pat06-sau': act06,
  'pat07-sadak': act07a,
  'pat07-adda': act07b,
  'pat07-pul': (x) => [{ policy: rideBalanced(true, false), until: X(x + 91.2), max: 6000, note: 'a road-side rider, a hump, an arch, a truck, a hump, an arch' }],
  'pat07-haat': (x) => [{ policy: rideBalanced(true, false), until: X(x + 91.2), max: 6000, note: 'riders on both sides and a kerb-side truck' }],
  'pat07-mandi': (x) => [{ policy: rideBalanced(true, false), until: X(x + 91.2), max: 6000, note: 'a halt before a hump, then three scrapes with no halt' }],
  'pat08-chowk': act08,
  'pat08-vihara': (x) => [...hop(x + 2.5, 'jump the hatch with 3 bricks'), ...hop(x + 7.5, 'and the one with 1'), { hold: 'R', until: X(x + 22), max: 400, note: 'step on the hatch with 2 bricks' }, ...hop(x + 33.1, 'hop the last cell’s well'), { hold: 'R', until: X(x + 45.4), max: 600 }],
  'pat09-jhoola': act09,
  'pat09-wapsi': (x) => [{ policy: followHorse('pat9d'), until: and(ground, X(x + 66)), max: 6000, note: 'right behind the horse, backwards when he turns back' }, { hold: 'R', until: X(x + 73.4), max: 400 }],
  'pat09-ghoda': (x) => [{ policy: wheelRide('pat9x'), until: and(ground, X(x + 18.5)), max: 4000, note: 'across on the first empty gondola' }, { policy: followHorse('pat9c'), until: and(ground, X(x + 56)), max: 3000, note: 'behind the quickest horse' }, { hold: 'R', until: X(x + 59.4), max: 300 }],
  'pat10-pipa': act10a,
  'pat10-anaaj': act10b,
};
const endingPolicies: Record<string, Policy> = {
  'pat-musal': pestlePolicy,
  'pat-ghanti': (w) => bellsPolicy(w),
  'pat-bhitar': leafPolicy,
  'pat-nawka': floatPolicy,
  'pat-toll': tollPolicy,
  'pat-hauled-basket': basketPolicy,
  'pat-mound': moundPolicy,
  'pat-charkhi': gatePolicy,
  'pat-ginti-pad': padPolicy,
};

export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  fair: ['PAT-02', 'PAT-03', 'PAT-04', 'PAT-05', 'PAT-06', 'PAT-07', 'PAT-08', 'PAT-09', 'PAT-10'],
};
