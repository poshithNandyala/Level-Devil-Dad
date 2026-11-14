// Backdrops for famous places around each state (tea hills, backwaters, forts, canyons,
// waterfalls, palaces at night, caves, markets, film sets). Static: drawn once per stage
// into the background cache. World space: the room is 512 x 288, the ground line ~240.

import type { SceneDef } from '../game/world';
import type { Ctx } from './art/common';
import { circle, ellipse, fillRR, hash, shade, withAlpha } from './art/common';
import { palm } from './backdrops-south';
import { charminar } from './backgrounds';

const SKY: Record<SceneDef['kind'], [string, string, string]> = {
  hills: ['#9FD3E6', '#D7EEE9', '#EEF4E0'],
  water: ['#7EC8E3', '#BFE6EE', '#F2EBD3'],
  rock: ['#F2B880', '#F7D9A8', '#FBEBCB'],
  falls: ['#8FC9D9', '#CBE8E4', '#E6F2DF'],
  night: ['#0F1A3A', '#27305E', '#4A3F6B'],
  cave: ['#1A1412', '#2B211C', '#3A2C24'],
  market: ['#F6C27A', '#FADDA6', '#FCEBCB'],
  filmset: ['#9CC9F0', '#D3E7F7', '#F1EEE3'],
};

function band(ctx: Ctx, x0: number, x1: number, base: number, amp: number, freq: number, seed: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x0 - 8, 320);
  for (let x = x0 - 8; x <= x1 + 8; x += 6) {
    const y = base - amp * (0.55 + 0.45 * Math.sin(x * freq + seed) * Math.sin(x * freq * 0.41 + seed * 1.7));
    ctx.lineTo(x, y);
  }
  ctx.lineTo(x1 + 8, 320);
  ctx.closePath();
  ctx.fill();
}

function sun(ctx: Ctx, x: number, y: number, r: number, color: string) {
  const g = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 3.2);
  g.addColorStop(0, withAlpha(color, 0.5));
  g.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r * 3.2, y - r * 3.2, r * 6.4, r * 6.4);
  circle(ctx, x, y, r, color);
}

function clouds(ctx: Ctx, x0: number, x1: number, seed: number, color = 'rgba(255,255,255,0.7)') {
  for (let i = 0; i < 6; i++) {
    const cx = x0 + ((hash(i, seed) * 1.7) % 1) * (x1 - x0);
    const cy = 30 + hash(i, seed + 3) * 50;
    const s = 0.7 + hash(i, seed + 7) * 0.8;
    ellipse(ctx, cx, cy, 26 * s, 8 * s, color);
    ellipse(ctx, cx + 12 * s, cy - 5 * s, 15 * s, 8 * s, color);
  }
}

function mist(ctx: Ctx, x0: number, x1: number, y: number, a: number) {
  const g = ctx.createLinearGradient(0, y - 18, 0, y + 18);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(0.5, `rgba(255,255,255,${a})`);
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x0, y - 18, x1 - x0, 36);
}

// ------------------------------------------------------------------ tea hills (Munnar, Ooty)
/** Indroda: dry scrub forest on low hills, flat-topped babool trees and life-size dinosaur models */
function dinoPark(ctx: Ctx, x0: number, x1: number) {
  sun(ctx, 420, 50, 13, '#FFF1C2');
  clouds(ctx, x0, x1, 23);
  band(ctx, x0, x1, 150, 30, 0.01, 2.2, '#B7B98A');
  band(ctx, x0, x1, 186, 26, 0.018, 4.4, '#98A56A');
  // flat-topped babool trees
  for (let i = 0; i < 10; i++) {
    const x = x0 + 20 + i * 56 + hash(i, 31) * 24;
    const base = 196 + hash(i, 33) * 10;
    ctx.fillStyle = '#5B4A3A';
    ctx.fillRect(x - 1, base - 22, 2, 22);
    ellipse(ctx, x, base - 24, 13, 4.5, '#6E8A45');
  }
  // the models: a long-neck, a three-horn and a big theropod, in the park's paint
  const col = '#5E7A48';
  const sauropod = (x: number, y: number) => {
    ellipse(ctx, x, y - 16, 20, 10, col);
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x + 12, y - 22);
    ctx.quadraticCurveTo(x + 24, y - 60, x + 34, y - 62);
    ctx.lineTo(x + 36, y - 56);
    ctx.quadraticCurveTo(x + 26, y - 50, x + 18, y - 14);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 16, y - 18);
    ctx.quadraticCurveTo(x - 34, y - 14, x - 44, y - 4);
    ctx.lineTo(x - 18, y - 10);
    ctx.fill();
    for (const dx of [-12, -4, 6, 13]) ctx.fillRect(x + dx, y - 10, 4, 10);
  };
  const trike = (x: number, y: number) => {
    ellipse(ctx, x, y - 9, 13, 7, '#7A6A44');
    ctx.fillStyle = '#7A6A44';
    ctx.beginPath();
    ctx.arc(x + 13, y - 12, 7, Math.PI * 1.2, Math.PI * 2.3);
    ctx.fill();
    ctx.fillStyle = '#E8DFC8';
    ctx.fillRect(x + 16, y - 15, 6, 1.4);
    ctx.fillRect(x + 17, y - 11, 5, 1.2);
    ctx.fillStyle = '#7A6A44';
    for (const dx of [-8, -2, 4, 9]) ctx.fillRect(x + dx, y - 5, 3, 5);
  };
  sauropod(x0 + 140, 214);
  trike(x0 + 330, 216);
  sauropod(x1 - 60, 210);
  band(ctx, x0, x1, 222, 14, 0.03, 6.1, '#8C9A5C');
}

