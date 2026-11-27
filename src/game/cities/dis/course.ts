import type { TourSeg } from '../../levels/tour';

/** the welcome tour's pieces (DIS-01): bollards on the riverfront, a ditch, the Umananda ghat steps. The promenade (cols 62-92) is the tea boy's. */
export const course: TourSeg[] = [{ k: 'posts', x: 10, n: 3 }, { k: 'ditch', x: 24, w: 2 }, { k: 'steps', x: 34, n: 2, run: 2, top: 3 }, { k: 'parked', x: 54 }];
