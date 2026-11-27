import { circle } from '../../../render/art/common';
import type { ThingDraw } from '../../../render/art/things';

declare module '../../../render/art/things' {
  interface ModuleThingKinds {
    tuna: true;
  }
}

const tuna: ThingDraw = (ctx, x, y, w, h, o) => {
  ctx.fillStyle = '#4F6D8A';
  ctx.beginPath();
  ctx.ellipse(x + 6, y + 4, 6, 3.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 11, y + 4);
  ctx.lineTo(x + 14, y);
  ctx.lineTo(x + 14, y + 8);
  ctx.fill();
  ctx.fillStyle = '#CFD8DC';
  ctx.fillRect(x + 2, y + 4.5, 8, 1.4);
  circle(ctx, x + 2.5, y + 3, 0.8, '#FFFFFF');
};

export const things = {
  tuna: { size: [14, 8] as [number, number], draw: tuna },
};
