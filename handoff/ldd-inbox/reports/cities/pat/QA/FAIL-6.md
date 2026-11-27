# PAT · Patna: checkpoint fix re-test (FIX-6): FAIL

Tested `city/pat` at **67fdc2b** (67fdc2b816a8f636f2a975124a1d036600eeca49) in my detached worktree `/local/home/saiposh/personal/ldd-wt/qa-pat`. Nothing was committed or pushed.

**Probe:** `tests/qa/qa6.test.ts` (untracked scratch in my worktree). It is a copy of `tests/fair.test.ts`'s `lagged()` human-timing player, instrumented to record every input it applies and the tick at which each checkpoint is actually taken.
- For each stage it plays the route at **lag 0, 6, 11 and 12** (idle start 0). For PAT-02 I also ran idle starts 37, 120 and 251.
- At every capture it rebuilds the world with `replay()` from the recorded inputs, sets `vx = 0`, and plays the cpsafe set for 4 s: idle, run 0.3 s after 0/6/12 ticks, and tap-jump after 0/6/12 ticks.
- Replay per tick is measured with the same player on every NAIVE, FIX and MISTAKE at lag 0, 6 and 12, from the last checkpoint taken to the death tick.

## Results per stage (lag-captured)

| Stage | Capture points | Plays | Deaths | Longest stretch | Worst replay (lag 0/6/12) |
| --- | --- | --- | --- | --- | --- |
| PAT-01 | 5 | 140 | 0 | 7.4 s | 5.72 s |
| **PAT-02** | 5 | 140 | **2** | 7.5 s | 7.06 s |
| PAT-03 | 4 | 112 | 0 | 10.4 s | 6.93 s |
| PAT-04 | 4 | 112 | 0 | 12.8 s | 7.26 s |
| PAT-05 | 6 | 168 | 0 | 17.2 s | 6.85 s |
| **PAT-06** | 14 | 392 | **6** | 15.1 s | 4.22 s |
| PAT-07 | 19 | 532 | **0** | 11.7 s | 6.98 s |
| PAT-08 | 3 | 84 | 0 | 3.3 s | 2.07 s |
| **PAT-09** | 9 | 252 | 0 | 23.2 s | **8.43 s** |
| PAT-10 | 15 | 420 | **0** | 11.6 s | 6.92 s |

The tempo stages (07, 10) are clean at every capture lag: the CHOWK halts and the moved checkpoints hold even when Dad is carried in late.

## Findings

### F6-1. PAT-02 cp3 (x90.0, the moved checkpoint) and cp4 (x117.5, the door checkpoint): idle dies when the checkpoint is taken at lag 12
- **cp3 x90.0**, taken at tick 2602 (lag 12, idle start 0). From the respawn, Dad stands at x89.7 and **idle 4 s -> `pat-angara`**: the first litti's poker strike lands on him.
- **cp4 x117.5**, taken at tick 3094 (lag 12). Dad stands at x117.2 and **idle 4 s -> `pat-doosra`**: the second litti's strike reaches the door checkpoint.
- **Reproduced at every idle start I tried:** cp3 at ticks 2639, 2722 and 2853, and cp4 at 3131, 3214 and 3345, for idle starts 37, 120 and 251. At lag 0, 6 and 11 both checkpoints are calm.
- **Why the shared test misses it:** a player who is 12 ticks slow reaches x90 later in the litti's cycle. The shared cpsafe captures only on the lag-0 route.
- **What would satisfy me:** both checkpoints calm for idle, run and tap-jump when taken at lags 0-12. For example, put cp3 where no strike reaches it within 4 s at any capture lag, and keep the door checkpoint out of the second litti's last strike.

### F6-2. PAT-06 cp5 (x112.0, `pat06-nau` cps 36): a 0.3 s run dies when the checkpoint is taken at lag 11 or 12
- Taken at tick 1530 (lag 11) or 1531 (lag 12), with Dad at x113.3. **Run 0.3 s, after 0, 6 or 12 ticks, -> `pat-jod`**: he runs into the tarp or gap ahead. Six deaths in all; idle and tap-jump survive.
- PAT-06 is not in the FIX-6 table and did not change in this round. This is an existing checkpoint that only fails under a lag-captured route, and the cpsafe bar applies to it all the same.
- **What would satisfy me:** cp5 moved back so that a 0.3 s run from it, taken at any lag 0-12, ends on deck and not over a missing plate.

