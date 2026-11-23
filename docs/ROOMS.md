# The rooms game (v0.16 onwards)

The game is now **one-screen rooms**, wordless, in **doors** of five. Every door is a city, and in every
city **Dad is late for a ride**: the local train in Mumbai, an auto in Bengaluru, the metro in Delhi. The ride
is the exit. Each room looks like nothing (walk to the ride) and betrays you; the next try, you know.

The old long stages (112 of them, 14 capitals) are frozen: still in the code and tests, reachable only with
`?classic` in the URL. Their best ideas get recut as rooms later.

## The bar (every room, checked by `tests/rooms.test.ts`)

1. **The natural first try dies.** `natural`: hold right, jump what looks jumpable.
2. **The obvious fix dies too**, in at least half the rooms. `fix`: what a player tries after the first death
   (often the lesson of the room before). `fixWins: true` marks the rooms with a single trick.
3. **The solution clears.** `solution` is also the hint ghost the player sees after 5 deaths, so it must be the
   calm, human way through.
4. **Fair:** the solution clears in 90%+ of 200 runs with every input change up to 8 ticks (67 ms) early or late.
5. **Fast:** death to playing again is 0.3 s. Solved rooms run about 2 to 5 s; capstones a little longer.
6. **Deterministic:** no `Math.random`, no clocks in game code. The montage replays every try exactly.

## Physics (`ROOM_PHYS`)

A fixed-height jump: one tap is always the same jump, so traps can be measured to the pixel.

| | |
|---|---|
| run | 120 px/s (a tile in 0.13 s), full speed in 6 ticks, stops in 1 px |
| jump | rises 39 px, 0.54 s in the air, 67 px across at a run |
| forgiveness | coyote 83 ms, jump buffer 117 ms, 4 px ledge assist, 4 px corner correction |

Design rules that follow: a 2-tile wall clears and a 3-tile one never does; required gaps are 3 tiles at
most (230 ms of slack; 4 tiles is an expert jump); **a 1-tile gap can be walked** (Dad dips 3 px and steps
up), which DEL-1 uses. A trap that springs less than 30 px ahead of him can't be reacted to (a first-try
death); 45 px or more can.

## The frame

Rooms use the old 32 x 18 grid, but only columns 3 to 28 and rows 5 to 16 are on screen (`ROOM_FRAME`),
which fills a modern phone edge to edge with Dad about 28 px tall. The frame's sides are walls; dropping out
of its bottom is a death. The floor is row 14; Dad starts at column 4; rides sit around column 24 to 26.
The bottom corners hold the touch buttons, so they cover only ground: keep the action above row 14 there.

## Building a room

- Map: `rows(...)` takes the bottom rows (`#` ground, `a`-`z` slabs, `A`-`Z` hidden spikes, `%` solid tiles a
  prop draws, `@` Dad, `E` the ride).
- Kit (`src/rooms/kit.ts`): `dropNear` (falls as he comes near; can come back), `dropOnLanding`, `dropWhenIdle`,
  `wearsOut`, `collapseWave`, `sinkOnStand`, `onJump`, `onPass`, `hidden` spikes.
- Rides: `RideExit.at(w, 'train' | 'metro')`; the Bengaluru `auto()` drives, flees, follows and brakes by a
  per-room `brain` (`src/rooms/auto.ts`).
- Delhi machinery (`src/rooms/delhi.ts`): `walkway`, `fareGate`, `cardReader`; `ulta` swaps left and right
  (the touch arrows swap and glow orange while it lasts).
- Props (`src/rooms/props.ts`, drawn in `src/rooms/art/props.ts`): the weighing machine, the footbridge, cars,
  walkway, gates, reader.
- Art: one `Scene` per door (`src/rooms/art/mumbai.ts`, `bengaluru.ts`, `delhi.ts`): sky, far city with a
  landmark as a generic shape, a near layer, what's under the floor (seen through holes), a ground style,
  ambient life (a passing train, kites, leaves, rain). Dad is `src/rooms/art/dad.ts`, drawn to fit his box.

Tools: `node scripts/rshots.mjs 844 390 <dir> [ids | menus]` (every room at three moments and at its natural
death), `node scripts/rmontage.mjs <id>` (montage and result card), `node scripts/rhint.mjs <id>` (banner, hint
button, hint ghost). All need `npx vite build --mode single` first. To see a run tick by tick:
`LDD_ROOM=BLR-5 npx vitest run tests/room-trace.test.ts --silent=false`; to list the human-timing failures:
`LDD_ROOM=BLR-5 npx vitest run tests/room-human.test.ts --silent=false`.

## The pilot doors

### Mumbai: late for the local (the platform gives way)

| Room | Looks like | Betrays you | The way |
|---|---|---|---|
| 1 Mind the Gap | a flat platform | the floor drops as you come near; jump it and the far side breaks under your landing | wait at the edge: the gap closes again |
| 2 Rush Hour | the same platform | it collapses behind you as you run; the train's floor is a step up | keep running and jump into the train |
| 3 Weighing Machine | room 1 again | the floor wears out while you wait, and landing past the gap still breaks it | open the gap, go back up on the weighing machine you started on, wait |
| 4 Footbridge | a walk off the end of a footbridge | the platform below breaks when you land on it | stand still on the bridge's end: it sinks and sets you down |
| 5 Last Local | everything | collapse behind, a gap ahead, a floor that drops if you dawdle, the step-up train | stop on the one safe stone, wait, don't dawdle, jump in |

### Bengaluru: late for an auto (the ride has moods)

| Room | Looks like | Betrays you | The way |
|---|---|---|---|
| 1 Auto! | a parked auto | it pulls away as you come, and it was parked on a pothole; chase it and it reverses into you | wait at the pothole: it backs up to collect you |
| 2 No Meter | the same | walk up and it rolls away, then rams you; wait and it rams you | walk away: it follows and pulls up beside you |
| 3 Hail It | an auto doing rounds | it never stops and runs you over in the road | stay on the footpath and hop to hail it |
| 4 Hold Still | an auto coming at you | moving or hopping gets you hit | freeze in its path: it brakes an inch away |
| 5 Silk Board | parked cars, an auto, a pothole | it flees over the pothole; waiting gets you rammed | hop the cars, then walk away a few steps |

### Delhi: late for the metro (the station watches your buttons)

| Room | Looks like | Betrays you | The way |
|---|---|---|---|
| 1 No Jumping | a small gap | jump anywhere and the yellow line comes up as spikes | just walk it: a one-tile gap is walkable |
| 2 Walkway | a moving walkway | walk on it and it throws itself into reverse, into its comb plate | stand still and ride |
| 3 Ulta Pulta | two fare gates | past the first, left is right; past the second, it swaps back | watch the arrows, switch at each gate |
| 4 Tap Your Card | a closed glass gate | loitering in front of it brings up spikes | jump: you tap your card on the reader |
| 5 Rajiv Chowk | walkway, gates, reader | all of the above | stand, switch, tap, go |

## Next

- Hand the APK to 3-5 people who haven't seen it, explain nothing, watch where they quit.
- A 9:16 share clip of the montage ("Room 3: 7 tries").
- More doors (Kolkata, Chennai, Jaipur...), then the world as new chapters. A public name (not "Level Devil").
