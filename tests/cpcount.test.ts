import { it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { World } from '../src/game/world';
import { INFO } from './helpers';
it.runIf(!!process.env.LDD_CPCOUNT)('checkpoint counts', () => {
  const by: Record<string, string[]> = {};
  for (const def of LEVELS) {
    const w = new World(def, INFO);
    def.build?.(w);
    const door = w.exitCell ? w.exitCell.tx : -1;
    const last = w.checkpoints.length ? Math.round(w.checkpoints[w.checkpoints.length - 1] / 16) : -1;
    (by[def.city] ??= []).push(`${def.id}:${w.checkpoints.length}cp last@${last} door@${door} ${def.ending ?? ''}`);
  }
  for (const [c, l] of Object.entries(by)) console.log(c, l.length, 'stages\n  ' + l.join('\n  '));
});
