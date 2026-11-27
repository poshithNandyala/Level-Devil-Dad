# SVP: Sri Vijaya Puram (Andaman and Nicobar Islands)

Code: `src/game/cities/svp/` (one file per stage, `s01.ts` to `s10.ts`). Tests: `tests/cities/svp.ts`.
Sound: one music loop (104 bpm), no new SFX names.

## Stages

| # | Id | Name | Family [betrayal] | Ending key | Shape |
|---|---|---|---|---|---|
| 01 | SVP-01 | Namaste SVP | lane-sheet-flow-push [sheet-flow] | svp-lane-sun (meta only) | tour |
<!-- route times in seconds (bot): 01 30.1, 02 25.8, 03 26.1, 04 25.8, 05 63.5, 06 36.1, 07 58.9, 08 41.3, 09 24.9, 10 98.6 -->

| 02 | SVP-02 | Aari | cut-floor-saw-carriage [cut-floor] | svp-timber-stack | short |
| 03 | SVP-03 | Magarmachh | warning-board-arrow-turns [honest-moving-sign] | svp-board-bridge | short |
| 04 | SVP-04 | Hiran | food-holder-followed-by-deer [carry-attracts] | svp-jetty-guard | short |
| 05 | SVP-05 | Note Ki Tasveer | picture-aligns-ledge-from-spot [viewpoint-align] | svp-note-door | wtf |
| 06 | SVP-06 | Tote | bird-weight-bends-tree [crowd-weight-bends] | svp-bough-door | long |
| 07 | SVP-07 | Ship Late Hai | luggage-stacks-as-floor [crowd-belongings-floor] | svp-ticket-window | marathon |
| 08 | SVP-08 | Do Monsoon | rain-direction-reverses-awnings [second-season] | svp-gutter-river | wtf |
| 09 | SVP-09 | Jad | brick-crumbles-roots-hold [visual-rule-brick-root] | svp-frame-door | long |
| 10 | SVP-10 | Dweep | finale-food-through-sawmill [food-through-sawmill] | svp-dweep-gate | marathon |

Shapes: the engine allows only tour, short, long, marathon, wtf. Standard stages map to `short`, the two how-would-I-know stages to `wtf`, the finale to `marathon`.

## Mechanics (for the integrator's MECHANICS entry)

- 01 `Lane`: a cloud sends a sheet of water down a steep lane. Two lobes with a lull between. Awning is shelter. Drain at the bottom.
- 02 `SawHall`: log carriage and band saw. The floor is cut in pieces, and in the act the rule flips: the middle piece stays and the boarding end is cut off.
- 03 `Board`, `Creek`, `Patrol`: an honest arrow board that follows the crocodile. First it points at the middle log (the croc, asleep). After the croc slides into the creek it points at the water. It never moves by itself; it tracks the animal. This is not a plain moving marker.
- 04 `Herd`, `LateBoat`: deer follow whoever holds food and nudge them. Put the food down well back from the edge.
- 05 `Viewpoint`: slabs exist only while Dad stands on the footprints (the spot where the picture lines up). Dawdling lets them vanish. The door exists only after standing at the last bench. Five gaps in the act, four hidden checkpoints.
- 06 `Flock`, `Bough`: bird weight bends the branch. Wait for the horn and ride the branch up.
- 07 `Hall`, `Crowd`, `Ship`: luggage stacks work as floor and then vanish. The crowd rushes the jetty. A trench is the shelter. The second ship is the real one.
- 08 `Weather`: rain from the west, then from the east. Awnings shelter only on the lee end. Porches are the checkpoints. A gutter floods.
- 09 `Crumbler`, `Root`: brick floor crumbles, swinging roots hold. Solids carry Dad at the true continuous speed.
- 10 acts are wrapper objects of nala, pul, doosra, rassi and ghat. The door ending `svp-dweep-gate` reuses the stage 04 `Herd` guard logic under a new key (a callback).

### Length pass: acts added to reach the clear-time floors

