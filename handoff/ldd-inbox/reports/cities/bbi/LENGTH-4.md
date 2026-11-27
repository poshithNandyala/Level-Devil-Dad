# BBI · Bhubaneswar: length round 5

Branch `city/bbi`, worktree `ldd-wt/bbi`, tip `a363d58`. Round 4 was accepted at `e126215`. I merged develop `f8288e9`
(v0.17.2) first, as `fdbc96b`, with no conflicts. Own files only, no shared file edited, no push, no version bump.
Commit messages carry no brackets or braces.

## Honest section first

- **Floors still not reached:**

  | Stage | Now | Floor | Short by |
  | --- | --- | --- | --- |
  | 06 | 50.0 s | 60 s | 10 s |
  | 07 | 93.5 s | 120 s | 26.5 s |
  | 08 | 46.6 s | 60 s | 13.4 s |
  | 09 | 58.7 s | 60 s | 1.3 s |

  05 (60.2 s) and 10 (94.9 s) now reach their floors. Every v3 row assigned to 06, 07 and 08 was built except F468
  (accordion). These stages are short because each v3 act adds 5-8 s on BBI's compact layouts, not the 10-15 s
  ALLOCATION estimated. Two of my fixes also cut time: the 03 and 07 troupes now start sooner, and `kansa` was cut
  under ruling W6.
- **F468 `accordion-folds-at-hinge` (07) was not built.** DECISIONS.md section 6 makes F468 BBI's reserve once B1, B2,
  B4, B5, B6 and F467 are in, and they all are now. 07 is still 26.5 s short, so F468 is the next act to build.
- **Possible collisions, flagged for your ruling (I did not decide them):**
  - `bbi06-tantu` (F465, jump up into a thread to stop the weaver) and `bbi05-ganna` (C6, jump up into the belt to
    stop the crusher) use the same verb: reach up and break the drive to stop a hazard. The difference is the choice.
    In tantu you must pick the plain thread, because a coloured one is the floor. Ganna has only one belt.
  - `bbi07-kachha` (F495) is a rolling bridge, as `bbi07-gadiba` is (S21). Its decision is a tell (look at the waists
    while they whirl) and the roll comes with no shiver, so gadiba's answer (walk with the turn) does not save you.
- **Two-play bar:** every long stage now meets it (counts below). The acts with no FIX death are the 9 from round 4,
  unchanged. `bbi06-sidhi` is now labelled 06's one momentum beat, in code and in docs.
- **Test plays I changed, not the game:** two scripted plays were measuring the wrong thing, and I fixed the scripts.
  - The 06 `tana` "look" play stopped at the edge instead of stepping on to the motif.
  - The `bbi05-mama` NAIVE play, at lag 12, landed on the grinder's treadle and so became a different play. That one
    was handled by a game change instead (see Part 1).
- **Par changes were not followed by a second full suite.** After the last full suite (`b2cbdad`), only the BBI-10
  par and the docs changed. `levels.test.ts -t BBI-10` passed after the par change.

## Part 1: the fixes (old -> new)

