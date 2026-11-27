# Cities: what's done, what's next

The journey runs south to north through every state and UT capital (36 chapters, `CHAPTERS` in
`src/game/cities.ts`, pins in `src/map/india-data.ts`). **17 done (142 stages), 19 to go.**
The 15 cities done before the modules have 8 stages: 01 is a welcome tour, 02–08 are long stages (a room + an act + a door
ending), harder each time; 08 is the finale and may call back to its own city's ideas (never another city's).
**Every new city has 10 stages** (01 tour, 02–10 long stages, 10 the finale), built as a module:
`docs/CITY-MODULE.md`.

How to use this file:
- **Done** tables are generated from the game itself, so they're exact. Ids in the Act and Door columns
  are taken forever (see `docs/MECHANICS.md`).
- **To do** notes are a starting point, not research. Anything marked *(verify)* is unsure. Check every
  word of local language with native sources before it goes in the game (format in
  `docs/research-prompt.md`). "Watch out" lists ideas already used that the city's obvious hooks
  run into. "Avoid" is a hard no.
- When a city ships, move it to Done (regenerate its table from `LEVELS`) and add its ideas to MECHANICS.md.

## The journey

| # | Id | Capital | State / UT | Region | Language mix (in English letters) | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | TVM | Thiruvananthapuram | Kerala | South | Malayalam + English | done |
| 2 | KVT | Kavaratti (bonus) | Lakshadweep | South | Jeseri words + Malayalam + English | done |
| 3 | CHN | Chennai | Tamil Nadu | South | Chennai Tamil + English | done |
| 4 | PDY | Puducherry | Puducherry | South | Tamil + English + a little French | done |
| 5 | BLR | Bengaluru | Karnataka | South | Kannada + English | done |
| 6 | AMR | Amaravati | Andhra Pradesh | South | Telugu (coastal Andhra) + English | done |
| 7 | HYD | Hyderabad | Telangana | South | Telugu + Hindi (Dakhni) + English | done |
| 8 | PNJ | Panaji | Goa | West | Konkani + English | done |
| 9 | BOM | Mumbai | Maharashtra | West | Marathi + Hindi + English | done |
| 10 | DMN | Daman (bonus) | Dadra & Nagar Haveli and Daman & Diu | West | Gujarati + English | done |
| 11 | GNR | Gandhinagar (+ Ahmedabad) | Gujarat | West | Gujarati + English | done |
| 12 | JAI | Jaipur | Rajasthan | West | Rajasthani + English | done |
| 13 | BPL | Bhopal | Madhya Pradesh | Central | Bhopali Hindi + English | done |
| 14 | RPR | Raipur | Chhattisgarh | Central | Chhattisgarhi + English | done |
| 15 | RNC | Ranchi | Jharkhand | Central | Nagpuri (Sadri) + Hindi + English | done |
| 16 | PAT | Patna | Bihar | Central | Magahi / Bhojpuri + Hindi + English | done (10 stages, v0.17.0) |
| 17 | LKO | Lucknow | Uttar Pradesh | Central | Lakhnavi Hindustani (Urdu-rich) + Awadhi + English | to do |
| 18 | BBI | Bhubaneswar | Odisha | East | Odia + Hindi + English | to do |
| 19 | CCU | Kolkata | West Bengal | East | Bengali + Hindi + English | to do |
| 20 | SVP | Sri Vijaya Puram (bonus) | Andaman & Nicobar Islands | East | Andaman Hindi + Bengali/Tamil/Telugu + English | done (10 stages, v0.17.3) |
| 21 | GTK | Gangtok | Sikkim | East | Nepali + Hindi + English | to do |
| 22 | DIS | Dispur (Guwahati) | Assam | Northeast | Assamese + Hindi + English | to do |
| 23 | SHL | Shillong | Meghalaya | Northeast | Khasi + English | to do |
| 24 | ITA | Itanagar | Arunachal Pradesh | Northeast | Arunachali Hindi + Nyishi + English | to do |
| 25 | KOH | Kohima | Nagaland | Northeast | Nagamese + English | to do |
| 26 | IMP | Imphal | Manipur | Northeast | Meitei (Manipuri) + Hindi + English | to do |
| 27 | AIZ | Aizawl | Mizoram | Northeast | Mizo + English | to do |
| 28 | AGT | Agartala | Tripura | Northeast | Bengali + Kokborok + Hindi + English | to do |
| 29 | DEL | New Delhi | Delhi | North | Delhi Hindi (Hinglish) + Punjabi flavour + English | to do |
| 30 | CHP | Chandigarh | Punjab | North | Punjabi + Hindi + English | to do |
| 31 | CHH | Chandigarh | Haryana | North | Haryanvi + Hindi + English | to do |
| 32 | DDN | Dehradun | Uttarakhand | North | Garhwali + Hindi + English | to do |
| 33 | SML | Shimla | Himachal Pradesh | North | Pahari + Hindi + English | to do |
| 34 | JMU | Jammu (winter capital) | Jammu & Kashmir | North | Dogri + Hindi + Punjabi + English | to do |
| 35 | SXR | Srinagar (summer capital) | Jammu & Kashmir | North | Kashmiri + Urdu/Hindi + English | to do |
| 36 | LEH | Leh | Ladakh | North | Ladakhi + Hindi + English | to do |

Language rules (from the research brief, all cities): English letters only, spelled the way locals type on
WhatsApp. Every spoken line is `"Local | English"` (the bubble shows the local line, then the English).
South: local language + English, Hindi at most once or twice a city. Hyderabad: Telugu + Dakhni + English.
Elsewhere, write what the city really speaks: so far that has been the local language + English, with Hindi
where it *is* the city's own speech (Mumbai's Bambaiya, Bhopal's Bhopali Hindi). Further north and east, mix
in Hindi where people really use it, and use the real link language where that's what people speak
(Nagamese, Nepali, Arunachali Hindi). Max 8 words a line.
No swearing, slurs, caste, religion, politics, regional digs, real brands, real people, film dialogue or
song lyrics. Affectionate teasing locals would proudly share; never mean.

## Done
### TVM · Thiruvananthapuram, Kerala

- Language: Malayalam + English · Hello: "Namaskaram! | Hello!" · Hidden item: chaaya (tea, `tvm-chaaya`) · Seventh death: the chaaya-kada chechi counts seven glasses
- Red buses, coconut palms and chaaya in the rain.

