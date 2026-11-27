// Proven routes for Kohima: every built stage's room, its acts and its door, plus the plays that must die.
// Found by tests/city-tests.ts; merged into SOLUTIONS, NAIVE, FIX, MISTAKES, ACT_ROUTES and ENDING_POLICIES.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import { Step, X, and, ground, done } from '../runner';
import type { CityTests } from '../city-tests';
import { LEVEL_BY_ID } from '../../src/game/levels';
import type { Mat } from '../../src/game/cities/koh/s02';
import type { Seesaw } from '../../src/game/cities/koh/s03';
import type { Lilies } from '../../src/game/cities/koh/s04';
import type { Log } from '../../src/game/cities/koh/s05';
import type { Roof } from '../../src/game/cities/koh/s06';
import type { Cart } from '../../src/game/cities/koh/s07';
import type { Pot } from '../../src/game/cities/koh/s08';
import { acts as acts07 } from '../../src/game/cities/koh/s07';

type Move = 'L' | 'R' | '';
type Out = { move: Move; jump: boolean };
type Policy = (w: World, m: { hold: number; [k: string]: any }, d: Door) => Out;
const px = (t: number) => t * 16;
const FL = 240;
const go = (move: Move): Out => ({ move, jump: false });
const toward = (w: World, x: number, slack = 2): Move => {
  const c = w.player.cx;
  return c < x - slack ? 'R' : c > x + slack ? 'L' : '';
};
/** on the road (not up on a deck), standing, at or past column x */
const road = (x: number) => and(ground, X(x), (w: World) => w.player.y >= 224);
const hop = (at: number, note: string, ticks = 12): Step[] => [
  { hold: 'R', until: X(at), max: 900 },
  { hold: 'R', jump: ticks, ticks, note },
  { hold: 'R', until: ground, max: 300 },
];
/** a policy that jumps once (held `ticks`) and then runs on; `W`-keyed so each play starts fresh */
function jumpOnce(ticks: number, holdAfter: (w: World) => Move = () => 'R'): (w: World) => Out {
  let W: World | null = null;
  let left = 0;
  let fired = false;
  return (w) => {
    if (W !== w) {
      W = w;
      left = 0;
      fired = false;
    }
    if (!fired) {
      fired = true;
      left = ticks;
    }
    if (left > 0) {
      left--;
      return { move: holdAfter(w), jump: true };
    }
    return go(holdAfter(w));
  };
}

