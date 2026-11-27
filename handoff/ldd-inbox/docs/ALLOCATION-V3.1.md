# ALLOCATION v3.1: rulings recorded, KVT-09 filled, town-life refill for the still-short stages

**v3.1, 2026-11-27, 10:45-11:05 IST (05:15-05:35 UTC), the same allocator (work item it_88cfbe9a).** v3 (`ALLOCATION.md` from line 560,
`allocation-v3.json`) is accepted and unchanged. v3.1 adds: the conductor's rulings on `DECISIONS.md` §5 (04:58 UTC) and where each is
applied; KVT-09's block; a town-life refill pass for SVP-07, LKO-07, DIS-06 (after the V1 ruling), LKO-05, CCU-05, CCU-08 and GTK-06; and `allocation-v3.1.json`
(= v3 + the rows below; the v3 file is left as it is). Every assignment was checked against `DECISIONS.md` (regenerated at the 05:30 UTC tips)
and against the v3 families; a candidate that reduces to an owned decision is listed as struck with the row it reduces to. Columns are v3's.
Branch tips re-read 05:20 UTC: LKO d22d02f, CCU 857c327, DIS ddb8b58, GTK 8c009e5, SVP 1c26e8f, KVT 3b9940e, BBI e126215.

## 1. Rulings (conductor, 04:58 UTC) and where each is applied

Written into `DECISIONS.md` §5 as the first sentence of every verdict cell ("Ruled (conductor, 04:58 UTC)"). In one place here:

| Row | Ruling | Applied |
|---|---|---|
| S1 | TAKEN | DIS-04 room cut; new room F448 Talatal (v3). |
| S2 | cut `gtk03-kagaz` | GTK applied (a5225e9); F482 is GTK-03's replacement (~30 s). |
| S3 | lift class: `kvt05-lift` owns it; GTK-02 keeps `ulta`, drops `bhatti`; CCU cuts `uthan2` only, `uthan` stays | GTK applied; CCU-09 keeps `uthan` (~50 s with `line` stretched, below). |
| S4 | cut `ccu05-uthon`; `lane` recast to the paint-line read | CCU-05 honest number below. |
| S5 | recast the CCU tour bite; kumir river kept | CCU-01 row below. |
| S6 | `baan` cut | CCU-07: F481 (built as `ccu07-horn`, 857c327) + F502. |
| S7 | CUT `svp05-rassi`, `svp10-rassi`; the walk-into-rope recast is DMN-05, also taken | SVP applied (1c26e8f); SVP-05 refilled with F503 (v3). |
| S8 | DIS-10 door recast: bars rise AHEAD of her, she sinks them as she passes; go in front | DIS block below. |
| S9 | DIS-07 door recast as a cadence read: cross only while the fishers rest between pulls | DIS block below. |
| S10 | BBI-01 tour tell recast: the jet follows the walker and spares the stopper | BBI block below. |
| S11 | `lko07-shaam` stays only with the which-awning-next tell | LKO-07 block below. |
| S12 | STRICT: GTK keeps `thau`; DIS recasts `bordoisila` to a direction read ("wind before hail: get the granary between you and the WIND side"); if not a different decision, cut it and F457 is 07's sound beat | DIS applied the recast at ddb8b58 ("the hail drives in on the wind side"); recorded below. |
| S13-S21 | KEEP | nothing to apply. |
| I1 | GTK wins; `kohra` greeting-only or cut | LKO cut it (0967e1a). |
| I2 | SVP wins; `chhidkav` cut | LKO applied (0967e1a). |
| I3 | LKO wins; `peeche` recast to the just-emptied-bin read | GTK applied (a5225e9). |
| I4 | CCU wins; SVP-03 door recast per the v3 row | SVP applied (1c26e8f: the board's own arrow). |
| I5 | the dheki object is BBI's; DIS re-skins `dis07-dheki` on to a different worked machine. 05:18 UTC: the conductor accepted the **Sarthebari bell-metal disc** (v3 row; C6 was rejected only because the dheki held the decision) as DIS's one still-point act and withdrew the "not the bell-metal disc" line. | DIS block below: the disc is the re-skin; the jute rope-walk stays as the alternate object. |
| I6 | as written | LKO-10.5 struck (v3). |
| I9 | DIS wins: `gum-ta` cut; F467 is BBI-07's sound beat, F468 a reserve | BBI block below. |
| W1-W9 | as listed (W2 `jawab`/`tasveer` keep the break, `julus`/`galiyara` plain or own break; W3 keep the door, `tokta` cut or re-read; W4 `ulto` cut when v3 lands) | LKO-10, CCU-08, CCU-07 rows below. |
| CCU slots | NOT taken: no 05/06 swap, 08 stays HWIK; the honest number is written | CCU block below (my v3 recommendation withdrawn). |
| F471 | allowed only if its NAIVE is "wait for the still skewer" and its window is not "go on the cook's action" | condition written into the F471 row below. |
| V1 | RULED 05:08 UTC: KVT-09 owns B16 (F496 `slide-is-the-ride` stays); DIS-06 loses F453; the DIS builder told to skip it | KVT block below; DIS-06 refill row in §4 (none legal: honest ~48 s). |

## 2. KVT-09 Kalpeni Kadalkara (tough): 36.7 s against 60, +26 s

Current acts and decisions (kvt tip 3b9940e, FIX-1.md B4): room, on the slide walk to the far end of each step and tap up; `pavizham` under the beach-rock lip a tap, never a full leap;
`kodumudi` narrow steps take the far tile, over the summit walk off and never hop down; `kadalbhitti` a heap in the break you land deep on, a lone block you jump whole; `varambu` on a ridge only
the middle holds; `murivu` jump well past the cut; door `kvt-buried-door`, three hops slide the heap off, the fourth tips you in. `irangal` and `kuzhi` were cut as repeats of `kodumudi`.
No KVT bible exists in `ldd-inbox/docs/cities` (confirmed again); places come from the branch doc's Kalpeni source check (Wikipedia: coral debris of the 1847 storm on the eastern and
southern shores) and the shipped city's advice lines. Every current act treats the slide as a penalty to compensate; the two acts below make it the tool, then make it persist.

