# PDY Puducherry: toughen round 2 (EXTEND-2.md)

Worker chat-90 (kirocrew-worker), 27 Nov 2026, 09:01-10:10 UTC. Branch `city/pdy`, head **250d33d**, develop merged in at fd0c3f0 (412039f, v0.17.3: Sri Vijaya Puram); seven PDY commits on top of round 1's 589e9d0. Worktree `/local/home/saiposh/personal/ldd-wt/pdy`. Not pushed, no version bump, nothing merged into develop. Round 1 (EXTEND.md) stands as accepted; this file covers the four rulings of the round-2 brief.

## 1. Honest section first

| Item | State | Numbers | Reason (rule or engine) |
| --- | --- | --- | --- |
| `pdy09-carreau` | **CUT** | PDY-09 is room + 4 acts + door | The act was `tvm09-ashoka`'s thought ("the move you expect does not come: stay put") and had one cause. The proposed recast ("the lying boule shoots on and carries the cochonnet: the thing that moves is not the one you watched") failed the registry gate in 3 minutes: it is a carrom cannon, Agartala's reserve row (ALLOCATION.md line 242: AGT-F2 Carrom, F320 flicked-by-striker, "`cannon`: you are a piece") and a struck idea in DECISIONS.md line 675 ("carrom coins (B11, DIS)"). A borrowed break is cut, not built. |
| PDY-09 length | **under the 60 s floor**: 52.1 s (6252 ticks), par 70 | was 63.2 s with five acts | One act cut and the doublette lost its plain opening volley (section 2). No sixth act was built: the budget went to the rooms and the finale, as the brief ordered. |
| PDY-07 Serenity Surf | **under 90%: 6t 99%, 12t 69% (N=80), room and route left exactly as shipped** | three passes, 12t 63% / 80% / 68% | Section 3 has the three attempts and why each failed. Not half-changed: `tests/cities/pdy.ts` carries no PDY-07 override and `levels.ts` is untouched for it. |
| PDY-10 length and act count | **under the 90 s floor**: 31.3 s (3756 ticks), par 75; room + 4 acts + door | the brief asked for three or four more callbacks; two were built (`pdy10-alai`, `pdy10-kuzhi`), so the finale is a room plus four acts plus the door, five breaks | Each act took ~15 min of design, build and the two-play proof at three lags. The 05 rafts and 08 sparks candidates were gated and dropped: the sparks callback ("the sparks fold the leaf for you, cross right after") is the same read as the wave act; a raft carrying a leaf needs a moving Mimosa (a shared-entity change) the file rule forbids. |
| Doublette "same cause near" | A1 (follow the first knock) and A3 (never move) both die to the lobs, 1 tick apart | by design: both wrong stones get the lobs | The pair that the bar asks for is A1 vs A2 (pdy-plomb @2627 vs pdy-boule @1966); A3 is the extra line the ruling wanted dead, and it is. |
| PDY-10 wave act, `alai A2` | dies pdy-mul at lag 0/6/12 | a hop launched from X(4.4) | At lag 18 (not required) the late hop would carry a person to the pit's far edge and he would survive leaf 1. |
| docs/cities/PDY.md and the PDY row in docs/CITIES.md | not written / not updated | | No time left in the budget; the stage facts are in this file and EXTEND.md. |

## 2. The two rulings applied

### pdy09-carreau: cut

Decision as built (round 1): "the roller stops dead on the lying boule, so the cochonnet never moves: stay where you are." Closest row: `tvm09-ashoka` ("he whistles and paces, but plants the flags right back where they were: stay put"), DECISIONS.md line 862, shipped at 0.17.1. Same thought, Puducherry clothes, one cause. Cut per the ruling.

Recast tried on paper (15-minute cap, 3 minutes used): "the roller stops on the lying boule, and the LYING boule shoots on and carries the cochonnet with it: the thing that moves the cochonnet is not the boule you watched." Gate: DECISIONS.md lists 1-2 and the v3/v3.1 families were grepped for momentum transfer, "carries", "relay", "the one you watched", carrom, striker, cannon. Hits: ALLOCATION.md line 242 (AGT reserve, F320 flicked-by-striker, `cannon`), DECISIONS.md line 675 (carrom coins struck for GTK-08 as B11/DIS). A cannon through a second piece is Agartala's reserve: borrowed. No second recast fitted Puducherry's game (a boule that bounces off a stone edge is the same cannon; a thrower who misses is `pointe` again). Cut.

