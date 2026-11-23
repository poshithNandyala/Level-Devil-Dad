# AGENTS.md: rules for anyone (any AI) working on Level Devil Dad

Level Devil Dad (working title; the public name is still to be chosen and must not be "Level Devil") is a
troll platformer for Android and iPhone (TypeScript, Canvas 2D, Capacitor). Since v0.16 it is a game of
**one-screen, wordless rooms in doors of five**. Every door is a city where **Dad is late for a ride** (a
local train, an auto, the metro) and the ride is the exit. Mumbai, Bengaluru and Delhi are the pilot. The
112 old long stages are frozen (`?classic`); don't build on them.

Read before you touch anything:
1. `docs/ROOMS.md`: the format, the bar, the physics numbers, how a room is built, every room so far.
2. The pilot doors as templates: `src/rooms/doors/mumbai.ts`, `bengaluru.ts`, `delhi.ts`, and their art in
   `src/rooms/art/`.
3. `docs/HANDOFF.md` for setup, the APK build and CI (the parts about long stages are history).

## The bar (not negotiable)

1. **Level Devil standard.** A room looks like nothing and betrays you. The natural first try dies. The obvious
   fix dies too in at least half the rooms (counter-adaptation: the trap waits where the correction goes). The
   solution, once seen, is simple: "You fooled me. Now I know how to beat you."
2. **Nothing repeated.** Every room is a new idea inside its door and against every room before it. The same
   experience under a new skin is a repeat ("wait at the edge for the floor to come back" is one idea, whatever
   the city). A door is one family of tricks: teach, move it, break the fix, change the verb, combine.
3. **Exact.** Traps are measured in pixels against Dad's 10x14 box with the fixed jump (39 px up, 67 px across).
   A trap that can't reach him isn't a trap; one that reaches him unseen isn't fair. When he dies he must see
   why.
4. **Fair.** Every room's solution clears 90%+ of 200 runs with inputs up to 67 ms early or late. No frame-perfect
   jumps. Restart is instant (0.3 s). A lightbulb after 5 deaths shows the solution as a ghost; a skip after 8.
5. **Made of the city.** Every trick comes from something people there live with, and a local should laugh at
   it. Generic India isn't enough. Rooms are wordless; names on the banner can be local ("Ulta Pulta").
   No swearing, slurs, caste, religion, politics, regional digs, real brands, real people, film lines or lyrics,
   and nothing that makes a real tragedy a joke (no one is hit by a train).
6. **Premium.** Clean vector art, three depth layers, one landmark as a generic shape, a ride drawn with care,
   life in the background. Dad is drawn to fit his box. Look at the screenshots of every room before calling it
   done.
7. **Deterministic.** No `Math.random`, `Date` or real time in game code (particles may use them).
8. **Proven.** Every room has `natural`, `fix` (unless the fix is a stall) and `solution` scripts in its def;
   `npm run typecheck` is clean and `npm test` is all green before every push.

## Workflow per door

1. Research the city: what people there live with, around the ride Dad is late for.
2. Design table: five rooms (teach, move, break the fix, change the verb, combine). For each: the setup, what the
   player expects, the betrayal, the obvious fix and why it fails, the way through, and the closest existing
   room with why this is different. Show the owner (short) unless they already said go.
3. Build it (`docs/ROOMS.md`), test it, shoot it (`scripts/rshots.mjs`, `rmontage.mjs`, `rhint.mjs`).
4. Ship: bump the version (package.json and `src/config.ts`), add the rooms to `docs/ROOMS.md`, commit, push to
   `main`. CI builds the APK onto the `test` release.

## Working with the owner

- Short, plain words, no jargon. One recommendation, not a menu.
- When rooms ship, say in a line or two what's new and how to get past anything tricky.
- If the owner says something is too hard or unclear, believe them: reproduce it, fix it, tell them in one line.
- Never commit signing keys or anything personal (the repo is public). Commit messages end with the
  attribution your tool requires.
