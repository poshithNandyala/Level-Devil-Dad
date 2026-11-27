# PAT length pass: LENGTH.md

Branch `city/pat`, tip `fe179fa0cbc1c670d788c01d1d3bc9a87d7d1cbd` (develop 219e3b9 already merged). Nothing pushed, no version bump.
Edits only in `src/game/cities/pat/`, `tests/cities/pat.ts`, `docs/cities/PAT.md`, and my rows in `docs/CITIES.md` / `docs/MECHANICS.md`.
Clear time = the scripted route's time (`play(def, SOLUTIONS[id])`, ticks / 120).

## Before / after

| Stage | Floor | Before | After | Par (route x 1.35) | Acts before -> after |
| --- | --- | --- | --- | --- | --- |
| PAT-05 Pipa Pul | 60 s | 37.2 s | **64.0 s** | 86 | 2 -> 3 (`pat05-bori`) |
| PAT-06 Setu ka Jod | 60 s | 23.4 s | **64.1 s** | 87 | 2 -> 4 (`pat06-gaadi`, `pat06-kumhrar`) |
| PAT-07 Tempo (marathon) | 120 s | 49.9 s | **130.8 s** | 177 | 2 -> 5 (`pat07-pul`, `pat07-haat`, `pat07-mandi`) |
| PAT-09 Sonepur Mela | 60 s | 40.6 s | **72.0 s** | 97 | 2 -> 3 (`pat09-wapsi`) |
| PAT-10 Setu se Golghar (finale) | 90 s | 30.5 s | **91.5 s** | 124 | 4 -> 6 (`pat10-bori`, `pat10-gaadi`) |
| PAT-08 Nalanda | stays short | 9.9 s | 9.9 s | 13 | unchanged (the warps skip the walking) |
| PAT-01..04 | unchanged | 15.4 / 16.3 / 15.2 / 22.8 s | same | same | unchanged |

All five floors are met. 10 clears its floor by 1.5 s only; I did not pad it further.

## Added acts

Each act is a rhythm built on one of PAT's own ideas with a betrayal type that nothing in PAT used before. In every act the first part is plain (the first sections or seams are walked before the first window opens), so there is at least one plain beat from the act before. Each has a NAIVE and a FIX in `MISTAKES` (`tests/cities/pat.ts`, `ACT_MISTAKES`; they play the stage up to the act and then die in it, so they run in the normal `levels.test.ts` suite). None of the new acts uses two betrayals in one micro-room.

| Act | Family (allocated to PAT) | New betrayal type | NAIVE (dies) | FIX / A2 (dies) | A3 (the answer, one move) |
| --- | --- | --- | --- | --- | --- |
| `pat05-bori` | float-sinks-under-load | `sack-drop-sinks`: a porter's sack hangs over a section for a second, then lands; the section stays awash while it lies there (6 windows, 24 sections) | run across: the first loaded section is awash | wait on the section the sack is swinging over | wait at the end of the section before it |
| `pat06-gaadi` | setu-joint-missing-plate | `truck-lifts-plate`: a truck lifts each numbered plate out of its seat for 2.2 s, shaking a second before (18 seams, a ripple, repeats) | run on over the seams | wait on the first plate | wait on the deck, cross a seam only while its plate is in and still |
| `pat06-kumhrar` | reserve R2 `polished-pillar-stumps-slick` (PAT-F1) | `polish-slick`: a row of stone stumps, four of them polished (slippery solids) | walk on without jumping | stop at each edge and jump from standing: fine on rough stone, but on the first polished stump you slide off | run on and jump every gap |
| `pat07-pul` | vehicle-leans-to-rider-side | `road-side-rider`: a rider gets on the road side, so the lean is the other way round; then a road-side truck with nobody else aboard | stand still in the middle | balance for kerb-side riders only | stand opposite the heavier side before each hump and arch |
| `pat07-haat` | same | `riders-cancel`: a kerb rider and a road rider cancel; one gets off; a kerb-side truck evens it up again | stand still in the middle | balance for kerb-side riders only | read who is aboard, stand opposite |
| `pat07-mandi` | same | `halt-before-hump` (shelter beat: balance during the 2.5 s halt) and `no-halt-run` (momentum beat: arch, hump, arch with no halt) | stand still in the middle | balance for kerb-side riders only | balance during the halt, then keep the same side through the run |
| `pat09-wapsi` | moving-gap-behind-rider | `horse-turns-back`: the horse goes 60% along, halts, comes back to 20%, halts, then goes through; the gap follows him both ways | hop the horse into the crowd | let him go and follow late | stay right behind him, walk backwards when he turns |
| `pat10-bori` | finale-setu-plate-count (plate-count-under-cart) | `count-loads-section`: the cart at the foot carries three sacks, every third section is loaded by the porters in turn (9 windows, 30 sections) | run on | wait on the third section | wait before each third section |
| `pat10-gaadi` | same | `count-lifts-plate`: the cart carries two sacks, every second plate is the one a truck lifts (16 seams) | run on | wait on an even plate once it is back | wait on the deck before each even seam |

### Reserve and source

Reserve R2 (Kumhrar, `polished-pillar-stumps-slick`) is used once, in `pat06-kumhrar`. Source: https://en.wikipedia.org/wiki/Kumhrar ("Assembly hall of 80 pillars": pillars of polished sandstone monoliths, arranged in 8 rows of 10, 4.57 m apart, Mauryan period, Kumhrar, Patna). Reserve R1 (Agam Kuan, `well-returns-what-falls`) is not used: I could not name a source for its lore and its chain needs a "thing comes back later" object the engine does not have.

### Marathon (PAT-07)

