import type { ThingDraw } from '../../../render/art/things';

declare module '../../../render/art/things' {
  interface ModuleThingKinds {
    dhokla: true;
  }
}

const dhokla: ThingDraw = (ctx, x, y, w, h, o) => {
  // a square of khaman dhokla: spongy yellow, mustard seeds and a green chilli on top
  ctx.fillStyle = '#F9D84A';
  ctx.fillRect(x + 1, y + 2, w - 2, h - 3);
  ctx.fillStyle = '#E8C02E';
  ctx.fillRect(x + 1, y + h - 3, w - 2, 2);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  for (let i = 0; i < 4; i++) ctx.fillRect(x + 2 + i * 2.5, y + 4 + (i % 2) * 2, 1, 1);
  ctx.fillStyle = '#3E2723';
  for (let i = 0; i < 5; i++) ctx.fillRect(x + 2 + ((i * 7) % 8), y + 2 + ((i * 3) % 3), 0.9, 0.9);
  ctx.fillStyle = '#43A047';
  ctx.fillRect(x + 5, y + 1, 5, 1.2);
};

export const things = {
  dhokla: { size: [12, 10] as [number, number], draw: dhokla },
};
