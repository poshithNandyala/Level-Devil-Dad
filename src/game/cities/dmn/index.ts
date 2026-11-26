// Daman (Dadra & Nagar Haveli and Daman & Diu) as a city module (moved out of the shared files; gameplay unchanged).
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
import { ambient } from './ambient';
import { daman } from './backdrop';
import { things } from './things';

export const DMN: CityModule = {
  id: 'DMN',
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
  ambient,
  backdrop: daman,
  things,
};
