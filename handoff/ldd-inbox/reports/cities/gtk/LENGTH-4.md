# GTK round 4: replay per tick, the recasts, the lag-captured sweep

Branch `city/gtk`, worktree `/local/home/saiposh/personal/ldd-wt/gtk`. Tip: `13c8f0b`. develop `f8288e9` was merged first (`8c009e5`). Nothing was pushed and the version was not bumped. Budget: 150 min, from 10:39 to 13:09 IST.

## Still short, and why

- **Replay ≤ 7.5 s per tick is still unmet on 06, 07, 09 and 10.** It is met on 02 (7.30 s), 05 (7.50 s) and 08 (6.52 s). The worst is 09 at 17.3 s: the `dophoto` yak ride takes 17 s from the act's checkpoint to the river, and there is no ground under the ride where a checkpoint could sit. The fix is the one named in the brief: split the ride at a calm bank with a second yak. It re-lays two acts in 09 and one in 10, and I did not reach it. The other three:
  - 10 is 12.1 s, on `chauri`, which has the same ride shape.
  - 06 is 9.7 s, from a run+jump branch in the `ulta` switchback into the `adda` taxi. The checkpoint I added at the end of the switchback did not catch that branch.
  - 07 is 9.3 s, from a run+jump branch in `dagar`/`chiya`. A checkpoint under the second `chiya` awning did not catch it.
- **Replay at lag 6 and 12 was not run per tick.** The per-tick probe ran at lag 0 only. The lag-captured sweep (section 3) covers lag 0/6/11/12 with the tester's method.
- **Part 2 (F482-F488) was not started.** Part 1 used the budget.
- **"≥ 5 two-play acts per long stage" is not met.** A two-play act dies to two different causes at two different ticks. The count per stage is in section 4: none of the long stages reaches 5. Two of the acts that have two plays use one cause for both, so they do not count: the recast 05 `peeche` (`gtk-jurmana` both times) and 09 `chattan` (`gtk-hiun` both times).
- **Length floors:** these stages are under their floors.
  - 02 21.3 s (floor 25; the cook is quicker now)
  - 03 21.7 s (floor 25; it waits on F482)
  - 05 53.2 s (floor 60)
  - 06 39.5 s (floor 60; ALLOCATION-V3.1 says about 54 s with F484, which is not built)
  - 07 44.9 s (floor 120; `peeche` and `saath` are cut and F485-F488 are not built)
  - 08 27.9 s (floor 60; three span acts are cut per ruling 3)
- **08's `meta` keeps its old family, `cabins-cross-at-midpoint`.** The shared `docs/allocation.json` still names it for slot 08, and `tests/allocation.test.ts` fails otherwise. The room plays F489 `door-side-boarding`. A `shortcut:` comment in `s08.ts` says to upgrade the family when the allocation carries F489.
- **10 `tar` still uses the old mid-station change.** With 08 `tar` kept as the one labelled momentum beat, that makes two. I leave this for your ruling.
- **10 `baadal` (stay behind the drifting cloud) is the same class as the 07 `peeche`/`saath` cut** (ruling 1). I did not cut it, because the ruling named only 07. It is for your ruling.
- **08 rival script:** Tara's script line at 2.8 s still says "Stay on, Dad, all the way!", from the old room. It is not wrong, but it no longer points at the new trap.

## 1. Rulings (the conductor's, on my section-9 candidates)

| # | Row | Ruling | What I did | Commit |
|---|---|---|---|---|
| 1 | `gtk07-peeche`, `gtk07-saath` | CUT (I3 pace-behind class) | Both acts, their intro lines, routes and deaths are removed. 07 is now `thau`, `chitra`, `ghumti`, `dagar`, `chiya`, `jaldi`. | `b4e2d55` |
| 2 | GTK-09 room, `gtk09-chamri`, `gtk10-chauri` | RECAST: the yak never turns back | The yak stops for the photo on thin shore that looks like a bank, then walks over the real bank and wades into a river (new cause `gtk-nadi`). NAIVE (off at the stop) dies to `gtk-photo`; FIX (stay on) dies to `gtk-nadi`. `chamri` (jump up on to the high bank at the photo stop, then it wades in) and `dophoto` follow the same rule. The turn-back death is gone. | `b4e2d55` |
| 3 | GTK-08 room | RECAST to F489 door-side boarding | Details below the table. | `17dd5bd` |
| 4 | GTK-01 sweepers | KEEP | No change. | none |
| 5 | `gtk07-chitra` and the painted wall | KEEP | No change. | none |
| 6 | GTK-03 room | KEEP | No change. | none |
| (S12) | `gtk07-thau` | stays the labelled shelter beat | Its thick spell is shorter, 4.2 s down to 2.6 s; the holes are unchanged. | `cc74684` |
| (V3.1) | GTK-06 | ends at about 54 s with F484 | Noted. F484 is not built (Part 2). | none |

