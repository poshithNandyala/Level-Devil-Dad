// Puducherry's door endings.
import { FLOOR, lock, npc, Paint, tara } from '../../levels/endkit';
import { Thing } from '../../entities/traps';
import { secs } from '../../constants';
import { px } from '../../levels/kit';
import type { Ending } from '../../levels/endkit';

export type PdyEndingKind = 'bells' | 'fakewin';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<PdyEndingKind, true> {}
}

export const endings: Record<PdyEndingKind, Ending> = {
  /** The church bells: jump exactly on three chimes in a row and the church door opens. */
  bells: {
    space: 10,
    advice: 'The church door opens for those who keep time: jump exactly on the bell, three chimes in a row. Off the beat and you start again.',
    build(w, d) {
      const L = lock(w, d, 'Attendez la cloche! | Wait for the bell!');
      const BEAT = 96,
        WIN = 14;
      let streak = 0,
        lastBeat = -1,
        jumpedOn = -1;
      const bx = d.x + 8,
        by = d.y - 30;
      w.add(
        new Paint((ctx, w2) => {
          const ph = (w2.tick % BEAT) / BEAT;
          const swing = Math.sin(ph * Math.PI * 2) * 0.35;
          ctx.fillStyle = '#ECEFF1';
          ctx.fillRect(bx - 12, by - 14, 24, 3);
          ctx.save();
          ctx.translate(bx, by - 11);
          ctx.rotate(swing);
          ctx.fillStyle = '#C9A227';
          ctx.beginPath();
          ctx.moveTo(-6, 10);
          ctx.quadraticCurveTo(-6, 0, 0, 0);
          ctx.quadraticCurveTo(6, 0, 6, 10);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          // the ring that closes on the bell at each chime
          if (!L.open) {
            const k = 1 - ph;
            ctx.strokeStyle = `rgba(255,255,255,${0.25 + (1 - k) * 0.6})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(bx, by - 4, 6 + k * 22, 0, Math.PI * 2);
            ctx.stroke();
            for (let i = 0; i < 3; i++) {
              ctx.fillStyle = i < streak ? '#FFD740' : 'rgba(255,255,255,0.3)';
              ctx.beginPath();
              ctx.arc(bx - 8 + i * 8, by + 8, 2.2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }, -1),
      );
      let said = false;
      w.flags.twist = 'locked';
      w.onTick((w2) => {
        const p = w2.player;
        const inYard = p.x > d.x - px(8);
        if (inYard && !said) {
          said = true;
          tara(w2, 'Jump on the DONG, Dad. Three in a row! | Jump on each chime. Three in a row!', 3);
        }
        const beat = Math.round(w2.tick / BEAT);
        if (w2.tick % BEAT === 0) w2.sfx('dong', bx, by);
        if (L.open) return;
        // a fresh jump: on the beat or not?
        if (w2.tick - p.jumpTick === 1 && inYard) {
          const off = Math.abs(p.jumpTick - beat * BEAT);
          if (off <= WIN && beat !== jumpedOn) {
            jumpedOn = beat;
            streak++;
            w2.sfx('clap', p.cx, p.y);
            if (streak >= 3) {
              npc(w2, 'Magnifique! | Magnificent!', bx, by - 20, 1.4);
              L.unlock();
            }
          } else {
            if (streak > 0) npc(w2, 'Hors rythme! | Off the beat!', bx, by - 20, 1);
            streak = 0;
          }
        }
        // a chime went by without a jump on it
        if (streak > 0 && w2.tick % BEAT === WIN + 1 && jumpedOn !== Math.floor(w2.tick / BEAT)) {
          streak = 0;
          npc(w2, 'Hors rythme! | Off the beat!', bx, by - 20, 1);
        }
        void lastBeat;
        w2.flags.twist = L.open ? 'open' : 'locked';
        w2.flags.streak = streak;
      });
    },
  },

  /** Fireworks, ESCAPED!... and then the sky falls exactly where the party is. */
  fakewin: {
    space: 11,
    advice: 'The first door is a fake finish: when ESCAPED! goes up, get away from that door at once, something falls on it. The real door comes after.',
    build(w, d) {
      const realX = d.x;
      const fx = d.x - px(5);
      d.x = fx;
      let t0 = -1;
      w.flags.twist = 'fake';
      w.flags.fakeX = fx;
      const shell = w.add(new Thing('boulder', fx - 8, -60, { w: 32, h: 24, layer: 3 }));
      shell.visible = false;
      shell.solid.collidable = false;
      d.onReach = (w2) => {
        if (t0 >= 0) return;
        t0 = w2.tick;
        w2.flags.twist = 'party';
        const p = w2.player;
        p.vx = 0;
        p.stun = secs(0.55);
        w2.sfx('win', d.x, d.y);
        w2.emit('fx', d.x + 8, d.y, { kind: 'confetti' });
        w2.flags.banner = { text: 'ESCAPED!', sub: '★ ★ ★', t0: w2.tick, dur: 0.75, style: 'win' };
        d.hidden = true;
        w2.after(0.55, () => {
          w2.flags.twist = 'run';
          w2.flags.banner = { text: 'JUST KIDDING!', sub: '', t0: w2.tick, dur: 0.9, style: 'troll' };
          w2.sfx('laugh', fx, d.y);
          shell.visible = true;
          shell.solid.collidable = true;
          shell.setDeadly('crushed');
          shell.fall(w2, { g: 3000, then: (w3) => (shell.setDeadly(false), (w3.flags.twist = 'landed')) });
        });
        w2.after(1.25, () => {
          d.x = realX;
          d.hidden = false;
          d.onReach = null;
          w2.flags.twist = 'real';
          tara(w2, 'Ha! Ippo dhaan nijama! | NOW it’s real!', 2);
        });
      };
      // the shadow of what's coming
      w.add(
        new Paint((ctx, w2) => {
          if (w2.flags.twist !== 'run') return;
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.beginPath();
          ctx.ellipse(fx + 8, FLOOR - 0.5, 18, 2.4, 0, 0, Math.PI * 2);
          ctx.fill();
        }, -1),
      );
    },
  },
};
