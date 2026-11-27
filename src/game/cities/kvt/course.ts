import type { TourSeg } from '../../levels/tour';

// coral heads across the lagoon, and the jetty steps
/** the welcome tour's pieces (KVT-01) */
export const course: TourSeg[] = [{ k: 'stones', x: 13, n: 4, wet: true }, { k: 'wall', x: 36 }, { k: 'parked', x: 48 }, { k: 'steps', x: 60, n: 2, run: 2, top: 6 }, { k: 'ditch', x: 82, w: 2, wet: true }];
