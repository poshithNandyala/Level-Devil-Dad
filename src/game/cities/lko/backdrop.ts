import type { Theme } from '../../../render/theme';
import type { Ctx } from '../../../render/art/common';

/** Lucknow's skyline, drawn in world units between x0 and x1 (landmarks as generic shapes). TODO */
export function backdrop(ctx: Ctx, th: Theme, x0: number, x1: number) {
  // TODO: far hills, the city's buildings, its landmark as a generic shape (see ../rnc/backdrop.ts)
  ctx.fillStyle = th.far;
  ctx.fillRect(x0, 200, x1 - x0, 40);
}
