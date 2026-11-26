import type { CityId } from '../game/constants';

/** one line per city on the postcard (moved out of app.ts so city modules can add theirs without loading the app) */
export const CITY_LINE = {
  BOM: 'The platform moves. The train stays still. Mostly.',
  GNR: 'A bamboo to vault on, a dinosaur that stomps, and a garba ring to slip through.',
  JAI: 'Puppet strings, a marble bowl to swing out of, a horse that won’t stop, and an elephant with a trunk.',
  RPR: 'Stilts over the paddy mud, a clock that only ticks when you move, and a hill of rice to climb.',
  BPL: 'Skip like a stone across the big lake, step in to a cave painting, and never believe Surma Bhopali.',
  DMN: 'Boats you pedal by running, ice that melts under you, and a whole boatyard passing you along.',
} as Record<CityId, string>;
