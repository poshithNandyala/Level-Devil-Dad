import type { Theme } from '../../../render/theme';
import { Ctx, withAlpha } from '../../../render/art/common';

const TAU = Math.PI * 2;
const CELL = 520;

/** a far cone of a volcano with a thread of smoke (Barren Island, on the horizon) */
function cone(ctx: Ctx, x: number, th: Theme) {
  ctx.fillStyle = withAlpha(th.far, 0.55);
  ctx.beginPath();
  ctx.moveTo(x - 60, 168);
  ctx.lineTo(x - 7, 118);
  ctx.lineTo(x + 7, 118);
  ctx.lineTo(x + 60, 168);
  ctx.fill();
  ctx.fillStyle = withAlpha('#FFFFFF', 0.4);
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.ellipse(x + 3 + i * 3, 110 - i * 9, 6 + i * 2, 4 + i, 0, 0, TAU);
    ctx.fill();
  }
}

/** the Cellular Jail seen from far across the harbour: a long red-brick block with its tall central tower, in silhouette, nothing more */
function jail(ctx: Ctx, x: number) {
  ctx.fillStyle = 'rgba(122,56,40,0.62)';
  ctx.fillRect(x - 54, 176, 108, 14);
  ctx.fillRect(x - 6, 150, 12, 40);
  ctx.beginPath();
  ctx.moveTo(x - 8, 150);
  ctx.lineTo(x, 142);
  ctx.lineTo(x + 8, 150);
  ctx.fill();
  ctx.fillRect(x - 40, 168, 18, 10);
  ctx.fillRect(x + 22, 168, 18, 10);
  ctx.fillStyle = 'rgba(60,20,12,0.4)';
  for (let i = -4; i <= 4; i++) ctx.fillRect(x + i * 11 - 1, 180, 2, 5);
}

/** Ross Island: roofless brick shells with roots poured over their walls */
function ross(ctx: Ctx, x: number) {
  const wall = (cx: number, w: number, h: number) => {
    ctx.fillStyle = '#9A4A34';
    ctx.fillRect(cx, 200 - h, w, h);
    ctx.fillStyle = '#7EB0B8';
    ctx.beginPath();
    ctx.arc(cx + w / 2, 200 - h + 10, 5, Math.PI, TAU);
    ctx.rect(cx + w / 2 - 5, 200 - h + 10, 10, 9);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(cx, 200 - h, 3, h);
    ctx.strokeStyle = '#4A3A28';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + 3, 200 - h - 2);
    ctx.bezierCurveTo(cx - 4, 200 - h / 2, cx + 6, 200 - h / 3, cx - 2, 202);
    ctx.moveTo(cx + w - 4, 200 - h - 1);
    ctx.bezierCurveTo(cx + w + 4, 200 - h / 2, cx + w - 6, 200 - h / 3, cx + w + 2, 202);
    ctx.stroke();
    ctx.strokeStyle = '#2E6F40';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 2, 200 - h + 1);
    ctx.lineTo(cx + w + 2, 200 - h + 1);
    ctx.stroke();
  };
  wall(x - 38, 30, 34);
  wall(x + 6, 24, 46);
  wall(x + 36, 20, 26);
}

/** Chatham saw mill: a long shed with a tin roof, a chimney and a stack of logs */
function mill(ctx: Ctx, x: number) {
  ctx.fillStyle = '#C9B48A';
  ctx.fillRect(x - 46, 176, 92, 24);
  ctx.fillStyle = '#7C8A92';
  ctx.beginPath();
  ctx.moveTo(x - 52, 177);
  ctx.lineTo(x - 30, 160);
  ctx.lineTo(x + 30, 160);
  ctx.lineTo(x + 52, 177);
  ctx.fill();
  ctx.fillStyle = '#5E4A3C';
  ctx.fillRect(x + 34, 134, 7, 30);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(x + 40, 128, 5, 3, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  for (let i = 0; i < 3; i++) ctx.fillRect(x - 36 + i * 22, 184, 14, 16);
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 4 - r; c++) {
      ctx.fillStyle = r % 2 ? '#8E2F1E' : '#A8442E';
      ctx.beginPath();
      ctx.arc(x - 78 + c * 9 + r * 4.5, 196 - r * 8, 4.5, 0, TAU);
      ctx.fill();
    }
}

/** the jetty: pier on stilts, a crane and a ship at the end */
function jetty(ctx: Ctx, x: number) {
  ctx.fillStyle = '#6B5A48';
  ctx.fillRect(x - 70, 196, 140, 4);
  for (let i = -7; i <= 7; i++) ctx.fillRect(x + i * 9, 200, 2, 12);
  ctx.fillStyle = '#F2F2EA';
  ctx.beginPath();
  ctx.moveTo(x + 6, 196);
  ctx.lineTo(x + 70, 196);
  ctx.lineTo(x + 62, 207);
  ctx.lineTo(x + 14, 207);
  ctx.fill();
  ctx.fillStyle = '#1F7A8C';
  ctx.fillRect(x + 8, 203, 60, 3);
  ctx.fillStyle = '#E7E2D0';
  ctx.fillRect(x + 24, 184, 30, 12);
  ctx.fillStyle = '#7EB0B8';
  for (let i = 0; i < 5; i++) ctx.fillRect(x + 27 + i * 5.5, 187, 3, 3);
  ctx.fillStyle = '#C0392B';
  ctx.fillRect(x + 36, 174, 7, 10);
  ctx.strokeStyle = '#555E64';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 40, 196);
  ctx.lineTo(x - 40, 160);
  ctx.lineTo(x - 8, 160);
  ctx.moveTo(x - 40, 160);
  ctx.lineTo(x - 52, 168);
  ctx.moveTo(x - 12, 160);
  ctx.lineTo(x - 12, 178);
  ctx.stroke();
}

