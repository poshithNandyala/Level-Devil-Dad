# SVP length round 3 (allocation v3 and v3.1)

Branch `city/svp`, worktree `ldd-wt/svp`. Develop d398868 is merged (merge, not rebase). No push, no version bump, no shared file touched. Tip: `7277011e142efd8d20aff9e16e46cf3df1545f09`.

## Still short, and why

Route times, bot, seconds. "Before" is the round 2 report (LENGTH-2.md), "after" is measured at the tip.

| Stage | Floor | Before | After | What is honest |
|---|---|---|---|---|
| 01 | 25-35 | 30.1 | 30.1 | unchanged, one-trap tour |
| 02 | 25-45 | 25.8 | 25.8 | unchanged |
| 03 | 25-45 | 26.1 | 29.1 | creek lengthened (see cpsafe); the door recast keeps the same length |
| 04 | 25 | 20.6 | 20.6 | unchanged, 4.4 s under; round 2's boat waits were shortened for the replay bar and no v3 row adds to 04 |
| 05 | 60 | 54.1 | **41.5** | `rassi` cut (S7) took out about 25 s; F503 added back about 9. The allocator's own estimate was about 60 s; the measured number is 41.5 s. The caves and the viewpoints are all that is left. |
| 06 | 60 | 21.2 | **21.2** | F490 not built (reason below). 06 stays at its round 2 length: 39 s short. |
| 07 | 120 | 38.4 | **44.5** | F504 built (+6 s). F491 not built (reason below). v3.1 expected about 81 s with both; I measure 44.5 s. 75 s short. |
| 08 | 60 | 44.0 | 86.8 | floor met. F492 and F493 each add a street section with two rains. |
| 09 | 60 | 28.8 | **35.3** | F494 built (+6.5 s). 25 s short; v3 itself says 09 ends about 47 s, and its own refill ("none further") is empty. |
| 10 | 90 | 87.7 | **64.5** | `rassi` cut (S7), and the callbacks turned into breaks are shorter than the replays they replace (the saman break is one hall, the jad break two short creeks). 25 s short of the finale floor. |

I did not pad. The refill for 05, 06 and 09 in V3.1 is "none found", and the struck list for 07 is binding, so no act was invented.

## Rulings applied (with row ids)

| Row | Ruling | What I did |
|---|---|---|
| S7 | `svp05-rassi` and `svp10-rassi` cut | Removed from `levels.ts` and `s10.ts`; the file `rassi.ts` and its test routes stay, with the two ids in the test's `RETIRED` set. 05's FIX now dies in the caves (`svp-chuna`), not at a rope. |
| I4 | Recast the 03 door | `boardBridge` (id `svp-board-bridge` kept so the ending key and the allocation test do not move) is now two logs and one gap over the creek with the croc under them, and the board's own arrow points at the log it is under. The old "stand still so a bridge folds down" is gone. The door has no death play of its own in `tests/cities/svp.ts` (only an ending policy that wins it); its hazard is the 03 croc, `svp-magar2`. |
| W7 | Finale callbacks must break their rule | `nadi`, `jad`, `saman`, `ghat` are breaks (rows below). `nali` is kept as a plain callback: v3's W7 row does not list it, so I left it. This is a deviation from law 7 that the conductor can rule on. |
| F503 (steer-604ae5d8) | 05 eye height | built as `svp05-ooncha` |
| F504 (steer-f8301422) | 07 bus | built as `svp07-bus` |
| V3.1 struck | conditional bunker-by-ear | not built |

## Acts: one row each

Registry check = `DECISIONS.md` lists 1-2 and the other five cities' v3 and v3.1 families, read at the start. Names are used where the v3 and v3.1 numbers disagree (the registry's V2 row calls the SVP drumming roof F495, v3 calls it F493). No row below matched; V2 keeps the sound beats apart on purpose.

