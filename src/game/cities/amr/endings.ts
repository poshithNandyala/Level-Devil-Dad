// Amaravati's door endings.
import type { World } from '../../world';
import { FLOOR, hits, lock, Mover, npc, Paint, person, tara, text, tt } from '../../levels/endkit';
import { Thing } from '../../entities/traps';
import { secs } from '../../constants';
import { px } from '../../levels/kit';
import { rr } from '../../../render/art/common';
import type { Ending } from '../../levels/endkit';

export type AmrEndingKind = 'key' | 'speed' | 'dejavu' | 'whirlwind';

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
};
