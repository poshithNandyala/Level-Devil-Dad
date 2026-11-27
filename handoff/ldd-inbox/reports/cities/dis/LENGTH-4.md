# DIS length, round 4: allocation v3

Branch `city/dis`, worktree `ldd-wt/dis`. The round started at `9b80259`; the tip is **`b7bfa0b`**. develop d398868 is merged (`38e949c`). No push, no version bump. The budget ran 10:30 to 13:00 IST, and the work ended at about 11:40.

## Still short, and why

Route times are the route play's `winTick / 120`, in seconds.

| Stage | Floor | Round 3 end | Round 4 end | Short by | What is honest |
| --- | --- | --- | --- | --- | --- |
| DIS-01 | 25-35 | 22.6 | 22.6 | 2.4 | v3 assigns nothing: a second tea boy would be the same decision. |
| DIS-02 | 25-45 | 19.1 | 19.1 | 5.9 | F447 (liar horn) is not built. It needs a timed SandField mode (the horn must arrive while a real siren is due), and that did not fit. |
| DIS-03 | 25-45 | 40.2 | 40.2 | - | At its band. |
| DIS-04 | 25-45 | 18.6 (pitha, TAKEN) | 8.5 | 16.5 | The new Talatal room is a short room (F448, about 5 s). The door lost its crepe pan (S1), so only the rolling laru are left. v3 assigns no act for 04. |
| DIS-05 | ≥ 60 | 12.4 | 22.7 | 37.3 | F449, F450 and F452 are built. F451 (the sliding spike) is not: its FIX needs the third gamosa from a host behind you, which did not fit. |
| DIS-06 | ≥ 60 | 10.2 | 20.7 | 39.3 | F454 and F456 are built. F453 is Kavaratti's and F455 is not built. v3 already said 06 ends about 48 s with all of them. |
| DIS-07 marathon | ≥ 120 | 64.4 | 79.8 | 40.2 | Built: F458 (bull), F460 (tekeli) and the bordoisila direction read. Cut: the dheki (I5). Not built: the rope-walk (v3.1 re-skin), F457 (sound beat) and F459 (treat trail). The momentum beat is the dhol, the shelter beat is bordoisila, and the sound beat is still missing. |
| DIS-08 | ≥ 60 | 38.7 | 45.4 | 14.6 | The twist (two jeeps) is built. F461 (egrets) is not built. |
| DIS-09 | ≥ 60 | 21.8 | 28.8 | 31.2 | F463 (sluice) is built. F462 (tunnel chain) is not built. |
| DIS-10 finale | ≥ 90 | 42.5 | 45.1 | 44.9 | The cold pan is out with 04's shine rule; `dis10-talatal` breaks 04's new rule. The door is recast (S8). Five callbacks now. |

**The "≥ 5 acts with both NAIVE and FIX" bar on long stages is met only by 07.** 07 has dhol, goru, tekeli, card and bordoisila. 05 has feast, machan and sanko (3); 06 has wake and traps (2); 08 has jeep, duijeep and bagori (3); 09 has tug and sluice (2). In 10, dhol, bordoisila and tug have a FIX; talatal and gamosa are one-play callbacks.

## Rulings, as applied

