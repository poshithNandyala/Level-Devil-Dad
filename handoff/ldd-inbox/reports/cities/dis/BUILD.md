# DIS · Dispur (Guwahati), Assam: build report (after the length pass)

- Worktree `/local/home/saiposh/personal/ldd-wt/dis`, branch `city/dis`, head `6e96ad7`. Includes `develop` at `ea12cdf` (merged; a re-merge is "Already up to date"). Nothing pushed, no version bump.
- Files (`git diff --stat develop`): only `src/game/cities/dis/` (now 21 files, `acts2.ts` holds the length-pass acts), `tests/cities/dis.ts`, `docs/cities/DIS.md` and the DIS row in `docs/CITIES.md`.
- Design notes for MECHANICS / WAVE1: `docs/cities/DIS.md` (stage table plus a "Length pass" table of every added act).
- All ten slots built in slot order; `meta` exactly as `docs/allocation.json` v2 (allocation test green). No reserve used.

## Stages

Route time = the scripted route's clear time (bot). Fairness `LDD_N=80`, quick (0-6 t) / average (0-12 t) / relaxed (0-18 t); worst stretch is at average lag. "Max calm gap" = longest time on the route between two hidden checkpoints (or the last one and the door).

| Id | Name | Family [betrayals] | Ending key | Attempt 1 dies to | Attempt 2 (the obvious fix) dies to | Attempt 3 | Route / par (floor) | Fair q/a/r, worst stretch | Checkpoints, max calm gap | Hidden item |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DIS-01 | Nomoskar Guwahati (tour) | carrier-spills-on-contact [carrier-spill] | dis-tea-tray | walking into the tea boy / out of the ghat at once (`dis-spill`) | hopping clean over him: tray tips on to your landing (FIX); climbing out as he passes overhead: backswing (MISTAKE); stepping off the deck as the second boy comes (MISTAKE) | wait in the ghat till he is past; wait on the deck till the second boy sets his tray down | 26.0 s / 34 (25-35) | 100/100/100, 100% | 5, 9.7 s | lal chah |
| DIS-02 | Char | sandbars-relocate-by-level-post [level-post-relocate] | dis-hut-shut | run-jumping bars (`dis-luit`) | waiting on the bar at both marks: it narrows from the right (FIX); waiting for ever on bar 1 (MISTAKE) | at each siren wait for the dashed bar, then go; stop on the hut | 26.2 s / 36 (25-45) | 100/100/84, 100% | 5, 7.1 s | japi |
| DIS-03 | Duta Paat, Ekta Kuhi | plucked-row-steps-down [crop-floor-lowers] | dis-muga-reel (ride the cocoon up, step off at the top; stay on: `dis-reel`) | running at the plucker and the hedge (`dis-basket`) | hopping over her: pinned against the hedge (FIX); close behind on the wet path (MISTAKE) | follow a few steps behind; wait out the sprinkler | 43.8 s / 58 (25-45) | 100/100/100, 100% | 6, 10.8 s | two leaves and a bud |
| DIS-04 | Til Pitha | set-crepe-rolls-you-up [roll-by-shine] | dis-laru-plate | running at the pan (`dis-tawa`) | waiting on the first shiny crepe (`dis-roll`, FIX) | only on shiny, leave before it dulls; hop the laru | 25.3 s / 34 (25-45) | 100/100/100, 100% | 5, 6.8 s | til pitha |
| DIS-05 | Gamosa (HWIK, long) | gamosas-hide-feet-camera [overloaded-blind] | dis-gamosa-latch | straight through the givers: blind at the pit (`dis-gamosa`) | per added act (MISTAKES): run-jump the bars / wait on the narrowing bar; run at the gate / take both yard givers (blind); out of the ghat at once / hop the boy | walk into the red sash to give one away; hop the giver before a pit; keep one for the latch | 61.0 s / 82 (>= 60) | 100/100/76, 100% | 16, 13.3 s | gamosa |
| DIS-06 | Majuli ka Paar | bank-retreats-in-slabs [retreating-bank] | dis-tea-ladder | stopping at the edge (`dis-bank`) | stopping on the first slab (FIX); per added act: jump at the stilt house / walk off its roof; bars x2; ghat x2; pan x2; slabs before the ladder / wait on a slab | cross at a run; wait on the bank for the tea boy and the ladder | 60.5 s / 82 (>= 60) | 100/100/80, 100% | 18, 9.0 s | masor tenga |
| DIS-07 | Husori (marathon, lives: act) | join-moving-group-to-pass-gate [join-group] | dis-uruka-net (cross the pond's net at once; stop on it: `dis-net`) | running at the gate (`dis-gate`) | per added act: stop at the edge / on a slab (the momentum beat); ghat x2 (the shelter beat); run at a gate / go before the host has finished | wait inside the singers' ring, through with them | 126.5 s / 170 (>= 120) | 100/100/80, 100% | 25, 14.2 s | pepa |
| DIS-08 | Gorh (HWIK) | follow-flattened-strip [follow-flattened] | dis-watch-tower | walking into the grass (`dis-beel`) | waiting at the grass edge where the rhino stops (`dis-gorh`, FIX); per added act: grass / edge where the second jeep is; stay on the bank (from behind) / leave the hay when it stops halfway | stand back till every charge has gone, walk the strip; up on the hay when it comes from behind | 66.3 s / 90 (>= 60) | 100/100/100, 100% | 10, 13.0 s | laru |
| DIS-09 | Rang Ghar | roof-curve-slides-stop-at-ribs [slope-ribs] | dis-royal-seat | a hop at each rib: on the oil, the ball drops (`dis-roof`) | per added act: run at a Bihu gate / go before the gamosas are done; hop the ribs / a bigger hop from a standstill (both `dis-roof`); room FIX: climb the pavilion side on to the eave, which is the gutter (`dis-gutter`) | stop on the pad, back to its start, run, one long leap | 62.2 s / 84 (>= 60) | 100/100/100, 100% | 15, 13.3 s | two leaves and a bud |
| DIS-10 | Luit (finale, marathon, lives: act) | finale-level-post-far-bank [level-post-far-bank] | dis-post-bank | run-jumping the bars (`dis-luit`) | per added act: bars / narrowing bar; grass / edge; ghat x2; house x2; walk into every giver / little hop into the fourth (blind) | the city's rules in a new order, then the plucker's path to the post on the far bank | 98.4 s / 133 (>= 90) | 100/100/80, 100% | 21, 13.5 s | lal chah |

Every floor in the conductor's note is met by the bot route: 01 26.0 (25-35), 02 26.2, 03 43.8, 04 25.3 (25-45), 05 61.0, 06 60.5, 08 66.3, 09 62.2 (>= 60), 07 126.5 (>= 120), 10 98.4 (>= 90). Thin margins: 04 (+0.3 s) and 06 (+0.5 s).

## What the length pass added

21 acts (and two retunes), each one of DIS's own ideas used in a stage that had not used it yet, after a plain stretch of road. Each added act has a NAIVE-style and a FIX-style death of its own, both scripted and tested (42 plays, in `MISTAKES` as `<act>: ...` and `<act> (fix): ...`, each starting from the stage route up to the act's own start). Details in `docs/cities/DIS.md`, "Length pass". In short:
- 01: a second tea boy from Fancy Bazar; the deck is the shelter. 02: the river is slower (new bars rise at 0.75-1.1 s after the siren). 04: a fourth crepe in the Bhogali pan.
- 05: sandbars with a taker on a bar; husori yards full of givers; the tea boy's ghat.
- 06: stilt house ladder in the water (twice), a three-mark sandbar channel, the ghat, bank-into-sandbars, a Bhogali pan.
- 07: Majuli's bank (the momentum beat), the ghat (the shelter beat), a three-gate lane with the host's ritual. Calm checkpoints three tiles before every gate wait.
- 08: "the jeep moves": the rhino stops halfway at one jeep and charges on at a second near you (twice), and once from behind with the haystack.
- 09: Rongali Bihu at Rang Ghar (three gates before the roof), a steeper roof.
- 10 (only DIS ideas): sandbars with the post far away, the rhino and two jeeps, the ghat, the stilt house, four gamosa givers.
- Fixes found on the way: the husori groups used to walk on for ever and pile up at the door (they now leave seven tiles after their last house); the river water was drawn sand-coloured (now dark water).

