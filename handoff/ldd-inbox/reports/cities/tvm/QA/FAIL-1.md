# TVM extend-and-toughen: independent QA, round 1: FAIL

Subject: `city/tvm` at **da92c92**, in my own detached worktree `/local/home/saiposh/personal/ldd-wt/qa-tvm` (the builder's worktree was not touched). Nothing committed. Node 22.21.1 via the template `env.sh`. My scratch probes are untracked in my worktree: `tests/qa/probe.test.ts` (copy: `QA/qa-probe.test.ts.txt`) and `scripts/dev/qa-shots.mjs` (routeshots reading `/tmp/qa-tvm-rec`, writing `shots/qa/`).

Four findings are blocking: B1 replay length, B2 checkpoint calm, B3 finale act types, B4 finale oil readability. Everything else holds and is listed under "What holds".

## What I ran

| Check | Command | Result |
| --- | --- | --- |
| Typecheck | `npm run typecheck` | clean |
| Full suite, TVM's `TVM: OLD` line removed from `tests/modules.test.ts` (uncommitted, reverted after) | `npx vitest run` (once) | **1497 passed, 12 skipped, 0 failed**. `modules.test` 168 green, `stale.test` 8/8, `allocation.test` 10/10, `frozen-behaviour` 138 green incl. TVM-01..10 on the refrozen file |
| Build + flows | `npm run build:single && node scripts/flows.mjs` | build OK. flows: "no errors". Environment note: playwright wanted `chromium_headless_shell-1254`, which is not in the cache; I ran it with `CHROME_PATH=~/.cache/ms-playwright/chromium_headless_shell-1228/...` |
| Fairness | `LDD_N=80 npm run fair -- TVM` | 01 100/100/98; 02 100/100/76; 03 100/99/78; 04 100/100/84; 05 100/100/84; 06 100/99/75; 07 100/100/80; 08 100/100/76; 09 100/100/98; 10 100/100/76. Every stretch 99-100%. Same as EXTEND-2.md section 5 |
| Frozen diff | `git diff bc76d83 HEAD -- tests/cities/_frozen/tvm.json` | see "What holds" 2 |
| Re-timed routes | scratch `probe`, `probe2`, `probe3` | see "What holds" 3 |
| Checkpoints, replay | scratch `probe4`, `probe5` | B1, B2 |
| Death frames | `qa-shots.mjs` on NAIVE/FIX of 01, 09, 10 and every TVM-10 MISTAKE | B4. Copies: `QA/qa-10-room-oil-zoom4x.png`, `QA/qa-10-shore-oil-phone.png`, `QA/qa-09-rip.png`, `QA/qa-01-bite-death.png` |

## Blocking

### B1. TVM-09 and TVM-10: replay to the failing trap is up to 24 s (bible G7 / D rule 08: at most 8 s), and one TVM-09 stretch is 25.5 s (CITY-MODULE.md: a calm checkpoint at least every 25 s)

- **What:** checkpoint times along the route (lag 0), from `probe4`:
  - TVM-09: checkpoints passed at 11.3, 25.3, 37.4, 62.9 s. Stretches 11.3 / 13.9 / 12.2 / **25.5** / 4.4 s.
  - TVM-10: checkpoints passed at 4.0, 6.9, 9.0, 15.0, 40.0, 59.9, 63.7, 84.3, 88.6 s. Stretches 4.0 / 2.9 / 2.1 / 6.0 / **24.9** / **20.0** / 3.8 / **20.6** / 4.3 / 2.0 s. EXTEND-2.md says "no stretch is longer than about 15 s of play". That is not what the route does: the shore + palm-beach acts (cp3 to cp4), the uzhichil rooms + Thumba side (cp4 to cp5) and the tarp beach (cp6 to cp7) each run 20-25 s with no checkpoint.
- **How reproduced:** `probe5` plays the route and, every 0.25 s, branches off it three ways (stop, run on, run and jump) for 4 s. For each death it measures the time back to the checkpoint Dad would respawn at. Worst replay per stretch:
  - TVM-09: 9.8 s (spawn, drift at x26), 12.0 s (cp0, drift x64), 10.6 s (cp1, drift x101), **23.7 s** (cp2, drift x161), 5.1 s (cp3).
  - TVM-10: **23.1 s** (cp3, drift x128), **20.5 s** (cp4, droni x174), **18.8 s** (cp6, drift x221). Every other stretch is 3.7 s or less.
  These are the stages' own traps (outside the flags at a wave, oil at a take-off), and plain mistakes reach them. A player who dies at the end of the Ashoka act walks 24 s of waves again.
- **What satisfies:** a calm hidden checkpoint inside each long stretch (between waves, on a spot no wave reaches), so that no stretch is longer than 25 s and no death in `probe5` replays more than 8 s. That means about one more checkpoint in each TVM-09 stretch and two in each of the three long TVM-10 stretches. cpsafe must stay green.

### B2. TVM-10: a checkpoint within a jump of a trap

- **What:** cp1 (x48.5, the courtyard act `tvm10-kizhi`). Respawn there and make one tap jump forward: Dad lands on the oil by the palm, slides under it, and the coconut kills him **1.07 s** after the respawn, at x53.2. That is under the engine's own 1.2 s "quick death" window in `session.ts`: twice in a row and the checkpoint is dropped. The bible says checkpoints are calm, with no trap within a jump.
- Two softer cases from the same probe, for the same fix: cp4 (x135.8, start of the palm beach) and cp6 (x196.2, the tarp beach). Standing still for 4 s is safe at both. A 0.3 s run or a tap jump forward, then standing, dies to `tvm-rip` 2.8 s (cp4) and 3.8 s (cp6) after the respawn. In other words, the respawn lands with a wave already counting down. I do not count these as blocking on their own, but a checkpoint between waves would fix them along with B1.
- **How reproduced:** `probe5`, calm section. From each checkpoint moment of the route, three plays: idle 4 s; run 0.3 s then idle; one tap jump forward then idle.
- **What satisfies:** move cp1 so that no tap jump or short run from it reaches the oil by the palm (or move the oil and palm back from it). Re-run the same three plays from every checkpoint with no death inside 4 s.

### B3. TVM-10: two finale acts are the same betrayal

- **What:** the brief requires each of the seven acts to call back a TVM idea with its own betrayal, no two of the same type. `tvm10-theeram` (shore) and `tvm10-kadappuram` (palm beach) have the same betrayal and the same answer. The lifeguard plants the new strip over a hazard that sits in its middle (oil in theeram, the palm crown in kadappuram), and the answer is to stand in the flags off the middle. Their scripted MISTAKES are literally the same move, `follow(<act>, 0, 'to the middle of the strip')` (tests/cities/tvm.ts, the `mistakes['TVM-10'].push` block), and their advice lines say the same thing ("stand on the dry sand at its left edge, not on the oil in the middle" / "Stand in the flags, clear of the crown"). `tvm10-thira` is a third "hazard parked over the new strip" act, though its answer is different (wait for the tarp to empty, then go in, then stay while he paces). Its tarp beat also repeats `tvm10-kizhi`'s "stop short of the full tarp and let it empty". So 3 of the 7 acts are flags-plus-hazard-in-the-strip.
- Also: acts 5 (`uzhichil`) and 7 (`chanda`) have no scripted MISTAKE, so their betrayals (the reversed pot order; the fish ice into oil and kindi) are claimed but not proven to kill.
- **What satisfies:** give either theeram or kadappuram a betrayal of a type no other act uses. One option, among the TVM ideas not yet in the finale: the strip is safe, but getting there is the trap. Add a MISTAKE for uzhichil (the room's order: long jump first) and for chanda (step on the ice after the twitch) that die where the advice says.

### B4. TVM-10: the oil, the finale's main hazard, cannot be seen at phone size

- **What:** the slick is a 2.5 px strip drawn on the grass line (`dhara.ts:105-108`, a gradient plus a 3x0.8 px highlight). At the 844x390 phone viewport it is about 3 CSS px of faint yellow on yellow-green grass. It looks like the small yellow grass flowers drawn along the same ground line: in `QA/qa-10-room-oil-zoom4x.png` (4x crop of the room's first trough, route frame at 0.8 s) a flower sits just past the trough and reads the same as the oil before it. That breaks bible law 10 (nothing decorative may look like a hazard). The oil decides the NAIVE (`tvm-droni`), the FIX (`tvm-kindi`), the shore mistake (`tvm-drift`), and the uzhichil and chanda acts, so the stage's main idea depends on it. In the shore death (`QA/qa-10-shore-oil-phone.png`, phone size, 0.15 s before death), Dad dies of `tvm-drift` while standing between the flags. The oil under him is a pale line. The death line then says "The wave took you: you were outside the flags", which is the wrong lesson for this death. The builder flagged the faint oil in both reports. The pot's drips (1.6x3 px) are the only other cue.
- **How reproduced:** `qa-shots.mjs` on the NAIVE, FIX and `m10_1` (shore) recordings, frames at 70 / 93 / 98.5 / 99.9 % of the play; scaled to 844x390.
- **What satisfies:** an oil slick a player names at 844x390 width without zooming. For example: thicker (4-6 px) and darker amber with a visible sheen, raised above the grass tufts, and no yellow ground flowers in the Dhara stage. Re-shoot the NAIVE, FIX and shore death frames. Also give the shore death its own cause, or reword `tvm-drift` there, so the line names the oil ("Your feet went on the oil and you slid out of the flags").

## What holds (not blocking)

1. **Tests and guard.** With TVM's allow-list line removed, the full suite is green (above), the prefix check included. Every new key is `tvm-` prefixed (`tvm-drift/rip/droni/kindi/chaal/drenched/knock`, `tvm-backwash-ride`, `tvm-oily-feet-coir-mat`, `tvm-chaaya/net/parunthu/snakeboat`).
2. **Old stages 02-08 unchanged.** `git diff bc76d83 HEAD -- src/game/cities/tvm/levels.ts`: the only behaviour change in 02-08 is TVM-03's tumbler speed `-100` to `-85`. Everything else in 02-08 is key renames and intros moved to `L.intro[5..7]` with the same text. Frozen diff: TVM-01 route 2467 to 2518 and naive 187 `spikes` to 2352 `tvm-chaal` (new market); TVM-05 route 2170 to 2179; TVM-06 route 1558 to 1562; 09 and 10 new. No other number moved. NAIVE and FIX causes and ticks for 02-08 are identical to bc76d83, TVM-05 FIX 1595 included. (EXTEND.md's older "FIX 1595 to 1604" is superseded by EXTEND-2.md, and the file agrees with EXTEND-2.)
3. **Re-timed routes 03/05/06/07 are human play, not frame tricks.** I swept the changed parameter while keeping the rest of the route:
   - TVM-05, release point before the last stone's middle: 8 to 32 px all win 100% at lag 0, at lag 0-12 and at a fixed lag of 12. The old 0 px release fails late presses (66%). It is a wide band: let go once you are over the stone.
   - TVM-06, release before the last net's middle: 0 to 18 px give 98-100% at every lag. Wide.
   - TVM-07, exact-timing windows (lag 0): jeep coming down, a lead of 6-22 ticks wins (17 ticks, 0.14 s); the backing jeep, 5-19 ticks (15 ticks, 0.125 s); the boulder, 8-34 px (about 0.18 s at 150 px/s). The route's 18-tick lead sits inside each window, and the window is wider than the model's 12-tick spread. The cues are visible a second ahead (honk, "Reverse gear!" and three beeps, the boulder bouncing down). It is narrow, but a reflex window, not a frame.
   - TVM-03, glass hop lead: 3-34 ticks win at lag 0 (32 ticks). Wide.
4. **Encore basics.** TVM-09 route 67.4 s (par 80), NAIVE `tvm-drift` t378, FIX `tvm-rip` t937: different trap and place. The MISTAKE "stand still in the first flags" dies to `tvm-rip`. TVM-10 route 90.7 s (floor 90, par 110), NAIVE `tvm-droni` t137, FIX `tvm-kindi` t344. The four MISTAKES die as named (drift, crushed, coconut, drenched). `lives: 'act'` is on the finale (`levels.ts`, last `longStage`).
5. **TVM-09 readability.** The rip band (darker water with streaks) and the moved flags with the lifeguard are clear at phone size (`QA/qa-09-rip.png`: Dad in the dark band, the flags and lifeguard two tiles on, and Tara's lie "Avide thanne nilkku"). The real lesson ("the flags moved off me") reads at once. Rip and drift look different enough.
6. **Tour bite (01, Connemara fish ice, B4).** NAIVE (stop at the twitch, walk on) dies `tvm-chaal`. At phone size the ice slab, the "Valikku!" bubble and the drain read clearly in the death frame (`QA/qa-01-bite-death.png`).
7. **Seventh-death line.** `seven: 'Ezhu chaaya! Chechi parayunnu: aadyam muthal. | Seven teas! Chechi says: start again.'`. No "Thala" left in TVM (`grep -rni thala src/game/cities/tvm` finds only "thalasthaanam" and "thalayil", which are Malayalam words). Intros: `L.intro` has 10 entries; 02-08 read [1]-[7]; 09 and 10 call `tara(8)` and `tara(9)` (`encores.ts:48, 357`).
8. **Uniqueness.** Kovalam Flags: the closest shipped stages are PDY-06 (tide fills dips, cross while dry) and PDY-07 (waves shove you on bobbing boards). Kovalam plays differently: safety is a marked zone that an NPC moves before each wave, and you read where he plants it, not a dry window. Dhara: the closest are CHN-01's Pongal pot (a spill that runs past where it bubbled; you back off) and DMN-03's slippery melting ice. Dhara is about reading where an off-centre pendulum drips, offset from its hook. Not shipped elsewhere. `polish-slick` (PAT reserve) and JMU's growing slick are future slots, so worth keeping apart. Allocation slots 9/10 match (`flag-strip-shifts`, `pendulum-oil-slick`).
9. **Malayalam.** All new lines read plausibly to me: Flag okke chumma / Neenthi po; Enna onnum alla / Odi chaadu; Flag-inte idayil maathram nilkkuka; Flag ippo avide aanu; Priii! Thira varunnu; Avide thanne nilkku, Safe aanu; Pinnaale po; Ennayil chavittaruthu; Kaal thudachu, nannaayi; Thanalil nilkku; Meen vandi varunnu! Vegam kadakku; Valikku; Ezhu chaaya ... aadyam muthal. A native check is still worth having on "Thira povumbol pokuka" ("pokumbol" is the more usual form) and the Manglish "Avide plant cheythu", as the builder noted. Nothing reads wrong.

## Polish (not blocking)

- `entities.ts` IceSlab doc comment says the porter "drags it 3 tiles back the other way". The code moves it on in the same direction (`16 + 48 * k`), and the hint and cause say "on to the far side". Fix the comment.
- TVM-07's jeep windows (0.125-0.14 s) are the tightest in the city. They are fair, but a slightly slower backing jeep would give more room.
- TVM-10 at 90.7 s sits at the floor. The B1 checkpoints add no time, but B3's replacement act may.
- The route sheet frames show the stage title card again mid-stage (e.g. TVM-10 at 17 s). This is probably an artifact of ticking the session fast in the shot script, not a game bug. Worth one live look.
- `coconut`/`drop` module cycle between levels.ts and encores.ts (the builder's note). Harmless at build time.

## Re-test

After B1-B4 I will run the same set: full suite with the TVM excuse removed, `LDD_N=80 npm run fair -- TVM`, `probe4`/`probe5` (stretches, worst replay, calm from every checkpoint), the new or changed act's NAIVE/MISTAKE, and death frames of the oil at 844x390.

Not checked: real-device touch feel, and audio. Readability was judged from headless frames.
