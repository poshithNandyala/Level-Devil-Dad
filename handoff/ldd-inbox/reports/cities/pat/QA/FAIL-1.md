# PAT · Patna: independent QA, round 1: FAIL

Tester: independent QA worker (wrote none of PAT). Judged on `city/pat` at **fe179fa** (branch head at the time of testing), in my own detached worktree `/local/home/saiposh/personal/ldd-wt/qa-pat`. Nothing committed or pushed. The builder's worktree was not touched.
My only additions are scratch probes in `tests/qa/` (untracked, in my worktree only): `qa-probe.test.ts` (route time, plus where and when every NAIVE, FIX and MISTAKE dies), `qa-split.test.ts` (time per part and the tick of every checkpoint change on the route) and `qa-rec.test.ts` (input recordings of every death play, used for the death-moment shots).

## What I ran (my own numbers)

| Check | Result |
| --- | --- |
| `npm test` (full suite, once) | **18 files passed, 1593 tests passed**, 12 env-gated skipped, exit 0. PAT is on no allow-list (`EXEMPT` in `tests/modules.test.ts` does not list PAT). Guard, allocation, levels (route, NAIVE, FIX, MISTAKES), checkpoints, cpsafe, items and jump audit are all green |
| `npm run build:single && node scripts/flows.mjs` | builds; flows: `no errors` |
| `LDD_N=80 npm run fair -- PAT` | passes the bar (output below) |
| Route clear times | from `play(def, SOLUTIONS[id])`, winTick / 120 (table below) |
| Death-moment frames | `QA/qa-03.png` (PAT-03 FIX), `QA/qa-06.png` (PAT-06 NAIVE and the Kumhrar mistake), `QA/qa-08.png` (PAT-08 NAIVE and FIX), rendered with `scripts/solshot.mjs` from my recordings |

### Fairness output (pasted)

```
PAT-01: 6t 100%  12t 100%  18t 80%      stretches at 0-12t: s0-s5 100%  door 100%
PAT-02: 6t 100%  12t 100%  18t 100%     s0-s2 100%  door 100%
PAT-03: 6t 100%  12t 100%  18t 76%      s0 s1 100%  door 100%
PAT-04: 6t 100%  12t 100%  18t 100%     s0-s2 100%  door 100%
PAT-05: 6t 100%  12t 100%  18t 100%     s0-s4 100%  door 100%
PAT-06: 6t 100%  12t 100%  18t 100%     s0-s10 100%  door 100%
PAT-07: 6t 100%  12t 100%  18t 100%     s0-s12 100%  door 100%
PAT-08: 6t 100%  12t 100%  18t 76%      s0-s2 100%  door 100%
PAT-09: 6t 100%  12t 99%   18t 100%     died: pat-charkhi @235 x1   s0-s7 100%  door 99%
PAT-10: 6t 100%  12t 100%  18t 76%      s0-s8 100%  door 100%
```
Every stage is at least 99% at average lag (bar 90%) and every stretch is at least 99% (bar 95%). **Fairness holds.**

### Route time and where it comes from

| Stage | Floor | Route | Holds? | Time per part (room, acts in order; the last part includes the door) |
| --- | --- | --- | --- | --- |
| 01 | 25-35 s | **15.4 s** | **no** | tour only |
| 02 | 25-45 s | **16.3 s** | **no** | room 7.0, chokha 9.3 |
| 03 | 25-45 s | **15.2 s** | **no** | room 5.8, batch 9.3 |
| 04 | 25-45 s | **22.8 s** | **no** | room 9.6, anaaj 13.2 |
| 05 | >= 60 s | 64.0 s | yes, but by padding (B2) | room 7.3, ghat 4.8, sangam 17.2, **bori 34.6** |
| 06 | >= 60 s | 64.1 s | yes, but by padding (B2) | room 3.6, sau 5.0, nau 6.6, **gaadi 31.6, kumhrar 17.4** |
| 07 | >= 120 s | 130.8 s | yes | room 8.1, sadak 16.3, pul 23.8, haat 29.2, mandi 29.2, adda 24.3 |
| 08 | short (warps) | 9.9 s | by design | room 2.4, chowk 2.1, vihara 5.4 |
| 09 | >= 60 s | 72.0 s | yes | room 6.8, jhoola 16.4, ghoda 15.0, wapsi 33.7 |
| 10 | >= 90 s | 91.5 s | yes, but by padding (B2) | room 3.6, pipa 5.3, sau 7.1, **bori 38.7**, sidhi 9.8, **gaadi 22.4**, anaaj 4.8 |

## BLOCKING findings

### B1. PAT-01 to PAT-04 miss their length floors, and no reason is given
- **What:** the route times are 15.4, 16.3, 15.2 and 22.8 s. TROLL-BIBLE section E sets 25-35 s for 01 and 25-45 s for 02-04. BUILD.md and LENGTH.md only say "unchanged" and give no reason.
- **How I reproduced it:** `tests/qa/qa-probe.test.ts` (`QA_PROBE=1 npx vitest run tests/qa/qa-probe.test.ts --silent=false`) prints winTick / 120 for each scripted route.
- **What would satisfy me:** each of the four routes inside its band, made of a new beat or ladder step (02-04 should end with the first A2 ladder, as section E says). Or, if the conductor waives these floors, a written reason in BUILD.md that the conductor accepts.

