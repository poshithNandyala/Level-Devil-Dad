// Puducherry's own route file for the hardness pass. Its proven plays still live in the shared tables
// (tests/solutions.ts, tests/west.ts, tests/acts.ts, tests/endings.ts); anything set here is merged LAST and
// replaces that stage's (or act's, or ending's) entry there, so a hardness-pass worker edits only this file
// and the city's stage files. After a change on purpose: npm run refreeze -- PDY (docs/CITY-MODULE.md).
import type { World } from '../../src/game/world';
import { Door } from '../../src/game/entities/basics';
import { type Step, X, and, done, ground, quiet, rollerNear } from '../runner';
import type { CityTests } from '../city-tests';

type Move = 'L' | 'R' | '';
type Out = { move: Move; jump: boolean };
type Policy = (w: World, m: { hold: number; [k: string]: any }, d: Door) => Out;

const px = (t: number) => t * 16;
/** the top of a flagstone (and of a folded mimosa leaf): one tile above the ground */
const STONE_TOP = px(14);
const go = (move: Move): Out => ({ move, jump: false });
const toward = (w: World, x: number, slack = 2): Move => (w.player.cx < x - slack ? 'R' : w.player.cx > x + slack ? 'L' : '');
const die: Step = { hold: 'R', until: done, max: 1200 };
const stay: Step = { hold: '', until: done, max: 1200 };
/** is there something solid just ahead of Dad's feet (a flagstone's side, a heap of boules)? */
const blocked = (w: World, dir: Move) => {
  const p = w.player;
  if (!dir) return false;
  const x = dir === 'R' ? p.x + p.w + 2 : p.x - 4;
  return !!w.solidAt(x, p.y + p.h - 6, 2, 4);
};
/** standing on something one tile up (a flagstone, a folded leaf) rather than the path */
const upOnOne = (w: World) => w.player.onGround && w.player.y + w.player.h <= STONE_TOP + 1;

/** walk right to tile `to`, hopping up on to anything one tile high in the way (the flagstones) */
function walkHop(to: number, note?: string, max = 1500): Step {
  let jt = 0,
    last = -1;
  return {
    note,
    max,
    until: and(ground, X(to)),
    policy: (w) => {
      if (w.tick < last) jt = 0;
      last = w.tick;
      if (jt > 0) {
        jt--;
        return { move: 'R', jump: true };
      }
      if (w.player.onGround && blocked(w, 'R')) {
        jt = 8;
        return { move: 'R', jump: true };
      }
      return go('R');
    },
  };
}

// ------------------------------------------------------------------ PDY-09: Pétanque
const nearestTo = (stones: number[], x: number) => stones.reduce((b, s, i) => (Math.abs(s - x) < Math.abs(stones[b] - x) ? i : b), 0);

/**
 * a boulodrome, played right: up on a flagstone whenever a boule rolls at you, and otherwise on the stone
 * nearest the cochonnet as it lies NOW (so when a boule knocks it on, follow it, once the boule has passed).
 * `o.fixed`: a dad who picks one stone and stays on it (the plays that die); `o.eager`: a dad who moves for
 * the next stone the moment the caller shouts, before the boule has passed him.
 */
function pitch(f: string, nVolleys: number, note: string, o: { fixed?: number; eager?: number; beside?: boolean; untilDone?: boolean } = {}): Step {
  let jt = 0,
    jm: Move = 'R',
    last = -1;
  const F = (w: World, k: string) => w.flags[`${f}:${k}`];
  return {
    note,
    max: 4000,
    until: o.untilDone || o.fixed !== undefined || o.eager !== undefined || o.beside ? done : (w) => F(w, 'volley') === nVolleys - 1 && F(w, 'phase') === 'done',
    policy: (w) => {
      if (w.tick < last) jt = 0;
      last = w.tick;
      const p = w.player;
      const stones = F(w, 'stones') as number[] | undefined;
      if (!stones) return go('R');
      if (jt > 0) {
        jt--;
        return { move: jm, jump: true };
      }
      const onStone = upOnOne(w);
      const roller = F(w, 'roller') as { cx: number; dir: number } | null | undefined;
      const coming = !!roller && !(roller.dir > 0 ? roller.cx > p.cx + 12 : roller.cx < p.cx - 12);
      const near = F(w, 'nearest') as number;
      // a dead end (the cochonnet is off the pitch): no stone is spared, so down into the gap beside your stone
      const gap = near < 0;
      let target = gap ? stones[nearestTo(stones, p.cx)] + (p.cx >= stones[nearestTo(stones, p.cx)] ? 32 : -32) : stones[near];
      if (o.fixed !== undefined) target = stones[o.fixed];
      if (o.eager !== undefined && F(w, 'volley') === nVolleys - 1) target = stones[o.eager];
      // a boule rolling at you: the nearest stone, now (the stone you are on, if you are on one)
      if (coming && o.eager === undefined && !o.beside) target = stones[nearestTo(stones, p.cx)];
      // the misreading: "nearest the cochonnet" taken as standing beside it, down on the gravel
      if (o.beside && F(w, 'volley') === nVolleys - 1) {
        const j = F(w, 'jack') as number;
        return go(toward(w, j + (j >= stones[F(w, 'nearest') as number] ? 12 : -12), 2));
      }
      const dir = toward(w, target, 3);
      if (onStone && Math.abs(p.cx - target) <= 10) return go(toward(w, target, 2));
      if (p.onGround && dir && blocked(w, dir) && !(gap && o.fixed === undefined)) {
        jt = 8;
        jm = dir;
        return { move: dir, jump: true };
      }
      return go(dir);
    },
  };
}