/** Gir: golden grass under dry teak forest, the Girnar hills far off, a lion on a rock */
function girForest(ctx: Ctx, x0: number, x1: number) {
  sun(ctx, 120, 56, 14, '#FFE6A8');
  clouds(ctx, x0, x1, 29);
  band(ctx, x0, x1, 140, 46, 0.008, 1.7, '#A99A7E');
  band(ctx, x0, x1, 176, 22, 0.02, 3.3, '#C2A15E');
  // teak trees: tall pale trunks and big drooping leaf clusters
  for (let i = 0; i < 12; i++) {
    const x = x0 + 16 + i * 46 + hash(i, 41) * 20;
    const base = 206 + hash(i, 43) * 8;
    const h = 40 + hash(i, 45) * 26;
    ctx.fillStyle = '#9C8A70';
    ctx.fillRect(x - 1.5, base - h, 3, h);
    ellipse(ctx, x - 6, base - h, 10, 7, '#8C8A4A');
    ellipse(ctx, x + 6, base - h + 4, 9, 6, '#7D7C3E');
  }
  // a lion sitting on a far rock
  ellipse(ctx, x0 + 300, 196, 22, 9, '#8E7E66');
  ctx.fillStyle = '#B58A44';
  ctx.beginPath();
  ctx.ellipse(x0 + 300, 184, 7, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7A5426';
  ctx.beginPath();
  ctx.arc(x0 + 306, 180, 4, 0, Math.PI * 2);
  ctx.fill();
  band(ctx, x0, x1, 220, 14, 0.035, 7.7, '#D2B06A');
}

/** a village mela at night: a giant wheel in lights, tent tops, bunting */
function melaNight(ctx: Ctx, x0: number, x1: number) {
  const glow = ctx.createLinearGradient(0, 130, 0, 260);
  glow.addColorStop(0, 'rgba(255,150,80,0)');
  glow.addColorStop(1, 'rgba(255,170,90,0.32)');
  ctx.fillStyle = glow;
  ctx.fillRect(x0, 130, x1 - x0, 130);
  // the giant wheel
  const cx = 150,
    cy = 150,
    R = 62;
  ctx.strokeStyle = 'rgba(255,220,150,0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.stroke();
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
    ctx.stroke();
    circle(ctx, cx + Math.cos(a) * R, cy + Math.sin(a) * R + 3, 3, ['#FF5252', '#FFEB3B', '#40C4FF', '#69F0AE'][k % 4]);
  }
  ctx.fillStyle = '#3A2A4A';
  ctx.beginPath();
  ctx.moveTo(cx - 26, 232);
  ctx.lineTo(cx, cy);
  ctx.lineTo(cx + 26, 232);
  ctx.fill();
  // tents
  for (let i = 0; i < 5; i++) {
    const tx = 250 + i * 62;
    ctx.fillStyle = i % 2 ? '#B71C5A' : '#E65100';
    ctx.beginPath();
    ctx.moveTo(tx - 24, 206);
    ctx.lineTo(tx, 176 - (i % 3) * 6);
    ctx.lineTo(tx + 24, 206);
    ctx.fill();
    ctx.fillStyle = '#4A2040';
    ctx.fillRect(tx - 22, 206, 44, 26);
    ctx.fillStyle = 'rgba(255,220,150,0.55)';
    ctx.fillRect(tx - 6, 212, 12, 16);
  }
  for (let x = x0; x < x1; x += 7) circle(ctx, x, 96 + Math.sin(x * 0.04) * 9, 1.1, ['#FFEB3B', '#FF5252', '#69F0AE', '#40C4FF'][(x / 7) % 4 | 0]);
}

/** Jaipur from the air on Diwali night: Nahargarh's lit walls along the ridge, the city's grid of
 *  lamps below it, every roof edged in diyas */
function diwaliNight(ctx: Ctx, x0: number, x1: number) {
  // the Aravalli ridge and the fort wall along its crest
  ctx.fillStyle = '#1E2140';
  ctx.beginPath();
  ctx.moveTo(x0, 190);
  for (let x = x0; x <= x1; x += 8) ctx.lineTo(x, 150 + Math.sin(x * 0.012) * 18 + Math.sin(x * 0.041) * 6);
  ctx.lineTo(x1, 260);
  ctx.lineTo(x0, 260);
  ctx.fill();
  for (let x = x0; x <= x1; x += 6) {
    const y = 150 + Math.sin(x * 0.012) * 18 + Math.sin(x * 0.041) * 6;
    ctx.fillStyle = 'rgba(255,200,110,0.85)';
    ctx.fillRect(x, y - 3, 3, 2);
  }
  // the city: blocks with windows and rows of diyas
  for (let i = 0; i < 60; i++) {
    const bx = x0 + hash(i, 11) * (x1 - x0);
    const h = 10 + hash(i, 13) * 26;
    ctx.fillStyle = '#2A1F3D';
    ctx.fillRect(bx, 236 - h, 16 + hash(i, 17) * 14, h);
    ctx.fillStyle = 'rgba(255,190,90,0.9)';
    for (let k = 0; k < 5; k++) ctx.fillRect(bx + 1 + k * 4, 236 - h - 1.5, 1.5, 1.5);
    ctx.fillStyle = 'rgba(255,220,150,0.5)';
    ctx.fillRect(bx + 4, 236 - h + 5, 3, 4);
  }
}

