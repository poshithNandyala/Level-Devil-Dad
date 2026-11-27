# LKO fix round 5 (it_f84d0853)

Branch `city/lko`, worktree `ldd-wt/lko`, tip `110d6d7`. develop `f8288e9` (v0.17.2) merged first at `c43e30d`. No push, no version bump, no shared file edited.

## The honest section: route times (scripted route, s)

| Stage | Round 4 | Now | Floor | Short by |
|---|---|---|---|---|
| 05 Galouti | 39.3 | 49.1 | 60 | 10.9 |
| 06 Kathak | 47.7 | 50.8 | 60 | 9.2 |
| 07 Hazratganj | 51.7 | 54.4 | 120 | 65.6 |
| 08 Bhool Bhulaiya | 37.4 | 44.2 | 60 | 15.8 |
| 09 Kabootarbazi | 66.4 | 70.9 | 60 | met |
| 10 Tehzeeb | 73.1 | 89.7 | 90 | 0.3 |

Six stages are still under their floors. 09 meets its floor, and 10 is 0.3 s short of it.
- **07 is far short.** In 07 I built only the window-shopper (F474). I struck F475 (tonga) and F476 (lamp crowd) with the reasons given below. ALLOCATION-V3.1 adds no family for 07 or 05.
- **06 has 4 acts**, under the ≥ 5 two-play bar: tatkar, tihai, guru and mehfil. v3 has no further 06 row.

Pars are route time × 1.3: 64, 66, 71, 57, 92, 117.

## Part 1: the three fixes (old → new, nearest hazard)

| Fault | Old | New | Nearest hazard from a lagged capture |
|---|---|---|---|
| LKO-09: 336 deaths, tap from a roof checkpoint at capture lag 6/11/12 → `lko-chhat` | The low roofs (row 13), which a hop from a higher roof lands long on, were 4 tiles wide. Lagged captures sat at a+0.8 to a+2.3 and a tap carried 3.1-3.9 tiles into the gap | Every row-13 roof in the room, `hawa`, `jhande` and `girah` is now **7 wide** (`lay()` in s09). The flock lands on the near end of a wide roof (`Flock.near`), so the trap still covers the landing spot of a white-landing hop. The room is re-laid as 8-14 / 17-20 / 23-29 + step 30-31 inside its 32 columns. The room cp moved 20.3 → 23.3; the act cps sit at each low roof's a+0.2, the same as before. **No checkpoint removed, no trap weakened.** | The edge is a+7: from the latest capture (a+2.3) that is 4.7 tiles. Sweep: **0 of 2912** plays die |
| LKO-07 `julus` cp6 x166.5: 8 deaths, tap0 at capture lag 6/11 → `lko-julus` | cp at julus +30.5, where the route has caught up to 30 px behind the procession | cp **+28** (the same position after nala 24 as cp 18 is after nala 12 and cp 42 after nala 36: right after the landing, while the group is still clear of the nala) | Group ≥ ~4.5 tiles ahead at capture. Sweep: **0 of 1680** |
| LKO-05 m7 (`bhara`, half-hoisted rack) replay 7.55 s at lag 12 | rack period 230 ticks | rack period **222** | m7 replay is now **5.42 / 5.38 / 5.55 s** at lag 0/6/12. A period of 214 put the lag-11 route on the ghee tawa (`lko-tawa`), so I did not use it |

## Part 2: new acts, one row each

The registry check for each act is against DECISIONS.md lists 1-2 and the v3 row it comes from. Causes are at lag 0, with ticks at 120 per second, from recorded plays. (a) is the NAIVE play and (b) is the mistake you make while trying the FIX.

