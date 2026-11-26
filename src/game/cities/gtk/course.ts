import type { TourSeg } from '../../levels/tour';

/** the welcome tour's pieces (GTK-01): stairs between the loops, kerb posts, a parked share-jeep; MG Marg's sweepers are the tour's own (s01.ts) */
export const course: TourSeg[] = [{ k: 'steps', x: 10, n: 3, run: 2, top: 2 }, { k: 'posts', x: 50, n: 3 }, { k: 'parked', x: 80 }];
