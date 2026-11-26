import type { Theme } from '../../../render/theme';
import { circle, Ctx, hash, withAlpha } from '../../../render/art/common';
import { palm } from '../../../render/backdrops-south';
import { sunGlow } from '../../../render/backdrops-west';

// --------------------------------------------------------------- Goa
/** Panaji at sunset: the Mandovi with a ferry and a lit casino boat, the white church on its zigzag
 *  stairs, and the Fontainhas houses in every colour, with red-tile roofs and white trim. */
export function panaji(ctx: Ctx, th: Theme, x0: number, x1: number) {
  sunGlow(ctx, 380, 128, 18, th.sun);
  // Altinho hill behind
  ctx.fillStyle = th.far;
  ctx.beginPath();
  ctx.moveTo(x0 - 8, 300);
  for (let x = x0 - 8; x <= x1 + 8; x += 8) ctx.lineTo(x, 132 - 22 * Math.sin(x * 0.006 + 1.3) - 8 * Math.sin(x * 0.021));
  ctx.lineTo(x1 + 8, 300);
  ctx.fill();
  // the church of Our Lady of the Immaculate Conception, white, with its criss-cross stairs
  const cx = 150;
  ctx.fillStyle = '#FBF8F2';
  ctx.fillRect(cx - 20, 92, 40, 46);
  ctx.fillRect(cx - 26, 104, 8, 34);
  ctx.fillRect(cx + 18, 104, 8, 34);
  ctx.beginPath();
  ctx.moveTo(cx - 9, 92);
  ctx.lineTo(cx, 80);
  ctx.lineTo(cx + 9, 92);
  ctx.fill();
  ctx.fillRect(cx - 1, 72, 2, 9);
  ctx.fillRect(cx - 3.5, 74.5, 7, 2);
  ctx.fillStyle = '#7A6A5A';
  for (const dx of [-12, 0, 12]) {
    ctx.beginPath();
    ctx.arc(cx + dx, 108, 3, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(cx + dx - 3, 108, 6, 8);
  }
  ctx.strokeStyle = '#F2EEE6';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    ctx.moveTo(cx - 34, 160 - i * 8);
    ctx.lineTo(cx + 34, 152 - i * 8);
    ctx.moveTo(cx + 34, 160 - i * 8);
    ctx.lineTo(cx - 34, 152 - i * 8);
  }
  ctx.stroke();
  // the Mandovi
  const rv = ctx.createLinearGradient(0, 160, 0, 205);
  rv.addColorStop(0, '#E39A73');
  rv.addColorStop(1, '#5B4C7A');
  ctx.fillStyle = rv;
  ctx.fillRect(x0 - 4, 162, x1 - x0 + 8, 44);
  ctx.strokeStyle = 'rgba(255,230,190,0.45)';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 26; i++) {
    const wx = x0 + hash(i, 3) * (x1 - x0),
      wy = 166 + hash(i, 4) * 36;
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(wx + 6 + hash(i, 5) * 8, wy);
    ctx.stroke();
  }
  // a casino boat, all lit up
  const bx = 300;
  ctx.fillStyle = '#26203F';
  ctx.fillRect(bx, 168, 78, 12);
  ctx.fillRect(bx + 8, 158, 62, 10);
  ctx.fillRect(bx + 18, 150, 40, 8);
  for (let i = 0; i < 12; i++) circle(ctx, bx + 6 + i * 6, 170, 1, i % 2 ? '#FFD54F' : '#FF4081');
  for (let i = 0; i < 9; i++) circle(ctx, bx + 12 + i * 6.6, 161, 1, i % 3 ? '#40C4FF' : '#FFD54F');
  // the car ferry
  ctx.fillStyle = '#ECEFF1';
  ctx.fillRect(40, 182, 54, 6);
  ctx.fillStyle = '#1E88E5';
  ctx.fillRect(40, 188, 54, 4);
  ctx.fillStyle = '#FBC02D';
  ctx.fillRect(60, 174, 14, 8);
  // Fontainhas: houses in every colour, white trim, red-tile roofs, balcões
  const pal = ['#F6C343', '#3F8FD2', '#5DAE5B', '#D9534F', '#F28C38', '#9C6ADE', '#F2E6C9'];
  for (let x = Math.floor(x0 / 54) * 54 - 54; x < x1 + 54; x += 54) {
    const h = 46 + hash(x, 6) * 22;
    const wall = pal[Math.floor(hash(x, 7) * pal.length)];
    ctx.fillStyle = wall;
    ctx.fillRect(x, 240 - h, 52, h);
    // white pilasters and cornice
    ctx.fillStyle = '#FBF8F2';
    ctx.fillRect(x, 240 - h, 3, h);
    ctx.fillRect(x + 49, 240 - h, 3, h);
    ctx.fillRect(x - 1, 240 - h, 54, 3);
    // the roof
    ctx.fillStyle = '#B5482F';
    ctx.beginPath();
    ctx.moveTo(x - 4, 240 - h);
    ctx.lineTo(x + 26, 240 - h - 12);
    ctx.lineTo(x + 56, 240 - h);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 0.6;
    for (let k = 0; k < 5; k++) {
      ctx.beginPath();
      ctx.moveTo(x + 2 + k * 11, 240 - h - 1);
      ctx.lineTo(x + 6 + k * 11, 240 - h - 7);
      ctx.stroke();
    }
    // tall windows with white frames, shell panes
    for (let i = 0; i < 3; i++) {
      const wx = x + 8 + i * 14;
      ctx.fillStyle = '#FBF8F2';
      ctx.fillRect(wx - 1.5, 240 - h + 10, 10, 18);
      ctx.fillStyle = withAlpha('#FFF4D6', 0.9);
      ctx.fillRect(wx, 240 - h + 12, 7, 14);
      ctx.strokeStyle = 'rgba(120,100,70,0.35)';
      ctx.beginPath();
      ctx.moveTo(wx + 3.5, 240 - h + 12);
      ctx.lineTo(wx + 3.5, 240 - h + 26);
      ctx.moveTo(wx, 240 - h + 19);
      ctx.lineTo(wx + 7, 240 - h + 19);
      ctx.stroke();
    }
    // an azulejo name plate
    if (hash(x, 9) > 0.5) {
      ctx.fillStyle = '#FBF8F2';
      ctx.fillRect(x + 18, 240 - h + 32, 16, 7);
      ctx.fillStyle = '#1565C0';
      ctx.fillRect(x + 19, 240 - h + 33, 14, 5);
    }
  }
  // palms along the riverside
  for (let x = Math.floor(x0 / 130) * 130 + 40; x < x1 + 40; x += 130) palm(ctx, x + hash(x, 2) * 30, 240, 70 + hash(x, 3) * 24, -8 + hash(x, 4) * 16, '#5A3E2B', th.near);
}
