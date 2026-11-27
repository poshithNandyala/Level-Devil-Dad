# ITA · Itanagar (Arunachal Pradesh): build report, round 2 (the finale, the doors, the proofs)

**Branch** `city/ita` in `/local/home/saiposh/personal/ldd-wt/ita`, tip `30f994bf2f6b075a7d67b7c371d81ffeec4ff5e0` (merges `origin/develop` 412039f, v0.17.3).
Nothing pushed, no version bump. `git diff --name-only origin/develop` shows only `src/game/cities/ita/`, `tests/cities/ita.ts`, `docs/cities/ITA.md`.
Written 09:07-09:20 UTC, 27 Nov 2026 (14:37 IST) by the round-2 builder (work item it_625dd082, budget 90 min from 08:18 UTC).

This round: `s10.ts` (the finale: a room and four law-7 callbacks, a plain door), the uncommitted `s02`/`s08` candidates of round 1 gated and
**rejected** (reverted, see §2), every door checked against the registry (eight of nine made plain), two lag fixes in the shared `wall()` of 09
and the finale's sluice, and the proofs in §5-§7. The sheets are in `shots/` next to this file.

## 1. What does not meet the bar, and why

| # | What | Bar | Measured | Why / what I did |
| --- | --- | --- | --- | --- |
| 1 | **Finale length** | 90 s floor | **27.3 s** (par 37) | Four callbacks and a room at their honest length. Padding the decks with longer waits would add seconds, not decisions; rides were not built (no fiction-true ride on a cane bridge, and no time). Honest number. |
| 2 | **Length of 02-09** (round-1 stages, unchanged by me) | 02-04: 25-45 s; 05/06/08/09 >= 60 s; 07 >= 120 s | 02 22.8 s, **03 17.0 s, 04 16.8 s**, **05 37.6 s**, **06 32.8 s**, **07 49.0 s** (marathon), **08 9.9 s**, **09 19.1 s** | Every stage but 02 is short of its floor; 07 at 49 s is less than half the marathon floor. Round 1 reported 03/04/05 short; 06-09 were never measured against the floors. Not fixed in this round (time went to the finale, the doors and the proofs). |
| 3 | **Fairness** (`LDD_N=80 npm run fair -- ITA`) | 90% at 12 ticks, 95% per stretch | **01 56%** (s5, the arch hop, 56%), **03 50%** (s1 the big herd, 50%), **05 19%** (s0 79%, s3 the squirrel act 24%), **08 10%** (s0 the first raft, 10%) | All four are round-1 stages whose routes are lag-fragile: 01's long hop over the arch brick (`ita-pop` at lag 6), 03's hop off the young one (its graze is 1.0 s), 05's hop timing for a landing cluster (`ita-khai`), 08's hop from the bank on to the first band (`ita-nadi`: with 12 ticks of lag Dad has walked on to the plain pole before the jump registers; coyote time is 11 ticks). 02, 04, 06, 07, 09 and **10 are at 100% / 100%**. |
| 4 | **Lag-captured sweep: route at lag 6/11/12** | the route wins at lag 0/6/11/12 | 01 dies at lag 6 (`ita-pop` @80); 03 at lag 11/12 (`ita-keechad` @44); 05 at lag 6/11/12 (`ita-khai` @80-81); 08 at lag 6/11/12 (`ita-nadi` @10) | Same four stages as row 3, same causes. 02, 04, 06, 07, 09, 10 win at every lag and spawn-idle offset. (10 died at lag >= 6 in act B before the `wall()` fix below; after it, it wins everywhere.) |
| 5 | **Walk-4.5** (every checkpoint >= 4.5 tiles before a hazard a walk or tap-walk reaches) | 0 deaths | **03** act start (mud at +3.5 tiles, `ita-keechad`), **05** both act starts (gorge at +3.5, `ita-khai`), **06** act start (full tank at +3.5, `ita-doob`): 16 walk45 + 16 tapwalk45 deaths each | The act-start checkpoint sits at `c.x + 0.5` and the hazard at `c.x + 4`. The fix is one line per act (`cp0: false` plus a `cps` entry 1-2 tiles earlier, or moving the hazard to `c.x + 5`); not done this round. 01, 02, 04, 07, 08, 09, 10: 0 deaths. |
| 6 | **Replay <= 7.5 s** | from the lag-captured checkpoint to every scripted death | **02 FIX 8.38 / 8.43 / 8.48 s** (the bundle sweep in the first bay), **05 m0 8.75 s, m1 7.9 s** | 02 needs a checkpoint between the room's trigger and the first bay (or the first bay nearer the start); 05's dusk and squirrel acts need a checkpoint mid-canopy. Not done. Everything else <= 7.25 s. |
| 7 | **Two causes at two ticks at lag 0/6/12** | every scripted death keeps its cause at every lag | 05 FIX at lag 6/12 dies of `ita-khai` not `ita-anjeer`; 08 FIX at lag 6/12 of `ita-nadi` not `ita-rassi`; 09 FIX at lag 6 of `ita-malba` not `ita-kaanta`; 01 NAIVE at lag 6/12 does not die | The play's lag changes which trap it meets first; the stage still kills it (01 NAIVE excepted: at lag the hop clears the loose brick). Every ITA-10 play keeps its cause at all three lags (§4). |
| 8 | **Doors** | a new idea in its city, or plain | 8 of 9 plain | §2: the earlier door twists were either the stage's own rule again (03, 07, 08, 09) or a shipped thought (02 = DMN-07, 05 = KVT-08, 06 = TVM-03). Only 04's packing shed stays. Plain is accepted by the brief; it does make the city's doors quiet. |
| 9 | **Act C vs LKO-05 (`lko05-ghee`)** | registry | listed, not ruled | "Go through while the water pours" and "hop while the fresh ghee sizzles" both act in the active phase. I kept act C because the pour there is a *hold* (what keeps the gate open), not a *tell* (freshness), and the registry already keeps TVM-03 / LKO-05 apart on this axis (S20). If ruled a collision, act C becomes a plain tank crossing and the finale drops to ~21 s. |
| 10 | **Skipped** | | | No ride segments. No `docs/MECHANICS.md` / `CITIES.md` rows (integrator's). The HWIK tell (08's bands) read at 1.5x: dark knots on alternate poles, small (8x6 px drawn); the frayed band's twitching ends appear only in the act. |

