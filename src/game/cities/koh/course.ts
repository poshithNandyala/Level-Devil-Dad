import type { TourSeg } from '../../levels/tour';

/** the welcome tour's pieces (KOH-01): a lane ditch, the lane stairs (the rolling rod is painted at their top), a line of posts, a parked cart, a low wall */
export const course: TourSeg[] = [{ k: 'ditch', x: 12, w: 2 }, { k: 'steps', x: 22, n: 2, run: 2, top: 3 }, { k: 'posts', x: 38, n: 3 }, { k: 'parked', x: 52 }, { k: 'wall', x: 88 }];
