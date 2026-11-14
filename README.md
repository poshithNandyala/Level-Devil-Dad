# Level Devil Dad

A mischievous trap platformer that travels through Indian cities. Every room has one trick:
**surprising on discovery, consistent on retry.** You die, you learn, you beat it:
*"You fooled me. Now I know how to beat you."*

- **112 stages across 14 state capitals**, from Thiruvananthapuram to Raipur (22 more to come, all the way
  to Leh). Every city has its own tricks, music, skyline and language (`"Local | English"` lines).
- 8 stages a city: a welcome tour, then 7 long stages (a trap room, an act and a surprise at the door)
- Tara, a rival who points you at "shortcuts" (with an A/B switch for a mascot or no rival)
- Instant retry (~0.36 s), hidden checkpoints, 7 lives a run, autosave, fully offline
- Travel passport with city stamps, best times, death counts, hints after a few deaths
- Challenge codes (`RPR-05`) and a shareable result card
- Works on Android, iPhone/iPad, and any browser (installable PWA)

**Carrying on with another AI?** Start with [`AGENTS.md`](AGENTS.md) and the paste-ready prompt in
[`docs/PROMPT.md`](docs/PROMPT.md). The handbook is [`docs/HANDOFF.md`](docs/HANDOFF.md); every city
and stage is in [`docs/CITIES.md`](docs/CITIES.md); every idea already used is in
[`docs/MECHANICS.md`](docs/MECHANICS.md).

> Working title. Pick a distinct public name and icon before store release:
> Google Play rejects listings that imply a relationship with another app ("Level Devil").
> The name lives in `src/config.ts`, `capacitor.config.ts`, `index.html` and `public/manifest.webmanifest`.

## Run it

```bash
npm ci
npm run dev          # http://localhost:5173 (use --host URL on your phone, same Wi-Fi)
npm test             # physics + every stage proven beatable (under a minute)
npm run build        # production web build in dist/ (PWA)
npm run build:single # one self-contained HTML file in dist-single/
```

Controls: left thumb moves (slide between ◀ ▶), right thumb jumps (hold for higher).
Keyboard: arrows/A-D, Space/W/Up to jump, R restart, Esc pause. Gamepads work too.

## Android

Quickest test build, no Android Studio or Gradle (Java 17+ and Node only):

```bash
android-test/build.sh   # -> android-test/build/LevelDevilDad-test.apk (under 1 MB)
```

It wraps the single-file game in a tiny full-screen WebView app (`com.poshith.leveldevildad.test`,
so it installs next to the real app). Every build gets a higher version code, so new APKs install over old
ones and keep your progress, **as long as they're signed with the same key**. The key
(`android-test/test-keystore.jks`) is not in this public repo: keep your own copy. Without it the script
makes a throwaway key, and that APK won't install over one signed with your old key. Test-build extras:
runtime errors show as a red banner, and the WebView can be inspected via `chrome://inspect` over USB.
Never ship this key or package to the Play Store.

Easiest on a phone: every push to `main` builds this APK in GitHub Actions and puts it on the release
tagged **`test`** (Releases > test). To make those builds install over your current app, add your key as a
repository secret `TEST_KEYSTORE_B64` (Settings > Secrets and variables > Actions; the value is
`base64 -w0 android-test/test-keystore.jks`).

Option A, full Capacitor app, no local setup: push to GitHub. The **Android APK** workflow builds
`app-debug.apk` on every push; download it from the run's *Artifacts* and install it (each CI run signs
with a fresh debug key, so uninstall the previous one first).

Option B, locally (Android Studio + JDK 21):

```bash
npm run android      # builds the web app, syncs it, opens Android Studio
```

Play Store: create an upload keystore, add the four `ANDROID_*` secrets listed in
`.github/workflows/android-release.yml`, then run that workflow to get a signed `.aab`.

## iPhone / iPad

Needs a Mac with Xcode (the **iOS build check** workflow compiles it in CI without an Apple account).

```bash
npm run ios          # builds, syncs, opens Xcode
```

In Xcode pick your Team under *Signing & Capabilities*, then Run on a device or *Product > Archive*
for TestFlight (requires the Apple Developer Program). Until then, iPhone users can play the web
build: open it in Safari, *Share > Add to Home Screen*. It runs full-screen and offline.

## Web hosting

The **Web build on GitHub Pages** workflow publishes `dist/`. Enable it once under
*Settings > Pages > Source: GitHub Actions*. Shared challenges then include a link like
`https://poshithnandyala.github.io/Level-Devil-Dad/?c=RPR-05&t=24.6&d=18` that opens that exact stage and
shows your friend's time to beat. `#RPR-05` also works.

