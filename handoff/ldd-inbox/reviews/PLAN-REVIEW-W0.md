# Plan review, wave 0 (Level Devil Dad, "10x Level Devil")

Plan reviewer, report only, 27 Nov 2026. Read `4e159d9` (v0.16.14) and INFRA's `f54d45f` ("CityModule
interface, registry and install; RNC is the first city module", committed on `develop` while I read).
Both checked in /tmp copies (`git archive`, repo untouched): `tsc --noEmit` clean, `vitest run`
**1145 passed, 12 skipped**, about 18 s.

---

## A. Modularization risks

### A1. Already solved by `f54d45f`
A `CityModule` (`src/game/cities/module.ts`) that `install.ts` pushes into every shared table (loaded by
`main.ts` and `tests/setup.ts`); throws on a duplicate ending kind or stage id; `CityId` lists all 36;
`ThingKind` is extendable with `declare module`; tests are found by `import.meta.glob` (`tests/city-tests.ts`).

### A2. Still open: things that will collide in silence
`install.ts` checks endings and stage ids. Everything else merges by `Object.assign` or plain assignment, so the last writer wins with no error:

- death causes: `Object.assign(CAUSE_LINES, m.causeLines)`. Two cities using `w.die('rain')` get one city's
  Tara line for both.
- thing kinds: `MODULE_THING_SIZE[k] = ...` / `MODULE_THING_DRAW[k] = ...`. Two cities adding `'momo'` draw
  the same item; TypeScript merges the same `declare module` key with no error.
- scene features: `Object.assign(MODULE_SCENE_FEATURES, ...)`. `'bridge'` or `'ghat'` will be picked twice.
- act ids: not registered anywhere, only a convention (`rnc02-galli`). `ACT_ROUTES` (`tests/acts.ts`,
  `Object.assign`) keeps one route and the other act is tested with the wrong one.

**Fix (small):** make install throw on any duplicate key in causeLines, things and sceneFeatures, and add
one test that collects every act id across `LEVELS` and fails on a duplicate. Require every new key to start
with the city code in lower case (`pat-`, `pat02-`), so collisions cannot happen across builders at all.

### A3. Still open: the one registry line is a merge conflict
`src/game/cities/registry.ts` holds an array with one entry per line (`RNC,`). Eight builder branches each
add a line next to the others. PAT, LKO, BBI and CCU are neighbours in journey order, so their lines are
adjacent, and git reports adjacent insertions from different branches as a conflict. Appending at the end
conflicts every time. The integrator would hand-resolve this file 7 times per wave, and a wrong order puts a
city in the wrong place in `CITY_ORDER`, because install pushes cities "in registry order".

**Fix (pick one, first is better):**
1. Find modules in `src` the same way tests already are: `import.meta.glob('./*/index.ts', { eager: true })`
   in `registry.ts`, sorted by the chapter's position in `CHAPTERS` instead of by file name. Then a builder
   touches no shared file at all, and journey order comes from the one table that already defines it.
   `src/env.d.ts` already references `vite/client`, so `tsc` accepts it, and `vite-plugin-singlefile`
   (the APK build) inlines eager globs.
2. Pre-seed `registry.ts` now with all 21 wave-1 codes in journey order, one per line, each commented out,
   with a blank line between them. Each builder uncomments only its own line, and the blank lines stop git
   from seeing the edits as adjacent.

### A4. Still open: the module test shape cannot hold the hardness-pass data
`CityTestsShape` (`module.ts`) has `solutions`, `naive`, `fix`, `actRoutes`, `endingPolicies` and `fair`.
It has **no `mistakes`**. `MISTAKES` (`tests/solutions.ts:1419`) is how TVM records each scripted
first-timer death and each "like last time" move, and `levels.test.ts` plays every entry. A module city
cannot record them, so the "obvious fix dies too, plus mistakes" bar cannot be proven for 21 new cities.
**Fix:** add `mistakes?: Record<string, {what, steps, cause}[]>` to the shape and merge it in solutions.ts.

### A5. Still open: required proofs are optional, so a lazy stage passes
`levels.test.ts` runs the NAIVE test only `if (NAIVE[def.id])` and the FIX test only `if (FIX[def.id])`.
A stage with no NAIVE and no FIX is green. Today FIX exists only for TVM, KVT, CHN, PDY, BLR and AMR (31
stages, `tests/solutions.ts:1515` on). **Fix:** one test that, for every module city, asserts 10 stages,
a NAIVE for every stage, a FIX for at least 5 of 10, a hidden item and a route for every act. Builders then
cannot ship a stage that skips the bar by accident.

