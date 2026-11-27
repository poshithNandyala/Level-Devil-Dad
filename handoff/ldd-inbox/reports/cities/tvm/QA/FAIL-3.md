# TVM extend-and-toughen: independent QA, round 3: FAIL (one finding, 0.025 s over)

Subject: `city/tvm` at **f84b13c**, checked out in my detached worktree `/local/home/saiposh/personal/ldd-wt/qa-tvm`. Nothing committed. Earlier rounds: `QA/FAIL-1.md`, `QA/FAIL-2.md`. All numbers come from my own probes, `tests/qa/probe.test.ts` (untracked; copy in `QA/qa-probe.test.ts.txt`). I did not use the builder's probe.

Verdict: everything holds except one replay. At lag 12, a death on the shore's soaked sand replays **8.025 s** from TVM-10 checkpoint cp4, which is over the 8 s bar. It is a 3-tick fix. Nothing else blocks.

## What I ran

| Check | Result |
| --- | --- |
| (1) Capture test, new `probe8`: every checkpoint of 09 and 10, the route at **every lag 0-12** (13 lags) x spawn idle 0/90/180/270, 52 route runs per stage. Is the checkpoint taken while any `Surf` is not `calm` (whistled, walking, rising, in, falling)? | TVM-09: 52/52 routes won, **0 checkpoints taken mid-wave**. TVM-10: 52/52 won, **0 mid-wave** |
| (2) Calm from every checkpoint (idle 4 s; run 0.3 s then idle; tap jump then idle), in the same 52 runs per stage, so at every lag | **no death** on either stage |
| (3) Replay and stretch, `probe5` at lag 0 / 6 / 12 (idle 0 / 78 / 156), branching stop / run on / run+jump every 0.25 s | TVM-09 longest stretch 9.6 / 9.7 / 9.8 s, worst replay 7.8 / 7.8 / 7.8 s. TVM-10 longest stretch 9.5 / 9.6 / 9.7 s, worst replay 7.8 / 7.9 / 7.9 s. No calm-check death. Route 64.3 / 65.8 / 67.2 s (09), 96.3 / 98.1 / 99.8 s (10) |
| (3b) Same, branching every 3-6 ticks instead of 30 | lag 0: worst 7.9 s (TVM-09 cp7, TVM-10 cp4). lag 6: TVM-10 cp4 **7.983 s**. lag 12: TVM-10 cp4 **8.025 s** at idle 156 and again at idle 0. See B1c |
| (4) Frozen file vs bc76d83 | 02-08: no NAIVE or FIX tick or cause moved; the only route diffs are the round-1 ones (05 2170→2179, 06 1558→1562). TVM-09 route 7721, NAIVE 325, FIX 789 (unchanged from round 2). TVM-10 route 11550 (96.3 s), NAIVE 137, FIX 344. The code diff 7cbf35e..f84b13c touches only the TVM-09 `cps: [2]`, the shore (`w` 36→38, end rocks, `x1`, third wave `x+34.2` / in at 3.2 s, `cps [23.6, 30.4]`), the tarp-beach `cps` (+32.5) and Chalai `cps [3.0]` |
| Full suite with `TVM: OLD` removed locally (my `tests/qa` moved out during the run; both restored) | typecheck clean; **1508 passed, 17 skipped, 0 failed** |
| `LDD_N=80 npm run fair -- TVM` | 01-08 the same as rounds 1-2; 09 100/100/98, s0-s8 and door 100%; 10 100/100/76, s0-s17 and door 100% |
| `npm run build:single && node scripts/flows.mjs` (CHROME_PATH set to the cached chromium-1228) | no errors |
| (5) Shore at 844x390 | see "Holds" |

## Blocking

### B1c. TVM-10 shore: replay 8.025 s at lag 12

- **What:** cp4 (x119.7) sits inside the shore's first strip. At lag 12, Dad passes it at 24.0 s, early in wave 1. A player who stays for the second whistle and then run-jumps back over the soaked sand dies `tvm-soaked` at x114.6, **8.025 s** after that checkpoint. That is 3 ticks over 8 s. The same play is 7.983 s at lag 6 and 7.9 s at lag 0. The builder's 7.9 s comes from branching every 0.25 s, which steps over the worst moment.
- **How reproduced:** `QA_IDS=TVM-10 QA_STEP=3 QA_LAG=12 QA_IDLE=156 npx vitest run tests/qa/probe.test.ts -t probe5 --silent=false` → `stretch from cp4: worst replay 8.025s (run+jump@31.6s -> tvm-soaked x114.6)`. With `QA_IDLE=0` the result is the same, 8.025 s (run+jump at 30.3 s).
- **What satisfies:** that stretch at most 8 s at lag 12 with fine branching. For example: the second shore whistle a few ticks sooner, cp4 a little further into the strip, or wave 1's run-in shortened by 0.1 s. Any of these must keep `probe8` at 0 mid-wave captures and 0 calm deaths.

## Holds

- **B1 (the round-2 shore checkpoint):** cp5 is now at x126.4, past the second whistle (x124.0) by 2.4 tiles. In 52 runs at every lag 0-12 it is never taken mid-wave, and it is calm. Its worst replay is 7.0-7.2 s. The TVM-09 spawn stretch is 7.5 / 7.6 / 7.6 s from the new x2 checkpoint (was 8.4 / 9.1). The old TVM-10 cp13 case (9.4 s) is now 1.1 s from the tarp-beach rocks checkpoint.
- **Every stretch under 25 s** at all lags (longest 9.8 s).
- **The shore teaches the same thing and reads the same.** The soaked sand is still at `x+11..x+18` with the same paint, and waves 1 and 2 are unchanged. The extra 2 tiles are at the far end, and only the third wave moved (to x+34.2, in at 3.2 s). At 844x390 the death frame is the same as in round 2: Dad sinks into the dark, grassless patch with the lifeguard in the strip beyond, and the line "The soaked sand gave way under your hop." (`QA/qa3-10-shore-soaked-death.png`).
- **From rounds 1-2 (unchanged code):** courtyard checkpoint calm; act types distinct; uzhichil and chanda MISTAKES; every A1/A2 pair differs in cause and tick; amber oil readable; no yellow ground flowers; tour bite; seventh line; intros; `tvm-` prefixes; uniqueness; Malayalam; re-timed 03/05/06/07 routes human.

## Re-test

After the fix: `probe5` at lag 0/6/12 with `QA_STEP=3` on TVM-10 (and the default step on TVM-09), and `probe8`. The suite and fairness only need re-running if anything beyond the shore numbers moves.

Not checked: real-device touch and audio.
