// Chennai's own route file for the hardness pass. Its proven plays still live in the shared tables
// (tests/solutions.ts, tests/west.ts, tests/acts.ts, tests/endings.ts); anything set here is merged LAST and
// replaces that stage's (or act's, or ending's) entry there, so a hardness-pass worker edits only this file
// and the city's stage files. After a change on purpose: npm run refreeze -- CHN (docs/CITY-MODULE.md).
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import { type Step, X, and, done, ground, thingOf } from '../runner';
import type { CityTests } from '../city-tests';
import { ladleOf, murukkuOf, pressOf } from '../../src/game/cities/chn/murukku';
import { escalatorOf, stepUnder } from '../../src/game/cities/chn/spencer';
import { sundalOf } from '../../src/game/cities/chn/sundal';

type Move = 'L' | 'R' | '';
type Out = { move: Move; jump: boolean };
type Policy = (w: World, m: { hold: number; [k: string]: any }, d: Door) => Out;

const px = (t: number) => t * 16;
const go = (move: Move): Out => ({ move, jump: false });
const toward = (w: World, x: number, slack = 2): Move => (w.player.cx < x - slack ? 'R' : w.player.cx > x + slack ? 'L' : '');
const walk = (to: number, note?: string, max = 900): Step => ({ hold: 'R', until: and(ground, X(to)), max, note });
/** run right to tile x `at` (Dad's left edge), then a hop of `ticks` and land */
const hopAt = (at: number, ticks: number, note: string, long = false): Step[] => [
  { hold: 'R', until: X(at), max: 900 },
  { hold: 'R', jump: ticks, ticks, note, long },
  { hold: 'R', until: ground, max: 300 },
];
const until = (pred: (w: World) => boolean, note: string, max = 900): Step => ({ hold: '', until: pred, max, note });
const die: Step = { hold: 'R', until: done, max: 900 };
const stay: Step = { hold: '', until: done, max: 900 };
const fried = (name: string) => (w: World) => {
  const m = murukkuOf(w, name);
  return !!m && m.visible && m.fry === 'golden';
};
const quiet = (name: string) => (w: World) => {
  const m = murukkuOf(w, name);
  return !!m && m.visible && !m.bubbling;
};
const ladleHovers = (i: number) => (w: World) => ladleOf(w, i)?.state === 'hover';
const pressGone = (i: number) => (w: World) => {
  const p = pressOf(w, i);
  return !!p && (p.state === 'back' || p.state === 'park');
};

// ------------------------------------------------------------------ CHN-09: Murukku Press
/** the room: on to the golden spiral, wait for the pale one to fry, then straight on (the ladle takes the one you waited on) */
const murukkuRoom = (): Step[] => [
  ...hopAt(4.4, 12, 'on to the first golden spiral'),
  until(fried('r2'), 'wait on it for the pale one to turn golden'),
  ...hopAt(11.4, 12, 'on to it, the moment it turns'),
  ...hopAt(18.4, 12, 'and the next'),
  walk(31.5),
];

