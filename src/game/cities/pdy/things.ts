import { circle, fillRR } from '../../../render/art/common';
import type { ThingDraw } from '../../../render/art/things';

declare module '../../../render/art/things' {
  interface ModuleThingKinds {
    'pdy-bollard': true;
    'pdy-awning': true;
    'pdy-umbrella': true;
    'pdy-croissant': true;
    'pdy-lights': true;
    'pdy-surfboard': true;
    'pdy-rocket': true;
    'pdy-boule': true;
    'pdy-cochonnet': true;
    'pdy-leaf': true;
    'pdy-square': true;
  }
}

const bollard: ThingDraw = (ctx, x, y, w, h, o) => {
  fillRR(ctx, x, y, w, h, 3, '#E9E2D2', '#3D3A36');
  ctx.fillStyle = '#D23B2E';
  ctx.fillRect(x + 1, y + 3, w - 2, 3);
};

const awning: ThingDraw = (ctx, x, y, w, h, o) => {
  for (let i = 0; i < w; i += 8) {
    ctx.fillStyle = (i / 8) % 2 ? '#F2F0E6' : o.tint ?? '#C8462E';
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + 8, y);
    ctx.lineTo(x + i + 8, y + h - 2);
    ctx.quadraticCurveTo(x + i + 4, y + h + 2, x + i, y + h - 2);
    ctx.fill();
  }
};

const umbrella: ThingDraw = (ctx, x, y, w, h, o) => {
  ctx.fillStyle = o.tint ?? '#1D1D22';
  ctx.beginPath();
  ctx.moveTo(x, y + 7);
  ctx.quadraticCurveTo(x + w / 2, y - 3, x + w, y + 7);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#1D1D22';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + 6);
  ctx.lineTo(x + w / 2, y + h - 2);
  ctx.quadraticCurveTo(x + w / 2 + 3, y + h, x + w / 2 + 3, y + h - 3);
  ctx.stroke();
};

const croissant: ThingDraw = (ctx, x, y, w, h, o) => {
  ctx.fillStyle = '#E0A458';
  ctx.beginPath();
  ctx.arc(x + 6, y + 9, 6, Math.PI, 0);
  ctx.quadraticCurveTo(x + 6, y + 6, x, y + 9);
  ctx.fill();
  ctx.strokeStyle = '#A86B2D';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 3 + i * 3, y + 4);
    ctx.lineTo(x + 3 + i * 3, y + 8);
    ctx.stroke();
  }
};

const lights: ThingDraw = (ctx, x, y, w, h, o) => {
  const t = o.t;
  // a string of festoon bulbs between lamp posts: pretty, and hot
  ctx.strokeStyle = '#2B2B2E';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - 6, y);
  ctx.quadraticCurveTo(x + w / 2, y + h, x + w + 6, y);
  ctx.stroke();
  const cols = ['#FFD54F', '#FF7043', '#81C784', '#4FC3F7', '#F06292'];
  const on = o.look !== 'off';
  for (let i = 0; i < 5; i++) {
    const k = (i + 0.5) / 5;
    const bx = x + w * k;
    const by = y + 4 * k * (1 - k) * h + 3;
    if (on) circle(ctx, bx, by, 4.2, 'rgba(255,236,170,0.28)');
    circle(ctx, bx, by, 2.2, on ? cols[(i + Math.floor(t / 30)) % 5] : '#8D8D8D');
  }
};

const surfboard: ThingDraw = (ctx, x, y, w, h, o) => {
  ctx.fillStyle = o.tint ?? '#FF7043';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + 4, y + h / 2 - 0.6, w - 8, 1.2);
};

const rocket: ThingDraw = (ctx, x, y, w, h, o) => {
  const t = o.t;
  fillRR(ctx, x, y + 3, w, h - 6, 1, '#E53935', '#7F1D1D');
  ctx.fillStyle = '#FFD54F';
  ctx.beginPath();
  ctx.moveTo(x, y + 3);
  ctx.lineTo(x + w / 2, y - 1);
  ctx.lineTo(x + w, y + 3);
  ctx.fill();
  circle(ctx, x + w / 2, y + h - 1, 2 + Math.sin(t * 0.9), '#FFB300');
};

