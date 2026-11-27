# CCU · Kolkata: length round 2

- **Branch:** `city/ccu` in `/local/home/saiposh/personal/ldd-wt/ccu`, tip **`21c62bc0c8f46614d9c3360c5764ccc1c69af8d4`**. Not pushed, no version bump, no rebase.
- Commits this round, on top of `e1d5082`: `013ba32` (the bore on 07, the pandal taken down on 10, the repeat cuts, the checkpoints, new FIXes on 01 and 04), `bf3f471` (the canopy on 09, the 06 checkpoints), `bda184a` (pars and docs), `21c62bc` (a checkpoint the cpsafe test found unsafe, moved).
- **Clear time** is the scripted route `play(def, SOLUTIONS[id])` at 120 ticks/s. Ticks below are on that clock. Par = clear × 1.35.
- Files: `src/game/cities/ccu/` (new `baan.ts`; `DhakFrame` and `Lowered` added to `pandal.ts`; two causes in `causes.ts`), `tests/cities/ccu.ts`, `docs/cities/CCU.md`, CCU's rows in `docs/MECHANICS.md`.

## Result

Only 06 meets its floor. Every padding window is cut, and three new rules went in (07, 09, 10). The rest of each floor would need more new CCU rules, and I did not build those in this budget. These are the honest numbers.

| Stage | Before round 2 (`e1d5082`, repeats cut) | Accepted file (`355faff`, with repeats) | **Now** | Floor | Short by | Par |
|---|---|---|---|---|---|---|
| 01 | 27.0 s | 27.0 s | **27.0 s** | (stays) | | 36 |
| 02 | 34.6 s | 34.6 s | **16.9 s** | (stays) | | 23 |
| 04 | 27.0 s | 27.0 s | **17.1 s** | (stays) | | 23 |
| 05 | 60.4 s | 60.4 s | **40.4 s** | 60 s | 19.6 s | 55 |
| 06 | 62.8 s | 62.8 s | **62.8 s** | 60 s | met | 85 |
| 07 | 81.9 s | 127.5 s | **89.1 s** | 120 s | 30.9 s | 120 |
| 08 | 45.4 s | 63.5 s | **34.4 s** | 60 s | 25.6 s | 46 |
| 09 | 37.3 s | 61.4 s | **41.7 s** | 60 s | 18.3 s | 56 |
| 10 | 80.9 s | 95.8 s | **69.6 s** | 90 s | 20.4 s | 94 |

02 and 04 are back to their build-pass lengths (16.9 s and 17.1 s). Their acts were repeats of the stage's own rule, and you allowed a revert. 02 and 04 were 16.9 s and 17.1 s before the earlier length note too.

Why each stage stops where it does:
- **05 (40.4 s):** `ccu05-ghatpar` was the third and fourth crossing of the carry rule, so I cut it. I did not build the new rain or repaint rule: I could not find a version whose NAIVE and FIX die of different causes in the time left.
- **07 (89.1 s):** +7.2 s from the bore. The cantilever, the sun-shade hawkers and the ferry jetty are not built.
- **08 (34.4 s):** `gali` keeps one break, as the momentum beat after `tokta`. Its second break was a third identical window, so I cut it. The reverse-of-tokta twist is not built. HWIK is still one unknown.
- **09 (41.7 s):** +4.4 s from `ccu09-dhak`. The tie-order rules are not built.
- **10 (69.6 s):** `ccu10-phera` is cut. One porter span (`setu`) stays as the callback. One rule-breaking callback is built (`bisarjan`, from the pandal). The second (the jhalmuri tin) is not built.

## New acts

