# SHL · Shillong: independent QA, round 1: **FAIL**

**Tested:** `city/shl` at `563b7e7` (contains develop `412039f`, v0.17.3), in my own detached worktree
`/local/home/saiposh/personal/ldd-wt/qa-shl`. Probes untracked under `tests/qa/` there; copies in `QA/probes/`, my phone frames in
`QA/shots/`. Every number below is from my own runs (08:57-09:20 UTC 27 Nov 2026), not from BUILD.md / BUILD-2.md.
I fixed, committed and pushed nothing.

## What passes (my numbers)

| Check | Result |
| --- | --- |
| `npm run typecheck` | clean |
| `npx vitest run` (tests/qa skipped by env gates) | 18 files passed, **1926 passed, 0 failed**, 20 skipped |
| `tests/modules.test.ts -t SHL` | 11 passed; SHL is on no exemption list (no `SHL` outside `tests/cities/shl.ts`) |
| `tests/cpsafe.test.ts -t SHL` | 10 passed, all strict ("idle, run and tap-jump at lag 0/6/12") |
| `LDD_N=80 npm run fair -- SHL` | 6t: 100% every stage. 12t: 100% except SHL-05 99% (`shl-wah`@82 x1). Every stretch at 0-12t >= 99% |
| `npm run build:single && node scripts/flows.mjs` | built; **"no errors"** (`CHROME_PATH` = cached headless shell 1228, a host issue) |
| Honest route times (`qa-times`) | reproduce exactly: 01 13.5, 02 33.9, 03 25.3, 04 12.4, 05 31.1, 06 35.3, 07 50.2, 08 58.9, 09 28.8, 10 28.1 s |
| Lag-captured sweep (`qa-sweep`, lag 0/6/11/12 x idle 0/37/120/251, idle/run/tap-jump from each capture) | **0 deaths in 7,280 plays at 65 capture points** |
| Longest stretch | 21.4 s (SHL-02) |
| Worst replay per tick from the lagged capture | 7.18 s (SHL-08 m6, all lags); next 6.86 s (SHL-10 m7) |
| NAIVE vs stage FIX | different cause and tick in all ten at all three lags (closest: SHL-07 shut@283 / maw@276) |
| Place-fit (check 10) | Khasi words are the bible's V list; the one U line ("Ayyo") is replaced; seventh-death line "Em, em! Seven falls. Wan again." and the false-first-drop tour bite are Shillong's own |
| Two-play acts that hold at 0/6/12 | 01 room; 02 room; 03 wake; 04 room, khynnah; 05 room, roar; 06 room, double; 07 room, pool, plop, knock, pairs; 08 room, pull; 09 pdeng, holiday; 10 truedrop/lyoh, lintel/drip, rong, wet, pung |

## Blocking findings

### F1. A shared file changed: `docs/MECHANICS.md` (+54 lines)
`git diff --stat 412039f..563b7e7` lists `docs/MECHANICS.md | 54 +++` (commits `162acc3`, `de68fc7`, `def98f0`). CITY-MODULE.md says a
city worker edits only its folder, its test file, `docs/cities/<CODE>*.md` and its row in `docs/CITIES.md`, and that MECHANICS.md
is written later by the integrator. Everything else in the diff is allowed (the module, `tests/cities/shl.ts`, `docs/cities/SHL.md`,
the one CITIES.md row; no package.json change, no version bump).
**Satisfies me:** the SHL section moved into `docs/cities/SHL.md`, and `git diff 412039f -- docs/MECHANICS.md` is empty.

### F2. Doors that re-ask their room, an act or a registry row
A plain door would pass. Each of these asks again a thought the player has already used:

