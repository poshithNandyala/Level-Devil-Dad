# TVM extend-and-toughen: independent QA, round 4: FAIL (one finding: the moved TVM-02 checkpoint)

Subject: `city/tvm` at **389996d** (base f84b13c plus develop 4c38bcb), checked out in my detached worktree `/local/home/saiposh/personal/ldd-wt/qa-tvm`. Nothing committed or pushed. TVM was removed from the OLD list in `tests/modules.test.ts` only while the tests ran, then restored. `tests/cpsafe.test.ts` reads its allow-list from that same file, so that one edit took TVM off both lists. Probes are mine: `tests/qa/probe.test.ts` (untracked; copy in `QA/qa-probe.test.ts.txt`). Earlier rounds: `FAIL-1.md`, `FAIL-2.md`, `FAIL-3.md`.

Verdict: checks 1, 2, 4 and 6 hold, and the round-3 finding is fixed. Check 3 fails on one stage. At lag 11-12 the new TVM-02 checkpoint (x86.0) is taken while Dad is still on the bus roof, and a 0.3 s run from there dies in the water.

## Blocking

### B5. TVM-02: checkpoint x86.0 taken on the bus roof at lag 11 and 12; a 0.3 s run from it dies `splash`

- **What:** the parked bus spans x80.0-86.0. The checkpoint at x86.0 is exactly the bus roof's right end, and checkpoints count while Dad stands on anything. At lag 0-10, Dad first stands past x86.0 on the bank tiles, at x88.6-89.3, so the checkpoint is calm there. At lag 11 and 12 his centre reaches x86.00 while he is still on the bus (y 11.63). The checkpoint is taken there, and the respawn puts him on the bus roof's edge, right above the gap to the bank. From that respawn, "run 0.3 s then idle" dies **`splash` at x87.7**. Idle and tap jump live.
- **How reproduced:**
  - `probe10`: TVM-02 route at lag 0/6/8/10/11/12 x spawn idle 0/90/156/270. In **8 of 24 runs** (all of lag 11 and 12) the checkpoint is taken at 15.08-16.40 s with "on BUS". In every one of them, run 0.3 s → `dead splash x87.7`.
  - `probe9` (the five moved spots at lag 0/6/12, idle 13 x lag): TVM-02 lag 12 → `cp0 x86.0 ... Dad x86.0 row 12 ... run0.3: DIES splash`.
  - `npx vitest run tests/cpsafe.test.ts -t TVM` is green, because it captures the checkpoint on a lag-0 route and only then plays the lagged probes. The fault shows only when the route itself runs at human lag.
- **Also:** the checkpoint is not at least 4.5 tiles short of the water. It sits on the gap's left edge.
- **What satisfies:** put the TVM-02 checkpoint on the far bank, past the gap and onto tiles. The builder's own calm range is x85.5-93.5, and at lag 0-10 Dad stands at x88.6-89.3 when it is taken, so somewhere around x89.5-90 fits. Then `probe9` and `probe10` must show the checkpoint taken on tiles at every lag 0-12, with idle, run and tap all living.

## Holds

1. **Round-3 finding, TVM-10 cp4 (x119.7):** with branching every 3 ticks (`QA_STEP=3`), the worst replay is **7.325 / 7.383 / 7.425 s** at lag 0 / 6 / 12. That is under 7.5 s each time; round 3 measured 8.025 s. The death is still a run-and-jump on to the soaked sand at x114.5-114.6.
   - The trap is not softer. `probe13`, from cp4: walk to the second whistle and stay → `tvm-drift` x124.7. Whistle, walk back a little and stop short → `tvm-drift` x120.7. Whistle, run back and jump the dark sand → `tvm-soaked` x110.0.
   - The shore A1 ("stay in the flags you were in" → `tvm-rip` x103.8, 18.6 s) and A2 ("jump the dark sand" → `tvm-soaked` x112.1, 16.6 s) are unchanged.
   - Frozen TVM-10 NAIVE is 137 `tvm-droni` and FIX is 344 `tvm-kindi`, both unchanged. A wave in for 2.0 s is still more than twice a full jump's air time.
   - Worst replay anywhere in TVM-10: 7.758 / 7.758 / 7.767 s (cp6, the palm-beach pair). Longest stretch: 9.5 / 9.6 / 9.7 s.
2. **09/10 regressions:**
   - `probe8` ran the route at every lag 0-12 x idle 0/90/180/270, 52 runs per stage. On both stages: 0 checkpoints taken while a wave is whistled or in, and 0 calm deaths (idle 4 s / run 0.3 s / tap jump) from any checkpoint.
   - `probe11` (static): no checkpoint is less than 3.5 tiles before a wave trigger. Three sit less than 3.5 tiles past one: x126.4 (2.9), x167.5 (3.3) and x228.5 (3.5). `probe8` shows all three are never taken mid-wave, so the round-2 ruling still holds.
   - TVM-09's code is unchanged since round 3: worst replay 7.9 s with fine branching, longest stretch 9.8 s.
3. **The other four moved checkpoints (`probe9`, lag 0/6/12):**
   - TVM-03 x41.5: idle, run and tap all live; 6.5 tiles to the next hole.
   - TVM-04 x56.5: all live; 21.5 tiles to the next hole.
   - TVM-05 x35.5: all live. The moat edge is at x40.0, **4.5 tiles** from the checkpoint, exactly the bar (FIX-3.md says 4.9). Dad stands at x35.5-35.6 when it is taken.
   - TVM-08 x89.5, the finish jetty: all live; 6.4-6.5 tiles to the next edge.
   - `npx vitest run tests/cpsafe.test.ts -t TVM` with TVM off the allow-list: **10 passed**.
4. **Frozen diff f84b13c → 389996d:** only the checkpoint columns TVM-02 48→86, 03 47→41.5, 04 46→56.5, 05 38→35.5, 08 50→89.5, and TVM-10's route 11550→11478. Every route, NAIVE and FIX tick and cause of 01-09 is unchanged. The code diff is the same five `checkpoint(w, tx)` lines plus shore wave 2 `inFor` 2.6→2.0. The frozen-behaviour test plays 02-08 and is green.
5. **Ruling note (not blocking), TVM-02 and TVM-08 ride stages:** the routes are 17.1 / 17.3 / 17.9 s (02) and 16.1 / 16.9 / 17.6 s (08) at lag 0/6/12, under 25 s. With the checkpoint at the far end, a death on the ride restarts the stage, a replay of up to about 15-17 s. I did not search for a calm mid-ride spot beyond the builder's scan and found no evidence of one. B5 is about where the far-end checkpoint sits, not about the replay.
6. **Suite and proofs:**
   - Typecheck clean.
   - Full `npx vitest run` with the OLD line removed (my `tests/qa` moved out during the run): **1640 passed, 18 skipped, 0 failed**.
   - `npm run build:single && node scripts/flows.mjs`: no errors (CHROME_PATH set to the cached chromium-1228).
   - `LDD_N=80 npm run fair -- TVM`: 6t and 12t are 99-100% on every stage, and every stretch is 99-100%. 01 100/100; 02 100/100; 03 100/99; 04 100/100; 05 100/100; 06 100/99; 07 100/100; 08 100/100; 09 100/100; 10 100/100.

## Re-test

After moving the TVM-02 checkpoint: `probe9` and `probe10` on TVM-02 at lag 0-12, `cpsafe -t TVM`, and the frozen diff (that one column only). Nothing else needs re-running unless more moves.
