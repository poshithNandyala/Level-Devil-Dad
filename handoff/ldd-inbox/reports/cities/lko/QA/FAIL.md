# LKO · Lucknow: QA verdict FAIL (round 1)

Tester: independent QA chat (wrote none of LKO). Subject: `city/lko` at **af20d79** (branch head when tested), my own detached worktree `/local/home/saiposh/personal/ldd-wt/qa-lko`. Nothing committed; three untracked scratch tests (`tests/qa-lko-*.test.ts`) and `shots/qa/` live only in that worktree.

## What I ran and what came out (all reproduced myself)

| Check | Command | Result |
| --- | --- | --- |
| Full suite | `npm ci && npm test` | **18 files passed, 12 skipped; 1597 passed, 12 skipped, 0 failed** (matches BUILD.md). LKO is on no allow-list in `tests/modules.test.ts`. Guard, allocation, levels (route, NAIVE, FIX, MISTAKES), checkpoints, cpsafe, items and jump audit all green. |
| Merge with current develop | `git merge --no-commit --no-ff develop` (ea12cdf), `npm test`, `git merge --abort` | merges clean; 1600 passed / 0 failed (incl. my 3 scratch tests). Own paths only. |
| Build + flows | `npm run build:single && node scripts/flows.mjs` | build OK; flows **"no errors"**. Note: in a fresh `npm ci` worktree playwright looks for headless shell 1254, which is not in the cache; I ran with `CHROME_PATH=~/.cache/ms-playwright/chromium_headless_shell-1228/.../chrome-headless-shell`. Environment issue, not LKO's. |
| Fairness | `LDD_N=80 npm run fair -- LKO` | passes the bar (output below) |
| Route time per stage and per act | scratch `tests/qa-lko-scratch.test.ts` (play the route, note the tick each act start is crossed) | table in section 3 |
| Checkpoint gaps, death-to-last-checkpoint | scratch `tests/qa-lko-cp.test.ts` | section 8 |
| Death frames | recorded every NAIVE / FIX / MISTAKE (`tests/qa-lko-rec.test.ts`), rendered at 70 / 93 / 99.9% of each run with a copy of `routeshots.mjs` | `shots/qa/A.png`, `B.png`, `C.png` in my worktree; builder sheets `shots/LKO-01..10-sheet.png` read too |

Every scripted death reproduced with the cause the tests claim (46 runs: NAIVE 10/10, FIX 10/10, MISTAKES 26/26).

```
LKO-01: 6t 100%  12t 100%  18t 84%
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  door 100%
LKO-02: 6t 100%  12t 100%  18t 100%
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  door 100%
LKO-03: 6t 100%  12t 100%  18t 76%
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  door 100%
LKO-04: 6t 100%  12t 100%  18t 76%
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  door 100%
LKO-05: 6t 100%  12t 100%  18t 76%
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  door 100%
LKO-06: 6t 100%  12t 100%  18t 93%
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  door 100%
LKO-07: 6t 100%  12t 100%  18t 100%
  stretches at 0-12t (bar 95% each): s0 100% ... s10 100%  door 100%
LKO-08: 6t 100%  12t 100%  18t 100%
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  door 100%
LKO-09: 6t 100%  12t 100%  18t 80%
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  door 100%
LKO-10: 6t 98%  12t 99%  18t 75%   died: lko-tatkar @125 x1
  stretches at 0-12t (bar 95% each): s0-s3 100%  s4 99%  s5-s18 100%  door 100%
```

Tests, fairness, flows and the merge are not the problem. The findings below are.

## BLOCKING findings

### B1. LKO-02, 03, 04: half their floor, and no reason given anywhere
- **What:** scripted-route clear times are 12.0 s, 11.4 s and 11.5 s against the 25-45 s floor for 02-04. Each is room + one act + door. BUILD.md and LENGTH.md discuss 01 and 05-10 only; 02-04 are not mentioned as short.
- **How reproduced:** `tests/qa-lko-scratch.test.ts`: 02 win 12.0 s (gali reached at 4.5 s), 03 win 11.4 s (kunda at 6.0 s), 04 win 11.5 s (chowk at 4.8 s).
- **What would satisfy me:** each reaches 25 s of route with one more act whose betrayal is new to LKO (not a longer copy of the existing act), with its own NAIVE-style and FIX-style deaths. Suggestions from their own families: 02 a doorway where both gentlemen bow back and the first to stop is the one who goes (stand-off timing, not the stone again); 03 a stitcher's frame where the hoop moves the solid flowers; 04 a cloud passing the sun (no light: every tile holds, then both sides go soft in turn as it clears).

