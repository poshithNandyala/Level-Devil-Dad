// Kohima's hidden items (one kind per stage) and the drawn things of its own. Kinds start with 'koh-'.
import type { ThingDraw } from '../../../render/art/things';

export type KohThingKind = 'koh-galho' | 'koh-axone' | 'koh-bamboo-shoot' | 'koh-chutney' | 'koh-shawl' | 'koh-basket' | 'koh-smoked-pork' | 'koh-lily' | 'koh-drum' | 'koh-hornbill-feather';

declare module '../../../render/art/things' {
  interface ModuleThingKinds extends Record<KohThingKind, true> {}
}

const bowl = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, top: string) => {
  // a steaming bowl
  ctx.fillStyle = '#5D4037';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h - 3, w / 2, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = fill;
  ctx.fillRect(x + 1, y + 3, w - 2, h - 6);
  ctx.fillStyle = top;
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + 3.5, w / 2 - 1, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fillRect(x + 4, y, 1, 2);
  ctx.fillRect(x + w - 5, y + 0.5, 1, 2);
};

/** galho: rice porridge in a wooden bowl */
const galho: ThingDraw = (ctx, x, y, w, h) => bowl(ctx, x, y, w, h, '#6D4C41', '#F3E5AB');
/** the axone handi: a clay pot with a bamboo lid and a green waft */
const axone: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#8D5524';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2 + 1, w / 2, h / 2 - 1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#C9A24B';
  ctx.fillRect(x + 2, y, w - 4, 3);
  ctx.fillStyle = 'rgba(120,180,80,0.6)';
  ctx.fillRect(x + w / 2 - 1, y - 3, 2, 3);
};
/** a bundle of bamboo shoots */
const shoot: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#C5B358';
  ctx.fillRect(x + 1, y + 2, 3, h - 2);
  ctx.fillRect(x + 5, y, 3, h);
  ctx.fillRect(x + 9, y + 3, 2, h - 3);
  ctx.fillStyle = '#7B8C3A';
  ctx.fillRect(x + 1, y + 2, 3, 2);
  ctx.fillRect(x + 5, y, 3, 2);
};
/** king-chilli chutney in a jar (a jar only: the chilli is not a mechanic) */
const chutney: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = 'rgba(200,220,230,0.8)';
  ctx.fillRect(x + 1, y + 2, w - 2, h - 2);
  ctx.fillStyle = '#B71C1C';
  ctx.fillRect(x + 2, y + 4, w - 4, h - 5);
  ctx.fillStyle = '#455A64';
  ctx.fillRect(x, y, w, 3);
};
/** a folded Naga shawl: red and black bands */
const shawl: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#C0392B';
  ctx.fillRect(x, y + 1, w, h - 1);
  ctx.fillStyle = '#1B1B1B';
  ctx.fillRect(x, y + 3, w, 2);
  ctx.fillRect(x, y + 7, w, 2);
  ctx.fillStyle = '#E0B04A';
  ctx.fillRect(x, y + 5.5, w, 1);
};
/** a cane basket */
const basket: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#A1887F';
  ctx.fillRect(x + 1, y + 3, w - 2, h - 3);
  ctx.fillStyle = '#6D4C41';
  for (let i = 0; i < 3; i++) ctx.fillRect(x + 1, y + 4 + i * 2.2, w - 2, 0.8);
  ctx.strokeStyle = '#6D4C41';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 3, w / 2 - 1, Math.PI, 0);
  ctx.stroke();
};
/** smoked pork on a skewer */
const pork: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#8D6E63';
  ctx.fillRect(x, y + h / 2, w, 1);
  ctx.fillStyle = '#6D2E1F';
  ctx.fillRect(x + 1, y + 2, 4, h - 4);
  ctx.fillRect(x + 7, y + 1, 4, h - 3);
  ctx.fillStyle = '#F4C7A1';
  ctx.fillRect(x + 1, y + 2, 4, 1.5);
  ctx.fillRect(x + 7, y + 1, 4, 1.5);
};
/** a Dzükou lily */
const lily: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#4F7F4A';
  ctx.fillRect(x + w / 2 - 0.5, y + 4, 1, h - 4);
  ctx.fillStyle = '#F8F6F0';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(x + w / 2 + Math.cos(a) * 3, y + 4 + Math.sin(a) * 3, 2.2, 1.4, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#E0B04A';
  ctx.fillRect(x + w / 2 - 1, y + 3, 2, 2);
};
/** a small log drum */
const drum: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(x, y + 2, w, h - 3);
  ctx.fillStyle = '#3E2723';
  ctx.fillRect(x + 2, y + 4, w - 4, 2);
  ctx.fillStyle = '#8D6E63';
  ctx.fillRect(x, y + 2, w, 1);
};
/** a hornbill feather: black with a white band */
const feather: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#1B1B1B';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2, w / 2 - 1, h / 2, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#F2EFE4';
  ctx.fillRect(x + 2, y + h / 2 - 1, w - 4, 2);
};

const sz: [number, number] = [12, 10];
export const things: Record<KohThingKind, { size: [number, number]; draw: ThingDraw }> = {
  'koh-galho': { size: sz, draw: galho },
  'koh-axone': { size: sz, draw: axone },
  'koh-bamboo-shoot': { size: sz, draw: shoot },
  'koh-chutney': { size: sz, draw: chutney },
  'koh-shawl': { size: sz, draw: shawl },
  'koh-basket': { size: sz, draw: basket },
  'koh-smoked-pork': { size: sz, draw: pork },
  'koh-lily': { size: sz, draw: lily },
  'koh-drum': { size: sz, draw: drum },
  'koh-hornbill-feather': { size: sz, draw: feather },
};
