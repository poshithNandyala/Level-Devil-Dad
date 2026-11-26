import { Ctx, hash } from '../../../render/art/common';

/** the animated layer drawn every frame over the cached backdrop (rain, birds, kites, mist) */
export function ambient(ctx: Ctx, x0: number, x1: number, t: number, reduced: boolean) {
  // (was backdrops-south.ts ambientSouth)
  if (!reduced) {
    // heat shimmer
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i < 3; i++) ctx.fillRect(x0, 120 + i * 30 + Math.sin(t * 2 + i) * 3, x1 - x0, 1.5);
  }
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
    // warm dust hanging in the heat
    drift(30, 51, 4, 14, (x, y) => {
      ctx.fillStyle = 'rgba(255,214,150,0.55)';
      ctx.fillRect(x, y, 1.4, 1.4);
    });
  }
}
