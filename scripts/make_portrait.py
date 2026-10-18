#!/usr/bin/env python3
"""Pixel-art portrait (spiky hair, sunglasses with glint, smirk). Authored as the LEFT half of a bitmap, mirrored,
then rendered with half-block characters (2 pixel rows per text row). Run: python3 scripts/make_portrait.py"""
HALF = [
"...............#",
"......#........#",
"......##......##",
"..#...###....###",
"..##..####..####",
".###..##########",
"################",
"################",
"##.............#",
"##..............",
"#.##############",
"#.##..##########",
"#.##############",
"#..##############"[:16],
"#...############",
"#....#########..",
"#...............",
"#.......#.......",
"#......##.......",
"#...............",
"#....#..........",
"#.....##########",
".#..............",
"..#.............",
"...##...........",
".....#######....",
"......#.........",
"..###.##........",
".#####.###......",
"########.###....",
"################",
"################",
]
full = [r + r[::-1] for r in HALF]
if len(full) % 2: full.append("." * len(full[0]))
out = []
for y in range(0, len(full), 2):
    line = ""
    for x in range(len(full[0])):
        t, b = full[y][x] == "#", full[y + 1][x] == "#"
        line += "█" if t and b else "▀" if t else "▄" if b else " "
    out.append(line.rstrip())
open("src/data/portrait.txt", "w").write("\n".join(out) + "\n")
print("\n".join(out))
