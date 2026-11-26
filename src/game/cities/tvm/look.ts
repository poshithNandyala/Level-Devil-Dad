import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** colour grade over the whole frame */
export const grade: Grade = { gx: 0.82, gy: -0.15, glow: 'rgba(255,236,190,0.30)', tint: 'rgba(110,200,160,0.12)', vig: 'rgba(8,46,36,0.16)' };

/** the grass and pebbles on top of the ground tiles */
export const tileCaps: GroundCaps = { cap: '#4E9A3C', capHi: '#7CC255', blades: '#3E8530', flowers: ['#F4D35E', '#FFFFFF'] };

/** one sentence for the postcard */
export const cityLine = 'Monsoon puddles, red buses and coconuts with perfect timing.';