| Stage | Act | The new rule (what the player reads) | Source | NAIVE: cause @ tick | FIX: cause @ tick |
|---|---|---|---|---|---|
| 07 | `ccu07-baan` | Under the bridge the river is too wide and the jetty is five tiles up. The bore comes on a timetable, with a white line and a rumble first. It drowns the ghat steps and carries the moored launch up the river, level with the jetty. Be on the launch before the wave, then step off at the crest. | Reserve R2, the Hooghly bore | wait on the ghat steps for the launch to come up to you: **ccu-baan @ 7977** | a full jump from the launch at the jetty, without the tide: **ccu-ghat @ 7650** |
| 09 | `ccu09-dhak` | Over a long stretch of lashed bamboo, the canopy frame comes down on each dhak beat and is hauled up again. Wait on the bamboo before it, then run under it as it rises. | 09 family (build order); conductor's "roof frame lowered on the dhak beat" | wait under the canopy for the beat to pass: **crushed @ 2250** | none of its own; see below |
| 10 | `ccu10-bisarjan` | The rule-breaking callback of 09. 09 taught "jump on to the cloth top, not the bamboo". After the festival they take the pandal down: a cloth top you land on is untied under you, and the bamboo holds. Also, a panel is let down from the roof frame on to the bamboo under it. | Bible law 7, callback of CCU-09 | land on a cloth top, as in the pandal: **ccu-bansh @ 5612** | stay on the bamboo, but wait on the one under the frame: **crushed @ 5763** |

Each act's intro line is its `advice:` text. The two new causes have Tara lines in `causes.ts`:
- `ccu-baan`: "The bore came up the river and over the ghat steps, and over you."
- `ccu-ghat`: "Into the Hooghly. The jetty is far too high without the tide."

No new hidden items: each stage keeps its one.

`ccu09-dhak` has no FIX script of its own. Two candidates failed:
- "One long jump over the stretch" lands safely on the lashed bamboo.
- "Hop on as it comes down" lands on top of the frame and rides it.

Neither dies, so I left them out instead of scripting a fake death. 09's stage-level NAIVE and FIX are unchanged (see below).

## Probe a: repeat windows (every act in CCU)

| Stage | Act | Windows | What the player reads differently in this window | Verdict |
|---|---|---|---|---|
| 01 | kumir river, Maidan | 1 | cross only while the kumir counts | new (R1) |
| 01 | kumir river, by the door | 1 | the same, where a long jump off the deck tempts | momentum |
| 03 | ccu03-dokan | 1 | the second seller: wider tin, quicker hand | momentum |
| 04 | ccu04-thak | 1 | a pile too tall to climb, bought down: wait on the pavement, not the short stack | new |
| 05 | ccu05-uthon | 1 | two steps down cracks dry clay even under a walk | new |
| 05 | ccu05-lane | 1 | every kind of figure mixed: read each before landing | new (mixed read) |
| 05 | ccu05-pratima, crossing 1 | 1 | wait on the big figure's head; it carries you over the mud | new |
| 05 | ccu05-pratima, crossing 2 | 1 | the same, slower painter | momentum |
| 05 | ccu05-ghat | 1 | they finish in order from the near end: keep moving | new |
| 06 | ccu06-points | 1 | the pointsman's lever: off at the island before the points | new |
| 06 | ccu06-duiline | 1 | the other line's tram brushes the step: off on to the island | new |
| 07 | ccu07-girder | 1 | walk off on to a short porter passing under | new |
| 07 | ccu07-dui | 1 | loads coming the other way overhead: hop up only when clear | new |
| 07 | ccu07-sandhya | 1 | three-porter relay at the CHA boards | new |
| 07 | ccu07-ulto | 1 | the relay with heights the other way: hop up first, walk off second | momentum |
| 07 | ccu07-baan | 1 | the bore and the launch | **new (R2)** |
| 07 | ccu07-pylon | 1 | shelter: don't take the porter who leaves at once | new |
| 08 | ccu08-rok | 1 | the maid's bucket on a beat: hop the water | new |
| 08 | ccu08-tokta | 1 | sit so the tea seller lays his plank | new |
| 08 | ccu08-gali | 1 | the same, and the plank goes up behind him | momentum |
| 09 | ccu09-sinri | 1 | a staircase of tied cloth; off the top before the next tie | new |
| 09 | ccu09-toran | 1 | two panels at once, the far one under the arch | new |
| 09 | ccu09-chala | 1 | no frame: ride the raise up | new |
| 09 | ccu09-dhak | 1 | the canopy on the dhak's beat | **new** |
| 09 | ccu09-uthan | 1 | a tied panel lifts you; step off at the top at once | new |
| 09 | ccu09-uthan2 | 1 | the same tower, slower decorator | momentum |
| 10 | ccu10-bus, -tram, -rok, -kumor, -setu | 1 each | callbacks of 02, 06, 08, 05, 07 in a new order (allowed in the finale) | callback |
| 10 | ccu10-bisarjan | 1 | 09's rule broken | **new (rule-breaking callback)** |

