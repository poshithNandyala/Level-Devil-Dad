# PAT fix 6: checkpoints for the three-play cpsafe

Branch `city/pat`, worktree `ldd-wt/pat`. `origin/develop` 4c38bcb merged with `git merge` (no rebase). Shared edit: `tests/cpsafe.test.ts`, `CPSAFE3_PENDING` is now `[]` (PAT removed). Nothing else shared was touched. No push, no version bump. Tip sha: see the work_report summary (the commit follows this file's write; `git log -1` on `city/pat`).

## cpsafe

`npx vitest run tests/cpsafe.test.ts -t PAT`: **Test Files 1 passed, Tests 10 passed (120 skipped)**. All ten PAT stages pass idle 4 s, run 0.3 s, tap-jump, at lag 0/6/12, strict.

## The checkpoints (old -> new, and the play that died)

How the tempo stages work: the tempo carries Dad while he stands, so idle 4 s is 20 tiles of ride. A checkpoint is calm only if no hump or arch is within four seconds of travel (found by scanning every column of the route with the 7 plays), or if it sits in a long halt. I added three long halts ("CHOWK", the light is red, `hold` 500 ticks, no passenger change) with the checkpoint 2.3 tiles before the stop, so that 4 s of standing is inside the halt. No trap, hump, arch, truck or rider was moved or weakened.

| Stage | Old checkpoint (play that died) | Now |
| --- | --- | --- |
| PAT-01 | cp4 x90.0 (idle, run, tap-jump all: `pat-tempo` x92.9-94.8) | dropped; cps 20, 36, 50, 59, 101 (101 is past the tempo). Longest stretch 7.2 s |
| PAT-02 | cp3 x86.0 (idle: `pat-angara` x85.7) | x90 (`pat02-bhatti` cps 18 -> 22) |
| PAT-03 | cp2 x101.5 (tap-jump: `pat-ghanti` x101.7) | ending `space` 26 -> 34: the first bell is now 14 tiles after the checkpoint, not 6. Added cp x71.5 on the plain first hoarding of `pat03-patti` (replay) and bells 1.8, 4.4, 6.8 s (was 7.4) |
| PAT-04 | cp0 x32.5 (tap-jump: `pat-bojh` x35.6) | the second Golghar flight starts 5 tiles after the act start (porters trigger 5.5 tiles from the checkpoint); third porter emerges at 5.0 s (was 6.2) |
| PAT-07 | cp0 x32.5 sadak start (idle `pat-dhakka` x45.6; tap-jump x49.1) | dropped; wait CHOWK at x40, cp x37.7 |
| PAT-07 | cp1 x52.0 (idle, run, tap-jump: `pat-dhakka` x63.6-66.9) | wait CHOWK at x56, cp x53.7 |
| PAT-07 | (cp2 x77, passed) | the stop at x78 is held 500 ticks, cp x75.7 |
| PAT-07 | cp6 x220.0 haat (run, tap-jump: `pat-dhakka` x228-229) | x210 |
| PAT-07 | cp8 x257.0 haat (idle: `pat-dhakka` x265.8) | x244 |
| PAT-07 | cp10 x300.0 mandi (idle x308.6, tap-jump x312.1) | x292 |
| PAT-07 | cp11 x348.0 mandi (run, tap-jump: `pat-torana` x356-357) | x324 and x341, and the stop at x368 held 500 ticks, cp x365.7 |
| PAT-07 | cp12 x378.5 adda start (idle `pat-dhakka` x389.6, run x392.2) | dropped; wait CHOWK at x382, cp x379.7 |
| PAT-07 | cp13 x386.0 adda (run, tap-jump: `pat-dhakka` x390-391) | x394 |
| PAT-07 | cp14 x408.0 adda (run, tap-jump: `pat-torana` x416-417) | x424 |
| PAT-07 | (pul, passed) | added x124 and x162 for replay |
| PAT-10 | cp6 x240.5 sidhi start (tap-jump: `pat-bojh` x243.6) | the flight starts 8 tiles after the act start |
| PAT-10 | cp9 x312.0 tempo act (idle `pat-dhakka`, run/tap-jump `pat-torana`) | tempo cps 12, 29, 52 = x286, x303, x326 |

The brief named 15 failing checkpoints for these stages; all are in the table.

Side effects, no decisions changed: PAT-07 is **148.8 s** (was 130.8 s: three 4.1 s waits, inside the bible's 2-3 min), the sadak and adda act-start checkpoints no longer exist (a 7th death in those acts goes back to the previous act start), PAT-04 route about 38 s, PAT-03 28.8 s. Fixed on the way: PAT-04's door was at 89% at lag 6 after the shift (the route reached the door leaf at the edge of its window); the route's wait at the stair foot moved 8.0 -> 8.2 s, now 100%.

## Replay from the last checkpoint to each death (per tick, lag 0 / 6 / 12, the input stream delayed by the lag)

Longest stretches between checkpoints: PAT-07 11.3 s, PAT-10 11.5 s (all < 25 s). Every NAIVE, FIX and mistake play of 01, 02, 03, 04, 07, 10:

| Play | lag 0 / 6 / 12 (s) |
| --- | --- |
| PAT-01 naive / fix | 1.88 / 1.88 / 1.88; 5.58 / 5.58 / 5.58 |
| PAT-02 naive, fix | 1.08 / 1.13 / 1.18; **6.96 / 7.01 / 7.06** |
| PAT-02 stand in litti's path, past first then run on, run on | 2.77; 1.52; 0.73 (lag adds nothing) |
| PAT-03 naive, fix | 2.02 / 2.07 / 2.12; 4.47 / 4.53 / 4.58 |
| PAT-03 left part of third hoarding, right end of second | **6.92** / 6.92 / 6.92; 1.93 |
| PAT-04 naive, fix, climb behind first | 1.11 / 1.15 / 1.18; 4.41 / 4.41 / 4.44; 1.72 |
| PAT-04 wait for two porters then climb | **7.11** / 7.11 / 7.11 |
| PAT-07 naive, fix | 6.18; 6.00 |
| PAT-07 mistakes m0..m6 | **6.98**, 4.41, 0.78, 5.48, 5.10, 6.50, 1.97 |
| PAT-10 naive, fix, run on hoardings | 1.52 / 1.57 / 1.62; 1.52; 0.92 |
| PAT-10 right end of hoarding, middle, road side | **6.92**; 6.08; 4.68 |
| PAT-10 bori run on / slide, gaadi run on / second truck | 1.24; 6.08; 1.82; 4.05 |

Worst: **7.11 s** (PAT-04), under 7.5 s at every lag. PAT-05, 06, 08, 09 were not changed; their cpsafe results are green and their replays are as in rounds 3-5 (worst 7.6 s on the removed round-3 act is gone; PAT-05 now has no act past bori).

## Checks

- `tsc --noEmit`: clean.
- Full `npm test` (PAT on no allow-list, off CPSAFE3_PENDING): **18 files passed, 1602 tests passed**, 0 failed (12 env-gated skipped).
- `npm run build:single`, `node scripts/flows.mjs`: **no errors**.
- Fairness `LDD_N=80 npm run fair -- PAT` (all stages >= 90% at 6t and 12t; PAT-09's door 96% is the lowest stretch):

```
PAT-01: 6t 100%  12t 100%  18t 80%
PAT-02: 6t 100%  12t 100%  18t 83%
PAT-03: 6t 100%  12t 100%  18t 76%
PAT-04: 6t 100%  12t 100%  18t 100%
PAT-05: 6t 100%  12t 100%  18t 100%
PAT-06: 6t 100%  12t 100%  18t 100%
PAT-07: 6t 100%  12t 100%  18t 100%
PAT-08: 6t 100%  12t 100%  18t 76%
PAT-09: 6t 100%  12t 96%  18t 95%   (died: pat-charkhi, the turnstile, as before)
PAT-10: 6t 100%  12t 100%  18t 100%
```

- Sheets re-recorded and read for the changed stages: `/local/home/saiposh/personal/ldd-inbox/reports/cities/pat/shots/PAT-03-sheet.png`, `PAT-04-sheet.png`, `PAT-07-sheet.png` (read: the CHOWK signs and the tempo in its waits), `PAT-10-sheet.png`.
- `docs/cities/PAT.md` has a new section "Checkpoint fix".

## Not done / risk

- The replay probe is mine (the scripted death plays with the input stream delayed by 0/6/12 ticks), not the tester's. The nearest margin is 0.39 s (PAT-04).
- `tests/dbg2.test.ts` came from develop and is untouched.
- PAT-07's long waits are the cost of the 4 s idle rule on a stage that carries Dad; if the tester wants fewer, the only other way is to move beats, which I did not do.
