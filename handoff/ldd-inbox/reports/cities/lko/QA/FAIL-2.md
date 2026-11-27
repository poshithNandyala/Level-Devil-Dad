# LKO · Lucknow: QA verdict FAIL (round 2)

Tester: the round-1 independent QA chat (wrote none of LKO). Subject: `city/lko` at **110d6d7** (branch head when tested; develop f8288e9 is in its history), my detached worktree `/local/home/saiposh/personal/ldd-wt/qa-lko`. Nothing committed. My scratch probes are untracked under `tests/qa/` and `shots/qa2/` in that worktree.

**Pre-rulings by the conductor (as given, not re-judged):** honest floors are final for this city: 05 49.1 s, 06 50.8, 07 54.4 (plays as a long stage, not a marathon; the two remaining marathon families were struck for engine and rule reasons the conductor accepts), 08 44.2, 10 89.7 (09 at 70.9 meets its floor). Every v3/v3.1 LKO family is built or struck; no refill exists. 06 ends with four two-play acts, not five, accepted for the same reason. 02-04 were fixed in FIX-1. I judged the acts that exist, not the count.

**Verdict: FAIL.** Tests, fairness, flows, the lag-captured sweep and the per-tick replay all pass. B1, B4, B5 and B6 are closed, and B2 and B3 mostly. What fails is the decision sweep and the two-play rule:
- six doors re-ask their room (C1);
- five acts re-ask an earlier Lucknow decision and two repeat a shipped one (C2, C3);
- five finale callbacks replay instead of breaking (C4);
- five acts have one play, or two plays dying of one cause (C5);
- one act is padded (C6);
- 05's checkpoints sit under 4.5 tiles from the tawa (C7);
- several baited plays survive or collapse under lag (C8).

## What I ran (all reproduced myself)