// ------------------------------------------------------------------ CHN-10: Spencer Escalators
const esc = (name: string) => (w: World) => escalatorOf(w, name)!;
/** stand on a step of escalator `name` */
const riding = (name: string) => (w: World) => esc(name)(w).dadOn;
/** up on to the kerb (the mount) before the escalator's foot at tile `foot` */
const mount = (foot: number): Step[] => [...hopAt(foot - 5.4, 12, 'up on the kerb'), { hold: 'R', until: and(ground, X(foot - 2.6)), max: 300 }];
/** back on to the kerb before tile `foot` (wherever the hop back put you: on it, or on the floor before it) */
const remount = (foot: number): Step => ({
  policy: (w) => ({ move: 'R', jump: w.player.onGround && w.player.y > px(13.5) && w.player.x > px(foot - 5.2) && w.player.x < px(foot - 3.1) }),
  until: (w) => w.player.onGround && w.player.y < px(13.5) && w.player.x >= px(foot - 2.6),
  max: 300,
  note: 'back up on the kerb',
});
/** from the kerb, step on to the escalator (a step must be under the kerb's edge), stand still, ride till past x `offAt`, walk off */
const ride = (name: string, foot: number, offAt: number, when: (w: World) => boolean = () => true, band?: [number, number]): Step[] => [
  { hold: 'R', until: X(foot - 0.85), max: 300, note: 'to the edge of the kerb' },
  until((w) => stepUnder(w, name, band) && when(w), `wait for a step under the kerb (${name})`, 1500),
  { hold: 'R', until: riding(name), max: 60, note: `board the ${name} escalator` },
  { hold: 'L', until: (w) => w.player.vx <= 0 || !w.player.onGround, max: 20, note: 'brake' },
  { hold: '', until: X(offAt), max: 1500, note: 'ride it up' },
  { hold: 'R', until: and(ground, X(offAt + 1.5)), max: 300, note: 'off at the top' },
];
/** the room: board, hop straight back on to the kerb (the shopper boards behind you), let her ride up alone, then ride */
const spencerRoom = (): Step[] => [
  ...mount(8),
  { hold: 'R', until: riding('room'), max: 300, note: 'step on' },
  { hold: 'L', until: (w) => w.player.x <= px(8.6), max: 60 },
  { hold: 'L', jump: 30, ticks: 30, long: true, note: 'and hop straight back on to the kerb' },
  { hold: 'L', until: (w) => w.player.onGround && !riding('room')(w), max: 120 },
  { hold: '', until: (w) => Math.abs(w.player.vx) < 1, max: 60 },
  until((w) => esc('room')(w).shoppers[0].off === 'gone', 'let her ride up alone', 900),
  remount(8),
  ...ride('room', 8, 17.2),
  walk(31.5),
];

// ------------------------------------------------------------------ CHN-01: the tour, with the sundal cart
/** the lid is shut, the vendor's hand is down, and the shut is young enough to cross on (not the short one: its
 *  hand goes up at 0.1 s, so this is never true during it) */
const sundalSafe = (w: World) => {
  const c = sundalOf(w);
  if (!c || c.lid !== 'shut' || c.hand(w)) return false;
  const t = c.since(w);
  return t >= 0.12 && t <= 0.5;
};
const sundalShut = (w: World) => sundalOf(w)?.lid === 'shut';
/** the shared tour route up to the wall's approach, the sundal cart's own steps, then the rest */
function tour01(S: Record<string, Step[]>) {
  const R = S['CHN-01'];
  const wall = R.findIndex((st) => st.note === 'a low wall');
  if (wall < 1) throw new Error("CHN-01: no step 'a low wall'");
  const before = R.slice(0, wall - 1);
  // the pot's trigger moved 1.3 tiles nearer the pot: back off a little longer (40 ticks, was 30)
  const after = R.slice(wall - 1).map((st) => (st.note === 'it bubbles: back off' ? { ...st, ticks: 40 } : st));
  const upTo: Step = { hold: 'R', until: X(74.2), max: 900, note: 'up to the sundal cart: the vendor lifts the lid' };
  S['CHN-01'] = [before, [upTo, until(sundalSafe, 'lid shut, hand down: go', 900)], after].flat();
  // the obvious play: walk on like past the posts, into the steam he has just lifted the lid off
  naive['CHN-01'] = { steps: [...before, die], cause: 'chn-sundal' };
  // the obvious fix: go the moment it shuts (Tara's line): the shut after the lift is the short one
  // (the lift after the short shut is its own cause, chn-sooda: NAIVE and FIX are two causes at two ticks)
  fix['CHN-01'] = { steps: [...before, upTo, until(sundalShut, 'it shut: go', 900), die], cause: 'chn-sooda' };
  mistakes['CHN-01'] = [
    { what: 'wait for the hand to go up, then go (the lift follows the hand)', steps: [...before, upTo, until((w) => !!sundalOf(w)?.hand(w), 'hand up', 900), die], cause: 'chn-sooda' },
    { what: 'hop the cart like the parked auto', steps: [...before, ...hopAt(74.6, 14, 'hop the cart'), die], cause: 'chn-sundal' },
  ];
  // the pot (the old FIX): stand where it bubbles
  const bubble = S['CHN-01'].findIndex((st) => st.note === 'it bubbles: back off');
  if (bubble > 0) mistakes['CHN-01'].push({ what: 'stand where the pot bubbles', steps: [...S['CHN-01'].slice(0, bubble), stay], cause: 'burnt' });
}

