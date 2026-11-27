# LKO · Lucknow: QA verdict FAIL (round 4)

**Tester:** the independent QA chat; I wrote none of LKO.
**Subject:** `city/lko` at **69fe3fd** (the branch head), in my detached worktree `/local/home/saiposh/personal/ldd-wt/qa-lko`. Nothing is committed; my probes are untracked under `tests/qa/`.
**Ran:** 09:28-09:45 UTC.

**Pre-rulings (binding, as given):**
- `darbar` and `jawab` are cut.
- `shaam` keeps one trap.
- Honest times are final: 01 14.2, 02 20.2, 03 25.2, 04 10.7, 05 42.9, 06 37.3, 07 49.9, 08 37.9, 09 61.0, 10 24.5. I reproduced every one.
- The `dukaan` m9 and `tasveer` m0 lag-12 reasons stand.
- Plain doors stand. 18t is parked.

**Verdict: FAIL, on law 9 only.** Everything else holds: the regressions, D1, D3, D4, law 7 on the four callbacks, the checkpoints and the polish. The scripted plays and my new six-play generic probe still find cause lines that are false for the play that died. Several of them advise the move that kills in the same act (D2-bis below). There is also one structural point on `wapas`.

## 1. What passes (my own runs)

| Check | Result |
| --- | --- |
| `npm run typecheck` | clean |
| `npx vitest run` (`tests/qa/**` excluded) | **18 files passed, 13 skipped; 1817 passed, 20 skipped, 0 failed**. LKO is on no exemption list |
| `npx vitest run tests/cpsafe.test.ts -t LKO` | **10 passed** (strict, lag 0/6/12) |
| `LDD_N=80 npm run fair -- LKO` | every stage **6t 100% / 12t 100%**, every stretch 100% at 0-12t |
| `npm run build:single && node scripts/flows.mjs` | built; **"no errors"** (with `CHROME_PATH` set to the cached headless shell 1228, a host issue) |
| Lag-captured sweep `QA6=1 QA6_IDLE=0,37,120,251` (196 s) | **0 deaths in 11,088 plays**. Capture points 5/6/7/3/7/12/13/15/22/9. Longest stretch **20.9 s** (05). Worst replay per tick at lag 0/6/12: **7.46 s** (04 m0, lag 6) |
| Walk-4.5, walk AND tap-walk, all ten stages | no static death short of 4.5 tiles. Nearest: 05 +4.8 (cp0 x28.7, cp3 x114.7), 07 `nala` +4.9, 09 +4.7, 10 clear. `julus`'s moving procession is caught after 1.3-2.0 s, as before (polish) |
| Route times | 14.2 / 20.2 / 25.2 / 10.7 / 42.9 / 37.3 / 49.9 / 37.9 / 61.0 / 24.5 s, as pre-ruled |
| Diff `4b2abf5..69fe3fd` | 10 files, all under `src/game/cities/lko/`, plus `tests/cities/lko.ts` and `docs/cities/LKO.md`; no `package.json`, no version bump |
| Polish from round 3 | 08 m4's stale mehrab label is gone. The tihai class is gone from `s06.ts`. The twelve unreferenced causes and the dead helpers are gone. The 01 shout now reads "Ek chai aur, janab? \| One more chai, sir?" (FIX-7 calls it the seventh-death line; it is the 01 shout at `s01.ts:188`, which is the line I asked for) |
| Roshandan beams | fresh frame `shots/qa2/LKO-08__route-09.png` (34.1 s): each hole now has two edge rays and a centre ray spreading **upwards** from the black slot, next to the down-lit trapezoids. They read at phone size. **Closed** |

## 2. D1-D4 from round 3

| # | Builder's claim | My reproduction | Status |
| --- | --- | --- | --- |
| D1 | `darbar` and `jawab` cut | Not in `levels`. 10 = room + `tasveer`, `daana`, `seedha`, `thahra`; route 24.5 s | **closed** (pre-ruled) |
| D2 | one cause id and line per place, plus break lines | The new ids are in place and correct on their own plays: `lko-goti-andhera`, `lko-andhera`, `lko-darwaza`, `lko-thahra`, `lko-thahra-ruka`, `lko-seedha-ruka`, `lko-guru`, `lko-guru-ruka`, `lko-tasveer`, `lko-tasveer-jaldi`, `lko-dukaan-ruka`. The shared `lko-kuan`, `lko-ganj` and `lko-seedha` lines still fire in places they are false for | **not closed**: section 3 |
| D3 | `photo` m5 dies `lko-photo` at all lags | m5 `lko-photo`@5369/5419/5470 x200; m6 `lko-photo-jaldi`@5014/5061/5114 x200; m7 `lko-photo-test`@5432/5485/5545 x214 | **closed** |
| D4 | `shaam` keeps one trap, the stroller tail is removed | m4 `lko-shamiyana`@619/631/643 x45 at lag 0/6/12, and the stage FIX `lko-shamiyana`@627/645/663. Nothing else in 07 is weaker:<br>• `batti` `lko-seedhi`@1353 / `lko-seedhi-utar`@1574<br>• `julus` `lko-julus`@2896 / `lko-julus-nala`@4347<br>• `photo` as D3<br>• `dukaan` `lko-dukaan`@5738 / `lko-dukaan-ruka`@5729<br>All die at every lag except the accepted `dukaan` lag-12 bait | **closed** (pre-ruled) |

