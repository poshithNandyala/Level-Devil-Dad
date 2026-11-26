# Handoff: how the game works and how to add a city

Everything a new developer (human or AI) needs to carry on. Rules and the quality bar are in
`AGENTS.md`; what's done and what's next is in `docs/CITIES.md`; every idea already used is in
`docs/MECHANICS.md`; the changelog with lessons learned is `docs/WAVE1.md`.

Status: v0.16.14 on `develop`, 15 capitals, 120 stages, all proven beatable by scripted routes. New cities
(10 stages each) are city modules: **`docs/CITY-MODULE.md` is the recipe**, and section 5 below is history.

## 1. Setup

| Need | For |
| --- | --- |
| Node 22 (20+ works) and npm | everything |
| Chrome or Chromium + Playwright (`npx playwright install chromium`, or set `CHROME_PATH`) | screenshots, flows, clips |
| Python 3 + Pillow | contact sheets (`scripts/dev/sheet.py`) |
| Java 17+, curl, unzip | the sideload APK (`android-test/build.sh`) |
| Android Studio + JDK 21 / a Mac with Xcode | only for the full Capacitor apps |

```bash
npm ci
npm run dev            # http://localhost:5173 ; ?c=RPR-05 (or #RPR-05) opens that stage
npm test               # every suite: 1316 tests (12 tool files skipped), under a minute
npm run typecheck      # tsc --noEmit
npm run build:single   # dist-single/index.html: the whole game in one file (what the APK wraps)
node scripts/flows.mjs # after build:single: menus, pause, hints, passport, share, in headless Chrome
bash android-test/build.sh   # -> android-test/build/LevelDevilDad-test.apk
```

In the game, tap the version number 5 times (title or settings) for the playtest panel: unlock all, rival
variant (Tara / mascot / none), copy the event log.

