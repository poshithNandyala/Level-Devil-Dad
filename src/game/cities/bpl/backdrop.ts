import type { Theme } from '../../../render/theme';
import { Ctx, hash } from '../../../render/art/common';
import { sunGlow } from '../../../render/backdrops-west';

/** Bhopal: the Upper Lake wide and pale, hills beyond it, Taj-ul-Masajid's three white domes and two
 *  tall pink minarets, Raja Bhoj standing out in the water, sailboats */
export function bhopal(ctx: Ctx, th: Theme, x0: number, x1: number) {
  sunGlow(ctx, 150, 58, 15, th.sun);
  // Shyamla and Idgah hills
  ctx.fillStyle = '#8FB0A8';
  ctx.beginPath();
  ctx.moveTo(x0 - 10, 196);
  for (let x = x0 - 10; x <= x1 + 10; x += 16) ctx.lineTo(x, 140 + Math.sin(x * 0.009) * 16 + Math.sin(x * 0.031) * 5);
  ctx.lineTo(x1 + 10, 196);
  ctx.fill();
  // little houses climbing the hills
  for (let x = Math.floor(x0 / 22) * 22; x < x1; x += 22) {
    const y = 150 + Math.sin(x * 0.009) * 16 + hash(x, 3) * 22;
    ctx.fillStyle = hash(x, 4) > 0.5 ? '#E9E2CF' : '#D8C9A8';
    ctx.fillRect(x, y, 8 + hash(x, 5) * 6, 7);
  }
  // Taj-ul-Masajid
  const mx = 330;
  ctx.fillStyle = '#D9A9A0';
  ctx.fillRect(mx - 60, 150, 120, 46);
  ctx.fillStyle = 'rgba(90,50,50,0.35)';
  for (let k = 0; k < 7; k++) {
    ctx.beginPath();
    ctx.arc(mx - 48 + k * 16, 180, 5, Math.PI, 0);
    ctx.rect(mx - 53 + k * 16, 180, 10, 16);
    ctx.fill();
  }
  ctx.fillStyle = '#F6F3EC';
  for (const [dx, r] of [[-34, 13], [0, 17], [34, 13]] as const) {
    ctx.beginPath();
    ctx.arc(mx + dx, 150, r, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(mx + dx - 0.8, 150 - r - 7, 1.6, 7);
  }
  for (const dx of [-72, 72]) {
    ctx.fillStyle = '#D9A9A0';
    ctx.fillRect(mx + dx - 5, 96, 10, 100);
    ctx.fillStyle = '#F6F3EC';
    ctx.fillRect(mx + dx - 6.5, 118, 13, 2.5);
    ctx.fillRect(mx + dx - 6.5, 146, 13, 2.5);
    ctx.beginPath();
    ctx.arc(mx + dx, 96, 6, Math.PI, 0);
    ctx.fill();
  }
  // the lake
  const lake = ctx.createLinearGradient(0, 196, 0, 240);
  lake.addColorStop(0, '#BFE3E6');
  lake.addColorStop(1, '#7FBFC8');
  ctx.fillStyle = lake;
  ctx.fillRect(x0 - 10, 196, x1 - x0 + 20, 44);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  for (let x = Math.floor(x0 / 26) * 26; x < x1; x += 26) ctx.fillRect(x + hash(x, 9) * 14, 202 + hash(x, 8) * 30, 9, 1);
  // Raja Bhoj on his plinth out in the water, sword raised
  ctx.fillStyle = '#6B5B45';
  ctx.fillRect(560, 196, 16, 10);
  ctx.fillStyle = '#8A7556';
  ctx.fillRect(564, 172, 8, 24);
  ctx.beginPath();
  ctx.arc(568, 169, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(571, 160, 1.5, 16);
  // sailboats from the boat club
  for (let x = Math.floor(x0 / 170) * 170 + 60; x < x1; x += 170) {
    const y = 214 + hash(x, 12) * 12;
    ctx.fillStyle = '#F6F3EC';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 16);
    ctx.lineTo(x + 9, y);
    ctx.fill();
    ctx.fillStyle = hash(x, 13) > 0.5 ? '#E53935' : '#FB8C00';
    ctx.fillRect(x - 6, y, 16, 2.5);
  }
}