## 2. The decision gate

The test (DECISIONS.md): two parts share a decision when a player who learned the first would solve the second by the same thought with nothing new
to work out. Checked against the registry (lists 1-2, §5 rulings), the allocation (slot 10 F432: callbacks only; the bridge's step-aside belongs to
PAT-04) and ITA's own nine rows (the one-sentence decisions written from the code are in the first table).

### ITA's nine rows, from the code

| Stage | Decision (one sentence) |
| --- | --- |
| 01 tour | Every brick has pale mortar round it but one: the loose brick (dark gap, a crack) gives way under a landing and drops from the arch on to a landing: land on the mortared ones, never under the loose one. |
| 02 | Nothing passes on the one-lane deck: get down into a bay before the porter reaches you, and read his load: a cane bundle sweeps the shallow bay, only the deep bay clears it. |
| 03 | A mithun is a step only while it grazes (head down); go on the lead's dip; the young one lifts long before the others, so wait on the back behind it. |
| 04 | Shake the tree from its uphill side so the oranges roll away from you into the baskets (a full basket is a step); count the shakes, one too many drops the harvester's basket on you. |
| 05 | Clusters drop as platforms in ripeness order (nearest orange next; dusk inverts the read); wait on the far side from the next one; stand still when the squirrel passes. |
| 06 | A full tank is deep, a low tank a floor; the lever drains the tank after it and the channel shows where the water goes, arriving 1.5 s later as a surge: never be in that tank. |
| 07 | Push the truck in bursts chock to chock; be off it when the cab shakes (the cough follows a second later); rest only where it has settled past a chock. |
| 08 HWIK | A banded pole is tied and holds; a plain pole spreads the raft; a frayed band snaps and whips: hop band to band, hop over the frayed one. |
| 09 | Pull the bottom brick: fresh pale mortar above holds a doorway, dry mortar slumps on you; the top course carries spikes, so a slumped wall is a stub to pull down to one and hop. |