const petanqueRoom = (): Step[] => [pitch('pdy09', 1, 'up on a stone as the boule rolls; then the stone nearest where the cochonnet lands'), walkHop(31.5, 'on along the pitch')];
/** an act of the boulodrome: the plain volley, then this end's twist */
const pitchAct = (id: string, note: string) => (x: number): Step[] => [pitch(id, 2, note), walkHop(x + 31.5, 'on')];

// ------------------------------------------------------------------ PDY-10: Touch-Me-Not
const leafState = (name: string) => (w: World) => w.flags[`pdy10:${name}`] as string | undefined;
/**
 * cross a mimosa leaf the right way: step on its near end (over the path), let it fold under you, then
 * climb on the bar and cross before the count runs out. `at`: the leaf's left end, tile x. `far`: where the
 * path is solid again past the pit, tile x. `wait`: linger on the bar this many ticks (the plays that die).
 */
function foldAndCross(name: string, at: number, far: number, wait = 0): Step[] {
  const st = leafState(name);
  const look: Step[] = wait ? [{ hold: '', ticks: wait, note: 'a look first' }] : [];
  return [
    // (let go of right first: a direction held since a jump is released late by a person, and the near end is narrow)
    { hold: '', ticks: 2 },
    { hold: 'R', until: (w) => w.player.x + w.player.w >= px(at) + 6, max: 900, note: `${name}: up to the leaf` },
    { hold: '', jump: 8, ticks: 8, note: 'a hop straight up on to its near end' },
    { hold: '', until: (w) => st(w) === 'fold' || st(w) === 'shut', max: 200, note: 'and let it fold under you' },
    { hold: '', until: (w) => st(w) === 'shut' && w.player.onGround, max: 200, note: 'it is a bar now' },
    ...look,
    { hold: 'R', jump: 8, ticks: 8, note: 'up on the bar' },
    { hold: 'R', until: (w) => w.player.onGround && w.player.x >= px(far), max: 400, note: 'across, before it opens' },
  ];
}
const mimosaRoom = (): Step[] => [...foldAndCross('leaf1', 5, 13.3), ...foldAndCross('leaf2', 17, 24.3), { hold: 'R', until: and(ground, X(31.5)), max: 600 }];

