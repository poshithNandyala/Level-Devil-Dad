# PAT · Patna: independent QA, round 2: FAIL (one blocking finding)

Tested `city/pat` at **6cbabe4** (develop ea12cdf already merged in) in my detached worktree `/local/home/saiposh/personal/ldd-wt/qa-pat`. Nothing was committed. Round 1 is kept as `QA/FAIL-1.md`.
Conductor rulings applied: PAT-01 stays at 15.4 s and PAT-07 stays at 130.8 s. Neither is a finding.
My probes are the same scratch files as in round 1, untracked in `tests/qa/`: `qa-probe` (route time, plus cause and tick of every NAIVE, FIX and MISTAKE), `qa-split` (time per part and the tick of every `w.cp` change), `qa-rec` (input recordings), plus `scripts/solshot.mjs` frames at phone viewport (844x390 CSS px).

## Regression (my own runs)

| Check | Result |
| --- | --- |
| `npm test` (full, once) | **18 files passed, 1605 passed, 0 failed** (14 skipped: 11 env-gated tools and my 3 env-gated probes). PAT is on no allow-list (`EXEMPT` has no PAT row) |
| `npm run build:single && node scripts/flows.mjs` | `BLR-04` / **`no errors`** |
| `LDD_N=80 npm run fair -- PAT` | every stage 100% at 12t except PAT-09 at 96%. Every stretch 100%, except PAT-09's door at 96% (bar 95%). Same as the builder's numbers. **Holds** |
| 03 tell colour | the roll is drawn in `BANNERS[(i + 1) % ...]`, the colour of the banner it becomes (`s03.ts` L97). **Fixed** |
| `Ruko!` | in `lines.ts` (intro and idle). **Fixed** |
| `lives: 'act'` | on 05, 06, 07, 09 and 10 (`levels.ts`). **Done** |

## Route times (mine)

| Stage | Route | Floor | Per part |
| --- | --- | --- | --- |
| 01 | 15.4 | ruling | tour |
| 02 | **25.9** | 25-45 ok | room 7.0, chokha 6.9, **bhatti 12.0** |
| 03 | **26.6** | ok | room 5.8, batch 5.6, **patti 15.2** |
| 04 | **37.8** | ok | room 9.6, **sidhi 12.8**, anaaj 15.4 |
| 05 | **60.9** | >= 60 ok as measured, see blocking finding R2-1 | room 7.3, ghat 4.8, sangam 17.2, bori 15.7, **khokhla 15.9** (with door) |
| 06 | **61.1** | ok | room 3.6, sau 5.0, nau 6.6, **ginti 24.1**, gaadi 21.8 |
| 07 | 130.8 | ruling | unchanged |
| 08 | 9.9 | by design | unchanged |
| 09 | 73.6 | ok | wapsi 35.3 |
| 10 | **99.7** | >= 90 ok | pipa 5.3, sau 7.1, bori 15.5, **roll 11.2**, sidhi 9.8, **tempo 26.6**, gaadi 16.0, anaaj + pads 4.8 |

**Human margin on 05 and 06:** the floor is the scripted route's time, and that holds at 60.9 and 61.1 s. A human cannot get through a window before it opens. However, the route's state-driven waits carry about a second of slack each, so a sharp human who leaves each wait at the first possible moment can probably finish 06 a little under 60 s. As measured, only the bot's route clears 60 s with a margin of about 1 s. I do not block on this.

## Round-1 findings: status

- **B1 (02-04 floors): FIXED.** The three stages reach 25.9, 26.6 and 37.8 s by new acts. In `pat02-bhatti` two litti strike in their own phases. In `pat03-patti` a banner narrows from the right. In `pat04-sidhi` a third porter breaks the "wait for two" habit. The 04 time is mostly waiting, but the waiting is the rule being tested (count the porters), not padding.
- **B2 (padding): FIXED for 06 and 10, NOT for 05 (see R2-1).**
  - `pat05-bori` is down to two windows: a plain drop, then a sack that slides.
  - `pat06-gaadi` is down to 6 seams: one single lift, then a double lift.
  - `pat10-bori` and `pat10-gaadi` are down to two windows each.
  - `pat06-ginti` has two trucks, one being unloaded and one being loaded, and the count goes stale.
  - In 10, `pat10-roll` makes the sack count name the bell, and `pat10-tempo` uses sacks as riders.
  - None of these repeats one window beyond a momentum beat.
- **B3 (FIX same as NAIVE): FIXED.** Re-measured (cause @ tick). Every pair differs in both cause and tick:

