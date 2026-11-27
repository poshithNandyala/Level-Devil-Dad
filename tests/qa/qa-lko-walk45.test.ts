import { it } from 'vitest';
import { LEVELS } from '../../src/game/levels';
import { World, NO_INPUT, type InputState } from '../../src/game/world';
import { decodeInput, replay } from '../../src/game/replay';
import { INFO } from '../helpers';
import { play } from '../runner';
import { SOLUTIONS } from '../solutions';
// QA scratch: from each checkpoint (where the lag-0 route takes it), walk forward 4.5 tiles and stop 1 s; and tap-jump
// forward then walk to 4.5 tiles. A death here means something lethal sits within 4.5 tiles of the checkpoint.
it.runIf(!!process.env.QA45)('qa lko walk 4.5', () => {
  for (const def of LEVELS.filter((d) => d.id.startsWith('LKO'))) {
    (globalThis as any).__lddRec = [];
    play(def, SOLUTIONS[def.id]);
    const rec = (globalThis as any).__lddRec as number[];
    (globalThis as any).__lddRec = undefined;
    const w = new World(def, INFO);
    def.build?.(w);
    const caps: { cp: number; n: number; x: number }[] = [];
    for (let i = 0; i < rec.length && w.state === 'play'; i++) {
      const c = w.cp;
      w.step(decodeInput(rec[i]));
      if (w.cp > c) caps.push({ cp: w.cp, n: i + 1, x: w.player.x });
    }
    const out: string[] = [];
    for (const c of caps) {
      for (const mode of ['walk', 'tapwalk']) {
        const r = replay(def, INFO, rec.slice(0, c.n));
        r.player.vx = 0;
        const fwd = (ww: World): InputState => (ww.flipped ? { ...NO_INPUT, left: true } : { ...NO_INPUT, right: true });
        const goal = c.x + 4.5 * 16;
        let t = 0, stop = -1;
        while (r.state === 'play' && t < 600) {
          let inp: InputState = NO_INPUT;
          if (stop < 0 && r.player.x >= goal) stop = t;
          if (stop < 0) {
            inp = fwd(r);
            if (mode === 'tapwalk' && t < 6) inp = { ...inp, jump: true, jumpPressed: t === 0 };
          } else if (t - stop > 120) break;
          r.step(inp);
          t++;
        }
        if (r.state === 'dead') out.push(`cp${c.cp}@${(c.x / 16).toFixed(1)} ${mode} -> ${r.deathCause} at +${((r.player.x - c.x) / 16).toFixed(1)} tiles, ${(t / 120).toFixed(2)} s`);
      }
    }
    console.log(`W45 ${def.id} cps=${caps.length} ${out.length ? '\n  ' + out.join('\n  ') : 'clear'}`);
  }
}, 600000);
