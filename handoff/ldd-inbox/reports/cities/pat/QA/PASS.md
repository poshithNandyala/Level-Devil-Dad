# PAT · Patna: independent QA: PASS (round 5)

Tested `city/pat` at **c5e4950** (c5e49508945b135866873393fc97c360990fdc87) in my detached worktree `/local/home/saiposh/personal/ldd-wt/qa-pat`. Nothing was committed. The history is `QA/FAIL-1.md` through `QA/FAIL-4.md`, and every finding in them is now closed. Probes are my untracked scratch files in `tests/qa/` (`qa-probe`, `qa-split`, `qa-rec`, `qa-kuli`, `qa-rec01`), plus `scripts/solshot.mjs` frames at phone viewport (844x390).

## What I ran at this tip

| Check | Result |
| --- | --- |
| `git diff --stat 1e29a84 c5e4950` | 5 files: `docs/MECHANICS.md`, `docs/cities/PAT.md`, `src/game/cities/pat/causes.ts`, `src/game/cities/pat/s01.ts`, `tests/cities/pat.ts`. +6 / -52 lines, and the whole diff is the hoarding cut and the two doc lines. **Nothing else moved** |
| `npx tsc --noEmit` | clean |
| `npm test` (full, once) | **18 files, 1602 passed, 0 failed** (15 skipped: 11 env-gated tools and my env-gated probes). PAT is on no allow-list (`EXEMPT` in `tests/modules.test.ts` has no PAT row) |
| `npm run build:single && node scripts/flows.mjs` | **`no errors`** |
| `LDD_N=80 npm run fair -- PAT` | every stage 100% at 12t except PAT-09 at 96%. Every stretch 100% except PAT-09's door at 96% (bars: 90% stage, 95% stretch). **Holds** |

```
PAT-01: 6t 100%  12t 100%  18t 80%
PAT-02: 6t 100%  12t 100%  18t 83%
PAT-03: 6t 100%  12t 100%  18t 76%
PAT-04: 6t 100%  12t 100%  18t 100%
PAT-05: 6t 100%  12t 100%  18t 100%
PAT-06: 6t 100%  12t 100%  18t 100%
PAT-07: 6t 100%  12t 100%  18t 100%
PAT-08: 6t 100%  12t 100%  18t 76%
PAT-09: 6t 100%  12t 96%  18t 95%   died: pat-charkhi @236 x2, @235 x1   (door stretch 96%)
PAT-10: 6t 100%  12t 100%  18t 100%
```

## R4-1 (PAT-01's falling hoarding): CLOSED

- The diff removes `hoarding()` and its call, the `pat-hoarding` cause and line, the hint sentence, the route steps that waited for it, and its MISTAKE. A grep for `pat-hoarding`, `function hoarding` and `pat1h` over `src`, `tests` and `docs` finds nothing.
- Played 01: the route wins at **14.8 s**. NAIVE dies to `pat-bheed` @8.4 s (swept by the surge) and FIX to `pat-tempo` @12.1 s (the tempo pulls out). These are **two betrayals**, as TROLL-BIBLE section E asks for stage 01. A frame at 14.2 s shows the road clear from the deck to the exit door, with no board (`shots/sol-PAT-01-1700.png` in my worktree).
- Its length is under the conductor's ruling (shared tour course), so it is not a finding.

## Earlier closes: all still hold (re-measured)

- **B1:** 02, 03 and 04 take 25.9, 26.6 and 37.8 s, by new acts.
- **B2:** no window is repeated beyond one momentum beat on 05, 06 or 10.
- **B3:** every act's NAIVE and FIX differ in cause and tick. The stage-level pairs are: 02 `pat-angara` / `pat-chimta`, 05 `pat-ganga` / `pat-pipa`, 06 `pat-jod` / `pat-ginti`, 07 `pat-torana` / `pat-dhakka`, 09 `pat-bheed` / `pat-jhoola`, and 10 `pat-jod` / `pat-bhaar`. All act pairs are unchanged from the round-4 table.
- **B4:** no Kumhrar act, and MECHANICS.md no longer lists it.
- **B5:** no hop-flip plate. The tarp-by-sack-count on 06 and 10 is unchanged.
- **B6:** the longest stretch is 23.1 s on 09 and 11.5 s on 10.
- **Round 2-4 items:** the 03 roll is in the banner's colour, `Ruko!`, the rope and red landing bar, the `pat-bori` and `pat-bhaar` lines, the lorry, `lives: 'act'` on 05, 06, 07, 09 and 10, and no `kuli`, `khokhla` or `lay-by` remains.

## Accepted honest numbers

| Stage | Route | Bar | Why accepted |
| --- | --- | --- | --- |
| **05** | **52.9 s** | 60 s | Every act that reached 60 s repeated a shipped decision: repeats, then `khokhla`, then `kuli`. The stage is a whole long stage: the cart rule is taught on three decks and turned by `bori`'s sliding sack, with no repeated window. A real first clear is well over 60 s. **Accepted as an honest number** (round 4) |
| 01 | 14.8 s | 25-35 s | conductor's ruling (shared tour course) |
| 07 | 130.8 s | marathon | conductor's ruling (bible 2-3 min) |
| 08 | 9.9 s | short by design | the warps skip the walking |
| 06 | 61.1 s | 60 s | met on the scripted route. A sharp human might finish just under 60, because the waits carry about 1 s of slack each |

Other route times: 02 25.9, 03 26.6, 04 37.8, 09 73.6 and 10 99.7 s.

## Polish (none blocking)

1. Stage-level NAIVE and FIX on 03 (`pat-jam`) and 04 (`pat-bojh`) share a cause. Each is a valid stale-rule or second-porter ladder, and both stages' new acts carry distinct A2s. Own cause lines would read better.
2. PAT-08's FIX dies to the same `pat-kua` as NAIVE. That is acceptable for the one HWIK stage: the tell (bricks over every hatch) exists, and 09 is not a second WTF.
3. Some stretches still take more than 8 s to replay (05 sangam 17.3 s, 09 wapsi 23.1 s). All are under the 25 s module rule.
4. PAT-09's door (turnstile) is the lowest fairness number at 96%.
5. The finale calls back the Setu, pontoon, Golghar, hoardings and tempo, as the allocation asked. The litti, Nalanda, Sonepur and bus-crowd ideas are not in it.
6. The sliding sack is accepted as distinct from TVM-10 F137 (the rope endpoint is the tell, and the floor sinks).
7. Lines: `Setu one, Dad zero!` has no "Local | English" form. `Ulta-pulta ho gaya!` is Hindi rather than Bhojpuri.
8. For the conductor, not PAT: LKO's `lko07-saamne` and `lko02-dakiya` ask "step up aside and let it pass under you", which is close to PAT-01's kerb board, and LKO asks it twice within its own city. LKO's QA should weigh it.

## Not checked
Touch feel on a real phone, and audio. Art was judged from my own phone-size frames for 01, 03, 05, 06, 08 and 10 over the rounds, and from the builder's sheets for the rest.