### The finale (ITA-10 Subah), gated before building

| Part | Decision (one sentence) | Breaks (law 7) | Gate: nearest owners and why it is not theirs | Cause / line |
| --- | --- | --- | --- | --- |
| Room, the deep bay | A brick porter over the deep bay loses his load and follows it in: the bay that cleared you takes him, so stay on the deck short of the bay until he is in, then cross over the bricks. | 02 ("get into the deep bay before he reaches you"): the 02 play dies under the bricks and the man. | PAT-04 step-aside: the opposite (you do not step aside, he never arrives). 02: the opposite bay choice is not a "read the load" either, there is one bay. "Stand still / wait for the cycle": no cycle, one porter; the wait is incidental as in every 02 bay. Allocation F432 twist (porter carries bricks, the pile slumps into the passing bay): kept, with him going in after it. | `ita-dher`: "The brick porter lost his load over the deep bay and came down into it, on top of you." / "The deep bay is where a brick porter ends up. Stay on the deck short of it until he is in." |
| Act A `ita10-pul` (02) | His pile tips as he clears the shallow bay and the bricks come off the back of his load on to whoever is climbing out behind him; the shed bricks on the span hold the gate open, so there is no rush. | 02's door as built in round 1 ("let him pass you in the bay, then follow close behind him through the gate while he holds it"). | DMN-07 / DIS-10 door (follow close behind the walker): the opposite. PAT-04: not re-asked (the bay is the same bay as 02's, the new work is what holds the gate and when the bricks fall). | `ita-peeth`: "His pile tipped as he cleared the bay: the bricks came off the back of his load, on to you." / "Stay down in the bay until they have landed." |
| Act B `ita10-mehraab` (09) | The spiked stub stands under the fort's arch and its loose brick (the tour's tell): hopping the stub lands you under it; pull the stub down too and walk under. | 09 ("pull once, step back, hop the spiked stub"). | 09's own rule says hop; the tour's rule says never land under the loose brick; the new thought is that a stub can be pulled to nothing. CCU-04 `thak` (a pile bought down from the bottom) is a wait, not a pull. | `ita-mehraab`: "You hopped the stub and landed under the arch: its loose brick came down on you." / "Pull it down too, step back, and walk under." |
| Act C `ita10-mori` (06) | This sluice gate is held by the pour alone and drops the moment the pour stops; the water goes over its top into the river beyond, so go through under the pour, not after it. | 06's door as built in round 1 ("the pour is deadly; go in the 1.5 s gap after it stops"). | TVM-03 (cross after the pour): the opposite. LKO-05 `ghee` (hop while it sizzles): listed as the near pair, row 9 of §1. ITA-06 room: not re-asked (no channel read). | `ita-kapaat`: "The sluice gate dropped on you the moment the pour stopped." / "This gate is held by the pour alone... Go through while it pours." |
| Act D `ita10-tokri` (04) | The stair is already hung (empty baskets at step height) and the tree already shaken (every notch lit): climb it as it is; one shake and the harvester's basket comes down on the shaker. | 04 ("shake from uphill, three shakes build the stair"). | 04's own rule (shake) is the death; "count the notches" is 04's tell used against it. DIS-10 `thanda` (the maker is gone, the aged state is safe): different object and different read (a lit count, not age). | `ita-aakhri`: "You shook a tree already shaken: the harvester's basket was on its last notch." / "Every notch lit means the next shake drops it. The stair is already hung: climb it without a shake." |
| Door | **Plain.** The road ends at the door, walk in. | | No legal door idea was left: the allocation forbids the sun line, and every finale noun (bridge, bricks, sluice, baskets) is already an act. | `meta.ending: 'ita-subah-plain-door'` |

Round 1's uncommitted candidates, gated and **rejected** (reverted with `git checkout`): the brick porter whose pile slumps into every *shallow* bay
(`s02.ts`) is 02's own decision in new clothes (read the load, pick the bay the load does not reach); the slack-band rafts (`s08.ts`, bands hang
loose and plain poles sit in a frame) invert 08's tell without a new thought (read the lashing) and are not one of the four allowed callbacks.

