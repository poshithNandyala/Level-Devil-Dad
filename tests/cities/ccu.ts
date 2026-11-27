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
import { BookPorter, Porter } from '../../src/game/cities/ccu/porters';
import type { Tin } from '../../src/game/cities/ccu/muri';
import { Figure, type BigFigure } from '../../src/game/cities/ccu/kumartuli';
import type { Adda, TeaSeller, Wash } from '../../src/game/cities/ccu/adda';
import type { ClothPanel } from '../../src/game/cities/ccu/pandal';

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
/** a hop steered like a person does it: jump, and lean towards the spot (x, px) you want to land on */
function steerHop(x: number, jt: number, note: string, long = false): Step {
  let W: World | null = null;
  let t = 0,
    up = false;
  return {
    policy: (w) => {
      if (W !== w) {
        W = w;
        t = 0;
        up = false;
      }
      t++;
      if (!w.player.onGround) up = true;
      return { move: toward(w, x, 2), jump: t <= jt };
    },
    until: (w) => up && w.player.onGround,
    max: 200,
    note,
    long,
  };
}
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
  { hold: 'R', until: (w) => w.player.onGround && !riding(w), max: 200, note: 'off on to the pylon' },
];


// ------------------------------------------------------------------ CCU-08: the rok
/** walk on along the rok, never stopping, and hop each sheet of water as it comes */
function hopWater(): (w: World) => Out {
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
    const p = w.player;
    const wash = w.flags.rokWash as Wash | undefined;
    const near = wash?.waves.some((v) => v.x - 12 - (p.x + p.w) < 44 && v.x + 12 > p.x);
    if (p.onGround && near) {
      jt = 12;
      return { move: 'R', jump: true };
    }
    return go('R');
  };
}
const addaRoute = (): Step[] => [walk(2.6), ...hopTo(px(5), 12, 'up on the rok'), { hold: 'R', until: X(32.2), max: 600, note: 'straight through the adda, never stopping' }];


// ------------------------------------------------------------------ CCU-09: the pandal
const pandalStart = (): Step[] => [
  walk(1.6),
  steerHop(px(3.5), 12, 'up the bamboo step'),
  steerHop(px(6), 10, 'on to the first bamboo'),
  steerHop(px(10), 10, 'the second: a panel goes up over the third'),
];
const pandalRoute = (wait = 0): Step[] => [
  ...pandalStart(),
  steerHop(px(14), 34, 'a full jump on to the top of the new cloth', true),
  steerHop(px(18), 10, 'down to the next bamboo: a panel goes up over the one after'),
  steerHop(px(22), 34, 'a full jump on to its top', true),
  ...(wait ? [{ hold: '' as const, ticks: wait, note: 'stay on the cloth' }] : []),
  steerHop(px(25.3), 10, 'and off at once, before they tie the next panel above it'),
  steerHop(px(29.5), 12, 'on to the deck'),
  walk(31.4),
];

// ------------------------------------------------------------------ CCU-10: the finale
const book = (w: World) => w.flags.book as { b1: BookPorter; b2: BookPorter };
const finaleRoom = (): Step[] => [
  { hold: 'R', until: (w) => w.player.cx >= px(5) - 1, max: 300 },
  hopUp((w) => book(w).b1, 'up on the porter with one bundle'),
  hopUp((w) => (book(w).b2.state === 'walk' ? book(w).b2 : undefined), 'up on the porter with three as he passes'),
  { hold: '', until: (w) => w.player.cx > px(28.8), max: 1800, note: 'ride him while they buy two of his bundles' },
  { hold: 'R', until: (w) => w.player.onGround && !riding(w), max: 200, note: 'off on to the far kerb' },
];
/** stand still at a bus stop, and hop on as the crawling bus's footboard comes under you */
function boardAtStop(get: (w: World) => { bus: Bus; stop: number[] }): Step {
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
      const { bus: b, stop } = get(w);
      const p = w.player;
      const mid = (stop[0] + stop[1]) / 2;
      if (Math.abs(p.cx - mid) > 3) return go(toward(w, mid, 2));
      if (b.slowed && b.v < 45 && b.deck.x <= p.x - 1 && b.deck.x + b.deck.w >= p.x + p.w + 1 && p.onGround) {
        hold = 10;
        return { move: '', jump: true };
      }
      return go('');
    },
    until: onBus,
    max: 2400,
    note: 'wait still at the stop, and on to the footboard',
  };
}


// ------------------------------------------------------------------ CCU-03: the jhalmuri tin
/** across a shaken tin, peanut to peanut: on the rim till the first shake shows them, on a peanut through
 *  every shake (hopping on to the next one if a chilli comes up under you), along the muri in between */
function crossTin(key: string, toX: number, opts: { stay?: boolean } = {}): Step {
  let W: World | null = null;
  let jt = 0,
    tgt = 0;
  return {
    policy: (w) => {
      if (W !== w) {
        W = w;
        jt = 0;
      }
      const t = w.flags[key] as Tin;
      const p = w.player;
      if (jt > 0) {
        jt--;
        return { move: toward(w, tgt, 1), jump: true };
      }
      if (!p.onGround) return go(toward(w, tgt, 2));
      const ph = t.phase(w);
      const nuts = t.nuts.filter((n) => n.up && !n.gone);
      const on = nuts.find((n) => p.isRiding(n.solid));
      const inTin = p.cx > t.o.x0 + 4;
      if (!inTin && (t.shakes === 0 || ph !== 'calm' || t.untilTell(w) < 1.05)) return go(toward(w, t.o.x0 - 16, 2));
      const next = nuts.find((n) => n.x + 4 > p.cx);
      // a chilli coming up under me: on to the next peanut now
      if (on && t.chilli && Math.abs(t.chilli.x - on.x) < 4 && !opts.stay) {
        tgt = next ? next.x + 12 : t.o.x1 + 12;
        jt = 13;
        return { move: 'R', jump: true };
      }
      const hopNext = (): Out => {
        if (next && Math.abs(p.cx - (next.x + 12)) < 26) {
          tgt = next.x + 12;
          jt = 8;
          return { move: 'R', jump: true };
        }
        return go('R');
      };
      // on the muri: keep going for the next peanut whatever the tin is doing
      if (!on) return next || p.cx > t.o.x0 + 4 ? hopNext() : go('R');
      if (ph !== 'calm') return go(toward(w, on.x + 12, 5));
      // on a peanut and calm: leave only with time to reach the next before the tell
      if (t.untilTell(w) > 1.05) return next ? hopNext() : go('R');
      return go(toward(w, on.x + 12, 5));
    },
    until: and(ground, (w) => w.player.cx > toX),
    max: 3000,
    note: 'peanut to peanut across the tin',
  };
}


