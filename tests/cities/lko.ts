// Proven routes for Lucknow: every stage's room, its acts and its door, plus the plays that must die.
// Found by tests/city-tests.ts; merged into SOLUTIONS, NAIVE, FIX, MISTAKES, ACT_ROUTES and ENDING_POLICIES.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import { Step, X, and, ground } from '../runner';
import type { CityTests } from '../city-tests';
import { LEVEL_BY_ID } from '../../src/game/levels';

type Move = 'L' | 'R' | '';
type Out = { move: Move; jump: boolean };
type Mem = { hold: number; [k: string]: any };
type Policy = (w: World, m: Mem, d: Door) => Out;
const px = (t: number) => t * 16;
const go = (move: Move): Out => ({ move, jump: false });
const toward = (w: World, x: number, slack = 2): Move => {
  const c = w.player.cx;
  return c < x - slack ? 'R' : c > x + slack ? 'L' : '';
};
const done = (w: World) => w.state !== 'play';
const until = (f: (w: World) => boolean, max = 900, note = ''): Step => ({ hold: '', until: f, max, note });
const runTo = (tx: number, max = 900, note = ''): Step => ({ hold: 'R', until: and(ground, X(tx)), max, note });
const walkTo = (tx: number, max = 900, note = ''): Step => ({ policy: (w) => go(toward(w, px(tx) + 8, 1)), until: (w) => w.player.onGround && Math.abs(w.player.cx - (px(tx) + 8)) <= 2 && Math.abs(w.player.vx) < 1, max, note });
/** run right and hop a gap whose near edge is at tile `gx` (tap jump, taken early enough for a slow thumb) */
const hop = (gx: number, land: number, note = '', lead = 22, hold = 12): Step => {
  let jt = 0;
  let W: World | null = null;
  return {
    policy: (w) => {
      if (W !== w) {
        W = w;
        jt = 0;
      }
      const p = w.player;
      if (jt > 0) {
        jt--;
        return { move: 'R', jump: true };
      }
      if (p.onGround && p.x + p.w >= px(gx) - lead && p.x < px(gx)) {
        jt = hold - 1;
        return { move: 'R', jump: true };
      }
      return go('R');
    },
    until: and(ground, X(land)),
    max: 600,
    note,
  };
};
/** steer in the air to land on x: let go early enough to drift to a stop there (air brakes are soft) */
const airTo = (w: World, x: number): Move => {
  const p = w.player;
  const dx = x - p.cx;
  const stop = (p.vx * p.vx) / 1800 + 2;
  if (dx > 0) return p.vx > 0 && dx < stop ? '' : 'R';
  return p.vx < 0 && -dx < stop ? '' : dx < -2 ? 'L' : '';
};
/** hop from platform to platform: each target is a tile column (its centre), with an optional wait before leaving for it */
const hops = (targets: (number | [number, (w: World) => boolean])[], note = '', hold = 12, reach = 44): Step => {
  let W: World | null = null;
  let i = 0,
    jt = 0;
  const T = targets.map((t) => (Array.isArray(t) ? { c: px(t[0]) + 8, wait: t[1] } : { c: px(t) + 8, wait: null as null | ((w: World) => boolean) }));
  return {
    policy: (w) => {
      if (W !== w) {
        W = w;
        i = 0;
        jt = 0;
      }
      const p = w.player;
      const t = T[Math.min(i, T.length - 1)];
      if (jt > 0) {
        jt--;
        return { move: toward(w, t.c, 1), jump: true };
      }
      if (!p.onGround) return go(airTo(w, t.c));
      if (Math.abs(p.cx - t.c) <= 9) {
        if (i >= T.length - 1) return go(toward(w, t.c, 3));
        const n = T[i + 1];
        if (n.wait && !n.wait(w)) return go('');
        i++;
        jt = hold - 1;
        return { move: toward(w, n.c, 1), jump: true };
      }
      if (t.wait && !t.wait(w)) return go('');
      if (Math.abs(t.c - p.cx) <= 14) return go(toward(w, t.c, 1));
      if (Math.abs(t.c - p.cx) <= reach + Math.abs(p.vx) * 0.13) {
        // a careful player stops at the edge, then jumps
        if (Math.abs(p.vx) > 30) return go('');
        jt = hold - 1;
        return { move: toward(w, t.c, 1), jump: true };
      }
      return go(toward(w, t.c, 1));
    },
    until: (w) => w.player.onGround && Math.abs(w.player.cx - T[T.length - 1].c) <= 9 && i >= T.length - 1,
    max: 2400,
    note,
  };
};
const flag = (k: string) => (w: World) => w.flags[k];
const actFlag = (id: string, k: string) => (w: World) => w.flags[`${id}:${k}`];

