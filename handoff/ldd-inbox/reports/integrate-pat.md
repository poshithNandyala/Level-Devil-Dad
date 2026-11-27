# Integration H: Patna merged, v0.17.0

**develop: 9d193f6** (9d193f6a3a9ce9efbfced8c5cee4f39713d93337), pushed once (`6172e21..9d193f6`).

| commit | sha | what |
| --- | --- | --- |
| merge | **c670701** | `git merge --no-ff city/pat` at c5e49508945b135866873393fc97c360990fdc87 (34 commits), plus the doc lines below |
| bump | **9d193f6** | v0.17.0: `package.json` and `src/config.ts` (the two files every earlier bump touched; the APK name and the share text read the version from these), and a v0.17.0 section in `docs/WAVE1.md` |

Before the merge: `git fetch`, origin/develop = 6172e21, as expected.

## Conflicts

**None.** `git merge-tree` and the merge itself were clean.

Outside Patna's own paths, the branch touched two files:
- **`docs/MECHANICS.md`**: +38 lines, Patna's ideas. Merged as is.
- **`tests/dbg2.test.ts` deleted.** This is the shared, always-skipped scratch file (HANDOFF section 6
  names it). It was deleted in bc43e04, "Patna: fix round 1". A builder may not remove a shared file, so
  I kept develop's copy in the merge commit (`git checkout develop -- tests/dbg2.test.ts`). It is not city
  code and not gameplay, and the skip count stays at 12.

Doc lines in the merge commit:
- `docs/CITIES.md`:
  - PAT row: "built (city/pat)" -> "done (10 stages, v0.17.0)".
  - Header: "16 done (130 stages), 20 to go".
  - The 8-stage sentence now names the 15 older cities.
- `docs/cities/PAT.md`, under the header: "**Status:** passed independent QA at c5e4950
  (reports/cities/pat/QA/PASS.md, after FAIL-1..4), with PAT-05 at an accepted honest 52.9 s; merged into
  develop for v0.17.0."

## Verification on the merged tree

| check | result |
| --- | --- |
| `npm run typecheck` | clean |
| `npm test` (merge c670701, and again on 9d193f6) | 18 files passed, 12 skipped; **1602 passed, 0 failed, 12 skipped (1614)** (develop before: 1470 / 12; +132 from Patna) |
| Patna on no allow-list | `EXEMPT` in tests/modules.test.ts has no PAT entry. `modules.test.ts` 179 tests, `allocation.test.ts` 10 tests (meta, ending and act-id uniqueness): all green |
| frozen-behaviour snapshot | green (136 tests), not refrozen |
| `npm run build:single` + `node scripts/flows.mjs` | ok, "no errors" |
| home-city picker | `scripts/uishots-r2.mjs` (shots in `ldd-inbox/reports/integrate-pat-shots/`): "picker: screen home, 36 rows, **16 ready, 20 coming soon**" at 780x360 and 844x390. It was 15 ready before, so Patna is listed as built. The PAT "coming soon" postcard is gone ("PAT postcard: none") |

## CI on 9d193f6 (GitHub API)

| workflow | result |
| --- | --- |
| Android APK | completed, **success**: [run 45925216409](https://github.com/poshithNandyala/Level-Devil-Dad/actions/runs/45925216409) |
| Test APK | completed, **success**: [run 45925216391](https://github.com/poshithNandyala/Level-Devil-Dad/actions/runs/45925216391) |

Release `test`: **"Test APK v0.17.0 (develop 9d193f6)"**, target 9d193f6a3a9ce9efbfced8c5cee4f39713d93337, body
"Sideload build of 9d193f6...". Asset **LevelDevilDad-v0.17.0.apk**, 809590 bytes (was 785014), updated
2026-11-27T01:54:53Z.

## Worth knowing

- **Builder rule slip:** the PAT builder deleted `tests/dbg2.test.ts`, a shared file. I restored it. Other
  builders may have done the same; I'll check each branch at merge time.
- **uishots PAT postcard check:** `scripts/uishots-r2.mjs` checks PAT as its example "coming soon" home city.
  Now that Patna is built, it prints "PAT postcard: none". That is correct for a built city, but the script
  no longer exercises the coming-soon postcard. It needs an unbuilt city instead (UI-owned script, not
  changed here).
- **Doc drift:** docs/HANDOFF.md still says "1316 tests" in its setup line, and its status line says v0.16.14.
- **No flaky test:** both full runs gave the same 1602 / 12.