| Door | What it asks | Closest row | Same thought? |
| --- | --- | --- | --- |
| 02 `shl-dish` | wait until the radar beam has swept past, then walk in | BLR-07 door `cctv` (shipped): let the camera's sweeping beam go past, then run on | yes |
| 03 `shl-tollbar` | stop before the bar until the deck's swing has gone | the 03 room: stop so the deck settles | yes |
| 04 `shl-halfdoor` | take the knup off at the hook before a low opening | `shl04-khynnah` low arch / `shl-lintel` | yes |
| 05 `shl-pool` | its own advice says "Same rule: when the water sits on the mark, walk through" | the 05 room | yes |
| 06 `shl-rootdoor` | jump at the guide and wait for its root | the 06 room | yes |
| 07 `shl-column` | wait for it to meet the floor and break, then walk through | the 07 room (`shl-shut`) | yes |
| 08 `shl-tap` | stand out of reach until the gauge is full | the 08 room | yes |
| 09 `shl-board` | the board is wrong, count the gates | `shl09-kot` (blank boards, count the arches) | yes |
| 10 `shl-tallgate` | take the knup for the drips | the SHL-10 room's second hook (and 04's `shl-drip`) | yes |

**Satisfies me:** each of these doors made plain (the road ends at the door, you walk in), or given a decision that is new.

### F3. Acts that are registry repeats
- **`shl02-lyoh`**: "a high cloud crosses the sun; while it is covered nothing holds; go only with the sun out". The closest row is
  GNR-03 room / `gnr03-shaft` (shipped): "sunbeams are stairs; board each just after its cloud has passed". A player who learned
  Gandhinagar solves this with the same thought.
- **`shl10-wet`**: "the glistening stalactite sheds drips if you bump it; hands off". The closest row is `svp05-choona` (shipped in
  v0.17.3): "a hop under a cave formation raps it and it drips; keep off it". It is the same thought, and for law 7 that means
  07's rule is broken with another city's idea.
