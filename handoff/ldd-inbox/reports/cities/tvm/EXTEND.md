# TVM extend + toughen: report

Branch `city/tvm` in `/local/home/saiposh/personal/ldd-wt/tvm`, cut from develop bc76d83, develop 219e3b9 merged in (952b388). Head **442da7f**. Commits: b0f8a50 encores, f586079 tour bite/lines/first renames/refreeze, 2f8efb7 CITIES row, 952b388 merge develop, d2b5193 last renames + longer encores + fairness, 442da7f CITIES rows. Not pushed, no version bump. Files: `src/game/cities/tvm/*` (new `kovalam.ts`, `dhara.ts`, `encores.ts`), `tests/cities/tvm.ts`, `tests/cities/_frozen/tvm.json`, `docs/CITIES.md` (TVM rows only). No shared file committed.

## A. Encores

| id | name | family [betrayals] | ending key | what kills attempts 1, 2, 3 | route vs par | fairness quick/avg/relaxed, worst stretch | checkpoints | hidden item |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TVM-09 | Kovalam Flags | flag-strip-shifts [strip-shift] | tvm-backwash-ride | 1: run on past the new flags (NAIVE, `tvm-drift`, tick 378). 2: stand in the flags you reached; he moves them again (FIX, `tvm-drift`, tick 937; a different wave and place, same cause key). 3: follow forward when he carries them back behind you (lighthouse), rush to where he first planted them (Samudra; Tara: "He planted them there! Run!"), fail to hop the rock pool on the way back (Pozhikkara), run when he only paces (Ashoka); at the door, wait for the sand to dry and the next wave catches you | 67.4 s (8084 ticks) vs par 80 | 100 / 100 / 98; every stretch 100% | 4: 32.5, 72.5, 106.5, 167.5 (rocks between beaches, and the door's rocks) | tvm-chaaya at (12, 11.9), over the drift outside the first strip |
| TVM-10 | Dhara | pendulum-oil-slick [offset-swing] | tvm-oily-feet-coir-mat | 1: walk on, slip on the oil at the first trough's take-off, slide in (NAIVE, `tvm-droni`, tick 137). 2: the same long jump "from before the oil" at trough 2 lands on the oil past it and slides into the sunk kindi (FIX, `tvm-kindi`, tick 344). 3: courtyard: under the full tarp (`tvm-drenched`) or on the oil before the tarp washes it; the shore: the middle of the new strip is oil, your feet go and you slide out of the flags (`tvm-drift`, a scripted MISTAKE); Chalai: on to the ice after the twitch (`tvm-chaal`); door: jump the coir mat and oily feet throw you off the step into the gutter (`tvm-chaal`) | 30.9 s (3708 ticks) vs par 40 | 100 / 100 / 76; every stretch 100% | 6: 32.5, 48.5, 66.5, 102.5, 128.5, 157.5; `lives: 'act'` | tvm-chaaya at (16, 10.9), between the room's troughs, above the swing |

Room ideas: TVM-09, the lifeguard's moving strip (`Surf`: each wave starts by position, the lifeguard walks the flags, then the wave runs in; outside the flags is `tvm-drift`). TVM-10, pots on crooked arms (`Dhara`: the oil lies under the middle of the swing, beside the hook; feet on oil = stun and slide, no jump), troughs `Droni`. Acts: tvm09-vilakku, tvm09-samudra, tvm09-pozhikkara, tvm09-ashoka; tvm10-kizhi (the tour's tarp: its rain washes the oil; TVM-04's coconut for whoever stops under a palm), tvm10-theeram (TVM-09's flags with oil inside the strip), tvm10-uzhichil (the room's pots in the other order), tvm10-chanda (the tour's fish ice, then oil and a kindi). Each stage has a sign (KOVALAM, VAIDYASALA), Tara (lying intro and live lies), the honest guide, hint parts per act. Door endings: I read every advice line; the nearest are PDY's tide dips, KVT's sandbar, the monsoon-mud ending (feet stick, no jump) and the kayak push. Neither "the backwash carries you to the door" nor "oily feet slip back off a polished step; walk the coir mat to wipe them" is among them.

**Still below the bar:** TVM-10 is 30.9 s; the bible wants 90-150 s for a finale. TVM-09 has 4 checkpoints plus the door's (the bible says 3-4).

## B. Tour bite (tour-tvm-b4, B4)

