// Gandhinagar (Gujarat) as a city module (moved out of the shared files; gameplay unchanged).
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
import { gandhinagar } from './backdrop';
import { things } from './things';

export const GNR: CityModule = {
  id: 'GNR',
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
  backdrop: gandhinagar,
  things,
};
