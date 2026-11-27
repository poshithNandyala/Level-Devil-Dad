// Proven routes for Itanagar: every stage's room, its acts and its door, plus the plays that must die.
// Found by tests/city-tests.ts; merged into SOLUTIONS, NAIVE, FIX, MISTAKES, ACT_ROUTES and ENDING_POLICIES.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import { Step, X, XL, and, ground, done } from '../runner';
import type { CityTests } from '../city-tests';
import { LEVEL_BY_ID } from '../../src/game/levels';

type Move = 'L' | 'R' | '';
type Out = { move: Move; jump: boolean };
interface Mem {
  hold: number;
  [k: string]: any;
}
type Policy = (w: World, m: Mem, d: Door) => Out;
const px = (t: number) => t * 16;
const FL = 240;
const go = (move: Move): Out => ({ move, jump: false });
/** on the road (not up on a deck), standing, at or past column x */
const road = (x: number) => and(ground, X(x), (w: World) => w.player.y >= 224);
const hop = (at: number, note: string, ticks = 12): Step[] => [
  { hold: 'R', until: X(at), max: 900 },
  { hold: 'R', jump: ticks, ticks, note },
  { hold: 'R', until: ground, max: 300 },
];

// ------------------------------------------------------------------ ITA-01
/** the shared course up to the fort */
const courseRoute = (): Step[] => [
  ...hop(10.4, 'a shallow drain'),
  ...hop(20.7, 'a step up'),
  ...hop(22.7, 'a step up'),
  ...hop(36.6, 'a post'),
  ...hop(39.6, 'a post'),
  ...hop(42.6, 'a post'),
  { hold: 'R', until: X(49.8), max: 900 },
  { hold: 'R', jump: 14, ticks: 14, note: 'hop the parked Sumo' },
  { hold: 'R', until: (w) => w.player.onGround && w.player.y > 220, max: 400 },
];
const tourRoute = (): Step[] => [
  ...courseRoute(),
  { hold: 'R', until: X(63.0), max: 600, note: 'the first wall: the loose brick is the second' },
  { hold: 'R', jump: 16, ticks: 16, note: 'long, over the loose brick, on to the third' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', until: road(69), max: 400, note: 'off the wall' },
  { hold: 'R', until: X(75.8), max: 600, note: 'the second wall: the loose brick is in the arch over the third brick' },
  { hold: 'R', jump: 9, ticks: 9, note: 'a short hop on to the first brick' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', jump: 16, ticks: 16, note: 'long, over the arch brick’s column, to the far end' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', until: road(83), max: 400 },
  ...hop(89.4, 'the low wall'),
  { hold: 'R', until: X(92.4), max: 300 },
  { hold: 'R', jump: 12, ticks: 12, note: 'up on the deck' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', until: road(100.5), max: 600, note: 'off the deck' },
  { hold: 'R', until: done, max: 900 },
];

// ------------------------------------------------------------------ ITA-02
type DeckSt = { t0: number; c0: number; c1: number; porters: { x: number; on: boolean; s: { t?: number } }[]; spec: { at: number; v: number; bundle?: boolean }[] };
const sinceT = (w: World, t0: number) => (w.tick - t0) / 120;
/** run right and jump over the gaps in the deck (the obvious read of a hole in a bridge) */
const hopGaps = (cols: number[]): Step[] => cols.flatMap((c) => hop(c - 1.6, 'hop the hole in the deck', 12));
/** run on and drop into the bay at `bay`, wait there until every porter has gone by, climb out and run on to column `to` */
const bayWait = (key: string, bay: number, to: number, shallow: number[], after: number[] = []): Step[] => [
  ...hopGaps(shallow),
  { hold: 'R', until: (w) => w.player.x >= px(bay) && w.player.y > FL - 8, max: 900, note: 'into the deep bay' },
  {
    hold: '',
    until: (w) => {
      const st = w.flags[key] as DeckSt;
      if (st.t0 < 0) return false;
      const last = st.spec.length - 1;
      return sinceT(w, st.t0) > st.spec[last].at + 0.2 && st.porters[last].x < px(bay) - 34;
    },
    max: 3000,
    note: 'every porter has gone by overhead',
  },
  { hold: 'R', jump: 16, ticks: 16, note: 'climb out' },
  { hold: 'R', until: and(ground, (w) => w.player.y <= FL - 13), max: 300 },
  ...hopGaps(after),
  { hold: 'R', until: X(to), max: 900 },
];
const room02 = (): Step[] => bayWait('ita2', 18, 29, [12]);
const act02 = (x: number): Step[] => bayWait('ita2a', x + 22, x + 41.4, [x + 9, x + 16], [x + 29]);
/** the gate: into the bay, let the porter by, then straight after him through the gate he holds open */
const gatePolicy: Policy = (w, m) => {
  const st = w.flags.ita2e as DeckSt;
  const g = w.flags.ita2g as { down: number };
  const p = w.player;
  const bayX = px(st.c0 + 6);
  if (m.hold > 0) return { move: 'R', jump: true };
  const inBay = p.y > FL - 8;
  const porter = st.porters[0];
  if (!inBay && p.x < bayX - 4) {
    // only go on to the span if the porter is far enough off to reach the bay first
    return go('R');
  }
  if (inBay) {
    if (porter.on && porter.x < bayX - 30) {
      m.hold = 16;
      return { move: 'R', jump: true };
    }
    return go('');
  }
  // out of the bay: run for the gate while it is up
  if (g.down < 0.5 || p.x > px(st.c1 + 2)) return go('R');
  return go(p.x < px(st.c1 - 3) ? 'R' : '');
};

// ------------------------------------------------------------------ ITA-03
type HerdSt = { t0: number; spec: { c: number; dip: number; graze: number; up: number; young?: boolean }[]; rigs: { x: number; w: number; solid: any; s: { ph?: string; left?: number } }[] };
/** across the herd: step on to a back only while it grazes with time to spare; wait on the bank or the back before */
function herdWalk(key: string, need = 0.9): (w: World) => Out {
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
    const st = w.flags[key] as HerdSt;
    const p = w.player;
    if (!p.onGround) return go('R');
    const next = st.rigs.find((r) => r.x > p.x + p.w - 4);
    if (!next) return go('R');
    const ready = st.t0 >= 0 && next.s.ph === 'down' && (next.s.left ?? 0) >= need;
    const edge = p.x + p.w >= next.x - 34;
    if (!edge) return go('R');
    if (!ready) return go('');
    if (p.onGround) {
      jt = 12;
      return { move: 'R', jump: true };
    }
    return go('R');
  };
}
const room03 = (): Step[] => [{ policy: herdWalk('ita3'), until: and(ground, X(23.5)), max: 3000, note: 'across the backs on the lead’s dip; wait behind the young one' }, { hold: 'R', until: X(29), max: 400 }];
const act03 = (x: number): Step[] => [{ policy: herdWalk('ita3a'), until: and(ground, X(x + 29.5)), max: 4000, note: 'the big herd: wait behind each young one' }, { hold: 'R', until: X(x + 35.4), max: 400 }];
/** the pen gate: wait before the lead until it has just dipped, hop over its back and through while the bar is up */
const penPolicy: Policy = (w, m) => {
  const st = w.flags.ita3e as HerdSt;
  const r = st.rigs[0];
  const p = w.player;
  if (m.hold > 0) return { move: 'R', jump: true };
  if (p.x > r.x + r.w + 4) return go('R');
  if (p.x + p.w < r.x - 18) return go('R');
  const ok = r.s.ph === 'down' && (r.s.left ?? 0) > 1.6;
  if (!ok) return go('');
  if (p.onGround && p.x + p.w >= r.x - 18 && p.x < r.x) {
    m.hold = 13;
    return { move: 'R', jump: true };
  }
  return go('R');
};

// ------------------------------------------------------------------ ITA-04
type GroveSt = { trees: { shakes: number; notches: number; dropped: boolean }[]; baskets: { c: number; cap: number; n: number }[]; oranges: { alive: boolean; on: boolean }[]; gy: number };
/** shake the tree n times from column `at` (its uphill side): a tap jump under the branch, a breath between */
const shake = (at: number, n: number): Step[] => [
  { hold: 'R', until: X(at), max: 900, note: 'to the uphill side of the trunk' },
  ...Array.from({ length: n }, (): Step[] => [{ hold: '', jump: 10, ticks: 10, note: 'jump under the branch' }, { hold: '', ticks: 80 }]).flat(),
];
const full = (key: string) => (w: World) => {
  const st = w.flags[key] as GroveSt;
  return st.baskets.every((b) => b.n >= b.cap) && st.oranges.every((o) => !o.alive);
};
/** up the stair of baskets: hop when the next basket's top is above your feet */
function stairClimb(key: string, extra: { x: number; top: number }[] = []): (w: World) => Out {
  let W: World | null = null;
  let jt = 0;
  let cool = 0;
  return (w) => {
    if (W !== w) {
      W = w;
      jt = 0;
      cool = 0;
    }
    if (jt > 0) {
      jt--;
      return { move: 'R', jump: true };
    }
    const st = w.flags[key] as GroveSt;
    const p = w.player;
    const steps = [...st.baskets.map((b) => ({ x: px(b.c), top: st.gy - b.n * 16 })), ...extra];
    const nx = steps.find((b) => b.x > p.x + p.w - 6);
    if (nx && p.onGround && w.tick > cool && p.x + p.w >= nx.x - 18 && p.x < nx.x && p.y + p.h > nx.top + 2) {
      jt = 12;
      cool = w.tick + 30;
      return { move: 'R', jump: true };
    }
    return go('R');
  };
}
const room04 = (): Step[] => [
  ...shake(5.2, 3),
  { hold: '', until: full('ita4'), max: 1200, note: 'the oranges have rolled into the baskets' },
  { policy: stairClimb('ita4'), until: and(ground, X(20)), max: 1500, note: 'up the basket stair on to the terrace' },
  { hold: 'R', until: X(29), max: 600 },
];
const act04 = (x: number): Step[] => [
  ...shake(x + 2.3, 2),
  ...shake(x + 9.3, 2),
  { hold: '', until: full('ita4a'), max: 1200, note: 'eight oranges in four baskets' },
  { policy: stairClimb('ita4a', [{ x: px(x + 25), top: 128 }]), until: and(ground, X(x + 26)), max: 1500, note: 'up the stair on to the upper terrace' },
  { hold: 'R', until: and(ground, X(x + 33), (w) => w.player.y > 160), max: 900, note: 'off its far end' },
  { hold: 'R', until: X(x + 39.4), max: 600 },
];
/** the packing shed: wait at the edge of the step until a crate has just landed, then cross behind the shadow */
const shedPolicy: Policy = (w) => {
  const st = w.flags.ita4e as { P: number; x0: number; x1: number; spotX: (k: number) => number };
  const p = w.player;
  const t = w.tick / 120;
  const k = Math.floor(t / st.P);
  const f = (t - k * st.P) / st.P;
  if (p.x > st.x1 + 20) return go('R');
  if (p.x + p.w < st.x0 - 26) return go('R');
  // the next landing spot and when: cross when the crate has just landed (start of a cycle) and the next spot is behind us or far enough ahead
  const nextSpot = st.spotX(k);
  const crossing = (st.x1 + 20 - p.x) / 140;
  const timeLeft = st.P * (1 - f) - 0.35;
  if (timeLeft > crossing + 0.15) return go('R');
  if (nextSpot + 14 < p.x) return go('R');
  return go('');
};

// ------------------------------------------------------------------ ITA-05
type CanopySt = { t0: number; figs: { c: number; at: number }[]; rigs: { x: number; w: number; s: { down?: boolean; falling?: boolean } }[] };
const FIGW = 56;
/** across the canopy: step on to a platform once it is down; while waiting, stand on the half away from the one that drops next */
function canopyWalk(key: string, o: { wrongRead?: boolean; noJumpWhen?: (w: World, st: CanopySt) => boolean } = {}): (w: World) => Out {
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
    const st = w.flags[key] as CanopySt;
    const p = w.player;
    if (st.t0 < 0) return go('R');
    if (!p.onGround) return go('R');
    const rigs = st.rigs.map((r, i) => ({ r, at: st.figs[i].at, i })).sort((a, b) => a.r.x - b.r.x);
    const ni = rigs.findIndex((q) => q.r.x > p.x + p.w - 6);
    if (ni < 0) return go('R');
    const next = rigs[ni];
    const ci = ni - 1;
    const cur = ci >= 0 ? rigs[ci] : null;
    const pending = rigs.filter((q) => !q.r.s.down);
    const soon = pending.length ? pending.reduce((a, b) => (o.wrongRead ? (b.at > a.at ? b : a) : b.at < a.at ? b : a)) : null;
    const soonIdx = soon ? rigs.indexOf(soon) : -1;
    const t = (w.tick - st.t0) / 120;
    const soonClose = soon && Math.abs(soonIdx - ni) <= 1 && (soon.r.s.falling || soon.at - t < 1.0);
    if (next.r.s.down && !soonClose) {
      const from = cur ? cur.r.x + FIGW : -1;
      const gap = next.r.x - (cur ? from : p.x + p.w);
      const needHop = cur ? gap > 12 : true;
      if (!needHop) return go('R');
      if (p.x + p.w >= next.r.x - (cur ? 36 : 46)) {
        if (o.noJumpWhen && o.noJumpWhen(w, st)) return go('');
        jt = cur ? 12 : 14;
        return { move: 'R', jump: true };
      }
      return go('R');
    }
    // wait: on the bank well short of the first platform's landing zone, or on the half of my platform away from the next drop
    if (!cur) return go(p.x + p.w >= rigs[0].r.x - 80 ? '' : 'R');
    let tx = cur.r.x + FIGW / 2 - p.w / 2;
    if (soonIdx === ci + 1) tx = cur.r.x + 6;
    else if (soonIdx === ci - 1) tx = cur.r.x + FIGW - p.w - 6;
    return go(p.x < tx - 3 ? 'R' : p.x > tx + 3 ? 'L' : '');
  };
}
/** the squirrel act: no hop from a second before the chirp's glide until it has gone through */
const squirrelOut = (_w: World, st: CanopySt) => {
  const t = ((_w.tick - st.t0) / 120 + 0.1) % 5;
  return t >= 1.5 && t <= 3.95;
};
const room05 = (): Step[] => [{ policy: canopyWalk('ita5'), until: and(ground, X(27.5)), max: 3000, note: 'across the canopy as it ripens' }, { hold: 'R', until: X(29), max: 400 }];
const act05 = (x: number): Step[] => [{ policy: canopyWalk('ita5a'), until: and(ground, X(x + 33.5)), max: 4000, note: 'dusk: the darkest is next' }, { hold: 'R', until: X(x + 37.4), max: 400 }];
const act05b = (x: number): Step[] => [{ policy: canopyWalk('ita5b', { noJumpWhen: squirrelOut }), until: and(ground, X(x + 30.5)), max: 4000, note: 'hop only when the squirrel is not coming' }, { hold: 'R', until: X(x + 35.4), max: 400 }];
/** the hollow: hop on to the round fig, run straight over its middle without stopping, hop off at the far end */
const hollowPolicy: Policy = (w, m) => {
  const st = w.flags.ita5e as { x0: number; x1: number };
  const p = w.player;
  if (m.hold > 0) return { move: 'R', jump: true };
  const edges = [st.x0, st.x1 + 16];
  const e = edges.find((x) => p.x + p.w < x);
  if (e !== undefined && p.onGround && p.x + p.w >= e - 30 && w.tick > (m.cool ?? 0)) {
    m.hold = 11;
    m.cool = w.tick + 40;
    return { move: 'R', jump: true };
  }
  return go('R');
};

