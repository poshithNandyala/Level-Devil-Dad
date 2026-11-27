# LKO fix round 4 (it_8b0fce61)

Branch `city/lko`, worktree `ldd-wt/lko`, tip `d22d02f` (on round 3's `ff6aaef`; develop `4c38bcb` already merged). No push, no version bump, no shared test edited.

## The honest section: route times (scripted route, s)

| Stage | Round 3 | Now | Floor | Short by |
|---|---|---|---|---|
| 05 Galouti | 39.3 | 39.3 | 60 | 20.7 |
| 06 Kathak | 37.4 | 47.7 | 60 | 12.3 |
| 07 Hazratganj | 70.7 | 51.7 | 120 | 68.3 |
| 08 Bhool Bhulaiya | 34.1 | 37.4 | 60 | 22.6 |
| 09 Kabootarbazi | 55.4 | 66.4 | 60 | met |
| 10 Tehzeeb | 58.4 | 73.1 | 90 | 16.9 |

07 went down. I applied the registry rulings: `chhidkav` and `kohra` are cut, about 19 s between them. 09 is the only stage that now meets its floor. 05 has nothing new: under the conductor's F471 ruling I did not get to the skewers (see "Not built"). Pars are now the route time x1.3 for 06-10 (62, 67, 49, 86, 95).

**Two open failures in the lag-captured sweep (below), not fixed this round:**
- LKO-09 has 336 failing plays. All are tap-jumps at capture lag 11 that end in `lko-chhat`. At lag 11 the route's hop lands about 4 tiles past the checkpoint, near the far edge of the roof, so the checkpoint is taken there, and a tap from that point drops into the gap.
- LKO-07 has 8 failing plays at `lko07-julus` cp6 x166.5 (tap0 at capture lag 6/11, `lko-julus`).

Both acts are from earlier rounds. The fix in each case is a checkpoint or landing change across the act, and I ran out of time.

**One replay is over the bar:** LKO-05 m7 ("under the half-hoisted rack", `lko05-bhara`, round 2) takes 7.55 s at lag 12. Every other replay is ≤ 7.46 s.

## What changed, and why (registry row ids)

| Change | Commit | Ruling |
|---|---|---|
| built `lko09-girah` (tumblers) | beecd4f | v3 F480 / candidate 9.2 |
| built `lko10-taaga` (coloured thread), then **cut** | a29855c, 42be9f4 | v3 strikes 10.3 as 03's own read |
| built `lko10-daana` (grain beats the flag) | dbd18b3 | 10.4, v3 10's break of 09 |
| built `lko10-chirag` (the lamplighter's lantern) | c53c930 | 10.2, v3 10's break of 04 |
| **cut** `lko07-chhidkav` | 0967e1a | DECISIONS I2 (SVP-08 lee side first) |
| **cut** `lko07-kohra` | 0967e1a | DECISIONS I1/W1. Without the fog, a greeting you must not return has nothing that punishes the stop, so the sentence fails and the act is cut rather than recast |
| `lko07-shaam` recast with a tell: the awning shivering on its rope is next, and two of them are ahead of you | 0967e1a | DECISIONS S11 |
| `lko10-julus`, `lko10-galiyara` are plain callbacks (covered bells removed); `jawab` and `tasveer` keep the covers break | 4e056eb | DECISIONS W2 |
| built `lko08-toota` (broken arch) | f1f6636 | v3 F478 / candidate 8.2 |
| built `lko06-tihai` | ac4fa33 | v3 F473 / candidate 6.1 (v3 outranks my earlier refusal) |
| roshandan legibility | f03046c | round-4 brief |
| struck, not built: 10.5 cold tawa | | DECISIONS I6 (DIS owns the cold maker) |
| struck, not built: 8.4 down-stair | | DECISIONS 5d (= GTK-06 topology) |

**Not built** (in the brief or v3, no time left in the budget):
- F471 skewers (05): under the ruling it must be built with NAIVE "wait for the still skewer" and no turn cue; not attempted.
- F472 control flip (06).
- F474 window-shopper (07). A build was tried and dropped because the route could not reach the sill in time. The patch is kept at `/tmp/lko-dukaan-wip.patch`, not committed.
- F475 tonga bell (07).
- F476 lamps (07).
- F477 portals (08).
- F479 whispering wall (08).
- 10's new breaks 10.6, "the stamp no longer flips", "she stops at two", "the maze stays put", "the bell on the other side".

07 and 05 wait for ALLOCATION-V3.1 as the steer said.

## New acts: the decision table (closest asked idea and the difference)

| Act | DECISION | Closest registry row | Difference |
|---|---|---|---|
| `lko09-girah` | A tumble is not a landing: cross early in the red, through the tumble | W9 (`jhande`, `seeti`: which signal wins) | No new signal. The read is the flock's state under the same flag, so it is not a third "which signal wins" rule |
| `lko10-daana` | Grain beats the flag: the flock feeds on the grain whatever the flag says; cross the grain while they are up, never hop over feeding birds | `lko09-seeti` (a whistle beats the flag) | It sits in 10 as the one break of 09, not a rule in 09. v3 lists it as 10's break of 09 |
| `lko10-chirag` | The light moves with the lamplighter: as he passes each heap, its shady side changes; keep the side away from his lantern | LKO-04 room (the lid flips the light once, for every heap) | 04 flips the light once for every heap at the same moment. Here each heap flips when he passes it, so you read where he is against that heap |
| `lko07-shaam` (recast) | The awning that shivers on its rope is next, and it may be ahead: stop short of it until it is down | S11 PDY-04 `closing` (never stop) | The registry's own fix is a which-next tell. The answer is now to stop, the reverse of PDY's "never stop" |
| `lko08-toota` | An arch must be whole to lift you: the crownless arch at the floor's end lifts no one, so jump the whole arch before it, though the floor goes on past it | 08 room / `lko08-mehrab` (jump the arch where the floor ends) | It reverses the cue 08 taught: the arch at the floor's end is the wrong one |
| `lko06-tihai` | The third repeat of the phrase lands on sam, and on sam every strip rings, the tied-up silent ones too: on the third, be on plain board | S14 (LKO-06 room: sound draws her) | The read is the count of phrases (three lamps on the tabla), not which strip rings |

## Probes: cause@tick for every pair (recorded plays, lag 0, ticks at 120/s)

(a) is the NAIVE, the stage's earlier rule applied. (b) is the FIX's mistake.

| Act | (a) | (b) | Different cause / tick |
|---|---|---|---|
| `lko05-ghee` (r3) | `lko-ghee`@4221 | `lko-seekh`@4120 | yes / yes |
| `lko06-tihai` | `lko-tihai`@1941 (standing on a tied strip through the third phrase) | `lko-tihai`@1940 (running the stage in one go) | **same cause, 1 tick apart**: both die on the first sam. A weak pair, said plainly |
| `lko07-shaam` | `lko-shamiyana`@619 (running the row, no stop) | `lko-shamiyana`@870 (stopping for the first shivering awning only) | same cause / different awning and tick |
| `lko08-upar` (r3) | `lko-bhool`@1979 | `lko-kuan`@1971 | yes / yes |
| `lko08-roshandan` (r3) | `lko-roshandan`@3995 | `lko-kuan`@3940 | yes / yes |
| `lko08-toota` | `lko-toota`@2636 | `lko-kuan`@2635 | yes / 1 tick |
| `lko09-seeti` (r3) | `lko-seeti`@5765 | `lko-seeti-jawab`@5914 | yes / yes |
| `lko09-girah` | `lko-girah`@6570 | `lko-kabootar`@6621 | yes / yes |
| `lko10-tasveer` (r3) | `lko-tehzeeb`@2916 | `lko-photo-jaldi`@2814 | yes / yes |
| `lko10-jawab` (r3) | `lko-tehzeeb`@5638 | `lko-aadaab`@5598 | yes / yes |
| `lko10-raasta` (r3) | `lko-pehle`@6172 | `lko-ganj`@6077 | yes / yes |
| `lko10-daana` | `lko-daana`@6548 | `lko-daana-udaan`@6580 | yes / yes |
| `lko10-chirag` | `lko-chirag`@7679 | `lko-malai`@7820 | yes / yes |

Each 10 callback breaks its stage's rule with a NAIVE and a FIX of different cause and tick: daana breaks 09, chirag breaks 04.

## The three-lag table and the lag-captured sweep

Method: FIX-7.md's, using `qa6.test.ts` from `ldd-wt/qa-pat` copied to a scratch file.
- The route is played at lag 0/6/11/12 and spawn-idle 0/37/120/251, and each checkpoint is captured where that lagged run takes it.
- The world is rebuilt by `replay()` at that tick, and 7 plays are run: idle 4 s, run 0.3 s after 0/6/12 ticks, and tap-jump after 0/6/12 ticks.
- Replay per tick is measured from the last capture to the death of every NAIVE, FIX and MISTAKE, at lag 0/6/12.

The sweep ran before the last commit, which changed roshandan art (f03046c) and pars (d22d02f); neither changes play.

| Stage | Capture points | Plays | Deaths | Longest stretch | Worst replay (any lag) |
|---|---|---|---|---|---|
| LKO-01 | 5 | 560 | 0 | 5.1 s | 4.65 s |
| LKO-02 | 7 | 784 | 0 | 7.3 s | 3.24 s |
| LKO-03 | 7 | 784 | 0 | 9.4 s | 6.57 s |
| LKO-04 | 6 | 672 | 0 | 8.1 s | 7.46 s |
| LKO-05 | 8 | 896 | 0 | 9.8 s | **7.55 s** (m7, lag 12) |
| LKO-06 | 13 | 1456 | 0 | 8.0 s | 3.55 s |
| LKO-07 | 13 | 1456 | **8** (julus cp6 x166.5, tap0, capture lag 6/11) | 6.3 s | 3.99 s |
| LKO-08 | 14 | 1568 | 0 | 7.1 s | 4.67 s |
| LKO-09 | 26 | 2912 | **336** (tap at capture lag 11 → `lko-chhat`, roof checkpoints) | 6.3 s | 6.13 s |
| LKO-10 | 19 | 2128 | 0 | 7.0 s | 4.99 s |

The bar of 0 deaths is not met in 07 or 09, and the 7.5 s replay bar is missed by 0.05 s in 05. The shared `tests/cpsafe.test.ts` (lag 0/6/12, route-captured) is green for all ten stages.

**Triggers:** for every stage I touched, my lag scan (lag 0/6/11/12) reports 0 unsafe checkpoints. Walk-in distances are ≥ 3.5 tiles for the new acts' checkpoints. The tihai and chirag triggers were moved to X(2) and X(4) for this.

## Fairness at N=80 (`LDD_N=80 npm run fair -- LKO`)

| Stage | 6t | 12t | 18t | stretches at 0-12t |
|---|---|---|---|---|
| 01 | 100% | 100% | 84% | all 100% |
| 02 | 100% | 100% | 100% | all 100% |
| 03-04 | 100% | 100% | 76%+ | all 100% |
| 05 | 100% | 100% | 76% | all 100% |
| 06 | 100% | 100% | 80% | all 100% |
| 07 | 100% | 100% | 98% | all 100% |
| 08 | 100% | 100% | 93% | all 100% |
| 09 | 100% | 100% | 76% | all 100% |
| 10 | 100% | 100% | 80% | all 100% |

## Suite

- `npm run typecheck`: clean.
- `npm test`: **1797 passed, 12 skipped** (1809) across 18 files. Round 3 had 1790. This count was taken off every allow-list.
- Targeted LKO levels and modules tests after the par change: 165 passed.

## Flows

`node scripts/flows.mjs` (with CHROME_PATH set) ends "no errors". A first run without CHROME_PATH failed to launch the browser; that was not a game error.

## Sheets and death frames read

Death frames were rendered and read for every round 3 and round 4 act still in the game. They are in `reports/cities/lko/shots/deaths4/`:
- `r4-LKO-05.png` (ghee)
- `r4-LKO-06.png` (tihai)
- `r4-LKO-07.png` (shaam)
- `r4-LKO-08.png` (upar, roshandan, toota)
- `r4-LKO-09.png` (seeti, girah)
- `r4-LKO-10a.png` (tasveer, jawab, raasta)
- `r4-LKO-10b.png` (raasta, daana, chirag)

Cut acts (kohra, chhidkav, taaga) were not shot.

What the frames show:
- **toota:** the whole arch, the broken arch (two stub piers, fallen stones) and the gallery all read at phone size.
- **chirag:** the lantern glow sits on the heaps as he passes. The heaps are small.
- Every death frame also carries the stage title card, because the frame tool restarts the stage. This is an artefact of the tool, not of play.

Route sheets were re-shot and read for 06, 08 and 09 (`shots/LKO-06-sheet.png`, `LKO-08-sheet.png`, `LKO-09-sheet.png`):
- **06:** the tabla player and his three lamps are readable. He hangs in the sky on a small dais, and the tied grey strips are faint at phone size.
- **08 roshandan:** each floor patch now has a lit window frame in the vault above it, and each hole is a black slot with a lit lip, with dust falling or rising. At phone size the four beams are still similar trapezoids, so the window/slot pair carries the read. **Better, not yet unmistakable.**
- **09:** read; girah's tumbling flock reads against the flag.

I did not re-shoot or re-read 03 and 05 this round. Their acts are unchanged since round 3's reading.

Skipped or not checked: the F471/F472/F474-F479 acts and 10's remaining breaks. The 07 and 09 sweep failures and the 05 7.55 s replay are open. Scratch tests (`tests/lko-*.test.ts`, the qa6 copy, `scripts/dev/lko-deathshots.mjs`) are untracked and were kept out of the full run.
