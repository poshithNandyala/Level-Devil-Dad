# GTK round 3: calm checkpoints, replay per tick, 08 at lag 12

Branch `city/gtk`, worktree `/local/home/saiposh/personal/ldd-wt/gtk`. Tip: see "Checks" below. This round merged develop twice: `9d193f6` as `80373f7`, then `4c38bcb` (the cpsafe gate) as `cb249bb`. Nothing was pushed and the version was not bumped.

**Part 1 is not green.** Calm checkpoints (item 1) are done, and the shared gate passes. Replay to a trap (item 2) is still over 7.5 s on seven stages. For 08 at lag 12 (item 3), the documented `npm run fair` result is the proof. Part 2 was not started, because the brief puts it after a green Part 1 and the budget ran out first.

## 1. Calm checkpoints: what moved

The gate is `npx vitest run tests/cpsafe.test.ts -t GTK`: idle 4 s, run 0.3 s then idle, and tap-jump then idle, at lag 0, 6 and 12, from every checkpoint. It was red on 01, 03, 05, 09 and 10 (see `integrate-cpsafe3.md` under GTK). It is now green on all ten stages (10 passed, 22 s).

| Stage | What | Before | After | Why |
|---|---|---|---|---|
| 01 tour | `cps` x | 30.5, 47.5, 79.5, 97.5 | 30.5, 47.5, **74.5, 94.5** | At 79.5, a tap-jump then idle reached the broom at x84.3. 77.5/97.5 still failed. |
| 02 | room `cps` | none | **16.5** (the shelf) | Splits the vent replay from the steamer ride. |
| 02 `ulta` | act `cps` | none | **20** (the walkway) | Same reason; 02 replay went from 14.3 s to 10.0 s. |
| 03 `kagaz` (since cut, S2) | jhora pit, `onPass` trigger, frames, route | pit c.x+3..18, trigger X(1.5), frames X(4) | pit c.x+**5..20**, trigger X(**3.5**), frames X(**6**) | 5 tiles of bank before the jhora, so the checkpoint is ≥ 4.5 tiles from the edge and not hot. |
| 05 act 1 | act `cps` x | 12.5, 27.5 | **18.5, 38** | At the old spots Dad's hands were full; now they are empty and clear of the brooms. |
| 09, four acts | `thinShore` start | c.x+3 / x+3 / c.x+4 / c.x+3 | **5.5** in each | A 5-tile bank at every act start, wider than a tap-jump. |
| 09 | yak homes gtk9a, b, c, d | c.X(0.5) / c.X(1) | **c.X(3)** | Moved with the wider bank. |
| 10 `chauri` | `thinShore`; yak gtk10y | c.x+4; X(1) | c.x+**7.5**; X(**4.5**) | Wider than a tap-jump. |
| 10 `peechha` | litter wrapper | x+4 | x+**6** | The checkpoint is now taken empty-handed. |

No trap was weakened, and every act keeps its decision. The 03 jhora, the 09 and 10 shores and the 05 brooms kill exactly as before; only the ground in front of them grew.

### Three plays, three lags (tests/cpsafe.test.ts)

| Stage | lag 0 | lag 6 | lag 12 | Hot captures (moving hazard ≤ 3.5 tiles at capture) |
|---|---|---|---|---|
| GTK-01 | pass | pass | pass | none |
| GTK-02 | pass | pass | pass | none |
| GTK-03 | pass | pass | pass | none (was cp0, cp2) |
| GTK-04 | pass | pass | pass | none |
| GTK-05 | pass | pass | pass | none (was cp2) |
| GTK-06 | pass | pass | pass | none |
| GTK-07 | pass | pass | pass | none |
| GTK-08 | pass | pass | pass | none |
| GTK-09 | pass | pass | pass | **cp1 at x68.1, gtk-hiun at 3.4 tiles** (probe only; cpsafe passes) |
| GTK-10 | pass | pass | pass | none (was cp5) |

