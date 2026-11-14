// Hidden checkpoints: the proven route passes every one of them on foot, and a replay of the
// inputs up to that moment rebuilds exactly the same world (so a respawn there is fair and exact).
import { describe, expect, it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { World } from '../src/game/world';
import { decodeInput, replay } from '../src/game/replay';
import { INFO } from './helpers';
import { play } from './runner';
import { SOLUTIONS } from './solutions';

const snap = (w: World) =>
  JSON.stringify({
    t: w.tick,
    p: [w.player.x, w.player.y, Math.round(w.player.vx), Math.round(w.player.vy)],
    s: w.solids.map((s) => [s.x, s.y, s.collidable ? 1 : 0]),
    e: w.entities.length,
    st: w.state,
  });

describe('hidden checkpoints', () => {
  for (const def of LEVELS) {
    const probe = new World(def, INFO);
    def.build?.(probe);
    if (!probe.checkpoints.length) continue;
    it(`${def.id}: route passes all ${probe.checkpoints.length}, replay is exact`, () => {
      (globalThis as any).__lddRec = [];
      const { w: done } = play(def, SOLUTIONS[def.id]);
      const rec = (globalThis as any).__lddRec as number[];
      (globalThis as any).__lddRec = undefined;
      expect(done.state).toBe('won');
      // walk the same inputs again, noting the tick each checkpoint is first passed
      const w = new World(def, INFO);
      def.build?.(w);
      const at: number[] = [];
      for (let i = 0; i < rec.length && w.state === 'play'; i++) {
        const cp = w.cp;
        w.step(decodeInput(rec[i]));
        if (w.cp > cp) at.push(i + 1);
      }
      expect(w.cp, `${def.id} passes ${w.cp + 1}/${w.checkpoints.length}`).toBe(w.checkpoints.length - 1);
      for (const n of at) {
        const a = new World(def, INFO);
        def.build?.(a);
        for (let i = 0; i < n; i++) a.step(decodeInput(rec[i]));
        const b = replay(def, INFO, rec.slice(0, n));
        expect(snap(b)).toBe(snap(a));
      }
    });
  }
});