// ------------------------------------------------------------------ CCU-05: Kumartuli
const figAt = (w: World, c: number) => w.entities.find((e) => e instanceof Figure && Math.abs((e as Figure).o.x - px(c)) < 2) as Figure;
/** walk off the edge of the figure you're on, down on to the (dry) one beside it */
const walkOnto = (c: number, note: string): Step => ({ hold: 'R', until: (w) => figAt(w, c).riding(w) && w.player.cx > px(c) + 8, max: 120, note });
function kumartuliRoute(jumpDry = false, waitOnHorse = 0): Step[] {
  return [
    walk(2.6),
    steerHop(px(6), 12, 'on to the first figure'),
    steerHop(px(8.8), 12, 'up on the horse (painted past the waist: don’t stay)'),
    ...(waitOnHorse ? [{ hold: '' as const, ticks: waitOnHorse, note: 'rest on the horse' }] : []),
    jumpDry ? steerHop(px(10.8), 10, 'a hop down on to the pale one') : walkOnto(10, 'walk off on to the dry pale one'),
    steerHop(px(13.8), 12, 'up on the next'),
    { hold: 'R', until: X(14.2), max: 120 },
    steerHop(px(17.8), 14, 'up on the tall horse, and straight off it'),
    { hold: 'R', until: X(18.2), max: 120 },
    steerHop(px(20.6), 10, 'down on to the next'),
    walkOnto(22, 'walk off on to the dry one'),
    { hold: 'R', until: X(22.8), max: 120 },
    steerHop(px(26.8), 12, 'across to the last'),
    { hold: 'R', until: X(26.8), max: 120 },
    steerHop(px(30.8), 10, 'down on to the lane'),
  ];
}


/** CCU-07 act 2: off the short porter on to the overtaking tall one, never while an oncoming load is overhead */
const clearOverhead = (w: World) => !porters(w).some((p) => p.o.v < 0 && p.state === 'walk' && p.x - w.player.cx < 80 && p.x - w.player.cx > -30);
const duiRoute = (x: number): Step[] => [
  ...hopTo(px(x + 2), 10, 'up the pylon step'),
  { hold: 'R', until: (w) => !!riding(w) && riding(w)!.o.v === 45, max: 300, note: 'walk off on to the short porter' },
  { ...hopUp((w) => (clearOverhead(w) ? ahead(w, 78, 54) : undefined), 'up on the tall porter as he overtakes, with nothing coming over'), until: (w) => !!porters(w).find((p) => p.o.v === 78)?.riding(w), max: 2400 },
  { hold: '', until: (w) => w.player.cx > px(x + 44.5), max: 2400, note: 'ride him to the next pylon' },
  { hold: 'R', until: (w) => w.player.onGround && !riding(w), max: 200, note: 'off on to the pylon' },
];


/** CCU-07 relay acts: porter 1 from the pylon, then 2, then 3 (told apart by speed), to the next pylon */
const nearAct = (x: number) => (p: Porter) => p.o.x >= px(x - 13) && p.o.x <= px(x + 6);
function relayRoute(x: number, v: [number, number, number], tallFirst: boolean): Step[] {
  const by = (sp: number) => (w: World) => porters(w).find((p) => p.o.v === sp && nearAct(x)(p));
  const under = (from: number, to: number): Step[] => [
    { hold: '', until: (w) => { const a = by(from)(w), b = by(to)(w); return !!a && !!b && a.riding(w) && !porters(w).some((o) => o.o.v < 0 && o.state === 'walk' && o.x - w.player.cx < 70 && o.x - w.player.cx > -10) && b.x - a.x > 20 && b.x - a.x < 34; }, max: 2400, note: 'till the short porter is just ahead, under you' },
    { hold: 'R', until: (w) => !w.player.onGround || !!by(to)(w)?.riding(w), max: 200, note: 'step off the front' },
    { hold: '', until: (w) => !!by(to)(w)?.riding(w), max: 200, note: 'and drop on to his load' },
  ];
  const up = (to: number): Step => ({ ...hopUp((w) => (clearOverhead(w) && by(to)(w)?.state === 'walk' ? by(to)(w) : undefined), 'up on the tall one as he overtakes, nothing coming over'), until: (w) => !!by(to)(w)?.riding(w), max: 2400 });
  // on to the pylon step, whether you came in off a tall load or along the kerb
  let hold = 0;
  let W: World | null = null;
  const onStep: Step = {
    policy: (w) => {
      if (W !== w) {
        W = w;
        hold = 0;
      }
      const p = w.player;
      if (hold > 0) {
        hold--;
        return { move: toward(w, px(x + 2), 2), jump: true };
      }
      if (!p.onGround) return go(toward(w, px(x + 2), 2));
      if (p.y + p.h > px(13) && p.cx > px(x) - 10) {
        hold = 10;
        return { move: 'R', jump: true };
      }
      return go(toward(w, px(x + 2), 2));
    },
    until: (w) => w.player.onGround && w.player.y + w.player.h === px(13) && Math.abs(w.player.cx - px(x + 2)) < 6,
    max: 600,
    note: 'up the pylon step',
  };
  return [
    onStep,
    ...(tallFirst ? [walk(x + 2.4), ...hopTo(px(x + 5), 10, 'up on the tall porter')] : [{ hold: 'R' as const, until: (w: World) => !!by(v[0])(w)?.riding(w), max: 300, note: 'walk off on to the short porter' }]),
    ...(tallFirst ? under(v[0], v[1]) : [up(v[1])]),
    ...(tallFirst ? [up(v[2])] : under(v[1], v[2])),
    { hold: '', until: (w) => w.player.cx > px(x + 59.6) || (w.player.onGround && !riding(w)), max: 2400, note: 'ride him to the next pylon' },
    { hold: 'R', until: (w) => w.player.onGround && !riding(w), max: 200, note: 'off on to the pylon' },
  ];
}


