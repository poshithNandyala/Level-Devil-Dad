# TVM fix round 3 (QA round 3: TVM-10 cp4 replay) + the develop cpsafe gate (4c38bcb)

Branch `city/tvm`, worktree `/local/home/saiposh/personal/ldd-wt/tvm`. Base f84b13c. **Tip 389996d.** Commits in order:

| Commit | What |
| --- | --- |
| e615011 | cp4 fix, per-tick probe, refrozen, docs note |
| a510f82 | merge origin/develop 4c38bcb, the new cpsafe gate |
| 389996d | TVM-02/03/04/05/08 checkpoints moved for that gate, candidate-spot probe, refrozen |

Own files only. No push, no bump. The OLD exemption was removed only locally and reverted before every commit; `tests/modules.test.ts` and `tests/cpsafe.test.ts` are untouched.

Approval prompts expired unanswered from about 02:27 to 03:42 UTC. Work resumed when approvals came back.

## 1. TVM-10 cp4

**What moved: the shore's second wave stays in for 2.0 s, was 2.6 s** (`encores.ts`, `tvm10-theeram`, wave 2 `inFor`). cp4 itself stays at **x119.7 (act col 23.6, unchanged)**. Neither moving it nor splitting the stretch can reach the margin:

- cp4 is 3.9 tiles before the second whistle (x+27.5). Moving it to the 3.5-tile limit gains 0.05 s.
- The worst death is a run-and-jump on to the soaked sand on the walk back right, after that wave. Checkpoints only count forward in x, so every spot in that stretch is either already passed or inside the wave's countdown. No calm checkpoint can split it.

The trap is the same: same wave, same soaked sand, same flags and triggers.

## 2. The probe, now per tick

probe5 in `tests/cities/tvm/probe.test.ts` branches the wrong move (stop / run on / run and jump, each cut 4 s after it starts) on **every tick** from 3.5 s after each checkpoint to the next one. In the first 3.5 s after a checkpoint it branches every 30 ticks; a branch that starts there and is cut at 4 s can't reach a 7.5 s replay. The method is written into `docs/cities/TVM.md`. The spawn idle is 13 × lag ticks.

**TVM-10**

| | lag 0 | lag 6 | lag 12 |
| --- | --- | --- | --- |
| **cp4 (x119.7) worst replay** | **7.342 s** | **7.392 s** | **7.442 s** (QA per tick before: 8.025 s) |
| cp5 (x126.4) | 7.133 | 7.192 | 7.233 |
| cp6 (x134.5), worst in the stage | 7.767 | 7.767 | 7.767 |
| every other stretch | ≤ 6.3 | ≤ 6.3 | ≤ 6.3 |
| longest stretch | 9.5 s | 9.6 s | 9.7 s |
| route | 95.7 s | 97.5 s | 99.2 s |
| calm deaths (idle 4 s / run 0.3 s / tap jump, every checkpoint) | 0 | 0 | 0 |
| mid-wave captures (probe6: lag 0-12 step 2 × 4 idles, 28 runs) | 0 / 28 | 0 / 28 | 0 / 28 |

**TVM-09**

| | lag 0 | lag 6 | lag 12 |
| --- | --- | --- | --- |
| cp0 (x2.0) | 7.675 | 7.675 | 7.675 |
| cp1 | 5.583 | 5.583 | 5.583 |
| cp2 | 5.058 | 5.050 | 5.058 |
| cp3 | 5.158 | 5.158 | 5.158 |
| cp4 | 5.033 | 5.033 | 5.033 |
| cp5 | 5.392 | 5.392 | 5.392 |
| cp6 | 6.867 | 6.967 | 7.067 |
| cp7 (x138.5), worst in the stage | 7.892 | 7.892 | 7.892 |
| cp8 | 5.017 | 5.017 | 5.017 |
| longest stretch | 9.6 s | 9.7 s | 9.8 s |
| calm deaths | 0 | 0 | 0 |
| mid-wave captures | 0 / 28 | 0 / 28 | 0 / 28 |

TVM-09 is unchanged. Its worst (7.892 s, cp7) meets the 8 s bar; the 7.5 s margin was asked for TVM-10 cp4 only.

