import { Theme } from '../../../render/theme';
import { Ctx, hash, withAlpha } from '../../../render/art/common';
import { charminar, hills, sunGlow } from '../../../render/backgrounds';

export function hyderabad(ctx: Ctx, th: Theme, x0: number, x1: number, variant: number) {
  sunGlow(ctx, 382, 88, 30, th.sun);
  // Golconda hills with fort walls
  hills(ctx, x0, x1, 200, 42, 0.012, 1.3, th.far);
  ctx.fillStyle = th.far;
  for (let x = Math.floor(x0 / 10) * 10; x < x1; x += 10) {
    const y = 200 - 42 * (0.55 + 0.45 * Math.sin(x * 0.012 + 1.3) * Math.sin(x * 0.012 * 0.37 + 2.6));
    if (hash(x, 3) > 0.45) ctx.fillRect(x, y - 4, 5, 4);
  }
  // old city skyline
  ctx.fillStyle = th.mid;
  for (let x = Math.floor(x0 / 34) * 34 - 34; x < x1 + 34; x += 34) {
    const h = 28 + hash(x, 1) * 34;
    const w = 24 + hash(x, 2) * 12;
    ctx.fillRect(x, 230 - h, w, h + 20);
    if (hash(x, 4) > 0.5) {
      ctx.beginPath();
      ctx.arc(x + w / 2, 230 - h, w * 0.32, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(x + w / 2 - 0.6, 230 - h - w * 0.32 - 5, 1.2, 5);
    } else if (hash(x, 5) > 0.5) {
      ctx.fillRect(x + w - 4, 230 - h - 16, 4, 16);
      ctx.beginPath();
      ctx.arc(x + w - 2, 230 - h - 16, 3, Math.PI, 0);
      ctx.fill();
    }
    // windows
    ctx.fillStyle = withAlpha('#FFE3B0', 0.5);
    for (let wy = 230 - h + 6; wy < 226; wy += 9)
      for (let wx = x + 4; wx < x + w - 4; wx += 7) if (hash(wx, wy) > 0.55) ctx.fillRect(wx, wy, 2.4, 3.6);
    ctx.fillStyle = th.mid;
  }
  // the Charminar, a little off-centre so the playfield stays readable
  charminar(ctx, variant === 5 ? 256 : 300, 240, variant === 5 ? 1.25 : 1.0, th.near, '#F6CFA4');
  // kites
  const kites: [number, number, string][] = [
    [110, 60, '#E63946'],
    [450, 40, '#2A9D8F'],
    [70, 110, '#F2C14E'],
  ];
  for (const [kx, ky, c] of kites) {
    if (kx < x0 - 20 || kx > x1 + 20) continue;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(kx, ky - 6);
    ctx.lineTo(kx + 5, ky);
    ctx.lineTo(kx, ky + 6);
    ctx.lineTo(kx - 5, ky);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = withAlpha('#5A3A2A', 0.4);
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(kx, ky + 6);
    ctx.quadraticCurveTo(kx + 20, ky + 60, kx - 10, 240);
    ctx.stroke();
  }
}
