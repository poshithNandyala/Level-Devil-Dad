# SVP fix round 3 (QA FAIL-2, F1-F5)

Branch `city/svp`, tip `3e6d9eb5c99385fcc09560c75de77e83ff8956fc`, on from e762988. No push, no version bump, no shared file touched. The restart killed my first full-suite run; its output was discarded and the suite, cpsafe, fair, flows and sheets were rerun one at a time afterwards.

## Per finding

| Finding | Before (e762988) | After | Commit |
|---|---|---|---|
| **F1** four doors | turtle, wasps' nest, bell, wall, each matched a registry row (PDY-06, BLR-05, a lock with no wrong answer, TVM-08) | **all four are plain doors**, ids unchanged: `svp-note-door` (05), `svp-bough-door` (06), `svp-ticket-window` (07), `svp-frame-door` (09). The road ends at the door and the door is the way out; the in-game hint says so. No door death plays remain for them. Why plain: the gate table below. | ffe27be (the doors), 67f4be6 (their ending policies) |
| **F2** pul | NAIVE `svp-grey`@818, FIX `svp-eent2`@890 (walk brick) | **pul is cut to its one creek**: the grey root is its only trap (`svp-grey`@818, the line names the grey root). No trap after "green roots only" passed the gate (table below), so it is not given a FIX; the probe table marks it `ONE TRAP` on purpose. 09's stage FIX is now `svp09-nali`'s "walk under both arches" (`svp-nali`@1182) against the stage NAIVE `svp-eent`@138: a different cause and tick, and nobody walks brick any more. | ffe27be |
| **F3** dekho | NAIVE nazar@832, FIX nazar3@983 (the room's fade) | **dekho is cut.** 05 stands on its room, `ooncha` and `choona` (second wall = the stage's labelled momentum beat). Nothing passed the gate as its own second trap (table below). 05 is 25.6 s. | ffe27be |
| **F4** saman | NAIVE bheed@4336, FIX saman2@4214 (a tell-read floor that goes at the call) | **`svp10-saman` is cut** (the act, `saman2` and the loose-bag floor are gone). No FIX off 07's rule and off a tell-read floor passed the gate. The finale is `nadi`, `jad`, `nali`, `ghat`. 10 is 50.6 s. | ffe27be |
| **F5** magar4 | "You read the ripples at the first gaps and then went back to the board. Keep reading the ripples" | see the line below; the still crocodile now shows a ridged back, a snout and two eyes with dark rims | ffe27be, 3361d59 |

### The `svp-magar4` death line

> Magarmachh! The water was still at the last gap, but a crocodile that lies still shows only its eyes, and you jumped over the one that was there.
> No ripples does not mean no crocodile. Look along the water for two yellow eyes at the surface, and wait until it has swum off before you jump.

The first sentence names what killed them (the still crocodile, its eyes, the jump over it). The second does not repeat the board or ripples advice that killed the earlier plays; it gives the wait.

### The still crocodile at phone size

Round 2 drew two 2.4 px eyes and a 36x5 patch. I shot `shots6/SVP-10-nadi-probe.png`: at the sheet scale (633 px per frame, about a phone held landscape) it did **not read**; the last gap showed only water. I changed it (`3361d59`): a 44 px dark-green hump with four ridge bumps above the surface, a snout, and two 3x3 yellow eyes on 5x5 dark squares. `shots6/SVP-10-still-croc.png` (frames 13.7 s to 19.3 s): at the same scale the ridged back with two yellow dots reads as a crocodile lying by the last log, beside the surface line, while the stuck board and the roaming croc's ripples are elsewhere. It is small but legible, and it is a body, not a signpost: no arrow, no glow, no label.

## The gate table (DECISIONS.md lists 1-2, v3, v3.1, the archetype table in section 4, SVP's own rows, and SVP-IDEAS-2.md)

