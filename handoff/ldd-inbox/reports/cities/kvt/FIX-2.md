# KVT (Kavaratti) round 2: QA r2 fixes and the v3 acts for KVT-09

Branch `city/kvt`, tip **dbbc2ce**. I merged develop `f8288e9` (v0.17.2) first, as `0129da1`, with a merge,
not a rebase. `origin/develop` is still f8288e9 and is an ancestor of the tip.

I edited no shared file. `tests/modules.test.ts` was changed only locally, for the strict runs, and restored
with `git checkout`. Nothing pushed, no version bump.

Commits:

- `3b9940e`: varied descent and ascent, lead before thengu, the tide-head strip, a brighter beam.
- `2d356b0`: F496 `kvt09-ozhukku`, and a checkpoint on thoni's far jetty.
- `1c02933`: refreeze.
- `472bf5d`: the shingle hops hold at every lag.
- `91191d4`: a checkpoint past the shingle's lip, and refreeze.
- `dbbc2ce`: docs.

## Part 1: the two findings and the polish

| Finding | Old | New | What changed (nearest hazard) |
| --- | --- | --- | --- |
| R2-1 KVT-10 cp5 (x178.5) at lag 12 | 8.75 s | **6.27 s** (6.17 / 6.17 / 6.26 / 6.27 at lag 0 / 6 / 11 / 12) | `kvt10-thengu` lead 5 → 7 tiles. A run-and-jump from choora's end now lands on the ground past thengu's checkpoint (218.5) and captures it, instead of grabbing the first palm in the air. Nearest hazard now: thengu's water, 8.5 tiles past its checkpoint. |
| R2-1 KVT-10 cp18 (x492.5) at lag 12 | 7.92 s | **6.33 s** (6.43 / 6.53 / 6.34 / 6.33) | New inner checkpoint on thoni's far jetty (`cps: [26.5]`, x490.5). The run-and-jump off the boat no longer flies from thoni's start into irakkam's first pit. Nearest hazard: irakkam's first pit, about 7.5 tiles ahead. |
| R2-2 kodumudi descent: four identical 3-wide one-row steps | 4 × (3 wide, 1 row) | **3 steps: 3 wide 1 row down, 4 wide 2 rows down, 2 wide 1 row down** | The bottom pit is x+30..31, and the route walks off each step. Hopping down still dies (summit MISTAKE, splash @1861). |
| R2-2 kadalbhitti ascent: six identical 3-wide steps | 6 × 3 wide | **widths 3, 2, 4, 3, 2, 4** | Each window appears at most twice. The route climbs to the far end of each step and taps up, as before. |
| Polish: SinkStep strip | drawn on every 'move' head all the time (`on > limit - 54` with limit 40) | drawn only once you have moved on a head for 12 ticks (stand heads keep `on > 30`) | |
| Polish: nizhal lit-step contrast | fill `rgba(255,250,200,0.35)`, edge `rgba(200,170,120,0.6)` | fill `rgba(255,244,170,0.55)`, edge `rgba(150,110,60,0.9)` | |
| Polish: veliyettam gaps | 1, 1, 2 | **1, 2, 1** (head 3 starts a tile later) | |
| Note: KVT-09 from the spawn | 7.88 s at lag 12 | 7.88 / 7.71 / 7.08 / 5.88 (lag 12 / 11 / 6 / 0) | Not fixed. As you said, it includes the probe's spawn idle (156 ticks = 1.3 s at lag 12), so about 6.6 s of play. |

## Part 2: KVT-09 length from v3

| Act | Family | Decision (one sentence) | Registry check | NAIVE | FIX | Seconds |
| --- | --- | --- | --- | --- | --- | --- |
| `kvt09-ozhukku` | F496 `slide-is-the-ride` (B16, ruled KVT's) | Under a beach-rock lip too low to jump under, land short on the shingle and let each landing slide you on; the slide that takes you off the edge carries you under the lip to the far ledge; on the pillar after it, land on the side of the heap you want to go. | DECISIONS.md lists 1 and 2. The nearest rows are `BOM-06 wet paint slides you off`, `blr08-curtain jump before you slide`, `slidedoor` and `JAI shant` (push against the slide): all treat a slide as something to avoid. No row aims a slide to travel, so nothing was struck. Inside KVT, every other 09 act treats the slide as a penalty. | "Jump for the far ledge, as Tara says" (and as pavizham taught): **spikes @3161** (the lip) | "Walk off the end so it never slides" (kodumudi's answer): **splash @3198** (no carry, into the pool) | about 5.8 (route 36.8 → 42.6 s) |
| `F497 place-the-heap-for-the-way-back` | F497 | (from v3) The route doubles back along the crest, and every heap you slide stays where it went. | n/a | not built | not built | 0 |

- **The F496 mechanism:** `RubbleBank` gains a `carry` option, used only by this act. A slide that takes you off
  the edge keeps pushing you 3 px a tick until you land: "the rubble you brought down comes with you".
- **F496 geometry:**
  - A shingle shelf x+5..8, top row 12.
  - A 4-tile gap under an overhang from the cliff, jagged underneath, just above a standing dad's head.
  - The ledge.
  - Then a 3-wide ridge heap on a pillar (top 13), with a second overhang over its far gap.
- **A third play:** "land in the middle of the heap, as on the ridge, and walk on" dies by splash @3584.
- **Checkpoints:** the act's own cp at x+0.5, and an inner one at x+29.5 past the second lip. The inner one is
  needed for replay: without it, run-and-jumps fly over varambu's checkpoint, at 8.02 s.

**F497 is not built.** In the 90-minute budget, F496 plus the Part 1 fixes and their proofs used the time.
F497's doubled-back crest needs a two-level layout and persistent heaps (the door's `Heap` slides only one way).
I did not start it rather than ship a half-tuned act.

