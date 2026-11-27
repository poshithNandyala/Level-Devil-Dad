// Dispur's hidden items, each an Assamese food or object: lal chah, japi, two leaves and a bud, til pitha, gamosa,
// masor tenga, the pepa and a laru. Kinds start with 'dis-'.
import type { ThingDraw } from '../../../render/art/things';

declare module '../../../render/art/things' {
  interface ModuleThingKinds {
    'dis-chah': true;
    'dis-japi': true;
    'dis-paat': true;
    'dis-pitha': true;
    'dis-gamosa': true;
    'dis-tenga': true;
    'dis-pepa': true;
    'dis-laru': true;
  }
}

const oval = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, fill: string) => {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
};

/** a glass of lal chah: dark red-brown tea with a curl of steam */
const chah: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#EFE6D2';
  ctx.fillRect(x + 2, y + 3, w - 4, h - 4);
  ctx.fillStyle = '#9B2D1F';
  ctx.fillRect(x + 3, y + 4, w - 6, h - 7);
  ctx.fillStyle = '#EFE6D2';
  ctx.fillRect(x + w - 3, y + 5, 3, 3);
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(x + 5, y + 2);
  ctx.quadraticCurveTo(x + 7, y, x + 5, y - 1);
  ctx.stroke();
};
/** a japi: the wide conical hat with its red-and-white band */
const japi: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#C9A253';
  ctx.beginPath();
  ctx.moveTo(x, y + h - 2);
  ctx.lineTo(x + w / 2, y + 1);
  ctx.lineTo(x + w, y + h - 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#C1121F';
  ctx.fillRect(x + 2, y + h - 4, w - 4, 2);
  ctx.fillStyle = '#FDF0D5';
  ctx.fillRect(x + w / 2 - 1, y + h - 4, 2, 2);
  ctx.strokeStyle = '#8D6B2E';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + 1);
  ctx.lineTo(x + w / 2, y + h - 3);
  ctx.stroke();
};
/** two leaves and a bud */
const paat: ThingDraw = (ctx, x, y, w, h) => {
  const cx = x + w / 2;
  ctx.fillStyle = '#2F7D32';
  ctx.beginPath();
  ctx.ellipse(cx - 3.2, y + h - 4, 4, 2, -0.7, 0, Math.PI * 2);
  ctx.ellipse(cx + 3.2, y + h - 4, 4, 2, 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#9CCC4F';
  ctx.beginPath();
  ctx.ellipse(cx, y + 4, 1.6, 3.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4F7942';
  ctx.fillRect(cx - 0.5, y + 6, 1, h - 8);
};
/** a rolled til pitha on a leaf */
const pitha: ThingDraw = (ctx, x, y, w, h) => {
  oval(ctx, x + w / 2, y + h - 3, w / 2, 2.4, '#558B2F');
  ctx.fillStyle = '#E6C98A';
  ctx.fillRect(x + 1.5, y + 3, w - 3, h - 8);
  oval(ctx, x + 1.5, y + h / 2 - 1, 1.6, (h - 8) / 2, '#C9A253');
  oval(ctx, x + w - 1.5, y + h / 2 - 1, 1.6, (h - 8) / 2, '#F2DDA6');
  ctx.fillStyle = '#6D4C41';
  for (let i = 0; i < 4; i++) ctx.fillRect(x + 3 + i * 2, y + 4 + (i % 2) * 2, 1, 1);
};
/** a gamosa: white cotton with a red border and red flower motifs */
const gamosa: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#FDF0D5';
  ctx.fillRect(x, y + 2, w, h - 4);
  ctx.fillStyle = '#C1121F';
  ctx.fillRect(x, y + 2, w, 2);
  ctx.fillRect(x, y + h - 4, w, 2);
  ctx.fillRect(x + w / 2 - 1, y + 5, 2, 2);
  ctx.fillRect(x + 2, y + 5, 1, 1);
  ctx.fillRect(x + w - 3, y + 5, 1, 1);
};
/** masor tenga: a bowl of sour fish curry with a lemon slice */
const tenga: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#B7B2A5';
  ctx.beginPath();
  ctx.moveTo(x + 1, y + 4);
  ctx.lineTo(x + w - 1, y + 4);
  ctx.lineTo(x + w - 3, y + h - 1);
  ctx.lineTo(x + 3, y + h - 1);
  ctx.closePath();
  ctx.fill();
  oval(ctx, x + w / 2, y + 4, w / 2 - 1, 2, '#E0A030');
  oval(ctx, x + w / 2 - 2, y + 4, 2.4, 1.1, '#9E9D5A');
  oval(ctx, x + w / 2 + 2.4, y + 4, 1.8, 1, '#F2E34A');
};
/** the pepa: a buffalo-horn pipe, curved */
const pepa: ThingDraw = (ctx, x, y, w, h) => {
  ctx.strokeStyle = '#E9DDC0';
  ctx.lineCap = 'round';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 2, y + h - 2);
  ctx.quadraticCurveTo(x + w * 0.4, y + h * 0.1, x + w - 2, y + 2);
  ctx.stroke();
  ctx.strokeStyle = '#6A5846';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 2, y + h - 2);
  ctx.quadraticCurveTo(x + w * 0.4, y + h * 0.1, x + w - 2, y + 2);
  ctx.stroke();
  ctx.fillStyle = '#C1121F';
  ctx.fillRect(x + 3, y + h - 5, 2, 2);
};
/** laru: two sesame-jaggery balls */
const laru: ThingDraw = (ctx, x, y, w, h) => {
  oval(ctx, x + w * 0.33, y + h * 0.6, 3.6, 3.4, '#8D5A2B');
  oval(ctx, x + w * 0.68, y + h * 0.55, 3.6, 3.4, '#A66E34');
  ctx.fillStyle = '#F3E6C4';
  for (const [dx, dy] of [[3, 5], [5, 7], [8, 4], [9, 7], [7, 8]]) ctx.fillRect(x + dx, y + dy, 1, 1);
};

export const things = {
  'dis-chah': { size: [12, 12] as [number, number], draw: chah },
  'dis-japi': { size: [14, 11] as [number, number], draw: japi },
  'dis-paat': { size: [12, 12] as [number, number], draw: paat },
  'dis-pitha': { size: [13, 11] as [number, number], draw: pitha },
  'dis-gamosa': { size: [14, 11] as [number, number], draw: gamosa },
  'dis-tenga': { size: [13, 11] as [number, number], draw: tenga },
  'dis-pepa': { size: [14, 12] as [number, number], draw: pepa },
  'dis-laru': { size: [12, 10] as [number, number], draw: laru },
};
