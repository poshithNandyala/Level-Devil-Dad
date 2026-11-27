import type { Theme } from '../../../render/theme';
import { Ctx, withAlpha } from '../../../render/art/common';

/**
 * Kohima: the long dark Japfü ridge behind, pine on the slopes, tin and thatch roofs stacked up the hillside,
 * a tall pointed church on its hill, a thin drifting mist. Drawn in world px between x0 and x1; `variant` is the
 * stage's index (the roofs and mist shift a little with it so no two stages read alike).
 */
export function backdrop(ctx: Ctx, th: Theme, x0: number, x1: number, variant = 0) {
  // far ridge: Japfü, a long ridge with one higher shoulder
  ctx.fillStyle = th.far;
  ctx.beginPath();
  ctx.moveTo(x0 - 8, 200);
  const step = 110;
  for (let x = x0 - 8; x <= x1 + 8; x += step) {
    const k = Math.round(x / step) + variant;
    const top = 92 + ((k * 29) % 26);
    ctx.lineTo(x, top);
    ctx.lineTo(x + step * 0.55, top - 10 - ((k * 7) % 9));
  }
  ctx.lineTo(x1 + 8, 200);
  ctx.closePath();
  ctx.fill();

  // pine slopes
  ctx.fillStyle = th.mid;
  ctx.beginPath();
  ctx.moveTo(x0 - 8, 214);
  for (let x = x0 - 8; x <= x1 + 8; x += 36) {
    const k = Math.round(x / 36) + variant;
    ctx.lineTo(x, 150 + ((k * 13) % 18));
    ctx.lineTo(x + 18, 136 + ((k * 5) % 12));
  }
  ctx.lineTo(x1 + 8, 214);
  ctx.closePath();
  ctx.fill();

  // the church on its hill (Aradura): a tall pointed shape, scenery only
  const cx = Math.floor((x0 + 200) / 640) * 640 + 420;
  ctx.fillStyle = withAlpha('#F2EFE4', 0.75);
  ctx.fillRect(cx - 7, 128, 14, 24);
  ctx.beginPath();
  ctx.moveTo(cx - 9, 128);
  ctx.lineTo(cx, 108);
  ctx.lineTo(cx + 9, 128);
  ctx.closePath();
  ctx.fill();

  // roofs stacked up the slope: tin (pale, ridged) and thatch (dark gable), in rows
  for (let row = 0; row < 3; row++) {
    const y = 168 + row * 18;
    for (let x = x0 - 20 + ((row * 23 + variant * 11) % 40); x <= x1 + 20; x += 44) {
      const k = Math.round(x / 44) + row * 3 + variant;
      const tin = k % 3 !== 0;
      const wd = 28 + ((k * 7) % 10);
      if (tin) {
        ctx.fillStyle = withAlpha(k % 2 ? '#8FA6B8' : '#B0BCC4', 0.9);
        ctx.fillRect(x, y, wd, 7);
        ctx.fillStyle = withAlpha('#5E6E78', 0.8);
        for (let s = 2; s < wd; s += 5) ctx.fillRect(x + s, y, 1, 7);
      } else {
        ctx.fillStyle = withAlpha('#4E3B2A', 0.95);
        ctx.beginPath();
        ctx.moveTo(x - 2, y + 8);
        ctx.lineTo(x + wd / 2, y - 6);
        ctx.lineTo(x + wd + 2, y + 8);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = withAlpha(th.near, 0.9);
      ctx.fillRect(x + 2, y + 7, wd - 4, 11);
    }
  }

  // a thin band of mist over the lower roofs
  const mist = ctx.createLinearGradient(0, 196, 0, 226);
  mist.addColorStop(0, withAlpha('#E6ECEF', 0));
  mist.addColorStop(0.5, withAlpha('#E6ECEF', 0.35));
  mist.addColorStop(1, withAlpha('#E6ECEF', 0));
  ctx.fillStyle = mist;
  ctx.fillRect(x0 - 8, 196, x1 - x0 + 16, 30);
}
