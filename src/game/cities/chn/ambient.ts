import { Ctx, hash } from '../../../render/art/common';

/** the animated layer drawn every frame over the cached backdrop (rain, birds, kites, mist) */
export function ambient(ctx: Ctx, x0: number, x1: number, t: number, reduced: boolean) {
  // (was backdrops-south.ts ambientSouth)
  {
    // a train sliding along the elevated line
    const span = x1 - x0 + 200;
    const mx = x0 - 100 + ((t * 36) % span);
    ctx.fillStyle = '#E9E2D0';
    ctx.fillRect(mx, 150, 70, 9);
    ctx.fillStyle = '#C62828';
    ctx.fillRect(mx, 156, 70, 2);
  }
  // (was backgrounds.ts ambientVibe)
  if (!reduced) {
    const span = Math.max(1, x1 - x0);
    // crows crossing the hot sky
    ctx.strokeStyle = 'rgba(40,30,30,0.6)';
    ctx.lineWidth = 0.9;
    for (let i = 0; i < 5; i++) {
      const bx = x0 + ((hash(i, 71) * span + t * (26 + i * 3)) % span),
        by = 40 + hash(i, 72) * 60 + Math.sin(t * 2 + i) * 4;
      const flap = Math.sin(t * 9 + i) * 2;
      ctx.beginPath();
      ctx.moveTo(bx - 4, by - flap);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + 4, by - flap);
      ctx.stroke();
    }
  }
}
