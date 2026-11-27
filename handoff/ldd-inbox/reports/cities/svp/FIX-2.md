# SVP fix round 2 (QA FAIL at 2c587a5, findings B1-B8)

Branch `city/svp`, tip `e76298879d1f4349f9e4fdc7b283c494c6494962`. Develop f8288e9 is merged first (`adebafc`, a merge, not a rebase). No push, no version bump, no shared file touched. Scratch tests (not committed): `probes/zz-table.test.ts` (probe table 1), `probes/zz-qa6.test.ts` (sweep and replay).

## Per finding

| Finding | Before | After | Commit |
|---|---|---|---|
| **B1** `svp07-teesra` | the walk-on play survived; the decision was PAT-04's second-follows | **cut** (off the stage, in the test's `RETIRED` set). No replacement: nothing registry-free killed the walk-on play at lag 0/6/12, so 07 is shorter. `svp07-doosra` is labelled 07's one shelter beat. `svp10-saman` FIX is no longer a returning crowd (see below). | 21630f4 |
| **B1b** `svp10-saman` | NAIVE bheed@4336 / FIX bheed2@4976 (a returning crowd) | the returning crowd is removed. The bags on the pier are lashed and the tall stack is the cover; the few bags over the water were never tied and go at the call. NAIVE (wait in the open): `svp-bheed`@4336. FIX (sit on the luggage over the water, trusting the lashing): `svp-saman2`@4214 (a fall into the water). The sitter dies at lag 12 too (sweep below). | 21630f4 |
| **B2** `svp10-nadi` | one trap (NAIVE and FIX both magar3@1290) | a second crocodile lies still under the last gap, with its eyes showing and no ripples, until it swims off. The ripple reader who jumps the last gap because there are no ripples dies: `svp-magar4`@2712. The first trap, the stuck board, stays `svp-magar3`@1273. The solution waits at the last gap until the still crocodile has gone. | 65e6b01 |
| **B3** the mill | NAIVE `svp-aari`@654 (the 02 saw line), FIX `svp-aari`@717; replays 04 and 02 | NAIVE (carry the fritter on to the log, herd on your heels) now dies `svp-hiran4`@689 with a line that names the herd and the food ("You went on to the log with the fritter in hand, and the herd leaned on you from behind"). FIX (food down, ride the boarding end as the mill always taught) dies `svp-kichad`@726 (the piece you stood on was the piece they cut). **The room breaks 02's rule:** the saw takes the boarding end first and the far end is the one that stays (`SawHall` cuts with `drop: 'left'`, blade retracting). No exemption used. | ff07125 |
| **B4** `svp-dweep-gate` | same advice text and policy as `svp-jetty-guard` | new gate: the guard is hungry. The fritter must be put down **on his counter** (stand still within a tile of it). The 04 habit of putting it down well back leaves the gate shut. Deer are tied, so nothing shoves. | ff07125 |
| **B5** `svp05-dekho` | five views, no scripted deaths | one view: the bench three tiles before the footprints. Choona's second wall is the stage's labelled momentum beat. NAIVE (stand at the bench): `svp-nazar`@832. FIX (stand on the footprints, then stay looking at it until the ledge has gone): `svp-nazar3`@983. 05 is 31.0 s (was 41.5). | 24561ba |
| **B6** `svp09-pul` | five creeks, no grey-root NAIVE, FIX was the room's | two creeks. NAIVE (hop every root, the grey one too): `svp-grey`@818 with a line that names the grey root. FIX (first creek by the green roots, then across the brick of the second): `svp-eent2`@890. 09 is 27.0 s (was 35.3). | 24561ba |
| **B7** four doors | `svp-note-door`, `svp-bough-door`, `svp-ticket-window`, `svp-frame-door` repeated their stage | four new doors (`doors.ts`, same ids so the allocation and ending keys do not move), below | cdd3313 |
| **B8** `svp07-ghat` | one trap (jahaz@920) | FIX: jump for the second ship while it is still coming in: `svp-jahaz2`@1299 (the sea's cause switches while the ship is arriving). | 21630f4 |

## The four new doors: decision, closest row, why different (DECISIONS.md lists 1-2, v3 and v3.1, and SVP's own rows)

Not one of these is on the "already asked" list (step aside and wait, pace behind, hop a head-on thing, fake floor with a tell, floor gives way when you stop, count, ride-and-get-off, item in hand, follow the beat, all-clear, pour, rising water, lifting bridge, lift past the top, out-of-phase platforms, ferry), and none is asked anywhere in SVP.

| Door | Decision | Closest row | Why different | Baited play and its death |
|---|---|---|---|---|
| 05 `svp-note-door` | A sleeping turtle lies on the beach before the door: walk, do not hop within 3.5 tiles of it. | `pdy02-pools` (a turtle in the last pool, jump the pool); `kvt02-glass` (a plank drops if you land from a jump) | there the jump is the answer, or the landing is the trap; here the answer is not to jump, on flat sand, after the whole stage has taught hopping | hop all the way: `svp-kachua`@3621 |
| 06 `svp-bough-door` | Hop the two-tile creek low: a wasps' nest hangs over it at the height of a full jump's head. | `blr07-crusher` (a low boulder: keep moving, small hops), `chn04-cricket` (stay down for the bouncer) | the hazard hangs over a gap that has to be jumped, and the tap against hold is the whole decision; no moving hazard | a full jump: `svp-bhaunra`@2266 |
| 07 `svp-ticket-window` | The window is shut; hop up under the brass bell to ring it and the clerk opens it. | `bells` (PDY: jump exactly on the bell, three chimes), `otp` (HYD: bonk the number blocks in order), `pat-ghanti` | one bell, one ring, no order, no timing and no wrong answer: it is a lock whose key is a head-bump | none: a lock door, Dad is stopped (`door: lock`) |
| 09 `svp-frame-door` | The door is up on a three-tile wall with a ditch before it: hold the jump all the way up. | `kabaddi` (BOM: hold the jump all the way to the door), `bull` (CHN) | kabaddi holds the button the whole room; here it is one jump to a height, and a tap drops you in the ditch | a tap at the ditch: `svp-eent5`@3211 |

Measured jump: a tap rises 39 px, holds of 20 / 30 / 60 ticks rise 48 / 57 / 60 px. The bell and the nest sit at the tap's head height and a full jump's head height; the wall is 48 px, so only a hold gets feet above it. Dad is 14 px tall.

## Polish

- **P1:** `svp07-doosra` is labelled 07's one shelter beat (table below, `docs/cities/SVP.md`).
- **P3:** one gender for the ship ("Ship nikal gaya!", masculine like "Agla ship pakdo", "Ship ka intezaar"); "Jungle one, Dad zero!" is now "Jungle ek, Dad zero! | Jungle one, Dad zero!" (`lines.ts`, c2aff33).
- **P4:** probe table 1 is made by a script from each stage's `parts` list: `probes/zz-table.test.ts` runs every scripted play (stage NAIVE, FIX and every `actDeath`/`doorDeath`, which now carry their act id) and groups them by act id. The table and the same-tick scan are below, verbatim from `probes/table1-fix2.md`. It covers every act id and every door.
- **P5:** nothing in 08 was changed (chhajja2 stays at 7.47 s).

## Probe table 1 (script-made, `probes/table1-fix2.md`)

| Stage | Part | Label | Scripted deaths cause@tick | Verdict |
|---|---|---|---|---|
| SVP-01 | STAGE PAIR | NAIVE / FIX | svp-baha@586; svp-baha@1298 | same cause (one-trap tour, ruled) |
| SVP-02 | STAGE PAIR | | svp-aari@434; svp-kichad@2063 | ok |
| SVP-02 | svp02-chirai | | svp-kichad@2063 | FIX of the stage; NAIVE is the room's |
| SVP-03 | STAGE PAIR | | svp-magar@272; svp-magar2@741 | ok |
| SVP-03 | svp03-nala | | svp-magar2@741 | FIX of the stage |
| SVP-04 | STAGE PAIR | | svp-hiran@354; svp-hiran2@1550 | ok |
| SVP-04 | svp04-ghat | | svp-hiran2@1550 | FIX of the stage |
| SVP-05 | STAGE PAIR | | svp-nazar@190; svp-chuna@1869 | ok |
| SVP-05 | svp05-dekho | | svp-nazar@832; svp-nazar3@983 | ok |
| SVP-05 | svp05-ooncha | | svp-nazar@1319; svp-nazar2@1252 | ok |
| SVP-05 | svp05-choona | momentum (second wall) | svp-chuna@1869; svp-chuna2@2842 | ok |
| SVP-05 | door | | svp-kachua@3621 | door: baited play dies |
| SVP-06 | STAGE PAIR | | svp-kichad@199; svp-kichad2@1309 | ok |
| SVP-06 | svp06-sanjh | momentum beat | svp-kichad2@1309 | FIX of the stage |
| SVP-06 | door | | svp-bhaunra@2266 | door: baited play dies |
| SVP-07 | STAGE PAIR | | svp-saman@544; svp-bheed@776 | ok |
| SVP-07 | room | | svp-saman@544; svp-jahaz@684; svp-bheed@776 | ok |
| SVP-07 | svp07-ghat | | svp-jahaz@920; svp-jahaz2@1299 | ok |
| SVP-07 | svp07-doosra | shelter beat | svp-bheed@2553; svp-bheed@2413 | labelled shelter beat: the room's rule, the room's two mistakes |
| SVP-07 | svp07-bus | | svp-bus@2998; svp-bus-aage@3301 | ok |
| SVP-07 | door | | none | door: lock, Dad is stopped |
| SVP-08 | STAGE PAIR | | svp-baarish@217; svp-nala@10013 | ok |
| SVP-08 | svp08-gali | momentum beat | none | labelled momentum beat: the room again |
| SVP-08 | svp08-deewar | | svp-baarish@3423; svp-baarish2@3754 | ok |
| SVP-08 | svp08-chhajja | | svp-chhajja@5380; svp-chhajja2@7181 | ok |
| SVP-08 | svp08-tin | | svp-baarish@8365; svp-baarish3@9039 | ok |
| SVP-08 | door | | svp-nala@10013 | door: baited play dies |
| SVP-09 | STAGE PAIR | | svp-eent@138; svp-eent2@550 | ok |
| SVP-09 | svp09-pul | | svp-eent2@550; svp-grey@818; svp-eent2@890 | ok |
| SVP-09 | svp09-nali | momentum (stretch 2) | svp-nali@1744; svp-nali2@2155 | ok |
| SVP-09 | svp09-patta | | svp-hull@2653; svp-pankha@2735 | ok |
| SVP-09 | door | | svp-eent5@3211 | door: baited play dies |
| SVP-10 | STAGE PAIR | | svp-hiran4@689; svp-magar3@1273 | ok |
| SVP-10 | room (the mill) | | svp-hiran4@689; svp-kichad@726 | ok |
| SVP-10 | svp10-nadi | | svp-magar3@1273; svp-magar4@2712 | ok |
| SVP-10 | svp10-jad | | svp-eent3@3405; svp-eent4@3666 | ok |
| SVP-10 | svp10-saman | | svp-saman2@4214; svp-bheed@4336 | ok |
| SVP-10 | svp10-nali | | svp-nali@5064; svp-nali2@5475 | ok |
| SVP-10 | svp10-ghat | | svp-hiran3@6149; fell@5842 | ok |
| SVP-10 | door | | none | door: lock, Dad is stopped |

The table has no row marked "one trap" except the 01 tour (ruled exempt). Labelled beats: 05 choona's second wall (momentum), 06 sanjh (momentum), 07 doosra (shelter), 08 gali (momentum), 09 nali stretch 2 (momentum): one per stage.

**Same-tick FIX scan.** Two entries, both the same play registered twice, not two plays colliding: 05 stage FIX = choona's "hop everything in the cave" (`svp-chuna`@1869), and 10 stage FIX = nadi's "trust the board" (`svp-magar3`@1273). Every NAIVE/FIX pair of a stage differs in cause and tick except 01 (ruled).

## Route times (bot, seconds; floors only get lower here, as ruled)

| Stage | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Before (7277011 / 2c587a5) | 30.1 | 25.8 | 29.1 | 20.6 | 41.5 | 21.2 | 44.5 | 86.8 | 35.3 | 64.5 |
| Now | 30.1 | 25.8 | 29.1 | 20.6 | **31.0** | **19.7** | **30.9** | 86.8 | **27.0** | **57.9** |

The doors' lengths are included. The pars were re-run for the changed stages (05 42, 06 27, 07 42, 09 36, 10 78).

## Lag-captured sweep and per-tick replay (changed stages 05, 06, 07, 09, 10; `probes/sweep-fix2.txt`)

Route at lag 0/6/11/12, spawn idle 0/37/120/251, 7 plays per capture; replay per tick from the last checkpoint to each scripted death at lag 0/6/12.

| Stage | Capture points | Plays | Deaths | Longest stretch | Worst replay, lag 0 / 6 / 12 (s) |
|---|---|---|---|---|---|
| SVP-05 | 5 | 560 | 0 | 8.4 s | 4.17 / 4.22 / 4.28 |
| SVP-06 | 3 | 336 | 0 | 10.0 s | 1.66 / 1.76 / 1.86 |
| SVP-07 | 5 | 560 | 0 | 9.1 s | 5.00 / 5.31 / 5.46 |
| SVP-09 | 6 | 672 | 0 | 6.0 s | 3.80 / 3.81 / 3.81 |
| SVP-10 | 11 | 1232 | 0 | 12.1 s | 6.05 / 6.13 / 6.21 |

**0 deaths in 3,360 plays; worst replay 6.21 s.** The sitter on the loose luggage over the water dies at all three lags (`svp-saman2`).

## Proofs

- `tsc --noEmit`: clean.
- Full `npm test` (`npm-test-fix2.txt`): 18 files passed, **1780 tests passed**, 21 skipped, 0 failed.
- `cpsafe -t SVP`: all ten stages pass (idle, run, tap-jump at lag 0/6/12). The new doors' hazards sit well clear of their checkpoints (the sweep and cpsafe both pass).
- `LDD_N=80 npm run fair -- SVP` (`fair-N80-fix2.txt`): every stage 100% at 6 and 12 ticks, every stretch (doors included) 100% at 0-12 ticks. At 18 ticks: 06 80% (parked), 09 98%, the rest 100%.
- `node scripts/flows.mjs`: no errors.
- Sheets re-shot and read: `shots5/SVP-05-sheet.png` (the single view with its bench, the ooncha act, the caves, the turtle on the beach by the door), `SVP-07-sheet.png` (the bus stand, the harbour bell hanging by the window), `SVP-09-sheet.png` (two creeks, the pontoon and its hatch, the old wall with the door on it), `SVP-10-sheet.png` (the mill, the creek, the cellar, the luggage, the hose, the fare sign and the counter at the gate).

## Skipped or not checked

- The second crocodile in the nadi creek and the tied-deer gate were checked by their scripted plays and the sweep, not by a human-timed play beyond the lagged route.
- The 06 door's baited play is a full hold; a hold of 15 to 19 ticks sits in a band I measured only by the rise numbers (48 px at 20 ticks), not by a lagged play.
- The nadi stage FIX and its "trust the board" mistake are the same play (listed above).
- 02, 03, 04 and 08 were not re-shot; they are unchanged.
