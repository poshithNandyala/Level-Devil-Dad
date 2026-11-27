import { it } from 'vitest';
import { LEVELS } from '../../src/game/levels';
import { World, NO_INPUT, type InputState } from '../../src/game/world';
import { decodeInput, replay } from '../../src/game/replay';
import { INFO } from '../helpers';
import { play } from '../runner';
import { SOLUTIONS } from '../solutions';
import { causeLines } from '../../src/game/cities/lko/causes';
// QA round 4 scratch (the Dispur tester's method): from where the lag-0 route first stands at each part's start (room =
// spawn), six unscripted plays: walk on, short hop, long jump, wait 4 s then walk, hop every 0.3 s, back off. Lag = the
// play starts that many ticks late. Prints cause@tick, x and Tara's line so each line can be read against the play.
type G = (t: number, w: World) => InputState;
const R = (w: World): InputState => ({ ...NO_INPUT, right: true });
const GEN: [string, G][] = [
  ['walk', (t, w) => R(w)],
  ['shorthop', (t, w) => ({ ...R(w), jump: t < 6, jumpPressed: t === 0 })],
  ['longjump', (t, w) => ({ ...R(w), jump: t < 24, jumpPressed: t === 0 })],
  ['wait4walk', (t, w) => (t < 480 ? NO_INPUT : R(w))],
  ['hop0.3', (t, w) => ({ ...R(w), jump: t % 36 < 10, jumpPressed: t % 36 === 0 })],
  ['backoff', () => ({ ...NO_INPUT, left: true })],
];
it.runIf(!!process.env.QAG)('qa lko generic plays', () => {
  const out: string[] = [];
  for (const def of LEVELS.filter((d) => d.id.startsWith('LKO'))) {
    (globalThis as any).__lddRec = [];
    play(def, SOLUTIONS[def.id]);
    const rec = (globalThis as any).__lddRec as number[];
    (globalThis as any).__lddRec = undefined;
    const parts: [string, number][] = [['room', -1], ...(def.parts ?? []).map((p) => [p.kind, p.x0] as [string, number])];
    const w0 = new World(def, INFO);
    def.build?.(w0);
    const at: Record<string, number> = { room: 0 };
    for (let i = 0; i < rec.length && w0.state === 'play'; i++) {
      w0.step(decodeInput(rec[i]));
      for (const [k, x0] of parts) if (at[k] === undefined && x0 >= 0 && w0.player.onGround && w0.player.x >= (x0 + 0.5) * 16) at[k] = i + 1;
    }
    for (const [k, x0] of parts) {
      if (at[k] === undefined) { out.push(`${def.id} ${k}: not reached`); continue; }
      for (const lag of [0, 6, 12])
        for (const [name, g] of GEN) {
          const r = at[k] ? replay(def, INFO, rec.slice(0, at[k])) : (() => { const ww = new World(def, INFO); def.build?.(ww); return ww; })();
          r.player.vx = 0;
          const t0 = r.tick;
          for (let t = 0; t < 2400 + lag && r.state === 'play'; t++) r.step(t < lag ? NO_INPUT : g(t - lag, r));
          const x = (r.player.cx / 16).toFixed(1);
          const rel = x0 >= 0 ? `act+${(r.player.cx / 16 - x0).toFixed(1)}` : '';
          const line = r.deathCause ? (causeLines[r.deathCause] ?? ['(no LKO line)']).join(' / ') : '';
          out.push(`${def.id} ${k} | ${name} lag${lag} | ${r.state === 'dead' ? `${r.deathCause}@${r.tick} (+${r.tick - t0}) x${x} ${rel}` : r.state} | ${line}`);
        }
    }
  }
  require('fs').writeFileSync(process.env.QAG_OUT ?? '/tmp/qa-lko2/generic.txt', out.join('\n'));
  console.log(`GEN ${out.length} plays`);
}, 1200000);
