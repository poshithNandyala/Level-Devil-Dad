# SVP QA round 2: FAIL

Tester: the same independent QA chat as round 1. Subject `city/svp` at `e76298879d1f4349f9e4fdc7b283c494c6494962` (develop f8288e9 merged in at adebafc).
Worktree `/local/home/saiposh/personal/ldd-wt/qa-svp`, detached at that tip; scratch tests only, nothing committed. Clock 06:58-07:07 UTC.
Probe outputs and scratch tests: `QA/r2/`. FAIL.md stays as the round-1 record.

## Pre-rulings (as given)

Honest floors are final: 01 30.1, 02 25.8, 03 29.1, 04 20.6, 05 31.0, 06 19.7, 07 30.9, 08 86.8, 09 27.0, 10 57.9. I judged the acts that exist.
Cutting teesra with no replacement is accepted. SVP-01's 7.76 s replay is exempt. 06 and 09 at 18 ticks are parked. The F490 and F491 refusals stand.

## What holds

| Check | Result (my run) | File |
|---|---|---|
| Full suite | tsc clean; 18 files, **1780 passed**, 22 skipped (my four scratch files are among the skipped), 0 failed. SVP is on no list (`CPSAFE3_PENDING` is now empty, from the develop merge; SVP is not in modules EXEMPT). | `r2/npm-test-summary.txt` |
| `cpsafe -t SVP` | 10 passed, all strict (idle, run, tap-jump at lag 0/6/12) | |
| `LDD_N=80 npm run fair -- SVP` | **100% at 6t and 12t on every stage**, every stretch (doors included) 100%; 18t: 06 80% (parked), 09 98% | `r2/fair80.txt` |
| flows | built; "no errors" | `r2/flows.txt` |
| Lag-captured sweep 05/06/07/09/10 (route at lag 0/6/11/12 x idle 0/37/120/251, 7 plays per capture) | **0 deaths in 3,360 plays**; longest stretch 05 8.4, 06 10.0, 07 9.1, 09 6.0, 10 12.1 s | `r2/sweep-lag-captured.txt` |
| Per-tick replay, lagged model at 0/6/12 | worst 05 4.28, 06 1.86, 07 5.46, 09 3.81, **10 6.21 s**; every scripted NAIVE, FIX, mistake and door play dies at all three lags (no `nodeath`) | same |
| Probe table | `probes/zz-table.test.ts` rerun by me: it builds rows from each stage's `parts` plus `room` and `door`, and my output has the same parts and deaths as `table1-fix2.md`. The labels come from an env var the builder sets by hand. | `r2/table1-rerun.md` |
| 02, 03, 04, 08 | `s02.ts`, `s04.ts`, `s08.ts`: no diff against 2c587a5. `s03.ts` gains only finale-only code (`StillCroc`, a `Patrol` option that defaults to the old behaviour, `stale`-only branches). Their scripted deaths match round 1 to the tick (02 aari@434/kichad@2063, 03 magar@272/magar2@741, 04 hiran@354/hiran2@1550, 08 baarish@217/nala@10013). | |
| Padding | Labelled beats, one per stage: 05 choona wall 2, 06 sanjh, 07 doosra (shelter), 08 gali, 09 nali stretch 2. dekho is one view, pul is two creeks and teesra is gone. There is no other run of identical windows. | |

## B1-B8: my plays (cause@tick at lag 0 / 6 / 12)

| Finding | Closed? | Evidence |
|---|---|---|
| B1 teesra | **yes** | off `levels.ts`, in `RETIRED`; 07 is room, ghat, doosra, bus, door |
| B1b saman | mechanically yes; **decision fails (F4)** | NAIVE bheed@4336/4372/4421; FIX saman2@4214/4250/4299 |
| B2 nadi | mechanically yes; **the death line fails (F5)** | magar3@1273/1287/1303; magar4@2712/2736/2758 |
| B3 mill | **yes** | hiran4@689/695/701 (the line names the fritter and the herd); kichad@726/735/745. The saw now takes the boarding end first and the far end stays, which breaks 02. |
| B4 gate | **yes** | the gate opens only with the fritter put down on the counter, which breaks 04's door. Closest is `svp10-ghat` (carry the fritter to the boatman), but it plays differently: ghat wants you moving so you don't put it down, the gate wants you standing still at the counter. |
| B5 dekho | **no (F3)** | NAIVE nazar@832/850/868 is real; FIX nazar3@983/1001/1019 is the room's own lesson replayed |
| B6 pul | **no (F2)** | NAIVE grey@818/823/848 is real, with a line naming the grey root; FIX eent2@890/898/905 and the stage FIX eent2@550 are both "walk the brick" |
| B7 doors | **no (F1)** | all four new doors fail the decision test |
| B8 ghat | **yes** | jahaz@920/932/966; jahaz2@1299/1317/1345 (jumping for the second ship before it is alongside) |

