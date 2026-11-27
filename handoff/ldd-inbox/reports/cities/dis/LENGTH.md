# DIS length pass: report

Worktree `/local/home/saiposh/personal/ldd-wt/dis`, branch `city/dis`. Tip: see the last line. Nothing pushed, no version bump, no merge into develop.

## Summary

- **Met:** every length floor; two door endings re-betrayed (only 02 and 05 keep "locked until"); DIS-09 has a room-level FIX that dies to a different cause on a different tick; full test suite, typecheck, flows, fairness N=80.
- **Not met, measured below:**
  - Replay <= 8 s: 7 stages have stretches over 8 s (worst 13.6 s on DIS-07). All are waits inside a husori gate, a gamosa yard, the reel door or the last sandbar channel.
  - Same-tick FIX probe: 19 of the 27 NAIVE/FIX pairs die to the same cause. 18 of them die at different ticks; `dis09-chaal3` dies on the same tick.
  - Repeat windows: one added act is an exact copy of another act in the same stage (`dis08-kohora` = `dis08-jeep`).
- I tried moving the checkpoints and it did not help. Two extra hidden checkpoints in `dis09-bihu` left the worst replay unchanged (12.39 s and 11.83 s). The world restores the group to where it was when the checkpoint was passed, so the wait replays in full. A checkpoint past the gate is after the death point. The remaining lever is a shorter wait: faster singers and shorter yard stays. That cuts 05 (61.0 s, floor 60) and 09 (62.2 s, floor 60) below their floors, so the fix also needs new acts. Neither fit in the budget, and I reverted the checkpoint change.

## Clear time (scripted route, bot)

| Stage | Floor | First build | Before (05:30 BUILD.md, `8b7d8e2`) | After | Par |
| --- | --- | --- | --- | --- | --- |
| DIS-01 | 25-35 | 16.1 | 26.0 | 26.0 | 34 |
| DIS-02 | 25-45 | 22.4 | 26.2 | 26.2 | 36 |
| DIS-03 | 25-45 | 43.4 | 43.4 | 43.8 (new door) | 58 |
| DIS-04 | 25-45 | 23.5 | 25.3 | 25.3 | 34 |
| DIS-05 (HWIK) | >= 60 | 18.4 | 61.0 | 61.0 | 82 |
| DIS-06 | >= 60 | 18.4 | 60.5 | 60.5 | 82 |
| DIS-07 marathon | >= 120 | 86.4 | 138.1 | 126.5 (new door is shorter than the gate yard) | 170 (was 186) |
| DIS-08 (HWIK) | >= 60 | 29.8 | 66.3 | 66.3 | 90 |
| DIS-09 | >= 60 | 18.1 | 62.2 | 62.2 | 84 |
| DIS-10 finale | >= 90 | 58.2 | 98.4 | 98.4 | 133 |

Thin margins: 04 +0.3 s, 06 +0.5 s, 05 +1.0 s.

## Door endings

| Stage | Ending | Shape | Changed or why not |
| --- | --- | --- | --- |
| DIS-02 | `dis-hut-shut` | locked until (1 of the 2 allowed) | kept |
| DIS-03 | `dis-muga-reel` (reserve DIS-R2) | the door is reached by a moving lift that takes you away: a muga cocoon rides its reel up to the verandah door, waits, and is reeled in | changed from `dis-tea-chest` (locked until the plucker tips in). Route: ride up, step off at the top. Death: stay on, `dis-reel`@5321 |
| DIS-05 | `dis-gamosa-latch` | locked until (2 of 2) | kept |
| DIS-07 | `dis-uruka-net` (reserve DIS-R1, no thatch) | the floor to the door is pulled away: fishers haul the net across the pond in from its near end | changed from `dis-gamosa-door` (gate opens when the host is done). Route: cross at once. Death: stop on it, `dis-net`@15080 |

Neither reserve idea had been used anywhere in DIS before.

## Room-level FIX

