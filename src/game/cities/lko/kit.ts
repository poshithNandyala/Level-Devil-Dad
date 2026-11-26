// Lucknow's small shared kit: people drawn in chikan and sherwani, a block that is a floor while some rule
// says so, a deadly box, and how long Dad has been standing still (in Lucknow, standing still is a bow).
import { Entity, type Hazard, type World } from '../../world';
import { Solid } from '../../body';
import { TILE } from '../../constants';

export const FLOOR = 15 * TILE;
export const TAU = Math.PI * 2;
export type Ctx = CanvasRenderingContext2D;
export const px = (t: number) => t * TILE;

/** a person side on; `bow` (0..1) bends the body forward from the hips, `topi` draws a cap */
export function gent(ctx: Ctx, x: number, feet: number, h: number, cloth: string, o: { face?: 1 | -1; bow?: number; topi?: string; skin?: string; legs?: string; dupatta?: string; arms?: number } = {}) {
  const skin = o.skin ?? '#B07A52';
  const f = o.face ?? 1;
  const bow = o.bow ?? 0;
  const bw = Math.max(5, Math.round(h * 0.4));
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(x, feet, bw * 0.75, 1.5, 0, 0, TAU);
  ctx.fill();
  // churidar legs
  ctx.fillStyle = o.legs ?? '#F2EEE4';
  ctx.fillRect(x - bw / 2 + 1, feet - h * 0.36, bw / 2 - 1.2, h * 0.36);
  ctx.fillRect(x + 0.4, feet - h * 0.36, bw / 2 - 1.2, h * 0.36);
  // the long kurta or sherwani, bending forward at the hips when he bows
  const hipY = feet - h * 0.36;
  const lean = bow * h * 0.42 * f;
  const drop = bow * h * 0.22;
  ctx.fillStyle = cloth;
  ctx.beginPath();
  ctx.moveTo(x - bw / 2 - 1, hipY + h * 0.1);
  ctx.lineTo(x + bw / 2 + 1, hipY + h * 0.1);
  ctx.lineTo(x + bw / 2 + lean, hipY - h * 0.42 + drop);
  ctx.lineTo(x - bw / 2 + lean, hipY - h * 0.42 + drop);
  ctx.closePath();
  ctx.fill();
  // chikan buttis on the kurta
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let k = 0; k < 3; k++) ctx.fillRect(x - 1 + lean * (0.3 + k * 0.25), hipY - h * (0.08 + k * 0.11) + drop * (k * 0.3), 1.2, 1.2);
  if (o.dupatta) {
    ctx.fillStyle = o.dupatta;
    ctx.fillRect(x - bw / 2 + lean * 0.7, hipY - h * 0.4 + drop, 2, h * 0.36);
  }
  // the hand to the forehead: aadaab
  ctx.strokeStyle = skin;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  const sx = x + lean * 0.9 + f * bw * 0.3,
    sy = hipY - h * 0.36 + drop;
  ctx.moveTo(sx, sy);
  if (bow > 0.2) ctx.lineTo(sx + f * 3, sy - h * 0.12);
  else ctx.lineTo(sx + f * 1.5, sy + h * (0.25 - 0.4 * (o.arms ?? 0)));
  ctx.stroke();
  // head
  const hx = x + lean * 1.15,
    hy = hipY - h * 0.5 + drop * 1.6;
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(hx, hy, h * 0.12, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#1D1A1A';
  ctx.beginPath();
  ctx.arc(hx - f * 1, hy + h * 0.04, h * 0.08, 0, Math.PI);
  ctx.fill();
  if (o.topi) {
    ctx.fillStyle = o.topi;
    ctx.fillRect(hx - h * 0.12, hy - h * 0.17, h * 0.24, h * 0.08);
  }
  ctx.fillStyle = '#1D1A26';
  ctx.fillRect(hx + f * h * 0.05, hy - 1, 1.1, 1.1);
}

/** A rectangle that is solid while `on`; it draws itself with `paint`. */
export class Block extends Entity {
  solid: Solid;
  on = true;
  constructor(
    x: number,
    y: number,
    w: number,
    h: number,
    readonly paint: (ctx: Ctx, b: Block, w: World) => void,
    layer = 1,
  ) {
    super();
    this.layer = layer;
    this.solid = new Solid(x, y, w, h);
  }
  set(on: boolean) {
    this.on = on;
    this.solid.collidable = on;
  }
  /** move it by px (carries whoever stands on it) */
  move(w: World, dx: number, dy: number) {
    this.solid.moveBy(w, dx, dy);
  }
  get x() {
    return this.solid.x;
  }
  get y() {
    return this.solid.y;
  }
  draw(ctx: Ctx, w: World) {
    this.paint(ctx, this, w);
  }
}

/** a deadly box (active while `on`) drawn by `paint` */
export class Zone extends Entity {
  hazard: Hazard;
  on = true;
  constructor(
    public x: number,
    public y: number,
    public w: number,
    public h: number,
    cause: string,
    readonly paint: ((ctx: Ctx, z: Zone, w: World) => void) | null = null,
    layer = 2,
  ) {
    super();
    this.layer = layer;
    const self = this;
    this.hazard = { active: true, cause, hits: (x, y, ww, hh) => self.on && x < self.x + self.w && x + ww > self.x && y < self.y + self.h && y + hh > self.y };
  }
  draw(ctx: Ctx, w: World) {
    this.paint?.(ctx, this, w);
  }
}

/** a drawn-only layer */
export class Art extends Entity {
  constructor(
    readonly f: (ctx: Ctx, w: World) => void,
    layer = -3,
  ) {
    super();
    this.layer = layer;
  }
  draw(ctx: Ctx, w: World) {
    this.f(ctx, w);
  }
}

/** ticks Dad has stood still on the ground (no left, no right): in Lucknow that's a bow */
export function stillness(w: World): () => number {
  const k = '__lkoStill';
  if (!w.flags[k]) {
    const st = { n: 0 };
    w.flags[k] = st;
    w.onTick((w2) => {
      const p = w2.player;
      st.n = p.onGround && !w2.input.left && !w2.input.right && Math.abs(p.vx) < 1 ? st.n + 1 : 0;
    });
  }
  const st = w.flags[k] as { n: number };
  return () => st.n;
}

/** is Dad standing on this solid? */
export const on = (w: World, s: Solid) => w.player.onGround && w.player.isRiding(s);

/** a little cloth bow-icon over Dad while he stands still (the polite answer) */
export function bowIcon(w: World, still: () => number, need = 36) {
  w.add(
    new Art((ctx, w2) => {
      const n = still();
      if (n < 8 || w2.state !== 'play') return;
      const p = w2.player;
      const a = Math.min(1, n / need);
      ctx.strokeStyle = `rgba(255,255,255,${0.35 + 0.5 * a})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(p.cx, p.y - 5, 4, Math.PI * 1.1, Math.PI * 1.1 + TAU * a);
      ctx.stroke();
    }, 6),
  );
}
