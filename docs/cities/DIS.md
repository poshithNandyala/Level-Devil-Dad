# DIS · Dispur (Guwahati), Assam: the built city

Ten stages, built as a module (`src/game/cities/dis/`, routes in `tests/cities/dis.ts`), each on its slot in
`docs/allocation.json` (v2). Notes for the integrator's MECHANICS.md, CITIES.md and WAVE1.md entries.
Language: only lines the city bible marks VERIFIED (Omniglot Assamese), "Local | English".

## Stages

| Stage | Name | Slot family [betrayal] | What it is | Act(s) | Door ending (`meta.ending`) |
| --- | --- | --- | --- | --- | --- |
| DIS-01 | Nomoskar Guwahati (tour) | carrier-spills-on-contact [carrier-spill] | Luit riverfront tour. A tea boy walks the promenade towards you with a tray of lal chah. Touching him scalds you; hopping clean over him tips the tray, and hot tea spreads over where you land. Answer: step down into the ghat (river side) and let him walk over your head. As he crosses the ghat he swings the tray right back behind him, so climbing out the moment he is overhead is scalded too: wait till he is a few steps past. | (tour course: bollards, ditch, steps, cart) | `dis-tea-tray` (the tour's own door, no twist) |
| DIS-02 | Char | sandbars-relocate-by-level-post [level-post-relocate] | Sandbars move when the level post rises a mark. A siren raises it when you stand at its mark. New bars rise first (white dashed outline, then sand), a bar that stays but narrows narrows second (keeps its left end), bars that go sink last. Run-and-jump into a bar that isn't up yet: river. Wait on a bar for ever: it sinks. Wait on the narrowing bar's right end: river. | `dis02-chapori`: a Mising farmer's hut on a bar that never moves; the next bar comes up only after you land on the hut. `dis02-dhar`: two sirens, go to each new bar as soon as it is up. | `dis-hut-shut`: the door is the farmer's hut on the far bank, and he keeps it shut while the river is moving. Cross two bars, then wait at the hut till the water is calm. |
| DIS-03 | Duta Paat, Ekta Kuhi | plucked-row-steps-down [crop-floor-lowers] | Tea hedges taller than a jump. A plucker walks the path; at each hedge she stops and picks, her basket swinging all round her, and the hedge steps down to one step. Follow behind her. Run at her or hop over her: basket. | `dis03-bagan`: a sprinkler on the path; while it sprays and a little after, the path is wet and you slide, so you cannot stop behind her. Wait before the pipe till it is dry. | `dis-tea-chest`: the door is the tea chest, nailed shut until the plucker walking up the path tips her basket in. |
| DIS-04 | Til Pitha | set-crepe-rolls-you-up [roll-by-shine] | Crepes on a hot pan over a fire. Shiny = liquid, holds you; it dulls and blinks, goes matte (set) and the cook rolls it with you in it; then it is gone and poured again. Run at it: pan. Wait on a shiny crepe for ever: rolled. | `dis04-tawa`: four crepes, each poured about two seconds after the last. `dis04-bhogali`: a slow cook, each crepe poured only after the one before: wait on each one for the next. | `dis-laru-plate`: the door is on a plate of laru past three more crepes; the cook's boy rolls laru balls down the plate at you: hop them. |
| DIS-05 | Gamosa (HWIK, long) | gamosas-hide-feet-camera [overloaded-blind] | Every giver host who touches you puts a gamosa on you (shown as bands on Dad). With three, a long white-and-red cloth hangs over everything below your waist: you cannot see your feet, and the pit is under it. Give one away by walking into a host in a red sash on a machan (raised bamboo stage). Never by standing still (LKO-02 owns the bow). | `dis05-biya`: a wedding line, two givers then a taker, three times, then two pits. `dis05-atithi`: three givers, a taker, a pit; then one giver right before a pit: hop over him. | `dis-gamosa-latch`: the latch is a gamosa rope, and the door opens only if you hand it a gamosa: keep one. With none, a giver stands on the machan before the door. |
| DIS-06 | Majuli ka Paar | bank-retreats-in-slabs [retreating-bank] | The river is eating the bank across the channel, a slab at a time, nearest the water first, on a clock that starts when you set out. Cracks and a dark wet line show a slab seconds before it goes. Stop at the edge to look: the near slab is gone. Stop on a slab: gone under you. Cross at a run. | `dis06-majuli`: four slabs with gaps, quick. `dis06-chapori`: a rock in mid-channel the river never takes (the shelter); the second stretch starts going only when you step off the rock. | `dis-tea-ladder`: the door is up in a stilt house (chang ghar) whose ladder is pulled up; the family lets it down when the tea boy walks up. Wait at its foot, climb with him. |
| DIS-07 | Husori (marathon, lives: act) | join-moving-group-to-pass-gate [join-group] | Bohag Bihu carollers go house to house. Each bamboo gate opens only while the group is stopped at it and you are inside its circle (a dashed ring round the dhol); the shut gate's sharpened stakes kill. A gate that opened for you shuts a moment after you leave the ring. Run at the gate: stakes. | `dis07-ghar`: two houses a long walk apart (the slow walk is the momentum beat: you cannot hurry the group). `dis07-chowk`: three gates; at the middle one the host hands out gamosas first and the gate waits for him (go early: stakes). Tara tells the truth once here: "Lahe lahe, Dad? / Slowly slowly". | `dis-gamosa-door`: the last host's yard: the singers stop while he hands out gamosas, the gate opens only when he is done, for you inside the ring. |
| DIS-08 | Gorh (HWIK) | follow-flattened-strip [follow-flattened] | Kaziranga elephant grass: no floor under it, only beel. A jeep revs out in the grass (sound, and visible engine rings and a column of dust where it is: readable muted). A rhino charges straight at the dust, flattening a strip, and stops there. Walk in: beel. Wait at the edge of the grass for the strip: the rhino stops right there. Wait back, then walk the strip. | `dis08-kaziranga`: again from the far side; then the dust is ahead and the rhino starts BEHIND you on your own bank: jump up on the haystack platform and let it pass underneath. | `dis-watch-tower`: the door is up the watch tower's steps; after the last field the jeep by the tower starts up and the rhino charges at it from behind: straight up the steps. |
| DIS-09 | Rang Ghar | roof-curve-slides-stop-at-ribs [slope-ribs] | The Ahom pavilion's boat roof, oiled: on the shiny oil you are pushed down the slope faster than you can run, and landing on the oil shakes the gutter above, which drops a wooden ball (`dis-laru` sprite) on you. Ribs (one-tile wooden blocks) separate the oil. The grip pads (red-and-white) in front of each rib are the only still places. A hop at the rib lands on the oil: ball. Answer: stop on the pad, back to its start, run, one long leap over rib and oil. | `dis09-chaal` (push harder), `dis09-dhal` (steeper still). | `dis-royal-seat`: two more oil stretches, then the royal seat's bare wooden steps. |
| DIS-10 | Luit (finale, marathon, lives: act) | finale-level-post-far-bank [level-post-far-bank] | Callbacks only to DIS: the char sandbars again, but the level post stands on the far bank (you must remember the rule). | `dis10-tawa` (the pitha pan over the river), `dis10-bagan` (tea rows and the plucker), `dis10-gate` (husori gate with the host's ritual), `dis10-bank` (Majuli's slabs). | `dis-post-bank`: the level post on the far bank, and the only way over the water is the plucker's path: a bar rises under each of her steps and goes a few seconds later. Follow behind her and keep up. |

New death causes (all in `causes.ts`): `dis-spill`, `dis-luit`, `dis-basket`, `dis-tawa`, `dis-roll`, `dis-laru`,
`dis-gamosa`, `dis-bank`, `dis-gate`, `dis-beel`, `dis-gorh`, `dis-roof`.

Hidden items (`things.ts`): `dis-chah` (lal chah), `dis-japi`, `dis-paat` (two leaves and a bud), `dis-pitha`,
`dis-gamosa`, `dis-tenga` (masor tenga), `dis-pepa`, `dis-laru`.

## Fairness (`LDD_N=80 npm run fair -- DIS`)

| Stage | quick / avg / relaxed | worst stretch at avg |
| --- | --- | --- |
| DIS-01 | 100 / 100 / 100 | 100 |
| DIS-02 | 100 / 100 / 84 | 100 |
| DIS-03 | 100 / 100 / 100 | 100 |
| DIS-04 | 100 / 100 / 100 | 100 |
| DIS-05 | 100 / 100 / 76 | 100 |
| DIS-06 | 100 / 100 / 80 | 100 |
| DIS-07 | 100 / 100 / 100 | 100 |
| DIS-08 | 100 / 100 / 100 | 100 |
| DIS-09 | 100 / 100 / 100 | 100 |
| DIS-10 | 100 / 100 / 80 | 100 |

## Look and sound

Palette from the bible (humid green-grey sky, tea-green hills, river-sand tiles, gamosa red and white). Backdrop
`dispur()`: Kamakhya hill as a plain green silhouette (no temple drawn), the wide Luit with pale sandbars,
Umananda islet with trees, the Saraighat steel truss, flat-topped tea rows with shade trees. Ground caps:
riverbank sand with tea-green tufts. Music: Bihu feel, 120 bpm, major pentatonic, a dhol theka. Postcard:
"The river moves the islands. The dhol moves everyone else."

## Notes for MECHANICS / WAVE1

- A moving carrier who spills on contact or on being jumped, and swings his load behind him over the ghat (DIS-01).
- Sandbars placed by a numbered level post; a siren raises it; new bars first, narrowing second, sinking last (DIS-02, DIS-10).
- Floor that is a crop, stepping down only when picked; a picker whose basket swings while she picks (DIS-03).
- Crepes readable by shine: shiny holds, matte rolls you up (DIS-04).
- Gifts that blind: three gamosas hide your feet; give back by walking into a taker (DIS-05).
- A bank eaten from the water inland on a clock from when you set out (DIS-06).
- Gates that open only for a moving group with you inside its ring; the host's ritual delays one (DIS-07).
- A charging animal that makes the only floor, charging at a visible-and-audible lure (DIS-08).
- Oiled roof: push down the slope, ribs and grip pads, landing on oil drops a ball (DIS-09).
- A path that exists only under a walker's feet, for a few seconds (DIS-10's door).
- Tara lies with "Bhal, Dad! / Good, Dad!" at the trap in 01-05, 08, 09 and "Lahe lahe" (slowly) on the bank in
  06; she tells the truth once, in DIS-07 ("Lahe lahe": walk slowly with the singers).
