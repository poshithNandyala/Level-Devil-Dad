# SVP fix round 1 (round 4 of the length work)

Branch `city/svp`, tip `2c587a5dfe2850332af669e93b83443fd345aec2` (two source commits on 7277011). No push, no version bump, no shared file touched. Sweep and replay scratch test: `probes/zz-qa6.test.ts` (not committed).

## Rulings written down for the tester

- **Honest floors are final.** 05 41.5 s, 06 21.2 s, 07 44.5 s, 09 35.3 s, 10 64.5 s; 08 86.8 s meets its floor. The refills for 05, 06 and 09 are "none found" and the 07 struck list is binding. Nothing was padded or invented, F490 and F491 stay refused (LENGTH-3.md).
- **SVP-01 at 7.76 s (lag 12) stays exempt.** It is the shared tour course, and the wait is the route's own.
- **SVP-06 and SVP-09 at 80% at 18 ticks stay parked.** They are 100% at 6 and 12 ticks, which is the bar.

## 1. `svp10-nali` recast as a break

| | Before | After |
|---|---|---|
| Rule in 10 | the hose replayed as in 09 | the hose is fed the other way: over an arch costs the line, under it is free |
| Correct play | over the first arch of each stretch | straight along the sand, under every arch |
| NAIVE (what 09 rewarded) | none (replay) | over both arches: `svp-nali`@5803 |
| FIX (learned it, forgets in the second stretch) | none | under in stretch 1, over in stretch 2: `svp-nali2`@6214 |
| Length | unchanged: 10 is 64.5 s before and after | |

Decision sentence: "Tonight the hose is fed the other way: over an arch costs the line, under it is free." Registry check: `DECISIONS.md` has only SVP's own `svp09-nali`/`svp10-nali` rows and the struck twins (SVP-2, SVP-10 ideas: one line-routing act per city). This is the same act inverted, not a second one, and no other city's v3 or v3.1 family reads an inverted over/under. No match; kept. Code: `Hose` has an `inv` flag (`nali.ts`, `buildNali`), the finale act is `naliFin` in `s10.ts`. The advice line says the hose is turned round and that the old way over the top runs it out; the drawn hose goes taut and white as before.

## 2. The 10 "sit down on the luggage" mistake now dies at lag 12

The crowd's sweep box in the lashed hall (`Crowd`, `low`) was 24 px tall, level with the top of the 24 px luggage stack, so a sitter on it was touched only when the timing happened to bring them in. The box is now 28 px tall. The tall stack is 32 px, so the correct answer keeps 4 px clear, and the route still wins.

| Lag | Replay of the sitter before (s) | After (s) |
|---|---|---|
| 0 | 4.38 (dies, `svp-bheed`@4632) | 4.38 (dies, `svp-bheed`@4754) |
| 6 | 4.65 | 4.65 |
| 12 | no death (`nodeath`) | 4.79 |

## 3. 08 weather for the two new sections

I logged every reset and every rain start of the 08 route (`WXDBG`, temporary, removed). In all eight sections of the stage the bot is in the lee when the first rain starts, and the second rain lands on the awning or slope it moved to:

| Section | Reset tick (tile) | First rain tick (Dad at tile) | Second rain tick (Dad at tile) |
|---|---|---|---|
| chhajja 1 | 5077 (156) | 5297 (163.5, under slope A's high end) | 5807 (163.5, same spot) |
| chhajja 2 | 6368 (186.6) | 6588 (196.8, slope B's high end) | 7098 (196.8) |
| tin 1 | 7552 (212) | 7772 (220.9) | 8282 (227.3) |
| tin 2 | 8736 (242.5) | 8956 (258.6) | 9466 (256.1) |

The slopes' rains land with the walker on the same spot both times (the point of the act), and the tin's rains land with the walker on the other end after the drumming (the point of that one). The tightest is tin 2, where the walk to the far awning is 16 tiles and the rain comes about 10 ticks after the bot arrives; a slower walker gets the near awning's lee end, which is dry for the same rain. I did not change any timing: lengthening a first lull would push the 08 replays (worst 7.47 s) over 7.5 s.

## 4. Pars re-run (`LDD_PAR=1 tests/par.test.ts`, bot clear time x 1.35)

| Stage | Par before | Par now |
|---|---|---|
| 03 | 35 | 39 |
| 05 | 86 | 56 |
| 07 | 80 | 60 |
| 08 | 80 | 117 |
| 09 | 34 | 48 |
| 10 | 133 | 87 |

02, 04 and 06 were not asked for and are unchanged (02 35, 04 35, 06 49; the bot would give 35, 28, 29).

## 5. SVP-10 sweep and replay (`probes/sweep-10-round4.txt`)

Lag-captured sweep, route at lag 0/6/11/12, idle 0/37/120/251, 7 plays per capture:

| Stage | Capture points | Plays | Deaths | Longest stretch | Worst replay, lag 0 / 6 / 12 (s) |
|---|---|---|---|---|---|
| SVP-10 | 11 | 1232 | 0 | 12.3 s | 6.64 / 6.71 / 6.83 |

Per-tick replay for the changed acts (lag 0 / 6 / 12, s):

| Play | Replay |
|---|---|
| hose, over both arches (`svp-nali`) | 2.86 / 2.86 / 2.86 |
| hose, over in the second stretch (`svp-nali2`) | 2.86 / 2.86 / 2.86 |
| sit down on the luggage (`svp-bheed`) | 4.38 / 4.65 / 4.79 |
| wait in the open (`svp-bheed`) | 4.07 / 4.13 / 4.25 |
| down at once from the tall stack (`svp-bheed2`) | 6.64 / 6.71 / 6.83 |

Cause@tick of every SVP-10 play: `probes/p3-round4.txt`. NAIVE `svp-aari`@654 and FIX `svp-magar3`@1290 are unchanged. The old note stands: the FIX and the "trust the board" mistake are the same play (`svp-magar3`@1290).

## Proofs

- `tsc --noEmit`: clean.
- `npx vitest run tests/cpsafe.test.ts -t SVP`: 10 passed.
- Full `npm test` (`npm-test-r4.txt`): 18 files passed, 1773 tests passed, 20 skipped, 0 failed.
- `LDD_N=80 npm run fair -- SVP` (`fair-N80-r4.txt`): 100% at 6 and 12 ticks on all ten stages; 18 ticks 100% except 06 and 09 at 80% (parked, above).
- `node scripts/flows.mjs`: no errors.
- Sheet for 10 re-shot and read: `shots4/SVP-10-sheet.png` (the stale board with ripples, the grey and green roots, the lashed hall, the hose drawn slack under the arches, the fare sign and the pit with the boat).
- Route times unchanged from LENGTH-3.md (01 30.1, 02 25.8, 03 29.1, 04 20.6, 05 41.5, 06 21.2, 07 44.5, 08 86.8, 09 35.3, 10 64.5).

## Skipped or not checked

The 08 timings were measured, not changed (point 3). The other nine sweeps were not re-run: the changes are confined to 10, the hall's sweep box (only 10 uses `low`) and the pars. I did not re-read the 08 sheet.