// ------------------------------------------------------------------ KOH-01
const tourRoute = (): Step[] => [
  ...hop(10.4, 'a shallow ditch'),
  ...hop(20.7, 'a step up'),
  ...hop(22.7, 'a step up'),
  ...hop(36.6, 'a post'),
  ...hop(39.6, 'a post'),
  ...hop(42.6, 'a post'),
  { hold: 'R', until: X(49.8), max: 900 },
  { hold: 'R', jump: 14, ticks: 14, note: 'hop the parked cart' },
  { hold: 'R', until: (w) => w.player.onGround && w.player.y > 220, max: 400 },
  { hold: 'R', until: X(64.0), max: 600, note: 'the drain with the rod across it' },
  { hold: 'R', jump: 36, ticks: 36, long: true, note: 'jump the drain, not the rod' },
  { hold: 'R', until: and(ground, X(69)), max: 300 },
  ...hop(86.4, 'the low wall'),
  { hold: 'R', until: X(92.4), max: 300 },
  { hold: 'R', jump: 12, ticks: 12, note: 'up on the deck' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', until: road(100.5), max: 600, note: 'off the deck' },
  { hold: 'R', until: done, max: 900 },
];

// ------------------------------------------------------------------ KOH-02
/** across the mat: walk to just behind the flag, ride; step over when the mat lies on the far bank */
function matPolicy(key: string, farBank: number): (w: World) => Out {
  return (w) => {
    const st = w.flags[key] as Mat;
    const p = w.player;
    const r = st.rig;
    const W = r.w;
    const flag = r.x + W / 2;
    if (p.cx > r.x + W + 4) return go('R');
    const onMat = w.standing(r.solid!);
    if (!onMat) return go('R');
    // the mat lies on the far bank: over the flag and off
    if (r.x + W >= px(farBank) + 20 || p.cx > flag) return go('R');
    return go(toward(w, flag - 12, 3));
  };
}
const room02 = (): Step[] => [{ policy: matPolicy('koh2', 20), until: and(ground, X(21.5)), max: 3000, note: 'behind the flag across the ditch' }, { hold: 'R', until: X(29), max: 300 }];
/** the hoisted stand: walk in while it is down */
const hoistPolicy: Policy = (w, _m, d) => {
  const s = w.flags.koh2s as { s: { k?: number; dir?: number } };
  const p = w.player;
  if (p.cx < d.x - 70) return go('R');
  const k = s.s.k ?? 0;
  if (k < 0.05 && (s.s.dir ?? 0) <= 0) return go('R');
  return go(p.cx > d.x - 56 ? 'L' : '');
};

// ------------------------------------------------------------------ KOH-03
/** hop on to the plank so that Dad lands with his centre at `cx`: run to the take-off, jump, steer in the air */
function landAt(cx: number, takeOff: number, ticks: number): (w: World) => Out {
  let W: World | null = null;
  let left = 0;
  let jumped = false;
  return (w) => {
    if (W !== w) {
      W = w;
      left = 0;
      jumped = false;
    }
    const p = w.player;
    if (!jumped) {
      if (p.x < takeOff) return go('R');
      jumped = true;
      left = ticks;
    }
    const jump = left > 0;
    if (left > 0) left--;
    if (p.onGround && !jump) return go('R');
    return { move: p.cx < cx - 3 ? 'R' : p.cx > cx + 3 ? 'L' : '', jump };
  };
}
/** after the landing: on to the far half at once, wait for the gate, then go */
function seesawCross(key: string, mid: number): (w: World) => Out {
  return (w) => {
    const st = w.flags[key] as Seesaw;
    const p = w.player;
    if (p.cx < mid + 24) return go('R');
    if (st.open) return go('R');
    return go(toward(w, mid + 30, 4));
  };
}
const SEE3 = { x0: px(9), mid: px(13), end: px(17) };
const room03 = (): Step[] => [
  { policy: landAt(SEE3.x0 + 9, SEE3.x0 - 30, 8), until: and(ground, (w) => w.player.x >= SEE3.x0 - 4), max: 900, note: 'hop on to the very tip of the near end' },
  { policy: seesawCross('koh3', SEE3.mid), until: and(ground, X(18.5)), max: 1200, note: 'on to the far half, wait for Kewhi to lift the bar' },
  { hold: 'R', until: X(29), max: 400 },
];
/** the loose plank at the door: jump the near half */
const loosePolicy: Policy = (w, m, d) => {
  const D = Math.round(d.x / 16);
  const x0 = px(D - 9);
  const p = w.player;
  if (p.cx < x0 - 14) return go('R');
  if (m.j === undefined) m.j = 30;
  if (m.j > 0) {
    m.j--;
    return { move: 'R', jump: true };
  }
  return go('R');
};

// ------------------------------------------------------------------ KOH-04
const padOpen = (st: Lilies, i: number) => !!st.pads[i].s.open;
const padLeft = (st: Lilies, i: number) => (st.pads[i].s.left as number) ?? 0;
/** chase the wave: step on pad 0 when it has just opened, then on to each next pad as it opens */
function chase(key: string): (w: World) => Out {
  return (w) => {
    const st = w.flags[key] as Lilies;
    const p = w.player;
    const first = st.pads[0];
    const last = st.pads[st.pads.length - 1];
    if (p.cx > last.x + last.w) return go('R');
    if (p.cx < first.x - 4) {
      // wait on the bank for the first pad to open with most of its time left
      if (p.cx < first.x - 14) return go('R');
      return go(padOpen(st, 0) && padLeft(st, 0) > 0.6 ? 'R' : '');
    }
    const i = st.pads.findIndex((q) => p.cx >= q.x - 4 && p.cx < q.x + q.w + 4);
    if (i < 0) return go('R');
    if (i === st.pads.length - 1) return go('R');
    const next = i + 1;
    if (st.buds.includes(next)) {
      // jump the bud: from the far edge of this pad to the one after
      const after = next + 1;
      if (padOpen(st, after)) return p.cx >= st.pads[i].x + 10 ? { move: 'R', jump: true } : go('R');
      return go(toward(w, st.pads[i].x + 10, 2));
    }
    return go(padOpen(st, next) ? 'R' : toward(w, st.pads[i].x + st.pads[i].w / 2, 3));
  };
}
/** the far half: wait on the stone for the near pad, then run */
function waitRun(key: string): (w: World) => Out {
  return (w) => {
    const st = w.flags[key] as Lilies;
    const p = w.player;
    const first = st.pads[0];
    if (p.cx >= first.x - 2) return go('R');
    if (p.cx < first.x - 24) return go('R');
    // go only as the near pad opens: the pads beyond it opened earlier and close in that order
    return go(padOpen(st, 0) && padLeft(st, 0) > st.open - 0.35 ? 'R' : '');
  };
}
const room04 = (): Step[] => [
  { policy: chase('koh4a'), until: (w) => w.player.cx > px(11) + 8 && w.player.onGround, max: 2400, note: 'chase the wave over the first four lilies' },
  { hold: 'R', jump: 30, ticks: 30, long: true, note: 'jump the stream to the stone' },
  { hold: 'R', until: and(ground, X(16.2)), max: 300 },
  { policy: waitRun('koh4b'), until: and(ground, X(26.2)), max: 2400, note: 'wait on the stone, then run through' },
  { hold: 'R', until: X(29), max: 400 },
];
const act04 = (x: number): Step[] => [
  { policy: chase('koh4c'), until: (w) => w.player.cx > px(x + 16) + 8 && w.player.onGround, max: 3000, note: 'chase the wave, jump the bud' },
  { hold: 'R', jump: 30, ticks: 30, long: true, note: 'jump the stream' },
  { hold: 'R', until: and(ground, X(x + 21.2)), max: 300 },
  { policy: waitRun('koh4d'), until: and(ground, X(x + 33.2)), max: 3000, note: 'wait on the stone, then run through' },
  { hold: 'R', until: X(x + 36.4), max: 400 },
];
const rimPolicy: Policy = (w) => chase('koh4e')(w);

// ------------------------------------------------------------------ KOH-05
/** ride the log: board it, stand on its back half, step off at the top of the surge that touches the bank */
function rideLog(key: string, bank: number): (w: World) => Out {
  return (w) => {
    const st = w.flags[key] as Log;
    const r = st.rig;
    const p = w.player;
    if (p.cx > r.x + r.w + 6) return go('R');
    if (!w.standing(r.solid!)) return go('R');
    const touching = r.x + r.w >= px(bank) - 2;
    if (touching && (st.phase === 1 || st.phase === 0)) return go('R');
    return go(toward(w, r.x + 22, 4));
  };
}
const room05 = (): Step[] => [{ policy: rideLog('koh5', 16), until: and(ground, X(18.6)), max: 2400, note: 'ride the log, off at the top of the surge that touches the bank' }, { hold: 'R', until: X(29), max: 400 }];
/** two logs: ride the red one to its last top, step across, ride the white one, off at its first top and keep going */
function twoLogs(x: number): (w: World) => Out {
  return (w) => {
    const a = w.flags.koh5a as Log;
    const b = w.flags.koh5b as Log;
    const p = w.player;
    if (p.cx > b.rig.x + b.rig.w + 6) return go('R');
    if (w.standing(b.rig.solid!)) {
      const touching = b.rig.x + b.rig.w >= px(x + 20) - 2;
      if (touching && (b.phase === 1 || b.phase === 0)) return go('R');
      return go(toward(w, b.rig.x + 48, 4));
    }
    if (w.standing(a.rig.solid!)) {
      const touching = a.rig.x + a.rig.w >= b.rig.x - 2;
      if (touching && (a.phase === 1 || a.phase === 0 || a.phase === 2)) return go('R');
      return go(toward(w, a.rig.x + 22, 4));
    }
    return go('R');
  };
}
const act05a = (x: number): Step[] => [{ policy: twoLogs(x), until: and(ground, X(x + 23)), max: 3000, note: 'red log, white log, off and on' }, { hold: 'R', until: X(x + 29.4), max: 400 }];
const act05b = (x: number): Step[] => [
  { policy: rideLog('koh5c', x + 13), until: and(ground, X(x + 14.5)), max: 2400, note: 'the quick crew' },
  { hold: 'R', until: X(x + 16.5), max: 400 },
  { policy: rideLog('koh5d', x + 29), until: and(ground, X(x + 30.5)), max: 2400, note: 'the slow crew' },
  { hold: 'R', until: X(x + 33.4), max: 400 },
];
/** the rocking drum: hop it as it rolls away */
const drumPolicy: Policy = (w, m) => {
  const dr = w.flags.koh5drum as { x: number; s: { v?: number } };
  const p = w.player;
  if (p.cx > dr.x + 60) return go('R');
  if (m.j === undefined) m.j = 0;
  if (m.j > 0) {
    m.j--;
    return { move: 'R', jump: true };
  }
  if (p.cx < dr.x - 44) return go('R');
  if (!p.onGround) return go('R');
  if ((dr.s.v ?? 0) > 10 && p.cx > dr.x - 36) {
    m.j = 30;
    return { move: 'R', jump: true };
  }
  return go(toward(w, dr.x - 30, 3));
};

// ------------------------------------------------------------------ KOH-06
const Y1 = FL - 48;
const cycT = (w: World, period: number, phase: number) => ((((w.tick / 120 + phase) % period) + period) % period);
/** up the step at column c and on to the roof at c + 1 */
const upRoof = (c: number): Step[] => [
  { hold: 'R', until: X(c - 2.3), max: 900 },
  { hold: 'R', jump: 10, ticks: 10, note: 'on to the step' },
  { hold: 'R', until: and(ground, (w) => w.player.y < FL - 20), max: 300 },
  { hold: 'R', jump: 14, ticks: 14, note: 'on to the roof' },
  { hold: 'R', until: and(ground, (w) => w.player.y < Y1), max: 300 },
];
/** hop a tin roof low: a tap jump from the thatch's edge at column c */
const hopTin = (c: number): Step[] => [
  { hold: 'R', until: X(c), max: 900 },
  { hold: 'R', jump: 13, ticks: 13, note: 'hop the tin, low' },
  { hold: 'R', until: ground, max: 300 },
];
/** walk through the chimney at px x (puff `on` s of `period`, offset `phase`) between puffs */
function throughChimney(x: number, period: number, on: number, phase: number): (w: World) => Out {
  return (w) => {
    const p = w.player;
    if (p.cx > x + 16) return go('R');
    if (p.cx < x - 40) return go('R');
    const t = cycT(w, period, phase);
    // go only when the puff is off and will stay off long enough to walk through
    return go(t >= on && t < period - 0.5 ? 'R' : toward(w, x - 34, 2));
  };
}
/** step into the chimney's column at px x as a puff starts, and ride it up; keep right to land on the tin */
function rideChimney(x: number, period: number, on: number, phase: number): (w: World) => Out {
  return (w) => {
    const p = w.player;
    if (!p.onGround) return go('R');
    if (p.cx > x + 10) return go('R');
    if (p.cx < x - 40) return go('R');
    const t = cycT(w, period, phase);
    return go(t < on - 0.6 ? 'R' : toward(w, x - 34, 2));
  };
}
const room06 = (): Step[] => [...upRoof(5), ...hopTin(8.6), ...hopTin(16.6), { hold: 'R', until: road(26.5), max: 900, note: 'off the last roof' }, { hold: 'R', until: X(29), max: 400 }];
const act06a = (x: number): Step[] => [
  ...upRoof(x + 6),
  { policy: throughChimney(px(x + 9), 2.2, 0.9, 0), until: X(x + 10.2), max: 2000, note: 'the first chimney, between puffs' },
  ...hopTin(x + 11.6),
  { policy: throughChimney(px(x + 18) + 8, 2.2, 0.9, 1.1), until: X(x + 19.7), max: 2000, note: 'the second chimney' },
  { policy: throughChimney(px(x + 21) + 8, 2.2, 0.9, 0.4), until: X(x + 22.6), max: 2000, note: 'the third chimney' },
  ...hopTin(x + 22.6),
  { hold: 'R', until: road(x + 31.5), max: 900, note: 'off the last roof' },
  { hold: 'R', until: X(x + 32.4), max: 400 },
];
const onTinL = (x: number) => (w: World) => w.standing((w.flags.koh6l as Roof).rig.solid!) && w.player.cx > px(x + 8);
const act06b = (x: number): Step[] => [
  ...upRoof(x + 6),
  { policy: rideChimney(px(x + 8), 2.0, 1.0, 0), until: onTinL(x), max: 2400, note: 'ride the puff up on to the tin' },
  { hold: 'R', jump: 13, ticks: 13, note: 'off the tin at once' },
  { hold: 'R', until: and(ground, X(x + 13.2)), max: 300 },
  ...hopTin(x + 17.6),
  { hold: 'R', until: and(ground, (w) => w.player.cx > px(x + 26.5) && w.player.y > Y1 - 20), max: 900, note: 'down on to the low roof' },
  { hold: 'R', until: road(x + 29.5), max: 900, note: 'off the last roof' },
  { hold: 'R', until: X(x + 30.4), max: 400 },
];
/** the skylight door: up the step, walk the roof and over the glass, never jump on it */
const skylightPolicy: Policy = (w, m, d) => {
  const D = Math.round(d.x / 16);
  const p = w.player;
  if (m.j === undefined) {
    m.j = 0;
    m.ph = 0;
  }
  if (m.j > 0) {
    m.j--;
    return { move: 'R', jump: true };
  }
  if (m.ph === 0 && p.cx >= px(D - 10) - 44) {
    m.ph = 1;
    m.j = 10;
    return { move: 'R', jump: true };
  }
  if (m.ph === 1 && p.onGround && p.y <= FL - 20 && p.y > Y1) {
    m.ph = 2;
    m.j = 14;
    return { move: 'R', jump: true };
  }
  return go('R');
};

// ------------------------------------------------------------------ KOH-07
const DECK_W = 48;
/** ride the cart: board it, then stand at the back for a hole and at the front for a beam (mirrored while the controls are flipped) */
function ridePolicy(key: string, stance: 'read' | 'front' | 'back' = 'read'): (w: World) => Out {
  return (w) => {
    const st = w.flags[key] as Cart;
    const r = st.deck;
    const p = w.player;
    if (st.stopped) return go('R');
    if (!w.standing(r.solid!)) return go('R');
    const next = st.obs.find((o) => !o.done && o.k !== 'slick');
    const want = stance === 'front' ? 1 : stance === 'back' ? -1 : next ? (next.k === 'hole' ? -1 : 1) : 0;
    const target = want < 0 ? r.x + 12 : want > 0 ? r.x + DECK_W - 14 : r.x + DECK_W / 2;
    let m: Move = toward(w, target, 2);
    if (w.flipped) m = m === 'L' ? 'R' : m === 'R' ? 'L' : '';
    return go(m);
  };
}
const cartStopped = (key: string) => (w: World) => (w.flags[key] as Cart).stopped && w.player.onGround;
const rideSteps = (key: string, end: number): Step[] => [
  { policy: ridePolicy(key), until: cartStopped(key), max: 3000, note: 'ride the cart' },
  { hold: 'R', jump: 9, ticks: 9, note: 'hop the front board' },
  { hold: 'R', until: and(ground, X(end)), max: 600, note: 'off at the landing' },
];
/** hop over the waiting cart and walk the lane */
const walkLane = (x: number): Step[] => [{ hold: 'R', until: X(x + 4.7), max: 600 }, { hold: 'R', jump: 24, ticks: 24, long: true, note: 'over the cart' }, { hold: 'R', until: done, max: 1500 }];
const room07 = (): Step[] => rideSteps('koh7', 27.5);
const act07 = (a: { id: string; w: number }) => (x: number): Step[] => rideSteps(`${a.id}:cart`, x + a.w - 2.4);
const garagePolicy: Policy = (w, m) => {
  const st = w.flags.koh7e as Cart;
  const g = w.flags.koh7g as { open: boolean };
  const p = w.player;
  if (m.j === undefined) m.j = 0;
  if (m.j > 0) {
    m.j--;
    return { move: 'R', jump: true };
  }
  if (!st.stopped) return ridePolicy('koh7e', 'front')(w);
  if (g.open) {
    // hop the front board once, then walk in
    if (!m.hopped && p.onGround && p.cx > st.deck.x + DECK_W - 24) {
      m.hopped = true;
      m.j = 9;
      return { move: 'R', jump: true };
    }
    return go('R');
  }
  // shut: back to the plank's front
  return go(toward(w, st.deck.x + DECK_W - 14, 2));
};

// ------------------------------------------------------------------ KOH-08
const lidOn = (w: World) => (w.flags.koh8 as Pot).lid;
/** a hop at column c to knock the lid off, then on */
const hopLid = (c: number): Step[] => [
  { hold: 'R', until: X(c), max: 900 },
  { hold: 'R', jump: 8, ticks: 8, note: 'a hop: the lid comes off' },
  { hold: 'R', until: ground, max: 200 },
];
/** stand still at column c until the lid is back on */
const lidAt = (c: number): Step[] => [
  { hold: 'R', until: X(c), max: 900 },
  { hold: '', until: lidOn, max: 200, note: 'stand still: the lid goes back on' },
];
/** walk under a crow (flag key): when it leaves the wire, stand still until it has landed ahead */
function crowStop(key: string, past: number): (w: World) => Out {
  return (w) => {
    const st = w.flags[key] as { mode: string };
    if (w.player.cx > past) return go('R');
    return go(st.mode === 'dive' ? '' : 'R');
  };
}
const room08 = (): Step[] => [...hopLid(5), { hold: 'R', until: X(12.6), max: 900, note: 'past the dog and under the crows with the pot open' }, ...lidAt(19.6), { hold: 'R', until: X(29), max: 900, note: 'past the cat, lidded' }];
const act08a = (x: number): Step[] => [...hopLid(x + 4), { hold: 'R', until: X(x + 12.6), max: 900 }, ...lidAt(x + 13.4), ...hopLid(x + 27), { hold: 'R', until: X(x + 43.4), max: 900 }];
const act08b = (x: number): Step[] => [
  ...lidAt(x + 3),
  { policy: crowStop(`koh08-taar:c1`, px(x + 14)), until: X(x + 14), max: 1500, note: 'the first crow' },
  { policy: crowStop(`koh08-taar:c2`, px(x + 19)), until: X(x + 19), max: 1500, note: 'the second crow' },
  { policy: crowStop(`koh08-taar:c3`, px(x + 27)), until: X(x + 27), max: 1500, note: 'past the cat, the third crow' },
  { hold: 'R', until: X(x + 39.4), max: 900 },
];
const kitchenPolicy: Policy = (w, m, d) => {
  const p = w.player;
  if (m.j === undefined) m.j = 0;
  if (m.j > 0) {
    m.j--;
    return { move: 'R', jump: true };
  }
  if (!m.hopped && p.onGround && p.cx > d.x - 70) {
    m.hopped = true;
    m.j = 8;
    return { move: 'R', jump: true };
  }
  return go('R');
};

// ------------------------------------------------------------------ KOH-09
/** the plank house: walk a little, stand until the plank settles, walk again */
function plankWalk(key: string, end: number): (w: World) => Out {
  return (w) => {
    const st = w.flags[key] as { walk: number };
    if (w.player.cx > end) return go('R');
    return go(st.walk > 0.3 ? '' : 'R');
  };
}
const room09 = (): Step[] => [
  { hold: 'R', until: X(14.2), max: 900, note: 'walk the drum floor to its edge' },
  { hold: 'R', jump: 26, ticks: 26, long: true, note: 'jump the hearth' },
  { hold: 'R', until: and(ground, X(18.5)), max: 300 },
  { hold: 'R', until: X(29), max: 600 },
];
const act09a = (x: number): Step[] => [
  { hold: 'R', until: X(x + 16.6), max: 900, note: 'straight through the gate house' },
  { policy: plankWalk(`koh09-teen:p`, px(x + 27.5)), until: X(x + 27.5), max: 2400, note: 'the plank: walk, stop, walk' },
  { hold: 'R', until: X(x + 29.4), max: 400 },
];
const act09b = (x: number): Step[] => [
  { hold: 'R', until: X(x + 12.1), max: 900, note: 'walk the drum' },
  { hold: 'R', jump: 30, ticks: 30, long: true, note: 'one long jump over the coals' },
  { hold: 'R', until: and(ground, X(x + 17)), max: 300 },
  { hold: 'R', until: X(x + 23.4), max: 400 },
];
const backDoorPolicy: Policy = () => go('R');

// ------------------------------------------------------------------ KOH-10
/** up the step at 14 and straight over the rotten thatch on to the first tin */
const toTin10: Step[] = [
  { hold: 'R', until: X(12.6), max: 900, note: 'walk the lashed rod' },
  { hold: 'R', until: X(11.7), max: 900 },
  { hold: 'R', jump: 10, ticks: 10, note: 'on to the step' },
  { hold: 'R', until: and(ground, (w) => w.player.y < FL - 20), max: 300 },
  { hold: 'R', jump: 16, ticks: 16, note: 'over the rotten thatch on to the tin' },
  { hold: 'R', until: and(ground, (w) => w.player.y < Y1), max: 300 },
];
const room10 = (): Step[] => [
  ...toTin10,
  ...hopTin(20.6),
  { hold: 'R', until: X(26.6), max: 600, note: 'the tin is the floor' },
  { hold: 'R', until: road(27.5), max: 600 },
  { hold: 'R', until: X(29), max: 400 },
];
const act10a = (x: number): Step[] => [{ hold: 'R', until: X(x + 8.5), max: 600 }, { hold: 'R', jump: 28, ticks: 28, long: true, note: 'over the cart: walk the paved lane' }, { hold: 'R', until: and(ground, X(x + 14.2)), max: 400 }, { hold: 'R', until: X(x + 29.4), max: 900 }];
/** stay aboard the log all the way: it has no lintel here */
function stayAboard(key: string, bank: number): (w: World) => Out {
  return (w) => {
    const st = w.flags[key] as Log;
    const r = st.rig;
    const p = w.player;
    if (p.cx > r.x + r.w + 6) return go('R');
    if (!w.standing(r.solid!)) return go('R');
    const touching = r.x + r.w >= px(bank) - 2;
    if (touching && st.phase !== -1) return go('R');
    return go(toward(w, r.x + 22, 4));
  };
}
const act10b = (x: number): Step[] => [{ policy: stayAboard('koh10-bera:log', x + 25), until: and(ground, X(x + 26.5)), max: 3000, note: 'ride the log past the raft to the bank' }, { hold: 'R', until: X(x + 31.4), max: 600 }];
const offLog = (key: string) => (w: World) => !w.standing((w.flags[key] as Log).rig.solid!);
const morungPolicy: Policy = (w, _m, d) => {
  const st = w.flags.koh10gate as { open: boolean };
  const p = w.player;
  if (st.open) return go('R');
  return go(p.cx < d.x - 40 ? 'R' : '');
};

function solutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  S['KOH-01'] = tourRoute();
  S['KOH-02'] = room02();
  lengthen('KOH-02', 0, []);
  S['KOH-03'] = room03();
  lengthen('KOH-03', 0, []);
  S['KOH-04'] = room04();
  lengthen('KOH-04', 0, []);
  S['KOH-05'] = room05();
  lengthen('KOH-05', 0, []);
  S['KOH-06'] = room06();
  lengthen('KOH-06', 0, []);
  S['KOH-07'] = room07();
  lengthen('KOH-07', 0, []);
  S['KOH-08'] = room08();
  lengthen('KOH-08', 0, []);
  S['KOH-09'] = room09();
  lengthen('KOH-09', 0, []);
  S['KOH-10'] = room10();
  lengthen('KOH-10', 0, []);
}

