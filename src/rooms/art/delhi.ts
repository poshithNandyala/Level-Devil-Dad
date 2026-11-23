// Delhi on a hazy winter afternoon, from an elevated metro station: a steel canopy with
// ribs overhead, glass walls, and through them the old city in the haze (an arch, a
// tomb's dome, a tall fluted minaret), paper kites in the sky. The ride is a steel
// metro coach with its doors open.
import type { Ctx } from './dad';
import { Box, glow, hash, Scene, vgrad } from './scene';
import type { RideExit } from '../exits';

const FLOOR = 224;

function haze(ctx: Ctx, r: Box) {
  const base = 206;
  ctx.fillStyle = 'rgba(166,130,112,0.42)';
  // low city
  for (let i = -10; i < 50; i++) {
    const x = i * 17 + hash(i * 3.3) * 8;
    if (x + 20 < r.x0 || x > r.x1) continue;
    const h = 10 + hash(i * 1.7) * 22;
    ctx.fillRect(x, base - h, 12 + hash(i) * 10, h + 4);
  }
  // an arch
  ctx.fillStyle = 'rgba(150,108,92,0.5)';
  const ax = 92;
  ctx.fillRect(ax - 18, base - 58, 36, 58);
  ctx.fillRect(ax - 22, base - 64, 44, 7);
  ctx.fillStyle = 'rgba(232,200,160,0.9)';
  ctx.beginPath();
  ctx.moveTo(ax - 8, base);
  ctx.lineTo(ax - 8, base - 30);
  ctx.arc(ax, base - 30, 8, Math.PI, 0);
  ctx.lineTo(ax + 8, base);
  ctx.fill();
  // a tomb with its dome and little domes
  ctx.fillStyle = 'rgba(150,108,92,0.5)';
  const tx = 232;
  ctx.fillRect(tx - 34, base - 30, 68, 30);
  ctx.beginPath();
  ctx.ellipse(tx, base - 44, 17, 18, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(tx - 17, base - 44, 34, 14);
  ctx.fillRect(tx - 0.8, base - 70, 1.6, 9);
  for (const dx of [-26, 26]) {
    ctx.beginPath();
    ctx.ellipse(tx + dx, base - 34, 6, 6, 0, Math.PI, 0);
    ctx.fill();
  }
  // a tall fluted minaret
  const mx = 396;
  ctx.beginPath();
  ctx.moveTo(mx - 9, base);
  ctx.lineTo(mx - 5, base - 92);
  ctx.lineTo(mx + 5, base - 92);
  ctx.lineTo(mx + 9, base);
  ctx.fill();
  for (const k of [0.3, 0.55, 0.78]) {
    const y = base - 92 * k;
    const half = 9 - 4 * k + 2;
    ctx.fillRect(mx - half, y - 2, half * 2, 2.5);
  }
}

export const DELHI_SCENE: Scene = {
  base: '#2A211F',
  accent: '#F0B860',
  ground: {
    top: '#BDB2A9',
    topHi: '#E6DDD5',
    band: '#E8C547',
    bandY: 1.6,
    capH: 5,
    lip: '#8C8079',
    lipH: 2,
    face: ['#8A7E77', '#3A322F'],
    faceDepth: 50,
    edge: '#26201E',
    seam: 'rgba(90,80,75,0.5)',
    joints: { color: 'rgba(40,30,28,0.18)', w: 32, h: 16 },
    spike: ['#FFF6D6', '#E0B640'],
    spikeEdge: '#3A2A0A',
  },
  backdrop(ctx, r) {
    ctx.fillStyle = vgrad(ctx, r.y0, FLOOR, [
      [0, '#B9A99A'],
      [0.5, '#E2C29A'],
      [1, '#F2D7A8'],
    ]);
    ctx.fillRect(r.x0, r.y0, r.x1 - r.x0, FLOOR - r.y0 + 1);
    glow(ctx, 330, 150, 150, 'rgba(255,236,200,0.6)');
    ctx.fillStyle = 'rgba(255,244,222,0.9)';
    ctx.beginPath();
    ctx.arc(330, 150, 17, 0, Math.PI * 2);
    ctx.fill();
    haze(ctx, r);
    // glass walls of the station, in panes
    ctx.fillStyle = 'rgba(210,225,226,0.16)';
    ctx.fillRect(r.x0, 108, r.x1 - r.x0, 100);
    ctx.fillStyle = 'rgba(70,60,58,0.55)';
    for (let x = Math.floor(r.x0 / 48) * 48; x < r.x1; x += 48) ctx.fillRect(x, 108, 2, 100);
    ctx.fillRect(r.x0, 150, r.x1 - r.x0, 1.4);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    for (let x = Math.floor(r.x0 / 48) * 48; x < r.x1; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x + 8, 108);
      ctx.lineTo(x + 18, 108);
      ctx.lineTo(x + 6, 150);
      ctx.lineTo(x + 2, 150);
      ctx.fill();
    }
    // the low wall under the glass
    ctx.fillStyle = vgrad(ctx, 206, 224, [
      [0, '#6E625C'],
      [1, '#4E4440'],
    ]);
    ctx.fillRect(r.x0, 206, r.x1 - r.x0, 18);
    ctx.fillStyle = '#8B7E77';
    ctx.fillRect(r.x0, 206, r.x1 - r.x0, 1.6);
    // the steel canopy with its ribs
    ctx.fillStyle = vgrad(ctx, r.y0, 104, [
      [0, '#4A4240'],
      [1, '#ECE6E0'],
    ]);
    ctx.beginPath();
    ctx.moveTo(r.x0, r.y0);
    ctx.lineTo(r.x1, r.y0);
    ctx.lineTo(r.x1, 96);
    for (let x = r.x1; x >= r.x0 - 64; x -= 64) ctx.quadraticCurveTo(x - 32, 108, x - 64, 96);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(80,70,66,0.5)';
    ctx.lineWidth = 1.2;
    for (let x = Math.floor(r.x0 / 64) * 64; x < r.x1 + 64; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 96);
      ctx.lineTo(x, r.y0);
      ctx.stroke();
    }
    // two big round lights hanging under it
    for (const x of [150, 362]) {
      ctx.fillStyle = '#3B3432';
      ctx.fillRect(x - 0.5, 100, 1, 8);
      ctx.fillStyle = '#FFF3D6';
      ctx.beginPath();
      ctx.ellipse(x, 109, 7, 2.4, 0, 0, Math.PI * 2);
      ctx.fill();
      glow(ctx, x, 112, 30, 'rgba(255,236,200,0.35)');
    }
  },
  pit(ctx, r, floorY) {
    // far below the elevated platform: the street, in shadow
    ctx.fillStyle = vgrad(ctx, floorY, r.y1, [
      [0, '#2D2523'],
      [1, '#0E0B0A'],
    ]);
    ctx.fillRect(r.x0, floorY, r.x1 - r.x0, r.y1 - floorY);
    for (let i = 0; i < 40; i++) {
      const x = r.x0 + hash(i * 2.7) * (r.x1 - r.x0);
      const y = floorY + 30 + hash(i * 4.1) * 30;
      ctx.fillStyle = `rgba(255,${180 + Math.round(hash(i) * 60)},120,${0.25 + hash(i * 9) * 0.35})`;
      ctx.fillRect(x, y, 1.4, 1.4);
    }
  },
  ambient(ctx, r, t) {
    // paper kites over the city
    for (const [i, bx, by] of [
      [0, 140, 128],
      [1, 300, 120],
      [2, 450, 134],
    ] as const) {
      const x = bx + Math.sin(t * 0.7 + i * 2) * 10;
      const y = by + Math.cos(t * 0.9 + i) * 6;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(t * 1.3 + i) * 0.25);
      ctx.fillStyle = ['#E8443A', '#F2B530', '#3E7BD8'][i];
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(4, 0);
      ctx.lineTo(0, 6);
      ctx.lineTo(-4, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(60,40,30,0.5)';
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.quadraticCurveTo(3, 12, -2, 18);
      ctx.stroke();
      ctx.restore();
    }
  },
  front(ctx, r) {
    // the winter haze settles over everything, a little
    ctx.fillStyle = 'rgba(240,210,170,0.06)';
    ctx.fillRect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0);
  },
};

