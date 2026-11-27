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
type Cloud = { banks: { x: (w: World) => number; w: number; end: number }[]; beams: [number, number][]; lit: (w: World, i: number) => boolean; gap: [number, number]; sun?: { period: number; inFor: number; phase: number } };
const sunLeft = (w: World, c: Cloud) => {
  if (!c.sun) return 99;
  const k = (((w.tick / 120 + c.sun.phase) % c.sun.period) + c.sun.period) % c.sun.period;
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
function fordWalk(key: string, onlyUpTo?: number): (w: World) => Out {
  return (w) => {
    const falls = w.flags[key] as Fall[];
    const p = w.player;
    const next = falls.filter((f) => px(f.c0 + 3) > p.x && (onlyUpTo === undefined || f.c0 <= onlyUpTo)).sort((a, b) => a.c0 - b.c0)[0];
    if (!next) return go('R');
    const edge = px(next.c0) - 26;
    if (p.x + p.w < edge) return go('R');
    if (p.x + p.w > px(next.c0) - 2) return go('R');
    const ph = next.at(w);
    return go(ph.k === 'mark' && ph.left > 0.75 ? 'R' : '');
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
const room07 = (): Step[] => [{ policy: caveWalk('shl7', 22), until: and(ground, X(24)), max: 4000, note: 'three stalactites, each on its own drip' }, { hold: 'R', until: X(29), max: 400 }];
const act07 = (x: number): Step[] => [{ policy: galleryRun(x), until: and(ground, X(x + 33)), max: 5000, note: 'wait for the first to break, then run the gallery' }, { hold: 'R', until: X(x + 34), max: 300 }];
const columnPolicy: Policy = (w) => caveWalk('shl7')(w);

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
  for (const n of [8, 9, 10]) {
    S[`SHL-${String(n).padStart(2, '0')}`] = [{ hold: 'R', until: done, max: 1200, note: 'not built yet' }];
  }
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
};
const ROOMS: Record<string, () => Step[]> = { 'SHL-02': room02, 'SHL-03': room03, 'SHL-04': room04, 'SHL-05': room05, 'SHL-06': room06, 'SHL-07': room07 };
const ACT_ORDER: Record<string, string[]> = { 'SHL-02': ['shl02-sngi', 'shl02-lyoh'], 'SHL-03': ['shl03-wake', 'shl03-wet'], 'SHL-04': ['shl04-iew', 'shl04-khynnah'], 'SHL-05': ['shl05-ar', 'shl05-pung'], 'SHL-06': ['shl06-sprout', 'shl06-kiang'], 'SHL-07': ['shl07-krem'] };
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
    inAct('SHL-03', 'shl03-wake', 'stand still on the boats’ span while the boat comes', (x) => [
      { policy: burstWalk('shl3'), until: and(ground, X(x + 19.5)), max: 3000 },
      { policy: burstWalk('shl3'), until: and(ground, X(x + 30)), max: 3000 },
      { hold: '', until: done, max: 1500 },
    ], 'shl-wake'),
    inAct('SHL-03', 'shl03-wet', 'the same bursts as on the dry spans', () => [{ policy: burstWalk('shl3'), until: done, max: 4000 }], 'shl-slip'),
  ],
  'SHL-04': [
    inAct('SHL-04', 'shl04-iew', 'hang the knup up at the hook before the tall arch, as before the branch', (x) => [...atHook(x + 10.5, 'the lure'), { hold: 'R', until: done, max: 1500 }], 'shl-slap'),
    { what: 'take the knup and never hang it up', steps: [...atHook(5, ''), { hold: 'R', until: done, max: 2400 }], cause: 'shl-dieng' },
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
  ],
  'SHL-06': [
    inAct('SHL-06', 'shl06-sprout', 'jump the second gorge like the first', (x) => [{ hold: 'R', until: X(x + 4.6), max: 600 }, { hold: 'R', jump: 22, ticks: 22 }, { hold: 'R', until: done, max: 900 }], 'shl-gorge'),
    { what: 'the middle guide: its root gives up half way', steps: [...offRock, { hold: 'R', until: X(9.9), max: 400 }, { hold: '', until: (w) => Math.abs(w.player.vx) < 5, max: 60 }, { hold: '', jump: 8, ticks: 8, note: 'the middle guide' }, { hold: 'R', until: ground, max: 300 }, { hold: '', until: and(ground, (w) => (w.flags.shl6 as RootSet).roots[1].w >= 12 * 16 * 0.55 - 2), max: 1200 }, { hold: 'R', until: done, max: 1500 }], cause: 'shl-gorge' },
    inAct('SHL-06', 'shl06-kiang', 'walk into the guide in the path', () => [{ hold: 'R', until: done, max: 1500 }], 'shl-jri'),
  ],
  'SHL-07': [
    inAct('SHL-07', 'shl07-krem', 'stop under the fourth stalactite of the gallery to count', (x) => [{ policy: galleryRun(x), until: X(x + 16.2), max: 3000 }, { hold: '', until: done, max: 1500 }], 'shl-maw'),
  ],
};
const actRoutes: Record<string, (x: number) => Step[]> = {
  'shl07-krem': act07,
  'shl06-sprout': act06,
  'shl06-kiang': act06b,
  'shl05-ar': act05,
  'shl05-pung': act05b,
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
};

export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  fair: ['SHL-02', 'SHL-03', 'SHL-04', 'SHL-05', 'SHL-06', 'SHL-07'],
};
