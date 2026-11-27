# TVM fix round 4 (QA round 4: TVM-02 checkpoint on the bus roof)

Branch `city/tvm`, worktree `/local/home/saiposh/personal/ldd-wt/tvm`. Base 389996d. **Tip 5561d4a.** Own files only (`src/game/cities/tvm/levels.ts`, `tests/cities/tvm/probe.test.ts`, `tests/cities/_frozen/tvm.json`). TVM stays on the OLD allow-list in the branch; it was removed only locally for the runs and reverted before the commit. No push, no bump.

## The new checkpoint columns

| Stage | Before | After | Why |
| --- | --- | --- | --- |
| TVM-02 | x86.0 (the parked bus roof's right end at lag 11-12) | **x90.0** | On the bank (ground from x88, the door at x93): 2+ tiles past the bus's parked end, and no water ahead of it. It is captured on the bank at every lag 0-12 |
| TVM-03 | x41.5 | **x38.0** | The lag-captured check found the next one. At lag 6, 11 and 12 the tap jump from x41.5 dies `burnt` at x44.9: the sprays are on a clock, and the late capture lands the jump in one. x38 is calm at every lag 0-12 and 10 tiles short of the painted floor over the drain (x48) |

TVM-04 (x56.5), TVM-05 (x35.5) and TVM-08 (x89.5) pass the lag-captured check unchanged.

## Lag-captured check (QA's method)

The route is played with every input delayed `lag` ticks (QA's `lagged()`, now probe9 in `tests/cities/tvm/probe.test.ts`). Each checkpoint is captured where that play takes it. From the capture, three plays: idle 4 s; run 0.3 s then idle; tap jump forward then idle.

Run at **every lag 0-12** for all five moved checkpoints: 65 captures × 3 plays, **0 deaths**. The four lags asked for:

| Stage, checkpoint | lag 0 | lag 6 | lag 11 | lag 12 |
| --- | --- | --- | --- | --- |
| TVM-02 x90 | x90.0 on ground, 15.41 s | x90.0, 15.51 s | x90.0, 15.62 s | x90.1, 15.51 s |
| TVM-03 x38 | x38.0, 7.96 s | x38.0, 8.01 s | x38.0, 8.05 s | x38.0, 8.06 s |
| TVM-04 x56.5 | x56.5, 9.21 s | x56.5, 9.41 s | x56.5, 8.84 s | x56.5, 8.88 s |
| TVM-05 x35.5 | x35.6, 9.57 s | x35.5, 9.66 s | x35.5, 9.74 s | x35.5, 9.76 s |
| TVM-08 x89.5 | x89.5, 15.54 s | x89.5, 15.70 s | x89.6, 15.76 s | x89.6, 15.78 s |

Every cell: captured standing on ground (not on a moving solid), and idle lives, run lives, tap lives.

The same command, run before the TVM-03 move, is what caught x41.5: `tap DIES burnt x44.9` at lag 6, 11 and 12. To re-run:

`LDD_CAPLAGS=0,1,2,3,4,5,6,7,8,9,10,11,12 LDD_CAPIDS=TVM-02,TVM-03,TVM-04,TVM-05,TVM-08 LDD_TVMPROBE=1 npx vitest run tests/cities/tvm/probe.test.ts -t probe9 --silent=false`

## Frozen diff (tests/cities/_frozen/tvm.json)

```
TVM-02 checkpoints: 86  -> 90
TVM-03 checkpoints: 41.5 -> 38
```

Nothing else moved. This round also moves TVM-03's column, which the brief did not name; that move is the next finding the lag-captured check turned up, above.

## Checks (tip 5561d4a)

| Check | Result |
| --- | --- |
| `npx vitest run tests/cpsafe.test.ts -t TVM`, TVM off the allow-list (locally) | **10/10 passed** |
| Full `npx vitest run`, OLD line removed locally | **1640 passed, 0 failed**, 19 skipped |
| `npm run typecheck` | clean |
| `npm run build:single && node scripts/flows.mjs` | no errors |
| `LDD_N=80 npm run fair -- TVM-02,TVM-03` | 02 100/100/76, door 100%; 03 100/99/78, s0 99%, door 100%. Unchanged |