| Stage | Name (meaning) | What it is | Act | Door ending |
| --- | --- | --- | --- | --- |
| TVM-01 | Swagatham (Welcome to Thiruvananthapuram) | Welcome tour past landmarks while the guide tells you real things about the city, and the city betrays you every few steps: the monsoon-soaked road after Tara's welcome holds a walker and breaks under a hop (walk it); any hop near the compound wall puts broken glass on it (jump clean over) and the road past it is strewn with more (hop again at once); the ditch is only a puddle to wade (jump it and its far side bristles); the rocket at Thumba launches as you come over the top of the steps and its blast burns the road (stop up there): it has two stages, the first comes down on the last step and the second at the foot of the steps (hop them once they're down); the canoe's landing gives way; the puttu stall's tarp is full of rain (stop short and let it empty) and the puddle past it is a pothole (jump it); and at Connemara market a slab of fish ice bridges the drain: it twitches 16 px as you come and two beats later the porter yanks it 3 tiles on to the far side (don't step on after the twitch: wait for the yank, then a long jump on to the ice). Three checkpoints, so each run between them is a Level Devil level. Tara cheers you into two of them: "Jump, Dad!" at the ditch, "Hurry!" at the puttu stall. | — | — |
| TVM-02 | Aanavandi Express (The elephant-bus express) | Monsoon flood. One red bus. Ride on the roof. The conductor's bells: one bell, he brakes and you slide forward; two bells, he jerks off and you slide back off the roof, so ride the middle. But a chunk of the first flyover falls on the middle of the roof (ride the back) and one of the second on the front (ride the middle): dark cracks in the decks show where. Hop the crows, not the Brahminy kite: it glides over a dad who stands and meets one who hops (Tara shouts "Jump!"). One checkpoint. | — | room twist |
| TVM-03 | Chaaya Later (Tea later) | A tea street. Everything is hot, and half of it is a trick: steam hides spikes, the tea master starts his long pour the moment you're out of the steam and pulls it twice ("Onnoode!": cross after the second pull), glasses slide down the counter at you and its end gives way, boiling sprays, a painted floor over the drain (two tiles nearer than it was) whose jump brings up spikes where a short one lands, a scooter from behind and, the moment it's by (Tara: "Safe now!"), one the other way, and the door hops back over you on to broken tea glasses. | — | room twist |
| TVM-04 | Thenga Trajectory (Coconut trajectory) | Gravity in Kerala always finds Dad’s head. Coconuts fall where you're going and on whoever stops under a palm (Tara: "Stand in the shade!"; stop between the palms), one waits for your jump over the gap (bait it), a palm crashes across the river and sinks, fallen fronds hide a coir pit (Tara says walk on them), the last grove drops its nuts in a wave and its last palm keeps one back for the dad who follows the wave (stop short and let it fall), and the last gap's far bank backs away from your first jump. One checkpoint. | — | room twist |
| TVM-05 | Fort Gate Forward | Two gates, a moat, a headwind and one very light sleeper. The first gatehouse hides a second portcullis that drops as you pass under the first (stop between them); the moat's stones crumble and the mud at the bank's edge goes the moment you land on it (jump long off the last stone), then stop: the next gate drops right there; spikes pop before the dog, and jumping near the dog sends the door back (Tara: "Jump over it!"); land past the spikes and the dog growls in its sleep, so the dad who backs off steps on the spikes he just jumped. One checkpoint. | — | room twist |
| TVM-06 | Cheena Vala (Chinese fishing nets) | Fort Kochi’s giant fishing nets go up and down all day. You are today’s catch. The swell crashes over the edge of the promenade while the first net is down (wait back from the edge), a crow, nets that dip in a wave, a last net that dips the moment you land (and slams its stones down on the bank's edge when you leave it with a short hop), a boat that flips, jetty spikes and a shy door. On the last net Tara tells the truth for once: "Jump right now!" *Scene: Fort Kochi.* | — | room twist |
| TVM-07 | Munnar Hairpins (Munnar hill road) | Hairpin bends, tea terraces, mist, and jeeps that never slow down: a spike comes out of the road, the jeep backs up for another go, the middle terrace gives way, a landslide boulder, mist hiding three spike pits, rocks off the cutting (the second comes down where you'd stop to let it fall: keep going, watch the pebbles), a step that drops if you land on it (Tara: "Come down the steps!"), and the factory shutter. Two long runs between checkpoints. *Scene: Munnar.* | — | room twist |
| TVM-08 | Vallam Kali (Snake-boat race) | The snake boat race at Alappuzha. A hundred oarsmen, and they don’t stop for bridges. Hop up over the low footbridges, hold jump for the tall one, stay seated under the high one (its deck grows spikes if you hop at it), crows, a sprint, and spikes on the finish jetty that sink back after a moment (wait, then walk: hop them and more come up where you land). Tara lies at the third bridge ("Get up on top!") and tells the truth at the fourth ("Jump up on this bridge!"): read the bridge, not Tara. One checkpoint. *Scene: Alappuzha.* | — | room twist |
| TVM-09 | Kovalam Flags (Swim between the flags) | Kovalam's lifeguard plants two flags: when a wave runs in, only the sand between them is dry, the rest is the drift. Before every wave he whistles and carries the flags somewhere new, so the strip you trusted is the rip next time. Hawa beach: on, then on again; Lighthouse beach: back behind you, then far on past a rock pool; Samudra beach: planted, then brought back (Tara: "He planted them there! Run!"), then a long run; Pozhikkara: far on past a rock pool, then back over it; Ashoka beach: he paces and puts them back where they were, then carries them on. Four hidden checkpoints. | tvm09-vilakku, tvm09-samudra, tvm09-pozhikkara, tvm09-ashoka | tvm-backwash-ride: open sand with no flags, too long to cross between waves; step in as a wave runs back out and the backwash carries you to the door |
| TVM-10 | Dhara (The oil pot) | An Ayurveda hall: dhara pots swing over the troughs on crooked arms, so the oil they drip at the middle of the swing lands beside the hook, not under it. Feet on oil go: you slide and can't jump. Room: the oil at the first trough's take-off (jump from before it), then at the second's landing, before a sunk kindi (a short hop, then a long jump). Courtyard (calls back the tour's tarp): the rain off the full tarp washes the oil off the trough's edge, then a pot drips by the coconut palm (slide and you stop under it). Thumba (the tour's rocket on flat ground: stop at once). Shore (calls back TVM-09 and the tour's soaked road): the way to the new flags is dark soaked sand that looks like the rip; walk it, a hop breaks it. Palm beach: the flags under a coconut palm, stand clear of the crown. Treatment rooms: the pots in the other order. Tarp beach: the flags under the tour's full tarp, let it empty first. Chalai market (calls back the tour's fish ice): wait for the yank, then jump the oil and a kindi off the ice. 7th death goes back to the act. | tvm10-kizhi, tvm10-thumba, tvm10-theeram, tvm10-kadappuram, tvm10-uzhichil, tvm10-thira, tvm10-chanda | tvm-oily-feet-coir-mat: oily feet slip straight back off the polished doorstep into the gutter; walk across the coir mat over the first gutter (don't jump it) and it wipes them |

### KVT · Kavaratti, Lakshadweep

- Language: Jeseri words + Malayalam + English · Hello: "Hello from the billam! | Hello from the lagoon!" · Hidden item: shell
- A tiny coral island, a calm lagoon and boats on a timetable.

| Stage | Name (meaning) | What it is | Act | Door ending |
| --- | --- | --- | --- | --- |
| KVT-01 | Swagatham, Billam (Welcome to Kavaratti) | Welcome tour past landmarks while the guide tells you real things about the city. Coral sand, a glass-clear lagoon and boats that run on a timetable. As you cross the jetty, a green turtle nest on the beach below hatches: never step on a baby, and they spread wider than any jump. Stop on the jetty till every one is in the water. Then the coral step out to the boat: the tide is dropping, and it shrinks from three tiles to its one-tile top as you come down the beach; wait at the water's edge, then hop on to the top and off. | — | — |
| KVT-02 | Odam Gone (The boat’s gone) | The boat waits for the tide, never for your jump. The last two planks by the boat go too, if you stand there waiting for it. | `kvt02-glass` | `kvt-loading` |
| KVT-03 | Supari Light (Lighthouse on the island) | The lighthouse beam builds your bridge. For a moment. | `kvt03-faith` | `kvt-reflection` |
| KVT-04 | Agatti Airstrip | One runway, one flight a day, and the whole island watching. *Scene: Agatti.* | `kvt04-tailwind` | `kvt-glider` |
| KVT-05 | Minicoy Tuna | Pole-and-line tuna fishing: the fish come out of the sea and fly over your head. *Scene: Minicoy.* | `kvt05-lift` | `kvt-trapdoor` |
| KVT-06 | Phar Mungal (Diving the reef) | India’s scuba school. The fish are friendly. The reef is not. *Scene: Kavaratti lagoon.* | `kvt06-air`, `kvt06-eels` | `kvt-safetystop` |
| KVT-07 | Thengu Kayaru (Up the palm) | Coconut country: every islander can climb a palm. Can Dad? | `kvt07-crabs`, `kvt07-bend` | `kvt-pushoff` |
| KVT-08 | Billam Ottam (Running on the lagoon) | Run fast enough and the lagoon holds you up. Stop, and it doesn’t. *Scene: Bangaram lagoon.* The sandbar is only there at low tide: stop on it and it goes under. | `kvt08-weed`, `kvt08-dolphins` | `kvt-footsteps` |
| KVT-09 | Kalpeni Kadalkara (Kalpeni Storm Bank) | A cyclone threw a hill of coral rubble up on the shore, and it still moves: every landing on it slides you one tile towards the lagoon. Land near a step's lagoon edge and the slide takes you over it and the rubble you brought down carries you into the water: walk to the far end of each step, then a tap up. Under the jagged beach-rock lip a full leap hits it; near the top the steps narrow to two tiles; over the summit the lagoon is on the other side, so walk off each step (a hop down slides you off the far edge); then the sea wall (land deep on the heap in the first break, jump the loose block in the second whole) a shelf of shingle under a low lip that carries you under it if you let it slide you off (land short, never jump), and a ridge of three heaps, wide, narrow and wider, with water on both sides (land in the middle); the crest's two storm cuts want a long jump well past them. *Scene: Kalpeni.* | `kvt09-pavizham`, `kvt09-kodumudi`, `kvt09-kadalbhitti`, `kvt09-ozhukku`, `kvt09-varambu`, `kvt09-murivu` | `kvt-buried-door` |
| KVT-10 | Neerali Kuzhi (Octopus Hole) | One coral head is an octopus, the colour of the coral; its den is the dark hole with shells round it, and solid. Jump the octopus, stand on the den. Then a bare dark hole that goes right through, and an octopus that crawls to another head and turns its colour as you come; then every KVT idea comes back and breaks the rule it taught: a rotten plank that is the way down (jump it and the far planks go), an octopus on the rubble's far tile, a turtle nest behind you, tuna high then low, a crab in the coconut crown, morays that strike twice, a headwind, a dolphin under a jagged arch, the lighthouse beam taking steps away, the incoming tide (heads that sink while you move on them, not when you stop), a reef that rises only for a jumper, a basket you stay in to the end (the landing it passes is rotten), a boat that is not coming back; last the tour's coral steps shrinking with the tide, and between them a hole with eyes in it (a moray). Closing stage. *Scene: Kavaratti lagoon.* | `kvt10-midden`, `kvt10-palaka`, `kvt10-kallu`, `kvt10-aama`, `kvt10-choora`, `kvt10-thengu`, `kvt10-irandu`, `kvt10-kaattu`, `kvt10-kamaanam`, `kvt10-nizhal`, `kvt10-veliyettam`, `kvt10-paaru`, `kvt10-kotta`, `kvt10-thoni`, `kvt10-irakkam` | `kvt-sand-arm` |

### CHN · Chennai, Tamil Nadu

- Language: Chennai Tamil + English · Hello: "Vanakkam! | Hello!" · Hidden item: tumbler (filter kaapi) · Seventh death: the kaapi tumbler is topped up the seventh time
- Filter kaapi, share autos and a very long beach. Ten stages since the extend pass (`docs/cities/CHN.md`): the two encores are the murukku kitchen and the old mall's escalators.

| Stage | Name (meaning) | What it is | Act | Door ending |
| --- | --- | --- | --- | --- |
| CHN-01 | Vanakkam Chennai (Welcome to Chennai) | Welcome tour past landmarks while the guide tells you real things about the city. Filter kaapi, share autos and a very, very long beach. On the promenade a sundal cart steams over the path each time the vendor lifts the lid, on a steady beat; the beat lies once as you come up (he lifts it again right after shutting it): watch his hand, not the lid (`SundalCart`, archetype B5). Near the end a Pongal pot on the street boils over ("Pongalo Pongal!"): a spout of foam over it and a hot spill across the road that runs past where it started bubbling. Back off when it bubbles; walk on when it stops steaming. | — | — |
| CHN-02 | Kudam Queue (Water-pot queue) | Everyone saved their place. Including the pots. | `chn02-queue2` | `chn-token` |
| CHN-03 | Subway Splash | One raindrop, and the subway is a swimming pool. | `chn03-frogger` | `chn-bull` |
| CHN-04 | Degree Kaapi (Proper filter coffee) | Never walk between an uncle and his morning kaapi. | `chn04-cricket` | `chn-catch` |
| CHN-05 | Agni Mirage (Peak-summer mirage) | Is that the exit, or is the sun melting your eyes? | `chn05-heat` | room twist |
| CHN-06 | Madurai Malli (Madurai jasmine) | The jasmine market in Madurai: flowers by the arm’s length, and a crowd that pushes. *Scene: Madurai.* | `chn06-ladi` | `chn-rangoli` |
| CHN-07 | Thanjavur Bommai (Thanjavur dolls) | Thanjavur’s head-shaking dolls never stop nodding. One of them says no. *Scene: Thanjavur.* | `chn07-capstone` | `chn-tips` |
| CHN-08 | Pamban Paalam (Pamban bridge) | The old sea bridge to Rameswaram. The train is behind you and the middle of the bridge lifts for ships. *Scene: Rameswaram.* | `chn08-trainroof` | `sink` |
| CHN-09 | Murukku Press (The murukku press) | A snack kitchen: the brass press lays spiral strands into the hot oil, pale and soft, and they fry golden and hard. Pale dough folds under you; golden holds; but the golden one you would wait on is the oldest and the ladle takes it. The ladle lifts the darkest first and drips on the one before it; a big spiral has an eye and the press comes down over its far turn; thenkuzhal stays white (read the bubbles); a row laid together is one age (wait, then run it); the cook tastes the near end of a finished one. | `chn09-karandi`, `chn09-kannu`, `chn09-thenkuzhal`, `chn09-varisai`, `chn09-ruchi` | `chn-fresh-curtain` |
| CHN-10 | Spencer Escalators (The mall escalators) | Chennai’s old mall. Its escalators run by load: one rider goes up, two go down, fast, into the comb plate. Give the ride away (hop back to the kerb), then ride. The finale breaks this city's own rules: four aboard crawl up (stay on when the family boards); indoors the shimmer is polish and the dark is the well; the billing queue's third trolley is the locked one (the beach taught you to skip the third); a down escalator runs up with the kid aboard; the golden display murukku are plaster. The door is plain. | `chn10-moodal`, `chn10-kaanal`, `chn10-billing`, `chn10-keezhe`, `chn10-pattarai` | `chn-wet-floor-sign` (plain) |

### PDY · Puducherry, Puducherry

- Language: Tamil + English + a little French · Hello: "Vanakkam! Bonjour! | Hello, in Tamil and in French!" · Hidden item: croissant
- Yellow walls, a rocky seafront and bicycles with baguettes.

| Stage | Name (meaning) | What it is | Act | Door ending |
| --- | --- | --- | --- | --- |
| PDY-01 | Bienvenue (Welcome to Puducherry) | Welcome tour past landmarks while the guide tells you real things about the city. Yellow walls, French street names and a rocky seafront. After the café terrace the sea breeze takes a traffic policeman's red kepi down the street, a little above your head, and he comes running after it, arm up ("Mon képi! En thoppi!"). Stand in his way and he bowls you over; hop him and he leaps for his cap as you do. Jump up and catch the cap: he stops, says "Merci beaucoup!" and takes it back. | — | — |
| PDY-02 | Rock Beach | Big black rocks. Bigger waves. Perfect rhythm. Almost. | `pdy02-pools` | `shuffle` |
| PDY-03 | Yellow Wall Jam | In White Town the walls are yellow. And a little bit jealous. | `pdy03-signs` | `mirror` |
| PDY-04 | Six O’Clock | At six the beach road closes. Everything on it must leave. Including you. | `pdy04-closing` | `lamp` |
| PDY-05 | Grand Canal | The French side, the Tamil side, and a bridge with opinions. | `pdy05-raft` | `bells` |
| PDY-06 | Paradise Beach | The boat drops you at Paradise Beach. The tide decides the rest. *Scene: Paradise Beach.* | `pdy06-palms` | `mime` |
| PDY-07 | Serenity Surf | Serenity Beach has surf schools. You have no lessons. *Scene: Serenity Beach.* | `pdy07-waves` | `rise` |
| PDY-08 | Quatorze Juillet (The fourteenth of July) | Bastille Day in the French quarter: fireworks, lanterns, and you on the rooftops. *Scene: White Town.* | `pdy08-sparks` | `fakewin` |

### BLR · Bengaluru, Karnataka

- Language: Kannada + English · Hello: "Namaskara! | Hello!" · Hidden item: kaapi
- Lovely weather, filter kaapi and traffic you can set a watch by.

| Stage | Name (meaning) | What it is | Act | Door ending |
| --- | --- | --- | --- | --- |
| BLR-01 | Namaskara Bengaluru (Welcome to Bengaluru) | Welcome tour past landmarks while the guide tells you real things about the city. Gardens, tech parks, filter kaapi and weather everyone brags about. After the metro, India's Silicon Valley has put a SMART BRIDGE over the dug-up road, and it behaves like every progress bar in town: it loads a tile at a time when you step up ("Swalpa wait maadi!"), sticks at 99%, and restarts from nothing ("Ayyo! Restart aaytu!"). Walk behind the loading edge and jump the tile that never loads. | — | — |
| BLR-02 | Green Man | The button actually works | `blr02-badge` | `revolve` |
| BLR-03 | Namma Metro (Our metro) | Opening soon. Since 2019. | `blr03-viaduct` | `pull` |
| BLR-04 | Silk Board | Signal is a suggestion | `blr04-jam` | `wall` |
| BLR-05 | Garden City Remote | Her signal, her rules | `blr05-glasshouse` | `wrap` |
| BLR-06 | Deepalankara (Festival lights) | Sunday, 7 pm: the palace switches on *Scene: Mysuru Palace.* | `blr06-powercut` | `invisible` |
| BLR-07 | Hampi Harigolu (Hampi coracle) | Boulders everywhere. One of them is awake. *Scene: Hampi.* | `blr07-crusher` | `cctv` |
| BLR-08 | Jog Jalapatha (Jog Falls) | Raja, Rani, Roarer and Rocket *Scene: Jog Falls.* | `blr08-curtain` | `spikes` |

### AMR · Amaravati, Andhra Pradesh

- Language: Telugu (coastal Andhra) + English · Hello: "Namaskaram andi! | Hello!" · Hidden item: mirchi
- A new capital rising by the Krishna, red chillies and evening punugulu.

| Stage | Name (meaning) | What it is | Act | Door ending |
| --- | --- | --- | --- | --- |
| AMR-01 | Swagatham Amaravati (Welcome to Amaravati) | Welcome tour past landmarks while the guide tells you real things about the city. A new capital rising on the Krishna, with chillies that bite back. The Telugu greeting is "Annam tinnava?" (have you eaten?): an aunty on her doorstep feeds anyone who walks past ("Tinu, tinu!"), and a full Dad's jump is a third shorter for 7 s, just as the barrage piers over the deep Krishna have one missing. Hop past her plate ("He left without eating!") or wait for the burp. | — | — |
| AMR-02 | Mirchi Mild | Guntur chillies. Mild, they said. | `amr02-powder` | `key` |
| AMR-03 | Barrage Gates | Seventy gates on the Krishna. Every one of them is watching your feet. | `amr03-logs` | `swing` |
| AMR-04 | Bezawada Blaze (Vijayawada heat) | Forty-five degrees, fresh tar, and a road roller that does not brake. | `amr04-hot` | `mirchi` |
| AMR-05 | Benz Circle | Every road leads to Benz Circle. Every direction is the wrong one. | `amr05-humps` | `speed` |
| AMR-06 | Gandikota | India’s own Grand Canyon, and one rope bridge *Scene: Gandikota.* | `amr06-zip` | `monkey` |
| AMR-07 | Belum Guhalu (Belum Caves) | Kurnool’s great cave goes deep. And dark. *Scene: Belum Caves.* | `amr07-gallery` | `dejavu` |
| AMR-08 | Vizag Beach Road | Waves, a submarine and a ropeway up the hill *Scene: Visakhapatnam.* | `amr08-shack` | `whirlwind` |

### HYD · Hyderabad, Telangana

- Language: Telugu + Hindi (Dakhni) + English · Hello: "Baagunnara! Kya haal, miya? | How are you? How's it going, buddy?" · Hidden item: chai cup
- Irani chai, Osmania biscuits and autos with a mind of their own.

| Stage | Name (meaning) | What it is | Act | Door ending |
| --- | --- | --- | --- | --- |
| HYD-01 | Khush Aamdeed (Welcome to Hyderabad) | Welcome tour: easy run past landmarks while the guide tells you real things about the city. Irani chai, Osmania biscuits, biryani and the Charminar. | — | — |
| HYD-02 | Auto Wala (The auto driver) | Bas paanch minute, saab | `hyd02-shadow` | `otp` |
| HYD-03 | Biryani Bait | Free biryani. What could go wrong? | `hyd03-cooker` | `biryani` |
| HYD-04 | Sharmila Auto | Some autos are shy | `hyd04-statue` | `gravity` |
| HYD-05 | Charminar Chase | Tara's 'pakka' exit | `hyd05-kites` | `tiny` |
| HYD-06 | Golconda Taali (The Golconda clap) | Clap at the gate and they hear it at the top *Scene: Golconda Fort.* | `hyd06-echo` | `cannon` |
| HYD-07 | Laad Bazaar | Glass bangles, by the thousand, by the Charminar *Scene: Laad Bazaar.* | `hyd07-boxes` | `backdoor` |
| HYD-08 | Ramoji Retake | Everything at the film city is a set. Everything. *Scene: Ramoji Film City.* | `hyd08-retake` | `slowmo` |

### PNJ · Panaji, Goa

- Language: Konkani + English · Hello: "Kitem khobor? | What's new?" · Hidden item: poi (Goan bread)
- Ferries on the Mandovi, lanes painted every colour, and nobody in a hurry.

| Stage | Name (meaning) | What it is | Act | Door ending |
| --- | --- | --- | --- | --- |
| PNJ-01 | Amchem Goem (Our Goa) | Welcome tour: easy run past landmarks while the guide tells you real things about the city. Ferries, painted lanes, poi at dawn and nobody in a hurry. | — | — |
| PNJ-02 | Fontainhas Gossip (The Latin Quarter talks) | Every house has a balcony. Every balcony has an aunty. | `pnj02-lane` | `poder` |
| PNJ-03 | Goal! (Goa plays football) | In Goa the football always gets there first. | `pnj03-wall` | `penalty` |
| PNJ-04 | Susegad (The afternoon siesta) | From one to four, Goa sleeps. Including the dogs. | `pnj04-street` | `clockhand` |
| PNJ-05 | Rendeiro (The toddy tapper’s ropes) | He walks from palm to palm on a rope. So can you. Probably. | `pnj05-climb` | `hammock` |
| PNJ-06 | Casino Royale (The floating casino) | On the Mandovi, the floor bets against you. | `pnj06-table` | `gangway` |
| PNJ-07 | Miramar Parasail (Flying off the beach) | The boat goes. You go. Steering is optional. Not really. | `pnj07-flight` | `sandcastle` |
| PNJ-08 | Viva Carnaval (King Momo’s parade) | Eat, drink and be merry. And when the music stops, be on a float. | `pnj08-parade` | `decree` |

### BOM · Mumbai, Maharashtra

- Language: Marathi + Hindi + English · Hello: "Namaskar! Kay mhanta? | Hello! What's up?" · Hidden item: vada pav
- Local trains, vada pav and a city that never waits.

| Stage | Name (meaning) | What it is | Act | Door ending |
| --- | --- | --- | --- | --- |
| BOM-01 | Aamchi Mumbai (Welcome to Mumbai) | Welcome tour: easy run past landmarks while the guide tells you real things about the city. Local trains, dabbawalas, vada pav and a city that never waits. | — | — |
| BOM-02 | Dabbawala Shuffle (Lunchbox carriers’ shuffle) | 200,000 lunches. One cart. | `bom02-walkway` | `bollywood` |
| BOM-03 | Fast Local | Peak hour. Every hour. | `bom03-wire` | `kabaddi` |
| BOM-04 | Monsoon Special | Water-logging expected. Obviously. | `bom04-manholes` | `dahihandi` |
| BOM-05 | Last Train to Gateway | Tara's final 'pakka' | `bom05-doors` | `local` |
| BOM-06 | Chawl Chadhai (Up the chawl) | Four floors, one staircase, and the staircase is somebody’s kitchen now. | `bom06-paint`, `bom06-spikes` | `lightwell` |
| BOM-07 | Dabba Express (The lunchbox run) | Two lakh lunches a day, never late, never spilled. Your turn. | `bom07-holi`, `bom07-relay` | `dabbacode` |
| BOM-08 | Double Role (Twins, separated at the mela) | Bichhde bhai mil gaye! Same moves, different floors. | `bom08-together`, `bom08-mirror` | `credits` |

### DMN · Daman, Dadra & Nagar Haveli and Daman & Diu

- Language: Gujarati + English · Hello: "Kem cho? | How are you?" · Hidden item: bombil (Bombay duck)
- Two old forts across a river mouth, fishing boats, and the sea on every side.

| Stage | Name (meaning) | What it is | Act | Door ending |
| --- | --- | --- | --- | --- |
| DMN-01 | Daman Darshan (Seeing Daman) | Welcome tour: easy run past landmarks while the guide tells you real things about the city. Two forts, one river mouth, and fish drying on every rack. | — | — |
| DMN-02 | Nani To Moti (Fort to fort) | The ferry’s on strike. There’s a pedal boat. | `dmn02-channel` | `customs` |
| DMN-03 | Barf Kharkhanu (The ice factory) | The fish need ice. The ice needs you to hurry. | `dmn03-dispatch` | `coldstore` |
| DMN-04 | Haath Ma Haath (Hand to hand) | A dhow is built by forty pairs of hands. Today, also yours. Well, your feet. | `dmn04-dozer` | `flag` |
| DMN-05 | Panikotha (The fort in the sea) | No boatman, no engine. Just a rope and your thumbs. | `dmn05-tide` | `drawbridge` |
| DMN-06 | Machhi Bazaar (The fish market) | Everything is sold by weight. Including Dad. | `dmn06-loft` | `slidedoor` |
| DMN-07 | Warli Rang (The painted path) | In Silvassa the paintings walk. And so can you, on them. | `dmn07-hills` | `paintwall` |
| DMN-08 | Diu Durg (The fort at Diu) | Daman’s little sister across the sea. Same tricks, more of them. | `dmn08-diu` | `tipjetty` |

### GNR · Gandhinagar, Gujarat

- Language: Gujarati + English · Hello: "Kem cho! | How are you!" · Hidden item: dhokla
- Thirty neat sectors, kites on every roof at Uttarayan, and old Amdavad’s pols next door.

| Stage | Name (meaning) | What it is | Act | Door ending |
| --- | --- | --- | --- | --- |
| GNR-01 | Kem Cho Gandhinagar (Hello Gandhinagar) | Welcome tour: easy run past landmarks while the guide tells you real things about the city. Thirty numbered sectors, roads named after letters, and peacocks everywhere. | — | — |
| GNR-02 | Kai Po Che! (I cut your kite!) | Uttarayan in the pol: a kite on every roof, and the looters have bamboo. | `gnr02-terraces` | `setu` |
| GNR-03 | Adalaj Ni Vav (The Adalaj stepwell) | Five storeys of carved stone going down to the water. The stairs are shut for repairs. *Scene: Adalaj.* | `gnr03-shaft` | `jali` |
| GNR-04 | Indroda (The dinosaur park) | Gujarat’s own Rajasaurus, life size. It’s only a statue. Probably. *Scene: Indroda Park.* | `gnr04-hatchery` | `milan` |
| GNR-05 | Sasan Gir (The lions’ forest) | The last wild Asiatic lions in the world. Never turn your back on one. *Scene: Sasan Gir.* | `gnr05-pride` | `safari` |
| GNR-06 | Mor (The peacocks) | Gandhinagar has more peacocks than people on its lawns. When thunder rolls, they dance. | `gnr06-sabarmati` | `kichad` |
| GNR-07 | Garba Raas (The garba dance) | Navratri: nine nights of dancing in circles round the lamp, and you have to get across. *Scene: Navratri ground.* | `gnr07-sheri` | `pravesh` |
| GNR-08 | GIFT City (The finance city) | India’s first smart city, by the Sabarmati. Its trading screens never sleep. | `gnr08-towers` | `herd` |

### JAI · Jaipur, Rajasthan

- Language: Rajasthani + English · Hello: "Khamma ghani! | Warm greetings!" · Hidden item: ghevar
- Pink walls, a palace of 953 windows, giant stone instruments, and puppets on strings.

| Stage | Name (meaning) | What it is | Act | Door ending |
| --- | --- | --- | --- | --- |
| JAI-01 | Padharo Mhare Des (Welcome to my land) | Welcome tour: easy run past landmarks while the guide tells you real things about the city. The Pink City: painted terracotta pink in 1876 to welcome a prince, and pink ever since. | — | — |
| JAI-02 | Kathputli (The puppet show) | Rajasthan’s string puppets dance to the dholak. Tonight Dad is one of them. | `jai02-show` | `sutradhar` |
| JAI-03 | Hawa Mahal (The Palace of Winds) | 953 little windows to catch the breeze. And a Bhavai dancer’s tower of pots, on your head. | `jai03-zenana` | `toran` |
| JAI-04 | Jantar Mantar (The instruments) | Giant stone instruments for reading the sky. One of them is a marble bowl you can’t climb out of. *Scene: Jantar Mantar.* | `jai04-yantras` | `shant` |
| JAI-05 | Maniharon ka Rasta (The bangle makers’ lane) | A whole lane of lac bangles, and the floor is what’s left of the ones that broke. | `jai05-rasta` | `naap` |
| JAI-06 | Kachchhi Ghodi (The dummy-horse dance) | The dancers wear a horse round the waist and tell bandit tales with swords. The horse has ideas of its own. *Scene: Jaipur.* | `jai06-mela` | `dulha` |
| JAI-07 | Balloon ki Raat (Balloon night) | Diwali night over the Pink City, in a hot-air balloon. There is no steering wheel. *Scene: Jaipur.* | `jai07-udaan` | `palat` |
| JAI-08 | Amer (The fort on the hill) | Up to Amer fort the old way: by elephant. She’s friendly. Too friendly. *Scene: Amer.* | `jai08-amer` | `salaami` |

### BPL · Bhopal, Madhya Pradesh

- Language: Bhopali Hindi + English · Hello: "Hao, bade bhai! | Yes, big brother!" · Hidden item: poha
- A city of lakes, poha-jalebi mornings, old bazaars, and tall tales told over paan.

| Stage | Name (meaning) | What it is | Act | Door ending |
| --- | --- | --- | --- | --- |
| BPL-01 | Ko Khan, Bhopal! (Hello, Bhopal!) | Welcome tour: easy run past landmarks while the guide tells you real things about the city. A city built round two lakes by a king and kept by four begums in a row. | — | — |
| BPL-02 | Bada Talab (The big lake) | Raja Bhoj dammed a river a thousand years ago and Bhopal has had its lake ever since. There is no bridge. | `bpl02-jheel` | `ghat` |
| BPL-03 | Bhimbetka (The painted shelters) | Rock shelters painted on for thirty thousand years: bison, hunters, dancers, and the odd red hand. *Scene: Bhimbetka.* | `bpl03-shelters` | `haath` |
| BPL-04 | Zari ka Dhaaga (The gold thread) | Bhopal’s zardozi: gold thread and sequins on velvet. Today the needle is you. | `bpl04-karchob` | `gaanth` |
| BPL-05 | Jal Tarang (Waves in water) | At Bharat Bhavan someone is playing the jal tarang: china bowls of water, each a note. Mind your feet. | `bpl05-mehfil` | `khaali` |
| BPL-06 | Batolebaaz (The teller of tall tales) | Surma Bhopali, on his stool in the Chowk, telling it the way it never happened. | `bpl06-chowk` | `paan` |
| BPL-07 | BHEL (The heavy electricals works) | Bhopal builds turbines the size of houses, and lifts them with magnets. You are carrying the poha-wala’s iron tawa. *Scene: BHEL Bhopal.* | `bpl07-karkhana` | `rakhdo` |
| BPL-08 | Bhojtal (Raja Bhoj’s lake) | Tal toh Bhopal Tal, baaki sab talaiya: there is one lake, and the rest are ponds. | `bpl08-bhojtal` | `kissa` |

### RPR · Raipur, Chhattisgarh

- Language: Chhattisgarhi + English · Hello: "Jai Johar! | Greetings!" · Hidden item: chila
- The rice bowl of India: paddy to the horizon, gedi stilts at Hareli, and a clock tower that sings folk songs.

| Stage | Name (meaning) | What it is | Act | Door ending |
| --- | --- | --- | --- | --- |
| RPR-01 | Jai Johar, Raipur! (Greetings, Raipur!) | Welcome tour: easy run past landmarks while the guide tells you real things about the city. The capital of the rice bowl, on the way to the forests of Bastar. | — | — |
| RPR-02 | Hareli (The stilt festival) | At Hareli, when the paddy is in and the lanes are mud, all Chhattisgarh gets up on bamboo gedi. | `rpr02-khet` | `utar` |
| RPR-03 | Ghadi Chowk (Clock tower square) | Raipur’s clock tower plays a folk song on the hour. Today it has stopped. So has everything else. | `rpr03-chowk` | `ghanta` |
| RPR-04 | Dhan ka Katora (The rice bowl) | Chhattisgarh grows so much rice they call it the bowl. Some of it is hanging over your head. | `rpr04-kothi` | `khisko` |
| RPR-05 | Bhaunra (The spinning tops) | Every Chhattisgarhi child can keep a bhaunra spinning all afternoon. These ones are rather large. | `rpr05-mela` | `lattu` |
| RPR-06 | Kosa (Tussar silk) | Champa’s kosa silk comes from wild cocoons in the sal forest. The forest also has hornets. *Scene: Sal forest.* | `rpr06-jungle` | `reel` |
| RPR-07 | Chapda (The red ants) | Bastar makes chutney out of red weaver ants. The ants make bridges out of themselves. *Scene: Bastar.* | `rpr07-saal` | `gud` |
| RPR-08 | Bastar Dussehra (The seventy-five day festival) | The longest Dussehra in the world: seventy-five days, and a wooden chariot the whole town pulls. *Scene: Jagdalpur.* | `rpr08-dussehra` | `rath` |

### RNC · Ranchi, Jharkhand

- Language: Nagpuri (Sadri) + Hindi + English · Hello: "Johar! | Greetings!" · Hidden item: dhuska
- The city of waterfalls up on the plateau: hot dhuska, Chhau masks, Dokra brass and rugra after the storm.

| Stage | Name (meaning) | What it is | Act | Door ending |
| --- | --- | --- | --- | --- |
| RNC-01 | Johar, Ranchi! (Greetings, Ranchi!) | Welcome tour: the city of waterfalls, up on the Chota Nagpur plateau. | — | — |
| RNC-02 | Dhuska (Breakfast on Main Road) | Rice batter into hot oil, out puffed and golden: dhuska you hop across while they're up, off before the cook flips or scoops them. | `rnc02-galli` | `ulta` |
| RNC-03 | Teer (The archery range) | Arrows fly over your head while you walk; the ones in the straw boss are steps, climbed between shots and before the whistle. | `rnc03-maidan` | `nishana` |
| RNC-04 | Rugra (After the thunder) | The cloud's lightning takes the tallest thing under it; its thunder pushes rugra up out of the leaves, and you with them. *Scene: monsoon sal forest.* | `rnc04-seedhi` | `tadit` |
| RNC-05 | Chhau (As the mask, so the dance) | Put on a Seraikela mask and the dancers take you for it: the tiger runs from the hunter, pounces on the peacock; the peacock dances with a peacock. *Scene: Chaitra Parva at night.* | `rnc05-kharkai` | `chehra` |
| RNC-06 | Dokra (The lost wax) | Walk through the clay elephant in the moment it's hollow, between the wax running out and the brass going in; then pour your own brass steps. | `rnc06-ghariya` | `kataar` |
| RNC-07 | Hundru (The falls) | Here a long fall on to the rocks kills, counted from the top of your jump: step off the railing into the falling water, walk (don't jump) off high rocks, and come back up the steps. | `rnc07-chattan` | `khoh` |
| RNC-08 | Toofan (The storm) | The storm parks over the falls, and sinking slowly down the water you're the tallest thing under it; then the peacock flies you over the river to a rock only the falls get you down from. | `rnc08-ghagh` | `dwar` |

## To do

The map already shows each city's greeting and two placeholder stage names ("teasers") from `CHAPTERS`.
Teasers are only placeholders: several of them clash with each other or with shipped ideas (flagged below).
Replace them with the real stage names when the city is built.

**Clashes already visible in the teasers:** CHH "Charpai Trampoline" vs BPL-05's
bouncing bowls (bounce is taken: it shouldn't be a trampoline) · DDN "Six Clocks, Zero Time" vs RPR-03's
clock that only runs while you move (+ `ghanta`, `clockhand`, `slowmo`) · AGT "Mirror Lake Lie" vs the
`reflection` and `mirror` endings and BOM-08's mirror twin · GTK "One Floor Or Six?" vs AIZ "Ten Floors
Below" (same idea: give it to one city) · SML "Give Back My Specs!" vs the `monkey` ending · ITA "Hornbill
Glide" vs `glider`, GNR-06 feathers and JAI-07's balloon · BBI "Kalbaishakhi Gust" and SHL "Sideways Sohra
Rain" vs every wind idea (gust kit, KVT-04 tailwind, JAI-07) · JMU "Kalari Cheese Bungee" vs PNJ-05's
recoiling ropes · KOH "Log Drum Off-Beat" vs JAI-02's beat-forced hops · SVP "Chatham Log Roll" vs
`amr03-logs`, and "Coconut Crab Snip" vs KVT-07's crabs · DEL "Mind The Gap, Bhai" vs every train (BOM, BLR,
CHN-08) · LEH "Julley At 11,000 Feet" (thin air) vs KVT-06's air meter.

### PAT · Patna, Bihar
- **Speak:** Magahi is Patna's own; Bhojpuri is everywhere; + Hindi + English. "Ka haal ba? | How's it going?"
  is Bhojpuri; a Magahi line would differ *(verify)*.
- **Locals live with:** the Ganga's ghats and a river too wide to see across; Mahatma Gandhi Setu (about
  5.7 km of bridge); Golghar, the 1786 beehive granary with spiral stairs up the outside (145 steps
  *(verify)*); shared tempos; crowded Ashok Rajpath; the Sonepur animal fair across the river; floods.
- **Food / hidden item:** litti chokha; sattu (drink, paratha); khaja (layered sweet); thekua; makhana; malpua.
- **Festivals and craft:** Chhath (dawn and dusk offerings at the river; respectful only, no gags),
  Madhubani/Mithila painting, sikki grass craft.
- **Teasers now:** Golghar Spiral · Gandhi Setu Peel.
- **Watch out:** a bridge you lay is GNR-02's `setu`; boats and floods are used many times.
- **Avoid:** caste, politics, "Bihari" stereotypes, liquor (the state is dry).

### LKO · Lucknow, Uttar Pradesh
- **Speak:** Lakhnavi Hindustani (Urdu-rich Hindi, Awadhi touches) + English; the famous politeness: "aap",
  "janab", "tashreef rakhiye", "pehle aap" (after you). "Aadaab! | Respectful greetings!"
- **Locals live with:** "pehle aap" (nobody will go first), the Bhool Bhulaiya maze in the Bara Imambara (use
  it only as a generic old maze; "489 identical doorways" *(verify)*), Rumi Darwaza, Hazratganj evening
  strolls ("ganjing"), Chowk and Aminabad bazaars, chikankari (white thread on muslin), the Gomti.
- **Food / hidden item:** galouti kebab (melts in the mouth); makhan malai / nimish (winter-morning foam, gone
  by noon); basket chaat; sheermal; kulfi.
- **Festivals and craft:** Kathak (Lucknow gharana), Lucknow Mahotsav.
- **Teasers now:** Pehle Aap Trap · Door Number 489.
- **Watch out:** kites (HYD-05, GNR) and biryani (HYD-03) are taken; "pick the real door" is already
  `fakewin`, `invisible` and `backdoor`.
- **Avoid:** religion (the Imambara is a religious site), communal topics, politics, real shop names.

### BBI · Bhubaneswar, Odisha
- **Speak:** Odia + Hindi + English. "Kemiti achha? | How are you?"
- **Locals live with:** a skyline of curved stone temple towers (generic shapes, no deities), the rock-cut
  caves of Udayagiri and Khandagiri, the white peace pagoda on Dhauli hill, wide planned roads,
  Kalbaishakhi evening storms in April–May, hockey fever, Pipli appliqué (bright parasols, lanterns),
  Raghurajpur pattachitra, Konark's carved stone wheels that tell the time nearby, Nandankanan's white tigers.
- **Food / hidden item:** dahibara aloodum; chhena poda (baked cheese sweet); pakhala bhata (water rice);
  rasagola (friendly Odisha–Bengal rivalry).
- **Festivals:** Raja parba (swings), Bali Jatra (boat fair, Cuttack). Rath Yatra is religious: skip it.
- **Teasers now:** Pipli Parachute · Kalbaishakhi Gust.
- **Watch out:** wind, gliding, parachutes; sand art (`sandcastle`), Chilika's dolphins (KVT-08), swings
  (JAI-04, `swing`), chariots (RPR-08 `rath`).
- **Avoid:** deity and temple gags, cyclone deaths.

### CCU · Kolkata, West Bengal
- **Speak:** Bengali + Hindi + English. "Ki khobor? | What's up?", "Kemon acho?", bus conductors' "Aaste!"
  (slowly).
- **Locals live with:** yellow taxis, trams *(verify which routes still run)*, Howrah Bridge (riveted, no nuts
  and bolts) and Hooghly ferries, College Street's book stalls (Boi Para), adda (endless chat), para
  football, Durga Puja pandal-hopping (crowds, lights, giant pandals: no deities), India's first metro,
  waterlogged streets, Kumartuli's clay sculptors, the Maidan, Victoria Memorial.
- **Food / hidden item:** phuchka; jhalmuri; rosogolla; mishti doi in a clay bhanr; kathi roll; telebhaja.
- **Teasers now:** Boi Para Avalanche · Aaste! Aaste!
- **Watch out:** overhead wire (`bom03-wire`), trains, waterlogging (BOM-04), ferries, football (PNJ-03),
  falling things (rockfall kit).
- **Avoid:** politics (very charged), real football clubs, hand-pulled rickshaw pullers as a joke.

### SVP · Sri Vijaya Puram, Andaman & Nicobar Islands (bonus)
- **Speak:** Andaman's own Hindi (the link language), mixed with Bengali, Tamil, Telugu, Malayalam + English.
  Renamed from Port Blair in 2024. "Namaste! | Hello!"
- **Locals live with:** inter-island ferries, Ross Island (Netaji Subhas Chandra Bose Dweep) ruins swallowed by
  tree roots with spotted deer and peacocks, Chatham Saw Mill (one of Asia's oldest: logs, belts, saws),
  North Bay lighthouse (on a banknote *(verify)*), glass-bottom boats and helmet sea-walks, saltwater
  crocodile signs, coconut (robber) crabs, padauk timber.
- **Food / hidden item:** fish curry and rice; grilled crab; something new (coconut is TVM/KVT's).
- **Teasers now:** Chatham Log Roll · Coconut Crab Snip.
- **Watch out:** Kavaratti already did the lagoon, reef, swimming, tuna, dolphins, crabs and boats: SVP must
  find land and town ideas. Logs and rollers are used.
- **Avoid:** the protected tribes (never), Cellular Jail (a freedom-struggle memorial: no gags), the 2004 tsunami.

### GTK · Gangtok, Sikkim
- **Speak:** Nepali + Hindi + English (Bhutia, Lepcha, Limbu too). "Kasto chha? | How are you?", "Dhanyabad".
- **Locals live with:** steep roads and endless stairs, MG Marg (a spotless walking street with rules: no
  littering, spitting, smoking or vehicles), shared jeeps, the ropeway over town, buildings that start at road
  level and go floors down the slope, monsoon landslides, cloud drifting through the streets, Kanchenjunga at
  sunrise, the first fully organic state, orchids.
- **Food / hidden item:** momo; thukpa; churpi (rock-hard yak cheese); sel roti.
- **Teasers now:** One Floor Or Six? · MG Marg Polish.
- **Watch out:** cable rides (Cable kit, `amr06-zip`); "floors below" is also AIZ's teaser.
- **Avoid:** prayer flags, wheels and monasteries as gags; the border.

### DIS · Dispur (Guwahati), Assam
- **Speak:** Assamese + Hindi + English. "Kenekua aase? | How are you?", "Bhal" (good).
- **Locals live with:** the Brahmaputra (huge, braided, sandbars that move), bhutbhuti ferries, Saraighat
  bridge, GS Road flyovers, Rongali Bihu in April (dhol, the pepa buffalo-horn pipe, husori carol groups),
  Bhogali Bihu in January (meji bonfire huts of bamboo and hay, feasts), gamosa, japi hats, tea gardens,
  one-horned rhinos, Majuli river island.
- **Food / hidden item:** pitha (til pitha); masor tenga (sour fish); lal chah (black tea).
- **Teasers now:** GS Road Flyover · Brahmaputra Eddy.
- **Watch out:** floods (BOM-04), boats, golden muga silk (RPR-06's kosa cocoons), `whirlwind` vs an eddy,
  river dolphins (KVT).
- **Avoid:** insurgency, citizenship politics, ethnic tension.

### SHL · Shillong, Meghalaya
- **Speak:** Khasi + English (English is everyday here; Hindi light). "Kumno! | Hello!", "Khublei!" (thanks).
- **Locals live with:** rain that blows sideways (Sohra and Mawsynram nearby), living root bridges (grown over
  decades; a double-decker at Nongriat), Umiam lake, Elephant Falls, pine hills and mist, shared taxis that fit
  everyone, Police Bazaar, a big guitar and rock music culture, football, the Umngot at Dawki so clear that
  boats seem to float in air, Mawlynnong's bamboo dustbins.
- **Food / hidden item:** jadoh; tungrymbai; pumaloi.
- **Teasers now:** Living Root Leap · Sideways Sohra Rain.
- **Watch out:** wind/rain gusts, climbing (KVT-07 palms), see-through water (`kvt02-glass`).
- **Avoid:** teer (archery betting), insider/outsider tensions.

### ITA · Itanagar, Arunachal Pradesh
- **Speak:** Arunachali Hindi (the state's own link Hindi) + Nyishi + English. "Namaste! | Hello!"
- **Locals live with:** India's first sunrise (Dong, in the far east of the state: early sun, early dark),
  hill roads and landslides, cane and bamboo suspension bridges, Ita Fort's brick walls, Ganga Lake (Gyakar
  Sinyi), the mithun (state animal), hornbills, Ziro's Apatani rice-and-fish paddies, Nyokum and Solung
  festivals, oranges at Dambuk.
- **Food / hidden item:** bamboo-shoot dishes; pika pila (bamboo-shoot pickle); thukpa (also GTK's). Not apong
  (rice beer).
- **Teasers now:** Cane Bridge Catapult · Hornbill Glide.
- **Watch out:** recoiling ropes (PNJ-05), gliding, timed light (`lamp`).
- **Avoid:** the border, hornbill-beak headgear, tribal stereotypes.

### KOH · Kohima, Nagaland
- **Speak:** Nagamese (the creole everyone shares) + English (the official language). Map greeting "Kemon
  ase?" *(verify: Nagamese is often "Apuni kineka ase?")*.
- **Locals live with:** the Hornbill Festival every December at Kisama (a morung for every tribe, giant
  carved log drums), the king chilli (among the world's hottest), meat smoked over the hearth, Japfu peak and
  the Dzükou valley, terraced paddies at Khonoma (the green village), steep town lanes.
- **Food / hidden item:** galho (rice porridge); axone (fermented soybean, famously strong smell); bamboo shoot.
- **Teasers now:** Log Drum Off-Beat · Wooden Cart Downhill.
- **Watch out:** chillies (`mirchi`, AMR), beats (JAI-02), terraces (GNR-02).
- **Avoid:** insurgency and peace talks, the WWII cemetery (solemn), "dog meat" jokes, tribal stereotypes.

### IMP · Imphal, Manipur
- **Speak:** Meitei (Manipuri) + Hindi + English. "Khurumjari! | Greetings!", "Thagatchari" (thank you)
  *(verify)*.
- **Locals live with:** Ima Keithel (a market run entirely by mothers), Loktak lake's phumdis (floating
  islands of plants) with round fishing enclosures, Keibul Lamjao (a floating national park) and the sangai
  "dancing deer" that steps lightly over floating ground, polo's home (Sagol Kangjei, Manipuri ponies, the
  old Mapal Kangjeibung ground), yubi lakpi (rugby with a greased coconut), mukna wrestling, thang-ta.
- **Food / hidden item:** eromba; singju; chak-hao kheer (black rice).
- **Teasers now:** Donut Island Drift · Ima Market Bounce.
- **Watch out:** floating crates (BOM-04), bounce, coconuts (TVM/KVT).
- **Avoid:** the conflict since 2023 (no reference at all), insurgency, AFSPA, Ras Lila (religious).

### AIZ · Aizawl, Mizoram
- **Speak:** Mizo + English. "Chibai! | Hello!", "Ka lawm e" (thank you).
- **Locals live with:** a city on a ridge with houses on stilts down the slopes (the door is at road level,
  the home is floors below), stairways for lanes, nobody honks, cars wait in patient queues, Cheraw (the
  bamboo dance: step between bamboo poles clapped together), Chapchar Kut spring festival, guitars and choirs,
  puan cloth, tlawmngaihna (always help others first).
- **Food / hidden item:** bai (vegetable stew with bamboo shoot); sawhchiar (rice porridge).
- **Teasers now:** Do Not Honk Here · Ten Floors Below.
- **Watch out:** "floors below" is GTK's teaser too; rhythm (JAI-02); queues of traffic (BLR signals).
- **Avoid:** border and refugee issues, drugs.

### AGT · Agartala, Tripura
- **Speak:** Bengali + Kokborok + Hindi + English. "Nomoshkar! | Hello!"; Kokborok "Khulumkha" *(verify)*.
- **Locals live with:** Ujjayanta Palace (white, with pools and gardens in front), Neermahal (a palace in the
  middle of Rudrasagar lake), rubber plantations (latex cups on the trees, rubber sheets pressed and hung to
  dry: Tripura is India's second-biggest rubber grower), bamboo and cane craft, Garia dance, risa cloth.
- **Food / hidden item:** mui borok (Tripuri dishes with berma, fermented fish); chakhwi (bamboo-shoot stew).
- **Teasers now:** Mirror Lake Lie · Bamboo Mat Roll-Up.
- **Watch out:** reflections and mirrors (taken three times), water.
- **Avoid:** insurgency, border politics, religious sites (Unakoti, Tripura Sundari).

### DEL · New Delhi
- **Speak:** Delhi Hindi (Hinglish, Punjabi-flavoured) + English. "Kya scene hai? | What's the scene?", "bhai",
  "paaji".
- **Locals live with:** the Metro (huge interchanges, "please mind the gap"), DTC buses, e-rickshaws,
  Lutyens' roundabouts, Connaught Place's rings, Chandni Chowk's lanes and tangled overhead wires, very
  confident (wrong) directions, winter fog, summer loo winds, wedding bands, Qutub Minar and Red Fort (shapes).
- **Food / hidden item:** chole bhature; paranthe; gol gappe; rabri-jalebi; kulfi.
- **Teasers now:** Rajiv Chowk Transfer · Mind The Gap, Bhai.
- **Watch out:** trains (BOM, BLR, CHN-08), autos (HYD), mist and heat shimmer (kit), wedding horses (JAI-06),
  kites, wires.
- **Avoid:** politics and Parliament, pollution blame, 1984.

### CHP · Chandigarh, Punjab
- **Speak:** Punjabi + Hindi + English. "Ki haal aa, paaji? | How's it going, brother?", "Balle balle!"
- **Locals live with:** numbered sectors in a grid (and no Sector 13), roundabouts everywhere, the Rock Garden
  (sculptures made in secret from broken tiles, bangles and scrap; don't name its maker), Sukhna Lake, the Open
  Hand that turns in the wind, Punjabi weddings with dhol, bhangra and giddha, tractors, Lohri bonfires,
  phulkari, lassi in tall steel glasses.
- **Food / hidden item:** makki di roti with sarson da saag; chole kulche; lassi; pinni.
- **Teasers now:** Where Is Sector 13? · Rock Garden Duck.
- **Watch out:** a sector grid is Gandhinagar's ("thirty neat sectors"), bangles (JAI-05), dhol beats (JAI-02).
- **Avoid:** religion, separatism, farm protests, drugs.

### CHH · Chandigarh, Haryana
- **Speak:** Haryanvi + Hindi + English. "Ke haal se? | How's it going?", "tau" (uncle), "thaara" (your).
- **Locals live with:** straight talk, "doodh-dahi ka khaana", Murrah buffaloes, akhara wrestling and boxing,
  tractors and trolleys, the tau on his charpai under a tree with advice for everyone, Pinjore's terraced
  Mughal gardens and fountains, the Surajkund crafts fair, ragini folk singing.
- **Food / hidden item:** bajra roti with white butter; kachri ki sabzi; churma.
- **Teasers now:** Charpai Trampoline · Tau Knows Best.
- **Watch out:** bounce, kabaddi (`kabaddi`), bulls (`bull`), terraces (GNR-02), fountains (geyser kit).
- **Avoid:** caste and khap topics, gender jokes, politics.

### DDN · Dehradun, Uttarakhand
- **Speak:** Garhwali + Hindi + English. "Kya haal chaal? | How's life?"; a Garhwali greeting such as "Sewa
  lagau" *(verify)*.
- **Locals live with:** Ghanta Ghar (a six-faced clock tower), blue Vikram tempos packed to the roof, the Forest
  Research Institute's huge red-brick building, Robber's Cave (a stream that vanishes underground and comes
  back), Sahastradhara's dripping caves, litchi orchards, basmati, bakeries (rusks, buns), boarding schools,
  Mussoorie up the hill.
- **Food / hidden item:** bakery rusk; bal mithai; aloo ke gutke; kafal (wild berries).
- **Teasers now:** Six Clocks, Zero Time · Blue Vikram Clutch.
- **Watch out:** clocks and time (RPR-03, `ghanta`, `clockhand`, `slowmo`), a packed ride that shoves you out
  (BOM-03), mall roads (SML), elephants (JAI-08).
- **Avoid:** disasters (2013 floods, cloudbursts), religion (Haridwar, Rishikesh), the military academy.

### SML · Shimla, Himachal Pradesh
- **Speak:** Pahari (Mahasuvi) + Hindi + English. "Kiya haal? | How's it going?" *(verify)*.
- **Locals live with:** the Kalka–Shimla toy train (about a hundred tunnels; Barog the longest), Mall Road and
  the Ridge where everyone walks, the public lift from Cart Road up to the Mall, monkeys that snatch glasses and
  food, slate-roofed wooden houses, snow and slush, apple crates, Himachali caps, ponies and yaks at Kufri.
- **Food / hidden item:** siddu; dham (festive meal); apples; babru.
- **Teasers now:** Give Back My Specs! · Tunnel 102 Teleport.
- **Watch out:** monkeys (`monkey` ending), trains and tunnels, ice (DMN-03), warps (`w.warp`).
- **Avoid:** religion (Jakhu temple), disasters.

### JMU · Jammu, Jammu & Kashmir (winter capital)
- **Speak:** Dogri + Hindi + Punjabi + English. "Ki haal ae? | How's it going?" *(verify)*.
- **Locals live with:** the Tawi river and its bridges, Bahu Fort, the old Mubarak Mandi palaces, Raghunath
  Bazaar, Matador minibuses (stop-start, always room for one more), kalari cheese (stretchy, fried in its own
  fat), dry-fruit shops, Basohli miniature painting, the old Darbar Move (every spring the government's files
  went by truck to Srinagar; ended 2021).
- **Food / hidden item:** kalari kulcha; rajma chawal; patisa.
- **Teasers now:** Kalari Cheese Bungee · Matador Stop-And-Go.
- **Watch out:** stretchy ropes (PNJ-05), stop-and-go vehicles (BLR's signals), bridges.
- **Avoid:** militancy, religion (Vaishno Devi, temples), Article 370 and politics.

### SXR · Srinagar, Jammu & Kashmir (summer capital)
- **Speak:** Kashmiri (Koshur) + Urdu/Hindi + English. "Kyah chhu? | What's up?" *(verify)*.
- **Locals live with:** Dal lake (shikaras with heart-shaped paddles, houseboats, the dawn floating vegetable
  market, floating gardens), chinar trees blazing red in autumn and carpets of leaves, terraced Mughal gardens
  with water channels, kahwa from a copper samovar, the kangri fire-pot under the pheran in winter, snow,
  papier-mâché, carpets, pashmina, noon chai (pink salt tea).
- **Food / hidden item:** kahwa; noon chai; girda bread; nadru (lotus stem).
- **Teasers now:** Heart-Shaped Paddle · Chinar Leaf Carpet.
- **Watch out:** boats (many), terraces (GNR-02), ice (DMN-03), cable cars (Gulmarg; Cable kit), cricket bats
  (CHN-04).
- **Avoid:** the conflict, militancy, curfews, politics. Completely.

### LEH · Leh, Ladakh
- **Speak:** Ladakhi + Hindi + English. "Julley! | Hello!" (also thanks and bye).
- **Locals live with:** thin air at about 3,500 m (slow down, rest two days), butter tea churned in a tall
  wooden churn, Magnetic Hill (an optical illusion: a slope that looks uphill is really downhill), Khardung La,
  Pangong lake changing colour through the day, Nubra's dunes with double-humped camels, yaks and dzo, ice
  stupas (artificial glaciers for spring water), the frozen-river Chadar trek, flat mud-brick roofs piled with
  fodder, apricots.
- **Food / hidden item:** thukpa; skyu; butter tea; khambir bread; apricots.
- **Teasers now:** Julley At 11,000 Feet · Magnetic Hill Illusion.
- **Watch out:** an air meter (KVT-06), gravity tricks (`gravity`, gravity flip), ice, the fake road (heat
  shimmer kit).
- **Avoid:** the army and the border, monasteries and prayer flags as gags.
