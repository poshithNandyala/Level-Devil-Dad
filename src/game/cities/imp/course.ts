import type { TourSeg } from '../../levels/tour';

/** the welcome tour's pieces (IMP-01): a ditch, the steps up to Kangla's rampart road, posts, a parked bicycle rickshaw.
 * Columns 52-76 are left free for the tour's own bite (the east gate and the moat, s01.ts). */
export const course: TourSeg[] = [
  { k: 'ditch', x: 12, w: 2 },
  { k: 'steps', x: 24, n: 2, run: 2, top: 3 },
  { k: 'posts', x: 40, n: 3 },
  { k: 'parked', x: 82 },
];
