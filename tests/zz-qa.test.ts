import { it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { SOLUTIONS } from './solutions';
import { World, type InputState } from '../src/game/world';
import { incoming, windOn, type Step } from './runner';
import { INFO } from './helpers';
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

function rate(id: string, steps: Step[], maxLag: number, N = 80, fixedLag?: number) {
  let ok = 0; const why = new Map<string, number>();
  for (let k = 0; k < N; k++) {
    const r = rng(k * 7919 + 12);
    const lag = fixedLag ?? Math.floor(r() * (maxLag + 1));
    const idle = Math.floor(r() * 360);
    const res = lagged(id, steps, lag, idle);
    if (res.won) ok++; else why.set(res.why, (why.get(res.why) ?? 0) + 1);
  }
  return `${Math.round((ok / N) * 100)}% ${[...why].map(([k, v]) => k + ' x' + v).join(',')}`;
}
import { NAIVE, FIX, MISTAKES } from './solutions';
import { replay, encodeInput, decodeInput } from '../src/game/replay';
const IDS = (process.env.QA_IDS ?? 'CCU-05,CCU-06,CCU-07,CCU-08,CCU-09,CCU-10').split(',');
it('causes', () => {
  const out: string[] = [];
  for (const id of IDS) {
    const r = lagged(id, SOLUTIONS[id], 0, 0) as any;
    out.push(`${id} route ${r.why} ${(r.w.tick / 120).toFixed(1)}s cps ${r.w.checkpoints.map((x: number) => (x / 16).toFixed(1)).join(',')}`);
    const plays: [string, Step[]][] = [['NAIVE', NAIVE[id].steps], ['FIX', FIX[id].steps], ...(MISTAKES[id] ?? []).map((m: any) => [m.what, m.steps] as [string, Step[]])];
    for (const [what, steps] of plays) {
      const cells: string[] = [];
      for (const lag of [0, 6, 12]) {
        const q = lagged(id, steps, lag, 0) as any; const qw = q.w as World | undefined;
        cells.push(!qw ? `stuck(${q.why})` : `${qw.state === 'dead' ? qw.deathCause : qw.state}@${qw.tick}`);
      }
      out.push(`   ${what} | ${cells.join(' | ')}`);
    }
  }
  console.log(out.join('\n'));
}, 1800000);
it('cps', () => {
  const out: string[] = [];
  const I = { left: false, right: false, jump: false, jumpPressed: false };
  const Rr = { ...I, right: true };
  for (const id of IDS) for (const lag of (process.env.QA_LAGS ?? '0,6,12').split(',').map(Number)) for (const idle of (process.env.QA_IDLES ?? '0,90,180,270').split(',').map(Number)) {
    const def = LEVELS.find((l) => l.id === id)!;
    const r = lagged(id, SOLUTIONS[id], lag, idle) as any;
    if (!r.won) { out.push(`${id} L${lag} i${idle} ROUTE FAIL ${r.why}`); continue; }
    const rec: number[] = r.rec;
    let prevT = 0, maxS = 0; for (const [, t] of r.cpTicks) { maxS = Math.max(maxS, t - prevT); prevT = t; } maxS = Math.max(maxS, r.w.tick - prevT);
    const ncp = r.w.checkpoints.length - 1, got = r.cpTicks.length;
    let calmBad: string[] = [];
    if (idle === 0 || idle === 180) for (const [cp, t] of r.cpTicks) {
      if (cp < 0) continue;
      const tests: [string, (i: number) => any][] = [['idle4', () => I], ['run.3', (i) => (i < 36 ? Rr : I)], ['tap', (i) => (i < 40 ? { ...Rr, jump: i < 12, jumpPressed: i === 0 } : I)]];
      for (const [name, f] of tests) {
        const w = replay(def, INFO, rec.slice(0, t)); w.player.vx = 0;
        for (let i = 0; i < 480 && w.state === 'play'; i++) w.step(f(i));
        if (w.state === 'dead') calmBad.push(`cp${cp}x${(w.checkpoints[cp]/16).toFixed(1)} ${name} DIES ${w.deathCause} +${((w.tick - t) / 120).toFixed(2)}s`);
      }
    }
    const cpAt = new Map<number, number>(); cpAt.set(-1, 0); cpAt.set(0, 0);
    for (const [cp, t] of r.cpTicks) cpAt.set(cp, t);
    let worst = 0, worstW = ''; const per = new Map<number, [number, string]>();
    if (idle === 0) for (let t = 0; t < rec.length; t += 30) {
      for (const [name, f] of [['stop', () => I], ['run', () => Rr], ['runjump', (i: number) => ({ ...Rr, jump: i % 40 < 14, jumpPressed: i % 40 === 0 })]] as [string, (i: number) => any][]) {
        const w = replay(def, INFO, rec.slice(0, t));
        for (let i = 0; i < 480 && w.state === 'play'; i++) w.step(f(i));
        if (w.state !== 'dead') continue;
        const back = (w.deathTick - (cpAt.get(w.cp) ?? 0)) / 120;
        if (back > worst) { worst = back; worstW = `${name}@${(t / 120).toFixed(1)}s ${w.deathCause} cp${w.cp}`; }
        const c = per.get(w.cp); if (!c || back > c[0]) per.set(w.cp, [back, `${name}@${(t / 120).toFixed(1)}s ${w.deathCause} x${(w.player.cx/16).toFixed(1)}`]);
      }
    }
    for (const [cp, [b, wh]] of [...per].sort((a, b) => a[0] - b[0])) if (b > 7.5) out.push(`${id} L${lag} stretch from cp${cp} (x${cp >= 0 ? (r.w.checkpoints[cp] / 16).toFixed(1) : 'start'}): worst replay ${b.toFixed(1)}s (${wh})`);
    out.push(`${id} L${lag} i${idle} clear ${(r.w.tick / 120).toFixed(1)}s caught ${got}/${ncp} maxStretch ${(maxS / 120).toFixed(1)}s${idle === 0 ? ` worstReplay ${worst.toFixed(1)}s (${worstW})` : ''} calm ${calmBad.length ? calmBad.join('; ') : 'ok'}`);
  }
  console.log(out.join('\n'));
}, 3600000);
it('acts', () => {
  const out: string[] = [];
  const I = { left: false, right: false, jump: false, jumpPressed: false };
  const R = { ...I, right: true };
  for (const id of IDS) {
    const def = LEVELS.find((l) => l.id === id)!;
    const r = lagged(id, SOLUTIONS[id], 0, 0) as any; const rec: number[] = r.rec;
    const parts = ((def as any).parts ?? []) as { kind: string; x0: number }[];
    // find route tick when player first reaches each part's x0
    const w0 = replay(def, INFO, []); const at: number[] = []; let k = 0;
    for (let t = 0; t < rec.length && k < parts.length; t++) { while (k < parts.length && w0.player.cx >= parts[k].x0 * 16) { at[k] = t; k++; } w0.step(decodeInput(rec[t])); }
    parts.forEach((p, i) => {
      if (at[i] === undefined) { out.push(`${id} ${p.kind} x${p.x0}: route never reaches`); return; }
      const end = i + 1 < parts.length ? parts[i + 1].x0 : 1e9;
      const plays: [string, (i: number, w: World) => any][] = [
        ['walk', () => R], ['runjump', (j) => ({ ...R, jump: j % 40 < 14, jumpPressed: j % 40 === 0 })],
        ['longjump', (j) => ({ ...R, jump: j % 60 < 34, jumpPressed: j % 60 === 0 })], ['idle', () => I],
        ['walk1s-idle', (j) => (j < 120 ? R : I)], ['walk2s-idle', (j) => (j < 240 ? R : I)], ['walk3s-idle', (j) => (j < 360 ? R : I)],
        ['hopOnAhead-idle', (j) => (j < 60 ? { ...R, jump: j < 14, jumpPressed: j === 0 } : j < 200 ? R : I)],
      ];
      const res: string[] = []; const causes = new Set<string>();
      for (const [name, f] of plays) {
        const w = replay(def, INFO, rec.slice(0, at[i]));
        for (let j = 0; j < 1800 && w.state === 'play'; j++) w.step(f(j, w));
        const tx = w.player.cx / 16;
        if (w.state === 'dead' && tx <= end + 2) { causes.add(w.deathCause!); res.push(`${name}:${w.deathCause}@${w.tick}`); }
        else res.push(`${name}:${w.state === 'dead' ? 'past(' + w.deathCause + ')' : w.state}`);
      }
      out.push(`${id} ${p.kind} x${p.x0}-${end === 1e9 ? 'door' : end} distinct=${causes.size} ${res.join(' ')}`);
    });
  }
  console.log(out.join('\n'));
}, 3600000);
