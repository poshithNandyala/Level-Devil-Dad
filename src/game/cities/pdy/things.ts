import { circle, fillRR } from '../../../render/art/common';
import type { ThingDraw } from '../../../render/art/things';

declare module '../../../render/art/things' {
  interface ModuleThingKinds {
    bollard: true;
    awning: true;
    umbrella: true;
    croissant: true;
    lights: true;
    surfboard: true;
    rocket: true;
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

export const things = {
  bollard: { size: [8, 16] as [number, number], draw: bollard },
  awning: { size: [32, 8] as [number, number], draw: awning },
  umbrella: { size: [16, 16] as [number, number], draw: umbrella },
  croissant: { size: [12, 12] as [number, number], draw: croissant },
  lights: { size: [32, 12] as [number, number], draw: lights },
  surfboard: { size: [32, 6] as [number, number], draw: surfboard },
  rocket: { size: [6, 14] as [number, number], draw: rocket },
};
