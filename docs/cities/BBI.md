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
| 02 | Hockey | keeper-pads-carry-you [carried-by-actor] | ride the keeper's back pad across the drain; the front pad takes the flick; the save rebounds off the boards and back | `bbi02-corner` (cross the stopper while the ball sits still), `bbi02-dive` (a second keeper), `bbi02-chhal` (a dummy corner: the first ball is let through) | `bbi-turf-roll`: match over, the groundsmen roll the turf up from the door end and the roll comes at you along the floor; get on the bench and let it pass under (or hop it) |
| 03 | Chandua | cutout-safe-on-open-parasol [safe-shape] | parasols open only for a customer; silk slides you off; only the cut-out holds; the third shopkeeper sells his cut-out | `bbi03-gali` (the far one opens first, out of reach), `bbi03-mela` (the last one is sold) | `bbi-lantern-drop`: the lantern is let down on the step |
| 04 | Tarakasi | standing-builds-blocker [stand-builds-block] | half a second still and the silversmith solders a glowing curl ahead: a wall on the bench, a bridge over the trough | `bbi04-karkhana` (two torches, two troughs) | `bbi-curl-stair`: the wall your standing builds is the stair to the door |
| 05 | Raja (how would I know, long) | idle-world-you-start-it [idle-world] | still machines start when touched, with you on them; touch nothing; the door is behind the step | `bbi05-dhenki`, `bbi05-gadi` (touch nothing), `bbi05-tenda` (start the water lift on purpose, off at the top), `bbi05-chheli` (NEW: the goat isn't on holiday: it walks the pounder and swings its head up; on the far bank it butts you; jump once it has crossed back), `bbi05-khala`, `bbi05-patra` (NEW, reserve talapatra: the scribe's soot shows the lines only behind him; the written leaves hold, the blank ones are rotten), `bbi05-bail` (follow the bullocks well behind), `bbi05-chakki` (the mill's far half flings you over) | `bbi-behind-step`: the front door is locked; the way in is under the verandah |
| 06 | Bandha (long) | loom-beat-aligns-threads [beat-align] | one beat in five the dyed patches line up into a bridge; the shuttle crosses on that beat | `bbi06-tana` (across and back), `bbi06-sidhi` (the motif is a staircase), `bbi06-patta` (NEW, reserve pattachitra: each painted panel shows the NEXT pit), `bbi06-sutra` (NEW: two undyed threads leave a hole in the motif, shown only on the bridge beat), `bbi06-sari` (NEW: the dyers' wet sari throws you up; only the second bounce reaches the bank, and then they let go), `bbi06-rachh` (the beater sweeps at the beat's end) | `bbi-motif-door`: the thread curtain parts only on the motif beat |
| 07 | Gotipua (marathon, lives: act) | troupe-pose-platform-shapes [pose-shapes] | dancers whirl while the drum plays; poses on the stop; go at the stop, the restart throws you | `bbi07-mardala` (shelter bank), `bbi07-deepa` (lamps over the wheel), `bbi07-bandha` (long bridge, wheel up a bank), `bbi07-dui-baja` (NEW: the troupe follows the drummer across the pit, not the one by you), `bbi07-bagudi` (NEW, reserve bagudi: the raider's tag makes you it; back over the chalk line to pass it on; hopping him is a tag too), `bbi07-pada` (NEW: the tower falls over as the bridge, its top on the edge you'd wait at), `bbi07-shrinkhala` (the chain: no banks, no stopping: the momentum beat), `bbi07-dweepa` (a lamp plinth to rest on: the shelter beat) | `bbi-pose-gate`: the last pose is a gate |
| 08 | Pakhala (how would I know) | pakhala-pour-floats-grains [pour-floats] | the tilting jug's pour floats the rice apart; ride a badi; the second jug pushes its badi under | `bbi08-kansa`, `bbi08-bhanwar` (NEW: the bowl drains through a hole by the far rim and takes each badi down; hop to the rim at the last moment), `bbi08-dui` (two jugs over two of four) | `bbi-leaf-plate`: the leaf plate turns over at the far end |
| 09 | Chakka (long) | world-slides-hub-stays-still [hub-still] | the horses start the plinth; wait on the still hub as it slides under and slams | `bbi09-ghoda` (short chariot), `bbi09-udaya` (spokes that rise one at a time), `bbi09-ratha`, `bbi09-jhadu` (NEW, Konark plinth setting: the caretaker's broom goes away slowly and comes back fast and low; hop it), `bbi09-ulta` (the plinth sinks after the slam), `bbi09-asta` (rising spokes down to the far bank), `bbi09-ara` (spokes that sink in order) | `bbi-horse-gap`: touch a horse and their plinths slide together |
| 10 | Kalinga (finale, lives: act) | finale-pads-onto-plinth [pads-to-plinth] | the keeper's pads carry you to a bare plinth that slides; step up to the hub | `bbi10-chhata`, `bbi10-sidhi`, `bbi10-tana`, `bbi10-khela`, `bbi10-deepa`, `bbi10-bunakar`, `bbi10-nacha`, `bbi10-udaya`, `bbi10-konark`, `bbi10-shrinkhala`, `bbi10-mela`, `bbi10-ratha` (parasols, looms, keeper, troupes, chariots and spokes from 02-09 only) | `bbi-ribbon-snip`: the inauguration ribbon and the scissors |

Every act has its own deaths recorded as MISTAKES (`DEATHS` in `tests/cities/bbi.ts`, built on the route up to the
act's start): the obvious play and, where the act has one, the obvious fix. Every act added in the second length
pass has both, with different causes and ticks (probe in `docs` of the length report).

Hidden items: dahibara (01, 10), chhena poda (02, 06, 09), tarakasi filigree flower (03, 04), podapitha (05, 07),
badi (08).

## Death causes (`causes.ts`)

`bbi-nala`, `bbi-turf`, `bbi-ball`, `bbi-rebound`, `bbi-rangapani`, `bbi-silk`, `bbi-peeled`, `bbi-lantern`, `bbi-agni`,
`bbi-jhala`, `bbi-kunda`, `bbi-jaanta`, `bbi-dhan`, `bbi-dhenki`, `bbi-sila`, `bbi-gadi`, `bbi-tenda`, `bbi-bail`,
`bbi-ranga`, `bbi-shuttle`, `bbi-rachh`, `bbi-tana`, `bbi-nacha`, `bbi-thrown`, `bbi-kick`, `bbi-deepa`, `bbi-pakhala`,
`bbi-dhara`, `bbi-chakka`, `bbi-khai`, `bbi-ulta`, `bbi-udaya`, `bbi-ara`, `bbi-ghoda`, `bbi-kainchi`, `bbi-roll`,
`bbi-patra`, `bbi-khali`, `bbi-chheli`, `bbi-sinha`, `bbi-sadha`, `bbi-chitra`, `bbi-sutra`, `bbi-dhua`, `bbi-sari`,
`bbi-bagudi`, `bbi-chhuin`, `bbi-pada`, `bbi-bhanwar`, `bbi-jhadu`, `bbi-pheri`, `bbi-parikha`.

## Route times (scripted route, no deaths), par, checkpoints

Second length pass: acts that repeated one hazard with one answer were cut, and the length now comes only from
new betrayal types. Stages that could not reach their floor that way stop short (see the length report).

| Stage | Route | Floor | Par |
| --- | --- | --- | --- |
| 01 | 25.4 s | 25-35 | 30 |
| 02 | 25.7 s | 25-45 | 35 |
| 03 | 25.8 s | 25-45 | 32 |
| 04 | 29.3 s | 25-45 | 36 |
| 05 | 47.7 s | >= 60 (short) | 58 |
| 06 | 39.8 s | >= 60 (short) | 48 |
| 07 | 64.3 s | >= 120 (short) | 78 |
| 08 | 38.3 s | >= 60 (short) | 46 |
| 09 | 61.0 s | >= 60 | 74 |
| 10 | 93.0 s | >= 90 | 112 |

Every act has a checkpoint at its start again (07 and 10 included); the longest replay from a checkpoint to the trap
that killed you is 7.6 s (01), at lag 0, 6 and 12.

## Fairness (`LDD_N=80 npm run fair -- BBI-0n`)

Every stage 100% at quick (0-6) and average (0-12) lag, every stretch 100% at average lag.

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
- One solid per Gotipua troupe, reshaped per pose (fewer solids, a faster world).
- The wet sari (06) uses the player's `launched` flag, like the shared launch pads: two fixed bounce speeds.
