import { Ctx, circle, hash, withAlpha } from './art/common';

/*
 * Backdrops for the western chapters. World units: the room is 512x288 and the
 * playfield ground usually sits around y=240.
 */

export function sunGlow(ctx: Ctx, x: number, y: number, r: number, color: string) {
  const g = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 3.4);
  g.addColorStop(0, withAlpha(color, 0.55));
  g.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r * 3.4, y - r * 3.4, r * 6.8, r * 6.8);
  circle(ctx, x, y, r, color);
}







/** evening on the Mandovi: lanterns drifting in the breeze */
export function ambientWest(ctx: Ctx, city: string, x0: number, x1: number, t: number, reduced: boolean) {
  if (city === 'RPR' && !reduced) {
    // egrets drifting over the paddy
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (let i = 0; i < 5; i++) {
      const span = x1 - x0 + 80;
      const x = x0 - 40 + ((hash(i, 81) * span + t * (10 + i * 2)) % span);
      const y = 110 + hash(i, 83) * 50 + Math.sin(t + i) * 4;
      const f = Math.sin(t * 6 + i * 2) * 2.5;
      ctx.fillRect(x - 3, y, 6, 1.5);
      ctx.fillRect(x - 1, y - f, 2, Math.abs(f) + 1);
      ctx.fillRect(x + 3, y - 1, 2, 1);
    }
  }
  if (city === 'BPL' && !reduced) {
    // gulls and the odd painted stork over the lake
    ctx.strokeStyle = 'rgba(250,250,250,0.85)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const span = x1 - x0 + 80;
      const x = x0 - 40 + ((hash(i, 91) * span + t * (12 + i * 3)) % span);
      const y = 70 + hash(i, 93) * 70 + Math.sin(t * 1.2 + i) * 5;
      const f = Math.sin(t * 7 + i * 2) * 2.5;
      ctx.beginPath();
      ctx.moveTo(x - 4, y - f);
      ctx.quadraticCurveTo(x - 2, y - 1, x, y);
      ctx.quadraticCurveTo(x + 2, y - 1, x + 4, y - f);
      ctx.stroke();
    }
  }
  if (city === 'JAI' && !reduced) {
    // pigeons wheeling over the pink city
    ctx.fillStyle = 'rgba(90,90,110,0.75)';
    for (let i = 0; i < 9; i++) {
      const span = x1 - x0 + 80;
      const x = x0 - 40 + ((hash(i, 71) * span + t * (18 + i * 2)) % span);
      const y = 60 + hash(i, 73) * 50 + Math.sin(t * 1.5 + i) * 6;
      const f = Math.sin(t * 12 + i * 2) * 2;
      ctx.beginPath();
      ctx.moveTo(x - 3, y - f);
      ctx.lineTo(x, y);
      ctx.lineTo(x + 3, y - f);
      ctx.lineTo(x, y + 1);
      ctx.fill();
    }
  }
  if (city === 'GNR' && !reduced) {
    // Uttarayan: the sky full of kites, tugging on their strings
    const cols = ['#E53935', '#FFB300', '#43A047', '#1E88E5', '#8E24AA', '#F06292'];
    const span = x1 - x0 + 60;
    for (let i = 0; i < 12; i++) {
      const kx = x0 - 30 + ((hash(i, 41) * span + t * (4 + (i % 3))) % span),
        ky = 30 + hash(i, 42) * 90 + Math.sin(t * 1.3 + i) * 5;
      const sw = Math.sin(t * 2 + i) * 0.25;
      ctx.save();
      ctx.translate(kx, ky);
      ctx.rotate(sw);
      ctx.fillStyle = cols[i % cols.length];
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(5, 0);
      ctx.lineTo(0, 7);
      ctx.lineTo(-5, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(-0.4, -6, 0.8, 13);
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(kx, ky + 7);
      ctx.quadraticCurveTo(kx + 10, ky + 60, kx + 30 - (i % 4) * 14, 240);
      ctx.stroke();
    }
  }
  if (city === 'DMN' && !reduced) {
    // gulls wheeling over the river mouth
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 0.9;
    for (let i = 0; i < 5; i++) {
      const a = t * 0.5 + i * 1.3;
      const bx = x0 + ((hash(i, 31) * (x1 - x0) + t * 12) % (x1 - x0)),
        by = 60 + Math.sin(a) * 14 + i * 8;
      const f = Math.sin(t * 7 + i) * 2;
      ctx.beginPath();
      ctx.moveTo(bx - 4, by - f);
      ctx.quadraticCurveTo(bx - 2, by - 2, bx, by);
      ctx.quadraticCurveTo(bx + 2, by - 2, bx + 4, by - f);
      ctx.stroke();
    }
  }
  if (city === 'PNJ' && !reduced) {
    const span = x1 - x0 + 40;
    for (let i = 0; i < 7; i++) {
      const lx = x0 - 20 + ((hash(i, 21) * span + t * (6 + i)) % span),
        ly = 70 + hash(i, 22) * 60 + Math.sin(t * 0.8 + i) * 4;
      const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 9);
      g.addColorStop(0, 'rgba(255,214,140,0.5)');
      g.addColorStop(1, 'rgba(255,214,140,0)');
      ctx.fillStyle = g;
      ctx.fillRect(lx - 9, ly - 9, 18, 18);
      circle(ctx, lx, ly, 1.2, 'rgba(255,236,190,0.9)');
    }
  }
}
