// CCU-01: kumir-danga on the Maidan. Children chalk a river on the grass; the one who is the kumir (the
// crocodile) stands in it, and whoever he touches on the water is caught. He only shuts his eyes and
// counts for a moment, and that is the one time to cross.
import { Entity, type World } from '../../world';
import { DT } from '../../constants';
import { person } from '../../levels/endkit';
import { FLOOR } from './entities';

/**
 * The chalk river from x0 to x1 (px) and its kumir. He wakes when Dad comes within `near` px of the bank:
 * he hunts for `hunt` s (Dad on the water dies, 'ccu-kumir'), then covers his eyes and counts for `count` s,
 * then hunts again, round and round.
 */
export class Kumir extends Entity {
  state: 'idle' | 'hunt' | 'count' = 'idle';
  t = 0;
  private cx: number;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly hunt = 4.5,
    readonly count = 2.6,
    readonly near = 56,
    /** CCU-10: tonight he counts backwards with his eyes open, and covers them only when he stops */
    readonly backwards = false,
  ) {
    super();
    this.layer = -3;
    this.cx = (x0 + x1) / 2;
  }
  /** is he looking (and prowling): hunting, or tonight, counting with his eyes open */
  get watching() {
    return this.backwards ? this.state === 'count' : this.state === 'hunt';
  }
  /** Dad's feet are on the chalk water */
  onWater(w: World) {
    const p = w.player;
    return p.onGround && p.y + p.h >= FLOOR - 1 && p.cx > this.x0 + 2 && p.cx < this.x1 - 2;
  }
  update(w: World) {
    if (w.state !== 'play') return;
    const p = w.player;
    if (this.state === 'idle') {
      if (p.cx < this.x0 - this.near) return;
      this.state = this.backwards ? 'count' : 'hunt';
      this.t = 0;
      if (this.backwards) w.say('Tin… dui… ek… | Three… two… one…', this.cx, FLOOR - 40, this.count, 'npc');
      else w.say('Kumir! Kumir! | Crocodile! Crocodile!', this.cx, FLOOR - 40, 1.6, 'npc');
    }
    this.t += DT;
    if (this.state === 'hunt' && this.t >= this.hunt) {
      this.state = 'count';
      this.t = 0;
      if (this.backwards) w.say('Tin… dui… ek… | Three… two… one…', this.cx, FLOOR - 40, this.count, 'npc');
      else w.say('Ek… dui… tin… | One… two… three…', this.cx, FLOOR - 40, this.count, 'npc');
    } else if (this.state === 'count' && this.t >= this.count) {
      this.state = 'hunt';
      this.t = 0;
    }
    if (this.watching) {
      // he prowls the river towards Dad
      const want = Math.max(this.x0 + 10, Math.min(this.x1 - 10, p.cx));
      this.cx += Math.sign(want - this.cx) * Math.min(Math.abs(want - this.cx), 40 * DT);
      if (this.onWater(w)) w.die('ccu-kumir');
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    // the chalk river: two wavy banks and ripples on the grass
    const y = FLOOR + 1;
    ctx.strokeStyle = 'rgba(245,245,235,0.9)';
    ctx.lineWidth = 1.4;
    for (const x of [this.x0, this.x1]) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 6);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(140,200,230,0.35)';
    ctx.fillRect(this.x0, y, this.x1 - this.x0, 5);
    ctx.beginPath();
    for (let x = this.x0 + 4; x < this.x1 - 6; x += 10) {
      ctx.moveTo(x, y + 2.5);
      ctx.quadraticCurveTo(x + 2.5, y, x + 5, y + 2.5);
    }
    ctx.stroke();
    // the kumir: a child in green, arms out when he hunts, hands over his eyes when he counts
    const k = this.cx;
    person(ctx, k, FLOOR - 22, 22, '#4E8F3A');
    ctx.strokeStyle = '#4E8F3A';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    if (this.state !== 'idle' && !this.watching) {
      ctx.moveTo(k - 6, FLOOR - 14);
      ctx.lineTo(k - 2, FLOOR - 19);
      ctx.moveTo(k + 6, FLOOR - 14);
      ctx.lineTo(k + 2, FLOOR - 19);
    } else {
      const snap = this.state === 'hunt' ? Math.sin(w.tick * 0.4) * 3 : 0;
      ctx.moveTo(k - 6, FLOOR - 14);
      ctx.lineTo(k - 13, FLOOR - 15 - snap);
      ctx.moveTo(k + 6, FLOOR - 14);
      ctx.lineTo(k + 13, FLOOR - 15 + snap);
    }
    ctx.stroke();
  }
}
