import type { ThingDraw } from '../../../render/art/things';

declare module '../../../render/art/things' {
  interface ModuleThingKinds {
    poi: true;
  }
}

const poi: ThingDraw = (ctx, x, y, w, h, o) => {
  // Goan poi: a puffy round bread, bran-dusted
  ctx.fillStyle = '#C98A4B';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h * 0.58, w / 2, h * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#E3B47A';
  ctx.beginPath();
  ctx.ellipse(x + w / 2 - 1, y + h * 0.45, w * 0.32, h * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(90,50,20,0.55)';
  for (let i = 0; i < 6; i++) ctx.fillRect(x + 2 + ((i * 7) % 9), y + 3 + ((i * 5) % 5), 0.8, 0.8);
};

export const things = {
  poi: { size: [12, 10] as [number, number], draw: poi },
};
