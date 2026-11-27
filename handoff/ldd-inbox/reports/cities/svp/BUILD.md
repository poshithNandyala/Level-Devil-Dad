> **Superseded in part by LENGTH.md (probe pass):** five of the acts below (`svp06-lehar`, `svp07-khula`, `svp07-uthao`, `svp08-bazaar`, `svp09-hauz`) are taken out of the stages as repeats of shipped ideas. Route times now: 01 30.1, 02 25.8, 03 26.1, 04 25.8, 05 63.5, 06 36.1, 07 58.9, 08 41.3, 09 24.9, 10 98.6 s. The tables below describe the build before the removal.

# BUILD: SVP, Sri Vijaya Puram (Andaman and Nicobar Islands)

- Branch: `city/svp` (worktree `/local/home/saiposh/personal/ldd-wt/svp`, from develop)
- Head: `a883d9d55befaedf39ba438336aac0d0e6282d14` (BUILD.md itself is outside the repo)
- Diff against develop: only `src/game/cities/svp/`, `tests/cities/svp.ts`, `docs/cities/SVP.md`, SVP row of `docs/CITIES.md`. No push, no version bump, no MECHANICS/WAVE1 edits. Integrator notes are in `docs/cities/SVP.md`.
- Round 2 (length pass): the clear-time floors are now met on every stage. Route times below are the scripted bot's, in seconds (`winTick / 120`).

## Stages

Fair q/a/r = success at quick / average / relaxed lag (6t / 12t / 18t, N=80). Worst stretch is 100% at 0-12t in every stage. "Hidden cps" are the act and room checkpoints; every act also has one at its first column.

