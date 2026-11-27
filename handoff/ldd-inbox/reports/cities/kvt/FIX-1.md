# KVT (Kavaratti) fix round 1, answering QA FAIL round 1

Branch `city/kvt`, tip **054f593**. Merged develop twice (merged, never rebased): `9d193f6` (as `cff7712`)
and `4c38bcb` (as `0c90214`). `origin/develop` is still 4c38bcb and is an ancestor of the tip. No push, no
version bump. No shared file was edited: `tests/modules.test.ts` was changed only locally to run the strict
checks, then restored.

Commits this round:
- `3aa3a02`: lead-in ground, inner checkpoints, the plank kill, choora's two gaps, varambu's three heaps.
- `51ea435`: cpsafe green.
- `77e4b3b`: one descent decision, padding cut, the tide reversal.
- `03d2ddb`: replay under 7.5 s.
- `eb0ce32`: refreeze.
- `a7cdf3d` and `054f593`: docs.

Between 08:00 and 09:12 IST the work stopped: four tool approvals expired unanswered, and I reported it each
time. The budget was extended by that time.

## Checks

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| Full `npm test`, KVT removed from `EXEMPT` in tests/modules.test.ts (then `git checkout`) | **1657 passed, 12 skipped, 18 files**. This includes develop's new strict `tests/cpsafe.test.ts` for all ten KVT stages and `jumpaudit` |
| `npx vitest run tests/cpsafe.test.ts -t KVT` with KVT off the allow-list | **10 passed** (was: KVT-04, 07, 08, 09, 10 failing, 14 checkpoints) |
| `npm run build:single` + `node scripts/flows.mjs` | built; "no errors" |
| `LDD_N=80` fairness, 02-10 | table below; at least 96 per stage and stretch at 6 and 12 ticks |
| Shot sheets re-recorded and read | KVT-04, 07, 08, 09, 10 in `shots/` here (see the end) |

## B1. Calm checkpoints: what moved, before and after

The rule I applied: an act's first water edge sits at least 4.5 tiles past its checkpoint, or the checkpoint
moves back onto flat ground before the act. Both helpers are in the new file `src/game/cities/kvt/lead.ts`:

- `lead(act)` puts n tiles of plain ground in front of the act. Its geometry, triggers, inner checkpoints and
  test route all move with it.
- `back(act, k)` moves the act's checkpoint k tiles back (`cp0: false`, `cps: [-k]`). I used it for the
  shared-route acts on 04, 07 and 08.

| Act | First water before (tiles past cp) | Fix | After |
| --- | --- | --- | --- |
| kvt09-pavizham | 3.5 | lead 1 | 4.5 |
| kvt09-kodumudi | 2.5 | lead 2 | 4.5 |
| kvt09-varambu | 1.5 | lead 3 | 4.5 |
| kvt09-murivu | 5.5, but the crest is level with the shore | lead 2 | 7.5 |
| kvt10-midden, palaka, kallu, kamaanam, nizhal, veliyettam | 2.5 | lead 2 | 4.5 |
| kvt10-thengu | 1.5 | lead 5 (also for B2) | 6.5 |
| kvt10-paaru | 3.5 | lead 3 (also for B2) | 6.5 |
| kvt10-kannadi, thoni | 3.5 | lead 1 | 4.5 |
| kvt10-irakkam | 2.5 | lead 5 (also for B2) | 7.5 |
| KVT-04 kvt04-tailwind (cp0: a tap-jump rode the tailwind into the pit) | 5.5 | `back` 2 | cp at x30 |
| KVT-04 door `kvt-glider` (cp1: a tap-jump picked up the wing) | wing 2.1 | ending `space` 16 → 19 | wing 5.1 |
| KVT-07 kvt07-crabs | 1.5 | `back` 3 | cp at x29 |
| KVT-08 kvt08-weed, kvt08-dolphins | 2.5 | `back` 2 each | cps at x30, x64 |
| kvt09-kadalbhitti inner cp, on the sea wall | 4.5, but a running tap-jump went 4.7 | the wall is a tile longer before the first break | 5.5 |
| kvt10-choora inner cp | (tuna overhead: a tap-jump is hit) | inner cp removed | none |

