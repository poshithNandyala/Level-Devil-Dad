# QA scratch: crop one panel of a builder sheet at its own pixel size (about a phone's width)
import sys
from PIL import Image
src, col, row, out = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
im = Image.open(src)
w, h = im.size
pw, ph = w // 3, h // 5
im.crop((col * pw, row * ph, (col + 1) * pw, (row + 1) * ph)).save(out)
