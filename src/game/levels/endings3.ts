// Door endings for the western chapters (Goa onwards). Same rules as endings.ts: one per stage, never
// shared, and each keeps w.flags.twist up to date for the test policies.
import { type World } from '../world';
import { DT } from '../constants';
import { pool } from './acts';
import { type Ending } from './endkit';
import { aunty, poderArt } from './westkit';

export type WestEndingKind =             never;

/** time within a repeating cycle */
export const cyc = (w: World, period: number, phase = 0) => ((((w.tick * DT - phase) % period) + period) % period);

export const WEST_ENDINGS: Record<WestEndingKind, Ending> = {











};
