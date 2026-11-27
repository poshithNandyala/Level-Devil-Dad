# TVM fix round 5 (QA round 5: TVM-03 checkpoint next to the spray)

Branch `city/tvm`, worktree `/local/home/saiposh/personal/ldd-wt/tvm`. Base 5561d4a. **Tip 2e7eba9.** Own files only (`src/game/cities/tvm/levels.ts`, `tests/cities/tvm/probe.test.ts`, `tests/cities/_frozen/tvm.json`). TVM stays on the OLD list and the cpsafe allow-list in the branch; it was removed only locally for the runs and reverted before the commit. No LEAD was inserted, so the route did not change. No push, no bump.

## The new column

**TVM-03 checkpoint: x38 → x12.0** (the far side of the steam, where the route stops to let the tea master's two pulls go by).

The rule asks for both of these:
- at least 4.5 tiles from any spray;
- at least 4 tiles before the painted floor at x48.

No spot between the sprays and the painted floor meets both. TVM-03 has **three** sprays, not one: the drain covers at x39, x42 and x45, so spray centres at x39.5, x42.5 and x45.5. 4.5 tiles past the last one is x50.0, which is beyond the painted floor at x48.

Before the sprays, x30-37 is the counter's end and its drop, which the route clears in one jump; Dad first stands at about x37.2, inside the first spray's reach. The counter itself (x25.5-28.5) fails the sweep: the glasses slide on a clock, 166-491 deaths per spot.

The first calm stretch is x10-16, past the steam, where the sweep finds 0 deaths at every spot. x12.0 sits in it. Distances from x12.0:

| To | Distance |
| --- | --- |
| nearest spray (x39.5) | 27.5 tiles |
| painted floor (x48) | 36 tiles |
| steam spikes it follows | the route lands past them, the run starts on clear street |

The stage is 13.1 s long, so the checkpoint still splits it: about 2.5 s before, 10.6 s after.

A LEAD would have needed six columns, not three: 4.5 tiles past x45.5 and then 4 more before the floor. It would also have moved every later number in the stage and its shared route, so it wasn't used.

## The sweep (QA's probe15 method)

`probe10` in `tests/cities/tvm/probe.test.ts`, run with `LDD_SWEEP=<ids> LDD_TVMPROBE=1 npx vitest run tests/cities/tvm/probe.test.ts -t probe10`:

- The route is played at **every lag 0-12** and spawn idle 0-345 ticks, as in QA's probe15. Each checkpoint is captured where that run takes it (the first tick on the ground at or past it).
- From each capture it plays **idle 4 s / run 0.3 s / tap jump** (QA's three plays).

| Stage | Checkpoints swept | Idle step | Captures | Plays | Deaths |
| --- | --- | --- | --- | --- | --- |
| TVM-02 | x90.0 | 15 ticks (24 idles) | 312 | 936 | **0** |
| TVM-03 | x12.0 (new) | 15 | 312 | 936 | **0** |
| TVM-04 | x56.5 | 15 | 312 | 936 | **0** |
| TVM-05 | x35.5 | 15 | 312 | 936 | **0** |
| TVM-08 | x89.5 | 15 | 312 | 936 | **0** |
| TVM-09 | all 9 (2.0, 32.5, 46.0, 72.5, 82.4, 106.5, 129.4, 138.5, 167.5) | 45 (8 idles) | 936 | 2808 | **0** |
| TVM-10 | all 18 (32.5 … 259.5) | 45 (8 idles) | 1872 | 5616 | **0** |

The candidate run that picked x12 (virtual checkpoints, same sweep, TVM-03):

| Candidate x | Deaths in the sweep |
| --- | --- |
| x9 | 192 (steam spikes) |
| x10-16 | 0 |
| x25.5 | 491 (glasses) |
| x26-28 | 166-192 (glasses) |

09 and 10 use an idle step of 45 ticks, not 15, to fit the budget; every lag 0-12 is still swept.

## Frozen diff

```
TVM-03 checkpoints: 38 -> 12
```

Nothing else moved. No route, NAIVE or FIX tick changed.

## Checks (tip 2e7eba9)

| Check | Result |
| --- | --- |
| `npx vitest run tests/cpsafe.test.ts -t TVM`, TVM off the allow-list (locally) | **10/10 passed** |
| Full `npx vitest run`, OLD line removed locally | **1640 passed, 0 failed**, 20 skipped |
| `npm run typecheck` | clean |
| `npm run build:single && node scripts/flows.mjs` | no errors |
| `LDD_N=80 npm run fair -- TVM-03` | 100/99/78, the same as before. The stretches split differently around the new checkpoint: s0 100%, door 99% (was s0 99%, door 100%) |
