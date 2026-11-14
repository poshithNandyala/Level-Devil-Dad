// Door endings for the western chapters (Goa onwards). Same rules as endings.ts: one per stage, never
// shared, and each keeps w.flags.twist up to date for the test policies.
import { Entity, type World } from '../world';
import { Player, type Climbable } from '../player';
import { Solid } from '../body';
import { DT, secs } from '../constants';
import { px } from './kit';
import { pool } from './acts';
import { type Ending, FLOOR, Paint, RIVER, lock, npc, person, tara, text } from './endkit';
import { aunty, poderArt } from './westkit';
import { Football, footballer, goalArt, palmArt } from '../entities/goa';
import { Bamboo, tinArt, Dino, FeatherPickup, Feathers, GarbaRing, Lion, Peacock, Sandstone, Sunbeam, Thorns } from '../entities/gujarat';
import { Balloon, Bangle, Board, Bowl, Elephant, Ghodi, Pots, Shards, brazierArt } from '../entities/rajasthan';
import { Chumbak, Katori, Lake, Ledge, Shelter, Surma, Tawa, Thread, handArt } from '../entities/bhopal';
import { Chapda, Gedi, Ghadi, Heap, Kaante, Kosa, Mud, Sack, Top, clockFace } from '../entities/raipur';

export type WestEndingKind = 'poder' | 'penalty' | 'clockhand' | 'hammock' | 'gangway' | 'sandcastle' | 'decree' | 'customs' | 'coldstore' | 'flag' | 'drawbridge' | 'slidedoor' | 'paintwall' | 'tipjetty' | 'setu' | 'jali' | 'milan' | 'safari' | 'kichad' | 'pravesh' | 'herd' | 'sutradhar' | 'toran' | 'shant' | 'naap' | 'dulha' | 'palat' | 'salaami' | 'ghat' | 'haath' | 'gaanth' | 'khaali' | 'paan' | 'rakhdo' | 'kissa' | 'utar' | 'ghanta' | 'khisko' | 'lattu' | 'reel' | 'gud' | 'rath';

/** time within a repeating cycle */
const cyc = (w: World, period: number, phase = 0) => ((((w.tick * DT - phase) % period) + period) % period);

