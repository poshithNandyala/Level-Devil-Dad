import { Ctx, hash } from '../../../render/art/common';

/** the animated layer drawn every frame over the cached backdrop (rain, birds, kites, mist) */
export function ambient(ctx: Ctx, x0: number, x1: number, t: number, reduced: boolean) {
  // (was backgrounds.ts ambientVibe)
  if (!reduced) {
    const span = Math.max(1, x1 - x0);
    // Sankranti kites high over the old city
    const kc = ['#E53935', '#FDD835', '#1E88E5', '#43A047', '#F06292'];
    for (let i = 0; i < 6; i++) {
      const kx = x0 + ((hash(i, 61) * span + t * 9) % span),
        ky = 34 + hash(i, 62) * 50 + Math.sin(t * 1.1 + i) * 6;
      ctx.strokeStyle = 'rgba(255,230,210,0.35)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(kx, ky + 5);
      ctx.quadraticCurveTo(kx + 10, ky + 60, kx - 20, ky + 140);
      ctx.stroke();
      ctx.fillStyle = kc[i % kc.length];
      ctx.beginPath();
      ctx.moveTo(kx, ky - 5);
      ctx.lineTo(kx + 4, ky);
      ctx.lineTo(kx, ky + 5);
      ctx.lineTo(kx - 4, ky);
      ctx.closePath();
      ctx.fill();
    }
  }
  // (was backgrounds.ts drawAmbient)
  {
    // pigeons circling the Charminar
    ctx.strokeStyle = 'rgba(80,50,40,0.55)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 5; i++) {
      const a = t * 0.6 + i * 1.25;
      const bx = 300 + Math.cos(a) * (60 + i * 6),
        by = 90 + Math.sin(a) * 18 + i * 4;
      const flap = Math.sin(t * 10 + i) * 1.5;
      ctx.beginPath();
      ctx.moveTo(bx - 3, by - flap);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + 3, by - flap);
      ctx.stroke();
    }
  }
}
