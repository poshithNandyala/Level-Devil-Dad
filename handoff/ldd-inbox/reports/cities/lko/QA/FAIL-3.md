# LKO · Lucknow: QA verdict FAIL (round 3)

**Tester:** the independent QA chat; I wrote none of LKO.
**Subject:** `city/lko` at **4b2abf5**, the branch head, in my detached worktree `/local/home/saiposh/personal/ldd-wt/qa-lko`. Nothing is committed; my probes are untracked in `tests/qa/`.
**Ran:** 08:25-08:45 UTC.

**Pre-rulings (binding, as given):**
- Plain doors are accepted over a borrowed door, and the SVP-style "a plain door is no idea" is accepted.
- The honest route times are final: 01 14.2 s, 02 20.2, 03 25.2, 04 10.7, 05 42.9, 06 37.3, 07 50.9, 08 37.9, 09 61.0, 10 38.6. I reproduced every one.
- 18t is parked.
- The B1/B4/B5/B6 closures stand.

**Verdict: FAIL.**
- **What passes:** every regression (section 1), C1 (plain doors), C5, C6 and C7, and most of C8.
- **What fails:** the finale's surviving callbacks (D1), law 9 across the city (D2), one lag-6/12 collapse in `lko07-photo` (D3), and `shaam`'s new second trap, which re-asks 07's room (D4).

## 1. Regressions (my own runs at 4b2abf5)

| Check | Result |
| --- | --- |
| `npm run typecheck` | clean |
| `npx vitest run` (my `tests/qa/**` excluded) | **18 files passed, 13 skipped; 1823 passed, 20 skipped, 0 failed**. LKO is on no list in `tests/modules.test.ts` |
| `npx vitest run tests/cpsafe.test.ts -t LKO` | **10 passed**, each labelled "idle, run and tap-jump at lag 0/6/12" (strict: LKO is not in `ALLOWLISTED` or `CPSAFE3_PENDING`) |
| `LDD_N=80 npm run fair -- LKO` | every stage **6t 100% / 12t 100%**; every stretch at 0-12t 100% (18t: 76-100%, parked) |
| `npm run build:single && node scripts/flows.mjs` | built; **"no errors"** (with `CHROME_PATH` set to the cached headless shell 1228, a host issue) |
| Lag-captured sweep: `QA6=1 QA6_IDLE=0,37,120,251 npx vitest run tests/qa/qa-lko6.test.ts` (250 s) | **0 deaths in 11,424 plays**. Capture points 5/6/7/3/7/12/13/15/22/12 for 01-10. Longest stretch **20.9 s** (05). Worst replay per tick at lag 0/6/12: **7.46 s** (04 m0, lag 6), 6.85 s (07), 6.76 s (09), all others under 6.6 |
| Walk-4.5 probe (`QA45=1 ... qa-lko-walk45.test.ts`) | no static death short of 4.5 tiles: 05 nearest +4.8 (cp0 x28.7, cp3 x114.7), 07 +4.9, 09 +4.7 or more, 10 +4.9. Only the moving procession in `julus` is closer (07 cp5/cp7, caught after 1.3-2.0 s of walking; polish, as in round 2) |
| Diff `110d6d7..4b2abf5` | **13 files, all under `src/game/cities/lko/`, plus `tests/cities/lko.ts` and `docs/cities/LKO.md`**. No shared file, no `package.json` change, no version bump. Note (not a finding): unused helpers for the cut acts remain in `tests/cities/lko.ts`, unreferenced cause lines remain in `causes.ts`, and `s06.ts` still holds the tihai class (line 309 on) |
| Sheets `reports/cities/lko/shots/r6/` | I read 02, 04, 05, 06, 07 and 08 (the builder read 09 and 10). They show: plain EXIT doors at the end of 04/06/07/08; 05's six acts and the tandoor; 06's guru flip card; 07's awnings, lamplighter, procession, photo studio and window-shopper; 08's arches, hall door, grille and light-well. Nothing misdrawn |

## 2. C1-C8 from round 2, by my own plays