const thengaAct = (x: number): Step[] => {
  const nut = (w: World) => w.flags['pdy10-thenga:nut'] as string;
  const st = leafState('thenga');
  return [
    { hold: '', ticks: 2 },
    { hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 7) + 6, max: 900, note: 'up to the leaf under the palm' },
    { hold: '', jump: 8, ticks: 8, note: 'a hop straight up on to its near end' },
    { hold: '', until: (w) => st(w) === 'fold' || st(w) === 'shut', max: 200, note: 'it folds: the nut is coming' },
    { hold: 'L', until: (w) => w.player.x + w.player.w <= px(x + 6.4), max: 120, note: 'step back left at once' },
    { hold: '', until: (w) => nut(w) === 'gone', max: 400, note: 'the nut lands where you stood and rolls off' },
    { hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 7) - 3, max: 200 },
    { hold: 'R', jump: 8, ticks: 8, note: 'up on the bar' },
    { hold: 'R', until: (w) => w.player.onGround && w.player.x >= px(x + 14.3), max: 400, note: 'across' },
    { hold: 'R', until: and(ground, X(x + 21.5)), max: 400 },
  ];
};
const aaruAct = (x: number): Step[] => {
  const st = leafState('aaru');
  const f = (k: string) => (w: World) => w.flags[`pdy10-aaru:${k}`];
  return [
    { hold: '', ticks: 2 },
    { hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 9) + 6, max: 900, note: 'the bell goes: up to the leaf, not along the road' },
    { hold: '', jump: 8, ticks: 8, note: 'a hop straight up on to its near end' },
    { hold: '', until: (w) => st(w) === 'shut' && w.player.onGround, max: 200, note: 'let it fold: a bar' },
    { hold: 'R', jump: 8, ticks: 8, note: 'up on the bar' },
    { hold: 'R', until: (w) => w.player.onGround && w.player.x >= px(x + 10.4), max: 120 },
    { hold: '', until: (w) => !!f('rightClear')(w) && (f('front')(w) as number) < px(x + 8), max: 900, note: 'the spikes pass under you' },
    { hold: 'R', until: (w) => w.player.onGround && w.player.x >= px(x + 16.3), max: 400, note: 'across' },
    { hold: 'R', until: and(ground, X(x + 25.5)), max: 600 },
  ];
};

// ------------------------------------------------------------------ the two doors
const endingPolicies: Record<string, Policy> = {
  /** the old lamp door, a person's timing: the dash in starts anywhere in the first 0.35 s of light, not only the first 0.12 s */
  'pdy-lamp'(w, _m, d) {
    const p = w.player;
    const sx = d.x - px(3);
    if (p.x + p.w < sx - 6) return go('R');
    if (w.flags.twist === 'lit' && (w.flags.litFor as number) < 0.35) return go('R');
    if (p.x + p.w >= sx - 2 && p.x + p.w < sx + 8 && w.flags.twist === 'dark') return go('L');
    return go(p.x + p.w > sx ? 'R' : '');
  },
  /** stand on the stone nearest the cochonnet while three volleys heap boules on the other; then climb the heap and the wall */
  'pdy-boule-pile'(w, m, d) {
    const F = (k: string) => w.flags[`pdy09door:${k}`];
    const p = w.player;
    const D = d.x / 16;
    const stones = F('stones') as number[] | undefined;
    if (!stones) return go('R');
    const heaped = F('volley') === 2 && F('phase') === 'done';
    const onPath = p.onGround && p.y + p.h > STONE_TOP + 1;
    if (!heaped || (onPath && p.cx < px(D - 7.5))) {
      const target = stones[0];
      const onStone = upOnOne(w);
      if (onStone && Math.abs(p.cx - target) <= 10) return go(toward(w, target, 2));
      const dir = toward(w, target, 3);
      if (p.onGround && dir && blocked(w, dir)) {
        m.hold = 8;
        return { move: dir, jump: true };
      }
      return go(dir);
    }
    // overshot the heap on to the path by the wall: a full jump back up on to it
    if (onPath && p.cx >= px(D - 7.5) && p.cx < px(D - 3)) {
      m.hold = 30;
      m.dir = 'L';
      return { move: 'L', jump: true };
    }
    // the climb: refuge stone -> heap -> over the wall -> door
    if (p.onGround && p.y + p.h <= STONE_TOP + 1 && p.x + p.w >= px(D - 9) - 6 && p.cx < px(D - 7.5)) {
      m.hold = 16;
      m.dir = 'R';
      return { move: 'R', jump: true };
    }
    if (p.onGround && p.y + p.h <= STONE_TOP - 30 && p.cx >= px(D - 6.7) && p.cx < px(D - 4.5)) {
      m.hold = 22;
      m.dir = 'R';
      return { move: 'R', jump: true };
    }
    if (!p.onGround) return { move: m.hold > 0 ? (m.dir as Move) ?? 'R' : 'R', jump: m.hold > 0 };
    return go(toward(w, d.x + 8, 1));
  },
  /** cross the long leaf in the dark, when it is a bar; in the light it folds into the pond */
  'pdy-night-leaf'(w, m, d) {
    const p = w.player;
    const st = w.flags['pdy10:door'] as string;
    const x0 = d.x - px(10);
    if (p.cx > d.x - px(1.6)) return go(toward(w, d.x + 8, 1));
    if (!p.onGround) return { move: 'R', jump: m.hold > 0 };
    if (p.y + p.h <= STONE_TOP + 1) return go('R');
    // on the path before it: wait for the dark, early in the dark
    if (p.x + p.w < x0 - 4) return st === 'shut' && (w.flags.darkFor as number) >= 0 && (w.flags.darkFor as number) < 0.9 ? go('R') : go(p.x + p.w < x0 - 30 ? 'R' : '');
    if (st !== 'shut') return go('L');
    m.hold = 8;
    return { move: 'R', jump: true };
  },
};

