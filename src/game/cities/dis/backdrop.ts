import type { Theme } from '../../../render/theme';
import { Ctx, withAlpha } from '../../../render/art/common';

/**
 * Guwahati from the south bank of the Luit (the Brahmaputra): Kamakhya hill (a plain green silhouette) on the left,
 * the wide river with pale sandbars, the Saraighat bridge's steel truss, little Umananda islet with its trees,
 * far blue hills and flat-topped tea rows on the near slope. Drawn around the room in world px, parallaxed.
 */
export function dispur(ctx: Ctx, th: Theme, x0: number, x1: number) {
  // far blue hills
  ctx.fillStyle = withAlpha('#6E8FA0', 0.55);
  ctx.beginPath();
  ctx.moveTo(x0 - 8, 150);
  for (let x = x0 - 8; x <= x1 + 8; x += 40) {
    const k = Math.round(x / 40);
    ctx.lineTo(x, 112 + ((k * 29) % 26));
  }
  ctx.lineTo(x1 + 8, 150);
  ctx.closePath();
  ctx.fill();

  // Kamakhya hill: one big rounded green hill with a few trees, no building drawn on it
  const hx = 70;
  ctx.fillStyle = th.far;
  ctx.beginPath();
  ctx.moveTo(hx - 120, 192);
  ctx.quadraticCurveTo(hx - 40, 70, hx + 40, 82);
  ctx.quadraticCurveTo(hx + 110, 94, hx + 170, 192);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = th.mid;
  for (let i = 0; i < 9; i++) {
    const tx = hx - 70 + i * 17;
    const ty = 118 + Math.abs(i - 4) * 9;
    ctx.beginPath();
    ctx.arc(tx, ty, 8, Math.PI, Math.PI * 2);
    ctx.fill();
  }

  // the river: a wide grey-brown band with pale sand islands
  const river = ctx.createLinearGradient(0, 168, 0, 212);
  river.addColorStop(0, '#A59985');
  river.addColorStop(1, '#8D7B68');
  ctx.fillStyle = river;
  ctx.fillRect(x0 - 8, 168, x1 - x0 + 16, 44);
  ctx.fillStyle = '#D9CBB0';
  for (let x = x0 - 30; x <= x1 + 30; x += 120) {
    const k = Math.round(x / 120);
    const bx = x + ((k * 41) % 50);
    ctx.beginPath();
    ctx.ellipse(bx, 190 + ((k * 7) % 9), 28 + ((k * 13) % 14), 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = withAlpha('#FFFFFF', 0.25);
  ctx.lineWidth = 0.8;
  for (let x = x0; x <= x1; x += 26) {
    ctx.beginPath();
    ctx.moveTo(x, 176 + ((x / 26) % 3) * 9);
    ctx.lineTo(x + 10, 176 + ((x / 26) % 3) * 9);
    ctx.stroke();
  }

  // Umananda: a small rocky islet with trees
  const ux = 330;
  ctx.fillStyle = '#6F6A58';
  ctx.beginPath();
  ctx.ellipse(ux, 176, 22, 9, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = th.mid;
  for (const dx of [-12, -3, 7, 14]) {
    ctx.beginPath();
    ctx.arc(ux + dx, 166, 6, Math.PI, Math.PI * 2);
    ctx.fill();
  }

  // the Saraighat bridge: a steel truss on piers across the river
  const by = 150;
  ctx.strokeStyle = withAlpha('#5B6670', 0.7);
  ctx.fillStyle = withAlpha('#5B6670', 0.7);
  ctx.lineWidth = 1.2;
  const span = 64;
  for (let x = x0 - (x0 % span) - span; x <= x1 + span; x += span) {
    ctx.fillRect(x - 2, by + 2, 4, 22);
    ctx.beginPath();
    ctx.moveTo(x, by - 10);
    ctx.lineTo(x + span, by - 10);
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * 16, by + 2);
      ctx.lineTo(x + i * 16 + 8, by - 10);
      ctx.lineTo(x + i * 16 + 16, by + 2);
      ctx.stroke();
    }
  }
  ctx.fillRect(x0 - 8, by + 1, x1 - x0 + 16, 3);

  // near slope: tea rows, flat-topped, with a few tall shade trees
  ctx.fillStyle = withAlpha(th.near, 0.75);
  ctx.fillRect(x0 - 8, 212, x1 - x0 + 16, 40);
  ctx.fillStyle = withAlpha('#4C8C3A', 0.7);
  for (let row = 0; row < 3; row++)
    for (let x = x0 - 10 + row * 13; x <= x1 + 10; x += 26) {
      ctx.beginPath();
      ctx.ellipse(x, 214 + row * 7, 11, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  for (let x = x0 + 40; x <= x1; x += 150) {
    const k = Math.round(x / 150);
    const sx = x + ((k * 37) % 40);
    ctx.fillStyle = '#35502E';
    ctx.fillRect(sx - 1, 192, 2, 20);
    ctx.fillStyle = '#2F5F31';
    ctx.beginPath();
    ctx.arc(sx, 190, 10, 0, Math.PI * 2);
    ctx.fill();
  }
}
