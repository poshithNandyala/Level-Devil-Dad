// Proven routes for Bhubaneswar: every stage's room, its acts and its door, plus the plays that must die.
// Found by tests/city-tests.ts; merged into SOLUTIONS, NAIVE, FIX, MISTAKES, ACT_ROUTES and ENDING_POLICIES.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import { Step, X, and, ground, done } from '../runner';
import type { CityTests } from '../city-tests';
import { LEVELS } from '../../src/game/levels';
import { LEAD } from '../../src/game/cities/bbi/levels';
import { g1Road } from '../../src/game/cities/bbi/s01';

type Move = 'L' | 'R' | '';
type Out = { move: Move; jump: boolean };
interface Mem {
  hold: number;
  [k: string]: any;
}
type Policy = (w: World, m: Mem, d: Door) => Out;
const go = (move: Move): Out => ({ move, jump: false });
const px = (t: number) => t * 16;
const FLOOR_PX = 240;
const hop = (at: number, note: string, ticks = 12): Step[] => [
  { hold: 'R', until: X(at), max: 900 },
  { hold: 'R', jump: ticks, ticks, note },
  { hold: 'R', until: ground, max: 300 },
];

// ------------------------------------------------------------------ BBI-01
const tourHead = (): Step[] => [...hop(8.6, 'the ditch'), { hold: 'R', until: X(14.5), max: 600 }];
const pastG1 = (): Step[] => [
  ...tourHead(),
  { hold: '', until: (w) => !g1Road(w), max: 900, note: 'wait well back until he turns to his pots' },
  { hold: '', until: (w) => g1Road(w), max: 900 },
  { hold: '', until: (w) => !g1Road(w), max: 900, note: 'now: he faces the pots' },
  ...hop(28.8, 'over the drain'),
];
// the tour's own walk after the second drain: steps, posts and the cart (the course pieces)
const ferryAt = (x0: number) => (w: World) => (w.entities as any[]).find((e) => e.ferry && Math.abs(e.solid.x - x0 * 16) < 260);
const ride = (x0: number, wd: number): Step[] => [
  { hold: 'R', until: X(x0 - 1.2), max: 900 },
  { hold: '', until: (w) => { const f = ferryAt(x0)(w); return f.state === 'rest' && f.x === x0 * 16; }, max: 900, note: 'wait for the shuttle at its stop' },
  { hold: 'R', until: (w) => w.standing(ferryAt(x0)(w).solid) && w.player.x >= ferryAt(x0)(w).x + 10, max: 200, note: 'step aboard' },
  { hold: '', until: (w) => { const f = ferryAt(x0)(w); return f.state === 'rest' && f.x === (x0 + wd - 3) * 16; }, max: 900, note: 'ride across' },
  { hold: 'R', until: X(x0 + wd + 0.4), max: 200, note: 'step off' },
];
const tourTail = (): Step[] => [
  ...hop(38.7, 'a step up'),
  ...hop(40.7, 'a step up'),
  ...hop(48.6, 'a post'),
  ...hop(51.6, 'a post'),
  ...hop(54.6, 'a post'),
  { hold: 'R', until: X(58.8), max: 600 },
  { hold: 'R', jump: 14, ticks: 14, note: 'hop the parked cart' },
  { hold: 'R', until: (w) => w.player.onGround && w.player.y > 220, max: 400 },
  ...hop(70.2, 'jump from the tile before the wet one'),
  ...ride(75, 15),
  { hold: 'R', until: X(92.4), max: 300 },
  { hold: 'R', jump: 12, ticks: 12, note: 'up on the deck' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', until: done, max: 900 },
];
// ------------------------------------------------------------------ BBI-02
const k2 = (w: World) => w.flags.bbi2 as { t0: number; ball: string; kx: number };
/** stand still on the keeper with Dad's centre between a and b px from his left end */
const onPad = (a: number, b: number): Step => ({
  steer: (w) => {
    const c = w.player.cx - k2(w).kx;
    return c < a ? 'R' : c > b ? 'L' : '';
  },
  until: (w) => w.player.onGround && w.player.cx - k2(w).kx >= a && w.player.cx - k2(w).kx <= b && Math.abs(w.player.vx) < 1,
  max: 400,
  note: 'settle on a pad',
});
const board02 = (): Step[] => [{ hold: 'R', until: X(5.4), max: 600 }, { hold: 'R', jump: 9, ticks: 9, note: 'up on the keeper' }, { hold: 'R', until: ground, max: 200 }];
const room02 = (): Step[] => [
  ...board02(),
  onPad(4, 12),
  { hold: '', until: (w) => k2(w).ball === 'gone', max: 900, note: 'ride the back pad: the save, the rebound, the roll' },
  { hold: 'R', until: and(ground, X(19.6)), max: 300, note: 'step off before he gets up' },
  { hold: 'R', until: X(31.5), max: 300 },
];
const act02 = (x: number): Step[] => [...hop(x + 17.9, 'hop the still ball at the stopper'), { hold: 'R', until: X(x + 35), max: 600 }];
const goalPolicy: Policy = (w) => {
  const st = w.flags.bbi2e as { done: boolean };
  const p = w.player;
  const D = Math.round((w.entities.find((e: any) => e.constructor?.name === 'Door' && !e.fake) as any).x / 16);
  const mid = (D - 6) * 16;
  if (st.done) return go('R');
  return go(p.cx < mid - 3 ? 'R' : p.cx > mid + 3 ? 'L' : '');
};

// ------------------------------------------------------------------ shared: leap to a spot
/** a person's leap: wait until `ready`, then jump towards world x `tx` and steer in the air; done standing on it */
const leap = (tx: (w: World) => number, note: string, ready: (w: World) => boolean = () => true, tol = 3): Step => ({
  long: true,
  note,
  max: 1500,
  policy: (w) => {
    const p = w.player;
    const d = tx(w) - p.cx;
    if (p.onGround) {
      if (!ready(w)) return go('');
      if (Math.abs(d) < tol) return go('');
      if (Math.abs(d) > 22) return { move: d > 0 ? 'R' : 'L', jump: true };
      return go(d > 0 ? 'R' : 'L');
    }
    return { move: Math.abs(d) < 2 ? '' : d > 0 ? 'R' : 'L', jump: p.vy < 0 && Math.abs(d) > 28 };
  },
  until: (w) => w.player.onGround && Math.abs(tx(w) - w.player.cx) < tol && ready(w),
});
const leap6 = (tx: (w: World) => number, note: string) => leap(tx, note, () => true, 6);
/** wait on a spot until f, stepping back on to it if Dad drifts (a person keeps their footing) */
const stayOn = (tx: (w: World) => number, f: (w: World) => boolean, note: string, max = 1500): Step => ({
  steer: (w) => {
    const d = tx(w) - w.player.cx;
    return d > 5 ? 'R' : d < -5 ? 'L' : '';
  },
  until: f,
  max,
  note,
});
const waitFor = (f: (w: World) => boolean, note: string, max = 1500): Step => ({ hold: '', until: f, max, note });

// ------------------------------------------------------------------ BBI-03
type Para = { cutX: () => number; open: (w: World) => boolean; peeled: (w: World) => boolean };
const p3 = (w: World, i: number) => (w.flags.bbi3p as Para[])[i];
const pa = (w: World, i: number) => (w.flags.bbi3ap as Para[])[i];
const cut3 = (i: number) => (w: World) => p3(w, i).cutX() + 12;
const cutA = (i: number) => (w: World) => pa(w, i).cutX() + 12;
const room03 = (): Step[] => [
  { hold: 'R', until: X(3.4), max: 600 },
  waitFor((w) => p3(w, 0).open(w), 'a customer at the first shop: it opens'),
  leap6(cut3(0), 'on to its cut-out'),
  stayOn(cut3(0), (w) => p3(w, 1).open(w), 'the next one opens'),
  leap6(cut3(1), 'its cut-out is on the left'),
  stayOn(cut3(1), (w) => p3(w, 2).open(w), 'the third'),
  leap6(cut3(2), 'cut-out on the right'),
  stayOn(cut3(2), (w) => p3(w, 3).open(w), 'the fourth opens: go at once'),
  leap6(cut3(3), 'before he sells the third cut-out'),
  leap(() => px(25.5), 'off on to the far side'),
  { hold: 'R', until: X(31.5), max: 300 },
];
const act03 = (x: number): Step[] => [
  { hold: 'R', until: X(x + 1.2), max: 300 },
  waitFor((w) => pa(w, 0).open(w), 'the near one opens'),
  leap6(cutA(0), 'cut-out on the right'),
  stayOn(cutA(0), (w) => pa(w, 1).open(w), 'wait for the middle one'),
  leap6(cutA(1), 'cut-out on the left'),
  stayOn(cutA(1), (w) => pa(w, 2).open(w) && w.tick > 0 && (w.tick - (w.flags.bbi3a.t0 as number)) / 120 > 5, 'the far one opens again'),
  leap6(cutA(2), 'centre'),
  leap(() => px(x + 18), 'off on to the bank'),
  { hold: 'R', until: X(x + 19.5), max: 300 },
];
const lanternPolicy: Policy = (w, m) => {
  const st = w.flags.bbi3e as { t0: number; k: number };
  const d = w.entities.find((e: any) => e.constructor?.name === 'Door' && !e.fake) as any;
  const D = Math.round(d.x / 16);
  const p = w.player;
  if (st.k >= 0.99) m.seen = 1;
  if (m.seen && st.k <= 0.01) return go('R');
  if (p.cx < px(D - 4.6)) return go('R');
  return go('');
};

// ------------------------------------------------------------------ BBI-04
type SmithSt = { still: number; curls: { c: number; bridge: boolean; born: number; rig: { on: boolean } }[] };
const t0of = (w: World, k: string) => (w.flags[k] as { t0: number }).t0;
const torchOn = (k: string, period: number, on: number, phase: number) => (w: World, ahead: number) => {
  const t0 = t0of(w, k);
  if (t0 < 0) return false;
  const t = ((((w.tick - t0) / 120 + ahead + phase) % period) + period) % period;
  return t < on;
};
/** keep moving under a torch at column c: pace back and forth until it will be off all the way under, then go */
const passTorch = (c: number, on: (w: World, ahead: number) => boolean, note: string): Step => ({
  note,
  max: 1500,
  policy: (w) => {
    const p = w.player;
    const lead = (px(c) - (p.x + p.w)) / 140;
    const clear = [0, 0.1, 0.2, 0.3].every((dt) => !on(w, Math.max(0, lead) + dt));
    if (p.x > px(c) + 16) return go('R');
    if (p.cx < px(c) - 44) return go('R');
    if (clear) return go('R');
    // pace: a step back, a step on, never standing still
    return go((w.tick >> 4) % 2 ? 'L' : 'R');
  },
  until: (w) => w.player.x > px(c) + 18,
});
const bridged = (k: string, c0: number, c1: number) => (w: World) => {
  const st = w.flags[k] as SmithSt;
  const bs = st.curls.filter((q) => q.bridge && q.c >= c0 && q.c <= c1);
  return bs.length === c1 - c0 + 1 && bs.every((q) => (w.tick - q.born) / 120 >= 0.65);
};
/** stop at a trough's edge and stand still until he has bridged it and the last piece has stopped glowing */
const buildBridge = (k: string, c0: number, c1: number): Step[] => [
  { hold: 'R', until: (w) => w.player.x + w.player.w >= px(c0) - 3, max: 600, note: 'to the edge of the trough' },
  { hold: '', until: bridged(k, c0, c1), max: 1200, note: 'stand still: he bridges it' },
  { hold: 'R', until: and(ground, X(c1 + 1.2)), max: 400, note: 'across' },
];
const r4on = torchOn('bbi4r', 2.2, 0.7, 1.8);
const room04 = (): Step[] => [passTorch(9, r4on, 'keep moving under the torch'), ...buildBridge('bbi4', 17, 23), { hold: 'R', until: X(31.5), max: 400 }];
const act04 = (x: number): Step[] => [
  passTorch(x + 5, torchOn('bbi4a', 2.0, 0.6, 0.2), 'the first torch'),
  ...buildBridge('bbi4b', x + 10, x + 15),
  passTorch(x + 21, torchOn('bbi4a', 2.0, 0.6, 1.0), 'the second torch'),
  { hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 25) - 3, max: 600 },
  { hold: '', until: bridged('bbi4b', x + 25, x + 30), max: 1200, note: 'he bridges the second trough' },
  passTorch(x + 28, torchOn('bbi4a', 2.4, 0.6, 0), 'across between the bursts of the torch over it'),
  { hold: 'R', until: X(x + 35), max: 400 },
];
/** the filigree box on the shelf: stand still for a wall, let it cool, climb it, up to the door */
const curlStair: Policy = (w, m) => {
  const st = w.flags.bbi4e as SmithSt;
  const d = w.entities.find((e: any) => e.constructor?.name === 'Door' && !e.fake) as any;
  const D = Math.round(d.x / 16);
  const p = w.player;
  if (m.hold > 0) return { move: 'R', jump: true };
  const wall = st.curls.find((q) => !q.bridge && q.rig.on);
  if (p.y + p.h <= px(11) + 1) return go('R');
  if (p.onGround && p.y + p.h <= FLOOR_PX - 47) {
    m.hold = 14;
    return { move: 'R', jump: true };
  }
  if (wall && (w.tick - wall.born) / 120 >= 0.7 && p.onGround) {
    m.hold = 15;
    return { move: 'R', jump: true };
  }
  if (!wall && p.x + p.w < px(D - 3) - 4) return go('R');
  return go('');
};

// ------------------------------------------------------------------ BBI-05
const room05 = (): Step[] => [...hop(11.2, 'run and jump the channel, over the still mill', 14), { hold: 'R', until: X(31.5), max: 600 }];
const act05a = (x: number): Step[] => [
  ...hop(x + 0.7, 'up on the straw', 15),
  { hold: 'R', until: X(x + 2.9), max: 300 },
  { hold: 'R', jump: 15, ticks: 15, note: 'jump the husk pit from the straw' },
  { hold: 'R', until: ground, max: 300 },
  { hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 16.75) - 4, max: 600 },
  { hold: 'R', jump: 15, ticks: 15, note: 'from right against the stone, straight up the step' },
  { hold: 'R', until: ground, max: 300 },
  { hold: 'R', until: and(ground, X(x + 25.5)), max: 600 },
];
const act05b = (x: number): Step[] => [{ hold: 'R', until: X(x + 6.75), max: 400 }, { hold: 'R', jump: 15, ticks: 15, note: 'right over the cart' }, { hold: 'R', until: ground, max: 300 }, { hold: 'R', until: X(x + 23.5), max: 600 }];
const behindStep: Policy = () => go('R');
const verandahPolicy: Policy = (w, m) => {
  const d = w.entities.find((e: any) => e.constructor?.name === 'Door' && !e.fake) as any;
  const D = Math.round(d.x / 16);
  const p = w.player;
  if (m.hold > 0) return { move: 'R', jump: true };
  if (p.onGround && p.y + p.h >= 239 && p.x + p.w >= px(D - 6) - 2 && p.x < px(D - 4)) {
    m.hold = 15;
    return { move: 'R', jump: true };
  }
  return go('R');
};

