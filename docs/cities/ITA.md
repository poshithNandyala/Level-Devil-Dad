# ITA · Itanagar (Arunachal Pradesh): design notes

Ten stages in `src/game/cities/ita/` (one file per stage, `s01.ts` .. `s10.ts`), routes and plays in `tests/cities/ita.ts`.
The full build report with the decision gate, the probe table, the lag-captured sweep and the fairness numbers is in the
inbox: `reports/cities/ita/BUILD.md`.

| Id | Name | Slot (allocation.json) | Family / betrayal | Clear (route, lag 0) | Par | NAIVE death | FIX death | Door |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ITA-01 | Namaste, Itanagar! (tour) | ITA-T | brick-hop-mortar-vs-loose / brick-pop | 12.7 s | tour | `ita-ita` | `ita-pop` | tour |
| ITA-02 | Ek Ek Karke | ITA-02 | one-lane-bridge-oncoming-bays / oncoming-bay | 22.8 s | 40 | `ita-bhaar` | `ita-bans` | plain |
| ITA-03 | Mithun Maidan | ITA-06 | living-platforms-graze-cycle / graze-cycle | 17.0 s | 45 | `ita-keechad` | `ita-seeng` | plain |
| ITA-04 | Santra Seedhi | ITA-07 | fruit-rolls-into-baskets-as-steps / fruit-steps | 16.8 s | 50 | `ita-santra` | `ita-tokri` | `ita-peti` (the rope's shadow slides to the next landing spot) |
| ITA-05 | Anjeer Daal | ITA-08 | fig-ripeness-drops-platforms / ripeness-timeline | 37.6 s | 80 | `ita-khai` | `ita-anjeer` | plain |
| ITA-06 | Dhaan aur Machhli | ITA-04 | linked-tanks-lever-order / lever-water-order | 32.8 s | 70 | `ita-doob` | `ita-bahaav` | plain |
| ITA-07 | Sela Dhakka (marathon) | ITA-09 | push-heavy-slope-object / push-in-bursts | 49.0 s | 150 | `ita-dhuan` | `ita-truck` | plain |
| ITA-08 | Bans ka Bera (HWIK) | ITA-10 | raft-poles-spread-under-weight / poles-spread | 9.9 s | 30 | `ita-nadi` | `ita-rassi` | plain |
| ITA-09 | Ita | ITA-03 | pull-brick-pile-slumps / pull-brick-slump | 19.1 s | 60 | `ita-malba` | `ita-kaanta` | plain |
| ITA-10 | Subah (finale) | ITA-12 | finale-bricks-on-one-lane-bridge / brick-bridge-oncoming | 27.3 s | 37 | `ita-bhaar` | `ita-dher` | plain |

Doors: every door was checked like an act against the registry (`ldd-inbox/docs/DECISIONS.md`). Only 04's packing shed is an
idea of its own in this city; 02/05/06's earlier door twists were shipped thoughts (DMN-07 follow-close, KVT-08
don't-stop-on-the-tilting-floor, TVM-03 cross-after-the-pour) and 03/07/08/09's were their own stage's rule a second time,
so those eight doors are plain (the road ends at the door, walk in).

Fairness (`LDD_N=80 npm run fair -- ITA`, bar 90% stage at 12 ticks, 95% per stretch): 02, 04, 06, 07, 09, 10 at 100%;
01 56%, 03 50%, 05 19%, 08 10% at 12 ticks are under the bar (see the build report for the stretch and the cause).
