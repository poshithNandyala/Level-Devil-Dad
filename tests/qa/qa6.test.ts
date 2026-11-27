// scratch (not committed): the tester's lag-captured sweep (reports/cities/pat/FIX-7.md), plus the walk-4.5 plays and a
// probe table (every NAIVE / FIX / MISTAKE: cause@tick at lag 0/6/12). Run: QA6=1 QA6_IDS=ITA-01,.. QA6_IDLE=0,37,120,251 npx vitest run tests/qa/qa6.test.ts
import { it } from 'vitest';
import { LEVELS } from '../../src/game/levels';
import { SOLUTIONS, NAIVE, FIX, MISTAKES } from '../solutions';
import { World, NO_INPUT, type InputState } from '../../src/game/world';
import { incoming, windOn, type Step } from '../runner';
import { INFO } from '../helpers';
import { encodeInput, replay } from '../../src/game/replay';
let REC: number[] = [];
let CAPS: { cp: number; x: number; n: number; tick: number }[] = [];
const DEATH = { tick: -1, cause: '', x: 0 };
function lagged(id: string, steps: Step[], lag: number, idle: number) {
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
    REC.push(encodeInput(out));
    const c0 = w.cp;
    w.step(out);
    if (w.cp > c0) CAPS.push({ cp: w.cp, x: w.checkpoints[w.cp] / 16, n: REC.length, tick: w.tick });
    if (w.state === 'dead' && DEATH.tick < 0) {
      DEATH.tick = w.tick;
      DEATH.cause = w.deathCause ?? '';
      DEATH.x = w.player.x / 16;
    }
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
  return { won: w.state === 'won', cp: w.cp, cps: w.checkpoints.length, why: w.state === 'dead' ? `died: ${w.deathCause} @${Math.floor(w.player.x / 16)}` : w.state };
}

const fwd = (w: World): InputState => (w.flipped ? { ...NO_INPUT, left: true } : { ...NO_INPUT, right: true });
type Play = { name: string; input: (t: number, w: World) => InputState };
const PLAYS: Play[] = [{ name: 'idle', input: () => NO_INPUT }];
for (const L of [0, 6, 12]) {
  PLAYS.push({ name: 'run' + L, input: (t, w) => (t >= L && t < L + 36 ? fwd(w) : NO_INPUT) });
  let landed = false;
  PLAYS.push({
    name: 'tap' + L,
    input: (t, w) => {
      if (t === 0) landed = false;
      if (t < L || landed) return NO_INPUT;
      const k = t - L;
      if (k > 6 && w.player.onGround) landed = true;
      if (landed || k > 240) return NO_INPUT;
      return { ...fwd(w), jump: k < 6, jumpPressed: k === 0 };
    },
  });
}
// the walk-4.5 check: walk 4.5 tiles (72 px = 62 ticks) then idle; and a tap jump then walk on to 4.5 tiles, then idle
PLAYS.push({ name: 'walk45', input: (t, w) => (t < 62 ? fwd(w) : NO_INPUT) });
PLAYS.push({ name: 'tapwalk45', input: (t, w) => (t < 62 ? { ...fwd(w), jump: t < 6, jumpPressed: t === 0 } : NO_INPUT) });

it.runIf(!!process.env.QA6)('qa6 lag-captured cpsafe + replay + probe', () => {
  const ids = (process.env.QA6_IDS ?? 'ITA-01,ITA-02,ITA-03,ITA-04,ITA-05,ITA-06,ITA-07,ITA-08,ITA-09,ITA-10').split(',');
  const idles = (process.env.QA6_IDLE ?? '0').split(',').map(Number);
  const out: string[] = [];
  const probe: string[] = [];
  for (const id of ids) {
    const def = LEVELS.find((l) => l.id === id)!;
    let fails = 0,
      checked = 0;
    const caps = new Set<string>();
    let longest = 0;
    let clear = 0;
    for (const lag of [0, 6, 11, 12])
      for (const idle of idles) {
        REC = [];
        CAPS = [];
        DEATH.tick = -1;
        const res = lagged(id, SOLUTIONS[id], lag, idle);
        if (lag === 0 && idle === 0) clear = REC.length / 120;
        const ticks = [0, ...CAPS.map((c) => c.tick), REC.length];
        for (let i = 1; i < ticks.length; i++) longest = Math.max(longest, (ticks[i] - ticks[i - 1]) / 120);
        if (!res.won) out.push(`${id} lag${lag} idle${idle}: route did not win (${res.why})`);
        for (const c of CAPS) {
          caps.add(`cp${c.cp}@x${c.x.toFixed(1)}`);
          const inputs = REC.slice(0, c.n);
          for (const p of PLAYS) {
            const r = replay(def, INFO, inputs);
            r.player.vx = 0;
            checked++;
            for (let t = 0; t < 480 && r.state === 'play'; t++) r.step(p.input(t, r));
            if (r.state !== 'play') {
              fails++;
              out.push(`FAIL ${id} capture-lag${lag} idle${idle} cp${c.cp} x${c.x.toFixed(1)} taken@tick${c.tick} Dad x${(r.player.x / 16).toFixed(1)}: ${p.name} -> ${r.deathCause}`);
            }
          }
        }
      }
    // replay per tick for every NAIVE/FIX/MISTAKE at lag 0/6/12 (lagged model, idle 0), and the probe (cause@tick)
    const plays: [string, Step[], string][] = [];
    if (NAIVE[id]) plays.push(['naive', NAIVE[id].steps, NAIVE[id].cause ?? '']);
    if (FIX[id]) plays.push(['fix', FIX[id].steps, FIX[id].cause ?? '']);
    (MISTAKES[id] ?? []).forEach((m, i) => plays.push(['m' + i + ' ' + m.what, m.steps, m.cause ?? '']));
    let worst = 0;
    const rp: string[] = [];
    for (const [k, st, want] of plays) {
      const row: string[] = [];
      const pr: string[] = [];
      for (const lag of [0, 6, 12]) {
        REC = [];
        CAPS = [];
        DEATH.tick = -1;
        const res = lagged(id, st, lag, 0);
        if (res.won || DEATH.tick < 0) {
          row.push('nodeath');
          pr.push('NO DEATH');
          continue;
        }
        const last = CAPS.length ? CAPS[CAPS.length - 1].tick : 0;
        const s = (DEATH.tick - last) / 120;
        worst = Math.max(worst, s);
        row.push(s.toFixed(2));
        pr.push(`${DEATH.cause}@${DEATH.tick}${want && DEATH.cause !== want ? ' WANT ' + want : ''}`);
      }
      rp.push(`${k.split(' ')[0]}:${row.join('/')}`);
      probe.push(`| ${id} | ${k} | ${pr.join(' | ')} |`);
    }
    out.push(`${id}: clear ${clear.toFixed(1)} s; checked ${checked} plays at ${caps.size} distinct capture points, fails ${fails}; longest stretch ${longest.toFixed(1)} s; replay worst ${worst.toFixed(2)} s [${rp.join(' ')}]`);
  }
  console.log('QA6\n' + out.join('\n') + '\nPROBE\n| stage | play | lag 0 | lag 6 | lag 12 |\n|---|---|---|---|---|\n' + probe.join('\n'));
}, 3600000);
