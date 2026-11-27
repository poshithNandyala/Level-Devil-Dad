# SVP ideas v2: candidate acts for stages 06, 07, 08, 09

Research only, 2026-11-27 (chat-75). Nothing in the repo was touched. Game facts come from: `docs/cities/SVP.md` (bible), `docs/TROLL-BIBLE.md` (laws, catalogue B1-B40, section D for "how would I know" = HWIK), `docs/ALLOCATION.md` + `allocation.json` (435 slot keys flattened and grepped), `level-devil-dad/docs/MECHANICS.md`, `ldd-wt/svp/src/game/cities/svp/s06.ts..s09.ts`, `reports/cities/svp/BUILD.md`, `reports/cities/svp/LENGTH.md` section 2 (the five retired types: pour over one section, rising water with a raft, lift bridge, lift overrun, out-of-phase floats and a ferry).

**Gaps to fill (LENGTH.md section 1):** 06 36.1 s (floor 60), 07 58.9 s (floor 120), 08 41.3 s (floor 60), 09 24.9 s (floor 60).

**Test applied to every candidate.** The player's decision in one sentence, then grep for it in MECHANICS.md, the allocation and the brief's list of asked decisions. Decisions I rejected as already asked are in the last table so the builder does not re-derive them.

**Two conflicts with the brief, decided here.** (1) Cellular Jail: the brief lists the spoke-wing sightline; `SVP.md` section 2 and 7 say "never a stage, never a gag" and `ALLOCATION.md` gives sightline-ground to DDN slot 07. Not proposed. (2) The Andaman Trunk Road convoy: `SVP.md` section 7 forbids "trunk-road convoy"; the convoy's real reason is the Jarawa reserve, which cannot be shown, so the stage would either lie about its reason (TROLL-BIBLE D5) or point at the tribe. Not proposed; ITA-11 (reserve) also owns `convoy-gate-direction-alternates`. The momentum beat below is built on the sea walk instead.

**One physical fact that carries three candidates.** North Bay (and Elephant Beach) sell a "sea walk": a heavy helmet fed by an air hose from a boat or pontoon above; you walk the seabed, you do not swim. Surface-supplied diving's defining limit is the umbilical, which "encumbers the diver's mobility, restricts their range" and "can get snagged" ([Wikipedia: Surface-supplied diving](https://en.wikipedia.org/wiki/Surface-supplied_diving)). KVT owns swimming with an air meter, reef diving, see-through water (`SVP.md` header; MECHANICS "Water"). None of the three uses an air meter, swimming or fish: the hose is a line whose path you choose. The builder should draw no air gauge.

---

## Candidates

Format: place · rule · decision · obvious play, death · obvious fix, death (a different trap) · one-move answer · closest shipped/allocated and why different · time added · line (V/U) · source.

