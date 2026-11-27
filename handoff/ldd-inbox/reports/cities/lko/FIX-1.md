# LKO · Lucknow: fix round 1 (answers QA/FAIL.md)

- **Branch:** `city/lko`, tip **0b7357375f6455237d76ad2b62b2fd3daea530fe**, worktree `/local/home/saiposh/personal/ldd-wt/lko`. origin/develop ea12cdf merged in (merge 542d549, no rebase). Not pushed, no version bump.
- **Edits only in** `src/game/cities/lko/`, `tests/cities/lko.ts`, `docs/cities/LKO.md` and LKO's row in `docs/CITIES.md`. `docs/MECHANICS.md` has no LKO rows, so nothing to change there.
- Clear time = the scripted route's time (a bot). Death offsets are seconds after the last hidden checkpoint passed, from a probe copied from QA's `qa-lko-cp.test.ts` (kept out of the repo).

## Result

| Stage | Before (QA) | Now | Acts now |
| --- | --- | --- | --- |
| 01 | 14.2 s | 14.2 s | (tour) |
| 02 | 12.0 s | 26.7 s | gali, **takrar**, **dakiya** |
| 03 | 11.4 s | 25.2 s | kunda, **adda**, **rang** |
| 04 | 11.5 s | 25.5 s | chowk, **badal** |
| 05 | 35.2 s | 37.6 s | tawa (trimmed), lane, **ulta**, **bhara**, dum (trimmed) |
| 06 | 33.1 s | 33.1 s | tatkar, mehfil |
| 07 | 69.6 s | 69.6 s | shaam, batti, julus, saamne, chauraha |
| 08 | 21.2 s | 23.7 s | chausar (split in two halves), **minar**, mehrab, **utar** |
| 09 | 39.2 s | 46.6 s | gumbad (trimmed), hawa, **jhande** |
| 10 | 92.3 s | 52.9 s | dhulai, **darbar**, **julus over bells**, galiyara (verbatim copies cut) |

## B1. 02, 03, 04 to 25 s, each with a betrayal new to LKO

| Act | Betrayal | NAIVE-style death | FIX-style death |
| --- | --- | --- | --- |
| `lko02-takrar` | stand-off: he bows back; whoever stops bowing first goes first (he gives up after about 6 s) | bowing once and going, as learned: `lko-takrar` @1367 | walking into him: `lko-pehle` @1334 |
| `lko02-dakiya` | men in a hurry don't bow back: two cycles (postman, then milkman) ride up behind you; step up on the chabutra; the chowkidar opens the gate for the postman | standing in the lane to bow: `lko-dakiya` @2627 | stepping down after the first cycle: `lko-dakiya-doosra` @2723; running on to the shut gate: `lko-dakiya-aage` @2706 |
| `lko03-adda` | the karigar's hoop carries you over the vat; the next white flower (the room's safe place) is where the hoop clamps down | waiting on the next flower: `lko-adda` @1500 | walking off the hoop: `lko-kunda` @1358 |
| `lko03-rang` | the rangrez dips the far half of the muslin into his neel: stitch holds, but not under the dye | waiting on a stitched flower in his half: `lko-rang` @2899 | hopping on while it is under: `lko-rang-kood` @2553 |
| `lko04-badal` | a cloud's moving shadow is the only shade for single cups | hopping on before the shadow comes: `lko-badal` @1370 | waiting on a cup, as on the heaps: `lko-badal-peeche` @1803 |

02 has two new acts and 03 has two because one act did not reach 25 s. 03's dyer cycle was lengthened from 2.75 s to 3.1 s to pass 25 s (24.9 → 25.2 s); that is a slower rhythm, not more tiles.

## B2. Padding cut

- `lko05-tawa`: 16 heaps → 6 (`TAWA2 = 'FTFTTF'`).
- `lko05-dum`: 12 → 5 heaps; the last is piled three high (count the little kebabs on top). The hop after one squash now dies `lko-dum`, the hop after two on the triple `lko-dum-teen`.
- `lko09-gumbad`: 6 → 3 domes; the third is the dome's reflection in the tank (sign AKS), which sinks as you step back, so its paving line is closer. Jumping from the usual distance dies `lko-aks`.
- Finale: all seven `again()` copies removed. In their place, two callbacks that break the rule they taught (law 7):
  - `lko10-darbar`: the court again, but when the courtier stands two squares ahead he bows you on to the square between ("pehle aap"). That square is lit and does not hold. Taking it dies `lko-goti-pehle`.
  - `lko10-julus`: the procession again, but between the nalas the floor is bells under chikan covers. Waiting behind them on a cover (the 07 answer) is a bow: it rings the bells and the dancer comes. Do the waiting on the plain boards.
