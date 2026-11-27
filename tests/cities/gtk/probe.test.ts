// GTK's probes (round 2), after TVM's (tests/cities/tvm/probe.test.ts on city/tvm). Runs only when asked:
//   LDD_GTKPROBE=1 LDD_IDS=GTK-06,GTK-07 npx vitest run tests/cities/gtk/probe.test.ts --silent=false
// deaths: probe b, every scripted death (NAIVE, FIX, each act's) as cause @ tick, per act.
// lags: at lag 0, 6 and 12, the checkpoints, longest stretch, worst replay to a trap (branching off the route every
//   0.25 s: stop / run on / run+jump), idle 4 s / run 0.3 s then idle / tap-jump then idle from each checkpoint, and
//   any live deadly box within 3.5 tiles of Dad at the tick a checkpoint is taken (mid-hazard capture).
import { it } from 'vitest';
import { LEVELS } from '../../../src/game/levels';
import { SOLUTIONS } from '../../solutions';
import { World, type InputState } from '../../../src/game/world';
import { incoming, windOn, type Step } from '../../runner';
import { INFO } from '../../helpers';
type Move = 'L' | 'R' | '';
type Out = { move: Move; jump: boolean };
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lagged(id: string, steps: Step[], lag: number, idle: number) {
  const def = LEVELS.find((l) => l.id === id)!;
  const w = new World(def, INFO);
  def.build?.(w);
  const none: InputState = { left: false, right: false, jump: false, jumpPressed: false };
  // left and right go down `lag` ticks after the route presses them and come up as soon as it lets go;
  // a jump goes down `lag` ticks late and is held just as long as the route held it
  const keys = ['left', 'right'] as const;
  const want: Record<string, number> = { left: -1, right: -1 };
  const down: Record<string, boolean> = { left: false, right: false };
  // a short press (a nudge, a step off) still happens in full, just late
  const pressed: Record<string, number> = { left: -1, right: -1 };
  const until: Record<string, number> = { left: -1, right: -1 };
  const jumps: { at: number; len: number }[] = [];
  let routeJump = false;
  let lastJump = -99;
  let tick = 0;
  let prevApplied = false;
  const rec: number[] = []; let lastCp = 0; const cpTicks: number[][] = [];
  const push = (inp: InputState) => {
    for (const k of keys) {
      if (!inp[k]) {
        // a direction pressed together with a jump is part of the jump: it's held its full length, late
        if (pressed[k] >= 0 && Math.abs(pressed[k] - lastJump) <= 2) until[k] = pressed[k] + lag + (tick - pressed[k]);
        pressed[k] = -1;
        want[k] = -1;
        down[k] = tick < until[k];
      } else {
        if (pressed[k] < 0) pressed[k] = tick;
        if (!down[k]) {
          if (want[k] < 0) want[k] = tick + lag;
          if (tick >= want[k]) down[k] = true;
        }
      }
    }
    if (down.left && down.right) down[inp.left ? 'right' : 'left'] = false;
    if (inp.jump && !routeJump) {
      jumps.push({ at: tick + lag, len: 1 });
      lastJump = tick;
    }
    else if (inp.jump && jumps.length) jumps[jumps.length - 1].len++;
    routeJump = inp.jump;
    while (jumps.length && jumps[0].at + jumps[0].len <= tick) jumps.shift();
    const jump = jumps.length > 0 && tick >= jumps[0].at;
    const out = { left: down.left, right: down.right, jump, jumpPressed: jump && !prevApplied };
    prevApplied = jump;
    tick++;
    w.step(out); rec.push(encodeInput(out));
    if (w.cp !== lastCp) { cpTicks.push([w.cp, w.tick, Math.round(w.player.cx / 16 * 10) / 10]); lastCp = w.cp; }
  };
  for (let t = 0; t < idle && w.state === 'play'; t++) push(none);
  let jumpLeft = 0;
  for (const s of steps) {
    let t = 0;
    const max = (s.max ?? 3000) + lag + 240;
    if (s.jump) jumpLeft = s.jump;
    while (w.state === 'play') {
      if (s.dodge && w.player.onGround && jumpLeft <= 0 && incoming(w, s.dodge)) jumpLeft = 12;
      const lean = s.brace ? windOn(w) : 0;
      const pol = s.policy ? s.policy(w) : null;
      const hold = pol ? pol.move : s.steer ? s.steer(w) : s.hold;
      push({
        left: hold === 'L' || (hold === 'FWD' && w.flipped) || lean > 0,
        right: hold === 'R' || (hold === 'FWD' && !w.flipped) || lean < 0,
        jump: pol ? pol.jump || jumpLeft > 0 : jumpLeft > 0,
        jumpPressed: false,
      });
      if (jumpLeft > 0) jumpLeft--;
      t++;
      if (s.ticks !== undefined && t >= s.ticks) break;
      if (s.until && s.until(w)) break;
      if (t >= max) return { won: false, cp: w.cp, cps: w.checkpoints.length, why: `stuck: ${s.note ?? ''}` };
    }
    if (w.state !== 'play') break;
  }
  let guard = 0;
  while (w.state === 'play' && guard++ < 30) push(none);
  return { won: w.state === "won", cp: w.cp, cps: w.checkpoints.length, w, rec, cpTicks, why: w.state === "dead" ? `died: ${w.deathCause} @${Math.floor(w.player.x / 16)}` : w.state };
}

