// Hidden checkpoints: the proven route passes every one of them on foot, and a replay of the
// inputs up to that moment rebuilds exactly the same world (so a respawn there is fair and exact).
//
// Cost does not grow with checkpoints x route length: one pass steps the world as the game does, and a
// second world steps the same inputs the way replay() does (events dropped each tick); their snapshots
// are compared at every checkpoint tick. replay() itself is then run once, to the last checkpoint, and must
// match too, so a change to replay() can't slip past. A stage may have as many checkpoints as it needs:
// a 180 s marathon with one every 8 s is 23 checkpoints. The explicit 60 s timeout is a safety net only.
import { describe, expect, it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { World } from '../src/game/world';
import { decodeInput, replay } from '../src/game/replay';
import { INFO } from './helpers';
import { play } from './runner';
import { SOLUTIONS } from './solutions';

const TIMEOUT = 60_000;

const snap = (w: World) =>
  JSON.stringify({
    t: w.tick,
    p: [w.player.x, w.player.y, Math.round(w.player.vx), Math.round(w.player.vy)],
    s: w.solids.map((s) => [s.x, s.y, s.collidable ? 1 : 0]),
    e: w.entities.length,
    st: w.state,
  });

const fresh = (def: (typeof LEVELS)[number]) => {
  const w = new World(def, INFO);
  def.build?.(w);
  return w;
};

describe('hidden checkpoints', () => {
  for (const def of LEVELS) {
    const probe = fresh(def);
    if (!probe.checkpoints.length) continue;
    it(
      `${def.id}: route passes all ${probe.checkpoints.length}, replay is exact`,
      () => {
        (globalThis as any).__lddRec = [];
        const { w: done } = play(def, SOLUTIONS[def.id]);
        const rec = (globalThis as any).__lddRec as number[];
        (globalThis as any).__lddRec = undefined;
        expect(done.state).toBe('won');
        // a: the game stepping the inputs; b: the same inputs stepped the way replay() steps them
        const a = fresh(def);
        const b = fresh(def);
        const at: number[] = [];
        for (let i = 0; i < rec.length && a.state === 'play'; i++) {
          const cp = a.cp;
          a.step(decodeInput(rec[i]));
          if (b.state === 'play') {
            b.step(decodeInput(rec[i]));
            b.events.length = 0;
          }
          if (a.cp > cp) {
            at.push(i + 1);
            expect(snap(b), `${def.id} checkpoint ${a.cp} at tick ${i + 1}`).toBe(snap(a));
          }
        }
        expect(a.cp, `${def.id} passes ${a.cp + 1}/${a.checkpoints.length}`).toBe(a.checkpoints.length - 1);
        // and replay() itself, once, to the last checkpoint
        const n = at[at.length - 1];
        const c = fresh(def);
        for (let i = 0; i < n; i++) c.step(decodeInput(rec[i]));
        expect(snap(replay(def, INFO, rec.slice(0, n))), `${def.id} replay() to the last checkpoint`).toBe(snap(c));
      },
      TIMEOUT,
    );
  }
});
