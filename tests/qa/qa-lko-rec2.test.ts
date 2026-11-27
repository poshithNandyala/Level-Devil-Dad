import { it } from 'vitest';
import { writeFileSync, mkdirSync } from 'fs';
import { LEVELS } from '../../src/game/levels';
import { play } from '../runner';
import { SOLUTIONS, NAIVE, FIX, MISTAKES } from '../solutions';
// QA scratch round 2: record route + NAIVE/FIX/MISTAKES for LKO into /tmp/qa-lko-rec2
it('qa lko rec2', () => {
  mkdirSync('/tmp/qa-lko-rec2', { recursive: true });
  for (const def of LEVELS.filter((d) => d.id.startsWith('LKO'))) {
    const runs: [string, { steps: any[] }][] = [['route', { steps: SOLUTIONS[def.id] }]];
    if (NAIVE[def.id]) runs.push(['naive', NAIVE[def.id]]);
    if (FIX[def.id]) runs.push(['fix', FIX[def.id]]);
    (MISTAKES[def.id] ?? []).forEach((m, i) => runs.push([`m${i}`, m]));
    for (const [k, r] of runs) {
      (globalThis as any).__lddRec = [];
      const { w } = play(def, r.steps);
      const rec = (globalThis as any).__lddRec as number[];
      (globalThis as any).__lddRec = undefined;
      writeFileSync(`/tmp/qa-lko-rec2/${def.id}__${k}.json`, JSON.stringify({ rec, end: w.tick, state: w.state, cause: w.deathCause }));
      console.log(`REC ${def.id} ${k} ${w.state} ${w.deathCause ?? ''} t=${w.tick} x=${(w.player.x / 16).toFixed(1)} ${(r as any).what ?? ''}`);
    }
  }
});
