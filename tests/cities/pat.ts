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
  { hold: 'R', until: X(x + 19.0), max: 900 },
  { hold: 'R', jump: 12, ticks: 12, note: 'seam 3 has no plate' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', until: X(x + 33.0), max: 900 },
  { hold: 'R', jump: 12, ticks: 12, note: 'seam 5 has none either' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', until: X(x + 43.4), max: 600 },
];
/** the booth: step on the strip, stand still while the barrier slams, walk in when it is up */
const tollPolicy: Policy = (w) => {
  const st = w.flags.pat6e as { down: number };
  if (st.down >= 0 && (w.tick - st.down) / 120 < 3.2) return go('');
  return go('R');
};

function solutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  S['PAT-01'] = tourRoute();
  S['PAT-02'] = room02();
  lengthen('PAT-02', 0, []);
  S['PAT-04'] = room04();
  lengthen('PAT-04', 0, []);
  S['PAT-05'] = room05();
  lengthen('PAT-05', 0, []);
  S['PAT-06'] = room06();
  lengthen('PAT-06', 0, []);
}

const upTo = (n: number) => tourRoute().slice(0, n);
const naive: Record<string, { steps: Step[]; cause?: string }> = {
  'PAT-06': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'pat-jod' },
  'PAT-05': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'pat-ganga' },
  'PAT-04': { steps: [{ hold: 'R', until: X(2), max: 300 }, ...Array.from({ length: 30 }, (): Step => ({ hold: 'R', jump: 20, ticks: 26 }))], cause: 'pat-bojh' },
  'PAT-02': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'pat-angara' },
  'PAT-01': { steps: [...upTo(21), { hold: 'R', until: done, max: 2400 }], cause: 'pat-bheed' },
};
const fix: Record<string, { steps: Step[]; cause?: string }> = {
  'PAT-06': { steps: [{ hold: 'R', until: X(4.4), max: 600 }, { hold: 'R', jump: 12, ticks: 12, note: 'jump every seam, to be safe' }, { hold: 'R', until: done, max: 600 }], cause: 'pat-taala' },
  'PAT-05': { steps: [{ hold: 'R', until: X(7.2), max: 600 }, { hold: '', until: (w) => w.flags.pat5.carts[0].s.cx > 236 && w.flags.pat5.carts[0].s.dir > 0, max: 900, note: 'let the cart go by down the deck' }, { hold: 'R', until: X(9.5), max: 300, note: 'step on to the high section behind it' }, { hold: '', until: done, max: 1800, note: 'and wait there' }], cause: 'pat-pipa' },
  'PAT-04': { steps: [{ hold: '', until: (w) => w.flags.pat4.t0 >= 0 && t4(w) >= 3.7, max: 800 }, ...climb4().slice(1)], cause: 'pat-bojh' },
  'PAT-02': { steps: [...room02().slice(0, 4), { hold: '', until: done, max: 1500 }], cause: 'pat-chimta' },
  'PAT-01': { steps: [...upTo(24), { hold: '', until: done, max: 1500 }], cause: 'pat-tempo' },
};
const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {
  'PAT-01': [{ what: 'run on at the hoarding', steps: [...upTo(32), { hold: 'R', until: done, max: 900 }], cause: 'pat-hoarding' }],
};
const actRoutes: Record<string, (x: number) => Step[]> = {
  'pat02-chokha': act02,
  'pat04-anaaj': act04,
  'pat05-ghat': act05,
  'pat06-sau': act06,
};
const endingPolicies: Record<string, Policy> = {
  'pat-musal': pestlePolicy,
  'pat-bhitar': leafPolicy,
  'pat-nawka': floatPolicy,
  'pat-toll': tollPolicy,
};

export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  fair: ['PAT-02', 'PAT-04', 'PAT-05', 'PAT-06'],
};
