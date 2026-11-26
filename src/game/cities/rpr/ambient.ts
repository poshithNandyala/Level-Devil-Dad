import { Ctx, hash } from '../../../render/art/common';

/** the animated layer drawn every frame over the cached backdrop (rain, birds, kites, mist) */
export function ambient(ctx: Ctx, x0: number, x1: number, t: number, reduced: boolean) {
  // (was backdrops-west.ts ambientWest)
  if (!reduced) {
    // egrets drifting over the paddy
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (let i = 0; i < 5; i++) {
      const span = x1 - x0 + 80;
      const x = x0 - 40 + ((hash(i, 81) * span + t * (10 + i * 2)) % span);
      const y = 110 + hash(i, 83) * 50 + Math.sin(t + i) * 4;
      const f = Math.sin(t * 6 + i * 2) * 2.5;
      ctx.fillRect(x - 3, y, 6, 1.5);
      ctx.fillRect(x - 1, y - f, 2, Math.abs(f) + 1);
      ctx.fillRect(x + 3, y - 1, 2, 1);
    }
  }
}
