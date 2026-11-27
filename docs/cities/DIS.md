# DIS · Dispur (Guwahati), Assam: the built city

Ten stages, built as a module (`src/game/cities/dis/`, routes in `tests/cities/dis.ts`), each on its slot in
`docs/allocation.json` (v2). Notes for the integrator's MECHANICS.md, CITIES.md and WAVE1.md entries.
Language: only lines the city bible marks VERIFIED (Omniglot Assamese), "Local | English".

## Stages

| Stage | Name | Slot family [betrayal] | What it is | Act(s) | Door ending (`meta.ending`) |
| --- | --- | --- | --- | --- | --- |
| DIS-01 | Nomoskar Guwahati (tour) | carrier-spills-on-contact [carrier-spill] | Luit riverfront tour. A tea boy walks the promenade towards you with a tray of lal chah that swings out in front of him. Touch him or the tray: scalded (`dis-spill`). Hop clean over him: the tray tips and you land in the tea (`dis-pool`). He stops at a bench to pour and sets the tray down: wait well back from the bench, and walk past him while he pours. A second boy comes from Fancy Bazar once you are up on the deck; stay up until his tray is down. |
| DIS-02 | Char | sandbars-relocate-by-level-post [level-post-relocate] | Sandbars move when the level post rises a mark. A siren raises it when you stand at its mark. New bars rise first (white dashed outline, then sand), a bar that stays but narrows narrows second (keeps its left end), bars that go sink last. Run-and-jump into a bar that isn't up yet: river. Wait on a bar for ever: it sinks. Wait on the narrowing bar's right end: river. | `dis02-chapori`: a Mising farmer's hut on a bar that never moves; the next bar comes up only after you land on the hut. `dis02-dhar`: two sirens, go to each new bar as soon as it is up. | `dis-hut-shut`: the door is the farmer's hut on the far bank, and he keeps it shut while the river is moving. Cross two bars, then wait at the hut till the water is calm. |
| DIS-03 | Duta Paat, Ekta Kuhi | plucked-row-steps-down [crop-floor-lowers] | Tea hedges taller than a jump. A plucker walks the path; at each hedge she stops and picks, her basket swinging all round her, and the hedge steps down to one step. Follow behind her. Run at her or hop over her: basket. | `dis03-bagan`: a sprinkler on the path; while it sprays and a little after, the path is wet and you slide, so you cannot stop behind her. Wait before the pipe till it is dry. | `dis-muga-reel` (reserve DIS-R2): the door is up on the bungalow verandah; a muga cocoon rides up on its reel, waits at the top, then is reeled in. Ride it up and step off at the top: stay on and you are reeled in (`dis-reel`). |
| DIS-04 | Talatal | collapsing-stair-penultimate-rises (v3 F448; repo label set-crepe-rolls-you-up until the integrator lands v3) | Talatal Ghar's stair down falls step by step as you go down; the bottom step is gone (`dis-talatal`) and the landing goes once it is done (`dis-doba`). Stop on the step before the last: it rises back, and from its top hop to the far side. Door: the laru plate (hop the rolling laru). |
| DIS-05 | Gamosa (HWIK, long) | gamosas-hide-feet-camera [overloaded-blind] | Every giver host who touches you puts a gamosa on you (shown as bands on Dad). With three, a long white-and-red cloth hangs over everything below your waist: you cannot see your feet, and the pit is under it. Give one away by walking into a host in a red sash on a machan (raised bamboo stage). Never by standing still (LKO-02 owns the bow). | `dis05-biya`: a wedding line, two givers then a taker, three times, then two pits. `dis05-atithi`: three givers, a taker, a pit; then one giver right before a pit: hop over him. | `dis-gamosa-latch`: the latch is a gamosa rope, and the door opens only if you hand it a gamosa: keep one. With none, a giver stands on the machan before the door. |
| DIS-06 | Majuli ka Paar | silt-behind-the-spur | Majuli's bank and the bamboo spurs: the slab in front of each spur goes early (`dis-bank`), silt builds a step behind it; the spur is only poles (`dis-porcupine`). Acts: the ferry's wake (shelter in the spur's lee) and the fish traps on pulleys (leave a ringing trap). |
| DIS-07 | Husori (marathon, lives: act) | join-moving-group-to-pass-gate [join-group] | Bohag Bihu carollers go house to house. Each bamboo gate opens only while the group is stopped at it and you are inside its circle (a dashed ring round the dhol); the shut gate's sharpened stakes kill. A gate that opened for you shuts a moment after you leave the ring. Run at the gate: stakes. | `dis07-ghar`: two houses a long walk apart (the slow walk is the momentum beat: you cannot hurry the group). `dis07-chowk`: three gates; at the middle one the host hands out gamosas first and the gate waits for him (go early: stakes). Tara tells the truth once here: "Lahe lahe, Dad? / Slowly slowly". | `dis-uruka-net` (reserve DIS-R1, no thatch): Uruka night at the pond before the door; a fishing net lies across it and the fishers pull it in from its near end. Cross it at once: stop on the net and you are hauled in (`dis-net`). |
| DIS-08 | Gorh (HWIK) | follow-flattened-strip [follow-flattened] | Kaziranga elephant grass: no floor under it, only beel. A jeep revs out in the grass (sound, and visible engine rings and a column of dust where it is: readable muted). A rhino charges straight at the dust, flattening a strip, and stops there. Walk in: beel. Wait at the edge of the grass for the strip: the rhino stops right there. Wait back, then walk the strip. | `dis08-kaziranga`: again from the far side; then the dust is ahead and the rhino starts BEHIND you on your own bank: jump up on the haystack platform and let it pass underneath. | `dis-watch-tower`: the door is up the watch tower's steps; after the last field the jeep by the tower starts up and the rhino charges at it from behind: straight up the steps. |
| DIS-09 | Rang Ghar | roof-curve-slides-stop-at-ribs [slope-ribs] | The Ahom pavilion's boat roof, oiled: on the shiny oil you are pushed down the slope faster than you can run, and landing on the oil shakes the gutter above, which drops a wooden ball (`dis-laru` sprite) on you. Ribs (one-tile wooden blocks) separate the oil. The grip pads (red-and-white) in front of each rib are the only still places. A hop at the rib lands on the oil: ball. Answer: stop on the pad, back to its start, run, one long leap over rib and oil. | `dis09-chaal` (push harder), `dis09-dhal` (steeper still). | `dis-royal-seat`: two more oil stretches, then the royal seat's bare wooden steps. |
| DIS-10 | Luit (finale, marathon, lives: act) | finale-level-post-far-bank [level-post-far-bank] | Callbacks only to DIS: the char sandbars again, but the level post stands on the far bank (you must remember the rule). | `dis10-tawa` (the pitha pan over the river), `dis10-bagan` (tea rows and the plucker), `dis10-gate` (husori gate with the host's ritual), `dis10-bank` (Majuli's slabs). | `dis-post-bank`: the level post on the far bank, and the only way over the water is the plucker's path: a bar rises under each of her steps and goes a few seconds later. Follow behind her and keep up. |

New death causes (all in `causes.ts`): `dis-spill`, `dis-luit`, `dis-basket`, `dis-tawa`, `dis-roll`, `dis-laru`,
`dis-gamosa`, `dis-bank`, `dis-gate`, `dis-beel`, `dis-gorh`, `dis-roof`, `dis-gutter`, `dis-reel`, `dis-net`,
`dis-pukhuri`, `dis-bordoisila`, `dis-hail`, `dis-bhoral`, `dis-khaal`, `dis-rope`, `dis-taat`, `dis-shuttle`.

Hidden items (`things.ts`): `dis-chah` (lal chah), `dis-japi`, `dis-paat` (two leaves and a bud), `dis-pitha`,
`dis-gamosa`, `dis-tenga` (masor tenga), `dis-pepa`, `dis-laru`.

## Length, round 2: every idea in its home stage

Rule: an idea lives in its home stage and may come back once, in the finale, as a callback that breaks the rule it
taught. The first length pass reused ideas across stages; round 2 cut every reuse and added new rules instead.

Cut: `dis05-char`, `dis05-husori`, `dis05-ghat`; `dis06-chapori3`, `dis06-ghat`, `dis06-char`, `dis06-pitha`,
`dis06-chang2`; `dis07-paar`, `dis07-ghat`, `dis07-lane`; `dis08-kohora` (a copy of `dis08-jeep`); `dis09-bihu`,
`dis09-chaal3`; `dis10-tawa`, `dis10-char`, `dis10-bagan`, `dis10-gorh`, `dis10-gate`, `dis10-ghat`, `dis10-chang`,
`dis10-bank`.

| Act | Stage | Rule (home) | Obvious play / obvious fix (cause) | Tara's line |
| --- | --- | --- | --- | --- |
| `dis05-taat` | DIS-05 | The host weaves your gamosa across a ditch: the cloth is the floor and grows with each pass; the shuttle flies along it at ankle height. | jump the ditch: `dis-taat`; wait on the cloth without hopping: `dis-shuttle` | "Olop! / A little!" |
| `dis07-bordoisila` | DIS-07 | Bordoisila, the April storm: the wind blows toward the pond, the hail follows; shelter under the bhoral (granary on stilts). The shelter beat. | walk on: `dis-bordoisila`; brace in the open: `dis-hail` | "Roba! / Stop!" |
| `dis07-dhol` | DIS-07 | The Bihu dhol: pond planks rise on each beat, the one behind sinks; the beat quickens. The momentum beat. | run across: `dis-pukhuri`; keep the first tempo: `dis-dhol-sink` (the plank sinks under you) | "Lahe lahe, Dad? / Slowly slowly, Dad?" (a lie) |
| `dis09-tug` | DIS-09 | The royal games in the Rang Ghar courtyard (bible idea 10): a tug-of-war rope is the floor over a ditch only while taut, and it drifts toward the winning team (referee's flag). | run on: `dis-khaal`; go as soon as it is taut: `dis-rope` | "Bhal, Dad! / Good, Dad!" (a lie) |
| `dis10-dhol` | DIS-10 | Callback to 07, broken: the tired drummer's beat slows. | run across: `dis-pukhuri`; keep 07's quick tempo: `dis-dhol-sink` | "Akou ebar? / Once again?" |
| `dis10-bordoisila` | DIS-10 | Callback to 07, broken: the old bhoral falls in the wind; jump the channel on the gust before the hail. | jump before the wind: `dis-bordoisila`; shelter under the bhoral: `dis-bhoral` | "Roba! / Stop!" |
| `dis10-tug` | DIS-10 | Callback to 09, broken: the teams have changed ends, so the red flag now means the rope is coming back. | run on: `dis-khaal`; go on red as in 09: `dis-rope` | "Moi najanu! / I don't know!" |

Kept from pass 1 because they are in their home stage: `dis05-biya`, `dis05-atithi` (gamosa), `dis06-majuli`,
`dis06-chang`, `dis06-chapori` (bank, one stilt house), `dis07-ghar`, `dis07-chowk` (husori), `dis08-kaziranga`,
`dis08-jeep`, `dis08-bagori` (rhino), `dis09-chaal`, `dis09-dhal` (roof), `dis10-gamosa` (the finale's gamosa
callback: a little hop over a giver lands you in the next one's arms).

One play: a room or act whose only trap is the whole room has one play. Its second wrong move meets the same trap, so it
is kept as a scripted death and is not counted as a FIX. The reasons are in `ONE_PLAY` in `tests/cities/dis.ts`:
rooms 01, 02, 03, 06; acts `dis05-biya`, `dis05-atithi`, `dis06-majuli`, `dis06-chapori`, `dis06-chang`, `dis07-ghar`,
`dis07-chowk`, `dis08-kaziranga`, `dis08-bagori`, `dis09-chaal`, `dis09-dhal`, `dis10-gamosa`. Every other act's
obvious fix dies to a different trap with its own cause.

Replay: the husori singers in 07 walk faster (56 px/s) and stay shorter at each gate (140 ticks; the ritual gate
120 + 240); the muga reel's cycle is 470 ticks; calm checkpoints before the reel (03) and on the plucker's bank (10); the `dis10-gamosa` checkpoint sits before the stall's reset, not just past it.

## Length, round 3: no second windows, new decisions only

Cut: `dis05-taat` (the loom: BBI owns it, and "a craftsperson builds the floor ahead of you" is taken); the second
windows of a room's rule, `dis02-dhar`, `dis04-tawa`, `dis05-biya`, `dis06-majuli`, `dis07-ghar`, `dis08-kaziranga`
(it also repeated `dis08-bagori`), `dis09-dhal`; with the 06 room's rework, `dis06-chang` (it was 06's own door
decision) and `dis06-chapori` (the slab clock). `dis05-atithi` and `dis09-chaal` stay as their stages' momentum beats.

Rooms changed: DIS-01 (the ghat lay-by was Patna 04's step-aside decision: now the tea boy pours at a bench) and DIS-06
(the slab clock was Kavaratti 08's don't-stop decision: now the bamboo spurs). New acts, from DIS-IDEAS-2:

| Act | Stage | Decision | Obvious play / obvious fix (cause) | Tara's line |
| --- | --- | --- | --- | --- |
| `dis07-dheki` | DIS-07 | On a husking lever worked by someone else's foot, stand on its pedestal; cross the tail while she presses it and the mortar while the pestle lies in it. Two women make a quick first fall. | hop the mortar: `dis-dheki`; wait on the tail: `dis-dheki-tail` | "Dheki-t bhori nidiba, Dad! / Don't put your foot in the dheki, Dad!" (U) |
| `dis07-card` | DIS-07 | The exit gate opens no earlier than the card's time; spend the time on the bench, off every deer corridor. | run to the gate: `dis-gate`; dawdle on the road: `dis-horin` | "Aagote nahiba, Dad. Card-ot likha ase. / Don't come early, Dad. It's written on the card." (U) |
| `dis10-thanda` | DIS-10 | Callback to 04, broken: the fire is out and the cook asleep, so matte is the floor and the shine is only oil. | step on the shine: `dis-tel` (one play) | "Zui nai, randhoni xuise. / No fire, the cook's asleep." (U) |

Checkpoints: the strict `tests/cpsafe.test.ts` (idle, run, tap-jump at lag 0/6/12) passes for every DIS stage. The 04
pan, both dhol ponds, 08 `bagori` and the 10 storm have three more columns of bank in front (`runUp` in `levels.ts`);
the 07 gate checkpoints sit 4.5 tiles back from the stakes; none is under the 07 bhoral during the storm; the 10
post-bank checkpoint is 5 tiles from the water, and none is on the plucker's path.

## Length, round 4: allocation v3

Rulings applied: S1 (the pitha room and `bhogali` are TAKEN by Daman's ice: 04 is now Talatal, and its door keeps only
the rolling laru), S8 (10's door: the bars rise ahead of the plucker and sink as she passes; go in front of her), S9
(07's door: the net is pulled in strokes; cross a stretch while the fishers rest, wait on the stake), S12
(`dis07-bordoisila` is a wind-direction read: stand in the granary's lee, not under it), I5 (`dis07-dheki` is cut; its
v3.1 re-skin, the jute rope-walk, is not built yet), F453 skipped (Kavaratti's), W5 (05 `atithi` and 09 `chaal` stay as
labelled momentum beats).

| Act | Stage | v3 family | Decision | NAIVE / FIX (cause) |
| --- | --- | --- | --- | --- |
| DIS-04 room | 04 | F448 collapsing-stair-penultimate-rises | Keep ahead of the falling stair and stop on the step before the last: it rises back. | race to the bottom: `dis-talatal`; wait at the top: `dis-doba` |
| `dis05-sanko` | 05 | F452 remembered-gap-is-bridged | Blind under three gamosas, walk the nala you remember: a bamboo has been laid over it. | jump it: `dis-beam`; back off: `dis-pit` |
| `dis05-feast` | 05 | F449 pickup-row-is-floor | The feast on banana leaves is the floor: walk it, never jump for a pitha. | jump for one: `dis-kol-paat`; jump the row: `dis-pit` |
| `dis05-machan` | 05 | F450 scaffold-deadline-collapse | Keep up with the planking and be off before the drum roll drops it. | wait on the last plank: `dis-machan`; run ahead: `dis-luit` |
| `dis06-wake` | 06 | F454 refuge-not-flight | Shelter in the spur's lee and let the wake pass. | outrun it: `dis-dhal`; hop it on the undercut bank: `dis-bank` |
| `dis06-traps` | 06 | F456 bell-names-the-moving-platform | Leave a ringing trap for a silent one; a trap just let down is slack. | stand on it: `dis-dirru`; hop at the ring: `dis-tip` |
| `dis07-goru` | 07 | F458 pause-before-charge | When the bull stops and lowers its head, get out of its lane sideways, on to a verandah step. | stand your ground: `dis-goru`; pass it while it walks: `dis-goru-lane` |
| `dis07-tekeli` | 07 | F460 shout-steers-hazard | The blindfolded man swings where the crowd shouts: stand where they are not shouting. | stand still: `dis-lathi`; run through on the shout: `dis-lathi-ghur` |
| `dis08-duijeep` | 08 | room twist (v3 08 row) | The rhino charges the nearer noise, not the louder: stand off the end of the near jeep's strip. | wait at its end: `dis-gorh`; walk toward the loud jeep: `dis-beel` |
| `dis09-sluice` | 09 | F463 bell-opens-the-sluice | On the bell be up on the embankment; go once it drains, before the next. | run the channel: `dis-sluice`; stay up too long: `dis-roof` |
| `dis10-talatal` | 10 | callback (breaks 04) | The steps fall bottom-first: race straight down. | stop on the penultimate as in 04: `dis-doba` (one play) |

`dis10-thanda` (the cold pan) went with 04's shine rule.

## Length, round 5: the rest of v3 and v3.1, and a Talatal act

Every v3/v3.1 row assigned to DIS is now built (F453 stays withdrawn). New in round 5:

| Act | Stage | Family | Decision | NAIVE / FIX (cause) |
| --- | --- | --- | --- | --- |
| `dis02-bhutbhuti` | 02 | F447 false-cue-among-true | The ferry's horn sounds like the siren but the level post does not move: stay, walk back along the narrowing bar, hop at the real siren. | hop on the horn: `dis-luit`; wait it out at the far end: `dis-char-sink` |
| `dis04-batah` | 04 | Talatal's own place (round 5) | Of three stairwells down, go down the one your lamp's flame leans toward: the lit one is the flooded vault, one dark one has fallen in. | the lit well: `dis-kup`; the first dark one: `dis-garh` |
| `dis05-kaath` | 05 | F451 spike-slides-under-jump | Each split slides when you jump at it: hop short on to where the first was, then over it where it stopped; don't wait for it to settle. | an ordinary hop: `dis-kaath`; wait: the wife's third gamosa, `dis-gamosa` |
| `dis06-flag` | 06 | F455 marker-moves-floor-stays | The flag moves twice as the river rises, the gangplank stays: hop the ghat man and run-jump from the plank's end to the bank. | hop to the flag: `dis-luit`; go where it was: his third gamosa, `dis-gamosa` |
| `dis07-pepa` | 07 | F457 (the marathon's sound beat) | The leaving group won't stop: wait back from the gate and go through in the coming group's ring. | run after it: `dis-gate`; wait under the gate: `dis-stakes` |
| `dis07-rope` | 07 | v3.1 re-skin of the dheki | Cross from the anchored end; never wait at the moving end. | walk straight across: `dis-pat`; wait at the twisters' end: `dis-paakoni` |
| `dis07-cart` | 07 | F459 treat-trail | Never stop on the rolling cart: walk forward and jump up on to the jetty. | stop for a pitha: `dis-herd`; run off its front: `dis-pukhuri` |
| `dis08-bogoli` | 08 | F461 birds-up-means-charge | Cross while the egrets sit on the hidden rhino; wait at the edge while they are up; don't wait a whole round. | go with them up: `dis-bogoli`; a whole round: `dis-jui` |
| `dis09-tunnels` | 09 | F462 portal-chain-backwards | Walk the chain of tunnel mouths: step, wait for the grate, step; on the last pier wait for the bridge. | the oiled beam: `dis-roof`; run on: `dis-vault` |

## Fix round 1 (QA round 1 F1-F7): the current state

This section supersedes the tables above where they differ.

- **Doors (F1):** the 02 (`dis-hut-shut`), 03 (`dis-muga-reel`), 07 (`dis-uruka-net`), 08 (`dis-watch-tower`) and 09
  (`dis-royal-seat`) doors are PLAIN: the road ends at the door and you walk in. Each re-asked an act or its room, and no
  replacement passed the registry gate. The 04 laru plate, 05 gamosa latch, 06 tea ladder and 10 plucker's path stay.
- **Cut (F2, F5):** `dis07-bordoisila` (a fixed wind made it shelter-and-wait, `dis06-wake`'s decision; S12's
  fallback) and its callback `dis10-bordoisila`; `dis10-gamosa` (05's rule with new spacing). 07's stage FIX is now
  the dhol's (`dis-dhol-sink`).
- **The finale room (F5)** breaks 02: with the post on the far bank, the bar in front sinks first and the new one rises
  after it (`SandField.flip`). Wait on the bank. Standing on the sinking bar: `dis-ulta`; jumping for the outline
  before it is up: `dis-agot`.
- **Lines (F4):** one cause per mistake. `recause()` (in `entities.ts`) gives an act's deaths their own cause while Dad
  is inside the act, so a callback or a reused hazard names what killed him there. New: `dis-ulta`, `dis-agot`,
  `dis-doba-ulta`, `dis-talatal-ulta`, `dis-pukhuri-lahe`, `dis-dhol-lahe`, `dis-khaal-ulta`, `dis-rope-ulta`,
  `dis-basket-ulta`, `dis-path-agot`, `dis-card-gate`, `dis-pepa-gate`, `dis-cart-pukhuri`, `dis-sluice-tel`,
  `dis-tel-gola`, `dis-flag-luit`, `dis-ghat-gamosa`, `dis-kaath-gamosa`, `dis-machan-luit`, `dis-sanko-pit`,
  `dis-wake-bank`, `dis-bhutbhuti`, `dis-gorh-adha`. Dead lines (dheki, cold pan, crepes, reel, net, Bordoisila) are gone.
- **Tells (F7):** 04 has a tile-high lantern whose flame stands straight over a still well and streams toward the one
  that draws, and dust that pours down that well only; the gallery is a brick vault. 08's egrets are a flock of six
  big birds.
- **Checkpoints (F6):** 03's are only where you wait for the plucker (room 10, bagan 0.5 and 14.5).

The SandField has a timed mode (`go(w, silent)`) for 02's horn act; nothing else uses it. The chaser in `kaath.ts` and the
ghat man in `flag.ts` are DIS entities (givers that move).

## Fairness (`LDD_N=80 npm run fair -- DIS`)

Fix round 1 (`LDD_N=80`, lag 6 / 12 / 18 ticks; every stretch and door is 100% at 0-12 ticks):

| Stage | 6t | 12t | 18t |
| --- | --- | --- | --- |
| DIS-01 | 100 | 100 | 100 |
| DIS-02 | 100 | 100 | 84 |
| DIS-03 | 100 | 100 | 100 |
| DIS-04 | 100 | 100 | 100 |
| DIS-05 | 100 | 100 | 76 |
| DIS-06 | 100 | 100 | 76 |
| DIS-07 | 100 | 100 | 80 |
| DIS-08 | 100 | 100 | 100 |
| DIS-09 | 100 | 100 | 100 |
| DIS-10 | 100 | 100 | 76 |

## Look and sound

Palette from the bible (humid green-grey sky, tea-green hills, river-sand tiles, gamosa red and white). Backdrop
`dispur()`: Kamakhya hill as a plain green silhouette (no temple drawn), the wide Luit with pale sandbars,
Umananda islet with trees, the Saraighat steel truss, flat-topped tea rows with shade trees. Ground caps:
riverbank sand with tea-green tufts. Music: Bihu feel, 120 bpm, major pentatonic, a dhol theka. Postcard:
"The river moves the islands. The dhol moves everyone else."

## Notes for MECHANICS / WAVE1

- A moving carrier who spills on contact or on being jumped, and swings his load behind him over the ghat (DIS-01).
- Sandbars placed by a numbered level post; a siren raises it; new bars first, narrowing second, sinking last (DIS-02). In the finale (DIS-10) the post is on the far bank and the order is turned round: the bar in front sinks first, the new one rises after.
- Floor that is a crop, stepping down only when picked; a picker whose basket swings while she picks (DIS-03).
- A stair that falls step by step as you go down; the step before the last rises back (DIS-04, Talatal). The door is the laru plate: hop the rolling laru.
- Gifts that blind: three gamosas hide your feet; give back by walking into a taker (DIS-05).
- Bamboo spurs on an eroding bank: the slab in front of a spur goes early, silt builds a step behind it (DIS-06).
- Gates that open only for a moving group with you inside its ring; the host's ritual delays one (DIS-07).
- A charging animal that makes the only floor, charging at a visible-and-audible lure (DIS-08).
- Oiled roof: push down the slope, ribs and grip pads, landing on oil drops a ball (DIS-09).
- A path that exists only under a walker's feet, for a few seconds (DIS-10's door).
- Tara lies with "Bhal, Dad! / Good, Dad!" at the trap in 01-05, 08, 09 and "Lahe lahe" (slowly) on the bank in
  06; she tells the truth once, in DIS-07 ("Lahe lahe": walk slowly with the singers).
