# BBI · Bhubaneswar, Odisha: design notes (module city, 10 stages)

Code: `src/game/cities/bbi/` (one file per stage, `s01.ts` .. `s10.ts`, plus the `entities.ts` kit (a `Rig`: a box
that can be solid and/or deadly, driven by closures), `common.ts`, `endings.ts`, `levels.ts`, `lines.ts`, `theme.ts`,
`look.ts`, `music.ts`, `backdrop.ts`, `things.ts`, `causes.ts`, `course.ts`, `skin.ts`). Routes and plays:
`tests/cities/bbi.ts`. Every stage's `meta` matches its slot in `docs/allocation.json` (v2) and declares its door
ending. Later stages reuse the earlier stages' builders (`keeperOn`, `parasol`, `loom`, `troupe`, `chariot`), so the
finale's callbacks are the same mechanics, not copies.

## Stages

| # | Name | Family [betrayals] | Room | Acts | Door ending |
| --- | --- | --- | --- | --- | --- |
| 01 | Namaskara Bhubaneswar (tour) | aimed-hose-slick-follows-waiter [aimed-slide] | a gardener waters the median's pots; when he turns to the road his jet follows a dad who waits, and the wet tile slides you into the open drain. Second gardener: back turned, but the tile at the next drain's lip is still wet | none (tour) | `bbi-wet-lip-drain` (meta only: the tour's closing bite is the wet lip) |
| 02 | Hockey | keeper-pads-carry-you [carried-by-actor] | the keeper's pads are the only way over the drain: at the flick he dives across, carrying you. The ball hits the front pad; the save rebounds off the boards and back to him | `bbi02-corner` (cross the stopper's spot while the ball sits still), `bbi02-dive` (a second keeper), `bbi02-dobara` (a quicker corner) | `bbi-goal-net`: the door is inside a goal net that only lifts after a goal; get up on the bench and let the ball score |
| 03 | Chandua | cutout-safe-on-open-parasol [safe-shape] | Pipili parasols open only when a customer comes to that shop; open silk slides you off; only the appliqué cut-out (in a different place on each) holds; the third shopkeeper sells his cut-out while you wait | `bbi03-gali` (the far parasol opens first, out of reach), `bbi03-mela` (the last one is sold) | `bbi-lantern-drop`: the shopkeeper lets a big lantern down on the step as you come up |
| 04 | Tarakasi | standing-builds-blocker [stand-builds-block] | Cuttack filigree: half a second standing still and the silversmith solders a glowing curl on the tile ahead: a burning wall on the bench, a bridge piece over the quench trough | `bbi04-karkhana` (two torches, two troughs, a torch over the second) | `bbi-curl-stair`: the door is up on a shelf; the wall your standing builds is the step |
| 05 | Raja (how would I know, long) | idle-world-you-start-it [idle-world] | the fields rest; every machine is still with a cloth on it (the tell); touch the hand mill, pounder, grinding stone or cart and you start it, with you on it | `bbi05-dhenki`, `bbi05-gadi`, `bbi05-pokhari`, `bbi05-khala`, `bbi05-gaon` (the same machines in new orders) | `bbi-behind-step`: the verandah's front door is locked and its grinding roller waits where you would land; the way in is below, behind the step |
| 06 | Bandha (long) | loom-beat-aligns-threads [beat-align] | each warp thread's dyed patch moves by its own step every beat; one beat in five they line up into the motif, a bridge; the shuttle crosses on that beat | `bbi06-jala` (quick beat), `bbi06-tana` (across and back), `bbi06-pata` (twice the same way), `bbi06-tani` (three passes) | `bbi-motif-door`: a curtain of threads parts into the door's shape only on the motif beat |
| 07 | Gotipua (marathon, lives: act) | troupe-pose-platform-shapes [pose-shapes] | dancers whirl while the mardala plays; on the stop they hold a tower, a wheel or a bridge; go at the stop, because the restart throws you off | `bbi07-mardala` (shelter bank between two troupes), `bbi07-bandha` (a long bridge and a wheel up to a high bank), `bbi07-mancha`, `bbi07-sahi` (a troupe with no bridge), `bbi07-stambha` (towers only), `bbi07-dhol`, `bbi07-raati` (three quickening drummers) | `bbi-pose-gate`: the last pose is a gate over the door; their whirl kicks you out |
| 08 | Pakhala (how would I know) | pakhala-pour-floats-grains [pour-floats] | the settled rice is floor until the tilting jug (on screen from the first frame) pours; then the grains float apart; badi float; the second jug pours from the other rim and pushes its badi under | `bbi08-kansa`, `bbi08-handi`, `bbi08-thali` (smaller, quicker, bigger bowls) | `bbi-leaf-plate`: ride a sal-leaf plate over a trough; it turns over at the far end |
| 09 | Chakka (long) | world-slides-hub-stays-still [hub-still] | Konark: the wheel never turns; stand on the stone horses and the plinth slides and slams the temple wall; the hub stands still while the plinth slides under it | `bbi09-ghoda`, `bbi09-ratha`, `bbi09-surya`, `bbi09-chakra` (chariots of different lengths), `bbi09-ara` (spokes numbered like hours sink in order) | `bbi-horse-gap`: touch a horse and their little plinths slide together over the door |
| 10 | Kalinga (finale, lives: act) | finale-pads-onto-plinth [pads-to-plinth] | the keeper's pads (02) carry you across the moat on to a bare plinth (09) that slides for the wall; step up to the hub | `bbi10-chhata` (parasols, early sale), `bbi10-tana` (loom, then troupe), `bbi10-khela` (keeper), `bbi10-bunakar` (loom), `bbi10-nacha` (tower troupe), `bbi10-konark` (chariot), `bbi10-mela` (troupes), `bbi10-ratha` (chariot) | `bbi-ribbon-snip`: the inauguration ribbon and the ceremonial scissors |