Checkpoint lists, before (0837c78 frozen) and after (054f593 frozen):

```
KVT-04  [32.5, 65.5]                               -> [30, 65.5]
KVT-07  [32.5, 68.5, 97.5]                         -> [29, 68.5, 97.5]
KVT-08  [32.5, 66.5, 103.5]                        -> [30, 64, 103.5]
KVT-09  [34.5, 76.5, 136.5, 186.5, 228.5, 280.5, 324.5, 363.5]
     -> [34.5, 55, 67.5, 85, 107.5, 127.5, 158.5, 171.5, 189.5, 222.5]
KVT-10  [32.5, 66.5, 100.5, 130.5, 172.5, 224.5, 254.5, 280.5, 316.5, 338.5, 362.5, 406.5, 428.5, 452.5, 472.5, 502.5, 525.5]
     -> [32.5, 68.5, 104.5, 136.5, 162.5, 178.5, 218.5, 253.5, 265.5, 279.5, 292, 315.5, 339.5, 365.5, 387, 391.5, 416.5, 440.5, 461.5, 492.5, 520.5]
```

Three-play, three-lag table:

- **Probe 1, QA's own `probe5`:** each checkpoint is captured on the route played at lag 0 / 6 / 12 (idle
  0 / 78 / 156). From it: idle 4 s, run right 0.3 s then idle, and tap-jump forward then idle.
- **Probe 2, develop's strict `cpsafe`:** run 0.3 s, and a tap-jump held forward until landing, each at lag
  0 / 6 / 12, from every checkpoint.

| Stage | Checkpoints | QA probe5 deaths, lag 0 / 6 / 12 | cpsafe (strict) |
| --- | --- | --- | --- |
| KVT-04 | 2 | 0 / 0 / 0 | pass |
| KVT-07 | 3 | 0 / 0 / 0 | pass |
| KVT-08 | 3 | 0 / 0 / 0 | pass |
| KVT-09 | 10 | 0 / 0 / 0 | pass |
| KVT-10 | 21 | 0 / 0 / 0 | pass |
| KVT-01, 02, 03, 05, 06 | (unchanged) | n/a | pass |

QA found 10 dying checkpoints on 09/10 in round 1, and cpsafe found 14 on 04/07/08/09/10. Neither probe now
finds any.

## B2. Replay at or under 7.5 s

