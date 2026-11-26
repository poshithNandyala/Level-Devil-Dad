import { it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { play } from './runner';
import { SOLUTIONS } from './solutions';
it.runIf(!!process.env.LDD_L)('dis lag', () => {
  const id = process.env.LDD_L!;
  const def = LEVELS.find((l) => l.id === id)!;
  const out: string[] = [];
  for (const L of [0, 4, 8, 12]) {
    const steps = SOLUTIONS[id].flatMap((s) => (s.jump ? [{ hold: s.hold ?? 'R', ticks: L, max: 100 } as any, s] : [s]));
    const { w, log } = play(def, steps, undefined as any, true);
    out.push(`L=${L} ${w.state} ${w.deathCause} x=${w.player.x} y=${w.player.y} t=${w.tick}`);
    if (w.state === 'dead' && process.env.LDD_SHOW) out.push(log.slice(-14).join('\n'));
  }
  console.log('LAG\n' + out.join('\n'));
});
