import { it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { play } from './runner';
import { SOLUTIONS } from './solutions';
it.runIf(!!process.env.LDD_T)('dis times', () => {
  const out: string[] = [];
  for (const def of LEVELS) {
    if (def.city !== 'DIS' || !SOLUTIONS[def.id]) continue;
    const { w } = play(def, SOLUTIONS[def.id]);
    out.push(`${def.id} ${(w.winTick / 120).toFixed(1)}s par ${def.par} state ${w.state} cps ${w.checkpoints.length}`);
  }
  console.log('TIMES\n' + out.join('\n'));
});
