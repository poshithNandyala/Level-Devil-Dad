# KVT (Kavaratti) pass: independent QA, round 1: FAIL

Subject: `city/kvt` at **0837c78**, detached worktree `ldd-wt/qa-kvt` (removed at the end). Probes: `qa-probe.test.ts.txt` (untracked `tests/qa/probe.test.ts`; the window sweeps used `qa-kvt-params.ts.txt`, a local copy of tests/cities/kvt.ts with env-driven hop timings). Raw output beside this file: `p5-lag*.txt`, `win.log`, `fair.log`. Frames: `KVT-09-s*.png`, `KVT-10-s*.png` (844x390 route shots, four per sheet).

Verdict: the numbers the builder reports reproduce, but the pass fails the checkpoint rule, the padding rule, the per-act obvious-play rule and the decision sweep. Four blocking findings.

## What reproduced (holds)

| Check | Result |
| --- | --- |
| `tsc --noEmit` | clean |
| Full `npm test` | **1526 passed, 12 skipped** |
| `KVT: [...OLD,'naive','fix']` removed from tests/modules.test.ts | modules + allocation 178 passed; reverted |
| `build:single` + `node scripts/flows.mjs` | built, "no errors" |
| `LDD_N=80 npm run fair -- KVT` | identical to EXTEND-3: 02-07 100/100; 08 100/**96**/76 (s2 96); 09 100/100/100, all stretches 100; 10 100/100/98, all 17 stretches 100. Relaxed (18 t) 02-06 76-81, informational |
| Route length | 09 = 7233 ticks = **60.3 s**, 10 = 10817 = **90.1 s** (floors 60 / 90, met by 0.3 s and 0.1 s: honest, not padded in time; see B3 for padding) |
| Frozen diff 02-08 vs 6172e21 | only what EXTEND explains: 01 (tour, cp 85.5 -> 89.5), 04 FIX added, 05 route 2279->2553 and FIX tick, 06 route -2 and NAIVE/FIX, 07 and 08 NAIVE/FIX, 08 route -5 |
| Tour bite | KVT-01 coral step (3 tiles to 1, "never under 1"), allocation slot B8; NAIVE splash @1557 at the step, FIX hatchling @1013 |
| Seventh line, "Thala" | no "Thala" in the city (only "thalasthaanam"); line is "Ezhaamathe odam vettikkalanju! ..." (boat board) |
| Prefix | all causes/endings/things `kvt-`; OLD allow-list line removable |
| Intros | `lines.intro` has 9 entries (02-10), which is the module convention ("x9 for 10 stages"), not ten |
| Re-timed routes (04, 05, 06, 08) | natural: 04 tug hop wins for time-to-contact 0.08-0.16 s at lag 0 (about 0.09 s wide; the 0.13 s of the shipped route sits in it; lag moves the window later: 0.12-0.20 at lag 6, 0.16-0.30 at lag 12); tuna hop (10) wins 0.10-0.26 s at lag 0; 08 dolphin jump-off wins for 0.30-0.62 of the leap at lag 0/12. Not a frame trick. 08's single failure is the first dolphin at one idle phase (splash @80), as the builder says |
| Irangal / kuzhi obvious plays | die: splash @4198 / @5760 |
| NAIVE/FIX/MISTAKES cause@tick | every scripted play dies where it says (list in `plays` probe; 09: 262/799/2521/3517/4198/4539/5760/6550; 10: 179/564/770/1598/2368/3517/4347/5012/5996/6638/6931/7646/8148/8737/8982/9284/10226/10761) |
| Place fit | 09 and 10 sheets read at phone size: rubble steps, sea wall, lagoon, tide heads, arch dolphin are nameable; the "Found it!" over the stage subtitle is the shared card |
| Malayalam | no line plainly wrong; unverified, owner's risk |

## Blocking

### B1. Checkpoints are not calm: tap-jump or a short run from nine act-start checkpoints ends in the water, at every lag
- **Rule:** CITY-MODULE: "Every checkpoint survives standing idle, running then idling, and a tap jump then idling." The repo's `cpsafe` test only stands still, so the suite stays green. TVM and PAT were held to the three plays.
- **How reproduced:** `probe5` (route with lag 0 / 6 / 12 and idle 0 / 78 / 156 / 200 / 40; at each checkpoint: idle 4 s, run right 0.3 s then idle, tap-jump forward then idle). The same ten results at every lag/idle:
  - KVT-09 cp1 (x76.5) tap-jump: splash +0.42 s at x79.6. cp4 (x228.5) run 0.3 s: splash +0.45 s at x230.3.
  - KVT-10 cp0 (x32.5), cp2 (x100.5), cp8 (x316.5), cp9 (x338.5), cp10 (x362.5), cp15 (x502.5): tap-jump, splash +0.42 s about 3.1 tiles on. cp5 (x224.5): run 0.3 s splash +0.34 s and tap-jump splash.
  - (Lag 0 only: KVT-10 cp8 run 0.3 s then idle, splash +3.39 s at x330.2.)
  - Idle 4 s is alive everywhere at all lags, so the captures themselves are calm; the problem is a pit edge about 2.5-3 tiles from the checkpoint (acts start with `pit(c.x+3 ...)`).
