# SVP QA round 1: FAIL

Tester: independent QA chat (wrote none of SVP). Branch `city/svp`, tip `2c587a5` (branch head at 06:07 UTC 27 Nov 2026), own detached worktree
`/local/home/saiposh/personal/ldd-wt/qa-svp` (node_modules symlinked from the main repo, same package-lock). develop f8288e9 is in the branch
(`git merge-base --is-ancestor` true). Nothing committed or pushed; two scratch tests in the worktree, copied here as `qa-sweep.test.ts.txt` and
`qa-plays.test.ts.txt`. Clock: 06:07-06:25 UTC.

## Pre-rulings by the conductor (as given, not re-judged)

- Honest floors are FINAL: 04 20.6 s, 05 41.5, 06 21.2, 07 44.5, 09 35.3, 10 64.5 (08 86.8 meets its floor). F490 and F491 refusals accepted; the struck list is binding. I judged the acts that exist, not the count.
- SVP-01 replay 7.76 s at lag 12 is exempt (shared tour course).
- SVP-06 and SVP-09 at 80% at 18 ticks are parked; the bar is 6 and 12 ticks.

## What passed (my own runs)

| Check | Result | File |
|---|---|---|
| `npm run typecheck && npm test` | tsc clean; 18 files passed, **1773 passed**, 20 skipped, 0 failed. SVP on no allow-list (`tests/modules.test.ts` EXEMPT has no SVP; `CPSAFE3_PENDING = ['PAT']`). Guard, allocation, levels, checkpoints, cpsafe (10 SVP stages), items, jump audit, frozen green. | `npm-test-summary.txt` |
| `npm run build:single && node scripts/flows.mjs` | built; "no errors" (CHROME_PATH = playwright chromium-1228) | `flows.txt` |
| `LDD_N=80 npm run fair -- SVP` | every stage **100% at 6t and 12t**, every stretch 100% at 0-12t; 18t: 06 80%, 09 80% (parked), rest 100% | `fair80.txt` |
| Lag-captured sweep (route at lag 0/6/11/12 x spawn idle 0/37/120/251, capture where the lagged run takes the checkpoint, 7 plays) | **0 deaths in 6,832 plays**, all ten stages. Longest stretch: 01 16.1, 02 9.8, 03 7.8, 04 11.6, 05 8.4, 06 10.0, 07 9.8, 08 12.1, 09 6.0, 10 12.3 s (all <= 25) | `sweep-lag-captured.txt` |
| Replay, last checkpoint to each NAIVE/FIX/mistake death, per tick, lagged model at **lag 0/6/11/12** | worst: 01 7.32/7.42/7.50/**7.76** (exempt), 02 6.63, 03 2.27, 04 3.72, 05 2.91, 06 1.86, 07 5.46, 08 **7.47**, 09 3.81, 10 6.83. No `nodeath` at any lag (the 10 sitter dies at every lag: 4.38/4.65/4.70/4.79 s, FIX-1.md point 2 confirmed). | same |
| HWIK tells | 05: the note's picture on its signboard by each bench and the dashed outline of the ledge are on screen before the gap (shots3/SVP-05, frames 1-6). 08: the dark cloud bank with slanting rain shows on the coming side before each rain (shots3/SVP-08, frames 3, 6, 9). Both read at sheet scale (about phone size). | |
| Place and lines | Cellular Jail as a far silhouette only, Ross Island ruins, sawmill, jetty and ships, Aberdeen covered market, North Bay viewpoint: read as the islands. Lines are plain Hindi, plausible; intro lines for 02-10, a `seven` line, Tara's lies (08 her true one), items green in `items.test`. | |

Cause@tick, lag 0 (reproduced; identical to `probes/p3-round4.txt`): 01 baha@586/baha@1298; 02 aari@434/kichad@2063; 03 magar@272/magar2@741; 04 hiran@354/hiran2@1550;
05 nazar@190/chuna@3137, ooncha nazar@2587/nazar2@2520, choona chuna@3137/chuna2@4110; 06 kichad@199/kichad2@1309; 07 saman@544/bheed@776, jahaz@684, ghat jahaz@920,
doosra bheed@2553/bheed@2413, teesra bheed@3241, bus bus@4133/bus-aage@4436; 08 baarish@217/nala@10013, chhajja@5380/chhajja2@7181, tin baarish@8365/baarish3@9039,
deewar baarish@3423/baarish2@3754; 09 eent@138/eent2@550, nali@2739/nali2@3150, patta hull@3648/pankha@3730; 10 aari@654/magar3@1290, mill aari@717, saman bheed@4754,
bheed@4717/bheed2@5026, nali@5803/nali2@6214, nadi magar3@1290, jad eent3@3786/eent4@4047, ghat hiran3@6888/fell@6581.

Plays the builder did not script (`plays.txt`, plain runner, lag 0):

| Play | Result |
|---|---|
| 05 room, original FIX: footprints, dawdle 2.75 s, go | dies `svp-nazar`@573 (same cause as the NAIVE) |
| 05 dekho, run and hop through | dies `svp-nazar`@627 |
| 05 dekho view 3, stand at the bench (3 tiles before the prints), then go | dies `svp-nazar`@1386 |
| 06 room, original FIX: jump for the cliff from the branch tip | dies `svp-kichad`@521 (same cause as the NAIVE) |
| 07 teesra, out of the trench behind the first crowd and on | **survives teesra**; dies only later at the bus, `svp-bus`@3796 |
| 07 teesra, out behind the first crowd after 0/30/60/120/200 ticks, walk to x+46 and stop there | dies `svp-bheed`@3708 (only if you stop) |
| 08 room, original FIX: right end of the first awning, stay | dies `svp-baarish`@726 (same cause as the NAIVE) |
| 09 room, original FIX: step across where the swinging root was | **survives the room**; dies in `pul`, `svp-eent2`@555 |
| 09 pul, hop every root including the grey step | dies `svp-eent2`@550 |
| 10 nadi, hop the logs at once | dies `svp-magar3`@1290 (= the "trust the board" play) |
| doors 05/06/07/09/10 walked at without their answer | no death: Dad is stopped (gate doors) |

## Decision sweep (one sentence per part; closest row; verdict)

| Part | Decision | Closest row | Plays differently? |
|---|---|---|---|
| SVP-01 room | Shelter under the awning for the two lobes; cross in the sun. | TVM-02 floods; tour | yes |
| 02 room | Stand on the piece of the log the saw leaves (boarding end). | rollers | yes |
| `svp02-chirai` | This hall the middle is what stays. | 02 room (the break of it) | yes |
| `svp-timber-stack` | Wait back from the stack; walk in after the third plank. | RPR `khisko` | yes |
| 03 room / `svp03-nala` / `svp-board-bridge` | Cross when the honest arrow points away from you (door recast by ruling I4). | 03 room | door: as ruled |
| 04 room | Put the food down well back from the edge. | GNR/DMN herds | yes |
| `svp04-ghat` | Put it down at the stall itself, close to the edge. | 04 room (stale rule) | yes |
| `svp-jetty-guard` | Arrive at the guard without food. | 04 room | yes (no edge; new reason) |
| 05 room | Stand on the footprints until the picture aligns, then go before it fades. | `invisible` | yes |
| `svp05-dekho` | Stand on each view's footprints, then go (views a, b, d, e); view c: the prints, not the bench. | **05 room** | **a, b, d, e: no** (B5) |
| `svp05-ooncha` | Stand at the note's eye height (the bench), not on the prints or the pole. | F503 | yes |
| `svp05-choona` | Hop under the formation, then wait on the dry side till it stops dripping. | HYD-06 echo (S18 KEEP) | yes |
| `svp-note-door` | Stand on the last footprints till the picture aligns; then the door is there. | **05 room** | **no** (B7) |
| 06 room | Wait for the flock to bend the branch, board, wait for the horn to lift you. | PNJ-05, `kvt07-bend` (S17 KEEP) | yes |
| `svp06-sanjh` | The same, twice. | 06 room | no: ruled 06's labelled momentum beat (W7) |
| `svp-bough-door` | Board the bough while the flock holds it down and ride it up to the door. | **06 room** | **no** (B7) |
| 07 room | Don't sit on the luggage; trench while the crowd runs; out behind it. | CHN-02 | yes |
| `svp07-ghat` | The first ship is the crowd's and sails; wait for the second and step on its deck. | PDY `fakewin` | yes, but one trap only (B8) |
| `svp07-doosra` | The first board message is a false alarm; still trench till the real call's crowd passes. | **07 room** | a player who learned the room solves it unchanged; acceptable only as 07's labelled shelter beat (new tell: ARRIVING/NOW BOARDING). Polish P1 |
| `svp07-teesra` | The crowd that passed comes back: stay in for both. | **PAT-04 room** ("step aside for an oncoming load; a second follows", the registry's calibration ruling), `bbi06-tana` | **no** (B1) |
| `svp07-bus` | Be on the bus roof as the note rises: behind it rolls back, ahead it runs you down. | TVM-02 bus roof | yes (where vs whether; the 2D form of F504's "beside") |
| `svp-ticket-window` | Don't board the docked ship; wait for it to sail and the window opens. | **`svp07-ghat`** | **no** (B7) |
| 08 room / `svp08-gali` | Be at the lee end for the rain that is coming. gali labelled momentum. | PDY-08 | yes |
| `svp08-deewar` | Shelter by the building's height. | I2 (SVP wins) | yes |
| `svp08-chhajja` | Under a lean-to read the slope: dry under the high end. | F492 | yes |
| `svp08-tin` | Under the tin, the drumming side is the rain side: go to the other end. | V2 kept apart | yes |
| `svp-gutter-river` | The road becomes a river while it rains: cross only in the lull. | allocation A3 | yes |
| 09 room | Roots hold, brick crumbles; time the swinging root. | crumbling floors | yes |
| `svp09-pul` | Creeks 1-2: a grey root is dead and crumbles. Creeks 3-5: green roots over brick, swinging ones. | **09 room** for creeks 3-5 | creeks 1-2 yes; **3-5 no** (B6) |
| `svp09-nali` | Route the hose over the arches, one under only where line allows. | SVP's own | yes |
| `svp09-patta` | Let go under the hatch: the way up is straight. | PNJ-07 let go over the beach | yes (F494) |
| `svp-frame-door` | Take the roots up to the door, not the brick steps. | **09 room** | **no** (B7) |
| 10 room (mill) | Put the food down before the mill, then stand on the boarding end. | **04 room + 02 room** | **no**: replays both (B3) |
| `svp10-nadi` | The board is stale: read the ripples. | 03 break | yes, but one trap (B2) |
| `svp10-jad` | Grey roots hold, green go. | 09 break | yes |
| `svp10-saman` | Lashed luggage: climb the tall stack; the crowd goes under and back. | 07 break; its FIX trap = teesra/PAT-04 | break yes |
| `svp10-nali` | Fed the other way: under is free, over costs line. | 09 break (FIX-1.md) | yes, a real break |
| `svp10-ghat` | Deer tied: carry the fritter, it is the fare (keep moving or Dad puts it down). | RPR `gud` | yes |
| `svp-dweep-gate` | Put the fritter down before the gate guard. | **`svp-jetty-guard`** (same advice text, same policy) | **no** (B4) |

## BLOCKING

**B1. SVP-07 `svp07-teesra`: the baited play survives, and the act's decision is a shipped one.**
What: the room teaches "out of the trench behind the crowd, and on". In teesra, doing exactly that and walking on survives the act; the returning crowd only
catches a player who stops near x+46. The only scripted death in teesra is "sit on the luggage a third time" (the room's NAIVE). The decision "the crowd that
passed comes back, stay for both" is PAT-04's shipped "step aside for an oncoming load; a second follows" (the registry's own calibration ruling).
How: `plays.txt` rows "teesra NAIVE" (survives to `svp-bus`@3796) and "after 0..200 ticks, stop at x+46" (`svp-bheed`@3708).
What satisfies me: cut teesra, or recast it to a decision not in lists 1-2; whatever stays must kill "out behind the crowd and walk on" at lag 0/6/12 with its
own cause, and have a FIX that dies to a different cause at a different tick.

**B2. SVP-10 `svp10-nadi`: one trap.** NAIVE "trust the stuck board" and the hop-at-once play both die `svp-magar3`@1290; there is no FIX death (the builder says
so in LENGTH-3.md; `svp-magar4` is unreachable). What satisfies me: a second window where a ripple reader's obvious next move dies to `svp-magar4` (or another
cause) at a different tick, scripted with `actDeath`.

**B3. SVP-10 room (the mill): FIX same cause, NAIVE does not read, and the room replays 04 + 02.**
NAIVE `svp-aari`@654, the next play "food down, ride the middle" `svp-aari`@717: the same cause 63 ticks later. The NAIVE's death line is the 02 line ("You were
standing where the saw cuts... Keep a plank away from it"), which names nothing about the herd shoving you or the food, so the player cannot learn "put the food
down" from it (law 9). The solve is the 04 room's thought plus the 02 room's thought, with no rule broken (law 7).
What satisfies me: the NAIVE dies to a cause whose line names the herd and the food; the FIX dies to a different cause at a different tick; and the mill breaks
one of the rules it calls back (for example the end that stays is not the boarding end), or the conductor rules the finale room exempt from W7.

**B4. SVP-10 door `svp-dweep-gate` = SVP-04 door `svp-jetty-guard`.** Same advice text ("Put it down before the guard/well back from the gate, stand still till it
is down"), same ending policy (`h.carrying ? go('') : go('R')`). A self-repeat (AGENTS.md bar 1) and a finale callback that replays.
What satisfies me: a new door, or this one breaking 04's door (for example the guard wants the fritter, as `svp10-ghat`'s boatman does, but not at the same time).

**B5. SVP-05 `svp05-dekho`: padding and no NAIVE/FIX.** Five views; a (one bench), b (island bench), d (stair) and e (a longer hold) are the room's rule with
new numbers. Only view c (the bench three tiles before the prints) asks something new, and it kills with the room's cause (`svp-nazar`@1386). dekho is missing
from LENGTH-3 probe table 1, which gives 05's momentum beat to choona's second wall. No `actDeath` exists for dekho.
What satisfies me: keep at most view c plus one labelled momentum window (and move choona's label, or cut its second wall), and script a NAIVE and a FIX for
dekho with different causes and ticks.

**B6. SVP-09 `svp09-pul`: padding, and the scripted 09 FIX is not a second trap.** Creeks 3 (root stair), 4 and 5 (the long cellar with two swingers) are the
room's rule again with new numbers; pul is missing from probe table 1 (09's momentum is nali's second stretch). The scripted 09 FIX is "walk the brick of the
cellar" (the room's NAIVE again, keyed `svp-eent2`); the room's real second attempt ("step where the root was") survives the room. The grey-root trap of
creeks 1-2 does kill (`svp-eent2`@550), but its line names the brick floor, not the dead root.
What satisfies me: cut creeks 3-5 (or keep one as the labelled momentum beat in place of nali's), script the grey-root play as pul's NAIVE with a line that
names the grey root, and give pul a FIX dying to a different cause at a different tick.

**B7. Doors that repeat their own stage (AGENTS.md bar 1: every door ending a new idea inside its city).**
- `svp-note-door` (05) = 05 room: stand on the prints till aligned, then go (the ending policy is the room's).
- `svp-bough-door` (06) = 06 room: board the bent bough and ride it up.
- `svp-frame-door` (09) = 09 room: roots, not brick.
- `svp-ticket-window` (07) = `svp07-ghat`: don't board the departing ship; wait.
What satisfies me: each door asks a decision not already asked in SVP (03's door is excepted by ruling I4).

**B8. SVP-07 `svp07-ghat`: one trap.** Only "on to the first ship with everyone" dies (`svp-jahaz`@920; the room mistake at @684 dies at the same ship). No FIX
death. What satisfies me: a scripted FIX of ghat dying to a different cause at a different tick.

## Polish (not blocking)

- P1 `svp07-doosra` re-asks the 07 room (its two deaths are the room's NAIVE and the room's own mistake); label it 07's one shelter beat (its board tell is new).
- P2 Room-level second attempts of 05, 06 and 08 die to the same cause as their NAIVE (nazar@573, kichad@521, baarish@726); the stage FIX is carried by a later act, which the tests accept. Fine, but say so in the docs.
- P3 Ship gender: "Ship nikal gayi" (seven line) vs "Agla ship pakdo"; pick one. "Jungle one, Dad zero!" has no Local | English form.
- P4 Probe table 1 in LENGTH-3.md is hand-written and skips dekho, pul, doosra and teesra; a tool-made list would have caught B5 and B6.
- P5 08 replay 7.47 s (chhajja2) is 0.03 s under the bar at every lag.

## To re-test I will need

- The new tip on `city/svp` and a list of which of B1-B8 each commit addresses.
- `tests/cities/svp.ts` with `actDeath` NAIVE and FIX for teesra (or its replacement), nadi, the mill, dekho, pul and ghat, each a different cause and tick.
- The new death lines for the mill NAIVE and the pul grey root.
- A rerun of `LDD_N=80 npm run fair -- SVP`, the lag-captured sweep and the per-tick replay (any changed stage), and fresh sheets for 05, 07, 09 and 10. I will rerun all of them myself.
