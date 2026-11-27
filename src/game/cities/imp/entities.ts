// Imphal's own entities. One small kit does the work (the same shape Patna used): a Rig is a box that can be
// solid (Dad stands on it, it can carry him) and/or deadly, moved and drawn by closures, so each mechanic reads
// as stage directions. Deterministic: no Math.random, Date or real time (AGENTS.md, bar 6).
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
  /** only update while Dad is within this many px */
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

/** a little person: shirt colour, optional head load */
export function folk(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, shirt: string, o: { load?: string; phanek?: string } = {}) {
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(x - 4, y + h - 1, 9, 2);
  ctx.fillStyle = o.phanek ?? '#3A3340';
  ctx.fillRect(x - 3, y + h * 0.62, 2.5, h * 0.38);
  ctx.fillRect(x + 0.5, y + h * 0.62, 2.5, h * 0.38);
  ctx.fillStyle = shirt;
  ctx.fillRect(x - 4, y + h * 0.28, 8, h * 0.38);
  ctx.fillStyle = '#C68B59';
  ctx.beginPath();
  ctx.arc(x, y + h * 0.17, h * 0.15, 0, Math.PI * 2);
  ctx.fill();
  if (o.load) {
    ctx.fillStyle = o.load;
    ctx.fillRect(x - 5, y - h * 0.12, 10, h * 0.2);
  }
}

/** a phumdi mat: a green-brown floating mass, drawn from its box */
export function matArt(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, o: { reeds?: boolean; dull?: boolean } = {}) {
  box(ctx, x, y + 2, w, h - 2, o.dull ? '#5E5A3C' : '#6B7A3A');
  box(ctx, x, y, w, 3, o.dull ? '#8A8458' : '#9DB15A');
  for (let i = 0; i < w; i += 7) box(ctx, x + i + ((i * 3) % 4), y + 1, 2, 2, '#C9D17A');
  if (o.reeds) for (let i = 4; i < w - 2; i += 6) box(ctx, x + i, y - 9 - ((i * 5) % 4), 1, 10 + ((i * 5) % 4), '#7F9A3B');
  box(ctx, x, y + h - 2, w, 2, 'rgba(20,40,50,0.35)');
}

/** the water of Loktak: a dark green-blue band from `yTop` down (decor; the kill is a pool) */
export function lakeArt(ctx: CanvasRenderingContext2D, x0: number, x1: number, yTop: number, tick: number) {
  box(ctx, x0, yTop, x1 - x0, 288 - yTop, '#2F5E62');
  ctx.strokeStyle = 'rgba(200,230,220,0.35)';
  ctx.lineWidth = 1;
  for (let x = x0 + ((tick * 0.25) % 14); x < x1 - 6; x += 14) {
    ctx.beginPath();
    ctx.moveTo(x, yTop + 1.5);
    ctx.lineTo(x + 6, yTop + 1.5);
    ctx.stroke();
  }
}
