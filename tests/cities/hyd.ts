// Hyderabad's own route file for the hardness pass. Its proven plays still live in the shared tables
// (tests/solutions.ts, tests/west.ts, tests/acts.ts, tests/endings.ts); anything set here is merged LAST and
// replaces that stage's (or act's, or ending's) entry there, so a hardness-pass worker edits only this file
// and the city's stage files. After a change on purpose: npm run refreeze -- HYD (docs/CITY-MODULE.md).
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import type { Step } from '../runner';
import type { CityTests } from '../city-tests';

type Out = { move: 'L' | 'R' | ''; jump: boolean };
type Policy = (w: World, m: { hold: number; [k: string]: any }, d: Door) => Out;

export const test: CityTests = {
  /** replace a stage's route: S['HYD-03'] = [...]; lengthen('HYD-03', 0, []) */
  solutions: (S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) => {
    void S;
    void lengthen;
  },
  naive: {} as Record<string, { steps: Step[]; cause?: string }>,
  fix: {} as Record<string, { steps: Step[]; cause?: string }>,
  mistakes: {} as Record<string, { what: string; steps: Step[]; cause?: string }[]>,
  actRoutes: {} as Record<string, (x: number) => Step[]>,
  endingPolicies: {} as Record<string, Policy>,
  fair: [],
};
