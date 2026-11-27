# DIS length, round 3: no second windows, new decisions only

Branch `city/dis`, worktree `ldd-wt/dis`. The round started from `5fefcf3`; the tip is **`9b80259`**. develop is merged twice: 9d193f6 as `12504c2`, and 4c38bcb (the strict cpsafe) before the final runs. No push, no version bump. The budget ran 07:40 to 09:35 IST, with 66 minutes lost waiting for an approval prompt that expired (08:05 to 09:11).

## Short version

**Met:**
- **Cuts.** The loom is gone, as are the eight second windows of a room's rule. 05 `atithi` and 09 `chaal` stay, each labelled as its stage's momentum beat.
- **Rooms.** The decisions of rooms 01 and 06 are changed, because 01 repeated Patna 04 and 06 repeated Kavaratti 08.
- **New acts.** Three are built from DIS-IDEAS-2: `dis07-dheki`, `dis07-card` and `dis10-thanda`. Each passed the decision gate first.
- **Tests.** The strict `tests/cpsafe.test.ts` is green for all ten DIS stages, and so is the full suite: 1736 passed, 12 skipped, with DIS on no allow-list.
- **Replay.** Every replay is ≤ 7.7 s at lag 0, 6 and 12, and every stretch is ≤ 9.2 s.
- **Fairness.** LDD_N=80 is ≥ 90% at 6 and 12 ticks on every stage and every stretch. Typecheck and flows are clean, and all ten sheets were re-recorded and read.

**Not met:**
- **Floors.** Nine of ten stages are under their floors; only 03 meets its band. The cuts took more out than the three new acts put back. The research file gave nothing buildable for 05, 06 (beyond the room) and 09; reasons per stage are below.
- **Captures.** The late-checkpoint counter is restored, and at lag 12 it reads 26, not 0. The game never respawns into any of these: `probeSafe` in `src/game/replay.ts` drops a save where standing still for 1.5 s dies. The bar as written is still not met (see the checkpoint section).

## Route times, before and after (seconds; the route's `winTick / 120`)

| Stage | Floor | Round 2 end | Round 3 end | Short by | Why it fell, and why it stops here |
| --- | --- | --- | --- | --- | --- |
| DIS-01 | 25-35 | 26.0 | 22.6 | 2.4 | The bench rework made the room shorter. A second beat would be another tea boy, which is the same decision. |
| DIS-02 | 25-45 | 26.2 | 19.1 | 5.9 | `dhar` is cut (second window). The research gave 02 nothing; F1 (the pontoon) is a finale idea. |
| DIS-03 | 25-45 | 40.2 | 40.2 | - | - |
| DIS-04 | 25-45 | 25.3 | 18.6 | 6.4 | `tawa` is cut (second window). F4 (the cold pan) went to 10, where it breaks 04's rule. |
| DIS-05 | ≥ 60 | 27.7 | 12.4 | 47.6 | The loom and `biya` are cut. The research's 05 ideas are a tell (`xorai`, a second window of the gamosa rule) or a second dheki (one city, one dheki). |
| DIS-06 | ≥ 60 | 25.3 | 10.2 | 49.8 | The room is now the bamboo spurs. The stilt house act was the same decision as 06's door, and `chapori` and `majuli` were the slab clock, so all three are gone. Idea 5 (the river bend) is the spurs' own family. |
| DIS-07 marathon | ≥ 120 | 66.4 | 64.4 | 55.6 | `ghar` is cut. The dheki and the time card are added, and the dhol is one plank shorter for replay. Saraighat's two decks (idea 2) is not built (see the last section). |
| DIS-08 | ≥ 60 | 54.6 | 38.7 | 21.3 | `kaziranga` is cut (second window, and a repeat of `bagori`). 08 was not in the research brief. |
| DIS-09 | ≥ 60 | 26.6 | 21.8 | 38.2 | `dhal` is cut. Idea 7 (thin-brick steps) needs walking up half-tile courses, and the engine has no step-up. Idea 6 (bell-metal disc) is the dheki's still-point decision again. |
| DIS-10 finale | ≥ 90 | 40.6 | 42.5 | 47.5 | The cold pan (F4) is added. F1-F3 are not built (time). |

## Rooms: the decision in one sentence

