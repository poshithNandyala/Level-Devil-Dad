// Proven routes through each stage's own acts (src/game/levels/acts.ts and the city files).
import type { World } from '../src/game/world';
import { Geyser, Gust, Thing, scheduleOn } from '../src/game/entities/traps';
import { DT } from '../src/game/constants';
import { Step, X, and, ground, or } from './runner';
import { Blast } from '../src/game/levels/acts';
import { swim, skimmer, kicker, type Out } from './moves';
import type { Dolphin } from '../src/game/cities/kvt/levels';
import { HOLI_TILES } from '../src/game/cities/bom/levels';
import { WEST_ACT_ROUTES } from './west';
import { CITY_TESTS } from './city-tests';

/** up a two-step rock (rimUp at x+3): two hops */
const upRim = (x: number): Step[] => [
  { hold: 'R', until: X(x + 1.6), max: 400 },
  { hold: 'R', jump: 14, ticks: 14, note: 'up the rock' },
  { hold: 'R', until: and(ground, X(x + 3.6)), max: 200 },
  { hold: 'R', jump: 14, ticks: 14, note: 'up to the rim' },
  { hold: 'R', until: (w) => w.player.swimming, max: 300, note: 'and in' },
];
const airFull = (w: World) => w.player.air > 4.95;
/** wait on the sand for dolphin i, run out with it, hop on, ride to near the top, jump off and stop on the land */
const rideDolphin = (key: string, i: number, landX0: number) => {
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
      const t = ((((w.tick * DT + d.phase) % d.period) + d.period) % d.period);
      const until = d.period - t;
      const dist = d.x0 - 10 - p.cx;
      if (d.k < 0 && until <= Math.max(0, dist) / 140 + 0.02) st = 1;
      return { move: '', jump: false };
    }
    if (st === 1) {
      if (w.standing(d.solid as never)) st = 2;
      else if (p.onGround && d.k >= 0 && !w.input.jump) {
        hold = 9;
        return { move: 'R', jump: true };
      }
      return { move: p.onGround || mid > p.cx + 2 ? 'R' : '', jump: false };
    }
    if (st === 2) {
      if (d.k >= 0.62) {
        st = 3;
        hold = 14;
        return { move: 'R', jump: true };
      }
      return { move: mid > p.cx + 3 ? 'R' : mid < p.cx - 3 ? 'L' : '', jump: false };
    }
    // flying off: stop on the land
    if (p.onGround && p.x >= landX0 + 2) return { move: '', jump: false };
    return { move: p.cx < landX0 + 14 ? 'R' : '', jump: false };
  };
};
/** the act's palm whose trunk stands in tile column tx */
const palmAt = (w: World, tx: number) => w.climbables.find((c: any) => Math.abs(c.bx - (tx * 16 + 8)) < 1);
const grabbed = (tx: number) => (w: World) => !!w.player.grip && w.player.grip === palmAt(w, tx);
const onCrown = (w: World) => w.player.onGround && !w.player.grip;
/** the crab on the palm at column tx is down low and heading further down */
const crabLow = (tx: number, below = 0.45) => (w: World) => {
  const pl = palmAt(w, tx);
  const c = w.entities.find((e: any) => e.palm === pl) as any;
  return !c || (c.s < below && c.dir < 0);
};
/** at the right edge of the crown Dad stands on */
const crownEdge = (w: World) => {
  const g: any = w.player.groundSolid;
  return !!g && w.player.x + w.player.w >= g.x + g.w - 2;
};

const px = (t: number) => t * 16;
type P = { kind: string; x0: number; id: number; letters: string; spikes: string };

/** the gust over this act will stay quiet for `need` seconds from now */
const gustQuiet = (x: number, need: number) => (w: World) => {
  const g = w.entities.find((e) => e instanceof Gust && !!(e as Gust).schedule && (e as Gust).zone.x >= px(x) && (e as Gust).zone.x < px(x + 40)) as Gust | undefined;
  if (!g || !g.schedule) return true;
  const s = g.schedule;
  for (let k = 0; k <= need; k += 1 / 30) {
    const t = w.tick * DT + k + (s.phase ?? 0);
    if (((t % s.period) + s.period) % s.period < s.on) return false;
  }
  return true;
};
const gustJustEnded = (x: number) => (w: World) => {
  const g = w.entities.find((e) => e instanceof Gust && !!(e as Gust).schedule && (e as Gust).zone.x >= px(x) && (e as Gust).zone.x < px(x + 40)) as Gust | undefined;
  return !!g && !scheduleOn(w, g.schedule!) && gustQuiet(x, 1.0)(w);
};
const thingAt = (w: World, kind: string, x0: number, x1: number) =>
  w.entities.find((e) => e instanceof Thing && (e as Thing).kind === kind && (e as Thing).x >= x0 && (e as Thing).x <= x1) as Thing | undefined;

const groupOf = (w: World, letter: string) => w.entities.find((e: any) => e.letter === letter) as any;

/** run right and hop off every edge (floaters, ledges): a little player that jumps at the brink */
export const edgeJumper = (until: number, hold = 12) => {
  let left = 0;
  return (w: World): { move: 'L' | 'R' | ''; jump: boolean } => {
    const p = w.player;
    if (left > 0) {
      left--;
      return { move: 'R', jump: true };
    }
    if (p.x >= px(until)) return { move: 'R', jump: false };
    const below = w.solidAt(p.x + p.w + 1, p.y + p.h + 1, 3, 3);
    if (p.onGround && !below) {
      left = hold;
      return { move: 'R', jump: true };
    }
    return { move: 'R', jump: false };
  };
};

