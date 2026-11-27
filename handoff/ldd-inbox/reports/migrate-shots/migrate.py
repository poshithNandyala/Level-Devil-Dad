#!/usr/bin/env python3
"""Move one old city out of the shared files into src/game/cities/<code>/. Run from the worktree:
   python3 migrate.py CODE   (reads the inventory from inv.mjs; per-city extras in CFG below)"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
MIG = os.path.join(HERE, 'mig.mjs')
CODE = sys.argv[1]
c = CODE.lower()
D = f'src/game/cities/{c}'

# backdrop function and the file it lives in; display names
CFG = {
    'TVM': ('thiruvananthapuram', 'src/render/backdrops-south.ts', 'Thiruvananthapuram (Kerala)'),
    'KVT': ('kavaratti', 'src/render/backdrops-south.ts', 'Kavaratti (Lakshadweep)'),
    'CHN': ('chennai', 'src/render/backdrops-south.ts', 'Chennai (Tamil Nadu)'),
    'PDY': ('puducherry', 'src/render/backdrops-south.ts', 'Puducherry'),
    'BLR': ('bengaluru', 'src/render/backgrounds.ts', 'Bengaluru (Karnataka)'),
    'AMR': ('amaravati', 'src/render/backdrops-south.ts', 'Amaravati (Andhra Pradesh)'),
    'HYD': ('hyderabad', 'src/render/backgrounds.ts', 'Hyderabad (Telangana)'),
    'PNJ': ('panaji', 'src/render/backdrops-west.ts', 'Panaji (Goa)'),
    'BOM': ('mumbai', 'src/render/backgrounds.ts', 'Mumbai (Maharashtra)'),
    'DMN': ('daman', 'src/render/backdrops-west.ts', 'Daman (Dadra & Nagar Haveli and Daman & Diu)'),
    'GNR': ('gandhinagar', 'src/render/backdrops-west.ts', 'Gandhinagar (Gujarat)'),
    'JAI': ('jaipur', 'src/render/backdrops-west.ts', 'Jaipur (Rajasthan)'),
    'BPL': ('bhopal', 'src/render/backdrops-west.ts', 'Bhopal (Madhya Pradesh)'),
    'RPR': ('raipur', 'src/render/backdrops-west.ts', 'Raipur (Chhattisgarh)'),
}
BD_FN, BD_FILE, TITLE = CFG[CODE]


def node(*a):
    r = subprocess.run(['node', MIG, *a], capture_output=True, text=True)
    if r.returncode:
        sys.exit(f'mig {a[:3]} failed: {r.stderr[-2000:]}')
    return json.loads(r.stdout) if r.stdout.strip() else None


def read(p):
    return open(p, encoding='utf8').read()


def write(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf8').write(s)


def sh(*a):
    subprocess.run(a, check=True)


def rel(frm_file, target):
    """import specifier from frm_file to target (path without .ts)"""
    r = os.path.relpath(target, os.path.dirname(frm_file))
    if all(x == '..' for x in r.split('/')):
        # the target is an ancestor directory's name twin (src/game/cities.ts next to src/game/cities/)
        r = r + '/../' + os.path.basename(target)
    return r if r.startswith('.') else './' + r


def code_idents(text):
    """identifiers used as code (strings and comments removed, template expressions kept)"""
    out, i, n = [], 0, len(text)
    depth = []  # template nesting
    while i < n:
        ch = text[i]
        if text.startswith('//', i):
            i = text.find('\n', i); i = n if i < 0 else i; continue
        if text.startswith('/*', i):
            j = text.find('*/', i + 2); i = n if j < 0 else j + 2; continue
        if ch in '\'"':
            j = i + 1
            while j < n and text[j] != ch:
                j += 2 if text[j] == '\\' else 1
            i = j + 1; out.append(' '); continue
        if ch == '`' or (ch == '}' and depth and depth[-1] == 0):
            if ch == '}':
                depth.pop()
            j = i + 1
            while j < n and text[j] != '`' and not text.startswith('${', j):
                j += 2 if text[j] == '\\' else 1
            if j < n and text[j] == '`':
                i = j + 1
            else:
                depth.append(0); i = j + 2
            out.append(' '); continue
        if depth:
            if ch == '{': depth[-1] += 1
            elif ch == '}': depth[-1] -= 1
        out.append(ch); i += 1
    s = ''.join(out)
    return set(m.group(1) for m in re.finditer(r'(?<![\w$])(?:(?<=\.\.\.)|(?<!\.))([A-Za-z_$][\w$]*)(?!\s*:(?!:))', s)) | \
        set(m.group(1) for m in re.finditer(r'(?<![\w$])(?:(?<=\.\.\.)|(?<!\.))([A-Za-z_$][\w$]*)(?=\s*[(,;)\]}])', s))


def imports_for(srcfile, body, newfile, skip=()):
    """import lines newfile needs to use, from srcfile's scope, the names `body` uses; exports srcfile's own decls"""
    info = node('imports', srcfile)
    used = code_idents(body) - set(skip)
    groups = {}
    for im in info['imps']:
        if im['local'] not in used:
            continue
        frm = im['from']
        tgt = os.path.normpath(os.path.join(os.path.dirname(srcfile), frm)) if frm.startswith('.') else None
        spec = rel(newfile, tgt) if tgt else frm
        nm = im['local'] if im['imported'] == im['local'] else f"{im['imported']} as {im['local']}"
        groups.setdefault(spec, []).append(('type ' if im['type'] else '') + nm)
    own = [d for d in info['decls'] if d['local'] in used]
    if own:
        s = read(srcfile)
        for d in sorted([d for d in own if not d['exported']], key=lambda d: -d['start']):
            s = s[:d['start']] + 'export ' + s[d['start']:]
        write(srcfile, s)
        spec = rel(newfile, srcfile[:-3])
        groups.setdefault(spec, []).extend(('type ' if d['kind'] == 'type' else '') + d['local'] for d in own)
    lines = []
    for spec, names in groups.items():
        names = sorted(set(names), key=lambda x: x.replace('type ', '').lower())
        if all(x.startswith('type ') for x in names):
            lines.append(f"import type {{ {', '.join(x[5:] for x in names)} }} from '{spec}';")
        else:
            lines.append(f"import {{ {', '.join(names)} }} from '{spec}';")
    return lines


def dedent(text, k):
    return '\n'.join(l[k:] if l.startswith(' ' * k) else l for l in text.split('\n'))


def value_of(entry_text, key):
    """'KEY: {...}' -> '{...}' re-indented from 4 to 2"""
    v = re.sub(r'^\s*' + re.escape(key) + r'\s*:\s*', '', entry_text, count=1)
    return dedent(v, 2)


def unused_imports(fp):
    s = read(fp)
    res = set()
    for line in s.split('\n'):
        m = re.match(r"import (type )?\{ (.*) \} from '(.*)';$", line)
        if m:
            used = code_idents(s.replace(line, ''))
            res |= {n for n in m.group(2).split(', ') if n.replace('type ', '').split(' as ')[-1] not in used}
    return res

def prune_imports(fp):
    s = read(fp)
    before = BASE_UNUSED.get(fp, set())
    out = []
    for line in s.split('\n'):
        m = re.match(r"import (type )?\{ (.*) \} from '(.*)';$", line)
        if not m:
            out.append(line); continue
        rest = s.replace(line, '')
        used = code_idents(rest)
        names = [n for n in m.group(2).split(', ') if n.replace('type ', '').split(' as ')[-1] in used or n in before]
        if not names:
            report.setdefault('pruned', []).append(f'{fp}: {line}'); continue
        if len(names) != len(m.group(2).split(', ')):
            report.setdefault('pruned', []).append(f'{fp}: dropped {set(m.group(2).split(", ")) - set(names)}')
        out.append(f"import {m.group(1) or ''}{{ {', '.join(names)} }} from '{m.group(3)}';")
    write(fp, '\n'.join(out))

PRUNE = ['src/game/levels/endings.ts', 'src/game/levels/endings2.ts', 'src/game/levels/endings3.ts', 'src/render/art/things.ts', BD_FILE, 'src/render/backgrounds.ts', 'src/game/entities/props.ts']
BASE_UNUSED = {fp: unused_imports(fp) for fp in PRUNE}
inv = json.loads(subprocess.run(['node', os.path.join(HERE, 'inv.mjs'), CODE], capture_output=True, text=True, check=True).stdout)
os.makedirs(D, exist_ok=True)
report = {'code': CODE, 'moved': [], 'removed': []}

# ---------------------------------------------------------------- per-city keyed tables
def take(file, obj, key):
    r = node('props', file, obj, key)
    report['removed'].append(f'{file}:{obj}.{key}')
    return r[key]['text']

lines_v = value_of(take('src/game/cities.ts', 'LINES', CODE), CODE)
write(f'{D}/lines.ts', f"import type {{ CityLines }} from '../../cities';\n\n/** everything {TITLE.split(' (')[0]} says (\"Local | English\"): LINES.{CODE} once installed */\nexport const lines: CityLines = {lines_v};\n")

# CHAPTERS row: the module fills city, hello and famous at install
s = read('src/game/cities.ts')
s2 = re.sub(r"(\{ id: '" + CODE + r"',[^\n]*?) city: '" + CODE + r"',([^\n]*?) hello: LINES\." + CODE + r"\.hello, famous: LINES\." + CODE + r"\.famous \}",
            r"\1\2 hello: '', famous: '' }", s)
assert s2 != s, 'CHAPTERS row'
write('src/game/cities.ts', s2)
report['removed'].append(f'src/game/cities.ts:CHAPTERS {CODE} city/hello/famous (filled by install)')

skin_v = value_of(take('src/game/levels/chunks.ts', 'SKINS', CODE), CODE)
write(f'{D}/skin.ts', f"import type {{ Skin }} from '../../levels/chunks';\n\n/** how {TITLE.split(' (')[0]} dresses the old troll sections, and what its people shout */\nexport const skin: Skin = {skin_v};\n")

course_v = value_of(take('src/game/levels/tour.ts', 'COURSES', CODE), CODE)
write(f'{D}/course.ts', f"import type {{ TourSeg }} from '../../levels/tour';\n\n/** the welcome tour's pieces ({CODE}-01) */\nexport const course: TourSeg[] = {course_v};\n")

cl = value_of(take('src/app/citylines.ts', 'CITY_LINE', CODE), CODE)
grade = value_of(take('src/render/renderer.ts', 'GRADES', CODE), CODE)
caps = value_of(take('src/render/art/tiles.ts', 'CAP', CODE), CODE)
write(f'{D}/look.ts', "import type { Grade } from '../../../render/renderer';\nimport type { GroundCaps } from '../../../render/art/tiles';\n\n"
      f"/** colour grade over the whole frame */\nexport const grade: Grade = {grade};\n\n"
      f"/** the grass and pebbles on top of the ground tiles */\nexport const tileCaps: GroundCaps = {caps};\n\n"
      f"/** one sentence for the postcard */\nexport const cityLine = {cl};\n")

mus_e = node('props', 'src/audio/audio.ts', 'MUSIC', CODE)[CODE]
report['removed'].append(f'src/audio/audio.ts:MUSIC.{CODE}')
mus_lines = mus_e['lines']
comment = ''.join(l + '\n' for l in mus_lines.split('\n') if l.strip().startswith('//'))
mus_v = value_of(mus_e['text'], CODE)
head = "import type { MusicCfg } from '../../../audio/audio';\n\n" + ("const _ = null;\n" if re.search(r'(?<![\w$])_(?![\w$])', mus_v) else '')
write(f'{D}/music.ts', head + dedent(comment, 2) + f"export const music: MusicCfg = {mus_v};\n")

theme_v = value_of(take('src/render/theme.ts', 'THEMES', CODE), CODE)
write(f'{D}/theme.ts', f"import type {{ Theme }} from '../../../render/theme';\n\nexport const theme: Theme = {theme_v};\n")
s = read('src/render/theme.ts')
s2 = re.sub(r"'" + CODE + r"', |, '" + CODE + r"'(?=\])|(?<=\[)'" + CODE + r"'(?=\])", '', s, count=1)
assert s2 != s, 'CITY_ORDER'
write('src/render/theme.ts', s2)
report['removed'].append(f'src/render/theme.ts:CITY_ORDER {CODE} (install appends it)')

# ---------------------------------------------------------------- backdrop
bd = node('decl', BD_FILE, BD_FN)[BD_FN]
bd = re.sub(r'^function ' + BD_FN + r'\(', 'export function ' + BD_FN + '(', bd, flags=re.M)
imps = imports_for(BD_FILE, bd, f'{D}/backdrop.ts', skip=[BD_FN])
write(f'{D}/backdrop.ts', '\n'.join(imps) + '\n\n' + bd)
report['moved'].append(f'{BD_FILE}:{BD_FN} -> {D}/backdrop.ts')
s = read('src/render/backgrounds.ts')
s2 = re.sub(r"\n  else if \(city === '" + CODE + r"'\) " + BD_FN + r"\(ctx, th, x0, x1(, variant)?\);", '', s)
s2 = re.sub(r"\n  if \(city === '" + CODE + r"'\) " + BD_FN + r"\(ctx, th, x0, x1(, variant)?\);\n  else if", '\n  if', s2) if s2 == s else s2
if s2 == s and CODE == 'AMR':
    # Amaravati was the last-resort branch; every city with a theme now has its own branch or a module backdrop
    s2 = s.replace('\n  else amaravati(ctx, th, x0, x1);', '')
assert s2 != s, 'backdrop dispatch'
# drop the import of the moved function
s2 = re.sub(r'(import \{[^}]*?)\b' + BD_FN + r', ', r'\1', s2, count=1) if BD_FILE != 'src/render/backgrounds.ts' else s2
s2 = re.sub(r'(import \{[^}]*?), ' + BD_FN + r'( \})', r'\1\2', s2, count=1) if BD_FILE != 'src/render/backgrounds.ts' else s2
write('src/render/backgrounds.ts', s2)

# ---------------------------------------------------------------- causes
cause_txt = []
if inv['cause']:
    r = node('props', 'src/game/entities/props.ts', 'CAUSE_LINES', *inv['cause'])
    cause_txt = [r[k]['lines'].rstrip('\n') for k in inv['cause']]
    report['removed'] += [f'src/game/entities/props.ts:CAUSE_LINES.{k}' for k in inv['cause']]
write(f'{D}/causes.ts', "/** Tara's line for each way to die here: [what happened, how to beat it] */\nexport const causeLines: Record<string, string[]> = {\n"
      + ''.join(t + (',' if not t.rstrip().endswith(',') else '') + '\n' for t in cause_txt) + '};\n')

# ---------------------------------------------------------------- endings
TABLES = [('src/game/levels/endings.ts', 'OLD_ENDINGS', 'EndingKind'), ('src/game/levels/endings2.ts', 'NEW_ENDINGS', 'NewEndingKind'), ('src/game/levels/endings3.ts', 'WEST_ENDINGS', 'WestEndingKind')]
end_parts, end_imps, kinds = [], [], []
for f, obj, ty in TABLES:
    s = read(f)
    keys = [k for k in inv['ending'] if re.search(r'^  ' + re.escape(k) + r': \{', s, re.M)]
    if not keys:
        continue
    r = node('props', f, obj, *keys)
    node('union', f, ty, *keys)
    body = '\n'.join(r[k]['lines'] for k in keys)
    end_parts.append(body)
    end_imps += imports_for(f, body, f'{D}/endings.ts')
    kinds += keys
    report['removed'] += [f'{f}:{obj}.{k} (+ {ty})' for k in keys]
missing = set(inv['ending']) - set(kinds)
assert not missing, f'endings not found: {missing}'
KT = CODE[0] + CODE[1:].lower() + 'EndingKind'
if kinds:
    merged = {}
    for l in end_imps:
        m = re.match(r"import (type )?\{ (.*) \} from '(.*)';", l)
        for nm in m.group(2).split(', '):
            merged.setdefault(m.group(3), set()).add(('type ' if m.group(1) else '') + nm)
    imp_lines = []
    for spec, names in merged.items():
        names = sorted(names, key=lambda x: x.replace('type ', '').lower())
        if all(x.startswith('type ') for x in names):
            imp_lines.append(f"import type {{ {', '.join(x[5:] for x in names)} }} from '{spec}';")
        else:
            imp_lines.append(f"import {{ {', '.join(names)} }} from '{spec}';")
    if not any(re.search(r'\bEnding\b', l) for l in imp_lines):
        imp_lines.append("import type { Ending } from '../../levels/endkit';")
    write(f'{D}/endings.ts', f"// {TITLE.split(' (')[0]}'s door endings.\n" + '\n'.join(imp_lines) + '\n\n'
          + f"export type {KT} = {' | '.join(repr(k) for k in kinds)};\n\n"
          + "declare module '../../levels/endings' {\n  interface ModuleEndingKinds extends Record<" + KT + ", true> {}\n}\n\n"
          + f"export const endings: Record<{KT}, Ending> = {{\n" + '\n'.join(p.rstrip('\n') for p in end_parts) + '\n};\n')
else:
    write(f'{D}/endings.ts', "import type { Ending } from '../../levels/endkit';\n\n/** no door endings of its own: its stages use the shared twists */\nexport const endings: Record<string, Ending> = {};\n")

# ---------------------------------------------------------------- things (hidden item and props)
TF = 'src/render/art/things.ts'
th_txt = []
if inv['thing']:
    sizes = node('props', TF, 'SIZE', *inv['thing'])
    cases = node('cases', TF, 'drawThing', *inv['thing'])
    node('union', TF, 'BaseThingKind', *inv['thing'])
    report['removed'] += [f'{TF}:SIZE/BaseThingKind/drawThing case {k}' for k in inv['thing']]
    fns, done = [], set()
    allbody = ''
    for k in inv['thing']:
        cz = cases[k]
        if tuple(cz['group']) in done:
            continue
        done.add(tuple(cz['group']))
        body = cz['text']
        if body.startswith('{') and body.endswith('}'):
            body = body[1:-1].strip('\n')
            body = dedent(body, 4)
        else:
            body = '  ' + dedent(body, 4).lstrip()
        body = re.sub(r'\n\s*return;\s*$', '', '\n' + body)[1:] if body.rstrip().endswith('return;') else body
        ids = code_idents(body)
        assert 'kind' not in ids, f'thing {k} reads `kind`'
        pre = '  const t = o.t;\n' if 't' in ids else ''
        nm = cz['group'][0]
        fns.append(f"const {nm}: ThingDraw = (ctx, x, y, w, h, o) => {{\n{pre}{body.rstrip()}\n}};\n")
        allbody += body
    imps = [l for l in imports_for(TF, allbody, f'{D}/things.ts', skip=['t', 'o', 'w', 'h', 'x', 'y', 'ctx', 'ThingDraw'])]
    imps.append("import type { ThingDraw } from '../../../render/art/things';")
    names = {k: cases[k]['group'][0] for k in inv['thing']}
    write(f'{D}/things.ts', '\n'.join(imps) + "\n\ndeclare module '../../../render/art/things' {\n  interface ModuleThingKinds {\n"
          + ''.join(f'    {k}: true;\n' for k in inv['thing']) + '  }\n}\n\n' + '\n'.join(fns) + '\nexport const things = {\n'
          + ''.join(f"  {k}: {{ size: {sizes[k]['text'].split(':', 1)[1].strip()} as [number, number], draw: {names[k]} }},\n" for k in inv['thing']) + '};\n')

# ---------------------------------------------------------------- levels and entities (git mv)
def fix_imports(path, old_dir, moved):
    """rewrite relative imports of a file moved from old_dir into D; `moved` maps old module paths to new"""
    s = read(path)
    def sub(m):
        spec = m.group(2)
        if not spec.startswith('.'):
            return m.group(0)
        tgt = os.path.normpath(os.path.join(old_dir, spec))
        tgt = moved.get(tgt, tgt)
        return m.group(1) + "'" + rel(path, tgt) + "'"
    s = re.sub(r"((?:from|import)\s*)'([^']+)'", sub, s)
    write(path, s)

moved = {}
lvl_old = f'src/game/levels/{c}'
moved[lvl_old] = f'{D}/levels'
for e in inv['own'][1:]:
    moved[e[:-3]] = f'{D}/entities' if len(inv['own']) == 2 else f'{D}/' + os.path.basename(e)[:-3]
sh('git', 'mv', lvl_old + '.ts', f'{D}/levels.ts')
for old, new in moved.items():
    if old != lvl_old:
        sh('git', 'mv', old + '.ts', new + '.ts')
for old, new in moved.items():
    fix_imports(new + '.ts', os.path.dirname(old), moved)
report['moved'] += [f'{o}.ts -> {n}.ts' for o, n in moved.items()]

# the level file: own lines, stages as a function
p = f'{D}/levels.ts'
s = read(p)
assert not re.search(r'(?<![\w$.])L(?![\w$])', re.sub(r'const L = LINES\.' + CODE + ';\n', '', s)) or 'const L = LINES.' + CODE in s, 'L already used'
s = re.sub(r"import \{ LINES \} from '\.\./\.\./cities';\n", "import { lines as L } from './lines';\n", s)
s = re.sub(r"import \{ LINES, ([^}]*) \} from '\.\./\.\./cities';\n", r"import { \1 } from '../../cities';\nimport { lines as L } from './lines';\n", s)
s = s.replace(f'const L = LINES.{CODE};\n', '')
s = s.replace(f'LINES.{CODE}', 'L')
assert 'LINES' not in s, 'LINES left in levels'
s, n = re.subn(r'export const ' + CODE + r': LevelDef\[\] = \[', 'export const levels = (): LevelDef[] => [', s)
assert n == 1, 'stage array'
write(p, s)

# importers of the moved files elsewhere (shared files, tests)
for root in ('src', 'tests', 'scripts'):
    for dp, _, fs in os.walk(root):
        for f in fs:
            fp = os.path.join(dp, f)
            if not f.endswith(('.ts', '.mjs')) or fp[:-3] in moved.values():
                continue
            s = read(fp)
            def sub(m):
                spec = m.group(2)
                if not spec.startswith('.'):
                    return m.group(0)
                tgt = os.path.normpath(os.path.join(dp, spec))
                return m.group(1) + "'" + rel(fp, moved[tgt]) + "'" if tgt in moved else m.group(0)
            s2 = re.sub(r"((?:from|import)\s*)'([^']+)'", sub, s)
            if s2 != s:
                write(fp, s2)
                report.setdefault('importers', []).append(fp)

# imports the shared files no longer use (what moved took its users along)
for fp in PRUNE:
    prune_imports(fp)

# levels/index.ts
s = read('src/game/levels/index.ts')
s = re.sub(r"import \{ " + CODE + r" \} from '[^']+';\n", '', s)
s = re.sub(r'\.\.\.' + CODE + r'(, )?', '', s).replace(', ]', ']')
write('src/game/levels/index.ts', s)

# ---------------------------------------------------------------- index.ts
parts = ['lines', 'levels', 'endings', 'causeLines', 'skin', 'course', 'cityLine', 'music', 'theme', 'grade', 'tileCaps', f'backdrop: {BD_FN}'] + (['things'] if inv['thing'] else [])
write(f'{D}/index.ts', f"// {TITLE} as a city module (moved out of the shared files; gameplay unchanged).\n"
      "import type { CityModule } from '../module';\nimport { lines } from './lines';\nimport { levels } from './levels';\nimport { endings } from './endings';\n"
      "import { causeLines } from './causes';\nimport { skin } from './skin';\nimport { course } from './course';\nimport { music } from './music';\n"
      f"import {{ theme }} from './theme';\nimport {{ cityLine, grade, tileCaps }} from './look';\nimport {{ {BD_FN} }} from './backdrop';\n"
      + ("import { things } from './things';\n" if inv['thing'] else '')
      + f"\nexport const {CODE}: CityModule = {{\n  id: '{CODE}',\n" + ''.join(f'  {x},\n' for x in parts) + '};\n')
json.dump({**report, 'inv': inv}, open(os.path.join(HERE, f'report-{CODE}.json'), 'w'), indent=1)
print(json.dumps({**report, 'inv': {k: v for k, v in inv.items() if not k.endswith('Shared')}}, indent=1))
