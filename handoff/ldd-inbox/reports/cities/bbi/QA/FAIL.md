# BBI · Bhubaneswar: independent QA, round 1: FAIL

Tester: a fresh QA chat on another model; I never saw the builder's chat and wrote none of BBI. Subject: `city/bbi` at
**71df6f8**, in my detached worktree `/local/home/saiposh/personal/ldd-wt/qa-bbi`. Nothing committed or pushed. My
scratch probes are untracked under `tests/qa/` there, and copied here as `QA/*.test.ts.txt`.

**Pre-rulings applied, not re-judged:** the honest route times in LENGTH-5 (07 99.3 s, 09 58.7 s, 08 46.6 s and the rest);
the unbuilt 02 keeper and 05 bait breaks; 18-tick columns parked; KEEP on tantu/ganna and kachha/gadiba; W6 (02 `dive`,
03 `gali` and `mela`, 09 `ratha` are their rooms' second windows); I5 (husking lever is BBI's); I9 (`gum-ta` cut).

**Verdict: FAIL.** The suite, cpsafe, fairness, flows, the lag-captured sweep and the per-tick replay all pass and match
the builder's numbers. What fails:
- **F1, law 9:** 19 of the finale's death plays show a death line that teaches the old stage's rule, which is the advice
  that just killed the player; 3 more in 06/07 name the wrong mistake.
- **F2, in-stage repeats:** `bbi09-asta` = `bbi09-udaya`; `bbi09-ghoda` = the 09 room; `bbi08-dui` = the 08 room;
  `bbi07-dweepa` = `bbi07-mardala`; `bbi07-shrinkhala` = `bbi07-bandha`'s labelled momentum half.
