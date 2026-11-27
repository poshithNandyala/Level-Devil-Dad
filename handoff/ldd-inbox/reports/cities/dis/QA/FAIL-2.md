# DIS QA round 2: FAIL

Tester: the same independent QA chat as round 1 (I wrote none of DIS). Subject: `city/dis` at **12842f7** (code tip; DIS.md is in 704d772, below it).
Worktree: `/local/home/saiposh/personal/ldd-wt/qa-dis`, detached at 12842f7. My scratch tests are untracked in `tests/qa/`, with copies in `QA/probes/`; I committed and pushed nothing.
Clock: 08:54-09:12 UTC. Outputs are in `QA/r2/`. FAIL.md stays as the round-1 record.

The pre-rulings are applied as given: the five doors are plain, bordoisila and its callback are cut, the route times are final, 18t is parked, the 04 open sky and the egret sound are polish, and `recause` is judged on correctness only.

## What passes (my runs)

| Check | Result | File |
|---|---|---|
| Diff e9afb1f..12842f7 | 15 files, all in `src/game/cities/dis/`, `tests/cities/dis.ts` and `docs/cities/DIS.md`. No shared file, no `package.json`, no version bump | `git diff --stat` |
| `tsc --noEmit` | clean | `r2/suite.txt` |
| Full suite, `tests/qa/**` excluded | 18 files passed, 13 skipped; **1801 passed**, 20 skipped, 0 failed | `r2/suite.txt` |
| `cpsafe -t DIS` | 10 passed, strict | `r2/cpsafe.txt` |
| `LDD_N=80 fair DIS` | **100% at 6t and 12t on all ten**, and every stretch and door 100%. 18t: 02 84, 05 76, 06 76, 07 80, 10 76 (parked) | `r2/fair80.txt` |
| `build:single` + `flows.mjs` | "no errors" | `r2/flows.txt` |
| Route times (lag 0, idle 0) | 01 22.6, 02 21.9, 03 33.6, 04 11.2, 05 32.0, 06 24.3, **07 88.3** (builder: 88.0; my tick count includes the last 0.3 s to the win), 08 44.6, 09 34.6, 10 40.5 | `r2/sweep-lag-captured.txt` (`ROUTE` lines) |
| Lag-captured sweep: route at lag 0/6/11/12 × idle 0/37/120/251; idle, run 0.3 s and tap-jump at lag 0/6/12 at each capture | **0 deaths in 10,416 plays** at 93 capture points | same |
| Longest stretch | 07 16.7, 10 12.4, 03 and 08 10.6 s; the rest under 10 s. All ≤ 25 s | same |
| Per-tick replay to each scripted death, lagged, at lag 0/6/12 | worst: 07 7.17, 01 7.13, 02 6.53, 05 6.41, 09 6.37, 08 6.25 s. All ≤ 7.5 s, and there is no `nodeath` | same |
| walk-4.5, all ten | **03: 4 cps, clear.** The other deaths are past +4.5, so they are overshoot: 04 +4.7, 06 +4.7, 08 +4.7/4.8, 09 +4.7 | `r2/walk45.txt` |
| Cause per play (`recause` correctness) | **80 scripted plays × 3 lags: every death is reported with the cause its label names.** 0 mismatches | `r2/causecheck.txt` (`causecheck.py`) |
| Pairing (each act's own NAIVE, the row right before its fix, plus the stage pair) | **30 pairs × 3 lags = 90 rows; every pair dies to two causes at two ticks.** This matches `fix1/pairs-table.md` row for row (the same causes and the same ticks: kaath 1998/2008/2020 against 2421/2443/2410, tunnels 3194/3365/3435 against 3178/3335/3392, cart 6487/6541/6596 against 6499/6568/6629, 01 1143/1173/1203 against 1181/1217/1253). The extra pairs also hold at all three lags: 10 room `dis-ulta`@219/223/220 against `dis-agot`@264/282/300; 10 tug `dis-khaal-ulta`@2377/2406/2431 against `dis-rope-ulta`@2672/2705/2734; 07 dhol `dis-pukhuri`@1232/1244/1256 against `dis-dhol-sink`@1964/1892/1904; 10 door `dis-basket-ulta`@4010/4069/4134 against `dis-path-agot`@3768/3827/3892 | `r2/pairs-table.md` (`pairs3.py`) |
| Plain doors | 02 / 03 / 07 / 08 / 09: `space: 8`, no paint, no entity, `twist = 'plain'`, and no death play. **Really plain** | `endings.ts` |
| F2 | `dis07-bordoisila` and `dis10-bordoisila` are out of the tree and their causes are gone. The pepa is 07's sound beat | |
| 04 tell, my phone frames (844×390 at 1.5×) | `r2/DIS-04-05.png`: the lantern glows at Dad's hand, and its flame stands straight up between wells; dust drifts along the brick floor. `r2/DIS-04-062.png`: over the third well the flame streams sideways and dust specks fall into that well. No bubble covers a well. **Readable.** The open sky past the gallery's right wall is outside the wells' span and does not touch the tell (polish) | `r2/` |
| 08 tell, my phone frames | `r2/DIS-08-062.png`: a white flock up in the air over the grass, with "The birds flew off". `r2/DIS-08-066.png`: six egrets standing in a row over the grass. **Readable** | `r2/` |
| Sheets | I read all ten `fix1/DIS-0X-sheet.png`. Every route reads, the five plain doors are plain, and 04 has the gallery and lantern. Nothing in them blocks | |

### F1-F7 closed?

| | Builder's claim | My reproduction | Verdict |
|---|---|---|---|
| F1 | five doors plain | read in code; no door death in any play | **closed** (plain by ruling) |
| F2 | bordoisila and callback cut | gone from the tree, the labels and the causes | **closed** |
| F3 | five lag-12 pairs fixed, plus cart and 01 | my own pairing: 90/90 rows, two causes at two ticks | **closed** |
| F4 | 67 causes, one line each, `recause` | scripted plays: all 80 report the right cause. **Unscripted plays inside acts still get other places' lines (B1)** | **not closed** |
| F5 | 10 room breaks 02; gamosa cut; hint rewritten | the gamosa and the hint are closed; the 10 room breaks 02 by **borrowing 06's rule (B2)** | **not closed** |
| F6 | 03 checkpoints only where you wait | walk45 03 clear | **closed** |
| F7 | lantern and dust, egret flock | my phone frames read | **closed** |

## Blocking findings

### B1. Law 9: obvious unscripted plays inside acts get another stage's or another mistake's line

`r2/generic.txt` (probe `qa-dis-generic.test.ts`) runs each act from its route marker with six plays: walk on, a short hop, a long jump, wait 4 s then walk, hop every 0.3 s, and back off. The same plays at lag 6 and 12 start that many ticks late. The scripted plays are all right; these are not:

| Play (act) | Cause@tick, x (lag 0 / 6 / 12) | Line shown | Wrong because |
|---|---|---|---|
| walk on into the trap channel (`dis06-traps`) | `dis-luit`@1552/1559/1566, x77.3 | "Luit! The sandbar was not there… Read the level post… The hut never moves." | 02's sandbar line on Majuli's fish-trap channel: no post, no hut. The unmapped `river(... 'dis-luit')` in `majuli.ts:184` |
| back off from the flag into the same channel (`dis06-flag`) | `dis-luit`@2086/2089/2095, x80.8 | the same 02 line | the same |
| walk on into the first ditch (`dis05-sanko`, act+6) | `dis-sanko-pit`@1300/1306/1313, x96.0 | "You backed off for a host, and the ditch behind you was there." | he walked forward into the ditch ahead: the line names a mistake he did not make. The sanko map covers the whole act |
| walk on along the leaves (`dis05-feast`, act+12) | `dis-pit`@1711/1718/1724, x126.0 | "You jumped right over the feast, into the ditch beyond." | he walked; he did not jump. The kaath back-off (x126.1 @1922/1925/1931) gets the same line |
| run across the dhol planks (`dis07-dhol`): the scripted NAIVE m2, and walk on | `dis-pukhuri`@1232/1244/1256 x42 (NAIVE); @1230/1237/1243 x42.8 (walk on) | "Dhol! The plank sank on the beat, and you went into the pond." | no plank sank: he ran on to water where none had risen. 10's dhol got the right line, `dis-pukhuri-lahe` ("You ran at the planks: they rise only on his beat"); 07's did not |

**What would satisfy me:** every hazard in an act (rivers and ditches included) maps to a line that names what happened there. The forward ditch and the back-off ditch in sanko need different lines, the feast ditch needs a "walked off the end of the leaves" line, the 06 channel needs its own cause, and 07's dhol run needs a line like 10's. A rerun of `qa-dis-generic` with no line that names a mistake the play did not make.

### B2. Law 7: the DIS-10 room's break borrows DIS-06's room rule

The new 10 room (badd994, `SandField.flip`): the bar in front sinks first and the new bar rises after, so wait on the bank and go once it is fully up. Its plays: NAIVE (stand on the bar, as in 02) `dis-ulta`@219/223/220 x10-11; m4 (jump before it is up) `dis-agot`@264/282/300 x11.

**The closest row is `DIS-06/room`**, which is not one the builder named: "the slab in front of each spur goes early; silt builds a step behind it: wait on the bank till the step is up, jump over the slab on to it". Its plays have the same shape: stand on the doomed slab, `dis-bank`@215/221/227; go before the step, `dis-porcupine`@199/205/211.

The decision is the same in substance: the floor right ahead goes first, the new floor beyond comes after, so wait on the bank and jump when it is up. 10's room breaks 02's rule by importing 06's. KVT-08's slab clock is further off, as the builder says.

**What would satisfy me:** a 10-room break of 02 whose decision has no row in DIS (06 included) or the registry, or the room's twist reverted to plain, with the post on the far bank and no break, and the conductor ruling on whether an unbroken finale room is allowed. That second route was the round-1 F5 question.

### B3. Padding: `dis08-bagori`'s second play re-asks `dis08-jeep`'s read

`dis08-jeep`: "This rhino stops halfway… then a jeep close to you starts up, and it charges on… stand back till it has come, rested and gone". `dis08-bagori`: "…up on the haystack. It stops halfway across, and then a jeep… revs: it charges on. Off the hay only when it has gone the whole way."

Fix round 1 made bagori's rest 200 ticks, so that its FIX ("off the hay as soon as the rhino stops halfway") dies in the act, `dis-gorh-adha`@4644/4680/4718 x165, with the line "It had only stopped halfway". That second play now tests jeep's read, "it only stopped halfway", a second time in 08, which has no labelled momentum beat. Bagori's own read ("from behind: up on the hay") is tested only by its NAIVE, `dis-gorh`@3909/3939/3969 x129.

I missed this in round 1, when the halfway rest was 40 ticks and the FIX died in the old door. I am raising it now because the fix made it the act's second play.

**What would satisfy me:** bagori's second play dies to a mistake about its own read (for example, climbing the hay too late, or the wrong side of the hay), not "it only stopped halfway"; or the halfway rest dropped from bagori.

### B4. Check 3: `dis10-talatal` has one play

The brief asks every surviving 10 callback to have two plays, two causes and two ticks. `dis10-talatal` has only m2, `dis-doba-ulta`@3546/3598/3657 x116. In my unscripted plays, walk on, the hops and wait-then-walk are all blocked alive, and "hop every 0.3 s" goes through it to the door. `dis-talatal-ulta` has a line but no play reaches it. Dhol and tug have two.

I am listing this because check 3 says so. Round 1's pre-ruling counted 10's two-play acts as known; if that covers talatal, B4 falls.

## Decision sweep (doors plain and exempt)

| Stage | Part | Decision | Closest row | Verdict |
|---|---|---|---|---|
| 01 | tour | Pass the tea boy only while he is stopped and pouring. | PAT-04 (step aside) | ok |
| 02 | room | Bars move by the post's next mark: stay, and go when the new bar is up. | DIS-02 (own) | ok |
| 02 | `chapori` | The hut's bar never moves; don't wait on the narrowing bar. | 02 room | ok |
| 02 | `bhutbhuti` | The horn is not the siren: the post does not move. | F447 (assigned) | ok |
| 03 | room | Follow behind the plucker. | DMN-07 paintwall (stay close behind the painter), different: here the floor is picked down for you | ok |
| 03 | `bagan` | The wet path slides: wait before the pipe. | own | ok |
| 04 | room | Falling stair: stop on the penultimate step, it rises. | F448 (assigned) | ok |
| 04 | `batah` | Go down the well the flame and dust lean to. | `dis07-bordoisila` (gone), AMR-07 | ok; the tell reads |
| 04 | door `laru-plate` | Hop the rolling balls. | generic roller | ok (plain-ish) |
| 05 | room | Three gamosas blind you; give one to a red sash; hop givers. | LKO-02 bow (standing still) | ok |
| 05 | `atithi` | The room again. | labelled momentum beat (W5) | ok |
| 05 | `sanko` | Walk the nala you remember: it has been bridged. | F452 | ok; B1 line |
| 05 | `feast` | The leaves are the floor; never jump for a pitha. | F449 | ok; B1 line |
| 05 | `kaath` | Splits slide at a jump: hop short, then over, at once. | F451 | ok |
| 05 | `machan` | Keep up with the planking; be off before the roll. | F450 | ok |
| 05 | door `gamosa-latch` | Keep one gamosa. | 05 room (resource) | ok |
| 06 | room | Wait for the silt step behind the spur; jump to it. | KVT-08 (not a clock) | ok |
| 06 | `wake` | Shelter in the spur's lee. | F454 | ok |
| 06 | `traps` | Leave a ringing trap; a slack one tips. | F456 | ok; B1 line |
| 06 | `flag` | The marker moves, the plank stays. | F455 | ok |
| 06 | door `tea-ladder` | Wait at the ladder for the tea boy (no death). | — | ok |
| 07 | room | Gates open only inside the husori ring. | own | ok |
| 07 | `dhol` | Hop on the beat; it quickens. | momentum beat | ok; B1 line |
| 07 | `rope` | Wait at the anchored end; cross between strokes. | I5 re-skin | ok |
| 07 | `goru` | Off the lane sideways when the bull lowers its head. | F458 | ok |
| 07 | `tekeli` | Stand where they are not shouting. | F460 | ok |
| 07 | `card` | Not before the card's time; wait on the bench. | DIS-C3 | ok |
| 07 | `cart` | Never stop on the cart; walk and jump to the jetty. | F459 | ok |
| 07 | `chowk` | The ritual gate waits for the host. | 07 room twist (one play) | ok |
| 07 | `pepa` | Let the leaving group go; join the coming group's ring. | F457 | ok |
| 08 | room | Wait for the charge, walk the strip. | own | ok |
| 08 | `jeep` | It stops halfway; a near jeep sends it on. | own | ok |
| 08 | `duijeep` | It charges the nearer jeep, not the louder. | own | ok |
| 08 | `bogoli` | Cross while the egrets sit. | F461 | ok |
| 08 | `bagori` | From behind: up on the hay (NAIVE); off the hay too soon at the halfway stop (FIX). | **`dis08-jeep`** | **B3** |
| 09 | room | Pad, run, one leap over rib and oil. | own | ok |
| 09 | `chaal` | The room again. | labelled momentum beat | ok |
| 09 | `tug` | The taut rope drifts to the winner: go on the far team's flag. | own | ok |
| 09 | `sluice` | On the bell, up on the embankment; come down when it drains. | F463 | ok |
| 09 | `tunnels` | Step, wait for the grate, step. | F462 | ok |
| 10 | room | The bar in front goes first; wait on the bank for the new one. | **DIS-06 room** | **B2** |
| 10 | `dhol` | The drummer slows: hop only when the plank is up. | breaks 07 | ok |
| 10 | `tug` | The teams changed ends: go on green. | breaks 09 | ok |
| 10 | `talatal` | Steps fall bottom-first: race down. | breaks 04 | ok; **B4** (one play) |
| 10 | door `post-bank` | Go in front of the plucker. | breaks 03 (S8) | ok |

**Padding:** I found no run of identical windows beyond the labelled beats (05 `atithi`, 09 `chaal`, 07 `dhol`). Each act is one read, except 08 `bagori`, which has two (B3).

## Law 9 over the 67 lines

I read all 67 lines (`r2/labels.txt`) against every scripted play's actual cause (`r2/causecheck.txt`) and the unscripted plays (`r2/generic.txt`).

- No line advises the move that killed the play that reaches it.
- No 10 callback carries its home line: all 10 deaths report `-ulta`, `-lahe` or `-agot` causes.
- The failures are the ones in B1: `dis-luit` in 06, `dis-sanko-pit` on a forward walk, `dis-pit` on a walk, and `dis-pukhuri` on 07's run.
- Lines with no play that reaches them, which are not failures: `dis-japi-gat` (reached only by a back-off), `dis-talatal-ulta`, `dis-laru`.

## Polish (not blocking)

- 04: open sky beyond both ends of the brick gallery (pre-ruled polish; it does not touch the wells).
- 08: no egret sound.
- The DECISIONS row for `dis-laru-plate` still says "never wait on matte" (the allocator's file).

## To re-test

1. B1: rerun `tests/qa/qa-dis-generic.test.ts` (`QAG=1 QAG_LAGS=0,6,12`) and read every line against the play.
2. B2: the 10 room's new decision against DIS-06 and the registry, with its two plays at lag 0/6/12.
3. B3: bagori's second play.
4. B4: if it is not waived, a second `dis10-talatal` play with its own cause and tick.
5. After any change: the suite, cpsafe, fair N=80 at 6/12t, the lag-captured sweep plus replay, walk45, `pairs3.py`, `causecheck.py`, and the diff limited to DIS files.

## Not checked, and risks

- My lag for unscripted plays (B1) is a late start, not my full lagged-input model. The causes come from fixed hazards, so lag cannot change them; the ticks shift by 6 and 12.
- I read the builder's ten sheets and shot my own phone frames only for 04 and 08.
- I re-recorded `/tmp/rec/DIS-*.json` at 12842f7 (the shared folder; the DIS files only) to drive my frames.
- I did not check the Assamese lines one by one; the bible's (U) marks stand as unverified.