// ================================================================ LKO-02
const room02: Step[] = [
  runTo(8.2, 300, 'up to the haveli: the two gentlemen step into the doorway'),
  until((w) => w.flags.pehle?.s === 'offer', 900, 'stand still (a bow): one goes first and the stone drops under him'),
  hop(15, 17.5, 'take the second one’s offer and hop the hole'),
  runTo(31, 400),
];

// ================================================================ LKO-03
const room03: Step[] = [
  runTo(3.5, 200),
  hops([6, [9, (w) => w.flags.chhapa >= 2], 12, 15, 18, 21, 24], 'on to the first flower, wait out both whistles, then flower to flower'),
  hop(25, 27),
  runTo(31, 400),
];

// ================================================================ LKO-04
const lid = (w: World) => w.flags.malai?.lid ?? 0;
const room04: Step[] = [
  runTo(4, 200),
  hops([6, 9, 12], 'on the shady (left) tile of each heap: the sun is on the right'),
  until((w) => lid(w) > 0, 600, 'the halwai starts to lift his lid'),
  { policy: (w) => go(toward(w, px(13), 1)), until: (w) => lid(w) >= 1, max: 300, note: 'straddle the middle of the heap while it goes up' },
  hops([13, 16, 19, 22, 25], 'now the light comes from the left: the right tiles'),
  hop(26, 27.5),
  runTo(31, 300),
];

// ================================================================ LKO-05
const kflat = (key: string, i: number) => (w: World) => (w.flags[key] ?? [])[i]?.flat;
const room05: Step[] = [
  runTo(3.5, 200),
  hops([6, [9, kflat('kebabs', 0)], [12, kflat('kebabs', 1)], [15, kflat('kebabs', 2)], [18, kflat('kebabs', 3)], [21, kflat('kebabs', 4)], [24, kflat('kebabs', 5)], [26.5, kflat('kebabs', 6)]], 'squash each heap, then hop'),
  runTo(31, 300),
];

function solutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  S['LKO-02'] = room02;
  lengthen('LKO-02', 0, []);
  S['LKO-03'] = room03;
  lengthen('LKO-03', 0, []);
  S['LKO-04'] = room04;
  lengthen('LKO-04', 0, []);
  S['LKO-05'] = room05;
  lengthen('LKO-05', 0, []);
}

const naive: Record<string, { steps: Step[]; cause?: string }> = {
  'LKO-02': { steps: [{ hold: 'R', until: done, max: 900, note: 'walk straight in' }], cause: 'lko-pehle' },
  'LKO-03': { steps: [{ hold: 'R', until: done, max: 900, note: 'walk out along the printed vine' }], cause: 'lko-chhapa' },
  'LKO-04': { steps: [runTo(4, 200), hops([7], 'line up on the far edge of the first heap'), { policy: (w) => go(toward(w, px(7) + 9, 1)), until: done, max: 400 }], cause: 'lko-malai' },
  'LKO-05': { steps: [runTo(3.5, 200), hops([6, 9, 12], 'hop along the heaps'), until(done, 300)], cause: 'lko-seekh' },
};

const fix: Record<string, { steps: Step[]; cause?: string }> = {
  'LKO-02': { steps: [runTo(8.2), until(done, 900, 'bow, and keep bowing')], cause: 'lko-dhakka' },
  'LKO-05': { steps: [runTo(3.5, 200), hops([6]), until(done, 600, 'wait on it, to be sure')], cause: 'lko-tawa' },
  'LKO-04': { steps: [runTo(4, 200), hops([6, 9, 12], 'the shady left tiles, as learned'), until(done, 900, 'wait on it')], cause: 'lko-malai' },
  'LKO-03': { steps: [runTo(3.5, 200), hops([6, 7, 9, 12, 13, 15, 17, 18, 21, 22, 24], 'every white tile in turn, jali too', 12, 30), until(done, 600)], cause: 'lko-jali' },
};

const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {
  'LKO-02': [
    {
      what: 'in the gali, walking on when the man offers the way',
      steps: [...room02, { hold: 'R', until: done, max: 900 }],
      cause: 'lko-pehle',
    },
  ],
};

const actX = (id: string, i = 0) => {
  const d = LEVEL_BY_ID.get(id)!;
  return d.parts!.filter((p) => !p.kind.startsWith('_'))[i].x0;
};
const doorX = (id: string) => LEVEL_BY_ID.get(id)!.doorX!;
const actRoutes: Record<string, (x: number) => Step[]> = {
  'lko02-gali': (x) => [
    runTo(x + 4.2, 300, 'the man behind offers the way'),
    until((w) => ['go', 'done'].includes(w.flags['lko02-gali:man']?.s) && w.flags['lko02-gali:man'].s === 'done', 900, 'stand still: he goes first'),
    hop(x + 12, x + 15),
    runTo(x + 30),
  ],
};

