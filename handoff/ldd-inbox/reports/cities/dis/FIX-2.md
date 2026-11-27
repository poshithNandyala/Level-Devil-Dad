# DIS fix round 2: answer to QA round 2 (FAIL-2 at 12842f7)

Branch `city/dis` in `/local/home/saiposh/personal/ldd-wt/dis`. Code tip **`48979cc`**; DIS.md in **`dfc3702`** (the branch tip, docs only, on top). No push, no version bump, no shared file. Work 09:13-09:45 UTC. Outputs: `reports/cities/dis/fix2/` (generic probe, generic summary, pairing table and script, labels, sweep, walk45, fair, suite, cpsafe, three sheets, the probes run).

## Honest section: what is plain, cut or left open

- **The DIS-10 room is PLAIN** by the B2 ruling: no break of 02 passed the gate (table below). The finale now begins at its first callback (the dhol); the room is the bank with the level post standing at its far end. There is no trap, tell or death play in it. `SandField.flip`, `dis-ulta` and `dis-agot` are gone. The room's NAIVE is now "run on", which dies at the first callback (`dis-pukhuri-lahe`); its FIX stays the tug's (stage FIX).
- **Route times fall where cut:** 10 is 34.2 s (was 40.5), 08 is 43.3 s (was 44.6, the halfway rest back to 40 ticks). Nothing padded.
- **Open, by reason:** in the generic probe, "hop every 0.3 s" in 04 `batah` still WINS at all lags: the hop-mash clears wells 1 and 2 and happens to drop into well 3 (the through well). It is the right well, reached by luck; I left it (no rule or engine reason found to kill a hop over a pit). "Back off" deaths land in the previous act's hazard with that hazard's own line (listed in B1); I made those lines neutral where they named a reason the back-off did not have.

## B1, law 9 for unscripted plays

Every hazard reached by QA's six plays (walk on, short hop, long jump, wait 4 s then walk, hop every 0.3 s, back off) at lag 0/6/12 now has a line that names what happened there. Changes (commit 48979cc):

