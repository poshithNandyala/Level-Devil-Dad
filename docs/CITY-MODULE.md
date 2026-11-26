# Building a city as a module

From v0.16.14 on, a city is one self-contained module. A new city is one directory, one test file and its docs:
**no registry line; drop your folder in.** The shared files (`cities.ts`, `levels/index.ts`,
`endings.ts`, `chunks.ts`, `tour.ts`, `props.ts`, `theme.ts`, `renderer.ts`, `tiles.ts`, `backgrounds.ts`,
`scenes.ts`, `things.ts`, `audio.ts`, `app/citylines.ts`, `tests/solutions.ts`, `tests/acts.ts`,
`tests/endings.ts`) never change for a new city. That is what lets many cities be built at once, each in its
own git worktree, and merged without conflicts.

Ranchi (`src/game/cities/rnc/`, `tests/cities/rnc.ts`) is the worked example. Copy its shape.

## The rule

**A city worker never edits any file outside `src/game/cities/<code>/`, `tests/cities/<code>.ts`,
`docs/cities/<CODE>*.md` and the city's own row in `docs/CITIES.md`.** (`<code>` is the city code in lower
case, `<CODE>` in upper case: `rnc`, `RNC`.) If you think you need a change to a shared file, you don't: stop
and ask. The version bump, WAVE1.md and MECHANICS.md are written later by the integrator, from your
`docs/cities/<CODE>*.md` notes. How branches, worktrees and merges work: `docs/INTEGRATION.md`.

## Start a city: the scaffold

```bash
source /local/home/saiposh/personal/games/_template/scripts/env.sh   # Node 22 on the cloud desktop
npm run new-city -- PAT "Patna" "Bihar"
```

`scripts/dev/new-city.mjs` creates `src/game/cities/pat/` in Ranchi's shape (index, lines, levels with ten
stage slots, entities, endings, causes, skin, course, music, theme, look, backdrop, things) and
`tests/cities/pat.ts` with every table stubbed (solutions, naive, fix, mistakes, actRoutes,
endingPolicies, fair). Every placeholder says TODO. The game builds and typechecks with the scaffold in
place, and `npx vitest run tests/modules.test.ts -t PAT` fails until the city is real: no TODO left, no
`pat-item` placeholder, a NAIVE for every stage, five FIX plays, a hidden item in every stage, a fair list.
It registers nothing: the folder is found by itself.

## The fairness script

```bash
npm run fair -- PAT              # every PAT stage that has a route
npm run fair -- PAT-02,PAT-05    # just these
LDD_N=80 npm run fair -- PAT     # more runs per lag (default 40)
```

`scripts/dev/fair.sh` runs the human-timing model (`tests/fair.test.ts`, HANDOFF section 6) and prints, per
stage, the win rate at quick (0-6 ticks), average (0-12) and relaxed (0-18) lag, and per stretch (spawn to
checkpoint 1, ... last checkpoint to door) the share of average-lag runs that got through once they reached
it. The bar: 90% average for the stage, 95% for every stretch. Builders and QA run the same command.

Everything in AGENTS.md (the bar, the hardness pass) and HANDOFF.md sections 3, 4 and 6 still applies.

## Directory layout