### A6. The stage-count audit: places that assume 8 stages or single digits
| Place | Assumption | Fails how |
| --- | --- | --- |
| `src/game/levels/index.ts:28-30` `normalizeCode` | regex `^([A-Z]{3})-?0?(\d)$`, then `${m[1]}-0${m[2]}` | `RNC-10` and `RNC10` are rejected; stage-code entry and `?c=`/`#` links stop at 09 |
| `CityLines.intro` and `.beaten` (`cities.ts`, "intro x7" in HANDOFF) | 7 Tara intros, one per stage 02-08 | rpr/bpl/rnc index `intro[n]` directly, so 09 and 10 get `undefined`; tvm/chn/pdy use `intro[n % length]`, so 09 and 10 silently repeat 02 and 03's lines |
| `scripts/qashots.mjs:30` (also the pattern in `flows.mjs:22`, `shots.mjs:28`) | `${c}-0${i}` | `RNC-010` |
| `tests/fair-rnc.test.ts:102` | default ids `RNC-02..08` | 09/10 skip the human-timing run unless `LDD_IDS` is set |
| AGENTS.md, CITIES.md, HANDOFF.md sections 4-5 | "8 stages", "08 is the finale" | every builder reads these first |
| string sorts of ids | `'RNC-10' < 'RNC-02'` | none today; sort by `index` |
| `app.ts:391`, `:922`, `:831` (unlock, next, city done) | use `index` and list length | safe |

The **existing cities' +2 stages** are a bigger issue than a regex. Their 08 is the finale ("08 may call
back to this city's own ideas"). New 09/10 either come after the finale (the shape is broken) or the old 08
becomes 10, which renames ids. Renaming ids breaks saved progress (`ldd.save.v1` keys stages by id,
`src/platform/storage.ts:71`), the frozen routes, NAIVE/MISTAKES/FIX keys and every doc table. A player who
has the city stamp (`app.ts:834`) also gets two uncleared stages in a "done" city.
**Decide before wave 2.** I recommend keeping ids and adding 09-10 as an "encore" after the old finale (no
save migration); the other way is renumbering plus a save migration.

### A7. RNC moved without touching other cities' tests?
Yes, except 4 import lines in `tests/frozen/v0.16.13.ts`. That file's real problem is in D4.

---

## B. Parallel-builder repetition

### B1. Ideas that are "almost used" (same experience, new skin)
21 builders reading 21 bibles independently will reach for these. Each row is the experience, what already
owns it, and the cities most likely to grab it next.

| Experience | Already owned by | Who will grab it |
| --- | --- | --- |
| rain that pushes you sideways, gusts, storm | gust kit, KVT-04, JAI-07, RNC-04 storm | SHL (Sohra rain), BBI (Kalbaishakhi), GTK, DIS, LEH |
| water that rises, floods, waterlogging | TVM-02, BOM-04, floats | PAT (Ganga floods), CCU, DIS (Brahmaputra), AGT |
| boats, ferries on a timetable | KVT, PNJ, DMN, TVM-08, every tour's `ferry` | PAT, CCU (Hooghly), DIS (bhutbhuti), SXR (shikara), SVP, BBI (Bali Jatra) |
| trains, metro, train roof | BOM, BLR-03, CHN-08, every tour's `traincar` | DEL (metro), CCU (tram, metro), DDN, SML (toy train) |
| steep hills, stairs, slopes | TVM-01 steps, `Steps`, tour `steps` | GTK, SHL, AIZ, KOH, SML, DDN, ITA |
| cable cars, ropeways, zip lines | Cable kit, `amr06-zip` | GTK ropeway, DDN Mussoorie, SML, LEH, JMU |
| crowds that shove you | BOM-03 packed train, queues (`chn02-queue2`) | CCU (Durga Puja pandal-hopping), PAT, DEL |
| food stall where the cook's routine is the platform | RNC-02 kadhai, AMR-01 being fed | PAT (litti), LKO (galouti), CCU (phuchka), DEL (chaat) |
| festival lamps, lights that go out, power cut | BLR-06 lights, `blr06-powercut`, JAI-07 Diwali, `lamp` (timed window) | CCU (pandal lights), AGT, IMP, DEL |
| a floor that holds a walker and breaks under a hop, or the reverse | TVM-01 soaked road, cave-in | everyone: it is the cheapest Level Devil trick |
| a fake door, a door that runs | `fakewin`, `invisible`, `backdoor`, `shy`, `catch`, `lattu` | LKO ("Door Number 489"), SHL, GTK |
| bridges that give way, a bridge you lay | `setu`, TVM bridges, LoadingBridge (BLR-01) | PAT (Gandhi Setu), CCU (Howrah), SHL (root bridges), DIS (Saraighat) |
| a beat that forces hops, drums | JAI-02 puppet strings, RNC-05 Chhau | KOH (log drum), DIS (Bihu dhol), IMP |
| fog hiding the floor; ice | `mist`, TVM-07; DMN-03 | SHL, GTK, SML, DDN; LEH, SXR |
| moves only when you don't look; monkeys | GNR-05, HYD-04; `monkey` ending | DIS, SVP, BBI; SML, DDN |
| bounce, any trampoline | BPL-05, RPR-05, springs, PNJ-05 | CHH, JMU (their teasers) |

