// Sri Vijaya Puram's hidden items: the islands' food and wood. Each is a flat little picture, 12 x 10.
import type { ThingDraw } from '../../../render/art/things';

declare module '../../../render/art/things' {
  interface ModuleThingKinds {
    'svp-machhli': true;
    'svp-fishstick': true;
    'svp-kela': true;
    'svp-lobster': true;
    'svp-padauk': true;
  }
}

const TAU = Math.PI * 2;

/** machhli-bhaat: fish curry and rice on a banana leaf */
const machhli: ThingDraw = (ctx, x, y, w, h) => {
  const cx = x + w / 2,
    cy = y + h / 2 + 1;
  ctx.fillStyle = '#3F8F3A';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 1, w / 2, h / 2 - 1, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#FFF8EC';
  ctx.beginPath();
  ctx.ellipse(cx - 2, cy - 0.5, 3.6, 2.6, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#D9822B';
  ctx.beginPath();
  ctx.ellipse(cx + 2.4, cy + 0.6, 3.2, 2, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#7A3E1D';
  ctx.beginPath();
  ctx.moveTo(cx + 0.5, cy + 0.6);
  ctx.lineTo(cx + 3, cy - 0.3);
  ctx.lineTo(cx + 5.2, cy + 0.6);
  ctx.lineTo(cx + 3, cy + 1.6);
  ctx.fill();
};

/** grilled fish on a stick */
const fishstick: ThingDraw = (ctx, x, y, w, h) => {
  const cx = x + w / 2,
    cy = y + h / 2;
  ctx.strokeStyle = '#8D6B45';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x + 0.5, y + h - 1);
  ctx.lineTo(x + w - 0.5, y + 1);
  ctx.stroke();
  ctx.fillStyle = '#C9863A';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 4.8, 2.4, -0.45, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#7A4A1A';
  ctx.fillRect(cx - 2.5, cy - 1.2, 1, 1);
  ctx.fillRect(cx + 0.5, cy - 2, 1, 1.4);
  ctx.fillStyle = '#C9863A';
  ctx.beginPath();
  ctx.moveTo(cx - 4, cy + 1.4);
  ctx.lineTo(cx - 6, cy + 3.2);
  ctx.lineTo(cx - 6, cy - 0.4);
  ctx.fill();
};

/** banana fritter: a golden crescent */
const kela: ThingDraw = (ctx, x, y, w, h) => {
  const cx = x + w / 2,
    cy = y + h / 2;
  ctx.fillStyle = '#E3A93A';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 5.2, 3, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#C07A1B';
  ctx.beginPath();
  ctx.ellipse(cx + 1, cy + 1, 4, 1.6, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#F3D27A';
  ctx.fillRect(cx - 3, cy - 2, 3, 1);
};

/** a grilled lobster from the beach stall */
const lobster: ThingDraw = (ctx, x, y, w, h) => {
  const cx = x + w / 2,
    cy = y + h / 2;
  ctx.fillStyle = '#D8442B';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 4.6, 2.2, 0, 0, TAU);
  ctx.fill();
  ctx.fillRect(cx - 7, cy - 1, 3, 2);
  ctx.beginPath();
  ctx.arc(cx + 5.2, cy - 2.2, 1.7, 0, TAU);
  ctx.arc(cx + 5.2, cy + 2.2, 1.7, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#8A2415';
  ctx.lineWidth = 0.8;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(cx + i * 1.5, cy - 2.2);
    ctx.lineTo(cx + i * 1.5, cy + 2.2);
    ctx.stroke();
  }
};

/** a little padauk bowl, the red wood of the islands */
const padauk: ThingDraw = (ctx, x, y, w, h) => {
  const cx = x + w / 2,
    cy = y + h / 2 + 1;
  ctx.fillStyle = '#8E2F1E';
  ctx.beginPath();
  ctx.moveTo(cx - 5.5, cy - 2);
  ctx.lineTo(cx + 5.5, cy - 2);
  ctx.quadraticCurveTo(cx + 4.5, cy + 4, cx, cy + 4);
  ctx.quadraticCurveTo(cx - 4.5, cy + 4, cx - 5.5, cy - 2);
  ctx.fill();
  ctx.fillStyle = '#C45A36';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 2, 5.5, 1.5, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,200,160,0.5)';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(cx - 3, cy);
  ctx.quadraticCurveTo(cx, cy + 1.5, cx + 3, cy);
  ctx.stroke();
};

const sz = [12, 10] as [number, number];
export const things = {
  'svp-machhli': { size: sz, draw: machhli },
  'svp-fishstick': { size: sz, draw: fishstick },
  'svp-kela': { size: sz, draw: kela },
  'svp-lobster': { size: sz, draw: lobster },
  'svp-padauk': { size: sz, draw: padauk },
};
