import { Ctx, hash } from '../../../render/art/common';

/** the animated layer drawn every frame over the cached backdrop (rain, birds, kites, mist) */
export function ambient(ctx: Ctx, x0: number, x1: number, t: number, reduced: boolean) {
  // (was backdrops-south.ts ambientSouth)
  if (!reduced) {
    // light monsoon rain
    ctx.strokeStyle = 'rgba(230,245,255,0.35)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    for (let i = 0; i < 60; i++) {
      const rx = x0 + ((hash(i, 1) * (x1 - x0) + t * 24) % (x1 - x0));
      const ry = (hash(i, 2) * 300 + t * 300) % 300;
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 2, ry + 8);
    }
    ctx.stroke();
  }
  // (was backgrounds.ts ambientVibe)
  if (!reduced) {
    const span = Math.max(1, x1 - x0);
    // low monsoon mist drifting across the hills
    for (let i = 0; i < 4; i++) {
      const mx = x0 + ((hash(i, 81) * span + t * 6) % span),
        my = 120 + i * 18;
      const g = ctx.createRadialGradient(mx, my, 0, mx, my, 70);
      g.addColorStop(0, 'rgba(235,245,240,0.22)');
      g.addColorStop(1, 'rgba(235,245,240,0)');
      ctx.fillStyle = g;
      ctx.fillRect(mx - 70, my - 30, 140, 60);
    }
  }
}
