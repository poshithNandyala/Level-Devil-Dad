// Mumbai at monsoon dusk: a violet sky going amber, a Gothic station and towers on the
// skyline, the station canopy with its cream fretwork overhead, the tracks under the
// platform, rain. The ride is a local train whose doors never close.
import type { Ctx } from './dad';
import { Box, cloud, glow, hash, Scene, vgrad } from './scene';
import type { RideExit } from '../exits';

const FLOOR = 224;
const LAMPS = [96, 210, 330, 430];

function skyline(ctx: Ctx, r: Box) {
  const base = 212;
  // the farthest towers, hazy
  for (let i = -12; i < 60; i++) {
    const x = i * 19 + hash(i + 50) * 12;
    if (x + 26 < r.x0 || x > r.x1) continue;
    const h = 26 + hash(i * 5.3) * 48;
    ctx.fillStyle = 'rgba(120,80,130,0.55)';
    ctx.fillRect(x, base - h, 10 + hash(i * 2.1) * 10, h + 4);
  }
  // a haze of city light along the horizon
  ctx.fillStyle = vgrad(ctx, 150, base + 4, [
    [0, 'rgba(255,170,120,0)'],
    [1, 'rgba(255,160,110,0.35)'],
  ]);
  ctx.fillRect(r.x0, 150, r.x1 - r.x0, base + 4 - 150);
  // nearer towers
  for (let i = -12; i < 60; i++) {
    if (hash(i * 9.1) < 0.35) continue;
    const x = i * 31 + hash(i) * 14;
    if (x + 26 < r.x0 || x > r.x1) continue;
    if (x > 88 && x < 248) continue;
    const h = 30 + hash(i * 3.1) * 62 + (i % 5 === 0 ? 24 : 0);
    const w = 14 + hash(i * 7.7) * 12;
    ctx.fillStyle = i % 3 ? '#433158' : '#3E2D52';
    ctx.fillRect(x, base - h, w, h + 4);
    // a few lit windows
    for (let k = 0; k < 6; k++) {
      if (hash(i * 13 + k) > 0.45) continue;
      ctx.fillStyle = `rgba(255,${190 + Math.round(hash(k + i) * 40)},120,${0.35 + hash(i + k * 5) * 0.35})`;
      ctx.fillRect(x + 2 + hash(i * k + 1) * (w - 5), base - h + 5 + hash(i + k * 2.3) * (h - 12), 1.6, 1.3);
    }
  }
  // the Gothic station: a dome on a tower, two winged blocks with turrets
  const cx = 168;
  ctx.fillStyle = '#3B2A52';
  ctx.fillRect(cx - 70, base - 46, 140, 50);
  ctx.fillRect(cx - 18, base - 78, 36, 34);
  ctx.beginPath();
  ctx.ellipse(cx, base - 78, 16, 15, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(cx - 1.2, base - 106, 2.4, 14);
  ctx.beginPath();
  ctx.arc(cx, base - 106, 2.6, 0, Math.PI * 2);
  ctx.fill();
  for (const dx of [-70, -44, 44, 70]) {
    ctx.beginPath();
    ctx.moveTo(cx + dx - 6, base - 46);
    ctx.lineTo(cx + dx, base - 64);
    ctx.lineTo(cx + dx + 6, base - 46);
    ctx.fill();
  }
  for (let k = -5; k <= 5; k++) {
    ctx.fillStyle = 'rgba(255,196,120,0.55)';
    const wx = cx + k * 12 - 2;
    ctx.beginPath();
    ctx.moveTo(wx, base - 22);
    ctx.lineTo(wx, base - 30);
    ctx.quadraticCurveTo(wx + 2, base - 34, wx + 4, base - 30);
    ctx.lineTo(wx + 4, base - 22);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,214,150,0.6)';
  ctx.beginPath();
  ctx.arc(cx, base - 60, 5, 0, Math.PI * 2);
  ctx.fill();
  // palms
  for (const [x, h] of [
    [40, 54],
    [312, 62],
    [338, 46],
    [470, 58],
  ]) {
    if (x < r.x0 - 20 || x > r.x1 + 20) continue;
    ctx.strokeStyle = '#30233F';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(x, base + 2);
    ctx.quadraticCurveTo(x + 4, base - h / 2, x + 2, base - h);
    ctx.stroke();
    ctx.fillStyle = '#30233F';
    for (let k = 0; k < 7; k++) {
      const a = -Math.PI / 2 + (k - 3) * 0.48;
      ctx.beginPath();
      ctx.ellipse(x + 2 + Math.cos(a) * 9, base - h + Math.sin(a) * 4 + 3, 10, 2.2, a * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function canopy(ctx: Ctx, r: Box) {
  const y1 = 95;
  ctx.fillStyle = vgrad(ctx, r.y0, y1, [
    [0, '#161E24'],
    [1, '#243338'],
  ]);
  ctx.fillRect(r.x0, r.y0, r.x1 - r.x0, y1 - r.y0);
  // the fretwork valance: cream with scallops
  ctx.fillStyle = '#E6D6B4';
  ctx.fillRect(r.x0, y1 - 3, r.x1 - r.x0, 3);
  ctx.beginPath();
  for (let x = Math.floor(r.x0 / 8) * 8; x < r.x1 + 8; x += 8) {
    ctx.moveTo(x, y1);
    ctx.arc(x + 4, y1, 4, Math.PI, 0, true);
  }
  ctx.fill();
  ctx.fillStyle = '#243338';
  for (let x = Math.floor(r.x0 / 8) * 8; x < r.x1 + 8; x += 8) {
    ctx.beginPath();
    ctx.arc(x + 4, y1 + 0.6, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
  // pillars at the room's edges (the stage is framed by the station)
  for (const x of [48 - 9, 464 + 1]) {
    ctx.fillStyle = vgrad(ctx, y1, FLOOR, [
      [0, '#2E4A47'],
      [1, '#223634'],
    ]);
    ctx.fillRect(x, y1, 8, FLOOR - y1);
    ctx.fillStyle = '#E6D6B4';
    ctx.fillRect(x - 2, y1 + 2, 12, 3);
    ctx.fillRect(x - 1, FLOOR - 6, 10, 6);
  }
  // lamps
  for (const x of LAMPS) {
    ctx.strokeStyle = '#11181C';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y1 + 2);
    ctx.lineTo(x, y1 + 12);
    ctx.stroke();
    ctx.fillStyle = '#2A2A2A';
    ctx.beginPath();
    ctx.moveTo(x - 4, y1 + 15);
    ctx.lineTo(x - 2, y1 + 11);
    ctx.lineTo(x + 2, y1 + 11);
    ctx.lineTo(x + 4, y1 + 15);
    ctx.fill();
    ctx.fillStyle = '#FFE2A8';
    ctx.fillRect(x - 3, y1 + 14.5, 6, 1.4);
    glow(ctx, x, y1 + 17, 34, 'rgba(255,200,120,0.32)');
  }
  // the station clock
  const cx = 150,
    cy = y1 + 15;
  ctx.strokeStyle = '#11181C';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(cx, y1);
  ctx.lineTo(cx, cy - 7);
  ctx.stroke();
  ctx.fillStyle = '#1B2328';
  ctx.beginPath();
  ctx.arc(cx, cy, 7.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#F4EFE4';
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1B2328';
  ctx.lineWidth = 0.9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  // 9:14
  const hA = ((9 + 14 / 60) / 12) * Math.PI * 2 - Math.PI / 2;
  const mA = (14 / 60) * Math.PI * 2 - Math.PI / 2;
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(hA) * 3.2, cy + Math.sin(hA) * 3.2);
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(mA) * 4.8, cy + Math.sin(mA) * 4.8);
  ctx.stroke();
}

export const MUMBAI_SCENE: Scene = {
  base: '#1C1630',
  accent: '#F2A65A',
  ground: {
    top: '#CBC4B6',
    topHi: '#F4EEE4',
    band: '#F2C230',
    bandY: 2.4,
    face: ['#6E6773', '#272230'],
    faceDepth: 52,
    edge: '#1F1A26',
    seam: '#A0988B',
    capH: 5,
    lip: '#4A4450',
    lipH: 3,
    joints: { color: 'rgba(20,14,26,0.22)', w: 24, h: 9 },
    spike: ['#F6F8FB', '#A8B2BE'],
    spikeEdge: '#1D1823',
  },
  backdrop(ctx, r) {
    ctx.fillStyle = vgrad(ctx, r.y0, FLOOR, [
      [0, '#221A44'],
      [0.45, '#6B3B72'],
      [0.8, '#E0855E'],
      [1, '#F6B572'],
    ]);
    ctx.fillRect(r.x0, r.y0, r.x1 - r.x0, FLOOR - r.y0 + 1);
    glow(ctx, 392, 176, 150, 'rgba(255,186,120,0.5)');
    ctx.fillStyle = 'rgba(255,226,170,0.95)';
    ctx.beginPath();
    ctx.arc(392, 178, 15, 0, Math.PI * 2);
    ctx.fill();
    // monsoon clouds, lit from below where the sun is
    cloud(ctx, 120, 92, 150, 'rgba(70,46,92,0.92)', 'rgba(232,140,120,0.35)');
    cloud(ctx, 330, 74, 190, 'rgba(84,52,98,0.9)', 'rgba(255,170,130,0.45)');
    cloud(ctx, 520, 104, 160, 'rgba(78,50,96,0.92)', 'rgba(255,170,120,0.4)');
    cloud(ctx, -60, 70, 170, 'rgba(60,40,84,0.92)', 'rgba(200,120,120,0.3)');
    cloud(ctx, 420, 150, 120, 'rgba(120,70,110,0.55)', 'rgba(255,190,140,0.4)');
    skyline(ctx, r);
    // the far platform across the tracks, with its lamps
    ctx.fillStyle = '#2A1F3B';
    ctx.fillRect(r.x0, 208, r.x1 - r.x0, 17);
    ctx.fillStyle = '#3A2D4C';
    ctx.fillRect(r.x0, 207, r.x1 - r.x0, 1.5);
    for (let x = Math.floor(r.x0 / 64) * 64 + 20; x < r.x1; x += 64) {
      ctx.fillStyle = '#1E1629';
      ctx.fillRect(x, 186, 1.4, 22);
      glow(ctx, x + 0.7, 186, 12, 'rgba(255,214,150,0.55)');
    }
    canopy(ctx, r);
  },
  pit(ctx, r, floorY) {
    ctx.fillStyle = vgrad(ctx, floorY, r.y1, [
      [0, '#231B2E'],
      [1, '#0C0911'],
    ]);
    ctx.fillRect(r.x0, floorY, r.x1 - r.x0, r.y1 - floorY);
    // the track down in the trench: ballast, sleepers, a rail
    const ry = floorY + 34;
    for (let i = 0; i < 400; i++) {
      const x = r.x0 + hash(i * 1.7) * (r.x1 - r.x0);
      const y = ry + 3 + hash(i * 2.9) * 14;
      ctx.fillStyle = `rgba(150,140,160,${0.08 + hash(i) * 0.12})`;
      ctx.fillRect(x, y, 1.2, 0.9);
    }
    for (let x = Math.floor(r.x0 / 12) * 12; x < r.x1; x += 12) {
      ctx.fillStyle = '#3B2B24';
      ctx.fillRect(x, ry + 2, 7, 3);
    }
    ctx.fillStyle = vgrad(ctx, ry - 1.5, ry + 1.5, [
      [0, '#C9CED6'],
      [1, '#5E636B'],
    ]);
    ctx.fillRect(r.x0, ry - 1.5, r.x1 - r.x0, 3);
  },
  ambient(ctx, r, t) {
    // a fast local thunders past on the far track now and then
    const period = 11;
    const k = (t % period) / period;
    if (k < 0.28) {
      const x = r.x1 + 40 - k * ((r.x1 - r.x0 + 520) / 0.28);
      ctx.fillStyle = 'rgba(30,22,44,0.95)';
      ctx.fillRect(x, 194, 480, 14);
      ctx.fillStyle = 'rgba(255,224,160,0.75)';
      for (let i = 0; i < 26; i++) ctx.fillRect(x + 6 + i * 18, 197, 9, 3.6);
      ctx.fillStyle = 'rgba(160,40,80,0.9)';
      ctx.fillRect(x, 203, 480, 1.6);
    }
    // lamps breathe a little
    for (const [i, x] of LAMPS.entries()) glow(ctx, x, 112, 22, 'rgba(255,210,140,0.18)', 0.6 + 0.4 * Math.sin(t * 3 + i * 1.7));
  },
  front(ctx, r, t) {
    // monsoon rain
    const w = r.x1 - r.x0,
      h = r.y1 - r.y0;
    ctx.strokeStyle = 'rgba(205,210,255,0.2)';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    for (let i = 0; i < 90; i++) {
      const x = r.x0 + ((hash(i) * w + t * 50) % w);
      const y = r.y0 + ((hash(i * 3.3) * h + t * (300 + hash(i * 7) * 80)) % h);
      ctx.moveTo(x, y);
      ctx.lineTo(x - 1.8, y + 7);
    }
    ctx.stroke();
  },
};

/** the local: cream coach, maroon stripe, barred windows, a door that never shuts */
export function drawTrain(ctx: Ctx, e: RideExit, t: number) {
  const x = e.x + e.away;
  const fl = e.floor;
  const left = x - 30,
    right = x + 16 + e.body * 16 + 400;
  const top = fl - 50;
  ctx.save();
  // body
  ctx.fillStyle = vgrad(ctx, top, fl + 4, [
    [0, '#F7F2E8'],
    [0.6, '#E7E0D2'],
    [1, '#CFC6B6'],
  ]);
  ctx.beginPath();
  ctx.moveTo(left + 6, top);
  ctx.lineTo(right, top);
  ctx.lineTo(right, fl + 4);
  ctx.lineTo(left, fl + 4);
  ctx.lineTo(left, top + 6);
  ctx.quadraticCurveTo(left, top, left + 6, top);
  ctx.fill();
  // roof
  ctx.fillStyle = '#8F8A82';
  ctx.fillRect(left + 4, top - 3, right - left - 4, 3.2);
  ctx.fillStyle = '#6E6962';
  for (let k = left + 14; k < right; k += 34) ctx.fillRect(k, top - 5, 10, 2.4);
  // stripes
  ctx.fillStyle = '#86304F';
  ctx.fillRect(left, fl - 17, right - left, 5);
  ctx.fillStyle = '#E8B53A';
  ctx.fillRect(left, fl - 11.5, right - left, 1.2);
  ctx.fillStyle = '#86304F';
  ctx.fillRect(left, top + 4, right - left, 1.6);
  // windows with bars
  for (let k = 0; k < 14; k++) {
    const wx = x + 24 + k * 22;
    ctx.fillStyle = '#1D212C';
    ctx.fillRect(wx, fl - 40, 15, 14);
    ctx.fillStyle = 'rgba(255,214,150,0.25)';
    ctx.fillRect(wx, fl - 40, 15, 5);
    ctx.fillStyle = '#B9B3A8';
    for (let b = 1; b < 4; b++) ctx.fillRect(wx, fl - 40 + b * 3.5, 15, 0.8);
  }
  // the window at the coach's end
  ctx.fillStyle = '#1D212C';
  ctx.fillRect(left + 6, fl - 40, 12, 14);
  // the door: always open
  ctx.fillStyle = '#120F18';
  ctx.fillRect(x, fl - 31, 16, 31);
  glow(ctx, x + 8, fl - 28, 18, 'rgba(255,214,150,0.45)');
  ctx.fillStyle = '#9EA4AC';
  ctx.fillRect(x + 7.4, fl - 31, 1.2, 31);
  ctx.fillStyle = '#C9CDD2';
  ctx.fillRect(x + 1, fl - 29, 3, 1);
  // the slid-back door panel
  ctx.fillStyle = '#DDD5C6';
  ctx.fillRect(x + 17, fl - 33, 7, 33);
  ctx.fillStyle = '#B5AC9C';
  ctx.fillRect(x + 17, fl - 33, 0.8, 33);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(x - 0.4, fl - 31.4, 16.8, 31.4);
  // the route board above the door: amber dots
  ctx.fillStyle = '#1A1410';
  ctx.fillRect(x - 2, fl - 39, 20, 5);
  for (let k = 0; k < 7; k++) {
    ctx.fillStyle = `rgba(255,170,40,${0.5 + 0.5 * Math.sin(t * 6 + k)})`;
    ctx.fillRect(x + 0.5 + k * 2.4, fl - 37.4, 1.4, 1.6);
  }
  ctx.restore();
}
