# ALLOCATION review (read-only)

Reviewer, 2026-11-27 ~03:22-04:00 IST. Read: TROLL-BIBLE.md, ALLOCATION.md, allocation.json, cities/PAT.md, LKO.md, CCU.md (sections 5 and 7 in full), level-devil-dad `docs/MECHANICS.md` (develop). For the other 18 new cities I read the allocation rows, not their bibles in full (time budget), so place-fit findings for those are from the rows only.

**Verdict: build with these 12 fixes.** The keys are unique. The mechanics in play are not: several families with different names are the same experience, and the three cities already building (PAT, LKO, CCU) carry five of them. Fixes 1-5 touch PAT/LKO/CCU and should go to those builders now.

`python3 allocation-work/check.py` re-run: `36 cities 417 families 423 pairs / OK: no duplicates`. That proves only that no key string repeats. It cannot see two keys that play the same, which is what the findings below are about.

Ids: "slot" means the stage number a builder ships (PAT slot 07); "concept" means the bible id in the Concept column (PAT-07). They differ in most cities, see finding 11.

---

## Findings, ranked by blast radius

### 1. Pattern-is-the-floor appears 8 times (PAT, LKO, CCU building now)
Same experience every time: a painted, printed or woven pattern decides which pixels are solid, and often a maker changes the pattern in front of you.
- PAT slot 03 (PAT-06 Madhubani) `double-outline-band-is-air`: "the inner line is solid, the band between lines is air", plus "the painter fills a gap while you watch".
- LKO slot 03 (LKO-04 Chhapa) `print-washed-stitch-remains`: "the stitched (white) parts are solid; at the washerman's whistle the print is washed off".
- CCU slot 05 (CCU-05 Kumartuli) `wet-dry-clay-layers`: "straw is air; clay is solid; the potter adds a layer where he's working".
- BPL slot 09 (encore F160) `dots-only-stepping-stones`: "only the dots of a Gond painting are solid; the lines are gaps".
- GNR slot 09 (encore F156) `tie-dye-reveals-on-untie`: "tied dots are solid; untied they open into the pattern".
- AGT slot 04 `over-under-weave-height`, BBI slot 06 `loom-beat-aligns-threads`, SXR slot 08 `spoken-count-colour-knots`, BBI slot 10 finale `soot-reveals-ikat`.
- Shipped neighbours: BPL-03 "two worlds switched by stencils", DMN-07 "a path painted as you go", BOM-06 wet paint, `paintwall`.
PAT slot 03 and LKO slot 03 are the worst pair: same slot number, same rule ("this part of the picture is floor, that part is air"), same second beat ("the maker changes it while you watch"). BPL-09 Gond dots is the same rule as PAT-06 with dots for lines. Conflict 17 in section 5 says loom rows "stay, each a different craft and rule"; the craft differs, the rule does not.

### 2. A craftsperson builds or covers the floor ahead of you, 7 times
Shipped original: DMN-07 "a painted path that fades behind the brush".
- PAT slot 03 second beat `painter-fills-gap` ("becomes a wall where you were going to stand").
- CCU slot 09 (CCU-09 Pandal) `cloth-panel-covers-foothold`: "the panel goes up exactly where your next foothold was". This is PAT's painter-fills-gap with cloth.
- LKO slot 03 act: "a stitcher fills in the pattern ahead of you, follow just behind her".
- CCU slot 05: "the potter adds a layer where he's working".
- AGT slot 03 `mat-unrolled-ahead-rolled-behind` (its own closest column says "DMN-07 painted path: floor made ahead by a person").
- KVT slot 09 (encore F138) `rope-laid-behind`: "ahead is loose strand, behind is firm".
- SML slot 07 `own-steps-pack-the-snow`, closest "DMN-07: your steps build the floor ahead".

