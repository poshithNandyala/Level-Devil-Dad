# Integration K: Patna checkpoints merged, v0.17.2

| | sha |
| --- | --- |
| develop before (live after `git fetch`) | d398868 (v0.17.1) |
| city/pat merged | ae7a0a027dcb8d120f48303920f5034147dbf4d9 |
| merge commit (`--no-ff`) | **76ee40dc27bf998fe57d559dca0bad30d49beef4** (76ee40d) |
| bump "v0.17.2: Patna checkpoints" | **f8288e9cac716e91fe9faddaca6dc1ed85c196e4** (f8288e9) |
| develop after (pushed `d398868..f8288e9`, as its own command) | **f8288e9** |

## Deleted or edited shared files

- **Deleted shared files: none.** `git diff --name-status --diff-filter=D develop...city/pat` is empty, and
  so is the staged merge's delete list. Nothing needed restoring.
- **Shared file edited by the branch:** one, `tests/cpsafe.test.ts` (67fdc2b, "Patna: checkpoint fix for
  the three-play cpsafe, PAT off the pending list"). The builder changed `CPSAFE3_PENDING = ['PAT']` to
  `CPSAFE3_PENDING: string[] = []`. That is the step this item asks for, so I kept it.
  - In the merge commit I also replaced the stale comment above the list, which still described PAT's
    failing checkpoints. It now says the list is empty because Patna's checkpoint fix round (v0.17.2) took
    PAT off.
- Everything else in the branch diff is Patna's own: `src/game/cities/pat/`, `tests/cities/pat.ts`,
  `tests/cities/_frozen/pat.json`, `docs/cities/PAT*`, `docs/CITIES.md`.

There were no merge conflicts.

## Gates on the merge (76ee40d)

| check | result |
| --- | --- |
| `npm run typecheck` | clean |
| `npm test` | 18 files passed, 13 skipped; **1640 passed, 0 failed, 20 skipped (1660)**, the tester's 1640; frozen green |
| `npx vitest run tests/cpsafe.test.ts -t PAT` | **10 passed** (122 skipped by the filter); all 10 titled `PAT-0n: idle, run and tap-jump at lag 0/6/12`, so PAT is held to the strict gate |
| `npm run build:single` + `node scripts/flows.mjs` | ok, "no errors" |

The bump commit changes `package.json` and `src/config.ts` only.

## CI on f8288e9 (GitHub API, read live to completion)

| workflow | run | result |
| --- | --- | --- |
| Android APK | [45943732099](https://github.com/poshithNandyala/Level-Devil-Dad/actions/runs/45943732099) | completed, **success** |
| Test APK | [45943732077](https://github.com/poshithNandyala/Level-Devil-Dad/actions/runs/45943732077) | completed, **success** |

Release `test`: "Test APK v0.17.2 (develop f8288e9)", target f8288e9cac716e91…; asset
**LevelDevilDad-v0.17.2.apk, 817782 bytes, updated 2026-11-27T05:06:12Z**.

Note: the APK is the same size as v0.17.1's (817782 B). Patna's changes are small (checkpoint positions and
a litti lift), so that is plausible. The file name and the release target confirm it is the new build.
