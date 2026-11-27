# PAT fix round 2

Branch `city/pat`, tip `6cbabe439d00600532f3516976b588821134a174`. develop had not moved (merge not needed). Edits only in `src/game/cities/pat/`, `tests/cities/pat.ts`, `docs/cities/PAT.md`, my `docs/MECHANICS.md` rows. No push, no version bump.

## Route times (scripted route, s)

| Stage | Round 1 | Now | Floor |
| --- | --- | --- | --- |
| 05 | 52.9 | **60.9** | >= 60 |
| 06 | 37.0 | **61.1** | >= 60 |
| 10 | 61.9 | **99.7** | >= 90 |
| 01 / 07 | 15.4 / 130.8 | unchanged (your ruling) | |

Margins on 05 and 06 are about 1 s. Pars (1.35 x route): 05 82, 06 82, 10 135.

## New rules

- **05 `pat05-khokhla` (old deck, 24 floats):** floats with no drums (bare rust-red underside) go under the moment you land: jump them (cause `pat-khokhla`). Floats with a cracked drum (dark seam) go under 1 s after you stop on them: cross without stopping (cause `pat-ghada`). It breaks the porters' deck habit of waiting. Source: the pontoon's own idea, no reserve used (R1 Agam Kuan stays unused: no source, no fitting object).
- **06 `pat06-ginti` (two trucks):** the truck at the foot is unloaded by a porter (5 -> 2 sacks over 6.4 s) while you read it, so the count that counts is the one left; a second truck half-way is loaded (1 -> 3 sacks) as you come up, and plates 7-12 are counted by its final count (tarps 9, 12). Causes `pat-ginti` (first truck, stale read) and new `pat-load` (second truck). The driving-past truck still needs an engine piece; this is a lie inside my own files.
- **10 `pat10-roll` (hoardings callback):** the cart's three sacks name the bell that narrows the banners (the third); the first two bells only grow them, and the rolls show only the next swap. Breaks 03's habit of leaving once the roll looks safe. Causes `pat-jam`, `pat-patti`.
- **10 `pat10-tempo` (tempo callback):** sacks count as riders (a sack on the kerb side at the first halt, on the road side at the second, one off at the last), a kerb-side truck, two arches and a hump. Breaks 07's habit of standing road-side. Needed a small refactor of `tempo()` (clock starts when Dad reaches the act, optional rider). Causes `pat-dhakka` (hump), `pat-torana` (arch).
- 10 order now: pipa, sau, bori, **roll**, sidhi, **tempo**, gaadi, anaaj.

## NAIVE / FIX per new act (cause @tick, 120 ticks/s)

