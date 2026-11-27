import type { Theme } from '../../../render/theme';
import { type Ctx, hash } from '../../../render/art/common';

/** the inside of Mawsmai cave: a dark rock wall with wet streaks, boulders at the foot, and the roof band the stalactites hang from */
function cave(ctx: Ctx, x0: number, x1: number) {
  ctx.fillStyle = '#1D2A26';
  ctx.fillRect(x0 - 8, 0, x1 - x0 + 16, 260);
  // the rock face: slabs of a slightly lighter grey-green
  for (let x = Math.floor(x0 / 40) * 40; x < x1 + 40; x += 40) {
    const k = hash(Math.round(x / 40), 23);
    ctx.fillStyle = k > 0.5 ? '#26352F' : '#22302B';
    ctx.fillRect(x, 70 + k * 30, 40, 170);
    // wet streaks
    ctx.fillStyle = 'rgba(140,180,190,0.18)';
    ctx.fillRect(x + 8 + k * 20, 70, 2, 90 + k * 60);
  }
  // boulders at the foot of the wall
  for (let x = Math.floor(x0 / 30) * 30; x < x1 + 30; x += 30) {
    const k = hash(Math.round(x / 30), 29);
    ctx.fillStyle = '#3A4842';
    ctx.beginPath();
    ctx.ellipse(x + 15, 236, 10 + k * 8, 6 + k * 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Shillong, drawn between x0 and x1 in world px: a far pine ridge with the peak's mast, a middle ridge of pines,
 * Assam-type houses with slanting tin roofs and many windows along the slope, one church spire as a silhouette,
 * and low cloud banks lying in the valleys.
 */
export function backdrop(ctx: Ctx, th: Theme, x0: number, x1: number, variant = 0) {
  // stage 07 is inside Mawsmai cave: rock all round, no town (QA F12)
  if (variant === 7) {
    cave(ctx, x0, x1);
    return;
  }
  // far ridge
  ctx.fillStyle = th.far;
  ctx.beginPath();
  ctx.moveTo(x0 - 8, 200);
  for (let x = x0 - 8; x <= x1 + 8; x += 20) ctx.lineTo(x, 150 + hash(Math.round(x / 20), 3) * 18 - (Math.round(x / 20) % 9 === 0 ? 14 : 0));
  ctx.lineTo(x1 + 8, 200);
  ctx.closePath();
  ctx.fill();
  // the mast on the peak (one, on the far ridge)
  for (let x = Math.floor(x0 / 480) * 480; x < x1 + 480; x += 480) {
    const mx = x + 300;
    if (mx < x0 - 20 || mx > x1 + 20) continue;
    ctx.fillStyle = th.near;
    ctx.fillRect(mx - 1, 122, 2, 34);
    ctx.fillRect(mx - 5, 130, 10, 1);
    ctx.fillRect(mx - 3, 138, 6, 1);
  }
  // valley cloud banks
  ctx.fillStyle = 'rgba(236,242,244,0.75)';
  for (let x = Math.floor(x0 / 160) * 160; x < x1 + 160; x += 160) {
    const k = hash(Math.round(x / 160), 7);
    ctx.beginPath();
    ctx.ellipse(x + 40 + k * 60, 184 + k * 6, 60 + k * 30, 7 + k * 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // middle ridge: pines
  ctx.fillStyle = th.mid;
  ctx.beginPath();
  ctx.moveTo(x0 - 8, 230);
  for (let x = x0 - 8; x <= x1 + 8; x += 12) ctx.lineTo(x, 186 + hash(Math.round(x / 12), 11) * 10);
  ctx.lineTo(x1 + 8, 230);
  ctx.closePath();
  ctx.fill();
  for (let x = Math.floor(x0 / 14) * 14; x < x1 + 14; x += 14) {
    const k = hash(Math.round(x / 14), 13);
    const top = 170 + k * 14;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x + 5, top + 26);
    ctx.lineTo(x - 5, top + 26);
    ctx.closePath();
    ctx.fill();
  }
  // houses on the slope: slanting tin roofs, rows of windows; one spire
  for (let x = Math.floor(x0 / 56) * 56; x < x1 + 56; x += 56) {
    const k = hash(Math.round(x / 56), 17);
    const hx = x + 6 + k * 10,
      hw = 30 + k * 10,
      hh = 16 + k * 8,
      y = 240 - hh - 4;
    ctx.fillStyle = th.near;
    ctx.fillRect(hx, y, hw, hh);
    ctx.fillStyle = '#A33A2E';
    ctx.beginPath();
    ctx.moveTo(hx - 2, y);
    ctx.lineTo(hx + hw * 0.5, y - 9);
    ctx.lineTo(hx + hw + 2, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,240,200,0.6)';
    for (let i = 0; i < Math.floor(hw / 7); i++) ctx.fillRect(hx + 3 + i * 7, y + 4, 3, 4);
    if (Math.round(x / 56) % 7 === 3) {
      ctx.fillStyle = th.near;
      ctx.fillRect(hx + hw + 6, y - 20, 8, hh + 20);
      ctx.beginPath();
      ctx.moveTo(hx + hw + 5, y - 20);
      ctx.lineTo(hx + hw + 10, y - 36);
      ctx.lineTo(hx + hw + 15, y - 20);
      ctx.closePath();
      ctx.fill();
    }
  }
}
