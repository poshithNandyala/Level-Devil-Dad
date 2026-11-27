# SHL · Shillong (Meghalaya): build report, round 1 (01-06 built, 07 core, 08-10 not built)

**Branch** `city/shl` in `/local/home/saiposh/personal/ldd-wt/shl`, cut from `origin/develop` f8288e9 (v0.17.2), tip `de68fc7cbda8523203d9cd41ec8f708fed5267bf`.
Nothing pushed, no version bump. `git diff --name-only origin/develop` shows only `src/game/cities/shl/`, `tests/cities/shl.ts`, `docs/cities/SHL.md`, my row in `docs/CITIES.md` and an SHL section in `docs/MECHANICS.md`. The scratch sweep file `tests/qa/qa6.test.ts` (the tester's qa6 copied) is untracked and not committed; a copy is in this folder as `qa6.test.ts.txt`.
Budget: 180 min from 05:30 UTC (11:00 IST); stopped at 07:00 UTC with the report written. Built in this round: the module, **stages 01-06**, and **the core of 07** (room, one act, door: not a marathon yet). Not built: **08, 09, 10** (placeholders named for their slots, so the module registers and routes; see "Honest" below).

## Honest: where the city stands

| Stage | Slot / shape | Route clear time | Floor (goal v21) | Short? Why |
| --- | --- | --- | --- | --- |
| 01 Kumno, Shillong! | SHL-T tour | 13.5 s | ~15 s shared course | at the bar (the shared course; the SHL bite is the fake first drop and the drifting cloud) |
| 02 Pine Peak | SHL-07 std | 41.6 s | 25-45 s | in the bar, at the top: most of it is waiting for a bank and the sun to line up (two banks pass every 11.7 s; the sun is covered 2 s in 12). Par is set to 40 and must be reset to ~56 |
| 03 Sway | SHL-08 std | 25.3 s | 25-45 s | at the bar |
| 04 Knup | SHL-01 std | 12.4 s | 25-45 s | **short by 12.6 s**: three stretches of hooks, rain, branch and arches with no waiting beat. Every twist I could think of in the time that adds a wait was a shelter/lull read owned elsewhere (SVP-01 lull, TVM-01 tarp), so I left it short rather than pad it. Needs one more act with a new decision (a candidate: the knup is heavy when soaked, a jump after heavy rain is lower, so a hook after rain cannot be reached until it drips off: "shake it before the hook") |
| 05 Seven Sisters (HWIK) | SHL-10 long | 21.6 s | >= 60 s | **short by 38 s**: one sister in the room, two in `shl05-ar`, two at the basin, one at the door: six of the seven, each a 2-5 s wait. Needs more sisters with new reads (the seventh, the sound beat) and longer walks between |
| 06 Root Guide | SHL-02 long | 23.5 s | >= 60 s | **short by 36 s**: roots grow in 3.5 s (they were 5 s; the FIX replay was 8.1 s at lag 12 against the 7.5 s bar, so growth was shortened). Needs two or three more gorges with new decisions (a root that must be guided from the far side; the double-decker's top deck on a different timer, bible concept 2) |
| 07 Mawsmai (marathon) | SHL-04 | 19.4 s | >= 120 s | **short by 100 s**: the core only: a room of three stalactites on their own drips, the gallery (seven dripping together, the labelled momentum beat) and the column door. No shelter beat, no sound beat, no tap twist yet (the head-bump freeze exists in the code and the hint, but no act asks for it). `lives: 'act'`, shape marathon |
| 08 Wettest Desert (HWIK) | SHL-05 | not built | >= 60 s | placeholder room. Decision checked and free (below) |
| 09 Eight-Day Market (tough) | SHL-06 | not built | >= 60 s | placeholder room. Decision checked and free (below) |
| 10 Down Seven Hundred (finale) | SHL-12 | not built | >= 90 s | placeholder room. Law 7 callbacks planned against 01-06 (below) |

Other bars not met this round:
- **Module guard** (`tests/modules.test.ts`): fails on "a NAIVE play for every stage" (08-10 have none). Everything else in it passes (FIX for 7 of 10 >= 5, one hidden item in every stage, a route for every act, a policy for every ending, fair list, 9 intros, no TODO, `shl-` prefix on every key). So **`npm test` is 1 failed / 1742 passed**, the one failure being that guard.
- **Replay to a death <= 7.5 s**: SHL-02 `shl02-sngi` MISTAKE m0 ("jump to the third beam the moment it looks lit") replays in 11.1 / 11.2 / 11.3 s at lag 0/6/12: the play waits for the bank's end to reach the third beam, up to a whole bank cycle. SHL-07 `shl07-krem` m0 ("stop under the fourth stalactite") replays in 8.18 / 8.13 / 4.22 s: the wait for the gallery's break (up to 4.2 s open + 1.6 s shut) plus the run. Everything else is under 7.5 s (worst 6.66 s, SHL-06 FIX at lag 12).
- **Two-play acts**: every act has a scripted death that differs from the stage NAIVE; a FIX that dies to a DIFFERENT cause at a different tick exists for every stage and for most acts (table below). Two scripted pairs are not two traps: SHL-03 "stand still on the boats' span" dies to the same wake at the same tick as the stage FIX (both are on the span when the boat passes); SHL-04 m1 is the stage FIX itself listed again. 05 and 06 have only 2 acts each and 07 has 1 (bar: at least 5 two-play acts per long stage). The marathon's shelter and sound beats do not exist yet.
- **Sheets**: shot and read for the seven built stages (`shots/SHL-01-sheet.png` .. `SHL-07-sheet.png`); every route reaches the exit; no broken prop seen. Not shot for 08-10 (placeholders). The sheets show the guide poles of 06 and the stalactites of 07 reaching into the sky band: cosmetic, to be shortened.
- **Note for other builders**: recording the routes for the sheets (`LDD_ENDREC=1 npx vitest run tests/endrec.test.ts`) rewrites every stage's `/tmp/rec/<id>.json`, not only SHL's. Other cities' recordings in `/tmp/rec` are now from develop f8288e9 + SHL; re-record before shooting.

## Proof

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npm test` (full suite, once, at the end, at de68fc7's code) | **1 failed, 1742 passed, 21 skipped** (18 files; 14 env-gated files skipped). The one failure: `modules.test.ts > SHL > has a NAIVE play for every stage` (08-10 unbuilt) |
| SHL's own share (`npx vitest run tests/levels.test.ts tests/checkpoints.test.ts tests/cpsafe.test.ts tests/items.test.ts tests/allocation.test.ts tests/jumpaudit.test.ts -t SHL`) | **92 passed, 0 failed**: builds, route wins, deterministic, every rival variant, NAIVE dies, FIX dies, every MISTAKE dies with its cause, checkpoints replay exactly, cpsafe (idle 4 s, run 0.3 s, tap-jump at lag 0/6/12 from every checkpoint of 01-07: all pass), hidden item, allocation meta = slot, jump audit |
| cpsafe | green for SHL-01..07 (strict mode: SHL is on no allow-list and not in `CPSAFE3_PENDING`) |
| `LDD_N=80 npm run fair -- SHL-01..07` (once, at the end) | 01 100/100/100 · 02 100/100/88 · 03 100/100/100 · 04 100/100/100 · 05 100/99/81 (one `shl-wah` at the basin stretch, 99%) · 06 100/100/84 · 07 100/100/100 (6t/12t/18t); every stretch >= 99% at 0-12t (`fair80.txt`) |
| `npm run build:single && node scripts/flows.mjs` | builds (886 ms); flows: **no errors** (CHROME_PATH = the shared Playwright chromium_headless_shell-1228) |
| Sheets | `/local/home/saiposh/personal/ldd-inbox/reports/cities/shl/shots/SHL-0[1-7]-sheet.png`, seven frames along each route; read: every route reaches the exit, the cloud banks, beams, dish, deck, boats, hooks, knup, falls, marks, roots, guides, stalactites and cave all draw |
| Lag-captured sweep (qa6, lag 0/6/11/12 x spawn idle 0/37/120/251, 7 plays per capture; once, at the end) | **0 deaths in 3,584 plays**; table below |

## Pre-build gate: every slot's decision against the registry

Checked before building, against `DECISIONS.md` lists 1-2 (shipped + in-flight), the v3/v3.1 families and the archetype table. Grep terms used per slot: cloud/mist/fog/sunbeam; sway/swing/cadence/rhythm; wide/umbrella/stilt/carry/doorway; stream/dry/mark/level/gauge; root/grow/choose/guide; drip/stalactite/tap/crush; tank/rain/shadow/fills; stall/market/day/colour; tarp/first drop.

| Slot | Decision (one sentence) | Closest row(s) | Why different |
| --- | --- | --- | --- |
| 01 fake-first-raindrop | A drop that falls where there is no cloud means nothing; rain comes only under the cloud shape, on a beat, and the cloud drifts to whoever stands near it waiting: pass under it right after it empties. | TVM-01 tarp (let it empty before passing), SVP-01 (shelter under the awning for the lobes, cross in the lull) | the cue is a lie outside the cloud; there is no shelter: standing brings the cloud to you (a different death), the answer is to read the cloud shape, not the drop |
| 02 cloud-bank-platform-thins-edge | A cloud bank holds you only where a beam lights its thick middle; its ends are thin whatever the light does. | GNR-03 (beam is a stair, board after its cloud passes), LKO-04 `badal` (inside the cloud's shadow every cup holds), GTK-07 (fog hides the road; jump where the rope stops) | the cloud itself is the floor and the decision is position on its body (middle, not end) plus light; GNR's is timing on a beam, LKO's is shadow on the ground, GTK's is a rope reading |
| 03 bridge-swing-matches-step-cadence | Your own pace is the swing: run and the deck throws you, walk in bursts and it stays flat; a wake adds a full swing, so let a boat pass from the tower. | JAI-03 (pots on your head sway; let them settle before every jump), PAT-04 (wait for the oncoming porters), S9 ruling (don't stop on the moving floor = KVT-08) | JAI's sway is caused by breezes and the answer is patience before a jump; here the sway is caused by running and the answer is pace. The wake beat is "be off the span", not "wait for a person"; nothing here says "don't stop" |
| 04 wide-gear-hitbox | Read each stretch: the knup on for the wet, off for the low; the gear is toggled per gap at hooks, and a small knup fits the low arch but not heavy rain. | BPL-07 `rakhdo` (put the tawa down to pass the magnets), RPR-02 `utar` (too tall for the doorway on stilts), HYD-05 `tiny` (shrink to fit), BOM-07 (carrying the dabba you cannot jump) | those shed the gear once and never take it back; here it must be put back on (the rain after the arch kills bare Dad), so the decision is which state each stretch needs, and in act 2 which size |
| 05 one-stream-schedule-mark (HWIK) | The white mark is the moment: cross when the water sits on it; the visually safest moment (dry bed) is the lure, the fall comes back with no warning. | DIS-02 (the level post forecasts the NEXT bars), CCU-07 `baan` (white line on the water warns of the bore), AMR-05 `speed` (between the white lines), RNC-07 `khoh` | DIS reads a forecast of positions, CCU's line is a warning of a wave, AMR's is a speed check; here the mark is a go-signal with a short window and the "dry" state is the trap. The tell is drawn from the first frame |
| 06 choose-guide-root-grows | Pick which root to guide (the obvious short one lands in the spray, the long one from the rock lands dry); the choice is permanent; a root you grew keeps growing if you stand on its tip; every guide you touch grows a root. | DMN-07 (stay behind the brush), RPR-04 (wait under the sack for a refill), SVP-09 (green roots hold, grey crumble), RPR-07 `saal` (go the instant the bridge touches your bank) | you choose the line first and wait; nothing is read by colour; no "go when complete" rule (the roots stay). The path-guide act is "hop the trigger you do not want" |
| 07 drip-growth-gate-pairs (core built) | A stalactite closes one step per drip and is a wall until it breaks; pass while there is room, counting drips; a head bump freezes only the one you hit, for a while. | SVP-05 `choona` (a hop raps the formation, it drips, wet floor slides you), BLR-07 `crusher` (boulder settles when you stand still), RPR-07 `saal` (go when the bridge is whole) | growth is driven by audible drips and is the gate itself, not a slick; the gallery's "go at the break, keep going" is the momentum beat and is labelled; the freeze (built, not yet asked for by an act) is narrower than it looks |
| 08 tank-fills-when-not-under-rain (not built) | The rain seeks you: the tank fills only while you are out of the cloud's shadow; when the cloud is too big to escape, stand under the tank's own roof so the rain on you drains into it. | GTK-07 `thau` (wait under the awning for the cloud to lift), S12 ruling, SVP-08 (rain direction, lee end), RNC-04 (lightning hits the tallest under the cloud) | the roof is a tool to aim the rain, not a shelter from a passing hazard; the meter is the tank; free in the registry |
| 09 day-cycle-rearranged-stalls (not built) | Market days advance with your checkpoints: the rows re-arrange one step a day; the day board at each row says which stalls stand today; at the last row a stallholder flipped the board, so trust the cycle, not the board. | PNJ-06 (stand on the colour that comes up), BOM-07 holi (mats of the thrown colour hold), LKO-09 (flag colour steers the flock) | progress-driven rearrangement with a stale-board betrayal, not time-driven colour matching; free |
| 10 finale (not built) | Callbacks that break 01-09: a cloud that empties off its beat, a bank whose END holds (the middle thins), a span that must be run (a stop tilts it), a hook that must not be touched, a mark that lies once (the board), a root that must be guided from the far side, on a swaying span whose stalls re-arrange at each checkpoint. | own callbacks only | law 7 |
| R1 Full Sumo / R2 Soundcheck | not used | | no collision needed a reserve |

## Acts: one row each

Seconds are the act's share of the route (estimated from the route's structure: walking at 8.75 tiles/s plus the scripted waits), not a separate measurement.

| Stage | Part | Family | Decision | Registry check | NAIVE cause@tick | FIX / second play cause@tick | s (est.) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | tour (view point) | fake-first-raindrop | the drop outside the cloud is nothing; pass under the cloud right after it empties; standing brings it to you | TVM-01 / SVP-01: see gate | `shl-slap`@878 (ran under the cloud) | `shl-lyoh`@1237 (stood outside and waited; the cloud drifted over) | 13.5 |
| 02 | room | cloud-bank-platform-thins-edge | step only where a beam lights the bank's thick middle | GNR-03 / LKO-04 / GTK-07: see gate | `shl-edge`@146 (walked on to the thin end) | `shl-dum`@161 (hopped to the lit beam, ran on into the unlit part) | ~9 |
| 02 | `shl02-sngi` | same family | a lit END is still an end: wait for the middle under the third beam | same decision as the room, sharpened (the ladder's A3) | m0 `shl-edge`@1759 (jumped to the third beam as the end arrived) | (the room's FIX is the fix here too) | ~12 |
| 02 | `shl02-lyoh` | same family | while a high cloud covers the sun nothing holds: the whole crossing is decided on the bank | new read inside the family (sun, not bank) | m1 `shl-dum`@2289 (crossed by the bank windows, never mind the sun) | - | ~15 |
| 02 | door `shl-dish` | - | wait outside the swept tiles until a sweep has gone | timing gate; no shipped dish | - | - | ~5 |
| 03 | room | bridge-swing-matches-step-cadence | bursts, not a run | JAI-03: see gate | `shl-sway`@240 (ran the deck) | `shl-wake`@1077 (bursts all the way, on the span when the boat passed) | ~7 |
| 03 | `shl03-wake` | same family | the wake is a full swing to anyone on that span: let the boat pass from the tower | not "wait for the oncoming person" (nobody is on your path); a sky/water hazard timed from a tower | m0 `shl-wake`@1077 (stood still on the span) **same tick and cause as the FIX: flagged** | - | ~9 |
| 03 | `shl03-wet` | same family | wet planks slide you on after a stop and the slide swings the deck: stop earlier, stand longer | new read (anticipation) inside the family | m1 `shl-slip`@2043 (dry-span bursts on the wet span) | - | ~6 |
| 03 | door `shl-tollbar` | - | arrive calm: stop short of the bar until the red line is gone | ties the stage rule to the door | - | - | ~3 |
| 04 | room | wide-gear-hitbox | knup on for the rain, off for the branch, on for the awning | BPL-07 / RPR-02 / HYD-05: see gate | `shl-slap`@92 (ran into the rain bare) | `shl-dieng`@221 (took the knup and kept it; the branch) | ~4 |
| 04 | `shl04-iew` | same family | read the arch, not the habit: a tall arch fits the knup; the hook before it is a lure | the lure hook = the countermeasure becomes the vulnerability (law 2) | m0 `shl-slap`@627 (hung it up at the lure hook, rain beyond the tall arch) | m1 = the stage FIX repeated (`shl-dieng`@221): **flagged as a duplicate** | ~4 |
| 04 | `shl04-khynnah` | same family | a small knup fits the low arch and the drips but not heavy rain: swap at the hooks | new read (size) inside the family | m2 `shl-slap`@1176 (kept the small one into heavy rain) | m3 `shl-lintel`@1003 (kept the big one into the school lane) | ~3.5 |
| 04 | door `shl-halfdoor` | - | hang the knup outside the half-door | the stage rule at the door | - | - | ~1 |
| 05 | room | one-stream-schedule-mark | cross on the mark, not after | DIS-02 / CCU-07 / AMR-05: see gate | `shl-um`@175 (ran into the full fall) | `shl-wah`@636 (waited for the dry bed, the fall came back) | ~6 |
| 05 | `shl05-ar` | same family | thinning is not the mark (a sister that never goes dry) | the same read with the lure removed: the A2 "wait for dry" has nothing to wait for | m0 `shl-um`@1303 (went as the second sister started to thin) | - | ~8 |
| 05 | `shl05-pung` | same family | two schedules must agree: cross the basin only when both sisters sit on their marks | a conjunction read; no shipped row asks two timers to agree | m1 `shl-pung`@2129 (crossed on the nearer sister's mark alone) | - | ~5 |
| 05 | door `shl-pool` | - | the seventh sister: on the mark through the pool | the room rule at the door | - | - | ~3 |
| 06 | room | choose-guide-root-grows | the long root from the rock lands dry; the short lands in the spray; the middle gives up | DMN-07 / RPR-04 / SVP-09: see gate | `shl-gorge`@213 (jumped the gorge) | `shl-spray`@703 (guided the short root, walked into the spray); m1 `shl-gorge`@487 (the middle root) | ~10 |
| 06 | `shl06-sprout` | same family | a root you grew keeps growing: stand on its tip and it sprouts the next span | not "go when the bridge completes" (RPR-07): the root stays; the decision is to stand on a specific tile | m0 `shl-gorge`@1042 (jumped the second gorge) | - | ~6 |
| 06 | `shl06-kiang` | same family | every guide you touch grows a root: hop the guide in the path | the trigger-you-do-not-want; no shipped row | m2 `shl-jri`@2040 (walked into the guide) | - | ~3 |
| 06 | door `shl-rootdoor` | - | one guide, one root, wait, walk | the room rule at the door | - | - | ~4 |
| 07 | room | drip-growth-gate-pairs | pass each stalactite while there is room; count the drips | SVP-05 / BLR-07: see gate | `shl-shut`@283 (ran into the third, shut) | `shl-maw`@276 (stopped under the quick one to count; it came down) | ~8 |
| 07 | `shl07-krem` (labelled momentum beat) | same family | wait for the break, then run the whole gallery; a stop under any is the end | the one momentum beat of the stage | m0 `shl-maw`@1680 (stopped under the fourth to count) | - | ~8 |
| 07 | door `shl-column` | - | the slowest stalactite: wait for it to meet the floor and break, walk through | the room rule at the door | - | - | ~3 |

## Probe 1: same-tick FIX scan

For every stage: NAIVE vs FIX, and every MISTAKE vs both. Source: `/tmp/shl_plays.txt` (the debug runs above), copied here as `plays.txt`.

| Stage | NAIVE | FIX | Mistakes | Verdict |
| --- | --- | --- | --- | --- |
| 01 | shl-slap@878 | shl-lyoh@1237 | - | ok: different cause, 359 ticks apart |
| 02 | shl-edge@146 | shl-dum@161 | m0 shl-edge@1759, m1 shl-dum@2289 | ok: NAIVE/FIX differ in cause (15 ticks apart but different traps: the end vs the unlit middle); mistakes are in later acts |
| 03 | shl-sway@240 | shl-wake@1077 | m0 shl-wake@1077, m1 shl-slip@2043 | **m0 = FIX** (same cause, same tick): one trap counted twice; m1 ok |
| 04 | shl-slap@92 | shl-dieng@221 | m0 shl-slap@627, m1 shl-dieng@221, m2 shl-slap@1176, m3 shl-lintel@1003 | **m1 = FIX** (duplicate play); the rest differ in tick and place (m0 is the lure hook's rain, m2 the heavy rain of act 2) |
| 05 | shl-um@175 | shl-wah@636 | m0 shl-um@1303, m1 shl-pung@2129 | ok |
| 06 | shl-gorge@213 | shl-spray@703 | m0 shl-gorge@1042, m1 shl-gorge@487, m2 shl-jri@2040 | ok: three `shl-gorge` deaths are three gorges/roots (the room jump, the middle root's end, the second gorge) at different ticks |
| 07 | shl-shut@283 | shl-maw@276 | m0 shl-maw@1680 | ok: NAIVE and FIX are 7 ticks apart but different traps (the third, shut, walked into; the second, coming down on a stander) and different causes |

## Probe 2: identical-window scan

Grouped the way BBI did: acts by (what the NAIVE-like play dies of, what the second play dies of, and the decision asked). A group of more than one act is a repeat unless it is the stage's one labelled momentum beat.

| Stage | Groups | Repeats beyond one labelled beat |
| --- | --- | --- |
| 02 | room {edge, dum: lit middle}; `sngi` {edge: lit end}; `lyoh` {dum: sun} | the room and `sngi` ask the same read (lit thick middle), `sngi` sharpening it to the end under a lit beam: I count it as **one repeat window** (A3 of the ladder, not a new decision). `lyoh` is a new read. |
| 03 | room {sway: bursts}; `wake` {wake: off the span}; `wet` {slip: stop early} | 0 (three different reads) |
| 04 | room {slap, dieng: on/off}; `iew` {slap: the lure hook, on/off read}; `khynnah` {slap, lintel: size} | `iew` is the room's on/off read with a lure added: **one repeat window**; `khynnah` is new |
| 05 | room {um, wah: the mark}; `ar` {um: thinning is not the mark}; `pung` {pung: both marks} | `ar` is the room's read with the lure removed: **one repeat window**; `pung` is new |
| 06 | room {gorge, spray: which root}; `sprout` {gorge: stand on the tip}; `kiang` {jri: hop the guide} | 0 |
| 07 | room {shut, maw: count the drips, pass while open}; `krem` {maw: go at the break and keep going} | 0: `krem` is the stage's labelled momentum beat |

07's `krem` is the only labelled momentum beat (05 and 06 have none). The three repeat windows above are the ladder's A3 sitting in the first act of a standard-length stage; the next round should either label them or replace them.

## Lag-captured sweep (the tester's qa6, copied to `tests/qa/qa6.test.ts`, run once at the end)

For every built stage: the route at lag 0, 6, 11 and 12 and spawn idle 0, 37, 120 and 251 ticks; the checkpoint is taken wherever that lagged run takes it; the world is rebuilt by `replay()` at that tick; then idle 4 s, run 0.3 s after 0/6/12 ticks, tap-jump after 0/6/12 ticks (7 plays). `QA6=1 QA6_IDS=SHL-01,...,SHL-06 QA6_IDLE=0,37,120,251 npx vitest run tests/qa/qa6.test.ts --silent=false`. Raw: `qa6.txt` in this folder.

| Stage | Distinct capture points | Plays checked | Deaths | Longest stretch | Worst replay (lag 0 / 6 / 12) |
| --- | --- | --- | --- | --- | --- |
| SHL-01 | 5 | 560 | 0 | 6.4 s | 4.01 / 4.01 / 4.01 s (fix) |
| SHL-02 | 3 | 336 | 0 | 20.9 s | **11.08 / 11.20 / 11.27 s** (m0, waits a bank cycle) |
| SHL-03 | 6 | 672 | 0 | 6.9 s | 2.00 / 2.05 / 2.10 s |
| SHL-04 | 5 | 560 | 0 | 5.8 s | 2.28 / 2.28 / 2.28 s |
| SHL-05 | 5 | 560 | 0 | 6.2 s | 5.30 / 5.30 / 5.30 s (fix) |
| SHL-06 | 5 | 560 | 0 | 10.1 s | 5.86 / 6.08 / 6.66 s (fix) |
| SHL-07 | 3 | 336 | 0 | 13.3 s | **8.18 / 8.13 / 4.22 s** (m0, waits for the gallery's break) |

**0 deaths in 3,584 plays. Every stretch <= 25 s (longest 20.9 s, SHL-02 room+first act). Replay <= 7.5 s everywhere except SHL-02 m0 (11.3 s) and SHL-07 m0 (8.2 s at lag 0/6).** The SHL-02 and SHL-06 rows are from the second run after the fixes in 5ad3128 (the first run had 05 at a 37.6 s stretch, from a basin wait of two unsynchronised schedules, and 06's fix replay at 8.14 s; both fixed: the sisters at the basin now keep the same time, roots grow in 3.5 s).

### Per-tick replay (lag 0 / 6 / 12), from the last checkpoint to each death

| Stage | naive | fix | m0 | m1 | m2 | m3 |
| --- | --- | --- | --- | --- | --- | --- |
| SHL-01 | 1.02/1.02/1.02 | 4.01/4.01/4.01 | | | | |
| SHL-02 | 1.22/1.27/1.32 | 1.34/1.95/2.00 | 11.08/11.20/11.27 | 1.01/1.07/1.12 | | |
| SHL-03 | 2.00/2.05/2.10 | 1.40/1.33/0.98 | 1.40/1.33/0.98 | 0.67/0.89/0.89 | | |
| SHL-04 | 0.77/0.82/0.87 | 1.84/1.89/1.94 | 1.53/1.53/1.53 | 1.84/1.89/1.94 | 2.28/2.28/2.28 | 0.84/0.84/0.84 |
| SHL-05 | 1.46/1.51/1.56 | 5.30/5.30/5.30 | 2.74/2.74/2.74 | 4.08/4.08/4.08 | | |
| SHL-06 | 1.77/1.98/2.18 | 5.86/6.08/6.66 | 0.99/1.04/1.09 | 4.06/4.32/4.88 | 1.48/1.49/1.49 | |
| SHL-07 | 2.36/2.41/2.46 | 2.30/2.30/2.30 | 8.18/8.13/4.22 | | | |

## Language lines used (bible section 4 numbering; V = every Khasi word on the verified list)

| Where | Line | Mark |
| --- | --- | --- |
| hello / tour welcome | Kumno, Bah! Welcome to Shillong. \| How are you, sir? Welcome to Shillong. (1) | V |
| intro 02 | Kumno phi long, Dad? \| How are you, Dad? (2) | V |
| intro 03 (Tara's lie on the bridge) | Hooid, hooid, this way is safe! \| Yes, yes, this way is safe! (8) | V |
| intro 04 | Peit, rain! Put on the knup. \| Look, rain! Put on the knup. (43) | V |
| intro 05 (the lie: go on the dry bed) | Em, em, don't wait, just go! \| No, no, don't wait, just go! (9) | V |
| intro 06 (the lie: jump the gorge) | Tang one jump, Bah. Tang one. \| Only one jump, sir. Only one. (10) | V |
| intro 07 (Mawsmai) | Kumno! Ready for the hills? \| Hello! Ready for the hills? (5) | V |
| intro 08 | Sngewbha, Dad, mind the rain. \| Excuse me, Dad, mind the rain. (4) | V |
| intro 09 | Hooid Bah, the market is open. \| Yes sir, the market is open. (6) | V |
| intro 10 | Mo Dad, one last stage. \| Okay Dad, one last stage. (7) | V |
| taunts | 8, 11 (Ka don ha jan! Very near!), 12 (Nga biang here. You come!, the tour's lie under the cloud), 10 | V |
| beaten | 13 Em! Kumno did you do that?; 14 Map ïa nga, Dad. You won. | V |
| death | 16 Wet again. Nga la thait.; 17 Em, em! Try again, Bah.; 18 Sngewsih, Dad. Wan again.; and the bible's fallback for 15: Nga sngewsih, Dad. Try again. | V (15 was U: fallback used) |
| near | 19 Ka don ha jan, Dad. Peit!; 20 Tang a little more, Bah. | V |
| win | 21 Khublei shibun, Dad! You did it.; 22 Kmen! Kmen! Door is open. | V |
| flip | 25 Em, not that way, Dad! | V |
| cleared | Hooid! Shillong cleared, Bah. \| Yes! Shillong cleared, sir. (from 24) | V |
| brag | 27 Nga biang, nga biang, I know. | V |
| idle | 29 Wan, Dad. Don't just stand.; 30 Peit the sky, Bah. Rain coming.; 31 Nga la thait, Dad. Hurry. | V |
| seven (seventh death) | Em, em! Seven falls. Wan again. \| No, no! Seven falls. Come again. (new; em, wan are V words) | V words, new frame |
| lastLife | 34 Ym fall now, Dad. | V |
| NPC (tour shouts, knup stall) | 36 Ka bai kali kan long katno?; 38 Bud ïa kane ka surok, Bah.; 35, 41, 45 as the tour guide's facts; 43 at the knup stall | V |

Tara's lines per stage: her intro (above) at each room's start, her taunts and beaten lines from the shared set; she tells the truth in 02 and 07 (greetings) and lies in 01, 03, 05, 06 (the lie is the move the trap waits for).

## Art, sound

Palette from the bible (grey-blue monsoon sky, pine green, wet slate tiles, rain-leaf accent), a Shillong backdrop (far pine ridge with the peak's mast, valley cloud banks, a pine ridge, Assam-type houses with slanting tin roofs and rows of windows, one spire), an ambient drizzle layer, 76 bpm duitara-style loop (minor pentatonic with a major lift), moss-over-stone ground caps, pumaloi as the hidden item in every stage. No `Math.random`, no `Date`.

## How to re-run

```
source /local/home/saiposh/personal/games/_template/scripts/env.sh
cd /local/home/saiposh/personal/ldd-wt/shl
npx tsc --noEmit && npx vitest run
npx vitest run tests/levels.test.ts tests/checkpoints.test.ts tests/cpsafe.test.ts tests/items.test.ts tests/allocation.test.ts tests/jumpaudit.test.ts -t SHL
LDD_N=80 npm run fair -- SHL-01,SHL-02,SHL-03,SHL-04,SHL-05,SHL-06,SHL-07
cp /local/home/saiposh/personal/ldd-inbox/reports/cities/shl/qa6.test.ts.txt tests/qa/qa6.test.ts
QA6=1 QA6_IDS=SHL-01,SHL-02,SHL-03,SHL-04,SHL-05,SHL-06,SHL-07 QA6_IDLE=0,37,120,251 npx vitest run tests/qa/qa6.test.ts --silent=false
CHROME_PATH=/home/saiposh/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell npm run build:single && node scripts/flows.mjs
```

## Commits (city/shl, on f8288e9)

92dd2f5 skeleton + 01-04 · b8b8797 length pass 02-04 · ea50cd0, 420a607 SHL-02 sun act tuning · fbda6a8 SHL-05 · 43d76db, 3bcf8e8 SHL-06 · 5ad3128 05/06 waits and checkpoint · 162acc3 docs · 66d8c9e SHL-07 core · de68fc7 docs for 07.

TIP: de68fc7cbda8523203d9cd41ec8f708fed5267bf
