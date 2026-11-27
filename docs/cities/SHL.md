# SHL · Shillong, Meghalaya: design notes (module city, 10 stages)

Code: `src/game/cities/shl/` (one file per stage, `s01.ts` .. `s10.ts`, plus `entities.ts` kit (the same Rig kit
Patna wrote, copied), `common.ts`, `endings.ts`, `levels.ts`, `lines.ts`, `theme.ts`, `look.ts`, `music.ts`,
`backdrop.ts`, `ambient.ts`, `things.ts`, `causes.ts`). Routes and plays: `tests/cities/shl.ts`. Allocation:
`docs/allocation.json` v2 (key `SHL`): every stage's `meta` matches its slot and declares its door ending.

**Status (round 2):** all ten stages built and green (routes, NAIVE, FIX, MISTAKES, checkpoints, cpsafe strict at lag
0/6/12, items, allocation, jump audit, the module guard). Lengths: 01 13.5 s, 02 33.9 s, 03 25.3 s, 04 12.4 s,
05 31.1 s, 06 35.3 s, 07 50.2 s, 08 68.6 s, 09 28.8 s, 10 28.1 s: 04, 05, 06, 07, 09 and 10 are under their floors
(25 / 60 / 60 / 120 / 60 / 90 s). Build reports: `/local/home/saiposh/personal/ldd-inbox/reports/cities/shl/BUILD.md`
(round 1) and `BUILD-2.md` (round 2, with the honest numbers and what is missing).

## Stages

| # | Name | Allocation family / betrayals | Room (the decision) | Act(s) | Door ending |
| --- | --- | --- | --- | --- | --- |
| 01 | Kumno, Shillong! | fake-first-raindrop / fake-first-drop | the first drop falls by a pine well short of the cloud and means nothing; rain falls only under the cloud shape, on a beat; the cloud drifts over anyone who stands near it waiting: run under it right after it has emptied | none (tour) | none (tour) |
| 02 | Pine Peak | cloud-bank-platform-thins-edge / cloud-platform | a cloud bank slides across the gap; it is a floor only where a sunbeam lights its thick middle, never at its two thin ends | `shl02-sngi`: a thinner bank, three beams; the third lights while only the bank's end is under it. `shl02-lyoh`: a high cloud crosses the sun; while it does nothing holds. Both banks' clocks start when Dad enters the act | `shl-dish`: the radar dish's beam sweeps the last four tiles on a beat |
| 03 | Sway | bridge-swing-matches-step-cadence / cadence-swing | the Dawki deck swings to your own running: bursts of a few steps and a stop keep it flat | `shl03-wake`: a boat's wake is a full swing to anyone on that span: let it pass from the tower. `shl03-wet`: wet planks slide you on after a stop, and the slide swings the deck | `shl-tollbar`: the toll bar at the far tower drops on whoever arrives still swinging |
| 04 | Knup | wide-gear-hitbox / wide-gear | jump at a hook to put the knup on or hang it up; on, rain and awning drips are nothing but a low branch catches it; off, the drips are a spike row | `shl04-iew`: a tall arch the knup fits (the hook before it is a lure), a low arch, an awning. `shl04-khynnah`: a small knup fits the low arch and the drips but not heavy rain | `shl-halfdoor`: a half-door: hang the knup outside |
| 05 | Seven Sisters (HWIK) | one-stream-schedule-mark / hidden-schedule | each fall pours on a schedule: full, thinning, on the white mark, a dry moment, full again with no warning; cross on the mark; the dry moment is the lure | `shl05-ar`: a sister that never goes dry. `shl05-pung`: a basin that floods whenever either sister is full. `shl05-roar`: a sister hidden behind rock (her roar is the read) and the quick sister (half a second on the mark: the labelled momentum beat) | `shl-pool`: the seventh sister's pool |
| 06 | Root Guide | choose-guide-root-grows / choose-grow | three guides: jump at one and its root grows, the others wither; the short lands in the spray, the middle gives up, the long from the rock lands dry | `shl06-sprout`: stand on the tip of a root you grew and it sprouts the next span. `shl06-double`: a gorge too wide for one root: near guide first, then the far guide from the near root's tip; out of order the near root grows at head height. `shl06-kiang`: a guide in the path grows a root across it: hop the guide | `shl-rootdoor`: one guide, one root to the ledge |
| 07 | Mawsmai (marathon) | drip-growth-gate-pairs / drip-growth | stalactites grow a step at every drip; one that meets its stump is a wall for a moment, then breaks; pass while there is room; a head bump freezes one for 3 s | `shl07-krem`: the gallery, seven dripping together: wait for the break, run them all (labelled momentum beat). `shl07-pool`: the drip storm; the stalactite over the pool never meets a stump (shelter beat). `shl07-plop`: tips hidden behind pillars; a high click is a long fall, a deep plop is nearly down (sound beat). `shl07-knock`: two on different clocks a step apart: bump the first, wait under it for the second's break (the tap). `shl07-pairs`: stumps grow too; a bump freezes only the top | `shl-column`: the slowest stalactite over the door's arch |
| 08 | Wettest Desert (HWIK) | tank-fills-when-not-under-rain / cloud-meter | the cloud follows whoever is under its reach and soaks them in 1.5 s; the tank fills only while the rain falls into its gutter: stand out of reach, or under the tank's roof (the rain on you drains into it); the spout pours across the path as the gate lifts | `shl08-roof`: no out-of-reach spot; the roof has a hole. `shl08-pull`: the cloud rests over the path; pull it on to the roof yourself; the roof's edge sheds. `shl08-bucket`: the gauge is a bucket over the only out-of-reach spot. `shl08-two`: two tanks, one gate; the first's spout pours across the way | `shl-tap`: the tank's tap opens when the last tank is full |
| 09 | Eight-Day Market (tough) | day-cycle-rearranged-stalls / day-cycle | every stall's plate is the day it is closed; each arch you pass is a new day (the board shows it); a closed stall is a cloth over a frame | `shl09-sngi`: another arch, another day. `shl09-kot`: blank boards: count the arches. `shl09-pdeng`: the arch stands mid-row: the day turns under you. `shl09-doh`: the sold-out stall: boards off means closed, plate or no plate. `shl09-sngi-khlieh`: the holiday (every stall a frame, the drain dry: walk the bed) and a double arch (two days at once) | `shl-board`: a keeper flipped the last board to yesterday: trust the gates |
| 10 | Down Seven Hundred (finale) | finale-cadence-bridge-day-stalls / stalls-on-swaying-span | law 7: the lone drop tells the truth (stop at the drop; the cloud that forms drifts to a waiter); the knup is wrong for the drizzle and the low arch, right for the drips: leave it on the first hook, take the second | `shl10-rong`: a sister whose mark was painted too high: read the sheet. `shl10-jingkieng`: the hanging guide grows a root at head height; the pole from the far bank grows the floor. `shl10-wet`: a wet stalactite sheds three drips when bumped. `shl10-pung`: the rest stalls on a Dawki span: bursts for the deck, the plates for the day, the arch in the middle | `shl-tallgate`: the gate is tall today: take the knup for its drips |

