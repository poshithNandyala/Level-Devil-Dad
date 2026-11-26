# Integration: how parallel city work lands on develop

Two roles. **Builders** each build one city (or harden one shipped city) in their own git worktree.
The **integrator** (one chat, the only one that writes to the main checkout) merges their branches, checks the
merged tree, bumps the version and publishes `develop`. Nobody pushes `main` (the host refuses it).

Paths used below:

| What | Path |
| --- | --- |
| main checkout (integrator only) | `/local/home/saiposh/personal/level-devil-dad`, branch `develop` |
| a builder's worktree | `/local/home/saiposh/personal/ldd-wt/<code>`, branch `city/<code>` |
| Node 22 | `source /local/home/saiposh/personal/games/_template/scripts/env.sh` before any npm/npx |
| Playwright browser for flows | `export CHROME_PATH=$HOME/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell` |

`<code>` is the city code in lower case (`pat`), `<CODE>` in upper case (`PAT`).

## Builder rules

1. Work only in your worktree, on `city/<code>`, cut from `develop`.
2. Edit only `src/game/cities/<code>/`, `tests/cities/<code>.ts`, `docs/cities/<CODE>*.md` and your city's own
   row in `docs/CITIES.md`. A shipped city's hardness pass edits that city's stage file(s) and
   `tests/cities/<code>.ts` only. Anything else: stop and ask the integrator.
3. **Never push. Never bump the version.** Commit on your branch with plain messages (no brackets or braces);
   the integrator takes it from there.
4. Before you say done: typecheck, the full suite, your city's guard test and the fairness script are green
   on your branch (commands below). Write your numbers in `docs/cities/<CODE>.md`.

## Builder: the commands

```bash
# 1. the worktree (the integrator may have made it already: skip if the folder exists)
git -C /local/home/saiposh/personal/level-devil-dad worktree add -b city/pat /local/home/saiposh/personal/ldd-wt/pat develop
cd /local/home/saiposh/personal/ldd-wt/pat
source /local/home/saiposh/personal/games/_template/scripts/env.sh && npm ci

# 2. the scaffold (new cities only)
npm run new-city -- PAT "Patna" "Bihar"

# 3. build the city: docs/CITY-MODULE.md. While working:
npx vitest run tests/modules.test.ts tests/levels.test.ts tests/checkpoints.test.ts tests/cpsafe.test.ts tests/items.test.ts -t 'PAT'
npm run fair -- PAT

# 4. before handing over: everything
npm run typecheck && npm test
npm run build:single && node scripts/flows.mjs
git status --short        # only your own paths
git add src/game/cities/pat tests/cities/pat.ts docs/cities docs/CITIES.md
git commit -m "Patna: ten stages"
```

If `develop` moved while you worked, bring it in with a merge (never a rebase of shared history):
`git merge develop`.

## Integrator: one wave

Run everything from the main checkout.

```bash
cd /local/home/saiposh/personal/level-devil-dad
source /local/home/saiposh/personal/games/_template/scripts/env.sh
export CHROME_PATH=$HOME/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell
git status --short                       # must be clean
git checkout develop
```

**1. Check each branch touches only its own paths** (repeat per city):

```bash
git diff --name-only develop...city/pat | grep -v -E '^(src/game/cities/pat/|tests/cities/pat\.ts|docs/cities/PAT|docs/CITIES\.md$)' || echo "PAT: own paths only"
```

Anything printed is a file outside the city's paths: send it back to the builder.

**2. Merge in journey order** (docs/CITIES.md, "The journey": PAT LKO BBI CCU SVP GTK DIS SHL ITA KOH IMP
AIZ AGT DEL CHP CHH DDN SML JMU SXR LEH), one merge commit per city:

```bash
git merge --no-ff city/pat -m "Merge city PAT"
npm run typecheck && npx vitest run tests/modules.test.ts
```

The only expected conflict is `docs/CITIES.md` (neighbouring rows): keep both sides' rows, then
`git add docs/CITIES.md && git commit --no-edit`. Any other conflict means a builder left their paths: abort
with `git merge --abort` and send it back.

**3. Check the merged tree** (after the last merge of the wave):

```bash
npm run typecheck
npm test                                 # note the count: it only goes up
npm run build:single && node scripts/flows.mjs
for c in PAT LKO BBI; do npm run fair -- $c; done   # the wave's cities; 90% stage, 95% stretch
```

Fix nothing yourself in a city's files: a red check goes back to that city's builder.

**4. Bump the version, once per wave.** Edit `version` in `package.json` and `src/config.ts` (same number;
a new city wave is a minor bump, eg. 0.17.0). Add the wave's section to `docs/WAVE1.md` and the cities'
ideas to `docs/MECHANICS.md` from each `docs/cities/<CODE>.md`, then:

```bash
npm run typecheck && npm test
git add package.json src/config.ts docs/WAVE1.md docs/MECHANICS.md
git commit -m "v0.17.0: wave 1 cities"
```

**5. Publish develop, once**, as its own command (never chained after a commit):

```bash
git push origin develop
```

**6. Read CI for that sha** (wait and re-read for up to 10 minutes; Android APK and Test APK run on develop,
Pages and iOS only on main):

```bash
sha=$(git rev-parse HEAD)
curl -s "https://api.github.com/repos/poshithNandyala/Level-Devil-Dad/actions/runs?branch=develop&per_page=6" \
  | python3 -c "import json,sys; [print(r['head_sha'][:7], r['name'], r['status'], r['conclusion']) for r in json.load(sys.stdin)['workflow_runs']]"
curl -s https://api.github.com/repos/poshithNandyala/Level-Devil-Dad/releases/tags/test | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['name'], d['target_commitish'])"
```

**7. Report**: merged branches and their shas, the test count before and after, typecheck, flows and
fairness results per city, the version, the pushed sha, and each workflow's conclusion.

**8. Clean up** a merged city's worktree (only once it is merged and pushed):

```bash
git worktree remove /local/home/saiposh/personal/ldd-wt/pat && git branch -d city/pat
```

## Not in this flow yet

`ui/hint-home` (worktree `/local/home/saiposh/personal/ldd-wt/ui`) is being extended by another chat. Do
not merge it until the owner says it is ready.
