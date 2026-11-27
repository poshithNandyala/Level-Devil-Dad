# KVT fix round 4: the two finale callbacks (QA FAIL-3 R3-1, R3-2)

Branch `city/kvt`, tip **c873373**. Commits:

- `c64dd67`: the basket remade, the glass cut.
- `9577f47`: refreeze KVT-10.
- `c873373`: docs.

The base is dbbc2ce. No push, no version bump, no shared file. `tests/modules.test.ts` was changed only locally,
for the suite run, and restored with `git checkout`.

## What does not meet the bar, or was not done

- **R3-2 is answered by a cut, not a new break.** The glass that is the way down (break it on purpose and drop to
  the ledge underneath) fails the gate against `kvt10-palaka` in the same finale: "the rotten plank is the way
  down". That is the same decision: break the floor on purpose and drop to the path below. I found no other
  break of KVT-02's "walk across the glass" that is neither "keep moving" (KVT-08) nor "stand still"
  (veliyettam). The finale is honestly shorter by one act.
- **KVT-10 route: 92.5 s (11098 ticks).** It was 93.1 s (11176): the remade basket, minus the glass.
- **The replay sweep is not every tick over the whole stage.** It is every tick from paaru to irakkam
  (checkpoints x415 to x495: the basket, the old glass position and thoni), and every 6 ticks elsewhere (the
  tester's step). Everything before paaru is unchanged in geometry.
- **Death lines:** the act uses the shared `spikes` (the reef) and `splash` (the lagoon) lines. They name what
  killed, and neither repeats the act's advice. No new cause line was added.
- **Kept by ruling, not touched:**
  - the `kvt-sand-arm` door;
  - KVT-09 at 42.6 s;
  - 18-tick fairness parked;
  - frozen 01-08: untouched, and their frozen numbers are unchanged.
- **Tester's notes (not findings), unchanged:** KVT-10 FIX at lag 12 lands before the hole (STUCK), and "pink
  head" at lag 12 dies by splash. `tapLong` still dies at 12 KVT-10 checkpoint groups; it is not a rule play.

## R3-1: `kvt10-kotta`, remade as the opposite of Minicoy

| | |
| --- | --- |
| Before | "This fish basket lowers you, and it doesn't stop at the bottom: it goes on into the water. Step off on to the landing as it goes past." That is KVT-05's "get off before the end of the run" again. |
| After | The basket lowers you from the high pier past a landing, then runs on along its cable, low over the lagoon, to the boats, and stops there. The landing it passes is rotten and stands over the jagged reef (`^` under x+7..12). Under the pier is the reef, not water. |
| Decision sentence | Stay in the fish basket to the very end: it goes on along its cable over the lagoon to the boats, and the landing it passes on the way down, where Minicoy taught you to get off, is rotten. |
| Closest rows | `kvt05-lift` (get off before the end, or the pulley takes you) is **reversed**: staying to the end is the answer and getting off early kills. `amr-swing` (AMR-03 door: jump off the moment it reaches the far bank; stay and the rope snaps) is the opposite decision too. `chn08-trainroof` and `pdy05-raft` (ride a carrier across) have no false exit midway. KVT's own `thoni` (chase the boat, it is not coming back) is different. Checked against DECISIONS.md lists 1 and 2, and v3 / v3.1; no match. |
| Tara's line (the lie) | "Aa padiyil irangu, Dad! / Get off at that landing, Dad!" |
| Advice | "...It lowers you past a landing and then runs on along its cable, low over the lagoon, to the boats: stay in to the very end. The landing is rotten." |
| MISTAKE 1, "step off on to the landing as it passes, as Tara says and as in Minicoy" | **spikes** @8868 (lag 0) / @8999 (lag 6) / @9563 (lag 12); all 6 lag and idle combinations die by spikes |
| MISTAKE 2, "jump out of the basket for the boats as soon as it starts along the cable" | **splash** @9097 / @9229 / @9793; all 6 die by splash |
| Answer | Stay in, steer to the middle of the basket while it moves, and step off at the boats (route won, 11098) |
| Commit | `c64dd67` |

**Diff (art and lines):**

- **Paint:** the pier is unchanged. The pit is x+7..19; the reef (`^`) is at row 16 under x+7..12 and the lagoon
  pool x+13..19. The far landing is x+20..24, top row 14.
- **Build:**
  - a rotten `jetty` landing at x+11 row 12, dark (`#6D4C33`), that falls when stood on;
  - a cable line drawn from the pier down to row 13 and out to x+18.5;
  - the basket moves down to row 14, then right to x+17 at 60 px/s with `moveBy` (it carries its rider).
- **Lines:** Tara's line is new (above); the npc's "Thazhekku! / Going down!" is kept.
- **Frame:** `shots/route/KVT-10-08.png`, read at 844x390. The basket, the cable, the dark landing, the reef spikes
  and Tara's lie all read.

## R3-2: `kvt10-kannadi`, cut

| | |
| --- | --- |
| Before | Cracked glass that holds a runner and gives under a dad who slows down: KVT-08's "keep moving" again |
| Candidate tried | Glass that is the way **down**: break it with a landing and drop to the path below; walking across leads only out over the sea |
| Its decision sentence | Break the glass on purpose and drop through it to the path underneath; walking across it, as at Kavaratti, goes nowhere. |
| Closest row | **`kvt10-palaka`** (this finale): "the rotten plank is the way down to the catwalk". The same decision, breaking or dropping through the floor on purpose, so it is struck |
| Other breaks considered | "Stand still and it holds" is veliyettam's in this finale. "Keep moving" is KVT-08's. "Jump, don't walk" is paaru's. |
| Result | **Cut**, with its route, its MISTAKE ("walk slowly over the glass..."), its lead entry and its doc lines |
| Commit | `c64dd67` |

## Re-runs (one at a time, at the end)

**Worst replay**, KVT-10 (tester's `worst`, four wrong plays): every tick from paaru to irakkam, every 6 ticks
elsewhere. Spawn idle is 0 / 78 / 143 / 156 ticks.

| Lag | KVT-10 MAX | Where | Basket stretch (cp16) | Basket to thoni (cp17) | Thoni and irakkam (cp19) |
| --- | --- | --- | --- | --- | --- |
| 0 | **6.99 s** | cp12 (nizhal into the tide) | 4.63 | 6.32 | 6.22 |
| 6 | **7.18 s** | cp12 | 4.88 | 6.42 | 6.47 |
| 11 | **7.12 s** | cp12; cp13 7.08 | 5.05 | 6.20 | 6.72 |
| 12 | **7.12 s** | cp12 | 5.08 | 6.21 | 6.72 |

Every stretch is under 7.5 s at every lag.

**Calm** (tester's `calm`, KVT-10): every checkpoint is captured on the route at lag 0 / 6 / 11 / 12 × idle 0, 37,
78, 134, 200, 300. Result: **2016 checks, route won in every run, 0 deaths** for idle 4 s, run 0.3 s then idle,
and tap-jump then idle.

**Suite and build checks:**

| Check | Result |
| --- | --- |
| `tsc --noEmit` | clean |
| `npm test`, KVT off EXEMPT | **1698 passed, 20 skipped**, 18 files |
| flows (`build:single` + `scripts/flows.mjs`) | "no errors". It needed `CHROME_PATH` set to the installed headless shell, because Playwright's default browser build is missing on this host |

**Fair, `LDD_N=80`:**

```
KVT-02 100/100/80  KVT-03 100/100/76  KVT-04 100/100/76  KVT-05 100/100/81  KVT-06 100/100/80
KVT-07 100/100/100 KVT-08 100/96/76 (s2 96)  KVT-09 100/100/83  KVT-10 100/100/84 (s0-s20 and door 100)
```

**Refreeze**, KVT only. The only diff is KVT-10:

- the route, 11176 → 11098;
- the checkpoints past the basket, 442.5 / 463.5 / 490.5 / 494.5 / 522.5 → 443.5 / 470.5 / 474.5 / 502.5. The
  glass's 20 columns and its checkpoint are gone, and kotta is a tile wider.

KVT-10 NAIVE (179) and FIX (591) are unchanged. 01-09 are unchanged.

## Diff summary (dbbc2ce..c873373)

| File | Change |
| --- | --- |
| `src/game/cities/kvt/encores.ts` | `lowerBasket` remade (art, cable, rotten landing, reef, two-phase basket run, Tara's line); `crackedGlass` deleted and taken off the KVT-10 act list |
| `src/game/cities/kvt/lead.ts` | the `kvt10-kannadi` entry removed |
| `tests/cities/kvt.ts` | the kotta route (stay in to the end); the two new MISTAKES; the glass route and MISTAKE removed |
| `tests/cities/_frozen/kvt.json` | KVT-10 route and checkpoints (above) |
| `docs/cities/KVT.md`, `docs/CITIES.md` | the kotta line rewritten, kannadi removed |

## Skipped or not checked

- An every-tick replay over KVT-10 before paaru. That part's geometry is unchanged; it ran at 6-tick steps.
- The full sheet for KVT-10 (one frame read at 74 s). KVT-09 was not re-shot, since it is unchanged.
- The new Malayalam line, "Aa padiyil irangu, Dad!", has not been checked by a native speaker.
