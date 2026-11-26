import type { TourSeg } from '../../levels/tour';

// the pink city's bollards, Hawa Mahal's steps, the metro over the dug-up road
/** the welcome tour's pieces (RPR-01) */
export const course: TourSeg[] = [{ k: 'posts', x: 12, n: 3 }, { k: 'ditch', x: 26, w: 2 }, { k: 'steps', x: 40, n: 3, run: 2, top: 3 }, { k: 'ferry', x: 56, w: 14, kind: 'traincar', label: 'RAIPUR JN' }, { k: 'parked', x: 82 }];
