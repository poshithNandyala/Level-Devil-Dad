# KOH · Kohima (Nagaland): build report, round 1

**Branch** `city/koh` in `/local/home/saiposh/personal/ldd-wt/koh`, cut from `origin/develop` f8288e9 (v0.17.2), tip **`9fbad48`** (code at 7b73339; 9fbad48 adds the docs).
Nothing pushed, no version bump. `git diff --name-only f8288e9` shows only `src/game/cities/koh/`, `tests/cities/koh.ts`, `docs/cities/KOH.md`, the KOH row in `docs/CITIES.md` and a KOH section in `docs/MECHANICS.md`. The scratch probes (`tests/cities/koh/qa6.test.ts`, `stats.test.ts`) are untracked and not committed.
All ten stages are built to allocation v2 (slot order, `meta.family` / `meta.betrayals` exactly as `docs/allocation.json` KOH, `meta.ending` = the door's `koh-` key). No reserve was used.

## Honest section first

**Route time per stage against the goal's floors** (the scripted route's clear time; par is set by hand):

| Stage | Floor | Route clear | Met? | Why short |
| --- | --- | --- | --- | --- |
| KOH-01 tour | ~15 s | 12.5 s | yes (tour) | |
| KOH-02 | 25-45 s | 15.3 s | **no** | room + one act only (round 1 built 01-05 before the restart with no length pass) |
| KOH-03 | 25-45 s | 9.8 s | **no** | room + one act |
| KOH-04 | 25-45 s | 22.7 s | **no** (2 s short) | room + one act |
| KOH-05 | >= 60 s | 20.6 s | **no** | room + two acts |
| KOH-06 | >= 60 s | 15.1 s | **no** | room + two acts |
| KOH-07 marathon | >= 120 s | **123.3 s** | yes | nineteen rides |
| KOH-08 HWIK | >= 60 s | 17.4 s | **no** | room + two acts (PAT-08 shipped at 9.9 s as the HWIK precedent, but the bar says 60) |
| KOH-09 tough | >= 60 s | 22.3 s | **no** | room + two acts |
| KOH-10 finale | >= 90 s | 22.5 s | **no** | room + two acts, three callbacks of the five asked |

**Acts per long stage against "at least 5 two-play acts"**: 02, 03, 04 have one act; 05, 06, 08, 09, 10 have two; 07 has nineteen. Every act that exists has a NAIVE play and a FIX play that die to different causes at different ticks (the act table below); the count is what is short, not the plays. The next round's job is a length pass (three more acts on 05/06/08/09, four on 10, one or two on 02-04), in the shape the PAT LENGTH pass took.

**Not built, with the reason:**
- The finale's callbacks to the rope bridge (02), the seesaw (03) and the axone pot (08): budget. Built callbacks: the tour's rod (01, inverted: lashed, the only bridge), the roofs (06, inverted: the house is empty, tin is the floor, thatch is rotten), the cart (07, inverted: the lane climbs, boarding rolls you back; walk), the log (05, inverted: the first thing it touches is a raft that sinks; stay aboard), the door (09 inverted: stand still before the morung gate).
- The marathon's three beats: momentum beat = every ride (the cart only gets quicker; `koh07-dhalan`, `-dhalan-dui`, `-tez-dui` are the labelled ones), sound beat = the three `kohra` mist rides (obstacles faint, each one passed sounds the next: splash = hole, creak = beam, slide = wet patch), shelter beat = `koh07-chhaon` (a long shed whose rafters are a row of beams: stay at the front under it, back only for the hole where it ends). All three exist.
- Not checked: a real phone (touch feel); only the headless build, the route bots, the fairness model and the sheets.