// ------------------------------------------------------------------ CCU-06 helpers
const S06 = (): Step[] => [
  walk(2.4),
  ...hopTo(px(5), 12, 'over the stop’s step'),
  { hold: 'R', until: (w) => w.player.onGround && w.player.y > 222 && w.player.cx > px(6.6), max: 300 },
  ...hopTo(px(7) + 12, 8, 'on to the tram’s rear step'),
  { hold: '', until: X(32.5), max: 2400, note: 'ride the step through the junction' },
];
const tramA6 = (w: World) => w.flags.tramA as Tram;
const tramB6 = (w: World) => w.flags.tramB as Tram | undefined;
const ACT06 = (x: number): Step[] => [
  { hold: '', until: (w) => tramA6(w).state === 'stop' && w.player.cx > px(x + 4), max: 1800, note: 'ride to the island stop' },
  { hold: 'R', until: and(ground, X(x + 8.2)), max: 300, note: 'off at the island: the points are set for the other line' },
  { hold: '', until: (w) => !!tramB6(w) && tramB6(w)!.state === 'stop', max: 2400, note: 'wait for the tram on the straight line' },
  { hold: 'L', until: (w) => w.player.cx < tramB6(w)!.step.x + 14, max: 300 },
  { hold: '', jump: 8, until: (w) => tramB6(w)!.onStep(w), max: 120, note: 'up on to its step' },
  { hold: '', until: (w) => w.player.cx > px(x + 44.5), max: 3000, note: 'through the second junction' },
];


// ------------------------------------------------------------------ CCU-05 carry acts
const bigAt = (w: World, s0: number) => (w.flags.bigs as BigFigure[]).find((b) => Math.abs(b.solid.x - px(s0 + 3)) < 4 || (b.state !== 'wait' && b.stopX === px(s0 + 14.5)))!;
function carrySeg(s0: number, early = false): Step[] {
  return [
    walk(s0 + 0.4),
    steerHop(px(s0 + 2.5), 12, 'up on the step'),
    steerHop(px(s0 + 4.2), 12, 'on to the figure’s head'),
    early
      ? { hold: 'R', until: (w) => bigAt(w, s0).state === 'carry' && w.player.cx > px(s0 + 7), max: 1200, note: 'and off as soon as it moves' }
      : { hold: '', until: (w) => bigAt(w, s0).state === 'down', max: 1800, note: 'wait for the paint to reach the crown, and ride it across' },
    { hold: 'R', until: and(ground, X(s0 + 21.4)), max: 400, note: 'off on to the landing' },
    { hold: 'R', until: (w) => w.player.onGround && w.player.y + w.player.h > px(12), max: 200, note: 'down off the landing' },
  ];
}
const carryRoute = (x: number, n: number, lastDown = true): Step[] => Array.from({ length: n }, (_, k) => carrySeg(x + 22 * k).slice(0, k === n - 1 && !lastDown ? 5 : 6)).flat();


// ------------------------------------------------------------------ CCU-08 broken-rok acts
type RokSeg = { a: Adda; t: TeaSeller; plank: { collidable: boolean } };
function brokenRoute(id: string, x: number, segs: [number, number, number, number, number][], climb = true): Step[] {
  const seg = (k: number) => (w: World) => (w.flags[id] as RokSeg[])[k];
  return [
    ...(climb ? [walk(x - 1.8), steerHop(px(x + 0.8), 12, 'up on the rok')] : []),
    ...segs.flatMap(([a0, a1, , g1], k): Step[] => [
      walk(x + (a0 + a1) / 2),
      { hold: '', until: (w) => seg(k)(w).a.releasedAt > 0 && seg(k)(w).plank.collidable, max: 3000, note: 'sit in the adda: the tea seller comes, on his plank' },
      { hold: 'R', until: and(ground, X(x + g1 + 1.5)), max: 600, note: 'straight across behind him' },
    ]),
    walk(x + segs[segs.length - 1][3] + 3),
  ];
}