| # | Check | My result |
| --- | --- | --- |
| C1 | doors | **Closed.** The six doors are `plain(advice)` in `endings.ts:93` with `build() {}`: no zone, no tell, no death play, and no door mistake in the tests |
| C2-C4 | cuts | The thirteen acts are gone from `levels`: 52 acts became 39, and the act list matches `tests/cities/lko.ts`. The six surviving finale callbacks still fail law 7 and law 9 in places: **D1, D2** |
| C5 | second plays | **Closed.** At lag 0/6/12:<br>`batti`: `lko-seedhi`@1482/1515/1551 vs `lko-seedhi-utar`@1703/1736/1772.<br>`hawa`: `lko-hawa`@1836/1868/2054 vs `lko-hawa-ulta`@2776/2851/3072.<br>`gumbad`: `lko-gumbad`@1225/1150/1248 vs `lko-gumbad-uncha`@1238/1175/1286.<br>`shaam`: `lko-shamiyana`@619/631/643 vs `lko-ganj`@1201/1225/1249 (but see **D4**) |
| C6 | hawa | **Closed.** `HAWA = lay(7, [13, 12, 13, 12])` is 4 roofs; the last-roof twist (the flyer comes round in front) has its own death, `lko-hawa-ulta` |
| C7 | 05 checkpoints | **Closed** (walk-4.5 above) |
| C8 | lag 0/6/12 | Every NAIVE and FIX dies at all three lags (list below). Two lag-12 reasons, judged:<br>• **`lko07-dukaan` m9 (wins at lag 12): the reason holds.** The bait needs a landing on the one-tile pavement behind the shopper. A press 12 ticks late takes off about 0.9 tile further at walking speed and lands on the sill, which is the right play.<br>• **`lko10-tasveer` m2 (dies `lko-photo-jaldi`@2343 at lag 12, the same tick as m3): the reason holds.** The bait spot is closer to the group than a late hop's landing, so a lag-12 player who tries to wait by the group arrives in it and dies of the rush. Both are physics, not excuses.<br>• **Not covered by any reason: `lko07-photo`, D3** |

The NAIVE and FIX of every stage at lag 0/6/12 (cause@tick):
- **01:** than 658/686/730 · parda 942/1010/1012
- **02:** pehle 218/224/230 · dhakka 343/349/355
- **03:** chhapa 141/147/153 · jali 404/674/537
- **04:** malai 128/172/208 · dhakkan 326/350/416
- **05:** seekh 99/117/152 · tawa 245/257/281
- **06:** chakkar 187/193/199 · tatkar 383/426/805
- **07:** ganj 228/234/241 · shamiyana 627/645/663
- **08:** bhool 120/126/132 · kuan 307/313/319
- **09:** kabootar 147/154/174 · hawa 1836/1868/2054
- **10:** pehle 273/279/285 · tehzeeb 333/343/355

These match FIX-6.md's table.

## 3. BLOCKING findings

### D1. Two finale callbacks re-ask a Lucknow decision instead of breaking their own rule (law 7, decision test)
- **`lko10-darbar`**: "the courtier bows you on to the square between you ('pehle aap'); it is lit and empty, and it is the loose stone: wait on yours."
  - It breaks the court's rule ("lit squares hold") only by **borrowing 02's rule**.
  - A player who learned `lko02-gali` ("a gentleman offers you the way before the stone has gone: stand still and let him go first"; registry row `lko02-gali`) solves it by the same thought: refuse the offered way and wait.
  - Plays: m0 `lko-goti-pehle`@1646 (lag 0) / 1790 (lag 6) / 1968 (lag 12) is the offered square; m1 `lko-kuan`@752 / 790 / 950 is the court's own trap.
  - **Closest row:** `lko02-gali`. It does not play differently.
- **`lko10-jawab`**: "the greeting again, but he greets you on the covered bells: step back to the plain board to return it with one short bow."
  - Its home act `lko02-aadaab` was **cut** (C2), so the city never teaches the greeting it breaks.
  - What is left is 10's own room: "bow only on the plain board, walk the covers" (registry row `LKO-10/room`).
  - Plays: m4 `lko-tehzeeb`@2538 / 2677 / 2882 (bowing on the covers is the room's own cause); m5 `lko-aadaab`@2498 / 2617 / 2793 (a cut act's cause).
  - **Closest row:** `LKO-10/room`. It does not play differently.
- **The other four pass law 7:**
  - `tasveer`: ruled W2. It breaks `photo` with 10's own covers.
  - `daana`: grain beats the flag.
  - `seedha`: the stamp swaps nothing.
  - `thahra`: the maze stays put.
  - None of them borrows another stage's rule.
- **What would satisfy me:** darbar's break uses only 08's own court (for example, a throw that lights squares behind you), or it is cut; jawab is cut, or recast so that it breaks a rule a surviving act teaches.

### D2. Law 9: death lines that name the wrong thing, carry the home stage's line, or advise the move that killed
Cause lines are shared by cause id, so a play that dies to a trap in a new place gets the line written for the old place. The cases below are from my lag-0 recordings (`tests/qa/qa-lko-rec2.test.ts`, cause@tick, x); the same causes repeat at lag 6 and 12 (section 2).

