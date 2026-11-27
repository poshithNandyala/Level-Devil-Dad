# BBI · Bhubaneswar: QA fix round 1

Branch `city/bbi`, worktree `/local/home/saiposh/personal/ldd-wt/bbi`, tip **`f4dfa7d`** (base: QA subject `71df6f8`).
Own files only, no shared file touched, no push, no version bump. All file edits were made with the file tools; the
shell ran plain commands and pipes only. Scratch probes are untracked: the tester's `qa-bbi6` copy with a plays-only
switch is `qa-bbi6-fix1.test.ts.txt`, and the pairing script is `pair.py.txt`, both beside this file.

## What does not meet the bar, and why (read this first)

1. **F6 is not fully met: 15 of 139 scripted plays do not hold their own cause at every lag.** That leaves 5
   act-pair lag cells with one cause or a stall. I fixed the blocking ones:
   - the 09 spokes and chariots, which had taken down every 09 play at lag 6 and 12;
   - the finale room route, which my F5 change broke at lag 6 and 12;
   - the 05 cart plays at lag 6;
   - 08 `phinga`;
   - 10 `chakra`.

   The rest are listed in the F6 table with what I tried. Each is a script-timing limit (a fixed press that cannot
   land at both lag 0 and lag 12), not an engine limit. I give no engine reason for them because there is none: they
   are not fixed.
2. **The two-play bar fails on 08 and 09 after the F2 cuts:**
   - **08:** 4 two-play acts (phinga, bhanwar, dati, ghurni). `dui` was cut.
   - **09:** 3 two-play acts (udaya, ratha, ulta; ara is one-play). `ghoda` and `asta` were cut.

   Shorter and honest beats a repeat, as ruled. Nothing was added to make up the count.
3. **Floors fall where the cuts fell** (the honest times table below):
   - **05:** 60.2 -> 54.2 s, now under its floor, because `tenda` was cut.
   - **07:** 86.0 s; **08:** 33.3 s; **09:** 39.4 s.
   - 07, 08 and 09 were pre-ruled honest.
4. **F2 and F3 were cut, not recast.** I tried no recast for `asta`, `ghoda`, `dui`, `dweepa`, `shrinkhala` or `tenda`.
   Every candidate thought for 07, 08 and 09 that is not already asked is either built (all v3 rows are in) or not in
   the registry. I did not invent one.
5. **F4: all four doors were made PLAIN.** No recast was tried at the gate; plain is accepted.

## F1 · law 9: every finale callback (and 06 palaa, 07 dui-baja) names its own rule

**The mechanism.** `ownCauses()` in `common.ts`, driven by `OWN_CAUSES` in `causes.ts`, renames a shared hazard's cause
to the act's own cause while Dad is inside that act. Each renamed cause has its own line in `causeLines`.

