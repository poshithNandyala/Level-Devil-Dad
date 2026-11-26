import type { ThingDraw } from '../../../render/art/things';

declare module '../../../render/art/things' {
  interface ModuleThingKinds {
    poha: true;
  }
}

const poha: ThingDraw = (ctx, x, y, w, h, o) => {
  // a leaf plate of poha: yellow flattened rice, sev on top, a jalebi on the side, a wedge of lime
  const cx = x + w / 2,
    cy = y + h / 2 + 1.5;
  ctx.fillStyle = '#5E8C3A';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 1, w / 2, h / 2 - 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#F4D03F';
  ctx.beginPath();
  ctx.ellipse(cx - 1, cy - 0.5, w / 2 - 2.5, h / 2 - 2.5, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#E67E22';
  for (let i = 0; i < 6; i++) ctx.fillRect(cx - 4 + ((i * 3) % 7), cy - 3 + ((i * 2) % 3), 1.6, 0.7);
  ctx.strokeStyle = '#F39C12';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx + 3.5, cy + 0.5, 1.6, 0, Math.PI * 1.7);
  ctx.stroke();
  ctx.fillStyle = '#C0CA33';
  ctx.fillRect(cx - 5, cy, 2, 1.2);
};

export const things = {
  poha: { size: [12, 10] as [number, number], draw: poha },
};
