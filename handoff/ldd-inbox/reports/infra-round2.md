# Infra round 2 (review W0)

Repo: /local/home/saiposh/personal/level-devil-dad, branch `develop`.
**develop head: d44918b** (d44918b3548c05e5fb9ed2f5e718a26ecc5bfe37), pushed with `git push origin develop`
(`f2e7676..d44918b  develop -> develop`). `main` was not touched.

## Commits (oldest first, on f2e7676)

| sha | what |
| --- | --- |
| 9fa44b4 | Registry: find city modules by folder, in journey order |
| cf3316a | Modules: refuse colliding keys, merge mistakes, guard test for the city bar, unique act ids |
| 2f8c0a8 | Ten stages: Tara lines index safely, flows script stage ids |
| 0f52c76 | Long stages: lives act option for the 7th death, hint parts by stretch |
| c1911fc | CI: Pages and iOS on main only; test APK title names the branch and sha |
| d44918b | Docs: new cities and hardness pass together, 10 stages, builders never push, module recipe updated |

Commit cf3316a's guard test reads `LevelDef.shape`, which is only added in 0f52c76. So cf3316a on its own
does not typecheck, but every commit from 0f52c76 on does. Nothing was rewritten after the push.

## Checks on d44918b

| check | result |
| --- | --- |
| `npm run typecheck` | clean |
| `npm test` | 16 files passed, 12 skipped; **1169 passed, 0 failed, 12 skipped** (1181), 17 s. Was 1152 / 12 skipped; the +17 are tests/modules.test.ts and tests/lives.test.ts (17 together) |
| `npm run build:single` | ok; the eager glob is inlined |
| `node scripts/flows.mjs` | "no errors" (with `CHROME_PATH` at the cached headless shell 1228; the installed Playwright wants 1254) |
| in the built file | `startStage('RNC-05')` plays RNC-05, no page errors (the module is found by the glob in the single file too) |

The 12 skipped tests are the same env-gated tool files as before.

## CI on d44918b (GitHub API, read 21:22 UTC)

| workflow | result |
| --- | --- |
| Android APK | completed, success (runs/45897224317) |
| Test APK (sideload, rolling "test" release) | completed, success (runs/45897224428). Release `test` is now titled **"Test APK v0.16.14 (develop d44918b)"**, target d44918b |
| Web build on GitHub Pages | not triggered on develop (main only now), as intended |
| iOS build check | not triggered on develop (main only now), as intended |

The previous sha f2e7676 had all four green.

## What each point became

1. **A3, registry by folder.** `src/game/cities/registry.ts:6` runs `import.meta.glob('./*/index.ts', { eager: true })`.
   Each `index.ts` must export exactly one CityModule (it throws otherwise, `:16-19`). Modules are sorted by
   their position in `CHAPTERS` (`:8-12`, `:21`), and an unknown id throws. `tsc` accepts the glob through
   `src/env.d.ts`, the single-file build inlines it, and tests still find modules
   (`tests/modules.test.ts` "are found by folder, in journey order"). `docs/CITY-MODULE.md` now says
   "No registry line: drop your folder in". A builder edits no shared file.
2. **A2, collisions.**
   - `src/game/cities/install.ts:26` `addAll()` throws on a duplicate key for ending kinds (`:45`), death
     causes (`:46`) and scene features (`:56`).
   - Thing kinds are checked against both the built-ins (`BASE_THING_SIZE`, `src/render/art/things.ts`) and
     other modules (`:58`). Stage ids and wrong-city stages still throw.
   - The error message names the prefix to use.
   - `tests/modules.test.ts` "act ids are unique across the whole game" collects every non-chunk part kind
     across `LEVELS`. "install refuses a key another city already uses" covers cause, thing, ending and
     scene feature.
   - Prefix rule in CITY-MODULE.md: every new key starts with the city code in lower case (`pat-`, acts
     `pat02-`). The guard test enforces it per module, with RNC excused.
3. **A4 + A5, proofs.**
   - `mistakes?` was added to `CityTestsShape` (`src/game/cities/module.ts:72`, same record type as
     MISTAKES). It is merged in `tests/solutions.ts:1645`.
   - `tests/city-tests.ts` now also exports `CITY_TESTS_BY_ID` (keyed by file name).
   - The guard test is `tests/modules.test.ts`. For every module city it checks:
     - a test file exists;
     - stages are exactly XXX-01..10 with index 1..10;
     - every stage has a NAIVE;
     - FIX exists for at least 5 stages;
     - each stage has exactly 1 hidden item (built);
     - every act has a route, and acts are prefixed;
     - every ending has a policy;
     - the `fair` list is non-empty, names every `shape` long/marathon/wtf stage and only real ids;
     - `intro` has at least 9 lines and `beaten` is non-empty;
     - endings, causes, things and scene features are prefixed.
   - RNC is excused by `EXEMPT` (`tests/modules.test.ts:26`) from these checks: ten, tour-naive, fix, intro
     and prefix. A TODO says to remove the entry after its hardness pass and never add a city to it. The
     test itself is not weakened.
