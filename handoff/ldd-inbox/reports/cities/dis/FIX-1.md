# DIS fix round 1: the answer to QA round 1 (FAIL at e9afb1f)

Branch `city/dis` in `/local/home/saiposh/personal/ldd-wt/dis`. The subject was e9afb1f; the tip is **`12842f7`** (code), and DIS.md is in `704d772`, which sits below it. No push, no version bump, no shared file touched. Work ran from 07:53 to 08:51 UTC, inside the 120-minute budget from 07:55.

Outputs are in `reports/cities/dis/fix1/`:
- `pairs-table.md`, made by `pairs2.py` from `sweep-lag-captured.txt` and `labels.txt`.
- `walk45.txt`, `fair80.txt` and `fair80-07-rerun.txt`.
- `suite.txt`, `causes.txt`, the two phone frames each for 04 and 08, and ten sheets.
- `probes/`: QA's sweep, labels and walk45 probes, with the trace test I added.

## What does not meet the bar, and why

- **Every F1 door is PLAIN, not recast.** The five doors (02, 03, 07, 08, 09) now end the road at the door and you walk in. I ran each replacement I could find through the gate (table below), and every one collided with a registry row or with DIS's own rows. The ruling accepts a plain door; it does not accept a borrowed one.
- **F2 is cut, not made a read.** `dis07-bordoisila` had a fixed wind. I did not build a varying wind with a visible tell a beat ahead. I took S12's fallback and cut it, together with its 10 callback (`dis10-bordoisila`), which broke a rule that is now gone. The pepa stays 07's sound beat.
- **Honest route times fall:**

  | Stage | Before | After | Why |
  | --- | --- | --- | --- |
  | 02 | 25.3 s | 21.9 s | plain door |
  | 03 | 40.2 s | 33.6 s | plain door |
  | 07 | 96.7 s | 88.0 s | bordoisila cut, plain door |
  | 08 | 49.4 s | 44.6 s | plain door, bagori's longer rest |
  | 09 | 36.9 s | 34.6 s | plain door |
  | 10 | 45.1 s | 40.5 s | bordoisila and gamosa cut, new room |

  None is padded. 06 is 24.3 s (traps slack 84 ticks).
- **The 04 lamp was not played by hand.** I read it at phone size in two frames only (below).
- **The tester's `labels.txt` pairing.** QA's `pairs.py` still shows `dis07-card` as SAME, because it pairs the first naive row with the fix: the ACT_MORE "waits at the gate" play, `dis-horin`. The act's own NAIVE, "runs to the exit gate", dies `dis-card-gate`. My `pairs2.py` pairs the NAIVE that sits right before the fix, and shows two causes at every lag.

## F1: doors (gate first, 15 minutes each)

| Door | Candidate decision tried (one sentence) | Source | Closest row | Verdict |
| --- | --- | --- | --- | --- |
| 02 `dis-hut-shut` | What floats stays and what is fixed drowns: stand on the pontoon, not the ghat steps. | IDEAS-2 F1 | `dis02-chapori` (the hut's bar never moves: stand on the thing that stays) | struck: own row |
| 02 | Which deck is the shelter now is read from the rails, not the wind. | IDEAS-2 #2 | SVP-08 `rain-direction-reverses-awnings` | struck |
| 03 `dis-muga-reel` | Pruning season: don't follow the worker; walk the tall table she has not reached. | IDEAS-2 F3 | DIS-03 room inverted inside its own stage; IMP-03 `shears-trim-tier` | struck |
| 03 | The cut I would need (ride up, off at the top) is kvt05-lift. | the old door | `kvt05-lift`, S3 | struck |
| 07 `dis-uruka-net` | Two stacked shelters, the train decides which. | IDEAS-2 #2 | SVP-08 | struck |
| 07 | A periodic danger: cross a stretch in the calm, wait on the midpoint. | the old door | `dis09-sluice` | struck |
| 08 `dis-watch-tower` | The mother rhino charges you: take the ground behind her charge. | IDEAS-2 F6 | GNR-05 chaser, `dis08-bagori` | struck |
| 09 `dis-royal-seat` | Walk up what looks like it needs jumping; the jump is what kills. | IDEAS-2 #7 | `lko08-mehrab` (walk, don't hop) | struck |
| 09 | Stand where none of the smiths works, and leave when the tongs rise. | IDEAS-2 #6 | DIS-07 `rope` (cross from the still end), BBI-09 hub, CHH-03 | struck: own still-point row |
| 09 | After rain: walk the tiles, the ribs slide, land on nothing. | IDEAS-2 F2 | the DIS-09 room inverted in its own stage, `lko08-mehrab` | struck |

| Door | Before | After | Death plays | Commit |
| --- | --- | --- | --- | --- |
| 02 | room's crossing plus a locked hut | PLAIN (the farmer's hut, walk in) | none | 673f730 |
| 03 | muga reel = kvt05-lift | PLAIN (the garden bungalow) | none (`dis-reel` gone) | 673f730 |
| 07 | net in strokes ≈ dis09-sluice | PLAIN (the last house) | none (`dis-net` gone) | 673f730 |
| 08 | rhino from behind = bagori | PLAIN (the forest office) | none | 673f730 |
| 09 | oil pads = the room | PLAIN (the royal seat) | none | 673f730 |

