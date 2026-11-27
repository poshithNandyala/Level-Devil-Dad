# CCU · Kolkata: length pass

- **Branch:** `city/ccu` in `/local/home/saiposh/personal/ldd-wt/ccu`, tip **`e1d5082dd4092e6dcb59fe94a94c2bb4e557dc33`**. Not pushed, no version bump.
- Commits in this round: `355faff` (CCU-10 FIX, CCU rows in MECHANICS.md), `08dbc9f` (cut the repeated windows), `e1d5082` (pars to route × 1.35, act ids in docs).
- **Clear time** = the scripted route, `play(def, SOLUTIONS[id])`, at 120 ticks/s. All ticks below are on that clock. Par = clear × 1.35.
- Files: `src/game/cities/ccu/`, `tests/cities/ccu.ts`, `docs/cities/CCU.md`, CCU rows in `docs/MECHANICS.md`. No shared file.

## Result in one table

The repeat probe (below) cut every second-and-later identical repeat. After the cut, four stages are under their floor. I did not add a new betrayal to make up the time: the one unused CCU reserve is R2 (Hooghly bore), and it did not fit this budget. These are the honest lengths.

| Stage | Before (BUILD.md, 05:15) | At 355faff (with repeats) | **After the cut** | Floor | Short by | Par |
|---|---|---|---|---|---|---|
| 05 | 22.8 s | 60.4 s | **60.4 s** | 60 s | met | 82 |
| 06 | 41.9 s | 62.8 s | **62.8 s** | 60 s | met | 85 |
| 07 | 51.5 s | 127.5 s | **81.9 s** | 120 s | 38.1 s | 111 |
| 08 | 23.4 s | 63.5 s | **45.4 s** | 60 s | 14.6 s | 61 |
| 09 | 16.6 s | 61.4 s | **37.3 s** | 60 s | 22.7 s | 50 |
| 10 | 49.6 s | 95.8 s | **80.9 s** | 90 s | 9.1 s | 109 |

Why each short stage stops there: every act left in it is either a distinct betrayal type or the one allowed momentum repeat. Adding more seconds would mean a second identical repeat (padding, cut by probe a) or a new CCU betrayal type. The CCU allocation has one family per stage plus two reserves. R1 (kumir-danga) went to 01 in the earlier note. R2 (Hooghly bore: the tide comes up the ghat steps on a timetable) is unused, and it is the next act to build, on 07 first (the largest gap), then 09.

01-04: your brief says they stay as they are. They were lengthened under an earlier note (01 15.2 → 27.0 s, 02 16.9 → 34.6 s, 04 17.1 → 27.0 s) and I left that in. Revert commits: `1f4b3a5` (02, 04), `db39528` and `fd1fb61` (01).

## 1. CCU-10 FIX

NAIVE rides the single bundle: the customer buys it from under you, **ccu-boi at tick 682**. The obvious fix is to switch to the porter with three bundles and stay on him: he walks on past the far kerb over the bus stand's drain, **ccu-nala at tick 1703**. That is a different trap, cause and tick. The answer is to step off at the kerb (the hint says "down to the far kerb"). Code: `fix['CCU-10']` in `tests/cities/ccu.ts`. Both are in the `npm test` NAIVE/FIX checks and pass.

## 2a. Repeat windows

| Stage | Act | Windows | What changes per window | Verdict |
|---|---|---|---|---|
| 05 | ccu05-pratima, ccu05-ghatpar | 2 mud crossings on a carried figure | second crossing: slower painters (wait only) | **kept, 1 repeat = momentum beat** |
| 07 | ccu07-sandhya | 1 relay span | first relay: tall, short, tall porters at CHA boards | kept (the act) |
| 07 | ccu07-ulto | 1 relay span | heights in the other order, so the move is reversed (hop up instead of walk off) | **kept, momentum repeat** |
| 07 | ccu07-bhor, ccu07-dupur, ccu07-raat | 3 relay spans | speeds and oncoming-load thickness only | **cut (padding)** |
| 08 | ccu08-tokta | 1 broken rok | sit so the tea seller lays his plank | kept (the act) |
| 08 | ccu08-gali | 2 breaks in one lane | same rule; the plank goes back up behind him | **kept, momentum repeat** |
| 08 | ccu08-duur | 1 break | tea seller far off and slow (wait only) | **cut (padding)** |
| 09 | ccu09-uthan | 1 lift tower | ride the tied panel up, step off at the top at once | kept (the act) |
| 09 | ccu09-uthan2 | 1 lift tower | slower decorators | **kept, momentum repeat** |
| 09 | ccu09-uthan3, ccu09-uthan4 | 2 lift towers | waits 3.5 / 3.9 s only | **cut (padding)** |
| 10 | ccu10-setu | 1 porter span | 07's relay as the finale callback | kept (the act) |
| 10 | ccu10-phera | 1 porter span | the short porter, back the other way | **kept, momentum repeat** |
| 10 | ccu10-shesh | 1 porter span | speeds only | **cut (padding)** |