**KVT-09 route: 42.6 s (5116 ticks), not the ~63 s v3 estimates.** F496 came out at about 6 s, not the 14 s
estimated, and F497 (about 12 s) is missing.

## `worst` table (the tester's probe, `QA_STEP=6`, four wrong plays)

The idle at each lag is 0 / 78 / 143 / 156 ticks. Each cell is the worst replay from the last captured
checkpoint, in seconds.

| Lag | KVT-09 MAX | KVT-09 worst after the spawn | KVT-10 MAX | KVT-10 cp5 | KVT-10 thoni-to-irakkam |
| --- | --- | --- | --- | --- | --- |
| 0 | 5.88 (spawn) | 5.73 | 6.99 | 6.17 | 6.43 |
| 6 | 7.08 (spawn) | 5.93 | 7.18 (nizhal → tide) | 6.17 | 6.53 |
| 11 | 7.71 (spawn) | 6.28 | 7.12 | 6.26 | 6.34 |
| 12 | 7.88 (spawn) | 6.34 | 7.12 | 6.27 | 6.33 |

- Every stretch is under 7.5 s except KVT-09's spawn stretch at lags 11 and 12, which includes the spawn idle.
- The step is 6 ticks, the same as the tester's sampling. It is not every tick. A full every-tick sweep of KVT-10
  at four lags is several times the memory and time the host allows now.
- The KVT-10 rows are from the run at `1c02933`. KVT-10 has not changed since. The KVT-09 rows are from the tip
  code.

## Lag-captured sweep (the tester's `calm`)

The route is played at lag 0, 6, 11 and 12 with 12 spawn idles (0, 23, 37, 60, 78, 111, 134, 156, 200, 251,
300, 344). Each checkpoint is captured where that run takes it. From each one: idle 4 s, run 0.3 s then idle,
tap-jump then idle, and the tester's extra `tapLong`.

| Run | Stages | Checks | Route fails | Deaths (idle / run 0.3 s / tap-jump) |
| --- | --- | --- | --- | --- |
| `472bf5d` | 04, 07, 08, 09, 10 | 7872 | 0 | **0** |
| tip (09 changed after) | 09 | 2304 | 0 | **0** |

`tapLong` (a 6-tick tap with forward held for 0.67 s) still dies at 23 checkpoint groups. It did the same in the
tester's own `r2/calm2.txt` baseline, and it is not one of the three plays in the rule.

Every KVT-09 and KVT-10 route also wins at every lag from 0 to 12 with all 12 idles (312 runs).

## Checks

- **cpsafe** (strict, KVT off `EXEMPT`): `tests/cpsafe.test.ts -t KVT` passes 10/10.
- **Full `npm test`** (KVT off `EXEMPT`, then restored): **1698 passed, 20 skipped** (18 files). `tsc --noEmit`
  is clean.
- **flows:** `npm run build:single` and `node scripts/flows.mjs` report "no errors".
- **Fairness**, `LDD_N=80`, run once at the end:

```
KVT-02 100/100/80   KVT-03 100/100/76   KVT-04 100/100/76   KVT-05 100/100/81   KVT-06 100/100/80
KVT-07 100/100/100  KVT-08 100/96/76 (s2 96)  KVT-09 100/100/83 (s0-s11 100, door 100)
KVT-10 100/100/84 (s0-s21 100, door 100)
```

  Every stage and every stretch is at least 96 at 6 t and 12 t. KVT-09's relaxed (18 t) result fell from 100
  to 83 with the shingle act. It is reported, not traced.
- **Sheets** re-shot and read: `shots/KVT-09-sheet.png` and `shots/KVT-10-sheet.png` in this folder.
  - KVT-09:
    - the shingle shelf under the tall overhangs (frames at 23.9 s and 27.3 s);
    - the 3/4/2 descent (10.2 s);
    - the 3/2/4/3/2/4 ascent (17.1 s and 20.5 s).
  - KVT-10:
    - the brighter lit shadow step (59.6 s);
    - the three tide heads with gaps 1/2/1 (67.1 s).
  - The shared stage card still overlaps "Found it!".

## Frozen diff (`tests/cities/_frozen/kvt.json`, 054f593 → tip)

```
KVT-09 checkpoints [34.5, 55, 67.5, 85, 107.5, 127.5, 158.5, 171.5, 189.5, 222.5]
                -> [34.5, 55, 67.5, 85, 107.5, 127.5, 158.5, 187.5, 192.5, 205.5, 223.5, 256.5]
KVT-09 route 4400 -> 5116      (the new act; NAIVE 262 and FIX 813 unchanged)
KVT-10 checkpoints: every one from thengu's moves 2 tiles (thengu lead 5 -> 7); thoni's inner one at 490.5 is new
KVT-10 route 11176 unchanged; NAIVE 179 and FIX 591 unchanged
KVT-01..08: unchanged
```

KVT-09 checkpoint 158.5 is now ozhukku's own checkpoint and 187.5 its inner one. Varambu's move to 192.5 and
205.5, and murivu's to 223.5.

## Still short

- **F497 not built. KVT-09 is 42.6 s against the ~63 s v3 asked for.**
- The `worst` sweep is at 6-tick steps, as fine as the tester's, not every tick.
- KVT-09's spawn stretch is 7.71 / 7.88 s at lag 11 / 12, including 1.3 s of spawn idle.
- KVT-08's dolphin stretch stays at 96.

## Risks

- **Malayalam lines unverified by a native speaker.** These include the new lines "Aa paarayilekku chaadu!"
  (ozhukku, Tara's lie) and "Odu, Dad! Nilkkalle!", plus "vettikkalanju", "neerali" and the earlier rounds'
  lines.
