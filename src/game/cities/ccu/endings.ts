// Kolkata's door endings, one per stage 02-10, each a new idea. Kinds start with 'ccu-'.
import { Entity, type World } from '../../world';
import { Solid } from '../../body';
import { lock, npc } from '../../levels/endkit';
import { px } from '../../levels/kit';
import { pool } from '../../levels/acts';
import { sign } from '../../levels/kit';
import type { Ending } from '../../levels/endkit';
import { Bus, FLOOR as FLOOR_Y } from './entities';
import { Customer, Muck, Stack, Stall } from './books';
import { Paint } from '../../levels/endkit';
import { ChaiBoard, Road } from './porters';
import { Tin } from './muri';
import { BigFigure } from './kumartuli';
import { Adda, House, ROK, TeaSeller } from './adda';
import { ClothPanel, Decorator, Stakes } from './pandal';
import { person } from '../../levels/endkit';

export type CcuEndingKind = 'ccu-stop' | 'ccu-set' | 'ccu-pole-turn' | 'ccu-arch' | 'ccu-dorja' | 'ccu-dwar-kapor' | 'ccu-stup' | 'ccu-thonga' | 'ccu-murti';

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
        bus = w2.add(new Bus({ x: px(D - 34), end: px(D + 14), fast: 130, crawl: 40, shout: 'Howrah, Howrah, Howrah! | Howrah, Howrah, Howrah!', label: 'HOWRAH' }));
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
  // ================================================================ CCU-06: the pole turned at the terminus
  /** The end of the line, with the door up on the terminus platform beside the step. At the terminus the
   *  conductor walks the pole round to the other end for the trip back, and it swings low over the platform.
   *  Stay on the step till it's round, then step up. */
  'ccu-pole-turn': {
    space: 14,
    advice: 'At the end of the line the door is up on the terminus platform, right by the step. Wait: the conductor walks the pole round for the trip back, and it swings low over the platform. Once it’s round, step up.',
    paint: (g, D) => {
      g.pit(D - 12, D - 4);
      g.fill(D - 3, D + 3, 13, 14, '#');
      g.put(D, 14, '#');
      g.put(D, 12, 'E');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      w.add(new Muck(px(D - 12), px(D - 3), (w2) => (w2.flags.switched ? 'ccu-points' : 'ccu-khod')));
      w.flags.terminus = px(D - 4) - 26;
      const plat = px(13);
      let t0 = -1;
      const swing = (w2: World) => (t0 < 0 ? -1 : (w2.tick - t0) / 120 - 0.4);
      w.flags.twist = 'arrive';
      sign(w, D - 6.5, 8.6, 3.8, 'ESPLANADE', 'green', null, 'terminus');
      w.add(
        new (class extends Entity {
          hazard = { active: true, cause: 'ccu-dando', hits: (x: number, y: number, ww: number, h: number) => { const s = swing(w); return s > 0 && s < 1.6 && x < px(D + 4) && x + ww > px(D - 3) && y < plat && y + h > plat - 30; } };
          update(w2: World) {
            const b = w2.flags.tramB;
            if (t0 < 0 && b && b.state === 'end') {
              t0 = w2.tick;
              w2.flags.twist = 'turning';
              w2.sfx('creak', px(D), plat);
            }
            if (t0 >= 0 && swing(w2) >= 1.6 && w2.flags.twist === 'turning') w2.flags.twist = 'turned';
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            const s = swing(w2);
            if (s <= 0 || s >= 1.6) return;
            // the long pole going round, low over the platform, the conductor's rope taut
            const k = s / 1.6;
            const bx = px(D - 4) - 14,
              by = plat - 22;
            const a = Math.PI * (1 - k);
            ctx.strokeStyle = '#2B2320';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(bx + Math.cos(a) * 96, by - Math.sin(a) * 10 - 6);
            ctx.stroke();
          }
        })(),
      );
      void Paint;
    },
  },
  // ================================================================ CCU-07: the station arch
  /** At the Howrah end the porters walk straight into the station, under its low arch: a load's rider is
   *  swept off by the beam. The door is on the platform before the arch: step off on to it. */
  'ccu-arch': {
    space: 22,
    after: 6,
    advice: 'At the Howrah end the porters walk straight into the station under its low arch, and the beam sweeps anything on a load. The door is on the platform just before it: walk off the load on to the platform.',
    paint: (g, D) => {
      g.fill(D - 4, D, 13, 14, '#');
      g.put(D, 14, '#');
      g.put(D, 12, 'E');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      w.add(new Road(px(D - 22), px(D - 4), (w2) => (w2.flags.cha ? 'ccu-cha' : 'ccu-gaari')));
      w.add(new Road(px(D + 1), px(D + 7), () => 'ccu-gaari'));
      const beam = { x: px(D + 2), y: FLOOR_Y - 92, w: px(3), h: 26 };
      w.flags.arch = { D, beam };
      w.flags.twist = 'arch';
      w.add(
        new (class extends Entity {
          hazard = { active: true, cause: 'ccu-arch', hits: (x: number, y: number, ww: number, h: number) => x < beam.x + beam.w && x + ww > beam.x && y < beam.y + beam.h && y + h > beam.y };
          draw(ctx: CanvasRenderingContext2D) {
            // the station's red-brick arch, low over the porters' way in
            ctx.fillStyle = '#8E2C24';
            ctx.fillRect(beam.x - 6, beam.y - 40, beam.w + 12, 40 + beam.h);
            ctx.fillStyle = '#6E1F18';
            ctx.fillRect(beam.x - 6, beam.y + beam.h - 4, beam.w + 12, 4);
            ctx.fillStyle = '#F4F1E8';
            ctx.font = '800 7px "Baloo 2", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('HOWRAH STN', beam.x + beam.w / 2, beam.y - 20);
            ctx.fillStyle = '#5A1812';
            ctx.fillRect(beam.x - 6, beam.y + beam.h, 6, FLOOR_Y - beam.y - beam.h);
            ctx.fillRect(beam.x + beam.w, beam.y + beam.h, 6, FLOOR_Y - beam.y - beam.h);
          }
        })(),
      );
    },
  },
  // ================================================================ CCU-03: the last tin, no peanuts in it
  /** A second tin in front of the door with no big pieces at all: only muri. Nothing to stand on in a
   *  shake, so cross it between two shakes, straight after one. */
  'ccu-thonga': {
    space: 13,
    advice: 'The last tin, in front of the door, has no peanuts in it: nothing to stand on when he shakes. Wait on the rim for a shake to finish, then run straight across before the next.',
    paint: (g, D) => {
      g.pit(D - 9, D - 3);
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const tin = w.add(new Tin({ x0: px(D - 9), x1: px(D - 2), every: 3.2 }));
      w.flags.tin2 = tin;
      w.flags.twist = 'tin';
      w.when(
        (w2) => w2.player.cx > px(D - 14),
        (w2) => {
          if (tin.t0 < 0) tin.t0 = w2.tick + 40;
        },
      );
    },
  },
  // ================================================================ CCU-05: the big figure carried out
  /** The door is hidden behind the lane's biggest figure, and it's nearly done. When the paint reaches its
   *  crown, the men carry it out down the lane at a man's height: get down on the ghat step and let it pass
   *  over you, then the door is there. */
  'ccu-murti': {
    space: 16,
    advice: 'The door is hidden behind the biggest figure, nearly done. When the paint reaches its crown they carry it out down the lane at a man’s height: get down on the ghat step in front of it and let it go over you. Then the door is there.',
    paint: (g, D) => {
      g.fill(D - 10, D - 8, 15, 16, '.');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const big = w.add(new BigFigure(px(D - 2), 0.33));
      w.flags.bigStop = px(D - 34);
      w.flags.big = { big, dip: px(D - 9) + 8, D };
      w.flags.twist = 'wait';
      d.hidden = true;
      w.when(
        (w2) => w2.player.cx > px(D - 14),
        () => {
          big.state = 'paint';
        },
      );
      w.when(
        () => big.state === 'gone' || big.x < px(D - 4),
        () => {
          d.hidden = false;
        },
      );
    },
  },
  // ================================================================ CCU-08: the doorstep adda
  /** Two old men sit right across the door's step, deep in their own adda: a wall of knees. They only get
   *  up for the tea seller, and he only comes when someone else is sitting in an adda. So sit down in the
   *  one before the door, and when he lets you go, they've got up too. */
  'ccu-dorja': {
    space: 16,
    advice: 'Two old men are sitting right across the door’s step, and they only get up for the tea seller. He only comes when someone’s sitting in an adda: stand still among the men before the door, and when he’s let you go, the doorstep is clear.',
    paint: (g, D) => {
      g.fill(D - 12, D + 3, 13, 14, '#');
      g.put(D, 14, '#');
      g.put(D, 12, 'E');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      w.add(new House(px(D - 12), px(D + 4)));
      const a = w.add(new Adda(px(D - 10), px(D - 5), 2));
      const men = new Solid(px(D - 2), ROK - 30, px(2), 30);
      men.velX = 0;
      const seller = w.add(new TeaSeller(px(D + 6), -70, [a]));
      w.when(() => a.held, () => w.after(0.3, () => { if (!seller.active) seller.send(px(D + 6)); }), false);
      w.flags.dorja = { a, D };
      w.flags.twist = 'blocked';
      w.add(
        new (class extends Entity {
          solid = men;
          update(w2: World) {
            if (men.collidable && seller.active && seller.x < px(D - 1)) {
              men.collidable = false;
              w2.flags.twist = 'clear';
            }
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            const up = !men.collidable;
            for (let i = 0; i < 2; i++) {
              const x = px(D - 2) + 8 + i * 14 + (up ? -40 - i * 10 : 0);
              ctx.fillStyle = '#F4F1E8';
              ctx.fillRect(x - 4, ROK - 10, 8, 10);
              person(ctx, x, ROK - (up ? 26 : 20), up ? 26 : 20, i ? '#E8E2D0' : '#D7CCB5', '#B98A62', { arms: up ? 0 : 3 + Math.sin(w2.tick * 0.12 + i) * 2 });
            }
          }
        })(),
      );
    },
  },
  // ================================================================ CCU-09: the last panel over the door
  /** The decorator waits by the door with the gate's last panel. Land in front of the door and the door is
   *  your next foothold: he ties the cloth over it. Don't land in front of it: jump from the bamboo straight
   *  into the doorway. */
  'ccu-dwar-kapor': {
    space: 12,
    advice: 'The decorator by the door has the gate’s last panel ready: land on the ledge in front of the door and he ties it over the door, because that’s your next foothold. Jump from the bamboo straight into the doorway instead (he unties it again if you’re slow).',
    paint: (g, D) => {
      g.fill(D - 1, D + 2, 12, 14, '#');
      g.put(D, 14, '#');
      g.put(D, 11, 'E');
      g.fill(D - 4, D - 3, 12, 12, '=');
      g.fill(D - 7, D - 7, 13, 14, '#');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      w.add(new Stakes(px(D - 6), px(D - 1)));
      const cloth = w.add(new ClothPanel(px(D), px(1), px(12), 2, 0));
      w.add(new Decorator(px(D + 1) + 6, px(12), cloth));
      w.flags.kapor = { D, cloth };
      w.flags.twist = 'open';
      let tiedAt = -1;
      w.add(
        new (class extends Entity {
          update(w2: World) {
            const p = w2.player;
            const onLedge = p.onGround && p.y + p.h === px(12) && p.cx > px(D - 1) && p.cx < px(D);
            if (!cloth.tied && onLedge) {
              cloth.tie(w2);
              tiedAt = w2.tick;
              d.hidden = true;
              w2.flags.twist = 'tied';
            }
            // he takes it down again to re-measure, once you've stepped back off the ledge
            if (cloth.tied && w2.tick - tiedAt > 300 && !onLedge) {
              cloth.tied = false;
              cloth.h = 0;
              cloth.target = 0;
              cloth.solid.collidable = false;
              cloth.solid.place(px(D), px(12) - 1);
              cloth.solid.h = 1;
              d.hidden = false;
              w2.flags.twist = 'open';
            }
          }
        })(),
      );
    },
  },
  // ================================================================ CCU-10: the door on the pile
  /** The door stands on a pile of bundles out in the drain, and a customer is buying the pile down. Its
   *  step is too high to reach till the pile's down to two; at none, the door's in the drain (and the seller
   *  piles it up again). Step in while it's low. */
  'ccu-stup': {
    space: 12,
    advice: 'The door is standing on a pile of bundles out in the drain, and the customer is buying the pile down a bundle at a time. When it’s down to two, step across into the door before it goes any lower.',
    paint: (g, D) => {
      g.pit(D - 1, D + 2);
      g.put(D, 14, '.');
      g.put(D, 10, 'E');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      w.add(new Muck(px(D - 1), px(D + 3), (w2) => (w2.flags.yanked ? 'ccu-boi' : 'ccu-kada')));
      const st = w.add(new Stack(px(D) - 4, px(1) + 8, 5, FLOOR_Y + 16, 2.0));
      const c = w.add(new Customer(px(D - 4), '#A0522D', FLOOR_Y - 58));
      w.flags.stup = { st, D };
      w.flags.twist = 'high';
      let next = -1;
      d.follow = () => ({ x: px(D), y: (st.n > 0 ? st.top() : FLOOR_Y + 40) - 32 });
      w.add(
        new (class extends Entity {
          update(w2: World) {
            d.hidden = st.n <= 0;
            w2.flags.twist = st.n <= 2 && st.n > 0 ? 'low' : 'high';
            if (w2.player.cx > px(D - 10) && next < 0) next = w2.tick + 60;
            if (next >= 0 && w2.tick >= next && st.n > 0 && !st.pointed) {
              c.ask(w2, st, 1, 0.8);
              next = w2.tick + 160;
            }
            if (st.n === st.n0 && next >= 0 && w2.tick >= next) next = w2.tick + 60;
          }
        })(),
      );
    },
  },
};
