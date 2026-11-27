# PDY Puducherry: extend and toughen pass (EXTEND.md)

Worker chat-90 (kirocrew-worker), 27 Nov 2026, 06:49-08:58 UTC (Kiro Crew restart at 07:25 cost ~9 min). Branch `city/pdy`, head **589e9d0**, cut from develop f8288e9 (v0.17.2), nine commits, develop did not move. Worktree `/local/home/saiposh/personal/ldd-wt/pdy`. Not pushed, no version bump, nothing merged.

## 1. Honest section first: what is short, what is not done

| Item | State | Numbers | Reason |
| --- | --- | --- | --- |
| PDY-10 length | **short of the 90 s floor** | route 2316 ticks = **19.3 s** (room 2 leaves + 2 acts + door); par 60 | Two law-7 acts were built (thenga, aaru); the other callbacks (02 pools, 03 signs, 05 rafts, 07 waves, 08 sparks) were not. Time went to getting both encores through the lag sweep and the 7.5 s replay bar, then to the old rooms' fairness. |
| PDY-09 acts with a two-cause pair | 4 of 5 acts + the room + the door | carreau has only A1 (pdy-plomb) | In the carreau the roller stops dead on the lying boule, so there is no roller death on the far side of the cochonnet, and the lobs only fall on stones: no second cause exists in that act. The other four acts (pointe, doublette, tir, mene) each have A1 pdy-plomb and A2 pdy-boule at different ticks (table in section 3). |
| Fairness of the old rooms (contract E) | 02, 04, 05 fixed; **03, 07, 08 still fail** at N=80 | PDY-03 6t 78% 12t 31% (spikes @71 at the door, "stuck: down and run"); PDY-07 6t 99% 12t 69% (splash on boards 6/8/12); PDY-08 6t 20% 12t 15% (burnt everywhere in the rooftops room) | Each shipped room needs its own human-timing pass (TVM took one round per room). I did 02, 04 and 05 (section 7). 03, 07 and 08 untouched: their shipped routes and stages are as on develop. A first try at 07 (jump first, lean later) made it worse (12t 63%) and was reverted. |
| Act-level registry near-collisions found late | **flagged, not resolved** | `pdy09-carreau` vs `tvm09-ashoka` ("the marker feints and stays where it was: stay put"); `pdy09-doublette` vs `tvm09-pozhikkara` ("the safe spot goes on and then comes back: follow both moves") | The families are distinct (nearest-to-jack-safe vs moving flags) and the gate was run on the room, door, tour bite and mimosa before building; the per-act check against TVM-09's acts was only done while writing this report. Conductor's ruling needed: keep (object and read differ: a boule stopping a boule, a thrower at each end) or recast. A recast that fits Puducherry: carreau -> "the roller stops, but the LYING boule shoots on and carries the cochonnet with it" (the thing that moves is not the one you watched). |
| Hidden items | 1 per stage, both encores | PDY-09 croissant on the gravel at the pitch's far end (28, 14.9): every roller runs past it; PDY-10 croissant over the second pit at (21, 11.7): a hop from the short-count bar | The PDY-09 item is risky by place (gravel), not by height; QA may want it higher. |
| Doublette lazy line | survives | a dad who never leaves stone 1 after the first volley survives the doublette (the second knock brings the cochonnet back to stone 1) | Geometry: two knocks in opposite directions return near the start. A1 (follow the first knock) and A2 (stand beside it) both die; the "never move" line is not among the plays and is not punished. |
| Tour FIX | the shared one (hop the policeman, cause hit) | not changed | The square has a NAIVE and two mistakes; the stage's FIX stays the kepi one. |
| Lag sweep tool | the tester's `qa6.test.ts` copied to `tests/pdyqa/` (scratch, **not committed**) | | Same file as DIS/PAT used. |

Everything in section 2 onwards is measured at head 589e9d0 unless a commit is named.

## 2. Branch and proof summary