### The doors (checked like acts)

| Door | Round-1 idea | Decision | Verdict |
| --- | --- | --- | --- |
| 02 `ita-phatak` | the cane gate hangs open while a porter is on the span; follow close behind him | the way exists just behind the walker | **Borrowed**: DMN-07 `paintwall` / DIS-10 door (S8 ruling). Plain. |
| 03 `ita-baada` | the bar is held up by the grazing head; cross while its head is down | a mithun is usable while grazing | 03's room again. Plain. |
| 04 `ita-peti` | the rope's shadow slides to where the next crate lands; cross right after a drop | a sliding shadow forecasts the next landing: cross behind it | **Kept.** Nearest: CHN-04 `catch` (run *to* the ball's shadow) is the opposite use of a shadow; GNR-03 `jali` (a shadow is a hole) is a static read. |
| 05 `ita-khokhla` | the round fig rolls if you stand on its edge; cross the middle without stopping | don't stop on the tilting floor | **Borrowed**: KVT-08 sandbar (S9 ruling). Plain. |
| 06 `ita-mori` | the pour holds the gate; go in the 1.5 s gap after it stops | cross right after the pour | **Borrowed**: TVM-03 tea pour (S20). Plain. (Act C of the finale is this sluice turned round.) |
| 07 `ita-tailgate` | the tailgate's exhaust coughs on a rhythm, a rumble first; walk in after a cough | tell, then cough: be clear | 07's room again. Plain. |
| 08 `ita-ghat` | one pole with a frayed band; one running jump | a frayed pole is not a step | 08's act again. Plain. |
| 09 `ita-darwaza` | a two-brick spiked wall; pull, step back, hop the stub | 09's act exactly | 09's act again. Plain. |
| 10 | | | Plain (above). |

`meta.ending` keys of the plain doors: `ita-plain-far-bank`, `ita-plain-pen`, `ita-plain-hollow-trunk`, `ita-plain-river-bund`, `ita-plain-summit`,
`ita-plain-ghat`, `ita-plain-fort-gate`, `ita-subah-plain-door` (unique, prefixed, none a shipped ending).

## 3. Stages

