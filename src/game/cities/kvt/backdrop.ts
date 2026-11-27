import type { Theme } from '../../../render/theme';
import { Ctx, hash } from '../../../render/art/common';
import { glow, palm } from '../../../render/backdrops-south';

// --------------------------------------------------------------- Lakshadweep
export function kavaratti(ctx: Ctx, th: Theme, x0: number, x1: number) {
  glow(ctx, 380, 64, 18, th.sun);
  // deep sea, then the turquoise lagoon line
  ctx.fillStyle = '#1565A8';
  ctx.fillRect(x0 - 4, 150, x1 - x0 + 8, 30);
  ctx.fillStyle = '#26A6C9';
  ctx.fillRect(x0 - 4, 176, x1 - x0 + 8, 80);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  for (let x = Math.floor(x0 / 24) * 24; x < x1; x += 24) ctx.fillRect(x + hash(x, 2) * 12, 177 + hash(x, 3) * 30, 8, 1);
  ctx.fillStyle = '#F5EFE0';
  ctx.fillRect(x0 - 4, 176, x1 - x0 + 8, 2);
  // the red-and-white lighthouse on the next island
  const lx = 92;
  ctx.fillStyle = '#F4F1E8';
  ctx.beginPath();
  ctx.moveTo(lx - 6, 178);
  ctx.lineTo(lx - 3, 118);
  ctx.lineTo(lx + 3, 118);
  ctx.lineTo(lx + 6, 178);
  ctx.fill();
  ctx.fillStyle = '#D84315';
  ctx.fillRect(lx - 5, 136, 10, 8);
  ctx.fillRect(lx - 5.5, 156, 11, 8);
  ctx.fillStyle = '#37474F';
  ctx.fillRect(lx - 4, 112, 8, 6);
  // island palms and low coral-stone houses
  for (let x = Math.floor(x0 / 30) * 30 - 30; x < x1 + 30; x += 30) {
    if (hash(x, 9) > 0.55) continue;
    palm(ctx, x + hash(x, 6) * 14, 226, 38 + hash(x, 7) * 20, (hash(x, 8) - 0.5) * 22, '#7A5C3A', '#2E8B57');
  }
  for (let x = Math.floor(x0 / 70) * 70; x < x1 + 70; x += 70) {
    ctx.fillStyle = '#F7F4EC';
    ctx.fillRect(x + 10, 214, 34, 16);
    ctx.fillStyle = '#9C7B5A';
    ctx.fillRect(x + 8, 210, 38, 4);
  }
}
