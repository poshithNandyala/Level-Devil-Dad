// The newer door endings (Kavaratti 06-08, Mumbai 05-07). Same rules as endings.ts: one per stage,
// never shared, and each keeps w.flags.twist up to date for the test policies.
import { Entity, type World } from '../world';
import { Solid } from '../body';
import { Sea } from '../entities/abilities';
import { DT, secs } from '../constants';
import { pool } from './acts';
import { type Ending, LAGOON, text } from './endkit';

export type NewEndingKind =  never;

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

export const NEW_ENDINGS: Record<NewEndingKind, Ending> = {
};