| Id | Name | Family [betrayals] | Ending key | Attempt 1 / 2 / 3 | Route time (floor) | Par | Fair q/a/r | Hidden cps | Hidden item |
|---|---|---|---|---|---|---|---|---|---|
| SVP-01 | Namaste SVP | lane-sheet-flow-push [sheet-flow] | svp-lane-sun (meta only) | run into the sheet flow, swept into the drain (svp-baha) / shelter, go in the lull, second lobe sweeps you in / wait for the sun | 30.1 (25-35) | 41 | 100/100/100 | tour default + 32.2, 69, 91 | svp-machhli, tour deck |
| SVP-02 | Aari | cut-floor-saw-carriage [cut-floor] | svp-timber-stack | far end, blade (svp-aari) / stand at the centre, second cut halves it / stay at the boarding end (the act flips the rule) | 25.8 (25-45) | 35 | 100/100/100 | act start + door | svp-padauk |
| SVP-03 | Magarmachh | warning-board-arrow-turns [honest-moving-sign] | svp-board-bridge | land on the croc log (svp-magar) / wade, croc slides in and chases / the arrow swings to the water, climb out, take the logs | 26.1 (25-45) | 35 | 100/100/100 | act start + door + 1 | svp-machhli |
| SVP-04 | Hiran | food-holder-followed-by-deer [carry-attracts] | svp-jetty-guard | hop at the edge with food, nudged in (svp-hiran) / put the food down at the edge, same death / put it down well back | 25.8 (25-45) | 35 | 100/100/100 | act start + door + 1 | svp-kela |
| SVP-05 | Note Ki Tasveer (HWIK) | picture-aligns-ledge-from-spot [viewpoint-align] | svp-note-door | run at the gap (svp-nazar) / stand on the footprints then dawdle 4 s / run while aligned | 63.5 (>=60) | 86 | 100/100/100 | 17.2, 30, 57, 84; rope 27.5, 56; caves 32 | svp-fishstick |
| SVP-06 | Tote | bird-weight-bends-tree [crowd-weight-bends] | svp-bough-door | jump for the cliff (svp-kichad) / hop on the bent branch, jump from the tip / wait for the horn and ride it up | 62.3 (>=60) | 84 | 100/100/74 | 20.5; swell island 30 | svp-machhli |
| SVP-07 | Ship Late Hai (marathon) | luggage-stacks-as-floor [crowd-belongings-floor] | svp-ticket-window | wait on luggage (svp-saman) / run to the jetty edge, crowd sweeps you (svp-bheed) / trench, wait for the second ship (first ship's deck: svp-jahaz) | 122.3 (>=120) | 165 | 100/100/84 | room 23.4; 18; 25; bridges 24, 44, 64, 84; lifts 13, 22, 47 | svp-lobster |
| SVP-08 | Do Monsoon (HWIK) | rain-direction-reverses-awnings [second-season] | svp-gutter-river | run in the rain (svp-baarish) / shelter at the right end and stay, rain turns east / cross in the lulls to the lee end | 73.3 (>=60) | 99 | 100/100/100 | 31; bazaar 30 | svp-kela |
| SVP-09 | Jad | brick-crumbles-roots-hold [visual-rule-brick-root] | svp-frame-door | walk the brick (svp-eent) / blind hop at the swinging root / time the swing | 61.9 (>=60) | 84 | 100/100/80 | 21.5, 49, 74; pools 25, 46 | svp-padauk |
| SVP-10 | Dweep (finale, marathon) | finale-food-through-sawmill [food-through-sawmill] | svp-dweep-gate | carry the food onto the log, herd shoves you into the blade (svp-aari) / the wrapped acts' own deaths / put the food down before the mill | 98.6 (>=90) | 133 | 100/100/93 | reused acts' cps + rope 27.5, 56 | svp-lobster |

## Acts added in the length pass

Every added act is its own file, has a Tara cause line, a route (`actRoutes`), and at least two plays that must die in it (`actDeath` in `tests/cities/svp.ts`: a NAIVE and a FIX of it). Time added is the bot's route time.

| Stage | Act | Rule | Time added | Deaths it must give |
|---|---|---|---|---|
| 05 | `svp05-rassi` (rassi.ts) | Mooring rope, reserve R2 (rope-throw): hops beside the bollard pull the tied-up boat in; the edge is no use; it poles across slowly | +22 | run to the edge and jump; two hops then jump (svp-rassi) |
| 05 | `svp05-choona` (choona.ts) | Caves, reserve R1 (knock-drip): a hop under a formation raps it, it drips 7 s, wet floor slides you into the drain; hop, then wait on the dry side | +20 | hop everything; hop, wait a little, go (svp-chuna) |
| 06 | `svp06-lehar` (lehar.ts) | Swell: floats a beat apart, an island, a heaving barge across the bay (17 px/s) | +26 | hop without watching; first float then rush; jump for the far shore (svp-lehar) |
| 07 | `svp07-khula` (khula.ts) | Five lift bridges: lights flash, deck lifts with whoever is on it; cross on the green | +36 | run across; start across on the flash (svp-khula) |
| 07 | `svp07-uthao` (uthao.ts) | Godown lifts: four short lifts (two up, two down) with a ledge and a hidden checkpoint between each; each stops 2 s then overruns the shaft; a moving walkway on the roof carries you to a gap too wide to jump from standing and a jump from it keeps the speed (the momentum beat) | +27 | stay aboard the up lift; stand on the walkway; stay aboard the down lift (svp-uthao) |
| 08 | `svp08-bazaar` (kadhai.ts) | Fish-fry stalls: the counter is a wall to climb, the pan spits over one half at a time, the cook turns to the next half; under a covered market | +32 | run over the stalls; stay on the right half (svp-tel) |
| 09 | `svp09-hauz` (hauz.ts) | Drained pools: a pipe starts when you walk in, water rises up the wall; the raft rises with it; the floor drowns | +37 | run to the wall; wait on the floor by the raft (svp-hauz) |
| 10 | `svp10-rassi` | callback to the mooring rope (SVP's own idea) | +28 | same two plays as stage 05 |

## Tests

- `npm run typecheck && npm test`: typecheck clean, 1444 passed, 12 skipped (`ldd-inbox/reports/cities/svp/npm-test.txt`).
- `npx vitest run tests/modules.test.ts -t SVP`: 11 passed (14 skipped, other cities).
- `tests/allocation.test.ts`: 10 passed.
- `tests/jumpaudit.test.ts` passes (every jump of the proven routes works with a 15-tick tap; the walkway jump was tuned for that).
- `npm run build:single && node scripts/flows.mjs`: built, "no errors" (flows needs `CHROME_PATH` set).
- Every stage has routes, NAIVE deaths, a FIX and actRoutes (stages 02 to 10; correction: round 1 said 07 had no FIX, it did: svp-bheed).
- Second attempt on the two long stages dies to a different trap than the first:
  - 07: NAIVE sits on the luggage (svp-saman); FIX runs to the jetty edge and waits for the call (svp-bheed).
  - 10: NAIVE carries the food onto the log, the herd shoves you into the blade (svp-aari); FIX puts the food down, gets through the mill, and hops the croc creek's logs without reading the arrow (svp-magar). The mill's own other ways to die (far end, middle) all end in the blade, so the second trap is the next beat.
- MISTAKES lists (first-timer plays that must die, in `tests/cities/svp.ts`):
  - 07: into the trench, straight out and on to the quay (svp-jahaz); on to the first ship with everyone (svp-jahaz); sit on the luggage in the second hall (svp-bheed); out of the trench the moment the real call comes (svp-bheed); sit on the luggage in the third hall (svp-bheed); plus the lift bridge and lift deaths.
  - 10: food put down then ride the middle of the log (svp-aari); walk the brick floor of the cellar (svp-eent); sit on the luggage (svp-bheed); carry the food to the edge and hop (svp-hiran); plus the two rope deaths.

## Fairness

`LDD_N=80 npm run fair -- SVP`: `/local/home/saiposh/personal/ldd-inbox/reports/cities/svp/fair-N80.txt`. Every stage 100% at quick and average lag, every stretch 100%. Relaxed lag (18t): 06 74%, 07 84%, 09 80%, 10 93%, the rest 100% (the bar is average).

## Screenshots

Contact sheets: `/local/home/saiposh/personal/ldd-wt/svp/shots/route/SVP-01-sheet.png` to `SVP-10-sheet.png` (git-ignored; made by `bash scripts/dev/shots.sh SVP-0N`). Sheets 05 to 09 (and 07 again after the lifts were rebuilt) were re-shot and read after the length pass (the new acts are in the last two thirds of each): rope boats and caves, swell floats and barge, lift bridges with lights and the lift shafts and walkway, the covered bazaar, the pools filling. 01 to 04 and 10 are as in round 1 apart from slower mechanisms, and were not re-read.

## Deviations from the allocation

- Shapes: the engine allows only tour, short, long, marathon, wtf. Standard stages are `short`, the two how-would-I-know stages (05, 08) are `wtf`, 06 and 09 are `long`, 07 and the finale are `marathon`. Marathons use `lives:'act'`.
- `meta.betrayals` is pinned to the allocation by `tests/allocation.test.ts`, so the added acts' betrayal types are not in the meta. They are listed in `docs/cities/SVP.md` for the integrator.
- Betrayal types of the added acts: rope-throw and knock-drip are SVP's reserves R2 and R1. The other five (swell floats and barge, lift bridge, godown lift with overrun and walkway, spit-side stalls, rising-water raft) are my own proposals for SVP's daily life (Ross Island jetty and pools, harbour bridge, godown, Aberdeen fish-fry stalls). They are not in the allocation and need the conductor's say-so before an integrator counts them as allocated types.
- Slot 07: the crowd as a walking floor was rejected. Kept the luggage vanishing, the crowd rush and the trench shelter (the marathon's shelter beat).
- Slot 10: the finale's deer follow Dad onto the log (Herd `limit` 99999). The door ending `svp-dweep-gate` reuses the stage 04 `Herd` guard logic under a new key. The finale's added act is a callback to the mooring rope.
- Stage 01 `meta.ending` is `svp-lane-sun`, which has no ending kind, because the tour has no door ending.
- Slot 03 differs from a plain moving marker: the honest board follows the croc. First it points at the middle log (the croc, asleep). After the croc slides into the creek the arrow swings to the water, and in the act it follows the patrolling croc under the logs. The marker never moves on its own.
- Cellular Jail is a far silhouette only. Sound is one music loop (104 bpm); no new SFX names.

## Not done

- Replay to the trap is 8 s or less on every added act except two spots: the roof lift C after the walkway jump (about 9 s from the roof checkpoint, because the walkway and the gap come first), and the barge in stage 06 (17 s ride, but it has no trap on it). The godown lifts were cut to four short ones with ledge checkpoints for this (about 8 s each from its checkpoint to the overrun).
- The nine intro lines are plain standard Hindi, not the bible's verified lines, and need a native check. Tara's intros are lies by design; her only truthful line is stage 08.
- Relaxed lag is 74% for 06, 84% for 07 and 80% for 09; all timing-heavy (swell floats; walkway jump and lifts; swinging roots).
- 01 to 04 reached their floors by slower mechanisms (lane lobes, carriage speed, late boat, croc slide and patrol), not by acts: each is 0.8 to 5 s over the floor.
- Calm spot every 25 to 30 s is by design in the added acts (islands, roofs, quays, stall gaps) but was not measured with a tool.

## Risks and where QA should press

- Stage 07 `svp07-uthao`: the walkway jump (belt 320 px/s; the jump audit passes with a tap), and the four lifts' boarding (Dad has to be on the platform, not beside it). `svp07-khula`: five bridges, each cycle about 14 s.
- Stage 06 `svp06-lehar`: float hops under a slow relaxed lag (74%), and boarding the barge from the island.
- Stage 09 `svp09-hauz`: reaching the raft within the first 3 s after the pipe starts, and the jump from the raft to the wall.
- Stage 08 `svp08-bazaar`: the 0.75 s tell before each burst; changing halves during the rest.
- Stage 05: rope hops count only when the hop is beside the bollard (44 px); caves knock zone is 44 and 56 px either side of the formation.
- Stage 10: crowd rush and trench timing from round 1, plus the rope callback.
- The fair harness holds a direction key about `lag` ticks past release when it was pressed with a jump; routes are written to tolerate that.