### B2. Padding: 05, 06 and 10 reach their floors with identical repeats
The new acts repeat one hazard with one answer many times. None of those repeats teaches a new rule or breaks the old one (laws 1 and 6). Without them, the stages would be 29.4 s (05), 15.1 s (06) and 30.4 s (10).
- **`pat05-bori`, 34.6 s:** six sack drops on sections 5, 8, 11, 14, 17 and 20 (`s05.ts` `actBori`: `[5, 8, 11, 14, 17, 20].map((k, i) => ({ k, at: 1.2 + i * 3.7, dur: 4.3 }))`). Each one is the same "wait at the section before, then go".
- **`pat06-gaadi`, 31.6 s:** 18 seams lifted in a fixed ripple, 2.2 s each, 1.6 s apart (`s06.ts` `actGaadi`). It is 18 times the same "wait for this plate". Note: the code comment says "repeating every 9 s", but the code repeats every 29 s.
- **`pat06-kumhrar`, 17.4 s:** 12 stumps with 11 identical 2-tile gaps, and the route jumps every one (see B4).
- **`pat10-bori`, 38.7 s:** nine identical windows over 30 sections. **`pat10-gaadi`, 22.4 s:** every second plate of 16 lifts in turn. The sack count changes the period, but each part is again one answer repeated.
- **How I reproduced it:** read the act builders, and ran `tests/qa/qa-split.test.ts` (`QA_SPLIT=1`) for the per-part times above.
- **What would satisfy me:** each of these acts cut to at most one or two windows, plus a momentum beat. Fill the time with new betrayals. For a rule-count act, the count should change or the rule should go stale inside the act, so the third window does not play like the first.

### B3. The "FIX" in four added acts never reaches its trap: it dies exactly like the NAIVE
LENGTH.md says every added act has a NAIVE and a different FIX. In four acts, the FIX play dies on **the same tick, at the same spot** as "run on", before it gets to the move it claims to test:

| Act | NAIVE (run on) | FIX (as claimed) | Death of both |
| --- | --- | --- | --- |
| `pat05-bori` | run on | wait on the section the sack swings over | tick 3761, col 133.5, `pat-ganga` |
| `pat06-gaadi` | run on | wait on the first plate | tick 1925, col 141, `pat-jod` |
| `pat07-pul` | stand in the middle | balance for kerb riders only | tick 3766, col 123.6, `pat-dhakka` |
| `pat10-bori` | run on | wait on the third section | tick 2065, col 151, `pat-pipa` |

The tests pass only because the act MISTAKES carry no expected `cause` and only check `dead`.
- **How I reproduced it:** `tests/qa/qa-rec.test.ts` (`QA_REC=1`) logs the death tick and cause of every NAIVE, FIX and MISTAKE. The pairs above are identical. `haat`, `mandi`, `pat10-gaadi` and `pat09-wapsi` do die differently.
- **What would satisfy me:** in each of these acts, a FIX that survives the NAIVE's trap and then dies to a different trap where the fix lands. Record it with its expected `cause` and a death tick different from the NAIVE's. If the act has no such trap, it is padding (B2): cut it.

### B4. `pat06-kumhrar`: the slick-stone trap never fires, the death reads wrong, and the idea is a shipped one
- **The polish never kills.** "Walk without jumping" dies at col 261.3, and "stop at each edge and jump from standing" dies at col 261.0 (tick 5780). Both deaths are in the **first** gap (act x0 = 252, first gap at col 260). That gap is next to a rough stump, before the first polished one (stump index 2, col 268). The standing-jump bot stops 34 px before a 32 px gap and taps, so it falls short on rough stone. That is a bot artefact, not the slippery surface. No play in the tests dies because of polish. What is left is 11 plain gaps.
- **The death line is wrong for the place.** The act's pit is `cause: 'pat-jod'`, so a fall in Kumhrar's pillar hall shows "That seam had no plate: it is a drop to the river." (`causes.ts`). The player cannot say what killed them (law 9).
- **It repeats a shipped idea.** A slippery floor you slide across is already DMN-03 ("melting slippery ice", MECHANICS.md line 64).
- **What would satisfy me:** cut the act. Or rebuild it so a polished stump really is the cause of death, with its own cause line, and so it plays unlike DMN-03's ice. The builder already calls it the weakest troll; my verdict is that it is not a troll at all.

