# PAT · Patna (Bihar): build report

**Branch** `city/pat` in `/local/home/saiposh/personal/ldd-wt/pat`, tip `fe179fa0cbc1c670d788c01d1d3bc9a87d7d1cbd` (includes a merge of `origin/develop` at 219e3b9, allocation v2).
Nothing pushed, no version bump. `git diff --name-only origin/develop` shows only `src/game/cities/pat/`, `tests/cities/pat.ts`, `docs/cities/PAT.md`, my row in `docs/CITIES.md` and a PAT section in `docs/MECHANICS.md`.
All ten stages are built to the v2 allocation (slot order, meta family/betrayals as in `docs/allocation.json`, `meta.ending` = the door's `pat-` key). No reserve was used.

## Proof

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npm test` (after the last merge of develop) | **18 files passed, 1593 tests passed, 0 failed** (12 files are the env-gated tools, skipped by design) |
| PAT's own share (`npx vitest run -t PAT`) | 105 tests passed: per stage builds, route wins, deterministic, every rival variant, NAIVE dies, FIX dies, MISTAKES die, checkpoints replay exactly and are calm, hidden item, jump audit, module guard (10 stages, NAIVE for 10, FIX for 10, intro lines, no TODO, `pat-` prefix on every key), allocation test (meta matches the slot, endings unique) |
| PAT on an allow-list | no (`EXEMPT` has RNC only) |
| `npm run build:single && node scripts/flows.mjs` | builds; flows: "no errors" |
| Screenshots | `/local/home/saiposh/personal/ldd-inbox/reports/cities/pat/shots/` (`PAT-01-sheet.png` .. `PAT-10-sheet.png` = seven shots along each route, plus the single frames); looked at them all |

### Fairness (`LDD_N=80 npm run fair -- PAT`, human-timing model; bar: 90% stage at average lag, 95% each stretch)

```
PAT-01: 6t 100%  12t 100%  18t 80%    stretches at 12t: s0..s5 100%  door 100%
PAT-02: 6t 100%  12t 100%  18t 100%   stretches at 12t: s0 s1 s2 100%  door 100%
PAT-03: 6t 100%  12t 100%  18t 76%    stretches at 12t: s0 s1 100%  door 100%
PAT-04: 6t 100%  12t 100%  18t 100%   stretches at 12t: s0 s1 s2 100%  door 100%
PAT-05: 6t 100%  12t 100%  18t 100%   stretches at 12t: s0 s1 s2 100%  door 100%
PAT-06: 6t 100%  12t 100%  18t 100%   stretches at 12t: s0..s6 100%  door 100%
PAT-07: 6t 100%  12t 100%  18t 100%   stretches at 12t: s0..s6 100%  door 100%
PAT-08: 6t 100%  12t 100%  18t 76%    stretches at 12t: s0 s1 s2 100%  door 100%
PAT-09: 6t 100%  12t 100%  18t 100%   stretches at 12t: s0..s6 100%  door 100%
PAT-10: 6t 100%  12t 100%  18t 76%    stretches at 12t: s0..s6 100%  door 100%
```

Along the way three stages (08, 09, 03) were under the bar and were fixed by moving hazards or widening windows, never by weakening the troll (hatches narrowed so a late jump still clears them, wheel boarding window moved to the low point of the gondola's arc, bell geometry and period changed so the safe gap is longer than the crossing). The route policies for waits and the bell crossing are state-driven and include their own slack for a late start.

## Stages

Length pass (see LENGTH.md): PAT-05/06/07/09/10 gained acts; clear times below are after it. The fairness block above predates it; the final run (100% at 12t, PAT-09 99%) is in LENGTH.md.

Clear time = the scripted route's clear time (with its waits); par is 1.35 x that.

| Id | Name | Concept | Family / betrayals | Clear | Par | NAIVE death | FIX death | MISTAKES | Fair stage/stretch (12t) | Hidden item | Door ending |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PAT-01 | Prannam, Patna! | PAT-01 tour | crowd-carried-by-vehicle / sidestep-surge | 15.4 s | 30 | `pat-bheed` (swept by the surge) | `pat-tempo` (waited on the kerb board) | run on at the hoarding: `pat-hoarding` | 100 / 100 | litti (above the deck) | none (tour) |
| PAT-02 | Litti ki Aanch | PAT-05 | ember-floor-poker-targets-food / poker-targets-food | 16.3 s | 22 | `pat-angara` | `pat-chimta` (stood in the bed for the rake) | wait, then run into the rolling litti's strike: `pat-angara` | 100 / 100 | chokha, over the middle crack | `pat-musal` (pestle pair) |
| PAT-03 | Ashok Rajpath | PAT-F2 | hoarding-swap-at-class-bell / B8, banner-swap-width | 15.2 s | 21 | `pat-jam` | `pat-jam` (stayed on the hoarding that grew) | - | 100 / 100 | sikki box, above the lane | `pat-ghanti` (bell pendulums) |
| PAT-04 | Golghar | PAT-02 | one-way-stairs-rising-grain / one-way-porters | 22.8 s | 31 | `pat-bojh` | `pat-bojh` (rushed after the first porter, met the second) | - | 100 / 100 | khaja, above the landing | `pat-bhitar` (door swings into you) |
| PAT-05 | Pipa Pul | PAT-04 | float-sinks-under-load / load-sinks | 64.0 s | 86 | `pat-ganga` | `pat-pipa` (waited on a section the cart came to) | - | 100 / 100 | makhana, over the deck | `pat-nawka` (float drifts with the door) |
| PAT-06 | Setu ka Jod | PAT-03 | setu-joint-missing-plate / missing-plate | 64.1 s | 87 | `pat-jod` | `pat-taala` (hopped on to a plate) | - | 100 / 100 | thekua, above the span | `pat-toll` (sensor strip, boom barrier) |
| PAT-07 | Tempo (marathon) | PAT-07 | vehicle-leans-to-rider-side / lean-balance, parked-gap-closes | 130.8 s | 177 | `pat-torana` (stood in the middle with a rider aboard) | `pat-dhakka` (stayed on the road side when the truck passed) | walked straight into the lane at the stand: `pat-bhid` | 100 / 100 (7 stretches) | kulhad, above the stand | `pat-hauled-basket` |
| PAT-08 | Nalanda (HWIK) | PAT-11 (reserve R1 promoted by the allocation) | count-bricks-routes-cells / count-routing | 9.9 s | 13 | `pat-kua` | `pat-kua` (skipped one hatch, took the next) | took the hatch with 1 brick: `pat-kua` | 100 / 100 | pittu (stack of stones), in the first courtyard | `pat-mound` (decoy hatches, zero-brick door) |
| PAT-09 | Sonepur Mela (tough) | PAT-10 | moving-gap-behind-rider / moving-gap, gondola-swing | 72.0 s | 97 | `pat-bheed` (hopped the horse into the crowd) | `pat-jhoola` (took the first gondola that came) | - | 100 / 100 (7 stretches) | sattu glass, high over the fairground | `pat-charkhi` (turnstile) |
| PAT-10 | Setu se Golghar (finale) | PAT-12 | finale-setu-plate-count / plate-count-under-cart | 91.5 s | 124 | `pat-jod` | `pat-taala` | - | 100 / 100 (7 stretches) | litti, over the first seams | `pat-ginti-pad` (numbered pads) |

Acts (all unique, prefixed `patNN-`): `pat02-chokha`, `pat03-batch`, `pat04-anaaj`, `pat05-ghat`, `pat05-sangam`, `pat06-sau`, `pat06-nau`, `pat07-sadak`, `pat07-adda`, `pat08-chowk`, `pat08-vihara`, `pat09-jhoola`, `pat09-ghoda`, `pat10-pipa`, `pat10-sau`, `pat10-sidhi`, `pat10-anaaj`. Nine door endings, none a shipped ending renamed (checked against MECHANICS.md "Door endings" and the `advice:` lines).

### How each stage is a different idea and how A2 / A3 work

- **01** A1: walk on, the crowd surge sweeps you. A2: the kerb board, but it waits for the tempo to leave: lingering kills. A3: board for the crowd only, run on at once. Carry is a kill within one screen. Second bite (not crowd): the falling hoarding.
- **02** A1: run the bed, the first strike is on your line. A2: wait between cracks for ever: the rake sweeps the bed. A3: after the last strike keep moving. Act: the poker follows the rolling litti, so you wait behind it.
- **03** The roll above each hoarding shows the new width. A1 runs; A2 stays on the hoarding that grew; its next swap is narrower. A3 leaves it before.
- **04** Porters descend the stair you climb. A2: climb right after the first; a second steps out of the landing door. A3: let both go by.
- **05** The cart sinks the section it is on. A2: wait on a section the cart is rolling to. A3: wait on the bank, jump the cart's section as it comes.
- **06** Plates numbered over the seams, the missing one is a plain gap. A2: hop every seam to be safe: a plate you land on flips up. A3: walk the plates, jump the one gap.
- **07** Lean = riders on the kerb side + a truck on either side - your side. Stand where it cancels. The "slap" signal from the allocation was removed as instructed; the gap between parked tempos moved into the act (the lane the third tempo backs into).
- **08** see below.
- **09** The crowd parts only behind a horse. A2 follows the horse (works in the room); in the act the first gondola is the occupied one. A3: ride an empty gondola.
- **10** The sack count on the cart is the rule of each part (bridge plates, pontoon sections, the pad at the granary door).

## HWIK (PAT-08 Nalanda), TROLL-BIBLE section D

1. *The death teaches the rule in one look.* You come up in a cell with a well in it, and the cell's bricks (drawn big with the numeral) equal the bricks over the hatch you stepped on.
2. *The second attempt is obvious.* The room hint names the count; after one death the answer is one move: step on the hatch with three bricks (and in the second courtyard, two).
3. *Never twice in a row, never two unknowns in a stage.* Only slot 08 is HWIK, not 01/09/10, and 07 and 09 are plain; the only unknown is "which hatch".
4. *No pixel hunt.* Hatches are in the open floor; the choice is a walk and a hop.
5. *Natural to the city.* Nalanda's rows of identical brick cells.
6. *Fairness.* 100% at average lag; the lethal consequence is one death (a fall into a well, respawn at the start of the courtyard).
The hint names the tell afterwards: "each hatch has bricks drawn over it and takes you to the cell with the same number of bricks".

## Art, sound, language

- Palette from the bible (haze sky, brick tiles, Madhubani red, sikki gold), a Patna skyline (Gandhi Setu girder on piers with moving trucks, Golghar's dome with its two spiral stairs, ghat steps, water tanks, coaching hoardings), animated ambient layer (heat shimmer, dust, trucks), music: 100 bpm kaharwa dholak with a major pentatonic tune, brick ground caps, a drawn hidden item per stage (litti, chokha, sikki box, khaja, makhana, thekua, kulhad, pittu, sattu).
- Every spoken line is one the bible marks VERIFIED (a small set, reused where it fits; Tara's intro for each stage is in `lines.intro`). Signs are English. One deviation: the `seven` line is `Saat baar! Wapas shuru!` (the bible's version of that line is garbled). Tara tells the truth once (`Rook!` at the foot of Golghar's stair); everywhere else her `Chalo, aage!` is the lie.
- No `Math.random`, no `Date`.

## What I cut, and what to look at

- **Length.** Fixed by the length pass, see `LENGTH.md`: route clear times 64.0 / 64.1 / 130.8 / 72.0 / 91.5 s for 05 / 06 / 07 / 09 / 10. Skipped: tempo and hoardings in the finale, new hidden items, per-act Tara intros; `pat06-kumhrar` is a weak troll; PAT-10 clears its floor by 1.5 s.
- **PAT-08's clear time** is short on purpose (the warps skip the walking); it is the stage with the highest death count by design.
- **The "gap between two parked tempos closes" beat** is a lane at the stand that a third tempo backs into, not a pair of solid walls (a solid wall would block the road in a side view).
- **Scene features**: none. Famous places are drawn in the shared Patna backdrop for every stage; there is no separate `scene` for Sonepur or Madhubani (the Madhubani slot was replaced by the hoardings by the allocation).
- **Workaround inside my folder**: the module system has no "tilt" or "swinging" entity, so `entities.ts` has a small `Rig` (a box that can be solid, deadly, moved and drawn by closures); stages 03, 05-10 use it.
- Not checked: playing on a real phone (touch feel); only the headless build and the route bots.

## How to re-run

```
source ~/.nvm/nvm.sh && nvm use 22      # or PATH=/home/saiposh/.local/share/mise/installs/node/22/bin:$PATH
cd /local/home/saiposh/personal/ldd-wt/pat
npx tsc --noEmit -p . && npm test
LDD_N=80 npm run fair -- PAT
npm run build:single && node scripts/flows.mjs
```


## Fix round 1
Superseded numbers and the new acts: see `FIX-1.md`. Clear times now 01 15.4, 02 25.9, 03 26.6, 04 37.8, 05 52.9, 06 37.0, 07 130.8, 08 9.9, 09 73.6, 10 61.9 s; tip `bc43e04`; 1597 tests green.
