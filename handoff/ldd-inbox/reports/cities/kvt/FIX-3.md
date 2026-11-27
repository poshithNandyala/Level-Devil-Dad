# KVT round 3 (short): F497 `place-the-heap-for-the-way-back`, decision gate: struck, not built

Branch `city/kvt`, tip **dbbc2ce**, unchanged this round. I committed nothing, refroze nothing, and changed no
file in the repo. `origin/develop` is still f8288e9 and is already merged.

## The gate: decision first, then the registry

**F497 as v3 states it** (ALLOCATION.md, KVT block, line 703): "The route doubles back along the crest, and
every heap you slide stays where it went: on the way out, slide each heap on purpose to where you will need it
on the way back; a heap slid off the crest is gone."

**What the engine lets a KVT heap do.** This sets the only buildable form. A storm-bank heap (`Heap` in
`kvt/encores.ts`, and `RubbleBank`) moves only when Dad lands on it. It then slides one tile, and Dad slides
with it (`p.isRiding(heap.solid)`).

- Nothing in KVT pushes a heap from beside it or leaves it moving on its own, so a heap goes exactly where Dad
  rides it.
- "Slide it on the way out to where you need it on the way back" therefore means: ride it to a spot, hop off,
  and later stand on it or climb from it.
- Every layout I tried converges on the same play, because the heap's use comes as soon as it is placed:
  - out right along the crest, then back left, then up on a higher path;
  - out along the top, back along the lagoon-side path under it, through a hole the heap must fill;
  - out right to the heap, then ride it back to the foot of an overhead gap and climb from it.
- The other two options each need something KVT does not have:
  - A heap that serves a different path later needs the heap to move without Dad on it, which is a push.
  - The persisting state across a return leg is the same heap on the same crest.

**One-sentence decision of the buildable form:** "Ride the heap along the crest, one landing a tile, exactly to
the foot of the gap in the path above, and climb from it; one landing too many and it drops into the cleft with
you."

**Registry check (DECISIONS.md lists 1-2):**

| Row | Its decision | Same as F497's buildable form? |
| --- | --- | --- |
| `khisko` (RPR-04 door, shipped) | "Push the crate along the floor ... Push it right up to the wall, climb on the crate, pull the cord" | **Yes.** Bring a block to the wall and climb it. Only the way of moving the block differs (landings instead of a push). The decision the player makes is the same. |
| `bbi-curl-stair` (BBI-04 door, in-flight) | "The wall your standing builds is the stair to the door: stand on purpose" | Close (make your own step), but its step appears where you stand. The v3 text names it as the row to differ from. |
| `kvt09-ozhukku` (F496, this city) | "Land short and let the slide carry you under the lip" | No. That decision moves Dad, not a heap, and nothing persists. |
| `LKO-05` / `lko05-*` (heaps you squash) | keep your heap full; squash to clear a rack | No. Those heaps change height under you; they are not moved to a place. |

**Result: struck, matching `khisko` (RPR-04, shipped).** Per the DECISIONS rule, a struck decision is reported
with its row id and not built. The v3 form that would differ (place now, use from another path later) needs a
heap that moves without its rider. That is a push, which is `khisko`'s verb again, or a new engine verb.

## KVT-09 after this round

Unchanged from FIX-2 at dbbc2ce. These are FIX-2's numbers, not re-run this round:

| Item | Value |
| --- | --- |
| Route time | **42.6 s** (5116 ticks), against the v3 estimate of about 63 s; F497's estimated 12 s is not added |
| Lag-captured sweep (09) | 2304 checks, 0 route fails, 0 deaths for idle / run 0.3 s / tap-jump |
| `worst` (09, step 6) | 5.88 / 7.08 / 7.71 / 7.88 s at lag 0 / 6 / 11 / 12. The maximum is the spawn stretch, which includes the probe's spawn idle; every stretch after the spawn is 5.73 / 5.93 / 6.28 / 6.34 s |
| Fair, `LDD_N=80` | 100 / 100 / 83, all 12 stretches and the door 100 |
| cpsafe `-t KVT` | 10 passed |
| Full suite | 1698 passed |
| Frozen | no change this round |
| Sheet | `shots/KVT-09-sheet.png`, read in FIX-2 |

The brief's per-tick `worst` run, sweep, fair, cpsafe, full suite, refreeze and re-shot sheet apply to a
changed KVT-09. With F497 struck, no file changed, so I did not repeat those heavy runs on the shared host.

## Still short

KVT-09 is **42.6 s against the 60 s floor**. The v3 block allocated two acts to close it. F496 is built (about
6 s, not the 14 s estimated). F497 is struck against `khisko`. Closing the remaining 17 s needs a new
allocation, an act whose decision clears the registry. I am not inventing one here.

## Proofs this round

- No code change: `git status` is clean at dbbc2ce, and `git log -1` is dbbc2ce.
- Engine fact behind the gate: `Heap.update` slides `this.solid` only after `p.onGround && !this.was &&
  p.isRiding(this.solid)`, that is, on Dad's landing on it, carrying him. `RubbleBank` slides Dad himself.
  Neither has a push.
- Registry rows quoted from `/local/home/saiposh/personal/ldd-inbox/docs/DECISIONS.md`:
  - `khisko`: line 335.
  - `bbi-curl-stair`: line 766.
