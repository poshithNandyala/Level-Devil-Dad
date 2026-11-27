# Integration D: the old-city migration on develop

**develop = bc76d83** (bc76d8345e210be541af8de5946d0ef59c70d130). This is a fast-forward of
`infra/migrate-old-cities` (20 commits) onto 5e05554 with `git merge --ff-only`, so there is no merge
commit. Pushed once: `5e05554..bc76d83  develop -> develop`. No version bump. I did not touch the builders'
worktrees or branches.

## Gates on bc76d83

| gate | result |
| --- | --- |
| `npm run typecheck` | clean |
| `npm test` | 18 files passed, 12 skipped; **1470 passed, 0 failed, 12 skipped (1482)** (develop before: 1316 / 12) |
| frozen-behaviour snapshot | green, **not refrozen**: `git diff 5e05554 bc76d83 -- tests/cities/_frozen` is empty |
| `npm run build:single` | ok |
| `node scripts/flows.mjs` | "no errors" (`CHROME_PATH` at the cached headless shell 1228) |

## CI on bc76d83 (GitHub API)

| workflow | result |
| --- | --- |
| Android APK | completed, **success** (run 45906176171) |
| Test APK (sideload, rolling "test" release) | completed, **success** (run 45906176245) |

Release `test`: **"Test APK v0.16.14 (develop bc76d83)"**, target_commitish bc76d8345e210be541af8de5946d0ef59c70d130.
Asset: `LevelDevilDad-v0.16.14.apk`, 785014 bytes, updated 2026-11-26T22:40:02Z,
https://github.com/poshithNandyala/Level-Devil-Dad/releases/download/test/LevelDevilDad-v0.16.14.apk

## Merge safety for the seven open city worktrees

Worktree heads when checked: pat 55b6178 (moved from f561e44 during the check), lko 666ef65, ccu 4b6e9f3,
bbi 5028718, gtk / dis / svp 5e05554.

1. **Imports of moved paths: none.**
   - Searched files: in each worktree, every code file the builder changed since its merge-base with
     develop, plus untracked files (pat 25, lko 23, ccu 20, bbi 17, gtk 17, dis 14, svp 16).
   - Pattern: the 26 paths the migration deleted or renamed (`levels/<14 codes>`, `levels/endings2|3`,
     `entities/kerala|lakshadweep|karnataka|andhra|goa|daman|gujarat|rajasthan|bhopal|raipur`) and
     `backdrops-south|west`.
   - Result: 0 hits in all seven worktrees.
   - Unchanged shared files in their trees still use the old paths at their base. A merge takes develop's
     version of those, because the builders did not edit them.
2. **Textual conflicts: none.** `git merge-tree --write-tree city/<code> develop` gives exit 0 with no
   conflicted paths for all seven branches.
3. **A real merge, then tests** (throwaway branch `tmp/merge-check-pat` in a scratch worktree
   `/tmp/ldd-merge-check`, never the builder's):
   - `git merge develop` into a copy of city/pat 55b6178 was clean, and typecheck was clean.
   - `vitest run` on the merged tree: 1572 passed, **1 failed**, 12 skipped.
   - The failure is exactly the one city/pat has on its own (1418 passed, 1 failed):
     `tests/allocation.test.ts > door endings ... new module stages declare one`, with
     `PAT-01: meta has no ending`. That is PAT's own unfinished meta. The migration adds no failure.
   - The throwaway worktree and branch are deleted (`git worktree list` and `git branch --list 'tmp/*'`
     both show nothing).

## Surprises

- **city/pat moved under me.** My first throwaway branch was cut at f561e44. The builder then committed
  55b6178 ("Patna: stage 03 hoardings"). So my first "before vs after merge" comparison mixed two PAT
  versions and showed 12 PAT-03 failures that had nothing to do with the migration. I repeated it with both
  sides at 55b6178: identical, the single PAT-01 failure above. Anyone re-running this check should pin the
  branch sha first.
- **PAT's QA will hit the meta.ending rule.** city/pat currently fails the allocation test because PAT-01
  (the tour) declares meta with no `ending`. Either PAT adds a key for its tour or the rule excuses
  stage 01. That is a conductor call; the test currently says every new-city stage with meta needs one.
- **Leftover branches:** `infra/migrate-old-cities` and its worktree `/local/home/saiposh/personal/ldd-wt/migrate`
  are still there. Both are fully merged and can be removed when no one needs them, as can `ui/hint-home`.
