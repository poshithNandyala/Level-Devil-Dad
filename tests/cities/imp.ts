// Proven routes for Imphal: every stage's room, its acts and its door, plus the plays that must die.
// Found by tests/city-tests.ts; merged into SOLUTIONS, NAIVE, FIX, MISTAKES, ACT_ROUTES and ENDING_POLICIES.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import { Step, X, and, ground, done } from '../runner';
import type { CityTests } from '../city-tests';
import { LEVEL_BY_ID } from '../../src/game/levels';
import { LEAD } from '../../src/game/cities/imp/levels';
import type { FisherState } from '../../src/game/cities/imp/s02';
import type { TopiaryState } from '../../src/game/cities/imp/s03';
import type { LeafState } from '../../src/game/cities/imp/s04';
import type { DockState } from '../../src/game/cities/imp/s05';
import type { RideState } from '../../src/game/cities/imp/s07';
import type { RowState } from '../../src/game/cities/imp/s08';
import type { PonyState } from '../../src/game/cities/imp/s09';

type Move = 'L' | 'R' | '';
type Out = { move: Move; jump: boolean };
type Policy = (w: World, m: { hold: number; [k: string]: any }, d: Door) => Out;
const go = (move: Move, jump = false): Out => ({ move, jump });
const hop = (at: number, note: string, ticks = 12): Step[] => [
  { hold: 'R', until: X(at), max: 900 },
  { hold: 'R', jump: ticks, ticks, note },
  { hold: 'R', until: ground, max: 300 },
];
const runOn: Step[] = [{ hold: 'R', until: done, max: 5000 }];
/** keep the jump held through the rise (a policy's jump lasts only while it keeps saying so) */
const rising = (w: World) => w.player.vy < 0 && w.player.airTicks < 14;

