# BBI · Bhubaneswar: length round 3

The branch is `city/bbi` in the worktree `/local/home/saiposh/personal/ldd-wt/bbi`. Develop `4c38bcb` is merged in
(a merge, not a rebase). Nothing is pushed and the version is not bumped. Only BBI files changed. The tip sha is in the
done report.

## What changed, by your rulings

1. **`bbi09-jhadu` (the deck sweeper) is out.** Gangtok owns sweeping, and its answer was the hop-a-returning-thing
   decision. 09 falls back to 55.1 s; the four tiles of lead-in ground are what take it above 53.7 s.
2. **`bbi06-sari` (the wet sari) is out.** I checked its decision against `docs/MECHANICS.md` and the open city
   branches. MECHANICS.md line 24 lists "bowls that bounce harder each use (BPL-05)" and says "any trampoline is
   taken". A sari that throws you higher on the second bounce is that idea, so the act is cut.
3. **The 02 door, `bbi-turf-roll`, has a new answer.** Match over, the groundsmen lift the astro-turf from both
   ends at once, and two rolls come towards the middle. A roll only takes turf. The safe ground is the ugly bare
   strip in the middle, where the turf is already up. The nice blue turf is what gets rolled.
   - Decision: *stand on the bare patch, not the grass*.
   - Walking on dies to the door-end roll (`bbi-roll`).
   - The obvious fix, waiting back on the grass, dies to the roll from behind (`bbi-roll-back`), at a different tick.
   - There is no bench and no hop. Both deaths are scripted MISTAKES of BBI-02 and pass.
4. **Dead code is deleted.** The 20 acts cut in round 2 are gone from the stage files: dobara, pokhari, gaon, kua,
   gali, jala, buni, pata, tani, dui (06), mancha, sahi, stambha, dhol, raati, handi, majhi, thali, surya and chakra.
   Their test routes and deaths went with them, and so did the 10 finale replays (see B). The `RAJA4`/`RAJA5`
   pieces, `rajaAct`, the broom and the sari are deleted too.

## A. The older acts that had no FIX death

These six now have an obvious-fix death with a different cause and a different tick:

| Act | NAIVE dies to (tick) | FIX dies to (tick) |
| --- | --- | --- |
| `bbi04-karkhana` | stop under the first torch: `bbi-agni` (220) | keep moving and jump the trough: `bbi-kunda` (180) |
| `bbi05-khala` | walk on into the yard: `bbi-jaanta` (72) | jump the mill, then climb over the cart: `crushed` (390) |
| `bbi07-bandha` | walk straight on: `bbi-nacha` (113) | take the second troupe's bridge to the high bank: `bbi-thrown` (1097) |
| `bbi09-ara` | stop on spoke 1 to make sure of it: `bbi-ara` (273) | (one play, below) |
| `bbi05-dhenki` | jump the pit, then use the stone as a stair: `bbi-sila` (262) | (one play, below) |
| `bbi05-gadi` | climb on to the cart: `bbi-gadi` (326) | (one play, below) |

`bbi05-khala`'s fix dies to the engine's generic `crushed` cause rather than a `bbi-` cause: the cart that starts
moving crushes you.

These acts have one play, so they are not counted as a FIX:

- `bbi02-corner`, `bbi02-chhal`: the only trap is the ball. The obvious fix (over the still ball, or hopping the
  ball that is let through) is the answer.
- `bbi05-dhenki`: the pounder is harmless from the straw; the stone stair is the one trap.
- `bbi05-gadi`: one trap, the bullocks pulling the cart into the beam; jumping the cart is the answer.
- `bbi05-tenda`: one trap, staying on the bucket; stepping off at the top is the answer.
- `bbi05-bail`: one trap, the cart; following well behind is the answer.
- `bbi05-chakki`: the mill's near half throws you back on to the bank alive, so the only death is the channel.
- `bbi06-sidhi`: the staircase loom has no shuttle; its only trap is the dye.
- `bbi09-ghoda`, `bbi09-ratha`: one trap, the slam; the other play, the hub, is the answer.
- `bbi09-udaya`, `bbi09-asta`: one trap, the water under spokes that are not up yet.
- `bbi09-ara`: one trap, the sinking spokes.

## B. The finale (10) against law 7

Every round-2 callback only replayed its rule: once more, again, the last chariot. I cut those 10 and rebuilt the
finale from callbacks that each break the rule their stage taught, in a new order. Each has a NAIVE death (the taught
rule) and a FIX death with a different cause and tick:

