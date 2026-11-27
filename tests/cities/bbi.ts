// Proven routes for Bhubaneswar: every stage's room, its acts and its door, plus the plays that must die.
// Found by tests/city-tests.ts; merged into SOLUTIONS, NAIVE, FIX, MISTAKES, ACT_ROUTES and ENDING_POLICIES.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import { Step, X, and, ground, done } from '../runner';
import type { CityTests } from '../city-tests';
import { g1Road } from '../../src/game/cities/bbi/s01';
import { RAJA4, RAJA5, type RajaPiece } from '../../src/game/cities/bbi/s05';

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
const tourTail = (): Step[] => [
  ...hop(38.7, 'a step up'),
  ...hop(40.7, 'a step up'),
  ...hop(50.6, 'a post'),
  ...hop(53.6, 'a post'),
  ...hop(56.6, 'a post'),
  ...hop(70.2, 'jump from the tile before the wet one'),
  { hold: 'R', until: X(82), max: 600 },
  { hold: 'R', jump: 14, ticks: 14, note: 'hop the parked cart' },
  { hold: 'R', until: ground, max: 300 },
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
const goalPolicy: Policy = (w, m) => {
  const st = w.flags.bbi2e as { scored: boolean };
  const p = w.player;
  const D = Math.round((w.entities.find((e: any) => e.constructor?.name === 'Door' && !e.fake) as any).x / 16);
  const b0 = (D - 6) * 16;
  if (st.scored) return go('R');
  if (p.onGround && p.y + p.h <= 211) return go(p.cx < b0 + 10 ? 'R' : p.cx > b0 + 22 ? 'L' : '');
  if (p.onGround && p.x + p.w >= b0 - 14 && p.cx < b0 + 16) {
    m.hold = 12;
    return { move: 'R', jump: true };
  }
  return go(p.cx < b0 + 16 ? 'R' : '');
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
const motifPolicy: Policy = (w) => {
  const st = w.flags.bbi6e as { open: boolean };
  const d = w.entities.find((e: any) => e.constructor?.name === 'Door' && !e.fake) as any;
  const D = Math.round(d.x / 16);
  const p = w.player;
  if (p.x >= px(D - 3) - 2 && p.x < px(D)) return go('R');
  if (st.open) return go('R');
  return go(p.x + p.w < px(D - 3) - 6 ? 'R' : '');
};

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
const gatePolicy: Policy = (w) => {
  const st = tr(w, 'bbi7e');
  const d = w.entities.find((e: any) => e.constructor?.name === 'Door' && !e.fake) as any;
  const D = Math.round(d.x / 16);
  const p = w.player;
  if (p.x + p.w >= px(D - 3) - 1) return go('R');
  if (st.pose === 'gate' && st.left > 0.9) return go('R');
  return go(p.x + p.w < px(D - 3) - 8 ? 'R' : '');
};

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
const act08 = (x: number): Step[] => [...rideBowl('bbi8b', x + 3, x + 16.5, 0, (w) => bw(w, 'bbi8b').t > 4.0 && bw(w, 'bbi8b').badis[0].x >= px(x + 16) - 26 - 4 - 34 - 0.5), { hold: 'R', until: X(x + 21.5), max: 400 }];
const platePolicy: Policy = (w) => {
  const d = w.entities.find((e: any) => e.constructor?.name === 'Door' && !e.fake) as any;
  const D = Math.round(d.x / 16);
  const p = w.player;
  const plate = w.flags.bbi8e as { t0: number; flipped: boolean };
  const pl = (w.entities as any[]).find((e) => e.constructor?.name === 'Rig' && e.w === 30 && e.h === 6 && e.y === 236);
  if (p.x >= px(D - 1)) return go('R');
  if (p.onGround && p.y + p.h <= 237 && pl && pl.x + 30 >= px(D - 2) - 20) return { move: 'R', jump: true };
  if (!p.onGround) return go('R');
  if (p.y + p.h <= 237) return go(p.cx < (pl?.x ?? 0) + 15 ? 'R' : '');
  if (p.x + p.w < px(D - 8) - 2) return go('R');
  if (pl && plate.t0 >= 0 && p.cx < pl.x + 4) return { move: 'R', jump: false };
  return go('R');
};

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
  waitFor((w) => p10(w, 0).open(w), 'the first opens'),
  leap6(cut10(0), 'cut-out on the right'),
  stayOn(cut10(0), (w) => p10(w, 1).open(w), 'the second opens'),
  leap6(cut10(1), 'touch his cut-out'),
  stayOn(cut10(1), (w) => p10(w, 2).open(w), 'and the third opens at once'),
  leap6(cut10(2), 'on before he sells the second'),
  stayOn(cut10(2), (w) => p10(w, 3).open(w), 'the fourth'),
  leap6(cut10(3), 'cut-out on the right'),
  leap(() => px(x + 22), 'off on to the bank'),
  { hold: 'R', until: X(x + 23.5), max: 300 },
];
const act10b = (x: number): Step[] => [
  { hold: 'R', until: X(x + 0.9), max: 300 },
  waitFor((w) => lm(w, 'bbi10lm').bridge && lm(w, 'bbi10lm').into > 0.5, 'the motif beat; the shuttle by'),
  { hold: 'R', until: and(ground, X(x + 10.4)), max: 400, note: 'across' },
  ...onBridge('bbi10tr', x + 14, x + 23.2, 'the troupe’s bridge'),
  { hold: 'R', until: X(x + 27.5), max: 400 },
];
const ribbonPolicy: Policy = (w) => {
  const st = w.flags.bbi10e as { t0: number };
  const d = w.entities.find((e: any) => e.constructor?.name === 'Door' && !e.fake) as any;
  const D = Math.round(d.x / 16);
  const p = w.player;
  if (p.x >= px(D - 3) - 2) return go('R');
  if (st.t0 < 0) return go('R');
  const t = ((((w.tick - st.t0) / 120 + 0.4) % 2.2) + 2.2) % 2.2;
  if (t > 0.55 && t < 1.1) return go('R');
  return go(p.x + p.w < px(D - 3) - 6 ? 'R' : '');
};

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
const chAct = (k: string, len: number, slide: number) => (x: number): Step[] => chariotRun(k, x, x + 3 + len - 3, x + 3 + len + slide + 1.5, x + 3 + len + slide + 5.5);
const bowlRun = (k: string, c0: number, c1: number, i: number, t: number) => (x: number): Step[] => [
  ...rideBowl(k, x + c0 - 1, x + c1 + 1.5, i, (w) => bw(w, k).t > t && bw(w, k).badis[i].x >= px(x + c1 + 1) - 26 - 4 - 34 * (bw(w, k).badis.length - 1 - i) - 0.5),
  { hold: 'R', until: X(x + c1 + 6.5), max: 400 },
];

/** Raja's lane: every piece crossed touching nothing */
const rajaRun = (pieces: RajaPiece[], w0: number) => (x: number): Step[] => {
  const out: Step[] = [];
  for (const p of pieces) {
    if (p.k === 'mill') out.push(...hop(x + p.at - 0.8, 'jump the channel over the mill', 14));
    else if (p.k === 'pounder') out.push(...hop(x + p.at - 0.8, 'jump the pounder’s pit', 12));
    else if (p.k === 'cart') out.push({ hold: 'R', until: X(x + p.at - 1.25), max: 600 }, { hold: 'R', jump: 15, ticks: 15, note: 'over the cart, touching nothing' }, { hold: 'R', until: ground, max: 300 });
    else out.push({ hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + p.at + 0.75) - 4, max: 600 }, { hold: 'R', jump: 15, ticks: 15, note: 'from against the stone, up the step' }, { hold: 'R', until: ground, max: 300 }, { hold: 'R', until: and(ground, X(x + p.at + 5.2)), max: 400, note: 'and down' });
  }
  out.push({ hold: 'R', until: X(x + w0 - 0.5), max: 600 });
  return out;
};

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

function solutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  S['BBI-01'] = [...pastG1(), ...tourTail()];
  S['BBI-02'] = room02();
  lengthen('BBI-02', 0, []);
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
    const order: [string, number][] = [['bbi09-ghoda', 24], ['bbi09-udaya', 28], ['bbi09-ratha', 28], ['bbi09-ulta', 26], ['bbi09-surya', 30], ['bbi09-asta', 28], ['bbi09-chakra', 30]];
    let X0 = 32;
    const pre: Step[] = [...room09()];
    for (const [id, wd] of order) {
      pre.push(...actRoutes[id](X0));
      X0 += wd;
    }
    fix['BBI-09'].steps = [...pre, { hold: 'R', until: X(X0 + 1.3), max: 300 }, leap(() => px(X0 + 3) + 14, 'spoke 1'), { hold: '', ticks: 70, note: 'make sure of it' }, leap(() => px(X0 + 5.5) + 14, 'spoke 2'), { hold: '', ticks: 70 }, leap(() => px(X0 + 8) + 14, 'spoke 3'), { hold: '', until: done, max: 400 }];
  }
  fix['BBI-05'].steps = [...S['BBI-05'].slice(0, -1), { policy: (w) => verandahPolicy(w, fixMem(w), null as unknown as Door), until: done, max: 1500, note: 'up to the front door on the verandah' }];
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
  'BBI-01': { steps: [...pastG1(), ...tourTail().slice(0, 15), ...hop(72.2, 'jump the drain at its lip, as before'), { hold: 'R', until: done, max: 900 }], cause: 'bbi-nala' },
};
const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {
  'BBI-05': [{ what: 'climb on the cart and ride it', steps: [...room05(), ...act05a(32), { hold: 'R', until: X(58 + 6.9), max: 400 }, { hold: 'R', jump: 8, ticks: 8, note: 'up on the cart' }, { hold: '', until: done, max: 900 }], cause: 'bbi-gadi' }],
  'BBI-04': [{ what: 'stop and wait for the torch, then go', steps: [{ hold: 'R', until: X(6.4), max: 300 }, { hold: '', until: (w) => !r4on(w, 0) && (w.tick - t0of(w, 'bbi4r')) / 120 > 1.0, max: 600 }, { hold: 'R', until: done, max: 600 }], cause: 'bbi-jhala' }],
  'BBI-03': [{ what: 'wait on the third parasol’s cut-out', steps: [...room03().slice(0, 7), stayOn(cut3(2), done, 'wait for the next customer', 1500)], cause: 'bbi-peeled' }],
  'BBI-01': [{ what: 'stop and wait for the gardener, as Tara says', steps: [...hop(8.6, 'the ditch'), { hold: 'R', until: X(21), max: 600 }, { hold: '', until: done, max: 900 }], cause: 'bbi-nala' }],
};
let fm: { w: World | null; m: Mem } = { w: null, m: { hold: 0 } };
const fixMem = (w: World) => {
  if (fm.w !== w) fm = { w, m: { hold: 0 } };
  if (fm.m.hold > 0) fm.m.hold--;
  return fm.m;
};
const actRoutes: Record<string, (x: number) => Step[]> = { 'bbi02-corner': act02, 'bbi03-gali': act03, 'bbi04-karkhana': act04, 'bbi05-dhenki': act05a, 'bbi05-gadi': act05b, 'bbi06-tana': act06, 'bbi07-mardala': act07a, 'bbi07-bandha': act07b, 'bbi08-kansa': act08, 'bbi09-ara': act09, 'bbi10-chhata': act10a, 'bbi10-tana': act10b, 'bbi10-ratha': act10c, 'bbi02-dive': act02b, 'bbi06-buni': act06b, 'bbi07-sahi': act07c, 'bbi09-ratha': act09b, 'bbi05-khala': act05c, 'bbi03-mela': act03b, 'bbi08-thali': act08b, 'bbi07-stambha': act07d, 'bbi07-raati': act07e, 'bbi06-tani': act06c, 'bbi09-chakra': act09c, 'bbi10-khela': act10d, 'bbi10-nacha': act10e,
  'bbi06-jala': loomRun('bbi6g', 6, 0.5),
  'bbi06-pata': loomRun('bbi6h', 9, 0.45 + 0.52 + 0.1),
  'bbi09-ghoda': chAct('bbi9g', 8, 7),
  'bbi09-surya': chAct('bbi9h', 12, 9),
  'bbi07-mancha': (x) => [...crossTroupe('bbi7g0', x, 3, 6, 'bridge'), ...crossTroupe('bbi7g1', x, 13, 9, 'bridge'), { hold: 'R', until: X(x + 25.5), max: 300 }],
  'bbi07-dhol': (x) => [...crossTroupe('bbi7h0', x, 3, 5, 'tower'), ...crossTroupe('bbi7h1', x, 13, 7, 'bridge'), { hold: 'R', until: X(x + 23.5), max: 300 }],
  'bbi08-handi': bowlRun('bbi8f', 4, 19, 1, 4.6),
  'bbi10-bunakar': loomRun('bbi10b', 8, 1.1),
  'bbi10-konark': chAct('bbi10c3', 10, 8),
  'bbi02-dobara': (x) => [...hop(x + 11.9, 'hop the still ball at the stopper'), { hold: 'R', until: X(x + 29), max: 600 }],
  'bbi05-pokhari': rajaRun(RAJA4, 30),
  'bbi05-gaon': rajaRun(RAJA5, 34),
  'bbi07-deepa': (x) => [...crossTroupe('bbi7l', x, 4, 8, 'bridge'), { hold: 'R', until: X(x + 15.5), max: 300 }],
  'bbi07-shrinkhala': (x) => [...onBridge('bbi7k0', x + 4, x + 22.2, 'on at the stop, then walk the whole chain'), { hold: 'R', until: X(x + 25.5), max: 300 }],
  'bbi07-dweepa': (x) => [...crossTroupe('bbi7i0', x, 4, 6, 'bridge'), ...crossTroupe('bbi7i1', x, 12, 7, 'bridge'), { hold: 'R', until: X(x + 21.5), max: 300 }],
  'bbi06-sidhi': sidhiRun('bbi6s'),
  'bbi06-rachh': loomRun('bbi6q', 8, 0.5),
  'bbi06-dui': (x) => [
    { hold: 'R', until: X(x + 0.2), max: 300 },
    waitFor((w) => lm(w, 'bbi6t').bridge && lm(w, 'bbi6t').into > 0.5, 'the first motif'),
    { hold: 'R', until: and(ground, X(x + 9.3)), max: 400, note: 'across' },
    waitFor((w) => lm(w, 'bbi6u').bridge && lm(w, 'bbi6u').into > 0.5, 'the second motif, on its own beat'),
    { hold: 'R', until: and(ground, X(x + 18.4)), max: 400, note: 'across' },
    { hold: 'R', until: X(x + 20.5), max: 300 },
  ],
  'bbi09-ulta': chAct('bbi9u', 9, 8),
  'bbi09-udaya': (x) => {
    const out: Step[] = [{ hold: 'R', until: X(x + 1.4), max: 300 }];
    for (let k = 0; k < 8; k++) out.push(waitFor((w) => (w.flags.bbi9r.stood[k - 1] ?? w.flags.bbi9r.stood[-1] ?? 1e9) + 1.35 * 120 <= w.tick, `wait till spoke ${k + 1} is up`), leap(() => px(x + 3 + 2.5 * k) + 14, `spoke ${k + 1}`, () => true, 8));
    out.push(leap(() => px(x + 26), 'on to the terrace'), { hold: 'R', until: and(ground, X(x + 27.4)), max: 300 });
    return out;
  },
  'bbi09-asta': (x) => {
    const out: Step[] = [
      {
        note: 'up on the raised bank',
        max: 600,
        long: true,
        policy: (w) => {
          const p = w.player;
          const low = p.y + p.h > FLOOR_PX - 40;
          if (p.onGround && low && p.x + p.w >= px(x) - 24) return { move: 'R', jump: true };
          return { move: 'R', jump: !p.onGround && p.vy < 0 };
        },
        until: (w) => w.player.onGround && w.player.y + w.player.h <= FLOOR_PX - 47 && w.player.x >= px(x) - 4,
      },
      { hold: 'R', until: X(x + 1.0), max: 300 },
    ];
    for (let k = 0; k < 8; k++) out.push(waitFor((w) => (w.flags.bbi9s.stood[k - 1] ?? w.flags.bbi9s.stood[-1] ?? 1e9) + 1.35 * 120 <= w.tick, `wait till spoke ${k + 1} is up`), leap(() => px(x + 3 + 2.5 * k) + 14, `spoke ${k + 1}`, () => true, 8));
    out.push(leap(() => px(x + 26), 'on to the far bank'), { hold: 'R', until: and(ground, X(x + 27.4)), max: 300 });
    return out;
  },
  'bbi08-majhi': bowlRun('bbi8g', 4, 20, 0, 5.4),
  'bbi08-dui': bowlRun('bbi8h', 4, 24, 1, 6.0),
  'bbi10-sidhi': sidhiRun('bbi10s'),
  'bbi10-deepa': (x) => [...crossTroupe('bbi10d', x, 4, 8, 'bridge'), { hold: 'R', until: X(x + 15.5), max: 300 }],
  'bbi10-shrinkhala': (x) => [...onBridge('bbi10k30', x + 4, x + 22.2, 'on at the stop, then walk the whole chain'), { hold: 'R', until: X(x + 25.5), max: 300 }],
  'bbi10-udaya': (x) => {
    const out: Step[] = [{ hold: 'R', until: X(x + 1.4), max: 300 }];
    for (let k = 0; k < 8; k++) out.push(waitFor((w) => (w.flags.bbi10u.stood[k - 1] ?? w.flags.bbi10u.stood[-1] ?? 1e9) + 1.35 * 120 <= w.tick, `wait till spoke ${k + 1} is up`), leap(() => px(x + 3 + 2.5 * k) + 14, `spoke ${k + 1}`, () => true, 8));
    out.push(leap(() => px(x + 26), 'on to the terrace'), { hold: 'R', until: and(ground, X(x + 27.4)), max: 300 });
    return out;
  },
  'bbi05-tenda': tendaRun('bbi5t', 5),
  'bbi05-kua': tendaRun('bbi5k', 6),
  'bbi05-chakki': (x) => [
    { hold: 'R', until: X(x + 1.4), max: 400 },
    leap(() => px(x + 4) + 8, 'on to the far half of the mill', () => true, 5),
    { hold: '', until: (w) => (w.flags.bbi5f as { started: number }).started >= 0, max: 200, note: 'on its far half: it starts' },
    { hold: '', until: (w) => w.player.onGround && w.player.x > px(x + 13), max: 400, note: 'flung over the channel' },
    { hold: 'R', until: X(x + 17.5), max: 300 },
  ],
  'bbi05-bail': bailRun('bbi5b', 14),
  'bbi05-gali': bailRun('bbi5g', 20),
  'bbi10-mela': (x) => [...crossTroupe('bbi10m0', x, 3, 6, 'bridge'), ...crossTroupe('bbi10m1', x, 13, 7, 'wheel'), { hold: 'R', until: X(x + 23.5), max: 300 }],
};
const endingPolicies: Record<string, Policy> = { 'bbi-goal-net': goalPolicy, 'bbi-lantern-drop': lanternPolicy, 'bbi-curl-stair': curlStair, 'bbi-behind-step': behindStep, 'bbi-motif-door': motifPolicy, 'bbi-pose-gate': gatePolicy, 'bbi-leaf-plate': platePolicy, 'bbi-horse-gap': horseGap, 'bbi-ribbon-snip': ribbonPolicy };
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
