// Proven routes for Dispur: every stage's room, its acts and its door, plus the plays that must die.
// Found by tests/city-tests.ts; merged into SOLUTIONS, NAIVE, FIX, MISTAKES, ACT_ROUTES and ENDING_POLICIES.
// tests/modules.test.ts fails until every table is filled. Scaffolded by scripts/dev/new-city.mjs.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import { Step, X, and, ground } from '../runner';
import type { CityTests } from '../city-tests';
import { Carrier, SandField } from '../../src/game/cities/dis/entities';

type Out = { move: 'L' | 'R' | ''; jump: boolean };
type Policy = (w: World, m: { hold: number; [k: string]: any }, d: Door) => Out;
const done = (w: World) => w.state !== 'play';
const px = (t: number) => t * 16;
const FLOOR_PX = 240;
const go = (move: Out['move']): Out => ({ move, jump: false });
void go;
const toward = (w: World, x: number, slack = 2): Out['move'] => {
  const c = w.player.cx;
  return c < x - slack ? 'R' : c > x + slack ? 'L' : '';
};
void toward; void px; void FLOOR_PX;

// ------------------------------------------------------------------ DIS-01: the tea boy
const hop = (at: number, note: string, ticks = 12): Step[] => [{ hold: 'R', until: X(at), max: 900 }, { hold: 'R', jump: ticks, ticks, note }, { hold: 'R', until: ground, max: 300 }];
/** the tour's pieces up to the promenade (bollards, ditch, ghat steps, a parked cart) */
const tourStart = (): Step[] => [
  ...hop(10 - 1.4, 'a post'),
  ...hop(13 - 1.4, 'a post'),
  ...hop(16 - 1.4, 'a post'),
  ...hop(24 - 1.6, 'a shallow ditch'),
  ...hop(34 - 1.3, 'a step up'),
  ...hop(36 - 1.3, 'a step up'),
  { hold: 'R', until: X(54 - 2.2), max: 900 },
  { hold: 'R', jump: 14, ticks: 14, note: 'hop the parked ride' },
  { hold: 'R', until: (w) => w.player.onGround && w.player.y > 220, max: 400 },
];
const boy = (w: World) => w.entities.find((e) => e instanceof Carrier) as Carrier;
const inGhat = (w: World) => w.player.onGround && w.player.y > 250 && w.player.x > px(74) && w.player.x < px(80);
/** down into the ghat, wait for the boy to walk over and a few steps on, climb out the far side */
const ghatRun = (): Step[] => [
  { hold: 'R', until: inGhat, max: 700, note: 'walk down into the ghat' },
  { hold: '', until: (w) => boy(w).x < px(74) - 6 || boy(w).stopped, max: 1500, note: 'let him walk over, and a few steps past' },
  { hold: 'R', until: (w) => w.player.x >= px(79) - 2, max: 200 },
  { hold: 'R', jump: 14, ticks: 14, note: 'climb out of the ghat' },
  { hold: 'R', until: ground, max: 200 },
];
// ------------------------------------------------------------------ DIS-02: the sandbars
const fields = (w: World) => (w.flags.sand ?? []) as SandField[];
/** bar i of field f is grown to at least `tiles` wide */
const barUp = (f: number, i: number, tiles = 3) => (w: World) => fields(w)[f].bars[i].slab.solid.w >= px(tiles);
const barGone = (f: number, i: number) => (w: World) => fields(w)[f].bars[i].slab.solid.w === 0;
const standing = (w: World, f: number, i: number) => w.standing(fields(w)[f].bars[i].slab.solid);
void barGone; void standing;
const tourEnd = (): Step[] => [...hop(94 - 1.6, 'up on the deck'), { hold: 'R', until: done, max: 900 }];

/** S['DIS-0n'] = room route; lengthen(id, drop, extra) appends each act's route and the door's policy */
function solutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  void lengthen;
  S['DIS-01'] = [...tourStart(), ...ghatRun(), ...tourEnd()];
  S['DIS-02'] = [
    { hold: 'R', until: X(6.3), max: 400 },
    { hold: 'R', jump: 14, ticks: 14, note: 'on to the first bar' },
    { hold: 'R', until: ground, max: 200 },
    { hold: '', until: and(ground, barUp(0, 1)), max: 600, note: 'wait for the siren and the next bar to come up' },
    { hold: 'R', until: X(12.4), max: 200 },
    { hold: 'R', jump: 14, ticks: 14, note: 'on to the new bar' },
    { hold: 'R', until: ground, max: 200 },
    { hold: '', until: and(ground, barUp(0, 2)), max: 600, note: 'wait for the siren and the bar after it' },
    { hold: 'R', until: X(17.3), max: 200, note: 'across to the left end of the narrowing bar' },
    { hold: 'R', jump: 14, ticks: 14, note: 'on to the last bar' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: X(24), max: 200 },
    { hold: 'R', jump: 14, ticks: 14, note: 'on to the far bank' },
    { hold: 'R', until: and(ground, X(28.4)), max: 300 },
  ];
  lengthen('DIS-02', 0, []);
}