- **What satisfies me:** each act's first water edge at least 4.5 tiles from its checkpoint (or the checkpoint moved back), then `probe5` at lag 0, 6, 12 with no DIES line.

### B2. Replay over 8 s, and a 12 s stretch
- **Rule:** replay from the last checkpoint to any trap at most 8 s at lag 0, 6, 12.
- **Reproduced (worst replay, `probe5`):** KVT-09 cp1 **9.5 s** (lag 0) / 11.0 (lag 6) / **11.5** (lag 12), cp4 8.7-9.8, cp5 9.1-9.7, cp2 8.2 (lag 6, 12), cp0 8.1 (lag 6). KVT-10 cp3 **9.4-9.8**, cp4 **10.1** (lag 0, 6) / 8.8 (lag 12), cp6 8.1 (lag 6). These are the long acts: KVT-09 kodumudi (w 60, one checkpoint) and KVT-10 choora (w 52) with the preceding act.
- Longest stretch is fine: 9.9 s at lag 0, 11.7 s at lag 12 (limit 25).
- **What satisfies me:** an act `cps` inside kodumudi and choora (and where the others exceed), then no replay over 8.0 s at lag 12.

### B3. Padding: identical windows repeated
- **Rule:** no window identical to one already passed after the first momentum beat.
- **Found (geometry read in `encores.ts`, and visible in the sheets):**
  - `kvt09-varambu`: `RIDGE` is **11 identical heaps** (3 wide, spacing 4), same answer each ("land in the middle"). `KVT-09-s1.png` shows the row.
  - `kvt09-murivu`: **3 identical cuts** (pit 2, rubble 4, spacing 10).
  - `kvt10-veliyettam`: **7 identical heads** (4 wide, spacing 5), `KVT-10-s2.png`.
  - `kvt10-choora`: 3 identical one-tile gaps (spacing 8).
  - `kvt09-pavizham` 7 identical steps with 5 identical lips; `kodumudi` DOWN 8 identical steps.
- **What satisfies me:** each repeat differs in width, height, gap or timing, or the run is cut to two. Staircases may keep one ladder (A2 then A3); an eleven-heap row may not.

### B4. Obvious play does not die in `kvt10-palaka`; decision repeats
- **No trap in the plank act:** Tara says "Jump that plank!" (and KVT-02 taught it). I scripted that play from the act start (jump at x72.5, 73.5, 74.2, 74.8): Dad lands past the plank at the "PIER HEAD, no way through" wall and the run never dies (900 ticks, no death). The act has no scripted mistake either (16 MISTAKES for 16 acts, but plank is absent; the list covers the others). The rule "the obvious play dies, on a different tick from the fix" is not met; a trap that only wastes time is not a troll.
- **Decision sweep (one sentence each; only repeats listed):**
  - 09: kodumudi-descent "walk off each rubble step going down" = kuzhi-descent "walk off each step going down" (same answer) = irangal "walk off the wide ones, hop the narrow". Kuzhi's climb "land deep" = pavizham "land deep" = seawall first heap "land deep" = room. Three descents are one decision.
  - 10: veliyettam "never stop on the heads: they sink" = crackedGlass "never slow on the glass: it gives" (same stage, two acts, same decision), and both repeat KVT-08's shipped "a sandbar that goes under when you stop on it" (MECHANICS.md L131) plus BBI spokes and DIS slabs/bank in the parallel branches ("don't stop"). Callbacks may reverse a rule; these re-ask it.
  - Different and fine: midden/kallu (octopus), aama, irandu, kaattu, thengu, kamaanam, nizhal, paaru (jump raises the reef), kotta, thoni, door.
- **What satisfies me:** plank: the jump-over play ends in a death (for example the far jetty drops away, or the wall kills) with its own cause, a MISTAKE for it, and a different tick from the FIX. Descents: keep one descent act and make the others ask something else. 10: change either veliyettam or crackedGlass to a different question.

## Polish (not blocking)
- KVT-08 average is 96 (stretch 96): a 1-point margin, deterministic at the seeds used; the one failure is the first dolphin at idle about 290.
- 02-04 hit a cliff between lag 12 and 15 (win 100% to 0% at fixed lag 15, win.log). Inherited, unchanged by this pass.
- Lit shadow step in `kvt10-nizhal` is a pale translucent box on a pale sea (`KVT-10-s2.png`, 59 s); readable, low contrast.
- `lines.intro` is nine, not ten; fine under the module convention.
- Tara's "Stop on each one, carefully!" at the rising tide is the lie that makes the act; make sure the death line says the head sank.

## Not checked
Real-device touch and audio; Malayalam by a native speaker; the other parallel branches beyond reading their advice lines.

## Re-test
`probe5` at lag 0/6/12 (no DIES, no replay over 8 s), padding re-read, a death for the plank jump, the sweep, then full suite with the OLD line removed and `LDD_N=80 npm run fair -- KVT`.