// ------------------------------------------------------------------ ITA-06
type PaddySt = { tanks: { c: number; level: 'full' | 'low'; drainT: number; fillT: number }[]; levers: { c: number; k: number; to: number; pulledT: number }[] };
const settled = (key: string, k: number) => (w: World) => {
  const st = w.flags[key] as PaddySt;
  return st.tanks[k].level === 'low' && st.tanks.every((t) => t.fillT < 0);
};
/** pull the lever at column `lever` (a tap jump at its handle), wait for the tank to drain and every surge to finish, cross the tank and climb out on the bund at `out` */
const pullCross = (key: string, k: number, lever: number, out: number): Step[] => [
  { hold: 'R', until: X(lever), max: 900, note: 'to the lever' },
  { hold: 'L', until: XL(lever + 0.4), max: 300, note: 'under its handle' },
  { hold: '', ticks: 18 },
  { hold: '', jump: 20, ticks: 22, long: true, note: 'pull: a full jump at the handle' },
  { hold: '', until: settled(key, k), max: 900, note: 'drained, and the surge has gone where it was going' },
  { hold: 'R', until: (w) => w.player.x >= px(out) - 12, max: 600, note: 'through the low tank' },
  { hold: 'R', jump: 14, ticks: 14, note: 'up on to the bund' },
  { hold: 'R', until: and(ground, (w) => w.player.y <= FL - 13), max: 300 },
];
const room06 = (): Step[] => [...pullCross('ita6', 0, 5, 10), ...pullCross('ita6', 1, 11, 16), ...pullCross('ita6', 2, 17, 22), { hold: 'R', until: X(29), max: 600 }];
const act06 = (x: number): Step[] => [
  ...pullCross('ita6a', 0, x + 3, x + 8),
  ...pullCross('ita6a', 1, x + 7.6, x + 15),
  // the third tank is full from the first tank's water, and its lever is the far one on the second bund: go back for it
  { hold: 'L', until: (w) => w.player.x <= px(x + 11) + 2, max: 600, note: 'back down through the second tank' },
  { hold: 'L', jump: 14, ticks: 14, note: 'up on to the second bund' },
  { hold: 'L', until: and(ground, (w) => w.player.y <= FL - 13), max: 300 },
  { hold: 'L', until: (w) => w.player.x <= px(x + 10.2), max: 300, note: 'under the far lever' },
  { hold: '', ticks: 18 },
  { hold: '', jump: 20, ticks: 22, long: true, note: 'pull: the third tank drains back into the second' },
  { hold: 'R', until: (w) => w.player.x >= px(x + 15) - 12, max: 600, note: 'straight back across the second tank before the surge' },
  { hold: 'R', jump: 14, ticks: 14, note: 'up on to the third bund' },
  { hold: 'R', until: and(ground, (w) => w.player.y <= FL - 13), max: 300 },
  { hold: '', until: settled('ita6a', 2), max: 900, note: 'the third tank is low and the second has filled' },
  { hold: 'R', until: (w) => w.player.x >= px(x + 21) - 12, max: 600, note: 'through the third tank' },
  { hold: 'R', jump: 14, ticks: 14 },
  { hold: 'R', until: and(ground, (w) => w.player.y <= FL - 13), max: 300 },
  ...pullCross('ita6a', 3, x + 21, x + 27),
  ...pullCross('ita6a', 4, x + 27, x + 33),
  { hold: 'R', until: X(x + 35.4), max: 600 },
];
/** the river sluice: pull, cross the drained tank, wait on the bund for the pour to stop, go through before the gate falls */
const sluicePolicy: Policy = (w, m, d) => {
  const st = w.flags.ita6e as PaddySt;
  const g = w.flags.ita6g as { open: number; pourT: number };
  const p = w.player;
  const D = Math.round(d.x / 16);
  const tank = st.tanks[0];
  if (m.hold > 0) return { move: m.dir ?? 'R', jump: true };
  if (p.x > px(D - 3) + 8) return go('R');
  const inTank = p.y > FL - 8;
  if (inTank) {
    if (p.x >= px(D - 7) - 12) {
      m.hold = 14;
      m.dir = 'R';
      return { move: 'R', jump: true };
    }
    return go('R');
  }
  if (p.x < px(D - 12)) return go('R');
  if (p.x + p.w <= px(D - 11) + 6 && p.x < px(D - 9)) {
    // on the lever's bund (or hopping on it)
    if (tank.level === 'full' && g.pourT < 0 && w.tick > (m.cool ?? 0)) {
      m.hold = 20;
      m.dir = '';
      m.cool = w.tick + 150;
      return { move: '', jump: true };
    }
    if (tank.level === 'low' && tank.drainT < 0) return go('R');
    return go('');
  }
  // on the bund before the gate
  const t = g.pourT < 0 ? -1 : (w.tick - g.pourT) / 120;
  if (t >= 2.25 && t < 3.3) return go('R');
  return go(p.x + p.w >= px(D - 3) - 30 ? '' : 'R');
};