**Probe pass update:** five of the acts below (`svp06-lehar`, `svp07-khula`, `svp07-uthao`, `svp08-bazaar`, `svp09-hauz`) are taken out of the stages: each is the same experience as an idea that already ships (see `ldd-inbox/reports/cities/svp/LENGTH.md`). Their files stay and one line in `levels.ts` puts them back. Stages 06 to 09 are back at their round-1 lengths (36.1, 58.9, 41.3, 24.9 s). The rope and the caves (SVP's reserves) and the rope callback in the finale stay.

Each added act is a new rule in its own file, with its own cause line, a NAIVE and a FIX death in `tests/cities/svp.ts` (`actDeath`), and a route. The stage's `meta.betrayals` stays as allocated (the allocation test pins it); the extra betrayal types below are listed here and in BUILD.md for the integrator.

| Stage | Act id | File | Rule (betrayal type) |
|---|---|---|---|
| 05 | `svp05-rassi` | `rassi.ts` | Mooring rope (rope-throw, reserve R2): a hop beside the bollard is a pull on the rope, and each pull brings the tied-up boat in. The edge is no use. Then it poles across at a walking pace. |
| 05 | `svp05-choona` | `choona.ts` | Limestone caves (knock-drip, reserve R1): a hop under a formation raps it, and it drips seven seconds on the floor ahead. Wet limestone slides you back into the drain. Hop, then wait on the dry side. |
| 06 | `svp06-lehar` | `lehar.ts` | Swell: floats ride the swell a beat behind each other (go when the next is within a jump), then a barge that heaves on the same swell takes you across the bay. |
| 07 | `svp07-khula` | `khula.ts` | Five lift bridges: the deck lifts for a ship when the lights flash, with whoever is on it. Cross on the green. |
| 07 | `svp07-uthao` | `uthao.ts` | Godown lifts: four short lifts (two up to the roof, two down), a ledge with a hidden checkpoint between each, each stops for two seconds and then overruns the shaft. A moving walkway on the roof carries you to a gap too wide to jump from standing: a jump from it keeps its speed (the momentum beat). |
| 08 | `svp08-bazaar` | `kadhai.ts` | Fish-fry stalls (spit-side): the counter is a wall to climb, the pan spits over one half at a time, the cook turns to the half that is next. Stand on the other half and change in the rest. Under a covered market, so the rain is not the question. |
| 09 | `svp09-hauz` | `hauz.ts` | Drained pools (rising water): a pipe starts to run when you walk in. Get on the raft: it rises with the water and you step across at the top of the wall. The floor is drowning. |
| 10 | `svp10-rassi` | `s10.ts` | Callback to the mooring rope. |

New cause keys: svp-rassi, svp-chuna, svp-lehar, svp-khula, svp-uthao, svp-tel, svp-hauz.

## Causes and things

Causes: svp-kichad, aari, lakdi, magar, hiran, nazar, saman, bheed, jahaz, baarish, nala, eent, baha.
Foods: svp-machhli, svp-fishstick, svp-kela, svp-lobster, svp-padauk.

## Fairness

`LDD_N=80 npm run fair -- SVP`: every stage 100% at quick and average lag, every stretch 100%. At relaxed lag (18t): 06 and 09 are 80%, 10 is 93%, the rest 100%. Output: `ldd-inbox/reports/cities/svp/fair-N80.txt`.

## Notes for WAVE1 and MECHANICS

- The act ids are `svp02-chirai`, `svp03-nala`, `svp04-ghat`, `svp05-dekho`, `svp06-sanjh`, `svp07-ghat`, `svp07-doosra`, `svp07-teesra`, `svp08-gali`, `svp09-pul`, `svp05-rassi`, `svp05-choona`, `svp06-lehar`, `svp07-khula`, `svp07-uthao`, `svp08-bazaar`, `svp09-hauz`, `svp10-rassi`, `svp10-nadi`, `svp10-jad`, `svp10-saman`, `svp10-ghat`.
- Cellular Jail is a far silhouette in the backdrop only, with no gag.
- Intro lines are plain Hindi and need a native check. Tara's intros are lies; the only truthful Tara line is stage 08 ("Awning ke neeche raho"), and that is only partly true.