Two repeats the plan does not mention, and the owner will notice them in all 36 cities:
- **Stage 01 is the same tour everywhere.** All 15 `COURSES` (`src/game/levels/tour.ts:30-58`) are the
  same seven pieces (`posts`, `ditch`, `steps`, `parked`, `wall`, `ferry`, `stones`) in a shuffled order,
  and the 'ferry' is a `traincar` labelled with a station name in 6 cities. A module still takes a `course`,
  so 21 more cities will copy it.
- **The seventh-death line repeats "Thala for a reason" in all 15 cities** (`cities.ts`, `seven` field; 15
  hits). It is a cricket reference to a real person (AGENTS.md rule 4 bans real people) and it is the same joke
  everywhere. The `SKINS.lie` lines repeat too ("Jump now, Dad!" in 4 cities, `chunks.ts`).

### B2. The rule that keeps builders apart
Write every idea as a one-line **signature**, which is the experience and not the noun:
`<what you expect> -> <what the level does> -> <how you beat it>`.
Example: "floor looks solid -> breaks when you hop on it -> walk over it". Two ideas with the same
signature are a repeat, whatever the skin. The rule:
1. Every family in B1 has **one owner city** for the whole game (one city gets "rain that pushes", one gets
   "a ride on a timetable" if anyone does, and so on). Every other city is barred from that family.
2. A cheap Level Devil trick (floor, spike, door, ceiling) may be used by any city, but only once per city,
   and only if its signature differs from every one in MECHANICS.md and the allocation file.
3. Stage 01 may use at most two stock tour pieces. Its betrayal must be the city's own idea, through
   `extra(w)`.
4. The `seven`, `lie`, `sorry` and `reverse` lines must be new per city (and drop "Thala").

### B3. The uniqueness allocation step
**Owner:** one dedicated worker, not the conductor (too much reading) and not a builder (biased to its own
city). It reads MECHANICS.md, the advice lines in every `endings*.ts` and module `endings.ts`, all three city
bibles and the troll bible, and writes one file. It does not build anything.

**The file** (`docs/ALLOCATION.md`, one section per city, plus a global part) must let a builder comply
from its own section only:
- **Global, top:** the banned-family table (B1 plus the families the bibles add), each with its one owner
  city, and the key prefixes (`pat-`, `pat02-`).
- **Per city, 10 rows:** slot (tour, standard 1-3, long 1-2, marathon, wtf 1-2, finale), the place or habit,
  the signature, the betrayal archetype id from the troll bible, the door-ending signature, and the hidden
  item (a food no other city uses).
- **Per city, "you may not":** the 5-10 neighbouring signatures it is closest to, each with the city that owns
  it, so the builder knows where the edge is.
- **Reserve:** 2 spare signatures per city, so a builder whose idea fails in the engine swaps without asking.
- **Taken nouns:** ending kinds, act ids, death causes and thing kinds already used, so name clashes are
  avoided at design time and not at install time.

---

## C. Hardness and fairness

### C1. Does the 10-stage shape fit this engine?
- Clear times today: HANDOFF section 4 says 25-60 s for a long stage once known; `par` values go up to 80 s.
  The dossier's own Level Devil numbers are **5-9 s per level** (`dossier.txt` lines 174-204: Pits 5.15 s ...
  Warps 8.73 s per level). Our stages are already 5-10 Level Devil levels joined together.
