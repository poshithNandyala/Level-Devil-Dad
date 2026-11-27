import { it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { play } from './runner';
import { SOLUTIONS } from './solutions';
// scratch: exact route time of each SVP stage (seconds)
it.runIf(!!process.env.LDD_T)('route times', () => {
  const only = process.env.LDD_T === '1' ? '' : process.env.LDD_T!;
  const out: string[] = [];
  for (const def of LEVELS) {
    if (!def.id.startsWith('SVP-')) continue;
    if (only && !only.split(',').includes(def.id)) continue;
    const { w } = play(def, SOLUTIONS[def.id]);
    out.push(`${def.id} ${w.state} ${(w.winTick / 120).toFixed(1)}s`);
  }
  console.log('TIMES ' + out.join(' | '));
});