| Act | Family | Decision sentence | Registry check | NAIVE cause@tick | FIX cause@tick | Seconds |
|---|---|---|---|---|---|---|
| `svp05-ooncha` (05) | F503 eye-height-not-footprints | Stand at the eye height of the note, not on the painted footprints: the bench behind them is the height; the signboard is too high. | no match (05's own rule on a second axis) | stand on the footprints: `svp-nazar`@2587 | up the signboard: `svp-nazar2`@2520 | about 9 (estimate, not timed alone) |
| `svp07-bus` (07) | F504 rolls-back-before-it-goes | When the engine note rises, be on the bus's roof: not behind it, not ahead of it down the lane. | no match (the sound beat is kept apart by V2; the arm-and-roof ride is not a shelter-and-wait) | right behind it: `svp-bus`@4133 | ahead of it: `svp-bus-aage`@4436 | +6.1 (38.4 to 44.5) |
| `svp08-chhajja` (08) | F492 read-roof-slope | Read the slope of the roof, not the wind: the dry place is under the high end. | no match (SVP's own awning lee rule is by wind; the lean-to ignores wind) | lee end by the wind: `svp-chhajja`@5380 | high end first, then lee end at the second stall: `svp-chhajja2`@7181 | about 21 |
| `svp08-tin` (08) | F493 drumming-roof-names-the-rain-side | Listen for the side the rain drums on under the tin and stand at the other end. | no match (V2: SVP hears which side the rain is on) | stay at the first rain's dry end: `svp-baarish`@8365 | by sound in section one, toward the drumming in section two: `svp-baarish3`@9039 | about 21 |
| `svp09-patta` (09) | F494 release-point-vertical | Let go under the hatch: the way up is straight from where you stood. | no match (SVP's own hose is line routing; this is a release point) | under the pontoon's middle: `svp-hull`@3648 | at the end of the seabed: `svp-pankha`@3730 | +6.5 (28.8 to 35.3) |
| `svp10-nadi` (10) | W7 break of 03 | The board has not been turned: read the ripples. | n/a (a break) | trust the stuck board: `svp-magar3`@1290 | see below | one creek, about 20 |
| `svp10-jad` (10) | W7 break of 09 | The grey root holds, the green one goes: jump grey to grey. | n/a | walk the green: `svp-eent3`@3625 | grey in creek 1, green in creek 2: `svp-eent4`@3885 | about 14 |
| `svp10-saman` (10) | W7 break of 07 | The luggage is lashed: climb the tall stack, the crowd goes under, and comes back. | n/a | wait in the open: `svp-bheed`@4595 | down at once into the crowd coming back: `svp-bheed2`@4976 | about 17 |
| `svp10-ghat` (10) | W7 break of 04 | The deer are tied: carry the fritter, it is the fare. | n/a | put it down, take the boat: `svp-hiran3`@6839 | step off while the boat is away: `fell`@6531 | about 15 |
| 03 door | I4 | Jump the gap when the arrow points away from the door's log. | n/a | no death play | no death play | n/a |

Per-act seconds marked "about" are estimates from the stage deltas (08's two acts share +42.8 s); only the 07 and 09 deltas are single-act measurements.

Not built:

- **F490 refraction-aim-beyond (06).** The engine's jump has a fixed range. I measured a running jump from flat ground: holds of 4, 6, 8, 10 and 12 ticks all travel 3.50 tiles; a hold of 16 travels 3.75, 20 travels 4.06, 30 travels 4.75. So the aim a player controls is about 1.25 tiles wide, and a 12-tick input lag moves the take-off by about 1 tile. A ledge placed by "aim beyond by the bend" either gets reached by every ordinary jump (no trap) or by none, and cannot clear the 90% bar at 6 and 12 ticks. It is not a fair rule in this engine.
- **F491 exit-shelter-same-side (07).** I tried five geometries (alcove, through-arch, crowd over the roof, crowd that settles at the far mouth, a bypass lane). Each either reduces to the shipped 07 shelter rule (stay under cover until the rush passes: the trench in `svp07-doosra`, and the lashed stack in `svp10-saman`), or needs the entered side to be unreachable after the call. The side clause only matters if the crowd mass stays on the far side, and that needs a second lane, which is the trench. I did not build it, and 07 is 75 s short of its floor because of it. If the conductor reads the bus beat and the tall stack as enough shelter beats, nothing is lost; otherwise it needs a ruling on a geometry.
- **Conditional bunker-by-ear (07).** Struck, as ruled.

Known weak spots:

- `svp10-nadi`: I could not make a second window that dies on a different cause. A player who jumps without reading the board dies at the first gap with the same cause (`svp-magar3`@1290) as the trust-the-board play. `Patrol` still carries a second cause (`svp-magar4`) that nothing reaches. The creek is one window.
- 08 now has `gali` (the room again, the labelled momentum beat), and second windows in `deewar`, `chhajja` and `tin`. Each second window has a different answer (heights close together, the slope mirrored, the drumming on the other side), so none is identical, but three same-rule second windows is more than one momentum beat's worth. This is the first thing to cut if the conductor rules them identical.
- `svp10-saman`'s FIX (`bheed2`) is the same family as the 07 teesra crowd that comes back.

## Probe table 1: identical-window scan

A window is a stretch of one act whose answer repeats exactly. Rows beyond one labelled momentum beat per stage: **none found**.

| Stage | Act | Windows | Same answer? | Label |
|---|---|---|---|---|
| 03 | nala | one creek, three gaps | no (the croc is at a different gap each time) | new |
| 05 | ooncha | one | n/a | new |
| 05 | choona | two walls | second wall waits longer on a different formation | momentum |
| 07 | bus | one | n/a | new |
| 08 | gali | the room's street again | yes, the same rule | **the labelled momentum beat** |
| 08 | deewar | tall house against a short shop; 3-storey against 2-storey | no, closer heights | new, then a harder read |
| 08 | chhajja | high-left slope, high-right slope | no, the answer is the other end | new, then mirrored |
| 08 | tin | first and second section | no, the drumming is on the other side | new, then mirrored |
| 09 | nali | one arch under allowed; none allowed | no | new, then momentum |
| 09 | patta | one | n/a | new |
| 10 | nadi, jad, saman, ghat | one window each (jad two creeks of different gap) | no | breaks |

## Probe table 2: same-tick FIX scan (`probes/p3-round3.txt`)

NAIVE and FIX of every stage, cause@tick. They differ in cause and in tick everywhere except 01 (a one-trap tour, same cause as before).

| Stage | NAIVE | FIX |
|---|---|---|
| 01 | baha@586 | baha@1298 |
| 02 | aari@434 | kichad@2063 |
| 03 | magar@272 | magar2@741 |
| 04 | hiran@354 | hiran2@1550 |
| 05 | nazar@190 | chuna@3137 (was rassi: cut) |
| 06 | kichad@199 | kichad2@1309 |
| 07 | saman@544 | bheed@776 |
| 08 | baarish@217 | nala@10013 |
| 09 | eent@138 | eent2@550 |
| 10 | aari@654 | magar3@1290 |

Same-tick pair inside a stage: 10's FIX (`svp-magar3`@1290, hop the logs) and the nadi mistake "trust the board" (`svp-magar3`@1290). They are the same play. Everything else in the mistake lists differs by cause or tick.

## Lag-captured sweep (FIX-7 method, `qa6` model)

Route at lag 0/6/11/12 and spawn idle 0/37/120/251; the checkpoint is taken wherever the lagged run takes it; then idle 4 s, run 0.3 s and tap-jump after 0/6/12 ticks (7 plays); replay per tick from the last checkpoint to each NAIVE, FIX and mistake death at lag 0/6/12. Scratch test `zz-qa6.test.ts` (copied from the qa-pat branch, not committed). Raw: `probes/sweep-round3.txt`.

| Stage | Capture points | Plays | Deaths | Longest stretch | Worst replay, lag 0 / 6 / 12 (s) |
|---|---|---|---|---|---|
| SVP-01 | 3 | 336 | 0 | 16.1 s | 7.32 / 7.42 / **7.76** |
| SVP-02 | 4 | 448 | 0 | 9.8 s | 6.63 / 6.63 / 6.63 |
| SVP-03 | 4 | 448 | 0 | 7.8 s | 2.27 / 2.15 / 2.20 |
| SVP-04 | 3 | 336 | 0 | 11.6 s | 3.51 / 3.67 / 3.72 |
| SVP-05 | 9 | 1008 | 0 | 8.4 s | 2.42 / 2.52 / 2.91 |
| SVP-06 | 3 | 336 | 0 | 10.0 s | 1.66 / 1.76 / 1.86 |
| SVP-07 | 6 | 672 | 0 | 9.8 s | 5.00 / 5.31 / 5.46 |
| SVP-08 | 9 | 1008 | 0 | 12.1 s | 7.47 / 7.47 / 7.47 |
| SVP-09 | 9 | 1008 | 0 | 6.0 s | 3.80 / 3.81 / 3.81 |
| SVP-10 | 11 | 1232 | 0 | 12.3 s | 6.64 / 6.71 / 6.83 |

**0 deaths in 6,831 plays.** The same sweep on the round 2 tip (1b68792 merged with develop) found 324 deaths: SVP-03 108 of 560, SVP-09 48 of 896, SVP-10 168 of 2016 (`probes/sweep-baseline.txt`). They were: the 03 creek checkpoints (a tap-jump from a lag-captured spawn reaches the next gap's croc: the logs were 5 tiles long, so every spot on them was within the reach of a gap); 09 cp x81 (the end of a pit, 5 tiles before the next); and the same two in the finale. Fixes:

- 03: the creek is 38 tiles wide, with three gaps and two 12-tile middle logs, so checkpoints sit in the middle of a log, 6 tiles from each gap (`cps: [14.5, 26.5]`, was `[9.6, 15.6, 21.6]`). The croc travels further between gaps, which is where the 03 length (+3 s) came from. The door's creek got the same layout, and its spacing is 18 tiles.
- 09: the ground between pit 2 and pit 3 of the cellar is two tiles longer, and the act's first pit starts 3 tiles later (the act-start checkpoint was 2.5 tiles from a pit). cps `[24.5, 47.5, 77, 96.5]`.
- 10: inherits both; the jad break starts its first pit 9 tiles after the act start.
- The two checkpoints removed in round 2 (07 doosra and teesra): re-measured. 07's longest stretch is 9.8 s and its worst replay 5.46 s, so no checkpoint went back.

Over the 7.5 s bar: **SVP-01 at lag 12, 7.76 s** (the FIX at the lane). 01 is the one-trap tour, exempt in round 2, and unchanged this round. I tried shortening the cloud lobes by 60 ticks: the replay did not move (it is the route's own wait), so I reverted it. Nothing else is over 7.5.

Also at lag 12, the 10 mistake "sit down on the luggage" does not die in the lagged model (`nodeath`): the lagged player steps off in time.

## cpsafe, fair, tests, sheets

- `tsc --noEmit`: clean.
- `npx vitest run tests/cpsafe.test.ts -t SVP`: 10 passed (all ten SVP stages, idle, run and tap-jump at lag 0/6/12), SVP off the allow-list.
- Full `npm test` (`npm-test-r3.txt`): 18 files passed, **1773 tests passed**, 20 skipped, 0 failed.
- `node scripts/flows.mjs`: no errors.
- Fairness, `LDD_N=80 npm run fair -- SVP` (`fair-N80-r3.txt`):

```
SVP-01: 6t 100%  12t 100%  18t 100%
SVP-02: 6t 100%  12t 100%  18t 100%
SVP-03: 6t 100%  12t 100%  18t 100%
SVP-04: 6t 100%  12t 100%  18t 100%
SVP-05: 6t 100%  12t 100%  18t 100%
SVP-06: 6t 100%  12t 100%  18t 80%
SVP-07: 6t 100%  12t 100%  18t 100%
SVP-08: 6t 100%  12t 100%  18t 100%
SVP-09: 6t 100%  12t 100%  18t 80%
SVP-10: 6t 100%  12t 100%  18t 100%
```

  Every stretch is 100% at 0-12 ticks (bar 95%). 06 and 09 are 80% at 18 ticks, as in rounds 1 and 2 (06 is unchanged; I did not look into the cause of 09's 80% at 18 ticks this round).
- Sheets re-shot with `shots.sh` and **read**: `shots3/SVP-03-sheet.png` (the long creek, the new door), `SVP-05` (the viewpoints and the caves), `SVP-07` (the bus stand with its sign, the bus and the arm), `SVP-08` (the lean-to roofs and the tin roof over the market), `SVP-09` (the pontoon, its hatch with the light, the pillar), `SVP-10` (the stale board with ripples, the lashed stack, the fare sign). 02, 04 and 06 are unchanged since round 2 and not re-shot; their round 2 sheets are in `shots/`.

## Files

`src/game/cities/svp/`: `bus.ts` (new), `s03.ts` (creek, door), `s04.ts` (tied deer, fare boat), `s05.ts` (`EyeView`, `ooncha`), `s07.ts` (lashed hall), `s08.ts` (`Slope`, covered market), `s09.ts` (cellar, grey roots), `nali.ts` (`Belt`), `s10.ts`, `levels.ts`, `causes.ts`. `tests/cities/svp.ts`. `docs/cities/SVP.md`.

Cause keys added: `svp-magar3`, `svp-magar4`, `svp-eent3`, `svp-eent4`, `svp-bheed2`, `svp-hiran3`, `svp-chhajja`, `svp-chhajja2`, `svp-baarish3`, `svp-nazar2`, `svp-hull`, `svp-pankha`, `svp-bus`, `svp-bus-aage`.

## Skipped or not checked

F490 and F491 are not built, and the floors for 05, 06, 07, 09 and 10 are not met (numbers above). The 06 sweep and fair are unchanged from round 2. Par values in `levels.ts` were not re-run, except the 08 par (80), which I set by hand. The 08 weather timings were not re-tuned after the two new sections.
