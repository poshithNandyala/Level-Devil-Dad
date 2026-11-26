import type { Theme } from '../../../render/theme';
import { Ctx, ellipse, withAlpha } from '../../../render/art/common';
import { glow, ridge } from '../../../render/backdrops-south';

// --------------------------------------------------------------- Amaravati
export function amaravati(ctx: Ctx, th: Theme, x0: number, x1: number) {
  glow(ctx, 380, 50, 22, th.sun);
  // a green hill across the river
  ridge(ctx, x0, x1, 150, 30, 0.015, 2.2, '#9DB98A');
  // the wide river and a long barrage of yellow arches
  ctx.fillStyle = '#4C9BD0';
  ctx.fillRect(x0 - 4, 176, x1 - x0 + 8, 30);
  ctx.fillStyle = '#E8C547';
  ctx.fillRect(x0 - 4, 170, x1 - x0 + 8, 5);
  ctx.fillStyle = '#D4A92F';
  for (let x = Math.floor(x0 / 22) * 22; x < x1 + 22; x += 22) {
    ctx.fillRect(x, 175, 5, 22);
    ctx.fillStyle = '#C0392B';
    ctx.fillRect(x, 166, 5, 4);
    ctx.fillStyle = '#D4A92F';
  }
  // the new capital going up: tower cranes and half-built towers
  for (const [bx, h] of [
    [60, 70],
    [210, 96],
    [340, 80],
    [470, 104],
  ] as const) {
    if (bx < x0 - 80 || bx > x1 + 80) continue;
    ctx.fillStyle = th.far;
    ctx.fillRect(bx, 210 - h, 34, h);
    ctx.strokeStyle = withAlpha('#FFFFFF', 0.4);
    ctx.lineWidth = 1;
    for (let y = 214 - h; y < 210; y += 10) {
      ctx.beginPath();
      ctx.moveTo(bx, y);
      ctx.lineTo(bx + 34, y);
      ctx.stroke();
    }
    // crane
    ctx.strokeStyle = '#E3A21A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx + 40, 210);
    ctx.lineTo(bx + 40, 196 - h);
    ctx.moveTo(bx + 4, 196 - h);
    ctx.lineTo(bx + 84, 196 - h);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bx + 70, 196 - h);
    ctx.lineTo(bx + 70, 220 - h);
    ctx.stroke();
  }
  // paddy edge and chilli sacks
  ctx.fillStyle = '#7CB342';
  ctx.fillRect(x0 - 4, 228, x1 - x0 + 8, 14);
  for (let x = Math.floor(x0 / 52) * 52; x < x1 + 52; x += 52) {
    ellipse(ctx, x + 20, 230, 9, 6, '#C62828');
    ellipse(ctx, x + 28, 232, 7, 5, '#E53935');
  }
}
