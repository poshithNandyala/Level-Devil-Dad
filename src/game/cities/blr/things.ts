import type { ThingDraw } from '../../../render/art/things';

declare module '../../../render/art/things' {
  interface ModuleThingKinds {
    leaf: true;
    coracle: true;
  }
}

const leaf: ThingDraw = (ctx, x, y, w, h, o) => {
  ctx.fillStyle = '#4CAF50';
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.quadraticCurveTo(x + w / 2, y - 3, x + w, y + h);
  ctx.fill();
  ctx.strokeStyle = '#2E7D32';
  ctx.beginPath();
  ctx.moveTo(x + 2, y + h - 1);
  ctx.lineTo(x + w - 2, y + h - 1);
  ctx.stroke();
};

const coracle: ThingDraw = (ctx, x, y, w, h, o) => {
  // a round bamboo coracle, slowly turning
  ctx.fillStyle = '#6D4C41';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + 4, w / 2, 5, 0, 0, Math.PI);
  ctx.fill();
  ctx.strokeStyle = '#A1887F';
  ctx.lineWidth = 0.8;
  const turn = (o.anim * 0.05) % 1;
  for (let i = 0; i < 6; i++) {
    const k = ((i / 6 + turn) % 1) * Math.PI;
    const xx = x + w / 2 - Math.cos(k) * (w / 2 - 2);
    ctx.beginPath();
    ctx.moveTo(xx, y + 3);
    ctx.lineTo(xx, y + 8);
    ctx.stroke();
  }
  ctx.strokeStyle = '#3E2723';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + 3, w / 2, 2.4, 0, 0, Math.PI * 2);
  ctx.stroke();
};

export const things = {
  leaf: { size: [32, 4] as [number, number], draw: leaf },
  coracle: { size: [32, 12] as [number, number], draw: coracle },
};
