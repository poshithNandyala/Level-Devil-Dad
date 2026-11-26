// Kavaratti's own route file (the shipped city's pass). Its older proven plays still live in the shared tables
// (tests/solutions.ts, tests/west.ts, tests/acts.ts, tests/endings.ts); anything set here is merged LAST and
// replaces that stage's (or act's, or ending's) entry there. After a change on purpose: npm run refreeze -- KVT.
// Plays that build on a shared route (the tour, KVT-05) are made inside `solutions`, which runs after the
// shared routes exist, so NAIVE, FIX and MISTAKES here are filled in there too.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import { Step, X, and, done, ground, thingOf } from '../runner';
import type { CityTests } from '../city-tests';
import { swimPolicy } from '../moves';
import type { Heap } from '../../src/game/cities/kvt/encores';
import { Eel } from '../../src/game/cities/kvt/levels';

type Move = 'L' | 'R' | '';
type Out = { move: Move; jump: boolean };
interface Mem {
  hold: number;
  steer: Move;
  s: number;
  t: number;
  n: number;
  [k: string]: any;
}
type Policy = (w: World, m: Mem, d: Door) => Out;
type Play = { steps: Step[]; cause?: string };
const px = (t: number) => t * 16;
const go = (move: Move): Out => ({ move, jump: false });
const doorCx = (d: Door) => d.x + 8;
const toward = (w: World, x: number, slack = 2): Move => (w.player.cx < x - slack ? 'R' : w.player.cx > x + slack ? 'L' : '');
/** start a jump held for `ticks` (it needs the button up for a tick first) */
function jump(w: World, m: Mem, ticks: number, steer: Move): Out {
  if (w.input.jump) return { move: steer, jump: false };
  m.hold = ticks - 1;
  m.steer = steer;
  return { move: steer, jump: true };
}

const naive: Record<string, Play> = {};
const fix: Record<string, Play> = {};
const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {};

/** the route `r` with the step noted `note` (and the `n` steps from it) swapped for `w` */
function swapAt(r: Step[], note: string, n: number, w: Step[]): Step[] {
  const i = r.findIndex((st) => st.note === note);
  if (i < 0) throw new Error(`kvt swapAt: no step '${note}'`);
  return [...r.slice(0, i), ...w, ...r.slice(i + n)];
}
/** the route up to (not including) the step noted `note` */
function upTo(r: Step[], note: string): Step[] {
  const i = r.findIndex((st) => st.note === note);
  if (i < 0) throw new Error(`kvt upTo: no step '${note}'`);
  return r.slice(0, i);
}
const dies: Step = { hold: '', until: done, max: 900 };

// ------------------------------------------------------------------ the storm bank (KVT-09)
/** standing still, the rubble done sliding */
const still = (w: World) => w.player.onGround && !w.flags.kvtSlide && Math.abs(w.player.vx) < 1;
/** walk to the far end of the rubble step ending at column c1 (against the next riser), stop, and tap up */
const stepUp = (c1: number, note = 'walk to the far end of the step, then up'): Step[] => [
  { hold: 'R', until: X(c1 + 0.3), max: 200, note },
  { hold: '', until: still, max: 60 },
  { hold: 'R', jump: 12, ticks: 12 },
  { hold: 'R', until: ground, max: 200 },
  { hold: '', until: still, max: 200 },
];
/** from a standstill at an edge, a middling jump that lands deep on the rubble past it */
const deepOn = (edge: number, j: number, note: string): Step[] => [
  { hold: 'R', until: X(edge), max: 400, note },
  { hold: '', until: still, max: 60 },
  { hold: 'R', jump: j, ticks: j },
  { hold: 'R', until: ground, max: 200 },
  { hold: '', until: still, max: 200 },
];
const kvt09Room: Step[] = [
  ...deepOn(6.3, 20, 'stop at the water, then a good jump: land deep on the rubble'),
  ...stepUp(11),
  ...stepUp(14),
  ...stepUp(17),
  ...stepUp(20),
  { hold: 'R', until: X(32), max: 400, note: 'over the crest and down' },
];

