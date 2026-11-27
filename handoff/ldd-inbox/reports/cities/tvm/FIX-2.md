# TVM fix round 2 (from QA/FAIL.md, round 2)

Branch `city/tvm`, worktree `/local/home/saiposh/personal/ldd-wt/tvm`. Base 7cbf35e. Head **f84b13c** (5fbca3e: checkpoints clear of the next whistle, probe at three lags; f84b13c: shore two tiles wider, static trigger check, refrozen). Only TVM-09 and TVM-10 checkpoints, and the triggers next to them, changed. No new act, no padding, 02-08 untouched. Own files only (`src/game/cities/tvm/{encores,levels}.ts`, `tests/cities/tvm.ts`, `tests/cities/tvm/probe.test.ts`, `tests/cities/_frozen/tvm.json`). No push, no bump.

## The rule, and how it is checked

Every checkpoint on 09 and 10 must:

1. be at least **3.5 tiles before** the next wave, tarp, ice or rocket trigger ahead of it;
2. be reached only **after the previous wave has fully run out**, at lag 0 and at lag 12. Checkpoints only move forward, so a checkpoint past a trigger has to be past the furthest point Dad reaches before that wave is out, lag overshoot included (about 0.9 tile at 12 ticks).

The probe `tests/cities/tvm/probe.test.ts` checks it three ways (`LDD_TVMPROBE=1 npx vitest run tests/cities/tvm/probe.test.ts --silent=false`; `LDD_LAG` and `LDD_IDLE` set probe5's route lag and spawn idle):

- **probe7 (static):** for every checkpoint, the distance to the next trigger ahead, and any trigger less than 3.5 tiles behind it.
- **probe6 (capture):** for every checkpoint, the route at lag 0, 2, ..., 12 × spawn idle 0/90/180/270 (28 runs per stage). It asks whether the checkpoint is taken while any wave is whistled or in, and whether standing 4 s from it lives.
- **probe5 (calm + replay):** at the given lag, the checkpoint times, the longest stretch, calm from every checkpoint (idle 4 s / run 0.3 s then idle / tap jump then idle), and the worst replay per stretch, branching stop / run on / run+jump off the route every 0.25 s.

## What changed

| Finding | Change | File | Before | After |
| --- | --- | --- | --- | --- |
| TVM-10 shore checkpoint (was x124.2, 0.2 tile past the second wave's trigger at x124.0) | The shore act is 2 tiles wider (w 36 → 38, the end rocks and surf edge moved on by 2). Its last checkpoint is now x+30.4, past the second whistle (x+27.5) by more than the lag overshoot, and 3.8 tiles before the third whistle (now x+34.2, was x+31.8; its wave comes in at 3.2 s, was 3.0, for the 2 tiles longer walk back) | `encores.ts` (theeram), `tests/cities/tvm.ts` (its route) | captured mid-wave in 36/52 QA runs (lag 4-12); calm check fails at lag 6 and 12; replay 15.4 s | captured mid-wave in **0/28** runs; calm at every lag; worst replay from it 7.0 s at lag 12 |
| TVM-09 spawn stretch (8.4 s at lag 6, 9.1 s at lag 12) | A hidden checkpoint at x2.0, just past the spawn and 3.5 tiles before the first whistle (x5.5). A player who idles at the spawn and then goes now replays from there, not from the spawn | `levels.ts` (TVM-09 `cps: [2]`) | 9.1 s | **7.6 s** at lag 12 |
| TVM-10 cp13 stretch (9.4 s at lag 12, a run+jump off the tarp beach's end rocks over the Chalai checkpoint into the drain) | A checkpoint on the tarp beach's end rocks (x+32.5), reached on foot after its last wave. And the Chalai checkpoint is now at act col 3.0 (3.6 tiles before the ice's twitch; it was 3.1) | `encores.ts` (thira and chanda `cps`) | 9.4 s | **1.1 s** (from the new rocks checkpoint) |

probe7, after: **TVM-09: no checkpoint within 3.5 tiles of a trigger ahead of it, and none less than 3.5 tiles past one. TVM-10: no checkpoint within 3.5 tiles of a trigger ahead of it.** Two sit less than 3.5 tiles *past* a trigger, both reached only after that wave is out (rule 2):

- x126.4, 2.9 past the shore's second whistle. Dad goes back left at that whistle, so overshoot reaches about x124.4.
- x167.5, 3.3 past the palm beach's fourth whistle, which also sends him back.

probe6 confirms both are never taken mid-wave.

## Checkpoint table at three lags (probe5; idle 0 / 78 / 156 ticks as in QA's runs)

**TVM-09.** Route 64.3 / 65.8 / 67.2 s at lag 0 / 6 / 12. Longest stretch 9.6 / 9.7 / 9.8 s.

| cp | x | taken at lag 0 / 6 / 12 | worst replay after it, lag 0 / 6 / 12 | captured mid-wave (probe6) |
| --- | --- | --- | --- | --- |
| spawn | 1.5 | 0 | — (the x2 checkpoint is taken 0.1 / 0.8 / 1.5 s after) | |
| cp0 | 2.0 (new) | 0.1 / 0.8 / 1.5 s | 7.5 / 7.6 / 7.6 s | 0/28 |
| cp1 | 32.5 | 9.3 / 10.1 / 10.9 s | 5.6 / 5.5 / 5.5 s | 0/28 |
| cp2 | 46.0 | 16.3 / 17.1 / 18.0 s | 5.0 / 5.0 / 5.0 s | 0/28 |
| cp3 | 72.5 | 23.2 / 24.2 / 25.1 s | 5.1 / 4.9 / 5.0 s | 0/28 |
| cp4 | 82.4 | 29.1 / 30.1 / 31.1 s | 5.0 / 5.0 / 5.0 s | 0/28 |
| cp5 | 106.5 | 35.6 / 36.8 / 37.8 s | 5.2 / 5.4 / 5.3 s | 0/28 |
| cp6 | 129.4 | 41.7 / 42.9 / 44.0 s | 6.7 / 7.0 / 7.1 s | 0/28 |
| cp7 | 138.5 | 50.4 / 51.6 / 52.8 s | 7.8 / 7.8 / 7.8 s | 0/28 |
| cp8 | 167.5 | 59.9 / 61.3 / 62.6 s | 5.0 / 5.0 / 5.0 s | 0/28 |

**TVM-10.** Route 96.3 / 98.1 / 99.8 s. Longest stretch 9.5 / 9.6 / 9.7 s.

| cp | x | taken at lag 0 / 6 / 12 | worst replay after it, lag 0 / 6 / 12 | captured mid-wave |
| --- | --- | --- | --- | --- |
| spawn | 1.5 | 0 | 3.7 / 4.3 / 5.0 s | |
| cp0 | 32.5 | 4.0 / 4.8 / 5.6 s | 2.1 / 2.7 / 2.7 s | 0/28 |
| cp1 | 46.6 | 6.7 / 7.5 / 8.3 s | 1.6 / 1.2 / 1.2 s | 0/28 |
| cp2 | 66.5 | 9.0 / 9.9 / 10.7 s | 2.9 / 3.0 / 3.0 s | 0/28 |
| cp3 | 98.2 | 15.0 / 16.1 / 17.1 s | 6.1 / 6.0 / 6.1 s | 0/28 |
| cp4 | 119.7 | 21.9 / 23.0 / 24.0 s | 7.8 / 7.9 / 7.9 s | 0/28 |
| cp5 | 126.4 (moved, was 124.2) | 31.2 / 32.3 / 33.4 s | 7.0 / 7.1 / 7.0 s | 0/28 |
| cp6 | 134.5 | 40.6 / 41.9 / 43.0 s | 7.8 / 7.7 / 7.7 s | 0/28 |
| cp7 | 151.0 | 50.0 / 51.3 / 52.5 s | 5.6 / 5.5 / 5.6 s | 0/28 |
| cp8 | 160.4 | 56.2 / 57.6 / 58.8 s | 5.8 / 5.8 / 5.8 s | 0/28 |
| cp9 | 167.5 | 64.1 / 65.5 / 66.8 s | 1.0 / 1.1 / 1.0 s | 0/28 |
| cp10 | 170.5 | 64.4 / 65.9 / 67.1 s | 3.0 / 3.2 / 3.2 s | 0/28 |
| cp11 | 198.2 | 68.3 / 69.9 / 71.3 s | 6.3 / 6.2 / 6.1 s | 0/28 |
| cp12 | 210.6 | 75.2 / 76.9 / 78.3 s | 5.6 / 5.5 / 5.6 s | 0/28 |
| cp13 | 221.4 | 81.5 / 83.2 / 84.7 s | 5.7 / 5.8 / 5.7 s | 0/28 |
| cp14 | 228.5 (new, tarp-beach end rocks) | 89.6 / 91.4 / 93.0 s | 1.1 s at lag 12 | 0/28 |
| cp15 | 230.5 (Chalai act start) | 89.9 / 91.7 / 93.3 s | (no death) | 0/28 |
| cp16 | 233.0 (moved, was 231.5) | 90.1 / 91.9 / 93.4 s | 2.6 / 3.0 / 3.0 s | 0/28 |
| cp17 | 259.5 (door) | 94.2 / 96.1 / 97.8 s | 2.1 / 1.8 / 2.2 s | 0/28 |

(The x in the "taken at" column is where Dad first stands past the checkpoint, so it can read a little higher than the checkpoint, e.g. cp14 "x229".)

**Calm:** at lag 0, 6 and 12, no calm-check death from any checkpoint of TVM-09 (9 checkpoints) or TVM-10 (18): 3 plays × 27 checkpoints × 3 lags, all live. probe6: 0 checkpoints taken mid-wave or not calm, in 28 route runs per stage. **Worst replay anywhere: 7.9 s** (TVM-10 cp4, the soaked sand, lag 6 and 12). **Longest stretch: 9.8 s.**

## Refrozen numbers (vs 7cbf35e)

- TVM-09 checkpoints + 2: the new spawn-side checkpoint. Route, NAIVE and FIX ticks unchanged (7721 / 325 / 789).
- TVM-10 checkpoints:
  - 124.2 → 126.4: the shore checkpoint moved past the second whistle (x+28.6 → x+30.4, on a shore that is 2 tiles wider).
  - Every checkpoint after the shore is +2 (132.5 → 134.5, 149 → 151, 158.4 → 160.4, 165.5 → 167.5, 168.5 → 170.5, 194.5 → 196.5, 208.6 → 210.6, 219.4 → 221.4, door 257.5 → 259.5): the 2 extra tiles of shore.
  - New: 228.5 (tarp-beach end rocks) and 233.0 (Chalai, was 231.5, now act col 3.0).
- TVM-10 route 11465 → 11550 ticks (+85, +0.7 s): the walk across the 2 extra shore tiles there and back, and the third shore wave coming in at 3.2 s instead of 3.0 (+24 ticks). NAIVE 137 and FIX 344 unchanged.
- TVM-01..08: nothing moved.

## Tests and fairness

- `npm run typecheck`: clean.
- Full `npx vitest run` with `TVM: OLD` removed from `tests/modules.test.ts` locally (restored after): **1508 passed, 0 failed**, 17 skipped (the gated probe tests).
- `LDD_N=80 npm run fair -- TVM`:

```
TVM-01: 6t 100%  12t 100%  18t 98%   s0 100%  s1 100%  s2 100%  door 100%
TVM-02: 6t 100%  12t 100%  18t 76%   s0 100%  door 100%
TVM-03: 6t 100%  12t 99%  18t 78%    s0 99%  door 100%
TVM-04: 6t 100%  12t 100%  18t 84%   s0 100%  door 100%
TVM-05: 6t 100%  12t 100%  18t 84%   s0 100%  door 100%
TVM-06: 6t 100%  12t 99%  18t 75%    s0 99%  door 100%
TVM-07: 6t 100%  12t 100%  18t 80%   s0 100%  s1 100%  door 100%
TVM-08: 6t 100%  12t 100%  18t 76%   s0 100%  door 100%
TVM-09: 6t 100%  12t 100%  18t 98%   s0-s8 100%, door 100%
TVM-10: 6t 100%  12t 100%  18t 76%   s0-s17 100%, door 100%
```

## Still short / for QA to press

- The worst replays (7.8-7.9 s) leave about 0.1-0.2 s under 8 s. They are the soaked-sand stretch on the shore and the Ashoka/palm-beach chained pairs. The margin holds at lag 0, 6 and 12 in my probe. It is thin.
- The shore is 2 tiles wider than in round 1. That is layout, not a new beat.
- probe6 samples lag in steps of 2 ticks and four idles; QA's probe6 used every lag 0-12.
