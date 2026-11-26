import { circle, fillRR } from '../../../render/art/common';
import { steam } from '../../../render/art/things';
import type { ThingDraw } from '../../../render/art/things';

declare module '../../../render/art/things' {
  interface ModuleThingKinds {
    chaaya: true;
    net: true;
    parunthu: true;
    snakeboat: true;
  }
}

const chaaya: ThingDraw = (ctx, x, y, w, h, o) => {
  const t = o.t;
  // a glass of tea, the Kerala street-stall way
  fillRR(ctx, x + 2, y + 1, 8, 11, 1.5, 'rgba(255,255,255,0.75)', '#8D6E63', 0.8);
  fillRR(ctx, x + 2.5, y + 4, 7, 7.5, 1.2, '#C98B4F');
  ctx.fillStyle = '#F3E2C7';
  ctx.fillRect(x + 2.5, y + 4, 7, 1.5);
  steam(ctx, x + 4, y, t, 2, 0.5);
};

const net: ThingDraw = (ctx, x, y, w, h, o) => {
  // a Chinese fishing net's basket: a square of mesh on a bamboo frame
  ctx.strokeStyle = '#5D4037';
  ctx.lineWidth = 1.6;
  ctx.strokeRect(x + 0.8, y + 0.8, w - 1.6, h - 1.6);
  ctx.strokeStyle = 'rgba(80,60,40,0.7)';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  for (let i = 4; i < w; i += 4) {
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i - 2, y + h);
  }
  ctx.stroke();
  ctx.strokeStyle = '#4A3A2A';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(x + 1, y);
  ctx.lineTo(x + w / 2, y - 30);
  ctx.lineTo(x + w - 1, y);
  ctx.stroke();
};

