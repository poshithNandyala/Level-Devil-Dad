# PAT fix round 5

Branch `city/pat`, tip `c5e49508945b135866873393fc97c360990fdc87`. Own files plus the one MECHANICS.md line naming a cut act. No push, no version bump. No new commits on `origin/develop` since the last merge.

## The cut

PAT-01's falling coaching hoarding is removed entirely: `hoarding()` and its call in `s01.ts`, the `pat-hoarding` cause and line, the route steps that waited for and hopped it, its MISTAKE ("run on at the hoarding"), and every doc line (PAT.md row 01, MECHANICS.md 01 line, the tour's hint text). No replacement beat. 01 keeps the crowd surge (NAIVE `pat-bheed`) and the tempo pull-out (FIX `pat-tempo`), the two bites the bible asks of a stage 01.

## Doc lines

- `docs/cities/PAT.md`: "05 runs about 45 s" now reads 52.9 s.
- `docs/MECHANICS.md`: `pat06-kumhrar` removed from the act list.

## 01 route time

| | Before | After |
| --- | --- | --- |
| PAT-01 route | 15.4 s | **14.8 s** (ruled: stays short, tour is outside my files) |

Checkpoint changes on the route: 1.9, 3.8, 5.5, 6.5, 12.6, 13.7 s.

## Proofs

- `tsc --noEmit`: clean.
- Full `npm test` (PAT on no allow-list, including `cpsafe`): 18 files passed, **1602 tests passed**, 0 failed, 11 env-gated files skipped (one fewer than round 4: the hoarding MISTAKE is gone).
- After `npm run build:single`, `node scripts/flows.mjs`: last lines `BLR-04` / **`no errors`**.
- Fairness, `LDD_N=80 npm run fair -- PAT` (PAT-01: 6t 100%, 12t 100%, 18t 80%, every stretch 100%; PAT-09's door is the lowest at 96%):

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

- Sheet read: `/local/home/saiposh/personal/ldd-inbox/reports/cities/pat/shots/PAT-01-sheet.png` (11 frames: the tour, the kerb board, the crowd at the tempo, the road after it, the door; no hoarding).

## Not done

Nothing else touched. 02-10 are unchanged since round 4.
