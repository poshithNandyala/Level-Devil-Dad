# BBI ideas v3: new decisions for the 07 marathon (Gotipua night)

Research only, 2026-11-27 (09:35-10:30 IST, independent of IDEAS-2). For the builder of `city/bbi`. Game facts come
from `ldd-wt/bbi/docs/MECHANICS.md` and `AGENTS.md`, `ldd-inbox/docs/ALLOCATION.md` (BBI block, section 4 almost-used
table, section 5 conflicts), `docs/cities/BBI.md`, `BBI-IDEAS-2.md`, `reports/cities/bbi/LENGTH-2.md` section C, the ten
BBI stage files (`s01.ts`-`s10.ts`, `causes.ts`, `levels.ts`), and the acts on the open branches read from their
`advice:` strings and header comments (`ldd-wt/{lko,ccu,dis,gtk,svp}/src/game/cities/<city>/`) and new-idea notes
(`ldd-wt/{kvt,tvm}/docs/cities/{KVT,TVM}.md`; PAT's acts are already in MECHANICS.md). Place facts: VERIFIED only where
a source was read; everything else UNVERIFIED (U). Odia lines: V only when on the BBI.md Omniglot list.

**Where 07 stands (LENGTH-2):** 65.2 s of a 120 s floor; the shipped acts are the room (poses on the drum's stop, thrown
at the restart), `bbi07-mardala` (bank between two troupes), `bbi07-deepa` (lamps: only the bridge goes under),
`bbi07-bandha` (bridge lasts only the walk; wheel up to a high bank), `bbi07-dui-baja` (follow the far drummer, read his
sticks), `bbi07-bagudi` (tagged: back over the chalk line), `bbi07-pada` (the tower falls toward you: wait by the scuffs),
`bbi07-shrinkhala` (three troupes, no bank, no stopping: the momentum beat), `bbi07-dweepa` (lamp plinth island: the
shelter beat), and the gate-pose door. IDEAS-2's C1-C4 were rejected because their decisions are DIS-07's dhol planks,
LKO-07's test flash, DIS-09's taut rope and the cut broom's "follow it away".

**The test applied here.** A candidate counts only if the one sentence the player must work out is not in list A. "The
same experience under a new skin" fails even when the nouns differ (AGENTS.md bar 1). Each act below names the nearest
line of list A and says, in one sentence, what is different; where the difference is thin, the act says so.

---

## A. Already asked: every decision the game already poses (check the builder's act against this)

One sentence per decision, with the id. Shipped cities are condensed from MECHANICS.md (stage ids; act ids in
back-ticks where MECHANICS names them); BBI's own stages and the open branches are from the code.

### A1. Shipped cities (MECHANICS.md)

**TVM (Thiruvananthapuram)**
- TVM-01 `Launch`/boosters: don't wait where the rocket's spent stage (and now its first stage) comes down; a soaked road holds a walker and breaks under a hop (reverse of the old cave-in); a floor that drops ahead comes back if you wait, the far side breaks if you jump (`gapAhead`+`noLanding`); wade the ditch, a jump brings spikes up on its far side; the `Tarp` empties when you come near, so back off and let it; a `Puddle` drawn like the wadeable ditch is a pothole; compound-wall glass: a hop puts more glass on the road.
- TVM-02: one bell brakes and slides you forward, two bells jerk off and slide you back (a sound code moves the vehicle); flyover `Slab`s fall where you ride, dark cracks are the tell; the kite glides over a dad who stands and takes one who hops.
- TVM-03: the tea pour starts the moment you leave the steam; a scooter from behind, then one head-on; the door hops over you and the way back is broken glass; the tea master's double pull.
- TVM-04: fronds over a retting pit are a fake floor; a far bank that backs away from your jump (`shyLedge`); the coconut drops on whoever stops under a palm (and the last palm keeps one back for the dad who follows the wave).
- TVM-05: a second portcullis drops as you pass the first; a sleeping dog growls as you land past the spikes so the flinch back meets them; moat mud at the bank's edge goes when you land on it.
- TVM-06 `Counterweight`: the net's counterweight slams down when you step off the net; the swell crashes over the edge while the first net is down; Tara tells the truth once you've learnt she lies.
- TVM-07: hairpin jeeps and mist pits; a rock comes down where you'd stop to let it fall, its pebbles first.
- TVM-08: snake boats under low bridges; hidden spikes on the deck come out when you hop at it; finish-jetty spikes sink back after a moment with more where a hop over them lands; read the bridge, not Tara.
- TVM-09 (branch) `tvm09-*`: the lifeguard's two flags are the only dry sand; he moves them before every wave; the strip he just left is the rip. Door `tvm-backwash-ride`: step in as a wave runs out and the backwash carries you.
- TVM-10 (branch) `tvm10-*`: dhara pots on crooked arms drip oil beside the hook, not under it; oily feet slide, no jump; each callback breaks the rule it taught (soaked ground between you and the flags, a coir mat wipes your feet: walk it, don't jump it). Tour bite `tour-tvm-b4`: an ice slab twitches, then is yanked out from under whoever stepped on after the twitch.

**KVT (Kavaratti)**
- KVT-01 `Nest`: the hatch spreads wider than a jump, so you wait and never touch a baby; tour bite `tour-kvt-b8`: the coral step shrinks with the tide to a one-tile top: wait at the water's edge, hop on and off.
- KVT-02: jetty planks give way under a dad who waits on them; see-through water (`kvt02-glass`).
- KVT-03 `kvt03-faith`, KVT-04 tailwind (`kvt04-tailwind`), KVT-05 lift, KVT-06 swim with an air meter past eels, KVT-07 climb bending palms with crabs, KVT-08 run on water, a sandbar that goes under when you stop, dolphins and weed.
- KVT-09 (branch) `kvt09-*`: storm rubble slides every landing one tile toward the lagoon: walk to the far end of each step and tap up; under a rock lip a full leap kills; over the summit walk off, never hop down; a sea wall whose first break is a deep heap and whose second is one loose block to jump whole; a ridge: land in the middle. Door `kvt-buried-door`: three hops clear the door, a fourth tips the heap and you.
- KVT-10 (branch) `kvt10-*`: an octopus is the coral head whose speckles drift (the thing that twitches is the creature); the shell-ringed hole is rock, the bare hole goes through; each callback breaks its rule (rotten plank is the way down, the far tile is an octopus, nest behind you run on / ahead wait, high tuna walk under / low tuna hop, crab in the crown, morays strike twice, tailwind then headwind jump in the calm, step off the dolphin coming down, step on after the beam passes, 7 heads sink if you stop, the reef rises only for a jumper, the basket doesn't stop at the bottom, cracked glass holds only at a run, the boat is not coming back). Door `kvt-sand-arm`: the sand that ripples is the arm.

**CHN (Chennai)** CHN-01 `PongalPot`: the spill runs past where it started and a foam spout covers any jump, so back off; CHN-02 queue places; CHN-03 frogger; CHN-04 cricket; CHN-05 heat mirage exit; CHN-06 jasmine crowd push; CHN-07 nodding dolls capstone; CHN-08 train roof on a lifting bridge.

**PDY (Puducherry)** PDY-01 `Kepi`: the way through is to help him, catch his cap as it blows over you; PDY-02 rock pools and waves; PDY-03 canal-bridge signs/opinions; PDY-04 closing time; PDY-05 raft; PDY-06 tide and palms; PDY-07 waves; PDY-08 Bastille rooftops sparks and parade.

**BLR (Bengaluru)** BLR-01 `LoadingBridge`: loads to 99% and restarts with you on it; BLR-02 green-man badge; BLR-03 metro viaduct opening soon; BLR-04 jam; BLR-05 glasshouse remote; BLR-06 powercut lights; BLR-07 crusher; BLR-08 falls curtain.

**AMR (Amaravati)** AMR-01 `Aunty`/`FULL_PHYS`: being fed shortens your jump for a few seconds; AMR-02 chilli powder clouds; AMR-03 barrage gates, watch your feet (logs); AMR-04 tar road, roller, heat; AMR-05 humps; AMR-06 rope bridge zip; AMR-07 cave dark gallery; AMR-08 ropeway shack.

**HYD (Hyderabad)** HYD-01 Irani chai tour; HYD-02 shadows: catch something by its shadow; HYD-03 biryani cooker bait; HYD-04 shy autos and statues that move when you don't look; HYD-05 kites as height caps; HYD-06 echo: clap and the echo answers; HYD-07 bangle boxes shuffle; HYD-08 film-set retake.

**PNJ (Panaji)** PNJ-02 gossip bubbles as drifting one-way platforms; PNJ-03 football ground/volley/header; PNJ-04 siesta: don't wake sleepers, stealth landings; PNJ-05 toddy ropes recoil; PNJ-06 roulette colour-gated floors; PNJ-07 towed parasail altitude; PNJ-08 musical-chairs freeze on floats.

**BOM (Mumbai)** BOM-02 walkway/treadmills; BOM-03 packed train shoves you out, wire; BOM-04 monsoon manholes and rising water; BOM-05 last train doors; BOM-06 wet paint, wall kicks on chawl walls, spikes; BOM-07 carry the dabba without jumping, Holi relay; BOM-08 a twin that mirrors you, together.

**DMN (Daman)** DMN-02 pedal boat driven by running; DMN-03 melting slippery ice; DMN-04 plank passed hand to hand (`dozer`); DMN-05 mash-to-haul rope ferry and tide; DMN-06 balance scale lifted by crates, being weighed; DMN-07 painted path that fades behind the brush; DMN-08 Diu fort tricks.

**GNR (Gandhinagar)** GNR-02 kite pole vault, run-up height; GNR-03 swinging sunbeams; GNR-04 shockwaves, doubled where two meet; GNR-05 lions stalk only while your back is turned; GNR-06 feather flaps, mud you can't jump from; GNR-07 dance rings crossed at their ends, join one; GNR-08 scrolling candle chart, platforms rise when you jump.

**JAI (Jaipur)** JAI-02 puppet strings: beat-forced hops, no jump of your own; JAI-03 pot tower on your head sways; JAI-04 pump a swing to fly out; JAI-05 roll inside a bangle with momentum, over glass; JAI-06 dummy horse never stops, rear to turn; JAI-07 balloon steered by choosing the wind at each height; JAI-08 drive the elephant, she follows and tosses you.

**BPL (Bhopal)** BPL-02 skip like a stone at a run; BPL-03 two worlds switched at stencils; BPL-04 a trailing thread you may never touch again, you are the needle; BPL-05 bowls bounce harder each use until dry; BPL-06 tall tales come true a moment later; BPL-07 carried iron and crane magnets; BPL-08 lake; BPL-09 (encore) rockfall wave with overhang refuges and a second wave past the last one.

**RPR (Raipur)** RPR-02 stilts: mud-proof, land slowly; RPR-03 time passes only while you move; RPR-04 pour rice into hills you climb; RPR-05 spinning tops kept up by landing on them; RPR-06 stand still to become a cocoon (hornets can't, hawks can); RPR-07 ant bridges come to you and bite; RPR-08 chariot pull.

**RNC (Ranchi)** RNC-02 dhuska come up as platforms, get flipped (throwing whatever stands on them) and scooped; RNC-03 arrows stick in the straw boss as steps, pulled out on the whistle; RNC-04 lightning hits the tallest thing under the cloud, thunder lifts rugra one step behind; RNC-05 Chhau masks make dancers take you for that character; RNC-06 the lost-wax mould is hollow between wax out and brass in, tip the crucible to cast your own step; RNC-07 a long fall on to rock kills, counted from the top of your jump, inside the falling water you sink slowly; RNC-08 the storm over the falls makes you the tallest thing.

**PAT (Patna, branch, in MECHANICS)** PAT-01 the crowd surges along the road to the tempo, climb the kerb board; PAT-02 the poker digs where the ash cracks, follows a rolling litti (`pat02-chokha`, `pat02-bhatti`); PAT-03 hoardings swap for banners whose width shows in the roll above (grows from left / pulled taut to right / narrows from right: `pat03-batch`, `pat03-patti`); PAT-04 porters come down the stair you climb, a second steps out of a landing door, grain rises in the dome (`pat04-anaaj`, `pat04-sidhi`); PAT-05 pontoon sections sink under the rolling handcart, jump the cart's section, porters load sacks whose second one slides along its rope (`pat05-ghat`, `pat05-sangam`, `pat05-bori`); PAT-06 count the sacks on the parked truck: plates numbered a multiple of it are tarps, the count changes truck to truck, trucks lift plates, the count that counts is the one left when the porter has finished (`pat06-sau`, `pat06-nau`, `pat06-gaadi`, `pat06-ginti`); PAT-07 the tempo deck leans to the heavier side, scrape an arch or hump while leaning and die, a third tempo backs into the lane (`pat07-sadak`, `pat07-adda`, `pat07-pul`, `pat07-haat`, `pat07-mandi`); PAT-08 each hatch leads to the cell with the same brick count, the others have a well (`pat08-chowk`, `pat08-vihara`); PAT-09 the crowd parts only behind a horse rider (who turns back), occupied gondolas swing you off (`pat09-jhoola`, `pat09-ghoda`, `pat09-wapsi`); PAT-10 one sack count rules the part (`pat10-*`). Doors: pestles pounding, bell-rope pendulums, a door leaf swinging across the road, the last float drifting off with the door, a toll strip slamming a boom, a hauled basket whose rope slips, decoy hatches and a zero-brick door, a four-armed turnstile, the pad numbered n.

**Kit, hazards and door endings (MECHANICS):** springs/spouts, blinkers (timed platforms), gusts, geysers, cascades, rollers, riders, shots, arcs, mist, rising floods with floaters, treadmills, trains/shuttles, crumbling/dropping/shy/fake floors, pop-up spikes, rising walls, ceiling drops, chasers, coconuts/rockfall, heat shimmer (fake road), bending palms, tilting gangway, hammock counter, clock-hand lift, manja height caps, thorn branches, forest gates, window breezes, broken glass, half-shut shutters, sword dancers on a count, rockets on a fuse. Every door ending in the MECHANICS list (knock, loading, reflection, glider, trapdoor, token, bull, catch, rangoli, tips, shuffle, mirror, lamp (a door only there in a timed window), bells, mime (chalk squares), fakewin, revolve, pull, wrap, invisible, cctv, key, swing, mirchi, speed, monkey, dejavu, whirlwind, otp, biryani, gravity, tiny, cannon, backdoor, slowmo, bollywood, kabaddi, dahihandi, credits, safetystop, pushoff, footsteps, local, lightwell, dabbacode, poder, penalty, clockhand, hammock, gangway, sandcastle, decree, customs, coldstore, flag, drawbridge, slidedoor, paintwall, tipjetty, setu, jali, milan, safari, kichad, pravesh, herd, sutradhar, toran, shant, naap, dulha, palat, salaami (a toss up on to a gate), ghat, haath, gaanth, khaali, paan, rakhdo, kissa, utar, ghanta, khisko, lattu, reel, gud, rath, ulta, nishana, tadit, chehra, kataar, khoh, dwar, pat-*) is taken under any name.

**Allocation owners a 07 act must not touch (ALLOCATION.md section 4):** bow or stand still to be polite (LKO-02); stand still and someone holds you or the space closes (CCU-08, BBI-04, AIZ); a crowd as a floor or a gap you follow (PAT-10, LKO-07, DIS-06, CCU-07, SVP-10); a pattern decides what is solid (LKO-04; BBI-06 kept because beats decide); a person builds or covers the floor ahead (CCU-09); being fed (AMR-01); a conductor's signal moves the vehicle (TVM-02); floor tilts or sinks toward weight (PAT-04, PAT-07, SVP-07); light direction (LKO-05); the sun as clock (SML, LEH, CHP); a moving reveal of invisible floor (DDN-06); fog (GTK-07); swaying bridge (SHL-08); hang from wires (DEL-06); floats that sink under load (PAT-04); churn (CHP); wrestler (CHH); flock (SML, LKO); peeling layers (JMU); sweeping brush (GTK-01); animals or crowd follow what you carry (SVP-04); a door that opens one way (IMP); a drum beat moves dancers (BBI-07 itself, KOH-02); a downhill ride (SXR, KOH); a turning wheel as platforms (BBI-09, clockhand, RPR-05, BLR cogs); sorted by size (CCU-03); decoy twin, fake floor, shelter trap, delayed second trap as bare types (B1, B35-B37); read a number or a count (GTK-04, IMP-05, PAT-08, SXR-04, PAT-06); escalator or lift (SML, CHN encore).

### A2. BBI's own ten stages (from `s01.ts`-`s10.ts`, `causes.ts`)

- BBI-01 room: the gardener's jet follows the dad who waits; pass while he faces his pots; a second gardener left one wet tile at the drain's lip (`bbi-nala`).
- BBI-02 room: ride the keeper's back pad, let the rebound go, then step off (`bbi-turf`, `bbi-rebound`); `bbi02-chhal`/corner: cross the stopper's spot while the ball sits still (`bbi-ball`); `bbi02-dive`: the same ride, longer; door: a roll only takes turf, the ugly bare strip is the safe ground, rolls from both ends (`bbi-roll`, `bbi-roll-back`).
- BBI-03 room: a parasol opens only when a customer comes to its shop; only the cut-out sewn on top holds, the silk slides (`bbi-rangapani`, `bbi-silk`); `bbi03-gali`: shoppers come back the other way, the far parasol opens first; `bbi03-mela`: he sells the cut-out you stand on, so don't wait, go as the next opens (`bbi-peeled`); door: stop short as the lantern comes down, walk under when it goes up (`bbi-lantern`).
- BBI-04 room: standing still half a second builds a glowing curl ahead (a wall on the bench, a bridge over a gap): keep moving through the torches, stop only at the quench trough (`bbi-jhala`, `bbi-kunda`, `bbi-agni`); `bbi04-karkhana`: a torch over the second trough's middle; door: your standing builds the step up to the box.
- BBI-05 room (HWIK): nothing moves unless you start it; touch nothing, the plain way is always there (`bbi-jaanta`, `bbi-dhenki`, `bbi-sila`, `bbi-gadi`); `bbi05-dhenki`, `bbi05-gadi`, `bbi05-khala`: the same rule with the mill, cart and pounder close together; `bbi05-tenda` (act6): the rule goes stale, start the lift on purpose and step off at the top (`bbi-tenda`); act8 fling mill: start it on purpose, stand on its far half (`bbi-dhan`); act9 `bbi05-bail`: touch the cart, step back, follow well behind to the gate; `bbi05-chheli`: jump only when the pounder lies flat and the goat is on your side (`bbi-chheli`, `bbi-sinha`); act11 Talapatra: wait for the soot, the written leaves hold, blank ones are rotten (`bbi-patra`, `bbi-khali`); `bbi05-thaka`: stop the sweep yourself, when the stone is at its top (`bbi-pathara`, `bbi-pani`); door: the way in is below, behind the step; the roller starts when you land by it.
- BBI-06 room: count the beats, one in five the patches line up; let the shuttle pass first (`bbi-ranga`, `bbi-shuttle`); `bbi06-tana`: shuttle across and back; `bbi06-sidhi`: the motif is a staircase; `bbi06-rachh`: be off before the beater sweeps (`bbi-rachh`); `bbi06-sutra`: one thread is undyed, the motif has a hole, hop it after the shuttle (`bbi-sutra`); `bbi06-patta`: each painted panel shows the NEXT pit, not the one beside it (`bbi-sadha`, `bbi-chitra`); door: the warp curtain parts into the door shape only on the motif beat (`bbi-tana`).
- BBI-07 room: while the drum plays nobody holds still, wait for a pose; go the moment the drum stops, be off before he lifts his sticks (`bbi-nacha`, `bbi-thrown`); `bbi07-mardala`: rest on the bank between two troupes; `bbi07-deepa`: under the lamp string the wheel's top puts your head in the lamps, only the bridge goes under (`bbi-deepa`); `bbi07-bandha`: the bridge lasts only the walk, be at the edge when the drum stops; only the wheel is tall enough for the high bank; `bbi07-dui-baja`: the troupe follows the drummer across the pit, not the one by you, and his sticks are the warning; `bbi07-bagudi`: tagged, run back over the chalk line to pass it on; hopping him is a tag too (`bbi-bagudi`, `bbi-chhuin`); `bbi07-pada`: the tower falls toward you and its top lands on the edge, wait back by the scuffs and go the moment it lands (`bbi-pada`); `bbi07-shrinkhala`: three troupes, no bank, each stops as you reach his part, no stopping anywhere; `bbi07-dweepa`: rest on the lamp plinth, not on a pose; door: walk under the gate pose as soon as the drum stops (`bbi-kick`).
- BBI-08 room (HWIK): the rice is floor until the jug tips, stand on a badi first; the second jug pushes the badi by the right rim under, be on the middle one (`bbi-pakhala`, `bbi-dhara`); `bbi08-bhanwar`: the water carries every badi to the hole, hop to the far rim at the last moment (`bbi-bhanwar`); `bbi08-dati`: feed the drain, hop to the other badi so yours plugs the hole; `bbi08-kansa`: both jugs at once, the middle badi only; `bbi08-dui`: jugs held over two of four badi; door: the leaf plate turns over at the door's side, step off before.
- BBI-09 room: the wheel never turns, the plinth slides; start the chariot from the horses and wait on the hub (`bbi-chakka`, `bbi-khai`); `bbi09-ara`: spokes sink in order, climb steadily (`bbi-ara`); `bbi09-ratha`: a longer chariot; `bbi09-ulta`: from the hub go straight up on to the wall, the plinth sinks (`bbi-ulta`); `bbi09-udaya`/`bbi09-asta`: spokes rise one at a time, wait on each until the next is up (`bbi-udaya`); door: don't touch the horses, jump over the near one into the gap (`bbi-ghoda`).
- BBI-10 (callbacks turned round): `bbi10-chhata`: every parasol is open, the customer is what shuts it; `bbi10-tana`: a quiet loom, then a drummer who plays during the pose and stops for the whirl; lamps hang to the bridge, the wheel rides above; the old manuscript's written leaves are the rotten ones (`bbi-likhita`); the near drummer is the one to follow; the tower falls away from you, wait at the edge; the boys let "it" through for a moment (`bbi-ghera`); door: wait while the scissors close, walk through as they open (`bbi-kainchi`).

### A3. The open branches this week (acts not yet in MECHANICS.md)

**LKO (Lucknow)** `lko02-gali`: stand still and let the gentleman go first on to the loose stone, hop his hole; `lko02-takrar`: keep bowing until he gives up; `lko02-aadaab`: one short bow, no bow is a shove, bowing on is "pehle aap"; `lko03-kunda`: run each print without stopping, the washer whistles after you step; `lko03-adda`: the hoop clamps down on the NEXT flower, don't wait there; `lko03-rang`: the dipped half holds only when up, cross it in one go; `lko04-chowk`/`lko04-badal`: only cups in shadow hold, shadows shorten with the sun, a cloud's shadow travels; `lko05-tawa`/`lane`/`ulta`/`bhara`/`ghee`/`dum`: hop off a squashed kebab at once, walk the squash lane right behind the squash, wait for the cook's press from his end, keep your heap full by stepping between a pair, hop while the ghee sizzles, count the squashes on a double heap; `lko06-tatkar`/`mehfil`: go where she isn't tapping, wait on a takht till she spins past going away; `lko07-shaam`: run the awning row without stopping; `lko07-batti`: pass under the lamplighter's ladder while he is up it; `lko07-chauraha`: pause so strollers part, then run; `lko07-julus`: walk behind the procession at their pace, pausing as they do; `lko07-photo`: run through the dazzled group on the flash, the second photographer's short test flash first; `lko07-chhidkav`: wait on the pillar's far side, cross just after a throw; `lko07-kohra`: don't stop for greetings in the fog; `lko08-mehrab`/`minar`/`utar`/`wapas`/`upar`/`roshandan`: walk through a low arch, jump through one to go a floor up, an arch taken falling takes you down, go back through an arch the other way, come down on to arch tops from above, hop down-lit patch to down-lit patch (up-lit is a hole); `lko08-chausar`: only lit squares and your own hold until the next throw; `lko09-hawa`/`jhande`/`gumbad`/`seeti`: the flag face you can't see is the birds' order, the flock obeys the nearer flag, a dome seems bigger from far away (jump from the paving line), a whistle beats a flag; `lko10-*`: each rule turned round, bells under chikan covers ring if you pause long enough to bow.

**CCU (Kolkata)** `ccu10-tram`/`ccu06-duiline`/`ccu06-points`: ride the rear step never the roof, get off at the island while the other tram passes, read the pointsman's lever; `ccu07-girder`/`dui`/`pylon`: walk off your porter's load on to a faster one passing under, only when no oncoming load is over you, don't take the porter whose chai stop is ahead; `ccu07-jowar`/`baan`/`ccu10-phire`: run the causeway ahead of the bore, be on the moored launch before the wave, don't run from a bore coming at you, get up on the refuge; `ccu08-tokta`: sit still among the old men so the tea seller comes and the plank is laid; `ccu08-rok`: walk through the adda without stopping, hop the maid's water; `ccu09-sinri`/`chala`/`toran`/`uthan`/`uthan2`/`dhak`/`line`/`ccu10-khola`/`chhad`: climb tied panels, ride a panel as the next is tied above, off before the roof frame, run under the canopy the moment it starts up, move up the queue one bamboo per beat; `ccu05-uthon`/`ghat`/`lane`/`pratima`/`ccu10-kumor`: walk (never jump) down on to pale dry figures, two steps lower cracks, stay on the one painted below the waist, ride the finished figure across; `ccu03-dokan`: be on a peanut for every shake, hop on as the chilli comes up; `ccu04-thak`/`ccu10-pherot`: a pile bought down from the bottom, wait till it is three high, ride a returned stack up.

**DIS (Dispur)** `dis02-chapori`/`dis06-char`/`chapori3`/`dis10-char`: the farmer's bar never moves whatever the post says, after each siren wait for the dashed bar to come up then go at once; `dis03-bagan`/`dis10-bagan`: follow the plucker a few steps behind, wait for the sprinkler's wet to dry; `dis04-bhogali`/`dis06-pitha`/`dis10-tawa`/`dis10-thanda`: only on a shiny crepe, leave before it dulls; on the cold pan the matte crepe is floor and the shine is oil; `dis05-*`/`dis07-lane`/`chowk`/`dis09-bihu`/`dis10-gamosa`/`gate`: walk inside the singers' ring through each gate, wait in the ring while gamosas are given, let a giver welcome you or hop over him, two gamosas and you can still see; `dis05-ghat`/`dis06-ghat`/`dis07-ghat`/`dis10-ghat`: get down into the ghat and let the tea boy walk over you; `dis06-chang`/`chang2`/`dis10-chang`: the ladder comes down when the tea boy reaches the water; `dis07-paar`/`dis10-bank`: run the slabs the river is eating; `dis07-dheki`: the lever's tail is a plank only while a woman presses it; `dis07-dhol`/`dis10-dhol`: hop one plank per beat, faster when his arms go faster; tired, slower: hop only when the next plank is up; `dis07-bordoisila`/`dis10-bordoisila`: get under the granary before the hail and stay till it has passed; the old granary gives way, jump the channel on the gust; `dis07-card`: the exit gate won't open before the card's time, cross corridors between deer; `dis08-*`: the rhino stops halfway at a jeep and charges on at the second, stand back till it has gone; `dis09-chaal`/`chaal3`: stop on each grip pad, run along it, one long leap over rib and oil; `dis09-tug`/`dis10-tug`: the rope is a bridge only while taut, read the referee's flag for who is winning.

**GTK (Gangtok)** `gtk02-*`: ride the steamer's top tier and step off at the top of the lift (stay on and it goes into the steam; get on below it and the lid comes down); `gtk03-jaanch`/`ulto`/`jaldi`/`kagaz`: cloth bags hold (stitches), thin ones tear, stay ahead of the inspector, or hop over him once he has passed the next cloth bag; wet paper sheets hold, dry ones crack, cross while the ones ahead are wet; `gtk04-*`: count the flights from the door you came in by; `gtk05-*` (HWIK): jump while holding litter and you drop it and are swept up; you pick up any wrapper you walk over; a full bin takes nothing, use the next, or go back to the empty one; follow the bin man, bin in the one he has emptied; a RESERVED bench's owner asks you down in front of the broom; `gtk06-*`: the stair down lands in the taxi stand, take the stair up; then the stair up ends on a doorstep and the roof garden is the way; wait on the step while the taxi backs out; roofs step down the hill; `gtk07-*`: a gap in the kerb rope is a gap in the road; rope down: wait under the awning for the cloud to lift, look, go; the painted wall lies, the rope doesn't; a cloud bank behind you, keep moving; the rope climbs to the door up unseen steps; `gtk08-*` (HWIK): cabins are shuttles, hop across while they're together at the middle; the far cabin stops below/above yours; a late cabin, stay on and ride back; two stations three shuttles; walk through the docked cabin while both doors are open; `gtk09-*`: ride the yak over the thin shore, stay on through the photo stop, off on the far bank before it turns, jump from its back when it stops short, blue lake ice holds, white shore snow doesn't; `gtk10-*`: each rule again in the cloud.

**SVP (Sri Vijaya Puram)** `svp02-chirai`: the saw takes the boarding end first, stand on the middle of the log; `svp03-nala`/`svp10-nadi`: the crocodile comes up through the gap being jumped, cross a gap when the board's arrow points at another; `svp04-ghat`/`svp10-ghat`: put the fritter down where you stand so the herd gathers there, away from the pit; `svp05-dekho`: the view's picture takes you where its footprints are; `svp05-choona`: a hop under a formation makes it drip, wet limestone slides you back; `svp05-rassi`/`svp10-rassi`: a hop by the bollard pulls the boat in a little; `svp06-lehar`: floats each a beat behind the one before, go when the next is no higher than you can jump; `svp06-sanjh`: each branch is up a few seconds after its horn, be on it when the parrots land; `svp07-ghat`/`doosra`/`teesra`/`svp10-saman`: the first ship sails with whoever walked on; ARRIVING is not the call, NOW BOARDING takes the luggage; the crowd goes over the trench and comes back on WRONG SHIP, stay in the trench; `svp07-khula`: cross the lift bridge while the lights are green; `svp07-uthao`: step off the lift when it stops at its floor; `svp08-bazaar`: the pan spits on the half the cook faces, climb the quiet half; `svp08-gali`/`deewar`: be at the dry end for the rain that is coming; a building's lee strip is as wide as it is tall; `svp09-hauz`: be on the raft when the pipe runs, step across when level with the wall; `svp09-nali`/`svp10-nali`: the air hose uses line only through an arch's opening, over the top costs nothing; `svp09-pul`/`svp10-jad`: green roots hold, grey ones crumble, the middle one swings.

**KVT and TVM branches:** see A1 (`kvt09-*`, `kvt10-*`, `tvm09-*`, `tvm10-*`, `tour-kvt-b8`, `tour-tvm-b4`).

---

## B. Marathon acts for BBI-07, ranked (best first)

Six acts: one momentum, one shelter, one sound, one tell, two rule acts. **A third rule act with a decision that is not in
list A was not found in the time; every third-rule candidate tried is in table C with the line it hit.** Six acts give
roughly +70-85 s on the 65.2 s stage, which clears the 120 s floor with checkpoints at each act's calm lead
(`LEAD` in `levels.ts`), none more than 25 s apart. Suggested order (law 5: momentum and shelter alternate with rule
acts; the tell comes right before the act it serves): existing acts, then B5 Jodi, B4 Kachha (tell), B1 Gadiba
(momentum), B2 Sajaghara (shelter), B3 Gum-Ta (sound), B6 Hulahuli, door. Act ids suggested are new against the Acts
list and every branch (grep done: `gadiba`, `sajaghara`, `gum`, `kachha`, `jodi`, `hulahuli`: no hits).

Per act: **Place** · **Decision** (one sentence) · **A1** obvious play and its death · **A2** obvious fix and its *different*
death · **A3** one move · **Engine** · **Closest in A** and the difference · **Adds** · **Line**.

### B1 · Gadiba, the rolling bridge (MOMENTUM beat) · `bbi07-gadiba`
- **Place.** Gotipua bandha nrutya is acrobatic floor work by boys trained from age 5-6 (VERIFIED, Wikipedia Gotipua as
  read for IDEAS-2; this file's author did not refetch). A bridge pose that rolls over as one line, like a tumbling run
  on the floor, is UNVERIFIED as a named bandha; present it as rehearsal play, not as a named item.
- **Decision.** *On a drum roll the bridge turns over toward the drummer: be walking the way it turns, and never stand on it.*
- **A1.** The shipped rule: at the stop, walk the bridge → half-way across, the mardala rolls (a tremolo, 0.6 s, heard
  before anything moves) and the boys roll over as one toward the drummer on the far bank; a dad standing or walking
  slowly is rolled under (`bbi-gadi-tala`, "Rolled under, Dad: they turned over with you on top").
- **A2.** Run the bridge to be across before the roll → this bridge's drummer sits on the NEAR bank, so the roll turns the
  boys toward you: running against the turn you are rolled under a tile from the far bank (`bbi-ulta-gadi`). A different
  death: direction, not speed.
- **A3.** Read where the drummer sits; on the roll, be stepping toward him (with the turn), and you ride the top as the
  line turns, the way a log-walker does; one roll each bridge, two bridges in the act, drummers on opposite banks.
- **Engine.** The troupe's one solid (`s07.ts` troupe rig, "reshaped to whatever pose they hold") gets a `roll` phase: for
  0.6 s the solid's top moves Dad by `+dir * ROLL_PX` per tick (a conveyor on the solid, like a treadmill tile), and a
  dad whose own velocity is against `dir` (or zero) is killed at the roll's end; a dad moving with `dir` survives. The
  drum roll is a sound cue plus a visible shiver of the line (fair: AGENTS.md bar 5).
- **Closest in A.** RNC-02 dhuska flipped (thrown off whatever flips); the `hammock` door (on the third landing the uncle
  rolls over and dumps you: a counted dump, nothing to ride); kit rollers and BOM treadmills (a surface that
  moves you); JAI-05 bangle roll (you are inside the rolling thing). Difference in one sentence: the platform turns over
  and you stay on it only by moving with its turn, chosen by where the drummer sits, so the decision is a direction read
  from the band, not "don't be on it" and not a speed.
- **Adds.** 14-18 s (two bridges, a bank between).
- **Line.** "Gadi gala! | It rolled!" (U; fallback "Dekha, Dad! | Look, Dad!" from BBI.md).

### B2 · Sajaghara, the dressing tent (SHELTER beat) · `bbi07-sajaghara`
- **Place.** Behind a village show there is a cloth-walled dressing space where the boys retie flowers and change (ordinary
  practice, U; the Gotipua costume, flowers and make-up are VERIFIED per IDEAS-2's reading of the Wikipedia page).
- **Decision.** *The dancers' tent is safe only while they dance; at the drum's stop the boys who are not in the pose run
  into it, so leave it on the stop, on to the bridge.*
- **A1.** The shipped shelter habit (`bbi07-dweepa`: wait on a safe spot for the bridge): step into the tent on the bank
  beside the pit and wait for the bridge → at the stop the four spare boys run up out of the pit into the tent, and a
  dad inside is trampled (`bbi-saja`, "The green room filled, Dad: the spare dancers came in").
- **A2.** Wait just outside the tent, on the bank, ready to go at the stop → the boys run from the pit mouth across that
  strip of bank into the tent and knock the waiting dad into the pit (`bbi-dauda`). A different death: the strip, not
  the room.
- **A3.** Be inside the tent while the drum plays (the pit is a whirl, the bank strip is their run), and at the stop step
  straight out of the tent's pit-side flap on to the bridge: the stop that fills the tent is the stop that lays the bridge,
  and the runners cross behind you. The tent flap faces the pit, drawn open from frame one.
- **Engine.** The tent is a `Rig` box on the bank with a trigger volume; four small chasers spawn at the pit mouth on the
  stop and path to the tent in 0.5 s (kill on touch, like bagudi's boys); they despawn inside. No new physics.
- **Closest in A.** IDEAS-2 C2 practice wall (rejected: its answer followed the hazard out); `dis07-bordoisila` (get under
  the granary before the hail and stay till it passes); `gtk07-thau` (wait under the awning for the cloud to lift).
  Difference in one sentence: this shelter's safe window is the inverse of the pit's (safe while the hazard plays, deadly
  at the all-clear), and the exit is timed to the rhythm, not to the hazard leaving or returning.
- **Adds.** 10-12 s.
- **Line.** "Bhitare ruha, Dad! | Stay inside, Dad!" (ruha V on Omniglot; phrase U).

### B3 · Gum-Ta, the two heads of the mardala (SOUND beat) · `bbi07-gum-ta`
- **Place.** The mardala is a two-headed barrel drum; the heads differ in size and so in pitch (UNVERIFIED here: the
  Wikipedia Mardala page was not fetched in the time; the builder should check which head is the bass).
- **Decision.** *The last stroke before the stop names the pose, so move on the stroke, not on the shape: a deep stroke
  ends in the bridge, a sharp one in the tower.*
- **A1.** Wait at the edge for the stop, see the shape, then go (`bbi07-bandha` taught "be at the edge when the drum stops")
  → these bridges are a step shorter-lived than bandha's: a dad who waits to see the shape starts one beat late and is
  thrown on the far third (`bbi-thrown`, the existing cause, at a new tick). The first death is cheap and the sound has
  been playing all along.
- **A2.** Start walking on every final stroke → on a sharp stroke the pose is the tower, and the dad already stepping off
  the edge walks into the pit under it (`bbi-nacha`'s cause, "they were still dancing", or a new `bbi-ta`).
- **A3.** Deep stroke: step off as it sounds, and you reach the boys as they lie down. Sharp stroke: stay. The deep and
  sharp strokes are drawn too (a low wide note-shape vs a thin high one over the drummer) so the beat is readable muted.
- **Engine.** Two drum samples already exist for the stop (one cue); add a second sample and a pose table keyed by the
  final stroke; the troupe rig's `poseAt(t)` reads the same table. Deterministic.
- **Closest in A.** TVM-02 bus bells (one bell brakes, two bells jerk off: a sound code moves the vehicle);
  `bbi07-dui-baja` (read the far drummer's sticks: a sight cue). Difference in one sentence: the sound here is a forecast
  of a shape, one beat early, so the decision is to commit before you can see, not to decode what the vehicle will do.
- **Adds.** 12-15 s (three stops: deep, sharp, deep).
- **Line.** "Suna, Dad! | Listen, Dad!" (U).

### B4 · Kachha, the tucked pleats (the TELL for a "how would I know" moment) · `bbi07-kachha`
- **Place.** Dancers tuck the skirt's pleats up at the waist before floor acrobatics so the cloth does not catch (ordinary
  dance practice, U).
- **Decision.** *A troupe with its pleats tucked up will roll; a loose-skirted troupe lies still: look at the waists before
  the stop.*
- **The moment.** Two bridges in a row look the same at the stop. The first (loose skirts) lies still for the whole walk,
  as every bridge so far has. The second has every boy's pleats tucked (a thick band at the waist, visible from frame one
  during the whirl, readable muted) and rolls (B1's roll). The player's first death is the roll; the one move after it is
  to read the waists and walk with the turn, or wait for the next, loose-skirted troupe. TROLL-BIBLE section D: one
  unknown, a visible tell, one move after one death, the guide silent until then.
- **Engine.** A `tucked` flag on the troupe cfg draws the waist band and enables the roll.
- **Closest in A.** `kvt10-*` camouflage (the thing whose speckles drift is the creature), `gtk03` cloth bags (the
  stitches tell which bag holds), `svp09-pul` (grey roots crumble). Difference in one sentence: the tell does not mark
  a fake or a safe piece, it tells you which *way to move* on a piece that is real either way.
- **Adds.** 6-8 s (one extra loose bridge before B1's two).
- **Line.** none (a tell, not an act; the hint after three deaths may say "Look at their waists").

### B5 · Jodi, one bridge from two troupes (RULE act) · `bbi07-jodi`
- **Place.** Two troupes share one wide pit, each on its own drummer, and a long bridge is made only when both lie down,
  half each (U as a staged item; two troupes with two drummers is already BBI's own `bbi07-dui-baja` world).
- **Decision.** *Two halves make the bridge, and the half whose drummer stopped first is the half that restarts first:
  be standing on the older half before the newer one lands, and cross it first.*
- **A1.** Wait for a whole bridge, then walk from the edge (the shipped rule) → the far half, which lay down first, is
  older; it restarts while you are on it, and throws you (`bbi-thrown` at a new tick, or `bbi-adha`, "Half the bridge got
  up first, Dad").
- **A2.** Go the moment the near half lands and run the whole bridge → fine at the first pit, because the near half there
  is the newer one. At the second pit the drummers' order is swapped: the NEAR half lay down first, and the runner who
  starts when the far half lands is still on the near, older half when it rises (`bbi-adha` again, different pit). The
  different trap: the same move kills because the order changed, and the order was visible (which drummer's hands
  stopped first).
- **A3.** At each pit, step on to the first half the moment it lies down, even though it ends in mid-air over the pit,
  and walk to its end; the second half lands under your next step; you are off the older half before it rises. The
  half-bridge the room taught you never to trust is the one to be on.
- **Engine.** Two troupe rigs in one pit with two drummers and offset stop times (`T07*` cfgs already allow per-troupe
  timing); each half's restart is its own stop time plus the hold. A half-bridge's free end is a plain solid edge.
- **Closest in A.** `bbi07-shrinkhala` (three troupes, each stops as you reach his part: order comes from your position);
  `gtk08-*` (two cabins together at the middle: an "and" window); `pat06-ginti` (the count that counts is the one left
  when the porter finished: read which event matters). Difference in one sentence: the player reads the ORDER of two
  stops to decide where to stand before the floor is complete, and the right place is a half-bridge that goes nowhere yet.
- **Adds.** 16-20 s (two pits, swapped order).
- **Line.** "Jodi, Dad! Dui jana! | A pair, Dad! Two of them!" (U; "dui" is Odia two, U on Omniglot's list).

### B6 · Hulahuli, the cheer that holds the pose (RULE act) · `bbi07-hulahuli`
- **Place.** Hulahuli is the ululation Odia women make at auspicious moments (U here: Wikipedia "Ululation" lists Odisha,
  not fetched in the time). Whether an audience would hulahuli at a Gotipua pose is U; the fallback skin is plain applause
  from the women's bank, which changes no mechanics.
- **Decision.** *A pose the women cheer holds as long as their cheer and not a beat longer; a pose they meet with silence
  is too short to cross however fast you go, so cross only the cheered ones.*
- **A1.** Go at the stop, as taught → this troupe's silent poses hold under two seconds: thrown mid-bridge (`bbi-thrown`,
  new tick). The women's bank is quiet; nothing was announced.
- **A2.** Run every bridge → on a silent pose the far-end boy stands first (he always does on a silent pose: no applause
  to bow to) and the runner meets his kick a tile from the bank (`bbi-kick`'s cause at a new tick, or `bbi-chup`). The
  different death: the far end, not the middle.
- **A3.** Wait out silent poses on the edge (two or three in a row; the pit is a whirl, nothing threatens the edge), and
  the moment a pose lands to a hulahuli, walk: it holds for the whole cheer (a long, falling sound), and the drum
  restarts the instant the cheer ends, with no stick-lift warning. The cheer's fade is the clock: the second cheered
  pose is cheered shorter, so a dawdler on it is thrown; the hint says "walk while they cheer, and don't dawdle".
- **Engine.** A per-pose `cheer` duration in the troupe cfg (0 = silent, hold 1.8 s; else hold = cheer length), a looping
  sound that fades over the hold, and a bank of seated women sprites who raise their hands while it plays (readable
  muted: raised hands = the pose holds). Deterministic: which poses are cheered is fixed per attempt.
- **Closest in A.** `bbi07-bandha` (the bridge only just lasts the walk: a fixed short hold); `svp06-sanjh` (each branch is
  up a few seconds after its horn: a fixed duration after a cue); BBI-03 (a customer's presence opens the parasol: someone
  else's act makes the floor). Difference in one sentence: the hold's LENGTH is a live sound you listen to while crossing,
  and the decision is to refuse the uncheered floor rather than to hurry on it.
- **Adds.** 14-18 s (two pits: one cheered pose among silent ones, then a shorter cheer).
- **Line.** "Hulahuli! Chala, Dad! | They're cheering! Go, Dad!" (chala V; rest U).

### Beats check (the brief's list)
- Momentum: B1 (the drum roll makes you keep moving the right way). Shelter: B2. Sound: B3 (and B6's cheer is a second
  heard cue). Tell for HWIK: B4. Rule acts: B5, B6. **Third rule act: not found; see C.**

---

## C. Rejected: every candidate considered and dropped, with the list-A decision it collides with

| Candidate (Bhubaneswar source) | Its decision | Collides with (list A) |
| --- | --- | --- |
| The pyramid (IDEAS-2 C1) | climb with the build, one tier ahead | `dis07-dhol`, `bbi09-udaya` (hop/wait one per beat as it rises) |
| Practice wall (C2) | shelter at the hazard's start line while it is out | the cut broom: follow a hazard away, then its return |
| Guru's stick (C3) | a raised stick is a stop you don't use | `lko07-photo` test flash, `bbi07-dui-baja` (a false signal, read which) |
| Pattasari winding (C4) | cross while the cloth is taut, before the last turn | `dis09-tug` (a rope is a bridge only while taut) |
| Chaali: walk inside the troupe's line at their pace | match the dancers' walking pace | `lko07-julus` (walk behind the procession at their pace) |
| Khali: a one-beat silence inside the phrase is not a stop | ignore the short silence, wait for the long one | `lko07-photo` (short test flash first), C3 |
| The drummer follows Dad's steps; standing stops the drum and makes the pose | stop to build your bridge | BBI-04 (standing builds the bridge), RPR-03 (time passes only while you move), `shy` family |
| Sagadi: the wheel pose cartwheels along the pit and you ride its top | walk against a turning wheel to stay on top | ALLOCATION section 4: a turning wheel as platforms (BBI-09 owner, `clockhand`, RPR-05) |
| Nauka: the boat pose tips toward the drummer at the restart and launches you | ride the tip to the far bank | PAT-07 lean, `salaami`, `cannon`, JAI-04 (being launched by a platform) |
| Mancha: under the stage, the massed landing of the pose comes through the boards | leave the under-stage pocket at the stop | kit ceiling drops, TVM-02 slabs where you'd wait; the surviving half of this is B2 |
| Screened pit: a troupe behind a Pipli cloth, crossed on a stop you only hear | act on a heard stop with nothing to see | `bbi07-dui-baja` (follow the other drummer); `invisible` family |
| Gini cymbals ring one beat before the stop | go on the ting, not the stop | a warning cue only; the decision is `bbi07-bandha`'s "be at the edge when the drum stops" |
| Tihai: the pose lands on the third repeat of the phrase, the drum never stops | count the repeats | BBI-06 count the beats; ALLOCATION read-a-count owners; `bbi10-tana` (pose while the drum plays) |
| Baksis: a flourish for a tipper is not the restart | read the plate to tell flourish from restart | C3 / `lko07-photo` (a false signal with a tell) |
| The boy without anklet bells sits out, his part of the pose survives the restart | stand on the one piece that never moves | `dis02-chapori` (the farmer's bar never moves), `bbi07-dweepa` |
| Wilted garland: the tired boy's section breaks first | cross the marked piece first | `gtk03` bags, `svp09-pul` roots, `ccu05` figures (a tell marks the failing piece), `bbi09-ara` order |
| Wobbling boy will drop out of the pose | avoid the piece that twitches | `kvt10-*` camouflage octopus (the thing that twitches is the creature) |
| Pose faces the audience: it breaks from the feet end | read which end goes first | `pat03-patti` (the banner narrows from a readable end) |
| Tahia headgear is soft: stand on shoulders, never heads | only this part of the top holds | BBI-03 cut-out vs silk |
| Jump landing on the bridge is a drum stroke that restarts the dance | walk on, never jump on | TVM-01 soaked road, BBI.md's dropped chhena poda |
| Dad becomes part of the pose if he stands among them at the stop | standing still gets you held | BBI-04, CCU-08, AIZ (ALLOCATION section 4) |
| Tower pose clears the pit floor: walk the floor under it | the useless pose is the way | `bbi07-deepa` (which pose is the way), `svp07-teesra` trench, `dis07-ghat` |
| Jump on the mardala to stop and start the dance yourself | start/stop the machine on purpose | `bbi05-tenda`, `bbi05-thaka` |
| Encore: hop in place (applause) to make them hold the pose | mash to keep the floor | DMN-05 mash-to-haul, `svp05-rassi` (hops do remote work), `knock` |
| Hand the boy his fallen tahia so the pose can form | help the NPC with his hat | PDY-01 `Kepi` |
| Garlands hung on Dad by the crowd limit his sight | carry two and still see | `dis05-*` gamosas |
| Fallen flowers Dad picks up; the boys chase their flower | animals/crowd follow what you carry | SVP-04 owner; `gtk05-*` pick-up rule |
| Pose forms under the walking cymbal player | the safe spot is where the marker-man stands | `tvm09-*` flags moved by the lifeguard |
| Far troupe hears the drum a beat late: poses a beat after | a floor a beat behind | `svp06-lehar` (floats each a beat behind) |
| Second troupe dances the first's previous pose (canon) | read pit 1 to know pit 2 | `bbi06-patta` (the panel paints the NEXT pit), AGT-06 owner |
| Boys leave to the tent one per stop: each bridge shorter, don't wait | it only gets worse, go now | `gtk03-kagaz` (cross while the ones ahead are wet), C4 deadline |
| Alta: wet red footprints show the boys' exit path | footprints mark the danger | `footsteps` ending, `svp05-dekho` |
| Raja's bare-earth rule: the boys never step on bare ground, so bare ground is safe | the bare strip is the safe one | BBI-02 door (`bbi-roll`: the ugly bare strip is the safe ground); also the rule's reason is on BBI.md's avoid list |
| Shadow puppets (Ravana Chhaya, Odisha): the shadow is the floor, bigger nearer the lamp | stand on a shadow only when its puppet is near the lamp | MECHANICS theme "shadows (HYD-02, `catch`)"; `lko09-gumbad` (size changes with distance); deity content |
| Daskathia wooden clappers snap shut | pass as they open | `bbi-kainchi` scissors door |
| Audience Mexican wave: hop seated people before the standing wave reaches them | run against a travelling front | `ccu07-jowar`, CCU R2 bore, `gtk07-ghumti`; crowd as floor owners |
| Spotlight man: the dark part of the bridge is still bridge | trust the unlit floor | `lko08-roshandan` (lit patches are floor), BLR-06 lights |
| Podapitha round loses wedges from the knife's side | stand opposite the knife | `pat03-patti`, DMN-03 (support shrinking from a readable side) |
| Thrown flowers pile in the pit: drop in on purpose | fall into the soft thing | RNC-07 `khoh` (go down inside the falling water), `kvt09-*` land deep |
| Kneeling base boy: get on him before the tower rises | ride the build up | `ccu09-uthan` (ride the panel as the next is tied), C1 |
| Boys swap mid-pose: a hole travels along the bridge from the drummer's side | stay ahead of the swap | `gtk03-jaanch` (stay ahead of the inspector); behind it is the cut broom |
| Moon's height tells how tired the troupe is | the sky is the clock | ALLOCATION sun-as-clock owners (SML, LEH, CHP) |
| Kalinga Stadium hurdles knocked forward by a sprinter | hop the hurdle before the runner reaches it | `gtk03-jaanch`, treadmills; also not the Raja-night setting |
| Hockey turf watered before play (slick) | aimed wet tile | BBI-01 |
| Chilika birds' carpet (BBI-11) | wait for silence after the motor | retired in ALLOCATION (SML flock owner) |

## D. Could not verify, and notes for the builder

- **Not fetched (time):** Wikipedia Mardala (which head is the bass, B3), Wikipedia Ululation (hulahuli in Odisha, B6),
  Wikipedia Gotipua (this file relies on IDEAS-2's reading: acrobatic bandha from age 5-6, mardala and gini, the ~4 m
  pattasari, the pose names sagadi/nauka/mayura/hansa/keli kadamba/kandarpa ratha). A rolling line (B1), tucked pleats (B4),
  a dressing tent (B2) and two troupes sharing a bridge (B5) are staging, not sourced customs: mark them U in CITIES.md.
- **A factual slip in the shipped stage, found while reading:** `causes.ts` and `bbi07-dui-baja` speak of the drummer's
  "sticks"; the mardala is played with the hands (U here, but widely stated). B3 works either way (hands or sticks), and
  a fix is a wording change in two advice strings, not a mechanic.
- **Odia lines:** only "ruha", "chala" and "dui" in this file are on BBI.md's Omniglot list; every full phrase above is U
  and has a BBI.md fallback named beside it.
- **Seconds** are estimates against LENGTH-2's per-act times (the shipped 07 acts run 6-9 s each; these are longer because
  each has two pits or two beats), not measured. The 25 s checkpoint rule needs a checkpoint at each act's lead and one on
  the bank between B1's two bridges and between B5's two pits.
- **Not done:** no worktree, test or doc in the game repo was touched; no CR, commit or push. The builder should grep the
  six ids and the nouns (roll, tent, cheer, pleats, half) once more against `develop` at build time, since the other
  branches keep moving.
