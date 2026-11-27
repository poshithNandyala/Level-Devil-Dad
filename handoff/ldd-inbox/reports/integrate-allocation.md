# Integration B: the allocation in the repo

**develop: f6e4243** (f6e4243b21d992d24e5f2261073d7b2b48024d59), one commit on f122eb9, pushed once
(`f122eb9..f6e4243  develop -> develop`). No version bump.

## Files

| repo path | from | note |
| --- | --- | --- |
| `docs/ALLOCATION.md` | ldd-inbox/docs/ALLOCATION.md | byte-identical (`cmp` clean) |
| `docs/allocation.json` | ldd-inbox/docs/allocation.json | byte-identical (`cmp` clean), so builders' copies merge cleanly |
| `scripts/dev/allocation-check.py` | ldd-inbox/docs/allocation-work/check.py | only change: the path is now `../../docs/allocation.json`. `python3 scripts/dev/allocation-check.py` prints "36 cities 417 families 423 pairs / OK: no duplicates" |

## What tests/allocation.test.ts asserts (it runs now; no skip)

On `docs/allocation.json`, via `allocationProblems()`:
- **The same rules as check.py:**
  - No family appears twice, counting slots, reserves and `tourNew`.
  - No (family, betrayal) pair appears twice.
  - No betrayal type appears twice within one city. The `shipped*` placeholder is not counted, as in
    check.py.
- **Plus:**
  - All 36 chapters are present, each with status `new` or `shipped`.
  - Each city has exactly 10 slots with indices 1..10.
  - Every slot shape is one of tour / std / long / marathon / HWIK / finale / shipped / encore-tough /
    encore-finale.
  - Every new city has at least 2 reserves.
  - A new city has at most 2 HWIK slots, and they are never consecutive. The "at most 2" also comes from
    check.py.
  - Every item has a family and a betrayals list.
- **The meta check:** every built stage that declares `meta` must match its slot (same index) on family, and
  on betrayals as a set. Stages without meta are not checked, so the shipped cities (no meta yet) pass.
- Every registered module city is in the allocation.

The checker is also proven on a made-up 36-city allocation. It accepts a clean one and catches each planted
fault:
- a family under two cities;
- a repeated pair;
- a repeated betrayal;
- HWIK next to HWIK;
- 0 reserves;
- 9 slots;
- a `tourNew` family that duplicates another city's;
- a drifted stage family and stage betrayals, while skipping a stage without meta.

## Gates

| | before (f122eb9) | after (f6e4243) |
| --- | --- | --- |
| `npm run typecheck` | clean | clean |
| `npm test` | 1309 passed, 13 skipped | **1312 passed, 0 failed, 12 skipped (1324)** |

The allocation file test no longer skips: the old skip entry is replaced by 3 real tests (no collisions,
the meta check, modules in the allocation); the 3 checker self-tests were rewritten for the real schema. The frozen-behaviour
tests are green. build:single and flows were not run, because nothing changed at runtime.

## CI on f6e4243 (GitHub API)

| workflow | result |
| --- | --- |
| Android APK | completed, **success** (run 45901126219) |
| Test APK | completed, **success** (run 45901126235) |

The release `test` is now "Test APK v0.16.14 (develop f6e4243)", target f6e4243.

## Next

Idle until told to merge city/pat, city/lko, city/ccu and the migration branch (docs/INTEGRATION.md).
