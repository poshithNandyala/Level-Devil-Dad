import type { TourSeg } from '../../levels/tour';

/** the welcome tour's pieces (CCU-01): kerbs, the Maidan steps, the tram stop's posts, a parked thela, the tram */
export const course: TourSeg[] = [{ k: 'ditch', x: 12, w: 2 }, { k: 'steps', x: 24, n: 3, run: 2, top: 3 }, { k: 'posts', x: 44, n: 3 }, { k: 'parked', x: 60 }, { k: 'ferry', x: 80, w: 12, kind: 'ccu-tram', label: 'ESPLANADE' }];