### 3. Street food forced on Dad, 3 times, against shipped AMR-01
AMR-01 shipped: "being fed: a full stomach shortens your jump" (`Aunty`, `FULL_PHYS`).
- PAT slot 08 HWIK (PAT-08 Sattu) `drink-swaps-which-hazard-kills`: a stall drink changes Dad's physics.
- CCU slot 03 (CCU-06 Phuchka) `vendor-forces-one-second-pause`: "stop in front of the vendor and he hands you one: you must eat".
The allocation's own reason for CCU ("a forced pause, not a shorter jump") and PAT ("two states change two rules") change the effect, not the experience: a vendor feeds you and your body changes. PAT slot 08 also breaks section D rule 3 (see finding 7).

### 4. TVM-02 bus bells re-skinned in PAT slot 07
MECHANICS.md: "bus bells as a rule: one bell brakes and slides you forward, two bells jerk off and slide you back (TVM-02)". PAT.md concept 7: "conductor's slaps: one slap go, two slaps pull in hard (you fly forward)". The allocation keeps betrayal `slap-signal` and argues "slaps are visible". A visible slap is the same rule with a new sound. CCU slot 02 (`exit-moving-vehicle-on-shout`, "the shout is the timing") is the third conductor-signal stage; it is different enough (you exit), keep it.

### 5. Stand still next to someone and they hold you, 7 times
Shipped: RPR-06 "standing still to become a cocoon", PNJ-08 freeze, and the whole "moves only when you don't move" theme.
- LKO slot 01 `bow-to-let-stranger-pass` and LKO slot 02 `politeness-bow-sets-order`: both answer "stand still = bow and the NPC lets you pass", in adjacent stages. Law 6 wants the next stage to break the rule; here it repeats it.
- CCU slot 03 phuchka (stop = held while the crowd pushes) and CCU slot 08 adda (stop on the rok = held until the tea seller passes): same verb, same A2 "never stop in front of X", same city.
- LEH slot 01 `greeting-moves-people` ("A2 stop and greet") is LKO slot 01 in Ladakh.
- BBI slot 04 `standing-builds-blocker`, DEL slot 03 `lane-narrows-when-you-stand`: standing still makes the space close on you; same pair.
- AIZ slot 08 `stopping-brings-carrying-help`.
Section 4's almost-used row lists four owners for "stand still and a crowd holds you" (CCU-08, CCU-06, AIZ-03, BBI-10). Four owners for one experience is the duplication, written down.

### 6. Weight tilts the floor three stages running in PAT
PAT slot 05 `float-sinks-under-load` (pontoon drums sink under the cart), slot 06 `joint-seesaw-by-traffic-weight` (joints bob as a truck crosses), slot 07 `vehicle-leans-to-rider-side` (tempo leans to the side with more riders). Three consecutive stages where the floor tilts or sinks toward the weight. Shipped neighbours: DMN-06 balance scale, KVT-08 sandbar that goes under. Also SVP slot 06 `bird-weight-bends-tree`.

### 7. HWIK slots that fail section D
- PAT slot 08 Sattu: two unknowns in one beat (vents stop lifting a heavy Dad, and tar stops killing him). Section D rule 3: "never two unknowns in the same stage"; rule 2: "after one death the answer is one move". The tell "stall sign shows cup" shows that a drink is on offer; it does not show what drinking does. Also unclear whether drinking is automatic (rule 4: "an action the player does anyway").
- AGT slot 08 `duck-column-pace-on-bund`: FRESH, no tell named, no A3 ("A2 march at duck pace (FRESH...)"). A HWIK with no tell cannot be checked against D.
- SHL slot 05 `hidden-schedule-seven-streams`: "pick the stream that ran dry first; a stream dries to lure you". Choosing among seven is a search, which breaks rule 2.
- SVP slot 08 `rain-direction-reverses-awnings`: tell "the stage plays twice". That is not a visible tell before the betrayal.
- DIS slot 08 (tell "engine noise backdrop"), DEL slot 08 (horn ring code, "guide teaches once"), SXR slot 08 (chant "in local numerals"): audio-only or language-gated tells. Law 9 tests readability on "two muted viewings". DEL slot 08 also has the guide teach a trap ahead, which section D forbids ("never describes a trap the player has not yet died to").
- CHH slot 05 `guide-true-words-wrong-unit`: the guide says true words that mislead. That breaks the spirit of "only Tara lies". Give the line to Tara or to a sign whose joke is that (B39).

