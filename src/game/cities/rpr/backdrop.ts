import type { Theme } from '../../../render/theme';
import { Ctx, hash } from '../../../render/art/common';
import { sunGlow } from '../../../render/backdrops-west';

/** Raipur: paddy to the horizon in strips of green and gold, sal forest beyond, the Nagar Ghadi clock
 *  tower, a rice mill's chimney, Bastar memorial pillars by the road */
export function raipur(ctx: Ctx, th: Theme, x0: number, x1: number) {
  sunGlow(ctx, 430, 56, 15, th.sun);
  // sal forest along the horizon
  ctx.fillStyle = '#558B2F';
  for (let x = Math.floor(x0 / 14) * 14 - 14; x < x1 + 14; x += 14) {
    const h = 20 + hash(x, 2) * 16;
    ctx.beginPath();
    ctx.ellipse(x + 7, 150 - h / 2, 9, h / 2 + 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#4E7F2A';
  ctx.fillRect(x0 - 10, 148, x1 - x0 + 20, 12);
  // paddy strips: green, young green, ripening gold, water with sky in it
  const cols = ['#7CB342', '#9CCC65', '#C0CA33', '#AED581', '#D4C24A'];
  for (let k = 0; k < 8; k++) {
    const y = 158 + k * 10;
    for (let x = Math.floor(x0 / 90) * 90 - 90; x < x1 + 90; x += 90) {
      const off = (k * 37) % 90;
      ctx.fillStyle = cols[Math.floor(hash(x + k * 7, 5) * cols.length)];
      ctx.fillRect(x + off, y, 88, 10);
      ctx.fillStyle = 'rgba(60,90,30,0.35)';
      ctx.fillRect(x + off + 88, y, 2, 10);
    }
    ctx.fillStyle = 'rgba(60,90,30,0.3)';
    ctx.fillRect(x0 - 10, y, x1 - x0 + 20, 1);
  }
  // the Nagar Ghadi
  const cx = 250;
  ctx.fillStyle = '#ECEFF1';
  ctx.fillRect(cx - 7, 96, 14, 100);
  ctx.fillStyle = '#CFD8DC';
  ctx.fillRect(cx - 10, 88, 20, 22);
  ctx.fillStyle = '#D84315';
  ctx.beginPath();
  ctx.moveTo(cx - 11, 88);
  ctx.lineTo(cx, 76);
  ctx.lineTo(cx + 11, 88);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(cx, 99, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#263238';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, 99);
  ctx.lineTo(cx, 94.5);
  ctx.moveTo(cx, 99);
  ctx.lineTo(cx + 3.5, 100);
  ctx.stroke();
  // a rice mill: tin shed and a chimney
  ctx.fillStyle = '#B0BEC5';
  ctx.fillRect(520, 160, 60, 36);
  ctx.fillStyle = '#90A4AE';
  ctx.beginPath();
  ctx.moveTo(516, 160);
  ctx.lineTo(550, 146);
  ctx.lineTo(584, 160);
  ctx.fill();
  ctx.fillStyle = '#8D6E63';
  ctx.fillRect(588, 118, 7, 78);
  // Bastar memorial pillars, carved and painted
  for (let x = Math.floor(x0 / 210) * 210 + 80; x < x1; x += 210) {
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(x, 190, 5, 46);
    ctx.fillStyle = ['#D84315', '#FDD835', '#1E88E5'][Math.floor(hash(x, 8) * 3)];
    ctx.fillRect(x - 2, 188, 9, 3);
    ctx.fillRect(x, 204, 5, 3);
    ctx.fillRect(x, 218, 5, 3);
  }
}
