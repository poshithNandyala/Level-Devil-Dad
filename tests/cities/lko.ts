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

// ================================================================ LKO-06
const room06: Step[] = [
  walkTo(5.9, 200),
  hops([8.5, 10.6, 13.3, 15.6, 18.3, 20.5], 'over each red strip on to plain boards, then up on to the takht'),
  runTo(25.6, 300, 'along the takht, over the board she taps'),
  runTo(31, 300),
];

// ================================================================ LKO-07
const pause = (note = 'pause a moment'): Step => ({ hold: '', until: (w) => w.player.onGround && Math.abs(w.player.vx) < 5, max: 120, note });
const room07: Step[] = [
  runTo(7, 200),
  hop(9, 11.3, 'over the nala'),
  pause('pause before the strollers'),
  runTo(31, 400, 'stroll up: they part'),
];
type LL = { x: number; s: string; done: boolean; lamps: number[] };
const behindLamp = (key: string, passTo: number): Step => ({
  policy: (w) => {
    const l = w.flags[key] as LL;
    const p = w.player;
    if (l.s === 'up' || l.done || !l.lamps.length) return go('R');
    if (p.x > l.x + 8) return go('R');
    // follow, but well back from the swing
    return go(p.cx < l.x - 70 ? 'R' : '');
  },
  until: and(ground, X(passTo)),
  max: 1500,
  note: 'hang back while the ladder swings, go under while he is up',
});

// ================================================================ LKO-08
const room08: Step[] = [
  runTo(18, 500, 'walk through the first arch, over the drain, no hop'),
  hop(21.6, 23, 'through the second arch at a jump, up to the ledge past the well', 30),
  runTo(31.5, 300),
];

// ================================================================ LKO-09
type Fl = { order: (w: World) => { c: string; left: number } };
const redNow = (key: string, need = 1.0) => (w: World) => {
  const o = (w.flags[key]?.f as Fl | undefined)?.order(w);
  return !!o && o.c === 'red' && o.left > need;
};
const redSeen = (key: string) => (w: World) => {
  const f = w.flags[key]?.f as (Fl & { seen: (w: World) => string }) | undefined;
  return !!f && f.seen(w) === 'red' && f.order(w).left > 0.6;
};
const room09: Step[] = [
  walkTo(6.1, 300),
  hops([[8.6, redNow('kabootar')], 11.1, [14.1, redNow('kabootar')], 16.6, [20.1, redNow('kabootar')], 22.6, [26.1, redNow('kabootar')], 28], 'roof to roof, only early in the red'),
  runTo(31.5, 300),
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
  S['LKO-06'] = room06;
  lengthen('LKO-06', 0, []);
  S['LKO-07'] = room07;
  lengthen('LKO-07', 0, []);
  S['LKO-08'] = room08;
  lengthen('LKO-08', 0, []);
  S['LKO-09'] = room09;
  lengthen('LKO-09', 0, []);
}

const naive: Record<string, { steps: Step[]; cause?: string }> = {
  'LKO-02': { steps: [{ hold: 'R', until: done, max: 900, note: 'walk straight in' }], cause: 'lko-pehle' },
  'LKO-03': { steps: [{ hold: 'R', until: done, max: 900, note: 'walk out along the printed vine' }], cause: 'lko-chhapa' },
  'LKO-04': { steps: [runTo(4, 200), hops([7], 'line up on the far edge of the first heap'), { policy: (w) => go(toward(w, px(7) + 9, 1)), until: done, max: 400 }], cause: 'lko-malai' },
  'LKO-05': { steps: [runTo(3.5, 200), hops([6, 9, 12], 'hop along the heaps'), until(done, 300)], cause: 'lko-seekh' },
  'LKO-06': { steps: [{ hold: 'R', until: done, max: 900, note: 'walk across the stage' }], cause: 'lko-chakkar' },
  'LKO-07': { steps: [runTo(7, 200), hop(9, 11.3), { hold: 'R', until: done, max: 900, note: 'on along the arcade at a run' }], cause: 'lko-ganj' },
  'LKO-08': { steps: [runTo(5, 200), hop(7, 9, 'hop the little drain into the arch'), { hold: 'R', until: done, max: 600 }], cause: 'lko-bhool' },
  'LKO-09': { steps: [walkTo(6.1, 300), hops([8.6, 11.1, 14.1, 16.6, 20.1, 22.6, 26.1, 28], 'roof to roof, never mind the flag'), until(done, 300)], cause: 'lko-kabootar' },
};

