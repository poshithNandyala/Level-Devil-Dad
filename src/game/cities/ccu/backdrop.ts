import type { Theme } from '../../../render/theme';
import { Ctx, withAlpha } from '../../../render/art/common';

/**
 * Kolkata: the Hooghly in the haze with Howrah Bridge's cantilever towers across it, a white dome with a
 * figure on top (Victoria's shape, generic), a row of old colonial houses with green shutters, and a tram
 * wire strung across the frame. World px, behind the playfield.
 */
export function backdrop(ctx: Ctx, th: Theme, x0: number, x1: number) {
  // the river: a pale band low in the frame
  ctx.fillStyle = withAlpha('#A9B8C2', 0.8);
  ctx.fillRect(x0 - 8, 176, x1 - x0 + 16, 40);
  // Howrah Bridge, repeated every 1100 px: two tall towers, the cantilever arms and the suspended span
  const span = 1100;
  for (let k = Math.floor((x0 - 400) / span); k * span < x1 + 400; k++) {
    const bx = k * span + 120;
    ctx.strokeStyle = withAlpha(th.far, 0.95);
    ctx.lineWidth = 3;
    const deck = 172;
    const tw = [bx, bx + 300];
    for (const t of tw) {
      ctx.beginPath();
      ctx.moveTo(t - 10, deck);
      ctx.lineTo(t - 4, 70);
      ctx.lineTo(t + 4, 70);
      ctx.lineTo(t + 10, deck);
      ctx.stroke();
      ctx.lineWidth = 1.2;
      for (let y = 84; y < deck; y += 16) {
        ctx.beginPath();
        ctx.moveTo(t - 9, y + 16);
        ctx.lineTo(t + 9, y);
        ctx.moveTo(t + 9, y + 16);
        ctx.lineTo(t - 9, y);
        ctx.stroke();
      }
      ctx.lineWidth = 3;
    }
    // the top chords: from each tower out and down, and the high span between them
    ctx.beginPath();
    ctx.moveTo(bx - 150, deck - 8);
    ctx.lineTo(bx, 72);
    ctx.lineTo(bx + 90, 112);
    ctx.lineTo(bx + 210, 112);
    ctx.lineTo(bx + 300, 72);
    ctx.lineTo(bx + 450, deck - 8);
    ctx.stroke();
    ctx.lineWidth = 1;
    for (let x = bx - 140; x < bx + 445; x += 14) {
      const top = x < bx ? deck - 8 - ((x - (bx - 150)) / 150) * (deck - 80) : x < bx + 90 ? 72 + ((x - bx) / 90) * 40 : x < bx + 210 ? 112 : x < bx + 300 ? 112 - ((x - bx - 210) / 90) * 40 : 72 + ((x - bx - 300) / 150) * (deck - 80);
      ctx.beginPath();
      ctx.moveTo(x, deck);
      ctx.lineTo(x + 7, Math.min(deck, top + 4));
      ctx.stroke();
    }
    ctx.fillStyle = withAlpha(th.far, 0.95);
    ctx.fillRect(bx - 160, deck, 620, 5);
  }
  // the white dome with a figure on top, every 1400 px
  for (let k = Math.floor((x0 - 300) / 1400); k * 1400 < x1 + 300; k++) {
    const vx = k * 1400 + 760;
    ctx.fillStyle = withAlpha('#F4F1EA', 0.92);
    ctx.fillRect(vx - 70, 150, 140, 40);
    ctx.fillRect(vx - 28, 128, 56, 24);
    ctx.beginPath();
    ctx.ellipse(vx, 128, 30, 26, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(vx - 3, 96, 6, 8);
    ctx.fillStyle = withAlpha('#3E4A3A', 0.8);
    ctx.fillRect(vx - 1.5, 88, 3, 9);
    ctx.fillRect(vx - 4, 91, 8, 1.5);
    for (const s of [-60, 60]) {
      ctx.fillStyle = withAlpha('#F4F1EA', 0.92);
      ctx.fillRect(vx + s - 6, 134, 12, 18);
      ctx.beginPath();
      ctx.arc(vx + s, 134, 6, Math.PI, 0);
      ctx.fill();
    }
    ctx.fillStyle = withAlpha('#B9C0C4', 0.8);
    for (let i = -3; i <= 3; i++) ctx.fillRect(vx + i * 18 - 3, 160, 6, 12);
  }
  // old houses: three storeys, green shutters, a balcony rail
  for (let i = Math.floor(x0 / 86) - 1; i * 86 < x1 + 86; i++) {
    const hx = i * 86 + ((i * 37) % 19);
    const hw = 64 + ((i * 13) % 18);
    const top = 150 + ((i * 29) % 26);
    const wall = ['#D9C7A3', '#C9A889', '#E2D2B6', '#BFA08A'][((i % 4) + 4) % 4];
    ctx.fillStyle = withAlpha(wall, 0.95);
    ctx.fillRect(hx, top, hw, 244 - top);
    ctx.fillStyle = withAlpha(th.ink, 0.25);
    ctx.fillRect(hx - 2, top - 3, hw + 4, 4);
    for (let r = top + 8; r < 228; r += 20)
      for (let c = hx + 6; c < hx + hw - 10; c += 15) {
        ctx.fillStyle = '#3F7A55';
        ctx.fillRect(c, r, 8, 12);
        ctx.fillStyle = withAlpha('#1F3D2A', 0.6);
        ctx.fillRect(c + 3.5, r, 1, 12);
      }
    ctx.strokeStyle = withAlpha(th.ink, 0.45);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hx + 2, top + 30);
    ctx.lineTo(hx + hw - 2, top + 30);
    ctx.stroke();
  }
  // the tram wire, sagging between poles
  ctx.strokeStyle = withAlpha('#2B2320', 0.55);
  ctx.lineWidth = 1;
  for (let p = Math.floor(x0 / 240) * 240; p < x1 + 240; p += 240) {
    ctx.beginPath();
    ctx.moveTo(p, 104);
    ctx.quadraticCurveTo(p + 120, 112, p + 240, 104);
    ctx.stroke();
    ctx.fillStyle = withAlpha('#3A3530', 0.7);
    ctx.fillRect(p - 1.5, 100, 3, 144);
  }
}
