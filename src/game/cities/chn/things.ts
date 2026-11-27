import { circle, fillRR } from '../../../render/art/common';
import { wheel } from '../../../render/art/things';
import type { ThingDraw } from '../../../render/art/things';

declare module '../../../render/art/things' {
  interface ModuleThingKinds {
    'chn-lorry': true;
    'chn-mirage': true;
    'chn-loco': true;
    'chn-ball': true;
  }
}

const lorry: ThingDraw = (ctx, x, y, w, h, o) => {
  const t = o.t;
  fillRR(ctx, x + 2, y + 8, w - 30, h - 16, 10, '#1F5FA8', '#123A66', 1);
  ctx.fillStyle = '#2F7BD0';
  ctx.fillRect(x + 6, y + 14, w - 38, 3);
  fillRR(ctx, x + w - 28, y + 4, 26, h - 12, 3, '#F2F2F2', '#555', 1);
  fillRR(ctx, x + w - 22, y + 8, 16, 10, 2, '#9FD0E6');
  ctx.strokeStyle = '#123A66';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 2, y + h - 12);
  ctx.quadraticCurveTo(x - 6, y + h - 6, x - 2, y + h);
  ctx.stroke();
  wheel(ctx, x + 16, y + h - 6, 6, o.anim * 0.2);
  wheel(ctx, x + 40, y + h - 6, 6, o.anim * 0.2);
  wheel(ctx, x + w - 16, y + h - 6, 6, o.anim * 0.2);
  if (o.look === 'leak') {
    ctx.fillStyle = 'rgba(120,190,230,0.8)';
    for (let i = 0; i < 4; i++) circle(ctx, x - 2 - ((t + i * 6) % 18), y + h - 2, 1.4, 'rgba(120,190,230,0.8)');
  }
};

const mirage: ThingDraw = (ctx, x, y, w, h, o) => {
  const t = o.t;
  // the shimmering fake exit
  ctx.globalAlpha = 0.45 + 0.25 * Math.sin(t * 0.15);
  fillRR(ctx, x + 1, y + 1, w - 2, h - 1, 3, '#FFE082', '#FFB300', 1);
  ctx.globalAlpha = 1;
};

const loco: ThingDraw = (ctx, x, y, w, h, o) => {
  // a small diesel engine, faces left, big lamp
  fillRR(ctx, x + 2, y + 8, w - 4, h - 14, 2, '#1565C0', '#0D47A1');
  fillRR(ctx, x + w - 22, y, 20, 12, 2, '#1565C0', '#0D47A1');
  ctx.fillStyle = '#FFCA28';
  ctx.fillRect(x + 2, y + 14, w - 4, 3);
  ctx.fillStyle = '#B3E5FC';
  ctx.fillRect(x + w - 18, y + 3, 12, 6);
  circle(ctx, x + 4, y + 12, 2.2, '#FFF6C2');
  const g = ctx.createRadialGradient(x + 4, y + 12, 1, x - 10, y + 14, 24);
  g.addColorStop(0, 'rgba(255,246,194,0.6)');
  g.addColorStop(1, 'rgba(255,246,194,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - 30, y - 6, 34, 36);
  for (const wx of [10, 22, w - 22, w - 10]) wheel(ctx, x + wx, y + h - 5, 5, o.anim * 0.3);
};

const ball: ThingDraw = (ctx, x, y, w, h, o) => {
  // a cricket ball: red leather, a white seam
  circle(ctx, x + w / 2, y + h / 2, w / 2, '#C62828', '#7F1010', 0.8);
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.arc(x + w / 2 + 3.5, y + h / 2, 3.6, Math.PI * 0.72, Math.PI * 1.28);
  ctx.stroke();
  circle(ctx, x + w / 2 - 1.5, y + h / 2 - 1.5, 1.1, 'rgba(255,255,255,0.45)');
};

export const things = {
  'chn-lorry': { size: [96, 44] as [number, number], draw: lorry },
  'chn-mirage': { size: [16, 32] as [number, number], draw: mirage },
  'chn-loco': { size: [56, 32] as [number, number], draw: loco },
  'chn-ball': { size: [8, 8] as [number, number], draw: ball },
};