actRoutes['lko03-kunda'] = (x) => [runTo(x + 1.5, 300), { hold: 'R', until: and(ground, X(x + 39)), max: 900, note: 'run each print without stopping' }];

actRoutes['lko04-chowk'] = (x) => [
  runTo(x + 1.5, 300),
  hops([x + 4, x + 6, x + 9, x + 12, x + 14], 'cups in the long shadow, quickly: the shadows are shrinking'),
  runTo(x + 18.5, 300),
  hops([x + 20, x + 22, x + 25, x + 28, x + 31]),
  runTo(x + 35, 300),
];

actRoutes['lko05-tawa'] = (x) => {
  const k = 'lko05-tawa:kebabs';
  return [runTo(x + 0.5, 300), hops([x + 3, ...[6, 9, 12, 15, 18, 21, 24, 26.5].map((c, i) => [x + c, kflat(k, i)] as [number, (w: World) => boolean])], 'thin ones at once, thick ones once squashed'), runTo(x + 29.5, 300)];
};
actRoutes['lko05-lane'] = (x) => [
  runTo(x + 1.2, 300),
  hops([x + 3], 'on to the end of the slab'),
  until(kflat('lko05-lane:slab', 0), 300, 'it squashes under you'),
  { hold: 'R', until: and(ground, X(x + 18)), max: 900, note: 'walk the lane right behind the squash, no jumping' },
  runTo(x + 25, 300),
];

const endingPolicies: Record<string, Policy> = {
  'lko-sheermal'(w, m, d) {
    const D = Math.round(d.x / 16);
    const p = w.player;
    if (!m.h && w.flags.twist === 'tandoor') return go(toward(w, px(D - 9) + 6, 1));
    if (!m.h && w.flags.twist === 'slapped') m.h = hops([D - 5.5, D - 1], 'drop on to the sheermal, hop out').policy!;
    if (!m.h) return go('');
    if (p.onGround && p.cx > px(D - 1.5)) return go(toward(w, d.x + 8, 1));
    return m.h(w);
  },
  'lko-kulhad'(w, m, d) {
    const D = Math.round(d.x / 16);
    const p = w.player;
    if (p.onGround && p.y + p.h <= px(11)) return go(toward(w, d.x + 8, 1));
    if (p.cx < px(D - 8) - 4 && p.onGround) return go('R');
    if (!m.h) m.h = hops([D - 5, D - 2, D + 1], 'the right tiles of the steps, then the counter').policy!;
    return m.h(w);
  },
  'lko-bakhiya'(w, m, d) {
    const p = w.player;
    if (m.hold > 0) return { move: toward(w, d.x + 8, 1), jump: true };
    if (p.onGround && p.y + p.h <= px(13)) return go(toward(w, d.x + 8, 1));
    if (p.onGround && p.cx > d.x - 30 && p.cx < d.x + 8) {
      m.hold = 13;
      return { move: 'R', jump: true };
    }
    return go(p.onGround ? toward(w, d.x - 22, 1) : toward(w, d.x + 8, 1));
  },
  'lko-kiwad'(w, _m, d) {
    if (w.flags.twist === 'open') return go(toward(w, d.x + 8, 1));
    return go(toward(w, d.x + 8 - px(4.5), 1));
  },
};

function actRoutes0(id: string, x: number) {
  return actRoutes[id](x);
}

mistakes['LKO-03'] = [
  { what: 'stopping on the jali in the middle of the second vat', steps: [...room03, runTo(actX('LKO-03') + 1.5), runTo(actX('LKO-03') + 18.2), until(done, 400)], cause: 'lko-jali' },
  { what: 'walking to the bright blue printed door', steps: [...room03, runTo(actX('LKO-03') + 1.5), runTo(actX('LKO-03') + 39), { hold: 'R', until: done, max: 900 }], cause: 'lko-chhapa' },
];

mistakes['LKO-04'] = [
  {
    what: 'waiting at the start of the lane while the shadows shrink',
    steps: [...room04, runTo(actX('LKO-04') + 1.5), runTo(actX('LKO-04') + 2.3), { hold: '', ticks: 700 }, hops([actX('LKO-04') + 4, actX('LKO-04') + 6]), until(done, 300)],
    cause: 'lko-malai',
  },
  {
    what: 'at the counter, landing on the left tile of the step (the fire is behind you)',
    steps: [...room04, ...actRoutes0('lko04-chowk', actX('LKO-04')), runTo(doorX('LKO-04') - 9), hops([doorX('LKO-04') - 6]), until(done, 300)],
    cause: 'lko-malai',
  },
];


export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  fair: ['LKO-02', 'LKO-03', 'LKO-04', 'LKO-05'],
};
void flag;
void actFlag;
void walkTo;
