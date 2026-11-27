# CCU fix round 4

Branch `city/ccu`, worktree `ldd-wt/ccu`, tip `e5be41d` (from `ef55236`). Not pushed, no version bump.

## What does not meet the bar

- **03 is over the 7.5 s replay bar: 13.6 / 18.7 / 16.5 s at lag 0 / 6 / 12, unchanged from round 3.** I tried splitting the room tin and the dokan tin into two tins each, with pavement between, and reverted it. 03 is not re-laid and the tin has no pause where it is set down.
- **07's first stretch is over the bar: 10.0 / 9.7 / 10.3 s.** It runs from the stage start to a ccu-gaari death at x40, at the start of the girder act. Every later 07 stretch is ≤ 8.8 s at the worst lag; the sweep prints those per-checkpoint values as maxStretch 8.8–9.1 and the stretch lines at cp10/cp12 as 8.4–8.8 s. The 28.3 room checkpoint is not taken by the lagged run before that death. **07 does not meet the bar.**
- 02 is exactly at the bar at lag 6 (7.5 s). I did not add a mid-ride bus stop; the bar was met by slowing the door bus later.
- **01 is written up as a tour with one bite**, the kumir chalk river. Its FIX dies `fell` in the rail-works trench, which is a plain pit, not a second trap.
- 08 is one mechanism with two causes now. The FIX ("never stop, walk straight into the water") and the mistake "waiting by the second adda" die at the same tick (702 / 722 / 740), so they are the same play in effect.
- `ccu06-points` is folded into the stage pair: the stage FIX dies of ccu-points and the act's jump dies of ccu-khod. It has no stay script of its own.
- **The 05 slot label in `docs/allocation.json` is left for the integrator at merge.**
- Probe caveats outside this round's items: 04's NAIVE dies of ccu-boi at lag 0 but ccu-kada at lags 6 and 12 (the FIX's cause). 09's NAIVE gets stuck at lags 6 and 12.

## Replay per tick (worst stretch, s; lag 0 / 6 / 12)

| Stage | Round 3 | Round 4 | Bar 7.5 |
|---|---|---|---|
| 01 | 9.2 / 9.2 / 9.2 | 7.3 / 7.3 / 7.3 | met |
| 02 | 9.0 / 9.2 / 9.0 | 7.2 / 7.5 / 7.2 | met (at the bar at lag 6) |
| 03 | 13.6 / 18.7 / 16.5 | 13.6 / 18.7 / 16.5 | **not met** |
| 04 | 6.5 / 6.5 / 6.8 | 6.5 / 6.5 / 6.8 | met |
| 05 | 5.8 / 5.5 / 5.5 | 5.8 / 5.5 / 5.5 | met |
| 06 | 7.3 / 7.2 / 7.1 | 7.3 / 7.2 / 7.1 | met |
| 07 | 13.1 / 13.0 / 13.0 | 10.0 / 9.7 / 10.3 | **not met** (start to girder act) |
| 08 | 4.5 / 6.0 / 6.3 | 4.5 / 6.0 / 6.3 | met |
| 09 | 7.4 / 7.4 / 7.5 | 7.4 / 7.4 / 7.5 | met |
| 10 | 7.5 / 7.5 / 7.5 | 7.5 / 7.5 / 7.5 | met |

Source: `fix4/j-cps.txt`, the `worstReplay` lines.

## Segment layout of the re-laid rides

- **07, pylon act:** a mid-span pylon step at +17..24 with a calm checkpoint at +18.4. The first tall porter starts at −3 at 55 px/s and rests at +18.8. A second tall porter (sack) starts at +11 at 55 px/s. He goes when Dad stands between +18 and +25, and rests at +40.8. The route rides to 17.8, steps off, walks to 19.4 and hops up on the next porter.
- **07, horn:** the span ends at a pylon step at +29..35. The road runs +9..29, the first porter rests at +29.8, and the checkpoints are at +1.5, +4.5 and +31.
- **07, board:** the span ends at a pylon step at +32..39. The road runs +9..32, porter a rests at +32.8, and the checkpoints are at +5 and +33.5.
- **07, room:** a checkpoint at 28.3, as the tall porter brings Dad over the pylon step.
- **01:** kumir A's hunt is 4.2 s (was 4.5) and kumir B's is 4 s (was 6.5). The checkpoints stay at 8, 42, 57, 75 and 97.
- **02:** the door bus (`ccu-stop`) starts slowing 48 px before the stop (was 150). The crawl stays at 40.

## Causes and lines (law 9)

- **08:** the water's cause is ccu-adda while an adda holds Dad and ccu-dhowa otherwise. NAIVE: ccu-dhowa → ccu-adda.
- **New finale causes**, each with its own line naming the broken rule:
  - ccu-depot: the finale bus's off-cause.
  - ccu-phire: the front coming back.
  - ccu-kumir10: the backwards kumir.
  - ccu-danga: the finale's chalk pool.
  - ccu-pherot: the quiet stack.
  - ccu-khola: the pandal being taken down.
- **Before this round,** those finale deaths reused the original stages' causes (ccu-baan, ccu-kumir, ccu-boi, ccu-bansh, and the bus's ccu-gir/ccu-nala).
- **Lines:** every line in `causes.ts` now names what killed you, and none repeats the advice that killed you. ccu-khod's line was made generic, because it serves the dug-up road in 06, 08's old rok and the points act. ccu-rail, ccu-phata and ccu-ghat are gone with their mechanisms.