/** KVT-09's door: hop on the heap three times (each landing slides it a tile towards the lagoon), then in */
const buried: Policy = (w, m, d) => {
  const p = w.player;
  const heap = w.flags.heap as Heap;
  if (w.flags.twist === 'clear') {
    if (p.onGround && p.cx > heap.solid.x + heap.solid.w - 2) return go(toward(w, doorCx(d), 1));
    return go(p.onGround ? 'R' : 'R');
  }
  if (!p.onGround) return go(m.steer);
  if (w.flags.kvtHeapSlide) return go('');
  if (p.isRiding(heap.solid)) return Math.abs(p.vx) < 1 ? jump(w, m, 8, '') : go('');
  const cut = w.flags.cut as number;
  if (p.x + p.w < cut && p.x + p.w > cut - 12) return jump(w, m, 12, 'R');
  if (p.x < cut + px(2)) return go('R');
  if (p.x + p.w < heap.solid.x - 6) return go('R');
  return jump(w, m, 10, 'R');
};

// ------------------------------------------------------------------ the octopus (KVT-10)
/** from a standstill, a jump of `j` ticks to the right, landing and settling */
/** a running jump: keep running until X(at), jump `j` ticks, land, run on (or stop with `stop`) */
const hop = (at: number, j: number, note: string, stop = false): Step[] => [
  { hold: 'R', until: X(at), max: 400, note },
  { hold: 'R', jump: j, ticks: j, ...(j > 15 ? { long: true } : {}) },
  { hold: 'R', until: (w) => w.player.onGround || w.state !== 'play', max: 200 },
  ...(stop ? [{ hold: '' as const, until: still, max: 100 }] : []),
];
const kvt10Room: Step[] = [
  ...hop(4.4, 12, 'on to the first coral head'),
  ...hop(8.5, 12, 'on to the den: the dark hole is solid'),
  ...hop(12.6, 30, 'over the octopus, the yellow head that breathes'),
  ...hop(18.2, 12, 'the next head'),
  ...hop(22.3, 12, 'and the beach'),
  { hold: 'R', until: X(32), max: 400 },
];
const sandArmPolicy: Policy = (w, m, d) => {
  const p = w.player;
  const [x0] = w.flags.arm as [number, number];
  if (!p.onGround) return go(m.steer);
  if (p.x > x0) return go(toward(w, doorCx(d), 1));
  if (p.x + p.w < x0 - 8) return go('R');
  if (Math.abs(p.vx) > 1) return go('');
  return jump(w, m, 30, 'R');
};

const actRoutes: Record<string, (x: number) => Step[]> = {
  'kvt10-midden': (x) => [
    ...hop(x + 1.4, 12, 'on to the green head'),
    ...hop(x + 6.9, 30, 'the far side of the bare hole: it goes right through'),
    ...hop(x + 12.6, 12, 'the den with the shells: solid'),
    ...hop(x + 17.4, 12, 'the yellow head it left'),
    ...hop(x + 23.0, 30, 'over the pink one: that pink moved'),
    ...hop(x + 29.0, 12, 'the shore'),
    { hold: 'R', until: X(x + 34), max: 400 },
  ],
  'kvt10-irakkam': (x) => {
    const tide = (i: number) => (w: World) => (w.flags['kvt10-irakkam:tide'] as boolean[])[i] && still(w);
    const eelRests = (w: World) => w.entities.some((e) => e instanceof Eel && e.state === 'rest' && e.x > px(x + 10)) && still(w);
    return [
      { hold: 'R', until: X(x + 2.2), max: 400, note: 'to the edge: the tide is going out' },
      { hold: '', until: tide(0), max: 600, note: 'wait till the step is down to its top' },
      { hold: 'R', jump: 30, ticks: 48, note: 'on to the coral top' },
      { hold: '', until: ground, max: 200 },
      { hold: '', until: still, max: 100 },
      { hold: 'R', jump: 30, ticks: 42, note: 'off it, on to the rock' },
      { hold: '', until: ground, max: 200 },
      { hold: '', until: eelRests, max: 600, note: 'the hole with eyes: let the moray lunge and go back in' },
      { hold: 'R', until: X(x + 13.2), max: 300, note: 'now across' },
      { hold: '', until: tide(1), max: 600, note: 'wait for the second step' },
      { hold: 'R', jump: 30, ticks: 48 },
      { hold: '', until: ground, max: 200 },
      { hold: '', until: still, max: 100 },
      { hold: 'R', jump: 30, ticks: 42 },
      { hold: '', until: ground, max: 200 },
      { hold: 'R', until: X(x + 24), max: 400 },
    ];
  },
  'kvt09-pavizham': (x) => [
    ...deepOn(x + 3.3, 20, 'stop at the water, land deep'),
    ...stepUp(x + 8, 'up under the lip: a tap, never a full leap'),
    ...stepUp(x + 11),
    ...stepUp(x + 14),
    ...stepUp(x + 17),
    { hold: 'R', until: X(x + 32.6), max: 600, note: 'along the crest and down' },
  ],
  'kvt09-kodumudi': (x) => [
    ...deepOn(x + 2.3, 20, 'stop at the water, land deep'),
    ...stepUp(x + 7),
    ...stepUp(x + 10),
    ...stepUp(x + 13, 'the narrow steps: walk to the far tile, then up'),
    ...stepUp(x + 15),
    ...stepUp(x + 17),
    ...stepUp(x + 19),
    { hold: 'R', until: and(ground, X(x + 29)), max: 600, note: 'over the top and down' },
  ],
  'kvt09-murivu': (x) => [
    { hold: 'R', jump: 14, ticks: 14, note: 'up on to the breached crest' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: and(ground, X(x + 4.6)), max: 400 },
    { hold: 'R', jump: 30, ticks: 30, long: true, note: 'well past the first cut' },
    { hold: 'R', until: ground, max: 200 },
    { hold: '', until: still, max: 200 },
    { hold: 'R', until: X(x + 14.6), max: 400 },
    { hold: 'R', jump: 30, ticks: 30, long: true, note: 'and well past the second' },
    { hold: 'R', until: ground, max: 200 },
    { hold: '', until: still, max: 200 },
    { hold: 'R', until: X(x + 30), max: 400 },
  ],
};