// ------------------------------------------------------------------ IMP-01
const upToGate: Step[] = [...hop(10.4, 'the ditch'), ...hop(20.7, 'a step'), ...hop(22.7, 'a step'), ...hop(36.6, 'a post'), ...hop(39.6, 'a post'), ...hop(42.6, 'a post')];
const tourRoute = (): Step[] => [
  ...upToGate,
  { hold: 'R', until: X(52.2), max: 600, note: 'to the rampart’s start' },
  { hold: 'R', jump: 24, ticks: 24, long: true, note: 'up on to the rampart (a held jump)' },
  { hold: 'R', until: and(ground, X(55)), max: 400 },
  { hold: 'R', until: X(64.2), max: 600, note: 'over the wall to the rampart’s end' },
  { hold: 'R', jump: 24, ticks: 24, long: true, note: 'long jump over the hyacinth to the real bank' },
  { hold: 'R', until: and(ground, X(69)), max: 400 },
  ...hop(80.4, 'the parked scooter', 14),
  { hold: 'R', until: X(92.4), max: 600 },
  { hold: 'R', jump: 12, ticks: 12, note: 'up on the deck' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', until: done, max: 1200 },
];

// ------------------------------------------------------------------ IMP-02
const fisherOf = (w: World, key: string) => w.flags[key] as FisherState | undefined;
/** the walk reader: when he winds up, stop if you were walking (the net lands ahead); go on when it has landed */
const netWalk = (key: string) => (w: World): Out => {
  const s = fisherOf(w, key);
  if (!s || s.phase === 'idle') return go('R');
  if (s.phase === 'windup' || s.phase === 'flight') return go('');
  if (s.phase === 'closing' && Math.abs(w.player.x + 5 - s.target) < 30) return go('');
  return go('R');
};
const room02 = (): Step[] => [{ policy: netWalk('imp2'), until: and(ground, X(31.5)), max: 3000, note: 'stop at each wind-up, walk while he gathers' }];
/** the leap reader: run, jump the gaps, and in the air let go so the landing is short of where he aimed */
const leapWalk = (key: string, gaps: number[]) => (w: World): Out => {
  const s = fisherOf(w, key);
  const p = w.player;
  const next = gaps.find((g) => p.x < g * 16 - 2);
  if (!p.onGround) {
    // once clear of the gap, pull back so the landing is short of where he aimed (a full leap's length)
    const over = gaps.find((g) => p.x > g * 16 - 30 && p.x < g * 16 + 90);
    if (over !== undefined && p.x > over * 16 + 18) return go('L');
    return go('R');
  }
  // a net in the air or closing just ahead: wait for it to close and be gathered
  if (s && (s.phase === 'flight' || s.phase === 'closing') && s.target > p.x - 10 && s.target - p.x < 70) return go('');
  if (next !== undefined && p.x >= next * 16 - 22) return go('R', true);
  return go('R');
};
const act02 = (x: number): Step[] => [{ policy: leapWalk('imp2b', [x + 9, x + 27]), until: and(ground, X(x + 38)), max: 4000, note: 'jump each gap and land short' }, { hold: 'R', until: X(x + 39.5), max: 300 }];

// ------------------------------------------------------------------ IMP-03
const topiaryOf = (w: World, key: string) => w.flags[key] as TopiaryState;
/** stay level with the gardener: hop up to his tier as he reaches it; two tiers away is safe too */
const follow = (key: string, x0: number, final: number) => (w: World): Out => {
  const s = topiaryOf(w, key);
  const p = w.player;
  if (!p.onGround) return go('R', rising(w));
  const feet = p.y + p.h;
  const tier = feet >= 239 ? -1 : Math.round((224 - feet) / 32);
  const want = s.done ? final : s.tier;
  if (tier < want) {
    const edge = (x0 + 4 * (tier + 1)) * 16;
    return go('R', p.x > edge - 20);
  }
  if (tier === want && p.x < (x0 + 4 * tier) * 16 + 30) return go('R');
  if (tier > want) return go('');
  return go('');
};
const room03 = (): Step[] => [
  { hold: 'R', until: X(4.5), max: 300 },
  { policy: follow('imp3', 6, 3), until: (w) => topiaryOf(w, 'imp3').done && w.player.onGround, max: 3000, note: 'up the tiers level with the gardener' },
  { hold: 'R', until: and(ground, X(31.5)), max: 900, note: 'off the top and on' },
];
/** the gardener comes down: wait on tier 0 while he is high, be on his tier as he passes, then two away above him */
const passDown = (key: string, x0: number) => (w: World): Out => {
  const s = topiaryOf(w, key);
  const p = w.player;
  if (!p.onGround) return go('R', rising(w));
  const feet = p.y + p.h;
  const tier = feet >= 239 ? -1 : Math.round((224 - feet) / 32);
  // he starts at tier 3 and comes down: wait on tier 0 while he is at 3 or 2, be on tier 1 with him, then tier 2
  // (two away) when he is at 0, and up to 3 once he has stopped
  const want = s.t0 < 0 ? 0 : s.done ? 3 : s.tier >= 2 ? 0 : s.tier === 1 ? 1 : 2;
  if (tier < want) {
    const edge = (x0 + 4 * (tier + 1)) * 16;
    return go('R', p.x > edge - 20);
  }
  if (tier === want && p.x < (x0 + 4 * tier) * 16 + 30) return go('R');
  return go('');
};
const act03 = (x: number): Step[] => [
  { policy: passDown('imp3b', x + 4), until: (w) => topiaryOf(w, 'imp3b').done && w.player.onGround && w.player.y < 150, max: 3000, note: 'wait low, pass him level, finish two tiers above' },
  { hold: 'R', until: and(ground, X(x + 35)), max: 900 },
];

// ------------------------------------------------------------------ IMP-04
const leavesOf = (w: World, key: string) => w.flags[key] as LeafState[];
/** px a policy jump (held 14 ticks while rising, running) carries Dad on the flat */
const LEAP = +(process.env.IMP_LEAP ?? 58);
const HOLD = +(process.env.IMP_HOLD ?? 14);
let holdFor = HOLD;
/** across a row of leaves: land inside the dew on its side of each leaf; a both-rim leaf is jumped over */
const leafWalk = (key: string, bankX: number) => (w: World): Out => {
  const p = w.player;
  const ls = leavesOf(w, key);
  const cx = p.x + p.w / 2;
  if (!p.onGround) return go('R', p.vy < 0 && p.airTicks < holdFor);
  holdFor = HOLD;
  const cur = ls.find((l) => Math.abs(cx - l.cx) < 52);
  const next = ls.find((l) => l.cx - cx > 20);
  // on a leaf whose dew has not gone yet: get inside the beads on their half while the leaf settles, and stand there
  if (cur && cur.t0 >= 0 && cur.side !== 0 && cur.beads.some((b) => !b.gone)) {
    const spot = cur.cx + cur.side * 9;
    if (Math.abs(cx - spot) > 3) return go(cx < spot ? 'R' : 'L');
    return go('');
  }
  if (!next) return go('R', cx > bankX - 60 && cur !== undefined && cx > cur.cx + 20);
  if (next.side === 0) {
    // a both-rim leaf: jump it from this leaf's far rim to the centre of the one beyond
    const beyond = ls.find((l) => l.cx > next.cx);
    if (!beyond || !cur) return go('R');
    if (cx >= cur.cx + 40) {
      holdFor = 24; // a longer leap: over the narrow leaf and its two gaps
      return go('R', true);
    }
    return go('R');
  }
  // land inside the dew, on its side of the centre: take off a leap's length before that spot
  const target = next.cx + next.side * 9;
  return go('R', cx >= target - LEAP);
};
const room04 = (): Step[] => [{ policy: leafWalk('imp4', 26 * 16), until: and(ground, X(28)), max: 3000, note: 'leaf to leaf on the dew’s side' }, { hold: 'R', until: X(31.5), max: 400 }];
const act04 = (x: number): Step[] => [{ policy: leafWalk('imp4b', (x + 31) * 16), until: and(ground, X(x + 33)), max: 4000, note: 'the dew’s side each time; over the both-rim leaf' }, { hold: 'R', until: X(x + 39.5), max: 400 }];

// ------------------------------------------------------------------ IMP-05
const dockOf = (w: World, key: string) => w.flags[key] as DockState;
/** stand at the seam that closes next (the nearest arriving mat), then cross when all have clicked */
const seamWalk = (key: string, n: number, exitX: number, hop = false) => (w: World): Out => {
  const s = dockOf(w, key);
  const p = w.player;
  const cx = p.x + p.w / 2;
  if (!s || s.t0 < 0) return go('R');
  if (!p.onGround) return go('R', rising(w));
  if (s.clicks >= n) return go('R', cx > s.body[1] - 14 && cx < exitX);
  // not on the anchored body yet: riding a newcomer, stand and be carried (or hop across to the anchored mat when
  // told to and it is in reach); on the pier, walk on
  const onBody = cx >= s.body[0] && cx <= s.body[1];
  if (!onBody && cx < s.body[0]) {
    const riding = s.mats.some((m) => m.s.v !== 0 && w.standing(m.solid!));
    if (riding) {
      const gap = s.body[0] - (p.x + p.w);
      return hop && gap < 40 ? go('R', true) : go('');
    }
    return go('R');
  }
  // the next arrival: the moving mat whose edge is nearest the body
  const moving = s.mats.filter((m) => m.s.v !== 0);
  const eta = (m: any) => (m.s.v > 0 ? (s.body[0] - (m.x + m.w)) / m.s.v : (m.x - s.body[1]) / -m.s.v);
  const next = moving.sort((a, b) => eta(a) - eta(b))[0];
  if (!next) return go('R');
  const seam = next.s.v > 0 ? s.body[0] + 12 : s.body[1] - 12;
  if (Math.abs(cx - seam) < 4) return go('');
  return go(cx < seam ? 'R' : 'L');
};
const room05 = (): Step[] => [
  { hold: 'R', until: X(3.6), max: 400 },
  { hold: 'R', jump: 12, ticks: 12, note: 'hop on to the anchored mat' },
  { policy: seamWalk('imp5', 2, 19.5 * 16), until: and(ground, X(20.5)), max: 3000, note: 'back seam for the small mat, front seam for the big one, then across' },
  { hold: 'R', until: X(31.5), max: 600 },
];
const act05 = (x: number): Step[] => [
  { hold: 'R', until: X(x + 1.6), max: 600 },
  { hold: 'R', jump: 10, ticks: 10, note: 'on to the fast mat from behind' },
  { policy: seamWalk('imp5b', 3, (x + 27) * 16), until: and(ground, X(x + 28.5)), max: 4000, note: 'three clicks: behind, ahead, behind' },
  { hold: 'R', until: X(x + 43.5), max: 600 },
];
const act05b = (x: number): Step[] => [
  { hold: 'R', until: X(x + 1.6), max: 600 },
  { hold: 'R', jump: 10, ticks: 10, note: 'on to the slow mat from behind' },
  { policy: seamWalk('imp5c', 3, (x + 25) * 16, true), until: and(ground, X(x + 26.5)), max: 4500, note: 'hop from the slow mat on to the anchored one; two from the front, one from behind' },
  { hold: 'R', until: X(x + 45.5), max: 600 },
];

// ------------------------------------------------------------------ IMP-06
/** hop from reed patch to reed patch; `jumps` lists [take-off x, hold ticks] */
const hops = (jumps: [number, number][]): Step[] => jumps.flatMap(([at, t]) => hop(at, 'reed patch', t));
const room06 = (): Step[] => [
  ...hops([
    [4.8, 12],
    [9.3, 12],
    [13.5, 14],
  ]),
  { hold: 'R', until: X(17.4), max: 400, note: 'along the hummock' },
  { hold: 'R', jump: 26, ticks: 26, long: true, note: 'down on to the patch beyond the leap' },
  { hold: 'R', until: ground, max: 300 },
  ...hops([[23.6, 12]]),
  { hold: 'R', until: and(ground, X(28.5)), max: 600 },
  { hold: 'R', until: X(31.5), max: 400 },
];
const act06 = (x: number): Step[] => [
  ...hops([
    [x + 1.6, 12],
    [x + 6.5, 12],
    [x + 11.5, 30],
  ]),
  { hold: 'R', until: and(ground, X(x + 20.5)), max: 600 },
  { hold: 'R', until: X(x + 22.4), max: 300 },
  { hold: 'R', jump: 14, ticks: 14, note: 'up on to the hummock' },
  { hold: 'R', until: and(ground, X(x + 24)), max: 300 },
  { hold: 'R', until: X(x + 26.4), max: 300 },
  { hold: 'R', jump: 12, ticks: 12, note: 'down to the reeds' },
  { hold: 'R', until: and(ground, X(x + 29)), max: 300 },
  ...hops([[x + 30.6, 12]]),
  { hold: 'R', until: and(ground, X(x + 33.5)), max: 600 },
  { hold: 'R', until: X(x + 39.5), max: 400 },
];
const act06b = (x: number): Step[] => [
  ...hops([
    [x + 1.7, 30],
    [x + 7.7, 30],
  ]),
  { hold: 'R', until: X(x + 13.4), max: 400 },
  { hold: 'R', jump: 14, ticks: 14, note: 'up to the first hummock' },
  { hold: 'R', until: and(ground, X(x + 15.5)), max: 300 },
  { hold: 'R', until: X(x + 17.4), max: 300 },
  { hold: 'R', jump: 14, ticks: 14, note: 'to the second hummock' },
  { hold: 'R', until: and(ground, X(x + 21.5)), max: 300 },
  { hold: 'R', until: X(x + 23.4), max: 300 },
  { hold: 'R', jump: 16, ticks: 16, note: 'down to the reeds at the hill’s foot' },
  { hold: 'R', until: and(ground, X(x + 27)), max: 300 },
  ...hops([[x + 28.6, 12]]),
  { hold: 'R', until: and(ground, X(x + 32.5)), max: 600 },
  { hold: 'R', until: X(x + 37.5), max: 400 },
];

// ------------------------------------------------------------------ IMP-07
const rideOf = (w: World, key: string) => w.flags[key] as RideState;
/** walk on to the mat, go to its front half and stand; when it has regrounded, hop off to the bank */
const rideFront = (key: string) => (w: World): Out => {
  const s = rideOf(w, key);
  const p = w.player;
  const cx = p.x + p.w / 2;
  const m = s.mat;
  const frontX = m.x + m.w - 14;
  if (!p.onGround) return go('R', rising(w));
  if (s.phase === 'reground') return go('R', cx > m.x + m.w - 20);
  if (cx < frontX - 3) return go('R');
  if (cx > frontX + 3) return go('L');
  return go('');
};
const room07 = (): Step[] => [
  { hold: 'R', until: X(3.4), max: 400 },
  { hold: 'R', jump: 10, ticks: 10, note: 'on to the grounded mat' },
  { policy: rideFront('imp7'), until: and(ground, X(27.5)), max: 3000, note: 'ride at the front, under the branch, off at the hill' },
  { hold: 'R', until: X(31.5), max: 400 },
];
const act07a = (x: number): Step[] => [
  { hold: 'R', until: X(x + 1.4), max: 400 },
  { hold: 'R', jump: 10, ticks: 10 },
  { policy: rideFront(`imp07-chingjao:ride`), until: and(ground, X(x + 37.5)), max: 4000, note: 'front; at the shoal the back goes under; hop the gap' },
  { hold: 'R', until: X(x + 43.5), max: 400 },
];
const act07b = (x: number): Step[] => [
  { hold: 'R', until: X(x + 1.4), max: 400 },
  { hold: 'R', jump: 10, ticks: 10 },
  { policy: rideFront(`imp07-pabot:ride1`), until: and(ground, X(x + 19.5)), max: 3000, note: 'first ride' },
  { hold: 'R', until: X(x + 22.4), max: 400 },
  { hold: 'R', jump: 10, ticks: 10 },
  { policy: rideFront(`imp07-pabot:ride2`), until: and(ground, X(x + 43.5)), max: 3000, note: 'second ride, branch at once' },
  { hold: 'R', until: X(x + 49.5), max: 400 },
];

// ------------------------------------------------------------------ IMP-08
/** step on the stalls in rising price order: `path` is the list of stall indices to stand on */
const stallWalk = (c0: number, path: number[], exitX: number): Step[] => {
  // stall k spans [c0px + 48k, +40]; the 8 px gaps are walked; a skipped stall is jumped from the last 8 px before it
  const steps: Step[] = [{ hold: 'R', until: X(c0 - 1.4), max: 900 }, { hold: 'R', jump: 10, ticks: 10, note: 'up on to the first stall' }, { hold: 'R', until: ground, max: 300 }];
  for (let k = 1; k < path.length; k++) {
    const from = path[k - 1];
    if (path[k] - from > 1) steps.push({ hold: 'R', until: X((c0 * 16 + 48 * from + 28) / 16), max: 900 }, { hold: 'R', jump: 32, ticks: 32, long: true, note: 'over the dearer stall' }, { hold: 'R', until: ground, max: 300 });
  }
  steps.push({ hold: 'R', until: X(exitX), max: 900 });
  return steps;
};
const room08 = (): Step[] => [...stallWalk(5, [0, 1, 3, 4, 6], 31.5)];
const act08 = (x: number): Step[] => [...stallWalk(x + 3, [0, 2, 3, 4, 5], x + 35.5)];
// stall i (2 tiles) starts at c0 + 3i; the first hop from the bank: c0 - 1.3 is the bank's edge

// ------------------------------------------------------------------ IMP-09
const ponyOf = (w: World) => w.flags.imp9 as PonyState;
/** gallop; rest (stand) right after a ball passes when the bar is low and the ground is firm */
const gallop = (minBreath: number) => (w: World): Out => {
  const s = ponyOf(w);
  const p = w.player;
  const cx = p.x + p.w / 2;
  if (!s.on) return go('R');
  const onSoft = s.soft.some(([a, b]) => cx >= a * 16 - 8 && cx < b * 16 + 8);
  // the nearest ball behind: a rest is safe while it is still far (it rolls at 118 px/s)
  const behind = s.balls.filter((b) => b.alive && b.x < cx).map((b) => cx - b.x);
  const dist = behind.length ? Math.min(...behind) : 9999;
  if (s.winded >= 0) return go('');
  // the next soft stretch ahead: what it costs at a gallop (4 breath a second), plus a margin
  const ahead = s.soft.find(([a]) => a * 16 - cx > -8 && a * 16 - cx < 120);
  const need = Math.max(minBreath, ahead ? ((ahead[1] - ahead[0]) * 16 / 140) * 4 + 3 : 0);
  const standing = Math.abs(p.vx) < 5;
  // the ball is faster than the pony and passes a galloper: rest while the nearest ball behind is still far
  // (over a second away), and be galloping again before it arrives
  void standing;
  // top up whenever the ball allows it (it allows it rarely), so the soft stretches are met with a full bar
  if (s.breath < Math.max(need, 8.5) && !onSoft && dist > 200) return go('');
  return go('R');
};
const room09 = (): Step[] => [{ policy: gallop(4), until: X(31.5), max: 3000, note: 'gallop; rest after a ball if low' }];
const act09 = (min: number) => (x: number): Step[] => [{ policy: gallop(min), until: X(x + 39.5), max: 4000, note: 'the chukker' }];

// ------------------------------------------------------------------ IMP-10
const room10 = (): Step[] => [
  { hold: 'R', until: X(7.4), max: 600, note: 'along the bare mat' },
  { hold: 'R', jump: 12, ticks: 12, note: 'over the reeds' },
  { hold: 'R', until: ground, max: 300 },
  { hold: 'R', until: X(13.3), max: 400 },
  { hold: 'R', jump: 16, ticks: 16, note: 'over the long reeds' },
  { hold: 'R', until: ground, max: 300 },
  { hold: 'R', until: X(20.4), max: 400 },
  { hold: 'R', jump: 12, ticks: 12, note: 'over the last reeds' },
  { hold: 'R', until: and(ground, X(24)), max: 300 },
  { hold: 'R', until: X(31.5), max: 600 },
];
const act10a = (x: number): Step[] => {
  const s: Step[] = [{ hold: 'R', until: X(x + 2.3), max: 400 }, { hold: 'R', jump: 14, ticks: 14, note: 'to the first leaf’s centre' }, { hold: 'R', until: ground, max: 300 }];
  for (let i = 0; i < 3; i++) s.push({ hold: 'R', until: X(x + 4 + i * 6 + 3.0), max: 400 }, { hold: 'R', jump: 15, ticks: 15, note: 'centre to centre' }, { hold: 'R', until: ground, max: 300 });
  s.push({ hold: 'R', until: X(x + 4 + 3 * 6 + 3.2), max: 400 }, { hold: 'R', jump: 14, ticks: 14, note: 'to the bank' }, { hold: 'R', until: and(ground, X(x + 29.5)), max: 400 }, { hold: 'R', until: X(x + 35.5), max: 400 });
  return s;
};
const act10b = (x: number): Step[] => [
  { hold: 'R', until: X(x + 3.4), max: 400 },
  { hold: 'R', jump: 10, ticks: 10, note: 'on to the anchored mat' },
  { hold: 'R', until: ground, max: 300 },
  { hold: 'R', until: X(x + 5.4), max: 300, note: 'the far end (the back) of the mat' },
  { hold: '', until: (w) => (w.flags['imp10-dock:dock'] as { click: number }).click >= 0 && (w.tick - (w.flags['imp10-dock:dock'] as { click: number }).click) / 120 > 0.5, max: 2000, note: 'wait at the far end for the click' },
  { hold: 'R', until: X(x + 15.6), max: 900, note: 'across both mats' },
  { hold: 'R', jump: 12, ticks: 12, note: 'to the far shore' },
  { hold: 'R', until: and(ground, X(x + 19.5)), max: 400 },
  { hold: 'R', until: X(x + 39.5), max: 400 },
];

// ------------------------------------------------------------------ tables
function solutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  S['IMP-01'] = tourRoute();
  const rooms: Record<string, () => Step[]> = { 'IMP-02': room02, 'IMP-03': room03, 'IMP-04': room04, 'IMP-05': room05, 'IMP-06': room06, 'IMP-07': room07, 'IMP-08': room08, 'IMP-09': room09, 'IMP-10': room10 };
  for (const [id, r] of Object.entries(rooms)) {
    S[id] = r();
    lengthen(id, 0, []);
  }
}

