# TVM extend-and-toughen: independent QA, round 2: FAIL

Subject: `city/tvm` at **7cbf35e** (fixes in 3948992), in my detached worktree `/local/home/saiposh/personal/ldd-wt/qa-tvm`. Nothing committed. My round-1 report is kept as `QA/FAIL-1.md`. I measured everything with my own probes: `tests/qa/probe.test.ts` (untracked; copy in `QA/qa-probe.test.ts.txt`). This round adds a lag/idle parameter to the probe5 route (`QA_LAG`, `QA_IDLE`) and a new `probe6`, which checks TVM-10 cp5 over lag 0-12 x 4 idles. I did not use the builder's `tests/cities/tvm/probe.test.ts`.

Verdict: B2, B3 and B4 are fixed. B1 is fixed at lag 0 only. At human lag one new TVM-10 checkpoint, on the shore, is captured in the middle of a wave, so it is not calm and its replay is 15.4 s. Two other replays also go just over 8 s. Those are the only blocking findings.

## What I ran

| Check | Result |
| --- | --- |
| `npm run typecheck` | clean |
| Full `npx vitest run`, with `TVM: OLD` removed from `tests/modules.test.ts` locally and my `tests/qa` moved out during the run (both restored) | **1508 passed, 15 skipped, 0 failed** (18 files passed, 13 skipped) |
| `npm run build:single` | built. Shots and flows run with `CHROME_PATH` set to the cached chromium-1228, as in round 1 |
| `LDD_N=80 npm run fair -- TVM` | 01 100/100/98; 02 100/100/76; 03 100/99/78; 04 100/100/84; 05 100/100/84; 06 100/99/75; 07 100/100/80; 08 100/100/76; **09 100/100/98, s0-s7 and door all 100%; 10 100/100/76, s0-s15 and door all 100%**. Matches FIX-1.md |
| Frozen file vs bc76d83 | 02-08: the only diffs are the round-1 ones (01 market, 05 route 2179, 06 route 1562). No NAIVE or FIX tick or cause moved. TVM-09 route 7721 (64.3 s), NAIVE 325 `tvm-drift`, FIX 789 `tvm-rip`. TVM-10 route 11465 (95.5 s), NAIVE 137, FIX 344 |
| probe4, probe5 at lag 0 / 6 / 12 | B1, B2 below |
| Death frames at 844x390 | B3, B4 below. Copies: `QA/qa2-10-room-oil-phone.png`, `QA/qa2-10-fix-kindi.png`, `QA/qa2-10-shore-soaked-phone.png`, `QA/qa2-10-shore-soaked-death.png` |

## Blocking

### B1/B2 (round 2). TVM-10 shore: checkpoint cp5 (x124.2) is captured mid-wave at any human lag

- **What:** the shore act (`theeram`, `encores.ts` ~L196-206; act x = 96.5) has its second wave's trigger at `x + 27.5` = **x124.0**. The new checkpoint cp5 is at **x124.2**, 0.2 tiles past that trigger, not "3.5 tiles before it" as FIX-1.md says. At lag 0 the route bot stops short of x124.2 during the first wave and passes cp5 only later, at 30.9 s, which is calm. Any press lag of 4 ticks or more (0.033 s) carries Dad on to x124.3, so cp5 is passed 0.5 s after cp4, just as wave 2 starts and the lifeguard carries the flags back to `x + 6`.
- **How reproduced:**
  - `probe6`: the route at lag 0-12 x idle 0/90/180/270. cp5 is captured 0.5 s after cp4 in 36 of 52 runs (every lag from 4 to 12). From that save, standing still dies `tvm-drift` **3.12 s** after respawn.
  - `probe5` at lag 6 and at lag 12: the calm check fails at cp5 for all three plays (idle 4 s; run 0.3 s then idle; tap jump then idle): `tvm-drift` +3.12 s. The stretch from cp5 to cp6 is **17.7 s**, and the worst replay from cp5 is **15.4 s** (a run-and-jump at 38.5 s dies `tvm-soaked` at x114.4 on the way back over the soaked sand).
- At lag 0 the builder's numbers reproduce exactly: worst replay 7.8 s on both stages, longest stretch 9.6 s, and no calm-check death from any checkpoint of 09 or 10 (3 plays x 24 checkpoints). The fix depends on the route bot stopping within 0.2 tiles of a trigger, which a person does not do.
- **What satisfies:** put the shore checkpoint at least 3.5 tiles short of the `x + 27.5` trigger (or move the trigger), so that a player who walks on a little past the first strip cannot pass it mid-wave. Then `probe5` at lag 0, 6 and 12 and `probe6` must show no calm-check death and no stretch over 25 s.

