# CHN · Chennai: the 10-stage pass (notes for MECHANICS / CITIES / WAVE1)

Branch `city/chn`. The 8 shipped stages keep their ids; 09 and 10 are the encores (allocation v2 slots 9 and 10).
Reports: `ldd-inbox/reports/cities/chn/EXTEND.md` (round 1), `EXTEND-2.md` (round 2: the human-timing pass on 02-08).

## New ideas (for MECHANICS.md)

- **CHN-01, the sundal cart (tour bite, B5 `tour-chn-b5`, not the allocation's B16):** the vendor lifts the pan's lid on a
  steady beat and a column of scalding steam stands over the path while it is up (`SundalCart`, `chn-sundal`). The beat
  lies once: as you come within three tiles he lifts the lid to show the sundal and the shut after it is short
  (`chn-sooda`). The honest tell is his hand on the handle before every lift. Cross while the lid is shut and his hand is
  down.
- **CHN-09 Murukku Press (`extruded-spiral-strand` / `extrude-set`):** a brass press (`Press`, head `chn-achu`) on a rail
  lays spiral strands (`Murukku`) into a kadai of hot oil (`chn-ennai`); pale dough folds under you, fried golden holds,
  and the cook's slotted ladle (`Ladle`, `chn-karandi`, dripping `chn-sottu`) lifts the oldest spiral out first. Acts:
  `chn09-karandi` (darkest first, drip on the one before), `chn09-kannu` (the eye and the press over the far turn),
  `chn09-thenkuzhal` (fries white: read the bubbles), `chn09-varisai` (a row is one age: the stage's labelled momentum
  beat), `chn09-ruchi` (the cook snaps the near end off, `chn-kai`). Door `chn-fresh-curtain`: pale strands part for a
  walker; stop in front and the burner under you fries them into a wall.
- **CHN-10 Spencer Escalators (`stair-direction-by-load` / `escalator-flip`):** an escalator (`Escalator`) runs up with one
  rider and reverses, fast, with two, into the comb plate at the foot (`chn-comb`); beside the steps is only the fountain
  (`chn-fountain`). Callbacks that break this city's rules, one cause each: `chn10-moodal` (four aboard crawl up; step off
  and the trolley comes down the belt, `chn-trolley`), `chn10-kaanal` (indoors the shimmer holds, the dark is the well,
  `chn-kinaru`), `chn10-billing` (the third trolley is the locked one; the loaded first tips you in, `chn-tipped`, the free
  ones roll off the rim, `chn-rolled`), `chn10-keezhe` (a down escalator runs up with the kid aboard), `chn10-pattarai`
  (the golden display murukku are plaster, `chn-plaster`). The door `chn-wet-floor-sign` is plain (its mopped-floor rule
  collided with TVM-10's door and was taken out; the key is kept).

## Human timing (round 2), what changed in the shipped rooms

Widen the answer, never the trap, never the decision:

- 02: the first two pots are 24 px (the hop over pot three has a 48 px run-up); the lorry's spray rests 1.3 s (was 0.8).
- 03: the flood starts on the subway floor (not the last stair) and rises at 120 px/s (was 150); the board, crate and log
  are 8 px longer and the gap between things 26 px (was 30).
- 04: the two kaapi streams cycle every 2.2 s (was 1.8), still 0.9 s each; the act's checkpoint sits in the room's tail.
- 05: no kite at a dad still standing at the spawn; the kite zone before the door starts at dx-5; the act's checkpoint is
  on the road after the first hole and the second hole is a tile further on.
- 07: the dolls are 32 px wide (were 20) and bounce two ticks after a landing (was 0.06 s); the middle one sways 12 px
  (was 20, still the most); the last one steps 10 px aside as you come down from the fourth doll (x > 22, was 19) and
  stays aside 1.6 s; in the act the spike pit starts a tile later and the second stone is three tiles wide.
- 08: the train starts four tiles further back (-9, was -5).
- 06 and the doors of 03, 06, 08: route-only (the way a person plays them), nothing in the stage.

## Lines

Seventh death: "Ezhaavadhu kaapi! Tumbler-la nirappu. | Seventh coffee! The tumbler is topped up again." Intros for all
ten stages in `lines.ts`; every death here has its own Tara line in `causes.ts` (law 9).

## Keys

Endings `chn-token`, `chn-bull`, `chn-catch`, `chn-rangoli`, `chn-tips`, `chn-fresh-curtain`, `chn-wet-floor-sign`;
things `chn-lorry`, `chn-mirage`, `chn-loco`, `chn-ball`; causes `chn-ennai`, `chn-achu`, `chn-karandi`, `chn-sottu`,
`chn-kai`, `chn-comb`, `chn-fountain`, `chn-trolley`, `chn-kinaru`, `chn-plaster`, `chn-rolled`, `chn-tipped`,
`chn-sundal`, `chn-sooda`. CHN-08 keeps the kit's `sink` twist.