- **Honest stop:** the finale is 52.9 s against its 90 s floor. To reach it I would need two or three more callbacks that each twist their source act. I spent the round on the blocking stages 02-05, 08 and 09 first.

## B3. 05, 08, 09

- **05** (+2 acts; still 37.6 of 60 s):
  - `lko05-ulta`: the cook presses the slab flat from HIS end with his kafgir, so the squash comes at you. Standing on the slab end to squash it (the lane answer) dies `lko-kafgir`. Walking up the slab dies `lko-seekh`.
  - `lko05-bhara`: a rack the cook keeps low (you can stand under it on a full heap but not hop) and hoists now and then. You keep your heap full by stepping between a pair of heaps. Waiting for a squash dies `lko-tawa`; hopping while the rack is down dies `lko-seekh`. Twist on the last: he only half-hoists it, so this time you must squash first. Hopping off a full heap there dies `lko-seekh`, 7.2 s after the checkpoint.
- **08** (+2 maze acts; 23.7 of 60 s). Arch 1 in the room stays the one WTF beat.
  - `lko08-minar`: three arches stacked a floor apart. Jump, jump, walk. Walking through the second dies `lko-kuan`; jumping through all three puts you on the hook roof, `lko-bhool`.
  - `lko08-utar`: a hanging arch (cusp drawn downwards) takes you a floor DOWN if you come through it falling, so jump from three tiles back. Up close, rising, it takes you up into the hooks (`lko-bhool`). Walking through, the gallery ends over the well (`lko-kuan`). A plain arch below takes you back up to the door's gallery.
  - The court is split in two halves of 5 squares with a calm chabutra between (that is also B6's mid-court checkpoint). The second half's throws are offset, so it is not a copy of the first half.
- **09** (+1 act; 46.6 of 60 s):
  - `lko09-jhande`: two flyers, one behind you and one ahead, and one flock. The flock obeys the flag nearer to you and circles over that flyer. The switch is the middle of the middle roof. The two flags are in opposite phase (1.8 s each).
  - Watching the flag behind you all the way dies `lko-jhanda-aage`. Watching the flag ahead from the start dies `lko-jhanda-peeche`.
- **Honest stop for 05, 08 and 09:** I built the acts FAIL.md asked for. The floors need one or two more acts each, with betrayals LKO hasn't used yet.

## B4. hawa

Hawa has its own cause, `lko-hawa`: "The birds read the other face of the flag: you saw red, they saw white. | Here, go while YOU see white: the curl at the flag's tip shows their colour." The FIX now dies `lko-hawa` @1829; the room's NAIVE dies `lko-kabootar` @213. The tip curl is drawn 8 px. Every 1.5 s the flag swings round in the wind for 0.33 s and shows its far face whole.

## B5. 03 door

`lko-bakhiya` (fake door) is replaced by **`lko-balti`**. The door is real, but its threshold is cloth over the vat (`ppspps`). The print washes 0.1 s after you first touch the cloth. At 1.25 s the dhobi's bucket comes down on anyone on the cloth, and the cloth resets at 2.75 s. Waiting on a white flower for the second wash (the room's answer) dies `lko-balti` @3116.

## B6. Checkpoints

New hidden checkpoints (`cps`, act-relative columns):
- badal 9.5 and 19.5
- tatkar 21
- mehfil 14.6, 22.6 and 30.6 (on takhts 2-4)
- julus 18 and 42
- saamne 26.2 (second alcove) and 34 (after both groups have passed)
- court: on the chabutra
- hawa 20.5, 32.5 and 44.5
- jhande 20 and 31.5
- darbar 11.9, 17.9 and 23.9
- finale julus 22.5 and 44.5 (plain boards)
- takrar 16