4. **A6, ten stages beyond the regex.**
   - The `CityLines.intro` / `beaten` docs (`src/game/cities.ts:23-29`) say 9 intros for module cities,
     enforced by the guard test. The type stays `string[]`: a 9-tuple would break the 8-stage cities, and
     the test is what makes it mandatory.
   - rpr/bpl/rnc now index `intro[n % length]` and `beaten[b % length]` (`src/game/levels/rpr.ts:15`,
     `bpl.ts:16`, `cities/rnc/levels.ts:18`). tvm/chn/pdy/kvt/amr already used `n % length`. For every
     index in use today this gives the same line, so nothing changes in the game.
   - `scripts/flows.mjs:22` builds `'HYD-' + padStart(2)` (qashots.mjs and shots.mjs were fixed in round 1).
   - The fair-rnc default ids come from every module's `fair` list (round 1, `tests/fair-rnc.test.ts`).
   - No string sort of stage ids exists in src, tests or scripts. The only `.sort()` is on test file paths
     in city-tests.ts.
5. **C1, lives on long stages.**
   - New `LevelDef.lives?: 'stage' | 'act'` (`src/game/world.ts:58`) and `LevelDef.actStarts?: number[]`
     (`:60`, tile x of each act-start checkpoint, filled by longStage at `src/game/levels/chunks.ts:349`).
     `LongSpec.lives` and `LongSpec.shape` are at `chunks.ts:291-293`.
   - In `src/app/session.ts:80-91`, on the 7th death with `lives: 'act'` it keeps the saves up to the last
     act-start checkpoint passed and respawns there with full lives (log `wipe` gets `to`). Otherwise it
     behaves as before. The default is unchanged for every existing stage: no existing stage sets `lives`.
   - Test: `tests/lives.test.ts` drives a real Session with a stub app on a flat stage with 3 checkpoints.
     With the default, the 7th death goes to the start. With 'act', it goes to the act start at column 20.
     With 'act' but no act start passed yet, it goes to the start.
   - Documented in CITY-MODULE.md "Long and marathon stages": marathon at most 120 s once known, long
     60-80 s, a calm checkpoint at least every 25 s, 90% for the whole stage and 95% for every stretch
     between checkpoints.
   - `LevelDef.shape?: 'tour' | 'short' | 'long' | 'marathon' | 'wtf'` (`world.ts:53`) is also new, for the
     fair-list rule.
6. **E2.5, hint parts.** `hint` is kept (the same joined string). New fields on `LevelDef` (`world.ts:61-64`),
   filled by `longStage` (`chunks.ts:342-348`):
   - **`hintParts: string[]`**: [room hint, each troll-section advice, each act's advice, door advice].
     `hintParts.join(' ') === hint`.
   - **`hintAt: number[]`**: tile x where each part starts. It has the same length as `hintParts`. It
     starts at 0, then each section's or act's start column, and the door part starts at the door's
     checkpoint.
   - **`hintPartAt(def, xPx): number`** (`src/game/levels/chunks.ts:297`, exported): the index of the part
     Dad is in at world x (px). The UI calls `hintPartAt(session.def, session.world.player.cx)`.
   - Tours and plain rooms have no `hintParts`, so the UI should fall back to `[hint]`.
   - Tested in `tests/lives.test.ts` "hint parts" on RNC-05.
7. **D5, CI scope.** `pages.yml:7` and `ios.yml:8` are back to `[main]`. `android.yml:5` and
   `test-apk.yml:12` stay on `[main, develop]`. `test-apk.yml:62` is now titled
   `Test APK v$V ($GITHUB_REF_NAME ${GITHUB_SHA::7})`, and the header comment says main or develop.
8. **E2.6, docs.**
   - AGENTS.md: the job is new cities and the hardness pass together (the owner said go), 10 stages,
     CITY-MODULE.md is read first, builders commit on their own branch and never push or bump the version,
     and the integrator publishes develop.
   - HANDOFF.md: the status line says v0.16.14 on develop, 15 capitals, 120 stages, and points to
     CITY-MODULE.md. The test count is 1169. Section 5 points to CITY-MODULE.md (folder, no shared files).
   - CITIES.md header: 15 done / 120 stages, 21 to go, and the 10-stage shape for new cities.
   - CITY-MODULE.md: glob registry, the prefix rule, mistakes, the guard test, shape, lives and timing
     rules, hint parts, and "never push, never bump".
9. **Verify:** see the checks and CI above.

## Left / notes

- **RNC is still 8 stages** and is on the guard test's allow-list (TODO).
- **Old cities' 09-10:** the reviewer's A6 decision (encore after the old finale vs renumbering with a save
  migration) is not made here. No existing city's ids changed.
- **CityLines type:** intro/beaten stay `string[]`. The 9-line minimum is enforced by the test, not by the
  type.
- **Playwright version:** flows.mjs still needs `CHROME_PATH`, because Playwright wants Chromium 1254 and
  only 1228 is cached.
- **Push note:** a doc-edit command was refused by the host's push rule, because its heredoc contained the
  literal text of a push command. I rewrote the edit as a script file. The AGENTS.md text therefore says
  "publishes `develop`" instead of quoting the command.
