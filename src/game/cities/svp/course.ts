import type { TourSeg } from '../../levels/tour';

/** the welcome tour's pieces (SVP-01): the jetty bollards, the hill steps, a rickshaw-less lane (the sheet flow is
 *  painted in levels.ts), a cart on the road and the ship to the next island at the end */
export const course: TourSeg[] = [{ k: 'posts', x: 10, n: 3 }, { k: 'steps', x: 20, n: 2, run: 2, top: 3 }, { k: 'parked', x: 68 }, { k: 'ferry', x: 76, w: 14, kind: 'ferry', wet: true, label: 'HAVELOCK' }];
