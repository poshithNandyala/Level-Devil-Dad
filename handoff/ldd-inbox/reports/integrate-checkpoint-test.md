# Integration G: the checkpoint tests no longer cap checkpoints

**develop: 6172e21** (6172e21e7753cec7ae8eee094106bad2c896948b), one commit on ea12cdf, pushed once
(`ea12cdf..6172e21`). Only `tests/checkpoints.test.ts`, `tests/cpsafe.test.ts` and `docs/CITY-MODULE.md`
changed. No city folder, no gameplay, no version bump.

## The change

**`tests/checkpoints.test.ts`**:
- **Before:** for every checkpoint it built two worlds from tick 0, one stepped by hand and one through
  `replay()`, and compared them. The cost was checkpoints x route length x 2, under vitest's default 5 s
  per-test limit.
- **Now:** one pass. World `a` steps the route's inputs as the game does. World `b` steps the same inputs
  the way `replay()` steps them, dropping events each tick. Their snapshots (tick, player position and
  speed, every solid, entity count, state) are compared at every checkpoint tick.
- **What it still proves:** the route passes every checkpoint, and the world rebuilt from the inputs is
  exact at each one.
- **`replay()` itself** is then called once, to the last checkpoint, and must match a fresh stepped world,
  so a change inside `replay()` can't slip past.
- **Cost:** about 4 x route length, whatever the checkpoint count.
- **Timeout:** an explicit 60 s, as a safety net only.

**`tests/cpsafe.test.ts`**:
- Each checkpoint is still probed from `replay()`, because that is what a real respawn does. Its cost
  therefore still grows with checkpoints x route length, and that is accepted.
- It now has an explicit **120 s** timeout per stage, with a comment saying no test limit may decide how
  far a player replays.

**The other files**, read and left as they are:
- `tests/cpcount.test.ts` and `tests/cpfind.test.ts` are tool tests behind env vars (`LDD_CPCOUNT`,
  `LDD_LEVEL`). They have no per-checkpoint cost and no cap.
- `tests/lives.test.ts` uses a fixed 3-checkpoint test stage and is not route-dependent.
- `tests/fair.test.ts` already has a 1 800 s timeout. Its per-step cap is `(s.max ?? 3000) + lag + 240`
  ticks, per route step, not per checkpoint.

## Checkpoint caps found

**No explicit checkpoint-count cap exists** in src or tests. I grepped for `checkpoints.length` compared
with a number, `saves.length`, `MAX`, and caps in session.ts, world.ts and replay.ts; none matched. The only
effective cap was the one Bhubaneswar hit: vitest's **default 5 s per-test timeout** on
`checkpoints.test.ts`, whose cost grew with checkpoints x route length. Both checkpoint tests now set
explicit timeouts (60 s and 120 s), and the replay-exactness test no longer grows with the checkpoint
count.

Related, but not a checkpoint cap: in `tests/runner.ts`, `play()` defaults each route step to `max` 3000
ticks (25 s), and the fair model to `max` + lag + 240. A single route step longer than 25 s needs its own
`max`, as today. A whole route has no length cap.

## Times (verbose reporter)

**develop** (the 15 shipped cities, `tests/checkpoints.test.ts` + `tests/cpsafe.test.ts`, 240 tests):

| | before (ea12cdf) | after (6172e21) |
| --- | --- | --- |
| both files, wall | 12.80 s | 8.10 s |
| slowest checkpoints test | RPR-04, 3 cps: 1971 ms | RPR-04: 1383 ms |
| slowest cpsafe test | RPR-04: 1765 ms | RPR-04: 1070 ms |

**City branches.** Each was run in a read-only throwaway worktree (`git worktree add --detach` at the
branch tip, my two test files copied in, then deleted; nothing committed). All 130 tests passed in each
file, before and after.

| branch tip | stage (cps) | checkpoints before | checkpoints after | cpsafe before | cpsafe after |
| --- | --- | --- | --- | --- | --- |
| city/bbi 360bbe9 | BBI-10 (11) | 2331 ms | **825 ms** | 1478 ms | 1387 ms |
| city/ccu 21c62bc | CCU-07 (11) | 956 ms | **303 ms** | 492 ms | 670 ms |
| city/dis 59011a9 | DIS-07 (14) | 271 ms | 105 ms | 159 ms | 202 ms |
| city/dis 59011a9 | DIS-08 (8) | 265 ms | 143 ms | 173 ms | 262 ms |

The slowest test after the change is BBI-10's cpsafe at 1387 ms, and the slowest checkpoints test is
BBI-10's at 825 ms. Estimate only (not run): BBI-10's marathon at 23 checkpoints would put cpsafe near
3 s, far below its 120 s timeout. The checkpoints test stays near 0.8 s whatever the count. The cpsafe
"after" times that went up (CCU-07, DIS) are run-to-run noise on a shared host; the code there did not
change.

## docs/CITY-MODULE.md

The old line "Marathon: at most 120 s once known. Long: 60-80 s." contradicted the floors builders work
to. In "Long and marathon stages" it is replaced by one rule:
- **Length** (the scripted route's time): 02-04 take 25-45 s; 05, 06, 08 and 09 at least 60 s; 07 at least
  120 s; 10 at least 90 s.
- **Checkpoints:** a calm checkpoint every 25-30 s, and no stretch over 25 s. Replay to a trap at most 8 s
  at lag 0, 6 and 12. No checkpoint within 3.5 tiles past a trigger, and each is reached only after the
  previous hazard has run out at lag 12. Every checkpoint survives idle, run-then-idle and
  tap-jump-then-idle. As many checkpoints as needed: the tests have no count limit.
- **Per act:** the FIX death differs from the NAIVE death in cause and tick, and no window is identical
  past one momentum beat.
- **Fairness:** 90% average-timing per stage and 95% per stretch, with `npm run fair -- <CODE>`.

The Lives and Hint parts bullets are unchanged.

## Gates on 6172e21

| gate | result |
| --- | --- |
| `npm run typecheck` | clean |
| `npm test` | 18 files passed, 12 skipped; **1470 passed, 0 failed, 12 skipped (1482)** |
| `npm run build:single` + `node scripts/flows.mjs` | ok, "no errors" |

## CI on 6172e21 (GitHub API)

| workflow | result |
| --- | --- |
| Android APK | completed, **success**: [run 45921930362](https://github.com/poshithNandyala/Level-Devil-Dad/actions/runs/45921930362) |
| Test APK | completed, **success**: [run 45921930419](https://github.com/poshithNandyala/Level-Devil-Dad/actions/runs/45921930419) |
| release `test` | "Test APK v0.16.14 (develop 6172e21)", target 6172e21e…; asset LevelDevilDad-v0.16.14.apk, 785014 B, updated 2026-11-27T01:20:20Z |
