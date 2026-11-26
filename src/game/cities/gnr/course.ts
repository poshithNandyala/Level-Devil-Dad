import type { TourSeg } from '../../levels/tour';

/** the welcome tour's pieces (GNR-01) */
export const course: TourSeg[] = [{ k: 'posts', x: 12, n: 4 }, { k: 'steps', x: 28, n: 2, run: 2, top: 3 }, { k: 'parked', x: 44 }, { k: 'ferry', x: 54, w: 16, kind: 'traincar', wet: true, label: 'BRTS' }, { k: 'ditch', x: 78, w: 2 }];
