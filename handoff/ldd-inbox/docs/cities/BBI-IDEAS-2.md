# BBI ideas v2: new decisions for stages 05, 06, 07, 08

Research only, 2026-11-27. For the builder of `city/bbi` round 3. Game facts come from `docs/cities/BBI.md`,
`docs/TROLL-BIBLE.md`, `docs/ALLOCATION.md` + `allocation.json`, the game's `docs/MECHANICS.md`, the stage files in
`ldd-wt/bbi/src/game/cities/bbi/` and `reports/cities/bbi/{BUILD,LENGTH}.md`. Place facts carry a link; V = the Odia
line is on a source, U = not verified (use the BBI.md fallback line).

**The test applied to every candidate:** the player's decision, in one sentence, is not one the game already asks
(the seed's list; MECHANICS.md; BBI's own loom, chariot, troupe and idle-machine rules in `s05-s09.ts`). Checked by
grep of `allocation.json` and MECHANICS.md for each act's nouns and verbs (pyramid, switch off, bait, snap, blur,
twitch, plug, winding, false stop, belt, stall: no hits; "refuge" hits only BPL-09's rockfall wave, see C2).

Per act: **Place** · **Rule** · **Decision** · **A1** obvious play and its death · **A2** obvious fix and its
*different* death · **A3** one-move answer · **Closest** idea and the difference · **Adds** clear time · **Line** · **Source**.

---

## 07 Gotipua (64.3 s of 120; needs ~55 s, a momentum beat and a shelter beat)

Shipped in 07 (`s07.ts`, LENGTH.md): poses on the drum's stop; thrown at the restart; lamps over the wheel; the far
drummer; bagudi; the falling tower; the chain (momentum: keep walking the bridge); the lamp plinth (shelter).
Allocation: a turning wheel as a platform is restricted; "stand still to be held" is almost-used (ALLOCATION.md §4).

### C1 · The pyramid (MOMENTUM beat) — `bbi07-stambha-2` or new id
- **Place.** The gurukul yard where the boys drill a three-tier bandha pyramid before the night show (boys train from
  age 5-6; bandha = the acrobatic poses, Wikipedia Gotipua). Pyramids are the famous bandha finish; U as a fact.
- **Rule.** Boys mount the pyramid bottom-up, one on each drum stroke, and come down top-first; each tier is a floor
  only until the next boy lands on it.
- **Decision.** *Climb with the build, always one tier ahead of the boy who is climbing.*
- **A1.** Stand on tier 1 and wait for the pyramid to "finish" → the tier-2 boy lands on your head (`bbi-chadha`).
- **A2.** Climb to the top with them and wait there for the high bank → they dismantle top-first: your floor is the
  first to leave (`bbi-ohla`), a different death from A1.
- **A3.** Step from the top tier on to the bank the moment the top boy lands, never waiting for "done".
- **Closest.** `bbi07-shrinkhala` (keep walking a bridge), `bbi09-udaya` rising spokes ("wait on each spoke until the
  next is up", `causes.ts`). Here waiting is what kills, and the floor is built under you upward. B7 "staircase that
  eats itself" (TROLL-BIBLE B) is PARTLY; the rising-under-you build is its FREE half.
- **Adds.** 15-20 s (two pyramids, the second with a faster drum).
- **Line.** "Upare chadha, Dad! | Climb up, Dad!" U. **Source.** https://en.wikipedia.org/wiki/Gotipua

### C2 · The practice wall (SHELTER beat)
- **Place.** The yard wall the boys use for handstand and cartwheel drills; tumbling runs start at the wall, go out
  across the floor and come back (U detail; the wiki confirms acrobatic training only).
- **Rule.** The strip against the wall is the one place no tumbler lands, but every run starts and ends there.
- **Decision.** *Shelter at the wall only while the tumblers are out on the floor; leave it before they come home.*
- **A1.** Run across the floor between runs → the next run begins and a cartwheel lands on you (`bbi-digbaji`).
- **A2.** Wait at the wall for the floor to clear, then go → the run comes back to the wall to restart, and you are
  standing on their start mark (`bbi-pherila`).
- **A3.** Step to the wall as a run leaves it, and walk out behind the last tumbler, not after the run ends.
- **Closest.** B13 wave-with-refuge is BPL-09's (`rock-shelter-refuge-wave`, allocation.json: a rockfall wave,
  overhangs as refuges, a second wave if you pass the last one). Here there is no wave and no second wave: the refuge
  is the hazard's own start line, safe only while the hazard is away. Also differs from `bbi07-dweepa` (a plinth that
  is always safe) and from "step aside and let it pass" (the fix dies because the safe spot stops being safe).