const parunthu: ThingDraw = (ctx, x, y, w, h, o) => {
  const t = o.t;
  // a Brahminy kite gliding left: chestnut wings held out flat, white head and breast, a hooked
  // yellow bill. It soars, it doesn't flap like a crow
  const tilt = Math.sin(t * 0.08) * 0.8;
  ctx.fillStyle = '#9A4A1C';
  // wings, out flat with dark tips
  ctx.beginPath();
  ctx.moveTo(x + 6, y + 6);
  ctx.lineTo(x + 10, y + 0.5 + tilt);
  ctx.lineTo(x + 16, y + 0.5 + tilt);
  ctx.lineTo(x + 14, y + 6);
  ctx.fill();
  ctx.fillStyle = '#3B1E0C';
  ctx.fillRect(x + 10, y + 0.5 + tilt, 2.4, 1.4);
  // tail fan
  ctx.fillStyle = '#A85626';
  ctx.beginPath();
  ctx.moveTo(x + 15, y + 6);
  ctx.lineTo(x + 21.5, y + 4.5);
  ctx.lineTo(x + 21.5, y + 8.5);
  ctx.fill();
  // body
  ctx.fillStyle = '#9A4A1C';
  ctx.beginPath();
  ctx.ellipse(x + 10.5, y + 7, 6.5, 2.9, 0, 0, Math.PI * 2);
  ctx.fill();
  // white head and breast
  ctx.fillStyle = '#F4F1EA';
  ctx.beginPath();
  ctx.ellipse(x + 5.2, y + 7.2, 3.6, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();
  circle(ctx, x + 3.2, y + 6, 2.4, '#FBF9F4');
  // hooked bill and eye
  ctx.fillStyle = '#E8B730';
  ctx.beginPath();
  ctx.moveTo(x + 1.2, y + 5.4);
  ctx.lineTo(x - 0.8, y + 6.4);
  ctx.lineTo(x + 1.2, y + 7);
  ctx.fill();
  circle(ctx, x + 2.6, y + 5.5, 0.6, '#2A1A0E');
};

const snakeboat: ThingDraw = (ctx, x, y, w, h, o) => {
  const t = o.t;
  // a chundan vallam: a long low black hull, the stern curling up high behind (it races to the
  // right), gold trim, a red-and-gold umbrella, and a row of oarsmen pulling in time
  const sw = Math.sin(t * 0.21);
  // oars first, so the hull sits over them
  ctx.lineWidth = 1;
  for (let i = 18; i < w - 12; i += 6) {
    const tipX = x + i - 6 + sw * 5;
    ctx.strokeStyle = '#7A5A43';
    ctx.beginPath();
    ctx.moveTo(x + i, y + 3);
    ctx.lineTo(tipX, y + h + 7);
    ctx.stroke();
    ctx.fillStyle = '#6A4A35';
    ctx.fillRect(tipX - 1, y + h + 5, 2, 3);
    if (sw > 0.75) {
      ctx.fillStyle = 'rgba(235,248,250,0.7)';
      ctx.fillRect(tipX - 2, y + h + 8, 4, 1);
    }
  }
  // oarsmen: heads and white shirts, leaning with the stroke
  for (let i = 18; i < w - 12; i += 6) {
    const lean = sw * 0.9;
    ctx.fillStyle = '#F4F1EA';
    ctx.fillRect(x + i - 1 + lean * 0.5, y - 2.6, 3, 2.8);
    circle(ctx, x + i + 0.5 + lean, y - 3.6, 1.5, '#2A1A12');
    if ((i / 6) % 2 === 0) {
      ctx.fillStyle = '#C62828';
      ctx.fillRect(x + i - 0.6 + lean, y - 5.3, 2.4, 0.9);
    }
  }
  // the hull, with its stern curling up at the back
  ctx.fillStyle = '#1F1610';
  ctx.beginPath();
  ctx.moveTo(x + 24, y + h);
  ctx.quadraticCurveTo(x + 3, y + h, x - 1, y - 6);
  ctx.quadraticCurveTo(x - 3, y - 22, x + 5, y - 30);
  ctx.lineTo(x + 8, y - 28);
  ctx.quadraticCurveTo(x + 4, y - 18, x + 9, y - 4);
  ctx.quadraticCurveTo(x + 13, y + 0.5, x + 24, y + 0.5);
  ctx.lineTo(x + w - 8, y + 0.5);
  ctx.quadraticCurveTo(x + w + 3, y + 0.5, x + w + 6, y + 2.5);
  ctx.quadraticCurveTo(x + w - 2, y + h, x + w - 22, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fillRect(x + 14, y + 1.5, w - 26, 0.8);
  ctx.fillStyle = '#D4AF37';
  ctx.fillRect(x + 11, y + 4, w - 22, 1.2);
  ctx.fillRect(x + 11, y + h - 2.5, w - 34, 0.8);
  // brass finial and the team flag on the stern
  circle(ctx, x + 6.5, y - 30, 1.8, '#E3BE52');
  ctx.fillStyle = '#C62828';
  ctx.beginPath();
  ctx.moveTo(x + 6.5, y - 32);
  ctx.lineTo(x + 15 + Math.sin(t * 0.3) * 1.2, y - 30.5);
  ctx.lineTo(x + 6.5, y - 28);
  ctx.fill();
  // ornamental umbrellas (muthukuda) mid-boat
  for (const u of [0.42, 0.7]) {
    const ux = x + w * u;
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(ux - 0.5, y - 15, 1, 15);
    ctx.fillStyle = '#C62828';
    ctx.beginPath();
    ctx.arc(ux, y - 14, 5.5, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#E3BE52';
    for (let k = -2; k <= 2; k++) ctx.fillRect(ux + k * 2.4 - 0.5, y - 14, 1, 2 + (k % 2 === 0 ? 1 : 0));
    circle(ctx, ux, y - 20, 1.1, '#E3BE52');
  }
};

export const things = {
  chaaya: { size: [12, 12] as [number, number], draw: chaaya },
  net: { size: [32, 6] as [number, number], draw: net },
  parunthu: { size: [22, 12] as [number, number], draw: parunthu },
  snakeboat: { size: [128, 10] as [number, number], draw: snakeboat },
};
