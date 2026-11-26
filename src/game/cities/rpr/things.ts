import type { ThingDraw } from '../../../render/art/things';

declare module '../../../render/art/things' {
  interface ModuleThingKinds {
    chila: true;
  }
}

const chila: ThingDraw = (ctx, x, y, w, h, o) => {
  // a rice-flour chila folded on a sal leaf, with green chutney and a tomato one
  const cx = x + w / 2,
    cy = y + h / 2 + 1;
  ctx.fillStyle = '#558B2F';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 1.5, w / 2, h / 2 - 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFF3D6';
  ctx.beginPath();
  ctx.moveTo(cx - 5, cy + 2);
  ctx.quadraticCurveTo(cx, cy - 6, cx + 5, cy + 2);
  ctx.fill();
  ctx.fillStyle = '#E8C98A';
  for (let i = 0; i < 5; i++) ctx.fillRect(cx - 3 + ((i * 3) % 6), cy - 2 + ((i * 2) % 3), 1, 1);
  ctx.fillStyle = '#7CB342';
  ctx.fillRect(cx - 5.5, cy + 2, 2.4, 1.6);
  ctx.fillStyle = '#E53935';
  ctx.fillRect(cx + 3.2, cy + 2, 2.4, 1.6);
};

export const things = {
  chila: { size: [12, 10] as [number, number], draw: chila },
};
