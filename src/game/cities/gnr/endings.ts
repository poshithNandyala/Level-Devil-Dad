// Gandhinagar's door endings.
import { Entity, type World } from '../../world';
import { Solid } from '../../body';
import { DT } from '../../constants';
import { px } from '../../levels/kit';
import { pool } from '../../levels/acts';
import { FLOOR, lock, npc, Paint, person, tara, text } from '../../levels/endkit';
import { Bamboo, Dino, FeatherPickup, Feathers, GarbaRing, Lion, Peacock, Sandstone, Sunbeam, Thorns, tinArt } from './entities';
import type { Ending } from '../../levels/endkit';

export type GnrEndingKind = 'setu' | 'milan' | 'safari' | 'kichad' | 'pravesh' | 'herd' | 'jali';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<GnrEndingKind, true> {}
}

export const endings: Record<GnrEndingKind, Ending> = {
  /** No run-up left: the last roof is a ledge two steps wide, and the door's terrace is across a gap no
   *  jump (and no vault) can cross. Lay the bamboo across it instead: a standing press at the edge. */
  setu: {
    space: 17,
    advice: 'The last gap is too wide to jump, even with the bamboo. Hop up on to the little roof in front of it, then press jump while you’re on it: instead of jumping, Dad lays the bamboo across the gap like a bridge. Walk over it to the door.',
    paint: (g, D) => {
      g.fill(D - 13, D - 10, 13, 14, '#');
      g.pit(D - 9, D - 2);
      g.fill(D - 1, D + 4, 13, 14, '#');
      g.put(D, 12, 'E');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const edge = px(D - 9),
        top = FLOOR - 32;
      const bam = w.entities.find((e) => e instanceof Bamboo) as Bamboo | undefined;
      // the street up to the little roof is tin sheeting: the pole slips, so a running jump there is
      // just a hop up on to the roof, never a vault over it into the gap
      const tin0 = px(D - 17),
        tin1 = px(D - 13);
      bam?.tin.push({ x0: tin0, x1: tin1 - 1, top: FLOOR });
      w.add(new Paint((ctx) => tinArt(ctx, tin0, tin1, FLOOR - 1), -1));
      const pole = new Solid(edge - 4, top, px(D - 1) - edge + 12, 4);
      pole.oneWay = true;
      pole.collidable = false;
      let laidAt = -1;
      w.flags.twist = 'gap';
      w.add(
        new (class extends Entity {
          solid = pole;
          layer = 3;
          update(w2: World) {
            const p = w2.player;
            if (w2.flags.twist === 'gap' && p.onGround && p.y + p.h === top && p.cx > px(D - 14) && p.cx < edge) w2.flags.twist = 'ledge';
            if (laidAt >= 0 && p.onGround && p.cx > px(D - 1)) w2.flags.twist = 'over';
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            if (laidAt < 0) return;
            // the bamboo lying across, settling with a little roll
            const k = Math.min(1, (w2.tick - laidAt) / 24);
            const y = top + 1 - (1 - k) * 10;
            ctx.strokeStyle = '#6D5A1E';
            ctx.lineWidth = 3.4;
            ctx.beginPath();
            ctx.moveTo(pole.x, y);
            ctx.lineTo(pole.x + pole.w, y);
            ctx.stroke();
            ctx.strokeStyle = '#D4C06A';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#8D7A2E';
            for (let x = pole.x + 10; x < pole.x + pole.w; x += 14) ctx.fillRect(x, y - 1.5, 2, 3);
          }
        })(),
      );
      if (bam)
        bam.bridgeAt = {
          x: edge,
          top,
          roof: px(4),
          onLay: (w2) => {
            laidAt = w2.tick;
            pole.collidable = true;
            w2.flags.twist = 'laid';
            npc(w2, 'Vaans no pul! | A bamboo bridge!', edge + 60, top - 30, 1.4);
          },
        };
      w.when(
        (w2) => w2.player.cx > px(D - 16),
        (w2) => tara(w2, 'Kudi jao, Dad, thodu j chhe! | Jump across, Dad, it’s not far!', 2.4),
      );
    },
  },

  /** The door is up on a rock no single throw reaches. A mother Rajasaurus and her baby stomp
   *  together, and where their two waves meet under you, you're thrown twice as high. */
  milan: {
    space: 16,
    advice: 'The door is up on a rock no single throw reaches. The mother and her baby stomp together, and their waves meet in one spot: stand right there and you’re thrown twice as high. Under the thorns, a single wave is still deadly.',
    paint: (g, D) => {
      g.fill(D - 2, D + 2, 3, 3, '%');
      g.put(D, 14, '.');
      g.put(D, 2, 'E');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const mama = w.add(new Dino(px(D - 12), FLOOR, { period: 2.4, phase: 0.5, reach: 420, x0: px(D - 16), x1: px(D + 4), face: 1, fence: true }));
      const baby = w.add(new Dino(px(D + 2), FLOOR, { period: 2.4, phase: 0.5, speed: 150, reach: 420, x0: px(D - 16), x1: px(D + 4), face: -1, scale: 0.6, fence: true }));
      w.flags.pair = [mama, baby];
      w.flags.meet = px(D - 12) + (220 * (px(D + 2) - px(D - 12))) / 370;
      w.add(new Thorns(px(D - 11), px(D - 5), px(8) + 4, px(D - 11) - 6, FLOOR));
      // the rock the door stands on
      w.add(
        new Paint((ctx) => {
          // the spire it stands on, far behind
          ctx.fillStyle = 'rgba(120,96,70,0.35)';
          ctx.beginPath();
          ctx.moveTo(px(D - 1), px(4));
          ctx.lineTo(px(D + 2), px(4));
          ctx.lineTo(px(D + 3), FLOOR);
          ctx.lineTo(px(D - 2), FLOOR);
          ctx.fill();
          ctx.fillStyle = '#8D6E52';
          ctx.fillRect(px(D - 2), px(3), px(5), 16);
          ctx.fillStyle = '#A9886A';
          ctx.fillRect(px(D - 2), px(3), px(5), 3);
          ctx.fillStyle = 'rgba(0,0,0,0.18)';
          ctx.beginPath();
          ctx.moveTo(px(D - 2), px(4));
          ctx.lineTo(px(D + 3), px(4));
          ctx.lineTo(px(D + 1), px(4) + 8);
          ctx.lineTo(px(D - 1), px(4) + 6);
          ctx.fill();
          // a footprint fossil where the waves meet
          const mx = (w.flags.meet as number) | 0;
          ctx.fillStyle = 'rgba(80,60,40,0.45)';
          for (const [dx, dy] of [
            [-4, -1],
            [0, -2],
            [4, -1],
          ])
            ctx.fillRect(mx + dx - 1, FLOOR - 2 + dy, 2, 2);
        }, -2),
      );
      w.flags.twist = 'below';
      w.add(
        new (class extends Entity {
          update(w2: World) {
            const p = w2.player;
            if (p.onGround && p.y + p.h === px(3)) w2.flags.twist = 'top';
            else if (w2.flags.doubled && w2.tick - w2.flags.doubled < 60) w2.flags.twist = 'flying';
          }
        })(),
      );
      w.when(
        (w2) => w2.player.cx > px(D - 16),
        (w2) => tara(w2, 'Bachchu nanu chhe, kai nahi kare! | The baby’s tiny, it won’t do anything!', 2.4),
      );
    },
  },

  /** The way out is the safari jeep: it drives you to the gate, and the lions you hopped follow it.
   *  Ride in the back looking at them (they only stalk you while your back is turned). */
  safari: {
    space: 22,
    advice: 'The safari jeep drives you to the gate, and the lions you hopped follow it. Ride in the back looking at them: turn round and they catch up. Hop the low branches straight up, without pressing a direction.',
    build(w, d) {
      const D = Math.round(d.x / 16);
      const lions = [
        w.add(new Lion(px(D - 19) + 8, FLOOR, { asleep: true, x0: px(D - 21), x1: px(D + 1) })),
        w.add(new Lion(px(D - 15) + 8, FLOOR, { asleep: true, maned: false, x0: px(D - 21), x1: px(D + 1) })),
      ];
      w.flags.safariLions = lions;
      const s = new Solid(px(D - 11), FLOOR - 20, 56, 20);
      const jeep = { s, started: false, done: false };
      w.flags.jeep = jeep;
      const stopX = px(D - 4);
      w.flags.branches = [px(D - 7), px(D - 5)];
      for (const bx of w.flags.branches as number[]) w.add(new Thorns(bx, bx + 8, FLOOR - 30, bx + 4, FLOOR - 96));
      w.flags.twist = 'road';
      w.add(
        new (class extends Entity {
          solid = s;
          layer = 2;
          update(w2: World) {
            const p = w2.player;
            const on = p.isRiding(s);
            if (on && !jeep.started) {
              jeep.started = true;
              w2.sfx('honk', s.x + 40, s.y);
              npc(w2, 'Chalo! Pachhal jojo! | Let’s go! Keep looking back!', s.x + 30, s.y - 30, 1.6);
            }
            if (jeep.started && !jeep.done) {
              const dx = Math.min(60 * DT, stopX - s.x);
              s.velX = 60;
              s.moveBy(w2, dx, 0);
              if (s.x >= stopX) {
                jeep.done = true;
                s.velX = 0;
              }
            } else s.velX = 0;
            w2.flags.twist = jeep.done ? 'arrived' : jeep.started ? 'riding' : 'road';
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            const x = s.x + s.xr,
              y = s.y;
            // an open safari jeep: olive body, roll bar, spare wheel, wheels turning
            ctx.fillStyle = '#6B7A3A';
            ctx.fillRect(x, y, 56, 13);
            ctx.fillStyle = '#56632C';
            ctx.fillRect(x, y + 10, 56, 3);
            ctx.fillStyle = '#3B3B3B';
            ctx.fillRect(x + 40, y - 14, 2, 14);
            ctx.fillRect(x + 40, y - 14, 14, 2);
            ctx.fillRect(x + 52, y - 14, 2, 8);
            ctx.fillStyle = '#B3E5FC';
            ctx.fillRect(x + 46, y - 6, 6, 5);
            const a = (jeep.started && !jeep.done ? w2.tick * 0.25 : 0) % (Math.PI * 2);
            for (const wx of [x + 10, x + 45]) {
              ctx.fillStyle = '#212121';
              ctx.beginPath();
              ctx.arc(wx, y + 15, 5, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#9E9E9E';
              ctx.fillRect(wx + Math.cos(a) * 2.5 - 1, y + 15 + Math.sin(a) * 2.5 - 1, 2, 2);
            }
            ctx.fillStyle = '#212121';
            ctx.beginPath();
            ctx.arc(x - 2, y + 6, 5, 0, Math.PI * 2);
            ctx.fill();
            text(ctx, 'GIR SAFARI', x + 22, y + 6, 4.4, '#F1F8E9', '');
            // the driver
            person(ctx, x + 48, y - 15, 15, '#4E5B31', '#8D5524', { cap: '#4E5B31' });
          }
        })(),
      );
      // the gate at the end
      w.add(
        new Paint((ctx) => {
          ctx.fillStyle = '#5D4037';
          ctx.fillRect(px(D) - 4, FLOOR - 52, 4, 52);
          ctx.fillRect(px(D) + 18, FLOOR - 52, 4, 52);
          ctx.fillStyle = '#2E7D32';
          ctx.fillRect(px(D) - 10, FLOOR - 64, 38, 12);
          text(ctx, 'EXIT', px(D) + 9, FLOOR - 58, 5, '#FFFFFF', '');
        }, -3),
      );
      w.when(
        (w2) => jeep.started,
        (w2) => tara(w2, 'Aagal jo, Dad, rasto jo! | Look ahead, Dad, watch the road!', 2.4),
      );
    },
  },

  /** Monsoon mud in front of the door: your feet stick, so there's no jumping out of it at all. Only
   *  a feather still flaps you up, over each little hedge. Peacocks leave new ones on the thunder. */
  kichad: {
    space: 16,
    advice: 'The path to the door is monsoon mud: your feet stick and you can’t jump from it at all. A feather still flaps you up: one feather for each hedge. Pick them up as you go, and if you run out, wait for the thunder.',
    build(w, d) {
      const D = Math.round(d.x / 16);
      let bag = w.entities.find((e) => e instanceof Feathers) as Feathers | undefined;
      if (!bag) bag = w.add(new Feathers());
      bag.mud.push({ x0: px(D - 14), x1: px(D) - 1, top: FLOOR });
      const spot = (tx: number, at: number, period: number, phase: number) => {
        const f = w.add(new FeatherPickup(px(tx) + 8, FLOOR, bag!));
        w.add(new Peacock(px(at) + 8, FLOOR, f, { period, phase, face: at > tx ? -1 : 1 }));
        return f;
      };
      w.flags.mudSpots = [spot(D - 15, D - 16, 4.4, 1.5), spot(D - 9, D - 8, 4.4, 3.1), spot(D - 5, D - 4, 4.4, 0.4)];
      w.flags.hedges = [px(D - 11), px(D - 7), px(D - 3)];
      w.flags.twist = 'mud';
      // thorny babool hedges (a village fence): you can't stand on them, only flap over
      for (const hx of w.flags.hedges as number[])
        w.add(
          new (class extends Entity {
            hazard = { active: true, cause: 'thorns', hits: (x: number, y: number, ww: number, h: number) => x < hx + 14 && x + ww > hx + 2 && y < FLOOR && y + h > FLOOR - 13 };
          })(),
        );
      w.add(
        new Paint((ctx, w2) => {
          // the mud: wet brown over the path, puddles, and a hedge on each block
          const x0 = px(D - 14),
            x1 = px(D);
          ctx.fillStyle = '#5D4330';
          ctx.fillRect(x0, FLOOR - 2, x1 - x0, 8);
          ctx.fillStyle = 'rgba(160,190,210,0.5)';
          for (let x = x0 + 10; x < x1 - 8; x += 37) ctx.fillRect(x, FLOOR - 1, 14, 2);
          for (const hx of w2.flags.hedges as number[]) {
            ctx.strokeStyle = '#5D4A36';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            for (let k = 0; k < 6; k++) {
              ctx.moveTo(hx + 2 + k * 2.4, FLOOR);
              ctx.lineTo(hx + (k % 2 ? 0 : 16) - (k - 3), FLOOR - 13 + (k % 3) * 2);
            }
            ctx.stroke();
            ctx.strokeStyle = '#F5F5F0';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            for (let k = 0; k < 9; k++) {
              const tx = hx + 1 + ((k * 7) % 15),
                ty = FLOOR - 4 - ((k * 5) % 10);
              ctx.moveTo(tx, ty);
              ctx.lineTo(tx + (k % 2 ? 3 : -3), ty - 2);
            }
            ctx.stroke();
          }
        }, 2),
      );
      w.when(
        (w2) => w2.player.cx > px(D - 14),
        (w2) => tara(w2, 'Kudko maaro, Dad! | Just hop, Dad!', 2.4),
      );
    },
  },

  /** The door is at the back of the last ring, behind the garbo lamp: you can't walk to it along your
   *  line. Join the dance at the ring's left end, go round with them, and jump in from behind. */
  pravesh: {
    space: 16,
    advice: 'The door is at the back of the last ring, behind the lamp: you can’t walk to it. Join the dance instead: stand just left of the ring and press jump when no dancer is at its end. Dad doesn’t jump, he’s pulled into the dance and goes round the back towards the lamp. When he’s right behind it (the door glows), press jump again, straight into the door.',
    build(w, d) {
      const D = Math.round(d.x / 16);
      const cx = px(D) + 8,
        R = 80;
      const g = w.add(new GarbaRing(cx, FLOOR, [{ r: R, n: 6, w: 0.7, phase: 0.3 }]));
      w.add(g.front);
      w.flags.pravesh = g;
      const L = lock(w, d, 'Garbo ni pachhal! Daabe thi kudo! | Behind the lamp! Hop in from the left!');
      w.flags.twist = 'line';
      const TAU = Math.PI * 2;
      // radians from 1.5π (right behind the lamp) where a jump takes you in
      const behind = (th: number) => Math.abs(th - 1.5 * Math.PI);
      w.add(
        new (class extends Entity {
          update(w2: World) {
            const p = w2.player;
            if (w2.state !== 'play') return;
            const j = g.joined;
            if (!j) {
              // anywhere from a couple of steps short of the left end up to the end itself; with a dancer at the
              // end it's just a jump
              if (w2.input.jumpPressed && p.onGround && p.cx >= cx - R - 40 && p.cx <= cx - R + 12) {
                const a0 = g.angle(0, w2.tick * DT);
                for (let k = 0; k < 6; k++) {
                  let dth = (((a0 + (TAU * k) / 6 - Math.PI) % TAU) + TAU) % TAU;
                  if (dth > Math.PI) dth -= TAU;
                  if (Math.abs(dth) < 0.3) return;
                }
                g.joined = { ring: 0, th: Math.PI };
                p.stun = 2;
                w2.flags.twist = 'dancing';
                npc(w2, 'Aavo, aavo! | Come, come!', cx - R, FLOOR - 34, 1.2);
                w2.guide('Garbo ni pachhal aavo tyare kudo! | Jump when you’re behind the lamp!', () => !!g.joined);
              }
              return;
            }
            const th = ((j.th % TAU) + TAU) % TAU;
            w2.flags.danceTh = th;
            if (!w2.input.jumpPressed) return;
            if (behind(th) < 0.3) {
              L.open = true;
              g.joined = null;
              w2.win('door');
            } else if (Math.abs(th - Math.PI) < 0.2 || th < 0.2 || th > TAU - 0.2) {
              // step back out at either end
              g.joined = null;
              p.stun = 0;
              w2.flags.twist = 'line';
            }
          }
        })(),
      );
      // while he's dancing right behind the lamp, the door glows: that's when to jump
      w.add(
        new Paint((ctx, w2) => {
          const th = w2.flags.danceTh as number | undefined;
          if (!g.joined || th === undefined || behind(th) >= 0.3) return;
          const a = 0.55 + 0.35 * Math.sin(w2.tick * 0.25);
          ctx.save();
          ctx.globalAlpha = a;
          ctx.strokeStyle = '#FFE27A';
          ctx.lineWidth = 2;
          ctx.strokeRect(d.x - 2, d.y - 2, 20, 36);
          ctx.globalAlpha = a * 0.35;
          ctx.fillStyle = '#FFE27A';
          ctx.fillRect(d.x - 2, d.y - 2, 20, 36);
          ctx.restore();
        }, 5),
      );
      w.when(
        (w2) => w2.player.cx > cx - R - 72 && !g.joined,
        (w2) => w2.guide('Daabe chhede kudo, raas ma jodao! | Jump at the left end, join the dance!', () => !g.joined),
      );
      w.when(
        (w2) => w2.player.cx > px(D - 14),
        (w2) => tara(w2, 'Vachche thi seedha jao! | Go straight through the middle!', 2.4),
      );
    },
  },

  /** The last stretch is the market itself, and it copies you: every jump is a buy, and all the
   *  candles rise a step; stop jumping and they sink. Hop up them till the last reaches the door. */
  herd: {
    space: 16,
    advice: 'The last stretch is the market itself, and it copies you: every jump you make is a buy and all the candles rise a step; stop jumping and they sink again. Keep hopping, up the candles and on the last one, until it’s near enough to jump to the door.',
    paint: (g, D) => {
      g.pit(D - 12, D - 1);
      g.fill(D, D + 3, 4, 14, '%');
      g.put(D, 14, '.');
      g.put(D, 3, 'E');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const STEP = 13,
        MAX = 8;
      const base = [236, 229, 222, 215, 208, 200];
      const cols = base.map((b, i) => {
        const s = new Solid(px(D - 12 + 2 * i), b, 30, FLOOR + 60 - b);
        return { s, b, top: b };
      });
      let P = 0,
        lastBuy = -999,
        lastDecay = 0;
      w.flags.herd = { cols, get P() { return P; } };
      w.flags.twist = 'road';
      w.add(
        new (class extends Entity {
          solids = cols.map((c) => c.s);
          layer = 2;
          hazard = { active: true, cause: 'crash', hits: (x: number, y: number, ww: number, h: number) => x + ww > px(D - 12) && x < px(D) && y + h > FLOOR + 30 };
          update(w2: World) {
            const p = w2.player;
            const onCandle = cols.some((c) => p.isRiding(c.s));
            // a jump from a candle is a buy; idle for a while and the market sells off
            if (p.jumpTick === w2.tick - 1 && (onCandle || p.cx > px(D - 13))) {
              if (P < MAX) P++;
              lastBuy = w2.tick;
              lastDecay = w2.tick;
              w2.sfx('beep', p.cx, p.y);
            } else if (P > 0 && w2.tick - Math.max(lastBuy, lastDecay) >= 168) {
              P--;
              lastDecay = w2.tick;
            }
            for (const c of cols) {
              const target = c.b - P * STEP;
              const dy = Math.max(-90 * DT, Math.min(90 * DT, target - (c.s.y + c.s.yr)));
              if (dy) c.s.moveBy(w2, 0, dy);
              c.top = c.s.y;
            }
            if (p.onGround && p.y + p.h === px(4) && p.cx > px(D)) w2.flags.twist = 'top';
            else if (onCandle) w2.flags.twist = 'market';
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            // the candles, all green while the market climbs, red while it slides
            const rising = w2.tick - lastBuy < 60;
            for (const c of cols) {
              const x = c.s.x,
                y = c.s.y;
              ctx.fillStyle = rising ? '#00C853' : '#FF1744';
              ctx.fillRect(x + 1, y, 28, 6);
              ctx.fillStyle = rising ? 'rgba(0,200,83,0.4)' : 'rgba(255,23,68,0.35)';
              ctx.fillRect(x + 1, y + 6, 28, FLOOR + 40 - y);
              ctx.fillStyle = 'rgba(255,255,255,0.6)';
              ctx.fillRect(x + 1, y, 28, 1);
              ctx.fillRect(x + 14.5, y - 8, 1, 8);
            }
            // the board: the index, and what the market's doing
            const bx = px(D - 11),
              by = 30;
            ctx.fillStyle = 'rgba(8,16,28,0.88)';
            ctx.fillRect(bx, by, px(10), 22);
            text(ctx, `IFSC INDEX ${(18000 + P * 125).toLocaleString('en-IN')}`, bx + px(5), by + 7, 6, '#00E5FF', '');
            text(ctx, rising ? '▲ BUYING' : P > 0 ? '▼ SELLING' : '— FLAT', bx + px(5), by + 16, 6, rising ? '#00E676' : '#FF5252', '');
          }
        })(),
      );
      w.add(
        new Paint((ctx) => {
          ctx.fillStyle = '#4F7FA8';
          ctx.fillRect(px(D), px(4), px(4), FLOOR - px(4));
          ctx.fillStyle = 'rgba(255,255,255,0.18)';
          for (let x = px(D) + 3; x < px(D + 4) - 2; x += 7) ctx.fillRect(x, px(4) + 4, 4, FLOOR - px(4) - 8);
          ctx.fillStyle = '#CFD8DC';
          ctx.fillRect(px(D) - 1, px(4), px(4) + 2, 3);
        }, -2),
      );
      w.when(
        (w2) => w2.flags.twist === 'market',
        (w2) => tara(w2, 'Have vechi do, Dad! | Sell now, Dad!', 2.4),
      );
    },
  },
  /** The last of the light comes in through a carved stone jali high on the wall. Its bars throw
   *  shadows that slide down the beam, and a shadow is a hole in the light: hop each one on the way up. */
  jali: {
    space: 16,
    advice: 'The last beam comes in through a carved stone jali: the shadows of its bars slide down the light, and a shadow is a hole. Hop on at the low end when it’s clear, walk up, and hop over each shadow as it reaches you.',
    paint: (g, D) => {
      g.pit(D - 10, D - 1);
      g.fill(D, D + 4, 9, 9, '%');
      g.put(D, 14, '.');
      g.put(D, 8, 'E');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      if (!w.entities.some((e) => e instanceof Sandstone)) w.add(new Sandstone());
      pool(w, D - 10, D, 15.45, { colors: ['rgba(74,128,96,0.88)', 'rgba(24,62,46,0.97)'], cause: 'splash' });
      const a = (30 * Math.PI) / 180;
      const beam = w.add(new Sunbeam(px(D), px(9), 175, -1, { a0: a, a1: a, period: 10, gaps: { n: 2, w: 0.1, speed: 0.08 }, window: 'jali' }));
      w.flags.jali = beam;
      w.flags.twist = 'below';
      // the jali: a pointed arch of stone with a tree of life cut through it
      const jx = px(D) + 30,
        jy = px(9) - 76;
      w.add(
        new Paint((ctx, w2) => {
          ctx.fillStyle = '#B98D57';
          ctx.beginPath();
          ctx.moveTo(jx - 26, jy + 60);
          ctx.lineTo(jx - 26, jy + 20);
          ctx.quadraticCurveTo(jx - 26, jy - 6, jx, jy - 14);
          ctx.quadraticCurveTo(jx + 26, jy - 6, jx + 26, jy + 20);
          ctx.lineTo(jx + 26, jy + 60);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = 'rgba(255,236,170,0.85)';
          ctx.beginPath();
          ctx.moveTo(jx - 20, jy + 56);
          ctx.lineTo(jx - 20, jy + 20);
          ctx.quadraticCurveTo(jx - 20, jy, jx, jy - 7);
          ctx.quadraticCurveTo(jx + 20, jy, jx + 20, jy + 20);
          ctx.lineTo(jx + 20, jy + 56);
          ctx.closePath();
          ctx.fill();
          // the tree: a trunk, curling branches, and the bars across
          ctx.strokeStyle = '#9C7347';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(jx, jy + 56);
          ctx.lineTo(jx, jy + 10);
          for (const s of [-1, 1])
            for (let k = 0; k < 3; k++) {
              const by = jy + 46 - k * 13;
              ctx.moveTo(jx, by);
              ctx.quadraticCurveTo(jx + s * 12, by - 4, jx + s * 16, by - 13);
            }
          ctx.stroke();
          ctx.lineWidth = 1.2;
          for (let y = jy + 8; y < jy + 56; y += 9) {
            ctx.beginPath();
            ctx.moveTo(jx - 20, y);
            ctx.lineTo(jx + 20, y);
            ctx.stroke();
          }
          void w2;
        }, 1),
      );
      w.add(
        new (class extends Entity {
          update(w2: World) {
            const p = w2.player;
            if (beam.solid.collidable && p.isRiding(beam.solid)) w2.flags.twist = 'beam';
            else if (p.onGround && p.y + p.h === px(9) && p.cx > px(D)) w2.flags.twist = 'top';
          }
        })(),
      );
      w.when(
        (w2) => w2.player.cx > px(D - 16),
        (w2) => tara(w2, 'Chhaya par pag mukjo, majboot chhe! | Step on the shadows, they’re solid!', 2.4),
      );
    },
  },
};
