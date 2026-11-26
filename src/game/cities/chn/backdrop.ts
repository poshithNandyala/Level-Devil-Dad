import type { Theme } from '../../../render/theme';
import { circle, Ctx, ellipse, hash } from '../../../render/art/common';
import { glow } from '../../../render/backdrops-south';

// --------------------------------------------------------------- Chennai
export function chennai(ctx: Ctx, th: Theme, x0: number, x1: number) {
  glow(ctx, 440, 56, 22, th.sun);
  // heat shimmer bands
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  for (let i = 0; i < 4; i++) ctx.fillRect(x0, 60 + i * 22, x1 - x0, 2);
  // sea strip on the horizon
  ctx.fillStyle = '#4FA8D8';
  ctx.fillRect(x0 - 4, 186, x1 - x0 + 8, 18);
  // red-and-white lighthouse
  const lx = 470;
  ctx.fillStyle = '#F4F1E8';
  ctx.fillRect(lx - 5, 120, 10, 70);
  ctx.fillStyle = '#C62828';
  for (let i = 0; i < 4; i++) ctx.fillRect(lx - 5, 126 + i * 16, 10, 7);
  ctx.fillStyle = '#37474F';
  ctx.fillRect(lx - 6, 114, 12, 6);
  // a red-brick clock tower and arcades, Indo-Saracenic in silhouette
  const cx = 120;
  ctx.fillStyle = '#A8473B';
  ctx.fillRect(cx - 60, 170, 120, 36);
  ctx.fillRect(cx - 9, 108, 18, 64);
  ctx.beginPath();
  ctx.moveTo(cx - 11, 108);
  ctx.lineTo(cx, 92);
  ctx.lineTo(cx + 11, 108);
  ctx.fill();
  circle(ctx, cx, 122, 5, '#F4E3C1');
  ctx.fillStyle = '#7E2F27';
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.arc(cx - 54 + i * 12, 192, 4, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(cx - 58 + i * 12, 192, 8, 12);
  }
  // elevated railway on its pillars
  ctx.fillStyle = '#C9C2B4';
  for (let x = Math.floor(x0 / 64) * 64; x < x1 + 64; x += 64) ctx.fillRect(x + 28, 168, 10, 80);
  ctx.fillStyle = '#DCD6CA';
  ctx.fillRect(x0 - 10, 158, x1 - x0 + 20, 12);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(x0 - 10, 168, x1 - x0 + 20, 2);
  // neem trees
  for (let x = Math.floor(x0 / 44) * 44 - 44; x < x1 + 44; x += 44) {
    const ty = 236 - hash(x, 12) * 8;
    ellipse(ctx, x, ty, 16, 11, '#4E8B3A');
    ellipse(ctx, x + 9, ty - 7, 11, 8, '#66A84E');
  }
}
