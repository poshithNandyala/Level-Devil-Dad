# TVM fix round 1 (from QA/FAIL.md)

Branch `city/tvm`, worktree `/local/home/saiposh/personal/ldd-wt/tvm`. Base da92c92 (develop ea12cdf already merged). Head **7cbf35e**: 3948992 (the fixes, refrozen) and 7cbf35e (docs). Only TVM-09 and TVM-10 changed in play. One change touches the whole city: the ground caps' flowers are white and pink now, not yellow. Files: `src/game/cities/tvm/{encores,dhara,entities,causes,look}.ts`, `tests/cities/tvm.ts`, `tests/cities/_frozen/tvm.json`, the new probe `tests/cities/tvm/probe.test.ts`, `docs/cities/TVM.md`, TVM rows of `docs/CITIES.md`. No shared file, no push, no bump.

**The probe** is `tests/cities/tvm/probe.test.ts`, kept. It is QA's probe4/probe5, unchanged in what it measures, and gated so `npm test` doesn't pay for it:
`LDD_TVMPROBE=1 npx vitest run tests/cities/tvm/probe.test.ts --silent=false` (`LDD_IDS=TVM-10` for one stage; `LDD_TVMREC=1 ... -t rec` writes death recordings to /tmp/tvm-rec). It sits in a subfolder so `tests/city-tests.ts` (which globs `tests/cities/*.ts`) doesn't read it as a city.

## B1. Calm checkpoints, stretch ≤ 25 s, replay ≤ 8 s