Clear = the scripted route at lag 0, spawn idle 0 (the sweep's `clear`). Fair = `LDD_N=80 npm run fair -- ITA` at 6 / 12 / 18 ticks, worst stretch at 0-12 t.

| Id | Name | Clear | Par | Fair 6t / 12t / 18t | Worst stretch | NAIVE | FIX | Mistakes | Hidden item | Door |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ITA-01 | Namaste, Itanagar! | 12.7 s | tour | 64 / **56** / 70 | s5 56% | `ita-ita` | `ita-pop` | - | pika pila | tour |
| ITA-02 | Ek Ek Karke | 22.8 s | 40 | 100 / 100 / 100 | 100 | `ita-bhaar` | `ita-bans` | 1 | pika pila | plain |
| ITA-03 | Mithun Maidan | 17.0 s | 45 | 100 / **50** / 44 | s1 50% | `ita-keechad` | `ita-seeng` | 1 | momo | plain |
| ITA-04 | Santra Seedhi | 16.8 s | 50 | 100 / 100 / 100 | 100 | `ita-santra` | `ita-tokri` | 1 | santra | `ita-peti` |
| ITA-05 | Anjeer Daal | 37.6 s | 80 | 38 / **19** / 38 | s3 24% | `ita-khai` | `ita-anjeer` | 2 | pika pila | plain |
| ITA-06 | Dhaan aur Machhli | 32.8 s | 70 | 100 / 100 / 100 | 100 | `ita-doob` | `ita-bahaav` | 1 | momo | plain |
| ITA-07 | Sela Dhakka (marathon) | 49.0 s | 150 | 100 / 100 / 100 | 100 (16 stretches) | `ita-dhuan` | `ita-truck` | - | momo | plain |
| ITA-08 | Bans ka Bera (HWIK) | 9.9 s | 30 | 26 / **10** / 19 | s0 10% | `ita-nadi` | `ita-rassi` | - | pika pila | plain |
| ITA-09 | Ita | 19.1 s | 60 | 100 / 100 / 100 | 100 | `ita-malba` | `ita-kaanta` | - | momo | plain |
| ITA-10 | Subah (finale) | 27.3 s | 37 | 100 / 100 / 100 | 100 (5 stretches) | `ita-bhaar` | `ita-dher` | 8 (two per act) | santra | plain |

Finale route times (lag 0): room 0-7.6 s (the porter goes in at 3.9 s, the heap settles at 4.4 s), act A 7.6-13.3 s, act B 13.3-17.6 s, act C 17.6-22.6 s, act D 22.6-26.6 s, door 27.3 s.
Hidden checkpoints: the stage start, each act start (`c.x + 0.5`, four) and the door's (9.5 tiles before the door); longest stretch 9.0 s.

## 4. Probe table: every scripted death, cause@tick at lag 0 / 6 / 12 (lagged player model, spawn idle 0)

The finale (all ten plays keep their cause at every lag; two plays per act, two causes, two ticks):

| Stage | Play | lag 0 | lag 6 | lag 12 |
|---|---|---|---|---|
| ITA-10 | naive: run along the one-lane deck, hopping the bay | ita-bhaar@277 | ita-bhaar@283 | ita-bhaar@289 |
| ITA-10 | fix: into the deep bay, as 02 taught | ita-dher@467 | ita-dher@473 | ita-dher@479 |
| ITA-10 | m0 act A, as 02 taught: into the bay, climb out the moment he is past | ita-peeth@1460 | ita-peeth@1478 | ita-peeth@1496 |
| ITA-10 | m1 act A, run on along the deck, hopping the bay | ita-bhaar@1045 | ita-bhaar@1057 | ita-bhaar@1069 |
| ITA-10 | m2 act B, as 09 taught: pull once, step back, hop the spiked stub | ita-mehraab@2110 | ita-mehraab@2130 | ita-mehraab@2155 |
| ITA-10 | m3 act B, lean on the wall and walk into the hole as it slumps | ita-malba@2018 | ita-malba@2036 | ita-malba@2054 |
| ITA-10 | m4 act C, as the 06 door taught: wait on the bund for the pour to stop, then go | ita-kapaat@2855 | ita-kapaat@2881 | ita-kapaat@2911 |
| ITA-10 | m5 act C, run on into the full tank | ita-doob@2385 | ita-doob@2399 | ita-doob@2417 |
| ITA-10 | m6 act D, as 04 taught: shake the tree from its uphill side | ita-aakhri@2870 | ita-aakhri@2908 | ita-aakhri@2950 |
| ITA-10 | m7 act D, run under the branch and jump for the oranges | ita-santra@2951 | ita-santra@2989 | ita-santra@3029 |

Stages 01-09 (a `WANT` marks a play that dies of another cause at that lag; `NO DEATH` a play the stage no longer kills at that lag):

| Stage | Play | lag 0 | lag 6 | lag 12 |
|---|---|---|---|---|
| ITA-01 | naive | ita-ita@879 | NO DEATH | NO DEATH |
| ITA-01 | fix | ita-pop@1097 | ita-pop@1162 | ita-pop@1210 |
| ITA-02 | naive | ita-bhaar@287 | ita-bhaar@293 | ita-bhaar@299 |
| ITA-02 | fix | ita-bans@1006 | ita-bans@1012 | ita-bans@1018 |
| ITA-02 | m0 wait in the deep bay for the first porter only, then run on | ita-bhaar@601 | ita-bhaar@611 | ita-bhaar@621 |
| ITA-03 | naive | ita-keechad@83 | ita-keechad@89 | ita-keechad@95 |
| ITA-03 | fix | ita-seeng@385 | ita-seeng@396 | ita-seeng@411 |
| ITA-03 | m0 wait on the young one's back for the next to dip | ita-seeng@805 | ita-seeng@811 | ita-seeng@817 |
| ITA-04 | naive | ita-santra@162 | ita-santra@174 | ita-santra@185 |
| ITA-04 | fix | ita-tokri@353 | ita-tokri@365 | ita-tokri@377 |
| ITA-04 | m0 shake from the downhill side of the trunk | ita-santra@150 | ita-santra@162 | ita-santra@174 |
| ITA-05 | naive | ita-khai@85 | ita-khai@91 | ita-khai@97 |
| ITA-05 | fix | ita-anjeer@684 | ita-khai@339 WANT ita-anjeer | ita-khai@351 WANT ita-anjeer |
| ITA-05 | m0 at dusk, read the brightest cluster as the next to drop | ita-anjeer@2380 | ita-anjeer@2392 | ita-anjeer@2404 |
| ITA-05 | m1 in the squirrel's canopy, hop across the moment each cluster lands | ita-gilahri@3950 | ita-gilahri@3971 | ita-gilahri@3992 |
| ITA-06 | naive | ita-doob@76 | ita-doob@82 | ita-doob@88 |
| ITA-06 | fix | ita-bahaav@335 | ita-bahaav@360 | ita-bahaav@387 |
| ITA-06 | m0 on the second bund pull both levers at once and walk on | ita-bahaav@2238 | ita-bahaav@2318 | ita-bahaav@2284 |
| ITA-07 | naive | ita-dhuan@805 | ita-dhuan@811 | ita-dhuan@817 |
| ITA-07 | fix | ita-truck@782 | ita-truck@788 | ita-truck@794 |
| ITA-08 | naive | ita-nadi@78 | ita-nadi@84 | ita-nadi@90 |
| ITA-08 | fix | ita-rassi@571 | ita-nadi@138 WANT ita-rassi | ita-nadi@144 WANT ita-rassi |
| ITA-09 | naive | ita-malba@323 | ita-malba@329 | ita-malba@335 |
| ITA-09 | fix | ita-kaanta@520 | ita-malba@942 WANT ita-kaanta | ita-kaanta@526 |

Doors: eight are plain (nothing to probe); 04's `ita-peti` has no scripted death of its own (the shed's crate is met by the route policy only). Not probed: a play that dies at the 04 door.

