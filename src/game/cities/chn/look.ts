import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** colour grade over the whole frame */
export const grade: Grade = { gx: 0.84, gy: -0.12, glow: 'rgba(255,242,205,0.38)', tint: 'rgba(255,196,120,0.10)', vig: 'rgba(84,34,12,0.12)' };

/** the grass and pebbles on top of the ground tiles */
export const tileCaps: GroundCaps = { cap: '#E2B86C', capHi: '#F3D597', pebbles: '#B98E4E' };

/** one sentence for the postcard */
export const cityLine = 'Share autos, water pots and a sun that plays tricks on you.';