/** Tara's way at the door: wait for the lamp, then hop on to the broad open leaf and walk across it */
function inTheLight(): (w: World) => Out {
  let jt = 0,
    last = -1;
  return (w) => {
    if (w.tick < last) jt = 0;
    last = w.tick;
    const d = w.entities.find((e) => e instanceof Door && !(e as Door).fake) as Door;
    const x0 = d.x - px(10);
    const p = w.player;
    if (jt > 0) {
      jt--;
      return { move: 'R', jump: true };
    }
    if (p.x + p.w < x0 - 6) return go('R');
    if (p.onGround && p.y + p.h > STONE_TOP + 1) {
      if (w.flags.twist === 'lit' && (w.flags.litFor as number) < 0.5) {
        jt = 8;
        return { move: 'R', jump: true };
      }
      return go('');
    }
    return go('R');
  };
}

// ------------------------------------------------------------------ plays
const naive: Record<string, { steps: Step[]; cause?: string }> = {
  'PDY-09': { steps: [die], cause: 'pdy-boule' },
  'PDY-10': { steps: [die], cause: 'splash' },
};
const fix: Record<string, { steps: Step[]; cause?: string }> = {
  // first death: bowled over on the gravel. So: up on the flagstone nearest the cochonnet, and stay there
  'PDY-09': { steps: [pitch('pdy09', 1, 'up on the stone nearest the cochonnet, and stay', { fixed: 1 })], cause: 'pdy-plomb' },
  // first death: walked into the pond. So: fold the first leaf and cross it the right way... and at the
  // second, folded the same, take the same look round before climbing on: it opens again under you
  'PDY-10': { steps: [...foldAndCross('leaf1', 5, 13.3), ...foldAndCross('leaf2', 17, 24.3, 150), die], cause: 'pdy-mul' },
};
const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {
  'PDY-09': [
    { what: 'stay on the first stone you climbed', steps: [pitch('pdy09', 1, 'first stone', { fixed: 0 })], cause: 'pdy-plomb' },
    { what: 'run for the far stone the moment the caller shouts', steps: [pitch('pdy09', 1, 'eager', { eager: 4 })], cause: 'pdy-boule' },
  ],
  'PDY-10': [
    { what: 'jump on to the first leaf and run across', steps: [{ hold: 'R', until: X(4.2), max: 300 }, { hold: 'R', jump: 10, ticks: 10 }, die], cause: 'splash' },
    { what: 'fold the first leaf, then wait for it to open again and walk across the open leaf', steps: [...foldAndCross('leaf1', 5, 13.3).slice(0, 4), { hold: '', until: (w) => leafState('leaf1')(w) === 'open', max: 900 }, { hold: 'R', jump: 8, ticks: 8 }, die], cause: 'splash' },
  ],
};

const actRoutes: Record<string, (x: number) => Step[]> = {
  'pdy09-pointe': pitchAct('pdy09-pointe', 'the point from the far end knocks it back: the stone on your side of it'),
  'pdy09-carreau': pitchAct('pdy09-carreau', 'the boule stops on the lying one: the cochonnet stays, so do you'),
  'pdy09-doublette': pitchAct('pdy09-doublette', 'on, then hard back past the start: judge after both'),
  'pdy09-tir': pitchAct('pdy09-tir', 'the hard shot knocks it three along'),
  'pdy09-mene': pitchAct('pdy09-mene', 'a dead end: the cochonnet is off, get down on the gravel'),
  'pdy10-thenga': thengaAct,
  'pdy10-aaru': aaruAct,
};

/** the tour's Promenade (tour-pdy-b20): the plywood square over the gap's last tile slides on as you jump for it */
function tour01(S: Record<string, Step[]>) {
  // the shared route ends 'up on the deck', a landing, then the walk to the door: the Promenade replaces the walk
  const R = S['PDY-01'].slice(0, -1);
  S['PDY-01'] = [
    ...R,
    { hold: 'R', until: X(101.6), max: 900, note: 'to the edge of the gap' },
    { hold: 'R', jump: 30, ticks: 30, long: true, note: 'a long jump, for the sea wall and not the square' },
    { hold: 'R', until: ground, max: 300 },
    { hold: 'R', until: done, max: 600 },
  ];
  naive['PDY-01'] = { steps: [...R, { hold: 'R', until: X(101.8), max: 900 }, { hold: 'R', jump: 12, ticks: 12, note: 'a hop, for the yellow square' }, die], cause: 'splash' };
  mistakes['PDY-01'] = [
    { what: 'walk straight on along the Promenade', steps: [...R, die], cause: 'splash' },
    { what: 'jump for the square from further back, so as to be on it sooner', steps: [...R, { hold: 'R', until: X(101.0), max: 900 }, { hold: 'R', jump: 16, ticks: 16 }, die], cause: 'splash' },
  ];
}

