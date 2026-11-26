import type { TourSeg } from '../../levels/tour';

/** the welcome tour's pieces (PNJ-01) */
export const course: TourSeg[] = [{ k: 'stones', x: 12, n: 3, wet: true }, { k: 'wall', x: 30 }, { k: 'ferry', x: 40, w: 18, kind: 'ferry', wet: true, label: 'BETIM' }, { k: 'parked', x: 66 }, { k: 'steps', x: 76, n: 3, run: 2, top: 2 }];
