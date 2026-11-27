# Integration E: guard tests name no city's keys

**develop: 219e3b9** (one commit on bc76d83), pushed once (`bc76d83..219e3b9`). Only `tests/modules.test.ts` and
`tests/allocation.test.ts` changed (19+/7-). No game code and no version bump.

## What was hardcoded, and what it reads now

| where | was | now |
| --- | --- | --- |
| `tests/modules.test.ts` "install refuses a key another city already uses" (was L137) | ending kind `'knock'` (TVM's) as the already-used key, regex `/ending kind 'knock'/` | `owner = CITY_MODULES.find(m => has endings)`, `[usedEnding] = Object.keys(owner.endings)`; expects a throw matching `new RegExp("ending kind '" + escaped usedEnding + "'")` |
| same test | throwaway module ids `SXR`, `JMU`, `DDN`, `SML`, `CHP` and scene feature `'sml-ridge'` | the first five chapter ids with no module yet (`CHAPTERS` minus `CITY_MODULES`), and a feature `<that id>-test-feature`. Once SML or SXR is built, install would skip an id that is already installed and the test would break, so these were city-owned in effect |
| `tests/allocation.test.ts` "knows the shipped endings" (L221-222) | `toContain('dahihandi')` (BOM), `toContain('ulta')` (RNC) | every ending key of every shipped city's module (from `CITY_MODULES`) must be in the shipped set, and there is at least one. The test still checks `toContain('crush')` from the shared `OldTwist` union |

Kept as they are, because they are shared keys or fixture data, not a city's:
- `'spikes'`: a shared death cause (`src/game/entities/props.ts` CAUSE_LINES, the base table).
- `'crate'`: a built-in thing kind (`src/render/art/things.ts` SIZE, `BaseThingKind`).
- `tests/allocation.test.ts` L201/207, `['dahihandi', 'knock']` and `lko-dahi-handi`: inputs to the made-up-stages
  self-test of `endingProblems()`. They are passed in, not read from the game, so a rename can't break them.
- `'awning'` in `tests/chunks.test.ts:37` and `tests/chunks.ts:128`: the shared troll-section `ChunkKind`. That
  it shares a name with PDY's awning thing is a coincidence.

## Other city-owned literals in shared tests (left alone, on purpose)

I collected every city-owned key from the registry (165 ending, cause, thing and scene-feature keys) and
grepped all quoted literals in `tests/*.ts` and `tests/frozen/*.ts`:

- `tests/solutions.ts` (and its frozen copy `tests/frozen/v0.16.13.ts`):
  - TVM `drenched` (a MISTAKES cause), `net`, `parunthu`, `snakeboat`;
  - CHN `ball`, HYD `cannonball`, BLR `coracle`, AMR `stalactite`, PDY `surfboard` (20x), KVT `tuna`.
  These are inside route predicates (`thingOf(w, 'snakeboat')`, `e.kind === 'net'`).
- `tests/west.ts:256`: DMN cause `moored` in an act route.

These are the city's own play data, not guard tests. A city that renames one of these keys replaces the
affected entry from its own `tests/cities/<code>.ts`, which wins over the shared tables. I did not edit them.

**A watch-point for the passes:** `tests/stale.test.ts` plays the frozen TVM routes, which name TVM's thing
kinds, and expects them to die. If TVM renames `net`, `parunthu` or `snakeboat`, a frozen route could throw
on an undefined thing instead of dying, and the TVM worker cannot edit that shared file. If that happens,
the integrator should update the frozen file's key strings (a data rename, not a gameplay change).

`fair-gnr07.test.ts` has no city-owned key literal (only an import path, rewritten by the migration).

Also noticed, not changed (outside this item): `tests/ten-stages.test.ts` uses `LEH` and `SXR` as throwaway
module ids. It will break when LEH or SXR is built, the same way. It is one line to switch to the
unbuilt-chapter pick used above.

## Gates on 219e3b9

| gate | result |
| --- | --- |
| `npm run typecheck` | clean |
| `npm test` | 18 files passed, 12 skipped; **1470 passed, 0 failed, 12 skipped (1482)**, the same as bc76d83; frozen green |

## CI on 219e3b9 (GitHub API)

| workflow | result |
| --- | --- |
| Android APK | completed, **success** (run 45907987301) |
| Test APK | completed, **success** (run 45907987407); release `test` = "Test APK v0.16.14 (develop 219e3b9)" |
