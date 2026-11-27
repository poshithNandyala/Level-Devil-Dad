// Proven routes for Imphal: every stage's room, its acts and its door, plus the plays that must die.
// Found by tests/city-tests.ts; merged into SOLUTIONS, NAIVE, FIX, MISTAKES, ACT_ROUTES and ENDING_POLICIES.
// tests/modules.test.ts fails until every table is filled. Scaffolded by scripts/dev/new-city.mjs.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import { Step, X, and, ground } from '../runner';
import type { CityTests } from '../city-tests';

type Out = { move: 'L' | 'R' | ''; jump: boolean };
type Policy = (w: World, m: { hold: number; [k: string]: any }, d: Door) => Out;
void X;
void and;
void ground;

/** S['IMP-0n'] = room route; lengthen(id, drop, extra) appends each act's route and the door's policy */
function solutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  // TODO: one per stage, eg.
  // S['IMP-02'] = [{ hold: 'R', until: and(ground, X(28)), max: 600, note: '...' }];
  // lengthen('IMP-02', 0, []);
  void S;
  void lengthen;
}

/** the obvious play per stage, and the cause it must die of (every stage, 01-10). TODO */
const naive: Record<string, { steps: Step[]; cause?: string }> = {};

/** the obvious correction after the first death, which dies too (at least 5 of 10). TODO */
const fix: Record<string, { steps: Step[]; cause?: string }> = {};

/** more scripted first-timer deaths and 'like last time' moves. TODO */
const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {};

/** a route for each act, by act id ('imp02-...'). TODO */
const actRoutes: Record<string, (x: number) => Step[]> = {};

/** a policy for each door ending, by kind ('imp-...'). TODO */
const endingPolicies: Record<string, Policy> = {};

export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  // TODO: at least every long, marathon and wtf stage
  fair: [],
};