### F6-3. PAT-09 replay over 7.5 s: "let the horse go and follow late" (`pat09-wapsi`)
- Replay from the last checkpoint to the death is **8.33 / 8.38 / 8.43 s at lag 0 / 6 / 12** (MISTAKE m1, `pat-bheed`). The bar is 7.5 s.
- PAT-09 was not changed in this round; this is the same `wapsi` stretch whose length I noted in earlier rounds. The longest stretch on 09 is 23.2 s (under 25 s).
- **What would satisfy me:** a calm checkpoint later in `wapsi`, so that the replay from it to the late-follow death is at most 7.5 s at every lag.

## Holds

- **FIX-6 table, lag-captured:** every listed checkpoint on PAT-01, 03, 04, 07 and 10 is calm at capture lags 0, 6, 11 and 12 for all seven plays. PAT-02's moved cp3 is the exception (F6-1).
- **Replay:** at most 7.5 s on every stage except 09 (F6-3). The builder's worst, PAT-04 at 7.11 s, measures **7.11 / 7.18 / 7.26 s** in my run, under the bar. The longest stretch anywhere is 23.2 s (09); for 07 and 10 it is 11.7 and 11.6 s.
- **Diff against 0.17.0 (`git diff 9d193f6 67fdc2b -- src/game/cities/pat`), and against 4c38bcb for the shared test:**
  - Checkpoint columns: s01 (90 dropped), s02 (18 -> 22), s03 (`patti` 5.5 added), s07 (sadak, pul, haat, mandi, adda), s10 (tempo).
  - Run-up and space columns: s03 ending `space` 26 -> 34; s04 `sidhi` stair +3 tiles; s10 `sidhi` stair +6 tiles.
  - PAT-07 halts: three CHOWK halts (`d: 0, hold: 500`) with signs, and `hold: 500` on two existing stops (sadak X46, mandi X82). The `hold` field was added to `tempo()`.
  - Shared: `tests/cpsafe.test.ts` has only `CPSAFE3_PENDING = []`.
  - Two trap timings also changed: PAT-03 `pat03-patti` bells 1.8/4.6/7.4 -> 1.8/4.4/6.8 s, and PAT-04 `pat04-sidhi` third porter emerges at 5.0 s (was 6.2). Both are disclosed in FIX-6. Neither changes the decision or a cause; both stages' NAIVE, FIX and MISTAKE plays still die to the same causes. I record this as a note, since the brief allows only checkpoint and space columns.
  - No hump, arch, truck or rider moved. No frozen file changed.
- **NAIVE, FIX and MISTAKE causes:** all unchanged on every stage. Ticks moved only where a route moved:
  - PAT-03 m0: 19.5 -> 18.9 s (bells).
  - PAT-04 m0 and m1: x44.3 -> x47.3 (the stair moved); route 37.8 -> **33.2 s**.
  - PAT-07 FIX and every MISTAKE: +4.4 to +14.0 s (the halts); route 130.8 -> **148.8 s**.
  - PAT-10 tempo and gaadi MISTAKEs: +0.6 to +0.7 s, 6 columns later; route 99.7 -> **100.4 s**.
  - PAT-03's route is unchanged at 26.6 s; FIX-6 says 28.8 s.
- **Regressions:**
  - `npm test`: 18 files, **1602 passed, 0 failed**. PAT is on no allow-list, and `CPSAFE3_PENDING` is empty.
  - `npm run build:single && node scripts/flows.mjs`: `no errors`.
  - `LDD_N=80 npm run fair -- PAT`: 100% at 6t and 12t on every stage except PAT-09 at 96% at 12t; PAT-09's door stretch is 96%. All at least 90.
  - Earlier rounds' acts (`bori`, `ginti`, `gaadi`, `roll`, `tempo`, `bhatti`, `patti`, `sidhi`) still die to their own causes.

## Note: the CHOWK halts on PAT-07 (judgement)
**What I saw:** the three halts are a CHOWK sign ("the light is red") on a pole while the tempo stands 4.1 s. On the builder's sheet nothing else happens: no signal head is drawn, no cross traffic passes, nobody gets on or off. A red-light wait at a Patna crossing is true to the city, and the halts do give a calm pocket before each hump. But what the player sees is a stopped vehicle and a small sign, which reads close to waiting for its own sake.

**Recommendation:** draw a signal head that goes red and then green, and let a cycle-rickshaw or two cross in front, so the 4 s has something to watch.

**Can a halt be shorter?** No, not while the checkpoint stays 2.3 tiles before the stop. Idle 4 s from a respawn must end inside the halt, so 500 ticks is about the minimum.

I keep it as a note, not a finding, because the sign gives the stop a reason in the city.

## Not checked
Touch on a phone, and audio. I made no new frames this round (no art changed except the CHOWK signs, seen on the builder's sheet).
