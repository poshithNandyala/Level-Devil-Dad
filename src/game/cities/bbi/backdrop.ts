import type { Theme } from '../../../render/theme';
import { Ctx, withAlpha } from '../../../render/art/common';

/** a curved stone tower (rekha deula, generic: no shrine, no flag), base at y, h tall */
function spire(ctx: Ctx, x: number, y: number, w: number, h: number, c: string) {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y);
  ctx.bezierCurveTo(x - w / 2, y - h * 0.7, x - w * 0.22, y - h * 0.95, x, y - h);
  ctx.bezierCurveTo(x + w * 0.22, y - h * 0.95, x + w / 2, y - h * 0.7, x + w / 2, y);
  ctx.closePath();
  ctx.fill();
  // the ribs and the round cap stone (amalaka)
  ctx.fillStyle = withAlpha('#000000', 0.12);
  for (let i = 1; i < 6; i++) ctx.fillRect(x - w / 2 + 2, y - (h * i) / 6, w - 4, 1);
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.ellipse(x, y - h - 2, w * 0.24, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - 1, y - h - 8, 2, 5);
}

/**
 * Bhubaneswar: the two cave hills (Udayagiri-Khandagiri, square cells cut in rows), a white dome on a far hill
 * (Dhauli, backdrop only), the old town's curved stone towers, the floodlights of the hockey stadium, and
 * laterite walls along the wide new road. Drawn in world px between x0 and x1.
 */
export function backdrop(ctx: Ctx, th: Theme, x0: number, x1: number) {
  const span = 640;
  // far hills: two rounded sandstone humps per span, with the white dome on the next rise
  for (let s = Math.floor((x0 - 200) / span) * span; s < x1 + 200; s += span) {
    ctx.fillStyle = th.far;
    for (const [hx, hw, hh] of [
      [s + 60, 150, 70],
      [s + 190, 130, 58],
      [s + 430, 170, 44],
    ] as const) {
      ctx.beginPath();
      ctx.ellipse(hx, 196, hw / 2, hh, 0, Math.PI, Math.PI * 2);
      ctx.fill();
    }
    // the cave cells: square doorways in two rows on the first two hills
    ctx.fillStyle = withAlpha(th.ink, 0.42);
    for (const [hx, n] of [
      [s + 60, 5],
      [s + 190, 4],
    ] as const) {
      for (let r = 0; r < 2; r++) for (let i = 0; i < n - r; i++) ctx.fillRect(hx - n * 7 + i * 14 + r * 7, 160 + r * 14, 7, 8);
      ctx.fillStyle = withAlpha('#FFFFFF', 0.1);
      ctx.fillRect(hx - n * 7 - 4, 170, n * 14 + 4, 2);
      ctx.fillStyle = withAlpha(th.ink, 0.42);
    }
    // the white dome on the far rise (a peace stupa, drawn small and plain)
    const dx = s + 430;
    ctx.fillStyle = '#FBF7EE';
    ctx.beginPath();
    ctx.arc(dx, 150, 12, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(dx - 16, 150, 32, 4);
    ctx.fillRect(dx - 1.5, 132, 3, 7);
    // stadium floodlights far off
    for (const fx of [s + 300, s + 360]) {
      ctx.fillStyle = withAlpha(th.ink, 0.45);
      ctx.fillRect(fx, 120, 2, 76);
      ctx.fillStyle = '#FFF6D8';
      ctx.fillRect(fx - 6, 116, 14, 6);
      ctx.fillStyle = withAlpha(th.ink, 0.35);
      for (let i = 0; i < 4; i++) ctx.fillRect(fx - 5 + i * 3.5, 117, 1, 4);
    }
  }
  // the old town's stone towers, mid distance
  for (let s = Math.floor((x0 - 120) / 260) * 260; s < x1 + 120; s += 260) {
    spire(ctx, s + 80, 204, 30, 74, withAlpha(th.mid, 0.95));
    spire(ctx, s + 104, 204, 16, 40, withAlpha(th.mid, 0.95));
    spire(ctx, s + 190, 206, 22, 52, withAlpha('#9A6A48', 0.9));
  }
  // near: laterite compound walls, palms and a wide road verge
  ctx.fillStyle = th.near;
  ctx.fillRect(x0 - 8, 208, x1 - x0 + 16, 36);
  for (let x = Math.floor((x0 - 40) / 40) * 40; x < x1 + 40; x += 40) {
    ctx.fillStyle = withAlpha('#A8532F', 0.75);
    ctx.fillRect(x, 212, 38, 12);
    ctx.fillStyle = withAlpha('#000000', 0.15);
    for (let i = 0; i < 4; i++) ctx.fillRect(x + i * 10, 212, 1, 12);
    ctx.fillRect(x, 217, 38, 1);
    if ((x / 40) % 3 === 0) {
      ctx.fillStyle = '#6C4A2A';
      ctx.fillRect(x + 18, 176, 3, 36);
      ctx.fillStyle = '#3F7A3A';
      for (let k = -2; k <= 2; k++) {
        ctx.beginPath();
        ctx.ellipse(x + 19 + k * 6, 176 + Math.abs(k) * 3, 9, 3, k * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
