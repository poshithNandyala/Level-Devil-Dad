# SHL · Shillong (Meghalaya): build report, round 2 (all ten stages built; seven under their length floors, 08 by 1.1 s)

**Branch** `city/shl` in `/local/home/saiposh/personal/ldd-wt/shl`, tip `563b7e7e5550c647b3b511c49d72e8f399281369` (23491d0 merged `origin/develop` 412039f, v0.17.3 with SVP, on top of my commits, then one docs commit; merge-base before the merge f8288e9). Nothing pushed, no version bump. `git diff --name-only f8288e9` before the merge, and `git diff --name-only origin/develop` after it, show only `src/game/cities/shl/`, `tests/cities/shl.ts`, `docs/cities/SHL.md`, my row in `docs/CITIES.md` and the SHL section in `docs/MECHANICS.md`. The scratch sweep `tests/qa/qa6.test.ts` (the tester's qa6 copied) is untracked and uncommitted; a copy is in this folder as `qa6.test.ts.txt`.
Budget: 150 min from 07:10 UTC, plus the 9 min lost to the Kiro Crew restart at 07:25; this report was written at 08:48-08:58 UTC.

## Honest: where the city stands

| Stage | Route clear time | Floor (goal v21) | Two-play acts (room + acts, each with two plays of different cause and tick) | Short? What was skipped and why |
| --- | --- | --- | --- | --- |
| 01 Kumno, Shillong! (tour) | 13.5 s | ~15 s shared course | 1 (slap / lyoh) | at the bar |
| 02 Pine Peak | 33.9 s | 25-45 s | 3 (room edge/dum; sngi edge; lyoh dum) | in the bar. Both act clocks now start when Dad enters the act (replay 4.2 s) |
| 03 Sway | 25.3 s | 25-45 s | 3 (room sway/wake; wake sway; wet slip) | at the bar. The same-tick pair of round 1 is gone: the second play on the boats' span now runs span three in a hurry the moment the wake has passed and dies to `shl-sway` |
| 04 Knup | 12.4 s | 25-45 s | 3 (room slap/dieng; iew slap; khynnah slap/lintel) | **short by 12.6 s, left short on purpose.** The one candidate for a new act, "the knup is heavy when soaked: shake it (jump in place) before the hook, do not wait for it to drain", reduces to the S7 ruling in DECISIONS.md §5 ("jump in place to drive the mechanism that brings the way": `svp05-rassi` was cut for it, RPR `ghanta` and GNR `herd` own it), and its wait form reduces to JAI-03 (let it settle before every jump). No other knup decision passed the gate, so 04 keeps three acts and 12.4 s. The duplicate mistake (the stage FIX listed again) is removed |
| 05 Seven Sisters (HWIK) | 31.1 s | >= 60 s | 4 (room um/wah; ar um; pung pung; roar wah/um) | **short by 29 s.** Added this round: the hidden sister read by her roar (sound beat) and the quick sister (half a second on the mark, the labelled momentum beat) in one act with a long ledge. Not added: a seventh sister with a new read (every remaining idea was the room's read with a different timer: padding) |
| 06 Root Guide | 35.3 s | >= 60 s | 4 (room gorge/spray; sprout gorge; double gorge/jri; kiang jri) | **short by 25 s.** Added: the double root (near first, then the far guide from the near root's tip; out of order the near root grows at head height). Not built: the double-decker top deck "on a different timer" (bible concept 2): every version I could state reduced to SVP-09 (an old root that crumbles = dead root) or to RPR-07 (go when the bridge is whole); the "root grows the way the guide leans" idea reduced to `svp08-chhajja` (read the slope, the product goes to the low side) |
| 07 Mawsmai (marathon) | 50.2 s | >= 120 s | 6 (room shut/maw; krem maw; pool maw/shut; plop shut/maw; knock shut/maw; pairs shut/stump) | **short by 70 s.** The marathon now has its momentum beat (krem), shelter beat (the pool), sound beat (the hidden tips by click and plop), the tap twist (knock) and the pairs (the allocation's A3: a tap stops only the one you hit, its stump keeps rising). Each cave act is 6-10 s because a stalactite shuts in 2-4 s and the player passes in bursts; a 120 s cave needs eight more acts, and the family's remaining decisions I could name (a column that never breaks; drips that fall behind the rock) are HWIK-ish or struck (the falling piece = TVM-04 "stop between palms"). Honest number: 50 s |
| 08 Wettest Desert (HWIK) | 58.9 s | >= 60 s | 5 (room soaked/spout; roof soaked/leak; pull soaked/runoff; bucket soaked/bucket; two soaked/spout) | **short by 1.1 s** after the replay tuning (the faster cloud fills the tanks sooner: 68.6 s before it). Five two-play acts, the HWIK tell drawn from the first frame (the cloud's shadow on the ground, the tank's gauge, the gutter); the cloud forms over whoever enters the beat |
| 09 Eight-Day Market (tough) | 28.8 s | >= 60 s | 6 (room nala/closed; sngi closed/nala; kot closed/closed at a different arch count; pdeng shift/closed; doh pack/closed; holiday nala/closed) | **short by 31 s.** Six rows of stalls, each 3-5 s of hops: the market's reads are quick by nature. Added this round the holiday (every stall a frame, the drain dry: walk the bed) and the double arch (two days at once). A 60 s market needs about seven more rows, and new days would repeat the plate read (padding). Honest number: 29 s |
| 10 Down Seven Hundred (finale) | 28.1 s | >= 90 s | 6 (room truedrop/lyoh + lintel/drip; rong liar/wah; jingkieng gorge/jri; wet wet/shut; pung sway/shift) | **short by 62 s.** Six law-7 breaks are built (01, 04, 05, 06, 07 and 03+09 together); the breaks I could not pass the gate are listed below (02 "the end holds" has no deadly NAIVE: the 02-trained player waits for a lit middle that never comes, a timeout, not a troll; 03 "a span that must be run" = KVT-08 / S9 "don't stop on the sinking floor"; 08's break reduced to 08's own roof rule). Each break is 5-8 s, so six breaks plus walking is 28 s. Honest number |

Other bars:
- **Module guard** `tests/modules.test.ts`: **green for SHL** (ten stages, a NAIVE for every stage, FIX for 10, one hidden item each, a route for every act, a policy for every ending, fair list, 9 intros, no TODO, `shl-` prefix). Full `npm test` on the merged tip: **1926 passed, 0 failed** (18 files; 14 env-gated files skipped).
- **Replay <= 7.5 s per tick at lag 0/6/12 from the lag-captured checkpoint:** every play of every stage, worst 7.18 s (SHL-08 `shl08-two` "walk to the gate and wait"). The round-1 offenders: SHL-02 `shl02-sngi` m0 11.3 s -> 4.22 s and SHL-07 `shl07-krem` m0 8.2 s -> 6.30 s, both by starting the bank's or the gallery's clock when Dad passes the act's checkpoint column (the waits themselves are unchanged: the sngi bank still needs its end under the third beam, the gallery still shuts and breaks on the same drip count). SHL-08's 10.9 s (first sweep of the round) -> 7.18 s by a faster cloud (100 px/s, harsher), the room's fill 2.2 s, and SHL-07's 7.80 s (the plop act) -> 6.00 s by a first stalactite that starts nearer its shut and a quicker second (11 px a drip): both make the traps come sooner, neither widens a window.
- **Stretch <= 25 s:** longest 21.4 s (SHL-02 room + sngi). **4.5-tile rule:** no capture point has a hazard within 4.5 tiles that the idle, run or tap-jump plays reach: 0 deaths in 7,280 plays at 65 distinct capture points (table below).
- **No identical window past one labelled momentum beat per stage:** the probe-2 table below; the three round-1 repeat windows (02 sngi, 04 iew, 05 ar) are unchanged and still counted as repeats of their rooms' reads (A3 of the ladder in the first act).
- **Pars:** every long stage's par reset to 1.35 x its route clear time (02 46, 03 34, 04 17, 05 42, 06 48, 07 68, 08 93, 09 39, 10 38); `par.test.ts` (LDD_PAR) passes.
- **Sky band:** the 06 guide poles shortened (FL-96, were FL-110); 07's stalactites now hang from the cave roof (y 70), not from the sky; 05's cliff faces still run to the top of the frame (they are the cliff, drawn to the frame edge on purpose).
- **Note for other builders:** `tests/endrec.test.ts` takes no id filter, so recording the SHL routes for the sheets rewrote every stage's `/tmp/rec/<id>.json` (now from the merged tip 23491d0: develop v0.17.3 + SHL). Re-record before shooting another city.
- **Heavy runs:** the full suite, the LDD_N=80 fair and the qa6 sweep each ran at the end; one of my blocks launched the fair and the sweep together with a full-suite run (my mistake against the one-at-a-time rule; none died, and the full suite and flows were re-run alone on the merged tip).

## Pre-build gate: every new act and door, checked before building

Checked against `DECISIONS.md` lists 1-2 (shipped and in-flight), §5 rulings, the v3/v3.1 families in `ALLOCATION.md` and `ALLOCATION-V3.1.md`, the other open branches' rows and SHL's own rows (BUILD.md round 1). The round-1 gate rows for 01-07 stand.

| Part | Decision (one sentence) | Closest row(s) | Why different |
| --- | --- | --- | --- |
| 08 room | The cloud follows whoever is under its reach; the tank fills only while the rain falls into its gutter: stand out of reach so the cloud goes home and fills it. | GTK-07 `thau` (wait under the awning for the cloud to lift; S12), RNC-04 (lightning hits the tallest under the cloud), TVM-01 tarp (let it empty) | the cloud is not weather to wait out, it is a meter to steer: where you stand decides where it rains, and the goal is to make it rain somewhere else |
| `shl08-roof` | No out-of-reach spot: under the tank's roof the rain on you drains into the tank, except under the hole. | F486 drip-line-shelter (a drip line proves a roof), `thau` | the roof is the tool that aims the rain, not a shelter from a passing hazard; the hole is the within-act betrayal |
| `shl08-pull` | The cloud rests over the path and fills nothing: go in and stand under the roof so it follows you on to it; the roof's lower edge sheds while rain is on it. | 08 room (inverted: here you must be IN reach), `svp08-chhajja` (rain runs off a slope's low side) | the player pulls the hazard to the tank on purpose; the run-off is the known chhajja fact used as the second trap inside this family (same decision would be a repeat of chhajja only if the act were about the roof's slope; here it is about dragging the cloud) |
| `shl08-bucket` | The gauge is a bucket over the only out-of-reach spot: fill it from under the roof, or it falls on you. | 08 room, TVM-04 (a coconut falls on whoever stops under a palm) | the drop is the meter you are filling, and the right stance (under the roof) is one you learnt in the act before; TVM's drop is a timer, this one is your own gauge |
| `shl08-two` | Two tanks, one gate: fill the first from under its roof and let its spout finish before the second roof. | 08 room spout, PAT-06 (count both trucks) | a sequence of two meters whose first output is the hazard on the way to the second |
| door `shl-tap` | The door is the tank's tap: stand back out of reach until it is full. | the 08 room rule at the door | the door's own idea inside the family (no shipped door is a meter) |
| 09 room | Every stall's plate is the day it is closed and a closed stall is a cloth over a frame; the day is the count of arches you have passed (the board shows it). | PAT-06 (plates numbered by a multiple of the sacks are tarps: count the sacks), BOM-07 holi (mats of the thrown colour hold), PNJ-06 (stand on the colour that comes up), DIS-02 (the level post forecasts the next floor, KEPT by ruling) | the count is your own progress, not a visible load or a signal: it advances as you go and can advance mid-row; a stall is read against a day you must carry in your head |
| `shl09-sngi` | Another arch is another day: yesterday's closed stall is open and another is closed. | 09 room | the room's read repeated once with the day advanced (the ladder's A2: yesterday's answer dies) |
| `shl09-kot` | The boards are blank: the arches are still the days, count them. | F447 false-cue-among-true (count the sirens, the horn is not one), 09 room | nothing lies here; the signal is simply gone and the count must be kept |
| `shl09-pdeng` | The arch stands in the middle of the row: the day turns while you are on the counters, so read the plates beyond it with tomorrow in mind. | DIS-02 (read the next mark before the siren) | the turn happens under your feet by your own progress, not on a siren |
| `shl09-doh` | A stall whose keeper has taken the boards off is closed whatever its plate says. | SVP-03 (an honest board tracks the crocodile, not a marker), `gtk10-ghar` (the sign says one floor down whatever the last house taught) | the physical state outranks the rule you were taught, and the keeper is seen doing it (honest tell) |
| `shl09-sngi-khlieh` | On the eighth day every stall is a frame and the sluice is shut: the drain bed is dry, walk it; a double arch is two days at once, count gates. | KVT-08 sandbar (walk the sand), 05's dry lure | the drain is the way only on the day the cycle says so; the double arch is the count's own twist |
| door `shl-board` | The keeper flipped the board to yesterday: trust the gates you counted, not the paint. | LKO-09 `hawa` (the flag you see is the opposite), SVP-03 | not an inverted signal but a stale one: the answer is the count you already have |
| 10 room (01 break) | The lone drop by the pine tells the truth here: rain comes down just past it a third of a second later, so stop at the drop and go when it ends; stand there longer and the cloud that formed drifts to you. | SHL-01 (the first drop is a lie), F447 (a false cue among true: the inverse) | law 7: the cue the city taught you to ignore is true once |
| 10 room (04 break) | This rain is a drizzle and the lane is low arches: leave the knup on its first hook; take the knup at the second hook for the awning's drips. | SHL-04 (knup on for the rain) | the taught habit (take the knup at the hook) is the trap; the second trap (bare under the drips) is 04's drip rule, so the answer is which hook, not whether |
| `shl10-rong` (05 break) | A sister's mark was painted too high: when her sheet starts at the mark it is still full. Read the sheet's width, not the paint. | SHL-05 (cross on the mark), SVP-03 (honest board, not the marker) | the city's own tell lies once; the pot of paint at her foot is the honest tell |
| `shl10-jingkieng` (06 break) | The hanging guide grows a root at head height; the pole leaning from the far bank grows the floor: guide from the far side. | SHL-06 (jump at the hanging guide), `shl06-kiang` (a touched guide grows a root across the path) | the taught move grows the wrong root; the right guide is the one you were never shown |
| `shl10-wet` (07 break) | A glistening stalactite is wet through: a bump sheds three drips at once instead of freezing it; pass it on its own count, hands off. | SHL-07 `knock` (bump to freeze) | the taught tap is the trap; the glisten is the tell |
| `shl10-pung` (03 + 09, the allocation's twist) | The rest stalls stand on a Dawki span: bursts for the deck, the plates for the day, and the arch in the middle turns the day under you. | SHL-03 room, SHL-09 `pdeng` | the two rules at once on a lighter deck (it swings up in half the time) |
| door `shl-tallgate` | The gate is tall today and drips run off its roof: take the knup from the hook and walk in wearing it. | SHL-04 door (hang the knup outside the half-door) | the door rule inverted |
| `shl07-pool` (shelter beat) | The whole roof comes down together; a drip into water builds no stump, so the stalactite over the pool never meets the floor: stand in the pool through the shut. | `gtk07-thau` / F486 (shelter under a roof), B36 shelter trap | the shelter is a place with no floor to grow a stump on, a cave fact, not a roof; and it is the one spot UNDER a hazard that is safe |
| `shl07-plop` (sound beat) | Behind the pillars the tips are hidden: a high click is a drip with a long way to fall, a deep plop is one nearly down; pass on clicks, never on plops, never on another's snap. | F485 walk-to-sound (follow the bell), F447 count the sirens, F488 count flash to thunder | the read is the pitch of one sound, not its count or direction |
| `shl07-knock` (the tap) | Two stalactites a step apart on different clocks: bump the first to freeze it and wait under it for the second's break. | SHL-07 room (the freeze exists) | the first act that requires the tap, and the frozen one is the shelter |
| `shl07-pairs` | Stumps grow too: a bump freezes only the top, the stump keeps rising, so a frozen pair still shuts, half as fast: bump, then go at once. | `shl07-knock` (bump and wait) | the allocation's A3: the tap you just learnt to trust is only half a freeze |
| `shl05-roar` | A hidden sister is read by her roar: loud is full, quiet is the mark, silence is the dry lure; the quick sister's mark lasts half a second: stand at the very edge. | `shl07-plop` (sound read; the plop act was gated first, this one reuses the "phase by sound" thought inside 05's own family) | the lure is in the sound (silence) and the second read is a momentum beat (labelled) |
| `shl06-double` | A gorge too wide for one root: grow the near one, walk to its tip, jump at the far guide there; out of order the near root grows at head height. | `ccu10-pherot` (ride the stack as it grows), RPR-07 (go when whole) | two chosen roots in an order; the structure you built is where the next choice is made |
| `shl03-wake` second play (replaces the same-tick pair) | Running span three in a hurry the moment the wake has passed (bursts forgotten) dies to the deck's own swing. | 03 room | a different trap (the deck) at a different tick from the wake |

**Struck in this round (not built):** 02's finale break "a bank whose end holds" (no deadly NAIVE); 03's "a span that must be run" (= KVT-08 / S9); 04's "shake the knup" (= S7 jump-in-place, or JAI-03 settle); 06's top deck (= SVP-09 dead root or RPR-07); 06's "root grows the way the guide leans" (= `svp08-chhajja`); 07's "the breaking column throws its tip at the waiter" (= TVM-04); 08's finale break (= 08's own roof rule); 09's "walk back through an arch" (no honest tell for a day that does not turn back).

## Acts: one row each (new or changed this round; round-1 rows for 01-06 stand in BUILD.md unless listed)

Seconds are the act's share of the route (route structure and scripted waits), not a separate measurement. Causes and ticks are from the debug runs at the tip (`plays-r2.txt`).

| Stage | Part | Family | Decision | Registry check | NAIVE / first play cause@tick | second play cause@tick | s (est.) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 03 | `shl03-wake` | bridge-swing-matches-step-cadence | let the boat pass from the tower | see gate | FIX `shl-wake`@1077 (bursts all the way, on the span) | m0 `shl-sway`@1269 (ran span three after the wake) | ~9 |
| 05 | `shl05-roar` | one-stream-schedule-mark | the roar is the read; the quick sister from the edge | see gate | m2 `shl-wah`@2989 (crossed on the silence) | m3 `shl-um`@3365 (quick sister from a stop back) | ~9 |
| 06 | `shl06-double` | choose-guide-root-grows | near first, then far from the tip | see gate | m3 `shl-gorge`@2570 (walked off the half root) | m4 `shl-jri`@2613 (far first, then near: head-height root) | ~12 |
| 07 | `shl07-pool` | drip-growth-gate-pairs | stand in the pool through the shut | shelter beat, see gate | m1 `shl-maw`@1762 (ran the storm) | m2 `shl-shut`@1799 (waited for the shut, ran into the wall) | ~9 |
| 07 | `shl07-krem` | same | wait for the break, then run them all | momentum beat (round 1) | m0 `shl-maw`@1455 (stopped under the fourth to count) | (the stage FIX `shl-maw`@276 is the room's) | ~8 |
| 07 | `shl07-plop` | same | clicks yes, plops no | sound beat, see gate | m3 `shl-shut`@3070 (ran past the pillars) | m4 `shl-maw`@3573 (stood under the second as it plopped) | ~8 |
| 07 | `shl07-knock` | same | bump the first, wait under it for the second's break | the tap, see gate | m5 `shl-shut`@4051 (ran the pair) | m6 `shl-maw`@4662 (bumped the first, waited under the second) | ~6 |
| 07 | `shl07-pairs` | same | bump, then through at once | A3, see gate | m7 `shl-shut`@4993 (ran the pairs) | m8 `shl-stump`@5021 (bumped and waited) | ~6 |
| 08 | room | tank-fills-when-not-under-rain | stand out of reach; let the spout finish | see gate | NAIVE `shl-soaked`@501 | FIX `shl-spout`@728 (went the moment the gate lifted) | ~8 |
| 08 | `shl08-roof` | same | under the roof, not under its hole | see gate | m0 `shl-soaked`@1777 (waited at the gate) | m1 `shl-leak`@1581 (under the hole) | ~9 |
| 08 | `shl08-pull` | same | drag the cloud on to the roof; not at its edge | see gate | m2 `shl-soaked`@2424 (stood out of reach: nothing filled) | m3 `shl-runoff`@2536 (stood at the roof's edge) | ~10 |
| 08 | `shl08-bucket` | same | fill from under the roof, not under the bucket | see gate | m4 `shl-soaked`@3978 (waited at the gate) | m5 `shl-bucket`@4027 (stood under the bucket) | ~10 |
| 08 | `shl08-two` | same | first tank, let its spout finish, second tank | see gate | m6 `shl-soaked`@5309 (waited at the gate) | m7 `shl-spout`@5027 (ran for the second roof as the first filled) | ~16 |
| 08 | door `shl-tap` | - | out of reach until full, then the tap | see gate | - | - | ~6 |
| 09 | room | day-cycle-rearranged-stalls | arches are days; jump the plate of today | see gate | NAIVE `shl-nala`@76 (walked off the bank into the drain) | FIX `shl-closed`@142 (hopped on, walked the counter) | ~4 |
| 09 | `shl09-sngi` | same | another day | see gate | m0 `shl-closed`@582 (jumped yesterday's plate) | m1 `shl-nala`@871 (walked off the counter's end) | ~4 |
| 09 | `shl09-kot` | same | count the arches | see gate | m2 `shl-closed`@978 (kept day two) | m3 `shl-closed`@1266 (counted one blank arch, not two: a different stall, a different row) | ~8 |
| 09 | `shl09-pdeng` | same | the arch mid-row: tomorrow beyond it | see gate | m4 `shl-shift`@1733 (kept the start board's day) | m5 `shl-closed`@1569 (read the whole row for day six) | ~6 |
| 09 | `shl09-doh` | same | boards off means closed | see gate | m6 `shl-pack`@2172 (walked on to the packed stall) | m7 `shl-closed`@2090 (hopped the counter, never mind the plates) | ~5 |
| 09 | `shl09-sngi-khlieh` | same | the holiday's dry bed; two gates are two days | see gate | m8 `shl-nala`@2878 (walked the next drain bed too) | m9 `shl-closed`@2943 (counted the double arch as one day) | ~9 |
| 09 | door `shl-board` | - | trust the gates, not the flipped board | see gate | (the board-truster dies `shl-board` at plate 3; scripted as the stage's own route check, not a separate play) | - | ~4 |
| 10 | room | finale-cadence-bridge-day-stalls | the drop tells the truth; leave the first hook, take the second | see gate | NAIVE `shl-truedrop`@106; m0 `shl-lintel`@356 (took the knup at the first hook) | FIX `shl-lyoh`@271 (stood at the drop waiting for a beat); m1 `shl-drip`@439 (bare all the way) | ~9 |
| 10 | `shl10-rong` | same | read the sheet, not the paint | see gate | m2 `shl-liar`@825 (crossed on her mark) | m3 `shl-wah`@1080 (waited for her dry) | ~8 |
| 10 | `shl10-jingkieng` | same | the pole from the far bank, not the hanging guide | see gate | m4 `shl-gorge`@1303 (hanging guide, waited, walked: the root is at head height, the floor is not there) | m5 `shl-jri`@1324 (jumped the gorge from under the guide as it grew) | ~8 |
| 10 | `shl10-wet` | same | hands off the glistening one | see gate | m6 `shl-wet`@2192 (bumped it) | m7 `shl-shut`@2839 (waited for its break, walked into the quick one) | ~7 |
| 10 | `shl10-pung` | same | bursts, plates, the mid arch | see gate | m8 `shl-sway`@2667 (ran the span, plates read right) | m9 `shl-shift`@2873 (bursts, but the first arch's day kept past the middle) | ~10 |
| 10 | door `shl-tallgate` | - | take the knup for the gate's drips | see gate | - | - | ~3 |

## Probe 1: same-tick FIX scan

Every stage's NAIVE and FIX, and every pair of plays inside an act, die to a different cause on a different tick (`plays-r2.txt`). The closest ticks: SHL-02 NAIVE edge@146 / FIX dum@161 (different traps: the thin end vs the unlit middle); SHL-07 NAIVE shut@283 / FIX maw@276 (walked into the shut third vs stood under the second as it came down); SHL-06 double gorge@2570 / jri@2613; SHL-07 pairs shut@4993 / stump@5021. Round 1's two non-pairs are gone (03 m0 recast to `shl-sway`; 04's duplicate removed). One-play parts: the doors of 08, 09 and 10 (their scripted route is the only play; their lie or break is checked by the stage's own FIX/mistake where it applies), 01's tour (NAIVE + FIX only).

## Probe 2: identical-window scan

Acts grouped by (what the first play dies of, what the second play dies of, the decision asked). A group of more than one act is a repeat unless it is the stage's one labelled momentum beat.

| Stage | Groups | Repeats beyond one labelled beat |
| --- | --- | --- |
| 02 | room {edge, dum: lit middle}; sngi {edge: lit end}; lyoh {dum: sun} | 1 (sngi sharpens the room's read, as in round 1) |
| 03 | room {sway: bursts}; wake {wake, sway: off the span}; wet {slip: stop early} | 0 |
| 04 | room {slap, dieng: on/off}; iew {slap: lure hook}; khynnah {slap, lintel: size} | 1 (iew, as in round 1) |
| 05 | room {um, wah: the mark}; ar {um: thinning is not the mark}; pung {pung: both marks}; roar {wah, um: by sound; from the edge (labelled momentum beat)} | 1 (ar, as in round 1); roar's quick sister is the stage's labelled beat |
| 06 | room {gorge, spray: which root}; sprout {gorge: stand on the tip}; double {gorge, jri: order}; kiang {jri: hop the guide} | 0 |
| 07 | room {shut, maw: count the drips}; krem {maw: go at the break, keep going (labelled momentum beat)}; pool {maw, shut: the pool}; plop {shut, maw: sound}; knock {shut, maw: the tap}; pairs {shut, stump: half a freeze} | 0 |
| 08 | room {soaked, spout: out of reach}; roof {soaked, leak}; pull {soaked, runoff}; bucket {soaked, bucket}; two {soaked, spout: sequence} | 0: every act's first play is "wait at the gate" (soaked), but the decision of each act is different (out of reach / roof / drag the cloud / not under the bucket / sequence) and the second traps differ |
| 09 | room {nala, closed: today's plate}; sngi {closed, nala: yesterday}; kot {closed, closed: count}; pdeng {shift, closed: mid-row}; doh {pack, closed: boards off}; holiday {nala, closed: dry bed and two gates} | 1 window to flag: `kot`'s two plays both die `shl-closed` (at different arches and rows: counting wrong by one vs by two); the stall read is the room's with the board removed |
| 10 | room {truedrop, lyoh; lintel, drip}; rong {liar, wah}; jingkieng {gorge, jri}; wet {wet, shut}; pung {sway, shift} | 0 (each is a break of a different stage's rule) |

## Lag-captured sweep (the tester's qa6 copied to `tests/qa/qa6.test.ts`, run on all ten at the end)

For every stage: the route at lag 0, 6, 11 and 12 and spawn idle 0, 37, 120 and 251 ticks; the checkpoint is taken wherever that lagged run takes it; the world is rebuilt by `replay()` at that tick; then idle 4 s, run 0.3 s after 0/6/12 ticks, tap-jump after 0/6/12 ticks (7 plays). Replay per tick from the last checkpoint to the death of every NAIVE, FIX and MISTAKE at lag 0/6/12. Raw: `qa6-r2.txt`.

| Stage | Distinct capture points | Plays checked | Deaths | Longest stretch | Worst replay (lag 0 / 6 / 12) |
| --- | --- | --- | --- | --- | --- |
| SHL-01 | 5 | 560 | 0 | 6.4 s | 4.01 / 4.01 / 4.01 s (fix) |
| SHL-02 | 3 | 336 | 0 | 21.4 s | 3.92 / 4.09 / 4.22 s (m0; was 11.3) |
| SHL-03 | 6 | 672 | 0 | 6.9 s | 2.00 / 2.05 / 2.10 s |
| SHL-04 | 5 | 560 | 0 | 5.8 s | 2.28 / 2.28 / 2.28 s |
| SHL-05 | 7 | 784 | 0 | 6.2 s | 5.30 / 5.30 / 5.30 s (fix) |
| SHL-06 | 7 | 784 | 0 | 12.4 s | 6.26 / 6.53 / 6.75 s (m4) |
| SHL-07 | 11 | 1232 | 0 | 11.8 s | 6.50 / 6.50 / 6.50 s (m6; m0 was 8.2, now 6.30) |
| SHL-08 | 5 | 560 | 0 | 16.0 s | 7.18 / 7.18 / 7.18 s (m6) |
| SHL-09 | 8 | 896 | 0 | 5.8 s | 2.63 / 2.63 / 2.63 s |
| SHL-10 | 8 | 896 | 0 | 8.1 s | 6.76 / 6.81 / 6.86 s (m7) |

**0 deaths in 7,280 plays at 65 capture points; every stretch <= 21.4 s; every replay <= 7.18 s at lag 0, 6 and 12.**

### Per-tick replay (lag 0 / 6 / 12), from the last lag-captured checkpoint to each death

| Stage | naive | fix | m0 | m1 | m2 | m3 | m4 | m5 | m6 | m7 | m8 | m9 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | 1.02/1.02/1.02 | 4.01/4.01/4.01 | | | | | | | | | | |
| 02 | 1.22/1.27/1.32 | 1.34/1.95/2.00 | 3.92/4.09/4.22 | 1.70/1.75/1.79 | | | | | | | | |
| 03 | 2.00/2.05/2.10 | 1.40/1.33/0.98 | 0.86/0.90/0.90 | 0.67/0.89/0.89 | | | | | | | | |
| 04 | 0.77/0.82/0.87 | 1.84/1.89/1.94 | 1.53/1.53/1.53 | 2.28/2.28/2.28 | 0.84/0.84/0.84 | | | | | | | |
| 05 | 1.46/1.51/1.56 | 5.30/5.30/5.30 | 2.74/2.74/2.74 | 4.08/4.08/4.08 | 3.84/3.79/3.74 | 0.97/0.97/0.97 | | | | | | |
| 06 | 1.77/1.98/2.18 | 5.86/6.08/6.66 | 0.99/1.04/1.09 | 4.06/4.32/4.88 | 1.48/1.48/1.48 | 5.90/6.02/6.43 | 6.26/6.53/6.75 | | | | | |
| 07 | 2.36/2.41/2.46 | 2.30/2.30/2.30 | 6.30/6.30/6.30 | 2.70/2.70/2.70 | 3.01/3.06/3.11 | 1.81/1.82/1.81 | 6.00/6.00/6.00 | 1.41/1.42/1.41 | 6.50/6.50/6.50 | 2.27/2.27/2.27 | 2.50/2.50/2.50 | |
| 08 | 4.17/4.22/4.28 | 6.07/6.17/6.27 | 4.78/4.78/4.78 | 3.15/3.15/3.15 | 1.57/1.57/1.57 | 2.50/2.50/2.50 | 5.27/5.27/5.27 | 5.67/5.67/5.67 | 7.18/7.18/7.18 | 4.83/4.88/4.93 | | |
| 09 | 0.63/0.68/0.73 | 1.18/1.23/1.28 | 1.27/1.27/1.27 | 0.71/0.71/0.71 | 1.60/1.54/1.59 | 1.57/1.46/1.46 | 2.63/2.63/2.63 | 1.27/1.27/1.27 | 1.95/1.95/1.95 | 1.27/1.27/1.27 | 0.89/0.89/0.89 | 1.43/1.43/1.52 |
| 10 | 0.88/0.93/0.98 | 2.26/2.31/2.36 | 2.97/3.07/3.17 | 3.66/3.76/3.86 | 2.52/2.47/2.42 | 4.64/4.54/4.44 | 1.38/1.43/4.06 | 1.55/1.74/1.79 | 1.37/1.42/1.47 | 6.76/6.81/6.86 | 0.50/0.50/0.50 | 2.22/2.37/2.51 |

## Proof

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` (merged tip) | clean |
| `npm test` full (merged tip 23491d0, run alone) | **18 files passed, 1926 tests passed, 0 failed**, 21 skipped (14 env-gated files skipped). The module guard passes for SHL |
| SHL's own share (`levels`, `checkpoints`, `cpsafe`, `items`, `allocation`, `jumpaudit`, `modules`, `par` with `-t SHL`) | **154 passed, 0 failed** |
| `cpsafe -t SHL` strict (idle 4 s, run 0.3 s, tap-jump at lag 0/6/12, every checkpoint of all ten stages) | 10 passed (SHL on no allow-list, not in `CPSAFE3_PENDING`) |
| `LDD_N=80 npm run fair -- SHL` (once, at the end; `fair80-r2.txt`) | 6t: 100% on all ten. 12t: 100% on nine, **SHL-05 99%** (one `shl-wah` at the basin stretch, 99%). 18t: 01 100, 02 88, 03 100, 04 100, 05 81, 06 84, 07 93, 08 100, 09 100, 10 100. Every stretch >= 99% at 0-12t |
| qa6 lag-captured sweep (all ten, once) | 0 deaths in 7,280 plays; stretches <= 21.4 s; replays <= 7.18 s (table above) |
| `npm run build:single && node scripts/flows.mjs` (merged tip) | builds; flows **no errors** |
| Sheets (`shots/SHL-01..10-sheet.png`, seven frames along each route; 05-10 re-shot this round) | read: every route reaches the exit; the tanks, gutters, gauges, roofs, bucket and gate of 08; the arches, boards, plates, counters, dry bed and keeper of 09; the pine and drop, hooks, liar's mark and pot, pole, cave and span of stalls of 10 all draw; no broken prop. Cosmetic: 05's and 10's cliff faces run to the top of the frame |
| Language | every spoken line is round 1's set (all V, the one U line replaced by its fallback); new this round: `npc.welcome` ("Ym lei lei, Bah.", V) at the finale's gate. The cause lines for the 22 new causes are in `causes.ts` |

## Pars re-run

Set from the route's clear time x 1.35: 02 46 (was 40), 03 34 (45), 04 17 (40), 05 42 (60), 06 48 (60), 07 68 (60), 08 93 (set before the faster cloud; the route is now 58.9 s, so 80 would be exact: left at 93, a little generous), 09 39, 10 38. 01 keeps the tour default.

## Commits (city/shl)

5319545 SHL-08 · f837cdf SHL-09 · 931b44c SHL-10 · 4b4cead 02/07 replays (trigger-started clocks) · 36bc81a SHL-07 four acts · d817e9f 05/06 acts, 03/04 pairs, pars, poles · b26c7e6 09 holiday and double arch · 07d6cd1 10 wet stalactite · 25247b5 07/08 replay tuning · def98f0 docs · 23491d0 merge of origin/develop (v0.17.3).

## For the tester and the next round

- The seven stages under their floors (04 12.4, 05 31.1, 06 35.3, 07 50.2, 08 58.9, 09 28.8, 10 28.1 s) are honest numbers: the acts each ask one decision and nothing was padded. What a next round would need is in the Honest table (new decisions, not more rows of the same read), and the struck candidates are listed so nobody re-gates them.
- `tests/qa/qa6.test.ts` is the tester's probe copied verbatim with `QA6_IDS` set to SHL; it is not committed.
- Not checked: a real phone (touch); only the headless build, the route bots and the lagged player model.

TIP: 563b7e7e5550c647b3b511c49d72e8f399281369
