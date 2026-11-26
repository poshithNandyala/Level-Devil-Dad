import type { TourSeg } from '../../levels/tour';

// a ride on the local over the nala
/** the welcome tour's pieces (BOM-01) */
export const course: TourSeg[] = [{ k: 'posts', x: 12, n: 3 }, { k: 'ditch', x: 24, w: 2 }, { k: 'parked', x: 34 }, { k: 'ferry', x: 46, w: 16, kind: 'traincar', wet: true, label: 'CHURCHGATE' }, { k: 'wall', x: 70 }, { k: 'steps', x: 78, n: 2, run: 2, top: 2 }];