**The signing key is not in the repo** (it's public). `android-test/build.sh` makes a throwaway key if
`android-test/test-keystore.jks` is missing, but an APK only installs over the app already on the phone if
both were signed with the same key. The owner keeps the real key; put it back in `android-test/` locally
(never commit it), or give it to CI as the `TEST_KEYSTORE_B64` secret (see below).

### CI (GitHub Actions, on every push to main)

| Workflow | Does |
| --- | --- |
| `test-apk.yml` | builds the sideload APK and puts it on the release tagged `test` (always the latest main). Signed with the `TEST_KEYSTORE_B64` secret if set, else a throwaway key. |
| `android.yml` | `npm test`, then the full Capacitor debug APK (artifact `level-devil-dad-debug-apk`) |
| `pages.yml` | `npm test`, then the web build on GitHub Pages (enable once: Settings > Pages > Source: GitHub Actions) |
| `ios.yml` | compiles the iOS app for the simulator (no Apple account) |
| `android-release.yml` | manual: signed AAB for the Play Store (needs the four `ANDROID_*` secrets) |

## 2. Map of the code

```
src/
  config.ts              version, name
  game/                  the simulation (no DOM). Deterministic: no Math.random, no Date.
    constants.ts         TILE, ROWS, DT, PHYS (all physics numbers), CityId
    world.ts             World (entities, tiles, flags, when/after/guide/say/die/win), LevelDef
    player.ts            Dad: run, jump, coyote, buffer, ledge assist, wall kicks, stilts lift, stun
    body.ts              Celeste-style integer Actors and Solids (moving platforms push and carry)
    replay.ts            hidden checkpoints: respawn = replay this attempt's inputs to that point
    cities.ts            LINES (every city's text) and CHAPTERS (all 36 stops on the map)
    bi.ts                "Local | English" lines: local first, English a moment later
    entities/            things that move and kill. One file per state from Goa on:
                         goa daman gujarat rajasthan bhopal raipur (+ traps, props, group, basics, ...)
                         props.ts has Tara (Rival) and CAUSE_LINES (her line for each way to die)
    levels/
      tvm.ts ... rpr.ts  one file per city: 8 LevelDefs (01 = tour(), 02-08 = longStage(...))
      index.ts           LEVELS: every city's stages in journey order
      kit.ts             helpers: px, door, sign, rival, collectible, checkpoint, thing, spring, ...
      trolls.ts          onPass, dropFloor, crumble, popAt, shyLedge, ceilingDrop, fakeFloor, chaser, ...
      grid.ts            Grid: build a map in code (ground, fill, pit, put, rows)
      tour.ts            the welcome tour (COURSES: posts, ditch, steps, parked, wall, ferry, stones)
      chunks.ts          longStage(), SKINS (each city's dressing for the old troll sections)
      acts.ts            Act interface + act helpers (pool, hiddenGroup, ...)
      endkit.ts          Ending interface + helpers (FLOOR, npc, tara, lock, person, Paint, Mover)
      endings.ts         ENDINGS (all door endings merged) + the oldest ones
      endings2.ts        endings for KVT..BOM; endings3.ts: Goa to Raipur (3000 lines: start endings4.ts)
      twists.ts          the old nine door twists (spikes crush swap shy sink rise wall fake none)
  render/
    renderer.ts          draws the world; GRADES (each city's colour grade)
    theme.ts             THEMES (each city's palette) and CITY_ORDER
    backgrounds.ts       picks the city backdrop; backdrops-south.ts, backdrops-west.ts draw them
    scenes.ts            backdrops for stages set in a famous place (stage `scene`, `with` features)
    art/                 tiles.ts (ground caps per city), things.ts (props and hidden items),
                         characters.ts, vehicles.ts, props.ts
  audio/audio.ts         synthesized SFX and MUSIC (one raga-ish loop per city)
  app/app.ts             screens, CITY_LINE (one line per city on the postcard)
  app/session.ts         one visit to a stage: lives, deaths, quips, instant retry
  map/                   the India map and every chapter's pin
  ui/                    DOM bits, share card, styles
tests/                   see section 6
scripts/                 headless Chrome QA (flows, shots, touch, audio), icons; dev/ has route tools
android-test/            the no-Gradle sideload APK builder
docs/                    this file, CITIES, MECHANICS, WAVE1 (changelog), PROMPT, research-prompt
```

## 3. Engine facts you will need

- Fixed step: 120 ticks a second (`DT = 1/120`, `secs(s)`). Count everything in ticks or `w.tick`.
  Never use `Math.random`, `Date` or real time in the game: every attempt must play out identically.
- Units are pixels. A tile is 16 px; a room is 32 × 18 tiles. Ground top is row 15 (`FLOOR = 240` px).
  `px(t) = t * 16`. Maps can be any width; the camera scrolls.
- Dad is 10 × 14 px, runs at 140 px/s. A tap jump rises about 2.4 tiles, a full hold 3.75 tiles; a full
  running jump covers about 5.6 tiles in 0.64 s. Coyote 0.09 s, buffer 0.12 s, ledge assist 7 px. Wall kicks
  only work off chawl walls (`w.kicks`), slide capped at 64 px/s. All numbers: `PHYS` in `constants.ts`.
- Entities update before the player each tick. To throw Dad: set `vy`, `onGround = false`, `coyoteT = 0`,
  `launched = true`. Useful player fields: `stun`, `speedMul`, `noJump`, `pushVx` (wind), `lift` (drawn
  taller, eg. stilts), `landTick`/`landSpeed`, `jumpTick`.
- A moving platform passes its speed to a jump; set `solid.velX = 0` if it mustn't.
- Map characters: `#` ground, `~` wet ground, `=` one-way ledge, `^ v < >` spikes, `@` spawn, `E` exit door
  (bottom tile), `a`–`z` a tile group (looks like ground until it moves), `A`–`Z` hidden spikes, `0`–`9`
  markers, `%` invisible solid drawn by a prop. Build maps in code with `Grid`:
  `Grid.ground(15).fill(17, 18, 10, 14, '#').pit(8, 21).put(1, 14, '@').put(30, 14, 'E').rows()`.
- World API: `w.add(entity)`, `w.when(pred, fn, once?)`, `w.enter(tx, ty, tw, th, fn)`, `w.after(sec, fn)`,
  `w.onTick(fn)`, `w.die(cause)`, `w.win()`, `w.warp(x, y)`, `w.flipControls(sec)`, `w.flags` (per-attempt
  scratch, also read by the tests), `w.player`, `w.input`, `w.info` (attempt, deaths, rival variant).
- **Three voices:**
  - `w.guide(line, stillTrue?)`: the honest helper, queued, shown in the talk card. It must only say true
    things. Pass `stillTrue` so a queued line is dropped if it's out of date by the time it would play.
  - Tara (`rival(w, tx, ty, facing, script)` and `tara(w, line)` in endings): the rival. She taunts, and
    may point at fake shortcuts. She lies; the guide never does. In a stage, `tara(w, line)` from endkit
    makes her urge you live, at a trap (TVM does this, and once tells the truth): import it under another
    name, since most stage files have their own `tara` script helper.
  - `npc(w, line, x, y)`: locals in speech bubbles. Honest, flavour.
  Every line is `"Local | English"`, max 8 words each side where possible.
- Death causes: `w.die('chapda')`. Add each new cause to `CAUSE_LINES` in `entities/props.ts`:
  `[what happened, how to beat it]`, both in plain English. Tara uses them after deaths.

## 4. How a stage is built

```ts
// src/game/levels/rpr.ts (the pattern every city follows)
export const RPR: LevelDef[] = [
  tour(...),                                             // RPR-01: the welcome tour
  longStage({ base: hareliRoom(), par: 36, acts: [khet], twist: 'utar' }),   // RPR-02
  ...                                                    // to RPR-08
];
```

- **The room** (`base`): a 32-column one-screen trap room, the stage's own idea. A `LevelDef`:
  `id, city, index, name, nameEn, tagline, hint, par, map, build(w)`, optional `scene`. `build` places the
  door, the mechanic's entities, a sign, Tara (`rival`) and one hidden item (`collectible(w, kind, tx, ty)`,
  somewhere risky). `hint` is honest and complete: what kills you and how to beat it.
