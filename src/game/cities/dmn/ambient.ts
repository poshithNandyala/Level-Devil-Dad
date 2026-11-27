import { Ctx, hash } from '../../../render/art/common';

/** the animated layer drawn every frame over the cached backdrop (rain, birds, kites, mist) */
export function ambient(ctx: Ctx, x0: number, x1: number, t: number, reduced: boolean) {
  // (was backdrops-west.ts ambientWest)
  if (!reduced) {
    // gulls wheeling over the river mouth
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 0.9;
    for (let i = 0; i < 5; i++) {
      const a = t * 0.5 + i * 1.3;
      const bx = x0 + ((hash(i, 31) * (x1 - x0) + t * 12) % (x1 - x0)),
        by = 60 + Math.sin(a) * 14 + i * 8;
      const f = Math.sin(t * 7 + i) * 2;
      ctx.beginPath();
      ctx.moveTo(bx - 4, by - f);
      ctx.quadraticCurveTo(bx - 2, by - 2, bx, by);
      ctx.quadraticCurveTo(bx + 2, by - 2, bx + 4, by - f);
      ctx.stroke();
    }
  }
}
