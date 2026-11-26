import { Ctx, hash } from '../../../render/art/common';

/** the animated layer drawn every frame over the cached backdrop (rain, birds, kites, mist) */
export function ambient(ctx: Ctx, x0: number, x1: number, t: number, reduced: boolean) {
  // (was backgrounds.ts ambientVibe)
  if (!reduced) {
    const span = Math.max(1, x1 - x0);
    // monsoon lightning, now and then
    const k = t % 7.3;
    if (k < 0.16 || (k > 0.24 && k < 0.3)) {
      ctx.fillStyle = 'rgba(210,225,255,0.22)';
      ctx.fillRect(x0, 0, span, 240);
    }
  }
  // (was backgrounds.ts drawAmbient)
  if (!reduced) {
    // monsoon drizzle
    ctx.strokeStyle = 'rgba(200,215,255,0.28)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    for (let i = 0; i < 70; i++) {
      const rx = x0 + ((hash(i, 1) * (x1 - x0) + t * 30) % (x1 - x0));
      const ry = (hash(i, 2) * 300 + t * 260) % 300;
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 2, ry + 7);
    }
    ctx.stroke();
  }
}
