import { it } from 'vitest';
import { LEVELS } from '../../src/game/levels';
import { SOLUTIONS } from '../solutions';
import { play, type Step } from '../runner';
import { causeLines } from '../../src/game/cities/dis/causes';
// QA round 2 scratch: unscripted plays inside each act (walk on, hop early, long jump, wait then walk, hop every 0.3 s,
// back off), from the route up to the act's marker. Prints cause, x and Tara's line, so each line can be read against
// what the play did there (law 9; the recause wrapper's coverage).
const GEN: [string, Step[]][] = [
  ['walk on', [{ hold: 'R', max: 2400, until: (w) => w.state !== 'play' }]],
  ['short hop at once', [{ hold: 'R', jump: 6, ticks: 6 }, { hold: 'R', max: 2400, until: (w) => w.state !== 'play' }]],
  ['long jump at once', [{ hold: 'R', jump: 24, ticks: 24 }, { hold: 'R', max: 2400, until: (w) => w.state !== 'play' }]],
  ['wait 4 s then walk', [{ hold: '', ticks: 480 }, { hold: 'R', max: 2400, until: (w) => w.state !== 'play' }]],
  ['hop every 0.3 s', Array.from({ length: 60 }, (): Step => ({ hold: 'R', jump: 10, ticks: 36 }))],
  ['back off', [{ hold: 'L', max: 900, until: (w) => w.state !== 'play' }]],
];
it.runIf(!!process.env.QAG)('qa dis generic act plays', () => {
  const out: string[] = [];
  for (const def of LEVELS.filter((d) => d.city === 'DIS')) {
    const route = SOLUTIONS[def.id];
    for (const p of def.parts ?? []) {
      if (p.kind === 'room' || p.kind === 'door') continue;
      const i = route.findIndex((s) => s.note === `act:${p.kind}` || (s as { actMark?: string }).actMark === p.kind);
      if (i < 0) { out.push(`${def.id} ${p.kind}: no marker`); continue; }
      for (const lag of (process.env.QAG_LAGS ?? '0').split(',').map(Number))
      for (const [name0, st0] of GEN) {
        // lag: the whole play starts `lag` ticks late (the reaction is late; the move is the same)
        const name = `${name0} lag${lag}`;
        const st: Step[] = lag ? [{ hold: '', ticks: lag }, ...st0] : st0;
        let w;
        try { w = play(def, [...route.slice(0, i), ...st]).w; } catch { out.push(`${def.id} ${p.kind} | ${name} | stuck (blocked, alive)`); continue; }
        const x = (w.player.cx / 16).toFixed(1);
        const rel = (w.player.cx / 16 - p.x0).toFixed(1);
        const line = w.deathCause ? (causeLines[w.deathCause] ?? ['(no DIS line)']).join(' / ') : '';
        out.push(`${def.id} ${p.kind} | ${name} | ${w.state === 'dead' ? `${w.deathCause}@${w.tick} x${x} (act+${rel})` : w.state} | ${line}`);
      }
    }
  }
  console.log('GEN\n' + out.join('\n'));
}, 600000);
