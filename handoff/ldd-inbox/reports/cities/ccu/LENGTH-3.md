# CCU · Kolkata: length round 3

- **Branch:** `city/ccu` in `/local/home/saiposh/personal/ldd-wt/ccu`, tip **`a8ccc60c6979186729ad6e000341dfae990143b2`**. `origin/develop` (ea12cdf) is already merged in; there was nothing new to merge. Not pushed, no version bump.
- **Commits this round**, on top of `21c62bc`:
  - `3d04e9f`: jowar, khor and chhad; bisarjan renamed to khola.
  - `7c69cf1`: phuchka.
  - `ad16dd0`: phire, then chhanta.
  - `83bd6b7`: line.
  - `07a6766`: the line act moved to two-tile bamboo.
  - `f9bf1bd`: pherot, and checkpoints moved off triggers.
  - `a8ccc60`: pars and docs.
- **Clear time** is the scripted route at 120 ticks/s. Ticks below are on that clock. Par = clear × 1.35.
- **Files:**
  - `src/game/cities/ccu/`:
    - `baan.ts`: `Front`, `Ebb`
    - `kumartuli.ts`: `Straw`, `Potter`, `Scraper`
    - `adda.ts`: `Crowd`
    - `pandal.ts`: `Queue`
    - `books.ts`: `Stack.shelve`
    - `causes.ts`: `ccu-khor`, `ccu-bhid`, `ccu-line`
    - `levels.ts`
  - `tests/cities/ccu.ts`
  - `docs/cities/CCU.md`
  - CCU's rows in `docs/MECHANICS.md`
- **Renamed:** round 2's `ccu10-bisarjan` is now `ccu10-khola`, and its sign now reads PANDAL. "Bisarjan" means immersion, which is on the bible's hard-no list (§7: "deities, puja, immersion"). The act is unchanged: the pandal being taken down.

## Result

| Stage | Before (LENGTH-2, `21c62bc`) | **Now** | Floor | Short by | Par |
|---|---|---|---|---|---|
| 05 | 40.4 s | **52.0 s** | 60 s | 8.0 s | 70 |
| 07 | 89.1 s | **94.1 s** | 120 s | 25.9 s | 127 |
| 08 | 34.4 s | **44.8 s** | 60 s | 15.2 s | 60 |
| 09 | 41.7 s | **53.6 s** | 60 s | 6.4 s | 72 |
| 10 | 69.6 s | **94.7 s** | 90 s | **met** | 128 |

06 stays at 62.8 s and meets its floor. 01 to 04 are unchanged.

What is still short, and why:
- **07 (25.9 s short):** the momentum beat (`jowar`) is in, and the shelter beat (`pylon`) is kept. The second new rule is not built. The candidate was the taxi jam (bible §3, yellow taxis nose-to-tail). I could not make its death knowable in time, because the road under the taxis already kills as `ccu-gaari`. The bible has nothing else for Howrah that is not already used.
- **08 (15.2 s short):** one new rule, the phuchka man. HWIK is still one unknown: the adda that holds you. The other bible candidate was the bhanr cup stack, where the top cup is always taken and the stack is restocked. It reads the same as `ccu10-pherot` (a stack that grows), so building it would repeat a rule across stages.
- **09 (6.4 s short):** one new rule, the opening-night queue. That is the bible's own second betrayal for the pandal. I had no other unused pandal seed: the gate on the dhak beat is the door, and the cloth order is the base rule.
- **05 (8.0 s short):** one new rule, the straw yard. That is the bible's own seed: "straw is air, the potter adds clay in front of you". The other Kumartuli hooks are either used already or unverified. Bankura horse and the rain-running paint are unverified, and in the time left I could not get NAIVE and FIX to die of different causes.

## Added acts

