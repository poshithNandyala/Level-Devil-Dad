// Patna's hidden items, one food or object from the city bible per kind (drawn small, 12x10 box).
import type { ThingDraw } from '../../../render/art/things';

declare module '../../../render/art/things' {
  interface ModuleThingKinds {
    'pat-litti': true;
    'pat-chokha': true;
    'pat-sikki': true;
    'pat-khaja': true;
    'pat-makhana': true;
    'pat-thekua': true;
    'pat-kulhad': true;
    'pat-pittu': true;
    'pat-sattu': true;
  }
}

const disc = (ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, fill: string) => {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
};

/** a round wheat ball scorched at the edges, with a dab of ghee */
const litti: ThingDraw = (ctx, x, y, w, h) => {
  const cx = x + w / 2,
    cy = y + h / 2 + 0.5;
  disc(ctx, cx, cy + 1, 5.6, 4, '#5E3A1E');
  disc(ctx, cx, cy, 5, 3.8, '#C98A3E');
  disc(ctx, cx - 1, cy - 1, 2.6, 1.6, '#E3B261');
  ctx.fillStyle = '#4A2A14';
  ctx.fillRect(cx + 1, cy - 2, 1.2, 1.2);
  ctx.fillRect(cx - 3, cy + 0.5, 1.2, 1.2);
  ctx.fillStyle = '#FFE08A';
  ctx.fillRect(cx - 0.5, cy - 3.4, 2, 1);
};

/** a steel bowl of mashed brinjal and potato with a green chilli */
const chokha: ThingDraw = (ctx, x, y, w, h) => {
  const cx = x + w / 2,
    cy = y + h / 2;
  ctx.fillStyle = '#9AA0A6';
  ctx.beginPath();
  ctx.moveTo(cx - 5.5, cy - 1);
  ctx.lineTo(cx + 5.5, cy - 1);
  ctx.lineTo(cx + 3.5, cy + 4);
  ctx.lineTo(cx - 3.5, cy + 4);
  ctx.fill();
  disc(ctx, cx, cy - 1.2, 5, 2.4, '#6E5A3A');
  disc(ctx, cx - 1, cy - 2, 2.2, 1, '#A38A58');
  ctx.fillStyle = '#E04B2B';
  ctx.fillRect(cx + 1.5, cy - 3.4, 2.4, 1.1);
  ctx.fillStyle = '#4C8F2F';
  ctx.fillRect(cx - 3.8, cy - 3.2, 2.6, 1);
};

/** a golden sikki-grass box with a coiled lid */
const sikki: ThingDraw = (ctx, x, y, w, h) => {
  const cx = x + w / 2,
    cy = y + h / 2;
  ctx.fillStyle = '#C99A1E';
  ctx.fillRect(cx - 4.5, cy - 1, 9, 5);
  ctx.fillStyle = '#F2B705';
  ctx.fillRect(cx - 5, cy - 3, 10, 2.4);
  ctx.strokeStyle = '#9A6F10';
  ctx.lineWidth = 0.7;
  for (let i = -3; i <= 3; i += 2) {
    ctx.beginPath();
    ctx.moveTo(cx + i, cy - 1);
    ctx.lineTo(cx + i, cy + 4);
    ctx.stroke();
  }
  ctx.fillStyle = '#D7262E';
  ctx.fillRect(cx - 1, cy - 4.2, 2, 1.4);
};

/** flaky layered khaja: a stack of thin gold layers */
const khaja: ThingDraw = (ctx, x, y, w, h) => {
  const cx = x + w / 2,
    cy = y + h / 2;
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i % 2 ? '#E7B65A' : '#F3CE82';
    ctx.fillRect(cx - 5 + (i % 2), cy + 3 - i * 2.1, 10 - (i % 2) * 1.5, 2);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillRect(cx - 3, cy - 4.8, 3, 0.8);
};

