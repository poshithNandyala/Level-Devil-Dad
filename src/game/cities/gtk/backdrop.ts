import type { Theme } from '../../../render/theme';
import { Ctx, withAlpha } from '../../../render/art/common';

/**
 * Gangtok: Kanchenjunga white and far on a clear morning, the ridge below it in forest, and the town stacked
 * down the hillside in tall narrow houses with coloured roofs, roads looping across it and the ropeway's line
 * over the valley. (No monastery, prayer flags or chortens: the bible's Avoid list.)
 */
export function backdrop(ctx: Ctx, th: Theme, x0: number, x1: number) {
  // the massif: a long white wall of peaks with one tall summit, rose-gold where the sun catches it
  const base = 150;
  ctx.fillStyle = '#E9EEF2';
  ctx.beginPath();
  ctx.moveTo(x0 - 10, base);
  const step = 64;
  for (let x = x0 - 10; x <= x1 + 10; x += step) {
    const k = Math.round(x / step);
    const top = 58 + ((k * 41) % 26) - (k % 5 === 0 ? 22 : 0);
    ctx.lineTo(x + step * 0.5, top);
    ctx.lineTo(x + step, top + 18 + ((k * 7) % 10));
  }
  ctx.lineTo(x1 + 10, base);
  ctx.closePath();
  ctx.fill();
  // shadowed flanks and the sunrise tint on the tops
  ctx.fillStyle = withAlpha('#A9BCCB', 0.55);
  for (let x = x0 - 10; x <= x1 + 10; x += step) {
    const k = Math.round(x / step);
    const top = 58 + ((k * 41) % 26) - (k % 5 === 0 ? 22 : 0);
    ctx.beginPath();
    ctx.moveTo(x + step * 0.5, top);
    ctx.lineTo(x + step, top + 18 + ((k * 7) % 10));
    ctx.lineTo(x + step * 0.85, base);
    ctx.lineTo(x + step * 0.55, base);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = withAlpha(th.accent2, 0.35);
    ctx.beginPath();
    ctx.moveTo(x + step * 0.5, top);
    ctx.lineTo(x + step * 0.5 - 9, top + 9);
    ctx.lineTo(x + step * 0.5 + 7, top + 7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = withAlpha('#A9BCCB', 0.55);
  }

  // the forested ridge below the snow
  ctx.fillStyle = th.far;
  ctx.beginPath();
  ctx.moveTo(x0 - 10, 210);
  for (let x = x0 - 10; x <= x1 + 10; x += 40) {
    const k = Math.round(x / 40);
    ctx.lineTo(x, 132 + ((k * 23) % 14));
  }
  ctx.lineTo(x1 + 10, 210);
  ctx.closePath();
  ctx.fill();

  // the ropeway's line across the valley, a cabin on it
  ctx.strokeStyle = withAlpha(th.ink, 0.35);
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(x0 - 10, 118);
  ctx.lineTo(x1 + 10, 104);
  ctx.stroke();
  for (let x = Math.floor(x0 / 360) * 360 + 180; x < x1; x += 360) {
    const y = 118 - ((x - x0 + 10) / (x1 - x0 + 20)) * 14;
    ctx.fillStyle = withAlpha('#C0392B', 0.75);
    ctx.fillRect(x - 4, y + 3, 8, 6);
    ctx.fillRect(x - 0.5, y, 1, 3);
  }

  // the town: rows of tall narrow houses stepping down the hill, with a looping road between the rows
  const roofs = ['#C0392B', '#2E86AB', '#3E8E41', '#E07A5F', '#8E6C8A', '#D4A017'];
  for (let row = 0; row < 3; row++) {
    const y = 150 + row * 24;
    const gap = 26 - row * 2;
    ctx.fillStyle = withAlpha('#8D8A80', 0.55);
    ctx.fillRect(x0 - 10, y + 16, x1 - x0 + 20, 2.5);
    for (let x = x0 - 20; x <= x1 + 20; x += gap) {
      const k = Math.round(x / gap) + row * 5;
      const hw = 14 + ((k * 5) % 7);
      const hh = 14 + ((k * 7) % 12) + row * 3;
      ctx.fillStyle = row === 2 ? '#F1ECE1' : withAlpha('#E6E1D5', 0.85 - row * 0.05);
      ctx.fillRect(x, y + 16 - hh, hw, hh);
      ctx.fillStyle = roofs[((k % roofs.length) + roofs.length) % roofs.length];
      ctx.fillRect(x - 1, y + 14 - hh, hw + 2, 3);
      ctx.fillStyle = withAlpha(th.ink, 0.3);
      for (let f = 0; f < Math.floor(hh / 6); f++) ctx.fillRect(x + 3, y + 18 - hh + f * 6, hw - 6, 2);
    }
  }
  // near slope
  ctx.fillStyle = th.near;
  ctx.fillRect(x0 - 10, 222, x1 - x0 + 20, 30);
}
