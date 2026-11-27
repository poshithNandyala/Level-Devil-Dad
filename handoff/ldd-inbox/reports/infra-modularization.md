# Infra: city modules, RNC as the worked module, 10 stages, CI on develop

Repo: /local/home/saiposh/personal/level-devil-dad, branch `develop` cut from `main` 4e159d9 (v0.16.14).
Pushed: `git push -u origin develop` succeeded (new branch, `develop -> develop`); origin/develop = f2e7676.
`main` was not touched or pushed.

## Commits on develop (oldest first)

| sha | what |
| --- | --- |
| f54d45f | CityModule interface, registry and install; RNC is the first city module |
| 3fb7b3a | Ten stages per city: stage codes 01 to 10, a 10-stage module test |
| 1bdcd94 | CI: run on develop as well as main |
| f7a350d | Fairness check defaults to the city modules' fair lists |
| f2e7676 | Docs: CITY-MODULE.md, the recipe for building a city as a module (head) |

## Results

| check | baseline (main 4e159d9) | final (develop f2e7676) |
| --- | --- | --- |
| `npm run typecheck` | clean | clean |
| `npm test` | 13 files passed, 12 skipped; **1145 passed**, 12 skipped (1157); 18 s | 14 files passed, 12 skipped; **1152 passed**, 12 skipped (1164); 22 s |
| `npm run build:single` | (not run on baseline) | ok, dist-single/index.html 1.29 MB |
| `node scripts/flows.mjs` | (not run on baseline) | ok, "no errors" |

The 7 extra tests are `tests/ten-stages.test.ts`. The 12 skips are the same env-gated tool files as before.
The same 1145 tests pass, including all 8 RNC stages, which now come from the module.
Extra check: in the built single file, `startStage('RNC-05')` opened RNC-05 with Ranchi's backdrop, palette,
ground caps, hello card and the dhuska item drawn, and no page errors.

flows.mjs note: the installed Playwright wants chromium_headless_shell-1254, but only 1228 is cached. I ran it
with `CHROME_PATH=~/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell`.

## What the CityModule interface contains (src/game/cities/module.ts)

`id` (CityId), `lines` (CityLines), `chapter?` ({hello?, famous?}; default from lines), `levels`
(`() => LevelDef[]`), `endings` (Record kind -> Ending), `causeLines`, `skin` (Skin), `course` (TourSeg[]),
`cityLine`, `music` (MusicCfg), `theme` (Theme), `grade` (Grade), `tileCaps` (GroundCaps), `backdrop`
(`(ctx, th, x0, x1) => void`), `sceneFeatures?` (Record name -> draw), `things?` (Record kind -> {size, draw}).
The test side is `CityTestsShape` (in module.ts), with the concrete `CityTests` type in tests/city-tests.ts:
`solutions(S, lengthen)`, `naive`, `fix?`, `actRoutes`, `endingPolicies`, `fair?` (LDD_FAIR default ids).

## How it is wired, and one change from the brief

- `src/game/cities/registry.ts`: `CITY_MODULES = [RNC]`. A new city adds its import and its entry there.
  That is two lines in one file, not literally one.
- **Push instead of pull.** The brief asked each shared registry to consume `...fromModules()`. That cannot
  work: a module's stages import tour.ts, chunks.ts, cities.ts, endings.ts and props.ts, so if those files
  imported the registry there would be ES module import cycles, and their top-level tables would read the
  registry before it exists. Instead, `src/game/cities/install.ts` imports both the registry and the shared
  tables and adds each module to them: LINES, QUIPS, CHAPTERS (sets city, hello, famous; drops teasers),
  ENDINGS (throws on a duplicate kind), CAUSE_LINES, SKINS, COURSES, CITY_LINE, MUSIC, THEMES + CITY_ORDER,
  GRADES, tile CAP, MODULE_BACKDROPS, MODULE_SCENE_FEATURES, MODULE_THING_SIZE/DRAW. It does this last for
  LEVELS + LEVEL_BY_ID, and throws on a duplicate stage id or a wrong city. `src/main.ts` imports it first,
  and tests import it through the new `tests/setup.ts` (vite.config.ts `setupFiles`). The shared files still
  never change for a new city.
- `levels` is a thunk because `tour()` and `longStage()` read the city's course, skin and endings, which
  only exist after install.
- Open kinds without weakening types: `EndingKind = ... | keyof ModuleEndingKinds` and
  `ThingKind = BaseThingKind | keyof ModuleThingKinds`. A module adds its kinds with `declare module`
  (see rnc/endings.ts and rnc/things.ts), so `twist: 'ulta'` and `'dhuska'` are still type-checked.
  The built-in SIZE table is still `Record<BaseThingKind, ...>`, so it is still checked for completeness.
