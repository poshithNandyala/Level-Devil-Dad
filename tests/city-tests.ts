/// <reference types="vite/client" />
// Every city module's test data: each tests/cities/<code>.ts exports `test: CityTests`. Found by file name,
// so a new city adds nothing here. solutions.ts, acts.ts and endings.ts merge them in.
import type { CityTestsShape } from '../src/game/cities/module';
import type { World } from '../src/game/world';
import type { Door } from '../src/game/entities/basics';
import type { Step } from './runner';

type Out = { move: 'L' | 'R' | ''; jump: boolean };
export type CityTests = CityTestsShape<Step, (w: World, m: any, d: Door) => Out, (x: number, p: any) => Step[]>;

const found = import.meta.glob<{ test: CityTests }>('./cities/*.ts', { eager: true });
export const CITY_TESTS: CityTests[] = Object.keys(found)
  .sort()
  .map((k) => found[k].test);
