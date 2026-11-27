import type { Ctx } from '../../../render/art/common';

/** the constant Shillong drizzle: thin slanting drops over the whole frame, and a slow drifting cloud wisp */
export function ambient(ctx: Ctx, x0: number, x1: number, t: number, reduced: boolean) {
  if (reduced) return;
  ctx.fillStyle = 'rgba(210,228,238,0.35)';
  for (let x = Math.floor(x0 / 11) * 11; x < x1; x += 11) {
    const k = ((x * 7) % 13) / 13;
    const y = (t * 260 + k * 240) % 250;
    ctx.fillRect(x + ((t * 40) % 2), y, 1, 5);
  }
  ctx.fillStyle = 'rgba(240,246,248,0.18)';
  for (let x = Math.floor(x0 / 220) * 220; x < x1 + 220; x += 220) {
    const dx = (t * 6) % 220;
    ctx.beginPath();
    ctx.ellipse(x + dx, 120 + ((x / 220) % 3) * 30, 70, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