- **The act** (`Act`): the longer section after the room. `{ id: 'rpr02-khet', w: 44, paint(g, c),
  build(w, c), advice, cps? }`. `c.x` is its first column; `c.X(t)` turns an act column into world px;
  `c.f(k)` makes a flag name private to the act. Ids are unique in the whole game.
- **The door ending** (`Ending`): the last surprise, at the door. `{ space, after?, paint?(g, D),
  build(w, d), advice }` where `D` is the door column and `d` the Door. Keep `w.flags.twist` up to date
  (the test policies read it). One ending per stage, never reused.
- `longStage()` joins them: the hint becomes room hint + act advice + ending advice; hidden checkpoints go at
  each act start, at `cps`, and just before the door's surprise.
- **Checkpoints** are invisible. Dying respawns you at the last one by replaying this attempt's inputs, so
  everything moving is exactly where it was. A checkpoint must be a calm spot (nothing can kill you while you
  stand there, and standing there doesn't trigger anything): `tests/cpsafe.test.ts` checks it.
- **Stars:** clear (1), beat `par` seconds (2), hidden item (3).
- **Difficulty:** 02 is gentle and teaches the city's first idea; each stage after asks more; 08 is the
  finale (it may combine this city's own ideas). Clear time once known: roughly 25–60 s for a long stage.

## 5. Adding a city: every file

**New cities are modules now: follow `docs/CITY-MODULE.md` (drop a folder in `src/game/cities/<code>/` and a
test file in `tests/cities/`; no shared file changes; 10 stages).**
The table below is how the 14 cities before Ranchi were added; it is kept for reading their code.

Use the last city (Raipur) as the template and search for `RPR` to see each entry. For Ranchi:

| # | File | Add |
| --- | --- | --- |
| 1 | `src/game/constants.ts` | `'RNC'` to `CityId` |
| 2 | `src/game/cities.ts` | `LINES.RNC` (every field of `CityLines`: hello, famous, lang, intro ×7, taunt, beaten, death, near, win, flip, cleared, brag, idle, seven, lastLife); in `CHAPTERS` give RNC `city: 'RNC'` and drop its `teasers` |
| 3 | `src/game/entities/jharkhand.ts` (new) | the city's new entities (each mechanic's class: update, draw, solids, hazards) |
| 4 | `src/game/levels/rnc.ts` (new) | 8 LevelDefs: `tour(...)` + 7 × `longStage({ base, acts, twist, par })`, rooms, acts |
| 5 | `src/game/levels/index.ts` | import `RNC` and append `...RNC` to `LEVELS` |
| 6 | `src/game/levels/endings4.ts` (new) | `EastEndingKind` + `EAST_ENDINGS` (7 endings). In `endings.ts`: import them, add `\| EastEndingKind` to `EndingKind`, add it to the `Exclude<...>` of `OLD_ENDINGS`, and spread `...EAST_ENDINGS` into `ENDINGS` |
| 7 | `src/game/entities/props.ts` | `CAUSE_LINES` for every new death cause |
| 8 | `src/game/levels/chunks.ts` | `SKINS.RNC` (falling thing, vehicle, chaser, lines in the local language, mist colour, awning) |
| 9 | `src/game/levels/tour.ts` | `COURSES.RNC` (the tour's pieces) |
| 10 | `src/app/app.ts` | `CITY_LINE.RNC` (one sentence for the postcard) |
| 11 | `src/audio/audio.ts` | `MUSIC.RNC` (bpm, sa, scale, theka, phrases): sound like the region |
| 12 | `src/render/theme.ts` | `THEMES.RNC` (sky, hills, tiles, accent, local-script name) and add to `CITY_ORDER` |
| 13 | `src/render/renderer.ts` | `GRADES.RNC` (colour grade) |
| 14 | `src/render/art/tiles.ts` | ground caps for RNC |
| 15 | `src/render/backdrops-east.ts` (new) | `ranchi(ctx, th, x0, x1)` skyline + any ambient life; dispatch it in `backgrounds.ts` |
| 16 | `src/render/scenes.ts` | features for stages set in a famous place (`scene: { kind, place, sky, with: [...] }`) |
| 17 | `src/render/art/things.ts` | the hidden item (`ThingKind`, `SIZE`, draw case), eg. `'dhuska'` |
| 18 | `tests/east.ts` (new) | routes: `eastSolutions(S, lengthen)` with `S['RNC-0n']` + `lengthen(...)`; `EAST_ACT_ROUTES`; `EAST_ENDING_POLICIES`. Wire in like west: `tests/solutions.ts` calls `eastSolutions(SOLUTIONS, lengthen)`; `tests/acts.ts` and `tests/endings.ts` `Object.assign` the routes and policies |
| 19 | `tests/solutions.ts` | `NAIVE['RNC-0n']`: the obvious play, and the cause it should die of (proves each trap betrays) |
| 20 | `docs/` | MECHANICS.md (the city's ideas, acts, endings), CITIES.md (move to Done), WAVE1.md (a section for the version) |
| 21 | `package.json`, `src/config.ts` | the version (0.15.0 for Ranchi) |

Map pins for all 36 chapters already exist (`src/map/india-data.ts`). `QUIPS` (session.ts) fills itself from `LINES`.

## 6. Tests

Every stage has a scripted route in `tests/` (Steps: `{ hold: 'L'|'R'|''|'FWD', jump: ticks, ticks, until,
max, note, dodge, brace, long, steer, policy }`). `lengthen(id, drop, extra)` turns a room route into the
whole stage: it appends each act's route (by act id) and the ending's policy (by ending kind).

| Suite | Checks |
| --- | --- |
| `levels.test.ts` | every stage builds, the route wins, it's deterministic, it wins with every rival variant, the `NAIVE` play dies, and the `FIX` play (the obvious correction after the first death) dies too |
| `checkpoints.test.ts` | the route passes every hidden checkpoint and a respawn replay is exact |
| `cpsafe.test.ts` | standing at a checkpoint is safe |
| `items.test.ts` | one hidden item per stage, somewhere reachable-looking |
| `jumpaudit.test.ts` | no required jump needs more than a 15-tick hold unless the step is marked `long` |
| `chunks.test.ts`, `abilities.test.ts`, `physics.test.ts` | the old troll sections, swimming/palms/water running/wall kicks, physics |
| `stale.test.ts` | a reworked stage kills the route that won the last version it shipped in (frozen copies in `tests/frozen/`): the way the player already knows is not the way through any more |

Tools (each is a test that only runs with its env var):

```bash
LDD_LEVEL=RPR-05 npx vitest run tests/debug.test.ts --silent=false               # trace a route tick by tick
LDD_LEVEL=RPR-05 LDD_EVERY=10 LDD_WATCH='[w.player.x, w.flags.twist]' npx vitest run tests/debug.test.ts --silent=false
LDD_SHOW=RPR-05 npx vitest run tests/showmap.test.ts --silent=false                # print the built map
LDD_ID=RPR-05 npx vitest run tests/acttrace.test.ts --silent=false                 # trace the act (LDD_EXTRA='js')
LDD_ID=RPR-05 npx vitest run tests/endtrace.test.ts --silent=false                 # trace the door ending
LDD_LEVEL=RPR-05 npx vitest run tests/cpfind.test.ts --silent=false                # find calm spots for checkpoints
LDD_PAR=1 npx vitest run tests/par.test.ts --silent=false                          # route times vs par
LDD_ENDREC=1 LDD_ID=RPR-05 npx vitest run tests/endrec.test.ts                     # record the route -> /tmp/rec/RPR-05.json
npm run build:single && bash scripts/dev/shots.sh RPR-05                           # screenshots along it -> shots/route/RPR-05-sheet.png
node scripts/dev/clip.mjs RPR-05 1200 1800 4                                      # frames of ticks 1200-1800 for a how-to clip
LDD_LEVEL=TVM-08 LDD_FIX=1 LDD_REC=/tmp/r.json npx vitest run tests/debug.test.ts   # trace/record the FIX play
LDD_AUDIT=1 LDD_IDS=TVM-01,TVM-02 npx vitest run tests/hazard-audit.test.ts --silent=false   # spikes nobody comes near
LDD_FAIR=1 LDD_IDS=TVM-01,TVM-02 npx vitest run tests/fair.test.ts --silent=false        # human timing, any stages
node scripts/solshot.mjs TVM-01 /tmp/r.json 700,900                                       # screenshots of a recording
```

`tests/dbg2.test.ts` is a skipped scratch file for one-off checks.

The hardness-pass kit: a tour (stage 01) takes `paint(g)` and `extra(w)` for its betrayals, its own
`hint`, and `cps` (tile columns) to replace the checkpoint after every piece with a few long runs; `gapAhead(w, letter, { lead, back })` (trolls.ts) drops a floor just ahead of you and brings it
back after `back` seconds. A moving thing you can ride must set `solid.velX` to its real speed, or a hop
on it loses its motion (TVM-02's bus did until v0.16.2). The route bot (`incoming`) counts the speed of
whatever you stand on, so its hops on a moving roof are judged like a person's.

**Gotchas** (each one cost hours):
- The ending harness already counts `m.hold` down; don't decrement it in a policy.
- Route steps are reused across plays: reset any closure state when the World changes.
- An ending that moves the door a column over must offset `D` in `build`.
- Standing still at a checkpoint can trigger things (a cocoon!): keep threats off checkpoints.
- Bots press on the exact frame. A route passing proves the stage is possible, not that it's fair.
- A `Rider` assumes its art faces left and flips it when it moves right. Art that faces right (the scooter,
  the road roller) needs `facesRight = true`, or it rides backwards.
- Reworking a stage the owner has already played: change the moves he knows, not only the mistakes he no
  longer makes. Freeze the shipped routes (`tests/frozen/vX.ts`, a copy of solutions.ts with its imports
  one folder up), list the reworked ids in `stale.test.ts`, and record each old move as a `like last time`
  mistake. Traps only for wrong moves look like "no changes" to someone who knows the stage.
- `newDoor(id, n)` drops a route's last `n` steps for the door policy: if you add steps at the end of a
  room, lower `n`, or they vanish (TVM-08's finish did).
- A hazard on a clock (`Schedule`) meets whoever arrives at the right moment, which is luck. To make the
  obvious play meet it every time, start the clock when Dad gets near (TVM-03's pour: `onPass` sets the
  schedule's phase).

### Fairness check (do this for every precision section)

Route bots hide unfair timing. Before shipping, play each tricky section with a human-timing model: take the
route and, for each input, add a random reaction delay of 0–18 ticks and a random hold length of 6–44 ticks
(seeded, a few hundred runs). Report the success rate for quick (0–6), average (0–12) and relaxed (0–18)
delays. Ship only if average is 90% or better; if not, move the hazard, widen the window or slow it down
(v0.14.1 in WAVE1.md is the worked example: BOM-06 went from 23% to 98%; `tests/fair-gnr07.test.ts` is one in
code: `LDD_FAIR=1 npx vitest run tests/fair-gnr07.test.ts --silent=false`). Also try the obvious wrong things
a player will do and make sure the hint and the guide don't send them to their death.

## 7. Before you call a city done

1. `npm run typecheck` clean, `npm test` all green.
2. Every stage has a route, a `NAIVE` death, a hidden item, safe checkpoints; every act a route; every ending
   a policy.
3. Fairness model run on every precision section (numbers in WAVE1.md).
4. Screenshots of every stage (`shots.sh`) looked at: the city looks like itself, text fits, nothing
   overlaps, the door ending is readable.
5. `npm run build:single && node scripts/flows.mjs` passes.
6. Docs updated (MECHANICS, CITIES, WAVE1), version bumped, committed and pushed. The `test` release on
   GitHub gets the new APK a few minutes later.
