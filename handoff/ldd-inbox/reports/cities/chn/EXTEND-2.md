# CHN Chennai round 2: the human-timing pass, the door, the causes

Branch `city/chn` in `/local/home/saiposh/personal/ldd-wt/chn`, from round 1's 45b898b (develop 412039f merged there; develop has not moved since: 412039f at 09:56 UTC). Tip **8c554fb**, 13 commits in this round: 62558ed door + causes, 137cfa3 CHN-07, 63eeea2 CHN-02, 38a013b CHN-06, 5abefde CHN-04, a8465d2 CHN-08, ba37c27 CHN-05, 6bce18c CHN-03, a7730a2 billing act + varisai label, d68ff07 docs, c06f656 refreeze, 8e1f394 act pit edges, 8c554fb token line. Not pushed, no version bump, no shared file committed (`tests/acts.ts` and `tests/modules.test.ts` were patched locally for the proofs and `git checkout`ed; `git status` clean). Files touched: `src/game/cities/chn/{levels,spencer,murukku,endings,causes,sundal}.ts`, `tests/cities/chn.ts`, `tests/cities/_frozen/chn.json`, `docs/cities/CHN.md` (new), `docs/CITIES.md` (the CHN rows). Clock: 08:25-09:58 UTC.

## 0. What does not meet the bar

1. **Length (item 2) is mostly not done.** CHN-09 stays at **31.6 s** against 60 (five two-play acts, no new one). CHN-10 gained one callback (`chn10-billing`, the pot queue broken) and is **30.6 s** against 90. The brief asked for callbacks to 02, 03, 04, 06, 07, 08 and the sundal lid and two or three kitchen reads; I gated and built one. The others were not gated: the hours went to the rooms (item 3, seven rooms re-timed and verified one by one, each needing two to six probe rounds) and I stopped building acts when the proofs had to start. That is a time reason, which the brief refuses, so it is written here as the shortfall it is, not as a rule finding. Section 2 has the one gate row that was run and the six sentences I had drafted and did not gate.
2. **CHN-03 is at the bar but on the line:** 100 / 91 at 6t / 12t, stretch s1 96%, door 95% (N=80). In the sweep its route still dies in 3 of 16 lag/idle runs at lag 11-12 (two in the frogger act at x 50, one at the bull door); captures are 0 deaths. The floaters are 16-48 px wide and drift at the player; the bull's leap window is 0.26 s. A tester who plays late will die there sometimes. One more widening was tried after the proofs (floats +4 px, gap 24) and measured 100 / 89 with s1 94, so it was reverted; the tip is the measured 100 / 91 state.
3. **CHN-10's door is PLAIN.** Both recasts failed the gate (section 2): "the door opens for whoever walks the shine" re-asks `chn10-kaanal`'s own read, "the mop bucket gates the door on a cadence" is the wait-for-the-cycle class (BLR-08). The WET FLOOR board and the mat stay as dressing, the floor is dry, nothing kills, the key `chn-wet-floor-sign` is kept.
4. **The billing act's trolleys are `crate` sprites** (the shared thing kind), red-tinted for the locked one with a painted lever; a trolley sprite would be a shared-file need. And its honest guide line ("Lock pottadhu paaru.") is queued behind earlier guide lines and shows at the door on the sheet, after the act: the guide queue is shared behaviour; noted for QA, not fixed.
5. **CHN-02's FIX does not die at lag 12** in the replay table (`fix: 1.40/1.44/nodeath`): the obvious fix (jump 8 ticks straight on to pot three) now clears pot three when its press lands 12 ticks late on to the big second pot. It dies at lag 0 and 6, which is what the guard checks; written here because the tester reads that table.
6. The murukku kitchen's sources and the TVM-shaped gate concern on CHN-09's room (round 1, 0.6 and H.2) stand as written there.

## 1. Findings, before -> after -> commit