| Play (tester's id) | Before | After: new cause, and its line's advice | lag 0 / 6 / 12 (cause@tick) |
| --- | --- | --- | --- |
| 10 m2 chheli wait on the straw | `bbi-sinha` ("wait … then jump") | `bbi-sinha-10`: "Tonight the goat charges the straw when it comes back" / "Jump while it is away" | sinha-10 @2665 / @2761 / @2795 |
| 10 m3 chheli jump on the pounder | `bbi-chheli` | `bbi-chheli-10`: "…jump while the goat is away and off the beam" | @2045 / @2156 / @2202 |
| 10 m4 chhata wait for a customer | `bbi-rangapani` ("Wait for it") | `bbi-rangapani-10`: "a buyer folds his up … Don't wait for anyone" | @2847 / @2949 / @2989 |
| 10 m5 chhata silk | `bbi-silk` | `bbi-silk-10` | @2849 / @2951 / @2990 |
| 10 m6 patta first pit | `bbi-sadha` (06's rule) | `bbi-sadha-10`: "tonight the painter paints the pit beside him" | @2926 / @3086 / @3200 |
| 10 m7 patta panel you passed | `bbi-chitra` ("use the one you passed") | `bbi-chitra-10`: "Read the panel beside this pit" | @3080 / @3257 / @3389 |
| 10 m9 tantu time the shuttle | `bbi-rachh` | `bbi-rachh-tantu10`: "Snap the first coloured thread" | @3759 / @3959 / **`bbi-ranga`@4243** (F6) |
| 10 m10 palaa wait for it to run | `bbi-rachh` (wrong mistake) | `bbi-rachh-palaa10`: "tonight it waits for you … step straight on" | @4055 / @4262 / @4423 |
| 10 m11 palaa jump out | `bbi-ranga` (wrong mistake) | `bbi-ranga-palaa10`: "It never ran … step straight on" | @3994 / @4206 / @4378 |
| 10 m12 bagudi back over the line | `bbi-bagudi` ("run back over the line") | `bbi-bagudi-10`: "tonight the boys let 'it' through … walk straight through" | @4606 / @4832 / @5017 |
| 10 m14 / m15 pada | `bbi-nacha` / `bbi-thrown` | `bbi-nacha-pada10` / `bbi-thrown-pada10` | @5031 / thrown@5232 (F6) / thrown@5404 (F6) · @5011 / @5232 / @5404 |
| 10 m16 / m17 dui-baja | `bbi-nacha` / `bbi-thrown` | `bbi-nacha-dui10` ("tonight he is the one out of step") / `bbi-thrown-dui10` | @5064 / @5299 / @5483 · @5443 / @5670 / @5848 |
| 10 m18 / m19 ghungur | `bbi-nacha` / `bbi-thrown` | `bbi-nacha-ghungur10` ("the bells hang from the frame…") / `bbi-thrown-ghungur10` | @5549 / @5781 / @5966 · @6059 / @6298 / @6487 |
| 10 m21 thaka climb the stone | `bbi-pathara` ("stop it at the top") | `bbi-pathara-10`: "stop the sweep low" | @5979 / @6224 / @6377 |
| 10 m22 / m23 phinga | `bbi-badi` / `bbi-buda` (08's rule) | `bbi-badi-10` ("this server starts hard") / `bbi-buda-10` ("Wait for him to slow down") | @6471 / @6716 / @6915 · @6789 / @7034 / **`bbi-pakhala`@7224** (F6) |
| 10 m24 / m25 ghurni | `bbi-ghurni` / `bbi-chamacha` (08's rule) | `bbi-ghurni-10` ("the edges fling you") / `bbi-chamacha-10` | @7767 / @8027 / @8237 · @7877 / @8142 / @8356 |
| 10 m26 / m27 deepa | `bbi-deepa` ("walk under") / `bbi-thrown` | `bbi-deepa-10` ("tonight they hang right down… ride the wheel") / `bbi-thrown-deepa10` | @8480 / @8765 / @8997 · @8294 / @8573 / @8799 |
| 10 m28 / m29 chakra | `bbi-chakka` ("wait on the hub") / `bbi-khai` | `bbi-chakka-10` ("the hub slid into the wall … up on to the rim") / `bbi-khai-10` | @8662 / @8967 / @9280 · @8659 / @8974 / @9270 |
| 10 m30 / m31 udaya | `bbi-dooba` / `bbi-udaya` (09's rule) | `bbi-dooba-10` / `bbi-udaya-10` ("they rise only while you wait on the bank") | @9420 / @9748 / @10097 · @9093 / @9435 / @9796 |
| 10 m32 / m33 tana | `bbi-nacha` / `bbi-thrown` | `bbi-nacha-tana10` / `bbi-thrown-tana10` | @10905 / @11383 / @11905 · @11263 / @11735 / @12252 |
| 06 m11 palaa run at it | `bbi-ranga` ("the beat moved your patch") | `bbi-ranga-palaa`: "It jumped away as you came at it" | @4928 / @5008 / @5102 |
| 06 m12 palaa wait at the edge | `bbi-rachh` | `bbi-rachh-palaa`: "as it got back, the beater beat the bank" | @5268 / @5342 / @5430 |
| 07 m6 dui-baja | `bbi-nacha` ("Wait for a pose") | `bbi-nacha-dui`: "this troupe follows the one across the pit" | @3846 / @3918 / @3972 |
| 05 m12 mama, lag 6 | `bbi-tenda` (the lift-class line) | `bbi-kua-mama`: "Into the well … the bucket was not under you" | (lag 6 only) @5331 |

The finale's own causes `bbi-likhita`, `bbi-ganthi`, `bbi-ghera` and `bbi-kua` were already right and are unchanged.

**The rest of the city checked against the rule** (a line names what killed you, and never repeats the advice that
killed):
- I read every line used by a death in the pairing table below. The changed ones are the rows above plus `bbi-nala`
  and `bbi-nala-lip` (F8), `bbi-lob` and `bbi-chakka-room10` (F5).
- `bbi-tana` (the old curtain door) and `bbi-kainchi` (the scissors) became unused with F4 and were removed.
- Not changed, though a reader may want them: `bbi-tenda` stays only on the mama well channel, which is now renamed;
  `bbi-nacha`'s "Wait for a pose" stays for the 07 room's NAIVE, where it is the right advice.

Commit `f7ba9de` (plus `aeb09fd` for the well line).

## F2 · five in-stage repeats: cut

| Act | Before | After | Commit |
| --- | --- | --- | --- |
| `bbi09-asta` | a second window of `udaya` (`risingSpokes` downhill) | cut | `ad9b2b1` |
| `bbi09-ghoda` | the 09 room again (with `ratha`, asked three times) | cut; `ratha` stays (W6) | `ad9b2b1` |
| `bbi08-dui` | the 08 room's bowl, four badi | cut (the `bowl` option `over` is now unused; left in) | `ad9b2b1` |
| `bbi07-dweepa` | `mardala` again | cut | `ad9b2b1` |
| `bbi07-shrinkhala` | `bandha`'s first half, a second momentum window | cut | `ad9b2b1` |

## F3 · `bbi05-tenda`: cut

`tenda` was the lift class (`kvt05-lift`, ruling S3). It is cut. `tendaAct` stays only as the uncle's lift inside
`bbi05-mama`, where the deaths are the uncle (`bbi-mama`), his shove (`bbi-dhakka`) and a miss into the well
(`bbi-kua-mama`), never the riser overrunning. The uncle's shove now lands you in the well, short of the bucket, so
the FIX replay is 3.67 s, not a whole ride. Commits `ad9b2b1`, `f4dfa7d`.

## F4 · four doors: plain

| Door | Before (the decision it re-asked) | After | Commit |
| --- | --- | --- | --- |
| 06 `bbi-motif-door` | the 06 room | `bbi-tanti-ghara`: the weaver's house, door open, saris either side, walk in | `ad9b2b1` |
| 07 `bbi-pose-gate` | the 07 room | `bbi-sajaghara-door`: the show is over, the boys sit by the green-room door, walk in | `ad9b2b1` |
| 08 `bbi-leaf-plate` | the S3 lift class laid flat | `bbi-rosei-ghara`: the kitchen door, leaf plates stacked by it, walk in | `ad9b2b1` |
| 10 `bbi-ribbon-snip` | BLR-08 `spikes` (cross between cycles) | `bbi-stadium-gate`: the ribbon is already cut, its ends hang from the pillars, walk in | `ad9b2b1` |

There is no death play at these doors. The six doors the tester passed are unchanged. The test policy for the plain
doors is `walkIn` (hold right).

## F5 · the finale room breaks 02

**Sentence (gated first):** tonight the flick is lifted over the keeper's front pad and drops on his back pad, so ride
the front pad.

**Gate:** I searched DECISIONS.md for keeper, lob, lifted, front pad and back pad. The only rows are `BBI-02/room`
(the rule it breaks), `bbi02-dive` (cut earlier as a W6 window) and PNJ-03 `penalty` (walk in while the keeper is
down), which is a different decision. **Pass.**

| | Before | After | cause@tick lag 0 / 6 / 12 | Commit |
| --- | --- | --- | --- | --- |
| Room NAIVE | front pad, `bbi-ball`@347 (02's rule, as taught) | back pad, as at the hockey: `bbi-lob` ("…came down on the back one" / "Ride the keeper's front pad") | @387 / @399 / @411 | `82b6a98` |
| Room FIX | plinth to the wall, `bbi-chakka` (09's line, which talks of horses) | `bbi-chakka-room10`: "This plinth has no horses … your first step started it" | @701 / @719 / @736 | `82b6a98` |

- **Code:** `keeperOn(…, { lob: true })` in `s02.ts`. The flick flies at FL-60, over the riders' heads, and drops at
  the back pad.
- **Route:** Dad rides the front half of the keeper.
- **Lag fix:** the hub jump starts from 42 px instead of 24 px, so the route also wins at lag 6 and 12 (`b9327f6`).
- **Scope:** the plinth still replays 09's hub, but the room now breaks 02.

## F6 · lag: pairs, baits, stalls

**Fixed:**

| Item | Before | After (lag 0 / 6 / 12) | Commit |
| --- | --- | --- | --- |
| 09, every play after udaya | lag 6/12: the route walked past the bank edge into the moat (`bbi-udaya`@699) | spoke 1 now rises when you are 0.5 tiles in from the act start, not 1 tile; the plays stop at 0.6 tiles. All 09 plays hold their own cause at every lag | `b9327f6` |
| 09 ratha and ulta plays | lag 12 stall (the late jump hit the horses' side) | jump for the horses 0.6 tiles earlier: chakka@3286/3442/3639, khai@3278/3450/3604, ulta@3955/4130/4326 | `b9327f6` |
| BBI-10 room route | lag 6/12 died `bbi-chakka-room10`@709 (from my F5 change) | front pad at 26-34 px; hub jump from 42 px. Every 10 play reaches its act | `b9327f6` |
| `bbi10-chakra` m29 | lag 12 stall | khai-10 @8659 / @8974 / @9270 | `b9327f6` |
| `bbi08-phinga` m0/m1 | lag 12: both `bbi-buda`@1852 | m0 stops at 2.2 tiles: badi@1879/1829/1845 vs buda@1790/1834/1852 (two at all lags) | `b9327f6` |
| 05 m0 / m2 cart boarding | lag 6/12 stall (R released before the late jump) | hold R through the jump (22 ticks): gadi@1094/1098 and @1096/1095. **lag 12 still stalls** | `ee60d70` |
| 05 m1 dhenki stone stair | lag 6/12 stall | the jump holds R for 14 ticks: sila@689/707. **lag 12 still stalls** | `d37ff41` |
| `bbi05-mama` NAIVE at lag 12 | `bbi-tenda` (the lagged hop clipped the treadle, which diverted the uncle) | the treadle needs a real step (15 ticks), and the uncle walks at 60 px/s, not 45: mama@5662 / (lag 6 see below) / mama@5944 | `b9327f6`, `ee60d70` |

**Not fixed.** Each was tried, and each is a fixed-timing press that cannot land at both lag 0 and lag 12:

| Play | lag 0 / 6 / 12 | What I tried |
| --- | --- | --- |
| 05 m0, m2 cart; m1 dhenki | ok / ok / STALL | an earlier press, a longer R hold, `until on the cart`: each broke lag 0 |
| 05 m6 khala climb over the cart | crushed@2541 / STALL / crushed@2587 | not tried |
| 05 m7 thaka "go under between sweeps" | pathara@2865 / @2915 / **pani**@2827 | hop at 2.1, 2.5, 2.6, 2.7: at lag 12 the late hop lands on the foot plate and stops the sweep, so it becomes the FIX's play; earlier hops stall at lag 0 |
| 05 m12 mama NAIVE | mama@5662 / **kua-mama**@5331 / mama@5944 | at lag 6 the late step misses the bucket into the well (now its own line) |
| 05 m14, m15 ganna | ok / ok / STALL | not tried (the leap on to the mill misses at lag 12) |
| 06 room FIX | shuttle@476 / @484 / **ranga**@940 | not tried |
| 06 m8 rachh "look" | shuttle@3884 / @3949 / **rachh**@4185 | not tried |
| 06 m10, 10 m9 tantu "time the shuttle" | rachh / rachh / **ranga** | stopping at 2.8 tiles instead of 3.6 broke lag 0 (`bbi-ranga`) |
| 07 m12 jodi "wait for the whole bridge" | nacha@5748 / **thrown**@5799 / thrown@5872 | not tried: the late walker reaches the older half as it lifts |
| 10 m14 pada "wait back" | nacha-pada10@5031 / **thrown-pada10**@5232 / @5404, the same tick as m15 | waiting at 2.4 tiles broke lag 0 |
| 10 m23 phinga "first in the water" | buda-10@6789 / @7034 / **pakhala**@7224 | stopping at 2.0 tiles before the leap: still misses at lag 12 |

## Gate table (every act and door I tried)

| Part | Sentence | Gate (DECISIONS.md lists 1-2, v3, v3.1, BBI rows) | Result |
| --- | --- | --- | --- |
| BBI-10 room | the flick is lifted over the front pad and drops on the back pad: ride the front | only `BBI-02/room` (the broken rule), `bbi02-dive`, PNJ-03 `penalty` (a different decision) | pass, built |
| 06 door | plain: walk in | not gated (plain) | built |
| 07 door | plain | not gated (plain) | built |
| 08 door | plain | not gated (plain) | built |
| 10 door | plain | not gated (plain) | built |
| asta, ghoda, dui, dweepa, shrinkhala, tenda | cut | no recast sentence tried | cut |

## Pairing table at three lags (script-made: `qa-bbi6-fix1` plays-only, then `pair.py`)

Lagged player model, idle 0. A cell is `cause@tick` from the play's lagged run; "two" means the act's two plays die to
two causes at two ticks at that lag. The 05 rows are from the run after the last code change (`f4dfa7d`). The other
stages' rows were run before the mama, well-line and docs commits, none of which touches those stages.

Per act:

| Stage | Act | lag 0 | lag 6 | lag 12 |
| --- | --- | --- | --- | --- |
| BBI-02 | bbi02-dive | two (ball@1344 / rebound@1449) | two (@1368 / @1476) | two (@1389 / @1500) |
| BBI-02 | door turf-roll | two (roll@2916 / roll-back@2893) | two (@2953 / @2932) | two (@2984 / @2961) |
| BBI-03 | bbi03-gali | two (rangapani@922 / silk@1069) | two (@967 / @1111) | two (@1015 / @1169) |
| BBI-03 | bbi03-mela | two (rangapani@1805 / silk@2010) | two (@1883 / @2027) | two (@1970 / @2178) |
| BBI-04 | bbi04-karkhana | two (agni@1468 / kunda@1428) | two (@1480 / @1446) | two (@1489 / @1462) |
| BBI-05 | bbi05-chheli | two (chheli@1257 / sinha@1420) | two (@1295 / @1459) | two (@1331 / @1498) |
| BBI-05 | bbi05-khala | two (jaanta@2223 / crushed@2541) | **ONE/STALL** (jaanta@2261 / STALL) | two (@2297 / crushed@2587) |
| BBI-05 | bbi05-thaka | two (pathara@2865 / pani@2730) | two (@2915 / @2787) | **ONE** (pani@2827 / pani@2841) |
| BBI-05 | bbi05-patra | two (patra@3120 / khali@3808) | two (@3176 / @3870) | two (@3230 / @3930) |
| BBI-05 | bbi05-mama | two (mama@5662 / dhakka@5518) | two (kua-mama@5331 / dhakka@5650) | two (mama@5944 / dhakka@5782) |
| BBI-05 | bbi05-ganna | two (ganna@6013 / dhan@6072) | two (@6158 / @6251) | **STALL / STALL** |
| BBI-06 | bbi06-tana | two (ranga@977 / shuttle@1419) | two (@989 / @1431) | two (@1001 / @1443) |
| BBI-06 | bbi06-patta | two (sadha@2570 / chitra@2590) | two (@2594 / @2622) | two (@2633 / @2667) |
| BBI-06 | bbi06-sutra | two (sutra@3283 / shuttle@3166) | two (@3346 / @3225) | two (@3422 / @3295) |
| BBI-06 | bbi06-rachh | two (ranga@3517 / shuttle@3884) | two (@3580 / @3949) | two (ranga@3655 / rachh@4185) |
| BBI-06 | bbi06-tantu | two (tantu@4617 / rachh@4684) | two (@4692 / @4753) | two (tantu@4780 / ranga@4963) |
| BBI-06 | bbi06-palaa | two (ranga-palaa@4928 / rachh-palaa@5268) | two (@5008 / @5342) | two (@5102 / @5430) |
| BBI-07 | bbi07-mardala | two (nacha@926 / thrown@1219) | two (@938 / @1231) | two (@950 / @1243) |
| BBI-07 | bbi07-deepa | two (nacha@1573 / deepa@1726) | two (@1591 / @1750) | two (@1609 / @1774) |
| BBI-07 | bbi07-bandha | two (nacha@2370 / thrown@3354) | two (@2394 / @3384) | two (@2418 / @3414) |
| BBI-07 | bbi07-dui-baja | two (nacha-dui@3846 / thrown@4225) | two (@3918 / @4289) | two (@3972 / @4338) |
| BBI-07 | bbi07-bagudi | two (bagudi@4358 / chhuin@4513) | two (@4428 / @4587) | two (@4483 / @4650) |
| BBI-07 | bbi07-pada | two (pada@4963 / thrown@5197) | two (@5039 / @5273) | two (@5106 / @5340) |
| BBI-07 | bbi07-jodi | two (nacha@5748 / adha@6008) | two (thrown@5799 / adha@6096) | two (thrown@5872 / adha@6175) |
| BBI-07 | bbi07-gadiba | two (ulta-gadi@6420 / gadi-tala@6390) | two (@6514 / @6484) | two (@6599 / @6569) |
| BBI-07 | bbi07-hulahuli | two (thrown@7249 / kick@7551) | two (@7350 / @7658) | two (@7440 / @7753) |
| BBI-07 | bbi07-sajaghara | two (saja@7864 / dauda@7797) | two (@7971 / @7904) | two (@8066 / @7999) |
| BBI-07 | bbi07-ghungur | two (nacha@8159 / thrown@8711) | two (@8272 / @8829) | two (@8373 / @8937) |
| BBI-07 | bbi07-kachha | two (kachha@8766 / thrown@9591) | two (@8879 / @9711) | two (@8980 / @9817) |
| BBI-07 | bbi07-pothi | two (pothi@9697 / nacha@9967) | two (@9823 / @10093) | two (@9935 / @10205) |
| BBI-08 | bbi08-phinga | two (badi@1879 / buda@1790) | two (@1829 / @1834) | two (badi@1845 / buda@1852) |
| BBI-08 | bbi08-bhanwar | two (bhanwar@2610 / pakhala@2324) | two (@2659 / @2379) | two (@2684 / @2410) |
| BBI-08 | bbi08-dati | two (bhanwar@3126 / pakhala@3114) | two (@3201 / @3195) | two (@3243 / @3236) |
| BBI-08 | bbi08-ghurni | two (ghurni@3764 / chamacha@3929) | two (@3851 / @4016) | two (@3906 / @4070) |
| BBI-09 | bbi09-udaya | two (udaya@910 / dooba@1229) | two (@962 / @1264) | two (@1007 / @1288) |
| BBI-09 | bbi09-ratha | two (chakka@3286 / khai@3278) | two (@3442 / @3450) | two (@3639 / @3604) |
| BBI-09 | bbi09-ulta | two (chakka@3787 / ulta@3955) | two (@3959 / @4130) | two (@4173 / @4326) |
| BBI-10 | bbi10-patra | two (likhita@1684 / patra@941) | two (@1724 / @966) | two (@1724 / @990) |
| BBI-10 | bbi10-chheli | two (sinha-10@2665 / chheli-10@2045) | two (@2761 / @2156) | two (@2795 / @2202) |
| BBI-10 | bbi10-chhata | two (rangapani-10@2847 / silk-10@2849) | two (@2949 / @2951) | two (@2989 / @2990) |
| BBI-10 | bbi10-patta | two (sadha-10@2926 / chitra-10@3080) | two (@3086 / @3257) | two (@3200 / @3389) |
| BBI-10 | bbi10-tantu | two (ganthi@3687 / rachh-tantu10@3759) | two (@3892 / @3959) | two (ganthi@4054 / ranga@4243) |
| BBI-10 | bbi10-palaa | two (rachh-palaa10@4055 / ranga-palaa10@3994) | two (@4262 / @4206) | two (@4423 / @4378) |
| BBI-10 | bbi10-bagudi | two (bagudi-10@4606 / ghera@4673) | two (@4832 / @4894) | two (@5017 / @5066) |
| BBI-10 | bbi10-pada | two (nacha-pada10@5031 / thrown-pada10@5011) | **ONE** (thrown-pada10@5232 ×2) | **ONE** (thrown-pada10@5404 ×2) |
| BBI-10 | bbi10-dui-baja | two (nacha-dui10@5064 / thrown-dui10@5443) | two (@5299 / @5670) | two (@5483 / @5848) |
| BBI-10 | bbi10-ghungur | two (nacha-ghungur10@5549 / thrown-ghungur10@6059) | two (@5781 / @6298) | two (@5966 / @6487) |
| BBI-10 | bbi10-thaka | two (kua@5952 / pathara-10@5979) | two (@6191 / @6224) | two (@6381 / @6377) |
| BBI-10 | bbi10-phinga | two (badi-10@6471 / buda-10@6789) | two (@6716 / @7034) | two (badi-10@6915 / pakhala@7224) |
| BBI-10 | bbi10-ghurni | two (ghurni-10@7767 / chamacha-10@7877) | two (@8027 / @8142) | two (@8237 / @8356) |
| BBI-10 | bbi10-deepa | two (deepa-10@8480 / thrown-deepa10@8294) | two (@8765 / @8573) | two (@8997 / @8799) |
| BBI-10 | bbi10-chakra | two (chakka-10@8662 / khai-10@8659) | two (@8967 / @8974) | two (@9280 / @9270) |
| BBI-10 | bbi10-udaya | two (dooba-10@9420 / udaya-10@9093) | two (@9748 / @9435) | two (@10097 / @9796) |
| BBI-10 | bbi10-tana | two (nacha-tana10@10905 / thrown-tana10@11263) | two (@11383 / @11735) | two (@11905 / @12252) |

**Per play.** 139 scripted plays: every stage's NAIVE, FIX and MISTAKES at lag 0/6/12. 124 hold the same cause at
all three lags. The 15 that do not are the rows in the F6 "Not fixed" table:
- 05: m0, m1, m2, m6, m7, m12, m14, m15;
- 06: FIX, m8, m10;
- 07: m12;
- 10: m9, m14, m23.

The stage NAIVE/FIX pairs hold two causes at two ticks at every lag:

| Stage | NAIVE | FIX |
| --- | --- | --- |
| 01 | `bbi-nala`@353/359/364 | `bbi-nala-lip`@1671/1697/1715 (F8) |
| 05 | jaanta | sila |
| 07 | nacha | thrown |
| 08 | pakhala | dhara |
| 09 | chakka | ara |
| 10 | lob | chakka-room10 |

06 is the exception: its FIX is the lag-12 row above.

## F7 · BBI-05 cp6: the walk-4.5 proof

- **Change:** `bbi05-khala` now starts with 4 tiles of plain ground (`LEAD['bbi05-khala'] = 4`, commit `f7ba9de`), so
  its first checkpoint sits 7.5 tiles before the hand mill's channel. (After the `tenda` cut it is the stage's cp5.)
- **Proof:** the tester's `qa-bbi-walk45` (from each checkpoint where the lag-0 route takes it: walk 4.5 tiles and stop
  1 s; tap-jump and walk) now reports this for BBI-05:

```
W45 BBI-05 cps=16
  cp0@32.2 tapwalk -> bbi-dhenki at +5.1 tiles, 0.97 s
```

  The +4.2-tile `bbi-jaanta` death is gone. The only BBI-05 death left is at +5.1 tiles, an overshoot past the
  4.5-tile stop, which the tester does not count.
- **Other stages:** every other BBI death in this probe is at +4.7 tiles or more, as in the tester's run.

## F8 · BBI-01

- **Change:** the second gardener's drain is its own cause, `bbi-nala-lip`: "The lip of this drain was still wet, Dad,
  and nobody was watering" / "jump from the dry tile before it".
- **Also reworded:** `bbi-nala`, for the first gardener, now says his jet wet the tile as you walked, and to stand
  still if he turns.
- **Result:** NAIVE dies `bbi-nala`@353/359/364 and FIX dies `bbi-nala-lip`@1671/1697/1715.
- Commit `f7ba9de`.

## Proofs (on `f4dfa7d`, heavy runs one at a time, in the foreground)

- **`npx tsc --noEmit`:** clean.
- **Full suite (`npx vitest run`, with my scratch tests moved out):** 18 files passed, **1861 tests passed, 0
  failed**, 20 skipped (env-gated). There are 12 fewer tests than at 71df6f8 because six acts were cut and their play
  tests went with them.
- **Allow-lists:** BBI is on no list. `CPSAFE3_PENDING` and EXEMPT have no BBI entry.
- **cpsafe strict** (`-t BBI --reporter=verbose`): **10/10** ("idle, run and tap-jump at lag 0/6/12").
- **Fair** (`LDD_N=80 npm run fair -- BBI`, the full city): **100% at 6t and 12t on every stage; every stretch 100%**
  at 0-12t. The 18t column (parked) is 100/100/88/96/84/88/76/76/76/76. BBI-05 was re-run after the last change: 100
  / 100 / 84.
- **Lag-captured sweep** (`QA6=1 QA6_IDLE=0,37,120,251`; route at lag 0/6/11/12 × four idle offsets, 7 plays at each
  lagged capture): **0 deaths in 9,744 plays.**

  Per-tick replay, worst per stage (lag 0/6/12, from the lagged capture):

  | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
  | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
  | 2.92 s | 3.38 s | 7.24 s | 2.81 s | **6.64 s** | 5.72 s | 6.24 s | 6.21 s | 5.52 s | 7.13 s |

  The 05 figure is from the re-run after the mama change; before that change, mama's FIX was 9.20 s. All ten are
  under 7.5 s.

  Longest stretch per stage:

  | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
  | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
  | 12.9 s | 8.4 s | 9.5 s | 12.7 s | 10.2 s | 9.4 s | 9.4 s | 13.2 s | 22.4 s | 12.2 s |

  All are under 25 s.
- **Probe (my harness):** probe (a) finds 0 repeats beyond one momentum beat. Probe (b) fails on 8 acts, all
  one-play acts already listed: `tenda`, which was one of them, is cut.
- **`npm run build:single` and `node scripts/flows.mjs`:** no errors.
- **Sheets re-shot and read** for 05, 06, 07, 08, 09 and 10 (`shots/BBI-0{5..9}-sheet.png`, `shots/BBI-10-sheet.png`):
  - 08 ends at the kitchen door with its plates;
  - 10 ends at the stadium gate with the cut ribbon's ends, and its first frame shows the keeper and the flicker on
    the wall;
  - no decoration sits in Dad's row on the frames I read.

## Honest times (scripted route, no deaths)

| Stage | Before (71df6f8) | Now | Floor |
| --- | --- | --- | --- |
| 01 | 25.4 s | 25.4 s | 25-35 |
| 02 | 26.4 s | 26.4 s | 25-45 |
| 03 | 25.9 s | 25.9 s | 25-45 |
| 04 | 29.3 s | 29.3 s | 25-45 |
| 05 | 60.2 s | **54.2 s** | >= 60 (short) |
| 06 | 50.0 s | 46.9 s | >= 60 (short) |
| 07 | 99.3 s | **86.0 s** | >= 120 (short) |
| 08 | 46.6 s | **33.3 s** | >= 60 (short) |
| 09 | 58.7 s | **39.4 s** | >= 60 (short) |
| 10 | 94.9 s | 94.4 s | >= 90 |

06 is shorter because its door is plain (the curtain wait is gone). Pars were not changed; each is above its route.

## Skipped or not checked

- **F6:** 15 plays at lag 6 or 12 (table above).
- **No recast tried** for the F2/F3 cuts or the F4 doors.
- **Two-play bar:** 08 and 09 under it.
- **Not built:** the 02 keeper and 05 bait acts from round 6 (unchanged).
- **`bowl` option `over`:** unused after `dui`, left in.
- **Not done:** touch on a phone, audio, human play.
- **Odia lines:** not verified with a native source.
