# Infra round 4: the 14 older cities are city modules

Worktree `/local/home/saiposh/personal/ldd-wt/migrate`, branch `infra/migrate-old-cities`.
**Branch tip: bc76d8345e210be541af8de5946d0ef59c70d130 (bc76d83)**, rebased on develop 5e05554 (the UI merge
f122eb9 plus the four allocation v2 commits). 20 commits. Not pushed, not merged, no version bump. develop
was not touched.

All 15 shipped cities now live in `src/game/cities/<code>/` (the 14 below and RNC). Each folder holds
index, lines, levels, endings, causes, skin, course, music, theme, look (grade, tileCaps, cityLine), backdrop,
ambient, and, where the city had its own, entities and things. BOM has no things.ts because it has no
thing kind of its own. CHN, PDY, HYD and BOM have no entities.ts because their entity files
(`entities/mumbai.ts`, `entities/tamil.ts`) are shared with other cities and stay shared.

## Gates

| | before (develop 5e05554) | after (bc76d83) |
| --- | --- | --- |
| `npm run typecheck` | clean | clean |
| `npm test` | 18 files passed, 12 skipped; **1316 passed, 12 skipped** | 18 files passed, 12 skipped; **1470 passed, 12 skipped** |
| frozen-behaviour snapshot | green | green, **not refrozen** (`tests/cities/_frozen/*.json` untouched) |
| `npm run build:single` + `node scripts/flows.mjs` | ok | ok, "no errors" |

The +154 tests are the module guard's 11 checks × 14 new module cities. I also ran every gate after each
city on the pre-rebase branch (develop f122eb9). The frozen snapshot passed every time.

## Per city

The commit is the post-rebase sha. "Removed from shared" counts every table entry taken out of a shared file.
Each city loses these tables: LINES, the CHAPTERS city/hello/famous (install fills them in), SKINS,
COURSES, CITY_LINE, GRADES, CAP, MUSIC, THEMES, CITY_ORDER and the backdrop dispatch line. On top of those,
it loses its own endings, causes and things, listed in the last columns. "Tests" is the full suite on that
city's gate run (pre-rebase; for KVT and PDY it is the later rerun after their extra endings moved).
"Pixel" is the changed-pixel count over the 6 shots (stage 01 and 05, at ticks 0, 150 and 400), taken after
the rebase and compared with the before shots.

