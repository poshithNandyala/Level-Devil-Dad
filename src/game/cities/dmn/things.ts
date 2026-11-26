import type { ThingDraw } from '../../../render/art/things';

declare module '../../../render/art/things' {
  interface ModuleThingKinds {
    bombil: true;
  }
}

const bombil: ThingDraw = (ctx, x, y, w, h, o) => {
  // a dried Bombay duck: a long pale fish, a little curled
  ctx.fillStyle = '#E8D9B8';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2, w / 2 - 1, h / 2 - 1.5, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#C8B68C';
  ctx.beginPath();
  ctx.moveTo(x + 1, y + h / 2);
  ctx.lineTo(x - 2, y + 1);
  ctx.lineTo(x - 2, y + h - 1);
  ctx.fill();
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(x + w - 4, y + 2.5, 1.2, 1.2);
};

export const things = {
  bombil: { size: [14, 8] as [number, number], draw: bombil },
};