// ------------------------------------------------------------------ CCU-09 lift acts
function liftRoute(id: string, x: number, bad?: 'early' | 'stay'): Step[] {
  const P = (w: World) => w.flags[id] as { p1: ClothPanel; p2: ClothPanel };
  const head: Step[] = [
    steerHop(px(x + 1.5), 12, 'up on the block'),
    steerHop(px(x + 3.6), 12, 'on to the tied panel'),
  ];
  if (bad === 'early') return [...head, steerHop(px(x + 6.6), 34, 'a full jump straight at the high bamboo', true), { hold: '', until: done, max: 300 }];
  const mid: Step[] = [
    { hold: '', until: (w) => P(w).p1.top() <= px(7), max: 900, note: 'wait: they tie the next one on above, and up you go' },
    steerHop(px(x + 6.6), 10, 'across to the high bamboo'),
    { hold: 'R', until: X(x + 6.9), max: 120 },
    steerHop(px(x + 9.6), 12, 'up on the next tied panel'),
    { hold: '', until: (w) => P(w).p2.top() <= px(3), max: 900, note: 'wait for the lift again' },
  ];
  if (bad === 'stay') return [...head, ...mid, { hold: '', until: done, max: 900, note: 'rest at the top' }];
  return [
    ...head,
    ...mid,
    { hold: 'R', until: (w) => w.player.onGround && w.player.cx > px(x + 11.6), max: 120, note: 'walk off on to the gallery at once' },
    walk(x + 22.6),
    { hold: 'R', until: (w) => w.player.onGround && w.player.y + w.player.h === 240, max: 300, note: 'down off the end of the gallery' },
    walk(x + 29.4),
  ];
}

function solutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  S['CCU-01'] = tourRun('onto');
  S['CCU-02'] = [...ride(px(25), px(28.5), 'past the first “aaste” (over the drain), off on the second'), walk(30)];
  lengthen('CCU-02', 0, []);
  S['CCU-06'] = S06();
  lengthen('CCU-06', 0, []);
  S['CCU-07'] = howrahRoom();
  lengthen('CCU-07', 0, []);
  S['CCU-08'] = addaRoute();
  lengthen('CCU-08', 0, []);
  S['CCU-09'] = pandalRoute();
  lengthen('CCU-09', 0, []);
  S['CCU-10'] = finaleRoom();
  lengthen('CCU-10', 0, []);
  S['CCU-03'] = [crossTin('tin', px(27)), walk(30)];
  lengthen('CCU-03', 0, []);
  S['CCU-05'] = kumartuliRoute();
  lengthen('CCU-05', 0, []);
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
  'CCU-05': { steps: [...kumartuliRoute(true), { hold: '', until: done, max: 300 }], cause: 'ccu-phata' },
  'CCU-03': { steps: [{ hold: 'R', until: done, max: 900, note: 'walk across the muri' }], cause: 'ccu-muri' },
  'CCU-10': { steps: [finaleRoom()[0], finaleRoom()[1], { hold: '', until: done, max: 2400, note: 'ride the single bundle across' }], cause: 'ccu-boi' },
  'CCU-09': { steps: [...pandalStart(), steerHop(px(14), 10, 'on to the third bamboo'), { hold: '', until: done, max: 300 }], cause: 'ccu-bansh' },
  'CCU-08': { steps: [walk(2.6), ...hopTo(px(5), 12, 'up on the rok'), walk(14.2), { hold: '', until: done, max: 1200, note: 'stop to listen to the old men' }], cause: 'ccu-dhowa' },
  'CCU-07': { steps: [howrahRoom()[0], howrahRoom()[1], { hold: '', until: done, max: 3000, note: 'ride him all the way' }], cause: 'ccu-cha' },
  'CCU-06': {
    steps: [walk(2.4), ...hopTo(px(4.5), 12, 'up the stop’s step'), ...hopTo(px(5.8), 10, 'up on the platform'), { hold: 'R', until: (w) => tramA(w).riding(w) && w.player.cx > px(8), max: 300, note: 'on to the roof' }, { hold: '', until: done, max: 2400 }],
    cause: 'ccu-dando',
  },
  'CCU-02': { steps: [{ hold: '', until: (w) => w.player.cx > px(9), max: 900, note: 'wait for the stop' }, { hold: 'R', until: (w) => w.state !== 'play', max: 300, note: 'step off at the BUS STOP sign' }], cause: 'ccu-gir' },
};

/** the obvious correction after the first death, which dies too */
const fix: Record<string, { steps: Step[]; cause?: string }> = {
  'CCU-01': { steps: tourRun('off'), cause: 'ccu-rail' },
  'CCU-08': { steps: [...addaRoute(), { policy: hopWater(), until: and(ground, X(32 + 38)), max: 1800 }, walk(76 - 1.8), steerHop(px(76.8), 12, 'up'), walk(76 + 12.2), { hold: 'R', jump: 30, ticks: 30, long: true, note: 'never stop on the rok: jump the broken bit' }, { hold: 'R', until: done, max: 300 }], cause: 'ccu-khod' },
  'CCU-04': { steps: boiRoute(true, 300), cause: 'ccu-boi' },
  'CCU-05': { steps: kumartuliRoute(false, 600), cause: 'ccu-murti' },
  'CCU-03': { steps: [{ ...crossTin('tin', px(27), { stay: true }), until: done }], cause: 'ccu-lonka' },
  'CCU-09': { steps: pandalRoute(200), cause: 'crushed' },
  'CCU-07': { steps: [howrahRoom()[0], howrahRoom()[1], hopUp((w) => porters(w).find((p) => p.o.v < 0), 'jump for the first load that comes by'), { hold: '', until: done, max: 900 }], cause: 'ccu-bojha' },
  'CCU-06': { steps: [walk(2.4), ...hopTo(px(5), 12, 'over the stop’s step'), { hold: 'R', until: (w) => w.player.onGround && w.player.y > 222 && w.player.cx > px(6.6), max: 300 }, ...hopTo(px(7) + 12, 8, 'on to the rear step'), { hold: '', until: done, max: 4000, note: 'stay on the step, past the island' }], cause: 'ccu-points' },
  'CCU-02': { steps: [...ride(px(16), px(19.5), 'off on the first “aaste”'), { hold: 'R', until: (w) => w.state !== 'play', max: 300 }], cause: 'ccu-nala' },
};

