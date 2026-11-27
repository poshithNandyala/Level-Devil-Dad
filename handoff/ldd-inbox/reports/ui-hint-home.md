# UI: hint strip + home city (item it_2a1390dc)

- Worktree: /local/home/saiposh/personal/ldd-wt/ui
- Branch: `ui/hint-home` (from main 4e159d9). Not pushed.
- Commits:
  - `a5e3816` Hint as a slim top strip that never covers play, and a home city picker
  - `00c5cec` Add uishots script for the hint strip, picker, home pin and badge at two phone sizes

## Files changed

| File | What |
|---|---|
| src/ui/hintsheet.ts (new) | `HintSheet` strip and `hintPages()` (splits a hint into whole-sentence parts of about two lines) |
| src/ui/home.ts (new) | home key helpers (`homeId`, `homeChapter`, `setHome`), `citiesAway`, `homeLine`, the picker panel |
| src/app/app.ts | `showHint()` rewritten, new `hintTick()` and `showHomePicker()`; boot opens the picker on first launch; map, city card, stage screen, share text, settings row, reset keeps the home key; `Hud.refresh` calls `hintTick()`; `endSession` closes the hint. The `CITY_LINE` block is untouched. |
| src/ui/mapview.ts | optional `home` in `MapOpts`: glow circle, "Your city" and "N cities away" over the pin, the pin never shrinks to a dot |
| src/ui/card.ts | optional `home` on the share card: a "MY HOME CITY" line above the headline |
| src/ui/style.css | `.hintsheet`, picker (`.homepick`, `.hp-*`), `.homeglow`, `.hometag`, `.homebadge`; the far-zoom label-hide rule skips the home pin |
| scripts/uishots.mjs (new) | the screenshot and behaviour check used below |

Nothing in src/game, src/render, src/audio or the tests changed.

## Hint: before and after

**Before:** `showHint()` paused the game and opened a centred panel ("💡 Hint", the full hint text, "Got it") over a dimmed screen. Some hints run past 800 characters, so the panel covered most of the stage.

**After:**
- The hint is a slim strip right under the HUD row, centred, at most 600 px wide.
- At 780x360 and 844x390 it sits at y 60-114, which is 15% and 14% of the height. Play keeps running. Opening the hint from the pause menu resumes the game.
- The hint is split into short parts (whole sentences, about two lines each, three lines at most). The counter shows which part you are on (`1/5`), and a ▸ means more parts follow.
- How it closes:
  - Tapping the strip shows the next part; tapping the last part closes it.
  - Swiping it up closes it, and so does the × button.
  - The next death or restart closes it, and so does clearing or leaving the stage.
- Reopening the hint on the same stage starts at the last part you read.
- It goes see-through (opacity 0.16) whenever Dad or the door is behind it. The check uses the camera's screen position for Dad and every exit zone, and handles the mirror view.
- Opening it removes the first-visit postcard and the stage title, which sit in the same spot.
- The strip has `role="button"`, so a tap on it never reaches the game as a move or jump. The thumb zones at the bottom are free.
- The hint text is unchanged. The hint is still the only voice that names a trap ahead.
- Style matches the rest of the game: the dark HUD pill colours, the hint button's yellow (#ffd166) as an accent edge, and the Baloo font.

**Why a top strip and not a bottom sheet:** this game plays in landscape. The floor, Dad, the touch buttons and Tara's talk bar all sit in the bottom third. The top band under the HUD is mostly sky.

**Talk card and death overlays, checked at both sizes:**
- Tara's talk bar sits at the bottom between the thumb buttons, clear of Dad, and already fades when Dad is behind it (renderer code, not touched).
- The "7" card sits mid-screen in the sky for 3.4 s while Dad respawns at the start. Dad and the floor stay visible (death-seven-*.png).
- The "SO CLOSE" callout sits at 29% height, does not block touches, and clears Dad.

I found nothing that hides Dad or the door while the player must act, so I changed nothing there.

## Home city: the picker flow

