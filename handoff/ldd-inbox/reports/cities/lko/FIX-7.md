# LKO fix round 7 (it_cc809701): QA FAIL-3, D1-D4

Branch `city/lko`, worktree `ldd-wt/lko`, tip **`69fe3fd`**, continuing from `4b2abf5`. Three commits:
- `da4c196`: D1-D4.
- `206b685`: polish.
- `69fe3fd`: daana's route and plays slow down before the roof edge, now that the finale reaches it at a run.

No push, no version bump. The only files touched are `src/game/cities/lko/`, `tests/cities/lko.ts` and `docs/cities/LKO.md`. Every file edit went through the file tools.

## Honest section: what is cut, what stays open

- **Cut:** `lko10-darbar` and `lko10-jawab` (D1). The finale is now **4 callbacks**, `tasveer`, `daana`, `seedha` and `thahra`, each with two plays of two causes.
- **`lko07-shaam` keeps one trap** (D4, by the conductor's ruling). Its stroller tail is gone, so 07 now has **5 acts: 4 two-play acts plus shaam with one play** (`batti`, `julus`, `photo`, `dukaan` have two plays each).
- **Open with a reason:**
  - The two lag-12 baits the tester already accepted stay as they were: `dukaan` m9 lands on the sill, and `tasveer` m0 lag 12 dies of the rush. tasveer's rush now has its own line, `lko-tasveer-jaldi`.
  - One 08 play still reads the old arch/well line: `wapas`'s "walk off the gallery end". It does not die in wapas. It walks on through the hall door into darwaza's well, and the line it gets there (`lko-kuan`: walked through, the floor ends at the well, jump the arch) is true of where it dies. I relabelled the play's description to say so rather than move geometry. The other walk-into-the-well plays (`utar`, `upar`, `toota`) die in their own act's well, where the `lko-kuan` line is the act's own lesson.

## D1: law 7

### `lko10-darbar`: **cut**
The gate ran before any build. Each candidate below collided with an existing row, so I cut the act.

| Recast tried (one sentence) | Colliding row |
|---|---|
| "Tonight the throw lights the squares behind you: lit is where you've been, and the dark squares ahead hold" | `lko09-hawa` (the signal means its opposite: read it reversed) |
| "A square stays lit only while the cowries lie; when the courtier picks them up, the lit squares go" | troll-kit timed floors / blinkers (`lko03-rang`'s cycle read) |
| "Two throws at once, yours and his: the squares lit for him are his, never yours" | `lko08-chausar` itself ("never the courtier's square") |
| "The courtier offers you his own square" | `lko02-gali` (refuse the offered way), which the ruling forbids |

### `lko10-jawab`: **cut** by default
Its home act `lko02-aadaab` is gone. A recast would have to break a rule that a surviving act teaches. The only greeting the city still teaches is 02's room bow, and a break of that is `lko02-takrar` (out-bow him). So I did not try a recast.

The finale keeps `tasveer` (breaks `photo`), `daana` (breaks 09's flag), `seedha` (breaks 06's guru) and `thahra` (breaks 08's darwaza).

## D2: law 9, one cause id and one line per place and per callback

Where the cause comes from now:
- **The court:** both wells pass `lko-goti-andhera`.
- **wapas:** its well is `lko-wapas`.
- **roshandan:** the dark is `lko-andhera`.
- **The hall doors:** `makeDarwaza` gives `lko-darwaza` (or `lko-thahra`) only when the jump is at the remembered or moved arch spot. Walking on to the well edge stays `lko-kuan`.
- **The guru acts:** `makeGuru` takes a strip cause and a stop cause.
- **The covers:** `covered()` now uses the dancer's own cause instead of `lko-tehzeeb`.
- **The photo groups:** `photoGroup` takes its own pause and rush causes.
- **dukaan:** its step awning is `lko-dukaan-ruka`.

**Changed or new cause ids, with their full line text:**

| Cause id | Who dies to it | Line (what happened / how to beat it) |
|---|---|---|
| `lko-goti-andhera` (new) | 08 `chausar` m0 (hopped on to a dark square) | "You landed on a dark square: only the squares the throw lights will hold you." / "Count the dark mouths of the cowries, and land only on a lit square." |
| `lko-andhera` (new) | 08 `roshandan` m9 (walked on in the dark) | "You walked on into the dark: no light came down there, so there was no floor under you." / "In the dark the floor is only where light comes down on it: hop from one down-lit patch to the next." |
| `lko-wapas` (new) | wapas's own well (the cause on the wapas well; the walk-off play dies further on, see the honest section) | "The gallery ended over the well, and you walked straight off it." / "This gallery has no way on: turn round and jump back through the arch you came by, and it takes you down a floor." |
| `lko-darwaza` (new) | 08 `darwaza` m14 (jumped at the arch seen before the door) | "The arch you saw before the door had moved: you jumped where it used to stand, and there was only the well." / "After the hall door, look again: the arch is nearer now. Jump that one." |
| `lko-thahra` (new) | 10 `thahra` m7 (jumped where 08's arch moved to) | "Tonight the maze stayed put: you jumped where the maze’s arch had moved to, and nothing lifted you." / "Tonight the arch you saw before the door is still the arch: run on and jump that one." |
| `lko-thahra-ruka` (new) | 10 `thahra` m6 (stopped past the door to look round) | "You stopped past the door to look round, as in the maze: the floor there is chikan covers, and a stop is a bow." / "Tonight nothing moved: don’t stop to look, run on." |
| `lko-seedha` (new) | 10 `seedha` m4 (pressed the other way after the stamp) | "Tonight nobody mirrors her: the stamp swapped nothing, and you turned back on to a strip." / "A stamp swaps nothing tonight: keep pressing the way you were going." |
| `lko-seedha-ruka` (new) | 10 `seedha` m5 (stopped after the stamp) | "You stopped after her stamp to check which way was which: standing still on her floor is a bow, and she spun to you." / "Nothing swaps tonight: keep moving, there is nothing to check." |
| `lko-guru` (new) | 06 `guru` m4 (pressed the old way) | "Her stamp had swapped your left and right: you pressed the old way, back on to a strip." / "After every stamp, press the other way at once." |
| `lko-guru-ruka` (new) | 06 `guru` m5 (stopped after the stamp) | "You stopped after the stamp to work out which way was which: standing still on her floor is a bow, and she spun to you." / "Every stamp swaps left and right: press the other way at once, without stopping." |
| `lko-tasveer` (new) | 10 `tasveer` m0 (waited right by the group) | "You waited right by the group, as on the Ganj: that spot is a chikan cover, and the wait was a bow on the bells." / "Tonight wait back on the plain board before the drain, and go on the flash." |
| `lko-tasveer-jaldi` (new) | 10 `tasveer` m1 (rushed the group) | "You went for the group before the flash: they saw you and shoved you back." / "Wait back on the plain board for the flash, then hop the drain and run the covers and the group in one go." |
| `lko-dukaan-ruka` (new) | 07 `dukaan` m9 (waited on the step) | "You waited on the step for him to finish, and the awning over the step came down on you." / "He won’t finish: go now, up on to the sill and over his head." |

`lko-aadaab` is resolved by D1: the act that used it is cut, and the line is removed.

**Removed cause lines,** unreferenced after the cuts: `lko-darban`, `lko-mehrab`, `lko-goti-pehle`, `lko-badal`, `lko-badal-peeche`, `lko-dum`, `lko-dum-teen`, `lko-tihai`, `lko-tihai-do`, `lko-chirag`, `lko-aadaab`, `lko-aadaab-zyada`.

## D3: `lko07-photo` m5, the NAIVE "pausing so they part"

The first posing group now stands **one tile nearer its nala** (`wall: 12` became `11`). The shove from the group therefore lands in the nala at any timing, not on the board behind it. The play itself:
1. It stops on the board in front of the group (x+8.8; the route waits there too).
2. It waits for a phase far from the flash (photo clock 20-110 of 420).
3. It pauses 20 ticks, then walks in.

| Play | lag 0 | lag 6 | lag 12 |
|---|---|---|---|
| m5 (pause so they part) | `lko-photo`@5369 | `lko-photo`@5419 | `lko-photo`@5470 |
| m6 (rush) | `lko-photo-jaldi`@5014 | `lko-photo-jaldi`@5061 | `lko-photo-jaldi`@5114 |
| m7 (test flash, second camera) | `lko-photo-test`@5432 | `lko-photo-test`@5490 | `lko-photo-test` |

The route still wins at lag 0/6/11/12 (sweep below).

## D4: `lko07-shaam`'s second trap

The gate ran before any build. The candidate taken from the awning tell itself was: "the shop boy at the crank is the tell, not the shiver: the wind shakes awnings too, so stop for the one with the boy." By the decision test that is `lko07-photo`'s own thought, "a false cue looks like the real one: go on the real flash, not the test flash", in the same stage.

No legal second trap exists, so **shaam keeps one trap** by the conductor's ruling:
- I removed the stroller tail and its nala, and the act is 46 wide again.
- Its one play is m4, "running the row without a stop": `lko-shamiyana`@619/631/643.
- 07's two-play count is 4 of 5 acts (above).

## Polish (done after D1-D4)

1. 08 m4's stale "in the vault, walking on through the well arch too" (a third play of `utar` under the cut `mehrab` name) is deleted.
2. Unused test helpers are deleted: `aadaabOk`, `BADAL`, `shaded`, `DUM`, `pace10`, `samDo`, `tihaiAt`, `afterSam`, `R_lko07_chauraha`, `lampPast`, `pre08`, `court08`, `DK`. Other dead code is gone too:
   - the twelve unreferenced cause lines;
   - `s06`'s `TIHAI`;
   - `chausar`'s courtier-bow path;
   - `s02`'s `gentleman` (used only by the cut jawab and aadaab).
3. The seventh-death line now reads "Ek chai aur, janab? | One more chai, sir?".
4. `roshandan`: each up-lit beam is now drawn with its two edges and centre as bright rays, spreading upwards from the hole.

## Regression table (tip 69fe3fd; each heavy run once, one at a time, in the foreground)

| Check | Result |
|---|---|
| `npm run typecheck` | clean |
| `npx vitest run` (scratch moved out) | **18 files passed, 13 skipped; 1817 passed, 20 skipped** (from 1823: the cut acts' plays went with them) |
| `npx vitest run tests/cpsafe.test.ts -t LKO` | **10 passed** |
| `LDD_N=80 npm run fair -- LKO` | every stage **6t 100% / 12t 100%**; every stretch 100% at 0-12t |
| `npm run build:single && node scripts/flows.mjs` | built; **no errors** |
| Lag-captured sweep (QA6: capture at lag 0/6/11/12, spawn-idle 0/37/120/251; idle, run and tap-jump) | 01-09 at `206b685`, and 10 again after the daana fix at `69fe3fd`: **0 deaths**. The counts are 560/672/784/336/784/1344/1456/1680/2464/1008 plays for 01-10, **11,088 plays** in all. Longest stretch is 20.9 s (05); every other stage is 9.4 s or under. Worst replay per tick from the lagged capture is **7.46 s** (04 m0 lag 6), and 07 is now 4.71 s |
| Walk-4.5 probe | no static death short of 4.5 tiles: 05 +4.8, 07 `nala` +4.9, 09 +4.7 or more, 10 clear. The only shorter deaths are `julus`'s moving procession (07 cp5/cp7 after 1.3-2.0 s), as before |
| lag 0/6/12 play log, every NAIVE/FIX/MISTAKE with cause@tick and x | `reports/cities/lko/fix7/playlog-lag0-6-12-all.txt` (all stages at `206b685`), plus `playlog-lag0-6-12-LKO-10-final.txt` (10 at `69fe3fd`). Every play dies at all three lags except `dukaan` m8/m9 lag 12 (the accepted reason). In each act the two plays differ in cause; the one identical pair is tasveer m0/m1 at lag 12 (the accepted reason) |

## Honest route times (s)

| 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
|---|---|---|---|---|---|---|---|---|---|
| 14.2 | 20.2 | 25.2 | 10.7 | 42.9 | 37.3 | **49.9** (was 50.9; shaam lost its tail) | 37.9 | 61.0 | **24.5** (was 38.6; darbar and jawab cut) |

Pars are route time x 1.3. The pars for 07 and 10 are now 65 and 32.

## Diff `4b2abf5..69fe3fd`

These ten files, 104 insertions and 248 deletions:
- `docs/cities/LKO.md`
- `src/game/cities/lko/causes.ts`
- `src/game/cities/lko/levels.ts`
- `src/game/cities/lko/s01.ts`
- `src/game/cities/lko/s02.ts`
- `src/game/cities/lko/s06.ts`
- `src/game/cities/lko/s07.ts`
- `src/game/cities/lko/s08.ts`
- `src/game/cities/lko/s10.ts`
- `tests/cities/lko.ts`

Not checked: route sheets were not re-shot this round. The art changed only in roshandan's rays and in the cut finale acts.