The 08 `dis08-bagori` FIX ("off the hay as soon as the rhino stops halfway") had been dying in the old door's field. It now dies in its own act, because the halfway rest is 200 ticks instead of 40. Its line is `dis-gorh-adha`, at 4644/4680/4718.

## F2: bordoisila

| Before | After | Cause@tick (lag 0/6/12) | Commit |
| --- | --- | --- | --- |
| `dis07-bordoisila`: a fixed wind from the left; stand past the granary (= `dis06-wake`) | cut, with `dis10-bordoisila` | 07's stage FIX is now the dhol's: `dis-dhol-sink` at 1964/1892/1904, against NAIVE `dis-gate` at 277/283/289 | e896831 |

## F3: the pairs at lag 12

QA's lag model (`probes/zz-qa-sweep.test.ts`, lagged replay at lag 0/6/12):

| Act | Before (QA) | Change | After: baited / other (lag 0, 6, 12) | Commit |
| --- | --- | --- | --- | --- |
| `dis05-kaath` | the "wait" play died `dis-kaath`@2272 at lag 12 | FIX hops the slid split from x+11.0 (at once) | kaath@1998/2008/2020; kaath-gamosa@2421/2443/2410 | eaf4aa9 |
| `dis06-flag` | NAIVE died `dis-gamosa`@2379 at lag 12 | NAIVE and route hop the ghat man from x+17.0 | flag-luit@2333/2346/2401; ghat-gamosa@2307/2314/2363 | eaf4aa9 |
| `dis06-traps` | FIX died `dis-dirru`@2008 at lag 12 | FIX waits on the edge for the next trap to go slack; slack is 84 ticks (was 60) | dirru@1714/1726/1738; tip@1654/1672/1689 | eaf4aa9 |
| `dis09-tunnels` | NAIVE died `dis-vault`@3390 at lag 12 | NAIVE climbs from a standstill on a wider step (x..x+4) to the beam's end | tel-gola@3194/3365/3435; vault@3178/3335/3392 | eaf4aa9 |
| `dis10-dhol` | FIX died `dis-pukhuri`@1033 at lag 12 | FIX marks 07's quick beat on the spot (`dholSpot`), so his own plank sinks under him | pukhuri-lahe@1336/1359/1377; dhol-lahe@1384/1407/1425 | eaf4aa9 |
| `dis07-cart` | (found in my sweep) the FIX lived at lag 6/12 and died at the next gate | the pond runs under the whole jetty; the FIX starts from a standstill | herd@6487/6541/6596; cart-pukhuri@6499/6568/6629 | ee47fe8 |
| DIS-01 room | (found by my table) the FIX died `dis-spill` at lag 6/12 | the hop over the tea boy starts 50 px off | spill@1143/1173/1203; pool@1181/1217/1253 | 12842f7 |

**The pairing table** is `fix1/pairs-table.md`: 30 pairs × 3 lags = 90 rows, made by `pairs2.py` with cause@tick (tile x). It ends "pairs not meeting the bar: 0". The 10 room's own second play is outside that table: `dis-ulta`@219/223/220 against m4 `dis-agot`@264/282/300.

## F4: lines (law 9)

`recause(w, c0, c1, map)`, in DIS's `entities.ts`, wraps this world's `die()`. While Dad is inside an act, a death to a mapped cause is reported as the act's own cause. Every new cause has its own line, and each line names what killed you and never repeats the advice that killed. Commit badd994.