**Ruling 3, the 08 recast.** Dad now rides inside the cabin.
- **The trap:** the cabin in the bay has its door on the far platform's side. NAIVE walks straight at it: there is no step over the gap, and he falls (`gtk-khaai`, tick 168).
- **The way:** walk round over the footbridge and get in by the far door.
- **FIX:** wait for the next cabin. It comes up out of the shed with its door on Dad's side and goes back down into the shed (`gtk-ropeway`, tick 872).
- **New act `gtk08-saamne`:** the same station the other way about, with the door on Dad's side. Walking round faces the blind side (`gtk-khaai`, 1451); waiting there for the next cabin is the shed (`gtk-ropeway`, 2000).
- **Cut:** the meeting-point acts `upar`, `badli` and `der`. `tar` is kept as the one labelled momentum beat.
- **Lag:** the route wins under `lagged()` at lag 0, 6, 11 and 12. The cabin waits 4.6 s with its door open, and the walk round takes about 3 s. Fair at 12t is 100%.

## 2. Replay to a trap, per tick (lag 0)

Method, as in round 3. The probe (`tests/cities/gtk/probe.test.ts -t replay`) branches stop, run on, and run+jump off the route. It branches every 30 ticks, and every tick in the last 1.5 s before each checkpoint and within ±0.5 s of each stretch's coarse worst.

| Stage | Route | cps | Longest stretch | Max replay | Where | Round 3 |
|---|---|---|---|---|---|---|
| GTK-02 | 21.3 s | 5 | 9.8 s | **7.30 s** | cp1 stop, gtk-bhaap | 10.0 s |
| GTK-05 | 53.2 s | 14 | 7.1 s | **7.50 s** | cp10 stop, gtk-jhadu | 11.8 s |
| GTK-06 | 39.5 s | 10 | 8.0 s | 9.66 s | cp3 run+jump @22.1 s, gtk-taxi | 9.9 s |
| GTK-07 | 44.9 s | 9 | 8.5 s | 9.29 s | cp4 run+jump @31.9 s, gtk-badal (cp5 7.59 s) | 9.3 s |
| GTK-08 | 27.9 s | 4 | 9.6 s | **6.52 s** | cp1 run on, gtk-khaai | 13.7 s |
| GTK-09 | 64.9 s | 6 | 16.0 s | 17.33 s | cp1 stop, gtk-nadi (the `dophoto` ride) | 18.2 s |
| GTK-10 | 89.7 s | 14 | 12.5 s | 12.07 s | cp9 stop, gtk-nadi (`chauri`); cp6 11.0 s `deewar`; cp10 10.6 s `jhadu` | 11.0 s |

What moved the met rows. No trap was weakened and no checkpoint was removed.
- **02:** the cook works about 27% quicker: period 5.2 s down to 3.8 s, and the hold at the top 1.0 s down to 0.8 s.
- **05:**
  - empty-handed checkpoints at `kachra` +19.5, `aarakshit` +16.5 and `peeche` +15.5;
  - the `peeche` wrapper now lies at +19.5;
  - the `kachra` bin man starts at +20 instead of +31.
- **08:** the recast.
- **Peeche:** the recast stretch is no longer over the bar (it was 8.2 s).

Raw output is in `r4/gtk-rp4-GTK-0n.txt`.

## 3. Lag-captured sweep (the tester's method, `tests/cities/gtk/qa6.test.ts`, copied from PAT's qa6)

The route runs at lag 0/6/11/12 with spawn idle 0/37/120/251. At each checkpoint the lagged run takes, the world is rebuilt there. Seven plays follow: idle 4 s, run 0.3 s after 0/6/12 ticks, and tap-jump after 0/6/12 ticks. Replay is measured from the last checkpoint to each NAIVE, FIX and MISTAKE death at lag 0/6/12.