- `CityId` now lists all 36 stops in docs/CITIES.md journey order. The old `Record<CityId, X>` tables became
  `{...} as Record<CityId, X>` (LINES, SKINS, COURSES, THEMES, MUSIC, CITY_LINE).
- Tests: `tests/city-tests.ts` finds every `tests/cities/*.ts` with `import.meta.glob`, so the test side needs no
  registration. solutions.ts, acts.ts and endings.ts loop over it, and FIX is merged too.
- Small moves needed for this: CITY_LINE moved from app.ts to `src/app/citylines.ts`, so install doesn't load
  the app. Exports were added for CAUSE_LINES, MUSIC/MusicCfg, GRADES/Grade and CAP/GroundCaps. The default
  hooks are one `else if` in backgrounds.ts, a loop at the end of drawScene and a `default:` in drawThing.

## RNC as a module (src/game/cities/rnc/)

git mv (history kept): levels/rnc.ts -> rnc/levels.ts, entities/jharkhand.ts -> rnc/entities.ts,
levels/endings4.ts -> rnc/endings.ts, render/backdrops-east.ts -> rnc/backdrop.ts, tests/east.ts ->
tests/cities/rnc.ts. New: index.ts, lines.ts, causes.ts, skin.ts, course.ts, music.ts, theme.ts, look.ts
(grade, tileCaps, cityLine), things.ts (dhuska draw + size). The shared files lost every RNC line. The RNC
chapter entry is back to its pre-Ranchi unbuilt form (taken from git history), and install patches it.
`grep -rn RNC src tests` outside the module now hits only constants.ts (CityId), the CHAPTERS row,
india-data.ts (map pin), tests/frozen and the new tests. Content is byte-for-byte the same; the only edits
are import paths, `LINES.RNC.x` -> `L.x` (its own lines) and the array wrapped in `levels = () => [...]`.

## 8-stage assumptions: audit and fixes

- Fixed: `normalizeCode` (levels/index.ts). The regex `0?(\d)` could not read "-10". It now reads `(\d{1,2})`
  padded to 2 digits: rnc5, RNC-05, leh-10, LEH10 and "leh 9" all work, and LEH-11/LEH-00 give null.
- Fixed: scripts/qashots.mjs and scripts/shots.mjs built ids as `${c}-0${i}`. They now use padStart.
- Checked, already generic: stage list and map cards (`levelsOf(city).map`, 5-column CSS grid, so 10 makes
  two rows of 5), stars total (`lvls.length * 3`), unlocking (`levelsOf(city)[index - 2]`), next stage
  (`levels[def.index]`), the share card and passport stamps (by stage id or levelsOf), store keys (stage id),
  the code input (`maxlength 6` fits "LEH-10"), and the map pins (by chapter, all 36 exist).
- New test `tests/ten-stages.test.ts`: a throwaway LEH module with 10 stages (01 = RNC's tour re-id'd, 02-10
  walk-to-door rooms) installs through `installCityModules`. It checks order and index 1..10, the shared
  pieces (LINES, chapter city and teasers, THEMES, CITY_ORDER), codes 01..10, next-after-09 = 10, that LEH-01
  builds, that LEH-10's route wins, and that a duplicate stage id throws. Vitest isolates files, so it never
  reaches the other suites.

## CI

`push: branches: [main]` -> `[main, develop]` in android.yml, ios.yml, pages.yml and test-apk.yml. Nothing else
changed. android-release.yml has no push trigger and was left alone. Because of this, a push to develop also
deploys Pages and updates the `test` APK release, which is what the brief asked for. I could not read the CI
run status: `gh` is not installed here.

## Docs

docs/CITY-MODULE.md covers the layout, the field-by-field table with RNC files, the registry lines, the test
file, commands to run one city's tests (`npx vitest run tests/levels.test.ts ... -t 'PAT-'`, which gave 63
tests for RNC), the 10-stage layout, the 8 engine facts from HANDOFF section 3, and the rule that a city worker
edits only its own directory, test file and docs plus the registry line. docs/HANDOFF.md section 5 now points
to it.

## Not done / gaps

- The registry edit is two lines (import + entry) in one file, not one line.
- The 14 older cities stay in the shared files, as the brief said. Only RNC is a module.
- AGENTS.md and HANDOFF still describe 8 stages for the old cities and the old workflow (push to main).
  CITY-MODULE.md covers the new rules, but AGENTS.md "Workflow per city" was not rewritten.
- `tests/fair-rnc.test.ts` keeps its name, though it now defaults to every module's `fair` list.
- Merge risk for parallel workers: none in the shared files. The registry needs one trivial merge per city.
