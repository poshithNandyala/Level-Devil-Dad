# DIS fix round 3: the 04 batah hop-mash

Branch `city/dis` in `/local/home/saiposh/personal/ldd-wt/dis`. Base dfc3702; tip **`383f6c2`**. No push, no version bump, no shared file touched. Clock: 09:41-09:48 UTC. Outputs and the trace probe are in `reports/cities/dis/fix3/`.

## Honest section

- **What changed:** the second well in 04 `dis04-batah` (dark, fallen in) moves one column further on, from cols x+12..13 to x+13..14. Nothing else in the act moves. The checkpoint stays at x+1.5, the lit well and the through well stay at x+7 and x+17, and the lantern, dust and back wall are unchanged.
- **The new cause:** QA's "hop every 0.3 s" now comes down inside the fallen well at lag 0, 6 and 12 and dies to its own cause, `dis-garh-hop`. Walking into that well (the act's FIX) stays `dis-garh`.
- **The decision is unchanged.** Read the wells: the lit one is flooded, and of the dark ones only the well the flame streams toward goes through. The flame stands straight over the moved well, because it is now 4 tiles from the through well's centre and the lean only reaches 3.
- **The route** hops the fallen well from x+12.2 (was x+11.2). Its time is unchanged at 11.2 s.
- **Still open:** nothing in 04 that I found. I did not rerun the full-city sweep, because no checkpoint moved; I did run the 04 sweep for the pairing table.

## Layout: the mash's landing x per lag (QA's play, traced with `fix3/zz-mash.test.ts`)

x is in tiles from the act's x. T means take-off, L means landing. The hop at x+6.9 lands at x+10.25 and bounces straight back up, because the jump is still held.

| Layout | lag 0 | lag 6 | lag 12 | Result |
| --- | --- | --- | --- | --- |
| Before (wells at 7, 12, 17) | T-3.56 L5.56 T6.94 → bounce 10.25 → L13.88 T14.81 → 18.1, falls into well 3 (through) → warp | L5.44 T6.81 → L13.81 T14.69 → well 3 | L5.38 T6.75 → L13.81 T14.63 → well 3 | **won** at all three lags: the x+13.8 landing was on the lip past the fallen well |
| **Chosen: wells at 7, 13, 17** (layout 1 of 3; the first one tried killed at all three lags, so I stopped there) | L5.56 T6.94 → bounce 10.25 → comes down at x+14.0 inside the fallen well (x+13..15) | L5.44 T6.81 → x+13.88 | L5.38 T6.75 → x+13.88 | **dies `dis-garh-hop`@791 / 797 / 803** |

## The new cause and its line

| Cause | Line (what happened / how to beat it) |
| --- | --- |
| `dis-garh-hop` (new) | Garh! You hopped on without reading the wells, and came down in the one that has fallen in. / Stop at each well and look: the lit one is flooded, and of the two dark ones only the well your lantern’s flame streams toward goes through. Go down that one. |

The well's cause comes from how Dad got in. If he left the ground going up (a hop or a jump) and has not landed since, it is `dis-garh-hop`. If he walked off the edge, it is `dis-garh`.

## Probes and proofs (04, one at a time, in the foreground)

| Check | Result | File |
| --- | --- | --- |
| Generic probe, 04: six plays × lag 0/6/12 | walk on, short hop, long jump, wait-then-walk → `dis-kup`@711/718/725 (x+8.2, the lit well); **hop every 0.3 s → `dis-garh-hop`@791/797/803 (x+13.9-14.0)**; back off → `dis-doba` (the room's vault). No play wins, and every line names what happened there | `fix3/generic-04.txt` |
| Pairing (pairs2.py, 04) | room `dis-talatal`@314/338/374 against `dis-doba`@478/496/526; **batah NAIVE `dis-kup`@711/730/761 against FIX `dis-garh`@794/812/843**. Two causes at two ticks at every lag; 0 not meeting the bar | `fix3/pairs-04.md` |
| Lag-captured sweep, 04 (for the pairing) | 224 plays at 2 capture points, 0 fails; longest stretch 7.9 s; worst replay 4.38 s | `fix3/sweep-04.txt` |
| cpsafe strict, DIS-04 | passed | `fix3/cpsafe-04.txt` |
| Fair, LDD_N=80, DIS-04 | 6t 100%, 12t 100%, 18t 100%; stretches s0-s2 and the door 100% | `fix3/fair80-04.txt` |
| tsc | clean | |
| Full suite | 18 files passed, 13 skipped; **1801 passed**, 20 skipped, 0 failed | `fix3/suite.txt` |

The NAIVE (walk on into the lit well), the FIX (hop the lit well, walk into the first dark one) and the hop-mash die to three different causes on three different ticks.

## Commits

- `383f6c2`: DIS-04 batah, the fallen well moved one column on, `dis-garh-hop`, and the route's hop.

## Diff (dfc3702..383f6c2)

- `src/game/cities/dis/batah.ts`: `WELLS` 12 → 13, and the fallen well's cause by entry.
- `src/game/cities/dis/causes.ts`: `dis-garh-hop`.
- `tests/cities/dis.ts`: the route hops the fallen well from x+12.2.

3 files, +15 −3.