Stage 01's old ending (the road that opens ahead, `gapAhead` 'g' + `noLanding` 'h', cols 104-110) is replaced by **Connemara market**: a 6-tile drain (cols 103-108) and a 2-tile slab of fish ice on it (`IceSlab`). As Dad passes col 101.6 it twitches 16 px on (0.1 s); two beats later (0.5 s) the porter yanks it 3 tiles on in 0.15 s ("Valikku! | Pull!"), out from under anyone on it (it does not carry you). Tara at 99.6: "Meen vandi varunnu! Vegam kadakku! | The fish cart is coming! Cross quick!". Answer: wait for the yank, stop at the edge, long jump on to the ice. Every other piece and the hint are unchanged (the hint's last sentence now describes the market). NAIVE (new): stop at the twitch, wait 42 ticks, walk on: `tvm-chaal`, tick 2352. Also scripted to die: running straight over it, and walking on once it stops twitching. Fairness 100/100/98, stretches 100.

## C. Lines (local | English)

| Where | Line |
| --- | --- |
| seven (replaces "Thala for a reason") | Ezhu chaaya! Chechi parayunnu: aadyam muthal. \| Seven teas! Chechi says: start again. |
| intro[5] TVM-06 (was inline, same text) | Kochi vala kando? Keri po! \| Seen the Kochi nets? Climb on! |
| intro[6] TVM-07 (same) | Munnar thottam! Mukalil kayari vaa! \| Munnar tea gardens! Climb up to the top! |
| intro[7] TVM-08 (same) | Vallam kali! Vegam keri iriku! \| Boat race! Quick, hop on and sit! |
| intro[8] TVM-09 | Flag okke chumma, Dad! Neenthi po! \| Flags are just for show, Dad! Swim along! |
| intro[9] TVM-10 | Enna onnum alla, Dad! Odi chaadu! \| Oil is nothing, Dad! Run and jump! |
| TVM-09 guide | Flag-inte idayil maathram nilkkuka. \| Only stand between the flags. / Flag ippo avide aanu. \| The flags are over there now. |
| TVM-09 lifeguard, door | Priii! Thira varunnu! \| Whistle! A wave is coming! / Thira povumbol pokuka! \| Go as the wave goes! |
| TVM-09 Tara | Avide thanne nilkku, Dad! Safe aanu! \| Stay right there, Dad! It's safe! / Avide plant cheythu! Odu! \| He planted them there! Run! / Pinnaale po! \| Follow him! |
| TVM-10 guide, attendant | Ennayil chavittaruthu. \| Don't step in the oil. / Kaal thudachu, nannaayi. \| Feet wiped, good. |
| TVM-01 market | Meen vandi varunnu! Vegam kadakku! \| The fish cart is coming! Cross quick! / Valikku! \| Pull! |
| causeLines | tvm-drift, tvm-droni, tvm-kindi, tvm-chaal: plain English [what happened, how to beat it] |

`intro` now has 10 entries; stages 02-05 keep indices 1-4 (same text). A native check is still worth having on "Thira povumbol pokuka" and "Avide plant cheythu".

## D. Prefixed keys (all renamed)

