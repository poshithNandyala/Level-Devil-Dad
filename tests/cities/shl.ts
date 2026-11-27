// Proven routes for Shillong: every built stage's room, its acts and its door, plus the plays that must die.
// Found by tests/city-tests.ts; merged into SOLUTIONS, NAIVE, FIX, MISTAKES, ACT_ROUTES and ENDING_POLICIES.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import { Step, X, and, ground, done } from '../runner';
import type { CityTests } from '../city-tests';
import { LEVEL_BY_ID } from '../../src/game/levels';
import { VIEW } from '../../src/game/cities/shl/s01';
import type { SwayState } from '../../src/game/cities/shl/s03';
import type { Fall } from '../../src/game/cities/shl/s05';
import type { RootSet } from '../../src/game/cities/shl/s06';
import type { Stal } from '../../src/game/cities/shl/s07';
import { FIT } from '../../src/game/cities/shl/s07';
import type { TankState } from '../../src/game/cities/shl/s08';
import { SPOUT_FOR } from '../../src/game/cities/shl/s08';
import type { Market } from '../../src/game/cities/shl/s09';
import { TOP as MTOP } from '../../src/game/cities/shl/s09';

type Move = 'L' | 'R' | '';
type Out = { move: Move; jump: boolean };
interface Mem {
  hold: number;
  [k: string]: any;
}
type Policy = (w: World, m: Mem, d: Door) => Out;
const go = (move: Move): Out => ({ move, jump: false });
const px = (t: number) => t * 16;
/** on the road (not up on a deck), standing, at or past column x */
const road = (x: number) => and(ground, X(x), (w: World) => w.player.y >= 224);
const hop = (at: number, note: string, ticks = 12): Step[] => [
  { hold: 'R', until: X(at), max: 900 },
  { hold: 'R', jump: ticks, ticks, note },
  { hold: 'R', until: ground, max: 300 },
];

// ------------------------------------------------------------------ SHL-01
const t1 = (w: World) => (w.flags.shl1.t0 < 0 ? -9 : (w.tick - w.flags.shl1.t0) / 120);
/** the cycle position after a dump: 0 at the dump's start */
const k1 = (w: World) => ((((t1(w) - VIEW.dumpAt) % VIEW.period) + VIEW.period) % VIEW.period);
const afterDump = (w: World) => t1(w) >= VIEW.dumpAt + VIEW.dumpFor && k1(w) >= VIEW.dumpFor && k1(w) < VIEW.dumpFor + 0.8;
const tourRoute = (): Step[] => [
  ...hop(10.4, 'the drain'),
  ...hop(20.7, 'a step up'),
  ...hop(22.7, 'a step up'),
  ...hop(36.6, 'a post'),
  ...hop(39.6, 'a post'),
  ...hop(42.6, 'a post'),
  { hold: 'R', until: X(49.8), max: 900 },
  { hold: 'R', jump: 14, ticks: 14, note: 'hop the parked taxi' },
  { hold: 'R', until: (w) => w.player.onGround && w.player.y > 220, max: 400 },
  { hold: 'R', until: X(63.3), max: 600, note: 'the first drop falls by the pine: it is nothing. Stop short of the cloud' },
  { hold: '', until: afterDump, max: 900, note: 'let the cloud empty once' },
  { hold: 'R', until: X(78.5), max: 600, note: 'under it and out the other side before the next' },
  ...hop(86.4, 'the low wall'),
  { hold: 'R', until: X(92.4), max: 300 },
  { hold: 'R', jump: 12, ticks: 12, note: 'up on the deck' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', until: road(100.5), max: 600, note: 'off the deck' },
  { hold: 'R', until: done, max: 900 },
];

// ------------------------------------------------------------------ SHL-02
type Cloud = { banks: { x: (w: World) => number; w: number; end: number }[]; beams: [number, number][]; lit: (w: World, i: number) => boolean; gap: [number, number]; sun?: { period: number; inFor: number; phase: number; tsec?: (w: World) => number } };
const sunLeft = (w: World, c: Cloud) => {
  if (!c.sun) return 99;
  const t = (c.sun.tsec ? c.sun.tsec(w) : w.tick / 120) + c.sun.phase;
  const k = ((t % c.sun.period) + c.sun.period) % c.sun.period;
  return k >= c.sun.inFor ? c.sun.period - k : 0;
};
/** a beam is good to land on if its thick middle is under it now and stays for `hold` more tiles of drift */
function beamReady(w: World, c: Cloud, i: number, hold: number): boolean {
  const b = c.beams[i];
  return sunLeft(w, c) > 1.4 && c.banks.some((bk) => bk.x(w) + bk.end + hold <= b[0] && bk.x(w) + bk.w - bk.end >= b[1] + 1);
}
/** cross a cloud gap: wait on each floor until the next beam is lit and will stay so, then run to the edge and jump */
function cloudWalk(key: string, far: number): (w: World) => Out {
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
    const noSun = key.endsWith('-nosun');
    const raw = w.flags[noSun ? key.slice(0, -6) : key] as Cloud;
    const c: Cloud = noSun ? { ...raw, sun: undefined } : raw;
    const p = w.player;
    const cx = p.cx / 16;
    if (!p.onGround) return go('R');
    // which floor am I on, and what is next?
    const onBeam = c.beams.findIndex((b) => cx >= b[0] - 0.3 && cx < b[1] + 1.3);
    const next = onBeam < 0 ? (cx < c.gap[0] ? 0 : -1) : onBeam + 1;
    if (next < 0) return go('R');
    const edge = onBeam < 0 ? c.gap[0] : c.beams[onBeam][1] + 1;
    // under a sun that goes in, the whole crossing is decided on the bank: every beam covered for long enough, sun out for long enough
    const whole = onBeam < 0 && c.sun ? sunLeft(w, c) > 4.8 && c.beams.every((_b, i) => beamReady(w, c, i, 2.6)) : true;
    const ready = whole && (next >= c.beams.length ? true : beamReady(w, c, next, 1.6));
    const target = next >= c.beams.length ? far : c.beams[next][0];
    if (!ready) {
      // hold back from the edge, far enough for a run-up (back up if the window closed on you at the edge)
      const back = edge * 16 - 38;
      return go(p.x + p.w > back + 8 ? 'L' : p.x + p.w > back ? '' : 'R');
    }
    if (p.x + p.w >= edge * 16 - 6) {
      jt = target - edge > 3.5 ? 22 : 12;
      return { move: 'R', jump: true };
    }
    return go('R');
  };
}
const room02 = (): Step[] => [{ policy: cloudWalk('shl2', 25), until: and(ground, X(25.5)), max: 3000, note: 'bank, first beam, second beam, far bank: each when lit through the thick middle' }, { hold: 'R', until: X(29), max: 300 }];
const act02 = (x: number): Step[] => [{ policy: cloudWalk('shl2a', x + 25), until: and(ground, X(x + 25.5)), max: 4000, note: 'three beams; the third only when the middle, not the end, is under it' }, { hold: 'R', until: X(x + 30), max: 400 }];
/** the dish: wait outside the swept tiles until a sweep has just gone, then walk in */
const dishPolicy: Policy = (w) => {
  const e = w.flags.shl2e as { x0: number; x1: number; P: number; ON: number; on: (w: World) => boolean };
  const p = w.player;
  const t = ((w.tick / 120) % e.P + e.P) % e.P;
  if (p.cx > e.x0 - 4) return go('R');
  if (p.x + p.w < e.x0 - 30) return go('R');
  return go(t >= e.ON && t < e.P - 1.0 ? 'R' : '');
};

