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
| 01 | Namaskara Bhubaneswar (tour) | aimed-hose-slick-follows-waiter [aimed-slide] | the median gardener's jet chases a walking dad and spares one who stands still (DECISIONS S10); the wet tile slides you into the drain; a second gardener's wet tile at the next drain's lip; the steps, posts, a parked cart and a bus over the dug-up road | none (tour) | `bbi-wet-lip-drain` (meta only: tours have no door ending) |
| 02 | Hockey | keeper-pads-carry-you [carried-by-actor] | ride the keeper's back pad across the drain; the front pad takes the flick; the save rebounds off the boards and back | `bbi02-corner` (cross the stopper while the ball sits still), `bbi02-dive` (a second keeper), `bbi02-chhal` (a dummy corner: the first ball is let through) | `bbi-turf-roll`: match over, two turf rolls come from both ends at once; a roll only takes turf, so the safe ground is the ugly bare strip where it is already up |
| 03 | Chandua | cutout-safe-on-open-parasol [safe-shape] | parasols open only for a customer; silk slides you off; only the cut-out holds; the third shopkeeper sells his cut-out | `bbi03-gali` (the far one opens first, out of reach), `bbi03-mela` (the last one is sold) | `bbi-lantern-drop`: the lantern is let down on the step |
| 04 | Tarakasi | standing-builds-blocker [stand-builds-block] | half a second still and the silversmith solders a glowing curl ahead: a wall on the bench, a bridge over the trough | `bbi04-karkhana` (two torches, two troughs) | `bbi-curl-stair`: the wall your standing builds is the stair to the door |
| 05 | Raja (how would I know, long) | idle-world-you-start-it [idle-world] | still machines start when touched, with you on them; touch nothing; the door is behind the step | `bbi05-dhenki`, `bbi05-gadi` (touch nothing), `bbi05-chheli` (the goat walks the pounder), `bbi05-khala`, `bbi05-thaka` (the well sweep nobody will stop: stop it yourself, at the top), `bbi05-patra` (reserve talapatra: the written leaves hold), `bbi05-bail`, `bbi05-chakki`, `bbi05-ganna` (knock the cane belt off its pulley or the mill flings you), `bbi05-mama` (the uncle: the grinder treadle is the decoy, the lift is the way, and he shoves you if you wait) | `bbi-behind-step`: the front door is locked; the way in is under the verandah |
| 06 | Bandha (long) | loom-beat-aligns-threads [beat-align] | one beat in five the dyed patches line up into a bridge; the shuttle crosses on that beat | `bbi06-tana` (across and back), `bbi06-sidhi` (the motif is a staircase: 06's labelled momentum beat), `bbi06-patta` (reserve pattachitra: each panel shows the NEXT pit), `bbi06-sutra` (two undyed threads leave a hole in the motif), `bbi06-rachh` (the beater sweeps at the beat's end), `bbi06-tantu` (v3 F465: snap the plain thread over the bank and the weaver stops shuttle and beater; a coloured one pulls the motif apart), `bbi06-palaa` (v3 F466: the shuttle box runs from you; get on where it is, out over the pit) | `bbi-tanti-ghara`: plain (QA fix F4): the weaver's house, door open, walk in |
| 07 | Gotipua (marathon, lives: act) | troupe-pose-platform-shapes [pose-shapes] | dancers whirl while the drum plays; poses on the stop (a wheel, a bridge, a tower); go at the stop, the restart throws you | `bbi07-mardala` (shelter bank), `bbi07-deepa` (lamps over the wheel), `bbi07-bandha`, `bbi07-dui-baja` (the troupe follows the drummer across the pit), `bbi07-bagudi` (reserve bagudi: tagged, pass it back at the line), `bbi07-pada` (the tower falls over as the bridge), `bbi07-jodi` (two half-bridges: go when the second half lands), `bbi07-gadiba` (the roll: stand still through it, cross on the stop with no roll), `bbi07-hulahuli` (wait for the cheer to swell; the bowing boy kicks), `bbi07-sajaghara` (the dressing tent is safe only while they dance), `bbi07-ghungur` (v3 F467, the sound beat: lamps out, jump where the ankle bells ring), `bbi07-kachha` (v3 F495, the tell: tucked pleats mean the line rolls as it lies down), `bbi07-pothi` (v3 F468: hop the palm-leaf screen's hinges, wait at the top end) | `bbi-sajaghara-door`: plain (QA fix F4): the green-room door after the show, walk in |
| 08 | Pakhala (how would I know) | pakhala-pour-floats-grains [pour-floats] | the tilting jug's pour floats the rice apart; ride a badi; the second jug pushes its badi under | `bbi08-phinga` (v3 F470: the server throws faster the longer you wait; ride the first; replaces `kansa`, ruling W6), `bbi08-bhanwar` (the bowl drains: hop to the rim at the last moment), `bbi08-dati` (the hole is a badi wide: hop to the other badi and let yours plug it), `bbi08-ghurni` (v3 F469: the stirred bowl; hop only at the slow edge of a badi's circle) | `bbi-rosei-ghara`: plain (QA fix F4): the kitchen door, walk in |
| 09 | Chakka (long) | world-slides-hub-stays-still [hub-still] | the horses start the plinth; wait on the still hub as it slides under and slams | `bbi09-udaya` (spokes that rise one at a time; ten of them, then a bare terrace to run: the momentum beat), `bbi09-ratha`, `bbi09-ulta` (the plinth sinks after the slam), `bbi09-ara` (spokes that sink in order). Risen spokes go back under after 3 s stood on (`bbi-dooba`); jumping back off the sliding plinth lands in the moat | `bbi-horse-gap`: touch a horse and their plinths slide together |
| 10 | Kalinga (finale, lives: act) | finale-pads-onto-plinth [pads-to-plinth] | law 7 on 02 (QA fix F5): the flick is lifted over the keeper's front pad and drops on his back pad, so ride the front; he carries you to a bare plinth that slides; step up to the hub | each a BBI idea turned against the rule it taught (law 7): `bbi10-patra` (the old manuscript: the written leaves are rotten), `bbi10-chhata` (every parasol is open; a customer shuts it), `bbi10-bagudi` (the boys let it through, for a moment), `bbi10-pada` (the tower falls away from your edge: wait at the edge), `bbi10-dui-baja` (the drummer across the pit is the one out of step), `bbi10-deepa` (the lamps hang to the bridge: ride the wheel), `bbi10-tana` (a quiet loom, then a drummer who plays during the pose), `bbi10-udaya` (the stair rises only while you wait on the bank, and each spoke sinks), `bbi10-chheli` (the goat charges the straw on its way back), `bbi10-patta` (an honest painter, and the first pit's plank is rotten), `bbi10-thaka` (stop the well sweep low: the stone is a bridge), `bbi10-ghungur` (the bells hang from the frame and ring over the empty floor), `bbi10-phinga` (the server slows down: wait back), `bbi10-tantu` (the plain thread holds the motif: snap a coloured one), `bbi10-palaa` (the weaver holds the shuttle: step straight on), `bbi10-chakra` (the hub slides with the stone; the rim stays) | `bbi-stadium-gate`: plain (QA fix F4): the ribbon is already cut, walk in |