/** Corbyn's Cove: palms leaning over a curve of beach */
function cove(ctx: Ctx, x: number, th: Theme) {
  ctx.fillStyle = '#EFE3BC';
  ctx.beginPath();
  ctx.moveTo(x - 90, 204);
  ctx.quadraticCurveTo(x, 188, x + 90, 204);
  ctx.lineTo(x + 90, 212);
  ctx.lineTo(x - 90, 212);
  ctx.fill();
  for (let i = 0; i < 5; i++) {
    const px = x - 60 + i * 28,
      top = 150 + ((i * 17) % 13);
    ctx.strokeStyle = '#5C4B3B';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(px, 198);
    ctx.quadraticCurveTo(px + (i % 2 ? 6 : -6), 176, px + (i % 2 ? 10 : -4), top);
    ctx.stroke();
    ctx.fillStyle = th.mid;
    const tx = px + (i % 2 ? 10 : -4);
    for (const a of [-2.6, -1.9, -1.2, -0.5, 0.3, 1]) {
      ctx.beginPath();
      ctx.ellipse(tx + Math.cos(a) * 8, top + Math.sin(a) * 4 + 2, 9, 2.4, a * 0.5, 0, TAU);
      ctx.fill();
    }
  }
}

/**
 * Sri Vijaya Puram: a harbour town on green hills. Behind the road a sea strip, the far cone of Barren Island,
 * and, cell by cell, the places people know: the jail in the haze, Ross Island's roots over brick, the Chatham
 * mill, the jetty and its ship, Corbyn's Cove. Houses on stilts with tin roofs along the near hill.
 */
export function backdrop(ctx: Ctx, th: Theme, x0: number, x1: number) {
  ctx.fillStyle = withAlpha('#2B87A8', 0.55);
  ctx.fillRect(x0 - 8, 168, x1 - x0 + 16, 80);
  ctx.fillStyle = withAlpha('#FFFFFF', 0.28);
  for (let x = x0 - 8; x < x1 + 8; x += 26) ctx.fillRect(x + ((x * 7) % 11), 174 + ((x * 3) % 38), 10, 1.2);

  ctx.fillStyle = th.far;
  ctx.beginPath();
  ctx.moveTo(x0 - 8, 190);
  for (let x = x0 - 8; x <= x1 + 8; x += 14) ctx.lineTo(x, 150 + 14 * Math.sin(x * 0.011) * Math.sin(x * 0.0043 + 1) + 8 * Math.sin(x * 0.04));
  ctx.lineTo(x1 + 8, 190);
  ctx.fill();

  const i0 = Math.floor((x0 - 120) / CELL),
    i1 = Math.floor((x1 + 120) / CELL);
  for (let i = i0; i <= i1; i++) {
    const cx = i * CELL + CELL / 2;
    const k = ((i % 5) + 5) % 5;
    if (i % 3 === 0) cone(ctx, cx + 150, th);
    if (k === 0) jail(ctx, cx - 40);
    else if (k === 1) ross(ctx, cx);
    else if (k === 2) mill(ctx, cx);
    else if (k === 3) jetty(ctx, cx);
    else cove(ctx, cx, th);
  }

  ctx.fillStyle = th.mid;
  ctx.fillRect(x0 - 8, 206, x1 - x0 + 16, 40);
  for (let x = x0 - 20; x <= x1 + 20; x += 31) {
    const k = Math.round(x / 31);
    ctx.fillStyle = k % 2 ? th.mid : th.near;
    ctx.beginPath();
    ctx.arc(x, 210 - ((k * 11) % 9), 13 + ((k * 7) % 6), Math.PI, TAU);
    ctx.fill();
  }
  ctx.fillStyle = th.near;
  ctx.fillRect(x0 - 8, 218, x1 - x0 + 16, 40);
  for (let i = 0; i < Math.ceil((x1 - x0) / 96) + 1; i++) {
    const hx = x0 + 20 + i * 96 + ((i * 29) % 23);
    const hw = 22 + ((i * 13) % 10);
    ctx.fillStyle = '#6B4A34';
    ctx.fillRect(hx + 2, 226, 2, 10);
    ctx.fillRect(hx + hw - 4, 226, 2, 10);
    ctx.fillStyle = ['#F3E9CF', '#CFE6E8', '#E9C9A8'][i % 3];
    ctx.fillRect(hx, 214, hw, 12);
    ctx.fillStyle = i % 2 ? '#B0563A' : '#7C8A92';
    ctx.beginPath();
    ctx.moveTo(hx - 3, 214);
    ctx.lineTo(hx + hw / 2, 206);
    ctx.lineTo(hx + hw + 3, 214);
    ctx.fill();
    ctx.fillStyle = withAlpha(th.ink, 0.4);
    ctx.fillRect(hx + hw / 2 - 2, 218, 4, 8);
  }
}
