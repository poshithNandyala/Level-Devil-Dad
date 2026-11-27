# GTK · Gangtok, Sikkim: design notes (module city, 10 stages)

Code: `src/game/cities/gtk/` (one file per stage, `s01.ts` .. `s10.ts`, plus the `entities.ts` kit (`Rig`), `common.ts`,
`endings.ts`, `levels.ts`, `lines.ts`, `causes.ts`, `theme.ts`, `look.ts`, `music.ts`, `backdrop.ts`, `things.ts`,
`skin.ts`, `course.ts`). Routes and plays: `tests/cities/gtk.ts`. Allocation: `docs/allocation.json` v2; every stage's
`meta` is its slot and declares its door ending.

## Stages

Route time is the scripted route's (a bot's) clear time; par is route × 1.35.

| # | Name | Family / betrayal | Room | Acts, in order | Door ending | Route |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | Namaste Gangtok (tour) | sweeper-sweeps-ground-things / sweep-arc | four MG Marg sweepers stroke the paving into their carts, Dad too; the first has a bench (be on it), the second a RESERVED bench whose owner asks you off it in front of the broom (reserve F3), the last two none: walk behind the stroke. Two ropeway shuttles to ride | (tour) | `gtk-tour-plain-door` (plain door; key reserved) | 29.7 s |
| 02 | Momo Steamer | tier-cycle-top-to-bottom / tier-cycle | the cook lifts the top tier, carries it round and slides it under, into the steam; ride it up, off at the top; lower down, the lid | `gtk02-bhatti` (no stop at the top: jump off on the way up), `gtk02-ulta` (shelf behind you: off backwards as he carries it round) | `gtk-steam-vent` | 34.9 s |
| 03 | Plastic Nahin | inspector-confiscates-thin-bags / inspector-removes | bags over the jhora: cloth (stitches) hold, thin polythene tears | `gtk03-jaanch` (inspector behind you lifts the bag you're on), `gtk03-kagaz` (handmade paper frames drying from the near end, reserve F1: cross while wet), `gtk03-ulto` (inspector coming towards you: hop over him), `gtk03-jaldi` (closing time, a quicker inspector) | `gtk-jhola-entry` | 25.8 s |
| 04 | Kun Floor? | floor-numbering-by-entrance / numbering | house entered at the top road's G; three floors down; first door over the jhora, counting doors gives the basement | `gtk04-ghar` (one floor down), `gtk04-upar` (entered from below at the lower road's G: the upper road's G is the top floor, four flights up), `gtk04-beech` (from below, two floors up) | `gtk-lift-counts-down` | 25.2 s |
| 05 | MG Marg ka Niyam (HWIK) | dropped-litter-warden-pause / rule-broken-by-jump | jump with a wrapper in hand: fined, held, swept; bin it first; heaped bins are full | `gtk05-shaam` (sweepers: no bench hop with litter), `gtk05-kachra` (wait for the bin round), `gtk05-aarakshit` (reserved benches by the sweepers, reserve F3; own cause `gtk-aarakshit`), `gtk05-chabutra` (the wrapper on the step-up bench), `gtk05-do` (two wrappers, bins with room for one), `gtk05-jhadu` (the stroke sweeps a wrapper to your feet; his cart is the bin), `gtk05-peeche` (follow the bin man going away) | `gtk-taxi-meter` | 54.9 s (floor 60: short, see LENGTH-2) |
| 06 | Seedhi | shortcut-stairs-one-loop-low / topology | the stair down is the short cut, into the taxi stand; take the stair up | `gtk06-chhat` (stair up to a doorstep; stair down to the roof garden, Tara true), `gtk06-modh` (only stair is down: wait on the last step), `gtk06-ulta` (switchback: the loop above runs back), `gtk06-adda` (stair up into a stand: modh's momentum beat), `gtk06-upar2` (two taxis in turn), `gtk06-chhatein` (roofs down the hill) | `gtk-tank-overflow` | 39.5 s (floor 60: short) |
| 07 | Badal (marathon, lives: act) | fog-hides-edge-rope-gaps / fog-edge | the kerb rope's posts are missing wherever the road is | `thau` (shelter), `chitra` (painted wall), `ghumti` (cloud bank behind), `peeche` (cloud drifting ahead: stay behind it), `dagar` (bank behind with rope and mural), `chiya` (two tea stalls, wait twice), `jaldi` (ghumti's momentum beat), `saath` (drifting ahead over the painted wall, rope true) | `gtk-rope-climbs-to-door` | 73.1 s (floor 120: short) |
| 08 | Ropeway (HWIK) | cabins-cross-at-midpoint / cabin-cross | two shuttles meet side by side at the middle; stay on and you're back in the shed | `gtk08-tar` (the other stops below), `gtk08-upar` (above), `gtk08-badli` (two middle stations, three shuttles, two changes), `gtk08-der` (the far cabin is late: ride back and up again) | `gtk-cabin-both-doors` | 52.6 s (floor 60: short) |
| 09 | Tsomgo | ride-animal-fixed-loop / ride-fixed-loop | yak over the thin shore; stay on through the photo stop | `gtk09-chamri` (jump for the bank at the photo stop), `gtk09-dophoto` (two photo stops), `gtk09-barf` (the lake ice holds: off on to it), `gtk09-chattan` (off on the move up on to a stair) | `gtk-gate-yak-snowbank` | 69.5 s |
| 10 | Kanchenjunga (finale, lives: act) | finale-two-roads-count-in-fog / count-in-fog | the house in the cloud: count the flights | `thela` (rule + steamer), `rassi` (rope), `chadhai` (stair up with a wrapper), `ghar` (house, one floor), `peechha` (bank behind + wrapper), `baadal` (drifting cloud over the mural), `jhola` (bags, inspector towards you), `antim` (last house in the cloud), `tar` (ropeway), `chauri` (yak photo stop), `stool` (the wrapper on the stool), `jhadu` (the tour's sweepers, bench then RESERVED bench) | `gtk-viewpoint-second-floor` | 91.2 s |

Every added act has at least one scripted death in `tests/cities/gtk.ts` (`actDeaths()` in MISTAKES: the act's first-timer play, and the obvious fix where it has one).

Hidden items: momo (01, 02, 05, 08), sel roti (03, 07), churpi (04, 09, 10), thukpa (06).

New causes from the length passes: `gtk-kagaz` (dried paper cracked), `gtk-aarakshit` (asked off a reserved bench in front of the broom), `gtk-photo` (off a yak standing for its photo, on the thin shore).

Round 2 cut the acts that played one rule twice with new numbers (07 `chhaya`, `rang`, `bhaga`, `dheere`, `thau2`; 06 `neeche`, `peeche`, `sawari`, `ghumao`; 05 `raat`; 08 `dobaar`; 10 `dhuaan`). Probe: `LDD_GTKPROBE=1 npx vitest run tests/cities/gtk/probe.test.ts --silent=false` (deaths, lags, acts).

New death causes (`causes.ts`): `gtk-jhadu`, `gtk-bhaap`, `gtk-dhakkan`, `gtk-jhora`, `gtk-polythene`, `gtk-jaanch`,
`gtk-galat-tala`, `gtk-jurmana`, `gtk-taxi`, `gtk-khaai`, `gtk-chhat`, `gtk-badal`, `gtk-deewar`, `gtk-ropeway`,
`gtk-hiun`.

## Notes for MECHANICS / WAVE1

- Broom sweep (01): kills only a Dad on the paving (`onGround` and feet at road level) while the broom is down.
- Fall height kills in two places only: a drop of over 40 px out of a wrong door into a house's gully (04, 10) and over
  72 px on to the roof garden (06 `gtk06-chhat`). Nowhere else.
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
output and the route times against par; round 2's N=80 runs and probe tables are in `LENGTH-2.md` there.

Round 3 (`LENGTH-3.md`) made every checkpoint calm. `tests/cpsafe.test.ts -t GTK` passes idle, run and tap-jump at
lag 0/6/12 on all ten stages. It got there by widening the banks before the thin shore in 09 and 10 `chauri`, moving
03 `kagaz`'s jhora 2 tiles on, taking the 05 and 10 `peechha` checkpoints empty-handed, pulling the 01 tour
checkpoints clear of a tap-jump into the brooms, and adding checkpoints on the 02 shelf and the `ulta` walkway.
Replay to a trap is still over 7.5 s on 02, 05, 06, 07, 08, 09 and 10. Each of those is one ride or one cloud wait,
and the probe's `replay` test names the stretch.