I looked first at what is unbuilt. SVP-IDEAS-2.md has 11 candidates: 1 hose (built), 2 moving-anchor hose (struck as a twin of 1, DECISIONS 5d), 3 arch shelter (F491, refused in LENGTH-3), 4 weight belt (built), 5 bent pole (refused in LENGTH-3: the jump aim is 1.25 tiles wide, 3.5 to 4.75, narrower than a 12-tick lag), 6 eave (built), 7 flat tin roof (the alternate of 6, same family), 8 rain shadow (built), 9 bollard brace (struck: B13 refuge, `ccu10-phire`), 10 dragged bag (struck as a twin of 1), 11 three-language call (rejected: a readability add). Nothing unbuilt and legal is left. The free archetypes (section 4 lists 13: B5, B12, B13, B16, B18, B19, B20, B21, B24, B29, B30, B33, B40) are all either assigned to another city in v3 (B5 DIS-02, B13 DIS-06, B16 KVT-09 by ruling V1, B18 DIS-05, B19 DIS-07, B20 DIS-06, B21 BBI-08, B29 BBI-06, B30 LKO-08), or not a decision (B33 identity swap is a render trick, B40 is an optional secret, B24 is an input change), or the class already asked (B12 "never pause" is "floor gives way when you stop"; PDY-04). One door per stage was allowed 15 minutes; each ended here without a candidate.

| Part | Sentence tried | Closest row | Verdict |
|---|---|---|---|
| 05 door | "Find the note's picture of the door." (candidates from SVP-IDEAS-2: none unbuilt); B33 "you are the door" | B33 is a render swap with no decision (allocator, ALLOCATION v3 line 740) | **plain door** |
| 06 door | Tedha, the bent pole | refused in LENGTH-3 (jump aim 3.5 to 4.75 tiles is narrower than a 12-tick lag moves the take-off) | **plain door** |
| 07 door | arch, moving-anchor hose, dragged bag | F491 refused; SVP-2 and SVP-10 struck as twins | **plain door** |
| 09 door | bollard brace; B13 refuge | struck: B13 refuge = `ccu10-phire`, assigned DIS-06 | **plain door** |
| pul FIX | "green roots only", then a green root that drops (fake floor with a tell); a lintel that falls when you stand under it (floor gives way when you stop); a stair of green roots up and down (the room's rule again, the padding cut in round 4) | all three are asked (the registry's own calibration: a float that drops when you land = fake floor with a tell) | **none passes; pul has one trap** |
| dekho own trap | a second view where the footprints are on the far side of the gap, or the bench is the answer | the 05 room's rule, new numbers (the QA's own reading); the fade is the room's | **none passes; cut** |
| saman FIX | a trap that is neither 07's rule nor a tell-read floor: the returning crowd (PAT-04, cut by B1), a bag that goes at the call (07 room), a tall stack that moves (a lift, asked) | each is asked | **none passes; cut** |

## Honest route times (bot, seconds)

| | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| FIX-2 (e762988) | 30.1 | 25.8 | 29.1 | 20.6 | 31.0 | 19.7 | 30.9 | 86.8 | 27.0 | 57.9 |
| Now | 30.1 | 25.8 | 29.1 | 20.6 | **25.6** | **19.1** | **30.4** | 86.8 | **21.4** | **50.6** |

(06 and 07 move only by their now plain doors.) Pars re-run (`LDD_PAR`): 05 35, 06 26, 07 41, 09 29, 10 68.

## Probe table 1 (script-made, `probes/table1-fix3.md`, parts and acts read from each stage's `parts`)

Only the changed stages are repeated here; 01-04 and 08 are as in FIX-2 and unchanged. Plain doors show "plain door, no idea (ruled)".

