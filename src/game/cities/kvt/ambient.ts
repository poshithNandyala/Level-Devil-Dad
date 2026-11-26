import { Ctx, hash } from '../../../render/art/common';

/** the animated layer drawn every frame over the cached backdrop (rain, birds, kites, mist) */
export function ambient(ctx: Ctx, x0: number, x1: number, t: number, reduced: boolean) {
  // (was backdrops-south.ts ambientSouth)
  {
    // gulls
    ctx.strokeStyle = 'rgba(40,60,70,0.5)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 4; i++) {
      const bx = x0 + ((t * (14 + i * 3) + i * 140) % (x1 - x0 + 60)) - 30;
      const by = 70 + i * 12 + Math.sin(t + i) * 4;
      const f = Math.sin(t * 8 + i) * 2;
      ctx.beginPath();
      ctx.moveTo(bx - 4, by - f);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + 4, by - f);
      ctx.stroke();
    }
  }
  // (was backgrounds.ts ambientVibe)
  if (!reduced) {
    const span = Math.max(1, x1 - x0);
    // the sun glinting on the lagoon
    for (let i = 0; i < 26; i++) {
      const k = (Math.sin(t * 2.2 + i * 1.7) + 1) / 2;
      if (k < 0.75) continue;
      const x = x0 + hash(i, 41) * span,
        y = 176 + hash(i, 42) * 40;
      ctx.strokeStyle = `rgba(255,255,255,${((k - 0.75) * 3.6).toFixed(2)})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x - 3, y);
      ctx.lineTo(x + 3, y);
      ctx.moveTo(x, y - 2);
      ctx.lineTo(x, y + 2);
      ctx.stroke();
    }
  }
}