// ------------------------------------------------------------------ ITA-07
type TruckSt = { t0: number; x0: number; chocks: number[]; bay: number; coughs: number[]; rig: { x: number }; rolled: number; parked: boolean; atRest: boolean };
const PUSH7 = 46;
/** push in bursts: start a burst only from a rest spot when it will end before the next cough; never let go mid-burst */
function pushBursts(key: string): (w: World) => Out {
  return (w) => {
    const st = w.flags[key] as TruckSt;
    const p = w.player;
    if (!st || st.parked || st.t0 < 0) return go('R');
    const t = (w.tick - st.t0) / 120;
    const rig = st.rig;
    if (!st.atRest) return go('R');
    const target = st.chocks.map((c) => px(c)).find((cx) => rig.x < cx) ?? px(st.bay);
    const approach = Math.max(0, rig.x - (p.x + p.w)) / 140;
    const dur = approach + (target - rig.x) / PUSH7;
    const next = st.coughs.find((c) => c + 0.7 > t);
    const safe = next === undefined || (t < next && next - t > dur + 0.35);
    if (safe) return go('R');
    return go(p.x + p.w > rig.x - 12 ? 'L' : '');
  };
}
const room07 = (): Step[] => [{ policy: pushBursts('ita7'), until: (w) => (w.flags.ita7 as TruckSt).parked, max: 6000, note: 'push the truck to the lay-by, chock to chock, between coughs' }, { hold: 'R', until: X(29), max: 600 }];
const act07 = (x: number): Step[] => [{ policy: pushBursts('ita7a'), until: (w) => (w.flags.ita7a as TruckSt).parked, max: 9000, note: 'the climb: uneven bursts, watch the cab' }, { hold: 'R', until: X(x + 43.4), max: 600 }];
const act07b = (x: number): Step[] => [{ policy: pushBursts('ita7b'), until: (w) => (w.flags.ita7b as TruckSt).parked, max: 9000, note: 'the snow: listen for the engine' }, { hold: 'R', until: X(x + 43.4), max: 600 }];
/** the tailgate: wait clear of the exhaust, walk in right after a cough */
const tailgatePolicy: Policy = (w, _m, d) => {
  const e = w.flags.ita7e as { P: number };
  const p = w.player;
  const t = (w.tick / 120) % e.P;
  const need = Math.max(0, d.x + 8 - (p.x + p.w)) / 140;
  if (t + need + 0.1 < e.P - 0.6) return go('R');
  return go(p.x + p.w > d.x - 26 ? 'L' : '');
};
/** release when the cab shakes, wherever the truck is, and stand there */
function releaseAtTell(key: string): (w: World) => Out {
  return (w) => {
    const st = w.flags[key] as TruckSt;
    if (!st || st.t0 < 0) return go('R');
    const t = (w.tick - st.t0) / 120;
    const telling = st.coughs.some((c) => t >= c - 1.0 && t < c + 0.6);
    return go(telling ? '' : 'R');
  };
}

