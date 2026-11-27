# BBI · Bhubaneswar: length round 6 (short)

Branch `city/bbi`, worktree `ldd-wt/bbi`, tip `71df6f8`. Round 5 was accepted at `a363d58`. Develop is still at
`f8288e9`, which is already merged. Own files only, no shared file edited, no push, no version bump.

## Honest section first

- **Route times against floors:**

  | Stage | Round 5 | Now | Floor | Status |
  | --- | --- | --- | --- | --- |
  | 01 | 25.4 s | 25.4 s | 25-35 | met |
  | 02 | 26.4 s | 26.4 s | 25-45 | met |
  | 03 | 25.9 s | 25.9 s | 25-45 | met |
  | 04 | 29.3 s | 29.3 s | 25-45 | met |
  | 05 | 60.2 s | 60.2 s | >= 60 | met |
  | 06 | 50.0 s | 50.0 s | >= 60 | short, final by your ruling |
  | 07 | 93.5 s | **99.3 s** | >= 120 | **short by 20.7 s** |
  | 08 | 46.6 s | 46.6 s | >= 60 | short, final by your ruling |
  | 09 | 58.7 s | 58.7 s | >= 60 | **short by 1.3 s, stands** (see below) |
  | 10 | 94.9 s | 94.9 s | >= 90 | met |

- **07 against 120 s:** with F468 built, every v3 row assigned to 07 and every IDEAS-3 act that survived the registry
  is now in. 07 is 99.3 s, and 20.7 s short is its honest number.
- **09 at 58.7 s stands.** 09's own idea is the hub that stays still while the world slides. Its acts are already
  ghoda, udaya (the labelled momentum beat), ratha, ulta, asta and ara, and W6 already names `ratha` a second window.
  Each beat I could make from 09's idea for 1.3 s was another chariot slide with different numbers, which is a repeat
  window. I did not pad it.
- **The 02 keeper and 05 bait finale breaks were not built.** I could not find a break of either rule whose NAIVE and
  FIX die to different causes without being a retimed copy of the act:
  - **02 keeper** ("ride the back pad"): the lob-and-kick version came down to "ride the front pad and step off at
    once". That is 02's own front-pad and rebound lesson with the timing changed.
  - **05 bait** ("the uncle switches it ON"): every version made the uncle helpful (he starts the lift you need), so
    nothing could kill.

  The finale keeps the six breaks from round 5, so the v3 row's "pick 6" is met.
- **Two-play acts per long stage (bar: at least 5):**

  | 05 | 06 | 07 | 08 | 09 | 10 |
  | --- | --- | --- | --- | --- | --- |
  | 6 | 6 | **15** (+ pothi) | 5 | 5 | 17 |

  The one-play list is unchanged from LENGTH-4 (9 acts, each with its reason).
- **Par:** 07's par stays 114 against a 99.3 s route. I did not change it, so the full suite on this tip covers every
  par as committed.

## Rulings applied

| Pair | Ruling | Sentence for the tester |
| --- | --- | --- |
| `bbi06-tantu` vs `bbi05-ganna` | KEEP both | The decision in tantu is WHICH thread: the coloured one is the floor. Ganna has one belt and asks only "stop it". Tantu's NAIVE is the ganna reflex (jump up into the nearest thread), and it dies to it: `bbi-tantu`@495. |
| `bbi07-kachha` vs `bbi07-gadiba` | KEEP, if the waists read at phone size | Kachha's decision is the dancers' waists as the tell, and gadiba's answer (walk with the turn) does not save you: the roll comes the moment the line lies down, with no shiver. |

**Kachha's waists, made to read first.** The tucked dancers now wear a fat white knot at the waist (12 by 4 px)
above bare brown legs. A loose troupe still shows a wide coloured skirt. On the re-shot 07 sheet, the 71.5 s frame
shows the first pit's whirling boys as white-waisted figures and the second pit's in full coloured skirts. That frame
is about 630 px wide, which is close to a phone screen. Commit `71df6f8`.

## New act

| Act | v3 row, family | Decision (one sentence) | Registry check | NAIVE cause@tick | FIX cause@tick | Seconds |
| --- | --- | --- | --- | --- | --- | --- |
| `bbi07-pothi` | F468 `accordion-folds-at-hinge`, pose-shapes stage | On the palm-leaf screen over the pit, stand only on the pinned leaf ends, hop every hinge, and at the top end wait for the troupe beyond to stop before stepping down on to it. | See below | walk over the screen -> `bbi-pothi`@153 | hop the hinges and keep going -> `bbi-nacha`@423 | +5.8 s (07: 93.5 -> 99.3) |

**Registry check for pothi:**
- Lists 1-2 have no "where on the plank" fold rule.
- `bbi05-patra` asks WHICH leaf holds (written or blank). Pothi asks WHERE on a leaf to stand (end or hinge). These
  are different thoughts.
