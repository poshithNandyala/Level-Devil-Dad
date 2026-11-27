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
- A tram rail whose groove locks a foot landed from a jump and steers you along it (CCU-01), kumir-danga
  chalk rivers safe only while the kumir counts (CCU-01), a bus that never stops: off only forwards on the
  conductor's "aaste" crawl (CCU-02), a jhalmuri tin whose shake sinks the muri and lifts the peanuts, a
  chilli coming up where you landed (CCU-03), book stacks that drop one when a customer points (CCU-04),
  clay figures carried out when the paint reaches the crown, dry ones cracking under a landing (CCU-05),
  a trolley pole that sweeps the roof at a wire junction and points that turn the tram off (CCU-06),
  porters' head-loads as platforms that set down at a marked CHA board (CCU-07), standing still among
  the old men on the rok joins their adda until the tea seller passes (CCU-08), cloth panels tied where
  your next foothold was, lifting you when the next is tied above (CCU-09).

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
ccu03-dokan ccu04-thak ccu05-lane ccu05-ghat
ccu06-points ccu06-duiline ccu07-girder ccu07-dui ccu07-horn ccu07-board ccu07-pylon ccu07-jowar
ccu08-rok ccu09-sinri ccu09-toran ccu09-chala ccu09-dhak ccu09-uthan ccu09-line
ccu10-bus ccu10-tram ccu10-chhad ccu10-phire ccu10-pherot ccu10-kumor ccu10-khola ccu10-kumir ccu10-setu
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
ccu-stop ccu-thonga ccu-set ccu-murti ccu-pole-turn ccu-arch ccu-dorja ccu-dwar-kapor ccu-stup
pat-musal pat-ghanti pat-bhitar pat-nawka pat-toll pat-hauled-basket pat-mound pat-charkhi pat-ginti-pad
(+ the old nine twists: spikes crush swap shy sink rise wall fake none)

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
