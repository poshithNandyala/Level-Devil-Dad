# GTK · Gangtok, Sikkim: design notes (module city, 10 stages)

Code: `src/game/cities/gtk/` (one file per stage, `s01.ts` .. `s10.ts`, plus the `entities.ts` kit (`Rig`), `common.ts`,
`endings.ts`, `levels.ts`, `lines.ts`, `causes.ts`, `theme.ts`, `look.ts`, `music.ts`, `backdrop.ts`, `things.ts`,
`skin.ts`, `course.ts`). Routes and plays: `tests/cities/gtk.ts`. Allocation: `docs/allocation.json` v2; every stage's
`meta` is its slot and declares its door ending.

## Stages

| # | Name | Family / betrayal | Room | Act(s) | Door ending |
| --- | --- | --- | --- | --- | --- |
| 01 | Namaste Gangtok (tour) | sweeper-sweeps-ground-things / sweep-arc | MG Marg's sweepers stroke their brooms along the paving and sweep anything on the ground into the cart, Dad too. The first has a bench beside him (be on it while he strokes); the second has none: walk through behind the stroke while the broom is in the air | none (tour) | `gtk-tour-plain-door` (the tour's door is plain; key reserved) |
| 02 | Momo Steamer | tier-cycle-top-to-bottom / tier-cycle | three tiers on the stove; the cook lifts the top one high, carries it round and slides it under the bottom, into the steam. Ride it up and step off at the top; get on lower while it's away and the lid comes down | `gtk02-bhatti`: a busier cook, no stop at the top: jump off on the way up | `gtk-steam-vent`: a floor grate over the big pot puffs a column of steam across the doorway |
| 03 | Plastic Nahin | inspector-confiscates-thin-bags / inspector-removes | bags hung on a rail over the jhora; cloth jholas (stitched handles, hem) hold, thin polythene tears | `gtk03-jaanch`: the inspector comes along the rail behind you, takes thin bags, lifts any bag you stand on; `gtk03-ulto`: he works the next row from the far end, towards you: hop over him | `gtk-jhola-entry`: the cloth-bag stall won't let you in empty-handed; take the jhola off the hook |
| 04 | Kun Floor? | floor-numbering-by-entrance / numbering | a hillside house entered at the top road's G; the lower road is three floors down. First door opens over the jhora; counting doors gives the basement (the second floor down is a shop with no door); count flights | `gtk04-ghar`: up the steps to the next house, "1 floor down" | `gtk-lift-counts-down`: goods lift whose buttons count from the top road: G is where you are, the door is on 1 |
| 05 | MG Marg ka Niyam (HWIK) | dropped-litter-warden-pause / rule-broken-by-jump | Dad holds a momo wrapper (drawn in his hand). Jump holding anything: it drops, the warden holds you for the fine, the sweeper sweeps you up. Walk past a bin first (one behind you); Dad picks up litter he walks over; heaped bins are full, go back to the empty one | `gtk05-shaam`: sweepers again, but the bench hop is a jump with a wrapper in hand: walk behind the stroke; `gtk05-kachra`: both bins full, no way back: wait for the bin round to empty one | `gtk-taxi-meter`: a hill taxi parked across the door till you jump and pay at the meter (bin the wrapper first) |
| 06 | Seedhi | shortcut-stairs-one-loop-low / topology | the stair down is the short cut, to the loop below, into the taxi stand; take the one-way stair up and walk down the top loop | `gtk06-chhat`: the stair up ends on a doorstep over the gully, the stair down lands on a roof garden (Tara tells the truth); `gtk06-modh`: the only stair is down, to a taxi stand: wait on the last step | `gtk-tank-overflow`: the roof tank's overflow gushes over the doorway and shoves you back |
| 07 | Badal (marathon, lives: act) | fog-hides-edge-rope-gaps / fog-edge | the cloud hides the road's edge; the kerb rope's posts are missing wherever the road is | `gtk07-thau` (shelter: rope down, wait for the cloud to lift), `gtk07-chitra` (the lifted view lies: a painted retaining wall; trust the rope), `gtk07-ghumti` (momentum: a cloud bank rolls up behind you), then `gtk07-chhaya`, `gtk07-rang`, `gtk07-bhaga` (the same three, harder) | `gtk-rope-climbs-to-door`: the door is up hidden steps in the cloud; the rope's posts go up with them |
| 08 | Ropeway (HWIK) | cabins-cross-at-midpoint / cabin-cross | two cabins and the middle station in view; each cabin only shuttles to the middle and back. Stay on and the lower one takes you back into its shed. Hop to the other as they stand side by side | `gtk08-tar`: the second span's far cabin stops below yours: step down on to it | `gtk-cabin-both-doors`: the way out is through a docked cabin whose doors open on both sides at once; inside when they shut, it takes you |
| 09 | Tsomgo | ride-animal-fixed-loop / ride-fixed-loop | the shore snow lies on thin ice; ride the yak on its loop, stay on through the photo stop (on the thin ice), off on the far bank before it turns | `gtk09-chamri`: a yak that turns back at the photo stop: jump for the bank from its back; `gtk09-chattan`: a yak that never stops till the thin far end: jump off on the move up on to the stair it passes under | `gtk-gate-yak-snowbank`: a loaded gate yak walks along the foot of the snowbank: ride it to the end and hop up to the door |
| 10 | Kanchenjunga (finale, lives: act) | finale-two-roads-count-in-fog / count-in-fog | the house of 04 in the cloud: count the flights as you go down (handrail gaps mark the stairwells) | `gtk10-thela` (litter rule + steamer: bin before you jump on), `gtk10-rassi` (rope in the cloud), `gtk10-chadhai` (litter at the foot of a stair up in the cloud), `gtk10-ghar` (one more house in the cloud, one floor down) | `gtk-viewpoint-second-floor`: doors on every floor of the viewpoint house; the exit is two floors up |