## Tests

- `npm run typecheck`: clean. `npm test`: 18 files passed, 12 skipped; 1616 tests passed, 12 skipped.
- `npx vitest run tests/modules.test.ts -t DIS`: 11 passed (no TODO, no placeholder item, NAIVE for all 10, FIX for 6: 01 02 03 04 06 08, one hidden item per stage, prefix rule, fair list names all 10).
- `npx vitest run tests/levels.test.ts -t DIS-`: 102 passed (routes, determinism, rival variants, NAIVE, FIX and 46 MISTAKES plays).
- `npx vitest run tests/allocation.test.ts`: 10 passed.
- `npm run build:single && node scripts/flows.mjs`: passed, "no errors".

## Fairness output

`/local/home/saiposh/personal/ldd-inbox/reports/cities/dis/fair-N80.txt` (final code): every stage 100% at quick and average lag, every stretch 100% at average lag.

## Screenshot sheets

`/local/home/saiposh/personal/ldd-wt/dis/shots/route/DIS-01-sheet.png` to `DIS-10-sheet.png`, regenerated on the final code. I read 05, 06, 07 and 10 after the length pass (and 01, 03, 08, 09 before it); 02, 03 and 04 changed little and were not re-read.

## Deviations from the allocation, and why

- DIS-09's chain says "A2 climb the pavilion side; A3 stop at ribs". Built: A1 hop the rib (land on the oil, the ball), A3 stop on the pad before each rib and leap. Second pass: the A2 "climb the pavilion side" is built (one-way steps up the side, an upper eave over the oil) and is the room's FIX play: standing on the eave lets a ball roll down it (`dis-gutter`).
- DIS-05 has no room-level FIX; its added acts each have one.
- DIS-01's `meta.ending` is `dis-tea-tray`; the tour has no door twist of its own (the tour helper has none).
- `longStage` takes only tour/short/long/marathon/wtf: std stages are tagged `short`, the HWIK stages `wtf`; all ten are in the fair list.
- The added acts borrow DIS ideas across stages (e.g. the husori gates in 05 and 09, the tea boy in 05, 06, 07, 10). That is how I read "a betrayal from DIS's own allocated ideas"; no idea from another city and no reserve was used.