Out of scope but recorded: 02 `ccu02-depot` repeats the finale's bus type and 04 `ccu04-thak2` repeats `thak`. Each is a single repeat.

## 2b. Same-tick probe (stage NAIVE vs FIX, cause + tick)

| Stage | NAIVE cause | NAIVE tick | FIX cause | FIX tick | Different tick | Different cause |
|---|---|---|---|---|---|---|
| 01 | ccu-rail | 1500 | ccu-rail | 1485 | yes (15 ticks) | **no** |
| 02 | ccu-gir | 232 | ccu-nala | 414 | yes | yes |
| 03 | ccu-muri | 574 | ccu-lonka | 618 | yes | yes |
| 04 | ccu-boi | 151 | ccu-boi | 261 | yes | **no** |
| 05 | ccu-phata | 183 | ccu-murti | 522 | yes | yes |
| 06 | ccu-dando | 791 | ccu-points | 2150 | yes | yes |
| 07 | ccu-cha | 896 | ccu-bojha | 457 | yes | yes |
| 08 | ccu-dhowa | 535 | ccu-khod | 1283 | yes | yes |
| 09 | ccu-bansh | 195 | crushed | 341 | yes | yes |
| 10 | ccu-boi | 682 | ccu-nala | 1703 | yes | yes |

05-10 pass. 01 and 04 fail the different-cause test: their FIX dies of the same trap 15 and 110 ticks apart. Both are build-pass stages that your brief keeps as they are, so I did not change them. They are the next thing to fix if the rule applies to all ten.

## Per added act: betrayal, NAIVE and FIX (cause + tick)

The NAIVE and FIX here are the act's own mistake scripts in `MISTAKES` (tests/cities/ccu.ts). Each act's intro line is its `advice:` text.

| Stage | Act | Betrayal | NAIVE (cause @ tick) | FIX (cause @ tick) |
|---|---|---|---|---|
| 05 | ccu05-uthon | walking two steps down cracks a dry figure | walk off on to the figure two steps lower: ccu-phata @ 701 | (stage FIX) rest on the horse: ccu-murti @ 522 |
| 05 | ccu05-pratima / ghatpar | mud too wide to jump; ride a figure carried out when its paint is done | jump the mud from the step: ccu-ganga @ 1625 | step off the figure as it moves: **ccu-ganga @ 1625** |
| 06 | ccu06-duiline | an other-line tram brushes the rear step at the island | stay on the step: ccu-dui @ 5494 | climb to the roof: ccu-dando @ 4692 |
| 07 | ccu07-sandhya | porter relay, each sets down at his CHA board | stay on the first porter: ccu-cha @ 4869 | stay on the second porter: ccu-cha @ 5433 |
| 07 | ccu07-ulto | the relay the other way up | stay on the first porter: ccu-cha @ 6867 | stay on the tall porter: ccu-cha @ 7327 |
| 07 | ccu07-pylon | shelter: the porter who leaves at once | take him: ccu-cha @ 7913 | (none scripted) |
| 08 | ccu08-rok | the maid washes the rok on a beat | wait by the second adda: ccu-dhowa @ 702 | (stage FIX) ccu-khod @ 1283 |
| 08 | ccu08-gali | sit for the plank, then cross right behind him | jump the first break: ccu-khod @ 2387 | sit on after he has gone: ccu-khod @ 4396 |
| 09 | ccu09-sinri | a panel tied on your foothold | rest on the new panel at the top: crushed @ 722 | (stage FIX) crushed @ 341 |
| 09 | ccu09-uthan / uthan2 | a tied panel lifts you; step off at the top | jump for the high bamboo early: ccu-bansh @ 1947 | rest on the lifted panel: crushed @ 3192 |
| 10 | ccu10-setu / phera | back over Howrah Bridge on the porters | stay on the first porter: ccu-cha @ 6368 | stay on the short porter: ccu-cha @ 6922 |

Weak spots this shows, not fixed in this round:
- 05 pratima: the two scripts die of the same cause on the same tick (both land in the mud at 1625). That is one death, not two.
- 07 sandhya, 07 ulto, 08 gali and 10 setu/phera: both scripts die of the same cause on different ticks. In a relay act both natural mistakes ride a porter too long, so both die of ccu-cha.
- Acts with no own script (05 lane/ghat, 06 points, 07 girder/dui, 08 tokta, 09 toran/chala, 10 bus/tram/rok/kumor) are covered by the stage NAIVE/FIX and the build pass.
- No hidden item was added for any act. Each stage keeps its one item.

## Checkpoints (long stages)

Times are seconds on the route clock. Replay is the time from the last checkpoint to the death, for the stage NAIVE/FIX and the act mistakes above. Bar: stretch ≤ 25 s, replay ≤ 8 s.