| Act | The rule it taught | Broken how | NAIVE | FIX |
| --- | --- | --- | --- | --- |
| `bbi10-patra` | 05: the written leaves hold | an old manuscript: the written leaves are the rotten ones | step on the written: `bbi-likhita` (842) | walk on before the soot: `bbi-patra` (99) |
| `bbi10-chhata` | 03: wait for a customer to open the parasol | festival day: every parasol is open, and a customer is what shuts it | wait on the first: `bbi-rangapani` (446) | land on the silk: `bbi-silk` (448) |
| `bbi10-bagudi` | 07: tagged, pass "it" back at the line | the boys let "it" through and tackle anyone else, for a moment | pass it back: `bbi-bagudi` (417) | tagged, then wait: `bbi-ghera` (483) |
| `bbi10-pada` | 07: wait back by the scuffs; the tower falls towards you | it falls away from your edge and is down only a moment: wait at the edge | wait back: `bbi-nacha` (511) | rest on it: `bbi-thrown` (491) |
| `bbi10-dui-baja` | 07: watch the drummer across the pit | tonight he is the one out of step; the troupe follows the drummer by you | go at his stop: `bbi-nacha` (72) | take your time: `bbi-thrown` (451) |
| `bbi10-deepa` | 07: wait for the bridge and walk under the lamps | the lamps hang down to the bridge; the wheel rides above them | walk under: `bbi-deepa` (612) | stay on the wheel: `bbi-thrown` (426) |
| `bbi10-tana` | 06 and 07: let the shuttle by; go at the drum's stop | a quiet loom with no shuttle (the plain beat), then a drummer who plays during the pose | go at his stop: `bbi-nacha` (977) | rest on the bridge: `bbi-thrown` (1683) |

Two things in the finale were not reworked:

- **The base room is unchanged:** the keeper's pads carry you on to a plinth with no horses, where any step starts
  it. That is already a break of 09's horses rule.
- **The ribbon door is unchanged.**

I did not find law-7 reworks for the keeper, the chariot, the rising spokes or the loom's own shuttle rule that fit
the time, so those are not in the finale. The finale is now 47.9 s against a 90 s floor (see below).

## C. 05-08 floors, from BBI-IDEAS-2.md

I read `/local/home/saiposh/personal/ldd-inbox/docs/cities/BBI-IDEAS-2.md` as data when it landed, about 07:44 IST.
Before building any candidate, I checked its decision against MECHANICS.md, BBI's own stage rules, and the acts the
other open branches just added. Those are LKO's `lko02-aadaab`, `lko07-photo` and `lko08-wapas`, DIS's `dis07-dhol`,
`dis07-bordoisila` and `dis09-tug` (DIS cut its loom), and KVT's plank acts.

**Built:**

| Act | Stage | Decision (one sentence) | NAIVE (tick) | FIX (tick) | Closest shipped idea and the difference |
| --- | --- | --- | --- | --- | --- |
| `bbi08-dati` (IDEAS C11) | 08 | *Let a badi go down the hole on purpose: hop to the other one, so yours plugs the hole and the water stops.* | stay on your badi: `bbi-bhanwar` (457) | hop for the far rim at the last moment, the bhanwar answer: `bbi-pakhala` (441) | `bbi08-bhanwar` (escape the drain). Here the drain you learnt to flee is the thing you feed. Nothing in MECHANICS.md sacrifices a floater to stop a hazard. |
| `bbi05-thaka` (IDEAS C7) | 05 | *Stop the machine yourself, and stop it when the stone is at its top.* | touch nothing and go under the sweep: `bbi-pathara` (239) | stop it the moment you reach the plate: `bbi-pani` (104) | `bbi05-tenda` (start the lift on purpose). This is its mirror, undo on purpose, plus a phase choice. No shipped idea stops a running machine at a chosen phase. |

Each built act has an intro line (its advice), at least one plain beat after the act before it, and unique `bbi-`
ids. No hidden item was added: neither room had a natural spot for one.

**Rejected after the decision check:**

- **C1 pyramid (07 momentum):** tiers rise on each drum stroke and you climb one ahead. That matches DIS's
  `dis07-dhol` (planks rise on the beat, the one behind sinks; hop one per beat) and BBI's own rising spokes.
- **C3 guru's stick (07):** a stop that is a false signal, and you read which stop it is. That matches LKO's
  `lko07-photo` (a short test flash first: wait for the real one), and BBI's own `bbi07-dui-baja` (the wrong drummer).
- **C4 pattasari deadline (07):** a cloth bridge usable only inside a tension window. That matches DIS's `dis09-tug`
  (the rope is a bridge only while it is taut).
