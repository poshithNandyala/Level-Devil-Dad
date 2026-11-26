// Bhubaneswar's hidden items: Odia food and crafts from the city bible. Kinds start with 'bbi-'.
import type { ThingDraw } from '../../../render/art/things';

declare module '../../../render/art/things' {
  interface ModuleThingKinds {
    'bbi-chhenapoda': true;
    'bbi-dahibara': true;
    'bbi-podapitha': true;
    'bbi-badi': true;
    'bbi-filigree': true;
  }
}

/** a wedge of chhena poda: the dark caramel crust over pale baked cheese, on a sal leaf */
const chhenapoda: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#5D8A3A';
  ctx.fillRect(x, y + h - 2, w, 2);
  ctx.fillStyle = '#F3D9A4';
  ctx.beginPath();
  ctx.moveTo(x + 1, y + h - 2);
  ctx.lineTo(x + w - 1, y + h - 2);
  ctx.lineTo(x + w - 3, y + 3);
  ctx.lineTo(x + 3, y + 3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#7A3E12';
  ctx.fillRect(x + 3, y + 1, w - 6, 3);
  ctx.fillStyle = '#A4581E';
  ctx.fillRect(x + 1, y + h - 4, 2, 2);
  ctx.fillRect(x + w - 3, y + h - 4, 2, 2);
};

/** dahibara: two lentil rings soaked in thin curd, a spoon of aloo dum, in a leaf cup */
const dahibara: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#6B8E3A';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h - 3, w / 2, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFF8EA';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h - 4.5, w / 2 - 1, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const dx of [-2.6, 2.6]) {
    ctx.fillStyle = '#C98B3E';
    ctx.beginPath();
    ctx.arc(x + w / 2 + dx, y + h - 6, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFF8EA';
    ctx.beginPath();
    ctx.arc(x + w / 2 + dx, y + h - 6, 0.9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#B5651D';
  ctx.fillRect(x + w / 2 - 1, y + 1, 3, 2);
};

/** podapitha: the dark baked rice cake of Raja, a slice cut to show the coconut inside */
const podapitha: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#4A2A14';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2 + 1, w / 2, h / 2 - 1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#E6C79A';
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h / 2 + 1);
  ctx.arc(x + w / 2, y + h / 2 + 1, w / 2 - 1, -0.4, 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + w - 4, y + h / 2, 1, 1);
  ctx.fillRect(x + w - 5, y + h / 2 + 2, 1, 1);
};

/** a badi: a crisp sun-dried lentil lump, fried, for pakhala */
const badi: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#9C5A1E';
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + 1);
  ctx.lineTo(x + w - 1, y + h - 2);
  ctx.lineTo(x + 1, y + h - 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#D08A3C';
  ctx.fillRect(x + 3, y + h - 5, 2, 2);
  ctx.fillRect(x + w - 5, y + h - 6, 2, 2);
  ctx.fillRect(x + w / 2 - 1, y + 4, 2, 2);
};

/** a tarakasi flower: silver filigree curls round a centre */
const filigree: ThingDraw = (ctx, x, y, w, h) => {
  const cx = x + w / 2,
    cy = y + h / 2;
  ctx.strokeStyle = '#E8EEF2';
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * 3, cy + Math.sin(a) * 3, 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#B0BEC5';
  ctx.beginPath();
  ctx.arc(cx, cy, 1.6, 0, Math.PI * 2);
  ctx.fill();
};

export const things = {
  'bbi-chhenapoda': { size: [12, 10] as [number, number], draw: chhenapoda },
  'bbi-dahibara': { size: [12, 10] as [number, number], draw: dahibara },
  'bbi-podapitha': { size: [12, 10] as [number, number], draw: podapitha },
  'bbi-badi': { size: [10, 9] as [number, number], draw: badi },
  'bbi-filigree': { size: [12, 12] as [number, number], draw: filigree },
};