/** more scripted first-timer deaths and 'like last time' moves */
const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {
  'CCU-06': [
    { what: 'staying on the step at the double-line island', steps: [...S06(), ...ACT06(32), { hold: '', until: done, max: 3000, note: 'stay on the step' }], cause: 'ccu-dui' },
    { what: 'climbing on to the roof for the double junction', steps: [...S06(), ...ACT06(32), { hold: '', jump: 10, ticks: 30, note: 'up on to the roof' }, { hold: '', until: done, max: 3000 }], cause: 'ccu-dando' },
  ],
  'CCU-04': [{ what: 'waiting on the short stack in front of the tall pile', steps: [...boiRoute(true).slice(0, -1), walk(32 + 2.6), steerHop(px(32 + 5), 10, 'on to the short stack'), { hold: '', until: done, max: 900 }], cause: 'ccu-boi' }],
  'CCU-09': [{ what: 'resting on the new panel at the top of the staircase', steps: [...pandalRoute(), steerHop(px(35), 10, 'bamboo'), steerHop(px(38), 10, 'up'), steerHop(px(41), 10, 'up'), steerHop(px(45), 30, 'high', true), steerHop(px(49), 10, 'on to the new panel'), { hold: '', until: done, max: 300 }], cause: 'crushed' }],
  'CCU-08': [
    { what: 'waiting by the second adda for the water to stop', steps: [...addaRoute(), walk(32 + 24.5), { hold: '', until: done, max: 1500 }], cause: 'ccu-dhowa' },
  ],
  'CCU-05': [
    {
      what: 'walking off the high dry figure on to the one two steps lower',
      steps: [...kumartuliRoute(), walk(32), steerHop(px(33.8), 12, 'up'), steerHop(px(35.8), 10, 'up'), steerHop(px(37.8), 10, 'up'), walkOnto(39, 'down one'), { hold: 'R', until: done, max: 300, note: 'and walk off again, two down' }],
      cause: 'ccu-phata',
    },
  ],

  'CCU-07': [
    { what: 'staying on the first porter of the dusk span', steps: [...howrahRoom(), ...girderRoute(32), ...duiRoute(80), ...relayRoute(124, [42, 60, 80], true).slice(0, 4), { hold: '', until: done, max: 2400 }], cause: 'ccu-cha' },
    { what: 'staying on the second porter of the dusk span', steps: [...howrahRoom(), ...girderRoute(32), ...duiRoute(80), ...relayRoute(124, [42, 60, 80], true).slice(0, 6), { hold: '', until: done, max: 2400 }], cause: 'ccu-cha' },
    { what: 'staying on the first porter of the upside-down span', steps: [...howrahRoom(), ...girderRoute(32), ...duiRoute(80), ...relayRoute(124, [42, 60, 80], true), ...relayRoute(184, [41, 59, 79], false).slice(0, 2), { hold: '', until: done, max: 2400 }], cause: 'ccu-cha' },
    { what: 'staying on the tall porter of the upside-down span', steps: [...howrahRoom(), ...girderRoute(32), ...duiRoute(80), ...relayRoute(124, [42, 60, 80], true), ...relayRoute(184, [41, 59, 79], false).slice(0, 3), { hold: '', until: done, max: 2400 }], cause: 'ccu-cha' },
    { what: 'taking the porter who leaves the second pylon at once', steps: [...howrahRoom(), ...girderRoute(32), ...duiRoute(80), ...relayRoute(124, [42, 60, 80], true), ...relayRoute(184, [41, 59, 79], false), ...relayRoute(244, [43, 61, 81], true), ...relayRoute(304, [44, 60, 84], false), ...relayRoute(364, [40, 58, 78], false), walk(424 + 3.9), ...hopTo(px(430.4), 10, 'up the pylon step'), { hold: 'R', until: (w) => !!riding(w), max: 200, note: 'and on to the waiting porter' }, { hold: '', until: done, max: 1800 }], cause: 'ccu-cha' }],
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
  'ccu09-uthan': (x) => liftRoute('ccu09-uthan', x),
  'ccu09-uthan2': (x) => liftRoute('ccu09-uthan2', x),
  'ccu09-uthan3': (x) => liftRoute('ccu09-uthan3', x),
  'ccu09-uthan4': (x) => liftRoute('ccu09-uthan4', x),
  'ccu10-setu': (x) => relayRoute(x, [45, 63, 83], true),
  'ccu10-phera': (x) => relayRoute(x, [39, 57, 77], false),
  'ccu10-shesh': (x) => relayRoute(x, [46, 64, 84], true),
  'ccu08-gali': (x) => brokenRoute('ccu08-gali', x, [[6, 12, 13, 20, 32], [40, 46, 47, 54, 66]], false),
  'ccu08-duur': (x) => brokenRoute('ccu08-duur', x, [[6, 12, 13, 21, 44]], false),
  'ccu05-pratima': (x) => carryRoute(x, 2, false),
  'ccu05-ghatpar': (x) => carryRoute(x, 2),
  'ccu07-sandhya': (x) => relayRoute(x, [42, 60, 80], true),
  'ccu07-ulto': (x) => relayRoute(x, [41, 59, 79], false),
  'ccu07-bhor': (x) => relayRoute(x, [43, 61, 81], true),
  'ccu07-dupur': (x) => relayRoute(x, [44, 60, 84], false),
  'ccu07-raat': (x) => relayRoute(x, [40, 58, 78], false),
  'ccu09-toran': (x) => [
    steerHop(px(x + 3), 12, 'on to the bamboo: two panels go up'),
    steerHop(px(x + 7), 34, 'a full jump on to the first', true),
    { hold: 'R', until: (w) => w.player.onGround && w.player.cx > px(x + 10.2), max: 120, note: 'across both tops' },
    steerHop(px(x + 13.5), 10, 'and off the far end at once, down to the bamboo'),
    { hold: 'R', until: X(x + 15.2), max: 90 },
    steerHop(px(x + 19), 12, 'on to the deck'),
    walk(x + 25.4),
  ],
  'ccu05-lane': (x) => [
    steerHop(px(x + 1.8), 12, 'up on the first'),
    steerHop(px(x + 3.8), 10, 'up, and straight on (painted past the waist)'),
    walkOnto(x + 5, 'walk down on to the dry one'),
    { hold: 'R', until: X(x + 6.2), max: 120 },
    steerHop(px(x + 8.8), 12, 'across'),
    { hold: 'R', until: X(x + 9.2), max: 120 },
    steerHop(px(x + 11.8), 12, 'up'),
    walkOnto(x + 13, 'walk down on to the dry one'),
    walkOnto(x + 15, 'and down again, one step'),
    { hold: 'R', until: X(x + 16.2), max: 120 },
    steerHop(px(x + 18.8), 12, 'up on the one nearly done, and on'),
    steerHop(px(x + 21.8), 12, 'up'),
    walkOnto(x + 23, 'walk down on to the dry one'),
    { hold: 'R', until: X(x + 24.2), max: 120 },
    steerHop(px(x + 26.8), 12, 'across to the last'),
    { hold: 'R', until: X(x + 27.2), max: 120 },
    steerHop(px(x + 30.8), 10, 'down on to the ghat steps'),
    walk(x + 33.4),
  ],
  'ccu10-rok': (x) => [walk(x + 3.6), steerHop(px(x + 7), 12, 'up on the rok'), { policy: hopWater(), until: and(ground, X(x + 31)), max: 1800, note: 'through the adda, hopping the water' }, walk(x + 33.4)],
  'ccu10-kumor': (x) => [
    steerHop(px(x + 1.8), 12, 'up on the first'),
    steerHop(px(x + 4.8), 12, 'up, and on at once'),
    walkOnto(x + 6, 'walk off on to the dry one'),
    steerHop(px(x + 9.8), 12, 'up on the next'),
    { hold: 'R', until: X(x + 10.2), max: 120 },
    steerHop(px(x + 13.8), 12, 'across to the horse'),
    walkOnto(x + 15, 'walk off on to the dry one'),
    { hold: 'R', until: X(x + 16.2), max: 120 },
    steerHop(px(x + 20.8), 10, 'down on to the lane'),
    walk(x + 23),
  ],
  'ccu03-dokan': (x) => [crossTin('tinB', px(x + 28)), walk(x + 29.4)],
  'ccu04-thak': (x) => [
    walk(x + 0.6),
    { hold: '', until: (w) => w.flags.thak.t2.n === 3 && !w.flags.thak.t2.pointed, max: 1200, note: 'wait on the pavement while he buys the tall pile down' },
    { hold: 'R', until: X(x + 2.1), max: 120, note: 'a run up' },
    steerHop(px(x + 7), 24, 'then a jump straight on to it', true),
    { hold: 'R', until: X(x + 7.2), max: 60 },
    steerHop(px(x + 11), 12, 'down to the next'),
    { hold: 'R', until: X(x + 11.2), max: 60 },
    steerHop(px(x + 15), 12, 'and the next'),
    { hold: 'R', until: X(x + 15.2), max: 60 },
    steerHop(px(x + 19), 12, 'on to the pavement'),
    walk(x + 23.4),
  ],
  'ccu09-sinri': (x) => [
    steerHop(px(x + 3), 10, 'on to the bamboo'),
    steerHop(px(x + 6), 10, 'up the cloth staircase'),
    steerHop(px(x + 9), 10, 'up'),
    steerHop(px(x + 13), 30, 'a full jump up to the high cloth', true),
    steerHop(px(x + 17), 10, 'on to the new panel'),
    { hold: 'R', until: (w) => w.player.onGround && w.player.y + w.player.h === px(9) && w.player.cx > px(x + 18.2), max: 120, note: 'and walk straight off the far side' },
    { hold: 'R', until: X(x + 20.2), max: 120 },
    steerHop(px(x + 25.5), 16, 'down on to the deck'),
    walk(x + 29.4),
  ],
  'ccu07-dui': (x) => duiRoute(x),
  'ccu08-tokta': (x) => [
    walk(x - 1.8),
    steerHop(px(x + 0.8), 12, 'up on the broken rok'),
    walk(x + 8.6),
    { hold: '', until: (w) => w.flags.tokta.a.releasedAt > 0 && w.flags.plank === 1, max: 2400, note: 'stand still in the adda: the tea seller comes, on his plank' },
    { hold: 'R', until: and(ground, X(x + 33.5)), max: 600, note: 'across the plank behind him' },
  ],
  'ccu05-uthon': (x) => [
    steerHop(px(x + 1.8), 12, 'up on the first'),
    steerHop(px(x + 3.8), 10, 'up a step'),
    steerHop(px(x + 5.8), 10, 'and up again'),
    walkOnto(x + 7, 'walk off on to the dry one, one step down'),
    { hold: 'R', until: X(x + 8.2), max: 120 },
    steerHop(px(x + 12.8), 14, 'over the low dry one, across to the half-painted one'),
    walkOnto(x + 14, 'walk off on to the low dry one'),
    steerHop(px(x + 17.8), 12, 'up on the last'),
    { hold: 'R', until: X(x + 18.4), max: 120 },
    steerHop(px(x + 22.6), 10, 'down on to the lane'),
    walk(x + 25.5),
  ],
  'ccu05-ghat': (x) => [
    steerHop(px(x + 1.8), 12, 'up on the first'),
    steerHop(px(x + 4.8), 12, 'the next, up'),
    walkOnto(x + 6, 'walk off on to the dry one'),
    steerHop(px(x + 9.8), 12, 'up on the next'),
    walkOnto(x + 11, 'walk off on to the dry one'),
    steerHop(px(x + 14.8), 12, 'up on the next'),
    steerHop(px(x + 18.8), 10, 'down on to the last'),
    steerHop(px(x + 22.8), 10, 'down on to the lane'),
    walk(x + 25.5),
  ],
  'ccu10-bus': (x) => [
    boardAtStop((w) => w.flags.bus10),
    ...ride(px(x + 25), px(x + 28.5), 'over the drain, and off on his one “aaste”'),
    walk(x + 38),
  ],
  'ccu10-tram': (x) => [
    { hold: 'R', until: (w) => w.player.cx >= (w.flags.tram10 as Tram).step.x + 12, max: 300 },
    { hold: '', jump: 8, until: (w) => (w.flags.tram10 as Tram).onStep(w), max: 120, note: 'up on to the tram’s step' },
    { hold: '', until: (w) => (w.flags.tram10 as Tram).state === 'stop' && w.player.cx > px(x + 22), max: 2400, note: 'through the junction on the step' },
    { hold: 'R', until: and(ground, X(x + 43.5)), max: 600, note: 'off at the island, before the points' },
  ],
  'ccu09-chala': (x) => [
    steerHop(px(x + 3), 10, 'on to the bamboo: the wide panel goes up'),
    steerHop(px(x + 7.5), 34, 'a full jump on to the wide cloth', true),
    { hold: '', until: (w) => (w.flags.wide as ClothPanel).top() <= px(7), max: 300, note: 'ride the next panel up' },
    steerHop(px(x + 15.5), 10, 'on to the high bamboo'),
    steerHop(px(x + 22), 8, 'down to the next'),
    walk(x + 38, 'down to the pandal floor'),
  ],
  'ccu08-rok': (x) => [{ policy: hopWater(), until: and(ground, X(x + 38)), max: 1800, note: 'through both addas, hopping the water' }],
  'ccu07-girder': girderRoute,
  'ccu07-pylon': (x) => [walk(x + 3.9), ...hopTo(px(x + 6.4), 10, 'up the pylon step'), hopUp((w) => ahead(w, 55, 54), 'wait for the tall porter, and up on his load'), { hold: '', until: X(x + 40.6), max: 1800, note: 'ride him to Howrah' }],
  'ccu06-points': ACT06,
  'ccu06-duiline': (x) => [
    { hold: '', until: (w) => tramB(w)!.state === 'stop' && w.player.cx > px(x + 19), max: 2400, note: 'through two junctions on the step, to the island' },
    { hold: 'R', until: and(ground, X(x + 23.6)), max: 300, note: 'off on to the island: the other line’s tram is coming' },
    { hold: '', until: (w) => !!w.flags.otherPassed, max: 600, note: 'let it go by' },
    { hold: 'L', until: (w) => w.player.cx < tramB(w)!.step.x + 14, max: 300 },
    { hold: '', jump: 8, until: (w) => tramB(w)!.onStep(w), max: 120, note: 'back up on to the step' },
    { hold: '', until: (w) => tramB(w)!.state === 'end', max: 3000, note: 'to the end of the line' },
  ],
};


