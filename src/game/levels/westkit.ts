// Drawings shared by the western chapters' stages and their door endings (no level imports here,
// so both the city files and the endings can use them).
import { text } from './endkit';

/** Bubble art: a speech bubble with a tail back to the speaker; sharp remarks are thorny and red. */
export function bubbleArt(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, line: string, sharp: boolean, tailX: number, k: number) {
  const a = k < 0.12 ? k / 0.12 : k > 0.9 ? (1 - k) / 0.1 : 1;
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, a));
  if (sharp) {
    ctx.fillStyle = '#FFEBEE';
    ctx.strokeStyle = '#C62828';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const n = 8;
    for (let i = 0; i <= n; i++) ctx.lineTo(x + (w * i) / n, y - (i % 2 ? 3 : 0));
    for (let i = 0; i <= 2; i++) ctx.lineTo(x + w + (i % 2 ? 3 : 0), y + (h * i) / 2);
    for (let i = n; i >= 0; i--) ctx.lineTo(x + (w * i) / n, y + h + (i % 2 ? 3 : 0));
    for (let i = 2; i >= 0; i--) ctx.lineTo(x - (i % 2 ? 3 : 0), y + (h * i) / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    text(ctx, line, x + w / 2, y + h / 2 + 0.5, 5, '#B71C1C', '');
  } else {
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = 'rgba(40,40,60,0.7)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.fill();
    ctx.stroke();
    // the tail, pointing back at whoever said it
    const tx = Math.max(x + 5, Math.min(x + w - 5, tailX));
    ctx.beginPath();
    ctx.moveTo(tx - 3, y + h - 0.5);
    ctx.lineTo(tx + (tailX < x + w / 2 ? -5 : 5), y + h + 5);
    ctx.lineTo(tx + 3, y + h - 0.5);
    ctx.fill();
    text(ctx, line, x + w / 2, y + h / 2 + 0.5, 4.6, '#37474F', '');
  }
  ctx.restore();
}

