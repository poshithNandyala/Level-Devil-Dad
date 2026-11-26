// Dispur's door endings, one per stage 02-10, each a new idea. Kinds start with 'dis-'.
import { World } from '../../world';
import { lock, tara } from '../../levels/endkit';
import { px, sand, river, Decor, GROUND } from './entities';
import type { Ending } from '../../levels/endkit';

export type DisEndingKind = 'dis-hut-shut';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<DisEndingKind, true> {}
}

export const endings: Record<DisEndingKind, Ending> = {
  // ================================================================ DIS-02: the farmer shuts the hut
  /** The door is the farmer's hut on the far bank. While the river is moving he keeps it shut. Two bars cross: the first
   *  sinks once the second is up. Get across, then wait at the hut till the water is calm. */
  'dis-hut-shut': {
    space: 26,
    after: 5,
    advice: 'The door is the farmer’s hut on the last bank, and he keeps it shut while the river is moving. Land on the first bar, wait for the siren and the second bar to come up, cross, and then wait at the hut until the water is calm and he opens up.',
    paint: (g, D) => {
      g.pit(D - 20, D - 5);
    },
    build(w: World, d) {
      const D = Math.round(d.x / 16);
      river(w, D - 20, D - 4);
      const f = sand(
        w,
        [
          [[D - 18, D - 13], [D - 18, D - 15]],
          [null, [D - 10, D - 6]],
        ],
        [px(D - 18) - 4],
      );
      w.flags.twist = 'shut';
      const L = lock(w, d, 'Roba! Lahe lahe. | Stop! Slowly.');
      w.onTick((w2) => {
        if (f.e < 0 && f.level >= 1 && w2.flags.twist === 'shut') {
          L.unlock();
          w2.flags.twist = 'open';
        }
      });
      w.add(
        new Decor((ctx) => {
          // the hut round the door
          const x = d.x + 8;
          ctx.fillStyle = '#8D6B2E';
          ctx.fillRect(x - 17, GROUND - 38, 34, 38);
          ctx.fillStyle = '#B08B3C';
          ctx.beginPath();
          ctx.moveTo(x - 22, GROUND - 38);
          ctx.lineTo(x, GROUND - 56);
          ctx.lineTo(x + 22, GROUND - 38);
          ctx.closePath();
          ctx.fill();
        }, -4),
      );
      w.when((w2) => w2.player.cx > px(D - 24), (w2) => tara(w2, 'Bhal, Dad! | Good, Dad!', 2.4));
    },
  },
};
