# DIS length, round 2: every idea in its home stage

Branch `city/dis`, worktree `ldd-wt/dis`. Round started at `6e96ad7`; tip `5fefcf3` (the 06:50 additions on top of `f7ded2a`). No push, no version bump.

## Short version

- **Met:** every reused act is cut; each idea now lives in one home stage and returns at most once, in DIS-10, as a callback that breaks its rule. 07 has new DIS rules for its momentum beat (Bihu dhol planks) and its shelter beat (Bordoisila storm). 05 and 09 each lost their husori gate and gained one new rule (05 the loom, 09 the tug of war). 06 keeps one stilt house. Every added act has a Tara intro line. Worst replay is 7.9 s at lag 0, 6 and 12 (bar 8 s). The longest stretch is 12.9 s (bar 25 s). Full `npm test`, typecheck, flows and LDD_N=80 fairness are green.
- **06:50 additions, met:** (1) every counted FIX dies to a different trap with its own cause on a different tick (11 pairs, 0 same-cause; before: 19 of 27 shared a cause). Rooms and acts with only one trap carry a one-line reason and one scripted death instead. The dhol plank that sinks under you is a new trap, `dis-dhol-sink`. (2) `dis08-kohora` is cut, and 08 is 54.6 s, 5.4 s short of its floor. (3) Replay is 7.9 s worst at all three lags, and the 06 run is in the table. No checkpoint is within 3.5 tiles past a trigger, apart from one past a text-only guide line in 01.
- **Not met: the length floors.** Cutting the reused acts took 05, 06, 07, 08, 09 and 10 under their floors. I stopped there and did not pad. The new bible rules I did not build (ferry, Kamakhya goats, tea auction, Saraighat trains, Deepor Beel boats) are the way back up.

## Route time, before and after (seconds, route play `winTick / 120`)

| Stage | Floor | Before (`6e96ad7`) | After (`5fefcf3`) | Short by | Par before → after |
| --- | --- | --- | --- | --- | --- |
| DIS-01 | 25-35 | 26.0 | 26.0 | - | 34 |
| DIS-02 | 25-45 | 26.2 | 26.2 | - | 36 |
| DIS-03 | 25-45 | 43.8 | 40.2 (quicker muga reel) | - | 58 |
| DIS-04 | 25-45 | 25.3 | 25.3 | - | 34 |
| DIS-05 (HWIK) | >= 60 | 61.0 | 27.7 | 32.3 | 82 → 37 |
| DIS-06 | >= 60 | 60.5 | 25.3 | 34.7 | 82 → 34 |
| DIS-07 marathon | >= 120 | 126.5 | 66.4 | 53.6 | 170 → 90 |
| DIS-08 (HWIK) | >= 60 | 66.3 | 54.6 | 5.4 | 90 → 74 |
| DIS-09 | >= 60 | 62.2 | 26.6 | 33.4 | 84 → 36 |
| DIS-10 finale | >= 90 | 98.4 | 40.6 | 49.4 | 133 → 63 |

