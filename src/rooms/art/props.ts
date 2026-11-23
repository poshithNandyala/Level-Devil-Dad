// Things standing in the rooms.
import type { World } from '../../game/world';
import type { RoomProp } from '../props';
import type { Ctx } from './dad';
import { glow, vgrad } from './scene';

export function drawProp(ctx: Ctx, p: RoomProp, w: World, t: number) {
  if (p.kind === 'scale') drawScale(ctx, p, w, t);
  else if (p.kind === 'bridge') drawBridge(ctx, p);
  else if (p.kind === 'car') drawCar(ctx, p);
  else if (p.kind === 'walkway') drawWalkway(ctx, p, t);
  else if (p.kind === 'gate') drawGate(ctx, p, w);
  else if (p.kind === 'reader') drawReader(ctx, p, w, t);
}

const CAR_COLORS = ['#F2F0EA', '#C8352E', '#B8BEC6', '#2F5D8C'];

/** a boxy van parked in the jam (its roof is the solid top) */
function drawCar(ctx: Ctx, p: RoomProp) {
  const x = p.x,
    y = p.y,
    W = p.w,
    H = p.h;
  const c = CAR_COLORS[Math.floor(p.x / 16) % CAR_COLORS.length];
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(x + W / 2, y + H + 0.5, W / 2, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = vgrad(ctx, y, y + H - 4, [
    [0, c],
    [1, '#00000033'],
  ]);
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(x + 1, y + H - 4);
  ctx.lineTo(x + 1, y + 4);
  ctx.quadraticCurveTo(x + 1, y, x + 5, y);
  ctx.lineTo(x + W - 10, y);
  ctx.quadraticCurveTo(x + W - 4, y, x + W - 2, y + 10);
  ctx.lineTo(x + W - 1, y + H - 4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,16,14,0.8)';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(x + 1, y + H - 12, W - 2, 8);
  // windows
  ctx.fillStyle = '#2B3740';
  ctx.fillRect(x + 4, y + 3, 12, 9);
  ctx.fillRect(x + 18, y + 3, 12, 9);
  ctx.beginPath();
  ctx.moveTo(x + 32, y + 3);
  ctx.lineTo(x + W - 9, y + 3);
  ctx.lineTo(x + W - 5, y + 12);
  ctx.lineTo(x + 32, y + 12);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(x + 5, y + 4, 3, 7);
  // wheels
  for (const wx of [x + 9, x + W - 9]) {
    ctx.fillStyle = '#141414';
    ctx.beginPath();
    ctx.arc(wx, y + H - 3.5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8E949A';
    ctx.beginPath();
    ctx.arc(wx, y + H - 3.5, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#FFE9A8';
  ctx.fillRect(x + W - 3, y + H - 12, 2, 2.5);
  ctx.restore();
}

/** a moving walkway: steel sides, dark treads that move, a rubber handrail, the comb at its start */
function drawWalkway(ctx: Ctx, p: RoomProp, t: number) {
  const x = p.x,
    y = p.y,
    W = p.w;
  ctx.save();
  // the side panel
  ctx.fillStyle = vgrad(ctx, y, y + 16, [
    [0, '#D9DCDF'],
    [1, '#8D9399'],
  ]);
  ctx.fillRect(x, y, W, 16);
  ctx.strokeStyle = '#3A3E42';
  ctx.lineWidth = 0.9;
  ctx.strokeRect(x, y, W, 16);
  // treads (they move with the belt)
  ctx.fillStyle = '#2C2F33';
  ctx.fillRect(x, y, W, 3);
  ctx.fillStyle = '#5A5F65';
  const off = ((p.k % 6) + 6) % 6;
  for (let k = x - 6 + off; k < x + W; k += 6) if (k >= x) ctx.fillRect(k, y, 1.4, 3);
  // the comb plate at its start
  ctx.fillStyle = '#E5C340';
  ctx.beginPath();
  for (let k = 0; k < 3; k++) {
    ctx.moveTo(x + k * 1.7, y);
    ctx.lineTo(x + k * 1.7 + 0.85, y - 3.5);
    ctx.lineTo(x + k * 1.7 + 1.7, y);
  }
  ctx.fill();
  // handrail on posts
  ctx.fillStyle = '#4A4F55';
  ctx.fillRect(x + 3, y - 12, 2, 12);
  ctx.fillRect(x + W - 5, y - 12, 2, 12);
  ctx.fillStyle = '#1E1F22';
  ctx.beginPath();
  ctx.moveTo(x + 2, y - 12);
  ctx.lineTo(x + W - 2, y - 12);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#1E1F22';
  ctx.stroke();
  // the arrow light at its start: green forward, red when it's thrown into reverse
  const lit = p.on ? Math.floor(t * 8) % 2 === 0 : true;
  ctx.fillStyle = p.on ? (lit ? '#FF4B3A' : '#5A1D16') : '#4BE07A';
  ctx.beginPath();
  if (p.on) {
    ctx.moveTo(x + 5, y - 15);
    ctx.lineTo(x + 1, y - 13);
    ctx.lineTo(x + 5, y - 11);
  } else {
    ctx.moveTo(x + 1, y - 15);
    ctx.lineTo(x + 5, y - 13);
    ctx.lineTo(x + 1, y - 11);
  }
  ctx.fill();
  ctx.restore();
}

/** a fare gate: waist-high steel cabinets with flaps; a closed one is a full-height glass barrier */
function drawGate(ctx: Ctx, p: RoomProp, w: World) {
  const x = p.x,
    fl = p.y + p.h;
  ctx.save();
  const tall = p.k < 1 || p.tick >= 0;
  if (tall) {
    // the glass barrier (slides down into the floor once tapped)
    const since = p.tick >= 0 ? (w.tick - p.tick) / 18 : 0;
    const k = Math.min(1, since);
    const top = p.y + k * p.h;
    if (k < 1) {
      ctx.fillStyle = 'rgba(170,210,230,0.45)';
      ctx.fillRect(x + 3, top, 10, fl - top);
      ctx.strokeStyle = '#5B646B';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x + 3, top, 10, fl - top);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(x + 5, top + 2, 1.4, Math.max(0, fl - top - 4));
      ctx.fillStyle = '#D0312D';
      ctx.fillRect(x + 3, top + 10, 10, 2);
    }
  }
  // the cabinet
  const ch = 18;
  ctx.fillStyle = vgrad(ctx, fl - ch, fl, [
    [0, '#DCE0E3'],
    [1, '#9AA1A7'],
  ]);
  ctx.fillRect(x + 1, fl - ch, 14, ch);
  ctx.fillStyle = '#2F6FB2';
  ctx.fillRect(x + 1, fl - ch, 14, 3);
  ctx.strokeStyle = '#4C555C';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(x + 1, fl - ch, 14, ch);
  ctx.fillStyle = w.flipped ? '#FF4B3A' : '#4BE07A';
  ctx.fillRect(x + 5, fl - ch + 5, 6, 2);
  ctx.restore();
}

/** a card reader on a post: a blue box, a card mark, a light that goes green when tapped */
function drawReader(ctx: Ctx, p: RoomProp, w: World, t: number) {
  const x = p.x,
    y = p.y;
  ctx.save();
  ctx.fillStyle = '#5B646B';
  ctx.fillRect(x + 7, y - 30, 2, 30);
  ctx.fillStyle = vgrad(ctx, y, y + 16, [
    [0, '#3E7BC4'],
    [1, '#24508A'],
  ]);
  ctx.beginPath();
  ctx.moveTo(x + 1, y + 2);
  ctx.quadraticCurveTo(x + 1, y, x + 3, y);
  ctx.lineTo(x + 13, y);
  ctx.quadraticCurveTo(x + 15, y, x + 15, y + 2);
  ctx.lineTo(x + 15, y + 14);
  ctx.quadraticCurveTo(x + 15, y + 16, x + 13, y + 16);
  ctx.lineTo(x + 3, y + 16);
  ctx.quadraticCurveTo(x + 1, y + 16, x + 1, y + 14);
  ctx.fill();
  ctx.strokeStyle = '#14304F';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // the card target
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 0.7;
  ctx.strokeRect(x + 4.5, y + 5, 7, 5);
  ctx.beginPath();
  ctx.arc(x + 8, y + 7.5, 1.2, 0, Math.PI * 2);
  ctx.stroke();
  const tapped = p.on;
  const blink = !tapped && Math.floor(t * 2) % 2 === 0;
  ctx.fillStyle = tapped ? '#4BE07A' : blink ? '#FFB23A' : '#7A5620';
  ctx.fillRect(x + 6, y + 12, 4, 1.6);
  if (tapped && w.tick - p.tick < 30) glow(ctx, x + 8, y + 12, 10, 'rgba(80,230,120,0.6)');
  ctx.restore();
}

/** a footbridge over the tracks: railings along the deck, iron legs down to the platform */
function drawBridge(ctx: Ctx, p: RoomProp) {
  const y = p.y;
  ctx.save();
  // legs (behind the deck, down to the platform)
  for (const x of [p.x - 40, p.x + 70, p.x + 150]) {
    ctx.fillStyle = '#2F3E44';
    ctx.fillRect(x, y + 16, 6, 224 - y - 16);
    ctx.fillStyle = '#3E5158';
    ctx.fillRect(x, y + 16, 1.5, 224 - y - 16);
  }
  // railing on the deck
  const x0 = p.x - 200,
    x1 = p.x + p.w;
  ctx.strokeStyle = '#E6D6B4';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x0, y - 12);
  ctx.lineTo(x1 - 2, y - 12);
  ctx.stroke();
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (let x = x0; x < x1; x += 6) {
    ctx.moveTo(x, y - 12);
    ctx.lineTo(x, y);
  }
  ctx.moveTo(x0, y - 6);
  ctx.lineTo(x1 - 2, y - 6);
  ctx.stroke();
  ctx.restore();
}

/** the old red weighing machine every Indian platform has: a big dial, a coin slot, blinking bulbs */
function drawScale(ctx: Ctx, p: RoomProp, w: World, t: number) {
  const x = p.x,
    y = p.y,
    W = p.w,
    H = p.h;
  ctx.save();
  // body
  ctx.fillStyle = vgrad(ctx, y, y + H, [
    [0, '#E8463A'],
    [1, '#A8231C'],
  ]);
  ctx.beginPath();
  ctx.moveTo(x + 1, y + H);
  ctx.lineTo(x + 1, y + 6);
  ctx.quadraticCurveTo(x + 1, y + 1, x + 6, y + 1);
  ctx.lineTo(x + W - 6, y + 1);
  ctx.quadraticCurveTo(x + W - 1, y + 1, x + W - 1, y + 6);
  ctx.lineTo(x + W - 1, y + H);
  ctx.fill();
  ctx.strokeStyle = '#3A0E0A';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  // the platform he stands on (the top)
  ctx.fillStyle = '#D9D3C7';
  ctx.fillRect(x, y, W, 2.2);
  ctx.fillStyle = '#F6F1E8';
  ctx.fillRect(x, y, W, 0.8);
  // dial
  const cx = x + W / 2,
    cy = y + 11;
  ctx.fillStyle = '#2B0B08';
  ctx.beginPath();
  ctx.arc(cx, cy, 6.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFF8E8';
  ctx.beginPath();
  ctx.arc(cx, cy, 5.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#B02A20';
  ctx.lineWidth = 0.4;
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 4.2, cy + Math.sin(a) * 4.2);
    ctx.lineTo(cx + Math.cos(a) * 5, cy + Math.sin(a) * 5);
    ctx.stroke();
  }
  // the needle reads Dad when he's on it
  const p0 = w.player;
  const on = p0.onGround && Math.abs(p0.y + p0.h - y) < 1 && p0.x + p0.w > x && p0.x < x + W;
  const a = on ? -Math.PI / 2 + 2.1 + Math.sin(t * 9) * 0.04 : -Math.PI / 2;
  ctx.strokeStyle = '#1A1210';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(a) * 4.4, cy + Math.sin(a) * 4.4);
  ctx.stroke();
  // bulbs and the coin slot
  for (let k = 0; k < 4; k++) {
    const on2 = Math.floor(t * 4 + k) % 2 === 0;
    ctx.fillStyle = on2 ? '#FFE07A' : '#7A2A1E';
    ctx.beginPath();
    ctx.arc(x + 2.6 + k * 3.6, y + 20, 0.9, 0, Math.PI * 2);
    ctx.fill();
    if (on2) glow(ctx, x + 2.6 + k * 3.6, y + 20, 3, 'rgba(255,220,120,0.5)');
  }
  ctx.fillStyle = '#2B0B08';
  ctx.fillRect(cx - 2.5, y + 24, 5, 1.2);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(x + 2, y + 3, 1.2, H - 6);
  ctx.restore();
}
