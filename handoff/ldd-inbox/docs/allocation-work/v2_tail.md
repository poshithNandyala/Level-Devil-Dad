## 4. Uniqueness proof

- Key = (family, betrayal). Every row in sections 1-3 is one key and every family has one owner, so no pair can repeat; `allocation-work/check.py` asserts it on allocation.json (v2: 36 cities, 419 families in use, 429 pairs, 0 duplicates). F numbers of v1 families are unchanged; v2 families are F418-F446; a retired family keeps its old number out of use.
- Per-city check: no betrayal key twice inside a city (reserves included), at most 2 HWIK, never adjacent, never 01, 09 or 10.
- A key test proves only that no key string repeats. v2 also removed the same *experience* under different keys (ALLOCATION-REVIEW findings 1-10; ALLOCATION-V2-CHANGES.md lists every slot touched).

{{CITYTABLE}}

**Almost-used ideas builders reach for** (ids are `CITY slot NN (concept)`)

| Idea a builder will reach for | Owner (do not build elsewhere) |
|---|---|
| bow, or stand still to be polite | LKO slot 02 (LKO-02 Pehle Aap) |
| stand still and someone holds you or the space closes on you | CCU slot 08 (CCU-08 Adda), BBI slot 04 (BBI-10 Tarakasi), AIZ slot 08 (AIZ-03 helpers); LKO slot 01, LEH slot 01, CCU slot 03 and DEL slot 03 were recast away from it in v2 |
| a crowd as a floor or a gap you follow | PAT slot 09 (PAT-10 moving gap), LKO slot 07 (LKO-07 pace), DIS slot 07 (DIS-06 join group), CCU slot 07 (CCU-07 head loads), SVP slot 07 (SVP-10 luggage) |
| a painted, printed or woven pattern decides what is solid | LKO slot 03 (LKO-04 Chhapa: the wash changes it on a timer). Kept because the rule differs: BBI slot 06 (BBI-05 ikat: beats align threads), AGT slot 04 (AGT-04 weave height), SXR slot 08 (SXR-04 the talim count). Shipped: BPL-03. Never a new one |
| a person builds or covers the floor ahead of you | CCU slot 09 (CCU-09 Pandal); shipped DMN-07. SML slot 07 (SML-02) is your own double step, nobody else's |
| a vendor feeds Dad and his body changes | AMR-01 (shipped). No new city has one |
| a conductor's signal moves the vehicle | TVM-02 (shipped). CCU slot 02 (CCU-02 Aaste) is exiting on a shout, not a signal code |
| floor tilts or sinks toward the weight | PAT slot 05 (PAT-04 pontoon), PAT slot 07 (PAT-07 tempo lean), SVP slot 06 (SVP-07 birds bend tree); shipped DMN-06. PAT slot 06 is now a plate count, not a bob |
| which side the light comes from decides which floor holds | LKO slot 04 (LKO-05 Makhan Malai), the only one |
| the sun's height is the clock (time of day) | SML slot 02 (SML-03 roof sheet), LEH slot 04 (LEH-04 ice stupa), LEH slot 06 (LEH-06 nala), CHP slot 07 (CHP-06 sky-colour clock); each a different object; CHH slot 07, ITA slot 10 and SML slot 07 lost their sun beats in v2 |
| a moving reveal shows invisible floor | DDN slot 05 (DDN-06 rain splash); shipped BPL tour B10 is a walkable gap, not a reveal |
| fog or mist | GTK slot 07 (GTK-07) |
| a swaying bridge | SHL slot 03 (SHL-08 Dawki) |
| hang from wires | DEL slot 05 (DEL-06) |
| floats that sink under load | PAT slot 05 (PAT-04); ITA slot 08 (ITA-10 raft) splits sideways, never sinks |
| a churn | CHP slot 03 (CHP-09) |
| a wrestler | CHH slot 06 (CHH-03) |
| a flock | SML slot 09 (SML-10) as floor; LKO slot 09 (LKO-10) steered by a flag |
| peeling layers | JMU slot 05 (JMU-05) |
| a sweeping brush | GTK slot 01 (GTK-01) |
| animals or a crowd follow what you carry | SVP slot 04 (SVP-04 deer); IMP slot 06 (IMP-01 scout) shows firm ground, it does not follow you |
| a door that opens one way | IMP slot 01 (IMP-T) |
| a drum beat moves dancers | BBI slot 07 (BBI-08 Gotipua), KOH slot 05 (KOH-02 log haul) |
| a downhill ride | SXR slot 09 (SXR-05: brake only); KOH slot 07 (KOH-01: lean only, no brake) |
| a turning wheel as platforms | BBI slot 09 (BBI-06: the wheel is still, the plinth moves); shipped `clockhand`, RPR-05; BLR encore 09 cogs |
| sorted by size | CCU slot 03 (CCU-F2 jhalmuri tin); SML R1 apple chute is reserve only and must not ship beside it |
| decoy twin, fake floor, shelter trap, delayed second trap | taken (B1, B35-B37); GTK slot 08 and SXR slot 05 replaced in v2 |
| read a number or a count | GTK slot 04 (GTK-02), IMP slot 08 (IMP-05), PAT slot 08 (PAT-11 Nalanda bricks), SXR slot 08 (SXR-04), PAT slot 06 (PAT-03 plate count) |
| escalator or lift | SML slot 01 (SML-01), SML slot 08 (SML-08), CHN encore 10 |

