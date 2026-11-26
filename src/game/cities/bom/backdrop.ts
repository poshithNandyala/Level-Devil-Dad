import { Theme } from '../../../render/theme';
import { Ctx, hash, rr, withAlpha } from '../../../render/art/common';
import { sunGlow } from '../../../render/backgrounds';

// --------------------------------------------------------------------- Mumbai
export function mumbai(ctx: Ctx, th: Theme, x0: number, x1: number, variant: number) {
  sunGlow(ctx, 330, 196, 26, th.sun);
  // sea
  const sg = ctx.createLinearGradient(0, 200, 0, 260);
  sg.addColorStop(0, '#3A3772');
  sg.addColorStop(1, '#1B1A3D');
  ctx.fillStyle = sg;
  ctx.fillRect(x0 - 2, 200, x1 - x0 + 4, 100);
  ctx.fillStyle = 'rgba(255,200,140,0.35)';
  for (let i = 0; i < 8; i++) ctx.fillRect(330 - 18 + hash(i, 1) * 12, 204 + i * 5, 24 - i * 2, 1.2);
  // far skyline with lit windows
  for (let x = Math.floor(x0 / 22) * 22 - 22; x < x1 + 22; x += 22) {
    if (x > 250 && x < 400) continue;
    const h = 40 + hash(x, 21) * 90;
    const w = 14 + hash(x, 22) * 8;
    ctx.fillStyle = hash(x, 23) > 0.5 ? th.far : th.mid;
    ctx.fillRect(x, 200 - h, w, h);
    ctx.fillStyle = 'rgba(255,214,140,0.65)';
    for (let wy = 204 - h; wy < 196; wy += 5) for (let wx = x + 2; wx < x + w - 2; wx += 4) if (hash(wx, wy, 3) > 0.62) ctx.fillRect(wx, wy, 1.6, 2);
  }
  // Bandra-Worli Sea Link
  const px = 470;
  if (px > x0 - 120 && px < x1 + 120) {
    ctx.fillStyle = th.mid;
    ctx.fillRect(px - 120, 186, 240, 3);
    ctx.beginPath();
    ctx.moveTo(px - 4, 186);
    ctx.lineTo(px - 1.5, 120);
    ctx.lineTo(px + 1.5, 120);
    ctx.lineTo(px + 4, 186);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = withAlpha('#C9C2F0', 0.5);
    ctx.lineWidth = 0.4;
    for (let i = 1; i <= 9; i++) {
      ctx.beginPath();
      ctx.moveTo(px, 124 + i * 2);
      ctx.lineTo(px - i * 12, 186);
      ctx.moveTo(px, 124 + i * 2);
      ctx.lineTo(px + i * 12, 186);
      ctx.stroke();
    }
  }
  // Gateway of India
  const gx = variant === 5 ? 160 : 120;
  ctx.fillStyle = th.near;
  ctx.fillRect(gx - 30, 160, 60, 42);
  ctx.fillRect(gx - 34, 156, 68, 6);
  for (const tx of [-28, -8, 12]) ctx.fillRect(gx + tx, 146, 16, 12);
  for (const tx of [-24, 16]) {
    ctx.beginPath();
    ctx.arc(gx + tx + 4, 146, 5, Math.PI, 0);
    ctx.fill();
  }
  ctx.fillStyle = '#4C3F7E';
  ctx.beginPath();
  ctx.moveTo(gx - 9, 202);
  ctx.lineTo(gx - 9, 178);
  ctx.quadraticCurveTo(gx, 166, gx + 9, 178);
  ctx.lineTo(gx + 9, 202);
  ctx.closePath();
  ctx.fill();
  // Queen's Necklace along Marine Drive
  ctx.fillStyle = th.accent;
  for (let x = x0; x < x1; x += 5) {
    const y = 214 + Math.sin((x - x0) * 0.008) * 8;
    if (hash(Math.round(x), 41) > 0.15) {
      ctx.globalAlpha = 0.85;
      ctx.fillRect(x, y, 1.6, 1.6);
    }
  }
  ctx.globalAlpha = 1;
  // station roof girders across the top
  ctx.fillStyle = 'rgba(20,18,40,0.55)';
  ctx.fillRect(x0 - 2, 0, x1 - x0 + 4, 10);
  ctx.strokeStyle = 'rgba(20,18,40,0.45)';
  ctx.lineWidth = 1.2;
  for (let x = Math.floor(x0 / 24) * 24; x < x1 + 24; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, 10);
    ctx.lineTo(x + 12, 0);
    ctx.lineTo(x + 24, 10);
    ctx.stroke();
  }
  void rr;
}
