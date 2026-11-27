# BBI · Bhubaneswar: second length pass

Branch `city/bbi`, worktree `/local/home/saiposh/personal/ldd-wt/bbi`, head `fe04121` (develop `6172e21` merged in,
which brings the checkpoint-test fix). Not pushed, no version bump. Only BBI paths changed (plus the BBI row of
`docs/CITIES.md` from the first build).

The rule I followed: an act that repeated a hazard and answer the stage already had was cut, not kept for its
seconds. New length comes only from betrayal types that BBI had not used before. Where a stage could not reach its
floor that way, it stops at its honest length. The numbers are below.

## Clear time per changed stage (scripted route, no deaths)

| Stage | Before (3048cec) | After | Floor | Status |
| --- | --- | --- | --- | --- |
| 01 | 25.4 s | 25.4 s | 25-35 | met (one checkpoint added, 14.5) |
| 02 | 28.9 s | 25.7 s | 25-45 | met |
| 05 | 62.8 s | 47.7 s | >= 60 | **short by 12.3 s** |
| 06 | 61.8 s | 39.8 s | >= 60 | **short by 20.2 s** |
| 07 | 121.2 s | 64.3 s | >= 120 | **short by 55.7 s** |
| 08 | 61.5 s | 38.3 s | >= 60 | **short by 21.7 s** |
| 09 | 63.0 s | 61.0 s | >= 60 | met |
| 10 | 99.4 s | 93.0 s | >= 90 | met |

03 and 04 are unchanged (25.8 s, 29.3 s).

## Acts added (all new `bbi-` ids; each has its advice line as its intro, a NAIVE death and a FIX death)

| Act | Stage | Betrayal type (new to BBI) | Source | A2 (first answer) | A3 (the answer that betrays A2) | NAIVE dies to | FIX dies to |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `bbi05-chheli` | 05 | a third party starts the idle machine: the goat walks the rice pounder and its head swings up | idle-world-you-start-it (slot 05) | jump from the straw only while the pounder lies flat | and only once the goat is on your side, or it butts you on the far bank | `bbi-chheli` @60 | `bbi-sinha` @333 |
| `bbi05-patra` | 05 | soot-after: the scribe's lines only show behind him | reserve BBI-04 Talapatra | wait for the soot | the leaves he wrote on hold, the blank ones are rotten | `bbi-patra` @100 | `bbi-khali` @787 |
| `bbi06-patta` | 06 | preview-panel: each painted panel shows the NEXT pit | reserve BBI-F2 Pattachitra | read the panel before stepping (the first pit holds all over: the plain beat) | the panel beside the second pit shows what comes after; use the one you passed | `bbi-sadha` @223 | `bbi-chitra` @243 |
| `bbi06-sutra` | 06 | a flaw in the motif: two undyed threads leave a hole that shows only on the bridge beat | loom-beat-aligns-threads (slot 06) | the shuttle still goes first | then hop the hole | `bbi-sutra` @544 | `bbi-shuttle` @427 |
| `bbi06-sari` | 06 | bounce: the dyers' wet sari throws you up, higher on the second bounce | 06's dye-yard setting (not one of the ten families; see Still short) | bounce in place first: steering on bounce one hits the bank's face | the second bounce is the last; after it they let go | `bbi-dhua` @190 | `bbi-sari` @293 |
| `bbi07-dui-baja` | 07 | the wrong drummer: the troupe follows the drummer across the pit | troupe-pose-platform-shapes (slot 07) | go on the far drummer's stop | his sticks are the warning too: the near drummer's still sticks don't mean you have time | `bbi-nacha` @72 | `bbi-thrown` @451 |
| `bbi07-bagudi` | 07 | it-passes: the raider's tag makes you "it", and the boys tackle whoever is it | reserve BBI-F1 Bagudi | tagged, run back over the chalk line to pass it on | hopping him is a tag too: he jumps | `bbi-bagudi` @213 | `bbi-chhuin` @366 |
| `bbi07-pada` | 07 | the tower is the bridge: it falls over towards you and its top lands on the edge you were taught to wait at | troupe-pose-platform-shapes (slot 07) | wait back from the edge | not too far back: it stands up again soon | `bbi-pada` @288 | `bbi-thrown` @522 |
| `bbi08-bhanwar` | 08 | the bowl drains: the water carries every badi to a hole by the far rim and takes it down | pakhala-pour-floats-grains (slot 08) | hop off before the hole | only at the very last moment: from further out the rim is out of reach | `bbi-bhanwar` @748 | `bbi-pakhala` @462 |
| `bbi09-jhadu` | 09 | a sweep that comes back: the caretaker's broom goes away slowly and returns fast and low | 09's Konark-plinth setting (not one of the ten families; see Still short) | let it go ahead, never catch it up | it returns before you reach the end: hop it | `bbi-jhadu` @36 | `bbi-pheri` @785 |

