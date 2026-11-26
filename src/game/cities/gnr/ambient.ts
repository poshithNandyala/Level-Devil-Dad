import { Ctx, hash } from '../../../render/art/common';

/** the animated layer drawn every frame over the cached backdrop (rain, birds, kites, mist) */
export function ambient(ctx: Ctx, x0: number, x1: number, t: number, reduced: boolean) {
  // (was backdrops-west.ts ambientWest)
  if (!reduced) {
    // Uttarayan: the sky full of kites, tugging on their strings
    const cols = ['#E53935', '#FFB300', '#43A047', '#1E88E5', '#8E24AA', '#F06292'];
    const span = x1 - x0 + 60;
    for (let i = 0; i < 12; i++) {
      const kx = x0 - 30 + ((hash(i, 41) * span + t * (4 + (i % 3))) % span),
        ky = 30 + hash(i, 42) * 90 + Math.sin(t * 1.3 + i) * 5;
      const sw = Math.sin(t * 2 + i) * 0.25;
      ctx.save();
      ctx.translate(kx, ky);
      ctx.rotate(sw);
      ctx.fillStyle = cols[i % cols.length];
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(5, 0);
      ctx.lineTo(0, 7);
      ctx.lineTo(-5, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(-0.4, -6, 0.8, 13);
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(kx, ky + 7);
      ctx.quadraticCurveTo(kx + 10, ky + 60, kx + 30 - (i % 4) * 14, 240);
      ctx.stroke();
    }
  }
}