/** PDY-02, a person's timing (stage unchanged): hop each blowhole only when it stays quiet 0.9 s, not 0.55 */
function rockBeach(S: Record<string, Step[]>) {
  // hop from the middle of each rock, not its edge: a person lets go of right a moment late after a jump,
  // and from the edge that moment walks you off the next rock into the sea
  const need = 0.8;
  /** stand at tile x `at` (a step back if the landing overran it), then hop when blowhole `i` stays quiet */
  const hop = (i: number, at: number, ticks = 12): Step[] => [
    { policy: (w) => go(toward(w, px(at) + 5, 3)), until: (w) => w.player.onGround && Math.abs(w.player.cx - px(at) - 5) <= 4, max: 300, note: 'to the middle of the rock' },
    { hold: '', until: and(ground, quiet(i, need)), max: 600, note: i === 3 ? 'wait for the second sneeze' : undefined },
    // jump first, lean right a moment later: a direction pressed with the jump is let go late, and that walks you off the next rock
    { hold: '', jump: ticks, ticks: 3 },
    { hold: 'R', until: ground, max: 200 },
    { hold: '', ticks: 2 },
  ];
  const room: Step[] = [...hop(0, 8.2), ...hop(1, 12.2), ...hop(2, 16.2), ...hop(3, 20.2, 14)];
  // (the shared long run keeps the room's first 12 steps; the walk on, the act and the door follow)
  S['PDY-02'] = [...room, ...S['PDY-02'].slice(12)];
}

/** a hop a person makes: jump, then lean right a moment later (the direction is not let go late, so no drift on landing) */
const hopLean = (at: number, note?: string, ticks = 12): Step[] => [
  { hold: 'R', until: X(at), max: 600, note },
  { hold: '', jump: ticks, ticks: 3 },
  { hold: 'R', until: ground, max: 200 },
  { hold: '', ticks: 2 },
];
/** PDY-04, a person's timing (the socket itself changed: it no longer fires under a hop in the air): the same three hops, without the drift */
function sixOClock(S: Record<string, Step[]>) {
  const room: Step[] = [...hopLean(9.4, 'over the first socket'), ...hopLean(13.4), ...hopLean(17.4)];
  // the shared long run keeps the room's first 6 steps, then 'the last bollard is the lift' and on
  S['PDY-04'] = [...room, ...S['PDY-04'].slice(6)];
}

/** PDY-05, a person's timing (stage unchanged): hop the cart while it is still 78 px off, not 46, and the loose cobble from 25.8, not 26.6 */
function grandCanal(S: Record<string, Step[]>) {
  const r = S['PDY-05'];
  // steps 0-3: to the bridge, wait, walk to the cart, hop it; then the cobble (jump first, lean after), then the rest
  S['PDY-05'] = [r[0], r[1], { ...r[2], until: rollerNear(62) }, r[3], ...hopLean(25.4, 'the loose cobble again, from further back'), ...r.slice(6)];
}

