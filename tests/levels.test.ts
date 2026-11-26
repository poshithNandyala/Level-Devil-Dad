import { describe, it, expect } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { World } from '../src/game/world';
import { INFO } from './helpers';
import { play, sameKind } from './runner';
import { SOLUTIONS, NAIVE, FIX, MISTAKES } from './solutions';

describe('stages', () => {
  for (const def of LEVELS) {
    describe(def.id, () => {
      it('builds', () => {
        const w = new World(def, INFO);
        def.build?.(w);
        for (let i = 0; i < 240; i++) w.step({ left: false, right: false, jump: false, jumpPressed: false });
      });

      it('is beatable with the scripted solution', () => {
        const sol = SOLUTIONS[def.id];
        expect(sol, `no solution for ${def.id}`).toBeTruthy();
        const { w, log } = play(def, sol, INFO, true);
        if (w.state !== 'won') console.log(log.slice(-40).join('\n'));
        expect(w.state, `${def.id} ended ${w.state} (${w.deathCause})`).toBe('won');
      });

      it('is deterministic', () => {
        const a = play(def, SOLUTIONS[def.id]).w;
        const b = play(def, SOLUTIONS[def.id]).w;
        expect(a.tick).toBe(b.tick);
        expect(a.player.x).toBe(b.player.x);
      });

      it('beatable for every rival variant', () => {
        for (const rival of ['tara', 'bandar', 'none'] as const) {
          const { w } = play(def, SOLUTIONS[def.id], { ...INFO, rival });
          expect(w.state).toBe('won');
        }
      });

      if (FIX[def.id]) {
        it('punishes the obvious fix too', () => {
          const n = FIX[def.id];
          const { w } = play(def, n.steps);
          expect(w.state, `${def.id} fix ended ${w.state}`).toBe('dead');
          if (n.cause) expect(sameKind(w.deathCause, n.cause), `died of ${w.deathCause}, want ${n.cause}`).toBe(true);
        });
      }

      for (const m of MISTAKES[def.id] ?? []) {
        it(`punishes: ${m.what}`, () => {
          const { w } = play(def, m.steps);
          expect(w.state, `${def.id} (${m.what}) ended ${w.state}`).toBe('dead');
          if (m.cause) expect(sameKind(w.deathCause, m.cause), `died of ${w.deathCause}, want ${m.cause}`).toBe(true);
        });
      }

      if (NAIVE[def.id]) {
        it('punishes the obvious play', () => {
          const n = NAIVE[def.id];
          const { w } = play(def, n.steps);
          expect(w.state).toBe('dead');
          if (n.cause) expect(sameKind(w.deathCause, n.cause), `died of ${w.deathCause}, want ${n.cause}`).toBe(true);
        });
      }
    });
  }
});