| Part | Before (QA) | After: one-sentence rule for the line |
| --- | --- | --- |
| 06 traps channel (`majuli.ts`) | 02's `dis-luit` sandbar line | the channel's own `dis-garmur` |
| 06 flag back-off (same channel) | `dis-luit` | `dis-garmur` |
| 05 sanko first ditch | whole act mapped to `dis-sanko-pit` (back-off line) | the ditch names how you got in: walked on into it (`dis-sanko-gat`) or came back into it from past it (`dis-sanko-pit`, line made neutral: "you went back") |
| 05 sanko nala | `dis-pit` (the feast's line) | `dis-nala` |
| 05 feast ditch | `dis-pit` for all | walked the leaves then off their end: `dis-feast-gat`; jumped the whole feast: `dis-pit`; came back from past it: `dis-feast-back` |
| 07 dhol pond (run, walk on) | "the plank sank on the beat" | `dis-pukhuri` rewritten: "No plank was up under you" |
| 02 bhutbhuti waters (found by the probe) | walk on got the horn line; a jump short of the bar got "narrowed under you" | near water: `dis-char-sink` only once you have stood on the long bar, else `dis-char-gat`; far water: `dis-bhutbhuti` only if you HOPPED off the bar after the horn and before the siren, else `dis-char-gat` |
| 05 kaath (found) | walk-on into an unmoved split got "slid under your landing" | `dis-kaath-walk` while the split has not moved |
| 05 gamosa pits (found: back-offs with no gamosa on) | "three gamosas on you" | `dis-gamosa` only when blind, else `dis-gamosa-gat` |
| 04 doba, 05 japi-gat, 07 goru-lane, 07 cart-pukhuri, 10 pukhuri-lahe (found: back-offs) | lines named a reason the play did not have | neutral lines (below) |

### Changed or new cause ids, full line text

| Cause | Line (what happened / how to beat it) |
| --- | --- |
| `dis-garmur` (new) | Luit! You went into the Garmur channel. / The fish traps are the only floor over the channel: hop on to a trap that is silent and has settled on its rope. |
| `dis-sanko-gat` (new) | Gat! You walked on into the ditch in front of the yard. / Hop it from its edge; then let the hosts put their gamosas on you. |
| `dis-sanko-pit` (changed) | Gat! You went back, and the ditch behind you was there. / Don’t go back. The nala ahead has been bridged since you saw it (look at the bamboo’s shadow): walk on across. |
| `dis-nala` (new) | Nala! You went into the drain: no bamboo lay over it yet. / The bamboo is laid over it once you wear three gamosas (its shadow shows past the drain’s end). Then walk across. |
| `dis-feast-gat` (new) | Gat! You walked off the end of the leaves into the ditch. / Walking the leaves was right. At their end, hop the ditch from its edge. |
| `dis-feast-back` (new) | Gat! You backed off into the ditch behind you. / The ditch past the feast is behind you now: don’t go back, go on. |
| `dis-pukhuri` (changed) | Dhol! No plank was up under you, and you went into the pond. / The planks rise only on his beat: hop one plank per beat, and when his arms go faster, hop at once. |
| `dis-pukhuri-lahe` (changed) | Dhol! No plank was up under you, and you went into the pond. / The planks rise only on his beat, and this drummer is slowing down: hop only when the next plank is up. |
| `dis-char-gat` (new) | Luit! There was no bar there, and you went into the river. / Land on the long bar and walk back along it (it narrows from its far end). Wait for the real siren, and hop when the new bar is up. |
| `dis-kaath-walk` (new) | Kaath! The sharpened split got you: it had not moved. / It slides the moment you jump at it from close by: hop short, down where it was, then over it where it stops. |
| `dis-gamosa-gat` (new) | Gat! You walked into the pit, and you could still see it. / Hop the pit from its edge. |
| `dis-japi-gat` (changed) | Gat! You went into the ditch by the splits. / Hop it from its edge. |
| `dis-doba` (changed) | Doba! You went into the flooded vault under the stair. / Go down with the falling stair, keeping ahead of it, and stop on the step before the last; never wait at the top. |
| `dis-goru-lane` (changed) | Goru! You were in the bull’s lane as it came. / Never pass it in the lane. Wait up on a verandah while it charges past, and go on only once it is walking away. |
| `dis-cart-pukhuri` (changed) | Pukhuri! You went into the pond under the jetty. / Walk along the cart (never stop on it) and jump up on to the jetty as the cart runs under it. |
| `dis-bagori-beel` (new, B3) | Beel! You ran on ahead of the rhino, into grass it had not flattened. / It comes from behind you: get up on the haystack and let it charge past underneath, then walk the strip it leaves. |
| `dis-talatal-ulta` (changed, B4) | Thum! The cellar passage at the foot of the stair is low, and you hopped up into its vault. / Run down and out at the bottom; don’t hop under the low vault. |
| removed | `dis-ulta`, `dis-agot` (B2), `dis-gorh-adha` (B3) |

### Generic probe result

QA's `qa-dis-generic.test.ts` (copied unchanged to `fix2/probes/`), all ten stages, six plays × lag 0/6/12 = 558 rows: `fix2/generic.txt`; per act and cause: `fix2/generic-summary.txt` (73 lines). I read every (act, cause, play) against the line:

- Forward plays: every line names the hazard met there (examples: 06 traps → `dis-garmur`; sanko → `dis-sanko-gat`; feast walk → `dis-feast-gat`, feast hop-mash → `dis-kol-paat`; kaath walk → `dis-kaath-walk`, kaath hop → `dis-kaath`; 07 dhol → `dis-pukhuri`; 02 bhutbhuti walk/hops → `dis-char-gat`; 08 bagori → `dis-bagori-beel`; 10 talatal hop-mash → `dis-talatal-ulta`).
- Back-offs: each dies in the previous act's hazard and its line names that hazard without a reason it did not have (05 sanko → `dis-gamosa-gat`, feast → `dis-sanko-pit` "you went back", kaath → `dis-feast-back`, machan → `dis-japi-gat`; 04 → `dis-doba`; 07 card → `dis-goru-lane`, chowk → `dis-cart-pukhuri`; 10 tug → `dis-pukhuri-lahe`; the rest were already plain statements: `dis-garmur`, `dis-horin`, `dis-pat`, `dis-goru`, `dis-dhol-sink`, `dis-jui`, `dis-khaal`, `dis-roof`, `dis-sluice`, `dis-khaal-ulta`, `dis-porcupine`).
- **Result: zero lines that name a mistake the play did not make**, by my reading. Alive results: "stuck (blocked)" where a play cannot get on (as before), 06 flag hop-mash "play" (timeout alive, unchanged), 04 batah hop-mash "won" (see the honest section).

## B2, the finale room: PLAIN

Gate run before building (15 minutes), each sentence a break of 02's rule ("stand on a bar the post's next mark keeps; go when the new bar is up"):

| Sentence tried | Colliding row | Verdict |
| --- | --- | --- |
| The bar in front sinks first, the new one rises after: wait on the bank (round 1). | DIS-06 room (QA) | struck |
| What floats stays and what is fixed drowns: stand on the pontoon, not the ghat steps. | `dis02-chapori` (the hut's bar never moves) | struck |
| From this side the far post reads backwards: a rising mark means the water is falling. | LKO-09 `lko09-hawa` (the face you see is the opposite of the order) | struck |
| The post is too far to read: count the sirens instead. | `dis02-bhutbhuti` (count the cues, the horn is not the siren) | struck |
| The river is falling: no bar sinks, the dry crust of the new bar cracks under a wait. | S2 / DMN-03 age tells (dry pale cracks, don't dawdle) | struck |
| The bars drift toward the far post: stand on the bar nearest it. | S12 direction read; DIS-08 follow-flattened (go where the sign points) | struck |

**Plain by ruling.** Commit 48979cc. The room is ground (`Grid.ground(15)`), the post drawn at its far end, no river, no bars.

## B3, bagori's own second play

Decision (unchanged, bagori's own): "the rhino comes from behind you: get up on the haystack and let it charge past." The halfway rest is back to 40 ticks (the jeep's read is no longer tested). Second play: "hears it coming from behind and runs on ahead of it, past the hay" → `dis-bagori-beel`. Pairing: NAIVE `dis-gorh`@3909/3939/3969 (x129) against `dis-bagori-beel`@3819/3850/3880 (x138), two causes at two ticks at every lag.

## B4, talatal's second play and the hop-mash

The break of 04 stays (the steps fall from the bottom up; race down). New: at the stair's foot the cellar passage is low (a brick vault from x+20 to x+23, 10 px above head height when standing); running out under it is fine, a hop there meets it (`dis-talatal-ulta`). Second play: "hops down the falling steps and on out" → `dis-talatal-ulta`@2754/2807/2866 (x120-121) against NAIVE `dis-doba-ulta`@2785/2821/2863 (x116). The generic "hop every 0.3 s" now dies to `dis-talatal-ulta` at lag 0/6/12 instead of passing.

## Pairing table (pairs2.py on the final tip)

`fix2/pairs-table.md`: 31 pairs × 3 lags = **93 rows, 0 not meeting the bar** (two causes at two ticks). New rows: bagori and talatal (above); the 10 room is now NAIVE `dis-pukhuri-lahe`@570/576/582 against the tug stage FIX `dis-rope-ulta`@1909/1924/1940.

## Regressions (all on 48979cc, one at a time, in the foreground)

| Check | Result | File |
| --- | --- | --- |
| `tsc --noEmit` | clean | |
| Full suite (DIS on no list) | 18 files passed, 13 skipped; **1801 passed**, 20 skipped, 0 failed | `fix2/suite.txt` |
| cpsafe strict `-t DIS` | 10 passed | `fix2/cpsafe.txt` |
| Fair, LDD_N=80 | **100% at 6t and 12t on all ten**, every stretch and door 100% at 0-12t; 18t 02 84, 05 76, 06 76, 07 80, 10 76 (parked) | `fix2/fair80.txt` |
| build:single + flows.mjs | no errors | |
| Lag-captured sweep (lag 0/6/11/12 × idle 0/37/120/251; idle, run, tap-jump at lag 0/6/12) | **0 deaths in 10,416 plays**; longest stretch 07 16.7 s, all others ≤ 10.6 s; worst per-tick replay 07 7.17, 01 7.13, 02 6.53, 05 6.41, 09 6.37, 08 6.25 s (≤ 7.5); no `nodeath` | `fix2/sweep-lag-captured.txt` |
| walk45 | 03 clear; the rest overshoot (+4.7/4.8) as before | `fix2/walk45.txt` |
| Pairing | 93/93 | `fix2/pairs-table.md` |
| Generic probe | 0 wrong lines (above) | `fix2/generic.txt` |
| Sheets | all ten re-recorded and re-shot; 10 read (plain bank to the dhol, the low cellar vault at the stair's foot) | `fix2/DIS-10-sheet.png` |

## Honest route times (s)

| 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 22.6 | 21.9 | 33.6 | 11.2 | 32.0 | 24.3 | 88.3 | 43.3 | 34.6 | 34.2 |

## Diff (12842f7..dfc3702)

`docs/cities/DIS.md`, `src/game/cities/dis/acts2.ts`, `causes.ts`, `entities.ts`, `feast.ts`, `gamosa.ts`, `horn.ts`, `kaath.ts`, `levels.ts`, `majuli.ts`, `stair.ts`, `tests/cities/dis.ts` (12 files, +100 −89). Nothing outside `src/game/cities/dis/`, `tests/cities/dis.ts`, `docs/cities/DIS.md`.

## Not checked

- The generic probe's lag is QA's late start, not the full lagged-input model.
- I read only the 10 sheet this round (05 and 08 re-shot and copied, not read).
- `/tmp/rec` was re-recorded for all ten DIS routes before shooting (shared folder, DIS files only).
