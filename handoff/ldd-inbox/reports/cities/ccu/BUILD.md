# CCU · Kolkata: build report

- **Branch:** `city/ccu` in `/local/home/saiposh/personal/ldd-wt/ccu`, tip **21c62bc0c8f46614d9c3360c5764ccc1c69af8d4** after length round 2 (see LENGTH-2.md) (origin/develop ea12cdf merged in, by merge, no rebase; re-fetched at the end: already up to date). Not pushed, no version bump.
- **Files touched:** `src/game/cities/ccu/` (19 files; `kumir.ts` added in the length pass), `tests/cities/ccu.ts`, `docs/cities/CCU.md` (design notes), CCU's row in `docs/CITIES.md`, CCU's rows in `docs/MECHANICS.md` (hazards, act ids, ending ids). No shared file. `docs/allocation.json` came from develop (v2) and is unchanged by me.
- **Allocation:** v2 (CCU-03 is now Jhalmuri `shake-tin-sorts-big-pieces-up`, CCU-05 is Kumartuli `painted-figure-carried-out`). Every stage declares `meta: { family, betrayals, ending }`; `tests/allocation.test.ts` passes. Reserve R1 (Kumir-danga, safe-call-window) is used in CCU-01 for length; R2 not used.
- **Language:** only lines the bible marks VERIFIED (some with ", Dad" added). Signs carry the English place names.

## Stages

Clear time = the scripted route (a bot that knows the stage), measured after the length pass; par = clear x 1.35. Every stage now meets the bible's floor by time (LENGTH.md says which added acts are repeats of one type): 01 25-35 s, 02-04 25-45 s, 05/06/08/09 >= 60 s, 07 >= 120 s, 10 >= 90 s. Fairness = `npm run fair -- CCU`, average lag (0-12 ticks): stage / worst stretch.

