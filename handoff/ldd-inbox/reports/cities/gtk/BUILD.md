# GTK · Gangtok: build report

- Worktree: `/local/home/saiposh/personal/ldd-wt/gtk`, branch `city/gtk`, cut from develop `5e05554`.
- Head commit: `9141a1d` (branch `city/gtk`).
- Files touched: only `src/game/cities/gtk/`, `tests/cities/gtk.ts`, `docs/cities/GTK.md` and the GTK row of `docs/CITIES.md`.
- Not pushed, no version bump, no merge.

## Stages

Route time is the bot's clear time; par is set to bot time × 1.35 (the `par.test.ts` suggestion). Fairness is
`LDD_N=80 npm run fair -- GTK` (quick 0-6 / average 0-12 / relaxed 0-18 ticks of lag); every stretch was 100% at
average lag, so the worst stretch column is the lowest one.

**Updated after the length pass:** route / par and fairness are the new numbers (fairness from `LDD_N=40`, see
`fair-N40.txt`). The attempt columns describe each stage's first act; the acts added in the length pass, with their
NAIVE and FIX deaths, are listed in `LENGTH.md` in this folder.

| id | name | family [betrayals] | ending key | attempt 1 dies to | attempt 2 (FIX) dies to | attempt 3 (the way) | route / par | fair q/avg/rel | worst stretch | cps | hidden item |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GTK-01 | Namaste Gangtok | sweeper-sweeps-ground-things [sweep-arc] | gtk-tour-plain-door | walking on into the first sweeper's stroke: swept into the cart (`gtk-jhadu`) | (MISTAKES) the bench worked, so walk on at the second sweeper: swept | bench at the first, walk behind the stroke at the second | ~30 s / 40 | 100/100/100 | 100% | 3 | momo |
| GTK-02 | Momo Steamer | tier-cycle-top-to-bottom [tier-cycle] | gtk-steam-vent | waiting on the top tier: carried round into the steam (`gtk-bhaap`) | getting on the second tier while the top is away: the lid (`gtk-dhakkan`) | ride the top tier up, step off at the top (act: jump off on the way up) | ~35 s / 47 | 100/100/100 | 100% | 2 | momo |
| GTK-03 | Plastic Nahin | inspector-confiscates-thin-bags [inspector-removes] | gtk-jhola-entry | stepping on every bag: a thin one tears (`gtk-polythene`) | cloth only, but stopping on each to check: the inspector lifts it (`gtk-jaanch`) | cloth to cloth, keep ahead of him; the second row he comes towards you: hop over him | ~26 s / 35 | 100/100/98 | 100% | 3 | sel roti |
| GTK-04 | Kun Floor? | floor-numbering-by-entrance [numbering] | gtk-lift-counts-down | straight on out of the first door: over the jhora (`gtk-galat-tala`) | counting doors (the shop floor has none): the basement, into the water (`gtk-jhora`) | count three flights from the door you came in | ~25 s / 34 | 100/100/100 | 100% | 2 | churpi |
| GTK-05 | MG Marg ka Niyam (HWIK, long) | dropped-litter-warden-pause [rule-broken-by-jump] | gtk-taxi-meter | hopping the first flower bed with the wrapper in hand: fined, held, swept (`gtk-jurmana`) | binning it behind, then trusting the next (full) bin: fined again | walk past an empty bin before every jump; go back when it's full | ~71 s / 96 | 100/100/100 | 100% | 7 | momo |
| GTK-06 | Seedhi | shortcut-stairs-one-loop-low [topology] | gtk-tank-overflow | the stair down: the taxi stand (`gtk-taxi`) | in the act, the stair up again: the doorstep, a long drop on to the roof (`gtk-chhat`) | stair up in the room, stair down to the roof garden in the act (Tara true), wait on the last step at the second stand | ~68 s / 92 | 100/100/80 | 100% | 3 | thukpa |
| GTK-07 | Badal (marathon, lives act) | fog-hides-edge-rope-gaps [fog-edge] | gtk-rope-climbs-to-door | just running in the cloud: off the edge (`gtk-badal`) | waiting for the cloud to lift and walking the road that looks whole: the painted wall (`gtk-deewar`) | jump where the kerb rope stops, every time | ~123 s / 166 | 100/100/80 | 100% | 8 | sel roti |
| GTK-08 | Ropeway (HWIK) | cabins-cross-at-midpoint [cabin-cross] | gtk-cabin-both-doors | staying on the cabin, as Tara says: back into the shed (`gtk-ropeway`) | (none scripted; HWIK) | hop to the other cabin while they stand together; down to it on span 2, up to it on span 3 | ~65 s / 87 | 100/100/100 | 100% | 3 | momo |
| GTK-09 | Tsomgo | ride-animal-fixed-loop [ride-fixed-loop] | gtk-gate-yak-snowbank | walking across the shore: thin ice (`gtk-hiun`) | riding the yak and getting off when it stops (the photo stop is on the thin ice) | stay on through the photo, off on the far bank; jump for the bank at the second; off on the move on to the stair at the third | ~70 s / 94 | 100/100/90 | 100% | 3 | churpi |
| GTK-10 | Kanchenjunga (finale, lives act) | finale-two-roads-count-in-fog [count-in-fog] | gtk-viewpoint-second-floor | out of the first door in the cloud (`gtk-galat-tala`) | at the stall, straight on to the steamer with the wrapper in hand (`gtk-jurmana`) | count flights in the cloud, bin before the jump, rope, the stair, one floor down, two floors up | ~100 s / 135 | 100/100/80 | 100% | 6 | churpi |

