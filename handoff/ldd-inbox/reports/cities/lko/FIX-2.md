# LKO · Lucknow: fix round 2

- **Branch:** `city/lko`, tip **f220f758548fbef3f1686c94c543a3b949e9e767**, worktree `/local/home/saiposh/personal/ldd-wt/lko`. origin/develop had nothing new to merge (fetched 06:43 IST). Not pushed, no version bump.
- **Edits only in** `src/game/cities/lko/`, `tests/cities/lko.ts`, `docs/cities/LKO.md` and LKO's row in `docs/CITIES.md`.
- **Times:** clear time is the scripted route's time (a bot, lag 0). The death offsets in (b) are seconds after the last hidden checkpoint passed.

## What still fails

The floors for 05, 07, 08, 09 and 10 are **not met**. I wrote what each one still needs in "Still short, and why" at the end.

## Per stage

| Stage | Floor | Before (FIX-1) | Now | Met? | What changed |
| --- | --- | --- | --- | --- | --- |
| 02 Pehle Aap | 25 s | 26.7 s | 25.3 s | yes | `lko02-dakiya` cut (uniqueness ruling); new `lko02-aadaab`; the stand-off ends sooner (5.8 → 4.7 s) for the 8 s rule |
| 03 Chhapa | 25 s | 25.2 s | 25.2 s | yes | the hoop moves on 0.13 s sooner (8 s rule); the dyer's cycle is 3.6 s instead of 3.1 s |
| 04 Makhan Malai | 25 s | 25.5 s | 26.4 s | yes | badal: a stone chabutra halfway, and a following cloud |
| 05 Galouti | 60 s | 37.6 s | 35.6 s | **no** | bhara cut from three pairs to two (8 s rule at lag 12) |
| 06 Kathak | 60 s | 33.1 s | 32.5 s | no (not asked this round) | mehfil takhts 2 → 4 tiles wide; the strip death gets its own cause |
| 07 Hazratganj | 120 s | 69.6 s | 51.1 s | **no** | `lko07-saamne` cut (uniqueness ruling); new `lko07-photo` |
| 08 Bhool Bhulaiya | 60 s | 23.7 s | 26.9 s | **no** | new `lko08-wapas` |
| 09 Kabootarbazi | 60 s | 46.6 s | 46.6 s | **no** | checkpoints only; no new act |
| 10 Lakhnavi Tehzeeb | 90 s | 52.9 s | 46.3 s | **no** | the darbar court is split by a chabutra (the second half has 4 squares); the bell floor has 5 plain boards before each nala |

Pars are reset to about route time × 1.3: 33 / 33 / 34 / 46 / 42 / 66 / 35 / 61 / 60.

## Added acts

### `lko07-photo`: the group photograph (replaces `lko07-saamne`)

- **The decision, in one sentence:** *Run straight through the posing group in the moment the photographer's flash dazzles them (not on a pause, not on a rush), and at the second camera not on his short test flash but on the real one.*
- **Checked against the decisions the game already asks:**

  | Decision the game already asks | Is photo the same? |
  | --- | --- |
  | Step aside and wait | No: there is nowhere to step aside, and the group never leaves. |
  | Pace behind | No: you never follow anyone. |
  | Fake floor with a tell | No. |
  | Floor gives way when you stop | No. |
  | Count, or a stale count | No. |
  | Ride something | No. |
  | Hop a head-on thing | No: hopping is never the answer here. |
  | Item in hand | No. |
  | Follow the beat | No: the flash is a single cue you watch for, not a rhythm. |

  The nearest decision in LKO itself is the 07 room (pause before strollers and they part). Photo makes that answer wrong: a posing group does not part for a pause.
