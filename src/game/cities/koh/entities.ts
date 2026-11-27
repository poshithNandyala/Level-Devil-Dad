// Kohima's own entities (the Rig kit, same shape as Patna's). One small kit does the work: a Rig is a box that can be solid (Dad stands on it, it can
// carry him) and/or deadly, moved and drawn by closures, so each mechanic reads as stage directions.
// Deterministic: no Math.random, Date or real time (AGENTS.md, bar 6).
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
  /** only update while Dad is within this many px (far-off pieces of a long stage cost nothing) */
  near?: number;
  /** is the deadly box live right now? (default: when `on`) */
  live?: (r: Rig, w: World) => boolean;
  /** runs every tick, before Dad moves */
  tick?: (r: Rig, w: World) => void;
  paint: (ctx: CanvasRenderingContext2D, r: Rig, w: World) => void;
}

/** a box with a solid and/or a hazard, driven by closures */
export class Rig extends Entity {
  solid?: Solid;
  hazard?: Hazard;
  on = true;
  /** free scratch for the stage's closures (and the tests) */
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
    if (this.o.near && Math.abs(w.player.x - this.x) > this.o.near) return;
    this.o.tick?.(this, w);
  }
  /** move to (x, y); a solid carries whoever stands on it */
  moveTo(w: World, x: number, y: number) {
    if (this.solid) {
      this.solid.moveBy(w, x - this.solid.x, y - this.solid.y);
      this.x = this.solid.x;
      this.y = this.solid.y;
    } else {
      this.x = x;
      this.y = y;
    }
  }
  /** a solid can be switched off (a thing that has gone) */
  setSolid(on: boolean) {
    if (this.solid) this.solid.collidable = on;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (this.on) this.o.paint(ctx, this, w);
  }
}

/** px per second -> px per tick */
export const perTick = (v: number) => v / 120;

/** a flat colour box (for quick pieces) */
export const box = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string) => {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
};

/** a little person: shirt colour, optional head load (sack) */
export function folk(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, shirt: string, o: { sack?: string; face?: number } = {}) {
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(x - 4, y + h - 1, 9, 2);
  ctx.fillStyle = '#3A3340';
  ctx.fillRect(x - 3, y + h * 0.62, 2.5, h * 0.38);
  ctx.fillRect(x + 0.5, y + h * 0.62, 2.5, h * 0.38);
  ctx.fillStyle = shirt;
  ctx.fillRect(x - 4, y + h * 0.28, 8, h * 0.38);
  ctx.fillStyle = '#C68B59';
  ctx.beginPath();
  ctx.arc(x, y + h * 0.17, h * 0.15, 0, Math.PI * 2);
  ctx.fill();
  if (o.sack) {
    ctx.fillStyle = o.sack;
    ctx.fillRect(x - 5, y - h * 0.12, 10, h * 0.2);
  }
}
