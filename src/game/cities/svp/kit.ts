// Small shared pieces for Sri Vijaya Puram's stages: a solid that draws itself, a deadly box, rain, awnings.
import { Entity, type Hazard, type World } from '../../world';
import { Solid } from '../../body';
import { DT, TILE } from '../../constants';
import { overlapXYWH } from '../../constants';

export type Ctx = CanvasRenderingContext2D;
export const FLOOR = 15 * TILE;
export const px = (t: number) => t * TILE;
export const TAU = Math.PI * 2;

/** a solid with its own picture; `step` runs every tick (before the player) */
export class Plat extends Entity {
  solid: Solid;
  visible = true;
  step: ((w: World, p: Plat) => void) | null = null;
  constructor(
    x: number,
    y: number,
    w: number,
    h: number,
    readonly paint: (ctx: Ctx, p: Plat, w: World) => void,
    o: { oneWay?: boolean; layer?: number; velX?: number } = {},
  ) {
    super();
    this.layer = o.layer ?? 1;
    this.solid = new Solid(x, y, w, h);
    this.solid.oneWay = !!o.oneWay;
    this.solid.velX = o.velX ?? 0;
  }
  get x() {
    return this.solid.x;
  }
  get y() {
    return this.solid.y;
  }
  get w() {
    return this.solid.w;
  }
  get h() {
    return this.solid.h;
  }
  update(w: World) {
    this.step?.(w, this);
  }
  draw(ctx: Ctx, w: World) {
    if (this.visible) this.paint(ctx, this, w);
  }
  hide() {
    this.visible = false;
    this.solid.collidable = false;
  }
  show() {
    this.visible = true;
    this.solid.collidable = true;
  }
}

/** a deadly box (x, y, w, h in px) that the stage can move and switch */
export class Hurt extends Entity {
  hazard: Hazard;
  on = true;
  constructor(
    public x: number,
    public y: number,
    public w: number,
    public h: number,
    cause: string,
    readonly paint: ((ctx: Ctx, h: Hurt, w: World) => void) | null = null,
    layer = 2,
  ) {
    super();
    this.layer = layer;
    const self = this;
    this.hazard = { active: true, cause, hits: (x2, y2, w2, h2) => self.on && overlapXYWH(x2, y2, w2, h2, { x: self.x, y: self.y, w: self.w, h: self.h }) };
  }
  set cause(c: string) {
    this.hazard.cause = c;
  }
  draw(ctx: Ctx, w: World) {
    if (this.on) this.paint?.(ctx, this, w);
  }
}

/** runs `f` each tick, draws `d` each frame: for effects that have no body */
export class Fx extends Entity {
  constructor(
    readonly f: ((w: World) => void) | null,
    readonly d: ((ctx: Ctx, w: World) => void) | null,
    layer = 4,
  ) {
    super();
    this.layer = layer;
  }
  update(w: World) {
    this.f?.(w);
  }
  draw(ctx: Ctx, w: World) {
    this.d?.(ctx, w);
  }
}

/** a padauk plank strip: red wood with grain and a pale edge */
export function plank(ctx: Ctx, x: number, y: number, w: number, h: number, pale = false) {
  ctx.fillStyle = pale ? '#D9B98A' : '#A8442E';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = pale ? '#EBD3A8' : '#C75C3C';
  ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(x, y + h - 2, w, 2);
  ctx.fillRect(x + w - 1, y, 1, h);
  ctx.strokeStyle = pale ? 'rgba(120,80,40,0.35)' : 'rgba(60,20,10,0.35)';
  ctx.lineWidth = 0.8;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 1, y + (h * i) / 3);
    ctx.bezierCurveTo(x + w * 0.3, y + (h * i) / 3 - 1.5, x + w * 0.6, y + (h * i) / 3 + 1.5, x + w - 1, y + (h * i) / 3);
    ctx.stroke();
  }
}

/** rain over [x0, x1] from y0 down to y1 (world px); `a` is its strength 0..1 and `slant` px of lean per streak */
export function rain(ctx: Ctx, w: World, x0: number, x1: number, y0: number, y1: number, a: number, slant = 4) {
  if (a <= 0) return;
  ctx.strokeStyle = `rgba(215,238,248,${(0.55 * a).toFixed(2)})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  const t = w.tick * 3.2;
  for (let x = x0; x < x1; x += 7) {
    const k = (x * 7919) % 97;
    const y = y0 + ((t + k * 3.1) % (y1 - y0 - 10));
    ctx.moveTo(x + (k % 5), y);
    ctx.lineTo(x + (k % 5) + slant, y + 8);
  }
  ctx.stroke();
}

/** a striped canvas awning: spans [x0, x1] at y, drooping to the front edge; `lean` px tilts its far edge */
export function awning(ctx: Ctx, x0: number, x1: number, y: number, col = '#1F7A8C', col2 = '#F4ECD6', lean = 0) {
  const n = Math.max(2, Math.round((x1 - x0) / 8));
  const wd = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = i % 2 ? col2 : col;
    ctx.beginPath();
    ctx.moveTo(x0 + i * wd, y);
    ctx.lineTo(x0 + (i + 1) * wd, y);
    ctx.lineTo(x0 + (i + 1) * wd + lean, y + 9);
    ctx.lineTo(x0 + i * wd + lean, y + 9);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(x0 + lean, y + 9, x1 - x0, 1.5);
  ctx.fillStyle = '#4A3A2A';
  ctx.fillRect(x0 - 1, y - 1, 2, 54);
  ctx.fillRect(x1 - 1, y - 1, 2, 54);
}

/** Dad's centre x, feet y */
export const dadX = (w: World) => w.player.cx;
export const dadFeet = (w: World) => w.player.y + w.player.h;
export { DT };