| Stage | Family (F#) | DECISION | Source | Place | NAIVE → / FIX → | Est. s |
|---|---|---|---|---|---|---|
| 09 Kalpeni Kadalkara (tough) | F496 `slide-is-the-ride` | A beach-rock lip too low to leap under (09's `pavizham`) with the next ledge beyond a tap's reach: land SHORT on purpose and let two landings slide you under the lip to the ledge's foot; on the ridge after it, land on the side of the heap you want to travel: the slide is how you move, not only what you avoid. | B16 (block that pushes: contact is a ride); V1 applied for KVT | the eastern storm bank under the cemented beach-rock lip | tap-jump for the ledge as `pavizham` taught → the lip `spikes` / walk off the step to avoid any slide (`kodumudi`'s answer) → the ledge is out of reach and the slide stops at the lip's foot over the pool: splash | 14 |
| 09 Kalpeni Kadalkara (tough) | F497 `place-the-heap-for-the-way-back` | The route doubles back along the crest, and every heap you slide stays where it went: on the way out, slide each heap on purpose to where you will need it on the way back; a heap slid off the crest is gone. | new (09's own physics made persistent) | the crest above Koomel bay, out along the sea side and back along the lagoon side | climb clean, far tile every time → on the way back the heaps sit under the lip, the gap is a full leap into the pool: splash / slide every heap as far as it goes → the third goes off the crest into the lagoon and the way back has no step: beach rock `kvt-rock` | 12 |
| 09 Kalpeni Kadalkara (tough) | none further | A third act was looked for and every candidate reduced to an owned decision: slide direction by wave phase (`tvm-backwash-ride`), cemented patches that do not slide (DIS-09 grip pads), packing a heap with a first landing (TVM-04/PDY-06 bait-it-then-go), copra fresh vs dry (DMN-03, ruling S1), terns that dive at a stander (TVM-04 coconuts) or trade two hazards (RPR-06), a fisherman's weight pinning a heap (`bom08-together`), the fishermen's packed path (`kvt-footsteps`), pushing rubble into a cut (RPR-04/RNC-06 make your own step), a slump chain (B7, DIS-04 F448), a rope line as the safe path (GTK-07 kerb rope), hermit-crab heaps (B37). KVT-09 ≈ 63 s with F496 and F497. | | | | 0 |

Closest in the registry and why these differ: `bbi-curl-stair` (make the floor by your own side effect, at once) vs F497 (plan a return over floor you moved); RNC-07 (the falling water is the
way down) vs F496 (the slide is aimed by where you land, not entered). KVT-10 already breaks 09's rules (`kvt10-kallu`); F496 and F497 give it two more if the finale ever needs them.

## 3. DIS: rulings applied (DIS-07, DIS-10)

| Stage | Family (F#) | DECISION | Source | Place | NAIVE → / FIX → | Est. s |
|---|---|---|---|---|---|---|
| 07 Husori (marathon) | I5 (decided 05:18 UTC): `dis07-dheki` re-skinned on to the bell-metal disc, no new family | The still point on a thing worked by other people: a bell-metal disc hammered by three smiths in turn; the centre where no hammer falls is the one still tile; cross between falls and leave when the tongs rise (the dheki lever is BBI's). | IDEAS-2 C6 re-skinned (its rejection was only that the dheki already held the decision) | Sarthebari bell-metal workshop, Barpeta (bible §3 crafts; U for the hammering pattern) | stand near a smith → his hammer `dis-hatudi` / wait on the anvil's edge for all three to stop → the tongs lift the disc with you `dis-sarai` | 0 (re-skin, same length) |
| 07 Husori (marathon) | I5 alternate object (not needed) | The jute rope-walk: two twisters walk backwards from a post whipping the strands; they swing widest at the walkers' end and not at all at the post, so cross nearest the fixed end when the strands are at the far side of their swing. Kept as the alternate if the disc proves unbuildable; it was the allocator's proposal under the earlier strict reading. | new (jute is Assam's; the rope-walk is U) | a riverside lane on the Jorhat road | mid-lane → whipped `dis-rosi` / wait at the walkers' end → the rope comes back with them `dis-rosi-tan` | 0 |
| 07 Husori (marathon) | S12 STRICT: `dis07-bordoisila` recast | Wind before hail: the hail drives in on the wind side, so get the granary between you and the WIND side (a direction read); sheltering under it is not enough. DIS applied this at ddb8b58. | 07's own | the bhoral by the pond | shelter under the granary on the wind side → hail `dis-hail` / run on in the open → `dis-bordoisila` | 0 |
| 07 Husori (marathon) | S9: door `dis-uruka-net` recast | The fishers pull the net in on a cadence: cross only while they rest between pulls. | 07's own door | Uruka pond | | 0 |
| 10 Luit (finale) | S8: door `dis-post-bank` recast | The bars rise AHEAD of the plucker and she sinks them as she passes: go in front of her, breaking 03's "follow behind". | 10's own door | the Luit at the plucker's path | | 0 |
| 06 Majuli ka Paar | V1 RULED 05:08 UTC | F453 withdrawn (KVT-09 owns the B16 thought). Replacement looked for in §4 (DIS-06): none legal; DIS-06 ≈ 48 s with F454-F456 and plain beats. | | | | |

## 4. Town-life refill

### SVP-07 Ship Late Hai (marathon): 57 s of 120

Places read (bible §2-3): Aberdeen Bazaar, Chatham saw mill (02 owns the cut floor), Ross Island ruins (09 owns roots and brick), the Port Blair bus stand on its slope, the jetty waiting hall
and ticket queue (the bible says use only these two from transport; CHN-02 is a queue, keep different). Cellular Jail: the bible's hard no ("never a stage, never a gag"), so no act there, even
courtyard life.

| Stage | Family (F#) | DECISION | Source | Place | NAIVE → / FIX → | Est. s |
|---|---|---|---|---|---|---|
| 07 Ship Late Hai | F491 `exit-shelter-same-side` (v3) | Leave the arch shelter by the side you entered; the far side is where the rush comes round. **Shelter beat.** | candidate 3 | Haddo wharf arches | leave by the far side → the crowd `svp-bheed` / stay in the arch → the luggage stack beside it is the floor that goes `svp-saman` | 12 |
| 07 Ship Late Hai | F504 `rolls-back-before-it-goes` | On the sloped bus stand a bus about to leave rolls BACK half a tile before it pulls away (its engine note rises first): the safe place is beside a departing bus, never behind it and never in front. **Momentum and sound beat** (the note tells you which bus, the slope tells you which way). | new (bible §3 town buses on hilly roads) | the Port Blair bus stand on the slope (Mohanpura, U) | wait behind the bus for it to leave → rolled over `svp-bus` / run in front as the note rises → it pulls away into you `svp-bus-aage` | 12 |
| 07 Ship Late Hai | (conditional) `leave-the-blind-shelter-by-ear` | Inside a Ross Island bunker you can hear the rush but not see it: leave when the noise has gone past, not when it sounds loudest or when the board changes. | new (bible §2 Ross Island ruins; WWII bunkers U) | Ross Island | step out at the loudest → the crowd `svp-bheed` / wait for the board → the second rush (WRONG SHIP) `svp-bheed` at a new tick | 10, **only if** the conductor reads "time the exit by ear" as new work against `gtk07-thau` (shelter-and-wait, S12 strict); otherwise struck |
| 07 Ship Late Hai | none further | Struck on the way: the ship's horn pattern (TVM-02 bells), three-language call as "the third is real" (LKO F473), the speaker's crackle before the board changes (forecast cue: DIS-02, I9), Aberdeen's shutters coming down in order (PDY-04), a rented bike downhill (JAI-06), the ticket queue (DMN `customs`), the mopped hall (DIS-09 slide), the fish market's ice slabs (TVM-01 B4), Chatham's belts (BBI C6), Chatham's log pond (AMR-03), a padauk table carried out (PAT-04). SVP-07 ≈ 81 s (91 with the conditional act). | | | | 0 |

### LKO-07 Hazratganj (marathon): 80 s of 120 (town life, not crowds)

| Stage | Family (F#) | DECISION | Source | Place | NAIVE → / FIX → | Est. s |
|---|---|---|---|---|---|---|
| 07 Hazratganj | F474 `pass-on-the-attention-side` (v3, built `lko07-dukaan`) | Pass the window-shopper on the window side, not the open side he steps back into. | candidate 7.3 | arcades | | 10 (built) |
| 07 Hazratganj | F475 `sound-names-the-side` (v3) | A tonga behind you rings its bell on the side it will pass: step to the OTHER side. **Sound beat.** | new | carriageway | stand still (PAT-04's answer) → `lko-tonga` / step to the bell side → `lko-tonga-ulta` | 10 |
| 07 Hazratganj | F476 `crowd-gathers-under-light` (v3) | The strollers gather under each lamp as it lights: take the dark stretch before its lamp lights; the lamplighter's order is readable. | new | lamp posts | under the lit lamp → `lko-nala` / run the dark stretch → the ladder swings `lko-seedhi` | 10 |
| 07 Hazratganj | S11 | `lko07-shaam` stays only with a which-awning-next tell (the shop boy at the crank); without it, cut. | | | | 0 |
| 07 Hazratganj | none further | Town-life seeds struck: tempos and e-rickshaws leaving when full (GTK F484 occupancy), the cinema ticket queue (DMN `customs`), the kulfi cart's bell that stops the crowd (SVP-07 rush), a balloon seller's bunch (JAI-07), pavement booksellers' stacks (CCU-04), a sweet shop's free sample (retired forced food), winter-sun sitters moving with the shade (LKO-04's own), paan shop (BPL `paan`), a street band (PNJ-08), hot sheermal (05's door), the fog (I1), the bucket sprinkle (I2), the pigeon grain (TVM-04 class). LKO-07 ≈ 100 s. | | | | 0 |

### DIS-06 Majuli ka Paar (long): ~48 s of 60 after V1 (F453 withdrawn)

Places read (DIS bible §2-3): Majuli's bank and the bamboo spurs (the room), Mising stilt houses (the 06 door), the ferry ghats (boats are taken; the ghat man's flag is F455), fish traps on
the channel (F456), the ferry wake (F454), Salmora pottery (hand-built, no wheel, open firing), Mising weaving (looms are BBI-06), water hyacinth, cattle fords, geo-bag erosion walls,
RCC "porcupine" spurs, Ali-Aye-Ligang (dance), the satras (religious: never a mechanic).

| Stage | Family (F#) | DECISION | Source | Place | NAIVE → / FIX → | Est. s |
|---|---|---|---|---|---|---|
| 06 Majuli ka Paar | none legal | Every Majuli candidate reduces to an owned decision: pots drying in rows, fired holds and unfired crumbles (age tell: S1 class, DMN-03); brown shallow water walk, dark channel jump (PDY-02 rock pools); hyacinth mats that hold only where rooted (IMP-05/07 phumdi families); geo-bags, stitched hold and torn spill (GTK-03 stitches); RCC porcupines that roll unless landed on the body (`kvt09-varambu`, only the middle holds); the eddy's circling log comes back round (blinker cycle, PDY-07); the wake comes twice and the second is bigger (PDY-07 third wave); the collapsed bank cannot collapse again, walk the rubble not the intact bank (`bbi-turf-roll`: the stripped strip is safe); the fisherwomen's jakoi mark the shallows, cross where they stand (`kvt-footsteps`); the herd's ford (CHH-07, `kvt-footsteps`); the ghat road's new pale sand runs, old dark packed sand holds (DDN-02 wet/crust, S1 class); the undercut lip breaks under whoever stands at the edge (B36 shelter trap, TVM-06); the bank collapse runs along from upstream slower than a run, never pause (PDY-04, `gtk07-ghumti`); potters beating clay, the beaten pot is firm (CCU-09 maker ahead, BBI-04); the bhur raft (F453, KVT-09 by V1); the inner bend (C5, the spurs' own family). B12 (spike wave) is PDY-04's thought; B33/B40 are not length. DIS-06 stops honestly at ~48 s: the room, F454 refuge-not-flight, F455 marker-moves-floor-stays, F456 bell-names-the-moving-platform, and plain beats. | | | | 0 |

### LKO-05 Galouti (long): 48 s of 60

| Stage | Family (F#) | DECISION | Source | Place | NAIVE → / FIX → | Est. s |
|---|---|---|---|---|---|---|
| 05 Galouti | F471 `hop-at-the-turn` (v3, **conditional**) | The cook's skewers turn on their own clock: a skewer that has been still a while is about to turn, so the hop goes under a skewer the moment it has turned flat. **Condition (conductor):** the NAIVE must be "wait for the still skewer" (the stillness read is the new work) and the window must NOT be "go on the cook's action"; if the builder can only make it "hop when the cook turns it", it is `lko05-ghee`'s class and is cut. | candidate 5.2 | Tunday Kababi lane, Chowk | wait under a skewer that has been still → it turns into you `lko-seekh` / hop under one the moment the cook touches it (ghee's habit) → the heap squashes under the wait and the tawa burns through `lko-tawa` | 9 |
| 05 Galouti | none further | Struck: dastarkhwan seating in order (CCU-09 maker ahead), basket-chaat rim eaten inward (B8, KVT tour), the dum lid popping (HYD-03), a tray offered (retired forced food), the cook's palm pressing from his end (`lko05-ulta`'s own), kulfi matka stacks (CCU-04). LKO-05 ≈ 57 s with F471, 48 s without. | | | | 0 |

### CCU-05 Kumartuli (long) and CCU-08 Adda (HWIK): ~25 s and ~30 s

| Stage | Family (F#) | DECISION | Source | Place | NAIVE → / FIX → | Est. s |
|---|---|---|---|---|---|---|
| 01 tour | S5 | The tour bite is recast (arriving on the rail from a jump was `kvt02-glass`); the kumir chalk river stays as the bite. | | | | 0 |
| 05 Kumartuli | none legal (S4 applied: `uthon` cut, `lane` paint-line only) | Honest number ~25 s, written as the conductor ruled (no slot swap). Struck: bare frames you pass through (RNC-06 hollow window), wet clay that sinks (mud), sprayed-vs-dry figures (S1/S4), load height (`ccu07-dui`), the chala lowered (ceiling drop), tilting a wide figure round a corner (PAT-07 lean), the potter's wheel (BBI-09 hub), carried figures on poles (PAT-04). | | | | 0 |
| 07 Howrah | W4 | `ulto` cut now that F481 is built (`ccu07-horn`, 857c327); F502 `board-takes-one` stays assigned. CCU-07 ≈ 84 s. | | | | 0 |
| 08 Adda | none legal | Honest number ~30 s, HWIK as allocated (no reshape). W3: keep the door, `tokta` cut or re-read. Struck: argument loud/quiet (BBI F467), the newspaper's page turn (`lamp`), carrom coins (B11, DIS F451), load-shedding (BLR-06), the adda moving under the overhang in rain (slide), a cat on the rok (PNJ-04), the bhanr thrown down (glass, JAI-05), the chai kettle's steam (TVM-03), a para football rolling across (CHN-04). | | | | 0 |
| 09 Pandal | S3 | `uthan` stays, `uthan2` cut; `line` stretched by two beats as the labelled momentum beat; CCU-09 ≈ 50 s. | | | | 5 |

### GTK-06 Seedhi (long): 54 s of 60 (with F484)

| Stage | Family (F#) | DECISION | Source | Place | NAIVE → / FIX → | Est. s |
|---|---|---|---|---|---|---|
| 06 Seedhi | F484 `occupied-means-it-moves` (v3) | Read occupancy before you pass: a taxi with one seat left pulls out across the stair foot; a lit house throws you out of its through-door; the empty taxi and the dark house are the way. | candidates 10 + 11 merged | the taxi stand and switchback houses | the nearly-full taxi → `gtk-taxi` / the lit house's door → `gtk-khaai` | 14 |
| 06 Seedhi | none further | Struck: a dhara tap's overflow on the landing (DMN-03 slide), the stair handrail that is a leaking water pipe (I2 class), a doko porter or the school flood coming down (PAT-04), a dog on the landing (PNJ-04), Lal Market baskets on the steps (CCU-04 stacks), the cardamom drier (GTK-02's own tier cycle), handmade-paper frames (S2), a stair that floods in the monsoon (BOM-04). GTK-06 ≈ 54 s. | | | | 0 |

## 5. BBI: rulings applied

| Stage | Family (F#) | DECISION | Applied |
|---|---|---|---|
| 01 tour | S10 | The gardener's jet follows the WALKER and spares the stopper; the wet-tile slide stays. | builder to apply |
| 07 Gotipua | I9 (ruled 04:58 UTC, confirmed 05:12 UTC: it stands whatever list A said) | DIS-02 is a forecast read by ruling (kept), so `bbi07-gum-ta` is cut. F467 `quiet-means-clear` is BBI-07's sound beat; F468 `accordion-folds-at-hinge` a reserve. The v3 BBI row "(conditional) forecast-cue-names-pose" is resolved: cut. With B1, B2, B4, B5, B6 and F467, BBI-07 ≈ 121 s. | builder to apply |

## 6. Summary

| City | v3.1 change | Est. after v3.1 |
|---|---|---|
| KVT | F496, F497 (restated; V1 applied) | 09 ≈ 63 s |
| DIS | `dheki` re-skinned on to the bell-metal disc (I5, decided 05:18 UTC; rope-walk the alternate); `bordoisila` direction read (S12, applied); doors 07 and 10 recast; F453 withdrawn by ruling V1, DIS-06 refill: none legal | 06 ≈ 48 s (honest), 07 ≈ 120 s, rest as v3 |
| SVP | F504 bus rolls back (+12), conditional bunker-by-ear (+10) | 07 ≈ 81-91 s |
| LKO | F471 condition written; no new 05/07 family | 05 ≈ 57 s (48 without F471), 07 ≈ 100 s |
| CCU | honest numbers, no slot change; `ulto` cut (W4) | 05 ≈ 25 s, 07 ≈ 84 s, 08 ≈ 30 s, 09 ≈ 50 s |
| GTK | none further | 06 ≈ 54 s |
| BBI | I9 (gum-ta cut, F467 sound beat, F468 reserve; ruling stands) and S10 applied | 07 ≈ 121 s |

New families in v3.1: F504 `rolls-back-before-it-goes` (SVP-07); conditional, no number: `leave-the-blind-shelter-by-ear` (SVP-07). Families now F447-F504
(F453 withdrawn, F468 a reserve, F471 conditional). `allocation-v3.1.json` = `allocation-v3.json` + F504 + the rulings' flags (`v3Rulings`), uniqueness check in the done report.