/** hop across moving floaters: wait at an edge until the next one is in reach, jump, and steer onto it */
export const hopper = (kinds: string[], bankX: number, until: number) => {
  let left = 0;
  let target: { x: number; w: number; e: any } | null = null;
  return (w: World): { move: 'L' | 'R' | ''; jump: boolean } => {
    const p = w.player;
    const tx = () => (target!.e ? target!.e.solid.x : target!.x) + target!.w / 2;
    const steer = (): 'L' | 'R' | '' => {
      if (!target) return 'R';
      const c = tx();
      return p.cx < c - 3 ? 'R' : p.cx > c + 3 ? 'L' : '';
    };
    if (left > 0) {
      left--;
      return { move: steer(), jump: true };
    }
    if (p.x >= px(until)) return { move: 'R', jump: false };
    if (!p.onGround) return { move: steer(), jump: false };
    target = null;
    const right = p.x + p.w;
    const cands = w.entities
      .filter((e: any) => e instanceof Thing && kinds.includes(e.kind) && e.alive && e.solid.collidable && e.solid.y < 240)
      .map((e: any) => ({ x: e.solid.x as number, w: e.solid.w as number, e }))
      .concat([{ x: px(bankX), w: 32, e: null }])
      .filter((c) => c.x > right - 2)
      .sort((a, b) => a.x - b.x);
    const d = (cands[0]?.x ?? Infinity) - right;
    // the edge of whatever Dad stands on (one-way things don't show up in solidAt)
    const gs: any = (p as any).groundSolid;
    const edge = gs && gs !== true && gs.w !== undefined ? right + 3 >= gs.x + gs.w : !w.solidAt(right + 2, p.y + p.h + 1, 3, 3);
    if (d <= 46 && d > 2 && edge) {
      left = 18;
      target = cands[0];
      return { move: 'R', jump: true };
    }
    return { move: edge ? '' : 'R', jump: false };
  };
};

