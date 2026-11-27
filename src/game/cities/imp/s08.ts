import type { Ending } from '../../levels/endkit';
import { stubRoom, stubAct } from './stub';
export const room = () => stubRoom(8, 'stub 08');
export const act = stubAct('imp08-stub');
export const ending: Ending = { space: 10, advice: 'placeholder', build: () => {} };
export const meta08 = { family: 'price-order-stalls', betrayals: ['ordered-by-number'], ending: 'imp-ima-hatch' };