- The Daman tipping planks ask the opposite: stay central.
- `svp-board-bridge` (a board folds into a bridge) asks you to stand still by the board, which is unrelated.
- Among v3/v3.1 families, F468 is BBI's own reserve and no other city has a fold-at-hinge row.

**One difference from the v3 row, stated plainly.** The row's FIX cause was `bbi-thrown` (the restart throws you off
the top). I built it as `bbi-nacha`: a player who hops on without waiting at the top end drops into the whirling
troupe's pit. It is still a different cause and a different tick from the NAIVE (153 vs 423).

**Layout and lag checks:**
- **Layout:** four leaves, each 5 tiles (a 1.5-tile end, a 2-tile hinge, a 1.5-tile end), flush with the bank. The
  last end is 3 tiles. Then a 6-tile troupe pit, with drum 2.0 s, hold 1.6 s and phase 1.8 s, so a player who doesn't
  wait reaches the top during the drum.
- **Checkpoint:** the act-start checkpoint sits on the 4 lead tiles before the screen, and its lagged captures pass
  idle, run and tap-jump at every lag.
- **Jump audit:** every hop is a 12-tick tap, and the audit passes.
- **New cause:** `bbi-pothi`.

## The finale (10) against law 7

Unchanged from round 5. Six breaks from the v3 list, all two-play:

| Act | Rule broken (stage) | NAIVE cause@tick | FIX cause@tick |
| --- | --- | --- | --- |
| `bbi10-ghungur` | 07 quiet: the bells ring over the empty floor | `bbi-nacha`@186 | `bbi-thrown`@696 |
| `bbi10-phinga` | 08 throws: he slows down | `bbi-badi`@236 | `bbi-buda`@554 |
| `bbi10-tantu` | 06 thread: the plain one holds the motif | `bbi-ganthi`@489 | `bbi-rachh`@561 |
| `bbi10-palaa` | 06 shuttle: it waits for you | `bbi-rachh`@217 | `bbi-ranga`@156 |
| `bbi10-ghurni` | 08 stir: the middle is slow | `bbi-ghurni`@616 | `bbi-chamacha`@726 |
| `bbi10-chakra` | 09 hub: the hub slides, the rim stays | `bbi-chakka`@384 | `bbi-khai`@397 |

Not built: the 02 keeper and 05 bait breaks (reasons in the honest section).

## Sweep and replay for the changed stages

The FIX-7 lag-captured sweep (`qa6-round6.txt`) covers lag 0/6/11/12 × idle 0/37/120/251, with 7 plays at every
lagged capture and per-tick replay from the last lagged checkpoint at lag 0/6/12:

| Stage | Capture points | Plays checked | Deaths | Longest stretch | Worst replay (lag 0 / 6 / 12) |
| --- | --- | --- | --- | --- | --- |
| BBI-07 | 19 | 2128 | 0 | 9.4 s | 6.93 / 6.97 / 7.03 s |
| BBI-10 | 19 | 2128 | 0 | 12.2 s | 6.99 / 7.13 / 6.92 s |

The route won at every lag and idle. No other stage changed this round (round 5's full sweep holds for them: 0 deaths,
worst 7.26 s).

My probe on 07 (`probes-round6.txt`):
- Probe (a): 0 repeats beyond one momentum beat.
- Probe (b): 0 acts failing in 07.
- Route 99.3 s.
- Replay worst 6.6 / 6.6 / 6.7 s at lag 0/6/12.
- Longest stretch 7.2 s.

## Proofs

- `npx tsc --noEmit` clean.
- Full `npm test` on the final tip `71df6f8`: **18 files passed, 1873 tests passed, 0 failed** (20 env-gated
  skipped). That includes `cpsafe` (strict: idle, run and tap-jump at lag 0/6/12) green for BBI-01 to BBI-10, the
  jump audit, and the levels and checkpoint tests. BBI is on no allow-list.
- Fair, `LDD_N=80 npm run fair -- BBI`, run once (`fair-BBI.txt`): every stage 100% at 6t and 12t, and every stretch
  100% at 0-12t.

  | Stage | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
  | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
  | 18t | 100% | 100% | 88% | 96% | 84% | 88% | 76% | 76% | 76% | 76% |
- `npm run build:single` and `node scripts/flows.mjs`: **no errors**.
- Sheets re-shot and read for 07 and 10 (`shots/BBI-07-sheet.png`, `shots/BBI-10-sheet.png`):
  - 07 at 71.5 s: the kachha waists (white knot against coloured skirts).
  - 07 at 79.4 s: the pothi screen, pale leaves with a red cord at each hinge.
  - 10 is unchanged from round 5 (dark ghungur floor, server, stir, chariot hub on its post).
- Heavy runs went once each, one at a time: the full suite, the full fair, and the sweep on 07 and 10. No stray
  processes are left.

## Not done

- The 02 keeper and 05 bait finale breaks.
- 07's last 20.7 s and 09's 1.3 s, which stand as the honest numbers.