| Stage | Decision | Closest shipped or ruled-taken idea | Verdict |
| --- | --- | --- | --- |
| 01 (reworked) | A tea boy walks at me with a tray I can't touch or hop; I wait well back from the bench where he stops to pour, and walk past him while his tray is down. | PAT-04, step aside for an oncoming load (and a second follows) | Different. There is no lay-by and no stepping aside: you pass the load during the carrier's pause, and waiting too close or too long both meet the tray. The ghat lay-by is gone. Hopping him lands you in the spilled tea, now its own cause, `dis-pool`. |
| 02 | After each siren the bars move to where the level post's next mark says; I stand on a bar the next mark keeps and go when the new one has risen. | "a pattern that decides which part is floor" | **Close.** The post is a readable clock for which floor exists; the bars move rather than toggle in place. Kept with this sentence for your ruling. |
| 03 | A plucker walks the tea rows ahead; I follow a few steps behind, because the rows step down only where she has picked and her basket swings when she turns. | none shipped (follow a worker) | ok |
| 03 door | Raipur's reel carries you across; ours kills you if you stay on, so you step off the rising cocoon at the top. | RPR-06 kosa reel | accepted (your ruling) |
| 04 | Shiny crepes hold me and matte ones roll me up; I stand only on shiny and leave before mine dulls. | KVT "a float that sinks when you stop"; fake floor with a tell | **Close.** Standing still on a shiny crepe is safe; the roll comes from the crepe's age, not from your stop. Kept with this sentence for your ruling. |
| 05 | Every host who touches me adds a gamosa, and three hide my feet; I hop the givers and walk into a red-sash host to give one away. | LKO-02 bowing | Different: contact gives the gamosa away, and the camera hides the floor. |
| 06 (reworked) | At each bamboo spur I jump to the sand step that the silt builds on its downstream side, and never stand on the slab in front of it (the river takes that one early) or on the spur (it is only poles). | KVT-08 don't stop or it goes under you (ruled taken); DIS-IDEAS-2 idea 4 | Different. Waiting is right, but only behind a spur. The current lines on the water show which side is which. |
| 07 | Gates open only for the husori group with me inside its ring; I walk at their pace inside the ring. | none shipped (join a moving group) | ok |
| 08 | A rhino charges the jeep's dust and flattens the only path; I wait for the charge and walk its strip. | GNR-05 lions, chasers | ok (you use its path) |
| 09 | The oiled roof pushes me down; I stop on each grip pad, take a run, and jump rib and oil together. | none shipped | ok |
| 10 | Callbacks only, and each breaks the rule it taught (see the act table). | | |

## Acts per stage, in order

| Stage | Part | Decision | Closest shipped idea | Label |
| --- | --- | --- | --- | --- |
| 02 | `dis02-chapori` | The bar I land on narrows from its right end, so I go on to the farmer's hut bar, which never moves. | KVT-08 sandbar | twist |
| 03 | `dis03-bagan` | A sprinkler wets the path so I can't stop; I wait before the pipe until it dries, then follow her. | DMN-03 slippery ice | twist |
| 04 | `dis04-bhogali` (now with a 3-column run-up) | A slow cook: I wait on each crepe until the next one shines, then hop. | DIS-04 room | twist (waiting is right here) |
| 05 | `dis05-atithi` | The same gamosa rule, then a giver right before a pit that I hop over. | DIS-05 room | **momentum beat** (quick re-application) |
| 07 | `dis07-bordoisila` | The wind and then hail come; I get under the granary and stay till it passes. | LKO-07 lamplighter shelter | shelter beat |
| 07 | `dis07-dhol` (9 planks, run-up) | Planks rise on the beat and the beat quickens; I hop one plank per beat. | JAI-02 dance beat; timed platforms | momentum beat |
| 07 | **`dis07-dheki`** (new) | On a husking lever worked by someone else's foot, I stand on its pedestal, cross the tail while she presses it and the mortar while the pestle lies in it; two women make a quick first fall that I let go. | GNR-10 nodding pump arm (you ride it); KOH-03 seesaw | new: nobody rides anything; the still point is the answer |
| 07 | **`dis07-card`** (new) | The exit gate opens no earlier than my card says, and deer cross at marked corridors; I spend the time on the bench, which no corridor reaches. | BLR-02 wait for the green man; GTK-05 warden pause; RPR-03 time only when moving | new: a minimum time, printed in your hand from the start |
| 07 | `dis07-chowk` | At the middle gate the host gives the singers gamosas first; I stay in the ring until it opens. | DIS-07 room | twist (the ritual timer) |
| 08 | `dis08-jeep` | The rhino stops halfway at a first jeep; I stay back till a second jeep sends it on. | DIS-08 room | twist |
| 08 | `dis08-bagori` (run-up) | The rhino starts behind me; I get on the hay and come down only when both charges have gone. | DIS-08 room | twist |
| 09 | `dis09-tug` | The rope is floor only while taut and drifts to the winner; I go when the far team's flag is up. | "a pattern decides which part is floor" | different: the floor moves with the score |
| 09 | `dis09-chaal` | The roof goes on: the same pads, run and leap, with a ball in every stretch. | DIS-09 room | **momentum beat** |
| 10 | `dis10-dhol` | The drummer slows; I hop only when the next plank is up. | 07 dhol | callback, breaks it |
| 10 | `dis10-bordoisila` | The old granary falls; I jump the channel on the gust instead of sheltering. | 07 storm | callback, breaks it |
| 10 | `dis10-tug` | The teams changed ends; I go on the green flag now. | 09 tug | callback, breaks it |
| 10 | **`dis10-thanda`** (new, research F4) | The fire is out and the cook asleep, so matte is the floor and the shine is only oil. | DIS-04 own; CHP-05 solid from the shining side | callback, breaks 04's shine rule |
| 10 | `dis10-gamosa` | A hop over the third giver lands me in the fourth's arms; I clear both in one long jump. | 05 gamosa | callback |

