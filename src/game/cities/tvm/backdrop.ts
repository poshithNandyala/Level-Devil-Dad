import type { Theme } from '../../../render/theme';
import { Ctx, ellipse, hash, withAlpha } from '../../../render/art/common';
import { glow, palm, ridge, tiledHouse } from '../../../render/backdrops-south';

// --------------------------------------------------------------- Kerala
export function thiruvananthapuram(ctx: Ctx, th: Theme, x0: number, x1: number) {
  glow(ctx, 410, 62, 16, th.sun);
  // monsoon clouds
  for (const [cx, cy, s] of [
    [120, 46, 1.4],
    [330, 30, 1.1],
    [520, 56, 1.2],
    [-60, 60, 1],
  ] as const) {
    if (cx < x0 - 80 || cx > x1 + 80) continue;
    ellipse(ctx, cx, cy, 30 * s, 9 * s, 'rgba(255,255,255,0.6)');
    ellipse(ctx, cx + 16 * s, cy - 6 * s, 18 * s, 9 * s, 'rgba(255,255,255,0.6)');
    ellipse(ctx, cx - 14 * s, cy + 2 * s, 14 * s, 6 * s, 'rgba(225,240,236,0.6)');
  }
  ridge(ctx, x0, x1, 170, 34, 0.012, 1.3, th.far);
  // a distant stepped tower and a colonnaded civic front: generic silhouettes
  ctx.fillStyle = th.far;
  const gx = 120;
  for (let i = 0; i < 6; i++) ctx.fillRect(gx - 24 + i * 4, 168 - i * 11, 48 - i * 8, 12);
  ctx.fillRect(gx - 2, 98, 4, 6);
  ctx.fillStyle = withAlpha('#FFFFFF', 0.25);
  ctx.fillRect(330, 176, 110, 30);
  ctx.fillStyle = withAlpha('#FFFFFF', 0.35);
  for (let i = 0; i < 9; i++) ctx.fillRect(334 + i * 12, 180, 4, 26);
  ctx.beginPath();
  ctx.moveTo(326, 177);
  ctx.lineTo(385, 160);
  ctx.lineTo(444, 177);
  ctx.fill();
  ridge(ctx, x0, x1, 210, 20, 0.02, 4.1, th.mid);
  // tiled roofs and palms
  for (let x = Math.floor(x0 / 56) * 56 - 56; x < x1 + 56; x += 56) {
    const w = 26 + hash(x, 3) * 12;
    tiledHouse(ctx, x + hash(x, 4) * 16, 236, w, 18 + hash(x, 5) * 8, '#F2E9D8', '#B5502E');
  }
  for (let x = Math.floor(x0 / 38) * 38 - 38; x < x1 + 38; x += 38) {
    palm(ctx, x + hash(x, 6) * 20, 240, 46 + hash(x, 7) * 22, (hash(x, 8) - 0.5) * 18, '#6E5434', '#3E8E4A');
  }
}