// ------------------------------------------------------------------ ITA-08
type RaftSt = { c0: number; poles: ('plain' | 'band' | 'frayed')[]; rigs: { x: number }[] };
/** hop from banded pole to banded pole (and to the far bank): jump as soon as you stand with the next band ahead */
function raftHop(keys: string[], bankX: number, frayedIsFine = false): (w: World) => Out {
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
    if (!p.onGround) return go('R');
    const bands: number[] = [];
    for (const k of keys) {
      const st = w.flags[k] as RaftSt;
      st.poles.forEach((kind, i) => {
        if (kind === 'band' || (frayedIsFine && kind === 'frayed')) bands.push(px(st.c0 + 2 * i));
      });
    }
    bands.push(bankX);
    const next = bands.filter((x) => x > p.x + p.w - 6).sort((a, b) => a - b)[0];
    if (next === undefined) return go('R');
    const gap = next - (p.x + p.w);
    const edge = !w.solidAt(p.x + p.w + 3, p.y + p.h + 1, 1, 1);
    const under = w.solidAt(p.x + p.w - 1, p.y + p.h + 1, 1, 1);
    const adjacent = !!under && under !== true && under.x + under.w >= next - 1;
    if (adjacent) return go('R');
    if ((gap <= 34 && gap >= -2) || (edge && gap <= 56)) {
      jt = gap > 34 ? 16 : 12;
      return { move: 'R', jump: true };
    }
    return go('R');
  };
}
const room08 = (): Step[] => [{ policy: raftHop(['ita8a', 'ita8b'], px(27)), until: and(ground, X(27.5)), max: 2000, note: 'band to band across both rafts' }, { hold: 'R', until: X(29), max: 400 }];
const act08 = (x: number): Step[] => [{ policy: raftHop(['ita8c', 'ita8d'], px(x + 41)), until: and(ground, X(x + 41.5)), max: 3000, note: 'band to band, over the frayed ones' }, { hold: 'R', until: X(x + 46.4), max: 400 }];
/** the ghat: one running jump over the whole frayed raft */
const ghatPolicy: Policy = (w, m) => {
  const g = w.flags.ita8g as { x0: number; x1: number };
  const p = w.player;
  if (m.hold > 0) return { move: 'R', jump: true };
  if (p.onGround && p.x + p.w >= g.x0 - 6 && p.x < g.x0) {
    m.hold = 22;
    return { move: 'R', jump: true };
  }
  return go('R');
};

