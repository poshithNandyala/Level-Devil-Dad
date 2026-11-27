# KVT · Kavaratti, Lakshadweep: the shipped city's pass (encores, tour bite, lines, keys, hardness)

Notes for the integrator (MECHANICS.md, WAVE1.md, CITIES.md). Branch `city/kvt`.

## New ideas (for MECHANICS.md)

- **Tour bite (KVT-01, `tour-kvt-b8` [B8]):** the coral step out to the boat shrinks with the tide as you come
  down the beach: three tiles, then the near shoulder washes off, then the far one, down to its one-tile top
  (never less). Wait at the water's edge, then hop on to the top and off. `CoralStep` in `kvt/tide.ts`.
- **KVT-09 Kalpeni Kadalkara (`storm-bank-rubble-slides` [rubble-slide]):** loose coral rubble thrown up by a
  storm: every landing on it slides you one tile towards the lagoon. Off a step's edge, the rubble you brought
  down carries you all the way into the water. Climb by walking to the far end of each step and tapping up;
  under a jagged beach-rock lip a full leap is death; near the top the steps narrow to two tiles; over the
  summit the lagoon is the other way, so you walk off each step and never hop down; the breached crest wants a
  long jump well past each storm cut. `RubbleBank` in `kvt/encores.ts`.
  Round 2 (route 60.2 s, `lives: 'act'`, 8 calm checkpoints): `kvt09-kadalbhitti` the sea wall, whose first
  break is a heap you land deep on and whose second is one loose block you must jump whole;
  `kvt09-irangal` a second way down, walk off the 3-tile steps and hop over the 1-tile ones;
  `kvt09-varambu` a ridge of heaps with water on both sides, land in the middle (deep slides you off the far
  side; `RubbleBank.ridge`); `kvt09-kuzhi` a storm-water hollow, walk off each step going down and land deep
  coming up. `kvt09-pavizham`, `kvt09-kodumudi` and `kvt09-murivu` are longer (7 steps, 8 up and 8 down,
  3 cuts). `RubbleBank` gained `dir` (the slide goes either way) and `ridge`.
  Door `kvt-buried-door`: the door is buried under a heap of storm rubble; every landing on the heap slides it
  (and you) a tile towards the lagoon: three hops clear the door, a fourth tips the heap and you into the water.
- **KVT-10 Neerali Kuzhi (`camouflage-twin-creature` [camouflage-twin]):** an octopus sits on the reef drawn as
  a coral head of the same colour; only its speckles drift, and now and then an eye opens. Its den, the dark
  hole ringed with shells, is solid rock. Act `kvt10-midden`: a bare dark hole (no shells) that goes right
  through, and an octopus that crawls from its yellow head to a pink one, turning pink as it goes. Act
  `kvt10-irakkam` calls back the city in a new order: the tour's tide-shrinking coral steps, and between them a
  hole with eyes (KVT-06's moray). Door `kvt-sand-arm`: the octopus's arm lies across the threshold the colour
  of the sand; the sand that ripples is the arm. Jump it.
  Round 2, the finale (route 90.1 s, `lives: 'act'`, 16 calm checkpoints): each act calls back one KVT idea and
  breaks the rule it taught. `kvt10-palaka` the rotten plank is the way down to the catwalk; `kvt10-kallu` on
  the rubble the far tile of step 2 is an octopus, land in the middle; `kvt10-aama` a nest behind you (run on),
  then one ahead (wait); `kvt10-choora` high tuna you walk under, then a low boat whose tuna you hop;
  `kvt10-thengu` the crab is in the crown, leap from the trunk; `kvt10-irandu` morays that strike twice;
  `kvt10-kaattu` tailwind then headwind, jump in the calm; `kvt10-kamaanam` the dolphin under a jagged arch,
  ride over and step off coming down; `kvt10-nizhal` the lighthouse beam takes steps away, step on after it
  passes; `kvt10-veliyettam` the incoming tide, 7 heads that sink if you stop; `kvt10-paaru` the reef rises only
  for a jumper; `kvt10-kotta` the basket that does not stop at the bottom; `kvt10-kannadi` cracked glass holds
  only at a run; `kvt10-thoni` the boat that is not coming back.
- Acts: `kvt09-pavizham kvt09-kodumudi kvt09-kadalbhitti kvt09-irangal kvt09-varambu kvt09-kuzhi kvt09-murivu`
  `kvt10-midden kvt10-palaka kvt10-kallu kvt10-aama kvt10-choora kvt10-thengu kvt10-irandu kvt10-kaattu`
  `kvt10-kamaanam kvt10-nizhal kvt10-veliyettam kvt10-paaru kvt10-kotta kvt10-kannadi kvt10-thoni kvt10-irakkam`.
- Door endings: `kvt-buried-door kvt-sand-arm`.
- Seventh death: the jetty's departures board strikes out the seventh boat.

## Kalpeni source check

Wikipedia, Kalpeni: "The eastern and southern shorelines of the island have accumulations of coral debris, the
result of a violent storm that hit the area in 1847." It does not use the words "storm bank", and nothing says
the debris slides: the slide is the game's rule. The guide's line says only what the page says (a storm left
the coral there).

## Renamed keys (the prefix rule)

Door endings `reflection glider trapdoor footsteps pushoff safetystop loading` → `kvt-` + the same word.
Death causes `pinched stung bitten hatchling` → `kvt-pinched kvt-stung kvt-bitten kvt-hatchling` (and
`kvt-hatchling` now has a cause line). Thing `tuna` → `kvt-tuna`. New: causes `kvt-octopus`; no new thing kinds.

## Fairness (LDD_N=80, quick / average / relaxed, worst stretch at average)

| Stage | Quick | Avg | Relaxed | Worst stretch |
| --- | --- | --- | --- | --- |
| KVT-01 | 100 | 100 | 100 | 100 |
| KVT-02 | 100 | 100 | 80 | 100 |
| KVT-03 | 100 | 100 | 76 | 100 |
| KVT-04 | 100 | 100 | 76 | 100 |
| KVT-05 | 100 | 100 | 81 | 100 |
| KVT-06 | 100 | 100 | 80 | 100 |
| KVT-07 | 100 | 100 | 100 | 100 |
| KVT-08 | 94 | 95 | 74 | 95 (dolphins) |
| KVT-09 | 100 | 100 | 76 | 100 |
| KVT-10 | 100 | 100 | 76 | 100 |
