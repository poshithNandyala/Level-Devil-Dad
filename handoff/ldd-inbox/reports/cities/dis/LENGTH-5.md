# DIS length, round 5: the rest of v3/v3.1, and a Talatal act

Branch `city/dis`, worktree `ldd-wt/dis`. The round started at `b7bfa0b`; the tip is **`e9afb1f`**. develop f8288e9 is merged (`deacaa7`). No push, no version bump. All eight unbuilt v3/v3.1 rows are built, and so is one Talatal act for 04. The last heavy run finished at 07:10 UTC, inside the 06:15-08:45 budget.

## Still short, and why

Route times are the route play's `winTick / 120`, in seconds (`probes/causes-r5.txt`).

| Stage | Floor | Round 4 end | Round 5 end | Short by | Two-play acts | What is honest |
| --- | --- | --- | --- | --- | --- | --- |
| DIS-01 | 25-35 | 22.6 | 22.6 | 2.4 | room | Unchanged. v3 assigns nothing. |
| DIS-02 | 25-45 | 19.1 | 25.3 | - | 1 (bhutbhuti) | F447 is built and 02 is at its floor. |
| DIS-03 | 25-45 | 40.2 | 40.2 | - | room | Unchanged. |
| DIS-04 | 25-45 | 8.5 | 11.2 | 13.8 | 1 (batah) | One Talatal act passed the gate. The other sentences I tried are listed below; each matched a registry row. |
| DIS-05 | ≥ 60 | 22.7 | 32.0 | 28.0 | 4 (sanko, feast, kaath, machan) | Every v3 row is built. F451 adds about 4 s, against v3's estimate of 10. Its decision is two hops and a "don't wait", and padding it would break the rule. |
| DIS-06 | ≥ 60 | 20.7 | 24.1 | 35.9 | 3 (wake, traps, flag) | Every v3 row is built. F453 is withdrawn, and v3.1 §3 found no further legal 06 act. |
| DIS-07 marathon | ≥ 120 | 79.8 | 96.7 | 23.3 | 7 (dhol, rope, goru, tekeli, card, cart, pepa), plus bordoisila with the stage FIX | F457, F459 and the rope-walk are built. Nothing in v3/v3.1 is left for 07. |
| DIS-08 | ≥ 60 | 45.4 | 49.4 | 10.6 | 4 (bogoli, jeep, duijeep, bagori) | F461 is built (about 4 s). Nothing is left. |
| DIS-09 | ≥ 60 | 28.8 | 36.9 | 23.1 | 3 (tug, sluice, tunnels) | F462 is built (about 8 s). Nothing is left. |
| DIS-10 finale | ≥ 90 | 45.1 | 45.1 | 44.9 | 3 (dhol, bordoisila, tug with the stage FIX) | Unchanged this round. |

The long stages (05-10) are under their floors because the allocation has no more rows for them. Each act is as long as its decision; none is padded.

## Acts, one row each (new this round)

The registry check was against `DECISIONS.md` lists 1-2 and the v3/v3.1 families. "Assigned" means v3 checked the row and assigned it to DIS. Seconds are the act's span in the route (the act marks in `probes/replay-r5.txt`).

| Stage | Act | Family | Decision | Registry check | NAIVE cause@tick | FIX cause@tick | s |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 02 | `dis02-bhutbhuti` | F447 false-cue-among-true | The ferry's horn sounds like the siren, but the level post does not move. Stay, walk back along the narrowing bar, and hop at the real siren. | assigned (B5) | dis-luit@2020 (hop on the horn) | dis-char-sink@2085 (wait out the horn at the bar's far end) | ~6 |
| 04 | `dis04-batah` | Talatal's own place (new) | Of three stairwells down, go down the one your lamp's flame leans toward. The lit one is the flooded vault, and one dark one has fallen in. | closest S12 `dis07-bordoisila` (wind-direction read for shelter) and AMR-07 (the hole is the way on). Different: here you follow the draught to choose a way through. It is not shelter, and not "take the hole". | dis-kup@711 (the lit well) | dis-garh@780 (the first dark well) | ~3 |
| 05 | `dis05-kaath` | F451 spike-slides-under-jump | Each split slides when you jump at it. Hop short onto where the first was, then over it where it stopped. Don't wait for it to settle. | assigned (B11) | dis-kaath@1998 (an ordinary hop) | dis-gamosa@2421 (waits; the japi-maker's wife, a chasing giver, adds the third gamosa; blind, he walks into the ditch) | ~4 |
| 06 | `dis06-flag` | F455 marker-moves-floor-stays | The ghat man moves the flag twice as the river rises; the gangplank stays. Hop over the ghat man, then run-jump from the plank's end to the bank. | assigned (B20) | dis-luit@2309 (hop to the flag) | dis-gamosa@2283 (goes where the flag was, the plank's far end where the ghat man stands: third gamosa, blind off the end) | ~3.5 |
| 07 | `dis07-pepa` | F457 (sound beat) | The leaving group won't stop. Wait back from the gate and go through in the coming group's ring. | assigned | dis-gate@10173 | dis-stakes@10926 | ~9 |
| 07 | `dis07-rope` | v3.1 dheki re-skin | Cross from the anchored end; never wait at the moving end. | v3.1 I5 | dis-pat@3044 | dis-paakoni@3364 | ~5 |
| 07 | `dis07-cart` | F459 treat-trail | Never stop on the rolling cart. Walk forward along it and jump up onto the jetty. | assigned | dis-herd@7215 | dis-pukhuri@7205 | ~3 |
| 08 | `dis08-bogoli` | F461 birds-up-means-charge | Cross while the egrets sit on the hidden rhino. Wait at the edge while they are up, and don't wait a whole round. | assigned (new) | dis-bogoli@3270 (goes in with them up) | dis-jui@3766 (waits a whole round: the rangers' burn) | ~4 |
| 09 | `dis09-tunnels` | F462 portal-chain-backwards | Walk the chain of six tunnel mouths: step, wait for the grate, step. On the last pier, wait for the bridge (2.7 s). | assigned (B28) | dis-roof@3131 (the oiled beam over the vault) | dis-vault@3178 (takes one tunnel and runs on: the grate is still down) | ~8 |

