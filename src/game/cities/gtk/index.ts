// Gangtok (Sikkim) as a city module: ten stages from MG Marg to Kanchenjunga. Recipe: docs/CITY-MODULE.md.
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

export const GTK: CityModule = {
  id: 'GTK',
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
