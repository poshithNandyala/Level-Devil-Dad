import { it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { play } from './runner';
import { SOLUTIONS } from './solutions';
it.runIf(!!process.env.LDD_T)('gtk times', () => {
  const out: string[] = [];
  for (const def of LEVELS) {
    if (def.city !== 'GTK') continue;
    const { w } = play(def, SOLUTIONS[def.id]);
    out.push(`${def.id} ${(w.winTick / 120).toFixed(1)}s ${w.state}`);
  }
  console.log(out.join('\n'));
});
