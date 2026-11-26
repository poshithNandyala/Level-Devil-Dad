# AGENTS.md: rules for anyone (any AI) working on Level Devil Dad

Level Devil Dad is a troll platformer for Android and iPhone (TypeScript, Canvas 2D, Capacitor). A dad travels
India capital by capital, south to north; every stage betrays him with a trap built from that city's everyday
life. 15 cities and 120 stages are done (Thiruvananthapuram to Ranchi).

**The job now: new cities and the hardness pass, together.** The owner has said go for both. The owner's
verdict on the shipped stages: too easy and too obvious to win, nowhere near Level Devil, so every existing
stage gets harder, more complex and more unexpected. The 21 remaining cities are built in parallel, each as
a city module with **10 stages**: the recipe is `docs/CITY-MODULE.md`.

Read before you touch anything:
0. `docs/CITY-MODULE.md`: how a new city is built (a module, 10 stages, which files you may touch).
1. `docs/HANDOFF.md`: setup, how the engine works, how a stage is built, the file-by-file checklist for a
   new city, tests and tools.
2. `docs/CITIES.md`: every done stage (what it is, its act and door ending), and notes for every city still
   to do (language, what locals live with, clashes to avoid).
3. `docs/MECHANICS.md`: every idea already used. Nothing in it may be used again.
4. `docs/WAVE1.md`: the changelog, with the lessons and gotchas at each version. Read the last three cities.
5. The last city end to end as a template: `src/game/levels/rpr.ts`, `src/game/entities/raipur.ts`, its
   endings at the end of `src/game/levels/endings3.ts`, its routes in `tests/west.ts`.

## The bar (not negotiable)

1. **Nothing repeated.** Every stage, act and door ending is a new idea, inside its city and against all 112
   stages before it. The same experience under a new name, skin or city is a repeat (a trampoline is a
   trampoline whether it's a bowl or a charpai). Check MECHANICS.md and grep the code before committing to a
   design. Jokes, lines and stage names don't repeat either.
2. **Unexpected, every time.** Each stage sets up an expectation and betrays it: in the room, in the act and at
   the door. The player should laugh or groan the first time and know exactly what to do the second time:
   *"You fooled me. Now I know how to beat you."* If a stage can be summed up as "a harder version of X",
   it isn't finished. Trolls are clever, never random or cheap.
3. **Made of the city.** Every mechanic comes from something people in that city or state really live with:
   transport, food, festivals, crafts, weather, animals, landmarks (as generic shapes), habits. A local should
   recognise it and want to share it. Generic India (traffic, potholes, chai, cows) is not enough.
4. **The city's own language.** All spoken text is `"Local | English"`: the local line in English letters,
   spelled the way locals type it, then the English. Use the city's real mix (CITIES.md). Verify every word
   with native sources; if you can't verify it, use a simpler line you can. Max 8 words. Affectionate teasing,
   never mean. No swearing, slurs, caste, religion, politics, regional digs, real brands, real people, film
   dialogue or song lyrics. Respect each city's "Avoid" list in CITIES.md.
5. **Fair.** Surprise is fine; precision torture isn't. Required jumps work with a tap; nothing needs
   frame-perfect timing. Run the human-timing check on every precision section (HANDOFF.md section 6) and
   ship only at 90%+ for average timing. The hint and the guide (`w.guide`) only say true, current things
   (use `stillTrue`); only Tara may lie. Checkpoints are calm spots. When the player dies they must see why.
6. **Deterministic.** No `Math.random`, `Date` or real time in game code; the same inputs give the same result
   on every attempt, and respawn replays must be exact.
7. **Proven.** Every stage has a scripted route and a `NAIVE` (obvious play) that dies; every act has a
   route; every ending a policy. `npm run typecheck` is clean and `npm test` is all green before every push.
8. **Looks and sounds like the city.** Backdrop, palette, colour grade, ground caps, music, hidden-item food,
   postcard line, stage banners. Look at screenshots of every stage before calling it done.

## The hardness pass (on top of the bar)

1. **Stage 01 bites too.** No stage is a free walk; the welcome tour has a betrayal of its own.
2. **The obvious fix dies too**, in at least half the stages: after the first death the player corrects the
   obvious way, and a second trap waits exactly where that correction goes. The way through is still simple
   once seen. Record it as a second scripted death next to `NAIVE` (the `FIX` policy) in the route tests.
3. **Exact.** Every hazard must be able to reach the route or the obvious mistake. A spike row no jump can touch
   is decoration, not a trap: move it to where the jump goes (by pixels, against Dad's 10x14 box and the real
   jump arc), or take it out.
4. **No spoilers.** The guide (Tara's live lines) never describes a trap the player hasn't died to yet in this
   visit. The hint is the player asking for help (it unlocks after 3 deaths), so it may name what's ahead.
5. **Still fair.** The human-timing check stays at 90%+ for the route; harder means smarter, not more precise.

## Workflow per city

1. Research the city (`docs/research-prompt.md` has the format if you can browse).
2. Write the design table: 10 stages (01 is the welcome tour). For 02–10: the local thing, what the player
   expects, how it betrays them, the new mechanic, the act, the door ending, and the closest existing idea
   with why this is different. Difficulty rises 02 → 10; 10 is the finale and may call back to this
   city's own ideas only. The go is already given.
3. Build it as a module (`docs/CITY-MODULE.md`): only `src/game/cities/<code>/`, `tests/cities/<code>.ts`
   and `docs/cities/<CODE>*.md`. Test as in HANDOFF.md sections 6 and 7; `tests/modules.test.ts` must pass.
4. Hand over: commit on your own branch. **Builders never push and never bump the version.** The
   integrator merges cities into `develop`, bumps the version, writes WAVE1.md / MECHANICS.md / CITIES.md
   from your notes and publishes `develop` (never `main`). CI builds the APK onto the `test` release.

## Working with the owner

- Short, plain words, no jargon. One recommendation, not a menu.
- When a stage ships, say in a line or two what's new and how to beat anything tricky.
- If the owner says a part is too hard or unclear, believe them: reproduce it with the human-timing model,
  fix it, and tell them in one line how to get past it.
- Never commit signing keys or anything personal (the repo is public). Commit messages end with the
  attribution your tool requires.
