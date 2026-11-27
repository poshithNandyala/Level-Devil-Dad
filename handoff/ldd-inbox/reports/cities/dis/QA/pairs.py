# QA scratch: from the sweep's per-tick replay rows, pair each act's baited play with its other play (labels.txt order)
# and flag, per lag, a nodeath, or the same cause on both plays.
import re
sweep = open('sweep-lag-captured.txt').read()
labels = open('labels.txt').read().splitlines()
plays = {}
for m in re.finditer(r'^(DIS-\d\d): checked (\d+) plays at (\d+) distinct capture points, fails (\d+); longest stretch ([\d.]+) s; replay worst ([\d.]+) s \[(.*)\]$', sweep, re.M):
    st = m[1]
    print(f'{st}: plays {m[2]} caps {m[3]} fails {m[4]} longest {m[5]} s replay worst {m[6]} s')
    for tok in m[7].split(' m'):
        pass
    row = {}
    for part in re.findall(r'(naive|fix|m\d+):(\S+(?: @\d+@t\d+)?(?:/\S+(?: @\d+@t\d+)?)*)', m[7]):
        row[part[0]] = part[1].split('/')
    plays[st] = row
for l in sweep.splitlines():
    if 'nodeath' in l or 'did not win' in l or l.startswith('FAIL'):
        print('FLAG', l[:300])
# acts: label lines "  mK [cause] act: ..." and "  mK [cause] act (fix): ..."
cur = None
acts = {}
for l in labels:
    h = re.match(r'(DIS-\d\d) naive', l)
    if h: cur = h[1]; continue
    a = re.match(r'\s+m(\d+) \[(\S+)\] (\S+?)( \((fix|second[^)]*)\))?:', l)
    if a and cur:
        acts.setdefault((cur, a[3]), []).append(('m' + a[1], a[5] or 'naive'))
for (st, act), ps in acts.items():
    if len(ps) < 2: continue
    n = [p for p, k in ps if k == 'naive']; f = [p for p, k in ps if k == 'fix']
    if not n or not f: continue
    rn, rf = plays[st].get(n[0]), plays[st].get(f[0])
    for i, lag in enumerate([0, 6, 12]):
        cn = re.search(r'=(\S+) @\d+@t(\d+)', rn[i]); cf = re.search(r'=(\S+) @\d+@t(\d+)', rf[i])
        s = f'{st} {act} lag{lag}: baited {cn[1]}@{cn[2]} other {cf[1]}@{cf[2]}'
        if cn[1] == cf[1] or cn[2] == cf[2]: s = 'SAME ' + s
        print(s)