## 5. The lag-captured sweep (the tester's method, FIX-7.md; `tests/qa/qa6.test.ts`, a scratch copy, not committed)

Route at lag 0 / 6 / 11 / 12 x spawn-idle 0 / 37 / 120 / 251 ticks; the checkpoint is taken wherever that lagged run takes it; from each capture:
idle 4 s, run 0.3 s after 0/6/12 ticks, tap-jump after 0/6/12 ticks, **plus** walk 4.5 tiles then idle and tap-jump-then-walk 4.5 tiles then idle (the
walk-4.5 check; 9 plays per capture). Replay per tick from the last captured checkpoint to every NAIVE / FIX / MISTAKE death at lag 0/6/12.

| Stage | Route wins at lag 0/6/11/12 | Capture points | Plays | Deaths | Longest stretch | Replay worst (lag 0/6/12 per play) |
| --- | --- | --- | --- | --- | --- | --- |
| ITA-01 | **lag 6 dies** (`ita-pop` @80), others win | 6 | 828 | 0 | 4.1 s | 1.18 s (fix 1.08/1.13/1.18) |
| ITA-02 | all | 3 | 432 | 0 | 12.3 s | **8.48 s** (fix 8.38/8.43/8.48; m0 5.17) |
| ITA-03 | **lag 11/12 die** (`ita-keechad` @44) | 3 | 288 | **32** (walk45/tapwalk45 from the act start cp, `ita-keechad`) | 10.2 s | 6.81 s |
| ITA-04 | all | 3 | 432 | 0 | 9.0 s | 3.14 s |
| ITA-05 | **lag 6/11/12 die** (`ita-khai` @80-81) | 5 | 126+ | **64** (walk45/tapwalk45 from both act starts, `ita-khai`) | 13.5 s | **8.75 s** (m0; m1 7.95) |
| ITA-06 | all | 3 | 432 | **32** (walk45/tapwalk45 from the act start, `ita-doob`) | 21.8 s | 7.25 s |
| ITA-07 | all | 16 | 2304 | 0 | 6.3 s | 2.38 s |
| ITA-08 | **lag 6/11/12 die** (`ita-nadi` @10) | 3 | 108 | 0 | 5.7 s | 1.20 s |
| ITA-09 | all | 3 | 432 | 0 | 10.9 s | 4.38 s |
| **ITA-10** | **all 16** | 5 | **720** | **0** | 9.0 s | **5.60 s** (m0 5.50/5.55/5.60) |

