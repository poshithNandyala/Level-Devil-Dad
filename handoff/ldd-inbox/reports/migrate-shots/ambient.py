#!/usr/bin/env python3
"""Move every city's animated ambient layer (ambientSouth, ambientWest, ambientVibe and the city chain in
drawAmbient) into src/game/cities/<code>/ambient.ts, in the order drawAmbient drew them."""
import json, re, subprocess, sys
p = '/local/home/saiposh/personal/ldd-inbox/reports/migrate-shots/migrate.py'
src = open(p).read(); sys.argv = ['x', 'TVM']; ns = {'__file__': p}
exec(src[:src.index('PRUNE = [')], ns)
node, read, write, code_idents, dedent = ns['node'], ns['read'], ns['write'], ns['code_idents'], ns['dedent']
BG = 'src/render/backgrounds.ts'
# drawAmbient's order: south, west, vibe (only when not reduced), then its own chain
SRC = [('src/render/backdrops-south.ts', 'ambientSouth', False), ('src/render/backdrops-west.ts', 'ambientWest', False), (BG, 'ambientVibe', True), (BG, 'drawAmbient', False)]
pieces = {}
for f, fn, vibe in SRC:
    for b in node('branches', f, fn):
        test = b['test']
        cities = re.findall(r"city === '([A-Z]{3})'", test)
        red = '!reduced' in test
        rest = re.sub(r"city === '[A-Z]{3}'", '', test).replace('&& !reduced', '').replace('||', '').strip()
        assert rest == '', (fn, test)
        for c in cities:
            body = b['body']
            if len(cities) > 1:
                # a branch shared by two cities: pick this city's side of `city === 'X' ? a : b`
                assert set(cities) == {'PDY', 'BLR'}, cities
                pdy = c == 'PDY'
                body = body.replace("city === 'PDY' ? ['#E91E8C', '#FF5CA8', '#C2185B'] : ['#B39DDB', '#9575CD', '#CE93D8']", "['#E91E8C', '#FF5CA8', '#C2185B']" if pdy else "['#B39DDB', '#9575CD', '#CE93D8']")
                body = body.replace("drift(city === 'PDY' ? 22 : 26, city === 'PDY' ? 31 : 37,", 'drift(22, 31,' if pdy else 'drift(26, 37,')
                assert "city ===" not in body, body
            pieces.setdefault(c, []).append((fn, f, red or vibe, body))
VIBE_HEAD = """    const span = Math.max(1, x1 - x0);
    const drift = (n: number, seed: number, fall: number, sway: number, f: (x: number, y: number, i: number) => void) => {
      for (let i = 0; i < n; i++) {
        const x = x0 + ((hash(i, seed) * span + t * (12 + hash(i, seed + 1) * 18)) % span);
        const y = (hash(i, seed + 2) * 300 + t * fall * (0.6 + hash(i, seed + 3) * 0.8)) % 300;
        f(x + Math.sin(t * 1.3 + i) * sway, y - 10, i);
      }
    };
"""
NAMES = {'ambientSouth': 'backdrops-south.ts ambientSouth', 'ambientWest': 'backdrops-west.ts ambientWest', 'ambientVibe': "backgrounds.ts ambientVibe", 'drawAmbient': 'backgrounds.ts drawAmbient'}
for c, ps in pieces.items():
    parts, used = [], set()
    for fn, f, guarded, body in ps:
        body = body.strip('\n')
        if fn == 'ambientVibe':
            uses_drift = re.search(r'\bdrift\(', body)
            head = VIBE_HEAD if uses_drift else VIBE_HEAD.split('\n')[0] + '\n'
            if not re.search(r'\bspan\b', body) and not uses_drift:
                head = ''
            body = head + body
        # bodies were indented 4 (inside the function's if); inside `if (...) {` here they sit at 4 too
        open_ = '  if (!reduced) {' if guarded else '  {'
        parts.append(f'  // (was {NAMES[fn]})\n{open_}\n{body}\n  }}')
        used |= code_idents(body)
    imps = [n for n in ['Ctx', 'circle', 'hash', 'rr', 'withAlpha', 'ellipse'] if n in used or n == 'Ctx']
    D = f'src/game/cities/{c.lower()}'
    write(f'{D}/ambient.ts', f"import {{ {', '.join(imps)} }} from '../../../render/art/common';\n\n"
          "/** the animated layer drawn every frame over the cached backdrop (rain, birds, kites, mist) */\n"
          "export function ambient(ctx: Ctx, x0: number, x1: number, t: number, reduced: boolean) {\n" + '\n'.join(parts) + '\n}\n')
    s = read(f'{D}/index.ts')
    s = s.replace("import { cityLine, grade, tileCaps } from './look';\n", "import { cityLine, grade, tileCaps } from './look';\nimport { ambient } from './ambient';\n")
    s = s.replace('  tileCaps,\n', '  tileCaps,\n  ambient,\n')
    write(f'{D}/index.ts', s)
print({c: [x[0] for x in v] for c, v in pieces.items()})