**What the restart cost**: Kiro Crew restarted at ~07:25 UTC with 01-05 written but uncommitted and the `koh-dhol` probe in flight; the probe was rerun (it found Dad carried up as a rider on the log's front edge, outside the hazard inset) and fixed with a ground-level strip that leads the log plus a 0.9 s gap before a double's second shout. The conductor extended the budget by the lost minutes.

## Proof

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npm test` (full suite, once, at 7b73339) | **18 files passed, 1824 tests passed, 0 failed** (14 files env-gated and skipped by design) |
| KOH's own share (`-t 'KOH-'` over levels, checkpoints, cpsafe, items, jumpaudit; modules and allocation guards with `-t KOH`) | all green: per stage builds, route wins, deterministic, every rival variant, NAIVE dies, FIX dies, every MISTAKE dies to its named cause, checkpoints replay exactly, one hidden item per stage, jump audit, module guard (10 stages, NAIVE for 10, FIX for 10, intro lines x9, no TODO, `koh-` prefix on every key), allocation test (meta matches the slot, endings unique and no shipped ending renamed: `koh-back-door` was caught as the shipped `backdoor` and renamed `koh-pichla-dwar`) |
| KOH on an allow-list / CPSAFE3_PENDING | no |
| cpsafe (idle 4 s, run 0.3 s and tap-jump at lag 0/6/12 from every checkpoint) | green for all ten stages |
| Fairness `LDD_N=80 npm run fair -- KOH` | **100% at 6t and 12t for all ten stages, every stretch 100%** (block below) |
| Lag-captured sweep (`qa6` method, lag 0/6/11/12 x spawn idle 0/37/120/251, 7 plays per capture) | **0 deaths in 5,376 plays**, every lagged route wins, worst replay 6.88 s (table below) |
| `npm run build:single && node scripts/flows.mjs` | builds; flows: **no errors** (CHROME_PATH = the shared Playwright `chromium_headless_shell-1228`) |
| Sheets | `/local/home/saiposh/personal/ldd-inbox/reports/cities/koh/shots/KOH-01-sheet.png` .. `KOH-10-sheet.png` (nine frames along each route); read 07 (cart, beams on posts, mist, bale, exit at 122 s) and 08 (the pot's green waft over Dad, dog, crows on the wire, cat, door) at sheet scale; every route reaches the exit (the sheets are shot from the recorded winning route) |

### Fairness (`LDD_N=80 npm run fair -- KOH`, human-timing model; bar: 90% stage at average lag, 95% each stretch)

```
KOH-01: 6t 100%  12t 100%  18t 80%    stretches at 12t: s0..s5 100%  door 100%
KOH-02: 6t 100%  12t 100%  18t 100%   stretches at 12t: s0 s1 100%  door 100%
KOH-03: 6t 100%  12t 100%  18t 100%   stretches at 12t: s0 s1 100%  door 100%
KOH-04: 6t 100%  12t 100%  18t 100%   stretches at 12t: s0 s1 100%  door 100%
KOH-05: 6t 100%  12t 100%  18t 76%    stretches at 12t: s0..s3 100%  door 100%
KOH-06: 6t 100%  12t 100%  18t 100%   stretches at 12t: s0 s1 s2 100%  door 100%
KOH-07: 6t 100%  12t 100%  18t 100%   stretches at 12t: s0..s18 100%  door 100%
KOH-08: 6t 100%  12t 100%  18t 100%   stretches at 12t: s0..s3 100%  door 100%
KOH-09: 6t 100%  12t 100%  18t 93%    stretches at 12t: s0 s1 s2 100%  door 100%
KOH-10: 6t 100%  12t 100%  18t 100%   stretches at 12t: s0 s1 s2 100%  door 100%
```

The first fair run (before the lag pass) read 01 50%, 03 54%, 05 6%, 06 13%, 09 40%, 10 15% at 12t. Fixed by giving the routes and the geometry lag slack, never by weakening a troll: the roof climbs are one full jump from the ground instead of a step block (a late jump bumped the block), the seesaw's full-throw window widened from 0.9 to 1.6 tiles and the act's plank lengthened to 3 half-tiles, the drum door is a long hop from further back, take-offs moved 0.5-1 tile earlier, the room's tin roofs narrowed to 2.5 tiles with the eave at 80 px so the hop can be longer, the log's hold at the top lengthened to 0.6 s with the stance nearer the front.

## Stages

Clear time = the scripted route's clear time (with its waits). Checkpoints = hidden columns the route passes.

| Id | Name | Slot | Family / betrayal | Shape | Clear | Par | Checkpoints (cols) | NAIVE death | FIX death | Hidden item | Door ending |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| KOH-01 | Bhal ase, Kohima | KOH-T | rolling-handrail-rod / grab-rolls | tour | 12.5 s | 30 | 20, 36, 50, 58, 75, 101 | `koh-rod` @1506 (stood on the rod over the drain) | - (tour) | galho | none |
| KOH-02 | Rassi Tan | KOH-05 | tug-rope-bridge-drifts / team-drift | long | 15.3 s | 48 | 32.5, 65.5 | `koh-khai` @194 (ran off the mat's end) | `koh-dubki` @211 (stood on the near end) | axone | `koh-manch` (the winners' stand comes down) |
| KOH-03 | Bans Jhula | KOH-07 | helper-launched-by-your-jump / helper-launched | long | 9.8 s | 46 | 32.5, 61.5 | `koh-kanta` @216 (ran into the thorn gate) | `koh-patak` @260 (short throw, the plank kicks) | bamboo shoot | `koh-dhila-patta` (loose plank) |
| KOH-04 | Dzükou | KOH-06 | bloom-wave-platforms-cold-slows / bloom-wave | long | 22.7 s | 55 | 32.5, 68.5 | `koh-daldal` @148 (a closed lily) | `koh-thand` @304 (waded the stream) | lily | `koh-rim-lily` |
| KOH-05 | Dhol Gach | KOH-02 | crew-beat-log-platform / crew-surge | long, lives act | 20.6 s | 80 | 32.5, 62.5, 77, 95.5 | `koh-nala` @573 (ran off the log's front) | `koh-shahtir` @814 (stayed aboard: the lintel) | drum | `koh-rocking-drum` |
| KOH-06 | Chaal-Chaal | KOH-03 | sloped-noisy-tin-roofs / noisy-floor | long, lives act | 15.1 s | 80 | 32.5, 65.5, 95.5 | `koh-khatkhat` @147 (walked the tin) | `koh-garam` @208 (walked into the chimney's puff) | shawl | `koh-skylight` (glass holds a walker, breaks under a landing) |
| KOH-07 | Kath ka Gari | KOH-01 | downhill-cart-lean-steer / cart-steer | marathon, lives act | **123.3 s** | 170 | 19 landings (32.5 .. 1051.5) | `koh-dhalan` @134 (walked the scree) | `koh-gaddha` @249 (rode at the front into a hole) | bamboo shoot | `koh-garage-nose` (door opens to a nose-first bump) |
| KOH-08 | Axone Handi | KOH-04 | carried-scent-repels / scent-selective | wtf (HWIK), lives act | 17.4 s | 60 | 32.5, 58, 76.5, 115.5 | `koh-kukur` @118 (lidded pot, the dog) | `koh-billi` @307 (open pot, the cat) | axone | `koh-kitchen-door` (opens for the smell) |
| KOH-09 | Kisama Din | KOH-11 | five-houses-opposite-rules / rule-flip-per-room | long (tough), lives act | 22.3 s | 70 | 32.5, 62.5, 85.5 | `koh-aag` @194 (walked into the hearth) | `koh-takhta` @119 (hopped into the drum house) | smoked pork | `koh-pichla-dwar` (the front door is painted on; the back door is real) |
| KOH-10 | Subah Kisama | KOH-12 | finale-run-to-hornbill-ground / hornbill-ground-run | long (finale), lives act | 22.5 s | 70 | 32.5, 62.5, 93.5 | `koh-sadi` @298 (crossed on the thatch, 06's rule) | `koh-chhajja` @306 (a big jump over the thatch) | galho | `koh-morung-gate` (opens for a man who stands still) |

Acts (all unique, prefixed `kohNN-`): `koh02-teen`, `koh03-ulta`, `koh04-kali`, `koh05-dui`, `koh05-chadhai`, `koh06-dhuan`, `koh06-upar`, `koh07-mod`, `koh07-tez`, `koh07-chikna`, `koh07-kohra`, `koh07-dhalan`, `koh07-dui-chikna`, `koh07-bazaar`, `koh07-kohra-dui`, `koh07-chhaon`, `koh07-khonoma`, `koh07-jotsoma`, `koh07-tez-dui`, `koh07-kohra-teen`, `koh07-bazaar-dui`, `koh07-dhalan-dui`, `koh07-mod-teen`, `koh07-chikna-teen`, `koh07-aakhri`, `koh08-galli`, `koh08-taar`, `koh09-teen`, `koh09-paanch`, `koh10-ulta-gari`, `koh10-bera`. Nine door endings, none a shipped ending renamed (the allocation test checks it; `backdoor` was the one collision and was renamed).

## Pre-build gate and the act table: decision, closest row, why different, the two plays

The registry read: `DECISIONS.md` lists 1-2 and section 5 (I9 "act on an announced cue" kept for DIS-02; the sound cluster at line 1085: BBI-07 quiet-means-clear, GTK-07 walk-to-sound, DIS-07 shout-steers-hazard, LKO-07 sound-names-the-side, SVP-08 drumming-roof-names-the-rain-side, CCU-07 horn-shifts-the-carrier, "each asks a different thing of the sound"), the rows the seed named (PNJ-05/DMN-05 team contest, `salaami`/cannon, BOM-06 chawl wall kicks and wet paint, SXR 09 brake-only, JAI-05 bangle roll, TVM-02 bus roof, RPR-06 cocoon, DEL 09 carried wet state, PNJ-06 roulette floors, PAT-07 tempo lean), and grep passes for lean/steer/cart, scent/lid/cat/crow, loud/noise/quiet/hatch, opposite/invert. Slots 01-05 were gated in the first half of the round (before the restart) with the same method; their rows are repeated here from the code.

Seconds = time from the act's checkpoint to the act's end on the route (the room row counts from spawn). NAIVE/FIX ticks are world ticks from spawn (the stats probe), causes as the tests assert them.

| Stage / act | Family | One-sentence decision | Closest registry row: why different | NAIVE cause@tick | FIX cause@tick | s |
| --- | --- | --- | --- | --- | --- | --- |
| 01 room (tour) | rolling-handrail-rod | The rod laid over the drain is round: grab it and it rolls you back and drops; jump the drain, the rod is for hands. | `treadmills` (a belt moves you): here the rail itself is the mover and the betrayal is that a bridge-looking thing is a roller. | `koh-rod` @1506 | - | 12.5 |
| 02 room | tug-rope-bridge-drifts | The mat over the ditch drifts towards the winning team in heaves: stand just behind the flag and step over only when the mat lies on the far bank. | PNJ-05 (rope bounces you) and DMN-05 (you mash to haul): here you do not pull; you read which side is winning from the rope and the mat's drift. | `koh-khai` @194 | `koh-dubki` @211 | 7 |
| `koh02-teen` | tug-rope-bridge-drifts | Three teams: the stronger side swaps when you pass the middle, so the end you stood behind becomes the end that dips. | DMN-05: the swap at the middle is read from the rope, not pulled. | `koh-khai` @835 | `koh-dubki` @801 | 8 |
| 03 room | helper-launched-by-your-jump | Kewhi, not you, must fly: land on the very tip of the near end and your landing throws him to the ledge; land nearer the post and the short throw brings him down on the plank. | `salaami` and the cannon launch Dad; here your jump launches the helper and you wait below for the gate. | `koh-kanta` @216 | `koh-patak` @260 | 4 |
| `koh03-ulta` | helper-launched-by-your-jump | Kewhi on the wrong (near) end, the far end propped on a stone: the throw needs a running jump on to the far tip, and the near half sinks under anyone who lands beside him. | same family; the decision is which end to land on and how far to run for it. | `koh-khad` @711 | `koh-patak` @731 | 6 |
| 04 room | bloom-wave-platforms-cold-slows | Only an open lily is a stand: chase the wave's head on the near side; past the icy stream (half speed, a second kills) the wave comes the other way, so wait on the stone for the pad next to you. | DMN-03 (melting ice) and `blinkers`: here the pattern is a travelling wave that reverses, and the cold slows you rather than killing at once. | `koh-daldal` @148 | `koh-thand` @304 | 10 |
| `koh04-kali` | bloom-wave-platforms-cold-slows | Every third lily is a bud that never opens: jump it from the open pad before to the one after, inside the wave. | same family; the decision adds "which stand is never a stand". | `koh-daldal` @373 | `koh-daldal` @1011 (room-side mistake; the act's own second play is the stream wade, `koh-thand`) | 12 |
| 05 room | crew-beat-log-platform | The crew hauls the log in surges and it rolls back between; step off at the TOP of the surge that first touches the bank; whoever stays aboard is hauled under the lintel. | DMN-05/JAI-02 (a beat others set): the decision is WHERE the log is after the surge, not acting on a cue; DIS-02's I9 (act on an announced cue) is not asked: the shout is flavour, the log's position is the rule. | `koh-nala` @573 | `koh-shahtir` @814 | 5 |
| `koh05-dui` | crew-beat-log-platform | Two logs, two crews: a shout moves only the log on its rope; step across at the top of YOUR log's surge; the white crew's double shout brings the log up the bank where you stepped off, so keep going. | the decision is whose rope moves what, and where the log lands after a double. | `koh-nala` @1004 | `koh-dhol` @1097 | 9 |
| `koh05-chadhai` | crew-beat-log-platform | A quick crew then a slow one, each rolling back further: watch the log's top, not the count of shouts. | same family; tempo and roll-back change, the read (the top) stays. | `koh-nala` @1266 | `koh-shahtir` @2406 | 7 |
| 06 room | sloped-noisy-tin-roofs | Your own step is the sound: thatch is silent, tin rings and the household bangs the attic hatch open under you a moment later; cross thatch to thatch and hop the tin (not high: the eave), walk the chimney between puffs. | BOM-06 owns "sloped roofs slide you" (no slide here); the sound cluster (BBI-07 quiet-means-clear etc.) reads sounds others make: here the player MAKES the sound and chooses the floor that does not answer. | `koh-khatkhat` @147 | `koh-garam` @208 | 7 |
| `koh06-dhuan` | sloped-noisy-tin-roofs | Thatch chimneys puff warm air that lifts you into the tin eave above: the smoke shows the puff, walk through between puffs, never jump near one. | RNC-04's thunder lifts are stairs; here the lift is the trap and the eave the killer. | `koh-garam` @605 | `koh-khatkhat` @852 (second play: hop the tin right, walk into the second chimney) | 6 |
| `koh06-upar` | sloped-noisy-tin-roofs | The top roof is reached only on a chimney's lift, which sets you down on tin: tin is a stepping stone, be off it before the bang (the inverse of the room's rule). | the room says never tin; this says tin for half a second. | `koh-gira` @1230 | `koh-khatkhat` @1371 | 7 |
| 07 room | downhill-cart-lean-steer | The lane is scree (walking kills) and the cart has no brake: where you stand on the plank is the steering, back lifts the nose over a hole, front drops it under a beam. | PAT-07 cancels OTHER riders' weight; JAI-05 is a roll with a brake; SXR 09 is brake-only; TVM-02 slides you by bells: here your own weight is the only lean and there is no brake. | `koh-dhalan` @134 | `koh-gaddha` @249 | 7 |
| `koh07-mod` .. `koh07-aakhri` (19 rides) | downhill-cart-lean-steer | Each ride: read the obstacle ahead and take the stance early because the cart only gets quicker; a wet patch mirrors the lean for a second (`chikna`, `dui-chikna`, `jotsoma`, `bazaar-dui`, `chikna-teen`, `aakhri`); mist hides the lane and sound names the next (`kohra` x3); a shed is a row of beams, stay front (`chhaon`). | same family, one rule, nineteen sequences (PAT-07's pattern). | front: `koh-gaddha` @649 (mod) .. @14107 (aakhri) | back: `koh-balli` @785 (mod) .. @14026 (aakhri); third play: hop the cart, walk: `koh-dhalan` | 5.5-7.4 each |
| 08 room (HWIK) | carried-scent-repels | A jump knocks the lid off the axone pot and the scent pours out; standing still half a second lids it; the dog and the crows keep off an open pot and go for a lidded one; the cat loves it: open for the dog and crows, lidded for the cat. | RPR-06's cocoon is a STATE you enter by standing still that one animal wants and one cannot pierce; DEL 09 carries a wet state; here the carried thing has a lid you toggle by moving, and WHO is ahead decides the lid. | `koh-kukur` @118 | `koh-billi` @307 | 8 |
| `koh08-galli` | carried-scent-repels | Dog, cat, dog: off, on, off, with room to stand still before the wall. | same family; the decision is the order of toggles. | `koh-billi` @732 | `koh-kukur` @1022 | 5 |
| `koh08-taar` | carried-scent-repels | The crows' wire runs over the cat's wall so the pot must stay lidded: beat each crow by standing still (it dives at where a walker will be) and keep the lid on past the cat. | neither animal can be answered by scent here; the decision is pace, with the lid as the constraint. | `koh-billi` @1430 | `koh-kag` @1417 | 6 |
| 09 room (tough) | five-houses-opposite-rules | House 1 is a drum floor (a landing booms, a roof plank drops where you land: walk, never jump); house 2 is a hearth across the floor (jump it): the second rule is the opposite of the first. | PNJ-06 is one roulette floor whose colour changes; here five houses each INVERT the previous rule, and the inversion is the decision. | `koh-aag` @194 | `koh-takhta` @119 | 7 |
| `koh09-teen` | five-houses-opposite-rules | House 3's gate counts from your first step (keep moving); house 4's plank tips under a steady walk (stop and go): the opposite again. | LKO-07 pace-sets-crowd-shape reads one pace rule for a crowd; here two houses demand opposite paces back to back. | `koh-jhukav` @722 | `koh-phatak` @707 | 7 |
| `koh09-paanch` | five-houses-opposite-rules | House 5 is a drum floor right up to a hearth: both rules in one long jump from the drum's last plank over the coals, landing on neither. | the fifth house asks both inversions at once. | `koh-aag` @2355 | `koh-takhta` @2314 | 5 |
| 10 room (finale) | finale-run-to-hornbill-ground | The tour's rod is lashed and is the only bridge (walk it); the house is empty for the festival (dark windows): tin is the floor, the inner thatch is rotten (06's rule broken). | law 7: callbacks that break the taught rule. | `koh-sadi` @298 | `koh-chhajja` @306 | 8 |
| `koh10-ulta-gari` | finale-run-to-hornbill-ground | This lane climbs: a boarded cart rolls back into the wall (07's "ride, never walk" broken); the lane is paved, walk it. | 07 inverted. | `koh-takkar` @678 | - (one trap: a second natural wrong play was not found in the budget) | 6 |
| `koh10-bera` | finale-run-to-hornbill-ground | The log's first touch is a raft that sinks under a man: stay aboard to the bank, there is no lintel (05's rule broken). | 05 inverted. | `koh-nala` @983 (step off at the first touch) | `koh-nala` @983 (run across the raft: same cause, same tick: **not a second trap**, noted) | 8 |

## Probe tables

### Identical-window scan (the same trap window twice in one stage past the first momentum beat)

| Stage | Repeated windows | Verdict |
| --- | --- | --- |
| 02 | the long mat in `koh02-teen` repeats the room's drift; the swap at the middle is the new bite | one labelled momentum beat (the drift) then the swap: ok |
| 03 | two seesaws, opposite ends, different throws (standing hop vs running jump) | no identical window |
| 04 | two meadows; the second adds buds and a longer far half | the wave is the labelled beat; the bud jump is new |
| 05 | three fords; dui adds the double shout, chadhai changes tempo and roll-back | the surge/roll is the labelled beat; no identical window (the slow crew's lintel repeats the room's lintel: flagged as the one repeat, different tempo) |
| 06 | two tin hops in the room (same window, 2.5 tiles each) | **one identical window** (the second tin), kept as the stage's momentum beat; the chimneys and the lift are new |
| 07 | nineteen rides on one rule | by design (the marathon's momentum): every ride differs in sequence, speed, mist, wet patches or the shed; **the holes and beams themselves are identical windows** and are the labelled momentum beat |
| 08 | dog x2 in `galli` | the second dog comes after the cat: the toggle back is the new decision |
| 09 | drum + hearth in the room and again in `paanch` | `paanch` fuses them into one jump: not the same window |
| 10 | tin x2 in the room | the second tin is the same hop: one identical window (momentum) |

### Same-tick FIX scan (per act: does the FIX die to a different cause at a different tick than the NAIVE?)

| Act | NAIVE | FIX | Same cause? | Same tick? |
| --- | --- | --- | --- | --- |
| 02 room | khai @194 | dubki @211 | no | no |
| koh02-teen | khai @835 | dubki @801 | no | no |
| 03 room | kanta @216 | patak @260 | no | no |
| koh03-ulta | khad @711 | patak @731 | no | no |
| 04 room | daldal @148 | thand @304 | no | no |
| koh04-kali | daldal @1011 | (thand is the room's FIX; the act has one own death) | **act has one cause** | - |
| 05 room | nala @573 | shahtir @814 | no | no |
| koh05-dui | nala @1004 | dhol @1097 | no | no |
| koh05-chadhai | nala @1266 | shahtir @2406 | no | no |
| 06 room | khatkhat @147 | garam @208 | no | no |
| koh06-dhuan | garam @605 | khatkhat @852 | no | no |
| koh06-upar | gira @1230 | khatkhat @1371 | no | no |
| 07 room | dhalan @134 | gaddha @249 | no | no |
| koh07-* (19) | gaddha (front) | balli (back) | no, all 19 | no, all 19 (closest pair: tez-dui 9334 vs 9404) |
| 08 room | kukur @118 | billi @307 | no | no |
| koh08-galli | billi @732 | kukur @1022 | no | no |
| koh08-taar | billi @1430 | kag @1417 | no | no |
| 09 room | aag @194 | takhta @119 | no | no |
| koh09-teen | jhukav @722 | phatak @707 | no | no |
| koh09-paanch | aag @2355 | takhta @2314 | no | no |
| 10 room | sadi @298 | chhajja @306 | no | no (8 ticks apart, different traps) |
| koh10-ulta-gari | takkar @678 | - | **one play** | - |
| koh10-bera | nala @983 | nala @983 | **yes** | **yes** |

Three acts fail this scan (`koh04-kali`, `koh10-ulta-gari`, `koh10-bera`) and are listed for the next round.

### Lag-captured sweep (the tester's method: route at lag 0/6/11/12 x spawn idle 0/37/120/251; checkpoint taken where the lagged run takes it; idle 4 s, run 0.3 s after 0/6/12, tap-jump after 0/6/12)

| Stage | Distinct capture points | Plays checked | Deaths | Lagged routes that did not win | Longest stretch | Worst replay to a death (lag 0 / 6 / 12, per tick) |
| --- | --- | --- | --- | --- | --- | --- |
| KOH-01 | 6 | 672 | 0 | 0 of 16 | 4.1 s | 6.22 / 6.22 / 6.22 s |
| KOH-02 | 2 | 224 | 0 | 0 | 7.7 s | 1.76 / 1.81 / 1.86 s |
| KOH-03 | 2 | 224 | 0 | 0 | 6.4 s | 2.17 / 2.27 / 2.38 s |
| KOH-04 | 2 | 224 | 0 | 0 | 12.9 s | 3.11 / 3.16 / 3.21 s |
| KOH-05 | 4 | 448 | 0 | 0 | 6.7 s | 6.88 s worst (m4, the slow crew's lintel) |
| KOH-06 | 3 | 336 | 0 | 0 | 6.3 s | 3.67 s worst |
| KOH-07 | 19 | 2128 | 0 | 0 | 7.4 s | 4.39 / 4.39 / 4.39 s (m25) |
| KOH-08 | 4 | 448 | 0 | 0 | 6.7 s | 2.56 / 1.03 / 1.08 s |
| KOH-09 | 3 | 336 | 0 | 0 | 14.6 s | 2.44 / 2.44 / 1.72 s |
| KOH-10 | 3 | 336 | 0 | 0 | 14.3 s | 2.65 s worst |

**0 deaths in 5,376 plays; every lagged route wins; worst replay 6.88 s (KOH-05 "ride the slow crew's log all the way", lag 0), under 7.5 s.** Per-play rows: `/tmp/koh-qa6b.log`. The first sweep (before the lag pass, `/tmp/koh-qa6.log`) had 0 checkpoint deaths too but 60 lagged routes that did not win (01 stuck at the posts, 03 kanta, 05 shahtir, 06 and 10 gira at the step block, 09 aag): those are the fairness fixes above.

Longest stretches over 12.9 s (04, 09, 10 at 12.9-14.6 s) are inside the 25 s stretch bar; the replay-to-death bar (7.5 s) is what matters and is met everywhere.

### Per-tick replay (from the lagged run's own last checkpoint to each play's death; the full rows)

```
KOH-01 naive 6.22/6.22/6.22
KOH-02 naive 1.62/1.67/1.72  fix 1.76/1.81/1.86  m0 1.58/1.58/1.58  m1 1.30/1.30/1.30
KOH-03 naive 1.80/1.85/1.89  fix 2.17/2.27/2.38  m0 2.15/2.25/2.35  m1 1.88/1.93/1.98  m2 1.93/1.98/2.03
KOH-04 naive 1.23/1.28/1.33  fix 2.53/2.58/2.63  m0 3.11/3.16/3.21  m1 0.77/0.77/0.77
KOH-05 naive 1.65/1.65/1.65  fix ~6.0  m0 1.64/1.65/3.44  m1 ~3.9  m2 ~4.7  m3 0.97  m4 6.88 worst
KOH-06 worst 3.67 (seven plays, all under)
KOH-07 fifty-five plays, worst 4.39 (m25), most 1.1-3.3
KOH-08 naive 0.98/1.03/1.08  fix 2.56/1.03/1.08  m0 2.56/1.03/1.08  m1 1.96  m2 0.89  m3 2.17  m4 2.07/2.12/2.17
KOH-09 naive 1.62/1.67/1.72  fix 0.99/1.09/1.19  m0 2.44/2.44/1.72  m1 2.32/2.37/1.72  m2 1.42/1.42/1.72  m3 1.07/1.13/1.72
KOH-10 worst 2.65 (five plays, all under)
```
(The exact per-lag triples for 05, 06, 07 and 10 are in `/tmp/koh-qa6b.log`; the table keeps the worst.)

## HWIK (KOH-08 Axone Handi), TROLL-BIBLE section D

1. *The death teaches the rule in one look.* You die with a lidded pot to a dog that charged, and Tara's line says the pot's lid is what he reads; on the second attempt a hop before him and he backs away: the tell is drawn (he retreats, the crows lift off, the green waft stands over the pot).
2. *The second attempt is obvious.* Hop once, walk; the cat's run is the second lesson and its line says stand still before her wall.
3. *Never twice in a row, never two unknowns.* Only slot 08 is HWIK; 07 and 09 are plain; the only unknown is "who minds the smell".
4. *No pixel hunt.* The animals sit in the open lane; the lid is one hop or one pause.
5. *Natural to the city.* Axone's smell is Kohima's most famous fact (bible section 3).
6. *Fairness.* 100% at 6t and 12t; every death is one respawn at the act's start (replay worst 2.56 s).

## Art, sound, language

- Palette from the bible (cool grey-blue sky, dark pine ridges, red clay tiles, shawl red), the Kohima backdrop (stacked tin roofs on ridges, a tall pointed church on a hill, thatch gables, Japfü ridge), music 92 bpm pentatonic with a log-drum thud on beat 1, packed-earth ground caps with fern edges, a drawn hidden item per stage (galho, axone, bamboo shoot, chutney, shawl, basket, smoked pork, lily, drum, hornbill feather).
- No `Math.random`, no `Date`. Nothing from the avoid list: no WWII, no Kohima Stone, no boundary, no weapons, no costume, no dog-meat joke (the dog is a lane dog that charges, as the shared `chaser` skin already is), the festival houses are architecture only.

### Language lines used (bible section 4; V = verified, U = unverified, used in the bible's fallback form)

| Line | Mark |
| --- | --- |
| `Bhal ase, Dad? Welcome Kohima! \| Are you fine, Dad? Welcome to Kohima!` (hello) | V |
| `Kotha jabi, Dad? Moi loghat jabo. \| Where are you going, Dad? I'll go with you.` (intro 02) | V |
| `Toi jabi, moi dekhi. \| You go, I'll watch.` (intro 03, taunt) | U, V words only (toi, jabi, moi) |
| `Etu rasta bhal ase. \| This road is fine.` (intro 04, taunt, the lie) | V |
| `Dad, toi bhat khabi? \| Dad, will you eat?` (intro 05) | V |
| `Thik thak, Dad? Hill is steep. \| Fine, Dad? The hill is steep.` (intro 06) | V |
| `Nai, nai, jabi, jabi! \| No, no, go, go!` (intro 07, taunt) | V |
| `Galho khabi? Garom ase. \| Will you eat galho? It's hot.` (intro 08) | V (galho, khabi) |
| `Moi loghat ahi, bhal ase. \| Come with me, it's fine.` (intro 09) | U, fallback |
| `Last stage, Dad! \| Last stage, Dad!` (intro 10) | U, fallback (English) |
| `Ki! Toi jiti se? \| What! You won?` / `Hoi, hoi. Toi bhal. \| Yes, yes. You're good.` (beaten) | V, V |
| `Nai nai, bhal nai! \| No no, not good!` / `Bhal ase? Ahi bi, Dad. \| Fine? Come again, Dad.` / `Dad, ahi bi. \| Dad, come again.` (death) | V, V, U fallback |
| `Ektu, Dad! \| Just a bit, Dad!` / `Bhal, bhal, Dad! \| Good, good, Dad!` (near) | U (V word ektu), V |
| `Bhal ase, Dad! Toi jiti se! \| Good, Dad! You won!` / `Thik thak! Aage jabi. \| Great! Go ahead.` (win) | V, V |
| `Nai, etu rasta nai! \| No, not this road!` (flip, Tara's taunt in 07) | V |
| `Kohima cleared. Bhal ase, Dad! \| Kohima cleared. Good, Dad!` (cleared) | V |
| `Bhal, bhal! \| Good, good!` (brag) | V |
| `Dad, bohi bi. Bhat khabi. \| Dad, sit down. Eat.` / `Dad, rasta ase, jabi! \| Dad, the road is there, go!` (idle) | V, V |
| `Seven done, one to go! \| Seven done, one to go!` (seventh-death line) | U, fallback (English) |
| `Ek chance ase, Dad. \| One chance left, Dad.` (last life) | V |
| NPC: `Moi naam Kewhi. Toi? \| My name is Kewhi. And you?` (01, 07, 09) | V pattern |
| NPC: `Etu rasta bhal nai, jabi. \| This road isn't good, go.` (06, 08) | V |
| NPC: `Morning cold ase, Dad. \| It's cold in the morning, Dad.` (04, 06, 07 mist, 10) | V pattern |
| NPC: `Hoi, hoi, bhat ase. \| Yes, yes, there's rice.` (08) | V |
| NPC: `Moi loghat ahi bo. \| I'll come with you.` (03, 06, 09, 10) | V |
| NPC: `Thik thak, Dad? Bhal. \| Fine, Dad? Good.` (08, 09) | V |
| Crew shouts `HO!`, `HEI!`, `HOI!`, the tin's `TANG!`, the drum's `DHOOM!` | onomatopoeia, no language claim |

Tara's intro per stage is `lines.intro[n-2]`; she tells the truth nowhere in KOH except the taunt chosen for 05 and 07 (`Nai, nai, jabi, jabi!`, which is also what the crew wants).

## How to re-run

```
source /local/home/saiposh/personal/games/_template/scripts/env.sh      # Node 22
cd /local/home/saiposh/personal/ldd-wt/koh
npx tsc --noEmit && npx vitest run
LDD_N=80 npm run fair -- KOH
CHROME_PATH=/home/saiposh/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell npm run build:single && node scripts/flows.mjs
QA6=1 QA6_IDLE=0,37,120,251 npx vitest run tests/cities/koh/qa6.test.ts   # the scratch sweep (untracked)
```

Tip at the time of this report: **9fbad48** on `city/koh` (code 7b73339 + docs). Commits: 8ec8e5e (01-05), fa67eb0 (06), 59e9c76 + 6490250 (07), 1fcfde2 (08), 5695188 (09), d2e3a20 (10), 87c5dee (ending rename), 7b73339 (fairness pass), 9fbad48 (docs).
