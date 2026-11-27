// Itanagar's hidden items (the third star): a jar of pika pila (bamboo-shoot pickle), a momo, a Dambuk orange. Kinds start with 'ita-'.
import type { ThingDraw } from '../../../render/art/things';

declare module '../../../render/art/things' {
  interface ModuleThingKinds {
    'ita-pikapila': true;
    'ita-momo': true;
    'ita-santra': true;
  }
}

const pikapila: ThingDraw = (ctx, x, y, w, h) => {
  // a glass jar with a red lid, green bamboo shoots inside
  ctx.fillStyle = 'rgba(200,230,240,0.85)';
  ctx.fillRect(x + 1, y + 3, w - 2, h - 3);
  ctx.fillStyle = '#6F9B3A';
  ctx.fillRect(x + 3, y + 5, w - 6, h - 6);
  ctx.fillStyle = '#D7262E';
  ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillRect(x + 2, y + 4, 1, h - 5);
};

const momo: ThingDraw = (ctx, x, y, w, h) => {
  // a steamed dumpling with pleats on top
  ctx.fillStyle = '#F2E6C9';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2 + 1, w / 2, h / 2 - 1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#D9C9A3';
  for (let i = 0; i < 4; i++) ctx.fillRect(x + 2 + i * 2.5, y + 1, 1, 3);
};

const santra: ThingDraw = (ctx, x, y, w, h) => {
  // a Dambuk orange with a leaf
  ctx.fillStyle = '#F28C28';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2 + 1, Math.min(w, h) / 2 - 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5E8C4A';
  ctx.fillRect(x + w / 2, y, 4, 2);
};

export const things = {
  'ita-pikapila': { size: [10, 12] as [number, number], draw: pikapila },
  'ita-momo': { size: [12, 9] as [number, number], draw: momo },
  'ita-santra': { size: [10, 10] as [number, number], draw: santra },
};