/** the seven door endings from before the pass, under their kvt- names (the shared tests/endings.ts policies, copied) */
const endingPolicies: Record<string, Policy> = {
  'kvt-reflection'(w, m, d) {
    const p = w.player;
    const [g0, g1] = w.flags.gap as [number, number];
    const mid = (g0 + g1) / 2;
    const edge = d.x - px(4);
    if (!p.onGround) {
      m.air = (m.air ?? 0) + 1;
      return { move: toward(w, mid, 2), jump: m.air < 22 };
    }
    m.air = 0;
    if (p.x + p.w < edge - 1) return go('R');
    return jump(w, m, 1, 'R');
  },

  'kvt-glider'(w, m, d) {
    const p = w.player;
    const edge = d.x - px(12);
    if (w.flags.twist === 'landed') return go(toward(w, doorCx(d)));
    if (!p.onGround) {
      m.air = (m.air ?? 0) + 1;
      return { move: 'R', jump: m.air < 24 };
    }
    m.air = 0;
    if (p.x + p.w < edge - 3) return go('R');
    const ph = w.tick % 312;
    return ph >= 168 && ph <= 182 ? jump(w, m, 1, 'R') : go('');
  },

  'kvt-trapdoor'(w, m, d) {
    const p = w.player;
    const c = d.x + 8;
    if (Math.abs(p.cx - c) > 2 || Math.abs(p.vx) > 4) return go(toward(w, c, 1));
    return p.onGround ? jump(w, m, 8, '') : go('');
  },

  'kvt-footsteps'(w, m, d) {
    const p = w.player;
    const prints = (w.flags.prints ?? []) as { x: number; t: number }[];
    const LIFE = 288;
    const x1 = d.x - px(1);
    if (w.flags.twist === 'wait') return go('R');
    const live = prints.filter((f) => w.tick - f.t < LIFE - 30);
    const on = live.find((f) => Math.abs(f.x - p.cx) < 8);
    // in the air: steer for the target, letting go early (he keeps drifting)
    if (!p.onGround) return go(m.tx !== undefined && p.cx < m.tx - 9 ? 'R' : '');
    if (p.cx > x1 - 2) return go(toward(w, doorCx(d)));
    const next = live.filter((f) => f.x > p.cx + 20).sort((a, b) => a.x - b.x)[0];
    // standing on a print (or on the shore): settle, then hop for the next one, or for the far shore
    if (on && Math.abs(on.x - p.cx) > 2) return go(on.x > p.cx ? 'R' : 'L');
    if (!on && p.cx < d.x - px(13) + 2) {
      // the shore: walk out on to the first print when it's there
      const first = live[0];
      return go(first && first.x < d.x - px(13) + 14 ? toward(w, first.x) : '');
    }
    const target = next ? next.x : p.cx > x1 - 60 ? x1 + 12 : undefined;
    if (target === undefined) return go('');
    m.tx = target;
    return jump(w, m, 9, 'R');
  },

  'kvt-pushoff'(w, m, d) {
    const p = w.player;
    const k = w.flags.kayak as { state: string; solid: { x: number; y: number; w: number } };
    const aboard = w.standing(k.solid as never);
    if (k.state === 'beached') return go('R');
    if (k.state === 'afloat' && !aboard) {
      if (p.onGround && !m.j) {
        m.j = 1;
        return jump(w, m, 10, 'R');
      }
      return go(toward(w, k.solid.x + 17, 3));
    }
    if (aboard && k.state === 'afloat') return go('');
    return go(toward(w, doorCx(d)));
  },

  'kvt-safetystop'(w, m, d) {
    const p = w.player;
    // up the rock and in
    if (!m.sw) {
      if (!p.swimming) {
        const wall = p.onGround && !!w.solidAt(p.x + p.w + 1, p.y + 2, 4, p.h - 4);
        return wall ? jump(w, m, 14, 'R') : go('R');
      }
      const [lx, ky] = w.flags.knot as [number, number];
      m.sw = swimPolicy([
        { x: lx - 6, y: ky, tx: 4, ty: 4, wait: (w2) => w2.flags.twist === 'ok' },
        { x: d.x - 62, y: 200, tx: 4, yFirst: false },
        { x: d.x - 62, y: 120, tx: 4, ty: 30 },
      ]);
    }
    if (p.swimming) return m.sw(w);
    // out of the water after the stop: on to the deck and in
    if (w.flags.twist === 'ok' && (p.onGround || p.vy < 0 || p.y < 176)) return go(toward(w, doorCx(d)));
    return m.sw(w);
  },

  'kvt-loading'(w, m, d) {
    const p = w.player;
    const tw = w.flags.twist,
      tip = w.flags.barTip as number;
    const x0 = d.x - px(7);
    if (p.x > d.x - 2) return go(toward(w, doorCx(d)));
    if (!p.onGround) return go('R');
    if (p.x + p.w < x0 - 2 && (tw === 'idle' || p.x + p.w < x0 - px(2.5))) return go('R');
    if (tw === 'idle') return go('');
    if (tw === 'stalled') return p.x + p.w >= tip - 14 ? jump(w, m, 10, 'R') : go('R');
    if (tw === 'lost') return go('L');
    return go(p.x + p.w < tip - 12 ? 'R' : '');
  },

  'kvt-buried-door': buried,
  'kvt-sand-arm': sandArmPolicy,
};

