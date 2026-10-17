#!/usr/bin/env python3
"""Convert a (line-art or photo) image into src/data/portrait.txt.
Usage: python3 scripts/image_to_ascii.py ~/Downloads/gojo_pfp.jpg [cols=84]
Dark pixels become dense characters; light background stays empty (so it glows on dark theme)."""
import sys
from PIL import Image, ImageFilter, ImageOps

src = sys.argv[1]
cols = int(sys.argv[2]) if len(sys.argv) > 2 else 84
ramp = " .'`,:;-~+=*x%#@"  # light -> dark
im = ImageOps.autocontrast(Image.open(src).convert("L"))
# crop whitespace
bbox = ImageOps.invert(im).point(lambda p: 255 if p > 40 else 0).getbbox()
if bbox:
    pad = 12
    im = im.crop((max(0, bbox[0]-pad), max(0, bbox[1]-pad), min(im.width, bbox[2]+pad), min(im.height, bbox[3]+pad)))
cell_w = im.width / cols
cell_h = cell_w * 2.0  # terminal cells are ~2x taller than wide
rows = int(im.height / cell_h)
im = im.filter(ImageFilter.MinFilter(7))  # thicken thin ink lines so they survive downscale
im = im.resize((cols, rows), Image.BOX)
px = im.load()
lines = []
for y in range(rows):
    line = ""
    for x in range(cols):
        v = 1 - px[x, y] / 255  # ink amount 0..1
        v = min(1, max(0, (v - 0.02) * 2.2)) ** 0.7
        line += ramp[int(v * (len(ramp) - 1))]
    lines.append(line.rstrip())
open("src/data/portrait.txt", "w").write("\n".join(lines) + "\n")
print(f"{cols}x{rows} -> src/data/portrait.txt")
