# Integration I: cpsafe plays idle, run and tap-jump at lag 0/6/12

**Landed. develop: 4c38bcb** (4c38bcbf9acdb9ba3d3e3a7af69efa53c9687e45), a fast-forward of the local branch
infra/cpsafe3 onto 9d193f6. It changes `tests/cpsafe.test.ts` and `docs/CITY-MODULE.md` only. Pushed once
(`9d193f6..4c38bcb`). No version bump.

## Decision applied (conductor, after the first stop)

Patna is on a named per-city pending list in `tests/cpsafe.test.ts`:

```ts
/**
 * New cities that get the idle-only check for now, each with the round that removes it.
 * PAT: fails the three plays at PAT-01 cp4, PAT-02 cp3, PAT-03 cp2, PAT-04 cp0, PAT-07 cp0/1/6/8/10/11/12/13/14
 * and PAT-10 cp6/cp9 (reports/integrate-cpsafe3.md); removed by the Patna checkpoint fix round.
 */
const CPSAFE3_PENDING = ['PAT'];
```

Patna's tests are titled `PAT-0n: idle 1.5 s (pending its checkpoint fix)`. Cities with an EXEMPT entry in
tests/modules.test.ts say `(allow-listed city)`. Every other city gets the three plays.

## Gates and CI on 4c38bcb

