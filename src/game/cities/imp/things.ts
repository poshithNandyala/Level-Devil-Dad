// Imphal's hidden items: chak-hao (black rice) in a bowl, and a few other things from the market. Kinds start with 'imp-'.
import type { ThingDraw } from '../../../render/art/things';

declare module '../../../render/art/things' {
  interface ModuleThingKinds {
    'imp-chakhao': true;
    'imp-singju': true;
    'imp-eromba': true;
    'imp-umorok': true;
    'imp-kauna': true;
  }
}

/** a bowl of black rice with a purple sheen */
const chakhao: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#C9A56B';
  ctx.fillRect(x, y + h - 5, w, 5);
  ctx.fillStyle = '#2A1A2E';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h - 5, w / 2 - 1, 4, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#7A4F8A';
  ctx.fillRect(x + 3, y + h - 8, 3, 1);
  ctx.fillRect(x + w - 6, y + h - 7, 2, 1);
};
/** a leaf plate of singju (salad): green with red chilli flecks */
const singju: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#4F7A2A';
  ctx.fillRect(x, y + h - 4, w, 4);
  ctx.fillStyle = '#8FBF4A';
  ctx.fillRect(x + 1, y + 2, w - 2, h - 6);
  ctx.fillStyle = '#D7262E';
  ctx.fillRect(x + 3, y + 3, 2, 2);
  ctx.fillRect(x + w - 5, y + 4, 2, 2);
};
/** a bowl of eromba: mashed and red */
const eromba: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#A8602A';
  ctx.fillRect(x, y + h - 5, w, 5);
  ctx.fillStyle = '#C0392B';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h - 5, w / 2 - 1, 4, 0, Math.PI, 0);
  ctx.fill();
};
/** an umorok chilli: a red king chilli with a green stalk */
const umorok: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#D7262E';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2 + 1, w / 2 - 1, h / 2 - 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4F7A2A';
  ctx.fillRect(x + w / 2 - 1, y, 2, 3);
};
/** a kauna reed basket */
const kauna: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#B8975A';
  ctx.fillRect(x, y + 2, w, h - 2);
  ctx.fillStyle = '#8A6A3A';
  for (let i = 0; i < h - 2; i += 3) ctx.fillRect(x, y + 2 + i, w, 1);
  ctx.fillRect(x + w / 2 - 3, y, 6, 2);
};

export const things = {
  'imp-chakhao': { size: [12, 10] as [number, number], draw: chakhao },
  'imp-singju': { size: [12, 10] as [number, number], draw: singju },
  'imp-eromba': { size: [12, 10] as [number, number], draw: eromba },
  'imp-umorok': { size: [10, 10] as [number, number], draw: umorok },
  'imp-kauna': { size: [12, 11] as [number, number], draw: kauna },
};