- Commits (`git log --oneline develop..city/pdy`): 7ee91b5 encores + prefixed keys + ten intros + seven-nil line; 760e445 tour bite; f3ee42c checkpoints (tour cp on the terrace, 04 bell); ecefe7d fifth act mene nulle + quicker volleys; d611c6b PDY-02 timing; f1a6def PDY-04 sockets, hops, lamp dash; 31386f2 PDY-05 cart and cobble; f584f85 refreeze; 589e9d0 duplicate play dropped.
- `npx tsc --noEmit`: clean. `npx vitest run` (full): **18 files passed, 1684 tests passed, 0 failed**, 23 env-gated skipped (08:44 UTC, with the frozen test on the refrozen pdy.json).
- `tests/modules.test.ts -t PDY` with the `PDY: OLD,` line **deleted** locally: 11 passed (ten stages, NAIVE for all ten, FIX for 5, item in every stage, route for every act, policy for every ending, fair list, 10 intros, prefixed keys). `tests/cpsafe.test.ts -t PDY` with the same line deleted: **10 passed strict** ("idle, run and tap-jump at lag 0/6/12") for PDY-01..10. Both files restored with `git checkout`; the integrator deletes the line at merge.
- `tests/allocation.test.ts`: 10 passed (meta of 09/10 matches docs/allocation.json; ending keys `pdy-boule-pile`, `pdy-night-leaf` are new and prefixed).
- `LDD_N=80 npm run fair -- PDY`: section 8.
- Lag-captured sweep (qa6, lag 0/6/11/12 x idle 0/37/120/251, 7 plays per capture): **0 unsafe captures in 3528 plays over the ten stages**; per-tick replay worst 7.20 s (PDY-09) and 6.58 s (PDY-10): section 9.
- `npm run build:single`: built; `node scripts/flows.mjs`: "no errors".
- Shots: section 12.

## 3. The two encores