/** Amer: the honey-coloured fort climbing its hill above Maota lake, the wall snaking up the ridges */
function amerFort(ctx: Ctx, x0: number, x1: number) {
  sun(ctx, 420, 50, 13, '#FFF4C8');
  clouds(ctx, x0, x1, 7);
  band(ctx, x0, x1, 120, 50, 0.009, 0.7, '#B9A27E');
  band(ctx, x0, x1, 160, 34, 0.013, 2.9, '#A8946E');
  // the wall along the far ridge, with its watchtowers
  ctx.strokeStyle = '#D9C39A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = x0; x <= x1; x += 6) {
    const y = 118 + Math.sin(x * 0.009 + 0.7) * 40;
    if (x === x0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  for (let x = x0 + 30; x < x1; x += 90) {
    const y = 118 + Math.sin(x * 0.009 + 0.7) * 40;
    ctx.fillStyle = '#D9C39A';
    ctx.fillRect(x - 3, y - 8, 6, 9);
  }
  // the palace: tiers of honey stone, arcades, chhatris on the corners
  const bx = 150;
  ctx.fillStyle = '#E8C98A';
  ctx.fillRect(bx, 150, 230, 80);
  ctx.fillStyle = '#F0D69C';
  ctx.fillRect(bx + 30, 126, 170, 26);
  ctx.fillRect(bx + 80, 108, 80, 20);
  ctx.fillStyle = 'rgba(120,80,40,0.45)';
  for (let k = 0; k < 14; k++) {
    ctx.beginPath();
    ctx.arc(bx + 14 + k * 15.5, 200, 4, Math.PI, 0);
    ctx.rect(bx + 10 + k * 15.5, 200, 8, 12);
    ctx.fill();
  }
  for (let k = 0; k < 9; k++) ctx.fillRect(bx + 40 + k * 17, 134, 5, 9);
  for (const cx of [bx + 6, bx + 224, bx + 36, bx + 194, bx + 120]) {
    const top = cx === bx + 120 ? 100 : cx < bx + 20 || cx > bx + 210 ? 142 : 118;
    ctx.fillStyle = '#F6E2B3';
    ctx.beginPath();
    ctx.arc(cx, top, 7, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(cx - 6, top, 2, 8);
    ctx.fillRect(cx + 4, top, 2, 8);
  }
  // the ramp the elephants climb, and the lake
  ctx.fillStyle = '#D2B47C';
  ctx.beginPath();
  ctx.moveTo(x0, 236);
  ctx.lineTo(bx, 196);
  ctx.lineTo(bx, 236);
  ctx.fill();
  ctx.fillStyle = 'rgba(120,170,190,0.55)';
  ctx.fillRect(bx + 240, 222, x1 - bx - 240, 14);
}

/** Bastar's sal forest: tall straight trunks, layer on layer, light coming down between them */
function salForest(ctx: Ctx, x0: number, x1: number) {
  band(ctx, x0, x1, 150, 26, 0.012, 0.4, '#6FA36A');
  for (let layer = 0; layer < 3; layer++) {
    const gap = 46 - layer * 9;
    const col = ['#5C8F5A', '#47784A', '#35613C'][layer];
    const trunk = ['#7B6A55', '#6A5947', '#57483A'][layer];
    for (let x = Math.floor(x0 / gap) * gap - gap; x < x1 + gap; x += gap) {
      const tx = x + hash(x + layer * 13, 3) * gap * 0.6;
      const top = 60 + layer * 22 + hash(x, 5 + layer) * 30;
      ctx.fillStyle = trunk;
      ctx.fillRect(tx, top, 3 + layer, 240 - top);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(tx + 2, top, 13 + layer * 3, 20 + layer * 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(tx - 6, top + 14, 9 + layer * 2, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // shafts of light
  ctx.fillStyle = 'rgba(255,250,200,0.08)';
  for (let x = Math.floor(x0 / 120) * 120; x < x1; x += 120) {
    ctx.beginPath();
    ctx.moveTo(x + 40, 0);
    ctx.lineTo(x + 62, 0);
    ctx.lineTo(x + 20, 240);
    ctx.lineTo(x - 14, 240);
    ctx.fill();
  }
}

function hills(ctx: Ctx, x0: number, x1: number, f: Set<string>) {
  if (f.has('dinos')) return dinoPark(ctx, x0, x1);
  if (f.has('gir')) return girForest(ctx, x0, x1);
  if (f.has('amer')) return amerFort(ctx, x0, x1);
  if (f.has('sal')) return salForest(ctx, x0, x1);
  sun(ctx, 400, 54, 13, '#FFF4C8');
  clouds(ctx, x0, x1, 11);
  band(ctx, x0, x1, 128, 46, 0.011, 1.2, '#8FB8A8');
  mist(ctx, x0, x1, 120, 0.55);
  band(ctx, x0, x1, 168, 40, 0.016, 3.1, '#6FA77C');
  // tea rows: curved stripes that follow the slope
  ctx.strokeStyle = 'rgba(40,90,50,0.35)';
  ctx.lineWidth = 1.2;
  for (let r = 0; r < 9; r++) {
    ctx.beginPath();
    for (let x = x0 - 8; x <= x1 + 8; x += 8) {
      const y = 150 + r * 8 - 34 * (0.55 + 0.45 * Math.sin(x * 0.016 + 3.1) * Math.sin(x * 0.016 * 0.41 + 3.1 * 1.7)) + Math.sin(x * 0.05 + r) * 1.5;
      if (x === x0 - 8) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  mist(ctx, x0, x1, 170, 0.4);
  band(ctx, x0, x1, 212, 26, 0.022, 5.3, '#4F8F5E');
  // silver oaks (shade trees in tea estates)
  for (let i = 0; i < 9; i++) {
    const x = x0 + 30 + i * 62 + hash(i, 4) * 20;
    const base = 196 + hash(i, 9) * 12;
    ctx.fillStyle = '#5B4636';
    ctx.fillRect(x - 0.8, base - 26, 1.6, 26);
    ellipse(ctx, x, base - 28, 5, 9, '#3F7650');
  }
  if (f.has('train')) {
    // a little blue mountain train on a hillside track
    ctx.strokeStyle = '#6B5A4A';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x0, 186);
    ctx.quadraticCurveTo(256, 150, x1, 172);
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const x = 300 + i * 17;
      fillRR(ctx, x, 152 + i * 1.3, 15, 8, 1.5, i === 0 ? '#3B5BA5' : '#4A6FC4', '#23386B');
      ctx.fillStyle = '#E8EEF8';
      ctx.fillRect(x + 2, 154 + i * 1.3, 11, 2);
    }
  }
}

// ------------------------------------------------------------------ water (backwaters, beaches, sea)
function water(ctx: Ctx, x0: number, x1: number, f: Set<string>, th: [string, string, string]) {
  sun(ctx, 120, 62, 14, '#FFF1C1');
  clouds(ctx, x0, x1, 23);
  const horizon = f.has('sea') ? 150 : 172;
  if (f.has('ropeway')) {
    // a green hill with a ropeway (Kailasagiri, Vizag)
    band(ctx, x0, x1, 120, 60, 0.008, 0.4, '#7EA86F');
    ctx.strokeStyle = '#3E3E42';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0, 160);
    ctx.lineTo(x1, 70);
    ctx.stroke();
    for (const k of [0.3, 0.62]) {
      const x = x0 + (x1 - x0) * k,
        y = 160 - 90 * k;
      fillRR(ctx, x - 5, y + 3, 10, 8, 2, '#E8572A');
    }
  } else band(ctx, x0, x1, horizon - 2, 10, 0.02, 2.2, '#8FB3A0');
  // water body with streaks
  const g = ctx.createLinearGradient(0, horizon, 0, 260);
  g.addColorStop(0, withAlpha(th[0], 0.95));
  g.addColorStop(1, shade(th[0], -0.25));
  ctx.fillStyle = g;
  ctx.fillRect(x0, horizon, x1 - x0, 260 - horizon);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  for (let i = 0; i < 40; i++) {
    const x = x0 + hash(i, 5) * (x1 - x0),
      y = horizon + 4 + hash(i, 8) * (240 - horizon);
    ctx.fillRect(x, y, 6 + hash(i, 2) * 14, 1);
  }
  if (f.has('lighthouse')) {
    const x = 430;
    ctx.fillStyle = '#F4F1EA';
    ctx.beginPath();
    ctx.moveTo(x - 9, horizon);
    ctx.lineTo(x - 5, horizon - 96);
    ctx.lineTo(x + 5, horizon - 96);
    ctx.lineTo(x + 9, horizon);
    ctx.fill();
    ctx.fillStyle = '#D9443C';
    for (let i = 0; i < 4; i++) ctx.fillRect(x - 8 + i * 0.9, horizon - 20 - i * 22, 16 - i * 1.8, 8);
    fillRR(ctx, x - 7, horizon - 108, 14, 12, 2, '#3E3E42');
    sun(ctx, x, horizon - 102, 3, '#FFE9A0');
  }
  if (f.has('plane')) {
    // a little island airstrip and a turboprop
    ctx.fillStyle = '#E9DFC4';
    ctx.fillRect(x0, horizon - 3, x1 - x0, 5);
    ctx.fillStyle = '#7A7A7A';
    ctx.fillRect(x0, horizon - 1, x1 - x0, 1);
    const x = 300;
    fillRR(ctx, x, horizon - 10, 40, 6, 3, '#FFFFFF', '#9AA3AD');
    ctx.fillStyle = '#2E6E8E';
    ctx.fillRect(x + 6, horizon - 9, 28, 1);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 12, horizon - 14, 14, 3);
    ctx.fillRect(x + 34, horizon - 16, 4, 7);
  }
  if (f.has('nets')) {
    // Chinese fishing nets: big cantilevered frames along the shore
    for (const nx of [70, 210, 470]) {
      ctx.strokeStyle = '#4A3A2A';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(nx, horizon + 6);
      ctx.lineTo(nx + 34, horizon - 54);
      ctx.moveTo(nx + 34, horizon - 54);
      ctx.lineTo(nx + 70, horizon - 8);
      ctx.moveTo(nx + 34, horizon - 54);
      ctx.lineTo(nx - 6, horizon - 30);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(60,50,40,0.5)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(nx + 52, horizon - 30);
      ctx.quadraticCurveTo(nx + 61, horizon - 4, nx + 72, horizon - 10);
      ctx.stroke();
    }
  }
  if (f.has('houseboats')) {
    for (const bx of [140, 380]) {
      ctx.fillStyle = '#5A3A22';
      ctx.beginPath();
      ctx.moveTo(bx - 34, horizon + 8);
      ctx.quadraticCurveTo(bx, horizon + 18, bx + 34, horizon + 8);
      ctx.lineTo(bx + 30, horizon + 12);
      ctx.lineTo(bx - 30, horizon + 12);
      ctx.fill();
      ctx.fillStyle = '#C9A36A';
      ctx.beginPath();
      ctx.moveTo(bx - 26, horizon + 8);
      ctx.quadraticCurveTo(bx, horizon - 8, bx + 26, horizon + 8);
      ctx.fill();
    }
  }
  if (f.has('bridge')) {
    // a long, low sea bridge on piers, with a lifting span in the middle
    ctx.fillStyle = '#6E6A63';
    ctx.fillRect(x0, horizon + 18, x1 - x0, 5);
    for (let x = x0; x < x1; x += 22) ctx.fillRect(x, horizon + 23, 3, 18);
    ctx.strokeStyle = '#3E3E42';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(240, horizon + 18);
    ctx.lineTo(262, horizon - 10);
    ctx.lineTo(284, horizon + 18);
    ctx.stroke();
  }
  if (f.has('submarine')) {
    // a submarine parked on the beach as a museum
    fillRR(ctx, 330, horizon + 6, 120, 16, 8, '#3E4A52', '#232B30');
    fillRR(ctx, 372, horizon - 8, 22, 16, 3, '#3E4A52', '#232B30');
    ctx.fillStyle = '#E2D7B6';
    ctx.fillRect(300, horizon + 21, 180, 5);
  }
  if (f.has('palms') || f.has('houseboats') || f.has('nets')) {
    for (let i = 0; i < 6; i++) {
      const x = x0 + 20 + i * 96 + hash(i, 3) * 30;
      palm(ctx, x, horizon + 4, 52 + hash(i, 6) * 18, (hash(i, 1) - 0.5) * 18, '#6B4A2E', '#3E7B3A');
    }
  }
}

// ------------------------------------------------------------------ rock (forts, boulders, canyons)
/** inside a stepwell: tier under tier of carved galleries going down into the shade, light falling in */
function stepwell(ctx: Ctx, x0: number, x1: number) {
  const bg = ctx.createLinearGradient(0, 30, 0, 290);
  bg.addColorStop(0, '#A9845A');
  bg.addColorStop(1, '#3E2B1A');
  ctx.fillStyle = bg;
  ctx.fillRect(x0, 30, x1 - x0, 270);
  for (let tier = 0; tier < 5; tier++) {
    const y = 40 + tier * 44;
    const k = tier / 5;
    // the gallery's dark depths, its lintel, and a row of squat pillars with bracket capitals
    ctx.fillStyle = `rgba(30,18,8,${0.35 + k * 0.3})`;
    ctx.fillRect(x0, y + 7, x1 - x0, 30);
    ctx.fillStyle = shade('#B48A5A', -0.08 - k * 0.25);
    ctx.fillRect(x0, y, x1 - x0, 7);
    ctx.fillStyle = 'rgba(255,230,190,0.18)';
    ctx.fillRect(x0, y, x1 - x0, 1);
    ctx.fillStyle = shade('#9C7448', -0.1 - k * 0.25);
    const step = 34 - tier * 2;
    for (let x = x0 + ((tier * 11) % step); x < x1; x += step) {
      ctx.fillRect(x, y + 7, 6, 30);
      ctx.fillRect(x - 3, y + 7, 12, 3);
      ctx.fillRect(x - 2, y + 34, 10, 3);
    }
  }
  // shafts of sunlight falling through the openings
  for (let i = 0; i < 3; i++) {
    const sx = x0 + 90 + i * ((x1 - x0) / 3) + hash(i, 7) * 40;
    const g = ctx.createLinearGradient(sx, 30, sx - 70, 290);
    g.addColorStop(0, 'rgba(255,226,160,0.22)');
    g.addColorStop(1, 'rgba(255,226,160,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(sx, 30);
    ctx.lineTo(sx + 22, 30);
    ctx.lineTo(sx - 46, 290);
    ctx.lineTo(sx - 84, 290);
    ctx.fill();
  }
}

/** Jantar Mantar: the giant sundial's triangle and its quadrants, the Ram Yantra's drums, all in
 *  warm sandstone under a clear sky */
function yantras(ctx: Ctx, x0: number, x1: number) {
  band(ctx, x0, x1, 186, 24, 0.01, 1.3, '#D9B48F');
  // the Samrat Yantra: a huge staircase triangle with a quadrant either side
  for (const cx of [130, 400]) {
    ctx.fillStyle = '#E6C3A0';
    ctx.beginPath();
    ctx.moveTo(cx - 60, 220);
    ctx.lineTo(cx + 20, 70);
    ctx.lineTo(cx + 34, 70);
    ctx.lineTo(cx + 34, 220);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,70,40,0.35)';
    ctx.lineWidth = 0.8;
    for (let k = 0; k < 14; k++) {
      ctx.beginPath();
      ctx.moveTo(cx - 60 + k * 5.7, 220 - k * 10.7);
      ctx.lineTo(cx + 34, 220 - k * 10.7);
      ctx.stroke();
    }
    ctx.strokeStyle = '#C9A27E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx + 34, 220, 46, Math.PI, Math.PI * 1.5);
    ctx.stroke();
  }
  // the Ram Yantra's open drums with their pillars
  for (const cx of [265, 520]) {
    ctx.fillStyle = '#D8AE8A';
    ctx.fillRect(cx - 30, 170, 60, 50);
    ctx.fillStyle = '#C49A76';
    for (let k = 0; k < 6; k++) ctx.fillRect(cx - 28 + k * 11, 160, 5, 60);
  }
}

/** under Bhimbetka's overhangs: a wall of warm sandstone, thirty thousand years of red and white
 *  paintings on it (deer, dancers hand in hand, a hunter or two) */
function bhimbetka(ctx: Ctx, x0: number, x1: number) {
  const bg = ctx.createLinearGradient(0, 20, 0, 260);
  bg.addColorStop(0, '#6B4A36');
  bg.addColorStop(0.5, '#B98A62');
  bg.addColorStop(1, '#8C6244');
  ctx.fillStyle = bg;
  ctx.fillRect(x0, 0, x1 - x0, 260);
  // strata and cracks
  ctx.strokeStyle = 'rgba(70,40,25,0.25)';
  ctx.lineWidth = 1;
  for (let y = 40; y < 240; y += 26) {
    ctx.beginPath();
    ctx.moveTo(x0, y);
    for (let x = x0; x <= x1; x += 24) ctx.lineTo(x, y + Math.sin(x * 0.02 + y) * 4);
    ctx.stroke();
  }
  // the overhang's shadow
  const sh = ctx.createLinearGradient(0, 0, 0, 70);
  sh.addColorStop(0, 'rgba(30,15,10,0.75)');
  sh.addColorStop(1, 'rgba(30,15,10,0)');
  ctx.fillStyle = sh;
  ctx.fillRect(x0, 0, x1 - x0, 70);
  // paintings
  for (let i = Math.floor(x0 / 70); i < x1 / 70; i++) {
    const bx = i * 70 + hash(i, 3) * 30,
      by = 90 + hash(i, 5) * 90;
    const white = hash(i, 7) > 0.6;
    ctx.fillStyle = ctx.strokeStyle = white ? 'rgba(240,228,205,0.5)' : 'rgba(150,50,28,0.5)';
    ctx.lineWidth = 1.2;
    const kind = Math.floor(hash(i, 9) * 3);
    if (kind === 0) {
      // a deer
      ctx.fillRect(bx, by, 14, 5);
      ctx.fillRect(bx + 12, by - 5, 3, 6);
      ctx.fillRect(bx + 1, by + 5, 1.5, 6);
      ctx.fillRect(bx + 11, by + 5, 1.5, 6);
      ctx.beginPath();
      ctx.moveTo(bx + 14, by - 5);
      ctx.lineTo(bx + 17, by - 11);
      ctx.moveTo(bx + 14, by - 5);
      ctx.lineTo(bx + 12, by - 11);
      ctx.stroke();
    } else if (kind === 1) {
      // dancers in a row, hand in hand
      for (let k = 0; k < 4; k++) {
        const fx = bx + k * 8;
        ctx.beginPath();
        ctx.arc(fx, by - 6, 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(fx, by - 4);
        ctx.lineTo(fx, by + 4);
        ctx.lineTo(fx - 2, by + 9);
        ctx.moveTo(fx, by + 4);
        ctx.lineTo(fx + 2, by + 9);
        ctx.moveTo(fx - 4, by - 1);
        ctx.lineTo(fx + 4, by - 1);
        ctx.stroke();
      }
    } else {
      // a hunter with a bow
      ctx.beginPath();
      ctx.arc(bx, by - 6, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(bx, by - 4);
      ctx.lineTo(bx, by + 5);
      ctx.lineTo(bx - 3, by + 11);
      ctx.moveTo(bx, by + 5);
      ctx.lineTo(bx + 3, by + 11);
      ctx.moveTo(bx, by - 1);
      ctx.lineTo(bx + 7, by - 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(bx + 7, by - 2, 6, -1.2, 1.2);
      ctx.stroke();
    }
  }
}

/** inside a BHEL erection shop: a long shed, roof trusses, yellow gantry rails, turbine casings and
 *  big wound rotors on stands */
function bhelShop(ctx: Ctx, x0: number, x1: number) {
  const bg = ctx.createLinearGradient(0, 0, 0, 260);
  bg.addColorStop(0, '#2F3B42');
  bg.addColorStop(1, '#6B7C85');
  ctx.fillStyle = bg;
  ctx.fillRect(x0, 0, x1 - x0, 260);
  // skylights and trusses
  for (let x = Math.floor(x0 / 80) * 80; x < x1; x += 80) {
    ctx.fillStyle = 'rgba(220,235,240,0.16)';
    ctx.beginPath();
    ctx.moveTo(x + 20, 0);
    ctx.lineTo(x + 60, 0);
    ctx.lineTo(x + 90, 240);
    ctx.lineTo(x - 10, 240);
    ctx.fill();
    ctx.strokeStyle = 'rgba(20,28,32,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 34);
    ctx.lineTo(x + 40, 12);
    ctx.lineTo(x + 80, 34);
    ctx.moveTo(x + 40, 12);
    ctx.lineTo(x + 40, 34);
    ctx.stroke();
    ctx.fillStyle = 'rgba(20,28,32,0.55)';
    ctx.fillRect(x - 3, 34, 6, 206);
  }
  ctx.fillStyle = 'rgba(20,28,32,0.6)';
  ctx.fillRect(x0, 33, x1 - x0, 3);
  ctx.fillStyle = 'rgba(251,192,45,0.5)';
  ctx.fillRect(x0, 58, x1 - x0, 4);
  // turbine casings and rotors
  for (let i = Math.floor(x0 / 150); i < x1 / 150; i++) {
    const bx = i * 150 + 30 + hash(i, 4) * 40;
    if (hash(i, 6) > 0.5) {
      ctx.fillStyle = '#4E6A78';
      ctx.beginPath();
      ctx.arc(bx + 30, 236, 34, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#39505B';
      ctx.fillRect(bx - 6, 226, 72, 10);
      ctx.strokeStyle = 'rgba(200,220,230,0.3)';
      ctx.lineWidth = 1;
      for (let k = 1; k < 5; k++) {
        ctx.beginPath();
        ctx.arc(bx + 30, 236, 34 - k * 6, Math.PI, 0);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = '#8D5B3A';
      ctx.fillRect(bx, 204, 64, 22);
      ctx.fillStyle = '#B87333';
      for (let k = 0; k < 10; k++) ctx.fillRect(bx + 2 + k * 6.2, 204, 3, 22);
      ctx.fillStyle = '#546E7A';
      ctx.fillRect(bx - 12, 212, 88, 6);
      ctx.fillRect(bx - 8, 218, 5, 18);
      ctx.fillRect(bx + 67, 218, 5, 18);
    }
  }
}

function rock(ctx: Ctx, x0: number, x1: number, f: Set<string>) {
  sun(ctx, 110, 58, 14, '#FFE3A3');
  clouds(ctx, x0, x1, 41, 'rgba(255,255,255,0.55)');
  if (f.has('canyon')) {
    // layered red cliffs with a deep gorge
    const layers = ['#C8693E', '#B5552F', '#9C4426'];
    for (let l = 0; l < 3; l++) {
      ctx.fillStyle = layers[l];
      ctx.beginPath();
      ctx.moveTo(x0, 300);
      ctx.lineTo(x0, 120 + l * 26);
      for (let x = x0; x <= 210; x += 10) ctx.lineTo(x, 120 + l * 26 + Math.sin(x * 0.1 + l) * 4);
      ctx.lineTo(225, 300);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x1, 300);
      ctx.lineTo(x1, 110 + l * 26);
      for (let x = x1; x >= 300; x -= 10) ctx.lineTo(x, 110 + l * 26 + Math.cos(x * 0.09 + l) * 4);
      ctx.lineTo(285, 300);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(80,30,10,0.25)';
    ctx.lineWidth = 1;
    for (let y = 130; y < 240; y += 9) {
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(220, y + 3);
      ctx.moveTo(290, y + 2);
      ctx.lineTo(x1, y);
      ctx.stroke();
    }
    // the river far below
    ctx.fillStyle = '#5FA8B8';
    ctx.fillRect(225, 236, 60, 10);
  } else if (f.has('stepwell')) stepwell(ctx, x0, x1);
  else if (f.has('yantra')) yantras(ctx, x0, x1);
  else if (f.has('bhimbetka')) bhimbetka(ctx, x0, x1);
  else if (f.has('bhel')) bhelShop(ctx, x0, x1);
  else band(ctx, x0, x1, 160, 50, 0.012, 2.4, '#C9A27A');
  if (f.has('boulders')) {
    for (let i = 0; i < 26; i++) {
      const x = x0 + hash(i, 13) * (x1 - x0);
      const y = 150 + hash(i, 17) * 50;
      const r = 8 + hash(i, 19) * 16;
      ellipse(ctx, x, y, r * 1.2, r, i % 3 ? '#B9875E' : '#A87650');
      ellipse(ctx, x - r * 0.3, y - r * 0.35, r * 0.5, r * 0.3, 'rgba(255,230,190,0.35)');
    }
    // a pillared hall among the rocks
    ctx.fillStyle = '#9C7350';
    ctx.fillRect(330, 170, 90, 5);
    for (let i = 0; i < 7; i++) ctx.fillRect(333 + i * 13, 175, 4, 26);
    ctx.fillRect(328, 201, 94, 4);
  }
  if (f.has('fort')) {
    // stepped fort walls with battlements climbing a rocky hill
    band(ctx, x0, x1, 196, 70, 0.009, 0.8, '#A88A6A');
    ctx.fillStyle = '#8C7258';
    const steps: [number, number, number][] = [
      [60, 186, 90],
      [150, 160, 80],
      [230, 132, 70],
      [300, 110, 40],
      [340, 132, 90],
      [430, 170, 90],
    ];
    for (const [x, y, w] of steps) {
      ctx.fillRect(x, y, w, 300 - y);
      for (let b = 0; b < w; b += 8) ctx.fillRect(x + b, y - 5, 5, 5);
    }
    // the gate arch and a pavilion on top
    ctx.fillStyle = shade('#8C7258', -0.25);
    ctx.beginPath();
    ctx.arc(110, 210, 12, Math.PI, 0);
    ctx.lineTo(122, 230);
    ctx.lineTo(98, 230);
    ctx.fill();
    ctx.fillStyle = '#7A624B';
    ctx.fillRect(306, 92, 28, 18);
    ctx.beginPath();
    ctx.arc(320, 92, 13, Math.PI, 0);
    ctx.fill();
  }
  band(ctx, x0, x1, 222, 14, 0.03, 7.1, f.has('canyon') ? '#8E3E22' : '#9A7A55');
}

// ------------------------------------------------------------------ waterfall (Jog)
function falls(ctx: Ctx, x0: number, x1: number) {
  clouds(ctx, x0, x1, 61);
  band(ctx, x0, x1, 120, 30, 0.01, 1.6, '#7FA99A');
  // the cliff face and four plunging streams
  ctx.fillStyle = '#6E6458';
  ctx.fillRect(150, 70, 220, 230);
  ctx.fillStyle = '#5C5348';
  for (let i = 0; i < 12; i++) ctx.fillRect(150 + hash(i, 2) * 200, 80 + hash(i, 3) * 150, 14, 3);
  for (const [x, w] of [
    [182, 16],
    [228, 22],
    [280, 14],
    [322, 18],
  ] as const) {
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, 'rgba(255,255,255,0.65)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.95)');
    g.addColorStop(1, 'rgba(230,245,255,0.6)');
    ctx.fillStyle = g;
    ctx.fillRect(x, 72, w, 170);
  }
  mist(ctx, x0, x1, 225, 0.85);
  mist(ctx, x0, x1, 200, 0.5);
  band(ctx, x0, x1, 230, 30, 0.02, 3.3, '#3F7650');
}

// ------------------------------------------------------------------ night (palace lights, fireworks)
/** a Navratri garba ground: a lit stage with the singers' canopy, strings of bulbs, a crowd */
function navratri(ctx: Ctx, x0: number, x1: number) {
  // the glow of the ground's lights in the sky
  const glow = ctx.createLinearGradient(0, 120, 0, 260);
  glow.addColorStop(0, 'rgba(255,120,80,0)');
  glow.addColorStop(1, 'rgba(255,150,80,0.35)');
  ctx.fillStyle = glow;
  ctx.fillRect(x0, 120, x1 - x0, 140);
  // the stage and its striped canopy
  ctx.fillStyle = '#4A2040';
  ctx.fillRect(180, 170, 150, 50);
  ctx.fillStyle = '#7B1F4B';
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i % 2 ? '#E91E63' : '#FFC107';
    ctx.beginPath();
    ctx.moveTo(170 + i * 17, 150);
    ctx.lineTo(187 + i * 17, 150);
    ctx.lineTo(183 + i * 17, 168);
    ctx.lineTo(174 + i * 17, 168);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,220,150,0.6)';
  for (let i = 0; i < 5; i++) ctx.fillRect(196 + i * 26, 190, 8, 16);
  // strings of bulbs swooping across
  for (let r = 0; r < 3; r++) {
    for (let x = x0; x < x1; x += 7) {
      const y = 60 + r * 28 + Math.sin(((x - x0) / (x1 - x0)) * Math.PI * 3 + r) * 10;
      circle(ctx, x, y, 1.1, ['#FFEB3B', '#FF5252', '#69F0AE', '#40C4FF'][(x / 7 + r) % 4 | 0]);
    }
  }
  // the crowd round the edge
  for (let i = 0; i < 40; i++) {
    const x = x0 + hash(i, 61) * (x1 - x0);
    const h = 16 + hash(i, 63) * 8;
    ctx.fillStyle = ['#3B2445', '#4A2A50', '#2E1E38'][i % 3];
    ctx.fillRect(x - 3, 236 - h, 6, h);
    circle(ctx, x, 236 - h - 3, 3, ctx.fillStyle as string);
  }
}

function night(ctx: Ctx, x0: number, x1: number, f: Set<string>) {
  for (let i = 0; i < 70; i++) circle(ctx, x0 + hash(i, 31) * (x1 - x0), 8 + hash(i, 37) * 130, hash(i, 41) * 1.1 + 0.3, 'rgba(255,255,255,0.8)');
  circle(ctx, 430, 46, 11, '#F7F3DC');
  if (f.has('garba')) return navratri(ctx, x0, x1);
  if (f.has('mela')) return melaNight(ctx, x0, x1);
  if (f.has('diwali')) return diwaliNight(ctx, x0, x1);
  if (f.has('palace')) {
    // Mysuru Palace on a Dasara night: a long front with arches, a tall central tower with a
    // gilded dome, corner towers and little chhatris, every edge outlined in bulbs
    const base = 236;
    const glow = ctx.createRadialGradient(260, base - 80, 30, 260, base - 80, 260);
    glow.addColorStop(0, 'rgba(255,190,90,0.42)');
    glow.addColorStop(1, 'rgba(255,190,90,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x0, 0, x1 - x0, 300);
    const body = '#4B3763',
      deep = '#3A2A50';
    const dots: [number, number][] = [];
    const edge = (ax: number, ay: number, bx: number, by: number) => {
      const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / 3.2));
      for (let i = 0; i <= n; i++) dots.push([ax + ((bx - ax) * i) / n, ay + ((by - ay) * i) / n]);
    };
    const box = (x: number, y: number, w: number, h: number, c = body) => {
      ctx.fillStyle = c;
      ctx.fillRect(x, y, w, h);
      edge(x, y, x + w, y);
      edge(x, y, x, y + h);
      edge(x + w, y, x + w, y + h);
    };
    const dome = (cx: number, y: number, r: number, tall = 1.25) => {
      ctx.fillStyle = deep;
      ctx.beginPath();
      ctx.moveTo(cx - r, y);
      ctx.bezierCurveTo(cx - r, y - r * tall * 0.9, cx - r * 0.25, y - r * tall, cx, y - r * tall * 1.35);
      ctx.bezierCurveTo(cx + r * 0.25, y - r * tall, cx + r, y - r * tall * 0.9, cx + r, y);
      ctx.closePath();
      ctx.fill();
      for (let k = 0; k <= 16; k++) {
        const t = k / 16;
        const a = Math.PI * t;
        dots.push([cx - Math.cos(a) * r, y - Math.sin(a) * r * tall * (0.95 + 0.4 * Math.sin(a) ** 6)]);
      }
      dots.push([cx, y - r * tall * 1.35 - 2]);
    };
    // wings and the main block
    box(60, base - 70, 400, 70);
    box(92, base - 104, 336, 34);
    // arches, two rows, warm light inside
    for (let row = 0; row < 2; row++) {
      const y = base - 8 - row * 36;
      for (let i = 0; i < 11; i++) {
        const ax = 80 + i * 34 + (row ? 14 : 0);
        if (row && ax > 410) continue;
        ctx.fillStyle = 'rgba(255,205,120,0.45)';
        ctx.beginPath();
        ctx.moveTo(ax - 9, y);
        ctx.lineTo(ax - 9, y - 14);
        ctx.quadraticCurveTo(ax, y - 26, ax + 9, y - 14);
        ctx.lineTo(ax + 9, y);
        ctx.closePath();
        ctx.fill();
        for (let k = 0; k <= 6; k++) {
          const t = k / 6;
          dots.push([ax - 9 + 18 * t, y - 14 - Math.sin(Math.PI * t) * 11]);
        }
      }
    }
    // central tower and its gilded dome
    box(222, base - 160, 76, 56);
    box(232, base - 186, 56, 26);
    dome(260, base - 186, 26, 1.3);
    // corner towers and small domes
    for (const cx of [92, 428]) {
      box(cx - 14, base - 138, 28, 34);
      dome(cx, base - 138, 14, 1.4);
    }
    for (const cx of [150, 190, 330, 370]) dome(cx, base - 104, 9, 1.3);
    // flag on top
    ctx.strokeStyle = '#C9A44A';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(260, base - 222);
    ctx.lineTo(260, base - 238);
    ctx.stroke();
    ctx.fillStyle = '#E8553D';
    ctx.fillRect(260, base - 238, 9, 6);
    // the bulbs
    for (const [x, y] of dots) {
      circle(ctx, x, y, 1.9, 'rgba(255,214,120,0.25)');
      circle(ctx, x, y, 0.95, '#FFEDB0');
    }
  }
  if (f.has('fireworks')) {
    for (const [cx, cy, c] of [
      [120, 60, '#FF7B54'],
      [300, 40, '#7BD3EA'],
      [440, 80, '#FFD166'],
    ] as const) {
      ctx.strokeStyle = c;
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 6, cy + Math.sin(a) * 6);
        ctx.lineTo(cx + Math.cos(a) * 22, cy + Math.sin(a) * 22);
        ctx.stroke();
      }
    }
    // the French quarter below, lit windows
    ctx.fillStyle = '#2A2440';
    for (let i = 0; i < 8; i++) ctx.fillRect(x0 + i * 72, 168 - hash(i, 4) * 24, 64, 120);
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = 'rgba(255,214,140,0.8)';
      ctx.fillRect(x0 + hash(i, 6) * (x1 - x0), 160 + hash(i, 8) * 50, 4, 6);
    }
  }
  band(ctx, x0, x1, f.has('palace') ? 246 : 228, 10, 0.03, 2.9, '#1C1730');
}

// ------------------------------------------------------------------ cave (Belum)
function cave(ctx: Ctx, x0: number, x1: number) {
  // stalactites from the roof, stalagmites from the floor, a faint pool of light far back
  const g = ctx.createRadialGradient(256, 150, 10, 256, 150, 260);
  g.addColorStop(0, 'rgba(120,90,70,0.6)');
  g.addColorStop(1, 'rgba(20,14,12,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x0, 0, x1 - x0, 300);
  for (let i = 0; i < 34; i++) {
    const x = x0 + hash(i, 51) * (x1 - x0);
    const len = 14 + hash(i, 53) * 46;
    ctx.fillStyle = i % 2 ? '#4A3A30' : '#3B2E26';
    ctx.beginPath();
    ctx.moveTo(x - 5, 0);
    ctx.lineTo(x + 5, 0);
    ctx.lineTo(x, len);
    ctx.fill();
  }
  for (let i = 0; i < 20; i++) {
    const x = x0 + hash(i, 57) * (x1 - x0);
    const hgt = 10 + hash(i, 59) * 34;
    ctx.fillStyle = '#3F3129';
    ctx.beginPath();
    ctx.moveTo(x - 6, 250);
    ctx.lineTo(x + 6, 250);
    ctx.lineTo(x, 250 - hgt);
    ctx.fill();
  }
}

// ------------------------------------------------------------------ market (jasmine, bangles)
function market(ctx: Ctx, x0: number, x1: number, f: Set<string>) {
  clouds(ctx, x0, x1, 71, 'rgba(255,255,255,0.5)');
  // Laad Bazaar runs straight up to the Charminar
  if (f.has('bangles')) charminar(ctx, 300, 150, 1.25, '#D9A877', '#F6DDBA');
  // a row of old shopfronts with awnings
  for (let i = 0; i < 9; i++) {
    const x = x0 - 10 + i * 62;
    const top = 104 + hash(i, 2) * 26;
    ctx.fillStyle = ['#D98E5A', '#C9B07A', '#B97A8E', '#8FA9B5'][i % 4];
    ctx.fillRect(x, top, 58, 300 - top);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for (let w = 0; w < 3; w++) ctx.fillRect(x + 6 + w * 17, top + 10, 10, 14);
    const aw = ['#E8572A', '#2E8B57', '#7A4FC4', '#E0A800'][(i + 1) % 4];
    for (let s2 = 0; s2 < 6; s2++) {
      ctx.fillStyle = s2 % 2 ? '#FFF8E7' : aw;
      ctx.beginPath();
      ctx.moveTo(x + s2 * 10, 176);
      ctx.lineTo(x + s2 * 10 + 10, 176);
      ctx.lineTo(x + s2 * 10 + 12, 190);
      ctx.lineTo(x + s2 * 10 - 2, 190);
      ctx.fill();
    }
  }
  // strings of jasmine or bangles across the lane
  ctx.lineWidth = 1;
  for (let r = 0; r < 3; r++) {
    const y = 60 + r * 22;
    for (let x = x0; x < x1; x += f.has('bangles') ? 5 : 3.5) {
      const yy = y + Math.sin((x - x0) * 0.02 + r) * 6;
      if (f.has('bangles')) {
        ctx.strokeStyle = ['#E53935', '#FDD835', '#43A047', '#1E88E5', '#8E24AA'][Math.floor(x / 5) % 5];
        ctx.beginPath();
        ctx.ellipse(x, yy, 2.2, 1.2, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else circle(ctx, x, yy, 1.3, '#FFFDF2');
    }
  }
  // crowd silhouettes
  for (let i = 0; i < 22; i++) {
    const x = x0 + hash(i, 81) * (x1 - x0);
    const hgt = 22 + hash(i, 83) * 8;
    ctx.fillStyle = 'rgba(70,40,30,0.35)';
    circle(ctx, x, 236 - hgt, 3.4, 'rgba(70,40,30,0.35)');
    ctx.fillRect(x - 3.5, 236 - hgt + 3, 7, hgt - 3);
  }
}

// ------------------------------------------------------------------ film set
function filmset(ctx: Ctx, x0: number, x1: number) {
  clouds(ctx, x0, x1, 91);
  // painted facades, with the bare scaffolding showing round the back
  for (let i = 0; i < 6; i++) {
    const x = x0 + 10 + i * 92;
    const top = 90 + hash(i, 4) * 40;
    ctx.fillStyle = ['#F2C14E', '#E07A5F', '#81B29A', '#F4F1DE'][i % 4];
    ctx.fillRect(x, top, 70, 236 - top);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(x + 8, top + 14, 14, 18);
    ctx.fillRect(x + 46, top + 14, 14, 18);
    ctx.fillRect(x + 28, top + 52, 14, 236 - top - 52);
    // the scaffold behind
    ctx.strokeStyle = '#7A6A55';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 70, top);
    ctx.lineTo(x + 84, top + 16);
    ctx.lineTo(x + 84, 236);
    ctx.moveTo(x + 70, top + 60);
    ctx.lineTo(x + 84, top + 74);
    ctx.stroke();
  }
  // a camera crane and two lights
  ctx.strokeStyle = '#2B2B2E';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(470, 236);
  ctx.lineTo(470, 160);
  ctx.lineTo(400, 110);
  ctx.stroke();
  fillRR(ctx, 390, 100, 16, 10, 2, '#2B2B2E');
  for (const lx of [40, 250]) {
    ctx.fillStyle = '#2B2B2E';
    ctx.fillRect(lx, 150, 2, 86);
    fillRR(ctx, lx - 7, 142, 16, 10, 2, '#3E3E42');
    const g = ctx.createRadialGradient(lx + 1, 147, 2, lx + 40, 190, 90);
    g.addColorStop(0, 'rgba(255,250,220,0.5)');
    g.addColorStop(1, 'rgba(255,250,220,0)');
    ctx.fillStyle = g;
    ctx.fillRect(lx - 10, 140, 140, 100);
  }
}

export function sceneSky(sc: SceneDef): [string, string, string] {
  return sc.sky ?? SKY[sc.kind];
}

export function drawScene(ctx: Ctx, sc: SceneDef, x0: number, x1: number) {
  const f = new Set(sc.with ?? []);
  const sky = sceneSky(sc);
  if (sc.kind === 'hills') hills(ctx, x0, x1, f);
  else if (sc.kind === 'water') water(ctx, x0, x1, f, sky);
  else if (sc.kind === 'rock') rock(ctx, x0, x1, f);
  else if (sc.kind === 'falls') falls(ctx, x0, x1);
  else if (sc.kind === 'night') night(ctx, x0, x1, f);
  else if (sc.kind === 'cave') cave(ctx, x0, x1);
  else if (sc.kind === 'market') market(ctx, x0, x1, f);
  else filmset(ctx, x0, x1);
}