// ------------------------------------------------------------------ BBI-06
type LoomSt = { b: number; j: number; bridge: boolean; into: number; left: number };
const lm = (w: World, k: string) => w.flags[k] as LoomSt;
const room06 = (): Step[] => [
  { hold: 'R', until: X(6.8), max: 600 },
  waitFor((w) => lm(w, 'bbi6').bridge && lm(w, 'bbi6').into > 0.5, 'count the beats; on the motif, let the shuttle by'),
  { hold: 'R', until: and(ground, X(16.4)), max: 300, note: 'across the motif' },
  { hold: 'R', until: X(31.5), max: 600 },
];
const act06 = (x: number): Step[] => [
  { hold: 'R', until: X(x + 1.4), max: 300 },
  waitFor((w) => lm(w, 'bbi6b').bridge && lm(w, 'bbi6b').into > 1.12, 'the shuttle goes across and back'),
  { hold: 'R', until: and(ground, X(x + 13.4)), max: 400, note: 'across' },
  { hold: 'R', until: X(x + 19.5), max: 400 },
];

// ------------------------------------------------------------------ BBI-07
type TrSt = { pose: string | null; into: number; left: number };
const tr = (w: World, k: string) => w.flags[k] as TrSt;
/** be at the pit edge; the moment the drum stops for the bridge, walk over */
const onBridge = (k: string, edge: number, far: number, note: string): Step[] => [
  { hold: 'R', until: (w) => w.player.x + w.player.w >= px(edge) - 2, max: 900, note: 'to the edge' },
  waitFor((w) => tr(w, k).pose === 'bridge' && tr(w, k).into < 0.2, note, 2400),
  { hold: 'R', until: and(ground, X(far)), max: 400, note: 'straight over' },
];
const room07 = (): Step[] => [...onBridge('bbi7', 10, 18.2, 'the drum stops for the bridge'), { hold: 'R', until: X(31.5), max: 600 }];
const act07a = (x: number): Step[] => [
  ...onBridge('bbi7a1', x + 4, x + 10.2, 'the first troupe’s bridge'),
  { hold: '', until: () => true, ticks: 1 },
  ...onBridge('bbi7a2', x + 14, x + 21.2, 'rest on the bank; the second bridge in its own time'),
  { hold: 'R', until: X(x + 25.5), max: 400 },
];
const act07b = (x: number): Step[] => [
  ...onBridge('bbi7b1', x + 3, x + 14.2, 'the long bridge: go at once'),
  { hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 19) - 2, max: 600 },
  waitFor((w) => tr(w, 'bbi7b2').pose === 'wheel' && tr(w, 'bbi7b2').into < 0.2, 'wait for the wheel', 2400),
  leap(() => px(x + 22), 'on to the top of the wheel'),
  leap(() => px(x + 26), 'up on to the high bank'),
  { hold: 'R', until: X(x + 33.5), max: 400 },
];

// ------------------------------------------------------------------ BBI-08
type BowlSt = { t: number; water: number; rice: boolean; badis: { x: number; s: { under?: boolean } }[] };
const bw = (w: World, k: string) => w.flags[k] as BowlSt;
const badiX = (k: string, i: number) => (w: World) => bw(w, k).badis[i].x + 13;
/** into the bowl, on to badi i before the pour, ride it until the water settles at the right rim, hop out */
const rideBowl = (k: string, left: number, rim: number, i: number, settled: (w: World) => boolean): Step[] => [
  ...hop(left - 1.6, 'up on the rim'),
  leap(badiX(k, i), 'on to a badi before the jug tips'),
  stayOn(badiX(k, i), settled, 'ride it: the pour, the second jug, the turn back', 1800),
  {
    long: true,
    max: 600,
    note: 'hop out over the far rim',
    policy: (w) => {
      const pl = w.player;
      if (pl.onGround && pl.x < px(rim) - 4) return { move: 'R', jump: true };
      return { move: 'R', jump: !pl.onGround && pl.vy < 0 };
    },
    until: and(ground, X(rim + 0.6)),
  },
];
const room08 = (): Step[] => [...rideBowl('bbi8', 6, 25.5, 1, (w) => bw(w, 'bbi8').t > 6.0 && bw(w, 'bbi8').badis[1].x >= px(25) - 26 - 4 - 34 - 0.5), { hold: 'R', until: X(31.5), max: 400 }];
/** the plain doors (06, 07, 08, 10): walk in */
const walkIn: Policy = () => go('R');

// ------------------------------------------------------------------ BBI-09
type ChSt = { started: number; moving: boolean; stopped: boolean; hub: { x: number; y: number }; plinth: { x: number; w: number } };
const ch = (w: World) => w.flags.bbi9 as ChSt;
const toHorses = (): Step[] => [...hop(4.6, 'up on the plinth'), { hold: 'R', until: X(13.7), max: 400 }, { hold: 'R', jump: 12, ticks: 12, note: 'up on the horses' }, { hold: 'R', until: ground, max: 200 }, { hold: '', until: (w) => ch(w).started >= 0, max: 300, note: 'stand on the horses: the chariot moves' }];
const room09 = (): Step[] => [
  ...toHorses(),
  {
    note: 'when the hub is over you, jump straight up on to it',
    max: 600,
    long: true,
    policy: (w) => {
      const p = w.player;
      const d = ch(w).hub.x + 20 - p.cx;
      const ahead = ch(w).hub.x - (p.x + p.w);
      if (p.onGround) return ahead < 20 ? { move: 'R', jump: true } : go('');
      return { move: d > 3 ? 'R' : d < -3 ? 'L' : '', jump: p.vy < 0 };
    },
    until: (w) => w.player.onGround && w.player.y + w.player.h <= ch(w).hub.y + 1,
  },
  stayOn((w) => ch(w).hub.x + 20, (w) => ch(w).stopped, 'the plinth slides under the still hub'),
  leap(() => px(27.5), 'up on to the temple wall'),
  { hold: 'R', until: X(31.5), max: 400 },
];
/** the spokes: a hop every so often, steadily */
const act09 = (x: number): Step[] => {
  const out: Step[] = [{ hold: 'R', until: X(x + 1.3), max: 300 }];
  for (let k = 0; k < 8; k++) out.push(leap(() => px(x + 3 + 2.5 * k) + 14, `spoke ${k + 1}`, () => true, 8));
  out.push(leap(() => px(x + 26), 'on to the terrace'));
  out.push({ hold: 'R', until: and(ground, X(x + 29)), max: 300 });
  return out;
};
const horseGap: Policy = (w, m) => {
  const d = w.entities.find((e: any) => e.constructor?.name === 'Door' && !e.fake) as any;
  const D = Math.round(d.x / 16);
  const p = w.player;
  if (m.hold > 0) return { move: 'R', jump: true };
  if (p.x > px(D - 2) + 2) return go(p.cx < px(D) + 8 ? 'R' : '');
  if (!p.onGround) return go('R');
  if (p.onGround && p.x + p.w >= px(D - 2) - 20 - 26) {
    m.hold = 22;
    return { move: 'R', jump: true };
  }
  return go('R');
};

// ------------------------------------------------------------------ BBI-10
const k10 = (w: World) => w.flags.bbi10k as { t0: number; ball: string; kx: number; save: number };
const c10 = (w: World) => w.flags.bbi10c as ChSt;
const onPad10 = (a: number, b: number): Step => ({
  steer: (w) => {
    const c = w.player.cx - k10(w).kx;
    return c < a ? 'R' : c > b ? 'L' : '';
  },
  until: (w) => w.player.onGround && w.player.cx - k10(w).kx >= a && w.player.cx - k10(w).kx <= b && Math.abs(w.player.vx) < 1,
  max: 400,
  note: 'settle on a pad',
});
const board10 = (): Step[] => [{ hold: 'R', until: X(3.4), max: 600 }, { hold: 'R', jump: 9, ticks: 9, note: 'up on the keeper' }, { hold: 'R', until: ground, max: 200 }];
const hubJump = (c: (w: World) => ChSt, walk = true): Step => ({
  note: 'when the hub is just ahead, jump up on to it',
  max: 900,
  long: true,
  policy: (w) => {
    const p = w.player;
    const d = c(w).hub.x + 20 - p.cx;
    const ahead = c(w).hub.x - (p.x + p.w);
    if (p.onGround) return ahead < 24 ? { move: 'R', jump: true } : go(walk && p.x + p.w < c(w).plinth.x + c(w).plinth.w - 4 && ahead > 30 ? 'R' : '');
    return { move: d > 3 ? 'R' : d < -3 ? 'L' : '', jump: p.vy < 0 };
  },
  until: (w) => w.player.onGround && w.player.y + w.player.h <= c(w).hub.y + 1,
});
const room10 = (): Step[] => [
  ...board10(),
  onPad10(4, 12),
  waitFor((w) => k10(w).ball === 'gone' && k10(w).kx >= px(5) + px(9) + 7, 'ride the back pad across the moat'),
  { hold: 'R', jump: 8, ticks: 8, note: 'hop on to the plinth' },
  { hold: 'R', until: (w) => w.player.onGround && w.player.x >= px(18), max: 300, note: 'on the plinth' },
  { hold: 'R', until: (w) => w.player.x + w.player.w >= c10(w).hub.x - 40, max: 400, note: 'to its front' },
  hubJump(c10),
  stayOn((w) => c10(w).hub.x + 20, (w) => c10(w).stopped, 'the plinth slams under the still hub'),
  leap(() => px(37.5), 'up on to the temple wall'),
  { hold: 'R', until: and(ground, X(43.5)), max: 400 },
];
type Para10 = { cutX: () => number; open: (w: World) => boolean };
const p10 = (w: World, i: number) => (w.flags.bbi10ps as Para10[])[i];
const cut10 = (i: number) => (w: World) => p10(w, i).cutX() + 12;
const act10a = (x: number): Step[] => [
  { hold: 'R', until: X(x + 0.4), max: 300 },
  leap6(cut10(0), 'cut-out on the right, at once'),
  leap6(cut10(1), 'the next before its buyer comes'),
  leap6(cut10(2), 'and the next'),
  leap6(cut10(3), 'the last'),
  leap(() => px(x + 22), 'off on to the bank'),
  { hold: 'R', until: X(x + 23.5), max: 300 },
];
const act10b = (x: number): Step[] => [
  { hold: 'R', until: X(x + 2.1), max: 300 },
  waitFor((w) => lm(w, 'bbi10lm').bridge && lm(w, 'bbi10lm').into > 0.12, 'the motif beat: go at once'),
  { hold: 'R', until: and(ground, X(x + 10.4)), max: 400, note: 'across' },
  ...onBridge('bbi10tr', x + 14, x + 23.2, 'the troupe’s bridge'),
  { hold: 'R', until: X(x + 27.5), max: 400 },
];