| Stage | Checkpoints at | Stretches | Max stretch | Replays after a death | Over the bar |
|---|---|---|---|---|---|
| 05 | 7.7, 12.4, 30.0, 33.2, 53.3 | 7.7, 4.8, 17.6, 3.1, 20.1, 7.1 | 20.1 | 1.5, 4.3, 5.8, 1.1, 1.1 | none |
| 06 | 44.9, 57.5 | **44.9**, 12.6, 5.3 | **44.9** | 6.6, **17.9**, **45.8**, **39.1** | stretch s0; 3 replays |
| 07 | 22.1, 32.1, 47.3, 62.5, 75.8 | 22.1, 10.0, 15.1, 15.2, 13.4, 6.0 | 22.1 | 7.5, 3.8, **8.5**, **13.2**, **10.0**, **13.8**, 3.5 | 4 replays |
| 08 | 9.0, 18.3, 39.8 | 9.0, 9.3, 21.6, 5.6 | 21.6 | 4.5, 1.7, 5.8, 1.6, **18.4** | 1 replay |
| 09 | 7.5, 13.7, 24.9, 35.7, 35.8 | 7.5, 6.2, 11.1, 10.8, 0.1, 1.5 | 11.1 | 1.6, 2.8, 6.0, 2.5, **12.9** | 1 replay |
| 10 | 17.5, 36.4, 38.8, 42.5, 45.4, 59.7, 75.2 | 17.5, 18.9, 2.4, 3.7, 2.9, 14.3, 15.4, 5.7 | 18.9 | 5.7, 3.8, 7.6, **12.3** | 1 replay |

(02, out of scope: one replay of 9.4 s.)

What the misses are:
- **06 first stretch, 44.9 s.** The whole of it is one ride: the base room's dug-up road (cells 11-31) and the island act are crossed on the tram. A checkpoint only takes when the player is on the ground (`world.ts:571`), and there is no ground between the stop at cell 8 and the island. A checkpoint mid-ride would respawn you over the muck. Fixing it needs a stop with pavement in the middle of the ride. That is a stage change I did not make in this round. 06's other replays come from the same stretch: 45.8 s and 39.1 s are deaths at the duiline junctions, which you reach after waiting on the island.
- **Replays over 8 s on 07, 08, 09 and 10.** In each case the death comes late in a stretch that is itself under 25 s, and the mistake script spends extra time waiting (on a porter or the adda) before it dies. A checkpoint on the pylon step in mid-span on 07 and 10, before the gali break on 08, and at the foot of the uthan tower on 09 would bring each one under 8 s. Not done in this round.

## Proof

- `npm test` at `08dbc9f` (after the cut): **1595 passed, 12 skipped (1607)**, exit 0. That is 2 fewer than 1597 because the mistake routes for the cut acts were removed. After `e1d5082` (pars and docs only) I re-ran the par-reading files: `frozen-behaviour`, `showmap` and `levels` passed 834, skipped 1. `tests/allocation.test.ts` passed 10.
- Flows (`npm run build:single && node scripts/flows.mjs`): exit 0 (`FLOWS 0` in `/tmp/ccu/flows.log`).
- Fairness, `LDD_N=80 npm run fair -- CCU`, after the cut. The bar is 0-12 ticks: 90% per stage and 95% per stretch, and every value is 100%. The 18t column is shown but is not part of the bar. The log does not print N; I set it on the command line.
```
CCU-01: 6t 100%  12t 100%  18t 100%   s0 100% s1 100% s2 100% s3 100% s4 100% door 100%
CCU-02: 6t 100%  12t 100%  18t 100%   s0 100% s1 100% s2 100% door 100%
CCU-03: 6t 100%  12t 100%  18t 76%    s0 100% s1 100% s2 100% door 100%
CCU-04: 6t 100%  12t 100%  18t 88%    s0 100% s1 100% s2 100% door 100%
CCU-05: 6t 100%  12t 100%  18t 93%    s0 100% s1 100% s2 100% s3 100% s4 100% s5 100% door 100%
CCU-06: 6t 100%  12t 100%  18t 100%   s0 100% s1 100% s2 100% door 100%
CCU-07: 6t 100%  12t 100%  18t 76%    s0 100% s1 100% s2 100% s3 100% s4 100% s5 100% door 100%
CCU-08: 6t 100%  12t 100%  18t 100%   s0 100% s1 100% s2 100% s3 100% door 100%
CCU-09: 6t 100%  12t 100%  18t 84%    s0 100% s1 100% s2 100% s3 100% s4 100% s5 100% door 100%
CCU-10: 6t 100%  12t 100%  18t 98%    s0 100% s1 100% s2 100% s3 100% s4 100% s5 100% s6 100% s7 100% door 100%
```
- Shot sheets re-made after the cut and read: 07, 08, 09 and 10, copied to `reports/cities/ccu/shots/`. 05 and 06 were not changed by the cut, and their sheets are from the earlier pass.
- Probe output (clear times, checkpoints and death ticks): `/tmp/ccu/probe2.txt`, made by `/tmp/ccu/zz-probe.test.ts`, which is not committed.
- BUILD.md was updated in place: stage times, pars, act list, tip.

Not done: no new R2 act; the 06 stretch and the over-8-s replays above; same-cause FIXes on 01 and 04; the same-tick pair on 05 pratima. Nobody has played these stages by hand.
