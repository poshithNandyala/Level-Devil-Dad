// Proven routes for Kolkata: every stage's room, its acts and its door, plus the plays that must die.
// Found by tests/city-tests.ts; merged into SOLUTIONS, NAIVE, FIX, MISTAKES, ACT_ROUTES and ENDING_POLICIES.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import type { Thing } from '../../src/game/entities/traps';
import { COURSES, TOUR } from '../../src/game/levels/tour';
import { Step, X, and, done, ground } from '../runner';
import type { CityTests } from '../city-tests';
import { Bus } from '../../src/game/cities/ccu/entities';
import type { Stack } from '../../src/game/cities/ccu/books';
import type { Tram } from '../../src/game/cities/ccu/tram';
import { Porter } from '../../src/game/cities/ccu/porters';

type Move = 'L' | 'R' | '';
type Out = { move: Move; jump: boolean };
type Mem = { hold: number; [k: string]: any };
type Policy = (w: World, m: Mem, d: Door) => Out;
const px = (t: number) => t * 16;
const FLOOR = 240;
const go = (move: Move): Out => ({ move, jump: false });
const toward = (w: World, x: number, slack = 2): Move => {
  const c = w.player.cx;
  return c < x - slack ? 'R' : c > x + slack ? 'L' : '';
};
const walk = (to: number, note?: string, max = 900): Step => ({ hold: 'R', until: and(ground, X(to)), max, note });
const hopAt = (at: number, ticks: number, note: string): Step[] => [{ hold: 'R', until: X(at), max: 900 }, { hold: 'R', jump: ticks, ticks, note }, { hold: 'R', until: ground, max: 300 }];

// ------------------------------------------------------------------ CCU-01: the tour
const ferryOf = (w: World) => w.entities.find((e: any) => e.ferry) as unknown as Thing;
/** the welcome tour, piece by piece; at the parked thela `thela` says how it's passed */
function tourRun(thela: 'off' | 'onto' | 'long'): Step[] {
  const steps: Step[] = [];
  for (const s of COURSES.CCU) {
    if (s.k === 'ditch') steps.push(...hopAt(s.x - 1.6, 12, 'the kerb ditch'));
    else if (s.k === 'steps') for (let i = 0; i < s.n; i++) steps.push(...hopAt(s.x + i * s.run - 1.3, 12, 'a Maidan step'));
    else if (s.k === 'posts') for (let i = 0; i < s.n; i++) steps.push(...hopAt(s.x + 3 * i - 1.4, 12, 'a post'));
    else if (s.k === 'parked') {
      if (thela === 'off')
        steps.push(
          { hold: 'R', until: X(s.x - 1.4), max: 900 },
          { hold: 'R', jump: 12, ticks: 12, note: 'up on to the thela' },
          { hold: 'R', until: (w) => w.player.onGround && w.player.y < 222, max: 300 },
          { hold: 'R', jump: 12, ticks: 12, note: 'and a hop down off it' },
          { hold: 'R', until: (w) => w.player.onGround && w.player.y > 222, max: 400 },
        );
      else if (thela === 'long') steps.push({ hold: 'R', until: X(s.x - 1.6), max: 900 }, { hold: 'R', jump: 34, ticks: 34, note: 'a long jump over the thela', long: true }, { hold: 'R', until: (w) => w.player.onGround && w.player.y > 222, max: 400 });
      else
        steps.push(
          { hold: 'R', until: X(s.x - 1.2), max: 900 },
          { hold: 'R', jump: 12, until: (w) => w.player.cx >= px(s.x + 1.3), max: 80, note: 'up on to the thela' },
          { hold: '', until: (w) => w.player.onGround, max: 300 },
          { hold: '', ticks: 24, note: 'a breath on top' },
          { hold: 'R', until: (w) => w.player.onGround && w.player.y > 222, max: 300, note: 'walk off it on to the rail' },
          walk(68.6, 'along the rail'),
          { hold: 'R', jump: 12, ticks: 12, note: 'over the trench' },
          { hold: 'R', until: ground, max: 300 },
        );
    } else if (s.k === 'ferry') {
      const sw = 3;
      steps.push(
        { hold: 'R', until: X(s.x - 1.2), max: 900 },
        { hold: '', until: (w) => { const f = ferryOf(w); return f.state === 'rest' && f.x === s.x * 16; }, max: 900, note: 'wait for the tram' },
        { hold: 'R', until: (w) => w.standing(ferryOf(w).solid) && w.player.x >= ferryOf(w).x + 10, max: 200, note: 'step aboard' },
        { hold: '', until: (w) => { const f = ferryOf(w); return f.state === 'rest' && f.x === (s.x + s.w - sw) * 16; }, max: 900, note: 'ride across' },
        { hold: 'R', until: X(s.x + s.w + 0.4), max: 200, note: 'step off' },
      );
    }
  }
  steps.push(walk(TOUR.deck[0] - 1.6), { hold: 'R', jump: 12, ticks: 12, note: 'up on the deck' }, { hold: 'R', until: ground, max: 200 }, { hold: 'R', until: done, max: 900 });
  return steps;
}

