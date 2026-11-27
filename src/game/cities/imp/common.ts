// Small helpers every Imphal stage shares.
import type { World } from '../../world';
import { pool } from '../../levels/acts';
import { Paint } from '../../levels/endkit';
import { px } from '../../levels/kit';
import { lines as L } from './lines';
import { Rig, lakeArt } from './entities';

export const FL = 240;
/** Tara's script for stage n (02..10): her intro is intro[n - 2] */
export const taraScript = (n: number, beaten = 0) => ({ intro: L.intro[(n - 2) % L.intro.length], point: 1 as const, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[beaten % L.beaten.length] });
/** seconds since tick t0 */
export const since = (w: World, t0: number) => (w.tick - t0) / 120;
/** cycle position in seconds: (time + phase) mod period */
export const cyc = (w: World, period: number, phase = 0) => (((w.tick / 120 + phase) % period) + period) % period;

/** a flat box drawn only (decor) */
export const decor = (w: World, layer: number, f: (ctx: CanvasRenderingContext2D, w: World) => void) => w.add(new Rig(0, 0, 0, 0, { layer, paint: (ctx, _r, w2) => f(ctx, w2) }));

/** Loktak water between two columns: deadly a little below its surface (surface at tile row `ty`, default the ground row) */
export const LOKTAK: [string, string] = ['rgba(90,160,150,0.88)', 'rgba(30,70,80,0.96)'];
export function lake(w: World, tx0: number, tx1: number, cause = 'imp-ishing', ty = 15.2) {
  return pool(w, tx0, tx1, ty, { cause, colors: LOKTAK, behind: true });
}
void Paint;
void px;
void lakeArt;

/** a hut on stilts (decor): x = left px, groundY */
export function hut(ctx: CanvasRenderingContext2D, x: number, gy: number, wd = 30) {
  ctx.fillStyle = '#6E4B2A';
  ctx.fillRect(x + 3, gy - 14, 2, 14);
  ctx.fillRect(x + wd - 5, gy - 14, 2, 14);
  ctx.fillStyle = '#A88A5C';
  ctx.fillRect(x, gy - 30, wd, 16);
  ctx.fillStyle = '#4F3A22';
  ctx.beginPath();
  ctx.moveTo(x - 4, gy - 30);
  ctx.lineTo(x + wd / 2, gy - 44);
  ctx.lineTo(x + wd + 4, gy - 30);
  ctx.fill();
  ctx.fillStyle = '#2B2A2A';
  ctx.fillRect(x + wd / 2 - 3, gy - 26, 6, 10);
}
