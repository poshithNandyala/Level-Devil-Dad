import { it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { play } from './runner';
import { SOLUTIONS, NAIVE, FIX, MISTAKES } from './solutions';

it('dis cause table', () => {
  const out: string[] = ['OUT'];
  for (const def of LEVELS.filter((l) => l.id.startsWith('DIS-'))) {
    const r = (steps: any) => {
      const { w } = play(def, steps);
      return w.state === 'dead' ? `${w.deathCause}@${w.deathTick}` : w.state;
    };
    out.push(`${def.id} | room | ${NAIVE[def.id] ? r(NAIVE[def.id].steps) : '-'} | ${FIX[def.id] ? r(FIX[def.id].steps) : '-'}`);
    for (const m of MISTAKES[def.id] ?? []) out.push(`${def.id} | ${m.what} | ${r(m.steps)}`);
    const { w } = play(def, SOLUTIONS[def.id]);
    out.push(`${def.id} | route | ${((w.winTick ?? w.tick) / 120).toFixed(1)} s`);
  }
  console.log(out.join('\n'));
});