| Play | What the play did | Cause@tick | The line the player reads | Problem |
| --- | --- | --- | --- | --- |
| 08 m15 `darwaza` | **jumped** at the arch seen before the door | `lko-kuan`@3444 x200.2 | "You **walked through**, so you stayed on your floor… / Where the floor ends past an arch, **go through it at a jump**." | The line is false about the play, and its advice is the move that killed |
| 10 m11 `thahra` | jumped where 08's arch had moved to | `lko-kuan`@4415 x196.2 | same `lko-kuan` line | Same as above. It is also the home stage's line, not the break ("tonight the maze stays put") |
| 08 m0, 10 m1 (court) | hopped square after square on to dark squares | `lko-kuan`@606, @752 | the arch/well line: "walked through… go through it at a jump" | Names arches on a pachisi court. The court's real lesson (only lit squares hold) is nowhere in it |
| 08 m10 `roshandan` | kept off the light and walked on | `lko-kuan`@4088 | arch line | No arch is involved |
| 08 m6 `wapas` | walked off the gallery's end | `lko-kuan`@3343 | "…go through it at a jump" | In this act jumping forward through the arch kills (m5 `lko-bhool`@2949); the answer is to turn round |
| 10 m5 `jawab` | walked past the greeting | `lko-aadaab`@2498 | "Return a greeting: **stop for a short bow**, then go on." | A cut act's line, and in jawab a short bow where he greets you is the death (m4 `lko-tehzeeb`). Advice that kills |
| 10 m8 `seedha` | pressed the other way after her stamp, as 06 taught | `lko-ghungroo`@3993 | "You stepped on a red strip… Never touch a strip: hop over it, from takht to takht." | 06's line (mehfil's takht advice). It never says the break: tonight a stamp swaps nothing |
| 10 m9 `seedha`, 06 m5 `guru` | **stopped** after a stamp | `lko-chakkar`@3983, @1904 | "You made the bells ring… Hop over the red ghungroo strips" | Dad stopped (a bow, per the act's hint); the line talks about strips |
| 10 m3 `tasveer` | rushed the group | `lko-photo-jaldi`@2035 | 07's line | The home stage's line in a callback (the brief: "no callback carries its home stage's line") |
| 07 m10 `dukaan` | **waited** on the step for him to finish | `lko-shamiyana`@5849 | "That awning was shivering on its rope… and you **ran under it**." | Dad waited; he did not run. The line belongs to `shaam` |

**What would satisfy me:**
- A cause id (or a line) per place, for the arch/well deaths in the court, roshandan, wapas, darwaza and thahra.
- Lines for seedha, tasveer and thahra that name their break.
- An own cause for the stop/bow deaths in guru and seedha, and for the wait death in dukaan.
- jawab's m5 line resolved with D1.

### D3. `lko07-photo`: the NAIVE dies of the rush at lag 6 and falls in a nala at lag 12
- **m6** ("pausing so they part, as the strollers taught"):
  - lag 0: `lko-photo`@5372 x223.
  - **lag 6: `lko-photo-jaldi`@5437 x209**, the cause of m7 ("rushing them": `lko-photo-jaldi`@5168 / 5407 / 5494).
  - **lag 12: `lko-nala`@5462 x223**, a plain fall into a drain whose line is "You walked into the open nala. / Hop the nalas." That is not the trap and not the decision.
- FIX-6 lists photo m6 as fixed, and no engine reason is given for it.
- **What would satisfy me:** m6 dies of `lko-photo` at lag 0, 6 and 12, or a written reason of the dukaan kind that I can check.

### D4. `lko07-shaam`'s new second trap is 07's room re-asked
- The second play was added for C5. It is m5 ("through the awnings as they shiver, then running on now they are behind you") and dies `lko-ganj`@1201 / 1225 / 1249 x74.
- The builder's own sentence: "past the awnings, the strollers want a pause"; FIX-6: "The second trap is 07's own room rule".
- A player who learned 07's room (pause and they part; registry row `LKO-07/room`) solves the second half with nothing new. That is the class `lko07-chauraha` was cut for in round 2 (the room plus a second idea).
- **What would satisfy me:** a second trap for `shaam` that is not 07's room, for example one that comes from the awning tell itself.

## 4. Decision sweep (whole city, after the cuts)
Plain doors are exempt. Round 2's sweep table stands for every part that survived unchanged. Each part below is checked against DECISIONS.md lists 1-2 (all 840 rows), v3/v3.1, the other open branches' rows in list 2, and Lucknow's own rows.

| Part | Decision | Closest row | Verdict |
| --- | --- | --- | --- |
| 01 tour | hop off each bolt before the hook grips; run under the unrolling bolt | troll-kit timed floors; CCU-04 (not echoed) | ok |
| 02 room / gali / takrar | the first through gets the stone; refuse an early offer; out-bow a man who bows back | CHN-02 | ok |
| 02 door `lko-kiwad` | wait out of the leaves' sweep | PAT-04 (not asked: nothing comes at you, no second) | ok |
| 03 room / kunda / adda / rang / door `lko-balti` | stitch holds through two washes; run the print; never wait on the next flower; cross the dyed half in one go; at the door go at once (the bucket) | DMN-07, BPL-03, PDY-04, blinkers | ok (as in round 2) |
| 04 room / chowk | the heap's own shadow holds; the lid moves the light; only cups in a shadow, the tips go first | AMR-04 (direction, not just shade) | ok |
| 05 room / tawa / lane / ulta / bhara / ghee / charkhi / door `lko-sheermal` | as in round 2 | RPR-04, TVM-03 (S20), F471 condition met | ok |
| 06 room / tatkar / guru / mehfil | strips draw her; hop her moving patch; each stamp swaps left and right; shelter on the takhts | RPR `rath` (S14), B23 | ok |
| 07 room / batti / julus / photo / dukaan | pause and they part; under the ladder only to pass; pace behind; go on the real flash; pass on his window side | PNJ-08, I3 | ok |
| `lko07-shaam` | stop short of the shivering awning; then pause for the strollers | S11 + `LKO-07/room` | **D4** |
| 08 room / chausar / upar / toota / utar / wapas / darwaza / sargoshi / roshandan | as in round 2 (mehrab and minar cut) | B28, B30, PNJ-06, CHN-05 (S19) | ok |
| 09 room / gumbad / jhande / seeti / girah | as in round 2 | `tiny`, W9 | ok |
| `lko09-hawa` | the birds read the far face; when he comes round in front, his face is theirs | 09 room, `jhande` | ok (watching which side the flyer is on is a new read) |
| 10 room | bow only on the plain board | 02 + 06 (the finale's own room) | ok |
| `lko10-darbar` | refuse the offered lit square | `lko02-gali` | **D1** |
| `lko10-tasveer` | wait back on the plain board, go on the flash | W2 (ruled) | ok |
| `lko10-jawab` | return the greeting from the plain board | `LKO-10/room` | **D1** |
| `lko10-daana` / `seedha` / `thahra` | grain beats the flag / the stamp swaps nothing / the maze stays put | breaks of 09, 06 guru, 08 darwaza | ok |
| doors 04, 06, 07, 08, 09, 10 | plain | | exempt |

PAT-04's "step aside for an oncoming load; a second follows" is asked nowhere.

**Padding:**
- No act repeats one read past one labelled momentum beat.
- Counts: tawa 6, adda 5, ghee 4, charkhi 4, mehfil 5, julus 4 (the last nala early), hawa 4 (the last-roof twist), jhande 5 (the switch at the middle), gumbad 3 plus the reflection.
- The probe table is complete for 05-10: every act has two plays of two causes at lag 0, listed in FIX-6.md and reproduced by me, apart from the D3 lag cases.
- One stale entry: 08 m4 is still described "in the vault, walking on through the well arch too" (cut `mehrab` text). It dies at x149.8, `lko-kuan`@2821, the same place and cause as `utar`'s m3@2830. It is a third play in `utar` under a cut act's name (polish).

## 5. Polish (not blocking)
1. Unused helpers in `tests/cities/lko.ts`, unreferenced cause lines in `causes.ts` (`lko-aadaab` is still used by jawab: D2), the tihai class in `s06.ts`.
2. 08 m4's stale description (section 4).
3. `julus`: from cp5/cp7 a plain walk catches the procession in 1.3-2.0 s.
4. `roshandan`: the up-lit beams the hint describes are not drawn as beams (as in round 2).
5. Lines as in round 2: the game-wide "Thala for a reason"; "Ek chai aur" would be more Lucknow than "Ek cup aur".

## To re-test I will need
- D1-D4 fixed on a new tip of `city/lko`, with a FIX-7.md giving, for each finding, the part changed and its new one-sentence decision (or "cut").
- For each changed death line, the cause id and the line text.
- I will then rerun:
  - typecheck and the suite;
  - cpsafe -t LKO;
  - fair N=80;
  - flows;
  - the lag-captured sweep;
  - walk-4.5;
  - my lag-0/6/12 play log;
  - a law-9 pass over every play's cause line.

Not checked: real human play (bots and the timing model only). I did not render fresh death frames this round; the builder's sheets were read instead.
