// Panaji's door endings.
import { Entity, type World } from '../../world';
import { Solid } from '../../body';
import { DT, secs } from '../../constants';
import { px } from '../../levels/kit';
import { pool } from '../../levels/acts';
import { FLOOR, lock, npc, Paint, RIVER, tara, text } from '../../levels/endkit';
import { aunty, poderArt } from '../../levels/westkit';
import { Football, footballer, goalArt, palmArt } from './entities';
import type { Ending } from '../../levels/endkit';

/** time within a repeating cycle */
export const cyc = (w: World, period: number, phase = 0) => ((((w.tick * DT - phase) % period) + period) % period);

export type PnjEndingKind = 'poder' | 'penalty' | 'clockhand' | 'hammock' | 'gangway' | 'sandcastle' | 'decree';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<PnjEndingKind, true> {}
}

export const endings: Record<PnjEndingKind, Ending> = {
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
};
