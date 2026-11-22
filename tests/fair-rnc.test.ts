import { it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { SOLUTIONS } from './solutions';
import { World, type InputState } from '../src/game/world';
import { incoming, windOn, type Step } from './runner';
import { INFO } from './helpers';

// Human timing for Ranchi (docs/HANDOFF.md, section 6), the whole stage at once: the proven route, played by
// someone who turns up at a random moment (0-3 s late) and is a steady 0-6 / 0-12 / 0-18 ticks slow to start
// anything the route starts (a step off, a jump). Letting go is on time: people ease up as they get close.
//   LDD_FAIR=1 npx vitest run tests/fair-rnc.test.ts --silent=false
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
      if (t >= max) return { won: false, why: `stuck: ${s.note ?? ''}` };
    }
    if (w.state !== 'play') break;
  }
  let guard = 0;
  while (w.state === 'play' && guard++ < 30) push(none);
  return { won: w.state === "won", why: w.state === "dead" ? `died: ${w.deathCause} @${Math.floor(w.player.x / 16)}` : w.state };
}

it.runIf(!!process.env.LDD_FAIR)('Ranchi, human timing', () => {
  const ids = (process.env.LDD_IDS ?? 'RNC-02,RNC-03,RNC-04,RNC-05,RNC-06,RNC-07,RNC-08').split(',');
  const N = +(process.env.LDD_N ?? 40);
  const out: string[] = [];
  for (const id of ids) {
    const row: string[] = [];
    const why = new Map<string, number>();
    for (const D of [6, 12, 18]) {
      let ok = 0;
      for (let k = 0; k < N; k++) {
        const r = rng(k * 7919 + D);
        const lag = Math.floor(r() * (D + 1));
        const idle = Math.floor(r() * 360);
        const res = lagged(id, SOLUTIONS[id], lag, idle);
        if (res.won) ok++;
        else if (D === 12) {
          why.set(res.why, (why.get(res.why) ?? 0) + 1);
          if (process.env.LDD_WHO) console.log(id, 'lag', lag, 'idle', idle, res.why);
        }
      }
      row.push(`${D}t ${Math.round((ok / N) * 100)}%`);
    }
    out.push(`${id}: ${row.join('  ')}   ${[...why].map(([k, v]) => `${k} x${v}`).join(', ')}`);
  }
  console.log(out.join('\n'));
}, 900000);