Cut this round as padding: `ccu05-ghatpar` (2 windows), `ccu08-gali`'s second break, `ccu10-phera`, `ccu02-depot`, `ccu04-thak2`. Cut in the previous step: `ccu07-bhor`, `-dupur`, `-raat`, `ccu08-duur`, `ccu09-uthan3`, `-uthan4`, `ccu10-shesh`. **No padding rows are left.**

## Probe b: stage NAIVE vs FIX (cause + tick)

| Stage | NAIVE | FIX | Same tick? | Same cause? |
|---|---|---|---|---|
| 01 | ccu-rail @ 1500 | **ccu-kumir @ 2372** (new: stay on the thela past the rail, then a long jump over the chalk river by the door) | no | no |
| 02 | ccu-gir @ 232 | ccu-nala @ 414 | no | no |
| 03 | ccu-muri @ 574 | ccu-lonka @ 618 | no | no |
| 04 | ccu-boi @ 151 | **ccu-kada @ 194** (new: never land on a pointed stack, so one long jump over them, into the drain) | no | no |
| 05 | ccu-phata @ 183 | ccu-murti @ 522 | no | no |
| 06 | ccu-dando @ 791 | ccu-points @ 2150 | no | no |
| 07 | ccu-cha @ 896 | ccu-bojha @ 457 | no | no |
| 08 | ccu-dhowa @ 535 | ccu-khod @ 1283 | no | no |
| 09 | ccu-bansh @ 195 | crushed @ 341 | no | no |
| 10 | ccu-boi @ 682 | ccu-nala @ 1703 | no | no |

The 01 and 04 FIXes now die to a different trap than their NAIVE.
- 01: the FIX survives the rail (NAIVE @ 1500) and dies at the second chalk river.
- 04: the FIX jumps over the pointed single (NAIVE @ 151) and falls short into the drain.

07's FIX dies before the NAIVE's tick. It leaves the first porter before his CHA board, which is the NAIVE's trap, and jumps into an oncoming load.

**05's carried-figure scripts are now distinct.** Before, "jumping the ghat mud" and "stepping off the carried figure" both died of ccu-ganga @ 1625, which is one death. Now:
- the jump dies of ccu-ganga @ 1625;
- "stepping off once it moves" waits until the figure is moving, then steps off mid-river, and dies of ccu-ganga @ 1987.

Same cause, different tick, different play.

## Act mistakes (all scripted deaths, cause @ tick, replay)

Replay is the time from the last checkpoint passed to the death.

