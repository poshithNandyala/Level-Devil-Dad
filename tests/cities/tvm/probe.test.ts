// TVM's replay and checkpoint-calm probe (after the QA probe of round 1, reports/cities/tvm/QA/qa-probe.test.ts.txt).
// Runs only when asked:  LDD_TVMPROBE=1 npx vitest run tests/cities/tvm/probe.test.ts --silent=false
// probe4: checkpoint times and stretch lengths along the route, and where each scripted death replays from.
// probe5: from every checkpoint, idle 4 s / run 0.3 s then idle / one tap jump then idle must all live; and the
// worst replay (death tick minus the respawn checkpoint's tick) per stretch, branching off the route every 0.25 s.
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
import { replay, encodeInput } from '../../../src/game/replay';
it.runIf(!!process.env.LDD_TVMPROBE)('probe4', () => {
  const out: string[] = [];
  for (const id of (process.env.LDD_IDS ?? 'TVM-09,TVM-10').split(',')) {
    const r = lagged(id, SOLUTIONS[id], 0, 0) as any;
    const w = r.w as World;
    out.push(`${id} route won=${r.won} total ${(w.tick / 120).toFixed(1)}s cps(tiles) ${w.checkpoints.map((x: number) => (x / 16).toFixed(1)).join(',')}`);
    let prev = 0;
    for (const [cp, t, x] of r.cpTicks) { out.push(`   cp${cp} at ${(t / 120).toFixed(1)}s x${x}  stretch ${((t - prev) / 120).toFixed(1)}s`); prev = t; }
    out.push(`   door stretch ${((w.tick - prev) / 120).toFixed(1)}s`);
    const plays: [string, Step[]][] = [['NAIVE', NAIVE[id].steps], ['FIX', FIX[id].steps], ...(MISTAKES[id] ?? []).map((m) => [m.what, m.steps] as [string, Step[]])];
    for (const [what, steps] of plays) {
      const q = lagged(id, steps, 0, 0) as any;
      const qw = q.w as World;
      const last = q.cpTicks.length ? q.cpTicks[q.cpTicks.length - 1] : [0, 0, 0];
      out.push(`   ${what}: ${qw.state} ${qw.deathCause ?? ''} at x${(qw.player.cx / 16).toFixed(1)} t${(qw.tick / 120).toFixed(1)}s; from cp${last[0]} (x${last[2]}) ${((qw.tick - last[1]) / 120).toFixed(1)}s`);
    }
  }
  console.log(out.join('\n'));
}, 1800000);
it.runIf(!!process.env.LDD_TVMPROBE)('probe5', () => {
  const out: string[] = [];
  const I = { left: false, right: false, jump: false, jumpPressed: false };
  const Rr = { ...I, right: true };
  for (const id of (process.env.LDD_IDS ?? 'TVM-09,TVM-10').split(',')) {
    const def = LEVELS.find((l) => l.id === id)!;
    const r = lagged(id, SOLUTIONS[id], +(process.env.LDD_LAG ?? 0), +(process.env.LDD_IDLE ?? 0)) as any;
    if (!r.won) { out.push(`${id} route at lag ${process.env.LDD_LAG ?? 0} did not win: ${r.why}`); continue; }
    const rec: number[] = r.rec;
    const cpAt = new Map<number, number>(); cpAt.set(-1, 0);
    for (const [cp, t] of r.cpTicks) cpAt.set(cp, t);
    for (const [cp, t] of r.cpTicks) {
      if (cp < 0) continue;
      const tests: [string, (i: number) => any][] = [
        ['idle 4s', () => I],
        ['run 0.3s then idle', (i) => (i < 36 ? Rr : I)],
        ['tap-jump fwd then idle', (i) => (i < 40 ? { ...Rr, jump: i < 12, jumpPressed: i === 0 } : I)],
      ];
      for (const [name, f] of tests) {
        const w = replay(def, INFO, rec.slice(0, t)); w.player.vx = 0;
        for (let i = 0; i < 480 && w.state === 'play'; i++) w.step(f(i));
        if (w.state === 'dead') out.push(`${id} cp${cp}: ${name}: DIES ${w.deathCause} after ${((w.tick - t) / 120).toFixed(2)}s at x${(w.player.cx / 16).toFixed(1)}`);
      }
    }
    const worst = new Map<number, [number, string]>();
    for (let t = 0; t < rec.length; t += 30) {
      for (const [name, f] of [['stop', () => I], ['run on', () => Rr], ['run+jump', (i: number) => ({ ...Rr, jump: i % 40 < 14, jumpPressed: i % 40 === 0 })]] as [string, (i: number) => any][]) {
        const w = replay(def, INFO, rec.slice(0, t));
        for (let i = 0; i < 480 && w.state === 'play'; i++) w.step(f(i));
        if (w.state !== 'dead') continue;
        const back = (w.deathTick - (cpAt.get(w.cp) ?? 0)) / 120;
        const cur = worst.get(w.cp);
        if (!cur || back > cur[0]) worst.set(w.cp, [back, `${name}@${(t / 120).toFixed(1)}s -> ${w.deathCause} x${(w.player.cx / 16).toFixed(1)}`]);
      }
    }
    for (const [cp, [b, what]] of [...worst].sort((a, b) => a[0] - b[0])) out.push(`${id} stretch from cp${cp}: worst replay ${b.toFixed(1)}s (${what})`);
    let prev = 0,
      longest = 0;
    for (const [, t] of r.cpTicks) (longest = Math.max(longest, t - prev)), (prev = t);
    longest = Math.max(longest, r.w.tick - prev);
    out.push(`${id} cps at lag ${process.env.LDD_LAG ?? 0}: ` + r.cpTicks.map(([c, t, x]: number[]) => `cp${c}@${(t / 120).toFixed(1)}s x${x}`).join(' '));
    out.push(`${id} at lag ${process.env.LDD_LAG ?? 0}: ${r.cpTicks.length} checkpoints, longest stretch ${(longest / 120).toFixed(1)}s, route ${(r.w.tick / 120).toFixed(1)}s`);
  }
  console.log(out.join('\n'));
}, 1800000);
import { mkdirSync, writeFileSync } from 'fs';
// recordings of TVM-10's NAIVE, FIX and every MISTAKE (for death frames):  LDD_TVMREC=1 ... -> /tmp/tvm-rec/<name>.json
it.runIf(!!process.env.LDD_TVMREC)('rec', () => {
  mkdirSync('/tmp/tvm-rec', { recursive: true });
  const plays: [string, string, Step[]][] = [
    ['TVM-10', 'n10', NAIVE['TVM-10'].steps], ['TVM-10', 'f10', FIX['TVM-10'].steps],
    ...(MISTAKES['TVM-10'] ?? []).map((m, i) => ['TVM-10', 'm10_' + i, m.steps] as [string, string, Step[]]),
  ];
  for (const [id, name, steps] of plays) {
    const q = lagged(id, steps, 0, 0) as any;
    writeFileSync(`/tmp/tvm-rec/${name}.json`, JSON.stringify({ id, rec: q.rec, end: q.rec.length }));
    console.log('REC', name, q.w.state, q.w.deathCause, (q.w.player.cx / 16).toFixed(1), q.rec.length);
  }
});