// CCU-05's carry acts: the obvious plays there (scripted after the act routes they build on)
{
  const to92 = (): Step[] => [...kumartuliRoute(), ...actRoutes['ccu05-uthon'](32), ...actRoutes['ccu05-lane'](58)];
  mistakes['CCU-05'].push(
    { what: 'jumping the ghat mud from the step', steps: [...to92(), walk(92.4), steerHop(px(94.5), 12, 'up'), { hold: 'R', jump: 30, ticks: 40, long: true, note: 'a long jump at the mud' }, { hold: 'R', until: done, max: 300 }], cause: 'ccu-ganga' },
    { what: 'stepping off the carried figure as soon as it moves', steps: [...to92(), ...carrySeg(92, true), { hold: 'R', until: done, max: 300 }], cause: 'ccu-ganga' },
  );
}


// CCU-08's broken lane: the obvious plays there
{
  const to110 = (): Step[] => [...addaRoute(), ...actRoutes['ccu08-rok'](32), ...actRoutes['ccu08-tokta'](76)];
  mistakes['CCU-08'].push(
    { what: 'jumping the first break in the lane', steps: [...to110(), walk(110 + 11.8), { hold: 'R', jump: 30, ticks: 40, long: true, note: 'a long jump at the break' }, { hold: 'R', until: done, max: 300 }], cause: 'ccu-khod' },
    { what: 'sitting on after the tea seller has gone by', steps: [...to110(), walk(110 + 9), { hold: '', until: (w) => (w.flags['ccu08-gali'] as RokSeg[])[0].a.releasedAt > 0, max: 3000 }, walk(110 + 12.3), { hold: '', ticks: 720, note: 'wait at the break for a while' }, { hold: 'R', until: done, max: 600 }], cause: 'ccu-khod' },
  );
}