The after times are the end of the last stretch in the three-lag probe (the route play's win tick).

## Repeat table

| Idea | Stages it was in (before) | Home | Now |
| --- | --- | --- | --- |
| Ghat / tray boys (`dis-spill`) | 01, 05, 06, 07, 10 | 01 | 05, 06, 07, 10 cut |
| Sandbars by the level post (char) | 02, 05, 06, 10 | 02 | 05, 06, 10 cut |
| Tea rows (bagan) | 03, 10 | 03 | 10 cut |
| Pitha pan (tawa) | 04, 06, 10 | 04 | 06 pitha and 10 tawa cut |
| Gamosa givers | 05, 10 | 05 | 10 callback: the fourth gamosa blinds you (`dis10-gamosa`) |
| Husori group and gate | 05, 07, 09, 10 | 07 | 05 husori, 09 bihu, 10 gate cut; 07 `paar`/`lane` cut as repeats of `ghar`/`chowk` |
| Stilt house / retreating bank (chang, chapori) | 06 (twice), 10 | 06 | `dis06-chang2`, `dis06-chapori3`, 10 chang and bank cut |
| Rhino / Kaziranga grass | 08, 10 | 08 | `dis08-kohora` (a copy of `dis08-jeep`) and 10 gorh cut |
| Rang Ghar roof slope | 09 (two widths) | 09 | `dis09-chaal3` cut |
| Bihu dhol planks (new) | 07 | 07 | 10 callback: the tired drummer's beat slows (`dis10-dhol`) |
| Bordoisila storm (new) | 07 | 07 | 10 callback: the old bhoral falls, jump on the gust (`dis10-bordoisila`) |
| Tug of war (new, bible idea 10) | 09 | 09 | 10 callback: the teams change ends, red now means back (`dis10-tug`) |
| Loom (new) | 05 | 05 | no callback |

DIS-10 now has four acts, all callbacks, one per idea: dhol, Bordoisila, tug, gamosa.

## New acts and intro lines

| Act | Rule | Intro line (Tara) |
| --- | --- | --- |
| `dis07-bordoisila` | wind toward the pond, then hail: shelter under the bhoral (07 shelter beat) | "Roba! / Stop!" |
| `dis07-dhol` | planks rise on the beat, and the beat quickens (07 momentum beat) | "Lahe lahe, Dad? / Slowly slowly, Dad?" |
| `dis09-tug` | the taut rope is the floor and drifts to the winning side; the referee's flag tells you which | "Bhal, Dad! / Good, Dad!" |
| `dis05-taat` | the cloth is the floor and grows each pass; hop the shuttle | "Olop! / A little!" |
| `dis10-dhol` | callback: the beat slows | "Akou ebar? / Once again?" |
| `dis10-bordoisila` | callback: the bhoral falls; go on the gust | "Roba! / Stop!" |
| `dis10-tug` | callback: the ends swap; red now means the rope is coming back | "Moi najanu! / I don't know!" |

I built Umananda (`dis05-umananda`) and reverted it (`4026ddb`) after re-reading the bible; the loom took its place.

## Repeat windows per act

I did not re-run the repeat-window probe this round. The probe from the last round was deleted with the other scratch tests. The table below lists the acts per stage by construction. Each act is a different rule, and 07 has one momentum beat (dhol) and one shelter beat (Bordoisila).

| Stage | Acts in order |
| --- | --- |
| 05 | `dis05-biya`, `dis05-taat`, `dis05-atithi` |
| 06 | `dis06-majuli`, `dis06-chang` (one stilt house), `dis06-chapori` |
| 07 | `dis07-ghar`, `dis07-bordoisila`, `dis07-dhol`, `dis07-chowk` |
| 08 | `dis08-kaziranga`, `dis08-jeep`, `dis08-bagori` |
| 09 | `dis09-tug`, `dis09-chaal` (roof), `dis09-dhal` |
| 10 | `dis10-dhol`, `dis10-bordoisila`, `dis10-tug`, `dis10-gamosa` |

## NAIVE / FIX cause@tick

The 06:50 bar: every act's obvious fix dies to a different trap with its own cause id on a different tick, or the act has a one-line reason why it has only one play. A one-play act carries one scripted death, and that death is not counted as a FIX. Measured at the commit below with `play()` over the stage route up to the act's start.

**Pairs that count as a FIX (different trap, different cause, different tick).** The stage-level FIX plays are 04, 08 and 09 (rooms), and 05, 07 and 10, which use the obvious fix of `dis05-taat`, `dis07-bordoisila` and `dis10-tug`. That makes 6 of 10 stages; the module test needs 5.

| Stage | Act | NAIVE | FIX |
| --- | --- | --- | --- |
| 04 | room | dis-tawa@180 | dis-roll@476 |
| 05 | `dis05-taat` | dis-taat@1318 | dis-shuttle@1589 |
| 07 | `dis07-dhol` | dis-pukhuri@3951 | dis-dhol-sink@4683 (new trap: the plank sinks under your feet) |
| 07 | `dis07-bordoisila` | dis-bordoisila@3317 | dis-hail@3368 |
| 08 | room | dis-beel@109 | dis-gorh@433 |
| 08 | `dis08-jeep` | dis-beel@2818 | dis-gorh@3504 |
| 09 | room | dis-roof@201 | dis-gutter@119 |
| 09 | `dis09-tug` | dis-khaal@722 | dis-rope@1017 |
| 10 | `dis10-dhol` | dis-pukhuri@954 | dis-dhol-sink@1002 (keeps 07's quick tempo; comes down on his own plank as it sinks) |
| 10 | `dis10-tug` | dis-khaal@2432 | dis-rope@2727 |
| 10 | `dis10-bordoisila` | dis-bordoisila@2025 | dis-bhoral@2116 |

Before this round, 19 of 27 pairs shared a cause and `dis09-chaal3` died on the same tick. `dis09-chaal3` is cut. Same cause in the table above: 0 of 11.

**One play (the reason, then its scripted deaths).** The second death in each row meets the same trap, so it is labelled "second scripted death, same trap" in the tests and not counted as a FIX. Reasons are in `ONE_PLAY` in `tests/cities/dis.ts`.

| Stage / act | Why one play | Scripted deaths |
| --- | --- | --- |
| DIS-01 room | the ghat has one hazard, the tea boy's tray: touching him, hopping him and climbing out early all meet it | dis-spill@1153, @2259, @1592, @1406 |
| DIS-02 room | the sandbars have one hazard, the river under a bar that is not there | dis-luit@237, @486, @760 |
| DIS-03 room | the tea row has one hazard, the plucker's basket | dis-basket@67, @2625, @94 |
| DIS-06 room | the retreating bank has one hazard, the slab clock | dis-bank@402, @305 |
| `dis05-biya` | the only trap is walking blind into the pit under the gamosas | dis-gamosa@891 |
| `dis05-atithi` | one trap: three gamosas over your feet at the pit | dis-gamosa@2528 |
| `dis06-majuli` | one trap: the river behind the slab clock | dis-bank@481 |
| `dis06-chapori` | one trap: the river where a slab has gone | dis-bank@2127 |
| `dis06-chang` | the stilt house stands in the bank's river: missing the ladder and walking off the house both drop into it | dis-bank@1203, @1684 |
| `dis07-ghar` | one trap: the gate's stakes when the group is not at it | dis-gate@1404 |
| `dis07-chowk` | one trap: the stakes, early, late or out of the ring | dis-gate@5236 |
| `dis08-kaziranga` | one trap: no floor where no rhino has flattened the grass | dis-beel@1000 |
| `dis08-bagori` | the charge is the only hazard: staying on the bank and leaving the hay early both stand in its line | dis-gorh@4390, @5125 |
| `dis09-chaal` | one trap: the ball down the oil | dis-roof@1980 |
| `dis09-dhal` | one trap: the ball down the oil, as on the first roof | dis-roof@2640 |
| `dis10-gamosa` | one trap: the blinding gamosa at the pit | dis-gamosa@3586, @3627 |

The nine kept acts from `dis05-biya` to `dis09-dhal` had no scripted death of their own before; each now has one ("walks straight on into it", or "stops on the oil before the rib" on the roofs).

Door endings: 03 `dis-reel@4871`, 07 `dis-net@7872`.

## Checkpoints, three lags

The probe replays each stretch from its checkpoint with a wrong move at lag 0, 6 and 12 ticks and times the run to the death. "-" means no death in that stretch. Sources: 01 and 05 from the last run after `f7ded2a`; 03 and 07 from the run after the reel and husori changes; 10 from the run after `b2c1caf`; 02, 04, 06, 08, 09 from the round-2 run (gameplay unchanged for them since).

| Stage | Checkpoints (s) | Stretches | Longest stretch | Worst replay lag 0 / 6 / 12 |
| --- | --- | --- | --- | --- |
| 01 | 2.9 5.5 6.5 8.5 16.1 24.6 | 7 | 8.4 | 7.9 / 7.4 / 7.4 |
| 02 | 7.1 9.3 14.8 15.0 21.9 | 6 | 7.1 | 6.0 / 6.0 / 6.0 |
| 03 | 7.4 15.7 16.7 23.4 29.7 32.6 34.5 | 8 | 8.3 | 7.1 / 7.1 / 7.1 |
| 04 | 6.8 7.3 13.8 13.9 19.5 | 6 | 6.8 | 5.5 / 5.5 / 5.5 |
| 05 | 3.6 5.7 7.7 9.5 9.6 18.5 18.8 20.7 22.6 25.3 | 11 | 8.8 | 6.4 / 6.4 / 6.4 |
| 06 | 3.6 3.7 8.4 8.5 15.2 15.3 17.8 20.9 | 9 | 6.8 | 5.5 / 5.0 / 5.0 |
| 07 | 21 checkpoints, 2.0 to 63.9 | 22 | 8.6 | 7.8 / 7.8 / 7.8 |
| 08 | 7.8 13.4 20.1 22.8 30.0 34.5 34.6 47.5 | 9 | 12.9 | 6.7 / 6.7 / 6.2 |
| 09 | 4.6 4.7 12.6 13.0 14.5 16.3 18.7 20.2 23.4 | 10 | 7.9 | 6.3 / 6.3 / 6.3 |
| 10 | 7.1 7.2 14.7 15.2 15.3 18.4 18.8 18.9 26.8 27.3 27.4 30.6 31.1 35.5 | 15 | 7.9 | 6.8 / 6.8 / 6.8 |

Before this round the worst replay was 13.6 s (07, husori yard) and 12.8 s (10, post-bank ending). After: 7.9 s (01). No replay is over 8 s and no stretch is over 25 s.

What changed for replay: the 07 husori singers move at 56 px/s and stay 140 ticks, and the ritual gate is 120 + 240 ticks. The muga reel cycle is 470 ticks, with a checkpoint 6 px before it (03). The 10 ending has checkpoints at D-36 and D-18, and the plucker moves at 42. The 01 ghat has a checkpoint where you wait (8.5 s).

**No checkpoint within 3.5 tiles past a trigger.** I measured this with a probe over each route. It counts as a trigger every `w.when` / `onPass` watch at the player's x when it fires, and every entity's `trig` x. It flags any checkpoint 0 to 56 px (3.5 tiles of 16 px) past one.

| Stage | Checkpoints | Triggers | Flagged |
| --- | --- | --- | --- |
| 01 | 6 | 9 | cp 58.5, 0.5 tiles past an `onPass` at 58.0. That pass only shows Tara's guide line after a death (`w.guide`) and changes nothing in the world, so I left it. |
| 02-09 | 5-21 | 1-10 | none |
| 10 | 14 | 10 | was cp 129.5, 0.2 tiles past the `dis10-gamosa` stall's reset (gamosa count to 0). The checkpoint moved to act x+1.0, before the reset. Re-probe: none. |

The probe does not see a trigger that is not a watch or a `trig` field. For example, a husori group starts from its own state, not from Dad's x. The earlier probe rows that showed a replay of 0.0 s with a death before the stretch (01 s6, 08 s3, s5) are not traced.

The `dis10-gamosa` checkpoint move (0.5 tiles earlier) was not re-run through the three-lag replay probe. It makes stretch s11 about 0.5 tiles longer (3.2 s before) and s10 shorter. Fairness for DIS-10 was re-run after it (below).

## Fairness, LDD_N=80

```
DIS-01: 6t 100%  12t 100%  18t 100%   | stretches at 0-12t: all 100%, door 100%
DIS-02: 6t 100%  12t 100%  18t 84%    | all 100%, door 100%
DIS-03: 6t 100%  12t 100%  18t 100%   | all 100%, door 100%
DIS-04: 6t 100%  12t 100%  18t 100%   | all 100%, door 100%
DIS-05: 6t 100%  12t 100%  18t 76%    | all 100%, door 100%
DIS-06: 6t 100%  12t 100%  18t 80%    | all 100%, door 100%
DIS-07: 6t 100%  12t 100%  18t 80%    | all 100%, door 100%
DIS-08: 6t 100%  12t 100%  18t 100%   | all 100%, door 100%
DIS-09: 6t 100%  12t 100%  18t 100%   | all 100%, door 100%
DIS-10: 6t 100%  12t 100%  18t 76%    | all 100%, door 100%
```

Full output: `fair-N80-round2.txt` beside this file. 02-04 and 06-10 ran at `b2c1caf`, and their gameplay has not changed since. 01 and 05 re-ran at `f7ded2a`. 07 and 10 re-ran at N=80 after the `dis-dhol-sink` trap and the gamosa checkpoint move, with the same numbers (appended to the file).

## Checks

- Full `npm test` with DIS on no allow-list, at `5fefcf3`: 18 files passed, 12 skipped; 1605 tests passed, 12 skipped. No test timed out, including the shared checkpoint test.
- `npm run typecheck`: clean.
- `npm run build:single`, then `node scripts/flows.mjs`: no errors.
- Sheets re-recorded and read after the round-2 changes: all ten, DIS-01 to DIS-10, copied to `shots/`. The 06:50 changes do not move any route (same win ticks), so I did not re-shoot.
- Docs: `docs/cities/DIS.md` has the section "Length, round 2: every idea in its home stage".
- Tip sha: `5fefcf3`.

## Not built, and why

The ferry and its ramp, the Kamakhya steps and goats, the tea auction, the Saraighat bridge trains and the Deepor Beel boats are not built. The budget went on the cuts, the seven new acts, the replay fixes and the fairness of the loom at 12 ticks of lag. Two or three of these per short stage, and about four more in 07 and 10, would put the stages back over their floors.

Not checked: I did not re-run the repeat-window probe this round. The three-lag replay probe was not re-run after the 0.5-tile `dis10-gamosa` checkpoint move. The trigger probe sees only watches and `trig` fields.