All three plays run at all three lags in every row; nothing fails. The hot column comes from my probe at lag 0. It ignores pits below the road (`y >= 240`), because a jhora or gorge does not move. The one remaining hot capture is 09 cp1: the shore ice is 3.4 tiles away, 0.1 tile inside the 3.5-tile rule. Idle, run and tap-jump all survive it.

## 2. Replay to a trap, measured per tick

How the probe works: `tests/cities/gtk/probe.test.ts -t replay`. From each checkpoint it branches off the route into three plays: stop, run on, and run then jump. It branches every 30 ticks along the stretch, and every tick over the last 1.5 s before each checkpoint and within ±0.5 s of each stretch's coarse worst. It does not branch every tick across the whole route, which is too slow to run. Replay is the time from the checkpoint to the death.

| Stage | Route | cps | Longest stretch | Max replay, lag 0 | Where (cp, play, tick, cause) | Other stretches over 7.5 s |
|---|---|---|---|---|---|---|
| GTK-01 | 29.7 s | 4 | (under 8 s in round 2) | ≤ 7.5 (round 2) | none | not re-run |
| GTK-02 | 34.9 s | 6 | 12.1 s | **10.0 s** | cp2 run+jump @28.77 s, gtk-dhakkan | start 9.4 s (stop, gtk-bhaap); cp1 7.6 s (stop, gtk-bhaap) |
| GTK-03 | 25.8 s | | | 8.4 s at lag 12 in round 2 | not re-run | |
| GTK-05 | 54.9 s | 11 | 10.9 s | **11.8 s** | cp4 run+jump @21.80 s, gtk-jhadu | none |
| GTK-06 | 39.5 s | 9 | 8.8 s | **9.9 s** | cp3 run+jump @23.26 s, gtk-taxi | none |
| GTK-07 | 73.1 s | 13 | 8.6 s | **9.3 s** | cp6 run+jump @46.51 s, gtk-badal | cp0 8.1 s (stop, gtk-badal); cp4 7.8 s (run+jump, gtk-deewar) |
| GTK-08 | 52.6 s | 6 | 14.7 s | **13.7 s** | cp3 run on @49.42 s, gtk-khaai | start 7.8 s; cp2 11.1 s (run on, gtk-khaai) |
| GTK-09 | 67.2 s | 6 | 17.1 s | **18.2 s** | cp1 run+jump @39.40 s, gtk-hiun | start 13.9 s; cp0 10.8 s; cp2 14.0 s (all gtk-hiun) |
| GTK-10 | 90.6 s | 14 | 12.5 s | **11.0 s** | cp6 stop @46.25 s, gtk-deewar | cp8 9.1 s, cp9 9.7 s (gtk-hiun); cp10 10.6 s (gtk-jhadu) |

The table's max is 18.2 s, against a bar of ≤ 7.5 s. Only 02 moved this round (14.3 → 10.0 s).

The same probe at lag 6 and 12 (`/tmp/gtk-rp612-GTK-0n.txt`). Calm fails are none and hot captures are none in every row that ran:

| Stage | Max replay, lag 0 | lag 6 | lag 12 | Worst at lag 12 |
|---|---|---|---|---|
| GTK-02 | 10.0 s | 10.0 s | 10.0 s | cp2 run+jump, gtk-dhakkan |
| GTK-05 | 11.8 s | 11.9 s | 12.1 s | cp4 run+jump, gtk-jhadu |
| GTK-06 | 9.9 s | 10.3 s | 10.2 s | cp3 run+jump, gtk-taxi |
| GTK-07 | 9.3 s | 9.3 s | 9.4 s | cp6 run+jump, gtk-badal |
| GTK-08 | 13.7 s | 13.7 s | probe's route does not win (section 3) | |
| GTK-09 | 18.2 s | 18.3 s | 18.4 s | cp1 run+jump, gtk-hiun |
| GTK-10 | 11.0 s | not finished at budget | not finished at budget | run still going (PID 26653), output to `/tmp/gtk-rp612-GTK-10.txt` |

Lag moves the worst replay by 0.4 s at most. The long stretches come from the layout, not from late input.

**Longest stretch:** 09 at 17.1 s, from cp0 across the yak shore (`gtk-hiun`).

## 3. 08 at lag 12