### 1. Nali (The air hose) — slot 09 primary, 06 alternate
- **Place:** North Bay sea walk, coral heads with arches (a coral arch is a hole through a coral head; the reef off North Bay is the sea-walk site).
- **Rule:** Dad is on a fixed-length hose from a pontoon above-left; the hose runs straight to him unless something is between, and then it bends round that thing, which uses up length.
- **Decision:** Which way round an obstacle do I let my line run.
- **Obvious play:** walk under the coral arch (the low, easy path) toward the far ledge; the hose now bends under the arch; two tiles short of the ledge it goes taut and yanks Dad back into the urchin trench. Death line idea: "Nali! The hose was wrapped under the arch."
- **Obvious fix:** go over the arch (right for the hose) and run-jump for the ledge; the helmet is heavy: the run-jump is a hop (helmet physics, shown by the helmet, like AMR-01's full stomach shortens a jump) and Dad drops into the gap.
- **One-move answer:** over the arch, then step along the ridge the arch top joins to the ledge: the hose stays short, no jump needed.
- **Closest:** BPL-04 thread you may never cross (your own trail), DEL slot 05 hang from wires, PNJ-07 towed parasail, KVT-06 air meter. Different: no meter, no timer, no trail; the only variable is the hose's geometry, and the tell is the hose itself drawn slack (a curve) or taut (a line).
- **Time:** 20-30 s (two arches, one ridge).
- **Line:** "Nali seedhi rakho, Dad!" | "Keep the hose straight, Dad!" (U, standard Hindi, needs native check).
- **Source:** [Surface-supplied diving](https://en.wikipedia.org/wiki/Surface-supplied_diving) (umbilical snags, restricts range); sea-walk sites at North Bay: U (tourism pages not fetched in time).

### 2. Nali, chalti naav (The hose, boat moving) — slot 07, the MOMENTUM beat
- **Place:** same reef; the operator idles the boat along the reef so walkers see more (U as practice).
- **Rule:** the anchor point moves right at walking pace; the hose is fixed-length; an arch that is "over" when the boat is behind you becomes "under" when the boat is ahead.
- **Decision:** For this arch, right now, where is my anchor, so over or under.
- **Obvious play:** stand to watch an arch; the boat passes overhead and on; the hose straightens and drags Dad off the ledge. The keep-moving frame (stopping = dragged) is a known decision; the new one is the per-arch re-read.
- **Obvious fix:** keep pace with the boat under every arch (the first arch, boat behind, under was fine); at the second arch the boat is ahead, the hose bends under the arch and goes taut.
- **One-move answer:** the boat's shadow on the sand is the anchor: arch past the shadow, go over; arch before it, go under.
- **Closest:** pace-behind (LKO-07, AGT duck pace: the frame only), candidate 1 (same family: build 1 or 2, never both, per the allocation's one-type-per-city rule).
- **Time:** 25-35 s.
- **Line:** "Naav ke saath chalo!" | "Walk with the boat!" (U).
- **Source:** as 1.

### 3. Mehrab (The arch shelter) — slot 07, the SHELTER beat
- **Place:** same reef, a tourist boat passing with its propeller low.
- **Rule:** a boat passes over the open sand every 12 s; the coral arch shelters you; the hose comes under the arch with you.
- **Decision:** Leave a shelter by the side I entered, not the far side.
- **Obvious play:** walk on in the open; the hull's propeller line sweeps the sand strip (a visible wake-line). Death.
- **Obvious fix:** duck under the arch as the boat comes, then continue out the far side toward the door; the hose is now wrapped under the arch and goes taut at the next step (candidate 1's trap, placed where the fix lands).
- **One-move answer:** back out the way you came in, then over the arch.
- **Closest:** B13 refuge wave (BPL-09 encore: fleeing past the recess), IMP slot 01 door that opens one way, B36 shelter trap. Different: the shelter is honest and stays safe; the cost is in how you leave it, and the hose shows why.
- **Time:** 15-20 s. Chain 2 -> 3 -> 5 is one 60-75 s sea-walk section for the marathon, three decisions, each with its own death cause.
- **Line:** "Jahan se aaye, wahin se jao." | "Go out the way you came." (U).
- **Source:** as 1.

### 4. Bhaar (The weight belt) — slot 09 or 07 exit
- **Place:** the pontoon's hull above the reef, with one open hatch and ladder (sea-walk divers climb down a ladder from a pontoon; weights keep them on the bottom: surface-supplied divers carry weights, see source).
- **Rule:** with the belt on you walk; take it off (one tap at a marked belt-drop spot) and you rise straight up at fixed speed and cannot steer; the belt cannot be put back.
- **Decision:** From which spot on the seabed do I let go, since the way up is a straight line and the hull above has one hole.
- **Obvious play:** drop the belt under the ladder you see, which is the ladder's lower rung hanging two tiles left of the hatch: Dad rises into the hull plating.
- **Obvious fix:** walk to be exactly under the hatch and drop; a urchin patch sits where the hatch's shadow falls (a plain visible hazard: the second trap is a different kind).
- **One-move answer:** drop from the coral knob one tile right of the shadow: the rise clips nothing (the hatch is 2 tiles wide, the knob is in its right half).
- **Closest:** `cannon` and `salaami` endings (a launch you aim), GNR-02 pole vault (height by run-up), B25 super-jump under a ceiling (FREE, unallocated). Different: no power choice, no run-up, no aim: only the take-off spot, and it is irreversible, which is the fear.
- **Time:** 10-15 s.
- **Line:** "Belt khola toh upar hi upar!" | "Belt off, and it's up, only up!" (U).
- **Source:** [Surface-supplied diving](https://en.wikipedia.org/wiki/Surface-supplied_diving).

### 5. Tedha (The bent pole) — slot 06 primary (mangrove creek at dusk), 09 alternate
- **Place:** the mangrove creek of SVP-06, a submerged root ledge seen from the bank, a mooring pole standing in the water.
- **Rule:** anything under water is drawn where it appears from above: shallower and nearer than it is (apparent depth); the pole bends at the surface, which is the tell. A landing aimed at the drawn ledge falls short by one tile; the real ledge is one tile farther and one deeper.
- **Decision:** Aim beyond where the submerged ledge looks, by the amount the pole bends.
- **Obvious play:** hop onto the drawn ledge; Dad lands in open water past its real edge? No: the drawn ledge is *nearer* than the real one, so a hop to the picture lands on nothing. Death: "Tedha! The water bent it."
- **Obvious fix:** jump long to be safe; the far ledge is real but a crab-free fiddler-less oyster-crusted root (plain spikes, visible) sits exactly where a full run-jump lands; the hold-jump lands between.
- **One-move answer:** hold-jump (3.75 tiles), not tap (2.4) or run (5.6): the pole's bend is one tile, the drawn ledge is 2.4 tiles out.
- **Closest:** SVP-05 (own) picture aligns from a spot; TVM-04 shyLedge (bank backs away); KVT-02 see-through water; PDY tour B20 landing square shifts after you commit. Different: nothing moves and no spot is needed; a fixed offset the player reads once from a bent pole, then applies everywhere water is.
- **Time:** 15-25 s (three ledges, one is above water and honest, to test the rule).
- **Line:** "Paani mein sab paas dikhta hai." | "In water everything looks near." (U).
- **Source:** [Wikipedia: Refraction, "On water"](https://en.wikipedia.org/wiki/Refraction): the pencil appears bent at the surface; apparent depth is less than real depth; a spearfisher must aim lower.

### 6. Chhajja (The eave) — slot 08 primary
- **Place:** Do Monsoon's street, the tin-roofed houses behind the awnings (Port Blair's older houses have pitched tin roofs: `SVP.md` section 6 skyline "tin roofs").
- **Rule:** a pitched roof sheds its water off its LOW eave in a sheet whatever the wind does; under a roof the dry strip is under the HIGH eave. The awning rule the stage teaches (dry at the lee end) is wrong here.
- **Decision:** Under a roof, read the slope, not the wind.
- **Obvious play:** the player applies the awning rule and stands at the lee end under the roof's low eave; the eave sheet drenches him (KILL window as the stage's rain).
- **Obvious fix:** change ends when the wind changes (the stage's own A2): the low eave is still the low eave, drenched again. This is the stage's countermeasure made the vulnerability (TROLL-BIBLE law 2), with a tell: the sheet is drawn pouring off the low edge before you arrive.
- **One-move answer:** stand under the high eave, either wind.
- **Closest:** SVP-08 (own) lee end of awnings; BBI jug pour over one section (a cycle pour by a person); TVM-01 tarp (dumps when you come near); `cascade` kit (a fixed water column). Different: not a cycle, not a trigger, not a fixed column: the dry side is decided by the roof's shape, so the stage's own rule goes stale with a reason a local knows. Pair with a flat tin roof (candidate 7) only if the builder wants two, not three.
- **Time:** 20-25 s.
- **Line:** "Chhajje ke neeche, oonchi taraf." | "Under the eave, the high side." (U).
- **Source:** roof hydraulics are plain physics, no page fetched; Port Blair tin roofs: U (not fetched).

### 7. Chhat ka paani (The flat tin roof) — slot 08 alternate to 6
- **Place:** the same street, a flat-roofed kiosk ("gumti") between the awnings.
- **Rule:** rain pools on a flat tin roof and the wind pushes the pool to the LEE edge, where it spills; so under a flat roof the lee side is the wet one, the opposite of the awning rule.
- **Decision:** Under a flat roof, stand to windward.
- **Obvious play / fix / answer:** as 6 with sides swapped; the tell is the puddle visibly sliding to the lee edge before the spill.
- **Closest:** as 6. Same class as 6 (shelter geometry); build one of 6 or 7.
- **Time:** 15-20 s. **Line:** "Gumti ke neeche, hawa ki taraf." | "Under the kiosk, the wind side." (U). **Source:** none fetched (physics).

### 8. Oonchi deewar (Rain shadow by height) — slot 08, a ladder beat only
- **Place:** the second street of Do Monsoon, a compound wall and a church-tower wall (Aberdeen Bazaar area, U).
- **Rule:** slanting rain leaves a dry strip in the lee of a wall as long as the wall is tall: a 1-tile wall gives 1 tile, a 4-tile wall gives 4.
- **Decision:** Pick the shelter by its height, not by whether it is "a shelter".
- **Obvious play:** shelter behind the nearest (short) wall; the strip is 1 tile and the gust pushes the rain lines in. **Fix:** stand hard against the short wall (right spot, wrong wall); the gutter at its foot runs (the stage's door hazard, `svp-nala`, an honest different trap). **Answer:** the tall wall three tiles on.
- **Closest:** SVP-08 own lee rule. This is a within-stage ladder (TROLL-BIBLE C), not a new type; it is here because 08 is HWIK and may hold one unknown only (D3), so its padding must be knowable.
- **Time:** 10-15 s. **Line:** "Jitni oonchi deewar, utna sukha." | "The taller the wall, the drier." (U). **Source:** physics.

### 9. Khamba (Hold the bollard) — slot 07, jetty, low rank
- **Place:** the quay of Ship Late Hai, mooring bollards along the edge.
- **Rule:** the rush sweeps anyone standing free; a Dad standing still touching a bollard (6 px) holds it and is not moved; a Dad touching it while moving is swept.
- **Decision:** When the sweep comes, be still against a fixed thing instead of running from the sweep.
- **Obvious play:** run from the rush (swept, `svp-bheed`). **Fix:** step to a bollard and keep edging round it as the crowd passes: moving = swept. **Answer:** touch it and freeze until the shout ends.
- **Closest:** B13 refuge (BPL-09), SML-06 niches, CCU-08 adda (stand still and the space closes). Different: the refuge is a point you must be touching and still, not a recess, and stillness saves rather than traps. Honest verdict: same class as refuge; use only if the marathon still needs 10 s after 2-3-4.
- **Time:** 10 s. **Line:** "Khambe ko pakdo!" | "Hold the post!" (U). **Source:** none needed.

### 10. Trolley (The dragged bag) — slot 07 alternate to 1-3 if the sea walk is ruled KVT's
- **Place:** the waiting hall, a wheeled bag on a strap behind Dad.
- **Rule:** the bag trails 1.5 tiles behind on its strap; it cannot pass a bollard on the other side from Dad: pass a post on the wrong side and the strap stops you dead in the rush.
- **Decision:** Which side of each post, given what is trailing behind me (candidate 1's decision on land, anchor behind instead of above).
- **Closest:** BOM-07 dabba carry (no jumping), JAI-03 pots, DMN-04 plank. Different: the carried thing is behind you and the only rule is the line's path round posts.
- **Time:** 15-20 s. **Line:** "Bag peeche, khambe ke is taraf." | "Bag behind, post on this side." (U). **Source:** everyday observation; no page.

### 11. Teen zubaan (Three-language announcement) — slot 07, readability add to the existing rush, not a new type
- **Place:** the hall's PA. Island announcements run Hindi, then Bengali, then Tamil (the bible's language mix, `SVP.md` section 1 and 4; order U).
- **Rule:** the crowd runs when its own language is read; each hall's crowd wears one shirt colour tied to one language line on the board; the rush starts on that line, not on the first.
- **Decision:** Read which language is being spoken to know whether THIS hall runs now.
- **Verdict:** this is "wait for an all-clear" with a better tell. Offer it to the builder as the tell for the existing `svp-bheed` rushes (TROLL-BIBLE D1, cause visible at respawn), not as a new act. Keep groups as shirt colours, never as caricature.
- **Line:** "Hindi, Bangla, Tamil: teen baar bolte hain." | "Hindi, Bengali, Tamil: they say it thrice." (U). **Source:** U.

---

## Ranked (best first)
1. **1 Nali (hose tether, static)** for 09: the only fully new decision class found (line topology), readable from the hose itself, 20-30 s.
2. **6 Chhajja (eave)** for 08: the stage's own rule goes stale with a physical reason; knowable; fills 08's gap alone.
3. **5 Tedha (refraction)** for 06: fixed offset, bent-pole tell, sourced; nearest neighbour is SVP's own 05, so the builder must keep it offset-only (no spot).
4. **2 + 3 + 4 sea-walk chain** for 07 (momentum, shelter, exit): 50-70 s, three deaths of three kinds; uses the hose family, so 1 must then not be in 09 (then 09 takes 5 + 4, and 06 takes 5's mirror... no: 06 takes 5, 09 takes 4 plus one more beat of 5's rule on a second creek).
5. **4 Bhaar (weight belt)** alone for 09 if the chain is not built.
6. **8 Oonchi deewar** as 08's second beat (ladder, +10-15 s).
7. **7 Chhat ka paani**: only instead of 6.
8. **10 Trolley**: only if the sea walk is refused.
9. **9 Khamba**: filler.
10. **11 Teen zubaan**: a tell, not an act.

Slot fit summary: 06 = 5 (+1 if the sea walk moves scene, dusk permitting); 07 = 2, 3, 4 (or 10, 9); 08 = 6 (or 7) + 8; 09 = 1 (+4) or 4 + a second room of 5.

## Rejected as already asked (so nobody rebuilds them)
| Idea | Asked by |
|---|---|
| mud flats hold a walker, swallow a hop; stingray shuffle | TVM-01 soaked road, RNC-07 fall rule |
| bioluminescent plankton show the floor only where you move | DDN slot 05 moving reveal |
| leeches on the Mount Harriet trail | AIZ-07 cling-slow |
| domino chain of leaning planks at Chatham | B12 wave (AMR tour), B13 refuge (BPL-09) |
| sea-walk hose slack tangles when you stop; boat drifts | pace-behind (LKO-07, AGT) |
| rope loops closing on the quay; shelter inside a stinging anemone | space closes (CCU-08, PAT-07); hazard-as-route (RNC-07) |
| storm-signal mast shapes; ₹20-note view; honest signs | read-a-number owners (GTK, IMP, PAT, SXR); SVP-05, SVP-03 own |
| trees keep dripping after rain; drop the shelter | TVM-04 coconut on stoppers |
| Cellular Jail sightline; ATR convoy | SVP.md section 7 hard no; DDN-07, ITA-11 |

## What I could not verify
Sea-walk operating detail (pontoon vs boat, hose length, whether boats idle along the reef, weight belts at North Bay) comes from the general surface-supplied-diving page and memory of tourism listings; the North Bay Island and Chidiya Tapu Wikipedia titles returned 404 and no tourism page was fetched inside the budget, so the place facts in 1-4 are U until a builder opens one operator page. Port Blair tin roofs and flat-roofed kiosks are from the bible's skyline and memory (U). Every language line is standard Hindi written by me and marked U; none has a source, and `SVP.md` section 4 already says Andaman Hindi needs a native check. Mount Harriet facts fetched but unused: the ₹20 note view is taken by SVP-05, and "elephants carrying lumber" is JAI-08's animal ([Mount Harriet National Park](https://en.wikipedia.org/wiki/Mount_Harriet_National_Park)). Refraction (apparent depth, bent pencil) is verified ([Refraction](https://en.wikipedia.org/wiki/Refraction)). Time spent: 06:58-07:30 IST of a 35-minute budget; a long think before the first fetch is why the source count is low.