| Stage | Script | Cause @ tick | Replay |
|---|---|---|---|
| 01 | walking straight on across the Maidan's chalk river | ccu-kumir @ 179 | 1.5 s |
| 02 | stepping off backwards on the crawl | ccu-ulto @ 699 | 5.8 s |
| 04 | waiting on the short stack in front of the tall pile | ccu-boi @ 653 | 5.4 s |
| 05 | walking off the high dry figure on to the one two steps lower | ccu-phata @ 701 | 5.8 s |
| 05 | jumping the ghat mud from the step | ccu-ganga @ 1625 | 1.1 s |
| 05 | stepping off the carried figure once it moves | ccu-ganga @ 1987 | 4.1 s |
| 06 | staying on the step at the double-line island | ccu-dui @ 5494 | 7.7 s |
| 06 | climbing on to the roof for the double junction | ccu-dando @ 4692 | 1.0 s |
| 07 | staying on the first / second porter of the dusk span | ccu-cha @ 4869 / 5433 | 4.4 / 3.1 s |
| 07 | staying on the first / tall porter of the upside-down span | ccu-cha @ 6867 / 7327 | 5.9 / 3.2 s |
| 07 | waiting on the ghat steps for the launch | ccu-baan @ 7977 | 4.0 s |
| 07 | a full jump from the launch at the jetty | ccu-ghat @ 7650 | 1.3 s |
| 07 | taking the porter who leaves the second pylon at once | ccu-cha @ 8783 | 3.6 s |
| 08 | waiting by the second adda for the water to stop | ccu-dhowa @ 702 | 5.8 s |
| 08 | jumping the first break in the lane | ccu-khod @ 2387 | 1.6 s |
| 08 | sitting on after the tea seller has gone by | ccu-khod @ 3930 | 6.4 s |
| 09 | resting on the new panel at the top of the staircase | crushed @ 722 | 6.0 s |
| 09 | waiting under the canopy for the beat to pass | crushed @ 2250 | 3.5 s |
| 09 | jumping for the high bamboo before the lift | ccu-bansh @ 2476 | 5.4 s |
| 09 | resting on the lifted panel under the roof frame | crushed @ 3720 | 7.0 s |
| 10 | landing on a cloth top in the pandal being taken down | ccu-bansh @ 5612 | 1.4 s |
| 10 | waiting on the bamboo under the roof frame | crushed @ 5763 | 1.6 s |
| 10 | staying on the first / short porter back over the bridge | ccu-cha @ 6879 / 7433 | 4.1 / 3.0 s |

Same-cause pairs inside one act are listed honestly:
- relay spans: both porters die of ccu-cha;
- 08 gali: ccu-khod twice;
- 05 pratima: ccu-ganga twice.

Each pair is a different play on a different tick.

## Checkpoints (long stages)