```
src/game/cities/
  module.ts            the CityModule interface (do not edit)
  registry.ts          finds every ./<code>/index.ts and sorts them by journey order (do not edit)
  install.ts           adds every module to the shared tables (do not edit)
  rnc/                 one directory per city
    index.ts           export const RNC: CityModule = { ... }  (exactly one CityModule export)
    lines.ts           lines: CityLines
    levels.ts          levels = (): LevelDef[] => [tour(...), longStage(...), ...]  + the rooms and acts
    entities.ts        the city's own entities (classes: update, draw, solids, hazards)
    endings.ts         the door endings + the `declare module` that adds their kinds
    causes.ts          causeLines: Tara's line for each new death cause
    skin.ts            skin: Skin (dressing for the old troll sections)
    course.ts          course: TourSeg[] (the welcome tour's pieces)
    music.ts           music: MusicCfg
    theme.ts           theme: Theme (palette, local-script name)
    look.ts            grade (colour grade), tileCaps (ground caps), cityLine (postcard sentence)
    backdrop.ts        the skyline function
    things.ts          the hidden item: draw + size + the `declare module` that adds its kind
tests/
  cities/rnc.ts        export const test: CityTests = { solutions, naive, fix?, mistakes?, actRoutes, endingPolicies, fair? }
  city-tests.ts        finds every tests/cities/*.ts by file name (do not edit)
docs/cities/RNC*.md    your design table and notes (for MECHANICS / CITIES / WAVE1 later)
```

You may split or name the files inside your directory however you like; only `index.ts` exporting the module
and `tests/cities/<code>.ts` exporting `test` are fixed. Import shared helpers (`tour`, `longStage`, `kit`,
`trolls`, `endkit`, `Grid`, entities from `traps`/`basics`) from their usual places with `../../levels/...`.
Never import another city's module.

## No registry line: drop your folder in

`src/game/cities/registry.ts` finds modules by folder with `import.meta.glob('./*/index.ts', { eager: true })`
and sorts them by the city's position in `CHAPTERS` (journey order), so you edit no shared file at all. Your
`index.ts` must export exactly one `CityModule` (anything else it exports is ignored). The test file is found
the same way: `tests/city-tests.ts` picks up every `tests/cities/*.ts` and keys it by file name
(`tests/cities/pat.ts` is `PAT`).

The CityId (`src/game/constants.ts`) and the map chapter (`CHAPTERS` in `src/game/cities.ts`, with its pin in
`src/map/india-data.ts`) already exist for all 36 stops. `install.ts` turns the chapter into a playable city:
it sets `city`, takes `hello`/`famous` from your lines (or `chapter`), and drops its `teasers`.

## The module, field by field

`src/game/cities/module.ts` is the source of truth. Ranchi's `src/game/cities/rnc/index.ts`:

```ts
export const RNC: CityModule = {
  id: 'RNC', lines, levels, endings, causeLines, skin, course, cityLine, music, theme, grade, tileCaps,
  backdrop: ranchi, things,
};
```

| Field | Type | Becomes | RNC example |
| --- | --- | --- | --- |
| `id` | `CityId` | the city code everywhere | `'RNC'` |
| `lines` | `CityLines` | `LINES[id]`; `QUIPS[id]` from `lines.death` | `rnc/lines.ts`: hello, famous, lang, intro ×7 (×9 for 10 stages), taunt, beaten, death, near, win, flip, cleared, brag, idle, seven, lastLife |
| `chapter?` | `{ hello?, famous? }` | the map pin's text | not set: uses `lines.hello` / `lines.famous` |
| `levels` | `() => LevelDef[]` | appended to `LEVELS` / `LEVEL_BY_ID` | `rnc/levels.ts`: `export const levels = (): LevelDef[] => [tour(...), longStage(...) ×7]` |
| `endings` | `Record<kind, Ending>` | merged into `ENDINGS` (a kind already used throws) | `rnc/endings.ts`: `ulta nishana tadit chehra kataar khoh dwar` |
| `causeLines` | `Record<cause, [what, how]>` | merged into `CAUSE_LINES` | `rnc/causes.ts`: `tel teer bijli baagh mom pital pathar chhalang` |
| `skin` | `Skin` | `SKINS[id]` | `rnc/skin.ts` |
| `course` | `TourSeg[]` | `COURSES[id]` (read by `tour()`) | `rnc/course.ts`: ditch, steps, posts, parked, ferry `RANCHI JN` |
| `cityLine` | `string` | `CITY_LINE[id]` (postcard) | `rnc/look.ts` |
| `music` | `MusicCfg` | `MUSIC[id]` | `rnc/music.ts`: Nagpuri dhun, 116 bpm (`const _ = null` for rests) |
| `theme` | `Theme` | `THEMES[id]`; appended to `CITY_ORDER` | `rnc/theme.ts` |
| `grade` | `Grade` | `GRADES[id]` | `rnc/look.ts` |
| `tileCaps` | `GroundCaps` | the ground caps (`CAP[id]` in tiles.ts) | `rnc/look.ts` |
| `backdrop` | `(ctx, th, x0, x1) => void` | the skyline behind every stage | `rnc/backdrop.ts`: `ranchi` |
| `sceneFeatures?` | `Record<name, (ctx, x0, x1, sky) => void>` | extra features for stages with `scene: { with: [name] }` | not used by RNC |
| `things?` | `Record<kind, { size, draw }>` | thing sizes and drawing (hidden item, props) | `rnc/things.ts`: `dhuska` 12×10 |