| Act | Family | DECISION | Registry check | (a) cause@tick | (b) cause@tick | Act s |
|---|---|---|---|---|---|---|
| `lko05-charkhi` | F471 hop-at-the-turn | The spit turns by itself. Hop as the skewers come up flat, while they still rock. A skewer that has gone still is about to turn back | Built under the ruling: the NAIVE is "wait for the still skewer", and the window opens on the skewer's own turn (no cook, no pour). `ghee` (the window opens on the cook's pour) is a different read | `lko-seekh`@4662 (waited till they lay still) | `lko-tawa`@4884 (stayed on the heap till it burned) | ~10 |
| `lko06-guru` | F472 control-flip-toggles-on-cue | At every stamp left and right swap; the next stamp swaps them back. Treat each stamp as a change of state | B23 (`flipControls`); nothing else in the registry flips at a cue | `lko-ghungroo`@3144 (kept pressing the old way, back over a strip) | `lko-chakkar`@3134 (stopped to check: a bow) | ~5 |
| `lko07-dukaan` | F474 pass-on-the-attention-side | The window-shopper steps back blind. Pass on the side he is looking at: up on the sill, over his head | v3 F474 (v3.1 numbers it F475; I go by the name). Not PAT's step-aside (he never comes at you) | `lko-dukaan`@5700 (open pavement behind him) | `lko-shamiyana`@5691 (waited for him to finish) | ~3 |
| `lko08-darwaza` | F477 portals-rearrange-after-warp | Through the hall door the arch has moved. Look again before you jump | B30 (portals that rearrange); not `toota` (that arch is broken, it never lifts) | `lko-kuan`@4119 (jumped at the remembered arch) | `lko-bhool`@4110 (hopped the door, so nothing moved, and that arch lifts into the hooks) | ~4 |
| `lko08-sargoshi` | F479 keep-off-the-wall | The rail ledge carries your steps to the guard. Walk the middle, though it has up-lit holes | v3 F479. The holes use 08's own light-direction read (`roshandan`) as the FIX's cost, the way v3 asks | `lko-sargoshi`@4536 (by the rail) | `lko-roshandan`@4426 (ran the middle without reading the light) | ~3 |
| `lko10-seedha` | 10's break of 06's guru | Tonight a stamp swaps nothing: keep pressing the way you were going | v3 10 row: "the stamp no longer flips" | `lko-ghungroo`@8342 (pressed the other way, as 06 taught) | `lko-chakkar`@8332 (stopped to check) | ~5 |
| `lko10-do` | 10's break of 06's tihai | Tonight sam comes on the second phrase, and the boards are chikan covers (a pause on one is a bow) | v3 10 row: "she stops at two" | `lko-tihai-do`@9160 (counted to three) | `lko-tehzeeb`@8901 (stood still on a covered board) | ~9 |
| `lko10-thahra` | 10's break of 08's hall door | Tonight the maze stays put, and the floor past the door is covers: run on and jump the arch you saw | v3 10 row: "the maze stays put after the warp: run" | `lko-tehzeeb`@9876 (stopped to look again, as in the maze) | `lko-kuan`@9970 (jumped where 08's arch moved to) | ~5 |

In every row (a) and (b) differ in cause and in tick. Some ticks are close: guru 3144/3134, seedha 8342/8332, darwaza 4119/4110, dukaan 5700/5691. Each of those pairs dies in different places for different reasons.

**Struck, with reasons:**
- **F475 sound-names-the-side (tonga).** "The side it will pass" is a depth axis (two sides of a road). This 2D engine has one lane, and any up/down stand-in I found was a different idea (height, not side). It is an engine row in v3's own sense.
- **F476 crowd-gathers-under-light.** In one lane, "take the dark stretch before its lamp lights" reduces to one of two things. Either you run before it lights, which is a momentum beat; 07 already has shaam, and I1/S11 forbid a second. Or you wait for the crowd to leave, which is a second window of the strollers.
- **10.6 "only lit arches lift".** Same thought as `lko08-toota` ("an arch must be whole to lift you"): a self-repeat of the W-type.
- **"The bell rings on the side he won't pass".** This break needs F475, which I struck.
- **10.3 and 10.5** stay struck.

shaam's which-awning-next tell is now also drawn as v3.1 describes it: the shop boy at the crank of the shivering awning (art only, `1c4c3b4`).

## The lag-captured sweep

Method: FIX-7.md's, using `qa6.test.ts` from `ldd-wt/qa-pat` copied to a scratch file.
- The route is played at lag 0/6/11/12 and spawn-idle 0/37/120/251, and each checkpoint is captured where that lagged run takes it.
- The world is rebuilt by `replay()` at that tick, and 7 plays are run: idle 4 s, run 0.3 s after 0/6/12 ticks, and tap-jump after 0/6/12 ticks.

The full ten-stage run finished at 06:14 UTC. It found 12 failures in LKO-10 (the guru checkpoint, tap → bow) and 05's charkhi mistake replays over 7.5 s. After fixing both, I re-ran 05, 06 and 10. The 05 re-run came after its last change, and no stage's code changed after its run.

| Stage | Capture points | Plays | Deaths | Longest stretch |
|---|---|---|---|---|
| LKO-01 | 5 | 560 | 0 | 5.1 s |
| LKO-02 | 7 | 784 | 0 | 7.3 s |
| LKO-03 | 7 | 784 | 0 | 9.4 s |
| LKO-04 | 6 | 672 | 0 | 8.1 s |
| LKO-05 | 9 | 1008 | 0 | 22.8 s |
| LKO-06 | 15 | 1680 | 0 | 8.0 s |
| LKO-07 | 15 | 1680 | 0 | 6.3 s |
| LKO-08 | 18 | 2016 | 0 | 7.1 s |
| LKO-09 | 26 | 2912 | 0 | 6.3 s |
| LKO-10 | 22 | 2464 | 0 | 10.1 s |

That is **0 deaths in 14,560 plays**. Every stretch is ≤ 25 s. 05's 22.8 s is the charkhi spit waits at lag 12, and it is the longest.

## The replay table (replay from the last checkpoint to the death, worst of every NAIVE/FIX/MISTAKE)

| Stage | Worst replay | Which play (lag 0 / 6 / 12) |
|---|---|---|
| LKO-01 | 4.65 s | fix 4.28 / 4.65 / 4.47 |
| LKO-02 | 3.24 s | m4 3.24 / 3.22 / 3.21 |
| LKO-03 | 6.57 s | m5 6.56 / 6.57 / 6.56 |
| LKO-04 | 7.46 s | m0 7.35 / 7.46 / 0.68 |
| LKO-05 | 6.33 s | m1 5.25 / 5.48 / 6.33 (bhara m7 now 5.42 / 5.38 / 5.55; charkhi 1.98-2.17 and 3.83-4.02) |
| LKO-06 | 4.17 s | |
| LKO-07 | 3.99 s | |
| LKO-08 | 4.67 s | m1 4.37 / 4.46 / 4.67 |
| LKO-09 | 6.14 s | |
| LKO-10 | 5.72 s | m21 (`do`, counted to three) 5.72 / 5.72 / 5.72 |

Every replay is ≤ 7.5 s at lag 0/6/12. Some lagged NAIVE/FIX plays survive at lag 6 or 12 ("nodeath" in the rows; 09's naive at lag 6, for example). Those come from earlier rounds and count as no replay.

## cpsafe, fair, suite, flows

- `tests/cpsafe.test.ts`: green for all ten LKO stages.
- `npm test` (scratch files moved out): **1851 passed, 20 skipped** (1871) across 18 files, counted off every allow-list. `npm run typecheck` is clean.
- `LDD_N=80 npm run fair -- LKO`: 6t 100% and 12t 100% on all ten stages; 18t is 76%-100%; every stretch is 100% at 0-12t.
- `node scripts/flows.mjs`: "no errors".
- Heavy runs were one at a time, per the host-memory note, and I killed my own stray vitest PIDs.

## Sheets read

Route sheets were re-shot and read for 05, 06, 07, 08, 09 and 10, and copied to `reports/cities/lko/shots/` (`LKO-05-sheet.png` to `LKO-10-sheet.png`):
- **05:** the charkhi rack and its heaps read. At phone size the skewers' rocking is small, so the turn is clearer in motion than in a still frame.
- **06:** guru and tihai read.
- **07:** the window-shopper under the lit window and his sill read; shaam's awnings read.
- **08:** toota, darwaza (the door and the single arch), sargoshi (rail ledge, grille, holes) and roshandan read.
- **09:** the seven-wide low roofs read clearly.
- **10:** the guru, the short tihai (the tabla dais floats in the sky, as in 06) and thahra read.

Death frames were not re-rendered this round. The deaths are recorded in `/tmp/lko-deaths/` (cause and tick above).

## Tip

`110d6d7`. Commits this round:
- `c43e30d`: merge develop.
- `c7a1bee`: Part 1.
- `171c2cf`: dukaan.
- `72aca1d`: guru.
- `e185930`: charkhi.
- `a3d1d54`: seedha.
- `d47c33c`: do.
- `3a0699b`: sargoshi.
- `5b7de69`: darwaza.
- `172e126`: thahra.
- `78e759e`: pars and docs.
- `1c4c3b4`: shaam's crank boy.
- `110d6d7`: guru checkpoint and charkhi mistakes.

Not done or not checked:
- F475, F476, 10.6 and the bell break are struck (reasons above).
- 06 has 4 acts, under the ≥ 5 bar.
- 07 is 65.6 s under its floor.
- Death frames were not re-rendered.
- Scratch tests (`tests/lko-*.test.ts`, the qa6 copy, `scripts/dev/lko-deathshots.mjs`) are untracked and kept out of the full run.