## 5. Conflicts handed over, and the others found

1. **Kolkata pandal cloth vs Assam bhelaghar thatch.** CCU slot 09 (CCU-09 Pandal) owns `cloth-panel-covers-foothold`; DIS concept DIS-07 is retired; DIS gets the Uruka net (R1). Reason: the pandal is a city-wide structure; the bhelaghar is tied to a burning rite the bible says never to show as a trap. v2: PAT slot 03's painter beat is gone, so the pandal is the only maker-ahead stage.
2. **Lucknow "pehle aap" bow vs Assam gamosa give-away.** LKO slot 02 (LKO-02) owns `politeness-bow-sets-order`. DIS slot 05 (DIS-11) gives a gamosa away by walking into the next host, never by standing still. v2: LKO slot 01 is now the Chowk cloth bolts, so LKO no longer repeats its own rule in adjacent stages.
3. **Andaman deer vs Gangtok farm dog.** SVP slot 04 (SVP-04) owns `food-holder-followed-by-deer`; GTK concept GTK-09 is retired. v2: CHP slot 04's kid tide (same experience) is replaced by CHP-07 Sarson.

Further clashes, each resolved the same way (owner kept, the other retired or recast):

4. Sweeper brush: GTK slot 01 (GTK-01) keeps it; SHL concept SHL-09 retired.
5. Adda: CCU slot 08 (CCU-08) keeps it; AGT concept AGT-09 retired; CCU slot 03 phuchka replaced (v2).
6. Churn: CHP slot 03 (CHP-09) keeps it; LEH concept LEH-10 retired.
7. Flock as floor: SML slot 09 (SML-10) keeps it; BBI-11 and DDN-10 retired (LKO slot 09, LKO-10, is a flag steering a flock).
8. Stack pulled from the bottom: CCU slot 04 (CCU-04) keeps it; SML-09 and CCU-10 retired.
9. Layers peeled by landing: JMU slot 05 (JMU-05) keeps it; PAT-09 retired.
10. Bridge sway by cadence: SHL slot 03 (SHL-08) keeps it; DDN-05 retired.
11. Wade the wet, crust beside breaks: DDN slot 02 (DDN-02) keeps it; SVP-05 retired.
12. Sun: LKO slot 04 (LKO-05) is the one owner of light direction; the sun-as-clock row in section 4 lists four other stages, each a different object, and "never a sixth" is dropped. CHH slot 07 (sun cue to herder call), ITA slot 10 (sun line to bricks on the bridge) and SML slot 07 (sun melt removed) were recast in v2. ITA-05, SML-05, KOH-09 stay retired.
13. Fog: GTK slot 07 (GTK-07) owns it; DEL slot 08 (DEL-02) and PAT slot 06 (PAT-03) have none. PAT slot 10 no longer reads truck lights (JMU slot 09 owns lights ahead).
14. Door that opens one way: IMP slot 01 (IMP-T) owns it; PAT slot 04's door is at the dome base; IMP-07 retired.
15. Floats under load: PAT slot 05 (PAT-04) owns it; ITA-10's raft returns at ITA slot 08 only as poles that split sideways.
16. Wrestling: CHH slot 06 (CHH-03) owns it; KOH-08 retired.
17. Pattern decides the floor: LKO slot 03 (LKO-04) owns it in the first wave. PAT slot 03 (PAT-06 Madhubani), BPL encore 09 (Gond dots), GNR encore 09 (Bandhani) and BBI slot 10's soot twist are retired. BBI slot 06, AGT slot 04 and SXR slot 08 stay because the solid part is decided by a beat, a height and a spoken count, not by the picture.
18. Dancers as platforms on a drum: BBI slot 07 (BBI-08) owns it; DIS-05 retired.
19. Read-a-number puzzles: AGT-08 retired. PAT-11 Nalanda moved from reserve to PAT slot 08 (HWIK) in v2, replacing Sattu.
20. Vehicle lean by rider side: PAT slot 07 (PAT-07) owns it (v1 called this "height by load"); DDN-11 retired.
21. Decoy twin (B37, used by TVM-01): GTK slot 03 (GTK-08) is an inspector who removes bags; v2 replaces GTK slot 08 churpi and SXR slot 05 paper box, both still B37.
22. Unverifiable or off-place: LKO-09 Taj and LKO-11 Pachisi are reserves only.
23. (v2) Forced food: AMR-01 owns being fed. PAT slot 08 Sattu and CCU slot 03 phuchka are retired.
24. (v2) Maker ahead: AGT slot 03 mat and KVT encore 09 coir are replaced; LKO slot 03 has no stitcher act; CCU slot 05's potter no longer adds clay ahead of you.