ITA-10 is clean on every row of the sweep. The four lag-fragile stages and the three walk-4.5 failures are round-1 stages (§1 rows 3-6).

## 6. Checks

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | clean (after every edit; last at the tip, 09:10 UTC) |
| `npm test` (full suite at the tip 30f994b, 09:10 UTC) | **18 files passed, 1887 tests passed, 0 failed** (14 files env-gated and skipped). ITA is on no allow-list: `EXEMPT` in `tests/modules.test.ts` has only the old cities; `CPSAFE3_PENDING` is empty, so the strict 4 s cpsafe applies to ITA. |
| ITA's own share (`-t ITA` over levels, checkpoints, items, jumpaudit, cpsafe, modules, allocation) | 115 passed (before the last fix), incl. the module guard (10 stages, NAIVE for 10, FIX for 10, 9 intros, no TODO, prefix rule) and the allocation test (meta = slot, endings unique and not shipped) |
| `cpsafe -t ITA` (strict) | every checkpoint of every stage passes idle / run / tap at 0/6/12 ticks (part of the runs above) |
| `LDD_N=80 npm run fair -- ITA` | §3; 6 of 10 stages at 100%; 01/03/05/08 under the bar (§1 row 3). 18 t parked. |
| `npm run build:single && CHROME_PATH=... node scripts/flows.mjs` | builds (401 modules); flows: **no errors** |
| Sheets | `shots/ITA-01-sheet.png` .. `ITA-10-sheet.png` (15 frames along each route, 844x390 at 1.5x) looked at. ITA-10: the bricks tumble into the bay at 4.4 s and the bay is bricked up at 6.6 s; the shed bricks lie on the span by 13.1 s; the arch with its loose three-brick section over the road behind the stub (15.3 s); the pour over the sluice gate with the "NADI" label (19.7-21.9 s); the hung baskets and the lit notches (24-27 s); the plain door. HWIK tell: `shots/ITA-08-006.png` and `ITA-08-02.png` (844x390 at 1.5x): the rope bands read as dark knots on alternate poles; small. |
| `git diff --name-only origin/develop` | `src/game/cities/ita/*`, `tests/cities/ita.ts`, `docs/cities/ITA.md` only |

## 7. Not done, risks

- The `wall()` change (the pulled brick stays in the hole 0.2 s before it crumbles; hazard inset 2 px) touches ITA-09 too: its NAIVE still dies of
  `ita-malba` (now @323 instead of @300) and its FIX of `ita-kaanta`; the route wins at every lag.
- Rows 2-7 of §1 are open: lengths, the four lag-fragile routes, the walk-4.5 checkpoints of 03/05/06, the two replays over 7.5 s. Each has its
  cause and a one-line fix direction in the table; none was attempted in this round.
- The finale is 27.3 s. If the floor stands, the honest way to 90 s is more decisions, not longer waits; the allocation leaves ITA three reserves
  (R1 orchid dew, R2 flute holes, R3 convoy gate) that are not callbacks and so not for the finale.
- Act C's near pair with `lko05-ghee` is listed for ruling (§1 row 9).

## How to re-run

```
source /local/home/saiposh/personal/games/_template/scripts/env.sh      # Node 22
cd /local/home/saiposh/personal/ldd-wt/ita
npx tsc --noEmit && npm test
LDD_N=80 npm run fair -- ITA
npm run build:single && CHROME_PATH=~/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome node scripts/flows.mjs
QA6=1 QA6_IDLE=0,37,120,251 npx vitest run tests/qa/qa6.test.ts --silent=false     # the sweep + probe (scratch file, untracked)
LDD_ENDREC=1 LDD_ID=ITA-10 npx vitest run tests/endrec.test.ts && CHROME_PATH=... bash scripts/dev/shots.sh ITA-10   # a sheet
```
