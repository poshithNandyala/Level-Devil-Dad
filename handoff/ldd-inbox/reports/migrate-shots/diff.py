# python3 diff.py A_DIR B_DIR [CODE...]: per image, count of differing pixels and their bounding box
import sys, os
from PIL import Image, ImageChops
a, b = sys.argv[1], sys.argv[2]
codes = sys.argv[3:]
tot = 0
for f in sorted(os.listdir(a)):
    if not f.endswith('.png') or (codes and f[:3] not in codes):
        continue
    if not os.path.exists(os.path.join(b, f)):
        print(f, 'MISSING'); tot += 1; continue
    ia = Image.open(os.path.join(a, f)).convert('RGB'); ib = Image.open(os.path.join(b, f)).convert('RGB')
    d = ImageChops.difference(ia, ib)
    n = sum(1 for p in d.getdata() if p != (0, 0, 0))
    tot += n
    print(f, n, d.getbbox() or '')
print('TOTAL', tot)
