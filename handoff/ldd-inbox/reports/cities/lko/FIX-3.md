# LKO · Lucknow: fix round 3

- **Branch:** `city/lko`, tip **ff6aaef4c81ddaac189dd80f6f65e8cf20e8b9f1**, worktree `/local/home/saiposh/personal/ldd-wt/lko`.
- **Merges:** origin/develop 9d193f6 (v0.17.0, Patna) and then 4c38bcb (the new cpsafe), both merged, no rebase. One conflict, LKO's row in `docs/CITIES.md`, resolved by keeping Patna's "done" row and LKO's own row.
- Not pushed, no version bump. No shared file was edited or deleted.
- **Time lost:** about 50 minutes (08:22-09:12 IST) waiting on two shell approvals that expired. I reported it blocked on approval and resumed when approvals came back.

## What still fails

The floors are still not met for 05, 06, 07, 08, 09 and 10. The short stages 02-04 are at or above 25 s. The reasons are in "Still short, and why" at the end.

## Per stage

Clear time is the scripted route at lag 0.

| Stage | Floor | Before (FIX-2) | Now | Short by |
| --- | --- | --- | --- | --- |
| 02 Pehle Aap | 25 s | 25.3 s | 25.3 s | met |
| 03 Chhapa | 25 s | 25.2 s | 25.2 s | met |
| 04 Makhan Malai | 25 s | 26.4 s | 26.4 s | met |
| 05 Galouti | 60 s | 35.6 s | 39.3 s | 20.7 s |
| 06 Kathak | 60 s | 32.5 s | 37.4 s | 22.6 s |
| 07 Hazratganj | 120 s | 51.1 s | 70.7 s | 49.3 s |
| 08 Bhool Bhulaiya | 60 s | 26.9 s | 34.1 s | 25.9 s |
| 09 Kabootarbazi | 60 s | 46.6 s | 55.4 s | 4.6 s |
| 10 Lakhnavi Tehzeeb | 90 s | 46.3 s | 58.4 s | 31.6 s |

Pars are reset to about route time × 1.3: 05 51, 06 49, 07 92, 08 44, 09 72, 10 76.

06 got longer from bigger takhts (round 2) and wider, faster mehfil spacing (this round), not from a new act. 06's new acts (tihai, dugun) were dropped; see "Dropped or not built".

## Acts per stage, in order

New this round in **bold**. The decision sentences and checks for round 1-2 acts are in FIX-1 and FIX-2.

- **05:** tawa, lane, ulta, bhara, dum, **ghee**.
- **06:** tatkar, mehfil (takhts now 6 wide, she spins 1.5×).
- **07:** shaam, batti, julus, **chhidkav**, photo, **kohra**, chauraha.
- **08:** chausar (wider chabutra), **upar**, minar, mehrab, utar, wapas, **roshandan**.
- **09:** gumbad, hawa, jhande, **seeti**.
- **10:** dhulai, darbar, **tasveer**, julus, **jawab**, **raasta**, galiyara.

### New acts: decision, check, closest idea, deaths

Every new act was checked against this list of decisions the game already asks, and against every LKO act:
- step aside and wait;
- pace behind;
- fake floor with a tell;
- floor gives way when you stop;
- count, or a stale count;
- ride something;
- hop a head-on thing;
- item in hand;
- follow the beat.

None of the new acts matches one.

