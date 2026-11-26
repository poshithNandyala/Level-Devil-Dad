import type { TourSeg } from '../../levels/tour';

/** the welcome tour's pieces (RNC-01) */
export const course: TourSeg[] = [{ k: 'ditch', x: 12, w: 2 }, { k: 'steps', x: 24, n: 3, run: 2, top: 3 }, { k: 'posts', x: 44, n: 3 }, { k: 'parked', x: 62 }, { k: 'ferry', x: 76, w: 14, kind: 'traincar', label: 'RANCHI JN' }];
