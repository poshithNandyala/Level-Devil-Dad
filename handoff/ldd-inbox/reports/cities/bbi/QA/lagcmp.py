# QA scratch: from qa6's death log, list plays whose cause changes with lag, and pairs that die to one cause
import re, sys
rows = {}
for line in open(sys.argv[1]):
    m = re.match(r'(\S+) (\S+) lag(\d+) (.*)', line.strip())
    if not m:
        continue
    sid, k, lag, rest = m.groups()
    c = re.search(r'died: (\S+) @(\d+) tick(\d+)', rest)
    rows.setdefault((sid, k), {})[int(lag)] = (c.group(1), int(c.group(2)), int(c.group(3))) if c else ('NODEATH', -1, -1)
for (sid, k), d in sorted(rows.items()):
    causes = {v[0] for v in d.values()}
    line = ' '.join(f'lag{l}:{v[0]}@x{v[1]}t{v[2]}' for l, v in sorted(d.items()))
    flag = 'CHANGES' if len(causes) > 1 else ''
    print(f'{sid} {k} {line} {flag}')
