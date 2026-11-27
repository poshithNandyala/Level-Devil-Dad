# DIS QA round 1: FAIL

Tester: independent QA chat (not the builder). Subject: `city/dis` at **e9afb1f** (develop f8288e9 merged at deacaa7).
Worktree: `/local/home/saiposh/personal/ldd-wt/qa-dis`, detached at e9afb1f. Its `node_modules` is a symlink to the builder's. I made scratch tests only, and committed and pushed nothing.
Clock: 07:34-07:50 UTC (resumed after the 07:25 restart). Node 22.21.1 (via `games/_template/scripts/env.sh`).
Probe sources are in `QA/probes/`. The outputs are the `.txt` files in `QA/`.

The pre-rulings stand as given: route times are final, the two-play act counts are known, and the 18-tick columns are parked.

## What holds (my runs)

| Check | Result | File |
|---|---|---|
| `tsc --noEmit` | clean | `suite.txt` |
| Full `npm test` | 18 files passed, 13 skipped; **1808 passed**, 20 skipped, 0 failed. DIS is on no list: `CPSAFE3_PENDING` is empty and DIS is not in modules `EXEMPT` | `suite.txt` |
| `cpsafe -t DIS` | 10 passed, all strict (idle, run, tap-jump at lag 0/6/12) | `cpsafe.txt` |
| `LDD_N=80 fair DIS` | **100% at 6t and 12t on every stage**, and every stretch and door at 100%. 18t: 02 84, 05 76, 06 76, 07 80, 10 76 (parked) | `fair80.txt` |
| `build:single` + `flows.mjs` | "no errors" (I had to point `CHROME_PATH` at the shared headless shell 1228) | `flows.txt` |
| Lag-captured sweep: route at lag 0/6/11/12 × spawn idle 0/37/120/251; at each checkpoint taken, idle / run 0.3 s / tap-jump at lag 0/6/12 | **0 deaths in 11,648 plays** over 104 capture points | `sweep-lag-captured.txt` |
| Longest stretch | 07 16.7 s; every other stage is 10.1 s or less. All are ≤ 25 s | same |
| Per-tick replay to each scripted death at lag 0/6/12 | worst: 07 7.17, 01 7.13, 05 6.41, 09 6.37, 08 6.25 s. All are ≤ 7.5 s, and no scripted play survives (no `nodeath`) | same |
| Padding (identical windows) | I re-ran `probes/windows.py` on the builder's `replay-r5.txt`: the longest run is 4× 0.5 s on `dis09-chaal`, the labelled beat. This scan does not see the door repeats (F2) | |
| Rulings that hold | **Loom gone:** `dis05-taat` is out of the tree; `dis-dheki*` survive only as dead cause lines. **Ghat (01):** you pass the tea boy while he is stopped and pouring; in Patna you step aside and let him pass you, so the substance differs. **Majuli (06) room:** you wait for the silt step and jump to it; there is no don't-stop clock, so it is not Kavaratti's. **Rope-walk:** it is the still point on 07, the v3.1 re-skin; it is not BBI's lever and not the disc. **Shiny crepe:** `pithaRoom` and `bhogali` are dead code, not registered. **F453:** not built. **Talatal (04):** stair room F448 plus `dis04-batah` | code read + plays |

## Findings

### F1. Doors that re-ask an act or their own room (law: every door is a new idea in its city)

