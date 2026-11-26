import type { TourSeg } from '../../levels/tour';

// over the dug-up road on the metro shuttle
// (the dug-up road after the metro is the city's own: a smart bridge over it, see blr.ts)
/** the welcome tour's pieces (BLR-01) */
export const course: TourSeg[] = [{ k: 'wall', x: 12 }, { k: 'steps', x: 22, n: 2, run: 2, top: 3 }, { k: 'parked', x: 40 }, { k: 'ferry', x: 52, w: 12, kind: 'traincar', label: 'NAMMA METRO' }, { k: 'posts', x: 82, n: 2 }];
