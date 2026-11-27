// Kavaratti's own route file (the shipped city's pass). Its older proven plays still live in the shared tables
// (tests/solutions.ts, tests/west.ts, tests/acts.ts, tests/endings.ts); anything set here is merged LAST and
// replaces that stage's (or act's, or ending's) entry there. After a change on purpose: npm run refreeze -- KVT.
// Plays that build on a shared route (the tour, KVT-05) are made inside `solutions`, which runs after the
// shared routes exist, so NAIVE, FIX and MISTAKES here are filled in there too.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import { Step, X, and, done, ground, thingOf, gustNOn, gustNLeft } from '../runner';
import type { CityTests } from '../city-tests';
import type { Heap, ShadowStep } from '../../src/game/cities/kvt/encores';
import { Eel, Jelly, type Dolphin } from '../../src/game/cities/kvt/levels';
import { DT } from '../../src/game/constants';

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
const still = (w: World) => w.player.onGround && !w.flags.kvtSlide && w.player.stun === 0 && Math.abs(w.player.vx) < 1;
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
  'kvt10-palaka': (x) => [
    { hold: 'R', until: X(x + 0.3), max: 300, note: 'up the rocks to the jetty' },
    { hold: '', until: still, max: 60 },
    { hold: 'R', jump: 14, ticks: 24 },
    { hold: '', until: ground, max: 200 },
    { hold: 'R', until: X(x + 2.3), max: 200 },
    { hold: '', until: still, max: 60 },
    { hold: 'R', jump: 14, ticks: 24 },
    { hold: '', until: ground, max: 200 },
    { hold: 'R', until: X(x + 9.2), max: 300, note: 'stand on the rotten plank: it is the way down' },
    { hold: '', until: (w) => !!w.flags['kvt10-palaka:dropped'] && w.player.onGround && w.player.y + w.player.h >= px(14) - 1, max: 300 },
    { hold: 'R', until: and(ground, X(x + 34)), max: 600, note: 'along the catwalk, under the wall' },
  ],
  'kvt10-kallu': (x) => [
    ...deepOn(x + 2.3, 20, 'the rubble again: land deep on the first step'),
    { steer: (w) => (w.player.x < px(x + 5.9) - 1 ? 'R' : w.player.x > px(x + 5.9) + 1 ? 'L' : ''), until: (w) => Math.abs(w.player.x - px(x + 5.9)) <= 1, max: 120, note: 'not the far end this time: the middle' },
    { hold: '', until: still, max: 60 },
    { hold: 'R', jump: 12, ticks: 30 },
    { hold: '', until: ground, max: 200 },
    { hold: '', until: still, max: 200, note: 'in the middle of the octopus step' },
    { hold: 'R', jump: 30, ticks: 60, long: true, note: 'over the octopus, deep on the next step' },
    { hold: '', until: ground, max: 200 },
    { hold: '', until: still, max: 200 },
    ...stepUp(x + 13),
    ...stepUp(x + 16),
    { hold: 'R', until: and(ground, X(x + 30)), max: 600 },
  ],
  'kvt10-aama': (x) => [
    { hold: 'R', until: X(x + 18.6), max: 400, note: 'run on: the babies are coming your way' },
    { hold: 'R', jump: 12, ticks: 12, note: 'over the water' },
    { hold: 'R', until: and(ground, X(x + 25)), max: 300 },
    { hold: '', until: (w) => w.flags['kvt10-aama:ahead'] === 1, max: 1500, note: 'the nest ahead: wait till every baby is in' },
    { hold: 'R', until: X(x + 35.6), max: 300 },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: and(ground, X(x + 42)), max: 300 },
  ],
  'kvt10-choora': (x) => {
    /** no tuna on its way within a second of reaching Dad */
    const clear = (w: World) => !w.entities.some((e: any) => e.kind === 'kvt-tuna' && e.alive && e.x > w.player.x - 12 && e.x - w.player.x < 130);
    const gap = (t: number, note: string): Step[] => [
      { hold: 'R', until: X(x + t - 1.3), max: 400, note },
      { hold: '', until: still, max: 60 },
      { hold: '', until: clear, max: 400 },
      { hold: 'R', jump: 10, ticks: 24 },
      { hold: '', until: ground, max: 200 },
    ];
    return [
      ...gap(10, 'walk under the tuna; hop the gap once one has gone over'),
      ...gap(18, 'the next gap'),
      ...gap(26, 'and the last'),
      { policy: hopAt(0.16, 12), until: X(x + 52), max: 900, note: 'the second boat throws low: hop those' },
    ];
  },
  'kvt10-thengu': (x) => {
    const palmAt = (w: World, tx: number) => w.climbables.find((c: any) => Math.abs(c.bx - (tx * 16 + 8)) < 1);
    const grabbed = (tx: number) => (w: World) => !!w.player.grip && w.player.grip === palmAt(w, tx);
    const onCrown = (w: World) => w.player.onGround && !w.player.grip;
    const crownEdge = (w: World) => {
      const g: any = w.player.groundSolid;
      return !!g && w.player.x + w.player.w >= g.x + g.w - 2;
    };
    return [
      { hold: 'R', until: X(x + 1.2), max: 300 },
      { hold: 'R', jump: 14, until: grabbed(x + 4), max: 160, note: 'jump at the palm with the crab in its crown' },
      { hold: 'R', until: (w) => w.player.gripS >= 0.5, max: 400, note: 'climb only part way' },
      { hold: '', ticks: 6 },
      { hold: 'R', jump: 14, until: grabbed(x + 8), max: 200, note: 'and leap from the trunk to the next palm' },
      { hold: 'R', until: onCrown, max: 600, note: 'up on its crown: this one is clear' },
      { hold: 'R', until: crownEdge, max: 60 },
      { hold: 'R', jump: 14, ticks: 14, note: 'for the bank' },
      { hold: 'R', until: and(ground, X(x + 17)), max: 400 },
      { hold: 'R', until: X(x + 30), max: 300 },
    ];
  },
  'kvt10-irandu': (x) => {
    /** the twice-moray at column c has struck twice and is resting */
    const rests = (c: number) => (w: World) => w.entities.some((e) => e instanceof Eel && e.x === px(c) + 8 && e.strikes >= 2 && e.state === 'rest') && still(w);
    return [
      { hold: 'R', until: X(x + 6.4), max: 300, note: 'bait the first moray, and wait for its second strike' },
      { hold: '', until: rests(x + 8), max: 900 },
      { hold: 'R', until: X(x + 15.4), max: 300, note: 'and the second' },
      { hold: '', until: rests(x + 17), max: 900 },
      { hold: 'R', until: X(x + 26), max: 300 },
    ];
  },
  'kvt10-kaattu': (x) => [
    { hold: 'R', until: X(x + 3.7), max: 300, note: 'to the edge: wait for the breeze' },
    { hold: '', until: (w) => still(w) && gustNOn(w, 0) && gustNLeft(w, 0) > 1.0, max: 900 },
    { hold: 'R', jump: 30, ticks: 60, long: true, note: 'and jump while it blows' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: X(x + 19.7), max: 300, note: 'the next inlet: the breeze in your face, so jump in the calm' },
    { hold: '', until: (w) => still(w) && !gustNOn(w, 1) && gustNLeft(w, 1) > 1.0, max: 900 },
    { hold: 'R', jump: 30, ticks: 60, long: true },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: X(x + 36), max: 300 },
  ],
  'kvt10-kamaanam': (x) => [
    { hold: 'R', until: X(x + 1.4), max: 300, note: 'wait on the sand for the dolphin' },
    { hold: '', ticks: 6 },
    { policy: rideDolphin(`kvt10-kamaanam:dolphins`, 0, px(x + 17), 0.86, 0), until: (w) => w.player.onGround && w.player.x >= px(x + 17) && Math.abs(w.player.vx) < 1, max: 1500, note: 'ride it over the top, under the arch, and step off coming down' },
    { hold: 'R', until: X(x + 22), max: 200 },
  ],
  'kvt10-nizhal': (x) => {
    const st = (w: World, i: number) => (w.flags['kvt10-nizhal:steps'] as ShadowStep[])[i];
    const passed = (i: number) => (w: World) => still(w) && !st(w, i).isLit(w) && st(w, i).at(w) >= 0.85 && st(w, i).at(w) < 1.95;
    const onto = (i: number, from: number, r: number, note?: string): Step[] => [
      { steer: (w: World) => (w.player.x < px(from) - 1 ? 'R' : w.player.x > px(from) + 1 ? 'L' : '') as Move, until: (w: World) => Math.abs(w.player.x - px(from)) <= 1, max: 120, ...(note ? { note } : {}) },
      { hold: '', until: passed(i), max: 600 },
      { hold: 'R', jump: 10, ticks: r },
      { hold: '', until: ground, max: 200 },
      { hold: '', ticks: 4 },
    ];
    return [
      { hold: 'R', until: X(x + 2), max: 300 },
      ...onto(0, x + 2.2, 26, 'on to each step just after the beam has gone over it'),
      ...onto(1, x + 4.7, 40),
      ...onto(2, x + 8.7, 40),
      ...onto(3, x + 12.7, 40),
      { steer: (w: World) => (w.player.x < px(x + 16.7) - 1 ? 'R' : w.player.x > px(x + 16.7) + 1 ? 'L' : '') as Move, until: (w: World) => Math.abs(w.player.x - px(x + 16.7)) <= 1, max: 120 },
      { hold: '', until: still, max: 100 },
      { hold: 'R', jump: 10, ticks: 40, note: 'and the shore' },
      { hold: 'R', until: ground, max: 200 },
      { hold: 'R', until: X(x + 24), max: 300 },
    ];
  },
  'kvt10-paaru': (x) => [
    { hold: 'R', until: X(x + 3.2), max: 300, note: 'jump out over the water: this reef comes up for a jumper' },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: X(x + 7.4), max: 200 },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: X(x + 11.4), max: 200 },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: X(x + 15.4), max: 200 },
    { hold: 'R', jump: 12, ticks: 12, note: 'and the shore' },
    { hold: 'R', until: and(ground, X(x + 22)), max: 300 },
  ],
  'kvt10-kotta': (x) => {
    const basket = (w: World) => w.flags['kvt10-kotta:basket'] as any;
    return [
      { hold: 'R', until: X(x + 0.3), max: 300, note: 'up to the high pier' },
      { hold: '', until: still, max: 60 },
      { hold: 'R', jump: 14, ticks: 24 },
      { hold: '', until: ground, max: 200 },
      { hold: 'R', until: X(x + 2.3), max: 200 },
      { hold: '', until: still, max: 60 },
      { hold: 'R', jump: 14, ticks: 24 },
      { hold: '', until: ground, max: 200 },
      { hold: 'R', until: (w) => w.standing(basket(w).solid), max: 300, note: 'into the basket: it goes down' },
      { steer: (w: World) => (w.player.cx < basket(w).cx - 2 ? 'R' : w.player.cx > basket(w).cx + 2 ? 'L' : '') as Move, until: (w: World) => basket(w).solid.y >= px(14) - 6, max: 600, note: 'step off on to the landing as it passes' },
      { hold: 'R', jump: 10, ticks: 20 },
      { hold: 'R', until: and(ground, X(x + 24)), max: 300 },
    ];
  },
  'kvt10-kannadi': (x) => [{ hold: 'R', until: and(ground, X(x + 20)), max: 400, note: 'run straight across the cracked glass, flat out' }],
  'kvt10-thoni': (x) => {
    const boat = (w: World) => w.flags['kvt10-thoni:boat'] as any;
    return [
      { hold: 'R', until: X(x + 6.2), max: 400, note: 'run down the jetty after the boat: it is not coming back' },
      { hold: 'R', jump: 12, ticks: 12, note: 'and aboard' },
      { hold: 'R', until: (w) => w.player.onGround, max: 200 },
      { steer: (w: World) => (w.player.cx < boat(w).cx - 3 ? 'R' : w.player.cx > boat(w).cx + 3 ? 'L' : '') as Move, until: (w: World) => boat(w).state === 'rest' && w.player.onGround, max: 900, note: 'ride it over' },
      { hold: 'R', until: (w) => w.player.x + w.player.w >= boat(w).solid.x + boat(w).solid.w - 2, max: 200 },
      { hold: 'R', jump: 12, ticks: 12, note: 'off at the far side' },
      { hold: 'R', until: and(ground, X(x + 30)), max: 300 },
    ];
  },
  'kvt10-veliyettam': (x) => [
    ...hop(x + 1.6, 12, 'from head to head, never stopping'),
    ...hop(x + 6.6, 12, 'the next head'),
    ...hop(x + 11.6, 12, 'the next'),
    ...hop(x + 16.6, 12, 'and the next'),
    ...hop(x + 21.6, 12, 'and on'),
    ...hop(x + 26.6, 12, 'on'),
    ...hop(x + 31.6, 12, 'the last'),
    ...hop(x + 36.6, 12, 'and the shore'),
    { hold: 'R', until: X(x + 44), max: 300 },
  ],
  'kvt10-irakkam': (x) => {
    const tide = (i: number) => (w: World) => (w.flags['kvt10-irakkam:tide'] as boolean[])[i] && still(w);
    const eelRests = (w: World) => w.entities.some((e) => e instanceof Eel && e.state === 'rest' && e.x > px(x + 10)) && still(w);
    return [
      { hold: 'R', until: X(x + 2.2), max: 400, note: 'to the edge: the tide is going out' },
      { hold: '', until: tide(0), max: 600, note: 'wait till the step is down to its top' },
      { hold: 'R', jump: 30, ticks: 48, long: true, note: 'on to the coral top' },
      { hold: '', until: ground, max: 200 },
      { hold: '', until: still, max: 100 },
      { hold: 'R', jump: 30, ticks: 42, long: true, note: 'off it, on to the rock' },
      { hold: '', until: ground, max: 200 },
      { hold: '', until: eelRests, max: 600, note: 'the hole with eyes: let the moray lunge and go back in' },
      { hold: 'R', until: X(x + 13.2), max: 300, note: 'now across' },
      { hold: '', until: tide(1), max: 600, note: 'wait for the second step' },
      { hold: 'R', jump: 30, ticks: 48, long: true },
      { hold: '', until: ground, max: 200 },
      { hold: '', until: still, max: 100 },
      { hold: 'R', jump: 30, ticks: 42, long: true },
      { hold: '', until: ground, max: 200 },
      { hold: 'R', until: X(x + 24), max: 400 },
    ];
  },
  // KVT-08's dolphins: the shared ride, tuned for a person: off each dolphin a little before the top of its leap
  'kvt08-dolphins': (x) => [
    { hold: 'R', until: X(x + 1.4), max: 300 },
    { hold: '', ticks: 6 },
    { policy: rideDolphin(`kvt08-dolphins:dolphins`, 0, px(x + 16), 0.56, 0.06), until: (w) => w.player.onGround && w.player.x >= px(x + 16) && Math.abs(w.player.vx) < 1, max: 1500, note: 'ride the first dolphin to the sand' },
    { policy: rideDolphin(`kvt08-dolphins:dolphins`, 1, px(x + 34), 0.55, 0.06), until: (w) => w.player.onGround && w.player.x >= px(x + 34), max: 1500, note: 'and the second, to the beach' },
    { hold: 'R', until: X(x + 38), max: 200 },
  ],
  'kvt06-air': (x) => [
    ...upRim(x),
    {
      policy: swimTo([
        { x: px(x + 10), y: 236, tx: 8 },
        { x: px(x + 18.2), y: 221, tx: 6 },
        { x: px(x + 20), y: 172, tx: 5, ty: 6, wait: airFull },
        { x: px(x + 20), y: 221, yFirst: true },
        { x: px(x + 35.2), y: 221, tx: 6 },
        { x: px(x + 38.5), y: 120, tx: 4, ty: 4 },
      ]),
      until: (w) => w.player.y + w.player.h <= 176 && !w.player.swimming && w.player.x > px(x + 37),
      max: 4000,
      note: 'breathe in the pocket, go over the turtle, come up at the far end',
    },
    { hold: 'R', until: and(ground, X(x + 44)), max: 400 },
  ],
  // KVT-06's eel alley: the shared line, but a swimmer who calls a point reached within 6 px of its depth (the
  // shared one, 3 px, hovers 4 px off forever when his thumb is late, and drowns there)
  'kvt06-eels': (x) => [
    ...upRim(x),
    {
      policy: swimTo([
        { x: px(x + 10), y: 218, tx: 8, ty: 3 },
        { x: px(x + 15.6), y: 218, tx: 4, ty: 3 },
        { x: px(x + 15.8), y: 258, yFirst: true, ty: 4 },
        { x: px(x + 19.5), y: 258, tx: 5 },
        { x: px(x + 21), y: 172, tx: 5, ty: 6, wait: airFull },
        { x: px(x + 21), y: 218, yFirst: true, ty: 3 },
        { x: px(x + 25.6), y: 218, tx: 4, ty: 3 },
        { x: px(x + 25.6), y: 240, yFirst: true, ty: 4 },
        { x: px(x + 31), y: 240, tx: 6 },
        { x: px(x + 37.5), y: 120, tx: 4, ty: 4 },
      ]),
      until: (w) => w.player.y + w.player.h <= 176 && !w.player.swimming && w.player.x > px(x + 36),
      max: 4000,
      note: 'over the floor eels, under the roof one, through the middle of the pair',
    },
    { hold: 'R', until: and(ground, X(x + 42)), max: 400 },
  ],
  'kvt09-pavizham': (x) => [
    ...deepOn(x + 3.3, 20, 'stop at the water, land deep'),
    ...stepUp(x + 8, 'up under the lip: a tap, never a full leap'),
    ...stepUp(x + 11),
    ...stepUp(x + 14),
    ...stepUp(x + 17),
    ...stepUp(x + 20),
    ...stepUp(x + 23),
    { hold: 'R', until: X(x + 40.6), max: 600, note: 'along the crest and down' },
  ],
  'kvt09-kodumudi': (x) => [
    ...deepOn(x + 2.3, 20, 'stop at the water, land deep'),
    ...stepUp(x + 7),
    ...stepUp(x + 10),
    ...stepUp(x + 13),
    ...stepUp(x + 16, 'the narrow steps: walk to the far tile, then up'),
    ...stepUp(x + 18),
    ...stepUp(x + 20),
    ...stepUp(x + 22),
    ...stepUp(x + 24),
    { hold: 'R', until: X(x + 30.2), max: 300, note: 'along the top' },
    // down the far side: walk off each step (you land at its back, the slide puts you in the middle)
    ...Array.from({ length: 8 }, (_, i): Step[] => [
      { hold: 'R', until: (w) => w.player.x >= px(x + 31 + i * 3 - 0.2) || w.state !== 'play', max: 200, ...(i === 0 ? { note: 'walk off each step, never hop down' } : {}) },
      { hold: '', until: (w) => (w.player.onGround && !w.flags.kvtSlide && w.player.x >= px(x + 31 + i * 3)) || w.state !== 'play', max: 200 },
    ]).flat(),
    { hold: 'R', until: X(x + 53.6), max: 200 },
    { hold: 'R', jump: 12, ticks: 12, note: 'over the water at the bottom' },
    { hold: 'R', until: and(ground, X(x + 59)), max: 300 },
  ],
  'kvt09-kadalbhitti': (x) => [
    { hold: 'R', until: X(x + 1.3), max: 300, note: 'to the foot of the rubble' },
    { hold: '', until: still, max: 60 },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: ground, max: 200 },
    { hold: '', until: still, max: 200 },
    ...stepUp(x + 4),
    ...stepUp(x + 7),
    ...stepUp(x + 10),
    ...stepUp(x + 13),
    ...stepUp(x + 16),
    ...stepUp(x + 19, 'up on to the sea wall'),
    ...deepOn(x + 24.3, 30, 'the first break: land deep on the heap'),
    ...stepUp(x + 29, 'back up on to the wall'),
    ...deepOn(x + 32.3, 30, 'the second break: one loose block, jump it whole'),
    { hold: 'R', until: and(ground, X(x + 50)), max: 600, note: 'along the wall and down' },
  ],
  'kvt09-irangal': (x) => [
    // up the plain rock stair: from the foot of each riser, a tap with the thumb off the stick mid-air
    ...[1, 4, 7, 10].flatMap((c, i): Step[] => [
      { hold: 'R', until: X(x + c + 0.3), max: 300, ...(i === 0 ? { note: 'up the rock stair' } : {}) },
      { hold: '', until: still, max: 60 },
      { hold: 'R', jump: 14, ticks: 24 },
      { hold: '', until: ground, max: 200 },
      { hold: '', until: still, max: 200 },
    ]),
    { hold: 'R', until: X(x + 15), max: 300, note: 'walk off the top on to the first wide step' },
    { hold: '', until: ground, max: 200 },
    { hold: '', ticks: 4 },
    { hold: '', until: still, max: 200 },
    { hold: 'R', jump: 10, ticks: 38, note: 'over the narrow step' },
    { hold: '', until: ground, max: 200 },
    { hold: '', ticks: 4 },
    { hold: '', until: still, max: 200 },
    { hold: 'R', jump: 10, ticks: 38, note: 'and the next narrow one' },
    { hold: '', until: ground, max: 200 },
    { hold: '', ticks: 4 },
    { hold: '', until: still, max: 200 },
    { hold: 'R', jump: 10, ticks: 38, note: 'and the last narrow one' },
    { hold: '', until: ground, max: 200 },
    { hold: '', ticks: 4 },
    { hold: '', until: still, max: 200 },
    { hold: 'R', jump: 20, ticks: 20, long: true, note: 'over the water' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: X(x + 41), max: 400 },
  ],
  'kvt09-varambu': (x) => {
    /** from the middle of the heap whose middle column is `from` (or the ridge's foot), a jump to the next middle */
    const mid = (from: number, j: number, r: number, note?: string): Step[] => [
      { hold: '', until: still, max: 200, ...(note ? { note } : {}) },
      ...(from > 0
        ? [
            { steer: (w: World) => (w.player.x < px(from + 0.19) - 1 ? 'R' : w.player.x > px(from + 0.19) + 1 ? 'L' : '') as Move, until: (w: World) => Math.abs(w.player.x - px(from + 0.19)) <= 1, max: 120 },
            { hold: '' as const, until: still, max: 60 },
          ]
        : []),
      { hold: 'R', jump: j, ticks: r },
      { hold: '', until: ground, max: 200 },
      { hold: '', ticks: 4 },
      { hold: '', until: still, max: 200 },
    ];
    return [
      { hold: 'R', until: X(x - 0.8), max: 200 },
      { hold: 'R', jump: 16, ticks: 16, long: true, note: 'up on to the ridge' },
      { hold: 'R', until: ground, max: 200 },
      { hold: 'R', until: X(x + 1.3), max: 200 },
      ...mid(0, 12, 30, 'the middle of each heap: deep slides you off the far side'),
      ...[4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44].flatMap((c) => mid(x + c, 30, 52)),
      { hold: 'R', until: X(x + 51.2), max: 300 },
    ];
  },
  'kvt09-kuzhi': (x) => [
    ...[0.3, 3.3, 6.3].flatMap((c, i): Step[] => [
      { hold: 'R', until: X(x + c), max: 300, ...(i === 0 ? { note: 'up the rock to the rim of the hollow' } : {}) },
      { hold: '', until: still, max: 60 },
      { hold: 'R', jump: 14, ticks: 24 },
      { hold: '', until: ground, max: 200 },
    ]),
    // down: walk off each step (you land at its back and the slide pushes you on to its middle)
    ...[10, 13, 16, 19].flatMap((c, i): Step[] => [
      { hold: 'R', until: (w) => w.player.x >= px(x + c - 0.2) || w.state !== 'play', max: 300, ...(i === 0 ? { note: 'down into the hollow: walk off each step' } : {}) },
      { hold: '', until: (w) => (w.player.onGround && !w.flags.kvtSlide && w.player.x >= px(x + c)) || w.state !== 'play', max: 200 },
    ]),
    { hold: '', until: still, max: 100 },
    { hold: 'R', until: X(x + 21.3), max: 200, note: 'over the pool, and land deep on the far side' },
    { hold: '', until: still, max: 60 },
    { hold: 'R', jump: 30, ticks: 48 },
    { hold: '', until: ground, max: 200 },
    { hold: '', until: still, max: 200 },
    ...stepUp(x + 25),
    ...stepUp(x + 28),
    ...stepUp(x + 31),
    ...stepUp(x + 34, 'up on to the far rim'),
    { hold: 'R', until: and(ground, X(x + 43.2)), max: 400 },
  ],
  'kvt09-murivu': (x) => [
    { hold: 'R', until: X(x - 0.2), max: 200 },
    { hold: 'R', jump: 16, ticks: 16, long: true, note: 'up on to the breached crest' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: and(ground, X(x + 4.6)), max: 400 },
    { hold: 'R', jump: 30, ticks: 30, long: true, note: 'well past the first cut' },
    { hold: 'R', until: ground, max: 200 },
    { hold: '', until: still, max: 200 },
    { hold: 'R', until: X(x + 14.6), max: 400 },
    { hold: 'R', jump: 30, ticks: 30, long: true, note: 'and well past the second' },
    { hold: 'R', until: ground, max: 200 },
    { hold: '', until: still, max: 200 },
    { hold: 'R', until: X(x + 24.6), max: 400 },
    { hold: 'R', jump: 30, ticks: 30, long: true, note: 'and the third' },
    { hold: 'R', until: ground, max: 200 },
    { hold: '', until: still, max: 200 },
    { hold: 'R', until: X(x + 40), max: 400 },
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
    // in the air: steer for the target, letting go early (he keeps drifting). The steer starts a few ticks after
    // the jump, so a late thumb on it doesn't also keep it held on after it should let go
    if (!p.onGround) {
      m.air = (m.air ?? 0) + 1;
      return go(m.air > 3 && m.tx !== undefined && p.cx < m.tx - 9 ? 'R' : '');
    }
    m.air = 0;
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
    return jump(w, m, 14, '');
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
      m.sw = swimTo([
        { x: lx - 6, y: ky, tx: 4, ty: 4, wait: (w2) => w2.flags.twist === 'ok' },
        { x: d.x - 62, y: 200, tx: 4, yFirst: false },
        { x: d.x - 54, y: 120, tx: 4, ty: 30 },
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

/** run right, and hop anything coming at you once it is `ttc` seconds away (the jump held `hold` ticks) */
function hopAt(ttc: number, hold: number): (w: World) => Out {
  let seen: World | null = null;
  let left = 0;
  return (w) => {
    if (seen !== w) {
      seen = w;
      left = 0;
    }
    const p = w.player;
    if (left > 0) {
      left--;
      return { move: 'R', jump: true };
    }
    if (!p.onGround) return go('R');
    for (const e of w.entities as any[]) {
      if (!e.alive || !(e.vx < 0) || !e.hazard?.active || e.x === undefined) continue;
      if (e.y + (e.h ?? 12) < p.y - 6 || e.y > p.y + p.h + 2) continue;
      const ahead = e.x - (p.x + p.w);
      if (ahead > -4 && ahead / (-e.vx + Math.max(0, p.vx)) <= ttc) {
        left = hold - 1;
        return { move: 'R', jump: true };
      }
    }
    return go('R');
  };
}

/** KVT-05's lighthouse: up the zigzag steps, straight up through each from under the overlap, never into a gull */
function lighthouse(): (w: World) => Out {
  let seen: World | null = null;
  let left = 0;
  return (w) => {
    if (seen !== w) {
      seen = w;
      left = 0;
    }
    const p = w.player;
    if (left > 0) {
      left--;
      return { move: '', jump: true };
    }
    if (!p.onGround) return go('');
    const feet = Math.round((p.y + p.h) / 16);
    if (feet <= 5) return go('R');
    // the first step from the shore: a running hop on to its middle
    if (feet >= 13) {
      if (p.x < px(22.6)) return go('R');
      left = 13;
      return { move: 'R', jump: true };
    }
    // under the overlap at column 26, still
    const target = px(26.05);
    if (Math.abs(p.x - target) > 2.5) return go(p.x < target ? 'R' : 'L');
    if (Math.abs(p.vx) > 1) return go('');
    if (w.entities.some((e: any) => e.kind === 'crow' && e.alive && e.x > p.x - 30)) return go('');
    left = 13;
    return { move: '', jump: true };
  };
}

// ------------------------------------------------------------------ the dolphins (KVT-08), from tests/acts.ts
/** wait on the sand for dolphin i, run out with it, hop on, ride, jump off at `off` of its leap, stop on the land.
 *  `lead` s: how early to start the run (a person starts a moment before the leap, not on the frame) */
const rideDolphin = (key: string, i: number, landX0: number, off: number, lead: number, bankEdge = Infinity) => {
  let st = 0,
    hold = 0,
    world: World | null = null;
  return (w: World): Out => {
    if (world !== w) {
      world = w;
      st = 0;
      hold = 0;
    }
    const d = (w.flags[key] as Dolphin[])[i];
    const p = w.player;
    const mid = d.solid.x + 22;
    if (hold > 0) {
      hold--;
      return { move: st === 3 ? 'R' : mid > p.cx + 2 ? 'R' : '', jump: true };
    }
    if (st === 0) {
      const t = (((w.tick * DT + d.phase) % d.period) + d.period) % d.period;
      const until = d.period - t;
      const dist = d.x0 - 10 - p.cx;
      if (d.k < 0 && until <= Math.max(0, dist) / 140 + lead) st = 1;
      return { move: '', jump: false };
    }
    if (st === 1) {
      if (w.standing(d.solid as never)) st = 2;
      // (never run off the sand before the dolphin is up)
      else if (d.k < 0 && p.onGround && p.x + p.w >= bankEdge - 1) return { move: '', jump: false };
      else if (p.onGround && d.k >= 0 && !w.input.jump) {
        hold = 9;
        return { move: 'R', jump: true };
      }
      return { move: p.onGround || mid > p.cx + 2 ? 'R' : '', jump: false };
    }
    if (st === 2) {
      if (d.k >= off) {
        st = 3;
        hold = 14;
        return { move: 'R', jump: true };
      }
      return { move: mid > p.cx + 3 ? 'R' : mid < p.cx - 3 ? 'L' : '', jump: false };
    }
    if (p.onGround && p.x >= landX0 + 2) return { move: '', jump: false };
    return { move: p.cx < landX0 + 14 ? 'R' : '', jump: false };
  };
};

// ------------------------------------------------------------------ the reef (KVT-06), as in tests/acts.ts
const upRim = (x: number): Step[] => [
  { hold: 'R', until: X(x + 1.6), max: 400 },
  { hold: 'R', jump: 14, ticks: 14, note: 'up the rock' },
  { hold: 'R', until: and(ground, X(x + 3.6)), max: 200 },
  { hold: 'R', jump: 14, ticks: 14, note: 'up to the rim' },
  { hold: 'R', until: (w) => w.player.swimming, max: 300, note: 'and in' },
];
const airFull = (w: World) => w.player.air > 4.95;
/** jellyfish i is drifting down, well under the surface: room to swim over it (as in tests/solutions.ts) */
const jellyLow = (i: number) => (w: World) => {
  const j = w.entities.filter((e) => e instanceof Jelly)[i] as Jelly;
  const k = ((((w.tick * DT + j.phase) % j.period) + j.period) % j.period) / j.period;
  return k >= 0.28 && j.y > 200;
};
interface SwimPt {
  x: number;
  y: number;
  tx?: number;
  ty?: number;
  yFirst?: boolean;
  wait?: (w: World) => boolean;
}
/** tests/moves.ts's swimmer, with one change: a point counts as reached anywhere he would hover at it. (The
 *  shared one hovers from 8 px above a point but only calls it reached within `ty`: a late thumb that settles
 *  6 px high hovers there for ever, and drowns.) */
function swimTo(pts: SwimPt[]) {
  let i = 0,
    last = -99,
    world: World | null = null;
  return (w: World): Out => {
    if (world !== w) {
      world = w;
      i = 0;
      last = -99;
    }
    const p = w.player;
    let pt = pts[Math.min(i, pts.length - 1)];
    const band = (q: SwimPt) => (q.ty ?? 5) - 1;
    const near = (q: SwimPt) => Math.abs(q.x - p.cx) < (q.tx ?? 4) && q.y - p.cy <= band(q) && q.y - p.cy >= -Math.max(8, band(q) + 3);
    while (i < pts.length && near(pt) && (!pt.wait || pt.wait(w))) {
      i++;
      pt = pts[Math.min(i, pts.length - 1)];
    }
    const dx = pt.x - p.cx,
      dy = pt.y - p.cy;
    let jump: boolean;
    if (dy < -Math.max(8, band(pt) + 3)) {
      if (w.tick - last >= 14) {
        if (w.input.jump) jump = false;
        else {
          jump = true;
          last = w.tick;
        }
      } else jump = true;
    } else if (dy > band(pt)) jump = false;
    else jump = true;
    const yOk = !pt.yFirst || Math.abs(dy) < 8;
    const move: Move = yOk && Math.abs(dx) > 3 ? (dx > 0 ? 'R' : 'L') : '';
    return { move, jump };
  };
}

// ------------------------------------------------------------------ the tour's coral step (KVT-01)
const coral = (st: string) => (w: World) => w.flags.coral === st;
/** wait at the water's edge for the tide to finish, then a timed jump on to the coral top and one off it */
const coralCrossing = (r1: number, r2: number): Step[] => [
  { hold: 'R', until: X(81.2), max: 600, note: 'to the water’s edge' },
  { hold: '', until: (w) => coral('top')(w) && still(w), max: 600, note: 'wait for the tide: the step shrinks to its top' },
  { hold: 'R', jump: 30, ticks: r1, long: true, note: 'on to the coral top' },
  { hold: '', until: ground, max: 200 },
  { hold: '', until: still, max: 100 },
  { hold: 'R', jump: 30, ticks: r2, long: true, note: 'and off to the beach' },
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
  // (up the lighthouse steps by a climber who just tries the hop again if a gull or a late thumb drops him a step)
  {
    const r = S['KVT-05'];
    const i = r.findIndex((st) => st.note === 'first step');
    S['KVT-05'] = [...r.slice(0, i), { policy: lighthouse(), until: (w) => w.player.onGround && w.player.y + w.player.h <= px(5) + 1 && w.player.x >= px(27), max: 2400, note: 'up the lighthouse steps' }];
  }
  lengthen('KVT-05', 0, [{ hold: 'R', until: X(44), max: 600, note: 'over the top of the lighthouse and down the steps' }]);

  // ---------------------------------------------------------------- KVT-04: hop the tug from further off
  // (a person sees the tug coming the whole width of the screen and hops it a fifth of a second out, not at the last moment)
  S['KVT-04'] = S['KVT-04'].map((st) => (st.note === 'hop the baggage tug' ? { ...st, dodge: undefined, policy: hopAt(0.16, 12) } : st));

  // the runway lights were spikes: so hop every light and run on. The baggage tug comes the other way
  fix['KVT-04'] = { steps: [...upTo(S['KVT-04'], 'hop the baggage tug'), { hold: 'R', until: done, max: 600 }], cause: 'hit' };

  // ---------------------------------------------------------------- KVT-06: the same swim, by the swimmer above
  {
    const r = S['KVT-06'];
    const i = r.findIndex((st) => st.note === 'under the sea stack, between the jellyfish, up at the pier');
    r[i] = {
      ...r[i],
      policy: swimTo([
        { x: 190, y: 236, tx: 6 },
        { x: 270, y: 236, tx: 6 },
        { x: 285, y: 148, tx: 5, ty: 4, wait: jellyLow(0) },
        { x: 345, y: 148, tx: 5, ty: 4, wait: jellyLow(1) },
        { x: 425, y: 148, tx: 6, ty: 4 },
        { x: 475, y: 100, tx: 4, ty: 4 },
      ]),
    };
    // (a leap out that clears the pier and lands on the rocks past it is just as good)
    const j = r.findIndex((st) => st.note === 'on to the pier');
    r[j] = { ...r[j], until: (w) => w.player.onGround && (w.player.y < 128 || w.player.x >= px(32)) };
  }

  // ---------------------------------------------------------------- KVT-06 to 08: the obvious plays
  // straight in off the jetty and on along the bottom: the urchins under the sea stack
  naive['KVT-06'] = { steps: [{ hold: 'R', until: done, max: 1500 }], cause: 'spikes' };
  // the crab is up the trunk: jump for it anyway, straight away
  naive['KVT-07'] = { steps: swapAt(S['KVT-07'], 'wait for the crab to head down low', 1, []), cause: 'kvt-pinched' };
  // wait for the crab, then leap on from low down on the bare trunk, where you grabbed it: short of the crown
  fix['KVT-07'] = { steps: [...upTo(S['KVT-07'], 'climb high, above the crab'), { hold: 'R', until: (w) => w.player.gripS >= 0.3, max: 300 }, { hold: 'R', jump: 14, ticks: 14 }, { hold: 'R', until: done, max: 600 }], cause: 'splash' };
  // the urchins were on the bottom: so swim over them, straight on, without waiting for the jellyfish
  fix['KVT-06'] = {
    steps: [
      { hold: 'R', until: (w) => w.player.swimming, max: 300 },
      { policy: swimTo([{ x: 190, y: 236, tx: 6 }, { x: 270, y: 236, tx: 6 }, { x: 300, y: 200, tx: 6, ty: 6 }, { x: 420, y: 200, tx: 6, ty: 6 }, { x: 475, y: 100, tx: 4, ty: 4 }]), until: done, max: 1500 },
    ],
    cause: 'kvt-stung',
  };
  // flat out across the lagoon, into the rock
  naive['KVT-08'] = { steps: [{ hold: 'R', until: done, max: 1500 }], cause: 'splash' };
  // hop the rock and keep running flat out: the seaweed beds after the beach slow you down, and down you go
  fix['KVT-08'] = { steps: [...upTo(S['KVT-08'], 'flat out, hopping every seaweed bed'), { hold: 'R', until: done, max: 900 }], cause: 'splash' };

  // ---------------------------------------------------------------- more first-timer mistakes, 03 to 07
  mistakes['KVT-06'] = [
    { what: 'under the reef roof, swim straight on without going up into the air pocket', steps: [...upTo(S['KVT-06'], 'breathe in the pocket, go over the turtle, come up at the far end'), { policy: swimTo([{ x: px(40 + 10), y: 236, tx: 8 }, { x: px(40 + 35.2), y: 221, tx: 6 }]), until: done, max: 2000 }], cause: 'drowned' },
    { what: 'swim through the moray alley in a straight line', steps: [...upTo(S['KVT-06'], 'over the floor eels, under the roof one, through the middle of the pair'), { policy: swimTo([{ x: px(84 + 10), y: 240, tx: 8 }, { x: px(84 + 31), y: 240, tx: 6 }]), until: done, max: 2000 }], cause: 'kvt-bitten' },
  ];
  mistakes['KVT-07'] = [
    { what: 'climb high on the bare trunk and stay there, out of the crab’s way', steps: [...upTo(S['KVT-07'], 'leap for the next crown'), { hold: '', until: done, max: 1500 }], cause: 'kvt-pinched' },
    { what: 'climb the bare trunk only a little and wait for the crab to pass', steps: [...upTo(S['KVT-07'], 'climb high, above the crab'), { hold: '', until: done, max: 1500 }], cause: 'kvt-pinched' },
  ];
  mistakes['KVT-03'] = [{ what: 'hop on to the first step of light before the beam reaches it', steps: [{ hold: 'R', until: X(6.1), max: 300 }, { hold: 'R', jump: 12, ticks: 12 }, { hold: 'R', until: done, max: 600 }], cause: 'splash' }];
  mistakes['KVT-04'] = [{ what: 'walk on into the propellers without waiting for them to pause', steps: [...upTo(S['KVT-04'], 'wait for the propellers to pause'), { hold: 'R', until: done, max: 600 }], cause: 'spikes' }];
  mistakes['KVT-05'] = [{ what: 'wait for the boat at the very end of the pier, in the tuna’s way', steps: [{ hold: 'R', until: X(7.0), max: 300 }, { hold: '', until: (w) => thingOf(w, 'odam').x >= px(15), max: 900 }, { hold: 'R', until: X(9.2), max: 200 }, { hold: 'R', jump: 14, ticks: 14 }, { hold: 'R', until: done, max: 400 }], cause: 'hit' }];

  // ---------------------------------------------------------------- KVT-10
  S['KVT-10'] = kvt10Room;
  lengthen('KVT-10', 0, []);
  // the dark hole looks like a pit, so jump it: straight on to the bright head past it, the octopus
  naive['KVT-10'] = { steps: [...hop(4.4, 12, 'on to the first coral head'), ...hop(10.3, 30, 'over the dark hole'), dies], cause: 'kvt-octopus' };
  // the dark hole was the safe one: so trust dark holes. The bare one goes right through to the lagoon
  fix['KVT-10'] = { steps: [...upTo(S['KVT-10'], 'the far side of the bare hole: it goes right through'), ...hop(32 + 7.0, 12, 'into the dark hole'), dies], cause: 'splash' };
  mistakes['KVT-10'] = [
    { what: 'land on the pink head: it was yellow a moment ago', steps: [...upTo(S['KVT-10'], 'over the pink one: that pink moved'), ...hop(32 + 22.6, 12, 'on to the pink head'), dies], cause: 'kvt-octopus' },
    { what: 'walk to the far end of the first rubble step and tap up, as at Kalpeni', steps: [...upTo(S['KVT-10'], 'not the far end this time: the middle'), ...stepUp(100 + 7), dies], cause: 'kvt-octopus' },
    { what: 'stop for the baby turtles, as on the jetty at Kavaratti', steps: [...upTo(S['KVT-10'], 'run on: the babies are coming your way'), { hold: 'R', until: X(130 + 10), max: 300 }, { hold: '', until: done, max: 900 }], cause: 'kvt-hatchling' },
    {
      what: 'hop the tuna as they come, as in Minicoy',
      steps: [
        ...upTo(S['KVT-10'], 'walk under the tuna; hop the gap once one has gone over'),
        { hold: 'R', until: X(172 + 6), max: 300 },
        { policy: (w) => ({ move: '', jump: w.player.onGround && w.entities.some((e: any) => e.kind === 'kvt-tuna' && e.alive && e.x - w.player.x > 20 && e.x - w.player.x < 40) }), until: done, max: 900 },
      ],
      cause: 'hit',
    },
    { what: 'climb right up on to the crown, as on the crab palms', steps: [...upTo(S['KVT-10'], 'climb only part way'), { hold: 'R', until: done, max: 900 }], cause: 'kvt-pinched' },
    { what: 'cross the moray hole once it has struck and slid back, as on the reef', steps: [...upTo(S['KVT-10'], 'bait the first moray, and wait for its second strike'), { hold: 'R', until: X(254 + 6.4), max: 300 }, { hold: '', until: (w) => w.entities.some((e) => e instanceof Eel && e.x === px(254 + 8) + 8 && e.strikes >= 1), max: 900 }, { hold: 'R', until: done, max: 300 }], cause: 'kvt-bitten' },
    { what: 'jump the inlet while the wind is calm, as at Agatti', steps: [...upTo(S['KVT-10'], 'to the edge: wait for the breeze'), { hold: 'R', until: X(280 + 3.7), max: 300 }, { hold: '', until: (w) => still(w) && !gustNOn(w, 0) && gustNLeft(w, 0) > 0.9, max: 900 }, { hold: 'R', jump: 30, ticks: 60 }, { hold: 'R', until: done, max: 300 }], cause: 'splash' },
    { what: 'jump off the dolphin at the top of its leap, as on the lagoon', steps: [...upTo(S['KVT-10'], 'ride it over the top, under the arch, and step off coming down'), { policy: rideDolphin(`kvt10-kamaanam:dolphins`, 0, px(316 + 17), 0.5, 0.06), until: done, max: 1500 }], cause: 'spikes' },
    {
      what: 'jump on to the first step as the beam lights it, as on Supari Light',
      steps: [
        ...upTo(S['KVT-10'], 'on to each step just after the beam has gone over it'),
        { hold: '', until: (w) => still(w) && (w.flags['kvt10-nizhal:steps'] as ShadowStep[])[0].at(w) > 2.65, max: 600 },
        { hold: 'R', jump: 10, ticks: 26 },
        { hold: '', until: done, max: 300 },
      ],
      cause: 'splash',
    },
    { what: 'stop on the first coral head in the incoming tide, as on the tour', steps: [...upTo(S['KVT-10'], 'from head to head, never stopping'), ...hop(362 + 1.6, 12, 'on to the first head', true), { hold: '', until: done, max: 400 }], cause: 'splash' },
    { what: 'walk off the edge on to the reef, as off the jetty at Supari Light', steps: [...upTo(S['KVT-10'], 'jump out over the water: this reef comes up for a jumper'), { hold: 'R', until: done, max: 300 }], cause: 'splash' },
    { what: 'stay in the fish basket till it stops, as in Minicoy', steps: [...upTo(S['KVT-10'], 'step off on to the landing as it passes'), { steer: (w: World) => (w.player.cx < (w.flags['kvt10-kotta:basket'] as any).cx - 2 ? 'R' : w.player.cx > (w.flags['kvt10-kotta:basket'] as any).cx + 2 ? 'L' : '') as Move, until: done, max: 900 }], cause: 'splash' },
    { what: 'walk slowly over the glass to see the fish, as Tara says', steps: [...upTo(S['KVT-10'], 'run straight across the cracked glass, flat out'), { hold: 'R', until: X(452 + 6), max: 300 }, { hold: '', until: done, max: 600 }], cause: 'splash' },
    { what: 'wait at the end of the jetty for the boat to come back, as at Kavaratti', steps: [...upTo(S['KVT-10'], 'run down the jetty after the boat: it is not coming back'), { hold: 'R', until: X(472 + 5.0), max: 400 }, { hold: '', until: done, max: 900 }], cause: 'splash' },
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
    { what: 'land deep on the first heap of the ridge, as on the bank', steps: [...upTo(S['KVT-09'], 'the middle of each heap: deep slides you off the far side'), { hold: '', until: still, max: 200 }, { hold: 'R', jump: 30, ticks: 44 }, { hold: '', until: ground, max: 200 }, dies], cause: 'splash' },
    { what: 'land on the one loose block in the second break, like the heap in the first', steps: [...upTo(S['KVT-09'], 'the second break: one loose block, jump it whole'), { hold: 'R', until: X(136 + 32.3), max: 300 }, { hold: '', until: still, max: 60 }, { hold: 'R', jump: 8, ticks: 10 }, { hold: '', until: (w) => w.player.onGround || w.state !== 'play', max: 200 }, dies], cause: 'splash' },
    { what: 'hop down the far side of the summit, as Tara says', steps: [...upTo(S['KVT-09'], 'walk off each step, never hop down'), ...Array.from({ length: 5 }, (): Step[] => [{ hold: 'R', jump: 12, ticks: 12 }, { hold: 'R', until: (w) => w.player.onGround || w.state !== 'play', max: 200 }, { hold: '', until: (w) => !w.flags.kvtSlide || w.state !== 'play', max: 200 }]).flat(), dies], cause: 'splash' },
    { what: 'a little hop over the storm cut, as Tara says', steps: [...upTo(S['KVT-09'], 'well past the first cut').slice(0, -1), { hold: 'R', until: X(324 + 5.2), max: 400 }, { hold: 'R', jump: 12, ticks: 12 }, { hold: 'R', until: done, max: 400 }], cause: 'splash' },
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