### 8. Shape: 11 cities put a second marathon in slot 09
PAT, CCU, SHL, KOH, IMP, DEL, CHH, SML, JMU, SXR, LEH all have shape `marathon` with "hidden checkpoints" in slot 09. Section E says 09 is "Tough, knowable... 60-90 s". The header says the second marathon "runs as slot 09 with 4-5 beats", but the json shape still reads `marathon`, and section 6 point 5 says "Slot 09 is tough but knowable". A builder reading the json builds a 2-3 minute 09 straight after a 2-3 minute 07. Two marathons in three stages also stacks the 7th-death restart risk the earlier reviewer named.
Also: 10 cities have HWIK at slot 05 with shape `HWIK`, not `long`; section E makes 05 a 60-90 s long stage. Say so in the json, or builders will make a 30 s HWIK.

### 9. Finales that bring in a new idea
Law 7 and section E: "only this city's own ideas". Allowed: own callbacks in a new order. Not allowed: a new mechanic.
- PAT slot 10 `finale-truck-lights-tell` ("read truck lights at night"): reading headlights is not in any PAT slot, and it is JMU slot 09 `lights-ahead-signal-oncoming` (headlights warn of oncoming traffic). Use the missing-plate count from PAT slot 06 as the twist instead.
- CHP slot 10 "walk blind barefoot", ITA slot 10 "sun-line reveals door", SHL slot 10 "rest-stall landing tilts": each is a new twist. Fine if it is a combination of two own ideas; the rows do not show that.
- SML slot 10 chain reads "packed snow, flock, snowball, sheets, sun patch? no: lift corridor". Allocator thinking left in data; also "snowball" is not an SML slot.
- LKO slot 10 and CCU slot 10 are fine (bells are LKO slot 06; book bundles join CCU slots 04 and 07).

### 10. Other near-duplicate pairs (lower blast radius)
| Pair | Why the same in play |
|---|---|
| SXR slot 09 `brake-only-downhill` / KOH slot 07 `downhill-cart-lean-steer` | both marathons, both a downhill ride whose control is the brake ("A2 brake into bumps" / "A2 brake before the bump") |
| BBI slot 08 `invisible-cuts-revealed-after` / DDN slot 05 `rain-splash-reveals-glass` / ITA slot 08 `torch-circle-reveals-floors` | all HWIK, all "a moving reveal shows invisible floor"; plus BPL encore 01 B10 invisible bridge |
| CHP slot 04 `summon-by-touch-kid-tide` / SVP slot 04 `food-holder-followed-by-deer` | carry a thing and a crowd follows you; same slot number |
| RPR encore 10 `wheel-spoke-steps` / BBI slot 09 `world-slides-hub-stays-still` / BLR encore 09 `meshing-cog-teeth` | rotating wheel as platforms; shipped `clockhand`, RPR-05 tops |
| GTK slot 08 `dull-block-never-breaks` / SXR slot 05 `paper-box-skids-wood-holds` / ITA slot 01 `brick-hop-mortar-vs-loose` / SVP slot 09 `brick-crumbles-roots-hold` | two things drawn nearly alike, one safe by a mark: this is B37 decoy twin, USED (TVM-01). Conflict 21 "recast" SXR's box, but its own closest column still says "decoy-twin B37" |
| PAT slot 01 `crowd-carried-by-vehicle` | BOM-03 "a packed train that shoves you out" plus CHN-07 jasmine crowd push; "carries you back two screens" is also a long loss in a tour |
| CCU slot 01 `rail-groove-sticks-foot` | GNR-06 "mud you can't jump from", TVM-05 moat mud: floor holds your foot while a threat comes |
| CCU slot 04 `stack-pulled-from-bottom` | CCU.md itself: "the drop is a ledge that vanishes" = B1/B2 USED; keep only if the customer-chooses rule is what kills |
| CCU slot 07 head-load porters | DMN-04 "riding a plank passed hand to hand"; the rest-stop beat ("sets his load down when you stand on it for long") is KVT-08 "a sandbar that goes under when you stop on it" |
| HYD encore 09 `clam-gate-pearl-step` | "a clam opens on a beat; shut = spikes" is kit blinkers (timed platforms), USED |
| CHN encore 10 `stair-direction-by-load` | B9 belt that reverses, PARTLY (BOM treadmills) |
| TVM encore 09 `flag-strip-shifts` / SVP slot 03 `warning-board-arrow-turns` | an honest marker that moves |
| LKO slot 04 `sun-direction-sinks-foam` | DMN-03 melting floor; the sun line is the only new part |

