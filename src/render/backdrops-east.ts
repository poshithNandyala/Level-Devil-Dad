import type { Theme } from './theme';
import { Ctx, withAlpha } from './art/common';

/**
 * Ranchi: the plateau edge, a waterfall dropping off it, sal on the near
 * slopes and small tin-roofed houses along the road. Drawn around the room in
 * world px, parallaxed so the ridge sits far behind the playfield.
 */
export function ranchi(ctx: Ctx, th: Theme, x0: number, x1: number) {
  // far ridge: flat-topped plateau with a notch where the falls cut through
  ctx.fillStyle = th.far;
  ctx.beginPath();
  ctx.moveTo(x0 - 8, 190);
  const step = 92;
  for (let x = x0 - 8; x <= x1 + 8; x += step) {
    const k = Math.round(x / step);
    const top = 96 + ((k * 37) % 22);
    ctx.lineTo(x, top);
    ctx.lineTo(x + step, top + ((k % 3) - 1) * 5);
  }
  ctx.lineTo(x1 + 8, 200);
  ctx.closePath();
  ctx.fill();

  // the falls: a pale thread down the cliff face, with mist at the foot
  const fx = 260;
  const fall = ctx.createLinearGradient(fx, 110, fx, 214);
  fall.addColorStop(0, withAlpha('#FFFFFF', 0.62));
  fall.addColorStop(1, withAlpha('#E7F4EC', 0.05));
  ctx.fillStyle = fall;
  ctx.fillRect(fx, 110, 13, 104);
  ctx.fillStyle = withAlpha('#FFFFFF', 0.34);
  ctx.fillRect(fx + 3, 112, 3, 98);
  const mist = ctx.createRadialGradient(fx + 6, 214, 4, fx + 6, 214, 46);
  mist.addColorStop(0, withAlpha('#F2FBF5', 0.4));
  mist.addColorStop(1, withAlpha('#F2FBF5', 0));
  ctx.fillStyle = mist;
  ctx.fillRect(fx - 44, 176, 104, 62);

  // mid slope: sal crowns, dark and rounded, in two staggered rows
  for (let row = 0; row < 2; row++) {
    ctx.fillStyle = row ? th.mid : withAlpha(th.mid, 0.66);
    const y = row ? 178 : 158;
    const gap = row ? 34 : 46;
    for (let x = x0 - 20; x <= x1 + 20; x += gap) {
      const k = Math.round(x / gap) + row * 7;
      const r = 16 + ((k * 13) % 9);
      ctx.beginPath();
      ctx.arc(x, y - ((k * 11) % 7), r, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 1.5, y - 4, 3, 18);
    }
  }

  // near bank: the red-earth edge and a scatter of small houses
  ctx.fillStyle = th.near;
  ctx.fillRect(x0 - 8, 204, x1 - x0 + 16, 40);
  ctx.fillStyle = withAlpha('#8A4A2E', 0.5);
  ctx.fillRect(x0 - 8, 214, x1 - x0 + 16, 30);
  for (let i = 0; i < 7; i++) {
    const hx = x0 + 24 + i * 74 + ((i * 29) % 21);
    const hw = 26 + ((i * 13) % 12);
    ctx.fillStyle = '#EDE3CE';
    ctx.fillRect(hx, 208, hw, 16);
    ctx.fillStyle = i % 2 ? '#B0563A' : '#8E9AA0';
    ctx.beginPath();
    ctx.moveTo(hx - 3, 208);
    ctx.lineTo(hx + hw / 2, 200);
    ctx.lineTo(hx + hw + 3, 208);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = withAlpha(th.ink, 0.35);
    ctx.fillRect(hx + hw / 2 - 2.5, 214, 5, 10);
  }
}