## What is not done, and risks for QA

1. Replay to the trap: calm checkpoints are at most 14.2 s apart on the route, but where you wait for the husori group or a rhino, a death replays you to the checkpoint before the wait, so the wait repeats (up to about 13 s). It is calm waiting, not a re-run of traps, but it is over the 8 s guideline.
2. Door endings 02, 03, 05 and 07 share a "locked until something happens" shape, and most endings reuse their own stage's mechanic.
3. The added acts reuse DIS mechanics a lot across stages (the ghat four times, the gates in four stages). Each is in a stage that had not had it and each comes with its own deaths, but QA should judge whether 05, 06 and 10 still feel like one idea each.
4. DIS-05: check on a phone that the gamosa cloth really hides the pit and not the HUD.
5. DIS-08 "the jeep moves": the second jeep is visible from the start but silent; check that a player reads which jeep the rhino will run at next.
6. Tara's lies are almost all "Bhal, Dad! / Good, Dad!" (only VERIFIED lines are used); her one truth is in DIS-07.
7. Not checked: touch play on a real device, audio by ear.

## Second pass (length item)

Door endings: only 02 `dis-hut-shut` and 05 `dis-gamosa-latch` keep the "locked until" shape; 03 is the muga reel (reserve DIS-R2), 07 the Uruka net (reserve DIS-R1). DIS-09 has its FIX play (the eave). Details, times and what is still short: LENGTH.md. Shot sheets for all ten stages, all read: `shots/`.