| Stage | Act | Type, family | Source seed | Closest shipped idea, and how this differs | A2 / A3 | NAIVE: cause @ tick | FIX: cause @ tick |
|---|---|---|---|---|---|---|---|
| 05 | `ccu05-khor` | new rule; painted-figure-carried-out | Bible §5.5 "straw is air; clay is solid; the potter adds a layer where he's working, in front of you, never behind" | RNC-06 lost-wax (a hollow window you fall through). Here the solid part grows ahead of you, one figure at a time, and you wait for the clay instead of timing a gap. | A2: wait on the bank or on fresh clay for the next figure to go grey. A3: never wait on the painted one beside the straw; it is past the waist and is carried out (05's own rule). | hop straight on to the straw: **ccu-khor @ 4098** | wait on the painted figure for the potter: **ccu-murti @ 4537** |
| 07 | `ccu07-jowar` | **momentum beat**; R2 tidal-bore-front | Allocation R2 chain "ride behind the front; A3 front returns" | PDY-07 and KVT waves (they rise in place or shove you back), and DMN-08's tide count. Here the front travels along the causeway behind you and floods everything it has passed, so you must keep moving. | A2: keep running, and hop each drain short. A3: a long jump over a drain lands in the next one. | stop at the first drain to line up: **ccu-baan @ 7790** | never stop, long-jump the first drain: **ccu-nala @ 7646** |
| 08 | `ccu08-phuchka` | new rule (tough-but-knowable); stand-still-held-by-chat | Bible §5.6 Phuchka: "stop in front of the vendor and he hands you one: you must eat… the crowd forms round him in a ring you can only cross by stopping (and eating)" | AMR-01 aunty feeding you (your next long jump is shorter). Here eating holds you in place for a moment, and the crowd only lets through someone who has just eaten. The maid's water is the timer. | A2: let her water go by, then stop and eat, then go straight through. A3: never climb the crowd. | stop and eat as soon as you arrive: **ccu-dhowa @ 3953** | never stop, climb over the crowd: **ccu-bhid @ 3646** |
| 09 | `ccu09-line` | new rule; cloth-panel-covers-foothold, A3 | Bible §5.9 "second betrayal: the night of opening, the queue"; allocation A3 "opening-night queue shifts holds" | CHN-08 cover-goes-up. Here the holds are people: they step one bamboo on with each dhak beat, and you can neither climb them nor go under. | A2: move up into the bamboo just left, one beat at a time. | climb on to the queue (09 taught "jump on to the top"): **ccu-line @ 4954** | go under the queue: **ccu-bansh @ 4956** |
| 10 | `ccu10-chhad` | callback that breaks 09's dhak rule | Law 7 | 09 `dhak` taught "wait, then run under the frame as it goes up". Here it is hauled up for good, there is no way through underneath, and you ride on top of it. | A2: get on top while it is down, ride it up, step across. | run under it as it goes up: **crushed @ 5306** | full jump at the gallery: **ccu-bansh @ 5144** |
| 10 | `ccu10-phire` | callback that breaks 07's jowar rule (R2's own A3, "front returns") | Allocation R2 A3 | 07 `jowar` taught "outrun the front". Here it comes back at you faster than you can run: get up on the refuge and let it pass. | A2: up on the refuge, then down after it. | keep running ahead, as on the bridge: **ccu-baan @ 5632** | turn and run back from it: **ccu-nala @ 5360** |
| 10 | `ccu10-pherot` | callback that breaks 04's rule | Bible §5.4 FIX: "re-shelved on top" | 04 taught "a stack he points at drops a book". Here a customer is bringing books back: the stack he points at grows, a book at a time, up to the high stall. The quiet stack is the one being bought. | A2: ride the pointed stack up. | wait on the quiet stack (04's habit): **ccu-boi @ 6880** | full jump at the high stall: **ccu-kada @ 6650** |
| 10 | `ccu10-chhanta` | callback that breaks 05's khor rule | Law 7 | 05 `khor` taught "wait for the clay". Here the potter scrapes it off from your end: don't wait. | A2: hop figure to figure ahead of him. | wait on a clay figure: **ccu-khor @ 8296** | one long jump over the lot: **ccu-ganga @ 8152** |

New finale order: bus, tram, **chhad**, **phire**, rok, **pherot**, kumor, **chhanta**, khola, setu.
- Each new act starts after at least one plain beat: two or more columns of plain ground or rok at its start.
- Each new act's intro line is its `advice:` text.
- No new hidden items: each stage keeps its one. None of the new acts had a spot for one that did not sit on a trap.
- The new causes have Tara lines in `causes.ts`:
  - `ccu-khor`: "That was straw, Dad…"
  - `ccu-bhid`: "The crowd round the phuchka man shoved you off the rok."
  - `ccu-line`: "Nobody climbs over the queue, Dad."
- All ids are `ccu-` and unique game-wide; the `npm test` id checks pass.

**`ccu09-dhak` has one play.** The frame can only be passed under as it rises. Landing on top rides it up and down harmlessly, and a jump at any point lands on the lashed bamboo. So there is no second obvious play that dies. I tried two candidates and both lived, as reported in LENGTH-2.

## Identical windows

