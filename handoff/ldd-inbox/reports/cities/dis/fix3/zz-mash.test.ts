import { it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { SOLUTIONS } from './solutions';
import { play, type Step } from './runner';

// scratch (fix round 3): QA's "hop every 0.3 s" in 04 batah, from the act's route marker, at lag 0/6/12 (a late
// start); prints each take-off and landing as tiles from the act's x, and how the play ends
it.runIf(!!process.env.MASH)('mash trace', () => {
  const def = LEVELS.find((l) => l.id === 'DIS-04')!;
  const p = def.parts!.find((q) => q.kind === 'dis04-batah')!;
  const route = SOLUTIONS['DIS-04'];
  const i = route.findIndex((s) => s.note === 'act:dis04-batah' || (s as { actMark?: string }).actMark === 'dis04-batah');
  const out: string[] = [];
  for (const lag of [0, 6, 12]) {
    const ev: string[] = [];
    let air = false;
    const mash: Step[] = Array.from({ length: 60 }, (): Step => ({ hold: 'R', jump: 10, ticks: 36 }));
    const st: Step[] = (lag ? [{ hold: '', ticks: lag } as Step] : []).concat(mash);
    const steps = [...route.slice(0, i), ...st.map((s) => ({ ...s, until: (w: any) => {
      const g = w.player.onGround;
      const r = (w.player.cx / 16 - p.x0).toFixed(2);
      if (air && g) ev.push(`L${r}`);
      if (!air && !g) ev.push(`T${r}`);
      if (process.env.MASHV && lag === 0 && w.tick % 4 === 0 && Number(r) > 4 && Number(r) < 20) ev.push(`[${r},${w.player.y.toFixed(0)}]`);
      air = !g;
      return false;
    } }))];
    const { w } = play(def, steps);
    out.push(`lag${lag}: ${ev.join(' ')} => ${w.state === 'dead' ? w.deathCause + '@' + w.tick + ' x+' + (w.player.cx / 16 - p.x0).toFixed(2) : w.state}`);
  }
  console.log('MASH\n' + out.join('\n'));
});
