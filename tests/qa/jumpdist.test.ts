// scratch (untracked): measure jump distances on flat ground: standing (R pressed with the jump) and running (R held before)
import { it } from 'vitest';
import { LEVELS } from '../../src/game/levels';
import { World, type InputState } from '../../src/game/world';
import { INFO } from '../helpers';

it('jump distances', () => {
  const def = LEVELS.find((l) => l.id === 'ITA-09')!; // flat ground to col 8
  const out: string[] = [];
  for (const run of [false, true]) {
    for (const hold of [6, 8, 10, 12, 14, 16, 18, 20, 22]) {
      const w = new World(def, INFO);
      def.build?.(w);
      const p = w.player;
      const none: InputState = { left: false, right: false, jump: false, jumpPressed: false };
      const R: InputState = { ...none, right: true };
      // settle
      for (let t = 0; t < 10; t++) w.step(none);
      if (run) for (let t = 0; t < 30; t++) w.step(R);
      const x0 = p.x;
      const vx0 = p.vx;
      let t = 0;
      let apex = p.y;
      // jump: hold `hold` ticks with R, then R until landing
      w.step({ ...R, jump: true, jumpPressed: true });
      t++;
      while (t < hold) {
        w.step({ ...R, jump: true });
        t++;
        apex = Math.min(apex, p.y);
      }
      let air = 0;
      while (!p.onGround && air < 200) {
        w.step(R);
        air++;
        apex = Math.min(apex, p.y);
      }
      out.push(`${run ? 'running' : 'standing'} hold ${hold}: dx=${(p.x - x0).toFixed(0)} px (${((p.x - x0) / 16).toFixed(2)} tiles), rise=${(240 - 14 - apex).toFixed(0)} px, air ${hold + air} ticks, vx0=${vx0.toFixed(0)}`);
    }
  }
  console.log('JUMPDIST\n' + out.join('\n'));
});
