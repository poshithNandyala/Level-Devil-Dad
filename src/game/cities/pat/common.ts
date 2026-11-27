// Small helpers every Patna stage shares.
import type { World } from '../../world';
import { lines as L } from './lines';
import { Rig, box } from './entities';

const FL = 240;
/** Tara's script for stage n (02..10): her intro is intro[n - 2] */
export const taraScript = (n: number, beaten = 0) => ({ intro: L.intro[(n - 2) % L.intro.length], point: 1 as const, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[beaten % L.beaten.length] });
/** seconds since tick t0 */
export const since = (w: World, t0: number) => (w.tick - t0) / 120;
/** cycle position in seconds: (time + phase) mod period */
export const cyc = (w: World, period: number, phase = 0) => (((w.tick / 120 + phase) % period) + period) % period;

/** a pestle-like column that drops from the sky for `down` seconds each `period` (a Rig deadly while down) */
export function column(w: World, x: number, wd: number, period: number, phase: number, down: number, cause: string, art: (ctx: CanvasRenderingContext2D, r: Rig, lowered: number) => void): Rig {
  const r = w.add(
    new Rig(x, 0, wd, FL, {
      layer: 3,
      cause,
      inset: 3,
      live: (_r, w2) => cyc(w2, period, phase) < down,
      paint: (ctx, rr2, w2) => {
        const t = cyc(w2, period, phase);
        // rises in the last 0.35 s before dropping (telegraph) and falls fast
        const lowered = t < down ? 1 : t > period - 0.45 ? 0.15 + 0.1 * Math.sin(t * 30) : 0;
        art(ctx, rr2, lowered);
      },
    }),
  );
  r.s = { period, phase, down };
  return r;
}

/** a flat box drawn only (decor) */
export const decor = (w: World, layer: number, f: (ctx: CanvasRenderingContext2D, w: World) => void) => {
  const e = w.add(new Rig(0, 0, 0, 0, { layer, paint: (ctx, _r, w2) => f(ctx, w2) }));
  return e;
};
export { box };
