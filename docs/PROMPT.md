# Prompt for the next AI

Use an AI that can work in the repo and run commands (Claude Code, OpenAI Codex, Gemini CLI, Cursor, ...).
Connect or clone https://github.com/poshithNandyala/Level-Devil-Dad, then paste the first prompt.
For every later session, paste the short one at the bottom.

## First session

```text
You are taking over "Level Devil Dad", a troll platformer for Android and iPhone (TypeScript, Canvas 2D,
Capacitor), repo: https://github.com/poshithNandyala/Level-Devil-Dad. A dad travels India capital by
capital, south to north, and every stage betrays him with a trap built from that city's everyday life.
14 cities (112 stages) are done. Your job: build the next city, Ranchi (Jharkhand), to the same standard
or better, then carry on down the list one city at a time.

Before you write any code, read in this order: AGENTS.md (the rules), docs/HANDOFF.md (setup, engine,
the file-by-file checklist for a new city, tests and tools), docs/CITIES.md (every stage so far, and the
notes for Ranchi and every city after it), docs/MECHANICS.md (every idea already used), and the last three
sections of docs/WAVE1.md. Then read the last city, Raipur, end to end as your template:
src/game/levels/rpr.ts, src/game/entities/raipur.ts, its endings at the end of
src/game/levels/endings3.ts, and its routes in tests/west.ts. Run npm ci, npm run typecheck and npm test
to make sure everything is green before you start.

The bar. I will hold you to every point:
1. Nothing repeated. Every stage, act and door ending is a brand-new idea, against this city and all 112
   stages before it. The same experience with a new name, skin or city counts as a repeat (a trampoline is
   a trampoline whether it's a bowl or a charpai). Check docs/MECHANICS.md and grep the code first.
2. Unexpected every time. Each stage makes the player expect one thing and betrays it, in the room, in the
   act and at the door. First time: they laugh or groan. Second time: they know exactly what to do. If a
   stage is just "a harder version of" something, it's not done. Clever trolls, never random or cheap.
3. Made of the city. Every mechanic comes from something people in Ranchi and Jharkhand really live with
   (waterfalls, Sarhul, dhuska, haats, wall paintings, Chhau masks, rocks and hills...). A local should
   smile and want to share it. Generic India is not enough.
4. The city's own language. Every spoken line is "Local | English", the local part in English letters the
   way locals type it (Ranchi: Nagpuri/Sadri + Hindi + English). Verify every word with native sources;
   if you can't, use a simpler line you can verify. Max 8 words. Affectionate, never mean. No swearing,
   slurs, caste, religion, politics, real brands, real people, film dialogue or song lyrics.
5. Fair. Surprise is fine, precision torture isn't. Every required jump works with a tap. Run the
   human-timing check from docs/HANDOFF.md on every tricky section (random reaction 0-18 ticks, random
   hold 6-44 ticks) and only ship at 90%+ for average timing. The hint and the guide only say true,
   current things; only Tara (the rival) may lie. Checkpoints are calm spots. The player must always see
   why they died.
6. Deterministic: no Math.random, Date or real time in game code.
7. Proven: every stage has a scripted route and a NAIVE obvious play that dies; every act a route; every
   ending a policy; typecheck clean; npm test all green.
8. Looks and sounds like the city: backdrop, palette, grade, ground caps, music, hidden-item food,
   postcard line. Take screenshots of every stage and look at them before you say it's done.

How to work:
1. Research Ranchi. Then show me the design table for its 8 stages (01 is the welcome tour; 02-08 each
   have a room, an act and a door ending): the local thing, what the player expects, how it betrays them,
   the new mechanic, and the closest existing idea with why yours is different. Keep it to one screen.
   Wait for my "go".
2. Build it with the checklist in docs/HANDOFF.md section 5. Put the new door endings in a new
   src/game/levels/endings4.ts and the new routes in a new tests/east.ts, as HANDOFF.md says.
3. Test: routes, NAIVE deaths, the human-timing check, screenshots, node scripts/flows.mjs.
4. Ship: version 0.15.0 in package.json and src/config.ts, a WAVE1.md section, the new ideas in
   MECHANICS.md, Ranchi moved to Done in CITIES.md. Commit and push to main. GitHub Actions puts the APK on
   the "test" release; tell me when it's there.

Talk to me in short, plain words, no jargon. Give me one recommendation, not a menu. If I say a part is too
hard or unclear, believe me: reproduce it with the human-timing check, fix it, and tell me in one line how
to beat it. Never commit signing keys or personal data: the repo is public.
```

## Every session after that

```text
Continue Level Devil Dad (https://github.com/poshithNandyala/Level-Devil-Dad). Read AGENTS.md, then
docs/HANDOFF.md, docs/CITIES.md and docs/MECHANICS.md. Build the next city marked "next" in
docs/CITIES.md, to every point of the bar in AGENTS.md: nothing repeated, every stage unexpected, made of
that city, its own language verified, fair (human-timing check at 90%+), deterministic, proven by tests,
looking and sounding like the city. Show me the 8-stage design table first and wait for my "go". Then
build, test, update the docs, bump the version, commit and push to main.
```

## If the AI can't run code

A chat-only AI can still do the research and the design table: paste the first prompt, add "You can't run
code, so stop after the design table", and attach AGENTS.md, docs/CITIES.md and docs/MECHANICS.md. Then give
the table to an AI that can build.
