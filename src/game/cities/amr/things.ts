import { circle, ellipse, fillRR } from '../../../render/art/common';
import { steam, wheel } from '../../../render/art/things';
import type { ThingDraw } from '../../../render/art/things';

declare module '../../../render/art/things' {
  interface ModuleThingKinds {
    punugulu: true;
    sluice: true;
    deg: true;
    roadroller: true;
    stalactite: true;
    cablecar: true;
    sub: true;
  }
}

const punugulu: ThingDraw = (ctx, x, y, w, h, o) => {
  circle(ctx, x + w / 2, y + h / 2, w / 2, '#D4882B');
  circle(ctx, x + w / 2 - 1.2, y + h / 2 - 1.2, 1.3, '#F2C46B');
};

const sluice: ThingDraw = (ctx, x, y, w, h, o) => {
  // a barrage gate leaf, yellow arch steel
  fillRR(ctx, x, y, w, h, 1, '#F2C230', '#8A6D00', 1);
  ctx.strokeStyle = '#B48E10';
  for (let i = 4; i < h; i += 4) {
    ctx.beginPath();
    ctx.moveTo(x + 2, y + i);
    ctx.lineTo(x + w - 2, y + i);
    ctx.stroke();
  }
  ctx.fillStyle = '#C0392B';
  ctx.fillRect(x, y, w, 2);
};

const deg: ThingDraw = (ctx, x, y, w, h, o) => {
  const t = o.t;
  // a sealed biryani deg; the dough seal pops the lid
  const open = o.look === 'spent' || o.anim >= 1;
  ellipse(ctx, x + w / 2, y + h - 9, w / 2, 9, '#B87333');
  ellipse(ctx, x + w / 2, y + h - 7, w / 2 - 2, 6, '#9C5A26');
  fillRR(ctx, x + 3, y + 4, w - 6, 5, 2, '#F4E3C1', '#C8A26A', 0.8);
  if (!open) {
    fillRR(ctx, x + 4, y + (o.anim > 0 ? 0 : 1), w - 8, 4, 2, '#A0522D', '#5D3317', 0.8);
    circle(ctx, x + w / 2, y + 0.5, 2, '#5D3317');
  }
  steam(ctx, x + w / 2 - 4, y + 2, t, 3, open ? 0.8 : 0.35);
};

const roadroller: ThingDraw = (ctx, x, y, w, h, o) => {
  const t = o.t;
  // a yellow road roller with a big front drum (faces right)
  fillRR(ctx, x + 6, y + 6, 26, 14, 2, '#F2B01E', '#7A5A0B');
  fillRR(ctx, x + 10, y, 14, 7, 1, '#37474F');
  ctx.fillStyle = '#B3E5FC';
  ctx.fillRect(x + 12, y + 1.5, 10, 4);
  fillRR(ctx, x + 2, y - 4, 26, 3, 1, '#E53935');
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(x + 14, y - 1, 2, 4);
  // front drum
  circle(ctx, x + w - 10, y + h - 11, 11, '#5F6A6A', '#2C3333', 1.2);
  ctx.strokeStyle = '#7F8C8D';
  ctx.lineWidth = 1;
  ctx.beginPath();
  const sp = o.anim * 0.25;
  for (let i = 0; i < 3; i++) {
    const a = sp + (i * Math.PI) / 3;
    ctx.moveTo(x + w - 10 + Math.cos(a) * 9, y + h - 11 + Math.sin(a) * 9);
    ctx.lineTo(x + w - 10 - Math.cos(a) * 9, y + h - 11 - Math.sin(a) * 9);
  }
  ctx.stroke();
  fillRR(ctx, x + w - 22, y + 2, 4, 10, 1, '#7A5A0B');
  wheel(ctx, x + 10, y + h - 7, 7, o.anim * 0.3);
  // a little steam of heat
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  circle(ctx, x + 8, y - 8 - ((t * 0.3) % 6), 2.4, 'rgba(255,255,255,0.35)');
};

const stalactite: ThingDraw = (ctx, x, y, w, h, o) => {
  ctx.fillStyle = '#7B6A5C';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w / 2, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath();
  ctx.moveTo(x + 2, y);
  ctx.lineTo(x + 4, y);
  ctx.lineTo(x + w / 2, y + h - 3);
  ctx.closePath();
  ctx.fill();
};

const cablecar: ThingDraw = (ctx, x, y, w, h, o) => {
  ctx.strokeStyle = '#3E3E42';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y - 8);
  ctx.stroke();
  fillRR(ctx, x, y, w, h, 4, '#E8572A', '#8C2F12');
  ctx.fillStyle = '#B3E5FC';
  ctx.fillRect(x + 3, y + 4, w - 6, 7);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x, y + h - 5, w, 1.5);
};

const sub: ThingDraw = (ctx, x, y, w, h, o) => {
  // INS Kursura: the submarine museum on Vizag's beach road
  ctx.fillStyle = '#2F3B42';
  ctx.beginPath();
  ctx.moveTo(x + 8, y);
  ctx.lineTo(x + w - 18, y);
  ctx.quadraticCurveTo(x + w, y + 2, x + w, y + h / 2);
  ctx.quadraticCurveTo(x + w, y + h, x + w - 18, y + h);
  ctx.lineTo(x + 8, y + h);
  ctx.quadraticCurveTo(x - 4, y + h / 2, x + 8, y);
  ctx.fill();
  ctx.fillStyle = '#B23A2E';
  ctx.fillRect(x + 6, y + h - 5, w - 22, 3);
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fillRect(x + 8, y + 2, w - 28, 2);
  // the sail (conning tower) with the periscope
  fillRR(ctx, x + 40, y - 12, 26, 12, 2, '#37474F', '#1C262B');
  ctx.strokeStyle = '#1C262B';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x + 50, y - 12);
  ctx.lineTo(x + 50, y - 20);
  ctx.lineTo(x + 54, y - 20);
  ctx.stroke();
  ctx.fillStyle = '#ECEFF1';
  ctx.font = '700 5px sans-serif';
  ctx.fillText('S20', x + 45, y - 4);
};

export const things = {
  punugulu: { size: [8, 8] as [number, number], draw: punugulu },
  sluice: { size: [32, 16] as [number, number], draw: sluice },
  deg: { size: [32, 24] as [number, number], draw: deg },
  roadroller: { size: [48, 32] as [number, number], draw: roadroller },
  stalactite: { size: [10, 22] as [number, number], draw: stalactite },
  cablecar: { size: [26, 22] as [number, number], draw: cablecar },
  sub: { size: [112, 18] as [number, number], draw: sub },
};
