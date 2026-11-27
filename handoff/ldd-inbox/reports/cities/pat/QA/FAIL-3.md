# PAT · Patna: independent QA, round 3: FAIL (one blocking finding)

Tested `city/pat` at **d8cdc4e** in my detached worktree `/local/home/saiposh/personal/ldd-wt/qa-pat`. Nothing was committed. Earlier rounds are kept as `QA/FAIL-1.md` and `QA/FAIL-2.md`. LKO was read only, from `/local/home/saiposh/personal/ldd-wt/lko` at 0b73573.
Probes are my untracked scratch files in `tests/qa/`: `qa-probe`, `qa-split` and `qa-rec` as before, plus a new `qa-kuli.test.ts` (replay and calm from the lay-by checkpoint). Frames come from `scripts/solshot.mjs` at phone viewport (844x390): `QA/qa3.png`.

## Regression (my own runs)

| Check | Result |
| --- | --- |
| `npm test` (full, once) | **18 files, 1605 passed, 0 failed** (14 skipped: 11 env-gated tools and my env-gated probes). PAT is on no allow-list |
| `npm run build:single && node scripts/flows.mjs` | **`no errors`** |
| `LDD_N=80 npm run fair -- PAT` | every stage 100% at 12t, except PAT-09 at 96%. Every stretch 100%, except PAT-09's door at 96%. PAT-05 is now 100% with 8 stretches, all at 100%. **Holds** |
| Round-2 closes B1-B6 | **still hold.** Route times: 02 25.9, 03 26.6, 04 37.8, 06 61.1, 09 73.6 and 10 99.7 s, all unchanged. Every act's NAIVE and FIX still differ in cause and tick. No `khokhla`, `ghada`, `taala` or `kumhrar` remains in `src/game/cities/pat` or `tests/cities/pat.ts`. The longest stretch is 23.1 s on 09 and 11.5 s on 10 |

## The new act `pat05-kuli`: measurements

| Item | Measured |
| --- | --- |
| 05 route | **70.6 s** (kuli and the door take 25.6 s) |
| NAIVE "run on along the lane" | `pat-kuli` @**6318** |
| FIX "step down after the first porter" | `pat-kuli2` @**6631** (different cause, different tick) |
| Replay from the last checkpoint to the death, NAIVE | 7.6 s at lag 0, 6 and 12 (<= 8) |
| Replay from the last checkpoint to the death, FIX | 0.9 s at lag 0, 7.6 s at lag 6 and 12 (<= 8) |
| Lay-by checkpoint (index 6, x 3216 px) | reached on the lay-by (y 200, lay-by spans cols 199.5-207) |
| Calm, reached as on the FIX play (porter 1 just past at col 194, porter 2 at col 208 coming) | idle 4 s **alive**; run right 0.3 s then idle **alive**; tap-jump then idle **alive**. *Extra:* run **left** 0.3 s then idle **dies** (`pat-kuli`): the lay-by's left end is 0.7 tiles from the checkpoint, and porter 1's sunk floats lie just past it |
| Calm, reached as on the route | all four tries alive |
| 05 checkpoint stretches | longest is 17.3 s (sangam, unchanged), kuli 12.3 s |

Mechanically the act is sound and fair. The blocker is what the act is.

## Blocking finding, round 3

### R3-1. `pat05-kuli` is the same experience as Lucknow's `lko07-saamne` (and `lko02-dakiya`), and as PAT-04's own porters

**The three acts, step by step:**

| | PAT `pat05-kuli` | LKO `lko07-saamne` (s07.ts L503) | LKO `lko02-dakiya` (s02.ts L374) |
| --- | --- | --- | --- |
| Set-up | one-lane pontoon deck | arcade lane between nalas | lane to a shut gate |
| What comes | a laden porter, head-on | a group of strollers with a banner, head-on | a postman's cycle, from behind |
| A1 (stay in the lane) | he and the floats sunk under him kill you (`pat-kuli`) | "the group didn't part: they walked you back into the nala" (`lko-saamne`) | "the postman rode into you" (`lko-dakiya`) |
| Can you hop it? | no (the sunk zone is wider than a jump, and the sack is high) | no ("hopping over them puts you into the banner", `lko-jhanda`) | no |
| A3 (the answer) | step **up** on the lay-by at the side and let him **pass under** you | step **up** into the alcove and let them **pass under** you | step **up** on the chabutra at the side and let them by |
| A2 (the fix that dies) | step down after the first: **a second porter follows** 3 s behind (`pat-kuli2`) | the last group "comes on straight after the one before": wait till **both** have passed (`lko-saamne-taak`) | "There were two: the milkman was right behind the postman" (`lko-dakiya-doosra`) |

