import type { TourSeg } from '../../levels/tour';

// French bollards in a row, a canal, and the café terrace
// (no wall after the terrace: the street from there to the canal is where the policeman's cap blows down)
/** the welcome tour's pieces (PDY-01) */
export const course: TourSeg[] = [{ k: 'posts', x: 12, n: 5 }, { k: 'ditch', x: 32, w: 2, wet: true }, { k: 'parked', x: 44 }, { k: 'steps', x: 52, n: 1, run: 2, top: 10 }, { k: 'ditch', x: 86, w: 2 }];