| id | name | family [betrayals] | ending key | route vs floor | fairness 6/12t, worst stretch (N=80) | checkpoints | hidden item |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PDY-09 | Pétanque (the boulodrome by the old pier) | nearest-to-jack-safe [moving-target-tile] | pdy-boule-pile | **63.2 s** (7589 ticks) vs 60 s floor; par 75 | 100% / 100%; every stretch 100% (12 stretches) | 11, all calm under the sweep: 32.5, 63, 64.5, 95, 96.5, 127, 128.5, 159, 160.5, 191, 191.5 (act start and act end of each of five acts, plus the door's) | croissant on the gravel at (28, 14.9) |
| PDY-10 | Touch-Me-Not (thottal sinungi, the Botanical Garden's mimosa) | fold-on-touch-leaf [fold-under-weight] | pdy-night-leaf | **19.3 s** (2316 ticks) vs 90 s floor: short, see section 1; par 60 | 100% / 100%; every stretch 100% | 5, all calm: 32.5, 53, 54.5, 79, 79.5 | croissant over the second pit at (21, 11.7) |

### PDY-09 Pétanque: the rule

Five flagstones (2 tiles wide, 1 tile up) stand along a gravel pitch. A caller shouts, a boule rolls down the gravel from one end at 205 px/s (bowls over anyone on the gravel: cause `pdy-boule`), knocks the red cochonnet one tile on when it reaches it, runs out a tile short of the far end; then high lobs come down on every flagstone except the one nearest the cochonnet (cause `pdy-plomb`). Up on a stone the roller passes under you. The decision each volley: **which stone is nearest the cochonnet now, after the boule has moved it** (not where it was, not where you were told it would go). Tara: "Ignore the boules, Dad! Just walk through!" Guide: "Stand on a flagstone, Dad. Boules roll on the gravel." Sign BOULODROME / le cochonnet. Chalk scoreboard counts the ends.

Acts, each with its one-sentence decision, closest registry row and why it differs, and the two plays (cause@tick is the absolute tick of the full-stage play; "from act start" in section 10):

| act | decision (one sentence) | closest row, why different | NAIVE / A1 | FIX / A2 |
| --- | --- | --- | --- | --- |
| room (volley: plain knock +1 from the left) | Read where the cochonnet lands and stand on the stone nearest THAT, after letting the roller pass under you. | TVM-09/room (flags carried before each wave: be between the flags). Different: the marker here is a target the hazard itself moves; you read a distance to the ball, not a strip between two flags; the roller is a second hazard with its own lane. | hold right (walk the gravel): pdy-boule @138 | stand on the stone nearest the cochonnet as it lies now, and stay: pdy-plomb @427 |
| pdy09-pointe (second thrower from the far end, knock 1 back) | A boule from the far end knocks the cochonnet back toward you: the nearest stone is now the one on your side. | tvm09-pozhikkara (flags carried on, then back). Different: one knock per thrower, direction read from which end shouts; no walk with a man. | A1 stay on the stone the first knock made nearest: pdy-plomb @1514 | A2 "nearest the cochonnet" taken literally, down beside it on the gravel: pdy-boule @1315 |
| pdy09-carreau (a boule already lies before the cochonnet) | The roller hits the lying boule and stops dead (a carreau): the cochonnet does not move, so neither do you. | **tvm09-ashoka** (he paces and plants the flags back where they were: stay put) — same decision shape, flagged in section 1 for a ruling. | A1 move a stone on for the knock that never comes: pdy-plomb @2542 | none (see section 1) |
| pdy09-doublette (thrower left knocks +1, thrower right knocks 3 back) | Two throwers: judge the nearest stone after BOTH boules, not after the first. | **tvm09-pozhikkara** (on, then back over the pool) — flagged in section 1. | A1 follow the first knock and stay: pdy-plomb @3280 | A2 get down beside the cochonnet between the throwers: pdy-boule @3478 |
| pdy09-tir (the called hard shot, 260 px/s, knock 3) | When the caller shouts Tir the cochonnet goes three tiles, not one: the nearest stone is farther on than the point taught. | SVP-03 arrow board (an honest sign tracks the hazard) — different: nothing tracks; the shout is the only tell and the player must convert it to a distance. | A1 one stone on, as the point taught: pdy-plomb @5135 | A2 get down beside it: pdy-boule @4939 |
| pdy09-mene (the shot sends the cochonnet clean off the pitch) | A cochonnet off the pitch is a dead end: no stone is nearest, the lobs come down on every one, and the gravel is the place once the boule has run out. | no row found for "the safe tile stops existing; the hazard lane is the refuge" (grep of DECISIONS.md for void/dead end/no safe/gravel: none). | A1 stay on the stone that was nearest when it left: pdy-plomb @6178 | A2 down beside it as the hard shot comes: pdy-boule @5984; A3 run after it to the far stone: pdy-boule @6046 |
| door pdy-boule-pile | The terrace door is behind a wall too high to jump (6 tiles): stand on the spared stone while three last volleys (knock 0) heap boules on the other stone; the heap is your stair over the wall. Tara: "Jump the wall, Dad! Easy!" | B20-adjacent? No: the marker does not move here. Closest shipped shape: none found for "the hazard's debris builds the route"; checked against OldTwist names and ENDINGS keys by the allocation test (not a shipped ending). | walk straight on along the gravel to the wall, as Tara says: pdy-boule @6555 | stand on the stone the boules are heaping on: crushed @6731 (a landing solid boule) |

Engine notes for QA: rollers are `Thing('pdy-boule', deadly 'pdy-boule')` at FLOOR-12, hazard inset 2; lobs spawn at y 2+5i (above the frame counts as solid, a boule spawned at y<0 landed instantly: fixed), g 1100, land on stone tops; in the acts landed lobs are not solid, in the door they are (24 px wide heap boules, 3 high: top at y 188; wall top 144; a full jump from the heap clears it, from a stone or the path it does not). Flags per pitch: `<prefix>:volley, phase (idle|roll|lob|done), jack, stones, nearest (-1 = off the pitch), spared, roller {cx,dir}, piles[]`. Prefixes: `pdy09`, `pdy09-<act>`, `pdy09door`.

### PDY-10 Touch-Me-Not: the rule

Broad mimosa leaves lie one tile above the garden path, bridging pits (lily pond `splash`, or the mimosa's own thorns `pdy-mul`), with their ends over the path on both sides. Weight folds a leaf after a beat (`lazy` 0.25 s, the leaflets swing up out from under you and you drop); folded, it is a thin stiff bar that holds, for a count (`count`), then it opens again. The decision: **fold it on purpose from its near end over the path (you only drop to the path), then climb the bar and cross inside the count**. The first leaf stays folded 4 s, the second 1.8 s. Tara: "Walk on the leaves, Dad! They're a bridge!" Guide: "Fold the leaf first, Dad. Then climb on." Gate against the brief's classes: S9 "don't stop on the sinking floor" (KVT-08 sandbar/weed) — here stopping on the bar is fine until the count, and running across the open leaf dies; PAT-05 pontoon sinks under load — here the fold is the tool, not the hazard; PNJ-02 bubbles (cycle you wait out) — waiting for the leaf to reopen is the punished fix. The Puducherry decision is the count and the fold-first order, not "keep moving" and not "wait for it to come back".

| part | decision | law-7 break of | NAIVE / A1 | FIX / A2 |
| --- | --- | --- | --- | --- |
| room, leaf 1 (count 4 s) and leaf 2 (count 1.8 s) | fold from the near end, climb the bar, cross; at the second leaf go the moment it is a bar | — | hold right: splash @67 (walks into the pond under the leaf) | do leaf 1 right, then at leaf 2 take the same look round before climbing on: pdy-mul @653 (it opens under you). Also: jump on leaf 1 and run: splash @125; fold leaf 1 and wait for it to open again, then walk across it: splash @754 |
| pdy10-thenga | A palm leans over the leaf's near end: your weight on the leaf shakes the coconut loose on to the spot you stood on. Fold, and step back left the moment it folds; the nut lands where you stood, rolls off, then climb. | PDY-06 "hop under the palm, then wait for the nut to roll away" — here standing where you triggered it is the death, and the hop is not the trigger (weight is) | A1 fold the leaf and stand there as it folds, like leaf 1: hit @861 | A2 hop under the palm first as at Paradise Beach, wait, walk on along the path: pdy-mul @845 |
| pdy10-aaru | At the bell the paving turns to spikes coming TOWARD you from the far end; fold the leaf, get up on the bar, let the front pass under, then go. | PDY-04 "at six, run, the spikes chase from behind" — here running is the death and standing still up on the bar is the way | A1 the bell: run, as at six o'clock: pdy-mul @1303 | A2 fold the leaf and wait on the path beside it: spikes @1607 |
| door pdy-night-leaf | The long leaf before the door sleeps folded while the lamp is off and opens in the light: cross in the DARK, when it is a bar; in the light it folds you into the pond. Tara: "Go in the light, Dad!" Lamp period 4.0 s, lit 1.6 s. | PDY-04's pdy-lamp door "the door only lives in the lamplight: dash in when it comes on" — inverted | cross in the light, as Tara says: splash @2007 | — |

## 4. The tour bite (tour-pdy-b20) and its registry check

PDY-01 Promenade, after the deck: the sea has eaten four tiles of path (cols 103-106, `splash`). A yellow plywood square (`pdy-square`, one-way, 16x4) lies over the LAST tile of water (col 106) looking like the far side's landing mat. The moment you commit to a jump from the edge (jumpTick with cx in [100.4, 103.2) at road level) it slides one tile right on to the sea wall (col 107, moveTo 0.22 s) and the water it covered is under you. Decision: **trust the support (the sea wall, a long jump), not the marker (the paint)** = B20 "Coin that moves: trust the support not the coin", FREE in DECISIONS.md (line 986). Checked against TVM-09 flags (the safe strip moves with the waves: a timing-and-place read of an honest marker) and SVP-03's honest arrow (a marker that tells the truth): here the marker is a lie about what is support, and the move is the reveal, not the hazard. Against TVM-01's fish ice (a platform that twitches, then is yanked: wait out both moves): no waiting helps here, the lid moves only when you jump for it, and the answer is where you aim, not when. Tara: "Land on the yellow square, Dad! Easy!" Guide: "Don't trust the paint, Dad. Trust the wall." The tour's teaching job (posts, ditch, parked ride, steps, cap chase) is unchanged. NAIVE: a hop for the square from 101.8: splash @1871. Mistakes: walk straight on along the Promenade: splash; jump for the square from further back to be on it sooner: splash. Route: long jump (30 ticks) from 101.6; 100% at 6/12/18 ticks. The tour's checkpoint after the terrace steps moved from 67.5 to 63.5 (on the terrace): at 67.5 a respawn that runs is in the policeman's way at 69 (cpsafe strict failed cp3, 6 plays). Checkpoints now [28.5, 35.5, 47.5, 63.5, 89.5].

## 5. Lines (local | English)

- seventh death (`seven`), replacing "Thala for a reason": **Sept à zéro, Monsieur! Boules thirumba podu! | Seven-nil, sir! Throw the boules again!** (7 | 6 words; the French numeral, the pétanque scoreboard; "thirumba podu" = throw again, as Pondy Tamil says it).
- Tara intros for 02-10 (10 in all; the old five kept): 6 "Paradise Beach-ku vaa! Tide paathu po! | Come to Paradise Beach! Watch the tide!", 7 "Surf pannalaam vaa! Board mela yeru! | Let's surf! Get on a board!", 8 "Bastille Day! Rooftop-la vaa, Dad! | Bastille Day! Come up on the rooftops, Dad!", 9 "Boules-a paakkaadhe, Dad! Nadandhu po! | Ignore the boules, Dad! Just walk through!", 10 "Ilai mela nadandhu po, Dad! Paalam dhaan! | Walk on the leaves, Dad! They're a bridge!" (6-8 were the stages' own rival intros, now also in the city list so the tenth-stage index wraps correctly).
- New in-stage lines: callers "Tirez! | Shoot!", "À moi! Pointe! | My turn! A point!", "Carreau! | A carreau!", "Doublette! Tirez! | Doubles! Shoot!", "Et moi! | My turn!", "Tir! Tir! | Shoot hard!", "Plombée! | High lob!", "Mène nulle! Tous! | Dead end! All of them!", "Dernière mène! | Last end!", "Encore une! | One more!", "La dernière! | The last one!"; mimosa "Thottal sinungi! | Touch-me-not!", "Aaru mani! Road close! | Six o'clock! The road is closing!"; guides in sections 3-4. Cause lines (`causes.ts`): pdy-boule, pdy-plomb, pdy-mul, each [what happened, how to beat it]. All other LINES fields unchanged and still right for ten stages (death, taunt, beaten, idle, cleared, brag, lastLife).

## 6. Prefixed keys (every rename)

Door endings (`endings.ts`, `PdyEndingKind`): bells -> pdy-bells, fakewin -> pdy-fakewin, shuffle -> pdy-shuffle, mirror -> pdy-mirror, mime -> pdy-mime, lamp -> pdy-lamp; new pdy-boule-pile, pdy-night-leaf. The stage `twist:` fields in levels.ts renamed to match. The shared policies in tests/endings.ts are found through `policyFor`'s prefix strip; pdy-lamp gets its own policy in tests/cities/pdy.ts (section 7).
Things (`things.ts`, `ModuleThingKinds`): bollard -> pdy-bollard, awning -> pdy-awning, umbrella -> pdy-umbrella, croissant -> pdy-croissant (also the tour `item`), lights -> pdy-lights, surfboard -> pdy-surfboard, rocket -> pdy-rocket; new pdy-boule, pdy-cochonnet, pdy-leaf, pdy-square. The shared PDY-07 route finds boards by `thingOf(w, 'surfboard', i)`, which matches through `sameKind`.
Causes: `causes.ts` was empty; new pdy-boule, pdy-plomb, pdy-mul (burnt, splash, spikes, hit, crushed, fell stay shared).
Act ids were already prefixed (pdy02-pools .. pdy08-sparks); new pdy09-pointe, pdy09-carreau, pdy09-doublette, pdy09-tir, pdy09-mene, pdy10-thenga, pdy10-aaru. Modules guard: "prefixes its new keys" and "route for every act" pass with PDY off the list.

## 7. Stages 02-08

| stage | changed? | what | why | NAIVE cause | FIX cause | fairness 6t/12t (N=80) | checkpoints moved |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PDY-02 Rock Beach | route only (tests/cities/pdy.ts `rockBeach`) | hop each blowhole from the middle of its rock, jump first and lean right 3 ticks later, when the blowhole stays quiet 0.8 s | the lag model holds a direction pressed with a jump `lag` ticks longer; from the rock's edge that walked a person off the next rock into the sea (splash @17/21 at 12t: was 75%) | splash | splash (swapAt 'over the whole turtle pool') | 100% / 100% (was 98/75) | no |
| PDY-03 Yellow Wall Jam | **no** | — | not reached in the budget | crushed | crushed | 78% / 31% (develop: same) | no |
| PDY-04 Six O'Clock | stage + route | the socket fires only when Dad passes at road level (feet within 16 px of the road), not under a hop in the air; the act's bell rings at X(5) instead of X(3); hops jump-first; a pdy-lamp door policy that dashes in anywhere in the first 0.35 s of light (was 0.12 s) | a late low hop used to be launched from mid-air into the lights (burnt @19/20); the bell at X(3) was 2.5 tiles past the act checkpoint so a run or tap-jump respawn rang it and the front caught him (cpsafe strict cp0, 6 plays); the 0.12 s dash window stuck a lagged dad outside the light for whole cycles | burnt | — (none shipped) | 100% / 100% (was 100/83) | act cp0 unchanged at 32.5; the hazard moved 2 tiles later |
| PDY-05 Grand Canal | route only (`grandCanal`) | hop the cart while it is 62 px off (was 46); the loose cobble jump-first from 25.4 (was 26.6) | at 12t the late hop met the cart at 20 px of height (hit @24) and the late cobble hop popped the cobble under him (spikes @27) | splash | hit (shared) | 100% / 100% (was 100/65) | no |
| PDY-06 Paradise Beach | **no** (already fair) | — | 100/100 on develop | splash | hit | 100% / 100% | no |
| PDY-07 Serenity Surf | **no** | a jump-first version of the board hops was tried and reverted (12t 63%, hops fall short in the wind) | boards 32 px wide, hops 56 px, the held-direction drift walks a person off the far edge | splash | — | 99% / 69% (develop: 98/80 at N=40) | no |
| PDY-08 Quatorze Juillet | **no** | — | not reached; the rooftops room kills a lagged dad at every mark | fell | — | 20% / 15% | no |

The obvious play dies in every stage (NAIVE for 01-10); FIX plays exist for 01, 02, 03, 05, 06, 09, 10 (seven; five needed).

## 8. Fairness, `LDD_N=80 npm run fair -- PDY` (08:45 UTC, head f584f85 + the duplicate-play drop)

```
PDY-01: 6t 100%  12t 100%  18t 100%   stretches s0-s4, door 100%
PDY-02: 6t 100%  12t 100%  18t 100%   s0 100% s1 100% door 100%
PDY-03: 6t 78%   12t 31%   18t 38%    died spikes @71 x19, stuck 'down and run' x27, spikes @67 x9; s0 66% door 47%
PDY-04: 6t 100%  12t 100%  18t 100%
PDY-05: 6t 100%  12t 100%  18t 84%
PDY-06: 6t 100%  12t 100%  18t 89%
PDY-07: 6t 99%   12t 69%   18t 53%    splash @6 x10, @8 x10, @12 x4, @20 x1; s0 69%
PDY-08: 6t 20%   12t 15%   18t 13%    burnt @2 x24, @17 x22, @6 x5 ... ; s0 15%
PDY-09: 6t 100%  12t 100%  18t 100%   s0-s10 and door 100%
PDY-10: 6t 100%  12t 100%  18t 100%   s0-s4 and door 100%
```

## 9. Lag-captured sweep (qa6: route at lag 0/6/11/12 x spawn idle 0/37/120/251; at every checkpoint the lagged run takes, replay to that tick then idle 4 s, run 0.3 s after 0/6/12, tap-jump after 0/6/12 = 7 plays) and per-tick replay

| stage | distinct captures | plays | unsafe | longest stretch | worst replay to a death (s), lag 0/6/12 |
| --- | --- | --- | --- | --- | --- |
| PDY-01 | 5 | 560 | 0 | 6.7 s | 2.08 |
| PDY-02 | 2 | 224 | 0 | 11.9 s | 3.04 |
| PDY-03 | 2 | 112 | 0 | 11.2 s | 5.35 (route dies at lag 6/11/12: the fairness failure above) |
| PDY-04 | 2 | 224 | 0 | 6.2 s | 1.49 |
| PDY-05 | 2 | 224 | 0 | 13.9 s | 5.54 |
| PDY-06 | 2 | 224 | 0 | 14.2 s | 1.33 |
| PDY-07 | 2 | 112 | 0 | 13.5 s | 1.18 (route dies at lag 11/12) |
| PDY-08 | 2 | 56 | 0 | 8.5 s | 0.96 (route dies at idle 37/120/251 at most lags) |
| PDY-09 | 11 | 1232 | 0 | 12.5 s | **7.20** (pointe A1 at the second lobs) |
| PDY-10 | 5 | 560 | 0 | 7.9 s | **6.58** (fold leaf 1, wait for it to reopen, walk across) |

Per-tick replay table, PDY-09 (seconds from the last captured checkpoint to the death, lag 0/6/12): naive 1.15/1.20/1.25; fix 3.56/3.61/3.66; m0 3.57/3.62/3.67; m1 1.73/3.58/3.58; m2 pointe A1 7.20/7.20/7.20; m3 pointe A2 5.54/5.53/1.66; m4 carreau A1 6.15/6.15/1.66; m5 doublette A1 3.75/3.75/3.75; m6 doublette A2 5.40/5.41/1.66; m7 tir A1 6.83/6.83/6.83; m8 tir A2 5.20/5.19/1.66; m9 mene A1 6.83/6.83/6.83; m10 mene A2 5.22/5.22/1.66; m11 mene A3 5.73/5.73/1.66; m12 door walk-on 1.13; m13 door heap stone 2.59. PDY-10: naive 0.56/0.61/0.66; fix 5.44/5.67/5.88; m0 1.04/1.14/1.24; m1 6.28/6.43/6.58; m2 thenga A1 1.94/1.99/2.04; m3 thenga A2 1.81/1.89/1.94; m4 aaru A1 1.22; m5 aaru A2 3.75; m6 door 1.57/1.43/4.78. All under 7.5 s. The 7.20 s came down from 8.88 s by quicker volleys (pre-roll 0.5 s, roller 205 px/s, roller stops a tile short, lob delay 0.3 s, lob g 1100, 0.3 s between volleys, trigger at X(6)); the window a person has from the knock to the lobs landing is ~1.75 s for one stone (64 px) and fairness held at 100%.
Rides: PDY-07 (surf school) and PDY-08 (rooftops) were not re-laid as trigger-started segments (not reached); their old checkpoints are calm under the sweep (0 unsafe) and their replays are short because the shipped routes die early at lag.

## 10. Probe tables for 09 and 10 (generated by `tests/pdyqa/probe.test.ts`, scratch; same-tick and identical-window scans)

PDY-09 (route won at 7589 = 63.2 s): see the full table in `/tmp/pdy_probe.txt` at run time; copied here:

| act | starts | play | cause | tick | from act start |
| --- | --- | --- | --- | --- | --- |
| room | 0 | NAIVE | pdy-boule | 138 | 1.10 s |
| room | 0 | FIX | pdy-plomb | 427 | 3.51 s |
| room | 0 | stay on the first stone you climbed | pdy-plomb | 428 | 3.52 s |
| room | 0 | run for the far stone the moment the caller shouts | pdy-boule | 208 | 1.68 s |
| pdy09-pointe | 32 | A1 stay | pdy-plomb | 1514 | 7.17 s |
| pdy09-pointe | 32 | A2 beside it on the gravel | pdy-boule | 1315 | 5.52 s |
| pdy09-carreau | 64 | A1 move a stone on | pdy-plomb | 2542 | 6.13 s |
| pdy09-doublette | 96 | A1 follow the first knock | pdy-plomb | 3280 | 3.73 s |
| pdy09-doublette | 96 | A2 beside it | pdy-boule | 3478 | 5.38 s |
| pdy09-tir | 128 | A1 one stone on | pdy-plomb | 5135 | 6.81 s |
| pdy09-tir | 128 | A2 beside it | pdy-boule | 4939 | 5.17 s |
| pdy09-mene | 160 | A1 stay | pdy-plomb | 6178 | 6.81 s |
| pdy09-mene | 160 | A2 beside it | pdy-boule | 5984 | 5.19 s |
| pdy09-mene | 160 | A3 run after it | pdy-boule | 6046 | 5.71 s |
| door | 192 | walk on to the wall | pdy-boule | 6555 | 0.99 s |
| door | 192 | stand on the heap stone | crushed | 6731 | 2.46 s |

Same-tick scan: no two plays of one act die on the same tick (the room's FIX and "first stone" are the same lobs, 1 tick apart, both plomb: a same-cause-near flag, not a same-tick one; the room's NAIVE/FIX pair differ by cause and 289 ticks). Identical-window scan over act ids: no two acts share a (cause, time-from-start) row set.

PDY-10 (route won at 2316 = 19.3 s): room NAIVE splash @67 (0.51 s), FIX pdy-mul @653 (5.38 s), jump-on-and-run splash @125, wait-for-reopen splash @754; thenga A1 hit @861 (1.96 s from act start), A2 pdy-mul @845 (1.82 s); aaru A1 pdy-mul @1303 (1.23 s), A2 spikes @1607 (3.77 s); door in-the-light splash @2007 (1.68 s). Same-tick: none after the duplicate play was dropped (589e9d0). Identical windows: none.

## 11. Refreeze (`bash scripts/dev/refreeze.sh PDY`), every changed number

- PDY-01 checkpoints 67.5 -> 63.5: the tour cp moved on to the terrace (section 4). NAIVE tick 1108 'hit' -> 1871 'splash': the city's NAIVE for the tour is now the hop for the square (the kepi NAIVE lives on as the shared FIX).
- PDY-02 route 1494 -> 1500 (+6 ticks): settle-to-the-middle steps and the 3-tick jump-first lean. FIX 893 -> 900: the shared FIX is spliced from the route at 'over the whole turtle pool' and inherits the +7.
- PDY-04 route 1251 -> 975 (-276 ticks = 2.3 s): the lamp dash now goes in the first 0.35 s of light instead of waiting cycles for a 0.12 s window; the socket hops without drift.
- PDY-05 route 2206 -> 2205: the cart hop starts 16 px earlier, the cobble hop 1.2 tiles earlier (one tick net).
- PDY-09 and PDY-10: new entries (par 75/60, items (28,14.9)/(21,11.7), checkpoints as in section 3, route 7589/2316, NAIVE pdy-boule @138 / splash @67, FIX pdy-plomb @427 / pdy-mul @653).
- PDY-03, 06, 07, 08: unchanged.

## 12. Shots (read)

`shots/route/PDY-09-sheet.png`, `PDY-10-sheet.png`, `PDY-01-sheet.png`, `PDY-02-sheet.png`, `PDY-04-sheet.png`, `PDY-05-sheet.png` in the worktree (15 frames each along the recorded route; recordings in /tmp/rec). Read: 09 shows the two throwers at the pitch ends, the callers' shouts, the red cochonnet, boules landing on the un-spared stones, the chalk scoreboard, the heap of three boules against the 6-tile wall and the EXIT on the terrace; 10 shows the leaves open (broad leaflets) and folded (thin bar), the pond and thorn pits, the palm and coconut, the spike front in the aaru act, the lamp and the dark overlay at the door; 01 shows the Promenade gap with water and the yellow square by the sea wall, and Tara's "Land on the yellow square" line. Flagstones read as low dark blocks; QA may want a lighter tile cap for them.

## 13. Risks and where QA should press

1. The two act-level near-collisions with TVM-09 (carreau/ashoka, doublette/pozhikkara): a ruling is needed; a recast of carreau is proposed in section 1.
2. PDY-10 is 19.3 s against a 90 s floor: three or four more law-7 acts are the remaining work (candidates: 02 pools as leaves that are ponds, 05 rafts, 07 waves, 08 sparks), each with the fold-first decision broken.
3. PDY-03, 07, 08 fail human-timing fairness as shipped; 08 most of all (15% at 12t). These are the rooms' own precision, not the acts.
4. Doublette's "never move" line survives (section 1).
5. The heap climb: `m.hold` 16 from the stone edge, 22 from the heap; QA should play it by hand at lag and watch for overshoot past the door (the policy has a fallback full jump back).
6. The night-leaf dark window is 2.4 s minus the 0.3 s fold for a 144 px bar: the route goes within the first 0.9 s of dark; a dawdler dies in the pond (intended), but 18t fairness is 100% so the window is not tight for the route.
7. The pdy-square lid is 16x4 px and reads small on the sheet; the bite depends on noticing it.
8. The PDY-09 hidden croissant lies on the gravel at the far end: every roller passes over it; a player collects it only between volleys (intended risk), but the rule "somewhere risky" may want a height.
9. Scratch files `tests/pdydbg.test.ts`, `tests/pdylag.test.ts`, `tests/pdyqa/` are untracked and not committed; `tests/pdyqa/probe.test.ts` runs unconditionally if left in a checkout (it passed in the full suite).