// ------------------------------------------------------------------ the added acts
const kOf = (w: World, k: string) => w.flags[k] as { t0: number; ball: string; kx: number };
const onPadK = (k: string, a: number, b: number): Step => ({
  steer: (w) => {
    const c = w.player.cx - kOf(w, k).kx;
    return c < a ? 'R' : c > b ? 'L' : '';
  },
  until: (w) => w.player.onGround && w.player.cx - kOf(w, k).kx >= a && w.player.cx - kOf(w, k).kx <= b && Math.abs(w.player.vx) < 1,
  max: 400,
  note: 'settle on the back pad',
});
const act02b = (x: number): Step[] => [
  { hold: 'R', until: X(x + 0.6), max: 400 },
  { hold: 'R', jump: 9, ticks: 9, note: 'up on the keeper' },
  { hold: 'R', until: ground, max: 200 },
  onPadK('bbi2b', 4, 12),
  { hold: '', until: (w) => kOf(w, 'bbi2b').ball === 'gone', max: 900, note: 'the dive, the rebound, back' },
  { hold: 'R', until: and(ground, X(x + 14.6)), max: 300, note: 'off before he gets up' },
  { hold: 'R', until: X(x + 29.5), max: 400 },
];
const act06b = (x: number): Step[] => [
  { hold: 'R', until: X(x + 0.9), max: 300 },
  waitFor((w) => lm(w, 'bbi6d').bridge && lm(w, 'bbi6d').into > 1.1, 'across and back'),
  { hold: 'R', until: and(ground, X(x + 11.4)), max: 400, note: 'across' },
  { hold: 'R', until: X(x + 15.5), max: 300 },
];
const act07c = (x: number): Step[] => [
  ...onBridge('bbi7c1', x + 3, x + 9.2, 'the first bridge'),
  { hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 12) - 2, max: 600 },
  waitFor((w) => tr(w, 'bbi7c2').pose === 'wheel' && tr(w, 'bbi7c2').into < 0.2, 'no bridge here: wait for the wheel', 2400),
  leap(() => px(x + 15) + 8, 'on to the wheel'),
  leap(() => px(x + 20), 'off on to the far bank'),
  ...onBridge('bbi7c3', x + 23, x + 29.2, 'the quick drummer’s bridge'),
  { hold: 'R', until: X(x + 31.5), max: 300 },
];
const chOf = (w: World, k: string) => w.flags[k] as ChSt;
/** a chariot act: on to the plinth, up on the horses at its front, the hub as it comes over, the wall */
const chariotRun = (k: string, x: number, horses: number, wallTop: number, end: number): Step[] => [
  ...hop(x + 1.4, 'up on the plinth'),
  { hold: 'R', until: X(horses - 1.3), max: 400 },
  { hold: 'R', jump: 11, ticks: 11, note: 'up on the horses' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', until: ground, max: 200 },
  { hold: '', until: (w) => chOf(w, k).started >= 0, max: 300, note: 'stand on the horses: it moves' },
  hubJump((w) => chOf(w, k), false),
  stayOn((w) => chOf(w, k).hub.x + 20, (w) => chOf(w, k).stopped, 'the plinth slams under the hub'),
  leap(() => px(wallTop), 'up on to the wall'),
  { hold: 'R', until: and(ground, X(end)), max: 400 },
];
const act09b = (x: number): Step[] => chariotRun('bbi9b', x, x + 10, x + 23.5, x + 27.5);
const act10c = (x: number): Step[] => chariotRun('bbi10c2', x, x + 11, x + 23.5, x + 27.5);

const act05c = (x: number): Step[] => [
  ...hop(x + 3.2, 'jump the channel over the mill', 14),
  { hold: 'R', until: X(x + 12.75), max: 400 },
  { hold: 'R', jump: 15, ticks: 15, note: 'right over the cart, touching nothing' },
  { hold: 'R', until: ground, max: 300 },
  { hold: 'R', until: X(x + 20.7), max: 400 },
  ...hop(x + 20.7, 'up on the straw', 15),
  { hold: 'R', until: X(x + 22.9), max: 300 },
  { hold: 'R', jump: 15, ticks: 15, note: 'over the pounder’s pit from the straw' },
  { hold: 'R', until: ground, max: 300 },
  { hold: 'R', until: X(x + 33.5), max: 400 },
];
const p3b = (w: World, i: number) => (w.flags.bbi3bp as Para[])[i];
const cutB = (i: number) => (w: World) => p3b(w, i).cutX() + 12;
const act03b = (x: number): Step[] => [
  { hold: 'R', until: X(x + 0.4), max: 300 },
  waitFor((w) => p3b(w, 0).open(w), 'the first opens'),
  leap6(cutB(0), 'cut-out on the left'),
  stayOn(cutB(0), (w) => p3b(w, 1).open(w), 'the second'),
  leap6(cutB(1), 'cut-out on the right'),
  stayOn(cutB(1), (w) => p3b(w, 2).open(w), 'the third'),
  leap6(cutB(2), 'centre'),
  stayOn(cutB(2), (w) => p3b(w, 3).open(w), 'the last'),
  leap6(cutB(3), 'land on it'),
  leap(() => px(x + 21.5), 'and straight off to the bank before he sells it'),
  { hold: 'R', until: X(x + 23.5), max: 300 },
];
const act08b = (x: number): Step[] => [...rideBowl('bbi8d', x + 3, x + 24.5, 2, (w) => bw(w, 'bbi8d').t > 5.6 && bw(w, 'bbi8d').badis[2].x >= px(x + 24) - 26 - 4 - 34 - 0.5), { hold: 'R', until: X(x + 29.5), max: 400 }];

/** a pose crossing: bridge (walk at the drum stop), else the wheel or the tower (on to its top, then off) */
const crossTroupe = (k: string, x: number, c0: number, n: number, pose: 'bridge' | 'wheel' | 'tower'): Step[] => {
  if (pose === 'bridge') return onBridge(k, x + c0, x + c0 + n + 0.2, 'the drum stops for the bridge');
  const mid = px(x + c0) + px(n) / 2;
  return [
    { hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + c0) - 2, max: 900, note: 'to the edge' },
    waitFor((w) => tr(w, k).pose === pose && tr(w, k).into < 0.2, `wait for the ${pose}`, 2400),
    leap(() => mid, `on to the ${pose}’s top`),
    leap(() => px(x + c0 + n) + 12, 'off to the far bank'),
  ];
};
const act07d = (x: number): Step[] => [...crossTroupe('bbi7d0', x, 3, 5, 'tower'), ...crossTroupe('bbi7d1', x, 13, 6, 'wheel'), { hold: 'R', until: X(x + 22.5), max: 300 }];
const act07e = (x: number): Step[] => [...crossTroupe('bbi7f0', x, 3, 7, 'bridge'), ...crossTroupe('bbi7f1', x, 13, 8, 'bridge'), ...crossTroupe('bbi7f2', x, 24, 9, 'bridge'), { hold: 'R', until: X(x + 35.5), max: 300 }];

const act06c = (x: number): Step[] => [
  { hold: 'R', until: X(x + 0.2), max: 300 },
  waitFor((w) => lm(w, 'bbi6f').bridge && lm(w, 'bbi6f').into > 1.55, 'three passes'),
  { hold: 'R', until: and(ground, X(x + 13.4)), max: 400, note: 'across' },
  { hold: 'R', until: X(x + 17.5), max: 300 },
];
const act09c = (x: number): Step[] => chariotRun('bbi9c', x, x + 9, x + 25.5, x + 29.5);
const act10d = (x: number): Step[] => [
  { hold: 'R', until: X(x + 0.6), max: 400 },
  { hold: 'R', jump: 9, ticks: 9, note: 'up on the keeper' },
  { hold: 'R', until: ground, max: 200 },
  onPadK('bbi10k2', 4, 12),
  { hold: '', until: (w) => kOf(w, 'bbi10k2').ball === 'gone', max: 900, note: 'the dive, the rebound, back' },
  { hold: 'R', until: and(ground, X(x + 14.6)), max: 300, note: 'off before he gets up' },
  { hold: 'R', until: X(x + 25.5), max: 400 },
];
const act10e = (x: number): Step[] => [...crossTroupe('bbi10n0', x, 3, 5, 'tower'), ...crossTroupe('bbi10n1', x, 12, 8, 'bridge'), { hold: 'R', until: X(x + 22.5), max: 300 }];

/** a loom act's route: wait clear of the shuttle, cross after its last pass */
const loomRun = (k: string, n: number, after: number) => (x: number): Step[] => [
  { hold: 'R', until: X(x + 0.2), max: 300 },
  waitFor((w) => lm(w, k).bridge && lm(w, k).into > after, 'the motif beat, the shuttle by'),
  { hold: 'R', until: and(ground, X(x + 3 + n + 0.4)), max: 400, note: 'across' },
  { hold: 'R', until: X(x + 3 + n + 3.5), max: 300 },
];
const chAct = (k: string, len: number, slide: number) => (x: number): Step[] => chariotRun(k, x, x + 3 + len - 3, x + 3 + len + slide + 1.5, x + 3 + len + slide + 5.2);
const bowlRun = (k: string, c0: number, c1: number, i: number, t: number) => (x: number): Step[] => [
  ...rideBowl(k, x + c0 - 1, x + c1 + 1.5, i, (w) => bw(w, k).t > t && bw(w, k).badis[i].x >= px(x + c1 + 1) - 26 - 4 - 34 * (bw(w, k).badis.length - 1 - i) - 0.5),
  { hold: 'R', until: X(x + c1 + 6.5), max: 400 },
];


const sidhiRun = (k: string) => (x: number): Step[] => {
    const out: Step[] = [{ hold: 'R', until: X(x + 1.6), max: 300 }, waitFor((w) => lm(w, k).bridge && lm(w, k).into < 0.3, 'the motif beat: the steps line up')];
    out.push({ note: 'hop up the steps, one each', max: 400, policy: (w) => ({ move: 'R', jump: w.player.onGround && w.tick % 6 < 3 }), until: and(ground, X(x + 10.4)) });
    out.push({ hold: 'R', until: X(x + 15.5), max: 300 });
    return out;
  };

/** the water lift: on to the bucket, up, off on to the wall top at the top */
const tendaRun = (k: string, rows: number) => (x: number): Step[] => [
  { hold: 'R', until: X(x + 4.6), max: 400 },
  { hold: 'R', jump: 8, ticks: 8, note: 'on to the bucket' },
  { hold: 'R', until: ground, max: 200 },
  stayOn(() => px(x + 8) - 14, (w) => (w.flags[k] as { k: number }).k >= 1, 'it lifts you up', 900),
  { hold: 'R', until: (w) => w.player.onGround && w.player.x >= px(x + 8) && w.player.y + w.player.h <= FLOOR_PX - 16 * rows + 1, max: 300, note: 'off on to the wall' },
  { hold: 'R', until: X(x + 15.5), max: 300 },
];

const bailRun = (k: string, len: number) => (x: number): Step[] => [
  { hold: 'R', until: (w) => (w.flags[k] as { started: number }).started >= 0, max: 600, note: 'touch the cart: they get up' },
  { hold: 'L', ticks: 30, note: 'step back at once' },
  { steer: (w) => (w.player.x + w.player.w < (w.flags[k] as { x: number }).x - 16 - 22 - 20 ? 'R' : ''), until: (w) => (w.flags[k] as { gone: boolean }).gone, max: 2400, note: 'follow, well back' },
  { hold: 'R', until: X(x + len + 7.5), max: 400 },
];