// ------------------------------------------------------------------ the tour's coral step (KVT-01)
const coral = (st: string) => (w: World) => w.flags.coral === st;
/** wait at the water's edge for the tide to finish, then a timed jump on to the coral top and one off it */
const coralCrossing = (r1: number, r2: number): Step[] => [
  { hold: 'R', until: X(81.2), max: 600, note: 'to the water’s edge' },
  { hold: '', until: (w) => coral('top')(w) && still(w), max: 600, note: 'wait for the tide: the step shrinks to its top' },
  { hold: 'R', jump: 30, ticks: r1, note: 'on to the coral top' },
  { hold: '', until: ground, max: 200 },
  { hold: '', until: still, max: 100 },
  { hold: 'R', jump: 30, ticks: r2, note: 'and off to the beach' },
  { hold: '', until: ground, max: 200 },
];
/** the shared tour route with its old ditch hop (now the coral step) swapped for `w` */
function tourAt(run: Step[], w: Step[]): Step[] {
  const i = run.findIndex((st) => st.note === 'a shallow ditch');
  if (i < 0) throw new Error('kvt: no ditch hop in the tour');
  return [...run.slice(0, i - 1), ...w, ...run.slice(i + 2)];
}

function solutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  // ---------------------------------------------------------------- KVT-01: the coral step
  {
    const shared = S['KVT-01'];
    S['KVT-01'] = tourAt(shared, coralCrossing(48, 42));
    // the old tour, played as it looks: wait for the turtles, then the running hop on to the coral step it was
    // a moment ago (its near shoulder has washed off by the time you land)
    naive['KVT-01'] = { steps: [...shared.slice(0, shared.findIndex((st) => st.note === 'a shallow ditch') + 1), { hold: 'R', until: done, max: 300 }], cause: 'splash' };
    // the turtles spread wider than a jump: jump them anyway (the same death as before the pass, its cause renamed)
    fix['KVT-01'] = {
      steps: [...upTo(shared, 'let every baby turtle reach the water'), { hold: 'R', until: X(69.4), max: 300 }, { hold: 'R', jump: 20, ticks: 20, note: 'jump the babies' }, { hold: 'R', until: ground, max: 200 }, { hold: 'R', until: done, max: 900 }],
      cause: 'kvt-hatchling',
    };
  }
  // ---------------------------------------------------------------- KVT-05: the tuna are kvt-tuna now
  S['KVT-05'] = [
    { hold: 'R', until: X(7.0), max: 300, dodge: 40 },
    { hold: '', until: (w) => thingOf(w, 'odam').x <= px(10) + 3 && !w.entities.some((e: any) => e.kind === 'kvt-tuna' && e.alive && e.x > w.player.x - 30), max: 900, dodge: 40, note: 'wait for the boat, back from the end of the pier' },
    ...S['KVT-05'].slice(2, S['KVT-05'].findIndex((st) => st.note === 'over the top of the lighthouse and down the steps')),
  ];
  lengthen('KVT-05', 0, [{ hold: 'R', until: X(44), max: 600, note: 'over the top of the lighthouse and down the steps' }]);

  // ---------------------------------------------------------------- KVT-10
  S['KVT-10'] = kvt10Room;
  lengthen('KVT-10', 0, []);
  // the dark hole looks like a pit, so jump it: straight on to the bright head past it, the octopus
  naive['KVT-10'] = { steps: [...hop(4.4, 12, 'on to the first coral head'), ...hop(10.3, 30, 'over the dark hole'), dies], cause: 'kvt-octopus' };
  // the dark hole was the safe one: so trust dark holes. The bare one goes right through to the lagoon
  fix['KVT-10'] = { steps: [...upTo(S['KVT-10'], 'the far side of the bare hole: it goes right through'), ...hop(32 + 7.0, 12, 'into the dark hole'), dies], cause: 'splash' };
  mistakes['KVT-10'] = [
    { what: 'land on the pink head: it was yellow a moment ago', steps: [...upTo(S['KVT-10'], 'over the pink one: that pink moved'), ...hop(32 + 22.6, 12, 'on to the pink head'), dies], cause: 'kvt-octopus' },
    { what: 'run straight over the hole with eyes', steps: [...upTo(S['KVT-10'], 'the hole with eyes: let the moray lunge and go back in'), { hold: 'R', until: done, max: 300 }], cause: 'kvt-bitten' },
    { what: 'walk into the door', steps: [...upTo(S['KVT-10'], 'the door: kvt-sand-arm'), { hold: 'R', until: done, max: 900 }], cause: 'kvt-octopus' },
  ];

  // ---------------------------------------------------------------- KVT-09
  S['KVT-09'] = kvt09Room;
  lengthen('KVT-09', 0, [{ hold: 'R', until: X(34), max: 300 }]);
  // the hops were too small: so leap big. Under the beach-rock lip a full leap meets its jagged underside
  fix['KVT-09'] = {
    steps: swapAt(S['KVT-09'], 'up under the lip: a tap, never a full leap', 5, [
      { hold: 'R', until: X(34 + 8.3), max: 200 },
      { hold: '', until: still, max: 60 },
      { hold: 'R', jump: 40, ticks: 40, long: true },
      { hold: 'R', until: ground, max: 200 },
      { hold: '', until: still, max: 200 },
      { hold: 'R', until: X(34 + 11.3), max: 200 },
      { hold: '', until: still, max: 60 },
      { hold: 'R', jump: 40, ticks: 40, long: true },
      dies,
    ]),
    cause: 'spikes',
  };
  mistakes['KVT-09'] = [
    { what: 'a little hop over the storm cut, as Tara says', steps: [...upTo(S['KVT-09'], 'well past the first cut').slice(0, -1), { hold: 'R', until: X(98 + 5.2), max: 400 }, { hold: 'R', jump: 12, ticks: 12 }, { hold: 'R', until: done, max: 400 }], cause: 'splash' },
  ];
  // hop straight up the steps from wherever you land
  naive['KVT-09'] = {
    steps: [
      { hold: 'R', until: X(6.3), max: 300 },
      ...Array.from({ length: 4 }, (): Step[] => [
        { hold: 'R', jump: 12, ticks: 12 },
        { hold: 'R', until: (w) => ground(w) || w.state !== 'play', max: 200 },
        { hold: '', until: (w) => still(w) || w.state !== 'play', max: 200 },
      ]).flat(),
      dies,
    ],
    cause: 'splash',
  };
}

export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  fair: ['KVT-02', 'KVT-03', 'KVT-04', 'KVT-05', 'KVT-06', 'KVT-07', 'KVT-08', 'KVT-09', 'KVT-10'],
};
