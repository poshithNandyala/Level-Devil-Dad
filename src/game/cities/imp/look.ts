import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** colour grade over the whole frame: lake mist at dawn, a warm gold-green glow */
export const grade: Grade = { gx: 0.6, gy: 0.14, glow: 'rgba(242,230,196,0.26)', tint: 'rgba(120,160,130,0.08)', vig: 'rgba(20,34,30,0.22)' };

/** reed mat over dark water; moss at the edges */
export const tileCaps: GroundCaps = { cap: '#8FA64A', capHi: '#C2CF7A', blades: '#6F8A33', pebbles: '#5E5236' };

/** one sentence for the postcard */
export const cityLine = 'Imphal: a lake that floats and a market run by mothers.';
