# PAT fix round 1 (answers QA/FAIL.md)

Branch `city/pat`, worktree `/local/home/saiposh/personal/ldd-wt/pat`. `origin/develop` (ea12cdf) merged first (`git merge`, no rebase). Edits only in `src/game/cities/pat/`, `tests/cities/pat.ts`, `docs/cities/PAT.md`, my rows in `docs/MECHANICS.md`. No push, no version bump. Tip sha: see the end of this file.

## Route clear times now (scripted route, winTick / 120)

| Stage | Before | Now | Band / floor |
| --- | --- | --- | --- |
| 01 | 15.4 | 15.4 | 25-35 **not met, reason in B1** |
| 02 | 16.3 | 25.9 | 25-45 |
| 03 | 15.2 | 26.6 | 25-45 |
| 04 | 22.8 | 37.8 | 25-45 |
| 05 | 64.0 | 52.9 | >= 60 **not met, reason in B2** |
| 06 | 64.1 | 37.0 | >= 60 **not met, reason in B2** |
| 07 | 130.8 | 130.8 | kept as it is (bible 2-3 min) |
| 08 | 9.9 | 9.9 | short by design |
| 09 | 72.0 | 73.6 | >= 60 |
| 10 | 91.5 | 61.9 | >= 90 **not met, reason in B2** |

Pars set to 1.35 x route: 02 35, 03 36, 04 51, 05 71, 06 50, 09 99, 10 84.

## B3: FIX must reach its own trap (NAIVE vs FIX, cause + death tick, 120 ticks/s)

Every added act has an `ACT_MISTAKES` pair with an expected `cause`; the test fails if the cause differs. Each FIX survives the NAIVE's trap and dies at a different trap with its own cause.

| Act | NAIVE (what) | NAIVE cause @tick | FIX (what) | FIX cause @tick |
| --- | --- | --- | --- | --- |
| `pat02-bhatti` | stand in the first litti's path | `pat-angara` @2000 | pass the first litti, run on past the second | `pat-doosra` @2483 |
| `pat03-patti` | stop on the left part of the third hoarding | `pat-jam` @2345 | wait at the right end of the second hoarding (the habit from the room) | `pat-patti` @1672 |
| `pat04-sidhi` | climb behind the first porter | `pat-bojh` @1316 | wait for two porters as on flight 1, then climb | `pat-sidhi` @2004 |
| `pat05-bori` | run on across the loading deck | `pat-ganga` @3727 | wait before the section the second sack *hangs over* (it slides back) | `pat-bori` @4360 |
| `pat06-gaadi` | run on over the lifting plates | `pat-jod` @2047 | cross the moment the plate is back, ignoring the shake (second truck) | `pat-gaadi` @2824 |
| `pat07-pul` | stand still in the middle | `pat-dhakka` @3766 | stay on the kerb side for ever (the road-side rider got off) | `pat-torana` @5482 |
| `pat10-bori` | run on across the loading deck | `pat-ganga` @2059 | wait before the section the second sack hangs over | `pat-bori` @2640 |
| `pat10-gaadi` | run on over the lifting plates | `pat-jod` @5169 | cross the moment the plate is back | `pat-gaadi` @6029 |

Stage-level FIX plays for 06 and 10 are new too (B5). Old tests that only checked `dead` now carry causes. `haat`, `mandi`, `wapsi` were already different and are unchanged.

## B2: padding cut, repeats replaced by a changing rule

- `pat05-bori` (`s05.ts`): six identical windows -> two: a plain drop (wait before it), then a sack that hangs over section 9 and **slides back along its rope** to land on section 8 (new betrayal, cause `pat-bori`, the rope is drawn). Plain sections between are the momentum beat. Deck 24 -> 20 sections. Replaced 34.6 s by 23.6 s.
- `pat06-gaadi` (`s06.ts`): 18 lifts -> 6 seams, one single lift then a **double lift** (a second truck follows, the plate is back for 0.3 s and shaking; own cause `pat-gaadi`). 31.6 -> 21.8 s.
- `pat10-bori`: nine windows -> two (plain third section, sixth slides). `pat10-gaadi`: 16 plates -> 6, even plates 2 and 4 lift, plate 4 is a double lift.
- `pat06-kumhrar` cut (B4). New acts that carry the length instead: 02, 03, 04 below.
- **Stages that stay under their floor, honest numbers:** 05 = 52.9 s (floor 60), 06 = 37.0 s (60), 10 = 61.9 s (90). Reason: with the repeats removed, what is left is distinct rules, and each distinct rule costs 10-20 s. I did not add more windows of the same rule (padding), and could not build further new betrayals from PAT's own ideas in the time (tempo lean and hoardings in the finale are still not used). If the conductor wants the floors held, the next step is one more rule per stage (06: a second count; 10: the tempo or hoardings idea).

## B4: `pat06-kumhrar` cut

Removed the act, its causes use, its tests and the Kumhrar source line. The reserve R2 is unused again.

