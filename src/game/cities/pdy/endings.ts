// Puducherry's door endings.
import { Door } from '../../entities/basics';
import type { World } from '../../world';
import { FLOOR, lock, npc, Paint, tara, hits, Mover, person, text, tt } from '../../levels/endkit';
import { Thing } from '../../entities/traps';
import { secs, DT } from '../../constants';
import { px } from '../../levels/kit';
import type { Ending } from '../../levels/endkit';
import { boulePile, nightLeaf } from './encores';

export type PdyEndingKind = 'pdy-bells' | 'pdy-fakewin' | 'pdy-shuffle' | 'pdy-mirror' | 'pdy-mime' | 'pdy-lamp' | 'pdy-boule-pile' | 'pdy-night-leaf';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<PdyEndingKind, true> {}
}

export const endings: Record<PdyEndingKind, Ending> = {
  /** PDY-09: the lobs that fell pile into the steps up to the terrace door */
  'pdy-boule-pile': boulePile,
  /** PDY-10: the big leaf before the door sleeps shut in the dark: cross it then */
  'pdy-night-leaf': nightLeaf,
  /** The church bells: jump exactly on three chimes in a row and the church door opens. */
  'pdy-bells': {
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
  'pdy-fakewin': {
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
  // ================================================================ Puducherry
  /** Three blue doors of the French quarter. The real one glows, then they shuffle like a shell game.
   *  Pick wrong and you're bounced out, and they shuffle again. Jump over the wrong ones. */
  'pdy-shuffle': {
    space: 12,
    advice: 'Watch the glowing door while the three shuffle, then go to it. Jump over the others: walk into a wrong one and it bounces you out.',
    build(w, d) {
      const xs = [d.x - px(6), d.x - px(3), d.x];
      const doors = [d, w.add(new Door(0, 14)), w.add(new Door(0, 14))];
      const slot = [2, 0, 1];
      doors.forEach((o, i) => (o.x = xs[slot[i]]));
      let state: 'idle' | 'show' | 'shuffle' | 'pick' = 'idle',
        t0 = 0,
        round = 0;
      const ROUNDS: [number, number][][] = [
        [[1, 2], [0, 1], [0, 2], [1, 2], [0, 1], [0, 2]],
        [[0, 2], [1, 2], [0, 1], [1, 2], [0, 2], [0, 1], [1, 2]],
        [[0, 1], [1, 2], [0, 2], [0, 1], [1, 2], [0, 2], [0, 1], [1, 2]],
      ];
      const SW = 38;
      // the real one glows gold while you watch
      w.add(
        new Paint((ctx, w2) => {
          if (state !== 'show') return;
          const k = 0.5 + Math.sin(w2.tick * 0.3) * 0.5;
          ctx.fillStyle = `rgba(255,215,64,${0.25 + k * 0.35})`;
          ctx.beginPath();
          ctx.ellipse(d.x + 8, d.y + 16, 16, 22, 0, 0, Math.PI * 2);
          ctx.fill();
          text(ctx, '★', d.x + 8, d.y - 10, 9, '#FFD740');
        }, -3),
      );
      const bounce = (w2: World) => {
        if (state !== 'pick') return;
        const p = w2.player;
        p.vx = -230;
        p.stun = 18;
        w2.sfx('shove', p.cx, p.y);
        npc(w2, 'Non non non! Mauvaise porte! | No no no! Wrong door!', p.cx, p.y - 14, 1.3);
        state = 'show';
        t0 = w2.tick;
        round++;
      };
      doors.forEach((o) => (o.onReach = o === d ? (w2) => (state === 'pick' ? w2.win('door') : undefined) : bounce));
      w.flags.twist = 'idle';
      w.onTick((w2) => {
        const p = w2.player;
        if (state === 'idle' && p.x > d.x - px(11)) {
          state = 'show';
          t0 = w2.tick;
          tara(w2, 'Bonjour! Watch the golden door, Dad... | Watch the golden door, Dad...', 2.2);
        } else if (state === 'show' && w2.tick - t0 > secs(1.1)) {
          state = 'shuffle';
          t0 = w2.tick;
        } else if (state === 'shuffle') {
          const seq = ROUNDS[round % ROUNDS.length];
          const k = w2.tick - t0;
          const i = Math.floor(k / SW);
          if (i >= seq.length) {
            state = 'pick';
            doors.forEach((o, j) => {
              o.x = xs[slot[j]];
              o.y = d.y;
            });
          } else {
            const [a, b] = seq[i];
            const f = (k % SW) / SW;
            if (k % SW === 0) w2.sfx('slide', xs[1] + 8, d.y);
            doors.forEach((o, j) => {
              const s = slot[j];
              if (s === a || s === b) {
                const to = s === a ? b : a;
                const e = f * f * (3 - 2 * f);
                o.x = xs[s] + (xs[to] - xs[s]) * e;
                o.y = 208 - Math.sin(Math.PI * f) * (s === a ? 26 : 9);
                if (k % SW === SW - 1) slot[j] = to;
              } else {
                o.x = xs[s];
                o.y = 208;
              }
            });
          }
        }
        w2.flags.twist = state;
        w2.flags.realX = d.x;
        w2.flags.fakeXs = doors.slice(1).map((o) => o.x);
      });
    },
  },

  /** Miroir: near the door the whole picture turns into its mirror image. Your buttons don't. */
  'pdy-mirror': {
    space: 11,
    advice: 'Near the door the screen turns into its mirror image, but right is still right: trust your thumbs, not your eyes, and jump both spike rows.',
    build(w, d) {
      // (round 2: the first row moved a tile out, 7 -> 8 tiles before the door, so the landing between the rows
      // is 3 tiles, not 2: a person's jump a little late or early still comes down between them)
      for (const k of [8, 3]) w.add(new Thing('spikerow', d.x - px(k), FLOOR - 10, { solid: false, deadly: 'spikes', layer: -1, w: 32 }));
      w.flags.twist = 'mirror';
      w.flags.spikes = [d.x - px(8), d.x - px(3)];
      let said = false;
      w.onTick((w2) => {
        const on = w2.player.x > d.x - px(10) && w2.state === 'play';
        if (on && !said) {
          said = true;
          w2.sfx('blink', w2.player.cx, w2.player.y);
          tara(w2, 'Miroir! Right is still right, Dad! | Mirror! Right is still right, Dad!', 2.4);
        }
        w2.flags.view = on ? 'mirror' : 0;
      });
    },
  },

  /** A street mime stands in front of the door and copies you, mirror-wise. Whatever you do, he does.
   *  Except that he's stuck in his invisible box, so he can't jump high. */
  'pdy-mime': {
    space: 10,
    advice: 'The mime mirrors you and pushes you back if you touch him, but his invisible box stops his jumps: jump high and long, and go over him.',
    build(w, d) {
      const cl = d.x - px(5);
      let mx = d.x - 12,
        my = 0,
        vy = 0,
        told = -999;
      const mime = w.add(
        new Mover(mx - 6, FLOOR - 16, 12, 16, 'none', (ctx, m, w2) => {
          const x = m.x + 6,
            y = m.y;
          // the box he's stuck in
          ctx.strokeStyle = 'rgba(255,255,255,0.18)';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(x - 9, FLOOR - 40, 18, 40);
          person(ctx, x, y, 16, '#212121', '#FAFAFA', { face: '#FAFAFA', arms: Math.abs(Math.sin(w2.tick * 0.12)) * 5 + 2 });
          ctx.fillStyle = '#FFFFFF';
          for (let i = 0; i < 3; i++) ctx.fillRect(x - 4, y + 6 + i * 2, 8, 1);
          ctx.fillStyle = '#D32F2F';
          ctx.fillRect(x - 1, y + 4, 2, 1);
        }),
      );
      mime.hazard.active = false;
      w.flags.twist = 'mime';
      w.onTick((w2) => {
        const p = w2.player;
        mx = Math.max(cl, Math.min(d.x - 12, 2 * cl - p.cx));
        if (w2.tick - p.jumpTick === 1 && Math.abs(p.cx - mx) < 96 && my === 0) vy = -260;
        vy += 1500 * DT;
        my = Math.min(0, Math.max(-22, my + vy * DT));
        if (my === -22 && vy < 0) vy = 0;
        if (my === 0 && vy > 0) vy = 0;
        mime.x = mx - 6;
        mime.y = FLOOR - 16 + my;
        if (hits(p, mime.x + 1, mime.y + 1, 10, 15) && w2.state === 'play') {
          p.vx = p.cx < mx ? -220 : 220;
          if (p.vy < 0) p.vy = 0;
          p.stun = 16;
          if (w2.tick - told > 90) {
            told = w2.tick;
            w2.sfx('shove', p.cx, p.y);
            npc(w2, 'Non non non! | No no no!', mx, FLOOR - 40, 1);
          }
        }
        w2.flags.mimeX = mx;
        w2.flags.line = cl;
      });
      let said = false;
      w.onTick((w2) => {
        if (said || w2.player.x < d.x - px(10)) return;
        said = true;
        tara(w2, 'A mime! He copies you, Dad... but look at his box. | He copies you... but look at his box.', 2.8);
      });
    },
  },
  /** At six the street lamp comes on, and the door only exists in its light. In the dark the paving
   *  in front of it bristles with spikes. */
  'pdy-lamp': {
    advice: 'The door is only there while the lamp is lit, and in the dark spikes come up in front of it: wait outside the light, then dash in the moment it comes on.',
    build(w, d) {
      const P = 2.5,
        ON = 0.95;
      const lit = (w2: World) => tt(w2) % P < ON;
      const sx = d.x - px(3);
      const sp = w.add(new Thing('spikerow', sx, FLOOR + 1, { solid: false, deadly: 'spikes', layer: -4, w: 48 }));
      w.add(
        new Paint((ctx, w2) => {
          ctx.fillStyle = '#263238';
          ctx.fillRect(d.x + 20, d.y - 40, 3, 72);
          ctx.fillRect(d.x + 8, d.y - 40, 15, 3);
          const on = lit(w2);
          const flick = on && tt(w2) % P > ON - 0.28 && w2.tick % 8 < 4;
          ctx.fillStyle = on && !flick ? '#FFF59D' : '#546E7A';
          ctx.fillRect(d.x + 6, d.y - 37, 7, 4);
          if (!on || flick) return;
          const g = ctx.createRadialGradient(d.x + 9, d.y - 30, 0, d.x + 6, d.y + 12, 58);
          g.addColorStop(0, 'rgba(255,236,160,0.7)');
          g.addColorStop(1, 'rgba(255,236,160,0)');
          ctx.fillStyle = g;
          ctx.fillRect(d.x - 52, d.y - 40, 110, 76);
        }, -3),
      );
      let was = true,
        said = false;
      w.onTick((w2) => {
        const on = lit(w2);
        d.hidden = !on;
        if (on !== was) {
          sp.moveTo(w2, sx, on ? FLOOR + 1 : FLOOR - 10, 0.06, 'out');
          if (!on) w2.sfx('spikes', sx + 24, FLOOR);
          was = on;
        }
        if (!said && w2.player.x > d.x - px(8)) {
          said = true;
          tara(w2, 'Six o’clock! The door only lives in the lamplight! | The door only lives in the lamplight!', 2.6);
        }
        w2.flags.twist = on ? 'lit' : 'dark';
        w2.flags.litFor = on ? tt(w2) % P : -1;
      });
    },
  },
};