Every act has its own deaths recorded as MISTAKES (`DEATHS` in `tests/cities/bbi.ts`, built on the route up to the
act's start): the obvious play and, where the act has one, the obvious fix. Every act added in the second length
pass has both, with different causes and ticks (probe in `docs` of the length report).

Hidden items: dahibara (01, 10), chhena poda (02, 06, 09), tarakasi filigree flower (03, 04), podapitha (05, 07),
badi (08).

## Death causes (`causes.ts`)

`bbi-nala`, `bbi-turf`, `bbi-ball`, `bbi-rebound`, `bbi-rangapani`, `bbi-silk`, `bbi-peeled`, `bbi-lantern`, `bbi-agni`,
`bbi-jhala`, `bbi-kunda`, `bbi-jaanta`, `bbi-dhan`, `bbi-dhenki`, `bbi-sila`, `bbi-gadi`, `bbi-tenda`, `bbi-bail`,
`bbi-ranga`, `bbi-shuttle`, `bbi-rachh`, `bbi-nacha`, `bbi-thrown`, `bbi-kick`, `bbi-deepa`, `bbi-pakhala`,
`bbi-dhara`, `bbi-chakka`, `bbi-khai`, `bbi-ulta`, `bbi-udaya`, `bbi-ara`, `bbi-ghoda`, `bbi-roll`,
`bbi-patra`, `bbi-khali`, `bbi-chheli`, `bbi-sinha`, `bbi-sadha`, `bbi-chitra`, `bbi-sutra`,
`bbi-bagudi`, `bbi-chhuin`, `bbi-pada`, `bbi-bhanwar`, `bbi-roll-back`, `bbi-likhita`, `bbi-ghera`, `bbi-pathara`, `bbi-pani`, `bbi-dooba`, `bbi-ganna`, `bbi-mama`, `bbi-dhakka`, `bbi-kua`, `bbi-adha`, `bbi-ulta-gadi`,
`bbi-gadi-tala`, `bbi-saja`, `bbi-dauda`, `bbi-tantu`, `bbi-ganthi`, `bbi-badi`, `bbi-buda`, `bbi-ghurni`, `bbi-chamacha`,
`bbi-kachha`, `bbi-pothi`, `bbi-nala-lip`, `bbi-lob`, `bbi-chakka-room10`. QA fix round 1 (law 9): acts listed in
`OWN_CAUSES` (causes.ts) report their own cause for a shared hazard, so the finale's lines name the rule tonight breaks:
`bbi-ranga-palaa`, `bbi-rachh-palaa`, `bbi-nacha-dui` and the `-10` / `...10` finale causes.

## Route times (scripted route, no deaths), par, checkpoints

Third length round: repeat acts and the deck sweeper cut, the finale rebuilt so each callback breaks the rule it
taught, and only new decisions added. Stages that could not reach their floor that way stop short (LENGTH-2.md). Fourth round: 05 gains the belt and the uncle, 07 four acts from BBI-IDEAS-3 (gum-ta cut, ALLOCATION v3 I9), the finale
four more law-7 breaks, and 09 FIX deaths (LENGTH-3.md). Fifth round: ALLOCATION v3 rows F465-F467, F469, F470, F495
and five more finale breaks; replays brought under 7.5 s by the tester's lag-captured measure (LENGTH-4.md). QA fix
round 1 (FIX-1.md): five in-stage repeats and tenda cut, four doors made plain, the finale room breaks 02's keeper, and
every finale callback names its own rule when it kills you.

| Stage | Route | Floor | Par |
| --- | --- | --- | --- |
| 01 | 25.4 s | 25-35 | 30 |
| 02 | 26.4 s | 25-45 | 35 |
| 03 | 25.9 s | 25-45 | 32 |
| 04 | 29.3 s | 25-45 | 36 |
| 05 | 54.2 s | >= 60 (short) | 72 |
| 06 | 46.9 s | >= 60 (short) | 60 |
| 07 | 86.0 s | >= 120 (short) | 114 |
| 08 | 33.3 s | >= 60 (short) | 60 |
| 09 | 39.4 s | >= 60 (short) | 70 |
| 10 | 94.4 s | >= 90 | 114 |

Acts whose first checkpoint sat near a pit start with four tiles of plain ground (`LEAD` in `levels.ts`), so every
checkpoint passes the idle, run and tap-jump plays at lag 0, 6 and 12. The longest replay from a checkpoint to a
trap is under 8 s on every stage.

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

## Fix round 2 and QA round 2 (the state at merge)

- **F6 closed:** every scripted play (141 of them: NAIVE, FIX and every act's MISTAKES) dies with its own labelled cause
  at lag 0, 6 and 12 in the lagged-input model, and none stalls before its bait (lag-aware plays: press on distance,
  stop short and jump from standing, steer in the air). No act pair collapses to one cause or one tick.
- **Lines:** every death a walk, a hop, a long jump, waiting then walking, hopping every 0.3 s or backing off meets,
  from every part's start at lag 0/6/12, names what met that play; `ownCauses()` gives the finale's callbacks their
  own lines, so none teaches the rule the finale broke.
- **F7 closed:** from every checkpoint a walk or a tap-walk of 4.5 tiles meets nothing (deaths only past +4.7, the
  overshoot). **F8 closed:** the tour's FIX dies at the lip (`bbi-nala-lip`), not `bbi-nala`.
- **Checks at merge (QA round 2):** lag-captured sweep at lag 0/6/11/12 x idle 0/37/120/251, idle, run and tap-jump
  after every capture: 0 deaths, worst replay 7.24 s (03 m0); fair N=80 100/100 at 6/12 ticks on all ten, every
  stretch 100; no unscripted play gets alive past the end of an act it started in.
- **Hardening note (not blocking):** hopping every 0.3 s crosses several Raja acts (05 dhenki, gadi, khala, patra, bail,
  mama), 06 patta, the 08 room and 10 patra/patta, and dies in a later act; walking straight through crosses
  10 bagudi (its break is "walk straight through"). Raja's rule is "touch nothing", so a hopper that touches nothing
  is right there; a later pass can give those acts a hazard where a mindless hop lands.

## Notes for MECHANICS / WAVE1

- A jump off the sliding plinth keeps none of its speed (`solid.velX = 0`), so the hub is a straight jump up.
- One solid per Gotipua troupe, reshaped per pose (fewer solids, a faster world).
- The wet sari (06) uses the player's `launched` flag, like the shared launch pads: two fixed bounce speeds.
