import type { CityId } from '../game/constants';

/** one line per city on the postcard (moved out of app.ts so city modules can add theirs without loading the app) */
export const CITY_LINE = {
} as Record<CityId, string>;
