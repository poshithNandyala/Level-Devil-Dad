# PAT fix round 7: lag-captured calm for every checkpoint

Branch `city/pat`, tip `ae7a0a027dcb8d120f48303920f5034147dbf4d9`. No new commits on `origin/develop` since 4c38bcb. No shared file touched (PAT is already off `CPSAFE3_PENDING`). No push, no version bump.

## The three fixes (old -> new)

| Finding | Old | New | Nearest hazard now |
| --- | --- | --- | --- |
| F6-1 PAT-02 cp3 x90.0 (idle `pat-angara` at lag 12) and cp4 x117.5 (idle `pat-doosra`) | `pat02-bhatti` checkpoint 22 (x90), between the two moving litti. The route's wait for a strike window shifts a lagged capture by a whole 2.6 s cycle, so the first litti's poker could be 4 tiles nearer than at lag 0. The litti also kept rolling past the end of the bed into the door area, so its strike reached the door checkpoint | checkpoint 43 (x111), past the end of the bed (x108); and the cook now lifts each litti, and its poker, off the bed at the bed's end (a marker whose centre is at or past the last column neither strikes nor is drawn). The route, the strike phases and the beat are unchanged | nothing: no marker exists past x108; the pestles of the door are 9+ tiles from x111 and from the door checkpoint x117.5 |
| F6-2 PAT-06 cp5 x112.0 (run `pat-jod` at lag 11/12) | `pat06-nau` checkpoints 14 and 36 (x90, x112); x112 is the tarp of plate 6 itself, and a lagged capture put Dad on the gap | checkpoints 13 and 39.5 (x89, x115.5) | cp x89: next tarp (plate 3) at x94-95, 5 tiles; cp x115.5: no tarp ahead (plates 7 and 8 are real; the nearest gap is 2.5 tiles ahead but it is covered by a solid plate) |
| F6-3 PAT-09 wapsi late-follow replay 8.33 / 8.38 / 8.43 s | the play waited until the horse had moved 26 tiles (7.5 s), then ran into the wall | the same play now waits until the horse has moved 9 tiles (2.1 s, `pat9d.x0 + 150`): the walls close at the lane mouth as soon as the horse is a gap's length ahead, so the late follower dies at once. It is the test script that changed, not the lane, the horse or any checkpoint | replay 3.52 / 3.57 / 3.61 s |

No trap, hump, truck, rider or beat was weakened or moved. The one gameplay-adjacent change is that a litti no longer rolls on past the end of its bed (nothing could be reached there).

## The lag-captured sweep (the tester's method, `qa6.test.ts` copied to a scratch file)

For every stage: the route (the human-timing player) at lag 0, 6, 11 and 12 and idle starts 0, 37, 120 and 251 ticks (the spawn-idle sweep); the checkpoint is taken wherever that lagged run takes it; the world is rebuilt by `replay()` at that tick; then idle 4 s, run 0.3 s after 0/6/12 ticks, tap-jump after 0/6/12 ticks (7 plays). Replay per tick from the last checkpoint to the death of every NAIVE, FIX and MISTAKE, at lag 0/6/12.

| Stage | Distinct capture points | Plays checked | Deaths | Longest stretch | Worst replay (lag 0 / 6 / 12) |
| --- | --- | --- | --- | --- | --- |
| PAT-01 | 5 | 560 | 0 | 7.4 s | 5.58 / 5.65 / 5.72 s |
| PAT-02 | 5 | 560 | 0 | 10.8 s | 6.96 / 7.01 / 7.06 s |
| PAT-03 | 4 | 448 | 0 | 10.4 s | 6.92 / 6.92 / 6.93 s |
| PAT-04 | 4 | 448 | 0 | 12.8 s | 7.11 / 7.18 / **7.26** s |
| PAT-05 | 6 | 672 | 0 | 17.2 s | 6.85 / 6.85 / 6.85 s |
| PAT-06 | 14 | 1568 | 0 | 15.1 s | 4.16 / 4.11 / 4.22 s |
| PAT-07 | 19 | 2128 | 0 | 11.7 s | 6.98 / 6.98 / 6.98 s |
| PAT-08 | 3 | 336 | 0 | 4.6 s | 1.97 / 2.02 / 2.07 s |
| PAT-09 | 9 | 1008 | 0 | 23.2 s | 3.52 / 3.57 / 3.61 s |
| PAT-10 | 15 | 1680 | 0 | 11.6 s | 6.92 / 6.92 / 6.92 s |

**0 deaths in 9,408 plays; worst replay in the city 7.26 s (PAT-04 "wait for two porters then climb", lag 12), under 7.5 s.** The baseline run of the same probe on 67fdc2b reproduced the tester's results exactly (8 deaths on PAT-02, 24 on PAT-06, 8.43 s on PAT-09) before the fixes.
Per-play rows (lag 0/6/12): `/tmp/qa6_final.txt` has them; PAT-02 m1 now 6.79 / 6.80 / 0.91 (at lag 12 the capture falls later, replay shorter).

## Frozen diff

PAT has no `tests/cities/_frozen/pat.json` (Patna is a new module, not frozen), so nothing was refrozen. The diff of this round is three files: `s02.ts` (checkpoint 22 -> 43; litti vanish at the bed's end), `s06.ts` (`pat06-nau` cps 14, 36 -> 13, 39.5), `tests/cities/pat.ts` (the late-follow wait 420 -> 150).

## Checks

- `tsc --noEmit`: clean.
- Full `npm test`: **18 files passed, 1602 tests passed**, 0 failed (13 env-gated skipped; PAT is on no allow-list). `cpsafe` PAT: all ten stages pass.
- `npm run build:single`, `node scripts/flows.mjs`: **no errors**.
- Fairness `LDD_N=80 npm run fair -- PAT`:

```
PAT-01: 6t 100%  12t 100%  18t 80%
PAT-02: 6t 100%  12t 100%  18t 100%
PAT-03: 6t 100%  12t 100%  18t 76%
PAT-04: 6t 100%  12t 100%  18t 100%
PAT-05: 6t 100%  12t 100%  18t 100%
PAT-06: 6t 100%  12t 100%  18t 100%
PAT-07: 6t 100%  12t 100%  18t 100%
PAT-08: 6t 100%  12t 100%  18t 76%
PAT-09: 6t 100%  12t 96%  18t 95%   (turnstile, as before)
PAT-10: 6t 100%  12t 100%  18t 100%
```

- Sheet re-shot and read for the stage whose art changed: `/local/home/saiposh/personal/ldd-inbox/reports/cities/pat/shots/PAT-02-sheet.png` (bhatti with two litti; no strike past the bed). PAT-06 and PAT-09 changed only a checkpoint and a test script, so their sheets are unchanged.
- The tester's note on the CHOWK halts (draw a signal and cross traffic) is not done; it is a note, not a finding, and I left the art as it is.

## Not done

Nothing else changed. The sweep used the tester's player model; any other lag model is not covered.
