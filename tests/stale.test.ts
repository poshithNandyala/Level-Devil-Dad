// The way the player already knows must not be the way through any more.
// Each reworked stage is played with the route that won the last version it shipped in (a frozen copy of
// that version's routes in tests/frozen/), and that route has to die. Add a stage here when you rework it.
import { describe, expect, it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { INFO } from './helpers';
import { play } from './runner';
import type { Step } from './runner';
import { SOLUTIONS as V0_16_13 } from './frozen/v0.16.13';

const REWORKED: { ids: string[]; old: Record<string, Step[]>; version: string }[] = [
  { version: 'v0.16.13', old: V0_16_13, ids: ['TVM-01', 'TVM-02', 'TVM-03', 'TVM-04', 'TVM-05', 'TVM-06', 'TVM-07', 'TVM-08'] },
];

describe('last version’s route dies', () => {
  for (const r of REWORKED) {
    for (const id of r.ids) {
      it(`${id}: the ${r.version} route`, () => {
        const def = LEVELS.find((l) => l.id === id)!;
        const { w } = play(def, r.old[id], INFO);
        expect(w.state, `${id}: the ${r.version} route still wins`).toBe('dead');
      });
    }
  }
});