export const ACT_ROUTES: Record<string, (x: number, p: P) => Step[]> = {
  // ------------------------------------------------------------ Kavaratti
  'kvt02-glass': (x) => [
    { hold: 'R', until: X(x + 15.1), max: 900, note: 'walk across the glass and on to the plank after it' },
    { hold: 'R', jump: 12, ticks: 12, note: 'the real gap' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: X(x + 34), max: 900, dodge: 1, note: 'hop the hermit crab' },
  ],
  'kvt03-faith': (x) => [
    { hold: 'R', until: X(x + 17.2), max: 900, note: 'walk on: the reef rises under each step' },
    { hold: 'R', jump: 14, ticks: 14, note: 'the last gap is real' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: X(x + 32), max: 600 },
  ],
  'kvt04-tailwind': (x) => [
    { hold: 'R', until: X(x + 5.2), max: 600 },
    { hold: 'R', jump: 12, ticks: 12, note: 'first pit, with the wind behind you' },
    { hold: 'R', until: and(ground, X(x + 11)), max: 300 },
    { hold: '', until: gustJustEnded(x + 10), max: 900, note: 'wait for the island gust to blow out' },
    { hold: 'R', until: X(x + 12.9), max: 300 },
    { hold: 'R', jump: 16, ticks: 16, long: true, note: 'to the little island' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: X(x + 17.5), max: 100 },
    { hold: 'R', jump: 16, ticks: 16, long: true, note: 'off it, over the spikes' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: X(x + 34), max: 600 },
  ],
  'kvt05-lift': (x) => [
    { hold: 'R', until: X(x + 5.4), max: 600, note: 'into the basket' },
    { hold: '', until: (w) => { const b = thingAt(w, 'crate', px(x + 4), px(x + 8)); return !!b && b.y <= px(7) + 2; }, max: 900, note: 'ride it up' },
    { hold: 'R', jump: 12, ticks: 12, note: 'off onto the pier: a little hop (a big one meets the pulley)' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: X(x + 32), max: 900 },
  ],
  'kvt06-air': (x) => [
    ...upRim(x),
    swim(
      [
        { x: px(x + 10), y: 236, tx: 8 },
        { x: px(x + 18.2), y: 221, tx: 6 },
        { x: px(x + 20), y: 172, tx: 5, ty: 6, wait: airFull },
        { x: px(x + 20), y: 221, yFirst: true },
        { x: px(x + 35.2), y: 221, tx: 6 },
        { x: px(x + 38.5), y: 120, tx: 4, ty: 4 },
      ],
      (w) => w.player.y + w.player.h <= 176 && !w.player.swimming && w.player.x > px(x + 37),
      'breathe in the pocket, go over the turtle, come up at the far end',
    ),
    { hold: 'R', until: and(ground, X(x + 44)), max: 400 },
  ],
  'kvt06-eels': (x) => [
    ...upRim(x),
    swim(
      [
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
      ],
      (w) => w.player.y + w.player.h <= 176 && !w.player.swimming && w.player.x > px(x + 36),
      'over the floor eels, under the roof one, through the middle of the pair',
    ),
    { hold: 'R', until: and(ground, X(x + 42)), max: 400 },
  ],
  'kvt07-crabs': (x) => [
    { hold: 'R', until: X(x + 1.2), max: 300 },
    { hold: 'R', jump: 14, until: grabbed(x + 4), max: 160, note: 'jump for the first palm' },
    { hold: 'R', until: onCrown, max: 600, note: 'up on its crown' },
    ...[
      [10, 16],
      [22, 28],
    ].flatMap(([bare, next]): Step[] => [
      { hold: '', until: crabLow(x + bare, 0.4), max: 1500, note: 'wait for the crab to head down low' },
      { hold: 'R', until: crownEdge, max: 60 },
      { hold: 'R', jump: 14, until: grabbed(x + bare), max: 200, note: 'jump for the bare trunk' },
      { hold: 'R', until: (w) => w.player.gripS >= 0.86, max: 400, note: 'climb high, above the crab' },
      { hold: 'R', jump: 14, until: or(grabbed(x + next), onCrown), max: 200, note: 'leap for the next crown' },
      { hold: 'R', until: onCrown, max: 600 },
    ]),
    { hold: 'R', until: crownEdge, max: 60 },
    { hold: 'R', jump: 14, ticks: 14, note: 'for the bank' },
    { hold: 'R', until: and(ground, X(x + 36)), max: 400 },
  ],
  'kvt07-bend': (x) => [
    { hold: 'R', until: X(x + 0.8), max: 300 },
    { hold: 'R', jump: 14, until: grabbed(x + 2), max: 160, note: 'grab the young palm' },
    { hold: 'R', until: onCrown, max: 600, note: 'climb: it bends over the water, all the way to the island' },
    { hold: 'R', until: and(ground, X(x + 11.3)), max: 300, note: 'step off on to the island' },
    { hold: 'R', until: X(x + 12.3), max: 100 },
    { hold: 'R', jump: 10, until: grabbed(x + 13), max: 160, note: 'grab the second one' },
    { hold: 'R', until: (w) => w.player.gripS >= 0.68, max: 400, note: 'climb, but not to the top' },
    { hold: 'R', jump: 14, until: and(ground, X(x + 24)), max: 300, note: 'leap for the bank before it tips you in' },
    { hold: 'R', until: and(ground, X(x + 30)), max: 400 },
  ],
  'kvt08-weed': (x) => [
    { policy: skimmer((w) => w.player.x >= px(x + 32)), until: and(ground, X(x + 32)), max: 900, note: 'flat out, hopping every seaweed bed' },
    { hold: 'R', until: X(x + 34), max: 200 },
  ],
  'kvt08-dolphins': (x) => [
    { hold: 'R', until: X(x + 1.4), max: 300 },
    { hold: '', ticks: 6 },
    { policy: rideDolphin(`kvt08-dolphins:dolphins`, 0, px(x + 16)), until: (w) => w.player.onGround && w.player.x >= px(x + 16) && Math.abs(w.player.vx) < 1, max: 1500, note: 'ride the first dolphin to the sand' },
    { policy: rideDolphin(`kvt08-dolphins:dolphins`, 1, px(x + 34)), until: (w) => w.player.onGround && w.player.x >= px(x + 34), max: 1500, note: 'and the second, to the beach' },
    { hold: 'R', until: X(x + 38), max: 200 },
  ],
  // ------------------------------------------------------------ Chennai
  'chn02-queue2': (x) => [
    { hold: 'R', until: X(x + 6.5), max: 600 },
    { hold: 'R', jump: 16, ticks: 16, note: 'over pots one and two, straight onto pot three' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: (w) => w.player.y < px(9), max: 900, note: 'on to the tap: it shoots you up' },
    { hold: 'R', until: and(ground, X(x + 31)), max: 600, note: 'over the tank and down' },
  ],
  'chn03-frogger': (x) => [{ policy: hopper(['board', 'crate', 'log', 'kudam'], x + 28, x + 28), until: and(ground, X(x + 30)), max: 3000, note: 'hop the floating things' }],
  'chn04-cricket': (x) => [{ hold: 'R', until: X(x + 36), max: 1500, dodge: 1, note: 'hop the balls on the ground, stay down for the bouncer' }],
  'chn05-heat': (x) => [
    { hold: 'R', until: X(x + 4.2), max: 600, dodge: 1, note: 'the last kite from the beach' },
    { hold: 'R', jump: 12, ticks: 12, note: 'the first shimmer is a hole' },
    { hold: 'R', until: and(ground, X(x + 13.2)), max: 400, note: 'walk across the black patch' },
    { hold: 'R', jump: 12, ticks: 12, note: 'the shimmer after it' },
    { hold: 'R', until: and(ground, X(x + 20.2)), max: 400 },
    { hold: 'R', jump: 12, ticks: 12, note: 'onto the big black patch' },
    { hold: 'R', until: and(ground, X(x + 26.2)), max: 400 },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: and(ground, X(x + 34)), max: 400 },
  ],
  'chn06-ladi': (x) => [
    { hold: 'R', until: X(x + 18), max: 1500, dodge: 1, note: 'hop the blast' },
    { hold: 'R', until: X(x + 20.6), max: 300 },
    { hold: 'R', jump: 30, ticks: 30, long: true, note: 'up on the ledge: both ends are going off' },
    { hold: 'R', until: and(ground, X(x + 23.5)), max: 200 },
    { hold: '', until: (w) => !w.entities.some((e) => e instanceof Blast && e.alive), max: 600, note: 'let both blasts pass under' },
    { hold: 'R', until: and(ground, X(x + 38)), max: 600 },
  ],
  'chn07-capstone': (x, p) => [
    { hold: 'R', until: (w) => w.player.cx >= px(x + 10.2), max: 600, note: 'under the stone' },
    { hold: 'L', ticks: 34, note: 'and straight back out' },
    { hold: '', until: (w) => groupOf(w, p.letters[0]).state === 'landed', max: 400 },
    { hold: 'R', until: X(x + 8.4), max: 200 },
    { hold: 'R', jump: 14, ticks: 14, note: 'up on the stone' },
    { hold: 'R', until: and(ground, X(x + 10.6)), max: 200 },
    { hold: 'R', jump: 30, ticks: 30, long: true, note: 'and over the wall' },
    { hold: 'R', until: and(ground, (w) => w.player.cx >= px(x + 16.9)), max: 400 },
    { hold: '', until: (w) => groupOf(w, p.letters[1]).state === 'landed', max: 400, note: 'wait at the edge: it drops into the pit' },
    { hold: 'R', until: X(x + 18.3), max: 100 },
    { hold: 'R', jump: 12, ticks: 12, note: 'onto the fallen stone' },
    { hold: 'R', until: and(ground, X(x + 22.2)), max: 200 },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: and(ground, X(x + 32)), max: 400 },
  ],
  'chn08-trainroof': (x) => [
    { hold: 'R', until: X(x + 1.3), max: 600 },
    { hold: 'R', jump: 12, ticks: 12, note: 'up the step' },
    { hold: 'R', until: and(ground, X(x + 3.1)), max: 200 },
    { hold: 'R', jump: 12, ticks: 12, note: 'up on the platform' },
    { hold: 'R', until: X(x + 11), max: 900, note: 'and onto the train roof' },
    { hold: '', until: X(x + 25.5), max: 1200, note: 'ride it over the broken bridge' },
    { hold: 'R', jump: 30, ticks: 30, long: true, note: 'onto the tunnel before the train goes in' },
    { hold: 'R', until: and(ground, X(x + 42)), max: 600 },
  ],
  // ------------------------------------------------------------ Puducherry
  'pdy02-pools': (x) => [
    { hold: 'R', until: X(x + 15.1), max: 900, note: 'walk through the clear pools' },
    { hold: 'R', jump: 12, ticks: 12, note: 'the dark pool is deep' },
    { hold: 'R', until: and(ground, X(x + 22.9)), max: 300 },
    { hold: 'R', jump: 30, ticks: 30, long: true, note: 'over the whole turtle pool' },
    { hold: 'R', until: and(ground, X(x + 34)), max: 400 },
  ],
  'pdy03-signs': (x) => [
    { hold: 'R', until: X(x + 17), max: 900, note: 'walk through the cardboard pot, under the balcony' },
    { hold: 'R', jump: 18, ticks: 18, note: 'jump the street that says walk' },
    { hold: 'R', until: and(ground, X(x + 26.2)), max: 400 },
    { hold: 'R', jump: 12, ticks: 12, note: 'the honest sign: a real gap' },
    { hold: 'R', until: and(ground, X(x + 32)), max: 400 },
  ],
  'pdy04-closing': (x) => [
    { hold: 'R', until: X(x + 7.9), max: 600, note: 'run: the road turns to spikes behind you' },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: and(ground, X(x + 13.6)), max: 300 },
    { hold: 'R', jump: 12, ticks: 12, note: 'over the barrier' },
    { hold: 'R', until: and(ground, X(x + 20.9)), max: 300 },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: and(ground, X(x + 32)), max: 400 },
  ],
  'pdy05-raft': (x) => {
    const raft = (w: World, a: number, b: number) => w.entities.find((e) => e instanceof Thing && (e as Thing).kind === 'board' && (e as Thing).solid.x >= px(x + a) - 1 && (e as Thing).solid.x <= px(x + b) + 1) as Thing;
    return [
      { hold: 'R', until: X(x + 2.6), max: 600 },
      { hold: '', until: (w) => raft(w, 4, 10).solid.x === px(x + 4), max: 900, note: 'wait for the first raft' },
      { hold: 'R', until: X(x + 5), max: 200, note: 'step on' },
      { hold: '', until: (w) => raft(w, 4, 10).solid.x === px(x + 10), max: 600 },
      { hold: 'R', until: X(x + 13.1), max: 200, note: 'onto the post' },
      { hold: '', until: (w) => raft(w, 14, 23).solid.x === px(x + 14), max: 900, note: 'the second raft only kisses the post' },
      { hold: 'R', until: X(x + 14.8), max: 60, note: 'on it at once' },
      { hold: '', until: (w) => raft(w, 14, 23).solid.x === px(x + 23), max: 600 },
      { hold: 'R', until: and(ground, X(x + 30)), max: 400 },
    ];
  },
  'pdy06-palms': (x) => [
    { hold: 'R', until: X(x + 10.8), max: 600, note: 'walk under the first palm' },
    { hold: '', jump: 12, ticks: 12, note: 'a hop under the second palm brings its coconut down' },
    { hold: '', until: ground, max: 100 },
    { hold: '', ticks: 70, note: 'let it fall and roll away' },
    { hold: 'R', until: X(x + 12.6), max: 200 },
    { hold: 'R', jump: 20, ticks: 20, long: true, note: 'over the urchins' },
    { hold: 'R', until: and(ground, X(x + 30)), max: 400 },
  ],
  'pdy07-waves': (x) => [
    { hold: 'R', until: X(x + 8.6), max: 600 },
    { hold: 'R', jump: 30, ticks: 30, long: true, note: 'up on the first rock' },
    { hold: 'R', until: and(ground, X(x + 10.6)), max: 200 },
    { hold: '', until: (w) => w.flags['pdy07-waves:big'] === 1, max: 2400, note: 'wait for the big one' },
    { hold: '', until: (w) => w.flags['pdy07-waves:big'] === 0, max: 400, note: 'let it pass' },
    { hold: 'R', until: X(x + 19.4), max: 400, note: 'run for it in the calm' },
    { hold: 'R', jump: 30, ticks: 30, long: true, note: 'over the second rock' },
    { hold: 'R', until: and(ground, X(x + 34)), max: 900 },
  ],
  'pdy08-sparks': (x) => [
    { hold: 'R', until: X(x + 4.7), max: 600, note: 'stop short of the glowing marks' },
    { hold: '', ticks: 200, note: 'let the sparks fall' },
    { hold: 'R', until: X(x + 16), max: 400 },
    { hold: '', ticks: 200 },
    { hold: 'R', until: X(x + 27.6), max: 400, note: 'under the balcony for the finale' },
    { hold: '', ticks: 200 },
    { hold: 'R', until: X(x + 32), max: 400 },
  ],
  // ------------------------------------------------------------ Bengaluru
  'blr02-badge': (x, p) => {
    const open = (L: string) => (w: World) => groupOf(w, L).solid.y >= px(13) + 32;
    return [
      { hold: 'R', until: (w) => w.player.cx >= px(x + 7.4), max: 600 },
      { hold: '', until: open(p.letters[0]), max: 300, note: 'stand still on the mat' },
      { hold: 'R', until: X(x + 12.7), max: 300 },
      { hold: 'R', jump: 12, ticks: 12, note: 'the gap between the gates' },
      { hold: 'R', until: and(ground, (w) => w.player.cx >= px(x + 19.4)), max: 300 },
      { hold: '', jump: 12, ticks: 12, note: 'stamp on the mat' },
      { hold: '', until: and(ground, open(p.letters[1])), max: 300 },
      { hold: 'R', until: X(x + 30), max: 400 },
    ];
  },
  'blr03-viaduct': (x, p) => {
    const landed = (i: number) => (w: World) => groupOf(w, p.letters[i]).state === 'landed';
    return [
      { hold: 'R', until: X(x + 0.9), max: 400 },
      { hold: 'R', jump: 12, ticks: 12, note: 'up the steps' },
      { hold: 'R', until: and(ground, X(x + 2.9)), max: 200 },
      { hold: 'R', jump: 12, ticks: 12 },
      { hold: 'R', until: and(ground, X(x + 4.9)), max: 200 },
      { hold: 'R', jump: 12, ticks: 12, note: 'onto the deck' },
      { hold: 'R', until: and(ground, X(x + 7.4)), max: 200 },
      { hold: '', until: landed(0), max: 400, note: 'wait for the first piece' },
      { hold: 'R', until: X(x + 11.4), max: 200 },
      { hold: '', until: landed(1), max: 400 },
      { hold: 'R', until: X(x + 15.4), max: 200 },
      { hold: '', until: landed(2), max: 400 },
      { hold: 'R', until: X(x + 19.9), max: 200 },
      { hold: 'R', jump: 30, ticks: 30, long: true, note: 'the piece that comes in 2027' },
      { hold: 'R', until: and(ground, X(x + 34)), max: 400 },
    ];
  },
  'blr04-jam': (x) => [
    { hold: 'R', until: and(ground, (w) => w.player.y + w.player.h >= 240), max: 600, note: 'down on the road' },
    { hold: 'R', until: X(x + 3.4), max: 400 },
    { hold: 'R', jump: 12, ticks: 12, note: 'onto the scooter' },
    { hold: 'R', until: and(ground, X(x + 6.2)), max: 200 },
    { hold: 'R', jump: 16, ticks: 16, note: 'up onto the auto' },
    { hold: 'R', until: and(ground, X(x + 12.4)), max: 200 },
    { hold: 'R', jump: 12, ticks: 12, note: 'down onto the jeep' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: X(x + 16.6), max: 60 },
    { hold: 'R', jump: 20, ticks: 20, note: 'straight on to the bus before the jeep pulls away' },
    { hold: 'R', until: and(ground, X(x + 25)), max: 300 },
    { hold: 'R', jump: 12, ticks: 12, note: 'off the bus' },
    { hold: 'R', until: and(ground, X(x + 32)), max: 400 },
  ],
  'blr05-glasshouse': (x) => [
    ...[4.3, 8.3, 12.3, 16.3, 20.3].flatMap((t): Step[] => [
      { hold: 'R', until: X(x + t), max: 400 },
      { hold: 'R', jump: 12, ticks: 12, note: 'small hops: the glass roof is low' },
      { hold: 'R', until: ground, max: 100 },
    ]),
    { hold: 'R', until: X(x + 30), max: 400 },
  ],
  'blr06-powercut': (x) => [
    ...[5.4, 12.4, 15.9, 19.6].flatMap((t): Step[] => [
      { hold: 'R', until: X(x + t), max: 400 },
      { hold: 'R', jump: 12, ticks: 12 },
      { hold: 'R', until: ground, max: 100 },
    ]),
    { hold: 'R', until: X(x + 32), max: 400 },
  ],
  'blr07-crusher': (x) => [
    ...[9.4, 17.4, 21.6].flatMap((t): Step[] => [
      { hold: 'R', until: X(x + t), max: 400, note: 'keep moving under the boulder' },
      { hold: 'R', jump: 12, ticks: 12 },
      { hold: 'R', until: ground, max: 100 },
    ]),
    { hold: 'R', until: X(x + 32), max: 400 },
  ],
  'blr08-curtain': (x) => [
    { hold: 'R', until: X(x + 20.6), max: 600, note: 'through the curtain and the tunnel' },
    { hold: 'R', jump: 12, ticks: 12, note: 'off the wet stones' },
    { hold: 'R', until: and(ground, X(x + 30)), max: 400 },
  ],
  // ------------------------------------------------------------ Amaravati
  'amr02-powder': (x) => [
    { hold: 'R', until: X(x + 4.6), max: 600 },
    { hold: 'R', jump: 12, ticks: 12, note: 'the first pit' },
    { hold: 'R', until: and(ground, X(x + 7.4)), max: 200 },
    { hold: '', until: (w) => { const ph = (w.tick * DT + 0.3) % 2.2; return ph >= 1.2 && ph <= 1.35; }, max: 600, note: 'wait for the fan to clear the powder' },
    { hold: 'R', until: (w) => w.player.vx > 300, max: 400, note: 'through it, then let the second fan sneeze you across' },
    { hold: 'R', until: and(ground, X(x + 28)), max: 300 },
    { hold: 'R', until: X(x + 34), max: 300 },
  ],
  'amr03-logs': (x) => [
    ...[6.6, 11.6, 16.6, 21.6].flatMap((t): Step[] => [
      { hold: 'R', until: X(x + t), max: 600, note: 'keep running on the rolling log' },
      { hold: 'R', jump: 24, ticks: 24, note: 'jump long' },
      { hold: 'R', until: ground, max: 200 },
    ]),
    { hold: 'R', until: X(x + 32), max: 400 },
  ],
  'amr04-hot': (x) => {
    const opening = (phase: number) => (w: World) => { const t = (w.tick * DT + phase) % 2.6; return t >= 0.02 && t <= 0.1; };
    return [
      { hold: 'R', until: (w) => w.player.cx >= px(x + 7), max: 600 },
      { hold: '', until: opening(0), max: 600, note: 'wait in the shade for the barrier' },
      { hold: 'R', until: (w) => w.player.cx >= px(x + 14.8), max: 300, note: 'to the little tree' },
      { hold: '', until: opening(1.3), max: 600, note: 'wait under the tree, not the big umbrella' },
      { hold: 'R', until: X(x + 32), max: 600 },
    ];
  },
  'amr05-humps': (x) => [
    { hold: 'R', until: X(x + 7.6), max: 600 },
    { hold: 'R', jump: 12, ticks: 12, note: 'hop the speed breaker' },
    { hold: 'R', until: and(ground, X(x + 12.6)), max: 200 },
    { hold: 'R', jump: 12, ticks: 12, note: 'and the next' },
    { hold: 'R', until: and(ground, X(x + 30)), max: 600, note: 'run over the last one: it throws you over the wall' },
  ],
  'amr06-zip': (x) => {
    const hk = (w: World, a: number, b: number) => w.entities.find((e) => e instanceof Thing && (e as Thing).kind === 'hook' && (e as Thing).solid.x >= px(x + a) - 1 && (e as Thing).solid.x <= px(x + b) + 1) as Thing | undefined;
    return [
      { hold: 'R', until: X(x + 3.2), max: 400, note: 'onto the hook' },
      { hold: '', until: (w) => (hk(w, 2.5, 11)?.solid.x ?? 0) >= px(x + 11), max: 600, note: 'ride it' },
      { hold: 'R', until: X(x + 12.4), max: 60 },
      { hold: 'R', jump: 12, ticks: 12, note: 'to the next hook before this one drops' },
      { hold: 'R', until: ground, max: 100 },
      { hold: '', until: (w) => (hk(w, 15, 25)?.solid.x ?? 0) >= px(x + 25), max: 600 },
      { hold: 'R', until: and(ground, X(x + 32)), max: 400 },
    ];
  },
  'amr07-gallery': (x) => [
    { hold: 'R', until: X(x + 0.8), max: 400 },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: and(ground, X(x + 2.9)), max: 200 },
    { hold: 'R', jump: 14, ticks: 14, note: 'up into the cave' },
    { hold: 'R', until: (w) => w.player.y > px(15), max: 300, note: 'drop through the hole' },
    { hold: 'R', until: and(ground, X(x + 25)), max: 400, note: 'along the lower gallery' },
    { hold: 'R', jump: 16, ticks: 16, note: 'out of the trench' },
    { hold: 'R', until: and(ground, X(x + 32)), max: 400 },
  ],
  'amr08-shack': (x) => [
    { hold: 'R', until: X(x + 7), max: 600 },
    { hold: '', until: gustJustEnded(x), max: 600, note: 'wait out the gust in the open' },
    { hold: 'R', until: X(x + 19.5), max: 400, note: 'straight through the first shack' },
    { hold: '', until: gustJustEnded(x), max: 600 },
    { hold: 'R', until: X(x + 32), max: 600, note: 'and through the second' },
  ],
  // ------------------------------------------------------------ Hyderabad
  'hyd02-shadow': (x) => {
    const quiet = (w: World) => {
      const g = w.entities.find((e) => e instanceof Geyser && (e as Geyser).x > px(x + 11) && (e as Geyser).x < px(x + 14)) as Geyser;
      return g.quietFor(w.tick * DT + 0.1, 0.5);
    };
    return [
      { hold: 'R', until: X(x + 10.4), max: 600 },
      { hold: '', until: quiet, max: 300, note: 'the steam dies down (and your shadow is coming)' },
      { hold: 'R', until: X(x + 18.6), max: 300 },
      { hold: 'R', jump: 12, ticks: 12 },
      { hold: 'R', until: and(ground, X(x + 32)), max: 400 },
    ];
  },
  'hyd03-cooker': (x) => [
    { hold: 'R', until: (w) => w.player.y < px(11), max: 600, note: 'first whistle' },
    { hold: 'R', until: and(ground, (w) => w.player.y < px(11)), max: 300 },
    { hold: 'R', until: (w) => w.player.y < px(7), max: 300, note: 'second whistle' },
    { hold: 'R', until: and(ground, X(x + 14.6)), max: 300 },
    { hold: 'R', jump: 14, ticks: 14, note: 'over the third whistle' },
    { hold: 'R', until: and(ground, X(x + 30)), max: 400 },
  ],
  'hyd04-statue': (x) => {
    let left = 0;
    const jumps = [px(x + 11.2), px(x + 19.2), px(x + 25.2)];
    const pol = (w: World): { move: 'L' | 'R' | ''; jump: boolean } => {
      const p = w.player;
      if (left > 0) {
        left--;
        return { move: 'R', jump: true };
      }
      if (p.x >= px(x + 31)) return { move: 'R', jump: false };
      const ph = w.flags['hyd04-statue:phase'];
      const goLeft = (w.flags['hyd04-statue:left'] as number) ?? 9;
      if (ph !== undefined && ph !== 'go') return { move: '', jump: false };
      if (ph === 'go' && goLeft < 0.12) return { move: '', jump: false };
      const j = jumps.find((e) => p.x >= e - 3 && p.x <= e + 4);
      if (j !== undefined && p.onGround) {
        if (ph === 'go' && goLeft < 0.6) return { move: '', jump: false };
        left = 12;
        return { move: 'R', jump: true };
      }
      return { move: 'R', jump: false };
    };
    return [{ policy: pol, until: and(ground, X(x + 31)), max: 3000, note: 'freeze on Statue!' }];
  },
  'hyd05-kites': (x) => [{ policy: hopper(['kite'], x + 25, x + 25), until: and(ground, X(x + 27)), max: 3000, note: 'kite to kite' }, { hold: 'R', until: X(x + 32), max: 300 }],
  'hyd06-echo': (x) => [
    ...[4.6, 10.6, 16.6].flatMap((t): Step[] => [
      { hold: 'R', until: X(x + t), max: 400 },
      { hold: 'R', jump: 12, ticks: 12 },
      { hold: 'R', until: ground, max: 100 },
    ]),
    { hold: 'R', until: X(x + 22.5), max: 200, note: 'step away from where you landed before waiting' },
    { hold: '', until: (w) => (w.tick * DT) % 2.4 < 0.08, max: 400, note: 'wait for the gate' },
    { hold: 'R', until: X(x + 32), max: 400 },
  ],
  'hyd07-boxes': (x) => [
    { hold: 'R', until: X(x + 8), max: 600 },
    {
      hold: '',
      until: (w) => {
        const due = w.flags['hyd07-boxes:due'] as number;
        const busy = w.entities.some((e) => e instanceof Thing && (e as Thing).kind === 'crate' && (e as Thing).visible !== false && !(e as any).hidden && Math.abs((e as Thing).x - px(x + 10)) < 4 && (e as Thing).solid.collidable);
        return !busy && (due - w.tick) * DT > 0.3;
      },
      max: 400,
      note: 'walk through between two boxes',
    },
    { hold: 'R', until: X(x + 32), max: 600, note: 'and never stand still under the balconies' },
  ],
  'hyd08-retake': (x) => [
    { hold: 'R', until: X(x + 12.6), max: 600 },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: and(ground, X(x + 32)), max: 400, note: 'don’t slow down: the set wall falls behind you' },
  ],
  // ------------------------------------------------------------ Mumbai
  'bom06-paint': (x) => [
    { hold: 'R', until: X(x + 6.6), max: 400, note: 'under the arch into the gali' },
    { policy: kicker({ xL: px(x + 6), xR: px(x + 9), roofY: px(2), exit: 'R' }), until: (w) => w.player.onGround && w.player.y + w.player.h === px(2), max: 2400, note: 'kick only off dry wall' },
    { hold: 'R', until: and(ground, X(x + 29)), max: 600, note: 'along the roof and down' },
    { hold: 'R', until: X(x + 30), max: 100 },
  ],
  'bom06-spikes': (x) => [
    { hold: 'R', until: X(x + 6.6), max: 400 },
    { policy: kicker({ xL: px(x + 6), xR: px(x + 9), roofY: px(2), exit: 'R' }), until: (w) => w.player.onGround && w.player.y + w.player.h === px(2), max: 2400, note: 'kick round the spikes' },
    { hold: 'R', until: and(ground, X(x + 25)), max: 600 },
    { hold: 'R', until: X(x + 26), max: 100 },
  ],
  'bom07-holi': (x) => [
    {
      policy: (w: World): Out => {
        const p = w.player;
        const truth = w.flags.holi?.truth as string | null;
        const k = p.cx < px(x + 3) ? -1 : Math.floor((p.cx - px(x + 3)) / 32);
        const centre = (i: number) => px(x + 3 + i * 2) + 16;
        let target: number;
        if (k >= HOLI_TILES.length - 1 && k >= 0 && (truth === null || true) && k === HOLI_TILES.length - 1) target = px(x + 25);
        else if (k >= HOLI_TILES.length) target = px(x + 25);
        else if (truth && HOLI_TILES[k + 1] === truth) target = centre(k + 1);
        else target = k < 0 ? px(x + 2.2) : centre(k);
        return { move: p.cx < target - 2 ? 'R' : p.cx > target + 2 ? 'L' : '', jump: false };
      },
      until: and(ground, X(x + 24)),
      max: 4000,
      note: 'step on to the next mat only when its colour is thrown (the balloon, not the shout)',
    },
    { hold: 'R', until: X(x + 30), max: 300 },
  ],
  'bom07-relay': (x) => [
    { hold: 'R', until: (w) => w.flags.relay === 'belt', max: 400, note: 'the dabba goes on the belt' },
    { hold: 'R', until: X(x + 6.6), max: 200 },
    { hold: 'R', jump: 14, ticks: 14, note: 'up the crates' },
    { hold: 'R', until: and(ground, X(x + 8.5)), max: 200 },
    { hold: 'R', jump: 14, ticks: 14, note: 'on to the wall' },
    { hold: 'R', until: and(ground, X(x + 12)), max: 300, note: 'and down the other side' },
    {
      policy: (w: World): Out => {
        const d = w.entities.find((e: any) => e.v === 62 && e.end !== undefined && e.alive) as any;
        if (!d) return { move: '', jump: false };
        const c = d.x + 4;
        return { move: w.player.cx < c - 3 ? 'R' : w.player.cx > c + 3 ? 'L' : '', jump: false };
      },
      until: (w) => w.flags.relay === 'caught',
      max: 600,
      note: 'catch the dabba before the drain',
    },
    { hold: 'R', until: X(x + 30), max: 400 },
  ],
  'bom08-together': (x) => [
    { hold: 'R', until: (w) => (w.twins[0]?.cx ?? 0) >= px(x + 12) + 14, max: 900, note: 'his gate opens off your plate; walk on till he’s on his red plate' },
    { hold: '', until: (w) => !!w.flags['bom08-together:open'], max: 120, note: 'both on your plates: the shutters open' },
    { hold: 'R', until: X(x + 28), max: 600 },
  ],
  'bom08-mirror': (x) => [
    { hold: 'R', until: (w) => w.flags.mirror === 1 && w.player.cx >= px(x + 4) + 8, max: 600, note: 'he turns up at the far end; free him with your plate' },
    { hold: 'R', until: X(x + 6.8), max: 200 },
    { hold: 'R', jump: 12, ticks: 12, note: 'the gap (he jumps too)' },
    { hold: 'R', until: (w) => !!w.twins[0] && w.player.onGround && Math.abs(w.player.cx - w.twins[0].cx) < 3, max: 600, note: 'meet in the middle' },
    { hold: '', until: (w) => w.flags.mirror === 2, max: 60 },
    { hold: 'R', until: X(x + 24), max: 400 },
  ],
  'bom02-walkway': (x) => [
    { hold: 'R', until: X(x + 11.6), max: 600, note: 'the first belt helps' },
    { hold: 'R', jump: 12, ticks: 12, note: 'to the second belt' },
    { hold: 'R', until: and(ground, X(x + 28)), max: 1200, note: 'it turns round: keep running against it' },
    { hold: 'R', until: X(x + 32), max: 300 },
  ],
  'bom03-wire': (x) => {
    const quiet = (w: World) => {
      for (let k = 0; k <= 0.5; k += 1 / 60) if ((w.tick * DT + k) % 1.7 < 0.65) return false;
      return true;
    };
    return [
      { hold: 'R', until: X(x + 1.2), max: 400 },
      { hold: 'R', jump: 12, ticks: 12, note: 'up on the first roof' },
      { hold: 'R', until: ground, max: 100 },
      ...[5.4, 9.4, 13.4, 17.4, 21.2].flatMap((t): Step[] => [
        { hold: 'R', until: X(x + t), max: 300 },
        { hold: '', until: quiet, max: 300, note: 'wait for the wire to go quiet' },
        { hold: 'R', jump: 12, ticks: 12 },
        { hold: 'R', until: ground, max: 100 },
      ]),
      { hold: 'R', until: X(x + 30), max: 300 },
    ];
  },
  'bom04-manholes': (x) => [
    ...[6.6, 13.6, 20.6].flatMap((t): Step[] => [
      { hold: 'R', until: X(x + t), max: 400, note: 'a cup spins over a manhole' },
      { hold: 'R', jump: 12, ticks: 12 },
      { hold: 'R', until: ground, max: 100 },
    ]),
    { hold: 'R', until: X(x + 32), max: 400 },
  ],
  'bom05-doors': (x) => [
    { hold: 'R', until: X(x + 4.2), max: 400 },
    { hold: 'R', jump: 30, ticks: 30, long: true, note: 'over the EXIT door: it sends you back' },
    { hold: 'R', until: and(ground, X(x + 8)), max: 200 },
    { hold: 'R', until: (w) => w.player.x >= px(x + 24) - 2, max: 600, note: 'through the painted door and into NO ENTRY' },
    { hold: 'R', until: and(ground, X(x + 32)), max: 400 },
  ],
};
Object.assign(ACT_ROUTES, WEST_ACT_ROUTES);
for (const t of CITY_TESTS) Object.assign(ACT_ROUTES, t.actRoutes);