| Act | NAIVE | FIX |
| --- | --- | --- |
| pat02-bhatti | pat-angara @2000 | pat-doosra @2483 |
| pat03-patti | pat-jam @2345 | pat-patti @1672 |
| pat04-sidhi | pat-bojh @1316 | pat-sidhi @2004 |
| pat05-bori | pat-ganga @3727 | pat-bori @4360 |
| pat05-khokhla | pat-khokhla @5568 | pat-ghada @6537 |
| pat06-ginti | pat-ginti @2088 | pat-load @3593 |
| pat06-gaadi | pat-jod @4942 | pat-gaadi @5719 |
| pat07-pul | pat-dhakka @3766 | pat-torana @5482 |
| pat10-bori | pat-ganga @2059 | pat-bori @2640 |
| pat10-roll | pat-jam @3948 | pat-patti @4669 |
| pat10-tempo | pat-dhakka @8357 | pat-torana @7505 |
| pat10-gaadi | pat-jod @9704 | pat-gaadi @10565 |
| stage 06 | pat-jod @264 | pat-ginti @622 |
| stage 10 | pat-jod @182 | pat-ganga @612 |

  (The builder's `pat06-gaadi` ticks are 2047 and 2824 because the act moved later in the stage. In my run the two plays still differ by cause and by 777 ticks.)
- **B4 (Kumhrar): FIXED.** No `kumhrar` act, no slippery stumps and no `pat-taala` anywhere in `src/game/cities/pat/`.
- **B5 (06 = TVM-01): FIXED.** Plates no longer flip under a hop. The betrayal is now the count: a tarp painted as a plate lies over each gap whose number is a multiple of the sacks on the parked cart. In `ginti` the count goes stale, and the second truck is still being loaded. **It reads at phone size** (`QA/qa2-06-crop.png`): the plate numbers are clear, the three sacks on the cart can be counted, and the tagline says "Count the sacks". The tarp itself is almost identical to a plate, which is the point: only the count tells them apart. I judge this a counting rule, not TVM-01's "holds a walker, breaks under a hop". It does sit on the fake-floor shape (B1); the count is what makes it new.
- **B6 (09 stretch): FIXED.** Checkpoint changes on 09 are at 38.3, 47.7 and 70.8 s, so the longest stretch is **23.1 s** (<= 25). On 10 the longest stretch is **11.5 s** (15.9 to 27.4 s), matching the report.

## Blocking finding, round 2

### R2-1. `pat05-khokhla` is made of two shipped ideas, and 05's floor depends on it
- **What:** the old deck has two kinds of float (`s05.ts` `actKhokhla`):
  - **Drumless floats** (rust-red underside, `D = [3, 8, 12, 17]`) "go under the moment you land: jump them". That is the fake floor with a visible tell: troll kit `fakeFloor`, and TVM-04's palm fronds over the retting pit (MECHANICS.md L38 and L128-129; TROLL-BIBLE B1, USED).
  - **Cracked-drum floats** (`Lk = [6, 10, 15, 19]`, awash after 110 ticks standing) "go under a second after you stop: cross without stopping". That is KVT-08's "the lagoon holds you up while you run; stop and it doesn't", and the sandbar "that goes under when you stop on it" (MECHANICS.md L131). KVT-02's planks that give way under a dad who waits are the same family, as is the `crumble` kit.
  - The NAIVE and FIX of the act do differ (`pat-khokhla` @5568, `pat-ghada` @6537), but both traps are shipped experiences in a pontoon skin. AGENTS.md bar 1: "the same experience under a new name, skin or city is a repeat."
- **Why it blocks the floor too:** khokhla and the door add 15.9 s. Without khokhla, 05 is about 45 s against a floor of 60.
- **How I reproduced it:** read `actKhokhla`; `qa-probe` gives the two causes and ticks; `qa-split` gives the part times; frames at phone size are in `QA/qa2-05.png` (top row).
- **What would satisfy me:** replace khokhla with a beat built on the pontoon's own idea, "the section sinks under the heaviest thing on it" (load, cart, sacks), rather than on the float's own condition. It must reach 60 s on the route with a new betrayal. Or the conductor waives 05's floor, as for 01.

## Polish (not blocking)

- **Sliding sack (05 and 10 `bori`) vs TVM-10 F137 offset-swing:** I accept it. TVM-10's lesson ("the slick is not under the pot") is a close cousin. Here the move is one-off along a drawn rope, and the floor sinks instead of turning slick.
  - **Readability:** at phone size the rope is hard to see. The sack hangs over the tan Golghar dome in the backdrop (`QA/qa2-05.png`, bottom right). Draw the rope darker, or add a mark on the landing section.
  - **Death line:** `pat-bori` says "landed on you", but the section goes awash; nothing hits you. Say "landed on your section, and it went under".
- **Stage 10's FIX death line:** the FIX dies to `pat-ganga` (it carried the room's count on to the pontoon). That line says "jump over the one the cart is on", which points at the cart rule, not the count. A count line, as on 06, would name what killed the player.
- **Finale callbacks:** 10 has eight distinct rules and is the hardest long stage, and it calls back the Setu, the pontoon, Golghar, the hoardings and the tempo, as the allocation asked. The claim "every earlier PAT idea called back" is overstated: litti (02), Nalanda (08), Sonepur (09) and the bus crowd (01) are not in it. It is fine against the allocation.
- **Stage-level FIX of 03 and 04:** still the same cause as NAIVE (`pat-jam`, `pat-bojh`). These are acceptable ladders; the new acts carry their own distinct A2.
- **Replay over 8 s:** a few stretches are still over 8 s (05 sangam 17.3 s, 09 wapsi 23.1 s), but all are under the 25 s module rule. 10's worst is 6.9 s, as reported.
- **Truck:** on 06 the "truck" is drawn as a handcart, and the signs say truck. Match them.
- Everything else in `QA/FAIL-1.md` polish (HWIK tell and 08/09, place-fit, hidden items, calm checkpoints) still holds. I did not re-render 08.

## Not checked
Touch feel on a phone, and audio. I rendered my own frames for 05 and 06 only; 02, 03, 04 and 10 are judged from code, probes and the builder's new sheets.
