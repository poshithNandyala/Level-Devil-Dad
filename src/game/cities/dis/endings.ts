// Dispur's door endings, one per stage 02-10, each a new idea. Kinds start with 'dis-'.
import { World } from '../../world';
import { lock, tara } from '../../levels/endkit';
import { px, sand, river, Decor, GROUND } from './entities';
import { Hedge, Plucker } from './pluck';
import { Pan } from './pitha';
import { roller } from '../../levels/kit';
import type { Ending } from '../../levels/endkit';

export type DisEndingKind = 'dis-hut-shut' | 'dis-tea-chest' | 'dis-laru-plate';

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
  // ================================================================ DIS-03: the tea chest
  /** The door is the tea chest at the end of the path, nailed shut until the plucker walking up it has tipped her basket in. */
  'dis-tea-chest': {
    space: 28,
    after: 5,
    advice: 'The door is the tea chest at the end of the path, nailed shut until the plucker has tipped her basket in. Follow her up the path, a few steps behind, and wait for the lid. Run ahead of her and you are standing in front of the chest when she arrives.',
    build(w: World, d) {
      const D = Math.round(d.x / 16);
      const h = w.add(new Hedge(D - 14));
      w.add(h.slab);
      const p = w.add(new Plucker(px(D - 20), px(D - 26), [h], px(D - 3)));
      (w.flags.pluckers ??= []).push(p);
      w.flags.twist = 'shut';
      const L = lock(w, d, 'Roba! Lid. | Stop! The lid.');
      p.onEnd = (w2) => {
        L.unlock();
        w2.flags.twist = 'open';
        w2.sfx('thud', d.x + 8, d.y + 16);
      };
      w.add(
        new Decor((ctx) => {
          const x = d.x - 6;
          ctx.fillStyle = '#8D6B2E';
          ctx.fillRect(x, GROUND - 26, 28, 26);
          ctx.fillStyle = '#6A4B1C';
          ctx.fillRect(x, GROUND - 26, 28, 4);
          ctx.fillRect(x + 12, GROUND - 22, 4, 22);
          ctx.fillStyle = '#C9A253';
          ctx.fillRect(x + 4, GROUND - 17, 4, 4);
        }, -4),
      );
    },
  },
  // ================================================================ DIS-04: the laru plate
  /** The door is on a plate of laru, past the last crepe. The cook's boy rolls laru balls down the plate at you. */
  'dis-laru-plate': {
    space: 30,
    after: 5,
    advice: 'The door is on a plate of laru past the last crepe: hop on to the plate, and hop each laru ball the boy rolls down it at you. Jump over them; never wait on a matte crepe.',
    paint: (g, D) => {
      g.pit(D - 21, D - 5);
    },
    build(w: World, d) {
      const D = Math.round(d.x / 16);
      const p = w.add(new Pan(px(D - 21), px(D - 4), [{ x: D - 19, w: 4, o: 0 }, { x: D - 14, w: 4, o: 400 }, { x: D - 9, w: 4, o: 200 }], px(D - 22), 600, 300));
      p.setup(w);
      (w.flags.pans ??= []).push(p);
      let next = 0;
      w.add(
        new Decor(
          (ctx) => {
            // the plate under the door
            ctx.fillStyle = '#C9A253';
            ctx.fillRect(px(D - 4), GROUND - 1, px(9), 3);
            ctx.fillStyle = '#8D6B2E';
            ctx.fillRect(px(D - 4), GROUND + 2, px(9), 2);
          },
          -4,
          (w2) => {
            if (w2.player.cx > px(D - 8) && w2.player.cx < px(D - 1) && w2.tick >= next) {
              next = w2.tick + 360;
              roller(w2, 'dis-laru', px(D + 4), GROUND - 12, -50, { cause: 'dis-laru' });
            }
          },
        ),
      );
    },
  },
};
