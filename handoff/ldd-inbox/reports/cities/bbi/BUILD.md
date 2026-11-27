# BBI · Bhubaneswar: build report (after the second length pass; see LENGTH.md)

- Worktree: `/local/home/saiposh/personal/ldd-wt/bbi`, branch `city/bbi`, head `fe04121`. develop `6172e21` is merged
  in. Not pushed, no version bump.
- Files: only `src/game/cities/bbi/`, `tests/cities/bbi.ts`, `docs/cities/BBI.md` and the BBI row of `docs/CITIES.md`
  (`git diff --name-only develop...city/bbi` checked: own paths only).
- Design notes for the integrator (MECHANICS / WAVE1): `docs/cities/BBI.md` in the branch.

## Stages

Route = the scripted route's clear time with no deaths. Fair = `LDD_N=80 npm run fair -- BBI` win rate at quick /
average / relaxed lag; every stretch between checkpoints was 100% at average lag on every stage. Gap = the longest
stretch of the route between two calm spots (checkpoints).

| id | name | family [betrayals] | ending key | attempt 1 dies to | attempt 2 (FIX) dies to | attempt 3 | route / floor / par | fair q/a/r | cps (gap) | hidden item |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BBI-01 | Namaskara Bhubaneswar | aimed-hose-slick-follows-waiter [aimed-slide] | bbi-wet-lip-drain | walking on or waiting: the gardener's jet slides you into the drain (`bbi-nala`) | passing while he faces his pots, then running on: the wet tile at the next drain's lip (`bbi-nala`) | jump from the tile before the wet one; then the bus over the dug-up road | 25.4 s / 25-35 / 30 | 100/100/100 | 5 (8.8 s) | dahibara |
| BBI-02 | Hockey | keeper-pads-carry-you [carried-by-actor] | bbi-turf-roll | the keeper's front pad (`bbi-ball`) | off as he lands: the rebound (`bbi-rebound`) | wait for the rebound on the back pad; corners: over the still ball; the dummy corner; the door: on the bench as the turf roll passes (`bbi-roll`) | 25.7 s / 25-45 / 35 | 100/100/100 | 5 (7.9 s) | chhena poda |
| BBI-03 | Chandua | cutout-safe-on-open-parasol [safe-shape] | bbi-lantern-drop | jumping for a shut parasol (`bbi-rangapani`) | landing on the silk (`bbi-silk`) | only the cut-out; never wait on the one that is sold (`bbi-peeled`) | 25.8 s / 25-45 / 32 | 100/100/88 | 3 (7.7 s) | filigree flower |
| BBI-04 | Tarakasi | standing-builds-blocker [stand-builds-block] | bbi-curl-stair | the blowtorch (`bbi-agni`); waiting for it builds a hot curl (`bbi-jhala`) | keep moving, jump the trough (`bbi-kunda`) | stop only at the trough's edge | 29.3 s / 25-45 / 36 | 100/100/96 | 4 (10.4 s) | filigree flower |
| BBI-05 | Raja (HWIK, long) | idle-world-you-start-it [idle-world] | bbi-behind-step | the hand mill in the channel (`bbi-jaanta`) | touch nothing, then the verandah's roller (`bbi-sila`) | behind the step; start the water lift, bullocks and mill on purpose; the goat (`bbi-chheli`, `bbi-sinha`); the palm leaves (`bbi-patra`, `bbi-khali`) | 47.7 s / >= 60 SHORT / 58 | 100/100/84 | 13 | podapitha |
| BBI-06 | Bandha (long) | loom-beat-aligns-threads [beat-align] | bbi-motif-door | walking on the scattered patches (`bbi-ranga`) | stepping on at the motif: the shuttle (`bbi-shuttle`) | let the shuttle pass; staircase motif; painted panels (`bbi-sadha`, `bbi-chitra`); undyed threads (`bbi-sutra`); wet sari (`bbi-dhua`, `bbi-sari`); beater | 39.8 s / >= 60 SHORT / 48 | 100/100/100 | 7 | chhena poda |
| BBI-07 | Gotipua (marathon, lives: act) | troupe-pose-platform-shapes [pose-shapes] | bbi-pose-gate | the whirling dancers (`bbi-nacha`) | waiting for the whole bridge: thrown at the restart (`bbi-thrown`) | go at the stop; lamps over the wheel; the far drummer; bagudi (`bbi-bagudi`, `bbi-chhuin`); the falling tower (`bbi-pada`); the chain (momentum); the lamp plinth (shelter) | 64.3 s / >= 120 SHORT / 78 | 100/100/100 | 9 | podapitha |
| BBI-08 | Pakhala (HWIK) | pakhala-pour-floats-grains [pour-floats] | bbi-leaf-plate | walking on the rice (`bbi-pakhala`) | the badi by the right rim (`bbi-dhara`) | the middle badi; the draining bowl (`bbi-bhanwar`); two held jugs | 38.3 s / >= 60 SHORT / 46 | 100/100/84 | 4 | badi |
| BBI-09 | Chakka (long) | world-slides-hub-stays-still [hub-still] | bbi-horse-gap | riding the chariot (`bbi-chakka`) | the hub, then the sinking spokes carefully (`bbi-ara`) | climb steadily; rising spokes (`bbi-udaya`); the caretaker's broom (`bbi-jhadu`, `bbi-pheri`); the sinking plinth (`bbi-ulta`) | 61.0 s / >= 60 / 74 | 100/100/76 | 8 | chhena poda |
| BBI-10 | Kalinga (finale, lives: act) | finale-pads-onto-plinth [pads-to-plinth] | bbi-ribbon-snip | the front pad (`bbi-ball`) | riding the plinth to the slam (`bbi-chakka`) | the back pad, the plinth, the hub; then BBI's own parasols, looms, keeper, troupes, chariots and spokes | 93.0 s / >= 90 / 112 | 100/100/76 | 16 | dahibara |

