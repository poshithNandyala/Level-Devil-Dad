// Gangtok's hidden items: Sikkimese food from the bible (momo first, sel roti, churpi, thukpa). Kinds start with 'gtk-'.
import type { ThingDraw } from '../../../render/art/things';

declare module '../../../render/art/things' {
  interface ModuleThingKinds {
    'gtk-momo': true;
    'gtk-selroti': true;
    'gtk-churpi': true;
    'gtk-thukpa': true;
  }
}

const momo: ThingDraw = (ctx, x, y, w, h) => {
  // three pleated momo on a small steamer tray, with a dab of red chutney
  ctx.fillStyle = '#7A5A3A';
  ctx.fillRect(x, y + h - 3, w, 3);
  for (const [dx, dy] of [
    [3, 5],
    [9, 5],
    [6, 2],
  ]) {
    ctx.fillStyle = '#F6F1E4';
    ctx.beginPath();
    ctx.ellipse(x + dx, y + dy + 1.5, 3, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#D8CDB4';
    ctx.fillRect(x + dx - 0.5, y + dy - 1, 1, 2);
  }
  ctx.fillStyle = '#C62828';
  ctx.beginPath();
  ctx.arc(x + w - 1.5, y + h - 4, 1.4, 0, Math.PI * 2);
  ctx.fill();
};

const selroti: ThingDraw = (ctx, x, y, w, h) => {
  // a ring of sel roti, golden brown, the hole in the middle
  const cx = x + w / 2,
    cy = y + h / 2;
  ctx.strokeStyle = '#B86B25';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(cx, cy, w / 2 - 1.6, h / 2 - 1.6, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#E3A04A';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 0.6, w / 2 - 1.8, h / 2 - 2, 0, Math.PI, Math.PI * 2);
  ctx.stroke();
};

const churpi: ThingDraw = (ctx, x, y, w, h) => {
  // hard yak-milk cheese: small grey-white cubes on a string
  ctx.strokeStyle = '#6D5A44';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(x, y + 2);
  ctx.lineTo(x + w, y + 2);
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = '#E9E4D6';
    ctx.fillRect(x + 1 + i * 4, y + 3, 3, h - 4);
    ctx.fillStyle = '#B8B09C';
    ctx.fillRect(x + 1 + i * 4, y + h - 2, 3, 1);
  }
};

const thukpa: ThingDraw = (ctx, x, y, w, h) => {
  // a bowl of thukpa: noodles, greens, steam
  ctx.fillStyle = '#E07A5F';
  ctx.beginPath();
  ctx.moveTo(x, y + 4);
  ctx.lineTo(x + w, y + 4);
  ctx.lineTo(x + w - 2, y + h);
  ctx.lineTo(x + 2, y + h);
  ctx.fill();
  ctx.fillStyle = '#F2D38A';
  ctx.fillRect(x + 1, y + 3, w - 2, 2);
  ctx.fillStyle = '#5E8C33';
  ctx.fillRect(x + 3, y + 2.5, 2, 1.5);
  ctx.fillRect(x + 8, y + 2.5, 2, 1.5);
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(x + 4, y + 1.5);
  ctx.quadraticCurveTo(x + 5.5, y - 1, x + 4, y - 3);
  ctx.moveTo(x + 8, y + 1.5);
  ctx.quadraticCurveTo(x + 9.5, y - 1, x + 8, y - 3);
  ctx.stroke();
};

export const things = {
  'gtk-momo': { size: [12, 10] as [number, number], draw: momo },
  'gtk-selroti': { size: [12, 10] as [number, number], draw: selroti },
  'gtk-churpi': { size: [12, 10] as [number, number], draw: churpi },
  'gtk-thukpa': { size: [12, 10] as [number, number], draw: thukpa },
};