## The 06 nest door, played (not read from rise numbers)

Probe `r2/qa-doors.test.ts.txt`, output `r2/door-bands.txt`. The stage route runs to the door, then a take-off at D-10.6 to D-8.8 in steps of
0.2-0.4 tiles; a lagged press moves the take-off later, so this spread covers lag 0-12. At each take-off I held the jump 3-30 ticks.

- From D-10.2 to D-8.8: **holds of 3-22 ticks all win, holds of 24 and 30 ticks all die `svp-bhaunra`**. No take-off shows a mix, so there is no coin flip. The builder's 15-19 band is inside the safe side.
- From D-10.6 (too early): holds of 3-19 ticks fall short into the creek (`svp-kichad`) and 20-22 win.

The mechanism is fair. The decision is the problem (F1).

The 09 wall door, same probe: taps of up to 14-22 ticks die `svp-eent5` (the limit depends on take-off) and holds of 18-30 win. The 05 turtle door: one hop
anywhere from D-10 to D-1 dies `svp-kachua`, and walking after the step wins.

## Decision sweep, new and recast parts

| Part | Decision (one sentence) | Closest row | Verdict |
|---|---|---|---|
| mill (10 room) | The saw takes the boarding end first: put the food down, then ride the far end. | 02 room and `svp02-chirai` (which piece stays) | a break (law 7); ok |
| `svp-hiran4` | The herd leans on whoever carries food onto the log. | 04 room | the callback; the break is the saw end; ok |
| `svp10-nadi` + `magar4` | No ripples does not mean no crocodile: a still one shows its eyes; wait till it swims off. | PDY-02 / `pdy02-pools` (the rock in the last pool is a turtle: jump the whole pool); `kvt-sand-arm` (the rippling sand is the arm) | PDY spots a disguised animal and jumps past it; here you wait for it to leave, and it breaks nadi's own ripple rule. **No shipped "still predator, no ripples" row found.** ok, but see F5 |
| `svp10-saman` + `saman2` | The lashed stack is the cover; the untied bags over the water go at the call. | **fake floor with a tell** (registry calibration: "a float that drops when you land = fake floor with a tell"); the **07 room** itself (luggage goes at the call; the advice says "as before") | **match** (F4) |
| gate `svp-dweep-gate` | The guard is hungry: put the fritter down on his counter. | 04 `svp-jetty-guard` (inverted); `svp10-ghat`; RPR `gud` | ok |
| `svp05-dekho` + `nazar3` | The prints, not the bench (NAIVE); stand on the prints too long and the ledge fades (FIX). | the 05 room: its own line "it only holds a few seconds" and its round-1 FIX (dawdle, nazar@573) | the NAIVE is ok; **the FIX is the room's** (F3) |
| `svp09-pul` + `grey` | A grey, bare root is dead: skip it (NAIVE); then walk across the brick (FIX). | the 09 room (the brick crumbles) | the NAIVE is ok; **the FIX is the room's NAIVE** (F2) |
| `svp07-ghat` + `jahaz2` | Wait for the second ship to be alongside before you step on. | PDY `fakewin` | ok |
| 05 door, turtle | Walk past the sleeping turtle; a hop near it wakes it. | **PDY-06 / `pdy06-palms`** ("a coconut drops when you jump under its palm: walk under"); PNJ-04 sleepers; TVM-01 soaked ground breaks under a hop | **match** (F1) |
| 06 door, wasps' nest | Hop the creek low; a full jump puts your head in the nest overhead and drops you short. | **BLR-05 room** ("under a low glass roof take only small hops: a big jump bonks you into the pond"); `blr07-crusher`; DMN-02 | **match** (F1) |
| 07 door, bell | Hop up under the bell to ring it; the window opens. Nothing kills, and there is no wrong answer. | PDY `bells`; BLR-02 stamp-the-mat; HYD `otp` | **no door idea** (F1) |
| 09 door, wall | Hold the jump for the tall wall; a tap drops you into the ditch. | **TVM-08 room** ("hop low bridges, hold for the tall one"); BOM `kabaddi`; **the SVP 06 door** (tap or hold by the obstacle's height, the same question asked the other way round) | **match** (F1) |

## BLOCKING

**F1 (B7 not closed): none of the four new doors is a new idea.**
- 05 turtle = PDY-06 (a jump near the thing sets it off: walk). My play: any hop from D-10 to D-1 dies `svp-kachua`, walking wins.
- 06 nest = BLR-05 (small hops under a low overhead; a big jump bonks you into the water). My play: holds of 3-22 ticks win, 24 and up die `svp-bhaunra`.
- 07 bell: a lock with no wrong answer, so nothing at the door betrays anything (AGENTS.md bar 2: "in the room, in the act and at the door"). Head-bumping a thing to open the way is PDY `bells` / BLR-02's class. I count it as no door idea.
- 09 wall = TVM-08 (hold for the tall one). In SVP it is also the 06 door's question (tap or hold by height) the other way round. A three-tile wall asks for a hold anyway, so the baited tap is not an obvious play.

What satisfies me: four doors whose sentence matches no row in lists 1-2, v3 or v3.1, and none of SVP's, each with a baited play that dies.

**F2 (B6 not closed): pul has no honest second trap.** Its FIX "the first creek by the green roots, then across the brick of the second" (`svp-eent2`@890)
and the stage FIX (`svp-eent2`@550, "across the brick of the cellar") both have Dad walk brick. That is the 09 room's NAIVE: no one who has just learnt
"brick crumbles" walks brick. What satisfies me: a FIX that is the obvious correction of the grey-root death (for example "green roots only", which then
meets a new trap), with a different cause and tick.

**F3 (B5 not closed): dekho has one trap.** The NAIVE (stand at the bench, `svp-nazar`@832) is new. The FIX `svp-nazar3`@983 is "stand on the prints and
then dawdle". The room's own death line already teaches "it only holds a few seconds", and that was the room's round-1 second attempt (nazar@573). The
obvious fix after the bench death is "stand on the prints", and that play wins. What satisfies me: dekho's own second trap where that fix lands.

**F4 (B1b): saman2 is the fake floor with a tell, and it is the 07 room's rule replayed.** The bags over the water look like the lashed ones, have no rope,
and go at the call. The registry treats "a floor that looks the same and goes, read the tell" as already asked. The advice itself says they go "as
before", which is the 07 room's rule. The other saman death (`svp-bheed`, waiting in the open) is also 07's crowd. So both saman deaths re-ask 07's rules,
and only the solution (the lashed stack is the cover) breaks anything. What satisfies me: a saman FIX whose trap is not 07's rule and not a tell-read floor.

**F5 (B2): magar4's death line does not read.** A player killed by the still crocodile (no ripples) reads "You read the ripples at the first gaps and then went
back to the board. Keep reading the ripples". The line describes a different mistake and repeats the advice that just killed them (law 9). What
satisfies me: a line that names the still crocodile and its eyes, and says to wait until it swims off.

## Polish

- The still crocodile's tell is two 2.4 px yellow squares and a 36x5 dark patch. It is on screen, but I did not render it at phone size; check it when the line is fixed.
- The bell is small on the 07 sheet (`shots5/SVP-07-sheet.png`, last frame), though it reads as a bell. Moot if the door changes.
- The probe table's labels (momentum, shelter) come from a hand-set env var; the rows and deaths are script-made.

## To re-test I will need

- The new tip, and which commit closes each of F1-F5.
- New door sentences with the closest row each, a `doorDeath` per door, and actDeath FIX plays for pul, dekho and saman with new causes.
- The magar4 line text.
- Your fair, sweep and table reruns. I will rerun all of them myself, plus the door bands and the per-tick replay.
