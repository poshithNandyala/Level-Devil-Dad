# CHN Chennai extend + toughen: report

Branch `city/chn` in `/local/home/saiposh/personal/ldd-wt/chn`, cut from develop f8288e9 (v0.17.2); develop 412039f (v0.17.3 Sri Vijaya Puram) merged in at 45b898b. Head **45b898b**. Commits: 191708f encores + chn- keys + intros + seventh line, d610c64 tour bite + calm checkpoints on 01/04/05, f0cde1e CHN-10 down-escalator boarding band, 296f2ec honest pars + refreeze, 45b898b merge develop. Not pushed, no version bump, no shared file committed (the two guards were proven with CHN removed locally and `git checkout`ed back). Files: `src/game/cities/chn/{murukku,spencer,sundal}.ts` (new), `levels.ts`, `endings.ts`, `causes.ts`, `things.ts`, `lines.ts`, `tests/cities/chn.ts`, `tests/cities/_frozen/chn.json`. Clock: pass ran 06:03-08:20 UTC on worker chat-87 (one restart at ~07:25 UTC cost the uncommitted state nothing; everything on disk was re-verified).

## 0. Honest first: what is short, what is not done

1. **Both encores are far under their length floors.** CHN-09 Murukku Press: bot route **31.6 s** (3788 ticks) against the >= 60 s floor; it has the 5 two-play acts asked for. CHN-10 Spencer Escalators: **26.7 s** (3207 ticks) against >= 90 s; it has 4 acts. Pars are set to the bot x 1.35 rule (43 and 36), not to the floors. Doubling either stage did not fit the budget once the shipped-stage findings below came up; the acts that exist are each a real decision (section A).
2. **CHN-10's door collides with a shipped door.** `chn-wet-floor-sign` (the mopped floor slides you, the door stays shut for wet feet, the WET FLOOR sign stands on the only dry tiles: stop on the mat) is the same thought as TVM-10's shipped door `tvm-oily-feet-coir-mat` (DECISIONS.md row `tvm-oily-feet-coir-mat`: "oily feet slip off the polished doorstep: walk the coir mat and it wipes them"). I found it while writing the registry check, with no time left to recast. **It needs a new decision before merge**; candidate recasts (not built): the sign is the liar and the door opens for whoever walks the shine (an inversion of 10's own kaanal act), or the cleaner's mop bucket gates the door on a cadence. The ending key, skin and route can stay; only the rule changes.
3. **Stages 02-08 fail the human-timing bar; left alone except their checkpoints.** Under the lag model their shipped rooms die at 6 ticks of lag (the sweep table, section E): fairness at N=80 is CHN-02 64/28, CHN-04 79/35, CHN-05 71/66, CHN-06 78/30, CHN-07 1/0, CHN-08 93/41 (6t/12t). These are the OLD precision rooms and doors (pot queue hop at x14, the subway floats at x13, the kaapi arcs at x21, the dolls at x15, the rangoli and the bridge doors) and each needs its own room pass. I did not change their play. CHN-01, 09 and 10 are 100/100 at 6t and 12t.
4. **CHN-03's fairness cannot be measured as the tests stand.** `tests/acts.ts:152` (the shared float-hopper policy for `chn03-frogger`) throws `Cannot read properties of undefined (reading 'x')` when the lagged Dad has passed the bank while x < until; `npm run fair -- CHN` aborts on it for the whole city. I ran the N=80 fairness on the other nine stages. The one-line fix is in a shared test file (`cands[0]?.x ?? Infinity`), so it is not on this branch: **ask for it** (work_report question in the summary). My sweep copy catches the throw and steers right, and logs it (10 throws, all CHN-03, idle 251 and lag 6+).
5. **One sweep failure stays on CHN-05**: 6 plays at cp0 (x32.5) when the route is captured in the air by a kite hop at spawn-idle 251 (Dad lands at 38.7 just past the first well); a tap-jump from that capture lands in the second well at 46 (`fell`). The strict cpsafe (idle 0) passes; only this idle shows it. The fix is the act's checkpoint placement (`chn05-heat` cp0) or a ground capture rule, not done.
6. The murukku source is everyday life (no page): what I could verify is that murukku dough is extruded from a brass press (achu) into hot oil, that it is soft when it lands and crisps as it fries, and that thenkuzhal stays white. The claim that a pale strand folds under a weight and a fried one holds is a game rule, not a fact.
7. Not written: `docs/cities/CHN*.md` and the CHN row in `docs/CITIES.md`.
8. The tour's FIX dies to the same cause key as its NAIVE (`chn-sundal`, at a different tick and place: 1012 @75.6 vs 1075 @77.3). The brief asked the tour only for a NAIVE that dies; the old FIX (stand where the pot bubbles, `burnt`) is kept as a mistake.

## A. Encores

| id | name | family [betrayals] | ending key | acts (decision; registry check; NAIVE cause@tick; FIX cause@tick) | route vs floor | fairness 6/12t, worst stretch | checkpoints | hidden item |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CHN-09 | Murukku Press | extruded-spiral-strand [extrude-set] | chn-fresh-curtain | room + 5 acts, table below | 31.6 s vs >= 60 s (SHORT) | 100% / 100% (18t 76%); every stretch 100% | 32.5, 62.5, 92.5, 122.5, 152.5, 181.5 (door) | `tumbler` at 20.5, 10.1: over the oil, above the third golden spiral (a hop from the second) |
| CHN-10 | Spencer Escalators | stair-direction-by-load [escalator-flip] | chn-wet-floor-sign (COLLIDES, section 0.2) | room + 4 acts, table below | 26.7 s vs >= 90 s (SHORT) | 100% / 100% (18t 96%); every stretch 100% | 32.5, 62.5, 88.5, 118.5, 147.5 (door) | `tumbler` at 13.5, 9.1: over the fountain basin beside the room escalator (reach it from a step) |

Absolute ticks from the probe (`probes/probe-chn.test.ts.txt`, lag 0): the pairs below are the same-tick FIX check, every A1/A2 pair dies to a different cause and at a different tick.

**CHN-09 acts.** Press head `chn-achu` kills whenever the press is out of park and you are under it; ladle scoop `chn-karandi`; ladle drip `chn-sottu`; oil `chn-ennai`; the cook's hand `chn-kai`.

| part | decision (one sentence) | closest registry row | why different | NAIVE (A1) | FIX (A2) |
| --- | --- | --- | --- | --- | --- |
| room | Pale dough folds, golden holds, but the golden one you would wait on is the oldest and the ladle takes it: go the moment the pale one turns. | DMN-03 `dmn03-dispatch` (the floor's age kills; cross before it changes), S1/S2 rulings | the age runs the other way (time makes the floor safe) and the trap is the wait itself: the safe-looking old one is removed | `chn-ennai` @211 (hop on to the pale one) | `chn-karandi` @385 (wait on the golden one) |
| chn09-karandi | The darkest spiral is the one the ladle lifts first, and it swings back dripping over the one before it: back to the bank when the ladle hovers, go when the fresh one in the gap turns. | room (same kitchen); CHN-02 queue (order) | order read by colour (darkest = oldest), and the drip is a second hazard on the "safe" spiral | `chn-karandi` @782 (hop on to the dark one) | `chn-sottu` @845 (wait on the first) |
| chn09-kannu | The big spiral's eye is wider than a stride and the press comes down over the far turn as you land: wait for it to lift, then hop the eye. | B25 super-jump under a ceiling (PARTLY) | a timed overhead, not a height limit: the press cycles and leaves | `chn-ennai` @1680 (run across) | `chn-achu` @1686 (hop the eye at once) |
| chn09-thenkuzhal | Thenkuzhal fries white, so colour says nothing: the bubbles say when it is done, and the one you stand on is the oldest. | F467 quiet-means-clear (BBI-07, sound) | a visual frying read that contradicts the room's colour rule; the wait is again punished | `chn-karandi` @2591 (wait for golden) | `chn-ennai` @2340 (step on at once) |
| chn09-varisai | A row laid together is one age: wait for it to turn, then run the whole row, because the ladle starts at your end. | `pdy04-closing` (never stop) | a wait-then-run with the start read from the row's colour, the end from the ladle's order | `chn-ennai` @2761 (run on as it is laid) | `chn-karandi` @3081 (step on, stop for a look) |
| chn09-ruchi | The cook tastes a finished spiral: the near end you land on is snapped off and the rest lifted: land and keep going. | TVM-04 coconut-on-stoppers (S10) | triggered by the landing, not by stopping; two hazards in order (hand, ladle); the middle must be crossed too | `chn-kai` @3400 (land, wait) | `chn-karandi` @3484 (cross to the middle, wait) |
| door chn-fresh-curtain | Pale strands part for a walker; stop in front and the cook lights the burner under you and the fried curtain is a wall. | `kvt08-weed` (stop and it goes under) | the stop changes the door, not the floor, and the burner is where you stand | `burnt` @3741 (stop to let it fry) | (route walks through) |

**CHN-10 acts.** Law 7: each callback breaks the rule its original taught.

| part | decision | breaks / closest row | NAIVE (A1) | FIX (A2) |
| --- | --- | --- | --- | --- |
| room | One rider up, two down fast into the comb: step on, hop straight back on to the kerb so the shopper rides alone, then ride. | B9 belt that reverses (PARTLY, BOM-02) | the reversal is by load and the answer is to give the ride away, not to time the belt | `chn-comb` @217 (step on and ride) | `chn-fountain` @242 (jump off when it reverses) |
| chn10-moodal | Four aboard trips the overload and it crawls up anyway: stay on; hop off when the family boards and their trolley comes down the runaway belt at you. | breaks the room (two = down) | `chn-trolley` @1288 (hop back off like the room) | (route stays on) |
| chn10-kaanal | Indoors the shimmer is polish and holds; the dark patch is the open well. | breaks CHN-05 (shimmer = hole, dark = shade); S19 keep | `chn-fountain` @1758 (hop the shimmer, walk the dark) | (route walks the shimmer) |
| chn10-keezhe | A down escalator: alone you go into the comb; board while the kid rides so two aboard run it up. | breaks the room (two = down becomes two = up) | `chn-comb` @2160 (step on while it is empty) | (route boards with the kid) |
| chn10-pattarai | The pale display murukku are real and hold; the golden one is plaster and crumbles under a stop. | breaks CHN-09 (golden holds, pale folds) | `chn-fountain` @2809 (stand on the golden one) | (route crosses without stopping) |
| door chn-wet-floor-sign | see section 0.2: COLLIDES with `tvm-oily-feet-coir-mat` | | | |

Identical-window probe (same wait predicate used twice in one stage): CHN-09 waits are `fried(r2)` (room), `ladleHovers` then `fried(k2)` (karandi), `pressGone` (kannu), `quiet(t2)` (thenkuzhal, the bubbles), `fried(v0)` then run (varisai), none (ruchi): two acts wait for a colour change (room, varisai) but varisai's second half is a run against the ladle's order, so the window differs; flagged for QA. CHN-10 waits: `shoppers[0].off === 'gone'` (room), none (moodal, kaanal, pattarai), `stepUnder(keezhe, 24..33) && kid riding` (keezhe): no repeat.

Meta: `MURUKKU_META = { family: 'extruded-spiral-strand', betrayals: ['extrude-set'], ending: 'chn-fresh-curtain' }`, `SPENCER_META = { family: 'stair-direction-by-load', betrayals: ['escalator-flip'], ending: 'chn-wet-floor-sign' }`, as allocation.json. Act ids `chn09-karandi|kannu|thenkuzhal|varisai|ruchi`, `chn10-moodal|kaanal|keezhe|pattarai`; `tests/allocation.test.ts` 10/10 and the game-wide act-id uniqueness test pass. Signs: MURUKKU (kadai hot), SPENCER (plaza), EXIT, MAX 2 (per step), DOWN (to the food court), FLOOR 2 (polished today), FOOD COURT (display only). Tara lies in every part (listed in C); the guide line in every part is true.

## B. Tour bite (archetype B5, not B16)

allocation.json's `tour-chn-b16` (sundal cart, contact is a ride) is owned by KVT-09 F496 (DECISIONS.md V1), so the bite takes **B5, cadence then a liar** (FREE in the registry table, no "close" note). Skin kept: the sundal cart on the Marina promenade (`src/game/cities/chn/sundal.ts`, cart at tiles 76-78, vendor at 79). The vendor lifts the pan's lid on a steady beat (open 0.5 s, a column of scalding steam over the path, `chn-sundal`; shut 1.1 s, clear). The beat lies once: as Dad comes within 3 tiles the vendor lifts the lid to show the sundal ("Sundal! Sooda sundal!") and the shut after it lasts only 0.35 s ("Paaru, sooda irukku!"). The honest tell is his hand: it goes to the handle 0.25 s before every lift. Decision: *cross when the lid is shut and his hand is down; the rhythm is not the tell, his hand is.* Registry check: closest rows `hyd07-boxes` (steady rhythm: walk between two), `dis-uruka-net` recast (cross while the fishers rest), `KVT-05/room` (tuna on a rhythm); different because here the rhythm itself is the trap (it breaks on the beat you take) and the read is a pre-motion tell on the worker, not the rhythm. Tara: "Moodina udane odu, Dad! | Run the moment it shuts, Dad!" (B38, the lie). Guide: "Moodi illa, avan kai-ya paaru. | Not the lid, watch his hand."

The tour keeps its teaching job (parked auto, ditch, gopuram steps, lamp posts, wall, Pongal pot) and gets a NAIVE that dies: walk on like past the posts -> `chn-sundal` @1012. FIX (go the moment it shuts) -> `chn-sundal` @1075 (the short shut). Mistakes: wait for the hand to go up then go (`chn-sundal`), hop the cart like the parked auto (`chn-sundal`), stand where the pot bubbles (`burnt`). The SUNDAL stall prop and the x82 shout were removed (the cart carries both). Route: `tour01()` in tests/cities/chn.ts inserts the wait before the shared route's 'a low wall' step. **Allocation correction:** CHN tourNew = `tour-chn-b5`, betrayals ["B5"], idea "the sundal vendor's lid beat lies once; the hand is the tell".

Also in 01: the Pongal pot's trigger moved 85.5 -> 86.8 and its reach 3.5 -> 2.6 tiles (the spill still runs a tile past where you stood), and the shared route's back-off is 40 ticks instead of 30 (mapped in tour01). Checkpoints are now explicit: 17.5, 29.5, 57.5, **68.5** (was 74.5), **79** (was 83.5): section E.

## C. Lines (local | English)

| Where | Line |
| --- | --- |
| seven (replaces "Thala for a reason") | Ezhaavadhu kaapi! Tumbler-la nirappu. \| Seventh coffee! The tumbler is topped up again. (4 / 7 words) |
| intro[5] CHN-06 | Malli vaanga, Dad! Madurai special! \| Buy some jasmine, Dad! Madurai special! |
| intro[6] CHN-07 | Thalaiyatti bommai! Illa-nu solla theriyum! \| Head-shaking dolls! They know how to say no! |
| intro[7] CHN-08 | Pamban paalam! Train varum, odu! \| Pamban bridge! A train is coming, run! |
| intro[8] CHN-09 | Murukku mela nadandhu po, Dad! \| Walk right across the murukku, Dad! |
| intro[9] CHN-10 | Escalator-la rendu peru safe, Dad! \| Two on the escalator is safe, Dad! |
| CHN-09 cook | Murukku pizhiyaren! \| Pressing a murukku! / Adhu over-aa fry aagiduchu! \| That one is over-fried! / Innum oru suttru! \| One more turn! / Thenkuzhal! Vellai-aa dhaan irukkum! \| Thenkuzhal! It stays white! / Naalu varisai! \| A row of four! / Ruchi paakkaren! \| Let me taste! / Adhu fry aagattum! \| Let it fry! |
| CHN-09 guide | Pon niram-la dhaan nillu. \| Stand only on the golden ones. / Karandi-ya paaru. \| Watch the ladle. / Periya murukku: nadu-la kannu. \| Big murukku: an eye in the middle. / Ennai kodhikkudha paaru. \| See if the oil is bubbling. / Varisai-la nikkaadhe. \| Do not stop on the row. / Munnaadi nunni odanjidum. \| The near end gets snapped off. |
| CHN-09 Tara | Mithakkudhu paaru! Odu, Dad! \| Look, it floats! Run, Dad! / Nillu, Dad! Nee safe! \| Stay, Dad! You are safe! / Nadu-la thaandu, Dad! \| Jump the middle, Dad! / Pon niram varum, wait pannu! \| It will go golden, wait! / Medhuvaa po, Dad! \| Go slow, Dad! |
| CHN-10 guide | Escalator-la oru aal dhaan. \| One person on the escalator. / Kudumbam kaathirukku. \| A family is waiting. / Idhu keezha pogum escalator. \| This one runs down. / Floor polish pannirukkaanga. \| They have polished the floor. / Idhu display murukku. \| These are display murukku. |
| CHN-10 Tara | Rendu peru, mela pogum! \| Two people, it goes up! / Rendu peru! Iranga, Dad! \| Two people! Get off, Dad! / Kaali-aa irukkum podhu yeru! \| Get on while it is empty! / Veyil kaanal! Thaandu! \| Heat shimmer! Jump it! / Pon niram dhaan strong! \| Golden is the strong one! |
| CHN-10 door | Kaal thudachu vaanga! \| Wipe your feet first! / Seri, ulla vaanga! \| Right, come in! |
| CHN-01 cart | Sundal! Sooda sundal! \| Sundal! Hot sundal! / Paaru, sooda irukku! \| Look, it is hot! / Moodi illa, avan kai-ya paaru. \| Not the lid, watch his hand. / Moodina udane odu, Dad! \| Run the moment it shuts, Dad! |
| causeLines | chn-ennai, chn-achu, chn-karandi, chn-sottu, chn-kai, chn-comb, chn-fountain, chn-trolley, chn-sundal: [what happened, how to beat it] |

`intro` has 10 entries (indices 0-4 unchanged); every other LINES field is unchanged and still right for 10 stages (modules guard "has a Tara intro for every long stage" passes with CHN off the OLD list). A native check is worth having on "Thalaiyatti bommai! Illa-nu solla theriyum!" and "Ezhaavadhu kaapi! Tumbler-la nirappu."

## D. Prefixed keys (every rename)

| kind | old -> new |
| --- | --- |
| ending | `token` -> `chn-token`, `bull` -> `chn-bull`, `catch` -> `chn-catch`, `rangoli` -> `chn-rangoli`, `tips` -> `chn-tips` (stage twists in levels.ts updated; `sink` on CHN-08 is the shared kit twist, not CHN's) |
| thing | `lorry` -> `chn-lorry`, `mirage` -> `chn-mirage`, `loco` -> `chn-loco`, `ball` -> `chn-ball` (things.ts and every use in levels.ts) |
| cause | CHN had no own cause keys before (its deaths used the shared `hit`, `fell`, `flood`, `splash`, `burnt`, `spikes`, `crush`); the nine new ones all carry `chn-` |
| new endings | `chn-fresh-curtain`, `chn-wet-floor-sign` |

The shared test tables (`tests/endings.ts` policies, `tests/solutions.ts` twists) were not edited: the city file supplies the policies for the two new endings, and the old five are found by the shared `policyFor`, which strips a three-letter city prefix and falls back to the old key (`tests/endings.ts:584`). The modules guard "prefixes its new keys with its code" passes with CHN off the OLD list.

## E. Hardness and checkpoints, stages 02-08

| stage | changed? | what | why | NAIVE cause | FIX cause | fairness 6t/12t (N=80) | checkpoints moved |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 02 Kudam Queue | no | | the obvious play already dies; the room's hop at x14 dies at 6 ticks of lag (left for its own pass) | hit @135 | hit @674 | 64% / 28% (s0 28%) | no |
| 03 Subway Splash | no | | NAIVE dies; the floats at x13 die at lag 6+; fairness unmeasurable (shared policy throws, 0.4) | flood @158 | (none in the shared table) | not measurable | no |
| 04 Degree Kaapi | checkpoint only | `chn04-cricket` cp0 false, cps [-3.5]: the act's checkpoint sits in the room's tail at 28.5 | from the act's first column a 0.3 s run passed the first bowl's trigger and the ball took a standing dad | fell @176 | hit @792 | 79% / 35% (s0 35%: the kaapi arcs at x21) | 32.5 -> 28.5 |
| 05 Agni Mirage | checkpoint zone only | the last-stretch kite zone starts at dx-5 (70) instead of dx-8 (67) | the door checkpoint at 65.5 must be calm for a 0.3 s run; the forward leg under kites shrinks from 9.5 to 6.5 tiles | hit @254 | fell @616 | 71% / 66% (s0 68%: the room's kites) | no (zone moved) |
| 06 Madurai Malli | no | | NAIVE dies; door `chn-rangoli` gets stuck at lag 6+ and the ladi act falls at x21-22 | fell @123 | (none) | 78% / 30% (door 45%) | no |
| 07 Thanjavur Bommai | no | | NAIVE dies; the dolls room falls at x15 at every lag, even 0 with a late start: the stage most in need of a room pass | fell @95 | spikes @881 | **1% / 0%** | no |
| 08 Pamban Paalam | no | | NAIVE dies; the door "and whatever it does" gets stuck at lag 11-12 | splash @64 | (none) | 93% / 41% (door 51%) | no |

FIX plays exist for 01, 02, 04, 05, 07, 09, 10 (7 of 10; the guard wants 5). The shipped NAIVE/FIX for 02-08 live in the shared tables and were not touched.

### The lag-captured sweep (route at lag 0/6/11/12 x spawn idle 0/37/120/251; at each capture: idle 4 s, run 0.3 s after 0/6/12 ticks, tap-jump after 0/6/12 ticks)

| stage | capture points | plays | deaths | longest stretch | route at lag 6 / 11 / 12 |
| --- | --- | --- | --- | --- | --- |
| CHN-01 | 5 | 560 | 0 | 6.0 s | wins at every lag and idle |
| CHN-02 | 2 | 56 | 0 | 5.9 s | dies: hit @14 (lag 6, 11), splash @15 (lag 12) |
| CHN-03 | 2 | 56 | 0 | 7.9 s | dies: flood @13 at lag 6+ |
| CHN-04 | 2 | 56 | 0 | 5.3 s | dies: burnt @21-22 at lag 6+ |
| CHN-05 | 2 | 154 | **6** | 5.6 s | dies at lag 11-12 (hit @6-21, the room kites) and once at lag 0 idle 120 (hit @75) |
| CHN-06 | 2 | 168 | 0 | 32.3 s | stuck at the door (chn-rangoli) or fell @21-22 at lag 6+ |
| CHN-07 | 2 | 28 | 0 | 6.1 s | dies: fell @15 at lag 6+ (and at lag 0 with idle 37/120) |
| CHN-08 | 2 | 224 | 0 | 17.3 s | stuck at the door at lag 11-12 |
| CHN-09 | 6 | 672 | 0 | 8.1 s | wins at every lag and idle |
| CHN-10 | 5 | 560 | 0 | 11.6 s | wins at every lag and idle (after f0cde1e) |

Plays counted only at captures the lagged route reached; a route that dies early yields few captures (28 for CHN-07). The 6 CHN-05 deaths are all one capture (cp0 taken in the air at x38.7, idle 251): section 0.5. Full log: `probes/sweep-final.txt`.

### Per-tick replay from the last checkpoint to each death (seconds, lag 0 / 6 / 12)

| stage | NAIVE | FIX | mistakes (worst) | worst |
| --- | --- | --- | --- | --- |
| CHN-01 | 0.79 / 0.86 / 0.91 | 1.32 / 1.38 / 1.43 | 1.44 | 1.44 |
| CHN-02 | 1.13 / 1.18 / 1.23 | 1.40 / 1.48 / 1.73 | | 1.73 |
| CHN-03 | 1.32 / 1.37 / 1.42 | | | 1.42 |
| CHN-04 | 1.47 / 1.57 / 1.67 | 3.08 / 2.19 / 2.24 | | 3.08 |
| CHN-05 | 2.12 / 2.12 / 2.12 | 1.90 / 1.90 / 2.12 | | 2.12 |
| CHN-06 | 1.02 / 1.07 / 1.13 | | | 1.13 |
| CHN-07 | 0.79 / 0.84 / 0.89 | 3.33 / 2.25 / 2.35 | | 3.33 |
| CHN-08 | 0.53 / 0.58 / 0.63 | | | 0.63 |
| CHN-09 | 1.76 / 1.86 / 1.96 | 3.21 / 3.26 / 3.31 | m5 thenkuzhal A1 4.47 / 4.53 / 4.57 | 4.57 |
| CHN-10 | 1.81 / 1.86 / 1.91 | 2.02 / 2.11 / 2.20 | m3 keezhe A1 1.13 / 1.12 / 3.78 | 3.78 |

All under 7.5 s. No stage restarts from the start (every stage has calm checkpoints; stage 01 is the tour, its own waits exempt).

### Checkpoint changes and the 4.5-tile rule

- CHN-01: 74.5 -> **68.5** (between the last two lamp posts; the vendor's lift trigger is 73, steam from 76) and 83.5 -> **79** (taken in the wall hop; the pot's trigger is 86.8). A capture taken in the air carries a tap-jump 6+ tiles (measured: from 79 to 85.3), which is why the pot's trigger moved rather than the checkpoint alone.
- CHN-04: act cp0 -> **28.5** in the room's tail (first bowl trigger at 34).
- CHN-05: door checkpoint 65.5 kept; the kite zone moved to 70.
- CHN-09: 32.5, 62.5, 92.5, 122.5, 152.5, 181.5; CHN-10: 32.5, 62.5, 88.5, 118.5, 147.5: all at act starts and the door, all 0 deaths in the sweep.
- Strict cpsafe (CHN off EXEMPT locally): all ten stages pass idle, run and tap-jump at lag 0/6/12; `modules.test.ts -t CHN` 11/11 with CHN off the OLD list; both files restored with `git checkout`.

### CHN-10 boarding fix (f0cde1e)

The down escalator's step comes toward the kerb and goes under the comb at the foot; the route boarded whichever step was under the kerb edge, and at lag 11-12 that step had gone under before Dad stepped off (fountain at x97). `stepUnder(w, name, band)` now takes the step's left edge as a band from the foot (default -6..18 px; keezhe uses 24..33), so a step-off up to 12 ticks late still lands on it (worked from the trace in `probes/sweep-final.txt`: Dad leaves the kerb 12 ticks after the press, falls 16 px in 16 ticks, the step moves 0.6 px/tick). Route-only change plus the helper's signature; the stage's play is unchanged.

## F. Refreeze diff (`tests/cities/_frozen/chn.json`), number by number

| stage | field | before -> after | why |
| --- | --- | --- | --- |
| CHN-01 | checkpoints | 74.5, 83.5 -> 68.5, 79 | section E |
| CHN-01 | route tick | 1737 -> 1904 | +167 ticks: the wait at the sundal cart for a shut with the hand down |
| CHN-01 | naive | burnt @1178 -> chn-sundal @1012 | the obvious walk now meets the steam before the pot |
| CHN-01 | fix | burnt @1200 -> chn-sundal @1075 | the new FIX (go the moment it shuts) dies to the short shut |
| CHN-04 | checkpoints | 32.5, 67.5 -> 28.5, 67.5 | the act's checkpoint moved into the room's tail |
| CHN-05 | (none) | | the kite-zone move did not change the route's tick or its plays |
| CHN-09 | new | par 43, item [20.5, 10.1], 6 checkpoints, route won @3788, naive chn-ennai @211, fix chn-karandi @385 | new stage |
| CHN-10 | new | par 36, item [13.5, 9.1], 5 checkpoints, route won @3207, naive chn-comb @217, fix chn-fountain @242 | new stage |

## G. Tests and checks

- `npm run typecheck`: clean (before and after the develop merge).
- `npm test` after the merge: **18 files passed, 1812 tests passed, 0 failed** (15 files env-gated skipped, 22 tests skipped), 45 s; the frozen test green on the refrozen file.
- `npx vitest run tests/modules.test.ts -t CHN` with `CHN: OLD,` removed: 11 passed. `npx vitest run tests/cpsafe.test.ts -t CHN` with it removed (strict mode): 10 passed. Both files `git checkout`ed; the integrator takes CHN off the list at merge.
- `tests/allocation.test.ts`: 10 passed.
- `LDD_N=80 npm run fair -- CHN`: aborts on the shared `tests/acts.ts:152` throw (section 0.4). `LDD_N=80 bash scripts/dev/fair.sh CHN-01,CHN-02,CHN-04,...,CHN-10` (nine stages, `probes/fair-n80.txt`):

```
CHN-01: 6t 100%  12t 100%  18t 100%   stretches s0-s4, door 100%
CHN-02: 6t  64%  12t  28%  18t  38%   s0 28%  (hit @14, splash @15)
CHN-04: 6t  79%  12t  35%  18t  40%   s0 35%  (burnt @21-22)
CHN-05: 6t  71%  12t  66%  18t  50%   s0 68%, door 98%  (room kites)
CHN-06: 6t  78%  12t  30%  18t  35%   s0 66%, door 45%
CHN-07: 6t   1%  12t   0%  18t   0%   s0 10%, door 0%
CHN-08: 6t  93%  12t  41%  18t  43%   s0 81%, door 51%
CHN-09: 6t 100%  12t 100%  18t  76%   every stretch 100%
CHN-10: 6t 100%  12t 100%  18t  96%   every stretch 100%
```

- Lag-captured sweep over all ten stages: above (`probes/sweep-final.txt`; the probe itself is `probes/qa6-chn.test.ts.txt`, a copy of PAT's qa6 with a try/catch around the step policy and an optional trace; drop it in `tests/qa/` to re-run with `QA6=1 QA6_IDS=... QA6_IDLE=0,37,120,251`).
- `npm run build:single` (1,431 kB) and `node scripts/flows.mjs`: no errors.
- Sheets read: `shots/CHN-01-sheet.png` (cart, steam column, vendor, the three cart lines, the pot), `CHN-04`, `CHN-05`, `CHN-09` (press rail and head, spirals on the oil, ladle, the pale curtain at the door), `CHN-10` (escalators with arrows and shoppers, landings, basins, the WET FLOOR board at the door). Nothing drawn wrong that I could see; the spirals are thin (8 px) strips and the kadai's oil reads as a dark band under them.

## H. Risks and where QA should press

1. The TVM-10 door collision (0.2): block on it.
2. CHN-09's room decision vs DMN-03 (A table, first row): the allocator gave the family; the registry test should be applied by someone else.
3. The lengths (0.1): 31.6 s and 26.7 s bot time.
4. CHN-05 cp0 in the air at idle 251 (0.5); CHN-03 fairness unmeasured (0.4); stages 02-08 fail the lag bar (0.3), CHN-07 worst.
5. CHN-09 thenkuzhal: the "bubbles stop" read lands 1.5 s after the lay; a player who waits for a colour that never comes dies to the ladle at 3.7 s: the hint says so, but it is the hardest read in the stage.
6. CHN-10 keezhe: the boarding window (step 24-33 px up the run while the kid rides) is 15 ticks wide at the route's cadence; a human will miss it a few times (the comb or the fountain, both replays under 3.8 s).
7. The sundal cart: the lie is armed by the pass at tile 73 and fires once per world. A respawn is a replay to the capture tick, so from the 68.5 checkpoint (before the trigger) the player meets the lift and the short shut again; from 79 the cart is behind them. Tested only by script.
8. Not touched: `docs/cities/CHN*.md`, `docs/CITIES.md`.