### B2. Padding: the same hazard repeated far past one momentum beat (05, 09, 10)
The length pass trimmed julus, saamne, mehfil and court back to 3-5 repeats, each with a twist on the last one. These were not trimmed:
- **LKO-05 `lko05-tawa`:** 16 heaps (`TAWA2 = 'FTFTTFTFFTFTTFFT'`, `s05.ts:172`) of the room's squash-then-hop, which already had 7 heaps; 9.7 s of route. The thin/thick mix is decided within the first 3-4.
- **LKO-05 `lko05-dum`:** 12 heaps, 11 of them identical double heaps (`DUM`, `s05.ts:314`), evenly spaced every 3 tiles, no twist. This is a wait beat, not a momentum beat. Stage 05 has 35 squash-hop heaps in all.
- **LKO-09 `lko09-gumbad`:** 6 identical domes, every 8 tiles, same paving-line offset (`GUMBAD`, `s09.ts:309`); 8.3 s of route. Domes 2-6 add nothing once dome 1 is learned.
- **LKO-10:** 7 of its 9 acts are `again(act, id, advice)` copies of earlier acts with the same layout and the same hazard (`s10.ts:208-215`: tawa (the 16-heap one again), tatkar, julus, gali, hawa, chausar, kunda). By route time they make about 75 of the 92.3 s (tawa10 9.7 s, tatkar10 5.0, julus10 19.3, gali10 5.0, hawa10 18.9, chausar10 13.2, kunda10 4.6). Only `lko10-dhulai` (wash + malai together) and `lko10-galiyara` (arches + covered bells) combine ideas. The bible's finale law is "callbacks in a new order" that **break the sequence they taught** (law 7); a verbatim replay does neither. So the finale meets its 90 s floor by replaying, which I can't count as meeting it. The builder flagged this risk in LENGTH.md.
- **What would satisfy me:** tawa at 5-6 heaps, dum at 4-5 with a twist on the last one (for example a triple heap, or the last double heap already half-squashed), gumbad at 3 domes with a twist on the third (the line moved, or the dome is behind a second pool). Each finale callback either changes the act it calls back (a second idea on top, as `dhulai` and `galiyara` do, or its learned answer made wrong once) or is cut. The length then has to come from new acts (B3).

### B3. Short stages that don't play as their slot's shape (05, 08, 09; 10 once B2 is applied)
Route times: 05 35.2 s, 06 33.1, 07 69.6, 08 21.2, 09 39.2, 10 92.3; floors 60/60/120/60/60/90.
Act-by-act route time (when the route reaches each act start):
```
05  room 0-6.3  tawa 6.3-16.0  lane 16.0-20.6  dum 20.6-~33  door
06  room 0-4.3  tatkar 4.3-14.1  mehfil 14.1-~29  door
07  room 0-3.6  shaam -8.9  batti -20.0  julus -39.3  saamne -64.1  chauraha+door -69.6
08  room 0-3.3  chausar -16.6  mehrab -~20  door -21.2
09  room 0-9.5  gumbad -17.8  hawa -~36  door -39.2
10  room 0-4.6  dhulai -11.1  tawa -20.8  tatkar -25.8  julus -45.1  gali -50.1  hawa -69.0  chausar -82.2  kunda -86.8  galiyara+door -92.3
```
My judgement, stage by stage:
- **07 Hazratganj (marathon), 70 s: plays as a marathon. Not blocking.** Seven distinct beats (rush strollers, awnings = momentum, lamplighter = shelter then go, julus = pace-follow with the off-rhythm fourth nala, saamne = shelter with the cracked last alcove, chauraha = combination, darban door), alternating, hidden checkpoints, `lives: 'act'`. Short of 120 s, but no repeats. Next round: one or two more acts would reach the floor. The builder's pigeon-pavement idea (rushing scatters the flock, pausing near the grain seller is deadly) is a good one.
- **06 Kathak, 33 s: plays as a long. Not blocking.** Four distinct beats: strips, tatkar patch (go at it), mehfil (shelter on takhts), sam door (wait). Next round: one act, e.g. the builder's tabla echo that draws her to the wrong spot.
- **08 Bhool Bhulaiya (HWIK + tough), 21 s: does NOT play as its shape. Blocking.** The maze rule (jump through = a floor up) is used in the room and once more in `mehrab`, about 7 s of play. The "tough" half is the court (13 s), which is the Pachisi reserve and not a maze idea. A 60 s "WTF then tough" stage needs the rule to go stale at least once. Next round, 2 acts: the builder's minaret of stacked arches (two jumps = two floors up, so you must land on the right floor), and a down-arch (go through at a drop and you come out a floor below).
- **05 Galouti, 35 s, of which about 15 s is padding (B2): does NOT play as a long. Blocking.** Unpadded, it's about 20 s with two real ideas (squash then hop, the lane). Next round, 2 new acts: the builder's reverse squash wave from the cook's end, and one where flat is the trap (a heap you must keep full: stepping on, off, on).
- **09 Kabootarbazi, 39 s, about 6 s padding: does NOT play as tough-knowable yet (see also B4). Blocking.** Next round: one more flag act, e.g. the builder's second flyer where the birds obey the nearer flag. Keep 09 at one new rule per act.
- **10 finale:** once B2 is applied, its true length is about 25-30 s. It needs 3-4 callback acts that **twist** what they call back. Examples: the julus over covered bells (pausing behind them rings the bells); the court where the courtier bows ("pehle aap") and you must not take his square; malai heaps on the rooftops where the flag shadow moves the light.
- **01 tour, 14.2 s vs 25-35:** short, but the builder's brief allowed 25 s "only if cheap", so I don't count it as blocking. Polish: one more Chowk beat would do it.

