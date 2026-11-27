#!/usr/bin/env python3
"""addend.py CODE KIND...: move more of a migrated city's own door endings out of the shared endings files."""
import json, re, sys
p = '/local/home/saiposh/personal/ldd-inbox/reports/migrate-shots/migrate.py'
src = open(p).read()
CODE, kinds = sys.argv[1], sys.argv[2:]
sys.argv = ['x', CODE]
ns = {'__file__': p}
exec(src[:src.index('PRUNE = [')], ns)
node, read, write, imports_for, code_idents = ns['node'], ns['read'], ns['write'], ns['imports_for'], ns['code_idents']
D = f'src/game/cities/{CODE.lower()}'
E = f'{D}/endings.ts'
TABLES = [('src/game/levels/endings.ts', 'OLD_ENDINGS', 'EndingKind'), ('src/game/levels/endings2.ts', 'NEW_ENDINGS', 'NewEndingKind'), ('src/game/levels/endings3.ts', 'WEST_ENDINGS', 'WestEndingKind')]
FILES = [t[0] for t in TABLES]
ns['BASE_UNUSED'] = {f: ns['unused_imports'](f) for f in FILES}
ns['report'] = {}
parts, imps, done = [], [], []
for f, obj, ty in TABLES:
    ks = [k for k in kinds if re.search(r'^  ' + k + r': \{', read(f), re.M)]
    if not ks:
        continue
    r = node('props', f, obj, *ks)
    node('union', f, ty, *ks)
    body = '\n'.join(r[k]['lines'] for k in ks)
    parts.append(body)
    imps += imports_for(f, body, E)
    done += ks
assert set(done) == set(kinds), set(kinds) - set(done)
s = read(E)
KT = CODE[0] + CODE[1:].lower() + 'EndingKind'
if f'export type {KT}' in s:
    s = re.sub(r'(export type ' + KT + r' = [^;]*);', lambda m: m.group(1) + ''.join(f" | '{k}'" for k in kinds) + ';', s, count=1)
    i = s.rindex('\n};')
    s = s[:i] + '\n' + '\n'.join(x.rstrip('\n') for x in parts) + s[i:]
else:
    # the module had no endings of its own yet
    s = (f"// {CODE}'s door endings.\n" + "import type { Ending } from '../../levels/endkit';\n\n"
         + f"export type {KT} = {' | '.join(repr(k) for k in kinds)};\n\n"
         + "declare module '../../levels/endings' {\n  interface ModuleEndingKinds extends Record<" + KT + ", true> {}\n}\n\n"
         + f"export const endings: Record<{KT}, Ending> = {{\n" + '\n'.join(x.rstrip('\n') for x in parts) + '\n};\n')
# merge the new imports into the file's import lines
have = {}
lines = s.split('\n')
for l in imps:
    m = re.match(r"import (type )?\{ (.*) \} from '(.*)';", l)
    spec = m.group(3)
    names = m.group(2).split(', ')
    if m.group(1):
        names = ['type ' + n for n in names]
    for idx, x in enumerate(lines):
        mm = re.match(r"import (type )?\{ (.*) \} from '(.*)';$", x)
        if mm and mm.group(3) == spec and not mm.group(1):
            cur = mm.group(2).split(', ')
            add = [n for n in names if n not in cur and n.replace('type ', '') not in cur]
            lines[idx] = f"import {{ {', '.join(cur + add)} }} from '{spec}';"
            break
    else:
        first = next(i for i, x in enumerate(lines) if x.startswith('import'))
        lines.insert(first, l)
s = '\n'.join(lines)
write(E, s)
# entity imports that pointed back at this city through a shared path
s = read(E).replace(f"'../../cities/{CODE.lower()}/entities'", "'./entities'")
write(E, s)
for f in FILES:
    ns['prune_imports'](f)
print('moved', done, ns['report'].get('pruned'))
