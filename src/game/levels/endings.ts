// Endings: the last surprise at each stage's door. Every stage has its own and no two share one:
// these 39, plus the nine old twists in twists.ts (each of those is used by exactly one stage too).
// An ending can carve its own ground (paint), ask for more road before the door (space), and keeps
// w.flags.twist up to date with what it's doing, which the test policies read.
import { Entity, type Hazard, type World } from '../world';
import { FLOOR, tt, npc, tara, hits, LAGOON, RIVER, Paint, Mover, text, person, doorPic } from './endkit';
import { Door } from '../entities/basics';
import { Gust, Thing } from '../entities/traps';
import { DT, secs, TILE } from '../constants';
import { px, shot } from './kit';
import { pool } from './acts';
import type { Grid } from './grid';
import { FONT, rr } from '../../render/art/common';
import { drawDoor } from '../../render/art/tiles';
import { THEMES } from '../../render/theme';

export type { Ending } from './endkit';
import type { Ending } from './endkit';
import { NEW_ENDINGS, type NewEndingKind } from './endings2';
import { WEST_ENDINGS, type WestEndingKind } from './endings3';

export type EndingKind =
  | 'loading'
  | 'shuffle' | 'mirror' | 'lamp' | 'mime'
  | 'invisible'
  | 'swing' | 'mirchi' | 'monkey'
  | NewEndingKind
  | WestEndingKind
  // each city module's own endings (declared in its endings.ts, see docs/CITY-MODULE.md)
  | keyof ModuleEndingKinds;

/** filled in by city modules: `declare module` this to add an ending kind */
export interface ModuleEndingKinds {}

