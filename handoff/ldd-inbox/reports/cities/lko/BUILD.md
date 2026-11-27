# LKO · Lucknow: build report

- **Branch:** `city/lko` in `/local/home/saiposh/personal/ldd-wt/lko`, tip **0b7357375f6455237d76ad2b62b2fd3daea530fe** after fix round 1 (FIX-1.md; before that af20d79 after the length pass (origin/develop 219e3b9 merged in, no rebase; see LENGTH.md). Not pushed, no version bump.
- **Files touched:** `src/game/cities/lko/` (index, kit, s01..s10, lines, causes, endings, things, theme, look, music, skin, course, backdrop), `tests/cities/lko.ts`, `docs/cities/LKO.md`, LKO's row in `docs/CITIES.md`. No other shared file. `docs/MECHANICS.md` has no LKO section to edit; the ideas for it are in `docs/cities/LKO.md` for the integrator.
- **Allocation:** v2 (`docs/allocation.json` from origin/develop). Every stage's `meta` matches its slot, with `meta.ending` set. No reserves used.

## Fix round 1

QA FAIL.md findings B1-B6 and the polish list are answered in `FIX-1.md` (same folder): new acts in 02, 03, 04, 05, 08 and 09, the finale rebuilt without verbatim copies, the 03 door replaced (`lko-balti`), hidden checkpoints so no scripted death is more than 8 s from its checkpoint, `lives: 'act'` on 05, 06, 08, 09. The table below has the new clear times, pars and causes; the acts are listed in `docs/cities/LKO.md`.

## Stages

Clear time = the scripted route's time (a bot, so a fast player). Fairness = `npm run fair -- LKO`, 0-12 tick lag: stage / worst stretch.

| Id | Name | Concept | Family | Betrayals | Clear | Par | NAIVE dies of | FIX dies of | Fair stage / stretch | Hidden item | Door ending |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LKO-01 | Aadaab Lucknow (tour) | LKO-F1 Chowk cloth bolts | sold-bolt-hooked-out-sideways | B3, bolt-unrolls-curtain | 14.2 s | 24 | `lko-than` (stood on a bolt: hooked out sideways) | `lko-parda` (paused after the bolts: the unrolling bolt's roller) | 100% / 100% | `lko-malai` on the deck | `lko-gomti-ghat` (the tour's plain door) |
| LKO-02 | Pehle Aap | LKO-02 | politeness-bow-sets-order | bow-order | 26.7 s | 28 | `lko-pehle` (leaned in: pushed through first on to the loose stone) | `lko-dhakka` (bowed twice: he insisted and saw you through) | 100% / 100% | `lko-malai` over the courtyard | `lko-kiwad` door leaves swing out |
| LKO-03 | Chhapa | LKO-04 | print-washed-stitch-remains | wash-remains | 25.2 s | 26 | `lko-chhapa` (walked the print, first whistle) | `lko-jali` (stood on white jali, second wash) | 100% / 100% | `lko-chikan` over the vat | `lko-balti`: real door, its threshold cloth over the vat; the dhobi’s bucket (fix round 1) |
| LKO-04 | Makhan Malai | LKO-05 | sun-direction-sinks-foam | light-sinks | 25.5 s | 33 | `lko-malai` (lined up on the sunlit tile) | `lko-dhakkan` (stayed on the shady tile after the lid flipped the light) | 100% / 100% | `lko-malai` over heap 5 | `lko-kulhad` bhatti behind flips the light |
| LKO-05 | Galouti | LKO-08 | flatten-platforms-build-low-lane | flatten-lane | 37.6 s | 49 | `lko-seekh` (hopped off a full heap into the skewers) | `lko-tawa` (waited on the flat kebab: burned) | 100% / 100% | `lko-galouti` under the rack | `lko-sheermal` bread ledge in the tandoor |
| LKO-06 | Kathak | LKO-06 | sound-draws-dancer-spin | sound-draws | 33.1 s | 43 | `lko-chakkar` (walked on the bells) | `lko-tatkar` (plain boards only, on to the board she taps) | 100% / 100% | `lko-ghungroo` over the takht | `lko-sam` door opens on her last stamp |
| LKO-07 | Hazratganj (marathon) | LKO-07 | pace-sets-crowd-shape | pace-crowd, ladder-block | 69.6 s | 90 | `lko-ganj` (rushed the strollers: shoved into the nala) | `lko-shamiyana` (strolled on under the dusk awnings) | 100% / 100% | `lko-kulfi` over the nala | `lko-darban` doorman holds it only for strollers |
| LKO-08 | Bhool Bhulaiya (HWIK) | LKO-03 | entry-height-routes-level | enter-height | 23.7 s | 31 | `lko-bhool` (hopped the drain into the arch: came out upstairs on the hooks) | `lko-kuan` (walked every arch: walked into the well) | 100% / 100% | `lko-sheermal` over the gallery | `lko-489` walk the last arch and step off |
| LKO-09 | Kabootarbazi | LKO-10 | flag-colour-steers-flock | flag-signal | 46.6 s | 61 | `lko-kabootar` (crossed on white) | `lko-hawa` (in the wind, went on the red he saw: the birds saw white) | 100% / 100% | `lko-kulfi` over roof 2 | `lko-chhatri` the loft door |
| LKO-10 | Lakhnavi Tehzeeb (finale) | LKO-12 | finale-bow-meets-bells | bow-vs-bells | 52.9 s | 69 | `lko-pehle` (walked straight in) | `lko-tehzeeb` (bowed on the chikan-covered bells) | 100% / 100% | `lko-chikan` past the doorway | `lko-tehzeeb` the door that bows back |

Length pass (LENGTH.md): new acts `lko05-dum`, `lko06-mehfil`, `lko07-julus`, `lko07-saamne`, `lko08-chausar` (Pachisi reserve), `lko09-gumbad` (Taj reserve), and the finale's callbacks. Fairness after the pass: every stage at least 98% at 0-12t, every stretch at least 98%.

NAIVE: all 10. FIX: all 10. MISTAKES (extra scripted deaths): LKO-02 (gali offer), 03 (jali stop, printed door), 04 (shrinking shadows, bhatti step), 07 (lamplighter, darban), 08 (vault hop, crack hop), 10 (gallery stop, bow at the threshold). Lives `'act'` on 07 and 10.

## Tests

- `npm run typecheck`: clean.
- `npm test` (after the length pass): **18 files passed, 12 skipped; 1597 tests passed, 12 skipped, 0 failed**. Includes the LKO guard (`tests/modules.test.ts`, LKO on no allow-list), `allocation.test.ts` (meta and `meta.ending` keys), levels (route wins, deterministic, every rival variant, NAIVE, FIX, MISTAKES), act routes, ending policies, `cpsafe`, `checkpoints`, `items`, jump audit; frozen tests untouched.
- LKO alone: `npx vitest run tests/levels.test.ts tests/modules.test.ts tests/allocation.test.ts tests/cpsafe.test.ts tests/checkpoints.test.ts tests/items.test.ts -t LKO`: 112 passed.
- `npm run build:single && node scripts/flows.mjs`: built, flows "no errors".

## Fairness output (`npm run fair -- LKO`, 40 runs per lag)

```
LKO-01: 6t 100%  12t 100%  18t 85%
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  door 100%
LKO-02: 6t 100%  12t 100%  18t 100%
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  door 100%
LKO-03: 6t 100%  12t 100%  18t 80%
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  door 100%
LKO-04: 6t 100%  12t 100%  18t 80%
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  door 100%
LKO-05: 6t 100%  12t 100%  18t 80%
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  door 100%
LKO-06: 6t 100%  12t 100%  18t 98%
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  door 100%
LKO-07: 6t 100%  12t 100%  18t 100%
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  s6 100%  door 100%
LKO-08: 6t 100%  12t 100%  18t 100%
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  door 100%
LKO-09: 6t 100%  12t 100%  18t 80%
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  door 100%
LKO-10: 6t 100%  12t 100%  18t 85%
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  door 100%
```

(LKO-05, 07 and 09 were run again after they were lengthened: 05 100%/100%, 07 100%/100%, 09 100%/100%.)

## Screenshots

`/local/home/saiposh/personal/ldd-inbox/reports/cities/lko/shots/LKO-01-sheet.png` .. `LKO-10-sheet.png` (12 frames along each route, `scripts/dev/shots.sh`). I looked at 01, 04, 07 and 10 closely: the Rumi Darwaza-like gate, the long hall and the Gomti read as Lucknow behind every stage; bubbles and Tara's card fit; the door endings show (darwaza, shadow muslin, bhatti, tandoor, loft, the bowing door). Not checked frame by frame: 02, 03, 05, 06, 08, 09.

## HWIK (LKO-08), TROLL-BIBLE section D

1. **Death teaches in one look:** after the hop through arch 1 you are visibly up on the gallery, on the hooks; the death line says "you went through at a jump, so you came out a floor up".
2. **Second attempt is one move:** don't hop the little drain; walk over it (a one-tile drain is walkable at a run).
3. **One unknown only, never twice in a row:** the only unknown is arch 1; arch 2 (well past it, visible through the arch) and the act's vault (hooks visible) apply the rule just learned. LKO-07 and LKO-09 around it are knowable stages.
4. **No pixel or stand-still hunt:** the trigger is a hop the player makes anyway.
5. **Natural to the city:** the old maze is famous for identical doorways on several levels; "which floor do I come out on" is the joke locals know.
6. **Fair:** 100% at average lag; a death costs at most 8 s (checkpoints at act start and the door).
- **The hint names the tell afterwards:** "Look at how you went in, not which arch: go through an arch at a jump and you come out one floor up; walk through and you stay on your floor."

## What I cut, and why

- **Length (superseded by LENGTH.md).** Before the length pass the route times (8-31 s for a bot) were short of the bible's targets (long 60-90 s, marathon 2-3 min, finale 90-150 s). I lengthened 05 (16-heap tawa, 22-tile lane), 07 (ten awnings, three lamplighters) and 09 (nine roofs in the wind) but ran out of time for 06 and 10, and 07 is about 25 s for a bot, not 2 minutes. A first-time player takes several times the bot time, but QA should judge whether 05, 06, 07, 09 and 10 need more acts.
- **Language.** Only the bible's VERIFIED lines are spoken, about 22 of them, so lines repeat across Tara's intros, taunts, the guide and NPCs, and the guide's lines are flavour more than advice (the hint carries the advice). Tara tells the truth once ("Har darwaza ek jaisa hai", LKO-08).
- **Art.** Theme, grade, lime-plaster ground caps, the skyline (gate, hall, clock tower, domes, the Gomti, a Hazratganj colonnade) and the Yaman loop are done. There are no `sceneFeatures`; every stage uses the city backdrop. The lamplighter's ladder art is simple, and the awnings fall as flat strips.
- **The tour's door** has no ending of its own (tours don't); its `meta.ending` is `lko-gomti-ghat` so the allocation test has a key.
- **No `docs/MECHANICS.md` edit:** it has no LKO section, and CITY-MODULE.md leaves it to the integrator; the ideas are in `docs/cities/LKO.md`.

## Not checked, risks

- The game was not played by a person. The fairness model and bots only show the stages can be won.
- LKO-04 FIX and NAIVE both die of `lko-malai` (different tiles, same cause). LKO-09 FIX and NAIVE both die of `lko-kabootar` (different rule). LKO-10's NAIVE dies of LKO-02's loose stone (a callback).