Every act in CCU, with the verdict on each window: [LENGTH-2.md](LENGTH-2.md), "Probe a", plus the eight rows above.
- Each new act is one window that teaches its own rule.
- The five finale acts are callbacks, and each one breaks the rule its source stage taught.
- `jowar` and `baan` share the R2 source but teach different rules: outrun the front, and ride the launch.

**Identical-window rows: 0.**

## Cause @ tick, every act (lag 0)

Format: script, cause @ tick, replay in seconds. Replay is the time from the last checkpoint to the death. Source: `reports/cities/ccu/lag2.txt`.

**05**
- NAIVE: ccu-phata @ 183, 1.5
- FIX: ccu-murti @ 522, 4.3
- two steps down: ccu-phata @ 701, 1.5
- jump the mud: ccu-ganga @ 1625, 1.1
- step off the carried figure: ccu-ganga @ 1987, 4.1
- straw: ccu-khor @ 4098, 0.5
- wait on the painted one: ccu-murti @ 4537, 4.2

**06**
- NAIVE: ccu-dando @ 791, 2.6
- FIX: ccu-points @ 2150, 2.4
- double-line island: ccu-dui @ 5494, 7.7
- roof at the double junction: ccu-dando @ 4692, 1.0

**07**
- NAIVE: ccu-cha @ 896, 7.5
- FIX: ccu-bojha @ 457, 3.8
- dusk span: ccu-cha @ 4869 / 5433, 4.4 / 3.1
- upside-down span: ccu-cha @ 6867 / 7327, 5.9 / 3.2
- stop at the drain: ccu-baan @ 7790, 7.1
- long jump the drain: ccu-nala @ 7646, 5.9
- wait on the ghat steps: ccu-baan @ 8576, 4.0
- jump at the jetty: ccu-ghat @ 8262, 1.4
- porter who leaves the pylon at once: ccu-cha @ 9382, 3.6

**08**
- NAIVE: ccu-dhowa @ 535, 4.5
- FIX: ccu-khod @ 1283, 1.7
- second adda: ccu-dhowa @ 702, 0.3
- eat at once: ccu-dhowa @ 3953, 4.0
- climb the crowd: ccu-bhid @ 3646, 1.5
- jump the break: ccu-khod @ 2387, 1.6
- sit on after the seller: ccu-khod @ 3930, 6.4

**09**
- NAIVE: ccu-bansh @ 195, 1.6
- FIX: crushed @ 341, 2.8
- staircase top: crushed @ 722, 1.9
- under the canopy: crushed @ 2250, 3.5
- on to the queue: ccu-line @ 4954, 0.8
- under the queue: ccu-bansh @ 4956, 0.8
- jump for the high bamboo early: ccu-bansh @ 2476, 5.4
- rest on the lifted panel: crushed @ 3720, 7.0

**10**
- NAIVE: ccu-boi @ 682, 5.7
- FIX: ccu-nala @ 1703, 3.8
- chhad: crushed @ 5306, 5.6 / ccu-bansh @ 5144, 4.2
- phire: ccu-baan @ 5632, 3.5 / ccu-nala @ 5360, 1.3
- pherot: ccu-boi @ 6880, 3.6 / ccu-kada @ 6650, 1.7
- chhanta: ccu-khor @ 8296, 1.8 / ccu-ganga @ 8152, 0.6
- khola: ccu-bansh @ 8626, 1.4 / crushed @ 8775, 1.6
- setu porters: ccu-cha @ 9891 / 10445, 4.1 / 3.0

In every pair, NAIVE and FIX differ in both cause and tick. 01 to 04 are in LENGTH-2 and are unchanged.

## Checkpoints at three lags

The probe is `/tmp/ccu/zz-lag.test.ts`. It uses `fair.test.ts`'s own lag model: the route's presses go down `lag` ticks late. It plays the route and every death script at lag 0, 6 and 12. Output: `reports/cities/ccu/lag2.txt`.

| Stage | Clear at lag 0 / 6 / 12 | Max stretch at lag 0 / 6 / 12 | Worst replay to a trap at lag 0 / 6 / 12 |
|---|---|---|---|
| 05 | 52.0 / 54.2 / 56.3 s | 17.4 / 17.6 / 17.8 s | ≤ 4.3 s at all three |
| 06 | 62.8 / 63.0 / 63.3 s | 14.8 / 14.7 / 14.6 s | 7.7 / ≤ 7.8 / ≤ 7.8 s |
| 07 | 94.1 / 95.4 / 96.7 s | 13.4 / 13.4 / 13.5 s | 7.5 / ≤ 7.8 / ≤ 7.8 s |
| 08 | 44.8 / 45.4 / 45.9 s | 10.3 / 10.4 / 10.5 s | 6.4 / ≤ 7.8 / ≤ 7.8 s |
| 09 | 53.6 / 55.5 / 57.8 s | 11.6 / 11.7 / 12.1 s | 7.0 / ≤ 7.8 / ≤ 7.8 s |
| 10 | 94.7 / 96.5 / 97.8 s | 18.9 / 19.0 / 19.0 s | 5.7 / ≤ 7.8 / ≤ 7.8 s |