const ROOMS: Record<string, () => Step[]> = { 'IMP-02': room02, 'IMP-03': room03, 'IMP-04': room04, 'IMP-05': room05, 'IMP-06': room06, 'IMP-07': room07, 'IMP-08': room08, 'IMP-09': room09, 'IMP-10': room10 };
const ACT_ORDER: Record<string, string[]> = {
  'IMP-02': ['imp02-khong'],
  'IMP-03': ['imp03-makha'],
  'IMP-04': ['imp04-ani'],
  'IMP-05': ['imp05-ahum', 'imp05-yaam'],
  'IMP-06': ['imp06-lamjao', 'imp06-pabot'],
  'IMP-07': ['imp07-chingjao', 'imp07-pabot'],
  'IMP-08': ['imp08-ani'],
  'IMP-09': ['imp09-ani', 'imp09-ahum', 'imp09-mari'],
  'IMP-10': ['imp10-thambal', 'imp10-dock'],
};
const actRoutes: Record<string, (x: number) => Step[]> = {
  'imp02-khong': act02,
  'imp03-makha': act03,
  'imp04-ani': act04,
  'imp05-ahum': act05,
  'imp05-yaam': act05b,
  'imp06-lamjao': act06,
  'imp06-pabot': act06b,
  'imp07-chingjao': act07a,
  'imp07-pabot': act07b,
  'imp08-ani': act08,
  'imp09-ani': act09(4),
  'imp09-ahum': act09(5),
  'imp09-mari': act09(9),
  'imp10-thambal': act10a,
  'imp10-dock': act10b,
};
/** the act's content starts LEAD tiles after its first column (levels.ts `led`): every route above is written against
 * the content, so the public act routes take the act's first column and add LEAD */