**Method (`probe6`, a scratch copy of QA's probe, deleted after).**
- The route is played at lag 0 / 6 / 12 (idle 0 / 78 / 156).
- At every 10th tick of the route I branch three wrong moves: stop, run on, and run with a jump every 40 ticks.
- Then every single tick within 10 ticks either side of each stretch's coarse worst.
- Replay is the death tick minus the capture tick of the checkpoint Dad last captured (QA's measure).

This is per-tick around each stretch's worst, not per tick over the whole route. A full per-tick sweep costs
about 24 minutes per stage and lag at 10 µs per tick.

New inner checkpoints (act-relative columns):

| Act | Inner cp |
| --- | --- |
| kvt09-pavizham | 20, on the crest |
| kvt09-kodumudi | 16, on the summit |
| kvt09-kadalbhitti | 20.5, on the sea wall |
| kvt09-varambu | 10.5, on the rock islet |
| kvt10-aama | 26.5 |
| kvt10-irandu | 12.5 |
| kvt10-kaattu | 13 |
| kvt10-veliyettam | 20, on the tide shore |

Each is at least 4.5 tiles from water and at least 3.5 tiles before any trigger; kodumudi's Tara trigger
moved from x+29 to x+29.5 to keep that.

Two other changes:
- The door ending `kvt-sand-arm` has `space` 13 (was 10). A jump over its checkpoint now lands before the arm,
  so the jump captures it.
- The thengu, paaru and irakkam leads above stop a run-and-jump from leaping over an act's checkpoint
  straight into its water. QA's worst cases were runs that never touched ground after the checkpoint.

Worst replay per stretch after the fix, in seconds (lag 0 / 6 / 12; a dash means no death from that stretch):

```
KVT-09  cp0 4.10/4.45/4.50  cp1 2.18/2.18/2.18  cp2 3.98/4.32/4.37  cp3 2.16/2.77/2.92  cp4 5.28/-/-
        cp5 5.29/5.64/5.89  cp6 2.73/2.64/2.25  cp7 2.03/2.23/2.43  cp8 2.88/5.07/5.17  cp9 1.08/1.23/1.32
KVT-10  cp0 3.38/3.48/3.53  cp1 5.47/5.77/6.02  cp2 3.99/4.16/3.42  cp3 6.08/6.08/6.08  cp4 1.50/1.55/1.60
        cp5 6.06/7.27/7.44  cp6 3.80/3.77/3.71  cp7 3.99/4.04/4.09  cp8 4.53/4.58/4.63  cp9 2.15/1.07/2.29
        cp10 4.81/4.39/4.76 cp11 5.05/5.08/5.49 cp12 6.99/6.97/7.12 cp13 5.92/6.52/7.12 cp14 1.38/1.32/0.72
        cp15 2.52/1.92/2.31 cp16 2.93/3.17/3.38 cp17 1.92/1.91/1.92 cp18 5.18/5.22/5.12 cp19 6.25/6.50/6.73
        cp20 1.68/1.77/1.82
```

The worst on either stage is **7.44 s**: KVT-10 cp5 at lag 12, choora into thengu. Before the fix the worst
was 9.6 / 11.2 / 11.5 s on 09 cp1 and 10.2 / 10.4 / 10.4 s on 10 cp4. No 09/10 stretch is over 7.5 s at any
lag.

## B3. Padding: windows before and after

| Act | Before | After |
| --- | --- | --- |
| kvt09-varambu | 11 identical heaps (3 wide, spacing 4) | 3 heaps, widths **3, 1, 5**, gaps 2 and 1; a solid rock islet between the 2nd and 3rd (the checkpoint) |
| kvt09-murivu | 3 identical cuts (2 wide, rubble 4, spacing 10) | 2 cuts, **2 and 3** tiles; the second needs a longer jump |
| kvt09-pavizham | 7 steps, 5 identical lips | 4 steps, the lip over 2 of them (one ladder: the slide, then the lip) |
| kvt09-kodumudi | 8 up (3,3,3,3,2,2,2,2), 8 down | 4 up (**3, 3, 2, 2**: one ladder, wide then narrow), 4 down |
| kvt10-veliyettam | 7 identical heads (4 wide, spacing 5) | 3 heads, widths **4, 3, 4**, gaps **1, 1, 2**, and a new rule (B4) |
| kvt10-choora | 3 identical one-tile gaps | 2 gaps, **1 and 2** tiles (the second needs a held jump) |
| kvt09-irangal, kvt09-kuzhi | descent windows identical to kodumudi's | cut (B4) |

Route lengths now:
- **KVT-09:** 36.7 s (4400 ticks), under the 60 s floor (see "Still short").
- **KVT-10:** 93.1 s (11176 ticks).

## B4. The plank kills; one descent; the tide reverses the lagoon rule

**The plank (kvt10-palaka).** The far planks past the rotten one (x+11 to x+15) are rotten too. When Dad
lands on them they fall, and the section of catwalk hung under them falls with them, so he goes into the water.
The answer is unchanged: stand on the rotten plank, drop to the catwalk and walk under the planks, which hold.

Tested from a scripted jump at the plank's near end: the jump-over play dies by splash at tick 1180. The FIX
dies by splash at tick 591 (in midden). A new MISTAKE scripts the jump-over: "jump over the rotten plank, as
Tara says and as at the jetty".

**Descents.** I kept kodumudi's "walk off each step, never hop down". `kvt09-irangal` and `kvt09-kuzhi` are
cut, with their routes and mistakes. Both re-asked that decision; kuzhi's climb also re-asked "land deep".

**veliyettam vs cracked glass.** veliyettam now reverses KVT-08:
- The heads go under while you **move** on them (40 ticks of moving). Standing still for 20 ticks settles
  them, and they hold (`SinkStep` with `sinks: 'move'`).
- Tara's line, the lie, is now "Odu, Dad! Nilkkalle! | Run, Dad! Don't stop!".
- The answer: stand still, take short walks with a stop between, and hop from a standstill.
- The MISTAKE "run across the heads without stopping, as Tara says and as on the lagoon" dies by splash at
  tick 7682.
- Cracked glass keeps "holds only at a run". The stage now asks "keep moving" once (glass) and "stop" once
  (heads), opposite answers.

**Cause@tick, every scripted play (lag 0):**

```
KVT-04  NAIVE spikes@64  FIX hit@226  M propellers spikes@353
KVT-07  NAIVE kvt-pinched@1106  FIX splash@1409  M climb high kvt-pinched@1773  M climb a little kvt-pinched@1548
KVT-08  NAIVE splash@286  FIX splash@537  M sandbar fell@264
KVT-09  route won@4400  NAIVE splash@262  FIX spikes@813
        M summit hop down splash@1888 (kodumudi)   M loose block splash@2843 (kadalbhitti)
        M ridge land deep splash@3164 (varambu)    M little hop splash@3854 (murivu)
KVT-10  route won@11176  NAIVE kvt-octopus@179  FIX splash@591
        midden kvt-octopus@798; palaka (NEW) splash@1180; kallu kvt-octopus@1680; aama kvt-hatchling@2450;
        choora hit@3509; thengu kvt-pinched@4283; irandu kvt-bitten@4935; kaattu splash@5691;
        kamaanam spikes@6638; nizhal splash@6923; veliyettam (NEW rule) splash@7682; paaru splash@8370;
        kotta splash@8959; kannadi splash@9218; thoni splash@9533; irakkam kvt-bitten@10544; door kvt-octopus@11120
```

**Decision sweep (one sentence per act; none repeats another KVT act or a shipped one I know of):**

- **KVT-09:**
  - Room: on the slide, walk to the far end and tap up.
  - pavizham: under the lip, a tap, never a full leap.
  - kodumudi: narrow steps take the far tile; over the summit walk off, never hop down.
  - kadalbhitti: a heap in the break you land deep on, a lone block you jump whole.
  - varambu: on a ridge only the middle holds.
  - murivu: jump well past the cut, never just over it.
  - Door: three hops slide the heap off the door, the fourth tips you in.
- **KVT-10:**
  - midden: a bare hole goes through, a pink head was yellow.
  - palaka: the rotten plank is the way down, and the planks past it are rotten too.
  - kallu: the far tile is an octopus, land in the middle.
  - aama: run on from the nest behind, wait for the one ahead.
  - choora: walk under the high tuna, hop the low ones.
  - thengu: the crab is in the crown, leap from the trunk.
  - irandu: wait for the second strike.
  - kaattu: jump with the tailwind, in the calm against the headwind.
  - kamaanam: ride under the arch, step off coming down.
  - nizhal: step on after the beam has passed.
  - veliyettam: stand still on the heads; moving sinks them.
  - paaru: jump and the reef rises.
  - kotta: step off as the basket passes the bottom.
  - kannadi: the glass holds only at a run.
  - thoni: chase the boat, it is not coming back.
  - irakkam: wait for the tide step and the moray.
  - Door: jump the sand that moves.

## Fairness, LDD_N=80 (quick / average / relaxed; stretches at average)

```
KVT-02: 6t 100%  12t 100%  18t 80%    s0 100  s1 100  door 100
KVT-03: 6t 100%  12t 100%  18t 76%    s0 100  s1 100  door 100
KVT-04: 6t 100%  12t 100%  18t 76%    s0 100  s1 100  door 100
KVT-05: 6t 100%  12t 100%  18t 81%    s0 100  s1 100  door 100
KVT-06: 6t 100%  12t 100%  18t 80%    s0 100  s1 100  s2 100  door 100
KVT-07: 6t 100%  12t 100%  18t 100%   s0 100  s1 100  s2 100  door 100
KVT-08: 6t 100%  12t 96%   18t 76%    s0 100  s1 100  s2 96  door 100   (splash @74 x1, @75 x2)
KVT-09: 6t 100%  12t 100%  18t 100%   s0-s9 100, door 100
KVT-10: 6t 100%  12t 100%  18t 84%    s0-s20 100, door 100
```

KVT-10's relaxed result fell from 98 to 84. I report it here; it is not part of the 6 t / 12 t bar. The likely
cost is the stand-still tide heads, but I did not trace it.

## Refrozen numbers, explained per stage

- **KVT-04:** route 1588 → 1901 ticks; checkpoint 32.5 → 30. The glider ending's space went 16 → 19 and the
  tailwind act's checkpoint moved back. NAIVE spikes@64 and FIX hit@226 are unchanged.
- **KVT-07:** checkpoints only (32.5 → 29). Route, NAIVE and FIX are unchanged.
- **KVT-08:** checkpoints only (32.5 → 30, 66.5 → 64). Route 2259, NAIVE and FIX are unchanged.
- **KVT-09:** route 7233 → 4400 (irangal and kuzhi cut, the staircases, ridge and cuts shortened, leads added).
  FIX 799 → 813: the one tile of lead before pavizham, walked before the same lip death. NAIVE 262 unchanged.
  Checkpoints as listed in B1.
- **KVT-10:** route 10817 → 11176. Leads add about 31 tiles, veliyettam stops on each head, and choora is 12
  tiles shorter. FIX 564 → 591: the two tiles of lead before midden, walked before the same bare-hole death.
  NAIVE 179 unchanged.
- **KVT-01, 02, 03, 05, 06:** unchanged.

## Polish

Not done: the nizhal lit-step contrast, the tide-head death line, and the 08 margin (still 96, the same idle
phase about 290).

## Still short, and why

- **KVT-09 is 36.7 s, not 60 s.** The padding cuts (11 heaps to 3, 3 cuts to 2, 7+8+8 steps to 4+4+4) and
  cutting the two repeated descents took 23 s out. I did not add a new act in the budget; any new act needs a
  decision sentence checked against KVT, the shipped cities and the ruled-taken list first. The honest number
  is 36.7 s.
- **KVT-07 crab palms: replay from cp0 is 13.3-15.3 s** (QA's probe5, lag 0/6/12). A run-and-jump from the
  palm crowns flies over the bend act's checkpoint into its water, and the crab act has no calm ground inside
  it for a checkpoint. QA's B2 named 09/10 only. Fixing it needs a lead before `kvt07-bend`, whose route lives
  in the shared tests/acts.ts.
- **The B2 sweep is per-tick only around each stretch's coarse worst** (coarse step 10 ticks). A true per-tick
  sweep of every tick was over the budget.
- **Relaxed lag (18 t) on KVT-10 fell to 84.** It is reported, not traced.

## Risks

- **Malayalam still unverified by a native speaker:**
  - "vettikkalanju" and "neerali";
  - the Tara and npc lines from rounds 2 and 3;
  - this round's new veliyettam line, "Odu, Dad! Nilkkalle!".
- `back()` moves the act's own checkpoint off its first column (`cp0: false`) on 04, 07 and 08. Those stages
  are not `lives: 'act'`, so no act-lives start is lost.

## Shot sheets (read)

`shots/KVT-04-sheet.png`, `KVT-07-sheet.png`, `KVT-08-sheet.png`, `KVT-09-sheet.png`, `KVT-10-sheet.png`.

- **09:** the four-step pavizham with two lips, the shorter summit, the sea wall, the three-heap ridge with its
  rock islet, and the two cuts all read clearly.
- **10:** the plank catwalk with the hung section under the far planks, the three tide heads of different
  widths, and the arch dolphin read clearly.
- The shared stage card's "Found it!" still overlaps the subtitle on the first frame.