- The route wins at every lag on every stage.
- No death at any lag replays more than 7.8 s.
- Every stretch is ≤ 19.0 s, so there is a checkpoint at least every 19 s, which is inside the 25-30 s calm-checkpoint rule.
- `cpsafe.test.ts` is green.
- Three scripts do not die at lag 6 or 12, so they have no replay to report:
  - 09 NAIVE, at lag 6 and 12;
  - 09 "climbing on to the queue", at lag 12.

  The late jump misses the spot the script aims for, and the run times out alive. All three die at lag 0, where the cause@tick table is measured.

**No checkpoint within 3.5 tiles past a trigger.** I checked this for every act added in rounds 2 and 3, and fixed the ones that broke it:
- `jowar`: checkpoint at 36, past the front's reach. It was at the act start and failed `cpsafe`.
- `phuchka`: checkpoint at 0.5, before the maid's trigger at 1. It was at 3.5.
- `line`: checkpoint at the act start only. It was at 3.4, after the trigger at 1.
- The other new acts have only their act-start checkpoint, which sits before their trigger.

Two older checkpoints may break the rule; I did not move them:
- 06 `points` has a checkpoint at 8 (build pass), inside the window where tram B's spawn is triggered.
- 08 broken rok has a checkpoint at a1 + 0.2 (round 2), 0.2 tiles past the adda zone. That checkpoint is what keeps the sit-on death's replay at 6.4 s; without it the replay was 18.4 s.

## Proof

- `npx tsc --noEmit -p .`: exit 0.
- `npm test` at `a8ccc60`: **18 files passed, 1613 tests passed, 12 skipped (1625)**, exit 0. CCU is on no allow-list.
- Flows (`npm run build:single && node scripts/flows.mjs`): "no errors", exit 0.
- Fairness, `LDD_N=80 npm run fair -- CCU`, at `a8ccc60`. The bar is 0-12 ticks: 90% per stage, 95% per stretch. Every value in the bar is 100%.
```
CCU-01: 6t 100%  12t 100%  18t 100%   s0-s4 100%, door 100%
CCU-02: 6t 100%  12t 100%  18t 100%   s0 100%, door 100%
CCU-03: 6t 100%  12t 100%  18t 76%    s0-s2 100%, door 100%
CCU-04: 6t 100%  12t 100%  18t 88%    s0-s1 100%, door 100%
CCU-05: 6t 100%  12t 100%  18t 93%    s0-s5 100%, door 100%
CCU-06: 6t 100%  12t 100%  18t 100%   s0-s8 100%, door 100%
CCU-07: 6t 100%  12t 100%  18t 76%    s0-s11 100%, door 100%
CCU-08: 6t 100%  12t 100%  18t 100%   s0-s5 100%, door 100%
CCU-09: 6t 100%  12t 100%  18t 84%    s0-s9 100%, door 100%
CCU-10: 6t 100%  12t 100%  18t 76%    s0-s14 100%, door 100%
```
(The full output is `reports/cities/ccu/fair3b.txt`.)
- **Shot sheets:** I re-made 05, 07, 08, 09 and 10 at `a8ccc60`, read them, and copied them to `reports/cities/ccu/shots/`. The new acts all appear and draw without overlaps:
  - 05: the KHOR sign, gold straw and grey clay (33-41 s).
  - 07: CAUSEWAY (60 s), then BAAN with the launch (67 s).
  - 08: the PHUCHKA sign and the crowd (28-35 s).
  - 09: the queue on the bamboo, with the QUEUE sign at the gate (42-50 s).
  - 10:
    - CANOPY (38 s)
    - CAUSEWAY and the refuge (45 s)
    - RETURNS, with the stack risen to the stall (60 s)
    - the grey figures being scraped (68 s)
    - PANDAL (75 s)

Not done:
- the second new rule on 07;
- a second new rule on 08 and on 09;
- a FIX for `ccu09-dhak` (one-line reason above);
- moving the two older checkpoints named above.

Nobody has played these stages by hand. The tester judges 05, 07, 08 and 09 at the honest lengths above.
