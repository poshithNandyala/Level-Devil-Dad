// Shillong's hidden item: pumaloi, the steamed rice-flour cake, in its banana-leaf wrap. Kinds start with 'shl-'.
import type { ThingDraw } from '../../../render/art/things';

declare module '../../../render/art/things' {
  interface ModuleThingKinds {
    'shl-pumaloi': true;
  }
}

const pumaloi: ThingDraw = (ctx, x, y, w, h) => {
  // a leaf wrap open at the top, the pale cake inside, steam
  ctx.fillStyle = '#4E8A3E';
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + 1, y + 3);
  ctx.lineTo(x + w - 1, y + 3);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#F2EBD8';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + 4, w / 2 - 2, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillRect(x + w / 2 - 3, y - 1, 1, 2);
  ctx.fillRect(x + w / 2 + 1, y - 2, 1, 2);
};

export const things = { 'shl-pumaloi': { size: [12, 10] as [number, number], draw: pumaloi } };