Removed: `carreau` from `encores.ts` and the PDY-09 act list; its route and plays from `tests/cities/pdy.ts`. PDY-09 acts now: pointe, doublette, tir, mène nulle. Route 52.1 s (honest, under 60). Checkpoints 9 (were 11), all calm under the sweep.

### pdy09-doublette: re-laid and kept

Decision: **judge the nearest stone after BOTH boules: the stone the first knock made nearest dies, and so does the stone you started on; only the sum of the two moves lives.** Geometry (stone centres 160, 224, 288, 352, 416; ties at 192, 256, 320, 384): the cochonnet starts at col 15.6 (cx 249.6, stone 1 nearest); the first boule from the left knocks it one tile to 265.6 (stone 2 nearest); the second thrower, from the far end and slower (150 px/s), knocks it FIVE tiles back to 185.6 (stone 0 nearest). Three different stones: start = 1, after the first knock = 2, final = 0. Net displacement −4 tiles, so "+1 then back 5", not the brief's "+1 then back 2" (that lands within 32 px of the start stone and stone 1 stays nearest; see round 1's geometry note).

Why it plays differently from `tvm09-pozhikkara` (flags run far on, then carried back over the pool: follow each move): at Pozhikkara you follow the lifeguard both ways and the right strip is wherever he last planted the flags; here following the first move kills you (A1), staying kills you (A3), and the right stone is one you have NOT been to, reached only by holding still through two boules and reading the sum. The read is "do not act on the first move", the opposite of "go with each move".

The plain opening volley was dropped from this act (`plain: false`): two boules of one end plus a plain volley ran 10 s to the lobs and broke the 7.5 s replay bar; the room and `pointe` already teach the plain knock. Engine: `second: { knock: 5, delay: 0.3, speed: 150 }`, flags `throws`/`thrown` per pitch so the route can "judge after both".

| play | cause@tick (full stage, lag 0) | from act start | lag 0 / 6 / 12 (qa6 replay, s from the act checkpoint) |
| --- | --- | --- | --- |
| route (judge after both) | won | — | — |
| A1 follow the first knock and stay (stone 2) | pdy-plomb @2627 | 6.83 s | 6.86 / 6.86 / 6.86 |
| A2 get down beside the cochonnet between the throwers | pdy-boule @1966 | 1.32 s | 1.35 / 1.35 / 1.35 |
| A3 never move: the stone you took at the shout (stone 1) | pdy-plomb @2628 | 6.84 s | 6.87 / 6.87 / 6.87 |

## 3. The three rooms