// ------------------------------------------------------------------ CCU-02: the bus
const buses = (w: World) => w.entities.filter((e) => e instanceof Bus) as Bus[];
const onBus = (w: World) => buses(w).some((b) => !b.gone && w.player.isRiding(b.deck) && w.player.onGround);
/** ride the bus till it crawls with its footboard over [x0, x1), then walk off forwards */
const ride = (x0: number, x1: number, note: string): Step[] => [
  { hold: '', until: (w) => buses(w).some((b) => b.crawling() && b.v < 30 && b.x >= x0 && b.x < x1), max: 1800, note },
  { hold: 'R', until: (w) => w.player.onGround && !onBus(w), max: 300, note: 'walk off forwards' },
];


// ------------------------------------------------------------------ hopping
/** a hop that lets go of the run once Dad is over x (px), so he comes down on what's there */
const hopTo = (x: number, jt: number, note: string): Step[] => [
  { hold: 'R', jump: jt, until: (w) => w.player.cx >= x, max: 90, note },
  { hold: '', until: ground, max: 200 },
];
/** walk right, and hop every gap in the floor ahead */
function hopGaps(): (w: World) => Out {
  let W: World | null = null;
  let jt = 0;
  return (w) => {
    if (W !== w) {
      W = w;
      jt = 0;
    }
    const p = w.player;
    if (jt > 0) {
      jt--;
      return { move: 'R', jump: true };
    }
    if (p.onGround && !w.solidAt(p.x + p.w + 9, p.y + p.h + 1, 3, 3)) {
      jt = 11;
      return { move: 'R', jump: true };
    }
    if (p.onGround && w.solidAt(p.x + p.w + 2, p.y + 2, 1, p.h - 4)) {
      jt = 12;
      return { move: 'R', jump: true };
    }
    return go('R');
  };
}


// ------------------------------------------------------------------ CCU-07: the porters
const porters = (w: World) => w.entities.filter((e) => e instanceof Porter) as Porter[];
const riding = (w: World) => porters(w).find((p) => p.riding(w));
/** stand under (or beside) a load and hop straight up on to it as it comes over */
const hopUp = (pick: (w: World) => Porter | undefined, note: string): Step => {
  let hold = 0;
  let W: World | null = null;
  return {
    policy: (w) => {
      if (W !== w) {
        W = w;
        hold = 0;
      }
      if (hold > 0) {
        hold--;
        return { move: '', jump: true };
      }
      const p = pick(w);
      // jump a little before it's overhead: it'll be there by the time Dad is up
      const on = riding(w);
      const vel = (q?: Porter) => (q && q.state === 'walk' ? q.o.v : 0);
      const lead = (vel(p) - vel(on)) * 0.22;
      if (p && w.player.onGround && Math.abs(w.player.cx - p.x - lead) < 5 && !p.riding(w)) {
        hold = 12;
        return { move: '', jump: true };
      }
      return go('');
    },
    until: (w) => !!pick(w)?.riding(w),
    max: 1800,
    note,
  };
};
const ahead = (w: World, v: number, h: number) => porters(w).find((p) => p.o.v === v && p.o.h === h && p.state === 'walk');
function howrahRoom(): Step[] {
  return [
    { hold: 'R', until: (w) => w.player.cx >= px(5) - 1, max: 300 },
    hopUp((w) => porters(w).find((p) => p.o.v === 40), 'up on the first load'),
    hopUp((w) => ahead(w, 60, 54), 'up on the tall porter’s load as he comes past, before the CHA board'),
    { hold: '', until: (w) => w.player.cx > px(29), max: 1800 },
    { hold: 'R', until: (w) => w.player.onGround && !riding(w), max: 200, note: 'off on to the pylon' },
  ];
}
const girderRoute = (x: number): Step[] => [
  { hold: 'R', until: X(x - 0.2), max: 300 },
  ...hopTo(px(x + 2), 10, 'up the pylon step'),
  walk(x + 2.4),
  ...hopTo(px(x + 5), 10, 'up on the tall porter by the pylon'),
  { hold: '', until: (w) => { const a = riding(w), b = porters(w).find((p) => p.o.v === 66); return !!a && !!b && b.x - a.x > 22 && b.x - a.x < 40; }, max: 1800, note: 'till the short porter is just ahead, under you' },
  { hold: 'R', until: (w) => !!riding(w) && riding(w)!.o.v === 66, max: 200, note: 'walk off the front on to his load' },
  { hold: '', until: (w) => w.player.cx > px(x + 48.5), max: 1800 },
  { hold: 'R', until: (w) => w.player.onGround && !riding(w), max: 200, note: 'off on to the second pylon' },
];

function solutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  S['CCU-01'] = tourRun('onto');
  S['CCU-02'] = [...ride(px(25), px(28.5), 'past the first “aaste” (over the drain), off on the second'), walk(30)];
  lengthen('CCU-02', 0, []);
  S['CCU-06'] = [
    walk(2.4),
    ...hopTo(px(5), 12, 'over the stop’s step'),
    { hold: 'R', until: (w) => w.player.onGround && w.player.y > 222 && w.player.cx > px(6.6), max: 300 },
    ...hopTo(px(7) + 12, 8, 'on to the tram’s rear step'),
    { hold: '', until: X(32.5), max: 2400, note: 'ride the step through the junction' },
  ];
  lengthen('CCU-06', 0, []);
  S['CCU-07'] = howrahRoom();
  lengthen('CCU-07', 0, []);
  S['CCU-04'] = boiRoute(true);
  lengthen('CCU-04', 0, []);
}
/** CCU-04: on to the first stack, over the pointed single, then straight on to the pointed double */
function boiRoute(skip: boolean, wait = 0): Step[] {
  return [
    walk(4.6),
    ...hopTo(px(8), 12, 'up on the first stack'),
    { hold: '', ticks: 10 },
    ...(skip ? hopTo(px(12.8), 16, 'over the pointed one-book stack') : [...hopTo(px(10.5), 10, 'on to the pointed one-book stack'), ...hopTo(px(12.8), 10, 'on')]),
    ...(wait ? [{ hold: '' as const, ticks: wait, note: 'wait for the pointed one to go' }] : []),
    ...hopTo(px(16.8), 12, 'on to the pointed stack of two: it drops one and holds'),
    ...hopTo(px(20.8), 12, 'the single nobody wants'),
    ...hopTo(px(24.8), 12, 'up on the last stack'),
    ...hopTo(px(29), 12, 'and off on to the pavement'),
    walk(30),
  ];
}

/** the obvious play per stage, and the cause it must die of */
const naive: Record<string, { steps: Step[]; cause?: string }> = {
  'CCU-01': { steps: tourRun('long'), cause: 'ccu-rail' },
  'CCU-04': { steps: boiRoute(false), cause: 'ccu-boi' },
  'CCU-07': { steps: [howrahRoom()[0], howrahRoom()[1], { hold: '', until: done, max: 3000, note: 'ride him all the way' }], cause: 'ccu-cha' },
  'CCU-06': {
    steps: [walk(2.4), ...hopTo(px(4.5), 12, 'up the stop’s step'), ...hopTo(px(5.8), 10, 'up on the platform'), { hold: 'R', until: (w) => tramA(w).riding(w) && w.player.cx > px(8), max: 300, note: 'on to the roof' }, { hold: '', until: done, max: 2400 }],
    cause: 'ccu-dando',
  },
  'CCU-02': { steps: [{ hold: '', until: (w) => w.player.cx > px(9), max: 900, note: 'wait for the stop' }, { hold: 'R', until: (w) => w.state !== 'play', max: 300, note: 'step off at the BUS STOP sign' }], cause: 'ccu-gir' },
};

/** the obvious correction after the first death, which dies too */
const fix: Record<string, { steps: Step[]; cause?: string }> = {
  'CCU-04': { steps: boiRoute(true, 300), cause: 'ccu-boi' },
  'CCU-07': { steps: [howrahRoom()[0], howrahRoom()[1], hopUp((w) => porters(w).find((p) => p.o.v < 0), 'jump for the first load that comes by'), { hold: '', until: done, max: 900 }], cause: 'ccu-bojha' },
  'CCU-06': { steps: [walk(2.4), ...hopTo(px(5), 12, 'over the stop’s step'), { hold: 'R', until: (w) => w.player.onGround && w.player.y > 222 && w.player.cx > px(6.6), max: 300 }, ...hopTo(px(7) + 12, 8, 'on to the rear step'), { hold: '', until: done, max: 4000, note: 'stay on the step, past the island' }], cause: 'ccu-points' },
  'CCU-02': { steps: [...ride(px(16), px(19.5), 'off on the first “aaste”'), { hold: 'R', until: (w) => w.state !== 'play', max: 300 }], cause: 'ccu-nala' },
};