### B4. LKO-09 FIX death teaches the wrong move
- **What:** the FIX (in `lko09-hawa`, go on the red you see) dies of `lko-kabootar`, the same cause id as the room's NAIVE. Its death line is the room's: *"White flag: the flock came down... | Cross only on red, and early in the red. Read the face the birds can see."* In hawa the answer is to cross **while you see white**. So the line tells the player to repeat the move that just killed them. The only tell is the curled tip of the flag, a few pixels at phone size (frames `shots/qa/B.png`, bottom row: at 17.5 s the near face is white with a red edge; at 18.8 s Dad dies on a red he saw). Coming straight after LKO-08's WTF beat, this makes 09 read like a second WTF (bible D rule 3).
- **How reproduced:** FIX recorded and rendered; `causes.ts` has one entry for `lko-kabootar`.
- **What would satisfy me:** a separate cause id for hawa (for example `lko-hawa`: "The birds read the other face of the flag: you saw red, they saw white. | Go while YOU see white."), and a larger or animated two-face tell (the flag flips to show its far face now and then, or the tip curl is drawn at least 3-4 px).

### B5. LKO-03 door ending `lko-bakhiya` repeats B32 / `fake`
- **What:** the bright door is printed on cloth over a vat and washes away; the real door is elsewhere (a shadow on a muslin up on a ledge). That's "the visible door is fake, look for the real one". The bible marks it USED (B32: "a door → a cutout, a painting"); it's the old `fake` twist (`twists.ts:15`: cardboard cutout, the real door is behind you), and `paintwall`/`fakewin` are in MECHANICS.md's taken doors. Washing reuses the room's rule, but the player's experience at the door is the shipped one.
- **How reproduced:** read `s03.ts:206-260`; mistake "walking to the bright blue printed door" dies `lko-chhapa` (`shots/qa/C.png`, top right).
- **What would satisfy me:** a door ending whose betrayal is not "this door is fake", e.g. the door is real but its threshold is print over the vat (you must enter while standing on stitched work, timed against the whistle), or bakhiya's shadow shows where the door **will be** after the wash moves the cloth.