export const WEST_ENDINGS: Record<WestEndingKind, Ending> = {
  /** Siesta: the house is shut. Only the poder's horn opens a Goan door: the aunty comes out for her
   *  bread, buys it, goes back in, and the door stays open a moment while she looks for change. */
  poder: {
    space: 14,
    advice: 'The house is shut for the siesta. When the poder (the bread man) honks, the aunty comes out for bread: hop over her while she buys it, or slip in just after she goes back inside, before the door shuts.',
    build(w, d) {
      const P = 7,
        PH = 3;
      const stopX = d.x - 30;
      const L = lock(w, d, 'Siesta! Uprant ye. | Siesta! Come back later.');
      const body = new Solid(d.x + 2, FLOOR - 26, 12, 26);
      body.collidable = false;
      let ax = d.x + 8;
      w.add(
        new (class extends Entity {
          solid = body;
          layer = 1;
          update(w2: World) {
            const t = cyc(w2, P, PH);
            // 0..2.6: at the door. 2.6..4.6: rides off. 5..7: rides in
            let target = d.x + 8;
            if (t >= 0.5 && t < 2.4) target = d.x - 6;
            const was = ax;
            ax += Math.sign(target - ax) * Math.min(Math.abs(target - ax), 60 * DT);
            body.collidable = ax < d.x + 4;
            if (body.collidable) body.moveBy(w2, ax - 6 - (body.x + body.xr), 0);
            else body.place(ax - 6, FLOOR - 26);
            void was;
            const state = t < 0.5 || t >= 3.9 ? 'shut' : t < 2.7 ? 'buying' : 'open';
            if (state !== w2.flags.twist) {
              w2.flags.twist = state;
              if (state === 'shut') L.open = false;
              else L.open = true;
              if (state === 'buying' && w2.player.cx > d.x - px(18)) npc(w2, 'Doi poi di, baba! | Two breads, please!', d.x, FLOOR - 40, 1.4);
            }
            w2.flags.poderT = t;
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            if (ax < d.x + 6) aunty(ctx, ax, FLOOR, -1, '#F06292', w2.flags.twist === 'buying', w2.tick * DT);
          }
        })(),
      );
      // the house front and the poder himself
      w.add(
        new Paint((ctx, w2) => {
          const t = cyc(w2, P, PH);
          ctx.fillStyle = '#F6C343';
          ctx.fillRect(d.x - px(3), FLOOR - 58, px(7), 58);
          ctx.fillStyle = '#FBF8F2';
          ctx.fillRect(d.x - px(3), FLOOR - 58, px(7), 3);
          ctx.fillRect(d.x - px(3), FLOOR - 58, 3, 58);
          ctx.fillRect(d.x + px(4) - 3, FLOOR - 58, 3, 58);
          ctx.fillStyle = '#B5482F';
          ctx.beginPath();
          ctx.moveTo(d.x - px(3) - 5, FLOOR - 58);
          ctx.lineTo(d.x + 8, FLOOR - 74);
          ctx.lineTo(d.x + px(4) + 5, FLOOR - 58);
          ctx.fill();
          text(ctx, w2.flags.twist === 'shut' ? 'SIESTA' : 'ABERTO', d.x + 8, FLOOR - 48, 5, w2.flags.twist === 'shut' ? '#B71C1C' : '#1B5E20', 'rgba(255,255,255,0.8)');
          let x: number | null = null;
          let moving = true;
          if (t < 2.6) {
            x = stopX;
            moving = false;
          } else if (t < 4.8) x = stopX + (t - 2.6) * 120;
          else if (t >= 5) x = stopX - (P - t) * 120;
          if (x !== null) poderArt(ctx, x, FLOOR, w2.tick * DT, moving, t > 0.15 && t < 0.6);
        }, -3),
      );
      w.when(
        (w2) => cyc(w2, P, PH) >= 0.15 && cyc(w2, P, PH) < 0.15 + DT * 1.5 && w2.player.cx > d.x - px(18),
        (w2) => {
          w2.sfx('honk', stopX, FLOOR - 20);
          npc(w2, 'Poim! Poim! | Bread! Bread!', stopX, FLOOR - 44, 1.0);
        },
        false,
      );
      w.when(
        (w2) => w2.player.cx > d.x - px(13),
        (w2) => tara(w2, 'Darvantt marun ugodd, Dad! | Just knock the door open, Dad!', 2.4),
      );
    },
  },
  /** The door is in the goal, and the keeper won't let anybody past him. Take the penalty: he dives
   *  (the wrong way, obviously) and the goal is yours for a moment. */
  penalty: {
    space: 16,
    after: 6,
    advice: 'The door is inside the goal and the keeper guards it, jumping when you jump. Kick the ball from the penalty spot: he dives for it, and you walk in while he’s down.',
    paint: (g, D) => {
      g.fill(D - 1, D + 3, 10, 10, '#');
      g.fill(D + 4, D + 4, 10, 14, '#');
    },
    build(w, d) {
      const L = d.x - px(1),
        R = d.x + px(4);
      const ball = w.add(new Football(d.x - px(6), FLOOR - 10));
      w.flags.spot = ball;
      const body = new Solid(L + 2, FLOOR - 28, 14, 28);
      let ky = 0,
        kvy = 0,
        dived = -1;
      w.flags.twist = 'keeping';
      w.add(
        new (class extends Entity {
          solid = body;
          layer = 2;
          update(w2: World) {
            const p = w2.player;
            const t = w2.tick;
            // the kick: he goes for it, the wrong way
            if (dived < 0 && ball.kicks > 0 && ball.vx > 40 && ball.x > d.x - px(5)) {
              dived = t;
              w2.flags.twist = 'dived';
              w2.sfx('gasp', body.x + 7, FLOOR - 20);
              body.collidable = false;
              body.w = 28;
              body.h = 10;
              body.place(R - 30, FLOOR - 10);
              body.collidable = true;
            }
            if (dived >= 0) {
              if (t - dived > secs(2.4)) {
                // up again, and the ball back on its spot
                dived = -1;
                w2.flags.twist = 'keeping';
                body.collidable = false;
                body.w = 14;
                body.h = 28;
                body.place(R - 16, FLOOR - 28);
                body.collidable = true;
                ky = 0;
                kvy = 0;
                ball.reset();
                ball.kicks = 0;
              }
              return;
            }
            // keeping: stay between Dad and the door, and jump when he jumps
            const want = Math.max(L + 1, Math.min(R - 15, p.x + p.w + 3));
            const dx = Math.max(-150 * DT, Math.min(150 * DT, want - (body.x + body.xr)));
            if (ky === 0 && p.jumpTick === t && Math.abs(p.cx - (body.x + 7)) < px(3.5)) kvy = -330;
            if (ky < 0 || kvy < 0) {
              kvy += 1100 * DT;
              const ny = Math.min(0, ky + kvy * DT);
              if (ny === 0) kvy = 0;
              body.moveBy(w2, dx, ny - ky);
              ky = ny;
            } else body.moveBy(w2, dx, 0);
          }
          draw(ctx: CanvasRenderingContext2D) {
            if (dived >= 0) footballer(ctx, body.x + 14, FLOOR - 2, 28, '#FFEB3B', { arms: 'up', lean: 1.45 });
            else footballer(ctx, body.x + 7, body.y + 28, 28, '#FFEB3B', { arms: 'wide' });
          }
        })(),
      );
      w.add(new Paint((ctx) => goalArt(ctx, L, R, px(11), FLOOR), -3));
      w.add(
        new Paint((ctx) => {
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.fillRect(d.x - px(6) - 3, FLOOR - 1, 16, 1);
          text(ctx, 'PENALTY', d.x - px(6) + 5, FLOOR - 26, 4.6, '#FFFFFF');
        }, -3),
      );
      w.when(
        (w2) => w2.player.cx > d.x - px(14),
        (w2) => tara(w2, 'Keeper-ak polle naka, bhitor ghus! | Ignore the keeper, just walk in!', 2.4),
      );
      void npc;
    },
  },
  /** No door in the street: it's up on the clock tower. The only way up is the minute hand. */
  clockhand: {
    space: 16,
    advice: 'The door is up on the clock tower, beside twelve. Stand where the minute hand sweeps the street at six: it scoops you up and carries you round past nine. Step off on to the ledge at twelve.',
    paint: (g, D) => {
      g.put(D, 14, '.');
      g.fill(D - 5, D - 1, 6, 6, '#');
      g.put(D - 3, 5, 'E');
    },
    build(w, d) {
      const D = Math.round(d.x / 16) + 3;
      const R = 73,
        cx = px(D - 6),
        cy = px(6) + R;
      const P = 12;
      const tip = new Solid(cx - 12, cy + R, 24, 5);
      tip.oneWay = true;
      const ang = (w2: World) => Math.PI + ((w2.tick * DT) / P) * Math.PI * 2;
      const at = (a: number) => ({ x: cx + Math.sin(a) * R, y: cy - Math.cos(a) * R });
      w.flags.twist = 'street';
      w.add(
        new (class extends Entity {
          solid = tip;
          layer = 2;
          update(w2: World) {
            const a = ang(w2);
            const q = at(a);
            tip.moveBy(w2, q.x - 12 - (tip.x + tip.xr), q.y - (tip.y + tip.yr));
            const p = w2.player;
            const on = w2.standing(tip);
            w2.flags.hand = { a: ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2), x: q.x, y: q.y, on };
            if (on && w2.flags.twist === 'street') w2.flags.twist = 'riding';
            else if (!on && w2.flags.twist === 'riding' && p.onGround) w2.flags.twist = p.y + p.h <= px(6) ? 'ledge' : 'street';
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            // the tower and the clock face
            ctx.fillStyle = '#FBF8F2';
            ctx.fillRect(cx - R - 10, cy - R - 26, R * 2 + 20, FLOOR - (cy - R - 26));
            ctx.fillStyle = '#ECE3CF';
            ctx.beginPath();
            ctx.arc(cx, cy, R + 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#4E342E';
            ctx.lineWidth = 2;
            ctx.stroke();
            const nums = ['XII', 'III', 'VI', 'IX'];
            for (let i = 0; i < 12; i++) {
              const a = (i / 12) * Math.PI * 2;
              const r0 = i % 3 === 0 ? R - 12 : R - 6;
              ctx.lineWidth = i % 3 === 0 ? 1.6 : 0.8;
              ctx.beginPath();
              ctx.moveTo(cx + Math.sin(a) * r0, cy - Math.cos(a) * r0);
              ctx.lineTo(cx + Math.sin(a) * (R - 2), cy - Math.cos(a) * (R - 2));
              ctx.stroke();
              if (i % 3 === 0) text(ctx, nums[i / 3], cx + Math.sin(a) * (R - 20), cy - Math.cos(a) * (R - 20), 6, '#4E342E', '');
            }
            // the hour hand (going nowhere) and the minute hand carrying its golden tip
            const a = ang(w2);
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#3E2723';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.sin(a / 12 + 2) * R * 0.5, cy - Math.cos(a / 12 + 2) * R * 0.5);
            ctx.stroke();
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(tip.x + 12, tip.y + 2);
            ctx.stroke();
            ctx.fillStyle = '#C9A227';
            ctx.fillRect(tip.x, tip.y, 24, 5);
            ctx.fillStyle = '#FFE082';
            ctx.fillRect(tip.x, tip.y, 24, 1.4);
            ctx.fillStyle = '#3E2723';
            ctx.beginPath();
            ctx.arc(cx, cy, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        })(),
      );
      w.when(
        (w2) => w2.player.cx > d.x - px(10),
        (w2) => tara(w2, 'Darvantt? Tem ghoddeacher asa! | The door? It’s up on the clock!', 2.6),
      );
      w.when(
        (w2) => w2.flags.twist === 'riding',
        (w2) => npc(w2, 'Bara vazta, Dad! Uttor! | At twelve, Dad! Get off!', cx, cy - R - 30, 2),
      );
    },
  },
  /** The door is up on the tapper's platform. The only spring around is the hammock, with an uncle
   *  asleep in it: every bounce goes higher, and on the third he's had enough. */
  hammock: {
    space: 16,
    advice: 'The door is up on the platform. Jump on to the hammock: every landing bounces you higher than the last. Steer on to the platform at the top of the second bounce, because on the third landing the uncle rolls over and dumps you.',
    paint: (g, D) => {
      g.put(D, 14, '.');
      g.fill(D - 3, D + 1, 7, 7, '#');
      g.put(D - 1, 6, 'E');
    },
    build(w, d) {
      const D = Math.round(d.x / 16) + 1;
      const hx0 = px(D - 9),
        hx1 = px(D - 5);
      const bed = new Solid(hx0, FLOOR - 18, hx1 - hx0, 5);
      bed.oneWay = true;
      let n = 0,
        dumped = -999;
      w.flags.twist = 'idle';
      w.flags.hammock = { x0: hx0, x1: hx1, n: 0 };
      const lines = ['Hmm...?', 'Kon re? | Who’s that?', 'Puro zalo! | That’s enough!'];
      w.add(
        new (class extends Entity {
          solid = bed;
          layer = 2;
          update(w2: World) {
            const p = w2.player;
            if (w2.tick - dumped < secs(1.2)) return;
            if (!bed.collidable) {
              bed.collidable = true;
              n = 0;
              w2.flags.hammock.n = 0;
              w2.flags.twist = 'idle';
            }
            // (he only counts as standing on it from his next update: the landing is enough)
            if (bed.collidable && p.isRiding(bed) && p.landTick === w2.tick - 1 && p.landSpeed > 150) {
              n++;
              w2.flags.hammock.n = n;
              w2.say(lines[Math.min(n, 3) - 1], (hx0 + hx1) / 2, FLOOR - 34, 1, 'npc');
              if (n >= 3) {
                // he rolls over: everybody out
                dumped = w2.tick;
                bed.collidable = false;
                w2.flags.twist = 'dumped';
                w2.sfx('snort', (hx0 + hx1) / 2, FLOOR - 20);
                return;
              }
              p.vy = -(n === 1 ? 520 : 670);
              p.launched = true;
              p.jumping = false;
              p.onGround = false;
              w2.sfx('boing', p.cx, p.y + p.h);
              w2.flags.twist = 'bouncing';
            }
            if (p.onGround && p.y + p.h === px(7) && p.cx > px(D - 3) && p.cx < px(D + 2)) w2.flags.twist = 'top';
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            const p = w2.player;
            const sag = w2.standing(bed) ? 5 : 2;
            const mid = p.cx > hx0 && p.cx < hx1 && w2.standing(bed) ? p.cx : (hx0 + hx1) / 2;
            ctx.strokeStyle = '#E57373';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(hx0 - 4, FLOOR - 26);
            if (bed.collidable) ctx.quadraticCurveTo(mid, FLOOR - 18 + sag * 2, hx1 + 4, FLOOR - 26);
            else ctx.quadraticCurveTo(mid, FLOOR + 2, hx1 + 4, FLOOR - 26);
            ctx.stroke();
            ctx.strokeStyle = '#FFF59D';
            ctx.lineWidth = 0.8;
            ctx.stroke();
            // the uncle, a lump under a sheet (or rolled out on the ground)
            if (bed.collidable) {
              ctx.fillStyle = '#ECEFF1';
              ctx.beginPath();
              ctx.ellipse((hx0 + hx1) / 2 + 12, FLOOR - 19, 10, 3.4, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#8D5524';
              ctx.beginPath();
              ctx.arc(hx1 - 6, FLOOR - 21, 2.8, 0, Math.PI * 2);
              ctx.fill();
            } else {
              ctx.fillStyle = '#ECEFF1';
              ctx.fillRect((hx0 + hx1) / 2 - 4, FLOOR - 9, 18, 7);
            }
          }
        })(),
      );
      w.add(
        new Paint((ctx) => {
          palmArt(ctx, hx0 - 4, FLOOR - 70, FLOOR + 2, 4);
          palmArt(ctx, hx1 + 4, FLOOR - 64, FLOOR + 2, -4);
          ctx.fillStyle = '#795548';
          ctx.fillRect(px(D - 3), px(8), 3, FLOOR - px(8));
          ctx.fillRect(px(D + 2) - 3, px(8), 3, FLOOR - px(8));
        }, -4),
      );
      w.when(
        (w2) => w2.player.cx > d.x - px(12),
        (w2) => tara(w2, 'Bhitor chodd, Dad, xiddi asa! | Climb up, Dad, there’s a ladder!', 2.4),
      );
    },
  },
  /** The door is on the casino boat, and the boat rides the swell. Its gangway tilts with it: when the
   *  boat rises you're walking up a slope that slides you back into the river. Go while it's low. */
  gangway: {
    space: 16,
    after: 5,
    advice: 'The door is on the boat, and the gangway tilts as the boat rides the swell. When the boat is high the slope slides you back into the river: hop on as it starts to come down, and run up while it’s low.',
    paint: (g, D) => void g.pit(D - 11, D + 5),
    build(w, d) {
      const D = Math.round(d.x / 16);
      pool(w, D - 11, D + 6, 15.45, { colors: RIVER, cause: 'splash' });
      const xLow = px(D - 10),
        xHigh = px(D - 4),
        yLow = FLOOR - 4;
      const P = 3.2;
      const deckY = (w2: World) => FLOOR - 26 + 30 * Math.sin(((w2.tick * DT) / P) * Math.PI * 2);
      const deck = new Solid(xHigh, deckY(w), px(8), 16);
      const plank = new Solid(xLow, yLow, 12, 4);
      plank.oneWay = true;
      d.follow = () => ({ x: d.x, y: deck.y - 32 });
      w.flags.twist = 'jetty';
      const lineY = (x: number) => yLow + ((deck.y - yLow) * (x - xLow)) / (xHigh - xLow);
      w.add(
        new (class extends Entity {
          solids = [deck, plank];
          layer = 1;
          update(w2: World) {
            const p = w2.player;
            deck.moveBy(w2, 0, deckY(w2) - (deck.y + deck.yr));
            const slope = (deck.y - yLow) / (xHigh - xLow);
            w2.flags.deck = { y: deck.y, slope, phase: ((w2.tick * DT) / P) % 1 };
            const on = w2.standing(plank);
            const cx = Math.max(xLow, Math.min(xHigh - 12, p.cx - 6));
            if (p.cx > xLow - 6 && p.cx < xHigh + 6) {
              plank.place(cx, plank.y + plank.yr);
              plank.moveBy(w2, 0, lineY(cx + 6) - (plank.y + plank.yr));
            }
            // the slope slides you down it
            if (on) p.pushVx += 230 * slope;
            if (w2.standing(deck)) w2.flags.twist = 'aboard';
            else if (on) w2.flags.twist = 'plank';
            else if (p.onGround) w2.flags.twist = 'jetty';
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            // the boat: a neon-trimmed hull under the deck
            const y = deck.y;
            ctx.fillStyle = '#26203F';
            ctx.fillRect(xHigh, y, px(8) + 8, 30);
            ctx.fillStyle = '#3B2F63';
            ctx.fillRect(xHigh + 4, y - 40, px(8) - 8, 40);
            const t = w2.tick * DT;
            for (let i = 0; i < 16; i++) {
              ctx.fillStyle = Math.floor(t * 6 + i) % 2 ? '#FF4081' : '#40C4FF';
              ctx.fillRect(xHigh + 2 + i * 8, y + 2, 3, 2);
            }
            text(ctx, 'CASINO', xHigh + px(4), y - 30, 7, '#FFD54F');
            // the gangway, with its rails
            ctx.strokeStyle = '#8D6E63';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(xLow, yLow);
            ctx.lineTo(xHigh, y);
            ctx.stroke();
            ctx.strokeStyle = '#BCAAA4';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(xLow, yLow - 12);
            ctx.lineTo(xHigh, y - 12);
            for (let k = 0; k <= 4; k++) {
              const x = xLow + ((xHigh - xLow) * k) / 4;
              ctx.moveTo(x, lineY(x));
              ctx.lineTo(x, lineY(x) - 12);
            }
            ctx.stroke();
          }
        })(),
      );
      w.when(
        (w2) => w2.player.cx > d.x - px(14),
        (w2) => tara(w2, 'Fottkiro na, Dad, dhanv vhoir! | No fear, Dad, run straight up!', 2.4),
      );
      void npc;
    },
  },
  /** The door is a sandcastle's. Every few seconds a wave runs up the beach, washes it away and shoves
   *  you back, and the kids build it again: a little further up the beach each time. */
  sandcastle: {
    space: 16,
    after: 6,
    advice: 'The door is the sandcastle’s. A wave washes it away every few seconds (and shoves you back), then the kids rebuild it, each time in a new spot. Wait for it to be finished, then run in before the next wave.',
    paint: (g, D) => void g.pit(D + 4, D + 6),
    build(w, d) {
      const D = Math.round(d.x / 16);
      pool(w, D + 4, D + 7, 15.45, { colors: ['rgba(64,170,210,0.86)', 'rgba(14,82,120,0.96)'], cause: 'splash' });
      const spots = [D - 1, D - 5, D + 1, D - 3];
      const P = 4.2;
      let lastK = -1;
      d.hidden = true;
      w.flags.twist = 'building';
      const phase = (w2: World) => {
        const u = w2.tick * DT + 1.2;
        const k = Math.floor(u / P);
        return { k, t: u - k * P };
      };
      // the wave's reach (px from the sea edge), 0 when it's out
      const reach = (t: number) => (t < 0.7 ? (t / 0.7) * px(11) : t < 1.4 ? px(11) * (1 - (t - 0.7) / 0.7) : 0);
      w.add(
        new (class extends Entity {
          layer = 4;
          update(w2: World) {
            const { k, t } = phase(w2);
            const spot = spots[((k % spots.length) + spots.length) % spots.length];
            if (k !== lastK) {
              lastK = k;
              d.x = px(spot);
            }
            const edge = px(D + 4) - reach(t);
            // the castle stands from 2.8 s until the wave reaches it
            const built = t >= 2.8 || (t < 0.7 && edge > d.x + 16);
            const was = d.hidden;
            d.hidden = !built;
            const tw = built ? 'built' : t < 1.4 ? 'washed' : 'building';
            if (tw !== w2.flags.twist) w2.flags.twist = tw;
            if (was && built) w2.sfx('pop', d.x + 8, FLOOR - 20);
            w2.flags.castle = { x: d.x, t, edge };
            // the wave shoves you back up the beach
            const p = w2.player;
            if (reach(t) > 0 && p.x + p.w > edge && p.y + p.h > FLOOR - 12) p.pushVx -= 170;
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            const { t } = phase(w2);
            const edge = px(D + 4) - reach(t);
            // the castle (whole, half built, or a wet lump)
            const x = d.x + 8;
            const k = d.hidden ? (t < 1.4 ? 0.15 : Math.max(0.15, (t - 1.4) / 1.4)) : 1;
            ctx.fillStyle = '#E8C98A';
            const h = 34 * k;
            ctx.fillRect(x - 18, FLOOR - h, 36, h);
            if (k >= 1) {
              for (const tx of [-18, -6, 6]) ctx.fillRect(x + tx, FLOOR - h - 6, 8, 6);
              ctx.fillStyle = '#D4A85A';
              ctx.fillRect(x - 18, FLOOR - h, 36, 3);
              ctx.fillStyle = '#E53935';
              ctx.fillRect(x - 1, FLOOR - h - 16, 1.4, 10);
              ctx.beginPath();
              ctx.moveTo(x + 0.4, FLOOR - h - 16);
              ctx.lineTo(x + 7, FLOOR - h - 13);
              ctx.lineTo(x + 0.4, FLOOR - h - 10);
              ctx.fill();
            }
            // the wave
            if (edge < px(D + 4)) {
              ctx.fillStyle = 'rgba(120,200,230,0.75)';
              ctx.fillRect(edge, FLOOR - 7, px(D + 4) - edge, 7);
              ctx.fillStyle = 'rgba(255,255,255,0.85)';
              ctx.fillRect(edge - 2, FLOOR - 8, 6, 3);
            }
            // the kids with their buckets, when they're building
            if (d.hidden && t >= 1.4) {
              for (const s of [-24, 26]) {
                ctx.fillStyle = s < 0 ? '#FF7043' : '#7E57C2';
                ctx.fillRect(x + s - 3, FLOOR - 13, 6, 8);
                ctx.fillStyle = '#8D5524';
                ctx.beginPath();
                ctx.arc(x + s, FLOOR - 16, 2.6, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        })(),
      );
      w.when(
        (w2) => w2.player.cx > px(D - 14),
        (w2) => tara(w2, 'Rettiechem ghor? Tem darvantt nhoi! | A sandcastle? That’s no door!', 2.4),
      );
    },
  },
  /** King Momo's decree for the last street of the parade: nobody walks, everybody hops. Walk more
   *  than a step on the ground (or bump a dancer) and his guards send you back to the start of it. */
  decree: {
    space: 16,
    advice: 'King Momo’s decree: in his street nobody walks. Hop all the way to the door: land and jump again at once, keep the hops low under the bunting, and don’t touch the dancers. Walking sends you back.',
    paint: (g, D) => void g.fill(D - 9, D - 6, 10, 10, '#'),
    build(w, d) {
      const D = Math.round(d.x / 16);
      const z0 = px(D - 14);
      let walked = 0,
        sent = -999;
      w.flags.twist = 'outside';
      const dancers = [
        { x0: px(D - 11), span: 40, p: 1.6, x: 0 },
        { x0: px(D - 4), span: 34, p: 1.3, x: 0 },
      ];
      w.flags.dancers = dancers;
      w.add(
        new (class extends Entity {
          layer = 3;
          update(w2: World) {
            const p = w2.player;
            const t = w2.tick * DT;
            for (const dn of dancers) dn.x = dn.x0 + (Math.sin((t / dn.p) * Math.PI * 2) * 0.5 + 0.5) * dn.span;
            const inside = p.cx > z0 && p.cx < d.x + 16;
            if (!inside) {
              walked = 0;
              if (w2.flags.twist !== 'outside' && p.cx <= z0) w2.flags.twist = 'outside';
              return;
            }
            if (w2.flags.twist === 'outside') {
              w2.flags.twist = 'hopping';
              npc(w2, 'Rei Momo bolta: uddi marun chal! | King Momo says: hop, don’t walk!', p.cx, p.y - 20, 1.6);
            }
            walked = p.onGround && Math.abs(p.vx) > 20 ? walked + 1 : p.onGround ? walked : 0;
            const bumped = dancers.some((dn) => p.x < dn.x + 10 && p.x + p.w > dn.x && p.y + p.h > FLOOR - 26);
            if ((walked > 14 || bumped) && w2.tick - sent > 30) {
              sent = w2.tick;
              walked = 0;
              w2.sfx('whistle', p.cx, p.y);
              npc(w2, bumped ? 'Nachpeak marlo! Fora! | You hit a dancer! Out!' : 'Chalop na! Fora! | No walking! Out!', p.cx, p.y - 20, 1.4);
              w2.warp(z0 - 20, FLOOR - 14, 'blink');
              w2.flags.twist = 'outside';
            }
            w2.flags.walked = walked;
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            const t = w2.tick * DT;
            // the dancers, in carnival colours, arms up
            for (const [i, dn] of dancers.entries()) {
              const x = dn.x + 5;
              ctx.fillStyle = i ? '#00ACC1' : '#E91E63';
              ctx.fillRect(x - 4, FLOOR - 20, 8, 12);
              ctx.fillStyle = '#212121';
              ctx.fillRect(x - 3, FLOOR - 8, 2, 8);
              ctx.fillRect(x + 1, FLOOR - 8, 2, 8);
              ctx.fillStyle = '#8D5524';
              ctx.beginPath();
              ctx.arc(x, FLOOR - 23, 3.4, 0, Math.PI * 2);
              ctx.fill();
              const a = Math.sin(t * 10 + i) * 0.5;
              ctx.strokeStyle = i ? '#00ACC1' : '#E91E63';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(x - 4, FLOOR - 18);
              ctx.lineTo(x - 8, FLOOR - 28 + a * 4);
              ctx.moveTo(x + 4, FLOOR - 18);
              ctx.lineTo(x + 8, FLOOR - 28 - a * 4);
              ctx.stroke();
            }
            // the street marked off, and King Momo by the door with his scroll
            ctx.fillStyle = 'rgba(255,213,79,0.5)';
            ctx.fillRect(z0, FLOOR - 1, d.x + 16 - z0, 1.5);
            const mx = d.x + px(2.6),
              my = FLOOR - 40;
            ctx.fillStyle = '#E53935';
            ctx.fillRect(mx - 7, my, 14, 40);
            ctx.fillStyle = '#C68B59';
            ctx.beginPath();
            ctx.arc(mx, my - 6, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFD54F';
            ctx.beginPath();
            ctx.moveTo(mx - 7, my - 11);
            ctx.lineTo(mx - 7, my - 19);
            ctx.lineTo(mx - 3, my - 14);
            ctx.lineTo(mx, my - 20);
            ctx.lineTo(mx + 3, my - 14);
            ctx.lineTo(mx + 7, my - 19);
            ctx.lineTo(mx + 7, my - 11);
            ctx.fill();
            ctx.fillStyle = '#FFF8E1';
            ctx.fillRect(mx - 16, my + 6, 10, 14);
            text(ctx, 'REI MOMO', mx, FLOOR - 6, 5, '#FFFFFF');
            text(ctx, 'SÓ PULOS!', (z0 + d.x) / 2, px(10.4), 6, '#FFD54F');
          }
        })(),
      );
      // bunting low over the middle of the street (solid: keep those hops low)
      w.add(
        new Paint((ctx) => {
          const cols = ['#E91E63', '#FFC107', '#00BCD4', '#8BC34A'];
          for (let x = px(D - 9), k = 0; x < px(D - 5); x += 8, k++) {
            ctx.fillStyle = cols[k % 4];
            ctx.beginPath();
            ctx.moveTo(x, px(11));
            ctx.lineTo(x + 4, px(11) + 7);
            ctx.lineTo(x + 8, px(11));
            ctx.fill();
          }
        }, 2),
      );
      w.when(
        (w2) => w2.player.cx > z0 - px(3),
        (w2) => tara(w2, 'Darvantt lagim, chalun voch, Dad! | The door’s close, just walk, Dad!', 2.4),
      );
    },
  },
  /** The customs post (Daman was Portuguese till 1961; the checkpost habit stayed). Join the queue at
   *  the back and shuffle forward with it. Overtake anybody, even in the air, and it's back of the line. */
  customs: {
    space: 16,
    advice: 'The door is the customs gate, and there’s a queue: join it at the back and move up only as it moves. Overtake anyone (jumping over counts) and you’re sent to the back. And someone always cuts in.',
    build(w, d) {
      const L = lock(w, d, 'Line ma aavo! | Get in line!');
      const front = d.x - 10;
      const GAP = 20;
      type Q = { cx: number; slot: number; shirt: string; gone: boolean };
      const q: Q[] = ['#5C6BC0', '#26A69A', '#EF6C00', '#8D6E63'].map((shirt, i) => ({ cx: front - i * GAP, slot: i, shirt, gone: false }));
      let cutter = false,
        stampT = 0,
        sent = -999;
      const P = 1.5;
      let next = -1;
      w.flags.queue = q;
      w.flags.twist = 'queue';
      w.add(
        new (class extends Entity {
          layer = 1;
          update(w2: World) {
            const p = w2.player;
            const waiting = q.filter((o) => !o.gone);
            // nobody moves till Dad is in the street
            if (p.cx < front - px(12)) return;
            if (next < 0) next = w2.tick + secs(P);
            if (w2.tick >= next && waiting.length) {
              next = w2.tick + secs(P);
              const f = waiting.find((o) => o.slot === 0)!;
              f.gone = true;
              w2.sfx('stamp', d.x, d.y + 10);
              for (const o of waiting) if (!o.gone) o.slot--;
            }
            // the one who cuts in, when Dad is next
            const left = q.filter((o) => !o.gone);
            if (!cutter && left.length === 1 && p.cx > front - GAP * 2 - 6) {
              cutter = true;
              const c: Q = { cx: d.x + px(3), slot: 0, shirt: '#D81B60', gone: false };
              for (const o of left) o.slot++;
              q.push(c);
              npc(w2, 'Bhai, ek j minute! | Brother, just one minute!', c.cx, FLOOR - 34, 1.6);
              next = w2.tick + secs(P + 0.6);
            }
            for (const o of q) if (!o.gone) o.cx += Math.sign(front - o.slot * GAP - o.cx) * Math.min(Math.abs(front - o.slot * GAP - o.cx), 50 * DT);
            // overtaking (on foot or over their heads): to the back with you
            const still = q.filter((o) => !o.gone);
            const passed = still.some((o) => p.cx > o.cx + 4 && Math.abs(o.cx - (front - o.slot * GAP)) < 3);
            if (passed && w2.tick - sent > 40) {
              sent = w2.tick;
              const back = Math.min(...still.map((o) => o.cx)) - GAP;
              npc(w2, 'Line ma ubha raho! | Stand in the queue!', d.x - 20, FLOOR - 40, 1.4);
              w2.warp(back - 5, FLOOR - 14, 'blink');
            }
            // Dad at the window, nobody ahead: stamped
            if (!still.length && !L.open) {
              const at = Math.abs(p.cx - front) < 8 && p.onGround;
              stampT = at ? stampT + DT : 0;
              if (stampT > 0.8) {
                w2.sfx('stamp', d.x, d.y + 10);
                npc(w2, 'Thappo! Aavjo! | Stamped! Off you go!', d.x - 10, FLOOR - 40, 1.4);
                L.unlock();
              }
            }
            w2.flags.front = front;
          }
          draw(ctx: CanvasRenderingContext2D) {
            // the checkpost booth and the officer
            ctx.fillStyle = '#ECEFF1';
            ctx.fillRect(d.x - 34, FLOOR - 44, 20, 44);
            ctx.fillStyle = '#B0BEC5';
            ctx.fillRect(d.x - 32, FLOOR - 36, 16, 10);
            ctx.fillStyle = '#C68B59';
            ctx.beginPath();
            ctx.arc(d.x - 24, FLOOR - 31, 3.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#37474F';
            ctx.fillRect(d.x - 27.5, FLOOR - 35.5, 7, 2);
            text(ctx, 'ALFÂNDEGA', d.x - 24, FLOOR - 48, 4.4, '#FFFFFF');
            for (const o of q) if (!o.gone) person(ctx, o.cx, FLOOR - 24, 24, o.shirt);
          }
        })(),
      );
      w.when(
        (w2) => w2.player.cx > d.x - px(15),
        (w2) => tara(w2, 'Line chhodo, sidha andar jao! | Skip the line, go straight in!', 2.4),
      );
    },
  },
  /** The cold store: the door's latch is pulled from the back of the room, and in there you freeze
   *  solid if you stand still. Keep moving: over the crates to the lever, and back to the door. */
  coldstore: {
    space: 14,
    after: 6,
    advice: 'The cold store door is locked: the lever is at the back of the room, past the door. Inside you freeze if you stop moving for a moment, so keep going: over the crates, hit the lever, straight back to the door.',
    paint: (g, D) => {
      g.fill(D - 8, D - 8, 14, 14, '#');
      g.fill(D - 5, D - 5, 13, 14, '#');
      g.fill(D - 2, D - 2, 14, 14, '#');
      g.fill(D + 2, D + 3, 13, 14, '#');
      g.fill(D + 5, D + 5, 9, 14, '#');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const L = lock(w, d, 'Lever kheencho! | Pull the lever!');
      const x0 = px(D - 11),
        x1 = px(D + 5);
      let frost = 0;
      const lever = { x: px(D + 3) + 4, y: FLOOR - 32 - 12 };
      w.flags.lever = lever;
      w.flags.twist = 'locked';
      w.add(
        new (class extends Entity {
          layer = 3;
          update(w2: World) {
            const p = w2.player;
            const inside = p.cx > x0 && p.cx < x1;
            if (inside) {
              frost = Math.abs(p.vx) < 15 && p.onGround ? frost + DT : Math.max(0, frost - 2 * DT);
              if (frost > 1.5) w2.die('frozen');
            } else frost = 0;
            w2.flags.frost = frost;
            if (!L.open && p.x < lever.x + 6 && p.x + p.w > lever.x - 2 && p.y < lever.y + 12 && p.y + p.h > lever.y) {
              L.unlock();
              w2.flags.twist = 'open';
              npc(w2, 'Khulyu! Jaldi bahar! | It’s open! Out, quick!', d.x + 8, FLOOR - 40, 1.4);
            }
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            // frosty walls, the lever, and Dad turning blue when he dawdles
            ctx.fillStyle = 'rgba(200,230,250,0.18)';
            ctx.fillRect(x0, FLOOR - px(6), x1 - x0, px(6));
            ctx.fillStyle = '#90A4AE';
            ctx.fillRect(lever.x, lever.y + 4, 4, 12);
            ctx.fillStyle = L.open ? '#43A047' : '#E53935';
            ctx.beginPath();
            ctx.arc(lever.x + (L.open ? 7 : -3), lever.y + 3, 3, 0, Math.PI * 2);
            ctx.fill();
            text(ctx, '-18°C', (x0 + x1) / 2, FLOOR - px(6) - 6, 5, '#E1F5FE');
            const p = w2.player;
            if (frost > 0.2) {
              ctx.fillStyle = `rgba(180,225,255,${Math.min(0.75, frost / 1.5)})`;
              ctx.fillRect(p.x - 1, p.y - 1, p.w + 2, p.h + 2);
              if (frost > 0.6) text(ctx, 'BRRR', p.cx, p.y - 8, 5, '#E1F5FE');
            }
          }
        })(),
      );
      w.when(
        (w2) => w2.player.cx > x0 - px(2),
        (w2) => tara(w2, 'Thodu araam karo, Dad! | Take a little rest, Dad!', 2.4),
      );
    },
  },
  /** The new dhow's door is up on its deck, and the only way up is the pennant line on the flagpole in
   *  the water: grab a pennant at the bottom, ride it up, and let go towards the deck at the right
   *  height. Ride it to the top and it's a long drop into the river. */
  flag: {
    space: 16,
    after: 5,
    advice: 'The door is on the dhow’s deck. Jump from the jetty and grab a pennant as it starts up the flagpole, ride it up, and jump off to the right once you’re above the deck. At the top it lets you go, into the river.',
    paint: (g, D) => {
      g.put(D, 14, '.');
      g.pit(D - 7, D - 4);
      g.fill(D - 3, D + 5, 9, 17, '#');
      g.put(D + 1, 8, 'E');
    },
    build(w, d) {
      const D = Math.round(d.x / 16) - 1;
      pool(w, D - 7, D - 3, 15.45, { colors: RIVER, cause: 'splash' });
      const poleX = px(D - 6) + 8;
      const P = 1.6,
        RISE = 50,
        Y0 = FLOOR - 14,
        TOP = 40;
      const life = (Y0 - TOP) / RISE + 0.5;
      const cols = ['#E53935', '#FDD835', '#1E88E5', '#43A047', '#FF7043'];
      type Pennant = Climbable & { y: number; on: boolean; k: number };
      const pens: Pennant[] = [];
      for (let i = 0; i < Math.ceil(life / P) + 1; i++) {
        const pn: Pennant = {
          active: false,
          len: 1e6,
          y: Y0,
          on: false,
          k: 0,
          at: () => ({ x: poleX, y: pn.y + 20 }),
          touch: (x, y, ww, h) => (pn.active && x < poleX + 9 && x + ww > poleX - 9 && y < pn.y + 8 && y + h > pn.y - 4 ? 0.5 : null),
        };
        pens.push(pn);
        w.climbables.push(pn);
      }
      w.flags.pennants = pens;
      w.flags.twist = 'jetty';
      w.add(
        new (class extends Entity {
          layer = 3;
          update(w2: World) {
            const t = w2.tick * DT;
            const last = Math.floor(t / P);
            const n = pens.length;
            for (let sl = 0; sl < n; sl++) {
              const i = last - ((((last - sl) % n) + n) % n);
              const age = t - i * P;
              const pn = pens[sl];
              const alive = i >= 0 && age < life;
              pn.k = i;
              pn.y = Math.max(TOP, Y0 - age * RISE);
              pn.active = alive && age < life - 0.5;
              pn.on = alive;
            }
            const p = w2.player;
            if (p.grip && pens.includes(p.grip as Pennant)) w2.flags.twist = 'hoisted';
            else if (p.onGround && p.y + p.h === px(9) && p.cx > px(D - 3)) w2.flags.twist = 'deck';
            else if (p.onGround) w2.flags.twist = 'jetty';
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            ctx.fillStyle = '#ECEFF1';
            ctx.fillRect(poleX - 1.5, TOP - 6, 3, FLOOR + 6 - TOP);
            ctx.fillStyle = '#FFD54F';
            ctx.beginPath();
            ctx.arc(poleX, TOP - 7, 2.6, 0, Math.PI * 2);
            ctx.fill();
            for (const pn of pens) {
              if (!pn.on) continue;
              const flap = Math.sin(w2.tick * DT * 9 + pn.k) * 2;
              ctx.fillStyle = cols[((pn.k % cols.length) + cols.length) % cols.length];
              ctx.beginPath();
              ctx.moveTo(poleX + 1, pn.y - 6);
              ctx.lineTo(poleX + 15, pn.y - 2 + flap);
              ctx.lineTo(poleX + 1, pn.y + 3);
              ctx.fill();
            }
            // the dhow's hull and rail
            ctx.fillStyle = '#8D6E63';
            ctx.fillRect(px(D - 3), px(9) - 4, px(9), 4);
            text(ctx, 'NAVO', px(D + 1), px(11), 7, '#FFE0B2');
          }
        })(),
      );
      w.when(
        (w2) => w2.player.cx > px(D - 14),
        (w2) => tara(w2, 'Pani ma kudo, tari jasho! | Jump in the water, you’ll float!', 2.4),
      );
    },
  },
  /** The sea fort's gate is across a moat and its drawbridge is up. The counterweight rope is on your
   *  side: hang on it and your weight lowers the bridge. Let go and it starts back up, so leap off and
   *  run straight across. */
  drawbridge: {
    space: 16,
    advice: 'The drawbridge is up. Jump and hang on the counterweight rope by the moat: your weight pulls it down and lowers the bridge. At the bottom, jump off towards the gate and run across before the bridge swings back up.',
    paint: (g, D) => void g.pit(D - 6, D - 2),
    build(w, d) {
      const D = Math.round(d.x / 16);
      pool(w, D - 6, D - 1, 15.45, { colors: RIVER, cause: 'splash' });
      const ropeX = px(D - 8) + 8;
      const TOP = 170,
        BOT = 222;
      let hy = TOP,
        held = false,
        letGo = -999,
        a = 1;
      const hx0 = px(D - 6),
        hx1 = px(D - 1);
      const deck = new Solid(hx0, FLOOR, hx1 - hx0, 8);
      deck.collidable = false;
      const rope: Climbable = {
        active: true,
        len: 1e6,
        at: () => ({ x: ropeX, y: hy + 18 }),
        touch: (x, y, ww, h) => (x < ropeX + 8 && x + ww > ropeX - 8 && y < hy + 6 && y + h > hy - 6 ? 0.5 : null),
        onGrip: () => {
          held = true;
        },
        onLeave: (w2) => {
          held = false;
          letGo = w2.tick;
        },
      };
      w.climbables.push(rope);
      w.flags.twist = 'up';
      w.add(
        new (class extends Entity {
          solid = deck;
          layer = 2;
          update(w2: World) {
            if (held) hy = Math.min(BOT, hy + 34 * DT);
            else if (w2.tick - letGo > secs(0.7)) hy = Math.max(TOP, hy - 26 * DT);
            a = (BOT - hy) / (BOT - TOP);
            deck.collidable = a < 0.3;
            w2.flags.bridge = { a, held, bottom: hy >= BOT - 0.5 };
            const p = w2.player;
            w2.flags.twist = p.cx > hx1 ? 'inside' : a < 0.3 ? 'down' : 'up';
          }
          draw(ctx: CanvasRenderingContext2D) {
            // the fort wall and gate, the bridge on its hinge, the rope over its pulley
            ctx.fillStyle = '#9E8C72';
            ctx.fillRect(hx1, FLOOR - 64, d.x - hx1, 64);
            ctx.fillRect(d.x + 16, FLOOR - 64, px(2), 64);
            ctx.fillRect(d.x, FLOOR - 64, 16, 28);
            ctx.fillStyle = '#8C7A60';
            for (let k = 0; k < 4; k++) ctx.fillRect(hx1 + k * 16, FLOOR - 70, 10, 6);
            ctx.save();
            ctx.translate(hx1, FLOOR + 4);
            ctx.rotate(-a * (Math.PI / 2) * 0.95);
            ctx.fillStyle = '#8D6E63';
            ctx.fillRect(-(hx1 - hx0), -4, hx1 - hx0, 8);
            ctx.fillStyle = '#5D4037';
            for (let k = 0; k < hx1 - hx0; k += 10) ctx.fillRect(-(hx1 - hx0) + k, -4, 2, 8);
            ctx.restore();
            const tipA = -a * (Math.PI / 2) * 0.95;
            const tx = hx1 - Math.cos(tipA) * (hx1 - hx0),
              ty = FLOOR + 4 + Math.sin(tipA) * (hx1 - hx0);
            ctx.strokeStyle = '#3E2723';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(hx1 - 2, FLOOR - 60);
            ctx.stroke();
            ctx.fillStyle = '#5D4037';
            ctx.fillRect(ropeX - 2, TOP - 40, 4, FLOOR - TOP + 40);
            ctx.fillStyle = '#90A4AE';
            ctx.beginPath();
            ctx.arc(ropeX, TOP - 40, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#D7CCC8';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(ropeX + 4, TOP - 40);
            ctx.lineTo(ropeX + 4, hy);
            ctx.stroke();
            ctx.fillStyle = '#FFB74D';
            ctx.fillRect(ropeX - 1, hy - 3, 10, 5);
          }
        })(),
      );
      w.when(
        (w2) => w2.player.cx > px(D - 14),
        (w2) => tara(w2, 'Tari ne jao, Dad! Paani thandu chhe! | Swim across, Dad! The water’s cool!', 2.4),
      );
    },
  },
  /** The market's back door stands loose on the wet floor. Walk into it at a run and it skids away
   *  across the fish scales; come up to it slowly, a step at a time, and it stays put for you. */
  slidedoor: {
    space: 16,
    after: 6,
    advice: 'The door stands loose on the wet fish-market floor: run into it and it skids away. Come up to it slowly, a little step at a time, and walk in.',
    paint: (g, D) => {
      g.fill(D - 9, D + 5, 15, 15, '~');
      g.fill(D + 6, D + 6, 9, 14, '#');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      let x = d.x,
        v = 0;
      const lo = px(D - 9),
        hi = px(D + 6) - 16;
      d.follow = () => ({ x, y: d.y });
      w.flags.twist = 'standing';
      d.onReach = (w2) => {
        const p = w2.player;
        if (Math.abs(p.vx) <= 45) return w2.win('door');
        if (Math.abs(v) > 5) return;
        v = Math.sign(p.vx || 1) * Math.min(240, Math.abs(p.vx) * 1.4);
        w2.flags.twist = 'skidding';
        w2.sfx('slide', x + 8, d.y + 20);
        npc(w2, 'Dhire, Dad! Fish ni bhingi jamin! | Slowly, Dad! The floor is wet with fish!', x + 8, d.y - 8, 1.6);
      };
      w.add(
        new (class extends Entity {
          layer = -1;
          update(w2: World) {
            if (v === 0) return;
            x += v * DT;
            if (x < lo || x > hi) {
              x = Math.max(lo, Math.min(hi, x));
              v = -v * 0.4;
              w2.sfx('thud', x + 8, d.y + 20);
            }
            v = Math.abs(v) < 6 ? 0 : v - Math.sign(v) * 70 * DT;
            if (v === 0) w2.flags.twist = 'standing';
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            // fish scales glinting on the wet floor
            ctx.fillStyle = 'rgba(220,240,255,0.55)';
            for (let i = 0; i < 24; i++) {
              const sx = lo + ((i * 37) % (hi + 16 - lo)),
                k = Math.sin(w2.tick * DT * 3 + i) > 0.6;
              ctx.fillRect(sx, FLOOR - 1, k ? 3 : 2, 1);
            }
            if (v !== 0) {
              ctx.strokeStyle = 'rgba(255,255,255,0.6)';
              ctx.lineWidth = 0.8;
              ctx.beginPath();
              ctx.moveTo(x + (v > 0 ? -2 : 18), FLOOR - 2);
              ctx.lineTo(x + (v > 0 ? -14 : 30), FLOOR - 1);
              ctx.stroke();
            }
          }
        })(),
      );
      w.when(
        (w2) => w2.player.cx > px(D - 13),
        (w2) => tara(w2, 'Dodo, Dad! Darvajo bhaagi jashe! | Run, Dad! The door will get away!', 2.4),
      );
    },
  },
  /** The door isn't there yet: the Warli painter is still painting it on the wall, stroke by stroke,
   *  walking up and down his ladder. Get in his way and he stops. Keep clear till it's done. */
  paintwall: {
    space: 16,
    advice: 'The door is still being painted on the wall. The painter stops whenever you’re near him, so keep well clear while he walks up and down, and go in once the last stroke is done.',
    build(w, d) {
      let prog = 0,
        told = -999;
      d.hidden = true;
      w.flags.twist = 'painting';
      const x0 = d.x - px(5),
        x1 = d.x + px(3);
      let px0 = x0;
      w.flags.painter = { x: px0, prog };
      w.add(
        new (class extends Entity {
          layer = 3;
          update(w2: World) {
            const t = w2.tick * DT;
            px0 = x0 + (Math.sin(t * 1.4) * 0.5 + 0.5) * (x1 - x0);
            const p = w2.player;
            const close = Math.abs(p.cx - px0) < 40;
            if (prog < 1) {
              if (close) {
                if (w2.tick - told > 150) {
                  told = w2.tick;
                  npc(w2, 'Baaju khaso, chitra bagde chhe! | Move aside, you’re spoiling it!', px0, FLOOR - 40, 1.4);
                }
              } else if (p.cx > d.x - px(16)) prog = Math.min(1, prog + DT / 5);
              if (prog >= 1) {
                d.hidden = false;
                w2.flags.twist = 'done';
                w2.sfx('win', d.x + 8, d.y);
                w2.emit('fx', d.x + 8, d.y + 10, { kind: 'sparkle' });
              }
            }
            w2.flags.painter = { x: px0, prog };
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            // the wall, the door being painted (white Warli strokes), dancers round it
            ctx.fillStyle = '#8D4F2E';
            ctx.fillRect(x0 - 20, FLOOR - 70, x1 - x0 + 56, 70);
            ctx.strokeStyle = '#FFFDF5';
            ctx.lineWidth = 1.4;
            const k = prog;
            ctx.beginPath();
            const per = 16 * 2 + 32 * 2;
            let left = per * k;
            const seg = (ax: number, ay: number, bx: number, by: number) => {
              const len = Math.hypot(bx - ax, by - ay);
              if (left <= 0) return;
              const f = Math.min(1, left / len);
              ctx.moveTo(ax, ay);
              ctx.lineTo(ax + (bx - ax) * f, ay + (by - ay) * f);
              left -= len;
            };
            seg(d.x, FLOOR, d.x, FLOOR - 32);
            seg(d.x, FLOOR - 32, d.x + 16, FLOOR - 32);
            seg(d.x + 16, FLOOR - 32, d.x + 16, FLOOR);
            seg(d.x + 16, FLOOR, d.x, FLOOR);
            ctx.stroke();
            const t = w2.tick * DT;
            for (let i = 0; i < 6; i++) {
              const fx = x0 - 10 + i * 22,
                fy = FLOOR - 52 + Math.sin(t * 4 + i) * 2;
              ctx.fillStyle = '#FFFDF5';
              ctx.beginPath();
              ctx.arc(fx, fy - 6, 1.8, 0, Math.PI * 2);
              ctx.fill();
              ctx.beginPath();
              ctx.moveTo(fx - 3, fy - 4);
              ctx.lineTo(fx + 3, fy - 4);
              ctx.lineTo(fx, fy);
              ctx.lineTo(fx + 3, fy + 4);
              ctx.lineTo(fx - 3, fy + 4);
              ctx.lineTo(fx, fy);
              ctx.closePath();
              ctx.fill();
            }
            // the painter on his little ladder
            const lx = px0;
            ctx.strokeStyle = '#A1887F';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(lx - 5, FLOOR);
            ctx.lineTo(lx - 2, FLOOR - 22);
            ctx.moveTo(lx + 5, FLOOR);
            ctx.lineTo(lx + 2, FLOOR - 22);
            for (let r = 4; r < 22; r += 5) {
              ctx.moveTo(lx - 4, FLOOR - r);
              ctx.lineTo(lx + 4, FLOOR - r);
            }
            ctx.stroke();
            person(ctx, lx, FLOOR - 44, 22, '#F5F5F5');
          }
        })(),
      );
      w.when(
        (w2) => w2.player.cx > d.x - px(14),
        (w2) => tara(w2, 'Madad karo ne, Dad! | Go help him, Dad!', 2.4),
      );
    },
  },
  /** The last jetty's planks are loose, each balanced on one post: land off-centre and it tips,
   *  sliding you towards the low end and then into the sea. Hop from middle to middle. */
  tipjetty: {
    space: 16,
    advice: 'The jetty’s planks are loose, each on a single post: land near the middle and it holds, land near an end and it tips you into the sea. Hop from the middle of one to the middle of the next, quickly.',
    paint: (g, D) => void g.pit(D - 13, D - 1),
    build(w, d) {
      const D = Math.round(d.x / 16);
      pool(w, D - 13, D, 15.45, { colors: ['rgba(64,170,210,0.86)', 'rgba(14,82,120,0.96)'], cause: 'splash' });
      const centers = [px(D - 11), px(D - 8), px(D - 5), px(D - 2)];
      const planks = centers.map((c) => {
        const s = new Solid(c - 16, FLOOR - 4, 32, 5);
        s.oneWay = true;
        return { c, s, a: 0, down: -999 };
      });
      w.flags.planks = planks;
      w.flags.twist = 'jetty';
      w.add(
        new (class extends Entity {
          solids = planks.map((q) => q.s);
          layer = 2;
          update(w2: World) {
            const p = w2.player;
            for (const q of planks) {
              if (w2.tick - q.down < secs(1.2)) continue;
              q.s.collidable = true;
              const on = w2.standing(q.s);
              const target = on ? Math.max(-1, Math.min(1, (p.cx - q.c) / 9)) : 0;
              q.a += Math.max(-2.6 * DT, Math.min(2.6 * DT, target - q.a));
              if (on && Math.abs(q.a) > 0.55) p.pushVx += Math.sign(q.a) * 260 * (Math.abs(q.a) - 0.55);
              if (Math.abs(q.a) >= 0.97) {
                // over it goes
                q.down = w2.tick;
                q.s.collidable = false;
                q.a = 0;
                w2.sfx('creak', q.c, FLOOR - 4);
              }
            }
            if (p.onGround && p.cx > px(D)) w2.flags.twist = 'end';
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            for (const q of planks) {
              ctx.fillStyle = '#6D4C41';
              ctx.fillRect(q.c - 2, FLOOR, 4, 14);
              if (!q.s.collidable && w2.tick - q.down < secs(1.2)) continue;
              ctx.save();
              ctx.translate(q.c, FLOOR - 2);
              ctx.rotate(q.a * 0.45);
              ctx.fillStyle = '#A1887F';
              ctx.fillRect(-16, -2, 32, 5);
              ctx.fillStyle = '#795548';
              ctx.fillRect(-16, 1, 32, 2);
              ctx.fillRect(-1, -2, 2, 5);
              ctx.restore();
            }
          }
        })(),
      );
      w.when(
        (w2) => w2.player.cx > px(D - 15),
        (w2) => tara(w2, 'Chhede ubha raho, majboot chhe! | Stand at the ends, they’re strong!', 2.4),
      );
    },
  },
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
    advice: 'The door is at the back of the last ring, behind the lamp: you can’t walk to it. Join the dance instead: at the ring’s left end, in a gap, press jump and you’re dancing with them. When you come round right behind the lamp, jump again, straight into the door.',
    build(w, d) {
      const D = Math.round(d.x / 16);
      const cx = px(D) + 8,
        R = 80;
      const g = w.add(new GarbaRing(cx, FLOOR, [{ r: R, n: 6, w: 0.7, phase: 0.3 }]));
      w.add(g.front);
      w.flags.pravesh = g;
      const L = lock(w, d, 'Garbo ni pachhal chhe! Raas ma jodao! | It’s behind the lamp! Join the dance!');
      w.flags.twist = 'line';
      const TAU = Math.PI * 2;
      w.add(
        new (class extends Entity {
          update(w2: World) {
            const p = w2.player;
            if (w2.state !== 'play') return;
            const j = g.joined;
            if (!j) {
              if (w2.input.jumpPressed && p.onGround && Math.abs(p.cx - (cx - R)) <= 12) {
                // stepping in right on top of a dancer knocks you both flat
                const a0 = g.angle(0, w2.tick * DT);
                for (let k = 0; k < 6; k++) {
                  let dth = (((a0 + (TAU * k) / 6 - Math.PI) % TAU) + TAU) % TAU;
                  if (dth > Math.PI) dth -= TAU;
                  if (Math.abs(dth) < 0.3) return w2.die('garba');
                }
                g.joined = { ring: 0, th: Math.PI };
                p.stun = 2;
                w2.flags.twist = 'dancing';
                npc(w2, 'Aavo, aavo! | Come, come!', cx - R, FLOOR - 34, 1.2);
              }
              return;
            }
            const th = ((j.th % TAU) + TAU) % TAU;
            w2.flags.danceTh = th;
            if (!w2.input.jumpPressed) return;
            if (Math.abs(th - 1.5 * Math.PI) < 0.3) {
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
  /** The show's last act: the puppeteer hands Dad the control bar. Now his buttons work the puppet up on
   *  the little stage (Dad stands still), and the door only opens once she reaches hers. */
  sutradhar: {
    space: 18,
    advice: 'At the end the puppeteer hands you the strings: stand on his spot and your buttons work the puppet on the little stage instead of you. Walk her over the gap and the step to her tiny door, and yours opens. Drop her and the show’s over.',
    paint: (g, D) => {
      g.fill(D - 12, D - 2, 12, 12, '#');
      g.fill(D - 8, D - 7, 12, 12, '.');
      g.fill(D - 5, D - 5, 11, 11, '#');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const L = lock(w, d, 'Pehla show poora karo! | Finish the show first!');
      const spot = px(D - 15) + 8;
      const stageTop = px(12);
      const puppet = new Player(px(D - 12) + 3, stageTop - 14);
      let held = false,
        done = false,
        bowAt = -1;
      w.flags.puppet = puppet;
      w.flags.twist = 'walk';
      w.add(
        new (class extends Entity {
          layer = 4;
          update(w2: World) {
            const p = w2.player;
            if (w2.state !== 'play') return;
            if (!held && !done && p.onGround && Math.abs(p.cx - spot) < 6) {
              held = true;
              w2.flags.twist = 'puppet';
              npc(w2, 'Lo, dor tharo haath mein! | Here, the strings are yours!', spot, FLOOR - 40, 1.6);
            }
            if (!held) return;
            p.stun = 2;
            p.vx = 0;
            puppet.update(w2, w2.input);
            if (puppet.y > FLOOR + 30) return w2.die('puppet');
            if (puppet.cx >= px(D - 3) + 4 && puppet.onGround) {
              held = false;
              done = true;
              bowAt = w2.tick;
              L.open = true;
              w2.flags.twist = 'done';
              w2.sfx('clap', puppet.cx, puppet.y);
              npc(w2, 'Wah! Wah! | Bravo! Bravo!', px(D - 7), stageTop - 30, 1.6);
            }
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            const t = w2.tick * DT;
            // the little stage's curtains, her tiny door
            ctx.fillStyle = '#B71C1C';
            ctx.fillRect(px(D - 12) - 4, stageTop - 44, 4, 44);
            ctx.fillRect(px(D - 1), stageTop - 44, 4, 44);
            ctx.fillStyle = '#880E4F';
            ctx.fillRect(px(D - 12) - 6, stageTop - 50, px(11) + 12, 7);
            ctx.fillStyle = '#5D4037';
            ctx.fillRect(px(D - 3) + 4, stageTop - 16, 9, 16);
            ctx.fillStyle = '#FFC107';
            ctx.fillRect(px(D - 3) + 10, stageTop - 8, 1.5, 1.5);
            // the puppet: wooden face, big eyes, a red flared skirt, on her strings
            const x = puppet.cx,
              f = puppet.y + puppet.h;
            const bow = bowAt >= 0 && w2.tick - bowAt < 90 ? Math.sin(((w2.tick - bowAt) / 90) * Math.PI) * 0.6 : 0;
            ctx.save();
            ctx.translate(x, f);
            ctx.fillStyle = '#C62828';
            ctx.beginPath();
            ctx.moveTo(-2, -9);
            ctx.lineTo(2, -9);
            ctx.lineTo(6 + Math.sin(t * 6) * 0.8, 0);
            ctx.lineTo(-6 + Math.sin(t * 6) * 0.8, 0);
            ctx.fill();
            ctx.fillStyle = '#FFC107';
            ctx.fillRect(-6, -1.5, 12, 1.2);
            ctx.rotate(bow);
            ctx.fillStyle = '#F57F17';
            ctx.fillRect(-2, -13, 4, 4);
            ctx.fillStyle = '#FFE0B2';
            ctx.beginPath();
            ctx.ellipse(0, -16, 3, 3.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#212121';
            ctx.fillRect(-1.8, -17, 1.2, 1.2);
            ctx.fillRect(0.6, -17, 1.2, 1.2);
            ctx.fillStyle = '#AD1457';
            ctx.beginPath();
            ctx.arc(0, -18, 3.4, Math.PI, 0);
            ctx.fill();
            ctx.restore();
            // her strings up to the bar, and the long string back to Dad's hands
            if (held || bowAt >= 0) {
              const by = stageTop - 62;
              ctx.strokeStyle = 'rgba(255,255,240,0.75)';
              ctx.lineWidth = 0.6;
              ctx.beginPath();
              ctx.moveTo(x - 8, by);
              ctx.lineTo(x + 8, by);
              ctx.moveTo(x - 6, by);
              ctx.lineTo(x - 3, f - 8);
              ctx.moveTo(x, by);
              ctx.lineTo(x, f - 19);
              ctx.moveTo(x + 6, by);
              ctx.lineTo(x + 3, f - 8);
              if (held) {
                ctx.moveTo(x - 8, by);
                ctx.lineTo(w2.player.cx + 3, w2.player.y + 2);
              }
              ctx.stroke();
            }
            // the puppeteer's spot
            if (!held && !done) {
              ctx.fillStyle = 'rgba(255,235,59,0.55)';
              ctx.fillRect(spot - 7, FLOOR - 2, 14, 2);
            }
          }
        })(),
      );
      w.when(
        (w2) => w2.player.cx > px(D - 18),
        (w2) => tara(w2, 'Seedha darwaje jaavo, Dad! | Go straight to the door, Dad!', 2.4),
      );
    },
  },
  /** A Rajasthani door is entered only after the toran over it has been struck. You've no stick: swing
   *  the tower of pots on your head until the top one rings it, and not one bit further. */
  toran: {
    space: 14,
    advice: 'The door opens only once you’ve struck the toran hanging over it, and all you have is the tower of pots. Take a good run at it and stop dead on the mark: the pots swing forward and the top one strikes the toran. Stop at the wrong moment and they swing the other way.',
    build(w, d) {
      const D = Math.round(d.x / 16);
      const pots = w.entities.find((e) => e instanceof Pots) as Pots | undefined;
      const L = lock(w, d, 'Pehla toran maaro! | Strike the toran first!');
      const mark = px(D) - 12;
      // where the toran hangs: the top pot reaches it leaning about a third of the way to falling
      const tx = mark + Math.sin(0.26) * 36,
        ty = FLOOR - 14 - Math.cos(0.26) * 36;
      w.flags.toran = { x: tx, y: ty, mark };
      w.flags.twist = 'shut';
      let struck = -1;
      w.add(
        new (class extends Entity {
          layer = 3;
          update(w2: World) {
            if (struck >= 0 || !pots || !pots.held) return;
            const tp = pots.top(w2);
            if (Math.hypot(tp.x - tx, tp.y - ty) < 7) {
              struck = w2.tick;
              L.open = true;
              w2.flags.twist = 'open';
              w2.sfx('bell', tx, ty);
              npc(w2, 'Toran maaryo! Padharo! | Toran struck! Come in!', tx, ty - 16, 1.6);
            }
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            // the toran: a beam over the door hung with mango leaves and little brass bells
            const swing = struck >= 0 ? Math.sin((w2.tick - struck) * 0.3) * Math.max(0, 1 - (w2.tick - struck) / 120) * 0.4 : 0;
            ctx.fillStyle = '#8D6E63';
            ctx.fillRect(tx - 14, ty - 10, px(2) + 4, 3);
            ctx.save();
            ctx.translate(tx, ty - 8);
            ctx.rotate(swing);
            for (let k = -3; k <= 3; k++) {
              ctx.fillStyle = k % 2 ? '#43A047' : '#FFB300';
              ctx.beginPath();
              ctx.moveTo(k * 4, 0);
              ctx.lineTo(k * 4 - 2, 6);
              ctx.lineTo(k * 4, 9);
              ctx.lineTo(k * 4 + 2, 6);
              ctx.fill();
            }
            ctx.restore();
            // the mark to stand on
            if (struck < 0) {
              ctx.fillStyle = 'rgba(233,30,99,0.6)';
              ctx.fillRect(mark - 6, FLOOR - 2, 12, 2);
            }
          }
        })(),
      );
      w.when(
        (w2) => w2.player.cx > px(D - 12),
        (w2) => tara(w2, 'Dheere dheere jaavo, Dad! | Go slowly, slowly, Dad!', 2.4),
      );
    },
  },
  /** The last bowl has the door in its very bottom, a little bronze hatch that only opens under someone
   *  standing still. All that swinging: now kill it, and wait. */
  shant: {
    space: 16,
    after: 11,
    advice: 'The door is under the little bronze hatch in the very bottom of the last bowl, and it only opens under someone standing still. Drop in, then push against the way you’re sliding until you stop at the bottom, and wait.',
    paint: (g, D) => {
      g.fill(D - 12, D - 11, 13, 14, '#').fill(D - 10, D - 6, 11, 14, '#');
      g.fill(D + 6, D + 9, 11, 14, '#');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const half = 88,
        depth = 64;
      const R = (half * half + depth * depth) / (2 * depth);
      const max = Math.asin(half / R);
      w.add(new Board(px(D) + 8 - half, FLOOR - depth, half - 32));
      const b = w.add(new Bowl(px(D) + 8, FLOOR, R, max, max, { hatch: true }));
      w.flags.lastBowl = b;
      d.hidden = true;
      const L = lock(w, d, '');
      let still = 0;
      w.flags.twist = 'swinging';
      w.add(
        new (class extends Entity {
          update(w2: World) {
            const calm = b.in && Math.abs(b.phi) < 0.06 && Math.abs(b.speed) < 18;
            still = calm ? still + 1 : 0;
            w2.flags.still = still;
            b.calm = Math.min(1, still / 96);
            if (still >= 96 && !L.open) {
              L.unlock();
              d.hidden = false;
            }
          }
        })(),
      );
      w.when(
        () => b.in,
        (w2) => tara(w2, 'Hilo mat! Shaant! | Don’t move! Be still!', 2.4),
      );
    },
  },
  /** The last doorway is a little round one, too small for the bangle, and the lane up to it is all
   *  glass. So do what a manihar does to make a bangle fit: warm it over the coals till it shrinks.
   *  Leave it there too long and it's a puddle. */
  naap: {
    space: 16,
    advice: 'The glass goes right through the last little doorway, and the bangle is too big for it. Do what the bangle makers do: stop it over the coals till it shrinks enough to fit (it glows as it softens), then roll on through. Too long on the coals and it melts.',
    paint: (g, D) => {
      g.fill(D - 3, D - 3, 0, 12, '#');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const b = w.add(new Bangle(px(D - 13) + 8, FLOOR, 20, '#6A1B9A'));
      b.heat = [{ x0: px(D - 10), x1: px(D - 8) }];
      w.flags.lastBangle = b;
      w.flags.coals = b.heat[0];
      w.add(new Paint((ctx, w2) => brazierArt(ctx, px(D - 10), px(D - 8), FLOOR, w2.tick / 120), -2));
      w.add(new Shards(px(D - 7), px(D) - 2, FLOOR));
      // the little doorway: a lintel low over it
      w.add(
        new (class extends Entity {
          solid = new Solid(px(D - 3), FLOOR - 48, 16, 22);
          layer = 2;
          draw(ctx: CanvasRenderingContext2D) {
            ctx.fillStyle = '#C2185B';
            ctx.fillRect(px(D - 3), FLOOR - 48, 16, 22);
            ctx.fillStyle = '#FFD54F';
            ctx.fillRect(px(D - 3), FLOOR - 28, 16, 2);
            ctx.fillStyle = '#F8BBD0';
            ctx.beginPath();
            ctx.arc(px(D - 3) + 8, FLOOR - 26, 8, Math.PI, 0);
            ctx.fill();
          }
        })(),
      );
      w.flags.twist = 'big';
      let told = -999;
      w.add(
        new (class extends Entity {
          update(w2: World) {
            if (b.gone > 0) w2.flags.twist = 'big';
            else if (b.x > px(D - 2)) w2.flags.twist = 'through';
            else w2.flags.twist = b.r <= 15 ? 'fits' : 'big';
            // bumped the doorway with it still too big
            if (b.riding && b.r > 15 && b.x > px(D - 5) - 6 && w2.tick - told > 300) {
              told = w2.tick;
              tara(w2, 'Naap chhoto karo! Angithi pe! | Too big! Shrink it on the coals!', 2.4);
            }
          }
        })(),
      );
    },
  },
  /** All stage long you've wanted that horse off. Now it's a wedding, the door is for the groom, and a
   *  groom arrives on a horse: the costume rail across the lane takes it off anyone who goes under. */
  dulha: {
    space: 18,
    after: 5,
    advice: 'It’s a wedding, and the door only opens for a groom on his horse. The costume rail across the lane lifts the horse off anyone who rides under it: jump the rail (hold the jump) and arrive still wearing it. Lost it? It’s back on its stand.',
    paint: (g, D) => {
      g.fill(D + 3, D + 3, 9, 14, '#');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const g = w.add(new Ghodi(px(D - 15) + 8, 1e9, FLOOR));
      const rail = { x: px(D - 7), y: FLOOR - 36, w: 14, h: 36 };
      g.snags = [rail];
      w.flags.dulha = { g, rail };
      const L = lock(w, d, 'Bina ghodi ke dulha? | A groom without a horse?');
      w.add(
        new (class extends Entity {
          layer = 2;
          update(w2: World) {
            L.open = g.on;
            w2.flags.twist = g.on ? (w2.player.x > rail.x + rail.w ? 'groom' : 'riding') : 'onfoot';
          }
          draw(ctx: CanvasRenderingContext2D) {
            // the costume rail: two posts, a bar, hooks, a couple of spare horses' skirts hanging
            ctx.fillStyle = '#6D4C41';
            ctx.fillRect(rail.x - 2, rail.y - 4, 3, rail.h + 4);
            ctx.fillRect(rail.x + rail.w - 1, rail.y - 4, 3, rail.h + 4);
            ctx.fillStyle = '#FFD54F';
            ctx.fillRect(rail.x - 3, rail.y - 5, rail.w + 6, 2.5);
            ctx.fillStyle = '#C62828';
            ctx.fillRect(rail.x + 2, rail.y - 2, 4, 9);
            ctx.fillStyle = '#1565C0';
            ctx.fillRect(rail.x + 8, rail.y - 2, 4, 7);
            // marigolds over the door
            for (let k = 0; k < 7; k++) {
              ctx.fillStyle = k % 2 ? '#FB8C00' : '#FDD835';
              ctx.beginPath();
              ctx.arc(d.x - 6 + k * 4.6, d.y + 2 + Math.sin((k / 6) * Math.PI) * 4, 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        })(),
      );
      w.when(
        (w2) => w2.player.x > px(D - 17),
        (w2) => tara(w2, 'Baraat aa gayi! Dulha kathe? | The wedding party’s here! Where’s the groom?', 2.6),
      );
    },
  },
  /** The door is on top of a narrow tower, right where the wind that brought you won't let you stop.
   *  So don't: fly past it, drop in to the wind that blows back, and let that one set you down. */
  palat: {
    space: 16,
    after: 12,
    advice: 'The door is on top of a narrow tower, and the high wind carries you straight past it. Fly over it on purpose, then sink in to the middle wind, the one that blows back left, and let it carry you on to the tower top. Out you get when the basket settles there.',
    paint: (g, D) => {
      g.fill(D - 1, D + 1, 9, 14, '#');
      g.put(D, 14, '#');
      g.put(D, 8, 'E');
      g.fill(D + 11, D + 11, 0, 14, '#');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const bands = [
        { below: 112, vx: 110 },
        { below: 176, vx: -70 },
        { below: 999, vx: 50 },
      ];
      const b = w.add(new Balloon(px(D - 13) + 8, FLOOR, bands, { x0: px(D - 1), x1: px(D + 2) }, '#6A1B9A'));
      w.flags.lastBalloon = b;
      w.flags.towerTop = px(9);
      w.flags.twist = 'ground';
      w.add(
        new (class extends Entity {
          update(w2: World) {
            if (b.done) w2.flags.twist = 'landed';
            else if (!b.riding) w2.flags.twist = 'ground';
            else w2.flags.twist = b.bx > px(D + 2) ? 'past' : 'flying';
          }
        })(),
      );
      let said = false;
      w.add(
        new (class extends Entity {
          update(w2: World) {
            if (!said && b.riding && b.bx > px(D + 3)) {
              said = true;
              tara(w2, 'Nikal gya! Beech ri hawa pakdo! | Gone past! Catch the middle wind!', 2.6);
            }
          }
        })(),
      );
    },
  },
  /** Ganesh Pol is far too high: higher than her back and your best jump together. But all stage long
   *  she's been tossing you over her back whenever you dawdled at her trunk. Now aim her. */
  salaami: {
    space: 16,
    after: 5,
    advice: 'The gate is too high even from her back. Use the toss: ride her right up to the wall, jump off behind her tail, step up close, and stand still at her trunk once she’s turned to face you. She’ll throw you over her back, up on to the gate.',
    paint: (g, D) => {
      g.fill(D - 1, D + 3, 7, 14, '#');
      g.put(D, 6, 'E');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const e = w.add(new Elephant(px(D - 12), FLOOR));
      w.flags.lastHaathi = e;
      w.flags.gateX = px(D - 1);
      w.flags.twist = 'far';
      w.add(
        new (class extends Entity {
          layer = -2;
          update(w2: World) {
            const p = w2.player;
            if (p.onGround && p.y + p.h <= px(7) + 1 && p.x + p.w > px(D - 1)) w2.flags.twist = 'up';
            else w2.flags.twist = e.x + Elephant.W >= px(D - 1) - 10 ? 'parked' : 'far';
          }
          draw(ctx: CanvasRenderingContext2D) {
            // Ganesh Pol: a painted gateway framing the door (pillars, a frieze, a cusped arch)
            const gx = px(D - 1),
              gy = px(7);
            ctx.fillStyle = '#F6E2B3';
            ctx.fillRect(gx, gy - 44, 80, 9);
            ctx.fillRect(gx, gy - 44, 6, 44);
            ctx.fillRect(gx + 74, gy - 44, 6, 44);
            ctx.fillStyle = '#C62828';
            ctx.fillRect(gx, gy - 46, 80, 3);
            ctx.fillStyle = '#2E7D32';
            for (let k = 0; k < 9; k++) ctx.fillRect(gx + 4 + k * 8.4, gy - 41, 4, 3);
            ctx.strokeStyle = '#F06292';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(d.x + 8, gy - 20, 15, Math.PI, 0);
            ctx.stroke();
          }
        })(),
      );
      w.when(
        (w2) => w2.player.x > px(D - 6),
        (w2) => tara(w2, 'Ganesh Pol! Ghano ooncho hai! | Ganesh Pol! It’s very high!', 2.4),
      );
    },
  },
  // ------------------------------------------------------------------ Bhopal
  /** All stage long the lake has drowned anyone who stopped. Raja Bhoj's door is under it: on the
   *  ghat, where the steps go down in to the water, it's only waist deep. Stop there, and sink. */
  ghat: {
    space: 12,
    after: 6,
    advice: 'The door is under the water, at the foot of the ghat’s steps where the lake is shallow. Skip out, and over the pale water let go of everything so you sink there; or skip right across and wade back in from the far bank.',
    paint: (g, D) => {
      g.pit(D - 8, D + 2);
      g.fill(D - 2, D + 2, 17, 17, '#');
      g.put(D, 14, '.');
      g.put(D, 16, 'E');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const lake = w.add(new Lake(px(D - 8), px(D + 3), FLOOR + 3));
      lake.shallows = [{ x0: px(D - 2), x1: px(D + 3) }];
      w.flags.ghat = { lake, x0: px(D - 2), x1: px(D + 3) };
      w.flags.twist = 'dry';
      w.add(
        new Paint((ctx) => {
          // the pale shallows, the steps going down, a marker post
          ctx.fillStyle = 'rgba(220,245,240,0.35)';
          ctx.fillRect(px(D - 2), FLOOR + 3, px(5), 29);
          ctx.fillStyle = '#C9B48A';
          for (let k = 0; k < 4; k++) ctx.fillRect(px(D + 3) - 2 - k * 5, FLOOR + 4 + k * 7, 5 + k * 5, 7);
          ctx.fillStyle = '#6D4C41';
          ctx.fillRect(px(D + 4) + 6, FLOOR - 26, 2, 26);
          ctx.fillStyle = '#FFF8E1';
          ctx.fillRect(px(D + 4) - 4, FLOOR - 36, 22, 11);
          text(ctx, 'GHAT', px(D + 4) + 7, FLOOR - 30, 5, '#00695C');
        }, -1),
      );
      w.add(
        new (class extends Entity {
          update(w2: World) {
            const p = w2.player;
            const wet = p.y + p.h > FLOOR + 10 && p.cx > px(D - 2) && p.cx < px(D + 3);
            w2.flags.twist = wet ? 'wading' : p.cx > px(D + 3) ? 'across' : 'dry';
          }
        })(),
      );
      w.when(
        (w2) => w2.player.x > px(D - 11),
        (w2) => tara(w2, 'Darwaza? Paani ke neeche hai, khan! | The door? It’s under the water, friend!', 2.8),
      );
    },
  },

  /** No hand stencil where you need one. So make one, the way they did: stand at the bare patch of
   *  rock, hold still, and blow the ochre round your own hand. */
  haath: {
    space: 14,
    advice: 'There’s a painted wall, then a boulder, and no red hands. Make your own: stand quite still at each bare patch of rock (by the bowl of ochre) till your hand is on the wall, then jump and touch it. The door is a painted one.',
    build(w, d) {
      const D = Math.round(d.x / 16);
      const sh = (w.flags.shelter as Shelter) ?? w.add(new Shelter());
      w.flags.shelter = sh;
      w.add(new Ledge(sh, px(D - 9), px(5), 16, px(10), false));
      w.add(new Ledge(sh, px(D - 4), px(5), 32, px(10), true));
      const spots = [
        { x: px(D - 12) + 8, t: 0, made: false },
        { x: px(D - 6) + 8, t: 0, made: false },
      ];
      w.flags.spots = spots;
      w.flags.twist = 'bare';
      w.add(
        new (class extends Entity {
          layer = -3;
          update(w2: World) {
            const p = w2.player;
            // a painted door: only a painted man can use it
            d.hidden = !sh.painted;
            for (const s of spots) {
              if (s.made) continue;
              if (p.onGround && Math.abs(p.cx - s.x) < 9 && Math.abs(p.vx) < 6) {
                if (++s.t >= 96) {
                  s.made = true;
                  sh.hand(s.x, FLOOR - 40);
                  w2.sfx('win', s.x, FLOOR - 40);
                  w2.emit('fx', s.x, FLOOR - 40, { kind: 'sparkle' });
                }
              } else s.t = 0;
            }
            w2.flags.twist = spots[1].made ? 'two' : spots[0].made ? 'one' : 'bare';
          }
          draw(ctx: CanvasRenderingContext2D) {
            for (const s of spots) {
              // a bowl of ochre on the floor, and a pale smoothed patch of rock above it
              ctx.fillStyle = '#5D4037';
              ctx.fillRect(s.x - 5, FLOOR - 4, 10, 4);
              ctx.fillStyle = '#B03A1E';
              ctx.fillRect(s.x - 4, FLOOR - 5, 8, 2);
              if (s.made) continue;
              ctx.fillStyle = 'rgba(245,225,195,0.5)';
              ctx.beginPath();
              ctx.arc(s.x, FLOOR - 40, 10, 0, Math.PI * 2);
              ctx.fill();
              if (s.t > 0) handArt(ctx, s.x, FLOOR - 40, s.t / 96);
            }
            if (!sh.painted) {
              // the painted door, seen from outside the picture
              ctx.strokeStyle = 'rgba(176,58,30,0.75)';
              ctx.lineWidth = 1.5;
              ctx.strokeRect(d.x + 2, d.y + 6, 12, 26);
              ctx.beginPath();
              ctx.arc(d.x + 11, d.y + 20, 1, 0, Math.PI * 2);
              ctx.stroke();
            }
          }
        })(),
      );
      w.when(
        (w2) => w2.player.x > px(D - 15),
        (w2) => tara(w2, 'Yahan koi haath nahin! Apna lagao, miyan! | No hand here! Make your own, sir!', 2.8),
      );
    },
  },

  /** All stage long, touching your own thread was the end of you. An embroiderer finishes with a knot:
   *  at the gold ring, turn round and step back on to it. */
  gaanth: {
    space: 12,
    advice: 'The door wants the work finished off with a knot. At the gold ring, and only there, touching your own thread ties it: walk through the ring, turn round, and step straight back on to the thread.',
    build(w, d) {
      const D = Math.round(d.x / 16);
      const th = w.add(new Thread(px(D - 10) + 8, 1e9, FLOOR));
      const kx = px(D - 6);
      th.knot = { x0: kx, x1: kx + 26, y0: FLOOR - 24, y1: FLOOR };
      w.flags.knotAt = th.knot;
      const L = lock(w, d, 'Gaanth lagao pehle! | Tie the knot first!');
      w.flags.twist = 'loose';
      w.add(
        new Paint((ctx, w2) => {
          // the ring on its post, glinting
          ctx.fillStyle = '#6D4C41';
          ctx.fillRect(kx + 12, FLOOR - 4, 2, 4);
          ctx.strokeStyle = th.tied ? '#FFF176' : '#FFC107';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(kx + 13, FLOOR - 12, 11, 9, 0, 0, Math.PI * 2);
          ctx.stroke();
          if (!th.tied) {
            ctx.fillStyle = `rgba(255,255,255,${0.5 + 0.5 * Math.sin(w2.tick * 0.1)})`;
            ctx.fillRect(kx + 20, FLOOR - 19, 2, 2);
          }
        }, 3),
      );
      w.when(
        () => th.tied,
        (w2) => {
          L.unlock();
          w2.flags.twist = 'tied';
        },
      );
    },
  },
  /** The door is at the bottom of the big bowl, under the water, and a tap keeps the bowl full however
   *  hard you splash. Turn the tap off (the wheel is up on the ledge), then bounce it dry. */
  khaali: {
    space: 16,
    advice: 'The door is in the bottom of the big bowl, and the tap over it fills it as fast as you splash it out. First five bounces on the small bowl to get up on the ledge and turn the wheel: tap off. Then bounce in the big bowl till it’s dry.',
    paint: (g, D) => {
      g.fill(D - 8, D - 7, 11, 14, '#');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const small = w.add(new Katori(px(D - 11) + 8, FLOOR));
      const big = w.add(new Katori(px(D) + 8, FLOOR, 24, 6));
      big.tap = true;
      const vx = px(D - 7) + 8,
        vy = px(11);
      let shut = false;
      d.hidden = true;
      const L = lock(w, d, '');
      w.flags.khaali = { small, big, vx };
      w.flags.twist = 'tap';
      w.add(
        new (class extends Entity {
          layer = 2;
          update(w2: World) {
            const p = w2.player;
            if (!shut && p.onGround && Math.abs(p.cx - vx) < 9 && Math.abs(p.y + p.h - vy) < 3) {
              shut = true;
              big.tap = false;
              big.refill = 0;
              w2.sfx('creak', vx, vy);
              tara(w2, 'Nal band! Ab khaali karo! | Tap’s off! Now empty it!', 2.4);
            }
            if (big.dry && !L.open) {
              L.unlock();
              d.hidden = false;
            }
            w2.flags.twist = L.open ? 'dry' : shut ? 'shut' : 'tap';
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            // the wheel on the ledge, and its pipe along to the tap over the big bowl
            ctx.strokeStyle = '#78909C';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(vx, vy - 8);
            ctx.lineTo(vx, FLOOR - 61);
            ctx.lineTo(px(D) + 8, FLOOR - 61);
            ctx.stroke();
            ctx.strokeStyle = shut ? '#90A4AE' : '#E53935';
            ctx.beginPath();
            ctx.arc(vx, vy - 8, 5, 0, Math.PI * 2);
            ctx.stroke();
            const a = shut ? 0.8 : w2.tick * 0.02;
            ctx.beginPath();
            ctx.moveTo(vx - Math.cos(a) * 5, vy - 8 - Math.sin(a) * 5);
            ctx.lineTo(vx + Math.cos(a) * 5, vy - 8 + Math.sin(a) * 5);
            ctx.stroke();
          }
        })(),
      );
      w.when(
        (w2) => w2.player.x > px(D - 5) && !shut,
        (w2) => tara(w2, 'Nal chalu hai! Kabhi khaali nahin hogi! | The tap’s on! It’ll never empty!', 2.6),
      );
    },
  },

  /** Surma is sitting by the door, and every time you get near it: "The door? It was over there."
   *  And then it is. He can't tell it with his mouth full: bring him a paan. */
  paan: {
    space: 16,
    advice: 'Every time you get near the door Surma says it was "over there", and so it is. He can’t talk with his mouth full: pick up a paan at the shop, take it to him, and while he chews, walk to wherever the door is now.',
    build(w, d) {
      const D = Math.round(d.x / 16);
      const spots = [px(D), px(D - 13)];
      const s = w.add(new Surma(px(D - 4) + 8, FLOOR, []));
      const shop = px(D - 9) + 8;
      let carrying = false,
        cool = 0,
        due = -1;
      w.flags.paan = { s, shop, spots };
      w.flags.twist = 'talking';
      w.add(
        new (class extends Entity {
          layer = 3;
          update(w2: World) {
            const p = w2.player;
            if (w2.state !== 'play') return;
            if (cool > 0) cool--;
            if (!carrying && s.chew === 0 && Math.abs(p.cx - shop) < 9 && p.onGround) {
              carrying = true;
              w2.sfx('win', shop, FLOOR - 20);
            }
            if (carrying && Math.abs(p.cx - s.x) < 16) {
              carrying = false;
              s.chew = 6 * 120;
              due = -1;
              s.say(w2, 'Mmmf... hao... | Mmmf... yes...', 1.6);
            }
            if (s.chew === 0 && cool === 0 && due < 0 && Math.abs(p.cx - (d.x + 8)) < 46) {
              s.say(w2, 'Darwaza? Woh toh udhar tha, khan! | The door? It was over there, friend!', 1.8);
              due = w2.tick + 44;
              cool = 150;
            }
            if (due >= 0 && w2.tick >= due) {
              due = -1;
              if (s.chew === 0) {
                d.x = d.x === spots[0] ? spots[1] : spots[0];
                w2.emit('fx', d.x + 8, d.y + 16, { kind: 'sparkle' });
                w2.sfx('thud', d.x, d.y);
                w2.flags.swaps = (w2.flags.swaps ?? 0) + 1;
              }
            }
            w2.flags.carrying = carrying;
            w2.flags.twist = s.chew > 0 ? 'chewing' : carrying ? 'paan' : 'talking';
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            // the paan counter: a brass tray of leaves
            ctx.fillStyle = '#6D4C41';
            ctx.fillRect(shop - 10, FLOOR - 14, 20, 14);
            ctx.fillStyle = '#FFC107';
            ctx.fillRect(shop - 11, FLOOR - 16, 22, 3);
            ctx.fillStyle = '#2E7D32';
            for (let k = -8; k < 8; k += 5) ctx.fillRect(shop + k, FLOOR - 19, 4, 3);
            if (carrying) {
              const p = w2.player;
              ctx.fillStyle = '#2E7D32';
              ctx.beginPath();
              ctx.moveTo(p.cx - 4, p.y - 4);
              ctx.lineTo(p.cx + 4, p.y - 4);
              ctx.lineTo(p.cx, p.y - 10);
              ctx.fill();
              ctx.fillStyle = '#C62828';
              ctx.fillRect(p.cx - 0.8, p.y - 8, 1.6, 1.6);
            }
          }
        })(),
      );
    },
  },

  /** A row of spiked magnets low over the way to the door: with iron on you there is no getting
   *  through. So don't have iron on you. Give the man his tawa back. */
  rakhdo: {
    space: 14,
    advice: 'The spiked magnets before the door hang low enough to grab you off the floor, as long as you’re carrying iron. Stand still at the chulha for a moment and put the tawa down. Then just walk under them.',
    build(w, d) {
      const D = Math.round(d.x / 16);
      const t = (w.flags.tawaEnt as Tawa) ?? w.add(new Tawa(px(D - 14), 1e9, FLOOR));
      w.flags.tawaEnt = t;
      t.stand = px(D - 11) + 8;
      for (const c of [-8, -6, -4, -2]) w.add(new Chumbak(px(D + c) + 8, px(9), { spiked: true, reach: 110 }));
      w.flags.stand = t.stand;
      w.flags.twist = 'carrying';
      w.when(
        () => t.down,
        (w2) => {
          w2.flags.twist = 'down';
          tara(w2, 'Tawa rakh diya! Ab chumbak kya karega? | Tawa’s down! What can a magnet do now?', 2.4);
        },
      );
      w.when(
        (w2) => w2.player.x > px(D - 13),
        (w2) => tara(w2, 'Itne chumbak! Lohe ke saath nahin nikloge! | All those magnets! You won’t get through with iron!', 2.6),
      );
    },
  },

  /** Surma tells how it ended, and it has to end the way he tells it: three feats, in his order,
   *  which is not the order they're standing in. */
  kissa: {
    space: 28,
    advice: 'Surma tells how the story ended, and you have to do it his way, in his order: hang from the magnet (jump up under it while it’s red), then three bounces in a row on the bowl, then three skips across the pond (run off the bank, don’t jump). Then the door opens: come back across.',
    paint: (g, D) => {
      g.pit(D - 24, D - 19);
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const lake = w.add(new Lake(px(D - 24), px(D - 18), FLOOR + 3));
      const bowl = w.add(new Katori(px(D - 15) + 8, FLOOR));
      w.add(new Tawa(px(D - 27), 1e9, FLOOR));
      const mag = w.add(new Chumbak(px(D - 10) + 8, px(7), { every: 3, on: 1.5, reach: 100 }));
      const s = w.add(new Surma(px(D - 4) + 8, FLOOR, []));
      const L = lock(w, d, 'Kissa poora suno! | Hear the story out!');
      const feats = ['hang', 'bounce', 'skip'] as const;
      const lines = [
        'Pehle Dad chumbak se latka! | First Dad hung from the magnet!',
        'Phir katori pe teen baar uchhla! | Then he bounced three times on the bowl!',
        'Phir talab pe teen tappe khaye! | Then he skipped three times on the pond!',
      ];
      let step = -1,
        hangs = 0,
        bounced = false,
        skipped = false;
      w.flags.kissa = { step, lake, bowl, mag };
      w.flags.twist = 'arriving';
      w.add(
        new (class extends Entity {
          layer = 2;
          update(w2: World) {
            if (w2.state !== 'play' || L.open) return;
            const p = w2.player;
            if (step < 0) {
              if (p.cx > px(D - 7)) {
                step = 0;
                hangs = mag.hangs;
                s.say(w2, lines[0], 2.6);
              }
            } else {
              let ev: (typeof feats)[number] | null = null;
              if (mag.hangs > hangs) {
                hangs = mag.hangs;
                ev = 'hang';
              }
              const b = bowl.streak >= 3;
              if (b && !bounced) ev = 'bounce';
              bounced = b;
              const k = lake.count >= 3;
              if (k && !skipped) ev = 'skip';
              skipped = k;
              if (ev) {
                if (ev === feats[step]) {
                  step++;
                  w2.sfx('win', p.cx, p.y);
                  if (step >= 3) {
                    L.unlock();
                    s.say(w2, 'Aur tab darwaza khula. Hao! | And then the door opened. Yes!', 2.6);
                  } else s.say(w2, lines[step], 2.6);
                } else if (step > 0) {
                  step = 0;
                  s.say(w2, 'Ama nahin! Aise nahin tha! Shuru se! | No, no! That’s not how it went! From the top!', 2.4);
                }
              }
            }
            (w2.flags.kissa as any).step = step;
            w2.flags.twist = L.open ? 'open' : step < 0 ? 'arriving' : feats[Math.min(2, step)];
          }
          draw(ctx: CanvasRenderingContext2D) {
            // the three feats over the door, ticked off as they're done
            const names = ['⤒', '♪', '≈'];
            for (let k = 0; k < 3; k++) {
              const x = d.x + 8 + (k - 1) * 12;
              ctx.fillStyle = k < step ? '#FFD740' : 'rgba(0,0,0,0.55)';
              ctx.fillRect(x - 5, d.y - 30, 10, 10);
              text(ctx, names[k], x, d.y - 25, 7, k < step ? '#212121' : '#FFFFFF', '');
            }
          }
        })(),
      );
    },
  },
  // ------------------------------------------------------------------ Raipur
  /** The door is in a little mud hut and a man on stilts is far too tall for it. There's only one way
   *  anyone has come off the gedi all day: land badly. Do it on the dry ground. */
  utar: {
    space: 12,
    advice: 'On the stilts you’re too tall for the hut’s doorway, and the only way off them is the wrong way: come down from a jump still moving. Jump from the mud so that you land, running, on the dry ground in front of the hut. Not in the mud.',
    paint: (g, D) => {
      g.fill(D - 2, D - 2, 0, 12, '#');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const g = w.add(new Gedi(px(D - 10) + 8, 1e9, FLOOR));
      w.add(new Mud(px(D - 9), px(D - 5), FLOOR));
      w.flags.utar = { g, dry: px(D - 5), wall: px(D - 2), mudX: px(D - 9) };
      w.flags.twist = 'up';
      w.add(
        new Paint((ctx) => {
          // the hut: mud wall, thatch, a little dark doorway
          ctx.fillStyle = '#C8A27A';
          ctx.fillRect(px(D - 2), FLOOR - 62, px(5), 30);
          ctx.fillStyle = '#B58A5A';
          ctx.beginPath();
          ctx.moveTo(px(D - 2) - 8, FLOOR - 60);
          ctx.lineTo(px(D) + 8, FLOOR - 92);
          ctx.lineTo(px(D + 3) + 8, FLOOR - 60);
          ctx.fill();
          ctx.fillStyle = '#F5F5F5';
          for (let k = 0; k < 6; k++) ctx.fillRect(px(D - 2) + 4 + k * 12, FLOOR - 40, 5, 2);
        }, -2),
      );
      w.add(
        new (class extends Entity {
          update(w2: World) {
            w2.flags.twist = g.on ? 'up' : g.topples > 0 ? 'off' : 'foot';
          }
        })(),
      );
      w.when(
        (w2) => g.on && w2.player.x > px(D - 5),
        (w2) => tara(w2, 'Gedi ma nai ghusas! Utar ja! | You won’t fit on stilts! Get off them!', 2.6),
      );
    },
  },

  /** The door only opens when the tower strikes twelve. And this clock only moves when you do. */
  ghanta: {
    space: 12,
    advice: 'The door opens when the tower clock strikes twelve, and stays open only a little past it. The clock only moves when you do, so stand by the door and wind it round with small steps and jumps on the spot; when it reads twelve, walk in.',
    build(w, d) {
      const D = Math.round(d.x / 16);
      const g = (w.flags.ghadi as Ghadi) ?? w.add(new Ghadi(px(D - 12)));
      const RATE = 0.36;
      const hour = () => (((g.t / RATE) % 12) + 12) % 12;
      const L = lock(w, d, 'Barah baje khulhi! | It opens at twelve!');
      w.flags.ghanta = { hour, spot: d.x - 12 };
      w.flags.twist = 'shut';
      let was = false;
      w.add(
        new (class extends Entity {
          layer = -2;
          update(w2: World) {
            const h = hour();
            const open = h < 0.6;
            L.open = open;
            if (open && !was) w2.sfx('win', d.x, d.y - 60);
            was = open;
            w2.flags.twist = open ? 'twelve' : 'shut';
            w2.flags.hour = h;
          }
          draw(ctx: CanvasRenderingContext2D) {
            // the Nagar Ghadi over the door
            const cx = d.x + 8;
            ctx.fillStyle = '#ECEFF1';
            ctx.fillRect(cx - 14, FLOOR - 120, 28, 120);
            ctx.fillStyle = '#D84315';
            ctx.beginPath();
            ctx.moveTo(cx - 17, FLOOR - 120);
            ctx.lineTo(cx, FLOOR - 140);
            ctx.lineTo(cx + 17, FLOOR - 120);
            ctx.fill();
            // one hand, showing the hour
            const h = hour();
            ctx.fillStyle = h < 0.6 ? '#FFF59D' : '#FFFDE7';
            ctx.beginPath();
            ctx.arc(cx, FLOOR - 98, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#3E2723';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = '#D84315';
            ctx.fillRect(cx - 1, FLOOR - 109, 2, 3);
            ctx.fillStyle = '#3E2723';
            for (let k = 1; k < 12; k++) {
              const a = (k / 12) * Math.PI * 2;
              ctx.fillRect(cx + Math.sin(a) * 9.5 - 0.6, FLOOR - 98 - Math.cos(a) * 9.5 - 0.6, 1.2, 1.2);
            }
            const a = (h / 12) * Math.PI * 2;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, FLOOR - 98);
            ctx.lineTo(cx + Math.sin(a) * 8.5, FLOOR - 98 - Math.cos(a) * 8.5);
            ctx.stroke();
          }
        })(),
      );
      void clockFace;
    },
  },

  /** The door is up on the godown's loading ledge, and the one sack hangs nowhere near it. But this
   *  one is on a trolley: push the crate under it and the sack comes along. */
  khisko: {
    space: 16,
    after: 6,
    advice: 'The sack hangs a long way short of the ledge, but it’s on a trolley: push the crate along the floor and the sack rolls along above it. Push it right up to the wall, climb on the crate, pull the cord, and walk up the rice.',
    paint: (g, D) => {
      g.fill(D - 2, D + 3, 9, 14, '#');
      g.put(D + 1, 8, 'E');
    },
    build(w, d) {
      // the door is one column in from where the ending was laid out (see paint)
      const D = Math.round(d.x / 16) - 1;
      const h = w.add(new Heap(px(D - 16), 28, FLOOR));
      const s = w.add(new Sack(px(D - 12) + 8, px(3), 9800, h, FLOOR - px(3) - 46, 2800));
      const crate = new Solid(px(D - 12), FLOOR - 16, 16, 16);
      w.flags.khisko = { s, crate, wall: px(D - 2), heap: h };
      w.flags.twist = 'far';
      w.add(
        new (class extends Entity {
          solid = crate;
          layer = 1;
          private refill = 0;
          update(w2: World) {
            const p = w2.player;
            if (w2.state !== 'play') return;
            // pushed along (either way) by someone leaning on it
            const feet = p.y + p.h;
            if (p.onGround && Math.abs(feet - (crate.y + 16)) < 3 && !s.open) {
              if (w2.input.right && Math.abs(p.x + p.w - crate.x) <= 1 && !w2.solidAt(crate.x + 16, crate.y, 1, 14)) crate.moveBy(w2, 0.9, 0);
              else if (w2.input.left && Math.abs(p.x - (crate.x + 16)) <= 1 && crate.x > px(D - 14)) crate.moveBy(w2, -0.9, 0);
            }
            s.x = crate.x + 8;
            if (s.open && s.left <= 0 && ++this.refill > 120) {
              this.refill = 0;
              s.left = s.vol;
            }
            w2.flags.twist = s.open ? 'pouring' : crate.x + 16 >= px(D - 2) - 1 ? 'placed' : 'far';
          }
          draw(ctx: CanvasRenderingContext2D) {
            // the rail overhead, the trolley, its chain down to the crate
            ctx.fillStyle = '#455A64';
            ctx.fillRect(px(D - 14), px(3) - 20, px(12), 3);
            ctx.fillRect(s.x - 6, px(3) - 18, 12, 4);
            ctx.fillStyle = '#8D6E63';
            ctx.fillRect(crate.x, crate.y, 16, 16);
            ctx.fillStyle = '#6D4C41';
            ctx.fillRect(crate.x, crate.y, 16, 2);
            ctx.fillRect(crate.x, crate.y + 14, 16, 2);
            ctx.fillRect(crate.x + 7, crate.y, 2, 16);
            ctx.fillStyle = '#263238';
            ctx.fillRect(crate.x + 2, crate.y + 15, 3, 2);
            ctx.fillRect(crate.x + 11, crate.y + 15, 3, 2);
          }
        })(),
      );
      w.when(
        (w2) => w2.player.x > px(D - 6) && !s.open,
        (w2) => tara(w2, 'Bora doori ma he! Peti la dhakel! | The sack’s too far off! Push the crate!', 2.6),
      );
    },
  },

  /** All stage long you've been whipping tops up to speed. The door is painted on the crown of the
   *  biggest one, and it's only a door when it isn't a blur: get on, and then leave it alone. */
  lattu: {
    space: 12,
    advice: 'The door is on the crown of the big top, and it’s only a door once the top has slowed right down. Jump on to it once, then stand still on it: every landing whips it back up. Wait for it to slow (it wanders, go with it) and you’re through, before it falls over.',
    build(w, d) {
      const top = w.add(new Top(d.x + 8, FLOOR, { w: 44, h: 30, decay: 0.2, relaunch: 2.5 }));
      const L = lock(w, d, '');
      w.flags.lattu = top;
      w.flags.twist = 'blur';
      w.add(
        new (class extends Entity {
          update(w2: World) {
            d.x = top.x - 8;
            d.y = top.solid.y - 32;
            d.hidden = top.down > 0;
            L.open = top.down === 0 && top.s < 0.42;
            w2.flags.twist = top.down > 0 ? 'fallen' : L.open ? 'slow' : 'blur';
            w2.flags.spin = top.s;
          }
        })(),
      );
      w.when(
        (w2) => w2.player.x > d.x - px(8),
        (w2) => tara(w2, 'Bhaunra dheere hohi tab darwaza! | When the top slows, there’s your door!', 2.6),
      );
    },
  },

  /** A stretch of thorn nobody can walk, and a woman at the door reeling silk. She reels in cocoons.
   *  Be one, and stay one, the whole way across. */
  reel: {
    space: 16,
    advice: 'Nobody walks over that thorn. But the silk reeler by the door winds in any cocoon on her mat: stand still on the mat till you’re wrapped, and then don’t touch a thing while she draws you across. One button and you’re out of the cocoon, in the thorns.',
    build(w, d) {
      const D = Math.round(d.x / 16);
      const k = (w.flags.kosaEnt as Kosa) ?? w.add(new Kosa());
      w.flags.kosaEnt = k;
      const mat = px(D - 13) + 8;
      w.add(new Kaante(px(D - 11), px(D - 2), FLOOR));
      w.flags.reel = { mat, end: px(D - 2) };
      w.flags.twist = 'walking';
      let pulling = false;
      w.add(
        new (class extends Entity {
          layer = 2;
          update(w2: World) {
            const p = w2.player;
            if (w2.state !== 'play') return;
            if (k.wrapped && !pulling && Math.abs(p.cx - mat) < 12) pulling = true;
            if (!k.wrapped) pulling = false;
            if (pulling && p.x < px(D - 2) + 2) p.x += 0.5;
            w2.flags.twist = pulling ? 'reeled' : p.x > px(D - 2) ? 'across' : 'walking';
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            // the mat
            ctx.fillStyle = '#C62828';
            ctx.fillRect(mat - 12, FLOOR - 2, 24, 2);
            ctx.fillStyle = '#FDD835';
            ctx.fillRect(mat - 12, FLOOR - 2, 3, 2);
            ctx.fillRect(mat + 9, FLOOR - 2, 3, 2);
            // the reeler and her wheel, just before the door
            const rx = d.x - 12;
            ctx.fillStyle = '#AD1457';
            ctx.fillRect(rx - 4, FLOOR - 16, 8, 16);
            ctx.fillStyle = '#C68642';
            ctx.fillRect(rx - 3, FLOOR - 22, 6, 6);
            ctx.fillStyle = '#212121';
            ctx.fillRect(rx - 3.5, FLOOR - 24, 7, 3);
            ctx.strokeStyle = '#6D4C41';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(rx - 12, FLOOR - 9, 7, 0, Math.PI * 2);
            ctx.stroke();
            const a = pulling ? w2.tick * 0.2 : 0;
            ctx.beginPath();
            ctx.moveTo(rx - 12 - Math.cos(a) * 7, FLOOR - 9 - Math.sin(a) * 7);
            ctx.lineTo(rx - 12 + Math.cos(a) * 7, FLOOR - 9 + Math.sin(a) * 7);
            ctx.stroke();
            if (pulling) {
              ctx.strokeStyle = '#E8C878';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(rx - 12, FLOOR - 9);
              ctx.lineTo(w2.player.cx, w2.player.cy);
              ctx.stroke();
            }
          }
        })(),
      );
      w.when(
        (w2) => w2.player.x > px(D - 16),
        (w2) => tara(w2, 'Chatai ma kosa ban, o khinch lehi! | Be a cocoon on the mat, she’ll reel you in!', 2.8),
      );
    },
  },

  /** These ants don't come for a man. They come for jaggery. It's up on the shelf you walked under. */
  gud: {
    space: 16,
    advice: 'These ants take no notice of you: they want jaggery. There’s a lump of gud up on the shelf back there. Jump up for it, carry it to the edge, and then it’s the usual: wait for the whole bridge, and run.',
    paint: (g, D) => {
      g.pit(D - 9, D - 3);
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      const ants = w.add(new Chapda(px(D - 9), px(D - 2), FLOOR));
      let has = false;
      ants.lure = () => has;
      const shelf = new Solid(px(D - 14), FLOOR - 48, 32, 4);
      shelf.oneWay = true;
      const gx = px(D - 13),
        gy = FLOOR - 56;
      w.flags.gud = { ants, gx, edge: px(D - 9) };
      w.flags.twist = 'nogud';
      w.add(
        new (class extends Entity {
          solid = shelf;
          layer = 3;
          update(w2: World) {
            const p = w2.player;
            if (!has && Math.abs(p.cx - gx) < 10 && Math.abs(p.cy - gy) < 14) {
              has = true;
              w2.sfx('win', gx, gy);
            }
            w2.flags.twist = has ? 'gud' : 'nogud';
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            ctx.fillStyle = '#6D4C41';
            ctx.fillRect(shelf.x, shelf.y, 32, 4);
            ctx.fillRect(shelf.x + 2, shelf.y + 4, 2, 6);
            ctx.fillRect(shelf.x + 28, shelf.y + 4, 2, 6);
            const lump = (x: number, y: number) => {
              ctx.fillStyle = '#B5651D';
              ctx.beginPath();
              ctx.arc(x, y, 5, Math.PI, 0);
              ctx.fill();
              ctx.fillStyle = '#D98A3A';
              ctx.fillRect(x - 3, y - 4, 3, 1.5);
            };
            if (!has) lump(gx, shelf.y);
            else lump(w2.player.cx, w2.player.y - 2);
          }
        })(),
      );
      w.when(
        (w2) => !has && w2.player.x > px(D - 11),
        (w2) => tara(w2, 'Chanti man la gud chahi! Upar he! | The ants want jaggery! It’s up there!', 2.8),
      );
    },
  },

  /** The door is on the Dussehra chariot, and the whole town is on the ropes: every step you run
   *  towards it, they haul it a step away. They go by the sound of feet. Don't give them any. */
  rath: {
    space: 30,
    after: 6,
    advice: 'The pullers haul the chariot away as fast as you run at it: they go by the sound of your feet on the ground. In the air you make none. Come at it in jumps, one after another, and it stands still for you (it even rolls back a little).',
    build(w, d) {
      const D = Math.round(d.x / 16);
      const home = px(D - 16);
      const rath = new Solid(home, FLOOR - 44, 52, 44);
      rath.collidable = false;
      w.flags.rath = rath;
      w.flags.twist = 'running';
      let rolls = 0;
      w.add(
        new (class extends Entity {
          layer = 1;
          update(w2: World) {
            const p = w2.player;
            if (w2.state !== 'play') return;
            const behind = p.cx < rath.x + 26;
            const feet = p.onGround && Math.abs(p.vx) > 20 && behind && rath.x - p.cx < 260 && p.x > px(D - 30);
            if (feet) {
              rath.x += 170 / 120;
              rolls++;
            } else if (rath.x > home && behind) rath.x = Math.max(home, rath.x - 40 / 120);
            // out through the palace gate and round again
            if (rath.x > px(D + 3)) {
              rath.x = home;
              w2.flags.laps = (w2.flags.laps ?? 0) + 1;
            }
            d.x = rath.x + 30;
            d.y = FLOOR - 32;
            w2.flags.twist = feet ? 'running' : 'quiet';
            void rolls;
          }
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            const x = rath.x,
              y = rath.y;
            // ropes to the pullers ahead
            ctx.strokeStyle = '#A1887F';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(x + 52, FLOOR - 14);
            ctx.lineTo(x + 96, FLOOR - 10);
            ctx.stroke();
            for (let k = 0; k < 4; k++) {
              const px2 = x + 66 + k * 9;
              ctx.fillStyle = ['#FDD835', '#F5F5F5', '#EF6C00', '#F5F5F5'][k];
              ctx.fillRect(px2 - 2, FLOOR - 14, 4, 9);
              ctx.fillStyle = '#C68642';
              ctx.fillRect(px2 - 1.5, FLOOR - 18, 3, 4);
              ctx.fillStyle = '#3E2723';
              ctx.fillRect(px2 - 2, FLOOR - 5, 1.5, 5);
              ctx.fillRect(px2 + 0.5, FLOOR - 5, 1.5, 5);
            }
            // the chariot: two tiers of rough timber, cloth, flowers, four great wheels
            ctx.fillStyle = '#8D5A3B';
            ctx.fillRect(x, y + 12, 52, 22);
            ctx.fillStyle = '#A0693F';
            ctx.fillRect(x + 6, y - 6, 40, 18);
            ctx.fillStyle = '#D84315';
            ctx.fillRect(x + 4, y - 10, 44, 5);
            ctx.fillStyle = '#FDD835';
            for (let k = 0; k < 9; k++) ctx.fillRect(x + 6 + k * 4.6, y - 5, 2.5, 3);
            ctx.fillStyle = '#F5F5F5';
            ctx.beginPath();
            ctx.moveTo(x + 26, y - 26);
            ctx.lineTo(x + 20, y - 10);
            ctx.lineTo(x + 32, y - 10);
            ctx.fill();
            const a = (x / 9) % (Math.PI * 2);
            for (const wx of [x + 9, x + 43]) {
              ctx.fillStyle = '#5D3A22';
              ctx.beginPath();
              ctx.arc(wx, FLOOR - 9, 9, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#C8A27A';
              ctx.lineWidth = 1.2;
              for (let k = 0; k < 3; k++) {
                ctx.beginPath();
                ctx.moveTo(wx - Math.cos(a + k) * 8, FLOOR - 9 - Math.sin(a + k) * 8);
                ctx.lineTo(wx + Math.cos(a + k) * 8, FLOOR - 9 + Math.sin(a + k) * 8);
                ctx.stroke();
              }
            }
            void w2;
          }
        })(),
      );
      w.when(
        (w2) => w2.player.x > px(D - 28),
        (w2) => tara(w2, 'Rath aagu bhaagat he! Pair ke awaaz jhan kar! | The chariot runs ahead! Don’t let them hear your feet!', 3),
      );
    },
  },
};
