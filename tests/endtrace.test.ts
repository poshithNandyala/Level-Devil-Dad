import { it } from 'vitest';
import { LEVEL_BY_ID } from '../src/game/levels';
import { play } from './runner';
import { SOLUTIONS } from './solutions';
// npx vitest run tests/endtrace.test.ts --silent=false with LDD_ID=XXX-0N, LDD_N lines, LDD_EXTRA js (w in scope)
it.runIf(!!process.env.LDD_ID)('ending trace', () => {
  const id = process.env.LDD_ID!;
  const def = LEVEL_BY_ID.get(id)!;
  (globalThis as any).__lddWatch = (w: any) => `tw=${w.flags.twist} ` + (process.env.LDD_EXTRA ? eval(process.env.LDD_EXTRA) : '');
  let log: string[] = [];
  try {
    const r = play(def, SOLUTIONS[id], undefined, true);
    log = r.log;
    console.log('state', r.w.state, r.w.deathCause, 'doorX', def.doorX);
  } catch (e) {
    console.log(String(e), (e as Error).stack?.split("\n").slice(0, 6).join("\n"));
  }
  console.log(log.slice(-(+(process.env.LDD_N ?? 30))).join('\n'));
});
