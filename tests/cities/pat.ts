// Proven routes for Patna: every stage's room, its acts and its door, plus the plays that must die.
// Found by tests/city-tests.ts; merged into SOLUTIONS, NAIVE, FIX, MISTAKES, ACT_ROUTES and ENDING_POLICIES.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import { Step, X, and, ground, done } from '../runner';
import type { CityTests } from '../city-tests';

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

function solutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  S['PAT-01'] = tourRoute();
  S['PAT-02'] = room02();
  lengthen('PAT-02', 0, []);
}

const upTo = (n: number) => tourRoute().slice(0, n);
const naive: Record<string, { steps: Step[]; cause?: string }> = {
  'PAT-02': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'pat-angara' },
  'PAT-01': { steps: [...upTo(21), { hold: 'R', until: done, max: 2400 }], cause: 'pat-bheed' },
};
const fix: Record<string, { steps: Step[]; cause?: string }> = {
  'PAT-02': { steps: [...room02().slice(0, 4), { hold: '', until: done, max: 1500 }], cause: 'pat-chimta' },
  'PAT-01': { steps: [...upTo(24), { hold: '', until: done, max: 1500 }], cause: 'pat-tempo' },
};
const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {
  'PAT-01': [{ what: 'run on at the hoarding', steps: [...upTo(32), { hold: 'R', until: done, max: 900 }], cause: 'pat-hoarding' }],
};
const actRoutes: Record<string, (x: number) => Step[]> = {
  'pat02-chokha': act02,
};
const endingPolicies: Record<string, Policy> = {
  'pat-musal': pestlePolicy,
};

export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  fair: ['PAT-02'],
};