| room | before (N=80, 6t / 12t) | after (N=80, 6t / 12t) | what changed | what the room still asks |
| --- | --- | --- | --- | --- |
| PDY-08 Quatorze Juillet | 20% / 15% | **100% / 100%** (18t 100%) | Stage: a rocket's burst sparks fall back into the street they came from (spread 12 px/s instead of 60: they used to land 70 px either side, on both roofs, and a person waiting anywhere for the gap, including on the spawn roof, was burnt where he stood; the bot never waited). Route: cross each street the moment its rocket has gone up past the roofs (`rocketPast`), instead of hopping blind on the bot's phase; the lantern, the high roof and the finale rain are the shipped steps. | Rockets out of each street on their 1.8 s beats, deadly the whole flight; the lantern ride; the finale's sparks on the last roof (unchanged, still the stage's stated rain); the crush door. |
| PDY-03 Yellow Wall Jam | 78% / 31% (room stall "down and run", door spikes @67/71) | **100% / 100%** (18t 98%) | Route: the three room hops (scooter, awning, wall) are standing hops, jump first and lean right 3 ticks later with an "in the air" wait (`leap`), so a late press leaves from the same spot; the bot's chain of three running hops needed its exact phase (late, the first flew over the scooter and the next bumped the wall for ever). Door (`pdy-mirror`, in endings.ts): the first spike row moved from 7 to 8 tiles before the door so the landing between the rows is 3 tiles, not 2, and the door's `space` went 11 -> 12 so its checkpoint stays 4.5 tiles before the first row; the policy walks to 24 px before each row, stops, and takes a full standing jump with right (the bot hopped from a run 8 px before the row, and a late press left from on the row). | The rental scooter leaves after 40 ticks; straight on to the awning, up on the wall; the wall slides after you; hop the flower pot; the mirrored screen with right still right, and both spike rows to jump. |
| PDY-07 Serenity Surf | 99% / 69% | **99% / 69%, left as shipped** | Nothing kept. Three passes: (a) round 1, jump first and lean later on every board hop: from a standstill in the wind the hop fell short of the next board, 12t 63%, reverted. (b) a four-tick run-up before each hop so right is not pressed with the jump (the lag model lets a direction pressed with a jump go 12 ticks late, which carried a person off the board's far end: splash at tiles 6, 8, 12): 6t 90%, 12t 80%, still under; remaining deaths at the near end of board 2 (the wave shoves a braced dad back 12-18 px and a person who landed a little left of the bot went off) and the far end of board 5. (c) a tighter balance target ([b+19, b+22], then [b+16, b+19]) with the run-up: 65/68%, and the bot itself fell at the last board. The boards are 32 px, bob 10 px, the gust adds −160 px/s to a 140 px/s run: the live margin is about 12 px either side, and the lag model moves a person 14 px. Widening it needs wider boards or a gentler gust, i.e. changing what the room asks, which the ruling forbids; so the room stays as shipped. | Hop board to board while they bob; brace on the right half for the wave; the sea rises at the last board; the tower steps. |

PDY-02, 04, 05 from round 1 stay at 100/100; PDY-01, 06, 09, 10 at 100/100.

## 4. PDY-10 callbacks (the finale: room + kuzhi, thenga, aaru, alai + the night-leaf door)

| act | decision (one sentence) | home rule broken (law 7) | closest registry row, why different | A1 cause@tick (lag 0/6/12 replay s) | A2 cause@tick (lag 0/6/12) | cause id + line |
| --- | --- | --- | --- | --- | --- | --- |
| `pdy10-kuzhi` (new) | The water's colour under a leaf tells you nothing: the leaf's state does, so fold each leaf from its near end and cross on the bar. | PDY-02 Rock Beach: "clear is ankle deep, walk it; dark is deep, jump it". Here the clear pool's bottom is the mimosa's thorns under an open leaf, and the dark pool is deep under an open leaf that a jump lands on. | `PDY-02/room` (DECISIONS.md line 104) is the home row; no other row keys a read off water colour. Different from the room's own two leaves: the room teaches the fold; this act's lie is the colour, and both of Rock Beach's answers die. | walk through the clear pool: **pdy-mul** @719, 0.78 s (0.76 / 0.75 / 0.75) | jump the dark pool as at Rock Beach: **pdy-kuzhi** @1028, 3.35 s (3.33 / 3.51 / 3.66) | `pdy-kuzhi`: "The dark pool under the leaf was as deep as it looked, and the leaf did not hold." / "The water's colour tells you nothing here: fold the leaf from its near end over the path, and cross on the bar." |
| `pdy10-thenga` (round 1) | Your weight on the leaf shakes the coconut loose on to the spot you stood on: fold, step back left at once, then climb. | PDY-06: "hop under the palm, let the nut fall and roll away, then go" | `pdy06-palms`, line 117: there the hop is the trigger and waiting is the way; here standing where you triggered it is the death. | fold and stand there: **hit** @1462, 1.96 s (1.94 / 1.99 / 2.04) | hop under the palm first, wait, walk on: **pdy-mul** @1446, 1.82 s (1.81 / 1.89 / 1.94) | shared `hit` (the coconut) and `pdy-mul` |
| `pdy10-aaru` (round 1) | At the bell the spikes come toward you from the far end: fold the leaf, get up on the bar, let the front pass under, then go. | PDY-04: "at six, run, the spikes chase from behind" | `pdy04-closing`, line 111: running is the death here. | the bell: run: **pdy-mul** @1904, 1.23 s (1.22 / 1.21 / 1.22) | fold and wait on the path beside it: **spikes** @2208, 3.77 s (3.75 / 3.75 / 3.75) | shared `spikes` and `pdy-mul` |
| `pdy10-alai` (new) | Meet the big wave down on the path, where it only wets your feet: it folds every leaf, and you cross on the bars it leaves. | PDY-07 Serenity Surf: "waves come in threes; two push you back, the third is big: be on a rock for the third". Here the leaf is the "rock", and the big wave takes anyone up on one. | `PDY-07/room`, line 119, is the home row. Against the S9 class (don't stop on the sinking floor) and PAT-05 (float sinks under load): the wave is a clock, not a load, and the path is the still place. Against PNJ-02 (cycle you wait out): waiting out the wave on the path IS the answer here only because it leaves bars; a dad who waits for the leaves to open again (the cycle) crosses an open leaf and dies (`fold the first leaf, then wait for it to open again` in the room's plays). | up on a leaf for the big wave, like a rock: **pdy-alai** @2972, 4.50 s (4.47 / 4.47 / 4.48) | run for it across the open leaf before the big one: **pdy-mul** @2585, 1.24 s (1.26 / 1.32 / 1.36) | `pdy-alai`: "The big wave came over the leaves and took you with it." / "Meet the big wave down on the path, where it only wets your feet; it leaves every leaf a bar, so cross on those." |
| door `pdy-night-leaf` (round 1) | Cross in the dark, when the leaf is a bar; in the light it folds you into the pond. | PDY-04's `pdy-lamp` door inverted | — | cross in the light as Tara says: splash @3927, 4.41 s (4.28 / 3.42 / 2.83) | — | shared `splash` |

Momentum beats: none labelled; no act repeats another's read (kuzhi = a lie about colour, thenga = retreat after the trigger, aaru = up while the front passes, alai = the path for the wave then the bars). Hidden croissant over the second pit of the room, unchanged. Tara lies in kuzhi ("It's clear, Dad! Just walk through!") and at the door; the guide is honest in every act.

Engine notes: the wave is a 6.0 s set from the moment Dad enters the act (two small waves, then the big one at 4.3 s); at the big wave every leaf becomes a bar with its count (4.0 s) restarted, and anyone standing on a leaf or in the air over a pit at leaf height dies `pdy-alai`; flags `pdy10-alai:alai` (small/big/passed) and `pdy10-alai:until`. The dark pool of kuzhi is 7 tiles like the room's first pit (a hop on to its leaf and a run still fold it over the water).

## 5. Proofs (head 250d33d unless stated)

| check | result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npx vitest run` (full, 09:48 UTC at a447087 + the refrozen json) | **18 files passed, 1819 tests passed, 0 failed**, 24 env-gated skipped (the frozen test green on the refrozen `pdy.json`) |
| `tests/modules.test.ts -t PDY` with the `PDY: OLD,` line deleted locally | 11 passed (ten stages, NAIVE x10, FIX for 7, item in every stage, route for every act, policy for every ending, fair list, 10 intros, prefixed keys); file restored with `git checkout` |
| `tests/cpsafe.test.ts -t PDY`, same local deletion | **10 passed strict** (idle, run and tap-jump at lag 0/6/12 on every checkpoint of all ten stages); PDY-03 failed once at space 11 (3 unsafe plays: the moved row sat 3.5 tiles past the door checkpoint) and passes at space 12; file restored |
| `tests/allocation.test.ts` | in the full suite, green (meta of 09/10 unchanged) |
| `LDD_N=80 npm run fair -- PDY` (09:52 UTC) | 01 100/100, 02 100/100, 03 100/100 (18t 98), 04 100/100, 05 100/100 (18t 84), 06 100/100 (18t 89), **07 99/69**, 08 100/100, 09 100/100, 10 100/100; every stretch 100% except PDY-07 s0 69% |
| lag-captured sweep (qa6: lag 0/6/11/12 x idle 0/37/120/251, 7 plays per capture) over all ten | **0 unsafe captures in 4032 plays**; worst replay per tick 7.20 s (PDY-09 pointe A1); longest stretch 14.2 s (PDY-06); 8 "route did not win" lines, all PDY-07 at lag 11/12 (its fairness failure) |
| per-tick replay, PDY-09 | naive 1.15/1.20/1.25; fix 3.56/3.61/3.66; pointe A1 7.20; pointe A2 5.54/5.53/1.66; doublette A1 6.86, A2 1.35, A3 6.87; tir A1 6.83, A2 5.20/5.19/1.66; mene A1 6.83, A2 5.22/5.22/1.66, A3 5.73/5.73/1.66; door 1.13 and 2.59 |
| per-tick replay, PDY-10 | naive 0.56/0.61/0.66; fix 5.44/5.67/5.88; kuzhi A1 0.76, A2 3.33/3.51/3.66; thenga A1 1.94/1.99/2.04, A2 1.81/1.89/1.94; aaru A1 1.22, A2 3.75; alai A1 4.47, A2 1.26/1.32/1.36; door 4.28/3.42/2.83 |
| probe tables (`tests/pdyqa/probe.test.ts`, now env-gated `LDD_PDYPROBE=1`, scratch) | same-tick scan: no two plays of one act on the same tick; identical-window scan over act ids: none; two same-cause-near flags (room FIX vs "first stone", doublette A1 vs A3), both intended |
| `npm run build:single` / `node scripts/flows.mjs` | built in 871 ms / "no errors" |
| refreeze `bash scripts/dev/refreeze.sh PDY` (twice: after the acts, after the door space) | diff explained in section 6 |
| shots (routes re-recorded with `LDD_ENDREC=1 LDD_ID=PDY-03,PDY-08,PDY-09,PDY-10` before shooting; /tmp/rec is shared) | `shots/route/PDY-03-sheet.png`, `PDY-08-sheet.png`, `PDY-09-sheet.png`, `PDY-10-sheet.png` in the worktree; read: PDY-10 shows the two pools (clear light blue over thorns, dark), the tank with the wave band over the leaves at 25 s and "Periya alai!", the lamp door; PDY-09 the four pitches and the heap |

## 6. Refreeze diff (round 1's pdy.json -> head), every number

- PDY-03 route 1006 -> 1020 (+14 ticks): the mirror door section is one tile longer (space 12). FIX 708 -> 702 (−6): the shared FIX is spliced from the route at 'jump the street that says walk', and the standing hops reach the act 6 ticks earlier.
- PDY-08 route 1843 -> 2119 (+276 ticks = 2.3 s): the route waits for each street's rocket to go up before crossing.
- PDY-09 par 75 -> 70; checkpoints 11 -> 9 (the carreau act's start and end, 160.5 and 191/191.5, gone; the door's is now 159.5); route 7589 -> 6252 (one act and one volley fewer).
- PDY-10 par 60 -> 75; checkpoints 5 -> 9 (kuzhi 59/60.5, thenga 81/82.5, aaru 107/108.5, alai 137/137.5 — act start and end each); route 2316 -> 3756.
- PDY-01, 02, 04, 05, 06, 07 unchanged.

## 7. Honest route times (bot, lag 0) and the diff

| stage | route (ticks = s) | NAIVE / FIX death tick | floor / note |
| --- | --- | --- | --- |
| PDY-01 | 1956 = 16.3 s | 1871 (splash, the square) / 1108 (hit, the policeman) | tour |
| PDY-02 | 1500 = 12.5 s | 139 / 900 | shipped room + act |
| PDY-03 | 1020 = 8.5 s | 618 / 702 | |
| PDY-04 | 975 = 8.1 s | 167 / — | |
| PDY-05 | 2205 = 18.4 s | 215 / 1543 | |
| PDY-06 | 1914 = 16.0 s | 69 / 1445 | as shipped |
| PDY-07 | 2353 = 19.6 s | 141 / — | as shipped |
| PDY-08 | 2119 = 17.7 s | 109 / — | |
| PDY-09 | 6252 = **52.1 s** | 138 / 427 | floor 60: under |
| PDY-10 | 3756 = **31.3 s** | 67 / 653 | floor 90: under |

Diff of round 2 (589e9d0..250d33d, PDY's own files): `src/game/cities/pdy/causes.ts` (+pdy-alai, +pdy-kuzhi; the pdy-mul beat line names the near end), `encores.ts` (carreau removed, doublette re-laid, `second.speed`, `throws`/`thrown` flags, `plain` option, `alai` and `kuzhi` acts, pitFloor takes pdy-kuzhi), `endings.ts` (pdy-mirror rows [8, 3], space 12), `levels.ts` (acts lists, pars 70/75, PDY-08 spark spread 12), `tests/cities/pdy.ts` (`leap`/`hopLean` with the airborne wait, PDY-02 hops via `leap`, PDY-08 `quatorze`, PDY-03 `yellowWall` + `pdy-mirror` policy, doublette `judgeAfterBoth`, kuzhi/alai routes and plays, carreau entries gone), `tests/cities/_frozen/pdy.json` (section 6). Untracked scratch: `tests/pdydbg.test.ts`, `tests/pdylag.test.ts`, `tests/pdyqa/` (qa6 copy and the env-gated probe), not committed. No shared file changed; `tests/modules.test.ts` was edited only locally for the two guard runs and restored.

## 8. Where QA should press

1. PDY-07 as shipped: 69% at 12t is the city's one known human-timing failure; it needs either a board 8 px wider or a gentler gust, both changes to what the room asks.
2. PDY-09 at 52 s and PDY-10 at 31 s, both under their floors.
3. The doublette's 2.1 s window after the second boule passes (one stone left, 64 px); fairness held at 100% at 6/12/18t but a hand player should try it.
4. The wave act's kill rule includes "in the air over a pit at leaf height" when the big wave hits; a player who hops between the two bars exactly at 4.3 s dies pdy-alai on purpose.
5. The mirror door's standing jump: 24 px before each row, full hold; the lagged model walks a person 14 px during the wait, and the gap is now 48 px.
