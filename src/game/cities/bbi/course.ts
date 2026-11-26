import type { TourSeg } from '../../levels/tour';

/** the welcome tour's pieces (BBI-01): a ditch, the cave-hill steps, bollards, a parked cart */
export const course: TourSeg[] = [{ k: 'ditch', x: 10, w: 2 }, { k: 'steps', x: 40, n: 2, run: 2, top: 3 }, { k: 'posts', x: 52, n: 3 }, { k: 'parked', x: 84 }];
