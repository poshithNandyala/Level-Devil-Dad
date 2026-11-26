import type { TourSeg } from '../../levels/tour';

// up the Charminar's steps, and the boat on Hussain Sagar
/** the welcome tour's pieces (HYD-01) */
export const course: TourSeg[] = [{ k: 'parked', x: 12 }, { k: 'wall', x: 24 }, { k: 'steps', x: 32, n: 5, run: 1, top: 4 }, { k: 'ditch', x: 54, w: 2 }, { k: 'ferry', x: 66, w: 11, kind: 'odam', wet: true }, { k: 'posts', x: 84, n: 2 }];
