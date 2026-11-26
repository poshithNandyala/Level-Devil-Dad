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

export type CcuEndingKind = 'ccu-stop' | 'ccu-set' | 'ccu-pole-turn' | 'ccu-arch' | 'ccu-bhanr' | 'ccu-dhak' | 'ccu-wall';

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
  // ================================================================ CCU-08: a cup of tea
  /** The door is locked, and the tea seller stands beside it. This time standing still is the answer: stop
   *  beside him and he hands you a clay cup, and the door opens. */
  'ccu-bhanr': {
    space: 12,
    advice: 'The door is locked, and the tea seller stands beside it with his clay cups. This time, stop: stand still beside him till he hands you a cup, and the door opens.',
    build(w, d) {
      const D = Math.round(d.x / 16);
      const L = lock(w, d, 'Thamun! | Stop!');
      const x = px(D - 2) + 8;
      let still = 0;
      w.flags.bhanr = { x };
      w.flags.twist = 'locked';
      w.add(
        new (class extends Entity {
          got = false;
          update(w2: World) {
            const p = w2.player;
            if (this.got) return;
            if (p.onGround && Math.abs(p.cx - x) < 14 && Math.abs(p.vx) < 5) still += 1 / 120;
            else still = 0;
            if (still >= 0.8) {
              this.got = true;
              w2.flags.cup = 1;
              w2.sfx('collect', p.cx, p.y);
              L.unlock();
            }
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            const y = FLOOR_Y - 24;
            ctx.fillStyle = '#8D6E63';
            ctx.fillRect(x - 3, y + 8, 6, 9);
            ctx.fillStyle = '#C68B59';
            ctx.beginPath();
            ctx.arc(x, y + 4, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#8E9399';
            ctx.fillRect(x - 12, y + 11, 7, 7);
            ctx.fillStyle = '#B5562B';
            for (let i = 0; i < 4; i++) ctx.fillRect(x + 5, y + 8 + i * 2.5, 5, 2);
            if (this.got) {
              const p = w2.player;
              ctx.fillStyle = '#B5562B';
              ctx.fillRect(p.cx + 4, p.y + 4, 4, 5);
            } else if (still > 0) {
              ctx.fillStyle = 'rgba(255,255,255,0.8)';
              ctx.fillRect(x - 8, y - 6, 16 * Math.min(1, still / 0.8), 2);
            }
          }
        })(),
      );
    },
  },
  // ================================================================ CCU-09: the dhak gate
  /** The pandal's gate is a cloth curtain that the dhaki's drumming lifts: up on every beat for half a beat,
   *  down (a wall) in between. Go through on the beat. */
  'ccu-dhak': {
    space: 12,
    advice: 'The pandal’s gate is a cloth curtain, and it lifts on every beat of the dhak. Stand close, and walk through as it goes up.',
    build(w, d) {
      const D = Math.round(d.x / 16);
      const cur = new Solid(px(D - 1), FLOOR_Y - 48, 12, 48);
      cur.velX = 0;
      const beat = 108;
      const up = (w2: World) => w2.tick % beat < 54;
      w.flags.dhak = { cur, beat, D };
      w.flags.twist = 'down';
      w.add(
        new (class extends Entity {
          solid = cur;
          update(w2: World) {
            const u = up(w2);
            if (u !== (w2.flags.twist === 'up')) {
              w2.flags.twist = u ? 'up' : 'down';
              if (u) w2.sfx('stamp', px(D), FLOOR_Y);
            }
            cur.collidable = !u;
            d.hidden = !u;
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            const u = up(w2);
            const h = u ? 10 : 48;
            ctx.fillStyle = '#C62828';
            ctx.fillRect(px(D - 1), FLOOR_Y - 48, 12, h);
            ctx.fillStyle = '#F2C14E';
            for (let y = FLOOR_Y - 46; y < FLOOR_Y - 48 + h; y += 7) ctx.fillRect(px(D - 1), y, 12, 2);
            // the dhaki beside the gate, his drum on his hip, feather plumes on top
            const x = px(D - 3) + 8;
            ctx.fillStyle = '#E8E2D0';
            ctx.fillRect(x - 3, FLOOR_Y - 20, 6, 20);
            ctx.fillStyle = '#C68B59';
            ctx.beginPath();
            ctx.arc(x, FLOOR_Y - 24, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#8B5A2B';
            ctx.fillRect(x + 2, FLOOR_Y - 16, 12, 9);
            ctx.fillStyle = '#F4F1E8';
            ctx.fillRect(x + 10, FLOOR_Y - 26 - (u ? 3 : 0), 3, 10);
          }
        })(),
      );
    },
  },
  // ================================================================ CCU-10: they buy the wall down
  /** A porter has set his pile of bundles down at the CHA board, right in front of the door: four high,
   *  too high to jump. Customers come and buy it down one bundle at a time. Wait till it's two high, then
   *  over it and in. */
  'ccu-wall': {
    space: 14,
    advice: 'A porter has set his pile of bundles down in front of the door for his tea: four high, too high to jump. The customers buy it down a bundle at a time. Wait till it’s two high, then hop over and in.',
    build(w, d) {
      const D = Math.round(d.x / 16);
      w.add(new ChaiBoard(px(D - 4)));
      const st = w.add(new Stack(px(D - 3), px(2), 4, FLOOR_Y));
      const c = w.add(new Customer(px(D - 6), '#A0522D', FLOOR_Y - 58));
      w.flags.wall = { st, D };
      w.flags.twist = 'wall';
      w.when(
        (w2) => w2.player.cx > px(D - 10),
        (w2) => [0.6, 1.6, 2.6].forEach((t) => w2.after(t, () => c.ask(w2, st, 1, 0.6))),
      );
      w.when(
        () => st.n <= 2,
        (w2) => {
          w2.flags.twist = 'low';
        },
      );
    },
  },
};