**Places the allocated cause names changed, and why:**
- F461's NAIVE is `dis-bogoli`, not `dis-gorh`, because `dis-gorh`'s hint is about the dust line.
- F462's FIX is `dis-vault`, not `dis-khaal`, because `dis-khaal` is the tug rope's ditch.
- F451's FIX dies in the ditch while blind, so its cause is `dis-gamosa` (02's own clock does not apply here).

All other cause names are as allocated.

**Struck at the 04 gate (sentences tried, not built):**
- "The inner gate opens only after the outer one has shut behind you: go in and let it shut." This is TVM-05: between two gates, stop where the portcullis cannot reach, and don't flinch back.
- "Dust trickles before the ceiling brick falls: stop short of the dust." This is AMR-07's falling ceiling and HYD-06's echo stone.
- "Walk, never hop, under the bats." This is `lko08-mehrab`: walk through that arch, don't hop.
- "Grit dropped down a well lands at once in a shallow one: hop down there." This repeats `dis04-batah`'s "pick the well by a tell" in the same stage.
- "Keep out from under the guard walking on the grating above." This is `lko07-batti`: the lamplighter's ladder sweep.
- "The lock fills and lifts you to the next floor." This is S1: the stair's "wait for the rising step" may not be re-asked.

Every tick is in `probes/causes-r5.txt`.

## Probe 1: same-tick FIX scan

Every NAIVE/FIX pair, old and new, dies to a different cause at a different tick (`probes/causes-r5.txt`). The closest ticks are still different traps:
- `dis05-feast`: dis-kol-paat@1704 and dis-pit@1710.
- `dis07-cart`: dis-herd@7215 and dis-pukhuri@7205.
- `dis06-flag`: dis-luit@2309 and dis-gamosa@2283.

## Probe 2: identical-window scan

The script is `probes/windows.py`, run over `probes/replay-r5.txt`. The output is `probes/windows-r5.txt`.

| Stage | Most repeated identical window |
| --- | --- |
| 01 | 2× 1.0 s (room) |
| 02 | 2× 1.5 s (room); `bhutbhuti` 0 |
| 03 | 3× 0.5 s (bagan) |
| 04 | 0 (room, `batah`) |
| 05 | 2× 0.5 s (room); `kaath` 0 |
| 06 | 2× 0.5 s (wake); `flag` 0 |
| 07 | 3× 0.5 s (bordoisila); `rope` 2×, `cart` 0, `pepa` 0 |
| 08 | 0; `bogoli` 0 |
| 09 | 4× 0.5 s (`chaal`, the labelled momentum beat); `tunnels` 0 |
| 10 | 3× 0.5 s (dhol, tug, talatal) |

Every new act has 0 identical repeats.

## Probe 3: lag-captured sweep (qa6)

This uses the same method as round 4 (`probes/qa6-dis.test.ts.txt`): lag 0/6/11/12, spawn idle 0/37/120/251. Every changed stage was swept after its last change:
- 07 in Part 1, after the pepa, rope and cart acts.
- 02, 04, 06, 08 and 09 after their acts: `probes/qa6-sweep-r5-part2.txt`.
- 05 again after the kaath route fix.