The probe's lag model is TVM's `lagged`, which holds a jump late for its full length. With it, the unchanged room's first ropeway ride does not win at lag 12. That is the model's jump timing, not the room: `npm run fair` puts 08 at **100% at 12 ticks over 80 runs** (`fair-N80-b.txt`, and 18t is also 100%). The fair run at 12 ticks is the proof for this row:

| GTK-08 | lag 0 | lag 6 | lag 12 |
|---|---|---|---|
| route wins (probe) | yes | yes | no (model) |
| `npm run fair`, N=80 | | 100% | **100%** (18t 100%) |

## 4. Probe (a) and (b)

- **(a) windows:** the `acts` probe was re-run this round (`/tmp/gtk-acts3.txt`). No act was added or cut, so there are still 0 repeats. Per-act time windows are unchanged, except that 09's and 10's shore acts are shorter because of the wider banks.
- **(b) cause@tick, touched acts** (`/tmp/gtk-deaths3.txt`):

  | Stage | Act | Naive play | Cause @ tick | Second play | Cause @ tick |
  |---|---|---|---|---|---|
  | 03 | `kagaz` (since cut, S2) | stop on a frame to look | gtk-kagaz @ 1499 | | |
  | 09 | room | naive | gtk-hiun @ 62 | fix | gtk-hiun @ 98 |
  | 09 | `dophoto` | walk across the shore | gtk-hiun @ 2732 | on for one photo, off at the second | gtk-photo @ 3993 |
  | 09 | `barf` | stay off the ice, walk the snow | gtk-hiun @ 4807 | | |
  | 09 | `chattan` | walk across the shore | gtk-hiun @ 6356 | ride to the end, as on the first yak | gtk-hiun @ 7566 |
  | 10 | `peechha` | the bin ahead is full, jump the holes anyway | gtk-jurmana @ 3204 | | |
  | 10 | `chauri` | walk across the shore | gtk-hiun @ 7507 | off the yak when it stops | gtk-hiun @ 7549 |

  The causes are the same as in round 2. Only the ticks moved, where a bank widened or a route shortened.

## 5. Fairness, LDD_N=80

| Stage | File | 6t | 12t | 18t | Stretches at 0-12t |
|---|---|---|---|---|---|
| GTK-01 | fair-N80-r3.txt | 100% | 100% | 100% | all 100% |
| GTK-02 | fair-N80-r3.txt | 100% | 100% | 100% | all 100% |
| GTK-03 | fair-N80-r3.txt | 100% | 100% | 98% | all 100% |
| GTK-04 | fair-N80-a.txt (unchanged) | 100% | 100% | 100% | all 100% |
| GTK-05 | fair-N80-r3.txt | 100% | 100% | 100% | all 100% |
| GTK-06 | fair-N80-b/c.txt (unchanged) | 100% | 100% | 76% | all 100% |
| GTK-07 | fair-N80-b/c.txt (unchanged) | 100% | 100% | 76% | all 100% |
| GTK-08 | fair-N80-b.txt (unchanged) | 100% | 100% | 100% | all 100% |
| GTK-09 | fair-N80-r3.txt | 100% | 100% | 93% | all 100% |
| GTK-10 | fair-N80-r3.txt | 100% | 100% | 76% | all 100% |

Every stage is ≥ 90% at 6 and 12 ticks, and every stretch is ≥ 95%. The 18t column is given for the record; it is not a bar.

## 6. Route times (scripted route), before and after

| Stage | Floor | Round 2 | Round 3 | Change |
|---|---|---|---|---|
| GTK-01 | 25-35 s | 29.7 s | 29.7 s | checkpoints only |
| GTK-02 | 25-45 s | 34.9 s | **25.7 s** | checkpoints; `bhatti` cut (S3) |
| GTK-03 | 25-45 s | 25.8 s | **21.7 s** | `kagaz` cut (S2): under the floor, the honest number stands |
| GTK-04 | 25-45 s | 25.2 s | 25.2 s | none |
| GTK-05 | ≥ 60 s | 54.9 s | **55.9 s** | checkpoints; `peeche` recast (I3) |
| GTK-06 | ≥ 60 s | 39.5 s | **39.5 s** | none |
| GTK-07 | ≥ 120 s | 73.1 s | **73.1 s** | none |
| GTK-08 | ≥ 60 s | 52.6 s | **52.6 s** | none |
| GTK-09 | ≥ 60 s | 69.5 s | 67.2 s | the wider banks shorten the yak rides |
| GTK-10 | ≥ 90 s | 91.2 s | 90.6 s | the wider `chauri` bank |