- **Adds.** 12-15 s. **Line.** "Kantha pakhare ruha! | Stay by the wall!" (ruha, pakhare V on Omniglot; phrase U).
- **Source.** https://en.wikipedia.org/wiki/Gotipua

### C3 · The guru's stick: a stop that is not a pose
- **Place.** The guru sits at the pit's edge with his danda (stick) and halts the drummer to correct a boy (the
  guru-taught training is in the wiki; the stick is U).
- **Rule.** Two kinds of stop: the drummer's stop (sticks DOWN) makes a pose; the guru's stop (danda raised, the
  drummer frozen with sticks UP) freezes the troupe mid-whirl as a ragged wall, no bridge.
- **Decision.** *Go only on a sticks-down stop; a raised danda is a stop you do not use.*
- **A1.** "Go at the stop" (BBI's own 07 rule) → the frozen whirl is a wall in the pit (`bbi-danda`).
- **A2.** Wait out every stop and go on the restart → thrown (`bbi-thrown`, the existing cause), a different death.
- **A3.** Read the drummer's hands: down = pose, go; up = guru's stop, wait.
- **Closest.** TROLL-BIBLE B5 "cadence, then a liar" (FREE) and law 6 (the known rule goes stale) applied to BBI's own
  rule. Not "wait for an all-clear": both stops look like all-clear; the tell is which stop.
- **Adds.** 10-14 s. **Line.** "Ruha! | Stop!" V (Omniglot). **Source.** https://en.wikipedia.org/wiki/Gotipua

### C4 · Winding the pattasari (a bridge with a deadline)
- **Place.** Dressing before the show: the pattasari is a ~4 m cloth worn tight with a knot at the navel (Wikipedia
  Gotipua). Two boys hold it stretched over the pit while a third winds it round himself from the far end.
- **Rule.** The stretched cloth is the bridge; it shortens from the far end as he winds, and when it is all on him the
  near boy is pulled over the edge with it.
- **Decision.** *Cross while the cloth is still being wound, and be off the far end before the last turn.*
- **A1.** Wait for the bridge to be "ready" (taut, still) → that is the last turn; it goes (`bbi-guda`).
- **A2.** Go the moment it is laid → slack cloth sags into the pit under you (`bbi-jhula`).
- **A3.** Step on as the second turn pulls it taut and keep walking; the far end is the dancer's waist, a step up.
- **Closest.** B6 scaffold-with-a-deadline (PARTLY; "deadline collapse FREE"). Not LKO slot 01's cloth bolts
  (ALLOCATION.md §4: that is a vendor's bolts in a market, not a dancer's wound cloth). The deadline is readable: the
  cloth visibly shortens. Weakest of the four 07 ideas because A3 is a window; fine as a plain beat between C1-C3.
- **Adds.** 10-12 s. **Line.** "Guda, guda! | Wind, wind!" U. **Source.** https://en.wikipedia.org/wiki/Gotipua

## 05 Raja (47.7 s of 60; HWIK long; its WTF beat is the first still mill)

Shipped in 05 (`s05.ts`): touch nothing; start the lift, the hand mill and the bullocks on purpose; the goat walks the
pounder; the soot leaves; the door behind the step. Raja facts: for three days no one grinds, cuts, tears or does
farm work; everyone is on swings and eating podapitha; Gotipua dances at night (Wikipedia Raja Parba). Never the reason.

### C5 · The uncle who switches it off (bait him)
- **Place.** The verandah where an uncle keeps the holiday: any machine that starts, he walks over and stops.
- **Rule.** A machine you start runs only until he reaches it; he goes to the nearest running machine first.
- **Decision.** *Start a second machine as bait so he goes there while you ride the one you need.*
- **A1.** Start the water lift and ride it up (05's own rule) → he reaches the well mid-ride, pulls the brake, the
  bucket drops into the well with you (`bbi-mama`).
- **A2.** Wait for him to go back in, then start it → he is watching now and comes out at once (`bbi-mama` from a
  different spot, A2's recorded cause should be the gate he comes through, `bbi-phatak`).
- **A3.** Start the hand mill beside his verandah first; he goes to it; now start the lift and ride.
- **Closest.** `bbi05-tenda` (start the lift on purpose). The decision there is whether to start; here it is which to
  start first and why. "Bait it" exists only for doors (`shy`, TROLL-BIBLE B31); no allocated family baits a person.
- **Adds.** 15-20 s. **Line.** "Raja re kama nahin! | No work in Raja!" U. **Source.**
  https://en.wikipedia.org/wiki/Raja_Parba (work suspended for three days)

### C6 · The belt (what you start here starts something there)
- **Place.** The oil press and the sugarcane crusher share one long drive belt across the yard (village-mill detail, U).
- **Rule.** Starting either starts both; the crusher's rollers, ten tiles on, turn only while the press runs.
- **Decision.** *Lift the belt off its pulley before you start the press, or the crusher you must cross is live.*
- **A1.** Hop on the press beam to cross the channel (it starts, as 05 taught) → fine here; at the crusher the rollers
  are turning and pull you in (`bbi-ganna`).
- **A2.** Touch nothing and jump the channel from the bank (05's A2) → this channel is a tile too wide (`bbi-dhan`).
- **A3.** Step on the slack loop of belt by the channel: it drops off the pulley; now the press spins alone.
- **Closest.** 05's idle-world rule and `bbi05-chakki` (start the mill to be flung). New because the cost of a start is
  somewhere else, and the answer is to break the link, not to time anything. No belt family in allocation.json.
- **Adds.** 15-18 s. **Line.** "Sabu chaluchhi, Dad! | Everything's running, Dad!" U. **Source.** Raja no-work rule as
  above; the belt is a generic village mill (unsourced).

### C7 · What you start, you stop (at the right moment)
- **Place.** The lane past the well: the lift you started in `bbi05-tenda` still swings, and its counterweight stone
  now sweeps the lane every cycle with no gap under it.
- **Rule.** Nobody is working, so nothing you start ever stops unless you touch it again; it freezes where it is.
- **Decision.** *Go back and stop it yourself, and stop it when the stone is at its top.*
- **A1.** Try to pass under the stone's sweep → hit (`bbi-pathara`).
- **A2.** Touch the pole to stop it as soon as you reach it → it freezes with the stone low across the lane: a wall;
  the way is shut and the bucket tips its water over you (`bbi-pani`).
- **A3.** Touch it as the stone passes its top; walk under the frozen stone.
- **Closest.** `bbi05-tenda` (start on purpose). This is its mirror (undo on purpose) plus a phase choice; the seed's
  list has no "stop a machine". Overlaps C5 (both end a machine): build one of C5/C7, not both.
- **Adds.** 10-12 s. **Line.** "Au thare chhua, Dad! | Touch it again, Dad!" (authare V on Omniglot; phrase U).
- **Source.** https://en.wikipedia.org/wiki/Raja_Parba

## 06 Bandha (39.8 s of 60)

Shipped in 06 (`s06.ts`): beats align the patches; the shuttle on the bridge beat; the staircase motif; painted panels;
the undyed hole; the wet sari bounce; the beater; the warp-curtain door. Ikat facts: yarns are tie-dyed before weaving,
bindings removed, warp wound on with bamboo strips lashed on to keep alignment; the pattern's edges are blurred because
the dyed yarns never line up perfectly (Wikipedia Ikat; Sambalpuri sari: "once dyed, it can never be bleached").

### C8 · Snap a thread to stall the loom (but which thread)
- **Place.** The loom bench; when a warp end breaks the weaver stops and knots it (U: ordinary handloom practice).
- **Rule.** Dad's weight on one thread snaps it; the loom stops, the shuttle stays in the weaver's hand until he has
  knotted the end; the snapped thread is gone for good.
- **Decision.** *Break a thread on purpose to stop the shuttle, and choose a plain thread, not one of the motif.*
- **A1.** Let the shuttle pass and cross on the motif beat (06's rule) → this shuttle flies on every beat; no gap
  (`bbi-shuttle`).
- **A2.** Stand on the nearest thread to snap it → it was a motif thread: the bridge now has a hole where you need to
  land (`bbi-sutra`'s cause, new tick).
- **A3.** Snap one of the plain edge threads; the loom stops; walk the whole motif.
- **Closest.** `bbi06-sutra` (a hole you hop) and 05's idle machines (you start things). Here you *stop* a running
  hazard by damaging the world, and pay for the place you choose. MECHANICS.md has no "break the hazard" rule.
- **Adds.** 15-20 s. **Line.** "Suta chhindigala! | The thread snapped!" U. **Source.**
  https://en.wikipedia.org/wiki/Ikat (bindings, alignment); mending is unsourced

### C9 · The blur is not thread
- **Place.** A loom weaving a Sambalpuri motif whose edges are hazy, as real ikat is (Wikipedia Ikat: "an apparent
  blurriness to the design").
- **Rule.** A patch is solid only across its sharp core; the fuzzy fringe is dye that ran, and there is no thread there.
- **Decision.** *Land on the sharp middle of each patch, and read which side the fringe is on.*
- **A1.** Jump to the patch's near edge → it is fringe; through it into the dye (`bbi-dhusara`).
- **A2.** Aim for the centre of every patch → on the second loom the fringe is all on one side (the dye ran toward the
  beam), so the sharp core sits off-centre and the "centre" is fringe (`bbi-dhusara` at a new tick; or record
  `bbi-kanda`).
- **A3.** Look for the crisp edge and land inside it; the fringe is the same on every try.
- **Closest.** TROLL-BIBLE B8 shrinking supports (FREE) is a time shrink; DMN-03 melting ice shrinks over time. This
  is static and readable: a landing strip narrower than its picture, never under one tile (bible E). Not a decoy twin
  (every patch is partly solid).
- **Adds.** 10-12 s. **Line.** "Ranga bohigala! | The colour ran!" U. **Source.** https://en.wikipedia.org/wiki/Ikat

### C10 · Street sizing: the warp lurches (optional, weakest)
- **Place.** The lane where the starched warp is stretched on stands and pulled along to even the tension (U).
- **Rule.** On each sizer's call the whole warp lurches one tile toward the dye trough at the lane's end.
- **Decision.** *Never jump during a pull; walk, and step off at the trough's edge between two pulls.*
- **A1/A2/A3.** Jump on the call → land a tile long, in the trough; walk and ride → carried into the trough; walk and
  hop off between calls. **Closest.** B3 floor-slides (PARTLY, kit `shiftAt`); risk: the experience is near a treadmill
  (BOM, taken in MECHANICS.md). Build only if 06 is still short after C8-C9.
- **Adds.** 10 s. **Line.** "Tana! | Pull!" U. **Source.** unsourced

## 08 Pakhala (38.3 s of 60; HWIK, its WTF beat is the first pour)

Shipped in 08 (`s08.ts`): the pour floats the rice apart; the badi by the right rim; the draining bowl
(`bbi08-bhanwar`: every badi is carried to a hole and down; hop to the rim at the last moment); the leaf-plate door.
Pakhala facts: cooked rice soaked or fermented in water, the liquid is torani, served with badi, fried fish, saga;
basi (overnight) pakhala is fermented (Wikipedia Pakhala). Both candidates have a tell visible from frame one.

### C11 · Plug the hole with a badi
- **Place.** The next bowl being emptied, with a hole only a badi wide (tell: the hole's size against the badi).
- **Rule.** The first badi to reach the hole plugs it; the current dies; the rest float still.
- **Decision.** *Let a badi go down the hole on purpose: send the one you are not on, then walk the still ones.*
- **A1.** Hop off at the last moment, as `bbi08-bhanwar` taught → this bowl is deeper; the rim is out of reach
  (`bbi-bhanwar`).
- **A2.** Ride away from the hole → the current wins and takes your badi to it; down you go (`bbi-bhanwar`, new tick:
  record as `bbi-bhanwar-2` or `bbi-gaadi`).
- **A3.** Step to the next badi as yours nears the hole; yours plugs it; the water stops; cross on foot.
- **Closest.** `bbi08-bhanwar` (escape the drain). This is law 6 on BBI's own rule: the drain you learnt to flee is
  the thing you feed. The seed's list has no "sacrifice a floater to stop the hazard".
- **Adds.** 15-20 s. **Line.** "Chala ame mishiki khaiba! | Let's eat together!" V (Omniglot).
- **Source.** https://en.wikipedia.org/wiki/Pakhala

### C12 · A dribble is not the pour
- **Place.** Serving: a jug held level dribbles first, then pours; a jug filled to the brim pours at once (tell: the
  fill line on the jug, drawn from frame one).
- **Rule.** The dribble nudges your badi a little; the pour shoves it a tile. A brim-full jug has no dribble.
- **Decision.** *Hold on through the small push; the real move is the second one; and read the jug's fill line.*
- **A1.** Hop at the dribble's nudge (taking it for the pour) → into open water (`bbi-tike`).
- **A2.** Wait out dribble and pour → fine; at the next bowl the jug is brim-full, pours with no warning, and the
  waiting dad is shoved under the rim's lip (`bbi-dhara`'s cause at a new tick, or `bbi-purna`).
- **A3.** Level jug: ride both moves, then hop. Full jug: hop as it tips.
- **Closest.** TROLL-BIBLE B4 "twitch, then the real shift" (FREE), dressed as a pour; the existing jugs
  (`bbi08-dui`, cut) ask *where* the jug hangs, this asks *how full* it is and whether a small move is the move.
- **Adds.** 12-15 s. **Line.** "Tike tike, Dad! | Little by little, Dad!" (tike V on Omniglot; phrase U).
- **Source.** https://en.wikipedia.org/wiki/Pakhala

---

## Ranked (best first)

1. **C11 plug the hole (08)**: new verb (feed the hazard), BBI's own drain rule made stale, tell from frame one.
2. **C1 pyramid (07, momentum)**: inverts `bbi09-udaya`'s "wait for the next"; two pyramids give 07 the most seconds.
3. **C3 guru's stick (07)**: breaks "go at the stop" inside its own stage (law 6), readable tell (sticks up/down).
4. **C8 snap a thread (06)**: stop the hazard by breaking the world, with a cost for the place you pick.
5. **C5 the uncle (05)**: bait a person with a decoy machine; turns 05's rule into "which first".
6. **C2 practice wall (07, shelter)**: a refuge safe only while the hazard is out; differs from BPL-09 (no wave).
7. **C9 the blur (06)**: cheap, static, true to ikat; a strong plain beat between two betrayals.
8. **C12 dribble then pour (08)**: B4 is FREE and fits the kitchen; A3 is partly a read of the jug.
9. **C6 the belt (05)**: a remote cost; longer to build (two machines, a belt sprite).
10. **C7 stop at the top (05)**: good mirror of tenda, but build C5 or C7, not both.
11. **C4 pattasari deadline (07)**: honest deadline, but A3 is a window.
12. **C10 lurching warp (06)**: near a treadmill; only if 06 still needs 10 s.

Suggested 07 order (law 5, shelter and momentum alternate; bible E, 5-6 betrayals): existing acts, then C1
(momentum), C3, C2 (shelter), C4; estimated +50-60 s, which reaches the 120 s floor with the shipped 64.3 s.

## What I could not verify

The Wikipedia Gotipua page confirms acrobatic bandha training from age 5-6, the mardala and gini, the ~4 m pattasari
and the pose names (sagadi, nauka, mayura, hansa, keli kadamba, kandarpa ratha); it does not confirm pyramid
formations, a guru's stick or wall drills, so C1-C3's yard details are U (a Sahapedia page on Gotipua returned 404).
Handloom end-mending (C8), street sizing (C10), the shared belt (C6) and the switch-off uncle (C5) are ordinary village
or workshop practice without a fetched source; the Raja page confirms only that work stops for three days. Pakhala's
page confirms rice in water, torani, badi and overnight fermentation, not the serving details in C11-C12. All Odia
lines except "Ruha!", "Chala ame mishiki khaiba!" and single words (tike, pakhare, authare) are U; use BBI.md's
fallbacks. Clear-time figures are estimates against the shipped acts' lengths in LENGTH.md, not measured.