// CCU-10's and CCU-07's later spans: staying on a porter past his CHA board
{
  const to174 = (): Step[] => [...finaleRoom(), ...actRoutes['ccu10-bus'](32), ...actRoutes['ccu10-tram'](72), ...actRoutes['ccu10-rok'](116), ...actRoutes['ccu10-kumor'](150)];
  (mistakes['CCU-10'] ??= []).push(
    { what: 'staying on the first porter back over the bridge', steps: [...to174(), ...relayRoute(174, [45, 63, 83], true).slice(0, 4), { hold: '', until: done, max: 2400 }], cause: 'ccu-cha' },
    { what: 'staying on the short porter back over the bridge', steps: [...to174(), ...relayRoute(174, [45, 63, 83], true).slice(0, 6), { hold: '', until: done, max: 2400 }], cause: 'ccu-cha' },
  );
  const to244 = (): Step[] => [...howrahRoom(), ...girderRoute(32), ...duiRoute(80), ...relayRoute(124, [42, 60, 80], true), ...relayRoute(184, [41, 59, 79], false)];
  mistakes['CCU-07'].push(
    { what: 'staying on the first porter of the morning span', steps: [...to244(), ...relayRoute(244, [43, 61, 81], true).slice(0, 4), { hold: '', until: done, max: 2400 }], cause: 'ccu-cha' },
    { what: 'staying on the tall porter of the midday span', steps: [...to244(), ...relayRoute(244, [43, 61, 81], true), ...relayRoute(304, [44, 60, 84], false).slice(0, 3), { hold: '', until: done, max: 2400 }], cause: 'ccu-cha' },
  );
}