Put in words, the three acts all say the same thing: "Something you cannot pass or hop comes along your lane. Step up into a niche at the side, let it go by under you, and do not come down after the first one, because a second follows."

**Does the sinking-float load make it a different rule?** No. The sinking floats change only how the death looks: you drown beside him instead of being walked into the nala. They also widen the porter's deadly zone to three floats. The player's reading and the decision at every attempt are the same as in saamne: see the oncoming thing, step up, wait out both. Nothing about the floats asks the player to do anything else. In LKO the nala plays the same role as the sunk floats (the water you are pushed into). A player who has played both cities will feel the same joke twice, the second time with a different skin. AGENTS.md bar 1: "the same experience under a new name, skin or city is a repeat."

**It also repeats PAT's own stage 04.** In PAT-04, porters carry sacks DOWN the stair you climb. You cannot hop a sack. A2 dies to the second porter right behind the first ("wait until both have gone by"), and `pat04-sidhi` adds a third. `pat05-kuli` is that same ladder (an oncoming laden porter, then a second behind him) moved to the pontoon. Inside one city that is the "harder version of X" that bar 2 forbids.

**Shipped families:** MECHANICS.md has "a scooter from behind and then one head-on" (TVM-03), which is close but there you hop. Nothing shipped has the step-into-a-niche ladder. The finding stands because the experience is the same as LKO's and PAT-04's, not because of a shipped stage.

**Why it blocks the floor:** without kuli, 05 is about 45 s against its floor of 60 s.

**How I reproduced it:** read `s05.ts` `actKuli` (L278-358), LKO `s07.ts` `saamne` (L503 on) with the `lko-saamne`, `lko-saamne-taak` and `lko-jhanda` lines in `causes.ts`, LKO `s02.ts` `dakiya` (L374 on) with `lko-dakiya` and `lko-dakiya-doosra`, and PAT-04's `pat-bojh` and `pat-sidhi`. `qa-probe` gives the kuli causes and ticks.

**What would satisfy me:** a 05 act that makes the player do something different with the load idea, "the section sinks under the heaviest thing on it". One example: Dad himself becomes the load that matters, so standing next to something else changes which float sinks. Or the conductor waives 05's floor. If the conductor decides that LKO, which is also unshipped, should give way instead, kuli would pass on mechanics. It would still repeat PAT-04's porter ladder, which I would then list as polish, not block.

**For the conductor (not a PAT finding):** LKO itself has this experience twice, in `lko02-dakiya` (chabutra, two cycles) and `lko07-saamne` (alcove, two groups). LKO's QA should look at that.

## The four polish items, read at phone size (`QA/qa3.png`)

- **Rope (05 and 10 `bori`): DONE.** The dark 3 px rope reads against the sky, and the red landing bar is plain on the deck (frame 4).
- **`pat-bori` line: DONE.** It now reads "landed on your section, and it went under".
- **PAT-10 FIX count line: DONE.** The FIX dies to `pat-bhaar` @612 with "You counted with the last cart's sacks...". (In the frame, the death card had not drawn yet when the recording ended; I checked the text in `causes.ts`.)
- **06 lorry: DONE.** The cab, bed and wheels read as a lorry, with the sacks on the bed (frames 5 and 6).
- **New, small:** the LAY-BY sign says "step up, let them pass". "Them" warns the player about the second porter before they have died to it. Make it "let him pass", or drop the sub-line.
- **New, small:** from the lay-by checkpoint, running left 0.3 s kills you (see the calm row above). The left edge of the lay-by is within a short run of the checkpoint. Move the checkpoint to the middle of the lay-by.

## Not checked
Touch on a phone, and audio. I rendered my own frames only for 05, 06 and 10 in this round.