// ------------------------------------------------------------------ SHL-03
/** walk a swaying deck in bursts: go while the swing is low, stand while it is high */
function burstWalk(key: string, beforeWake?: (w: World) => boolean): (w: World) => Out {
  return (w) => {
    const st = w.flags[key.endsWith('-wet') ? key.slice(0, -4) : key] as SwayState;
    const p = w.player;
    const on = st.on(w);
    if (!on) {
      if (beforeWake && beforeWake(w)) return go('');
      return go('R');
    }
    const wet = key.endsWith('-wet');
    if (st.e > (wet ? 0.26 : 0.42)) return go('');
    if (st.e > (wet ? 0.04 : 0.12) && Math.abs(p.vx) < 5) return go('');
    return go('R');
  };
}
/** standing on the tower before the boats' span: wait until a boat's wake has just passed */
const waitBoat = (key: string, spanX0: (w: World) => number) => (w: World) => {
  const st = w.flags[key] as SwayState;
  const p = w.player;
  const wk = st.wakes[0];
  if (!wk) return false;
  if (p.x + p.w < spanX0(w) - 26) return false;
  const t = wk.at(w);
  const hit = wk.period / 2;
  return !(t >= hit + 0.05 && t < hit + 1.6);
};
const room03 = (): Step[] => [{ policy: burstWalk('shl3'), until: and(ground, X(26)), max: 3000, note: 'across the first span in bursts' }, { hold: 'R', until: X(29), max: 300 }];
const act03 = (x: number): Step[] => [
  { policy: burstWalk('shl3'), until: and(ground, X(x + 19.5)), max: 3000, note: 'span two in bursts' },
  { policy: burstWalk('shl3', waitBoat('shl3', () => (x + 23) * 16)), until: and(ground, X(x + 40.5)), max: 5000, note: 'wait on the tower for the boat, then span three in bursts' },
  { hold: 'R', until: X(x + 42), max: 300 },
];
/** the toll bar: the last span in bursts; stop short of the bar until the swing is gone */
const tollbarPolicy: Policy = (w) => {
  const st = w.flags.shl3 as SwayState;
  const e = w.flags.shl3e as { x: number; w: number };
  const p = w.player;
  const out = burstWalk('shl3')(w);
  if (p.x + p.w >= e.x - 28 && p.x < e.x && st.e >= 0.08) return go('');
  return out;
};

// ------------------------------------------------------------------ SHL-04
/** run on and jump at hook column c (so the jump passes through the hook) */
const atHook = (c: number, note: string): Step[] => [
  { hold: 'R', until: X(c - 1.4), max: 900 },
  { hold: 'R', jump: 10, ticks: 10, note },
  { hold: 'R', until: ground, max: 300 },
];
const room04 = (): Step[] => [...atHook(5, 'take the knup'), ...atHook(15, 'hang it up before the branch'), ...atHook(20.5, 'take it again for the awning'), { hold: 'R', until: X(29), max: 900 }];
const act04 = (x: number): Step[] => [
  { hold: 'R', until: X(x + 12), max: 900, note: 'past the hook before the tall arch: keep it on' },
  ...atHook(x + 21.5, 'hang it up before the low arch'),
  ...atHook(x + 26.5, 'take it for the awning'),
  { hold: 'R', until: X(x + 33), max: 900 },
];
const halfdoorPolicy: Policy = (w, m, d) => {
  const D = Math.round(d.x / 16);
  const st = w.flags.shl4 as { on: boolean };
  const p = w.player;
  if (m.hold > 0) {
    m.hold--;
    return { move: 'R', jump: true };
  }
  if (st.on && p.onGround && p.x >= (D - 6 - 1.4) * 16 && !m.jumped) {
    m.hold = 9;
    m.jumped = true;
    return { move: 'R', jump: true };
  }
  return go('R');
};

// ------------------------------------------------------------------ SHL-05
/** cross each fall ahead the moment its water sits on the mark (with time in hand), waiting a tile and a half short of it */
function fordWalk(key: string, onlyUpTo?: number, minLeft = 0.75, from?: number): (w: World) => Out {
  return (w) => {
    const falls = w.flags[key] as Fall[];
    const p = w.player;
    const next = falls.filter((f) => px(f.c0 + 3) > p.x && (onlyUpTo === undefined || f.c0 <= onlyUpTo) && (from === undefined || f.c0 >= from)).sort((a, b) => a.c0 - b.c0)[0];
    if (!next) return go('R');
    const edge = px(next.c0) - 26;
    if (p.x + p.w < edge) return go('R');
    if (p.x + p.w > px(next.c0) - 2) return go('R');
    const ph = next.at(w);
    return go(ph.k === 'mark' && ph.left > minLeft ? 'R' : '');
  };
}
/** the lure: wait for the fall to go dry, then go */
function dryWalk(key: string): (w: World) => Out {
  return (w) => {
    const falls = w.flags[key] as Fall[];
    const p = w.player;
    const next = falls.filter((f) => px(f.c0 + 3) > p.x).sort((a, b) => a.c0 - b.c0)[0];
    if (!next) return go('R');
    if (p.x + p.w < px(next.c0) - 26) return go('R');
    if (p.x + p.w > px(next.c0) - 2) return go('R');
    return go(next.at(w).k === 'dry' ? 'R' : '');
  };
}
/** the basin: both sisters on their marks, then straight through */
function basinWalk(x: number): (w: World) => Out {
  return (w) => {
    const falls = (w.flags.shl5 as Fall[]).filter((f) => f.c0 >= x + 6 && f.c0 <= x + 14).sort((a, b) => a.c0 - b.c0);
    const p = w.player;
    const a = falls[0],
      b = falls[1];
    if (p.x + p.w < px(a.c0) - 26) return go('R');
    if (p.x + p.w > px(a.c0) - 2) return go('R');
    const pa = a.at(w),
      pb = b.at(w);
    const ok = pa.k === 'mark' && pb.k === 'mark' && Math.min(pa.left, pb.left) > 1.0;
    return go(ok ? 'R' : '');
  };
}
const room05 = (): Step[] => [{ policy: fordWalk('shl5', 14), until: and(ground, X(18)), max: 4000, note: 'the first sister: on the mark' }, { hold: 'R', until: X(29), max: 400 }];
const act05 = (x: number): Step[] => [{ policy: fordWalk('shl5', x + 22), until: and(ground, X(x + 26)), max: 6000, note: 'two sisters, each on her mark' }, { hold: 'R', until: X(x + 32), max: 400 }];
const act05b = (x: number): Step[] => [{ policy: basinWalk(x), until: and(ground, X(x + 18)), max: 6000, note: 'both on their marks, then through the basin' }, { hold: 'R', until: X(x + 34), max: 400 }];
/** the quick sister: wait at the very edge (not 26 px back) and go the instant the mark starts */
const quickWalk = (key: string, c0: number): ((w: World) => Out) => (w) => {
  const f = (w.flags[key] as Fall[]).find((q) => q.c0 === c0)!;
  const p = w.player;
  if (p.x + p.w < px(c0) - 10) return go('R');
  if (p.x + p.w > px(c0) - 2) return go('R');
  const ph = f.at(w);
  return go(ph.k === 'mark' && ph.left > 0.3 ? 'R' : '');
};
const act05c = (x: number): Step[] => [
  { policy: fordWalk('shl5', x + 19, 0.75, x + 19), until: and(ground, X(x + 23)), max: 6000, note: 'the hidden sister: on the quiet, not the silence' },
  { policy: quickWalk('shl5', x + 30), until: and(ground, X(x + 34)), max: 6000, note: 'the quick sister from the very edge' },
  { hold: 'R', until: X(x + 38), max: 400 },
];
const poolPolicy: Policy = (w) => fordWalk('shl5')(w);