**Law 7, the four callbacks and the room**, from my lag log at 0/6/12. Each pair is two causes at two ticks at every lag; tasveer at lag 12 is the accepted exception.

| Part | Play A | Play B |
| --- | --- | --- |
| room | NAIVE `lko-pehle`@273/279/285 | FIX `lko-tehzeeb`@333/343/355 |
| tasveer | m0 `lko-tasveer`@856/907, then `-jaldi`@812 at lag 12 (accepted) | m1 `lko-tasveer-jaldi`@757/782/812 |
| daana | m2 `lko-daana`@1281/1356/1390 | m3 `lko-daana-udaan`@1313/1393/1458 |
| seedha | m4 `lko-seedha`@2298/2342/2377 x86 | m5 `lko-seedha-ruka`@2288/2334/2368 x97 |
| thahra | m6 `lko-thahra-ruka`@2628/2661/2694 | m7 `lko-thahra`@2722/2755/2788 |

Each callback breaks its own stage's rule: `photo`'s pause-by-the-group, the flag, the guru's swap, and the moved arch. None borrows another stage's rule; the covers are 10's own room. Changed parts in the decision sweep: shaam with one trap (unchanged decision, S11), the 10 finale reduced (nothing new). Round 3's sweep stands for the rest. **Law 7 holds.**

**Padding:** the probe table is complete; every act in 05-10 has two plays except `shaam` (ruled) and `wapas` (below). No act repeats one read past one labelled beat.

## 3. BLOCKING findings

### E1. Law 9: lines that are false for the play, or advise the act's own fatal move
Sources:
- **Scripted plays:** `tests/qa/qa-lko-rec2.test.ts` (lag 0) and my lag log (`/tmp/qa-lko2/deaths4.txt`).
- **Unscripted plays:** `tests/qa/qa-lko-generic.test.ts`, the Dispur tester's method. From where the lag-0 route first stands at each part's start, it runs six plays (walk, short hop, long jump, wait 4 s then walk, hop every 0.3 s, back off) at lag 0/6/12. That is 846 plays (`/tmp/qa-lko2/generic.txt`); each row below holds at all three lags.