1. **First launch.** When there is no challenge link and the key `home` is missing, boot opens "Where are you from?" in place of the title screen.
   - It lists all 36 capitals in journey order, grouped South / West / Central / East / Northeast / North.
   - Each one shows the capital, its state, and the local-script name when the theme has one (the 15 playable cities).
   - "Skip" saves `home: ''` and the picker is never shown again on launch.
   - Tapping a city saves it, opens the title screen, and shows a toast such as "Hyderabad: 5 cities away".
2. **Settings.** A "Home city" section has a "Where are you from?" row showing your current city, with a "Change" or "Pick" button. It works from the title screen and from the pause menu. In the picker your city is highlighted, "No city" clears it, and "Back" returns to settings.
3. **Storage.** One new key, `home`, inside the existing save JSON (localStorage, mirrored to Capacitor Preferences). It holds a chapter id, `''` when skipped, or is missing when never asked. The save parser already keeps unknown keys. "Reset progress" keeps the home city.
4. **Map.** The home pin gets a pulsing yellow glow, with "🏠 Your city" and the distance over it:
   - "N cities away" counts the main-route capitals before home that are not escaped yet.
   - The other texts are "Up next!", "Escaped!", or "Coming soon" for a city not built yet.
   - The city card on the map shows a badge "🏠 Your city · 3 cities away".
5. **Stage screen.** The city's stage list carries a "🏠 Your city" badge next to the name.
6. **Share.** When the stage or city is your home, the share text reads `Escaped Hyderabad, my home city. …` and the share card shows a "MY HOME CITY" line above the headline.
7. **Progression and unlocks are unchanged.** The home city only decorates the screens.

## Screenshots

These are in /local/home/saiposh/personal/ldd-inbox/reports/ui-shots/ and I read them myself. The game plays in landscape, so the two phone sizes are 780x360 and 844x390 (360x780 and 390x844 turned sideways), at 2x pixel density.

- `hint-HYD-03-780x360.png`, `hint-HYD-03-844x390.png`, `hint-TVM-04-780x360.png`, `hint-TVM-04-844x390.png`: the hint open. Dad, the floor and the platforms are visible.
- `picker-780x360.png`, `picker-844x390.png` (first launch), `picker-settings-*.png` (from settings, Hyderabad selected)
- `map-home-780x360.png`, `map-home-844x390.png`: home pin glow, "Your city", "3 cities away", and the card badge
- `stages-badge-*.png`: the "Your city" badge on the stage screen
- `talk-TVM-02-*.png`, `death-seven-*.png`, `death-near-*.png`: the talk card and death overlay check

Limits of these screenshots:
- **Door:** the door is off-screen to the right at the start of HYD-03 and TVM-04. That is where the camera starts, not the strip. The see-through rule covers the door whenever it scrolls under the strip.
- **Missing characters:** this host has no emoji or Indic fonts, so 💡, 🏠, ⏱, 🔒 and the local-script names render as empty boxes in these screenshots. That is true of the existing HUD too. Phones have these fonts.

## Tests and flows

- `npm run typecheck`: clean.
- `npm test`: 13 files passed, 12 skipped; 1145 tests passed, 12 skipped. Same as main before the change. There are no UI tests to update.
- `npm run build:single && node scripts/flows.mjs`: it ended at `BLR-04` and printed `no errors`. Headless Chromium came from `CHROME_PATH=~/.cache/ms-playwright/chromium_headless_shell-1228/...`, because the installed playwright expects build 1254, which is not cached.
- `node scripts/uishots.mjs <dir>`: `no errors`. At both sizes it checked:
  - the first screen is the picker, and tapping a city saves `home=HYD`;
  - tapping the strip moves the hint from part 1 to part 2;
  - a restart, a swipe up and a death each close the strip;
  - the map tag reads "Your city / 3 cities away", the card badge is present, and the picker opened from settings has Hyderabad selected.

## Cut or not done

- **Talk bar at the top:** one door ending moves Tara's talk bar to the top (`flags.subTop`). There the hint strip can sit over it. The bar is drawn in src/render, which I may not edit, so the strip does not avoid it.
- **Keyboard:** the hint has no close key on keyboard. A mouse click works.
- **Portrait mode** ("Play upright anyway") was not screenshotted.
- **No push.**
