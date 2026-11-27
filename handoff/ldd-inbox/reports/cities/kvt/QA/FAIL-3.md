# KVT (Kavaratti) round 3 re-test: FAIL (two blocking findings, both in the finale's callbacks)

Subject: `city/kvt` at **dbbc2ce** (develop f8288e9 merged, checked), my own detached worktree `ldd-wt/qa-kvt3` (removed at the end), KVT removed from `EXEMPT` locally (reverted), nothing committed. Probes, raw output and frames: `r3/` (`qa-probe.test.ts.txt` has tests `plays`, `baits`, `calm`, `worst`; `worst-lag*.txt`, `calm.txt`, `fair.log`, `flows.log`, frames `KVT-09-ozhukku.png`, `KVT-10-late.png`). Rounds 1 and 2 are `FAIL-1.md` and `FAIL.md`.

Pre-rulings as given by the conductor (not re-judged): KVT-09 is FINAL at 42.6 s against the 60 s floor, F497 is struck, the refill for 09 is "none further"; the 09 spawn stretch at 7.71 / 7.88 s (lag 11 / 12) includes the probe's 1.3 s spawn idle; 18-tick fairness is parked, the bar is 6 and 12 ticks.

Verdict: R2-1, R2-2, F496, the regressions and the checkpoints hold. Two finale callbacks in KVT-10 repeat a shipped Kavaratti decision instead of breaking it (law 7), the same class of finding I raised in round 1.

## Holds (all reproduced by me)

| Check | Result |
| --- | --- |
| R2-1 replays, per 6 ticks, 4 wrong plays | KVT-10 cp5 **6.17 / 6.17 / 6.27** (lag 0 / 6 / 12; builder 6.27), cp18 **6.33** at lag 12 (builder 6.33). Was 8.75 and 7.92 |
| Replay MAX, bar 7.5 s | 09: 5.88 / 7.08 / 7.71 / 7.88 s at lag 0 / 6 / 11 / 12, all from the **spawn** stretch (idle 0 / 78 / 143 / 156 ticks = 0 to 1.3 s; play only about 6.4-6.6 s). 09 worst after the spawn: 5.77 s (cp5, lag 12). 10: 6.99 / 7.18 / 7.12 / 7.12 s (cp12, nizhal into the tide, "stop"). Nothing of play over 7.5 s |
| Longest stretch | under 12 s on 09 and 10 (limit 25) |
| R2-2 identical steps, scan over every act id | kodumudi down 3 / 4 / 2 wide, rows 1 / 2 / 1; kodumudi up 3, 3, 2, 2 (one ladder); kadalbhitti up 3, 2, 4, 3, 2, 4 (each window twice, no more); varambu 3, 1, 5; murivu 2 and 3; pavizham lips twice; choora gaps 1 and 2; veliyettam heads 4, 3, 4 with gaps 1, 2, 1. No window three times |
| Calm checkpoints | checkpoints captured on the route played at lag **0, 6, 11, 12** x idles 0, 37, 78, 134, 200, 300 on 04, 07, 08, 09, 10 (4032 checks, route won in every run): **0 deaths** for idle 4 s, run 0.3 s then idle, tap-jump then idle. The three new checkpoints (thengu lead, thoni far jetty x490.5, past the shingle lip x+29.5) are in that sweep |
| Baits (`baits`, lag 0 / 6 / 12 x idle 0 / 100) | every NAIVE and MISTAKE on 09 and 10 dies at all six combinations, in its cause (e.g. ozhukku: spikes @3161, splash @3198, splash @3584; plank splash @1180; veliyettam splash @7682). Two notes below |
| F496 `kvt09-ozhukku` | NAIVE-style "jump for the far ledge, as Tara says" dies by **spikes @3161**, "walk off the end, as down the summit" by **splash @3198**: different causes, different ticks. Third bait splash @3584. Tell: the sign "OZHUKKU / loose shingle", the lip with spikes underneath (reads as "do not jump up"), Tara's lie "Jump for that ledge!" (`KVT-09-ozhukku.png`, 24-30 s) |
| `npm test`, KVT off EXEMPT | **1698 passed, 20 skipped**, 18 files |
| flows | built; "no errors" |
| `LDD_N=80` fair | 02-07 100 / 100 (07 100/100/100); 08 100 / **96** (s2 96); 09 100 / 100 / 83; 10 100 / 100 / 84; every stretch and door 100 except 08 s2 96 (bar 95). Identical to FIX-2 |
| Frozen diff 02-08 | only 04 route 1588 to 1901 and cp 30, 07 cp 29, 08 cps 30 and 64; 01, 02, 03, 05, 06 unchanged (as FIX-2 says) |
| Law 7 and lines | seventh line "Ezhaamathe odam vettikkalanju!" present; Tara's new lines present ("Aa paarayilekku chaadu!", "Odu, Dad! Nilkkalle!"); hidden item per encore in the frozen file (09 [16, 9.7], 10 [13.5, 11.9]); `Found it!` overlap is the shared card |

