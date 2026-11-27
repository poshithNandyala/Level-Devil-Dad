# UI round 2 (item it_5a53ffad)

- Worktree: /local/home/saiposh/personal/ldd-wt/ui
- Branch: `ui/hint-home`, tip **`42ecef5`**. Not pushed (`git branch -r --contains` prints nothing).
- Based on develop `d44918b`.

## Commits on the branch (oldest first)

| sha | what |
|---|---|
| `6e6b604` | round 1, rebased: hint as a slim top strip, home city picker (was a5e3816) |
| `9e44c99` | round 1, rebased: scripts/uishots.mjs (was 00c5cec) |
| `ba18398` | round 2: the hint opens on the stretch Dad is in, the picker marks ready / coming soon, the home city preview and postcard |
| `42ecef5` | round 2: scripts/uishots-r2.mjs |

## Step 0: rebase

- The branch was never pushed. `git rebase develop` ran clean, with no conflicts.
- After the rebase: `npm run typecheck` was clean and `npm test` gave 1169 passed, 12 skipped. That is the same as develop.
- **Regression found and fixed.** Develop changed `Session.restart()` (src/app/session.ts:125). It now bumps `restarts` instead of `attempt`. Round 1 closed the hint when `attempt` changed, so after the rebase a restart quietly stopped closing it. `hintTick()` now also watches `s.restarts` (src/app/app.ts). The round 1 script confirms it again: "HYD-03 after restart: closed".
- **Node.** This machine has no nvm. Node 22 comes from mise: `PATH=/home/saiposh/.local/share/mise/installs/node/22/bin:$PATH`.
- **Chromium.** `CHROME_PATH=~/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell`.

## Files changed in round 2

| File | What |
|---|---|
| src/ui/hintsheet.ts | `HintSheet` now takes ready-made pages and an optional `partOf` (the stretch each page came from). It adds `setHere(part)`, a "You are here" label, a back button (‹) and `prev()`. New `partPages(parts)` splits each hint part with the round 1 splitter. |
| src/app/app.ts | `showHint()` uses `hintParts`, opens on the page for `hintPartAt(def, player.cx)`, and falls back to `hintPages(hint)`. `hintTick()` moves the label as Dad moves and closes on a restart. The picker gets `status`. Toast and settings use `cityName`. Home preview: `startStage(id, challenge, preview)`, the `preview` snapshot and restore in `endSession`, `onStageClear` and `leaveToStages` go back to the map, a Preview badge on the HUD, and the "Sneak a peek" button and the coming-soon postcard on the city card. |
| src/ui/home.ts | `cityName()` ("Chandigarh (Punjab)" only when two chapters share a name). `homePicker` takes `status` and marks each row `.built` "Ready to play" or `.soon` "Coming soon". |
| src/ui/style.css | `.hs-here`, `.hs-b` and the 4-column strip grid; `.hp-city.built/.soon`, `.hp-tag`; `.cc-peek`, `.cc-peek-note`, `.previewbadge`, `.homepost` and `.hpo-*` |
| scripts/uishots-r2.mjs (new) | the round 2 checks and screenshots |

Nothing in src/game, src/render or src/audio changed. The only src/game use is importing `hintPartAt` from src/game/levels/chunks.ts. No version bump.

## A. The hint opens on the stretch you are in

**Before:**
- Every stage split the joined `hint` into sentences.
- Reopening the hint started at the last part read, wherever Dad was.
- There was no way back to an earlier part.

**After:**
- **Long stages** (with `hintParts`):
  - Each part is split into pages, and every page remembers its part.
  - The hint opens on the first page of the part Dad is in, from `hintPartAt(session.def, player.cx)`.
  - The pages of that part show a yellow **"You are here"** label under the 💡 counter, and the counter turns light.
  - The label follows Dad. `hintTick` calls `setHere` every frame, so walking into the next stretch moves the label.
  - Tap goes forward, and the last tap closes the strip. A new **‹** button goes back. It is hidden on page 1.
- **Stages without `hintParts`** (plain rooms such as TVM-03): round 1's splitter and the last part read, with no label. Checked: `TVM-03 "💡 1/5" here=false`.
- **Unchanged from round 1:**
  - The strip sits under the HUD, at y 60-128 at 780x360 (19% of the height, because of the label) and y 60-133 at 844x390.
  - It goes see-through over Dad or the door.
  - A death, a restart, a swipe up, × or leaving the stage closes it.
- **The API fits.** `hintParts`, `hintAt` and `hintPartAt` worked as documented. I made no API change and needed no workaround.

**Checks, RNC-05 (3 parts, at tiles [0, 32, 71.5]), both sizes:**
- Dad at the start: "💡 1/7, You are here". After a tap: 2/7, still part 0. Back: 1/7.
- Dad moved to tile 73.5 (the door stretch): it opens on **6/7** with "You are here" and the back button showing.
- A restart closes the strip.

**Shots:**
- `ui-shots-r2/hint-here-RNC-05-part0-{780x360,844x390}.png`
- `ui-shots-r2/hint-here-RNC-05-part2-{780x360,844x390}.png` (the door part: Dad, the tiger and the door all visible)
- `ui-shots-r2/hint-next-RNC-05-*.png`

