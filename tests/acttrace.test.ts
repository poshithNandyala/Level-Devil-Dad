import { it } from 'vitest';
import { LEVEL_BY_ID } from '../src/game/levels';
import { play } from './runner';
import { SOLUTIONS } from './solutions';
it.runIf(!!process.env.LDD_ID)('act trace (LDD_ID=XXX-0N, LDD_N lines, LDD_EXTRA js)', () => {
  const id = process.env.LDD_ID!;
  const def = LEVEL_BY_ID.get(id)!;
  const p = def.parts![0];
  (globalThis as any).__lddWatch = (w: any) => {
    const gs = w.entities.filter((e: any) => e.letter && p.letters.includes(e.letter)).map((e: any) => `${e.letter}:${e.state}@${e.solid.x},${e.solid.y}`);
    return gs.join(' ') + ' ' + (process.env.LDD_EXTRA ? eval(process.env.LDD_EXTRA) : '');
  };
  let log: string[] = [];
  try { log = play(def, SOLUTIONS[id], undefined, true).log; } catch (e) { console.log(String(e)); }
  console.log(log.slice(-(+(process.env.LDD_N ?? 14))).join('\n'));
});
