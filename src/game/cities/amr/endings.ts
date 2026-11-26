// Amaravati's door endings.
import { pool } from '../../levels/acts';
import type { World } from '../../world';
import { FLOOR, hits, lock, Mover, npc, Paint, person, tara, text, tt, RIVER } from '../../levels/endkit';
import { Thing } from '../../entities/traps';
import { secs, TILE } from '../../constants';
import { px } from '../../levels/kit';
import { rr } from '../../../render/art/common';
import type { Ending } from '../../levels/endkit';

export type AmrEndingKind = 'key' | 'speed' | 'dejavu' | 'whirlwind' | 'swing' | 'mirchi' | 'monkey';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<AmrEndingKind, true> {}
}

export const endings: Record<AmrEndingKind, Ending> = {
  // ================================================================ Amaravati
  /** Locked. The key hangs high over the road behind you: get up on the sack to reach it. */
  key: {
    space: 10,
    advice: 'The door is locked and the key hangs high behind you: hop on the chilli sack and jump straight up for it.',
    build(w, d) {
      const L = lock(w, d, 'Taalam veshanu! | It’s locked!');
      const cx = d.x - px(8);
      w.add(new Thing('crate', cx, FLOOR - 16, { layer: 1, tint: '#C62828', w: 32 }));
      const kx = cx + 4,
        ky = FLOOR - 92;
      let got = false;
      w.add(
        new Paint((ctx, w2) => {
          ctx.strokeStyle = 'rgba(60,40,30,0.7)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(kx + 6, 0);
          ctx.lineTo(kx + 6, ky + (got ? -40 : 0));
          ctx.stroke();
          if (got) return;
          const bob = Math.sin(w2.tick * 0.07) * 1.5;
          ctx.strokeStyle = '#FFC107';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(kx + 6, ky + 4 + bob, 3.2, 0, Math.PI * 2);
          ctx.moveTo(kx + 6, ky + 7 + bob);
          ctx.lineTo(kx + 6, ky + 14 + bob);
          ctx.lineTo(kx + 9, ky + 14 + bob);
          ctx.moveTo(kx + 6, ky + 11 + bob);
          ctx.lineTo(kx + 9, ky + 11 + bob);
          ctx.stroke();
        }, 3),
      );
      w.flags.twist = 'locked';
      w.flags.crateX = cx;
      let said = false;
      w.onTick((w2) => {
        const p = w2.player;
        if (!said && p.x + p.w > d.x - 4) {
          said = true;
          tara(w2, 'Key paina undi, Dad! Behind you! | The key is up there, behind you!', 2.4);
        }
        if (got || !hits(p, kx, ky, 12, 16)) return;
        got = true;
        w2.sfx('collect', kx, ky);
        npc(w2, 'Taalam chevi! | Got the key!', kx + 6, ky - 6, 1);
        L.unlock();
      });
    },
  },

  /** Section speed check: the cop times you between the two white lines. Faster than 20 on average
   *  and it's a challan and back you go. Stop and dawdle in between: it's the average that counts. */
  speed: {
    space: 12,
    advice: 'SPEED LIMIT 20 is checked over the whole stretch between the white lines: cross it too fast and it’s a fine and back you go. Stop for a moment in the middle.',
    build(w, d) {
      const z0 = d.x - px(8),
        z1 = d.x - px(2);
      const copX = d.x - px(1);
      const KMH = 0.33;
      let t0 = -1,
        shown = '-- km/h',
        bad = false,
        said = false;
      w.add(
        new Paint((ctx, w2) => {
          // the sign and the two white lines
          ctx.fillStyle = '#9E9E9E';
          ctx.fillRect(z0 - 12, FLOOR - 34, 2, 34);
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(z0 - 11, FLOOR - 38, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#D32F2F';
          ctx.lineWidth = 2;
          ctx.stroke();
          text(ctx, '20', z0 - 11, FLOOR - 38, 7, '#212121', '');
          text(ctx, 'SECTION CHECK', z0 - 11, FLOOR - 52, 4, '#FFFFFF');
          ctx.fillStyle = 'rgba(255,255,255,0.85)';
          ctx.fillRect(z0, FLOOR - 1, 2, 1.5);
          ctx.fillRect(z1, FLOOR - 1, 2, 1.5);
          ctx.fillStyle = 'rgba(255,255,255,0.25)';
          for (let x = z0 + 6; x < z1; x += 8) ctx.fillRect(x, FLOOR - 1, 4, 1);
          // the cop and his read-out
          person(ctx, copX + 8, FLOOR - 18, 18, '#D7CCC8', '#8D5524', { cap: '#5D4037' });
          ctx.fillStyle = '#111';
          rr(ctx, copX - 16, FLOOR - 40, 32, 12, 2);
          ctx.fill();
          const live = t0 >= 0 ? `${(tt(w2) - t0).toFixed(1)} s` : shown;
          text(ctx, live, copX, FLOOR - 34, 5.5, bad && t0 < 0 ? '#FF5252' : '#69F0AE', '');
        }, 1),
      );
      w.flags.twist = 'clear';
      w.flags.zone = [z0, z1];
      let prev = 0;
      w.onTick((w2) => {
        const p = w2.player;
        const front = p.x + p.w;
        if (!said && front > z0 - px(2)) {
          said = true;
          tara(w2, 'Section speed check, Dad! Under 20 between the lines! | Average under 20 between the lines!', 2.8);
        }
        if (t0 < 0 && prev < z0 && front >= z0) {
          t0 = tt(w2);
          w2.sfx('beep', z0, FLOOR - 20);
        }
        if (t0 >= 0 && front < z0 - 2) t0 = -1;
        if (t0 >= 0 && prev < z1 && front >= z1) {
          const kmh = Math.round(((z1 - z0) / Math.max(0.01, tt(w2) - t0)) * KMH);
          shown = `${kmh} km/h`;
          t0 = -1;
          bad = kmh > 20;
          if (bad && w2.state === 'play') {
            w2.sfx('whistle', copX, FLOOR - 20);
            npc(w2, `${kmh} km/h! Challan! Venakki vellandi! | ${kmh} km/h! Fine! Go back!`, copX, FLOOR - 50, 1.6);
            w2.warp(z0 - px(3), FLOOR - p.h, 'blink');
            p.stun = 30;
          } else {
            npc(w2, `${kmh} km/h. Nemmadiga, manchi! | ${kmh} km/h. Nice and slow!`, copX, FLOOR - 50, 1.4);
            w2.flags.twist = 'passed';
          }
        }
        prev = p.x + p.w;
        if (w2.flags.twist !== 'passed') w2.flags.twist = t0 >= 0 ? 'timing' : 'clear';
        w2.flags.zoneT = t0 >= 0 ? tt(w2) - t0 : -1;
      });
    },
  },

  /** Borra caves echo time: the first time you touch the door, you're back where you were 2.5 s ago. */
  dejavu: {
    advice: 'The first time you touch the door, time echoes you back a few seconds: do it all again, the pit included. The second time is real.',
    paint: (g, D) => void g.pit(D - 6, D - 5),
    build(w, d) {
      const rec: [number, number, number][] = [];
      let once = false;
      w.flags.twist = 'first';
      w.flags.pit = [d.x - px(6), d.x - px(4)];
      // (only on the last stretch: the echo never throws you back into the cave before it)
      w.onTick((w2) => {
        const p = w2.player;
        if (p.x < d.x - px(8.5) || !p.onGround) return;
        rec.push([p.x, p.y, p.facing]);
        if (rec.length > 420) rec.shift();
      });
      d.onReach = (w2) => {
        if (once) return w2.win('door');
        once = true;
        const back = rec[Math.max(0, rec.length - secs(2.5))] ?? [d.x - px(8), FLOOR - w2.player.h, 1];
        w2.sfx('rewind', d.x, d.y);
        w2.flags.rewind = w2.tick;
        w2.warp(back[0], back[1], 'blink');
        w2.player.facing = back[2] as 1 | -1;
        npc(w2, 'Déjà vu? | Déjà vu?', w2.player.cx, w2.player.y - 14, 1.2);
        w2.flags.twist = 'again';
      };
    },
  },

  /** The cyclone has the door: it spins round in a dust devil. Step into the whirlwind and ride it up,
   *  between the flying tin sheets. */
  whirlwind: {
    space: 10,
    advice: 'The door spins high up in the dust devil: walk into the whirlwind and ride it up. Slip past the tin sheets while they’re out at the sides.',
    build(w, d) {
      const c0 = d.x - px(5),
        cw = px(4),
        cx = c0 + cw / 2,
        top = 76;
      const DP = 1.3;
      const sheets = [0, Math.PI].map((ph) => {
        const m = w.add(
          new Mover(cx, 150, 14, 6, 'hit', (ctx, mv, w2) => {
            ctx.save();
            ctx.translate(mv.x + 7, mv.y + 3);
            ctx.rotate(w2.tick * 0.3 + ph);
            ctx.fillStyle = '#90A4AE';
            ctx.fillRect(-7, -2, 14, 4);
            ctx.fillStyle = '#B0BEC5';
            ctx.fillRect(-7, -2, 14, 1);
            ctx.restore();
          }),
        );
        return { m, ph };
      });
      const doorAt = (w2: World) => {
        const a = (tt(w2) / 2.4) * Math.PI * 2;
        return { x: cx - 8 + Math.cos(a) * 18, y: 66 + Math.sin(a) * 6 };
      };
      d.follow = () => doorAt(w);
      w.add(
        new Paint((ctx, w2) => {
          for (let i = 0; i < 14; i++) {
            const y = FLOOR - i * 13;
            if (y < top - 10) break;
            const r = 10 + i * 1.6;
            const a = w2.tick * 0.2 + i;
            ctx.strokeStyle = `rgba(215,190,150,${0.35 - i * 0.012})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(cx + Math.sin(a * 0.3) * 3, y, r, 3, 0, a % (Math.PI * 2), (a % (Math.PI * 2)) + 4);
            ctx.stroke();
          }
        }, -3),
      );
      w.flags.twist = 'spin';
      w.flags.column = [c0, c0 + cw];
      w.onTick((w2) => {
        const t = tt(w2);
        for (const s of sheets) {
          const a = (t / DP) * Math.PI * 2 + s.ph;
          s.m.x = cx - 7 + Math.cos(a) * 26;
          s.m.y = 148 + Math.sin(a) * 5;
          s.m.vx = 0;
        }
        w2.flags.sheetCos = Math.cos((t / DP) * Math.PI * 2);
        const p = w2.player;
        const inside = p.x + p.w > c0 && p.x < c0 + cw && p.y > top - 4;
        if (inside && w2.state === 'play') {
          if (p.onGround) {
            p.onGround = false;
            p.vy = -120;
          }
          p.vy = Math.max(p.vy - 30, -165);
          p.launched = true;
          w2.flags.twist = 'up';
        }
      });
    },
  },
  /** The bridge is gone: swing across on a jhoola. Jump off at the far end, because on the way back the rope snaps. */
  swing: {
    space: 15,
    advice: 'Ride the jhoola over the river: board it at its near end, and jump off the moment it reaches the far bank. Stay for the swing back and the rope snaps.',
    paint: (g, D) => void g.pit(D - 12, D - 1),
    build(w, d) {
      pool(w, d.x / TILE - 12, d.x / TILE, 15.4, { colors: RIVER });
      const pvx = d.x - px(6.5),
        pvy = 82,
        Lr = 150,
        A = 0.55,
        T = 2.8;
      const ang = (w2: World) => A * Math.sin((tt(w2) * Math.PI * 2) / T);
      const seat = w.add(new Thing('plank', pvx - 16, pvy + Lr - 3, { w: 32, h: 5, oneWay: true, layer: 1 }));
      seat.visible = false;
      let rode = -1,
        snapped = false;
      w.add(
        new Paint((ctx, w2) => {
          // the branch, the ropes and the seat
          ctx.fillStyle = '#5D4037';
          ctx.fillRect(pvx - 40, pvy - 5, 80, 6);
          ctx.fillStyle = '#2E7D32';
          ctx.beginPath();
          ctx.ellipse(pvx, pvy - 14, 60, 16, 0, 0, Math.PI * 2);
          ctx.fill();
          if (snapped) return;
          const s = seat.solid;
          ctx.strokeStyle = '#D7CCC8';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pvx - 6, pvy);
          ctx.lineTo(s.x + 2, s.y);
          ctx.moveTo(pvx + 6, pvy);
          ctx.lineTo(s.x + 30, s.y);
          ctx.stroke();
          ctx.fillStyle = '#A1887F';
          ctx.fillRect(s.x, s.y, 32, 4);
          ctx.fillStyle = '#E91E63';
          for (let i = 0; i < 5; i++) ctx.fillRect(s.x + 3 + i * 6, s.y + 1, 2, 2);
          void w2;
        }, 1),
      );
      w.flags.twist = 'swing';
      w.onTick((w2) => {
        if (!snapped) {
          const a = ang(w2);
          const cx = pvx + Lr * Math.sin(a),
            cy = pvy + Lr * Math.cos(a);
          seat.solid.velX = ((Lr * Math.cos(a) * A * Math.PI * 2) / T) * Math.cos((tt(w2) * Math.PI * 2) / T);
          seat.place(w2, cx - 16, cy - 3);
        }
        const on = w2.standing(seat.solid);
        if (on && rode < 0) {
          rode = w2.tick;
          w2.sfx('creak', pvx, pvy);
        }
        if (!snapped && rode >= 0 && w2.tick - rode > secs(1.75)) {
          snapped = true;
          seat.fall(w2, { land: false, g: 2000 });
          w2.sfx('snap', pvx, pvy);
          npc(w2, 'Taadu tegindi! | The rope snapped!', pvx, pvy + 20, 1.2);
        }
        if (rode >= 0 && !on && w2.player.onGround) rode = -2;
        w2.flags.seat = [seat.solid.x, seat.solid.y];
        w2.flags.swingA = snapped ? 0 : ang(w2) / A;
        w2.flags.swingV = Math.cos((tt(w2) * Math.PI * 2) / T);
        w2.flags.twist = snapped ? 'snapped' : on ? 'riding' : 'swing';
      });
    },
  },

  /** Guntur mirchi bajji: one bite and Dad runs like fire. The bridge falls a moment after you step on it:
   *  only a mirchi run gets across. */
  mirchi: {
    space: 17,
    advice: 'The old bridge falls a moment after you step on it: eat the mirchi bajji on the cart first, and run over while you’re on fire.',
    paint: (g, D) => void g.pit(D - 12, D - 1),
    build(w, d) {
      const b0 = d.x - px(12);
      const planks = Array.from({ length: 12 }, (_, i) => w.add(new Thing('plank', b0 + i * 16, FLOOR, { w: 16, h: 6, layer: 1 })));
      const cartX = d.x - px(15);
      let eaten = -1,
        falling = false;
      w.add(
        new Paint((ctx, w2) => {
          ctx.fillStyle = '#795548';
          ctx.fillRect(cartX - 6, FLOOR - 14, 28, 6);
          ctx.fillStyle = '#3E2723';
          ctx.beginPath();
          ctx.arc(cartX - 2, FLOOR - 4, 4, 0, Math.PI * 2);
          ctx.arc(cartX + 18, FLOOR - 4, 4, 0, Math.PI * 2);
          ctx.fill();
          text(ctx, 'MIRCHI BAJJI', cartX + 8, FLOOR - 24, 4.5, '#FFE082');
          if (eaten < 0) {
            ctx.fillStyle = '#E65100';
            rr(ctx, cartX + 4, FLOOR - 18, 9, 4, 2);
            ctx.fill();
            ctx.fillStyle = '#2E7D32';
            ctx.fillRect(cartX + 12, FLOOR - 18, 2, 2);
          }
          // Dad on fire
          const p = w2.player;
          if (eaten >= 0 && w2.player.speedMul > 1 && !p.dead) {
            for (let i = 0; i < 4; i++) {
              const ph = (w2.tick * 0.2 + i * 1.7) % 4;
              ctx.fillStyle = i % 2 ? 'rgba(255,87,34,0.8)' : 'rgba(255,193,7,0.8)';
              ctx.beginPath();
              ctx.arc(p.cx - p.facing * (4 + ph * 2), p.y + 4 + i * 2.5, 2.4 - ph * 0.4, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }, 3),
      );
      w.flags.twist = 'cold';
      w.onTick((w2) => {
        const p = w2.player;
        if (eaten < 0 && hits(p, cartX + 2, FLOOR - 22, 14, 22)) {
          eaten = w2.tick;
          p.speedMul = 2.3;
          w2.sfx('sneeze', p.cx, p.y);
          npc(w2, 'KAARAM! | SPICY!', p.cx, p.y - 14, 1);
          tara(w2, 'Now run, Dad! Before the fire goes out! | Run, before the fire goes out!', 2);
        }
        if (eaten >= 0 && p.speedMul > 1 && w2.tick - eaten > secs(2.2)) {
          p.speedMul = 1;
          w2.flags.twist = 'cooled';
        }
        if (!falling && planks.some((k) => w2.standing(k.solid))) {
          falling = true;
          planks.forEach((k, i) => k.fall(w2, { delay: 0.55 + i * 0.015, land: false }));
          w2.sfx('creak', b0 + 96, FLOOR);
          if (p.speedMul === 1) npc(w2, 'Cheap contractor! | Cheap contractor!', b0 + 60, FLOOR - 24, 1.2);
        }
        if (eaten >= 0 && w2.flags.twist !== 'cooled') w2.flags.twist = 'fire';
      });
    },
  },

  /** A langur snatches Dad's specs and runs. Everything goes blurry, the door with it: chase him down. */
  monkey: {
    space: 14,
    advice: 'The monkey grabs your specs and the world goes blurry: chase him back and forth over the drain until he gives up, then the door is back.',
    paint: (g, D) => void g.pit(D - 9, D - 8),
    build(w, d) {
      const perch = [d.x - px(13), d.x - px(5), d.x - px(11.5), d.x - px(4)];
      let state: 'door' | 'hop' | 'sit' | 'done' = 'door',
        n = 0,
        t0 = 0,
        from = { x: d.x + 4, y: d.y - 10 },
        to = { x: d.x + 4, y: d.y - 10 },
        mx = d.x + 4,
        my = d.y - 10;
      w.add(
        new Paint((ctx, w2) => {
          if (state === 'done' && n > 3) return;
          const x = mx,
            y = my;
          ctx.fillStyle = '#9E9E9E';
          rr(ctx, x - 5, y + 3, 10, 9, 3);
          ctx.fill();
          ctx.fillStyle = '#212121';
          ctx.beginPath();
          ctx.arc(x, y + 2, 3.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#9E9E9E';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(x + 4, y + 10);
          ctx.quadraticCurveTo(x + 12, y + 8 + Math.sin(w2.tick * 0.2) * 3, x + 10, y - 2);
          ctx.stroke();
          if (state !== 'door' && state !== 'done') {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 0.8;
            ctx.strokeRect(x - 5, y + 0.5, 3.5, 2.5);
            ctx.strokeRect(x + 1.5, y + 0.5, 3.5, 2.5);
          }
        }, 4),
      );
      const hop = (w2: World, tx: number) => {
        state = 'hop';
        t0 = w2.tick;
        from = { x: mx, y: my };
        to = { x: tx, y: FLOOR - 12 };
        w2.sfx('monkey', mx, my);
      };
      w.flags.twist = 'door';
      w.onTick((w2) => {
        const p = w2.player;
        if (state === 'door' && p.x > d.x - px(6) && p.onGround) {
          w2.flags.blur = 1;
          d.hidden = true;
          npc(w2, 'Kothi! Naa kalladdalu! | Monkey! My specs!', p.cx, p.y - 14, 1.4);
          tara(w2, 'Specs lekunda door kanapadadu! Chase him! | Can’t see the door without specs! Chase him!', 2.6);
          hop(w2, perch[0]);
        } else if (state === 'hop') {
          const k = Math.min(1, (w2.tick - t0) / secs(0.75));
          mx = from.x + (to.x - from.x) * k;
          my = from.y + (to.y - from.y) * k - Math.sin(Math.PI * k) * 46;
          if (k >= 1) state = 'sit';
        } else if (state === 'sit' && Math.abs(p.cx - mx) < px(2.2) && Math.abs(p.y - my) < 24) {
          n++;
          if (n >= perch.length) {
            state = 'done';
            w2.flags.blur = 0;
            d.hidden = false;
            w2.sfx('collect', p.cx, p.y);
            npc(w2, 'Alasipoyindi! Teesko! | It’s tired! Take them!', mx, my - 10, 1.4);
            n = 99;
          } else hop(w2, perch[n]);
        }
        w2.flags.twist = state;
        w2.flags.monkeyX = mx;
        w2.flags.pit = [d.x - px(9), d.x - px(7)];
      });
    },
  },
};