### 11. Section 4 and 5 use concept ids where builders think in slot ids
The almost-used table and every conflict line name concepts ("LKO-05 owns sun-direction", "SHL-08 keeps it", "CHP-09 keeps it", "a wrestler: CHH-03"). In the game, LKO-05 is the stage at slot 05 (Galouti), but concept LKO-05 is at slot 04. SHL-08 the concept is slot 03; SHL slot 08 is a different HWIK. CHP-09 churn is slot 03; CHP slot 09 is the veil. A builder will read "SHL-08 owns the swaying bridge" as "my stage 08". Also "LKO-04" is listed under "weaving rows" (it is block print), and "IMP-T" is a concept id nobody else uses.

### 12. Door endings are not allocated
MECHANICS.md: "Door endings (ENDINGS: one stage each)" with ~80 taken names, and "an idea counts as used even under a new name". The allocation assigns no ending per slot. The bibles name doors (PAT: `bhitar`, `chokha`, toll booth window; LKO: `pehle`, `bakhiya`; CCU: Esplanade loop, tea cup), and PAT slot 06's toll-booth door sits next to the shipped `setu` ending. Twenty-one builders will pick doors on their own and collide. Same for act ids ("one per id, never reused").

---

## Section 5 conflicts, one line each
1. Pandal vs bhelaghar: sound (respect reason holds), but CCU slot 09 now duplicates PAT slot 03's painter-fills-gap (finding 2).
2. Bow vs gamosa: sound for DIS; does not fix LKO slot 01 vs slot 02, which is the same clash inside LKO.
3. Deer vs farm dog: sound; CHP slot 04 kid tide is still the same experience (finding 10).
4. Sweeper brush GTK keeps: sound.
5. Adda CCU keeps, AGT retired: sound; CCU slot 03 phuchka remains a twin of it.
6. Churn CHP keeps: sound.
7. Flock floor SML keeps, LKO flag-flock separate: sound.
8. Stack from the bottom CCU keeps: sound.
9. Layer peel JMU keeps, PAT-09 retired: sound; PAT's bible finale callback to khaja correctly dropped.
10. Bridge sway SHL keeps: sound, but PAT slots 05-07 tilt/sink are its cousins (finding 6).
11. Wet-is-safe DDN keeps: sound.
12. Sun floors LKO owns: contradicts section 4, which lists five sun owners "never a sixth"; CHH slot 07 (sun cue), SML slot 07 ("sun melts packed path") and ITA slot 10 (sun-line) make six or more. Unsound as written.
13. Fog GTK owns: sound; PAT slot 10's replacement (truck lights) collides with JMU slot 09.
14. One-way door IMP owns: sound.
15. Floats under load PAT owns: sound, but see finding 6.
16. Wrestling CHH owns: sound.
17. Loom rows "each a different craft and rule": unsound, the rule is the same (finding 1).
18. Drum dancers BBI owns: sound.
19. Read-a-number: sound.
20. Vehicle height by load PAT owns: label wrong, PAT-07 is tilt by rider side, not height; otherwise sound.
21. Decoy twin recasts: GTK sound; SXR not (still B37 by its own note); GTK slot 08 dull block is B37 too.
22. Taj and Pachisi to reserves: sound (Taj is Agra, Pachisi is Fatehpur Sikri, both outside Lucknow).