| check | result |
| --- | --- |
| `npm run typecheck` | clean |
| `npm test` | 18 files passed, 12 skipped; **1602 passed, 0 failed, 12 skipped (1614)**, 32 s; cpsafe file 15.3 s alone |
| `npm run build:single` + `node scripts/flows.mjs` | ok, "no errors" |
| Android APK | completed, **success**, run **45927807007** ([link](https://github.com/poshithNandyala/Level-Devil-Dad/actions/runs/45927807007)) |
| Test APK | completed, **success**, run **45927806981** ([link](https://github.com/poshithNandyala/Level-Devil-Dad/actions/runs/45927806981)) |
| release `test` | "Test APK v0.17.0 (develop 4c38bcb)", target 4c38bcb…; asset **LevelDevilDad-v0.17.0.apk**, 809590 B, updated 2026-11-27T02:21:28Z |

On develop no city gets the three plays yet: the 15 shipped cities are allow-listed and PAT is pending. The
check bites as each branch merges.

## Step 3: dry-run merges into every open city branch (DATA for their builders)

Each branch tip was put in a throwaway detached worktree under /tmp, deleted afterwards, and
infra/cpsafe3 was merged in. CCU's merge conflicted only in docs/MECHANICS.md, resolved in the scratch copy
only. No src or test conflict. I ran only `tests/cpsafe.test.ts`, and committed nothing on any city branch.

TVM and KVT branches still list themselves in EXEMPT, so they ran idle-only and passed (132/132 each). To
get their data I forced the three plays for their own city in the scratch copy only, with
`-t TVM-` / `-t KVT-`.

| branch (tip at the run) | check | stages failing | failing checkpoints | failing plays | city time (sum) | slowest stage |
| --- | --- | --- | --- | --- | --- | --- |
| city/tvm f84b13c | forced 3-play | 5 of 10 | 5 | 31 | 4.7 s | 3.2 s |
| city/kvt cff7712 | forced 3-play | 5 of 10 | 14 | 51 | 11.1 s | 8.3 s |
| city/ccu a8ccc60 | 3-play | 9 of 10 | 37 | 184 | 14.7 s | 7.1 s |
| city/lko 1565ee7 | 3-play | 7 of 10 | 10 | 30 | 20.4 s | 5.0 s |
| city/dis 15e48d0 | 3-play | 6 of 10 | 27 | 113 | 9.1 s | 3.1 s |
| city/gtk a287753 | 3-play | 5 of 10 | 10 | 46 | 21.2 s | 8.7 s |
| city/bbi 947860d | 3-play | 8 of 10 | 18 | 87 | 10.2 s | 2.2 s |
| city/svp d843c79 | 3-play | 4 of 10 | 11 | 33 | 11.7 s | 8.0 s |

Several branches moved during the run (lko, dis, bbi, svp). The sha shown is the one each scratch copy
was cut from.

**A pattern that recurs in most cities:** cp0 at the first act start (x32.5, right after the room) dies to
a 0.3 s run or a tap jump. The act's first trap begins within 2-4 tiles of the act-start checkpoint.

Per-city lists below: stage, checkpoint index and x in tiles, the plays that die with their lags, and the
death cause(s).

### TVM: 5 failing checkpoints in 5 stages (TVM-02, TVM-03, TVM-04, TVM-05, TVM-08), 31 failing plays

| stage | checkpoint | plays that die (lags) | cause |
| --- | --- | --- | --- |
| TVM-02 | cp0 (x48.0) | run 0/6/12; tap-jump 0/6/12 | crushed, splash |
| TVM-03 | cp0 (x47.0) | run 0/6/12; tap-jump 0/6/12 | hit |
| TVM-04 | cp0 (x46.0) | run 0/6/12; tap-jump 0/6/12 | splash |
| TVM-05 | cp0 (x38.0) | run 0/6/12; tap-jump 0/6/12 | splash |
| TVM-08 | cp0 (x50.0) | idle; run 0/6/12; tap-jump 0/6/12 | splash |

### KVT: 14 failing checkpoints in 5 stages (KVT-04, KVT-07, KVT-08, KVT-09, KVT-10), 51 failing plays

| stage | checkpoint | plays that die (lags) | cause |
| --- | --- | --- | --- |
| KVT-04 | cp0 (x32.5) | tap-jump 0/6/12 | fell |
| KVT-04 | cp1 (x65.5) | tap-jump 0/6/12 | splash |
| KVT-07 | cp0 (x32.5) | run 0/6/12; tap-jump 0/6/12 | splash |
| KVT-08 | cp0 (x32.5) | tap-jump 0/6/12 | splash |
| KVT-08 | cp1 (x66.5) | tap-jump 0/6/12 | splash |
| KVT-09 | cp1 (x76.5) | tap-jump 0/6/12 | splash |
| KVT-09 | cp4 (x228.5) | run 0/6/12 | splash |
| KVT-10 | cp0 (x32.5) | tap-jump 0/6/12 | splash |
| KVT-10 | cp2 (x100.5) | tap-jump 0/6/12 | splash |
| KVT-10 | cp5 (x224.5) | run 0/6/12; tap-jump 0/6/12 | splash |
| KVT-10 | cp8 (x316.5) | run 0/6/12; tap-jump 0/6/12 | splash |
| KVT-10 | cp9 (x338.5) | tap-jump 0/6/12 | splash |
| KVT-10 | cp10 (x362.5) | tap-jump 0/6/12 | splash |
| KVT-10 | cp15 (x502.5) | tap-jump 0/6/12 | splash |

### CCU: 37 failing checkpoints in 9 stages (CCU-01, CCU-03, CCU-04, CCU-05, CCU-06, CCU-07, CCU-08, CCU-09, CCU-10), 184 failing plays

| stage | checkpoint | plays that die (lags) | cause |
| --- | --- | --- | --- |
| CCU-01 | cp0 (x15.0) | run 0/6/12; tap-jump 0/6/12 | ccu-kumir |
| CCU-03 | cp0 (x32.5) | tap-jump 0/6/12 | ccu-muri |
| CCU-03 | cp1 (x33.5) | run 0/6/12 | ccu-muri |
| CCU-04 | cp0 (x32.5) | tap-jump 0/6/12 | ccu-kada |
| CCU-05 | cp3 (x136.5) | run 0/6/12 | ccu-ganga |
| CCU-06 | cp0 (x18.0) | run 0/6/12; tap-jump 0/6/12 | ccu-dando, ccu-khod |
| CCU-06 | cp1 (x28.0) | run 0/6/12 | ccu-khod |
| CCU-06 | cp2 (x33.0) | run 0/6 | ccu-khod |
| CCU-06 | cp3 (x40.0) | run 0/6/12; tap-jump 0/6/12 | ccu-khod |
| CCU-06 | cp4 (x54.0) | run 0/6/12; tap-jump 0/6/12 | ccu-dando, ccu-khod |
| CCU-06 | cp5 (x70.0) | run 0/6/12 | ccu-khod |
| CCU-06 | cp6 (x86.0) | run 0/6/12; tap-jump 0/6/12 | ccu-dando, ccu-khod |
| CCU-06 | cp7 (x103.5) | tap-jump 0/6/12 | ccu-dui |
| CCU-06 | cp8 (x127.5) | run 0/6/12; tap-jump 0/6/12 | ccu-dando, ccu-khod |
| CCU-07 | cp0 (x32.5) | run 0/6/12 | ccu-gaari |
| CCU-07 | cp2 (x124.5) | run 0/6/12; tap-jump 6/12 | ccu-gaari |
| CCU-07 | cp3 (x138.0) | run 0/6/12; tap-jump 0/6/12 | ccu-gaari |
| CCU-07 | cp4 (x160.0) | idle; run 0/6/12; tap-jump 0/6/12 | ccu-cha, ccu-gaari |
| CCU-07 | cp5 (x184.5) | tap-jump 0/6/12 | ccu-gaari |
| CCU-07 | cp6 (x198.0) | run 0/6/12; tap-jump 0/6/12 | ccu-gaari |
| CCU-07 | cp7 (x220.0) | idle; run 0/6/12; tap-jump 0/6/12 | ccu-cha, ccu-gaari |
| CCU-07 | cp11 (x351.5) | run 0/6/12; tap-jump 0/6/12 | ccu-gaari |
| CCU-08 | cp0 (x49.5) | run 0/6/12; tap-jump 0/6/12 | ccu-dhowa |
| CCU-09 | cp0 (x32.5) | run 0/6/12 | ccu-bansh |
| CCU-09 | cp1 (x62.5) | run 0/6/12; tap-jump 0/6/12 | ccu-bansh |
| CCU-09 | cp3 (x128.5) | run 0/6/12 | ccu-bansh |
| CCU-09 | cp4 (x161.4) | run 0/6/12; tap-jump 0/6/12 | ccu-bansh |
| CCU-09 | cp6 (x191.4) | run 0/6/12; tap-jump 0/6/12 | ccu-bansh |
| CCU-09 | cp8 (x212.5) | run 0/6/12 | ccu-bansh |
| CCU-10 | cp3 (x116.5) | run 0/6/12; tap-jump 0/6/12 | ccu-bansh, crushed |
| CCU-10 | cp6 (x206.5) | run 0/6/12; tap-jump 0/6/12 | ccu-kada |
| CCU-10 | cp7 (x230.5) | run 0/6/12; tap-jump 0/6/12 | ccu-ganga, ccu-murti |
| CCU-10 | cp8 (x254.5) | run 0/6/12; tap-jump 0/6/12 | ccu-ganga, ccu-khor |
| CCU-10 | cp9 (x278.5) | run 0/6/12; tap-jump 0/6/12 | ccu-bansh |
| CCU-10 | cp10 (x285.4) | run 0/6/12; tap-jump 0/6/12 | ccu-bansh |
| CCU-10 | cp12 (x324.0) | run 0/6/12; tap-jump 0/6/12 | ccu-gaari |
| CCU-10 | cp13 (x346.0) | idle; run 0/6/12; tap-jump 0/6/12 | ccu-cha, ccu-gaari |

### LKO: 10 failing checkpoints in 7 stages (LKO-01, LKO-03, LKO-04, LKO-05, LKO-06, LKO-08, LKO-10), 30 failing plays

| stage | checkpoint | plays that die (lags) | cause |
| --- | --- | --- | --- |
| LKO-01 | cp1 (x35.0) | tap-jump 0/6/12 | lko-than |
| LKO-03 | cp0 (x32.5) | tap-jump 0/6/12 | lko-chhapa |
| LKO-03 | cp1 (x44.5) | tap-jump 0/6/12 | lko-jali |
| LKO-03 | cp2 (x57.5) | tap-jump 0/6/12 | lko-chhapa |
| LKO-04 | cp0 (x32.5) | tap-jump 0/6/12 | lko-malai |
| LKO-05 | cp1 (x56.5) | tap-jump 0/6/12 | lko-tawa |
| LKO-06 | cp6 (x88.6) | tap-jump 0/6/12 | lko-mehfil |
| LKO-06 | cp7 (x96.6) | tap-jump 0/6/12 | lko-mehfil |
| LKO-08 | cp1 (x52.5) | tap-jump 0/6/12 | lko-kuan |
| LKO-10 | cp3 (x88.5) | tap-jump 0/6/12 | lko-kuan |

### DIS: 27 failing checkpoints in 6 stages (DIS-04, DIS-05, DIS-06, DIS-07, DIS-08, DIS-10), 113 failing plays

| stage | checkpoint | plays that die (lags) | cause |
| --- | --- | --- | --- |
| DIS-04 | cp0 (x32.5) | run 0/6/12; tap-jump 0/6/12 | dis-roll, dis-tawa |
| DIS-04 | cp1 (x33.5) | idle; run 0/6/12; tap-jump 0/6/12 | dis-roll, dis-tawa |
| DIS-04 | cp2 (x70.5) | tap-jump 0/6/12 | dis-roll |
| DIS-04 | cp3 (x71.5) | run 0/6/12; tap-jump 0/6/12 | dis-roll |
| DIS-05 | cp4 (x99.5) | run 0/6/12; tap-jump 0/6/12 | dis-gamosa |
| DIS-06 | cp0 (x32.5) | tap-jump 0/6/12 | dis-bank |
| DIS-06 | cp1 (x33.5) | run 0/6/12; tap-jump 0/6/12 | dis-bank |
| DIS-06 | cp4 (x108.5) | tap-jump 0/6/12 | dis-bank |
| DIS-06 | cp5 (x109.5) | run 0/6/12; tap-jump 0/6/12 | dis-bank |
| DIS-06 | cp6 (x126.5) | tap-jump 0/6/12 | dis-bank |
| DIS-07 | cp0 (x18.5) | tap-jump 0/6/12 | dis-gate |
| DIS-07 | cp3 (x52.5) | tap-jump 0/6/12 | dis-gate |
| DIS-07 | cp5 (x84.5) | tap-jump 0/6/12 | dis-gate |
| DIS-07 | cp8 (x103.0) | run 0/6/12; tap-jump 0/6/12 | dis-bordoisila |
| DIS-07 | cp11 (x121.5) | tap-jump 0/6/12 | dis-dhol-sink |
| DIS-07 | cp15 (x176.5) | tap-jump 0/6/12 | dis-gate |
| DIS-07 | cp17 (x200.5) | tap-jump 0/6/12 | dis-gate |
| DIS-07 | cp19 (x224.5) | tap-jump 0/6/12 | dis-gate |
| DIS-08 | cp0 (x32.5) | tap-jump 0/6/12 | dis-gorh |
| DIS-08 | cp1 (x50.5) | run 0/6/12; tap-jump 0/6/12 | dis-gorh |
| DIS-08 | cp5 (x136.5) | run 0/6/12; tap-jump 0/6/12 | dis-gorh |
| DIS-08 | cp6 (x137.5) | run 0/6/12 | dis-gorh |
| DIS-10 | cp1 (x33.5) | tap-jump 0/6/12 | dis-dhol-sink |
| DIS-10 | cp3 (x64.5) | run 0/6/12; tap-jump 0/6/12 | dis-hail |
| DIS-10 | cp4 (x65.5) | run 0/6/12; tap-jump 0/6/12 | dis-bhoral, dis-hail |
| DIS-10 | cp12 (x162.0) | tap-jump 0/6/12 | dis-luit |
| DIS-10 | cp13 (x180.0) | idle | dis-luit |

### GTK: 10 failing checkpoints in 5 stages (GTK-01, GTK-03, GTK-05, GTK-09, GTK-10), 46 failing plays

| stage | checkpoint | plays that die (lags) | cause |
| --- | --- | --- | --- |
| GTK-01 | cp2 (x79.5) | tap-jump 12 | gtk-jhadu |
| GTK-03 | cp1 (x68.5) | tap-jump 0/6/12 | gtk-jhora |
| GTK-05 | cp1 (x44.5) | tap-jump 0/6/12 | gtk-jurmana |
| GTK-05 | cp2 (x59.5) | run 0/6/12; tap-jump 0/6/12 | gtk-jhadu, gtk-jurmana |
| GTK-09 | cp0 (x32.5) | run 0/6/12; tap-jump 0/6/12 | gtk-hiun |
| GTK-09 | cp1 (x66.5) | run 0/6/12; tap-jump 0/6/12 | gtk-hiun |
| GTK-09 | cp2 (x106.5) | run 0/6/12; tap-jump 0/6/12 | gtk-hiun |
| GTK-09 | cp3 (x146.5) | run 0/6/12; tap-jump 0/6/12 | gtk-hiun |
| GTK-10 | cp4 (x152.5) | tap-jump 0/6/12 | gtk-jurmana |
| GTK-10 | cp9 (x327.5) | run 0/6/12; tap-jump 0/6/12 | gtk-hiun |

### BBI: 18 failing checkpoints in 8 stages (BBI-02, BBI-03, BBI-04, BBI-05, BBI-06, BBI-07, BBI-09, BBI-10), 87 failing plays

| stage | checkpoint | plays that die (lags) | cause |
| --- | --- | --- | --- |
| BBI-02 | cp2 (x98.5) | run 0/6/12; tap-jump 0/6/12 | bbi-ball |
| BBI-03 | cp0 (x32.5) | run 0/6/12; tap-jump 0/6/12 | bbi-rangapani |
| BBI-03 | cp1 (x52.5) | run 0/6/12; tap-jump 0/6/12 | bbi-rangapani |
| BBI-04 | cp1 (x40.5) | run 0/6/12 | bbi-kunda |
| BBI-04 | cp2 (x55.5) | run 0/6/12 | bbi-kunda |
| BBI-05 | cp10 (x180.5) | run 0/6/12 | bbi-bail |
| BBI-06 | cp0 (x32.5) | tap-jump 0/6/12 | bbi-shuttle |
| BBI-06 | cp1 (x52.5) | tap-jump 0/6/12 | bbi-ranga |
| BBI-06 | cp3 (x90.5) | run 0/6/12; tap-jump 0/6/12 | bbi-ranga, crushed |
| BBI-06 | cp4 (x107.5) | run 0/6/12; tap-jump 0/6/12 | bbi-ranga, bbi-shuttle |
| BBI-07 | cp2 (x74.5) | tap-jump 0/6/12 | bbi-nacha |
| BBI-07 | cp3 (x108.5) | run 0/6/12; tap-jump 0/6/12 | bbi-nacha |
| BBI-09 | cp1 (x56.5) | run 0/6/12; tap-jump 0/6/12 | bbi-udaya |
| BBI-09 | cp4 (x138.5) | tap-jump 0/6/12 | bbi-udaya |
| BBI-09 | cp5 (x166.5) | run 0/6/12; tap-jump 0/6/12 | bbi-ara |
| BBI-10 | cp1 (x66.5) | run 0/6/12; tap-jump 0/6/12 | bbi-rangapani |
| BBI-10 | cp3 (x106.5) | run 0/6/12; tap-jump 0/6/12 | bbi-ranga, crushed |
| BBI-10 | cp4 (x118.5) | run 0/6/12; tap-jump 0/6/12 | bbi-nacha |

### SVP: 11 failing checkpoints in 4 stages (SVP-03, SVP-06, SVP-07, SVP-10), 33 failing plays

| stage | checkpoint | plays that die (lags) | cause |
| --- | --- | --- | --- |
| SVP-03 | cp1 (x42.6) | tap-jump 0/6/12 | svp-magar2 |
| SVP-03 | cp2 (x48.6) | tap-jump 0/6/12 | svp-magar2 |
| SVP-03 | cp3 (x54.6) | tap-jump 0/6/12 | svp-magar2 |
| SVP-06 | cp1 (x52.5) | tap-jump 0/6/12 | svp-kichad2 |
| SVP-07 | cp0 (x23.4) | tap-jump 0/6/12 | svp-bheed |
| SVP-07 | cp4 (x91.0) | tap-jump 0/6/12 | svp-bheed |
| SVP-07 | cp6 (x137.0) | tap-jump 0/6/12 | svp-bheed |
| SVP-10 | cp1 (x42.6) | tap-jump 0/6/12 | svp-magar2 |
| SVP-10 | cp2 (x48.6) | tap-jump 0/6/12 | svp-magar2 |
| SVP-10 | cp3 (x54.6) | tap-jump 0/6/12 | svp-magar2 |
| SVP-10 | cp10 (x205.0) | tap-jump 0/6/12 | svp-bheed |

## What the test now plays (tests/cpsafe.test.ts)

The test replays the route's inputs up to each checkpoint (replay(), as a real respawn does) and sets Dad's
`vx` to 0. Then it plays each of these, and Dad must be alive at the end:

| play | inputs | lags |
| --- | --- | --- |
| idle | nothing for 4 s (480 ticks) | once |
| run | wait `lag` ticks, hold forward 36 ticks (0.3 s), then nothing until 4 s | 0, 6, 12 |
| tap-jump | wait `lag` ticks, jump held 6 ticks while holding forward, keep forward until he lands, then nothing until 4 s | 0, 6, 12 |

That is 7 plays per checkpoint. "Forward" is right, or left while gravity is flipped.

- A failure line names the stage, checkpoint index, checkpoint x (tiles), play, lag, death cause and where
  Dad died, eg. `PAT-03 cp2 x101.5 tap-jump lag 6: pat-ghanti @x101.7`.
- Cities with an entry in `EXEMPT` (tests/modules.test.ts) keep the old check, idle 1.5 s. Today that is
  all 15 shipped cities, including RNC. The list is read from modules.test.ts at test time, so there is
  still one list: when a pass deletes its city's EXEMPT entry, the city gets the full check with no
  second edit.
- The test title says which check ran: `PAT-05: idle, run and tap-jump at lag 0/6/12`, or
  `RNC-05: idle 1.5 s (allow-listed city)`.
- Timeout per stage: 300 s.

**Cost.** Each play rebuilds its world with replay(), so the cost is 7 x checkpoints x route length. The
single-pass trick from Integration G applies to the exactness test only: a play has to start from its
own rebuilt world, and a World can't be cloned (closures in `when`/`onTick`). On this host, for Patna, the
whole file took 29.3 s for 130 stages:

| PAT stage | time |
| --- | --- |
| 01-04 | 0.22-0.24 s each |
| 05 | 2.07 s |
| 06 | 2.79 s |
| 07 | 3.13 s |
| 08 | 0.07 s |
| 09 | 1.97 s |
| 10 (slowest) | **10.43 s** (of 300 s) |
| **PAT total** | about 21 s |

The allow-listed cities are unchanged (RNC-01..08 0.02-0.19 s each).

## Patna (on develop, now pending): fails 6 of 10 stages

**DATA for the Patna builder:** each failing checkpoint, the plays that kill and the death cause. No
city code was touched.

| stage | checkpoint (x tiles) | plays that die | cause (where) |
| --- | --- | --- | --- |
| PAT-01 | cp4 (90.0) | idle; run lag 0/6/12; tap-jump lag 0/6/12 | pat-tempo (x92.9-94.8) |
| PAT-02 | cp3 (86.0) | idle | pat-angara (x85.7) |
| PAT-03 | cp2 (101.5) | tap-jump lag 0/6/12 | pat-ghanti (x101.7) |
| PAT-04 | cp0 (32.5) | tap-jump lag 0/6/12 | pat-bojh (x35.6) |
| PAT-07 | cp0 (32.5) | idle; tap-jump lag 0/6/12 | pat-dhakka (x45.6-49.1) |
| PAT-07 | cp1 (52.0) | idle; run lag 0/6/12; tap-jump lag 0/6/12 | pat-dhakka (x63.6-66.9) |
| PAT-07 | cp6 (220.0) | run lag 0/6/12; tap-jump lag 0/6/12 | pat-dhakka (x228-229) |
| PAT-07 | cp8 (257.0) | idle | pat-dhakka (x265.8) |
| PAT-07 | cp10 (300.0) | idle; tap-jump lag 0/6/12 | pat-dhakka (x308.6-312.1) |
| PAT-07 | cp11 (348.0) | run lag 0/6/12; tap-jump lag 0/6/12 | pat-torana (x356-357) |
| PAT-07 | cp12 (378.5) | idle; run lag 0/6/12; tap-jump lag 0/6/12 | pat-dhakka (x389.6-393.1) |
| PAT-07 | cp13 (386.0) | run lag 0/6/12; tap-jump lag 0/6/12 | pat-dhakka (x389.6-391.3) |
| PAT-07 | cp14 (408.0) | run lag 0/6/12; tap-jump lag 0/6/12 | pat-torana (x416-417) |
| PAT-10 | cp6 (240.5) | tap-jump lag 0/6/12 | pat-bojh (x243.6) |
| PAT-10 | cp9 (312.0) | idle; run lag 0/6/12 (pat-torana x313); tap-jump lag 0/6/12 (pat-torana x317) | idle: pat-dhakka (x319.6) |

PAT-05, 06, 08 and 09 pass.

What the deaths are:
- **Idle deaths after 1.5 s.** Every one passed the old 1.5 s idle check: develop's suite was green at
  9d193f6. They die between 1.5 s and 4 s. Most are `pat-dhakka`, a crowd that carries Dad forward
  9-13 tiles while he stands still. The others are `pat-tempo` and `pat-angara` on PAT-01/02.
- **Run and tap-jump deaths.** These are hazards 1-9 tiles past the checkpoint (`pat-torana`, `pat-bojh`,
  `pat-ghanti`). That is the same kind of finding the Kavaratti tester made on KVT-09/10.
- **The 4 s idle is new.** CITY-MODULE.md's rule says "survives standing idle" with no duration; the
  brief set 4 s. If 4 s is too long for a crowd that comes to Dad by design (dhakka), that is a rule
  decision, not a test bug.

## Step 4: the rule in docs/CITY-MODULE.md

Next to "Every checkpoint survives standing idle, running then idling, and a tap jump then idling.":
"`tests/cpsafe.test.ts` plays each, from every checkpoint of every stage: idle 4 s; wait 0, 6 or 12 ticks,
run forward 0.3 s, idle to 4 s; wait 0, 6 or 12 ticks, tap jump (6 ticks) running forward until he lands,
idle to 4 s. Dad must be alive at the end of all seven (cities still on the modules-test allow-list, and new
cities named in `CPSAFE3_PENDING` in that test, keep the old 1.5 s idle check until their pass or named fix
round removes them)."
