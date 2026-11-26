import { Ctx, circle, hash } from '../../../render/art/common';

/** the animated layer drawn every frame over the cached backdrop (rain, birds, kites, mist) */
export function ambient(ctx: Ctx, x0: number, x1: number, t: number, reduced: boolean) {
  // (was backdrops-west.ts ambientWest)
  if (!reduced) {
    const span = x1 - x0 + 40;
    for (let i = 0; i < 7; i++) {
      const lx = x0 - 20 + ((hash(i, 21) * span + t * (6 + i)) % span),
        ly = 70 + hash(i, 22) * 60 + Math.sin(t * 0.8 + i) * 4;
      const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 9);
      g.addColorStop(0, 'rgba(255,214,140,0.5)');
      g.addColorStop(1, 'rgba(255,214,140,0)');
      ctx.fillStyle = g;
      ctx.fillRect(lx - 9, ly - 9, 18, 18);
      circle(ctx, lx, ly, 1.2, 'rgba(255,236,190,0.9)');
    }
  }
}
