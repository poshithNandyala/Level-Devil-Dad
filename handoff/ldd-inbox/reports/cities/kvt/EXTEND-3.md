# KVT (Kavaratti) round 3: the two soft acts kill, relaxed lag traced, margin on 08

Branch `city/kvt`. Commits this round: `add82a8` (game and tests, refrozen), `d0bcfe0` (docs), `0837c78`
(merge of `origin/develop` 6172e21, the checkpoint-test change; merged, not rebased). Head **0837c78**.
No push, no version bump.

## Proof

- `npx tsc --noEmit`: clean (after the merge).
- Full `npm test` after the merge, with `KVT: [...OLD, 'naive', 'fix']` removed from `tests/modules.test.ts`
  locally and then `git checkout`: **1526 passed, 12 skipped, 18 files** (round 2 had 1524; +2 are the new
  mistakes).
- Shot sheets, read by me, copied to `shots/` here: `KVT-08-sheet.png`, `KVT-09-sheet.png`,
  `KVT-10-sheet.png`. In 09 the 33.8 s frame shows the irangal steps with the wider lagoon at the bottom, and
  the 43.4 s frame shows the kuzhi hollow and its pool. In 10 the 64.9 s frame shows the wider incoming-tide
  heads. Nothing overlaps or clips except the shared stage card ("Found it!" over the subtitle for a moment
  on the first frame). That card is shared code.

## 1. `kvt09-irangal` and `kvt09-kuzhi` now kill their obvious play

Why they survived in round 2: the rubble slide moves Dad 2-3 px a tick even in the air. The slide that carried
him off the bottom step also carried him over the 2-tile lagoon (irangal) or the 1-tile pool (kuzhi), and he
landed safe. Neither rung was softened. The water at the bottom is now too wide to be carried over.

- **irangal:** the lagoon at the bottom is 4 tiles (was 2), from x+30 to x+33. The answer is unchanged:
  walk off the 3-tile steps and hop over the 1-tile ones. The route now walks to the end of the last step
  (walking never slides) and long-jumps the water.
- **kuzhi:** the bottom step going down is 2 tiles (was 3), and the pool is 2 tiles (was 1). Walk off each
  step going down: you land at the back and the slide puts you in the middle, as before. Hop down (land
  deep) and the slide takes you off the 2-tile bottom step into the pool. The climb up the far side is
  unchanged.

| Act | Obvious play (scripted mistake) | Cause @ tick | The answer |
| --- | --- | --- | --- |
| kvt09-irangal | walk down step by step, as Tara says ("Padi padiyaayi nadannu irangu!") | **splash @4198** | survives, route goes on (route won @7233) |
| kvt09-kuzhi | hop down into the hollow | **splash @5760** | survives, route goes on |

The cause is `splash` (into the lagoon), the same as every other rubble death on 09. The rubble kills only by
water, so I did not invent a new cause id. Each death has its own tick, and the act's answer does not die.

## 2. Relaxed lag on 09 and 10: traced beats and fixes

I ran the probe at relaxed lag only (0-18 ticks, LDD_N=80), per stretch, logging each death's lag, cause and
column. A trace of single runs at lag 13-18 found these beats:

| Stage | Beat (stretch) | What killed the relaxed player | Fix |
| --- | --- | --- | --- |
| 09 | room and kodumudi first face: "walk to the far end, then up" (s0, s2) | The route's "hold right until on the ground" ended at once, before a 13-18-tick-late jump had left the ground. So right was let go mid-jump and Dad fell back on the step below. | Route only: the step now holds right until he has left the ground and landed (`landed()` in tests/cities/kvt.ts). A player holds right until he lands. Stage unchanged. |
| 09 | kadalbhitti, the hop back up on to the wall before the second break (s3) | A late jump lands late. The wall between the breaks was 2 tiles, so the run on after landing took him over the edge into the second break. | **Stage:** 3 tiles of wall between the breaks (the second break and its loose block moved one tile right). The loose block and its rule are unchanged. |
| 10 | kvt10-choora, the second boat's low tuna (s5) | The route hopped when the fish was 0.16 s away. The hop clears the fish only if taken about 0.30-0.04 s before it arrives, so any lag over about 14 ticks was hit. | Route: hop at 0.26 s (about 5 tiles off, when the fish is plainly coming). At 0.34 s lag-0 play dies, so the window is real and the route now sits in its middle. |
| 10 | kvt10-kamaanam, running out to the arch dolphin (s8) | A late start meant he could not catch the dolphin before it went under. | **Stage:** the arch dolphin's leap is slower (1.45 s → 1.7 s in the air). The arch, its spikes and "step off coming down" are unchanged. |
| 10 | kvt10-veliyettam, incoming tide (s10) | At a run, a jump 13-18 ticks late took off past the end of a 3-tile head. | **Stage:** the heads are 4 tiles (was 3). The spacing is unchanged, so the gap between heads is still a hop, and they still sink if you stop. The route waits for each landing. |
| 10 | kvt10-paaru, the first jump off the shore (s11) | The route jumped 0.2 tiles before the edge. A late jump walked off, and a walk-off does not raise the reef. | Route: jump from x+2.4 (was 3.2), well back from the edge, where a person jumps from. Stage unchanged. |

Not fixed: one KVT-10 death at lag 18 only (2 of 80 runs, splash at the last paaru jump to the shore,
stretch s12 at 98%).

