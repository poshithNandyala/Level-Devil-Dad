# SVP probe pass (LENGTH.md)

- Branch `city/svp`, tip `f196c547d54c57a81374b5a6683f1407497d3978` (worktree `/local/home/saiposh/personal/ldd-wt/svp`). No push, no bump.
- Scratch probes (not in the repo, rerun by copying into `tests/`): `/local/home/saiposh/personal/ldd-inbox/reports/cities/svp/probes/` (zz-t, zz-probe, zz-probe4 + outputs).
- One correction to the brief: 07 and 10 already had a stage FIX and MISTAKES lists when this pass started (added in the previous turn). Probe 3 below shows them.

## Result in one paragraph

Five of the seven acts I added in the length pass (the five unallocated types) are the same experience as ideas that already ship, so I took them out of the stages. Stages 06 to 09 are back at their round-1 lengths and are **under their floors**: 06 36.1 s (floor 60), 07 58.9 s (120), 08 41.3 s (60), 09 24.9 s (60). 05 (rope and caves, SVP's two reserves) and 10 (rope callback) stay over their floors, and 01 to 04 stay in range. The files of the five retired acts and their routes stay in the repo; one line in `levels.ts` per act puts them back if you rule them distinct.

## 1. Route times (bot, seconds)

| Stage | Round 2 (all acts) | Now | Floor | Status |
|---|---|---|---|---|
| 01 | 30.1 | 30.1 | 25-35 | in range (see 01-04 note) |
| 02 | 25.8 | 25.8 | 25-45 | in range |
| 03 | 26.1 | 26.1 | 25-45 | in range |
| 04 | 25.8 | 25.8 | 25-45 | in range |
| 05 | 63.5 | 63.5 | >=60 | meets (rope R2, caves R1) |
| 06 | 62.3 | **36.1** | >=60 | under, honest number |
| 07 | 122.3 | **58.9** | >=120 | under, honest number |
| 08 | 73.3 | **41.3** | >=60 | under, honest number |
| 09 | 61.9 | **24.9** | >=60 | under, honest number |
| 10 | 98.6 | 98.6 | >=90 | meets (rope callback, nadi, cellar, hall, ghat) |

Pars follow: 41, 35, 35, 35, 86, 49, 80, 56, 34, 133.

## 2. Uniqueness: the five unallocated act types

`python3 allocation-work/check.py`: "36 cities 419 families 429 pairs, OK: no duplicates". That checks the allocation file only, so it says nothing about the five (they are not in it). I compared each with the shipped ideas in `docs/MECHANICS.md` (themes taken, hazards and kit, hardness-pass lists, act ids) and the acts' own advice lines in `src/game/levels/*.ts`.

| Type (stage) | Closest shipped idea | Same experience? | Action |
|---|---|---|---|
| Spit-side stalls (08 `svp08-bazaar`) | BBI: a cook's held jug pours over one badi of four; "vendor feeds or splashes Dad" in several cities | Yes. A periodic pour over one section, a tell, stand on a section that is not next, change in the rest. Two halves instead of four sections is a skin. | Removed |
| Rising-water raft (09 `svp09-hauz`) | Rising floods with floaters (kit; TVM-02, BOM-04), PDY-05 rafts ("ride the raft to the post"), tides (DMN, PDY-06) | Yes. Water rises, ride the floating thing to the height of the ledge, step across. The wall and the pipe are a skin. | Removed |
| Lift bridge (07 `svp07-khula`) | CHN-08 Pamban: "the middle of the bridge lifts for ships"; `drawbridge` door ending | Yes. A deck that lifts on a cycle with a ship passing, cross on the green. | Removed |
| Godown lift with overrun (07 `svp07-uthao`) | KVT-05 `kvt05-lift`: "Ride the fish basket up to the pier, and jump off at the top: it keeps hauling up into the pulley" | Yes, identical: stay aboard past the top and you die. Moving walkway: BOM-02 `bom02-walkway`, treadmills in the kit. The momentum jump off a walkway is a thin variation of a treadmill, I do not claim it as a new experience. | Removed |
| Swell floats and barge (06 `svp06-lehar`) | Timed platforms ("blinkers" in the kit), PNJ-08 floats in a parade, PDY-07 waves; the barge is a ferry (KVT, PNJ, DMN rope ferry) | Yes. Platforms out of phase, hop when the next is within reach; then a ferry ride. | Removed |

No SVP idea left in the bible is a different experience from what SVP already has: sorted padauk planks = my own 09 brick and root visual rule; lizard-tail root = my own 03 croc log; the mud volcano's popping crust = DDN-02 (retired from SVP in the allocation); Mount Harriet switchbacks = TVM-07 hairpins; Cellular Jail is never a stage. So there is no replacement idea to build, and the stop is honest.

The two types that stay are SVP's allocated reserves, not mine to rule on, but the case for each:

- **Mooring rope (R2, 05 `svp05-rassi`, 10 `svp10-rassi`).** Closest: PNJ-05 recoiling ropes (a thrown line you grab). The rule here: the boat is tied up on the far bank and the rope is only answered by hops beside the bollard, one pull per hop; the edge is useless. What the player reads is "the water is the wrong place to act, the bollard is the right one", and the thing that moves is the boat, not the player. The second creek moves the bollard seven tiles back from the water.
- **Caves (R1, 05 `svp05-choona`).** Closest: AMR-07 "knock makes a drip slide". The rule here: the hop itself is the knock, the formation is over the one place the path forces a hop, so the correct play is to hop and then wait seven seconds on the dry side. In AMR the knock is chosen, here it is forced and the answer is patience.

## 3. Repeat-window probe (every added act)

| Act | Windows in order (hazard / answer) | Reads differently per window | Verdict |
|---|---|---|---|
| 05 `svp05-rassi` | W1 creek 1, boat out of reach / 4 hops at the bollard, board, ride 6 s. W2 creek 2, wider, bollard 7 tiles back / 5 hops, board, ride 8 s | W1 teaches the rule with the bollard near the edge. W2 asks the player to trust the rule with the bollard far from the water | W1 new, W2 momentum |
| 05 `svp05-choona` | W1 rock + formation + drain / hop, wait 7 s on the dry side, hop the drain. W2 two-high wall + formation + drain / climb the wall (the knock), wait on top, climb down, hop the drain | W2: the place you wait is the wall top, not the floor, and the climb is the knock | W1 new, W2 momentum |
| 10 `svp10-rassi` | the same two windows as 05 | callback: the finale uses only SVP's own ideas | callback, not padding |
| 06 `svp06-lehar`, 07 `khula`, `uthao`, 08 `bazaar`, 09 `hauz` | removed (section 2) | | n/a |

Zero padding rows left. The added acts each have two windows: one that is new and one that is a momentum repeat; no act has a second identical repeat.

## 4. Same-tick FIX probe (cause@tick)

Played by `probes/zz-probe.test.ts` (`probes/probe3-output.txt`). The FIX of each stage dies to a different cause and a different tick than the NAIVE on every stage except 01.

| Stage | NAIVE | FIX | Different cause and tick |
|---|---|---|---|
| 01 | svp-baha@586 | svp-baha@1298 | tick yes, cause **no**: the tour has one trap, the lane flow; its second death is the same flow in the second lobe. Honest. |
| 02 | svp-aari@434 | svp-kichad@2063 | yes (correct log, then the act's cut boarding end) |
| 03 | svp-magar@272 | svp-magar2@741 | yes (correct room, then the act's patrol: new key `svp-magar2`) |
| 04 | svp-hiran@354 | svp-hiran2@1881 | yes (correct landing, then the second landing: new key) |
| 05 | svp-nazar@190 | svp-rassi@2482 | yes (correct view, ledge, then the rope creek) |
| 06 | svp-kichad@199 | svp-kichad2@2115 | yes (correct branch, then the second creek: new key) |
| 07 | svp-saman@844 | svp-bheed@1076 | yes |
| 08 | svp-baarish@354 | svp-nala@4164 | yes (both awning streets done, then the door's gutter) |
| 09 | svp-eent@138 | svp-eent2@509 | yes (correct roots, then the cellar's brick: new key) |
| 10 | svp-aari@687 | svp-magar2@1370 | yes (food down, mill done, croc creek) |

Per act (MISTAKES / `actDeath`):

| Act | NAIVE | FIX |
|---|---|---|
| 05 rassi | svp-rassi@2482 | svp-rassi2@3586 |
| 05 choona | svp-chuna@5296 | svp-chuna2@6510 |
| 10 rassi | svp-rassi@7566 | svp-rassi2@8670 |

07 MISTAKES (5): svp-jahaz@684, svp-jahaz@1220, svp-bheed@4060, svp-bheed@3849, svp-bheed@5575. 10 MISTAKES (6): svp-aari@757, svp-eent2@3513, svp-bheed@7153, svp-hiran2@10525, svp-rassi@7566, svp-rassi2@8670. Each dies where its advice says (the finale and the marathon prove their traps: mill blade, croc creek, cellar brick, luggage rush, deer at the edge, rope creek; first ship, luggage, trench, call).

New cause keys with Tara lines, split so the second attempt is a different trap: svp-magar2, svp-hiran2, svp-kichad2, svp-eent2, svp-rassi2, svp-chuna2.

## 5. Replay and calm probe

Method (`probes/zz-probe4.test.ts`, output `probes/probe4-output.txt`): replay the proven route; every 0.25 s branch three ways (stop; run on; run and jump, with a jump pulse every 40 ticks); play 6 s or to death; if it dies, replay = ticks from the checkpoint it would respawn at to the death, in seconds (so the waiting that a trap needs is counted). Calm: at every checkpoint, at lag 0, 4, 8 and 12 ticks (the route's inputs arrive late), replay to the moment the checkpoint is passed, then idle 4 s; run 0.3 s then idle; one tap jump then idle.

Bars: stretch <= 25 s (met everywhere), replay <= 8 s (not met on 21 stretches, below).

| Stage | Route | Longest stretch | Worst replay | Calm (lag 0/4/8/12) |
|---|---|---|---|---|
| 01 | 30.1 | 15.9 | 13.0 (s1, stop@16.3, dies of `fell`) | ok |
| 02 | 25.8 | 10.3 | 8.2 (s0, run into the mud) | ok |
| 03 | 26.1 | 5.3 | 6.2 | ok (cps added on the creek logs: 14.0 -> 6.2) |
| 04 | 25.8 | 12.1 | 10.4 (s0), 9.5 (s2) | ok |
| 05 | 63.5 | 12.3 | 10.4 (s7), 9.1 (s9), 8.2 (s10) | ok (fixed: the first checkpoint ran off the island, moved back 1.6 tiles) |
| 06 | 36.1 | 14.6 | 13.3 (s0), 12.6 (s2) | ok |
| 07 | 58.9 | 14.4 | 12.7 (s7), 10.2 (s2) | ok (the quay now has a checkpoint at its start) |
| 08 | 41.3 | 15.5 | 18.2 (s1), 10.8, 10.7, 9.8 | ok (fixed: the door checkpoint stood in open rain, now under a stoop) |
| 09 | 24.9 | 8.8 | 8.3 (s4) | ok (fixed: the cellar checkpoint was 2 tiles from the brick, moved back 2) |
| 10 | 98.6 | 12.3 | 10.3, 10.1, 9.5, 8.5, 8.3 | ok (same cellar fix) |

Why the 21 over-limit stretches are over, none fixable by moving a checkpoint:

- Waiting is the trap (the flock cycle in 06, the weather cycles in 08, the trench and the quay in 07, the late boat in 04, the shuttle in 01, as far as I looked). A checkpoint cannot sit past the wait, because the wait is at the hazard.
- Rides: the rope boats (05, 10) are 6 to 9 s long, and the only way to die on them is to step off; the caves wait is seven seconds.
- Fixed with checkpoints: 03 (creek logs), 07 (quay start). The roof lift C you flagged is gone with the godown lifts, and the 17 s barge went with the swell act.

Three calm failures found by the probe and fixed (the first three in the table): 05 first checkpoint (run 0.3 s dropped Dad off the island into the gap), 09 and 10 cellar checkpoint (run 0.3 s reached the brick), 08 door checkpoint (idle 4 s in open rain). None of the checkpoints sits past a hazard trigger at lag 4 to 12: calm passes at 0, 4, 8 and 12.

## 6. Stages 01 to 04: play or waiting

The extra seconds over round 1 come from slowing a mechanism, and I count them as waiting. Play-only numbers are round 1's.

| Stage | Round 1 | Now | Where the seconds are | Play-only |
|---|---|---|---|---|
| 01 | 23.9 | 30.1 | lobes of the cloud 2.2 s -> 5.2 s: standing under the awning | 23.9 (1.1 s under the floor) |
| 02 | 21.8 | 25.8 | carriage 52 -> 32 px/s: riding the log longer | 21.8 (3.2 under) |
| 03 | 24.4 | 26.1 | the croc slides in over 0.8 s not 0.35 s, patrol slower: more time reading the arrow | 24.4 (0.6 under); closest to play |
| 04 | 21.6 | 25.8 | boat late 5.2 s (was 2.6) and 3.6 s (was 2.0): waiting for the boat | 21.6 (3.4 under) |

I did not replace the waiting with new beats: every unallocated idea I have is a repeat (section 2). If you want the numbers honest instead of in range, reverting the four slowdowns gives the play-only column.

## 7. Fairness, tests, flows, sheets

- Fairness `LDD_N=80 npm run fair -- SVP` (`ldd-inbox/reports/cities/svp/fair-N80.txt`): every stage 100% at quick and average lag, every stretch 100% at 0-12 t. Relaxed (18 t): 06 80%, 09 80%, 10 93%, the rest 100%.
- `npm run typecheck`: clean. `npm test`: 1432 passed, 16 skipped (`npm-test.txt`; the count dropped from 1444 because the five retired acts' death plays are not registered). `modules -t SVP` 11 passed, allocation 10 passed, jump audit passes.
- `npm run build:single && node scripts/flows.mjs`: "no errors".
- Sheets: re-shot 05 to 10 at tip. Read this pass: SVP-05 (rope boats, caves with the new rock roof, door) and SVP-07 (back to the round-1 hall, quay, door). 06, 08, 09 and 10 were re-shot after the removal but not re-read; earlier this round I read the old 06 and 08 to 10 sheets, which showed the retired acts.
- Tip sha: `f196c547d54c57a81374b5a6683f1407497d3978`.

## What I did not do

- Replace the five retired acts: none of my SVP ideas is a different experience, so the stop is honest.
- Bring the 21 over-limit replays under 8 s: waiting and rides, see section 5.
- Give stage 01 a FIX with a different cause: the tour has a single trap.
