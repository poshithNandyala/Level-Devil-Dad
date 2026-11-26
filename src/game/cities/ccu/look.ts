import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** colour grade: a warm, sticky haze over the Hooghly */
export const grade: Grade = { gx: 0.62, gy: 0.18, glow: 'rgba(255,236,196,0.24)', tint: 'rgba(120,130,150,0.07)', vig: 'rgba(30,26,34,0.22)' };

/** the ground caps: worn grey cobbles with chips of broken clay cups */
export const tileCaps: GroundCaps = { cap: '#8C8577', capHi: '#B3AC9C', blades: '#6B655A', pebbles: '#A9572E' };

/** one sentence for the postcard (CCU bible, section 6) */
export const cityLine = 'The tram is slower than you, and still gets there first.';