## B5: the count is the betrayal (06) and PAT-10 has its own FIX

- `plate()` no longer flips under a hop (the TVM-01 idea is gone from PAT-06 and PAT-10). All seams look plated with a number. A **tarp** (same number, painted flat, no bolts, 3% darker) lies over the gap on every plate whose number is a multiple of the sacks on the **truck parked at the start of the stretch** (`cart()` in `s06.ts`).
- 06: room 3 sacks (plate 3), `pat06-sau` **2 sacks** (plates 2, 4, 6), `pat06-nau` 3 again (3, 6). The count goes stale between stretches. Cause `pat-jod` ("only a tarp over the gap"); on the second stretch `pat-ginti` ("you counted with the last truck's sacks").
- Stage FIX for 06: count three in the room, then run on into the two-sack stretch: `pat-ginti` @622. Stage FIX for 10: the room's count (3) carried on into the pontoon: `pat-ganga` @612. Neither reuses `pat-taala` (removed from the cause table).
- Not done: the allocation line "the missing plate is the one after the truck" is met as a parked truck with a count, not as a truck that drives past. Hiding the gap behind a driving truck needed a new engine piece.

## B1: 01-04 into their bands

- 02 `pat02-bhatti`: a second bed with **two litti**, each with its own strike phase (first A2-style ladder). 25.9 s.
- 03 `pat03-patti`: a banner can narrow from its **right** end (roll shows where the new banner hangs). Cause `pat-patti`. 26.6 s. Fixed a fairness miss (final gap 3 -> 2 tiles).
- 04 `pat04-sidhi`: second flight with **three porters** (third one a long breath behind; cause `pat-sidhi`). 37.8 s.
- **01 is not met (15.4 s).** The tour is the shared 120-column course (`TOUR.cols` in `src/game/levels/tour.ts`, outside my files). Walking it is 12.8 s, the bus stop and hoarding add the rest. Every route to 25 s that I could find was waiting (a longer boarding, a second tempo that makes you stay on a kerb board that the first tempo's exit kills you on). That is padding, so I left it. 02 is 0.9 s above its floor.

## B6: PAT-09 checkpoints

`pat09-wapsi`: the horse's first halt is now 2.4 s (was 1.0) and a hidden checkpoint sits at column 39 of the act, reached as the halt begins (cpsafe: standing 1.5 s is survivable). Checkpoint changes on the route now: 38.3, 47.7, 70.8 s. Longest stretch 23.1 s.

## Polish

- PAT-03 roll tell is drawn in the colour of the banner it becomes (no more backdrop cream).
- `lives: 'act'` on 05, 06, 09, 10 (07 had it).
- `Rook!` -> `Ruko!` in lines, skin, comment and docs.
- Replay stretches: 07 got checkpoints in haat (26, 63) and mandi (14); 09 as above. 05 sangam (17 s, one deck with a cart) and 10's stair have no calm spot and stay.
- 07 stays 130.8 s.

## Not done / not checked

- 01 length, 05/06/10 floors (above). Tempo and hoardings still not in the finale.
- `node scripts/flows.mjs` not re-run. Allocation reserve R1 (Agam Kuan) unused.
- The second sack's slide in 05 and 10 is a new betrayal type that I did not check against other cities' lists beyond MECHANICS.md.

## Proofs

See the bottom: tsc, full `npm test`, fairness, shots.

- `tsc --noEmit`: clean. Full `npm test` (PAT on no allow-list): 18 files passed, 1597 tests passed, 0 failed (11 env-gated files skipped). The allocation test is inside it.
- Fairness, `LDD_N=80 npm run fair -- PAT` (every stage >= 90%, every stretch >= 95%; PAT-09's door is the lowest at 96%):

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
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  door 100%
PAT-06: 6t 100%  12t 100%  18t 100%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  s6 100%  s7 100%  s8 100%  s9 100%  door 100%
PAT-07: 6t 100%  12t 100%  18t 100%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  s6 100%  s7 100%  s8 100%  s9 100%  s10 100%  s11 100%  s12 100%  s13 100%  s14 100%  s15 100%  door 100%
PAT-08: 6t 100%  12t 100%  18t 76%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  door 100%
PAT-09: 6t 100%  12t 96%  18t 95%   died: pat-charkhi @236 x2, died: pat-charkhi @235 x1
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  s6 100%  s7 100%  s8 100%  door 96%
PAT-10: 6t 100%  12t 100%  18t 100%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  s6 100%  s7 100%  door 100%
```

- Shot sheets read by me for 03 and 06 (plates numbered, truck at the start, coloured rolls above the hoardings); 02, 04, 05, 07, 09, 10 rendered and copied: `reports/cities/pat/shots/PAT-0[2-7,9]-sheet.png`, `PAT-10-sheet.png`.

Branch tip: `bc43e044f7fd2372fcdef74da459be3b2616029f` on `city/pat`.
