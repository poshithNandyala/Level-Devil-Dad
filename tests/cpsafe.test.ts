// Every hidden checkpoint must be a fair place to come back to: standing still there for 1.5 s is survivable.
// Each checkpoint is probed from replay(), as a real respawn is, so the cost is checkpoints x route length.
// That is allowed to grow: a stage takes as many checkpoints as its play needs (a 180 s marathon at one per
// 8 s is 23), and the explicit timeout below is set so no test limit decides how far a player replays.
import { describe, expect, it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { World, NO_INPUT } from '../src/game/world';
import { decodeInput, replay } from '../src/game/replay';
import { INFO } from './helpers';
import { play } from './runner';
import { SOLUTIONS } from './solutions';

describe('checkpoints are safe to respawn at', () => {
  for (const def of LEVELS) {
    const probe = new World(def, INFO);
    def.build?.(probe);
    if (!probe.checkpoints.length) continue;
    it(
      def.id,
      () => {
      (globalThis as any).__lddRec = [];
      play(def, SOLUTIONS[def.id]);
      const rec = (globalThis as any).__lddRec as number[];
      (globalThis as any).__lddRec = undefined;
      const w = new World(def, INFO);
      def.build?.(w);
      const bad: string[] = [];
      for (let i = 0; i < rec.length && w.state === 'play'; i++) {
        const cp = w.cp;
        w.step(decodeInput(rec[i]));
        if (w.cp > cp) {
          const r = replay(def, INFO, rec.slice(0, i + 1));
          r.player.vx = 0;
          for (let k = 0; k < 180 && r.state === 'play'; k++) r.step(NO_INPUT);
          if (r.state !== 'play') bad.push(`cp${w.cp}@${Math.round(w.player.x / 16)}:${r.deathCause}`);
        }
      }
      expect(bad, `${def.id} unsafe checkpoints`).toEqual([]);
      },
      120_000,
    );
  }
});
