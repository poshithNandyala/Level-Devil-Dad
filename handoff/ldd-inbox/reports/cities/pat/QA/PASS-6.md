# PAT · Patna: checkpoint fix, round 7 re-check: PASS

**Tested:** `city/pat` at **ae7a0a0** (ae7a0a027dcb8d120f48303920f5034147dbf4d9), merged locally with develop **d398868** (v0.17.1) in my detached worktree `/local/home/saiposh/personal/ldd-wt/qa-pat`. The merge result is local commit f2fc212, never pushed. Nothing was committed to `city/pat` or pushed. Round 6 is in `QA/FAIL-6.md`.

**Probe:** my `tests/qa/qa6.test.ts` (untracked scratch), with the same settings as round 6, over all ten stages.
- The route is played with `fair.test.ts`'s `lagged()` human-timing player at **lag 0, 6, 11 and 12**, with **idle starts 0, 37, 120 and 251**.
- At every checkpoint actually taken, the world is rebuilt with `replay()` and `vx = 0`, then seven 4 s plays are run: idle, run 0.3 s after 0/6/12 ticks, and tap-jump after 0/6/12 ticks.
- Replay per tick is measured from the last checkpoint taken to the death, for every NAIVE, FIX and MISTAKE at lag 0, 6 and 12.

## Sweep: 0 deaths in 9,408 plays

| Stage | Capture points | Plays | Deaths | Longest stretch | Worst replay (s, worst play at lag 0/6/12) |
| --- | --- | --- | --- | --- | --- |
| PAT-01 | 5 | 560 | 0 | 7.4 s | 5.72 (fix 5.58/5.65/5.72) |
| PAT-02 | 5 | 560 | 0 | 10.8 s | 7.06 (fix 6.96/7.01/7.06) |
| PAT-03 | 4 | 448 | 0 | 10.4 s | 6.93 (m0 6.92/6.92/6.93) |
| PAT-04 | 4 | 448 | 0 | 12.8 s | **7.26** (m1 7.11/7.18/7.26) |
| PAT-05 | 6 | 672 | 0 | 17.2 s | 6.85 (fix 6.85/6.85/6.85) |
| PAT-06 | 14 | 1568 | 0 | 15.1 s | 4.22 (m3 4.16/4.11/4.22) |
| PAT-07 | 19 | 2128 | 0 | 11.7 s | 6.98 (m0 6.98/6.98/6.98) |
| PAT-08 | 3 | 336 | 0 | 4.6 s | 2.07 (m0 1.97/2.02/2.07) |
| PAT-09 | 9 | 1008 | 0 | **23.2 s** | 3.61 (m1 3.52/3.57/3.61) |
| PAT-10 | 15 | 1680 | 0 | 11.6 s | 6.92 (m1 6.92/6.92/6.92) |

The worst replay anywhere is 7.26 s (PAT-04, lag 12), under 7.5 s. The longest stretch is 23.2 s (PAT-09), under 25 s. These numbers match FIX-7's claims.

## Round-6 findings

- **F6-1 (PAT-02 cp3 x90 and cp4 x117.5, idle dies at lag 12): CLOSED.**
  - The `bhatti` checkpoint is now at x111, past the bed's end at x108.
  - At every lag, 0 to 12, and every idle start, idle, run and tap-jump from all five PAT-02 capture points survive. Round 6 had 8 deaths at those two checkpoints.
- **F6-2 (PAT-06 cp5 x112, run 0.3 s dies at lag 11/12): CLOSED.**
  - The `nau` checkpoints are now at x89 and x115.5.
  - All 1568 PAT-06 plays survive. Round 6 had 6 deaths at cp5.
- **F6-3 (PAT-09 wapsi late-follow replay 8.33-8.43 s): CLOSED.**
  - The play now waits until the horse is 150 px along instead of 420 px. It still dies to `pat-bheed` at the same column, x161.6, and its replay is now **3.52 / 3.57 / 3.61 s**.
  - Only the test script changed. The lane, the horse and the checkpoints are as before.
  - I accept this. The death tick moved from 46.6 to 41.8 s and the death column is the same, so the 4.8 s difference was the old play's own extra standing still. That idle time is chosen by the player; it is not replay the game forces on them. A prompt late follower is put back at the trap within 3.6 s.

## Diff check (67fdc2b..ae7a0a0)

Three files changed (+6 / -4), and nothing else:
- `s02.ts`:
  - `bhatti` cps changed from 22 to 43.
  - In `markerBed`, the strike's `live()` now also requires the litti's centre to be inside the bed (`r.x + r.w / 2 < c.X(len)`).
  - Its `paint` returns early past the bed's end, with a comment ("the cook lifts the litti off at the end of the bed, and the poker with it").
- `s06.ts`: the `nau` cps changed from [14, 36] to [13, 39.5].
- `tests/cities/pat.ts`: the wapsi late-follow wait changed from `x0 + 420` to `x0 + 150`.

No shared file, strike phase, beat, route or other gameplay line changed.

## The bed-end lift (judgement)

- **What changed:** the litti and its poker stop at x108, the end of the bhatti bed. Before, a litti that rolled past the bed kept striking: at x117 it killed Dad at the door checkpoint (F6-1).
- **NAIVE, FIX and MISTAKE plays:** none of their death ticks moved. My cause-and-tick probe diffs as identical on every stage against round 6, except the wapsi test play above.
  - PAT-02 NAIVE: `pat-angara` @1.1 s.
  - FIX: `pat-chimta` @7.0 s.
  - bhatti "stand in the first litti's path": `pat-angara` @16.7 s.
  - "past the first, then run on past the second": `pat-doosra` @20.7 s.
  - "run on into the second bed": `pat-angara` @10.0 s.
- **Does it weaken the act?** No. The only places that became safe are past the bed's end, which is the approach to the door. Being struck there was never one of the act's decisions; it was the bug. The act's decisions are unchanged: wait behind each litti, then pass. The only measurable effect is that PAT-02 at relaxed lag (0-18 ticks) rose from 83% to 100%, because the off-bed strike no longer catches slow players near the door. At 6t and 12t it is 100%, as before.

## Regressions

- **`npm test`** (with develop d398868 merged): 18 files, **1640 passed, 0 failed**. The builder's 1602 was before TVM's tests came in with the merge. PAT is on no allow-list and `CPSAFE3_PENDING` is `[]`, so the shared three-play cpsafe runs strict on PAT and passes.
- **`npm run build:single && node scripts/flows.mjs`:** `no errors`.
- **`LDD_N=80 npm run fair -- PAT`:** every stage is 100% at 6t and 12t except PAT-09 at 96% at 12t. Every stretch is 100% except PAT-09's door at 96%. All of them clear the 90/95 bars.
- **Round-6 passes still hold:**
  - The diff cannot reach the tempo stages (07, 10), and both are again clean in the sweep.
  - Every NAIVE, FIX and MISTAKE dies to its own cause at the same tick as in round 6.
  - Round-6 notes carry over unchanged: the PAT-03 bell and PAT-04 third-porter retimes (disclosed in FIX-6, causes unchanged), and the route times 07 148.8 s, 04 33.2 s and 10 100.4 s.

## Note (unchanged from round 6)
The three CHOWK halts on PAT-07 stay a note. The sign gives each 4.1 s stop a reason in the city, but nothing moves during it, so I recommend a signal head that turns green and a cycle-rickshaw crossing. The halts cannot be shorter while the checkpoint sits 2.3 tiles before the stop.

## Not checked
Touch on a phone, and audio. I made no new frames: no art changed except that the litti now disappears at the bed's end.
