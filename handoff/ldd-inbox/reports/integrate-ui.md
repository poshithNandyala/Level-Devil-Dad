# Integration A: ui/hint-home into develop

**Merge commit: f122eb9** (f122eb93b86733cca568e267bff84fad6a95b965), `git merge --no-ff ui/hint-home` on
develop bbcc965. It merges UI tip 42ecef5 (4 commits: 6e6b604, 9e44c99, ba18398, 42ecef5).
Pushed once: `bbcc965..f122eb9  develop -> develop`. No version bump.

## Conflicts

**None.** git merged it automatically. The UI branch touches only `src/app/app.ts`, `src/ui/*` (new
`hintsheet.ts` and `home.ts`, plus `card.ts`, `mapview.ts`, `style.css`) and the new `scripts/uishots.mjs` and
`scripts/uishots-r2.mjs`. Develop's commits since d44918b changed no file in that set, so there was nothing to
reconcile.

The UI's restart fix (restart closes the hint strip) is in the merged tree. uishots confirms it:
`TVM-04 after restart: closed`, and twice `RNC-05 after restart: closed {"restarts":1,...}`.

## Gates on the merged tree (f122eb9)

| gate | result |
| --- | --- |
| `npm run typecheck` | clean |
| `npm test` | 18 files passed, 12 skipped; **1309 passed, 0 failed, 13 skipped (1322)**, the same as bbcc965 |
| frozen behaviour (`tests/frozen-behaviour.test.ts`, inside npm test) | green: 136 tests, no gameplay change |
| `npm run build:single` | ok |
| `node scripts/flows.mjs` | "no errors" |
| `node scripts/uishots.mjs` | exit 0, "no errors", 18 shots |
| `node scripts/uishots-r2.mjs` | exit 0, "no errors", 20 shots |

uishots-r2 checks, from its output:
- RNC-05 has 3 hint parts starting at tiles [0, 32, 71.5].
- The strip shows "You are here" in parts 0 and 2. Tap forward and back work.
- TVM-03, which has no hint parts, shows here=false.
- The upright 390x844 picker has 163x64 px rows in 2 columns, and the list scrolls without sideways page
  scroll.
- The preview leaves the save unchanged.
- The PAT postcard says "Coming in a future update".

All flows and uishots ran with
`CHROME_PATH=$HOME/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell`.

Shots: `/local/home/saiposh/personal/ldd-inbox/reports/integrate-ui-shots/` (round 1 set) and `.../r2/`.
I looked at two myself:
- **`r2/hint-here-RNC-05-part2-844x390.png`**:
  - The hint strip is a slim card across the top: "6/7", a "You are here" badge, a back arrow, the door's
    advice ("A tiger guards the door ... you swap masks.") and a close button.
  - It ends well above the playfield. Dad, the balcony, the tiger and the exit are all clear, and the
    controls are untouched.
- **`r2/picker-top-844x390.png`**:
  - "Where are you from?" with Skip, and South / West sections of city cards (name, state, "Ready to play").
  - The cards are in a 4-column grid and readable.
- Font note: in these headless shots, the local-script names and the emoji icons (bulb, timer) render as
  empty boxes. The headless shell has no Indic or emoji fonts. Phones have them, so this is not a game bug,
  but it is worth checking once on a real device.

## CI on f122eb9 (GitHub API)

| workflow | result |
| --- | --- |
| Android APK | completed, **success** (run 45900397976) |
| Test APK (sideload, rolling "test" release) | completed, **success** (run 45900397926) |

Pages and iOS run on main only, so they did not run here. The `test` release moved: name
**"Test APK v0.16.14 (develop f122eb9)"**, target_commitish f122eb93b86733cca568e267bff84fad6a95b965.

## Left

- `ui/hint-home` is merged but not deleted (branch and worktree `/local/home/saiposh/personal/ldd-wt/ui`
  kept). Remove with `git worktree remove /local/home/saiposh/personal/ldd-wt/ui && git branch -d ui/hint-home`
  once nobody needs it.
- Waiting on the allocator's docs/allocation.json (copy into the repo), then the first city merges.