// CCU-09's lift acts: the obvious plays there
{
  const toLift = (): Step[] => [...pandalRoute(), ...actRoutes['ccu09-sinri'](32), ...actRoutes['ccu09-toran'](62), ...actRoutes['ccu09-chala'](88)];
  mistakes['CCU-09'].push(
    { what: 'jumping for the high bamboo before the lift', steps: [...toLift(), ...liftRoute('ccu09-uthan', 128, 'early')], cause: 'ccu-bansh' },
    { what: 'resting on the lifted panel under the roof frame', steps: [...toLift(), ...liftRoute('ccu09-uthan', 128, 'stay')], cause: 'crushed' },
  );
}

/** a policy for each door ending, by kind */
const SETHOP = hopGaps();
const endingPolicies: Record<string, Policy> = {
  'ccu-dorja'(w, _m, d) {
    const k = w.flags.dorja as { a: Adda; D: number };
    const p = w.player;
    if (w.flags.twist === 'clear' && !k.a.held) return go(p.onGround || p.y + p.h < 212 ? toward(w, d.x + 8, 1) || 'R' : 'R');
    if (p.y + p.h > 230 && p.onGround) {
      // up on to the rok
      if (p.cx > px(k.D - 14)) return { move: 'R', jump: true };
      return go('R');
    }
    if (!p.onGround) return go('R');
    return go(toward(w, (k.a.x0 + k.a.x1) / 2, 4));
  },
  'ccu-dwar-kapor'(w, m, d) {
    const k = w.flags.kapor as { D: number };
    const p = w.player;
    const feet = p.y + p.h;
    if (m.hold > 0) return { move: toward(w, m.tgt, 2) || 'R', jump: true };
    if (!p.onGround) return go(toward(w, m.tgt ?? d.x + 8, 2));
    if (w.flags.twist === 'tied') return go('');
    if (feet === px(12) && p.cx > px(k.D - 1)) return go(toward(w, d.x + 8, 1) || 'R');
    const jumpTo = (tgt: number, hold: number): Out => {
      m.tgt = tgt;
      m.hold = hold;
      return { move: 'R', jump: true };
    };
    if (feet === px(12)) return p.cx > px(k.D - 3) + 6 ? jumpTo(d.x + 9, 12) : go('R');
    if (feet === px(13)) return p.cx > px(k.D - 7) + 8 ? jumpTo(px(k.D - 4) + 14, 10) : go('R');
    if (p.cx > px(k.D - 8) - 2) return jumpTo(px(k.D - 7) + 8, 12);
    return go('R');
  },
  'ccu-stup'(w, m, d) {
    const k = w.flags.stup as { st: Stack; D: number };
    const p = w.player;
    if (m.hold > 0) return { move: 'R', jump: true };
    const stand = px(k.D - 1) - 2;
    if (!p.onGround) return go('R');
    if (k.st.n === 1 && !k.st.pointed) return go('R');
    return go(toward(w, stand, 2));
  },
  'ccu-murti'(w, m, d) {
    const k = w.flags.big as { big: BigFigure; D: number };
    const p = w.player;
    if (m.hold > 0) return { move: 'R', jump: true };
    if (k.big.riding(w)) return go(k.big.state === 'down' ? 'R' : '');
    if (p.onGround && p.y + p.h <= px(12) && p.cx > px(k.D)) return go(toward(w, d.x + 8, 1) || 'R');
    // up the block, then on to the figure's head
    if (p.onGround && p.y + p.h === 240 && p.cx > px(k.D - 15) + 4) {
      m.hold = 12;
      return { move: 'R', jump: true };
    }
    if (p.onGround && p.y + p.h === px(13) && p.cx > px(k.D - 13) + 4) {
      m.hold = 10;
      return { move: 'R', jump: true };
    }
    if (!p.onGround) return go(toward(w, k.big.x + 20, 2));
    return go('R');
  },

  'ccu-thonga'(w, _m, d) {
    const t = w.flags.tin2 as Tin;
    const p = w.player;
    const fresh = t.shakes > 0 && t.phase(w) === 'calm' && t.untilTell(w) > 1.2;
    if (p.cx > t.o.x0 + 6 || (fresh && p.cx > t.o.x0 - 30)) return go(toward(w, d.x + 8, 1) || 'R');
    return go(toward(w, t.o.x0 - 20, 3));
  },



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
    if (b.slowed && b.v < 45 && b.deck.x <= p.x - 1 && b.deck.x + b.deck.w >= p.x + p.w + 1 && p.onGround) {
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
  fair: ['CCU-02', 'CCU-03', 'CCU-04', 'CCU-05', 'CCU-06', 'CCU-07', 'CCU-08', 'CCU-09', 'CCU-10'],
};
