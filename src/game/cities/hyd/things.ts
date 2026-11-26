import { circle } from '../../../render/art/common';
import type { ThingDraw } from '../../../render/art/things';

declare module '../../../render/art/things' {
  interface ModuleThingKinds {
    bangle: true;
    cannonball: true;
  }
}

const bangle: ThingDraw = (ctx, x, y, w, h, o) => {
  ctx.strokeStyle = ['#8E24AA', '#43A047', '#E53935', '#FDD835'][Math.floor(o.anim * 3 + 4) & 3];
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2, w / 2 - 1, h / 2 - 1, o.anim, 0, Math.PI * 2);
  ctx.stroke();
};

const cannonball: ThingDraw = (ctx, x, y, w, h, o) => {
  circle(ctx, x + w / 2, y + h / 2, w / 2, '#37474F', '#1C262B', 1);
  circle(ctx, x + w / 2 - 2, y + h / 2 - 2, 1.6, 'rgba(255,255,255,0.35)');
};

export const things = {
  bangle: { size: [8, 8] as [number, number], draw: bangle },
  cannonball: { size: [12, 12] as [number, number], draw: cannonball },
};
