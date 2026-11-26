// Gangtok's own entities. One small kit does the work: a Rig is a box that can be solid (Dad stands on it, it
// carries him) and/or deadly, moved and drawn by closures, so each stage file reads as stage directions.
// Deterministic: no Math.random, Date or real time (AGENTS.md, bar 6).
import { Entity, type Hazard, type World } from '../../world';
import { Solid } from '../../body';
import { overlapXYWH } from '../../constants';

export const FL = 240;
export const T = 16;
export const px = (t: number) => t * T;

export interface RigOpts {
  /** Dad can stand on it / be carried by it */
  solid?: boolean;
  /** stand on it from above only */
  oneWay?: boolean;
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
  /** scratch for the stage's closures (and the tests) */
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
    if (o.solid) {
      this.solid = new Solid(x, y, w, h);
      if (o.oneWay) this.solid.oneWay = true;
    }
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
  /** move to (x, y); a solid carries whoever stands on it */
  moveTo(w: World, x: number, y: number) {
    if (this.solid) {
      const dx = x - this.x;
      this.solid.moveBy(w, dx, y - this.y);
      this.solid.velX = dx * 120;
      this.x = x;
      this.y = y;
    } else {
      this.x = x;
      this.y = y;
    }
  }
  setSolid(on: boolean) {
    if (this.solid) this.solid.collidable = on;
  }
  /** is Dad standing on this one? */
  carries(w: World) {
    return !!this.solid && w.standing(this.solid);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (this.on && this.o.paint) this.o.paint(ctx, this, w);
  }
}

/** px per second -> px per tick */
export const perTick = (v: number) => v / 120;
/** seconds since tick t0 */
export const since = (w: World, t0: number) => (w.tick - t0) / 120;
/** cycle position in seconds since t0 */
export const cyc = (w: World, t0: number, period: number) => ((((w.tick - t0) / 120) % period) + period) % period;
/** a flat box */
export const box = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string) => {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
};
/** a decoration drawn by a closure, on a layer */
export const decor = (w: World, layer: number, f: (ctx: CanvasRenderingContext2D, w: World) => void) => w.add(new Rig(0, 0, 0, 0, { layer, paint: (ctx, _r, w2) => f(ctx, w2) }));

/** a little Gangtok local: jacket colour, optional cap, optional broom/whistle arm */
export function local(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, coat: string, o: { cap?: string; face?: 1 | -1; scarf?: string } = {}) {
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(x - 5, y + h - 1, 11, 2);
  box(ctx, x - 3, y + h * 0.62, 2.5, h * 0.38, '#2E3340');
  box(ctx, x + 0.5, y + h * 0.62, 2.5, h * 0.38, '#2E3340');
  box(ctx, x - 4.5, y + h * 0.27, 9, h * 0.4, coat);
  if (o.scarf) box(ctx, x - 4.5, y + h * 0.27, 9, 2, o.scarf);
  ctx.fillStyle = '#D9A877';
  ctx.beginPath();
  ctx.arc(x, y + h * 0.16, h * 0.14, 0, Math.PI * 2);
  ctx.fill();
  if (o.cap) box(ctx, x - h * 0.15, y + h * 0.02, h * 0.3, h * 0.08, o.cap);
}