/** a steel metro coach with a red stripe, double doors open, a green light over them */
export function drawMetro(ctx: Ctx, e: RideExit, t: number) {
  const x = e.x + e.away;
  const fl = e.floor;
  const left = x - 30,
    right = x + 16 + e.body * 16 + 400;
  const top = fl - 52;
  ctx.save();
  ctx.fillStyle = vgrad(ctx, top, fl + 4, [
    [0, '#E9ECEE'],
    [0.5, '#C9CED3'],
    [1, '#A7ADB3'],
  ]);
  ctx.beginPath();
  ctx.moveTo(left + 7, top);
  ctx.lineTo(right, top);
  ctx.lineTo(right, fl + 4);
  ctx.lineTo(left, fl + 4);
  ctx.lineTo(left, top + 7);
  ctx.quadraticCurveTo(left, top, left + 7, top);
  ctx.fill();
  // ribs of the steel body
  ctx.fillStyle = 'rgba(120,128,136,0.25)';
  for (let k = left + 4; k < right; k += 4) ctx.fillRect(k, fl - 12, 1, 14);
  // stripes
  ctx.fillStyle = '#D0312D';
  ctx.fillRect(left, fl - 16, right - left, 3.5);
  ctx.fillStyle = '#2B2B33';
  ctx.fillRect(left, top + 3, right - left, 1.4);
  // windows
  for (let k = 0; k < 14; k++) {
    const wx = x + 30 + k * 26;
    ctx.fillStyle = '#25303A';
    ctx.fillRect(wx, fl - 42, 19, 15);
    ctx.fillStyle = 'rgba(255,240,210,0.22)';
    ctx.fillRect(wx, fl - 42, 19, 5);
  }
  ctx.fillStyle = '#25303A';
  ctx.fillRect(left + 6, fl - 42, 14, 15);
  // the double doors, slid open
  ctx.fillStyle = '#17181C';
  ctx.fillRect(x - 2, fl - 34, 20, 34);
  glow(ctx, x + 8, fl - 30, 20, 'rgba(255,236,200,0.45)');
  ctx.fillStyle = '#B9C0C6';
  ctx.fillRect(x + 7.4, fl - 34, 1.2, 34);
  ctx.fillStyle = '#D6DBDF';
  ctx.fillRect(x - 9, fl - 35, 7, 35);
  ctx.fillRect(x + 18, fl - 35, 7, 35);
  ctx.fillStyle = 'rgba(40,50,60,0.6)';
  ctx.fillRect(x - 7.5, fl - 31, 4, 12);
  ctx.fillRect(x + 19.5, fl - 31, 4, 12);
  // the light over the door
  ctx.fillStyle = '#1C1C1C';
  ctx.fillRect(x + 4, fl - 40, 8, 3);
  ctx.fillStyle = `rgba(80,230,120,${0.7 + 0.3 * Math.sin(t * 5)})`;
  ctx.fillRect(x + 5, fl - 39.4, 6, 1.8);
  ctx.restore();
}
