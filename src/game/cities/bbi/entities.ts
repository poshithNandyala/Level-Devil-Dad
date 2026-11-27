// Bhubaneswar's own kit. A Rig is a box that can be solid (Dad stands on it, it can carry him) and/or deadly,
// moved and drawn by closures, so each stage's mechanic reads as stage directions. A few drawing helpers for
// the city's people and things. Deterministic: no Math.random, Date or real time (AGENTS.md, bar 6).
import { Entity, type Hazard, type World } from '../../world';
import { Solid } from '../../body';
import { overlapXYWH } from '../../constants';

export interface RigOpts {
  /** Dad can stand on it / be carried by it */
  solid?: boolean;
  /** touching it kills with this cause */
  cause?: string;
  /** px the deadly box is smaller than the drawn one on each side */
  inset?: number;
  layer?: number;
  /** is the deadly box live right now? (default: while `on`) */
  live?: (r: Rig, w: World) => boolean;
  /** runs every tick, before Dad moves */
  tick?: (r: Rig, w: World) => void;
  paint?: (ctx: CanvasRenderingContext2D, r: Rig, w: World) => void;
}

/** a box with a solid and/or a hazard, driven by closures */
export class Rig extends Entity {
  solid?: Solid;
  hazard?: Hazard;
  on = true;
  /** free scratch for the stage (and the tests) */
  s: Record<string, any> = {};
  private W: World | null = null;
  constructor(
    public x: number,
    public y: number,
    public w: number,
    public h: number,
    readonly o: RigOpts,
  ) {
    super();
    this.layer = o.layer ?? 2;
    if (o.solid) this.solid = new Solid(x, y, w, h);
    if (o.cause) {
      const self = this;
      const inset = o.inset ?? 2;
      this.hazard = {
        active: true,
        cause: o.cause,
        hits: (hx, hy, hw, hh) => {
          if (!self.alive || !self.on) return false;
          if (self.o.live && self.W && !self.o.live(self, self.W)) return false;
          return overlapXYWH(hx, hy, hw, hh, { x: self.x + inset, y: self.y + inset, w: self.w - 2 * inset, h: self.h - 2 * inset });
        },
      };
    }
  }
  update(w: World) {
    this.W = w;
    this.o.tick?.(this, w);
  }
  /** move to (x, y); a solid carries whoever stands on it, and tells a jump its real speed */
  moveTo(w: World, x: number, y: number) {
    if (this.solid) {
      const dx = x - (this.solid.x + this.solid.xr);
      const dy = y - (this.solid.y + this.solid.yr);
      this.solid.moveBy(w, dx, dy);
      this.solid.velX = dx * 120;
      this.x = this.solid.x;
      this.y = this.solid.y;
    } else {
      this.x = x;
      this.y = y;
    }
  }
  setSolid(on: boolean) {
    if (this.solid) this.solid.collidable = on;
  }
  /** is Dad standing on this rig's solid? */
  rides(w: World) {
    return !!this.solid && w.standing(this.solid);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (this.on) this.o.paint?.(ctx, this, w);
  }
}

/** px per second -> px per tick */
export const perTick = (v: number) => v / 120;

/** a flat colour box */
export const box = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string) => {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
};

/** a person standing at x (centre) with feet at y, h tall, in a shirt colour; an arm at an angle if given */
export function folk(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, shirt: string, o: { cloth?: string; skirt?: string; face?: 1 | -1; arm?: number } = {}) {
  const top = y - h;
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(x - 5, y - 1, 10, 2);
  ctx.fillStyle = o.skirt ?? '#3A3340';
  ctx.fillRect(x - 3, top + h * 0.6, 6, h * 0.4);
  ctx.fillStyle = shirt;
  ctx.fillRect(x - 4, top + h * 0.26, 8, h * 0.38);
  ctx.fillStyle = '#B07A4E';
  ctx.beginPath();
  ctx.arc(x, top + h * 0.14, h * 0.13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2B1B12';
  ctx.fillRect(x - h * 0.13, top + h * 0.02, h * 0.26, h * 0.06);
  if (o.cloth) {
    ctx.fillStyle = o.cloth;
    ctx.fillRect(x - 5, top + h * 0.26, 10, 2);
  }
  if (o.arm !== undefined) {
    const f = o.face ?? 1;
    ctx.save();
    ctx.translate(x + f * 3, top + h * 0.32);
    ctx.rotate(f * o.arm);
    ctx.fillStyle = shirt;
    ctx.fillRect(0, -1, f * 8, 2.5);
    ctx.restore();
  }
}

/** a small text label, centred */
export function label(ctx: CanvasRenderingContext2D, x: number, y: number, s: string, c = '#FFF8E8', size = 6) {
  ctx.fillStyle = c;
  ctx.font = `bold ${size}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(s, x, y);
  ctx.textAlign = 'left';
}
