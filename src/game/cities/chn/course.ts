import type { TourSeg } from '../../levels/tour';

// the auto stand, then up and down a gopuram's tiers, and the beach lamp posts
/** the welcome tour's pieces (CHN-01) */
export const course: TourSeg[] = [{ k: 'parked', x: 14 }, { k: 'ditch', x: 26, w: 2 }, { k: 'steps', x: 36, n: 4, run: 2, top: 4 }, { k: 'posts', x: 64, n: 3 }, { k: 'wall', x: 80, w: 2 }];