| What changed | File | Before | After |
| --- | --- | --- | --- |
| Every wave that followed another at once without being a deliberate pair now has its own position trigger. Each trigger has a calm hidden checkpoint at least 3.5 tiles before it, on sand Dad first reaches only after the last wave has run out (checkpoints are monotonic by x, so each one sits past the furthest point the wave before reached). The pairs that stay chained, because the trap IS the second wave, are compacted to fit 8 s: TVM-09 Hawa (the FIX's rip), TVM-09 Ashoka (he paces), TVM-10 palm beach (on, then back). | `encores.ts` | TVM-09 longest stretch 25.5 s, worst replay 23.7 s. TVM-10 stretches 24.9 / 20.0 / 20.6 s, worst replay 23.1 s | TVM-09 longest stretch 9.6 s, worst replay **7.8 s**. TVM-10 longest stretch 9.4 s, worst replay **7.8 s** |
| TVM-09 checkpoints added: vilakku x46 (between its two waves), samudra x82.4 (its second wave is now triggered at x86.2), pozhikkara x129.4 (second wave triggered at x133), Ashoka act start x138.5 restored | `encores.ts` | 4 + door | 7 + door |
| TVM-10 checkpoints added: courtyard x46.6 (moved, B2), shore x119.6, x124.2; palm beach x149, x158.4, x165.5; tarp beach x208.6, x219.4 | `encores.ts` | 8 + door | 15 + door |
| Chained pairs compacted: Hawa trigger x8.5 → x5.5, both waves in 1.2 s (was 2.0); Ashoka trigger x+6.5 → x+5, in at 2.0/2.5 s, in 1.2 s; palm beach in at 2.2/2.0 s, in 1.2 s. A wave in for 1.2 s still can't be jumped through (a full jump is about 0.9 s in the air) | `encores.ts` | — | — |
| The palm beach lost its end rocks: a run-and-jump off them carried Dad over the next checkpoint into the treatment rooms' first trough (a 14.3 s replay) | `encores.ts` | 14.3 s | 0.9 s |

### Checkpoint table (route at lag 0, from probe4/probe5)

**TVM-09**, route 64.3 s:

| cp | passed at | x | stretch before it | worst replay in the stretch after it |
| --- | --- | --- | --- | --- |
| spawn | 0.0 s | 1.5 | — | 7.6 s (drift, Hawa's second wave) |
| cp0 | 9.3 s | 32.5 | 9.3 s | 5.6 s |
| cp1 | 16.3 s | 46.0 | 7.0 s | 5.0 s |
| cp2 | 23.2 s | 72.5 | 7.0 s | 5.1 s |
| cp3 | 29.1 s | 82.4 | 5.8 s | 5.0 s |
| cp4 | 35.6 s | 106.5 | 6.6 s | 5.2 s |
| cp5 | 41.7 s | 129.4 | 6.1 s | 6.7 s (fell in the rock pool) |
| cp6 | 50.4 s | 138.5 | 8.7 s | 7.8 s (drift, Ashoka's second wave) |
| cp7 | 59.9 s | 167.5 | 9.6 s | 5.0 s |
| door | 64.3 s | | 4.4 s | |

**TVM-10**, route 95.5 s:

| cp | passed at | x | stretch before it | worst replay after it |
| --- | --- | --- | --- | --- |
| spawn | 0.0 s | 1.5 | — | 3.7 s |
| cp0 | 4.0 s | 32.5 | 4.0 s | 2.1 s |
| cp1 | 6.7 s | 46.6 | 2.6 s | 1.6 s |
| cp2 | 9.0 s | 66.5 | 2.3 s | 2.9 s |
| cp3 | 15.0 s | 98.2 | 6.0 s | 6.1 s |
| cp4 | 21.9 s | 119.7 | 6.8 s | 7.8 s (soaked sand) |
| cp5 | 30.9 s | 124.3 | 9.0 s | 6.8 s |
| cp6 | 39.9 s | 132.5 | 9.0 s | 7.7 s (drift, palm beach pair) |
| cp7 | 49.3 s | 149.1 | 9.4 s | 5.6 s |
| cp8 | 55.5 s | 158.4 | 6.2 s | 5.8 s |
| cp9 | 63.4 s | 165.6 | 7.9 s | 0.9 s |
| cp10 | 63.7 s | 168.5 | 0.3 s | 3.1 s |
| cp11 | 67.6 s | 196.2 | 3.9 s | 6.3 s |
| cp12 | 74.5 s | 208.6 | 6.9 s | 5.6 s |
| cp13 | 80.8 s | 219.4 | 6.3 s | 5.8 s |
| cp14 | 89.2 s | 229.6 | 8.4 s | 3.0 s |
| cp15 | 93.5 s | 257.5 | 4.3 s | 2.1 s |
| door | 95.5 s | | 2.0 s | |

## B2. Every checkpoint calm

| What changed | File | Before | After |
| --- | --- | --- | --- |
| Courtyard checkpoint moved x48.5 → x46.6 (act col 16.5 → 14.6): a tap jump or a short run from it now lands before the palm's oil (x51.5) | `encores.ts` (kizhi `cps`) | tap jump from cp1 dies coconut 1.07 s after respawn | lives |
| Palm-beach and tarp-beach starts: their first triggers moved (x+5 → x+6.5, x+5 → x+7) so the act-start checkpoint is 3.5+ tiles short of the whistle | `encores.ts` | cp4/cp6 (old numbering): run 0.3 s or tap jump dies `tvm-rip` 2.8/3.8 s after respawn | lives |
| The palm beach coconut only drops while he has the flags under that palm (wave 1); after that the crown keeps its nut, so walking under it on the way on is calm | `encores.ts` | a stop under the palm after wave 1 died (9.5 s replay) | lives |

**Calm result** (probe5: from every checkpoint of TVM-09 and TVM-10: idle 4 s; run 0.3 s then idle; one tap jump forward then idle): **no death in any of the 3 × 23 plays.** `cpsafe.test.ts` is green for both stages.

## B3. Finale act types and act deaths

| What changed | File | Before | After |
| --- | --- | --- | --- |
| **tvm10-theeram (shore) re-betrayed: the way to the strip is the trap.** Between Dad and the new flags lies TVM-01's monsoon-soaked ground, dark like the rip. It holds a walker and gives way under a hop or a landing (a tile group that falls; `tvm-soaked`). Three waves: far on across it, back across it, then planted on the soaked sand itself ("it holds you"). The strip is never the hazard. No other TVM act has "the ground on the way breaks if you jump" | `encores.ts`, `causes.ts` | oil in the middle of the strip (the same type as the palm beach) | soaked sand on the way; MISTAKE "jump the dark sand" dies `tvm-soaked` |
| The tarp beach no longer repeats "he paces and puts them back": its waves are the tarp (step up, back off, let it empty, then in), then on, then back | `encores.ts` | 3 flags-plus-hazard-in-strip acts | 2 (palm beach, tarp beach), different answers (stand clear of the crown; wait for the tarp to empty) |
| MISTAKE for tvm10-uzhichil: the long jump first, like the hall | `tests/cities/tvm.ts` | none | dies `tvm-kindi` at x179.8 (lands on the oil and slides into the kindi, as the advice says) |
| MISTAKE for tvm10-chanda: step on the ice after the twitch | `tests/cities/tvm.ts` | none | dies `tvm-chaal` at x237.7 (the yank takes the ice out from under him into the drain) |

Route time stays real play: 95.5 s, up from 90.7 s, from the shore's third wave and the palm beach's fourth. No waits were added.

### Per act, the obvious play (A1) and the obvious fix (A2): cause and tick (probe4, lag 0)

| Act | A1 (obvious play) | A2 (obvious fix) | different cause and tick? |
| --- | --- | --- | --- |
| room (hall) | NAIVE: walk on → `tvm-droni`, x10.8, 1.1 s | FIX: long jump from before the oil at every trough → `tvm-kindi`, x25.8, 2.9 s | yes |
| tvm10-kizhi (courtyard) | walk on under the full tarp → `tvm-drenched`, x42.1, 5.2 s | let it empty, jump the trough, walk on over the palm oil and get up → `coconut`, x53.5, 7.9 s | yes |
| tvm10-thumba | walk on when the rocket goes → `burnt`, x83.8, 10.9 s | stop short of the fire, like the tour → `crushed`, x79.8, 12.0 s | yes |
| tvm10-theeram (shore) | stay in the flags you were in → `tvm-rip`, x103.8, 18.6 s | jump the dark sand (it looks like the rip) → `tvm-soaked`, x112.1, 16.6 s | yes |
| tvm10-kadappuram (palm beach) | stay in the flags you were in → `tvm-rip`, x139.3, 42.8 s | stand in the middle of the new flags → `coconut`, x145.9, 41.8 s | yes |
| tvm10-uzhichil (rooms) | walk on → `tvm-droni`, x174.1, 64.3 s | the long jump first, like the hall → `tvm-kindi`, x179.8, 65.3 s | yes |
| tvm10-thira (tarp beach) | walk straight into the flags under the full tarp → `tvm-drenched`, x207.9, 69.2 s | stay in the flags you were in, away from the tarp → `tvm-rip`, x201.8, 71.4 s | yes |
| tvm10-chanda (Chalai) | walk on → `tvm-chaal`, x240.1, 90.4 s | wait for the yank, jump on to the ice, walk off on to the oil → `tvm-kindi`, x243.9, 91.8 s | yes (and "step on after the twitch" → `tvm-chaal`, x237.7, 90.5 s) |

Every one is a scripted MISTAKE in `tests/cities/tvm.ts`, played by `levels.test.ts` (each must die of its named cause).

**No identical window repeated.** Each TVM-10 wave has its own move and timing, as (trigger, flags to, in at s, in for s):
- Shore: (x+7, x+20, 3.0, 2.6), (x+27.5, x+6, 3.2, 2.6), (x+31.8, x+13, 3.0, 2.6).
- Palm beach: (x+6.5, x+12, 2.2, 1.2) chained to (back to x+5, 2.0, 1.2), then (x+21, x+24, 2.6, 2.6), (x+30.2, x+18, 2.8, 2.6).
- Tarp beach: (x+7, x+12, 3.2, 2.6), (x+18.5, x+22, 2.6, 2.6), (x+29, x+16, 2.8, 2.6).

The only immediate repeat is the palm beach's on-then-back pair, which is the one momentum beat.

## B4. The oil, readable on a phone

| What changed | File | Before | After |
| --- | --- | --- | --- |
| The slick is a raised pool: a dark amber rim (`#7A4A08`) and a body from `#E0A21E` to `#9A5E0C`, about 6 px tall from 4.6 px above the grass line, with a sliding cream sheen (4 × 1.2 px) and a highlight. The drips are 2.4 × 4 px amber, were 1.6 × 3 px pale | `dhara.ts` | 2.5 px faint strip on the grass line | reads as amber puddles at 844×390 |
| No yellow ground flowers: TVM's ground caps use white and pink flowers. (Caps are per city, not per stage, so this applies to all 10 TVM stages; no gameplay effect) | `look.ts` | yellow flowers like the oil | none yellow |
| The shore death: the shore has no oil now (B3). Its deaths name their own trap: `tvm-soaked` ("The soaked sand gave way under your hop. / It holds a walker: walk across, never hop it.") or `tvm-rip`/`tvm-drift` for the waves. The death QA saw (standing between the flags on oil, told "outside the flags") can no longer happen | `causes.ts`, `encores.ts` | wrong lesson | each line names what killed |

Re-shot frames at 844×390 (deviceScale 1.5, QA's shot script, run from /tmp), read by me:
- `/local/home/saiposh/personal/ldd-wt/tvm/shots/fix1/n10-07.png` (NAIVE): both pools by the first two troughs read as amber puddles, distinct from grass and flowers.
- `/local/home/saiposh/personal/ldd-wt/tvm/shots/fix1/f10-093.png` (FIX): Dad on the pool before the kindi.
- `/local/home/saiposh/personal/ldd-wt/tvm/shots/fix1/m10_1-093.png` (shore, jump the dark sand): the soaked stretch reads as a dark patch between Dad and the flags, and the lifeguard is in the strip.
- `n10-093.png`, `f10-07.png`, `m10_1-07.png`, `m10_2-07.png` and `m10_2-093.png` (uzhichil) are in the same folder.

The title card shows over the frames again (the same shot-script artifact QA noted).

## Polish

- The IceSlab doc comment now says the porter yanks it 3 tiles further on, the same way as the twitch (`entities.ts`).
- TVM-07 left as it was.

## Fairness (LDD_N=80 npm run fair -- TVM)

```
TVM-01: 6t 100%  12t 100%  18t 98%   stretches: s0 100%  s1 100%  s2 100%  door 100%
TVM-02: 6t 100%  12t 100%  18t 76%   stretches: s0 100%  door 100%
TVM-03: 6t 100%  12t 99%  18t 78%    stretches: s0 99%  door 100%
TVM-04: 6t 100%  12t 100%  18t 84%   stretches: s0 100%  door 100%
TVM-05: 6t 100%  12t 100%  18t 84%   stretches: s0 100%  door 100%
TVM-06: 6t 100%  12t 99%  18t 75%    stretches: s0 99%  door 100%
TVM-07: 6t 100%  12t 100%  18t 80%   stretches: s0 100%  s1 100%  door 100%
TVM-08: 6t 100%  12t 100%  18t 76%   stretches: s0 100%  door 100%
TVM-09: 6t 100%  12t 100%  18t 98%   stretches: s0-s7 100%, door 100%
TVM-10: 6t 100%  12t 100%  18t 76%   stretches: s0-s15 100%, door 100%
```

Before this round: 09 100/100/98, 10 100/100/76; 02-08 unchanged.

## Refrozen numbers (tests/cities/_frozen/tvm.json vs da92c92)

- TVM-09 checkpoints + 46, 82.4, 129.4, 138.5: the new calm checkpoints (B1).
- TVM-09 route 8084 → 7721 ticks (−3.0 s): the Hawa and Ashoka pairs are in for 1.2 s, not 2.0 (−3.2 s), Ashoka's first wave comes in at 2.0 s, not 2.3, and samudra's first at 2.7, not 2.9. The newly triggered waves add a little walking back.
- TVM-09 NAIVE 378 → 325: the first whistle is at x5.5, not x8.5 (0.34 s sooner, 41 ticks), and that wave comes in at 2.2 s, not 2.3 (12 ticks): −53.
- TVM-09 FIX 937 → 789: the same −53, plus the first wave's 1.2 s instead of 2.0 s in (−96): −149, measured −148.
- TVM-10 checkpoints: 48.5 → 46.6 (B2); + 119.6, 124.2, 149, 158.4, 165.5, 208.6, 219.4 (B1).
- TVM-10 route 10879 → 11465 ticks (+4.9 s): the shore rebuilt with three waves, and the palm beach's fourth wave. The tarp beach lost its "paces" wave and its pair is now two single waves.
- TVM-10 NAIVE 137 and FIX 344: unchanged. TVM-01..08: nothing moved.

## Tests

- `npm run typecheck`: clean.
- Full `npx vitest run` with `TVM: OLD` removed from `tests/modules.test.ts` locally (reverted after): **1508 passed, 0 failed**, 15 skipped (31 files; the 3 extra skips are the gated probe tests).
- `node scripts/flows.mjs` after `npm run build:single`: no errors.

## Still short / risks

- The probe's worst replays are 7.8 s on both stages: inside 8 s, but with only 0.2 s to spare.
- TVM-10 at relaxed lag (0-18 ticks) is 76% for the whole stage. Every stretch at average lag is 100%, and the bar is set at average.
- The no-yellow-flowers change is city-wide.
- The soaked sand also breaks on a landing (so a jump over it from before it lands on it and breaks it). That is the lesson, but QA should check it reads as "I jumped on it".
- `coconut`/`drop` module cycle (levels.ts ↔ encores.ts): unchanged, harmless at build time.
