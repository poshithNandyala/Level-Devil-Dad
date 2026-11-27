# Infra round 3

Repo: /local/home/saiposh/personal/level-devil-dad, branch `develop`.
**Pushed develop: bbcc965** (bbcc96552fe7fa28cfadcb46df8d2b5a46f3a569), `d44918b..bbcc965`, one push. No version bump.

## Commits (oldest first, on d44918b)

| sha | what |
| --- | --- |
| d668b02 | Scaffold: npm run new-city, and a fairness script per city with per-stretch rates |
| 5aa5534 | Docs: INTEGRATION.md for builders and the integrator, scaffold and fair script in CITY-MODULE.md |
| 4e765fb | Frozen behaviour snapshot of the 15 shipped cities, with a re-freeze command |
| b3dd1f1 | Allocation guard test and stage meta, documented |
| bbcc965 | Shipped cities: one route file each, merged last so it replaces the shared entries |

## Tests and checks

| | before (d44918b) | after (bbcc965) |
| --- | --- | --- |
| `npm run typecheck` | clean | clean |
| `npm test` | 1169 passed, 12 skipped (1181) | **1309 passed, 0 failed, 13 skipped (1322)** |
| `npm run build:single` + `node scripts/flows.mjs` | ok | ok, "no errors" |

The +140 tests break down as 136 frozen-behaviour tests, 4 allocation-checker tests and 1 new guard check
per module city. The 13th skip is the allocation file check, which skips because docs/allocation.json is
not there yet (see point 4).

## CI on bbcc965 (GitHub API)

| workflow | result |
| --- | --- |
| Android APK | completed, success (run 45899114503) |
| Test APK | completed, success (run 45899114552); release `test` = "Test APK v0.16.14 (develop bbcc965)", target bbcc965 |
| Pages, iOS | not triggered on develop (main only), as set in round 2 |

## What changed, by point

1. **Scaffold and fairness script.**
   - `npm run new-city -- PAT "Patna" "Bihar"` (`scripts/dev/new-city.mjs`) checks the code is a chapter
     and a CityId, refuses to overwrite, and writes 13 files in `src/game/cities/pat/` plus
     `tests/cities/pat.ts`. The files are index, lines (9 intros), levels (tour 01 + nine `todoRoom()` long
     stages 02-10), entities, endings (`declare module`, no kinds yet), causes, skin, course, music, theme,
     look, backdrop and things (`pat-item` placeholder). The test file stubs solutions, naive, fix,
     mistakes, actRoutes, endingPolicies and fair. Every placeholder says TODO.
   - It registers nothing; the glob finds the folder.
   - Verified on a throwaway PAT, then deleted: the scaffold typechecks, and `tests/modules.test.ts -t PAT`
     fails 5 ways (NAIVE, FIX, hidden item, fair list, and the new "no TODO left" check).
   - `npm run fair -- PAT` (`scripts/dev/fair.sh`; the test moved from `tests/fair-rnc.test.ts` to
     `tests/fair.test.ts`) runs the human-timing model over one city (`LDD_CITY`) or given ids
     (`PAT-02,PAT-05`). Per stage it prints quick/average/relaxed win rates. Per stretch (spawn ->
     checkpoint 1 -> ... -> door) it prints the share of average-lag runs that got through once they
     reached it, against a 95% bar. Example: `RNC-05: 6t 100% 12t 75% 18t 75% ... stretches: s0 100% s1
     100% s2 75% door 100%` (LDD_N=4).
   - Both are documented in docs/CITY-MODULE.md ("Start a city", "The fairness script").
2. **docs/INTEGRATION.md.** It covers:
   - The builder rules: worktree `/local/home/saiposh/personal/ldd-wt/<code>` on `city/<code>` from
     develop; edit only the city folder, `tests/cities/<code>.ts`, `docs/cities/<CODE>*.md` and the city's
     own CITIES.md row; never push, never bump the version.
   - The builder commands.
   - The integrator steps with exact commands: check own-paths per branch, merge `--no-ff` in journey
     order (only CITIES.md may conflict), then typecheck, full tests, build:single, flows and fairness on
     the merged tree, one version bump per wave, one publish of develop, the CI read via the API, the
     report and worktree cleanup.
   - `ui/hint-home` is marked "do not merge yet".
