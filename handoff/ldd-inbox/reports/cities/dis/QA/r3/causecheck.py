# QA round 2: every scripted play's actual cause at lag 0/6/12 against the cause its label expects
import re
sweep = open('sweep-lag-captured.txt').read()
labels = open('labels.txt').read().splitlines()
plays = {}
for m in re.finditer(r'^(DIS-\d\d): checked .*?\[(.*)\]$', sweep, re.M):
    plays[m[1]] = {k: v.split('/') for k, v in re.findall(r'(naive|fix|m\d+):(\S+(?: @\d+@t\d+)?(?:/\S+(?: @\d+@t\d+)?)*)', m[2])}
cur = None; n = 0; bad = 0
for l in labels:
    h = re.match(r'(DIS-\d\d) naive \[(\S+)\].*\| fix \[(\S+)\]', l)
    exp = []
    if h:
        cur = h[1]; exp = [('naive', h[2]), ('fix', h[3])]
    a = re.match(r'\s+(m\d+) \[(\S+)\] (.*)', l)
    if a and cur: exp = [(a[1], a[2])]
    for k, c in exp:
        if c == '-' or k not in plays.get(cur, {}): continue
        got = [re.search(r'=(\S+) @(\d+)@t(\d+)', x) for x in plays[cur][k]]
        s = ' / '.join(f'{g[1]}@{g[3]} x{g[2]}' if g else 'nodeath' for g in got)
        ok = all(g and g[1] == c for g in got)
        n += 1
        if not ok: bad += 1
        print(f'{"ok " if ok else "BAD"} {cur} {k} expects {c}: {s}')
print(f'plays {n}, mismatches {bad}')
