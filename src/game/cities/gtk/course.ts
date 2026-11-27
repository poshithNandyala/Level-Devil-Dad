import type { TourSeg } from '../../levels/tour';

/** the welcome tour's pieces (GTK-01): stairs between the loops, the little ropeway shuttle over a jhora, kerb posts, the ropeway shuttle, a parked share-jeep; MG Marg's sweepers are the tour's own (s01.ts) */
export const course: TourSeg[] = [{ k: 'steps', x: 6, n: 3, run: 2, top: 2 }, { k: 'ferry', x: 21, w: 10, kind: 'cablecar', label: 'DEORALI' }, { k: 'posts', x: 43, n: 3 }, { k: 'ferry', x: 62, w: 20, kind: 'cablecar', label: 'ROPEWAY' }, { k: 'parked', x: 90 }];
