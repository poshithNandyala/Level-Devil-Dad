import type { TourSeg } from '../../levels/tour';

/** the welcome tour's pieces (PAT-01): the ditch by Gandhi Maidan, the steps, litti-stall posts, a parked cart, a low wall */
export const course: TourSeg[] = [{ k: 'ditch', x: 12, w: 2 }, { k: 'steps', x: 22, n: 2, run: 2, top: 3 }, { k: 'posts', x: 38, n: 3 }, { k: 'parked', x: 52 }, { k: 'wall', x: 91 }];