| Door | Its decision (one sentence) | Closest row | Verdict |
|---|---|---|---|
| 03 `dis-muga-reel` | Ride the cocoon up, and step off at the top before it is reeled in (`dis-reel`, m2 on 03). | **`kvt05-lift`** (shipped): "Ride the fish basket up to the pier, and jump off at the top: it keeps hauling up into the pulley." Ruling **S3** already cut `gtk02-bhatti` for exactly this ("ride up, off at the top before overrun = kvt05-lift"). | **repeat.** It differs from Raipur's kosa reel, but it is Kavaratti's lift |
| 08 `dis-watch-tower` | The rhino charges from behind you: go up the steps and let it pass underneath. | **`dis08-bagori`**, its own stage: "the rhino starts behind you on the bank: up on the haystack platform" | **repeat** |
| 09 `dis-royal-seat` | Two more oiled stretches, pad to pad ("the same way"); the steps are safe. | **DIS-09 room**, and `dis09-chaal` (the labelled momentum beat) | **repeat**: a second window of the room past its one labelled beat |
| 07 `dis-uruka-net` (S9 recast) | A periodic danger on the crossing (the pull): cross one stretch in the calm, and wait on the midpoint refuge (the stake) while they pull. | **`dis09-sluice`**: a periodic danger (the bell and the flood), too long to cross between two bells, so wait on the midpoint embankment, then go | **repeat in substance** in its own city (stake = embankment, pull = flood) |
| 02 `dis-hut-shut` | Cross two bars on the siren (the room's rule), then stand at the locked hut until it opens. Waiting there has no death. | **DIS-02 room** | **repeat**: the only lethal decision is the room's |

**What would satisfy me:** each of these five doors recast to a decision that has no row in the registry and none among Dispur's own rows, or cut (the door space as plain ground).

### F2. Shelter beat: `dis07-bordoisila` is not a wind-direction read (S12)

`storm.ts` hard-codes the wind from the left, the direction you are travelling, every time. The lee is always the two columns just past the granary. With nothing varying, there is nothing to read: the decision is "stand just past the shelter, not under it". That is shelter-and-wait. It is also the same decision as `dis06-wake`: hop over the spur into its lee and let the wave pass.

My plays: NAIVE `dis-bordoisila`@2106/2129/2154 at lag 0/6/12 in the 10 callback. In 07, m16 `dis-hail` and the stage FIX `dis-bordoisila` die at lag 0/6/12.

**What would satisfy me:** S12's own fallback (cut `bordoisila`; F457 `pepa` is already the sound beat), or a wind whose side changes, so that the lee is read from the leaves.

### F3. Two plays collapse into one trap at lag 12

My lagged model, `pairs.txt`, gives cause@tick at lag 0 / 6 / 12. At lag 12 the two plays meet the same trap:

| Act | Baited | Other | At lag 12 |
|---|---|---|---|
| `dis05-kaath` | dis-kaath@1998/2008/**2020** | dis-gamosa@2421/2443, then **dis-kaath@2272** | the "wait" play dies to the bait |
| `dis06-flag` | dis-luit@2309/2322, then **dis-gamosa@2379** | dis-gamosa@2283/2290/**2339** | both die to gamosa |
| `dis06-traps` | dis-dirru@1714/1726/**1738** | dis-tip@1656/1673, then **dis-dirru@2008** | both die to dirru |
| `dis09-tunnels` | dis-roof@3131/3296, then **dis-vault@3390** | dis-vault@3178/3335/**3392** | the same trap, **2 ticks apart** |
| `dis10-dhol` | dis-pukhuri@995/1007/**1019** | dis-dhol-sink@1043/1055, then **dis-pukhuri@1033** | both die in the pond |

(`dis07-card` shows as "SAME" in `pairs.txt` only because my pairing took the wrong row: m4 `dis-gate` against m5 `dis-horin` differ. It is not a finding.)

**What would satisfy me:** at lag 12, each pair still dies to two causes at two ticks. A play may wait for a state (an `until`) instead of a fixed tick, if that keeps the mistake it scripts.

### F4. Law 9: death lines that give the advice that just killed, or name the wrong mistake

There is one global line per cause (`causes.ts`), so a cause reused in a callback carries its home stage's advice.

| Death (play) | Line says | Problem |
|---|---|---|
| 10 `dis10-talatal`, m2 `dis-doba`@3684/3729/3779 ("stops on the step before the last, as in 04") | "…stop on the step before the last." | repeats the advice that killed |
| 10 stage FIX `dis-rope`@2807/2832/2856 ("goes on red as in 09") | "Get on only when the far team's red flag is up" | repeats the advice that killed |
| 10 door, m8 `dis-basket`@4562/4611/4670 ("waits to follow the plucker, as in 03") | "Stay a few steps behind her and follow." | repeats the advice that killed |
| 07 m16 `dis-hail` ("shelters under the granary") | "…Shelter under the bhoral." | repeats the advice that killed |
| 07 FIX and 10 m4 `dis-bordoisila` | "get under the bhoral … stay there" | wrong in both places: in 07 under the granary is `dis-hail`, and in 10 it is `dis-bhoral` |
| 07 door, m17 `dis-net` ("runs straight across") | "Cross the net at a run the moment they start pulling" | the pre-S9 advice; this is the play that killed |
| 07 m9 `dis07-cart` fix (`dis-pukhuri`, off the cart's front) | "Dhol! The plank sank on the beat" | names the wrong mistake |
| 07 m4 `dis07-card` (`dis-gate`, runs to the exit gate) | husori ring advice | names the wrong mistake |
| 09 m4 `dis09-sluice` fix (`dis-roof`, slides off the embankment) | "A ball rolled down the oiled roof into you" | names the wrong mistake |
| 06 m0 `dis06-flag`, 05 m8 `dis05-machan` (`dis-luit`) | "Read the level post…" | names the wrong mistake |

**What would satisfy me:** a cause per mistake (or a per-act line), so that each line names what killed you, and no callback's line gives the home stage's advice.

### F5. Law 7 on the finale: the room and one callback replay without breaking

- **DIS-10 room:** `sand(w, S2.room, …)` is 02's bar layout. The hint says: "you have to remember the rule: wait where you are until the next bar is up". The rule is unbroken; only the post has moved. I am flagging this for the conductor, because the allocation slot (`finale-level-post-far-bank`) asks for exactly this.
- **`dis10-gamosa`:** 05 taught "hop the giver". Here a short hop lands in the next giver's arms, and a long jump clears both. That is the same rule with new spacing, so it is a repeat. Its plays: m6 `dis-gamosa`@4111/4163/4219, m7 `dis-gamosa`@4152/4210/4269 (one play).
- The breaks that hold: `dis10-dhol` (the beat slows), `dis10-bordoisila` (the shelter falls), `dis10-tug` (the teams change ends), `dis10-talatal` (the steps fall bottom-first), and the door (go in front of the plucker).
- The DIS-10 in-game **hint names cut acts**: "Then the pan, the husori gate, the bank." `dis10-tawa`, `dis10-gate` and `dis10-bank` were cut in round 2.

### F6. Checkpoints in DIS-03 under 4.5 tiles from the plucker

`walk45.txt` (the LKO method: walk 4.5 tiles, or tap then walk, and stop 1 s; a death past +4.5 is overshoot and does not count):

- cp0@11.7 tapwalk: `dis-basket` at +3.8 tiles, 0.47 s
- cp2@35.2 walk and tapwalk: `dis-basket` at +3.8 tiles, 0.47 s
- cp4@56.2 tapwalk: `dis-basket` at +3.8 tiles, 0.47 s

The other deaths in the probe are past +4.5, so they are overshoot: 04 kup +4.7, 06 dhal +4.7, 08 bogoli +4.7/4.8, 09 sluice +4.7. cpsafe passes only because its run lasts 0.3 s.

**What would satisfy me:** each 03 checkpoint at least 4.5 tiles behind where the plucker's basket is when a walk from it arrives.

### F7. HWIK: the 04 lamp flame does not read at phone size

`qa-04-flame-phone.png` is my 844×390 frame at 1.5×, at the wells. The flame is a yellow speck about 7 px by 3 px at Dad's hand, and which way it leans cannot be seen. Tara's bubble ("Pohor, Dad! Tolot!") covers part of the first dark well. On the sheet it is invisible.

Also, the flame's lean is clamp((through-well − Dad)/4 tiles). At wells 1 and 2 it always points fully forward, so the tell only ever says "go on". The batah decision, then, is "skip the first two wells".

Place-fit: the "underground" gallery is drawn under open sky, with the Saraighat truss and trees. On 08 the egrets (`dis08-bogoli`'s only tell) are a few white pixels on the sheet. I read 08 from the builder's sheet only, not my own frame.

**What would satisfy me:** a flame or draught tell that reads at phone size (for example, a lamp at least a tile high, or smoke and dust drifting toward the well), not covered by Tara's bubble.

### Minor, not blocking

`docs/cities/DIS.md` is stale. Its Fairness table has stage-description rows pasted into it (01, 04, 06). Its MECHANICS notes still list "Crepes readable by shine (DIS-04)" and "a bank eaten … on a clock (DIS-06)", and the DECISIONS row for `dis-laru-plate` still says "never wait on matte".

## Decision table (rooms, acts, doors)

| Stage | Part | Decision | Verdict |
|---|---|---|---|
| 01 | room (tour) | Pass the tea boy only while he is stopped and pouring. | ok (not PAT-04) |
| 02 | room | Bars move by the post's next mark: stay, go when the new bar is up. | ok |
| 02 | `dis02-chapori` | The hut's bar never moves; don't wait on the narrowing bar. | ok |
| 02 | `dis02-bhutbhuti` | The horn is not the siren: the post does not move. | ok (F447) |
| 02 | door `dis-hut-shut` | The room's crossing, then wait at the locked hut. | **F1** |
| 03 | room | Follow behind the plucker. | ok (F6 checkpoints) |
| 03 | `dis03-bagan` | The wet path slides: wait before the pipe. | ok |
| 03 | door `dis-muga-reel` | Ride up, step off at the top. | **F1 = kvt05-lift** |
| 04 | room | The falling stair: stop on the penultimate step, it rises. | ok (F448) |
| 04 | `dis04-batah` | Go down the well the flame leans to. | ok in substance; **F7** tell |
| 04 | door `dis-laru-plate` | Hop the rolling laru balls. | ok (plain; no registry row found for laru) |
| 05 | room | Three gamosas blind you; give one to a red sash; hop givers. | ok |
| 05 | `dis05-atithi` | The room again (labelled momentum beat, W5). | ok by ruling |
| 05 | `dis05-sanko` | Walk the nala you remember: it has been bridged. | ok (F452) |
| 05 | `dis05-feast` | The leaves are the floor; never jump for a pitha. | ok (F449) |
| 05 | `dis05-kaath` | Splits slide at a jump: hop short, then over. | ok; **F3** at 12t |
| 05 | `dis05-machan` | Keep up with the planking; be off before the roll. | ok (F450) |
| 05 | door `dis-gamosa-latch` | Keep one gamosa. | ok |
| 06 | room | Jump to the silt step behind the spur. | ok (not KVT) |
| 06 | `dis06-wake` | Shelter in the spur's lee. | ok (F454); see F2 |
| 06 | `dis06-traps` | Leave a ringing trap; a slack one tips. | ok; **F3** at 12t |
| 06 | `dis06-flag` | The marker moves, the plank stays. | ok (F455); **F3** at 12t |
| 06 | door `dis-tea-ladder` | Wait at the ladder for the tea boy. | ok (no lethal choice found) |
| 07 | room | Gates open only inside the husori ring. | ok |
| 07 | `dis07-bordoisila` | Stand past the granary (fixed wind). | **F2** |
| 07 | `dis07-dhol` | Hop on the beat; it quickens (momentum beat). | ok |
| 07 | `dis07-rope` | Wait at the anchored end; cross between strokes. | ok (I5 re-skin) |
| 07 | `dis07-goru` | Off the lane sideways when the bull lowers its head. | ok (F458) |
| 07 | `dis07-tekeli` | Stand where they are not shouting. | ok (F460) |
| 07 | `dis07-card` | Not before the card's time; wait on the bench. | ok |
| 07 | `dis07-cart` | Never stop on the cart; jump to the jetty. | ok (F459); F4 line |
| 07 | `dis07-chowk` | The ritual gate waits for the host. | ok (one play) |
| 07 | `dis07-pepa` | Let the leaving group go; join the coming group's ring. | ok (F457) |
| 07 | door `dis-uruka-net` | Cross in the rest; wait on the stake. | **F1 ≈ dis09-sluice** |
| 08 | room | Wait for the charge, walk the strip. | ok |
| 08 | `dis08-jeep` | It stops halfway; a near jeep makes it charge on. | ok |
| 08 | `dis08-duijeep` | It charges the nearer jeep, not the louder. | ok |
| 08 | `dis08-bogoli` | Cross while the egrets sit. | ok (F461) |
| 08 | `dis08-bagori` | Rhino from behind: up on the hay. | ok |
| 08 | door `dis-watch-tower` | Rhino from behind: up the steps. | **F1 = bagori** |
| 09 | room | Pad, run, one leap over rib and oil. | ok |
| 09 | `dis09-chaal` | The room again (labelled momentum beat). | ok by ruling |
| 09 | `dis09-tug` | The taut rope drifts to the winner: go on the far team's flag. | ok |
| 09 | `dis09-sluice` | On the bell, up on the embankment; go when it drains. | ok |
| 09 | `dis09-tunnels` | Step, wait for the grate, step. | ok (F462); **F3** at 12t |
| 09 | door `dis-royal-seat` | Pad to pad again. | **F1 = room** |
| 10 | room | 02's bars, the post far away. | **F5** (conductor's call) |
| 10 | `dis10-dhol` | The beat slows: hop when the plank is up. | break ok; **F3** at 12t |
| 10 | `dis10-bordoisila` | The shelter falls: jump on the gust. | break ok |
| 10 | `dis10-tug` | The teams changed ends. | break ok; F4 line |
| 10 | `dis10-talatal` | Steps fall bottom-first: race down. | break ok; F4 line |
| 10 | `dis10-gamosa` | A long jump over two givers. | **F5** (no break) |
| 10 | door `dis-post-bank` | Go in front of the plucker. | break of 03, ok (S8); F4 line |

## Language

All lines are in Assamese with English glosses. I did not check them against Omniglot one by one. The builder's (U) marks stand as unverified, and nothing here fails on them.

## Not checked, and risks

- I read sheets for 02, 05-09 and the old 01, 03 and 10 sheets from the builder's `shots/`. I shot only 04 myself, at phone size.
- My per-tick replay uses the scripted NAIVE/FIX/MISTAKES under my lagged input model. F3 depends on that model at lag 12.
- I did not check the padding window scan against my own replay record; I re-ran it on the builder's file.
- `/tmp/rec/DIS-04.json` (the builder's, 07:06 UTC) drove my 04 frames.
