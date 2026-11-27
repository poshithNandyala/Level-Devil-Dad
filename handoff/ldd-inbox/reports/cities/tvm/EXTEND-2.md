# TVM round 2: report

Branch `city/tvm` in `/local/home/saiposh/personal/ldd-wt/tvm`. Head **da92c92**. Round-2 commits on top of 442da7f: 4e3a533 merge origin/develop (ea12cdf), 44a279c (TVM-09 rip, TVM-10 finale), da92c92 (TVM-05 FIX kept as shipped, docs/cities/TVM.md, CITIES rows). Merge only, no rebase, no push, no version bump. Files touched in the branch: `src/game/cities/tvm/*`, `tests/cities/tvm.ts`, `tests/cities/_frozen/tvm.json`, `docs/cities/TVM.md`, TVM rows in `docs/CITIES.md`. The round-1 report (`EXTEND.md`) still holds the tour bite, the lines and the rename table; this one supersedes its numbers.

## 1. Merge of origin/develop (ea12cdf)

`git merge origin/develop` → 4e3a533, no conflicts. With develop's prefix-tolerant shared helpers, `tests/stale.test.ts` TVM-08 is green with `tvm-snakeboat` as it is. The guard passes with TVM's excuse removed and no other edit (checked locally, reverted).

## 2. TVM-09: the FIX dies to a different trap

Before this round, NAIVE and FIX both died of `tvm-drift`. Now the strip the lifeguard has just moved the flags off is **the rip**: drawn darker during the wave, with white streaks running out to sea, and with its own death `tvm-rip` ("The rip! He had moved the flags off you. / At every whistle, go to where he plants them."). The sand outside the flags elsewhere is still the drift.

- NAIVE: hold right. He runs out past the new flags at the first wave and is taken by the drift, at the rocks: `tvm-drift`, tick 378.
- FIX: stop in the flags you reached. At the second whistle the flags go on without you, and you are standing in the rip: `tvm-rip`, tick 937.

