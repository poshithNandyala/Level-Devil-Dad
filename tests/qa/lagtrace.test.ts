// scratch (untracked): trace the lagged route of one stage: LT_ID=ITA-08 LT_LAG=12 LT_IDLE=0 [LT_FROM=tick] [LT_PLAY=naive|fix|m0] npx vitest run tests/qa/lagtrace.test.ts --silent=false
import { it } from 'vitest';
import { LEVELS } from '../../src/game/levels';
import { SOLUTIONS, NAIVE, FIX, MISTAKES } from '../solutions';
import { World, type InputState } from '../../src/game/world';
import { incoming, windOn, type Step } from '../runner';
import { INFO } from '../helpers';

it.runIf(!!process.env.LT_ID)('lag trace', () => {
  const id = process.env.LT_ID!;
  const lag = +(process.env.LT_LAG ?? 0);
  const idle = +(process.env.LT_IDLE ?? 0);
  const from = +(process.env.LT_FROM ?? -1);
  const play = process.env.LT_PLAY;
  const steps: Step[] = play === 'naive' ? NAIVE[id].steps : play === 'fix' ? FIX[id].steps : play?.startsWith('m') ? MISTAKES[id][+play.slice(1)].steps : SOLUTIONS[id];
  const def = LEVELS.find((l) => l.id === id)!;
  const w = new World(def, INFO);
  def.build?.(w);
  const none: InputState = { left: false, right: false, jump: false, jumpPressed: false };
  const keys = ['left', 'right'] as const;
  const want: Record<string, number> = { left: -1, right: -1 };
  const down: Record<string, boolean> = { left: false, right: false };
  const pressed: Record<string, number> = { left: -1, right: -1 };
  const until: Record<string, number> = { left: -1, right: -1 };
  const jumps: { at: number; len: number }[] = [];
  let routeJump = false;
  let lastJump = -99;
  let tick = 0;
  let prevApplied = false;
  const log: string[] = [];
  let stepNo = 0;
  const push = (inp: InputState) => {
    for (const k of keys) {
      if (!inp[k]) {
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
    } else if (inp.jump && jumps.length) jumps[jumps.length - 1].len++;
    routeJump = inp.jump;
    while (jumps.length && jumps[0].at + jumps[0].len <= tick) jumps.shift();
    const jump = jumps.length > 0 && tick >= jumps[0].at;
    const out = { left: down.left, right: down.right, jump, jumpPressed: jump && !prevApplied };
    prevApplied = jump;
    tick++;
    w.step(out);
    const p = w.player;
    const want2 = `${inp.left ? 'L' : ''}${inp.right ? 'R' : ''}${inp.jump ? 'J' : ''}`;
    const got = `${out.left ? 'L' : ''}${out.right ? 'R' : ''}${out.jump ? 'J' : ''}`;
    if (from < 0 || w.tick >= from) log.push(`t${w.tick} s${stepNo} want=${want2.padEnd(3)} got=${got.padEnd(3)} x=${p.x.toFixed(1)} y=${p.y.toFixed(1)} g=${p.onGround ? 1 : 0} vy=${p.vy.toFixed(0)} cp=${w.cp}`);
    if (log.length > +(process.env.LT_CAP ?? 400)) log.shift();
  };
  for (let t = 0; t < idle && w.state === 'play'; t++) push(none);
  let jumpLeft = 0;
  outer: for (const s of steps) {
    let t = 0;
    const max = (s.max ?? 3000) + lag + 240;
    if (s.jump) jumpLeft = s.jump;
    while (w.state === 'play') {
      if (s.dodge && w.player.onGround && jumpLeft <= 0 && incoming(w, s.dodge)) jumpLeft = 12;
      const lean = s.brace ? windOn(w) : 0;
      const pol = s.policy ? s.policy(w) : null;
      const hold = pol ? pol.move : s.steer ? s.steer(w) : s.hold;
      push({ left: hold === 'L' || (hold === 'FWD' && w.flipped) || lean > 0, right: hold === 'R' || (hold === 'FWD' && !w.flipped) || lean < 0, jump: pol ? pol.jump || jumpLeft > 0 : jumpLeft > 0, jumpPressed: false });
      if (jumpLeft > 0) jumpLeft--;
      t++;
      if (s.ticks !== undefined && t >= s.ticks) break;
      if (s.until && s.until(w)) break;
      if (t >= max) {
        log.push(`STUCK in step ${stepNo} (${s.note ?? ''})`);
        break outer;
      }
    }
    stepNo++;
    if (w.state !== 'play') break;
  }
  console.log(`LAGTRACE ${id} lag${lag} idle${idle} -> ${w.state} ${w.deathCause ?? ''} at x=${(w.player.x / 16).toFixed(2)} tick ${w.tick}\n` + log.slice(-(+(process.env.LT_N ?? 80))).join('\n'));
}, 600000);
