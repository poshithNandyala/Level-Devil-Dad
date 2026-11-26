// Proven routes for Bhubaneswar: every stage's room, its acts and its door, plus the plays that must die.
// Found by tests/city-tests.ts; merged into SOLUTIONS, NAIVE, FIX, MISTAKES, ACT_ROUTES and ENDING_POLICIES.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import { Step, X, and, ground, done } from '../runner';
import type { CityTests } from '../city-tests';
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
const act05b = (x: number): Step[] => [...hop(x + 4.4, 'jump over the cart, touching nothing', 14), { hold: 'R', until: X(x + 23.5), max: 600 }];
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
  fix['BBI-05'].steps = [...S['BBI-05'].slice(0, -1), { policy: (w) => verandahPolicy(w, fixMem(w), null as unknown as Door), until: done, max: 1500, note: 'up to the front door on the verandah' }];
  void lengthen;
}

const naive: Record<string, { steps: Step[]; cause?: string }> = {
  'BBI-07': { steps: [...hop(8.8, 'jump on to the dancers'), { hold: 'R', until: done, max: 600 }], cause: 'bbi-nacha' },
  'BBI-06': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'bbi-ranga' },
  'BBI-05': { steps: [{ hold: 'R', until: X(11.7), max: 600 }, { hold: 'R', jump: 3, ticks: 8, note: 'a little hop on to the stone in the channel' }, { hold: '', until: done, max: 600 }], cause: 'bbi-jaanta' },
  'BBI-04': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'bbi-agni' },
  'BBI-03': { steps: [...hop(3.6, 'jump for the first parasol'), { hold: 'R', until: done, max: 600 }], cause: 'bbi-rangapani' },
  'BBI-02': { steps: [...board02(), onPad(36, 44), { hold: '', until: done, max: 900, note: 'wait at the front, nearest the far side' }], cause: 'bbi-ball' },
  'BBI-01': { steps: [...tourHead(), ...hop(28.6, 'just walk on and hop the drain'), { hold: 'R', until: done, max: 900 }], cause: 'bbi-nala' },
};
const fix: Record<string, { steps: Step[]; cause?: string }> = {
  'BBI-07': { steps: [{ hold: 'R', until: (w) => w.player.x + w.player.w >= px(10) - 2, max: 900 }, waitFor((w) => tr(w, 'bbi7').pose === 'bridge' && tr(w, 'bbi7').into > 0.35, 'wait for the bridge to be whole'), { hold: '', ticks: 18, note: 'a look to be sure' }, { hold: 'R', until: done, max: 900 }], cause: 'bbi-thrown' },
  'BBI-06': { steps: [{ hold: 'R', until: X(6.8), max: 600 }, waitFor((w) => lm(w, 'bbi6').bridge, 'the motif lines up: go'), { hold: 'R', until: done, max: 600 }], cause: 'bbi-shuttle' },
  'BBI-05': { steps: [], cause: 'bbi-sila' },
  'BBI-04': { steps: [passTorch(9, r4on, 'keep moving, as learnt'), { hold: 'R', until: X(15.6), max: 400 }, { hold: 'R', jump: 15, ticks: 15, note: 'and jump the trough' }, { hold: 'R', until: done, max: 600 }], cause: 'bbi-kunda' },
  'BBI-03': { steps: [{ hold: 'R', until: X(3.4), max: 600 }, waitFor((w) => p3(w, 0).open(w), 'wait for the customer'), leap((w) => (w.flags.bbi3p as { rig: { x: number } }[])[0].rig.x + 9, 'land on the near side of the silk'), { hold: '', until: done, max: 900, note: 'stand where you landed' }], cause: 'bbi-silk' },
  'BBI-02': { steps: [...board02(), onPad(4, 12), { hold: '', until: (w) => k2(w).ball === 'rebound', max: 900 }, { hold: 'R', until: done, max: 900, note: 'off the moment he lands, and on' }], cause: 'bbi-rebound' },
  'BBI-01': { steps: [...pastG1(), ...tourTail().slice(0, 15), ...hop(72.2, 'jump the drain at its lip, as before'), { hold: 'R', until: done, max: 900 }], cause: 'bbi-nala' },
};
const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {
  'BBI-05': [{ what: 'walk the rice pounder across the pit', steps: [...room05(), ...hop(32.7, 'up on the straw', 15), { hold: 'R', until: done, max: 900, note: 'and walk down the pounder' }], cause: 'bbi-dhenki' }],
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
const actRoutes: Record<string, (x: number) => Step[]> = { 'bbi02-corner': act02, 'bbi03-gali': act03, 'bbi04-karkhana': act04, 'bbi05-dhenki': act05a, 'bbi05-gadi': act05b, 'bbi06-tana': act06, 'bbi07-mardala': act07a, 'bbi07-bandha': act07b };
const endingPolicies: Record<string, Policy> = { 'bbi-goal-net': goalPolicy, 'bbi-lantern-drop': lanternPolicy, 'bbi-curl-stair': curlStair, 'bbi-behind-step': behindStep, 'bbi-motif-door': motifPolicy, 'bbi-pose-gate': gatePolicy };
void and;

export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  fair: ['BBI-01', 'BBI-02', 'BBI-03', 'BBI-04', 'BBI-05', 'BBI-06', 'BBI-07'],
};