/** puffed white fox nuts in a little heap */
const makhana: ThingDraw = (ctx, x, y, w, h) => {
  const cx = x + w / 2,
    cy = y + h / 2;
  for (const [dx, dy, r] of [[-3, 2, 2.4], [0, 2.4, 2.6], [3, 2, 2.4], [-1.5, -0.4, 2.3], [1.8, -0.2, 2.3], [0, -2.6, 2.2]] as [number, number, number][]) {
    disc(ctx, cx + dx, cy + dy, r, r * 0.9, '#FBF3E0');
    disc(ctx, cx + dx - 0.5, cy + dy - 0.5, r * 0.4, r * 0.3, '#fff');
  }
};

/** a thekua pressed in its mould: a brown oval with a carved wheel */
const thekua: ThingDraw = (ctx, x, y, w, h) => {
  const cx = x + w / 2,
    cy = y + h / 2 + 0.5;
  disc(ctx, cx, cy, 5.6, 3.9, '#7A431E');
  disc(ctx, cx, cy - 0.4, 5, 3.4, '#A8622D');
  ctx.strokeStyle = '#6A3716';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.arc(cx, cy - 0.4, 2, 0, Math.PI * 2);
  ctx.moveTo(cx - 4, cy - 0.4);
  ctx.lineTo(cx + 4, cy - 0.4);
  ctx.stroke();
};

/** a clay kulhad of tea, steaming */
const kulhad: ThingDraw = (ctx, x, y, w, h) => {
  const cx = x + w / 2,
    cy = y + h / 2;
  ctx.fillStyle = '#B5603A';
  ctx.beginPath();
  ctx.moveTo(cx - 4, cy - 2);
  ctx.lineTo(cx + 4, cy - 2);
  ctx.lineTo(cx + 2.6, cy + 4.5);
  ctx.lineTo(cx - 2.6, cy + 4.5);
  ctx.fill();
  disc(ctx, cx, cy - 2, 4, 1.2, '#C98A52');
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(cx - 1, cy - 3.5);
  ctx.quadraticCurveTo(cx - 3, cy - 5, cx - 1, cy - 6.5);
  ctx.moveTo(cx + 1.5, cy - 3.5);
  ctx.quadraticCurveTo(cx - 0.5, cy - 5, cx + 1.5, cy - 6.5);
  ctx.stroke();
};

/** seven flat stones stacked, the game of pittu */
const pittu: ThingDraw = (ctx, x, y, w, h) => {
  const cx = x + w / 2,
    cy = y + h / 2;
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = i % 2 ? '#8E8878' : '#A9A18C';
    const ww = 9 - i * 0.9;
    ctx.fillRect(cx - ww / 2, cy + 4.2 - i * 1.5, ww, 1.4);
  }
};

/** a tall glass of sattu sharbat with a lemon wedge */
const sattu: ThingDraw = (ctx, x, y, w, h) => {
  const cx = x + w / 2,
    cy = y + h / 2;
  ctx.fillStyle = 'rgba(210,235,245,0.85)';
  ctx.beginPath();
  ctx.moveTo(cx - 3.4, cy - 4);
  ctx.lineTo(cx + 3.4, cy - 4);
  ctx.lineTo(cx + 2.4, cy + 4.5);
  ctx.lineTo(cx - 2.4, cy + 4.5);
  ctx.fill();
  ctx.fillStyle = '#C9A56B';
  ctx.fillRect(cx - 3, cy - 2.4, 6, 5.6);
  ctx.fillStyle = '#F2D43D';
  ctx.beginPath();
  ctx.arc(cx + 3.2, cy - 4, 1.8, Math.PI, 0);
  ctx.fill();
};

const size = [12, 10] as [number, number];
export const things = {
  'pat-litti': { size, draw: litti },
  'pat-chokha': { size, draw: chokha },
  'pat-sikki': { size, draw: sikki },
  'pat-khaja': { size, draw: khaja },
  'pat-makhana': { size, draw: makhana },
  'pat-thekua': { size, draw: thekua },
  'pat-kulhad': { size, draw: kulhad },
  'pat-pittu': { size, draw: pittu },
  'pat-sattu': { size, draw: sattu },
};
