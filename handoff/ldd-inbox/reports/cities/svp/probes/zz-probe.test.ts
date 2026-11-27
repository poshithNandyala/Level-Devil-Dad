import { it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { play } from './runner';
import { NAIVE, FIX, MISTAKES } from './solutions';
// scratch (probe 3): every NAIVE, FIX and MISTAKE of SVP, with the cause and the tick it dies on
it.runIf(!!process.env.LDD_P3)('same-tick probe', () => {
  const out: string[] = [];
  for (const def of LEVELS) {
    if (!def.id.startsWith('SVP-')) continue;
    const row = (label: string, steps: any[]) => {
      try {
        const { w } = play(def, steps);
        out.push(`${def.id} | ${label} | ${w.state === 'dead' ? w.deathCause : w.state}@${w.deathTick}`);
      } catch (e) {
        out.push(`${def.id} | ${label} | ERR ${(e as Error).message.slice(0, 60)}`);
      }
    };
    if (NAIVE[def.id]) row('NAIVE', NAIVE[def.id].steps);
    if (FIX[def.id]) row('FIX', FIX[def.id].steps);
    for (const m of MISTAKES[def.id] ?? []) row('M: ' + m.what, m.steps);
  }
  console.log('P3\n' + out.join('\n'));
});
