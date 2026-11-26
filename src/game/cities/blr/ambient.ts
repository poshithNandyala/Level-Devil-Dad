import { Ctx, hash, rr } from '../../../render/art/common';

/** the animated layer drawn every frame over the cached backdrop (rain, birds, kites, mist) */
export function ambient(ctx: Ctx, x0: number, x1: number, t: number, reduced: boolean) {
  // (was backgrounds.ts ambientVibe)
  if (!reduced) {
    const span = Math.max(1, x1 - x0);
    const drift = (n: number, seed: number, fall: number, sway: number, f: (x: number, y: number, i: number) => void) => {
      for (let i = 0; i < n; i++) {
        const x = x0 + ((hash(i, seed) * span + t * (12 + hash(i, seed + 1) * 18)) % span);
        const y = (hash(i, seed + 2) * 300 + t * fall * (0.6 + hash(i, seed + 3) * 0.8)) % 300;
        f(x + Math.sin(t * 1.3 + i) * sway, y - 10, i);
      }
    };
    // jacaranda (lavender) in the garden city
    const cols = ['#B39DDB', '#9575CD', '#CE93D8'];
    drift(26, 37, 22, 9, (x, y, i) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t * (1 + (i % 3)) + i);
      ctx.fillStyle = cols[i % 3];
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.ellipse(0, 0, 2.4, 1.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
  // (was backgrounds.ts drawAmbient)
  {
    // metro train on the viaduct
    const span = x1 - x0 + 200;
    const mx = x0 - 100 + ((t * 40) % span);
    ctx.fillStyle = '#8E6CCB';
    rr(ctx, mx, 156, 64, 9, 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let i = 0; i < 6; i++) ctx.fillRect(mx + 4 + i * 10, 158, 6, 3);
  }
}
