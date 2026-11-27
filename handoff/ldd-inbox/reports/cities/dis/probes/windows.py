# Repeat-window probe (DIS round 3). Input: the replay probe's "ACT" and "T" lines (dis-replay.test.ts.txt).
# A window = a run of consecutive 0.5 s sample points along the route whose lag-0 signature (what stop / run / jump die
# of from there) is the same and has at least one death. Two windows in one act are identical when they have the same
# signature and the same length (0.5 s steps). Reported per act: windows, and identical repeats beyond the first.
import re, sys, collections
acts = collections.defaultdict(list)   # stage -> [(kind, x0)]
pts = collections.defaultdict(list)    # stage -> [(t, x, sig)]
for f in sys.argv[1:]:
    for l in open(f):
        m = re.match(r"ACT (DIS-\d+) (\S+) ([\d.]+)", l)
        if m: acts[m[1]].append((m[2], float(m[3]))); continue
        m = re.match(r"T (DIS-\d+) ([\d.]+) ([\d.]+) (.*)", l)
        if m: pts[m[1]].append((float(m[2]), float(m[3]), m[4].strip()))
for st in sorted(pts):
    a = sorted(set(acts[st]), key=lambda k: k[1])
    def act_of(x):
        k = 'room'
        for kind, x0 in a:
            if x >= x0: k = kind
        return k
    segs = []  # (act, sig, n)
    for t, x, sig in pts[st]:
        ak = act_of(x)
        if segs and segs[-1][0] == ak and segs[-1][1] == sig: segs[-1][2] += 1
        else: segs.append([ak, sig, 1])
    per = collections.OrderedDict()
    for ak, sig, n in segs:
        if all(p.endswith('=-') for p in sig.split()): continue
        per.setdefault(ak, collections.Counter())[(sig, n)] += 1
    for ak, c in per.items():
        rep = sum(v - 1 for v in c.values() if v > 1)
        worst = max(c.items(), key=lambda kv: kv[1])
        print(f"{st} | {ak} | windows {sum(c.values())} | identical repeats {rep}" + (f" | most repeated: {worst[1]}x {worst[0][1]*0.5:.1f}s [{worst[0][0]}]" if rep else ""))