Act ids, all `bbi0n-`, unique game-wide: bbi02-corner, bbi02-dive, bbi02-chhal · bbi03-gali, bbi03-mela ·
bbi04-karkhana · bbi05-dhenki, bbi05-gadi, bbi05-tenda, bbi05-chheli, bbi05-khala, bbi05-patra, bbi05-bail,
bbi05-chakki · bbi06-tana, bbi06-sidhi, bbi06-patta, bbi06-sutra, bbi06-sari, bbi06-rachh · bbi07-mardala, bbi07-deepa,
bbi07-bandha, bbi07-dui-baja, bbi07-bagudi, bbi07-pada, bbi07-shrinkhala, bbi07-dweepa · bbi08-kansa, bbi08-bhanwar,
bbi08-dui · bbi09-ghoda, bbi09-udaya, bbi09-ratha, bbi09-jhadu, bbi09-ulta, bbi09-asta, bbi09-ara · bbi10 unchanged.
The acts that were cut, and why, are listed in LENGTH.md.

Per-act deaths: every act's obvious play, and its obvious fix where it has one, is a recorded MISTAKE built on the
stage route up to that act (`DEATHS` in `tests/cities/bbi.ts`). All green.

## Tests (run on head `fe04121`)

- `npx tsc --noEmit -p .`: clean.
- `npm test`: 18 files passed, 12 skipped; 1648 tests passed, 12 skipped, 0 failed. BBI is on no allow-list.
- Probes (a) and (b), and the replay to each trap from its checkpoint: `probes.txt` (summary in LENGTH.md).

## Fairness output

`/local/home/saiposh/personal/ldd-inbox/reports/cities/bbi/fair-BBI.txt`.

## Screenshot sheets

`/local/home/saiposh/personal/ldd-inbox/reports/cities/bbi/shots/BBI-01-sheet.png` .. `BBI-10-sheet.png`. I re-shot
02, 05, 06, 07, 08 and 09 after the second pass and read 05, 06, 07 and 08; I read the others after the first pass: the skyline shows the cave hills with cells, the white
dome, curved towers and floodlights; signs, cards and banners fit; nothing overlaps the play row; the rising spokes
and the chariots read.

## Deviations

- All ten slots are built in slot order. The second length pass uses all three reserves once each (talapatra in 05,
  pattachitra in 06, bagudi in 07). Two new acts (`bbi06-sari`, `bbi09-jhadu`) come from their stage's setting, not
  from an allocated family.
- BBI-01's `meta.ending` names the tour's closing bite (tours have no door ending).
- Shapes: std stages are tagged `short`, the HWIK stages `wtf` (the engine's names).
- Skyline: no Lingaraj by name (the bible's Avoid list); generic curved towers.
- Checkpoints: every act starts with one, and the longest replay to a trap is 7.6 s at lag 0, 6 and 12.

## Not done

- 05, 06, 07 and 08 are short of their floors; LENGTH.md gives the numbers and the reasons.
- 22 acts from the first build and first pass still have no FIX death (probe b).
- The finale's callbacks were not rechecked against law 7.
- The cut acts' code is still in the stage files, unused.

## Risks and places for QA to press

1. BBI-02's door is now `bbi-turf-roll` (the turf rolled up from the door end); the goal-net door is gone.
2. Relaxed lag is 76% on 09 and 10 and 80% on 07: the hub jump, the rising spokes and the chain are the tight spots.
3. The wet sari (06) launches Dad with fixed speeds; on phones with frame drops, check that the second bounce still reaches the bank.
4. BBI-05's carts must be jumped from a narrow take-off window; a graze starts them (they now roll only two tiles).
5. Water-lift buckets in 05 dunk for a second and come back; the guide does not warn of it, the cause line does.

Not checked: real phone play, sound in a browser, readability of the small sprites at phone size.