## B. Picker: 36 chapters, state names, ready / coming soon

**Before:**
- Round 1 already listed all 36 chapters in journey order, grouped by region, with the state under the city name.
- Nothing told built cities apart from unbuilt ones.

**After:**
- Every row has a tag, read from `chapterStatus()` (that is `levelsOf(city)`, so city modules from the registry count, and there is no hand list):
  - **"Ready to play"**: the row has a stripe in the city's colour.
  - **"Coming soon"**: the row is dimmer and the tag is grey.
- Unbuilt cities can still be picked as home.
- The two Chandigarh rows read "Chandigarh / Punjab" and "Chandigarh / Haryana", from CHAPTERS.
- In the toast and the settings row, where there is no state line, `cityName()` prints "Chandigarh (Punjab)" or "Chandigarh (Haryana)".
- The local-script name stays on the state line. I tried it on the name line and it cut "Thiruvananthapuram" short, so I moved it back.

**Checks:**
- Both sizes: `36 rows, 15 ready, 21 coming soon`. The 15 ready ones match the 15 built cities, RNC included.
- Upright at 390x844: two columns of 163x64 px buttons, no sideways scroll, the list scrolls.
- From Settings, the picker opens with your city selected (round 1 check, still passing).

**Shots:**
- `ui-shots-r2/picker-top-*.png`
- `ui-shots-r2/picker-bottom-*.png` (North: both Chandigarh rows, all coming soon)
- `ui-shots-r2/picker-upright-390x844.png`
- `ui-shots-r2/picker-upright-north-390x844.png`

## C. Home preview and the coming-soon postcard

**Before:** the home city only decorated the map: the glow, "N cities away", the card badge and the share line.

**After:**
- **Home city built but locked.** The city card shows a yellow **"🏠 Sneak a peek: HYD-01"** button right under the "Escape … first" line, with the note "A preview. No stars, nothing unlocks. Dad still has to get here the long way."
  - The run plays stage 01 with a **PREVIEW** badge under the stage name.
  - At start, the app stores a copy of that stage's save record and `totalDeaths`. `endSession()` puts both back. So the preview saves no attempts, deaths, stars or unlocks.
  - Clearing the stage skips the result screen. It returns to the map on the home city with the toast "Home, sweet trap. Now come back the long way!".
  - Leave from pause also returns to the map.
  - Events `preview` and `preview_clear` are logged.
- **Home city not built yet.** In place of the plain "Coming in the next update" lines, the card shows a dashed **postcard**: a "POSTCARD FROM HOME" stamp, "Dad's on his way to Patna. Traps being built here:", the chapter's own `teasers` (Golghar Spiral, Gandhi Setu Peel), and "Coming in a future update".
  - The greeting and the `famous` line stay above the postcard.
  - CITY_LINE only exists for built cities, so the postcard uses `teasers` from CHAPTERS.
- "N cities away" and the share-card home line from round 1 are unchanged.

**Checks, both sizes:**
- Preview: `screen play, stage HYD-01, badge "Preview"`.
- Preview clear (3 deaths recorded during the run): `screen journey, save unchanged true, HYD-02 unlocked false`.
- Preview leave: `screen journey, save unchanged true`.
- PAT postcard present. Map tag: "Your city / 11 cities away".

**Shots:**
- `ui-shots-r2/map-peek-*.png`
- `ui-shots-r2/preview-badge-*.png`
- `ui-shots-r2/preview-cleared-*.png`
- `ui-shots-r2/home-soon-postcard-*.png`

**What I fixed after looking at the shots:**
- The peek button first sat below 8 locked rows, off-screen. It now sits under the lock line.
- The Preview badge first sat on the lives pill. It now sits under the stage name.

## D. Verify

| check | result |
|---|---|
| `npm run typecheck` | clean (on the tip and on ba18398) |
| `npm test` | 16 files passed, 12 skipped; **1169 passed, 12 skipped** (same as develop d44918b) |
| `npm run build:single` | ok |
| `node scripts/flows.mjs` | ended at BLR-04, `no errors` |
| `node scripts/uishots.mjs ui-shots-r2/r1` (round 1 checks) | `no errors`; restart / swipe / death close the strip; picker, map tag and badge as before |
| `node scripts/uishots-r2.mjs ui-shots-r2` | `no errors`; the results are quoted above |

All shots are in /local/home/saiposh/personal/ldd-inbox/reports/ui-shots-r2/ (round 1 re-run in `r1/`). They are landscape 780x360 and 844x390, plus the picker upright at 390x844, all at 2x. I read them myself.

## Left / not done

- **A preview killed mid-run.** If the app is killed during a preview, the attempts and deaths from that run can stay in the save. The session saves along the way, and the restore runs only on a normal end.
- **Fonts.** This host has no emoji or Indic fonts, so 💡, 🏠, ⏱, 🔒 and the local names show as boxes in the shots. That is the same as round 1.
- **Strip height.** The "You are here" label makes the strip about 14 px taller on long stages (19% of the height at 780x360). It is still all sky.
- **Carried over from round 1:** a talk bar at the top can sit under the strip, there is no keyboard close key, and portrait play was not shot.
- **No push and no version bump.** The integrator merges.