| Stage | Part | Label | Scripted deaths cause@tick | Verdict |
|---|---|---|---|---|
| SVP-05 | STAGE PAIR | | svp-nazar@190; svp-chuna@1322 | ok |
| SVP-05 | svp05-ooncha | | svp-nazar@772; svp-nazar2@705 | ok |
| SVP-05 | svp05-choona | momentum (second wall) | svp-chuna@1322; svp-chuna2@2295 | ok |
| SVP-05 | door | | none | plain door, no idea (ruled) |
| SVP-06 | door | | none | plain door, no idea (ruled) |
| SVP-07 | door | | none | plain door, no idea (ruled) |
| SVP-09 | STAGE PAIR | | svp-eent@138; svp-nali@1182 | ok |
| SVP-09 | svp09-pul | | svp-grey@818 | **ONE TRAP** (ruled, F2) |
| SVP-09 | svp09-nali | momentum (stretch 2) | svp-nali@1182; svp-nali2@1593 | ok |
| SVP-09 | svp09-patta | | svp-hull@2091; svp-pankha@2173 | ok |
| SVP-09 | door | | none | plain door, no idea (ruled) |
| SVP-10 | STAGE PAIR | | svp-hiran4@689; svp-magar3@1273 | ok |
| SVP-10 | room (the mill) | | svp-hiran4@689; svp-kichad@726 | ok |
| SVP-10 | svp10-nadi | | svp-magar3@1273; svp-magar4@2712 | ok |
| SVP-10 | svp10-jad | | svp-eent3@3405; svp-eent4@3666 | ok |
| SVP-10 | svp10-nali | | svp-nali@4191; svp-nali2@4602 | ok |
| SVP-10 | svp10-ghat | | svp-hiran3@5277; fell@4969 | ok |
| SVP-10 | door | | none | plain door, no idea (ruled) |

**Same-tick FIX scan:** three entries, each the same play registered twice (05 stage FIX = choona's "hop everything in the cave" `svp-chuna`@1322; 09 stage FIX = nali's "walk under both arches" `svp-nali`@1182; 10 stage FIX = nadi's "trust the board" `svp-magar3`@1273). No two different plays share a cause and a tick.

## Lag-captured sweep and per-tick replay (changed stages; `probes/sweep-fix3.txt`)

Route at lag 0/6/11/12, spawn idle 0/37/120/251, 7 plays per capture; replay per tick to every scripted death at lag 0/6/12.

| Stage | Capture points | Plays | Deaths | Longest stretch | Worst replay, lag 0 / 6 / 12 (s) |
|---|---|---|---|---|---|
| SVP-05 | 4 | 448 | 0 | 8.4 s | 2.42 / 2.52 / 2.91 |
| SVP-06 | 3 | 336 | 0 | 10.0 s | 1.66 / 1.76 / 1.86 |
| SVP-07 | 5 | 560 | 0 | 9.1 s | 5.00 / 5.31 / 5.46 |
| SVP-09 | 5 | 560 | 0 | 6.0 s | 3.80 / 3.80 / 3.80 |
| SVP-10 | 10 | 1120 | 0 | 12.1 s | 6.05 / 6.13 / 6.21 |

**0 deaths in 3,024 plays; worst replay 6.21 s.** Every scripted play dies at lag 0/6/12 (no `nodeath`).

## Proofs

- `tsc --noEmit`: clean.
- Full `npm test` (`npm-test-fix3.txt`): 18 files passed, **1772 tests passed**, 20 skipped, 0 failed. The first run after the cuts failed one test, `modules > SVP > has a policy for every ending`: the plain doors had no ending policy. I added a walk-in policy for the four ids; the rerun is green.
- `cpsafe -t SVP`: 10 passed, all strict.
- `LDD_N=80 npm run fair -- SVP` (`fair-N80-fix3.txt`): every stage 100% at 6 and 12 ticks; every stretch, doors included, 100% at 0-12 ticks; 18 ticks: 06 80% (parked), the rest 100% (09 is now 100%).
- `node scripts/flows.mjs`: no errors.
- Sheets re-shot and read for the changed stages: `shots6/SVP-05-sheet.png` (the room, the ooncha act, the caves, a plain door), `SVP-07-sheet.png` (the bus stand and a plain door), `SVP-09-sheet.png` (the grey-root creek, the hose, the pontoon, a plain door), `SVP-10-sheet.png` (the mill, the creek with the still crocodile, the cellar, the hose, the fare boat and the counter gate); `SVP-06-sheet.png` is in the folder too (only its door changed).

## Skipped or not checked

- Four of the nine stages have a plain door and 09's pul has one trap, by ruling; I did not search beyond the candidates above for stages where more time could find an idea.
- The still crocodile was judged at the sheet's scale, not on a device.
- 02, 03, 04 and 08 are unchanged and were not re-shot.
