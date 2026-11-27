import type { TourSeg } from '../../levels/tour';

/** the welcome tour's pieces (GTK-01): stairs between the loops, stepping stones over a jhora, kerb posts, the ropeway shuttle, a parked share-jeep; MG Marg's sweepers are the tour's own (s01.ts) */
export const course: TourSeg[] = [{ k: 'steps', x: 8, n: 3, run: 2, top: 2 }, { k: 'stones', x: 20, n: 2 }, { k: 'posts', x: 42, n: 3 }, { k: 'ferry', x: 62, w: 20, kind: 'cablecar', label: 'ROPEWAY' }, { k: 'parked', x: 90 }];
