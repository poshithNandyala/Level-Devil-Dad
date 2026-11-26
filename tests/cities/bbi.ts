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

function solutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  S['BBI-01'] = [...pastG1(), ...tourTail()];
  S['BBI-02'] = room02();
  lengthen('BBI-02', 0, []);
  S['BBI-03'] = room03();
  lengthen('BBI-03', 0, []);
  void lengthen;
}

const naive: Record<string, { steps: Step[]; cause?: string }> = {
  'BBI-03': { steps: [...hop(3.6, 'jump for the first parasol'), { hold: 'R', until: done, max: 600 }], cause: 'bbi-rangapani' },
  'BBI-02': { steps: [...board02(), onPad(36, 44), { hold: '', until: done, max: 900, note: 'wait at the front, nearest the far side' }], cause: 'bbi-ball' },
  'BBI-01': { steps: [...tourHead(), ...hop(28.6, 'just walk on and hop the drain'), { hold: 'R', until: done, max: 900 }], cause: 'bbi-nala' },
};
const fix: Record<string, { steps: Step[]; cause?: string }> = {
  'BBI-03': { steps: [{ hold: 'R', until: X(3.4), max: 600 }, waitFor((w) => p3(w, 0).open(w), 'wait for the customer'), leap((w) => (w.flags.bbi3p as { rig: { x: number } }[])[0].rig.x + 9, 'land on the near side of the silk'), { hold: '', until: done, max: 900, note: 'stand where you landed' }], cause: 'bbi-silk' },
  'BBI-02': { steps: [...board02(), onPad(4, 12), { hold: '', until: (w) => k2(w).ball === 'rebound', max: 900 }, { hold: 'R', until: done, max: 900, note: 'off the moment he lands, and on' }], cause: 'bbi-rebound' },
  'BBI-01': { steps: [...pastG1(), ...tourTail().slice(0, 15), ...hop(72.2, 'jump the drain at its lip, as before'), { hold: 'R', until: done, max: 900 }], cause: 'bbi-nala' },
};
const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {
  'BBI-03': [{ what: 'wait on the third parasol’s cut-out', steps: [...room03().slice(0, 7), stayOn(cut3(2), done, 'wait for the next customer', 1500)], cause: 'bbi-peeled' }],
  'BBI-01': [{ what: 'stop and wait for the gardener, as Tara says', steps: [...hop(8.6, 'the ditch'), { hold: 'R', until: X(21), max: 600 }, { hold: '', until: done, max: 900 }], cause: 'bbi-nala' }],
};
const actRoutes: Record<string, (x: number) => Step[]> = { 'bbi02-corner': act02, 'bbi03-gali': act03 };
const endingPolicies: Record<string, Policy> = { 'bbi-goal-net': goalPolicy, 'bbi-lantern-drop': lanternPolicy };
void and;

export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  fair: ['BBI-01', 'BBI-02', 'BBI-03'],
};
