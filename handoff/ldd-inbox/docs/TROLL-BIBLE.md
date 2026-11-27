# TROLL BIBLE: how a Level Devil Dad stage trolls

Read this with `AGENTS.md` (the bar), `docs/MECHANICS.md` (taken ideas) and `docs/HANDOFF.md` section 3 (engine). Written 2026-11-27 for the builders of the remaining cities.

**Tags.** [M] measured in the owner's dossier. Careful: the dossier's numbers are a *reconstruction of the old 80-room web build* by a third party, not the current app, so [M] means "from the dossier's data", not "official". Room ids `L01`-`L40` are the dossier's stage cards (Pits 1 = L01 ... Warps 5 = L40). [O] observed on a web page, linked. [I] my inference. In the archetype table, anything with an `Lnn` is [M]; everything else is [I].
**Sources:** D = the dossier (PDF, 39 pp). P1 [Poki page](https://poki.com/en/g/level-devil). P2 [Apple editorial](https://apps.apple.com/fi/ipad/story/id1732098061). P3 [WellPlayed review](https://www.well-played.com.au/level-devil-review/). P4 [Syobon Action / Cat Mario](https://en.wikipedia.org/wiki/Syobon_Action). P5 [Trap Adventure 2](https://en.wikipedia.org/wiki/Trap_Adventure_2). P6 [I Wanna Be the Guy](https://en.wikipedia.org/wiki/I_Wanna_Be_the_Guy). P7 [Getting Over It](https://en.wikipedia.org/wiki/Getting_Over_It_with_Bennett_Foddy). P8 [Jump King](https://en.wikipedia.org/wiki/Jump_King). P9 [Super Meat Boy](https://en.wikipedia.org/wiki/Super_Meat_Boy).
**Not verified:** the creator's Reddit AMA and the Gamigion article (both blocked when fetched; I rely only on what the dossier quotes from them), real player death counts (nobody has them; D says so), the current official build's physics.
**Two facts that shape everything:** (1) The original rooms are *tiny*: expert best times are 25.7 to 43.7 s per five-room door, 5.2 to 8.7 s a room [M, D p4]. Our stages are 25 s to 3 min on purpose. So a long stage here is **a chain of tiny rooms** (a "beat" between two checkpoints or acts), and every law below applies to each beat, not to the whole stage [I]. (2) `AGENTS.md` says 8 stages a city; the owner's brief for this bible says 10. Section E gives 10; if a city ships 8, drop 03 and 09 [I].

---

## A. The ten laws

1. **One dominant joke per beat.** A beat has one thing that betrays; everything else is plain. L17 (Coins 2) is only an invisible bridge. L21 (Controls 1) is only reversed controls, nothing else on screen. D's budget: 1-2 reversals in an ordinary room, 3 at most in a final stage [D rule 05, proposed].
2. **The countermeasure becomes the vulnerability.** What a room taught you is what the next one punishes. L17 teaches "trust the gap, it is a bridge"; L18 (Coins 3) then drops that same floor if you dwell on it. L09 teaches "do not stop, the wave catches you"; L10 gives you a refuge to stop in, and fleeing keeps starting new waves.
3. **Semantic reversal.** A familiar thing means the opposite: coins you walk on instead of collect (L17; also P2: "in one level, coins can be picked up; in the next, you walk on top of them"), a gap that is a floor, a button that is a hazard. The player's *vocabulary* is the trap [P2].
4. **Counter-adaptation, A1 to A2 to A3.** Attempt 1 trusts the picture. Attempt 2 fixes the obvious thing and meets a second trap exactly where the fix lands. Attempt 3 is the real answer, and it is simple. L07: first spike moves left, second moves right, so a fixed correction fails. L35: four springs shift right, left, right, right. AGENTS.md already demands this ("the obvious fix dies too", at least half the stages).
5. **Shelter versus momentum, alternating.** One beat punishes stopping (L09 wave, L28 scaffold that drops at a deadline, L16 pausing for coins). The next punishes rushing (L29 wait for the stable platform, L30 wait on the penultimate step, L11 retreat from the rising block). Never two "do not stop" beats back to back in a stage: the player's new rule would be right twice and the troll lands on no one [I].
6. **The known rule goes stale.** L25 (Controls 5): the reversal is not fixed; it flips back at each gap, so "I know it is reversed" is wrong. L29: three platforms return on a beat; the fifth looks solid and is not yet. Every rule a stage teaches must be broken later in *that* stage or the next [I].
7. **The capstone breaks the sequence it taught.** L30: steps 1-5 fall in order, so you learn "climb fast"; step 6 rises and the last one falls, so the answer is to wait on the penultimate step. L39: portals each send you one step back, so the sixth is the finish only after a delay. Finales call back only their own city's ideas (AGENTS.md, and the original's "hell gate" does the same: one big level mixing the door's tricks [P3, P1]).
8. **Instant retry.** D measured the reconstruction at about 0.5 s to the retry state plus 0.3 s to enter [M, D p16] and proposes a 350 ms median / 500 ms worst-case target [D rule 09, proposed]. Super Meat Boy's restart is immediate and is a core part of why a 300-level meat grinder is bearable [O, P9]. Never put a death animation, ad, card or counter between death and the next input beyond that budget.
9. **Honest readability after death.** The player must be able to say what killed them. L03's lateral floor shift moves 64 px over 0.5 s in plain view; L23's "Up throws the spikes upward" is visible as it happens. D's test: at 360 px width, 9 of 10 viewers can name the cause after two muted viewings [D rule 18, proposed]. "My fault" is the wrong target; the target is "now I understand, and my next decision matters" [D p18]. In this game that is the death line (`CAUSE_LINES`) plus Tara.
10. **Tiny rooms, zero noise.** Flat colour, a few shapes, the door visible [D p17, O]. Nothing decorative may look like a floor, a hazard or a door. Backdrop detail goes behind the playfield and never in Dad's row [I].

---

## B. Archetype catalogue (40)

**Status:** USED = the experience already exists here (do not build it again; the stage is named). PARTLY = a neighbouring version exists; you may only use the part marked FREE. FREE = no hit in `docs/MECHANICS.md` or `src/game` as of v0.16.14 (I grepped: coin, portal/teleport, saw, clone, jetpack, bomb, bullet; **always grep your own nouns and verbs before you commit**). A new skin on a USED row is a repeat (AGENTS.md bar 1).
**Fairness window** means how to keep the first death readable and the second attempt winnable. "Gap between beats" is the time from the first event to the second; the measured range is 0.5 to 1.75 s (L05, L11, L14, L18) [M].

| # | Archetype (dossier room) | Expects → betrayal | Second-attempt rule | Fairness window | Status |
|---|---|---|---|---|---|
| B1 | Fake floor (L01) | Solid floor → vanishes when touched or approached | Jump the span | Whole span 1-2 tiles; visible crack tell | USED (troll kit `fakeFloor`; TVM-04 fronds) |
| B2 | Floor drops ahead (L01, L02) | Floor ahead is safe → it falls when you are ~7-11 tiles in (L01 +11, L02 +7) | Two strips, second faster (L02: 100 then 200 px/s): treat every strip as temporary | Fall speed 100-200 px/s over 2 s [M]; strip lands in a jump | USED (TVM-01 `gapAhead`) |
| B3 | Floor slides sideways (L03, L04, L05) | Waiting for it to fall → it moves 64 px (L03) or 192-240 px (L04, L05) | Plan around the shifted floor | Move takes 0.5-2 s, in plain view | PARTLY (kit `shiftAt` exists; no named stage) |
| B4 | Two-beat floor: twitch, then the real shift (L04, L05) | The small twitch (16 px, 0.1 s) is all → a second, larger shift follows | Wait out both | Twitch and shift are separated by at least 0.5 s | FREE |
| B5 | Cadence, then a liar (L29) | A platform returns every 1.5 s → the fifth flashes non-solid at 7 s and is real only at 8 s | Count the beat, skip the flash | Flash must be visibly different (outline only); real return same sprite each time | FREE |
| B6 | Scaffold with a deadline (L28) | Platforms appear every 1.25 s → all drop at +6.5 s | Never wait on a safe-looking one | Build-up readable; deadline shown by a cue 1 s before | PARTLY (timed blinkers taken; deadline collapse FREE) |
| B7 | Staircase that eats itself (L30) | Climb fast → steps fall in order, step 6 rises, last falls | Wait on the penultimate step as it rises | Steps fall at 0.3 s spacing (L30: .6/.9/1.2/1.5/1.8 s) | PARTLY (crumbling floors taken; rising penultimate FREE) |
| B8 | Shrinking supports (L27) | Platform is 48 px wide → shrinks to 32 over 5 s | Move early; the last platform is the narrowest | Never narrower than 1 tile (D rule 13: landings at least 1.5 widths, i.e. 15 px for Dad) | FREE |
| B9 | Belt that reverses (L27) | Belt carries you left → it reverses | Time the reversal | Belt speed 50 px/s [M] is slower than Dad's 140 | PARTLY (treadmills taken in BOM) |
| B10 | Invisible bridge (L17) | A gap you must jump → it is walkable | Walk; later rooms punish dwelling (L18) | Draw a faint tell (gap too short for the drawing) | PARTLY (door `invisible` taken; floor FREE) |
| B11 | Spike that slides aside (L06, L07) | Jump over the spike's old spot → it moved 16 px in 0.25-0.32 s | The second spike moves the other way (L07) | A 16 px move is one tile; Dad's jump lands wider than that | PARTLY (pop-up spikes taken; visible slide FREE) |
| B12 | Spike wave (L09) | Run the stairs → each spike rises x/120 s after the trigger | Never pause; keep cadence | Wave speed under Dad's 140 px/s run so a runner outpaces it | FREE |
| B13 | Wave with a refuge (L10) | Flee the wave → a recess is safe; fleeing past it triggers a reverse wave (L10 T2) | Shelter in the recess, wait, then go | Refuge at least 1.5 body widths wide [D rule 13] | FREE |
| B14 | Hop-landing spike | A small hop clears it → spikes sit where the hop lands | Jump long or walk | Spikes start where the *short* jump lands; long jump is clear | USED (TVM-01, TVM-03) |
| B15 | Rising block (L11) | Block rises and retreats (+1.0 s moves, +1.5 s drops) | Its revealed path is the route | Gap between beats >= 0.5 s | PARTLY (`riseWall` taken) |
| B16 | Block that pushes (L13, L14) | Contact is a threat → contact is a ride (176 px in 0.75 s) | Land on it and ride | Ride start must be the same sprite as the safe block | FREE |
| B17 | Patrol that turns into a chase (Saws 1, D p15) | It patrols → pauses, grows, pursues at 150 px/s after 1.0 s | Open distance during the pause | The pause is 1 s [M] and visible | PARTLY (`chaser` kit taken; saws FREE) |
| B18 | Semantic coin (L17, P2) | Coins are pickups → the coin row is solid ground | Walk on the coins | Collect only if you jump; walking on is the answer | FREE |
| B19 | Coin trail that herds (L16) | A neat row to collect → it keeps you on a floor that moves at 150 px/s for 2 s | Do not pause for coins | Row ends on solid ground | FREE |
| B20 | Coin that moves (L19) | The coin marks the safe landing → it shifts 16 px right | Trust the support, not the coin | Move takes 0.1 s, visible | FREE |
| B21 | Bad coins that accelerate (L20) | Collect along the stairs → they accelerate at 90 px/s^2 after you wait | Start the route at once | First 3 s are slow enough to read | FREE |
| B22 | Control flip (L21) | Left is left → reversed from 0.05 s | Press the other way | A sign on screen at the first frame | USED (`flipControls`) |
| B23 | Flip that toggles at gaps (L25) | You learned "reversed" → it flips back at each gap (0.2 s shake as cue) | Treat each gap as a state change | Cue at every flip; no flip mid-air | PARTLY (flip taken; toggle per gap FREE) |
| B24 | Button roles swap (L23) | Up is jump → Down jumps and Up throws spikes upward | Use Down | Show a one-frame icon swap; the throw is visible | FREE |
| B25 | Super-jump under a ceiling (L24) | A full jump clears the floor spikes → force is 100 vs 18 normal, ceiling spikes | Take off from a chosen spot, tap only | A tap jump must still be safe | PARTLY (stilts, tiny, full stomach taken) |
| B26 | Spring you must skip (L31, L34) | Use every spring → the last one throws you into spikes | Bypass the last | Spring and spike are the same distance on every try | USED (springs; "any trampoline is taken") |
| B27 | Moving spring or support (L33) | Spring is fixed → carried right at 50 px/s | Ride it | Same as B26 | USED |
| B28 | Portal chain (L39) | One portal ends the room → six, each one step back, the exit appears at +2.7 s | Walk the chain | Each portal lands on solid ground; sixth cue shown | PARTLY (`w.warp` train / blink-back used in endings; a visible portal object FREE) |
| B29 | Portal that runs (L37, L40) | Aim at the portal → it jumps 160 px in 0.2 s, then sweeps left | Intercept its current spot, or take the low route | Never faster than a run-and-jump can reach | FREE |
| B30 | Portals that rearrange (L38) | The map you saw → changes after each transfer | Re-read after every warp | Two seconds of calm on arrival | FREE |
| B31 | Door moves (P2: the creator started from a goal that slowly inches offscreen) | Reach the door → it retreats, swaps, hides | Bait it, then go | Door's path is the same every try | USED (`shy`, `swap`, `catch`, `lattu`, ...) |
| B32 | Win that is not a win | A door → a cutout, a painting | Look for the real one | The fake reads fake once you are close | USED (`fake`, `fakewin`, `paintwall`) |
| B33 | Identity swap (D p15, "Doors 5") | You are the little figure → the door is drawn as you, you as the door | Follow the controllable body | A cue on Dad's body; swap is one-way | FREE |
| B34 | Buttons that slow you (D p15, Boss 5) | Press the buttons → each cuts run speed (80/60/50/40/30/20 px/s) while the door retreats | Plan around the slower you | Never slower than a 2.4-tile tap jump can cross [I] | PARTLY (slow-mo taken; button sequence FREE) |
| B35 | Delayed second trap | The first fix works → a second trap waits at the fix | See C | Gap between beats 0.5-1.75 s [M] | USED (principle, everywhere in TVM) |
| B36 | Shelter trap | Where you wait is safe → it is not | Wait somewhere else | Show the tell before you reach it | USED (TVM-01 booster, KVT-02 jetty, TVM-04 palm) |
| B37 | Decoy twin | Two things drawn alike → one is safe, one is not | The safe one is distinguishable once seen | Differ by one stable mark, same on every try | USED (TVM-01 ditch vs puddle) |
| B38 | The voice urges the trap | A helper says go → it is the trap | Learn which voice lies (only Tara) | Guide never lies; Tara lies; see D | USED (TVM, v0.16.13) |
| B39 | The meter lies | A progress bar is full → it restarts | Wait for the real finish | Same behaviour each try | USED (BLR-01 `LoadingBridge`) |
| B40 | Death-gated secret (P1: "some keys only appear after you fail in a very specific way") | Hidden item is somewhere → it appears only after a specific failure | Fail that way on purpose | One per city at most; optional, never needed to clear | FREE |

**No row, on purpose:** scale-up (giant Dad), wraparound rooms, one-way tiles and levers/buttons as puzzle objects (B34 uses buttons only as a slowing sequence) have no MECHANICS.md entry, but only the dossier's one-line mentions [D p5 table, P1], so I have not given them a row: no reconstructed behaviour to measure. Treat as FREE only after you grep [I].

---

## C. The counter-adaptation ladder

**Shape this game already uses:** room → act → door ending (`longStage`, `tour`). Each of the three is its own beat with its own joke. The ladder goes *across* them: what A1 teaches is wrong in the act; what the act teaches is wrong at the door [I from HANDOFF].

**Rules.**
- Per beat, A1 = trust the picture, A2 = the obvious fix, A3 = the answer. A2's death must *not* be the same trap again; it is a different trap sitting where the fix lands (AGENTS.md "FIX" policy; record it next to `NAIVE`).
- Total betrayals per stage: 3-4 for long, 5-6 for the marathon, spaced at least one plain beat apart [I]. Two betrayals inside one micro-room are allowed only as a ladder (A1 then A2). D's cap: 3 reversals in a final stage [D rule 05].
- A3 must be *simple once seen* (one move, no timing needle). The second-trap gap is 0.5-1.75 s [M].

**Six chains.** (Objects are generic on purpose; the city decides the skin, but the skin may not decide the idea: bar 3 says "a local would recognise it".)

1. **Beat that lies, then a deadline (B5 → B6 → B33).** Room: platforms return on a 1.5 s beat; ride it. Fix after dying on the flash: the fifth flashes, wait for the solid. Act: a scaffold builds and drops at a deadline (you waited out the flash; now waiting kills). Door: Dad and the door swap pictures, follow your body.
2. **Coin vocabulary (B18 → B20 → B40).** Room: a coin row over a gap; walk on it. Fix: next row a marker coin moves 16 px; trust the support. Act: coins accelerate if you pause (B21). Door: a secret appears only after you fall into the gap on purpose.
3. **Wave and refuge (B12 → B13 → B34).** Room: spike wave up stairs, keep moving. Fix: a refuge recess, stop in it; running past starts the reverse wave. Door: buttons slow you, door retreats; press fewer than all of them (plan the sequence).
4. **Portals (B28 → B29 → B30).** Room: portal chain, each one step back. Fix: a portal that jumps ahead of you; use the low one. Door: portals rearrange after you use them; two seconds of calm on arrival.
5. **Pusher and belt (B16 → B9 → B8).** Room: a block shoves you; contact is a ride. Fix: a belt reverses under the block's ride; step off early. Act: supports shrink to 32 px while you ride. Door: the final support is the narrowest; hop, do not stand.
6. **Controls through the stage (B24 → B23 → B25).** Room: Down jumps, Up throws spikes. Fix: it flips back at each gap. Act: a super-jump under a ceiling; tap only. Door: all three together but with one cue each, three cues total (D's cap of 3).

---

## D. "How would I know that?"

A stage whose first death cannot be predicted, but is fair. Max **2 per city**, **never consecutive**, and never stage 01 or 10 [I; the owner's "some stages"].

**Rules**
1. **The death teaches the rule in one look.** On the first frame after respawn the cause is visible (the hazard sprite, the cue, the Tara line that has just been *true* or *false*). No second unknown.
2. **The second attempt is obvious.** After one death the answer is one move, not a search. If it needs two guesses, it is a puzzle, not a troll.
3. **Never twice in a row** and never two unknowns in the same stage (a stage is allowed one "WTF" beat; the rest is plain or ladder).
4. **No pixel hunt, no stand-still hunt over a minute.** The trigger is a place or an action the player does anyway (walk, jump, wait). A secret that needs an unnatural action (back off 40 tiles) is not a "WTF", it is a hidden thing and goes in B40 (optional) [I].
5. **It must be *natural to the city*.** The reason is a thing locals know (bar 3). The WTF becomes "oh, of course" the moment they die. Dossier: city objects explain the physics only when the object's real purpose explains what happened [D p20].
6. **Fairness holds**: 90%+ average human timing (AGENTS.md); lethal consequence of the WTF is one death, not a long loss (D p18: long empty travel turns surprise into "unpaid repetition").

**Honesty rules in this game (do not break)**
- The **guide** (`w.guide`) only says true, current things (`stillTrue`) and **never describes a trap the player has not yet died to in this visit** (AGENTS.md, hardness pass 4).
- The **hint** is the player asking (unlocks after 3 deaths); it may name what is ahead. D proposes a hint after 5 deaths and a skip after 8 deaths or 90 s [D rule 15, proposed]; the game keeps its own 3 [O, AGENTS.md].
- **Only Tara lies.** Her lie must be the move the trap waits for, and she must tell the truth at least once per city, so doubt stays alive (TVM-06). Never let a stage's HUD, sign or NPC lie unless the stage's joke *is* that (B39).
- **Checkpoints are calm** spots: no trap fires within a jump of one.
- **Never hide the retry**; never auto-skip [D rule 15].

---

## E. Length and difficulty for a 10-stage city

Numbers are the owner's targets; the dossier supplies the limits they sit inside (compact rooms, replay to the failure under 8 s [D rule 08], death budgets [D rule 14, all proposed]).

| Stage | Role | Clear time | Betrayals | Checkpoints | Median deaths target [D rule 14, extended by me] |
|---|---|---|---|---|---|
| 01 | Tour with a bite: welcome, but not a free walk (AGENTS.md hardness 1) | 25-35 s | 2 | 1-2 | 1-3 |
| 02-04 | Standard, one new rule each, the third has the first ladder A2 | 25-45 s | 2-3 | 1-2 | 2-6 |
| 05-06 | Long; 05 or 06 may be one "how would I know" | 60-90 s | 3-4 | 3-4, some hidden | 3-8 |
| 07 | Marathon: chained acts, a shelter beat and a momentum beat | 2-3 min | 5-6 | hidden checkpoints (input replay), none within a jump of a trap | 4-10 |
| 08 | "How would I know" (one WTF beat) plus tough | 60-90 s | 4 | 3-4 | 4-10 |
| 09 | Tough, knowable: ladders A2 and A3 in every beat | 60-90 s | 4-5 | 3-4 | 4-10 |
| 10 | Finale: **only this city's own ideas**, in a new order (the original's "hell gate" mixes the door's tricks, P3) | 90-150 s | 5 | calm every ~25-30 s | 4-10; investigate any median over 15 |

Why 08 and 09 are not both WTF: D-rule 3 (never consecutive). Make 08 the unknowable one, 09 the *hard* one. [I; resolves the owner's "08-09"]

**What "tougher" means here.** Smarter: more beats, a second trap on the fix, a stale rule, a shelter after a rush. **Never** frame-perfect: required jumps work on a tap, nothing needs a window shorter than the human model; average human timing >= 90% (0-12 ticks delay, 6-44 tick holds; HANDOFF section 6). D adds a 200 ms correction window once the rule is known [D rule 07]: at 140 px/s that is 28 px, or 1.75 tiles of run, so a trap that fires within 1.75 tiles of a place the player must be is too tight [I from M + engine].

**Rage-bait that is still fair**
- The rage must come from *being fooled*, not from *being unable*: the second attempt is a plain win [D p18]. Syobon Action's reviews note that success often relies on trial and error and on counterintuitive moves [O, P4], and Trap Adventure 2 took off from one cruel video, with a start-over-from-zero death rule [O, P5]. Take their ambush; leave the zero checkpoints.
- I Wanna Be the Guy hides lethal things "all but impossible to avoid without either previous knowledge or trial and error" and one-hit kills with unlimited retries [O, P6]. Take the unlimited-retry part; replace "trial and error" by "one death teaches".
- Getting Over It and Jump King punish with a huge loss (no checkpoints, a long fall) [O, P7, P8]. D's reading, and mine: that contract is different from a 10-second comedy loop; our loss is seconds, not minutes [D p20].
- Player complaints show the unfair kind: a thin avatar between saws felt luck-driven (input too fine for the task), and a long slow fall felt like unpaid repetition (too much time between mistake and decision) [D p15, one anecdote each: no rate].
- Level Devil's own early doors escalate by *what you must distrust*: floor → hazards → supports → rewards → controls → timing → launch → space [D p4, analysis]. For us, each city rises that way inside its own objects.

---

## F. Retention and comeback hooks (no server)

What this game already has: stars (clear, par, hidden item: 3 per stage), per-stage death count, per-city "escaped" stamp with ☠ count, a share card, Tara's death lines, the map of the next capital, instant retry [O, `src/app/app.ts`, `HANDOFF.md` 152].

| Hook | Why it works | Source | What to do |
|---|---|---|---|
| Instant restart + a replay of the failed attempts | Short loss keeps curiosity; Super Meat Boy shows every try at once after a clear | P9 [O]; D p18 | Keep restart under 500 ms; optional "ghost of your last death" (do not build tonight) [I] |
| Par stars and a fast-clear grade | An A+ time unlocks a harder version | P9 [O] | `par` is a real, reachable target; route time against par is tested (`par.test.ts`) |
| Hidden items that need strange actions | Poki: keys "behind invisible platforms or walls that look solid", some "after you fall down a hole on purpose" | P1 [O] | One hidden item per stage; B40 for one stage a city |
| Tara as the death counter | Getting Over It's narrator mixed "provoking one-liners with straight, uplifting phrases" because the player is already frustrated | P7 [O] | Tara teases by death count; she tells the truth after a long streak; the line names *what happened* (D rule 18) |
| Clips | 8-15 s: setup, surprise, one improved retry; keep the trigger in frame | D p18 (proposed); P5: Trap Adventure 2 took off from one Twitter video [O] | Share card with city, stage, ☠ count; the stage's one joke must be framed in one screen |
| Recoverable surprise | The player blames an understood decision, not input | D p18 | D-rule 1, A-law 9 |
| A visible next place | Progression through a themed door structure: five stages a door, the last one mixing | P1, P3 [O] | The map pin of the next capital; city postcard line |
| Retry in 5 s | D's test: 80% retry within 5 s of a first fail, 70% explain the rule by attempt 3 | D rule 20 (proposed) | Measure by `store.log('quit', ...)`; do not promise it |

Not recommended for tonight: ads inside death loops (D rule 16: none in the first 180 s, never on an ordinary death) [proposed]; daily streaks or leaderboards (need a server).

---

## G. STAGE CHECKLIST (one page, copy per stage)

1. **Expectation:** one sentence: what a first-time player *thinks* the stage is.
2. **Betrayal:** one archetype id from B (or "new: ..." with the grep result). Row status is FREE or the FREE part of a PARTLY. A USED row is never allowed.
3. **Second-attempt rule:** what the obvious fix is, which second trap sits there (a different one), and the third-attempt answer in one move. Both go in the tests: `NAIVE` dies, `FIX` dies, the route wins.
4. **Exactness:** every hazard reaches the route or the obvious mistake, measured against Dad's 10x14 box and the real jump arc (tap 2.4 tiles, hold 3.75, run-jump ~5.6 tiles in 0.64 s) [HANDOFF]. A spike no jump touches is decoration: move or remove it.
5. **Fairness numbers:** the gap between beats is 0.5-1.75 s [M]; the landing strip is at least 1 tile; no trap fires within 1.75 tiles of where the player must be right after the known cue [I]; the human-timing run (0-12 ticks delay, 6-44 hold) is >= 90% for the route.
6. **Hint and guide honesty:** the guide says only true, current things (`stillTrue`) and never describes a trap not yet died to; the hint may name it; only Tara lies, at the trap, and the truth once per city.
7. **Checkpoint calm:** every checkpoint is a quiet spot; replay to the failing trap is <= 8 s [D rule 08]; marathon uses hidden checkpoints.
8. **Readability after death:** a `CAUSE_LINES` entry (what happened, how to beat it); the hazard is on screen at respawn.
9. **Uniqueness:** grep MECHANICS.md and `src/game` for your nouns and verbs; check B for the archetype row and C for the chain; the same experience under a new skin is a repeat.
10. **Made of the city:** one local thing, and a local would recognise and share it; not "generic India" (traffic, potholes, chai, cows).
11. **Language:** every spoken line `"Local | English"`, max 8 words, verified words, no swearing, slurs, caste, religion, politics, real brands or people, nothing on the city's Avoid list.
12. **Deterministic:** no `Math.random`, `Date`, real time; `typecheck` clean, tests green, route + NAIVE + FIX recorded; screenshots looked at.
13. **Length:** matches the section E row for its number (time, betrayals, checkpoints, median deaths).

**One line to remember:** the first death is a joke the player did not see coming; the second attempt is a win they feel they earned.