/** is anything on the stage mid-cycle (a wave whistled or in, the backwash running)? */
function busy(w: World): string {
  for (const e of w.entities as any[]) {
    if (e.waves && e.state && e.state !== 'calm') return `${e.name} ${e.state}`;
  }
  return '';
}
// probe6: every checkpoint of 09 and 10, the route at lag 0..12 (step 2) x idle 0/90/180/270: is the checkpoint
// taken while a wave is whistled or in, and does standing 4 s from it live?
it.runIf(!!process.env.LDD_TVMPROBE)('probe6', () => {
  const out: string[] = [];
  const I = { left: false, right: false, jump: false, jumpPressed: false };
  for (const id of (process.env.LDD_IDS ?? 'TVM-09,TVM-10').split(',')) {
    const def = LEVELS.find((l) => l.id === id)!;
    const bad = new Map<number, string[]>();
    let runs = 0;
    for (let lag = 0; lag <= 12; lag += 2)
      for (const idle of [0, 90, 180, 270]) {
        const r = lagged(id, SOLUTIONS[id], lag, idle) as any;
        if (!r.won) { out.push(`${id} lag ${lag} idle ${idle}: route did not win: ${r.why}`); continue; }
        runs++;
        for (const [cp, t] of r.cpTicks) {
          if (cp < 0) continue;
          const w = replay(def, INFO, r.rec.slice(0, t));
          const b = busy(w);
          w.player.vx = 0;
          for (let i = 0; i < 480 && w.state === 'play'; i++) w.step(I);
          if (b || w.state === 'dead') bad.set(cp, [...(bad.get(cp) ?? []), `lag ${lag} idle ${idle}: ${b ? 'taken while ' + b : ''}${w.state === 'dead' ? ' idle dies ' + w.deathCause : ''}`]);
        }
      }
    out.push(`${id}: ${runs} route runs; checkpoints taken mid-wave or not calm: ${bad.size === 0 ? 'none' : ''}`);
    for (const [cp, l] of bad) out.push(`  cp${cp}: ${l.length}/${runs}  e.g. ${l[0]}`);
  }
  console.log(out.join('\n'));
}, 1800000);

// probe7 (static): for every checkpoint, the distance to the next wave / tarp / ice / rocket trigger ahead of it
it.runIf(!!process.env.LDD_TVMPROBE)('probe7', () => {
  const out: string[] = [];
  for (const id of (process.env.LDD_IDS ?? 'TVM-09,TVM-10').split(',')) {
    const def = LEVELS.find((l) => l.id === id)!;
    const w = new World(def, INFO);
    def.build?.(w);
    const trig: [number, string][] = [];
    for (const e of w.entities as any[]) {
      if (e.waves) for (const [i, v] of e.waves.entries()) if (v.at !== undefined) trig.push([v.at * 16, `${e.name} wave ${i}`]);
      if (e.trigger !== undefined && e.dropX0 !== undefined) trig.push([e.trigger, 'tarp']);
      if (e.trigger !== undefined && e.x0 !== undefined && e.solid && !e.dropX0) trig.push([e.trigger, 'ice']);
    }
    const near: string[] = [];
    for (const c of w.checkpoints) {
      const ahead = trig.filter(([t]) => t >= c).sort((a, b) => a[0] - b[0])[0];
      const behind = trig.filter(([t]) => t < c && c - t < 3.5 * 16);
      if (ahead && ahead[0] - c < 3.5 * 16) near.push(`cp x${(c / 16).toFixed(1)}: ${((ahead[0] - c) / 16).toFixed(1)} tiles before ${ahead[1]}`);
      for (const [t, n] of behind) near.push(`cp x${(c / 16).toFixed(1)}: ${((c - t) / 16).toFixed(1)} tiles past ${n}`);
    }
    out.push(`${id}: ${w.checkpoints.length} checkpoints, ${trig.length} triggers; closer than 3.5 tiles: ${near.length ? near.join('; ') : 'none'}`);
  }
  console.log(out.join('\n'));
});
