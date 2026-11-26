import type { TourSeg } from '../../levels/tour';

/** the welcome tour's pieces (BPL-01) */
export const course: TourSeg[] = [{ k: 'steps', x: 12, n: 3, run: 2, top: 3 }, { k: 'posts', x: 28, n: 3 }, { k: 'ditch', x: 44, w: 2 }, { k: 'ferry', x: 54, w: 14, kind: 'traincar', label: 'BHOPAL JN' }, { k: 'parked', x: 80 }];