FIX plays: 02, 03, 04, 05, 06, 07, 09, 10 (8 of 10). NAIVE: all 10. MISTAKES: 01.

## Tests

- `npm run typecheck`: clean.
- `npm test`: 18 files passed, 13 skipped; 1416 tests passed, 13 skipped (whole suite).
- `npx vitest run tests/modules.test.ts -t GTK`: 11 passed (no TODO, no placeholder, NAIVE 10/10, FIX 8, hidden item in every stage).
- `npx vitest run tests/allocation.test.ts`: 10 passed (meta matches v2, endings `gtk-*` unique and not shipped, act ids unique).
- `npm run build:single && node scripts/flows.mjs`: "no errors".
- Fairness output: `/local/home/saiposh/personal/ldd-inbox/reports/cities/gtk/fair-N80.txt`.

## Screenshot sheets

`/local/home/saiposh/personal/ldd-wt/gtk/shots/route/GTK-01-sheet.png` … `GTK-10-sheet.png` (one per stage, made by
`bash scripts/dev/shots.sh GTK-0n`). I read 01, 02, 03, 05, 07, 08 and 10. Fixes made from them: a lighter backdrop
(the first one was a wall of houses), and dark gully walls behind the jhora, the gorge and the house gullies so the
bags and cabins read against them.

## Deviations from the allocation

- None in family, betrayal or slot order. 08 and 09 play differently: 08 is hopping between two moving cabins at the
  one moment they meet over the gorge; 09 is staying mounted on a walking yak and choosing where to get off over
  thin ice. Reserve GTK-F1 was not needed.
- Slot 10's callback list names churpi, but churpi (old slot 08, a decoy-twin block) was replaced in v2 and never
  built, so churpi appears only as the hidden item. The finale calls back the house (04), the rule (05), the
  steamer (02), the rope and the cloud (07) and the stairs (06).
- 05 also uses the sweeper of 01 (the bible's own pairing: "the warden holds you while the sweeper comes"), and its
  first act makes 01's bench answer stale.
- The tour (01) has no door ending; its meta key `gtk-tour-plain-door` only reserves the name.
- Rumtek is not in the backdrop: it is a monastery, and the bible's Avoid list forbids monasteries.

## Not done, and where QA should press

- **Length.** Every stage is shorter than its shape asks: std 02/03/04 are ~21/17/11 s (25-45 asked), long 06/09
  ~13/38 s (45-75), HWIK-long 05 ~30 s (60-90), marathons 07/10 ~44/32 s (90-150). A human who waits for the
  cloud, the cabins and the bin round takes longer than the bot, but not 2-3x. This is the biggest gap.
- **Language.** Only the bible's VERIFIED Nepali; many lines are therefore English on both sides of the bar (for
  example "MG Marg: no litter, no smoking!"). Signs use a few unverified Hindi/place words as labels (SEEDHI, TASHI).
- **Endings** are simpler than the rooms; 02 (steam vent across the doorway), 06 (tank overflow) and 08 (docked
  cabin doors) are timing beats; check them against `lamp` and `pestles`-style ideas.
- **The 04 and 10 houses** rely on a fall-height rule in the gully (over 40 px out of a wrong door kills); that is
  new in this city only. 06's act has a 72 px rule on the roof.
- **Relaxed lag (18 ticks)** is 80% on 06, 07 and 10 and 90% on 09 (average lag is 100%).
- The A3s were proven by bots; please play 03's second row (hop over the inspector), 08's spans and 09's last yak
  by hand.
- Music is a config only (scale, theka, two phrases); not listened to.