## FRESH reserves and source-needed encores
- **Risky, in built slots, not reserves:** AGT slot 08 (FRESH and HWIK, no tell), AIZ slot 09 (`string-platform-ripple`, guitar strings, "from CITIES.md: football and guitars": an abstraction, not a place), DDN slot 09 (tree rings, "FRI museum is real, check"), SML slot 06 (mule train). These four ship tonight without a source.
- **Risky reserves:** IMP R2 mallet (allocation says "CLOSE `salaami`; last resort"), SHL R2 amp dial ("close, last resort", GNR-04), KOH R1 greased pole (PNJ-05 ropes), DIS R2 cocoon reel (RPR-06 cocoon in name), AGT R1 striker flick (`cannon`), SVP R1 and DEL R1 marked "(weak)", AIZ R1 "(weak)", CCU R1 kumir-danga (bible: "check rules with natives"; and it leans on the taken look rule), PAT R2 polished pillars (Kumhrar pillars are a ruin; slick floor is close to DMN-03 ice).
- **Fine:** GTK R2 ropeway cabins, ITA R1 orchid dew, SXR R2 lotus stems, LEH R1 two waters, JMU R1 ghat conveyor, PAT R1 Nalanda count (reserve only, good), DDN R1 mineral crust, CCU R2 Hooghly bore (real; note it is close to PDY-06 tides).
- **Encores needing a source:** CHN-09 murukku press, RPR-10 cart wheel, RNC-10 sal plates (all "everyday life, unverified": plausible, low risk, but RPR-10 duplicates BBI slot 09); DMN-09 dredger and DMN-10 binoculars ("page not reachable"): DMN-10 coin binoculars is an abstraction anywhere with a seaface; KVT-09 coir ("coir not on page"): real in Lakshadweep, fine; PNJ-10 shell windows (real in Goa; window-as-floor detail unverified); RNC-09 hammer (self-flagged vs blr07 crusher act: likely a repeat).

## Shipped cities: encores, tours, seventh-death themes
- Tours: each uses a different B row (B4, B8, B16, B20, B5, B12, B19, B24, B23, B11, B17, B30, B10, B6, B40). Unique against each other. Watch: PNJ (B24) and BOM (B23) both make the tour a controls trick; BPL tour B10 overlaps the three new reveal HWIKs (finding 10); RNC tour B40 is an optional secret, so RNC's tour has no betrayal that must be met: section E wants 2.
- Encore near-dups: BPL-09 and GNR-09 (finding 1), KVT-09 (finding 2), RPR-10 and BLR-09 (finding 10), HYD-09 blinkers, CHN-10 belt, TVM-09 moving marker.
- Seventh-death themes, near-duplicates: TVM "seven glasses of tea" vs CHN "kaapi tumbler topped up the seventh time" (a drink poured seven times); BLR "metro board says next train in seven minutes" vs BOM "the seven-fifteen local" (a transit time); DMN "fish scale reads seven kilos" vs RPR "grain measure filled the seventh time" (a measure). All lines still need the native check the allocation names.

## What a builder reading section 6 will get wrong
1. Point 4 says "never add a second HWIK"; 12 cities are allocated two (05 and 08). Reads as "delete one".
2. Point 5 says slot 09 is "tough but knowable"; the json says `marathon`, hidden checkpoints (finding 8).
3. Point 3 points to the almost-used table, which names concepts not slots (finding 11).
4. Point 6 runs `allocation-work/check.py`, a path inside ldd-inbox; in the game repo the gate is `tests/allocation.test.ts`, which skips if `docs/allocation.json` is missing. Say: copy the json first, then `npm test`.
5. Nothing says who picks the door ending and act id, or that both must be new (finding 12).
6. The md table clips the A2/A3 and closest columns ("A2 kerb when horn sounds; A3…"); the header says so, but point 1 sends builders to section 2. Send them to allocation.json.

---

