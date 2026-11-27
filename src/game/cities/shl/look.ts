import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** colour grade over the whole frame: cool, soft, a little grey, the light of a wet morning */
export const grade: Grade = { gx: 0.5, gy: 0.1, glow: 'rgba(230,240,235,0.22)', tint: 'rgba(120,160,150,0.08)', vig: 'rgba(20,38,34,0.24)' };

/** moss over wet stone, roots at the edges */
export const tileCaps: GroundCaps = { cap: '#7FA06A', capHi: '#A6C27A', blades: '#5E8C4A', pebbles: '#55675F' };

/** one sentence for the postcard */
export const cityLine = 'Shillong: where the rain is a neighbour and everyone says Bah.';