// ------------------------------------------------------------------ CHN-07: the dolls room, steered like a person does
/** steer in the air toward the next doll's current middle (they sway), easing off so Dad arrives over it slowly;
 *  the shipped route flew to fixed x's and missed a swaying doll when a press came a few ticks late */
const dollSteer = (): Step => ({
  policy: (w) => {
    const p = w.player;
    const dolls = [0, 1, 2, 3, 4].map((i) => thingOf(w, 'doll', i)).filter((d) => d && d.alive);
    // the doll he is heading for: rising off a bounce, the first one whose near edge is ahead of his middle (not the
    // one he just left); coming down, the one whose far edge is still ahead of him (it stays the target till he lands)
    const next = p.vy < 0 ? dolls.find((d) => d.solid.x > p.cx) : dolls.find((d) => d.solid.x + d.solid.w - 6 > p.x);
    if (!next) return { move: 'R', jump: false };
    // the last doll steps 10 px aside as you come down ("keep holding right"): aim where it will be; on the
    // middle doll land on its right part, so the long leap to the last one is as short as it can be
    const aim = next.cx + (next === dolls[4] && next.x < px(24) + 2 ? 10 : 0);
    // when do his feet come down on the dolls' top (y 212)? a bounce is not a held jump, so gravity is the full
    // 1750 both ways (a 470 bounce flies about 0.6 s)
    const feet = p.y + p.h;
    let t: number;
    if (p.vy < 0) {
      const apex = feet - (p.vy * p.vy) / (2 * 1750);
      t = -p.vy / 1750 + Math.sqrt(Math.max(0, 2 * (212 - apex)) / 1750);
    } else t = (-p.vy + Math.sqrt(p.vy * p.vy + 2 * 1750 * Math.max(0, 212 - feet))) / 1750;
    // where do his feet come down if he lets go now (air drag 900/s slows him)? keep right while that is short of
    // the aim, brake while it is long, and never brake in the last 0.15 s (a late brake meets the doll's side)
    const v = Math.abs(p.vx);
    const stop = v / 900;
    const coast = Math.sign(p.vx) * (stop < t ? (v * v) / 1800 : v * t - 450 * t * t);
    // no braking at all: a dad who arrives at a doll slowly is below its top when he gets there and hits its side
    // a let-go is on time but the next press comes late (up to 12 ticks of extra coasting at 900/s), so let go only
    // when coasting from here would already carry him 8 px past the aim: on time that lands on the doll's far half,
    // 12 ticks late on its near half
    const landing = p.cx + coast;
    return { move: landing < aim + 8 ? 'R' : '', jump: false };
  },
  until: (w) => w.player.onGround && w.player.x >= px(25.5),
  max: 1500,
  note: 'doll to doll: steer at the one swaying ahead',
});
const chn07Room = (): Step[] => [
  { hold: 'R', until: X(4.7), max: 600 },
  { hold: 'R', jump: 12, ticks: 12, note: 'on to the first doll' },
  // the bounce is -470 up; a jump is -375, so a late jump still rising does not pass for the bounce
  { hold: 'R', until: (w) => w.player.vy < -420, max: 200, note: 'boing' },
  dollSteer(),
];