Hidden items: momo (01, 02, 05, 08), sel roti (03, 07), churpi (04, 09, 10), thukpa (06).

New death causes (`causes.ts`): `gtk-jhadu`, `gtk-bhaap`, `gtk-dhakkan`, `gtk-jhora`, `gtk-polythene`, `gtk-jaanch`,
`gtk-galat-tala`, `gtk-jurmana`, `gtk-taxi`, `gtk-khaai`, `gtk-chhat`, `gtk-badal`, `gtk-deewar`, `gtk-ropeway`,
`gtk-hiun`.

## Notes for MECHANICS / WAVE1

- Broom sweep (01): kills only a Dad on the paving (`onGround` and feet at road level) while the broom is down.
- Fall height kills in two places only: a drop of over 40 px out of a wrong door into the gully (04, 10) and over 72 px
  on to the roof garden (06). Nowhere else.
- The litter rule (05, 10): a jump with anything in hand drops it (the first airborne tick with upward speed).
- Fog (07, 10) is drawn on layer 2: over the tiles, under Dad, so it hides edges and never Dad.

## Language

Spoken Nepali is only what `GTK.md` in the city bible marks VERIFIED (Omniglot Nepali): namaste, kasto chha,
swagatam, hajur, hoina, dhanyabad, roknuhos, guhar, maile bujhina, thaha chhaina, ke cha haal khabar, badhai chha,
shubhakamana, shubha yatra, ali ali, maphi paun, yasko kati ho, ramrari khanuhola, tapain ko naam ke ho. Everything
else is plain English on both sides. The retired "Thala" joke is not used; the seventh-death line is "Seven, Dad!
Back to the first stair." No monasteries, prayer flags, chortens, the border or the army anywhere (bible Avoid list);
the backdrop has the massif, the ridge, the ropeway's line and the town on the slope.

## Fairness and times

See `/local/home/saiposh/personal/ldd-inbox/reports/cities/gtk/BUILD.md` for the full `LDD_N=80 npm run fair -- GTK`
output and the route times against par.
