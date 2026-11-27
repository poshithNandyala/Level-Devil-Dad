# PAT · Patna, Bihar: design notes (module city, 10 stages)

Code: `src/game/cities/pat/` (one file per stage, `s01.ts` .. `s10.ts`, plus `entities.ts` kit, `common.ts`,
`endings.ts`, `levels.ts`, `lines.ts`, `theme.ts`, `look.ts`, `music.ts`, `backdrop.ts`, `ambient.ts`, `things.ts`,
`causes.ts`). Routes and plays: `tests/cities/pat.ts`. Allocation: `docs/allocation.json` (v2), every stage's `meta`
matches its slot and declares its door ending.

**Status:** passed independent QA at c5e4950 (reports/cities/pat/QA/PASS.md, after FAIL-1..4), with PAT-05 at an accepted honest 52.9 s; merged into develop for v0.17.0.

## Stages

| # | Name | Allocation family / betrayals | Room | Act(s) | Door ending |
| --- | --- | --- | --- | --- | --- |
| 01 | Prannam, Patna! | crowd-carried-by-vehicle / sidestep-surge | a tempo pulls in behind you; the bus-stop crowd surges to it along the road; climb on the kerb board, then run on before the tempo pulls out. | none (tour) | none (tour) |
| 02 | Litti ki Aanch | ember-floor-poker-targets-food / poker-targets-food | three strikes of the poker at glowing cracks in the ash, then the rake from behind | `pat02-chokha`: the poker follows a rolling litti | `pat-musal`: two pestles pounding chokha |
| 03 | Ashok Rajpath | hoarding-swap-at-class-bell / B8, banner-swap-width | hoardings are platforms; at the bell each is swapped for a banner whose width shows in the roll above it (grows from the left, or is pulled taut to the right) | `pat03-batch`: three bells, five hoardings | `pat-ghanti`: two iron bells swinging low |
| 04 | Golghar | one-way-stairs-rising-grain / one-way-porters | porters come down the stair you climb, a second steps out of a landing door | `pat04-anaaj`: grain rises in the dome | `pat-bhitar`: the door leaf swings out into you |
| 05 | Pipa Pul | float-sinks-under-load / load-sinks | pontoon sections sink under the handcart rolling on them; jump the cart's section | `pat05-ghat`, `pat05-sangam`: longer decks | `pat-nawka`: the last float drifts off with the door |
| 06 | Setu ka Jod | setu-joint-missing-plate / missing-plate | numbered plates over every seam; those numbered by a multiple of the sacks on the truck are tarps over the gap | `pat06-sau` (two sacks: every second plate), `pat06-nau` (three again), `pat06-gaadi` (trucks lift plates, a second truck behind the first) | `pat-toll`: sensor strip slams a boom barrier |
| 07 | Tempo (marathon) | vehicle-leans-to-rider-side / lean-balance, parked-gap-closes | the deck leans to the heavier side; scrape an arch or hump while leaning and you die | `pat07-sadak` (truck, humps, a halt, an arch), `pat07-adda` (kerb-side truck, the stand and the lane a third tempo backs into) | `pat-hauled-basket`: the rope slips if you linger |
| 08 | Nalanda (how would I know) | count-bricks-routes-cells / count-routing | each hatch takes you to the cell with the same number of bricks; the others hold a well | `pat08-chowk`, `pat08-vihara` | `pat-mound`: decoy hatches, the door with zero bricks |
| 09 | Sonepur Mela (tough) | moving-gap-behind-rider / moving-gap, gondola-swing | the crowd parts only behind a horse rider | `pat09-jhoola`, `pat09-ghoda`: the giant wheel (a gondola with a fairgoer swings you off) and a quicker horse | `pat-charkhi`: four-armed turnstile |
| 10 | Setu se Golghar (finale) | finale-setu-plate-count / plate-count-under-cart | the sacks on a handcart are the rule: every n-th plate gone on the bridge | `pat10-pipa` (every n-th pontoon section awash), `pat10-sau` (the Setu with five sacks), `pat10-bori` (porters load sections, a sack slides), `pat10-sidhi` (Golghar's stair), `pat10-gaadi` (trucks lift plates), `pat10-anaaj` (the yard) | `pat-ginti-pad`: step only on the pad with the cart's number |

## Fairness (human-timing model, 80 runs per lag)

Every stage clears 100% at average lag (0-12 ticks) and every stretch between checkpoints is 100% at average lag; see
`/local/home/saiposh/personal/ldd-inbox/reports/cities/pat/BUILD.md` for the full output.

## Language

Spoken lines are only the ones `docs/cities/PAT.md` of the city bible marks VERIFIED (a small set, reused where it fits):
`Aain naa, Dad! Ka haal ba?`, `Litti garam ba, maze se khaa!`, `Safar badhiya rahe, Dad!`, `Do litti, ek chokha!`,
`Eeh ketna ha?`, `Madad kara!`, `Ruko!`, `Tani dubaara kaha.`, `Chalo, aage!`, `Badhiya!`, `Ulta-pulta ho gaya!`,
`Naikhe samajh mein aavat?`, `Humke naikhe maaloom, Dad!`, `Setu one, Dad zero!`, `Neend aa rahi hai?`,
`Sab badhiya ba...`. One deviation: `seven` is `Saat baar! Wapas shuru!` (the bible's text for that line is garbled).
Tara tells the truth once: `Ruko!` at the foot of Golghar's stair (waiting is right there). Everything else she says
is `Chalo, aage!`, which is a lie at every trap.

## Length pass and fix round 1 (acts added to 02-07, 09, 10)

Clear times of the scripted route: 01 15 s (the shared 120-column tour, see FIX-1.md), 02 26 s, 03 27 s, 04 38 s,
05 53 s, 06 37 s, 07 131 s, 09 74 s, 10 62 s. Added acts: `pat02-bhatti`, `pat03-patti`, `pat04-sidhi` (ladders, one new
rule each); `pat05-bori`; `pat06-gaadi`; `pat07-pul`, `-haat`, `-mandi`; `pat09-wapsi`; `pat10-bori`, `pat10-gaadi`.
`pat06-kumhrar` was cut (its idea repeated DMN-03's slippery floor). Details: `reports/cities/pat/LENGTH.md`, `FIX-1.md`.

Fix round 2: 05 has no act after `pat05-bori` (`khokhla` cut in round 3, `kuli` in round 4: both repeated shipped decisions; 05 runs 52.9 s), 06 `pat06-ginti` (61 s), 10 `pat10-roll` and `pat10-tempo` (100 s). Details: `reports/cities/pat/FIX-2.md`.