import { NAIVE, FIX, MISTAKES } from '../../solutions';
import { replay, encodeInput, decodeInput } from '../../../src/game/replay';
import { GTK_ACT_DEATHS } from '../gtk';
const IDS = () => (process.env.LDD_IDS ?? 'GTK-01,GTK-02,GTK-03,GTK-04,GTK-05,GTK-06,GTK-07,GTK-08,GTK-09,GTK-10').split(',');

it.runIf(!!process.env.LDD_GTKPROBE)('deaths', () => {
  const out: string[] = [];
  for (const id of IDS()) {
    const end = (steps: Step[]) => {
      const q = lagged(id, steps, 0, 0) as any;
      const w = q.w as World;
      return `${w.state === 'dead' ? w.deathCause : w.state} @ ${w.tick}`;
    };
    out.push(`${id} | (room) | NAIVE | ${end(NAIVE[id].steps)} | FIX | ${FIX[id] ? end(FIX[id].steps) : '-'}`);
    const acts = new Map<string, string[]>();
    for (const m of MISTAKES[id] ?? []) {
      const tag = GTK_ACT_DEATHS.find((d) => d.id === id && d.m === m)?.act ?? '(room)';
      acts.set(tag, [...(acts.get(tag) ?? []), `${m.what} | ${end(m.steps)}`]);
    }
    for (const [act, l] of acts) out.push(`${id} | ${act} | ${l.join(' | ')}`);
  }
  console.log(out.join('\n'));
}, 1800000);