// ------------------------------------------------------------------ SHL-06
const rootFull = (key: string, i: number, lenPx: number) => (w: World) => ((w.flags[key] as RootSet).roots[i].w >= lenPx - 2);
const upRock: Step[] = [...hop(1.2, 'up on to the rock by the start', 14), { hold: '', until: ground, max: 200 }];
const offRock: Step[] = [...upRock, { hold: 'R', until: and(ground, X(6.4)), max: 400, note: 'down off the rock' }];
const room06 = (): Step[] => [
  ...upRock,
  { hold: '', jump: 9, ticks: 9, note: 'jump at the long guide' },
  { hold: '', until: and(ground, rootFull('shl6', 2, 22 * 16)), max: 1200, note: 'the long root grows to the far rock' },
  { hold: 'R', until: and(ground, X(28.6)), max: 1200, note: 'across, high over the spray, down off the end' },
  { hold: 'R', until: X(29.5), max: 300 },
];
const act06 = (x: number): Step[] => [
  { hold: 'R', until: X(x + 3.8), max: 600, note: 'on to the old root’s tip' },
  { hold: '', until: and(ground, (w) => (w.flags.shl6a as { t0: number }).t0 >= 0 && rootFull('shl6', 0, 0)(w) && w.tick - (w.flags.shl6a as { t0: number }).t0 >= 3.6 * 120), max: 1500, note: 'stand: it sprouts the next span' },
  { hold: 'R', until: and(ground, X(x + 21)), max: 900 },
  { hold: 'R', until: X(x + 28), max: 400 },
];
const act06b = (x: number): Step[] => [...hop(x + 9.9, 'hop the guide in the path', 14), { hold: 'R', until: X(x + 27), max: 900 }];
type Dbl = { near: number; far: number };
const act06c = (x: number): Step[] => [
  ...atHook(x + 4, 'the near guide first'),
  { hold: '', until: (w) => (w.flags.shl6c as Dbl).near >= 0 && w.tick - (w.flags.shl6c as Dbl).near >= 3.6 * 120, max: 1200, note: 'the near root grows half way' },
  ...hop(x + 5.6, 'over the rock', 14),
  { hold: 'R', until: and(ground, X(x + 19.6)), max: 900, note: 'out to its tip' },
  { hold: '', until: (w) => Math.abs(w.player.vx) < 5, max: 60 },
  { hold: '', jump: 10, ticks: 10, note: 'jump at the far guide' },
  { hold: '', until: and(ground, (w) => (w.flags.shl6c as Dbl).far >= 0 && w.tick - (w.flags.shl6c as Dbl).far >= 3.6 * 120), max: 1200, note: 'the far root grows to meet it' },
  { hold: 'R', until: and(ground, X(x + 33)), max: 1200, note: 'across' },
  { hold: 'R', until: X(x + 37), max: 400 },
];
const rootdoorPolicy: Policy = (w, m, d) => {
  const D = Math.round(d.x / 16);
  const set = w.flags.shl6e as RootSet;
  const p = w.player;
  if (m.hold > 0) {
    m.hold--;
    return { move: '', jump: true };
  }
  if (set.chosen < 0) {
    if (p.onGround && p.x >= (D - 12) * 16 - 4) {
      m.hold = 9;
      return { move: '', jump: true };
    }
    return go('R');
  }
  if (set.roots[0].w < 9 * 16 - 2 && p.x + p.w > (D - 10) * 16 - 12) return go('');
  return go('R');
};

// ------------------------------------------------------------------ SHL-07
/** pass each stalactite while it has room to spare (a drip during the crossing still leaves room); wait at its edge otherwise */
function caveWalk(key: string, upTo?: number): (w: World) => Out {
  return (w) => {
    const list = (w.flags[key] as Stal[]).filter((st) => upTo === undefined || st.c <= upTo);
    const p = w.player;
    const next = list.filter((st) => px(st.c) + 16 > p.x).sort((a, b) => a.c - b.c)[0];
    if (!next) return go('R');
    if (p.x + p.w < px(next.c) - 22) return go('R');
    if (p.x + p.w > px(next.c) + 2) return go('R');
    const ok = next.s.shutAt < 0 && next.gap >= FIT + next.s.step + 4;
    return go(ok ? 'R' : '');
  };
}
/** the gallery: wait at the first stalactite until it has just broken (back to the top), then run the whole row */
function galleryRun(x: number): (w: World) => Out {
  let going = false;
  let W: World | null = null;
  return (w) => {
    if (W !== w) {
      W = w;
      going = false;
    }
    const first = (w.flags.shl7 as Stal[]).find((st) => Math.abs(st.c - (x + 6)) < 0.01)!;
    const p = w.player;
    if (going) return go('R');
    if (p.x + p.w < px(first.c) - 22) return go('R');
    if (first.s.shutAt < 0 && first.gap >= first.s.g0 - 1) {
      going = true;
      return go('R');
    }
    return go('');
  };
}
/** the pool: run to the pool's stalactite before the roof comes down, stand there through the shut, go on at the break */
function poolWalk(x: number): (w: World) => Out {
  return (w) => {
    const list = (w.flags.shl7 as Stal[]).filter((st) => st.c >= x + 8 && st.c <= x + 30).sort((a, b) => a.c - b.c);
    const p = w.player;
    const poolX = px(list[3].c) + 8;
    const first = list[0];
    const past = p.cx > px(list[6].c) + 16;
    if (past) return go('R');
    // before the pool: go only if the roof is high enough to reach the pool (4 stalactites, ~1.3 s)
    if (p.cx < poolX - 6) {
      if (p.x + p.w < px(first.c) - 24) return go('R');
      const ok = first.s.shutAt < 0 && first.gap >= FIT + 3 * first.s.step + 4;
      return go(ok ? 'R' : '');
    }
    if (p.cx < poolX + 4) {
      // in the pool: wait for the others to shut and break
      const other = list[4];
      const ok = other.s.shutAt < 0 && other.gap >= other.s.g0 - 1;
      return go(ok ? 'R' : '');
    }
    return go('R');
  };
}
/** the knock: run under the first, bump it (jump), wait under it until the second has just broken, then go */
function knockWalk(x: number): (w: World) => Out {
  let W: World | null = null;
  let phase = 0;
  let jt = 0;
  return (w) => {
    if (W !== w) {
      W = w;
      phase = 0;
      jt = 0;
    }
    const list = (w.flags.shl7 as Stal[]).filter((st) => st.c >= x + 11 && st.c <= x + 15).sort((a, b) => a.c - b.c);
    const [a, b] = list;
    const p = w.player;
    if (jt > 0) {
      jt--;
      return { move: '', jump: true };
    }
    if (phase === 0) {
      // approach the first when it is well open, stop under it
      if (p.x + p.w < px(a.c) - 24) return go('R');
      if (p.cx < px(a.c) + 8 - 7) return go(a.s.shutAt < 0 && a.gap >= FIT + 2 * a.s.step + 4 ? 'R' : '');
      if (Math.abs(p.vx) > 5) return go('');
      phase = 1;
      jt = 10;
      return { move: '', jump: true };
    }
    if (phase === 1) {
      if (!p.onGround) return go('');
      if (a.s.freeze <= 0) {
        // the bump missed (it was already low): try again
        jt = 10;
        return { move: '', jump: true };
      }
      phase = 2;
    }
    // frozen: go when the second has just broken (it is at the top), and once going, keep going
    if (phase === 3 || p.cx > px(b.c) + 16) return go('R');
    const ok = b.s.shutAt < 0 && b.gap >= b.s.g0 - 1 && a.s.freeze > 60;
    if (ok) phase = 3;
    return go(ok ? 'R' : '');
  };
}
/** pairs: bump each, then through at once */
function pairWalk(x: number): (w: World) => Out {
  let W: World | null = null;
  let jt = 0;
  let bumped = new Set<number>();
  return (w) => {
    if (W !== w) {
      W = w;
      jt = 0;
      bumped = new Set();
    }
    const list = (w.flags.shl7 as Stal[]).filter((st) => st.c >= x + 11 && st.c <= x + 23).sort((a, b) => a.c - b.c);
    const p = w.player;
    if (jt > 0) {
      jt--;
      return { move: '', jump: true };
    }
    const next = list.find((st) => px(st.c) + 16 > p.x);
    if (!next) return go('R');
    if (p.x + p.w < px(next.c) - 24) return go('R');
    if (p.cx < px(next.c) + 8 - 7) {
      // approach when it is high and not shut
      return go(next.s.shutAt < 0 && next.gap >= FIT + 2 * next.s.step + 8 ? 'R' : '');
    }
    if (!bumped.has(next.c) && p.onGround) {
      if (Math.abs(p.vx) > 5) return go('');
      bumped.add(next.c);
      jt = 10;
      return { move: '', jump: true };
    }
    return go(p.onGround ? 'R' : '');
  };
}
const act07b = (x: number): Step[] => [{ policy: poolWalk(x), until: and(ground, X(x + 37)), max: 5000, note: 'into the pool before the roof comes down, out at the break' }, { hold: 'R', until: X(x + 38), max: 300 }];
const act07c = (x: number): Step[] => [{ policy: caveWalk('shl7'), until: and(ground, X(x + 33)), max: 6000, note: 'three hidden tips: pass each on its clicks' }, { hold: 'R', until: X(x + 34), max: 300 }];
const act07d = (x: number): Step[] => [{ policy: knockWalk(x), until: and(ground, X(x + 27)), max: 6000, note: 'bump the first, wait under it, go at the second’s break' }, { hold: 'R', until: X(x + 28), max: 300 }];
const act07e = (x: number): Step[] => [{ policy: pairWalk(x), until: and(ground, X(x + 31)), max: 6000, note: 'bump each pair and go through at once' }, { hold: 'R', until: X(x + 32), max: 300 }];
const room07 = (): Step[] => [{ policy: caveWalk('shl7', 22), until: and(ground, X(24)), max: 4000, note: 'three stalactites, each on its own drip' }, { hold: 'R', until: X(29), max: 400 }];
const act07 = (x: number): Step[] => [{ policy: galleryRun(x), until: and(ground, X(x + 33)), max: 5000, note: 'wait for the first to break, then run the gallery' }, { hold: 'R', until: X(x + 34), max: 300 }];
const columnPolicy: Policy = (w) => caveWalk('shl7')(w);

