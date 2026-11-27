import type { Theme } from '../../../render/theme';
import { Ctx, withAlpha } from '../../../render/art/common';

/** the Rumi Darwaza-like gate: a tall gateway with a half-dome arch and a flower-bud crest (a generic shape) */
function gate(ctx: Ctx, x: number, base: number, s: number, fill: string, shade: string) {
  const w = 64 * s,
    h = 92 * s;
  ctx.fillStyle = fill;
  ctx.fillRect(x - w / 2, base - h, w, h);
  // the flanking turrets with little chhatris
  for (const d of [-1, 1]) {
    const tx = x + d * (w / 2 + 5 * s);
    ctx.fillRect(tx - 5 * s, base - h - 14 * s, 10 * s, h + 14 * s);
    ctx.beginPath();
    ctx.arc(tx, base - h - 14 * s, 6 * s, Math.PI, 0);
    ctx.fill();
  }
  // the crest: petals over the top
  for (let k = -3; k <= 3; k++) {
    ctx.beginPath();
    ctx.ellipse(x + k * 8 * s, base - h - 3 * s, 3.2 * s, 7 * s, k * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }
  // the tall half-dome opening
  ctx.fillStyle = shade;
  ctx.beginPath();
  ctx.moveTo(x - 18 * s, base);
  ctx.lineTo(x - 18 * s, base - 50 * s);
  ctx.quadraticCurveTo(x - 18 * s, base - 78 * s, x, base - 84 * s);
  ctx.quadraticCurveTo(x + 18 * s, base - 78 * s, x + 18 * s, base - 50 * s);
  ctx.lineTo(x + 18 * s, base);
  ctx.closePath();
  ctx.fill();
}

/** the great old hall (Bara Imambara-like, generic): a long low block, rows of arches, small domes on top */
function hall(ctx: Ctx, x: number, base: number, w: number, fill: string, shade: string) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, base - 46, w, 46);
  ctx.fillRect(x + 10, base - 54, w - 20, 8);
  for (let k = 0; k < 5; k++) {
    const dx = x + 18 + k * ((w - 36) / 4);
    ctx.beginPath();
    ctx.arc(dx, base - 54, 7, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(dx - 1, base - 66, 2, 6);
  }
  ctx.fillStyle = shade;
  for (let row = 0; row < 2; row++)
    for (let ax = x + 6; ax < x + w - 10; ax += 12) {
      const ay = base - 40 + row * 20;
      ctx.beginPath();
      ctx.moveTo(ax, ay + 14);
      ctx.lineTo(ax, ay + 5);
      ctx.quadraticCurveTo(ax + 4, ay - 1, ax + 8, ay + 5);
      ctx.lineTo(ax + 8, ay + 14);
      ctx.fill();
    }
}

/**
 * Lucknow: the Gomti in the winter haze, the old city's long hall and its great gate, a thin clock tower,
 * domes and the cream colonnades of Hazratganj along the road. Drawn behind the playfield in world px.
 */
export function backdrop(ctx: Ctx, th: Theme, x0: number, x1: number) {
  // far haze: a soft row of domes and minarets over the old city
  ctx.fillStyle = withAlpha(th.far, 0.8);
  ctx.fillRect(x0 - 8, 150, x1 - x0 + 16, 60);
  for (let x = x0 - 20; x <= x1 + 20; x += 70) {
    const k = Math.round(x / 70);
    const dx = x + ((k * 23) % 30);
    ctx.beginPath();
    ctx.arc(dx, 150, 12 + ((k * 7) % 6), Math.PI, 0);
    ctx.fill();
    if (k % 2) ctx.fillRect(dx + 20, 118, 4, 34);
  }
  // the great gate, and the hall beside it, once per screen width
  const span = 640;
  for (let base = Math.floor(x0 / span) * span; base < x1 + span; base += span) {
    gate(ctx, base + 150, 206, 1, withAlpha('#D9C29A', 0.95), withAlpha('#8E7356', 0.8));
    hall(ctx, base + 260, 206, 150, withAlpha('#E2D2B4', 0.95), withAlpha('#9C8466', 0.75));
    // the thin clock tower
    ctx.fillStyle = withAlpha('#B07A52', 0.85);
    ctx.fillRect(base + 470, 120, 9, 86);
    ctx.beginPath();
    ctx.moveTo(base + 468, 120);
    ctx.lineTo(base + 474.5, 104);
    ctx.lineTo(base + 481, 120);
    ctx.fill();
    ctx.fillStyle = withAlpha('#F6E7CF', 0.9);
    ctx.beginPath();
    ctx.arc(base + 474.5, 130, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // the Gomti: a wide calm band with a pale sheen and the far embankment
  const rv = ctx.createLinearGradient(0, 206, 0, 224);
  rv.addColorStop(0, withAlpha('#8FA9B8', 0.95));
  rv.addColorStop(1, withAlpha('#6F8C9B', 0.95));
  ctx.fillStyle = rv;
  ctx.fillRect(x0 - 8, 206, x1 - x0 + 16, 18);
  ctx.fillStyle = withAlpha('#FFFFFF', 0.35);
  for (let x = x0 - (x0 % 23); x < x1; x += 23) ctx.fillRect(x, 211 + ((x / 23) % 3), 9, 1);
  // the near bank: Hazratganj's cream colonnade
  ctx.fillStyle = withAlpha(th.near, 0.55);
  ctx.fillRect(x0 - 8, 224, x1 - x0 + 16, 20);
  ctx.fillStyle = withAlpha('#EFE3CC', 0.85);
  for (let x = x0 - (x0 % 30) - 30; x < x1 + 30; x += 30) {
    ctx.fillRect(x, 222, 24, 18);
    ctx.fillStyle = withAlpha('#8E7356', 0.5);
    ctx.beginPath();
    ctx.moveTo(x + 5, 240);
    ctx.lineTo(x + 5, 230);
    ctx.quadraticCurveTo(x + 12, 223, x + 19, 230);
    ctx.lineTo(x + 19, 240);
    ctx.fill();
    ctx.fillStyle = withAlpha('#EFE3CC', 0.85);
  }
}
