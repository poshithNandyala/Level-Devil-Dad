// Chennai's door endings.
import type { World } from '../../world';
import { FLOOR, lock, Mover, npc, Paint, person, tara, text, tt } from '../../levels/endkit';
import { Thing } from '../../entities/traps';
import { DT, secs } from '../../constants';
import { px } from '../../levels/kit';
import { rr } from '../../../render/art/common';
import { Solid } from '../../body';
import type { Ending } from '../../levels/endkit';

export type ChnEndingKind = 'chn-token' | 'chn-bull' | 'chn-catch' | 'chn-rangoli' | 'chn-tips' | 'chn-fresh-curtain' | 'chn-wet-floor-sign';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<ChnEndingKind, true> {}
}

export const endings: Record<ChnEndingKind, Ending> = {
  // ================================================================ Chennai
  /** Token system: press the machine's button when NOW SERVING shows 7. Thala for a reason. */
  'chn-token': {
    space: 10,
    advice: 'The door works on tokens: walk into the token machine’s button exactly when the board shows 7. Any other number and they send you to the back.',
    build(w, d) {
      const L = lock(w, d, 'Token irukka? | Got a token?');
      const mx = d.x - px(4);
      const m = w.add(new Thing('crate', mx, FLOOR - 16, { w: 14, h: 16, layer: 1 }));
      m.visible = false;
      const NUM = 41;
      const now = (w2: World) => 1 + (Math.floor(w2.tick / NUM) % 9);
      let prev = false,
        cool = 0,
        got = 0;
      w.add(
        new Paint((ctx, w2) => {
          // the machine
          ctx.fillStyle = '#B0BEC5';
          rr(ctx, mx, FLOOR - 16, 14, 16, 2);
          ctx.fill();
          ctx.fillStyle = '#37474F';
          ctx.fillRect(mx + 3, FLOOR - 13, 8, 3);
          ctx.fillStyle = cool > 0 ? '#FFEB3B' : '#E53935';
          ctx.beginPath();
          ctx.arc(mx + 1.5, FLOOR - 6, 2, 0, Math.PI * 2);
          ctx.arc(mx + 12.5, FLOOR - 6, 2, 0, Math.PI * 2);
          ctx.fill();
          // NOW SERVING over the door
          const n = now(w2);
          ctx.fillStyle = '#111';
          rr(ctx, d.x - 14, d.y - 26, 44, 20, 3);
          ctx.fill();
          text(ctx, 'NOW SERVING', d.x + 8, d.y - 21, 4, '#B0BEC5', '');
          text(ctx, L.open ? '7 ✓' : String(n), d.x + 8, d.y - 12, 9, n === 7 || L.open ? '#FFD54F' : '#FF5252', '');
          if (got && !L.open) text(ctx, `you: ${got}`, mx + 7, FLOOR - 24, 5, '#FFFFFF');
        }, 2),
      );
      w.flags.twist = 'wait';
      w.onTick((w2) => {
        w2.flags.tokenN = now(w2);
        w2.flags.tokenT = w2.tick % NUM;
        if (L.open) return;
        if (cool > 0) cool--;
        const p = w2.player;
        const touch = p.y + p.h > FLOOR - 16 && ((p.x + p.w >= mx - 1 && p.x + p.w <= mx + 1 && p.inputDir > 0) || (p.x >= mx + 13 && p.x <= mx + 15 && p.inputDir < 0));
        if (touch && !prev && cool === 0) {
          const n = now(w2);
          got = n;
          w2.sfx('beep', mx + 7, FLOOR - 16);
          if (n === 7) {
            npc(w2, 'Token 7! Thala for a reason! | Token 7! Thala for a reason!', d.x + 8, d.y - 34, 1.6);
            w2.emit('fx', mx + 7, FLOOR - 20, { kind: 'confetti' });
            L.unlock();
          } else {
            npc(w2, `Token ${n}? Line-la nillunga! | Token ${n}? Back of the queue!`, mx + 7, FLOOR - 26, 1.2);
            cool = 40;
            p.vx = p.cx < mx + 7 ? -190 : 190;
            p.stun = 14;
            w2.sfx('shove', p.cx, p.y);
          }
        }
        prev = touch;
      });
    },
  },

  /** Jallikattu: a brick wall stands before the door, too high to jump. The bull is behind you.
   *  Let it charge, leap it at the last moment, and it smashes the wall for you. */
  'chn-bull': {
    space: 14,
    advice: 'The wall is too high to climb, but the bull isn’t picky: let it charge at you, jump straight up as it arrives, and it smashes the wall. Then mind it on the way back.',
    build(w, d) {
      const wallX = d.x - px(2),
        penX = d.x - px(14);
      const wall = w.add(new Thing('pillar', wallX, FLOOR - 64, { w: 16, h: 64, layer: 1 }));
      wall.visible = false;
      let up = true;
      w.add(
        new Paint((ctx) => {
          if (!up) return;
          for (let r = 0; r < 8; r++)
            for (let c = 0; c < 2; c++) {
              ctx.fillStyle = (r + c) % 2 ? '#B5533C' : '#A0452F';
              ctx.fillRect(wallX + c * 8 - (r % 2) * 4 + (r % 2 && c === 0 ? 4 : 0), FLOOR - 64 + r * 8, r % 2 && c === 0 ? 4 : 8, 7);
            }
          ctx.fillStyle = 'rgba(255,255,255,0.12)';
          ctx.fillRect(wallX, FLOOR - 64, 16, 2);
        }, 1),
        );
      // the pen gate behind you
      w.add(
        new Paint((ctx, w2) => {
          ctx.fillStyle = '#5D4037';
          ctx.fillRect(penX + 20, FLOOR - 30, 3, 30);
          const open = state !== 'pen' ? 1 : 0;
          ctx.save();
          ctx.translate(penX + 21, FLOOR - 26);
          ctx.rotate(-open * 1.3);
          for (let i = 0; i < 3; i++) ctx.fillRect(0, i * 8, 18, 2.5);
          ctx.restore();
          void w2;
        }, -2),
      );
      let state: 'pen' | 'snort' | 'charge' | 'dazed' | 'back' | 'gone' = 'pen',
        t0 = 0;
      const bull = w.add(
        new Mover(penX - 8, FLOOR - 20, 28, 20, 'gored', (ctx, m, w2) => {
          if (state === 'gone') return;
          const f = m.vx < 0 ? -1 : 1;
          ctx.save();
          ctx.translate(m.x + 14, m.y);
          ctx.scale(f, 1);
          const bob = state === 'charge' || state === 'back' ? Math.sin(w2.tick * 0.9) * 1 : 0;
          ctx.fillStyle = '#5D4037';
          rr(ctx, -12, 5 + bob, 22, 11, 4);
          ctx.fill();
          ctx.fillStyle = '#3E2723';
          ctx.fillRect(-11, 14, 3, 6);
          ctx.fillRect(5, 14, 3, 6);
          ctx.fillStyle = '#4E342E';
          rr(ctx, 7, 3 + bob, 9, 9, 3);
          ctx.fill();
          ctx.strokeStyle = '#EFEBE9';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(10, 4 + bob);
          ctx.quadraticCurveTo(13, -2 + bob, 17, -1 + bob);
          ctx.stroke();
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(13, 6 + bob, 1.5, 1.5);
          // a garland, it's festival time
          ctx.fillStyle = '#FFB300';
          for (let i = 0; i < 4; i++) ctx.fillRect(6 + i * 1.6, 11 + bob + (i % 2), 1.4, 1.4);
          if (state === 'dazed') {
            ctx.fillStyle = '#FFEB3B';
            for (let i = 0; i < 3; i++) {
              const a = w2.tick * 0.15 + (i * Math.PI * 2) / 3;
              ctx.fillRect(10 + Math.cos(a) * 6, -4 + Math.sin(a) * 2, 2, 2);
            }
          }
          ctx.restore();
        }),
      );
      bull.on = false;
      w.flags.twist = 'pen';
      w.onTick((w2) => {
        const p = w2.player;
        if (state === 'pen' && p.x > d.x - px(9)) {
          state = 'snort';
          t0 = w2.tick;
          w2.sfx('snort', penX, FLOOR - 20);
          tara(w2, 'Jallikattu! Maadu varudhu, Dad! | Jallikattu! The bull is coming, Dad!', 2.2);
        } else if (state === 'snort' && w2.tick - t0 > secs(0.7)) {
          state = 'charge';
          bull.on = true;
          bull.vx = 230;
        } else if (state === 'charge') {
          bull.x += bull.vx * DT;
          if (up && bull.x + bull.w >= wallX) {
            bull.x = wallX - bull.w;
            up = false;
            wall.hide();
            state = 'dazed';
            t0 = w2.tick;
            bull.vx = 0;
            w2.sfx('crack', wallX + 8, FLOOR - 32);
            w2.emit('shake', wallX + 8, FLOOR - 30, { amount: 5 });
            w2.emit('fx', wallX + 8, FLOOR - 32, { kind: 'crumble', w: 16 });
            npc(w2, 'Dhamaal! | Smash!', wallX + 8, FLOOR - 70, 1.1);
          }
        } else if (state === 'dazed' && w2.tick - t0 > secs(1.8)) {
          state = 'back';
          bull.vx = -230;
          w2.sfx('snort', bull.x, FLOOR - 20);
        } else if (state === 'back') {
          bull.x += bull.vx * DT;
          if (bull.x < penX - px(3)) {
            state = 'gone';
            bull.on = false;
          }
        }
        w2.flags.twist = state;
        w2.flags.bullX = bull.x;
        w2.flags.bullW = bull.w;
      });
    },
  },

  /** Gully cricket: the batsman skies it. Catch it (be under it when it comes down) and he's out. */
  'chn-catch': {
    space: 12,
    advice: 'The batsman won’t leave the doorway till he’s out: run under the ball (watch its shadow) and catch it. Drop it and he hits another.',
    build(w, d) {
      const L = lock(w, d, 'Batting-la irukken! | I’m still batting!');
      const bx = d.x + 20;
      const spots = [d.x - px(9) + 8, d.x - px(3.5) + 8, d.x - px(11) + 8];
      let state: 'wait' | 'flying' | 'dropped' | 'out' = 'wait',
        n = 0,
        t0 = 0,
        bxNow = 0,
        byNow = 0;
      const T = 1.75;
      const pos = (k: number) => {
        const sx = bx - 2,
          sy = FLOOR - 16,
          ex = spots[n % 3],
          ey = FLOOR - 4;
        return { x: sx + (ex - sx) * k, y: sy + (ey - sy) * k - 190 * 4 * k * (1 - k) };
      };
      w.add(
        new Paint((ctx, w2) => {
          // the batsman by the door, with the stumps
          if (state !== 'out') {
            person(ctx, bx + 4, FLOOR - 16, 16, '#F5F5F5', '#8D5524', { cap: '#1565C0' });
            ctx.strokeStyle = '#D7B377';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(bx - 1, FLOOR - 8);
            ctx.lineTo(bx - 7, FLOOR - 16 - (state === 'flying' && tt(w2) - t0 < 0.15 ? 6 : 0));
            ctx.stroke();
          }
          ctx.fillStyle = '#EFEBE9';
          for (let i = 0; i < 3; i++) ctx.fillRect(bx + 14 + i * 2.5, FLOOR - 12, 1.4, 12);
          if (state === 'flying') {
            const k = Math.min(1, (tt(w2) - t0) / T);
            const sp = spots[n % 3];
            ctx.fillStyle = `rgba(0,0,0,${0.12 + k * 0.3})`;
            ctx.beginPath();
            ctx.ellipse(sp, FLOOR - 0.5, 3 + k * 5, 1.4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#C62828';
            ctx.beginPath();
            ctx.arc(bxNow, byNow, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.arc(bxNow, byNow, 2, 0.3, 2.6);
            ctx.stroke();
          }
        }, 3),
      );
      w.flags.twist = 'wait';
      const hit = (w2: World) => {
        state = 'flying';
        t0 = tt(w2);
        w2.sfx('crack', bx, FLOOR - 12);
        npc(w2, n === 0 ? 'SIXER! | SIX!' : 'Innoru! | Another one!', bx, FLOOR - 30, 1);
      };
      w.onTick((w2) => {
        const p = w2.player;
        if (state === 'wait' && p.x > d.x - px(8)) {
          hit(w2);
          tara(w2, 'Pudi, Dad! Catch pudi! | Catch it, Dad!', 2);
        } else if (state === 'flying') {
          const k = (tt(w2) - t0) / T;
          const b = pos(Math.min(1, k));
          bxNow = b.x;
          byNow = b.y;
          if (k > 0.5 && b.x > p.x - 3 && b.x < p.x + p.w + 3 && b.y > p.y - 4 && b.y < p.y + p.h) {
            state = 'out';
            w2.sfx('clap', p.cx, p.y);
            npc(w2, 'HOWZAT! Out! | HOWZAT! He’s out!', p.cx, p.y - 12, 1.6);
            L.unlock();
          } else if (k >= 1) {
            state = 'dropped';
            t0 = tt(w2);
            w2.sfx('thud', b.x, FLOOR);
            npc(w2, 'Catch vittutiye! | Dropped it!', b.x, FLOOR - 20, 1);
          }
        } else if (state === 'dropped' && tt(w2) - t0 > 1.0) {
          n++;
          hit(w2);
        }
        w2.flags.twist = state === 'out' ? 'open' : state;
        w2.flags.ballX = spots[n % 3];
      });
    },
  },

  /** A fresh kolam in front of the door. Step on it and Paati sends you back: jump straight into the door. */
  'chn-rangoli': {
    advice: 'Never step on the kolam in front of the door: Paati sends you back. Jump from before it straight into the door.',
    build(w, d) {
      const x0 = d.x - 60,
        x1 = d.x - 2;
      w.add(
        new Paint((ctx, w2) => {
          const cols = ['#E91E63', '#FFC107', '#00BCD4', '#8BC34A', '#FFFFFF'];
          const cx = (x0 + x1) / 2;
          for (let i = 0; i < 5; i++) {
            ctx.fillStyle = cols[(i + Math.floor(w2.tick / 40)) % 5];
            ctx.beginPath();
            ctx.ellipse(cx, FLOOR - 0.6, (x1 - x0) / 2 - i * 5, 2.2 - i * 0.2, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = '#FFFFFF';
          for (let i = 0; i < 9; i++) ctx.fillRect(x0 + 4 + i * 6, FLOOR - 1.2, 1.2, 1.2);
        }, -1),
      );
      w.flags.twist = 'kolam';
      w.onTick((w2) => {
        const p = w2.player;
        if (!(p.onGround && p.cx > x0 + 2 && p.cx < x1) || w2.state !== 'play') return;
        npc(w2, 'Kolam mela kaal vekkaadhe! | Don’t step on my kolam!', d.x - 30, d.y - 12, 1.4);
        w2.sfx('whistle', p.cx, p.y);
        w2.warp(d.x - px(9), FLOOR - p.h, 'blink');
      });
    },
  },

  /** CHN-09's door: pale strands hang in the doorway. Soft dough parts for you; stop in front of it to let it fry and the
   *  burner under the doorway lights where you stand, and the fried curtain is a wall. Walk straight through while pale. */
  'chn-fresh-curtain': {
    space: 10,
    advice: 'Pale strands hang in the doorway: soft dough, they part for you. Walk straight through. Stop in front of them and the cook lights the burner under your feet to fry them, and the fried curtain is a wall.',
    build(w, d) {
      const cx = d.x - px(3);
      const wall = new Solid(cx - 4, FLOOR - 40, 10, 40);
      wall.collidable = false;
      w.solids.push(wall);
      let state: 'pale' | 'lit' | 'fried' = 'pale';
      let t0 = 0;
      let stood = 0;
      const flame = { x: cx - px(2.6), w: px(2.2) };
      const burner = { active: false, cause: 'burnt', hits: (x: number, y: number, ww: number, h: number) => burner.active && x < flame.x + flame.w && x + ww > flame.x && y + h > FLOOR - 12 };
      w.hazards.push(burner);
      w.flags.twist = 'pale';
      w.add(
        new Paint((ctx, w2) => {
          // the rail and the strands
          ctx.fillStyle = '#5D4037';
          ctx.fillRect(cx - 12, FLOOR - 46, 24, 3);
          for (let i = 0; i < 4; i++) {
            const sx = cx - 6 + i * 4;
            const sway = state === 'pale' ? Math.sin(w2.tick * 0.08 + i) * 1.5 : 0;
            ctx.strokeStyle = state === 'fried' ? '#C8862A' : state === 'lit' ? '#E8C890' : '#F1DEB0';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(sx, FLOOR - 43);
            for (let y = FLOOR - 43; y < FLOOR - 2; y += 5) ctx.lineTo(sx + Math.sin(y * 0.5 + i) * 2 + sway, y);
            ctx.stroke();
          }
          if (state === 'lit') {
            // the burner: blue then yellow flame under the doorway's threshold
            for (let i = 0; i < 6; i++) {
              const fx = flame.x + 3 + i * 5;
              const fh = 6 + ((w2.tick * 2 + i * 7) % 8);
              ctx.fillStyle = i % 2 ? '#FFB300' : '#42A5F5';
              ctx.fillRect(fx, FLOOR - fh, 3, fh);
            }
          }
          ctx.fillStyle = '#37474F';
          ctx.fillRect(flame.x, FLOOR - 2, flame.w, 2);
        }, 2),
      );
      w.onTick((w2) => {
        const p = w2.player;
        // whoever stops in front of the curtain lights the burner
        const near = p.onGround && p.cx > flame.x - 2 && p.cx < cx - 2 && Math.abs(p.vx) < 30;
        stood = near ? stood + 1 : 0;
        if (state === 'pale' && stood >= 14) {
          state = 'lit';
          t0 = w2.tick;
          burner.active = true;
          w2.sfx('whistle', cx, FLOOR - 20);
          npc(w2, 'Adhu fry aagattum! | Let it fry!', cx, FLOOR - 56, 1.2);
        } else if (state === 'lit' && w2.tick - t0 > secs(0.9)) {
          state = 'fried';
          burner.active = false;
          wall.collidable = true;
          w2.sfx('snap', cx, FLOOR - 20);
          w2.after(2.5, () => {
            // the fried curtain goes to the rack and a fresh one is hung
            wall.collidable = false;
            state = 'pale';
            stood = 0;
            w2.sfx('slide', cx, FLOOR - 40);
          });
        }
        w2.flags.twist = state;
      });
    },
  },

  /** CHN-10's door: a PLAIN door (round 2). The mopped-floor rule (slide, the door shut for wet feet, the sign on the
   *  dry mat) was the same thought as TVM-10's shipped door `tvm-oily-feet-coir-mat` and was taken out; the two recasts
   *  gated in EXTEND-2.md failed too (one re-asked kaanal's shine read, one was the wait-for-the-cycle class). The
   *  WET FLOOR board and the mat stay as dressing: the floor is dry, the door opens, nothing here kills. Key kept. */
  'chn-wet-floor-sign': {
    space: 9,
    advice: 'The glass door at the end of the floor. The WET FLOOR board is only a board today: walk in.',
    build(w, d) {
      const sx = d.x - px(4.5);
      w.flags.twist = 'plain';
      w.add(
        new Paint((ctx) => {
          // the sign: a yellow A-board beside the mat
          ctx.fillStyle = '#FDD835';
          ctx.beginPath();
          ctx.moveTo(sx, FLOOR - 26);
          ctx.lineTo(sx - 8, FLOOR);
          ctx.lineTo(sx + 8, FLOOR);
          ctx.fill();
          text(ctx, 'WET', sx, FLOOR - 12, 5, '#212121', '');
          text(ctx, 'FLOOR', sx, FLOOR - 5, 4, '#212121', '');
          ctx.fillStyle = '#6D4C41';
          ctx.fillRect(d.x - px(3), FLOOR - 2, px(2), 2);
        }, 2),
      );
    },
  },

  /** The door creaks... and topples flat towards you. Stop short, let it fall, walk in. */
  'chn-tips': {
    advice: 'When the door creaks, stop and back off: it falls flat towards you. Then walk in over it.',
    build(w, d) {
      let state: 'up' | 'creak' | 'falling' | 'down' = 'up',
        t0 = 0;
      w.add(
        new Paint((ctx, w2) => {
          if (state === 'up') return;
          // the empty doorway, then the panel coming down towards you
          ctx.fillStyle = 'rgba(20,14,10,0.85)';
          ctx.fillRect(d.x + 1, d.y + 1, 14, 31);
          let a = 0;
          if (state === 'creak') a = Math.sin((w2.tick - t0) * 0.9) * 0.04;
          else if (state === 'falling') a = Math.min(1, (w2.tick - t0) / 30) ** 2 * (Math.PI / 2);
          else a = Math.PI / 2;
          ctx.save();
          ctx.translate(d.x, FLOOR);
          ctx.rotate(-a);
          ctx.fillStyle = '#8D6E63';
          ctx.fillRect(0, -32, 16, 32);
          ctx.strokeStyle = '#4E342E';
          ctx.lineWidth = 1;
          ctx.strokeRect(0.5, -31.5, 15, 31);
          ctx.fillStyle = '#FFD54F';
          ctx.fillRect(12, -17, 2, 2);
          ctx.restore();
        }, 2),
      );
      w.flags.twist = 'up';
      w.onTick((w2) => {
        const p = w2.player;
        const gap = d.x - (p.x + p.w);
        if (state === 'up' && gap < px(3.5) && gap > -6 && p.y + p.h > d.y) {
          state = 'creak';
          t0 = w2.tick;
          d.hidden = true;
          w2.sfx('creak', d.x + 8, d.y);
          npc(w2, 'Kreeeech... | Creeeak...', d.x + 8, d.y - 8, 0.9);
        } else if (state === 'creak' && w2.tick - t0 > secs(0.38)) {
          state = 'falling';
          t0 = w2.tick;
        } else if (state === 'falling' && w2.tick - t0 >= 30) {
          state = 'down';
          w2.sfx('thud', d.x - 16, FLOOR);
          w2.emit('shake', d.x - 16, FLOOR, { amount: 4 });
          w2.emit('fx', d.x - 16, FLOOR, { kind: 'dust', w: 32 });
          if (p.x + p.w > d.x - 33 && p.x < d.x + 1 && p.y + p.h > FLOOR - 10) w2.die('crushed');
          else {
            d.hidden = false;
            npc(w2, 'Bommai kadhavu! | A toy door!', d.x + 8, d.y - 8, 1);
          }
        }
        w2.flags.twist = state;
      });
    },
  },
};