Relaxed per-stretch table after the fixes (LDD_N=80, relaxed lag only):

```
KVT-09: relaxed 100%
  s0 100  s1 100  s2 100  s3 100  s4 100  s5 100  s6 100  s7 100  door 100
KVT-10: relaxed 98%   died: splash @423 x2 (lag 18)
  s0 100  s1 100  s2 100  s3 100  s4 100  s5 100  s6 100  s7 100  s8 100  s9 100  s10 100
  s11 100  s12 98  s13 100  s14 100  s15 100  s16 100  door 100
```

Round 2 relaxed was 76 on both, so both now meet the 90 target.

## 3. KVT-08 margin

The 95 was not the drifting weed bed, although the deaths sit near it (@74-75). Those deaths happen at the
first dolphin: a player who sets off late is still too far back when it surfaces, and his jump falls short.

- **Fix (stage):** the first dolphin surfaces at X(3.3), not X(4), closer to the sand edge. It still
  surfaces in the water, and its leap, top and land-off are unchanged.
- **Result:** quick 94 → 100, average 95 → **96**, dolphin stretch 95 → 96, relaxed 74 → 76.
- **What is left:** 3 of 80 runs at lag 8-12. All have an idle near 290 ticks, i.e. one phase where the
  dolphin surfaces just as Dad reaches the edge.
- **Tried and reverted:** a slower dolphin leap. It broke the second dolphin's timing (average fell to 50).
  Moving the far beach a tile closer changed nothing.
- I stopped at 96, a 1-point margin, rather than move the dolphin onto the sand.

## Fairness, LDD_N=80, 02-10 (quick / average / relaxed; stretches at average)

```
KVT-02: 6t 100%  12t 100%  18t 80%     s0 100  s1 100  door 100
KVT-03: 6t 100%  12t 100%  18t 76%     s0 100  s1 100  door 100
KVT-04: 6t 100%  12t 100%  18t 76%     s0 100  s1 100  door 100
KVT-05: 6t 100%  12t 100%  18t 81%     s0 100  s1 100  door 100
KVT-06: 6t 100%  12t 100%  18t 80%     s0 100  s1 100  s2 100  door 100
KVT-07: 6t 100%  12t 100%  18t 100%    s0 100  s1 100  s2 100  door 100
KVT-08: 6t 100%  12t 96%   18t 76%     s0 100  s1 100  s2 96  door 100   (splash @74 x1, @75 x2)
KVT-09: 6t 100%  12t 100%  18t 100%    all 8 stretches 100, door 100
KVT-10: 6t 100%  12t 100%  18t 98%     all 17 stretches 100, door 100
```

## Refrozen numbers (`tests/cities/_frozen/kvt.json`), explained

Only two numbers moved:

- **KVT-08 route 2258 → 2259 ticks.** The first dolphin surfaces 0.7 tile nearer, so the ride starts one
  tick later. NAIVE splash @286 and FIX splash @537 are unchanged.
- **KVT-09 route 7226 → 7233.** The route now walks to the end of irangal's last step and long-jumps the
  4-tile lagoon (+8), and kuzhi's jump over the pool starts a tile back (−1). NAIVE splash @262 and FIX
  spikes @799 are unchanged, and checkpoints and par are unchanged.

KVT-10 route 10817, NAIVE kvt-octopus @179 and FIX splash @564 are unchanged. The route's later waits (the
basket, the boat, the tide) re-sync it to the same tick.

Mistake ticks are not frozen. Some moved by a few ticks because `landed()` waits on the ground for up to 24
ticks when a jump step has already landed:

- **KVT-09:** ridge 4531 → 4539; loose block 3504 → 3517; summit 2521 unchanged; storm cut 6543 → 6550; new
  irangal 4198; new kuzhi 5760.
- **KVT-10 (same causes as round 2):**
  - 770, 1598, 5996 and every tick from 6931 to the door: unchanged.
  - Moved: turtles 2352 → 2368; tuna 3501 → 3517; crown 4333 → 4347; morays 4996 → 5012; arch dolphin
    6623 → 6638.

## Still short

- KVT-08 has a 1-point margin (96), not more. See section 3.
- KVT-10 relaxed has one lag-18-only death left (98).
- KVT-02 to 07 relaxed (76-81) were not in this item and are untouched.

## Risks

- **Malayalam still unchecked by a native speaker.** The checks include "vettikkalanju" and "neerali", and the
  Tara and npc lines from rounds 2 and 3:
  - "Aa kallil chaadi nilkku!"
  - "Munpathe pole akathu chaadu!"
  - "Padi padiyaayi nadannu irangu!"
  - "Ini nadannu kayaru!"
  - "Thazhekku!"
  - "Kannadi poyi!"
  - "Avasaanam vare irunno!"

  I wrote them; nobody who speaks Malayalam has read them.
- Three route fixes are route-side, not stage-side: `landed()`, the tuna hop at 0.26 s and the reef jump
  from x+2.4. Each is explained above as the step a person takes. The stage-side fixes are the sea-wall
  spacing, the arch dolphin's leap, the wider tide heads and the 08 dolphin's surfacing point.
- `origin/develop` 6172e21 (checkpoint tests) was merged after my test run. The full suite was re-run after
  the merge (1526 passed).
