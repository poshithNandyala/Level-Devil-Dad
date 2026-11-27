# KVT (Kavaratti) round 2 re-test: FAIL (two blocking findings, both small)

Subject: `city/kvt` at **054f593**, fresh detached worktree (removed at the end), KVT removed from `EXEMPT` locally (reverted), nothing committed. Round 1 is kept as `FAIL-1.md`. Probes and raw output: `r2/` (`qa-probe.test.ts.txt` = tests `calm`, `worst`, `plays`; `calm2.txt`, `worst2-lag*.txt`, `fair2.log`, frames `r2/KVT-10-a.png`, `KVT-10-b.png`, `KVT-09-*.png`).

Verdict: B1, B4 and the regressions hold. B2 fails at lag 12 on one stretch (8.8 s), and B3 still has two runs of identical steps (kodumudi's descent, kadalbhitti's ascent). Both are small edits.

## Holds

| Check | Result |
| --- | --- |
| `npm test`, KVT off EXEMPT | **1657 passed, 12 skipped**, `tsc` clean via the suite |
| `build:single` + `node scripts/flows.mjs` | "no errors" |
| `LDD_N=80 fair KVT` | 02-07 100/100; 08 100/96/76 (s2 96); **09 100/100/100, s0-s9 and door 100; 10 100/100/84, s0-s20 and door 100**. Matches FIX-1 |
| Frozen diff vs 0837c78 | only 04 (route 1588->1901, cp 32.5->30), 07 (cp 29), 08 (cps 30, 64), 09, 10; 01/02/03/05/06 unchanged, as FIX-1 explains |
| **B1 calm checkpoints** (`calm`) | Checkpoints captured on the route played at lag **0, 6, 11, 12** x 12 spawn idles (0, 23, 37, 60, 78, 111, 134, 156, 200, 251, 300, 344), stages 04, 07, 08, 09, 10: 7488 checks, route won in every run. **0 deaths** for idle 4 s, run 0.3 s then idle, and tap-jump then idle (no DIES line for those) |
| B4 plank | jump-over dies, splash @1180 (x84.8); catwalk answer intact (route wins). `irangal`, `kuzhi` gone |
| B4 veliyettam | MISTAKE "run across the heads without stopping, as Tara says" dies splash @7682; Tara says "Odu, Dad! Nilkkalle! / Run, Dad! Don't stop!" (the lie), the heads read as pink blocks over the lagoon at 844x390 (`r2/KVT-10-b.png`); the glass's "run" rule is a different act 30 s later |
| cause@tick (`plays`) | all scripted plays die where FIX-1 lists them (09: 262, 813, 1888, 2843, 3164, 3854; 10: 179, 591, 798, 1180, 1680, 2450, 3509, 4283, 4935, 5691, 6638, 6923, 7682, 8370, 8959, 9218, 9533, 10544, 11120) |
| B2 at lag 0, 6, 11 | per-tick-ish sweep (step 6 ticks, four wrong plays: stop, run on, run+jump, run+jump offset) max: 09 **5.88 / 7.08 / 6.85**, 10 **7.10 / 6.97 / 7.33** (lag 0 / 6 / 11) |

## Blocking

### R2-1. Replay over the limit at lag 12: KVT-10 cp5 (x178.5) = 8.75 s
- **What:** from the checkpoint at x178.5 (choora into thengu) a run-and-jump that never touches ground at cp6 (x218.5) flies on and dies by splash at x235.1, 8.75 s after cp5 was captured. The rule is at most 8 s, and the round-2 bar is 7.5 s.
- **How reproduced:** `tests/qa/probe.test.ts` test `worst`, `QA_IDS=KVT-10 QA_STEP=6 QA_LAG=12 QA_IDLE=156` (and idle 40): `KVT-10 lag 12 stretch from cp5: worst replay 8.75 s (run+jump@36.3 s -> splash x235.1)`; idle 40 gives 8.78 s. At lag 11 it is 7.33, at lag 6 6.97, at lag 0 7.10, so it is a cliff just before lag 12. The builder's sweep (coarse worst only) found 7.44.
- Also over 7.5 at lag 12 (not over 8): KVT-10 cp18 (x492.5) **7.92 s** (run+jump@90.3 s -> splash x501.8) and KVT-09 from the spawn **7.88 s** (run+jump@6.4 s -> splash x40.7; 1.3 s of it is the spawn idle of 156 ticks, so about 6.6 s of play; a note, not a finding).
- **What satisfies me:** KVT-10 cp5 at most 7.5 s at lag 12 (a checkpoint nearer cp6 or a trap closer to cp5), cp18 under 7.5, then `worst` at lag 0 / 6 / 11 / 12.

### R2-2. Padding: two more runs of identical steps
- `kvt09-kodumudi` **DOWN** (`DOWN(x)`, encores.ts): 4 steps, all 3 wide and one row each, same answer (walk off): 3 repeats of one window. The ascent was made one ladder (3, 3, 2, 2); the descent was not.
- `kvt09-kadalbhitti` **ascent** (`bankUpRects(c.x + 2, 6, 3, 14)`): 6 identical 3-wide steps before the first break. Unchanged since round 1 (I did not name it then).
- **What satisfies me:** vary each run (widths or heights, for example 3, 2, 3, 1) or cut each to two steps. One repeat of a window is fine.

## Notes (not findings)
- `kvt10-veliyettam`: its two hops between the heads are both one-tile gaps from standstill (heads 4, 3, 4 wide, gaps 1 and 1; the builder's "gaps 1, 1, 2" counts the shore). One repeat is allowed; vary one if the act is touched.
- A stricter play of mine, `tapLong` (right held 0.67 s with a tap jump, then idle), dies at 19 checkpoints at all lags (splash about 0.7 s on). It is not in the rule, which is the 0.3 s run and the tap-jump until landing, and the repo's strict `cpsafe` passes; I report it only because it shows how close the pit edges still are to the checkpoints.
- Decision sweep, as written in FIX-1: no act repeats another KVT act's decision or a shipped one (veliyettam now reverses KVT-08's sandbar and the glass). Close pair judged different: kodumudi's first half "land on the far tile" and kadalbhitti's first heap "land deep" are the room's decision again (the ladder / lead-in, R2-2).
- Polish: `SinkStep.draw` shows the "going under" water strip whenever `on > limit - 54`; for the 'move' heads (limit 40) that is always true, so the strip is drawn on every head all the time (visible in `r2/KVT-10-b.png`). The nizhal lit step is a pale box and the unlit steps are dark slabs on a pale sea: readable, low contrast. The tide-head death line is unchanged. The "Found it!" overlap on the first frame is the shared card.
- KVT-09 length (36.7 s) and KVT-07's 13-15 s replay: parked as decided.
- KVT-10 relaxed lag 84 (18 t): informational, not in the bar.

## Not checked
Real-device touch and audio; Malayalam by a native speaker; a true per-tick replay sweep (mine is every 6 ticks with four plays, finer than the builder's).

## Re-test
`worst` at lag 0 / 6 / 11 / 12 (both stages) with no stretch over 7.5 s, the two padding runs re-read, then suite, flows and fair as above.
