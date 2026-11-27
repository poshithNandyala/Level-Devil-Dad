# PAT · Patna: independent QA, round 4: FAIL (one small blocking finding)

Tested `city/pat` at **1e29a84** (develop 6172e21 merged in) in my detached worktree `/local/home/saiposh/personal/ldd-wt/qa-pat`. Nothing was committed. Earlier rounds are kept as `QA/FAIL-1.md`, `FAIL-2.md` and `FAIL-3.md`. Probes are my untracked `tests/qa/` scratch files (`qa-probe`, `qa-split`), as before.

## 1. Stage 05 at 52.9 s

- **Route:** 52.9 s. Room 7.3, ghat 4.8, sangam 17.2, bori plus door 23.6. Checkpoints on the route: 7.3, 12.1, 29.4, 35.2, 42.1 and 44.9 s; the longest stretch is 17.3 s.
- **Shape:**
  - The room, ghat and sangam teach one rule: the section under the cart sinks, so jump its section and never wait on one it is rolling to. They teach it at three deck lengths and cart speeds, so it is a ladder, not one window copied.
  - `bori` then turns the rule. A plain sack drop comes first, then a sack that slides along its rope to the section before.
  - NAIVE dies to `pat-ganga` @1.3 s and FIX to `pat-pipa` @6.8 s (the stage). In `bori`, NAIVE dies to `pat-ganga` @31.1 s and FIX to `pat-bori` @36.3 s.
  - Identical repeated windows: **0**. That is a long stage's shape.
- **Clean cut:** there is no `kuli`, `lay-by`, `LAY-BY`, `khokhla`, `ghada`, `taala` or `kumhrar` in `src/game/cities/pat` or `tests/cities/pat.ts`. The causes, lines and checkpoints for them are gone. Two stale docs lines remain (polish, below).
- **Would a player feel it short?** No. A first-time player dies to the cart, the sinking section and the sliding sack, so a real clear is well over 60 s. Only the bot's perfect run is 52.9.
- **Verdict:** I accept 52.9 s as the stage's honest length.

## 2. Regressions

| Check | Result |
| --- | --- |
| `npm test` (full, once) | **18 files, 1603 passed, 0 failed** (15 skipped: 11 env-gated tools and my probes). PAT is on no allow-list |
| `npm run build:single && node scripts/flows.mjs` | `BLR-04` / **`no errors`** |
| `LDD_N=80 npm run fair -- PAT` | 100% at 12t on every stage except PAT-09 at 96%. Every stretch 100%, except PAT-09's door at 96% (bar 95%). **Holds** |
| B1 (02/03/04) | 25.9, 26.6 and 37.8 s, unchanged. **Holds** |
| B2 / B3 | every act's NAIVE and FIX still differ in cause and tick (`qa-probe`), and no window is repeated. **Holds** |
| B4 / B5 | no Kumhrar act and no `pat-taala`. The tarp-by-sack-count is unchanged on 06 and 10. **Holds** |
| B6 | the longest stretch is 23.1 s on 09 and 11.5 s on 10. **Holds** |
| Round 2-3 polish | the 03 roll is in the banner's colour, `Ruko!`, the rope and red landing bar, the `pat-bori` line, the `pat-bhaar` count line on 10's FIX (`pat-bhaar` @5.1 s), the `lorry()` on 06 and 10, and `lives: 'act'` on 05, 06, 07, 09 and 10. **Hold** |
| Route times | 01 15.4 (ruling), 06 61.1, 07 130.8 (ruling), 08 9.9, 09 73.6, 10 99.7 |

## 3. Decision sweep: each act's decision in one sentence