/** the obvious play per stage, and the cause it must die of (every stage, 01-10). TODO */
const naive: Record<string, { steps: Step[]; cause?: string }> = {
  // run and jump from bar to bar: the next one isn't there yet
  'DIS-02': { steps: [{ hold: 'R', until: X(6.3), max: 400 }, ...Array.from({ length: 30 }, (): Step => ({ hold: 'R', jump: 14, ticks: 22 }))], cause: 'dis-luit' },
  // down into the ghat and straight out again, then run at him
  'DIS-01': { steps: [...tourStart(), { hold: 'R', until: inGhat, max: 700 }, { hold: 'R', until: (w) => w.player.x >= px(79) - 2, max: 200 }, { hold: 'R', jump: 14, ticks: 14, note: 'out at once' }, { hold: 'R', until: done, max: 900 }], cause: 'dis-spill' },
};

/** the obvious correction after the first death, which dies too (at least 5 of 10). TODO */
const dis02Start: Step[] = [
  { hold: 'R', until: X(6.3), max: 400 },
  { hold: 'R', jump: 14, ticks: 14, note: 'on to the first bar' },
  { hold: 'R', until: ground, max: 200 },
  { hold: '', until: and(ground, barUp(0, 1)), max: 600, note: 'wait for the siren and the next bar to come up' },
  { hold: 'R', until: X(12.4), max: 200 },
  { hold: 'R', jump: 14, ticks: 14, note: 'on to the new bar' },
  { hold: 'R', until: ground, max: 200 },
];
const fix: Record<string, { steps: Step[]; cause?: string }> = {
  // the obvious correction: wait on every bar for the next one. The narrowing bar goes out from under the right end
  'DIS-02': { steps: [...dis02Start, { hold: 'R', until: X(19.0), max: 200 }, { hold: '', until: done, max: 1500 }], cause: 'dis-luit' },
  // hop clean over him instead: the tray tips on to where you land
  'DIS-01': { steps: [...tourStart(), { hold: 'R', until: (w) => w.player.x >= px(66), max: 600 }, { hold: 'R', until: (w) => boy(w).x - w.player.x < 38, max: 900 }, { hold: 'R', jump: 30, ticks: 30, long: true, note: 'over him' }, { hold: 'R', until: done, max: 900 }], cause: 'dis-spill' },
};

/** more scripted first-timer deaths and 'like last time' moves. TODO */
const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {
  'DIS-02': [
    { what: 'waits on the first bar for ever: it sinks once the next one is up', steps: [{ hold: 'R', until: X(6.3), max: 400 }, { hold: 'R', jump: 14, ticks: 14 }, { hold: 'R', until: ground, max: 200 }, { hold: '', until: done, max: 1500 }], cause: 'dis-luit' },
  ],
};

/** a route for each act, by act id ('dis02-...'). TODO */
const hopR = (at: number, note: string, ticks = 14): Step[] => [{ hold: 'R', until: X(at), max: 900 }, { hold: 'R', jump: ticks, ticks, note }, { hold: 'R', until: ground, max: 300 }];
const actRoutes: Record<string, (x: number) => Step[]> = {
  'dis02-chapori': (x) => [
    ...hopR(x + 1.4, 'on to the first bar', 12),
    ...hopR(x + 7.2, 'on to the big bar', 14),
    ...hopR(x + 16.2, 'across to the hut, which never moves', 14),
    { hold: '', until: and(ground, barUp(1, 3)), max: 900, note: 'stop on the hut: the last bar comes up' },
    ...hopR(x + 25.2, 'on to the last bar', 14),
    ...hopR(x + 33.2, 'on to the far bank', 12),
    { hold: 'R', until: and(ground, X(x + 38)), max: 300 },
  ],
};

/** a policy for each door ending, by kind ('dis-...'). TODO */
const endingPolicies: Record<string, Policy> = {
  'dis-hut-shut'(w, m, d) {
    const f = fields(w)[fields(w).length - 1];
    const p = w.player;
    if (m.hold > 0) return { move: 'R', jump: true };
    if (w.flags.twist === 'open') return go(p.onGround ? toward(w, d.x + 8, 1) || 'R' : '');
    if (!p.onGround) return go('R');
    const X0 = f.bars[0].slab.solid,
      Y = f.bars[1].slab.solid;
    if (p.cx < X0.x - 38) return go('R');
    if (p.cx < X0.x + 2 && !w.standing(X0)) {
      m.hold = 13;
      return { move: 'R', jump: true };
    }
    if (w.standing(X0)) {
      if (Y.w < px(3)) return go('');
      if (p.cx < X0.x + X0.w - 6) return go('R');
      m.hold = 13;
      return { move: 'R', jump: true };
    }
    if (w.standing(Y)) {
      if (p.cx < Y.x + Y.w - 5) return go('R');
      m.hold = 13;
      return { move: 'R', jump: true };
    }
    return go(toward(w, d.x + 8, 1) || 'R');
  },
};

export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  // TODO: at least every long, marathon and wtf stage
  fair: [],
};