// ------------------------------------------------------------------ SHL-08
/** walk to a column and stand there until the tank is full and its spout (if any) has finished, then walk on */
function tankWait(key: string, standCol: number, spout = true): (w: World) => Out {
  return (w) => {
    const st = w.flags[key] as TankState;
    const p = w.player;
    const ready = st.fullAt >= 0 && (!spout || (w.tick - st.fullAt) / 120 >= SPOUT_FOR + 0.15);
    if (ready) return go('R');
    if (p.cx < px(standCol) - 3) return go('R');
    if (p.cx > px(standCol) + 3) return go('L');
    return go('');
  };
}
const tankFull = (key: string) => (w: World) => (w.flags[key] as TankState).fullAt >= 0;
const room08 = (): Step[] => [{ policy: tankWait('shl8', 3.5), until: and(ground, X(22)), max: 3000, note: 'stand out of reach; the cloud goes home and the tank fills; let the spout finish' }, { hold: 'R', until: X(29), max: 400 }];
const act08a = (x: number): Step[] => [{ policy: tankWait('shl8a', x + 16.5), until: and(ground, X(x + 25)), max: 3000, note: 'under the roof, past the hole' }, { hold: 'R', until: X(x + 29), max: 400 }];
const act08b = (x: number): Step[] => [{ policy: tankWait('shl8b', x + 20.5), until: and(ground, X(x + 28)), max: 3000, note: 'well in under the roof, so the cloud rains on it' }, { hold: 'R', until: X(x + 31), max: 400 }];
const act08c = (x: number): Step[] => [{ policy: tankWait('shl8c', x + 20.5), until: and(ground, X(x + 28)), max: 3000, note: 'under the roof, not under the bucket' }, { hold: 'R', until: X(x + 31), max: 400 }];
const act08d = (x: number): Step[] => [
  { policy: tankWait('shl8d', x + 12.5), until: and(ground, tankFull('shl8d'), (w) => (w.tick - (w.flags.shl8d as TankState).fullAt) / 120 >= SPOUT_FOR + 0.15), max: 3000, note: 'the first tank from under its roof; let its spout finish' },
  { policy: tankWait('shl8e', x + 30.5), until: and(ground, X(x + 40)), max: 3000, note: 'the second from under its roof' },
  { hold: 'R', until: X(x + 43), max: 400 },
];
const tapPolicy: Policy = (w, _m, d) => {
  const D = Math.round(d.x / 16);
  return tankWait('shl8e2', D - 11, false)(w);
};

// ------------------------------------------------------------------ SHL-09
/**
 * walk the market: hop on to a row's counter, walk it, hop every stall that is closed on the day you will be on when
 * you reach it (an arch between you and it turns the day), hop off at the row's end. `dayOf` overrides the day read
 * (a player who trusts a lying board, or forgets the mid-row arch); `ignorePack` walks on to a packed stall.
 */
function marketWalk(key: string, o: { dayOf?: (w: World, real: number) => number; ignoreArchesAfter?: number; ignorePack?: boolean } = {}): (w: World) => Out {
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
    const frozen = key.endsWith('-d1');
    const st = w.flags[frozen ? key.slice(0, -3) : key] as Market;
    const p = w.player;
    if (!p.onGround || w.tick < cool) return go('R');
    const front = p.x + p.w;
    const onCounter = p.y + p.h <= MTOP + 2;
    // the next thing ahead: a closed/packed pitch, a counter start (from the bank), or a counter end (to the bank)
    const dayAt = (xTarget: number) => {
      let day = st.day;
      for (const a of st.arches) if (!a.passed && a.x > p.cx && a.x <= xTarget + 8 && !(o.ignoreArchesAfter !== undefined && a.x > o.ignoreArchesAfter)) day = (day % 8) + 1;
      if (frozen) return 1;
      return o.dayOf ? o.dayOf(w, day) : day;
    };
    const pitches = st.pitches.slice().sort((a, b) => a.x - b.x);
    // closed pitch ahead
    const closedAhead = pitches.find((q) => q.x + q.w > front && (q.plate === dayAt(q.x) || (q.packed && !o.ignorePack)));
    if (closedAhead && closedAhead.x - front <= 16 && closedAhead.x - front >= -6) {
      jt = 26;
      cool = w.tick + 30;
      return { move: 'R', jump: true };
    }
    // a counter's start ahead (from the bank): the first pitch of a row, its x past the drain gap
    const starts = pitches.filter((q) => !pitches.some((r) => Math.abs(r.x + r.w - q.x) < 2));
    const start = starts.find((q) => q.x > front && q.x - front <= 60);
    if (!onCounter && start && start.x - front <= 40) {
      const closedStart = start.plate === dayAt(start.x) || (start.packed && !o.ignorePack);
      if (closedStart && start.x - front > 12) return go('R');
      jt = closedStart ? 26 : 12;
      cool = w.tick + 30;
      return { move: 'R', jump: true };
    }
    // a counter's end (to the bank or over the drain gap)
    const ends = pitches.filter((q) => !pitches.some((r) => Math.abs(q.x + q.w - r.x) < 2));
    const end = ends.find((q) => q.x + q.w > front - 2 && q.x + q.w - front <= 12 && p.cx > q.x);
    if (onCounter && end) {
      jt = 10;
      cool = w.tick + 30;
      return { move: 'R', jump: true };
    }
    return go('R');
  };
}
const room09 = (): Step[] => [{ policy: marketWalk('shl9'), until: and(ground, X(21)), max: 3000, note: 'day one: jump plate 1' }, { hold: 'R', until: X(29), max: 400 }];
const act09a = (x: number): Step[] => [{ policy: marketWalk('shl9'), until: and(ground, X(x + 21)), max: 3000, note: 'day two: jump plate 2' }, { hold: 'R', until: X(x + 24), max: 400 }];
const act09b = (x: number): Step[] => [{ policy: marketWalk('shl9'), until: and(ground, X(x + 42)), max: 5000, note: 'count the arches: days three and four' }, { hold: 'R', until: X(x + 44), max: 400 }];
const act09c = (x: number): Step[] => [{ policy: marketWalk('shl9'), until: and(ground, X(x + 33)), max: 5000, note: 'the mid-row arch: day six beyond it' }, { hold: 'R', until: X(x + 36), max: 400 }];
const act09d = (x: number): Step[] => [{ policy: marketWalk('shl9'), until: and(ground, X(x + 24)), max: 3000, note: 'day seven, and the packed stall' }, { hold: 'R', until: X(x + 27), max: 400 }];
const boardWalk = marketWalk('shl9');
const boardPolicy: Policy = (w) => boardWalk(w);

