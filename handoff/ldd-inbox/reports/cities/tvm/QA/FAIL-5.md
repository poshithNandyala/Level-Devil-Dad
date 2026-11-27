# TVM extend-and-toughen: independent QA, round 5: FAIL (one finding: the moved TVM-03 checkpoint)

Subject: `city/tvm` at **5561d4a** (base 389996d), checked out in my detached worktree `/local/home/saiposh/personal/ldd-wt/qa-tvm`. Nothing committed or pushed. TVM was removed from the OLD list in `tests/modules.test.ts` only while the tests ran, then restored; cpsafe reads its allow-list from that file. Probes are mine: `tests/qa/probe.test.ts` (copy in `QA/qa-probe.test.ts.txt`). Earlier rounds: `FAIL-1.md` to `FAIL-4.md`.

Verdict: TVM-02 is fixed, and TVM-04, 05 and 08 hold under my lag-captured check. The moved **TVM-03 checkpoint (x38) is not calm** at lag 9-12 with some spawn idles: a spray burns Dad 0.07-1.08 s after the respawn, once even when he stands still.

## Blocking

### B6. TVM-03 x38: the respawn lands next to a live spray at lag 9-12

- **What:** the street's sprays are `Geyser`s at **x39.5** and **x42.5**. The checkpoint at x38 is 1.5 tiles before the first one, and the sprays are on a clock. When the route runs late (lag 9-12) with certain spawn idles, the checkpoint is taken at a moment when the x39.5 spray is about to fire. From that respawn:
  - lag 9, idle 60 (taken at 7.11 s): run 0.3 s → `burnt` x38.9 **+0.13 s**; tap jump → `burnt` x38.9 +0.14 s
  - lag 10, idle 60 (7.13 s): run / tap → `burnt` x38.9 +0.13 / +0.14 s
  - lag 11, idle 60 (7.14 s): run / tap → `burnt` x38.9 +0.13 / +0.14 s
  - lag 12, idle 75 (7.33 s): run / tap → `burnt` x38.9 **+0.07** / +0.08 s
  - lag 12, idle 90 (7.42 s): run / tap → `burnt` x38.9 +0.12 / +0.13 s
  - lag 12, idle 210 (8.52 s): **idle 4 s → `burnt` x39.0 +1.08 s**; tap → `burnt` x42.1 +1.44 s
- **How reproduced:**
  - `probe15`: TVM-03, the route at lag 0-12 x spawn idle 0-345 in steps of 15 (309 captures). The checkpoint is taken where that late play takes it, then three plays from there (idle 4 s; run 0.3 s then idle; tap jump then idle). Result: **12 deaths in 6 captures**, all listed above.
  - `probe14` (idles 0/90/180/270) finds the lag 12 / idle 90 pair.
  - `probe16` names the killer: `Geyser@39.5` (and `Geyser@42.5` next to it).
  - The builder's probe9 uses only idle = 13 x lag, which misses these phases.
  - Every death comes 0.07-1.44 s after the respawn, so the engine's 1.2 s quick-death rule would drop the checkpoint after two of them.
- **What satisfies:** a TVM-03 checkpoint that no spray reaches, from any spray phase. It should be at least about 3.5 tiles short of the x39.5 spray (and clear of the tumblers and the pour behind it), or past both sprays and short of the painted floor (x48). `probe15` must then show 0 deaths in its 309+ captures.

## Holds

1. **TVM-02 x90** (`probe14`, lag 0-12 x idle 0/90/180/270): all **52 captures** on bank tiles at x90.0-90.1, none on an entity solid. That is 4 tiles past the bus's parked end (x86.0). The next hole ahead is 5.9 tiles away. 0 deaths in 156 plays.
2. **The other three moved checkpoints** (`probe14`, the same 52 captures each):
   - TVM-04 x56.5: 0 deaths; next hole 21.5 tiles ahead.
   - TVM-05 x35.5: 0 deaths; next hole 4.4-4.5 tiles ahead (moat edge x40.0, as in round 4).
   - TVM-08 x89.5, the finish jetty: 0 deaths, never on the boat; next edge 6.4 tiles ahead.
3. **Diff 389996d → 5561d4a:** `levels.ts` (two checkpoint lines, 86→90 and 41.5→38), `tests/cities/_frozen/tvm.json` (the same two columns) and the builder's probe file. Nothing else moved, so the round-4 confirmations stand: TVM-10 cp4 per tick, shore trap, 09/10 captures and calm, fairness.
4. **Suite and proofs on 5561d4a:**
   - `npx vitest run tests/cpsafe.test.ts -t TVM` with TVM off the allow-list: **10 passed**. It is green because it captures each checkpoint on a lag-0 route, which is why it does not see B6.
   - Full `npx vitest run` with the OLD line removed (my `tests/qa` moved out during the run): **1640 passed, 19 skipped, 0 failed**.
   - `npm run build:single && node scripts/flows.mjs`: no errors.

## Re-test

After the TVM-03 move: `probe15` (lag 0-12 x 24 idles) and `probe14` on TVM-03, the frozen diff (one column), then cpsafe, the full suite with the OLD line removed, and flows.