/** more scripted first-timer deaths and 'like last time' moves */
const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {
  'CCU-07': [{ what: 'taking the porter who leaves the second pylon at once', steps: [...howrahRoom(), ...girderRoute(32), walk(80 + 3.9), ...hopTo(px(86.4), 10, 'up the pylon step'), { hold: 'R', until: (w) => !!riding(w), max: 200, note: 'and on to the waiting porter' }, { hold: '', until: done, max: 1800 }], cause: 'ccu-cha' }],
  'CCU-01': [{ what: 'up on the thela and a hop down off it, on to the rail', steps: tourRun('off'), cause: 'ccu-rail' }],
  'CCU-02': [
    {
      what: 'stepping off backwards on the crawl',
      steps: [{ hold: '', until: (w) => buses(w).some((b) => b.crawling() && b.v < 30 && b.x >= px(25)), max: 1800 }, { hold: 'L', until: (w) => w.state !== 'play', max: 300 }],
      cause: 'ccu-ulto',
    },
  ],
};

/** a route for each act, by act id */
const tramA = (w: World) => w.flags.tramA as Tram;
const tramB = (w: World) => w.flags.tramB as Tram | undefined;
const actRoutes: Record<string, (x: number) => Step[]> = {
  'ccu07-girder': girderRoute,
  'ccu07-pylon': (x) => [walk(x + 3.9), ...hopTo(px(x + 6.4), 10, 'up the pylon step'), hopUp((w) => ahead(w, 55, 54), 'wait for the tall porter, and up on his load'), { hold: '', until: X(x + 40.6), max: 1800, note: 'ride him to Howrah' }],
  'ccu06-points': (x) => [
    { hold: '', until: (w) => tramA(w).state === 'stop' && w.player.cx > px(x + 4), max: 1800, note: 'ride to the island stop' },
    { hold: 'R', until: and(ground, X(x + 8.2)), max: 300, note: 'off at the island: the points are set for the other line' },
    { hold: '', until: (w) => !!tramB(w) && tramB(w)!.state === 'stop', max: 2400, note: 'wait for the tram on the straight line' },
    { hold: 'L', until: (w) => w.player.cx < tramB(w)!.step.x + 14, max: 300 },
    { hold: '', jump: 8, until: (w) => tramB(w)!.onStep(w), max: 120, note: 'up on to its step' },
    { hold: '', until: (w) => tramB(w)!.state === 'end', max: 3000, note: 'through the second junction, to the end of the line' },
  ],
};

/** a policy for each door ending, by kind */
const SETHOP = hopGaps();
const endingPolicies: Record<string, Policy> = {
  'ccu-arch'(w, _m, d) {
    const k = w.flags.arch as { D: number };
    const p = w.player;
    if (riding(w)) return go(p.cx > px(k.D - 2.6) ? 'R' : '');
    return go(p.onGround ? toward(w, d.x + 8, 1) || 'R' : '');
  },
  'ccu-pole-turn'(w, m, d) {
    const p = w.player;
    if (m.hold > 0) return { move: 'R', jump: true };
    const b = tramB(w);
    if (w.flags.twist !== 'turned') return go('');
    if (b && b.onStep(w)) {
      m.hold = 10;
      return { move: 'R', jump: true };
    }
    return go(p.onGround ? toward(w, d.x + 8, 1) || 'R' : 'R');
  },
  'ccu-set'(w) {
    const k = w.flags.ccuSet as { st: Stack[]; edge: number; D: number };
    const p = w.player;
    if (w.flags.twist !== 'back') return go(p.onGround ? toward(w, k.edge - 30, 2) : '');
    return SETHOP(w);
  },
  'ccu-stop'(w, m) {
    const k = w.flags.ccuStop as { bus: Bus; stop: number[]; D: number } | undefined;
    const p = w.player;
    if (m.hold > 0) return { move: '', jump: true };
    if (!k) return go('R');
    const b = k.bus;
    if (onBus(w)) return go(p.cx > px(k.D - 1.5) ? 'R' : '');
    if (p.cx > px(k.D - 2)) return go(toward(w, px(k.D) + 8, 1) || 'R');
    const mid = (k.stop[0] + k.stop[1]) / 2;
    if (Math.abs(p.cx - mid) > 3) return go(toward(w, mid, 2));
    // waiting still: hop as the crawling footboard is about to reach me
    if (b.slowed && b.v < 30 && b.deck.x <= p.x - 1 && b.deck.x + b.deck.w >= p.x + p.w + 1 && p.onGround) {
      m.hold = 10;
      return { move: '', jump: true };
    }
    return go('');
  },
};

export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  fair: ['CCU-02', 'CCU-04', 'CCU-06', 'CCU-07'],
};