const upTo = (n: number) => tourRoute().slice(0, n);
const naive: Record<string, { steps: Step[]; cause?: string }> = {
  'ITA-01': { steps: [...courseRoute(), ...hop(62.4, 'hop the fort wall like the others'), { hold: 'R', until: done, max: 900 }], cause: 'ita-ita' },
  'ITA-02': { steps: [...hopGaps([12, 18]), { hold: 'R', until: done, max: 2400 }], cause: 'ita-bhaar' },
  'ITA-03': { steps: [{ hold: 'R', until: done, max: 1200 }], cause: 'ita-keechad' },
  'ITA-04': { steps: [{ hold: 'R', until: X(9.4), max: 600 }, { hold: 'R', jump: 12, ticks: 12, note: 'jump for the oranges in the tree' }, { hold: '', until: done, max: 600 }], cause: 'ita-santra' },
  'ITA-05': { steps: [{ hold: 'R', until: done, max: 1200 }], cause: 'ita-khai' },
  'ITA-06': { steps: [{ hold: 'R', until: done, max: 1200 }], cause: 'ita-doob' },
  'ITA-07': { steps: [{ hold: 'R', until: done, max: 2400, note: 'push without stopping' }], cause: 'ita-dhuan' },
  'ITA-08': { steps: [{ hold: 'R', until: done, max: 1200 }], cause: 'ita-nadi' },
};
const fix: Record<string, { steps: Step[]; cause?: string }> = {
  'ITA-01': { steps: [...upTo(24), { hold: 'R', until: X(77.0), max: 600 }, { hold: 'R', jump: 16, ticks: 16, note: 'skip the first brick, as on the first wall' }, { hold: 'R', until: done, max: 900 }], cause: 'ita-pop' },
  'ITA-02': { steps: [{ hold: 'R', until: (w) => w.player.x >= px(12) && w.player.y > FL - 8, max: 900, note: 'step aside into the first bay' }, { hold: '', until: done, max: 2400, note: 'and wait there' }], cause: 'ita-bans' },
  'ITA-03': { steps: [{ policy: herdWalk('ita3', 0.05), until: done, max: 3000, note: 'wait for the lead’s dip, then hop on in rhythm' }], cause: 'ita-seeng' },
  'ITA-04': { steps: [...shake(5.2, 4), { hold: '', until: done, max: 600 }], cause: 'ita-tokri' },
  'ITA-05': {
    steps: [
      { hold: 'R', until: X(4), max: 600 },
      { hold: '', until: (w) => !!(w.flags.ita5 as CanopySt).rigs[0].s.down, max: 900, note: 'wait for the first cluster to land' },
      { hold: 'R', until: X(6.2), max: 300 },
      { hold: 'R', jump: 12, ticks: 12, note: 'hop on' },
      { hold: 'R', until: (w) => w.player.x + w.player.w >= (w.flags.ita5 as CanopySt).rigs[0].x + FIGW - 1, max: 600, note: 'to its right edge, to wait for the next' },
      { hold: '', until: done, max: 1500 },
    ],
    cause: 'ita-anjeer',
  },
  'ITA-06': {
    steps: [
      ...pullCross('ita6', 0, 5, 10).slice(0, 4),
      { hold: '', until: (w) => (w.flags.ita6 as PaddySt).tanks[0].level === 'low', max: 600, note: 'drained: go at once' },
      { hold: 'R', until: (w) => w.player.x >= px(10) - 12, max: 600 },
      { hold: 'R', jump: 14, ticks: 14 },
      { hold: 'R', until: done, max: 1500, note: 'straight on into the next tank' },
    ],
    cause: 'ita-bahaav',
  },
  'ITA-07': { steps: [{ policy: releaseAtTell('ita7'), until: done, max: 3000, note: 'let go when the cab shakes, wherever the truck is' }], cause: 'ita-truck' },
  'ITA-08': {
    get steps(): Step[] {
      const x = actX0('ITA-08', 'ita08-dhaara');
      return [...room08(), { policy: raftHop(['ita8c', 'ita8d'], px(x + 41), true), until: done, max: 3000, note: 'band to band, the frayed one too' }];
    },
    cause: 'ita-rassi',
  },
};
const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {
  'ITA-03': [{ what: 'wait on the young one’s back for the next to dip', steps: [{ policy: herdWalk('ita3'), until: (w) => w.player.x >= px(15), max: 3000 }, { hold: '', until: done, max: 1500 }], cause: 'ita-seeng' }],
  'ITA-04': [{ what: 'shake from the downhill side of the trunk', steps: [...shake(8.6, 1), { hold: '', until: done, max: 600 }], cause: 'ita-santra' }],
  'ITA-05': [
    { what: 'at dusk, read the brightest cluster as the next to drop (the day rule)', steps: [...room05(), { policy: canopyWalk('ita5a', { wrongRead: true }), until: done, max: 5000 }], cause: 'ita-anjeer' },
    {
      what: 'in the squirrel’s canopy, hop across the moment each cluster lands',
      get steps(): Step[] {
        const x = actX0('ITA-05', 'ita05-gilahri');
        return [...room05(), ...act05(actX0('ITA-05', 'ita05-shaam')), { policy: canopyWalk('ita5b'), until: done, max: 5000 }, { hold: 'R', until: X(x + 40), max: 100 }];
      },
      cause: 'ita-gilahri',
    },
  ],
  'ITA-06': [
    {
      what: 'on the second bund pull both levers at once (drain everything ahead) and walk on',
      get steps(): Step[] {
        const x = actX0('ITA-06', 'ita06-nahar');
        return [
          ...room06(),
          ...pullCross('ita6a', 0, x + 3, x + 8),
          { hold: 'R', until: X(x + 8.2), max: 600, note: 'between the two handles' },
          { hold: '', ticks: 18 },
          { hold: '', jump: 20, ticks: 22, long: true, note: 'both at once' },
          { hold: '', until: (w) => (w.flags.ita6a as PaddySt).tanks[1].level === 'low', max: 600 },
          { hold: 'R', until: done, max: 1500 },
        ];
      },
      cause: 'ita-bahaav',
    },
  ],
  'ITA-02': [{ what: 'wait in the deep bay for the first porter only, then run on', steps: [...hopGaps([12]), { hold: 'R', until: (w) => w.player.x >= px(18) && w.player.y > FL - 8, max: 900 }, { hold: '', until: (w) => (w.flags.ita2 as DeckSt).porters[0].x < px(18) - 34, max: 1500 }, { hold: 'R', jump: 16, ticks: 16 }, { hold: 'R', until: done, max: 1500 }], cause: 'ita-bhaar' }],
};
const actX0 = (id: string, act: string) => LEVEL_BY_ID.get(id)!.parts!.find((p) => p.kind === act)!.x0;
const actRoutes: Record<string, (x: number) => Step[]> = {
  'ita02-dusra': act02,
  'ita03-jhund': act03,
  'ita04-upar': act04,
  'ita05-shaam': act05,
  'ita05-gilahri': act05b,
  'ita06-nahar': act06,
  'ita07-chadhai': act07,
  'ita07-barf': act07b,
  'ita08-dhaara': act08,
};
const endingPolicies: Record<string, Policy> = {
  'ita-phatak': gatePolicy,
  'ita-baada': penPolicy,
  'ita-peti': shedPolicy,
  'ita-khokhla': hollowPolicy,
  'ita-mori': sluicePolicy,
  'ita-tailgate': tailgatePolicy,
  'ita-ghat': ghatPolicy,
};

function solutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  S['ITA-01'] = tourRoute();
  S['ITA-02'] = room02();
  lengthen('ITA-02', 0, []);
  S['ITA-03'] = room03();
  lengthen('ITA-03', 0, []);
  S['ITA-04'] = room04();
  lengthen('ITA-04', 0, []);
  S['ITA-05'] = room05();
  lengthen('ITA-05', 0, []);
  S['ITA-06'] = room06();
  lengthen('ITA-06', 0, []);
  S['ITA-07'] = room07();
  lengthen('ITA-07', 0, []);
  S['ITA-08'] = room08();
  lengthen('ITA-08', 0, []);
}

export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  fair: ['ITA-02', 'ITA-03', 'ITA-04', 'ITA-05', 'ITA-06', 'ITA-07', 'ITA-08'],
};
