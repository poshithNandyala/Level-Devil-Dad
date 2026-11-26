import type { CityId } from '../game/constants';

/** one line per city on the postcard (moved out of app.ts so city modules can add theirs without loading the app) */
export const CITY_LINE = {
  RPR: 'Stilts over the paddy mud, a clock that only ticks when you move, and a hill of rice to climb.',
  BPL: 'Skip like a stone across the big lake, step in to a cave painting, and never believe Surma Bhopali.',
} as Record<CityId, string>;