- Shelter beat: the halt before a hump in `pat07-mandi` (and the stops in `pat07-pul`, `pat07-haat`): the tempo stands 2.5 s and you balance during it. Momentum beat: the last three scrapes of `pat07-mandi` with no halt between them.
- `lives: 'act'` is kept: the 7th death returns to the start of the act.
- Hidden checkpoints are passed on your feet and calm: `cps` at deck positions with no scrape within 1.5 s of standing still (`cpsafe` passes). Checkpoints in `pat07-pul`, `-haat`, `-mandi` at act columns 47.5, 40, 62 plus each act start; 13 in the stage.
- The allocation's parked-gap beat stays in `pat07-adda` (unchanged).

### Finale (PAT-10)

The finale uses only PAT's own ideas: plates (the Setu), the pontoon, the porters' stair (Golghar), in this order: Setu seams -> pontoon -> Setu with five sacks -> **pontoon with porters loading** -> Golghar stair -> **Setu in traffic** -> yard -> pads. Two of the new acts use the cart's sack count as the rule, as the allocation's twist says. Tempo lean and hoardings are not in the finale (see "What I did not do").

## Proofs

- `npx tsc --noEmit -p .`: clean.
- Full `npm test`: **18 files passed, 1593 tests passed, 0 failed** (12 files are the env-gated tools, skipped by design). PAT is on no allow-list; `tests/allocation.test.ts` is green (every stage's meta.family/betrayals match v2, every meta.ending is `pat-<kebab>` and unique, act ids unique).
- Per added act: its NAIVE and FIX die in the normal suites (`punishes: ...` tests), routes win, checkpoints replay exactly and are safe (`cpsafe`), jump audit passes.
- Fairness, `LDD_N=80 npm run fair -- PAT` (bar: 90% stage, 95% each stretch at average lag 0-12 ticks):

```
PAT-01: 6t 100%  12t 100%  18t 80%
PAT-02: 6t 100%  12t 100%  18t 100%
PAT-03: 6t 100%  12t 100%  18t 76%
PAT-04: 6t 100%  12t 100%  18t 100%
PAT-05: 6t 100%  12t 100%  18t 100%   stretches at 12t: s0..s4 100%  door 100%
PAT-06: 6t 100%  12t 100%  18t 100%   stretches at 12t: s0..s10 100%  door 100%
PAT-07: 6t 100%  12t 100%  18t 100%   stretches at 12t: s0..s12 100%  door 100%
PAT-08: 6t 100%  12t 100%  18t 76%
PAT-09: 6t 100%  12t 99%   18t 100%   (one run died at the turnstile at 12t)  stretches s0..s7 100%  door 99%
PAT-10: 6t 100%  12t 100%  18t 76%    stretches at 12t: s0..s8 100%  door 100%
```
  The waits in the new routes are state-driven (they read the window, with a second of slack), so lag does not break them.
- Shots (new sheets, 11 frames along each route, read by me): `/local/home/saiposh/personal/ldd-inbox/reports/cities/pat/shots/PAT-05-sheet.png`, `PAT-06-sheet.png`, `PAT-07-sheet.png`, `PAT-09-sheet.png`, `PAT-10-sheet.png`. Seen: the numbered plates and the truck over a lifted seam, the polished stumps (paler, shiny) against the rough ones, the leaning tempo with riders on both sides and the third and fourth trucks, the horse and the crowd closing behind him, the porters' sack over a pontoon section (small).
- `npm run build:single && node scripts/flows.mjs` passed earlier on this branch; the build was redone for the shots.

## Checkpoints and replay

Calm checkpoints are the act starts plus mid-act ones where the act is long: `pat05-bori` 37.5, `pat06-gaadi` 52.5 and 88.5, `pat07-pul` 47.5, `-haat` 40, `-mandi` 62, `pat10-bori` 44, `pat10-gaadi` 40.5 and 76.5. The longest stretch between two checkpoints in the new acts is about 25 s of route; a death replays the attempt's inputs to the checkpoint as a fast-forward (the checkpoint test replays a whole 130 s stage in under a second of wall time). `pat09-wapsi` has none inside the crowd lane (the lane moves, so no spot in it is calm): its stretch is the act start to the door, about 25 s.

## What I cut, did not do, and what is still short

- **No hidden item in the new acts.** The engine's guard test requires exactly one hidden item per stage; each stage keeps its own.
- **No extra Tara intro per act.** Tara has one intro per stage (`lines.intro`); each added act has its own hint part (`advice`), which the hint screen shows for that stretch.
- **Tempo lean and hoardings are not in the finale.** I spent the time on the plates/pontoon/porters acts; the finale clears the 90 s floor by 1.5 s. If QA wants more in it, the tempo ride (`s07.ts` `tempo()`) would need its clock detached from the stage start first (it times boarding from tick 0), so I did not reuse it.
- **`pat06-kumhrar` is the weakest troll.** Slippery stone mostly removes your ability to brake; the only deaths are from stopping on it. It is honest rhythm, not a deep trap, and I say so rather than dressing it up.
- **PAT-08 stays short by design** (9.9 s); **PAT-01..04 unchanged**.
- **Waits are part of the route time.** The sack and lift acts have waiting on a window; that is the puzzle (read the window, wait at the right place), but a player who dies will spend more time than the bot.
- Not checked: playing on a real phone.

## Performance note

The longer stages made the checkpoint-replay test (5 s per test) tight for PAT-10 under load, so `Rig` now takes `near` (a piece of the stage more than 900 px from Dad does not update); the stage-10 replay test went from 2.8 s to 1.6 s on its own. Behaviour near Dad is unchanged (all routes and fairness numbers above are from after the change).


## Update (fix round 1)
`pat06-kumhrar` cut; 05/06/10 repeats cut, so 05 = 52.9, 06 = 37.0, 10 = 61.9 s (under the floors, reasons in `FIX-1.md`). Table above is out of date.