| Stage | Capture points | Plays | Deaths | Route wins at every lag | Longest stretch | Worst replay (that method) |
|---|---|---|---|---|---|---|
| GTK-01 | 4 | 448 | **0** | yes | 11.3 s | 1.63 s |
| GTK-02 | 4 | 448 | **0** | yes | 10.7 s | 7.30 s |
| GTK-03 | 4 | 448 | **0** | yes | 8.0 s | 2.20 s |
| GTK-04 | 4 | 448 | **0** | yes | 8.8 s | 7.63 s (m3, lag 6) |
| GTK-05 | 13 | 1456 | **0** | yes | 8.0 s | 10.78 s (m3) |
| GTK-06 | 9 | 1008 | **0** | yes | 8.4 s | 2.38 s |
| GTK-07 | 8 | 896 | **0** | yes | 8.6 s | 4.60 s |
| GTK-08 | 3 | 336 | **0** | yes (lag 12 won; it did not before the recast) | 11.9 s | 7.37 s |
| GTK-09 | 5 | 560 | **0** | yes | 16.1 s | 17.43 s |
| GTK-10 | 13 | 1456 | **0** | yes | 12.6 s | 12.18 s |

The sweep found 0 deaths in 7,504 plays. Before this round, the sweep on 01 had 6 fails: cp0 at x30.5, tap-jump into the first broom at spawn idle 251. I moved cp0 to x24.5; 27.5 and 25.5 still failed. 09 cp1, which was a hot capture at 3.4 tiles, is now 4.5 tiles or more clear: the `dophoto` bank widened from 5.5 to 7 tiles. Per-stage rows are in `r4/gtk-qa6-r4-GTK-0n.txt`.

## 4. Acts (probe b, `r4/gtk-deaths4.txt`; seconds from the probe's act windows)

Two-play means NAIVE and FIX die to a different cause at a different tick. Acts without a scripted act death in probe (b) show "-".

| Stage | Act | Family | Decision | Registry check | NAIVE cause@tick | FIX cause@tick | s |
|---|---|---|---|---|---|---|---|
| 02 | room | tier-cycle | off at the top while he holds it | S3 ruled | gtk-bhaap @839 | gtk-dhakkan @324 | 8.1 |
| 02 | `ulta` | tier-cycle | off backwards as he carries it round | S3 keep | gtk-bhaap @1856 | gtk-dhakkan @1341 | 11.2 |
| 03 | room | inspector-removes | cloth holds, polythene tears | ruling 6 keep | gtk-polythene @215 | gtk-jaanch @1532 | 4.3 |
| 03 | `ulto` / `jaldi` / `jaanch` | inspector-removes | as round 3 | no new match | polythene @1337 / jaanch @2028 / - | - | 5.9 / 4.8 / 5.1 |
| 05 | room | rule-broken-by-jump | bin it before you jump | - | gtk-jurmana @213 | gtk-jurmana @458 | 5.3 |
| 05 | `aarakshit` | rule-broken-by-jump | no-card benches only | - | gtk-jhadu @2513 | gtk-aarakshit @2871 | 5.0 |
| 05 | `peeche` (I3 recast) | rule-broken-by-jump | the bin he has just emptied | I3 ruled | gtk-jurmana @5657 | gtk-jurmana @6594 (same cause) | 8.3 |
| 05 | `kachra`, `chabutra`, `do`, `jhadu`, `shaam` | rule-broken-by-jump | as round 3 | no new match | jurmana @1762 / 3800 / 3955 / 4796 / - | - | 8.4 / 4.9 / 5.5 / 7.1 / 6.3 |
| 06 | room | topology | the stair up | V3.1 noted | gtk-taxi @188 | gtk-chhat @610 | 3.4 |
| 06 | `modh`, `ulta`, `adda`, `upar2`, `chhatein`, `chhat` | topology | as round 3 | no new match | taxi @1030 / 1530 / 2979 / 3663, khaai @4205, - | - | 4.4 / 11.8 / 4.4 / 5.6 / 4.1 / 3.9 |
| 07 | room | fog-edge | jump where the rope stops | - | gtk-badal @129 | gtk-deewar @1814 | 3.5 |
| 07 | `chiya` | fog-edge | wait at both stalls | - | gtk-badal @2908 | gtk-badal @3920 (same cause) | 15.5 |
| 07 | `jaldi` (momentum beat) | fog-edge | jump, the holes are right there | W8 labelled | gtk-badal @4736 | - | 4.5 |
| 07 | `thau` (shelter beat), `chitra`, `ghumti`, `dagar` | fog-edge | as round 3 | S12 / ruling 5 / I1 | - | - | 7.0 / 3.7 / 4.6 / 4.6 |
| 08 | room (recast) | F489 door-side | board from the door side; walk round | ruling 3; F489 checked against lists 1-2: no other door-side read | gtk-khaai @168 | gtk-ropeway @872 | 9.3 |
| 08 | `saamne` (new) | F489 door-side | door your side this time: in from here | as the room | gtk-khaai @1451 | gtk-ropeway @2000 | 9.4 |
| 08 | `tar` (momentum beat) | cabin-cross | the old change, decides nothing new | ruling 3 | - | - | 7.7 |
| 09 | room (recast) | ride-fixed-loop | stay on through the photo, off on the real bank | ruling 2 | gtk-photo @663 | gtk-nadi @1564 | 11.6 |
| 09 | `chamri` (recast) | ride-fixed-loop | jump to the high bank at the photo stop | ruling 2 | gtk-photo @2407 | gtk-nadi @2697 | 9.4 |
| 09 | `dophoto` | ride-fixed-loop | two photos, then off on the bank | W8 | gtk-photo @3854 | gtk-nadi @4630 | 16.1 |
| 09 | `barf` / `chattan` | ride-fixed-loop | the lake ice holds / off on to the stair | no new match | hiun @4530 / hiun @6079 | - / hiun @7289 (same) | 12.9 / 6.6 |
| 10 | `chauri` (recast) | finale callback | as the 09 room | ruling 2 | gtk-photo @8026 | gtk-nadi @8903 | 11.3 |
| 10 | `jhola`, `antim`, `jhadu` | finale callbacks | as round 3 | no new match | polythene @3845 / galat-tala @6158 / jhadu @10027 | jaanch @4321 / jhora @6634 / aarakshit @10594 | 12.4 / 6.0 / 4.8 |
| 10 | `tar`, `baadal`, `peechha`, `stool` | finale callbacks | as round 3 | **for ruling**: `tar` (mid-station change), `baadal` (I3 class) | khaai @6821 / deewar @4382 / jurmana @3204 / jurmana @9052 | - | 7.8 / 5.9 / 5.4 / 9.7 |

