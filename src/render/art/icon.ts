import { papaHead } from './characters';
import { Ctx, rr, text } from './common';

/** The app icon: Papa, unimpressed, with an EXIT sign that clearly can't be trusted. */
export function drawIcon(ctx: Ctx, S: number, opts: { maskable?: boolean; transparent?: boolean } = {}) {
  if (!opts.transparent) {
    const g = ctx.createRadialGradient(S * 0.5, S * 0.35, S * 0.05, S * 0.5, S * 0.55, S * 0.8);
    g.addColorStop(0, '#FFC174');
    g.addColorStop(0.55, '#F28C28');
    g.addColorStop(1, '#B83A0B');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    // sun rays
    ctx.save();
    ctx.translate(S * 0.5, S * 0.6);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i < 12; i++) {
      ctx.rotate((Math.PI * 2) / 12);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(S, -S * 0.12);
      ctx.lineTo(S, S * 0.12);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
  const k = opts.maskable ? 0.68 : 0.84;
  // the head: local head radius ~4.3 units around (0.4, -16.2)
  ctx.save();
  ctx.translate(S * 0.5, S * (opts.maskable ? 0.57 : 0.6));
  const u = (S * 0.34 * k) / 4.6;
  ctx.scale(u, u);
  ctx.translate(-1.2, 16.2);
  // shoulders / shirt collar
  ctx.fillStyle = '#2F6FB5';
  rr(ctx, -6.5, -11.6, 14, 8, 3.4);
  ctx.fill();
  ctx.fillStyle = '#F4F4F4';
  ctx.beginPath();
  ctx.moveTo(-1.6, -11.8);
  ctx.lineTo(0.8, -10);
  ctx.lineTo(3.2, -11.8);
  ctx.closePath();
  ctx.fill();
  papaHead(ctx, false);
  // a raised eyebrow
  ctx.strokeStyle = '#16110E';
  ctx.lineWidth = 0.55;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(2.8, -18.6);
  ctx.quadraticCurveTo(3.9, -19.4, 5, -18.8);
  ctx.stroke();
  ctx.restore();
  // the suspicious EXIT sign
  ctx.save();
  ctx.translate(S * (opts.maskable ? 0.69 : 0.74), S * (opts.maskable ? 0.27 : 0.2));
  ctx.rotate(0.22);
  const w = S * 0.3 * k,
    h = S * 0.12 * k;
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  rr(ctx, -w / 2 + S * 0.01, -h / 2 + S * 0.015, w, h, h * 0.22);
  ctx.fill();
  ctx.fillStyle = '#0E6B3A';
  rr(ctx, -w / 2, -h / 2, w, h, h * 0.22);
  ctx.fill();
  ctx.strokeStyle = '#E9FFE9';
  ctx.lineWidth = S * 0.008;
  rr(ctx, -w / 2 + S * 0.012, -h / 2 + S * 0.012, w - S * 0.024, h - S * 0.024, h * 0.16);
  ctx.stroke();
  text(ctx, 'EXIT?', 0, h * 0.06, h * 0.62, '#E9FFE9', { weight: 800 });
  ctx.restore();
}