const actX0 = (id: string, act: string) => LEVEL_BY_ID.get(id)!.parts!.find((p) => p.kind === act)!.x0;
for (const k of Object.keys(actRoutes)) {
  const r = actRoutes[k];
  actRoutes[k] = (x: number) => r(x + LEAD);
}
const prefix = (id: string, act: string): Step[] => [...ROOMS[id](), ...ACT_ORDER[id].slice(0, ACT_ORDER[id].indexOf(act)).flatMap((a) => actRoutes[a](actX0(id, a)))];
/** the stage up to the act (route), then `steps` played from the act's content start; built when the test runs */
const inAct = (id: string, act: string, what: string, steps: (x: number) => Step[], cause?: string) => ({
  what,
  get steps(): Step[] {
    return [...prefix(id, act), ...steps(actX0(id, act) + LEAD)];
  },
  cause,
});

const naive: Record<string, { steps: Step[]; cause?: string }> = {
  'IMP-01': { steps: [...upToGate, { hold: 'R', until: done, max: 2400, note: 'walk into the arch' }], cause: 'imp-thong' },
  'IMP-02': { steps: runOn, cause: 'imp-in' },
  'IMP-03': { steps: [...[0, 1, 2, 3].flatMap((k) => hop(6 + 4 * k - 1.2, 'tier', 16)), ...runOn], cause: 'imp-shear' },
  'IMP-04': { steps: runOn, cause: 'imp-dew' },
  'IMP-05': { steps: [{ hold: 'R', until: X(3.6), max: 400 }, { hold: 'R', jump: 12, ticks: 12 }, ...runOn], cause: 'imp-ishing' },
  'IMP-06': { steps: runOn, cause: 'imp-phum' },
  'IMP-07': { steps: [{ hold: 'R', until: X(3.4), max: 400 }, { hold: 'R', jump: 10, ticks: 10 }, ...runOn], cause: 'imp-ishing' },
  'IMP-08': { steps: [...stallWalk(5, [0, 1, 2], 40), ...runOn], cause: 'imp-shutter' },
  'IMP-09': { steps: runOn, cause: 'imp-kangjei-wa' },
  'IMP-10': { steps: [...room06().slice(0, 3), ...runOn], cause: 'imp-phum-lei' },
};
const fix: Record<string, { steps: Step[]; cause?: string }> = {
  'IMP-01': { steps: [...tourRoute().slice(0, upToGate.length + 3), { hold: 'R', until: X(64.3), max: 600 }, { hold: 'R', until: done, max: 1500, note: 'step down on to the green bank' }], cause: 'imp-khong' },
  'IMP-02': { steps: [{ hold: 'R', until: X(9), max: 400 }, { hold: '', until: done, max: 1500, note: 'stop, and stay stopped' }], cause: 'imp-in-leppa' },
  'IMP-03': { steps: [...hop(4.8, 'tier 0', 16), { hold: '', until: done, max: 1500, note: 'wait below him' }], cause: 'imp-shear-makha' },
  'IMP-04': { steps: [{ hold: 'R', until: X(6.2), max: 300 }, { hold: 'R', jump: 30, ticks: 30, long: true, note: 'to the far rim, beyond the dew' }, { hold: 'R', until: ground, max: 300 }, { hold: '', until: done, max: 1500 }], cause: 'imp-dew-rim' },
  'IMP-05': { steps: [{ hold: 'R', until: X(3.6), max: 400 }, { hold: 'R', jump: 12, ticks: 12 }, { hold: 'R', until: X(11.6), max: 600, note: 'to the front edge' }, { hold: '', until: done, max: 1500, note: 'wait for the big mat' }], cause: 'imp-lurch' },
  'IMP-06': { steps: [...hops([[4.8, 12], [9.3, 12]]), { hold: 'R', until: X(14.3), max: 400 }, { hold: 'R', jump: 30, ticks: 30, long: true, note: 'follow the deer’s leap, straight on as Tara says' }, { hold: 'R', until: done, max: 900 }], cause: 'imp-chong' },
  'IMP-07': { steps: [{ hold: 'R', until: X(3.4), max: 400 }, { hold: 'R', jump: 10, ticks: 10 }, { hold: 'R', until: and(ground, X(6.8)), max: 400 }, { hold: '', until: done, max: 2400, note: 'stand where you are for the ride' }], cause: 'imp-branch' },
  'IMP-08': { steps: [...stallWalk(5, [0, 1, 3, 4, 5], 40), ...runOn], cause: 'imp-shutter' },
  'IMP-09': { steps: [{ policy: (w) => (ponyOf(w).breath < 5 ? go('') : go('R')), until: done, max: 6000, note: 'rest whenever the bar is low, wherever you are' }], cause: 'imp-kangjei' },
  'IMP-10': { steps: [...room10().slice(0, 1), { hold: 'R', until: X(8.4), max: 300 }, { hold: 'R', jump: 10, ticks: 10, note: 'on to the reeds, as the deer taught' }, { hold: 'R', until: done, max: 900 }], cause: 'imp-phum-lei' },
};
const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {
  'IMP-02': [inAct('IMP-02', 'imp02-khong', 'jump the first gap holding forward (he reads the leap)', (x) => [{ hold: 'R', until: X(x + 8.2), max: 600 }, { hold: 'R', jump: 16, ticks: 16 }, { hold: 'R', until: done, max: 900 }], 'imp-in-chongba')],
  'IMP-04': [
    inAct(
      'IMP-04',
      'imp04-ani',
      'run on from the first leaf without waiting for the dew to go',
      (x) => [{ policy: leafWalk('imp4b', (x + 31) * 16), until: (w) => leavesOf(w, 'imp4b')[0].t0 >= 0 && w.player.onGround, max: 2000, note: 'land on the first leaf' }, { hold: 'R', until: done, max: 900 }],
      'imp-dew',
    ),
  ],
  'IMP-05': [
    inAct(
      'IMP-05',
      'imp05-ahum',
      'after the first click stay at the back end (away from the mat coming from the front)',
      (x) => [
        { hold: 'R', until: X(x + 1.6), max: 600 },
        { hold: 'R', jump: 10, ticks: 10, note: 'on to the fast mat' },
        { hold: 'R', until: ground, max: 300 },
        { hold: '', until: (w) => dockOf(w, 'imp5b').clicks >= 1, max: 900, note: 'carried to the anchored mat' },
        { policy: (w) => go(w.player.x + 5 > dockOf(w, 'imp5b').body[0] + 10 ? 'L' : ''), until: done, max: 2000, note: 'stand at the back end' },
      ],
      'imp-lurch',
    ),
  ],
  'IMP-07': [inAct('IMP-07', 'imp07-chingjao', 'ride at the back half', (x) => [{ hold: 'R', until: X(x + 1.4), max: 400 }, { hold: 'R', jump: 10, ticks: 10 }, { hold: 'R', until: and(ground, X(x + 4.8)), max: 400 }, { hold: '', until: done, max: 3000 }], 'imp-branch')],
  'IMP-08': [inAct('IMP-08', 'imp08-ani', 'step on ₹4 before ani (2)', (x) => [...stallWalk(x + 3, [0, 1, 2], x + 40), ...runOn], 'imp-shutter')],
  'IMP-09': [inAct('IMP-09', 'imp09-mari', 'start the last chukker without filling up', () => [{ hold: 'R', until: done, max: 4000 }], 'imp-kangjei-wa')],
  'IMP-10': [inAct('IMP-10', 'imp10-dock', 'stand at the seam for the click, as the dock taught', (x) => [{ hold: 'R', until: X(x + 3.4), max: 400 }, { hold: 'R', jump: 10, ticks: 10 }, { hold: 'R', until: X(x + 9.6), max: 600 }, { hold: '', until: done, max: 2000 }], 'imp-lurch-lei')],
};
const endingPolicies: Record<string, Policy> = {};

export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  fair: ['IMP-02', 'IMP-03', 'IMP-04', 'IMP-05', 'IMP-06', 'IMP-07', 'IMP-08', 'IMP-09', 'IMP-10'],
};