| Act | Decision, in one sentence | Closest idea, and why it differs | NAIVE-style play, cause @ tick | FIX-style play, cause @ tick | Tara line (V = in the bible's verified list) |
| --- | --- | --- | --- | --- | --- |
| `lko05-ghee` | These heaps are set: your weight flattens nothing; hop while the ladle makes a heap sizzle down, and don't stand in the sizzle. | `lko05-dum` (wait for the squashes): here Dad never lowers a heap; the cook's ladle does, and the tell is sizzle against gloss. | waiting on a heap for it to squash, as all along: `lko-ghee` @4221 | hopping on from a full heap: `lko-seekh` @4120 | "Munh mein ghul jaayega!" V |
| `lko07-chhidkav` | Shelter on the pillar's far side from the boy with the bucket, and cross just after his throw; the third boy stands before his pillar. | `lko07-batti` and the cut saamne: nothing comes down the pavement at you and there is no alcove; the hazard is fixed, and which face of the pillar is dry flips with where the boy stands. | walking straight on past the boys: `lko-chhidkav` @5034 | sheltering against the third pillar, as at the first two: `lko-chhidkav-ulta` @5987 | "Zehmat na kijiye." V |
| `lko07-kohra` | In the fog, greetings wait: don't stop to return one, or the fog catches you and hides the next nala. | `lko07-shaam` punishes any pause; kohra punishes the one polite stop 02 taught (law 6). There is no fog anywhere in MECHANICS. | stopping to return the greeting, as 02 taught: `lko-kohra` @7608 | running ahead of the fog: `lko-ganj` @7336 | "Shukriya, aage chaliye." V |
| `lko08-upar` | Come down on to the arch tops from above, because jumping at an arch from its floor takes you up into the hooks. | LKO's room (jump through = up) and minar. Here the arch is a floor you stand on, never a door you pass through. The idea comes from the bible's own "arch you can stand on from the top". | jumping at the first arch from the floor, as everywhere: `lko-bhool` @1979 | walking on along the floor: `lko-kuan` @1971 | "Har darwaza ek jaisa hai." V |
| `lko08-roshandan` | Read which way the light comes: a beam that narrows downwards falls on floor, a beam that widens upwards comes through a hole. | LKO-04 light direction (here light tells floor from hole, as information only); GNR-03 sunbeams are not hazards. | walking on to the next patch of light: `lko-roshandan` @3609 | keeping off the light and walking on in the dark: `lko-kuan` @3554 | "Har darwaza ek jaisa hai." V |
| `lko09-seeti` | A whistle beats any flag: watch who lifts his whistle, and wait on the tank roof, which neither flyer calls. | `lko09-jhande` asks which of two flags wins. In seeti a different kind of signal overrides every flag, and the safe place is where neither signal points. | crossing on the red flag, as on the first roofs: `lko-seeti` @5765 | going on past the tank roof once your flyer has called: `lko-seeti-jawab` @5914 | "Intezaar kis baat ka?" V |

### The finale callbacks: the rule each one taught, and how it breaks

| Callback | Rule taught | How it breaks | NAIVE-style play | FIX-style play | Tara line |
| --- | --- | --- | --- | --- | --- |
| `lko10-tasveer` (photo) | 07 photo: wait right by the posing group, run through on the flash. | The street before the group is bells under covers. Waiting by the group is a bow on the bells and the dancer comes, so you wait back before the drain and run the covers and the group in one go. | waiting right by the group: `lko-tehzeeb` @2916 | rushing them: `lko-photo-jaldi` @2814 | "Intezaar kis baat ka?" V |
| `lko10-jawab` (aadaab) | 02 aadaab: stop where you are for one short bow. | He greets you on the covered bells, and a stop there rings them. Step back to the plain board to bow. | bowing back right where he greets you: `lko-tehzeeb` @5638 | walking on past it: `lko-aadaab` @5598 | "Zehmat na kijiye." V |
| `lko10-raasta` (07 room's strollers) | 07: pause and the strollers part, then go through the gap. | The gap is a doorway and the gentleman in it bows you through first, on to the loose stone. Bow back, let him go first, hop his hole. | through the gap once they part: `lko-pehle` @6172 | rushing them: `lko-ganj` @6077 | "Pehle aap? Accha, pehle aap." V |

### Dropped or not built, and why

| Idea | Why |
| --- | --- |
| 05 reverse lane (my own idea) | Its decision is shaam's: keep ahead of something closing behind you. The researcher's rejected table says the same. |
| 08 mirror doorway (my own idea) | Its decision is "which door is the real one" (B32), already failed on Chhapa's door. |
| wapas callback for 10 | The julus going the other way is the oncoming-crowd decision the ruling gave to Patna. Nothing else of wapas breaks cleanly. |
| 06 tihai | "On the third repeat, be off every strip" is a count, which is on the list of decisions already asked. |
| 06 dugun | A ladder beat on tatkar, the same decision. |
| 07 window-shopper, 07 grain pigeons, 08 broken arch, 08 down-stair, 08 whispering wall, 05 turning skewers, 10.2 to 10.5, 10.6 | Not built for time. The time I lost to the approval wait went to the new cpsafe and to the acts above. |

## Checks

### (a) Identical windows per act

| Act | Beats | Twist / note |
| --- | --- | --- |
| ghee | 4 heaps | none; the ladle keeps pace with you |
| chhidkav | 3 shops | the third boy stands before his pillar |
| kohra | 3 greetings and 2 stroller groups, under one fog | — |
| upar | 3 arch tops | — |
| roshandan | 4 floor patches and 3 hole patches | — |
| seeti | one duel, two calls | — |
| tasveer | 1 group | — |
| jawab | 1 greeting | — |
| raasta | 1 gap | — |

No act repeats one hazard with one answer beyond one momentum beat. Ghee and upar are the closest to repetition, and each has 4 beats or fewer.

### (b) NAIVE vs FIX, cause @ tick, every act

From the final probe run at lag 0. The figure in brackets is seconds after the last checkpoint, measured to the tick. In every pair the cause and the tick both differ, except where marked.

```
02  room lko-pehle@218 (1.817) / lko-dhakka@343 (2.858) · takrar lko-takrar@1367 / lko-pehle@1334 · aadaab lko-aadaab@2234 / lko-aadaab-zyada@2475
03  room lko-chhapa@141 / lko-jali@404 · kunda lko-jali@1035 / lko-chhapa@870 · adda lko-adda@1485 / lko-kunda@1358 · rang lko-rang@2959 / lko-rang-kood@2583 · door lko-balti@3116 / lko-chhapa@2920
04  room lko-malai@128 / lko-dhakkan@326 · chowk lko-malai@1430 (one play) · badal lko-badal@1370 / lko-badal-peeche@1803 · door lko-malai@3115 (one play)
05  room lko-seekh@99 / lko-tawa@245 · tawa lko-seekh@824 / lko-tawa@943 · lane lko-seekh@1390 / lko-tawa@1552 · ulta lko-kafgir@2156 / lko-seekh@1893 · bhara lko-tawa@2932 / lko-seekh@2615 (half-hoist lko-seekh@3209) · dum lko-dum@3473 / lko-dum-teen@3880 · ghee lko-ghee@4221 / lko-seekh@4120
06  room lko-chakkar@187 / lko-tatkar@383 · tatkar lko-tatkar@614 / lko-chakkar@1555 · mehfil lko-mehfil@2135 / lko-ghungroo@2119
07  room lko-ganj@228 / lko-shamiyana@701 · shaam lko-shamiyana@591 (one) · batti lko-seedhi@1258 (one) · julus lko-julus@2801 / lko-julus-nala@4252 · chhidkav lko-chhidkav@5034 / lko-chhidkav-ulta@5987 · photo lko-photo@6542 / lko-photo-jaldi@6708 (test lko-photo-test@6908) · kohra lko-kohra@7608 / lko-ganj@7336 · chauraha lko-ganj@8030 / lko-shamiyana@8097 · door lko-darban@8487
08  room lko-bhool@120 / lko-kuan@307 · chausar lko-kuan@606 / lko-goti@1519 · upar lko-bhool@1979 / lko-kuan@1971 · minar lko-bhool@2362 / lko-kuan@2396 · mehrab lko-mehrab@2554 / lko-kuan@2719 · utar lko-bhool@3009 / lko-kuan@3112 · wapas lko-bhool@3235 / lko-kuan@3374 · roshandan lko-roshandan@3609 / lko-kuan@3554 · door lko-bhool@4038
09  room lko-kabootar@213 / (hawa) lko-hawa@1829 · gumbad lko-gumbad@1223 / lko-aks@1542 · jhande lko-jhanda-aage@4904 / lko-jhanda-peeche@4263 · seeti lko-seeti@5765 / lko-seeti-jawab@5914
10  room lko-pehle@273 / lko-tehzeeb@333 · dhulai lko-chhapa@700 / lko-malai@1216 · darbar lko-goti-pehle@2424 / lko-kuan@1534 · tasveer lko-tehzeeb@2916 / lko-photo-jaldi@2814 · julus lko-tehzeeb@3712 / lko-julus-nala@4986 · jawab lko-tehzeeb@5638 / lko-aadaab@5598 · raasta lko-pehle@6172 / lko-ganj@6077 · galiyara lko-tehzeeb@6740 / lko-kuan@6575 · door lko-tehzeeb@7014
```

- **Worst replay to a scripted death:** 7.350 s (04 shrinking shadows). The next worst are 03 dyer 6.558 s, 05 half-hoist 5.533 s and 04 cloud 5.267 s.
- **One play only, unchanged from FIX-2 with the same reasons:** 04 chowk, 07 shaam, 07 batti, and the doors.

### (c) Three-lag checkpoint table

From my own probe. It replays the scripted route with fair.test's lagged inputs, and from every checkpoint taken it checks:
- **Gaps** between checkpoints, to the tick.
- **Idle:** stand still 4 s.
- **Run:** run 0.3 s, then idle.
- **Tap:** one tap-jump, then idle.
- **Walk-in distance:** the tiles from the respawn point to the first spot that kills a walker holding right for 6 s.
  - `-` means no death within 6 s.
  - A negative number means the walker is shoved back into a nala behind him (07 and 10 julus, the procession ahead).
  - This is my proxy for "3.5 tiles before a trigger". The shared cpsafe test (below) checks the tap-jump distance itself.

| Stage | Longest gap at lag 0 / 6 / 12 (s) | Failing checkpoints | Smallest walk-in distance (tiles) |
| --- | --- | --- | --- |
| 01 | 4.383 / 4.758 / 4.575 | 0 | 5.7 |
| 02 | 7.183 / 7.233 / 7.333 | 0 | 10.8 |
| 03 | 7.500 / 7.650 / 7.833 | 0 | 5.7 |
| 04 | 7.642 / 7.642 / 7.550 | 0 | 5.9 |
| 05 | 6.383 / 6.492 / 7.883 | 0 | 3.7 |
| 06 | 6.950 / 6.667 / 7.408 | 0 | 5.3 |
| 07 | 6.475 / 6.642 / 6.867 | 0 | 5.0 (julus: shoved back) |
| 08 | 6.700 / 6.867 / 7.008 | 0 | 3.9 |
| 09 | 4.867 / 5.525 / 6.333 | 0 | 4.0 |
| 10 | 5.767 / 5.942 / 6.517 | 0 | 4.9 (julus: shoved back) |

- **The 3.5-tile rule:** 05's 3.7-3.8 and 08's 3.9 are the smallest. All of them are at least 3.5 tiles to the first lethal spot for a walker.
- **Stretches:** no stretch is over 25 s; the longest gap is 7.883 s.
- **Checkpoints while a hazard is running:** measured as "a checkpoint where one of the three plays dies". The count is 0.

### The shared cpsafe from develop 4c38bcb

It runs idle, run and tap-jump from every checkpoint at lag 0, 6 and 12. It is green for every LKO stage.

Before: 10 failing checkpoints, all on the tap-jump play.

| Stage | Checkpoint before | Death | After |
| --- | --- | --- | --- |
| LKO-01 | cp1 x35.0 (tour) | lko-than | moved to 33 |
| LKO-03 | cp0 x32.5 (kunda start) | lko-chhapa | `cp0: false`, checkpoint at -2 (x30, the room's tail) |
| LKO-03 | cp1 x44.5 (kunda 12.5) | lko-jali | 10.3 (4.7 tiles before vat 2) |
| LKO-03 | cp2 x57.5 (kunda 25.5) | lko-chhapa | 23.3 |
| LKO-04 | cp0 x32.5 (chowk start) | lko-malai | `cp0: false`, checkpoint at -2 |
| LKO-05 | cp1 x56.5 (lane start) | lko-tawa | `cp0: false`, checkpoint at -2 (the tawa act's tail) |
| LKO-06 | cp6 x88.6, cp7 x96.6 (mehfil takhts) | lko-mehfil | takhts widened from 4 to 6 tiles, mehfil respaced, so a tap-jump lands back on the takht; checkpoints at 6.6, 16.6, 26.6, 36.6, 46.6 |
| LKO-08 | cp1 x52.5 (court chabutra) | lko-kuan | chabutra widened from 4 to 6 tiles, second half of the court moved 2 tiles on |
| LKO-10 | cp3 x88.5 (darbar chabutra) | lko-kuan | same widening |

The new acts' checkpoints were set the same way: `cp0: false` with a checkpoint at -2 or -3 where the act starts within 4.5 tiles of a hazard (upar, ghee, jawab, raasta, ulta), and chhidkav checkpoints at 13.5, 22 and 31.5.

### Fairness: `LDD_N=80 npm run fair -- LKO`, final code

```
LKO-01: 6t 100%  12t 100%  18t 84%    every stretch at 0-12t 100%
LKO-02: 6t 100%  12t 100%  18t 100%   every stretch 100%
LKO-03: 6t 100%  12t 100%  18t 76%    every stretch 100%
LKO-04: 6t 100%  12t 100%  18t 76%    every stretch 100%
LKO-05: 6t 100%  12t 100%  18t 76%    every stretch 100%
LKO-06: 6t 100%  12t 100%  18t 85%    every stretch 100%
LKO-07: 6t 100%  12t 100%  18t 98%    every stretch 100%
LKO-08: 6t 100%  12t 100%  18t 93%    every stretch 100%
LKO-09: 6t 100%  12t 100%  18t 76%    every stretch 100%
LKO-10: 6t 100%  12t 100%  18t 80%    every stretch 100%
```

### Other proofs

- `npm run typecheck`: clean.
- **`npm test`** on the final code with develop 4c38bcb merged: **18 files passed (12 skipped); 1790 tests passed, 12 skipped, 0 failed.** LKO is on no allow-list. The scratch probes were moved out to `/tmp/lko-scratch-tests/` first.
- `npm run build:single && node scripts/flows.mjs`: "no errors".
- **Route sheets:** re-shot for every stage changed in rounds 1-3 (02-10) and copied to `shots/LKO-02-sheet.png` .. `LKO-10-sheet.png`.
  - Read closely: 02, 04, 07, 08 and 10. 07 shows the pillars, the boys and the water, the photo group and the fog bank. 08 shows the arch tops, the hanging arch and the dark light-well.
  - Made but not read frame by frame: 03, 05, 06 and 09.
  - **Legibility risk in roshandan:** at sheet scale the down-lit and up-lit beams look alike. Only the gradient direction and the bright hole lip tell them apart. QA should check this on a phone.
- **Death frames:** the round-2 sheets (`LKO-0N-deaths.png`) were not re-rendered for this round's acts.

## Still short, and why

| Stage | Now / floor | What would close it |
| --- | --- | --- |
| 05 | 39.3 / 60 s | 2 more new-decision acts; the researcher's 5.2 (turning skewers) is a cycle-timing beat |
| 06 | 37.4 / 60 s | tihai (a count) and dugun (a ladder) are both refused; it needs a new 06 decision that neither of us has found yet |
| 07 | 70.7 / 120 s | about 5 more acts; the window-shopper (7.3) and the rickshaw (7.4) are the next candidates, plus longer fog and sprinkle beats |
| 08 | 34.1 / 60 s | 4 more maze acts; the broken arch, the down-stair and the whispering wall are next |
| 09 | 55.4 / 60 s | one short act, the tumblers (9.2), would close it; not built for time |
| 10 | 58.4 / 90 s | 3-4 more breaking callbacks (10.2 lamplighter and malai, 10.3 coloured thread, 10.4 grain, 10.5 cold tawa); not built for time |

The rule I kept to: new decisions only, no step-aside, no pace-behind, no second window of a rule the stage already teaches. Where nothing passed that check in the time left, I stopped at the number above rather than pad.

Not checked: real human play; death frames for the new acts; phone-size legibility of the roshandan beams and the chhidkav pillar sides.
