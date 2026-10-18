#!/usr/bin/env python3
"""Image -> braille-dot portrait (2x4 dots per character: crisp line art in any monospace font).
Usage: python3 scripts/image_to_ascii.py ~/Downloads/gojo_pfp.jpg [cols=70] [threshold=0.5]  -> src/data/portrait.txt"""
import sys
from PIL import Image, ImageFilter, ImageOps

src = sys.argv[1]
cols = int(sys.argv[2]) if len(sys.argv) > 2 else 70
thr = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5
im = ImageOps.autocontrast(Image.open(src).convert("L"))
bbox = ImageOps.invert(im).point(lambda p: 255 if p > 40 else 0).getbbox()
if bbox:
    im = im.crop(bbox)
W = cols * 2
H = round(im.height * W / im.width / 4) * 4
im = im.filter(ImageFilter.MinFilter(3)).resize((W, H), Image.BOX)  # slight thickening keeps hairlines alive
px = im.load()
bits = [(0, 0, 0x01), (0, 1, 0x02), (0, 2, 0x04), (1, 0, 0x08), (1, 1, 0x10), (1, 2, 0x20), (0, 3, 0x40), (1, 3, 0x80)]
lines = []
for y in range(0, H, 4):
    row = ""
    for x in range(0, W, 2):
        m = 0
        for dx, dy, b in bits:
            if px[x + dx, y + dy] < 255 * (1 - thr) + 255 * thr * 0.5 - 20 + (thr - 0.5) * 100:
                m |= b
        row += chr(0x2800 + m)
    lines.append(row.rstrip("⠀"))
open("src/data/portrait.txt", "w").write("\n".join(lines) + "\n")
print(f"{cols} cols x {len(lines)} rows")
