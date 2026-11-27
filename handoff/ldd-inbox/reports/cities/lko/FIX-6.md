# LKO fix round 6 (it_09ef4d7b): QA FAIL-2 C1-C8

Branch `city/lko`, worktree `ldd-wt/lko`, tip **`4b2abf5`**, continuing from `110d6d7`. No push, no version bump, no shared file touched, no `pkill`. B1, B4, B5 and B6 stay closed; I did not touch them.

## The honest section: route times (scripted route, s)

| Stage | Round 5 (QA-2) | Now | Why it moved |
|---|---|---|---|
| 01 | 14.2 | 14.2 | |
| 02 | 25.3 | **20.2** | `aadaab` cut (C2) |
| 03 | 25.2 | 25.2 | |
| 04 | 26.4 | **10.7** | `badal` cut (C3); the door is plain (C1) |
| 05 | 49.1 | **42.9** | `dum` cut (C2) |
| 06 | 50.8 | **37.3** | `tihai` cut (C3); the door is plain (C1) |
| 07 | 54.4 | **50.9** | `chauraha` cut (C2); `shaam` gained its stroller tail (C5) |
| 08 | 44.2 | **37.9** | `minar` and `mehrab` cut (C2); the door is plain (C1) |
| 09 | 70.9 | **61.0** | `hawa` went from 8 roofs to 4 (C6); the door is plain (C1) |
| 10 | 89.7 | **38.6** | five plain callbacks and `do` cut (C3, C4); the door is plain (C1) |

These are the honest numbers after the rulings. 04 is now a room plus one act (`chowk`) and a plain door. The finale keeps only the six callbacks that break their rule. Pars are route time x 1.3: 27, 33, 14, 56, 49, 67, 50, 80, 51.

## Per finding: before, after, commit

| # | Before (110d6d7) | After | Commit |
|---|---|---|---|
| C1 | Six doors re-asked their room: 04 kulhad, 06 sam, 07 darban, 08 489, 09 chhatri, 10 tehzeeb | **All six are plain doors** (`plain()` in `endings.ts`: no idea, walk in; the ids stay). The old Ending code is deleted, and the door mistakes for 04, 07, 08 and 10 are gone. No candidate passed the gate; the table below says why | `eb90a86`, `072e918` |
| C2 | aadaab, dum, mehrab and minar re-asked their room; chauraha repeated PDY-04 with no tell | **All five cut.** For each of the four I looked for a new read and found nothing that did not re-ask the room or another LKO act (reasons below). chauraha is cut by ruling | `eb90a86`, `072e918` |
| C3 | tihai = PDY-07 (the third is the big one, be on the safe thing); badal = KVT-03 (travel inside the moving safe zone) | **Both cut, and `lko10-do` with tihai.** I found no recast whose sentence passes the gate (below). Re-aiming `do` at another 06 rule would collide with `seedha` (guru) or the room | `eb90a86`, `072e918` |
| C4 | dhulai, julus, galiyara, raasta and chirag replayed their rule; the W2 ruling is withdrawn | **All five cut.** None got a break that passes the gate: the obvious breaks re-ask an LKO act already in the tree. The finale is darbar, tasveer, jawab, daana, seedha, thahra: six breaks | `eb90a86`, `072e918` |
| C5 | batti and hawa had one play each; shaam, gumbad and tihai each had two plays of one cause | **batti:** a second play, `lko-seedhi-utar`@1703 x92.2 (he brings the ladder down on you), alongside `lko-seedhi`@1482 x93.6. **hawa:** a second play, `lko-hawa-ulta`@2776 x93.1 (the last-roof twist), alongside the stage FIX `lko-hawa`@1836. **shaam:** the second play now meets a different trap, the strollers past the awnings: `lko-ganj`@1201 x74.0 vs `lko-shamiyana`@619 x45.4. **gumbad:** jumping from far back is `lko-gumbad-uncha`@1238 (the terrace kept its far-back size), walking up is `lko-gumbad`@1225. tihai is cut | `8b1fe70` |
| C6 | hawa was 8 low-roof crossings of one read | **4 roofs**, with a twist on the last: the flyer walks round in front of you, so for the last crossing the face you see is the birds' face too, and you cross on red again (`Round` in `s09.ts`) | `8b1fe70` |
| C7 | Seven LKO-05 checkpoints sat 3.3-4.2 tiles before the tawa, rack, slab or tandoor | Act checkpoints moved from -2 to -3. `lane`'s two checkpoints are merged at -3, because cp 1.5 sat 1.5 tiles from its tawa and no spot in the lane is 4.5 tiles clear. `ghee`'s tawa starts a tile later. The sheermal door space is 13, not 12. The tester's own `qa-lko-walk45` probe now shows **no LKO-05 death short of +4.5 tiles** (the nearest is +4.8) | `71a74e1` |
| C8 | Some baited plays survived lag 6 or 12, and some pairs collapsed into one death | Fixed play by play; table below. **Two baits a 12-tick-late jump cannot play**, with the reasons given there | `289f1bb`, `a552c5c`, `c706241` |