### B5. PAT-06's real trap (and PAT-10's FIX) repeats TVM-01
- **What:** the PAT-06 room's NAIVE dies in a seam with no plate, shown as a dark gap at col 20 (`QA/qa-06.png`, top). That is a visible pit. The stage's real troll is the FIX: "a plate holds a walker and flips up if you land on it from a jump; walk the plates" (`pat-taala`). That is the shipped TVM-01 experience: "the monsoon-soaked road holds a walker and breaks under a hop (walk it)" (CITIES.md TVM-01, MECHANICS.md line 108, `noLanding`). PAT-10's FIX is the same `pat-taala`.
- **Allocation:** slot 06's betrayal is the missing-plate **count**. Its chain is "A3 the missing plate is the one after the truck". The built stage does not use the truck in the room, and the count is not needed: the gap can be seen.
- **What would satisfy me:** an A2 for 06 that is not "breaks under a hop". The count should be the thing that betrays: for example, the gap is hidden or covered until the truck passes, so the count is the only way to know. PAT-10 should then call back to that new A2.

### B6. PAT-09: 31 s between two checkpoints
- **What:** on the route the checkpoint changes at 38.3 s and next at 69.4 s. That covers the whole `pat09-wapsi` crowd lane, which has `cps: []`. `docs/CITY-MODULE.md` requires "a calm checkpoint at least every 25 s of play", and TROLL-BIBLE asks for a replay to the failing trap of at most 8 s. A death at the end of the lane, where the horse turns back, means walking the whole lane again.
- **How I reproduced it:** `qa-split.test.ts` logs `w.cp` changes along the route.
- **What would satisfy me:** a calm checkpoint inside or right after the first halt of the horse, or a shorter lane, so that no stretch is longer than 25 s. If the moving lane has no calm spot, split the lane.

## Polish (not blocking)

- **PAT-03 tell:** the "roll" that shows the next banner's width is a cream bar on thin poles, the same colour as the backdrop buildings (`s03.ts` L96, `#F2D7A6`). It reads after a death, but it looks like decoration (law 10). Draw it in the colour of the banner it becomes. NAIVE and FIX both die as `pat-jam` (a narrowing banner). This is acceptable as a stale-rule ladder (law 6), but give the FIX its own cause line.
- **PAT-04:** NAIVE and FIX are both `pat-bojh`. The second porter steps out of the landing door, where the fix lands, so this is a valid ladder. A cause line of its own would make the A2 read better.
- **PAT-08 HWIK:** the tell exists. Brick numerals are drawn over every hatch, the tagline says "Nobody told you to count", and on death you come up in a numbered cell with a well and can see the one cell without a well (`QA/qa-08.png`). The FIX dying to the same rule is acceptable for a HWIK stage. **08 and 09 are not both WTF**: 09 is knowable and its rule is in the hint. 08 passes.
- **7th death:** only PAT-07 has `lives: 'act'`. The 64-92 s stages 05, 06, 09 and 10 send the 7th death back to the stage start, which is 90 s of replay on PAT-10. Consider `lives: 'act'` for them.
- **PAT-07** is 130.8 s. `CITY-MODULE.md` says a marathon is "at most 120 s once known", while the brief's floor is >= 120 s. The conductor should pick one.
- **Long stretches over 8 s of replay** (TROLL-BIBLE D rule 08) remain elsewhere: PAT-05 at 29.4 to 43.4 s, PAT-07 at 77.4 to 98.2 s, PAT-10 at 15.9 to 37.3 s and 37.3 to 54.6 s. They are under the 25 s module rule.
- **Lines:** `Rook! | Stop!` reads as the English word "rook". Hindi is "Ruko!" and Bhojpuri "Ruka!"; use one of them. `Ulta-pulta ho gaya!` is Hindi; Bhojpuri would be "ho gail". This is fine if the mix is intended. `Setu one, Dad zero!` has no "Local | English" form. BUILD.md says Tara tells the truth only once (`Rook!` in 04), but `Rook!` is also PAT-06's intro line (`intro[4]`), and it is true there too.
- **Uniqueness, closest stages:** 01 ~ BOM-03 shove-out (here you sidestep up and leave before the tempo; different). 02 ~ pop-up spikes kit and RNC-02 (the room is telegraphed pop-up strikes; the new part is the poker following the litti and the rake). 03 ~ B8, PDY-03 (different). 04 ~ oncoming rollers (different: you cannot hop a sack). 05 ~ DMN-06 and floaters (different). 07 ~ TVM-02 bus bells (different: weight from riders and trucks). 08 ~ `invisible` and `fakewin` (different). 09 ~ JAI-06 horse and the `jhoola` ending (ride a swing, hop off at the far bank): the occupied-gondola twist is new, but the ride-and-hop is close. 10 calls back only PAT's own ideas. The 06 and Kumhrar repeats are in B4 and B5.
- **Endings:** `pat-nawka` (the float drifts away with the door and comes back) is close to the moving-door family (B31 `shy`). The others look new against the advice lines I grepped.
- **Place-fit:** good. The Gandhi Setu girder, Golghar dome with its spiral stairs, ghats, coaching hoardings, litti and chokha, Nalanda brick cells, the Sonepur fair and the hidden-item foods all fit Patna. Checkpoints are calm (cpsafe green), and every stage has one hidden item (items test green). The intro lines are present.

## Not checked
Touch feel on a real phone. Audio. I rendered death frames for 03, 06 and 08 only. For the other stages I read the builder's ten shot sheets.
