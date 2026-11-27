# KVT (Kavaratti, Lakshadweep): extend and toughen

- Worktree: `/local/home/saiposh/personal/ldd-wt/kvt`, branch `city/kvt`, head `c5676b1` (cut from develop
  `bc76d83`; develop `ea12cdf` merged in at `7640aa9`, no conflicts). Not pushed, no version bump.
- Files touched (checked against develop): `src/game/cities/kvt/` (new `encores.ts`, `tide.ts`), `tests/cities/kvt.ts`,
  `tests/cities/_frozen/kvt.json`, `docs/cities/KVT.md`, the KVT section of `docs/CITIES.md`. Nothing else.
- Commits: `41be2a7` encores, tour, lines, prefix · `d032ec4` / `8e23088` / `621032f` hardness · `6cc1400` guide
  staleness, cause line, docs · `c5676b1` KVT-09 lip art.

## A. The two encores

| id | name | family [betrayals] | ending key | attempt 1 dies to | attempt 2 (the fix) dies to | attempt 3 | route vs par | fairness quick/avg/relaxed, worst stretch (N=80) | checkpoints | hidden item |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| KVT-09 | Kalpeni Kadalkara (Kalpeni Storm Bank) | `storm-bank-rubble-slides` [rubble-slide] | `kvt-buried-door` | hopping up the steps from where you land: the landing slides you a tile towards the lagoon, over the step's edge, and the rubble carries you into the water (`splash`, tick 222) | "jump bigger": under the beach-rock lip a full leap hits its jagged underside (`spikes`, tick 799) | walk to the far end of each step, then a tap up; middling jumps under the lip | 25.1 s vs par 32 | 100 / 100 / 76, worst 100% | 4 (34.5, 68.5, 116.5, 145.5) | shell over step 3 of the first bank (16, 9.7) |
| KVT-10 | Neerali Kuzhi (Octopus Hole) | `camouflage-twin-creature` [camouflage-twin] | `kvt-sand-arm` | jumping the dark hole on to the bright head past it: it's the octopus (`kvt-octopus`, tick 179) | "the dark hole was safe, so trust dark holes": the bare one goes right through (`splash`, tick 564) | stand on the den with shells, jump the head whose colour moves | 14.7 s vs par 22 | 100 / 100 / 100, worst 100% | 3 (32.5, 66.5, 89.5) | shell over the den (13.5, 11.9) |