- **Lives:** 7 lives, and the 7th death "starts the level over" (`src/app/session.ts:15`, `:170-172`). On a
  marathon of 2-3 minutes, the 7th death throws away minutes. The dossier warns exactly against this (line
  802: "increasing the distance lost on death, difficulty and frustration rise together"; line 1100: "most
  deaths cost seconds").
- **The 90% bar compounds.** `tests/fair-rnc.test.ts` plays a whole stage with human timing. If a marathon has
  5 precision sections at 98% each, the stage is at 90%; at 95% each it is 77%. So a marathon passes only if it
  is long through betrayals you learn, not through more timing.

**Recommended shape rules:**
1. Marathon: at most 120 s once known, a calm checkpoint at least every 25 s of play, and the 7th death goes
   back to the last act start, not the stage start. That needs a small per-stage field in `session.ts`; it is
   a rule change, so INFRA or the conductor should own it, not 21 builders.
2. Long stages: 60-80 s, same checkpoint spacing.
3. Fairness: 90% average-timing for the whole stage (as today), **and** 95% for every stretch between two
   checkpoints. State both numbers in the city's changelog.

### C2. What will make "WTF how would I know that" unfair here
- The trigger is off screen (the camera scrolls). AGENTS.md rule 5 ("they must see why") has no test.
- The answer needs outside knowledge ("pehle aap", Khasi phrases): funny to a local, unsolvable to others.
- Two new invisible rules in one stage, with a long way back after each death.
- The answer is a move the game never taught (an exact 3 s wait, walking back through a wall).
- The hint spoils it: it is room hint + every act's advice + the door's advice in one string
  (`chunks.ts:331`), five paragraphs on a marathon (also why the hint card covers the screen).

### C3. The exact rule ("one look teaches; the second attempt is obvious")
A WTF trap ships only if all five hold:
1. **Seen:** at the death tick, the thing that killed Dad and the thing that triggered it are both inside
   the camera view. Test it: the FIX/NAIVE runner records the killer's and the trigger's boxes and asserts
   both are on screen.
2. **Named:** its `CAUSE_LINES` entry says what happened and the counter in plain words.
3. **One new rule:** the trap uses at most one rule the player has not met before in this city.
4. **Short way back:** a checkpoint at most 5 s of play before the trap.
5. **Obvious second try:** the winning move is one the player already has (walk, wait, hop, jump long, go
   back), and after one death there is only one sensible thing to try. Local knowledge may make the joke
   funnier, but the game must never need it: a local laughs on the first try, and an outsider wins on the
   second.

---

## D. Process

### D1. What every builder's seed must say
1. **Node 22.** This machine's default `node` is 18.20.2, and `vitest` then dies at startup
   (`SyntaxError: ... 'node:util' does not provide an export named 'styleText'`; I hit it). Start every shell
   with `export PATH=/home/saiposh/.local/share/mise/installs/node/22.23.2/bin:$PATH`.
2. **Scope:** write only `src/game/cities/<code>/`, `tests/cities/<code>.ts`, `docs/cities/<CODE>*.md` (plus
   the registry line, unless A3 removes it). Never edit MECHANICS.md, CITIES.md, WAVE1.md, AGENTS.md,
   package.json or `src/config.ts`.
3. **Overrides of AGENTS.md:** AGENTS.md still says "New cities wait until [the hardness pass] is done",
   "8 stages", "Show the table to the owner ... and wait for go" and "push to `main`". The seed must say:
   the owner has said go, 10 stages, don't push.
4. **Your allocation row** (B3), pasted in the seed, plus "a swap goes to your reserve row, never to another
   city's idea".
5. **Commands:** `npm run typecheck`; `npx vitest run` (whole suite 18 s; `-t '<CODE>-'` filters one city);
   `LDD_FAIR=1 LDD_IDS=<ids> npx vitest run tests/fair-rnc.test.ts --silent=false`; the hazard audit and the
   trace tools of HANDOFF section 6.
6. **Proof per stage:** route, NAIVE, FIX for at least 5 of 10, MISTAKES (after A4), hidden item, human
   timing numbers (C1), C3's five checks for the two WTF stages.
7. **Screenshots:** re-record (`LDD_ENDREC=1 ... endrec.test.ts`), then `bash scripts/dev/shots.sh <ID>` for
   all 10. Both use the shared `/tmp/rec`: give each builder its own folder or sheets mix cities.
8. **CREDITS:** no such file exists. Define it; I suggest `docs/cities/<CODE>-sources.md`.
9. **Done:** typecheck clean, full suite green rebased on current `develop`, a report, one plain commit.

### D2. Version bump with 8 branches
If every builder bumps `package.json` and `src/config.ts`, all 8 conflict on the same two lines. **Rule:**
builders never bump. The integrator bumps once per merged wave (for example 0.17.0 for wave 1), writes one
WAVE1.md section from the builders' `docs/cities/<CODE>-changelog.md`, and folds their MECHANICS and CITIES
notes in.

### D3. What QA must re-run itself (never trust a builder's numbers)
On merged `develop`, in a fresh worktree, Node 22: `npm ci`, typecheck, the full suite (1145 + new, 0 failed),
every new city's `LDD_FAIR` run compared with the builder's figures, `build:single` + `flows.mjs`,
`touch.mjs`, `audio.mjs`, the shots for every new stage (looked at), the hint sheet on a phone-size screen
(Dad never covered), `android-test/build.sh`, and the A2 duplicate checks.

### D4. The hardness-pass branches and the shared test files
- The 9 cities to harden keep their routes in shared files: PNJ, DMN, GNR, JAI, BPL and RPR in `tests/west.ts`
  (7 `S['XXX-0n']` each), HYD and BOM in `tests/solutions.ts`, and all NAIVE/MISTAKES/FIX in three maps at the
  end of `tests/solutions.ts` (lines 1288, 1419, 1515). Nine branches will add entries at the end of the same
  three maps: they will conflict every time.
- **The frozen routes are not frozen.** `tests/frozen/v0.16.13.ts` is a copy of solutions.ts, but it imports
  the live `../west` and `../cities/rnc` (lines 12-13). When a hardness branch changes PNJ's route in west.ts,
  the "frozen" PNJ route changes with it, and `stale.test.ts` then tests the new route against the new stage.
  It proves nothing.

**Fix, before wave 2:** INFRA (or a one-shot worker) moves each old city's routes, NAIVE, MISTAKES and FIX
into `tests/cities/<code>.ts` (the module test shape, plus A4's `mistakes`). Then it writes one real frozen
snapshot of all routes (`tests/frozen/v0.16.14/` copying west.ts and the city files as they are, with no live
imports). It is a mechanical move with no gameplay change, it is proven by the same 1145 tests, and after it
each hardness branch touches only its own file. Otherwise merge the hardness branches one at a time, each
rebased on the last.

### D5. Push rules
- `develop` only. On this host a push to `main` is blocked by policy. The remote has only `main` today
  (`git ls-remote`: `refs/heads/main 4e159d9`), so the first push creates `origin/develop`.
- One command per push (`git push origin develop`), never chained after `git commit -m '...'` in the same
  command (the publish rule refuses a fused command whose message has brackets). Plain commit messages.
- Only the integrator pushes. Builders and QA do not push.
- **CI on develop:** android, ios, pages and test-apk trigger on `branches: [main]` only; a push runs the yml
  of the pushed branch, so the retarget must be in the pushed commit. `test-apk.yml` re-creates the `test`
  release from the pushed SHA, titled "(latest main)": fix the title. Retargeting `pages.yml` publishes
  `develop` to the public web build, and `ios.yml` spends macOS minutes: I'd leave both on main.

---

## E. Wrong premises, and what the plan missed

### E1. Premises checked
| Plan says | Repo says | Verdict |
| --- | --- | --- |
| v0.16.14, 15 cities, 120 stages, all beatable | 0.16.14; 15 cities; 1145 tests pass | right |
| 9 not hardened: HYD PNJ BOM DMN GNR JAI BPL RPR RNC | FIX exists only for TVM KVT CHN PDY BLR AMR | right, but see E2 |
| where RNC lives | was `levels/rnc.ts`, `entities/jharkhand.ts`, `levels/endings4.ts`, `render/backdrops-east.ts`, `tests/east.ts`; now `src/game/cities/rnc/`, `tests/cities/rnc.ts` | moved by INFRA |
| CI | 4 workflows on main only | develop needs the retarget |
| test count | HANDOFF says 934; real 1145 (+12 skipped) | stale doc |
| status lines | HANDOFF "v0.14.4, 14 capitals ... Next city: Ranchi"; CITIES.md (and `ldd-inbox/CITIES-attached.md`) "14 done (112 stages)" | stale; builders read them first |
| hint after 3 deaths (AGENTS.md) | pause menu `deaths >= 3` (`app.ts:751`); HUD button `deaths >= 5` (`app.ts:1324`) | two thresholds; UI should settle one |
| 36 map pins | in `src/map/india-data.ts` (generated, don't edit); glow goes in `src/ui/mapview.ts` | right |
| CREDITS | no such file | define it |

### E2. What the owner asked for that the plan misses
1. **"Existing cities improved" includes the cities hardened only once.** The owner said TVM was "still not
   Level Devil" after its first hardness round (v0.16.8) and "no changes he could see" after round two
   (v0.16.14 notes). KVT, CHN, PDY, BLR and AMR have had only that first round (v0.16.3-v0.16.7). By his own
   verdict they need round three too ("change the moves he knows", plus frozen routes). The plan hardens only
   the other 9.
2. **"Almost no repetition anywhere in the game"**: the shared stage-01 tour pieces and the 15 identical
   "Thala" lines (B1) are repetition across all 15 shipped cities. They should be in the existing-city pass.
3. **"Players excited to reach their own city"**: unlock is strictly in order (`app.ts:401-413`), so a player
   from Leh must clear 35 cities, and 15 cities are still unbuilt after wave 1. The picker needs all 36 with
   "coming soon", an early taste (the `Chapter.preview` flag already exists, `app.ts:549`: open the home
   city's stage 01), and the state name, since CHP and CHH are both "Chandigarh" (they also share every real
   place, so the allocation must split them) and JMU and SXR are both J&K.
4. **"Some stages long and tough"**: the plan's marathon has no length, lives or checkpoint rule yet (C1).
5. **The hint "no longer covering the screen"** is not only a layout job: the hint text for a long stage is
   room + every act + door advice in one string (`chunks.ts:331`). Show only the part for the stretch you are
   in, or a bottom sheet still fills half the screen on a marathon.
6. **AGENTS.md, HANDOFF.md section 5 and CITIES.md** still describe the old way (8 stages, edit 21 shared
   files, push main, wait for go). The plan updates `docs/CITY-MODULE.md` only. Every builder reads AGENTS.md
   first.
7. **The UI worktree** (`/local/home/saiposh/personal/ldd-wt/ui`) is on `4e159d9`; INFRA already changed
   `src/app/app.ts` (CITY_LINE moved to `src/app/citylines.ts`). Rebase UI on `develop` before merge.
8. **INFRA edits the main checkout** directly. A worker running tests there sees a half-moved tree (I did).
   Keep everyone else out of it.

---

## The five things most likely to waste the night

1. **Builders picking the same rain, boat, hill and food-stall ideas, which then fail "no repetition" at
   integration.** Prevent: one allocator worker writes `docs/ALLOCATION.md` (one owner city per idea family,
   10 signatures + 2 reserves per city, a "you may not" list); each seed carries only its own row (B2, B3).
2. **Merge conflicts on shared files every wave** (registry line, version bump, docs, and for the hardness
   pass the end of `tests/solutions.ts` and `west.ts`). Prevent: `import.meta.glob` registry sorted by
   `CHAPTERS` (A3); only the integrator bumps and folds docs (D2); move old cities' tests to
   `tests/cities/<code>.ts` before any hardness branch (D4).
3. **Green but unproven cities**: NAIVE/FIX optional, no MISTAKES slot, duplicate causes/things/act ids
   overwrite in silence. Prevent: a guard test per module city (10 stages, NAIVE all, FIX >= 5, mistakes,
   unique act ids) and install throws on any duplicate key (A2, A4, A5).
4. **Marathon and WTF stages that pass the bot but make players quit**: the 7th death restarts a 2-minute
   stage, 90% compounds, triggers fire off screen. Prevent: set the limits now (at most 120 s, a checkpoint
   every 25 s or less, the 7th death back to the act start, 95% per stretch) and the five WTF checks with the
   on-screen test (C1, C3).
5. **Tooling traps costing each worker an hour**: Node 18 default (vitest crashes), shared `/tmp/rec`,
   stale AGENTS/HANDOFF (wait for go, 8 stages, push main), the `-0${n}` bug at stage 10, a "frozen" file
   that follows live routes. Prevent: the D1 seed preamble, INFRA fixes `normalizeCode`, `qashots.mjs` and
   the intro/beaten arrays, and one real frozen snapshot before wave 2 (D4).

Not checked: I did not run `build:single`, flows, shots or the APK build, and did not read the troll bible or
the city bibles (not written yet). The dossier was read in part (stage times, the loss model, fairness
sections).