| # | finding (round 1) | after | commit |
| --- | --- | --- | --- |
| 0.2 | CHN-10 door = TVM-10's `tvm-oily-feet-coir-mat` | plain door, key kept; two recasts gated and failed | 62558ed |
| 0.8 / item 6 | tour NAIVE and FIX both `chn-sundal` | the lift after the short shut is `chn-sooda` (SundalCart sets `hazard.cause` at each lift); NAIVE `chn-sundal` @1012 x75.6, FIX `chn-sooda` @1075 x77.3 | 62558ed |
| item 7 | `chn-fountain` for three different falls; `chn-sundal` line stale ("cart tips its pan") | `chn-kinaru` (kaanal wells), `chn-plaster` (pattarai), `chn-rolled` / `chn-tipped` (billing), `chn-sooda`; every line names the kill, none repeats the advice that killed (`causes.ts`) | 62558ed, a7730a2 |
| 0.3 / item 3 | rooms 02-08 at 64/28, ?, 79/35, 71/66, 78/30, 1/0, 93/41 | all ten >= 90 at 6t and 12t, every stretch >= 95 (section 3) | 137cfa3, 63eeea2, 38a013b, 5abefde, a8465d2, ba37c27, 6bce18c |
| 0.4 / item 4 | CHN-03 fairness unmeasurable (shared throw) | measured with the local one-line patch: 100 / 91 / 83, s0 100 s1 96 door 95; patch not committed | 6bce18c |
| 0.5 / item 5 | CHN-05 cp0 captured in the air at x38.7 (6 sweep deaths) | act checkpoint on the road at x+7.5 (39.5), the second hole a tile on; sweep 0 deaths at 224 plays | 6bce18c |
| round 1 H.4 | 09 room / varisai both wait on a colour | varisai labelled CHN-09's one momentum beat (act comment); window unchanged | a7730a2 |
| item 8 | no docs | `docs/cities/CHN.md`, CHN rows in `docs/CITIES.md` for ten stages | d68ff07 |
| walk-4.5 | 09's five acts and 10's pattarai had their oil/basin 3.5 tiles from the act checkpoint | every act's pit starts at its column 5 (4.5 tiles) | 8e1f394 |
| CHN-02 door line | "Token 7! Thala for a reason!" (seen on the sheet) | "Token 7! Ulla vaanga! \| Token 7! Come in!" | 8c554fb |
| allocation.json | tourNew `tour-chn-b16` | **left as is** (the allocator's file); the correction is `tour-chn-b5` ["B5"], "the sundal vendor's lid beat lies once; the hand is the tell"; the integrator carries it | — |

## 2. The gate: every act and door tried

Rule applied: one sentence of what the player must decide; checked against DECISIONS.md lists 1-2 (shipped and in-flight acts), the v3 / v3.1 families, the archetype table and the CHN rows; a hit is a change of decision, not of skin.

| part | decision sentence | closest row | verdict |
| --- | --- | --- | --- |
| CHN-10 door, recast A | "The sign lies: the door opens for whoever walks the shine, not the mat" | `chn10-kaanal` (indoors the shimmer is polish and holds): the same read, in the same stage | FAIL (own stage, re-asked) |
| CHN-10 door, recast B | "The cleaner's mop goes into the bucket on a beat; the door is open while it is in" | BLR-08 (wait for the cycle); also the tour's own B5 beat | FAIL (owned class) |
| CHN-10 door | PLAIN: the road ends at the door, walk in | — | built (62558ed) |
| `chn10-billing` | "In the billing queue the trolleys hold places like the pots; the one with the locked wheels is the only one that holds, and it is the third, the one the beach taught you to skip; the loaded one tips, the free ones roll." | CHN-02 room / `chn02-queue2` (order set by politeness; pot three starts the stampede): this breaks it, law 7. Tell = the red lock lever. Searched: "lock", "brake", "wheel" (none); "loaded" (`pat04-anaaj` rides grain, not a tip); the roll-off is a fake floor with a tell (B1 USED as kit) but the read here is which of five, by the lock | PASS, built (a7730a2). NAIVE `chn-rolled` @2257 x105.2 (hop on to the second), FIX `chn-tipped` @2183 x97.2 (stand on the loaded first) |
| drafted, not gated | 04 kaapi arcs inverted (walk through the low one, never jump: the high one falls); 03 floats inverted (pots hold, boards sink); 07 dolls (the display dolls do not bounce); 08 lifting span (the mall lift goes down); 06 malli (the push comes from ahead); the sundal lid (the beat is honest, the hand is the lie); kitchen reads for 09 (the strand that is still attached to the press; the two-colour spiral) | — | not gated, not built (0.1) |

## 3. Rooms 02-08: fairness before -> after, with the exact re-timings

N=80, `LDD_N=80 bash scripts/dev/fair.sh CHN` (CHN-03 with the local `tests/acts.ts` patch); full log `probes/fair-n80-r2.txt`. "Stage" = a change in the stage's own code (the answer widened, the trap and the decision untouched); "route" = only the way the proven route plays it (tests/cities/chn.ts).

| stage | before 6t/12t | after 6t/12t/18t, stretches | stage changes (the answer, never the trap) | route changes |
| --- | --- | --- | --- | --- |
| 02 Kudam Queue | 64 / 28 | **100 / 98** / 79; s0 98 s1 100 door 100 | pots one and two are 24 px wide at 9 and 10.5 (were 16 px at 9, 10): the hop over pot three has a 48 px run-up, so a jump 12 ticks late still leaves before it; the lorry's spray rests 1.3 s between bursts (period 2.2, was 1.7; the burst is still 0.9 s): the 0.85 s run to the lorry fits with a late start | one hop on to pot one from 6.0 (was two hops from 6.5 and 10.1), the hop over three from 10.4, the spray waited for on pot five (14.4, was 14.6) |
| 03 Subway Splash | not measurable (64 / 26 once patched) | **100 / 91** / 83; s0 100 s1 96 door 95 | the flood starts when you stand on the subway floor (y > 212; was 200, the last stair) and rises at 120 px/s (was 150): the hop to the drum has 0.33 s instead of 0.2; the floating board, crate and log are 48/40/42 px (were 40/32/34) and the gap between things 26 px (was 30); the pot is still 16 px and still sinks | hop on to the drum from the last stair (11.0, jump 12, run held) instead of dropping to the floor and hopping from 12.2; own float hopper (take-off within 64 px of the next thing, was 46; steer slack 6 px, was 3); the bull leapt at 60 px (was 26), 24-tick jump |
| 04 Degree Kaapi | 79 / 35 | **100 / 100** / 83; all 100 | the two kaapi streams cycle every 2.2 s (was 1.8), each still on 0.9 s: the low one rests 1.3 s, so the walk under the high one that starts 12 ticks late gets across; (round 1) the act's checkpoint sits in the room's tail | leave the pigeons' ledge from 16.2 (was 16.8); the act's balls hopped 0.25 s ahead (the shared dodge waits till 0.13 s) |
| 05 Agni Mirage | 71 / 66 | **100 / 100 / 100**; all 100 | no kite at a dad who has not left the spawn (the zone starts at x 5.5; the first kite used to arrive 2.8 s in on anyone still standing at the start); the act's checkpoint on the road at 39.5 (cp0 off), the second hole at 15 (was 14) | kites hopped 0.25 s ahead both ways; the turn back to the real door only after landing |
| 06 Madurai Malli | 78 / 30 | **100 / 100** / 76; all 100 | none | hop off the drain only while still on a garland (the shipped route's third hop usually flew over the third garland on to the road, then hopped again from the road into the gap); kolam take-off a tile and a half before it with a full jump (was 3 px before, 20 ticks) |
| 07 Thanjavur Bommai | **1 / 0** | **100 / 99** / 93; s0 99 s1 100 door 100 | dolls 32 px wide (were 20); a doll bounces two ticks after you land (was 0.06 s = 7 ticks, in which a dad at speed ran off its far side); the middle doll sways 12 px (was 20; still the most); the last steps 10 px aside (was 14) when you come down from the FOURTH doll (x > 22, was 19: it used to fire a flight early and had stepped back by the time you arrived) and stays aside 1.6 s (was 1.1); act: the spike pit starts at column 20 (was 19) and the second stone is 3 tiles wide at 21-23 (was 2 at 21-22) | the flight is steered at the next doll's current middle (a policy: hold right while a let-go now would land short of it, let go otherwise, never brake; a bounce is not a held jump so gravity is 1750 both ways); act route settles in the middle of the ledge before the pit, hops on to the stone from 18.9, leaves it with a full jump |
| 08 Pamban Paalam | 93 / 41 | **100 / 100 / 100**; all 100 | the train starts at -9 tiles (was -5): half a second more for the first wave to pass before it is on you | the ducking door: back off to the LEFT (the shared policy backs off by the sign of the distance, and a dad whose turn came 12 ticks late had overrun the door, walked into the end wall and waited there for a door that only rises five tiles off) |
| 01, 09, 10 | 100/100, 100/100, 100/100 | 100 / 100 / 100; 100 / 100 / 76; 99 / 100 / 94 | 09 and 10: every act's oil or basin starts at its column 5 (4.5 tiles from the act checkpoint); 10 gained `chn10-billing` | 10: boarding band for the down escalator (round 1) |

Every NAIVE still dies (section 6). Nothing was re-timed by a frame trick: the route changes are where a person would stand, take off and let go; the stage changes are sizes, pauses and start positions.

## 4. Refreeze (`tests/cities/_frozen/chn.json`), number by number

| stage | field | before -> after | why |
| --- | --- | --- | --- |
| 01 | fix cause | chn-sundal -> chn-sooda (tick 1075 unchanged) | the lift after the short shut is its own cause |
| 02 | naive tick | 135 -> 149 | the obvious hop lands on the bigger pots a little later before the stampede takes it |
| 02 | fix tick | 674 -> 737 | the spray's longer pause: the fix play waits longer before it dies to the pots |
| 02 | route tick | 1432 (unchanged) | the new hops end in the same spray wait and leave on the same burst |
| 03 | route tick | 2106 -> 2202 | the slower flood: the drum takes 0.8 s longer to float up to the balcony |
| 03 | naive tick | 158 -> 188 | the slower flood reaches the runner on the floor 0.25 s later |
| 04 | route tick | 1354 -> 1430 | the longer stream cycle: the wait for the high stream is longer on average |
| 04 | fix tick | 792 -> 870 | same cycle, the fix waits the same way |
| 05 | checkpoints | 32.5, 65.5 -> 39.5, 65.5 | the act's checkpoint on the road after the first hole |
| 05 | fix tick | 616 -> 630 | the second hole is a tile further on |
| 06 | route tick | 1312 -> 1429 | the settle on the road before the gap and the earlier kolam take-off add a second |
| 07 | route tick | 1421 -> 1384 | the steered flight bounces doll to doll without the pauses |
| 07 | fix tick | 881 -> 865 | the pit a tile later: the "wait at the edge" fix stands a tile further and the spikes get it slightly sooner |
| 10 | par | 36 -> 40 | 30.6 s x 1.35 (tests/par.test.ts rule) |
| 10 | checkpoints | 32.5, 62.5, 88.5, 118.5, 147.5 -> 32.5, 62.5, 88.5, 114.5, 144.5, 173.5 | `chn10-billing` (26 wide) inserted after kaanal |
| 10 | route tick | 3207 -> 3677 | the billing act, 3.9 s |
| 08, 09 | — | unchanged | the train's start does not change the route (it waits for the wave); 09's pit edges do not move its hops |

The second refreeze after 8e1f394 (pit edges) produced no diff.

## 5. Sweep, replay, walk-4.5

Lag-captured sweep (`probes/sweep-r2.txt`, probe `probes/qa6-chn.test.ts.txt`): route at lag 0/6/11/12 x spawn idle 0/37/120/251; at each capture idle 4 s, run 0.3 s after 0/6/12 ticks, tap-jump after 0/6/12 ticks.

| stage | capture points | plays | deaths | longest stretch | route at lag 6 / 11 / 12 |
| --- | --- | --- | --- | --- | --- |
| 01 | 5 | 560 | 0 | 6.0 s | wins everywhere |
| 02 | 2 | 224 | 0 | 7.1 s | wins everywhere |
| 03 | 2 | 210 | 0 | 9.7 s | dies in 3 of 16: lag 11 idle 251 and lag 12 idle 251 (flood @50, the floats), lag 12 idle 37 (gored @90) |
| 04 | 2 | 224 | 0 | 6.4 s | wins everywhere |
| 05 | 2 | 224 | 0 | 6.4 s | wins everywhere |
| 06 | 2 | 224 | 0 | 7.4 s | wins everywhere |
| 07 | 2 | 224 | 0 | 6.0 s | wins everywhere |
| 08 | 2 | 224 | 0 | 11.0 s | wins everywhere |
| 09 | 6 | 672 | 0 | 8.1 s | wins everywhere |
| 10 | 6 | 672 | 0 | 11.6 s | wins everywhere |

**0 deaths in 3,458 plays** (round 1: 6 deaths on CHN-05, 16 route losses on 02-08).

Per-tick replay from the last checkpoint to each death, seconds at lag 0 / 6 / 12 (bar 7.5 s):

| stage | NAIVE | FIX | mistakes (worst) | worst |
| --- | --- | --- | --- | --- |
| 01 | 0.79 / 0.86 / 0.91 | 1.32 / 1.38 / 1.43 | 1.44 | 1.44 |
| 02 | 1.24 / 1.29 / 1.34 | 1.40 / 1.44 / nodeath | | 1.44 |
| 03 | 1.57 / 1.62 / 1.67 | | | 1.67 |
| 04 | 1.47 / 1.57 / 1.67 | 3.08 / 3.09 / 1.98 | | 3.09 |
| 05 | 2.12 / 2.12 / 2.12 | 1.06 / 1.01 / 0.96 | | 2.12 |
| 06 | 1.02 / 1.07 / 1.13 | | | 1.13 |
| 07 | 0.79 / 0.84 / 0.89 | 3.50 / 3.67 / 3.65 | | 3.67 |
| 08 | 0.53 / 0.58 / 0.63 | | | 0.63 |
| 09 | 1.76 / 1.86 / 1.96 | 3.21 / 3.26 / 3.31 | thenkuzhal A1 4.47 / 4.53 / 4.58 | 4.58 |
| 10 | 1.81 / 1.86 / 1.91 | 2.02 / 2.11 / 2.20 | polished floor A1 1.81 / 1.95 / 2.40 | 2.40 |

Walk-4.5 (each checkpoint to the first thing a short run or a hop from it reaches; the sweep's 7 plays are the empirical check):

| stage | checkpoint | first hazard ahead | tiles |
| --- | --- | --- | --- |
| 01 | 17.5, 29.5, 57.5 | ditch 26 is behind 29.5; the steps are a climb | clear |
| 01 | 68.5 | the vendor's lift trigger 73, steam 76 | 4.5 / 7.5 |
| 01 | 79 | the pot's trigger 86.8 | 7.8 |
| 02 | 32.5 (act), 65.5 (door) | the second queue's first pot stand 32+?; the door's token machine | > 4.5 (sweep clean) |
| 03 | 44.5 (act), 79.5 (door) | the flood pool starts at 32+4 = 36 is behind; floats from 44+4 | ~3.5 to the pool edge (the floats cover it; sweep clean) |
| 04 | 28.5 | first bowl trigger 34 | 5.5 |
| 04 | 67.5 (door) | the catch door's ball | > 4.5 |
| 05 | 39.5 | second hole 47 | 7.5 |
| 05 | 65.5 | kites from 70 | 4.5 |
| 06 | 32.5, 69.5 | the ladi's first string from 32+6 | 5.5 |
| 07 | 32.5 | the hanging stone trigger 32+9.6 | 9.6 |
| 07 | 63.5 | the door's topple | > 4.5 |
| 08 | 32.5, 73.5 | the step at 32+1.3 is a climb; the water from 32+12 | 11.5 |
| 09 | 32.5, 62.5, 92.5, 122.5, 152.5 | each act's oil from its column 5 | 4.5 |
| 09 | 181.5 | the curtain's burner, 2.6 tiles before the door at 191 | 6.9 |
| 10 | 32.5, 62.5, 88.5, 114.5, 144.5 | basin from column 9, wells from 6, pit from 8, basin from 9, basin from 5 | 8.5, 5.5, 7.5, 8.5, 4.5 |
| 10 | 173.5 | plain door | — |

CHN-03's act checkpoint (44.5) is 3.5 tiles from the pool's edge at 48, but the first floating thing is always over that edge when you arrive (the street is already full of things): the sweep's 210 plays there had no death. Not changed.

## 6. Probe table (lag 0; the three-lag figures are the replay table above): room, every act, every door

`probes/probe-r2.txt`, `probes/probe-chn.test.ts.txt`.

| stage | play | cause @ tick, x |
| --- | --- | --- |
| 01 | NAIVE walk on past the posts | chn-sundal @1012 x75.6 |
| 01 | FIX go the moment it shuts | chn-sooda @1075 x77.3 |
| 01 | hand up then go / hop the cart / stand where the pot bubbles | chn-sooda @1075 / chn-sundal @1012 / burnt @1368 |
| 02 | NAIVE / FIX | hit @149 x12.8 / hit @737 x39.8 |
| 03 | NAIVE | flood @188 x13.4 |
| 04 | NAIVE / FIX | fell @176 x11.9 / hit @870 x55.1 |
| 05 | NAIVE / FIX | hit @254 x22.4 / fell @630 x48.6 |
| 06 | NAIVE | fell @123 x10.9 |
| 07 | NAIVE / FIX | fell @95 x8.8 / spikes @865 x53.5 |
| 08 | NAIVE | splash @64 x5.6 |
| 09 room | NAIVE / FIX | chn-ennai @211 / chn-karandi @385 |
| 09 karandi | A1 / A2 | chn-karandi @782 / chn-sottu @845 |
| 09 kannu | A1 / A2 | chn-ennai @1680 / chn-achu @1686 |
| 09 thenkuzhal | A1 / A2 | chn-karandi @2591 / chn-ennai @2340 |
| 09 varisai (momentum beat) | A1 / A2 | chn-ennai @2761 / chn-karandi @3081 |
| 09 ruchi | A1 / A2 | chn-kai @3400 / chn-karandi @3484 |
| 09 door chn-fresh-curtain | stop in front | burnt @3741 |
| 10 room | NAIVE / FIX | chn-comb @217 / chn-fountain @242 |
| 10 moodal | A1 | chn-trolley @1288 |
| 10 kaanal | A1 | chn-kinaru @1758 |
| 10 billing | A1 / A2 | chn-rolled @2257 x105.2 / chn-tipped @2183 x97.2 |
| 10 keezhe | A1 | chn-comb @2560 |
| 10 pattarai | A1 | chn-plaster @3311 |
| 10 door | plain | no death play |

Routes: 01 15.9 s, 02 11.9, 03 18.4, 04 11.9, 05 8.7, 06 11.9, 07 11.5, 08 17.2, **09 31.6, 10 30.6**.

## 7. Proofs (in the foreground, one at a time, 09:42-09:55 UTC)

- `tsc --noEmit`: clean (after every commit).
- Full suite with CHN off every list (`CHN: OLD,` removed from `tests/modules.test.ts`, `tests/acts.ts:152` patched): **18 files passed, 1814 tests passed**, 0 failed (09:43); again after the last two commits with the shared files restored: 18 passed, 1814 passed (09:53). The frozen test green on the refrozen file both times.
- `npx vitest run tests/cpsafe.test.ts tests/modules.test.ts -t CHN` with CHN removed: 21 passed (10 strict cpsafe + 11 module checks), run twice (09:42, 09:52). Files `git checkout`ed after.
- `LDD_N=80 bash scripts/dev/fair.sh CHN` (03 via the local patch): all ten >= 90 at 6t and 12t, every stretch >= 95 (section 3; `probes/fair-n80-r2.txt`).
- `npm run build:single` + `node scripts/flows.mjs`: no errors.
- The lag-captured sweep on all ten: 0 deaths in 3,458 plays (section 5).
- Replay worst 4.58 s (CHN-09 thenkuzhal A1) < 7.5 s.
- Sheets re-shot with `LDD_ENDREC=1` for 02-08, 09, 10 (`shots/`); read: 07 shows the two-tile dolls, the "Illa!" step-aside, the longer ledge and the three-tile stone; 10 shows the BILLING sign and the five trolleys (crates, the red one wide) and the plain door; 02 the big first pots and the re-worded token line. Nothing drawn wrong that I could see.

## 8. Not done, not checked

- Item 2 beyond one act (0.1). Item 1 as plain (0.3).
- The CHN-03 margins (0.2).
- The guide-queue timing on CHN-10 (0.4) and the crate trolleys.
- A native check on the new Tamil: "Chakkaram! | The wheels!", "Ayyo, load!", "Lock pottadhu paaru.", "Moonaavadhu-la nikkaadhe, Dad!", "Token 7! Ulla vaanga!".
- allocation.json left for the integrator (section 1).
