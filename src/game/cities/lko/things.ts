// Lucknow's hidden items: makhan malai in its kulhad, a sheermal, a galouti kebab on a paratha, a matka
// kulfi, a folded chikan kurta and a string of ghungroo. Kinds start with 'lko-'.
import type { ThingDraw } from '../../../render/art/things';

declare module '../../../render/art/things' {
  interface ModuleThingKinds {
    'lko-malai': true;
    'lko-sheermal': true;
    'lko-galouti': true;
    'lko-kulfi': true;
    'lko-chikan': true;
    'lko-ghungroo': true;
  }
}

const TAU = Math.PI * 2;

/** makhan malai: a cloud of saffron-flecked milk foam heaped on a clay kulhad */
const malai: ThingDraw = (ctx, x, y, w, h) => {
  const cx = x + w / 2;
  ctx.fillStyle = '#A0522D';
  ctx.beginPath();
  ctx.moveTo(cx - 4.5, y + h * 0.45);
  ctx.lineTo(cx + 4.5, y + h * 0.45);
  ctx.lineTo(cx + 3.2, y + h);
  ctx.lineTo(cx - 3.2, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#FFFBEF';
  for (const [dx, dy, r] of [
    [-3, 4, 3],
    [0, 2.5, 3.4],
    [3, 4, 3],
  ])
    ctx.beginPath(), ctx.arc(cx + dx, y + dy + 1, r, 0, TAU), ctx.fill();
  ctx.fillStyle = '#E8A33D';
  ctx.fillRect(cx - 1.5, y + 2, 1, 1);
  ctx.fillRect(cx + 1.5, y + 3.5, 1, 1);
  ctx.fillStyle = '#7CB342';
  ctx.fillRect(cx - 0.5, y + 1, 1.2, 1);
};

/** sheermal: a round saffron flatbread, glazed, with its docking holes */
const sheermal: ThingDraw = (ctx, x, y, w, h) => {
  const cx = x + w / 2,
    cy = y + h / 2;
  ctx.fillStyle = '#C97B22';
  ctx.beginPath();
  ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#E8A33D';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 0.5, w / 2 - 1.5, h / 2 - 1.5, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#8A4A1E';
  for (const [dx, dy] of [
    [-2, -1],
    [1, -2],
    [2, 1],
    [-1, 2],
    [0, 0],
  ])
    ctx.fillRect(cx + dx, cy + dy, 1, 1);
};

/** a galouti kebab, dark and soft, on a little paratha with a ring of onion */
const galouti: ThingDraw = (ctx, x, y, w, h) => {
  const cx = x + w / 2;
  ctx.fillStyle = '#E2C08D';
  ctx.beginPath();
  ctx.ellipse(cx, y + h - 3, w / 2, 3, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#6B3A1E';
  ctx.beginPath();
  ctx.ellipse(cx, y + h - 5.5, 4.5, 3, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#8D5A3B';
  ctx.fillRect(cx - 2.5, y + h - 7.5, 3, 1);
  ctx.strokeStyle = '#D987A8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx + 3, y + h - 8, 1.8, 0, TAU);
  ctx.stroke();
};

/** matka kulfi: a little clay pot, the kulfi showing at the top, a pistachio fleck */
const kulfi: ThingDraw = (ctx, x, y, w, h) => {
  const cx = x + w / 2;
  ctx.fillStyle = '#B5562E';
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.62, w / 2 - 0.5, h * 0.38, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#8E3F1E';
  ctx.fillRect(cx - 3.5, y + h * 0.25, 7, 1.5);
  ctx.fillStyle = '#FFF3D6';
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.27, 3.2, 1.6, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#7CB342';
  ctx.fillRect(cx - 0.5, y + h * 0.22, 1.2, 1);
};

/** a folded white chikan kurta with its little flowers */
const chikan: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#F7F4EC';
  ctx.fillRect(x + 1, y + 2, w - 2, h - 3);
  ctx.strokeStyle = '#C9C0AE';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(x + 1.5, y + 2.5, w - 3, h - 4);
  ctx.fillStyle = '#B8B0A0';
  for (const [dx, dy] of [
    [3, 4],
    [6, 6],
    [9, 4],
    [5, 8],
  ])
    ctx.beginPath(), ctx.arc(x + dx, y + dy, 0.9, 0, TAU), ctx.fill();
};

/** ghungroo: a string of little brass-coloured ankle bells on a red pad */
const ghungroo: ThingDraw = (ctx, x, y, w, h) => {
  ctx.fillStyle = '#B71C1C';
  ctx.fillRect(x + 1, y + h / 2 - 2, w - 2, 4);
  ctx.fillStyle = '#E8C547';
  for (let k = 0; k < 4; k++) {
    ctx.beginPath();
    ctx.arc(x + 2.5 + k * ((w - 5) / 3), y + h / 2 + 2.5, 1.7, 0, TAU);
    ctx.fill();
  }
};

export const things = {
  'lko-malai': { size: [12, 11] as [number, number], draw: malai },
  'lko-sheermal': { size: [12, 9] as [number, number], draw: sheermal },
  'lko-galouti': { size: [12, 10] as [number, number], draw: galouti },
  'lko-kulfi': { size: [10, 11] as [number, number], draw: kulfi },
  'lko-chikan': { size: [12, 10] as [number, number], draw: chikan },
  'lko-ghungroo': { size: [12, 9] as [number, number], draw: ghungroo },
};