KVT-09 beats: (1) room: the first face (rule taught, A1 death); (2) `kvt09-pavizham`: the second face under a
stepped beach-rock lip (A2 death); (3) `kvt09-kodumudi`: steps narrow to two tiles, then over the summit the
lagoon is on the other side, so the slide goes the other way: walk off each step, never hop down (the "land
deep" rule goes stale; Tara says "Hop down, Dad!"); (4) `kvt09-murivu`: the breached crest, jump well past each
storm cut (Tara: "A little hop will do!"); (5) door `kvt-buried-door`: the door is buried under storm rubble;
each landing on the heap slides it and you a tile towards the lagoon: three hops clear the door, a fourth tips
the heap and you into the water. Mistakes recorded: Tara's little hop over the cut, hopping down the far side.

KVT-10 beats: (1) room: the octopus drawn as a yellow coral head (its speckles drift, an eye opens now and
then); the den is the dark hole ringed with shells, solid; (2) `kvt10-midden`: a bare dark hole (no shells) that
goes right through, and the octopus crawls from its yellow head to a pink one, turning pink as it goes; (3)
`kvt10-irakkam`, the city in a new order: the tour's tide-shrinking coral steps and, between them, a hole with
eyes (KVT-06's moray) instead of shells; (4) door `kvt-sand-arm`: the octopus's arm lies across the threshold,
the colour of the sand; the sand that ripples is the arm; jump it. Mistakes: landing on the pink head that was
yellow a moment ago, running straight over the moray hole, walking into the door.

Kalpeni source check (open item in the allocation): Wikipedia's Kalpeni page says "The eastern and southern
shorelines of the island have accumulations of coral debris, the result of a violent storm that hit the area in
1847." Verified: coral debris left by a storm on Kalpeni's shore. Not on the page: the words "storm bank", and
any sliding (the slide is the game's rule). The guide's line says only "A cyclone left all this coral here!".

## B. Tour bite (`tour-kvt-b8` [B8])

KVT-01 keeps its teaching job (the guide's facts, the turtle nest you wait for). The old two-tile shallow ditch at
the end of the beach is now a real lagoon inlet (cols 82-87) with a coral step in it (`CoralStep`, `kvt/tide.ts`).
When you come down the beach (x 78.5) the tide turns: after 0.3 s the near shoulder washes off, after 1.1 s the
far one, leaving the one-tile top (never less). Tara urges "The step's big! Run and jump!". NAIVE (the old tour as
it looks: wait for the turtles, then the running hop) lands on the near shoulder as it goes: `splash`, tick 1557.
The route waits at the water's edge, then hops on to the top and off. FIX is the turtle jump from before
(`kvt-hatchling`, tick 1013, same death as before the pass, the cause renamed). Checkpoint 85.5 (inside the new
inlet) moved to 89.5 on the far beach. Fairness 100 / 100 / 100. No stage meta on 01: the allocation test checks a
stage's meta against slot 1 (`s-turtle-nest-spread` / shipped), and tourNew isn't a slot.

## C. Lines

| | Local | English |
| --- | --- | --- |
| Seventh death (was "Thala for a reason") | Ezhaamathe odam vettikkalanju! Thirichu jetty-lekku. | Seventh boat struck off! Back to the jetty. |
| intro 02 | Odam ippo pokum! Jump cheyyu! | The boat is leaving now! Jump! |
| intro 03 | Supari light nokku, Dad. | Watch the light, Dad. |
| intro 04 | Agatti-yil flight landing aanu, odu! | A flight is landing at Agatti, run! |
| intro 05 | Minicoy-il choora meen parakkum! | In Minicoy, the tuna fly! |
| intro 06 | Vellathil chaadu, Dad! Neenthan ariyamallo? | Jump in, Dad! You can swim, right? |
| intro 07 | Thengil kayari po, Dad! Islander-maar ellam cheyyum! | Climb the palm, Dad! Every islander does it! |
| intro 08 | Billam aazham illa, Dad! Pathukke nadannu po! | The lagoon's shallow, Dad! Just walk across slowly! |
| intro 09 (new) | Padi pole kayari po, Dad! | Climb it like stairs, Dad! |
| intro 10 (new) | Kuzhi kandaal chaadu, Dad! | Jump the hole, Dad! |

Intros 04-08 were inline in the stages; they moved into `lines.intro` (9 entries, `intro[0]` is KVT-02's) word for
word, so what Tara says in 02-08 is unchanged; the old unused first intro "Dad, billam side ready?" is dropped.
Other new spoken lines (encores): "Ithu kodumkaattu ittu poya pavizham! | A cyclone left all this coral here!",
"Randaamathe kunnu, Dad. | The second bank, Dad.", "Mukalil padikal cheruthaanu. | The steps are small at the top.",
Tara "Chaadi irangu, Dad! Vegam! | Hop down, Dad! Quick!", "Cheriya chaattam mathi! | A little hop will do!",
"Vaathil illa, Dad! Thirichu po! | No door, Dad! Go back!", npc "Vaathil kandu! | There's the door!", guide
"Ee reef-il neerali undu. | There are octopuses on this reef.", "Shankhu ulla kuzhi neeraliyude veedu. | A hole with
shells is an octopus's home.", Tara "Odi chaadu, Dad! Vellam pokunnu! | Run and jump, Dad! The water's going!",
"Nadannu kayaru, Dad! Vaathil ivide! | Just walk in, Dad! The door's here!", tour Tara "Padi valuthaanu! Odi
chaadu! | The step's big! Run and jump!". Words are plain Malayalam (odam is the city's Jeseri word for boat); a
native check is still worth doing on "vettikkalanju" (struck off) and "neerali" (octopus). All other LINES fields
read right for 10 stages (none counts stages).

## D. Renamed keys (inside `src/game/cities/kvt/` and `tests/cities/kvt.ts` only)

| Kind | Old | New |
| --- | --- | --- |
| door endings | reflection, glider, trapdoor, footsteps, pushoff, safetystop, loading | kvt-reflection, kvt-glider, kvt-trapdoor, kvt-footsteps, kvt-pushoff, kvt-safetystop, kvt-loading |
| death causes | pinched, stung, bitten, hatchling | kvt-pinched, kvt-stung, kvt-bitten, kvt-hatchling (now with a cause line) |
| thing | tuna | kvt-tuna |
| new | | endings kvt-buried-door, kvt-sand-arm; cause kvt-octopus; acts kvt09-pavizham, kvt09-kodumudi, kvt09-murivu, kvt10-midden, kvt10-irakkam |

The seven old ending policies are copied into `tests/cities/kvt.ts` under their new names (importing
`tests/endings.ts` from a city file is a circular import). The shared tables still hold the old names (left for
the cleanup item).

## E. Hardness, stage by stage (fairness at LDD_N=80, average lag)

| Stage | Changed? | What | Why | NAIVE cause | FIX cause | Fairness avg (worst stretch) |
| --- | --- | --- | --- | --- | --- | --- |
| 02 | no | left alone | the obvious play dies (rotten plank), the fix dies (the real gap), fair 100% | splash | splash (a different gap) | 100 (100) |
| 03 | no (one mistake added) | left alone | obvious play dies to the fake door, fix to the real last gap | fake exit | splash | 100 (100) |
| 04 | yes, stage + route | the spike strip past the second pit is one tile, a tile further on (x+20 only, was x+19..20); route hops the tug a fifth of a second out (it was a 0.13 s auto-dodge); new FIX | at 12-tick lag the run-up after the pit landed past the takeoff point and walked into the spikes (s1 79% before); the old dodge plus lag met the tug | spikes (runway light) | hit (the baggage tug) | 100 (100) |
| 05 | route only | lighthouse steps climbed by a policy that tries the hop again (`lighthouse()` in kvt.ts); KVT-05 route rebuilt for `kvt-tuna` | 7/80 runs "stuck" on the steps after a gull or late thumb dropped them a step (s0 91% before) | hit | spikes (the pulley) | 100 (100) |
| 06 | route only; NAIVE added | the swims use a copy of the shared swimmer whose "reached" band matches its hover band (`swimTo`); the room's pier step also accepts a leap that lands past the pier; the safety-stop exit point is 54 px from the door (was 62) | the shared swimmer hovered 4 px off a point for ever at 10-12 lag and drowned (s2 69%, door 78% before) | spikes (urchins) | none (not one of the five) | 100 (100) |
| 07 | no; NAIVE + FIX added | left alone | the obvious play (jump for the bare trunk at once) and its fix (leap on from low down) both die; fair 100% | kvt-pinched | splash | 100 (100) |
| 08 | route only; NAIVE + FIX added | footsteps policy steers a few ticks after the jump; dolphins policy starts a touch earlier and jumps off at 0.56 / 0.55 of the leap | late thumbs overshot the footprints (door 78%) and missed the dolphins (s2 86%) | splash (the rock) | splash (the seaweed after the rock) | 95 (95, dolphins: the tightest number in the city) |

FIX plays on 9 stages (01, 02, 03, 04, 05, 07, 08, 09, 10), each a different trap from its NAIVE. MISTAKES:
02, 03, 04, 05, 08, 09, 10 (none written for 06 and 07: my tries survived, so I dropped them).

Guard proof: with `KVT` removed from the allow-list in my working copy, `npx vitest run tests/modules.test.ts -t KVT`:
11 passed (no excuses needed); then `git checkout tests/modules.test.ts` (no edit committed).

## Refreeze diff (`tests/cities/_frozen/kvt.json` against bc76d83), number by number

- KVT-01: checkpoint 85.5 → 89.5 (the old ditch's checkpoint was inside the new inlet; moved to the far beach).
  Route 1934 → 2063 (+129 ticks: waiting at the water's edge for the tide and two standing hops). NAIVE 1013
  hatchling → 1557 splash (the new NAIVE is the coral step, played after the turtles). FIX cause hatchling →
  kvt-hatchling (rename; tick 1013 unchanged).
- KVT-04: new FIX (226, hit). Route tick unchanged (1588): the tug hop and the spike move don't change the bot's
  winning tick.
- KVT-05: route 2279 → 2553 (+274: the lighthouse climber stands still under each overlap and waits for every
  gull). FIX 1887 → 2159 (+272: the same climb happens before it, then the same pulley death).
- KVT-06: route 4213 → 4211 (−2: the new swimmer moves on from a point a hair sooner). New NAIVE (309, spikes).
- KVT-07: new NAIVE (1106, kvt-pinched) and FIX (1409, splash).
- KVT-08: route 2264 → 2258 (−6: the dolphin ride jumps off a little earlier). New NAIVE (286, splash), FIX (537, splash).
- KVT-09, KVT-10: new entries (numbers in the table in A).
- KVT-02, KVT-03: identical.

## Test totals and other proof

- `npm run typecheck`: clean. `npm test`: 1504 passed, 12 skipped (18 files passed, 14 skipped), frozen test green
  on the refrozen file, `tests/allocation.test.ts` 10/10 green.
- `LDD_N=80 npm run fair -- KVT`: every stage ≥ 95% average and every stretch ≥ 95% (table in `docs/cities/KVT.md`).
- `npm run build:single && node scripts/flows.mjs`: "no errors".
- Shots (I looked at each): `/local/home/saiposh/personal/ldd-wt/kvt/shots/route/KVT-01-sheet.png`, `KVT-04-sheet.png`,
  `KVT-06-sheet.png`, `KVT-08-sheet.png`, `KVT-09-sheet.png`, `KVT-10-sheet.png`; copies in
  `/local/home/saiposh/personal/ldd-inbox/reports/cities/kvt/shots/`. The city still looks like itself; text fits;
  the buried door shows its top over the heap, and the sand arm curls up in front of the door.

## Not done

- KVT-09 is 25 s once known, under the 60-90 s "tough" band (5 beats and 4 checkpoints are there). KVT-10 is
  15 s with 3 beats + the door, short for a closing stage.
- KVT-07's room itself has no new bite: its NAIVE and FIX die in its first act (the crab palms). KVT-06 has no FIX.
- No MISTAKES for 06 and 07.
- Native-speaker check of the new Malayalam lines.

## Risks and where QA should press

- KVT-08 sits exactly at the bar (95% average, dolphin stretch 95%): a small model change could tip it under.
- Routes for 04, 05, 06, 08 changed, not the stages (except the 04 spike strip): QA should play the reef swim and
  the dolphins by hand and say whether they feel fair, not just trust the model.
- The tour's coral step is small on screen (a pink one-tile head at the water line); check it reads on a phone.
- The rubble slide in 09 blocks input for 8 ticks per landing; feel it on device.
- The octopus is meant to be nearly invisible (only its speckles drift); check the tell is readable after one death.
- The rename removes the bare words `loading`, `reflection`, ... from the shipped-endings list the allocation test
  compares against (they are `kvt-loading` and so on now), so a new city's `xxx-loading` would no longer be caught
  as a shipped ending under a new name.