const solutions = (S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) => {
  tour01(S);
  // 02 (human timing, route only): the hop over pot three starts a tile earlier and is a little longer, so a jump up
  // to 12 ticks late still leaves before pot three (a late one stepped on it and started the stampede); the wait for
  // the spray is on pot five, not at the very end of the pots (a late landing ran off the end into the spray)
  {
    const R = S['CHN-02'];
    const j = R.findIndex((st) => st.note === 'skip pot number three');
    if (j < 3) throw new Error("CHN-02: no step 'skip pot number three'");
    // two hops in a row (on to pots one-two, then over three) left no room for a late press: the second hop's take-off
    // slid on to pot three. One long jump from the road before pot one clears pots one to three and lands on four
    // to six whether it starts at 7.6 or 12 ticks later; the wait for the spray is on pot five
    S['CHN-02'] = [
      { hold: 'R', until: X(6.0), max: 600 },
      { hold: 'R', jump: 12, ticks: 12, note: 'onto the first pots' },
      { hold: 'R', until: and(ground, X(10.4)), max: 300 },
      { hold: 'R', jump: 12, ticks: 12, note: 'skip pot number three' },
      { hold: 'R', until: and(ground, X(14.4)), max: 300 },
      ...R.slice(j + 2),
    ];
  }
  // 07: the room's three room steps are replaced by the steered flight; everything after (the act, the door) stays
  {
    const R = S['CHN-07'];
    const i = R.findIndex((st) => st.note === 'keep holding: the last doll steps aside');
    if (i < 0) throw new Error("CHN-07: no step 'keep holding: the last doll steps aside'");
    S['CHN-07'] = [...chn07Room(), ...R.slice(i + 1)];
  }
  S['CHN-09'] = murukkuRoom();
  lengthen('CHN-09', 0, []);
  S['CHN-10'] = spencerRoom();
  lengthen('CHN-10', 0, []);
  // every act of the finale: the obvious play (A1) and the obvious fix (A2), each dying to its own trap
  {
    const r = S['CHN-10'];
    const at = (note: string) => {
      const n = r.findIndex((st) => st.note === note);
      if (n < 0) throw new Error(`CHN-10: no step '${note}'`);
      return n;
    };
    const prefix = (note: string) => r.slice(0, at(note));
    mistakes['CHN-10'].push(
      { what: 'family A1 (the room taught it): hop back off when they board', steps: [...prefix('board the moodal escalator'), { hold: 'R', until: riding('moodal'), max: 600 }, { hold: 'L', until: (w) => w.player.x <= px(32 + 8.6), max: 60 }, { hold: 'L', jump: 30, ticks: 30, long: true }, { hold: 'L', until: (w) => w.player.onGround && !riding('moodal')(w), max: 120 }, { hold: '', until: done, max: 900 }], cause: 'chn-trolley' },
      { what: 'polished floor A1 (the beach road taught it): hop the shimmer, walk the dark patch', steps: [...prefix('walk the shimmer'), ...hopAt(32 + 30 + 2.4, 12, 'hop the shimmer'), die], cause: 'chn-kinaru' },
      { what: 'down escalator A1: step on while it is empty', steps: [...prefix('wait for a step under the kerb (keezhe)'), until((w) => esc('keezhe')(w).shoppers[0].p < 0 && stepUnder(w, 'keezhe'), 'wait for the kid to step off', 1200), { hold: 'R', until: riding('keezhe'), max: 60 }, { hold: 'L', until: (w) => w.player.vx <= 0, max: 20 }, stay], cause: 'chn-comb' },
      { what: 'display A1 (the kitchen taught it): stand on the golden one', steps: [...prefix('across the plaster one without stopping'), { hold: 'R', until: (w) => w.player.onGround && w.player.x >= px(32 + 30 + 26 + 30 + 14), max: 600 }, stay], cause: 'chn-plaster' },
    );
  }
  {
    const r = S['CHN-09'];
    const at = (note: string) => {
      const n = r.findIndex((st) => st.note === note);
      if (n < 0) throw new Error(`CHN-09: no step '${note}'`);
      return n;
    };
    const prefix = (note: string) => r.slice(0, at(note));
    // per act: NAIVE and FIX as scripted mistakes, each pair dying to a different cause at a different tick
    const K = 32,
      E = K + 30,
      T = E + 30,
      V = T + 30,
      U = V + 30;
    mistakes['CHN-09'].push(
      { what: 'ladle A1: hop straight on to the dark spiral', steps: [...prefix('on to the first spiral (the ladle comes for the dark one)'), ...hopAt(K + 3.4, 12, 'on'), ...hopAt(K + 10.4, 12, 'and on to the dark one'), die], cause: 'chn-karandi' },
      { what: 'ladle A2: wait on the first spiral for the dark one to go', steps: [...prefix('on to the first spiral (the ladle comes for the dark one)'), ...hopAt(K + 3.4, 12, 'on'), stay], cause: 'chn-sottu' },
      { what: 'eye A1: run straight across the big spiral', steps: [...prefix('on to the near turn of the big spiral'), ...hopAt(E + 3.4, 12, 'on'), die], cause: 'chn-ennai' },
      { what: 'eye A2: hop the eye at once, under the press', steps: [...prefix('on to the near turn of the big spiral'), ...hopAt(E + 3.4, 12, 'on'), ...hopAt(E + 10.4, 12, 'hop the eye'), die], cause: 'chn-achu' },
      { what: 'thenkuzhal A1 (the room taught it): wait for it to go golden', steps: [...prefix('on to the dark spiral (the press lays a white one)'), ...hopAt(T + 3.4, 12, 'on'), stay], cause: 'chn-karandi' },
      { what: 'thenkuzhal A2: it never turns, so step on at once', steps: [...prefix('on to the dark spiral (the press lays a white one)'), ...hopAt(T + 3.4, 12, 'on'), until((w) => !!murukkuOf(w, 't2')?.visible, 'the white one lands', 600), ...hopAt(T + 10.4, 12, 'on to it'), die], cause: 'chn-ennai' },
      { what: 'row A1: run on to the row as it is laid', steps: [...prefix('up to the edge: the row is laid'), die], cause: 'chn-ennai' },
      { what: 'row A2: wait for golden, step on, and stop for a look', steps: [...prefix('up to the edge: the row is laid'), { hold: 'R', until: X(V + 3.4), max: 600 }, until(fried('v0'), 'wait for the row to turn', 600), ...hopAt(V + 3.4, 12, 'on to the row'), stay], cause: 'chn-karandi' },
      { what: 'taste A1 (the room taught it): land on the near end and wait there', steps: [...prefix('on to the near end, and keep going'), ...hopAt(U + 3.4, 12, 'on'), stay], cause: 'chn-kai' },
      { what: 'taste A2: land, get past the near end on to the middle, and wait there', steps: [...prefix('on to the near end, and keep going'), ...hopAt(U + 3.4, 12, 'on'), { hold: 'R', until: X(U + 12.2), max: 300 }, stay], cause: 'chn-karandi' },
      { what: 'door: stop in front of the pale curtain to let it fry', steps: [...r.slice(0, r.length - 1), { hold: 'R', until: (w) => w.player.x >= w.level.doorX! * 16 - px(5.3), max: 900 }, stay], cause: 'burnt' },
    );
  }
};

