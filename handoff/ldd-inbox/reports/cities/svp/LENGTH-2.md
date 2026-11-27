# SVP length round 2

Branch `city/svp`, worktree `ldd-wt/svp`. Develop 4c38bcb is merged (merge commit 27484d9, merged, not rebased). Tip sha is in the last section.

## Summary

- Part 1 (replays): every stage 02-10 now replays 8.0 s or less from every checkpoint at lag 0, 6 and 12, and every checkpoint is calm at lag 12. 01 is a one-trap tour and is exempt (13.0 s replay at the shuttle stop).
- Part 2 (floors): two new acts, `svp08-deewar` and `svp09-nali`, plus a finale callback `svp10-nali`. Floors for 06, 07, 08 and 09 are NOT met. Honest numbers are in section 6.
- Shared cpsafe gate: `npx vitest run tests/cpsafe.test.ts -t SVP` is green after moving 11 checkpoints.
- Tests: tsc clean, `npm test` 1724 passed, 16 skipped, 18 files passed, with SVP off the allow-list. Flows: no errors.

## 1. Route times (bot, seconds) against the floors

| Stage | Round 1 (LENGTH.md) | Now | Floor | Met |
|---|---|---|---|---|
| 01 | 30.1 | 30.1 | 25-35 | yes |
| 02 | 25.8 | 25.8 | 25-45 | yes |
| 03 | 26.1 | 26.1 | 25-45 | yes |
| 04 | 25.8 | 20.6 | 25 | NO (boat waits shortened for the replay bar) |
| 05 | 63.5 | 54.1 | 60 | NO (rope ride and cave wait shortened for the replay bar) |
| 06 | 36.1 | 21.2 | 60 | NO |
| 07 | 58.9 | 38.4 | 120 | NO |
| 08 | 41.3 | 44.0 | 60 | NO |
| 09 | 24.9 | 28.8 | 60 | NO |
| 10 | 98.6 | 87.7 | 90 | NO (2.3 s under) |

Part 1 and Part 2 pull in opposite directions. Every ride, wait and hall cycle that gave length was also what made the replay long. The replay bar won, and the floors for 04-10 fell with it. I did not pad with waiting.

## 2. Part 1: worst replay per stretch (seconds), calm from every checkpoint at all lags

Files: `probes/p4-final-lag0.txt`, `p4-final-lag6.txt`, `p4-final-lag12.txt`.

| Stage | lag 0 | lag 6 | lag 12 |
|---|---|---|---|
| 02 | 7.6 | 7.6 | 7.5 |
| 03 | 6.2 | 7.5 | 7.5 |
| 04 | 7.7 | 7.7 | 7.9 |
| 05 | 7.5 | 7.5 | 7.6 |
| 06 | 6.9 | 7.2 | 7.5 |
| 07 | 7.6 | 7.3 | 7.4 |
| 08 | 7.5 | 7.5 | 7.5 |
| 09 | 5.2 | 5.3 | 5.1 |
| 10 | 8.0 | 8.0 | 8.0 |

The longest stretch in any stage is 10.0 s. Its replay from the checkpoint stays under 8 s.

What changed: 06 flock cycle (COME 180, SAG 90, HELD 210, SPRING 240, REST 240) with triggers 3.5 tiles after each checkpoint, door flock trigger at D-9. 08 weather: per-section triggers, two rains (west, east), then clear sky (first lull 80, rain 240, lull 270), a porch at the door checkpoint, faster gutter. 07 room call 420, ships 1.0 s and 3.5 s, doosra call 300 then 380 (crowd speed 210), teesra call 180 (crowd speed 250). 04 boat waits 3.2/1.6 s (room), 2.0/1.4 s (act). 05 rope ride 36, pulls 50 and 58, cave wet 5 s. 02 and 10 `SawHall` got a `rest` parameter. 09 last cellar split by an island, checkpoints 21.5, 47, 74, 93.5, swing anchors at x+77.5.

### 2a. Replay before and after the cpsafe checkpoint moves (03, 06, 07, 10)