| Death (play) | Before (cause: problem) | After (cause: line) |
| --- | --- | --- |
| 10 talatal "stops on the step before the last" | `dis-doba`: repeated the advice | `dis-doba-ulta`: "These steps fell from the bottom up, and you waited on one." / race straight down |
| 10 tug FIX "goes on red" | `dis-rope`: "get on when red is up" | `dis-rope-ulta`: "You went on red, and red is the near team now" / go when the far team, in green caps, is winning |
| 10 tug NAIVE | `dis-khaal`: 09's referee flag | `dis-khaal-ulta` |
| 10 dhol NAIVE / FIX | `dis-pukhuri` / `dis-dhol-sink`: 07's advice | `dis-pukhuri-lahe` / `dis-dhol-lahe`: the drummer is slowing |
| 10 door "waits to follow her" | `dis-basket`: "follow behind her" | `dis-basket-ulta`: "you waited to follow her" / go in front of her |
| 10 door "runs ahead" | `dis-luit`: the level-post advice | `dis-path-agot` |
| 07 `dis-hail`, `dis-bordoisila`, 10 `dis-bhoral` | wrong or repeated | gone with the cut (F2) |
| 07 door `dis-net` | pre-S9 advice | gone (plain door) |
| 07 cart FIX | `dis-pukhuri`: "Dhol!" | `dis-cart-pukhuri`: "You ran off the front of the cart into the pond." |
| 07 card "runs to the exit gate" | `dis-gate`: the husori ring | `dis-card-gate`: "It stays shut before the time on your card." |
| 07 pepa NAIVE (runs after the leaving group) | `dis-gate`: "walk with them" (the killing advice) | `dis-pepa-gate` |
| 09 sluice FIX | `dis-roof`: the ball | `dis-sluice-tel`: "You stayed on the oiled embankment" |
| 09 tunnels NAIVE | `dis-roof`: the roof pads | `dis-tel-gola`: "An oil ball rolled along the beam" / take the tunnel mouths |
| 06 flag NAIVE / FIX | `dis-luit` / `dis-gamosa` | `dis-flag-luit` / `dis-ghat-gamosa` |
| 06 wake FIX | `dis-bank`: the spur's silt step | `dis-wake-bank` |
| 05 machan FIX | `dis-luit`: the level post | `dis-machan-luit` |
| 05 sanko FIX | `dis-pit`: "jumped over the feast" | `dis-sanko-pit` |
| 05 kaath FIX | `dis-gamosa` | `dis-kaath-gamosa`; and `dis-kaath`'s hint no longer says "jump it long" (the answer is the short hop) |
| 02 horn NAIVE | `dis-luit` | `dis-bhutbhuti`: "That was the ferry's horn, not the siren" |
| 08 bagori FIX | (died in the old door) | `dis-gorh-adha` |
| 04 room FIX | `dis-doba`: said "stop on the step before the last" to a player who waited at the top | rewritten: "Don't wait at the top. Go down with the falling stair" |
| 09 tug NAIVE | `dis-khaal`: "wait for the referee's flag" (that is 10's mechanic) | rewritten: "until it is taut and the far team's flag is up" |

I checked every line in `causes.ts`: 67 causes. Dead lines are gone: dheki, cold pan, crepes, reel, net and Bordoisila.

## F5: the finale

| Part | Before | After | Cause@tick (lag 0/6/12) | Commit |
| --- | --- | --- | --- | --- |
| DIS-10 room | 02's bars with the post moved away (unbroken) | breaks 02 (`SandField.flip`): the bar in front sinks first and the new one rises after; wait on the bank | NAIVE (02's answer: on to the bar, wait) `dis-ulta`@219/223/220; m4 (wait on the bank, jump for the outline before it is up) `dis-agot`@264/282/300 | badd994 |
| `dis10-gamosa` | 05's rule with new spacing | cut | none | e896831 |
| 10 hint | named tawa, gate and bank | rewritten: the turned-round order, then the dhol (slows), the tug (ends changed), the Talatal steps (fall from the bottom), the plucker's path | | badd994 |

Gate for the room break: "With the post on the far bank the order is turned round: the bar in front goes under first and the new one comes up after, so wait on the bank, not on the bar." The closest rows are the DIS-02 room (this is its break) and KVT-08's do-not-stop slab clock. KVT-08 is different because here you wait, on the bank, and nothing chases you. It passes.

## F6: 03 checkpoints, the walk45 proof

