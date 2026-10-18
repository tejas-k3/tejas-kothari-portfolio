#!/usr/bin/env python3
"""Structure-based ASCII art (glyph shape matching): each text cell picks the character whose glyph bitmap best matches
the ink in that part of the image, which keeps outlines crisp (tone ramps blur line art).
Usage: python3 scripts/make_portrait.py ~/Downloads/gojo_pfp.jpg [cols=96]   -> src/data/portrait.txt"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

src = sys.argv[1]; COLS = int(sys.argv[2]) if len(sys.argv) > 2 else 96
CW, CH = 8, 16
FONT = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 14)
chars = " .,'`:;-_~=+*/\\|!()[]{}<>^v7iltrxzcunoeaszOo#%@&MW"
def glyph(c):
    im = Image.new("L", (CW, CH), 0); ImageDraw.Draw(im).text((0, 0), c, font=FONT, fill=255)
    return np.asarray(im, dtype=np.float32) / 255
G = np.stack([glyph(c) for c in chars])           # (n, CH, CW)

im = ImageOps.autocontrast(Image.open(src).convert("L"))
bb = ImageOps.invert(im).point(lambda p: 255 if p > 40 else 0).getbbox(); im = im.crop(bb)
rows = round(im.height / im.width * COLS * CW / CH)
ink = ImageOps.invert(im).filter(ImageFilter.MaxFilter(5)).resize((COLS * CW, rows * CH), Image.LANCZOS)
A = np.asarray(ink, dtype=np.float32) / 255
A = np.clip((A - 0.05) * 2.4, 0, 1)
lines = []
for r in range(rows):
    line = ""
    for c in range(COLS):
        cell = A[r * CH:(r + 1) * CH, c * CW:(c + 1) * CW]
        if cell.mean() < 0.02: line += " "; continue
        err = ((G - cell) ** 2).sum(axis=(1, 2))
        line += chars[int(err.argmin())]
    lines.append(line.rstrip())
open("src/data/portrait.txt", "w").write("\n".join(lines) + "\n")
print(f"{COLS}x{rows}")
