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

export function tiledHouse(ctx: Ctx, x: number, base: number, w: number, h: number, wall: string, roof: string) {
  ctx.fillStyle = wall;
  ctx.fillRect(x, base - h, w, h);
  ctx.fillStyle = roof;
  ctx.beginPath();
  ctx.moveTo(x - 5, base - h + 2);
  ctx.lineTo(x + w / 2, base - h - w * 0.42);
  ctx.lineTo(x + w + 5, base - h + 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = withAlpha('#000000', 0.18);
  ctx.fillRect(x + w * 0.4, base - h * 0.7, w * 0.2, h * 0.7);
}





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

export function ambientSouth(ctx: Ctx, city: string, x0: number, x1: number, t: number, reduced: boolean) {
  if (city === 'TVM' && !reduced) {
    // light monsoon rain
    ctx.strokeStyle = 'rgba(230,245,255,0.35)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    for (let i = 0; i < 60; i++) {
      const rx = x0 + ((hash(i, 1) * (x1 - x0) + t * 24) % (x1 - x0));
      const ry = (hash(i, 2) * 300 + t * 300) % 300;
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 2, ry + 8);
    }
    ctx.stroke();
  } else if (city === 'KVT') {
    // gulls
    ctx.strokeStyle = 'rgba(40,60,70,0.5)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 4; i++) {
      const bx = x0 + ((t * (14 + i * 3) + i * 140) % (x1 - x0 + 60)) - 30;
      const by = 70 + i * 12 + Math.sin(t + i) * 4;
      const f = Math.sin(t * 8 + i) * 2;
      ctx.beginPath();
      ctx.moveTo(bx - 4, by - f);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + 4, by - f);
      ctx.stroke();
    }
  } else if (city === 'CHN') {
    // a train sliding along the elevated line
    const span = x1 - x0 + 200;
    const mx = x0 - 100 + ((t * 36) % span);
    ctx.fillStyle = '#E9E2D0';
    ctx.fillRect(mx, 150, 70, 9);
    ctx.fillStyle = '#C62828';
    ctx.fillRect(mx, 156, 70, 2);
  } else if (city === 'AMR' && !reduced) {
    // heat shimmer
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i < 3; i++) ctx.fillRect(x0, 120 + i * 30 + Math.sin(t * 2 + i) * 3, x1 - x0, 1.5);
  }
}
