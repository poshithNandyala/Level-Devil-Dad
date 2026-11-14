import { Ctx, circle, fillRR, rr, shade, text } from './common';

function wheel(ctx: Ctx, x: number, y: number, r: number, rot: number) {
  circle(ctx, x, y, r, '#1C1C20');
  circle(ctx, x, y, r * 0.55, '#8D8F99');
  ctx.strokeStyle = '#1C1C20';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const a = rot + (i * Math.PI * 2) / 3;
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55);
  }
  ctx.stroke();
}

export interface AutoLook {
  facing: 1 | -1;
  wheel: number;
  driver: 'normal' | 'shy' | 'happy' | 'peek';
  bounce: number;
  passenger?: boolean;
  exitTag?: boolean;
}

/** Auto-rickshaw, 40 x 30, top-left at (x, y). */
export function drawAuto(ctx: Ctx, x: number, y: number, look: AutoLook) {
  ctx.save();
  ctx.translate(x + 20, y + look.bounce);
  ctx.scale(look.facing, 1);
  ctx.translate(-20, 0);
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(20, 30, 19, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  // canopy (black canvas)
  ctx.fillStyle = '#1D1D1F';
  ctx.beginPath();
  ctx.moveTo(3, 11);
  ctx.quadraticCurveTo(2, 1.5, 12, 1);
  ctx.lineTo(30, 1);
  ctx.quadraticCurveTo(37, 1.4, 37.6, 9);
  ctx.lineTo(37.6, 11);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#F2C230';
  ctx.fillRect(3, 9.6, 34.8, 2);
  // body
  ctx.fillStyle = '#F2C230';
  ctx.beginPath();
  ctx.moveTo(2.6, 11);
  ctx.lineTo(38, 11);
  ctx.quadraticCurveTo(40.4, 14, 39.6, 20);
  ctx.lineTo(39, 25);
  ctx.lineTo(3, 25);
  ctx.quadraticCurveTo(1.4, 18, 2.6, 11);
  ctx.closePath();
  ctx.fill();
  // lower green band
  ctx.fillStyle = '#2E7D32';
  ctx.fillRect(2.8, 20.5, 36.4, 4.5);
  // passenger opening
  ctx.fillStyle = '#3B2A22';
  rr(ctx, 6, 11.6, 13, 9.4, 2);
  ctx.fill();
  ctx.fillStyle = '#7A3E2A';
  ctx.fillRect(6.5, 17, 12, 3.4);
  // driver window
  ctx.fillStyle = '#9ED3E6';
  rr(ctx, 25, 11.8, 9, 6.6, 1.4);
  ctx.fill();
  // driver
  if (look.driver !== 'shy') {
    circle(ctx, 28.6, 14.6, 2.6, '#8A5A36');
    ctx.fillStyle = '#F4F4F4';
    ctx.fillRect(26, 11.9, 5.4, 1.4);
    if (look.driver === 'happy') {
      ctx.strokeStyle = '#2A1710';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(29.6, 15.4, 1, 0.1, Math.PI - 0.2);
      ctx.stroke();
    }
    ctx.fillStyle = '#1B1B1B';
    ctx.fillRect(28.8, 16, 2.6, 0.7);
    circle(ctx, 30, 14, 0.45, '#1B1B1B');
  } else {
    // hiding: just the cap visible, blushing headlight
    ctx.fillStyle = '#F4F4F4';
    ctx.fillRect(26.6, 16.4, 5.4, 1.4);
  }
  // headlight
  circle(ctx, 38.6, 18.6, 1.4, look.driver === 'shy' ? '#FF7AA2' : '#FFF6C2');
  // meter
  ctx.fillStyle = '#1B1B1B';
  ctx.fillRect(33.6, 12.4, 1.6, 2.6);
  // number plate
  ctx.fillStyle = '#F7F3E3';
  ctx.fillRect(4, 21.2, 7, 2.6);
  // passenger
  if (look.passenger) {
    circle(ctx, 12.4, 14.8, 2.4, '#B97A4C');
    ctx.fillStyle = '#2F6FB5';
    ctx.fillRect(10, 16.6, 5, 3);
  }
  wheel(ctx, 9, 26, 4, look.wheel);
  wheel(ctx, 33, 26, 3.6, look.wheel);
  ctx.restore();
  if (look.exitTag) {
    // an EXIT plate riding on the canopy, always upright
    const cx = x + 20,
      ty = y + look.bounce - 7;
    ctx.fillStyle = '#0E5F2E';
    rr(ctx, cx - 9, ty, 18, 6.6, 1.5);
    ctx.fill();
    ctx.fillStyle = 'rgba(92,255,154,0.25)';
    rr(ctx, cx - 11, ty - 1.6, 22, 9.8, 3);
    ctx.fill();
    text(ctx, 'EXIT', cx, ty + 3.5, 5.2, '#E9FFE9', { weight: 800 });
    ctx.fillStyle = '#3A3F44';
    ctx.fillRect(cx - 0.6, ty + 6.6, 1.2, 2);
  }
}

export type VehicleKind = 'bus' | 'car' | 'scooter' | 'truck' | 'autoV';

export const VEHICLE_SIZE: Record<VehicleKind, [number, number]> = {
  bus: [80, 40],
  car: [44, 20],
  scooter: [22, 22],
  truck: [64, 36],
  autoV: [40, 30],
};

export function drawVehicle(ctx: Ctx, kind: VehicleKind, x: number, y: number, facing: 1 | -1, color: string, rot: number, label = '') {
  if (kind === 'autoV') {
    // a plain traffic auto: same art as the story autos, nobody special at the wheel
    drawAuto(ctx, x, y, { facing, wheel: rot, driver: 'normal', bounce: 0 });
    return;
  }
  const [w, h] = VEHICLE_SIZE[kind];
  ctx.save();
  ctx.translate(x + w / 2, y);
  ctx.scale(facing, 1);
  ctx.translate(-w / 2, 0);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(w / 2, h, w / 2 - 1, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  if (kind === 'bus') {
    // roof walkable top
    fillRR(ctx, 0, 0, w, h - 5, 4, color);
    ctx.fillStyle = '#F3E6C4';
    ctx.fillRect(2, 6, w - 4, 13);
    ctx.fillStyle = shade(color, -0.25);
    ctx.fillRect(0, 0, w, 2.6);
    // windows
    ctx.fillStyle = '#2D3A46';
    for (let i = 0; i < 6; i++) rr(ctx, 4 + i * 11, 8, 8.6, 9, 1.2), ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    for (let i = 0; i < 6; i++) ctx.fillRect(5 + i * 11, 9, 2, 7);
    // windshield + destination board
    ctx.fillStyle = '#2D3A46';
    rr(ctx, w - 8, 7, 6.4, 12, 1.2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.fillRect(w - 26, 2.4, 22, 4.6);
    text(ctx, label || '500-D', w - 15, 4.8, 3.8, '#FFB703', { weight: 800 });
    // door
    ctx.fillStyle = shade(color, -0.35);
    ctx.fillRect(w - 20, 20, 7, 13);
    ctx.fillStyle = '#F3E6C4';
    ctx.fillRect(2, 27, w - 4, 1.4);
    circle(ctx, w - 1.6, 30, 1.4, '#FFF6C2');
    wheel(ctx, 16, h - 5, 5.4, rot);
    wheel(ctx, w - 16, h - 5, 5.4, rot);
  } else if (kind === 'car') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(2, h - 4);
    ctx.lineTo(1.6, 9);
    ctx.quadraticCurveTo(2.4, 7.4, 8, 7);
    ctx.lineTo(13, 1.2);
    ctx.quadraticCurveTo(14, 0, 16, 0);
    ctx.lineTo(31, 0);
    ctx.quadraticCurveTo(33, 0, 35, 2.6);
    ctx.lineTo(39, 7.4);
    ctx.quadraticCurveTo(43.6, 8.4, 43.6, 12);
    ctx.lineTo(43.6, h - 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2D3A46';
    ctx.beginPath();
    ctx.moveTo(14.4, 2);
    ctx.lineTo(22, 2);
    ctx.lineTo(22, 7.4);
    ctx.lineTo(10.4, 7.4);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(24, 2);
    ctx.lineTo(32.4, 2);
    ctx.lineTo(36.6, 7.4);
    ctx.lineTo(24, 7.4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = shade(color, -0.25);
    ctx.fillRect(2, 12.4, 41.4, 1);
    circle(ctx, 42.4, 10.6, 1.2, '#FFF6C2');
    ctx.fillStyle = '#E63946';
    ctx.fillRect(1.6, 10, 1.4, 2);
    wheel(ctx, 10, h - 4, 4.2, rot);
    wheel(ctx, 34, h - 4, 4.2, rot);
  } else if (kind === 'scooter') {
    // scooter + delivery rider with a big insulated bag
    ctx.fillStyle = color;
    rr(ctx, 3, 11, 15, 6, 2.6);
    ctx.fill();
    ctx.fillStyle = shade(color, -0.2);
    ctx.fillRect(15.6, 6, 2.6, 8);
    ctx.fillStyle = '#1B1B1B';
    ctx.fillRect(14.6, 5, 5, 1.2);
    // rider
    ctx.fillStyle = '#334155';
    rr(ctx, 7, 4.6, 6, 7, 2);
    ctx.fill();
    circle(ctx, 10.6, 2.6, 2.8, '#E63946');
    ctx.fillStyle = '#9ED3E6';
    ctx.fillRect(11.6, 1.6, 2, 1.6);
    // bag
    fillRR(ctx, 1, 3, 6.4, 7.4, 1.2, '#F77F00');
    ctx.fillStyle = '#fff';
    ctx.fillRect(2.4, 6.2, 3.6, 0.9);
    wheel(ctx, 5, h - 3.4, 3.2, rot);
    wheel(ctx, 17, h - 3.4, 3.2, rot);
  } else if (kind === 'truck') {
    fillRR(ctx, 0, 0, 44, h - 6, 2, color);
    ctx.fillStyle = shade(color, -0.2);
    for (let i = 0; i < 5; i++) ctx.fillRect(3 + i * 8.4, 3, 1.2, h - 12);
    fillRR(ctx, 45, 8, 18, h - 14, 3, '#F2C14E');
    ctx.fillStyle = '#2D3A46';
    rr(ctx, 52, 11, 9, 8, 1.4);
    ctx.fill();
    text(ctx, 'HORN OK PLEASE', 22, h - 11, 3.4, '#FFF3B0', { weight: 800 });
    wheel(ctx, 12, h - 5, 5, rot);
    wheel(ctx, 32, h - 5, 5, rot);
    wheel(ctx, 55, h - 5, 5, rot);
  }
  ctx.restore();
}

export function drawSignal(ctx: Ctx, x: number, baseY: number, light: 'red' | 'amber' | 'green', display: string, blink: boolean) {
  // pole
  ctx.fillStyle = '#3A3F44';
  ctx.fillRect(x - 1.2, baseY - 52, 2.4, 52);
  ctx.fillStyle = '#F2C14E';
  for (let i = 0; i < 4; i++) ctx.fillRect(x - 1.2, baseY - 8 - i * 6, 2.4, 2.4);
  // light box
  fillRR(ctx, x - 5, baseY - 74, 10, 24, 2, '#1E2326');
  const on = (c: string) => c === light && !(light === 'amber' && blink);
  circle(ctx, x, baseY - 69.5, 3, on('red') ? '#FF3B30' : '#4A1512');
  circle(ctx, x, baseY - 62, 3, on('amber') ? '#FFB703' : '#4A3A10');
  circle(ctx, x, baseY - 54.5, 3, on('green') ? '#2EE66B' : '#10361F');
  if (on(light)) {
    ctx.globalAlpha = 0.25;
    const y = light === 'red' ? baseY - 69.5 : light === 'amber' ? baseY - 62 : baseY - 54.5;
    circle(ctx, x, y, 6.4, light === 'red' ? '#FF3B30' : light === 'amber' ? '#FFB703' : '#2EE66B');
    ctx.globalAlpha = 1;
  }
  // countdown
  fillRR(ctx, x - 7, baseY - 85, 14, 9, 1.6, '#0B0D0E');
  text(ctx, display, x, baseY - 80.3, 7, light === 'green' ? '#2EE66B' : light === 'amber' ? '#FFB703' : '#FF3B30', {
    weight: 800,
  });
}

export function drawPedButton(ctx: Ctx, x: number, y: number, groundY: number, lit: boolean, tick: number) {
  ctx.fillStyle = '#3A3F44';
  ctx.fillRect(x + 3, y + 10, 2, groundY - y - 10);
  fillRR(ctx, x, y, 8, 11, 1.6, '#F2C14E', '#3A3F44', 0.8);
  const pulse = !lit && tick % 60 < 30;
  circle(ctx, x + 4, y + 4.2, 2.3, lit ? '#2EE66B' : pulse ? '#FF5A4A' : '#A3281D');
  text(ctx, 'PUSH', x + 4, y + 8.9, 2.6, '#1E2326', { weight: 800 });
}

export function drawTrain(ctx: Ctx, x: number, y: number, w: number, h: number, doors: number[], shake = 0) {
  ctx.save();
  ctx.translate(0, shake);
  fillRR(ctx, x, y, w, h, 3, '#EDE6D6');
  ctx.fillStyle = '#7A1F2B';
  ctx.fillRect(x, y + h - 12, w, 5);
  ctx.fillStyle = '#5B2C83';
  ctx.fillRect(x, y + 3, w, 2);
  // windows
  ctx.fillStyle = '#2A3240';
  for (let wx = x + 6; wx < x + w - 10; wx += 14) {
    if (doors.some((d) => wx + 10 > d - 2 && wx < d + 18)) continue;
    rr(ctx, wx, y + 9, 10, 9, 1.4);
    ctx.fill();
  }
  // grills
  ctx.strokeStyle = '#8A8F99';
  ctx.lineWidth = 0.4;
  for (let wx = x + 6; wx < x + w - 10; wx += 14) {
    if (doors.some((d) => wx + 10 > d - 2 && wx < d + 18)) continue;
    for (let gy = y + 11; gy < y + 18; gy += 2.4) {
      ctx.beginPath();
      ctx.moveTo(wx, gy);
      ctx.lineTo(wx + 10, gy);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** An open doorway of a local train (16 x 30). Packed doors spill commuters out. */
export function drawTrainDoor(ctx: Ctx, x: number, y: number, packed: boolean, t: number) {
  ctx.fillStyle = '#3A2F2A';
  rr(ctx, x, y, 16, 30, 1.6);
  ctx.fill();
  const g = ctx.createLinearGradient(x, y, x, y + 30);
  g.addColorStop(0, 'rgba(255,235,170,0.55)');
  g.addColorStop(1, 'rgba(255,235,170,0.1)');
  ctx.fillStyle = g;
  ctx.fillRect(x + 1, y + 1, 14, 28);
  const cols = ['#2F6FB5', '#E63946', '#F2C14E', '#2E7D32', '#8E6CCB', '#F77F00'];
  const n = packed ? 6 : 2;
  for (let i = 0; i < n; i++) {
    const cx = x + (packed ? 1.5 + (i % 3) * 6.5 : 4 + i * 7),
      cy = y + (packed ? (i < 3 ? 9 : 15) : 10),
      sway = Math.sin(t * 2 + i) * (packed ? 0.8 : 0.4);
    circle(ctx, cx + sway, cy, 1.9, i % 2 ? '#8A5A36' : '#A86F45');
    ctx.fillStyle = cols[i % cols.length];
    rr(ctx, cx - 2.1 + sway, cy + 2, 4.2, 8, 1.4);
    ctx.fill();
  }
  if (packed) {
    // arms and a bag hanging out of the door
    ctx.strokeStyle = '#8A5A36';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 12);
    ctx.lineTo(x + 19 + Math.sin(t * 3) * 0.8, y + 10);
    ctx.moveTo(x + 2, y + 18);
    ctx.lineTo(x - 3, y + 17 + Math.sin(t * 2.6) * 0.8);
    ctx.stroke();
    fillRR(ctx, x + 15, y + 15, 5, 5, 1, '#5B4030');
  }
  ctx.fillStyle = '#9AA0A6';
  ctx.fillRect(x + 7.4, y + 1, 1.2, 28);
}
