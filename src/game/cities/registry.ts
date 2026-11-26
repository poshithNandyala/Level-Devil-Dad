// Every city built as a module, in journey order (docs/CITIES.md, "The journey").
// A new city adds exactly one line here (its import and its entry go on the same line).
import type { CityModule } from './module';
import { RNC } from './rnc';

export const CITY_MODULES: CityModule[] = [
  RNC,
];
