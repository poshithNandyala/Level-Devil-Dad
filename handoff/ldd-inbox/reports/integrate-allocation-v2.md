# Integration C: meta.ending guard and allocation v2

| part | develop sha | what |
| --- | --- | --- |
| 1 | **26a723f** (on f6e4243) | meta.ending guard, shape `tough` and shape notes, act ids compared squashed, docs |
| 2 | **4cc12ff** (on 26a723f) | allocation v2: docs/ALLOCATION.md, docs/allocation.json, scripts/dev/allocation-check.py |
| 2b | **5e05554** (on 4cc12ff) | docs/ALLOCATION-V2-CHANGES.md (asked for after 4cc12ff was pushed) |

Pushed three times (one per row; 2b came from a later instruction). No version bump. **develop head: 5e05554.**

## Part 1 (26a723f)

- `StageMeta` (`src/game/world.ts`) gets `ending?: string`, the door-ending idea as `'<city>-<kebab key>'`.
  It is optional in the type: RNC and shipped stages carry none yet. The test requires it on every stage of
  a new module city that declares meta.
- `tests/allocation.test.ts`:
  - **(a)** Every `meta.ending` on every registered stage is unique game-wide and has the form
    `<city lower>-<kebab>`.
  - **(b)** With the city prefix stripped, no ending key equals a shipped door ending or old twist. The
    comparison is case-insensitive with hyphens and underscores removed, so `lko-dahi-handi` hits
    `dahihandi`.
    - The shipped set is every `ENDINGS` key (endings*.ts plus RNC's module endings) except the endings
      added by new module cities, plus the `OldTwist` names.
    - The `OldTwist` names are read from the union in `src/game/levels/twists.ts`, so the list can't go
      stale.
  - **(c)** Act ids: the existing round-2 test in `tests/modules.test.ts` ("act ids are unique across the
    whole game") is extended to compare ids squashed (case, hyphens, underscores). The per-city prefix
    check is still in "has a route for every act". It is not duplicated in the allocation test.
  - **(d)** Slot shape `tough` is accepted, and shapes with a note are read by their first word
    (`'HWIK (long 60-90 s)'` -> HWIK) for both the shape check and the HWIK spacing rule. Top-level keys
    that are not a 3-letter city code (v2's `rules`) are ignored.
  - Self-tests on made-up stages: a duplicate key, a wrong prefix, a shipped ending renamed, a missing
    ending on a new city's stage (and no complaint for RNC), and shape notes.
- Docs: docs/CITY-MODULE.md ("Stage meta": `meta.ending`, the uniqueness and not-a-shipped-ending rule, act ids
  `<code>0n-`) and docs/INTEGRATION.md (builder rule 4).
- Tests: **1316 passed, 0 failed, 12 skipped** (was 1312 / 12).
- CI on 26a723f: Android APK success (45902399926), Test APK success (45902400010); release "Test APK v0.16.14
  (develop 26a723f)".

## Part 2 (4cc12ff)

`ALLOCATION-V2-CHANGES.md` appeared at 22:14 UTC. I waited a minute for the writer to finish, then copied:

- `docs/ALLOCATION.md` and `docs/allocation.json`: **byte-identical** to ldd-inbox/docs (`cmp` clean).
  `docs/ALLOCATION-V2-CHANGES.md` was copied byte-identical in 5e05554, once that was asked for.
- `scripts/dev/allocation-check.py`: v2's check.py, which now skips `rules` and reads `HWIK (...)` as HWIK.
  The only change is the path `../../docs/allocation.json`. It prints
  "36 cities 419 families 429 pairs / OK: no duplicates".
- v2 has 37 top-level keys (36 cities + `rules` v2). Slot shapes seen: shipped 120, std 65, long 35, tour 21,
  marathon 21, HWIK 21, finale 21, `HWIK (long 60-90 s)` 15, encore-tough 15, encore-finale 15, tough 11.
- The allocation test passes on v2 with no code change beyond Part 1: 10 tests in the file.
- The six changed shipped encore slots (KVT-09 storm-bank-rubble-slides, HYD-09 dunked-biscuit-softens-on-count,
  GNR-09 full-bin-chute-pulls-down, BPL-09 rock-shelter-refuge-wave, RPR-10 raut-sticks-clash-high-low,
  RNC-09 lac-sheet-softens-near-fire) cause no failure: no encore stage is built, and shipped stages have no
  meta. On develop the meta checks only see RNC and the shipped cities; the city branches are not merged.
  Nothing failed, and the allocation was not edited.
- Full suite: **1316 passed, 0 failed, 12 skipped**. Typecheck clean; frozen tests green.

What tests/allocation.test.ts now asserts on docs/allocation.json:
- **The check.py rules:**
  - No family twice, counting slots, reserves and tourNew.
  - No (family, betrayal) pair twice.
  - No betrayal type twice in a city (the `shipped*` placeholder aside).
- **Structure:**
  - All 36 chapters, each with status new/shipped.
  - 10 slots each, with indices 1..10 and a known shape: tour / std / long / marathon / tough / HWIK /
    finale / shipped / encore-tough / encore-finale, a note in brackets allowed.
  - At least 2 reserves per new city.
  - At most 2 HWIK slots per new city, never consecutive.
  - Every item has a family and a betrayals list.
  - Non-city keys are ignored.
- **The built stages:**
  - Every stage with meta matches its slot's family and betrayals.
  - Every registered module city is in the allocation.
  - The meta.ending rules (a) and (b) above.

CI on 4cc12ff:

| workflow | result |
| --- | --- |
| Android APK | completed, **success** (run 45903847231) |
| Test APK | completed, **success** (run 45903847262) |

CI on 5e05554 (head):

| workflow | result |
| --- | --- |
| Android APK | completed, **success** (run 45904203915) |
| Test APK | completed, **success** (run 45904203968); release **"Test APK v0.16.14 (develop 5e05554)"** |

## Left

- The `rules` object (ending, act, slot09, hwik05, ids) is prose. The test enforces its machine-checkable
  parts: ending key form, uniqueness and shipped-name clash; act id uniqueness and prefix; shape names.
  "New against MECHANICS.md's lists" stays a review job.
- The running builders (PAT, LKO, CCU) need v2's slot changes in their worktrees. Their copies of
  allocation.json will conflict with v2 if they copied v1. Fix: take develop's file on merge, then re-run
  the allocation test.