Results:
- `cpsafe` and `checkpoints` are green.
- Every scripted death is at most **7.3 s** after its checkpoint (worst: 05 half-hoist 7.2 s, 04 shrinking shadows 7.1 s). The cracked-alcove death went from 12.9 s to 6.3 s.

Route gaps between checkpoints (s):
```
02 4.5,3.5,1.4,0.1,8.3,1.0,5.2,2.6
03 6.0,1.4,1.5,1.7,0.1,8.0,4.8,1.8
04 4.8,2.5,2.7,0.1,6.4,4.4,2.9,1.6
05 6.3,4.2,0.1,4.5,6.4,7.8,6.3,2.0
06 4.3,7.8,0.8,1.2,0.1,8.3,1.6,1.6,3.3,4.0
07 3.6,5.3,4.3,3.4,3.5,5.2,4.5,4.1,5.6,6.6,1.2,14.8,2.1,3.5,0.2,1.7
08 3.6,4.7,6.9,2.3,1.0,2.2,1.6,1.5
09 9.6,1.9,3.0,2.4,4.1,4.0,4.0,4.2,5.4,1.8,3.7,2.6
10 4.6,4.4,2.1,0.1,3.8,0.8,7.9,4.3,6.8,7.8,4.7,0.1,3.4,1.9
```
Gaps still over 8 s:
- 07's 14.8 s is the wait inside the second alcove while both groups pass. No checkpoint column falls inside that wait, and the 34 checkpoint comes right after it.
- 09's 9.6 s is the room's roof crossing.
- 02's 8.3 s is takrar's stand-off wait.
- 06's 8.3 s is takhts 1-2.

## Polish

1. 04 FIX: new cause `lko-dhakkan` (the lid flip); the FIX now dies `lko-dhakkan` @326.
2. 04 door `lko-kulhad`: **not changed**. I gave the time to B1/B3. It still repeats the room's light flip.
3. 06 and 09 doors: not changed (optional).
4. `lives: 'act'` is now on 05, 06, 08 and 09 (it was already on 07 and 10).
5. 08: Tara's "Har darwaza ek jaisa hai" is now a timed line (2.4 s). It no longer stays up over the court; the sheet shows it gone by 5.7 s.
6. 08 court vs PNJ-06: still count-ahead plus the courtier's capture, now in two halves. No colour gate.
7. "Taj": gone from the code comment and `docs/cities/LKO.md`. The domes are a Chota Imambara-style garden tank, sign BAGH / gumbad. `docs/ALLOCATION.md` still names the reserve "Taj". That file is outside my edit scope.
8. "Ek cup aur, janab?": **kept**. It is on the bible's VERIFIED list and "Ek chai aur" is not. I didn't want to swap a verified line for an unverified one; the owner or the bible can change it. "Thala" is left for the owner. I also dropped two new lines I had added this round (the cook's and Tara's), because they were not on the VERIFIED list.
9. 01 curtain line: now "...Or wait back by the last hook, left of where the bolt falls, till it rolls up."
10. 01 tour: not lengthened (optional).

Pars were reset to about route time × 1.3: 28 / 26 / 33 / 49 / 43 / 90 / 31 / 61 / 69.

## Mechanical checks

**(a) Repeats.** No act repeats a hazard with the same answer more than 3-5 times without a twist:
- tawa: 6 heaps, mixed thin and thick.
- dum: 4 piled heaps, the last a triple.
- bhara: 4 hoists, the last only half.
- gumbad: 3 domes, the third the reflection.
- julus: 4 nalas, the last off the rhythm.
- saamne: 3 groups, the cracked last alcove.
- mehfil: 5 takhts. This one has no twist on the last; it is unchanged from the length pass, which QA accepted.
- court: 2 × 5 squares.
- minar, utar, rang, dakiya, takrar, adda, badal, jhande: each has one rule and 2-5 beats.

**(b) The FIX-style death's cause and tick differ from the NAIVE-style's.** One table per stage. The stage-level NAIVE and FIX deaths are the room's.

**LKO-01**

| Act | NAIVE-style | FIX-style | Differ? |
| --- | --- | --- | --- |
| room (tour) | `lko-than` @658 | `lko-parda` @942 | yes |

**LKO-02**