const naive: Record<string, { steps: Step[]; cause?: string }> = {
  // the obvious play: hop the golden one, hop the pale one that just landed (it floats, says Tara)
  'CHN-09': { steps: [...hopAt(4.4, 12, 'on to the first golden spiral'), ...hopAt(11.4, 12, 'and on to the pale one'), die], cause: 'chn-ennai' },
  // the obvious play: step on and ride
  'CHN-10': { steps: [...mount(8), { hold: 'R', until: riding('room'), max: 300 }, { hold: 'L', until: (w) => w.player.vx <= 0, max: 20 }, stay], cause: 'chn-comb' },
};

const fix: Record<string, { steps: Step[]; cause?: string }> = {
  // first death: the pale one folded. So: stay on the golden one and wait it out... it is the oldest, the ladle takes it
  'CHN-09': { steps: [...hopAt(4.4, 12, 'on to the first golden spiral'), stay], cause: 'chn-karandi' },
  // first death: it reversed and ran you into the comb. So: jump off when it reverses: into the fountain below
  'CHN-10': {
    steps: [
      ...mount(8),
      { hold: 'R', until: riding('room'), max: 300 },
      { hold: 'L', until: (w) => w.player.vx <= 0, max: 20 },
      { policy: (w) => ({ move: esc('room')(w).dir < 0 ? 'R' : '', jump: esc('room')(w).dir < 0 && w.player.onGround }), until: done, max: 900 },
    ],
    cause: 'chn-fountain',
  },
};

