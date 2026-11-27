import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** colour grade over the whole frame: cold blue shade with a warm first-light glow from the right */
export const grade: Grade = { gx: 0.82, gy: 0.1, glow: 'rgba(255,190,120,0.3)', tint: 'rgba(60,70,120,0.08)', vig: 'rgba(14,20,40,0.26)' };

/** moss over red brick, wet clay at the edges */
export const tileCaps: GroundCaps = { cap: '#5E8C4A', capHi: '#8CB36A', blades: '#3F6B34', pebbles: '#7A4A32' };

/** one sentence for the postcard */
export const cityLine = 'Itanagar: the first light, and the last landslide.';
