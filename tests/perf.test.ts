import { it } from 'vitest';
import { LEVEL_BY_ID } from '../src/game/levels';
import { replay } from '../src/game/replay';
import { play } from './runner';
import { SOLUTIONS } from './solutions';
import { INFO } from './helpers';
it.runIf(!!process.env.LDD_PERF)('replay cost', () => {
  for (const id of ['BOM-04', 'TVM-07', 'PDY-06', 'KVT-05']) {
    (globalThis as any).__lddRec = [];
    play(LEVEL_BY_ID.get(id)!, SOLUTIONS[id]);
    const rec = (globalThis as any).__lddRec as number[];
    (globalThis as any).__lddRec = undefined;
    const t0 = performance.now();
    for (let k = 0; k < 5; k++) replay(LEVEL_BY_ID.get(id)!, INFO, rec);
    console.log(id, rec.length, 'ticks:', ((performance.now() - t0) / 5).toFixed(1), 'ms per replay');
  }
});