| Act | NAIVE-style | FIX-style | Differ? |
| --- | --- | --- | --- |
| room | `lko-pehle` @218 | `lko-dhakka` @343 | yes |
| gali | `lko-pehle` @722 | (none) | only one scripted death |
| takrar | `lko-takrar` @1367 | `lko-pehle` @1334 | yes |
| dakiya | `lko-dakiya` @2627 | `lko-dakiya-doosra` @2723, `lko-dakiya-aage` @2706 | yes |

**LKO-03**

| Act | NAIVE-style | FIX-style | Differ? |
| --- | --- | --- | --- |
| room | `lko-chhapa` @141 | `lko-jali` @404 | yes |
| kunda | `lko-jali` @1035 | (none) | only one scripted death |
| adda | `lko-adda` @1500 | `lko-kunda` @1358 | yes |
| rang | `lko-rang` @2899 | `lko-rang-kood` @2553 | yes |
| door (balti) | `lko-balti` @3116 | `lko-chhapa` @2920 | yes |

**LKO-04**

| Act | NAIVE-style | FIX-style | Differ? |
| --- | --- | --- | --- |
| room | `lko-malai` @128 | `lko-dhakkan` @326 | yes |
| chowk | `lko-malai` @1430 | (none) | only one scripted death |
| badal | `lko-badal` @1370 | `lko-badal-peeche` @1803 | yes |
| door (kulhad) | `lko-malai` @3006 | (none) | only one scripted death |

**LKO-05**

| Act | NAIVE-style | FIX-style | Differ? |
| --- | --- | --- | --- |
| room | `lko-seekh` @99 | `lko-tawa` @245 | yes |
| tawa, lane | (none) | (none) | **no act-level deaths** (length-pass acts) |
| ulta | `lko-kafgir` @2156 | `lko-seekh` @1893 | yes |
| bhara | `lko-tawa` @2932 | `lko-seekh` @2615 (twist: `lko-seekh` @3440) | yes |
| dum | `lko-dum` @3703 | `lko-dum-teen` @4110 (straight on: `lko-seekh` @3582) | yes |

**LKO-06**

| Act | NAIVE-style | FIX-style | Differ? |
| --- | --- | --- | --- |
| room | `lko-chakkar` @187 | `lko-tatkar` @383 | yes |
| tatkar | (none) | (none) | **no act-level deaths** |
| mehfil | `lko-mehfil` @2199 | `lko-mehfil` @2426 | **cause same**, tick differs |

**LKO-07**

| Act | NAIVE-style | FIX-style | Differ? |
| --- | --- | --- | --- |
| room | `lko-ganj` @228 | `lko-shamiyana` @701 | yes |
| batti | `lko-seedhi` @1258 | (none) | only one scripted death |
| julus | `lko-julus` @2801 | `lko-julus` @2814 | **cause same** |
| saamne | `lko-saamne` @5498 | `lko-jhanda` @5386 (twist: `lko-saamne-taak` @7063) | yes |
| shaam, chauraha | (none) | (none) | **no act-level deaths** |
| door (darban) | `lko-darban` @8348 | (none) | only one scripted death |

**LKO-08**

| Act | NAIVE-style | FIX-style | Differ? |
| --- | --- | --- | --- |
| room | `lko-bhool` @120 | `lko-kuan` @307 | yes |
| chausar | `lko-kuan` @606 | `lko-goti` @1491 | yes |
| minar | `lko-bhool` @1960 | `lko-kuan` @1994 | yes |
| mehrab | `lko-mehrab` @2152 | (none) | only one scripted death |
| utar | `lko-bhool` @2607 | `lko-kuan` @2710 | yes |
| door (489) | `lko-bhool` @2783 | (none) | only one scripted death |

**LKO-09**

| Act | NAIVE-style | FIX-style | Differ? |
| --- | --- | --- | --- |
| room | `lko-kabootar` @213 | (none) | only one scripted death |
| gumbad | `lko-gumbad` @1223 | `lko-aks` @1542 | yes |
| hawa | `lko-kabootar` (room NAIVE) @213 | `lko-hawa` @1829 | yes |
| jhande | `lko-jhanda-aage` @4904 | `lko-jhanda-peeche` @4263 | yes |