The cause: anywhere the route follows the plucker, she is about 4 tiles ahead, so a checkpoint taken while following always sits 3.8 tiles from the basket. Checkpoints now sit only where you wait for her: the room's at 10 (was 12), and the bagan's at 0.5 (was 3.5) and 14.5. The one at 24.5 is gone, and its replay is covered (03's worst replay is 2.52 s). Commit 944c0dc.

`fix1/walk45.txt` uses QA's method (walk 4.5 tiles, or tap then walk, and stop 1 s): **`W45 DIS-03 cps=4 clear`**. The other entries are past +4.5 (overshoot): 04 +4.7, 06 +4.7, 08 +4.7/4.8 and 09 +4.7. They are unchanged.

## F7: the two tells, phone-size shots read

Commit 11bf028.

- **04, before:** a 7×3 px flame, covered by Tara's bubble, that always leaned forward at wells 1 and 2.
- **04, after:**
  - The lantern is a tile high, with a glow. Its flame stands straight up over any well with no draught and streams toward the through well within 3 tiles of it.
  - Dust and smoke drift along the gallery floor and pour down the through well only.
  - Tara's lure is removed.
  - The gallery is a brick vault with arches, not open sky.
- **Phone frames (844×390 at 1.5×, `routeshots.mjs`), read:**
  - `phone-DIS-04-05.png`: the brick gallery, the lit flooded well, the two black wells, and dust falling into the third. The yellow lantern is clear at Dad's hand, and no bubble covers a well.
  - `phone-DIS-04-062.png`: at the third well the flame streams sideways toward it and dust pours into it.
  - **Not fixed:** the gallery's back wall ends with open sky beyond it, past the wall at x+22.
- **08, after:** the egrets are a flock of six big white birds, standing in a row with necks and yellow bills, or flapping in a cloud high over the grass. Frames read:
  - `phone-DIS-08-066.png`: six egrets standing in a row over the grass; they read clearly.
  - `phone-DIS-08-062.png`: the flock up in the air over the grass, with Tara's "The birds flew off".
  - I added no sound.

## Minor: DIS.md

Commit 704d772:
- The fairness table is rebuilt. The pasted stage rows are gone.
- The MECHANICS notes for 02/10, 04 and 06 are rewritten (no crepe shine, no clocked bank).
- A fix round 1 section supersedes the older tables.

The `dis-laru-plate` "never wait on matte" row is in the registry (DECISIONS.md), not in my files, so I left it for the allocator.

## Proofs

All runs were one at a time, in the foreground, on the code tip.

| Proof | Result | File |
| --- | --- | --- |
| `tsc --noEmit` | clean | |
| Full suite (DIS on no list) | 18 files passed, 13 skipped; **1801 passed**, 20 skipped (was 1808: the cut acts' and doors' tests are gone) | `fix1/suite.txt` |
| cpsafe strict | 10/10 DIS (inside the suite) | |
| Fair, LDD_N=80 | 100% at 6t and 12t on every stage, and every stretch and door 100% at 0-12t. 18t: 02 84, 05 76, 06 76, 07 80, 10 76 (parked). 07 re-run after the cart change: 100/100/80 | `fix1/fair80.txt`, `fair80-07-rerun.txt` |
| Lag-captured sweep (route at lag 0/6/11/12 × idle 0/37/120/251; idle, run and tap-jump at lag 0/6/12 at each capture) | **0 deaths in 10,416 plays** over 93 capture points; no `nodeath` | `fix1/sweep-lag-captured.txt` |
| Longest stretch | 07 16.7 s; 10 12.4 s; the rest ≤ 10.6 s | same |
| Per-tick replay at lag 0/6/12 | worst 07 7.17, 01 7.13, 02 6.53, 05 6.41, 09 6.37, 08 6.25 s; all ≤ 7.5 s | same |
| Pairing table | 90 rows, 0 not meeting the bar | `fix1/pairs-table.md` |
| walk45 | 03 clear | `fix1/walk45.txt` |
| Flows | `build:single` and `flows.mjs`: "no errors" | |
| Sheets | all ten re-shot; 10 and the 04/08 phone frames read, 07 re-shot after the cart change | `fix1/DIS-*-sheet.png` |

## Honest times (route, s)

| 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 22.6 | 21.9 | 33.6 | 11.2 | 32.0 | 24.3 | 88.0 | 44.6 | 34.6 | 40.5 |

## Skipped or not checked

- **F2 wind read:** not built. I cut it under S12's own fallback.
- **F1 recasts:** none built, because no candidate passed the gate.
- **04's backdrop:** the back wall ends against open sky past x+22.
- **Sound:** no egret sound in 08.
- **Sheets:** I read only 10, 04 and 08 this round. The others were re-shot but not read.
- **`fix1/causes.txt`** was printed before the last 01 FIX change (01's FIX tick there is the old 1189). The pairing table holds the current ticks.
- **Probes:** QA's probes ran from `tests/qa/`, which is uncommitted scratch (copies in `fix1/probes/`).
- **Shared code:** `recause` wraps `World.die` on each world instance from DIS code. No shared file changed.
