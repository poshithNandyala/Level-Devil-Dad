// Kolkata's door endings, one per stage 02-10, each a new idea. Kinds start with 'ccu-'.
import { Entity, type World } from '../../world';
import { lock, npc } from '../../levels/endkit';
import { px } from '../../levels/kit';
import { pool } from '../../levels/acts';
import { sign } from '../../levels/kit';
import type { Ending } from '../../levels/endkit';
import { Bus } from './entities';

export type CcuEndingKind = 'ccu-stop';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<CcuEndingKind, true> {}
}

export const NALA: [string, string] = ['rgba(96,104,74,0.9)', 'rgba(44,48,30,0.97)'];

export const endings: Record<CcuEndingKind, Ending> = {
  // ================================================================ CCU-02: the bus that stops for you
  /** An open drain in front of the door, too wide to jump. Buses never stop... except that a conductor
   *  who sees someone waiting still at the stop shouts "Howrah!" and crawls the whole way past it. */
  'ccu-stop': {
    space: 24,
    advice: 'An open drain in front of the door, too wide to jump, and the buses tear past. Stand still at the bus stop: the conductor who sees you waiting crawls the whole way across. Hop on as the footboard reaches you, and step off forward past the drain.',
    paint: (g, D) => {
      g.pit(D - 10, D - 3);
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      pool(w, D - 10, D - 2, 16, { colors: NALA, cause: 'ccu-nala' });
      sign(w, D - 15.6, 10.4, 3.2, 'BUS STOP', 'green', null, 'Howrah');
      const stop = [px(D - 16), px(D - 13)];
      let bus: Bus | null = null;
      const next = (w2: World) => {
        bus = w2.add(new Bus({ x: px(D - 34), end: px(D + 14), fast: 130, crawl: 20, shout: 'Howrah, Howrah, Howrah! | Howrah, Howrah, Howrah!', label: 'HOWRAH' }));
        w2.flags.ccuStop = { bus, stop, D };
      };
      w.flags.twist = 'wait';
      w.add(
        new (class extends Entity {
          update(w2: World) {
            const p = w2.player;
            if (!bus) {
              if (p.cx > px(D - 22)) next(w2);
              return;
            }
            const b: Bus = bus;
            if (b.gone) {
              next(w2);
              return;
            }
            const still = p.onGround && Math.abs(p.vx) < 4 && p.cx > stop[0] && p.cx < stop[1];
            if (!b.slowed && still && b.x < stop[0] - 8 && b.x > stop[0] - 150) {
              b.slowed = true;
              w2.flags.twist = 'crawl';
            }
            if (b.slowed && b.x > px(D + 1)) b.slowed = false;
          }
        })(),
      );
      void lock;
      void npc;
    },
  },
};
