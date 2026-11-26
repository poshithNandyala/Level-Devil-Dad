// Ranchi's hidden item: a dhuska on a sal-leaf dona.
import type { ThingDraw } from '../../../render/art/things';

declare module '../../../render/art/things' {
  interface ModuleThingKinds {
    dhuska: true;
  }
}

const dhuska: ThingDraw = (ctx, x, y, w, h) => {
  // a dhuska on a sal-leaf dona, with a spoon of ghugni on the side
  const cx = x + w / 2,
    cy = y + h / 2 + 1.5;
  ctx.fillStyle = '#558B2F';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 1.5, w / 2, h / 2 - 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#E8A33D';
  ctx.beginPath();
  ctx.ellipse(cx - 0.5, cy - 0.5, 4.6, 3.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#C97B22';
  ctx.fillRect(cx - 4.4, cy - 1.2, 8, 0.9);
  ctx.fillStyle = '#6D4C41';
  ctx.beginPath();
  ctx.arc(cx + 3.6, cy + 1.6, 1.8, 0, Math.PI * 2);
  ctx.fill();
};

export const things = { dhuska: { size: [12, 10] as [number, number], draw: dhuska } };
