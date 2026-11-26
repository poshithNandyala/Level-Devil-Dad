// Thiruvananthapuram's own route file. Its older proven plays still live in the shared tables
// (tests/solutions.ts, tests/west.ts, tests/acts.ts, tests/endings.ts); anything set here is merged LAST and
// replaces that stage's (or act's, or ending's) entry there. After a change on purpose: npm run refreeze -- TVM.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import { type Step, X, and, done, ground } from '../runner';
import type { CityTests } from '../city-tests';
import { STRIP } from '../../src/game/cities/tvm/kovalam';
import { surfOf } from '../../src/game/cities/tvm/encores';

type Move = 'L' | 'R' | '';
type Out = { move: Move; jump: boolean };
type Policy = (w: World, m: { hold: number; [k: string]: any }, d: Door) => Out;

const px = (t: number) => t * 16;
const go = (move: Move): Out => ({ move, jump: false });
const toward = (w: World, x: number, slack = 2): Move => (w.player.cx < x - slack ? 'R' : w.player.cx > x + slack ? 'L' : '');
const walk = (to: number, note?: string, max = 900): Step => ({ hold: 'R', until: and(ground, X(to)), max, note });
const hopAt = (at: number, ticks: number, note: string, long = false): Step[] => [
  { hold: 'R', until: X(at), max: 900 },
  { hold: 'R', jump: ticks, ticks, note, long },
  { hold: 'R', until: ground, max: 300 },
];
const until = (pred: (w: World) => boolean, note: string, max = 900): Step => ({ hold: '', until: pred, max, note });
/** is there no floor just ahead of Dad (the next 14 px, going right)? */
const pitAhead = (w: World) => {
  const p = w.player;
  const tx = Math.floor((p.x + p.w + 6) / 16);
  return !w.isSolidTile(w.tileAt(tx, 15));
};

// ------------------------------------------------------------------ TVM-09: Kovalam Flags
/** walk with the lifeguard to where he plants the flags this wave (hopping any rock pool), and stand there till it's out */
function follow(name: string, i: number, note: string): Step {
  let jt = 0;
  return {
    note,
    max: 1500,
    until: (w) => (surfOf(w, name)?.i ?? 0) > i,
    policy: (w) => {
      const s = surfOf(w, name)!;
      const c = s.target + STRIP / 2;
      if (jt > 0) {
        jt--;
        return { move: c > w.player.cx ? 'R' : 'L', jump: true };
      }
      const mv = toward(w, c, 5);
      if (mv === 'R' && w.player.onGround && pitAhead(w)) {
        jt = 12;
        return { move: 'R', jump: true };
      }
      return { move: mv, jump: false };
    },
  };
}
const kovalamRoom = (): Step[] => [walk(8.7, 'into the flags'), follow('hawa', 0, 'go with him to the new flags'), follow('hawa', 1, 'and on again'), ...hopAt(27.2, 12, 'up on the rocks'), walk(31.5)];

// ------------------------------------------------------------------ TVM-10: Dhara
const dharaRoom = (): Step[] => [
  ...hopAt(7.6, 30, 'over the oil and the trough, from before the oil', true),
  walk(18.3),
  { hold: '', ticks: 24, note: 'stop at the edge of the second trough' },
  { hold: 'R', jump: 16, ticks: 16, note: 'a little hop over it, short of the oil' },
  { hold: 'R', until: ground, max: 300 },
  { hold: '', ticks: 30, note: 'and stop' },
  { hold: 'R', until: X(22.6), max: 300 },
  { hold: 'R', jump: 30, ticks: 30, note: 'over the oil and the kindi', long: true },
  { hold: 'R', until: ground, max: 300 },
  walk(31.5),
];

