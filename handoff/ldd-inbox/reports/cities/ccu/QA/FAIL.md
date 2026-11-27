# CCU · Kolkata: independent QA, round 1: FAIL

- **Tested:** `city/ccu` tip `a8ccc60c6979186729ad6e000341dfae990143b2`, in my own detached worktree, with `develop` 9d193f6 merged in (it contains 6172e21's checkpoint tests and Patna v0.17.0). The merge had one conflict, the act and ending lists in `docs/MECHANICS.md`, which I resolved by keeping both sides. I edited none of the builder's files.
- **Tester:** a different model from the builder. Node 22.
- **Probe:** `qa-ccu.test.ts.txt` (in this folder). Its lag model is TVM QA's `lagged()`. It has three tests:
  - `causes`: the route, NAIVE, FIX and every MISTAKE at lag 0.
  - `cps`: the route at lag 0, 6 and 12 with idle offsets 0, 90, 180 and 270 ticks. It checks checkpoint capture and stretches. It runs the calm checks from every checkpoint (idle 4 s; run 0.3 s then idle; tap jump then idle). It also sweeps the route every 0.25 s with stop, run on, and run+jump for 4 s, to find the worst replay per stretch.
  - `acts`: from each act's start, eight plain plays.
- **Raw output in this folder:** `causes.txt`, `cps-calm-lag0-6-12.txt`, `replay-lag0-12.txt`, `acts.log`, `fair80.txt`, `flows.log`, `fullsuite.txt`, `calibration-PAT.txt`.

**Verdict: FAIL.** These hold:
- the allocation slots;
- uniqueness;
- the fairness bar;
- the full suite;
- flows;
- the cause@tick numbers the builder published, which reproduce exactly.

Five findings block:
- two acts take ideas that allocation v2 explicitly retired from Kolkata;
- two door endings repeat their own stage's act;
- one marathon act repeats the room;
- many acts have no NAIVE/FIX pair;
- the checkpoint rules in `docs/CITY-MODULE.md` (replay ≤ 8 s, every checkpoint calm) fail on all six long stages.

## What holds

| Check | Result |
|---|---|
| 1. Ten stages vs allocation | **Pass.** `meta.family` and the betrayals of 01-10 equal allocation.json's ten CCU slots, word for word. Both reserves are used as acts: R1 kumir in 01, R2 bore in 07 `jowar`/`baan`. The allocation allows this (ALLOCATION.md §6.2). Act ids and endings are unique: `allocation.test`, `modules.test` and `ten-stages.test` are green with Patna merged. |
| Hidden items | **Pass.** One per stage (`items.test` green): mishti doi (01, 10), jhalmuri (02, 03), kathi roll (04, 05), sandesh (06, 09), bhanr (07, 08). |
| HWIK (08) | **Pass on shape.** One unknowable beat: the adda holds you until the tea seller passes, and the tell is the cup he carries. The other acts are taught in their hint parts. The tell is small at phone size (polish P3). |
| Published cause@tick | **Reproduced exactly** at lag 0 (`causes.txt`): every pair in LENGTH-3, the same causes and ticks. Examples: 05 khor 4098 / murti 4537; 07 jowar baan 7790 / nala 7646; 10 chhanta khor 8296 / ganga 8152. |
| Lengths at lag 0 / 12 | 05 52.0/56.3, 06 62.8/63.3, 07 94.1/96.7, 08 44.8/45.9, 09 53.6/57.8, 10 94.7/97.8 s. The builder's numbers are correct. Longest stretch ≤ 19.0 s at every lag (bar 25 s). The route catches every checkpoint at every lag and idle offset. |
| 6. Fairness, `LDD_N=80 npm run fair -- CCU` | **Pass.** 6 t and 12 t are 100% on 01-10, and every stretch is 100%. Relaxed 18 t is 76-100% (informational). See `fair80.txt`. |
| 9. Regressions | `npm test` on the merged copy: **18 files passed, 1745 tests passed, 12 skipped**. CCU is on no allow-list. `npm run build:single && node scripts/flows.mjs`: **"no errors"**, exit 0. I ran it with `CHROME_PATH` set to the cached headless shell 1228, because the default Playwright build is not installed on this host. |
| 8. Hard-no list, text | No deity, puja, immersion, Kalighat or politics word is on screen. I checked every sign (TRAM STOP, CHA, KHOR, PHUCHKA, QUEUE, DHAK, CANOPY, PANDAL, RETURNS, …), every hint and advice line, `causes.ts` and `lines.ts`. The `khola` rename holds. The figures in the 05 frames are generic blocks with a rising paint band, not deities. The dhak and the pandal structure are allowed by the bible (CCU.md §5.9 and §7). |
| Bengali lines | All are on the bible's VERIFIED list. None is plainly wrong. |

## Blocking findings

### B1. `ccu05-khor` (and its callback `ccu10-chhanta`) is the "maker ahead" idea that allocation v2 removed from CCU slot 05
- **What:**
  - **The allocation:**
    - allocation.json, CCU slot 05 `closest`: "no straw-is-air, nobody builds ahead".
    - ALLOCATION.md conflict 24: "(v2) Maker ahead: … CCU slot 05's potter no longer adds clay ahead of you."
    - ALLOCATION.md, almost-used ideas: "a person builds or covers the floor ahead of you" is owned by CCU slot 09 (Pandal), and DMN-07 has already shipped it.
  - **The act:** `ccu05-khor` is exactly that idea. Its advice reads: "these figures are only straw, and straw is air. The potter lays the clay on one after another: wait till the next one is grey clay". LENGTH-3 cites the bible seed that v2 retired.
  - **The callback:** `ccu10-chhanta` is the same potter's clay taken back off. It is a callback to a rule the city must not have.
- **How I reproduced it:** read allocation.json L367, ALLOCATION.md L491 and L545, and `levels.ts` L817 and L982. Also MISTAKE "hopping straight on to the straw figure" dies `ccu-khor` @4098.
- **What would satisfy me:** cut `khor` and `chhanta`, or replace each with an act whose rule is not "someone makes the floor ahead of you". An honest shorter 05 and 10 is acceptable. Without khor, 05 drops to about 45 s, and 10 to about 88 s (just under its 90 s floor). Write the new numbers down.

### B2. `ccu08-phuchka` is the forced-food idea that allocation v2 retired
- **What:**
  - **The allocation:** conflict 23 reads "(v2) Forced food: AMR-01 owns being fed. PAT slot 08 Sattu and CCU slot 03 phuchka are retired." The almost-used table reads "a vendor feeds Dad … AMR-01 (shipped). No new city has one." CCU slot 03's chain even says "Dad never eats".
  - **The act:** "Stop in front of him and he hands you one, and you're eating for a moment, going nowhere." It is the retired CCU phuchka, moved to 08. LENGTH-3 itself names AMR-01 as the closest idea.
- **How I reproduced it:** read ALLOCATION.md L493 and L544, and `levels.ts` L489. MISTAKE "stopping to eat as soon as you reach the phuchka man" dies `ccu-dhowa` @3953.
- **What would satisfy me:** cut it, or recast it without Dad being fed. The 08 family (held by chat until an event) has room for that: for example, the phuchka crowd as an adda the tea seller does not serve. Then write 08's honest length down.

### B3. Two door endings repeat their own stage's act, and 07 repeats its room
- The allocation's ending rule says "an idea counts as used even under a new name". TROLL-BIBLE Law 7 asks the door to betray the stage.
  - **05 door `ccu-murti`** (ending key `ccu-ride-the-finished-figure-out`): "Climb on the big figure that's nearly painted and stay on it: when the paint reaches its crown they carry it out over the mud … Step off on to the landing." That is `ccu05-pratima` word for word ("climb on to its head and stay there. When the paint reaches the crown, they carry it across, with you; step off on to the landing"), which already has two crossings. So the player meets the same window three times, and the door betrays nothing.
  - **08 door `ccu-dorja`**: "stand still among the men before the door, and when he's let you go, the doorstep is clear". That is `ccu08-tokta`'s decision (sit so the tea seller comes over his plank), and `ccu08-gali` is already its momentum repeat. The player makes the same decision three times.
  - **07 `ccu07-sandhya`**: the three-porter relay at the CHA boards is the room's own decision ("before his chai stop, hop on to the next load going your way"). `ccu07-ulto` is the stage's declared momentum repeat of the same relay. So 07 has two windows beyond the room with the same decision. That breaks CITY-MODULE's "no window is the same as one already passed once the first momentum beat is behind you". The builder's claim of 0 repeat rows does not hold.
- **How I reproduced it:** compared the advice text in `endings.ts` L230 and L259 and `levels.ts` L202, L1201 and L404. I also ran `causes.txt`: sandhya and ulto both die only to `ccu-cha`, like the room's NAIVE.
- **What would satisfy me:** a 05 door and an 08 door whose betrayal is not their stage's act. Cut sandhya, or give it a turn of its own. I accept the length drop if it is written down.

### B4. Many acts have no NAIVE and FIX that die to different traps
- **The rule:** CITY-MODULE says "Every act: its FIX death differs from its NAIVE death in cause and tick". The brief asks for this per act.
- **What the builder covered:** LENGTH-3 gives pairs only for the new acts and some old ones. LENGTH.md L87 says the rest are "covered by the stage NAIVE/FIX".
- **What I found:** my `acts` probe tried eight plain plays from each act's start. Most of the deaths are the generic fall (road, mud, stakes), not the act's trap.
- **Acts with no scripted pair, or a pair that shares one cause** (momentum repeats ulto, gali and uthan2 are excluded):

| Stage | Act | What exists |
|---|---|---|
| 05 | `uthon` | one MISTAKE (`ccu-phata`) |
| 05 | `lane` | none |
| 05 | `ghat` | none; every plain play dies `ccu-ganga` |
| 05 | `pratima` | two plays, both `ccu-ganga` |
| 06 | `points` | only the stage FIX |
| 07 | `girder` | none |
| 07 | `dui` | none |
| 07 | `sandhya` | `cha` / `cha` |
| 07 | `pylon` | one MISTAKE; all plain plays survive or fall to `gaari` |
| 08 | `rok` | one |
| 08 | `tokta` | `khod` / `khod` |
| 09 | `sinri` | one |
| 09 | `toran` | none |
| 09 | `chala` | one |
| 09 | `dhak` | one play; the builder says so |
| 10 | `bus` | none |
| 10 | `tram` | none |
| 10 | `kumor` | none |
| 10 | `setu` | `cha` / `cha` |
| 10 | `rok` | none. No plain play dies inside it: walking straight through wins, so this callback is 08's learned answer and does not betray it (Law 7). |

- **How I reproduced it:** `causes.txt` and `acts.log`.
- **What would satisfy me:** for each act above, a NAIVE and a FIX MISTAKE in `tests/cities/ccu.ts` that die to different causes at different ticks, inside the act. Alternatively, cut or merge the act. Ladder acts (an A2 then A3 of the same rule) may share the room's NAIVE if their FIX is their own.

### B5. Checkpoints fail CITY-MODULE's replay and calm rules on 05-10, at every lag
- **The rule** (CITY-MODULE): "Replay to any trap is at most 8 s from the last checkpoint, at lag 0, 6 and 12 ticks … Every checkpoint survives standing idle, running then idling, and a tap jump then idling."
- **The builder's numbers hold for scripted deaths:** at most 7.7 s.
- **The sweep finds more.** These are the worst replays per stretch (`replay-lag0-12.txt`, lag 0 / lag 12):

| Stage | Stretch from | Worst replay | The death |
|---|---|---|---|
| 05 | cp2 x92.5 | **18.3 / 18.7 s** | run+jump at 29.8 s, `ccu-ganga` x144.7 |
| 05 | cp4 x162.5 | 11.0 / 11.3 s | `ganga` |
| 06 | cp3 x40 | **15.0 / 14.7 s** | `khod` |
| 06 | cp7 x103.5 | 12.8 / 12.6 s | |
| 07 | start | 10.3 s | |
| 07 | cp0 | 13.1 s | |
| 07 | cp1 | 10.8 s | |
| 07 | cp7 x220 | 12.1 s | `ccu-baan` (the bore) |
| 07 | cp10 x312.5 | 13.9 s | |
| 08 | cp4 x144.5 | 11.0 s | stop at 36 s, `ccu-dhowa` |
| 09 | cp3 x128.5 | 9.4-10.2 s | |
| 09 | cp8 x212.5 | 10.7-11.0 s | `bansh` |
| 10 | cp1 x35.5 | **17.0 s** | `khod` |
| 10 | cp6 x206.5 | 12.2 s | |

- **The calm check** (`cps-calm-lag0-6-12.txt`, the same at lag 0, 6 and 12):
  - **Idle 4 s dies:**
    - 07 cp4 x160 and cp7 x220: the porter sets his load down, `ccu-cha` at +3.1-3.3 s.
    - 10 cp13 x346: `ccu-cha` at +3.0 s.
    - 10 cp12 x324: `ccu-cha` at +3.9 s, at lag 12.
  - **Run 0.3 s or a tap jump dies within the engine's 1.2 s quick-death window.** Two such deaths in a row and `session.ts` drops the checkpoint. This happens at:
    - 05 cp3 x136.5 (`ganga`, +0.46 s);
    - 06 cp0-cp8, all nine (`khod`, +0.25-0.43 s): every checkpoint is captured on the moving tram step;
    - 07 cp0, cp2-cp7 and cp11 (`gaari`, +0.3-0.6 s);
    - 08 cp0 x49.5 (`dhowa`, +0.29 s);
    - 09 cp0, cp1, cp3, cp4, cp6 and cp8 (`bansh`, +0.3-0.7 s);
    - 10 cp3, cp6-cp10, cp12 and cp13.
  - **Slower deaths:** 05 cp1 x58.5 tap (`murti`, +2.7 s at lag 6 and 12), 10 cp7 tap (`murti`, +3.0 s) and 10 cp8 tap (`khor`, +1.8 s).
- **Rulings on the two older checkpoints the builder left:**
  - **06 `points` +8 (cp3, x40):** respawn is input replay, so tram B's trigger replays the same and does not desync. Idle 4 s is safe, and cpsafe is green. Its position next to the trigger is fine. But its stretch has a **15.0 s** worst replay, and a 0.3 s run from it dies in 0.42 s. Both fail, for the reasons above.
  - **08 broken-rok a1 + 0.2 (cp3, x122.2):** **accepted.** All three calm plays survive at lag 0, 6 and 12, no replay from it is over 8 s, and it is what keeps the sit-on death at 6.4 s.
- **Calibration, for the conductor.** The same probe on merged Patna (`calibration-PAT.txt`, lag 0) shows the same pattern:
  - worst replays of 10-14.6 s;
  - idle deaths at +2.4 s on PAT-07's tempo checkpoints;
  - PAT-10 cp9 run 0.3 s dying `pat-torana` +0.13 s.

  PAT PASS.md listed its over-8 s replays as polish under the 25 s rule. I hold CCU to CITY-MODULE as written, because this brief and the doc both state the 8 s and calm rules. If the conductor rules that the PAT standard applies (25 s stretches, cpsafe 1.5 s idle), then B5 shrinks to the idle-4 s deaths on 07 and 10.
- **What would satisfy me:**
  - move checkpoints so they are captured while Dad stands on solid ground away from a hazard (the island, a pylon, the bank, a bamboo top), not while he rides;
  - add checkpoints until no sweep death replays more than 8 s;
  - re-run `qa-ccu.test.ts` `cps` at lag 0, 6 and 12 with no calm death and no replay over 8 s.

## Length and shape (item 4), my judgement at the honest numbers

| Stage | Length | Plays as its shape? | Ship at this length? |
|---|---|---|---|
| 05 long | 52.0 s (floor 60) | Yes: one rule (the paint line) taught, then turned (dry cracks, two-down cracks, order of finishing). | It would be **yes** at 52 s, but khor (B1) is 7 s of it. About 45 s without it reads thin. One allocation-legal act is needed, or an accepted honest ~45 s. |
| 06 long | 62.8 s | Yes. | Yes. |
| 07 marathon | 94.1 s (floor 120, bible 2-3 min) | It has a shelter beat (pylon), a momentum beat (jowar), several rules (relay, overtake, oncoming, bore, launch) and hidden checkpoints. | **No, not at this length.** It is 26 s short, and about 20 s of the 94 is the room's relay again (sandhya, ulto: B3). Its real content is a long stage's, about 70 s, not a marathon's. The builder's reason for not building the taxi jam is honest. The fix is one more taught-then-turned rule from the Howrah seeds, or the owner accepting 07 as a long marathon in name only. |
| 08 HWIK | 44.8 s (floor 60) | One WTF beat (adda), then tough-but-knowable beats (water beat, plank). | 44.8 s would be acceptable for a HWIK. Without phuchka (B2) it is about 35 s, with tokta, gali and the door all one decision (B3), and that is **thin**. It needs one legal tough act. |
| 09 tough | 53.6 s (floor 60) | Partly. Slot 09 says 4-5 beats, 3-4 checkpoints, "A2 and A3 in every beat". It has 8 beats and 10 checkpoints, and `dhak` has one play. It plays dense, not thin. | **Yes at 53.6 s**, once B4 gives dhak a FIX or it is cut. |
| 10 finale | 94.7 s | Yes. Callbacks only, the book-bundle twist, and new acts that break their source rule. | Yes, after B1 (chhanta) and B4 (rok10 just replays 08). |

## Decision sweep (item 7): each act in one sentence

| Stage / part | Decision |
|---|---|
| 01 tour | walk on to the rail, never land on it; cross the chalk river only while the kumir counts |
| 02 room / door | step off forward on the second aaste, not the first / stand still at the stop so the bus crawls for you |
| 03 room, dokan / door | be on a peanut at each shake, hop as the chilli rises / cross the empty tin between shakes |
| 04 room, thak / door | count books under the finger / wait on the pavement while the tall pile is bought down / wait while the set is re-shelved |
| 05 room, uthon, lane | stand only below the waist mark; walk, never jump, on to dry figures; two down cracks even a walk; read each mixed figure |
| 05 pratima ×2, **door** | ride the nearly-painted big figure over the mud, **three times (B3)** |
| 05 ghat | keep moving: they finish in order from the near end |
| 05 khor | wait for the potter to clay the next figure: **retired maker-ahead (B1)** |
| 06 room, points, duiline / door | ride the step, not the roof; off at the island before the points; off at the island to let the other tram pass / wait while the pole is walked round |
| 07 room, **sandhya**, ulto | switch loads before the CHA board: **room + sandhya + ulto (B3)** |
| 07 girder, dui, pylon | walk off on to the short porter passing under; hop up only when nothing comes overhead; don't take the porter who leaves at once |
| 07 jowar, baan / door | keep running ahead of the front, hop drains short; be on the launch before the bore and step off at the crest / walk off before the arch |
| 08 room, rok | never stop beside the adda; hop the maid's water |
| 08 tokta, gali, **door** | stand still in the adda to bring the tea seller and his plank, **three times (B3)** |
| 08 phuchka | stop and eat just after the water: **retired forced food (B2)** |
| 09 room, sinri, toran | full-jump on to the cloth top, off before the next tie (staircase, two at once: a ladder) |
| 09 chala, uthan, uthan2 | ride the tied panel up / step off at the top at once (ladder + momentum) |
| 09 dhak, line / door | run under the frame as it rises; step into the bamboo the queue just left / jump straight into the doorway |
| 10 | callbacks: chhad, phire, pherot and khola each break their source; bus, tram, kumor and setu replay theirs; rok10 is 08's answer unchanged (B4); chhanta is B1 |

**Against the game and the parallel branches.** B1 and B2 are the repeats. Close pairs I do not block on:
- 09 `uthan` (ride up, step off before the roof) against Patna's `pat04-anaaj` (ride the rising grain, step off before the roof);
- 10 `chhad` and `pherot` both resolve to 09 `chala`'s "ride the riser up";
- 08 `tokta` (stand still so the plank comes) against SVP's crocodile-pit board, which folds into a bridge for someone standing by it. That one is for SVP's QA to weigh; CCU-08 owns the family.

## Polish (not blocking)
1. The act id `ccu05-pratima` and the cause id `ccu-murti` are both Bengali for a (deity) image. Neither is shown on screen. Rename them to `ccu05-boro` / `ccu-putul` or similar, so nothing in the code reads as an idol.
2. The 08 tea seller's cup (the HWIK tell) and the maid's water are a few pixels at 844×390 (`qa-08-phuchka-2x.png`). Make the cup and the water sheet larger or brighter.
3. LENGTH-3 says "Identical-window rows: 0" and "cause @ tick, every act". Both overstate the facts (B3, B4). Update them when fixing.
4. The relaxed 18 t fairness on 03, 07 and 10 is 76%. That is informational, but it is the lowest in the city.
5. 05's paint band reads well at phone size (`qa-05-room-2x.png`), and the KHOR straw reads as gold frames (`qa-05-khor-2x.png`).

## To re-test I will need
B1-B5 addressed, then:
- the full `npm test`;
- `LDD_N=80 npm run fair -- CCU`;
- `qa-ccu.test.ts` (`causes`, `cps` at lag 0, 6 and 12, `acts`);
- flows;
- the new honest lengths written in LENGTH-4.

Not checked: touch on a real phone, audio, and human play (bots and the lag model only). I made no new death frames; I read the builder's sheets for 05 and 08 and cropped them.
