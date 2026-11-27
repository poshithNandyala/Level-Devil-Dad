import { it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { play } from './runner';
import { MISTAKES } from './solutions';

// scratch: trace one scripted play (stage, label prefix) every 6 ticks from tick T0
it.runIf(!!process.env.PROBE)('probe', () => {
  const [id, pre, t0] = (process.env.PROBE as string).split('|');
  const def = LEVELS.find((l) => l.id === id)!;
  const m = MISTAKES[id].find((q) => q.what.startsWith(pre))!;
  const out: string[] = [];
  const steps = m.steps.map((s: any, i: number) => ({
    ...s,
    until: (w: any) => {
      if (w.tick % 6 === 0 && w.tick > Number(t0)) out.push(`${w.tick} s${i} ${s.note ?? ''} x ${(w.player.x / 16).toFixed(2)} y ${w.player.y.toFixed(0)} g ${w.player.onGround}`);
      return s.until ? s.until(w) : false;
    },
  }));
  const { w } = play(def, steps);
  console.log('PROBE\n' + out.join('\n') + `\n${w.deathCause}@${w.deathTick}`);
});