## Probe table (cause@tick, lag 0 / 6 / 12)

Script-made, from `fix4/j-causes.txt` (each stage's NAIVE and FIX, then its act and door scripts):

```
01 NAIVE ccu-kumir@179/185/191   FIX fell@1478/1526/1574   thela long jump ccu-kumir@2372/2394/2412
02 NAIVE ccu-gir@232/238/244     FIX ccu-nala@414/420/426  off backwards ccu-ulto@699/705/711
03 NAIVE ccu-muri@574/580/586    FIX ccu-lonka@618/622/628
04 NAIVE ccu-boi@151 / ccu-kada@165 / ccu-kada@243   FIX ccu-kada@194/209/225   short stack ccu-boi@653/667/698
05 NAIVE ccu-murti@522/528/534   FIX ccu-ganga@179/185/198
   lane long jump ccu-ganga@650/712/785; lane rest ccu-murti@1737/1799/1851; in order ccu-murti@1588/1718/1838; ghat jump ccu-ganga@1207/1352/1483
06 NAIVE ccu-dando@984/992/994   FIX ccu-points@2415/2436/2460
   step at double island ccu-dui@5015/5037/5086; roof ccu-dando@4160/4185/4234; jump into dug-up road ccu-khod@1870/1914/1941
07 NAIVE ccu-cha@896/908/920     FIX ccu-bojha@457/477/495
   jowar stop ccu-baan@7315/7362/7405; jowar long jump ccu-nala@6967/7020/7069; pylon at once ccu-cha@5469/5502/5537
   girder stay ccu-cha@1770/1759/1751; girder jump ccu-gaari@1205/1223/1259; dui stay ccu-cha@2684/2676/2680; dui long jump ccu-gaari@2048/2040/2038
   horn middle ccu-parapet@3236/3238/3265; horn hop ahead ccu-gaari@3175/3183/3216
   board switch ccu-cha@4560/4574/4582; board jump ccu-gaari@4520/4540/4554; pylon jump ccu-gaari@5188/5215/5244
08 NAIVE ccu-adda@535/555/573    FIX ccu-dhowa@702/722/740 second adda ccu-dhowa@702/722/740
09 NAIVE ccu-bansh@195 / stuck / stuck   FIX crushed@341/383/425
   rest top crushed@722/784/863; canopy wait crushed@1294/1357/1435; on queue ccu-line@2755/2899/3062; under queue ccu-bansh@2699/2829/2980
   high bamboo ccu-bansh@1519/1639/1772; lifted panel crushed@2763/2882/3021; staircase jump ccu-bansh@521/607/658; canopy jump ccu-bansh@938/1007/1090
10 NAIVE ccu-boi@638/650/662     FIX ccu-gir@1501/1513/1525
   kumir as on Maidan ccu-kumir10@5624/5786/5885; one long jump ccu-danga@5712 / ccu-danga@5866 / ccu-kumir10@5871
   ahead of front ccu-phire@3494/3527/3558; back from front ccu-nala@3221/3269/3312; under canopy crushed@3171/3193/3214; gallery jump ccu-bansh@3005/3039/3061
   quiet stack ccu-pherot@4276/4313/4350; high stall jump ccu-kada@4041/4095/4140; cloth top ccu-khola@5235/5347/5434; bamboo under frame crushed@5386/5509/5567
   first porter back ccu-cha@6975/7146/7258; second span short porter ccu-cha@7813/7989/8112; bus past aaste ccu-depot@2387/2404/2419; drain jump ccu-nala@1106/1124/1167
   figure jump ccu-ganga@4840/4903/4921; rest on figure ccu-murti@5451/5498/5518; off front of tall porter ccu-gaari@7608/7798/7938
```

The probe has no separate room-only rows for 07 and 10: their rooms are the stage NAIVE and FIX.

## Proofs (all in `fix4/`)

- **tsc:** `npx tsc --noEmit` exits 0.
- **Full suite** (`j-suite.txt`): 18 files passed, 13 skipped; 1789 tests passed, 20 skipped, 0 failed. cpsafe (strict, 142 tests) passes. CCU is on no allow-list: a grep of `tests/` for allow, skip, known or exempt entries naming CCU finds none.
- **Fair, LDD_N=80** (`j-fair.txt`): every stage is 100% at 6t and 12t, and every stretch is 100% at 0–12t. At 18t: 03 76%, 04 88%, 05 93%, 07 93%, 09 84% and 10 80%.
- **Flows** (`j-flows.txt`): `build:single`, then `node scripts/flows.mjs`, reports no errors.
- **Lag-captured calm sweep** (`j-calm.txt`): all ten stages have 0 calm deaths.
- **Replay table** (`j-cps.txt`): see above.
- **Sheets:** re-shot with `LDD_ENDREC=1` for 01, 02 and 07 (`shots/CCU-0{1,2,7}-sheet.png`), all read. Not re-shot: 08 and 10, whose code changed only in cause ids and lines; 06, whose act changed only in its scripts; and 03, which was not touched.

## Route times (lag 0, s; round 3 in brackets)

01 24.5 (27.0), 02 15.2 (16.9), 03 27.7, 04 17.1, 05 19.2, 06 50.8, 07 70.1 (72.6; par 98), 08 14.1, 09 36.2, 10 71.2. These are the times the scripted routes take. None is padded.

## Commits (ef55236..e5be41d)

- `27a0907` the adda's hold its own cause; the finale callbacks' causes and lines; the cut acts' code deleted (uthon, tokta, baan, uthan2, toran, chala, tram10, girderRoute, duiRoute); points folded into the stage pair
- `acdc83c` 01's kumir hunts shorter; 02's door bus slows a bus-length short
- `1d24311` 07 pylon act mid-span pylon step
- `7e86615` 07 horn and board spans end at a pylon step; room checkpoint 28.3
- `a82b83f` mid-span checkpoint at 18.4, clear of the road at every lag
- `1343d6a` the QA probe `tests/zz-qa.test.ts`, committed by mistake in fix 3, taken out
- `e5be41d` CCU.md round-4 note and cause list

## Skipped / not checked

- I did not re-lay 03, and 07's first stretch is still over the bar.
- I did not look at the 04 NAIVE cause drift with lag or the 09 NAIVE stuck at lags 6 and 12.
- I did not re-shoot sheets for 08 and 10.