const solutions = (S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) => {
  tour01(S);
  rockBeach(S);
  sixOClock(S);
  grandCanal(S);
  S['PDY-09'] = petanqueRoom();
  lengthen('PDY-09', 0, []);
  S['PDY-10'] = mimosaRoom();
  lengthen('PDY-10', 0, []);
  // the acts' two plays each: A1 the lesson of the room (the stone nearest the cochonnet after the first knock,
  // and stay), A2 its obvious fix (move for the next stone the moment the caller shouts, before the boule is by)
  const r9 = S['PDY-09'];
  const actStart = (id: string) => r9.findIndex((st) => st.note?.startsWith(ACT_NOTE[id]));
  const ACT_NOTE: Record<string, string> = {
    'pdy09-pointe': 'the point from the far end',
    'pdy09-carreau': 'the boule stops on the lying one',
    'pdy09-doublette': 'on, then hard back',
    'pdy09-tir': 'the hard shot',
    'pdy09-mene': 'a dead end',
  };
  const before = (id: string) => r9.slice(0, actStart(id));
  mistakes['PDY-09'].push(
    { what: 'pointe A1: stay on the stone the first knock made nearest', steps: [...before('pdy09-pointe'), pitch('pdy09-pointe', 2, 'stay', { fixed: 2 })], cause: 'pdy-plomb' },
    { what: 'pointe A2: "nearest the cochonnet": get down and stand beside it on the gravel', steps: [...before('pdy09-pointe'), pitch('pdy09-pointe', 2, 'beside', { beside: true })], cause: 'pdy-boule' },
    { what: 'carreau A1: move a stone on for the knock that never comes', steps: [...before('pdy09-carreau'), pitch('pdy09-carreau', 2, 'eager', { eager: 2 })], cause: 'pdy-plomb' },
    { what: 'doublette A1: follow the first knock and stay', steps: [...before('pdy09-doublette'), pitch('pdy09-doublette', 2, 'stay', { fixed: 2 })], cause: 'pdy-plomb' },
    { what: 'doublette A2: two throwers at the cochonnet: get down and stand beside it', steps: [...before('pdy09-doublette'), pitch('pdy09-doublette', 2, 'beside', { beside: true })], cause: 'pdy-boule' },
    { what: 'tir A1: one stone on, as the point taught', steps: [...before('pdy09-tir'), pitch('pdy09-tir', 2, 'stay', { fixed: 1 })], cause: 'pdy-plomb' },
    { what: 'tir A2: the hard shot is coming: get down and stand beside the cochonnet', steps: [...before('pdy09-tir'), pitch('pdy09-tir', 2, 'beside', { beside: true })], cause: 'pdy-boule' },
    { what: 'mene A1: stay on the stone that was nearest when the cochonnet left', steps: [...before('pdy09-mene'), pitch('pdy09-mene', 2, 'stay', { fixed: 1 })], cause: 'pdy-plomb' },
    { what: 'mene A2: the hard shot again: get down beside the cochonnet', steps: [...before('pdy09-mene'), pitch('pdy09-mene', 2, 'beside', { beside: true })], cause: 'pdy-boule' },
    { what: 'mene A3: run after the cochonnet to the far stone', steps: [...before('pdy09-mene'), pitch('pdy09-mene', 2, 'eager', { eager: 4 })], cause: 'pdy-boule' },
  );
  // the door: Tara says jump the wall, so walk on along the gravel to it
  const door9 = r9.findIndex((st) => st.note?.startsWith('the door'));
  mistakes['PDY-09'].push({ what: 'door: walk straight on along the gravel to the wall, as Tara says', steps: [...r9.slice(0, door9), die], cause: 'pdy-boule' });
  mistakes['PDY-09'].push({ what: 'door: stand on the stone the boules are heaping on', steps: [...r9.slice(0, door9), pitch('pdy09door', 3, 'the heap stone', { fixed: 1 })], cause: 'crushed' });
  // PDY-10's acts and door
  const r10 = S['PDY-10'];
  const at = (note: string) => {
    const i = r10.findIndex((st) => st.note === note);
    if (i < 0) throw new Error(`PDY-10: no step '${note}'`);
    return i;
  };
  mistakes['PDY-10'].push(
    { what: 'thenga A1: fold the leaf and stand there as it folds, like the first leaf', steps: [...r10.slice(0, at('it folds: the nut is coming') + 1), stay], cause: 'hit' },
    { what: 'thenga A2: hop under the palm first, as at Paradise Beach, and wait for the nut; then on along the path', steps: [...r10.slice(0, at('up to the leaf under the palm')), { hold: 'R', until: X(32 + 5.4), max: 600 }, { hold: '', jump: 12, ticks: 12 }, { hold: '', ticks: 90 }, die], cause: 'pdy-mul' },
    { what: 'aaru A1: the bell: run, as at six o’clock', steps: [...r10.slice(0, at('the bell goes: up to the leaf, not along the road')), die], cause: 'pdy-mul' },
    { what: 'aaru A2: the bell: fold the leaf and wait on the path beside it', steps: [...r10.slice(0, at('let it fold: a bar') + 1), stay], cause: 'spikes' },
    { what: 'door: cross the long leaf in the light, as Tara says', steps: [...r10.slice(0, at('the door: pdy-night-leaf')), { policy: inTheLight(), until: done, max: 2000 }], cause: 'splash' },
  );
};

export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  fair: ['PDY-09', 'PDY-10'],
};
