import type { TourSeg } from '../../levels/tour';

/** the welcome tour's pieces (SHL-01): a roadside drain by Police Bazaar, the steps up to Ward's Lake, the taxi-stand posts, a parked shared taxi, a low stone wall at the view point */
export const course: TourSeg[] = [{ k: 'ditch', x: 12, w: 2 }, { k: 'steps', x: 22, n: 2, run: 2, top: 3 }, { k: 'posts', x: 38, n: 3 }, { k: 'parked', x: 52 }, { k: 'wall', x: 88 }];