- **DIS-09.** Built this pass: "climb the pavilion side" (A2). One-way steps go up the side to an upper eave over the oil. NAIVE: hop each rib, `dis-roof`@201. FIX: climb onto the eave, which is the gutter: a ball rolls down it onto you, `dis-gutter`@119. Answer (A3): stop on the pad, back up, run, one long leap. My first try, a finial on the ribs, broke the route and was reverted.
- **DIS-05.** No room-level FIX. The room is the gamosa welcome. The obvious play (walk through all the givers, the cloth hides your feet, `dis-gamosa`@247) has no obvious fix beyond what the stage teaches: give one back to a taker. Any "fix" that skips the givers is the answer itself. The stage's FIX deaths live in its added acts (`dis05-husori` fix, `dis-gamosa`@4968, a different cause from its NAIVE `dis-gate`@2430).
- **DIS-07 and DIS-10.** No room-level FIX: the marathon and the finale have their per-act FIX plays.

## Probe (b): NAIVE vs FIX, cause@tick

From `tests/zz-replay.test.ts -t "fix ticks"` (scratch, deleted after the run). The verdict "same cause" fails the probe.

| Stage | Act | NAIVE cause@tick | FIX cause@tick | Verdict |
| --- | --- | --- | --- | --- |
| DIS-01 | room | dis-spill@1153 | dis-spill@1406 | same cause |
| DIS-02 | room | dis-luit@237 | dis-luit@760 | same cause |
| DIS-03 | room | dis-basket@67 | dis-basket@94 | same cause |
| DIS-04 | room | dis-tawa@180 | dis-roll@476 | ok |
| DIS-05 | room | dis-gamosa@247 | - | no FIX (above) |
| DIS-05 | dis05-char | dis-luit@1362 | dis-luit@1910 | same cause |
| DIS-05 | dis05-husori | dis-gate@2430 | dis-gamosa@4968 | ok |
| DIS-05 | dis05-ghat | dis-spill@5414 | dis-spill@5688 | same cause |
| DIS-06 | room | dis-bank@402 | dis-bank@305 | same cause |
| DIS-06 | dis06-chang | dis-bank@1203 | dis-bank@1684 | same cause |
| DIS-06 | dis06-chapori3 | dis-luit@1963 | dis-luit@2514 | same cause |
| DIS-06 | dis06-ghat | dis-spill@3792 | dis-spill@4031 | same cause |
| DIS-06 | dis06-pitha | dis-tawa@5289 | dis-roll@5578 | ok |
| DIS-06 | dis06-chang2 | dis-bank@6103 | dis-bank@6200 | same cause |
| DIS-07 | room | dis-gate@277 | - | no FIX |
| DIS-07 | dis07-paar | dis-bank@4685 | dis-bank@4584 | same cause |
| DIS-07 | dis07-ghat | dis-spill@5075 | dis-spill@5314 | same cause |
| DIS-07 | dis07-lane | dis-gate@10500 | dis-gate@14589 | same cause |
| DIS-08 | room | dis-beel@109 | dis-gorh@433 | ok |
| DIS-08 | dis08-jeep | dis-beel@2818 | dis-gorh@3504 | ok |
| DIS-08 | dis08-bagori | dis-gorh@4390 | dis-gorh@5125 | same cause |
| DIS-08 | dis08-kohora | dis-beel@5792 | dis-gorh@6478 | ok (but see probe a) |
| DIS-09 | room | dis-roof@201 | dis-gutter@119 | ok |
| DIS-09 | dis09-bihu | dis-gate@834 | dis-gate@3284 | same cause |
| DIS-09 | dis09-chaal3 | dis-roof@6392 | dis-roof@6392 | **same tick and cause**: both plays die on the first slick before any rib, so the FIX is not a separate play |
| DIS-10 | room | dis-luit@237 | - | no FIX |
| DIS-10 | dis10-char | dis-luit@1662 | dis-luit@2199 | same cause |
| DIS-10 | dis10-gorh | dis-beel@4370 | dis-gorh@5056 | ok |
| DIS-10 | dis10-ghat | dis-spill@7766 | dis-spill@7992 | same cause |
| DIS-10 | dis10-chang | dis-bank@8759 | dis-bank@9240 | same cause |
| DIS-10 | dis10-gamosa | dis-gamosa@10107 | - | NAIVE only |

