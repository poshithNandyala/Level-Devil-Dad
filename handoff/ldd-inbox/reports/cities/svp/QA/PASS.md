# SVP QA round 3: PASS

Tester: the same independent QA chat as rounds 1 and 2 (FAIL.md, FAIL-2.md are the earlier records). Subject `city/svp` at `3e6d9eb5c99385fcc09560c75de77e83ff8956fc`.
Worktree `/local/home/saiposh/personal/ldd-wt/qa-svp`, detached at that tip; scratch tests only, nothing committed or pushed. Clock 07:47-07:53 UTC.
Raw outputs: `QA/r3/`.

## Pre-rulings (binding, as given)

Honest floors are final: 05 25.6, 06 19.1, 07 30.4, 09 21.4, 10 50.6; 08 86.8 is met; 01-04 are as before. 05/06/07/09 have plain doors. pul has ONE TRAP.
SVP-01's 7.76 s replay is exempt. 06 at 18t (80%) is parked. The F490 and F491 refusals stand. teesra is cut with no replacement.

## 1. F1-F5 (my own plays; cause@tick at lag 0 / 6 / 12, lagged model from `r3/sweep-lag-captured.txt`)

| Finding | Check | Result |
|---|---|---|
| F1 doors 05/06/07/09 | `doors.ts`: each is `plain(advice)` with `build() {}`, so it has no hazard, no tell and no death. No `doorDeath` remains in `tests/cities/svp.ts`. The advice says "just a door. Walk in." The probe table shows no scripted death for the four, and the fair runs score the door stretch 100% on each. | **plain doors, ok** |
| F2 pul | one creek (w 30, the second creek and its cellar deleted). Its one trap is the grey root: `svp-grey`@818/823/848. Stage pair: NAIVE `svp-eent`@138/144/150 vs FIX `svp-nali`@1182/1190/1197, a different cause and tick. Nothing in 09 scripts brick-walking except the room's own NAIVE. | **ok** |
| F3 dekho cut | 05 is room, ooncha, choona and the door. ooncha: `svp-nazar`@772/796/820 vs `svp-nazar2`@705/729/753. choona (wall 2 = the labelled momentum beat): `svp-chuna`@1322/1357/1422 vs `svp-chuna2`@2295/2349/2441. Stage: nazar@190 vs chuna@1322. | **ok** |
| F4 saman cut | `samanFin` and `lashedHall` are gone; the finale is the mill, nadi, jad, nali, ghat and the gate. | **ok** (law 7 below) |
| F5 magar4 | Line 1: "The water was still at the last gap, but a crocodile that lies still shows only its eyes, and you jumped over the one that was there." Line 2: "No ripples does not mean no crocodile. Look along the water for two yellow eyes... wait until it has swum off before you jump." Line 1 names what killed the player and line 2 gives the wait, without repeating the board or ripples advice. Dies `svp-magar4`@2712/2736/2758. `shots6/SVP-10-still-croc.png` at sheet scale (about a landscape phone): the dark ridged back with two yellow dots by the last log reads as a crocodile lying in the water, with no arrow, glow or label. | **ok** |

### Finale, law 7 (each callback breaks its stage's rule; two plays each, at lag 0 / 6 / 12)

