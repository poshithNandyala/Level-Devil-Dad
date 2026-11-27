# BBI · Bhubaneswar, Odisha: design notes (module city, 10 stages)

Code: `src/game/cities/bbi/` (one file per stage, `s01.ts` .. `s10.ts`, plus the `entities.ts` kit (a `Rig`: a box
that can be solid and/or deadly, driven by closures), `common.ts`, `endings.ts`, `levels.ts`, `lines.ts`, `theme.ts`,
`look.ts`, `music.ts`, `backdrop.ts`, `things.ts`, `causes.ts`, `course.ts`, `skin.ts`). Routes and plays:
`tests/cities/bbi.ts`. Every stage's `meta` matches its slot in `docs/allocation.json` (v2) and declares its door
ending. Each stage's builders are factories (`keeperOn`, `cornerAct`, `parasol`, `smith`, `machine`, `rajaAct`,
`tendaAct`, `flingAct`, `bailAct`, `loom`/`loomAct`/`sidhiAct`, `troupe`/`troupeAct`/`deepaAct`, `bowl`, `chariot`/
`chariotAct`, `risingSpokes`), so the finale's callbacks are the same mechanics, not copies.

## Stages

| # | Name | Family [betrayals] | Room | Acts, in order (what each adds) | Door ending |
| --- | --- | --- | --- | --- | --- |
| 01 | Namaskara Bhubaneswar (tour) | aimed-hose-slick-follows-waiter [aimed-slide] | the median gardener's jet follows a waiting dad and the wet tile slides you into the drain; a second gardener's wet tile at the next drain's lip; the steps, posts, a parked cart and a bus over the dug-up road | none (tour) | `bbi-wet-lip-drain` (meta only: tours have no door ending) |
| 02 | Hockey | keeper-pads-carry-you [carried-by-actor] | ride the keeper's back pad across the drain; the front pad takes the flick; the save rebounds off the boards and back | `bbi02-corner` (cross the stopper while the ball sits still), `bbi02-dive` (a second keeper), `bbi02-chhal` (a dummy corner: the first ball is let through), `bbi02-dobara` (a quicker corner) | `bbi-turf-roll`: match over, the groundsmen roll the turf up from the door end and the roll comes at you along the floor; stand on the bench and let it pass under |
| 03 | Chandua | cutout-safe-on-open-parasol [safe-shape] | parasols open only for a customer; silk slides you off; only the cut-out holds; the third shopkeeper sells his cut-out | `bbi03-gali` (the far one opens first, out of reach), `bbi03-mela` (the last one is sold) | `bbi-lantern-drop`: the lantern is let down on the step |
| 04 | Tarakasi | standing-builds-blocker [stand-builds-block] | half a second still and the silversmith solders a glowing curl ahead: a wall on the bench, a bridge over the trough | `bbi04-karkhana` (two torches, two troughs) | `bbi-curl-stair`: the wall your standing builds is the stair to the door |
| 05 | Raja (how would I know, long) | idle-world-you-start-it [idle-world] | still machines start when touched, with you on them; touch nothing; the door is behind the step | `bbi05-dhenki`, `bbi05-gadi`, `bbi05-pokhari` (touch nothing), then the rule goes stale: `bbi05-tenda` (start the water lift on purpose, off at the top before it dunks), `bbi05-khala`, `bbi05-bail` (start the bullocks, follow well behind the cart), `bbi05-chakki` (start the mill on its far half and it flings you over), `bbi05-gaon`, `bbi05-gali` (a longer, slower lane), `bbi05-kua` (a higher, slower lift) | `bbi-behind-step`: the verandah door is locked, its roller waits; walk under |
| 06 | Bandha (long) | loom-beat-aligns-threads [beat-align] | one beat in five the dyed patches line up into a bridge; the shuttle crosses on that beat | `bbi06-tana` (across and back), `bbi06-jala` (quick beat), `bbi06-sidhi` (the motif is a staircase), `bbi06-buni`, `bbi06-rachh` (the beater sweeps at the beat's end), `bbi06-pata` (two passes the same way), `bbi06-dui` (two looms, a bank between), `bbi06-tani` (three passes) | `bbi-motif-door`: the thread curtain parts only on the motif beat |
| 07 | Gotipua (marathon, lives: act) | troupe-pose-platform-shapes [pose-shapes] | dancers whirl while the drum plays; poses on the stop; go at the stop, the restart throws you | `bbi07-mardala` (shelter bank), `bbi07-deepa` (lamps over the wheel), `bbi07-bandha` (long bridge, wheel up a bank), `bbi07-mancha`, `bbi07-shrinkhala` (the chain: no banks, no stopping: momentum), `bbi07-sahi` (no bridge, use the wheel), `bbi07-dweepa` (a lamp plinth to rest on: shelter), `bbi07-stambha` (towers only), `bbi07-dhol`, `bbi07-raati` (three quickening drummers) | `bbi-pose-gate`: the last pose is a gate |
| 08 | Pakhala (how would I know) | pakhala-pour-floats-grains [pour-floats] | the tilting jug's pour floats the rice apart; ride a badi; the second jug pushes its badi under | `bbi08-kansa`, `bbi08-handi` (poured in a hurry), `bbi08-majhi` (the cook holds the second jug over the middle badi: the one you learned to ride), `bbi08-thali` (four badi), `bbi08-dui` (two jugs over two of four) | `bbi-leaf-plate`: the leaf plate turns over at the far end |
| 09 | Chakka (long) | world-slides-hub-stays-still [hub-still] | the horses start the plinth; wait on the still hub as it slides under and slams | `bbi09-ghoda` (short chariot), `bbi09-udaya` (spokes that rise one at a time: wait on each), `bbi09-ratha`, `bbi09-ulta` (the plinth sinks after the slam: go from the hub straight to the wall), `bbi09-surya` (long chariot), `bbi09-asta` (rising spokes down to the far bank), `bbi09-chakra`, `bbi09-ara` (spokes that sink in order) | `bbi-horse-gap`: touch a horse and their plinths slide together |
| 10 | Kalinga (finale, lives: act) | finale-pads-onto-plinth [pads-to-plinth] | the keeper's pads carry you to a bare plinth that slides; step up to the hub | `bbi10-chhata`, `bbi10-sidhi`, `bbi10-tana`, `bbi10-khela`, `bbi10-deepa`, `bbi10-bunakar`, `bbi10-nacha`, `bbi10-udaya`, `bbi10-konark`, `bbi10-shrinkhala`, `bbi10-mela`, `bbi10-ratha` (parasols, looms, keeper, troupes, chariots and spokes from 02-09 only) | `bbi-ribbon-snip`: the inauguration ribbon and the scissors |

Every act has its own deaths recorded as MISTAKES (`DEATHS` in `tests/cities/bbi.ts`, built on the route up to the
act's start): the obvious play and, where the act has one, the obvious fix. 104 punish tests in all for BBI.

Hidden items: dahibara (01, 10), chhena poda (02, 06, 09), tarakasi filigree flower (03, 04), podapitha (05, 07),
badi (08).

## Death causes (`causes.ts`)

`bbi-nala`, `bbi-turf`, `bbi-ball`, `bbi-rebound`, `bbi-rangapani`, `bbi-silk`, `bbi-peeled`, `bbi-lantern`, `bbi-agni`,
`bbi-jhala`, `bbi-kunda`, `bbi-jaanta`, `bbi-dhan`, `bbi-dhenki`, `bbi-sila`, `bbi-gadi`, `bbi-tenda`, `bbi-bail`,
`bbi-ranga`, `bbi-shuttle`, `bbi-rachh`, `bbi-tana`, `bbi-nacha`, `bbi-thrown`, `bbi-kick`, `bbi-deepa`, `bbi-pakhala`,
`bbi-dhara`, `bbi-chakka`, `bbi-khai`, `bbi-ulta`, `bbi-udaya`, `bbi-ara`, `bbi-ghoda`, `bbi-kainchi`.

## Route times (scripted route, no deaths), par, checkpoints

| Stage | Route | Floor | Par | Checkpoints | Longest gap between calm spots |
| --- | --- | --- | --- | --- | --- |
| 01 | 25.4 s | 25-35 | 30 | 5 | 8.8 s |
| 02 | 28.9 s | 25-45 | 35 | 5 | 7.9 s |
| 03 | 25.8 s | 25-45 | 32 | 3 | 7.7 s |
| 04 | 29.3 s | 25-45 | 36 | 4 | 10.4 s |
| 05 | 62.8 s | >= 60 | 76 | 15 | 15.9 s |
| 06 | 61.8 s | >= 60 | 75 | 9 | 9.8 s |
| 07 | 121.2 s | >= 120 | 145 | 9 | 20.9 s |
| 08 | 61.5 s | >= 60 | 74 | 6 | 12.0 s |
| 09 | 63.0 s | >= 60 | 76 | 9 | 15.6 s |
| 10 | 99.4 s | >= 90 | 120 | 11 | 19.3 s |

## Fairness (`LDD_N=80 npm run fair -- BBI`)

Every stage 100% at quick and average lag; every stretch 100% at average lag. Relaxed (0-18): 01 100, 02 100,
03 88, 04 96, 05 84, 06 100, 07 80, 08 83, 09 76, 10 76.

## Language

Only lines the city bible (`ldd-inbox/docs/cities/BBI.md`, section 4) marks VERIFIED, or plain English. The
seventh-death line is `Dukhi huantu nahin! Au thare! | Don't be sad! One more time!`. Tara lies at the traps
(`Ruha! | Stop!` at the gardener and the silversmith; `Bahut bhala! | Very good!` at the front pad, parasols, dancers,
chariot).

## Look and sound

Laterite red ground with carved caps, a blue-to-marigold afternoon sky, the cave hills with their cells
(Udayagiri-Khandagiri), a white dome (Dhauli, backdrop only), generic curved stone towers (no shrine, no named
temple), stadium floodlights and palms. Music: a Bhupali-like pentatonic at 96 bpm on a mardala-style theka.

## Notes for MECHANICS / WAVE1

- A jump off the sliding plinth keeps none of its speed (`solid.velX = 0`), so the hub is a straight jump up.
- One solid per Gotipua troupe, reshaped per pose: the checkpoint replay test is O(checkpoints × route), and the
  finale's 99 s route with 11 checkpoints takes about 3.3 s of the 5 s test budget.