3. **Shipped cities' tests and the frozen snapshot.**
   - **Frozen:** `tests/frozen-behaviour.test.ts` compares every shipped stage with
     `tests/cities/_frozen/<code>.json` (15 files, 120 stages). Each entry holds par, hidden item tile,
     checkpoint columns, the route's outcome and win tick, and the NAIVE and FIX outcome, death tick and
     cause.
   - It also asserts every shipped city has a frozen file.
   - Re-freeze on purpose with `npm run refreeze -- TVM` (`scripts/dev/refreeze.sh`; `TVM,KVT` or `all`
     also work). It prints the diff stat.
   - **Per-city files:** `tests/cities/<code>.ts` now exists for all 15 shipped cities (RNC holds its
     routes; the other 14 are empty, typed tables). `tests/solutions.ts`, `acts.ts` and `endings.ts` merge
     every city file LAST, so a shipped city's file replaces that stage's route, NAIVE, FIX or MISTAKES
     entry, act route or ending policy. NAIVE and MISTAKES now merge last too (before, NAIVE was spread
     first and MISTAKES appended); nothing changes today because no keys overlap.
   - A hardness-pass worker owns the city's stage files plus one test file, and never edits a shared test
     file.
4. **Allocation guard.**
   - `tests/allocation.test.ts` reads `docs/allocation.json`. The allocator's file
     (`/local/home/saiposh/personal/ldd-inbox/docs/allocation.json`) did not exist when I checked, twice,
     the last time after the push. So the file check skips, with the message "no docs/allocation.json yet:
     copy it from /local/home/saiposh/personal/ldd-inbox/docs/allocation.json".
   - `allocationProblems()` checks:
     - all 36 chapters are present;
     - `slots` and `reserves` are arrays;
     - 10 slots per new city, 8 or 10 (encore) per shipped city, indices 1..n;
     - each slot has a shape, concept and family;
     - no (family, betrayal) pair appears twice anywhere;
     - no family is under two cities;
     - no betrayal appears twice within one city.
   - `metaProblems()` checks that every built module stage's `meta` equals its slot (family, and
     betrayals as a set).
   - Both run now against a made-up 36-city allocation (clean, four planted faults, a drifted stage).
   - **Meta:** `LevelDef.meta?: StageMeta { family, betrayals }` (`src/game/world.ts`), set with
     `longStage({ ..., meta })` or `{ ...tour(...), meta }`, and documented in CITY-MODULE.md "Stage meta".
     RNC is on `NO_META` (TODO) until its pass.

## How a builder starts a city, in five commands

```bash
git -C /local/home/saiposh/personal/level-devil-dad worktree add -b city/pat /local/home/saiposh/personal/ldd-wt/pat develop
cd /local/home/saiposh/personal/ldd-wt/pat && source /local/home/saiposh/personal/games/_template/scripts/env.sh && npm ci
npm run new-city -- PAT "Patna" "Bihar"
npx vitest run tests/modules.test.ts -t PAT      # the TODO list: fails until the city is real
npm run fair -- PAT                              # once routes exist: 90% per stage, 95% per stretch
```

## Not done / gaps

- **Point 3, moving the 15 cities' existing routes out of the shared files: not done.** The plays for the
  14 older cities still live in `tests/solutions.ts` (1645 lines), `tests/west.ts` (2730), `tests/acts.ts`
  and `tests/endings.ts`. They are woven together: one SOLUTIONS literal holds every city's rooms, then an
  ordered run of `tourWith` / `lengthen` / `newDoor` calls shares helpers between cities, and MISTAKES reads
  SOLUTIONS after lengthen. Moving them while keeping every route identical is a large refactor that I did
  not fit safely into this round.
  - What landed instead: each city has its own file that wins over the shared tables, and the frozen
    snapshot fails on any accidental change. So the "one worker, one test file" rule holds for every new
    edit.
  - The old entries a worker replaces stay in the shared files as dead data. They can be deleted when the
    move is done, which is safe now that the frozen test guards it.
- **docs/allocation.json:** not in the repo yet. The checks are written and self-tested; copy the file into
  `docs/` when the allocator writes it.
- **RNC:** still 8 stages, and on the guard test's allow-list and on `NO_META`, as decided.
- **Replace behaviour:** no test proves that a shipped city's file replaces a shared entry; nothing uses it
  yet. The merge is plain `Object.assign`, applied last.
- **Playwright version:** flows.mjs still needs `CHROME_PATH` (cached Chromium 1228; Playwright wants 1254).
