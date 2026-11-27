# CCU fix round 2

Tip: `41d4343` on `city/ccu` (worktree `ldd-wt/ccu`). Not pushed, no version bump. Develop was not merged again this round; the last merge is `1de9280` (develop 4c38bcb).

## Honest section: what this round did not meet

1. **The replay bar is missed on 06, 07, 09 and 10. This is the main Part 1 item, and it is not done.** The bar is ≤ 7.5 s, measured per tick (every 30 ticks, with stop, run and run-jump for 4 s) at lag 0, 6 and 12. The worst replay at lag 0 is:

   | Stage | Worst replay | Where | Stretches over 8 s |
   |---|---|---|---|
   | 05 | 8.1 s | cp0 x27.0 to the ccu-murti at x58 | 1 |
   | 06 | 22.2 s | cp1 x38.3 to the ccu-khod at x82.9 (the tram ride between the two island stops) | 4 |
   | 07 | 21.4 s | cp4 x200.5 to the ccu-baan at x272.7 (pylon to the jowar causeway) | 7 |
   | 08 | 4.5 s | ok | 0 |
   | 09 | 14.6 s | cp7 x180.2 to the ccu-bansh at x211.6 (line) | 2 |
   | 10 | 14.0 s | cp12 x275.5 to the ccu-gaari at x335.9 (setu) | 4 |

   Lag 6 and lag 12 give the same picture within 0.3 s (table below). This probe measures from the tick the route touched the checkpoint, so a stretch of ride with no checkpoint counts in full.

   The cause is structural. A checkpoint is a fixed position, and the long stretches are rides (tram, porters' head-loads, the queue) with no ground under them. A checkpoint placed mid-ride respawns Dad in the air where the ride was. This round I added ground stops where a ride could take one: 06's second island at column 39, and 07's long pylon steps for horn and board. Every checkpoint that exists now is calm (sweep below: 0 deaths). Closing the rest needs one of two things. Either a ride checkpoint (respawn on the tram or porter at the moment you touched the checkpoint), which is shared engine code outside my files. Or a ground stop on every ride every 6 s or so, which lengthens 06, 07 and 10 and changes their acts.
2. **The 08 FIX shares its cause with the NAIVE.** The NAIVE is ccu-dhowa @535 and the FIX is ccu-dhowa @702. That is a different tick but the same cause. Cutting tokta (W3) removed the old FIX (ccu-khod). Allocation V3.1 allows no new 08 act, and the rok is the only obstacle left. A shortcut comment in `tests/cities/ccu.ts` marks this.
3. **Four acts still have only one death script, so no pair:** `ccu08-rok` (ccu-dhowa, the same script as the stage FIX), `ccu09-toran` (ccu-bansh only), `ccu09-chala` (ccu-bansh only) and `ccu10-tram` (ccu-khod only). `ccu06-points` pairs only with the stage FIX (ccu-khod @1441 against ccu-points @2150).
4. **Floors not met, using the measured times:**
   - 05 runs 19.2 s, against about 25 s in V3.1.
   - 08 runs 14.1 s, against about 30 s in V3.1.

   Both are final for this round per ALLOCATION-V3.1, which found no legal act for either. 07 is 82.1 s at lag 0 and 84.5 s at lag 12. It plays as a long stage, not a marathon.
5. **The 08 door was not given a new mechanic.** Its decision (the old men rise only for the tea seller, so stand and wait) used to repeat tokta. With tokta cut per DECISIONS W3, the door is now the only place 08 asks it. That makes the door the stage's reversal, not a repeat. No struck 08 idea was built.

6. **S5 is not applied: the CCU-01 tour bite is unchanged.** It is "land on the rail from a jump and the groove locks your foot; walk on to it", which DECISIONS.md S5 rules a recast of, because "arrive walking, not from a jump" is `kvt02-glass` / TVM-01. The kumir chalk river stays as ruled. I did not pick a new read myself: any rail read I can build (cross while the rail is quiet, cross square not along it, don't stop on it) lands on a cadence, a don't-stop (S9 class) or the kumir's own window in the same stage, and the registry check is the allocator's. I have asked the conductor for the read.
7. **Further S4 collisions left for a ruling.** The S4 row names the dry-cracks betrayal in three places: `ccu05-uthon`, the dry parts of `ccu05-lane`, and the CCU-05 room's sentence 2. The ruled cell cuts uthon and recasts lane, and that is what I did. Three places still teach "pale and dry: walk down, never jump down": the CCU-05 room itself (its hint and its NAIVE, ccu-phata @183), `ccu05-ghat` ("still walk off (never jump) on to the pale dry ones", script ccu-phata @1266), and the finale's `ccu10-kumor` callback (ccu-phata @7377). I have not cut these; they need the conductor's ruling. Cutting the room's dry clay also takes away 05's NAIVE cause.

## Part 1

### Mid-ride checkpoints, 06 07 09 10
- **Before (round 1):** one checkpoint per act, and replays of 20 s or more on every ride stage.
- **After:**
  - 06: room checkpoint 6.5, a second island stop (ground at column 39, tram B dwells 2.6 s) with checkpoints 6.3 and 40.4, and duiline 24.5.
  - 07: girder −3; horn and board each start on a 9-tile pylon step with checkpoints at 4.5 and 3.
  - 09: sinri −7.5, lift −4, 11.6 and 27, line −1.8 and 29.
  - 10: bus 3.5 and 32, tram 1 and 26.5, pherot −1.3 and 13, chhad −1.8, kumir −3, setu relay −0.5.
- Numbers are in the replay table. The bar is met on 08 only, and 05 misses by 0.6 s.

### The 08 door
See honest item 5.

### Acts without a FIX pair
- **Round 1 had five unpaired acts.** This round:
  - cut uthon, baan, uthan2, tokta and ulto per DECISIONS;
  - gave the new acts pairs: horn (ccu-parapet / ccu-gaari), board (ccu-cha / ccu-gaari) and kumir10 (ccu-kumir / ccu-nala).
- **Left unpaired:** see honest item 3.

### Checkpoint sweep, the tester's way
- **Method:**
  - route at lag 0, 6, 11 and 12, times spawn idle 0, 37, 120 and 251;
  - at every checkpoint touched: idle 4 s, run 0.3 s, and a tap-jump.
- **Probe:** `calm-sweep.test.ts.txt`. **Output:** `f-calm.txt`.

| Stage | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| calm deaths | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

The `cps` probe's own calm check (idle 0 and 180, lags 0, 6 and 12) is `calm ok` on every stage.

## Part 2 (allocation v3, ALLOCATION.md line 560)

| Act | Allocation row | Decision it asks |
|---|---|---|
| `ccu07-horn` | F481 horn-shifts-the-carrier, 07's sound beat | When the lorry's horn goes, the porters step back 20 px: be on the back of the load, not the middle. Middle: ccu-parapet @4373. Hopping forward: ccu-gaari @4312. |
| `ccu07-board` | F502 board-takes-one | The board seats one, so the short porter rests and yours walks on past it: stay on your own load. Switching as taught: ccu-cha @5890. Jumping off before the board: ccu-gaari @5850. |
| `ccu07-ulto` cut | W4 | It was cut once F481 replaced it. |
| `ccu09-uthan2` cut, `ccu09-line` +2 beats | S3, and 09's labelled momentum beat | Line is 36 wide with 10 bamboos. Climbing on the queue: ccu-line @3655. Going under: ccu-bansh @3657. |
| `ccu10-kumir` | 01's kumir broken (finale break) | He counts backwards with his eyes open, and you cross when he STOPS. Crossing while he counts: ccu-kumir @8182. One long jump: ccu-nala @8270. |

Not built, as struck: every Kumartuli seed for 05; flower sacks, the taxi jam, the bore, announcements, pigeons and the bhishti for 07; argue loud/quiet, page-turn, carrom, load-shedding and rain for 08. The slot swap and reshaping 08 were not taken.

## DECISIONS.md section 5 rulings, each with its registry row

| Row | Ruling (Ruled cell) | Done |
|---|---|---|
| S3 | CCU cuts `uthan2` only; `uthan` stays; `chala` stays | `ccu09-uthan2` cut (`b126595`). `ccu09-uthan` kept as ruled. The 27 Nov relay of the allocator's note said cut both; I followed the Ruled cell and the item's decision ("09 uthan stays, uthan2 cut"). |
| S4 | cut `uthon`; `lane` recast to the paint-line read | `ccu05-uthon` cut (`b126595`). `ccu05-lane` recast (`41d4343`): its four dry figures are now figures being painted (paint 0.1, rate 0.05), its advice reads the paint line only, and its jump script now dies in the mud: ccu-ganga @650 (was ccu-phata). The paint-line clock and `ccu-murti` are untouched. Honest item 7 lists what S4 still names. |
| S5 | recast the CCU-01 tour bite; the kumir river stays | Not done: honest item 6. |
| S6 | `baan` cut | `ccu07-baan` cut (`b126595`). The ccu-baan cause stays: jowar's flood uses it. |
| W3 | keep the door; `tokta` cut or re-read | `ccu08-tokta` cut (`b126595`); door `ccu-dorja` kept. |
| W4 | `ulto` cut when v3 lands | `ccu07-ulto` cut once F481 was built (`49b4fc4`). |

**Re-check against DECISIONS.md lists 1 (shipped) and 2 (in-flight):** every remaining CCU act was read against the rows. Beyond honest items 6 and 7, I found none. `ccu10-phire` holds the B13 refuge row, whose SVP twin (SVP-9 bollard brace) was struck in 5d, so CCU keeps it. F481 `horn-shifts-the-carrier` is kept apart from the other sound reads by V2.

**05 after the S4 recast (`41d4343`, run alone):** tsc 0; `vitest -t CCU-05` 13 passed, 0 failed; fair N=80 6t 100, 12t 100, 18t 90, every stretch 100; calm sweep 0 deaths; replay 8.1 / 8.2 / 8.1 s at lag 0 / 6 / 12 (unchanged, still honest item 1); route 19.2 s, unchanged; sheet re-shot and read (`shots/CCU-05-sheet.png`: the lane's figures now show paint lines). The full-suite numbers below are from `0841e03`, before this commit.

## Route times (won, idle 0)

| Stage | Lag 0 | Lag 12 | Round 1 | Floor / note | Par |
|---|---|---|---|---|---|
| 05 | 19.2 s | 22.0 s | 22.8 | ~25 s, final per V3.1 (unchanged by the lane recast) | 26 |
| 06 | 60.5 s | 61.0 s | 56.7 | | 82 |
| 07 | 82.1 s | 84.5 s | 81.7 | ~84 s, honest | 111 |
| 08 | 14.1 s | 14.6 s | 23.4 | ~30 s, final per V3.1 | 19 |
| 09 | 46.0 s | 49.8 s | 53.6 | | 62 |
| 10 | 94.3 s | 97.2 s | 87.8 | | 127 |

## Proofs

- **tsc:** exit 0 (`f-tsc.log`).
- **npm test:** 18 files passed, 12 skipped; 1754 tests passed, 12 skipped, 0 failed (`f-test.log`).
  - cpsafe: `tests/cpsafe.test.ts` 140 tests green inside that run.
  - CCU is on no allow-list. The only CCU in shared tests is a fixture in `allocation.test.ts`.
- **flows:** exit 0, no errors (`f-flows.log`).
- **fair, N=80** (`f-fair.txt`):

  | Stage | 6t | 12t | 18t | Stretches at 0–12t |
  |---|---|---|---|---|
  | 01 | 100 | 100 | 100 | all 100 |
  | 02 | 100 | 100 | 100 | all 100 |
  | 03 | 100 | 100 | 76 | all 100 |
  | 04 | 100 | 100 | 88 | all 100 |
  | 05 | 100 | 100 | 93 | all 100 |
  | 06 | 100 | 100 | 100 | all 100 |
  | 07 | 100 | 100 | 84 | all 100 |
  | 08 | 100 | 100 | 100 | all 100 |
  | 09 | 100 | 100 | 84 | all 100 |
  | 10 | 100 | 100 | 76 | all 100 |

- **Probes (a) and (b), cause@tick for every pair:** `f-causes.txt`. NAIVE / FIX per stage:
  - 05: ccu-phata @183 / ccu-murti @522
  - 06: ccu-dando @791 / ccu-points @2150
  - 07: ccu-cha @896 / ccu-bojha @457
  - 08: ccu-dhowa @535 / ccu-dhowa @702 (honest item 2)
  - 09: ccu-bansh @195 / crushed @341
  - 10: ccu-boi @682 / ccu-nala @1703

  Every act script with its tick is in the file.
- **Replay per tick, lag 0 / 6 / 12** (`f-cps.txt`; every stretch over 8 s is listed there):

  | Stage | L0 | L6 | L12 | Checkpoints caught |
  |---|---|---|---|---|
  | 05 | 8.1 | 8.2 | 8.1 | 4/2 |
  | 06 | 22.2 | 22.0 | 21.9 | 6/4 |
  | 07 | 21.4 | 21.5 | 21.5 | 8/6 |
  | 08 | 4.5 | 6.0 | 6.3 | 3/1 |
  | 09 | 14.6 | 12.8 | 12.9 | 10/9 |
  | 10 | 14.0 | 14.1 | 13.9 | 15/13 |

- **Sheets:** re-shot for 05 to 10 and read (`shots/CCU-05-sheet.png` to `CCU-10-sheet.png`). They show:
  - 06: the second island with Dad stepping off.
  - 07: the horn and board on their pylon steps.
  - 09: line's longer queue.
  - 10: the kumir before setu.

  Nothing reads wrong.

## Commits this round
`6664cc8`, `b126595`, `857c327`, `49b4fc4`, `329c2da`, `38e9f20`, `0841e03`, `41d4343`.

Not checked: whether the tester's own replay probe counts from the checkpoint touch the same way mine does. The risk is that the replay bar is still open on four stages.