| Check | Command | Result |
| --- | --- | --- |
| Typecheck + suite | `npm ci && npm run typecheck && npx vitest run` (scratch dir excluded) | typecheck clean; **18 files passed, 13 skipped; 1851 passed, 20 skipped, 0 failed**. LKO is on no allow-list in `tests/modules.test.ts`. |
| Build + flows | `npm run build:single && node scripts/flows.mjs` | built; **"no errors"** (run with `CHROME_PATH` = cached headless shell 1228; a fresh `npm ci` looks for 1254, which the cache does not have: host issue) |
| Fairness | `LDD_N=80 npm run fair -- LKO` | passes (below) |
| Every scripted play | `tests/qa/qa-lko-rec2.test.ts`: route + NAIVE + FIX + every MISTAKE at lag 0, cause, tick, x | 130 plays, all die at lag 0; the problem pairs are in C5 |
| Lag-captured sweep + per-tick replay | `tests/qa/qa-lko6.test.ts` (a copy of qa-pat's `qa6`, ids switched to LKO, death log added), `QA6=1 QA6_IDLE=0,37,120,251` | section 6 |
| 4.5-tile probe | `tests/qa/qa-lko-walk45.test.ts`: from each checkpoint where the route takes it, walk 4.5 tiles and stop 1 s; and tap-jump then walk | section 6 |
| Act list, advice, route time to each act | `tests/qa/qa-lko-acts.test.ts`, `tests/qa/qa-lko-scratch.test.ts` | 52 acts; ids match `tests/cities/lko.ts` exactly (no test-only or level-only act) |
| Frames | route sheets in `reports/cities/lko/shots/`; fresh frames with a copy of `routeshots.mjs` from my own recordings (`shots/qa2/D.png`, `E.png`, `F.png`, `LKO-08__route-087/09/093.png`) | section 7 |

```
LKO-01: 6t 100%  12t 100%  18t 84%    stretches s0-s4, door 100%
LKO-02: 6t 100%  12t 100%  18t 100%   s0-s6, door 100%
LKO-03: 6t 100%  12t 100%  18t 76%    s0-s6, door 100%
LKO-04: 6t 100%  12t 100%  18t 76%    s0-s5, door 100%
LKO-05: 6t 100%  12t 100%  18t 76%    s0-s8, door 100%
LKO-06: 6t 100%  12t 100%  18t 76%    s0-s14, door 100%
LKO-07: 6t 100%  12t 100%  18t 98%    s0-s14, door 100%
LKO-08: 6t 100%  12t 100%  18t 88%    s0-s17, door 100%
LKO-09: 6t 100%  12t 100%  18t 76%    s0-s25, door 100%
LKO-10: 6t 100%  12t 100%  18t 80%    s0-s24, door 100%
```
(Every stretch is 100% at 0-12t; the bar is 90% a stage and 95% a stretch at 6 and 12 ticks.)

Route times, reproduced: 01 14.2 s, 02 25.3, 03 25.2, 04 26.4, 05 49.1, 06 50.8, 07 54.4, 08 44.2, 09 70.9, 10 89.7.

## Section 6: lag-captured sweep, per-tick replay, 4.5-tile probe (my own runs)
`QA6=1 QA6_IDLE=0,37,120,251 npx vitest run tests/qa/qa-lko6.test.ts`: the route at lag 0/6/11/12 with spawn idle 0/37/120/251, each checkpoint captured where the LAGGED run takes it, the world rebuilt by `replay()`, then 7 plays (idle 4 s; run 0.3 s after 0/6/12 ticks; tap-jump after 0/6/12 ticks). Run 07:00:51-07:09:16 UTC (504 s).

| Stage | Capture points | Plays | Deaths | Longest stretch | Worst replay (lag 0/6/12, NAIVE/FIX/MISTAKES) |
| --- | --- | --- | --- | --- | --- |
| LKO-01 | 5 | 560 | 0 | 5.1 s | 4.65 s (fix) |
| LKO-02 | 7 | 784 | 0 | 7.3 s | 3.24 s |
| LKO-03 | 7 | 784 | 0 | 9.4 s | 6.57 s (m5) |
| LKO-04 | 6 | 672 | 0 | 8.1 s | **7.46 s** (m0 at lag 6) |
| LKO-05 | 9 | 1008 | 0 | 22.8 s | 6.33 s (m1 at lag 12) |
| LKO-06 | 15 | 1680 | 0 | 8.0 s | 4.17 s |
| LKO-07 | 15 | 1680 | 0 | 6.3 s | 3.99 s |
| LKO-08 | 18 | 2016 | 0 | 7.1 s | 4.67 s |
| LKO-09 | 26 | 2912 | 0 | 6.3 s | 6.14 s |
| LKO-10 | 22 | 2464 | 0 | 10.1 s | 5.72 s (m21) |

**0 deaths in 14,560 plays; every stretch is 25 s or less; every replay is 7.5 s or less per tick at lag 0/6/12.** This matches FIX-5 exactly. **B6 is closed.**

**Baited plays that do not die under lag** (from the same run's per-play log, `/tmp/qa-lko2/deaths.txt`):
- `LKO-04 fix` (wait on the shady tile, the lid flips the light): survives at lag 12.
- `LKO-07 fix` (stroll on into the dusk awnings): survives at lag 6 and lag 12.
- `LKO-09 naive` (roof to roof, never mind the flag): survives at lag 6.
- `LKO-10 m17` (chirag: wait on the shady left tile): survives at lag 6 and lag 12.
- `LKO-10 m18` (chirag: keep the left tiles after he passes): survives at lag 12.

**Pairs that collapse into one death under lag:**
- `lko10-tasveer`: m9 and m10 die of `lko-photo-jaldi` at x122 on the **same tick** at lag 6 (2998) and at lag 12 (3324).
- `lko09-seeti`: m5 and m6 both fall off at x193 (`lko-chhat`, not the whistle) at lag 12.
- `lko06-mehfil`: m1 becomes `lko-mehfil`, as m0 is, at lag 12.
- `lko07-photo`: m9 becomes `lko-photo-jaldi`, as m10 is, at lag 12 (different places).

**4.5-tile probe** (`QA45=1 npx vitest run tests/qa/qa-lko-walk45.test.ts`): from each checkpoint where the lag-0 route takes it, walk 4.5 tiles and stop, or tap-jump then walk. A death at or beyond +4.5 is an overshoot past the stop, so it is not counted. Deaths short of 4.5 tiles:
- **LKO-05, seven of nine checkpoints:**
  - cp0 x29.7: `lko-tawa` at +3.8 tiles.
  - cp2 x57.2: tap → `lko-seekh` at +3.3.
  - cp3 x87.7: `lko-kafgir` at +4.0.
  - cp4 x115.8: `lko-tawa` at +3.7.
  - cp5 x129.7: `lko-tawa` at +3.8.
  - cp6 x151.7: `lko-tawa` at +3.8.
  - cp8: the tandoor, 4.2 tiles by the static scan.
  - Each act's checkpoint sits 3.7-4.0 tiles before the hot tawa.
- **07 and 10 julus:** a walk catches the moving procession in 1.3-2.0 s. That is a moving group, not a static edge (polish 6).
- **Everything else is clear at 4.5 tiles:** 01, 02, 03, 06 and 08 are clear; 04, 09 and the rest of 10 die only past +4.7.


## BLOCKING findings

### C1. Six door endings re-ask their own room (the Sri Vijaya Puram ruling: a door that re-asks its room is a repeat)
Each door's decision, in the builder's own `advice:` line, is the room's decision with the door as the prize. The ending policies in `tests/cities/lko.ts` confirm it: they run the room's own play (e.g. `'lko-chhatri'` uses `redNow`, the 09 room route's own test).

| Door | Door decision | Room decision it re-asks |
| --- | --- | --- |
| 04 `lko-kulhad` | the bhatti behind you moves the light: land on the right tiles | 04 room: the lid moves the light, move to the other tile |
| 06 `lko-sam` | wait up on the takht while she spins the floor, go after her stamp | `lko06-mehfil`: wait on a takht till she has spun past, then cross (an act, not the room, but the same Lucknow decision) |
| 07 `lko-darban` | hop the nala early, pause, then stroll up: he opens only for strollers | 07 room: pause before the strollers and they part |
| 08 `lko-489` | walk through the last arch (a hop puts you on the roof) | 08 room: walk the first arch (a hop puts you in the hooks) |
| 09 `lko-chhatri` | go in early in the red, before white brings the flock home | 09 room: cross only early in the red |
| 10 `lko-tehzeeb` | bow from the plain board, not on the covered threshold | 10 room: bow on the plain board, not on the covers |

I listed 04, 06 and 09 as polish in round 1; the rule has since been ruled (SVP QA B7), so they are now blocking with the other three.
**What would satisfy me:** each of these six doors asks something its own stage has not asked: a break of the stage's rule (as 03's `lko-balti` now does: "don't wait for the second wash") or a new read. The kept doors (02 `lko-kiwad`: stand out of the leaves' sweep, not at the threshold; 03 `lko-balti`; 05 `lko-sheermal`) show the shape.

### C2. Acts that re-ask an earlier Lucknow decision (a stage re-asking its own rule with new numbers is a repeat)
| Act | Its decision | Earlier Lucknow part with the same decision |
| --- | --- | --- |
| `lko02-aadaab` | return the greeting with ONE short bow, then go; no bow = shoved, bowing on = he insists you go first, into it | 02 room: lean in = pushed first; bow twice = he insists (`lko-dhakka`); bow once, then go. Same two failure modes, same answer, a nala instead of the stone |
| `lko05-dum` | wait for the second squash (the last heap: the third) before you hop | 05 room: wait for the squash before you hop. The count is the only new thing |
| `lko08-mehrab` | walk the arch with the hooks above, jump the arch with the well past it | 08 room: walk the drain arch (hooks above), jump the well arch. Same pair, same order |
| `lko08-minar` | jump through arches 1 and 2, walk the third | 08 room rule (jump = a floor up, walk = stay) applied three times; the floor count is the only new thing |
| `lko07-chauraha` | pause so the strollers part, then run before the awnings coming down behind them | 07 room (pause, they part) plus the awnings-from-behind-never-stop thought that S11 ruled is PDY-04's (`shaam` was allowed to stay only with the which-awning-next tell). These awnings drop in order from where you came in, with no shiver tell (`s07.ts` chauraha build: fixed `0.9 + 0.457 k` s after the part). Its death line (`lko-shamiyana`) also talks about a "shivering" awning that does not exist here |

**What would satisfy me:** each recast to a new read or cut. For chauraha, at least the shiver tell of `shaam`, which then makes it a second `shaam` window, so cutting it is cleaner.

### C3. Acts that repeat a shipped decision (DECISIONS.md list 1)
| Act | Its decision | Shipped row with the same thought |
| --- | --- | --- |
| `lko06-tihai` | count to three: on the third, be on the safe boards | `PDY-07/room` and `pdy07-waves`: "Waves come in sets of three: the first two only push you back, the third is the big one. Be up on a rock when it comes." (also `HYD-03` "the third shoots you into the ceiling") |
| `lko04-badal` | go cup to cup inside the moving cloud shadow, never ahead of it, never left behind | `KVT-03/room`: "The lighthouse beam is the bridge only while it is on you: keep walking with it, never stop to wait." (and `kvt10-nizhal`, follow behind the beam) |

The registry lists both acts without a collision row, so neither was ruled. By the decision test (a player who learned PDY-07 counts to three and stands on the safe thing; a player who learned KVT-03 travels inside the moving safe zone) these are the same thoughts.
**What would satisfy me:** a conductor ruling that keeps them, or a recast. If tihai goes, `lko10-do` (its break) goes with it.

### C4. The finale's callbacks that replay their rule instead of breaking it (law 7)
| Act | What it asks | Break? |
| --- | --- | --- |
| `lko10-seedha` | the stamp swaps nothing tonight | **yes**, breaks 06 guru |
| `lko10-do` | sam on the second, not the third | **yes**, breaks 06 tihai (but see C3) |
| `lko10-thahra` | the maze stays put after the door | **yes**, breaks 08 darwaza |
| `lko10-darbar` | the lit square the courtier bows you on to is the loose stone | **yes**, breaks 08 court ("lit squares hold") |
| `lko10-tasveer`, `lko10-jawab` | waiting by the group / bowing back is a bow on the bells | **yes** (ruled W2) |
| `lko10-daana` | grain beats the flag | **yes**, breaks 09 |
| `lko10-dhulai` | 03's wash (wait out both whistles on stitch) then 04's heaps (left tile in the low sun) | **no**: two rooms replayed as they were taught |
| `lko10-julus` | walk behind at their pace, wait at each nala | **no**: plain replay, **19.4 s** of route (26.1 to 45.5 s), the biggest single block of the finale |
| `lko10-galiyara` | walk the drain arch, jump the well arch, along the gallery | **no**: the 08 room replayed |
| `lko10-raasta` | the strollers part; the gentleman in the gap bows you first; bow back, let him go, hop the hole | **no**: 07's room then 02's room, each as taught; nothing learned is wrong here |
| `lko10-chirag` | the lantern passes; the side away from it holds | **no**: 04's rule (the side away from the light holds) with a moving source; the FIX ("wait on the shady left tile, as the low sun taught") dies because the source moved, which is 04's own lid lesson |

W2 (04:58 UTC) let `julus` and `galiyara` stay "plain". This round's verdict rules call a callback that replays instead of breaking blocking, so I count all five. If W2 stands for those two, `dhulai`, `raasta` and `chirag` are still blocking.
**What would satisfy me:** each of the five breaks the rule it calls back (the way seedha, thahra and darbar do), or is cut.

### C5. Two-play acts where the two plays die of the same cause (or there is only one play)
From my lag-0 recordings (`tests/qa/qa-lko-rec2.test.ts`, cause@tick, x in tiles):
| Act | Play A | Play B | Problem |
| --- | --- | --- | --- |
| `lko06-tihai` | m4 "standing on a tied-up strip through the third phrase" `lko-tihai`@1941 x72.3 | m5 "running the stage in one go" `lko-tihai`@1940 x84.1 | **same cause**, one tick apart: both are sam ringing every strip |
| `lko07-shaam` | m5 "running the row without a stop" `lko-shamiyana`@619 x45.4 | m6 "stopping for the first shivering awning, then running the rest" `lko-shamiyana`@870 x61.4 | **same cause** (the shivering awning, first and second) |
| `lko09-gumbad` | m1 "walking up to the white dome" `lko-gumbad`@1225 x38.1 | m2 "jumping for the dome from far back" `lko-gumbad`@1238 x37.5 | **same cause, same place** (0.6 tiles, 13 ticks). The reflection (m0 `lko-aks`) is a different dome |
| `lko07-batti` | m3 "following the lamplighter close behind" `lko-seedhi`@1321 | none | **one play** |
| `lko09-hawa` | the stage FIX `lko-hawa`@1836 | none | **one play** |

The four close-tick pairs FIX-5 names are real and distinct: guru `lko-ghungroo`@3144 x96.7 vs `lko-chakkar`@3134 x107.3; seedha `lko-ghungroo`@8342 x292.7 vs `lko-chakkar`@8332 x303.3 (10 tiles apart); darwaza `lko-kuan`@4119 x256.2 (down the well) vs `lko-bhool`@4110 x255.2 (up in the hooks); dukaan `lko-dukaan`@5700 x231.3 vs `lko-shamiyana`@5691 x228.8. Not one trap twice.
**What would satisfy me:** a second death with its own cause for batti and hawa, and a different cause for one play of tihai, shaam and gumbad (or a recast where the obvious fix really meets a different trap).

### C6. Padding: one act still repeats one read far past one momentum beat
`lko09-hawa` is 8 identical low-roof crossings (`HAWA = lay(7, [13, 12, 13, 12, 13, 12, 13, 12])`, `s09.ts:243`), one read (the inverted flag), **19.7 s** of route (14.3 to 34.0 s). I missed it in round 1. Everything else I flagged in round 1 is now at the accepted 3-5 with a twist on the last one: tawa 6 (`TAWA2 = 'FTFTTF'`), dum 5 with the last one triple, gumbad 3 plus the reflection. Other counts: adda 5, ghee 4, charkhi 4, mehfil 5, julus 4 (last early), jhande 5 (switch at the middle). Also: `lko10-julus` (C4) is a 19.4 s verbatim replay.
**What would satisfy me:** hawa at 3-5 roofs with a twist on the last one.

### C7. LKO-05: checkpoints within 4.5 tiles of the hot tawa
Seven of 05's nine checkpoints are 3.3-4.2 tiles before something a plain walk or a tap reaches: the tawa (cp0, cp4, cp5, cp6 at 3.7-3.8 tiles), the low rack (cp2: a tap from it hits the seekh at 3.3 tiles), the kafgir slab (cp3 at 4.0) and the tandoor (cp8 at 4.2). Section 6 has the list. The sweep's 0.3 s plays stop short of these, which is why the sweep is clean.
**What would satisfy me:** each of those checkpoints at least 4.5 tiles before the first tawa, rack or slab edge (move it back, or start the tawa a tile later, as fix 5 did for 06's guru floor), with the sweep still at 0.

### C8. Baited plays that survive at lag 6 or 12, and pairs that collapse into one death under lag
These are the ones listed in section 6: `LKO-04 fix` at lag 12, `LKO-07 fix` at lag 6/12, `LKO-09 naive` at lag 6, and `lko10-chirag` (both plays at lag 12, the NAIVE at lag 6 too). Also `lko10-tasveer`, whose NAIVE and FIX die on the same tick of the same cause at lag 6 and lag 12. Lesser cases: `lko09-seeti` at lag 12 (both fall off the roof at x193, so the whistle never kills), and `mehfil`/`photo` at lag 12 (same cause, different places).
**What would satisfy me:** every NAIVE and FIX dies at lag 0, 6 and 12, the two of each act to different causes at different ticks, or a written reason why that lag cannot play the bait. For seeti at lag 12, the play should die of the whistle, not of a missed hop.

## Round-1 findings B1-B6: closed?
| # | Round 1 | Now (my probe) | Closed? |
| --- | --- | --- | --- |
| B1 | 02-04 at 11-12 s | 02 25.3 s, 03 25.2, 04 26.4. The rooms are untouched (the route reaches the first act at 4.5 / 6.0 / 4.8 s, the same as in round 1); the extra time is new acts: 02 `takrar` + `aadaab`, 03 `adda` + `rang`, 04 `badal`. They are real acts, not slower timers | **yes** for length; but `aadaab` (C2) and `badal` (C3) are repeats |
| B2 | padding in 05/09/10 | tawa 16→6, dum 12→5 (+triple), gumbad 6→3 (+reflection); the finale's verbatim `again()` copies are gone except `julus`, `galiyara` and the plain `dhulai` | **partly**: hawa (C6), finale plain callbacks (C4) |
| B3 | 05/08/09 not their shape | 08 now carries the maze rule going stale six times (`upar`, `toota`, `utar`, `wapas`, `darwaza`, plus `sargoshi`/`roshandan`): plays as WTF-then-tough. 05 has new reads (`ulta`, `bhara`, `ghee`, `charkhi`). 09 has new signal rules (`jhande`, `seeti`, `girah`). Floors as pre-ruled | **yes** (shape); repeats in C2 |
| B4 | 09 FIX line taught the fatal move | FIX now dies of `lko-hawa`: "The birds read the other face of the flag: you saw red, they saw white. / Here, go while YOU see white" | **yes** |
| B5 | 03 door = B32 fake door | `lko-balti`: the door is real; its threshold is print over the vat, and the second move is the bucket (don't wait on the flowers) | **yes** |
| B6 | replays 12-18 s | worst replay 7.46 s per tick at lag 0/6/12; longest stretch 22.8 s; 0 deaths in 14,560 lag-captured plays | **yes** (but C7: 05's checkpoints sit under 4.5 tiles) |

## Section 4: the decision sweep (one sentence per part; closest row; plays differently?)
Sources: the `advice:`/hint line of every part on the current tree (`tests/qa/qa-lko-acts.test.ts`), DECISIONS.md lists 1-2 (840 rows grepped by noun and verb), ALLOCATION v3/v3.1 families. "Own" = the closest is another Lucknow part. **R** = repeat (blocking, in C1-C3/C4), **ok** = plays differently.

| Part | Decision | Closest row | Verdict |
| --- | --- | --- | --- |
| 01 tour | landing on a bolt sells it: hop on before the hook grips; run under the unrolling bolt at once | troll-kit crumble/timed floors (tell = the hook); CCU-04 stack-pulled-from-bottom (not echoed: no height drop, no choice) | ok |
| 01 door `lko-gomti-ghat` | plain door (tour) | | tour |
| 02 room | let the other go first (he takes the stone), take the offer once it has gone | CHN-02 queue | ok |
| `lko02-gali` | refuse an offer made before the stone has gone; let him go first | 02 room (the offer read after/before the stone is the ladder) | ok (close) |
| `lko02-takrar` | against a man who bows back, keep bowing until he gives up | 02 room's "bow once" | ok (breaks it) |
| `lko02-aadaab` | one short bow, then go | 02 room: same two failures, same answer | **R** (C2) |
| 02 door `lko-kiwad` | wait two tiles back, out of the leaves' sweep, not at the threshold | PAT-04 step-aside (not asked: nothing comes at you, no second); 02 room (stand still at the door: here that kills) | ok |
| 03 room | stand on stitch through both washes | DMN-07 / BPL-03 floor state | ok |
| `lko03-kunda` | run the print without stopping (the whistle follows your step) | PDY-04 (never stop, the thing behind advances): here the read is the whistle a beat after your own step, on the only floor there is | ok (close) |
| `lko03-adda` | ride the hoop; never wait on the next flower, where it clamps down | none found | ok |
| `lko03-rang` | wait on the near flowers, cross the far ones in one go as they come up from the dye | timed platforms (blinkers kit), TVM-06 nets | ok (close: a cycle read) |
| 03 door `lko-balti` | flower, flower, door at once: the second move is the bucket, not a second whistle | 03 room ("wait out both") + kunda ("don't stop"): a combination; it breaks the room's wait | ok |
| 04 room | stand on the tile in the heap's own shadow; when the source moves, switch | AMR-04 (wait only in real shade): here the side flips with the light's direction (allocation: LKO owns sun-direction) | ok |
| `lko04-chowk` | hop only on cups inside a stack's shadow; the tips go warm first | AMR-04 | ok (close) |
| `lko04-badal` | travel inside the moving cloud shadow | KVT-03 room, `kvt10-nizhal` | **R** (C3) |
| 04 door `lko-kulhad` | the light comes from the other side: other tile | 04 room | **R** (C1) |
| 05 room | stand till the heap squashes, then hop from flat | RPR-04 shaped ground | ok |
| `lko05-tawa` | thin ones at once, full ones after the squash | 05 room (ladder) | ok |
| `lko05-lane` | walk right behind the squash wave, no jump | none | ok |
| `lko05-ulta` | wait off the slab until he has pressed it all, then walk | `lane` (here you wait) | ok |
| `lko05-bhara` | keep your heap full by stepping between the pair; hop on the hoist; on the half hoist hop from flat | none | ok |
| `lko05-dum` | wait for the second (third) squash | 05 room | **R** (C2) |
| `lko05-ghee` | hop while the ladle's ghee sizzles the heap down | TVM-03 pour (ruled S20 keep) | ok |
| `lko05-charkhi` | hop as the skewers come up flat, while they still rock | F471 condition met: NAIVE waits for the still skewer (m14 `lko-seekh`@4662) | ok |
| 05 door `lko-sheermal` | drop on the raw sheermal and hop out before it bakes | timed/crumble ledge (kit) | ok (close) |
| 06 room | keep off the bell strips; over her board on the takht | RPR `rath` (ruled S14 keep) | ok |
| `lko06-tatkar` | hop her moving patch as it comes at you | none | ok |
| `lko06-tihai` | count three; be on plain board on the third | PDY-07, HYD-03 | **R** (C3) |
| `lko06-guru` | each stamp swaps left and right: press the other way at once | B23 (FREE part) | ok |
| `lko06-mehfil` | wait on a takht till she has spun past going away, then cross | none outside LKO | ok |
| 06 door `lko-sam` | wait on the takht till her stamp | `lko06-mehfil` | **R** (C1) |
| 07 room | pause before the strollers and they part | PNJ-08 freeze, BOM-03 | ok |
| `lko07-shaam` | stop short of the shivering awning till it is down | S11 (kept with this tell) | ok |
| `lko07-batti` | hang back while the ladder swings, go under while he is up | none | ok (one play: C5) |
| `lko07-julus` | walk behind at their pace, wait at each nala; the fourth comes early | I3 (LKO owns pace-behind) | ok |
| `lko07-photo` | run through on the flash; ignore the test flash | none (GTK-5 struck for it) | ok |
| `lko07-dukaan` | pass on the side he looks at: up on the sill | none; not PAT-04 (he never comes at you) | ok |
| `lko07-chauraha` | pause so they part, then run before the awnings from behind | 07 room + S11's taken thought | **R** (C2) |
| 07 door `lko-darban` | pause, then stroll up | 07 room | **R** (C1) |
| 08 room | jump through an arch to go up a floor, walk to stay | `fakewin`/B28 | ok |
| `lko08-chausar` | only the lit squares hold; never the courtier's | PNJ-06 roulette (count + capture keep it apart) | ok (close) |
| `lko08-upar` | go up first, then come down on the arch tops from above | 5d struck LKO-8.4 "down to go up" = GTK-06; this is "up to come down on top": different | ok |
| `lko08-minar` | jump, jump, walk | 08 room | **R** (C2) |
| `lko08-toota` | a crownless arch lifts nobody | none | ok |
| `lko08-mehrab` | walk the hook arch, jump the well arch | 08 room | **R** (C2) |
| `lko08-utar` | through the hanging arch falling: a floor down | none | ok |
| `lko08-wapas` | an arch taken backwards: a floor down | none | ok |
| `lko08-darwaza` | after the hall door the arches moved: look again | B30 | ok |
| `lko08-sargoshi` | keep off the wall ledge; walk the middle | v3 F479 | ok |
| `lko08-roshandan` | light coming down is floor, light coming up is a hole | CHN-05 (ruled S19 keep) | ok |
| 08 door `lko-489` | walk the last arch, step off | 08 room | **R** (C1) |
| 09 room | cross only early in the red | chasers | ok |
| `lko09-gumbad` | jump from the paving line; the reflection the other way | `tiny` | ok |
| `lko09-hawa` | the birds read the far face: go while you see white | flipControls (a reading reversal, not controls) | ok (padding: C6) |
| `lko09-jhande` | the nearer flag wins | W9 keep | ok |
| `lko09-seeti` | a whistle beats any flag; wait on the tank roof | W9 keep | ok |
| `lko09-girah` | a tumble is not a landing: go through it early in the red | 09 room (a decoy on top of it) | ok (close) |
| 09 door `lko-chhatri` | go in early in the red | 09 room | **R** (C1) |
| 10 room | bow only on the plain board, walk the covers | 02 + 06 callbacks | ok (finale room) |
| `lko10-dhulai` | 03's wash, then 04's heaps, as taught | 03 room, 04 room | **R** (C4) |
| `lko10-darbar` | the lit square he bows you on to is the stone | breaks 08 court | ok |
| `lko10-tasveer` | waiting by the group is a bow on the bells | W2 keep | ok |
| `lko10-julus` | behind them at their pace | `lko07-julus` | **R** (C4; W2 said plain is allowed) |
| `lko10-jawab` | return the greeting from the plain board, not on the covers | W2 keep | ok |
| `lko10-raasta` | they part; let the man in the gap go first | 07 room + 02 room | **R** (C4) |
| `lko10-daana` | grain beats the flag | breaks 09 | ok |
| `lko10-chirag` | the side away from the moving lantern holds | 04 room | **R** (C4) |
| `lko10-seedha` | the stamp swaps nothing | breaks 06 guru | ok |
| `lko10-do` | sam on the second | breaks 06 tihai (tihai itself C3) | ok |
| `lko10-thahra` | the maze stays put: run, jump the arch you saw | breaks 08 darwaza | ok |
| `lko10-galiyara` | walk the drain arch, jump the well arch | 08 room | **R** (C4; W2 said plain is allowed) |
| 10 door `lko-tehzeeb` | bow from the plain board, not on the covers | 10 room | **R** (C1) |

**PAT-04's "step aside for an oncoming load; a second follows":** asked nowhere in Lucknow. The nearest are `lko02-kiwad` (one man comes out; the hazard is the door leaves, and you wait out of their sweep) and `lko07-dukaan` (he steps back, never comes along at you). `saamne` is gone from the tree, and `dakiya` is gone from the tree (`git grep` finds neither id in `src/`).

## Section 7: troll quality and readability (frames)
- **Read on death, from fresh frames of my own recordings** (`shots/qa2/D.png`, `E.png`, `F.png`):
  - `charkhi`: Dad hops into the skewer line while it is still flat-looking. The rocking is small at phone size; it reads better in motion (the builder says the same).
  - `guru`: the "Daayan-baayan ulat gaye!" card shows on the flip.
  - `dukaan`: the "Arre!" step-back reads.
  - `chauraha`: the awning over the group reads.
  - `sargoshi`: the guard's "Kaun hai?" and the rail read.
  - `thahra`: reads with its hint (`F.png`).
  - `do`: has tihai's small lamps on a floating dais (`F.png` top row).
- **`tihai`** is the weak one. The three tabla lamps are about 6 px dots behind the arch, the tabla dais floats in the sky, and the tied strips look like grey grating (`shots/qa2/LKO-06__m4-0985.png`). Combined with C3, recast or cut.
- **HWIK 08 (Bhool Bhulaiya):** the tell reads at phone size. The hooks on the gallery above arch 1 are visible before you go in, and on death Dad is plainly a floor up on them (route sheet frames 1-2). One WTF beat only; everything after it is a knowable variant.
- **The light-well (`roshandan`, round 4):** at phone size (`shots/qa2/LKO-08__route-087.png`, `-09.png`) the down-lit beams are clear trapezoids landing on pale floor patches. The holes read as black slots with a lit rim, so "hop the black, land on the lit" reads. The up-lit beams the hint describes ("widens upwards") are not visible as beams in these frames. The read works by dark vs lit floor, not by beam direction. Polish: draw the up-lit beam, or change the hint to what is drawn.
- **Finale law 7:** seedha, do, thahra, darbar, tasveer, jawab and daana break their rule. dhulai, julus, galiyara, raasta and chirag do not (C4).

## Section 8: place and lines
- **Place:** Lucknow reads as itself: Rumi Darwaza, Chowk chikan, Aminabad galouti and sheermal, makhan malai, Kathak, Hazratganj ganjing with its café darban, Bhool Bhulaiya (489 darwaze), kabootarbazi, pachisi, the Gomti dhobi ghat.
- **Lines:** all plausible standard Lakhnavi Hindustani. Two are new since round 1: "Kaun hai?" and "Roshni chal rahi hai!". There are 9 intro lines (02-10), a seventh-death line, Tara's taunt/death/near/win/idle lines, and the guide line. Hidden items: `items.test.ts` green, one per stage.
- **Repetition:** "Intezaar kis baat ka?" is spoken 14 times across the city, and six other lines 6-8 times each.

## Polish (not blocking)
1. "Saat baar! Thala for a reason." quotes a real cricketer's meme. It is the game-wide seventh-death line in 14 cities: the owner's call.
2. "Ek cup aur, janab?" (01): "Ek chai aur, janab?" is more Lucknow.
3. `roshandan`: draw the up-lit beam, or reword the hint (section 7).
4. `charkhi`: give the rocking more amplitude in stills.
5. `lko-shamiyana`'s death line names a "shivering" awning. That only fits `shaam`; it fires in `chauraha` and `dukaan` too.
6. `lko07-julus` (and `lko10-julus`): from the checkpoints after the first and third nalas (x153.7, x177.7), a plain walk forward catches the procession and dies of `lko-julus` within 1.3-2.0 s. That is beyond the sweep's 0.3 s plays, so it is not a checkpoint fault, but the procession is close.
7. 02 `lko02-gali` and 08 `lko08-upar` are close to their rooms (section 4). I accept them as the room's ladder and a new read respectively.
8. The host's playwright cache lacks headless shell 1254 for a fresh `npm ci`; `flows.mjs` needs `CHROME_PATH`.

## To re-test I will need
- C1-C8 fixed on a new tip of `city/lko`, with a FIX-6.md that lists for each finding the part changed and its new one-sentence decision (or "cut").
- For any new or recast act: its NAIVE and FIX plays in `tests/cities/lko.ts`, both dying at lag 0, 6 and 12, to different causes at different ticks.
- Then I rerun:
  - typecheck and the full suite;
  - `LDD_N=80` fair;
  - the lag-captured sweep with the per-tick replay;
  - the 4.5-tile walk probe;
  - my lag-0/6/12 death log;
  - the decision sweep over every room, act and door, and fresh death frames for each changed part.

Not checked: real human play (bots and the timing model only). Death frames were rendered for a sample (charkhi, guru, tihai, dukaan, chauraha, sargoshi, darwaza, do, thahra, the light-well), not every MISTAKE. The 4.5-tile probe uses walking and tap plays only, not every hazard's geometry.