## How it is built

| Part | Choice | Why |
| --- | --- | --- |
| Language | TypeScript | One codebase for web, Android and iOS |
| Engine | Custom, Canvas 2D, fixed 120 Hz step | Deterministic traps, tiny bundle (~165 KB JS), instant load |
| Physics | Celeste-style integer actors/solids | Pixel-exact collision; platforms push, carry and squish |
| Feel | Coyote time, jump buffer, variable jump, apex hang, corner correction | Demanding rooms that still feel fair |
| Native shell | Capacitor 8 | Real Android/iOS apps; haptics, native share, safe storage |
| Art & audio | Procedural (canvas paths, Web Audio synthesis) | No asset files; works offline; crisp on every screen |
| Font | Baloo 2 by Ek Type (OFL) | Designed in India; bundled, so it works offline |
| Tests | Vitest | Every stage has a scripted solution run in CI |

```
src/
  game/            simulation (no DOM): physics, world, player, replay, cities (all text)
    entities/      everything that moves or kills, one file per state from Goa on
    levels/        one file per city (tvm.ts ... rpr.ts), plus the kit, troll sections, acts, door endings
  render/          renderer, city backdrops and scenes, characters, particles, themes
  audio/           synthesized SFX + per-city music
  input/           touch (multi-touch, swappable), keyboard, gamepad
  platform/        storage (localStorage + Capacitor Preferences), haptics, share, native glue
  app/             screens, session (instant retry loop), HUD
  map/, ui/        the India map; DOM helpers, share card, styles
tests/             physics, a scripted route for every stage, checkpoints, fairness audits
scripts/           headless-Chrome QA (flows, screenshots, touch, audio), icons, dev tools
docs/              handbook, cities, mechanics, changelog, prompt for the next AI
```

## The cities (spoilers)

Done: Thiruvananthapuram, Kavaratti (bonus), Chennai, Puducherry, Bengaluru, Amaravati, Hyderabad, Panaji,
Mumbai, Daman (bonus), Gandhinagar, Jaipur, Bhopal, Raipur. Next: Ranchi. Every stage, with its act and door
ending, is listed in [`docs/CITIES.md`](docs/CITIES.md).

## Adding a stage

Maps are 32×18 characters:

| Char | Meaning |
| --- | --- |
| `#` | ground · `~` wet/slippery ground · `=` jump-through ledge |
| `^ v < >` | visible spikes |
| `@` | spawn · `E` exit door (bottom tile) |
| `a`–`z` | a movable tile group (looks exactly like ground until it moves) |
| `A`–`Z` (not E) | hidden spikes that pop on cue |
| `0`–`9` | named markers for entity placement |
| `%` | invisible solid drawn by a prop |

`build(w)` wires the trick, e.g. `collapseOnStand(w, group(w, 'a'))`. Then add a scripted
route in `tests/` and the naive play it should punish. `npm test` fails if any stage becomes
unbeatable or non-deterministic. The full guide to stages, acts, door endings and adding a whole city
is [`docs/HANDOFF.md`](docs/HANDOFF.md). To trace a route tick by tick:

```bash
LDD_LEVEL=RPR-05 npx vitest run tests/debug.test.ts --silent=false
```

Visual QA in headless Chrome (`npx playwright install chromium` once, or set `CHROME_PATH`):
`npm run qa:shots` screenshots every screen and stage into `shots/`; `npm run qa:flows` exercises
pause, hints, the passport stamp, sharing, multi-touch and audio.

## Playtesting

Tap the version number 5 times (title or settings) to open the playtest panel:

- **Rival variant**: Tara / mascot / no rival, identical traps and timing, for the A/B test.
- **Copy log JSON**: per-device events (start, death with cause and position, restart, hint,
  clear, quit, share opened/completed). Nothing is sent anywhere; collect it from testers.
- **Unlock all** for quick checks.

Automated real-finger check (touches go through the browser's hit-testing like a phone, so an
overlay that steals touches fails it): `npm run build:single && node scripts/realtouch.mjs`
(set `CHROME_PATH` if Playwright's own Chromium isn't installed).

Things worth watching (from the design research): do players understand why they died, do they
retry voluntarily, do they blame the controls, and when they stop, have they simply run out of
content?

## Not included yet (on purpose)

Ads, accounts and online features. The plan was to confirm the traps are fun first, then add one
return feature, then test ads at natural breaks only (never on death or restart).

## Credits

Design, code, art and audio generated for this project. Font: Baloo 2 © Ek Type, SIL Open Font License.
