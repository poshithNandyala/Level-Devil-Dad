import type { Theme } from '../../../render/theme';
import { Ctx, hash } from '../../../render/art/common';
import { sunGlow } from '../../../render/backdrops-west';

/** Gandhinagar at Uttarayan: GIFT City's towers far off, the cone of Dandi Kutir, tree-lined sector
 *  roads, Amdavad's pol houses with carved wooden balconies, a chabutro, and kites everywhere. */
export function gandhinagar(ctx: Ctx, th: Theme, x0: number, x1: number) {
  sunGlow(ctx, 380, 66, 15, th.sun);
  // GIFT City towers on the horizon
  ctx.fillStyle = '#9DB4C8';
  for (const [tx, tw, thh] of [[80, 20, 96], [104, 16, 120], [124, 22, 84], [430, 18, 110], [452, 24, 90]] as [number, number, number][]) {
    ctx.fillRect(tx, 196 - thh, tw, thh);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    for (let y = 196 - thh + 4; y < 196; y += 6) ctx.fillRect(tx + 2, y, tw - 4, 1.4);
    ctx.fillStyle = '#9DB4C8';
  }
  // Dandi Kutir: a white salt-mound cone
  ctx.fillStyle = '#F2EEE6';
  ctx.beginPath();
  ctx.moveTo(220, 196);
  ctx.quadraticCurveTo(250, 120, 280, 196);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 0.8;
  for (let k = 0; k < 4; k++) {
    ctx.beginPath();
    ctx.moveTo(228 + k * 4, 196 - k * 18);
    ctx.lineTo(272 - k * 4, 196 - k * 18);
    ctx.stroke();
  }
  // green sector avenues
  ctx.fillStyle = th.mid;
  for (let x = Math.floor(x0 / 26) * 26 - 26; x < x1 + 26; x += 26) {
    const r = 12 + hash(x, 3) * 6;
    ctx.beginPath();
    ctx.arc(x + 13, 200 - r * 0.4, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = th.near;
  ctx.fillRect(x0 - 4, 200, x1 - x0 + 8, 10);
  // pol houses: narrow, pastel, carved wooden balconies on brackets
  const pal = ['#F4D35E', '#EE964B', '#F95738', '#7EB2DD', '#C5E1A5', '#F7F1E5'];
  for (let x = Math.floor(x0 / 44) * 44 - 44; x < x1 + 44; x += 44) {
    const h = 54 + hash(x, 7) * 20;
    ctx.fillStyle = pal[Math.floor(hash(x, 8) * pal.length)];
    ctx.fillRect(x, 240 - h, 42, h);
    // the wooden jharokha balcony
    ctx.fillStyle = '#7B4A2A';
    ctx.fillRect(x + 6, 240 - h + 14, 30, 12);
    ctx.fillStyle = '#A1673A';
    for (let k = 0; k < 6; k++) ctx.fillRect(x + 8 + k * 5, 240 - h + 16, 2, 8);
    ctx.fillStyle = '#5D3A1E';
    ctx.fillRect(x + 6, 240 - h + 26, 30, 2);
    ctx.fillRect(x + 8, 240 - h + 28, 2, 4);
    ctx.fillRect(x + 32, 240 - h + 28, 2, 4);
    // a flat roof with its parapet: Uttarayan terrace
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(x, 240 - h, 42, 3);
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(x + 14, 240 - h + 40, 12, h - 40);
  }
  // a chabutro (bird-feeder tower) now and then
  for (let x = Math.floor(x0 / 260) * 260 + 150; x < x1 + 40; x += 260) {
    ctx.fillStyle = '#ECE3D0';
    ctx.fillRect(x - 2, 170, 4, 70);
    ctx.fillStyle = '#C9B48A';
    ctx.beginPath();
    ctx.moveTo(x - 14, 172);
    ctx.lineTo(x, 156);
    ctx.lineTo(x + 14, 172);
    ctx.fill();
    ctx.fillRect(x - 12, 172, 24, 4);
  }
}
