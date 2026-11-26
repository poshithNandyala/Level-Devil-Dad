import type { ThingDraw } from '../../../render/art/things';

declare module '../../../render/art/things' {
  interface ModuleThingKinds {
    ghevar: true;
  }
}

const ghevar: ThingDraw = (ctx, x, y, w, h, o) => {
  // a disc of ghevar: a golden honeycomb, a layer of rabri, slivered pistachios and silver leaf
  const cx = x + w / 2,
    cy = y + h / 2 + 1;
  ctx.fillStyle = '#D9A441';
  ctx.beginPath();
  ctx.ellipse(cx, cy, w / 2 - 0.5, h / 2 - 1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#A9741F';
  for (let i = 0; i < 9; i++) ctx.fillRect(cx - 4 + ((i * 3) % 8), cy - 2 + ((i * 5) % 4), 1, 1);
  ctx.fillStyle = '#FFF3D6';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 1.5, w / 2 - 2.5, 1.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7CB342';
  ctx.fillRect(cx - 2, cy - 2.4, 1.6, 0.8);
  ctx.fillRect(cx + 1.5, cy - 2, 1.6, 0.8);
  ctx.fillStyle = '#ECEFF1';
  ctx.fillRect(cx - 0.5, cy - 2.6, 1.4, 1);
};

export const things = {
  ghevar: { size: [12, 10] as [number, number], draw: ghevar },
};