const upTo = (n: number) => tourRoute().slice(0, n);
const runOn: Step[] = [{ hold: 'R', until: done, max: 5000 }];
const naive: Record<string, { steps: Step[]; cause?: string }> = {
  'KOH-01': { steps: [...upTo(21), { hold: 'R', until: done, max: 2400 }], cause: 'koh-rod' },
  'KOH-02': { steps: runOn, cause: 'koh-khai' },
  'KOH-03': { steps: [{ hold: 'R', until: X(7.6), max: 600 }, { hold: 'R', jump: 10, ticks: 10, note: 'hop on to the plank at a run' }, { hold: 'R', until: done, max: 2400 }], cause: 'koh-kanta' },
  'KOH-04': { steps: runOn, cause: 'koh-daldal' },
  'KOH-05': { steps: runOn, cause: 'koh-nala' },
  'KOH-06': { steps: [...upRoof(5), ...runOn], cause: 'koh-khatkhat' },
  'KOH-07': { steps: walkLane(2.4), cause: 'koh-dhalan' },
  'KOH-08': { steps: runOn, cause: 'koh-kukur' },
  'KOH-09': { steps: runOn, cause: 'koh-aag' },
  'KOH-10': { steps: [{ hold: 'R', until: X(12.6), max: 900 }, ...upRoof(15).slice(0, 4), { hold: 'R', until: and(ground, (w) => w.player.y < Y1), max: 300 }, { hold: 'R', until: done, max: 1500, note: 'cross on the thatch, the floor of Chaal-Chaal' }], cause: 'koh-sadi' },
};
const fix: Record<string, { steps: Step[]; cause?: string }> = {
  'KOH-02': { steps: [{ hold: 'R', until: X(8.4), max: 600, note: 'on to the near end of the mat' }, { hold: '', until: done, max: 1500, note: 'and ride it from there' }], cause: 'koh-dubki' },
  'KOH-03': { steps: [{ hold: 'R', until: X(7.6), max: 600 }, { hold: 'R', jump: 10, ticks: 10, note: 'hop on to the plank at a run (short throw)' }, { hold: 'R', until: X(14.5), max: 600, note: 'to the far half' }, { hold: '', until: done, max: 1500, note: 'wait in front of the thorn gate' }], cause: 'koh-patak' },
  'KOH-04': { steps: [{ policy: chase('koh4a'), until: (w) => w.player.cx > px(11) + 8 && w.player.onGround, max: 2400 }, { hold: 'R', until: done, max: 1500, note: 'wade the stream' }], cause: 'koh-thand' },
  'KOH-05': { steps: [{ hold: 'R', until: X(6.6), max: 600, note: 'on to the log' }, { hold: '', until: done, max: 2400, note: 'and ride it all the way' }], cause: 'koh-shahtir' },
  'KOH-06': { steps: [...upRoof(5), { hold: 'R', until: X(8.6), max: 900 }, { hold: 'R', jump: 30, ticks: 30, long: true, note: 'a big jump over the tin' }, { hold: 'R', until: done, max: 1500 }], cause: 'koh-chhajja' },
  'KOH-07': { steps: [{ policy: ridePolicy('koh7', 'front'), until: done, max: 3000, note: 'ride at the front all the way' }], cause: 'koh-gaddha' },
  'KOH-08': { steps: [...hopLid(9.2), { hold: 'R', until: done, max: 2000, note: 'hop the dog and keep going' }], cause: 'koh-billi' },
  'KOH-09': { steps: [{ hold: 'R', until: X(4.6), max: 600 }, { hold: 'R', jump: 20, ticks: 20, note: 'hop into the drum house' }, { hold: 'R', until: done, max: 1500 }], cause: 'koh-takhta' },
  'KOH-10': { steps: [...toTin10, { hold: 'R', until: X(20.6), max: 600 }, { hold: 'R', jump: 30, ticks: 30, long: true, note: 'a big jump over the thatch' }, { hold: 'R', until: done, max: 1500 }], cause: 'koh-chhajja' },
};
// mistakes inside the acts: the stage up to the act (route), then `steps` from the act's first column
const ROOMS: Record<string, () => Step[]> = { 'KOH-02': room02, 'KOH-03': room03, 'KOH-04': room04, 'KOH-05': room05, 'KOH-06': room06, 'KOH-07': room07, 'KOH-08': room08, 'KOH-09': room09, 'KOH-10': room10 };
const ACT_ORDER: Record<string, string[]> = {
  'KOH-02': ['koh02-teen'],
  'KOH-03': ['koh03-ulta'],
  'KOH-04': ['koh04-kali'],
  'KOH-05': ['koh05-dui', 'koh05-chadhai'],
  'KOH-06': ['koh06-dhuan', 'koh06-upar'],
  'KOH-07': acts07.map((a) => a.id),
  'KOH-08': ['koh08-galli', 'koh08-taar'],
  'KOH-09': ['koh09-teen', 'koh09-paanch'],
  'KOH-10': ['koh10-ulta-gari', 'koh10-bera'],
};
const actX0 = (id: string, act: string) => LEVEL_BY_ID.get(id)!.parts!.find((p) => p.kind === act)!.x0;
const prefix = (id: string, act: string): Step[] => [...ROOMS[id](), ...ACT_ORDER[id].slice(0, ACT_ORDER[id].indexOf(act)).flatMap((a) => actRoutes[a](actX0(id, a)))];
const inAct = (id: string, act: string, what: string, steps: (x: number) => Step[], cause?: string) => ({
  what,
  get steps(): Step[] {
    return [...prefix(id, act), ...steps(actX0(id, act))];
  },
  cause,
});
const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {
  'KOH-02': [
    inAct('KOH-02', 'koh02-teen', 'run straight across the long mat', () => runOn, 'koh-khai'),
    inAct('KOH-02', 'koh02-teen', 'stand on the near end of the long mat', (x) => [{ hold: 'R', until: X(x + 5.4), max: 600 }, { hold: '', until: done, max: 1500 }], 'koh-dubki'),
  ],
  'KOH-03': [
    { what: 'land on the tip, then stand still on the near half', steps: [{ policy: landAt(SEE3.x0 + 9, SEE3.x0 - 30, 8), until: and(ground, (w) => w.player.x >= SEE3.x0 - 4), max: 900 }, { hold: '', until: done, max: 1500 }], cause: 'koh-khad' },
    inAct('KOH-03', 'koh03-ulta', 'hop on to the near end beside Kewhi, like the first seesaw', (x) => [{ policy: landAt(px(x + 6) + 9, px(x + 6) - 30, 8), until: and(ground, (w) => w.player.x >= px(x + 6) - 4), max: 900 }, { hold: '', until: done, max: 1500 }], 'koh-khad'),
    inAct('KOH-03', 'koh03-ulta', 'a running jump that lands short of the far tip', (x) => [{ hold: 'R', until: X(x + 4.8), max: 600 }, { hold: 'R', jump: 14, ticks: 14 }, { hold: 'R', until: (w) => w.player.onGround && w.player.cx > px(x + 8.5), max: 300 }, { hold: '', until: done, max: 1500 }], 'koh-patak'),
  ],
  'KOH-04': [
    { what: 'run through the far half the moment you land on the stone', steps: [...room04().slice(0, 3), { hold: 'R', until: done, max: 1500 }], cause: 'koh-daldal' },
    inAct('KOH-04', 'koh04-kali', 'run on across the second meadow', () => runOn, 'koh-daldal'),
  ],
  'KOH-05': [
    { what: 'ride to the bank, let the log roll back, then walk off its front', steps: [{ hold: 'R', until: X(6.6), max: 600 }, { hold: '', until: (w) => (w.flags.koh5 as Log).cycle >= 1 && (w.flags.koh5 as Log).phase === -1, max: 2400 }, { hold: 'R', until: done, max: 900 }], cause: 'koh-nala' },
    inAct('KOH-05', 'koh05-dui', 'ride the red log until it rests, then walk across to the white one', (x) => [{ hold: 'R', until: X(x + 3.6), max: 600 }, { hold: '', until: (w) => (w.flags.koh5a as Log).phase === 2, max: 2400 }, { hold: 'R', until: done, max: 900 }], 'koh-nala'),
    inAct('KOH-05', 'koh05-dui', 'step off the white log at its first top and stand on the bank edge', (x) => [{ policy: twoLogs(x), until: and(ground, (w) => w.player.y >= 224 && w.player.cx > px(x + 20)), max: 3000 }, { hold: '', until: done, max: 1500 }], 'koh-dhol'),
    inAct('KOH-05', 'koh05-chadhai', 'run on to the quick crew’s log and off its front', () => runOn, 'koh-nala'),
    inAct('KOH-05', 'koh05-chadhai', 'ride the slow crew’s log all the way', (x) => [{ policy: rideLog('koh5c', x + 13), until: and(ground, X(x + 14.5)), max: 2400 }, { hold: 'R', until: X(x + 18.6), max: 600 }, { hold: '', until: done, max: 2400 }], 'koh-shahtir'),
  ],
  'KOH-06': [
    inAct('KOH-06', 'koh06-dhuan', 'run on through the first chimney', (x) => [...upRoof(x + 6), ...runOn], 'koh-garam'),
    inAct('KOH-06', 'koh06-dhuan', 'wait out the puff, then a big jump over the tin', (x) => [...upRoof(x + 6), { policy: throughChimney(px(x + 9), 2.2, 0.9, 0), until: X(x + 10.2), max: 2000 }, { hold: 'R', until: X(x + 11.6), max: 600 }, { hold: 'R', jump: 30, ticks: 30, long: true }, { hold: 'R', until: done, max: 1500 }], 'koh-chhajja'),
    inAct('KOH-06', 'koh06-dhuan', 'hop over the chimney', (x) => [...upRoof(x + 6), { hold: 'R', until: X(x + 7.6), max: 600 }, { hold: 'R', jump: 12, ticks: 12 }, { hold: 'R', until: done, max: 1500 }], 'koh-garam'),
    inAct('KOH-06', 'koh06-upar', 'run on along the roof', (x) => [...upRoof(x + 6), ...runOn], 'koh-gira'),
    inAct('KOH-06', 'koh06-upar', 'ride the puff up and stand on the tin', (x) => [...upRoof(x + 6), { policy: rideChimney(px(x + 8), 2.0, 1.0, 0), until: onTinL(x), max: 2400 }, { hold: '', until: done, max: 1500 }], 'koh-khatkhat'),
  ],
  'KOH-07': [
    { what: 'ride at the back all the way', steps: [{ policy: ridePolicy('koh7', 'back'), until: done, max: 3000 }], cause: 'koh-balli' },
    ...acts07.flatMap((a) => {
      return [
        inAct('KOH-07', a.id, `${a.id}: board and stay at the front`, () => [{ policy: ridePolicy(`${a.id}:cart`, 'front'), until: done, max: 3000 }], 'koh-gaddha'),
        inAct('KOH-07', a.id, `${a.id}: board and stay at the back`, () => [{ policy: ridePolicy(`${a.id}:cart`, 'back'), until: done, max: 3000 }], 'koh-balli'),
        inAct('KOH-07', a.id, `${a.id}: hop the cart and walk the lane`, (x) => walkLane(x), 'koh-dhalan'),
      ];
    }),
  ],
  'KOH-08': [
    { what: 'hop the dog, stand still, then walk under the crows lidded', steps: [...hopLid(9.2), ...lidAt(13), { hold: 'R', until: done, max: 2000 }], cause: 'koh-kag' },
    inAct('KOH-08', 'koh08-galli', 'open the pot for the first dog and keep it open', (x) => [...hopLid(x + 4), { hold: 'R', until: done, max: 2000 }], 'koh-billi'),
    inAct('KOH-08', 'koh08-galli', 'lid it for the cat and stay lidded for the second dog', (x) => [...hopLid(x + 4), { hold: 'R', until: X(x + 12.6), max: 900 }, ...lidAt(x + 13.4), { hold: 'R', until: done, max: 2000 }], 'koh-kukur'),
    inAct('KOH-08', 'koh08-taar', 'open the pot for the crows like before', (x) => [...hopLid(x + 6), { hold: 'R', until: done, max: 2000 }], 'koh-billi'),
    inAct('KOH-08', 'koh08-taar', 'walk under the crows lidded without stopping', (x) => [...lidAt(x + 3), { hold: 'R', until: done, max: 2000 }], 'koh-kag'),
  ],
  'KOH-09': [
    inAct('KOH-09', 'koh09-teen', 'run on through both houses', () => runOn, 'koh-jhukav'),
    inAct('KOH-09', 'koh09-teen', 'stop and go in the gate house, like the plank', (x) => [{ hold: 'R', until: X(x + 9), max: 900 }, { hold: '', ticks: 90 }, { hold: 'R', until: done, max: 1500 }], 'koh-phatak'),
    inAct('KOH-09', 'koh09-paanch', 'run on into the fifth house', () => runOn, 'koh-aag'),
    inAct('KOH-09', 'koh09-paanch', 'hop on to the drum floor and jump the hearth from its middle', (x) => [{ hold: 'R', until: X(x + 4.6), max: 900 }, { hold: 'R', jump: 20, ticks: 20 }, { hold: 'R', until: done, max: 1500 }], 'koh-takhta'),
  ],
  'KOH-10': [
    inAct('KOH-10', 'koh10-ulta-gari', 'board the cart like Kath ka Gari', () => runOn, 'koh-takkar'),
    inAct('KOH-10', 'koh10-bera', 'step off at the first touch, like Dhol Gach', (x) => [{ policy: rideLog('koh10-bera:log', x + 13), until: and(ground, offLog('koh10-bera:log'), (w) => w.player.cx > px(x + 13)), max: 3000 }, { hold: '', until: done, max: 1500 }], 'koh-nala'),
    inAct('KOH-10', 'koh10-bera', 'run across the raft', (x) => [{ policy: rideLog('koh10-bera:log', x + 13), until: and(ground, offLog('koh10-bera:log'), (w) => w.player.cx > px(x + 13)), max: 3000 }, { hold: 'R', until: done, max: 1500 }], 'koh-nala'),
  ],
};
const actRoutes: Record<string, (x: number) => Step[]> = {
  'koh02-teen': (x) => [{ policy: matPolicy('koh2b', x + 20), until: and(ground, X(x + 22.5)), max: 3000, note: 'behind the flag across the long ditch' }, { hold: 'R', until: X(x + 33.4), max: 400 }],
  'koh03-ulta': (x) => [
    { hold: 'R', until: X(x + 4.6), max: 600, note: 'to the edge of the bank' },
    { policy: landAt(px(x + 6) + 72, px(x + 5.25), 34), until: and(ground, (w) => w.player.cx >= px(x + 6) + 56), max: 900, note: 'a running jump on to the far tip' },
    { policy: seesawCross('koh3b', px(x + 6) + 40), until: and(ground, X(x + 12.5)), max: 1200, note: 'wait for Kewhi to lift the bar' },
    { hold: 'R', until: X(x + 29.4), max: 600 },
  ],
  'koh04-kali': act04,
  'koh05-dui': act05a,
  'koh05-chadhai': act05b,
  'koh06-dhuan': act06a,
  'koh06-upar': act06b,
  ...Object.fromEntries(acts07.map((a) => [a.id, act07(a)])),
  'koh08-galli': act08a,
  'koh08-taar': act08b,
  'koh09-teen': act09a,
  'koh09-paanch': act09b,
  'koh10-ulta-gari': act10a,
  'koh10-bera': act10b,
};
const endingPolicies: Record<string, Policy> = {
  'koh-manch': hoistPolicy,
  'koh-dhila-patta': loosePolicy,
  'koh-rim-lily': rimPolicy,
  'koh-rocking-drum': drumPolicy,
  'koh-skylight': skylightPolicy,
  'koh-garage-nose': garagePolicy,
  'koh-kitchen-door': kitchenPolicy,
  'koh-pichla-dwar': backDoorPolicy,
  'koh-morung-gate': morungPolicy,
};

export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  fair: ['KOH-02', 'KOH-03', 'KOH-04', 'KOH-05', 'KOH-06', 'KOH-07', 'KOH-08', 'KOH-09', 'KOH-10'],
};
