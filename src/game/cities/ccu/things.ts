// Kolkata's hidden items (foods and things from the bible) and the tour's tram car.
import type { ThingDraw } from '../../../render/art/things';

declare module '../../../render/art/things' {
  interface ModuleThingKinds {
    'ccu-doi': true;
    'ccu-jhalmuri': true;
    'ccu-roll': true;
    'ccu-sandesh': true;
    'ccu-bhanr': true;
    'ccu-tram': true;
    'ccu-thela': true;
  }
}

/** mishti doi set in a clay bhanr, its top browned */
const doi: ThingDraw = (ctx, x, y, w, h) => {
  const cx = x + w / 2;
  ctx.fillStyle = '#A0522D';
  ctx.beginPath();
  ctx.moveTo(x + 1, y + 3);
  ctx.lineTo(x + w - 1, y + 3);
  ctx.lineTo(x + w - 3, y + h);
  ctx.lineTo(x + 3, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#7A3A1C';
  ctx.fillRect(x + 3, y + h - 3, w - 6, 1);
  ctx.fillStyle = '#E9C48A';
  ctx.beginPath();
  ctx.ellipse(cx, y + 3, w / 2 - 1, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#C98A4B';
  ctx.beginPath();
  ctx.ellipse(cx, y + 3, w / 2 - 3, 1.1, 0, 0, Math.PI * 2);
  ctx.fill();
};
/** jhalmuri in a twist of newspaper */
const jhalmuri: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#E8E2D0';
  ctx.beginPath();
  ctx.moveTo(x + 1, y + 2);
  ctx.lineTo(x + w - 1, y + 2);
  ctx.lineTo(x + w / 2, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#9E9A8C';
  ctx.fillRect(x + 3, y + 4, w - 6, 0.8);
  ctx.fillRect(x + 4, y + 6, w - 8, 0.8);
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 3 === 0 ? '#C0392B' : i % 3 === 1 ? '#F5DEB3' : '#6B8E23';
    ctx.beginPath();
    ctx.arc(x + 2.5 + i * 1.4, y + 2 - (i % 2), 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
};
/** a kathi roll in its paper */
const roll: ThingDraw = (ctx, x, y, w, h) => {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(-0.35);
  ctx.fillStyle = '#D9A55B';
  ctx.fillRect(-w / 2 + 1, -2.5, w - 2, 5);
  ctx.fillStyle = '#F4F1E8';
  ctx.fillRect(w / 2 - 6, -3, 5, 6);
  ctx.fillStyle = '#7CB342';
  ctx.fillRect(-w / 2 + 1, -2.5, 1.5, 5);
  ctx.fillStyle = '#B5562B';
  ctx.fillRect(-w / 2 + 2.5, -1.5, 1.2, 3);
  ctx.restore();
};
/** sandesh pressed in a carved mould: a pale shell shape */
const sandesh: ThingDraw = (ctx, x, y, w, h) => {
  const cx = x + w / 2,
    cy = y + h / 2 + 1;
  ctx.fillStyle = '#F3E6C4';
  ctx.beginPath();
  ctx.arc(cx, cy, w / 2 - 1, Math.PI, 0);
  ctx.lineTo(cx + w / 2 - 1, cy + 2.5);
  ctx.lineTo(cx - w / 2 + 1, cy + 2.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#C9A86A';
  ctx.lineWidth = 0.7;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + 2);
    ctx.lineTo(cx + i * 2, cy - 3.5);
    ctx.stroke();
  }
};
/** an empty clay tea cup, a bhanr */
const bhanr: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#B5562B';
  ctx.beginPath();
  ctx.moveTo(x + 2, y + 1);
  ctx.lineTo(x + w - 2, y + 1);
  ctx.lineTo(x + w - 4, y + h);
  ctx.lineTo(x + 4, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5A2A12';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + 1.5, w / 2 - 2, 1.4, 0, 0, Math.PI * 2);
  ctx.fill();
};
/** the little blue-and-white tram that shuttles at Esplanade */
const tram: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#F4F1E8';
  ctx.fillRect(x, y - 14, w, h + 14);
  ctx.fillStyle = '#1D5C96';
  ctx.fillRect(x, y - 2, w, h + 2);
  ctx.fillRect(x, y - 16, w, 3);
  ctx.fillStyle = '#9FC3DC';
  for (let i = 0; i < 4; i++) ctx.fillRect(x + 3 + i * ((w - 6) / 4), y - 11, (w - 6) / 4 - 2, 6);
  ctx.strokeStyle = '#2B2320';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.7, y - 16);
  ctx.lineTo(x + w * 0.4, y - 34);
  ctx.stroke();
};

/** a low wooden hand-cart, a thela, parked with two baskets of oranges on it */
const thela: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#8B5A2B';
  ctx.fillRect(x, y + 2, w, 4);
  ctx.fillStyle = '#6B4220';
  ctx.fillRect(x - 6, y + 3, 7, 1.6);
  for (const bx of [x + 4, x + w / 2 - 2, x + w - 14].slice(w > 40 ? 0 : 1)) {
    ctx.fillStyle = '#C9A66B';
    ctx.fillRect(bx, y - 1, 10, 3);
    ctx.fillStyle = '#F39C12';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(bx + 2 + i * 3, y - 1, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = '#2B2320';
  for (const wx of [x + 6, x + w - 6]) {
    ctx.beginPath();
    ctx.arc(wx, y + h - 3, 3, 0, Math.PI * 2);
    ctx.fill();
  }
};

const sz = [12, 10] as [number, number];
export const things = {
  'ccu-doi': { size: sz, draw: doi },
  'ccu-jhalmuri': { size: sz, draw: jhalmuri },
  'ccu-roll': { size: sz, draw: roll },
  'ccu-sandesh': { size: sz, draw: sandesh },
  'ccu-bhanr': { size: sz, draw: bhanr },
  'ccu-tram': { size: [48, 10] as [number, number], draw: tram },
  'ccu-thela': { size: [44, 12] as [number, number], draw: thela },
};