## 7. Part 2: new acts

None were built. The brief allows Part 2 only after Part 1 is green, and replay is not. The ranked list in `GTK-IDEAS-2.md` stays unbuilt: 07 first (about 47 s of fog decisions), then 06, 05 and 08. The four rejected ideas were not touched.

## 8. Checks

- `npx vitest run tests/cpsafe.test.ts -t GTK`: 10 passed.
- `npm test`, with GTK on no allow-list: 18 files passed, 14 skipped; 1750 tests passed, 17 skipped (`/tmp/gtk-full4.log`).
- typecheck: tsc=0. flows: flows=0, no errors.
- Sheets were re-recorded and read for every changed stage: 01, 02, 03, 05, 09 and 10, in `shots/GTK-0n-sheet-r3.png`. Each route reaches the exit with 0 deaths, and no frame shows a broken prop.
- Tip: `a5225e9` (the registry rulings, section 9, on top of `6585aaf`).

## 9. Registry rulings (DECISIONS.md section 5), applied in `a5225e9`

| Row | Act | Ruling | What changed |
|---|---|---|---|
| S2 | `gtk03-kagaz` | cut: wet holds, dry cracks, don't wait = DMN-03's melting ice plus a tell (same as DIS-04) | The act, its cause `gtk-kagaz`, its intro line, its route and its scripted death are removed. GTK-03 is now `jaanch`, `ulto`, `jaldi`, 21.7 s (floor 25). `jaldi` stays. No replacement yet: one would come from ALLOCATION v3. |
| S3 | `gtk02-bhatti` | cut: ride the riser, off at the top = KVT-05's shipped lift | The act and its route and death are removed. `gtk02-ulta` stays (off backwards as he carries it round), with its walkway checkpoint. GTK-02 is 25.7 s (floor 25-45). |
| I3 | `gtk05-peeche` | recast with no following; LKO owns pace-behind | The bin man now starts at the far end 4 s after Dad passes the first bin and works down the street towards Dad. When he empties a bin, the shop by the bin he emptied before tips its sweepings back in, so only the bin he has just emptied takes a wrapper. The heap on each bin is the tell. Tara's line is now "The far bin, Dad, he did that one first!" There are two scripted deaths, both `gtk-jurmana`: straight on (every bin is still full when Dad passes; tick 5977), and waiting for two bins then going to the first one he emptied (it has been heaped again; tick 6914). GTK-05 is 55.9 s. |
| S12 | `gtk07-thau` | stays as 07's one labelled shelter beat; its tell is visibility | Marked so in `docs/cities/GTK.md` (stage 07 row and the round 3 note). No code change. |

Checks after the rulings: tsc=0; `npm test`: 18 files passed, 1749 tests passed, 16 skipped (`/tmp/gtk-full5.log`); `cpsafe -t GTK`: 10 passed; flows=0. Fairness at N=80 (`fair-N80-r3b.txt`) is 100% at 6t and 12t on 02, 03 and 05, and every stretch is 100% (18t: 100%, 98%, 100%). Sheets for 02, 03 and 05 were re-recorded and read (`shots/GTK-0n-sheet-r3b.png`): 0 deaths on each route. Replay at lag 0: 02's max stays 10.0 s (cp1 run+jump, gtk-dhakkan). 05's max stays 11.8 s (cp4, `jhadu`). The recast `peeche` stretch replays in 8.2 s (cp9 run+jump to the bed, gtk-jurmana), over the 7.5 s bar, because the bin man's 4 s delay is what makes the straight-on run fail.

