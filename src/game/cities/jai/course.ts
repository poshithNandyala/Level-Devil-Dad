import type { TourSeg } from '../../levels/tour';

/** the welcome tour's pieces (JAI-01) */
export const course: TourSeg[] = [{ k: 'posts', x: 12, n: 3 }, { k: 'steps', x: 26, n: 3, run: 2, top: 3 }, { k: 'parked', x: 46 }, { k: 'ferry', x: 56, w: 14, kind: 'traincar', label: 'PINK LINE' }, { k: 'ditch', x: 80, w: 2 }];
