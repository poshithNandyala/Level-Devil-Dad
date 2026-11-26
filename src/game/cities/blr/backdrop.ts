import { Theme } from '../../../render/theme';
import { Ctx, ellipse, hash } from '../../../render/art/common';
import { sunGlow } from '../../../render/backgrounds';

// ------------------------------------------------------------------ Bengaluru
export function bengaluru(ctx: Ctx, th: Theme, x0: number, x1: number, _variant: number) {
  sunGlow(ctx, 90, 70, 20, th.sun);
  // soft clouds
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (const [cx, cy, s] of [
    [160, 50, 1],
    [400, 34, 1.3],
    [-40, 80, 0.9],
    [560, 70, 1],
  ] as const) {
    if (cx < x0 - 60 || cx > x1 + 60) continue;
    ellipse(ctx, cx, cy, 22 * s, 7 * s, 'rgba(255,255,255,0.55)');
    ellipse(ctx, cx + 12 * s, cy - 5 * s, 14 * s, 7 * s, 'rgba(255,255,255,0.55)');
  }
  // glass towers
  for (let x = Math.floor(x0 / 46) * 46 - 46; x < x1 + 46; x += 46) {
    const h = 70 + hash(x, 7) * 80;
    const w = 26 + hash(x, 8) * 14;
    const tx = x + hash(x, 9) * 10;
    ctx.fillStyle = th.far;
    ctx.fillRect(tx, 220 - h, w, h + 20);
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    for (let wy = 224 - h; wy < 220; wy += 6) ctx.fillRect(tx + 2, wy, w - 4, 1.2);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(tx, 220 - h, w * 0.3, h);
    if (hash(x, 10) > 0.6) {
      ctx.fillStyle = th.far;
      ctx.fillRect(tx + w / 2 - 0.6, 220 - h - 12, 1.2, 12);
    }
  }
  // Vidhana Soudha
  const vx = 150,
    vb = 228;
  ctx.fillStyle = '#E3DCCB';
  ctx.fillRect(vx - 70, vb - 34, 140, 40);
  ctx.fillRect(vx - 26, vb - 52, 52, 20);
  ctx.beginPath();
  ctx.arc(vx, vb - 52, 18, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(vx - 1, vb - 78, 2, 8);
  for (const sx of [-58, 58]) {
    ctx.beginPath();
    ctx.arc(vx + sx, vb - 34, 8, Math.PI, 0);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(120,110,95,0.35)';
  for (let i = -64; i <= 64; i += 8) ctx.fillRect(vx + i, vb - 30, 2.4, 32);
  // Namma Metro purple line on its viaduct, with a train gliding along
  ctx.fillStyle = '#B9AFC9';
  for (let x = Math.floor(x0 / 70) * 70; x < x1 + 70; x += 70) ctx.fillRect(x + 20, 172, 8, 60);
  ctx.fillStyle = '#CFC6DD';
  ctx.fillRect(x0 - 10, 164, x1 - x0 + 20, 9);
  ctx.fillStyle = th.accent;
  ctx.fillRect(x0 - 10, 168, x1 - x0 + 20, 2);
  // trees
  for (let x = Math.floor(x0 / 30) * 30 - 30; x < x1 + 30; x += 30) {
    const purple = hash(x, 11) > 0.62;
    const c = purple ? '#A58AD8' : '#5FAA6A';
    const c2 = purple ? '#C1A9EA' : '#7DC283';
    const ty = 236 - hash(x, 12) * 10;
    ellipse(ctx, x, ty, 18, 12, c);
    ellipse(ctx, x + 10, ty - 8, 12, 9, c2);
    ellipse(ctx, x - 9, ty - 4, 10, 8, c2);
  }
}