// ------------------------------------------------------------------ TVM-01: the tour, with Connemara market's fish ice
const die: Step = { hold: 'R', until: (w) => w.state !== 'play', max: 900 };
const ice = (w: World) => w.flags.ice as string | undefined;
/** the market: wait for the ice to move twice (the twitch, then the yank), then a long jump over the drain on to it */
const tvm01Market: Step[] = [
  { hold: 'R', until: X(101.7), max: 900, note: 'up to the fish ice: it twitches' },
  { hold: '', until: (w) => ice(w) === 'done', max: 300, note: 'wait for the yank' },
  { hold: 'R', until: X(102.3), max: 300 },
  { hold: '', ticks: 20, note: 'stop at the edge of the drain' },
  { hold: 'R', jump: 30, ticks: 30, long: true, note: 'a long jump on to the ice' },
  { hold: 'R', until: done, max: 600 },
];
/** the stage-01 plays that need the shared route (built from it, so they can't drift from it) */
function tour01(S: Record<string, Step[]>) {
  // the shared route ends with the old opening road (3 steps): the market replaces it
  const R = S['TVM-01'].slice(0, -3);
  const at = (note: string) => {
    const i = R.findIndex((st) => st.note === note);
    if (i < 0) throw new Error(`TVM-01: no step '${note}'`);
    return i;
  };
  S['TVM-01'] = [...R, ...tvm01Market];
  // the obvious play at the ice: it twitches, you stop, it looks still, you go
  naive['TVM-01'] = { steps: [...R, { hold: 'R', until: (w) => ice(w) === 'twitch', max: 900 }, { hold: '', ticks: 42, note: 'it twitched: stop, it settles' }, die], cause: 'tvm-chaal' };
  const ditch = at('walk into the ditch');
  const tarp = at('let the tarp empty') - 1;
  const rocket = at('over the top of the steps: the rocket goes');
  const canoe = at('hop off: the landing gives way') - 1;
  mistakes['TVM-01'] = [
    { what: 'hop up on to the wall', steps: [...R.slice(0, 3), { hold: 'R', until: (w) => w.player.x + w.player.w >= px(12) - 0.5, max: 200 }, { hold: '', jump: 14, ticks: 14 }, { hold: 'R', until: (w) => w.state !== 'play' || w.player.onGround, max: 200 }, die], cause: 'spikes' },
    { what: 'walk on after the wall', steps: [...R.slice(0, 3), die], cause: 'spikes' },
    { what: 'hop the soaked road, like last time', steps: [{ hold: 'R', until: X(6.3), max: 300 }, { hold: 'R', jump: 10, ticks: 10 }, die], cause: 'fell' },
    { what: 'jump the ditch', steps: [...R.slice(0, ditch), { hold: 'R', until: X(22.4), max: 400 }, { hold: 'R', jump: 12, ticks: 12 }, die], cause: 'spikes' },
    { what: 'jump the ditch, long', steps: [...R.slice(0, ditch), { hold: 'R', until: X(22.9), max: 400 }, { hold: 'R', jump: 30, ticks: 30, long: true }, die], cause: 'spikes' },
    { what: 'walk on under the full tarp', steps: [...R.slice(0, tarp), die], cause: 'tvm-drenched' },
    { what: 'let the tarp empty, then wade the puddle like the ditch', steps: [...R.slice(0, tarp + 2), die], cause: 'splash' },
    { what: 'run on when the rocket goes', steps: [...R.filter((st) => st.note !== 'over the top of the steps: the rocket goes' && !st.note?.startsWith('the rocket goes')), die], cause: 'burnt' },
    { what: 'stop at the foot of the steps when it goes', steps: [...R.slice(0, rocket), { hold: 'R', until: X(52.3), max: 400 }, { hold: '', until: (w) => w.state !== 'play', max: 600 }], cause: 'crushed' },
    { what: 'wait on the last step, like last time', steps: [...R.slice(0, rocket), { hold: 'R', until: X(49.9), max: 400 }, { hold: '', until: (w) => w.state !== 'play', max: 600 }], cause: 'crushed' },
    { what: 'step off the canoe', steps: [...R.slice(0, canoe), die], cause: 'fell' },
    { what: 'run straight over the fish ice', steps: [...R, die], cause: 'tvm-chaal' },
    { what: 'wait for the ice to stop twitching, then walk on to it', steps: [...R, { hold: 'R', until: (w) => ice(w) === 'twitch', max: 900 }, { hold: '', until: (w) => ice(w) === 'wait', max: 60 }, { hold: '', ticks: 20 }, die], cause: 'tvm-chaal' },
  ];
}

const solutions = (S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) => {
  tour01(S);
  S['TVM-09'] = kovalamRoom();
  lengthen('TVM-09', 0, []);
  S['TVM-10'] = dharaRoom();
  lengthen('TVM-10', 0, []);
};

const naive: Record<string, { steps: Step[]; cause?: string }> = {
  'TVM-09': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'tvm-drift' },
  'TVM-10': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'tvm-droni' },
};

