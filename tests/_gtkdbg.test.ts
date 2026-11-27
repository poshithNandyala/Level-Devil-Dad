import { it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { SOLUTIONS } from './solutions';
import { CITY_TESTS } from './city-tests';
import { World, type InputState } from '../src/game/world';
import { incoming, windOn, type Step } from './runner';
import { INFO } from './helpers';

// Human timing (docs/HANDOFF.md, section 6), the whole stage at once: the proven route, played by
// someone who turns up at a random moment (0-3 s late) and is a steady 0-6 / 0-12 / 0-18 ticks slow to start
// anything the route starts (a step off, a jump). Letting go is on time: people ease up as they get close.
// Per stage it prints the win rate at quick (0-6), average (0-12) and relaxed (0-18) lag, and per stretch
// (spawn -> checkpoint 1 -> ... -> door) the share of runs that got through it once they reached it.
//   bash scripts/dev/fair.sh PAT                      (every stage of one city)
//   LDD_FAIR=1 LDD_IDS=PAT-02,PAT-05 npx vitest run tests/fair.test.ts --silent=false
//   LDD_N=80 for more runs per lag (default 40)
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
    w.step(out);
    if (process.env.LDD_TR && tick % 15 === 0) console.log('t', w.tick, w.player.x, w.player.y, w.player.onGround ? 1 : 0, out.right ? 'R' : out.left ? 'L' : '-', out.jump ? 'J' : '');
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
      if (t >= max) return { won: false, cp: w.cp, cps: w.checkpoints.length, why: `stuck: ${s.note ?? ""}` };
    }
    if (w.state !== 'play') break;
  }
  let guard = 0;
  while (w.state === 'play' && guard++ < 30) push(none);
  return { won: w.state === "won", cp: w.cp, cps: w.checkpoints.length, why: w.state === "dead" ? `died: ${w.deathCause} @${Math.floor(w.player.x / 16)}` : w.state };
}

/** stage ids to run: LDD_IDS, else every stage of LDD_CITY, else every module city's `fair` list */
function fairIds(): string[] {
  if (process.env.LDD_IDS) return process.env.LDD_IDS.split(',');
  const city = process.env.LDD_CITY?.toUpperCase();
  if (city) return LEVELS.filter((l) => l.city === city && SOLUTIONS[l.id]).map((l) => l.id);
  return CITY_TESTS.flatMap((t) => t.fair ?? []);
}

it.runIf(!!process.env.LDD_FAIR)('human timing', () => {
  const ids = fairIds();
  const N = +(process.env.LDD_N ?? 40);
  const out: string[] = [];
  for (const id of ids) {
    const row: string[] = [];
    const why = new Map<string, number>();
    const stretches: string[] = [];
    for (const D of [6, 12, 18]) {
      let ok = 0;
      // reached[i]: runs that got to the start of stretch i (i = 0 is the spawn); passed[i]: and got past it
      const reached: number[] = [];
      const passed: number[] = [];
      for (let k = 0; k < N; k++) {
        const r = rng(k * 7919 + D);
        const lag = Math.floor(r() * (D + 1));
        const idle = Math.floor(r() * 360);
        if (process.env.LDD_LAG && (lag !== +process.env.LDD_LAG || idle !== +process.env.LDD_IDLE!)) continue;
        const res = lagged(id, SOLUTIONS[id], lag, idle);
        if (res.won) ok++;
        else if (D === 12) {
          why.set(res.why, (why.get(res.why) ?? 0) + 1);
          if (process.env.LDD_WHO) console.log(id, 'lag', lag, 'idle', idle, res.why);
        }
        const last = res.won ? res.cps : res.cp + 1; // the stretch it ended in (cps = the door stretch)
        for (let i = 0; i <= Math.min(last, res.cps); i++) {
          reached[i] = (reached[i] ?? 0) + 1;
          if (i < last || res.won) passed[i] = (passed[i] ?? 0) + 1;
        }
      }
      row.push(`${D}t ${Math.round((ok / N) * 100)}%`);
      if (D === 12) for (let i = 0; i < reached.length; i++) stretches.push(`${i === reached.length - 1 ? 'door' : `s${i}`} ${Math.round(((passed[i] ?? 0) / reached[i]) * 100)}%`);
    }
    out.push(`${id}: ${row.join('  ')}   ${[...why].map(([k, v]) => `${k} x${v}`).join(', ')}`);
    out.push(`  stretches at 0-12t (bar 95% each): ${stretches.join('  ')}`);
  }
  console.log(out.join('\n'));
}, 1800000);
