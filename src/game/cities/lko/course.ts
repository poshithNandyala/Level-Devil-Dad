import type { TourSeg } from '../../levels/tour';

/** the welcome tour's pieces (LKO-01): a ditch by the Rumi Darwaza, the steps up to the old gate, Hazratganj's
 *  bollards, a thela in the road, a low garden wall; Chowk's cloth bolts are the tour's own (s01.ts) */
export const course: TourSeg[] = [
  { k: 'ditch', x: 12, w: 2 },
  { k: 'steps', x: 20, n: 2, run: 2, top: 3 },
  { k: 'posts', x: 64, n: 3 },
  { k: 'parked', x: 80 },
  { k: 'wall', x: 88 },
];
