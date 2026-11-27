import { it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { World, NO_INPUT, type InputState } from '../src/game/world';
import { decodeInput, replay } from '../src/game/replay';
import { INFO } from './helpers';
import { play } from './runner';
import { SOLUTIONS } from './solutions';

// scratch (probe 4): branch off the proven route every STEP ticks three ways (stop, run on, run and jump), find the
// worst replay (respawn -> the place you died) per stretch and the longest stretch; calm from every checkpoint at lag 0/4/8/12
const STEP = +(process.env.LDD_STEP ?? 30);
const HORIZON = 720;
const R: InputState = { left: false, right: true, jump: false, jumpPressed: false };
const ways: Record<string, (k: number) => InputState> = {
  stop: () => NO_INPUT,
  run: () => R,
  'run+jump': (k) => ({ left: false, right: true, jump: k % 40 < 14, jumpPressed: k % 40 === 0 }),
};

it.runIf(!!process.env.LDD_P4)('replay and calm probe', () => {
  const ids = process.env.LDD_P4 === '1' ? LEVELS.filter((l) => l.id.startsWith('SVP-')).map((l) => l.id) : process.env.LDD_P4!.split(',');
  const out: string[] = [];
  for (const id of ids) {
    const def = LEVELS.find((l) => l.id === id)!;
    (globalThis as any).__lddRec = [];
    play(def, SOLUTIONS[id]);
    const rec0 = (globalThis as any).__lddRec as number[];
    (globalThis as any).__lddRec = undefined;
    const LAG = +(process.env.LDD_LAG ?? 0);
    const rec = [...Array(LAG).fill(0), ...rec0];
    // checkpoint reach ticks on the proven route
    const T: number[] = [0];
    const w0 = new World(def, INFO);
    def.build?.(w0);
    for (let i = 0; i < rec.length && w0.state === 'play'; i++) {
      const cp = w0.cp;
      w0.step(decodeInput(rec[i]));
      if (w0.cp > cp) T.push(i + 1);
    }
    const END = rec.length;
    const stretch: { from: number; to: number; worst: number; how: string; at: number }[] = T.map((t, k) => ({ from: t, to: k + 1 < T.length ? T[k + 1] : END, worst: 0, how: '', at: 0 }));
    // branch points
    for (let t = STEP; t < END; t += STEP) {
      let k = 0;
      while (k + 1 < T.length && T[k + 1] <= t) k++;
      for (const [name, f] of Object.entries(ways)) {
        const r = replay(def, INFO, rec.slice(0, t));
        let respawn = T[k];
        let cp = r.cp;
        for (let j = 0; j < HORIZON && r.state === 'play'; j++) {
          r.step(f(j));
          if (r.cp > cp) {
            cp = r.cp;
            respawn = t + j + 1;
          }
        }
        if (r.state === 'dead') {
          // time to get back to where it died: from the respawn along the proven route to this point, then the rest of the branch
          const replayS = (r.tick - respawn) / 120;
          const s = stretch[Math.min(k, stretch.length - 1)];
          if (replayS > s.worst) {
            s.worst = replayS;
            s.how = `${name}@${(t / 120).toFixed(1)}s ${r.deathCause}`;
          }
        }
      }
    }
    out.push(`${id} route ${(END / 120).toFixed(1)}s, ${T.length} stretches:`);
    stretch.forEach((s, k) => out.push(`  s${k} ${(s.from / 120).toFixed(1)}-${(s.to / 120).toFixed(1)}s len ${((s.to - s.from) / 120).toFixed(1)}s  worst replay ${s.worst.toFixed(1)}s ${s.how}`));
    // calm at each checkpoint, at lag 0/4/8/12 (the route's inputs arrive late)
    for (const lag of [0, 4, 8, 12]) {
      const rec2 = [...Array(lag).fill(0), ...rec];
      const w = new World(def, INFO);
      def.build?.(w);
      const bad: string[] = [];
      for (let i = 0; i < rec2.length && w.state === 'play'; i++) {
        const cp = w.cp;
        w.step(decodeInput(rec2[i]));
        if (w.cp > cp) {
          const variants: [string, (r: World, k: number) => void][] = [
            ['idle4s', () => {}],
            ['run0.3', (r, k) => r.step(k < 36 ? R : NO_INPUT)],
            ['tap', (r, k) => r.step(k === 0 ? { left: false, right: false, jump: true, jumpPressed: true } : k < 6 ? { left: false, right: false, jump: true, jumpPressed: false } : NO_INPUT)],
          ];
          for (const [vn, fn] of variants) {
            const r = replay(def, INFO, rec2.slice(0, i + 1));
            for (let k = 0; k < 480 && r.state === 'play'; k++) {
              if (vn === 'idle4s') r.step(NO_INPUT);
              else fn(r, k);
            }
            if (r.state !== 'play') bad.push(`cp${w.cp}@${Math.round(w.player.x / 16)} ${vn}: ${r.deathCause}`);
          }
        }
      }
      out.push(`  calm lag ${lag}: ${bad.length ? bad.join('; ') : 'ok'}`);
    }
  }
  console.log('P4\n' + out.join('\n'));
}, 3600000);

// candidate checkpoints: standing still on the ground, calm for 4 s at lag 0-12 (probe 4b)
it.runIf(!!process.env.LDD_P4B)('candidate checkpoints', () => {
  const out: string[] = [];
  for (const id of process.env.LDD_P4B!.split(',')) {
    const def = LEVELS.find((l) => l.id === id)!;
    (globalThis as any).__lddRec = [];
    play(def, SOLUTIONS[id]);
    const rec = (globalThis as any).__lddRec as number[];
    (globalThis as any).__lddRec = undefined;
    const parts = (def.parts ?? []).map((p) => `${p.kind}@${p.x0}`).join(' ');
    out.push(`${id} parts: ${parts}`);
    const w = new World(def, INFO);
    def.build?.(w);
    const cand: string[] = [];
    for (let i = 0; i < rec.length && w.state === 'play'; i++) {
      w.step(decodeInput(rec[i]));
      if (i % 60 !== 0 || !w.player.onGround || Math.abs(w.player.vx) > 20) continue;
      let ok = true;
      for (const lag of [0, 6, 12]) {
        const r = replay(def, INFO, [...Array(lag).fill(0), ...rec].slice(0, i + 1 + lag));
        for (let k = 0; k < 480 && r.state === 'play'; k++) r.step(NO_INPUT);
        if (r.state !== 'play') ok = false;
        const r2 = replay(def, INFO, [...Array(lag).fill(0), ...rec].slice(0, i + 1 + lag));
        for (let k = 0; k < 480 && r2.state === 'play'; k++) r2.step(k < 36 ? R : NO_INPUT);
        if (r2.state !== 'play') ok = false;
      }
      if (ok) cand.push(`${(i / 120).toFixed(1)}s col ${(w.player.cx / 16).toFixed(1)}`);
    }
    out.push('  ' + cand.join(' | '));
  }
  console.log('P4B\n' + out.join('\n'));
}, 3600000);
