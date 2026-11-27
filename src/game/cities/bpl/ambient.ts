import { Ctx, hash } from '../../../render/art/common';

/** the animated layer drawn every frame over the cached backdrop (rain, birds, kites, mist) */
export function ambient(ctx: Ctx, x0: number, x1: number, t: number, reduced: boolean) {
  // (was backdrops-west.ts ambientWest)
  if (!reduced) {
    // gulls and the odd painted stork over the lake
    ctx.strokeStyle = 'rgba(250,250,250,0.85)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const span = x1 - x0 + 80;
      const x = x0 - 40 + ((hash(i, 91) * span + t * (12 + i * 3)) % span);
      const y = 70 + hash(i, 93) * 70 + Math.sin(t * 1.2 + i) * 5;
      const f = Math.sin(t * 7 + i * 2) * 2.5;
      ctx.beginPath();
      ctx.moveTo(x - 4, y - f);
      ctx.quadraticCurveTo(x - 2, y - 1, x, y);
      ctx.quadraticCurveTo(x + 2, y - 1, x + 4, y - f);
      ctx.stroke();
    }
  }
}
