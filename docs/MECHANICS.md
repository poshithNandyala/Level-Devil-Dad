# Mechanics already used (no repeats)

Check this before designing a new city. Every stage gets a new idea; a new city never reuses one below
(a finale may call back to its own city's ideas). Add each city's lines when it ships.

A repeat is the same *experience*, not the same name. Re-dressing an idea for a new city (a trampoline that's
a charpai instead of a bowl, a clock tower that stops time again, a different animal that only moves when
you look away) is a repeat. Before you design, read the themes below, then grep the code for your idea's
nouns and verbs (`grep -rni "bounce\|trampoline" src/game`). For the stage list with what each one is, see
`docs/CITIES.md`.

## Themes already taken (find a new angle or leave them alone)
- **Rides that leave or betray you:** autos (HYD), buses and signals (BLR), local trains and moving
  platforms (BOM), metro (BLR-03), a train roof on a lifting bridge (CHN-08), ferries and boats on a
  timetable (KVT, PNJ, DMN), pedal boat (DMN-02), rope ferry (DMN-05), snake boats (TVM-08), jeeps (TVM-07),
  a safari jeep (`safari`), an elephant (JAI-08), a dummy horse (JAI-06), a balloon (JAI-07), a parasail
  (PNJ-07), floats in a parade (PNJ-08), a packed train that shoves you out (BOM-03).
- **Water:** floods and rising water (TVM-02, BOM-04), swimming with an air meter (KVT-06), running on
  water (KVT-08), skipping like a stone (BPL-02), tides (DMN, PDY-06), waves (PDY-07), see-through water
  (KVT-02), waterfalls (BLR-08, `cascade` kit), lakes (BPL-02, BPL-08), falls that kill unless you go down
  inside the falling water (RNC-07; BOM's `lightwell` already splats a fall down a shaft).
- **Air:** gusts and wind (kit), tailwind (KVT-04), gliding (`glider`), feather flaps (GNR-06), choosing the
  wind (JAI-07), kites and kite string (HYD-05, GNR-02), rockets (JAI), cannon (`cannon`).
- **Bounce and spring:** springs and spouts, recoiling ropes (PNJ-05), hammock (`hammock`), shockwaves
  (GNR-04), bowls that bounce harder each use (BPL-05), tops kept up by landing on them (RPR-05).
  Any trampoline is taken.
- **Time:** slow-mo (`slowmo`), a clock hand you ride (`clockhand`), a timed window (`lamp`), closing time
  (PDY-04), time that runs only while you move (RPR-03, `ghanta`), déjà vu (`dejavu`), siesta (PNJ-04).
- **Copies, mirrors, echoes:** mirror (`mirror`), reflection (`reflection`), a twin that copies or mirrors you
  (BOM-08), shadows (HYD-02, `catch`), echo (HYD-06), mime (`mime`), footsteps (`footsteps`).
- **Moves only when you don't look / don't move:** the shy auto (HYD-04), the shy door (`shy` twist), statues (HYD-04 act), lions
  (GNR-05), musical-chairs freeze (PNJ-08), sleepers you mustn't wake (PNJ-04, TVM-05), standing still to
  become a cocoon (RPR-06).
- **Animals:** elephant, horse, lions, bull, monkeys (`monkey`), crabs, eels, jellyfish, dolphins, tuna,
  peacocks, bison, hornets, hawks, red ants, dogs and crows (chasers), a dinosaur statue (GNR-04).
- **Carry and balance:** a dabba you carry without jumping (BOM-07), pots on your head (JAI-03), iron and
  magnets (BPL-07), a balance scale (DMN-06), a plank passed hand to hand (DMN-04), being weighed (DMN-06).
- **Floors that lie:** crumbling, dropping, shy and fake floors (troll kit), colour-gated floors (PNJ-06),
  a path painted as you go (DMN-07), two worlds switched by stencils (BPL-03), melting ice (DMN-03), mud
  (GNR-06, RPR-02), rice you pour into hills (RPR-04), ant bridges (RPR-07), a chart that scrolls (GNR-08),
  sunbeams (GNR-03), dance rings (GNR-07), broken glass (JAI-05), wet paint (BOM-06), tar (kit).
- **Your own body:** flipped controls, gravity flip (`gravity`), tiny Dad (`tiny`), puppet strings and forced
  hops on a beat (JAI-02), stilts (RPR-02), a thread you may never cross (BPL-04), wall kicks on chawl walls
  (BOM-06), palm climbing (KVT-07), a needle that sews (BPL-04).
- **Festivals already used:** Onam boats (TVM-08), Bastille Day (PDY-08), Mysuru lights (BLR-06), Holi
  (BOM-07), dahi handi (`dahihandi`), Uttarayan (GNR-02), Navratri garba (GNR-07), Diwali (JAI-07),
  Carnival (PNJ-08), Hareli (RPR-02), Bastar Dussehra (RPR-08), Seraikela Chhau at Chaitra Parva (RNC-05).
- **Sports already used:** cricket (CHN-04), football (PNJ-03, `penalty`), kabaddi (`kabaddi`), archery (RNC-03).
- **Doors:** knock (`knock`, unused but taken), fake and painted doors (`fakewin`, `paintwall`,
  `invisible`, `backdoor`), a door that moves, hides or must be caught (`shy` twist, `catch`, `lattu`), a door
  you're carried to (`reel`), a toss up on to a gate (`salaami`), a door in a hollow halfway down a waterfall
  (`khoh`), a door you cast yourself (`dwar`). Read every `advice:` line in
  `src/game/levels/endings*.ts` before you pick an ending.

## Ways to move and core rules
- Run/jump (tap vs hold), ledge assist, coyote time, jump buffer.
- Swimming with air (KVT-06), climbing palms (KVT-07), running on water / skim (KVT-08), dolphin rides.
- Wall kicks and wall slides on chawl walls (BOM-06), carrying without jumping (BOM-07 dabba),
  a twin that copies you / mirrors you (BOM-08).
- Flipped controls (`flipControls`), gravity flip, slow-mo, tiny Dad, cannon launch.
- Gossip bubbles as drifting one-way platforms (PNJ-02), kicking a football: ground / volley / header
  (PNJ-03), stealth landings near sleepers (PNJ-04), sagging ropes with a recoil bounce (PNJ-05),
  roulette colour-gated floors (PNJ-06), towed parasail altitude control (PNJ-07), musical-chairs
  freeze on parade floats (PNJ-08), pedal boat driven by running (DMN-02), melting slippery ice
  (DMN-03), riding a plank passed hand to hand (DMN-04), mash-to-haul rope ferry (DMN-05), balance
  scale lifted by crates (DMN-06), a painted path that fades behind the brush (DMN-07).
- Pole vault with run-up-controlled height (GNR-02), walking up swinging sunbeams (GNR-03), shockwaves
  that throw you from the floor (and doubled where two meet) (GNR-04), lions that stalk only while your
  back is turned (GNR-05), feather flaps as a limited mid-air jump, and mud you can't jump from (GNR-06),
  crossing 3D dance rings at their ends, and joining one (GNR-07), a scrolling candle-chart floor, and
  platforms that rise when you jump (GNR-08).
- Puppet strings: beat-forced hops, no jump of your own (JAI-02), a swaying tower of pots on your head
  (JAI-03), pumping a swing in a marble bowl to fly out (JAI-04), rolling inside a giant bangle with
  momentum, over glass, shattering on impact (JAI-05), a horse costume that never stops: rear to turn
  (JAI-06), a balloon steered only by choosing the wind at each height (JAI-07), an elephant you drive
  from her back, who follows you on foot and tosses you with her trunk (JAI-08).
- Skipping like a stone across water at a run (BPL-02), two overlaid worlds (real and painted) switched
  at hand stencils (BPL-03), a trailing thread you may never touch again (BPL-04), bowls whose bounce
  grows with every use until they're dry (BPL-05), a narrator whose tall tales come true a moment
  later (BPL-06), carried iron and crane magnets that grab it (BPL-07).
- Stilts: tall, mud-proof, high-jumping, but you must land slowly (RPR-02), time that only passes while
  you move (RPR-03), pouring rice in to hills you climb (RPR-04), spinning-top platforms kept up by
  landing on them (RPR-05), a cocoon from standing still that hornets can't get through but hawks
  like (RPR-06), ant bridges that come to you and bite (RPR-07).
- Dhuska that come up in the kadhai as platforms, get flipped (throwing whatever stands on them) and get
  scooped out (RNC-02), arrows that stick in a straw boss as steps you climb between shots, pulled out on
  the whistle (RNC-03), a storm cloud whose lightning hits the tallest thing under it (you, or beside it)
  while its thunder pushes rugra up as lifts (RNC-04; the act: rugra stairs one step behind the
  lightning), Chhau masks that make the dancers take you for that character: tiger flees the hunter,
  pounces on the peacock, peacock dances with a peacock and flies from a tiger, rider and all (RNC-05),
  a lost-wax mould that is hollow (walk-through) between the wax running out and the brass going in, and
  a crucible you tip to cast your own brass step (RNC-06), Hundru's rule: a long fall on to rock kills,
  counted from the top of your jump, so off a high rock you walk, or run, but never jump; inside the
  falling water you sink slowly (RNC-07), and the storm parked over the falls, where the slow water makes
  you the tallest thing (RNC-08).

## Hazards and kit (traps.ts, kit.ts, abilities.ts, goa.ts)
Springs/spouts, blinkers (timed platforms), gusts/wind, geysers, cascades, rollers, riders, shots,
electric arcs, mist clouds, rising floods with floaters, treadmills/moving walkways, trains and
shuttles, crumbling/dropping/shy floors, pop-up spikes, rising walls, ceiling drops, chasers, coconuts
and rockfall, heat shimmer (fake road), crabs, eels, jellyfish, urchins, bending palms, tilting
gangway slope push (PNJ ending), sliding hammock bounce counter, clock-hand circular lift, kite strings
(manja) as height caps, babool thorn branches, forest gates (naka), a safari jeep ridden backwards,
window breezes, broken-glass floors, half-shut shutters, sword dancers on a count, Diwali rockets on a fuse.

Hardness pass (v0.16.2 on): a rocket launch whose blast burns the road and whose spent stage falls where
you'd wait (TVM-01, `Launch`), a floor that drops just ahead of you and comes back if you wait, while the
far side breaks if you jump it (TVM-01, `gapAhead` + `noLanding`), bus bells as a rule: one bell brakes and
slides you forward, two bells jerk off and slide you back (TVM-02), hidden spikes on a deck top that come
out when you hop at it (TVM-08), a turtle nest that hatches across your path: you must not touch a baby,
and they spread wider than a jump, so you wait (KVT-01, `Nest` in entities/lakshadweep.ts), a Pongal pot that
boils over when you come close: its spill runs past where it started bubbling and a spout of foam covers any
jump over it, so you back off (CHN-01, `PongalPot` in entities/tamil.ts), a policeman chasing his blown-off
kepi: the way through is to help him, by catching his cap as it blows over you (PDY-01, `Kepi` in
entities/tamil.ts), a bridge that loads like a progress bar, sticks at 99% and restarts from nothing with
you on it (BLR-01, `LoadingBridge` in entities/karnataka.ts), being fed: a full stomach shortens your jump for
a few seconds (AMR-01, `Aunty` and `FULL_PHYS` in entities/andhra.ts). Festivals: Pongal (CHN-01). Puducherry's
pétanque is still unused (an idea for later).

Level Devil pass (v0.16.8 on, Thiruvananthapuram first): a road that caves in under you, compound-wall glass
that your hop puts on the wall and more of it on the road below (TVM-01, glass-look pop-up spikes), a ditch
you must wade because jumping it brings up spikes on its far side (TVM-01), a stall tarp full of monsoon rain
that empties on the road when you come near (TVM-01, `Tarp`), a puddle drawn exactly like the wadeable ditch
that is a pothole (TVM-01, `Puddle`), chunks of flyover falling on the bus roof, the back under one flyover
and the middle under the next (TVM-02, `Slab`), a Brahminy kite that glides over a dad who stands and meets
one who hops (TVM-02, `parunthu`), a tea pour that starts the moment you leave the steam (TVM-03), a scooter
from behind and then one head-on (TVM-03), broken glasses on the way back to a door that hopped over you
(TVM-03), hidden spikes where a short hop over a fake floor lands (TVM-03), fallen palm fronds over a
coir-retting pit (TVM-04, a fake floor), a far bank that backs away from your jump (TVM-04, `shyLedge`), a
second portcullis hidden in the gatehouse that drops as you pass under the first (TVM-05), jetty planks that
give way under a dad who waits on them for the boat (KVT-02), a sandbar that goes under when you stop on it
(KVT-08), a fishing-net counterweight that slams down when you step off the net
(TVM-06, `Counterweight`), Tara urging the very move a trap waits for, live, at the trap (TVM-01 ditch and
tarp, 02 kite, 03 second scooter, 04 fronds, 05 dog, 07 factory step), then telling the truth once you've
learnt she lies (TVM-06's last net), and a lie and a truth at back-to-back bridges (TVM-08: read the bridge,
not Tara), a coconut the last palm keeps back for the dad who follows the falling wave (TVM-04), a sleeping
dog that growls as you land past the spikes, so the flinch back meets them (TVM-05).
Round three of the pass (v0.16.14) moves the tricks so the way through the last version dies, and records
that version's routes in `tests/frozen/` (tests/stale.test.ts plays them and they must die): a soaked road
that holds a walker and breaks under a hop (TVM-01, the reverse of its old cave-in), a two-stage rocket
whose first stage comes down where you used to wait (TVM-01, `Launch` `boosters`), flyover chunks moved
to where you used to ride, with dark cracks in the decks as the tell (TVM-02), the tea master's double pull
(TVM-03), a coconut that drops on whoever stops under a palm (TVM-04), moat mud at the bank's edge that goes
the moment you land on it (TVM-05), the swell crashing over the promenade's edge while the first net is
down (TVM-06), a third pit in the mist and a rock that comes down where you'd stop to let it fall, its
pebbles first (TVM-07), and finish-jetty spikes that sink back after a moment, with more where a hop over
them lands (TVM-08, calling back Fort Kochi's jetty and the tea street's painted floor).

## Acts (one per id, never reused)
amr02-powder amr03-logs amr04-hot amr05-humps amr06-zip amr07-gallery amr08-shack
blr02-badge blr03-viaduct blr04-jam blr05-glasshouse blr06-powercut blr07-crusher blr08-curtain
bom02-walkway bom03-wire bom04-manholes bom05-doors bom06-paint bom06-spikes bom07-holi bom07-relay
bom08-mirror bom08-together
chn02-queue2 chn03-frogger chn04-cricket chn05-heat chn06-ladi chn07-capstone chn08-trainroof
hyd02-shadow hyd03-cooker hyd04-statue hyd05-kites hyd06-echo hyd07-boxes hyd08-retake
kvt02-glass kvt03-faith kvt04-tailwind kvt05-lift kvt06-air kvt06-eels kvt07-bend kvt07-crabs
kvt08-dolphins kvt08-weed
dmn02-channel dmn03-dispatch dmn04-dozer dmn05-tide dmn06-loft dmn07-hills dmn08-diu
pdy02-pools pdy03-signs pdy04-closing pdy05-raft pdy06-palms pdy07-waves pdy08-sparks
pnj02-lane pnj03-wall pnj04-street pnj05-climb pnj06-table pnj07-flight pnj08-parade
gnr02-terraces gnr03-shaft gnr04-hatchery gnr05-pride gnr06-sabarmati gnr07-sheri gnr08-towers
jai02-show jai03-zenana jai04-yantras jai05-rasta jai06-mela jai07-udaan jai08-amer
bpl02-jheel bpl03-shelters bpl04-karchob bpl05-mehfil bpl06-chowk bpl07-karkhana bpl08-bhojtal
rpr02-khet rpr03-chowk rpr04-kothi rpr05-mela rpr06-jungle rpr07-saal rpr08-dussehra
rnc02-galli rnc03-maidan rnc04-seedhi rnc05-kharkai rnc06-ghariya rnc07-chattan rnc08-ghagh
pat02-chokha pat03-batch pat04-anaaj pat05-ghat pat05-sangam pat06-sau pat06-nau pat07-sadak pat07-adda
pat08-chowk pat08-vihara pat09-jhoola pat09-ghoda pat09-wapsi pat10-pipa pat10-sau pat10-sidhi pat10-anaaj
pat05-bori pat06-gaadi pat07-pul pat07-haat pat07-mandi pat10-bori pat10-gaadi

## Door endings (ENDINGS: one stage each)
Check the advice lines in endings*.ts too: an idea counts as used even under a new name (e.g. catching
something by its shadow is `catch`; a door that's only there in a timed window is `lamp`).
knock loading reflection glider trapdoor token bull catch rangoli tips shuffle mirror lamp bells mime
fakewin revolve pull wrap invisible cctv key swing mirchi speed monkey dejavu whirlwind otp biryani
gravity tiny cannon backdoor slowmo bollywood kabaddi dahihandi credits
safetystop pushoff footsteps local lightwell dabbacode
poder penalty clockhand hammock gangway sandcastle decree
customs coldstore flag drawbridge slidedoor paintwall tipjetty
setu jali milan safari kichad pravesh herd
sutradhar toran shant naap dulha palat salaami
ghat haath gaanth khaali paan rakhdo kissa
utar ghanta khisko lattu reel gud rath
ulta nishana tadit chehra kataar khoh dwar
pat-musal pat-ghanti pat-bhitar pat-nawka pat-toll pat-hauled-basket pat-mound pat-charkhi pat-ginti-pad
(+ the old nine twists: spikes crush swap shy sink rise wall fake none)

## CHN (Chennai, Tamil Nadu): ideas used (hardness pass, 10 stages)
- **01 tour bite** the sundal cart on the promenade: the vendor lifts the pan's lid on a steady beat and its steam stands
  over the path while it is up; as you come near the beat lies once (a short shut, then up again). The honest tell is his
  hand on the handle before every lift (`SundalCart`, `chn-sundal`, `chn-sooda`).
- **09 Murukku Press** a brass press on a rail lays spiral strands into a kadai of hot oil: pale dough folds under you,
  fried golden holds, and the cook's ladle lifts the oldest out first, so the golden one you wait on is the one he takes.
  Acts: the ladle takes the darkest and drips on the one before (`chn09-karandi`), a big spiral's open eye with the press
  over its far turn (`chn09-kannu`), thenkuzhal fries white and never turns: read the oil going quiet (`chn09-thenkuzhal`),
  a row laid together is one age, wait then run it against the ladle's order (`chn09-varisai`, the stage's labelled
  momentum beat). Door `chn-fresh-curtain`: pale strands part for a walker; stop and the burner fries them into a wall.
- **10 Spencer Escalators** the old mall's escalators run by load: one rider up, two down fast into the comb plate; give
  the ride away (hop back to the kerb), then ride. Callbacks that break their rule: four aboard crawl up, so stay on
  (`chn10-moodal`); indoors the shimmer is polish and the dark is the well, and on the food court display the pale spirals
  are real and the golden ones plaster that gives at a touch (`chn10-kaanal`); the billing queue's third trolley is the
  locked one (`chn10-billing`). Door `chn-wet-floor-sign` is plain.
- **Cut, and why:** `chn09-ruchi` (keep going before the cook snaps the near end: KVT-08's keep moving, registry S9),
  `chn10-keezhe` (ride the down escalator up with the kid: any escalator can be hopped up, the trick had no teeth); the
  plaster display, once `chn10-pattarai` (stand a second and it crumbles: keep moving again), is now kaanal's second half
  and gives at a touch.

## DIS (Dispur, Assam): ideas used (module city, 10 stages)
- **01 Nomoskar Guwahati** a tea boy walks the promenade at you with a tray of lal chah swinging out in front: touch him
  or the tray and you are scalded, hop clean over him and the tray tips where you land; wait back while he pours.
- **02 Char** sandbars placed by a numbered level post: a siren raises it a mark, new bars rise first (dashed outline),
  a bar that stays narrows second (keeps its left end), bars that go sink last. Acts: the farmer's hut bar never moves
  (`dis02-chapori`); the bhutbhuti ferry's horn sounds like the siren but the post does not move (`dis02-bhutbhuti`).
- **03 Duta Paat, Ekta Kuhi** tea hedges taller than a jump step down only once picked; follow the plucker, whose
  basket swings all round her while she picks. Act: a sprinkler wets the path and you slide (`dis03-bagan`).
- **04 Talatal** the cellar stair falls step by step behind you as you go down; the step before the last rises back.
  Act: three stairwells, the lit one flooded, of the dark two only the one the lantern's flame streams toward goes
  through (`dis04-batah`). Door `dis-laru-plate`: hop the rolling laru.
- **05 Gamosa** every host who touches you puts a gamosa on you; at three the cloth hides your feet and the pit under
  it; give one away by walking into a host in a red sash. Acts: one giver right before a pit, hop him (`dis05-atithi`);
  a bamboo laid over the nala shows only by its shadow (`dis05-sanko`); the Uruka feast's banana leaves are the floor
  and tip under a jump (`dis05-feast`); the japi-maker's bamboo splits slide the way their arrow shows when you jump at
  them (`dis05-kaath`); keep up with the carpenter planking the machan before the drum roll (`dis05-machan`).
- **06 Majuli ka Paar** bamboo spurs on an eroding bank: the slab upstream of a spur goes early, silt builds a step
  behind it. Acts: shelter from the ferry's wake in the spur's lee (`dis06-wake`); fish traps on pulleys, a ringing one
  is about to be hoisted, a slack one tips (`dis06-traps`); the ghat man moves his landing flag as the river rises
  (`dis06-flag`). Door `dis-tea-ladder`.
- **07 Husori** (marathon) bamboo gates open only for the husori group with you inside its ring. Acts: pond planks rise
  on the dhol's quickening beat (`dis07-dhol`, the momentum beat); jute twisted into rope, still by the post, whipped in
  the middle (`dis07-rope`); the Goru Bihu bull charges along the lane, get out of it sideways (`dis07-goru`); tekeli
  bhonga, get to the side the crowd is not shouting (`dis07-tekeli`); the Kaziranga gate's timed card and the hog deer
  corridors (`dis07-card`); the pitha trail on the singers' cart that rolls off over the pond (`dis07-cart`); the host's
  gamosa ritual holds the middle gate (`dis07-chowk`); wait for the next group's pepa behind you (`dis07-pepa`).
- **08 Gorh** no floor under the elephant grass but the strip a rhino flattens when it charges at a jeep's dust. Acts:
  it stops halfway and charges on at a nearer jeep (`dis08-jeep`); it charges the nearer jeep, not the louder
  (`dis08-duijeep`); egrets on a hidden rhino's back rise when it charges (`dis08-bogoli`).
- **09 Rang Ghar** the oiled boat roof pushes you down; ribs and grip pads; landing on oil drops a laru from the gutter.
  Acts: the tug-of-war rope is floor only while taut and drifts toward the winner (`dis09-tug`); the steepest oil
  (`dis09-chaal`); Joysagar's sluice bell, wait out the flood on the embankment (`dis09-sluice`); tunnel mouths come up a
  step behind on the next pier (`dis09-tunnels`).
- **10 Luit** (finale) a plain bank with the level post on the far bank; callbacks that break their rule: the tired
  drummer slows (`dis10-dhol`), the tug teams changed ends (`dis10-tug`), the stair falls from the bottom up with a low
  cellar vault at its foot (`dis10-talatal`). Door `dis-post-bank`: the plucker's bars rise ahead of her, go in front.
- **Plain doors:** `dis-hut-shut`, `dis-muga-reel`, `dis-uruka-net`, `dis-watch-tower`, `dis-royal-seat` (each re-asked
  an act or its room). **Cut, and why:** `dis08-bagori` (a rhino from behind, get up on the hay: `dis06-wake`'s and
  `dis07-goru`'s decision), `dis07-bordoisila` and `dis10-bordoisila` (shelter-and-wait), `dis10-gamosa` (05's rule
  again), and the earlier length-round cuts listed in `docs/cities/DIS.md`.

## KVT (Kavaratti, Lakshadweep): ideas used (hardness pass, 10 stages)
- **01 tour bite** the coral step out to the boat shrinks with the tide as you come down the beach (`CoralStep`).
- **09 Kalpeni Kadalkara** storm rubble: every landing slides you a tile towards the lagoon (`RubbleBank`, with `dir`,
  `ridge` and `carry`); climb by walking to each step's far end and tapping up; never a full leap under a beach-rock
  lip; over the summit walk off, never hop down; the sea wall's heap you land deep on, its loose block you jump
  whole; a ridge where only the middle holds; storm cuts you jump well past; the shingle that carries you under a
  lip (`kvt09-ozhukku`). Door `kvt-buried-door`: three hops slide the heap off the door, a fourth tips you in.
- **10 Neerali Kuzhi** an octopus drawn as a coral head of the same colour; its den, the dark shell-ringed hole, is
  solid. Callbacks that break each KVT rule: the rotten plank is the way down (`kvt10-palaka`), land mid-step, the
  far tile is the octopus (`kvt10-kallu`), run on from the nest behind (`kvt10-aama`), walk under the high tuna
  (`kvt10-choora`), leap from the trunk (`kvt10-thengu`), wait for the moray's second strike (`kvt10-irandu`), jump
  with the wind (`kvt10-kaattu`), ride the dolphin under the arch and step off coming down (`kvt10-kamaanam`), step on
  after the lighthouse beam (`kvt10-nizhal`), stand still on heads that sink while you move (`kvt10-veliyettam`), the
  reef that rises for a jumper (`kvt10-paaru`), chase the boat that is not coming back (`kvt10-thoni`), the tide steps
  and the hole with eyes (`kvt10-irakkam`). Door `kvt-sand-arm`: the octopus's arm is the patch of sand that moves.
- **Cut, and why:** `kvt10-kannadi` (glass that holds only a runner: KVT-08's keep moving), `kvt10-kotta` (stay in the
  basket past a rotten landing: Gangtok's yak photo stops, earlier).

## LKO (Lucknow, Uttar Pradesh): ideas used (module city, 10 stages)
- **01 Aadaab Lucknow** Chowk's cloth bolts over a dug-up lane: land on one and it is sold, the shopkeeper's hook slides
  it out sideways from under you; then a long bolt unrolls down across the road, run under before it lands.
- **02 Pehle Aap** the first through the haveli doorway gets the loose threshold stone; stand still (a bow) and he
  goes first; acts: the man behind who offers you the way (`lko02-gali`), the bowing stand-off (`lko02-takrar`); door:
  the haveli door opens outwards over the two tiles in front of it (`lko-kiwad`).
- **03 Chhapa** printed vine and jali wash off at the dhobi's whistles, the stitched flowers stay; acts: run the print
  without stopping (`lko03-kunda`), the karigar's hoop carries you flower to flower (`lko03-adda`), the rangrez dips
  the far half of the muslin (`lko03-rang`); door: the threshold is cloth over the vat (`lko-balti`).
- **04 Makhan Malai** the malai tile facing the low sun sinks, the shaded one holds; the halwai's lid turns the light;
  act: single cups shaded only by a kulhad stack's shortening shadow (`lko04-chowk`).
- **05 Galouti** stand on a heap to squash it flat so your hop clears the seekh rack; flat burns through if you linger;
  acts `lko05-tawa`, `-lane`, `-ulta`, `-bhara`, `-ghee` (set heaps your weight cannot flatten), `-charkhi` (the
  turning spit); door: the sheermal slapped on the tandoor wall is a ledge until it bakes (`lko-sheermal`).
- **06 Kathak** red ghungroo strips ring and the dancer spins to the sound; acts: the moving tatkar patch
  (`lko06-tatkar`), every stamp swaps left and right (`lko06-guru`), she spins the stage end to end (`lko06-mehfil`).
- **07 Hazratganj** rush and the strollers close ranks into the nala, pause and they part; acts: the shivering awning
  (`lko07-shaam`), lamplighters' ladders (`lko07-batti`), walk behind the procession (`lko07-julus`), through the posing
  group in the flash (`lko07-photo`), the window-shopper who steps back blind (`lko07-dukaan`).
- **08 Bhool Bhulaiya** through an arch at a jump you come out a floor up, on foot you stay; acts `lko08-chausar`
  (cowrie throw lights the squares), `-toota` (a crownless arch lifts no one), `-utar` (falling through takes you down),
  `-wapas` (backwards at a jump takes you down), `-upar` (come down on to the arch tops), `-darwaza` (the arch has
  moved), `-sargoshi` (the whispering gallery), `-roshandan` (down-lit patches are floor).
- **09 Kabootarbazi** the flag: red the flock circles, white it lands on the roof ahead of you; acts `lko09-gumbad`
  (white domes in a garden tank, the third is the reflection), `-hawa` (the flag's far face), `-jhande` (the nearer
  flag), `-seeti` (the whistle duel), `-girah` (a tumble is not a landing).
- **10 Lakhnavi Tehzeeb** bells sewn under chikan covers before the door: a bow rings them and the dancer spins to you;
  callbacks that break their rule: `lko10-tasveer`, `lko10-daana` (grain beats the flag), `lko10-seedha` (a stamp
  swaps nothing), `lko10-thahra` (the maze stays put).
- **Plain doors (fix round 6):** `lko-kulhad`, `lko-sam`, `lko-darban`, `lko-489`, `lko-chhatri`, `lko-tehzeeb` (each
  re-asked its own room); the ids stay and their ideas are free again.
- **Cut, and why:** fix round 6 cut `lko02-aadaab`, `lko04-badal`, `lko05-dum`, `lko06-tihai`, `lko07-chauraha`,
  `lko08-minar`, `lko08-mehrab`, `lko10-dhulai`, `-julus`, `-raasta`, `-chirag`, `-do`, `-galiyara`; fix round 7 cut
  `lko10-darbar` (02's refusal again) and `lko10-jawab` (a greeting the city no longer teaches).

## PAT (Patna, Bihar): ideas used (module city, 10 stages)
- **01 Prannam, Patna!** a tempo pulls in behind you at the bus stop and the waiting crowd surges along the road
  to it (climb on the kerb board, then run on before the tempo pulls out).
- **02 Litti ki Aanch** the poker digs where the cracks in the ash are (three strikes, then the rake); act: the poker
  follows a rolling litti; door: two pestles pounding chokha mortars (`pat-musal`).
- **03 Ashok Rajpath** hoardings are the platforms; at the class bell each is swapped for a banner whose width shows
  in the roll above it (grows from its left end, or is pulled taut towards its right end); door: bell-rope
  pendulums (`pat-ghanti`).
- **04 Golghar** porters come down the stair you climb, a second steps out of a landing door; act: grain rises in the
  dome; door leaf swings out across the road (`pat-bhitar`).
- **05 Pipa Pul** pontoon sections sink under the handcart rolling on them; jump the cart's section; door: the last
  float drifts off with the door on it (`pat-nawka`).
- **06 Setu ka Jod** every seam looks plated and numbered, but the plates whose number is a multiple of the sacks on the
  parked truck are tarps laid over the gap: count the sacks, jump the tarps; door: toll sensor strip slams a boom barrier (`pat-toll`).
- **07 Tempo** the deck leans to the heavier side (riders on the kerb side, a truck on either side); scrape an arch or a
  hump while leaning and you die; act: a third tempo backs into the lane between two parked ones; door: the
  hauled basket whose rope slips (`pat-hauled-basket`).
- **08 Nalanda** (how would I know) each hatch takes you to the cell with the same number of bricks in the next
  courtyard; the others have a well; door: the library mound, decoy hatches and a door with zero bricks (`pat-mound`).
- **09 Sonepur Mela** the crowd parts only behind a horse rider; the giant wheel's occupied gondolas swing you off;
  door: a four-armed turnstile (`pat-charkhi`).
- **10 Setu se Golghar** the sacks on a parked handcart are the rule for the part: every n-th plate gone on the
  bridge, every n-th pontoon section awash, the pad numbered n opens the granary door (`pat-ginti-pad`).
- **Length pass and fix round (PAT):** 02 a second bed with two litti, each with its own strike (`pat02-bhatti`); 03 a
  banner can narrow from its right end (`pat03-patti`); 04 a second flight with three porters (`pat04-sidhi`); 05
  porters load sacks on pontoon sections, and the second sack slides along its rope before it lands (`pat05-bori`); 06
  the count changes from truck to truck (3, 2, 3 sacks) and trucks lift plates, the second window with a second truck
  behind the first (`pat06-gaadi`); 07 riders on the road side, riders on both sides, a halt right before a hump, three
  scrapes in a row (`pat07-pul`, `-haat`, `-mandi`); 09 the horse turns back (`pat09-wapsi`); 10 the cart's sack count
  sets which pontoon sections the porters load and which plates the trucks lift (`pat10-bori`, `pat10-gaadi`).
- **Fix round 2 (PAT):** 05 stays at its honest length (no extra act after round 4); 06 the truck at the foot is unloaded while you read it and a second truck half-way is loaded, so the count that
  counts is the one left when the porter has finished (`pat06-ginti`); 10 callbacks: the coaching hoardings with the
  cart's three sacks naming the narrowing bell (`pat10-roll`) and the shared tempo with sacks as riders (`pat10-tempo`).
