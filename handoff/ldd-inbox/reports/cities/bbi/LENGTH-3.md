# BBI · Bhubaneswar: length round 4

Branch `city/bbi`, worktree `ldd-wt/bbi`, tip `5ba2b86` (base: round 3 at `41f39fd`). Own files only, no push, no version
bump, no shared test touched. ALLOCATION v3 (BBI table F464-F470, F495) landed mid-round and outranks BBI-IDEAS-3 list A;
the rulings it carried are applied below with their row ids.

## Honest section first: what is still short or failing

- **Floors not reached:** 06 (38.2 of 60 s), 07 (90.9 of 120 s), 08 (43.1 of 60 s), 09 (58.7 of 60 s), 10 (65.1 of 90 s).
  05 reaches its floor (62.4 s). Reasons: v3 rows F465, F466 (06), F467, F468, F495 (07), F469, F470 (08) and the v3
  finale list were not built; v3 arrived at about 10:34 IST with the budget end moved to 11:20, and I spent what was
  left on the I9 cut, the 09 momentum beat and the lag-captured sweep the ruling asked for.
- **Two-play bar (5 per long stage):** 06 has 4 (`tana`, `patta`, `sutra`, `rachh`; `sidhi` stays one-play) and 08 has
  4 (all four of its acts are two-play; it has only four). Both are under the bar.
- **Lag-captured sweep (FIX-7 method), after my fixes:** one checkpoint still fails: **BBI-08 cp4 x126.5** (the door
  checkpoint). At capture lag 6 the run is first grounded past it on the floating leaf plate (Dad x135.1), and the
  tap-jump plays from there land in the trough (`bbi-pakhala`), 12 of 560 plays. Not fixed.