// ------------------------------------------------------------------ SHL-10
type Drop = { t0: number };
/** the honest drop: stop at the drop, go the moment the rain ends */
const dropWalk = (key: string, c: number): ((w: World) => Out) => (w) => {
  const st = w.flags[key] as Drop;
  const p = w.player;
  const s = st.t0 < 0 ? -9 : (w.tick - st.t0) / 120;
  if (s < 0) return go('R');
  if (s >= 1.15) return go('R');
  if (p.x + p.w >= px(c) - 6) return go('');
  return go('R');
};
type Liar = { c0: number; at: (w: World) => { k: string; left: number } };
/** the liar: cross only while the sheet is narrow (thin), with time in hand */
const liarWalk = (key: string): ((w: World) => Out) => (w) => {
  const st = w.flags[key] as Liar;
  const p = w.player;
  if (p.x + p.w < px(st.c0) - 26) return go('R');
  if (p.x + p.w > px(st.c0) - 2) return go('R');
  const ph = st.at(w);
  return go(ph.k === 'thin' && ph.left > 0.7 ? 'R' : '');
};
/** the liar's mark, read as in 05: cross when the sheet starts at the mark */
const markWalk = (key: string): ((w: World) => Out) => (w) => {
  const st = w.flags[key] as Liar;
  const p = w.player;
  if (p.x + p.w < px(st.c0) - 26) return go('R');
  if (p.x + p.w > px(st.c0) - 2) return go('R');
  return go(st.at(w).k === 'mark' ? 'R' : '');
};
const dryLiar = (key: string): ((w: World) => Out) => (w) => {
  const st = w.flags[key] as Liar;
  const p = w.player;
  if (p.x + p.w < px(st.c0) - 26) return go('R');
  if (p.x + p.w > px(st.c0) - 2) return go('R');
  return go(st.at(w).k === 'dry' ? 'R' : '');
};
/** the span of stalls: market reads for the plates, bursts for the deck */
function spanWalk(mkey: string, skey: string): (w: World) => Out {
  const mw = marketWalk(mkey);
  return (w) => {
    const sw = w.flags[skey] as { e: number } | undefined;
    const out = mw(w);
    if (!sw || out.jump) return out;
    const p = w.player;
    const onDeck = p.onGround && p.y + p.h <= MTOP + 2;
    if (onDeck && sw.e > 0.4) return go('');
    if (onDeck && sw.e > 0.06 && Math.abs(p.vx) < 5) return go('');
    return out;
  };
}
const room10 = (): Step[] => [
  { policy: dropWalk('shl10d', 9), until: and(ground, X(15)), max: 1500, note: 'stop at the drop; go when the rain ends' },
  { hold: 'R', until: X(22.5), max: 900, note: 'past the hook, bare, under the branch' },
  ...atHook(24, 'the knup for the awning'),
  { hold: 'R', until: X(29), max: 600 },
];
const act10a = (x: number): Step[] => [{ policy: liarWalk('shl10l'), until: and(ground, X(x + 21)), max: 4000, note: 'the liar: cross on the narrow sheet' }, { hold: 'R', until: X(x + 28), max: 400 }];
const act10b = (x: number): Step[] => [
  { hold: 'R', until: X(x + 5.6), max: 600, note: 'under the pole’s tip' },
  { hold: '', until: (w) => Math.abs(w.player.vx) < 5, max: 60 },
  { hold: '', jump: 9, ticks: 9, note: 'jump at the pole’s tip' },
  { hold: '', until: and(ground, (w) => (w.flags.shl10r as { far: number }).far >= 0 && w.tick - (w.flags.shl10r as { far: number }).far >= 3.6 * 120), max: 1200, note: 'the root grows from the far bank' },
  { hold: 'R', until: and(ground, X(x + 26)), max: 1200, note: 'across, under the hanging guide (never touched)' },
  { hold: 'R', until: X(x + 30), max: 400 },
];
const act10c = (x: number): Step[] => [{ policy: spanWalk('shl10m', 'shl10s'), until: and(ground, X(x + 33)), max: 6000, note: 'the stalls on the span: bursts, plates, the mid arch' }, { hold: 'R', until: X(x + 42), max: 600 }];
const tallgatePolicy: Policy = (w, m, d) => {
  const D = Math.round(d.x / 16);
  const st = w.flags.shl10e as { on: boolean };
  const p = w.player;
  if (m.hold > 0) {
    m.hold--;
    return { move: 'R', jump: true };
  }
  if (!st.on && p.onGround && p.x >= (D - 8 - 1.4) * 16 && !m.jumped) {
    m.hold = 9;
    m.jumped = true;
    return { move: 'R', jump: true };
  }
  return go('R');
};

// ------------------------------------------------------------------ tables
function solutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  S['SHL-01'] = tourRoute();
  S['SHL-02'] = room02();
  lengthen('SHL-02', 0, []);
  S['SHL-03'] = room03();
  lengthen('SHL-03', 0, []);
  S['SHL-04'] = room04();
  lengthen('SHL-04', 0, []);
  S['SHL-05'] = room05();
  lengthen('SHL-05', 0, []);
  S['SHL-06'] = room06();
  lengthen('SHL-06', 0, []);
  S['SHL-07'] = room07();
  lengthen('SHL-07', 0, []);
  S['SHL-08'] = room08();
  lengthen('SHL-08', 0, []);
  S['SHL-09'] = room09();
  lengthen('SHL-09', 0, []);
  S['SHL-10'] = room10();
  lengthen('SHL-10', 0, []);
}