### B1b. Replay just over 8 s at human lag (the 0.2 s margin does not hold)

- **What:** the same probe5 at lag 6 / lag 12 (idle 78 / 156 ticks):
  - TVM-09, from the spawn, a run-and-jump into the first drift (x26.8): **8.4 s** at lag 6, **9.1 s** at lag 12 (7.6 s at lag 0).
  - TVM-10, from cp13 (x219.4): **9.4 s** at lag 12, a run-and-jump into the Chalai drain at x236.6 (5.8 s at lag 0, 5.7 s at lag 6).
  - Every other stretch stays at 7.8 s or under at all three lags, apart from the cp5 case above.
- **What satisfies:** at most 8 s at lag 12 as well. For example, the first Hawa whistle slightly sooner (or a checkpoint before it), and a checkpoint at the Chalai approach.

## Fixed (round-1 findings)

- **B2, the courtyard (TVM-10 cp1, now x46.6):** a tap jump or a short run from it no longer reaches the palm oil. No calm-check death at cp1 at any lag. The palm-beach and tarp-beach act starts are calm at lags 0, 6 and 12.
- **B3, act types:**
  - The shore is now TVM-01's soaked ground on the way to the strip: it holds a walker and breaks under a hop or a landing. The strip itself is never the hazard. No other TVM-10 act uses that type: courtyard (tarp washes the oil), Thumba (stop at once), palm beach (stand clear of the crown), rooms (pot order reversed), tarp beach (wait for the tarp to empty, then in), Chalai (ice moves twice, then oil and kindi). The tarp beach no longer repeats "he paces".
  - Readability at phone size: the soaked stretch is a dark, grassless patch between Dad and the flags (`qa2-10-shore-soaked-phone.png`). In the death frame Dad sinks into it at its left end, with the lifeguard in the strip beyond (`qa2-10-shore-soaked-death.png`). The cause line reads "The soaked sand gave way under your hop." It reads as "I jumped on it". A jump from before it lands on it, which is the lesson.
  - New MISTAKES die where their advice says: rooms, "the long jump first" → `tvm-kindi` x179.8; Chalai, "step on to the ice after the twitch" → `tvm-chaal` x237.7.
  - A1 vs A2 per act (probe4, lag 0): courtyard drenched 5.2 s / coconut 7.9 s; Thumba burnt 10.9 s / crushed 12.0 s; shore rip 18.6 s / soaked 16.6 s; palm beach rip 42.8 s / coconut 41.8 s; rooms droni 64.3 s / kindi 65.3 s; tarp beach drenched 69.2 s / rip 71.4 s; Chalai chaal 90.4 s / kindi 91.8 s. The room is NAIVE droni 1.1 s / FIX kindi 2.9 s. Every A2 has a different cause and tick from its A1.
  - Repeat windows (`encores.ts` wave lists, as trigger, flags to, in at, in for): no two TVM-10 waves are identical. The nearest pair is the palm beach's first wave (x+6.5, to x+12, 2.2 s, 1.2 s) and the tarp beach's first (x+7, to x+12, 3.2 s, 2.6 s), with different timing and a different hazard over the strip. The only chained pair in TVM-10 is the palm beach's on-then-back. TVM-09's chained pairs (Hawa, Ashoka) are the deliberate ones named in FIX-1.md.
- **B4, oil:** at 844x390 the room's two slicks are clearly raised amber puddles (`qa2-10-room-oil-phone.png`), and in the FIX frame Dad slides off the amber pool into the kindi (`qa2-10-fix-kindi.png`). Nameable without zooming. TVM's ground flowers are `['#FFFFFF', '#F8BBD0']` (`look.ts`); no yellow is left (the only "yellow" in TVM code is the flag cloth and the kite's bill). The colour is render-only: TVM-01..08 frozen ticks are unchanged and the suite is green. The shore no longer has oil, so the wrong death line from round 1 cannot happen.
- **Polish:** the IceSlab comment is fixed.

## Still holds from round 1

Re-timed 03/05/06/07 routes judged human (unchanged in this round). The tour bite, seventh-death line, intros, `tvm-` prefixes, uniqueness and Malayalam are as in FAIL-1.md. The new line "The soaked sand gave way under your hop." is English-only, like the other cause lines.

## Re-test

After the fix: `probe5` at lag 0/6/12 and `probe6`. I need no calm-check death anywhere, no stretch over 25 s, and no replay over 8 s. Plus the full suite with the TVM excuse removed, and `LDD_N=80 npm run fair -- TVM`.

Not checked: real-device touch and audio.