## Fixes I recommend (edit the allocation)
1. **PAT slot 03 vs LKO slot 03:** keep one pattern-floor in the first wave. Keep LKO slot 03 (Chhapa: the wash changes the state, a timed rule). Replace PAT slot 03 with a new standard concept from PAT.md sections 2-3 (PAT R1 Nalanda is spent by fix 3). Retire BPL encore 09 Gond dots and GNR encore 09 Bandhani; take replacements from their bibles' unused lists.
2. **Painter/cloth/maker builds ahead:** keep CCU slot 09 (pandal, the owner) and DMN-07 (shipped). Drop PAT slot 03's `painter-fills-gap` beat; recast KVT encore 09 and AGT slot 03 to something not made by a walking worker; SML slot 07 keep only if the floor is made by *your* steps with a rule DMN-07 lacks (the sun-melt beat).
3. **Forced food:** AMR-01 already owns "fed". Replace PAT slot 08 with PAT R1 Nalanda as the HWIK (one counting rule, bricks visible over each door, learnable after one death; PAT-09 Khaja cannot return, JMU owns peel). Recast CCU slot 03 so the vendor is not feeding Dad (e.g. the crowd ring around the stall as the obstacle, without the eating pause), or swap in CCU R2 Hooghly bore.
4. **PAT slot 07:** delete the `slap-signal` betrayal; give the tempo a second betrayal that is not a conductor code (the bible's "gap between two parked tempos closes when a third backs in" door, moved into the act).
5. **Stand-still-held:** LKO keeps slot 02 (owner); recast LKO slot 01 to a tour betrayal that does not need standing still; recast LEH slot 01 likewise. CCU keeps slot 08 adda; fix 3 removes CCU slot 03's hold. Pick one of BBI slot 04 / DEL slot 03 and recast the other.
6. **PAT tilt run:** keep PAT slot 05 (pontoon, owner) and slot 07 tempo; recast PAT slot 06 Setu to its missing-plate count as the main betrayal, not the bob. That also gives the finale its twist (fix 8).
7. **HWIK repairs:** PAT slot 08 per fix 3; AGT slot 08: name a visible tell and an A3 or swap to a reserve with one; SHL slot 05: one stream, one visible schedule mark; SVP slot 08: name a visual tell; DIS/DEL/SXR slot 08: add a visual twin of the audio tell; DEL slot 08 drop "guide teaches once"; CHH slot 05: move the misleading line to Tara.
8. **Finales:** PAT slot 10 twist = the missing-plate count from slot 06, not truck lights; SML slot 10 chain rewritten to own slots only; CHP/ITA/SHL slot 10 state which two own ideas the twist combines.
9. **Slot 09 shape:** change `marathon` to `tough` (60-90 s, 4-5 beats, 3-4 checkpoints) in the 11 cities, or state in section 6 that 09 marathons are allowed and capped at 90 s. Set `HWIK` slots at 05 to note "long (60-90 s)".
10. **Section 4 and 5 ids:** rewrite every owner reference as `CITY slot NN (concept)`; fix "LKO-04 weaving", "IMP-T", conflict 20's label, and reconcile conflict 12 with the sun row (one owner, list the others as recast or keep them and drop "never a sixth").
11. **Doors and acts:** add an `ending` and `act` field per slot (or a rule: ending name = `<city>-<slot>` style new name, grep endings*.ts advice lines first) before more builders start.
12. **Lower-blast pairs (finding 10):** for each pair keep the first-listed owner and recast the other: KOH slot 07 vs SXR slot 09 (keep SXR, recast KOH to lean-steer without braking), the three reveal HWIKs (keep DDN rain; recast BBI slot 08 and ITA slot 08), CHP slot 04 vs SVP slot 04 (keep SVP), RPR encore 10 (replace), SXR slot 05 and GTK slot 08 (still B37: replace), HYD encore 09 (replace), RNC encore 09 (replace, crusher act).

Not checked: the 18 other new-city bibles in full (only their allocation rows), Avoid lists outside PAT/LKO/CCU, any source link, and the shipped code beyond MECHANICS.md. Risk: fixes 1-6 change stages PAT, LKO and CCU builders may already have coded.
