# Integration J: Thiruvananthapuram merged, v0.17.1

| | sha |
| --- | --- |
| develop before (live after `git fetch`) | **4c38bcb** |
| city/tvm merged | 2e7eba9, which has develop 4c38bcb as an ancestor (`git merge-base --is-ancestor` ok) |
| merge commit (`--no-ff`) | **80b4a70** |
| version bump 0.17.0 -> 0.17.1 | **d398868** |
| develop after (pushed `4c38bcb..d398868`) | **d398868** (d398868f505b1b12bbd6ad286d23060df5dd67d3) |

## The two exemption removals

Both are one line, removed in the merge commit 80b4a70: `TVM: OLD,` deleted from `EXEMPT` in
`tests/modules.test.ts`.
- **OLD list:** TVM now gets every modules-test check: 10 stages, intros, prefixed keys, a fair list.
- **cpsafe allow-list:** `tests/cpsafe.test.ts` reads its allow-list from that same `EXEMPT` block (one
  list, by design in Integration I). So TVM is off it too and gets the three plays at lag 0/6/12. Nothing
  in cpsafe.test.ts needed editing.

## Shared-file check (branch diff against develop)

`git diff --name-only develop...city/tvm` (15 files) has nothing outside TVM's own files, docs/cities/TVM.md,
docs/CITIES.md and the frozen snapshot `tests/cities/_frozen/tvm.json`, except one finding:

- **Finding: `tests/cities/tvm/probe.test.ts`** (new, 389 lines). It is TVM's own replay and checkpoint-calm
  probe, behind `LDD_TVMPROBE=1`, and lives in a TVM-only folder. It edits no shared file. I merged it as
  TVM's own file.
  - The test glob `tests/**/*.test.ts` picks it up as a file of 8 skipped tests, which is why the skipped
    counts went from 12 files / 12 tests to 13 files / 20 tests.
  - `tests/city-tests.ts` globs `./cities/*.ts` only, so it is not read as a city test module.
  - If env-gated city probes should not live in the shared test tree, the rule should say so for the next
    builders.

There were no merge conflicts.

## Gates on the merge (80b4a70; typecheck rerun on d398868)

| check | result |
| --- | --- |
| `npm run typecheck` | clean (both commits) |
| `npm test` | 18 files passed, 13 skipped; **1640 passed, 0 failed, 20 skipped (1660)**: the tester's 1640, frozen green |
| `npx vitest run tests/cpsafe.test.ts -t TVM` (TVM off the allow-list) | **10 passed**, every title `TVM-0n: idle, run and tap-jump at lag 0/6/12`; slowest TVM-10 at 3.0 s |
| `npm run build:single` + `node scripts/flows.mjs` | ok, "no errors" |

The bump commit d398868 also adds a v0.17.1 section to `docs/WAVE1.md` (package.json and src/config.ts as in
v0.17.0).

## CI on d398868 (GitHub API, read live)

| workflow | result |
| --- | --- |
| Android APK | completed, **success**: [run 45941586443](https://github.com/poshithNandyala/Level-Devil-Dad/actions/runs/45941586443) |
| Test APK | completed, **success**: [run 45941586371](https://github.com/poshithNandyala/Level-Devil-Dad/actions/runs/45941586371) |

Release `test`: "Test APK v0.17.1 (develop d398868)", target d398868f505b…; asset **LevelDevilDad-v0.17.1.apk**,
**817782 bytes**, updated 2026-11-27T04:43:48Z.