| Old | New | Kind |
| --- | --- | --- |
| knock | tvm-knock | ending (TVM-02's door; its policy is in tests/cities/tvm.ts) |
| drenched | tvm-drenched | cause (TVM-01 tarp, TVM-10 courtyard tarp) |
| chaaya | tvm-chaaya | thing (all 10 hidden items) |
| net | tvm-net | thing (TVM-06) |
| parunthu | tvm-parunthu | thing (TVM-02's kite) |
| snakeboat | tvm-snakeboat | thing (TVM-08) |
| (new) | tvm-drift, tvm-droni, tvm-kindi, tvm-chaal | causes |
| (new) | tvm-backwash-ride, tvm-oily-feet-coir-mat | endings |

The plays that find those things by kind now live in tests/cities/tvm.ts and replace the shared ones: the TVM-06 and TVM-08 routes (copied with the new kinds; the shared door step is reused), the TVM-02 MISTAKES (`hopAnyBird` with `tvm-parunthu`), and every TVM-01 MISTAKE, rebuilt from the shared route because `drenched` changed and the old road end is gone.

**One shared test still red: `tests/stale.test.ts` > `TVM-08: the v0.16.13 route`.** It plays `tests/frozen/v0.16.13.ts`, whose TVM-08 route calls `thingOf(w, 'snakeboat')` and throws a TypeError. Fix on develop: in `tests/frozen/v0.16.13.ts`, `'snakeboat'` → `'tvm-snakeboat'` (lines 504, 518); for safety also `'net'` → `'tvm-net'` (147) and `'parunthu'` → `'tvm-parunthu'` (162). I proved it locally (stale.test 8/8 green) and reverted.

## E. Hardness, stages 02-08

`LDD_N=80 npm run fair -- TVM`. Before = the same command on this branch before any 02-08 change.

| stage | changed? | what | why | NAIVE cause | FIX cause | fairness q/avg/rel; stretches (before → now) |
| --- | --- | --- | --- | --- | --- | --- |
| 02 | no (kite thing renamed, its plays moved to tvm.ts) | — | obvious play and fix die; fair | splash | splash | 100/100/76; 100,100 |
| 03 | **yes, behaviour** | glasses slide down the counter at 85 px/s, was 100; route hops them a moment earlier (person timing, 0.18 s ahead) | with a late press the hop right after getting up on the counter met the glass: s0 90% | spikes | burnt | 100/90/75; s0 90 → **100/99/78; s0 99** |
| 04 | no | — | fair | coconut | coconut | 100/100/84; 100,100 |
| 05 | route only | on the hop to the last moat stone, let go of right 12 px earlier | a late hop, held longer, flew past the stone into the bank mud: 79% | crushed | crushed | 100/79/73; door 79 → **100/100/84; 100,100** |
| 06 | route only (net renamed) | on the hop on to the last net, let go of right over its middle | a late hop flew past the net on to the bank under the stones: s0 94% | splash | splash | 100/94/69 → **100/99/75; s0 99** |
| 07 | route only | hop each jeep 0.15 s ahead (the bot hops at 0.13 s), go over the boulder when it is 28 px away (was 20) | a late press landed in the jeep, and later in the boulder: 79% | spikes | hit | 100/79/65; s0 79 → **100/100/80; all 100** |
| 08 | no (snake boat renamed, route moved to tvm.ts) | — | fair | hit | spikes | 100/100/76; 100,100 |

The NAIVE play dies in every stage 02-08, and FIX dies to a different trap in 03, 05, 07 and 08 (it was already so). The only behaviour change is the TVM-03 glass speed; every other change is a more forgiving human route.

## Refreeze diff, number by number (tests/cities/_frozen/tvm.json vs bc76d83)

- TVM-01 route 2467 → 2518: the old ending (wait about 2 s for the road to close) is replaced by waiting for the ice's twitch and yank (0.75 s), a 20-tick stop and a long jump: +51 ticks.
- TVM-01 naive 187 `spikes` → 2352 `tvm-chaal`: NAIVE is now the market play. The old naive (run into the wall's glass) is still a MISTAKE.
- TVM-05 route 2170 → 2179 and FIX 1595 → 1604: releasing right earlier on the last stone hop means 9 more ticks before the long jump; the FIX is built from that route prefix, so it shifts by the same 9.
- TVM-06 route 1558 → 1562: the new release over the last net, then a drop until ground: +4 ticks.
- TVM-03, 07: route ticks unchanged (1571, 1752): the slower glasses and earlier hops end at the same win tick, so no number moved.
- TVM-02, 04, 08: unchanged.
- TVM-09 and TVM-10: new entries (see A).

## Tests and proof

- `npm run typecheck`: clean.
- `npm test`: 1493 passed, 1 failed (stale.test TVM-08, above), 12 skipped. The frozen test is green on the refrozen file. allocation.test: 10/10.
- Guard with `TVM: OLD` removed locally: every TVM check in tests/modules.test.ts passes (including prefix and install-refuses after the develop fix); reverted with `git checkout tests/modules.test.ts`.
- `npm run build:single && node scripts/flows.mjs`: no errors.
- Shots I read: `/local/home/saiposh/personal/ldd-wt/tvm/shots/route/TVM-01-sheet.png`, `TVM-03-sheet.png`, `TVM-09-sheet.png`, `TVM-10-sheet.png`. The flags, lifeguard and foam are clear; text fits; the pots, hooks, fish ice and coir mat read. The oil shine is thin and faint at phone size.

## Not done

- TVM-10 at 30.9 s is short for a finale (bible 90-150 s).
- docs/cities/TVM.md not written; this report holds the notes.
- TVM-01 has no `meta` (slot 1 is `shipped`; tourNew B4 has no field on the stage).

## Risks, and where QA should press

- TVM-01 market: does the twitch-then-yank read as "the ice moved" at 16 px? Running straight over it dies in the open drain beyond the ice (intended).
- TVM-09: the waves start on position triggers. Press on a player who waits short of a trigger, and on the backwash door: the 150 px/s push is the whole answer, so check it feels like being carried.
- TVM-10: the oil is faint; the slip on the polished step; the coir mat over the gutter looks like a fake floor, so many players will jump it (that is the joke, and the hint and advice say walk it); the shore act's oil inside the strip.
- TVM-03's glasses are now slower (85 px/s): the hint still holds.
- `coconut`/`drop` are exported from levels.ts and imported by encores.ts: a module cycle that works because both are only called at build time.