Hidden items (drawn in `things.ts`): dahibara (01, 10), chhena poda (02, 06, 09), tarakasi filigree flower (03, 04),
podapitha (05, 07), badi (08). Each sits over a pit, a gutter or a hub where reaching it is a risk.

## Death causes (`causes.ts`)

`bbi-nala` drain, `bbi-turf`, `bbi-ball`, `bbi-rebound`, `bbi-rangapani`, `bbi-silk`, `bbi-peeled`, `bbi-lantern`,
`bbi-agni` torch, `bbi-jhala` fresh solder, `bbi-kunda` trough, `bbi-jaanta`, `bbi-dhan`, `bbi-dhenki`, `bbi-sila`,
`bbi-gadi`, `bbi-ranga` dye, `bbi-shuttle`, `bbi-tana` threads, `bbi-nacha`, `bbi-thrown`, `bbi-kick`, `bbi-pakhala`,
`bbi-dhara` second pour, `bbi-chakka` slam, `bbi-khai` moat, `bbi-ara` spoke, `bbi-ghoda`, `bbi-kainchi` scissors.
Each line says what happened and how to beat it. Pits that a machine or pose threw you into name the thrower.

## Fairness (human-timing model, `LDD_N=80 npm run fair -- BBI`)

Every stage is 100% at quick (0-6) and average (0-12) lag, and every stretch between checkpoints is 100% at average.
Relaxed (0-18): 01 100, 02 100, 03 88, 04 96, 05 100, 06 100, 07 80, 08 76, 09 76, 10 76. Full output in the build
report (`ldd-inbox/reports/cities/bbi/`).

## Route times (scripted route, no deaths) and par

01 16 s (par 22) · 02 21 s (28) · 03 26 s (33) · 04 29 s (38) · 05 22 s (30) · 06 42 s (54) · 07 79 s (100) ·
08 37 s (48) · 09 29 s (38) · 10 59 s (76). Under the shape targets for 05 (60-90), 06/09 (45-75), 07 (90-150) and
10 (90-150): see the build report.

## Language

Only lines the city bible (`ldd-inbox/docs/cities/BBI.md`, section 4) marks VERIFIED, or plain English: `Namaskara`,
`Kemiti achanti`, `Chala bajar jiba`, `Ethare garam hue`, `Dukhi huantu nahin`, `Chala ame mishiki khaiba`, `Mote bhulibe
nahin`, `Sabu subha hau`, `Eita kete tanka?`, `Subha jatra`, `Mu jani nahi`, `Pheri? Au thare?`, `Dad bujhi paru nahi`,
`Khusi ruha`, `Bahut bhala`, `Niaan!`, `Rakhya kara!`, `Paati karantu nahin!`, `Dhanyabad`, `Tikie aaste kuhantu`,
`Rageantu nahin`, `Ruha!` (word verified), `Ruha! Dekhi ki chala!` (word verified), `Hockey one, Dad zero!`.
The seventh-death line is `Dukhi huantu nahin! Au thare! | Don't be sad! One more time!` (no "Thala"). Tara lies at
the traps (`Ruha! | Stop!` at the gardener and the silversmith, `Bahut bhala! | Very good!` at the front pad, the
parasols, the dancers and the chariot).

## Look and sound

Laterite red ground with carved caps, an afternoon sky going from blue to marigold, a skyline of the two cave hills
with square cells (Udayagiri-Khandagiri), a white dome on a far rise (Dhauli, backdrop only), generic curved stone
towers of the old town (no shrine, no named temple), stadium floodlights and palms over laterite walls. Music: a
Bhupali-like pentatonic at 96 bpm on a mardala-style theka.

## Notes for MECHANICS / WAVE1

New act ids, ending keys and causes are all `bbi`-prefixed (lists above). Shared helpers worth knowing: a jump off
the sliding plinth keeps none of its speed (`solid.velX = 0`), so the hub is a straight jump up.
