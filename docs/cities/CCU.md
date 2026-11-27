# CCU · Kolkata, West Bengal (city module, 10 stages)

Built on `city/ccu` from the CCU bible (ldd-inbox/docs/cities/CCU.md) and allocation v2 (docs/allocation.json).
Code: `src/game/cities/ccu/` (levels, endings, causes, entities + books, tram, porters, adda, pandal, muri,
kumartuli). Routes and the plays that must die: `tests/cities/ccu.ts`.

Language: only the bible's VERIFIED lines (Nomoshkar, Ki khobor, Ki holo, Abar, Bujhte parle na, Darun,
Khub bhalo, Bãchao, Thamun, Aaste, Howrah Howrah Howrah, Ei jinishtar dam koto, Ei je shunun, Maf korben,
Ashi, Bhalo theko, Jatra shubho hok, Saat baar), some with ", Dad" added.


**Fix round 1 (after QA round 1):**
- Cut as retired ideas (allocation v2): `ccu05-khor` and `ccu10-chhanta` (maker ahead), `ccu08-phuchka` (forced food).
- Cut as repeats:
  - `ccu07-sandhya`: the room's relay again. `ulto` is its one momentum beat.
  - `ccu05-pratima`: the door `ccu-murti` is now the stage's only carried crossing.
  - `ccu08-gali`: tokta's decision a second time.
  - `ccu10-rok`: it replayed 08's answer.
- Moved, so that no checkpoint is captured on a moving tram step or load:
  - 06 `duiline` now ends on its island.
  - 07 now ends on the bore's ghat steps, and the arch door has its own porter.

