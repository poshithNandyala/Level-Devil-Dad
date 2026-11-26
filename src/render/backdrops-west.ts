import type { Theme } from './theme';
import { Ctx, circle, hash, withAlpha } from './art/common';

/*
 * Backdrops for the western chapters. World units: the room is 512x288 and the
 * playfield ground usually sits around y=240.
 */

export function sunGlow(ctx: Ctx, x: number, y: number, r: number, color: string) {
  const g = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 3.4);
  g.addColorStop(0, withAlpha(color, 0.55));
  g.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r * 3.4, y - r * 3.4, r * 6.8, r * 6.8);
  circle(ctx, x, y, r, color);
}





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

/** evening on the Mandovi: lanterns drifting in the breeze */
export function ambientWest(ctx: Ctx, city: string, x0: number, x1: number, t: number, reduced: boolean) {
  if (city === 'RPR' && !reduced) {
    // egrets drifting over the paddy
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (let i = 0; i < 5; i++) {
      const span = x1 - x0 + 80;
      const x = x0 - 40 + ((hash(i, 81) * span + t * (10 + i * 2)) % span);
      const y = 110 + hash(i, 83) * 50 + Math.sin(t + i) * 4;
      const f = Math.sin(t * 6 + i * 2) * 2.5;
      ctx.fillRect(x - 3, y, 6, 1.5);
      ctx.fillRect(x - 1, y - f, 2, Math.abs(f) + 1);
      ctx.fillRect(x + 3, y - 1, 2, 1);
    }
  }
  if (city === 'BPL' && !reduced) {
    // gulls and the odd painted stork over the lake
    ctx.strokeStyle = 'rgba(250,250,250,0.85)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const span = x1 - x0 + 80;
      const x = x0 - 40 + ((hash(i, 91) * span + t * (12 + i * 3)) % span);
      const y = 70 + hash(i, 93) * 70 + Math.sin(t * 1.2 + i) * 5;
      const f = Math.sin(t * 7 + i * 2) * 2.5;
      ctx.beginPath();
      ctx.moveTo(x - 4, y - f);
      ctx.quadraticCurveTo(x - 2, y - 1, x, y);
      ctx.quadraticCurveTo(x + 2, y - 1, x + 4, y - f);
      ctx.stroke();
    }
  }
  if (city === 'JAI' && !reduced) {
    // pigeons wheeling over the pink city
    ctx.fillStyle = 'rgba(90,90,110,0.75)';
    for (let i = 0; i < 9; i++) {
      const span = x1 - x0 + 80;
      const x = x0 - 40 + ((hash(i, 71) * span + t * (18 + i * 2)) % span);
      const y = 60 + hash(i, 73) * 50 + Math.sin(t * 1.5 + i) * 6;
      const f = Math.sin(t * 12 + i * 2) * 2;
      ctx.beginPath();
      ctx.moveTo(x - 3, y - f);
      ctx.lineTo(x, y);
      ctx.lineTo(x + 3, y - f);
      ctx.lineTo(x, y + 1);
      ctx.fill();
    }
  }
  if (city === 'GNR' && !reduced) {
    // Uttarayan: the sky full of kites, tugging on their strings
    const cols = ['#E53935', '#FFB300', '#43A047', '#1E88E5', '#8E24AA', '#F06292'];
    const span = x1 - x0 + 60;
    for (let i = 0; i < 12; i++) {
      const kx = x0 - 30 + ((hash(i, 41) * span + t * (4 + (i % 3))) % span),
        ky = 30 + hash(i, 42) * 90 + Math.sin(t * 1.3 + i) * 5;
      const sw = Math.sin(t * 2 + i) * 0.25;
      ctx.save();
      ctx.translate(kx, ky);
      ctx.rotate(sw);
      ctx.fillStyle = cols[i % cols.length];
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(5, 0);
      ctx.lineTo(0, 7);
      ctx.lineTo(-5, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(-0.4, -6, 0.8, 13);
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(kx, ky + 7);
      ctx.quadraticCurveTo(kx + 10, ky + 60, kx + 30 - (i % 4) * 14, 240);
      ctx.stroke();
    }
  }
  if (city === 'DMN' && !reduced) {
    // gulls wheeling over the river mouth
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 0.9;
    for (let i = 0; i < 5; i++) {
      const a = t * 0.5 + i * 1.3;
      const bx = x0 + ((hash(i, 31) * (x1 - x0) + t * 12) % (x1 - x0)),
        by = 60 + Math.sin(a) * 14 + i * 8;
      const f = Math.sin(t * 7 + i) * 2;
      ctx.beginPath();
      ctx.moveTo(bx - 4, by - f);
      ctx.quadraticCurveTo(bx - 2, by - 2, bx, by);
      ctx.quadraticCurveTo(bx + 2, by - 2, bx + 4, by - f);
      ctx.stroke();
    }
  }
  if (city === 'PNJ' && !reduced) {
    const span = x1 - x0 + 40;
    for (let i = 0; i < 7; i++) {
      const lx = x0 - 20 + ((hash(i, 21) * span + t * (6 + i)) % span),
        ly = 70 + hash(i, 22) * 60 + Math.sin(t * 0.8 + i) * 4;
      const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 9);
      g.addColorStop(0, 'rgba(255,214,140,0.5)');
      g.addColorStop(1, 'rgba(255,214,140,0)');
      ctx.fillStyle = g;
      ctx.fillRect(lx - 9, ly - 9, 18, 18);
      circle(ctx, lx, ly, 1.2, 'rgba(255,236,190,0.9)');
    }
  }
}