Ticks are counted from the act's start, and in every row the FIX's cause and tick differ from the NAIVE's (probe b).
No new act has two betrayals except as a ladder (A2, then A3 in the same room). Every new act follows a plain beat
from the act before it. I added no hidden items: none of the new rooms had a natural spot for one.

`bbi07-dweepa` (the shelter plinth, first pass) also got its own FIX death, `rest on the second bridge too`
(`bbi-thrown` @1026), replacing one that died the same way as its NAIVE.

## BBI-02's door

`bbi-goal-net` (the door inside the goal net that lifts after you let the ball score) was close to the shipped
`penalty` ending, so I replaced it with `bbi-turf-roll`. Match over: when you pass the halfway mark, the groundsmen
roll the turf up from the door end, and the roll comes back along the floor at you. Walking on gets you rolled
(`bbi-roll`). The answer is to get on the bench and let the roll pass under you, or to hop it. The keeper, the ball
and the net are gone from the door.

## What I cut (pure repeats: one hazard, one answer, new numbers)

- 02: `bbi02-dobara` (a quicker corner)
- 05: `bbi05-pokhari`, `bbi05-gaon` (the same still machines again), `bbi05-gali` (a longer bullock lane), `bbi05-kua` (a higher water lift)
- 06: `bbi06-jala`, `bbi06-buni`, `bbi06-pata`, `bbi06-tani`, `bbi06-dui` (more looms: let the shuttle by, cross)
- 07: `bbi07-mancha`, `bbi07-sahi`, `bbi07-stambha`, `bbi07-dhol`, `bbi07-raati` (more troupes: go at the stop)
- 08: `bbi08-handi`, `bbi08-majhi`, `bbi08-thali` (more bowls: the badi away from the second jug)
- 09: `bbi09-surya`, `bbi09-chakra` (more chariots: wait on the hub)

Their code is still in the stage files, unused. Deleting it is a tidy-up for later.

To meet the 8 s replay rule I also changed three timings. `bbi07-deepa`'s troupe now does wheel then bridge (it was
wheel, tower, bridge). `bbi07-dweepa`'s first troupe bridges first, and its second makes one tower before its bridge
(it was three poses). The goat walks faster.

## Checkpoints

- Every act starts with a checkpoint again, including the acts in 07 and 10 (the first pass had switched some of them
  off to keep the shared test under its 5 s limit). 01 has a new checkpoint at tile 14.5.
- Replay from the checkpoint to each scripted death's trap, measured with the fair test's lagged player. The longest
  replays are 01 7.6 s, 02 5.9, 03 5.5, 04 1.2, 05 7.0, 06 5.0, 07 7.1, 08 6.8, 09 6.6, 10 6.0 s. No trap is over 8 s
  at lag 0, 6 or 12.
- `tests/checkpoints.test.ts` and `tests/cpsafe.test.ts` pass on develop's fixed version. In the final full run,
  BBI-10's replay check took about 0.9 s.
- Calm spots: every act begins at a checkpoint, and no act lasts 25 s, so a calm checkpoint comes at least every 25 s.

## Probe output

The probe file is `bbi-probe.test.ts.txt` in this folder. It is a scratch vitest file and is not in the branch. The full
output is in `probes.txt`. Summary:

- **(a) identical windows.** For each stage, acts are grouped by (NAIVE death cause, FIX death cause and FIX play).
  A group of more than one act counts as a repeat, except for the one declared momentum beat (`bbi07-shrinkhala`).
  Result: `probe (a) repeats beyond one momentum beat: 0`. Before the cuts it was 7, the worst being 6 looms and 6
  troupes.
- **(b) FIX differs from NAIVE.** Result: `probe (b) acts failing: 22`. Every act added in this pass passes. The 22
  failures are acts from the first build and first pass that have no FIX death recorded: `bbi02-chhal`, `bbi04-karkhana`,
  05's `dhenki`, `gadi`, `tenda`, `khala`, `bail` and `chakki`, `bbi06-sidhi`, `bbi07-bandha`, 09's `ghoda`, `udaya`,
  `ratha`, `asta` and `ara`, and 10's `sidhi`, `deepa`, `nacha`, `udaya`, `konark` and `ratha`.