- **Type:** cue-timed rush (betrays the room's pause rule).
- **Family:** pace-sets-crowd-shape.
- **Closest shipped idea:** the 07 room's own strollers, rush vs pause. Photo differs because neither pause nor rush works; only the moment of the flash does. I found no flash or camera mechanic in `docs/MECHANICS.md` or in another city's code (grep for flash, camera, photo).
- **Intro line (hint):** "Outside the studio a photographer is taking the crowd's picture, and a posing group won't part for a stroller, or for a rusher. When his flash goes they are dazzled for a moment: run through them then. The second photographer fires a short test flash first: wait for the real one."
- **A2 (obvious play):** pause so they part, as the strollers taught: `lko-photo` @5143.
- **A3 (obvious fix):** rush them before the flash: `lko-photo-jaldi` @5125. Twist on the second camera, going on the test flash: `lko-photo-test` @5331.
- **Answer:** stand by the group, and go the moment the flash fires (blind window 1.1 s).
- **Hidden item:** none. 07 already has its one item, and the guard allows one per stage.

### `lko02-aadaab`: the greeting you return (replaces `lko02-dakiya`)

- **The decision, in one sentence:** *When a gentleman greets you ("Aadaab"), stop for one short bow after his greeting is done, then go on: not walking past, and not bowing on and on.*
- **Checked against the list:** it is not step aside, pace behind, a fake floor, a floor that gives way, a count, a ride, a head-on hop, an item in hand, or follow the beat. Nothing comes at you.
- **Type:** a stop of the right length, on a cue. The stage already asks two other bow decisions:
  - in the room and the gali, stand still to let others go first;
  - in takrar, hold the bow until he gives up.
- **Family:** politeness-bow-sets-order.
- **Closest shipped idea:** LKO's own takrar (hold the bow). Aadaab differs in two ways: the bow must be short, and holding it is what kills you (`lko-aadaab-zyada`). I found no other city with a greeting you must return.
- **The postman:** cut, as the ruling allowed. The cycles are gone from 02.
- **Intro line:** "Along the lane the gentlemen on their chabutras greet you as you come up: "Aadaab". Return it with a short bow: stop a moment, then go on and hop the nala. Walk past without bowing and he shoves you in; bow on and on, as at the stand-off, and he insists you go first, into it."
- **A2 (obvious play):** walk on past the greeting: `lko-aadaab` @2234.
- **A3 (obvious fix):** bow on and on, as at the stand-off: `lko-aadaab-zyada` @2475.
- **Hidden item:** none (02 has its one).

### `lko08-wapas`: back through the arch

- **The decision, in one sentence:** *When the gallery goes nowhere, walk past its arch, turn, and jump back through it the other way: an arch taken backwards takes you a floor down, out past the well.*
- **Checked against the list:** none of the listed decisions.
- **Type:** maze rule, direction matters (tough but knowable). The stage's one WTF beat stays arch 1 in the room.
- **Family:** entry-height-routes-level.
- **Closest shipped idea:** LKO's own room (a jump through an arch takes you a floor up) and `lko08-utar` (falling through a hanging arch takes you down). Wapas differs: the same plain arch, crossed in the other direction, is the way down.
- **Intro line:** "Up through the first arch on to a gallery over the well, and the gallery goes nowhere: forward through its arch at a jump is the hook roof, and its end is over the well. Walk on past that arch, turn round, and jump back through it the other way: an arch taken backwards takes you a floor down, out past the well."
- **A2 (obvious play):** jump on through its arch, as everywhere: `lko-bhool` @2833.
- **A3 (obvious fix):** walk off the gallery end, as at the hanging arch: `lko-kuan` @2996.
- **Hidden item:** none (08 has its one).

## Check (b): the older acts

The same-cause pairs are fixed:
- **06 mehfil:** stepping on a red strip as she goes away now dies `lko-ghungroo` @2199 ("You stepped on a red strip: she heard the bells and spun back to them."). Crossing her floor still dies `lko-mehfil` @2225.
- **07 julus:** the off-rhythm fourth nala has its own death, `lko-julus-nala` @4252, from a new play that keeps the rhythm of the first three nalas. Rushing up behind them dies `lko-julus` @2801. Hopping on to their heels is also `lko-julus`, because the scripted heel hop also lands as a shove on the ground.

Acts that had one or no scripted play now have two:

| Act | New play(s) |
| --- | --- |
| 05 tawa | hop straight off a full heap `lko-seekh` @824; wait on a flat one `lko-tawa` @943 |
| 05 lane | hop in the lane `lko-seekh` @1390; linger on it `lko-tawa` @1552 |
| 03 kunda | step on the print and stop `lko-chhapa` @870 (beside the jali stop `lko-jali` @1035) |
| 06 tatkar | walk into her patch `lko-tatkar` @614; land on a red strip `lko-chakkar` @1555 |
| 07 shaam | pause under the awnings `lko-shamiyana` @591 |
| 07 chauraha | rush the strollers `lko-ganj` @5679; pause under the awnings again `lko-shamiyana` @5747 |
| 08 mehrab | walk on through the well arch too `lko-kuan` @2317 (beside the drain hop `lko-mehrab` @2152) |
| 10 dhulai | walk straight over the wash line `lko-chhapa` @700; the sunny right tiles `lko-malai` @1216 |
| 10 darbar | hop square after square `lko-kuan` @1534 (beside `lko-goti-pehle` @2400) |
| 10 julus | keep the rhythm into the fourth nala `lko-julus-nala` @4437 (beside `lko-tehzeeb` @3166) |
| 10 galiyara | hop the drain into the first arch `lko-kuan` @5125 (beside `lko-tehzeeb` @5292) |

Acts still with one death, and why:
- **02 gali:** the only two plays are going first (`lko-pehle`) and letting him go first (the answer). There is no second wrong play.
- **04 chowk:** every wrong play there is a cup that sinks in the sun (`lko-malai`). A second play would die the same way.
- **07 batti:** both wrong plays (following close, being under the ladder as it comes down) are the same swing, `lko-seedhi`.
- **Shaam:** its only answer is to keep running, so the only wrong play is the pause.
- **Door endings:** one scripted death each. Doors are endings, not acts.

## The gaps: the 8 s rule at lag 0, 6 and 12

Fixes:
- **07's 14.8 s alcove wait:** gone with saamne. 07's longest gap is now 5.6 s.
- **09's 9.6 s roof crossing:** room checkpoints at 8.2 and 20.3. 09's longest gap is now 6.3 s at lag 12. Hawa and jhande now have a checkpoint at the left edge of every roof (0.2 in), so a 0.3 s run stays on the roof.
- **02's 8.3 s stand-off:** he gives up after 4.7 s instead of 5.8 s. 02's longest gap is now 7.3 s.
- **06's 8.3 s takhts 1-2:** a checkpoint on takht 1. The takhts are now 4 tiles wide, so a run from a checkpoint stays on the takht. 06's longest gap is now 7.7 s.
- **Act-start checkpoints within 3 tiles of a trigger:** moved to 2 columns before the act, on the previous act's calm tail. That is `cp0: false, cps: [-2]` on tawa, bhara, dum, shaam, chausar, badal and aadaab.
- **Mid-act checkpoints that failed the run test:** moved clear of the next trigger (01 tour 36.5 → 35, chowk 17.5 → 14.5, tatkar → 18, dhulai → 18.5, julus10 to the new plain boards).
- **Checkpoints that failed the 4 s idle test** (badal's moving cloud): replaced by a stone chabutra halfway. The next cloud drifts in from behind if you wait there.
- **The finale court** is split by a chabutra, like 08's.

### Probe (c): the three-lag checkpoint table

From my own probe (`tests/lko-lagcp.test.ts`, scratch, not committed). It replays the scripted route with the lagged inputs fair.test uses. From every checkpoint taken, it tries three plays: idle 4 s; run right 0.3 s then idle; one tap-jump then idle.

| Stage | Longest gap at lag 0 / 6 / 12 (s) | Checkpoint failures (idle, run or tap) |
| --- | --- | --- |
| 01 | 4.2 / 4.6 / 4.4 | 0 |
| 02 | 7.2 / 7.2 / 7.3 | 0 |
| 03 | 7.5 / 7.7 / 7.8 | 0 |
| 04 | 7.6 / 7.6 / 7.5 | 0 |
| 05 | 6.5 / 6.5 / 7.9 | 0 |
| 06 | 7.2 / 7.4 / 7.7 | 0 |
| 07 | 5.6 / 5.6 / 5.6 | 0 |
| 08 | 6.9 / 7.0 / 7.3 | 0 |
| 09 | 4.8 / 5.5 / 6.3 | 0 |
| 10 | 5.7 / 5.8 / 6.5 | 0 |

- **Worst replay to a scripted death at lag 0:** 7.1 s (04, the shrinking shadows). The next worst are 03's dyer at 6.6 s and 07's twist at 6.3 s.
- **How often a checkpoint is taken while a hazard is running:** I measured this as "a checkpoint where one of the three plays dies". The count is 0 at all three lags.
- **Not probed:** the "3.5 tiles before the next trigger" distance, as a number. I set it by hand per checkpoint, and the run test (2.6 tiles) checks it indirectly.
- **Not measured:** time to death at lags 6 and 12 (only the route gaps).

## Probe (a): identical windows per act

No act repeats a hazard with the same answer beyond one momentum beat.

| Act | Beats | Repeat? |
| --- | --- | --- |
| photo | 2 groups | the second has the test-flash twist |
| aadaab | 2 greetings | same rule, the second one further on; within the 3-5 QA accepted |
| wapas | 1 | none |
| bhara | 3 hoists | the last is the half hoist |
| badal | 2 halves of 4 and 5 cups | one moving shadow, split by the chabutra |
| court (08, 10) | two halves | the second half's throws are offset; in 10, 4 squares |
| mehfil | 5 takhts | unchanged from round 1 |
| hawa | 8 roofs | unchanged (one flag, read through the wind) |
| jhande | 5 roofs | the switch of flags at the middle roof is the beat |

## Probe (b): NAIVE vs FIX, cause@tick for every act

From the final probe run. Every pair differs in both cause and tick, except where marked. The table under "Check (b)" covers 05 tawa and lane, 06 tatkar, 07 shaam and chauraha, 10 dhulai and 08 mehrab.

```
02  room naive lko-pehle@218 / fix lko-dhakka@343 · takrar lko-takrar@1367 / lko-pehle@1334 · aadaab lko-aadaab@2234 / lko-aadaab-zyada@2475 · gali lko-pehle@722 (one play)
03  room lko-chhapa@141 / lko-jali@404 · kunda lko-jali@1035 / lko-chhapa@870 · adda lko-adda@1485 / lko-kunda@1358 · rang lko-rang@2959 / lko-rang-kood@2583 · door lko-balti@3116 / lko-chhapa@2920
04  room lko-malai@128 / lko-dhakkan@326 · chowk lko-malai@1430 (one) · badal lko-badal@1370 / lko-badal-peeche@1803 · door lko-malai@3115 (one)
05  room lko-seekh@99 / lko-tawa@245 · tawa lko-seekh@824 / lko-tawa@943 · lane lko-seekh@1390 / lko-tawa@1552 · ulta lko-kafgir@2156 / lko-seekh@1893 · bhara lko-tawa@2932 / lko-seekh@2615 (half hoist lko-seekh@3209) · dum lko-dum@3473 / lko-dum-teen@3880 (straight on lko-seekh@3353)
06  room lko-chakkar@187 / lko-tatkar@383 · tatkar lko-tatkar@614 / lko-chakkar@1555 · mehfil lko-mehfil@2225 / lko-ghungroo@2199
07  room lko-ganj@228 / lko-shamiyana@701 · shaam lko-shamiyana@591 (one) · batti lko-seedhi@1258 (one) · julus lko-julus@2801 / lko-julus-nala@4252 · photo lko-photo@5143 / lko-photo-jaldi@5125 (test lko-photo-test@5331) · chauraha lko-ganj@5679 / lko-shamiyana@5747 · door lko-darban@6138
08  room lko-bhool@120 / lko-kuan@307 · chausar lko-kuan@606 / lko-goti@1491 · minar lko-bhool@1960 / lko-kuan@1994 · mehrab lko-mehrab@2152 / lko-kuan@2317 · utar lko-bhool@2607 / lko-kuan@2710 · wapas lko-bhool@2833 / lko-kuan@2996 · door lko-bhool@3168
09  room lko-kabootar@213 / (hawa) lko-hawa@1829 · gumbad lko-gumbad@1223 / lko-aks@1542 · jhande lko-jhanda-aage@4904 / lko-jhanda-peeche@4263
10  room lko-pehle@273 / lko-tehzeeb@333 · dhulai lko-chhapa@700 / lko-malai@1216 · darbar lko-goti-pehle@2400 / lko-kuan@1534 · julus lko-tehzeeb@3166 / lko-julus-nala@4437 · galiyara lko-tehzeeb@5292 / lko-kuan@5125 · door lko-tehzeeb@5566
```

## Death frames

- **Sheets:** `shots/LKO-02-deaths.png` .. `LKO-10-deaths.png`. Each one has the NAIVE, the FIX and every scripted mistake, in that order, 10 ticks before the death.
  - Read closely: 02 (where I found the aadaab drains were not drawn, and fixed it) and 08.
  - Opened one by one: 07's photo frames.
  - The other six sheets were made but not read frame by frame.
- **Title overlay:** every frame shows the stage title card over the top. That is a side effect of how my shooter restarts the stage, not something a player sees mid-run.
- **Route sheets** (`shots/LKO-0N-sheet.png`) are the ones from round 1. I did not re-shoot them.

## Proof

- `npm run typecheck`: clean.
- **`npm test`: 18 files passed (12 skipped); 1640 tests passed, 12 skipped, 0 failed.** LKO is on no allow-list. This was run on the final code with the scratch tests moved out.
- `npm run build:single && node scripts/flows.mjs`: "no errors".
- `LDD_N=80 npm run fair -- LKO`:
```
LKO-01: 6t 100%  12t 100%  18t 84%    every stretch at 0-12t 100%
LKO-02: 6t 100%  12t 100%  18t 100%   every stretch 100%
LKO-03: 6t 100%  12t 100%  18t 76%    every stretch 100%
LKO-04: 6t 100%  12t 100%  18t 76%    every stretch 100%
LKO-05: 6t 100%  12t 100%  18t 76%    every stretch 100%
LKO-06: 6t 100%  12t 100%  18t 93%    every stretch 100%
LKO-07: 6t 100%  12t 100%  18t 98%    every stretch 100%
LKO-08: 6t 100%  12t 100%  18t 93%    every stretch 100%
LKO-09: 6t 100%  12t 100%  18t 76%    every stretch 100%
LKO-10: 6t 100%  12t 100%  18t 80%    every stretch 100%
```
After the fairness run, only one thing changed: the scripted mehfil strip play waits less (its death went from 12.1 s to 3.4 s after its checkpoint). That is a test-only change and does not touch the route.

## Still short, and why

| Stage | Now / floor | Short by | Why |
| --- | --- | --- | --- |
| 05 | 35.6 / 60 s | 24.4 s | lost 2 s when bhara went to two pairs for the lag-12 rule |
| 07 | 51.1 / 120 s | 68.9 s | the uniqueness ruling took saamne (about 25 s) and photo is 7 s |
| 08 | 26.9 / 60 s | 33.1 s | four to five more maze acts of about 6 s each |
| 09 | 46.6 / 60 s | 13.4 s | one more act |
| 10 | 46.3 / 90 s | 43.7 s | four to five more twisted callbacks |

The round asked for new rules only: no second window of a rule the stage already teaches, and no step-aside or pace-behind. I designed 09 ideas (laundry that keeps the flock off a roof; the flyer's swinging pole) and dropped them unbuilt. The pole is the lamplighter's swing in `lko07-batti` again. The laundry idea needed the red flag to be dangerous as well, or "cross only on red" would still beat it.

What I would build next, each a new decision:
- **05:** a reverse lane where the squash rises again behind you.
- **08:** a corridor where a doorway's mirror image is the real one.
- **10:** callbacks of photo (the flash also lights the bells), aadaab (a greeting from the courtier on the court) and wapas (the julus going the other way).

Also fixed: my round-1 doc script had written act text into the fairness table of `docs/cities/LKO.md`; the table is rewritten with this round's numbers.

Not checked: real human play; route sheets for the changed stages (not re-shot; the death sheets cover them); the "3.5 tiles before a trigger" distance as a measured number.
