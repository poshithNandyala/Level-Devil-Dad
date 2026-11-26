import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** colour grade over the whole frame */
export const grade: Grade = { gx: 0.8, gy: -0.1, glow: 'rgba(170,200,255,0.22)', tint: 'rgba(80,110,255,0.10)', vig: 'rgba(4,6,26,0.26)' };

/** the grass and pebbles on top of the ground tiles */
export const tileCaps: GroundCaps = { cap: '#4A4858', capHi: '#6B6980', pebbles: '#2E2D3A' };

/** one sentence for the postcard */
export const cityLine = 'The platform moves. The train stays still. Mostly.';
