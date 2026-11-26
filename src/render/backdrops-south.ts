import type { Theme } from './theme';
import { Ctx, circle, ellipse, hash, withAlpha } from './art/common';

/*
 * Backdrops for the new South India chapters. World units: the room is
 * 512x288 and the playfield ground usually sits around y=240.
 */

export function glow(ctx: Ctx, x: number, y: number, r: number, color: string) {
  const g = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 3);
  g.addColorStop(0, withAlpha(color, 0.5));
  g.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
  circle(ctx, x, y, r, color);
}

export function ridge(ctx: Ctx, x0: number, x1: number, base: number, amp: number, freq: number, seed: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x0 - 8, 300);
  for (let x = x0 - 8; x <= x1 + 8; x += 8) {
    const y = base - amp * (0.55 + 0.45 * Math.sin(x * freq + seed) * Math.sin(x * freq * 0.37 + seed * 2));
    ctx.lineTo(x, y);
  }
  ctx.lineTo(x1 + 8, 300);
  ctx.closePath();
  ctx.fill();
}

export function palm(ctx: Ctx, x: number, base: number, h: number, lean: number, trunk: string, leaf: string) {
  ctx.strokeStyle = trunk;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, base);
  ctx.quadraticCurveTo(x + lean * 0.3, base - h * 0.6, x + lean, base - h);
  ctx.stroke();
  const tx = x + lean,
    ty = base - h;
  ctx.fillStyle = leaf;
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i - 2.5) * 0.55;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(tx + Math.cos(a) * 14, ty + Math.sin(a) * 14 - 6, tx + Math.cos(a) * 22, ty + Math.sin(a) * 22 + 6);
    ctx.quadraticCurveTo(tx + Math.cos(a) * 12, ty + Math.sin(a) * 12, tx, ty + 1);
    ctx.fill();
  }
  circle(ctx, tx + 2, ty + 3, 2.2, '#6B4E2E');
  circle(ctx, tx - 2, ty + 4, 2.2, '#6B4E2E');
}