```
(b) BBI-05 bbi05-chheli       naive=bbi-chheli@60 fix=bbi-sinha@333 -> ok
(b) BBI-05 bbi05-patra        naive=bbi-patra@100 fix=bbi-khali@787 -> ok
(b) BBI-06 bbi06-patta        naive=bbi-sadha@223 fix=bbi-chitra@243 -> ok
(b) BBI-06 bbi06-sutra        naive=bbi-sutra@544 fix=bbi-shuttle@427 -> ok
(b) BBI-06 bbi06-sari         naive=bbi-dhua@190 fix=bbi-sari@293 -> ok
(b) BBI-07 bbi07-dui-baja     naive=bbi-nacha@72 fix=bbi-thrown@451 -> ok
(b) BBI-07 bbi07-bagudi       naive=bbi-bagudi@213 fix=bbi-chhuin@366 -> ok
(b) BBI-07 bbi07-pada         naive=bbi-pada@288 fix=bbi-thrown@522 -> ok
(b) BBI-07 bbi07-dweepa       naive=bbi-nacha@71 fix=bbi-thrown@1026 -> ok
(b) BBI-08 bbi08-bhanwar      naive=bbi-bhanwar@748 fix=bbi-pakhala@462 -> ok
(b) BBI-09 bbi09-jhadu        naive=bbi-jhadu@36 fix=bbi-pheri@785 -> ok
probe (a) repeats beyond one momentum beat: 0; probe (b) acts failing: 22
```

## Fairness (LDD_N=80), all ten stages

Every stage wins 100% at quick (0-6) and average (0-12) lag, and every stretch wins 100% at average lag. At relaxed
lag (0-18): 01 100, 02 100, 03 88, 04 96, 05 84, 06 100, 07 100, 08 84, 09 76, 10 76. The full output is in
`fair-BBI.txt`.

## Still short, and why

- **07 (64.3 s of 120).** I added three new pose betrayals and one reserve. The rest of the old length was "wait for
  the bridge, go at the stop" with new numbers, and I cut it. About 55 s more would take five or six more new
  betrayal types in the troupe family. I didn't find enough that avoid ideas already taken: a turning wheel as a
  platform is in the allocation's restricted list, and standing still to be held is listed as almost used.
- **06 (39.8 s of 60).** I added two loom-family acts and one reserve. The other loom acts I cut were the same
  shuttle answer.
- **08 (38.3 s of 60).** I added one family act. The other pour variants I designed repeated "ride the badi away
  from the jug" or the sinking-in-order idea that 09 uses.
- **05 (47.7 s of 60).** I added one family act and one reserve. The other idle-world variants I designed were
  start-it-on-purpose again (tenda and chakki already do that) or the goat's "wait for the pounder's head" answer.
- **Two new acts are from a stage's setting, not one of the ten families or three reserves.** `bbi06-sari` (bounce)
  and `bbi09-jhadu` (a returning sweep) are new to BBI but don't belong to an allocated family. 09 meets its floor
  only with `bbi09-jhadu`; without it, 09 is 53.7 s. Whether either one counts is your decision.
- **The finale (10) was not reworked in this pass.** Its callbacks are the first pass's set, in that order, and I didn't
  check each one against law 7 (a callback breaks the rule it taught). Only its checkpoints changed.
- 05 and 08 keep their one WTF beat each (05's door behind the step, 08's bowl). The new acts are tough beats, not WTF
  beats.
- I renamed `bbi09-jhadu` from a first draft themed on a Rath Yatra ritual, because the bible's Avoid list rules out
  Rath Yatra. It is now a plain caretaker.

## Proof

- `npx tsc --noEmit -p .`: clean.
- `npm test` on head `fe04121`, run once: 18 files passed, 12 skipped; 1648 tests passed, 12 skipped, 0 failed. BBI is
  on no allow-list.
- Shot sheets: `shots/BBI-02, 05, 06, 07, 08, 09-sheet.png` in this folder, re-shot after the change. I read 05, 06, 07
  and 08: the goat, the palm leaves, the panels, the sari bank, the troupes, the falling tower and the drain all
  read. I did not re-shoot 01 and 10 because only their checkpoints changed.
