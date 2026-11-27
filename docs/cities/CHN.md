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
  beat). Door `chn-fresh-curtain`: pale strands part for a walker; stop in front and the burner under you fries them into
  a wall (`chn-adupu`).
- **CHN-10 Spencer Escalators (`stair-direction-by-load` / `escalator-flip`):** an escalator (`Escalator`) runs up with one
  rider and reverses, fast, with two, into the comb plate at the foot (`chn-comb`); beside the steps is only the fountain
  (`chn-fountain`). Callbacks that break this city's rules, one cause each: `chn10-moodal` (four aboard crawl up; step off
  and the trolley comes down the belt, `chn-trolley`), `chn10-kaanal` (indoors the shimmer holds, the dark is the well,
  `chn-kinaru`; then on the food court display the pale spirals are real and the golden ones painted plaster that gives
  at a touch, `chn-plaster`), `chn10-billing` (the third trolley is the locked one; the loaded first tips you in,
  `chn-tipped`, the free ones roll off the rim at a touch, `chn-rolled`). The door `chn-wet-floor-sign` is plain (its
  mopped-floor rule collided with TVM-10's door and was taken out; the key is kept).

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

## Fix round 3 (QA round 1 at 8c554fb): what changed

- **Cut `chn09-ruchi`** (land on the cook's spiral and keep going before he snaps the near end): "don't stop on the floor"
  is KVT-08's (registry S9), and CHN-09 already spends its one labelled momentum beat on `varisai`. Its cause `chn-kai`
  is gone.
- **Cut `chn10-keezhe`** (ride the down escalator up with the kid): hopping up any escalator clears it, whatever its
  speed, so the trick had no teeth (the hop-every-0.3 s play cleared it at every lag).
- **`chn10-pattarai` folded into `chn10-kaanal`**: the plaster no longer gives after a second's stand (keep moving again);
  it gives at a touch, so the work is the colour read alone (CHN-09's rule the wrong way up). The polished floor and the
  display now make one act with two deaths, one per habit: walk the dark (`chn-kinaru`), land on the golden
  (`chn-plaster`). Off the shelf without touching the plaster is `chn-thotti`.
- **`chn10-billing`**: the free trolleys roll at a touch (standing on one, or coming down on to it), so a hop that only
  grazes the second trolley no longer bounces on (the hop-every-0.3 s play cleared the act). New causes for the water:
  off the rim `chn-neer`, off the locked one short of the floor `chn-poottu`.
- **`chn10-moodal`** has a second death: jump off as the overload buzzer goes, land back on it as it runs back, and the
  comb takes you (`chn-bhaaram`). Its fountain is `chn-atrium` (the room's line would advise hopping back to the kerb,
  which is this act's other death).
- **Every death line true for the play that died** (six-play probe at lag 0/6/12, and every scripted play): the oil names
  what Dad last stood on (`chn-karai` off the bank, `chn-ennai` a pale one folded, `chn-vellai` a white one folded,
  `chn-kannu` the eye, `chn-idai` off a fried one into the oil); the comb line no longer mentions the cut kid; the
  fountain line no longer advises staying on in the room, where that is the NAIVE death; the door's burner is
  `chn-adupu` (was the shared `burnt`).
- Clear times: CHN-09 28.1 s (par 38), CHN-10 22.9 s (par 31), both honestly under their floors (60 s, 90 s): no legal
  act was found to replace the two cut ones in this round.