## Blocking

### R3-1. `kvt10-kotta` replays `kvt05-lift` (KVT-05) instead of breaking it
- **Closest rows:** `kvt05-lift` (DECISIONS.md list 1, shipped): "ride the fish basket up to the pier, and jump off at the top: it keeps hauling up into the pulley". `kvt10-kotta`: "this fish basket lowers you, and it doesn't stop at the bottom: it goes on into the water. Step off on to the landing as it goes past."
- **What:** the decision is the same, leave the basket before the end of its run, because staying kills you. Only the direction of travel and the death (pulley, water) changed. Tara's lie ("Avasaanam vare irunno! / Stay in till the end!") and the MISTAKE "stay in the fish basket till it stops, **as in Minicoy**" attribute to Minicoy a rule it did not teach: Minicoy taught *get off*, which is exactly the answer here. A finale callback must break its rule (the others do: palaka stands where KVT-02 said jump, paaru jumps where KVT-03 said walk, veliyettam stands where KVT-08 said move).
- **How reproduced:** decision sentences from the advice strings in `src/game/cities/kvt/encores.ts` (`lowerBasket`) and `levels.ts`/DECISIONS.md (`kvt05-lift`); the bait dies splash @8959, so the trap works, the decision repeats.
- **What would satisfy me:** an answer that is the opposite of Minicoy's, for example a basket where the way through is to *stay in* to the very end (it carries you across a gap) and the early step-off is what kills; or replace the act.

### R3-2. `kvt10-kannadi` (cracked glass) repeats `KVT-08/room`
- **Closest rows:** `KVT-08/room` (shipped): "Running on water: speed is floor, slow means sunk; a sandbar sinks if you stop on it, so keep moving". `kvt10-kannadi`: "it holds you while you run flat out, and gives way if you slow down or stop on it. Run straight across." Also `KVT-03` faith ("the reef rises under your feet, but only while you walk") and shipped `CHN-08 sink`, `BLR-07 crusher` ("keep moving").
- **What:** the player's decision is KVT-08's: do not slow down on this floor. The callback breaks KVT-02's "walk across the glass" but replays KVT-08's rule. In round 1 I named both `veliyettam` and `kannadi` as repeats of KVT-08's "don't stop" (FAIL-1 B4); only `veliyettam` was reversed. In round 2 I let the glass pass while the tide was fixed; reading it again against DECISIONS.md, it is the shipped Kavaratti rule in new clothes.
- **How reproduced:** `kannadi` code in `encores.ts` (`slow >= 24` ticks under 100 px/s drops the glass), bait "walk slowly over the glass to see the fish" splash @9218; compared with the KVT-08 row.
- **What would satisfy me:** reverse it as the tide was (a glass that breaks under a run and holds a walker, which is KVT-02's own rule, so use a different reversal: for instance glass that holds only while you stand still and breaks when you move, and not the heads' rule again), or replace the act.