- **C2 practice wall (07 shelter):** its answer is to walk out behind the tumblers as they leave. That is "follow a
  hazard going away, then deal with its return", the decision the broom was cut for.
- **C5, C6, C8, C9, C10, C12:** not built in the time. C5 needs a person who walks to machines, C6 a belt linking two
  machines, and C8 loom changes to freeze the beat. C9's fringe gaps are too small to drop a walking Dad. C10 and C12
  are the weakest-ranked.

Only one 07 act (C2) survived the research list's own momentum and shelter roles, and its answer was taken, so 07 got
nothing new this round. Its shelter (`bbi07-dweepa`) and momentum (`bbi07-shrinkhala`) beats stay.

## Clear time (scripted route, no deaths)

| Stage | Round 2 (fe04121) | Now | Floor | Status |
| --- | --- | --- | --- | --- |
| 01 | 25.4 s | 25.4 s | 25-35 | met |
| 02 | 25.7 s | 26.4 s | 25-45 | met |
| 03 | 25.8 s | 26.7 s | 25-45 | met |
| 04 | 29.3 s | 29.3 s | 25-45 | met |
| 05 | 47.7 s | 51.4 s | >= 60 | **short by 8.6 s** |
| 06 | 39.8 s | 38.2 s | >= 60 | **short by 21.8 s** (the sari cut) |
| 07 | 64.3 s | 65.2 s | >= 120 | **short by 54.8 s** |
| 08 | 38.3 s | 43.1 s | >= 60 | **short by 16.9 s** |
| 09 | 61.0 s | 55.1 s | >= 60 | **short by 4.9 s** (the sweeper cut) |
| 10 | 93.0 s | 47.9 s | >= 90 | **short by 42.1 s** (the replays cut) |

Where the numbers stop and why:

- **07:** every 07 candidate I had, and all four in the research file, repeats a decision the game already asks. The
  turning-wheel platform is restricted, and standing still to be held is almost used. I am not padding it.
- **10:** law 7 removed all ten replay callbacks. Seven callbacks now break their rule. I couldn't fit more real
  breaks for the keeper, the chariot, the spokes or the shuttle in the time.
- **06 and 09:** shorter because ruled-out acts were removed (the sari, the broom). I didn't find a new loom-family or
  hub-family decision in the time.
- **05 and 08:** each gained one real act, and each is still short by the number shown.

## Checkpoints (shared cpsafe at develop 4c38bcb: idle, run and tap-jump at lag 0, 6 and 12)

**The fix.** Acts whose first checkpoint sat under 4.5 tiles from their first pit now start with four tiles of
plain ground. These are `bbi02-chhal`, `bbi03-gali`, `bbi03-mela`, `bbi05-thaka`, `bbi05-bail`, `bbi06-tana`,
`bbi06-sidhi`, `bbi06-sutra`, `bbi06-rachh`, `bbi07-bandha`, `bbi07-dui-baja`, `bbi09-udaya`, `bbi09-asta`,
`bbi09-ara`, `bbi10-chhata` and `bbi10-tana` (`LEAD` in `levels.ts`). No trap was changed and the shared test was not
edited.

**Explicit checkpoints moved:**
- `bbi04-karkhana`: from 8.5 and 23.5 (1.5 tiles before each trough) to 16.5 and 31.5 (past each trough).
- `bbi07-bandha`: a new one on the bank between its two pits, at 14.3.
- `bbi10-tana`: moved from 12.5 (1.5 tiles before the troupe pit) to 9.4 (4.6 tiles before it). Its loom is one
  thread shorter to make room.

**Before and after (tile x, world):**

