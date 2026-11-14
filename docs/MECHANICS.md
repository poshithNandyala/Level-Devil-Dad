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
  (KVT-02), waterfalls (BLR-08, `cascade` kit), lakes (BPL-02, BPL-08).
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
  Carnival (PNJ-08), Hareli (RPR-02), Bastar Dussehra (RPR-08).
- **Sports already used:** cricket (CHN-04), football (PNJ-03, `penalty`), kabaddi (`kabaddi`).
- **Doors:** knock (`knock`, unused but taken), fake and painted doors (`fakewin`, `paintwall`,
  `invisible`, `backdoor`), a door that moves, hides or must be caught (`shy` twist, `catch`, `lattu`), a door
  you're carried to (`reel`), a toss up on to a gate (`salaami`). Read every `advice:` line in
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

## Hazards and kit (traps.ts, kit.ts, abilities.ts, goa.ts)
Springs/spouts, blinkers (timed platforms), gusts/wind, geysers, cascades, rollers, riders, shots,
electric arcs, mist clouds, rising floods with floaters, treadmills/moving walkways, trains and
shuttles, crumbling/dropping/shy floors, pop-up spikes, rising walls, ceiling drops, chasers, coconuts
and rockfall, heat shimmer (fake road), crabs, eels, jellyfish, urchins, bending palms, tilting
gangway slope push (PNJ ending), sliding hammock bounce counter, clock-hand circular lift, kite strings
(manja) as height caps, babool thorn branches, forest gates (naka), a safari jeep ridden backwards,
window breezes, broken-glass floors, half-shut shutters, sword dancers on a count, Diwali rockets on a fuse.

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
(+ the old nine twists: spikes crush swap shy sink rise wall fake none)