Other recorded deaths: DIS-01 deck `dis-spill`@2259, backswing `dis-spill`@1592; DIS-02 waits on the first bar `dis-luit`@486; DIS-03 wet path `dis-basket`@2625.

Most "same cause" pairs are cases where the FIX dies to a different part of the same thing. For example, ghat NAIVE dies to the tray's front and ghat FIX to its backswing, but both are recorded as `dis-spill`. A tester counting causes will fail these. Splitting the causes (for example `dis-spill` and `dis-backswing`) is only honest where the trap really differs. I have not done it.

## Probe (a): repeat windows

| Stage | Act | Windows | What changes per window | Verdict |
| --- | --- | --- | --- | --- |
| DIS-01 | second tea boy | 2 boys | the second comes from ahead, and the deck is the shelter instead of the ghat | changes the rule: ok |
| DIS-05 | dis05-char | 3 bars | a taker on bar 1 (land with one gamosa fewer), a giver on bar 3 | ok |
| DIS-05 | dis05-husori | 2 gates + yard | after gate 2, two givers before a pit | ok |
| DIS-06 | dis06-chang / dis06-chang2 | 2 stilt houses | the second has eaten slabs in front: wait, then run | ok |
| DIS-06 | dis06-char / dis06-chapori3 | 2 channels | the first starts with a slab run; the second has three marks, same answer per bar | the second channel's bars 2-3 repeat bar 1: momentum, at most one beat |
| DIS-06 | dis06-ghat | 1 boy | - | ok, but a second ghat in the city with the same answer |
| DIS-07 | dis07-lane | 3 gates | the last has the host's ritual | gates 1-2 identical: counts as one beat |
| DIS-07 | dis07-ghat | 1 boy | the shelter beat | same answer as 05/06/10 ghats |
| DIS-08 | dis08-jeep / dis08-bagori / dis08-kohora | 3 fields | bagori: the rhino comes from behind, ride the hay. **kohora: an exact copy of jeep** (`{ ...gorhJeep }`) | **kohora is padding** |
| DIS-09 | dis09-bihu | 3 gates | the middle one has the ritual | gates 1 and 3 identical: one beat |
| DIS-09 | dis09-chaal3 | 3 ribs | wider oil only | the same answer three times: momentum, one beat |
| DIS-10 | dis10-char, -gorh, -ghat, -chang, -gamosa | finale callbacks | each is a DIS idea in a new order; gamosa adds "clear two in one jump" | callbacks, allowed in the finale |

Cutting `dis08-kohora` takes DIS-08 from 66.3 s to about 59.5 s (its window is about 6.8 s), under the 60 s floor. It needs a new DIS betrayal in its place; not done in this budget.

## Probe: replay after a death

Method: branch off the scripted route every 0.25 s three ways (stop, run on, run and jump) for up to 5 s. When a branch dies, its replay is the route time from the respawn checkpoint to the branch point. Columns: checkpoint pass times (s) and stretch count; worst replay; stretches over 8 s (branch@time:cause).

