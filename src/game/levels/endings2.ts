// The newer door endings (Kavaratti 06-08, Mumbai 05-07). Same rules as endings.ts: one per stage,
// never shared, and each keeps w.flags.twist up to date for the test policies.
import { Entity, type World } from '../world';
import { Solid } from '../body';
import { Thing } from '../entities/traps';
import { ChawlWall, Facade, Sea } from '../entities/abilities';
import { DT, secs } from '../constants';
import { px } from './kit';
import { pool } from './acts';
import { type Ending, FLOOR, LAGOON, Paint, doorPic, npc, tara, text } from './endkit';

export type NewEndingKind =  | 'local' | 'lightwell' | 'dabbacode';

/** A beached kayak: walk into it to push it down the sand. In the water it floats off by itself. */
export class Kayak extends Entity {
  solid: Solid;
  state: 'beached' | 'afloat' | 'docked' | 'back' = 'beached';
  private t0 = 0;
  constructor(
    x: number,
    readonly ground: number,
    readonly shore: number,
    readonly dock: number,
  ) {
    super();
    this.layer = 1;
    this.solid = new Solid(x, ground - 12, 34, 12);
  }
  update(w: World) {
    const p = w.player;
    const s = this.solid;
    const aboard = w.standing(s);
    if (this.state === 'beached') {
      // Dad leaning into its back end
      const touching = p.onGround && !aboard && p.inputDir > 0 && p.x + p.w >= s.x - 1 && p.x + p.w <= s.x + 2 && p.y + p.h > s.y && p.y < s.y + s.h;
      if (touching) {
        s.moveBy(w, 62 * DT, 0);
        if (w.tick % 18 === 0) w.sfx('slide', s.x, s.y);
      }
      if (s.x + s.w > this.shore + 8) {
        // over the edge and in: it sits a little lower in the water and floats away
        this.state = 'afloat';
        s.moveBy(w, 0, 6);
        w.sfx('splash', s.x + 17, s.y);
        w.emit('fx', s.x + 17, s.y + 8, { kind: 'splash' });
        w.flags.twist = 'afloat';
      }
    } else if (this.state === 'afloat') {
      s.velX = 46;
      s.moveBy(w, 46 * DT, 0);
      if (s.x + s.w >= this.dock) {
        s.velX = 0;
        this.state = 'docked';
        this.t0 = w.tick;
        w.flags.twist = 'docked';
      }
    } else if (this.state === 'docked') {
      // nobody aboard: the tide takes it back to the beach
      if (aboard) this.t0 = w.tick;
      else if (w.tick - this.t0 > secs(1.5)) {
        this.state = 'back';
        w.flags.twist = 'idle';
      }
    } else if (this.state === 'back') {
      s.velX = -46;
      s.moveBy(w, -46 * DT, 0);
      if (s.x + s.w <= this.shore + 8) {
        s.velX = 0;
        s.moveBy(w, 0, -6);
        this.state = 'beached';
      }
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const s = this.solid;
    const bob = this.state === 'beached' ? 0 : Math.sin(w.tick * 0.08) * 0.8;
    const x = s.x,
      y = s.y + bob;
    ctx.fillStyle = '#F4511E';
    ctx.strokeStyle = '#8D2A0E';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y + 3);
    ctx.lineTo(x + s.w, y + 3);
    ctx.quadraticCurveTo(x + s.w - 2, y + 12, x + s.w - 9, y + 12);
    ctx.lineTo(x + 7, y + 12);
    ctx.quadraticCurveTo(x + 1, y + 11, x, y + 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FFE0B2';
    ctx.fillRect(x + 4, y + 1, s.w - 8, 2.4);
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(x + 13, y + 1.5, 8, 2);
    // the paddle lying across it
    ctx.strokeStyle = '#6D4C41';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x + 6, y - 1);
    ctx.lineTo(x + 28, y + 2);
    ctx.stroke();
  }
}

/** a Mumbai local's car, cream and maroon, with people at the windows; its doorway at dx */
function drawLocal(ctx: CanvasRenderingContext2D, x: number, floor: number, t: number, doorX: number) {
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

export const NEW_ENDINGS: Record<NewEndingKind, Ending> = {
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
