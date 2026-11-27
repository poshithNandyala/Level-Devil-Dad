import { type Ctx, hash } from '../../../render/art/common';

/** Patna's moving layer: loo heat shimmer over the river, dust on the wind, and trucks crawling over the Setu */
export function ambient(ctx: Ctx, x0: number, x1: number, t: number, reduced: boolean) {
  const span = Math.max(1, x1 - x0);
  // trucks crawling along the Gandhi Setu (the girder is at y 166 in the backdrop)
  for (let i = 0; i < 5; i++) {
    const v = 9 + hash(i, 4) * 7;
    const x = x0 - 40 + ((hash(i, 3) * span + t * v) % (span + 80));
    ctx.fillStyle = i % 2 ? '#C2603A' : '#4A7A9A';
    ctx.fillRect(x, 160, 14, 6);
    ctx.fillStyle = '#2E2A22';
    ctx.fillRect(x + 2, 165, 3, 2);
    ctx.fillRect(x + 9, 165, 3, 2);
  }
  if (reduced) return;
  // heat shimmer: a few long, faint wavy lines over the water
  ctx.strokeStyle = 'rgba(255,240,200,0.18)';
  ctx.lineWidth = 1;
  for (let k = 0; k < 4; k++) {
    ctx.beginPath();
    const y = 188 + k * 7;
    for (let x = x0; x <= x1; x += 8) {
      const yy = y + Math.sin(x * 0.05 + t * 1.4 + k) * 1.6;
      if (x === x0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  // dust on the loo
  ctx.fillStyle = 'rgba(214,176,120,0.5)';
  for (let i = 0; i < 26; i++) {
    const x = x0 + ((hash(i, 9) * span + t * (14 + hash(i, 5) * 14)) % span);
    const y = 120 + hash(i, 6) * 110 + Math.sin(t * 0.8 + i) * 3;
    ctx.fillRect(x, y, 1.5, 1.5);
  }
}
