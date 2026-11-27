// Kohima (Nagaland) as a city module. Recipe: docs/CITY-MODULE.md. Found by src/game/cities/registry.ts; nothing to register.
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

export const KOH: CityModule = {
  id: 'KOH',
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