| Stage | Before (round 2 layout; failing ones in the integrator's table) | After |
| --- | --- | --- |
| 02 | 32.5, 68.5, **98.5**, 127.5 | 32.5, 68.5, 98.5, 131.5 |
| 03 | **32.5**, **52.5**, 75.5 | 32.5, 56.5, 83.5 |
| 04 | 32.5, **40.5**, **55.5**, 67.5 | 32.5, 48.5, 63.5, 67.5 |
| 05 | 32.5, 44.5, 58.5, 60.5, 82.5, 98.5, 124.5, 133.5, 143.5, **158.5**, 178.5, **200.5**, 222.5, 239.5 | 32.5, 44.5, 58.5, 60.5, 82.5, 98.5, 124.5, 133.5, 143.5, 158.5, 182.5, 204.5, 230.5, 247.5 |
| 06 | **32.5**, **52.5**, 68.5, **90.5**, **107.5**, 122.5 | 32.5, 56.5, 76.5, 98.5, 119.5, 138.5 |
| 07 | 32.5, 58.5, **74.5**, **108.5**, 123.5, 147.5, 165.5, 191.5, 212.5 | 32.5, 58.5, 74.5, 92.3, 112.5, 131.5, 155.5, 173.5, 199.5, 220.5 |
| 08 | 32.5, 54.5, 76.5, 96.5, 126.5 | unchanged |
| 09 | 32.5, **56.5**, 84.5, 112.5, **138.5**, **166.5**, 195.5 | 32.5, 56.5, 88.5, 116.5, 142.5, 174.5, 207.5 |
| 10 | 44.5, **66.5**, 90.5, 108.5, 123.5, **139.5**, **151.5**, 166.5 | 44.5, 66.5, 94.5, 118.5, 136.5, 151.5, 167.5, 180.4, 198.5 |

`npx vitest run tests/cpsafe.test.ts -t BBI` is green for every BBI stage, and it is green inside the full run.

**Replay from the checkpoint to each scripted trap (fair test's lagged player):**

| Stage | Lag 0 | Lag 6 | Lag 12 | Longest at |
| --- | --- | --- | --- | --- |
| 01 | 7.6 s | 7.6 s | 7.6 s | waiting for the gardener |
| 02 | 6.3 | 6.3 | 6.4 | `bbi02-chhal` |
| 03 | 5.3 | 5.4 | 5.5 | the third parasol |
| 04 | 5.1 | 5.2 | 5.2 | `bbi04-karkhana` trough |
| 05 | 6.7 | 6.8 | 7.1 | `bbi05-patra` |
| 06 | 5.4 | 5.4 | 5.5 | `bbi06-tana` |
| 07 | 7.0 | 7.1 | 7.2 | `bbi07-dweepa` |
| 08 | 6.5 | 6.7 | 6.8 | `bbi08-kansa` |
| 09 | 3.9 | 4.0 | 4.1 | `bbi09-udaya` |
| 10 | 7.7 | 7.7 | 7.8 | `bbi10-tana` |

No trap is over 8 s at any lag. Every act starts at a checkpoint, and no act takes 25 s, so a calm spot comes at
least every 25 s.

## Probes (full output in `probes-round3.txt`; the scratch probe file is `bbi-probe.test.ts.txt`)

- **Probe (a):** `probe (a) repeats beyond one momentum beat: 0`.
- **Probe (b):** `probe (b) acts failing: 13`. All 13 are the one-play acts listed in A, each with its one-line
  reason. No two-play act fails. Every act added in round 2 or round 3 passes.

## Fairness (LDD_N=80, all ten stages; also `fair-BBI.txt`)

```
BBI-01: 6t 100%  12t 100%  18t 100%   stretches s0-s5 100%, door 100%
BBI-02: 6t 100%  12t 100%  18t 100%   stretches s0-s3 100%, door 100%
BBI-03: 6t 100%  12t 100%  18t 88%    stretches s0-s2 100%, door 100%
BBI-04: 6t 100%  12t 100%  18t 96%    stretches s0-s3 100%, door 100%
BBI-05: 6t 100%  12t 100%  18t 84%    stretches s0-s13 100%, door 100%
BBI-06: 6t 100%  12t 100%  18t 100%   stretches s0-s5 100%, door 100%
BBI-07: 6t 100%  12t 100%  18t 100%   stretches s0-s9 100%, door 100%
BBI-08: 6t 100%  12t 100%  18t 76%    stretches s0-s4 100%, door 100%
BBI-09: 6t 100%  12t 100%  18t 76%    stretches s0-s6 100%, door 100%
BBI-10: 6t 100%  12t 100%  18t 80%    stretches s0-s8 100%, door 100%
```

## Proof

- `npx tsc --noEmit -p .`: clean.
- `npm test`, one full run after the develop 4c38bcb merge: 18 files passed, 12 skipped; 1786 tests passed, 12 skipped,
  0 failed. BBI is on no allow-list.
- `npm run build:single && node scripts/flows.mjs` (with CHROME_PATH set to the installed headless shell): "no
  errors".
- Shot sheets: BBI-02, 03, 05, 06, 07, 08, 09 and 10 re-shot and copied to `shots/` here. I read 02 (the two rolls
  meeting the bare strip) and 10 (the old manuscript, the open parasols, bagudi, the falling tower, the two drummers,
  the low lamps, the quiet loom and the reversed drummer). 04 changed only its checkpoints and was not re-shot.

Not checked: phone play and sound. The approval wait cost about 75 minutes (07:57 to 09:12 IST). The budget was
extended by that much, and the work stopped inside it.