| Stage | Before the moves (lag 0/6/12, worst s) | Right after the moves | Final (after hall fix) |
|---|---|---|---|
| 03 | 6.2 / 7.5 / 7.5 | not re-measured at this point | 6.2 / 7.5 / 7.5 |
| 06 | 6.5 max | not re-measured at this point | 6.9 / 7.2 / 7.5 |
| 07 | 7.8 max | teesra stretch 9.5 / 10.2 / 10.9 | 7.6 / 7.3 / 7.4 |
| 10 | 8.0 / 8.0 / 8.0 | not re-measured at this point | 8.0 / 8.0 / 8.0 |

Only 07 teesra opened above 8 s when its checkpoints were removed. I did not put a calm checkpoint back. The fix was shorter timers on the halls: doosra call 300 then 380 with crowd speed 210, teesra call 180 with crowd speed 250. 07 now has no checkpoints inside doosra and teesra, and its worst replay is 7.6 s.

## 3. cpsafe gate: checkpoints before and after

Before (11 failing, all tap-jump at lag 0/6/12):

| Stage | Checkpoint | x | Killed by |
|---|---|---|---|
| SVP-03 | cp1 | 42.6 | svp-magar2 |
| SVP-03 | cp2 | 48.6 | svp-magar2 |
| SVP-03 | cp3 | 54.6 | svp-magar2 |
| SVP-06 | cp1 | 52.5 | svp-kichad2 |
| SVP-07 | cp0 | 23.4 | svp-bheed |
| SVP-07 | cp4 | 91.0 | svp-bheed |
| SVP-07 | cp6 | 137.0 | svp-bheed |
| SVP-10 | cp1, cp2, cp3 | 42.6, 48.6, 54.6 | svp-magar2 |
| SVP-10 | cp10 | 205.0 | svp-bheed |

After:

| Stage | Checkpoints |
|---|---|
| 03 patrol and creek | relative 9.6, 15.6, 21.6 (x 41.6, 47.6, 53.6) |
| 06 | one cp at 15.5 (x 47.5) |
| 07 | room cp 23.4 removed. doosra and teesra `cps: []` (the finale picks up through the wrappers). `ghatSte` cp0 on. |
| 10 | inherits the 03 and 07 fixes |

Result: `tests/cpsafe.test.ts -t SVP` all pass.

## 4. New acts

### svp08-deewar (stage 08, `s08.ts`, class `Block`)

- Decision: "Pick the shelter by its height, not by whether it is a shelter."
- Rule: the rain shadow is as wide as the building is tall. A short shop leaves a thin dry strip and a 4-storey block leaves a wide one.
- Closest shipped ideas: SVP-08's own awning lee rule (same weather type), BBI jug and TVM-01 tarp (a person or event pouring). Difference: the awning rule asks which end is the lee. This asks which building is tall enough. There is no cycle and no trigger, and the building's height alone decides.
- Beat: one plain beat (the rain rule from the street) before the act. Intro line, hidden item, `svp08-deewar`.
- Deaths: NAIVE `svp-baarish` @3423, FIX `svp-baarish2` @3754 (different cause and tick).
- HWIK: the existing second-season rain is the single WTF beat. The deewar ladder is knowable.

### svp09-nali (stage 09, `nali.ts`, class `Hose`)

- Decision: "Which way round an obstacle do I let my line run."
- Rule: the air hose lies over or under each coral arch. Under costs 120 px of line. The hose is drawn slack (yellow) or taut (white).
- Closest shipped ideas: BPL-04 own trail, KVT-06 air meter, DEL slot 05 hang from wires, PNJ-07 towed parasail. Difference: no meter and no timer. The only variable is the geometry of the line.
- Stretch 1 can afford one arch under. Stretch 2 has no spare.
- Deaths: NAIVE `svp-nali` @2699, FIX `svp-nali2` @3110.
- Finale callback `svp10-nali` (NAIVE @8533, FIX @8944).

### Not built

06 Tedha (bent pole): the jump-distance tolerance is too tight to stay fair at lag 12. 07 Mehrab, the sea-walk chain and the weight belt: out of time, and the hose family is used in 09. This is why 06 and 07 are far under their floors.

## 5. Repeat-window table

