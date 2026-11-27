// Small helpers every Bhubaneswar stage shares.
import type { World } from '../../world';
import type { Act } from '../../levels/acts';
import { px } from '../../levels/kit';
import { lines as L } from './lines';
import { Rig, box } from './entities';

export const FL = 240;
/** Tara's script for stage n (02..10): her intro is intro[n - 2] */
export const taraScript = (n: number, beaten = 0) => ({ intro: L.intro[(n - 2) % L.intro.length], point: 1 as const, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[beaten % L.beaten.length] });
/**
 * Law 9 (QA fix F1): inside this act a death is renamed to the act's own cause, so Tara's line names what killed
 * you here and never repeats the advice another stage taught (the finale breaks those rules). `map` takes the cause
 * a shared hazard reports to this act's cause; deaths elsewhere keep theirs.
 */
export function ownCauses(a: Act, map: Record<string, string>): Act {
  return {
    ...a,
    build: (w, c) => {
      a.build?.(w, c);
      const list = (w.flags.bbiOwnCauses ??= []) as { x0: number; x1: number; map: Record<string, string> }[];
      if (!list.length) {
        const die = w.die.bind(w);
        w.die = (cause, who) => {
          const x = w.player.cx;
          const r = list.find((e) => x >= e.x0 && x < e.x1);
          die(r?.map[cause] ?? cause, who);
        };
      }
      list.push({ x0: c.X(0), x1: c.X(a.w), map });
    },
  };
}
/** seconds since tick t0 */
export const since = (w: World, t0: number) => (w.tick - t0) / 120;
/** (time + phase) mod period, in seconds */
export const cyc = (w: World, period: number, phase = 0) => (((w.tick / 120 + phase) % period) + period) % period;

/**
 * A sunken channel across columns c0..c1 (cut with g.pit): anything falling in dies of `cause` at its bottom.
 */
export function channel(w: World, c0: number, c1: number, cause: string, look: 'drain' | 'spikes' | 'water' = 'drain') {
  return w.add(
    new Rig(px(c0), FL + 18, px(c1 - c0 + 1), 60, {
      cause,
      inset: 0,
      layer: 1,
      paint: (ctx, r) => {
        box(ctx, r.x, FL, r.w, 48, '#3B2416');
        if (look === 'water') {
          box(ctx, r.x, FL + 20, r.w, 28, '#5E7F86');
          for (let x = r.x + 3; x < r.x + r.w - 4; x += 9) box(ctx, x, FL + 22, 5, 1, '#9FC2C4');
        } else if (look === 'spikes') {
          ctx.fillStyle = '#FFF3E0';
          for (let x = r.x; x < r.x + r.w; x += 8) {
            ctx.beginPath();
            ctx.moveTo(x, FL + 34);
            ctx.lineTo(x + 4, FL + 20);
            ctx.lineTo(x + 8, FL + 34);
            ctx.fill();
          }
        } else {
          box(ctx, r.x, FL + 22, r.w, 26, '#2E3B33');
          for (let x = r.x + 2; x < r.x + r.w - 4; x += 11) box(ctx, x, FL + 24, 6, 1, '#55705E');
        }
        box(ctx, r.x, FL, 2, 48, '#7A3A1F');
        box(ctx, r.x + r.w - 2, FL, 2, 48, '#7A3A1F');
      },
    }),
  );
}

/** a flat painted layer (decor only) */
export const decor = (w: World, layer: number, f: (ctx: CanvasRenderingContext2D, w: World) => void) => w.add(new Rig(0, 0, 0, 0, { layer, paint: (ctx, _r, w2) => f(ctx, w2) }));
