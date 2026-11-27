# Integration F: shared tests independent of shipped cities' key names

**develop: ea12cdf** (ea12cdf907b5413f15563b0f8d12f3f0b12f3cb2), one commit on 219e3b9, pushed once
(`219e3b9..ea12cdf`). It changes tests only: no game code, no gameplay change, no version bump. Nothing was
committed on city/tvm.

## The decision

The shared tests go on naming keys by their bare names. One matcher makes a bare name also find its
`<code>-` form: `sameKind(actual, bare)` (tests/runner.ts) is true when `actual === bare`, or when `actual` is
`xyz-` + `bare` (three lower-case letters and a hyphen). That covers every city with no per-city table.

I rejected the default options:
- **"A crash counts as a death" in the stale test.** It would make the stale test pass on a broken route
  without proving the old way dies.
- **An alias table.** Someone would have to fill it for every rename.
- **Deleting TVM's entries from solutions.ts.** Those entries are still the live TVM routes on develop, and
  city/tvm isn't merged yet.

A city-owned key with no `xyz-` prefix still matches only itself, so nothing new can collide.

## What changed, per shared file

| file | change | why |
| --- | --- | --- |
| `tests/runner.ts` | adds `sameKind()`; `thingOf(w, kind)` matches with it | covers every `thingOf(w, 'snakeboat' / 'surfboard' / 'coracle' / 'stalactite')` call in solutions.ts and the frozen copy (31 calls) |
| `tests/solutions.ts` | 5 literal `e.kind === 'X'` checks become `sameKind(e.kind, 'X')`: HYD `cannonball` (L28), TVM `net` (`netNo`, L151), TVM `parunthu` (`hopAnyBird`, L166), KVT `tuna` (L538), CHN `ball` (L1581) | the TVM-02/06/08 closures, and the same pattern in four more cities |
| `tests/frozen/v0.16.13.ts` | the same 5 sites (L31, L147, L162, L541, L1562) | the stale test plays these TVM routes; after the rename `thingOf(w, 'snakeboat')` was undefined, so the route threw a TypeError at L504 instead of dying |
| `tests/west.ts` | DMN hazard cause `h.cause === 'moored'` (L256) becomes `sameKind(...)` | DMN act route |
| `tests/levels.test.ts` | the three NAIVE / FIX / MISTAKES cause checks compare with `sameKind(w.deathCause, cause)` | a renamed cause (`drenched` -> `tvm-drenched`) still counts as the expected death |
| `tests/endings.ts` | adds `policyFor(kind)`: `ENDING_POLICIES[kind]`, else the bare policy for a `xyz-` kind | ending policies are keyed by bare (unquoted) kinds; a renamed ending (`knock` -> `tvm-knock`) still finds its policy |
| `tests/chunks.ts` | the door-policy lookup uses `policyFor` | used by every long stage's route |
| `tests/modules.test.ts` | "has a policy for every ending" uses `policyFor` | the same lookup |

## City-owned literals left in shared tests, per city

I listed every city-owned key from the registry (165 ending, cause, thing and scene keys of the 15 shipped
modules) and grepped every quoted literal in tests/*.ts and tests/frozen/*.ts, after the change. Each hit is
now read through `sameKind`, `thingOf`, `policyFor` or the cause check, or is not a city lookup at all.

| city | hits | status |
| --- | --- | --- |
| TVM | solutions + frozen: `net`, `parunthu`, `snakeboat` x2, `drenched` (MISTAKES cause); endings.ts and runner.ts: `knock`, `net` (only in comments); allocation.test.ts: `knock` (self-test fixture) | matched / comment / fixture |
| KVT | solutions + frozen: `tuna` | matched |
| CHN | solutions + frozen: `ball` | matched |
| PDY | solutions + frozen: `surfboard` x20; chunks.ts and chunks.test.ts: `awning` | matched; `awning` there is the shared troll-section ChunkKind, not PDY's thing |
| BLR | solutions + frozen: `coracle` x3 | matched (thingOf) |
| AMR | solutions + frozen: `stalactite` x2 | matched (thingOf) |
| HYD | solutions + frozen: `cannonball` | matched |
| BOM | allocation.test.ts: `dahihandi` x2 | self-test fixture, not a lookup |
| DMN | west.ts: `moored` | matched |
| PNJ, GNR, JAI, BPL, RPR, RNC | none | |

The unquoted keys are the ending names used as object keys in `ENDING_POLICIES` (endings.ts, west.ts). They
go through `policyFor`.

## Dry-run merge: city/tvm into a scratch copy of develop

The scratch worktree was `/tmp/ldd-dry` on branch `tmp/dry-tvm`, both deleted afterwards. I merged
city/tvm **952b388** ("Merge develop into city/tvm"; it contains 2f8efb7) with no conflicts. In this copy
only:
- I applied the TVM worktree's uncommitted work (the `tvm-net` / `tvm-parunthu` / `tvm-snakeboat` rename in
  `things.ts` and `levels.ts`, and `tests/cities/tvm.ts`), because that is where the rename lives today.
- I removed `TVM: OLD,` from the `EXEMPT` list in `tests/modules.test.ts`.

| tree | result |
| --- | --- |
| before this change (develop 219e3b9 + city/tvm + WIP, OLD removed) | 1 failed, 1492 passed, 12 skipped: `tests/stale.test.ts > last version’s route dies > TVM-08: the v0.16.13 route`, a `TypeError: Cannot read properties of undefined (reading 'x')` at frozen/v0.16.13.ts:504 (`thingOf(w, 'snakeboat')`) |
| with this change (ea12cdf's diff applied) | `tsc` clean; **18 files passed, 12 skipped; 1493 passed, 0 failed, 12 skipped (1505)** |

Without the WIP (committed city/tvm only, TVM OLD removed), the one red line was
`modules.test.ts > TVM > prefixes its new keys with its code`. It expected `[]` and got
`['net', 'parunthu', 'snakeboat']`. That is the TVM worker's own rename, still uncommitted.

city/tvm and ldd-wt/tvm were not touched: the branch is still at 952b388, and the worker's uncommitted
files are as they were.

## Gates and CI on develop ea12cdf

| | result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npm test` | 18 files passed, 12 skipped; **1470 passed, 0 failed, 12 skipped (1482)**; frozen green |
| Android APK | completed, **success** (run 45911403438) |
| Test APK | completed, **success** (run 45911403339) |
| release `test` | "Test APK v0.16.14 (develop ea12cdf)", target ea12cdf907b5…; asset LevelDevilDad-v0.16.14.apk, 785014 B, updated 2026-11-26T23:31:34Z |

## Left

- A pass that renames a key the shared tests reach some other way would still trip. I found no such use:
  computed names, arrays of kinds passed to helpers, and string building all came up empty. A key added to
  a shared test later should go through `sameKind` / `thingOf` / `policyFor`.
- Once each city is merged and its own file owns its routes, the city's old entries in solutions.ts,
  west.ts, acts.ts and endings.ts can be deleted. That is not done here.
