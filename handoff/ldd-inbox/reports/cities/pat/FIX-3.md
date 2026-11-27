# PAT fix round 3

Branch `city/pat`, tip `d8cdc4e164343b1acb89a2206b7abfdb9662b4e7`. Own files only; no push, no version bump.

## The blocker: `pat05-khokhla` replaced by `pat05-kuli`

`khokhla` is deleted (code, causes, tests, docs). Its two traps were a fake floor with a tell and a floor that gives way when you stop: shipped ideas in a pontoon skin, as the tester said.

**New rule (`pat05-kuli`, `s05.ts`): the deck is one lane, and the load is the trap.** A laden porter walks the deck towards you, bent under a sack. He is the heaviest thing on the deck, so the three floats under him go under the Ganga as he walks (the pontoon's own idea, "the section sinks under the heaviest thing on it", now carried by a person coming at you, not by a cart on a rail). There is no room to pass, so you climb on the **lay-by**, a raised walkway on stilts three floats long with red marker posts and a LAY-BY sign, and let him go by. A second porter, in a red shirt with two sacks, follows three seconds behind the first, so stepping down after the first one is the stale-rule trap. The load is drawn: the sack on the porter's head, the second sack on the second porter, and the sunk floats under both.

- **Closest shipped idea:** TVM-03's head-on rider (MECHANICS: "one head-on") and PAT's own cart on 05 (jump the section it is on). It differs: you cannot hop the porter (the three-float zone is wider than a jump, and his sack is high), the safe move is to leave the lane for a raised place and wait, and the second porter makes the first all-clear a lie. No float is wrong by itself: every float is sound until a load is on it. Source: PAT's own pontoon idea; no reserve used.
- No identical window twice: one lay-by, two different porters (the second is the trap), and the rest of the stage is unchanged.

## Route times (s)

| Stage | Round 2 | Now | Floor |
| --- | --- | --- | --- |
| 05 | 60.9 | **70.6** | >= 60 |
| 06 | 61.1 | 61.1 | >= 60 |
| 10 | 99.7 | 99.7 | >= 90 |

Par for 05 is still 82 (route x 1.17; not retuned, no par test depends on it).

## NAIVE / FIX for the new act (cause @tick)

| Act | NAIVE | cause @tick | FIX | cause @tick |
| --- | --- | --- | --- | --- |
| `pat05-kuli` | run on along the lane to meet the first porter | `pat-kuli` @6318 | step up on the lay-by, let the first porter pass, step down (the second is right behind) | `pat-kuli2` @6631 |

Checkpoint on the lay-by (calm: standing there is safe). Replay from the last checkpoint to each death in this act: 7.6 s (NAIVE), 0.9 s (FIX). 05 checkpoint stretches: 7.3, 4.8, 17.2 (the sangam deck, unchanged), 5.8, 6.9, 2.9, 12.3, 5.3.

## Polish done

- **Rope (05 and 10 `bori`):** drawn dark brown and 3 px thick, and the landing section gets a red bar on its deck while the sack hangs.
- **`pat-bori` line:** now "The sack slid along its rope and landed on your section, and it went under."
- **PAT-10 FIX:** now dies to its own cause `pat-bhaar` with a count line ("You counted with the last cart's sacks: this cart has a different load. Read the sacks on the cart at the foot of each part again"), instead of `pat-ganga`. The stage-level FIX test expects it.
- **06 truck:** the handcart is now a lorry (cab, bed, three wheels) with the sacks on its bed, matching the TRUCK signs; the unloading porter's walk was moved clear of the cab. PAT-10 uses the same drawing for its carts.
- Fixed on the way: the lay-by is a solid block (stilts drawn, collision filled) so a lagged jump cannot walk under it. The first version failed fairness at 24% for that reason; it is 100% now.

## Proofs

- `tsc --noEmit`: clean. Full `npm test` (PAT on no allow-list): 18 files passed, **1605 tests passed**, 0 failed, 11 env-gated files skipped. `cpsafe` green.
- After `npm run build:single`, `node scripts/flows.mjs`: last lines `BLR-04` / **`no errors`**.
- Fairness, `LDD_N=80 npm run fair -- PAT` (full run before the checkpoint move to the lay-by; PAT-05 re-run after it: 6t 100%, 12t 100%, 18t 100%, all stretches 100%, door 100%):

```
PAT-01: 6t 100%  12t 100%  18t 80%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  door 100%
PAT-02: 6t 100%  12t 100%  18t 83%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  door 100%
PAT-03: 6t 100%  12t 100%  18t 76%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  door 100%
PAT-04: 6t 100%  12t 100%  18t 100%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  door 100%
PAT-05: 6t 100%  12t 100%  18t 100%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  s6 100%  s7 100%  door 100%
PAT-06: 6t 100%  12t 100%  18t 100%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  s6 100%  s7 100%  s8 100%  s9 100%  s10 100%  s11 100%  s12 100%  s13 100%  door 100%
PAT-07: 6t 100%  12t 100%  18t 100%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  s6 100%  s7 100%  s8 100%  s9 100%  s10 100%  s11 100%  s12 100%  s13 100%  s14 100%  s15 100%  door 100%
PAT-08: 6t 100%  12t 100%  18t 76%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  door 100%
PAT-09: 6t 100%  12t 96%  18t 95%   died: pat-charkhi @236 x2, died: pat-charkhi @235 x1
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  s6 100%  s7 100%  s8 100%  door 96%
PAT-10: 6t 100%  12t 100%  18t 100%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  s6 100%  s7 100%  s8 100%  s9 100%  s10 100%  s11 100%  s12 100%  s13 100%  s14 100%  door 100%
```

- Sheet read: `/local/home/saiposh/personal/ldd-inbox/reports/cities/pat/shots/PAT-05-sheet.png` (the lay-by with the red posts, Dad standing on it at 52.9 s, sunk floats and sacks under the passing porters). At phone size the porters are small; the sunk floats and the sack boxes carry the lesson, and the red marker posts make the lay-by readable.

## Not done / risk

- 05 still has one deck (the sangam, 17.2 s between checkpoints) with no calm place for a checkpoint, as in round 2.
- The porters are 22 px wide figures; if the tester finds them too small at phone size, the next step is a larger sprite, not a rule change.