| city | commit | moved (git mv / cut) | removed from shared: endings / causes / things | tests | pixel |
| --- | --- | --- | --- | --- | --- |
| TVM | 94a6e9f | levels/tvm.ts, entities/kerala.ts, `thiruvananthapuram()` | knock / drenched / chaaya net parunthu snakeboat | 1320 / 13 skip | 0 |
| KVT | 8be1b34 (+883dcfc) | levels/kvt.ts, entities/lakshadweep.ts, `kavaratti()` | reflection glider trapdoor footsteps pushoff safetystop, loading / pinched stung bitten / tuna | 1430 / 13 | 2035* |
| CHN | 4c65514 | levels/chn.ts, `chennai()` | token bull catch rangoli tips / - / lorry mirage loco ball | 1342 / 13 | 0 |
| PDY | a0d6f29 (+fdcee84, ee772ed) | levels/pdy.ts, `puducherry()` | bells fakewin, shuffle mirror mime, lamp / - / bollard awning umbrella croissant lights surfboard rocket | 1430 / 13 | 2035* |
| BLR | 2531986 (+fdcee84) | levels/blr.ts, entities/karnataka.ts, `bengaluru()` | revolve pull wrap cctv, invisible / - / leaf coracle | 1364 / 13 | 0 |
| AMR | a21af90 (+fdcee84) | levels/amr.ts, entities/andhra.ts, `amaravati()` | key speed dejavu whirlwind, swing mirchi monkey / - / punugulu sluice deg roadroller stalactite cablecar sub | 1375 / 13 | 0 |
| HYD | 3a7d70d | levels/hyd.ts, `hyderabad()` | otp biryani gravity tiny cannon backdoor slowmo / - / bangle cannonball | 1386 / 13 | 0 |
| PNJ | a826f87 | levels/pnj.ts, entities/goa.ts, `panaji()` (+ `cyc` in ee772ed) | poder penalty clockhand hammock gangway sandcastle decree / gossip woke tangled mast dunked momo / poi | 1397 / 13 | 1698* |
| BOM | 904e0de | levels/bom.ts, `mumbai()` (+ `drawLocal` in ee772ed) | bollywood kabaddi dahihandi credits dabbacode lightwell local / spilled / - | 1408 / 13 | 0 |
| DMN | b9814f6 | levels/dmn.ts, entities/daman.ts, `daman()` | customs coldstore flag drawbridge slidedoor paintwall tipjetty / moored / bombil | 1419 / 13 | 0 |
| GNR | ff0b77c | levels/gnr.ts, entities/gujarat.ts, `gandhinagar()` | setu milan safari kichad pravesh herd jali / manja stomped mauled / dhokla | 1430 / 13 | 0 |
| JAI | c7d7794 | levels/jai.ts, entities/rajasthan.ts, `jaipur()` | sutradhar toran shant naap dulha palat salaami / kaanch talwar phataka matka / ghevar | 1441 / 13 | 0 |
| BPL | 527868a | levels/bpl.ts, entities/bhopal.ts, `bhopal()` | ghat haath gaanth khaali paan rakhdo kissa / doob bison uljhan sher chipak / poha | 1452 / 13 | 0 |
| RPR | 1cfc7e4 | levels/rpr.ts, entities/raipur.ts, `raipur()` | utar ghanta khisko lattu reel gud rath / daldal kaanta bhanwra baaj chapda / chila | 1463 / 13 | 0 |

\* The only non-zero diffs all sit in one box, x 357-486, y 110-142: the DOM "Found it!" toast in
KVT-05/PDY-05 at tick 150 and PNJ-05 at tick 400. That toast is a CSS animation on a real-time timer. Two
before-builds of the same commit differ there by the same amount (KVT-05 t150: 2068 and 2056 px between
two runs of one build), so it is HUD timing, not rendering. Every canvas pixel is identical (TOTAL 5768,
all in that box: `migrate-shots/final-diff.txt`).

Later commits that touch several cities:
- 883dcfc, fdcee84 and ee772ed (part): the first inventory missed door endings whose key also appears inside
  their own entry (e.g. `w.flags.twist = 'shuffle'`), so they stayed shared. These commits move them:
  KVT loading; PDY shuffle mirror mime; BLR invisible; AMR swing mirchi monkey; PDY lamp. GNR jali and BPL
  paan / RPR gud were caught inside their own city's commit.
- ee772ed: the last city-only helpers in the endings files move too (Kayak to KVT, drawLocal to BOM, cyc to
  PNJ). `endings2.ts` and `endings3.ts` are deleted. `endings.ts` is now only `ModuleEndingKinds`, `EndingKind`,
  `ENDINGS` and `isEnding`.
- 46c7595: every city's ambient branch (ambientSouth, ambientWest, ambientVibe and the city chain in
  drawAmbient) moves into `<code>/ambient.ts`, in the order drawAmbient drew them (south, west, vibe when
  not reduced, then its own). The PDY/BLR petal branch is split per city. `tiledHouse` (TVM only) moves to
  tvm/backdrop.ts.
- 0e304b3: the comment lines that sat above each city's old COURSES entry come along into its course.ts.
- 1cfc7e4 also removes the temporary journey-order sort from install.ts. It is a no-op now that every city
  is a module.

## Module system extensions (allowed infra)

- `src/game/cities/module.ts`: a new optional field `ambient?: Ambient`,
  `(ctx, x0, x1, t, reduced) => void`. install.ts puts it into `MODULE_AMBIENT` (backgrounds.ts), and
  `drawAmbient` now just calls `MODULE_AMBIENT[city]?.(...)`.
