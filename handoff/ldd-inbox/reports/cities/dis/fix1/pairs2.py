# DIS fix round 1: the pairing table, made by script from the lag-captured sweep (QA's model, tests/qa sweep) and
# labels.txt. Per act with two plays (the baited play and its obvious fix) and per room (NAIVE vs FIX): cause@tick and
# the tile x of the death, at lag 0/6/12. A pair is SAME when the two plays die to the same cause or on the same tick.
# The baited play is the act's own NAIVE (the last naive-labelled row before its fix), not an extra ACT_MORE row.
import re, sys
sweep = open('sweep-lag-captured.txt').read()
labels = open('labels.txt').read().splitlines()
plays = {}
for m in re.finditer(r'^(DIS-\d\d): checked .*?\[(.*)\]$', sweep, re.M):
    row = {}
    for k, v in re.findall(r'(naive|fix|m\d+):(\S+(?: @\d+@t\d+)?(?:/\S+(?: @\d+@t\d+)?)*)', m[2]):
        row[k] = v.split('/')
    plays[m[1]] = row
cur = None
acts = {}
order = []
for l in labels:
    h = re.match(r'(DIS-\d\d) naive', l)
    if h:
        cur = h[1]; acts[(cur, 'room')] = [('naive', 'naive'), ('fix', 'fix')]; order.append((cur, 'room')); continue
    a = re.match(r'\s+m(\d+) \[(\S+)\] (\S+?)( \((fix|second[^)]*)\))?:', l)
    if a and cur:
        key = (cur, a[3])
        if key not in acts: acts[key] = []; order.append(key)
        acts[key].append(('m' + a[1], a[5] or 'naive'))
def cell(s):
    c = re.search(r'=(\S+) @(\d+)@t(\d+)', s)
    return (c[1], int(c[3]), int(c[2])) if c else (s, -1, -1)
bad = 0
print('| Stage | Part | lag | baited cause@tick (x) | other cause@tick (x) | ok |')
print('| --- | --- | --- | --- | --- | --- |')
for st, act in order:
    ps = acts[(st, act)]
    f = [p for p, k in ps if k == 'fix']
    if not f: continue
    fi = [i for i, (p, k) in enumerate(ps) if k == 'fix'][0]
    n = [p for p, k in ps[:fi] if k == 'naive']
    if not n: continue
    rn, rf = plays.get(st, {}).get(n[-1]), plays.get(st, {}).get(f[0])
    if not rn or not rf: continue
    for i, lag in enumerate([0, 6, 12]):
        a, b = cell(rn[i]), cell(rf[i])
        ok = a[0] != b[0] and a[1] != b[1] and a[1] >= 0 and b[1] >= 0
        bad += not ok
        print(f'| {st} | {act} | {lag} | {a[0]}@{a[1]} ({a[2]}) | {b[0]}@{b[1]} ({b[2]}) | {"yes" if ok else "SAME"} |')
print(f'\npairs not meeting the bar: {bad}')
