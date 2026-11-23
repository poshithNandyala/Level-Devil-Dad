// Bengaluru on a fresh morning after the rain: glass tech parks, rain trees, the purple
// metro gliding along its viaduct, bougainvillea over a compound wall. The road has
// potholes full of brown rainwater. The ride is a green-and-yellow auto.
import type { Ctx } from './dad';
import { Box, cloud, glow, hash, Scene, vgrad } from './scene';
import { AUTO_W, AutoRide } from '../auto';

const FLOOR = 224;

function rainTree(ctx: Ctx, x: number, base: number, s: number, c: string) {
  ctx.fillStyle = c;
  ctx.fillRect(x - 1.6 * s, base - 30 * s, 3.2 * s, 30 * s);
  ctx.beginPath();
  ctx.moveTo(x, base - 22 * s);
  ctx.lineTo(x - 10 * s, base - 34 * s);
  ctx.lineTo(x - 9 * s, base - 35 * s);
  ctx.lineTo(x + 1, base - 24 * s);
  ctx.fill();
  for (const [dx, dy, rx, ry] of [
    [0, -42, 30, 12],
    [-20, -38, 18, 9],
    [21, -38, 19, 9],
    [-8, -48, 18, 9],
    [10, -47, 17, 8],
  ]) {
    ctx.beginPath();
    ctx.ellipse(x + dx * s, base + dy * s, rx * s, ry * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

export const BENGALURU_SCENE: Scene = {
  base: '#1E2A2C',
  accent: '#9ED36A',
  ground: {
    top: '#5D626B',
    topHi: '#868B93',
    capH: 4,
    lip: '#3F434B',
    lipH: 2,
    face: ['#6A5A4E', '#2A211E'],
    faceDepth: 50,
    edge: '#1E1A1A',
    seam: 'rgba(0,0,0,0.18)',
    joints: { color: 'rgba(25,18,14,0.2)', w: 20, h: 8 },
    spike: ['#F6F8FB', '#A8B2BE'],
    spikeEdge: '#1D1823',
  },
  backdrop(ctx, r) {
    ctx.fillStyle = vgrad(ctx, r.y0, FLOOR, [
      [0, '#6FAED3'],
      [0.55, '#BFDDE0'],
      [1, '#F4E6C4'],
    ]);
    ctx.fillRect(r.x0, r.y0, r.x1 - r.x0, FLOOR - r.y0 + 1);
    glow(ctx, 110, 128, 130, 'rgba(255,240,200,0.65)');
    ctx.fillStyle = 'rgba(255,252,236,0.95)';
    ctx.beginPath();
    ctx.arc(110, 128, 12, 0, Math.PI * 2);
    ctx.fill();
    cloud(ctx, 250, 110, 130, 'rgba(255,255,255,0.75)', 'rgba(230,240,245,0.6)');
    cloud(ctx, 430, 96, 110, 'rgba(255,255,255,0.7)', 'rgba(230,240,245,0.5)');
    cloud(ctx, 40, 90, 90, 'rgba(255,255,255,0.6)', 'rgba(230,240,245,0.5)');
    // the far hills and the glass towers of a tech park
    ctx.fillStyle = 'rgba(120,150,150,0.45)';
    ctx.beginPath();
    ctx.moveTo(r.x0, 200);
    for (let x = r.x0; x <= r.x1 + 20; x += 20) ctx.lineTo(x, 182 + Math.sin(x * 0.012) * 10 + Math.sin(x * 0.04) * 4);
    ctx.lineTo(r.x1, 214);
    ctx.lineTo(r.x0, 214);
    ctx.fill();
    for (let i = -10; i < 40; i++) {
      const x = i * 37 + hash(i * 4.4) * 14;
      if (x + 30 < r.x0 || x > r.x1) continue;
      if (hash(i * 2.2) < 0.45) continue;
      const h = 34 + hash(i * 1.3) * 56;
      const w = 18 + hash(i * 6.1) * 14;
      ctx.fillStyle = 'rgba(96,130,152,0.75)';
      ctx.fillRect(x, 210 - h, w, h);
      ctx.fillStyle = 'rgba(200,230,240,0.45)';
      for (let k = 4; k < h - 4; k += 6) ctx.fillRect(x + 2, 210 - h + k, w - 4, 1.6);
    }
    // the metro viaduct
    ctx.fillStyle = '#8E9AA0';
    ctx.fillRect(r.x0, 164, r.x1 - r.x0, 6);
    ctx.fillStyle = '#6F7A80';
    ctx.fillRect(r.x0, 170, r.x1 - r.x0, 2);
    for (let x = Math.floor(r.x0 / 96) * 96 + 30; x < r.x1; x += 96) {
      ctx.fillStyle = '#7E8A90';
      ctx.fillRect(x, 172, 7, 42);
      ctx.fillRect(x - 3, 170, 13, 3);
    }
    // rain trees
    for (const [x, s] of [
      [70, 1.15],
      [196, 0.95],
      [340, 1.2],
      [470, 1.0],
    ] as const)
      rainTree(ctx, x, 214, s, 'rgba(46,92,60,0.92)');
    // a compound wall with bougainvillea spilling over
    ctx.fillStyle = '#D9CDB4';
    ctx.fillRect(r.x0, 196, r.x1 - r.x0, 28);
    ctx.fillStyle = '#C4B697';
    ctx.fillRect(r.x0, 196, r.x1 - r.x0, 2.5);
    for (let x = Math.floor(r.x0 / 40) * 40; x < r.x1; x += 40) {
      ctx.fillStyle = '#BFB08F';
      ctx.fillRect(x, 198, 1.2, 26);
    }
    for (let i = 0; i < 80; i++) {
      const x = r.x0 + hash(i * 3.7) * (r.x1 - r.x0);
      if (hash(Math.floor(x / 60)) < 0.35) continue;
      const y = 194 + hash(i * 1.9) * 10;
      ctx.fillStyle = hash(i) < 0.5 ? '#D6337F' : '#E85A9C';
      ctx.beginPath();
      ctx.arc(x, y, 2 + hash(i * 5) * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3F7A3A';
      ctx.beginPath();
      ctx.arc(x + 2, y + 2, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    // the footpath's kerb, black and yellow
    for (let x = Math.floor(r.x0 / 16) * 16; x < r.x1; x += 16) {
      ctx.fillStyle = (x / 16) % 2 ? '#F2C230' : '#22201E';
      ctx.fillRect(x, 220, 16, 4);
    }
  },
  pit(ctx, r, floorY) {
    ctx.fillStyle = vgrad(ctx, floorY, r.y1, [
      [0, '#3B2E26'],
      [1, '#16100D'],
    ]);
    ctx.fillRect(r.x0, floorY, r.x1 - r.x0, r.y1 - floorY);
    // brown rainwater at the bottom of every pothole
    const wy = floorY + 30;
    ctx.fillStyle = vgrad(ctx, wy, r.y1, [
      [0, '#7A5B3A'],
      [1, '#3E2C1C'],
    ]);
    ctx.fillRect(r.x0, wy, r.x1 - r.x0, r.y1 - wy);
    ctx.fillStyle = 'rgba(255,230,190,0.35)';
    ctx.fillRect(r.x0, wy, r.x1 - r.x0, 1);
  },
  ambient(ctx, r, t) {
    // the purple line glides past
    const period = 9;
    const k = (t % period) / period;
    if (k < 0.3) {
      const x = r.x0 - 260 + (k / 0.3) * (r.x1 - r.x0 + 520);
      ctx.fillStyle = '#7A3FA0';
      ctx.fillRect(x, 151, 240, 13);
      ctx.fillStyle = '#C9B6DA';
      ctx.fillRect(x, 160, 240, 2);
      ctx.fillStyle = 'rgba(30,30,50,0.85)';
      for (let i = 0; i < 12; i++) ctx.fillRect(x + 6 + i * 19, 153, 11, 5);
    }
    // a leaf drifting down now and then
    for (let i = 0; i < 4; i++) {
      const ph = (t * 0.18 + i * 0.27) % 1;
      const x = 80 + i * 110 + Math.sin(t * 1.3 + i) * 14;
      const y = 120 + ph * 110;
      ctx.fillStyle = `rgba(80,140,70,${0.8 - ph * 0.6})`;
      ctx.beginPath();
      ctx.ellipse(x, y, 1.8, 0.9, t * 2 + i, 0, Math.PI * 2);
      ctx.fill();
    }
  },
};

/** the auto: deep green body, yellow canopy, a black meter by the driver */
export function drawAuto(ctx: Ctx, a: AutoRide, t: number) {
  const x = a.x + a.away,
    fl = a.floor;
  const W = AUTO_W;
  const moving = Math.abs(a.vx) > 5;
  const bounce = moving ? Math.sin(t * 40) * 0.4 : 0;
  ctx.save();
  ctx.translate(0, bounce);
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(x + W / 2, fl + 0.5, W / 2, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  // canopy (the yellow hood) over the passenger part
  ctx.fillStyle = vgrad(ctx, fl - 30, fl - 16, [
    [0, '#FFD54A'],
    [1, '#E8AE1E'],
  ]);
  ctx.beginPath();
  ctx.moveTo(x + 2, fl - 12);
  ctx.lineTo(x + 2, fl - 22);
  ctx.quadraticCurveTo(x + 3, fl - 30, x + 14, fl - 30);
  ctx.lineTo(x + 34, fl - 30);
  ctx.quadraticCurveTo(x + 40, fl - 30, x + 41, fl - 24);
  ctx.lineTo(x + 41, fl - 21);
  ctx.lineTo(x + 30, fl - 21);
  ctx.lineTo(x + 30, fl - 12);
  ctx.fill();
  ctx.strokeStyle = '#3A2A05';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // the body
  ctx.fillStyle = vgrad(ctx, fl - 14, fl - 3, [
    [0, '#2FA35A'],
    [1, '#1D6B3A'],
  ]);
  ctx.beginPath();
  ctx.moveTo(x + 1, fl - 4);
  ctx.lineTo(x + 1, fl - 14);
  ctx.lineTo(x + 30, fl - 14);
  ctx.quadraticCurveTo(x + 36, fl - 22, x + 42, fl - 20);
  ctx.lineTo(x + W, fl - 10);
  ctx.lineTo(x + W, fl - 4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#0E2A18';
  ctx.stroke();
  // the open side: a dark doorway with the seat
  ctx.fillStyle = '#18120E';
  ctx.beginPath();
  ctx.moveTo(x + 10, fl - 5);
  ctx.lineTo(x + 10, fl - 20);
  ctx.quadraticCurveTo(x + 11, fl - 26, x + 17, fl - 26);
  ctx.lineTo(x + 28, fl - 26);
  ctx.lineTo(x + 28, fl - 5);
  ctx.fill();
  ctx.fillStyle = '#5A3A2A';
  ctx.fillRect(x + 11, fl - 12, 16, 3);
  // windscreen and the driver's handlebar
  ctx.fillStyle = 'rgba(180,220,240,0.7)';
  ctx.beginPath();
  ctx.moveTo(x + 31, fl - 20);
  ctx.lineTo(x + 40, fl - 27);
  ctx.lineTo(x + 41, fl - 21);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#121212';
  ctx.fillRect(x + 33, fl - 17, 4, 2.6);
  // headlight
  ctx.fillStyle = '#FFF4C8';
  ctx.beginPath();
  ctx.arc(x + W - 1.5, fl - 10, 1.8, 0, Math.PI * 2);
  ctx.fill();
  // reversing lights
  if (a.vx < -5) {
    glow(ctx, x + 1, fl - 9, 10, 'rgba(255,255,255,0.8)');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, fl - 10, 2, 2);
  } else {
    ctx.fillStyle = '#C0392B';
    ctx.fillRect(x, fl - 10, 1.6, 2);
  }
  // wheels
  for (const wx of [x + 8, x + W - 7]) {
    ctx.fillStyle = '#151515';
    ctx.beginPath();
    ctx.arc(wx, fl - 3.2, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#9AA0A6';
    ctx.beginPath();
    ctx.arc(wx, fl - 3.2, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
  // exhaust puffs when it moves
  if (moving) {
    for (let i = 0; i < 3; i++) {
      const k = (t * 3 + i / 3) % 1;
      ctx.fillStyle = `rgba(200,200,200,${0.5 * (1 - k)})`;
      ctx.beginPath();
      ctx.arc(x - 2 - k * 10 * Math.sign(a.vx || 1), fl - 4 - k * 4, 1.5 + k * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