- **Replay per tick over 7.5 s** (the sweep's measure: death tick minus the last checkpoint the lagged run took):
  BBI-03 m0 8.04 s (wait on the third parasol's cut-out); BBI-05 m3 8.06 s (`bbi05-tenda`: stay on the bucket),
  m13 9.07 s at lag 12 only (`bbi05-mama`: ride the water lift); BBI-06 m1 10.06 s (`bbi06-tana`: step on as the motif
  lines up, and look); BBI-07 FIX 9.03 s, m17 7.70 s (`hulahuli`), m21 8.24 s (`shrinkhala`), m24 8.63 s (`dweepa`).
  My own probe (checkpoint to death, lag 0/6/12, below) has all of these at 7.2 s or less; the sweep's lagged player
  takes checkpoints later or not at all, so the two measures differ. Not fixed in this round.
- **Longest stretch** in the sweep: BBI-09 22.5 s (my probe 19.7 s): under 25 s, but the longest in the city, because
  the ten spokes and the bare terrace sit between two checkpoints.

## Rulings applied (DECISIONS.md section 5)

| Row | Ruling | Done |
| --- | --- | --- |
| S10 | recast the BBI-01 tour bite's tell: the jet follows the walker and spares the one who stands still ("it targets whoever stops" is TVM-04's coconuts); the slide into the drain stays | `5ba2b86`. In `s01.ts` the jet now goes for Dad only while he walks (or jumps) within 5 tiles of where it waits on the road, moving at 240 px/s, faster than his 140 px/s walk; while he stands still it is held up off the road and wets nothing, and the wet tile slides only a moving dad. Tara's lie changed from "Ruha! / Stop!" to the verified "Chala bajar jiba! / Let's go to the market!". The mistake play is now "keep walking past him while he faces the road" (dies `bbi-nala`); the NAIVE (walk on and hop the drain) still dies `bbi-nala`; a scratch run that stops at col 23.3 while he faces the road lives and crosses when he turns back. Route time unchanged (25.4 s). Fair 100/100/100; sweep 672 plays, 0 deaths, replay worst 2.92 s. The family label `aimed-hose-slick-follows-waiter` stays because `docs/allocation.json` is shared and not mine to edit |
| I5 | BBI keeps the dheki (built first) | nothing to change |
| W6 | `bbi08-kansa` and `bbi09-ratha` are second windows of their rooms: replace them first when 08's and 09's new acts are built; `bbi02-dive`, `bbi03-gali`, `bbi03-mela` stay as momentum beats | no new 08 or 09 act was built this round (09 got only v3's labelled momentum beat on `udaya`), so `kansa` and `ratha` are still in. When F469/F470 land in 08, `kansa` goes first; 09 has no new act assigned, so `ratha` waits for one |

### Collisions I found in my own check against DECISIONS.md lists 1 and 2 (for ruling; not decided by me)

| Mine | Registry row it may share a decision with | Why I flag it |
| --- | --- | --- |
| BBI-01 as recast by S10 (freeze while the gardener faces the road; only a mover is chased) | list 1 `hyd04-statue` / HYD-04 room ("Statue! ... if you are moving or in the air, you are out") | both ask "stop moving while the watcher looks". The BBI tell differs (he turns to the road, no shout) and moving is safe while he faces the pots, but the thought may be the same |
| `bbi09-udaya` / `bbi09-asta` FIX death added this round (a risen spoke goes back under after 3 s stood on, `bbi-dooba`) | list 1 KVT-08 room ("a sandbar sinks if you stop on it, so keep moving") | the FIX half of these acts is "do not linger on it", which is KVT-08's thought; the NAIVE half (wait for the next spoke to rise) is BBI's own |

## Rulings applied (ALLOCATION v3)

| Row | Ruling | Done |
| --- | --- | --- |
| I9 | `bbi07-gum-ta` CUT ("act on the announcement" is DIS-02's kept family) | cut in `cad25da`: the act, its `forecast` troupe option and its draw code, its LEAD entry, its tests and doc row are gone. 07 fell from 97.1 to 90.9 s |
| S21 | `bbi07-gadiba` kept exactly as built (walk with the turn toward the drummer, never stand) | unchanged |
| F467 | 07's sound beat: quiet-means-clear | **not built** (time) |
| F495 | 07's tell beat: pleats tell the roll | **not built** (time) |
| F464 | 05 bait-the-switcher | already built this round as `bbi05-mama` (before v3 landed): the uncle stops any machine you start; start the grinder as bait, ride the lift. Same decision as F464. Differences from the row: NAIVE "ride the lift" dies to `bbi-mama` (row: `bbi-chacha`); FIX "start the grinder and wait by it" dies to `bbi-dhakka`, he shoves you (row: touch nothing → `bbi-khai`). Not struck: it IS the row |
| (C6) | 05 belt | `bbi05-ganna` was built before v3; v3's needs line counts it ("05 +9 (less ganna)"). Kept |
| F465, F466 | 06 break-the-plain-thread, portal-that-runs | **not built** (time). Neither reduces to a decision 06 has: `bbi06-sutra` is a read of the motif (the undyed threads make a hole), not a snap |
| F468 | 07 accordion folds at the hinge | **not built** (time) |
| F469, F470 | 08 vortex outer edge slow, throws accelerate | **not built** (time) |
| 09 row | +2 spokes and one plain beat on `bbi09-udaya`, labelled 09's momentum beat, no new family | built in `cad25da`: `risingSpokes(..., n = 10, plain = 5)`: ten spokes, the terrace one row higher, then five tiles of bare terrace to run. 09 went 55.1 → 58.7 s |
| 10 row | pick 6 breaks from the v3 list at ~7 s | **not built from the v3 list.** Most of its rules belong to v3 acts that are not built (06 shuttle-portal and thread, 07 quiet and hinge, 08 vortex and throws). The ones that exist on this branch (02 keeper, 05 bait = `mama`, 09 hub) are not built as breaks. The four breaks built this round (below) were built from the round-4 brief before v3 landed and break rules of 05, 06 and 09 |

## Clear time (scripted route, no deaths)

| Stage | Round 3 | Now | Floor | Par (was) |
| --- | --- | --- | --- | --- |
| 01 | 25.4 s | 25.4 s | 25-35 | 30 |
| 02 | 26.4 s | 26.4 s | 25-45 | 35 |
| 03 | 26.7 s | 26.7 s | 25-45 | 32 |
| 04 | 29.3 s | 29.3 s | 25-45 | 36 |
| 05 | 51.4 s | **62.4 s** | >= 60 | 75 (62) |
| 06 | 38.2 s | 38.2 s | >= 60 (short) | 46 |
| 07 | 65.2 s | **90.9 s** | >= 120 (short) | 108 (78) |
| 08 | 43.1 s | 43.1 s | >= 60 (short) | 52 |
| 09 | 55.1 s | **58.7 s** | >= 60 (short) | 70 (66) |
| 10 | 47.9 s | **65.1 s** | >= 90 (short) | 78 (58) |

## New acts: the decision check

Checked against MECHANICS.md, BBI's own stages, the open branches named in the brief (LKO aadaab/photo/wapas/upar/
tasveer/jawab, DIS dhol/Bordoisila/tug, KVT plank, PAT, CCU, GTK, SVP) and, for the acts that survive, DECISIONS.md.

| Act | Decision | NAIVE → cause @tick | FIX → cause @tick | Closest shipped idea | Difference |
| --- | --- | --- | --- | --- | --- |
| `bbi05-ganna` (C6) | knock the mill's belt off its pulley first (jump up into it), then cross | ride the mill → `bbi-ganna` @156 | knock it off, then jump the channel → `bbi-dhan` @215 | `bbi05-tenda` (start a machine on purpose) | here you stop a machine at a distance, by its drive, and the price is a second hazard |
| `bbi05-mama` (C5 = v3 F464) | bait the uncle with the grinder, then ride the lift | ride the lift → `bbi-mama` @768 | start the grinder and wait by it → `bbi-dhakka` @595 | `bbi05-tenda` | a person who undoes your move; you plan "which first" |
| `bbi07-jodi` (IDEAS-3 B5) | two half-bridges; the half whose drummer stopped first gets up first | wait for the whole bridge → `bbi-nacha` @573 | go the moment the second half lands → `bbi-adha` @833 | `bbi07-dui-baja` (which drummer the troupe follows) | read the order of two stops, not which drummer counts |
| `bbi07-gadiba` (B1, kept by S21) | on a drum roll the bridge turns towards the drummer: walk with the turn | walk on through the roll → `bbi-ulta-gadi` @397 | stand still → `bbi-gadi-tala` @367 | AMR-03 logs | walk WITH the turn toward the drummer, never stand (S21) |
| `bbi07-hulahuli` (B6) | a cheered pose holds as long as the cheer | go at the first stop → `bbi-thrown` @362 | wait for the cheer to swell → `bbi-kick` @916 (the bowing boy) | `bbi07-mardala` (go at the stop) | the hold length is told by the crowd, and waiting too long has its own death |
| `bbi07-sajaghara` (B2, shelter beat) | the dressing tent is safe only while they dance | wait in the tent → `bbi-saja` @305 | wait at the edge → `bbi-dauda` @238 | `bbi07-dweepa` (shelter beat) | the refuge is timed by the hazard itself |
| `bbi07-gum-ta` (B3) | | | | DIS-02 | **CUT, I9** |
| `bbi09-udaya` +2 spokes, bare terrace | momentum beat (v3 09 row) | (as before) `bbi-udaya` @348 | `bbi-dooba` @661 | `bbi09-udaya` itself | no new decision; labelled momentum beat |

09 FIX deaths added this round: rising spokes go back under after 3 s stood on (`bbi-dooba`, gives `udaya` and `asta`
a FIX death), and jumping back off a sliding plinth lands in the moat (`bbi-khai`, gives `ghoda` 330 vs 343 and `ratha`
391 vs 397). No hub-family or wheel-family act was found for 09 before v3; v3's 09 row replaced that ask.

## The finale (10) against law 7

| Act | Rule taught (stage) | Broken how | NAIVE → | FIX → |
| --- | --- | --- | --- | --- |
| `bbi10-udaya` (new) | spokes rise after you stand on the one before (09) | they rise only while you wait on the bank; wait for the whole stair, then climb | on spoke 1 and wait → `bbi-dooba` @607 | jump ahead → `bbi-udaya` @280 |
| `bbi10-chheli` (new) | jump once the goat's pounder lies flat (05) | the goat charges the straw on its way back | wait → `bbi-sinha` @747 | jump while it is on the pounder → `bbi-chheli` @127 |
| `bbi10-patta` (new) | each panel shows the NEXT pit (06) | an honest painter: the panel is this pit, and the first pit has a rotten plank | `bbi-sadha` @86 | `bbi-chitra` @240 |
| `bbi10-thaka` (new) | stop the well sweep at the top (05) | stop it low: the stone is the bridge over a ditch | stop it at the top → `bbi-kua` @179 | climb the raised stone → `bbi-pathara` @205 |
| keeper break | ride the keeper's back pad (02) | **not built**: the finale's base room already breaks the horses rule with a bare plinth any step starts; a keeper break would ask the same "the carrier throws you" decision | | |
| chariot break | horses start the plinth (09) | **not built**: reduces to the base room's bare plinth (any step starts it) | | |
| shuttle break | the shuttle crosses on the motif beat (06) | already in round 3 as `bbi10-tana` (a quiet loom with no shuttle, then a drummer during the pose) | `bbi-nacha` @976 | `bbi-thrown` @1335 |

Round-3 finale acts kept: `patra`, `chhata`, `bagudi`, `pada`, `dui-baja`, `deepa`, `tana`. All 11 finale acts are
two-play.

## One-play acts (no FIX death) and the two-play count per long stage

| Act | Reason (as in LENGTH-2.md) |
| --- | --- |
| `bbi02-corner`, `bbi02-chhal` | 02 is exempt; momentum read of the ball |
| `bbi05-dhenki`, `bbi05-gadi`, `bbi05-bail`, `bbi05-chakki` | 05's "touch nothing" teaching beats: the only wrong move is touching; standing still is safe by design |
| `bbi05-tenda` | the decision is to start the lift; not starting it is a wall, not a death |
| `bbi06-sidhi` | I tried a stop-on-the-steps FIX death this round and could not script a fair one; reverted |
| `bbi09-ara` | spokes that sink in order: the obvious fix (wait) is the right play |

Two-play acts per long stage: 05 6 (`chheli`, `khala`, `thaka`, `patra`, `mama`, `ganna`), 06 **4**, 07 12, 08 **4**,
09 5 (`ghoda`, `udaya`, `ratha`, `ulta`, `asta`), 10 11. Every FIX dies on a different tick from its NAIVE.

## Lag-captured sweep (FIX-7.md method; `qa6.test.ts` copied as scratch, kept as `qa6.test.ts.txt`)

Route (human-timing player) at lag 0/6/11/12 × spawn idle 0/37/120/251; at each checkpoint the lagged run takes, the
world is rebuilt by `replay()` and 7 plays run (idle 4 s, run 0.3 s after 0/6/12, tap-jump after 0/6/12). Replay per
tick from the last checkpoint to every NAIVE, FIX and MISTAKE death at lag 0/6/12. Full output: `qa6-round4.txt`.

| Stage | Capture points | Plays | Deaths | Longest stretch | Worst replay (lag 0/6/12) |
| --- | --- | --- | --- | --- | --- |
| BBI-01 | 6 | 672 | 0 | 12.9 s | 2.92 / 2.84 / 2.84 (re-run after S10, same) |
| BBI-02 | 4 | 448 | 0 | 8.4 s | 3.14 / 3.26 / 3.38 |
| BBI-03 | 3 | 336 | 0 | 10.3 s | **7.94 / 7.99 / 8.04** (m0) |
| BBI-04 | 4 | 448 | 0 | 12.7 s | 2.52 / 2.67 / 2.81 |
| BBI-05 | 16 | 1792 | **0** (48 before the khala fix) | 10.2 s | **7.97 / 8.03 / 8.06** (m3), m13 6.38 / 1.53 / **9.07** |
| BBI-06 | 6 | 672 | 0 | 9.4 s | **10.06** all lags (m1) |
| BBI-07 | 15 | 1680 | 0 | 12.2 s | **8.93 / 8.98 / 9.03** (FIX); m24 8.63, m21 8.24, m17 7.70 |
| BBI-08 | 5 | 560 | **12** (cp4 x126.5, captured at x135.1, tap-jump → `bbi-pakhala`) | 13.2 s | 6.21 all lags |
| BBI-09 | 7 | 784 | 0 | 22.5 s | 5.45 / 5.73 / 5.85 |
| BBI-10 | 13 | 1456 | 0 | 12.3 s | 6.99 / 7.13 / 6.92 |

The sweep found 48 deaths at BBI-05 cp8 x143.5 (`bbi05-khala`, col 19.5): at capture lag 6 and 11 the run clipped
the cart, the cart rolled to the straw and crushed the replayed Dad. Moving the checkpoint to col 23 (on the straw)
gave 48 deaths on the pounder instead; col 29.5, past the pounder pit, gives 0 (`e126215`).

## Probes (my own harness, `bbi-probe.test.ts.txt`; output `probes-round4.txt`)

- **Probe (a):** `probe (a) repeats beyond one momentum beat: 0`.
- **Probe (b):** `probe (b) acts failing: 9`: the nine one-play acts above. No two-play act fails.
- **Replay** (checkpoint to trap, lag 0/6/12), longest per stage at lag 12: 01 1.6, 02 6.4, 03 5.5, 04 5.2, 05 7.1,
  06 5.5, 07 7.2, 08 6.8, 09 4.4, 10 6.5 s (these numbers predate the 05 checkpoint move; 05's sweep replay is above).
- **Longest stretch between calm spots:** 01 8.4, 02 8.3, 03 8.2, 04 10.4, 05 9.0, 06 7.1, 07 9.9, 08 11.4, 09 19.7,
  10 9.6 s.

## Fairness (LDD_N=80; `fair-BBI.txt`)

```
BBI-01: 6t 100%  12t 100%  18t 100%
BBI-02: 6t 100%  12t 100%  18t 100%
BBI-03: 6t 100%  12t 100%  18t 88%
BBI-04: 6t 100%  12t 100%  18t 96%
BBI-05: 6t 100%  12t 100%  18t 84%   (re-run after the khala checkpoint move)
BBI-06: 6t 100%  12t 100%  18t 100%
BBI-07: 6t 100%  12t 100%  18t 100%  (after the gum-ta cut)
BBI-08: 6t 100%  12t 100%  18t 76%
BBI-09: 6t 100%  12t 100%  18t 76%   (after the ten spokes)
BBI-10: 6t 100%  12t 100%  18t 76%
```

Every stretch of every stage 100% at 0-12t.

## Proof

- `npx tsc --noEmit`: clean.
- Full `npm test` at `5ba2b86` (after S10): **18 files passed, 1811 tests passed, 0 failed**; build:single + flows **no errors**. Before S10, at `e126215`: **18 files passed, 1811 tests passed, 0 failed** (12 env-gated skipped). BBI is on no
  allow-list (`CPSAFE3_PENDING = ['PAT']`). `cpsafe` BBI-01..10 pass.
- `npm run build:single` and `node scripts/flows.mjs`: **no errors**.
- Shot sheets re-shot and read for 05, 07, 09, 10 (`shots/BBI-0{5,7,9}-sheet.png`, `shots/BBI-10-sheet.png`): 07 runs
  to the exit at 90.5 s with no gum-ta; 09 shows the ten spokes and the bare terrace before the door.

## Not done

v3 rows F465, F466, F467, F468, F469, F470, F495 and the v3 finale list; the BBI-08 door checkpoint lag capture; the
seven per-tick replays over 7.5 s listed at the top; a fifth two-play act on 06 and on 08.
