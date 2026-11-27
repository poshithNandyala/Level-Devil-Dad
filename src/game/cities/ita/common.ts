// Small helpers every Itanagar stage shares.
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
/** a drawn-only layer (decor) */
export const decor = (w: World, layer: number, f: (ctx: CanvasRenderingContext2D, w: World) => void) => w.add(new Rig(0, 0, 0, 0, { layer, paint: (ctx, _r, w2) => f(ctx, w2) }));
export { box };
