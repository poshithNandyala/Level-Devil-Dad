# DIS QA round 3: FAIL

Tester: the same independent QA chat as rounds 1-2. Subject: `city/dis` at **383f6c2** (FIX-2 at 48979cc/dfc3702, FIX-3 at 383f6c2).
Worktree: `/local/home/saiposh/personal/ldd-wt/qa-dis`, detached at 383f6c2. My probes are untracked in `tests/qa/`, with copies in `QA/probes/`; I committed nothing.
Clock: 09:49-10:05 UTC. Outputs are in `QA/r3/`.

Pre-rulings applied:
- The finale room is plain.
- Plain doors stand.
- The storm act is cut.
- Route times are final: 10 34.2, 08 43.3, 04 11.2.
- Earlier rulings bind: round-1 FAIL.md pre-rulings (route times, act counts, 18t parked); FAIL-2 pre-rulings (04 open sky and egret sound are polish; `recause` is judged on correctness).

## What passes (my numbers)

| Check | Result | File |
|---|---|---|
| Diff e9afb1f..383f6c2 | only `src/game/cities/dis/`, `tests/cities/dis.ts`, `docs/cities/DIS.md`. No shared file, no package.json, no version bump | `git diff --stat` |
| tsc | clean | `r3/suite.txt` |
| Full suite (`tests/qa/**` excluded) | 18 files passed, 13 skipped; **1801 passed**, 20 skipped, 0 failed | `r3/suite.txt` |
| cpsafe strict `-t DIS` | 10 passed | `r3/cpsafe.txt` |
| Fair, LDD_N=80 | **100% at 6t and 12t on all ten**; all 10 doors and every stretch 100%. 18t: 02 84, 05 76, 06 76, 07 80, 10 76 (parked) | `r3/fair80.txt` |
| build:single + flows | no errors | `r3/flows.txt` |
| Route times (lag 0) | 01 22.6, 02 21.9, 03 33.6, 04 11.2, 05 32.0, 06 24.3, 07 88.3, 08 **43.3**, 09 34.6, 10 **34.2** | `r3/sweep-lag-captured.txt` |
| Lag-captured sweep (lag 0/6/11/12 × idle 0/37/120/251; idle, run, tap-jump at lag 0/6/12) | **0 deaths in 10,416 plays**, 93 capture points. Longest stretch 07 16.7 s (others ≤ 10.6). Worst replay 07 7.17, 01 7.13, 02 6.53, 05 6.41, 09 6.37, 08 6.25 s. No `nodeath` | same |
| walk-4.5 and tap-walk-4.5 | 01, 02, 03, 05, 07 and 10 clear. 04, 06, 08 and 09 die only past +4.5 (overshoot: +4.7/+4.8), as in rounds 1-2 | `r3/walk45.txt` |
| Causes per scripted play | 80 plays × 3 lags, all dying with the labelled cause; 0 mismatches | `r3/causecheck.txt` |
| Pairing (own NAIVE against its fix, plus stage pairs) | **31 pairs × 3 lags = 93 rows, all two causes at two ticks.** New rows: bagori `dis-gorh`@3909/3939/3969 x129 vs `dis-bagori-beel`@3819/3850/3880 x138; 10 talatal `dis-doba-ulta`@2785/2821/2863 x116 vs `dis-talatal-ulta`@2754/2807/2866 x120-121 (only 3 ticks apart at lag 12, but two causes); 10 stage `dis-pukhuri-lahe`@570/576/582 vs `dis-rope-ulta`@1909/1924/1940 | `r3/pairs-table.md` |
| Plays that win an act without its decision | none, at any lag (round 2's 04 hop-mash win is gone) | `r3/generic.txt` |

### Earlier findings

| Finding | Status | My reproduction |
|---|---|---|
| R2 B1 (06 channel, sanko forward, feast walk, 07 dhol run) | **closed** for those four rows | 06 traps walk-on `dis-garmur`; sanko walk-on `dis-sanko-gat`; feast walk-on `dis-feast-gat`; 07 dhol `dis-pukhuri` "No plank was up under you". Lines match the plays |
| R2 B2 (10 room) | **closed by ruling**: plain | the room is ground; the room's NAIVE dies at the first callback |
| R2 B3 (bagori re-asks jeep) | **closed** for the jeep read; see B3 below for what the new second play reads | halfway rest is 40 ticks; second play is "runs on ahead" |
| R2 B4 (talatal one play) | **closed** | two plays, two causes, two ticks at all lags (above) |
| 04 hop-mash (FIX-3) | **closed** | the mash dies `dis-garh-hop`@791/797/803, x45.9-46.0 (act+13.9-14.0). The walk-in FIX dies `dis-garh`@794/812/843, x45. **No other 04 play changed:** room NAIVE `dis-talatal`@314/338/374, FIX `dis-doba`@478/496/526, batah NAIVE `dis-kup`@711/730/761, and the generic walk/hop/back-off rows are identical to round 2. Only the FIX moved, +14 ticks (the well moved one column) |
| R1 F1-F7 | stay closed | |

## Blocking findings

### B1. Law 9 (b): lines that advise a move that is the act's other death

| Act | Death that shows the line (cause@tick, x, at lag 0/6/12) | Line shown | The advised move kills here |
|---|---|---|---|
| 10 `dis10-talatal` | NAIVE `dis-doba-ulta`@2785/2821/2863, x116 | "Doba! These steps fell from the bottom up, and you waited on one. / This stair goes the other way: race straight down it **and jump to the far side** before the fall reaches you." | **Played it** (`qa-dis-advice.test.ts`, `r3/advice.txt`): race down, then jump from act+16 / 16.5 / 17 / 17.5 / 18. Every take-off at every lag dies `dis-talatal-ulta`, the act's other death: e.g. from act+16, @2754/2758/2762, x120.8-121.4 ("you hopped up into its vault"). The answer is to run out, not jump |
| 02 `dis02-bhutbhuti` | NAIVE `dis-bhutbhuti`@2020/2050/2085, x86 | "…on the horn it does not move. **Stay on your bar** until the real siren and the new bar." | staying put on the bar is the act's FIX death: `dis-char-sink`@2085/2109/2137, x83 ("waits out the horn at the bar's far end without moving: it narrows under him"). The answer is to walk back along it, which `dis-char-sink`'s own line says |
| 06 `dis06-traps` | NAIVE `dis-dirru`@1714/1726/1738, x74-75 | "A ringing bell means that trap is about to go up. **Leave a ringing trap for a silent one.**" | leaving at the ring for the next trap is the act's FIX death: `dis-tip`@1654/1672/1689, x77-78 ("hops on at the ring to the next trap: it is still slack and tips"). `dis-garmur`'s line already says "silent **and has settled**"; `dis-dirru`'s does not |
| 08 `dis08-jeep` and `dis08-duijeep` | jeep NAIVE `dis-beel`@1013/1025/1037, x37; duijeep FIX `dis-beel`@2427/2445/2463, x78 | "Beel! There is no floor under the tall grass. / … A rhino flattens a strip when it charges at the jeep's dust: **wait**, then walk its strip." | waiting at the grass edge is the other death in both acts: jeep FIX `dis-gorh`@1699/1711/1723, x36 ("waits at the edge of the grass, where the second jeep is"); duijeep NAIVE `dis-gorh`@2709/2727/2745, x77 ("waits at the grass edge"). Jeep's own advice says "stand well back on the bank"; the line gives no place |

### B2. Law 9 (a): a line that describes a mistake the play did not make

| Act | Play (cause@tick, x at lag 0/6/12) | Line shown | Wrong because |
|---|---|---|---|
| 05 `dis05-atithi` | hop every 0.3 s: `dis-gamosa-gat`@698/705/711, x52.0-52.1 (act+20) | "Gat! **You walked into the pit**, and you could still see it. / Hop the pit from its edge." | he was hopping: the hops kept him clear of the givers, which is why he is not blind, unlike the walk-on, `dis-gamosa`@699. The city already splits walked from hopped for this kind of death (04 `dis-garh` / `dis-garh-hop`, 05 `dis-feast-gat` / `dis-pit`); this pit does not |

(I also checked sanko's "walked on into the ditch" for the short hop, long jump and mash at lag 0/6. Those plays die at the same tick as walk-on (1300/1307), so the hop does not carry Dad into the ditch, and the line is fair.)

### B3. Decision sweep: `dis08-bagori`, as now tested, is "don't flee, take refuge", the same as `dis06-wake` and `dis07-goru`

After FIX-2, bagori's two plays are "stay on the bank" (`dis-gorh`, x129) and "**run on ahead of it**" (`dis-bagori-beel`, x138). Its line is "It comes from behind you: get up on the haystack and let it charge past underneath".

- **`dis06-wake`** (F454 refuge-not-flight): "you can't outrun it: hop over the spur into its lee and let the wake run past". Its NAIVE is to run on and outrun it, `dis-dhal`.
- **`dis07-goru`**: a charging bull in the lane; "get out of the lane sideways, up on a verandah, and wait while it charges past".

Bagori's decision is the same in substance: something charges along your path from behind; don't run ahead, get up off its line and let it pass. Round 2's second play (off the hay too soon) hid this. The new one ("ran on ahead of the rhino") makes the act's test the F454 read. I passed bagori in rounds 1-2 on its old pair; the change in FIX-2 is why I raise it now.

**What would satisfy me:** a bagori decision whose two plays test something no other DIS act tests (for example, which side of the hay, or the strip it leaves behind it being the way on), or a ruling that the haystack refuge is distinct from the lee and the verandah.

## Decision sweep, changed parts (the rest stands from FAIL-2)

| Part | Decision | Closest row | Verdict |
|---|---|---|---|
| 10 room | plain bank to the first callback | (ruled plain) | ok |
| 08 `bagori` | rhino from behind: get up on the hay, don't run ahead | `dis06-wake` (F454), `dis07-goru` | **B3** |
| 10 `talatal` | steps fall bottom-first: race down and run out; don't hop under the low vault | breaks 04 room (stop on the penultimate step) | ok (law 7); B1 line |
| 04 `batah` | read the wells: lit = flooded; of the dark ones, the one the flame streams toward | unchanged; `dis-garh-hop` only names the mash | ok |
| The 17 new or changed lines | `dis-garmur`, `dis-sanko-gat`, `dis-sanko-pit`, `dis-nala`, `dis-feast-gat`, `dis-feast-back`, `dis-pukhuri`, `dis-pukhuri-lahe`, `dis-char-gat`, `dis-kaath-walk`, `dis-gamosa-gat`, `dis-japi-gat`, `dis-doba`, `dis-goru-lane`, `dis-cart-pukhuri`, `dis-bagori-beel`, `dis-talatal-ulta`, `dis-garh-hop` | read against every generic and scripted play | all fine except `dis-gamosa-gat` (B2). Also failing, but unchanged this round: `dis-doba-ulta`, `dis-bhutbhuti`, `dis-dirru`, `dis-beel` (B1) |

Law 7 on the finale callbacks:
- `dis10-dhol` (the beat slows; breaks 07): pukhuri-lahe@1336 / dhol-lahe@1384 at lag 0.
- `dis10-tug` (the teams changed ends; breaks 09): khaal-ulta@2377 / rope-ulta@2672.
- `dis10-talatal` (bottom-first; breaks 04).
- The door (go in front of the plucker; breaks 03).

Each breaks its own stage's rule without importing another stage's. Each has two plays, two causes and two ticks at lag 0/6/12 (`r3/pairs-table.md`).

## Generic probe, all ten stages (`r3/generic.txt`, `r3/generic-summary.txt`)

- **Coverage:** 6 plays × 3 lags over every act gives 558 rows. 75 (act, cause) groups, each read against its line.
- **Plays that win an act without its decision:** none.
- **Alive results:** "stuck (blocked)" where a play cannot get on (09 chaal walk-on, 10 talatal walk-on and hops, the back-offs at walls), and 06 flag hop-mash still alive at timeout ("play"; not a win).
- **Line faults:** apart from B1 and B2, every line names what met the play there.

## Polish (not blocking)

- The 04 open sky past the gallery and the missing egret sound (pre-ruled polish).
- The `dis-laru-plate` DECISIONS row text ("never wait on matte") is the allocator's.
- 10 talatal's pair is only 3 ticks apart at lag 12 (2863 against 2866). It meets the bar, but a small change could merge the two ticks.

## To re-test

1. B1: the four lines rewritten. Then rerun `qa-dis-advice.test.ts` (extended to whatever each new line advises) and `qa-dis-generic.test.ts` at 0/6/12, reading every line for (a) and (b).
2. B2: the atithi pit split walked/hopped, or the line made neutral.
3. B3: bagori's decision against `dis06-wake` and `dis07-goru`, or a ruling.
4. After any change: the suite, cpsafe, fair N=80, the lag-captured sweep, walk45, `pairs3.py`, `causecheck.py`, and the diff limited to DIS.

## Not checked

- The generic and advice probes use a late start for lag, not the full lagged-input model.
- I did not re-shoot sheets or phone frames this round; nothing visual changed except the 04 well's column.
- I did not check the Assamese lines one by one.