const upTo = (n: number) => tourRoute().slice(0, n);
const runOn: Step[] = [{ hold: 'R', until: done, max: 5000 }];
const naive: Record<string, { steps: Step[]; cause?: string }> = {
  'SHL-01': { steps: [...upTo(21), { hold: 'R', until: done, max: 2400, note: 'run on under the cloud' }], cause: 'shl-slap' },
  'SHL-02': { steps: runOn, cause: 'shl-edge' },
  'SHL-03': { steps: runOn, cause: 'shl-sway' },
  'SHL-04': { steps: runOn, cause: 'shl-slap' },
  'SHL-05': { steps: runOn, cause: 'shl-um' },
  'SHL-06': { steps: [...offRock, { hold: 'R', until: X(11.6), max: 600 }, { hold: 'R', jump: 22, ticks: 22, note: 'jump the gorge' }, { hold: 'R', until: done, max: 900 }], cause: 'shl-gorge' },
  'SHL-07': { steps: runOn, cause: 'shl-shut' },
  'SHL-08': { steps: runOn, cause: 'shl-soaked' },
  'SHL-09': { steps: runOn, cause: 'shl-nala' },
  'SHL-10': { steps: runOn, cause: 'shl-truedrop' },
};
const fix: Record<string, { steps: Step[]; cause?: string }> = {
  'SHL-01': { steps: [...upTo(21), { hold: 'R', until: X(64), max: 600 }, { hold: '', until: done, max: 1500, note: 'stand outside the cloud and wait' }], cause: 'shl-lyoh' },
  'SHL-02': { steps: [{ hold: 'R', until: X(8.6), max: 600 }, { hold: 'R', jump: 12, ticks: 12, note: 'hop over the thin end on to the lit beam' }, { hold: 'R', until: done, max: 2400, note: 'and run on along the cloud' }], cause: 'shl-dum' },
  'SHL-03': {
    steps: [{ policy: burstWalk('shl3'), until: and(ground, X(26)), max: 3000 }, { hold: 'R', until: X(29), max: 300 }, { policy: burstWalk('shl3'), until: done, max: 9000, note: 'bursts all the way, boat or no boat' }],
    cause: 'shl-wake',
  },
  'SHL-04': { steps: [...atHook(5, 'take the knup'), { hold: 'R', until: done, max: 2400, note: 'and keep it on' }], cause: 'shl-dieng' },
  'SHL-05': { steps: [{ policy: dryWalk('shl5'), until: done, max: 4000, note: 'wait for the bed to run dry, then go' }], cause: 'shl-wah' },
  'SHL-06': { steps: [...offRock, ...atHook(8.5, 'the first guide: the short root'), { hold: '', until: and(ground, rootFull('shl6', 0, 12 * 16)), max: 1200, note: 'wait for it' }, { hold: 'R', until: done, max: 1500, note: 'across, into the spray' }], cause: 'shl-spray' },
  'SHL-07': { steps: [{ hold: 'R', until: X(14.4), max: 600, note: 'stop under the quick one to count its drips' }, { hold: '', until: done, max: 1500 }], cause: 'shl-maw' },
  'SHL-08': { steps: [{ policy: tankWait('shl8', 3.5, false), until: done, max: 3000, note: 'stand out of reach, and go the moment the gate lifts' }], cause: 'shl-spout' },
  'SHL-09': { steps: [{ policy: marketWalk('shl9', { dayOf: () => 99 }), until: done, max: 3000, note: 'hop on, walk the counter, never mind the plates' }], cause: 'shl-closed' },
  'SHL-10': { steps: [{ hold: 'R', until: X(8), max: 600 }, { hold: '', until: done, max: 1500, note: 'stop at the drop and keep waiting for a beat, as in the tour' }], cause: 'shl-lyoh' },
};
const ROOMS: Record<string, () => Step[]> = { 'SHL-02': room02, 'SHL-03': room03, 'SHL-04': room04, 'SHL-05': room05, 'SHL-06': room06, 'SHL-07': room07, 'SHL-08': room08, 'SHL-09': room09, 'SHL-10': room10 };
const ACT_ORDER: Record<string, string[]> = { 'SHL-02': ['shl02-sngi', 'shl02-lyoh'], 'SHL-03': ['shl03-wake', 'shl03-wet'], 'SHL-04': ['shl04-iew', 'shl04-khynnah'], 'SHL-05': ['shl05-ar', 'shl05-pung', 'shl05-roar'], 'SHL-06': ['shl06-sprout', 'shl06-double', 'shl06-kiang'], 'SHL-07': ['shl07-krem', 'shl07-pool', 'shl07-plop', 'shl07-knock', 'shl07-pairs'], 'SHL-08': ['shl08-roof', 'shl08-pull', 'shl08-bucket', 'shl08-two'], 'SHL-09': ['shl09-sngi', 'shl09-kot', 'shl09-pdeng', 'shl09-doh'], 'SHL-10': ['shl10-rong', 'shl10-jingkieng', 'shl10-pung'] };
const actX0 = (id: string, act: string) => LEVEL_BY_ID.get(id)!.parts!.find((p) => p.kind === act)!.x0;
const prefix = (id: string, act: string): Step[] => [...ROOMS[id](), ...ACT_ORDER[id].slice(0, ACT_ORDER[id].indexOf(act)).flatMap((a) => actRoutes[a](actX0(id, a)))];
/** the stage up to the act (route), then `steps` played from the act's first column; built when the test runs */
const inAct = (id: string, act: string, what: string, steps: (x: number) => Step[], cause?: string) => ({
  what,
  get steps(): Step[] {
    return [...prefix(id, act), ...steps(actX0(id, act))];
  },
  cause,
});
const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {
  'SHL-02': [
    inAct('SHL-02', 'shl02-sngi', 'jump to the third beam the moment it looks lit (the bank’s end is under it)', (x) => [
      { policy: cloudWalk('shl2a', x + 25), until: and(ground, X(x + 14)), max: 3000, note: 'to the second beam' },
      { hold: '', until: (w) => (w.flags.shl2a as Cloud).banks.some((bk) => bk.x(w) + bk.w > x + 19 && bk.x(w) + bk.w - bk.end < x + 22), max: 2000, note: 'the end of the bank reaches the third beam, lit' },
      { hold: 'R', until: X(x + 16.4), max: 300 },
      { hold: 'R', jump: 12, ticks: 12 },
      { hold: 'R', until: done, max: 600 },
    ], 'shl-edge'),
    inAct('SHL-02', 'shl02-lyoh', 'cross as before, bank only, never mind the sun', (x) => [{ policy: cloudWalk('shl2b-nosun', x + 21), until: done, max: 5000 }], 'shl-dum'),
  ],
  'SHL-03': [
    inAct('SHL-03', 'shl03-wake', 'run span three the moment the boat has gone under the tower (bursts forgotten in the hurry)', (x) => [
      { policy: burstWalk('shl3'), until: and(ground, X(x + 19.5)), max: 3000 },
      { hold: '', until: (w) => { const wk = (w.flags.shl3 as SwayState).wakes[0]; const t = wk.at(w); return t > wk.period / 2 + 0.2 && t < wk.period / 2 + 0.5; }, max: 2000, note: 'the wake has just passed' },
      { hold: 'R', until: done, max: 1500 },
    ], 'shl-sway'),
    inAct('SHL-03', 'shl03-wet', 'the same bursts as on the dry spans', () => [{ policy: burstWalk('shl3'), until: done, max: 4000 }], 'shl-slip'),
  ],
  'SHL-04': [
    inAct('SHL-04', 'shl04-iew', 'hang the knup up at the hook before the tall arch, as before the branch', (x) => [...atHook(x + 10.5, 'the lure'), { hold: 'R', until: done, max: 1500 }], 'shl-slap'),
    inAct('SHL-04', 'shl04-khynnah', 'keep the small knup on into the heavy rain', (x) => [...atHook(x + 5, 'swap to the small knup'), { hold: 'R', until: done, max: 1500 }], 'shl-slap'),
    inAct('SHL-04', 'shl04-khynnah', 'keep the big knup through the school lane', () => [{ hold: 'R', until: done, max: 1500 }], 'shl-lintel'),
  ],
  'SHL-05': [
    inAct('SHL-05', 'shl05-ar', 'go as the second sister starts to thin', (x) => [
      { policy: fordWalk('shl5', x + 7), until: and(ground, X(x + 11)), max: 4000 },
      { hold: 'R', until: X(x + 19.5), max: 600 },
      { hold: '', until: (w) => (w.flags.shl5 as Fall[]).find((f) => f.c0 === x + 22)!.at(w).k === 'fade', max: 1500 },
      { hold: 'R', until: done, max: 600 },
    ], 'shl-um'),
    inAct('SHL-05', 'shl05-pung', 'cross the basin when the nearer sister is on her mark, never mind the far one', (x) => [
      { hold: 'R', until: X(x + 3), max: 600 },
      { hold: '', until: (w) => { const f = (w.flags.shl5 as Fall[]).find((q) => q.c0 === x + 6)!.at(w); const g = (w.flags.shl5 as Fall[]).find((q) => q.c0 === x + 14)!.at(w); return f.k === 'mark' && g.k !== 'mark'; }, max: 3000 },
      { hold: 'R', until: done, max: 900 },
    ], 'shl-pung'),
    inAct('SHL-05', 'shl05-roar', 'cross the hidden sister when her roar stops (the silence is the dry lure)', (x) => [{ policy: dryWalk('shl5'), until: done, max: 6000 }], 'shl-wah'),
    inAct('SHL-05', 'shl05-roar', 'the quick sister from a stop back from the edge, as the others', (x) => [{ policy: fordWalk('shl5', x + 19, 0.75, x + 19), until: and(ground, X(x + 23)), max: 6000 }, { policy: fordWalk('shl5', x + 30, 0.3, x + 30), until: done, max: 6000 }], 'shl-um'),
  ],
  'SHL-06': [
    inAct('SHL-06', 'shl06-sprout', 'jump the second gorge like the first', (x) => [{ hold: 'R', until: X(x + 4.6), max: 600 }, { hold: 'R', jump: 22, ticks: 22 }, { hold: 'R', until: done, max: 900 }], 'shl-gorge'),
    { what: 'the middle guide: its root gives up half way', steps: [...offRock, { hold: 'R', until: X(9.9), max: 400 }, { hold: '', until: (w) => Math.abs(w.player.vx) < 5, max: 60 }, { hold: '', jump: 8, ticks: 8, note: 'the middle guide' }, { hold: 'R', until: ground, max: 300 }, { hold: '', until: and(ground, (w) => (w.flags.shl6 as RootSet).roots[1].w >= 12 * 16 * 0.55 - 2), max: 1200 }, { hold: 'R', until: done, max: 1500 }], cause: 'shl-gorge' },
    inAct('SHL-06', 'shl06-kiang', 'walk into the guide in the path', () => [{ hold: 'R', until: done, max: 1500 }], 'shl-jri'),
    inAct('SHL-06', 'shl06-double', 'grow the near root and walk off its tip (it stops half way)', (x) => [...atHook(x + 4, 'the near guide'), { hold: '', until: (w) => (w.flags.shl6c as Dbl).near >= 0 && w.tick - (w.flags.shl6c as Dbl).near >= 3.6 * 120, max: 1200 }, ...hop(x + 5.6, 'over the rock', 14), { hold: 'R', until: done, max: 1500 }], 'shl-gorge'),
    inAct('SHL-06', 'shl06-double', 'the far guide first, from the high rock, then the near one', (x) => [...hop(x + 5.6, 'up on the rock', 14), { hold: '', until: ground, max: 200 }, { hold: 'R', until: X(x + 7.2), max: 300 }, { hold: '', until: (w) => Math.abs(w.player.vx) < 5, max: 60 }, { hold: '', jump: 10, ticks: 10, note: 'the far guide, out of order' }, { hold: '', until: ground, max: 300 }, { hold: 'L', until: and(ground, (w) => w.player.y > 220 && w.player.x <= (x + 6.5) * 16), max: 900, note: 'back down off the rock' }, { hold: 'L', until: (w) => w.player.x <= (x + 2.5) * 16, max: 600 }, ...atHook(x + 4, 'now the near guide'), { hold: '', until: (w) => (w.flags.shl6c as Dbl).near >= 0 && w.tick - (w.flags.shl6c as Dbl).near >= 3.6 * 120, max: 1200 }, ...hop(x + 5.6, 'over the rock', 14), { hold: 'R', until: done, max: 1500 }], 'shl-jri'),
  ],
  'SHL-07': [
    inAct('SHL-07', 'shl07-krem', 'stop under the fourth stalactite of the gallery to count', (x) => [{ policy: galleryRun(x), until: X(x + 16.2), max: 3000 }, { hold: '', until: done, max: 1500 }], 'shl-maw'),
    inAct('SHL-07', 'shl07-pool', 'run the storm stretch', () => runOn, 'shl-maw'),
    inAct('SHL-07', 'shl07-pool', 'wait at the mouth for the roof to come down, then run (into the shut row)', (x) => [{ hold: 'R', until: X(x + 5), max: 900 }, { hold: '', until: (w) => (w.flags.shl7 as Stal[]).some((st) => st.c > x + 7 && st.c < x + 10 && st.s.shutAt >= 0), max: 3000 }, { hold: 'R', until: done, max: 1500 }], 'shl-shut'),
    inAct('SHL-07', 'shl07-plop', 'run past the pillars', () => runOn, 'shl-shut'),
    inAct('SHL-07', 'shl07-plop', 'stand under the second pillar’s stalactite while it plops (nearly down)', (x) => [{ policy: caveWalk('shl7', x + 10), until: and(ground, X(x + 13)), max: 3000 }, { hold: 'R', until: X(x + 15.5), max: 900 }, { hold: '', until: (w) => { const b = (w.flags.shl7 as Stal[]).find((st) => Math.abs(st.c - (x + 18)) < 0.01)!; return b.s.shutAt < 0 && b.gap >= b.s.g0 - 1; }, max: 3000, note: 'it has just broken' }, { hold: 'R', until: X(x + 17.9), max: 900 }, { hold: '', until: done, max: 2000 }], 'shl-maw'),
    inAct('SHL-07', 'shl07-knock', 'run through the pair', () => runOn, 'shl-shut'),
    inAct('SHL-07', 'shl07-knock', 'bump the first, then wait under the second for its break', (x) => [{ policy: knockWalk(x), until: (w) => (w.flags.shl7 as Stal[]).find((st) => Math.abs(st.c - (x + 12)) < 0.01)!.s.freeze > 0, max: 3000 }, { hold: '', until: ground, max: 200 }, { hold: '', until: (w) => { const b = (w.flags.shl7 as Stal[]).find((st) => Math.abs(st.c - (x + 14.5)) < 0.01)!; return b.s.shutAt < 0 && b.gap >= b.s.g0 - 1; }, max: 3000, note: 'the second has just broken' }, { hold: 'R', until: X(x + 14.4), max: 600 }, { hold: '', until: done, max: 2000 }], 'shl-maw'),
    inAct('SHL-07', 'shl07-pairs', 'run the pairs', () => runOn, 'shl-shut'),
    inAct('SHL-07', 'shl07-pairs', 'bump the first and wait under it, as the knock taught', (x) => [{ hold: 'R', until: X(x + 11.9), max: 900 }, { hold: '', until: (w) => Math.abs(w.player.vx) < 5, max: 60 }, { hold: '', jump: 10, ticks: 10 }, { hold: '', until: done, max: 1500 }], 'shl-stump'),
  ],
  'SHL-08': [
    inAct('SHL-08', 'shl08-roof', 'walk to the gate and wait for it', () => runOn, 'shl-soaked'),
    inAct('SHL-08', 'shl08-roof', 'stand under the near end of the roof (the hole)', (x) => [{ policy: tankWait('shl8a', x + 12.5), until: done, max: 3000 }], 'shl-leak'),
    inAct('SHL-08', 'shl08-pull', 'stand out of reach, as in the room', (x) => [{ hold: 'R', until: X(x + 6), max: 900 }, { hold: '', ticks: 900 }, { hold: 'R', until: done, max: 3000, note: 'nothing filled: on to the gate' }], 'shl-soaked'),
    inAct('SHL-08', 'shl08-pull', 'stand under the roof’s edge', (x) => [{ policy: tankWait('shl8b', x + 16.5), until: done, max: 3000 }], 'shl-runoff'),
    inAct('SHL-08', 'shl08-bucket', 'walk to the gate and wait', () => runOn, 'shl-soaked'),
    inAct('SHL-08', 'shl08-bucket', 'stand on the one out-of-reach spot, under the bucket', (x) => [{ policy: tankWait('shl8c', x + 4.8), until: done, max: 3000 }], 'shl-bucket'),
    inAct('SHL-08', 'shl08-two', 'walk to the gate and wait', () => runOn, 'shl-soaked'),
    inAct('SHL-08', 'shl08-two', 'run for the second roof the moment the first tank fills', (x) => [{ policy: tankWait('shl8d', x + 12.5, false), until: done, max: 3000 }], 'shl-spout'),
  ],
  'SHL-09': [
    inAct('SHL-09', 'shl09-sngi', 'jump yesterday’s stall again (plate 1)', () => [{ policy: marketWalk('shl9', { dayOf: () => 1 }), until: done, max: 3000 }], 'shl-closed'),
    inAct('SHL-09', 'shl09-sngi', 'walk off the counter’s end without hopping the drain', (x) => [{ policy: marketWalk('shl9'), until: X(x + 17), max: 3000 }, { hold: 'R', until: done, max: 600 }], 'shl-nala'),
    inAct('SHL-09', 'shl09-kot', 'the boards are blank: keep the last day you read (two)', () => [{ policy: marketWalk('shl9', { dayOf: () => 2 }), until: done, max: 5000 }], 'shl-closed'),
    inAct('SHL-09', 'shl09-kot', 'count the first blank arch, forget the second', (x) => [{ policy: marketWalk('shl9', { dayOf: () => 3 }), until: done, max: 5000 }], 'shl-closed'),
    inAct('SHL-09', 'shl09-pdeng', 'read the board at the start (five) and keep it past the mid-row arch', (x) => [{ policy: marketWalk('shl9', { ignoreArchesAfter: (x + 10) * 16, dayOf: (w, d) => Math.min(d, 5) }), until: done, max: 5000 }], 'shl-shift'),
    inAct('SHL-09', 'shl09-pdeng', 'read the row for day six from the start (it is still five before the arch)', () => [{ policy: marketWalk('shl9', { dayOf: () => 6 }), until: done, max: 5000 }], 'shl-closed'),
    inAct('SHL-09', 'shl09-doh', 'jump today’s plate and walk on to the packed stall', () => [{ policy: marketWalk('shl9', { ignorePack: true }), until: done, max: 3000 }], 'shl-pack'),
    inAct('SHL-09', 'shl09-doh', 'walk the counter, never mind the plates', () => [{ policy: marketWalk('shl9', { dayOf: () => 99, ignorePack: true }), until: done, max: 3000 }], 'shl-closed'),
  ],
  'SHL-10': [
    { what: 'take the knup at the first hook, as the Knup stage taught', steps: [{ policy: dropWalk('shl10d', 9), until: and(ground, X(15)), max: 1500 }, ...atHook(17, 'take it'), { hold: 'R', until: done, max: 1500 }], cause: 'shl-lintel' },
    { what: 'bare all the way down the lane', steps: [{ policy: dropWalk('shl10d', 9), until: and(ground, X(15)), max: 1500 }, { hold: 'R', until: done, max: 1500 }], cause: 'shl-drip' },
    inAct('SHL-10', 'shl10-rong', 'cross the second sister on her mark, as the Seven Sisters taught', () => [{ policy: markWalk('shl10l'), until: done, max: 4000 }], 'shl-liar'),
    inAct('SHL-10', 'shl10-rong', 'wait for her to run dry', () => [{ policy: dryLiar('shl10l'), until: done, max: 4000 }], 'shl-wah'),
    inAct('SHL-10', 'shl10-jingkieng', 'jump at the hanging guide and wait, as the Root Guide taught, then walk', (x) => [...atHook(x + 10, 'the hanging guide'), { hold: '', ticks: 300, note: 'wait for the root' }, { hold: 'R', until: done, max: 1500, note: 'the root is at head height, and the floor is not there' }], 'shl-gorge'),
    inAct('SHL-10', 'shl10-jingkieng', 'jump the gorge from under the hanging guide (it grows into you as you take off)', (x) => [{ hold: 'R', until: X(x + 10.6), max: 600 }, { hold: 'R', jump: 24, ticks: 24 }, { hold: 'R', until: done, max: 900 }], 'shl-jri'),
    inAct('SHL-10', 'shl10-pung', 'run the span of stalls (plates read right)', () => [{ policy: marketWalk('shl10m'), until: done, max: 6000 }], 'shl-sway'),
    inAct('SHL-10', 'shl10-pung', 'bursts, but keep the day of the first arch past the arch in the middle', (x) => [{ policy: spanWalk('shl10m-d1', 'shl10s'), until: done, max: 6000 }], 'shl-shift'),
  ],
};
const actRoutes: Record<string, (x: number) => Step[]> = {
  'shl10-rong': act10a,
  'shl10-jingkieng': act10b,
  'shl10-pung': act10c,
  'shl09-sngi': act09a,
  'shl09-kot': act09b,
  'shl09-pdeng': act09c,
  'shl09-doh': act09d,
  'shl08-roof': act08a,
  'shl08-pull': act08b,
  'shl08-bucket': act08c,
  'shl08-two': act08d,
  'shl07-krem': act07,
  'shl07-pool': act07b,
  'shl07-plop': act07c,
  'shl07-knock': act07d,
  'shl07-pairs': act07e,
  'shl06-sprout': act06,
  'shl06-kiang': act06b,
  'shl05-ar': act05,
  'shl05-pung': act05b,
  'shl05-roar': act05c,
  'shl06-double': act06c,
  'shl02-sngi': act02,
  'shl02-lyoh': (x) => [{ policy: cloudWalk('shl2b', x + 21), until: and(ground, X(x + 21.5)), max: 5000, note: 'beam to beam with the sun out and time in hand' }, { hold: 'R', until: X(x + 28), max: 400 }],
  'shl03-wake': act03,
  'shl03-wet': (x) => [{ policy: burstWalk('shl3-wet'), until: and(ground, X(x + 26.5)), max: 4000, note: 'the wet span: stop early, stand long' }, { hold: 'R', until: X(x + 28), max: 300 }],
  'shl04-iew': act04,
  'shl04-khynnah': (x) => [...atHook(x + 5, 'swap to the small knup'), ...atHook(x + 18.5, 'swap back to a big one before the rain'), { hold: 'R', until: X(x + 30), max: 900 }],
};
const endingPolicies: Record<string, Policy> = {
  'shl-dish': dishPolicy,
  'shl-tollbar': tollbarPolicy,
  'shl-halfdoor': halfdoorPolicy,
  'shl-pool': poolPolicy,
  'shl-rootdoor': rootdoorPolicy,
  'shl-column': columnPolicy,
  'shl-tap': tapPolicy,
  'shl-board': boardPolicy,
  'shl-tallgate': tallgatePolicy,
};

export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  fair: ['SHL-02', 'SHL-03', 'SHL-04', 'SHL-05', 'SHL-06', 'SHL-07', 'SHL-08', 'SHL-09', 'SHL-10'],
};