/** a steel pétanque boule: dull silver with its two grooves */
const boule: ThingDraw = (ctx, x, y, w, h, o) => {
  const r = Math.min(w, h) / 2;
  if (w >= h * 1.8) {
    // a heap: two boules side by side in one box
    circle(ctx, x + r, y + h / 2, r, o.tint ?? '#9FA8B3');
    circle(ctx, x + w - r, y + h / 2, r, o.tint ?? '#8A939E');
    return;
  }
  circle(ctx, x + w / 2, y + h / 2, r, o.tint ?? '#9FA8B3');
  circle(ctx, x + w / 2 - r * 0.3, y + h / 2 - r * 0.3, r * 0.35, 'rgba(255,255,255,0.55)');
  ctx.strokeStyle = 'rgba(40,45,55,0.6)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2, r * 0.7, 0.3, Math.PI - 0.3);
  ctx.stroke();
};

/** the cochonnet (the jack): a small bright wooden ball */
const cochonnet: ThingDraw = (ctx, x, y, w, h) => {
  circle(ctx, x + w / 2, y + h / 2, w / 2, '#E53935');
  circle(ctx, x + w / 2 - 1.2, y + h / 2 - 1.2, 1.1, 'rgba(255,255,255,0.7)');
};

/**
 * a mimosa (thottal sinungi) leaf: a rib with paired leaflets. look 'open': leaflets spread flat
 * (a broad inviting platform); 'fold': closing; 'shut': pressed together into a thin stiff bar.
 */
const leaf: ThingDraw = (ctx, x, y, w, h, o) => {
  const look = o.look ?? 'open';
  const k = look === 'shut' ? 1 : look === 'fold' || look === 'reopen' ? 0.55 : 0;
  const cy = y + h / 2;
  // the rib
  ctx.strokeStyle = '#4E7A3A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 1, cy);
  ctx.lineTo(x + w - 1, cy);
  ctx.stroke();
  const n = Math.max(3, Math.floor(w / 9));
  for (let i = 0; i < n; i++) {
    const lx = x + 5 + (i * (w - 10)) / (n - 1);
    const len = 7 - k * 4.5;
    const lift = k * 5;
    ctx.fillStyle = i % 2 ? '#7CB342' : '#8BC34A';
    ctx.beginPath();
    ctx.ellipse(lx, cy - 1 - lift, len, 2.2, (k * Math.PI) / 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = i % 2 ? '#689F38' : '#7CB342';
    ctx.beginPath();
    ctx.ellipse(lx, cy + 1 + lift * 0.4, len, 2.2, (-k * Math.PI) / 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  if (look === 'shut') {
    ctx.fillStyle = '#558B2F';
    ctx.fillRect(x + 1, cy - 2, w - 2, 4);
  }
};

/** the Promenade's painted yellow landing square (a plywood square, yellow as the bollards) */
const square: ThingDraw = (ctx, x, y, w, h, o) => {
  fillRR(ctx, x, y, w, h, 1.5, o.tint ?? '#FFD54F', '#B8860B');
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
};

export const things = {
  'pdy-bollard': { size: [8, 16] as [number, number], draw: bollard },
  'pdy-awning': { size: [32, 8] as [number, number], draw: awning },
  'pdy-umbrella': { size: [16, 16] as [number, number], draw: umbrella },
  'pdy-croissant': { size: [12, 12] as [number, number], draw: croissant },
  'pdy-lights': { size: [32, 12] as [number, number], draw: lights },
  'pdy-surfboard': { size: [32, 6] as [number, number], draw: surfboard },
  'pdy-rocket': { size: [6, 14] as [number, number], draw: rocket },
  'pdy-boule': { size: [12, 12] as [number, number], draw: boule },
  'pdy-cochonnet': { size: [6, 6] as [number, number], draw: cochonnet },
  'pdy-leaf': { size: [64, 6] as [number, number], draw: leaf },
  'pdy-square': { size: [16, 4] as [number, number], draw: square },
};
