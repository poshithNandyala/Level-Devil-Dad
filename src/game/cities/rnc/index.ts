// Ranchi (Jharkhand) as a city module: the worked example for docs/CITY-MODULE.md.
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
import { ranchi } from './backdrop';
import { things } from './things';

export const RNC: CityModule = {
  id: 'RNC',
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
  backdrop: ranchi,
  things,
};
