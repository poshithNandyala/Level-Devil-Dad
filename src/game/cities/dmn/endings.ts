// Daman's door endings.
import { Entity, type World } from '../../world';
import type { Climbable } from '../../player';
import { Solid } from '../../body';
import { DT, secs } from '../../constants';
import { px } from '../../levels/kit';
import { pool } from '../../levels/acts';
import { FLOOR, lock, npc, person, RIVER, tara, text } from '../../levels/endkit';
import type { Ending } from '../../levels/endkit';

export type DmnEndingKind = 'customs' | 'coldstore' | 'flag' | 'drawbridge' | 'slidedoor' | 'paintwall' | 'tipjetty';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<DmnEndingKind, true> {}
}

export const endings: Record<DmnEndingKind, Ending> = {
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
};
