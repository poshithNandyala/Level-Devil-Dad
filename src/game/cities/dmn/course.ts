import type { TourSeg } from '../../levels/tour';

// the jetty bollards, the ferry from Nani to Moti Daman, and the fort steps
/** the welcome tour's pieces (DMN-01) */
export const course: TourSeg[] = [{ k: 'posts', x: 12, n: 3 }, { k: 'ditch', x: 26, w: 2, wet: true }, { k: 'ferry', x: 38, w: 18, kind: 'ferry', wet: true, label: 'MOTI DAMAN' }, { k: 'wall', x: 64, w: 2 }, { k: 'steps', x: 74, n: 3, run: 2, top: 3 }];
