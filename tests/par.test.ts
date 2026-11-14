import { it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { play } from './runner';
import { SOLUTIONS } from './solutions';
// LDD_PAR=1 npx vitest run tests/par.test.ts --silent=false  → bot clear time ×1.35 for every long stage
it.runIf(!!process.env.LDD_PAR)('par', () => {
  const out: Record<string, number> = {};
  for (const def of LEVELS) {
    if (!def.parts) continue;
    const { w } = play(def, SOLUTIONS[def.id]);
    out[def.id] = Math.round((w.winTick / 120) * 1.35);
  }
  console.log('PARS ' + JSON.stringify(out));
});