The bar is stretch ≤ 25 s and worst replay ≤ 8 s. Checkpoints added this round:
- 06: on the tram step mid-ride (cells 18, 28), and in `points` at 1, 22 and 38 (island, then the straight-line tram's step). `duiline` gets one at 6.
- Relay spans (07 sandhya and ulto, 10 setu): one on each porter mid-span (14, 36).
- 08 broken rok: one at the edge of the break (a1 + 0.2).
- 09 lift: one on the second tied panel (9.4).
- 10 bisarjan: one on the second bamboo (7.4). It was first at 12.6 on the bamboo under the frame, and `cpsafe.test.ts` caught that one as unsafe.

A checkpoint on a tram step or a porter's load is safe: they restore by replaying inputs (`replay.ts`), and `cpsafe.test.ts` passes for every one.

| Stage | Checkpoints at (s) | Stretches (s) | Max stretch | Worst replay |
|---|---|---|---|---|
| 05 | 7.7, 12.4, 29.8, 33.3 | 7.7, 4.8, 17.4, 3.5, 7.1 | 17.4 | 5.8 |
| 06 | 9.6, 11.0, 13.3, 28.1, 34.4, 38.1, 44.9, 57.5 | 9.6, 1.4, 2.3, 14.8, 6.3, 3.7, 6.9, 12.6, 5.3 | 14.8 | 7.7 |
| 07 | 22.1, 32.1, 36.2, 42.2, 47.3, 51.4, 57.8, 62.5, 69.6, 83.0 | 22.1, 10.0, 4.0, 6.0, 5.1, 4.1, 6.4, 4.7, 7.2, 13.4, 6.0 | 22.1 | 7.5 |
| 08 | 9.0, 18.3, 26.4, 28.8 | 9.0, 9.3, 8.1, 2.4, 5.6 | 9.3 | 6.4 |
| 09 | 7.5, 13.7, 15.2, 24.0, 29.3, 34.4, 40.1, 40.2 | 7.5, 6.2, 1.5, 8.7, 5.3, 5.2, 5.7, 0.1, 1.5 | 8.7 | 7.0 |
| 10 | 17.5, 36.4, 38.8, 42.5, 45.4, 46.4, 49.7, 53.2, 59.0, 63.9 | 17.5, 18.9, 2.4, 3.7, 2.9, 1.0, 3.3, 3.5, 5.8, 4.9, 5.7 | 18.9 | 5.7 |

Every stretch is ≤ 25 s and every replay is ≤ 8 s.
- 06's first long stretch (44.9 s in the last report) is now 14.8 s.
- 02 has no checkpoint; its whole route is 16.9 s.

I did not build a mid-ride stop with pavement on 06. The engine already takes a checkpoint on the tram step (`world.ts:571` counts riding as on the ground), and it restores exactly. So a stop was not needed to bring the stretch under 25 s.

## Proof

- `npm test` at `21c62bc`: **18 files passed, 1597 tests passed, 12 skipped (1609)**, exit 0. CCU is on no allow-list.
- Flows at `21c62bc` (`npm run build:single && node scripts/flows.mjs`): "no errors", exit 0.
- Fairness, `LDD_N=80 npm run fair -- CCU`, at `21c62bc`. The bar is 0-12 ticks: 90% per stage, 95% per stretch. Every value in the bar is 100%. The 18t column is not part of the bar.
```
CCU-01: 6t 100%  12t 100%  18t 100%   s0-s4 100%, door 100%
CCU-02: 6t 100%  12t 100%  18t 100%   s0 100%, door 100%
CCU-03: 6t 100%  12t 100%  18t 76%    s0-s2 100%, door 100%
CCU-04: 6t 100%  12t 100%  18t 88%    s0-s1 100%, door 100%
CCU-05: 6t 100%  12t 100%  18t 93%    s0-s4 100%, door 100%
CCU-06: 6t 100%  12t 100%  18t 100%   s0-s8 100%, door 100%
CCU-07: 6t 100%  12t 100%  18t 76%    s0-s10 100%, door 100%
CCU-08: 6t 100%  12t 100%  18t 100%   s0-s4 100%, door 100%
CCU-09: 6t 100%  12t 100%  18t 84%    s0-s8 100%, door 100%
CCU-10: 6t 100%  12t 100%  18t 88%    s0-s10 100%, door 100%
```
(The full log is `/tmp/ccu/fair80c.log`.)
- Shot sheets: I re-made 06, 07, 09 and 10 at `bda184a` and read them. They are copied to `reports/cities/ccu/shots/`.
  - 07 at 64.1 s: the BAAN sign, the river and the launch at the ghat.
  - 09 at 16.7 s: the DHAK sign and the canopy frame up.
  - 10 at 44.5 s: the BISARJAN sign and the cloth panels over the stakes.
  - No overlaps or missing art.
  - The 21c62bc change only moves one hidden checkpoint, which draws nothing.
- Probe output: `/tmp/ccu/probe5.txt` (01-09) and `/tmp/ccu/probe6.txt` (all, at `21c62bc`). The probe script is `/tmp/ccu/zz-probe.test.ts`; it is not committed.
- I updated BUILD.md in place: tip, times, pars, act list, and a one-line round-2 summary.

Not done:
- the 05 new rule;
- the 08 reverse-of-tokta twist;
- 09's tie-order rules and a FIX script for `ccu09-dhak`;
- the second rule-breaking callback on 10;
- more new acts on 07.

No one has played the new acts by hand. The bore's tell is a white line and a rumble sound; I checked it on the sheet, not by ear.
