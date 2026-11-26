// Kolkata's door endings, one per stage 02-10, each a new idea. Kinds start with 'ccu-'.
import { Entity, type World } from '../../world';
import { lock, npc } from '../../levels/endkit';
import { px } from '../../levels/kit';
import { pool } from '../../levels/acts';
import { sign } from '../../levels/kit';
import type { Ending } from '../../levels/endkit';
import { Bus } from './entities';
import { Customer, Muck, Stack, Stall } from './books';

export type CcuEndingKind = 'ccu-stop' | 'ccu-set';

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
  // ================================================================ CCU-04: the whole set
  /** Three one-book stacks across the last drain, and a customer who wants the whole set: he points at all
   *  three, and the seller pulls them one after another, then re-shelves them. Rush on and you're in the
   *  drain; wait at the edge till he's done, and walk across his returned books. */
  'ccu-set': {
    space: 24,
    advice: 'The last drain has three one-book stacks across it, and the customer by the door wants the whole set: he points at all three. Wait at the edge while the seller pulls them and shelves them back, then hop across.',
    paint: (g, D) => {
      g.pit(D - 17, D - 3);
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      w.add(new Stall(px(D - 17), px(D - 2), 'FULL SET'));
      w.add(new Muck(px(D - 17), px(D - 2), (w2) => (w2.flags.yanked ? 'ccu-boi' : 'ccu-kada')));
      const st = [D - 15, D - 10, D - 5].map((c) => w.add(new Stack(px(c), px(3), 1, undefined, 2.2)));
      const c = w.add(new Customer(px(D - 10), '#5C6BC0'));
      w.flags.ccuSet = { st, edge: px(D - 17), D };
      w.flags.twist = 'set';
      w.when(
        (w2) => w2.player.cx > px(D - 21),
        (w2) => {
          st.forEach((s, i) => w2.after(0.2 + i * 0.35, () => c.ask(w2, s, 1, 1.1)));
        },
      );
      w.when(
        (w2) => st.every((s) => s.pulls > 0 && s.n === 1),
        (w2) => {
          w2.flags.twist = 'back';
          c.target = null;
        },
      );
    },
  },
};