**LKO-10**

| Act | NAIVE-style | FIX-style | Differ? |
| --- | --- | --- | --- |
| room | `lko-pehle` @273 | `lko-tehzeeb` @333 | yes |
| dhulai | (none) | (none) | **no act-level deaths** |
| darbar | `lko-goti-pehle` @2218 | (none) | only one scripted death |
| julus over bells | `lko-tehzeeb` @3952 | (none) | only one scripted death |
| galiyara | `lko-tehzeeb` @6077 | (none) | only one scripted death |
| door | `lko-tehzeeb` @6351 | (none) | only one scripted death |

Every act built or changed in this round has two scripted deaths whose causes and ticks both differ. Check (b) still fails in these places:
- **Same cause:** 06 mehfil and 07 julus. I tried splitting them (`lko-ghungroo`; `lko-julus-kood` for landing on their heels), but the scripted plays died by the other path, so I reverted both rather than ship a cause that names the wrong death.
- **No act-level deaths:** 05 tawa and lane, 06 tatkar, 07 shaam and chauraha, 10 dhulai.
- **Only one scripted death:** 02 gali, 03 kunda, 04 chowk, 07 batti, 08 mehrab, 10 darbar, julus and galiyara, and several doors.

## Proof

- `npm run typecheck`: clean.
- `npm test`: **18 files passed (12 skipped); 1622 tests passed, 12 skipped, 0 failed**, with LKO on no allow-list. This run was on the final code, with the scratch tests moved out to `/tmp/lko-scratch-tests/`.
- `npm run build:single && node scripts/flows.mjs`: "no errors". It needs `CHROME_PATH` set to the installed chrome-headless-shell 1228.
- `LDD_N=80 npm run fair -- LKO`, on the code at a0fff43. After that run, the only change was drawing-only: the 02 cycles are now hidden until the bell rings.
```
LKO-01: 6t 100%  12t 100%  18t 84%    every stretch 100%
LKO-02: 6t 100%  12t 100%  18t 100%   every stretch 100%
LKO-03: 6t 100%  12t 100%  18t 76%    every stretch 100%
LKO-04: 6t 100%  12t 100%  18t 76%    every stretch 100%
LKO-05: 6t 100%  12t 100%  18t 76%    every stretch 100%
LKO-06: 6t 100%  12t 100%  18t 93%    every stretch 100%
LKO-07: 6t 100%  12t 100%  18t 100%   every stretch 100%
LKO-08: 6t 100%  12t 100%  18t 93%    every stretch 100%
LKO-09: 6t 100%  12t 100%  18t 76%    every stretch 100%
LKO-10: 6t 100%  12t 100%  18t 76%    every stretch 100%
```
(full output with every stretch: `/tmp/lko-fair80.log` on this host)
- **Shot sheets** for 02-10 are new, in `shots/LKO-02-sheet.png` .. `LKO-10-sheet.png` (15 route frames each).
  - Read closely: 02 (the cycles appear only when the bell rings; re-shot after I saw them parked in the room), 03 (the dyer's indigo vat and the dipped flowers), 05 (ulta's slab and cook; bhara's rack, posts and pairs), 08 (minaret, hanging arch; Tara's line gone after 5.7 s).
  - Made but not read frame by frame: 04, 06, 07, 09, 10.
- **Death frames for new acts: not rendered.** The cause and tick for each are in the table above.

## For the re-test

`npm test` · `LDD_N=80 npm run fair -- LKO` · route times above. For act times, the act starts are each act's first checkpoint in the gap lists (act x0: 02 gali 32, takrar 62, dakiya 86; 03 kunda 32, adda 72, rang 108; 04 chowk 32, badal 68; 05 tawa 32, lane 56, ulta 90, bhara 118, dum 136; 06 tatkar 32, mehfil 66; 07 shaam 32, batti 78, julus 136, saamne 194, chauraha 246; 08 chausar 32, minar 76, mehrab 102, utar 132; 09 gumbad 32, hawa 62, jhande 120; 10 dhulai 32, darbar 68, julus 108, galiyara 166).

Not checked: real human play; death frames for the new acts; whether the stitched flowers over the dye vat (03 rang) and the hanging arch's down-cusp (08 utar) read at phone size.
