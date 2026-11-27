import type { Theme } from '../../../render/theme';
import type { Ctx } from '../../../render/art/common';

/** Itanagar's skyline between x0 and x1: a long dark ridge with a thin orange dawn line, stilt houses, Ita Fort's brick wall, a lake edge */
export function backdrop(ctx: Ctx, th: Theme, x0: number, x1: number, variant = 0) {
  // the far ridge (two layers) with the first light along its top
  ctx.fillStyle = th.far;
  ctx.beginPath();
  ctx.moveTo(x0, 240);
  for (let x = x0; x <= x1 + 40; x += 40) ctx.lineTo(x, 150 + 22 * Math.sin(x / 150) + 10 * Math.sin(x / 47 + variant));
  ctx.lineTo(x1 + 40, 240);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,170,90,0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let x = x0; x <= x1 + 40; x += 40) ctx.lineTo(x, 149 + 22 * Math.sin(x / 150) + 10 * Math.sin(x / 47 + variant));
  ctx.stroke();
  ctx.fillStyle = th.mid;
  ctx.beginPath();
  ctx.moveTo(x0, 240);
  for (let x = x0; x <= x1 + 30; x += 30) ctx.lineTo(x, 182 + 14 * Math.sin(x / 90 + 1) + 6 * Math.sin(x / 31));
  ctx.lineTo(x1 + 30, 240);
  ctx.fill();
  // stilt houses on the slope and the fort's brick wall, every 260 px
  for (let x = Math.floor(x0 / 260) * 260; x < x1 + 260; x += 260) {
    const k = ((x / 260) % 3 + 3) % 3;
    if (k === 1) {
      // Ita Fort: a low irregular brick rampart with a gate
      ctx.fillStyle = '#7A3A28';
      ctx.fillRect(x + 20, 206, 120, 34);
      ctx.fillRect(x + 50, 198, 30, 8);
      ctx.fillStyle = '#5A2A1C';
      for (let y = 210; y < 240; y += 6) for (let bx = x + 20 + ((y / 6) % 2) * 6; bx < x + 140; bx += 12) ctx.fillRect(bx, y, 10, 1);
      ctx.fillStyle = '#2A1810';
      ctx.fillRect(x + 74, 220, 12, 20);
    } else {
      // two bamboo houses on stilts, thatch roofs
      for (const dx of [30, 130]) {
        ctx.fillStyle = '#3B2A1A';
        ctx.fillRect(x + dx, 216, 2, 24);
        ctx.fillRect(x + dx + 36, 216, 2, 24);
        ctx.fillStyle = '#6B4A2A';
        ctx.fillRect(x + dx - 2, 204, 42, 14);
        ctx.fillStyle = '#8A7A4A';
        ctx.beginPath();
        ctx.moveTo(x + dx - 8, 206);
        ctx.lineTo(x + dx + 19, 190);
        ctx.lineTo(x + dx + 46, 206);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,200,120,0.8)';
        ctx.fillRect(x + dx + 8, 208, 5, 5);
      }
    }
  }
  // the lake edge: a pale band of still water in the near layer
  ctx.fillStyle = 'rgba(120,150,170,0.35)';
  ctx.fillRect(x0, 232, x1 - x0, 8);
  ctx.fillStyle = th.near;
  ctx.fillRect(x0, 238, x1 - x0, 2);
}