## Pars (1.35 x the route's clear time)

02 46 · 03 34 · 04 17 · 05 42 · 06 48 · 07 68 · 08 93 · 09 39 · 10 38 (01 the tour's default).

## Fairness (human-timing model, 80 runs per lag)

Every stage clears 100% at average lag (0-12 ticks) except 05 at 99% (one `shl-wah` at the basin stretch), and every
stretch between checkpoints is >= 99%; 18t: 01 100, 02 88, 03 100, 04 100, 05 81, 06 84, 07 93, 08 100, 09 100, 10 100.

## Language

Khasi words in English frames, the way Shillong speaks. Every Khasi word is on the bible's verified list (docs section 4
of `ldd-inbox/docs/cities/SHL.md`): kumno, kumno phi long, nga biang, nga khlaiñ, mo, sngewbha, khublei shibun, hooid,
em, wan, leit, ym, tang, map ïa nga, ka don ha jan, nga la thait, sngewsih, kmen, bam, ja, ïew, kali, peit, bah, kong.
The bible's one U line (15, "Ayyo") is replaced by its own fallback. The seventh-death line is new, V words only:
"Em, em! Seven falls. Wan again. | No, no! Seven falls. Come again."

## Workarounds inside the folder

- `entities.ts` is Patna's small Rig kit (a box that can be solid and/or deadly, moved and drawn by closures), copied
  because a city never imports another city.
- Root platforms (06, 10) are Rigs whose solid widens each tick as the root grows (leftwards for the far-bank root);
  cloud floors (02) are Rigs whose solid is on only while a bank's thick middle is under a lit beam; market counters (09,
  10) are Rigs whose solid is off on the day of their plate; the holiday's dry bed is a solid two tiles down that exists
  only on day 8.
- Trigger-started clocks: the banks and sun of 02's acts and every stalactite of 07's acts start their clock when Dad
  passes the act's checkpoint column, so the beat from a respawn is the same on every try (the replay bar).