const OLD_ENDINGS: Record<Exclude<EndingKind, NewEndingKind | WestEndingKind | keyof ModuleEndingKinds>, Ending> = {

  // ================================================================ Kavaratti
  /** Island internet: the bridge to the door is a progress bar. It loads slower than you walk,
   *  sticks at 99%, and then the connection drops. */
  loading: {
    space: 12,
    advice: 'The bridge is still loading: walk behind the bar, never past its end, and jump the last bit at 99% before the connection drops.',
    paint: (g, D) => void g.pit(D - 7, D - 1),
    build(w, d) {
      const x0 = d.x - px(7),
        full = px(7),
        stop = full - 22;
      pool(w, x0 / TILE, d.x / TILE, 15.35, { colors: LAGOON });
      const bar = w.add(new Thing('plank', x0, FLOOR, { w: 1, h: 6, layer: 1 }));
      bar.visible = false;
      bar.solid.collidable = false;
      let L = 0,
        state: 'idle' | 'loading' | 'stalled' | 'lost' = 'idle',
        t0 = 0,
        rest = 0;
      w.add(
        new Paint((ctx, w2) => {
          // the empty frame across the gap, the loaded part, and the percentage
          ctx.strokeStyle = 'rgba(255,255,255,0.45)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 2]);
          ctx.strokeRect(x0 + 0.5, FLOOR + 0.5, full - 1, 5);
          ctx.setLineDash([]);
          if (L >= 1) {
            const g = ctx.createLinearGradient(x0, 0, x0 + L, 0);
            g.addColorStop(0, '#2E7D32');
            g.addColorStop(1, state === 'lost' ? '#E53935' : '#76FF03');
            ctx.fillStyle = g;
            ctx.fillRect(x0, FLOOR, L, 6);
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            for (let i = (w2.tick * 0.6) % 10; i < L; i += 10) ctx.fillRect(x0 + i, FLOOR + 1, 3, 1);
          }
          if (state !== 'idle') {
            const pct = state === 'stalled' ? 99 : Math.min(99, Math.floor((L / stop) * 99));
            const tag = state === 'lost' ? 'NO SIGNAL' : `${pct}%`;
            text(ctx, tag, x0 + Math.max(L, 12), FLOOR - 9, 7, state === 'lost' ? '#FF8A80' : '#E8F5E9');
            // a signal icon that never fills
            const sx = x0 + full / 2,
              sy = FLOOR - 40;
            for (let i = 0; i < 4; i++) {
              ctx.fillStyle = i < (state === 'lost' ? 0 : 1 + ((w2.tick >> 5) % 2)) ? '#FFFFFF' : 'rgba(255,255,255,0.25)';
              ctx.fillRect(sx - 8 + i * 4, sy - i * 3, 3, 3 + i * 3);
            }
            text(ctx, state === 'lost' ? '✕' : '2G', sx + 12, sy - 4, 6, '#FFFFFF');
          }
        }, 1),
      );
      w.flags.twist = 'idle';
      w.flags.barTip = x0;
      w.onTick((w2) => {
        const p = w2.player;
        if (state === 'idle') {
          if (rest > 0) rest--;
          else if (p.onGround && p.x + p.w > x0 - px(2.5) && p.x < x0) {
            state = 'loading';
            t0 = w2.tick;
            tara(w2, 'Island net, Dad. The bridge is still loading! | Island internet. The bridge is still loading!', 2.6);
          }
        } else if (state === 'loading') {
          L = Math.min(stop, L + 40 * DT);
          if (L >= stop) {
            state = 'stalled';
            t0 = w2.tick;
            npc(w2, '99%... 99%... 99%...', x0 + L, FLOOR - 22, 1.4);
          }
        } else if (state === 'stalled') {
          if (w2.tick - t0 > secs(1.5)) {
            state = 'lost';
            w2.sfx('crack', x0 + L, FLOOR);
            npc(w2, 'Connection lost! | Connection lost!', x0 + L, FLOOR - 22, 1.2);
          }
        } else {
          L = Math.max(0, L - 150 * DT);
          if (L <= 0) {
            state = 'idle';
            rest = 80;
          }
        }
        bar.solid.w = Math.max(1, Math.round(L));
        bar.solid.collidable = L >= 1;
        w2.flags.twist = state;
        w2.flags.barTip = x0 + L;
      });
    },
  },









  // ================================================================ Puducherry
  /** Three blue doors of the French quarter. The real one glows, then they shuffle like a shell game.
   *  Pick wrong and you're bounced out, and they shuffle again. Jump over the wrong ones. */
  shuffle: {
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
  mirror: {
    space: 11,
    advice: 'Near the door the screen turns into its mirror image, but right is still right: trust your thumbs, not your eyes, and jump both spike rows.',
    build(w, d) {
      for (const k of [7, 3]) w.add(new Thing('spikerow', d.x - px(k), FLOOR - 10, { solid: false, deadly: 'spikes', layer: -1, w: 32 }));
      w.flags.twist = 'mirror';
      w.flags.spikes = [d.x - px(7), d.x - px(3)];
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

  /** At six the street lamp comes on, and the door only exists in its light. In the dark the paving
   *  in front of it bristles with spikes. */
  lamp: {
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


  /** A street mime stands in front of the door and copies you, mirror-wise. Whatever you do, he does.
   *  Except that he's stuck in his invisible box, so he can't jump high. */
  mime: {
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





  /** After the power cut the door is invisible. Three doormats: the friendly ones are bait. */
  invisible: {
    space: 11,
    advice: 'The door is invisible. Don’t trust the friendly doormats, flower pots drop on them: jump those and stop at the rude one.',
    build(w, d) {
      d.draw = () => undefined;
      const mats: [number, string, boolean][] = [
        [d.x - px(8) - 6, 'WELCOME', false],
        [d.x - px(4) - 6, 'SWAGATHA', false],
        [d.x - 6, 'GO AWAY', true],
      ];
      w.flags.mats = mats.filter((m) => !m[2]).map((m) => m[0]);
      for (const [mx, label, real] of mats) {
        w.add(
          new Paint((ctx) => {
            ctx.fillStyle = real ? '#455A64' : '#8D6E63';
            rr(ctx, mx, FLOOR - 3, 28, 3, 1);
            ctx.fill();
            text(ctx, label, mx + 14, FLOOR - 7, 4.5, real ? '#CFD8DC' : '#FFE0B2');
            if (!real) {
              // the balcony above, with a pot on it
              ctx.fillStyle = '#5D4037';
              ctx.fillRect(mx - 4, FLOOR - 66, 36, 3);
            }
          }, -1),
        );
        if (real) continue;
        const pot = w.add(new Thing('flowers', mx - 2, FLOOR - 82, { solid: false, layer: 3 }));
        let used = false;
        w.onTick((w2) => {
          const p = w2.player;
          if (used || !(p.onGround && p.cx > mx && p.cx < mx + 28)) return;
          used = true;
          pot.setDeadly('hit');
          pot.fall(w2, { g: 3400, land: false });
          npc(w2, 'Swagatha! Hahaha! | Welcome! Hahaha!', mx + 14, FLOOR - 90, 1);
        });
      }
      let said = false;
      w.onTick((w2) => {
        if (said || w2.player.x < d.x - px(10)) return;
        said = true;
        tara(w2, 'Power’s back... but the door isn’t? Read the mats, Dad. | Read the mats, Dad.', 2.8);
      });
      w.flags.twist = 'invisible';
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

/** every door ending; city modules' endings are added by src/game/cities/install.ts */
export const ENDINGS = { ...OLD_ENDINGS, ...NEW_ENDINGS, ...WEST_ENDINGS } as Record<EndingKind, Ending>;

export const isEnding = (k: string | undefined): k is EndingKind => !!k && k in ENDINGS;
