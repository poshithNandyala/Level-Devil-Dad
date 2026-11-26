#!/usr/bin/env python3
"""Guard: no duplicate family, no duplicate (family, betrayal) pair, no betrayal type twice in a city."""
import json, sys, collections, os
p = os.path.join(os.path.dirname(__file__), '..', '..', 'docs', 'allocation.json')
J = json.load(open(p)); errs = []
fam = collections.defaultdict(list); pairs = collections.Counter()
for c, v in J.items():
    if c == 'rules': continue
    items = list(v['slots']) + list(v.get('reserves', []))
    if 'tourNew' in v: items.append(dict(v['tourNew'], concept=c + '-tour'))
    seen = collections.Counter()
    for s in items:
        fam[s['family']].append(c + ':' + s['concept'])
        for b in s['betrayals']:
            pairs[(s['family'], b)] += 1
            if not b.startswith('shipped'): seen[b] += 1
    errs += [f'{c}: betrayal {b} used {n}x' for b, n in seen.items() if n > 1]
    if v['status'] == 'new':
        assert len(v['slots']) == 10 and len(v['reserves']) >= 2, c
        hw = [s['index'] for s in v['slots'] if s['shape'].split(' ')[0] == 'HWIK']
        if len(hw) > 2 or any(b - a == 1 for a, b in zip(hw, hw[1:])): errs.append(f'{c}: HWIK {hw}')
errs += [f'family {f}: {w}' for f, w in fam.items() if len(w) > 1]
errs += [f'pair {k} x{n}' for k, n in pairs.items() if n > 1]
print(len([k for k in J if k != 'rules']), 'cities', len(fam), 'families', len(pairs), 'pairs')
print('\n'.join(errs) or 'OK: no duplicates')
sys.exit(1 if errs else 0)
