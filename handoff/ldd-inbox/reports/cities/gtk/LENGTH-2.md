# GTK · Gangtok: length round 2

- Worktree `/local/home/saiposh/personal/ldd-wt/gtk`, branch `city/gtk`. develop `6172e21` merged in (merge commit
  `04a885c`, no rebase). Tip: `a287753`.
- Only GTK's own files change from the merge-base with develop: `src/game/cities/gtk/`, `tests/cities/gtk.ts`,
  `tests/cities/gtk/probe.test.ts` (new, the GTK probe), `docs/cities/GTK.md`. Not pushed, no version bump.
- **The short version.** Most of the first length pass was the same rule played again with new numbers. This round
  cuts every one of those acts. Where a repeat is kept, it is the one short momentum beat its hazard is allowed. I
  built one act (the 01 sweepers as a finale callback) and two new death causes. I did not build new rules for 05, 06,
  07 and 08 (see "Still short, and why"), so **05, 06, 07 and 08 are now under their floors**. 10 is over its floor
  again, and 01-04 and 09 are unchanged.

## Route times (scripted route, a bot) against the floors

| Stage | Floor | Round 1 (c83c0b7) | Now | Par (×1.35) | Change |
| --- | --- | --- | --- | --- | --- |
| GTK-01 tour | 25-35 s | 29.7 s | 29.7 s | 40 | checkpoints moved clear of the brooms |
| GTK-02 | 25-45 s | 34.9 s | 34.9 s | 47 | none |
| GTK-03 | 25-45 s | 25.8 s | 25.8 s | 35 | none (`jaldi` kept as `jaanch`'s momentum beat) |
| GTK-04 | 25-45 s | 25.2 s | 25.2 s | 34 | none |
| GTK-05 (HWIK) | ≥ 60 s | 70.9 s | **54.9 s** | 74 | `raat` cut; `aarakshit`'s bench death has its own cause |
| GTK-06 | ≥ 60 s | 68.2 s | **39.5 s** | 53 | `neeche`, `peeche`, `sawari`, `ghumao` cut; a checkpoint in `ulta` |
| GTK-07 (marathon) | ≥ 120 s | 122.8 s | **73.1 s** | 99 | `chhaya`, `rang`, `bhaga`, `dheere`, `thau2` cut; checkpoints in `peeche` and `saath` |
| GTK-08 (HWIK) | ≥ 60 s | 64.7 s | **52.6 s** | 71 | `dobaar` cut; `der` starts on `badli`'s floor |
| GTK-09 | ≥ 60 s | 69.5 s | 69.5 s | 94 | the second photo-stop death has its own cause |
| GTK-10 (finale) | ≥ 90 s | 100.3 s | 91.2 s | 123 | `dhuaan` cut; `gtk10-jhadu` added |

## What was cut, and why

Each cut act played a rule its stage had already taught, with new numbers and the same answer. The time is the
act's share of the old route.

| Stage | Cut | It repeated | Same answer | Time |
| --- | --- | --- | --- | --- |
| 07 | `gtk07-chhaya` | `thau` (wait under the awning for the lift) | wait, look, go | 9.2 s |
| 07 | `gtk07-rang` | `chitra` (painted wall, the rope tells) | jump where the rope stops | 3.7 s |
| 07 | `gtk07-bhaga` | `ghumti` (bank behind, keep moving); "the three again, harder" by its own description | run and jump | 4.6 s |
| 07 | `gtk07-dheere` | `peeche` (cloud drifting ahead) | stay behind it | 16.1 s |
| 07 | `gtk07-thau2` | `chiya` (two stalls, wait twice) | wait at each stall | 16.1 s |
| 06 | `gtk06-ghumao` | `ulta` (switchback) | walk back along the loop above | 12.1 s |
| 06 | `gtk06-sawari` | `modh` (wait on the last step) | wait out the jeep | 5.4 s |
| 06 | `gtk06-neeche` | `modh` and the room (stair down into a stand) | wait, then on | 4.7 s |
| 06 | `gtk06-peeche` | `ulta` (the way on is behind you) | turn back | 6.3 s |
| 05 | `gtk05-raat` | `kachra` (wait for the bin round) | wait by the full bin | 15.7 s |
| 08 | `gtk08-dobaar` | `badli` (two changes on a chain of three) | change twice at the stations | 12.1 s |
| 10 | `gtk10-dhuaan` | `baadal`, the drifting cloud already in the finale | stay behind it | 13.4 s |

## Added act

| Stage | Act | The player's decision | Family | Closest shipped idea | A2 / A3 | NAIVE · FIX |
| --- | --- | --- | --- | --- | --- | --- |
| 10 | `gtk10-jhadu` | "Get up on the free bench while the broom strokes, but at the bench with the RESERVED card, wait outside the stroke and walk through behind it." | GTK-01 sweeper-sweeps-ground-things (finale callback; the finale may only call back GTK's own ideas) | GTK-01 itself and the treadmill kit (01 OWNS the sweep). It is a callback, not a new rule | A2: the bench works at the first sweeper. A3: the second bench is reserved, and its owner asks you down in front of the broom | walk on: `gtk-jhadu` @ 10271 · bench at each sweeper: `gtk-aarakshit` @ 10838 |

Its intro line is "Hajur! Up on the benches, Dad!" (Tara lies: the second is reserved). No hidden item: 10 keeps
its churpi.

New causes, so that two deaths with different lessons no longer read the same:
- `gtk-aarakshit`: "That bench was reserved. Its owner asked you down, right in front of the broom." The broom
  reports it when it takes Dad within 4 s of a reserved bench's owner asking him off (`s01.ts`). Used by 05
  `aarakshit` and 10 `jhadu`.
- `gtk-photo`: "Off the yak for the photo, and the shore it stopped on is thin ice." The thin shore reports it
  when Dad dies within 4 tiles of a yak standing for its photo (`s09.ts`). Used by 09 `dophoto`.

## Probe a: identical windows, per act

An act is **new** if its decision differs from every earlier act in the stage, **momentum** if it is the one
short replay of a hazard (no stop, 5 s or less), and **callback** in the finale. "Windows" counts the windows that
are the same once the first momentum beat is behind you.

| Stage | Act | Windows | What the player reads differently here | Verdict |
| --- | --- | --- | --- | --- |
| 01 | tour, 4 sweepers | 1 each | bench at the first; RESERVED bench at the second (F3); walk behind at the last two | tour (teaches) |
| 02 | room | 1 | ride the top tier up, step off at the top | new |
| 02 | `gtk02-bhatti` | 1 | no hold at the top: jump off on the way up | new |
| 02 | `gtk02-ulta` | 1 | the shelf is behind you: off backwards as he carries it round | new |
| 03 | room | 1 | cloth bags hold, thin polythene tears (stitches) | new |
| 03 | `gtk03-jaanch` | 1 | the inspector behind you lifts the bag you're on | new |
| 03 | `gtk03-kagaz` | 1 | paper frames dry from the near end: cross while wet (F1) | new |
| 03 | `gtk03-ulto` | 1 | the inspector comes towards you: hop over him | new |
| 03 | `gtk03-jaldi` | 1 | `jaanch` again, a quicker inspector, 4.8 s, no stop | momentum |
| 04 | room | 1 | count from the door you came in; the shop floor has no door | new |
| 04 | `gtk04-upar` | 1 | entered from below: the upper road's G is the top floor | new |
| 04 | `gtk04-beech` | 1 | from below again, but only two floors: the last house's count goes stale | new (stale count; the bible's act is "three houses, each a different count") |
| 05 | room | 1 | jump with a wrapper and you're fined: bin it first | new (WTF beat) |
| 05 | `gtk05-shaam` | 1 | no bench hop over a broom with litter in hand | new |
| 05 | `gtk05-kachra` | 1 | a heaped bin is full: wait for the bin round | new |
| 05 | `gtk05-aarakshit` | 1 | reserved benches by the sweepers (F3) | new |
| 05 | `gtk05-chabutra` | 1 | the only step up has a wrapper on it | new |
| 05 | `gtk05-do` | 1 | two wrappers, bins with room for one each | new |
| 05 | `gtk05-jhadu` | 1 | the stroke sweeps a wrapper to your feet; his cart is the bin | new |
| 05 | `gtk05-peeche` | 1 | follow the bin man going away, bin in the one he just emptied | new |
| 06 | room | 1 | the short cut down lands in the taxi stand: take the stair up | new |
| 06 | `gtk06-chhat` | 1 | stair up ends on a doorstep; the stair down to the roof garden is right (Tara true) | new |
| 06 | `gtk06-modh` | 1 | the only stair is down: wait on the last step | new |
| 06 | `gtk06-ulta` | 1 | switchback: the loop above runs back the way you came | new |
| 06 | `gtk06-adda` | 1 | `modh`'s wait, at the top of a stair up, 4.4 s | momentum |
| 06 | `gtk06-upar2` | 1 | two taxis back out in turn: the first in is not the all-clear | new (count of two) |
| 06 | `gtk06-chhatein` | 1 | roofs down the hill: hop each gap to the gully | new |
| 07 | room | 1 | fog hides the road's end; the kerb rope shows it | new |
| 07 | `gtk07-thau` | 1 | shelter: wait under the awning for the cloud to lift | new |
| 07 | `gtk07-chitra` | 1 | the lift shows a painted road: trust the rope | new |
| 07 | `gtk07-ghumti` | 1 | a cloud bank rolls up behind: keep moving | new |
| 07 | `gtk07-peeche` | 1 | the cloud drifts ahead: stay behind it | new |
| 07 | `gtk07-dagar` | 1 | bank behind, with rope and mural together | new (mixed read) |
| 07 | `gtk07-chiya` | 1 | two stalls on one stretch: the cloud comes back, wait again | new (stale all-clear) |
| 07 | `gtk07-jaldi` | 1 | `ghumti` again, quicker, 4.6 s run-through | momentum |
| 07 | `gtk07-saath` | 1 | drifting cloud over the painted wall, rope true | new (mixed read) |
| 08 | room | 1 | stay on and you're back in the shed: hop across at the middle | new (WTF beat) |
| 08 | `gtk08-tar` | 1 | the other cabin stops below | new |
| 08 | `gtk08-upar` | 1 | the other stops above | new |
| 08 | `gtk08-badli` | 1 | two stations, three shuttles, two changes | new |
| 08 | `gtk08-der` | 1 | the far cabin is late: ride back down and up again | new |
| 09 | room | 1 | ride the yak over the thin shore, through the photo | new |
| 09 | `gtk09-chamri` | 1 | the yak turns back short: jump for the bank at the photo stop | new |
| 09 | `gtk09-dophoto` | 1 | two photo stops: one photo isn't the end | new (stale count) |
| 09 | `gtk09-barf` | 1 | the lake ice holds; the white shore is thin | new |
| 09 | `gtk09-chattan` | 1 | off on the move, up on to a stair | new |
| 10 | `thela`, `rassi`, `chadhai`, `ghar`, `peechha`, `baadal`, `jhola`, `antim`, `tar`, `chauri`, `stool`, `jhadu` | 1 each | callbacks of 05+02, 07, 06+05, 04, 07+05, 07, 03, 04, 08, 09, 05, 01, in a new order; the twist is counting floors in the cloud | callback |

No act has a second identical window after its momentum beat. No stage now plays one rule twice with new numbers,
except the three labelled momentum beats (03 `jaldi`, 06 `adda`, 07 `jaldi`), each 5 s or less.

## Probe b: NAIVE vs FIX, cause @ tick (LDD_GTKPROBE, lag 0)

For the room, NAIVE and FIX are the stage's scripted plays. For each act, they are its scripted deaths in MISTAKES
(`actDeaths()`). "Pass" means both cause and tick differ, or the act carries a reason why it has one play.

| Stage | Act | Play 1: cause @ tick | Play 2: cause @ tick | Verdict |
| --- | --- | --- | --- | --- |
| 01 | (room) | NAIVE: `gtk-jhadu` @ 784 | - | tour: one teaching play; NAIVE and the bench-habit mistake both meet the broom (the reserved-bench death is 05/10's `gtk-aarakshit`) |
| 01 | (room) | the bench works, so walk on at the second sweeper: `gtk-jhadu` @ 1139 | - | tour: one teaching play; NAIVE and the bench-habit mistake both meet the broom (the reserved-bench death is 05/10's `gtk-aarakshit`) |
| 02 | (room) | NAIVE: `gtk-bhaap` @ 1131 | FIX: `gtk-dhakkan` @ 458 | pass: cause and tick differ |
| 02 | gtk02-ulta | ride the top tier and stay on: `gtk-bhaap` @ 3493 | let the top tier go, get on the second: `gtk-dhakkan` @ 2820 | pass: cause and tick differ |
| 02 | gtk02-bhatti | wait on the top tier for the hold at the top: `gtk-bhaap` @ 2143 | - | one play: the tier never holds at the top, so the only mistake is to wait for it |
| 03 | (room) | NAIVE: `gtk-polythene` @ 215 | FIX: `gtk-jaanch` @ 1532 | pass: cause and tick differ |
| 03 | gtk03-kagaz | stop on a frame to look: `gtk-kagaz` @ 1472 | - | one play: stopping is the only way to let a sheet dry under you |
| 03 | gtk03-ulto | on to every bag: `gtk-polythene` @ 1844 | - | one play: the inspector towards you is the hop; the cloth-only play dies as `jaanch` in 03's room |
| 03 | gtk03-jaldi | a look at the stitches on each bag: `gtk-jaanch` @ 2534 | - | momentum beat: one play |
| 04 | (room) | NAIVE: `gtk-galat-tala` @ 347 | FIX: `gtk-jhora` @ 823 | pass: cause and tick differ |
| 04 | gtk04-upar | out of the first door you meet: `gtk-jhora` @ 1356 | three flights up, as in the first house: `gtk-galat-tala` @ 1784 | pass: cause and tick differ |
| 04 | gtk04-beech | out of the first door you meet: `gtk-jhora` @ 2349 | all the way up to G, as in the last house: `gtk-galat-tala` @ 3003 | pass: cause and tick differ |
| 05 | (room) | NAIVE: `gtk-jurmana` @ 213 | FIX: `gtk-jurmana` @ 458 | **same cause** (`gtk-jurmana`), different tick and play: jump with the wrapper; bin it but in a full bin. The fine is the one thing 05 kills with (HWIK, one rule) |
| 05 | gtk05-peeche | straight on, wrapper in hand: `gtk-jurmana` @ 5977 | - | one play: the only mistake is to pass him with the wrapper |
| 05 | gtk05-do | straight on, wrapper in hand: `gtk-jurmana` @ 4275 | - | one play: one wrapper binned, one still in hand |
| 05 | gtk05-kachra | straight on, wrapper in hand: `gtk-jurmana` @ 1762 | - | one play: the heaped bin is the only bin |
| 05 | gtk05-chabutra | up on the bench and on to the bed: `gtk-jurmana` @ 4120 | - | one play: the wrapper is picked up by standing on the step |
| 05 | gtk05-jhadu | behind the stroke, then on with what it brought you: `gtk-jurmana` @ 5116 | - | one play: going behind the stroke is right, carrying on with what it swept is the death |
| 05 | gtk05-aarakshit | walk on past the sweeper: `gtk-jhadu` @ 2833 | up on the bench, as at the tour: `gtk-aarakshit` @ 3191 | pass: cause and tick differ |
| 06 | (room) | NAIVE: `gtk-taxi` @ 188 | FIX: `gtk-chhat` @ 610 | pass: cause and tick differ |
| 06 | gtk06-modh | straight on, past the stand: `gtk-taxi` @ 1030 | - | one play: the stair down is the only way, so the only mistake is not to wait |
| 06 | gtk06-ulta | straight on, past the stand: `gtk-taxi` @ 1530 | - | one play: walking on past the stand |
| 06 | gtk06-adda | straight on, past the stand: `gtk-taxi` @ 2979 | - | momentum beat: one play |
| 06 | gtk06-upar2 | go as soon as the first taxi is in: `gtk-taxi` @ 3663 | - | one play: going after the first taxi |
| 06 | gtk06-chhatein | walk off the roof without a hop: `gtk-khaai` @ 4205 | - | one play: walking off a roof edge without the hop |
| 07 | (room) | NAIVE: `gtk-badal` @ 129 | FIX: `gtk-deewar` @ 2006 | pass: cause and tick differ |
| 07 | gtk07-peeche | catch the cloud up and walk on blind: `gtk-badal` @ 2565 | - | one play: catching the cloud up |
| 07 | gtk07-chiya | no stop at the stall: straight on into the cloud: `gtk-badal` @ 4665 | wait once, then walk on blind past the second stall: `gtk-badal` @ 5677 | **same cause** (`gtk-badal`), different tick and play: no stop; wait once only. The cloud edge is 07's one hazard |
| 07 | gtk07-jaldi | walk, don’t jump: the holes are right there: `gtk-badal` @ 6493 | - | momentum beat: one play |
| 07 | gtk07-saath | behind the cloud, the road looks whole: walk it: `gtk-deewar` @ 7069 | - | one play: walking the painted road |
| 08 | (room) | NAIVE: `gtk-ropeway` @ 910 | - | HWIK: the WTF beat has one play, no FIX by design |
| 08 | gtk08-upar | jump for the higher cabin before they meet: `gtk-khaai` @ 2291 | - | one play: jumping before they meet |
| 08 | gtk08-badli | jump for the next cabin on the way: `gtk-khaai` @ 3293 | changed once, then jump again on the way to the second station: `gtk-khaai` @ 3716 | **same cause** (`gtk-khaai`), different tick and play: jump early at the first; change once and jump early at the second |
| 08 | gtk08-der | the far cabin isn’t there: jump for the station: `gtk-khaai` @ 4863 | - | one play: jumping for the empty middle |
| 09 | (room) | NAIVE: `gtk-hiun` @ 62 | FIX: `gtk-hiun` @ 98 | **same cause** (`gtk-hiun`), different tick and play: walk the shore; get off when it stops (its first stop is on the shore too) |
| 09 | gtk09-dophoto | walk across the shore: `gtk-hiun` @ 2807 | stay on for one photo, off at the second: surely that’s the end: `gtk-photo` @ 4139 | pass: cause and tick differ |
| 09 | gtk09-barf | stay off the lake ice: walk the snow: `gtk-hiun` @ 4919 | - | one play: walking the white snow |
| 09 | gtk09-chattan | walk across the shore: `gtk-hiun` @ 6528 | ride it to the end, as on the first yak: `gtk-hiun` @ 7849 | **same cause** (`gtk-hiun`), different tick and play: walk the shore; ride to the thin far end |
| 10 | (room) | NAIVE: `gtk-galat-tala` @ 347 | FIX: `gtk-jurmana` @ 996 | pass: cause and tick differ |
| 10 | gtk10-peechha | the bin ahead is full: jump the holes anyway: `gtk-jurmana` @ 3204 | - | callback: one play |
| 10 | gtk10-jhola | on to every bag: `gtk-polythene` @ 3845 | cloth only, straight at him as in Lal Market: `gtk-jaanch` @ 4321 | pass: cause and tick differ |
| 10 | gtk10-baadal | behind the cloud the road looks whole: walk it: `gtk-deewar` @ 4382 | - | callback: one play |
| 10 | gtk10-antim | straight on, out of the first door: `gtk-galat-tala` @ 6158 | count the doors: the basement: `gtk-jhora` @ 6634 | pass: cause and tick differ |
| 10 | gtk10-tar | jump for the other cabin before they meet: `gtk-khaai` @ 6821 | - | callback: one play |
| 10 | gtk10-chauri | walk across the shore: `gtk-hiun` @ 7479 | off the yak when it stops: `gtk-hiun` @ 7531 | **same cause** (`gtk-hiun`), callback of 09: walk the shore; off when it stops |
| 10 | gtk10-jhadu | walk on past the sweeper: `gtk-jhadu` @ 10271 | up on the bench at each sweeper, as at the first: `gtk-aarakshit` @ 10838 | pass: cause and tick differ |
| 10 | gtk10-stool | up on the stool and straight on to the steamer: `gtk-jurmana` @ 9296 | - | callback: one play |

Six rows (bold) die of the same cause twice, on different ticks and from different plays. Each is a stage with one way to die (05's fine, 07's cloud edge, 08's gorge, 09's thin ice), where the second play teaches a different read of that one hazard. I split two pairs where the lesson had a name of its own (`gtk-aarakshit`, `gtk-photo`), and did not invent causes for the rest.

## Checkpoints at human lag (lag 0, 6 and 12)

From `tests/cities/gtk/probe.test.ts` (`lags`): the route at each lag, its checkpoints, the longest stretch, and
the worst replay to a trap. To find the worst replay, the probe branches off the route every 0.25 s three ways (stop,
run on, run and jump) and measures death tick minus the respawn checkpoint's tick. It also tries idle 4 s, run
0.3 s then idle, and tap-jump then idle from every checkpoint, and records any moving or switching hazard within 3.5
tiles of Dad at the tick a checkpoint is taken ("hot capture"). GTK's hazards run on their own cycles (no position
triggers), so the trigger rule is checked as that hot capture.

| Stage | Lag | Route | Checkpoints | Longest stretch (bar 25 s) | Worst replay (bar 8 s) | Idle / run 0.3 s / tap-jump fails | Hot captures |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | 0 | 29.7s | 5 | 12.3s to cp2 | 6.3s cp2 stop@24.5s gtk-jhadu | none | none |
| 01 | 6 | 29.8s | 5 | 12.1s to cp2 | 6.0s cp2 stop@24.8s gtk-jhadu | none | none |
| 01 | 12 | 29.8s | 5 | 11.9s to cp2 | 6.1s cp2 stop@24.8s gtk-jhadu | none | none |
| 02 | 0 | 34.9s | 4 | 13.4s to cp2 | **14.3s** cp1 run+jump@29.8s gtk-bhaap | none | none |
| 02 | 6 | 35.3s | 4 | 13.7s to cp2 | **14.6s** cp1 run+jump@30.5s gtk-bhaap | none | none |
| 02 | 12 | 36.1s | 4 | 14.4s to cp2 | **15.2s** cp1 run+jump@31.0s gtk-bhaap | none | none |
| 03 | 0 | 25.8s | 6 | 5.9s to cp3 | 7.1s cp0 stop@7.5s gtk-jaanch | **1**: cp1 tap-jump+idle: gtk-jhora +0.42s | cp0 gtk-jhora 3.4t; cp1 gtk-jhora 2.5t; cp2 gtk-jhora 3.4t |
| 03 | 6 | 29.8s | 6 | 7.5s to cp3 | **8.1s** cp2 run+jump@22.3s gtk-jhora | **1**: cp1 tap-jump+idle: gtk-jhora +0.42s | cp1 gtk-jhora 2.5t |
| 03 | 12 | 29.6s | 6 | 8.0s to cp3 | **8.4s** cp2 run+jump@22.8s gtk-jhora | **1**: cp1 tap-jump+idle: gtk-jhora +0.42s | cp1 gtk-jhora 2.5t |
| 04 | 0 | 25.2s | 5 | 8.3s to cp2 | 6.4s cp1 run on@14.5s gtk-galat-tala | none | none |
| 04 | 6 | 26.5s | 5 | 8.8s to cp2 | 6.8s cp1 run on@15.3s gtk-galat-tala | none | none |
| 04 | 12 | 25.9s | 5 | 8.0s to cp2 | 6.4s cp1 run on@15.3s gtk-galat-tala | none | none |
| 05 | 0 | 54.9s | 11 | 10.9s to cp5 | **11.7s** cp4 run+jump@21.8s gtk-jhadu | **3**: cp1 tap-jump+idle: gtk-jurmana +1.52s; cp2 run 0.3s+idle: gtk-jhadu +0.22s; cp2 tap-jump+idle: gtk-jurmana +1.52s | cp2 gtk-jhadu 3.1t |
| 05 | 6 | 56.3s | 11 | 11.1s to cp5 | **11.7s** cp4 run+jump@20.5s gtk-jhadu | **3**: cp1 tap-jump+idle: gtk-jurmana +1.52s; cp2 run 0.3s+idle: gtk-jhadu +0.22s; cp2 tap-jump+idle: gtk-jurmana +1.52s | cp2 gtk-jhadu 3.1t |
| 05 | 12 | 58.1s | 11 | 11.2s to cp5 | **11.7s** cp4 run+jump@20.8s gtk-jhadu | **3**: cp1 tap-jump+idle: gtk-jurmana +1.52s; cp2 run 0.3s+idle: gtk-jhadu +0.22s; cp2 tap-jump+idle: gtk-jurmana +1.52s | cp2 gtk-jhadu 3.1t |
| 06 | 0 | 39.5s | 9 | 8.8s to cp4 | **9.7s** cp3 run+jump@21.5s gtk-taxi | none | none |
| 06 | 6 | 40.4s | 9 | 9.2s to cp4 | **10.2s** cp3 run+jump@24.5s gtk-taxi | none | none |
| 06 | 12 | 40.8s | 9 | 9.2s to cp4 | **9.8s** cp3 run+jump@22.3s gtk-taxi | none | none |
| 07 | 0 | 73.1s | 13 | 8.6s to cp1 | **9.3s** cp6 run+jump@46.5s gtk-badal | none | none |
| 07 | 6 | 73.4s | 13 | 8.7s to cp1 | **8.2s** cp0 stop@11.5s gtk-badal | none | none |
| 07 | 12 | 73.8s | 13 | 8.7s to cp1 | **9.3s** cp6 run+jump@46.8s gtk-badal | none | none |
| 08 | 0 | 52.6s | 6 | 14.7s to cp4 | **13.5s** cp3 run on@49.3s gtk-khaai | none | none |
| 08 | 6 | 52.9s | 6 | 14.7s to cp4 | **13.5s** cp3 run on@49.5s gtk-khaai | none | none |
| 08 | 12 | did not win in this probe's lag model (route did not win: stuck: ride up, cross at the middle, ride up to the far deck) | | | | | |
| 09 | 0 | 69.5s | 6 | 17.8s to cp2 | **18.7s** cp1 run+jump@40.8s gtk-hiun | **8**: cp0 run 0.3s+idle: gtk-hiun +0.34s; cp0 tap-jump+idle: gtk-hiun +0.46s; cp1 run 0.3s+idle: gtk-hiun +0.34s; cp1 tap-jump+idle: gtk-hiun +0.46s; cp2 run 0.3s+idle: gtk-hiun +0.34s; cp2 tap-jump+idle: gtk-hiun +0.46s; cp3 run 0.3s+idle: gtk-hiun +0.34s; cp3 tap-jump+idle: gtk-hiun +0.46s | none |
| 09 | 6 | 70.3s | 6 | 17.5s to cp2 | **18.2s** cp1 run+jump@40.5s gtk-hiun | **7**: cp0 run 0.3s+idle: gtk-hiun +0.34s; cp0 tap-jump+idle: gtk-hiun +0.46s; cp1 run 0.3s+idle: gtk-hiun +0.34s; cp1 tap-jump+idle: gtk-hiun +0.46s; cp2 run 0.3s+idle: gtk-hiun +0.29s; cp3 run 0.3s+idle: gtk-hiun +0.34s; cp3 tap-jump+idle: gtk-hiun +0.46s | cp2 gtk-hiun 2.5t |
| 09 | 12 | 71.2s | 6 | 17.6s to cp2 | **18.1s** cp1 run+jump@40.8s gtk-hiun | **5**: cp0 run 0.3s+idle: gtk-hiun +0.29s; cp1 run 0.3s+idle: gtk-hiun +0.34s; cp1 tap-jump+idle: gtk-hiun +0.46s; cp2 run 0.3s+idle: gtk-hiun +0.29s; cp3 run 0.3s+idle: gtk-hiun +0.29s | cp0 gtk-hiun 2.5t; cp2 gtk-hiun 2.5t; cp3 gtk-hiun 2.5t |
| 10 | 0 | 91.7s | 14 | 12.8s to cp10 | **11.0s** cp6 stop@46.3s gtk-deewar | **3**: cp4 tap-jump+idle: gtk-jurmana +1.52s; cp9 run 0.3s+idle: gtk-hiun +0.34s; cp9 tap-jump+idle: gtk-hiun +0.46s | cp5 gtk-jhora 3.4t |
| 10 | 6 | 92.8s | 14 | 12.8s to cp10 | **10.8s** cp6 run on@46.5s gtk-deewar | **3**: cp4 tap-jump+idle: gtk-jurmana +1.52s; cp9 run 0.3s+idle: gtk-hiun +0.34s; cp9 tap-jump+idle: gtk-hiun +0.46s | cp5 gtk-jhora 3.4t |
| 10 | 12 | 94.5s | 14 | 12.8s to cp10 | **10.9s** cp6 run on@47.8s gtk-deewar | **3**: cp4 tap-jump+idle: gtk-jurmana +1.52s; cp9 run 0.3s+idle: gtk-hiun +0.34s; cp9 tap-jump+idle: gtk-hiun +0.46s | cp5 gtk-jhora 3.4t |

Read it this way:
- **Longest stretch: every stage at every lag is under 25 s** (the longest is 09 at 17.8 s).
- **Replay to a trap is 8 s or less on 01, 03 (8.4 s at lag 12), 04 and 07 (9.3 s).** It is over on 02, 05, 06, 08, 09 and 10, each where the stretch is one ride or one wait with no ground for a checkpoint (see "Still short").
- **Idle, run and tap-jump: 01, 02, 04, 06, 07 and 08 pass.** 03 cp1 fails a tap-jump, which lands in the jhora at the first bag. 05 cp1 and cp2 fail because Dad holds a wrapper there and the tap-jump drops it, and cp2 also fails a 0.3 s run, which ends in the sweeper's stroke. 09 fails at every act start. 10's cp4 (wrapper in hand) and cp9 (the yak act's start) fail the same way.
- **Hot captures** count only hazards that move or switch: 03's bag jhora (the bags are moving rigs), 05 cp2 (the broom 3.1 tiles away), 09's thin shore and 10 cp5.
- **08 at lag 12:** the probe's lag model (TVM's `lagged`, which holds a jump late for its full length) cannot get the unchanged room's first ropeway ride to win. `npm run fair` has 08 at 100% at 12 ticks over 80 runs.

This round fixed: 01's four checkpoints, moved 2-5 tiles further from each sweeper, so all of 01's idle fails are gone (there were six). 06 and 07 got a checkpoint in each long stretch: 06 from 12.3 s to 8.8 s and 13.1 s replay to 9.7 s; 07 from 13.5 s to 8.6 s and 13.7 s replay to 9.3 s.

## Fairness, LDD_N=80

| Stage | File | 6t / 12t / 18t | Stretches at 0-12t (bar 95% each) | Lowest stretch |
| --- | --- | --- | --- | --- |
| GTK-01 | `fair-N80-c.txt` | 6t 100% 12t 100% 18t 100% | s0 100%  s1 100%  s2 100%  s3 100%  door 100% | 100% |
| GTK-02 | `fair-N80-a.txt` | 6t 100% 12t 100% 18t 100% | s0 100%  s1 100%  s2 100%  door 100% | 100% |
| GTK-03 | `fair-N80-a.txt` | 6t 100% 12t 100% 18t 98% | s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  door 100% | 100% |
| GTK-04 | `fair-N80-a.txt` | 6t 100% 12t 100% 18t 100% | s0 100%  s1 100%  s2 100%  s3 100%  door 100% | 100% |
| GTK-05 | `fair-N80-b.txt` | 6t 100% 12t 100% 18t 100% | s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  s6 100%  s7 100%  s8 100%  s9 100%  s10 100%  door 100% | 100% |
| GTK-06 | `fair-N80-c.txt` | 6t 100% 12t 100% 18t 76% | s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  s6 100%  s7 100%  door 100% | 100% |
| GTK-07 | `fair-N80-c.txt` | 6t 100% 12t 100% 18t 76% | s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  s6 100%  s7 100%  s8 100%  s9 100%  s10 100%  s11 100%  door 100% | 100% |
| GTK-08 | `fair-N80-b.txt` | 6t 100% 12t 100% 18t 100% | s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  door 100% | 100% |
| GTK-09 | `fair-N80-a.txt` | 6t 100% 12t 100% 18t 93% | s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  door 100% | 100% |
| GTK-10 | `fair-N80-b.txt` | 6t 100% 12t 100% 18t 76% | s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  s6 100%  s7 100%  s8 100%  s9 100%  s10 100%  s11 100%  s12 100%  door 100% | 100% |

Every stage is at 100% at average lag (12 ticks; bar 90%), and every stretch is at 100% (bar 95%). The runs: `fair-N80-a.txt` (01-04, 08, 09, before the round's changes to 08), `fair-N80-b.txt` (01, 05, 06, 07, 08, 10, after the cuts), `fair-N80-c.txt` (01, 06, 07, after their checkpoints moved). Each stage's row is from its last run after its last gameplay change. 09's only later change is a death cause, which fairness does not read. Relaxed lag (18 ticks) is 76% on 06, 07 and 10. That is not the bar.

## Tests and proofs

- `npx tsc --noEmit`: clean.
- Full `npm test` on the final content: **18 files passed, 1618 tests passed, 0 failed** (14 env-gated files
  skipped, as on develop). GTK is on no allow-list. The run before it had one failure, mine: 09's
  second photo-stop mistake still expected `gtk-hiun` after it became `gtk-photo`. I fixed it in `a287753`.
- `node scripts/flows.mjs`: **no errors** (`flows=0`). A first run without `CHROME_PATH` could not start a browser and
  is not counted.
- The GTK probe: `LDD_GTKPROBE=1 [LDD_IDS=GTK-06,...] npx vitest run tests/cities/gtk/probe.test.ts --silent=false`
  (`deaths` is probe b, `lags` is the three-lag table, `acts` is each act's time on the route). Probe a is the table
  above, by reading each act's decision.

## Screenshot sheets

New sheets for every changed stage (01, 05, 06, 07, 08, 09, 10) were regenerated on the final content and copied to
`/local/home/saiposh/personal/ldd-inbox/reports/cities/gtk/shots/`. 02-04 are unchanged from round 1 and their sheets
there still hold. I read all seven new sheets:
- No deaths on any route, and every act's Tara line shows.
- 10's new `jhadu` shows at 86 s with "Hajur! Up on the benches, Dad!", the MG MARG sign, both sweepers and the two
  benches.
- 08's `der` now starts level with `badli`'s far station, and the ride reads.
- 06 and 07 show their shorter act lists, with no gaps where the cut acts were.

Still there: the shared "Found it!" popup over the title card in the first frames (05, 06, 07, 10). It is engine
text, not GTK's.

## Still short, and why

- **07, 73.1 s of 120.** Once its five repeats are cut, the marathon has seven fog decisions and one momentum
  beat. I looked for more in GTK's bible and reserves:
  - Concept 6, churpi: everything crumbles but the dull block. That is the crumble kit with a tell (PAT's
    `khokhla` failed QA as that).
  - Concept 9, jaivik: a packet in hand sets a dog on you. That is "item in hand changes the rules", which 05
    already is, and it is close to SVP-04.
  - Concept 11, sel roti: the bible itself calls it too close to RNC-02.
  - The landslide and weather-swing hooks: in the fog, each became a fake floor with a tell (rope posts leaning
    out where the road has slid away; a white cloud floor level with the road).

  So I built none of these: each would put a shipped decision back in and call it new. Reaching 120 s needs
  about 47 s more of fog decisions the game does not already ask. That is a design question for the bible, not a
  build one.
- **06, 39.5 s of 60.** Its four cut acts were all the taxi stand or the switchback again. The bible's other
  stair trap ("half-way down, the next flight is someone's front step") is `chhat`, already built. I found no third
  topology rule that is not "wait for the taxi" or "go back".
- **05, 54.9 s of 60 (HWIK).** `raat` was `kachra` slowed down. MG Marg's other rules (no spitting, no smoking, no
  vehicles) each became "ride a cart and get off before the line" or another litter rule, so I built none.
- **08, 52.6 s of 60 (HWIK).** `dobaar` was `badli` again. The bible has the ropeway as "backdrop only" (cables
  taken), so 08 is already GTK-F2. I found no third cabin rule that is not "hop across when they meet".
- **03 at 25.8 s and 10 at 91.2 s** hold their floors only through labelled momentum beats (03) and the new
  callback (10).
- **Replay over 8 s** where the stretch is one ride with no ground to put a checkpoint on: 02 (a steamer ride),
  08 (cabins), 09 (yak loops), 10 `jhola` (bags over the jhora) and `chauri` (yak). And 07 `thau` and `chiya`,
  where the wait for the cloud is itself the stretch. Splitting those needs the acts re-laid with a bank in the
  middle.
- **09's checkpoints fail "run 0.3 s then idle".** Each act-start checkpoint is 2.5 tiles before the thin shore,
  and a 0.3 s run carries Dad on to it. The fix is a wider bank at each act start, which moves every yak and its
  route. I did not do it this round.
- **05's room checkpoints and 10's cp4 fail "tap-jump then idle"** because Dad holds a wrapper there, and any
  jump with litter is the stage's rule. The fix is checkpoints only where his hand is empty.

## Process

- Background runs this round were started with their PIDs recorded in `/tmp/gtk-pids.txt` and none was killed.
  No pattern kill was used.
- The note about a `pkill -f "fair.test.ts"` at 02:19 UTC: I ran no `pkill` and no `kill` in this round (every
  command is in this chat). When the note arrived, this host's clock read 02:11 UTC. My recorded PIDs: 8744, 29692,
  24323, 31654, 18914, 23794, 1079, all started by me with nohup, all ended on their own. From now on I stop only PIDs
  I recorded, or `pgrep -f "/ldd-wt/gtk/"`.
- My round 1 kill at about 01:19 UTC: my own N=80 run died then and is replaced by this round's N=80 runs. I could
  not see whether runs in the other worktrees died. Those chats own their re-runs.
