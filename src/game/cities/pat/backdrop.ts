import type { Theme } from '../../../render/theme';
import { type Ctx, withAlpha, hash, ellipse } from '../../../render/art/common';

/**
 * Patna, drawn between x0 and x1 in world px: a hazy sky, the Ganga so wide the far bank is a pale line of
 * sand, the Gandhi Setu as a long girder on its piers, Golghar's white beehive dome with its two spiral stairs,
 * a water tank, coaching hoardings and a ghat of steps on the near bank.
 */
export function backdrop(ctx: Ctx, th: Theme, x0: number, x1: number) {
  // far bank: a low pale sandbar
  ctx.fillStyle = th.far;
  ctx.beginPath();
  ctx.moveTo(x0 - 8, 188);
  for (let x = x0 - 8; x <= x1 + 8; x += 24) ctx.lineTo(x, 172 + hash(Math.round(x / 24), 5) * 6);
  ctx.lineTo(x1 + 8, 200);
  ctx.lineTo(x0 - 8, 200);
  ctx.closePath();
  ctx.fill();

  // the river: a brown-grey band with long ripples
  const riv = ctx.createLinearGradient(0, 186, 0, 214);
  riv.addColorStop(0, '#A89B7A');
  riv.addColorStop(1, '#8B8264');
  ctx.fillStyle = riv;
  ctx.fillRect(x0 - 8, 186, x1 - x0 + 16, 28);
  ctx.strokeStyle = withAlpha('#FFF1C9', 0.35);
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 18; i++) {
    const rx = x0 + ((i * 53 + 17) % Math.max(1, Math.round(x1 - x0)));
    const ry = 190 + ((i * 7) % 20);
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + 14 + (i % 3) * 6, ry);
    ctx.stroke();
  }

  // Gandhi Setu: a long box girder on piers, low on the horizon, trucks crawling on it
  const deck = 166;
  ctx.fillStyle = '#6F6A5A';
  ctx.fillRect(x0 - 8, deck, x1 - x0 + 16, 7);
  ctx.fillStyle = '#8A846F';
  ctx.fillRect(x0 - 8, deck, x1 - x0 + 16, 2);
  for (let x = Math.floor(x0 / 121) * 121 - 121; x <= x1 + 121; x += 121) {
    ctx.fillStyle = '#5A5546';
    ctx.fillRect(x, deck + 7, 5, 28);
    ctx.fillStyle = '#7E7762';
    ctx.fillRect(x - 1, deck + 3, 7, 5);
    ctx.fillStyle = '#3F3B30';
    ctx.fillRect(x + 60, deck, 2, 7);
  }
  for (let i = 0; i < 4; i++) {
    const tx = Math.floor(x0 / 240) * 240 + 40 + i * 140;
    if (tx < x0 - 20 || tx > x1 + 20) continue;
    ctx.fillStyle = i % 2 ? '#C2603A' : '#4A7A9A';
    ctx.fillRect(tx, deck - 6, 14, 6);
    ctx.fillStyle = '#2E2A22';
    ctx.fillRect(tx + 2, deck - 1, 3, 2);
    ctx.fillRect(tx + 9, deck - 1, 3, 2);
  }

  // Golghar every 520 px: a white beehive dome with two opposite spiral stairs
  for (let gx = Math.floor((x0 - 120) / 520) * 520 + 360; gx <= x1 + 120; gx += 520) {
    if (gx < x0 - 80 || gx > x1 + 80) continue;
    const base = 214;
    ctx.fillStyle = '#EADFC4';
    ctx.beginPath();
    ctx.moveTo(gx - 40, base);
    ctx.bezierCurveTo(gx - 40, base - 40, gx - 22, base - 70, gx, base - 80);
    ctx.bezierCurveTo(gx + 22, base - 70, gx + 40, base - 40, gx + 40, base);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = withAlpha('#7A5A3A', 0.25);
    ctx.fillRect(gx + 14, base - 70, 24, 70);
    ctx.strokeStyle = '#B9A47E';
    ctx.lineWidth = 1.4;
    for (const dir of [1, -1]) {
      ctx.beginPath();
      for (let t = 0; t <= 1; t += 0.04) {
        const y = base - t * 74;
        const r = 40 * Math.sqrt(Math.max(0, 1 - t * t * 1.02));
        const px = gx + dir * Math.sin(t * 9) * r * 0.92;
        if (t === 0) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
      }
      ctx.stroke();
    }
    ctx.fillStyle = '#EADFC4';
    ctx.fillRect(gx - 3, base - 86, 6, 8);
    ctx.fillStyle = '#6B4A2C';
    ctx.beginPath();
    ctx.arc(gx, base, 6, Math.PI, 0);
    ctx.fill();
  }

  // near bank: embankment, flat-roofed houses, coaching hoardings, water tanks, a ghat of steps
  ctx.fillStyle = th.near;
  ctx.fillRect(x0 - 8, 214, x1 - x0 + 16, 40);
  ctx.fillStyle = withAlpha('#9C5A3C', 0.5);
  ctx.fillRect(x0 - 8, 224, x1 - x0 + 16, 30);
  for (let i = 0; i < 9; i++) {
    const hx = x0 + 10 + i * 66 + ((i * 29) % 17);
    const hw = 28 + ((i * 13) % 14);
    const hh = 14 + ((i * 7) % 11);
    ctx.fillStyle = i % 3 === 0 ? '#E5D3A8' : i % 3 === 1 ? '#D8B98A' : '#C9A27A';
    ctx.fillRect(hx, 222 - hh, hw, hh + 4);
    ctx.fillStyle = withAlpha('#3A1E10', 0.35);
    for (let wy = 0; wy < Math.floor(hh / 7); wy++) for (let wx = 0; wx < Math.floor(hw / 9); wx++) ctx.fillRect(hx + 3 + wx * 9, 222 - hh + 3 + wy * 7, 4, 4);
    if (i % 4 === 1) {
      ctx.fillStyle = '#D7262E';
      ctx.fillRect(hx + 2, 222 - hh - 10, hw - 4, 9);
      ctx.fillStyle = '#F2B705';
      ctx.fillRect(hx + 2, 222 - hh - 4, hw - 4, 2);
    }
    if (i % 5 === 2) {
      ctx.fillStyle = '#4A4A44';
      ctx.fillRect(hx + hw / 2 - 5, 222 - hh - 8, 1.5, 8);
      ctx.fillRect(hx + hw / 2 + 4, 222 - hh - 8, 1.5, 8);
      ellipse(ctx, hx + hw / 2, 222 - hh - 11, 8, 5, '#2F5A78');
    }
  }
  for (let gx = Math.floor((x0 - 60) / 400) * 400 + 120; gx <= x1 + 60; gx += 400) {
    for (let s = 0; s < 5; s++) {
      ctx.fillStyle = s % 2 ? '#B9A07A' : '#C9B08A';
      ctx.fillRect(gx + s * 3, 206 + s * 2, 40 - s * 6, 2.5);
    }
  }
}