/** A Goan aunty on her balcony, fan in hand. */
export function aunty(ctx: CanvasRenderingContext2D, x: number, feet: number, face: 1 | -1, dress: string, talking: boolean, t: number) {
  ctx.save();
  // a frock, a bob of grey hair, a hand fan going
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(x, feet, 6, 1.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8D5A3B';
  ctx.fillRect(x - 3, feet - 5, 2, 5);
  ctx.fillRect(x + 1, feet - 5, 2, 5);
  ctx.fillStyle = dress;
  ctx.beginPath();
  ctx.moveTo(x - 4, feet - 19);
  ctx.lineTo(x + 4, feet - 19);
  ctx.lineTo(x + 6.5, feet - 5);
  ctx.lineTo(x - 6.5, feet - 5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = 0; i < 4; i++) ctx.fillRect(x - 4 + i * 2.6, feet - 14 + (i % 2) * 4, 1.2, 1.2);
  ctx.fillStyle = '#A86E4B';
  ctx.beginPath();
  ctx.arc(x, feet - 23, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#CFD8DC';
  ctx.beginPath();
  ctx.arc(x - face * 0.8, feet - 24.5, 4.2, Math.PI * 1.05, Math.PI * 2.0);
  ctx.fill();
  ctx.fillStyle = '#1D1A26';
  ctx.fillRect(x + face * 1.6, feet - 23.5, 1.1, 1.1);
  if (talking) {
    ctx.fillStyle = '#5D2A2A';
    ctx.fillRect(x + face * 2.2 - 0.6, feet - 21.2, 1.6, 1.4);
  }
  // the fan
  const fa = Math.sin(t * 9) * 0.4;
  ctx.translate(x - face * 6, feet - 16);
  ctx.rotate(fa);
  ctx.fillStyle = '#E57373';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, 5, -Math.PI * 0.85, -Math.PI * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}


/** The poder: Goa's bread man on his bicycle, a cane basket of poi on the carrier and a bulb horn. */
export function poderArt(ctx: CanvasRenderingContext2D, x: number, feet: number, t: number, moving: boolean, honk: boolean) {
  const spin = moving ? t * 14 : 0;
  ctx.save();
  ctx.strokeStyle = '#263238';
  ctx.lineWidth = 1.2;
  for (const wx of [x - 9, x + 9]) {
    ctx.beginPath();
    ctx.arc(wx, feet - 6, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(wx + Math.cos(spin) * 6, feet - 6 + Math.sin(spin) * 6);
    ctx.lineTo(wx - Math.cos(spin) * 6, feet - 6 - Math.sin(spin) * 6);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(x - 9, feet - 6);
  ctx.lineTo(x - 2, feet - 15);
  ctx.lineTo(x + 7, feet - 15);
  ctx.lineTo(x + 9, feet - 6);
  ctx.moveTo(x - 2, feet - 15);
  ctx.lineTo(x, feet - 6);
  ctx.lineTo(x + 7, feet - 15);
  ctx.stroke();
  // the basket of poi on the back
  ctx.fillStyle = '#B08850';
  ctx.fillRect(x - 17, feet - 22, 13, 8);
  ctx.fillStyle = '#C98A4B';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(x - 15 + i * 3.2, feet - 22, 2, Math.PI, 0);
    ctx.fill();
  }
  // the rider: white vest, a cap
  ctx.fillStyle = '#F5F5F5';
  ctx.fillRect(x - 3, feet - 30, 6, 11);
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(x - 3, feet - 19, 2, 6);
  ctx.fillRect(x + 1, feet - 19, 2, 6);
  ctx.fillStyle = '#8D5524';
  ctx.beginPath();
  ctx.arc(x, feet - 33, 3.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1565C0';
  ctx.fillRect(x - 3.6, feet - 37.5, 7.2, 2.2);
  // the horn
  ctx.fillStyle = honk ? '#FFEB3B' : '#212121';
  ctx.beginPath();
  ctx.arc(x + 9, feet - 19, honk ? 3.2 : 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** An old Amdavad pol house over a block of hidden tiles: a painted wall, a parapet, carved wooden
 *  windows (with a jharokha balcony on the wide ones) and strings of kites' tails on the top. */
export function polHouse(ctx: CanvasRenderingContext2D, x0: number, x1: number, top: number, bottom: number, wall: string, trim = '#6D4C41') {
  const w = x1 - x0;
  ctx.fillStyle = wall;
  ctx.fillRect(x0, top, w, bottom - top);
  // weathering at the foot, and a shadow line under the parapet
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(x0, bottom - 6, w, 6);
  ctx.fillRect(x0, top + 4, w, 1.5);
  // the parapet with its little pierced pattern
  ctx.fillStyle = trim;
  ctx.fillRect(x0 - 1, top, w + 2, 3);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  for (let x = x0 + 3; x < x1 - 2; x += 6) ctx.fillRect(x, top + 1, 2, 1);
  // carved windows, a row per storey
  for (let y = top + 10; y + 16 < bottom - 4; y += 26) {
    const n = Math.max(1, Math.floor((w - 6) / 22));
    const gap = (w - n * 12) / (n + 1);
    for (let i = 0; i < n; i++) {
      const wx = x0 + gap + i * (12 + gap);
      ctx.fillStyle = trim;
      ctx.fillRect(wx - 1.5, y - 1.5, 15, 18);
      ctx.fillStyle = '#263238';
      ctx.beginPath();
      ctx.moveTo(wx, y + 15);
      ctx.lineTo(wx, y + 5);
      ctx.quadraticCurveTo(wx + 6, y - 2, wx + 12, y + 5);
      ctx.lineTo(wx + 12, y + 15);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,214,140,0.5)';
      ctx.fillRect(wx + 5.5, y + 5, 1, 10);
      // a jharokha ledge under it
      ctx.fillStyle = trim;
      ctx.fillRect(wx - 3, y + 16, 18, 2);
    }
  }
}