Tara's intro lines for the new acts, all U (the research's own Assamese):
- `dis07-dheki`: "Dheki-t bhori nidiba, Dad! / Don't put your foot in the dheki, Dad!"
- `dis07-card`: "Aagote nahiba, Dad. Card-ot likha ase. / Don't come early, Dad. It's written on the card."
- `dis10-thanda`: "Zui nai, randhoni xuise. / No fire, the cook's asleep."
- DIS-06 room: "Porcupine-r pisofale thiya diya. / Stand behind the porcupine."

**Cut this round:**
- `dis05-taat`: the loom.
- The second windows: `dis02-dhar`, `dis04-tawa`, `dis05-biya`, `dis06-majuli`, `dis07-ghar`, `dis08-kaziranga` and `dis09-dhal`.
- `dis06-chang`: it was 06's own door decision.
- `dis06-chapori`: the slab clock.

## NAIVE / FIX cause@tick

Played with `play()` from the stage route up to each act's start, at `9b80259`. The full list is in `probes/causes-r3.txt`.

| Stage | Part | NAIVE | FIX |
| --- | --- | --- | --- |
| 01 | room | dis-spill@1143 | dis-pool@1189 (new trap: the spilled tea) |
| 04 | room | dis-tawa@180 | dis-roll@476 |
| 06 | room | dis-porcupine@199 | dis-bank@215 (waits on the slab in front of the spur) |
| 07 | room | dis-gate@277 | dis-hail@1335 (from `dis07-bordoisila`) |
| 07 | `dis07-dhol` | dis-pukhuri@1960 | dis-dhol-sink@2691 |
| 07 | `dis07-dheki` | dis-dheki@3024 | dis-dheki-tail@3071 |
| 07 | `dis07-card` | dis-gate@4109 | dis-horin@4275 |
| 08 | room | dis-beel@109 | dis-gorh@433 |
| 08 | `dis08-jeep` | dis-beel@1013 | dis-gorh@1699 |
| 08 | `dis08-bagori` | dis-gorh@2626 | dis-beel@3509 (now a real FIX: stepping off early meets the grass) |
| 09 | room | dis-roof@201 | dis-gutter@119 |
| 09 | `dis09-tug` | dis-khaal@722 | dis-rope@1017 |
| 10 | room | dis-luit@237 | dis-rope@2807 (from `dis10-tug`) |
| 10 | `dis10-dhol` | dis-pukhuri@995 | dis-dhol-sink@1043 |
| 10 | `dis10-bordoisila` | dis-bordoisila@2106 | dis-bhoral@2198 |

All 15 pairs die to different causes on different ticks. Seven stages have a stage-level FIX: 01, 04, 06, 07, 08, 09 and 10.