- **F3, repeats of other cities:** `bbi05-tenda` is the lift class `kvt05-lift` owns (S3).
- **F4, doors:** `bbi-pose-gate` and `bbi-motif-door` re-ask their rooms; `bbi-ribbon-snip` is "cross between cycles"
  (BLR-08 `spikes`, and BBI-04's own torch bursts); `bbi-leaf-plate` is the S3 ride-and-step-off-before-the-end thought.
- **F5, law 7:** the BBI-10 room replays 02's keeper and 09's hub as taught; nothing in it breaks.
- **F6, two plays under lag:** four pairs collapse to one cause at lag 6 or 12; 6 baited plays die to another cause and 12
  stall before their bait at lag 6 or 12.
- **F7, 4.5 tiles:** BBI-05 cp6 (x124.5) is 4.2 tiles from the khala hand mill.
- **F8 (minor), BBI-01:** the tour's NAIVE and FIX die to the same cause and line (`bbi-nala`).

## What I ran (all my own runs, on node 22.23.2; the default node 18 cannot start vitest)

| Check | Command | Result |
| --- | --- | --- |
| Typecheck | `npx tsc --noEmit` | clean (exit 0) |
| Suite | `npx vitest run` | **1873 project tests passed, 0 failed**; 22 skipped (env-gated). The run also picked up my scratch files: 3 passed, 3 failed on their 5 s timeout. 1876 - 3 = 1873, as the builder says. BBI is on no list in `tests/modules.test.ts` (EXEMPT) and `CPSAFE3_PENDING = []`. `QA/suite-summary.txt` |
| cpsafe | `npx vitest run tests/cpsafe.test.ts -t BBI --reporter=verbose` | **10/10 strict** ("idle, run and tap-jump at lag 0/6/12") for BBI-01..10. `QA/cpsafe.txt` |
| Fairness | `LDD_N=80 npm run fair -- BBI` | **100% at 6t and 12t on every stage; every stretch 100%** at 0-12t. 18t (parked): 100/100/88/96/84/88/76/76/76/76. `QA/fair80.txt` |
| Build + flows | `npm run build:single && node scripts/flows.mjs` | built; **"no errors"**. Run with `CHROME_PATH` = cached headless shell 1228, because the worktree's playwright looks for 1254, which is not cached (host issue, also met by the LKO tester). `QA/flows.txt` |
| Every scripted play | `qa-bbi-rec2` (route + NAIVE + FIX + every MISTAKE, lag 0) | 10 routes win; all 152 NAIVE/FIX/MISTAKE plays die at lag 0. `QA/plays-acts.txt` (REC lines) |
| Act list + advice | `qa-bbi-acts` | 10 rooms, 67 acts, 10 doors; route times match LENGTH-5 (01 25.4 … 10 94.9). `QA/plays-acts.txt` |
| Lag-captured sweep + per-tick replay | `QA6=1 QA6_IDLE=0,37,120,251 npx vitest run tests/qa/qa-bbi6.test.ts` (copy of qa-pat's qa6; 07:43:36-07:55:48 UTC) | section 5. `QA/qa6.txt`, `QA/qa6-deaths.txt`, `QA/lagcmp.txt` |
| 4.5-tile probe | `QA45=1 npx vitest run tests/qa/qa-bbi-walk45.test.ts` | section 5. `QA/walk45.txt` |
| Frames | builder sheets in `shots/`, my crop at panel size `QA/qa-07-kachha-71s.png` | section 6 |

## 1. Rulings the brief asked me to verify

| Ruling | Holds? | Evidence |
| --- | --- | --- |
| deck sweeper gone | yes | no `jhadu`/broom/sweeper in `src/game/cities/bbi/` or `tests/cities/bbi.ts` |
| wet sari gone | yes | no `sari` act in 06; 06 acts are tana, sidhi, patta, sutra, rachh, tantu, palaa |
| drum-forecast (`gum-ta`) gone | yes | not in 07's parts or the code |
| husking lever stays | yes | `bbi05-dhenki` (m1 `bbi-sila`@689) and `bbi05-chheli` (m4 `bbi-chheli`@2035, m5 `bbi-sinha`@2198) |
| stadium door = two turf rolls meeting, bare strip safe | yes | advice "stand on the bare strip … wait for both rolls to stop"; m0 `bbi-roll`@2916 (walk on), m1 `bbi-roll-back`@2893 (wait on the grass) |
| tantu/ganna KEEP | yes | tantu m9 "snap the nearest thread" `bbi-tantu`@4617, m10 `bbi-rachh`@4684; ganna m15 `bbi-ganna`@6736, m16 `bbi-dhan`@6795 |
| kachha/gadiba KEEP, waist tell reads first | yes | `QA/qa-07-kachha-71s.png` (633 px wide, about a phone): while the drum still plays, the first pit's boys show white waist knots on bare legs, the second pit's show wide coloured skirts. The tell is on screen before the stop. m22 `bbi-kachha`@8766, m23 `bbi-thrown`@9591 |
| pothi (F468) | yes, as an act | m24 `bbi-pothi`@9697 x347.9 (walk over), m25 `bbi-nacha`@9967 x367.8 (hop hinges, keep going). Different cause, tick and place at lag 0/6/12 |
| finale's six breaks break their rule | yes as acts | ghungur `bbi-nacha`@5532 / `bbi-thrown`@6042; phinga `bbi-badi`@6454 / `bbi-buda`@6772; tantu `bbi-ganthi`@3670 / `bbi-rachh`@3742; palaa `bbi-rachh`@4038 / `bbi-ranga`@3977; ghurni `bbi-ghurni`@7750 / `bbi-chamacha`@7860; chakra `bbi-chakka`@8645 / `bbi-khai`@8658. But see F1 (their death lines) and F6 (phinga, palaa under lag) |

## 2. Findings

### F1. Law 9: the finale's death lines teach the rule the finale just broke
`causes.ts` has one line pair per cause, and the finale reuses the earlier stages' causes. So a player who dies by doing
what the earlier stage taught is told to do it again. Tara says these lines (`props.ts:204`), and TROLL-BIBLE law 9 names
`CAUSE_LINES` plus Tara as the death line. Every row is from my lag-0 recording (cause@tick, act):

| Play (BBI-10) | Cause@tick | The line's advice (verbatim) | Problem |
| --- | --- | --- | --- |
| m2 chheli "wait on the straw for the goat to come back" | `bbi-sinha`@2648 | "Wait on the straw until the goat has crossed back to your side, then jump." | repeats the killing advice |
| m4 chhata "wait on the first cut-out for a customer" | `bbi-rangapani`@2830 | "A parasol only opens when a customer comes … Wait for it." | repeats it |
| m6 patta "walk over the first pit, as before" | `bbi-sadha`@2909 | "The panel by the first pit painted this one" | 06's rule, false here |
| m7 patta "cross the second by the panel you passed" | `bbi-chitra`@3063 | "It shows the next one … use the one you passed." | repeats it; the "what happened" is false |
| m10 palaa "wait for it to come back, as before" | `bbi-rachh`@4038 | "The beater swept the warp, with you on it." | wrong mistake (you were on the bank) |
| m11 palaa "jump out to where it came back last time" | `bbi-ranga`@3977 | "the beat moved your patch. Count the beats" | wrong mistake |
| m12 bagudi "back over the line to pass it on" | `bbi-bagudi`@4589 | "run back over the chalk line to pass it on, then go through." | repeats it |
| m14 pada "wait back by the scuffs, as before" | `bbi-nacha`@5014 | "they were still dancing. Wait for a pose." | does not name the mistake |
| m16 dui-baja "go when the drummer across the pit stops" | `bbi-nacha`@5047 | same | does not name the out-of-step drummer |
| m18 ghungur "jump the bells, walk the quiet, as before" | `bbi-nacha`@5532 | same | does not name the bells |
| m21 thaka "stop it at its top and climb on the stone" | `bbi-pathara`@5962 | "step on its foot plate when the stone is at its top." | repeats it |
| m22 phinga "ride the first, as before" | `bbi-badi`@6454 | "Go on the first throw: hop on to that badi as it lands" | repeats it |
| m23 phinga "wait back, then ride the first in the water" | `bbi-buda`@6772 | "Only the first throw floats. Ride that one, at once." | 08's rule, false here |
| m24 ghurni "hop on at the slow edge, as before" | `bbi-ghurni`@7750 | "hop only at the slow edge." | repeats it |
| m25 ghurni "get on in the middle and wait" | `bbi-chamacha`@7860 | "hop on to the next at its slow edge" | 08's rule, false here |
| m26 deepa "wait for the bridge and walk under the lamps" | `bbi-deepa`@8463 | "the wheel was too high under them … wait for the bridge and walk under." | repeats it; "what happened" is false |
| m28 chakra "wait on the hub for the slam, as before" | `bbi-chakka`@8645 | "start the chariot from the horses, then wait on the hub." | repeats it |
| m30 udaya "on to spoke 1 as soon as it is up" | `bbi-dooba`@9403 | "Wait only until the next spoke is up, then go at once." | 09's rule, false here |
| m31 udaya "jump on for where spoke 2 comes up" | `bbi-udaya`@9076 | "wait on each spoke until the next one is up." | repeats it |

The finale has its own lines only where it has its own causes (`bbi-likhita`, `bbi-ganthi`, `bbi-ghera`, `bbi-kua`), and
those are right. Outside 10: 06 palaa m11 "run at the shuttle and jump on" `bbi-ranga`@4928 and m12 "wait at the edge"
`bbi-rachh`@5268 get the same wrong-mistake lines as m10/m11 above, and 07 dui-baja m6 `bbi-nacha`@3846 gets the generic
"Wait for a pose" (the mistake was following the near drummer).
**What would satisfy me:** a finale cause (or a finale variant of the cause) for each row, whose line names the broken
rule ("Tonight the goat charges the straw when it comes back"), and lines for 06 palaa and 07 dui-baja that name their
mistakes.

### F2. Acts that re-ask their own stage's rule with new numbers
| Act | Same as | Evidence |
| --- | --- | --- |
| `bbi09-asta` | `bbi09-udaya` (same stage) | Both are `risingSpokes()` (`s09.ts:443-444`), dir +1 vs -1. Same advice ("each comes up only once you have stood on the one before. Wait for each"), same two causes: udaya m2 `bbi-udaya`@1392 / m3 `bbi-dooba`@1705; asta m8 `bbi-udaya`@4559 / m9 `bbi-dooba`@5039. udaya is 09's labelled momentum beat (`s09.ts:442`), so asta is a second window of it |
| `bbi09-ghoda` | BBI-09 room | `chariotAct()` with a shorter plinth ("A short chariot and a short slide"). Same causes as the room's NAIVE: m0 `bbi-chakka`@900, m1 `bbi-khai`@913. With `ratha` (W6, also the room again: m4 `bbi-chakka`@3766, m5 `bbi-khai`@3772) the room's decision is asked three times |
| `bbi08-dui` | BBI-08 room | the same `bowl()` (`s08.ts:392-406`) with four badi and two jugs. Its plays die to the room's NAIVE and FIX causes: m6 `bbi-pakhala`@3510 (walk on the rice), m7 `bbi-dhara`@3726 (the pushed-under badi). W6 named `kansa` as this kind of window; `kansa` was cut and `dui` is the same thing |
| `bbi07-dweepa` | `bbi07-mardala` | Both: cross the first troupe's bridge, wait on the island between two troupes for the second bridge. Dweepa's only addition (the second troupe shows a tower first) is the 07 room's "wait for the bridge". The registry's own rows read alike ("wait on the island bank between two troupes"). Its two baits die to one cause: m28 `bbi-nacha`@10932, m29 `bbi-nacha`@11253 |
| `bbi07-shrinkhala` | `bbi07-bandha`, first half | bandha: "its bridge only just lasts the walk, so … go straight over" (labelled "the momentum" at `s07.ts:339`); shrinkhala: "each bridge only lasts the walk over it: once on, keep walking". Same thought; a second momentum window in 07 |

Not counted, noted: `bbi05-khala` replays 05's channel, cart and pit close together; it is 05's only replay window, so I
read it as 05's (unlabelled) momentum beat. `bbi04-karkhana` combines 04's torch and trough (a torch over a trough), which
is a new decision.
**What would satisfy me:** asta, ghoda, dui, dweepa and shrinkhala each recast on a decision 09/08/07 has not asked, or
cut. (I know 07/08/09 are under their floors; that is pre-ruled and not part of this finding.)

### F3. `bbi05-tenda` is the lift class `kvt05-lift` owns
"Step on the bucket, ride it up, and step off on to the wall before it swings back down into the well." Its only death is
m3 "stay on the bucket" `bbi-tenda`@1990. That is S3's class verbatim: "ride the riser, get off at the top before it
overruns into the hazard", ruled 04:58 UTC with `kvt05-lift` (shipped, "jump off at the top: it keeps hauling up into the
pulley") as owner; `gtk02-bhatti` and `ccu09-uthan2` were cut for it. The "start a machine on purpose" part is a break of
05's room, but `bbi05-chakki` already makes that break.
**What would satisfy me:** a conductor ruling that keeps tenda, or a recast whose death is not the lift overrunning.

### F4. Doors
| Door | Decision | Repeat of |
| --- | --- | --- |
| `bbi-pose-gate` (07) | "Wait while they whirl; walk through under the gate as soon as the drum stops." | BBI-07 room ("walk on the moment the drum stops") |
| `bbi-motif-door` (06) | "Only on the motif beat do they part: walk through then." | BBI-06 room ("one in five they line up into the motif") |
| `bbi-ribbon-snip` (10) | "Wait while they close, then walk through as they open." | BLR-08 `spikes` door ("wait for the cycle", shipped); also `gtk-steam-vent`, `ccu-thonga`; and BBI-04's own "pass under it between bursts" |
| `bbi-leaf-plate` (08) | "Ride the plate across, but step off before it reaches the far end: there it turns over." | S3's class (`kvt05-lift`, `pat04-anaaj` "step off at the ledge before the roof"), laid flat |

Doors I pass: turf-roll (ruled), lantern-drop (a one-time drop you trigger: stop short), curl-stair (the bench's hazard is
the stair, a betrayal of 04's room), behind-step (the obvious door is locked, the real one is below), horse-gap (touching
the horse, which 09 taught, closes the gap), wet-lip-drain (tour).
**What would satisfy me:** a new decision at each of the four doors, or a conductor ruling.

### F5. Law 7: the BBI-10 room replays two rules as taught
"Ride the keeper's back pad … puts you down by the stone plinth … jump up on to the wheel's hub as it comes over." Its
NAIVE dies to 02's cause (`bbi-ball`@347, front pad) and its FIX to 09's (`bbi-chakka`@683). Nothing learned is wrong here.
This is the shape the LKO tester counted against `lko10-dhulai`. The pre-ruling covers the missing keeper *break*, not a
room that replays the keeper; if the conductor reads it as covering this, strike F5.
**What would satisfy me:** a room whose keeper or plinth does the opposite of what 02/09 taught, or a ruling.

### F6. Two plays under lag (my qa6 death log, idle 0)
Pairs that collapse to one cause:
| Act | lag | Play A | Play B |
| --- | --- | --- | --- |
| `bbi08-phinga` | 12 | m0 `bbi-buda` x43 tick1852 | m1 `bbi-buda` x43 tick1852 (identical) |
| `bbi10-pada` | 6 / 12 | m14 `bbi-thrown` x226 t5214 / x225 t5409 | m15 `bbi-thrown` x222 t5214 / t5409 (same tick) |
| `bbi05-thaka` | 12 | m8 `bbi-pani` x165 t3572 | m9 `bbi-pani` x165 t3586 |
| BBI-06 room | 12 | NAIVE `bbi-ranga` x10 t140 | FIX skips the shuttle and dies `bbi-ranga` x41 t940 |

Baits that change cause or are not reached: `bbi05-mama` m13 dies `bbi-tenda` (not the uncle) at lag 6 and 12;
`bbi06-rachh` m8 dies `bbi-rachh` (not the shuttle) at 12; `bbi06-tantu` m10 and `bbi10-tantu` m9 die `bbi-ranga` at 12;
`bbi10-phinga` m23 dies `bbi-pakhala` at 12; `bbi07-jodi` m12 dies `bbi-thrown` at 6/12. Scripts that stall (no death,
"stuck"): BBI-05 m0, m1 (lag 6, 12), m2, m15, m16 (12), m7 (6); BBI-09 m0, m1, m4, m5, m6 (12); BBI-10 m29 (12). A stall
means the lagged player never got to play the bait, so I cannot say the bait kills at that lag.
**What would satisfy me:** each pair dying to two causes at two ticks at lag 0, 6 and 12, and each stalled play reaching
its bait (or a written reason that lag cannot play it, as the LKO round accepted).

### F7. BBI-05 cp6 is 4.2 tiles from the khala mill
From cp6 (x124.5, where the route takes it), a plain walk and a tap-walk both die to `bbi-jaanta` at **+4.2 tiles**
(0.62 s). Every other death in the probe is at +4.7 or more (an overshoot past the 4.5-tile stop, not counted).
**What would satisfy me:** cp6 at least 4.5 tiles before the mill, with the sweep still at 0.

### F8 (minor). BBI-01: NAIVE and FIX die to the same cause and line
NAIVE `bbi-nala`@353 x29.7 (first gardener's wet tile), FIX `bbi-nala`@1671 x72.7 (second gardener's wet lip), the
same at lag 6/12. The places and traps differ, but the cause and its line are one, so the FIX player is told "Go while
the gardener faces his pots", which is what they did. **Satisfied by:** a lip cause with its own line.

## 3. Decision sweep (one sentence per part; R = repeat, ok = new)

| Stage | Part | Decision | Verdict |
| --- | --- | --- | --- |
| 01 | room (tour) | the hose follows a walker and wets the tile into the drain: go while he faces his pots, hop from the tile before the wet lip | ok (F8 on its line) |
| 02 | room | ride the keeper's back pad, stay until the rebound comes back | ok |
| 02 | corner | cross while the stopped ball sits still | ok |
| 02 | dive | the room again | W6 (ruled) |
| 02 | chhal | the first corner is a dummy: hop the running ball, cross on the next | ok |
| 02 | door turf-roll | two rolls meet: wait on the bare strip | ok (ruled) |
| 03 | room | parasols open only for a customer; stand on the cut-out; the third sells his | ok |
| 03 | gali, mela | the room again (reversed order; last one sells) | W6 (ruled) |
| 03 | door lantern | stop short, let it drop and rise | ok |
| 04 | room | standing still solders a curl: keep moving under torches, stand to build at troughs | ok |
| 04 | karkhana | a torch over a trough: wait out its burst before building past | ok |
| 04 | door curl-stair | the bench wall is the stair | ok |
| 05 | room | Raja: touch nothing | ok |
| 05 | dhenki | the pounder is not a plank; the stone is not a stair | ok (I5) |
| 05 | gadi | climb the cart and the bullocks pull you into the beam | ok |
| 05 | tenda | ride the lift, off at the top | **R F3** (`kvt05-lift`, S3) |
| 05 | chheli | wait for the goat to cross back | ok |
| 05 | khala | 05's own pieces close together | momentum (noted) |
| 05 | thaka | stop the sweep at its top | ok |
| 05 | patra | written leaves hold | ok |
| 05 | bail | touch the cart, then follow well behind | ok |
| 05 | mama | start a bait machine for the uncle | ok |
| 05 | ganna | knock off the shared belt first | ok (ruled) |
| 05 | chakki | start the mill on its far half | ok |
| 05 | door behind-step | the real door is under the verandah | ok |
| 06 | room | cross on the motif beat after the shuttle | ok |
| 06 | tana | the shuttle comes back too | ok |
| 06 | sidhi | the motif is a stair (labelled momentum) | ok |
| 06 | patta | each panel paints the next pit | ok |
| 06 | sutra | a hole in the motif | ok |
| 06 | rachh | the beater sweeps at the beat's end | ok |
| 06 | tantu | snap the plain thread | ok (ruled) |
| 06 | palaa | the shuttle box runs from you: jump on where it is | ok (F1 line) |
| 06 | door motif | walk through on the motif beat | **R F4** (06 room) |
| 07 | room | go the moment the drum stops; the restart throws | ok |
| 07 | mardala | two troupes, two drummers: wait on the bank | ok |
| 07 | deepa | lamps over the wheel: take the bridge | ok |
| 07 | bandha | the bridge only lasts the walk (momentum); the wheel to a high bank | ok |
| 07 | dui-baja | follow the far drummer | ok (F1 line) |
| 07 | bagudi | be tagged, pass it back over the line | ok |
| 07 | pada | the tower falls towards you: wait back | ok |
| 07 | jodi | the half that stopped first rises first | ok |
| 07 | gadiba | on the roll, walk with the turn | ok (ruled) |
| 07 | hulahuli | only a cheered pose holds | ok |
| 07 | sajaghara | the tent is safe while they dance | ok |
| 07 | ghungur | jump where the bells ring | ok |
| 07 | kachha | tucked waists roll: let that stop go | ok (ruled, tell reads) |
| 07 | pothi | stand on leaf ends, hop hinges, wait at the top end | ok |
| 07 | shrinkhala | keep walking, the bridge only lasts the walk | **R F2** (bandha) |
| 07 | dweepa | wait on the island between two troupes | **R F2** (mardala) |
| 07 | door pose-gate | go through at the stop | **R F4** (07 room) |
| 08 | room | on a badi before the jug tips; not the one the second jug sinks | ok |
| 08 | phinga | ride the first, soft throw at once | ok |
| 08 | bhanwar | hop for the rim at the last moment | ok |
| 08 | dati | let your badi plug the hole | ok |
| 08 | dui | the room's bowl, four badi and two jugs | **R F2** (08 room) |
| 08 | ghurni | hop only at the slow edge | ok |
| 08 | door leaf-plate | off before the end turns over | **R F4** (S3) |
| 09 | room | start the chariot, wait on the still hub | ok |
| 09 | ghoda | the room, shorter | **R F2** (09 room) |
| 09 | udaya | rising spokes: wait for each (labelled momentum) | ok |
| 09 | ratha | the room again | W6 (ruled) |
| 09 | ulta | the plinth sinks after the slam: straight up the wall | ok |
| 09 | asta | rising spokes again, downhill | **R F2** (udaya) |
| 09 | ara | sinking spokes: climb steadily | ok |
| 09 | door horse-gap | don't touch the horse; jump into the gap | ok |
| 10 | room | keeper's pad to the plinth, up to the hub | **F5** (no break) |
| 10 | patra, chheli, chhata, patta, tantu, palaa, bagudi, pada, dui-baja, ghungur, thaka, phinga, ghurni, deepa, chakra, udaya, tana | each breaks its stage's rule (written rots; goat charges on return; parasols fold for buyers; panel paints its own pit; plain thread holds; shuttle waits; "it" passes; tower falls away; near drummer leads; bells over empty floor; stop the sweep low; server slows; middle is slow; ride the wheel over the lamps; hub slides, rim stays; spokes rise while you wait; no shuttle, go at the bridge) | ok as acts (law 7 holds); F1 on their lines |
| 10 | door ribbon-snip | walk through between snips | **R F4** (BLR-08 `spikes`) |

## 4. Padding
No act is one window repeated many times (the longest repeat run is 07 shrinkhala's three troupes, one read). The padding
problem is per stage, F2: 09 asks "wait on the hub" three times (room, ghoda, ratha) and "wait for the rising spoke" twice
(udaya, asta); 07 has two "the bridge only lasts the walk" windows (bandha, shrinkhala).

## 5. Sweep, replay, stretches, 4.5 tiles (my runs)
qa6, route at lag 0/6/11/12 × idle 0/37/120/251, each checkpoint captured where the lagged run takes it, then idle 4 s,
run 0.3 s after 0/6/12 ticks, tap-jump after 0/6/12 ticks:

| Stage | Capture points | Plays | Deaths | Longest stretch | Worst replay (s) |
| --- | --- | --- | --- | --- | --- |
| BBI-01 | 6 | 672 | 0 | 12.9 | 2.92 (fix) |
| BBI-02 | 4 | 448 | 0 | 8.4 | 3.38 (fix) |
| BBI-03 | 3 | 336 | 0 | 9.5 | 7.24 (m0, lag 12) |
| BBI-04 | 4 | 448 | 0 | 12.7 | 2.81 (fix) |
| BBI-05 | 17 | 1904 | 0 | 10.2 | **7.26** (m3, lag 12) |
| BBI-06 | 8 | 896 | 0 | 9.4 | 5.72 (m10, lag 12) |
| BBI-07 | 19 | 2128 | 0 | 9.4 | 7.03 (m30, lag 12) |
| BBI-08 | 6 | 672 | 0 | 13.2 | 6.21 (m2) |
| BBI-09 | 7 | 784 | 0 | **22.5** | 5.85 (m9, lag 12) |
| BBI-10 | 19 | 2128 | 0 | 12.2 | 7.13 (m0, lag 6) |

**0 deaths in 10,416 plays; worst per-tick replay 7.26 s (under 7.5); longest stretch 22.5 s (under 25).** These match
the builder's round 5/6 claims (07 7.03, 10 7.13). The 4.5-tile probe is clear everywhere except F7.

## 6. HWIK, sheets, place and lines
- **HWIK:** 05 (Raja) and 08 (Pakhala) are the registry's HWIK stages; the bible also marks the talapatra (now
  `bbi05-patra`). 05's first frame says "every machine in the village sits still" and the machines are drawn idle; 08's
  first frame shows the left jug already tilted over the settled rice; patra's soot reveal is the tell, and you wait for it.
  All read from the first frame.
- **Sheets:** I read the builder's 10 sheets (`shots/BBI-0x-sheet.png`, each panel about 630 px wide) and cropped 07 at
  71.5 s at its own size. Nothing decorative sits in Dad's row on the sheets I read (05, 07, 08). I made no new frames.
- **Place:** hockey, chandua appliqué, tarakasi, Raja, bandha, Gotipua, pakhala, the Konark wheel and the inauguration are
  all Bhubaneswar/Odisha things a local would know.
- **Lines** (all under 8 words, none mean): "Namaskara", "Dhanyabad", "Bahut bhala", "Ruha", "Dekhi ki chala", "Mote
  bhulibe nahin", "Dukhi huantu nahin", "Chala bajar jiba", "Subha jatra", "Sabu subha hau", "Niaan" look right to me;
  **unverified by me:** "Ethare garam hue", "Chala ame mishiki khaiba", "Tikie aaste kuhantu", "Paati karantu nahin",
  "Daya kari authare", "Dad bujhi paru nahi". Not failed on.

## To re-test I will need
The new tip; a short note per finding (what changed); and the same commands: suite, cpsafe, fair N=80, qa6, walk45,
plays log. My probes stay untracked in `ldd-wt/qa-bbi/tests/qa/`.

## Not checked
Touch on a phone, audio, real human play (bots and the timing model only), and new frames of my own. The registry
check against other cities is by the rows I could grep (doors, lift class, cycles); a full read of all 900 rows was not
done. Odia lines are not verified with a native source.
