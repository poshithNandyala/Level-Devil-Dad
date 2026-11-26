// Hyderabad's door endings.
import type { World } from '../../world';
import { doorPic, FLOOR, hits, lock, Mover, npc, Paint, person, RIVER, tara, text, tt } from '../../levels/endkit';
import { Gust, Thing } from '../../entities/traps';
import { DT, secs, TILE } from '../../constants';
import { px } from '../../levels/kit';
import { pool } from '../../levels/acts';
import { rr } from '../../../render/art/common';
import type { Ending } from '../../levels/endkit';

export type HydEndingKind = 'otp' | 'biryani' | 'gravity' | 'tiny' | 'cannon' | 'backdoor' | 'slowmo';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<HydEndingKind, true> {}
}

export const endings: Record<HydEndingKind, Ending> = {
  // ================================================================ Hyderabad
  /** Smart door, Hi-Tech City style: it wants an OTP. Tara reads it out; type it by bonking the number blocks. */
  otp: {
    space: 14,
    advice: 'The smart door wants the OTP Tara reads out: hop up and bonk the number blocks in that order. A wrong digit sends a new OTP.',
    build(w, d) {
      const L = lock(w, d, 'OTP enter cheyyi! | Enter the OTP!');
      const bx0 = d.x - px(12),
        by = FLOOR - 49,
        BH = 14;
      const OTPS = [
        [4, 7, 2],
        [9, 1, 6],
        [3, 8, 5],
        [6, 0, 7],
      ];
      let which = 0,
        typed: number[] = [],
        wrong = 0,
        lockedUntil = -1,
        prevVy = 0,
        flash = -1,
        flashN = -1;
      for (let i = 0; i < 10; i++) {
        const b = w.add(new Thing('crate', bx0 + i * 16, by, { w: 16, h: BH, layer: 1 }));
        b.visible = false;
      }
      const otpLine = (k: number) => {
        const o = OTPS[k % OTPS.length].join('-');
        return `OTP vachindi, Dad: ${o}! | Your OTP is ${o}!`;
      };
      w.add(
        new Paint((ctx, w2) => {
          for (let i = 0; i < 10; i++) {
            const x = bx0 + i * 16;
            const hot = flashN === i && w2.tick - flash < 12;
            ctx.fillStyle = hot ? '#FFD54F' : '#37474F';
            rr(ctx, x + 0.5, by + (hot ? -2 : 0), 15, BH, 2);
            ctx.fill();
            ctx.strokeStyle = '#90A4AE';
            ctx.lineWidth = 0.8;
            ctx.stroke();
            text(ctx, String(i), x + 8, by + BH / 2 + (hot ? -2 : 0), 8, hot ? '#212121' : '#E0F7FA', '');
          }
          // the door's screen
          ctx.fillStyle = '#0D1B2A';
          rr(ctx, d.x - 10, d.y - 24, 36, 16, 3);
          ctx.fill();
          const s = L.open ? '✓ OK' : w2.tick < lockedUntil ? 'WAIT' : [0, 1, 2].map((i) => (typed[i] !== undefined ? typed[i] : '_')).join(' ');
          text(ctx, s, d.x + 8, d.y - 16, 7, L.open ? '#69F0AE' : '#80DEEA', '');
        }, 1),
      );
      let said = false;
      w.flags.twist = 'locked';
      w.onTick((w2) => {
        const p = w2.player;
        if (!said && p.x > bx0 - px(1.5)) {
          said = true;
          tara(w2, otpLine(which), 4);
        }
        w2.flags.otp = OTPS[which % OTPS.length];
        w2.flags.otpI = typed.length;
        w2.flags.blocks = [bx0, by];
        const bonked = prevVy < -30 && p.vy === 0 && !p.onGround && p.y <= by + BH + 1 && p.y >= by + BH - 3;
        prevVy = p.vy;
        if (L.open || !bonked || w2.tick < lockedUntil) return;
        const i = Math.floor((p.cx - bx0) / 16);
        if (i < 0 || i > 9) return;
        flash = w2.tick;
        flashN = i;
        w2.sfx('beep', bx0 + i * 16 + 8, by);
        const want = OTPS[which % OTPS.length];
        typed.push(i);
        if (typed[typed.length - 1] !== want[typed.length - 1]) {
          typed = [];
          wrong++;
          which++;
          if (wrong >= 3) {
            wrong = 0;
            lockedUntil = w2.tick + secs(2.5);
            npc(w2, 'Too many attempts! Try again later! | Too many attempts!', d.x + 8, d.y - 34, 1.6);
            w2.after(2.5, () => tara(w2, otpLine(which), 4));
          } else {
            npc(w2, 'Invalid OTP! | Invalid OTP!', d.x + 8, d.y - 34, 1.1);
            tara(w2, `Kotha OTP: ${OTPS[which % OTPS.length].join('-')}! | New OTP: ${OTPS[which % OTPS.length].join('-')}!`, 4);
          }
        } else if (typed.length === 3) {
          npc(w2, 'Verified! | Verified!', d.x + 8, d.y - 34, 1.2);
          L.unlock();
        }
      });
    },
  },

  /** Hyderabadi dum biryani right before the door. Its aroma pulls you in from both sides;
   *  one bite and it's biryani coma. Jump it, and keep running. */
  biryani: {
    space: 10,
    advice: 'The biryani’s smell drags you towards the handi from both sides, and one bite is biryani coma: jump over it and keep holding forward.',
    build(w, d) {
      const hx = d.x - px(3.5),
        hw = 28;
      const handi = w.add(new Thing('crate', hx, FLOOR - 18, { solid: false, deadly: 'coma', w: hw, h: 18, layer: 1, inset: 2 }));
      handi.visible = false;
      w.add(new Gust(hx / TILE - 6.5, 12, 6.5, 3, 85));
      w.add(new Gust((hx + hw) / TILE, 12, 2.6, 3, -85));
      w.add(
        new Paint((ctx, w2) => {
          ctx.fillStyle = '#5D4037';
          ctx.fillRect(hx - 2, FLOOR - 6, hw + 4, 6);
          ctx.fillStyle = '#B87333';
          ctx.beginPath();
          ctx.ellipse(hx + hw / 2, FLOOR - 11, hw / 2, 7, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#F5F5F5';
          ctx.fillRect(hx + 3, FLOOR - 19, hw - 6, 3);
          // aroma, curling in from both sides
          ctx.strokeStyle = 'rgba(255,240,200,0.6)';
          ctx.lineWidth = 1;
          for (let i = 0; i < 6; i++) {
            const k = ((w2.tick * 0.8 + i * 30) % 90) / 90;
            const side = i % 2 ? 1 : -1;
            const x = hx + hw / 2 + side * (80 * (1 - k) + 6);
            const y = FLOOR - 24 + Math.sin(k * 9 + i) * 4;
            ctx.globalAlpha = Math.sin(k * Math.PI);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(x - side * 4, y - 4, x - side * 8, y);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
          text(ctx, 'DUM BIRYANI', hx + hw / 2, FLOOR - 30, 4.5, '#FFE0B2');
        }, 1),
      );
      let said = false;
      w.flags.twist = 'smell';
      w.flags.handi = [hx, hx + hw];
      w.onTick((w2) => {
        if (said || w2.player.x < hx - px(6)) return;
        said = true;
        npc(w2, 'Ek plate, miya? Bas ek! | Just one plate, buddy?', hx + hw / 2, FLOOR - 44, 1.8);
      });
    },
  },

  /** A pad on the road flips gravity: the door hangs from the ceiling. Mind the gap up there. */
  gravity: {
    space: 10,
    advice: 'Step on the purple pad and you fall up: the door hangs from the ceiling. Up there, jump the gap in the roof (your jumps go down now).',
    paint: (g, D) => {
      g.fill(D - 7, D + 3, 3, 3, '#');
      g.fill(D - 3, D - 2, 3, 3, '.');
    },
    build(w, d) {
      d.y = 64;
      const draw = d.draw.bind(d);
      d.draw = (ctx, w2) => {
        ctx.save();
        ctx.translate(0, 2 * d.y + 32);
        ctx.scale(1, -1);
        draw(ctx, w2);
        ctx.restore();
      };
      const padX = d.x - px(6);
      w.add(
        new Paint((ctx, w2) => {
          ctx.fillStyle = w2.tick % 40 < 20 ? '#7C4DFF' : '#B388FF';
          rr(ctx, padX, FLOOR - 3, 16, 3, 1);
          ctx.fill();
          text(ctx, '⇅', padX + 8, FLOOR - 10, 9, '#B388FF');
        }, -1),
      );
      let flipped = false;
      w.flags.twist = 'floor';
      w.flags.roofGap = [d.x - px(3), d.x - px(1)];
      w.onTick((w2) => {
        const p = w2.player;
        if (!flipped && p.onGround && p.cx > padX && p.cx < padX + 16) {
          flipped = true;
          p.gsign = -1;
          p.onGround = false;
          p.vy = -60;
          w2.sfx('blink', p.cx, p.y);
          npc(w2, 'Ulta pulta, miya! | Upside down, buddy!', p.cx, p.y - 14, 1.2);
        }
        w2.flags.twist = flipped ? 'flipped' : 'floor';
      });
    },
  },

  /** The door is a mouse hole under the shop wall. Eat the Osmania biscuit on the shelf and Dad shrinks to fit. */
  tiny: {
    space: 10,
    advice: 'You won’t fit under the wall: jump for the Osmania biscuit floating by the shelf, shrink, and walk into the tiny door.',
    paint: (g, D) => {
      g.fill(D - 1, D + 4, 0, 13, '#');
      g.fill(D - 1, D + 4, 14, 14, '.');
      g.put(D, 14, 'E');
    },
    build(w, d) {
      const slab = w.add(new Thing('slab', d.x - px(1), FLOOR - 16, { w: px(6), h: 6, layer: 1 }));
      slab.visible = false;
      const bx = d.x - px(5),
        by = FLOOR - 66;
      let small = false;
      d.exit.zone = () => (small ? { x: d.x + 10, y: FLOOR - 9, w: 6, h: 9 } : null);
      d.draw = (ctx, w2) => {
        ctx.fillStyle = '#4E342E';
        ctx.fillRect(d.x - px(1), FLOOR - 16, px(6), 6);
        ctx.fillStyle = '#1B0F0A';
        ctx.fillRect(d.x - px(1), FLOOR - 10, px(6), 10);
        ctx.save();
        ctx.translate(d.x + 10, FLOOR - 9);
        ctx.scale(0.36, 0.28);
        doorPic(ctx, w2, 0, 0, 1);
        ctx.restore();
      };
      w.add(
        new Paint((ctx, w2) => {
          ctx.fillStyle = '#6D4C41';
          ctx.fillRect(bx - 10, by + 16, 30, 3);
          if (small) return;
          const bob = Math.sin(w2.tick * 0.09) * 2;
          ctx.fillStyle = '#E0B66B';
          ctx.beginPath();
          ctx.arc(bx + 4, by + 6 + bob, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#B8860B';
          for (let i = 0; i < 4; i++) ctx.fillRect(bx + 2 + (i % 2) * 3, by + 4 + (i >> 1) * 3 + bob, 1, 1);
          text(ctx, 'OSMANIA', bx + 4, by - 3 + bob, 4, '#FFF8E1');
        }, 3),
      );
      let said = false;
      w.flags.twist = 'big';
      w.flags.biscuit = [bx, by];
      w.onTick((w2) => {
        const p = w2.player;
        if (!said && p.x + p.w >= d.x - px(1) - 2) {
          said = true;
          tara(w2, 'Too big for that door, Dad! Have a biscuit. | Too big! Have a biscuit.', 2.6);
        }
        if (!small && hits(p, bx - 1, by, 10, 12)) {
          small = true;
          p.resize(6, 8);
          w2.sfx('poof', p.cx, p.y);
          w2.emit('fx', p.cx, p.cy, { kind: 'poof', w: 10, h: 14 });
          npc(w2, 'Chhota Dad! | Tiny Dad!', p.cx, p.y - 12, 1);
        }
        w2.flags.twist = small ? 'small' : 'big';
      });
    },
  },

  /** Golconda: the moat is too wide, but the fort cannon isn't. Get in, and fire when the barrel's at 45°. */
  cannon: {
    space: 13,
    advice: 'Climb into the cannon by the moat; its barrel swings up and down: press jump when it’s halfway up and it fires you over.',
    paint: (g, D) => void g.pit(D - 9, D - 1),
    build(w, d) {
      pool(w, d.x / TILE - 9, d.x / TILE, 15.4, { colors: RIVER });
      const cx = d.x - px(11),
        cy = FLOOR - 10;
      const V = 560,
        lo = 0.26,
        hi = 1.31,
        TP = 2.2;
      const angle = (w2: World) => lo + ((hi - lo) * (1 - Math.cos((tt(w2) / TP) * Math.PI * 2))) / 2;
      let loaded = false,
        fired = false;
      w.add(
        new Paint((ctx, w2) => {
          const a = angle(w2);
          ctx.save();
          ctx.translate(cx + 8, cy);
          ctx.rotate(-a);
          ctx.fillStyle = '#37474F';
          rr(ctx, -4, -5, 26, 10, 3);
          ctx.fill();
          ctx.fillStyle = '#263238';
          ctx.fillRect(18, -6, 4, 12);
          ctx.restore();
          ctx.fillStyle = '#5D4037';
          ctx.beginPath();
          ctx.arc(cx + 8, cy + 4, 6, 0, Math.PI * 2);
          ctx.fill();
          if (loaded && !fired) {
            text(ctx, 'JUMP = FIRE', cx + 8, cy - 30, 5, '#FFE082');
            ctx.strokeStyle = 'rgba(255,224,130,0.5)';
            ctx.setLineDash([2, 3]);
            ctx.beginPath();
            ctx.moveTo(cx + 8, cy);
            ctx.lineTo(cx + 8 + Math.cos(a) * 40, cy - Math.sin(a) * 40);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }, 2),
      );
      w.flags.twist = 'empty';
      w.onTick((w2) => {
        const p = w2.player;
        const a = angle(w2);
        w2.flags.cannonA = a;
        if (!loaded && !fired && hits(p, cx, cy - 10, 16, 20)) {
          loaded = true;
          w2.sfx('thud', cx + 8, cy);
          npc(w2, 'Golconda express! | Golconda express!', cx + 8, cy - 40, 1.2);
        }
        if (loaded && !fired) {
          p.hidden = true;
          p.x = cx + 3;
          p.y = cy - p.h + 4;
          p.vx = 0;
          p.vy = 0;
          p.stun = 2;
          if (w2.input.jumpPressed) {
            fired = true;
            p.hidden = false;
            p.x = Math.round(cx + 8 + Math.cos(a) * 20 - p.w / 2);
            p.y = Math.round(cy - Math.sin(a) * 20 - p.h / 2);
            p.vx = V * Math.cos(a);
            p.vy = -V * Math.sin(a);
            p.launched = true;
            p.onGround = false;
            p.stun = 90;
            w2.sfx('boom', cx + 8, cy);
            w2.emit('shake', cx + 8, cy, { amount: 5 });
            w2.emit('fx', cx + 8 + Math.cos(a) * 24, cy - Math.sin(a) * 24, { kind: 'poof', w: 12, h: 12 });
          }
        }
        if (fired && p.onGround && p.stun > 0 && w2.flags.twist === 'fired') {
          p.stun = 0;
          p.vx *= 0.3;
          w2.flags.twist = 'landed';
        }
        if (!(fired && w2.flags.twist === 'landed')) w2.flags.twist = fired ? 'fired' : loaded ? 'loaded' : 'empty';
      });
    },
  },

  /** Salar Jung's double statue: from this side it's a stone back. The door is on its front: go round
   *  over the top and come at it from the other side. */
  backdoor: {
    space: 10,
    advice: 'This door faces the other way: from the front you only see the statue’s back. Climb over it from the crate, drop down behind, and walk into the door facing it.',
    paint: (g, D) => void g.fill(D - 1, D - 1, 11, 14, '#'),
    build(w, d) {
      w.add(new Thing('crate', d.x - px(2), FLOOR - 16, { layer: 1, tint: '#8D6E63' }));
      const draw = d.draw.bind(d);
      d.draw = (ctx, w2) => {
        ctx.save();
        ctx.translate(2 * d.x + 16, 0);
        ctx.scale(-1, 1);
        draw(ctx, w2);
        ctx.restore();
      };
      w.add(
        new Paint((ctx) => {
          // the cloaked back of the statue over the pillar
          const x = d.x - px(1);
          ctx.fillStyle = '#6D6A75';
          rr(ctx, x - 1, FLOOR - 64, 18, 64, 4);
          ctx.fill();
          ctx.fillStyle = '#57545E';
          for (let i = 0; i < 5; i++) ctx.fillRect(x + 2 + i * 3, FLOOR - 48, 1.2, 46);
          ctx.fillStyle = '#7A7782';
          ctx.beginPath();
          ctx.arc(x + 8, FLOOR - 66, 6, 0, Math.PI * 2);
          ctx.fill();
        }, 1),
      );
      let told = -999;
      d.onReach = (w2) => {
        const p = w2.player;
        if (p.facing < 0) return w2.win('door');
        if (w2.tick - told < 150) return;
        told = w2.tick;
        npc(w2, 'Ulta side, miya! Face the door! | Wrong side, buddy! Face it!', d.x + 8, d.y - 10, 1.2);
      };
      let said = false;
      w.flags.twist = 'back';
      w.flags.crate = d.x - px(2);
      w.onTick((w2) => {
        if (said || w2.player.x + w2.player.w < d.x - px(1) - 2) return;
        said = true;
        tara(w2, 'That’s the statue’s back, Dad. The door faces the other way! | The door faces the other way!', 2.6);
      });
    },
  },

  /** Tollywood climax: the goons pour out of the door. On the ground they're a blur; in the air,
   *  it's slow motion. Keep jumping. */
  slowmo: {
    space: 12,
    advice: 'The goons run out of the door far too fast to dodge on foot, but while you’re in the air everything goes slow motion: keep jumping and land between them.',
    build(w, d) {
      const goons: Mover[] = [];
      let next = 0;
      const slow = (w2: World) => !w2.player.onGround && w2.state === 'play' && w2.player.x > d.x - px(12);
      w.onTick((w2) => {
        const p = w2.player;
        const sm = slow(w2);
        w2.flags.slowmo = sm ? 1 : 0;
        const k = sm ? 0.22 : 1;
        const inArea = p.x > d.x - px(12) && p.x < d.x - 20;
        if (inArea && w2.tick >= next) {
          next = w2.tick + secs(0.8);
          const g = w2.add(
            new Mover(d.x + 18, FLOOR - 14, 12, 14, 'goons', (ctx, m, w3) => {
              const run = Math.sin(w3.tick * 0.5) * 2;
              person(ctx, m.x + 6, m.y + Math.abs(run) * 0.3, 14, '#212121', '#8D5524', { arms: 4 });
              ctx.fillStyle = '#B71C1C';
              ctx.fillRect(m.x + 3, m.y + 2, 6, 1.2);
            }),
          );
          g.vx = -300;
          goons.push(g);
        }
        for (const g of goons) {
          if (!g.alive) continue;
          g.x += g.vx * k * DT;
          if (g.x < d.x - px(14)) g.alive = false;
        }
        w2.flags.goons = goons.filter((g) => g.alive).map((g) => g.x);
      });
      let said = false;
      w.onTick((w2) => {
        if (said || w2.player.x < d.x - px(12)) return;
        said = true;
        tara(w2, 'Climax fight, Dad! Jump and the world goes slow-mo! | Jump: the world goes slow motion!', 2.6);
      });
      w.flags.twist = 'fight';
    },
  },
};
