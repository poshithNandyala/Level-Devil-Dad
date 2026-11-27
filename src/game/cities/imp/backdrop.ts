import type { Theme } from '../../../render/theme';
import type { Ctx } from '../../../render/art/common';

/**
 * Imphal: blue-grey valley hills far off, the long low line of Loktak with round huts on floating mats, the
 * pagoda-tiered roof of Ima Keithel, and the white oval of the polo ground with a rearing pony. Drawn in world
 * px between x0 and x1, behind the playfield (never in Dad's row).
 */
export function backdrop(ctx: Ctx, th: Theme, x0: number, x1: number, variant = 0) {
  // far hills: soft rounded ridges
  ctx.fillStyle = th.far;
  ctx.beginPath();
  ctx.moveTo(x0 - 8, 200);
  const step = 110;
  for (let x = x0 - 8; x <= x1 + 8; x += step) {
    const k = Math.round(x / step);
    const top = 112 + ((k * 29) % 26);
    ctx.quadraticCurveTo(x + step / 2, top - 18, x + step, top + ((k % 3) - 1) * 6);
  }
  ctx.lineTo(x1 + 8, 200);
  ctx.closePath();
  ctx.fill();
  // the lake line with mist
  const mist = ctx.createLinearGradient(0, 150, 0, 200);
  mist.addColorStop(0, 'rgba(240,246,236,0)');
  mist.addColorStop(1, 'rgba(240,246,236,0.5)');
  ctx.fillStyle = mist;
  ctx.fillRect(x0, 150, x1 - x0, 50);
  ctx.fillStyle = th.mid;
  ctx.fillRect(x0, 178, x1 - x0, 24);
  // huts on floating mats along the lake
  for (let x = x0 - ((x0 + 60) % 150); x < x1 + 40; x += 150) {
    const k = Math.round(x / 150);
    const w = 22 + ((k * 7) % 9);
    ctx.fillStyle = '#6B7A3A';
    ctx.fillRect(x, 182, w + 10, 3);
    ctx.fillStyle = '#A88A5C';
    ctx.fillRect(x + 3, 170, w, 12);
    ctx.fillStyle = '#4F3A22';
    ctx.beginPath();
    ctx.moveTo(x, 170);
    ctx.lineTo(x + 3 + w / 2, 160);
    ctx.lineTo(x + w + 6, 170);
    ctx.fill();
  }
  // Ima Keithel: three tiers of pagoda roof, repeated once per 400 px
  for (let x = x0 - ((x0 + 200) % 400) + 40; x < x1; x += 400) {
    ctx.fillStyle = th.near;
    ctx.fillRect(x, 168, 70, 14);
    for (let t = 0; t < 3; t++) {
      ctx.fillStyle = t % 2 ? '#7A4A3A' : '#5E3A2E';
      ctx.beginPath();
      ctx.moveTo(x - 8 + t * 9, 168 - t * 12);
      ctx.lineTo(x + 35, 156 - t * 12);
      ctx.lineTo(x + 78 - t * 9, 168 - t * 12);
      ctx.fill();
    }
    // the polo ground: a white oval with a rearing pony statue
    ctx.fillStyle = 'rgba(235,240,230,0.85)';
    ctx.beginPath();
    ctx.ellipse(x + 230, 184, 60, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#C9C2B0';
    ctx.fillRect(x + 226, 150, 8, 32);
    ctx.fillRect(x + 222, 146, 16, 6);
    ctx.fillRect(x + 232, 140, 5, 8);
  }
  void variant;
}