| Id | Ruling | What I did |
| --- | --- | --- |
| S1 | The DIS-04 shiny/matte room is taken (Daman's ice). | Cut the pitha room and `bhogali`. Built Talatal (F448). Removed the crepe pan from the `dis-laru-plate` door. `dis10-thanda` (the cold pan) is gone; `dis10-talatal` breaks the new 04 rule. |
| S8 | Recast the DIS-10 door. | The bars rise 9 tiles ahead of the plucker and sink as she passes; she starts behind you, so you go in front of her. NAIVE (wait to follow her, as in 03) → `dis-basket`; running ahead → `dis-luit`. |
| S9 | Recast the DIS-07 door as a cadence read. | The net comes in two stretches with a bamboo stake between them. The fishers pull in strokes (40 ticks pull, 120 rest), and standing on the net during a pull is `dis-net`. You cross a stretch in a rest and wait on the stake. Running straight across, Kavaratti's answer, is the scripted death. |
| S12 | `dis07-bordoisila` must be a direction read. | The hail drives in on the wind, under the granary too; only its lee, the two columns downwind, is clear. NAIVE (shelter under the roof) → `dis-hail`; FIX (run on past the granary) → `dis-bordoisila`. |
| I5 | The dheki object belongs to BBI; the re-skin is the jute rope-walk (V3.1). | Cut `dis07-dheki`. I did not build the rope-walk: I could not make "cross nearest the anchored end of the swing" a side-view lane in the time left. |
| F453 | Withdrawn (Kavaratti's B16). | Skipped. |
| W5 | Labelled momentum beats. | 05 `atithi` and 09 `chaal` stay labelled as momentum beats; there is no third window. |
| 08 | The second read is a labelled twist of the room. | `dis08-duijeep`, labelled as the room's twist (not a new family). |

## Acts, one row each

The registry check was against `DECISIONS.md` lists 1-2 and the v3 rows of the other five cities. "Assigned" means v3 checked the row and assigned it to DIS; no new matches turned up. Seconds come from the replay probe's route samples, measured before the last 05 and 04 changes.

| Stage | Part | Family | Decision | Registry check | NAIVE cause@tick | FIX cause@tick | s |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 04 | room Talatal | F448 collapsing-stair-penultimate-rises | Keep ahead of the falling stair and stop on the step before the last: it rises back. | assigned (B7) | dis-talatal@300 | dis-doba@478 | ~5 |
| 05 | `dis05-atithi` | gamosa, labelled momentum beat | The gamosa rule once more, then a giver before a pit to hop. | W5 | dis-gamosa@699 | one play | 6.5 |
| 05 | `dis05-sanko` | F452 remembered-gap-is-bridged | Blind under three gamosas, walk the nala you remember: a bamboo has been laid over it (its shadow shows). | assigned (B10) | dis-beam | dis-pit | ~3 |
| 05 | `dis05-feast` | F449 pickup-row-is-floor | The Uruka feast on banana leaves is the floor: walk it, never jump for a pitha. | assigned (B18) | dis-kol-paat@1374 | dis-pit@1381 | 2.0 |
| 05 | `dis05-machan` | F450 scaffold-deadline-collapse | Keep up with the planking and be off before the drum roll drops it. | assigned (B6) | dis-machan@2282 | dis-luit@1633 | ~7 |
| 06 | `dis06-wake` | F454 refuge-not-flight | Hop the spur into its lee and let the wake pass; then go. | assigned (B13) | dis-dhal@900 | dis-bank@920 | 6.0 |
| 06 | `dis06-traps` | F456 bell-names-the-moving-platform (sound beat) | Leave a ringing trap for a silent one; a trap just let down is slack and tips. | assigned | dis-dirru@1714 | dis-tip@1655 | ~8 |
| 07 | `dis07-bordoisila` | shelter beat, recast (S12) | The wind comes before the hail: stand in the granary's lee, not under it. | S12 | dis-hail@1376 | dis-bordoisila@1339 (stage FIX) | 6.0 |
| 07 | `dis07-dhol` | momentum beat | Planks rise on the beat and the beat quickens: one plank per beat. | kept | dis-pukhuri@1960 | dis-dhol-sink@2692 | 8.5 |
| 07 | `dis07-goru` | F458 pause-before-charge | When the bull stops and lowers its head, leave its lane sideways, up on a verandah step. | assigned (B17) | dis-goru@3366 | dis-goru-lane | 13.5 |
| 07 | `dis07-tekeli` | F460 shout-steers-hazard | The blindfolded man swings where the crowd shouts: stand where they are not shouting. | assigned | dis-lathi@4768 | dis-lathi-ghur@4641 | 4.0 |
| 07 | `dis07-card` | time card (round 3) | Not before the card's time; spend it on the bench, off every deer corridor. | kept | dis-gate@5450 | dis-horin@5616 | 9.0 |
| 07 | `dis07-chowk` | husori ritual twist | Stay in the ring at the middle gate until it opens. | kept | dis-gate@6336 | one play | ~26 with door |
| 08 | `dis08-jeep` | rhino twist (rests halfway) | Stay back till the second jeep sends it on. | kept | dis-beel@1013 | dis-gorh@1699 | 11.5 |
| 08 | `dis08-duijeep` | room's labelled twist (v3 08 row) | The rhino charges the nearer noise, not the louder: stand off the end of the near jeep's strip. | v3 | dis-gorh@2709 | dis-beel@2427 | 7.0 |
| 08 | `dis08-bagori` | rhino from behind | Up on the hay until both charges have gone. | kept | dis-gorh@3426 | dis-beel@4309 | ~19 with door |
| 09 | `dis09-tug` | royal games | Go on the far team's flag while the rope is taut. | kept | dis-khaal@722 | dis-rope@1017 | 8.5 |
| 09 | `dis09-chaal` | roof, labelled momentum beat | The same pads, run and leap. | W5 | dis-roof@1980 | one play | 6.0 |
| 09 | `dis09-sluice` | F463 bell-opens-the-sluice | On the bell be up on the embankment; go once it drains, and don't stay through a second flood. | assigned | dis-sluice@2327 | dis-roof@2999 | ~10 with door |
| 10 | `dis10-dhol` | callback, breaks 07 | The drummer slows: hop only when the next plank is up. | own | dis-pukhuri@995 | dis-dhol-sink@1043 | 8.0 |
| 10 | `dis10-bordoisila` | callback, breaks 07 | The old granary falls: jump the channel on the gust. | own | dis-bordoisila@2106 | dis-bhoral@2198 | 4.0 |
| 10 | `dis10-tug` | callback, breaks 09 | The teams changed ends: go on green. | own | dis-khaal@2513 | dis-rope@2807 (stage FIX) | 8.5 |
| 10 | `dis10-talatal` | callback, breaks 04 | The steps fall bottom-first: race straight down. | own | dis-doba@3684 | one play | 4.0 |
| 10 | `dis10-gamosa` | callback, breaks 05 | A hop over the third giver lands in the fourth's arms. | own | dis-gamosa@4111 | one play | ~13 with door |
| 01 | room (bench) | carrier | Wait back from the bench; pass the boy while he pours. | kept | dis-spill@1143 | dis-pool@1189 | |
| 06 | room (spurs) | silt-behind-the-spur | Jump to the silt step behind each spur. | kept | dis-porcupine@199 | dis-bank@215 | |

**Doors.**
- 07 net (S9): running straight across dies to dis-net@8879.
- 10 plucker (S8): waiting to follow her dies to dis-basket@4562; running ahead dies to dis-luit@4318.

Every tick is in `probes/causes-r4.txt`.

**Struck, not built:** none of the v3 rows I built matched lists 1-2. Rows I did not build: F447, F451, F453 (withdrawn), F455, F457, F459, F461, F462 and the rope-walk.

## Probe 1: same-tick FIX scan

Every counted NAIVE/FIX pair dies to a different cause on a different tick (table above; the source is `probes/causes-r4.txt`). The closest ticks are a few apart, and those pairs still die to different traps:
- `dis05-feast`: dis-kol-paat@1374 / dis-pit@1381.
- `dis07-bordoisila`: dis-hail@1376 / dis-bordoisila@1339.
- `dis06-wake`: dis-dhal@900 / dis-bank@920.

One-play parts carry a one-line reason in `ONE_PLAY` in `tests/cities/dis.ts`:
- 02 room
- 03 room
- 05 `atithi`
- 07 `chowk`
- 09 `chaal`
- 10 `talatal`
- 10 `gamosa`

## Probe 2: identical-window scan

The script is `probes/windows.py`, over the replay probe `probes/replay-r4.txt`. It samples every 0.5 s along the route, recording what stop, run and jump die of at lag 0. Two windows are identical when they have the same signature and the same length inside one act. The full table is in `probes/windows-r4.txt`.

| Stage | Most repeated identical window |
| --- | --- |
| 01 | 2× 1.0 s (room) |
| 02 | 3× 0.5 s (chapori) |
| 03 | 3× 0.5 s (bagan) |
| 04 | 0 |
| 05 | 2× 0.5 s (room); the new acts have 0 |
| 06 | 2× 0.5 s (wake) |
| 07 | 3× 1.0 s (card, the gate corridor); the others ≤ 3× 0.5 s |
| 08 | 0 |
| 09 | 4× 0.5 s (chaal, the labelled momentum beat) |
| 10 | 3× 0.5 s (dhol, tug) |

No act repeats a hazard window past 3 samples of 0.5-1.0 s. The only 4× is 09 `chaal`, the labelled momentum beat.

## Probe 3: the lag-captured sweep (qa6)

The method is the tester's `qa6.test.ts` (Patna FIX-7), copied as `probes/qa6-dis.test.ts.txt` and run as a scratch file. For each stage, the route runs at lag 0, 6, 11 and 12 with spawn idle 0, 37, 120 and 251. Each checkpoint is taken where that lagged run takes it and rebuilt by `replay()`. From there the probe plays idle 4 s, run 0.3 s and tap-jump after 0, 6 and 12 ticks (7 plays). It also measures the replay from the last checkpoint to every NAIVE, FIX and MISTAKE death, per tick, at lag 0/6/12. Output: `probes/qa6-sweep-r4.txt`.

| Stage | Capture points | Plays | Deaths | Longest stretch | Worst replay (lag 0 / 6 / 12) |
| --- | --- | --- | --- | --- | --- |
| DIS-01 | 6 | 672 | 0 | 8.7 s | 7.13 / 7.13 / 7.13 s |
| DIS-02 | 3 | 336 | 0 | 9.4 s | 6.33 / 6.43 / 6.53 s |
| DIS-03 | 7 | 784 | 0 | 9.6 s | 6.29 / 6.29 / 6.29 s |
| DIS-04 | 1 | 112 | 0 | 7.4 s | 3.98 / 4.13 / 4.38 s |
| DIS-05 | 9 | 1008 | 0 | 5.8 s | 6.41 / 6.41 / 6.41 s |
| DIS-06 | 6 | 672 | 0 | 8.1 s | 4.72 s worst |
| DIS-07 | 22 | 2464 | 0 | 16.7 s | 7.17 / 6.47 / 6.47 s |
| DIS-08 | 9 | 1008 | 0 | 10.1 s | 6.25 / 6.25 / 6.25 s |
| DIS-09 | 9 | 1008 | 0 | 8.0 s | 6.17 / 6.26 / 6.37 s |
| DIS-10 | 15 | 1680 | 0 | 9.9 s | 3.79 / 3.84 / 3.87 s |

**0 deaths in 9,744 plays; every route wins at every lag and idle.** The worst replay in the city is 7.17 s (07, the time card's "waits at the gate" mistake), under 7.5 s. No stretch is over 25 s.

The first full sweep found these, and they are fixed:
- **03:** 64 deaths at cp0 x14.5 (the plucker) and 8 at cp6 x82.0 (the reel). The checkpoints moved to x12 and D-8.
- **09:** 48 deaths at the `chaal` checkpoints x72.5/x86.5 (the oil). They moved one tile back, on to the pads.
- **04:** the route failed at lag 11/12, overshooting the rising step. The step is now 3 tiles wide.
- **06:** the route failed at lag 6+ off the narrow traps. The traps are 3 wide with longer windows.
- **07:** the bull route failed at lag 6+. The verandahs are now low steps, the route commits once the lane is clear, and the bull walks longer between pauses.
- **01:** the replay was 7.80 s. The tea boy's pour is shorter (220 ticks).

## Per-tick replay

These are the sweep's replay rows: death tick minus the tick of the last checkpoint taken, along each scripted play, at lag 0/6/12. The worst per stage is in the table above, and every play's row is in `probes/qa6-sweep-r4.txt`. The plays closest to the 7.5 s bar:

| Stage | Play | Replay (lag 0 / 6 / 12) |
| --- | --- | --- |
| DIS-07 | time card: waits at the gate | 7.17 / 6.47 / 6.47 s |
| DIS-01 | waits where he stood to watch the boy pour | 7.13 s at all three lags |
| DIS-07 | m9 | 6.77 / 6.82 / 6.91 s |

## cpsafe

`npx vitest run tests/cpsafe.test.ts -t DIS` (develop's strict three-play gate) passes for all ten stages, and so does the lag-captured sweep above.

Checkpoints moved this round:
- **07 bordoisila:** given a 3-column run-up.
- **10 plucker:** starts only at the water's edge (D-33.6).
- **03:** the stage checkpoint moved 14.5 → 12; the reel checkpoint D-6 → D-8.
- **09 chaal:** 6.5/20.5 → 5.5/19.5.
- **06 and 05 acts:** checkpoints at least 4.5 tiles before their traps.

## Fairness, LDD_N=80

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

Every stretch is 100% at 0-12 ticks. Re-runs after the last changes: 07 (`104df19`; the full run had 83% at 6t from the bull, now fixed), 04 (`62799c0`) and 05 (`f40dab6`). Full output: `fair-N80-round4.txt`.

Causes under 90% at 18 ticks, parked for the owner:
- **02:** a late jump on a narrowing bar.
- **05:** the late hop at the giver before the pit, and the machan planks.
- **06:** a late hop on to a trap past its window.
- **07:** the dhol's quick beat.
- **10:** the slowed dhol and the gamosa hop.

## Sheets, flows, suite

- **Sheets:** all ten re-recorded after the last changes; 04, 05, 06, 07, 08, 09 and 10 read this round. What they show:
  - 04: Talatal, the falling stair, the rising step and the laru plate.
  - 05: the bamboo nala, the feast leaves and the machan.
  - 06: the spur lee, the wake and the traps on pulleys.
  - 07: storm lee, dhol, bull steps, tekeli, card.
  - 08: the two jeeps.
  - 09: tug, chaal, the sluice embankment.
  - 10: the Talatal callback and the plucker door.

  Copied to `shots/`.
- **Flows:** `npm run build:single` then `node scripts/flows.mjs`: no errors.
- **Full suite** at `f40dab6` (code identical to the tip): 18 files passed, 13 skipped; 1790 tests passed, 20 skipped; DIS on no allow-list. Typecheck is clean.
- **Shared files:** none touched. DIS-04 keeps the repo `allocation.json` label (`set-crepe-rolls-you-up`) in its meta, because the repo file is the integrator's. v3 names the slot `collapsing-stair-penultimate-rises`.
- **Tip:** `b7bfa0b`.

## Not built, and why

- **F447 liar horn (02):** the horn must land while a real siren is due, which needs a timed SandField. Not done in time.
- **F451 sliding spike (05):** its FIX is "the host behind catches up: third gamosa", which needs a chasing giver.
- **F455 flag vs plank (06):** I could not settle a layout where "where the flag was" differs from both the flag and the plank.
- **F457, F459 (07):** the sound beat and the treat trail, for time. 07 still has no sound beat.
- **The rope-walk (07, I5/V3.1):** I could not settle a side-view layout for "cross nearest the anchored end" in time.
- **F461 egrets (08) and F462 tunnel chain (09):** for time.

Not checked: the per-act seconds were measured before the last 05 and 04 changes. 05 `sanko` and 04 are estimated from the route delta.