probe7, the static check:
- TVM-09: no checkpoint within 3.5 tiles of a trigger.
- TVM-10: no checkpoint within 3.5 tiles *before* a trigger. Two sit less than 3.5 tiles *past* one, reached only after that wave is out (FIX-2.md): x126.4 and x167.5.

## 3. The develop cpsafe gate: TVM-02/03/04/05/08

develop's new `tests/cpsafe.test.ts` plays idle 4 s, run 0.3 s then idle, and tap jump then idle, at lag 0/6/12, from every checkpoint. With TVM off the allow-list it failed the single hand-placed checkpoint of five old stages (31 plays).

I found the calm spots with a new probe8 in `tests/cities/tvm/probe.test.ts` (`LDD_CAND=TVM-04 ...`). It runs the same seven plays from the first moment Dad stands at each half tile along the route. Each checkpoint then went to a spot inside a passing range, at least 4.5 tiles short of any water or pit edge where there was one:

| Stage | Before | Dies before (cpsafe) | After | Why there |
| --- | --- | --- | --- | --- |
| TVM-02 bus | x48.0 (on the moving bus roof) | run/tap: crushed (flyover chunk) / splash | **x86.0** | The bus is the whole road; the only calm stretch is the far bank by the door (calm x85.5-93.5) |
| TVM-03 tea street | x47.0 (just before the painted floor) | run/tap: hit (the scooter) | **x41.5** | Past the sprays, 6.5 tiles short of the painted floor (calm x41-41.5) |
| TVM-04 coconuts | x46.0 (the narrow bank after the river, 5 tiles before the fronds) | run/tap: splash (the coir pit under the fronds) | **x56.5** | Past the fronds, on solid ground (calm x56-70) |
| TVM-05 fort | x38.0 (2 tiles before the moat) | run/tap: splash | **x35.5** | 4.9 tiles short of the moat's edge (calm x23.5-37) |
| TVM-08 snake boat | x50.0 (on the moving boat) | idle/run/tap: splash (the boat's ride) | **x89.5** | The boat is the whole course; the only calm spot is the finish jetty (calm x89.5-90) |

No trap changed and no shared test was edited.

After the moves, `npx vitest run tests/cpsafe.test.ts -t TVM` with TVM off the allow-list passes **all 10 TVM stages**.

TVM-02 and TVM-08 are ride stages (17 s and 16 s routes). Their checkpoint now sits at the far end, so a death on the ride restarts the stage. That is the only spot that passes the gate.

## Refrozen (tests/cities/_frozen/tvm.json)

- TVM-10 route 11550 → **11478** ticks (−72 = −0.6 s): the second shore wave is in for 2.0 s instead of 2.6 s.
- Checkpoint columns: TVM-02 48 → 86, TVM-03 47 → 41.5, TVM-04 46 → 56.5, TVM-05 38 → 35.5, TVM-08 50 → 89.5.
- Nothing else moved: every route, NAIVE and FIX tick and cause of 01-09, and TVM-10's NAIVE (137) and FIX (344).

## Checks (on the tip, develop 4c38bcb merged)

| Check | Result |
| --- | --- |
| `npm run typecheck` | clean |
| Full `npx vitest run`, `TVM: OLD` removed locally | **1640 passed, 0 failed**, 18 skipped. develop added tests; the gated probes are skipped |
| `npm run build:single && node scripts/flows.mjs` | no errors |
| `LDD_N=80 npm run fair -- TVM` | 01 100/100/98; 02 100/100/76; 03 100/99/78; 04 100/100/84; 05 100/100/84; 06 100/99/75; 07 100/100/80; 08 100/100/76; 09 100/100/98; 10 100/100/76. Every stretch at 99-100%, every door 100% |

The per-tick 09/10 tables above were measured on e615011. The develop merge and the 02-08 checkpoint moves don't touch 09 or 10.

## For the re-check

- cp4's margin is 0.06 s under 7.5 s at lag 12 (7.442 s).
- TVM-02/08: the far-end checkpoint means a ride death replays from the start. The routes are under 18 s, so that stays within the stage, but it is a longer replay than before.