const fix: Record<string, { steps: Step[]; cause?: string }> = {
  // first death: ran on out of the strip. So: stop in the flags you reached... and he moves them again
  'TVM-09': { steps: [walk(8.7), follow('hawa', 0, 'to the new flags'), until(done, 'and stay in them', 900)], cause: 'tvm-drift' },
  // first death: slid off the oil into the trough. So: jump long from before the oil, every trough
  'TVM-10': { steps: [...hopAt(7.6, 30, 'from before the oil', true), walk(18.4), ...hopAt(18.7, 30, 'the same long jump', true), { hold: 'R', until: done, max: 300 }], cause: 'tvm-kindi' },
};

const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {
  'TVM-09': [{ what: 'stand still in the first flags', steps: [walk(8.7), until(done, 'stay', 900)], cause: 'tvm-drift' }],
  'TVM-10': [{ what: 'jump the first trough from its edge', steps: [...hopAt(9.4, 30, 'from the edge, on the oil'), { hold: 'R', until: done, max: 300 }], cause: 'tvm-droni' }],
};

const actRoutes: Record<string, (x: number) => Step[]> = {
  'tvm09-vilakku': (x) => [walk(x + 10.2, 'into the flags'), follow('vilakku', 0, 'back with him, behind you'), walk(x + 18.2), follow('vilakku', 1, 'far on, over the rock pool'), ...hopAt(x + 36.2, 12, 'up on the rocks'), walk(x + 39.5)],
  'tvm09-samudra': (x) => [walk(x + 4.7, 'into the flags'), follow('samudra', 0, 'with the flags till he stops'), follow('samudra', 1, 'the long run on'), ...hopAt(x + 30.2, 12, 'up on the rocks'), walk(x + 33.5)],
  'tvm09-ashoka': (x) => [walk(x + 6.6, 'into the flags'), follow('ashoka', 0, 'he paces and puts them back: stay'), follow('ashoka', 1, 'then on with him'), ...hopAt(x + 26.2, 12, 'up on the rocks'), walk(x + 29.5)],
  'tvm10-uzhichil': (x) => [
    walk(x + 4.3),
    { hold: '', ticks: 24, note: 'stop at the edge of the first trough' },
    { hold: 'R', jump: 12, ticks: 12, note: 'a short hop, short of the oil' },
    { hold: 'R', until: ground, max: 300 },
    { hold: '', ticks: 30 },
    { hold: 'R', until: X(x + 8.6), max: 300 },
    { hold: 'R', jump: 30, ticks: 30, long: true, note: 'over the oil and the kindi' },
    { hold: 'R', until: ground, max: 300 },
    walk(x + 15.2),
    { hold: '', ticks: 24, note: 'stop before the oil' },
    { hold: 'R', jump: 30, ticks: 30, long: true, note: 'over the oil and the last trough' },
    { hold: 'R', until: ground, max: 300 },
    walk(x + 25.5),
  ],
  'tvm10-kizhi': (x) => [
    walk(x + 6.0, 'stop short of the tarp'),
    until((w) => w.flags.kizhi.tarp.state === 'empty', 'let it empty: it washes the oil off'),
    walk(x + 10.3),
    { hold: '', ticks: 24, note: 'stop on the washed edge' },
    { hold: 'R', jump: 16, ticks: 16, note: 'over the trough' },
    { hold: 'R', until: ground, max: 300 },
    walk(x + 18.6),
    ...hopAt(x + 18.9, 14, 'over the oil by the palm'),
    walk(x + 33.5),
  ],
};

const endingPolicies: Record<string, Policy> = {
  // the old knock, under its prefixed name (same play as tests/endings.ts 'knock')
  'tvm-knock'(w, m, d) {
    const p = w.player;
    if (w.flags.twist === 'open') return go(toward(w, d.x + 8));
    if (Math.abs(p.cx - (d.x + 8)) > 3) return go(toward(w, d.x + 8, 1));
    if (!p.onGround || w.input.jump) return go('');
    m.hold = 7;
    return { move: '', jump: true };
  },
  'tvm-backwash-ride'(w, m, d) {
    const D = d.x / 16;
    const ph = w.flags.backwash as string;
    if (m.go) return go('R');
    if (w.player.cx < px(D - 28.8)) return go('R');
    if (ph === 'in') m.seen = true;
    if (ph === 'back' && m.seen) m.go = true;
    return go('');
  },
  'tvm-oily-feet-coir-mat'(w, m, d) {
    const D = d.x / 16;
    const p = w.player;
    if (p.cx >= px(D - 3.6) && p.cx < px(D - 1) && p.onGround && !m.j) {
      m.j = 1;
      m.hold = 13;
      return { move: 'R', jump: true };
    }
    return go(toward(w, d.x + 8, 1));
  },
};

export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  fair: ['TVM-09', 'TVM-10'],
};
