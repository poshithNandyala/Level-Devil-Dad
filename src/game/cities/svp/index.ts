// Sri Vijaya Puram (Andaman and Nicobar Islands) as a city module. Scaffolded by scripts/dev/new-city.mjs: replace every TODO.
// Recipe: docs/CITY-MODULE.md. Found by src/game/cities/registry.ts; nothing to register.
import type { CityModule } from '../module';
import { lines } from './lines';
import { levels } from './levels';
import { endings } from './endings';
import { causeLines } from './causes';
import { skin } from './skin';
import { course } from './course';
import { music } from './music';
import { theme } from './theme';
import { cityLine, grade, tileCaps } from './look';
import { backdrop } from './backdrop';
import { things } from './things';

export const SVP: CityModule = {
  id: 'SVP',
  lines,
  levels,
  endings,
  causeLines,
  skin,
  course,
  cityLine,
  music,
  theme,
  grade,
  tileCaps,
  backdrop,
  things,
};