**One play** (`ONE_PLAY` in `tests/cities/dis.ts`). Each of these has a one-line reason and one scripted death, and its second death is not counted as a FIX:

| Part | Reason | Scripted deaths |
| --- | --- | --- |
| DIS-02 room | The river under a bar that is not there is the only hazard. | dis-luit@237, @486, @760 |
| DIS-03 room | The plucker's basket is the only hazard. | dis-basket@67, @2625, @94 |
| DIS-05 room / `atithi` | Three gamosas over your feet at the pit. | dis-gamosa@247, @699 |
| `dis07-chowk` | The stakes: early, late and out of the ring all meet them. | dis-gate@4995 |
| `dis09-chaal` | The ball down the oil. | dis-roof@1980 |
| `dis10-thanda` | The oil is the cold pan's one trap: shine now means a slide. | dis-tel@3486, @3554 |
| `dis10-gamosa` | The blinding gamosa at the pit. | dis-gamosa@4078, @4120 |

**Scripted MISTAKES on the marathon and finale.** New this round in 07:
- `dis07-dheki`: goes on the two women's first, quick fall (dis-dheki@3619).
- `dis07-card`: waits at the gate for the card, where the deer cross (dis-horin@4425).

These add to the door death (dis-net@7631) and the act deaths above. DIS-10 has one death or more per act: dhol, bordoisila, tug, thanda and gamosa.

## Repeat windows

The probe script is `probes/windows.py`, run over the replay probe's per-sample signatures (`probes/replay-*-r3.txt`). It samples every 0.5 s along the route, recording what stopping, running and jumping die of from that point at lag 0. A **window** is a run of equal signatures with a death. Two windows are **identical** when they have the same signature and the same length inside one act.

| Stage | Part | Windows | Identical repeats | Most repeated |
| --- | --- | --- | --- | --- |
| 01 | room | 21 | 4 | 2× a 1.0 s "jump dies to the tray" |
| 02 | room / `chapori` | 7 / 10 | 1 / 4 | 3× 0.5 s |
| 03 | room / `bagan` | 6 / 10 | 1 / 4 | 3× 0.5 s |
| 04 | room / `bhogali` | 5 / 11 | 1 / 2 | 3× 0.5 s |
| 05 | room / `atithi` | 5 / 5 | 1 / 0 | |
| 06 | room | 8 | 0 | |
| 07 | room / bordoisila / dhol / dheki / card / chowk | 2 / 6 / 7 / 9 / 8 / 7 | 0 / 1 / 0 / 1 / 1 / 1 | 2× ≤ 1.0 s |
| 08 | room / jeep / bagori | 4 / 4 / 7 | 0 / 0 / 0 | |
| 09 | room / tug / `chaal` | 7 / 6 / 8 | 1 / 1 / 3 | 3× 0.5 s (chaal, the momentum beat) |
| 10 | room / dhol / bordoisila / tug / thanda / gamosa | 8 / 11 / 5 / 10 / 6 / 9 | 0 / 3 / 0 / 1 / 1 / 3 | 3× 0.5 s |

The ending's stretch is counted with the last act. The repeats are single half-second samples recurring, at most three times and at most 1.0 s long. They are not a hazard instance repeated many times, which is what PAT/LKO QA flagged (18 seams, 16 heaps). The longest identical window anywhere is 2.0 s, appearing twice, in 03's room and in 09's tug.

## Checkpoints, three lags, and the late-checkpoint proof

The probe is `probes/dis-replay.test.ts.txt`; outputs are `probes/replay-all-r3.txt`, and `replay-06-07-08-10-r3.txt` for the stages changed after the first run. The route is replayed as inputs. Every 0.5 s the player stops, runs or jumps, `L` ticks late (L = 0, 6, 12), for up to 12 s:
- **Replay** is the route time from the respawn checkpoint to the point where he went wrong. If he passed a later checkpoint first, it is the time from passing it to the death.
- **Capture** is the case where the wrong move passes a checkpoint first and standing still 1.5 s from that save dies. This is exactly the game's `probeSafe`.