const fix: Record<string, { steps: Step[]; cause?: string }> = {
  'LKO-02': { steps: [runTo(8.2), until(done, 900, 'bow, and keep bowing')], cause: 'lko-dhakka' },
  'LKO-09': {
    steps: [
      ...room09,
      walkTo(32 + 4.9, 300),
      hops([[32 + 7.6, redSeen('lko09-hawa:k')], 32 + 10.1, [32 + 13.6, redSeen('lko09-hawa:k')], 32 + 16.1, [32 + 19.6, redSeen('lko09-hawa:k')], 32 + 22.1], 'watch the flag, as learned: go on the red you see'),
      until(done, 600),
    ],
    cause: 'lko-kabootar',
  },
  'LKO-08': { steps: [{ hold: 'R', until: done, max: 900, note: 'walk, as learned, through every arch' }], cause: 'lko-kuan' },
  'LKO-07': { steps: [...room07.slice(0, 3), runTo(32 + 8, 400), pause('stroll on, as learned'), runTo(32 + 14, 300), pause(), until(done, 300)], cause: 'lko-shamiyana' },
  'LKO-06': { steps: [walkTo(5.9, 200), hops([8.5, 10.6, 13.3, 15.6, 18.3], 'plain boards only'), { hold: 'R', until: done, max: 600 }], cause: 'lko-tatkar' },
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

actRoutes['lko06-tatkar'] = (x) => {
  const T = (w: World) => w.flags['lko06-tatkar:tap'] as { x: number; v: number };
  return [
    walkTo(x + 2, 300),
    {
      policy: (w) => {
        const t = T(w) as { x: number; v: number; lo: number };
        const p = w.player;
        const gap = t.x - 12 - (p.x + p.w);
        if (!p.onGround) return go('R');
        if (gap < -40) return go('R');
        if (t.v > 0) return go('');
        if (gap >= 30) return go('R');
        if (gap > -2 && t.x - t.lo > 30) return { move: 'R', jump: true };
        return go('');
      },
      until: (w) => w.player.onGround && w.player.x > T(w).x + 14,
      max: 1500,
      note: 'wait for her patch to come at you, then hop clean over it',
    },
    hops([x + 22.6, x + 25.4, x + 26.6, x + 29.4, x + 31], 'over the red strips'),
    runTo(x + 33, 300),
  ];
};

actRoutes['lko07-shaam'] = (x) => [runTo(x + 29, 600, 'run the row, no pause')];
actRoutes['lko07-batti'] = (x) => [behindLamp('lko07-batti:ll1', x + 13), behindLamp('lko07-batti:ll2', x + 37), runTo(x + 39, 300)];
actRoutes['lko07-chauraha'] = (x) => [walkTo(x + 3, 300), hop(x + 5, x + 7.3, 'over the nala'), pause('pause before the strollers'), runTo(x + 31, 600, 'stroll up, then run through')];

actRoutes['lko08-mehrab'] = (x) => [runTo(x + 12, 400, 'on foot through the vault arch'), hop(x + 14.6, x + 17, 'at a jump through the next, up past the well', 30), runTo(x + 29.5, 300)];

actRoutes['lko09-hawa'] = (x) => {
  const ok = redNow('lko09-hawa:k');
  return [
    walkTo(x + 4.9, 300),
    hops([[x + 7.6, ok], x + 10.1, [x + 13.6, ok], x + 16.1, [x + 19.6, ok], x + 22.1, [x + 25.6, ok], x + 28.1, [x + 31.6, ok], x + 33], 'cross while you see white: the birds see red'),
  ];
};

const endingPolicies: Record<string, Policy> = {
  'lko-chhatri'(w, m, d) {
    const D = Math.round(d.x / 16);
    if (!m.h) m.h = hops([D - 11, D - 7.2, [D - 3.6, redNow('chhatri', 1.4)], D - 1.5], 'wait on the roof, cross early in the red').policy!;
    const p = w.player;
    if (p.onGround && p.cx > px(D - 2)) return go(toward(w, d.x + 8, 1));
    return m.h(w);
  },
  'lko-489'(w, _m, d) {
    // walk: over the crack, through the last arch on foot, off the end of the gallery, down to the door
    return go(toward(w, d.x + 8, 1));
  },
  'lko-darban'(w, m, d) {
    const D = Math.round(d.x / 16);
    const p = w.player;
    if (w.flags.twist === 'open') return go(toward(w, d.x + 8, 1));
    if (!m.h) m.h = hop(D - 8, D - 5.6, 'over the nala, early').policy!;
    if (!m.over) {
      if (p.onGround && p.x > px(D - 6)) m.over = 1;
      else return m.h(w);
    }
    if (m.over === 1) {
      if (p.onGround && Math.abs(p.vx) < 5) m.over = 2;
      return go('');
    }
    return go(toward(w, d.x + 8, 1));
  },
  'lko-sam'(w, m, d) {
    const D = Math.round(d.x / 16);
    const p = w.player;
    if (w.flags.twist === 'sam' || w.flags.twist === 'open') return go(toward(w, d.x + 8, 1));
    if (p.onGround && p.y + p.h <= px(13)) return go(toward(w, px(D - 7) + 8, 1));
    if (!m.h) m.h = hops([D - 10.5, D - 7.5], 'up on to the takht').policy!;
    return m.h(w);
  },
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

mistakes['LKO-07'] = [
  {
    what: 'following the lamplighter close behind',
    steps: [...room07, runTo(actX('LKO-07', 1) - 1, 900), { hold: 'R', until: done, max: 900 }],
    cause: 'lko-seedhi',
  },
  {
    what: 'hopping the café nala and going straight in',
    steps: [...room07, ...actRoutes0('lko07-shaam', actX('LKO-07', 0)), ...actRoutes0('lko07-batti', actX('LKO-07', 1)), ...actRoutes0('lko07-chauraha', actX('LKO-07', 2)), runTo(doorX('LKO-07') - 10), hop(doorX('LKO-07') - 8, doorX('LKO-07') - 3), { hold: 'R', until: done, max: 600 }],
    cause: 'lko-darban',
  },
];
mistakes['LKO-08'] = [
  { what: 'in the vault, hopping the drain into the arch', steps: [...room08, runTo(actX('LKO-08') + 1, 300), hop(actX('LKO-08') + 3, actX('LKO-08') + 6), { hold: 'R', until: done, max: 400 }], cause: 'lko-mehrab' },
  { what: 'hopping the crack into the last arch', steps: [...room08, ...actRoutes0('lko08-mehrab', actX('LKO-08')), runTo(doorX('LKO-08') - 8.5, 300), hop(doorX('LKO-08') - 6, doorX('LKO-08') - 2), { hold: 'R', until: done, max: 400 }], cause: 'lko-bhool' },
];

export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  fair: ['LKO-02', 'LKO-03', 'LKO-04', 'LKO-05', 'LKO-06', 'LKO-07', 'LKO-08', 'LKO-09'],
};
void flag;
void actFlag;
void walkTo;
