import type { Theme } from '../../../render/theme';
import { circle, Ctx, hash } from '../../../render/art/common';
import { glow } from '../../../render/backdrops-south';

// --------------------------------------------------------------- Puducherry
export function puducherry(ctx: Ctx, th: Theme, x0: number, x1: number) {
  glow(ctx, 100, 60, 16, th.sun);
  // sea with black seawall rocks at the horizon
  ctx.fillStyle = '#3E8FC9';
  ctx.fillRect(x0 - 4, 150, x1 - x0 + 8, 40);
  ctx.fillStyle = '#263238';
  for (let x = Math.floor(x0 / 14) * 14; x < x1 + 14; x += 14) {
    ctx.beginPath();
    ctx.moveTo(x, 192);
    ctx.lineTo(x + 4 + hash(x, 1) * 4, 182 + hash(x, 2) * 4);
    ctx.lineTo(x + 14, 192);
    ctx.fill();
  }
  // a white seaside arch
  ctx.fillStyle = '#F7F4EC';
  ctx.fillRect(250, 150, 30, 40);
  ctx.fillStyle = '#3E8FC9';
  ctx.beginPath();
  ctx.arc(265, 172, 8, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(257, 172, 16, 18);
  // yellow colonial facades with shutters and bougainvillea
  for (let x = Math.floor(x0 / 60) * 60 - 60; x < x1 + 60; x += 60) {
    const h = 44 + hash(x, 4) * 16;
    const pal = ['#F5B041', '#F7C873', '#E8A53A', '#F2E3C6'];
    ctx.fillStyle = pal[Math.floor(hash(x, 5) * 4)];
    ctx.fillRect(x, 240 - h, 58, h);
    ctx.fillStyle = '#F8F1E0';
    ctx.fillRect(x, 240 - h, 58, 4);
    for (let i = 0; i < 3; i++) {
      const wx = x + 7 + i * 17;
      ctx.fillStyle = '#2E7D6B';
      ctx.fillRect(wx, 240 - h + 12, 9, 14);
      ctx.fillStyle = '#F8F1E0';
      ctx.beginPath();
      ctx.arc(wx + 4.5, 240 - h + 12, 4.5, Math.PI, 0);
      ctx.fill();
    }
    for (let i = 0; i < 7; i++) circle(ctx, x + hash(x, i) * 58, 240 - h - 2 + hash(x, i + 9) * 8, 3, i % 2 ? '#D81B60' : '#F06292');
  }
}