// ------------------------------------------------------------------ every act's own deaths (as MISTAKES)
type Death = { what: string; steps: (x: number) => Step[]; cause: string };
const walkOn = (cause: string, what = 'walk straight on'): Death => ({ what, cause, steps: () => [{ hold: 'R', until: done, max: 1500 }] });
const tFix = (k: string, c0: number, n: number): Death => ({
  what: 'wait for the whole bridge, then stop on it',
  cause: 'bbi-thrown',
  steps: (x) => [
    { hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + c0) - 2, max: 900 },
    waitFor((w) => tr(w, k).pose === 'bridge' && tr(w, k).into > 0.35, 'the whole bridge', 2400),
    { hold: 'R', until: X(x + c0 + n / 2 - 0.4), max: 300 },
    { hold: '', until: done, max: 900 },
  ],
});
const lFix = (k: string): Death => ({
  what: 'step on the moment the motif lines up, and look',
  cause: 'bbi-shuttle',
  steps: (x) => [{ hold: 'R', until: X(x + 0.2), max: 300 }, waitFor((w) => lm(w, k).bridge, 'the motif'), { hold: 'R', until: X(x + 5.3), max: 300, note: 'on to the motif' }, { hold: '', until: done, max: 900 }],
});
const cNaive = (len: number): Death => ({
  what: 'ride the chariot from its horses',
  cause: 'bbi-chakka',
  steps: (x) => [...hop(x + 1.4, 'up on the plinth'), { hold: 'R', until: X(x + len - 1.3), max: 400 }, { hold: 'R', jump: 11, ticks: 11 }, { hold: 'R', until: ground, max: 200 }, { hold: '', until: done, max: 900 }],
});
/** after the slam: jump off the moving plinth back to the bank before it gets to the wall */
const cFix = (len: number, k: string): Death => ({
  what: 'jump back off the plinth before it slams',
  cause: 'bbi-khai',
  steps: (x) => [...hop(x + 1.4, 'up on the plinth'), { hold: 'R', until: X(x + len - 1.3), max: 400 }, { hold: 'R', jump: 11, ticks: 11 }, { hold: 'R', until: ground, max: 200 }, { hold: '', until: (w) => chOf(w, k).started >= 0 && w.tick - chOf(w, k).started > 70, max: 600 }, { hold: 'L', jump: 15, ticks: 15 }, { hold: 'L', until: done, max: 600 }],
});
const bNaive = (left: number): Death => ({ what: 'walk across the settled rice', cause: 'bbi-pakhala', steps: (x) => [...hop(x + left - 1.6, 'up on the rim'), { hold: 'R', until: done, max: 900 }] });
const bFix = (k: string, left: number, i: number): Death => ({
  what: 'ride the badi the second jug pushes under',
  cause: 'bbi-dhara',
  steps: (x) => [...hop(x + left - 1.6, 'up on the rim'), leap(badiX(k, i), 'on to that badi'), stayOn(badiX(k, i), done, 'and wait on it', 1500)],
});
const kNaive = (k: string): Death => ({
  what: 'stand on the keeper’s front pad',
  cause: 'bbi-ball',
  steps: (x) => [{ hold: 'R', until: X(x + 0.6), max: 400 }, { hold: 'R', jump: 9, ticks: 9 }, { hold: 'R', until: ground, max: 200 }, onPadK(k, 36, 44), { hold: '', until: done, max: 900 }],
});
const kFix = (k: string): Death => ({
  what: 'off the keeper the moment he lands',
  cause: 'bbi-rebound',
  steps: (x) => [{ hold: 'R', until: X(x + 0.6), max: 400 }, { hold: 'R', jump: 9, ticks: 9 }, { hold: 'R', until: ground, max: 200 }, onPadK(k, 4, 12), { hold: '', until: (w) => kOf(w, k).ball === 'rebound', max: 900 }, { hold: 'R', until: done, max: 900 }],
});
const pNaive = (): Death => ({ what: 'jump for the first parasol at once', cause: 'bbi-rangapani', steps: (x) => [{ hold: 'R', until: X(x + 0.4), max: 300 }, { hold: 'R', jump: 12, ticks: 12 }, { hold: 'R', until: done, max: 600 }] });
const pFix = (flag: string): Death => ({
  what: 'wait for the customer, land on the silk away from the cut-out',
  cause: 'bbi-silk',
  steps: (x) => [
    { hold: 'R', until: X(x + 0.4), max: 300 },
    waitFor((w) => (w.flags[flag] as Para[])[0].open(w), 'it opens'),
    leap((w) => { const q = (w.flags[flag] as { rig: { x: number; w: number }; cutX: () => number }[])[0]; return q.cutX() > q.rig.x + 20 ? q.rig.x + 9 : q.rig.x + q.rig.w - 9; }, 'land on the silk, not the cut-out'),
    { hold: '', until: done, max: 900 },
  ],
});
/** the careful climber: on spoke 1, and wait there to be sure */
const spokesFix = (k: string, c0: number): Death => ({
  what: 'wait on each spoke to be sure of it',
  cause: 'bbi-dooba',
  steps: (x) => [{ hold: 'R', until: X(x + 1.4), max: 300 }, waitFor((w) => ((w.flags[k] as { stood: number[] }).stood[-1] ?? 1e9) + 1.35 * 120 <= w.tick, 'spoke 1 up'), leap(() => px(x + c0) + 14, 'spoke 1', () => true, 8), { hold: '', until: done, max: 900 }],
});
const spokesNaive = (): Death => ({
  what: 'climb the spokes fast, as at the sinking ones',
  cause: 'bbi-udaya',
  steps: (x) => [{ hold: 'R', until: X(x + 1.4), max: 300 }, { hold: '', ticks: 170 }, leap(() => px(x + 3) + 14, 'spoke 1', () => true, 8), leap(() => px(x + 5.5) + 14, 'straight on to spoke 2', () => true, 8), { hold: 'R', until: done, max: 600 }],
});
const DEATHS: Record<string, Death[]> = {
  'bbi04-karkhana': [
    { what: 'stop under the first torch to look', cause: 'bbi-agni', steps: (x) => [{ hold: 'R', until: X(x + 4.6), max: 400 }, { hold: '', until: done, max: 900 }] },
    { what: 'keep moving and jump the trough', cause: 'bbi-kunda', steps: (x) => [passTorch(x + 5, torchOn('bbi4a', 2.0, 0.6, 0.2), 'the first torch'), { hold: 'R', until: X(x + 9.2), max: 300 }, { hold: 'R', jump: 14, ticks: 14 }, { hold: 'R', until: done, max: 400 }] },
  ],
  'bbi05-dhenki': [
    { what: 'jump the pit, then use the stone as a stair', cause: 'bbi-sila', steps: (x) => [...act05a(x).slice(0, 5), { hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 16.75) - 14, max: 300 }, { hold: 'R', jump: 5, ticks: 5 }, { hold: '', until: done, max: 900 }] },
  ],
  'bbi05-khala': [
    walkOn('bbi-jaanta', 'walk on into the yard'),
    { what: 'jump the mill, then climb over the cart', cause: 'crushed', steps: (x) => [...hop(x + 3.2, 'over the mill', 14), { hold: 'R', until: X(x + 12.2), max: 400 }, { hold: 'R', jump: 9, ticks: 9 }, { hold: 'R', until: done, max: 900 }] },
  ],
  'bbi05-gadi': [{ what: 'climb on to the cart', cause: 'bbi-gadi', steps: (x) => [{ hold: 'R', until: X(x + 6.75), max: 400 }, { hold: 'R', jump: 6, ticks: 6 }, { hold: '', until: done, max: 900 }] }],
  'bbi06-sidhi': [walkOn('bbi-ranga')],
  'bbi07-bandha': [
    walkOn('bbi-nacha'),
    { what: 'take the second troupe’s bridge to the high bank', cause: 'bbi-thrown', steps: (x) => [...crossTroupe('bbi7b1', x, 3, 11, 'bridge'), { hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 19) - 2, max: 400 }, waitFor((w) => tr(w, 'bbi7b2').pose === 'bridge', 'its bridge', 2400), { hold: 'R', until: done, max: 900 }] },
  ],
  'bbi02-corner': [walkOn('bbi-ball')],
  'bbi02-chhal': [{ what: 'wait at the stopper for the ball to stop', cause: 'bbi-ball', steps: (x) => [{ hold: 'R', until: X(x + 12), max: 400 }, { hold: '', until: done, max: 900 }] }],
  'bbi02-dive': [kNaive('bbi2b'), kFix('bbi2b')],
  'bbi03-gali': [pNaive(), pFix('bbi3ap')],
  'bbi03-mela': [pNaive(), pFix('bbi3bp')],
  'bbi05-chakki': [{ what: 'jump the channel from the bank', cause: 'bbi-dhan', steps: (x) => [{ hold: 'R', until: X(x + 1.4), max: 400 }, leap(() => px(x + 4) + 8, 'on to the mill', () => true, 5), { hold: 'R', until: X(x + 5.4), max: 300 }, { hold: 'R', jump: 15, ticks: 15 }, { hold: 'R', until: done, max: 600 }] }],
  'bbi09-ara': [{ what: 'stop on spoke 1 to make sure of it', cause: 'bbi-ara', steps: (x) => [{ hold: 'R', until: X(x + 1.3), max: 300 }, leap(() => px(x + 3) + 14, 'spoke 1'), { hold: '', until: done, max: 600 }] }],
  'bbi05-chheli': [
    { what: 'jump the pit from the straw at once', cause: 'bbi-chheli', steps: (x) => [{ hold: '', until: ground, max: 300 }, ...hop(x + 4.1, 'up on the straw', 15), { hold: 'R', until: X(x + 6.9), max: 300 }, { hold: 'R', jump: 15, ticks: 15 }, { hold: 'R', until: done, max: 600 }] },
    { what: 'jump once the pounder lies flat', cause: 'bbi-sinha', steps: (x) => [{ hold: '', until: ground, max: 300 }, ...hop(x + 4.1, 'up on the straw', 15), { hold: 'R', until: X(x + 6.6), max: 300 }, { hold: '', until: (w) => goat(w).dir > 0 && !goat(w).up && goat(w).x > px(x + 12), max: 2400 }, { hold: 'R', until: X(x + 6.9), max: 300 }, { hold: 'R', jump: 15, ticks: 15 }, { hold: 'R', until: done, max: 600 }] },
  ],
  'bbi05-thaka': [
    { what: 'touch nothing: go under the stone between sweeps', cause: 'bbi-pathara', steps: (x) => [...hop(x + 2.9, 'over the plate, touching nothing', 12), { hold: 'R', until: X(x + 6.0), max: 400 }, { hold: '', until: (w) => th(w).y < 240 - 26, max: 900 }, { hold: 'R', until: done, max: 600 }] },
    { what: 'stop it the moment you reach the plate', cause: 'bbi-pani', steps: (x) => [{ hold: 'R', until: X(x + 2.6), max: 400 }, { hold: '', until: (w) => th(w).y > 240 - 17, max: 900 }, { hold: 'R', until: (w) => th(w).frozen >= 0, max: 200 }, { hold: '', until: done, max: 600 }] },
  ],
  'bbi05-ganna': [
    { what: 'start the mill and ride it over, as before', cause: 'bbi-ganna', steps: (x) => [{ hold: 'R', until: X(x + 1.4), max: 300 }, leap(() => px(x + 4) + 8, 'on to the far half', () => true, 5), { hold: '', until: (w) => (w.flags.bbi5gm as { started: number }).started >= 0, max: 200 }, { hold: '', until: (w) => w.player.onGround && w.player.x > px(x + 13), max: 400 }, { hold: 'R', until: done, max: 600 }] },
    { what: 'knock the belt off, then jump the channel yourself', cause: 'bbi-dhan', steps: (x) => [{ hold: 'R', until: X(x + 0.05), max: 300 }, { hold: '', jump: 10, until: (w) => !gn(w).belt, max: 200 }, { hold: '', until: (w) => w.player.onGround && w.player.vy >= 0, max: 200 }, { hold: '', ticks: 6 }, leap(() => px(x + 4) + 8, 'on to the mill', () => true, 5), { hold: 'R', until: X(x + 5.4), max: 300 }, { hold: 'R', jump: 15, ticks: 15 }, { hold: 'R', until: done, max: 600 }] },
  ],
  'bbi05-mama': [
    { what: 'ride the water lift, as before', cause: 'bbi-mama', steps: (x) => [...hop(x + 9.2, 'over the treadle, touching nothing', 10), { hold: '', until: ground, max: 200 }, ...tendaRun('bbi5mm', 5)(x + 8).slice(0, 3), stayOn(() => px(x + 16) - 14, done, 'and up', 1500)] },
    { what: 'start the grinder and wait by it to see what he does', cause: 'bbi-dhakka', steps: (x) => [{ hold: 'R', until: (w) => (w.flags.bbi5ma as { decoy: boolean }).decoy, max: 400 }, { hold: '', until: done, max: 1500 }] },
  ],
  'bbi05-patra': [
    walkOn('bbi-patra'),
    { what: 'wait for the soot, then walk straight on', cause: 'bbi-khali', steps: (x) => [{ hold: 'R', until: X(x + 2.6), max: 400 }, { hold: '', until: (w) => soot(w) >= 6, max: 1500 }, { hold: 'R', until: done, max: 900 }] },
  ],
  'bbi05-bail': [{ what: 'push on past the cart', cause: 'bbi-bail', steps: () => [{ hold: 'R', until: done, max: 900 }] }],
  'bbi06-tana': [walkOn('bbi-ranga'), lFix('bbi6b')],
  'bbi06-rachh': [walkOn('bbi-ranga'), lFix('bbi6q')],
  'bbi06-palaa': [
    { what: 'run at the shuttle and jump on', cause: 'bbi-ranga', steps: (x) => [{ hold: 'R', until: X(x + 3.4), max: 400 }, { hold: 'R', jump: 12, ticks: 12 }, { hold: 'R', until: done, max: 600 }] },
    { what: 'wait at the edge for it to come back to you', cause: 'bbi-rachh', steps: (x) => [{ hold: 'R', until: X(x + 2.4), max: 400 }, { hold: '', until: done, max: 1200 }] },
  ],
  'bbi06-tantu': [
    { what: 'snap the nearest thread, from the edge', cause: 'bbi-tantu', steps: (x) => [{ hold: 'R', until: X(x + 3.6), max: 400 }, waitFor((w) => lm(w, 'bbi6p').bridge, 'the motif'), { hold: 'R', jump: 12, ticks: 12, note: 'up into the first thread' }, { hold: 'R', until: done, max: 600 }] },
    { what: 'leave the loom alone and time the shuttle', cause: 'bbi-rachh', steps: (x) => [{ hold: 'R', until: X(x + 3.6), max: 400 }, waitFor((w) => lm(w, 'bbi6p').bridge && lm(w, 'bbi6p').into > 0.9, 'both passes of the shuttle by'), { hold: 'R', until: done, max: 600 }] },
  ],
  'bbi06-sutra': [
    { what: 'let the shuttle by, then walk across', cause: 'bbi-sutra', steps: (x) => [{ hold: 'R', until: X(x + 2.1), max: 300 }, waitFor((w) => lm(w, 'bbi6z').bridge && lm(w, 'bbi6z').into > 0.6, 'the shuttle by'), { hold: 'R', until: done, max: 600 }] },
    { what: 'go at once and hop the hole', cause: 'bbi-shuttle', steps: (x) => [{ hold: 'R', until: X(x + 2.1), max: 300 }, waitFor((w) => lm(w, 'bbi6z').bridge && lm(w, 'bbi6z').into > 0.12, 'the motif'), { hold: 'R', until: X(x + 5.6), max: 300 }, { hold: 'R', jump: 10, ticks: 10 }, { hold: 'R', until: done, max: 600 }] },
  ],
  'bbi06-patta': [
    { what: 'walk straight over both pits', cause: 'bbi-sadha', steps: () => [{ hold: 'R', until: done, max: 900 }] },
    { what: 'follow the panel beside the second pit', cause: 'bbi-chitra', steps: (x) => [{ hold: 'R', until: X(x + 10.6), max: 600 }, leap(() => px(x + 16), 'the plank its panel paints'), { hold: '', until: done, max: 300 }] },
  ],
  'bbi07-mardala': [walkOn('bbi-nacha'), tFix('bbi7a1', 4, 6)],
  'bbi07-deepa': [walkOn('bbi-nacha'), { what: 'stand on the wheel', cause: 'bbi-deepa', steps: (x) => [{ hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 4) - 2, max: 900 }, waitFor((w) => tr(w, 'bbi7l').pose === 'wheel', 'the wheel', 2400), leap(() => px(x + 8), 'on to its top'), { hold: '', until: done, max: 600 }] }],
  'bbi07-bagudi': [
    walkOn('bbi-bagudi'),
    { what: 'hop the raider', cause: 'bbi-chhuin', steps: (x) => [{ hold: 'R', until: X(x + 4), max: 400 }, { hold: '', until: (w) => { const r = (w.flags.bbi7bg as { x: number; dir: number }); return r.dir < 0 && r.x - w.player.x < 40; }, max: 900 }, { hold: 'R', jump: 15, ticks: 15 }, { hold: 'R', until: done, max: 900 }] },
  ],
  'bbi07-pada': [
    { what: 'wait at the edge for the bridge', cause: 'bbi-pada', steps: (x) => [{ hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 7) - 2, max: 400 }, { hold: '', until: done, max: 1500 }] },
    { what: 'wait well back, then go when it lands', cause: 'bbi-thrown', steps: (x) => [{ hold: 'R', until: X(x + 0.6), max: 300 }, { hold: '', until: (w) => pd(w).phase === 'stand', max: 1500 }, { hold: '', until: (w) => pd(w).phase === 'lie', max: 1500 }, { hold: 'R', until: done, max: 600 }] },
  ],
  'bbi07-dui-baja': [
    { what: 'go when the drummer by you stops', cause: 'bbi-nacha', steps: (x) => [{ hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 4) - 2, max: 400 }, waitFor((w) => !!(w.flags.bbi7db0 as { decoyStopped?: boolean }).decoyStopped, 'your drummer stops', 1500), { hold: 'R', until: done, max: 900 }] },
    { what: 'go on the far drummer’s stop, but take your time', cause: 'bbi-thrown', steps: (x) => [{ hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 4) - 2, max: 400 }, waitFor((w) => tr(w, 'bbi7db0').pose === 'bridge' && tr(w, 'bbi7db0').into > 0.3, 'his stop', 1500), { hold: 'R', until: X(x + 6.5), max: 300 }, { hold: '', until: done, max: 900 }] },
  ],
  'bbi07-jodi': [
    { what: 'wait for the whole bridge, then walk', cause: 'bbi-nacha', steps: (x) => [{ hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 4) - 2, max: 900 }, waitFor((w) => tr(w, 'bbi7jd1n').pose === 'bridge' && tr(w, 'bbi7jd1n').into > 0.35, 'the whole bridge', 2400), { hold: 'R', until: done, max: 600 }] },
    { what: 'go the moment the second half lands', cause: 'bbi-adha', steps: (x) => [...jodiRun(x).slice(0, 4), waitFor((w) => tr(w, 'bbi7jd2f').pose === 'bridge', 'the second half lands', 2400), { hold: 'R', until: done, max: 600 }] },
  ],
  'bbi07-gadiba': [
    { what: 'go at the stop and walk on through the roll', cause: 'bbi-ulta-gadi', steps: (x) => [{ hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 4) - 2, max: 900 }, waitFor((w) => gd(w).pose === 'bridge', 'the stop', 2400), { hold: 'R', until: done, max: 600 }] },
    { what: 'stand still on it when it shivers', cause: 'bbi-gadi-tala', steps: (x) => [{ hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 4) - 2, max: 900 }, waitFor((w) => gd(w).pose === 'bridge', 'the stop', 2400), { hold: 'R', until: X(x + 6.5), max: 300 }, { hold: '', until: done, max: 600 }] },
  ],
  'bbi07-hulahuli': [
    { what: 'go at the first stop, as taught', cause: 'bbi-thrown', steps: (x) => [{ hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 4) - 2, max: 900 }, waitFor((w) => hh(w).pose === 'bridge', 'the stop', 2400), { hold: 'R', until: done, max: 600 }] },
    { what: 'wait for the cheer to swell, then go', cause: 'bbi-kick', steps: (x) => [{ hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 4) - 2, max: 900 }, waitFor((w) => hulaCheer(w) && hh(w).into > 0.55, 'the cheer swells', 2400), { hold: 'R', until: done, max: 600 }] },
  ],
  'bbi07-sajaghara': [
    { what: 'shelter in the tent and wait there for the bridge', cause: 'bbi-saja', steps: (x) => [{ hold: 'R', until: X(x + 2.2), max: 400 }, { hold: '', until: done, max: 1500 }] },
    { what: 'wait at the edge, ready to go at the stop', cause: 'bbi-dauda', steps: (x) => [{ hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 6) - 2, max: 400 }, { hold: '', until: done, max: 1500 }] },
  ],
  'bbi08-bhanwar': [
    { what: 'stay on the badi', cause: 'bbi-bhanwar', steps: (x) => [...hop(x + 1.4, 'up on the rim'), { hold: '', until: ground, max: 300 }, { hold: '', until: (w) => { const k = fresh(w); if (k >= 0) ridden.k = k; return k >= 0; }, max: 1500 }, leap((w) => dr(w).badis[ridden.k].x + 13, 'on to it', () => true, 5), { hold: '', until: done, max: 1500 }] },
    { what: 'hop for the far rim early', cause: 'bbi-pakhala', steps: (x) => [...hop(x + 1.4, 'up on the rim'), { hold: '', until: ground, max: 300 }, { hold: '', until: (w) => { const k = fresh(w); if (k >= 0) ridden.k = k; return k >= 0; }, max: 1500 }, leap((w) => dr(w).badis[ridden.k].x + 13, 'on to it', () => true, 5), stayOn((w) => dr(w).badis[ridden.k].x + 13, (w) => dr(w).badis[ridden.k].x + 13 > px(x + 10), 'ride a little', 1500), { hold: 'R', jump: 15, ticks: 15 }, { hold: 'R', until: done, max: 600 }] },
  ],
  'bbi08-dati': [
    { what: 'stay on your badi', cause: 'bbi-bhanwar', steps: (x) => [...hop(x + 1.4, 'up on the rim'), { hold: '', until: ground, max: 300 }, leap((w) => pl(w).bx[0] + 13, 'on to it', () => true, 5), { hold: '', until: done, max: 1500 }] },
    { what: 'hop for the far rim at the last moment', cause: 'bbi-pakhala', steps: (x) => [...hop(x + 1.4, 'up on the rim'), { hold: '', until: ground, max: 300 }, leap((w) => pl(w).bx[0] + 13, 'on to it', () => true, 5), stayOn((w) => pl(w).bx[0] + 13, (w) => pl(w).bx[0] + 13 > px(x + 9) - 10, 'to the hole', 1500), { hold: 'R', jump: 15, ticks: 15 }, { hold: 'R', until: done, max: 600 }] },
  ],
  'bbi10-ghurni': [
    { what: 'hop on at the slow edge, as before', cause: 'bbi-ghurni', steps: (x) => [{ hold: 'R', until: X(x + 2.6), max: 400 }, waitFor((w) => gr10(w).t0 >= 0 && gr10(w).u[0] < -0.97, 'its near edge'), { hold: 'R', jump: 10, ticks: 10 }, { hold: 'R', until: done, max: 600 }] },
    { what: 'get on in the middle and wait for the stir to stop', cause: 'bbi-chamacha', steps: (x) => [...ghurni10Run(x).slice(0, 3), stayOn((w) => gr10(w).rigs[0].x + 13, done, 'and wait', 900)] },
  ],
  'bbi10-palaa': [
    { what: 'let it run, and wait for it to come back, as before', cause: 'bbi-rachh', steps: (x) => [{ hold: 'R', until: X(x + 2.4), max: 400 }, { hold: '', until: done, max: 1200 }] },
    { what: 'jump out to where it came back last time', cause: 'bbi-ranga', steps: (x) => [{ hold: 'R', until: X(x + 2.4), max: 400 }, leap(() => px(x + 6.5), 'out over the pit'), { hold: '', until: done, max: 600 }] },
  ],
  'bbi10-chakra': [
    { what: 'wait on the hub for the slam, as before', cause: 'bbi-chakka', steps: (x) => [...chakraRun(x).slice(0, 7), { hold: '', until: done, max: 900 }] },
    cFix(8, 'bbi10ck'),
  ],
  'bbi10-ghungur': [
    { what: 'jump the bells and walk the quiet, as before', cause: 'bbi-nacha', steps: (x) => [...hop(x + 5.3, 'over the bells'), { hold: 'R', until: done, max: 600 }] },
    { what: 'wait at the edge for the lamps', cause: 'bbi-thrown', steps: (x) => [{ hold: 'R', until: X(x + 3.2), max: 400 }, waitFor((w) => (w.flags.bbi10gh as { phase: string; t0: number }).t0 >= 0 && (w.flags.bbi10gh as { phase: string }).phase !== 'dark', 'the lamps come back'), { hold: 'R', until: done, max: 600 }] },
  ],
  'bbi10-phinga': [
    { what: 'to the rim at once and ride the first, as before', cause: 'bbi-badi', steps: (x) => [{ hold: 'R', until: X(x + 2.6), max: 400 }, { hold: '', until: done, max: 1200 }] },
    { what: 'wait back, then ride the first one in the water', cause: 'bbi-buda', steps: (x) => [{ hold: 'R', until: X(x + 1.3), max: 400 }, waitFor((w) => ph10(w).t0 >= 0 && (w.tick - ph10(w).t0) / 120 > 2.5 + 0.6, 'one lands in the water'), { hold: 'R', until: X(x + 2.6), max: 200 }, leap((w) => ph10(w).floats[2].x + 13, 'on to it'), { hold: '', until: done, max: 600 }] },
  ],
  'bbi10-tantu': [
    { what: 'snap the plain thread, as before', cause: 'bbi-ganthi', steps: (x) => [{ hold: 'R', until: X(x + 2.6), max: 400 }, { hold: '', until: (w) => Math.abs(w.player.vx) < 5, max: 120 }, { hold: '', jump: 12, ticks: 40 }, { hold: 'R', until: X(x + 3.6), max: 300 }, waitFor((w) => lm(w, 'bbi10tn').bridge && lm(w, 'bbi10tn').into > 0.08, 'the motif'), { hold: 'R', until: done, max: 600 }] },
    { what: 'leave the loom alone and time the shuttle', cause: 'bbi-rachh', steps: (x) => [{ hold: 'R', until: X(x + 3.6), max: 400 }, waitFor((w) => lm(w, 'bbi10tn').bridge && lm(w, 'bbi10tn').into > 0.9, 'both passes of the shuttle by'), { hold: 'R', until: done, max: 600 }] },
  ],
  'bbi07-pothi': [
    { what: 'walk over the screen', cause: 'bbi-pothi', steps: (x) => [{ hold: 'R', until: done, max: 900 }] },
    { what: 'hop the hinges and keep going', cause: 'bbi-nacha', steps: (x) => [...pothiRun(x).slice(0, 13), { hold: 'R', until: done, max: 600 }] },
  ],
  'bbi07-kachha': [
    { what: 'go on the first stop, as taught', cause: 'bbi-kachha', steps: (x) => [{ hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 4) - 2, max: 900 }, waitFor((w) => tr(w, 'bbi7kc0').pose === 'bridge', 'the stop', 2400), { hold: 'R', until: done, max: 600 }] },
    { what: 'wait for each troupe to settle before you trust it', cause: 'bbi-thrown', steps: (x) => [...kachhaRun(x).slice(0, 6), waitFor((w) => tr(w, 'bbi7kc1').pose === 'bridge' && tr(w, 'bbi7kc1').into > 0.6, 'it has settled', 2400), { hold: 'R', until: done, max: 600 }] },
  ],
  'bbi07-ghungur': [
    { what: 'walk through where you saw the gaps', cause: 'bbi-nacha', steps: (x) => [{ hold: 'R', until: X(x + 8.6), max: 400 }, { hold: 'R', jump: 12, ticks: 12, note: 'over where a boy was' }, { hold: 'R', until: done, max: 600 }] },
    { what: 'wait at the edge for the lamps', cause: 'bbi-thrown', steps: (x) => [{ hold: 'R', until: X(x + 3.2), max: 400 }, waitFor((w) => (w.flags.bbi7gh as { phase: string }).phase !== 'dark' && (w.flags.bbi7gh as { t0: number }).t0 >= 0, 'the lamps come back'), { hold: 'R', until: done, max: 600 }] },
  ],
  'bbi08-ghurni': [
    { what: 'jump on the first badi as soon as it is in reach', cause: 'bbi-ghurni', steps: (x) => [{ hold: 'R', until: X(x + 3.0), max: 400 }, waitFor((w) => { const c = Math.cos(gh(w).th[0]); return Math.sin(gh(w).th[0]) > 0.6 && c < 0; }, 'it races towards you'), { hold: 'R', jump: 12, ticks: 12 }, { hold: 'R', until: done, max: 600 }] },
    { what: 'get on at the edge and wait for the stir to stop', cause: 'bbi-chamacha', steps: (x) => [{ hold: 'R', until: X(x + 3.0), max: 400 }, waitFor((w) => Math.cos(gh(w).th[0]) < -0.97, 'the near edge'), leap((w) => gh(w).rigs[0].x + 13, 'on at the slow edge'), stayOn((w) => gh(w).rigs[0].x + 13, done, 'and wait', 900)] },
  ],
  'bbi08-phinga': [
    { what: 'stand at the rim and read his throws', cause: 'bbi-badi', steps: (x) => [{ hold: 'R', until: X(x + 2.8), max: 400 }, { hold: '', until: done, max: 1200 }] },
    { what: 'let the first go by, then ride the second', cause: 'bbi-buda', steps: (x) => [{ hold: 'R', until: X(x + 1.4), max: 400 }, waitFor((w) => ph(w).t0 >= 0 && (w.tick - ph(w).t0) / 120 > 2.2 + 0.6, 'the second lands'), leap((w) => ph(w).floats[1].x + 13, 'on to the second'), { hold: '', until: done, max: 600 }] },
  ],
  'bbi09-ratha': [cNaive(10), cFix(10, 'bbi9b')],
  'bbi09-ulta': [cNaive(9), { what: 'step down on to the stone after the slam', cause: 'bbi-ulta', steps: (x) => [...chAct('bbi9u', 9, 8)(x).slice(0, 9), { hold: 'L', ticks: 40 }, { hold: '', until: done, max: 900 }] }],
  'bbi09-udaya': [spokesNaive(), spokesFix('bbi9r', 3)],
  'bbi10-deepa': [
    { what: 'wait for the bridge and walk under the lamps', cause: 'bbi-deepa', steps: (x) => [...onBridge('bbi10d', x + 4, x + 12.2, 'the bridge')] },
    { what: 'ride the wheel and stay on it', cause: 'bbi-thrown', steps: (x) => [{ hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 4) - 2, max: 900 }, waitFor((w) => tr(w, 'bbi10d').pose === 'wheel' && tr(w, 'bbi10d').into < 0.2, 'the wheel', 2400), leap(() => px(x + 8), 'on to its top'), { hold: '', until: done, max: 900 }] },
  ],
  'bbi10-patra': [
    { what: 'wait for the soot, then step on the written leaves', cause: 'bbi-likhita', steps: (x) => [{ hold: 'R', until: X(x + 2.6), max: 400 }, { hold: '', until: (w) => soot(w, 'bbi10pt') >= 6, max: 1500 }, leap(() => px(x + 5), 'leaf 1'), leap(() => px(x + 7), 'leaf 2, written'), { hold: '', until: done, max: 600 }] },
    walkOn('bbi-patra'),
  ],
  'bbi10-dui-baja': [
    { what: 'go when the drummer across the pit stops', cause: 'bbi-nacha', steps: (x) => [{ hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 4) - 2, max: 400 }, waitFor((w) => !!(w.flags.bbi10db0 as { decoyStopped?: boolean }).decoyStopped, 'his stop', 1500), { hold: 'R', until: done, max: 900 }] },
    { what: 'go on the near drummer’s stop, but take your time', cause: 'bbi-thrown', steps: (x) => [{ hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 4) - 2, max: 400 }, waitFor((w) => tr(w, 'bbi10db0').pose === 'bridge' && tr(w, 'bbi10db0').into > 0.3, 'his stop', 1500), { hold: 'R', until: X(x + 6.5), max: 300 }, { hold: '', until: done, max: 900 }] },
  ],
  'bbi10-pada': [
    { what: 'wait back by the scuffs, as before', cause: 'bbi-nacha', steps: (x) => [{ hold: 'R', until: X(x + 4.2), max: 400 }, { hold: '', until: (w) => pd(w, 'bbi10pd').phase === 'lie', max: 1500 }, { hold: 'R', until: done, max: 600 }] },
    { what: 'go from the edge, then stop on it to rest', cause: 'bbi-thrown', steps: (x) => [{ hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 7) - 3, max: 400 }, { hold: '', until: (w) => pd(w, 'bbi10pd').phase === 'lie', max: 1500 }, { hold: 'R', until: X(x + 10), max: 300 }, { hold: '', until: done, max: 600 }] },
  ],
  'bbi10-bagudi': [
    { what: 'tagged, back over the line to pass it on', cause: 'bbi-bagudi', steps: (x) => [{ hold: 'R', until: (w) => bg(w, 'bbi10bg').it, max: 1200 }, { hold: 'L', until: (w) => bg(w, 'bbi10bg').out, max: 600 }, { hold: 'R', until: done, max: 900 }] },
    { what: 'tagged, then wait to see what the boys do', cause: 'bbi-ghera', steps: (x) => [{ hold: 'R', until: (w) => bg(w, 'bbi10bg').it, max: 1200 }, { hold: 'R', until: X(x + 15.7), max: 300 }, { hold: '', until: done, max: 900 }] },
  ],
  'bbi10-udaya': [
    { what: 'on to spoke 1 as soon as it is up, and wait for the next', cause: 'bbi-dooba', steps: (x) => [{ hold: 'R', until: X(x + 1.4), max: 300 }, waitFor((w) => u10(w).prog > 0.9, 'spoke 1 up'), leap(() => px(x + 3) + 14, 'spoke 1', () => true, 8), { hold: '', until: done, max: 900 }] },
    { what: 'from spoke 1, jump on for where spoke 2 comes up', cause: 'bbi-udaya', steps: (x) => [{ hold: 'R', until: X(x + 1.4), max: 300 }, waitFor((w) => u10(w).prog > 0.9, 'spoke 1 up'), leap(() => px(x + 3) + 14, 'spoke 1', () => true, 8), { hold: 'R', jump: 10, ticks: 10 }, { hold: 'R', until: done, max: 600 }] },
  ],
  'bbi10-chheli': [
    { what: 'wait on the straw for the goat to come back to your side', cause: 'bbi-sinha', steps: (x) => [{ hold: '', until: ground, max: 300 }, ...hop(x + 4.1, 'up on the straw', 15), { hold: 'R', until: X(x + 6.6), max: 300 }, { hold: '', until: done, max: 2400 }] },
    { what: 'jump while the goat is on the pounder', cause: 'bbi-chheli', steps: (x) => [{ hold: '', until: ground, max: 300 }, ...hop(x + 4.1, 'up on the straw', 15), { hold: 'R', until: X(x + 6.9), max: 300 }, { hold: '', until: (w) => goat(w, 'bbi10ch').up, max: 2400 }, { hold: 'R', jump: 15, ticks: 15 }, { hold: 'R', until: done, max: 600 }] },
  ],
  'bbi10-patta': [
    { what: 'walk over the first pit, as before', cause: 'bbi-sadha', steps: () => [{ hold: 'R', until: done, max: 900 }] },
    { what: 'cross the second by the panel you passed', cause: 'bbi-chitra', steps: (x) => [...patta10Run(x).slice(0, 4), leap(() => px(x + 14), 'plank 1, as the first panel painted'), { hold: '', until: done, max: 300 }] },
  ],
  'bbi10-thaka': [
    { what: 'stop it at its top and walk under, as before', cause: 'bbi-kua', steps: (x) => [{ hold: 'R', until: X(x + 2.6), max: 400 }, { hold: '', until: (w) => th(w, 'bbi10th').y < 240 - 28.5, max: 900 }, { hold: 'R', until: done, max: 600 }] },
    { what: 'stop it at its top and climb on to the stone', cause: 'bbi-pathara', steps: (x) => [{ hold: 'R', until: X(x + 2.6), max: 400 }, { hold: '', until: (w) => th(w, 'bbi10th').y < 240 - 28.5, max: 900 }, { hold: 'R', until: (w) => th(w, 'bbi10th').frozen >= 0, max: 200 }, { hold: 'R', until: X(x + 5.4), max: 300 }, { hold: 'R', jump: 14, ticks: 14 }, { hold: 'R', until: done, max: 600 }] },
  ],
  'bbi10-chhata': [
    { what: 'wait on the first cut-out for a customer', cause: 'bbi-rangapani', steps: (x) => [{ hold: 'R', until: X(x + 0.4), max: 300 }, leap6(cut10(0), 'on to it'), stayOn(cut10(0), done, 'and wait', 1500)] },
    pFix('bbi10ps'),
  ],
  'bbi10-tana': [
    { what: 'go at the troupe drummer’s stop', cause: 'bbi-nacha', steps: (x) => [...act10b(x).slice(0, 3), { hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 14) - 2, max: 600 }, waitFor((w) => tr(w, 'bbi10tr').pose === null && tr(w, 'bbi10tr').into < 0.2 && (w.flags.bbi10tr as { stops: number }).stops > 0, 'his stop'), { hold: 'R', until: done, max: 600 }] },
    { what: 'take the bridge, then rest on it', cause: 'bbi-thrown', steps: (x) => [...act10b(x).slice(0, 3), ...onBridge('bbi10tr', x + 14, x + 17, 'the bridge'), { hold: '', until: done, max: 900 }] },
  ],
};
const ROOMS: Record<string, () => Step[]> = { 'BBI-02': room02, 'BBI-04': room04, 'BBI-03': room03, 'BBI-05': room05, 'BBI-06': room06, 'BBI-07': room07, 'BBI-08': room08, 'BBI-09': room09, 'BBI-10': room10 };
/** for every act with deaths listed: the stage's route up to the act's start, then the death play */
function actDeaths() {
  for (const [id, room] of Object.entries(ROOMS)) {
    const def = LEVELS.find((l) => l.id === id);
    if (!def?.parts) continue;
    const pre: Step[] = [...room()];
    for (const p of def.parts) {
      for (const d of DEATHS[p.kind] ?? []) (mistakes[id] ??= []).push({ what: `${p.kind}: ${d.what}`, steps: [...pre, ...d.steps(p.x0 + (LEAD[p.kind] ?? 0))], cause: d.cause });
      pre.push(...actRoutes[p.kind](p.x0));
    }
  }
}

function solutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  S['BBI-01'] = [...pastG1(), ...tourTail()];
  S['BBI-02'] = room02();
  lengthen('BBI-02', 0, []);
  {
    // the door: walk on to it (the door-end roll), or wait back on the grass (the roll from behind)
    const pre = S['BBI-02'].slice(0, -1);
    const D = LEVELS.find((l) => l.id === 'BBI-02')!.doorX!;
    (mistakes['BBI-02'] ??= []).push(
      { what: 'door: walk on to the door', steps: [...pre, { hold: 'R', until: done, max: 900 }], cause: 'bbi-roll' },
      { what: 'door: wait back on the grass for the rolls', steps: [...pre, { hold: 'R', until: X(D - 11), max: 300 }, { hold: '', until: done, max: 900 }], cause: 'bbi-roll-back' },
    );
  }
  S['BBI-03'] = room03();
  lengthen('BBI-03', 0, []);
  S['BBI-04'] = room04();
  lengthen('BBI-04', 0, []);
  S['BBI-05'] = room05();
  lengthen('BBI-05', 0, []);
  S['BBI-06'] = room06();
  lengthen('BBI-06', 0, []);
  S['BBI-07'] = room07();
  lengthen('BBI-07', 0, []);
  S['BBI-08'] = room08();
  lengthen('BBI-08', 0, []);
  S['BBI-09'] = room09();
  lengthen('BBI-09', 0, []);
  S['BBI-10'] = room10();
  lengthen('BBI-10', 0, []);
  {
    // the full route up to the sinking spokes, then the careful climber who checks each spoke
    const order: [string, number][] = [['bbi09-udaya', 42], ['bbi09-ratha', 28], ['bbi09-ulta', 26]];
    let X0 = 32;
    const pre: Step[] = [...room09()];
    for (const [id, wd] of order) {
      pre.push(...actRoutes[id](X0));
      X0 += wd;
    }
    X0 += LEAD['bbi09-ara'] ?? 0;
    fix['BBI-09'].steps = [...pre, { hold: 'R', until: X(X0 + 1.3), max: 300 }, leap(() => px(X0 + 3) + 14, 'spoke 1'), { hold: '', ticks: 70, note: 'make sure of it' }, leap(() => px(X0 + 5.5) + 14, 'spoke 2'), { hold: '', ticks: 70 }, leap(() => px(X0 + 8) + 14, 'spoke 3'), { hold: '', until: done, max: 400 }];
  }
  fix['BBI-05'].steps = [...S['BBI-05'].slice(0, -1), { policy: (w) => verandahPolicy(w, fixMem(w), null as unknown as Door), until: done, max: 1500, note: 'up to the front door on the verandah' }];
  actDeaths();
  void lengthen;
}

