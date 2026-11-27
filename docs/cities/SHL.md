# SHL · Shillong, Meghalaya: design notes (module city, 10 slots, 6 built)

Code: `src/game/cities/shl/` (one file per stage, `s01.ts` .. `s06.ts`, plus `entities.ts` kit (the same Rig kit
Patna wrote, copied), `common.ts`, `endings.ts`, `levels.ts`, `lines.ts`, `theme.ts`, `look.ts`, `music.ts`,
`backdrop.ts`, `ambient.ts`, `things.ts`, `causes.ts`). Routes and plays: `tests/cities/shl.ts`. Allocation:
`docs/allocation.json` v2 (key `SHL`): every built stage's `meta` matches its slot and declares its door ending.

**Status (round 1):** stages 01-06 built and green (routes, NAIVE, FIX, MISTAKES, checkpoints, cpsafe at lag 0/6/12,
items, allocation, jump audit); 07-10 are placeholders named for their slots (`unbuilt()` in `levels.ts`: an empty
room, a hidden item, Tara) so the module registers and routes. The module guard fails on "a NAIVE play for every
stage" until 07-10 exist. Build report: `/local/home/saiposh/personal/ldd-inbox/reports/cities/shl/BUILD.md`.

## Stages

| # | Name | Allocation family / betrayals | Room (the decision) | Act(s) | Door ending |
| --- | --- | --- | --- | --- | --- |
| 01 | Kumno, Shillong! | fake-first-raindrop / fake-first-drop | the first drop falls by a pine well short of the cloud and means nothing; rain falls only under the cloud shape, on a beat; the cloud drifts over anyone who stands near it waiting: run under it right after it has emptied | none (tour) | none (tour) |
| 02 | Pine Peak | cloud-bank-platform-thins-edge / cloud-platform | a cloud bank slides across the gap; it is a floor only where a sunbeam lights its thick middle, never at its two thin ends | `shl02-sngi`: a thinner bank, three beams; the third lights while only the bank's end is under it (an end is thin, lit or not). `shl02-lyoh`: a high cloud crosses the sun; while it does nothing holds | `shl-dish`: the radar dish's beam sweeps the last four tiles on a beat |
| 03 | Sway | bridge-swing-matches-step-cadence / cadence-swing | the Dawki deck swings to your own running: bursts of a few steps and a stop keep it flat; the red line shows it building | `shl03-wake`: a boat's wake is a full swing to anyone on that span: let it pass from the tower. `shl03-wet`: wet planks slide you on after a stop, and the slide swings the deck like a step: stop earlier, stand longer | `shl-tollbar`: the toll bar at the far tower drops on whoever arrives with the deck still swinging |
| 04 | Knup | wide-gear-hitbox / wide-gear | jump at a hook to put the knup on or hang it up; on, rain and awning drips are nothing but a low branch catches it; off, the drips are a spike row | `shl04-iew`: a tall arch the knup fits (the hook before it is a lure), a low arch (hang it up), an awning (take it again). `shl04-khynnah`: a small knup fits the low arch and the drips but not heavy rain: swap at the hooks | `shl-halfdoor`: a Khasi half-door, lintel at head height: hang the knup outside |
| 05 | Seven Sisters (HWIK) | one-stream-schedule-mark / hidden-schedule | each fall pours on a schedule: full, thinning, on the white mark, a dry moment, full again with no warning; cross on the mark; the dry moment is the lure | `shl05-ar`: two sisters, the second never goes dry (thinning is not the mark). `shl05-pung`: a basin that floods whenever either sister is full: cross when both sit on their marks | `shl-pool`: the seventh sister pours into the pool before the door |
| 06 | Root Guide | choose-guide-root-grows / choose-grow | three guides: jump at one and its root grows over a few seconds, the others wither; the short one lands in the spray, the middle gives up half way, the long one from the rock lands dry | `shl06-sprout`: no guides; stand on the tip of the root you grew and it sprouts the next span. `shl06-kiang`: a guide stands in the path; touch it and a root grows across the path at head height: hop the guide | `shl-rootdoor`: one guide, one root to the door's ledge |
| 07 | Mawsmai (marathon) | drip-growth-gate-pairs / drip-growth | not built (placeholder) | | |
| 08 | Wettest Desert (HWIK) | tank-fills-when-not-under-rain / cloud-meter | not built (placeholder) | | |
| 09 | Eight-Day Market (tough) | day-cycle-rearranged-stalls / day-cycle | not built (placeholder) | | |
| 10 | Down Seven Hundred (finale) | finale-cadence-bridge-day-stalls / stalls-on-swaying-span | not built (placeholder) | | |

## Lengths and pars (route clear time; par = 1.35 x where set)

01 13.5 s (tour) · 02 41.6 s (par 40, to be reset to 56) · 03 25.3 s (par 45) · 04 12.4 s (par 40; short of its 25 s
floor) · 05 21.6 s (par 60; short of its 60 s floor) · 06 23.5 s (par 60; short of its 60 s floor). The honest
numbers and what is missing are in the build report.

## Fairness (human-timing model, 80 runs per lag)

Every built stage clears 100% at average lag (0-12 ticks) and every stretch between checkpoints is 100% at average
lag; 18t: 01 100, 02 88, 03 100, 04 100, 05 100, 06 84.

## Language

Khasi words in English frames, the way Shillong speaks. Every Khasi word is on the bible's verified list (docs section 4
of `ldd-inbox/docs/cities/SHL.md`): kumno, kumno phi long, nga biang, nga khlaiñ, mo, sngewbha, khublei shibun, hooid,
em, wan, leit, ym, tang, map ïa nga, ka don ha jan, nga la thait, sngewsih, kmen, bam, ja, ïew, kali, peit, bah, kong.
The bible's one U line (15, "Ayyo") is replaced by its own fallback. The seventh-death line is new, V words only:
"Em, em! Seven falls. Wan again. | No, no! Seven falls. Come again."

## Workarounds inside the folder

- `entities.ts` is Patna's small Rig kit (a box that can be solid and/or deadly, moved and drawn by closures), copied
  because a city never imports another city.
- Root platforms (06) are Rigs whose solid widens each tick as the root grows; cloud floors (02) are Rigs whose solid
  is switched on only while a bank's thick middle is under a lit beam.
