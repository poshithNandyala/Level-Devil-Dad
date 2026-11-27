// Proven routes for Itanagar: every stage's room, its acts and its door, plus the plays that must die.
// Found by tests/city-tests.ts; merged into SOLUTIONS, NAIVE, FIX, MISTAKES, ACT_ROUTES and ENDING_POLICIES.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import { Step, X, and, ground, done } from '../runner';
import type { CityTests } from '../city-tests';
import { LEVEL_BY_ID } from '../../src/game/levels';

type Move = 'L' | 'R' | '';
type Out = { move: Move; jump: boolean };
interface Mem {
  hold: number;
  [k: string]: any;
}
type Policy = (w: World, m: Mem, d: Door) => Out;
const px = (t: number) => t * 16;
const FL = 240;
const go = (move: Move): Out => ({ move, jump: false });
/** on the road (not up on a deck), standing, at or past column x */
const road = (x: number) => and(ground, X(x), (w: World) => w.player.y >= 224);
const hop = (at: number, note: string, ticks = 12): Step[] => [
  { hold: 'R', until: X(at), max: 900 },
  { hold: 'R', jump: ticks, ticks, note },
  { hold: 'R', until: ground, max: 300 },
];

// ------------------------------------------------------------------ ITA-01
/** the shared course up to the fort */
const courseRoute = (): Step[] => [
  ...hop(10.4, 'a shallow drain'),
  ...hop(20.7, 'a step up'),
  ...hop(22.7, 'a step up'),
  ...hop(36.6, 'a post'),
  ...hop(39.6, 'a post'),
  ...hop(42.6, 'a post'),
  { hold: 'R', until: X(49.8), max: 900 },
  { hold: 'R', jump: 14, ticks: 14, note: 'hop the parked Sumo' },
  { hold: 'R', until: (w) => w.player.onGround && w.player.y > 220, max: 400 },
];
const tourRoute = (): Step[] => [
  ...courseRoute(),
  { hold: 'R', until: X(63.0), max: 600, note: 'the first wall: the loose brick is the second' },
  { hold: 'R', jump: 16, ticks: 16, note: 'long, over the loose brick, on to the third' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', until: road(69), max: 400, note: 'off the wall' },
  { hold: 'R', until: X(75.8), max: 600, note: 'the second wall: the loose brick is in the arch over the third brick' },
  { hold: 'R', jump: 9, ticks: 9, note: 'a short hop on to the first brick' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', jump: 16, ticks: 16, note: 'long, over the arch brick’s column, to the far end' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', until: road(83), max: 400 },
  ...hop(89.4, 'the low wall'),
  { hold: 'R', until: X(92.4), max: 300 },
  { hold: 'R', jump: 12, ticks: 12, note: 'up on the deck' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', until: road(100.5), max: 600, note: 'off the deck' },
  { hold: 'R', until: done, max: 900 },
];

// ------------------------------------------------------------------ ITA-02
type DeckSt = { t0: number; c0: number; c1: number; porters: { x: number; on: boolean; s: { t?: number } }[]; spec: { at: number; v: number; bundle?: boolean }[] };
const sinceT = (w: World, t0: number) => (w.tick - t0) / 120;
/** run right and jump over the gaps in the deck (the obvious read of a hole in a bridge) */
const hopGaps = (cols: number[]): Step[] => cols.flatMap((c) => hop(c - 1.6, 'hop the hole in the deck', 12));
/** run on and drop into the bay at `bay`, wait there until every porter has gone by, climb out and run on to column `to` */
const bayWait = (key: string, bay: number, to: number, shallow: number[], after: number[] = []): Step[] => [
  ...hopGaps(shallow),
  { hold: 'R', until: (w) => w.player.x >= px(bay) && w.player.y > FL - 8, max: 900, note: 'into the deep bay' },
  {
    hold: '',
    until: (w) => {
      const st = w.flags[key] as DeckSt;
      if (st.t0 < 0) return false;
      const last = st.spec.length - 1;
      return sinceT(w, st.t0) > st.spec[last].at + 0.2 && st.porters[last].x < px(bay) - 34;
    },
    max: 3000,
    note: 'every porter has gone by overhead',
  },
  { hold: 'R', jump: 16, ticks: 16, note: 'climb out' },
  { hold: 'R', until: and(ground, (w) => w.player.y <= FL - 13), max: 300 },
  ...hopGaps(after),
  { hold: 'R', until: X(to), max: 900 },
];
const room02 = (): Step[] => bayWait('ita2', 18, 29, [12]);
const act02 = (x: number): Step[] => bayWait('ita2a', x + 22, x + 41.4, [x + 9, x + 16], [x + 29]);
/** the gate: into the bay, let the porter by, then straight after him through the gate he holds open */
const gatePolicy: Policy = (w, m) => {
  const st = w.flags.ita2e as DeckSt;
  const g = w.flags.ita2g as { down: number };
  const p = w.player;
  const bayX = px(st.c0 + 6);
  if (m.hold > 0) return { move: 'R', jump: true };
  const inBay = p.y > FL - 8;
  const porter = st.porters[0];
  if (!inBay && p.x < bayX - 4) {
    // only go on to the span if the porter is far enough off to reach the bay first
    return go('R');
  }
  if (inBay) {
    if (porter.on && porter.x < bayX - 30) {
      m.hold = 16;
      return { move: 'R', jump: true };
    }
    return go('');
  }
  // out of the bay: run for the gate while it is up
  if (g.down < 0.5 || p.x > px(st.c1 + 2)) return go('R');
  return go(p.x < px(st.c1 - 3) ? 'R' : '');
};

const upTo = (n: number) => tourRoute().slice(0, n);
const naive: Record<string, { steps: Step[]; cause?: string }> = {
  'ITA-01': { steps: [...courseRoute(), ...hop(62.4, 'hop the fort wall like the others'), { hold: 'R', until: done, max: 900 }], cause: 'ita-ita' },
  'ITA-02': { steps: [...hopGaps([12, 18]), { hold: 'R', until: done, max: 2400 }], cause: 'ita-bhaar' },
};
const fix: Record<string, { steps: Step[]; cause?: string }> = {
  'ITA-01': { steps: [...upTo(24), { hold: 'R', until: X(77.0), max: 600 }, { hold: 'R', jump: 16, ticks: 16, note: 'skip the first brick, as on the first wall' }, { hold: 'R', until: done, max: 900 }], cause: 'ita-pop' },
  'ITA-02': { steps: [{ hold: 'R', until: (w) => w.player.x >= px(12) && w.player.y > FL - 8, max: 900, note: 'step aside into the first bay' }, { hold: '', until: done, max: 2400, note: 'and wait there' }], cause: 'ita-bans' },
};
const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {
  'ITA-02': [{ what: 'wait in the deep bay for the first porter only, then run on', steps: [...hopGaps([12]), { hold: 'R', until: (w) => w.player.x >= px(18) && w.player.y > FL - 8, max: 900 }, { hold: '', until: (w) => (w.flags.ita2 as DeckSt).porters[0].x < px(18) - 34, max: 1500 }, { hold: 'R', jump: 16, ticks: 16 }, { hold: 'R', until: done, max: 1500 }], cause: 'ita-bhaar' }],
};
const actRoutes: Record<string, (x: number) => Step[]> = {
  'ita02-dusra': act02,
};
const endingPolicies: Record<string, Policy> = {
  'ita-phatak': gatePolicy,
};

function solutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  S['ITA-01'] = tourRoute();
  S['ITA-02'] = room02();
  lengthen('ITA-02', 0, []);
}

void LEVEL_BY_ID;
export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  fair: ['ITA-02'],
};
