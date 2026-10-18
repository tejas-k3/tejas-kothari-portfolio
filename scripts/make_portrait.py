#!/usr/bin/env python3
"""8-bit side-view sprite (facing left), authored by hand as a bitmap. Each pixel renders as 2 characters.
Legend: # dark (shades / collar / outline)  h hair  o skin  . empty.   Run: python3 scripts/make_portrait.py"""
BMP = [
"........h.....h....h....",
".......hhh...hhh..hhh...",
"......hhhhh.hhhhh.hhhh..",
".....hhhhhhhhhhhhhhhhhh.",
"....hhhhhhhhhhhhhhhhhhhh",
"....hhhhhhhhhhhhhhhhhhh.",
"....hhhooooohhhhhhhhhhh.",
"....hhoooooooohhhhhhhh..",
"...#oooooooooohhhhhhhh..",
"...#o############hhhhh..",
"...#o##.######.##hhhhh..",
"..#oo############ohhhh..",
"..#ooo##########oooohh..",
".##ooooooooooooooooooh..",
"##oooooooooooooooooo....",
"#o#ooooooooooooooooo....",
".##oooooooooooooooo.....",
"..#oooo####ooooooooo....",
"..#ooooooooooooooooo....",
"...#ooooooooooooooo.....",
"....##oooooooooooo......",
".....###ooooooooo.......",
".......#ooooooooo.......",
".......#ooooooooo.......",
"....########oo#######...",
"..####################..",
".######################.",
]
W = max(len(r) for r in BMP)
glyph = {"#": "██", "h": "▓▓", "o": "░░", ".": "  "}
out = ["".join(glyph[c] for c in r.ljust(W, ".")).rstrip() for r in BMP]
open("src/data/portrait.txt", "w").write("\n".join(out) + "\n")
print("\n".join(out))
