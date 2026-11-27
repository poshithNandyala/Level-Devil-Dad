# Integration L: Sri Vijaya Puram merged, v0.17.3

| | sha |
| --- | --- |
| origin/develop before (fetched 07:56 UTC) | f8288e9 (v0.17.2), unchanged since the conductor's read |
| city/svp merged | 3e6d9eb, which has f8288e9 as an ancestor |
| merge commit (`--no-ff`) | **db01f17f1143a6ca5b0a6694a4fd5a69d213f6c2** (db01f17) |
| bump "v0.17.3: Sri Vijaya Puram" | **412039fa0ee08704c437e81f3779b368bc6f87ae** (412039f): `package.json` and `src/config.ts`, as in 0.17.2 |
| develop head after (pushed `f8288e9..412039f`) | **412039f** |

## Diff (develop...city/svp)

38 files, no conflicts:
- `src/game/cities/svp/`: 35 new files: index, levels, lines, theme, look, music, skin, course, causes,
  things, endings, backdrop, entities, kit, doors, s01-s10, and the acts' own files (bus, choona, hauz,
  kadhai, khula, lehar, nali, rassi, uthao).
- `tests/cities/svp.ts`: new.
- `docs/cities/SVP.md`: new.
- `docs/CITIES.md`: modified, SVP's row only.

The registry finds the module by its folder, so no registration edit was needed. No shared file was
deleted or edited (`--diff-filter=D` and the staged merge's delete/modify list show only
`docs/CITIES.md`), and there was no engine change. Nothing needed restoring.

## Exemption lists

SVP was on none of them, so nothing had to be removed:
- `EXEMPT` in `tests/modules.test.ts` (the OLD list): no SVP entry.
- The cpsafe allow-list, which is read from `EXEMPT`: no SVP entry.
- `CPSAFE3_PENDING` in `tests/cpsafe.test.ts`: empty.

All ten SVP stages run the strict checks. The cpsafe titles read `SVP-0n: idle, run and tap-jump at lag 0/6/12`.

## Corrected in the merge (text only)

- `src/game/cities/svp/s10.ts`:
  - The tagline "Everything the island has, in the wrong order: the mill, the creek, the roots, the
    luggage. The fritter stall is on the way in." now reads "... the mill, the creek, the roots. The
    fritter stall is on the way in."
  - The line 2 comment "the croc board and its logs, the roots, the luggage hall." now reads "... the
    croc board and its logs, the roots."
- `docs/CITIES.md`:
  - SVP row: "built: city/svp, ten stages (docs/cities/SVP.md)" -> "done (10 stages, v0.17.3)".
  - Header: "16 done (130 stages), 20 to go" -> "**17 done (142 stages), 19 to go**". 142 is the live stage
    count: `levels.test -t builds` passed 142. The old header had missed TVM's two new stages from v0.17.1.

## Gates on the merge (before the push)

| check | result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npm test` | 18 files passed, 13 skipped; **1772 passed, 0 failed, 20 skipped (1792)**, the tester's 1772; frozen green |
| `npx vitest run tests/cpsafe.test.ts -t SVP` | **10 passed** (132 skipped by the filter), all strict; slowest SVP-10 at 1.35 s |
| `npm run build:single` + `node scripts/flows.mjs` | built; "no errors" |

Each heavy run was done alone, in the foreground.

## CI on 412039f (GitHub API, read 08:03 UTC)

| workflow | run id | result |
| --- | --- | --- |
| Android APK | **45962199463** ([link](https://github.com/poshithNandyala/Level-Devil-Dad/actions/runs/45962199463)) | completed, **success** |
| Test APK | **45962199566** ([link](https://github.com/poshithNandyala/Level-Devil-Dad/actions/runs/45962199566)) | completed, **success** |

Release `test`: "Test APK v0.17.3 (develop 412039f)", target 412039fa0ee0…; asset **LevelDevilDad-v0.17.3.apk,
850550 bytes**, updated 2026-11-27T07:59:12Z.