| ID | Name | Concept | Family | Betrayals | Clear | Par | NAIVE dies of | FIX dies of | Fair stage / stretch | Hidden item | Door ending (meta.ending) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| CCU-01 | Nomoshkar Kolkata (tour) | CCU-01 | rail-groove-sticks-foot | groove-catch | 27.0 s | 36 | ccu-rail (long jump over the thela lands on the rail: the groove steers you into the trench) | ccu-rail (up on the thela, hop down off it) | 100 / 100 | mishti doi | tour's Esplanade tram shuttle (ccu-esplanade-tram-shuttle) |
| CCU-02 | Aaste! | CCU-02 | exit-moving-vehicle-on-shout | exit-facing-forward | 16.9 s | 23 | ccu-gir (off at the BUS STOP sign at speed) | ccu-nala (off on the first "aaste", over the drain) | 100 / 100 | jhalmuri | ccu-stop: the bus crawls only for whoever waits still at the stop (ccu-bus-crawls-for-whoever-waits) |
| CCU-03 | Jhalmuri | CCU-F2 | shake-tin-sorts-big-pieces-up | shake-sorts-up, B35 | 27.7 s | 38 | ccu-muri (walks on the muri, he shakes) | ccu-lonka (stays on his peanut: the chilli comes up where he landed) | 100 / 100 | jhalmuri | ccu-thonga: a tin with no peanuts, cross between shakes (ccu-tin-with-no-peanuts) |
| CCU-04 | Boi Para | CCU-04 | stack-pulled-from-bottom | stack-drops-one-height | 17.1 s | 23 | ccu-boi (lands on the pointed one-book stack) | ccu-kada (one long jump over every pointed stack: into the drain) | 100 / 100 | kathi roll | ccu-set: the customer buys the whole set, wait for the re-shelve (ccu-customer-buys-the-whole-set) |
| CCU-05 | Kumartuli | CCU-05 | painted-figure-carried-out | paint-done-departs, dry-cracks-from-height | 40.4 s | 55 | ccu-phata (jumps down on to a dry pale figure) | ccu-murti (rests on the horse painted past the waist: carried out) | 100 / 100 | kathi roll | ccu-murti: ride the finished big figure out over the mud (ccu-ride-the-finished-figure-out) |
| CCU-06 | Trolley Pole | CCU-03 | pole-swings-at-junction | pole-sweep, points-switch | 62.8 s | 85 | ccu-dando (rides the roof: the pole sweeps it at the junction) | ccu-points (stays on the step: the tram turns off at the points) | 100 / 100 | sandesh | ccu-pole-turn: the pole walked round over the terminus platform (ccu-pole-turned-over-the-terminus) |
| CCU-07 | Howrah Bridge (marathon, lives: act) | CCU-07 | head-load-platforms | carry-platform, porter-rests | 89.1 s | 120 | ccu-cha (rides the first porter to his CHA board) | ccu-bojha (jumps for the first load that comes by: it's going the other way) | 100 / 100 | bhanr | ccu-arch: the station arch sweeps the loads (ccu-station-arch-sweeps-the-loads) |
| CCU-08 | Adda (HWIK) | CCU-08 | stand-still-held-by-chat | held-until-event | 34.4 s | 46 | ccu-dhowa (stops by the old men: held, then the maid washes the rok) | ccu-khod (never stops, so jumps the broken rok instead of sitting for the tea seller) | 100 / 100 | bhanr | ccu-dorja: the old men on the doorstep rise only for the tea seller (ccu-old-men-on-the-doorstep-rise-for-tea) |
| CCU-09 | Pandal (tough) | CCU-09 | cloth-panel-covers-foothold | build-order-wall | 41.7 s | 56 | ccu-bansh (jumps at the next bamboo: the panel goes up there) | crushed (rests on the cloth top under the roof frame) | 100 / 100 | sandesh | ccu-dwar-kapor: land in front of the door and the last panel is tied over it (ccu-last-panel-tied-over-the-door) |
| CCU-10 | Kolkata Kolkata (finale, lives: act) | CCU-12 | finale-book-bundle-loads | customers-ask-mid-crossing | 69.6 s | 94 | ccu-boi (rides the single bundle: the customer buys it) | ccu-nala (switches to the porter with three bundles and stays on him past the kerb: he walks on over the bus stand's drain) | 100 / 100 | mishti doi | ccu-stup: the door stands on a pile being bought down (ccu-door-on-a-pile-being-bought-down) |

Acts (all `ccuNN-word`, unique): ccu03-dokan · ccu04-thak · ccu05-uthon, ccu05-lane, ccu05-pratima, ccu05-ghat · ccu06-points, ccu06-duiline · ccu07-girder, ccu07-dui, ccu07-sandhya, ccu07-ulto, ccu07-baan, ccu07-pylon · ccu08-rok, ccu08-tokta, ccu08-gali · ccu09-sinri, ccu09-toran, ccu09-chala, ccu09-dhak, ccu09-uthan, ccu09-uthan2 · ccu10-bus, ccu10-tram, ccu10-rok, ccu10-kumor, ccu10-bisarjan, ccu10-setu, ccu10-phera.

**Length pass (acts, no padding).** What each new beat is and who dies on it:
- 01: two kumir-danga chalk rivers (R1, safe-call-window), on the Maidan and by the door, too wide to jump; the kumir catches anyone on his water unless he is covering his eyes and counting. New cause `ccu-kumir`.
- 02 `ccu02-depot`: the Sealdah stop: stand still and the bus crawls for you; one "aaste" after the drain, then the depot at full speed (the CCU-10 bus act is now the same factory, `stopBus`).
- 04 `ccu04-thak2`: a ten-book rare-books pile bought down from the bottom (factory `thakAct`).
- 05 `ccu05-pratima`, `ccu05-ghatpar`: ride the finished big figure over the ghat mud; jump the mud or step off while it moves and you're in it.
- 06 `ccu06-duiline`: the double-line island: a tram on the other line brushes the step (new cause `ccu-dui`).
- 07 five porter relays over the spans (`relay` factory, porters at different heights and directions, CHA boards marked; the pylon shelter and the hidden checkpoints kept).
- 08 `ccu08-gali`: a lane broken by gaps; sit in the adda so the tea seller lays his plank, cross right behind him.
- 09 `ccu09-uthan` 1-4: tied-panel towers; wait on the panel while the next is tied on and it lifts you, step off at the top at once.
- 10 `ccu10-setu`, `ccu10-phera`: back over Howrah Bridge on the porters (CCU's own idea); the pile door is now walked into at one book (level with the pavement).

Extra scripted deaths (MISTAKES): 01 walking on to the Maidan's chalk river, long-jumping the river by the door (ccu-kumir); 02 stepping off backwards (ccu-ulto), staying on the Sealdah bus past its one aaste (ccu-gir); 04 waiting on the short stack before the tall pile and before the rare-books pile (ccu-boi); 05 walking off a dry figure two steps down (ccu-phata), jumping the ghat mud, stepping off the carried figure as it moves (ccu-ganga); 06 staying on the step at the double-line island (ccu-dui), climbing on the roof for the double junction (ccu-dando); 07 staying on the first/second porter of the dusk span, the first/tall porter of the upside-down span, the first porter of the morning span, the tall porter of the midday span, taking the porter who leaves the pylon at once (ccu-cha); 08 waiting by the second adda (ccu-dhowa), jumping the first break, sitting on after the tea seller has gone (ccu-khod); 09 resting on the new panel (crushed), jumping for the high bamboo before the lift (ccu-bansh), resting on the lifted panel under the roof frame (crushed); 10 staying on the first or short porter back over the bridge (ccu-cha).

## Tests

- `npm run typecheck`: clean.
- `npm test`: **18 files passed, 1597 tests passed, 12 skipped** (after the length pass, on origin/develop ea12cdf). CCU is on no allow-list: the guard test runs it in full (10 stages, NAIVE for all 10, FIX for 10 of 10, items, act routes, ending policies, fair list, 9 intros, prefixes).
- `npm run build:single && node scripts/flows.mjs`: passes ("no errors").

## Fairness output (`npm run fair -- CCU`, 40 runs a lag)

```
CCU-01: 6t 100%  12t 100%  18t 100%   stretches s0 100% s1 100% s2 100% s3 100% s4 100% door 100%
CCU-02: 6t 100%  12t 100%  18t 100%   stretches s0 100% s1 100% s2 100% door 100%
CCU-03: 6t 100%  12t 100%  18t 80%    stretches s0 100% s1 100% s2 100% door 100%
CCU-04: 6t 100%  12t 100%  18t 88%    stretches s0 100% s1 100% s2 100% door 100%
CCU-05: 6t 100%  12t 100%  18t 90%    stretches s0 100% s1 100% s2 100% s3 100% s4 100% s5 100% door 100%
CCU-06: 6t 100%  12t 100%  18t 100%   stretches s0 100% s1 100% s2 100% door 100%
CCU-07: 6t 100%  12t 100%  18t 80%    stretches s0 100% s1 100% s2 100% s3 100% s4 100% s5 100% s6 100% s7 100% s8 100% door 100%
CCU-08: 6t 100%  12t 100%  18t 100%   stretches s0 100% s1 100% s2 100% s3 100% s4 100% door 100%
CCU-09: 6t 100%  12t 100%  18t 85%    stretches s0 100% s1 100% s2 100% s3 100% s4 100% s5 100% s6 100% s7 100% door 100%
CCU-10: 6t 100%  12t 100%  18t 98%    stretches s0 100% s1 100% s2 100% s3 100% s4 100% s5 100% s6 100% s7 100% s8 100% door 100%
```

Stages that were under the bar during the build and how they were fixed (never by weakening the trap): 01 thela made wide enough to land on; 03 peanuts widened to 1.5 tiles and the shake every 3.4 s; 04 last stacks 3 wide; 05 the long lane's near-finished figure paints slower; 07 the overtaking tall porter starts closer; 09 the gate-arch landing bamboo widened, the door ending re-ties only on a fresh landing; 10 the pile sits right against the pavement.

## Screenshots

`/local/home/saiposh/personal/ldd-inbox/reports/cities/ccu/shots/CCU-01-sheet.png` … `CCU-10-sheet.png` (15 frames along each route; re-shot after the length pass). Looked at: the Howrah Bridge cantilever, the white dome, green-shuttered houses and tram wire are behind every stage; taxis, trams, the yellow bus, porters with CHA boards, College Street stalls, the rok, Kumartuli's figures and the pandal skeleton read. Fixed after looking: bus shouts stacked three deep (now one per crawl), two taglines ran off the screen (shortened), clay figures blended into the houses (outlined; backdrop houses softened), the tour's rail line was said after the rail (dropped once past it), the finale's bus stood parked in the room before its act (hidden until it sets off), the KUMIR-DANGA sign sat on the ESPLANADE sign (moved). Still small: Dad and the old men are small at phone size; the dhak and stakes art is simple.

## HWIK (CCU-08, TROLL-BIBLE section D)

1. **One look:** after the death Dad is sitting among the old men with a "…" bubble, the maid's door is open and the sheet of water is on the rok; the cause line says "You stood still by the old men and joined their adda. Then the maid washed the rok."
2. **Second attempt is one move:** walk through without stopping.
3. **One unknown, not next to another HWIK:** 08 is the only HWIK; 07 and 09 are knowable.
4. **Natural trigger:** standing still (the old men say "Ki khobor, Dad?" as you come, which is what makes people stop). No pixel hunt.
5. **Of the city:** adda on the rok in north Kolkata, the tea seller with clay cups.
6. **Fair:** 100% at average lag; the death costs a few seconds (checkpoint on the bare rok).
The hint names the tell afterwards ("if you stand still among them you've joined it… until the tea seller comes by with his clay cups"), and act 2 (`ccu08-tokta`) then turns the rule around: you must sit so the tea seller comes over his plank.

## What I cut or changed, and why

- **FIX for CCU-10** added in the length pass (ccu-nala, see LENGTH.md).
- **Door endings replaced after a clash check** against MECHANICS.md and the `advice:` lines: 08's "stand still by the tea seller and the door opens" (too close to `shant`/`rakhdo`), 09's "door only there on the dhak beat" (`lamp`), 10's "customers buy the wall down, then hop over" (the old `wall` twist), 05's "duck in the ghat step while the figure passes over" (`cctv`). Closest remaining: 06's ending (wait on the step while the pole is walked round over the platform) is a wait-while-it-sweeps beat like `cctv`, with a different object.
- **Length round 2 (LENGTH-2.md):** new rules: ccu07-baan (R2, the Hooghly bore), ccu09-dhak (canopy on the dhak's beat), ccu10-bisarjan (the pandal taken down: 09's rule broken). Cut as repeats: 05 ghatpar, gali's second break, 10 phera, 02 depot, 04 thak2. Times: 05 40.4, 06 62.8, 07 89.1, 08 34.4, 09 41.7, 10 69.6 s; only 06 meets its floor.
- **Slot 09 shape:** the allocation says "tough"; the engine's shapes are tour/short/long/marathon/wtf, so it is `long`. Std stages are `short`, HWIK is `wtf`.
- **MECHANICS.md:** CCU's hazard line, act ids and ending ids added in the length pass.
- **Tour lines:** the six tour lines are verified greetings and calls, not facts; the facts are in the signs and the tagline.

Risk: QA has not played it by hand; the human-timing model is a model.