## 6. How a builder uses this file

1. Find your city in section 2 (new) or section 3 (shipped). Slots 01-10 are your stages in order; R1, R2 (R3) are reserves. Read the full A2/A3 and closest text in `allocation.json`; the tables here clip v1 rows (changed v2 rows are printed in full).
2. Build only the concept in your slot. The family and betrayal columns are your key: nobody else owns it. If a reserve is needed, take R1 then R2; never an idea from another city's table.
3. Before coding, grep the nouns and verbs of your idea (TROLL-BIBLE section G) and read the almost-used table in section 4; owners there are named `CITY slot NN (concept)`. If your idea is near one, change the mechanic, not the dressing.
4. Chains: A2 is the obvious fix and dies to a different trap, A3 is one move. HWIK slots name their tell and must satisfy TROLL-BIBLE section D (one unknown, a visible tell readable muted, one move after one death, the guide never describes an unmet trap). Build exactly the HWIK slots your city is allocated (some cities have two, at 05 and 08); do not add another. Never repeat a betrayal type inside your city.
5. Shapes: `tour`, `std`, `long`, `marathon` (slot 07 only, 2-3 min, hidden checkpoints), `tough` (slot 09: 60-90 s, 4-5 beats, 3-4 checkpoints, knowable), `HWIK`, and `HWIK (long 60-90 s)` at slot 05 (it is also the long stage, 3-4 checkpoints). Slot 10 calls back only your own city; the chain names the two own ideas its twist combines.
6. **Door endings and act ids (v2 rule).** Every stage declares `meta.ending`: a kebab-case key for its door-ending idea, prefixed with the city code (`pat-plate-gap`, not `plate`). The idea must be new against MECHANICS.md's "Door endings" list and the `advice:` lines in `src/game/levels/endings*.ts` (an idea counts as used under a new name) and against every other city's endings. Act ids follow `<city><slot>-<word>` (`pat07-tempos`) and are new against MECHANICS.md's Acts list and every other city; one per id, never reused. The allocation does not assign endings or acts; grep before you pick. The same rule is in `allocation.json` under the top-level `rules` object.
7. Gate: in the game repo copy `docs/allocation.json` from ldd-inbox first, then run `npm test` (`tests/allocation.test.ts` skips if the file is missing). In ldd-inbox, `python3 allocation-work/check.py` checks the same duplicate rules.
