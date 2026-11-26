import { Ctx, circle, hash, withAlpha } from './art/common';

/*
 * Backdrops for the western chapters. World units: the room is 512x288 and the
 * playfield ground usually sits around y=240.
 */

export function sunGlow(ctx: Ctx, x: number, y: number, r: number, color: string) {
  const g = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 3.4);
  g.addColorStop(0, withAlpha(color, 0.55));
  g.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r * 3.4, y - r * 3.4, r * 6.8, r * 6.8);
  circle(ctx, x, y, r, color);
}

