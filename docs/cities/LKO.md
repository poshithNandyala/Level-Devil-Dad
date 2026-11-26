# LKO · Lucknow (Uttar Pradesh): build notes

Module: `src/game/cities/lko/` (one file per stage, `s01.ts` .. `s10.ts`; shared bits in `kit.ts`).
Routes and the plays that must die: `tests/cities/lko.ts`. Allocation v2 slots, in order.
Every spoken line is from the city bible's VERIFIED list (standard Lakhnavi Hindustani courtesy).

## Stages

| Id | Name | Slot / family | The room's idea | Acts | Door ending |
| --- | --- | --- | --- | --- | --- |
| LKO-01 | Aadaab Lucknow (tour) | LKO-F1 `sold-bolt-hooked-out-sideways` [B3, bolt-unrolls-curtain] | Chowk's cloth bolts hung over a dug-up lane are the way across; land on one and it's sold: the shopkeeper's bamboo hook rises, grips, and slides it out sideways from under you. Then a long bolt unrolls down across the road, a wooden roller on its end: run under before it lands | (tour) | plain door by the Gomti (`lko-gomti-ghat`) |
| LKO-02 | Pehle Aap | `politeness-bow-sets-order` [bow-order] | The first one through the haveli doorway gets the loose threshold stone. Lean into the two gentlemen and they see you through first; stand still (a bow) and one goes first and drops the stone; bow again instead of taking the second one's offer and he sees you through himself | `lko02-gali`: a man behind offers you the way before the stone has gone: let him go first | `lko-kiwad`: the haveli door opens outwards, its leaves sweep the two tiles in front of it |
| LKO-03 | Chhapa | `print-washed-stitch-remains` [wash-remains] | Printed blue vine, solid white stitched flowers and white jali over the dhobi's vat. First whistle washes the print, second the jali: stand only on solid flowers | `lko03-kunda`: three vats where the print is the only way: a whistle a beat after you step on, run it without stopping; the jali in the middle of the second goes with the print | `lko-bakhiya`: the bright printed door is on cloth over a vat; the real door is the shadow on a hung muslin, up on a ledge |
| LKO-04 | Makhan Malai | `sun-direction-sinks-foam` [light-sinks] | Every heap of malai: the tile facing the low sun goes soft and sinks under you; the tile in its own long shadow holds. The halwai lifts his shiny lid and the light comes from the other side | `lko04-chowk`: single cups, shaded only by the long shadow of a kulhad stack; the shadows shorten as the sun climbs | `lko-kulhad`: the halwai stokes his bhatti behind you: light from the left, the left tiles of the steps go soft |
| LKO-05 | Galouti | `flatten-platforms-build-low-lane` [flatten-lane] | A hop off a full heap of galouti puts your head in the seekh rack; stand a moment and it squashes flat and stays; from flat your hop clears. Flat is thin: linger and the tawa burns through | `lko05-tawa`: sixteen heaps, some already thin (hop at once); `lko05-lane`: a slab under the lowest rack squashes from your feet forwards, a lane you walk behind the squash; `lko05-dum`: heaps piled two high, one squash only makes them full again (wait for the second) | `lko-sheermal`: the baker slaps a sheermal on the tandoor's inside wall: a ledge until it bakes |
| LKO-06 | Kathak | `sound-draws-dancer-spin` [sound-draws] | Red ghungroo strips in the stage floor ring when stepped on and the dancer spins across to the sound; the board she taps rings too: go over it on the musicians' takht | `lko06-tatkar`: her tatkar patch moves to and fro; hop it as it comes at you; `lko06-mehfil`: she spins the stage end to end without stopping, shelter on the musicians' takhts, a strip turns her back at you | `lko-sam`: three chakkars and a stamp; the door opens on the stamp; wait on the takht |
| LKO-07 | Hazratganj (marathon, lives: act) | `pace-sets-crowd-shape` [pace-crowd, ladder-block] | Rush (no pause for half a second) and the strollers close ranks and tut you back into the nala; pause and they part | `lko07-shaam` ten awnings come down behind you at dusk (momentum); `lko07-batti` three lamplighters swing their ladders (shelter, then go under); `lko07-julus` a slow procession going your way: walk behind at its pace, wait at each nala (the last one comes early); `lko07-saamne` groups coming the other way under a banner: shelter in the alcoves, the last alcove's sill is cracked (the shelter is the trap once); `lko07-chauraha` stroll so they part, then run before the awnings over them come down | `lko-darban`: the café's darban holds the door only for strollers; land off the nala hop rushing and he shoves you back |
| LKO-08 | Bhool Bhulaiya (HWIK) | `entry-height-routes-level` [enter-height] | Every arch is alike: through one at a jump and you come out a floor up; on foot and you stay. The first has a little drain (a hop takes you up on to the hooks), the second the old well beyond it (jump) | `lko08-chausar` (Pachisi reserve): a cowrie throw lights that many squares ahead, only lit ones hold, never the courtier's square; `lko08-mehrab`: a low vault full of hooks above one arch (walk), the well past the next (jump) | `lko-489`: the last arch at the end of the gallery: walk through and step off to the door; hop the crack into it and you're on the roof |
| LKO-09 | Kabootarbazi | `flag-colour-steers-flock` [flag-signal] | The flyer's flag: red, the flock circles; white, it comes down on the roof just ahead of you. Cross only early in the red | `lko09-gumbad` (Taj reserve): white domes in the garden pool seem bigger the farther you stand, jump from the red paving line; `lko09-hawa`: the flyer is behind you and the flag has two faces; the birds go by the far face, the opposite of what you see (the curled tip shows it) | `lko-chhatri`: the pigeon loft's door: on white the flock comes home through it |
| LKO-10 | Lakhnavi Tehzeeb (finale, lives: act) | `finale-bow-meets-bells` [bow-vs-bells] | The gentlemen at the door again, but the floor before it is bells sewn under chikan covers: a step is silent, a bow (standing still) rings them and the dancer spins to you. Bow on the one plain board | `lko10-dhulai` wash line + malai heaps in the low sun; callbacks in a new order: `lko10-tawa`, `lko10-tatkar`, `lko10-julus`, `lko10-gali`, `lko10-hawa`, `lko10-chausar`, `lko10-kunda`; then `lko10-galiyara` arches by height and a gallery of covered bells (don't stop) | `lko-tehzeeb`: the last door opens to a bow; bow from the plain board two steps back, not on the covered threshold |

## New death causes (causes.ts)

`lko-julus lko-saamne lko-jhanda lko-goti lko-gumbad lko-mehfil lko-than lko-parda lko-pehle lko-dhakka lko-kiwad lko-chhapa lko-jali lko-malai lko-seekh lko-tawa lko-tandoor lko-chakkar lko-tatkar lko-ganj lko-shamiyana lko-seedhi lko-darban lko-bhool lko-kuan lko-mehrab lko-kabootar lko-chhat lko-tehzeeb`

## Hidden items (things.ts)

`lko-malai` (makhan malai in a kulhad), `lko-chikan` (a folded chikan kurta), `lko-galouti`, `lko-ghungroo`, `lko-kulfi` (matka kulfi), `lko-sheermal`.

## Fairness (`npm run fair -- LKO`, 40 runs a lag)

| Stage | quick 0-6t | average 0-12t | relaxed 0-18t | every stretch at 0-12t |
| --- | --- | --- | --- | --- |
| LKO-01 | 100% | 100% | 85% | 100% |
| LKO-02 | 100% | 100% | 100% | 100% |
| LKO-03 | 100% | 100% | 80% | 100% |
| LKO-04 | 100% | 100% | 80% | 100% |
| LKO-05 | 100% | 100% | 80% | 100% |
| LKO-06 | 100% | 100% | 90% | 100% |
| LKO-07 | 100% | 100% | 100% | 100% |
| LKO-08 | 100% | 100% | 100% | 100% |
| LKO-09 | 100% | 100% | 80% | 100% |
| LKO-10 | 100% | 98% | 80% | 98% |

## Clear times (scripted route, after the length pass)

01 14.2 s · 02 12.0 · 03 11.4 · 04 11.5 · 05 35.2 · 06 33.1 · 07 69.6 · 08 21.2 · 09 39.2 · 10 92.3. Reasons for the short ones: `/local/home/saiposh/personal/ldd-inbox/reports/cities/lko/LENGTH.md`.