- `Backdrop` (backgrounds.ts) gets a 5th argument `variant` (the stage index), because HYD's and BOM's
  skylines change with it. `drawBackdrop` passes it to module backdrops. RNC's 4-argument `ranchi` still fits.
- install.ts: during the migration, `installCityModules` sorted LEVELS and CITY_ORDER by journey order, so
  that half-migrated commits kept the old order. Removed in the last city commit.
- `tests/modules.test.ts`: two new excuses, `naive` and `fair`, and the allow-list `OLD = ['ten', 'intro',
  'prefix', 'fair']` with a TODO. TVM, CHN, PDY and AMR are on `OLD`. BLR is on `OLD + fix`. KVT, HYD, PNJ,
  BOM, DMN, GNR, JAI, BPL and RPR are on `OLD + naive + fix`, because their 8 stages lack a NAIVE for some
  stages and FIX for 5. No stages were invented.
- Import-path-only edits in shared test files for the moved files: tests/solutions.ts, west.ts, acts.ts,
  frozen/v0.16.13.ts and fair-gnr07.test.ts (6 test files, 33+/14- lines including modules.test.ts).
- Docs: CITY-MODULE.md (all 15 are modules, the `ambient` row, the backdrop `variant`, the allow-list wording)
  and AGENTS.md (the template city is `src/game/cities/rpr/`).

## How it was done, and the tools

`ldd-inbox/reports/migrate-shots/`:
- `migrate.py CODE` does one city. It uses AST cuts (oxc via rolldown's parseAst, `mig.mjs`) for object
  entries, switch cases (drawThing: `break` becomes `return`), union members and top-level declarations.
  It computes the imports each moved piece needs and exports the shared helpers it uses. It git-mv's the
  level and entity files, rewrites their relative imports and the importers', and prunes only the imports
  the move made unused.
- `inv.mjs CODE` builds the ownership inventory. A key belongs to the city when its literal appears only in
  the city's own files.
- `gate.sh CODE` runs the migration, the guard allow-list, typecheck, the full tests, build:single, flows,
  shots and the diff.
- `shot.mjs` keeps shots deterministic: a fresh page per stage, a seeded Math.random, rAF pumped by hand,
  and CSS animations disabled.
- `before/` and `after/` hold the shots, `final-diff.txt` the numbers.

## Left shared (and why)

- **Test routes.** The 14 cities' SOLUTIONS, NAIVE, FIX and MISTAKES plays and their act routes and ending
  policies are still in tests/solutions.ts, west.ts, acts.ts and endings.ts. Each `tests/cities/<code>.ts`
  wins over them for the same key, so a city pass writes there. Moving the woven route tables was not in
  this brief (same reason as round 3).
- **Scene kinds** (`render/scenes.ts`, e.g. TVM's `nets` and `houseboats` inside the shared `water` kind).
  The feature code is interleaved with the kind's own drawing. Moving it to `sceneFeatures` would change
  the draw order.
- **Prop art** (`render/art/props.ts`: palm, teastall and so on). The module has no props field, and the kinds
  are mostly shared between cities.
- **Things, causes and entity files used by more than one city** (e.g. redbus, coconut, crushed,
  entities/mumbai.ts and tamil.ts) stay shared by design.
- **Small inline city checks**: tiles.ts (BOM, BLR tile colours), backgrounds.ts haze (BOM 0.12),
  app.ts (menu city HYD, journey start TVM-01), mapview.ts (KVT pin) and the `charminar` helper (also
  used by scenes.ts).

## Not checked / risks

- The reduced-motion path of the moved ambient layers is covered by code reading only. The shots run with
  default settings (reduced motion off).
- Merge risk: the open city worktrees (pat, lko, ccu, bbi, svp, gtk, dis) import none of the moved paths
  (grep of their src and tests). Their shared test file `fair-gnr07.test.ts` imports `entities/gujarat`,
  which this branch rewrites to `cities/gnr/entities`. They don't edit that file, so the merge takes mine.
- HANDOFF.md, WAVE1.md, MECHANICS.md and PROMPT.md still name the old file paths in their history. Only
  CITY-MODULE.md and AGENTS.md were updated.