| # | Play (act) | Cause@tick, x (lag 0) | Line shown | Wrong because |
| --- | --- | --- | --- | --- |
| a | **scripted 08 m7** "in the vault, walking on along the floor" (`upar`) | `lko-kuan`@1971 x87.2 | "…Where the floor ends past an arch, **go through it at a jump**." | In `upar` that is m6, "jumping at the first arch from the floor": `lko-bhool`@1979 x87.8. The advice is the act's other fatal move |
| b | **scripted 08 m11** "the broken arch: walking on through both" (`toota`) | `lko-kuan`@2358 x114.1 | same `lko-kuan` line | The arch past which the floor ends is the crownless one. Jumping it is m10, `lko-toota`@2359 x114.3. Fatal advice |
| c | **scripted 08 m3** "walking through the hanging arch" (`utar`) | `lko-kuan`@2830 x149.8 | same | Jumping it up close is m2, `lko-bhool`@2727 x144.3. The answer is to jump from three tiles back (falling); the line says only "at a jump" |
| d | generic: walk, short hop, long jump, wait-then-walk into `upar`, `toota`, `utar` | `lko-kuan`@2001 x91.9 / @2362 x114.4 / @2825 x150.1 | same | as a-c |
| e | generic: **walk** into `dukaan` (lag 0/6/12) | `lko-ganj`@5627 x231.6 (act+3.6) | "You came rushing, so the **strollers** closed ranks… / **Pause a moment** before you reach them" | No strollers here. Dad walked into `dukaan`'s nala, which takes the `nala()` default cause `lko-ganj` (`s07.ts:544`, `nala(w, x + 2, x + 3)`). The advice "pause a moment" is the act's other death, `lko-dukaan-ruka`@5713 x228.9 (wait 4 s) |
| f | generic: **walk / short hop / long jump / wait-then-walk** into `seedha` (lag 0/6/12) | `lko-seedha`@2157 x91.9 (+64 ticks) | "Tonight nobody mirrors her: the stamp swapped nothing, and **you turned back** on to a strip. / … **keep pressing the way you were going**." | Dad never turned: he walked straight on to a strip ahead, holding right the whole time. The line is false, and its advice is exactly what this play did. `makeGuru`'s strip cause covers every strip, not only the one behind you |
| g | generic: walk / hops / wait-then-walk into `rang` | `lko-kunda`@2254 x114.3 (act+6.3) | "Off the **hoop**'s taut muslin and into the rinse vat. / Stand inside the hoop…" | `rang` has no hoop (that is `adda`). Dad fell in the dyer's vat walking on to the near flowers' edge |
| h | generic: short hop / long jump into `ghee` | `lko-tawa`@3334 x137.6 (act+5.6) | "**Flat galouti** is thin: the tawa burned straight through it" | `ghee`'s heaps are set and never go flat. Dad landed on the bare tawa |
| i | generic: hop every 0.3 s through `girah` | `lko-girah`@6134 x208.4 | "**You waited** for the tumbling birds to clear, and the red ran out" | He hopped on without waiting |
| j | generic: back off from `dukaan` | `lko-photo-test`@5887 x214.3 | "That was only his **test flash**…" | He backed into the second group; there was no flash |
| k | generic: back off from `photo` | `lko-julus-nala`@4995 x182.4 | "The fourth nala comes two steps early, **off the rhythm**…" | Backing into the procession's last nala; no rhythm was kept |
| l | generic: walk / hops into `chowk` (04) | `lko-malai`@640 x36.4 | "…Stand in each **heap's own long shadow**" | Chowk's single cups have no shady side of their own (its own hint says so); only the kulhad stack's shadow saves you |

Rows a-c are scripted plays. Rows e and f advise the act's other fatal move at every lag. g-l are false descriptions; j and k come from back-offs, the least natural of the six plays.

**What would satisfy me:**
- An own cause and line for the well in `upar`, `toota` and `utar`, each saying what the act asks (come down from above / jump the whole arch before the broken one / jump from three tiles back).
- `dukaan`'s nala with its own cause.
- `seedha`'s strip cause split into "turned back" and "walked on to a strip ahead".
- `rang`'s vat, `ghee`'s bare tawa and `girah`'s hop-in with their own lines; `chowk` with its own line.
- Then a rerun of `qa-lko-generic` at lag 0/6/12 with no line that misnames the play.

### E2. `wapas` has one play of its own
- Its scripted m5, now labelled "walking off its end and on through the next hall to its well", dies `lko-kuan`@3343 x200.2. That is in `darwaza`'s well (darwaza starts at x180), 42 tiles past wapas's gallery, and `lko-kuan` is true there.
- But walking off the wapas gallery does not kill in wapas. The generic walk and wait-then-walk plays from wapas also reach x200.
- `lko-wapas` ("The gallery ended over the well…") is reached only by backing off out of `darwaza` (x172.6).
- So wapas's one death is m4 (`lko-bhool`@2949 x171.3, jumping on through its arch). Its "walk off the end" bait is not a trap in this act.
- **What would satisfy me:** a second wapas death in wapas, the end of its gallery over its own well (`lko-wapas`), or a conductor ruling that, like `shaam`, wapas keeps one trap.

## 4. Polish (not blocking)
1. `julus`: from cp5/cp7 a plain walk catches the procession in 1.3-2.0 s.
2. FIX-7 calls "Ek chai aur" the seventh-death line; it is the 01 shout. The seventh-death line is still the game-wide "Thala for a reason".
3. The `nala()` helper defaults to `lko-ganj` (`s07.ts:84`). Any future nala that forgets its cause gets the strollers' line (E1 e).

## To re-test I will need
- E1 and E2 fixed on a new tip, with a FIX-8.md listing each new cause id and its line.
- I then rerun:
  - `qa-lko-generic` (846 plays, lag 0/6/12);
  - the scripted play log at lag 0/6/12;
  - the suite and cpsafe;
  - fair N=80;
  - the lag-captured sweep and walk-4.5;
  - flows.

Not checked: real human play (bots and the timing model only). Fresh frames this round were the roshandan beams only.