| Stage / part | The decision the player must make |
| --- | --- |
| 01 bus stop | climb on to the kerb board out of the crowd's surge, then get off before the tempo pulls out |
| **01 hoarding** | **let the hoarding that drops in front of you land, then hop it as a step** |
| 02 room, chokha, bhatti | stand between the glowing cracks and go once each has struck; the poker follows the litti; each of two litti has its own strike |
| 02 door (musal) | cross each mortar just after its pestle lifts |
| 03 room, batch, patti | read the roll above a hoarding to know its next width and from which end it is pulled |
| 03 door (ghanti) | cross under a pendulum bell while it is out at the far end |
| 04 room, sidhi | do not climb until every porter coming down has passed (two, then three) |
| 04 anaaj | ride the rising grain and step off at the ledge before the roof |
| 04 door (bhitar) | stay back while the inward door swings |
| 05 room, ghat, sangam | never be on, or wait on, the section the cart is on or rolling to |
| 05 bori | keep off the section where the sack's rope ends, not the one it hangs over |
| 05 door (nawka) | board the drifting float when it comes back in |
| 06 room, sau, nau | the sacks on the truck say which numbered plates are tarps |
| 06 ginti | re-read the count after the porter has unloaded or loaded the truck |
| 06 gaadi | cross a seam only while its plate is in and still, not while it shakes |
| 06 door (toll) | let the barrier come down and lift before you go |
| 07 tempo acts | stand opposite the heavier side (riders and trucks) before every arch and hump |
| 07 adda | cross the lane while the third tempo is out of it |
| 07 door (hauled basket) | step off the basket at the top at once |
| 08 HWIK | take the hatch whose brick count names the cell without a well |
| 09 crowd, wapsi | walk in the moving gap right behind the horse, backwards when he turns |
| 09 wheel | ride only an empty gondola |
| 09 door (charkhi) | go just after a turnstile arm has swept |
| 10 finale | callbacks of PAT's own 03, 04, 05, 06 and 07 decisions, with the sack count as the twist; the pads (`pat-ginti-pad`) use the count again |

**No two Patna acts ask the same decision**, except the finale's callbacks, which the slot asks for. Close pairs that I judged different:
- 04 porters ("wait until all have passed", before you climb) against 01 ("get up out of the surge, then leave before the tempo"). The second halves differ.
- 06's count against 08's bricks. 06 works by multiples and is read before the run. 08 matches a number to a cell and is a HWIK learned on death. They share the city's counting theme, which is fine.
- The three periodic door sweepers (musal, ghanti, charkhi). The tells and the timing rules differ.

**Against shipped decisions, one repeat:**

### R4-1. PAT-01's hoarding is the shipped falling-block-that-lands decision
- **What:** `s01.ts` `hoarding()`: when Dad passes column 100, a hoarding falls into the road, lands as a solid step, and you hop it (`pat-hoarding`: "It falls when you get close. Wait for it to land, then hop it."). That is the troll kit's `ceilingDrop` with `land: true`: it falls when Dad passes, then lands and becomes solid (`src/game/levels/trolls.ts` L71, listed in MECHANICS.md L100 as taken). It has also shipped as a decision:
  - TVM-01's rocket stages: "the first comes down on the last step ... hop them once they're down" (CITIES.md TVM-01).
  - CHN's hanging stone: "drops when you stand under it: step out, let it land, and climb it over the wall" (`src/game/cities/chn/levels.ts` L218).
  - AMR-07's falling ceiling.
- I missed it in rounds 1-3. This sweep found it.
- **How I reproduced it:** read `s01.ts` L122-160 against `ceilingDrop` and the TVM-01 and CHN advice lines. MISTAKE "run on at the hoarding" dies to `pat-hoarding` @14.1 s.
- **What would satisfy me:** cut the hoarding beat. PAT-01 keeps two betrayals without it, the crowd surge (NAIVE `pat-bheed`) and the tempo pull-out (FIX `pat-tempo`). That is the 2 that TROLL-BIBLE section E asks for stage 01, and the tour's length is already ruled on. A different, non-shipped second bite would also do. I need no other change.

## Polish (not blocking)

- `docs/cities/PAT.md` L45 says "05 runs about 45 s"; it is 52.9 s.
- `docs/MECHANICS.md` L168 still lists `pat06-kumhrar` among the acts, but it was cut.
- For the conductor, not PAT: LKO's `lko07-saamne` and `lko02-dakiya` ("step up aside, let it pass under you") also lie close to PAT-01's kerb board ("step up, let the crowd go by underneath"). PAT-01's half is the allocated slot, and its A2 (leave before the tempo) is different, so I do not block PAT on it. LKO's QA should weigh it.

## Not checked
Touch on a phone, and audio. I made no new frames this round, because no art changed apart from the deleted act.