| Stage | Checkpoints passed (s) | Longest stretch (s) | Worst replay at lag 0 / 6 / 12 (s) | Captures at lag 12 |
| --- | --- | --- | --- | --- |
| 01 | 2.9 5.5 6.5 8.3 12.8 21.2 | 8.4 | 7.2 / 7.3 / 7.3 | 14 |
| 02 | 7.1 9.3 14.7 | 5.4 | 4.7 / 4.7 / 4.8 | 0 |
| 03 | 7.4 15.7 16.7 23.4 29.7 32.6 34.5 | 8.3 | 7.1 / 7.2 / 7.2 | 2 |
| 04 | 6.8 6.9 12.8 | 5.9 | 5.2 / 5.2 / 5.3 | 0 |
| 05 | 3.6 5.2 7.3 10.1 | 2.7 | 1.8 / 1.9 / 1.5 | 0 |
| 06 | 5.7 | 5.7 | - (no death row) | 0 |
| 07 | 21 checkpoints, 1.7 to 61.8 | 8.3 | 7.7 / 7.3 / 7.3 | 4 |
| 08 | 7.8 15.0 19.5 19.6 28.7 30.2 31.6 | 9.2 | 6.4 / 6.3 / 6.3 | 3 |
| 09 | 4.6 4.7 12.6 13.0 14.5 16.3 18.6 | 7.9 | 6.3 / 6.4 / 6.4 | 1 |
| 10 | 15 checkpoints, 7.1 to 35.0 | 7.9 | 7.3 / 7.3 / 6.9 | 0 |

No replay is over 8 s; before this round's fixes the worst were 8.2-8.3 (07 dhol), 12.5 (08 bagori) and 9.1 (10 post-bank). No stretch is over 25 s.

**The three 0.0 s rows from round 2** (01 s6, 08 s3, 08 s5) are traced. In each, the death came after the player had passed a later checkpoint than the one he held when he went wrong, and the old probe clipped the negative replay to 0. They are captures in the definition above.

**Captures.** There are 26 at lag 12 (01: 14, 03: 2, 07: 4, 08: 3, 09: 1); `probes/replay-all-r3.txt` lists each one. All 26 come from a sustained run or jump that reaches a checkpoint earlier than the route does, while that checkpoint's hazard is live. Examples: in 01, spamming jump from the start reaches cp4 while the tea boy is still walking at it; in 07, jumping on to the dhol's far plank row. The game never respawns into one: `session.ts` saves the first pass of a checkpoint, and `probeSafe` (`src/game/replay.ts`) refuses a save where standing still 1.5 s dies. Dad then respawns at the previous safe save, so the replay is that earlier stretch, which is ≤ 8.4 s for every captured case. The route's own saves are proven safe by the strict cpsafe test (idle 4 s, run 0.3 s, tap-jump, lag 0/6/12). The bar "0 captures" is not met as a raw count; the game's own guard keeps any of them from becoming a respawn.

**The strict cpsafe (develop 4c38bcb): before and after.**

