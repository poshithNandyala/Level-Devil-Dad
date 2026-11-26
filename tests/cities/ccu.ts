// Proven routes for Kolkata: every stage's room, its acts and its door, plus the plays that must die.
// Found by tests/city-tests.ts; merged into SOLUTIONS, NAIVE, FIX, MISTAKES, ACT_ROUTES and ENDING_POLICIES.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import type { Thing } from '../../src/game/entities/traps';
import { COURSES, TOUR } from '../../src/game/levels/tour';
import { Step, X, and, done, ground } from '../runner';
import type { CityTests } from '../city-tests';
import { Bus } from '../../src/game/cities/ccu/entities';

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

function solutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  S['CCU-01'] = tourRun('onto');
  S['CCU-02'] = [...ride(px(25), px(28.5), 'past the first “aaste” (over the drain), off on the second'), walk(30)];
  lengthen('CCU-02', 0, []);
}

/** the obvious play per stage, and the cause it must die of */
const naive: Record<string, { steps: Step[]; cause?: string }> = {
  'CCU-01': { steps: tourRun('long'), cause: 'ccu-rail' },
  'CCU-02': { steps: [{ hold: '', until: (w) => w.player.cx > px(9), max: 900, note: 'wait for the stop' }, { hold: 'R', until: (w) => w.state !== 'play', max: 300, note: 'step off at the BUS STOP sign' }], cause: 'ccu-gir' },
};

/** the obvious correction after the first death, which dies too */
const fix: Record<string, { steps: Step[]; cause?: string }> = {
  'CCU-02': { steps: [...ride(px(16), px(19.5), 'off on the first “aaste”'), { hold: 'R', until: (w) => w.state !== 'play', max: 300 }], cause: 'ccu-nala' },
};

/** more scripted first-timer deaths and 'like last time' moves */
const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {
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
const actRoutes: Record<string, (x: number) => Step[]> = {};

/** a policy for each door ending, by kind */
const endingPolicies: Record<string, Policy> = {
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
  fair: ['CCU-02'],
};