const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {
  'CHN-09': [{ what: 'run straight into the oil', steps: [die], cause: 'chn-ennai' }],
  'CHN-10': [{ what: 'leap from the kerb over the escalator', steps: [...mount(8), ...hopAt(6.4, 30, 'leap', true), die], cause: 'chn-fountain' }],
};

const groupOf = (w: World, letter: string) => w.entities.find((e: any) => e.letter === letter) as any;

const actRoutes: Record<string, (x: number, p: any) => Step[]> = {
  // CHN-07's act, re-timed for human play (round 2): the shipped route waited for the second stone wherever the long
  // jump happened to land, which with a late jump was on the pit's edge; now Dad settles in the middle of the trigger
  // band (cx 16.5..19.2), hops on to the (now 3-wide) fallen stone from 17.9, and leaves it with a long jump
  'chn07-capstone': (x, p) => [
    { hold: 'R', until: (w) => w.player.cx >= px(x + 10.2), max: 600, note: 'under the stone' },
    { hold: 'L', ticks: 34, note: 'and straight back out' },
    { hold: '', until: (w) => groupOf(w, p.letters[0]).state === 'landed', max: 400 },
    { hold: 'R', until: X(x + 8.4), max: 200 },
    { hold: 'R', jump: 14, ticks: 14, note: 'up on the stone' },
    { hold: 'R', until: and(ground, X(x + 10.6)), max: 200 },
    { hold: 'R', jump: 30, ticks: 30, long: true, note: 'and over the wall' },
    { hold: 'R', until: and(ground, (w) => w.player.cx >= px(x + 16.9)), max: 400 },
    {
      policy: (w) => go(w.player.cx < px(x + 16.75) ? 'R' : w.player.cx > px(x + 19.4) ? 'L' : ''),
      until: (w) => w.player.onGround && w.player.cx >= px(x + 16.75) && w.player.cx <= px(x + 19.4) && Math.abs(w.player.vx) < 10,
      max: 300,
      note: 'settle in the middle of the edge: it drops into the pit',
    },
    { hold: '', until: (w) => groupOf(w, p.letters[1]).state === 'landed', max: 400, note: 'wait at the edge: it drops into the pit' },
    { hold: 'R', until: X(x + 18.9), max: 100 },
    { hold: 'R', jump: 12, ticks: 12, note: 'onto the fallen stone' },
    { hold: 'R', until: and(ground, X(x + 22.2)), max: 200 },
    { hold: 'R', jump: 30, ticks: 30, long: true, note: 'and off it over the spikes' },
    { hold: 'R', until: and(ground, X(x + 32)), max: 400 },
  ],
  'chn09-karandi': (x) => [
    ...hopAt(x + 3.4, 12, 'on to the first spiral (the ladle comes for the dark one)'),
    until(ladleHovers(1), 'the ladle hovers over the dark one', 300),
    { hold: 'L', until: (w) => w.player.x <= px(x + 6.6), max: 300, note: 'back to the near edge' },
    { hold: 'L', jump: 12, ticks: 12, note: 'and back on to the bank' },
    { hold: 'L', until: ground, max: 300 },
    { hold: '', until: (w) => w.player.x <= px(x + 2.6) || w.player.vx === 0, max: 120 },
    until(fried('k2'), 'wait for the fresh spiral in the gap to turn golden', 900),
    ...hopAt(x + 3.4, 12, 'on again'),
    ...hopAt(x + 10.4, 12, 'on to the fresh one'),
    ...hopAt(x + 17.4, 12, 'and the last'),
    walk(x + 29.5),
  ],
  'chn09-kannu': (x) => [
    ...hopAt(x + 3.4, 12, 'on to the near turn of the big spiral'),
    { hold: 'R', until: X(x + 8.8), max: 300, note: 'up to the eye' },
    until(pressGone(2), 'let the press lift away', 600),
    ...hopAt(x + 10.4, 12, 'hop the eye to the far turn'),
    ...hopAt(x + 16.9, 12, 'and on'),
    walk(x + 29.5),
  ],
  'chn09-thenkuzhal': (x) => [
    ...hopAt(x + 3.4, 12, 'on to the dark spiral (the press lays a white one)'),
    { hold: 'R', until: X(x + 8.8), max: 300 },
    until(quiet('t2'), 'wait for the oil round the white one to go quiet', 900),
    ...hopAt(x + 10.4, 12, 'on to the white one'),
    ...hopAt(x + 17.4, 12, 'and on'),
    walk(x + 29.5),
  ],
  'chn09-varisai': (x) => [
    { hold: 'R', until: X(x + 3.3), max: 600, note: 'up to the edge: the row is laid' },
    until(fried('v0'), 'wait for the row to turn golden', 600),
    ...hopAt(x + 3.4, 12, 'on to the row'),
    ...hopAt(x + 13.4, 12, 'run it and off the far end'),
    walk(x + 29.5),
  ],
  'chn09-ruchi': (x) => [
    ...hopAt(x + 3.4, 12, 'on to the near end, and keep going'),
    ...hopAt(x + 14.4, 12, 'off the middle before the ladle'),
    walk(x + 29.5),
  ],
  'chn10-moodal': (x) => [...mount(x + 8), until((w) => stepUnder(w, 'moodal'), 'a step under the kerb', 600), { hold: 'R', until: riding('moodal'), max: 60, note: 'board the moodal escalator' }, { hold: 'L', until: (w) => w.player.vx <= 0 || !w.player.onGround, max: 20 }, { hold: '', until: X(x + 17.2), max: 1500, note: 'stay on: the family boards, it crawls on up' }, walk(x + 29.5, 'off at the top')],
  'chn10-kaanal': (x) => [{ hold: 'R', until: X(x + 4.4), max: 600, note: 'walk the shimmer' }, { hold: 'R', jump: 12, ticks: 12, note: 'hop the dark well' }, { hold: 'R', until: ground, max: 300 }, ...hopAt(x + 11.4, 12, 'hop the next well'), ...hopAt(x + 17.4, 12, 'and the last'), walk(x + 25.5)],
  'chn10-keezhe': (x) => [
    ...mount(x + 8),
    // the down escalator's step comes toward the kerb and goes under the comb: take one 24..33 px up the run, so a
    // step-off up to 12 ticks late still lands on it
    ...ride('keezhe', x + 8, x + 17.2, (w) => { const k = esc('keezhe')(w).shoppers[0]; return k.p >= 0.15 && k.p <= 0.95; }, [24, 33]),
    walk(x + 29.5),
  ],
  'chn10-pattarai': (x) => [...hopAt(x + 3.4, 12, 'on to the pale one'), ...hopAt(x + 10.4, 12, 'across the plaster one without stopping'), ...hopAt(x + 17.4, 12, 'on to the far pale one'), walk(x + 29.5)],
};

const endingPolicies: Record<string, Policy> = {
  // walk straight through the pale curtain; never stop in front of it
  'chn-fresh-curtain'(w, _m, d) {
    return go(toward(w, d.x + 8, 1));
  },
  // a plain door (round 2): walk in
  'chn-wet-floor-sign'(w, _m, d) {
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
  fair: ['CHN-09', 'CHN-10'],
};