Failing before (my run after the merge, on this round's acts):

| Stage | Checkpoints that failed | Cause |
| --- | --- | --- |
| DIS-04 | cp0 x32.5, cp1 x33.5 | dis-roll |
| DIS-05 | cp1 x47.5 | dis-gamosa |
| DIS-06 | cp2 x66.5, cp3 x67.5, cp4 x84.5 | dis-bank |
| DIS-07 | cp0 x18.5, cp10 x114.5, cp12 x138.5, cp14 x162.5 | dis-gate |
| DIS-07 | cp3 x41.0 | dis-bordoisila |
| DIS-07 | cp6 x59.5 | dis-dhol-sink |
| DIS-08 | cp2 x72.5, cp3 x73.5 | dis-gorh |
| DIS-10 | cp1 x33.5 | dis-dhol-sink |
| DIS-10 | cp3 x64.5, cp4 x65.5 | dis-hail / dis-bhoral |
| DIS-10 | cp12 x162.0, cp13 x180.0 (idle) | dis-luit |

After, every DIS stage passes. The changes:
- **Run-ups.** The 04 pan, both dhol ponds, 08 `bagori` and the 10 storm get three more columns of bank (`runUp` in `levels.ts`), so the act-start checkpoints sit ≥ 4.5 tiles before the trap.
- **07 room checkpoint.** Moved from 18.5 to 16.
- **07 gate checkpoints.** The `chowk` checkpoints moved from 18.5/42.5/66.5 to 16.5/40.5/64.5, 4.5 tiles back from the stakes.
- **07 bhoral.** The checkpoint under the bhoral (storm act +9) is removed.
- **05 `atithi`.** Its checkpoint moved from +15.5 to +14.5.
- **10 post-bank.** The ending's checkpoint moved from D-36 to D-38 (5 tiles from the water). The D-18 checkpoint on the plucker's path is removed, and her speed is 56 to keep replay ≤ 8 s.
- **06.** The 06 rework removed the bank checkpoints.
- **08 `bagori`.** Two checkpoints are added on its strips (+18 and +31), and the rhinos' rests are shorter.

Every checkpoint the route takes survives idle, a 0.3 s run and a tap-jump at lag 0, 6 and 12 (the strict cpsafe), so no moving hazard or edge is in reach at capture. I did not re-run round 2's separate trigger probe (see the last line).

## Fairness, LDD_N=80

```
DIS-01: 6t 100%  12t 100%  18t 100%   stretches 0-12t all 100%
DIS-02: 6t 100%  12t 100%  18t 84%    all 100%
DIS-03: 6t 100%  12t 100%  18t 100%   all 100%
DIS-04: 6t 100%  12t 100%  18t 100%   all 100%
DIS-05: 6t 100%  12t 100%  18t 76%    all 100%
DIS-06: 6t 100%  12t 100%  18t 93%    all 100%  (after its route fix; the first run was 88% at 12t, a late jump off the bank edge)
DIS-07: 6t 100%  12t 100%  18t 80%    all 100%
DIS-08: 6t 100%  12t 100%  18t 100%   all 100%
DIS-09: 6t 100%  12t 100%  18t 100%   all 100%
DIS-10: 6t 100%  12t 100%  18t 76%    all 100%
```

Full output: `fair-N80-round3.txt`. Causes under 90% at 18 ticks, parked for the owner:
- **02 (84%):** a jump 18 ticks late lands on a bar as it narrows.
- **05 (76%):** a late hop over the giver before the pit lands in his arms.
- **07 (80%):** the dhol's quick beat; 18 ticks is longer than the gap between planks.
- **10 (76%):** the slowed dhol and the gamosa hop, the same two.

## Checks

- **Full `npm test`** with DIS on no allow-list, at `9b80259`: 18 files passed, 12 skipped; 1736 tests passed, 12 skipped. No test timed out.
- **Earlier failure, fixed.** The first full run failed `allocation.test.ts`, because 06's meta family had been renamed. `docs/allocation.json` is shared, so 06 keeps its allocated label (`bank-retreats-in-slabs`). The label should move to the spurs when the allocation's owner updates the file.
- **`npm run typecheck`:** clean.
- **Build and flows:** `npm run build:single`, then `node scripts/flows.mjs`: no errors.
- **Sheets:** all ten re-recorded and read: 01 (the boy pours at the bench, tray down, Dad passes), 06 (spurs, silt steps, tea-ladder door), 07 (the dheki row, the card and the deer), 08, 10 (the cold pan), and 02-05 and 09. 07 was re-shot after the card was limited to its road. All are copied to `shots/`.
- **Docs:** `docs/cities/DIS.md` has the section "Length, round 3: no second windows, new decisions only", plus new stage-table rows for 01 and 06.
- **Tip sha:** `9b80259`.

## Not built, and why

- **Saraighat's two decks** (idea 2, 07): it needs two stacked decks with pier ladders and a train filling the lower deck. There was no time after the approval wait, and the engine has no ladder climbing (only palm trunks), so the deck change needs a new climb.
- **Thin-brick steps** (idea 7, 09): the player cannot walk up half-tile steps (no step-up in `player.ts`), and the rule is "never jump".
- **Bell-metal disc** (idea 6, 09): the same still-point decision as the dheki. The research says to build only one.
- **Xorai lid** (idea 8, 05): a tell on 05's own rule, so a second window.
- **Dheki in 05** (idea 9): the dheki is in 07.
- **River bend** (idea 5, 06): the same family as the spurs.
- **F1 pontoon, F2 roof after rain, F3 pruning** (10): not built for time. F2 also needs walking over half-height ribs (no step-up).
- **F5 and F6:** ranked as fillers, and F6 would bring the rhino back.

Not checked: the trigger probe from round 2 was not re-run as a separate script. The 3.5-tile rule is covered by the strict cpsafe plays and by the replay probe's capture rows, and neither shows a respawn into a live hazard.