- **`shl05-roar` vs `shl07-plop`** (SHL's own rows): both ask you to read a hidden hazard's phase from its sound (loud/quiet/silent
  vs click/plop). The builder's gate admits roar reuses plop's thought. One of the two has to go or ask something else.

**Satisfies me:** each one either replaced or re-cast so that a player who knows the named row has something new to work out.

### F4. Acts with only one play (check 3: each act needs two plays of different cause and tick)
From my labels and sweep: 02 `sngi` (m0 only), 02 `lyoh` (m1 only), 03 `wet` (m1 only), 04 `iew` (m0 only), 05 `ar` (m0 only),
05 `pung` (m1 only), 06 `sprout` (m0 only), 06 `kiang` (m2 only), 07 `krem` (m0 only; its "second" is the stage FIX, which dies in the
room at x14). BUILD-2's honest table counts these acts but itself lists one cause for each.
*Note on the pre-ruling:* I read "the two-play-act counts are final" as fixing how many acts each stage has. It does not make an act
with one play a two-play act. If the conductor meant otherwise, F4 becomes information only.
**Satisfies me:** a second play for each, with a different cause at a different tick at lag 0, 6 and 12.

### F5. Pairs that collapse to one cause, or change cause with lag
Cause@tick at lag 0 / 6 / 12 (`qa-sweep`, lagged model):
- **SHL-10 `shl10-jingkieng`**: m4 `gorge`@1303 / `gorge`@1315 / `gorge`@1637; m5 `jri`@1324 / **`gorge`@1353** / **`gorge`@1365**
  (x76-78). At lag 6 and 12 both plays die to `shl-gorge`, so the callback has one cause there.
- **SHL-09 `shl09-kot`**: m2 `closed`@978/977/989 (x71-72), m3 `closed`@1266/1265/1277 (x92-93). One cause at every lag (the builder
  flags it).
- **SHL-02 `shl02-sngi`**: its one play m0 dies `edge`@900 (x52) and `edge`@926 at lag 0/6, but **`dum`@947 (x53) at lag 12**. At lag 12
  the act's own trap (the lit thin end) is gone and it dies to the room's unlit-middle rule.

**Satisfies me:** the two plays of each act on different causes at different ticks at all three lags.

### F6. Acts where one of the two plays is the room's own rule (check 5)
- SHL-08 `roof` m0, `bucket` m4 and `two` m6 are all "walk to the gate and wait", which dies `shl-soaked`. That is the room's NAIVE
  (soaked@501). Each of these acts therefore has one play of its own: leak, bucket, spout.
- SHL-09 `sngi` m1 "walk off the counter's end without hopping the drain" dies `shl-nala`, which is the room's NAIVE.
- SHL-09 `doh` m7 "walk the counter, never mind the plates" dies `shl-closed`, which is the room's FIX.

**Satisfies me:** a second play for each act that dies to something the act itself teaches.

### F7. Padding: repeat windows that are not labelled beats
The builder flags three windows. Against the rule as written, all three are repeats, and none is the stage's labelled momentum beat:
- 02 `sngi`: the lit beam over the bank's thin end. This is the room's own rule ("never at its two thin ends", and the `shl-edge`
  line says "whatever the light does"). 02 has no labelled beat.
- 04 `iew`: a lure hook before a tall arch, so the player hangs the knup up and the rain kills. This is the room's on/off read. 04 has
  no labelled beat.
- 05 `ar`: "go as she starts to thin" dies `shl-um`. The room already teaches that thinning kills. 05's labelled beat is the quick
  sister in `roar`, so `ar` is a repeat beyond that beat.

**Satisfies me:** each window either asks something new or is the stage's one labelled momentum beat.

### F8. Law 7 on SHL-10: two callbacks are not breaks, and the slot's room is missing
- **`shl10-pung`** (03 + 09) plays both rules straight. m8 "run the span" dies `shl-sway`@2667 (x141), which is 03's NAIVE.
  m9 "keep the first arch's day past the middle arch" dies `shl-shift`@2873 (x147), which is 09's `pdeng` m4. Its advice teaches the
  old rules: "bursts, as on the bridge", "the arch in the middle is another day". So the market and Dawki-bridge callbacks that the
  allocation lists are replayed, not broken.
- **`shl10-wet`** breaks 07's rule with SVP's idea (F3). **`shl10-jingkieng`** has one cause at lag 6 and 12 (F5).
- ALLOCATION.md slot 10 says the twist is "the rest stalls rearrange at each checkpoint on a span that sways to your step". The build has
  one ~10 s act in which the day turns at a mid-row arch (09's rule). Nothing rearranges at a checkpoint. The SHL-10 room is the
  drop-and-hooks callbacks, not the stalls on the span.
- The other callbacks pass: truedrop (01), the two hooks (04), rong (05) and the room each have two plays, two causes and two ticks.

**Satisfies me:** pung (or whatever replaces it) breaks 03's and 09's rules instead of replaying them; the slot's twist is built
(stalls rearranging per checkpoint on the swaying span); wet re-cast; jingkieng holding two causes at every lag.

### F9. Law 9: death lines that advise the move that killed, or carry the home stage's line
| Stage | Play | cause@tick (lag 0) | x | Line (how-to half) | Problem |
| --- | --- | --- | --- | --- | --- |
| 10 | m3 (rong, waited for her dry) | `shl-wah`@1080 | 49 | "Cross when it sits on the mark, not after." | at rong the mark lies (m2 died crossing on it, `shl-liar`@825) |
| 10 | m4 (jingkieng, hanging guide, waited) | `shl-gorge`@1303 | 74 | "Jump at a guide and wait for its root…" | that is exactly m4's move |
| 10 | m0 (first hook) | `shl-lintel`@356 | 20 | "…jump at the hook before it." | the fatal move was taking the hook; 04's line |
| 10 | m1, m5, m7, m8, m9, FIX | `drip`@439, `jri`@1324, `shut`@2839, `sway`@2667, `shift`@2873, `lyoh`@271 | 26, 76, 113, 141, 147, 8 | 04, 06, 07, 03, 09 and 01's own lines | a callback carries its home stage's line |
| 04 | m1 (small knup into heavy rain) | `shl-slap`@1176 | 86 | "With the knup on, rain is nothing." | m1 had the knup on |
| 08 | m2 (pull: stood out of reach) | `shl-soaked`@2424 | 68 | "Stand out of the cloud's reach…" | that is exactly m2's move |
| 06 | m1 (the middle guide) | `shl-gorge`@487 | 21 | "Jump at a guide and wait for its root…" | m1 did that; the line does not name the middle root |
| 05 | m3 (quick sister from a stop back) | `shl-um`@3365 | 149 | "Wait for the water to sit on the white mark, then cross." | m3 did cross on the mark; the line does not name the quick sister |
| 02 | m0 at lag 12 | `shl-dum`@947 | 53 | "Wait on a lit beam until the next one is lit, then jump." | that is m0's move; the same place has two cause ids by lag (`edge` x52 at lag 0/6) |
| 10 | m5 at lag 6/12 | `shl-gorge`@1353/1365 | 77-78 | as m4 | the same place has two cause ids by lag (`jri` at lag 0) |

**Satisfies me:** one cause id and one line per place; SHL-10's places use their own ids and lines; no line tells the player to do what
just killed them.

### F10. HWIK tells not readable at phone size (844x390 @1.5x, my frames)
- **05, the hidden sister** (`QA/shots/SHL-05-07.png`, `SHL-05-062.png`): the only picture of her state is the roar bars, 3 px boxes
  at 60% white beside the outcrop (about x745-770, y345-385 in the frame). On the pale mist they are barely visible. The sign's second
  line ("you hear her before you see her") is about 6 px and cannot be read. With the sound off, nothing tells you her phase.
  The quick sister's "QUICK" sign headline is readable; its sub-line ("half a second on the mark") is not.
- **08, the cloud's shadow and the gutter** (`SHL-08-008.png`, `SHL-08-035.png`): the shadow is a faint darker strip on the dark
  ground (about x320-415, y485) and cannot be told apart from the paving. The gutter cannot be picked out from the roof. The cloud
  sits in the HUD band at the top left. The gauge can be read on the first tank (blue bar); an empty gauge is dark on dark.

**Satisfies me:** each tell picked out at phone size in a frame before the first death, with no sound needed (05).

### F11. Walk-4.5: SHL-10 checkpoint 6
`qa-walk45` (walk forward 4.5 tiles from the capture, stop 1 s): **SHL-10 cp6 @x136.9, walk → `shl-sway` at +4.3 tiles after 0.53 s.**
The span's swing kills a player who respawns and simply walks forward. The other cases are past +4.5, so they are overshoot and do not
count: 03 cp3/cp4 `slip` +5.5-5.6, 07 cp1 `maw` +4.7-4.8. BUILD-2's 4.5-tile claim used only idle, run and tap, which is why it missed this.
**Satisfies me:** cp6 placed so the first fatal step on the span is at least 4.5 tiles ahead.

### F12. Sheets: things hanging from nothing
From `reports/cities/shl/shots/` and my frames:
- 06: the bamboo guides float in mid-air with no base or support (all frames).
- 04 and 10: the green awnings are slabs floating with no posts.
- 10 at 18.0 s: a cave-roof slab with stalactites hangs in mid-sky over the open town.
- 08: the bucket's rope runs from the top edge of the frame.
- 07: the cave is drawn over the open-air town backdrop (sky, mountains, houses), with only a roof band added.

**Satisfies me:** each thing given a support, and 07 given a cave backdrop.

## Polish (not blocking)
- 02: the sun and its beams sit behind the HUD time pill.
- 04: "Peit, rain! Put on the knup." is shown four times in 12 s (NPC bubble and Tara).
- 05/10: the falls run from the top of the frame. The builder says this is on purpose; in 10 there is no cliff around them.
- 09: at sheet scale, a closed stall (cloth over a frame) and an open one look alike; check it at phone size.
- 05 `m2`'s `shl-wah` line names the mark, which the hidden sister does not show.
- 08 room vs 01: "don't stand near the cloud" is 01's lesson. 08 adds the tank, so it passes, but it is close.

## Candidates (information, not findings)
None of my own for 07 or 10 that passes the gate.

## To re-test
F1 diff; F2 every door; F3 lyoh / wet / roar-plop; F4 the second plays; F5 the pairs at lag 0/6/12; F6 08 roof/bucket/two, 09 sngi/doh;
F7 the three windows; F8 SHL-10 slot twist and callbacks; F9 every line in the table; F10 05 and 08 phone frames; F11 SHL-10 cp6
walk-4.5; F12 the sheets; then the full regressions again (suite, cpsafe strict, fair 6/12t, flows, lag sweep, replay).

Not checked: 18t (parked), a real phone, audio.