### B6. Replay to the failing trap over 8 s on the long stages (bible G7: replay <= 8 s)
LENGTH.md says "replay to the failing trap stays under 8 s". Measured on the route (gaps between hidden checkpoints, seconds), it does not:
```
05  6.3, 9.7, 0.1, 4.5, 12.6, 2.0          (dum stretch 12.6)
06  4.3, 8.6, 1.2, 0.1, 14.9, 4.0          (mehfil 14.9)
07  ..., 9.7, 9.7, 6.6, 18.1, ...          (saamne 18.1)
08  3.6, 13.1, 1.0, 2.1, 1.4               (court 13.1)
09  9.6, 4.3, 4.0, 2.4, 16.1, 2.6          (hawa 16.1)
10  ..., 9.7, 9.7, ..., 16.4, 13.1, ...    (hawa10 16.4, chausar10 13.1)
```
One scripted death shows it directly: LKO-07 "sheltering in the last alcove, the cracked one" dies **12.9 s** after the last checkpoint. Most stretches include waiting (alcoves, takhts, throws), and the player has to sit through that wait again on every retry.
- **What would satisfy me:** a calm hidden checkpoint inside each of those stretches (after the second alcove's group has passed, after takht 2-3 in the mehfil, mid-court, after the second hawa roof), cpsafe still green, every death in the tests at most 8 s after its last checkpoint.

## Polish (not blocking)
1. **LKO-04 FIX** dies of `lko-malai`, the same id as NAIVE. The trap is different (the lid flips the light), but the death line doesn't name the lid. Give it its own cause (`lko-dhakkan`: "He lifted his shiny lid: now the light comes from the other side.").
2. **LKO-04 door `lko-kulhad`** (bhatti behind you flips the light) is the room's lid flip a third time. Consider a different door betrayal once 04 gets its extra act.
3. **LKO-06 door `lko-sam`** (wait on the takht till she stamps) and **LKO-09 door `lko-chhatri`** (go early in the red) reapply their room's answer. Acceptable, but weak "betrays at the door".
4. **`lives: 'act'`** only on 07 and 10. CITY-MODULE.md asks for it on marathons only, so this is legal. With 05/06/08/09 growing past 60 s, add it there too.
5. **LKO-08:** Tara's guide line "Har darwaza ek jaisa hai" stays on screen for the whole stage (builder sheet, frames 2-15); it covers the court. Let it time out.
6. **LKO-08 court vs PNJ-06** (roulette colour-gated floor): it plays close. The count-ahead and the courtier's capture keep it apart; keep it that way when it's reused.
7. **LKO-09 gumbad, place-fit:** "Taj" is Agra. The art reads as a generic white kiosk in a garden pool, which fits Lucknow's Chota Imambara tank. Name and sign it that way (sign says BAGH / gumbad, fine); avoid "Taj" in docs and hint.
8. **Lines:** all plausible standard Lakhnavi Hindustani: Aadaab, Tashreef laaiye, Pehle aap, Zehmat na kijiye, Munh mein ghul jaayega, Har darwaza ek jaisa hai, Daayan-baayan ulat gaye, Aakhri mauka. Two to note: "Ek cup aur, janab?" (01 shout) reads more Bombay than Lucknow; "Ek chai aur, janab?" is more natural. And "Saat baar! Thala for a reason." references a real cricketer's meme; that's a game-wide line in 14 cities, so it's the owner's call, not LKO's. Lines repeat across intro, taunt, death and idle (builder notes it).
9. **01 curtain** says "Or wait for it to roll up" in its death line, but the FIX that dies was a 40-tick wait. Make the line say where to wait (left of the bolt's fall line).
10. **01 tour length** (14.2 s): see B3.

## Checklist items that hold
- **NAIVE/FIX:** all 10 stages have both, and each FIX dies to a different trap than NAIVE (04 and 09 share a cause id: polish 1 and B4).
- **Hidden item:** one per stage (items test green; `lko-malai`, `lko-chikan`, `lko-galouti`, `lko-ghungroo`, `lko-kulfi`, `lko-sheermal`).
- **Intro lines:** 9, one per stage 02-10. Every stage has a hint per act (`hintParts`).
- **Checkpoints are calm:** `cpsafe` (1.5 s standing at each) green; no trap within a jump that I found in the code.
- **HWIK (08):** one WTF beat (arch 1). The tell is fair: the hooks on the gallery are visible above arch 1 before you go in, and on death Dad is plainly a floor up on them (`shots/qa/B.png` top row). The FIX (walk every arch) dies to a different trap (the well), and A3 is one move (walk arch 1, jump arch 2). The court is knowable from lit squares and the courtier piece. The problem with 08 is length/shape (B3); 09's WTF risk is B4.
- **Troll quality where it works:** 01 bolts (hook visible, then gone), 02 pehle aap (the stone takes the first one through), 06 strips → tatkar, 07 strollers → awnings → lamplighter → julus → saamne, and 08 arch 1 all die to something you can laugh at and name on death, and the third try is one readable move.
- **Uniqueness, closest shipped idea per stage:** 01 crumbling/timed floors (troll kit; here a visible hook, and the curtain is new; no echo of CCU-04's stack-pulled-from-bottom: no height drop, no customer choice). 02 CHN-02 queue (order by politeness, not place-saving). 03 room: DMN-07 / BPL-03 floor-state (a wash removes print; distinct); door: B32 repeat (B5). 04 GNR-03 sunbeams / DMN-03 ice (light direction, not light or time; distinct). 05 crumbling floors / RPR-04 shaped ground (squash lowers you under a ceiling; distinct). 06 HYD-06 echo / GNR-07 dance rings (your sound draws a dancer; distinct). 07 BOM-03 shove / PNJ-08 freeze (your pace shapes the crowd; distinct). 08 `fakewin` / B28 portals (the arch's exit depends on how you enter; distinct). 09 chasers / flipControls (the flock obeys a flag; the inverted flag is a reading reversal, distinct); gumbad vs `tiny` (the world scales, not Dad; distinct). 10 own callbacks.
- **Place-fit:** Rumi Darwaza (01 sign and backdrop gate), Chowk (01-04), Aminabad (05), Hazratganj (01, 07), Bhool Bhulaiya / 489 darwaze (08), Gomti (01, 03 dhobi ghat), chikan, galouti, makhan malai, Kathak, kabootarbazi and pachisi are all real Lucknow.

## To re-test, I'll need
B1-B6 fixed, then the same runs: `npm test`, `LDD_N=80 npm run fair -- LKO`, route and act times, checkpoint gaps, and death frames for every new or changed act.

Not checked: real human play (bots and the timing model only); I rendered death frames for 01, 03, 04, 05, 06, 08 and 09, not for every MISTAKE in 07 and 10.
