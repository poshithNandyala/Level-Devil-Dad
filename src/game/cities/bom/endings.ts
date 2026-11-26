// Mumbai's door endings.
import { doorPic, FLOOR, hits, lock, npc, Paint, person, tara, text, tt } from '../../levels/endkit';
import { Thing } from '../../entities/traps';
import { DT, secs } from '../../constants';
import { px } from '../../levels/kit';
import { rr } from '../../../render/art/common';
import { ChawlWall, Facade } from '../../entities/abilities';
import type { Ending } from '../../levels/endkit';

/** a Mumbai local's car, cream and maroon, with people at the windows; its doorway at dx */
export function drawLocal(ctx: CanvasRenderingContext2D, x: number, floor: number, t: number, doorX: number) {
  const top = floor - 40;
  for (let c = 0; c < 2; c++) {
    const cx = x + c * 100;
    ctx.fillStyle = '#F3E5C8';
    ctx.fillRect(cx, top, 96, 40);
    ctx.fillStyle = '#8E2A20';
    ctx.fillRect(cx, top + 26, 96, 14);
    ctx.fillRect(cx, top, 96, 4);
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(cx, floor - 2, 96, 2);
    // windows with people
    for (let i = 0; i < 4; i++) {
      const wx = cx + 6 + i * 23;
      if (Math.abs(wx + 7 - doorX) < 14) continue;
      ctx.fillStyle = '#263238';
      ctx.fillRect(wx, top + 8, 14, 12);
      ctx.fillStyle = ['#C68B59', '#8D5524', '#E0AC69'][(i + c) % 3];
      ctx.beginPath();
      ctx.arc(wx + 7, top + 15 + Math.sin(t * 3 + i) * 0.6, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    text(ctx, c ? 'CHURCHGATE' : 'S  L  O  W', cx + 48, top + 33, 5, '#FFE082', '');
  }
  // the open doorway, packed: arms hanging out
  ctx.fillStyle = '#1C1C1C';
  ctx.fillRect(doorX - 9, top + 4, 18, 36);
  ctx.strokeStyle = '#C68B59';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(doorX - 8, top + 12);
  ctx.lineTo(doorX - 14, top + 18 + Math.sin(t * 4) * 2);
  ctx.moveTo(doorX + 8, top + 10);
  ctx.lineTo(doorX + 13, top + 15 - Math.sin(t * 4) * 2);
  ctx.stroke();
}

export type BomEndingKind = 'bollywood' | 'kabaddi' | 'dahihandi' | 'credits' | 'dabbacode' | 'lightwell' | 'local';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<BomEndingKind, true> {}
}

export const endings: Record<BomEndingKind, Ending> = {
  // ================================================================ Mumbai
  /** The studio door: "Dance first, then entry!" Do the step in the spotlight. */
  bollywood: {
    space: 10,
    advice: 'In the spotlight the director wants the step shown over the door: left, right, left, right, jump. One wrong move and it’s cut, from the top.',
    build(w, d) {
      const L = lock(w, d, 'Pehle dance! | Dance first!');
      const MOVES: ('L' | 'R' | 'J')[] = ['L', 'R', 'L', 'R', 'J'];
      const glyph = { L: '←', R: '→', J: '⤒' };
      const s0 = d.x - px(6),
        s1 = d.x - px(1);
      let i = 0,
        prev = { l: false, r: false },
        said = false;
      w.add(
        new Paint((ctx, w2) => {
          const g = ctx.createRadialGradient((s0 + s1) / 2, FLOOR, 4, (s0 + s1) / 2, FLOOR - 10, 52);
          g.addColorStop(0, 'rgba(255,245,200,0.55)');
          g.addColorStop(1, 'rgba(255,245,200,0)');
          ctx.fillStyle = g;
          ctx.fillRect(s0 - 20, FLOOR - 70, s1 - s0 + 40, 70);
          if (L.open) return;
          MOVES.forEach((m, k) => {
            const x = d.x + 8 + (k - 2) * 12;
            ctx.fillStyle = k < i ? '#FFD740' : 'rgba(0,0,0,0.55)';
            rr(ctx, x - 5, d.y - 24, 10, 10, 2);
            ctx.fill();
            text(ctx, glyph[m], x, d.y - 19, 7, k < i ? '#212121' : '#FFFFFF', '');
          });
          text(ctx, 'DANCE!', d.x + 8, d.y - 32, 6, '#FF80AB');
          void w2;
        }, -1),
      );
      w.flags.twist = 'locked';
      w.onTick((w2) => {
        const p = w2.player;
        const inSpot = p.cx > s0 && p.cx < s1;
        const inp = w2.input;
        const ev: 'L' | 'R' | 'J' | null = inp.jumpPressed ? 'J' : inp.left && !prev.l ? 'L' : inp.right && !prev.r ? 'R' : null;
        prev = { l: inp.left, r: inp.right };
        w2.flags.danceI = i;
        w2.flags.spot = [s0, s1];
        if (L.open) return;
        if (inSpot && !said) {
          said = true;
          npc(w2, 'Lights! Camera! Dance, hero! | Lights, camera, dance!', d.x + 8, d.y - 44, 1.8);
        }
        if (!inSpot || !ev) return;
        if (ev === MOVES[i]) {
          i++;
          w2.sfx('clap', p.cx, p.y);
          if (i >= MOVES.length) {
            npc(w2, 'Superhit! Entry! | Superhit! Come in!', d.x + 8, d.y - 44, 1.6);
            w2.emit('fx', d.x + 8, d.y - 10, { kind: 'confetti' });
            L.unlock();
          }
        } else if (i > 0) {
          i = 0;
          w2.sfx('thud', p.cx, p.y);
          npc(w2, 'Cut! Phir se! | Cut! From the top!', d.x + 8, d.y - 44, 1.2);
        }
      });
    },
  },

  /** Kabaddi! In the court you must keep chanting: hold the jump button the whole way.
   *  Let go, or run out of breath, and they tackle you. */
  kabaddi: {
    space: 12,
    advice: 'Kabaddi! Inside the court you must keep chanting: hold the jump button all the way to the door. Let go, or dawdle till your breath runs out, and you’re tackled.',
    build(w, d) {
      const c0 = d.x - px(9),
        c1 = d.x - 2;
      const BREATH = 2.6;
      let inT = -1;
      w.add(
        new Paint((ctx, w2) => {
          ctx.fillStyle = 'rgba(255,255,255,0.75)';
          ctx.fillRect(c0, FLOOR - 1, 2, 1);
          ctx.fillRect(c0, FLOOR - 1, c1 - c0, 0.8);
          ctx.fillRect(c0 + (c1 - c0) / 2, FLOOR - 1, 1, 1);
          text(ctx, 'KABADDI COURT', c0 - 14, FLOOR - 46, 5, '#FFAB40', 'rgba(0,0,0,0.6)', 'left');
          text(ctx, 'HOLD ⤒ ALL THE WAY', c0 - 14, FLOOR - 38, 5, '#FFFFFF', 'rgba(0,0,0,0.6)', 'left');
          const n = inT >= 0 ? 0 : 3;
          for (let k = 0; k < 3; k++) {
            const x = c0 + px(4) + k * 18,
              lunge = n === 0 && w2.flags.twist === 'tackle' ? 6 : 0;
            person(ctx, x - lunge, FLOOR - 16, 16, '#1565C0', '#8D5524', { arms: 3 });
          }
          const p = w2.player;
          if (inT >= 0 && !p.dead) {
            const left = Math.max(0, 1 - (tt(w2) - inT) / BREATH);
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(p.cx - 9, p.y - 9, 18, 3);
            ctx.fillStyle = left > 0.3 ? '#4FC3F7' : '#FF5252';
            ctx.fillRect(p.cx - 9, p.y - 9, 18 * left, 3);
            if (w2.tick % 24 < 16) text(ctx, 'kabaddi-kabaddi', p.cx, p.y - 16, 4.5, '#FFFFFF');
          }
        }, 3),
      );
      let said = false;
      w.flags.twist = 'out';
      w.flags.court = [c0, c1];
      w.onTick((w2) => {
        const p = w2.player;
        const inside = p.x + p.w > c0 && p.x < c1;
        if (!said && p.x > c0 - px(3.5)) {
          said = true;
          tara(w2, 'Kabaddi! Hold JUMP and keep chanting all the way! | Hold jump the whole way across!', 3);
        }
        if (!inside) {
          inT = -1;
          w2.flags.twist = 'out';
          return;
        }
        if (inT < 0) inT = tt(w2);
        if (w2.tick % 30 === 0) w2.sfx('chant', p.cx, p.y);
        const breath = tt(w2) - inT < BREATH;
        if ((!w2.input.jump || !breath) && w2.state === 'play') {
          w2.flags.twist = 'tackle';
          npc(w2, breath ? 'Out! No chant, no raid! | Out! You stopped chanting!' : 'Out of breath! Out! | Out of breath!', p.cx, p.y - 18, 1.4);
          w2.die('tackled');
          return;
        }
        w2.flags.twist = 'raid';
      });
    },
  },

  /** Dahi handi: the door is the pot hanging high over the street. Climb the human pyramid before it
   *  wobbles apart, and break the pot. */
  dahihandi: {
    space: 10,
    advice: 'Climb the Govinda pyramid, tier by tier, and jump into the pot hanging over the street. Don’t stop on the way: once you’re on it, it holds for only a few seconds.',
    build(w, d) {
      const cx = d.x - px(2);
      const tiers = [
        { y: FLOOR - 24, w: 42, amp: 0, n: 3 },
        { y: FLOOR - 56, w: 30, amp: 4, n: 2 },
        { y: FLOOR - 88, w: 16, amp: 9, n: 1 },
      ].map((t) => {
        const s = w.add(new Thing('plank', cx - t.w / 2, t.y, { w: t.w, h: 4, oneWay: true, layer: 1 }));
        s.visible = false;
        return { ...t, s };
      });
      d.x = cx - 8;
      d.y = FLOOR - 180;
      const draw = d.draw.bind(d);
      d.draw = (ctx, w2) => {
        ctx.strokeStyle = '#D7CCC8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(d.x - 60, d.y - 20);
        ctx.lineTo(d.x + 8, d.y + 2);
        ctx.lineTo(d.x + 76, d.y - 20);
        ctx.stroke();
        ctx.fillStyle = '#E65100';
        ctx.beginPath();
        ctx.ellipse(d.x + 8, d.y + 18, 13, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFF3E0';
        ctx.fillRect(d.x - 3, d.y + 4, 22, 3);
        ctx.fillStyle = '#FFD54F';
        for (let i = 0; i < 6; i++) ctx.fillRect(d.x - 4 + i * 4, d.y + 26 + (i % 2) * 2, 2, 2);
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.translate(d.x + 3, d.y + 9);
        ctx.scale(0.35, 0.35);
        draw(ctx, w2);
        ctx.restore();
      };
      d.exit.zone = () => ({ x: d.x - 4, y: d.y + 6, w: 24, h: 22 });
      let t0 = -1,
        fallen = -1;
      w.add(
        new Paint((ctx, w2) => {
          if (fallen >= 0 && w2.tick - fallen < secs(1.6)) return;
          for (const t of tiers) {
            const x0 = t.s.solid.x;
            for (let k = 0; k < t.n; k++) person(ctx, x0 + 7 + k * 14, t.s.solid.y, 24, ['#FB8C00', '#43A047', '#E53935'][k % 3], '#8D5524', { arms: 6 });
          }
        }, 1),
      );
      w.flags.twist = 'stand';
      w.onTick((w2) => {
        const p = w2.player;
        const up = fallen < 0 || w2.tick - fallen > secs(1.6);
        tiers.forEach((t, i) => {
          const ox = Math.sin(tt(w2) * 2.6 + i) * t.amp;
          t.s.solid.collidable = up;
          t.s.place(w2, cx - t.w / 2 + ox, t.y);
        });
        const on = tiers.some((t) => w2.standing(t.s.solid));
        if (on && t0 < 0) {
          t0 = w2.tick;
          npc(w2, 'Govinda ala re ala! | Here come the Govindas!', cx, FLOOR - 120, 1.6);
        }
        if (t0 >= 0 && w2.tick - t0 > secs(2.4) && fallen < 0) {
          fallen = w2.tick;
          t0 = -1;
          w2.sfx('collapse', cx, FLOOR - 40);
          w2.emit('shake', cx, FLOOR - 20, { amount: 4 });
          npc(w2, 'Gire! Gire! | They fell!', cx, FLOOR - 60, 1.2);
          if (on || hits(p, cx - 24, FLOOR - 100, 48, 100)) w2.die('crushed');
        }
        if (fallen >= 0 && w2.tick - fallen > secs(1.6)) fallen = -2;
        w2.flags.twist = on ? 'climb' : 'stand';
        w2.flags.tiers = tiers.map((t) => [t.s.solid.x, t.s.solid.y, t.w]);
      });
    },
  },

  /** The finale: THE END rolls... and the credits are the stairs to the last door. */
  credits: {
    space: 10,
    advice: 'THE END? Not yet: the last door is up in the sky, and the credits are your stairs. Ride a line up and hop right to the next as they rise.',
    paint: (g, D) => {
      g.put(D, 14, '.');
      g.put(D, 4, 'E');
      for (const c of [D - 4, D - 3, D - 2, D - 1, D, D + 1]) g.put(c, 14, '^');
    },
    build(w, d) {
      const LINES = [
        'THE END',
        'Directed by TARA',
        'Dad .......... DAD',
        'Stunts: also Dad',
        'Mummy: Producer',
        'Chai: Juhu tapri',
        'No dads were harmed*',
        '*seven times',
        'Thala for a reason',
        'Thank you for playing!',
      ];
      const X = [d.x - px(6.5), d.x - px(4), d.x - px(1.5)];
      const RISE = 40,
        EVERY = 0.85,
        TOP = 70;
      const lines: { t: Thing; n: number; born: number }[] = [];
      let n = 0,
        next = -1,
        started = false;
      w.add(
        new Paint((ctx, w2) => {
          for (const l of lines) {
            if (!l.t.alive) continue;
            const s = l.t.solid;
            const a = Math.min(1, (s.y - TOP) / 30);
            ctx.globalAlpha = Math.max(0, a);
            ctx.fillStyle = 'rgba(10,8,20,0.55)';
            rr(ctx, s.x, s.y - 1, s.w, 8, 2);
            ctx.fill();
            text(ctx, LINES[l.n % LINES.length], s.x + s.w / 2, s.y + 3, 5.5, l.n % LINES.length === 0 ? '#FFD740' : '#FFFFFF', '');
            ctx.globalAlpha = 1;
          }
          void w2;
        }, 1),
      );
      w.flags.twist = 'idle';
      w.onTick((w2) => {
        const p = w2.player;
        if (!started && p.x > d.x - px(9)) {
          started = true;
          next = w2.tick + secs(0.6);
          w2.flags.banner = { text: 'THE END', sub: 'thanks for playing!', t0: w2.tick, dur: 2.2, style: 'end' };
          w2.after(2.0, () => tara(w2, 'THE END? One more door, Dad! Climb the credits! | One more door! Climb the credits!', 3));
        }
        if (started && w2.tick >= next) {
          next = w2.tick + secs(EVERY);
          const k = n % 3;
          const lane = [0, 2, 1][k];
          const width = 46;
          const t = w2.add(new Thing('plank', X[lane] + 8 - width / 2, FLOOR, { w: width, h: 4, oneWay: true, layer: 1 }));
          t.visible = false;
          lines.push({ t, n, born: w2.tick });
          n++;
        }
        for (const l of lines) {
          if (!l.t.alive) continue;
          const y = FLOOR - ((w2.tick - l.born) * DT) * RISE;
          if (y < TOP) {
            l.t.alive = false;
            l.t.solid.collidable = false;
            continue;
          }
          l.t.solid.velX = 0;
          l.t.place(w2, l.t.solid.x, y);
        }
        w2.flags.lines = lines.filter((l) => l.t.alive).map((l) => [l.t.solid.x, l.t.solid.y, l.t.solid.w]);
        w2.flags.twist = started ? 'roll' : 'idle';
      });
    },
  },
  /** The office corridor: five doors, five codes. Stop at the one whose code is on your dabba's lid.
   *  (Dabbawalas never read addresses; they read codes.) */
  dabbacode: {
    space: 18,
    advice: 'Read the code on your dabba’s lid. Walk past the doors (that’s fine) and stop in front of the one with the same code: stopping at a wrong one sends you back to the start of the corridor.',
    build(w, d) {
      const CODE = 'VP·9·EX·12';
      const doors: { x: number; code: string; real: boolean }[] = [
        { x: d.x - px(12), code: 'VP·9·EX·21', real: false },
        { x: d.x - px(8), code: 'PV·9·EX·12', real: false },
        { x: d.x - px(4), code: 'VP·6·EX·12', real: false },
        { x: d.x, code: CODE, real: true },
        { x: d.x + px(3), code: 'VP·9·XE·12', real: false },
      ];
      const start = d.x - px(16);
      let still = 0,
        at: (typeof doors)[number] | null = null,
        sent = -999;
      w.flags.twist = 'look';
      w.flags.codes = doors;
      w.flags.code = CODE;
      d.onReach = () => {};
      w.add(
        new Paint((ctx, w2) => {
          // the corridor wall, the fake doors, everyone's code plate
          ctx.fillStyle = '#ECE3D0';
          ctx.fillRect(d.x - px(14), FLOOR - 56, px(19), 56);
          ctx.fillStyle = '#B39DDB';
          ctx.fillRect(d.x - px(14), FLOOR - 8, px(19), 8);
          for (const o of doors) {
            if (!o.real) doorPic(ctx, w2, o.x, FLOOR - 32, 0.3);
            ctx.fillStyle = '#263238';
            ctx.fillRect(o.x - 8, FLOOR - 46, 32, 9);
            text(ctx, o.code, o.x + 8, FLOOR - 41.5, 4.6, '#FFF59D', '');
          }
          // the lid of the dabba Dad carries, big enough to read
          const p = w2.player;
          if (p.carry === 'dabba') {
            ctx.fillStyle = 'rgba(255,255,255,0.92)';
            ctx.fillRect(p.cx - 22, p.y - 28, 44, 10);
            ctx.strokeStyle = '#E53935';
            ctx.strokeRect(p.cx - 22 + 0.5, p.y - 27.5, 43, 9);
            text(ctx, CODE, p.cx, p.y - 23, 5, '#B71C1C', '');
          }
          // standing still at a door: delivering...
          if (at && still > 6) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(at.x - 2, FLOOR - 54, 20, 4);
            ctx.fillStyle = '#FFCA28';
            ctx.fillRect(at.x - 2, FLOOR - 54, (20 * Math.min(1, still / 72)), 4);
          }
        }, -3),
      );
      w.onTick((w2) => {
        const p = w2.player;
        at = doors.find((o) => Math.abs(p.cx - (o.x + 8)) < 7) ?? null;
        if (!at || !p.onGround || Math.abs(p.vx) > 4 || p.carry !== 'dabba') {
          still = 0;
          return;
        }
        if (++still < 72) return;
        if (at.real) {
          w2.flags.twist = 'delivered';
          npc(w2, 'Thank you, dabbawale kaka! | Thank you, dabba uncle!', at.x + 8, FLOOR - 62, 1.4);
          w2.win('door');
          return;
        }
        if (w2.tick - sent < 60) return;
        sent = w2.tick;
        still = 0;
        npc(w2, 'He maajha dabba nahi! | This isn’t my lunch!', at.x + 8, FLOOR - 62, 1.6);
        w2.warp(start, FLOOR - 14, 'blink');
      });
      w.when(
        (w2) => w2.player.cx > d.x - px(15),
        (w2) => tara(w2, 'Barah number, bhau! Pahila darwaza! | Number twelve, bro! The first door!', 2.4),
      );
    },
  },

  /** Up all stage... and the door is at the bottom of the light-well. Drop in, but slide down the walls:
   *  seven floors of free fall is a splat. Mind the pigeon spikes on the way down. */
  lightwell: {
    space: 18,
    advice: 'The door isn’t up on the terrace: it’s at the bottom of the light-well. Drop in and slide down, holding against a wall, switching walls to miss the pigeon spikes. Fall all the way and it’s a splat.',
    paint: (g, D) => {
      g.fill(D - 11, D - 10, 2, 11, '#');
      g.fill(D - 6, D + 4, 2, 17, '#');
      g.fill(D - 1, D, 2, 15, '.');
      g.put(D - 1, 5, '>').put(D - 1, 12, '>');
      g.put(D, 9, '<');
      g.put(D, 15, 'E');
    },
    build(w, d) {
      const D = Math.round(d.x / 16);
      w.add(new Facade(px(D - 11), px(2), px(2), px(10), '#E0C8A8', 7));
      w.add(new Facade(px(D - 6), px(2), px(5), px(16), '#E8D9B5', 8));
      w.add(new Facade(px(D + 1), px(2), px(4), px(16), '#E8D9B5', 9));
      // kick and slide: the gali up to the roof, and both sides of the well
      w.add(new ChawlWall(w, D - 10, 2, 11, '#E0C8A8'));
      w.add(new ChawlWall(w, D - 6, 2, 14, '#E8D9B5'));
      w.add(new ChawlWall(w, D - 2, 3, 15, '#D7CCC8'));
      w.add(new ChawlWall(w, D + 1, 3, 15, '#D7CCC8'));
      w.flags.twist = 'street';
      // the bottom of the well: land soft or splat
      const bottom = px(16);
      w.onTick((w2) => {
        const p = w2.player;
        const inWell = p.x >= px(D - 1) - 2 && p.x + p.w <= px(D + 1) + 2;
        const feet = p.y + p.h;
        if (inWell && feet > px(3)) w2.flags.twist = 'well';
        else if (p.onGround && feet === px(2) && p.cx > px(D - 6)) w2.flags.twist = 'roof';
        else if (p.onGround && feet === px(15)) w2.flags.twist = 'street';
        if (inWell && p.landTick === w2.tick - 1 && p.y + p.h === bottom && p.landSpeed > 300) w2.die('splat');
      });
      // the spikes are on the AC boxes (drawn small, under the spike tiles)
      w.add(
        new Paint((ctx) => {
          for (const [tx, ty, f] of [[D - 1, 5, 1], [D - 1, 12, 1], [D, 9, -1]] as [number, number, number][]) {
            ctx.fillStyle = '#ECEFF1';
            ctx.fillRect(px(tx) + (f > 0 ? 0 : 6), px(ty) + 9, 10, 7);
            ctx.strokeStyle = 'rgba(0,0,0,0.35)';
            ctx.strokeRect(px(tx) + (f > 0 ? 0 : 6) + 0.5, px(ty) + 9.5, 9, 6);
          }
          text(ctx, 'LIGHT WELL', px(D), px(2) - 6, 5, '#FFE082');
        }, -1),
      );
      w.when(
        (w2) => w2.player.cx > px(D - 13),
        (w2) => tara(w2, 'Darwaza terrace pe hai, bhau! Upar chal! | The door’s up on the terrace, bro! Go up!', 2.6),
      );
      w.when(
        (w2) => w2.flags.twist === 'roof',
        (w2) => npc(w2, 'Darwaza khali aahe! Halu utar! | The door’s down there! Climb down slowly!', px(D), px(2) - 16, 1.8),
      );
    },
  },

  /** The last local: it pulls out as you get near. Mumbai style: never stop, run with it and get in. */
  local: {
    space: 16,
    after: 10,
    advice: 'The local pulls out the moment you get close. Don’t stop for anything (hop the basket and the pillar) and run in through its door before the platform ends.',
    paint: (g, D) => void g.pit(D + 8, D + 10),
    build(w, d) {
      const x0 = d.x;
      let off = 0,
        v = 0,
        phase: 'wait' | 'go' | 'gone' | 'arrive' = 'wait',
        t0 = 0;
      d.follow = () => ({ x: x0 + off, y: d.y });
      // a vada pav basket and a pillar on the platform
      w.add(new Thing('crate', x0 - px(3), FLOOR - 14, { w: 16, h: 14, layer: 1 })).tint = '#A1887F';
      w.add(new Thing('pillar', x0 + px(3), FLOOR - 28, { w: 12, h: 28, layer: 1 }));
      w.flags.twist = 'standing';
      w.add(new Paint((ctx, w2) => drawLocal(ctx, x0 + off - px(6), FLOOR, w2.tick * DT, x0 + off + 8), -3));
      w.onTick((w2) => {
        const p = w2.player;
        if (phase === 'wait' && p.cx > x0 - px(7)) {
          phase = 'go';
          t0 = w2.tick;
          v = 0;
          w2.flags.twist = 'leaving';
          w2.sfx('honk', x0, FLOOR - 30);
          tara(w2, 'Ruk, Dad! Agli local pakad! | Stop, Dad! Catch the next one!', 2.2);
        }
        if (phase === 'go' && w2.tick - t0 > secs(0.3)) {
          v = Math.min(210, v + 64 * DT);
          off += v * DT;
          if (off > px(14)) {
            phase = 'gone';
            t0 = w2.tick;
            d.hidden = true;
            w2.flags.twist = 'gone';
            npc(w2, 'Gaadi geli! Pudhchi yeil! | The train’s gone! Another will come!', p.cx, FLOOR - 50, 1.6);
          }
        }
        if (phase === 'gone' && w2.tick - t0 > secs(1.5)) {
          phase = 'arrive';
          off = -px(16);
          v = 210;
          d.hidden = false;
          w2.flags.twist = 'arriving';
        }
        if (phase === 'arrive') {
          v = Math.max(26, Math.min(210, Math.sqrt(Math.max(0, -off) * 2 * 120)));
          off = Math.min(0, off + v * DT);
          if (off >= 0) {
            phase = 'wait';
            w2.flags.twist = 'standing';
          }
        }
      });
    },
  },
};