| Stage | Capture points | Plays | Deaths | Longest stretch | Worst replay (lag 0 / 6 / 12) |
| --- | --- | --- | --- | --- | --- |
| DIS-02 | 5 | 560 | 0 | 9.4 s | 6.33 / 6.43 / 6.53 s |
| DIS-04 | 2 | 224 | 0 | 7.9 s | 3.98 / 4.13 / 4.38 s |
| DIS-05 | 11 | 1232 | 0 | 8.3 s | 6.41 / 6.41 / 6.41 s |
| DIS-06 | 8 | 896 | 0 | 8.1 s | 2.76 / 2.81 / 4.72 s |
| DIS-07 | 28 | 3136 | 0 | 16.7 s | 7.17 s worst |
| DIS-08 | 11 | 1232 | 0 | 10.1 s | 6.25 / 6.25 / 6.25 s |
| DIS-09 | 11 | 1232 | 0 | 8.6 s | 6.17 / 6.26 / 6.37 s |

**0 deaths in 8,512 plays.** Every route wins at every lag and idle.

## Per-tick replay

The rows are the sweep's: death tick minus the tick of the last checkpoint taken, along each scripted play, at lag 0/6/12.

| Stage | Play | Replay (lag 0 / 6 / 12) |
| --- | --- | --- |
| DIS-07 | time card: waits at the gate | 7.17 s (Part 1 sweep) |
| DIS-02 | m1 | 6.33 / 6.43 / 6.53 s |
| DIS-05 | m7 | 6.41 / 6.41 / 6.41 s |
| DIS-09 | m4 | 6.17 / 6.26 / 6.37 s |
| DIS-08 | m3 | 6.25 / 6.25 / 6.25 s |

All are under 7.5 s.

## cpsafe

The strict three-play gate (`tests/cpsafe.test.ts`) passes for all ten stages in the full suite, and the lag-captured sweep above found nothing either.

Changes made for it:
- `dis04-batah`'s wells moved two tiles on (cp x+1.5, first well x+7) after the first cpsafe run found a run play reaching the lit well.
- The new acts' checkpoints are each at least 4.5 tiles before anything the three plays reach.

## Fairness, LDD_N=80 (once, at the end)

| Stage | 6t | 12t | 18t |
| --- | --- | --- | --- |
| DIS-01 | 100% | 100% | 100% |
| DIS-02 | 100% | 100% | 84% |
| DIS-03 | 100% | 100% | 100% |
| DIS-04 | 100% | 100% | 100% |
| DIS-05 | 100% | 100% | 76% |
| DIS-06 | 100% | 100% | 76% |
| DIS-07 | 100% | 100% | 80% |
| DIS-08 | 100% | 100% | 100% |
| DIS-09 | 100% | 100% | 100% |
| DIS-10 | 100% | 100% | 76% |

The full run had DIS-05 at 55% at 12t: the kaath stretch, where a late second hop meets the slid split. I fixed the route (`e9afb1f`: the second hop comes at once after the short one) and re-ran DIS-05 alone. It is now 100/100/76, and every stretch is 100% at 0-12 ticks.

The output is in `fair-N80-round5.txt`; the DIS-05 re-run is appended at its end.

## Sheets, flows, suite

- **Sheets:** re-recorded for 02, 04, 05, 06, 07, 08 and 09, and all seven read. Copied to `shots/DIS-0X-sheet-r5.png`. What each shows:
  - 02: the bhutbhuti on the far channel and Tara's "That's the siren".
  - 04: the gallery with one glowing well and two black ones before the wall. The lamp flame is small at sheet scale.
  - 05: the splits in the lane and the wife behind.
  - 06: the gangplank under the risen water, the ghat man and the flag on its bamboo out over the water.
  - 07: the rope-walk, the cart and the pepa gates.
  - 08: the tall grass with the egrets' rhino and "the birds flew off".
  - 09: the tunnel mouths with grates on the piers, and the oiled beam with its balls.
- **Flows:** `npm run build:single`, then `node scripts/flows.mjs`: no errors.
- **Full suite** at `e9afb1f`: 18 files passed, 13 skipped; 1808 tests passed, 20 skipped. Typecheck is clean (`probes/suite-r5.txt`).
- **Shared files:** none touched. All edits are in `src/game/cities/dis/`, `tests/cities/dis.ts` and `docs/cities/DIS.md`. The SandField's timed mode (`go(w, silent)`) is in the city's own `entities.ts`.
- **Tip:** `e9afb1f`.

## Not built, and why

- **F453:** withdrawn (Kavaratti's).
- **A second Talatal act for 04:** each sentence I tried matched a registry row or repeated `dis04-batah` (list above).
- Every other assigned row is built.

Not checked, and the risks:
- The 18t columns under 90% (02, 05, 06, 07, 10) are as they were in round 4, and are parked.
- The 04 lamp flame reads small at sheet scale. I did not play it by hand.
- A stray `pkill -f vitest` early in Part 2 may have stopped other worktrees' vitest runs (kvt, qa-kvt3 processes were running). Those owners may need to re-run.