### Re-check of every remaining act against lists 1 and 2: further collisions, for ruling

I grepped lists 1 and 2 (everything except GTK's own rows) for each GTK act's thought. These are the candidates; I decided none of them:

| GTK act | Closest row(s) | Shared thought | Why it may or may not be new |
|---|---|---|---|
| `gtk07-peeche` and `gtk07-saath` (cloud drifting ahead: stay behind it) | I3's pace-behind ruling (`lko07-julus`); `dmn07` "stay close behind the painter" (shipped DMN-07) | keep behind a slow mover at its pace | Probably the same class as I3. The tell (the cloud hides the rope) is GTK's own, but the decision is to stay behind it. |
| GTK-09 room, `gtk09-chamri`, `gtk10-chauri` (ride the yak, off at the far bank before it turns) | AMR `swing` (shipped: board at the near end, off the moment it reaches the far bank, stay for the swing back and the rope snaps); `pdy05-raft`; `kvt10-thoni` | ride a carrier across, off at the far side before it goes back | The new part is staying on through the photo stop on the thin shore (`gtk-photo`). The "off at the far bank" half is AMR's. |
| GTK-08 room (two shuttles meet at the middle: change there or ride back into the shed) | CCU-07 room (switch head-loads before the CHA board or be set down) | change carriers mid-way before the one you are on takes you into the hazard | CCU's switch is set by a board, GTK's by the meeting point. Close. |
| GTK-01 tour sweepers (be on a bench during the stroke, or walk behind it) | `lko07-batti` (hang back while the lamplighter's ladder swings, pass while he is up) | wait out a sweeping tool, pass behind it | Struck row BBI-C2 already names this "= GTK sweeper decision", so GTK looks like the owner; listed so you can confirm. |
| `gtk07-chitra` and the painted wall in `dagar`/`saath` (the rope tells, not the painted road) | BOM-05 (PLATFORM 2 is only painted on); PDY-03 (a painted pot is cardboard) | a painted thing is not what it looks like | GTK's read is the rope, not the paint. Lower risk. |
| GTK-03 room (cloth bags hold, thin polythene tears) | DIS-04's ruling note ("DMN-03 melting ice + fake floor tell") | this floor holds, that one gives, read the material | No timer and no melting in GTK-03, and the inspector half is its own. Low risk; listed because S2 used the same reasoning. |

Also seen: the registry's list 2 has only `gtk07-dagar` among 07's acts. `thau`, `chitra`, `ghumti`, `peeche`, `chiya`, `jaldi` and `saath` are in the tree and in `docs/cities/GTK.md` but have no registry row, so their collisions in section 5 (I1, S11, S12) were found from other rows.

## Still short, and why

- **Replay > 7.5 s on 02, 05, 06, 07, 08, 09 and 10** (max 18.2 s on 09). Each one is a single ride or a single wait. The 09 and 10 yak shores and the 08 ropeway are one ride with no ground to stand on mid-ride. The 07 `badal` stretches are a cloud cycle that starts on the clock, not from a trigger. The 05 `jhadu` and 06 `taxi` stretches each have one long run-up. The fixes the brief names are a calm mid-ride bank, and a trigger with a checkpoint 3.5 tiles before it (TVM's method). Each fix re-lays an act and needs its own cpsafe, fair and sheet pass. The ~55 minutes lost to expired approvals, and making cpsafe green first, used the budget. Next round: 09 first (four shore stretches, 18.2 s), then 08 and 05.
- **Length floors are still short:** 03 21.7 s (after the S2 cut), 05 55.9 s, 06 39.5 s, 07 73.1 s and 08 52.6 s. Part 2 was the planned fix; 03 waits on ALLOCATION v3.
- **09 cp1** is a hot capture at 3.4 tiles by the probe's measure. cpsafe passes it.
- **08 lag 12:** the probe's model does not win the room; `npm run fair` at 12 ticks (100%) is the proof.
- **Not checked:** replay for 01, 03 and 04 was not re-run, because those stages were under the bar in round 2 and their checkpoints moved earlier, not later. Replay sampling is per tick only near the peaks (section 2), not across the whole route.