Other commits:
- `a552c5c`: the jhande route reaches the end roof at lag 11 (the four-roof hawa had shifted its timing).
- `33e116f`: pars and LKO.md.
- `4b2abf5`: 10's intro no longer promises a covered threshold at the now-plain door.

## The gate table

I ran the gate before building anything. It covers DECISIONS.md lists 1-2, v3, v3.1, the archetype table, and Lucknow's own rows, rooms and doors.

### Doors (C1): the candidates I tried, and why each failed

| Door | Candidate sentence (a break or a new read) | Closest row | Why it fails |
|---|---|---|---|
| 04 kulhad | "The halwai's lamp moves while you are on the steps: change tile as it passes" | 04 room (the lid moves the light) and `lko10-chirag` (cut for being exactly this) | Same thought as the room |
| 04 kulhad | "The counter's step is all shade: stand anywhere, but the cups on it are sun-hot" | `lko04-chowk` (single cups in a stack's shadow) | Re-asks chowk |
| 06 sam | "Ring a strip on purpose so she spins away from the door, then dash" | TVM-04 "bait the gap nut" (make the hazard fire elsewhere) | Shipped thought |
| 06 sam | "She stops after two chakkars tonight, not three" | PDY-07 / tihai (cut), `lko10-do` (cut) | Counting-to-the-big-one class |
| 07 darban | "A pause in front of the café is loitering: walk straight in" | PDY-04 never-stop; `lko03-kunda` | Momentum repeat |
| 07 darban | "He opens for a stroller: walk in behind one" | I3 / `lko07-julus` (pace behind) | Re-asks julus |
| 08 489 | "The last arch taken backwards goes down" | `lko08-wapas` | Re-asks wapas |
| 08 489 | "The exit arch is crownless" | `lko08-toota` | Re-asks toota |
| 09 chhatri | "Under the chhatri the flock comes home on white, so go in on white" | 09 room inverted = `lko09-hawa`'s inversion | Re-asks hawa |
| 10 tehzeeb | "Bow on the cover on purpose: the bells call the dancer, who opens the door" | 10 room reversed | No baited play dies: bowing on the plain board, as taught, only leaves the door shut. A door with no death is not a trap |

Each stage has an honest plain door, which the ruling accepts over a repeat.

### Acts: recasts I tried for C2, C3 and C4, and why each failed

| Part | Candidate | Closest row | Verdict |
|---|---|---|---|
| aadaab | "He greets you twice: bow to the second only" | 02 room / `takrar` (keep bowing) | Re-asks takrar: cut |
| dum | "The triple heap squashes from the top: hop after the first" | 05 room (wait for the squash), `bhara` (hop from flat) | Cut |
| mehrab | "The hook vault arch now has a well past it: jump" | 08 room / `toota` | Cut |
| minar | "Three stacked arches; the third is crownless" | `toota` | Cut |
| tihai | "The tabla player skips the third phrase" | PDY-07 / HYD-03 counting | Cut, and `do` with it |
| badal | "The cloud's shadow moves faster than you: wait for the next" | KVT-03 / `kvt10-nizhal` | Cut |
| dhulai | "Tonight the second wash takes the stitch" | B32 fake floor with a tell; 03's own read (10.3 was struck for this) | Cut |
| julus | "The procession stops at a nala: overtake on the cover" | 10 covers rule (jawab/tasveer); PAT-04 | Cut |
| galiyara | "The well arch has a crown missing tonight" | `toota` | Cut |
| raasta | "He does not bow back tonight: go first" | `lko02-takrar` (the other way round) | Cut |
| chirag | (any form) | 04 room's lid flip | Cut |

### The changed acts that stay: the new sentence and its closest row

| Act | New sentence | Closest row | Why it is different |
|---|---|---|---|
| `lko09-hawa` | The birds read the far face of the flag; for the last roof he comes round in front, so the face you see is theirs again | 09 room (red = go), `jhande` (the nearer flag wins) | One flyer, one flag. What changes is which face you see as he walks round, not which signal wins (W9 holds). It is the only flag in 09 that flips your read mid-act |
| `lko07-shaam` | The shop boy at the crank (the shivering awning) is next: stop short of it; past the awnings, the strollers want a pause | S11 (kept with the tell); 07 room (pause, they part) | The second trap is 07's own room rule, met after the momentum read, so the obvious fix ("they're behind you now: run") meets a different trap |
| `lko07-batti` | Go under while he is up, and straight out again: he brings it down behind him | none outside LKO | It has one decision with a second failure: staying under is a new death on the same read |
| `lko09-gumbad` | Jump from the paving line; from far back the terrace froze too high | `tiny` | Same act and read; the second cause names the other side of the mistake |

## C8: NAIVE and FIX at lag 0, 6 and 12 (cause@tick, from the lag-captured run's per-play log)

| Stage play | lag 0 / lag 6 / lag 12 |
|---|---|
| LKO-01 fix | lko-parda@942 / lko-parda@1010 / lko-parda@1012 |
| LKO-01 naive | lko-than@658 / lko-than@686 / lko-than@730 |
| LKO-02 fix | lko-dhakka@343 / lko-dhakka@349 / lko-dhakka@355 |
| LKO-02 naive | lko-pehle@218 / lko-pehle@224 / lko-pehle@230 |
| LKO-03 fix | lko-jali@404 / lko-jali@674 / lko-jali@537 |
| LKO-03 naive | lko-chhapa@141 / lko-chhapa@147 / lko-chhapa@153 |
| LKO-04 fix | lko-dhakkan@326 / lko-dhakkan@350 / lko-dhakkan@416 |
| LKO-04 naive | lko-malai@128 / lko-malai@172 / lko-malai@208 |
| LKO-05 fix | lko-tawa@245 / lko-tawa@257 / lko-tawa@281 |
| LKO-05 naive | lko-seekh@99 / lko-seekh@117 / lko-seekh@152 |
| LKO-06 fix | lko-tatkar@383 / lko-tatkar@426 / lko-tatkar@805 |
| LKO-06 naive | lko-chakkar@187 / lko-chakkar@193 / lko-chakkar@199 |
| LKO-07 fix | lko-shamiyana@627 / lko-shamiyana@645 / lko-shamiyana@663 |
| LKO-07 naive | lko-ganj@228 / lko-ganj@234 / lko-ganj@241 |
| LKO-08 fix | lko-kuan@307 / lko-kuan@313 / lko-kuan@319 |
| LKO-08 naive | lko-bhool@120 / lko-bhool@126 / lko-bhool@132 |
| LKO-09 fix | lko-hawa@1836 / lko-hawa@1868 / lko-hawa@2054 |
| LKO-09 naive | lko-kabootar@147 / lko-kabootar@154 / lko-kabootar@174 |
| LKO-10 fix | lko-tehzeeb@333 / lko-tehzeeb@343 / lko-tehzeeb@355 |
| LKO-10 naive | lko-pehle@273 / lko-pehle@279 / lko-pehle@285 |

Every NAIVE and FIX dies at lag 0, 6 and 12. In every stage the NAIVE and the FIX die to different causes at different ticks.

What changed for the plays the tester named:
- **LKO-04 fix:** stands on the shady left tile alone, so the lid's flip sinks it.
- **LKO-07 fix:** pauses, then strolls on into the shivering awning. The early awnings now stay deadly 40 ticks instead of 24.
- **LKO-09 naive:** goes on to a roof while the flag is white.
- **`seeti`:** both plays use the route's own hops, so the whistle is what kills (`lko-seeti`@5679, `lko-seeti-jawab`@5489 at lag 0; lag 12 dies of the whistle as well, no longer of `lko-chhat`).
- **`rang` m6:** jumps earlier in the under-phase.
- **`photo` m6:** walks into the group only when no flash is on.
- **`chirag`:** cut.
- **`mehfil`:** lag 12 is `lko-mehfil`@2777 vs `lko-ghungroo`@2779: different causes.

**Two baits a 12-tick-late jump cannot play (the reasons):**
- **`lko07-dukaan` m9** ("over the nala and along the pavement behind him"). The pavement behind the shopper is one tile wide before the sill starts. A low hop pressed 12 ticks late takes off a tile later, so it lands on the sill: the window side, which is the correct play. To keep the bait reachable at lag 12 I would have to widen the open pavement, and then the route's jump from the step could no longer reach the sill. At lag 0 and 6 it dies `lko-dukaan`@5858/5869.
- **`lko10-tasveer` m2** ("waiting right by the group"). At lag 12 the hop over the nala in front of the group carries into the group itself, so the play dies as the rush does (`lko-photo-jaldi`@2343, the same tick as m3). At lag 0 and 6 it dies of the bow, `lko-tehzeeb`@2135/2284. A shorter hop lands in the nala at lag 0 (`lko-nala`, tried and reverted).

## The lag-captured respawn sweep

Method: the tester's own `qa-lko6.test.ts`, copied from `ldd-wt/qa-lko`, with an added `QA6_NOSWEEP` switch for quick play-log runs.
- The route is played at lag 0/6/11/12 and spawn idle 0/37/120/251, and each checkpoint is captured where the lagged run takes it.
- The world is rebuilt by `replay()` at that tick, and 7 plays are run: idle 4 s, run 0.3 s after 0/6/12 ticks, tap-jump after 0/6/12 ticks.

This full run was the last change to play. The one later commit, `4b2abf5`, changes only an intro line.

| Stage | Capture points | Plays | Deaths | Longest stretch | Worst replay per tick (lag 0/6/12) |
|---|---|---|---|---|---|
| LKO-01 | 5 | 560 | 0 | 5.1 s | 4.65 s |
| LKO-02 | 6 | 672 | 0 | 7.3 s | 2.96 s |
| LKO-03 | 7 | 784 | 0 | 9.4 s | 6.57 s |
| LKO-04 | 3 | 336 | 0 | 8.1 s | 7.46 s (m0, lag 6) |
| LKO-05 | 7 | 784 | 0 | 20.9 s | 5.67 s |
| LKO-06 | 12 | 1344 | 0 | 8.0 s | 3.55 s |
| LKO-07 | 13 | 1456 | 0 | 7.8 s | 6.85 s |
| LKO-08 | 15 | 1680 | 0 | 7.1 s | 4.67 s |
| LKO-09 | 22 | 2464 | 0 | 6.3 s | 6.76 s |
| LKO-10 | 12 | 1344 | 0 | 7.0 s | 4.99 s |

That is **0 deaths in 11,424 plays**. Every stretch is ≤ 25 s, and every replay is ≤ 7.5 s per tick at lag 0/6/12.

**4.5-tile probe** (the tester's `qa-lko-walk45`): every static death is at +4.5 tiles or beyond: 05 is +4.8, 07 `nala` +4.9, 09 +4.7 or more, 10 +4.9.
- The only deaths short of 4.5 tiles are `julus` catching the moving procession (07 cp5 and cp7, 1.3-2.0 s in). The tester graded that polish, not a static edge.

## The probe table: every scripted play at lag 0 (the tester's `qa-lko-rec2`)

These are the 10 routes and 102 plays that must die. The plain doors have no play, because there is nothing to die to. Columns are stage, play, what, cause@tick, and x at death.

| Stage | Play | What | Cause@tick | x |
|---|---|---|---|---|
| LKO-01 | route |  | @1708 | x111.6 |
| LKO-01 | naive |  | lko-than@658 | x39.8 |
| LKO-01 | fix |  | lko-parda@942 | x56.3 |
| LKO-02 | route |  | @2424 | x97.6 |
| LKO-02 | naive |  | lko-pehle@218 | x16.4 |
| LKO-02 | fix |  | lko-dhakka@343 | x15.9 |
| LKO-02 | m0 | in the gali, walking on when the man offers the way | lko-pehle@722 | x45.1 |
| LKO-02 | m1 | at the stand-off, walking into him | lko-pehle@1334 | x76.4 |
| LKO-02 | m2 | at the stand-off, bowing once and going, as learned | lko-takrar@1367 | x76.4 |
| LKO-03 | route |  | @3022 | x143.6 |
| LKO-03 | naive |  | lko-chhapa@141 | x11.2 |
| LKO-03 | fix |  | lko-jali@404 | x17.1 |
| LKO-03 | m0 | stopping on the jali in the middle of the second vat | lko-jali@1035 | x50.4 |
| LKO-03 | m1 | walking straight on to the door over the cloth | lko-chhapa@2920 | x139.3 |
| LKO-03 | m2 | at the door, waiting on a white flower for the second wash, as the room taught | lko-balti@3116 | x139.8 |
| LKO-03 | m3 | on the frame, waiting on the next flower ahead | lko-adda@1485 | x83.3 |
| LKO-03 | m4 | on the frame, walking on off the hoop | lko-kunda@1358 | x78.9 |
| LKO-03 | m5 | the dyer: waiting on a stitched flower in his half, as learned | lko-rang@2959 | x121.0 |
| LKO-03 | m6 | the dyer: hopping on to his half while it is under | lko-rang-kood@2567 | x121.1 |
| LKO-03 | m7 | at the first vat, stepping on the print and stopping | lko-chhapa@870 | x35.5 |
| LKO-04 | route |  | @1279 | x73.7 |
| LKO-04 | naive |  | lko-malai@128 | x7.3 |
| LKO-04 | fix |  | lko-dhakkan@326 | x12.2 |
| LKO-04 | m0 | waiting at the start of the lane while the shadows shrink | lko-malai@1430 | x38.1 |
| LKO-05 | route |  | @5145 | x181.6 |
| LKO-05 | naive |  | lko-seekh@99 | x7.0 |
| LKO-05 | fix |  | lko-tawa@245 | x6.1 |
| LKO-05 | m0 | down the long tawa, hopping straight off the first full heap | lko-seekh@824 | x35.9 |
| LKO-05 | m1 | down the long tawa, waiting on a flat one for it to squash, as on the full ones | lko-tawa@943 | x37.9 |
| LKO-05 | m2 | in the low lane, hopping, as on the heaps | lko-seekh@1390 | x60.4 |
| LKO-05 | m3 | in the low lane, lingering on the squashed lane | lko-tawa@1552 | x61.3 |
| LKO-05 | m4 | under the half-hoisted rack: hopping off a full heap, as all along | lko-seekh@3196 | x126.9 |
| LKO-05 | m5 | the cook’s slab: standing on its end to squash it, as learned | lko-kafgir@2156 | x92.4 |
| LKO-05 | m6 | the cook’s slab: walking up it to meet him | lko-seekh@1893 | x93.4 |
| LKO-05 | m7 | under the low rack: waiting for the heap to squash, as learned | lko-tawa@2924 | x121.1 |
| LKO-05 | m8 | under the low rack: hopping while it is down | lko-seekh@2615 | x119.6 |
| LKO-05 | m9 | under the ladle: waiting on a heap for it to squash, as all along | lko-ghee@3433 | x135.1 |
| LKO-05 | m10 | under the ladle: hopping on from a crusted heap | lko-seekh@3332 | x136.2 |
| LKO-05 | m11 | the turning skewers: waiting till they lie still before hopping, as with a still rack | lko-seekh@3899 | x152.4 |
| LKO-05 | m12 | the turning skewers: staying on a heap till it all looks safe | lko-tawa@4121 | x153.7 |
| LKO-06 | route |  | @4473 | x157.7 |
| LKO-06 | naive |  | lko-chakkar@187 | x14.6 |
| LKO-06 | fix |  | lko-tatkar@383 | x22.4 |
| LKO-06 | m0 | in the mehfil, crossing her floor | lko-mehfil@2519 | x106.3 |
| LKO-06 | m1 | in the mehfil, stepping down on to the red strip as she goes away | lko-ghungroo@2503 | x107.8 |
| LKO-06 | m2 | over her patch, landing on a red strip | lko-chakkar@1555 | x56.3 |
| LKO-06 | m3 | walking into her tatkar patch | lko-tatkar@614 | x37.9 |
| LKO-06 | m4 | the guru: pressing on the old way after her stamp, as on every stage so far | lko-ghungroo@1915 | x66.6 |
| LKO-06 | m5 | the guru: stopping after each stamp to work out which way is which | lko-chakkar@1904 | x77.4 |
| LKO-07 | route |  | @6105 | x265.6 |
| LKO-07 | naive |  | lko-ganj@228 | x9.1 |
| LKO-07 | fix |  | lko-shamiyana@627 | x45.4 |
| LKO-07 | m0 | behind the procession, keeping the rhythm of the first three nalas | lko-julus-nala@4473 | x191.0 |
| LKO-07 | m1 | rushing up behind the slow procession | lko-julus@3042 | x156.7 |
| LKO-07 | m2 | hopping the nala straight on to the procession’s heels | lko-julus@3035 | x156.4 |
| LKO-07 | m3 | following the lamplighter close behind | lko-seedhi@1482 | x93.6 |
| LKO-07 | m4 | at dusk, running the row without a stop, as the old awnings taught | lko-shamiyana@619 | x45.4 |
| LKO-07 | m5 | at dusk, through the awnings as they shiver, then running on now they are behind you | lko-ganj@1201 | x74.0 |
| LKO-07 | m6 | at the photograph, pausing so they part, as the strollers taught | lko-photo@5372 | x223.1 |
| LKO-07 | m7 | at the photograph, rushing them | lko-photo-jaldi@5168 | x209.4 |
| LKO-07 | m8 | at the second camera, going on the test flash | lko-photo-test@5553 | x222.3 |
| LKO-07 | m9 | the window-shopper: over the nala and along the pavement behind him, as the open side | lko-dukaan@5858 | x239.3 |
| LKO-07 | m10 | the window-shopper: waiting on the step for him to finish | lko-shamiyana@5849 | x236.8 |
| LKO-07 | m11 | the lamplighter: going under while he is up, then waiting there under the ladder | lko-seedhi-utar@1703 | x92.2 |
| LKO-08 | route |  | @4549 | x269.6 |
| LKO-08 | naive |  | lko-bhool@120 | x11.6 |
| LKO-08 | fix |  | lko-kuan@307 | x23.3 |
| LKO-08 | m0 | on the pachisi court, hopping on square after square | lko-kuan@606 | x43.6 |
| LKO-08 | m1 | on the court, taking every lit square of a big throw | lko-goti@1519 | x67.0 |
| LKO-08 | m2 | jumping through the hanging arch up close, as everywhere | lko-bhool@2727 | x144.3 |
| LKO-08 | m3 | walking through the hanging arch | lko-kuan@2830 | x149.8 |
| LKO-08 | m4 | in the vault, walking on through the well arch too | lko-kuan@2821 | x149.8 |
| LKO-08 | m5 | on the gallery, jumping on through its arch, as everywhere | lko-bhool@2949 | x171.3 |
| LKO-08 | m6 | on the gallery, walking off its end, as at the hanging arch | lko-kuan@3343 | x200.2 |
| LKO-08 | m7 | in the vault, jumping at the first arch from the floor, as everywhere | lko-bhool@1979 | x87.8 |
| LKO-08 | m8 | in the vault, walking on along the floor | lko-kuan@1971 | x87.2 |
| LKO-08 | m9 | in the dark, walking on to the next patch of light | lko-roshandan@4143 | x248.5 |
| LKO-08 | m10 | in the dark, keeping off the light and walking on | lko-kuan@4088 | x244.5 |
| LKO-08 | m11 | the broken arch: walking the whole one, jumping the one at the floor’s end, as the maze taught | lko-toota@2359 | x114.3 |
| LKO-08 | m12 | the broken arch: walking on through both | lko-kuan@2358 | x114.1 |
| LKO-08 | m13 | the whispering gallery: up on the ledge by the handrail, as anyone would | lko-sargoshi@3862 | x231.4 |
| LKO-08 | m14 | the whispering gallery: running the middle, never mind the light coming up | lko-roshandan@3753 | x221.1 |
| LKO-08 | m15 | the hall door: jumping at the arch you saw before the door | lko-kuan@3444 | x200.2 |
| LKO-08 | m16 | the hall door: hopping over it, so nothing moves | lko-bhool@3435 | x199.2 |
| LKO-09 | route |  | @7324 | x236.6 |
| LKO-09 | naive |  | lko-kabootar@147 | x8.4 |
| LKO-09 | fix |  | lko-hawa@1836 | x69.1 |
| LKO-09 | m0 | jumping for the reflection from the usual distance | lko-aks@1549 | x54.6 |
| LKO-09 | m1 | walking up to the white dome | lko-gumbad@1225 | x38.1 |
| LKO-09 | m2 | jumping for the dome from far back, where it looked big | lko-gumbad-uncha@1238 | x37.5 |
| LKO-09 | m3 | two flags: watching the one behind you the whole way, as on the last roofs | lko-jhanda-aage@4052 | x132.4 |
| LKO-09 | m4 | two flags: watching the one ahead from the start | lko-jhanda-peeche@3395 | x108.1 |
| LKO-09 | m5 | the whistle duel: crossing on the red flag, as on the first roofs | lko-seeti@5679 | x166.0 |
| LKO-09 | m6 | the whistle duel: going on past the tank roof once your flyer has called | lko-seeti-jawab@5489 | x179.8 |
| LKO-09 | m7 | the tumblers: waiting for the falling birds to clear, as birds coming down taught | lko-girah@6146 | x199.4 |
| LKO-09 | m8 | the tumblers: crossing on the white, taking the landing for a tumble | lko-kabootar@6196 | x199.1 |
| LKO-09 | m9 | the flag in the wind: for the last roof, still crossing while you see white, though he is in front now | lko-hawa-ulta@2776 | x93.1 |
| LKO-10 | route |  | @4631 | x213.6 |
| LKO-10 | naive |  | lko-pehle@273 | x20.4 |
| LKO-10 | fix |  | lko-tehzeeb@333 | x13.8 |
| LKO-10 | m0 | the court again: taking the square the courtier bows you on to | lko-goti-pehle@1646 | x58.8 |
| LKO-10 | m1 | the court again, hopping square after square | lko-kuan@752 | x43.6 |
| LKO-10 | m2 | the photograph again: waiting right by the group, as on the Ganj | lko-tehzeeb@2135 | x88.4 |
| LKO-10 | m3 | the photograph again: rushing them | lko-photo-jaldi@2035 | x86.3 |
| LKO-10 | m4 | the greeting again: bowing back right where he greets you, as learned | lko-tehzeeb@2538 | x107.3 |
| LKO-10 | m5 | the greeting again: walking on past it, over the covers | lko-aadaab@2498 | x113.4 |
| LKO-10 | m6 | the grain: crossing on the red flag, as on the roofs | lko-daana@2966 | x128.6 |
| LKO-10 | m7 | the grain: hopping over the feeding birds | lko-daana-udaan@2998 | x128.5 |
| LKO-10 | m8 | the guru again: pressing the other way after her stamp, as 06 taught | lko-ghungroo@3993 | x148.7 |
| LKO-10 | m9 | the guru again: stopping after her stamp to see which way is which | lko-chakkar@3983 | x159.3 |
| LKO-10 | m10 | the hall door again: stopping on arrival to look again, as in the maze | lko-tehzeeb@4321 | x182.7 |
| LKO-10 | m11 | the hall door again: jumping where the arch moved to in the maze | lko-kuan@4415 | x196.2 |

## Checks

All of these ran once each at the end, one heavy run at a time. Scratch tests were moved out first.
- `npm run typecheck`: clean.
- `npm test`: **1823 passed, 20 skipped** (1843) across 18 files. It went down from 1851 because cut acts take their tests with them.
- `vitest cpsafe -t LKO`: 10 passed.
- `LDD_N=80 npm run fair -- LKO`: 6t 100% and 12t 100% on all ten stages; every stretch at 0-12t is 95-100%.
- `node scripts/flows.mjs`: "no errors".

## Sheets

I re-shot the route sheets for the changed stages (02, 04, 05, 06, 07, 08, 09, 10) and copied them to `reports/cities/lko/shots/r6/`. I read 09 and 10:
- **09:** the four-roof hawa reads, and the flyer standing on the end roof is visible on the last crossing.
- **10:** the six callbacks read, and the plain door is a plain EXIT door.

I did not read the other six sheets frame by frame this round.

## Tip

**`4b2abf5`.**

Not done or not checked:
- I did not read every re-shot sheet frame by frame.
- The `dukaan` and `tasveer` lag-12 baits have the reasons above instead of a fix.
- Unused helper functions for the cut acts remain in `tests/cities/lko.ts`, though their routes are removed. Some of those helpers read flags by the cut ids, so a `git grep` of the ids still finds hits there.
- Their cause lines remain in `causes.ts`, unreferenced.
