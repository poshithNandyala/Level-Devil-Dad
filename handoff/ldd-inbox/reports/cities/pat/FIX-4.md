# PAT fix round 4

Branch `city/pat`, tip `1e29a849df34de4a301501bd8ea8ab1e2aaed5d6`. `origin/develop` (6172e21) merged with `git merge`. Own files only; no push, no version bump.

## Decision: `pat05-kuli` is cut, and I did not replace it

Why it goes: the tester is right. The player's decision in `kuli` ("something I cannot pass comes along a one-lane path; I step up aside, let it pass, and do not step down for the second one") is the decision PAT-04's Golghar porters already ask. The sinking floats only changed how the death looked. The lay-by, its sign, its checkpoint, the porters, `pat-kuli` and `pat-kuli2` are all removed (code, causes, tests, docs).

**Why there is no new act (honest stop).** I wrote candidate decisions in one sentence and checked each against the list of decisions the game already asks:
- "Stand on a loaded float on purpose, so that its weight sinks you under a low beam you cannot jump." The nearest shipped ideas are DMN-06's balance scale and being weighed, TVM-06's counterweight, and the family "a floor that gives way when you stop" (KVT-08, KVT-02). Making the player stop on a sinking float is that last family turned round, and I expect the tester to read it as the same decision. I could not make the second trap (the FIX) a different decision rather than a different timing of the same stop.
- "Be on the rising end of a tilting section": needs sloped-floor sliding that the engine does not have in my files.
- "Spread the load across two floats": reduces to "do not share a float with the load", which is the cart rule 05 already teaches in its first three decks.

None of the three gives a NAIVE and a FIX that die to different traps through a decision that is new to the game, and a rushed act would repeat the round-3 failure. So 05 stays at its honest length.

## 05 time before / after

| | Round 3 | Now |
| --- | --- | --- |
| 05 route | 70.6 s | **52.9 s** (floor 60 not met) |

Parts: room 7.3, ghat 4.8, sangam 17.2, bori plus door 23.6. 06 (61.1 s) and 10 (99.7 s) are unchanged. 05's par is 62.
Reason it is under the floor: every act that reached 60 s on 05 (`bori` repeats in round 1, `khokhla` in round 2, `kuli` in round 3) repeated a shipped decision. 05's own rules are the cart on the deck (room, ghat, sangam: one rule at three lengths and speeds) and the sack that slides (`bori`). The next honest length for 05 is this one; the gap to 60 s is about 7 s.

**Identical windows in 05:** none repeated. The cart rule appears on three decks of different length and cart speed (a ladder, not a repeated window); `bori` has two different windows (a plain drop, then a sack that slides). Checkpoints: 7.3, 12.1, 29.4, 35.2, 42.1, 44.9 s; longest stretch 17.3 s (the sangam deck, unchanged since round 1, under the 25 s rule). The `bori` checkpoints are unchanged, so the earlier cpsafe result for them stands.

## Proofs

- `tsc --noEmit`: clean.
- Full `npm test` (PAT on no allow-list, including `cpsafe`): 18 files passed, **1603 tests passed**, 0 failed, 11 env-gated files skipped (two fewer tests than round 3: the two `kuli` mistakes are gone).
- After `npm run build:single`, `node scripts/flows.mjs`: last lines `BLR-04` / **`no errors`**.
- Fairness, `LDD_N=80 npm run fair -- PAT` (every stage >= 90%, every stretch >= 95%; PAT-09's door is the lowest at 96%):

```
PAT-01: 6t 100%  12t 100%  18t 80%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  door 100%
PAT-02: 6t 100%  12t 100%  18t 83%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  door 100%
PAT-03: 6t 100%  12t 100%  18t 76%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  door 100%
PAT-04: 6t 100%  12t 100%  18t 100%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  door 100%
PAT-05: 6t 100%  12t 100%  18t 100%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  door 100%
PAT-06: 6t 100%  12t 100%  18t 100%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  s6 100%  s7 100%  s8 100%  s9 100%  s10 100%  s11 100%  s12 100%  s13 100%  door 100%
PAT-07: 6t 100%  12t 100%  18t 100%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  s6 100%  s7 100%  s8 100%  s9 100%  s10 100%  s11 100%  s12 100%  s13 100%  s14 100%  s15 100%  door 100%
PAT-08: 6t 100%  12t 100%  18t 76%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  door 100%
PAT-09: 6t 100%  12t 96%  18t 95%   died: pat-charkhi @236 x2, died: pat-charkhi @235 x1
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  s6 100%  s7 100%  s8 100%  door 96%
PAT-10: 6t 100%  12t 100%  18t 100%   
  stretches at 0-12t (bar 95% each): s0 100%  s1 100%  s2 100%  s3 100%  s4 100%  s5 100%  s6 100%  s7 100%  s8 100%  s9 100%  s10 100%  s11 100%  s12 100%  s13 100%  s14 100%  door 100%
```

- cause@tick line for the new act: there is no new act.
- Sheet read: `/local/home/saiposh/personal/ldd-inbox/reports/cities/pat/shots/PAT-05-sheet.png` (room, ghat, sangam, the bori deck with the sack, the door; no lay-by).

## Not done

- No new act on 05; the stage is about 7 s under its floor. If the conductor wants the floor held, the only candidate I would build is the "sink yourself under a low beam" act, with the risk stated above.
