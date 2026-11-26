// TVM-10 Dhara: Ayurveda's dhara pots swing over the beds, dripping warm oil as they pass the middle of
// the swing. Each hangs on a crooked arm, so the oil is beside the hook, not under it.
import { Entity, type Hazard, type World } from '../../world';
import { DT, TILE } from '../../constants';

const FLOOR = 15 * TILE;

/** One swinging pot and the slick it keeps fresh. Feet on the slick go: Dad slides on his back, can't jump. */
export class Dhara extends Entity {
  readonly hook: number;
  readonly off: number;
  readonly beam: number;
  slick0: number;
  slick1: number;
  static readonly LEN = 44;
  static readonly AMP = 0.55;
  static readonly PERIOD = 2.2;
  static readonly SLIDE = 125;
  static readonly DRAG = 210;
  washed = false;
  private slipping = false;
  constructor(o: { hookTx: number; offTx: number; slick: [number, number]; ty: number }) {
    super();
    this.layer = 3;
    this.hook = o.hookTx * TILE;
    this.off = o.offTx * TILE;
    this.beam = o.ty * TILE;
    this.slick0 = o.slick[0] * TILE;
    this.slick1 = o.slick[1] * TILE;
  }
  /** the pot's swing angle now (the same on every attempt: it swings from the moment the stage starts) */
  angle(w: World) {
    return Dhara.AMP * Math.sin((w.tick * DT * 2 * Math.PI) / Dhara.PERIOD);
  }
  /** is (feet at) x on the oil? */
  onOil(x: number) {
    return !this.washed && x >= this.slick0 && x <= this.slick1;
  }
  /** rain off the tarp washes the oil away */
  wash(w: World) {
    if (this.washed) return;
    this.washed = true;
    w.sfx('splash', (this.slick0 + this.slick1) / 2, FLOOR);
  }
  update(w: World) {
    const p = w.player;
    const feet = p.onGround && Math.abs(p.y + p.h - FLOOR) < 1;
    if (feet && this.onOil(p.cx) && p.stun <= 0) {
      // the feet go: down he goes, sliding on the way he was heading
      const dir = p.vx > 1 ? 1 : p.vx < -1 ? -1 : p.facing;
      p.vx = dir * Math.max(Math.abs(p.vx), Dhara.SLIDE);
      p.stun = 34;
      if (!this.slipping) {
        w.sfx('slide', p.cx, FLOOR);
        w.flags.slipped = (w.flags.slipped ?? 0) + 1;
      }
      this.slipping = true;
    }
    if (this.slipping && p.stun > 0 && p.onGround) {
      const v = Math.max(0, Math.abs(p.vx) - Dhara.DRAG * DT);
      p.vx = Math.sign(p.vx) * v;
    }
    if (p.stun <= 0) this.slipping = false;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const a = this.angle(w);
    const px0 = this.hook + this.off;
    // the hook on the beam, and the crooked arm out to where the rope hangs
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(this.hook, this.beam - 6);
    ctx.lineTo(this.hook, this.beam);
    ctx.lineTo(px0, this.beam + 4);
    ctx.stroke();
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(this.hook - 3, this.beam - 8, 6, 3);
    // the rope and the pot
    const bx = px0 + Math.sin(a) * Dhara.LEN;
    const by = this.beam + 4 + Math.cos(a) * Dhara.LEN;
    ctx.strokeStyle = '#A1887F';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(px0, this.beam + 4);
    ctx.lineTo(bx, by - 6);
    ctx.stroke();
    ctx.fillStyle = '#B87333';
    ctx.beginPath();
    ctx.ellipse(bx, by, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7A4A1E';
    ctx.fillRect(bx - 4, by - 7, 8, 2);
    // drops: they fall as the pot comes through the middle, so they land under the rope, not the hook
    if (!this.washed) {
      ctx.fillStyle = 'rgba(214,170,60,0.95)';
      const half = Dhara.PERIOD / 2;
      const k = (w.tick * DT) % half;
      const fall = k * 260;
      if (fall < FLOOR - (this.beam + 4 + Dhara.LEN)) ctx.fillRect(px0 - 0.8, this.beam + 10 + Dhara.LEN + fall, 1.6, 3);
      // the slick: a shine on the floor
      const g = ctx.createLinearGradient(this.slick0, 0, this.slick1, 0);
      g.addColorStop(0, 'rgba(230,180,60,0.15)');
      g.addColorStop(0.5, 'rgba(240,195,70,0.85)');
      g.addColorStop(1, 'rgba(230,180,60,0.15)');
      ctx.fillStyle = g;
      ctx.fillRect(this.slick0, FLOOR - 1.5, this.slick1 - this.slick0, 2.5);
      ctx.fillStyle = 'rgba(255,245,200,0.8)';
      ctx.fillRect(this.slick0 + (this.slick1 - this.slick0) * 0.3, FLOOR - 1.5, 3, 0.8);
    }
  }
}

/** A wooden droni (the oil trough) let into the floor between tile x0 and x1: fall or slide in, and that's you. */
export class Droni extends Entity {
  readonly x0: number;
  readonly x1: number;
  hazard: Hazard;
  constructor(tx0: number, tx1: number, cause: string) {
    super();
    this.layer = 2;
    this.x0 = tx0 * TILE;
    this.x1 = tx1 * TILE;
    const self = this;
    this.hazard = {
      active: true,
      cause,
      hits(x, y, w, h) {
        return x + w > self.x0 + 2 && x < self.x1 - 2 && y + h > FLOOR + 6;
      },
    };
  }
  draw(ctx: CanvasRenderingContext2D) {
    // the trough's wooden sides and the oil in it
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(this.x0, FLOOR, 2, 30);
    ctx.fillRect(this.x1 - 2, FLOOR, 2, 30);
    ctx.fillStyle = 'rgba(196,140,40,0.92)';
    ctx.fillRect(this.x0 + 2, FLOOR + 8, this.x1 - this.x0 - 4, 22);
    ctx.fillStyle = 'rgba(255,230,150,0.6)';
    ctx.fillRect(this.x0 + 3, FLOOR + 8, this.x1 - this.x0 - 6, 1);
  }
}