| Stage | Checkpoints passed (s) | Stretches | Worst replay | Over 8 s |
| --- | --- | --- | --- | --- |
| DIS-01 | 2.9 5.5 6.5 16.1 24.6 | 6 | 8.5 | s3 6.5-16.1 (8.5, jump@15.0 dis-spill) |
| DIS-02 | 7.1 9.3 14.8 15.0 21.9 | 6 | 6.3 | - |
| DIS-03 | 7.4 15.7 16.7 23.4 29.7 32.6 | 7 | 10.9 | s6 32.6-43.8 (10.9, stop@43.5 dis-reel: the reel's wait) |
| DIS-04 | 6.8 7.3 13.8 13.9 19.5 | 6 | 6.5 | - |
| DIS-05 | 3.6 5.7 7.7 9.5 9.6 17.9 18.0 19.9 28.3 29.2 42.5 42.6 52.2 54.1 55.9 58.7 | 17 | 12.1 | s10 29.2-42.5 (12.1, gamosa yard); s12 42.6-52.2 (8.7) |
| DIS-06 | (run not finished in budget) | | | |
| DIS-07 | 2.0 9.1 10.7 11.4 21.0 21.9 36.2 36.3 39.8 39.9 48.9 50.5 51.0 59.2 59.9 73.4 74.3 85.1 85.2 87.2 94.6 96.7 108.3 110.3 123.9 | 26 | 13.6 | s6 21.9-36.2 (13.6), s15 59.9-73.4 (12.1), s17 74.3-85.1 (10.2), s22 96.7-108.3 (11.3), s24 110.3-123.9 (12.7); all husori gate waits |
| DIS-08 | 7.8 13.4 20.1 22.8 30.0 34.5 34.6 47.6 54.8 59.2 | 11 | 6.7 | - (the rhino waits are under 8 s) |
| DIS-09 | 4.6 4.7 6.6 14.3 16.1 29.4 31.4 44.1 45.6 47.4 49.8 51.3 54.4 55.8 59.0 | 16 | 12.4 | s5 16.1-29.4 (12.4), s7 31.4-44.1 (11.8); husori gates |
| DIS-10 | 7.1 7.6 12.6 13.1 20.7 20.8 28.5 35.8 43.0 47.4 47.8 50.4 62.2 62.4 71.3 71.5 78.2 78.3 81.6 81.8 85.0 | 22 | 12.8 | s12 50.4-62.2 (10.6, gate), s21 85.0-98.4 (12.8, the plucker's path to the far-bank post) |

Why moving checkpoints does not help here: the respawn replays the world from the tick the checkpoint was passed, so the singers come back mid-wait and the full wait replays. A checkpoint past the gate is past the death. Only a shorter wait fixes it, and that costs length (see Summary).

## Fairness `LDD_N=80 npm run fair -- DIS`

Run at `1574efe`. The gameplay is identical at the tip: since then only DIS-07's par, docs and a code comment changed. Full output is in `fair-N80.txt`.

```
DIS-01: 6t 100%  12t 100%  18t 100%   stretches s0-s4, door 100%
DIS-02: 6t 100%  12t 100%  18t 84%    stretches s0-s4, door 100%
DIS-03: 6t 100%  12t 100%  18t 100%   stretches s0-s5, door 100%
DIS-04: 6t 100%  12t 100%  18t 100%   stretches s0-s4, door 100%
DIS-05: 6t 100%  12t 100%  18t 76%    stretches s0-s15, door 100%
DIS-06: 6t 100%  12t 100%  18t 80%    stretches s0-s17, door 100%
DIS-07: 6t 100%  12t 100%  18t 80%    stretches s0-s24, door 100%
DIS-08: 6t 100%  12t 100%  18t 100%   stretches s0-s9, door 100%
DIS-09: 6t 100%  12t 100%  18t 100%   stretches s0-s14, door 100%
DIS-10: 6t 100%  12t 100%  18t 80%    stretches s0-s20, door 100%
```

## Other proofs

- `npm run typecheck`: clean.
- `npm test` (full): 18 files passed, 12 skipped; 1616 tests passed, 12 skipped. DIS is on no allow-list.
- `tests/modules.test.ts -t DIS`: 11 passed. `tests/allocation.test.ts`: 10 passed.
- `npm run build:single && node scripts/flows.mjs`: "no errors".
- Shot sheets, all ten read after the door and 09 changes: `shots/DIS-01-sheet.png` .. `DIS-10-sheet.png`.

## Still short, or deviating (in order of what a tester will fail first)

1. Replay over 8 s in 01, 03, 05, 07, 09 and 10 (table above). 06 was not measured.
2. NAIVE and FIX share a cause in 19 of 27 pairs; `dis09-chaal3` dies on the same tick.
3. `dis08-kohora` copies `dis08-jeep`.
4. Pass-1 acts reuse DIS ideas across stages (the ghat four times, husori gates in 05, 07, 09 and 10).
5. The added acts have no intro lines or hidden items of their own.

Tip: `6e96ad7` on `city/dis` (gameplay identical to `81449bf`; that commit changed only a code comment).
