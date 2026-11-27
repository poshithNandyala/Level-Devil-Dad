import { Ctx, hash } from '../../../render/art/common';

/** the animated layer drawn every frame over the cached backdrop (rain, birds, kites, mist) */
export function ambient(ctx: Ctx, x0: number, x1: number, t: number, reduced: boolean) {
  // (was backdrops-west.ts ambientWest)
  if (!reduced) {
    // pigeons wheeling over the pink city
    ctx.fillStyle = 'rgba(90,90,110,0.75)';
    for (let i = 0; i < 9; i++) {
      const span = x1 - x0 + 80;
      const x = x0 - 40 + ((hash(i, 71) * span + t * (18 + i * 2)) % span);
      const y = 60 + hash(i, 73) * 50 + Math.sin(t * 1.5 + i) * 6;
      const f = Math.sin(t * 12 + i * 2) * 2;
      ctx.beginPath();
      ctx.moveTo(x - 3, y - f);
      ctx.lineTo(x, y);
      ctx.lineTo(x + 3, y - f);
      ctx.lineTo(x, y + 1);
      ctx.fill();
    }
  }
}