| Act | NAIVE | cause @tick | FIX | cause @tick |
| --- | --- | --- | --- | --- |
| `pat05-khokhla` | run on across the old deck | `pat-khokhla` @5568 | stop on each float before the next (porters' habit) | `pat-ghada` @6537 |
| `pat06-ginti` | run on past the truck being unloaded | `pat-ginti` @2088 | count the first truck after unloading, carry its count on | `pat-load` @3593 |
| `pat10-roll` | run on across the hoardings | `pat-jam` @3948 | wait at the right end of the grown third hoarding | `pat-patti` @4669 |
| `pat10-tempo` | ride in the middle all the way | `pat-dhakka` @8357 | ride road-side all the way | `pat-torana` @7505 |

All tests carry the expected cause. Round-1 acts are unchanged.

## PAT-10 checkpoints (route, s)

Checkpoint changes at: 0.0, 3.6, 8.8, 15.9, 27.4, 31.4, 32.0, 42.6, 52.5, 57.5, 68.1, 72.0, 79.0, 84.2, 90.8, 97.2.
Stretches: 3.6, 5.3, 7.1, 11.5, 4.0, 0.6, 10.7, 9.8, 5.0, 10.6, 3.9, 7.1, 5.1, 6.6, 6.3. Longest 11.5 s (target 25-30).
Replay from the last checkpoint to the failing trap, measured on every NAIVE / FIX / mistake play: 1.5, 1.5, 0.9, **6.9** (roll: waiting for the last bell, worst), 1.6, 4.7, 1.2, 6.1, 1.8, 4.0 s. Worst 6.9 s <= 8. New checkpoints: `pat10-roll` 5.5, `pat10-tempo` 12/38/59, `pat10-gaadi` 20/34. cpsafe is green. The finale stays the hardest: 100 s, eight acts, eight distinct rules, every earlier PAT idea called back.

## Fairness (`LDD_N=80 npm run fair -- PAT`)

```
PAT-01: 6t 100%  12t 100%  18t 80%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  door 100%
PAT-02: 6t 100%  12t 100%  18t 83%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  door 100%
PAT-03: 6t 100%  12t 100%  18t 76%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  door 100%
PAT-04: 6t 100%  12t 100%  18t 100%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  door 100%
PAT-05: 6t 100%  12t 100%  18t 100%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  s6 100%  s7 100%  s8 100%  door 100%
PAT-06: 6t 100%  12t 100%  18t 100%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  s6 100%  s7 100%  s8 100%  s9 100%  s10 100%  s11 100%  s12 100%  s13 100%  door 100%
PAT-07: 6t 100%  12t 100%  18t 100%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  s6 100%  s7 100%  s8 100%  s9 100%  s10 100%  s11 100%  s12 100%  s13 100%  s14 100%  s15 100%  door 100%
PAT-08: 6t 100%  12t 100%  18t 76%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  door 100%
PAT-09: 6t 100%  12t 96%  18t 95%   died: pat-charkhi @236 x2, died: pat-charkhi @235 x1
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  s6 100%  s7 100%  s8 100%  door 96%
PAT-10: 6t 100%  12t 100%  18t 100%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  s6 100%  s7 100%  s8 100%  s9 100%  s10 100%  s11 100%  s12 100%  s13 100%  s14 100%  door 100%
```

## Tests and flows

- `tsc --noEmit`: clean.
- Full `npm test` (PAT on no allow-list): 18 files passed, **1605 tests passed**, 0 failed, 11 env-gated files skipped.
- After `npm run build:single`, `node scripts/flows.mjs`: last lines `BLR-04` / **`no errors`**.

## Uniqueness of the sliding sack (05 `pat05-bori`, 10 `pat10-bori`)

Checked `ALLOCATION.md` (families F001-F441, reserves) and the shipped cities' rows in `docs/MECHANICS.md`. Nothing else uses a porter's sack on a rope or a floating deck. **Closest idea: TVM-10 / F137 `offset-swing`** (a swinging oil pot drips where it passes the middle, so the slick is not under the pot), with TVM-01's F121 ice slab that twitches then slides, and TVM-04 coconuts as the general "something falls where you stop" family. Mine differs: the displaced tell is a rope drawn between where the sack hangs and where it will land (the sack travels along it once, no periodic swing); the effect is a floating section going awash (the floor sinks, nothing hits you), and the lesson is "read where the rope ends, not where the sack hangs". Not replaced.

## Sheets read (re-rendered, 11 frames each)

`/local/home/saiposh/personal/ldd-inbox/reports/cities/pat/shots/PAT-05-sheet.png`, `PAT-06-sheet.png`, `PAT-10-sheet.png` (read: old deck with rust-red floats and the cracked drum, the unloading and loading trucks with porter, hoardings with rolls, tempo with arches and the truck).

## Not done / risk

- Margins of 05 (60.9) and 06 (61.1) over the floor are about 1 s. The route has fixed waits (porters), so they will not drift, but any retune of those waits can drop them under.
- 06 "truck drives past so the gap is behind it" is still not built (engine piece).
- Replay to trap on 10's bori and sidhi are 6.1 s and about 6 s; none over 8 s.