| Part | Stage rule it calls back | The break | Plays |
|---|---|---|---|
| mill (room) | 02: the boarding end stays | the saw takes the boarding end first; the far end stays (and 04's herd is on the log) | `svp-hiran4`@689/695/701; `svp-kichad`@726/735/745 |
| `svp10-nadi` | 03: the honest arrow tracks the crocodile | the board is stale: read the ripples; and a still crocodile makes none | `svp-magar3`@1273/1287/1303; `svp-magar4`@2712/2736/2758 |
| `svp10-jad` | 09: green holds, brick and grey go | green roots rot and go; grey holds | `svp-eent3`@3405/3435/3463; `svp-eent4`@3666/3696/3723 |
| `svp10-nali` | 09: over an arch is free | fed the other way: under is free | `svp-nali`@4191/4220/4254; `svp-nali2`@4602/4632/4665 |
| `svp10-ghat` | 04: put the food down | the deer are tied: carry the fritter, it is the fare | `svp-hiran3`@5277/5313/5352; `fell`@4969/4999/5032 |
| gate | 04 door: arrive without food | the guard is hungry: put it on his counter | (gate; the route wins) |

## 2. Decision sweep, the whole city (plain doors exempt)

The set only shrank since FIX-2: dekho, saman, pul's second creek, teesra and the four door ideas are gone. The magar4 line and art are the only things
added. I re-read every remaining part against DECISIONS.md lists 1-2, v3, v3.1 and SVP's own rows. None matches.

| Stage | Part: decision | Closest row; plays differently because |
|---|---|---|
| 01 | room (tour): shelter for the two lobes, go in the sun | TVM-02 floods; a tour |
| 02 | room: stand on the piece the saw leaves (the boarding end) / `chirai`: this hall the middle stays / door: wait back for three planks, walk in after the third | rollers / 02 room broken / RPR `khisko` |
| 03 | room / `nala`: cross when the honest arrow points elsewhere / door (ruling I4): the same arrow over the door's logs | as ruled |
| 04 | room: food down well back from the edge / `ghat`: put it down at the stall itself / door: no food past the guard | herds; 04 rule broken; new reason |
| 05 | room: stand on the prints until the picture aligns, go before it fades / `ooncha`: the eye height (bench), not the prints or the pole / `choona`: hop under the formation, wait dry till it stops (S18 KEEP) | `invisible`; F503; HYD-06 echo |
| 06 | room: board the bent branch, ride the horn up / `sanjh`: labelled momentum (W7) | PNJ-05, `kvt07-bend` (S17 KEEP) |
| 07 | room: off the luggage before the call, trench for the crowd / `ghat`: the first ship is the crowd's, step on the second once alongside / `doosra`: labelled shelter beat / `bus`: be on the roof as the note rises | CHN-02; PDY `fakewin`; F504 vs TVM-02 (whether to ride, not where on the roof) |
| 08 | room / `gali` (labelled momentum): the lee end for the coming rain / `deewar`: by the building's height (I2) / `chhajja`: the slope's high end (F492) / `tin`: away from the drumming (V2) / door: cross the gutter in the lull (allocation A3) | PDY-08; as ruled |
| 09 | room: roots hold, brick crumbles, time the swing / `pul`: a grey, bare root is dead / `nali`: route the hose over arches, under only where line allows / `patta`: let go under the hatch | crumbling floors; own; own; PNJ-07 let go over the beach (a ride's release point, here a still release from a spot) |
| 10 | the finale table above | each is a break of SVP's own rule |

magar4 against still-predator rows: the closest is PDY-02 / `pdy02-pools` ("the rock in the last pool is a turtle: jump the whole pool"). That play is spot
the disguised animal and jump past it. magar4 is wait for it to swim off, and it breaks nadi's own ripple rule. No shipped row is "no ripples means a
still predator".

## 3. Padding and the probe table

I ran `probes/zz-table.test.ts` myself (`r3/table1-rerun.md`, 53 SVP rows: every stage's room, every `parts` act and every door). It gives the same
parts and the same deaths as `table1-fix3.md`. The rows that are not "ok" are the ruled ones: 01 tour (one trap), 07 doosra (labelled shelter), 08 gali
(labelled momentum, no death), 09 pul (ONE TRAP). Labelled beats, one per stage: 05 choona wall 2, 06 sanjh, 07 doosra, 08 gali, 09 nali stretch 2. No
other stage repeats a window.

## 4. Regressions

| Check | Result | File |
|---|---|---|
| `tsc --noEmit` | clean | |
| full `npm test` | 18 files passed, **1772 passed**, 24 skipped (my four scratch files are among them), 0 failed. SVP is not in modules EXEMPT; `CPSAFE3_PENDING` is empty. | `r3/npm-test-summary.txt` |
| `cpsafe -t SVP` | 10 passed, all strict (idle, run, tap-jump at lag 0/6/12) | |
| `LDD_N=80 npm run fair -- SVP` | **100% at 6t and 12t on all ten stages**, every stretch 100% at 0-12t; 18t: 06 80% (parked), the rest 100% | `r3/fair80.txt` |
| flows | "no errors" | `r3/flows.txt` |
| lag-captured sweep, all ten stages (route at lag 0/6/11/12 x spawn idle 0/37/120/251; capture where the lagged run takes the checkpoint; idle 4 s, run 0.3 s, tap-jump after 0/6/12) | **0 deaths in 5,600 plays.** 05 448, 06 336, 07 560, 09 560, 10 1,120; 01-04 and 08 as in round 1. Since nothing within reach of those plays dies, the 4.5-tile rule holds. | `r3/sweep-lag-captured.txt` |
| replay per tick, lag 0/6/12, from the lagged capture | worst: 01 7.32/7.42/7.76 (exempt), 02 6.63, 03 2.27, 04 3.72, 05 2.91, 06 1.86, 07 5.46, 08 **7.47**, 09 3.80, 10 6.21. No `nodeath` at any lag. | same |
| longest stretch | 01 16.1, 02 9.8, 03 7.8, 04 11.6, 05 8.4, 06 10.0, 07 9.1, 08 12.1, 09 6.0, 10 12.1 s (all <= 25) | same |

## 5. Diff e762988..3e6d9eb

Five commits (ffe27be, 3361d59, 7e47286, 67f4be6, 3e6d9eb). The files touched are `src/game/cities/svp/{causes,doors,levels,s03,s05,s07,s09,s10}.ts`,
`tests/cities/svp.ts` and `docs/cities/SVP.md`. There is no shared file and no version bump (`src/config.ts`, `package.json`, `src/game/levels`,
`src/game/world.ts` have no diff). `s03.ts` changes only `StillCroc.draw`, so 03 plays as before. 02, 03, 04 and 08 die at the same ticks as rounds 1
and 2: 02 aari@434/kichad@2063, 03 magar@272/magar2@741, 04 hiran@354/hiran2@1550, 08 baarish@217/nala@10013.

## Polish (not blocking)

- SVP-10's `tagline` still says "the mill, the creek, the roots, the luggage". The luggage hall is cut, so drop "the luggage" (the same goes for the
  comment in `s10.ts` line 2).
- The still crocodile is legible but small. Check it once on a device.
- 08's chhajja2 replay is 7.47 s, 0.03 s under the bar. Unchanged; leave it alone or give it margin in a later pass.
- The probe-table labels (momentum, shelter) come from an env var set by hand; the rows and deaths are script-made.
- `svp10-jad`'s second play dies in the second creek to the same rotting green root under a different key. It meets the rule as written; it is the
  weakest pair in the finale.

Not checked: the still crocodile on a real device. I did not re-read the 05, 06, 07 and 09 sheets frame by frame, since their doors draw nothing.