Two details that trip people up:

- **`levels` is a function.** `tour()` and `longStage()` read your course, skin and endings as the stages are
  built, and those only exist after `install.ts` has added them. So don't build stages at the top level of a
  file; put the array inside `levels = () => [...]`. Rooms as functions (`hareliRoom()`) are fine as they are.
  Inside the city, import your own lines (`import { lines as L } from './lines'`), not `LINES.<CODE>`.
- **New kinds are declared, not edited in.** Ending kinds and thing kinds are checked by TypeScript. Add yours
  from inside your module with a module augmentation (RNC's `endings.ts` and `things.ts`):

  ```ts
  export type RncEndingKind = 'ulta' | 'nishana' | 'tadit' | 'chehra' | 'kataar' | 'khoh' | 'dwar';
  declare module '../../levels/endings' {
    interface ModuleEndingKinds extends Record<RncEndingKind, true> {}
  }
  declare module '../../../render/art/things' {
    interface ModuleThingKinds { dhuska: true }
  }
  ```

  After that, `twist: 'ulta'` and `collectible(w, 'dhuska', ...)` typecheck like the built-in kinds.

**The prefix rule.** Every new key starts with your city code in lower case: ending kinds, death causes, thing
kinds and scene features with `pat-` (`'pat-litti'`, `w.die('pat-ganga')`), act ids with the stage too
(`pat02-golghar`). Then two builders can never pick the same key. `install.ts` throws on any key that is
already used (ending kind, death cause, thing kind, scene feature, stage id), and `tests/modules.test.ts`
fails on an unprefixed key or an act id used twice anywhere in the game. (RNC predates the rule.)

## The test file

`tests/cities/rnc.ts` ends with:

```ts
export const test: CityTests = {
  solutions,        // (S, lengthen) => { S['RNC-02'] = [...]; lengthen('RNC-02', 0, []); ... }
  naive,            // { 'RNC-02': { steps, cause: 'tel' }, ... }  the obvious play, and what kills it
  // fix,           // { 'RNC-0n': { steps, cause } }  the obvious correction after the first death (hardness pass)
  // mistakes,      // { 'RNC-0n': [{ what, steps, cause }] }  more scripted deaths, 'like last time' moves
  actRoutes,        // { 'rnc02-...': (x) => Step[] }  by act id
  endingPolicies,   // { ulta: (w, m, d) => Out }      by ending kind
  fair: ['RNC-02', 'RNC-03', 'RNC-04', 'RNC-05', 'RNC-06', 'RNC-07', 'RNC-08'],  // LDD_FAIR default ids
};
```

Import test helpers from `../runner`, `../moves` and so on (one folder up), and the game from `../../src/...`.
`tests/solutions.ts`, `tests/acts.ts` and `tests/endings.ts` merge it into `SOLUTIONS`, `NAIVE`, `FIX`,
`MISTAKES`, `ACT_ROUTES` and `ENDING_POLICIES`, so every suite in HANDOFF section 6 covers your stages
automatically.

**The guard test** (`tests/modules.test.ts`) holds every module city to the bar, so nothing is optional:
stages exactly `XXX-01`..`XXX-10` with `index` 1..10; a NAIVE for every stage; a FIX for at least 5 of the 10;
one hidden item per stage; a route for every act; a policy for every ending; a non-empty `fair` list that
names every stage whose `shape` is `long`, `marathon` or `wtf`; at least 9 `intro` lines; the prefix rule.
RNC is excused from some checks by an explicit allow-list with a TODO; never add a city to it.

## Running only your city's tests

The stage suites name each test after the stage id, so filter by your code:

```bash
source /local/home/saiposh/personal/games/_template/scripts/env.sh   # on the cloud desktop: Node 22
npx vitest run tests/levels.test.ts tests/checkpoints.test.ts tests/cpsafe.test.ts tests/items.test.ts tests/jumpaudit.test.ts -t 'PAT-'
LDD_FAIR=1 LDD_IDS=PAT-02,PAT-03 npx vitest run tests/fair.test.ts --silent=false   # human timing
npm run typecheck && npm test        # before you hand the city over: everything, all green
```

The tools in HANDOFF section 6 (`LDD_LEVEL=PAT-05 ... debug.test.ts`, `showmap`, `acttrace`, `endtrace`,
`cpfind`) work on module cities unchanged.

## Ten stages

Every new city has **10 stages, `XXX-01` to `XXX-10`**: 01 is the welcome tour (`tour()`), 02 to 10 are long
stages (`longStage({ base, acts, twist, par })`), difficulty rising, 10 is the finale (it may call back to this
city's own ideas only). Each `LevelDef` has `id: 'PAT-10'`, `index: 10`. That means 9 door endings, 9 rival
`intro` lines (`lines.intro`, one per stage 02-10; readers index `intro[n % intro.length]`), and a NAIVE for
every stage (FIX for at least 5).

Tag each long stage's shape: `longStage({ ..., shape: 'long' | 'marathon' | 'wtf' })` (`'tour'` and
`'short'` exist too). Long, marathon and wtf stages must be in your `fair` list.

### Long and marathon stages: lives, checkpoints, timing

- **Lives.** 7 lives; by default the 7th death starts the stage over. Pass `lives: 'act'` to `longStage` (or
  set it on a LevelDef) and the 7th death goes back to the start of the act Dad is in (the last act-start
  checkpoint he passed, `LevelDef.actStarts`), with a full set of lives. Use it on every marathon.
- **Marathon:** at most 120 s once known. **Long:** 60-80 s. Both: a calm checkpoint at least every 25 s
  of play (an act start gets one; add more with the act's `cps`).
- **Fairness:** 90% average-timing success for the whole stage (as today) and **95% for every stretch
  between two checkpoints**. Put both numbers in `docs/cities/<CODE>.md`.

### Hint parts

`longStage` still joins the hint into one string (`hint`, kept for compatibility) and also gives
`hintParts: string[]` (room hint, each troll section's advice, each act's advice, the door's advice) and
`hintAt: number[]` (tile x where each part starts; the door part starts at the door's checkpoint).
`hintPartAt(def, x)` (`src/game/levels/chunks.ts`) says which part Dad is in at world x. Write each act's
`advice` so it stands on its own: the hint screen shows only the part for the stretch you are in.

Everything else already handles 10: stage codes (`normalizeCode` reads `pat10`, `PAT-10`, `pat 9`), the
stage list and map cards (built from `levelsOf(city)`), stars (`3 × stages`), unlocking (the stage before by
`index`), the next stage, the share card and the store (keyed by stage id). The 15 cities before the module
system keep their 8 stages. `tests/ten-stages.test.ts` proves a 10-stage module registers and routes.

### Stage meta: stay on your allocation

Every stage you build carries its allocation slot from `docs/allocation.json`:

```ts
longStage({ base: golgharRoom(), acts: [ghat], twist: 'pat-setu', par: 60, shape: 'long',
  meta: { family: 'spiral-stair', betrayals: ['floor-lies', 'count-wrong'] } }),     // slot 3 of PAT
{ ...tour({ ... }), meta: { family: '...', betrayals: [...] } },                     // stage 01
```

`tests/allocation.test.ts` fails if a stage's `meta` (family and betrayals) differs from its slot, so you
can't drift from the allocation silently. It also checks the allocation itself: no (family, betrayal) pair
twice anywhere, no family in two cities, no betrayal type twice in one city, 10 slots per new city. Until
`docs/allocation.json` is in the repo, that part is skipped (the skip message names where to copy it from).

## Engine facts (HANDOFF section 3, unchanged)

1. Fixed step: 120 ticks a second (`DT = 1/120`). No `Math.random`, `Date` or real time in the game: every
   attempt plays out identically, and respawn replays must be exact.
2. Units are pixels. A tile is 16 px; a room is 32 × 18 tiles; ground top is row 15 (`FLOOR = 240` px).
3. Dad is 10 × 14 px and runs at 140 px/s. A tap jump rises about 2.4 tiles, a full hold 3.75 tiles; a full
   running jump covers about 5.6 tiles in 0.64 s. Coyote 0.09 s, buffer 0.12 s, ledge assist 7 px.
4. Entities update before the player each tick. To throw Dad: set `vy`, `onGround = false`, `coyoteT = 0`,
   `launched = true`.
5. A moving platform passes its speed to a jump; set `solid.velX` to its real speed (or 0 if it mustn't).
6. Map characters: `#` ground, `~` wet, `=` one-way, `^ v < >` spikes, `@` spawn, `E` exit door, `a`–`z` tile
   groups, `A`–`Z` hidden spikes, `0`–`9` markers, `%` invisible solid. Build maps with `Grid`.
7. Three voices: `w.guide(line, stillTrue?)` is honest and never spoils an unseen trap; Tara (`rival`, `tara`)
   lies; `npc` locals are honest flavour. Every line is `"Local | English"`, max 8 words a side.
8. Every death cause (`w.die('cause')`) gets a `causeLines` entry: `[what happened, how to beat it]`.

## Shipped cities: one route file each

Each of the 15 shipped cities has its own `tests/cities/<code>.ts` (same `test` shape as a module city). Its
existing plays still live in the shared tables (`tests/solutions.ts`, `tests/west.ts`, `tests/acts.ts`,
`tests/endings.ts`), but whatever the city's file sets is merged last and **replaces** that stage's route,
NAIVE, FIX or MISTAKES entry, or that act's route or ending's policy. So a hardness-pass worker edits only the
city's stage files and its own `tests/cities/<code>.ts`, never a shared test file.

## Shipped cities: frozen behaviour

`tests/frozen-behaviour.test.ts` compares every shipped stage with its snapshot in
`tests/cities/_frozen/<code>.json`: the route's win tick, the NAIVE and FIX death cause and tick, the hidden
item's tile, the checkpoint columns and par. A hardness-pass change makes it fail, as it should. After you
change a city on purpose, re-freeze it and check the diff only shows what you meant:

```bash
npm run refreeze -- TVM          # or TVM,KVT, or all
git diff tests/cities/_frozen/tvm.json
```

## Checklist before you hand the city over

1. `npm run typecheck` clean; `npm test` all green (your stages appear under their ids).
2. Every stage 01–10 has a route, a NAIVE death, a hidden item, safe checkpoints; every act a route; every
   ending a policy; FIX where the hardness pass asks for it.
3. Fairness model run on every precision section (numbers in your `docs/cities/<CODE>.md`).
4. `npm run build:single && node scripts/flows.mjs` passes (set `CHROME_PATH` if Playwright can't find its
   browser), and you looked at screenshots of every stage.
5. `git diff --stat` against your base shows only your directory, your test file and your docs.
6. Commit on your own branch. Never push, never bump the version: the integrator does both.