const I = { left: false, right: false, jump: false, jumpPressed: false };
const Rr = { ...I, right: true };
/** a live deadly box within 3.5 tiles of Dad? */
function hot(w: World): string {
  const p = w.player;
  for (const e of w.entities as any[]) {
    const h = e.hazard;
    if (!h || !h.active || !e.alive || e.on === false) continue;
    // only hazards that move or switch on and off (a broom, a taxi, an inspector, a tier); a static pit is not 'running'
    if (!e.o?.live && !e.o?.tick) continue;
    if (e.o?.live && !e.o.live(e, w)) continue;
    const x0 = e.x, x1 = e.x + e.w;
    const d = p.cx < x0 ? x0 - p.cx : p.cx > x1 ? p.cx - x1 : 0;
    if (d < 3.5 * 16 && Math.abs(e.y + e.h / 2 - (p.y + p.h / 2)) < 4 * 16) return `${h.cause} ${(d / 16).toFixed(1)}t`;
  }
  return '';
}
it.runIf(!!process.env.LDD_GTKPROBE)('lags', () => {
  const out: string[] = [];
  for (const id of IDS()) {
    const def = LEVELS.find((l) => l.id === id)!;
    for (const lag of [0, 6, 12]) {
      const r = lagged(id, SOLUTIONS[id], lag, 0) as any;
      if (!r.won) { out.push(`${id} lag ${lag}: route did not win: ${r.why}`); continue; }
      const rec: number[] = r.rec;
      const cpAt = new Map<number, number>(); cpAt.set(-1, 0); cpAt.set(0, 0);
      for (const [cp, t] of r.cpTicks) cpAt.set(cp, t);
      const idleBad: string[] = [], caps: string[] = [];
      for (const [cp, t] of r.cpTicks) {
        if (cp < 0) continue;
        const at = replay(def, INFO, rec.slice(0, t));
        const hh = hot(at);
        if (hh) caps.push(`cp${cp} ${hh}`);
        const tests: [string, (i: number) => any][] = [
          ['idle 4s', () => I],
          ['run 0.3s+idle', (i) => (i < 36 ? Rr : I)],
          ['tap-jump+idle', (i) => (i < 40 ? { ...Rr, jump: i < 12, jumpPressed: i === 0 } : I)],
        ];
        for (const [name, f] of tests) {
          const w = replay(def, INFO, rec.slice(0, t)); w.player.vx = 0;
          for (let i = 0; i < 480 && w.state === 'play'; i++) w.step(f(i));
          if (w.state === 'dead') idleBad.push(`cp${cp} ${name}: ${w.deathCause} +${((w.tick - t) / 120).toFixed(2)}s`);
        }
      }
      let worst = 0, worstWhat = '';
      for (let t = 0; t < rec.length; t += 30) {
        for (const [name, f] of [['stop', () => I], ['run on', () => Rr], ['run+jump', (i: number) => ({ ...Rr, jump: i % 40 < 14, jumpPressed: i % 40 === 0 })]] as [string, (i: number) => any][]) {
          const w = replay(def, INFO, rec.slice(0, t));
          for (let i = 0; i < 480 && w.state === 'play'; i++) w.step(f(i));
          if (w.state !== 'dead') continue;
          const back = (w.deathTick - (cpAt.get(w.cp) ?? 0)) / 120;
          if (back > worst) (worst = back), (worstWhat = `cp${w.cp} ${name}@${(t / 120).toFixed(1)}s ${w.deathCause}`);
        }
      }
      let prev = 0, longest = 0, lAt = '';
      for (const [c, t] of r.cpTicks) { if (t - prev > longest) (longest = t - prev), (lAt = `to cp${c}`); prev = t; }
      if (r.w.tick - prev > longest) (longest = r.w.tick - prev), (lAt = 'to door');
      if (process.env.LDD_CPS) out.push(`${id} lag ${lag} cps: ` + r.cpTicks.map(([c, t, x]: number[]) => `cp${c}@${(t / 120).toFixed(1)}s x${x}`).join(' '));
      out.push(`${id} | lag ${lag} | route ${(r.w.tick / 120).toFixed(1)}s | ${r.cpTicks.length} cps | longest ${(longest / 120).toFixed(1)}s ${lAt} | worst replay ${worst.toFixed(1)}s ${worstWhat} | idle fails ${idleBad.length ? idleBad.join('; ') : 'none'} | hot captures ${caps.length ? caps.join('; ') : 'none'}`);
    }
  }
  console.log(out.join('\n'));
}, 1800000);

// acts: the route's time in each hint part (room, each act, the door), from def.hintAt
it.runIf(!!process.env.LDD_GTKPROBE)('acts', () => {
  const out: string[] = [];
  for (const id of IDS()) {
    const def = LEVELS.find((l) => l.id === id)! as any;
    const r = lagged(id, SOLUTIONS[id], 0, 0) as any;
    if (!r.rec) { out.push(`${id} route: ${r.why}`); continue; }
    const rec: number[] = r.rec;
    const at: number[] = def.hintAt ?? [];
    const w = new World(def, INFO); def.build?.(w);
    const enter: number[] = at.map(() => -1);
    for (let i = 0; i < rec.length; i++) {
      w.step(decodeInput(rec[i]));
      for (let k = 0; k < at.length; k++) if (enter[k] < 0 && w.player.cx >= at[k] * 16) enter[k] = w.tick;
    }
    const parts = at.map((x, k) => `${k}:x${x}=${(((k + 1 < at.length ? enter[k + 1] : w.tick) - enter[k]) / 120).toFixed(1)}s`);
    out.push(`${id} ${(w.tick / 120).toFixed(1)}s | ${parts.join(' ')}`);
  }
  console.log(out.join('\n'));
}, 600000);
