// Small helpers every Shillong stage shares.
import type { World } from '../../world';
import { lines as L } from './lines';
import { Rig, box } from './entities';

export const FL = 240;
/** Tara's script for stage n (02..10): her intro is intro[n - 2] */
export const taraScript = (n: number, beaten = 0) => ({ intro: L.intro[(n - 2) % L.intro.length], point: 1 as const, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[beaten % L.beaten.length] });
/** seconds since tick t0 */
export const since = (w: World, t0: number) => (w.tick - t0) / 120;
/** cycle position in seconds: (time + phase) mod period */
export const cyc = (w: World, period: number, phase = 0) => (((w.tick / 120 + phase) % period) + period) % period;

/** a flat box drawn only (decor) */
export const decor = (w: World, layer: number, f: (ctx: CanvasRenderingContext2D, w: World) => void) => {
  const e = w.add(new Rig(0, 0, 0, 0, { layer, paint: (ctx, _r, w2) => f(ctx, w2) }));
  return e;
};

/** rain: a curtain of slanting drops between x0 and x1, from y0 down to the floor */
export function rainArt(ctx: CanvasRenderingContext2D, x0: number, x1: number, y0: number, t: number, heavy = 1) {
  ctx.fillStyle = heavy > 0.5 ? 'rgba(200,220,235,0.75)' : 'rgba(200,220,235,0.4)';
  const step = heavy > 0.5 ? 5 : 9;
  for (let x = x0; x < x1; x += step) {
    const k = ((x * 7) % 13) / 13;
    const y = y0 + ((t * 420 + k * 200) % (FL - y0));
    ctx.fillRect(Math.round(x + ((t * 60) % 3)), Math.round(y), 1, heavy > 0.5 ? 9 : 6);
  }
}

/** a cloud shape: soft grey lobes between x0 and x1 at height y (px), `dark` 0..1 */
export function cloudArt(ctx: CanvasRenderingContext2D, x0: number, x1: number, y: number, h: number, dark = 0) {
  const g = Math.round(225 - 70 * dark);
  ctx.fillStyle = `rgb(${g},${g + 6},${g + 10})`;
  const w = x1 - x0;
  ctx.beginPath();
  ctx.ellipse(x0 + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 4; i++) {
    const cx = x0 + w * (0.2 + 0.2 * i);
    const r = h * (0.45 + (i % 2) * 0.2);
    ctx.beginPath();
    ctx.arc(cx, y + h * 0.4, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = `rgba(255,255,255,${0.35 - 0.3 * dark})`;
  ctx.beginPath();
  ctx.arc(x0 + w * 0.3, y + h * 0.3, h * 0.35, 0, Math.PI * 2);
  ctx.fill();
}

/** the knup: the bamboo-and-leaf rain shield, wide at the shoulders, tapering to a point, no handle */
export function knupArt(ctx: CanvasRenderingContext2D, x: number, yTop: number, wide = 26, tall = 30, flip = false) {
  ctx.save();
  ctx.translate(x, yTop);
  ctx.fillStyle = '#B9A25A';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(wide / 2, tall * 0.45);
  ctx.lineTo(wide / 2 - 3, tall);
  ctx.lineTo(-wide / 2 + 3, tall);
  ctx.lineTo(-wide / 2, tall * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#7A6530';
  ctx.lineWidth = 1;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.lineTo(i * (wide / 5), tall - 1);
    ctx.stroke();
  }
  ctx.fillStyle = '#8DAA4A';
  ctx.fillRect(-wide / 2 + 3, tall - 4, wide - 6, 3);
  ctx.restore();
  void flip;
}

export { box, Rig };
