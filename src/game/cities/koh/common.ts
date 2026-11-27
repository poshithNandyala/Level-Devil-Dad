// Small helpers every Kohima stage shares.
import type { World } from '../../world';
import { lines as L } from './lines';
import { Rig, box, folk } from './entities';

export const FL = 240;
/** Tara's script for stage n (02..10): her intro is intro[n - 2] */
export const taraScript = (n: number, beaten = 0) => ({ intro: L.intro[(n - 2) % L.intro.length], point: 1 as const, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[beaten % L.beaten.length] });
/** seconds since tick t0 */
export const since = (w: World, t0: number) => (w.tick - t0) / 120;
/** cycle position in seconds: (time + phase) mod period */
export const cyc = (w: World, period: number, phase = 0) => (((w.tick / 120 + phase) % period) + period) % period;
/** a flat box drawn only (decor) */
export const decor = (w: World, layer: number, f: (ctx: CanvasRenderingContext2D, w: World) => void) => w.add(new Rig(0, 0, 0, 0, { layer, paint: (ctx, _r, w2) => f(ctx, w2) }));

/** a deadly strip of water or mud at the foot of a ditch: x0..x1 px, top at y */
export function ditch(w: World, x0: number, x1: number, cause: string, y = FL + 10, colors: [string, string] = ['rgba(90,110,96,0.92)', 'rgba(40,52,46,0.97)']) {
  return w.add(
    new Rig(x0, y, x1 - x0, 48, {
      layer: 4,
      cause,
      inset: 0,
      paint: (ctx, r, w2) => {
        const g = ctx.createLinearGradient(0, r.y - 4, 0, r.y + 40);
        g.addColorStop(0, colors[0]);
        g.addColorStop(1, colors[1]);
        ctx.fillStyle = g;
        ctx.fillRect(r.x, r.y - 4, r.w, 48);
        ctx.strokeStyle = 'rgba(230,236,239,0.45)';
        ctx.lineWidth = 0.8;
        for (let x = r.x + ((w2.tick * 0.25) % 12); x < r.x + r.w - 5; x += 12) {
          ctx.beginPath();
          ctx.moveTo(x, r.y - 2);
          ctx.lineTo(x + 5, r.y - 2);
          ctx.stroke();
        }
      },
    }),
  );
}

/** a bamboo rod drawn horizontally: x, y top, length, thickness */
export function bamboo(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, th: number, spin = 0) {
  box(ctx, x, y, len, th, '#C9B870');
  box(ctx, x, y, len, Math.max(1, th * 0.3), '#E6D898');
  box(ctx, x, y + th - 1, len, 1, '#8A7A3A');
  // the nodes: they move when the rod spins
  ctx.fillStyle = '#8A7A3A';
  for (let k = ((spin * 6) % 14 + 14) % 14; k < len; k += 14) ctx.fillRect(x + k, y, 1, th);
}

export { box, folk, Rig };