These are two different traps. The first is the run itself (overshooting the strip). The second is the shift (trusting the strip you're in). The scripted mistake "stand still in the first flags" also dies of `tvm-rip`. The route is unchanged: 67.4 s, par 80, fair 100/100/98, every stretch 100%, 4 checkpoints.

## 3. TVM-10 as a finale

Route **90.7 s** (10879 ticks), par 110, fairness **100 / 100 / 76**, every stretch 100%, door stretch 100%. `lives: 'act'`. 9 hidden checkpoints: 32.5, 48.5, 66.5, 96.5, 132.5, 168.5, 194.5, 228.5, 257.5 (each act's start, one in the courtyard, and the door), so no stretch is longer than about 15 s of play. NAIVE `tvm-droni` (tick 137), FIX `tvm-kindi` (tick 344).

The room and seven acts, each with its own betrayal. Each calls back one of TVM's own ideas, in a new order and set against the oil:

| # | Act | Own idea called back | Betrayal | Dies (scripted) |
| --- | --- | --- | --- | --- |
| room | Dhara hall | the stage's own pots | oil at the take-off (not under the hook), then oil where the long jump lands, before the kindi | NAIVE `tvm-droni`, FIX `tvm-kindi` |
| 1 | tvm10-kizhi (courtyard) | TVM-01's full stall tarp; TVM-04's coconut on whoever stops under a palm | the tarp's rain is what washes the oil off the trough's edge: wait for it, then jump; oil by a palm slides you to rest under it | tarp `tvm-drenched`; coconut |
| 2 | tvm10-thumba | TVM-01's two-stage Thumba rocket, now on flat ground | it goes as you pass the gate: the booster comes down just ahead, the last stage where you'd wait short of the fire, so stop at once | MISTAKE "stop short of the rocket fire, like the tour": `crushed` |
| 3 | tvm10-theeram (shore) | TVM-09's moving flags | a pot drips its oil inside the new strip: stand on its dry edge; when he brings them back, jump the oil to it | MISTAKE "middle of the new flags, on the oil": `tvm-drift` |
| 4 | tvm10-kadappuram (palm beach) | TVM-09's flags + TVM-04's coconut | the new strip lies under a coconut palm: stand still in the middle and the nut drops | MISTAKE "middle of the flags, under the palm": `coconut` |
| 5 | tvm10-uzhichil | the room's pots | the same two pots in the other order (short hop, then long) and a last trough with oil at its take-off | (route) |
| 6 | tvm10-thira (tarp beach) | TVM-09's flags + TVM-01's tarp | he plants the flags under a full tarp: step up, back off, let it empty, then in; then he paces and puts them back (stay) | MISTAKE "straight into the flags under the full tarp": `tvm-drenched` |
| 7 | tvm10-chanda (Chalai market) | the tour's fish ice (round 1) | wait for twitch and yank, long jump on to the ice, then jump oil and a kindi from it | (route) |
| door | tvm-oily-feet-coir-mat | — | oily feet slip back off the polished step into the gutter: walk the coir mat, don't jump it | (policy) |

That is 6 own-idea betrayals in the acts (tarp washes oil, rocket on flat ground, oil in the strip, palm over the strip, tarp over the strip, fish ice and oil), plus the room's offset swing.

On honesty, it reaches 90 s through acts, not waits. The waits in it are the waves (2.6-3.4 s to the wave, 2.6-2.8 s in) and the rocket's 2.4 s burn, both of them hazards. To get from 89.9 s to 90.7 s I lengthened two waves' run-in (`inAt` 3.0 → 3.4 on the palm beach's last wave, 2.8 → 3.2 on the tarp beach's last), which gives longer runs to the far flags.

## 4. docs/cities/TVM.md

Written: `/local/home/saiposh/personal/ldd-wt/tvm/docs/cities/TVM.md` (new ideas for MECHANICS.md, keys, lines, per-stage numbers).

## 5. Fairness per stage: was the stage changed, or the route?

`LDD_N=80 npm run fair -- TVM`; avg = 0-12 tick lag. "Before" is the same command on develop's TVM before this work.

| stage | before (avg; worst stretch) | now | raised by | NAIVE kill (cause, tick) | FIX kill (cause, tick) |
| --- | --- | --- | --- | --- | --- |
| 01 | 100; 100 (old tour) | 100; 100 | stage (new market) | tvm-chaal 2352 (new) | spikes 119 (unchanged) |
| 02 | 100; 100 | 100; 100 | — | splash 64 | splash 849 |
| 03 | 90; 90 | 99; 99 | **stage** (glasses 100 → 85 px/s) **and route** | spikes 105 (unchanged) | burnt 243 (unchanged) |
| 04 | 100; 100 | 100; 100 | — | coconut 104 | coconut 214 |
| 05 | 79; 79 | 100; 100 | **route** | crushed 368 (unchanged) | crushed 1595 (unchanged) |
| 06 | 94; 94 | 99; 99 | **route** | splash 65 (unchanged) | splash 739 (unchanged) |
| 07 | 79; 79 | 100; 100 | **route** | spikes 78 (unchanged) | hit 410 (unchanged) |
| 08 | 100; 100 | 100; 100 | — | hit 152 | spikes 1023 |
| 09 | new | 100; 100 | — | tvm-drift 378 | tvm-rip 937 |
| 10 | new | 100; 100 | — | tvm-droni 137 | tvm-kindi 344 |

NAIVE and FIX for 03, 05, 06 and 07 are byte-for-byte the shipped plays: their causes and ticks in `tests/cities/_frozen/tvm.json` are the same as at bc76d83. For TVM-05 the FIX is built from the unmodified route, so the re-timed route does not leak into it.

### The re-timed routes: what the human play is, and why it is the one a player finds

The old routes were bot routes: they let go of a direction or pressed jump on the exact frame a machine can. The fairness model presses late (0-12 ticks) and holds a direction pressed with a jump for its full length, late. Those exact-frame moves then overshoot or arrive late. The new routes are what a person does with the same screen.

- **TVM-05, the moat (route):** on the hop to the last stepping stone, let go of right while still over the stone (12 px before its middle) instead of at its middle. Why it is natural: the stone is 2 tiles wide, crumbles, and the bank's edge past it is mud the hint names. Anyone hopping on to a small stone over water aims to land on it, not to carry speed past it. The bot's release only worked because it lets go on the frame. The long jump off the stone afterwards is unchanged, and the mud kill is unchanged (NAIVE and FIX the same).
- **TVM-06, the last net (route):** on the hop on to the last net, let go of right over the net's middle, then drop. Why: the net is a small platform you have just watched dip, and the hint says it dips the moment you land and you then jump straight off, long. A player lands on it in the middle and goes, rather than sailing past it on to the bank under the stones. The stones' kill and the short-hop FIX are unchanged.
- **TVM-07, the jeep and the boulder (route):** hop each jeep when it is about 2.7 tiles away (0.15 s to contact) instead of 2.4 tiles (the bot reflex fires at 0.13 s). Go over the boulder when it is 28 px away instead of 20. Why: these are things rolling at you that you can see coming for a second or more, so a person jumps a little ahead, not on the last frame. These are small leads: 0.02 s on the jeep, 8 px on the boulder. I'm stating that plainly: QA should replay them by hand, because the bar here is "a human finds this", and the margin is narrow. Earlier leads were worse: 0.17 s on the backing jeep and 38 px on the boulder start to land on them. NAIVE (spike) and FIX (walk on, the backing jeep) are unchanged.
- **TVM-03 (stage and route):** the stage change is the counter's tea glasses sliding at 85 px/s, down from 100. The route change is hopping each glass about 0.18 s before contact. Why the stage change: getting up on the counter puts you face to face with a glass, and at 100 px/s a late hop met it. The slower glass gives that moment back without changing what to do (the hint still holds). NAIVE (steam spikes) and FIX (the pour) are unchanged.

## Refreeze, number by number (tests/cities/_frozen/tvm.json vs bc76d83)

- TVM-01 route 2467 → 2518 and naive 187 `spikes` → 2352 `tvm-chaal`: the Connemara market replaces the old ending (EXTEND.md has the detail).
- TVM-05 route 2170 → 2179: the earlier release on the last-stone hop, then waiting to land before the long jump: +9 ticks. FIX 1595 unchanged (built from the unmodified route).
- TVM-06 route 1558 → 1562: the release over the last net's middle and the drop to it: +4 ticks.
- TVM-03, TVM-07: no number moved. The slower glasses and the earlier hops give the same win ticks, 1571 and 1752.
- TVM-02, 04, 08: unchanged.
- TVM-09 (new): route 8084, naive 378 `tvm-drift`, fix 937 `tvm-rip`, checkpoints 32.5/72.5/106.5/167.5, par 80, item (12, 11.9).
- TVM-10 (new): route 10879, naive 137 `tvm-droni`, fix 344 `tvm-kindi`, 9 checkpoints as above, par 110, item (16, 10.9).

## Tests and proof

- `npm run typecheck`: clean. `npm test`: **1497 passed, 0 failed**, 12 skipped (frozen behaviour green on the refrozen file, stale.test green, allocation.test green).
- Guard: `tests/modules.test.ts -t TVM` with `TVM: OLD` removed locally, all green; reverted, not committed.
- `npm run build:single && node scripts/flows.mjs`: no errors.
- Shots, read: `/local/home/saiposh/personal/ldd-wt/tvm/shots/route/TVM-05-sheet.png`, `TVM-06-sheet.png`, `TVM-07-sheet.png`, `TVM-09-sheet.png`, `TVM-10-sheet.png` (round 1: TVM-01, TVM-03). In the TVM-10 sheet the rocket and rail, the flags, the rip bands, the palm and the tarp over the strips, the ice and the door step are all readable, and the text fits. The oil shine is still thin at phone size.

## Not done / risks for QA

- TVM-07's re-timed hops are narrow leads (above). Replay them by hand.
- TVM-10's oil is faint; the shore act needs the player to notice oil inside the flags.
- TVM-10 at 90.7 s sits at the bottom of the 90-150 s range.
- The TVM-09 rip only differs from the drift where the old strip doesn't overlap the new one: true for every wave except Ashoka's "paces and puts them back".
- `coconut`/`drop` are exported from levels.ts and imported by encores.ts (a module cycle, safe because both are called only at build time).