Two-play acts per long stage (room included):

| Stage | Two-play acts | Count |
|---|---|---|
| 02 | room, `ulta` | 2 |
| 05 | `aarakshit` | 1 |
| 06 | room | 1 |
| 07 | room | 1 |
| 08 | room, `saamne` | 2 |
| 09 | room, `chamri`, `dophoto` | 3 |
| 10 | `jhola`, `antim`, `jhadu`, `chauri` | 4 |

The bar is 5.

## 5. Checks

- **cpsafe:** `npx vitest run tests/cpsafe.test.ts -t GTK` passes for every changed stage, run per stage as I went. The full suite at the end includes cpsafe and passed.
- **Fair, LDD_N=80** (`fair-N80-r4.txt`, all ten stages, one run): every stage is 100% at 6t and 12t. At 18t:

  | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
  |---|---|---|---|---|---|---|---|---|---|
  | 100% | 100% | 98% | 100% | 100% | 76% | 76% | 100% | 93% | 76% |

- **Full `npm test`:** 18 files and 1788 tests passed, 25 skipped (`/tmp/gtk-full7.log`). The first run failed `allocation.test.ts` on 08's new family; I restored the meta (see "Still short").
- **typecheck:** tsc=0. **flows:** flows=0, no errors.
- **Sheets:** re-shot and read for 01, 02, 05, 06, 07, 08, 09 and 10 (`shots/GTK-0n-sheet-r4.png`). Every route reaches the exit with 0 deaths.
  - 08 shows Dad inside the red cabin, the footbridge, the blue shed cabin and the top station.
  - 09 shows the river slots after each bank.
  - 03 and 04 were unchanged.
- **Heavy runs:** after your memory notice, each heavy run went one at a time: fair, then the sweep, then the full suite, then flows and sheets. My own PIDs are in `/tmp/gtk-pids4.txt`; none were left running.
- **Tip:** `13c8f0b`. Commits this round:

  | Commit | What |
  |---|---|
  | `8c009e5` | merge develop |
  | `b4e2d55` | 07 cuts, yak recast, 01 cp0, sweep copied |
  | `17dd5bd` | 08 recast and `saamne` |
  | `94fc59d` | 05 replay checkpoints, 09 bank |
  | `cc74684` | 02 cook, 06 and 07 checkpoints, design notes |
  | `13c8f0b` | 08 meta restored, scratch test removed |