| Act | Window | New or momentum | Note |
|---|---|---|---|
| deewar | A: short shop decoy then 4-storey | new | |
| deewar | B: 3-storey against 2-storey, closer heights | momentum beat | |
| nali | stretch 1: one bend allowed | new | |
| nali | stretch 2: no spare, shorter line | momentum beat | |
| 10 nali | finale | callback | |
| rassi | window 1 | new | |
| rassi | window 2 | momentum beat | |
| choona | window 1 | new | |
| choona | window 2 | momentum beat | |

Rows beyond one momentum beat: zero. Padding rows: zero.

## 6. Honest numbers

- 06 (21.2 s against 60): Tedha not built (tolerance). The flock cycle was cut to 21 s for the replay bar.
- 07 (38.4 s against 120): the five retired acts (lift bridges, godown lifts) were the same experience as shipped ideas and were removed in the probe pass. Halls, call timers and ships were then shortened to hold the replay at 8 s or less. The shelter, momentum and hidden-checkpoint beats the brief asked for are not added. Mehrab, the sea-walk chain and the weight belt were not built.
- 08 (44.0 s against 60): deewar added about 3 s. The remaining time would need another act. HWIK keeps one WTF beat (the second-season rain) with the awning lee tell.
- 09 (28.8 s against 60): nali added about 4 s, and the island split also adds some. More length would be padding.
- 04 (20.6 s against 25), 05 (54.1 s against 60), 10 (87.7 s against 90): shortened waits for the replay bar.
- 01: one trap by design.

## 7. Cause at tick (NAIVE and FIX differ in cause and tick)

| Stage | NAIVE | FIX |
|---|---|---|
| 01 | baha@586 | baha@1298 (same cause, one-trap tour) |
| 02 | aari@434 | kichad@2063 |
| 03 | magar@272 | magar2@741 |
| 04 | hiran@354 | hiran2@1550 |
| 05 | nazar@190 | rassi@2482 |
| 06 | kichad@199 | kichad2@1309 |
| 07 | saman@544 | bheed@776 |
| 08 | baarish@217 | nala@4904 |
| 09 | eent@138 | eent2@509 |
| 10 | aari@654 | magar2@1290 |

Act level: 08 deewar baarish@3423 against baarish2@3754. 09 nali nali@2699 against nali2@3110. 10 nali 8533 against 8944. 05 rassi 2482 against 3586. 05 choona chuna@5296 against chuna2@6510. 10 rassi 6310 against 7129. Raw: `probes/probe3-round2.txt`.

## 8. Fairness, LDD_N=80 (`fair-N80-4.txt`)

```
SVP-01: 6t 100%  12t 100%  18t 100%
SVP-02: 6t 100%  12t 100%  18t 100%
SVP-03: 6t 100%  12t 100%  18t 100%
SVP-04: 6t 100%  12t 100%  18t 100%
SVP-05: 6t 100%  12t 100%  18t 100%
SVP-06: 6t 100%  12t 100%  18t 80%
SVP-07: 6t 100%  12t 100%  18t 100%
SVP-08: 6t 100%  12t 100%  18t 100%
SVP-09: 6t 100%  12t 100%  18t 80%
SVP-10: 6t 100%  12t 100%  18t 93%
```

Every stretch is 100% at quick and average lag. At relaxed lag (18t) 06 and 09 are 80% and 10 is 93%. This is below the 90/95 bar. I did not investigate the cause this round. It is the same figure as the accepted LENGTH.md, and I did not loosen traps to reach 90.

## 9. Other proofs

- `tsc`: clean.
- `npm test`: 1724 passed, 16 skipped, 18 files (`npm-test-4.txt`). `-t SVP` modules: 11 passed. Allocation: 10 passed.
- Flows: no errors.
- Sheets for every changed stage 02-10 are in `shots/SVP-0x-sheet.png` and `SVP-10-sheet.png`. I read 07, 08, 09 and 10 this round. 02-06 were shot and are unchanged in look. I did not read them again.
- Probe scripts and raw outputs: `probes/`.

## Skipped or not checked

06 Tedha and the 07 acts were not built. Floors 04-10 are not met. Lag-18 fairness is under 90 on 06, 09 and 10. Sheets for 02-06 were not re-read. Par values in `levels.ts` were not re-run.