const naive: Record<string, { steps: Step[]; cause?: string }> = {
  'BBI-10': { steps: [...board10(), onPad10(36, 44), { hold: '', until: done, max: 900, note: 'the front pad, nearest the way' }], cause: 'bbi-ball' },
  'BBI-09': { steps: [...toHorses(), { hold: '', until: done, max: 900, note: 'ride the chariot' }], cause: 'bbi-chakka' },
  'BBI-08': { steps: [...hop(4.4, 'up on the rim'), { hold: 'R', until: done, max: 900, note: 'and walk across the rice' }], cause: 'bbi-pakhala' },
  'BBI-07': { steps: [...hop(8.8, 'jump on to the dancers'), { hold: 'R', until: done, max: 600 }], cause: 'bbi-nacha' },
  'BBI-06': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'bbi-ranga' },
  'BBI-05': { steps: [{ hold: 'R', until: X(11.7), max: 600 }, { hold: 'R', jump: 3, ticks: 8, note: 'a little hop on to the stone in the channel' }, { hold: '', until: done, max: 600 }], cause: 'bbi-jaanta' },
  'BBI-04': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'bbi-agni' },
  'BBI-03': { steps: [...hop(3.6, 'jump for the first parasol'), { hold: 'R', until: done, max: 600 }], cause: 'bbi-rangapani' },
  'BBI-02': { steps: [...board02(), onPad(36, 44), { hold: '', until: done, max: 900, note: 'wait at the front, nearest the far side' }], cause: 'bbi-ball' },
  'BBI-01': { steps: [...tourHead(), ...hop(28.6, 'just walk on and hop the drain'), { hold: 'R', until: done, max: 900 }], cause: 'bbi-nala' },
};
const fix: Record<string, { steps: Step[]; cause?: string }> = {
  'BBI-10': { steps: [...room10().slice(0, 7), { hold: '', until: done, max: 900, note: 'and ride the plinth to the wall' }], cause: 'bbi-chakka' },
  'BBI-09': { steps: [], cause: 'bbi-ara' },
  'BBI-08': { steps: [...hop(4.4, 'up on the rim'), leap(badiX('bbi8', 2), 'on to the badi nearest the way out'), stayOn(badiX('bbi8', 2), done, 'and wait on it')], cause: 'bbi-dhara' },
  'BBI-07': { steps: [{ hold: 'R', until: (w) => w.player.x + w.player.w >= px(10) - 2, max: 900 }, waitFor((w) => tr(w, 'bbi7').pose === 'bridge' && tr(w, 'bbi7').into > 0.35, 'wait for the bridge to be whole'), { hold: '', ticks: 18, note: 'a look to be sure' }, { hold: 'R', until: done, max: 900 }], cause: 'bbi-thrown' },
  'BBI-06': { steps: [{ hold: 'R', until: X(6.8), max: 600 }, waitFor((w) => lm(w, 'bbi6').bridge, 'the motif lines up: go'), { hold: 'R', until: done, max: 600 }], cause: 'bbi-shuttle' },
  'BBI-05': { steps: [], cause: 'bbi-sila' },
  'BBI-04': { steps: [passTorch(9, r4on, 'keep moving, as learnt'), { hold: 'R', until: X(15.6), max: 400 }, { hold: 'R', jump: 15, ticks: 15, note: 'and jump the trough' }, { hold: 'R', until: done, max: 600 }], cause: 'bbi-kunda' },
  'BBI-03': { steps: [{ hold: 'R', until: X(3.4), max: 600 }, waitFor((w) => p3(w, 0).open(w), 'wait for the customer'), leap((w) => (w.flags.bbi3p as { rig: { x: number } }[])[0].rig.x + 9, 'land on the near side of the silk'), { hold: '', until: done, max: 900, note: 'stand where you landed' }], cause: 'bbi-silk' },
  'BBI-02': { steps: [...board02(), onPad(4, 12), { hold: '', until: (w) => k2(w).ball === 'rebound', max: 900 }, { hold: 'R', until: done, max: 900, note: 'off the moment he lands, and on' }], cause: 'bbi-rebound' },
  'BBI-01': { steps: [...pastG1(), ...tourTail().slice(0, 18), ...hop(72.2, 'jump the drain at its lip, as before'), { hold: 'R', until: done, max: 900 }], cause: 'bbi-nala' },
};
const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {
  'BBI-05': [{ what: 'climb on the cart and ride it', steps: [...room05(), ...act05a(32), { hold: 'R', until: X(58 + 6.9), max: 400 }, { hold: 'R', jump: 8, ticks: 8, note: 'up on the cart' }, { hold: '', until: done, max: 900 }], cause: 'bbi-gadi' }],
  'BBI-04': [{ what: 'stop and wait for the torch, then go', steps: [{ hold: 'R', until: X(6.4), max: 300 }, { hold: '', until: (w) => !r4on(w, 0) && (w.tick - t0of(w, 'bbi4r')) / 120 > 1.0, max: 600 }, { hold: 'R', until: done, max: 600 }], cause: 'bbi-jhala' }],
  'BBI-03': [{ what: 'wait on the third parasol’s cut-out', steps: [...room03().slice(0, 7), stayOn(cut3(2), done, 'wait for the next customer', 1500)], cause: 'bbi-peeled' }],
  'BBI-01': [{ what: 'keep walking past him while he faces the road, as Tara says', steps: [...tourHead(), { hold: '', until: (w) => g1Road(w), max: 900, note: 'he turns to the road' }, { hold: 'R', until: done, max: 900 }], cause: 'bbi-nala' }],
};
let fm: { w: World | null; m: Mem } = { w: null, m: { hold: 0 } };
const fixMem = (w: World) => {
  if (fm.w !== w) fm = { w, m: { hold: 0 } };
  if (fm.m.hold > 0) fm.m.hold--;
  return fm.m;
};
/** the palm leaves: wait at the bank for the soot, then the written leaves only, jumping the blank ones */
const soot = (w: World, k = 'bbi5p') => (w.flags[k] as { soot: number }).soot;
const patraRun = (x: number, k = 'bbi5p'): Step[] => [
  { hold: 'R', until: X(x + 2.6), max: 400 },
  { hold: '', until: (w) => soot(w, k) >= 6, max: 1500, note: 'wait for the soot' },
  leap(() => px(x + 5), 'leaf 1, written'),
  leap(() => px(x + 9), 'over the blank to leaf 3'),
  leap(() => px(x + 11), 'leaf 4'),
  leap(() => px(x + 15), 'over the blank to leaf 6'),
  { hold: 'R', until: X(x + 20.5), max: 300 },
];
/** the painted panels: across the first pit, then over the rotten middle plank of the second */
const pattaRun = (x: number): Step[] => [
  { hold: 'R', until: X(x + 10.6), max: 600 },
  leap(() => px(x + 14), 'plank 1'),
  leap(() => px(x + 18), 'over the rotten middle to plank 3'),
  { hold: 'R', until: X(x + 20.5), max: 300 },
];
/** bagudi: be tagged, back over the chalk line to pass it on, then through the boys */
const bg = (w: World, k = 'bbi7bg') => w.flags[k] as { it: boolean; out: boolean };
const bagudiRun = (x: number): Step[] => [
  { hold: 'R', until: (w) => bg(w).it, max: 1200, note: 'let him tag you' },
  { hold: 'L', until: (w) => bg(w).out, max: 600, note: 'back over the line' },
  { hold: 'R', until: X(x + 23.5), max: 900 },
];
/** the goat: up on the straw, wait until it has crossed the pounder back to this side, then jump */
const goat = (w: World, k = 'bbi5ch') => w.flags[k] as { x: number; dir: number; up: boolean };
const chheliRun = (x: number): Step[] => [
  { hold: '', until: ground, max: 300, note: 'down off the wall' },
  ...hop(x + 4.1, 'up on the straw', 15),
  { hold: 'R', until: X(x + 6.9), max: 300 },
  { hold: '', until: (w) => goat(w).dir < 0 && !goat(w).up && goat(w).x < px(x + 8), max: 2400, note: 'the goat back on this side' },
  { hold: 'R', jump: 15, ticks: 15, note: 'jump the pit from the straw' },
  { hold: 'R', until: ground, max: 300 },
  { hold: 'R', until: X(x + 25), max: 600 },
];
/** the drain: on to a badi just dropped in, ride it to the hole, up on to the far rim at the last moment */
const dr = (w: World) => w.flags.bbi8dr as { s: number[]; badis: { x: number }[] };
const fresh = (w: World) => { const d = dr(w); const k = d.s.findIndex((v) => v > 0.2 && v < 1.4); return k; };
const ridden = { k: 0 };
const bhanwarRun = (x: number): Step[] => [
  ...hop(x + 1.4, 'up on the rim'),
  { hold: '', until: ground, max: 300 },
  { hold: '', until: (w) => { const k = fresh(w); if (k >= 0) ridden.k = k; return k >= 0; }, max: 1500, note: 'a badi just dropped in' },
  leap((w) => dr(w).badis[ridden.k].x + 13, 'down on to it', () => true, 5),
  stayOn((w) => dr(w).badis[ridden.k].x + 13, (w) => dr(w).badis[ridden.k].x + 13 > px(x + 14) - 8, 'ride it to the hole', 1500),
  { hold: 'R', jump: 15, ticks: 15, note: 'up on to the far rim at the last moment' },
  { hold: 'R', until: ground, max: 300 },
  { hold: 'R', until: X(x + 21.5), max: 400 },
];
/** the falling tower: wait by the scuffs, go the moment it lands, all the way over */
const pd = (w: World, k = 'bbi7pd') => w.flags[k] as { phase: string };
const padaRun = (x: number): Step[] => [
  { hold: 'R', until: X(x + 4.2), max: 400 },
  { hold: '', until: (w) => pd(w).phase === 'lie', max: 1500, note: 'back from the edge until it lands' },
  { hold: 'R', until: X(x + 17.5), max: 400 },
];
/** the undyed thread: the shuttle by, then out on the motif and over the hole */
/** the plain thread: jump up into it on the bank, then walk the motif as soon as it lines up */
/** the shuttle that runs: let it jump away, back off a step, and jump on as it comes back over the pit */
const pl6 = (w: World) => w.flags.bbi6pl as { phase: string; x: number; box: { x: number } };
const palaaRun = (x: number): Step[] => [
  { hold: 'R', until: X(x + 2.4), max: 400, note: 'near it: it jumps away' },
  waitFor((w) => pl6(w).phase === 'back' && pl6(w).x <= px(x + 4) + 24, 'it comes back: two tiles out'),
  leap((w) => pl6(w).box.x + 16, 'on to it, where it is now'),
  stayOn((w) => pl6(w).box.x + 16, (w) => pl6(w).phase === 'fly' && pl6(w).x > px(x + 14), 'ride it back and across', 900),
  { hold: 'R', until: and(ground, X(x + 17.5)), max: 400, note: 'off on to the far bank' },
  { hold: 'R', until: X(x + 20.5), max: 300 },
];
const gr10 = (w: World) => w.flags.bbi10gr as { t0: number; rigs: { x: number }[]; u: number[]; du: number[] };
/** the finale's stir: hop as a badi swings in towards the middle of its swing, so it is slow when you land */
const inward = (w: World) => { const g = gr10(w); return g.t0 >= 0 && ((g.du[0] > 0 && g.u[0] > -0.5 && g.u[0] < -0.3) || (g.du[0] < 0 && g.u[0] < 0.5 && g.u[0] > 0.3)); };
const ghurni10Run = (x: number): Step[] => [
  { hold: 'R', until: X(x + 2.6), max: 400, note: 'to the rim' },
  waitFor((w) => inward(w) && gr10(w).du[0] > 0, 'A swings in towards its middle'),
  leap((w) => gr10(w).rigs[0].x + 13, 'on to A in the middle'),
  { hold: '', ticks: 30 },
  stayOn((w) => gr10(w).rigs[0].x + 13, inward, 'ride A until it swings in again', 600),
  leap((w) => gr10(w).rigs[1].x + 13, 'across to B, in its middle too'),
  { hold: '', ticks: 30 },
  stayOn((w) => gr10(w).rigs[1].x + 13, inward, 'ride B until it swings in again', 600),
  leap(() => px(x + 14.6), 'off to the far rim'),
  { hold: 'R', until: X(x + 16.5), max: 300 },
];
const pl10 = (w: World) => w.flags.bbi10pl as { phase: string; x: number; box: { x: number } };
/** the finale's shuttle: straight on to it, ride it across */
const palaa10Run = (x: number): Step[] => [
  { hold: 'R', until: X(x + 2.4), max: 400 },
  leap((w) => pl10(w).box.x + 16, 'straight on to it'),
  stayOn((w) => pl10(w).box.x + 16, (w) => pl10(w).phase === 'done', 'it flies you across', 900),
  { hold: 'R', until: and(ground, X(x + 17.5)), max: 400 },
  { hold: 'R', until: X(x + 20.5), max: 300 },
];
const tantuRun = (x: number): Step[] => [
  { hold: 'R', until: X(x + 2.6), max: 400, note: 'under the plain thread' },
  { hold: '', until: (w) => Math.abs(w.player.vx) < 5, max: 120 },
  { hold: '', jump: 12, ticks: 40, note: 'up into it: it snaps' },
  { hold: 'R', until: X(x + 3.6), max: 300, note: 'to the edge' },
  waitFor((w) => lm(w, 'bbi6p').bridge && lm(w, 'bbi6p').into > 0.08, 'the motif: no shuttle, no beater'),
  { hold: 'R', until: and(ground, X(x + 14.4)), max: 400, note: 'across' },
  { hold: 'R', until: X(x + 17.5), max: 300 },
];
/** the server: on to the first badi the moment it lands, ride it over, off on to the far bank */
const ph = (w: World) => w.flags.bbi8ph as { t0: number; floats: { x: number }[] };
/** the stir: on at A's near edge, across to B where they meet edge to edge, off at B's far edge */
const gh = (w: World) => w.flags.bbi8gh as { t0: number; rigs: { x: number }[]; th: number[] };
const ghurniRun = (x: number): Step[] => [
  { hold: 'R', until: X(x + 3.0), max: 400, note: 'to the rim' },
  waitFor((w) => gh(w).t0 >= 0 && Math.cos(gh(w).th[0]) < -0.97, 'A at its slow near edge'),
  leap((w) => gh(w).rigs[0].x + 13, 'on to A'),
  stayOn((w) => gh(w).rigs[0].x + 13, (w) => Math.cos(gh(w).th[0]) > 0.97, 'ride A to its far edge', 600),
  leap((w) => gh(w).rigs[1].x + 13, 'across to B, slow too'),
  stayOn((w) => gh(w).rigs[1].x + 13, (w) => Math.cos(gh(w).th[1]) < -0.97, 'ride B to its far edge', 600),
  leap(() => px(x + 21.5), 'off on to the far rim'),
  { hold: 'R', until: X(x + 23.5), max: 300 },
];
/** pothi: hop each hinge from end to end, wait on the top end for the troupe's stop, then down and over */
const pothiRun = (x: number): Step[] => [
  { hold: 'R', until: X(x + 3.6), max: 400, note: 'on to the first leaf end' },
  ...[0, 1, 2, 3].flatMap((k) => hop(x + 4 + 5 * k + 0.7, `over hinge ${k + 1}`)),
  { hold: '', until: (w) => Math.abs(w.player.vx) < 5, max: 200, note: 'on the top end' },
  waitFor((w) => tr(w, 'bbi7po0').pose === 'bridge' && tr(w, 'bbi7po0').into < 0.4, 'the troupe stops', 2400),
  { hold: 'R', until: and(ground, X(x + 32.4)), max: 400, note: 'down and over' },
  { hold: 'R', until: X(x + 35.5), max: 300 },
];
/** kachha: let the tucked troupe's first stop go, cross on its second; the loose one at once */
const kachhaRun = (x: number): Step[] => [
  { hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 4) - 2, max: 900, note: 'to the first pit' },
  waitFor((w) => tr(w, 'bbi7kc0').pose === 'bridge', 'the tucked line lies down: it rolls', 2400),
  waitFor((w) => tr(w, 'bbi7kc0').pose === null, 'the drum again: pleats down now', 2400),
  waitFor((w) => tr(w, 'bbi7kc0').pose === 'bridge', 'this stop it lies still', 2400),
  { hold: 'R', until: and(ground, X(x + 11.2)), max: 400, note: 'over' },
  { hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 19) - 2, max: 900, note: 'to the second pit' },
  waitFor((w) => tr(w, 'bbi7kc1').pose === 'bridge', 'loose skirts: go at once', 2400),
  { hold: 'R', until: and(ground, X(x + 26.2)), max: 400, note: 'over' },
  { hold: 'R', until: X(x + 28.5), max: 300 },
];
/** the ghungur: in the dark, jump each ringing spot (7, 12, 17), walk the quiet floor between */
const ghungurRun = (x: number): Step[] => [...hop(x + 4.6, 'over the bells at 7'), ...hop(x + 10.6, 'over the bells at 13'), ...hop(x + 16.6, 'over the bells at 19'), { hold: 'R', until: X(x + 25.5), max: 300 }];
/** the finale's chariot: on to the hub that rides the stone, then up on to the still rim before the slam */
const chakraRun = (x: number): Step[] => [
  ...hop(x + 1.4, 'up on the plinth'),
  { hold: 'R', until: X(x + 8 - 1.3), max: 400 },
  { hold: 'R', jump: 11, ticks: 11, note: 'up on the horses' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', until: ground, max: 200 },
  { hold: '', until: (w) => chOf(w, 'bbi10ck').started >= 0, max: 300, note: 'it moves' },
  hubJump((w) => chOf(w, 'bbi10ck'), false),
  stayOn((w) => chOf(w, 'bbi10ck').hub.x + 20, (w) => chOf(w, 'bbi10ck').hub.x >= px(x + 13.5), 'ride the hub under the rim', 600),
  { steer: (w) => { const d = px(x + 14) + 20 - w.player.cx; return d > 4 ? 'R' : d < -4 ? 'L' : ''; }, jump: 14, ticks: 50, note: 'up on to the still rim' },
  stayOn(() => px(x + 14) + 20, (w) => chOf(w, 'bbi10ck').stopped, 'the stone slams under the rim'),
  leap(() => px(x + 19.5), 'up on to the wall'),
  { hold: 'R', until: and(ground, X(x + 23.2)), max: 400 },
];
const ph10 = (w: World) => w.flags.bbi10ph as { t0: number; floats: { x: number }[] };
/** the finale's server: wait back while he throws hard, then ride the first soft one (the fourth) */
const phinga10Run = (x: number): Step[] => [
  { hold: 'R', until: X(x + 1.3), max: 400, note: 'well back from the rim' },
  waitFor((w) => ph10(w).t0 >= 0 && (w.tick - ph10(w).t0) / 120 > 3.6 + 0.6, 'the fourth lands soft'),
  { hold: 'R', until: X(x + 2.6), max: 200 },
  leap((w) => ph10(w).floats[3].x + 13, 'on to it'),
  stayOn((w) => ph10(w).floats[3].x + 13, (w) => ph10(w).floats[3].x >= px(x + 14) - 26 - 0.5, 'ride it over', 900),
  { hold: 'R', until: and(ground, X(x + 15)), max: 300 },
  { hold: 'R', until: X(x + 19.5), max: 300 },
];
/** the finale's loom: snap the first coloured thread as the motif lines up, land on the rest and walk it */
const tantu10Run = (x: number): Step[] => [
  { hold: 'R', until: X(x + 3.6), max: 400, note: 'to the edge' },
  waitFor((w) => lm(w, 'bbi10tn').bridge, 'the motif'),
  { hold: 'R', jump: 12, ticks: 12, note: 'up into the first coloured thread' },
  { hold: 'R', until: and(ground, X(x + 14.4)), max: 400, note: 'on over the rest' },
  { hold: 'R', until: X(x + 17.5), max: 300 },
];
/** the finale's ghungur: jump the quiet spots (9.5, 14.5), walk under the bells */
const ghungur10Run = (x: number): Step[] => [...hop(x + 7.6, 'over the quiet spot'), ...hop(x + 13.6, 'over the quiet spot'), { hold: 'R', until: X(x + 25.5), max: 300 }];
const phingaRun = (x: number): Step[] => [
  { hold: 'R', until: X(x + 2.6), max: 400, note: 'to the rim' },
  waitFor((w) => ph(w).t0 >= 0 && (w.tick - ph(w).t0) / 120 > 0.9 + 0.6, 'the first lands soft'),
  leap((w) => ph(w).floats[0].x + 13, 'on to it'),
  stayOn((w) => ph(w).floats[0].x + 13, (w) => ph(w).floats[0].x >= px(x + 14) - 26 - 0.5, 'ride it over', 900),
  { hold: 'R', until: and(ground, X(x + 15)), max: 300, note: 'off on to the bank' },
  { hold: 'R', until: X(x + 19.5), max: 300 },
];
const sutraRun = (x: number): Step[] => [
  { hold: 'R', until: X(x + 2.1), max: 300 },
  waitFor((w) => lm(w, 'bbi6z').bridge && lm(w, 'bbi6z').into > 0.6, 'the motif beat, the shuttle by'),
  { hold: 'R', until: X(x + 5.6), max: 300 },
  { hold: 'R', jump: 10, ticks: 10, note: 'hop the undyed thread' },
  { hold: 'R', until: and(ground, X(x + 12.4)), max: 400 },
  { hold: 'R', until: X(x + 16.5), max: 300 },
];
/** the plug: on to your badi, across to the other before yours reaches the hole, then up on to the far rim */
const pl = (w: World) => w.flags.bbi8pl as { plugged: boolean; bx: number[] };
const datiRun = (x: number): Step[] => [
  ...hop(x + 1.4, 'up on the rim'),
  { hold: '', until: ground, max: 300 },
  leap((w) => pl(w).bx[0] + 13, 'down on to your badi', () => true, 5),
  stayOn((w) => pl(w).bx[0] + 13, (w) => pl(w).bx[1] - pl(w).bx[0] < 64, 'drift until the other is close', 1500),
  leap((w) => pl(w).bx[1] + 8, 'across to the other badi', () => true, 5),
  stayOn((w) => pl(w).bx[1] + 13, (w) => pl(w).plugged, 'yours goes down the hole and plugs it', 1500),
  stayOn((w) => pl(w).bx[1] + 22, (w) => w.player.cx >= pl(w).bx[1] + 15, 'to its far edge', 300),
  { hold: 'R', jump: 15, ticks: 15, note: 'up on to the far rim' },
  { hold: 'R', until: ground, max: 300 },
  { hold: 'R', until: X(x + 19.5), max: 400 },
];
/** the well sweep: wait at the plate until the stone is at its top, step on, walk under */
const th = (w: World, k = 'bbi5th') => w.flags[k] as { y: number; frozen: number };
const thakaRun = (x: number): Step[] => [
  { hold: 'R', until: X(x + 2.6), max: 400 },
  { hold: '', until: (w) => th(w).y < 240 - 28.5, max: 900, note: 'the stone near its top' },
  { hold: 'R', until: (w) => th(w).frozen >= 0, max: 200, note: 'on to the plate: it stops' },
  { hold: 'R', until: X(x + 19.5), max: 400 },
];
/** the belt: jump up into it on its pulley, then the mill's far half flings you over */
const gn = (w: World) => w.flags.bbi5gn as { belt: boolean };
const gannaRun = (x: number): Step[] => [
  { hold: 'R', until: X(x + 0.05), max: 300 },
  { hold: '', jump: 10, until: (w) => !gn(w).belt, max: 200, note: 'straight up into the belt' },
  { hold: '', until: (w) => w.player.onGround && w.player.vy >= 0, max: 200 },
  { hold: '', ticks: 6 },
  { hold: 'R', until: X(x + 1.0), max: 200 },
  { hold: 'R', jump: 9, ticks: 9, note: 'hop on to the mill' },
  stayOn(() => px(x + 4) + 12, (w) => (w.flags.bbi5gm as { started: number }).started >= 0 && w.player.onGround && w.player.cx > px(x + 4) + 4, 'on its far half: it starts', 400),
  { hold: '', until: (w) => w.player.onGround && w.player.x > px(x + 13), max: 400, note: 'flung over the channel' },
  { hold: 'R', until: X(x + 21.5), max: 400 },
];
/** the uncle: on to the little grinder (he comes for it), off, then the water lift while he grumbles there */
const mamaRun = (x: number): Step[] => [
  { hold: 'R', until: (w) => (w.flags.bbi5ma as { decoy: boolean }).decoy, max: 400, note: 'over the grinder’s treadle: it starts' },
  ...tendaRun('bbi5mm', 5)(x + 8).slice(0, -1),
  { hold: 'R', until: X(x + 25.5), max: 300 },
];
/** the finale's stair: wait on the bank until all eight spokes are up, then straight up them */
const u10 = (w: World) => w.flags.bbi10u as { prog: number };
const udaya10Run = (x: number): Step[] => {
  const out: Step[] = [{ hold: 'R', until: X(x + 1.4), max: 300 }, waitFor((w) => u10(w).prog > 0.55 * 8 + 0.35, 'the whole stair up', 1500)];
  for (let k = 0; k < 8; k++) out.push(leap(() => px(x + 3 + 2.5 * k) + 14, `spoke ${k + 1}`, () => true, 8));
  out.push(leap(() => px(x + 26), 'on to the terrace'), { hold: 'R', until: and(ground, X(x + 27.4)), max: 300 });
  return out;
};
/** the finale's goat: up on the straw, jump while it grazes on the far side, off the beam */
const chheli10Run = (x: number): Step[] => [
  { hold: '', until: ground, max: 300 },
  ...hop(x + 4.1, 'up on the straw', 15),
  { hold: 'R', until: X(x + 6.9), max: 300 },
  { hold: '', until: (w) => goat(w, 'bbi10ch').dir > 0 && !goat(w, 'bbi10ch').up && goat(w, 'bbi10ch').x > px(x + 12.5), max: 2400, note: 'the goat away on the far side' },
  { hold: 'R', jump: 15, ticks: 15, note: 'jump the pit from the straw' },
  { hold: 'R', until: ground, max: 300 },
  { hold: 'R', until: X(x + 25), max: 600 },
];
/** the honest painter: over the first pit's rotten middle, then on to the second pit's only good plank */
const patta10Run = (x: number): Step[] => [
  { hold: 'R', until: X(x + 2.6), max: 600 },
  leap(() => px(x + 4), 'plank 1'),
  leap(() => px(x + 8), 'over the rotten middle to plank 3'),
  { hold: 'R', until: X(x + 10.6), max: 300 },
  leap(() => px(x + 16), 'the middle plank, the one its panel paints'),
  leap(() => px(x + 20), 'over the last to the bank'),
  { hold: 'R', until: X(x + 21.5), max: 300 },
];
/** the finale's sweep: stop it low, hop on to the stone and walk across it */
const thaka10Run = (x: number): Step[] => [
  { hold: 'R', until: X(x + 2.6), max: 400 },
  { hold: '', until: (w) => th(w, 'bbi10th').y > 240 - 15.2, max: 900, note: 'the stone near its bottom' },
  { hold: 'R', until: (w) => th(w, 'bbi10th').frozen >= 0, max: 200, note: 'on to the plate: it stops low' },
  { hold: 'R', until: X(x + 5.8), max: 300 },
  { hold: 'R', jump: 8, ticks: 8, note: 'up on the stone' },
  { hold: 'R', until: X(x + 19.5), max: 600 },
];
/** jodi: pit 1 go as the near half lands; pit 2 on to the near half the moment it lands */
const jodiRun = (x: number): Step[] => [
  { hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 4) - 2, max: 900, note: 'to the first pit' },
  waitFor((w) => tr(w, 'bbi7jd1n').pose === 'bridge', 'the near half lands (the far one is older)', 2400),
  { hold: 'R', until: and(ground, X(x + 14.2)), max: 400, note: 'straight over both halves' },
  { hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 18) - 2, max: 900, note: 'to the second pit' },
  waitFor((w) => tr(w, 'bbi7jd2n').pose === 'bridge', 'the near half lands first: on to it', 2400),
  { hold: 'R', until: and(ground, X(x + 28.2)), max: 400, note: 'walk it; the far half lands under you' },
  { hold: 'R', until: X(x + 31.5), max: 300 },
];
/** gadiba: let the rolling stop go by at the edge, cross on the still one */
const gd = (w: World) => w.flags.bbi7gd0 as { pose: string | null; into: number; stops: number };
const gadibaRun = (x: number): Step[] => [
  { hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 4) - 2, max: 900, note: 'to the edge' },
  waitFor((w) => gd(w).pose === 'bridge' && gd(w).stops % 2 === 0 && gd(w).into < 0.2, 'the stop without a roll', 2400),
  { hold: 'R', until: and(ground, X(x + 15.4)), max: 400, note: 'straight over' },
  { hold: 'R', until: X(x + 18.5), max: 300 },
];
/** hulahuli: let the silent stops go by; go at once on the cheered one */
const hh = (w: World) => w.flags.bbi7hh as { pose: string | null; into: number; stops: number };
const hulaCheer = (w: World) => hh(w).pose === 'bridge' && ((hh(w).stops - 1) % 3 + 3) % 3 === 2;
const hulaRun = (x: number): Step[] => [
  { hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 4) - 2, max: 900, note: 'to the edge' },
  waitFor((w) => hulaCheer(w) && hh(w).into < 0.2, 'a cheered stop', 2400),
  { hold: 'R', until: and(ground, X(x + 12.4)), max: 400, note: 'straight over while they cheer' },
  { hold: 'R', until: X(x + 15.5), max: 300 },
];
/** sajaghara: inside the tent while the drum plays, out of the flap at the stop and over */
const sj = (w: World) => w.flags.bbi7sj as { pose: string | null; into: number };
const sajaRun = (x: number): Step[] => [
  { hold: 'R', until: X(x + 2.2), max: 400, note: 'into the tent' },
  waitFor((w) => sj(w).pose === null, 'while they dance', 2400),
  waitFor((w) => sj(w).pose === 'bridge', 'the stop: out of the flap', 2400),
  { hold: 'R', until: and(ground, X(x + 14.4)), max: 400, note: 'under their leap and over' },
  { hold: 'R', until: X(x + 17.5), max: 300 },
];
const actRoutes: Record<string, (x: number) => Step[]> = { 'bbi07-sajaghara': sajaRun, 'bbi07-hulahuli': hulaRun, 'bbi07-gadiba': gadibaRun, 'bbi07-jodi': jodiRun, 'bbi10-thaka': thaka10Run, 'bbi10-patta': patta10Run, 'bbi10-chheli': chheli10Run, 'bbi10-udaya': udaya10Run, 'bbi05-mama': mamaRun, 'bbi05-ganna': gannaRun, 'bbi10-bagudi': (x) => [{ hold: 'R', until: (w) => bg(w, 'bbi10bg').it, max: 1200, note: 'let him tag you' }, { hold: 'R', until: X(x + 23.5), max: 900, note: 'straight through' }], 'bbi10-pada': (x) => [{ hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 7) - 3, max: 400 }, { hold: '', until: (w) => pd(w, 'bbi10pd').phase === 'lie', max: 1500, note: 'at the edge until it is down' }, { hold: 'R', until: X(x + 17.5), max: 400 }], 'bbi10-dui-baja': (x) => [...crossTroupe('bbi10db0', x, 4, 7, 'bridge'), { hold: 'R', until: X(x + 14.5), max: 300 }], 'bbi05-thaka': thakaRun, 'bbi08-dati': datiRun, 'bbi10-patra': (x) => patraRun(x, 'bbi10pt'), 'bbi10-deepa': (x) => [...crossTroupe('bbi10d', x, 4, 8, 'wheel'), { hold: 'R', until: X(x + 15.5), max: 300 }], 'bbi06-sutra': sutraRun, 'bbi07-dui-baja': (x) => [...crossTroupe('bbi7db0', x, 4, 7, 'bridge'), { hold: 'R', until: X(x + 14.5), max: 300 }], 'bbi07-pada': padaRun, 'bbi08-bhanwar': bhanwarRun, 'bbi05-chheli': chheliRun, 'bbi07-bagudi': bagudiRun, 'bbi06-patta': pattaRun, 'bbi05-patra': (x) => patraRun(x), 'bbi02-corner': act02, 'bbi03-gali': act03, 'bbi04-karkhana': act04, 'bbi05-dhenki': act05a, 'bbi05-gadi': act05b, 'bbi06-tana': act06, 'bbi07-mardala': act07a, 'bbi07-bandha': act07b, 'bbi09-ara': act09, 'bbi10-chhata': act10a, 'bbi10-tana': act10b, 'bbi02-dive': act02b, 'bbi09-ratha': act09b, 'bbi05-khala': act05c, 'bbi03-mela': act03b,
  'bbi07-deepa': (x) => [...crossTroupe('bbi7l', x, 4, 8, 'bridge'), { hold: 'R', until: X(x + 15.5), max: 300 }],
  'bbi06-sidhi': sidhiRun('bbi6s'),
  'bbi06-rachh': loomRun('bbi6q', 8, 0.5),
  'bbi06-tantu': tantuRun,
  'bbi06-palaa': palaaRun,
  'bbi10-palaa': palaa10Run,
  'bbi10-ghurni': ghurni10Run,
  'bbi08-phinga': phingaRun,
  'bbi08-ghurni': ghurniRun,
  'bbi07-ghungur': ghungurRun,
  'bbi07-kachha': kachhaRun,
  'bbi07-pothi': pothiRun,
  'bbi10-ghungur': ghungur10Run,
  'bbi10-chakra': chakraRun,
  'bbi10-phinga': phinga10Run,
  'bbi10-tantu': tantu10Run,
  'bbi09-ulta': chAct('bbi9u', 9, 8),
  'bbi09-udaya': (x) => {
    const out: Step[] = [{ hold: 'R', until: X(x + 1.4), max: 300 }];
    for (let k = 0; k < 10; k++) out.push(waitFor((w) => (w.flags.bbi9r.stood[k - 1] ?? w.flags.bbi9r.stood[-1] ?? 1e9) + 1.35 * 120 <= w.tick, `wait till spoke ${k + 1} is up`), leap(() => px(x + 3 + 2.5 * k) + 14, `spoke ${k + 1}`, () => true, 8));
    out.push(leap(() => px(x + 31), 'on to the terrace'), { hold: 'R', until: and(ground, X(x + 37.4)), max: 400, note: 'run the bare terrace' });
    return out;
  },
  'bbi05-chakki': (x) => [
    { hold: 'R', until: X(x + 1.4), max: 400 },
    leap(() => px(x + 4) + 8, 'on to the far half of the mill', () => true, 5),
    { hold: '', until: (w) => (w.flags.bbi5f as { started: number }).started >= 0, max: 200, note: 'on its far half: it starts' },
    { hold: '', until: (w) => w.player.onGround && w.player.x > px(x + 13), max: 400, note: 'flung over the channel' },
    { hold: 'R', until: X(x + 17.5), max: 300 },
  ],
  'bbi05-bail': bailRun('bbi5b', 14),
  'bbi02-chhal': (x) => {
    const st = (w: World) => w.flags.bbi2h as { k: number; x: number; phase: string };
    return [
      { hold: 'R', until: X(x + 7), max: 400 },
      { hold: '', until: (w) => st(w).phase === 'dummy' && st(w).x > 0 && st(w).x - (w.player.x + w.player.w) < 30, max: 600, note: 'the dummy rolls at you' },
      { hold: '', jump: 12, ticks: 12, note: 'hop it' },
      { hold: '', until: ground, max: 200 },
      { hold: '', until: (w) => st(w).k >= 1 && st(w).phase === 'stop', max: 900, note: 'the next corner: he stops it' },
      ...hop(x + 11.9, 'over the still ball'),
      { hold: 'R', until: X(x + 29), max: 600 },
    ];
  },
};
// acts that start with plain ground (LEAD in levels.ts): the same route, from their shifted first column
for (const [k, L] of Object.entries(LEAD)) {
  const r = actRoutes[k];
  if (r) actRoutes[k] = (x) => r(x + L);
}
const endingPolicies: Record<string, Policy> = { 'bbi-turf-roll': goalPolicy, 'bbi-lantern-drop': lanternPolicy, 'bbi-curl-stair': curlStair, 'bbi-behind-step': behindStep, 'bbi-tanti-ghara': walkIn, 'bbi-sajaghara-door': walkIn, 'bbi-rosei-ghara': walkIn, 'bbi-horse-gap': horseGap, 'bbi-stadium-gate': walkIn };
void and;

export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  fair: ['BBI-01', 'BBI-02', 'BBI-03', 'BBI-04', 'BBI-05', 'BBI-06', 'BBI-07', 'BBI-08', 'BBI-09', 'BBI-10'],
};
