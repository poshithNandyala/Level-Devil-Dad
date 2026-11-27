// scratch (not committed): clear ticks and every play's death cause/tick for the KOH report
import { it } from 'vitest';
import { LEVELS } from '../../../src/game/levels';
import { SOLUTIONS, NAIVE, FIX, MISTAKES } from '../../solutions';
import { play } from '../../runner';

it.runIf(!!process.env.KOH_STATS)('koh stats', () => {
  const out: string[] = [];
  for (const def of LEVELS.filter((l) => l.city === 'KOH')) {
    const r = play(def, SOLUTIONS[def.id]);
    out.push(`${def.id} route ${r.w.state} tick ${r.w.tick} (${(r.w.tick / 120).toFixed(1)} s) cps ${r.w.checkpoints.map((c) => (c / 16).toFixed(1)).join(',')} par ${def.par}`);
    const plays: [string, any][] = [];
    if (NAIVE[def.id]) plays.push(['NAIVE', NAIVE[def.id]]);
    if (FIX[def.id]) plays.push(['FIX', FIX[def.id]]);
    (MISTAKES[def.id] ?? []).forEach((m, i) => plays.push([`M${i} ${m.what}`, m]));
    for (const [k, p] of plays) {
      try {
        const q = play(def, p.steps);
        out.push(`  ${k}: ${q.w.state} ${q.w.deathCause ?? ''} @tick ${q.w.tick} (${(q.w.tick / 120).toFixed(2)} s) x${(q.w.player.x / 16).toFixed(1)} want ${p.cause ?? '-'}`);
      } catch (e) {
        out.push(`  ${k}: ERR ${(e as Error).message}`);
      }
    }
  }
  console.log('KOHSTATS\n' + out.join('\n'));
});