## Notes (not findings)
- **Decision sweep, one sentence each, with the closest row** (KVT rooms and doors included; nothing else repeats):
  - 09 room: on the slide, walk to the far end and tap up (closest `BOM-06/room` wet-paint slide: that one avoids, this one compensates).
  - pavizham: under the lip, a tap, never a full leap (closest `kvt04-tailwind` jump length; different).
  - kodumudi: narrow steps take the far tile, over the summit walk off, never hop (closest the room's "far end").
  - kadalbhitti: a heap you land deep on, a lone block you jump whole (closest pavizham, one repeat).
  - **ozhukku:** land short on the shingle and let each landing slide you under the lip; on the pillar land on the side of the heap you want to go. Closest rows: `DIS-10` F234 `roof-curve-slides-stop-at-ribs` (a slope carries you, you stop at ribs), `BBI-02` F203 `keeper-pads-carry-you` (an actor carries you), `BBI-06` F210 (world slides, hub still). All three are a carrier that moves you continuously; ozhukku's carrier is your own landings, aimed by where you land, and it is ruled KVT's by DECISIONS.md V1 (B16). Not a repeat.
  - varambu: on the ridge only the middle holds; murivu: jump well past the cut, never just over it (closest varambu "land" family; distinct: distance vs place).
  - 09 door `kvt-buried-door`: three hops slide the heap off the door, the fourth tips you in (a count, not a place: not the room's question).
  - 10: midden the colour that moves is the octopus (closest `kvt-sand-arm`, see below); palaka stand on the rotten plank, the planks past it are rotten (breaks KVT-02); kallu land mid-step, the far tile is the octopus (breaks KVT-09); aama run on from the nest behind (breaks KVT-01); choora walk under the high tuna, hop the low (closest `KVT-05/room`; half of it, "the second boat throws low again, as in Minicoy: hop those", is a replay, judged inside the act that reverses the first boat); thengu leap from the trunk (breaks KVT-07); irandu wait for the second strike (breaks KVT-06); kaattu jump with the wind, calm against a headwind (breaks KVT-04's "jump in the calm" for the first inlet; the second inlet is KVT-04's rule again, one beat); kamaanam ride under the arch, step off coming down (breaks KVT-08's jump-off-at-the-top); nizhal step on after the beam has passed (breaks KVT-03; closest `GNR-03` sunbeam stairs, a different mover); veliyettam stand still, moving sinks the heads (breaks KVT-08); paaru jump and the reef rises (breaks KVT-03); thoni chase the boat, it is not coming back (breaks KVT-02); irakkam wait for the tide step and the moray (KVT-01 + KVT-06 callback); **kotta: R3-1; kannadi: R3-2**.
  - 10 door `kvt-sand-arm`: jump the sand that moves. It sits next to midden and kallu (and the room's "the colour that moves is the octopus"): one camouflage idea in three surfaces. I treat it as the slot's own idea (allocation: `camouflage-twin`, finale), not a repeat, because the play differs (a patch under your feet, not a head or a hole). If the conductor reads the door-re-asks-room rule more strictly, this is the next one to move.
- **Baits at lag:** KVT-10 FIX ("jump into the dark hole") at lag 11 and above lands on the solid rock before the hole and stays alive (`fixpos` probe: x45.7 on ground), so the scripted bait does not execute at those lags; a player who then walks on dies in the hole. KVT-10 "land on the pink head" at lag 12 dies by splash @830 (the late jump misses the head) instead of the octopus @810. Neither is a surviving bait.
- **Informational:** `tapLong` (right held 0.67 s with a tap jump) still dies at 23 checkpoint groups; it is not one of the three rule plays.
- **Polish:** the cracked glass on `KVT-10-late.png` (76 s) is a nearly invisible faint sheet; at 844x390 the "GLASS / cracked" sign carries it. KVT-08 stays at a 1-point margin (96).
- Malayalam lines unverified (the owner's risk): "Aa paarayilekku chaadu!", "Odu, Dad! Nilkkalle!", "vettikkalanju", "neerali".

## Process note
I started with a `pkill` by mistake once (it also ended my own shell); I did not use it again. Early runs in the 06:20-06:45 UTC window and the restart at about 07:25 UTC killed three of my runs; I reran every one (worst lag 11 included) before judging.

## To re-test I will need
- A new answer for `kvt10-kotta` and `kvt10-kannadi`, each with its decision sentence, closest row, NAIVE/MISTAKE cause@tick, and the bait dying at lag 0 / 6 / 12.
- Then `worst` at lag 0 / 6 / 11 / 12 on KVT-10, `calm` at lag 0 / 6 / 11 / 12 on the new checkpoints, the suite with KVT off EXEMPT, flows, `LDD_N=80` fair.
