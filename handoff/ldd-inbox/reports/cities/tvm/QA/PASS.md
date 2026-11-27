# TVM extend-and-toughen: independent QA: PASS (round 6, 2e7eba9)

Subject: `city/tvm` at **2e7eba9**, checked out in my detached worktree `/local/home/saiposh/personal/ldd-wt/qa-tvm`. I committed and pushed nothing. TVM was taken off the OLD list in `tests/modules.test.ts`, which also takes it off the cpsafe allow-list because cpsafe reads that file, only while tests ran. All my probes are in `tests/qa/probe.test.ts` (untracked; copy in `QA/qa-probe.test.ts.txt`).

Earlier rounds failed and their findings are fixed; each report is kept:

| Round | Report | Finding |
| --- | --- | --- |
| 1 | `FAIL-1.md` | replay over 8 s on 09 and 10, an uncalm TVM-10 checkpoint, two finale acts with the same betrayal, faint oil |
| 2 | `FAIL-2.md` | the shore checkpoint was taken mid-wave at human lag |
| 3 | `FAIL-3.md` | TVM-10 cp4 replay 8.025 s |
| 4 | `FAIL-4.md` | the TVM-02 checkpoint was on the bus roof at lag 11-12 |
| 5 | `FAIL-5.md` | the TVM-03 checkpoint was next to a spray at lag 9-12 |

## Round 6: what I ran

| Check | Result |
| --- | --- |
| Diff 5561d4a → 2e7eba9 | `levels.ts`: TVM-03 `checkpoint` 38 → 12. `tests/cities/_frozen/tvm.json`: that one column, 38 → 12. Plus the builder's own probe file. Nothing else moved |
| TVM-03 x12, `probe15`: route at lag 0-12 (every tick) x spawn idle 0-345 in steps of 15, the checkpoint taken where that play takes it, then idle 4 s / run 0.3 s / tap jump | **312 captures, 0 deaths** |
| `probe17`: the same sweep, capture at the first on-ground tick with Dad's centre at or past x | x12: 307 captures, **0 deaths**. x44: 307 captures, **0 deaths** (note below). In 5 runs, all at lag 10-12, the route itself lost before reaching the door, which matches fair's 99% on TVM-03 |
| Shipped-stage ruling for TVM-03 | route at most **14.9 s** (after spawn idle) over the whole sweep, and checkpoint x12 → door at most **13.6 s**. Both under 25 s |
| `npx vitest run tests/cpsafe.test.ts -t TVM`, TVM off the allow-list | **10 passed** |
| Full `npx vitest run`, OLD line removed (my `tests/qa` moved out during the run) | **1640 passed, 20 skipped, 0 failed** |
| `npm run build:single && node scripts/flows.mjs` | built; **no errors** (CHROME_PATH set to the cached chromium-1228, because playwright's expected 1254 is not installed on this host) |

## Everything the item asks, and where it was shown

1. **Tests:** suite green with TVM's excuse removed, including the prefix guard, stale.test, allocation.test, the frozen-behaviour test on the refrozen file, and cpsafe's three plays at lag 0/6/12 (this round). Build and flows clean. Typecheck clean (rounds 1-4).
2. **Old stages 02-08 unchanged in play:**
   - The only behaviour change is TVM-03's tea glasses, 100 → 85 px/s (round 1).
   - Every NAIVE and FIX tick and cause of 02-08 is identical to bc76d83. The route diffs are only 05 (2170 → 2179) and 06 (1558 → 1562), from the re-timed human routes.
   - The checkpoint columns of 02, 03, 04, 05 and 08 moved for develop's cpsafe gate (rounds 4-6). On 03 that is 47 → 12.
3. **Fairness:** `LDD_N=80 npm run fair -- TVM` (round 4, unchanged since): 6t and 12t are 99-100% on every stage, and every stretch is 99-100%. The re-timed 03/05/06/07 routes are human play. Each move wins over a 15-32 tick window, measured by sweeping the changed timing (round 1).
4. **Encores:**
   - TVM-09 Kovalam Flags: 64.3 s (floor 60). NAIVE `tvm-drift`; FIX `tvm-rip`, a different trap.
   - TVM-10 Dhara finale: 95.7 s (floor 90), `lives: 'act'`. NAIVE `tvm-droni` 137; FIX `tvm-kindi` 344.
   - In every finale act the obvious fix dies to a different cause and tick from the obvious play. The seven acts have distinct betrayal types.
   - Checkpoints:
     - Route at every lag 0-12 x 4 idles: 0 mid-wave captures and 0 calm deaths on 09 and 10 (round 4).
     - Longest stretch 9.8 s.
     - Worst replay 7.9 s on 09 (cp7) and 7.767 s on 10 (cp6). TVM-10 cp4 is 7.325 / 7.383 / 7.425 s per 3 ticks at lag 0/6/12 (round 4).
   - Readability at 844x390: amber oil pools, no yellow ground flowers, the soaked sand and rip read. Death lines name the killer (round 2).
5. **Tour bite (01, fish ice):** the NAIVE dies `tvm-chaal`, and the death reads at phone size. The seventh-death line "Ezhu chaaya! Chechi parayunnu: aadyam muthal." has replaced the Thala joke. Stages 02-10 have intros, and every TVM key is `tvm-` prefixed (round 1).
6. **Uniqueness (round 1):** Kovalam's lifeguard moves the flags before each wave, so safety is a marked zone that moves. That plays differently from PDY-06 (tide dips) and PDY-07 (waves on boards). Dhara's off-centre drip is not CHN-01's Pongal spill or DMN-03's slippery ice.
7. **Malayalam:** plausible throughout (round 1).

## Notes (not blocking)

- **Ride and short shipped stages restart from far back (conductor's ruling).** TVM-02 (bus, 17-18 s) and TVM-08 (snake boat, 16-18 s) have their only calm checkpoint at the far end. TVM-03's is at x12, before the sprays (route at most 14.9 s, x12 → door at most 13.6 s). A death past those points replays up to about 13-17 s. All routes are under 25 s.
- **x44 also passes** my lag-and-idle sweep on TVM-03 (0 deaths in 307 captures), although it is under 4.5 tiles from the x42.5 and x45.5 sprays. x12 is calm too, so this is only a note: a later pass could put a second, closer checkpoint there.
- **TVM-05's checkpoint (x35.5) is exactly 4.5 tiles from the moat edge** (x40.0), not 4.9 as FIX-3.md said.

## Polish (for a later pass)

- TVM-07's jeep windows (0.125-0.14 s) are the tightest in the city.
- TVM-09 and TVM-10's worst replays sit at 7.7-7.9 s, close to the 8 s bar.
- A native check on "Thira povumbol pokuka" ("pokumbol" is the usual form) and the Manglish "Avide plant cheythu".
- The title card shows in mid-stage frames of the shot script. This looks like a shot-script artifact; check it once on a device.
- The `coconut`/`drop` module cycle between `levels.ts` and `encores.ts` is harmless at build time.
- `cpsafe.test.ts` captures checkpoints on a lag-0 route. Rounds 4 and 5 found two spots (TVM-02 x86, TVM-03 x38) that only fail when the route itself is lagged. Capturing on lagged routes, as `probe15` does, would catch these in CI.

Not checked: real-device touch, audio.