**Fix round 2 (allocation v3, DECISIONS.md 5):**
- Cut, each for the reason in DECISIONS.md section 5:
  - `ccu05-uthon` (S4)
  - `ccu07-baan` (S6)
  - `ccu07-ulto` (W4, once F481 was built)
  - `ccu08-tokta` (W3: the door keeps the stage's reversal)
  - `ccu09-uthan2` (S3)
- Recast: `ccu05-lane` to the paint-line read only (S4: no dry clay in the lane; walk-down-never-jump is RNC-07's). Its jump script now dies in the mud (ccu-ganga).
- Built:
  - `ccu07-horn` (v3 F481, the sound beat: the porters step back on the lorry's horn; be on the back of the load)
  - `ccu07-board` (v3 F502: the board seats one; stay on, yours walks on past it)
  - `ccu10-kumir` (01's kumir broken: he counts backwards with his eyes open; cross when he stops)
  - `ccu09-line`, two beats longer (09's labelled momentum beat)
- Re-laid:
  - 06 has a second island stop mid-ride with ground, where you step off and back on.
  - 07's horn and board start on a long pylon step.

| # | Stage | Allocation family / betrayals | The room | Acts | Door ending (meta.ending) | NAIVE / FIX |
|---|---|---|---|---|---|---|
| 01 | Nomoshkar Kolkata (tour) | rail-groove-sticks-foot / groove-catch | Land on the tram rail from a jump and the groove locks your foot: it steers you along its line, no turning or jumping, into the rail-works trench. Walk on to the rail instead (up on the thela, walk off). | (tour) + two kumir-danga chalk rivers (R1 safe-call-window: cross only while the kumir counts; ccu-kumir) | the Esplanade tram shuttle (ccu-esplanade-tram-shuttle) | long jump over the thela / hop up and hop off: both ccu-rail |
| 02 | Aaste! | exit-moving-vehicle-on-shout / exit-facing-forward | You ride the bus's footboard; it never stops. Off at speed: ccu-gir. Off backwards: ccu-ulto. The first "aaste" crawl is over the open drain; step off forward on the second. | (none: the ccu02-depot act was a repeat of the finale's bus and is out) | ccu-stop: the bus crawls only for someone standing still at the stop; ride it across the drain (ccu-bus-crawls-for-whoever-waits) | off at the BUS STOP sign: ccu-gir / off on the first aaste: ccu-nala |
| 03 | Jhalmuri | shake-tin-sorts-big-pieces-up / shake-sorts-up, B35 | The seller's tin is the floor; each shake sinks the muri and lifts the peanuts. From the second shake a green chilli comes up where you last landed: hop to the next peanut. | ccu03-dokan (wider tin, quicker hand) | ccu-thonga: a tin with no peanuts, cross between shakes (ccu-tin-with-no-peanuts) | walk on the muri: ccu-muri / stay on a peanut: ccu-lonka |
| 04 | Boi Para | stack-pulled-from-bottom / stack-drops-one-height | The customer points at a book; the seller pulls it and that stack drops by one (at once if you land on it). A stack of one goes from under you; a pointed stack of two holds you. | ccu04-thak (a too-tall pile of 7 bought down; wait on the pavement, not the short stack; thak2 was a repeat and is out) | ccu-set: the customer wants the whole set; wait for the re-shelve (ccu-customer-buys-the-whole-set) | hop every stack: ccu-boi / wait on a stack: ccu-boi |
| 05 | Kumartuli | painted-figure-carried-out / paint-done-departs, dry-cracks-from-height | The paint line climbing each clay figure is the clock: at the crown it's carried out with you. Pale dry figures crack under a landing from height: walk down on to them. | ccu05-lane (recast, S4: the paint-line read only, no dry clay), ccu05-ghat (finishing in order) (ride the big figure over the ghat mud) | ccu-murti: ride the finished big figure out over the mud to the landing (ccu-ride-the-finished-figure-out) | jump down on the dry one: ccu-phata / rest on the horse: ccu-murti |
| 06 | Trolley Pole | pole-swings-at-junction / pole-sweep, points-switch | At the junction the pole jumps the wire and sweeps the roof: ride the rear step. | ccu06-points (the pointsman's lever: the tram turns off, step and all; off at the island, take the next), ccu06-duiline (the other line's tram brushes the step at the double-line island: ccu-dui) | ccu-pole-turn: the pole walked round over the terminus platform (ccu-pole-turned-over-the-terminus) | ride the roof: ccu-dando / stay on the step: ccu-points |
| 07 | Howrah Bridge (marathon, lives: act) | head-load-platforms / carry-platform, porter-rests | Ride the porters' head-loads over the taxis; each sets his load down at a marked CHA board (the schedule); switch before it. Oncoming loads knock you off. | ccu07-girder (hop down to a short porter overtaking), ccu07-dui (two streams, tall oncoming overhead), ccu07-ulto (the room's relay over a long span, the other way up: its one momentum repeat), ccu07-jowar (R2 A3, the momentum beat: the bore's front floods the causeway behind you; hop each drain short and keep running), ccu07-pylon (shelter: don't take the one who leaves at once), ccu07-baan (R2, the Hooghly bore: the wave drowns the ghat steps and floats the moored launch up the river to the high jetty; be on the launch before it, step off at the crest; the stage ends on the ghat's top step) | ccu-arch: the station arch sweeps the loads, step off on to the platform (ccu-station-arch-sweeps-the-loads) | stay on the first porter: ccu-cha / jump for the first load by: ccu-bojha |
| 08 | Adda (HWIK) | stand-still-held-by-chat / held-until-event | Stand still among the old men on the rok and you've joined their adda until the tea seller passes; the maid's bucket washes the rok meanwhile. | ccu08-rok (washes on a beat), ccu08-tokta (the broken rok: sit down so the tea seller comes over his plank) | ccu-dorja: the old men on the doorstep only rise for the tea seller (ccu-old-men-on-the-doorstep-rise-for-tea) | stop to listen: ccu-dhowa / never stop, jump the broken rok: ccu-khod |
| 09 | Pandal (tough) | cloth-panel-covers-foothold / build-order-wall | The decorators tie a cloth panel exactly where your next foothold was: a wall; full-jump on to its top. Under the roof frame they tie the next panel above it: off at once. | ccu09-sinri (cloth staircase), ccu09-toran (two panels at once), ccu09-chala (no frame: ride the raise up), ccu09-dhak (the canopy frame let down on the dhak's beat over lashed bamboo: wait before it, run under as it goes up), ccu09-line (opening night: the queue steps one bamboo on each dhak beat; move up into the bamboo just left), ccu09-uthan, uthan2 (tied-panel towers lift you; step off at the top at once; uthan2 is the momentum repeat) | ccu-dwar-kapor: land in front of the door and he ties the last panel over it; jump straight in (ccu-last-panel-tied-over-the-door) | jump at the next bamboo: ccu-bansh / rest on the cloth: crushed |
| 10 | Kolkata Kolkata (finale, lives: act) | finale-book-bundle-loads / customers-ask-mid-crossing | Book porters cross the road; customers point at the bundle they want and the pile drops one. | ccu10-bus (crawls for you, one aaste before the depot), ccu10-tram (step, junction, off before the points), ccu10-chhad (09's dhak broken: ride the canopy up, never under), ccu10-phire (07's front broken: it comes back at you, get up on the refuge), ccu10-pherot (04's stacks broken: the pointed stack grows, ride it), ccu10-kumor, ccu10-khola (the pandal taken down: the cloth tops are untied under you, the bamboo holds; a panel let down on the bamboo under the frame), ccu10-setu | ccu-stup: the door stands on a pile being bought down; walk in at one, level with the pavement (ccu-door-on-a-pile-being-bought-down) | ride the single bundle: ccu-boi |

Hidden items: mishti doi (01, 10), jhalmuri (02, 03), kathi roll (04, 05), sandesh (06, 09), bhanr (07, 08).
Death causes (all in causes.ts): ccu-rail, ccu-gir, ccu-ulto, ccu-nala, ccu-boi, ccu-kada, ccu-muri, ccu-lonka,
ccu-murti, ccu-phata, ccu-ganga, ccu-dando, ccu-khod, ccu-points, ccu-cha, ccu-gaari, ccu-bojha, ccu-arch,
ccu-dhowa, ccu-bansh, ccu-dui, ccu-kumir (plus the shared `crushed`).

## Fairness (npm run fair -- CCU, 40 runs a lag; bar 90% stage, 95% each stretch at 0-12t)

See ldd-inbox/reports/cities/ccu/BUILD.md for the final numbers.

## Notes for MECHANICS / WAVE1 (integrator)

- New kit inside the module: Rail (groove lock), Bus (footboard rules), Stack/Customer/Muck, Tram (pole sweep,
  points, stops), Porter/BookPorter/ChaiBoard/Road, Adda/TeaSeller/Wash/House, ClothPanel/Decorator/Stakes,
  Tin (muri shake), Figure/BigFigure/Ghat, Kumir (chalk river, safe while he counts).
- Closest shipped ideas: 01 vs GNR-06 mud (this one steers you); 06 ending vs `cctv` (wait while something
  sweeps): different object and you wait on the step, but close in feel.
