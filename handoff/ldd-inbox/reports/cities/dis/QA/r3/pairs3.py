# QA round 2: pair each act's OWN baited play (the row right before its "(fix)" row, same act) with its fix,
# plus the stage-level naive/fix pair; cause@tick (x) at lag 0/6/12 from the sweep's per-tick replay rows.
# A pair fails if at any lag the two causes are equal, the ticks are equal, or either play did not die.
import re
sweep = open('sweep-lag-captured.txt').read()
labels = open('labels.txt').read().splitlines()
plays = {}
for m in re.finditer(r'^(DIS-\d\d): checked .*?\[(.*)\]$', sweep, re.M):
    row = {}
    for k, v in re.findall(r'(naive|fix|m\d+):(\S+(?: @\d+@t\d+)?(?:/\S+(?: @\d+@t\d+)?)*)', m[2]):
        row[k] = v.split('/')
    plays[m[1]] = row
def cells(st, k):
    out = []
    for c in plays[st].get(k, ['?'] * 3):
        g = re.search(r'=(\S+) @(\d+)@t(\d+)', c)
        out.append((g[1], int(g[3]), int(g[2])) if g else None)
    return out
rows = []
cur = None
prev = None
for l in labels:
    h = re.match(r'(DIS-\d\d) naive \[(\S+)\]', l)
    if h:
        cur = h[1]; prev = None
        if cur in plays and 'fix' in plays[cur]: rows.append((cur, 'stage naive/fix', 'naive', 'fix'))
        continue
    a = re.match(r'\s+m(\d+) \[(\S+)\] (\S+?)( \((fix|second[^)]*)\))?:', l)
    if not a or not cur: continue
    k, act, tag = 'm' + a[1], a[3], a[5]
    if tag and prev and prev[1] == act: rows.append((cur, act + (' (one play)' if tag.startswith('second') else ''), prev[0], k))
    prev = (k, act)
bad = 0
print('| Stage | Pair | lag | baited cause@tick (x) | other cause@tick (x) | ok |')
print('|---|---|---|---|---|---|')
for st, act, a, b in rows:
    ca, cb = cells(st, a), cells(st, b)
    for i, lag in enumerate([0, 6, 12]):
        x, y = ca[i], cb[i]
        ok = x and y and x[0] != y[0] and x[1] != y[1]
        if not ok and 'one play' not in act: bad += 1
        f = lambda c: f'{c[0]}@{c[1]} (x{c[2]})' if c else 'nodeath'
        print(f'| {st} | {act} [{a}/{b}] | {lag} | {f(x)} | {f(y)} | {"yes" if ok else ("one play" if "one play" in act else "NO")} |')
print(f'\npairs: {len(rows)}; rows not meeting the bar (excluding one-play): {bad}')
