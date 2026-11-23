import { it } from 'vitest';
import { LEVEL_BY_ID } from '../src/game/levels';
import * as R from './runner';
const { play } = R;
import { SOLUTIONS, NAIVE, FIX } from './solutions';

const ID = process.env.LDD_LEVEL;
it.runIf(!!ID)('debug ' + ID, () => {
  const def = LEVEL_BY_ID.get(ID!)!;
  if (process.env.LDD_WATCH) { const f = new Function('w', 'R', 'return ' + process.env.LDD_WATCH); (globalThis as any).__lddWatch = (w: any) => { try { return JSON.stringify(f(w, R)); } catch (e) { return 'ERR ' + (e as Error).message; } }; }
  if (process.env.LDD_REC) (globalThis as any).__lddRec = [];
  const steps = process.env.LDD_FIX ? FIX[ID!].steps : process.env.LDD_NAIVE ? NAIVE[ID!].steps : SOLUTIONS[ID!] ?? [];
  const { w, log } = play(def, steps, undefined, true);
  console.log(log.join('\n'));
  console.log('RESULT', w.state, w.deathCause, 'tick', w.tick);
  if (process.env.LDD_REC) require('fs').writeFileSync(process.env.LDD_REC, JSON.stringify((globalThis as any).__lddRec));
});
