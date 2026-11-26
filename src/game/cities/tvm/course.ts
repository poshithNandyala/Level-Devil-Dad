import type { TourSeg } from '../../levels/tour';

// a temple tank to walk down into, and a canoe across the canal
/** the welcome tour's pieces (TVM-01) */
export const course: TourSeg[] = [{ k: 'wall', x: 12 }, { k: 'ditch', x: 24, w: 2, wet: true }, { k: 'steps', x: 36, n: 2, run: 3, top: 4 }, { k: 'parked', x: 56 }, { k: 'ferry', x: 68, w: 10, kind: 'odam', wet: true }];
