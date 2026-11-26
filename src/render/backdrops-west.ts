import type { Theme } from './theme';
import { Ctx, circle, hash, withAlpha } from './art/common';
import { palm } from './backdrops-south';

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


/** Daman by day: the sea with trawlers flying flags, the Moti Daman fort wall with its bastions and
 *  lighthouse, the white Bom Jesus church front, and bombil drying on racks along the shore. */
export function daman(ctx: Ctx, th: Theme, x0: number, x1: number) {
  sunGlow(ctx, 110, 70, 15, th.sun);
  // the sea
  const sea = ctx.createLinearGradient(0, 150, 0, 205);
  sea.addColorStop(0, '#4FA3C7');
  sea.addColorStop(1, '#2A6F93');
  ctx.fillStyle = sea;
  ctx.fillRect(x0 - 4, 150, x1 - x0 + 8, 56);
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 24; i++) {
    const wx = x0 + hash(i, 13) * (x1 - x0),
      wy = 156 + hash(i, 14) * 44;
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(wx + 5 + hash(i, 15) * 7, wy);
    ctx.stroke();
  }
  // trawlers with their flags
  for (let x = Math.floor(x0 / 170) * 170 + 30; x < x1 + 60; x += 170) {
    const bx = x + hash(x, 3) * 60,
      by = 168 + hash(x, 4) * 16;
    ctx.fillStyle = ['#1565C0', '#C62828', '#2E7D32'][Math.floor(hash(x, 5) * 3)];
    ctx.beginPath();
    ctx.moveTo(bx - 18, by);
    ctx.lineTo(bx + 20, by);
    ctx.lineTo(bx + 14, by + 7);
    ctx.lineTo(bx - 14, by + 7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(bx - 6, by - 8, 12, 8);
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(bx + 8, by - 22, 1.5, 22);
    ctx.fillStyle = hash(x, 6) > 0.5 ? '#FF6F00' : '#E91E63';
    ctx.beginPath();
    ctx.moveTo(bx + 9.5, by - 22);
    ctx.lineTo(bx + 18, by - 19);
    ctx.lineTo(bx + 9.5, by - 16);
    ctx.fill();
  }
  // the fort wall with its bastions, and the lighthouse
  ctx.fillStyle = '#9E8C72';
  ctx.fillRect(x0 - 4, 196, x1 - x0 + 8, 44);
  for (let x = Math.floor(x0 / 120) * 120 - 120; x < x1 + 120; x += 120) {
    ctx.fillStyle = '#8C7A60';
    ctx.beginPath();
    ctx.moveTo(x, 240);
    ctx.lineTo(x + 6, 186);
    ctx.lineTo(x + 40, 186);
    ctx.lineTo(x + 46, 240);
    ctx.fill();
    ctx.fillStyle = '#A8967A';
    for (let k = 0; k < 4; k++) ctx.fillRect(x + 6 + k * 10, 181, 6, 5);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  for (let x = Math.floor(x0 / 10) * 10; x < x1; x += 10) ctx.fillRect(x, 210 + ((x / 10) % 3) * 9, 6, 1);
  const lx = 300;
  ctx.fillStyle = '#FAFAFA';
  ctx.beginPath();
  ctx.moveTo(lx - 7, 186);
  ctx.lineTo(lx - 4, 112);
  ctx.lineTo(lx + 4, 112);
  ctx.lineTo(lx + 7, 186);
  ctx.fill();
  ctx.fillStyle = '#E53935';
  ctx.fillRect(lx - 5.5, 140, 11, 8);
  ctx.fillRect(lx - 5, 164, 10, 8);
  ctx.fillStyle = '#37474F';
  ctx.fillRect(lx - 6, 104, 12, 8);
  ctx.fillStyle = '#FFF59D';
  ctx.fillRect(lx - 4, 106, 8, 4);
  // Bom Jesus: a white church front with a curly gable
  const cx = 430;
  ctx.fillStyle = '#FBF8F2';
  ctx.fillRect(cx - 20, 142, 40, 44);
  ctx.beginPath();
  ctx.moveTo(cx - 20, 142);
  ctx.quadraticCurveTo(cx - 14, 128, cx, 126);
  ctx.quadraticCurveTo(cx + 14, 128, cx + 20, 142);
  ctx.fill();
  ctx.fillRect(cx - 1, 116, 2, 10);
  ctx.fillRect(cx - 3.5, 119, 7, 2);
  ctx.fillStyle = '#6D5A44';
  ctx.beginPath();
  ctx.arc(cx, 172, 6, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(cx - 6, 172, 12, 14);
  // bombil drying on racks
  for (let x = Math.floor(x0 / 90) * 90 + 50; x < x1 + 40; x += 90) {
    ctx.strokeStyle = '#6D4C41';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, 240);
    ctx.lineTo(x, 214);
    ctx.moveTo(x + 34, 240);
    ctx.lineTo(x + 34, 214);
    ctx.moveTo(x - 2, 214);
    ctx.lineTo(x + 36, 214);
    ctx.stroke();
    ctx.fillStyle = '#E0D2B4';
    for (let k = 0; k < 8; k++) ctx.fillRect(x + 2 + k * 4, 215, 2, 9 + ((k * 3) % 4));
  }
  void palm;
}

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

// --------------------------------------------------------------- Jaipur
/** the Pink City: Nahargarh's walls along the Aravalli ridge, the giant sundial of Jantar Mantar,
 *  and rows of terracotta-pink havelis with white borders, chhatris and the Hawa Mahal's honeycomb */
export function jaipur(ctx: Ctx, th: Theme, x0: number, x1: number) {
  sunGlow(ctx, 110, 62, 15, th.sun);
  // the Aravalli ridge with Nahargarh's crenellated wall snaking along it
  ctx.fillStyle = '#C9A08E';
  ctx.beginPath();
  ctx.moveTo(x0 - 10, 200);
  for (let x = x0 - 10; x <= x1 + 10; x += 16) ctx.lineTo(x, 132 + Math.sin(x * 0.011) * 14 + Math.sin(x * 0.037) * 5);
  ctx.lineTo(x1 + 10, 200);
  ctx.fill();
  ctx.fillStyle = '#B88C7A';
  for (let x = Math.floor(x0 / 8) * 8; x < x1; x += 8) {
    const y = 132 + Math.sin(x * 0.011) * 14 + Math.sin(x * 0.037) * 5;
    ctx.fillRect(x, y - 6, 5, 6);
  }
  // the Samrat Yantra: a giant triangular sundial gnomon with its quadrant
  ctx.fillStyle = '#E2B79A';
  ctx.beginPath();
  ctx.moveTo(300, 200);
  ctx.lineTo(340, 118);
  ctx.lineTo(352, 118);
  ctx.lineTo(352, 200);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,60,40,0.4)';
  ctx.lineWidth = 0.8;
  for (let k = 0; k < 8; k++) {
    ctx.beginPath();
    ctx.moveTo(304 + k * 5, 200 - k * 10);
    ctx.lineTo(352, 200 - k * 10);
    ctx.stroke();
  }
  // havelis: pink with white borders, little chhatris on top
  for (let x = Math.floor(x0 / 48) * 48 - 48; x < x1 + 48; x += 48) {
    const h = 46 + hash(x, 5) * 26;
    ctx.fillStyle = hash(x, 6) > 0.5 ? '#D88B7A' : '#C97B6B';
    ctx.fillRect(x, 240 - h, 46, h);
    ctx.fillStyle = '#F8EDE6';
    ctx.fillRect(x, 240 - h, 46, 2);
    for (let k = 0; k < 3; k++) {
      // arched windows outlined in white
      const wx = x + 6 + k * 13,
        wy = 240 - h + 12;
      ctx.fillStyle = '#F8EDE6';
      ctx.beginPath();
      ctx.moveTo(wx - 1, wy + 12);
      ctx.lineTo(wx - 1, wy + 3);
      ctx.quadraticCurveTo(wx + 4, wy - 4, wx + 9, wy + 3);
      ctx.lineTo(wx + 9, wy + 12);
      ctx.fill();
      ctx.fillStyle = '#7A3B32';
      ctx.fillRect(wx + 1, wy + 4, 6, 8);
    }
    if (hash(x, 9) > 0.45) {
      // a chhatri: four little pillars and a dome
      const cx = x + 23,
        cy = 240 - h;
      ctx.fillStyle = '#E8C3B0';
      ctx.fillRect(cx - 8, cy - 9, 2, 9);
      ctx.fillRect(cx + 6, cy - 9, 2, 9);
      ctx.beginPath();
      ctx.arc(cx, cy - 9, 9, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(cx - 0.5, cy - 21, 1, 4);
    }
  }
  // the Hawa Mahal now and then: a tall pink honeycomb of little windows
  for (let x = Math.floor(x0 / 340) * 340 + 210; x < x1 + 60; x += 340) {
    for (let r = 0; r < 6; r++) {
      const w = 70 - r * 9,
        y = 236 - (r + 1) * 17;
      ctx.fillStyle = r % 2 ? '#D9806E' : '#E0907E';
      ctx.fillRect(x - w / 2, y, w, 17);
      ctx.fillStyle = '#F8EDE6';
      for (let k = -w / 2 + 3; k < w / 2 - 3; k += 6) {
        ctx.beginPath();
        ctx.arc(x + k + 2, y + 6, 2.2, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(x + k, y + 6, 4.4, 6);
      }
    }
  }
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