| Finding | Old | New | Result (the sweep's measure) |
| --- | --- | --- | --- |
| BBI-08 cp4 x126.5, the door checkpoint: at capture lag 6, tap-jumps landed in the trough (12 of 560 plays) | ending `space: 12`: ground x127-130, trough from x131 | `space: 14`: two more tiles of ground, trough from x133. A lag-6 capture at x127.7 is now 5.3 tiles from the trough. No checkpoint removed, trough and plate unchanged | 0 deaths |
| BBI-03 m0 (wait on the third parasol's cut-out) 8.04 s | street timings `open` 0.8/2.8/4.6/5.4 s, peel at 6.4 s | 0.4/2.0/3.8/4.6 s, peel at 5.6 s; the street still starts on its trigger at x2 | 7.24 s |
| BBI-05 m3 (`tenda`: stay on the bucket) 8.06 s | lift `up` 5.0 s | `up` 4.2 s | 7.26 s |
| BBI-05 m13 (`mama` NAIVE) 9.07 s at lag 12 | the lagged hop landed on the treadle, the uncle went to the grinder, and Dad died on the full lift ride | `MAMA.up` 5.0 -> 3.6 s, plus an act checkpoint at col 5, which is 8 tiles before the lift's pit | 7.16 s |
| BBI-06 m1 (`tana` "look") 10.06 s | the play stopped at x+3.3, short of the bridge, and died to the shuttle one cycle later | the play steps on to the motif (x+5.3) as written | 4.72 s |
| BBI-07 FIX (room) 9.03 s | `T07` poses tower, wheel, bridge from the start | `phase: 2.8`: the order is wheel, bridge, tower (hint updated), so the bridge comes second | 6.24 s |
| BBI-07 m17 (`hulahuli`) 7.70 s | the cheered stop came third | `phase` = one drum plus one silent hold: the first stop you meet is silent, the next is cheered | 5.60 s |
| BBI-07 m21 (`shrinkhala`) 8.24 s | first troupe tower then bridge | `phase: 3.9`: bridge first | 4.34 s |
| BBI-07 m24 (`dweepa`) 8.63 s | second troupe drum 1.8 s, hold 1.5 s, phase 0.8 s | drum 1.4 s, hold 1.3 s, phase 1.2 s | 7.03 s |
| Found this round: `bbi07-kachha` FIX 8.1-8.2 s | the two pits were 4 tiles apart, with no checkpoint between | second troupe moved to col 19; a checkpoint on the wide bank at col 13, which is 6 tiles before pit 2 | 6.97 s |
| Found this round: `bbi08-ghurni` FIX 9.3 s | A reached its near edge 4 s after the trigger | A reaches its near edge 0.4 s after the trigger, just as Dad reaches the rim | under 6.3 s |

## Part 2: new acts, one row each

The registry check is DECISIONS.md lists 1-2, plus ALLOCATION v3 rows and section 5. The NAIVE and FIX ticks below are
probe (b) ticks counted from the act's start.

| Act | v3 row, family | Decision | Registry check | NAIVE cause@tick | FIX cause@tick |
| --- | --- | --- | --- | --- | --- |
| `bbi06-tantu` | F465, loom-beat-aligns-threads | Shuttle and beater leave no window. Snap the plain white thread over the bank and the weaver stops both; a coloured thread pulls the motif apart | F465 as assigned. Possible collision with `bbi05-ganna`, flagged above | snap the nearest (coloured) thread -> `bbi-tantu`@495 | leave the loom alone, time the shuttle -> `bbi-rachh`@562 |
| `bbi06-palaa` | F466, B29 portal that runs | The shuttle box runs when you come at it, then comes back along the warp. Board it where it is, out over the pit. When it reaches the edge, the beater beats the bank | F466 as assigned; nothing in lists 1-2 asks "board the thing that flees, mid-flight" | run at it and jump -> `bbi-ranga`@155 | wait at the edge for it -> `bbi-rachh`@495 |
| `bbi07-ghungur` (sound beat) | F467 | Lamps out between pieces. Jump where the ankle bells ring, not where you saw the boys. The next piece sweeps the floor | F467; V2 kept the sound reads apart on purpose | walk the gaps you saw -> `bbi-nacha`@145 | wait for the lamps -> `bbi-thrown`@697 |
| `bbi07-kachha` (tell beat) | F495 | Tucked pleats while they whirl mean the line rolls the moment it lies down. Let that stop go. Loose skirts lie still but briefly: go at once | F495; close to `gadiba` (S21), flagged above | go on the first stop -> `bbi-kachha`@341 | wait for each troupe to settle -> `bbi-thrown`@1166 |
| `bbi08-phinga` (replaces `kansa`, ruling W6) | F470, B21 accelerating coins | The server throws faster and further the longer you wait. The first throw floats, the second sinks, the rest hit your bank. Ride the first, at once | F470 as assigned | stand at the rim and read the throws -> `bbi-badi`@514 | let one go, ride the second -> `bbi-buda`@519 |
| `bbi08-ghurni` | F469 | Seen from the side, a stirred badi is slow at the edge of its circle and fast through the middle. Hop only at the edge. Sit too long and the spoon scoops it | F469 as assigned | jump on as soon as it is in reach -> `bbi-ghurni`@522 | wait on it for the stir to stop -> `bbi-chamacha`@686 |
| `bbi09-udaya` momentum beat | v3 09 row | (round 4) | labelled momentum beat | - | - |
| `bbi06-sidhi` | - | labelled 06's one momentum beat (no FIX by design) | - | `bbi-ranga`@113 | - |

New death causes: `bbi-tantu`, `bbi-ganthi`, `bbi-badi`, `bbi-buda`, `bbi-ghurni`, `bbi-chamacha`, `bbi-kachha`.

## The finale (10) against law 7

v3's list for 10 is "pick 6 at about 7 s". I built these six, from rules that now exist on the branch:

| Act | Rule taught (stage) | Broken how | NAIVE cause@tick | FIX cause@tick |
| --- | --- | --- | --- | --- |
| `bbi10-ghungur` | 07 quiet: jump where the bells ring | the bells hang from the drummer's frame and ring over the empty floor; the boys whirl in silence. Jump the quiet | jump the bells, as before -> `bbi-nacha`@186 | wait for the lamps -> `bbi-thrown`@696 |
| `bbi10-phinga` | 08 throws: go at once, ride the first | he starts hard and slows down: the first two hit your bank, the first in the water sinks. Wait back, ride the fourth | go to the rim at once -> `bbi-badi`@236 | wait back, ride the first in the water -> `bbi-buda`@554 |
| `bbi10-tantu` | 06 thread: snap the plain one | the plain thread holds the motif together. Snap the first coloured thread: only its patch drops | snap the plain thread -> `bbi-ganthi`@489 | time the shuttle -> `bbi-rachh`@561 |
| `bbi10-palaa` | 06 shuttle-portal: board it mid-flight | the weaver holds this one: it does not run. Step straight on and it flies you across | hang back for it to run -> `bbi-rachh`@217 | jump out to where it came back last time -> `bbi-ranga`@156 |
| `bbi10-ghurni` | 08 vortex: hop at the slow edge | the stir is reversed: slow through the middle, flung at the edges. Hop in the middles | hop on at the edge -> `bbi-ghurni`@616 | sit on it -> `bbi-chamacha`@726 |
| `bbi10-chakra` | 09 hub: wait on the still hub | the hub stands on a post on the stone and slides with it into the wall; the rim above stays. Go up on to the rim | wait on the hub -> `bbi-chakka`@384 | jump back off the stone -> `bbi-khai`@397 |

Not built from the v3 list:
- 02 keeper and 05 bait (the uncle switches it ON): I found no break that is not a retimed copy of the act.
- 07 hinge: F468 is not built.

All 17 finale acts are two-play. 10 went from 65.1 s to 94.9 s.

## Two-play acts per long stage (bar: at least 5)

| Stage | Two-play | Acts |
| --- | --- | --- |
| 05 | 6 | chheli, khala, thaka, patra, mama, ganna |
| 06 | 6 | tana, patta, sutra, rachh, tantu, palaa (sidhi is the momentum beat) |
| 07 | 14 | mardala, deepa, bandha, dui-baja, bagudi, pada, jodi, gadiba, hulahuli, sajaghara, ghungur, kachha, shrinkhala, dweepa |
| 08 | 5 | phinga, bhanwar, dati, dui, ghurni |
| 09 | 5 | ghoda, udaya, ratha, ulta, asta (ara one-play) |
| 10 | 17 | all |

One-play, with reasons as in LENGTH-3: `bbi02-corner` and `bbi02-chhal` (02 exempt), `bbi05-dhenki`, `bbi05-gadi`,
`bbi05-bail`, `bbi05-chakki`, `bbi05-tenda`, `bbi06-sidhi` (momentum beat), `bbi09-ara`. Probe (b) fails on exactly
these nine; probe (a) finds 0 repeats beyond one momentum beat.

## Clear time (scripted route, no deaths)

| Stage | Round 4 | Now | Floor | Par |
| --- | --- | --- | --- | --- |
| 01 | 25.4 s | 25.4 s | 25-35 | 30 |
| 02 | 26.4 s | 26.4 s | 25-45 | 35 |
| 03 | 26.7 s | 25.9 s | 25-45 | 32 |
| 04 | 29.3 s | 29.3 s | 25-45 | 36 |
| 05 | 62.4 s | 60.2 s | >= 60 | 72 |
| 06 | 38.2 s | 50.0 s | >= 60 (short) | 60 |
| 07 | 90.9 s | 93.5 s | >= 120 (short) | 114 |
| 08 | 43.1 s | 46.6 s | >= 60 (short) | 60 |
| 09 | 58.7 s | 58.7 s | >= 60 (short) | 70 |
| 10 | 65.1 s | 94.9 s | >= 90 | 114 |

## Lag-captured sweep (FIX-7.md method; scratch copy kept as `qa6.test.ts.txt`)

Method:
- The route runs at lag 0/6/11/12 with spawn idle 0/37/120/251.
- Each checkpoint is taken where the lagged run takes it, and the world is rebuilt there by `replay()`.
- 7 plays run from it: idle 4 s, run 0.3 s after 0/6/12 ticks, tap-jump after 0/6/12 ticks.
- Replay is measured per tick, from the last checkpoint the lagged run took to the death of every NAIVE, FIX and
  MISTAKE, at lag 0/6/12.

It ran once over all ten stages, alone, at the end. Full output is in `qa6-round5.txt`.

| Stage | Capture points | Plays checked | Deaths | Longest stretch | Worst replay (lag 0 / 6 / 12) |
| --- | --- | --- | --- | --- | --- |
| BBI-01 | 6 | 672 | 0 | 12.9 s | 2.92 / 2.84 / 2.84 s |
| BBI-02 | 4 | 448 | 0 | 8.4 s | 3.14 / 3.26 / 3.38 s |
| BBI-03 | 3 | 336 | 0 | 9.5 s | 7.14 / 7.19 / 7.24 s |
| BBI-04 | 4 | 448 | 0 | 12.7 s | 2.52 / 2.67 / 2.81 s |
| BBI-05 | 17 | 1904 | 0 | 10.2 s | 7.17 / 7.22 / 7.26 s |
| BBI-06 | 8 | 896 | 0 | 9.4 s | 4.97 / 5.03 / 5.72 s |
| BBI-07 | 18 | 2016 | 0 | 9.4 s | 6.92 / 6.98 / 7.02 s |
| BBI-08 | 6 | 672 | 0 | 13.2 s | 6.21 / 6.21 / 6.21 s |
| BBI-09 | 7 | 784 | 0 | 22.5 s | 5.45 / 5.73 / 5.85 s |
| BBI-10 | 19 | 2128 | 0 | 12.2 s | 6.99 / 7.13 / 6.92 s |

**0 deaths in 10,304 plays. The worst replay in the city is 7.26 s (BBI-05 `tenda`, lag 12), under 7.5 s.** The route
won at every lag and idle. Every stretch is under 25 s (the longest is 22.5 s on 09).

## Replay and stretch (my probe, `probes-round5.txt`)

My probe measures from the checkpoint to the trap at lag 0/6/12. Worst at lag 12, per stage:

| 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1.6 s | 6.4 s | 4.7 s | 5.2 s | 7.1 s | 5.5 s | 6.7 s | 5.8 s | 4.4 s | 6.5 s |

The worst in the city at any lag is 7.1 s.

Longest stretch between calm spots:

| 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 8.4 s | 8.3 s | 8.2 s | 10.4 s | 8.9 s | 7.1 s | 7.2 s | 11.5 s | 19.7 s | 9.6 s |

## cpsafe, fair, suite, flows, sheets

- `cpsafe` (idle, run and tap-jump at lag 0/6/12): BBI-01 to BBI-10 green inside the full suite.
- Full `npm test` at `b2cbdad`: **18 files passed, 1871 tests passed, 0 failed** (20 env-gated skipped). BBI is on no
  allow-list (`CPSAFE3_PENDING = ['PAT']`). An earlier full run failed the jump audit: three ghungur hops needed a
  16-tick hold. The boys now spin at ankle height so a tap clears them, and the audit passes.
- `npx tsc --noEmit` clean. `npm run build:single` and `node scripts/flows.mjs`: **no errors**.
- Fair, `LDD_N=80 npm run fair -- BBI`, one run at the end (`fair-BBI.txt`). Every stretch is 100% at 0-12t.

  ```
  BBI-01: 6t 100%  12t 100%  18t 100%
  BBI-02: 6t 100%  12t 100%  18t 100%
  BBI-03: 6t 100%  12t 100%  18t 88%
  BBI-04: 6t 100%  12t 100%  18t 96%
  BBI-05: 6t 100%  12t 100%  18t 84%
  BBI-06: 6t 100%  12t 100%  18t 88%
  BBI-07: 6t 100%  12t 100%  18t 100%
  BBI-08: 6t 100%  12t 100%  18t 76%
  BBI-09: 6t 100%  12t 100%  18t 76%
  BBI-10: 6t 100%  12t 100%  18t 76%
  ```
- Sheets re-shot and read for the changed stages 03, 05, 06, 07, 08 and 10 (`shots/BBI-0{3,5,6,7,8}-sheet.png`,
  `shots/BBI-10-sheet.png`):
  - 06 shows the plain thread over the bank and the shuttle box.
  - 07 shows the dark ghungur floor and the kachha pits.
  - 08 shows the server and the stirred bowl.
  - 10 shows the dark floor, the server, the stir and the chariot with the hub on its post.
  - 09 is not re-shot: its own art is unchanged, and the hub-rides option is used only by 10.

## Memory steer

I ran targeted tests while building. The full suite (twice, because of the jump-audit fix), the full fair and the
full sweep ran once each at the end, one at a time. I killed my stray vitest worker from the early base sweep.

## Not done

F468; the 02 keeper and 05 bait finale breaks; floors for 06, 07, 08 and 09.
