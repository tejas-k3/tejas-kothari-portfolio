#!/usr/bin/env python3
"""Generate 1200x630 social cards into public/og/. Run: python3 scripts/make_og.py"""
from PIL import Image, ImageDraw, ImageFont
F = "/System/Library/Fonts/Helvetica.ttc"
def font(sz, idx=1):
    try: return ImageFont.truetype(F, sz, index=idx)
    except Exception: return ImageFont.load_default()
cards = {
  "home": ("Tejas Kothari", "Senior Software Engineer · Distributed Systems", "I engineer code that writes code that runs code that ships."),
  "rupee-engine": ("₹ Rupee Engine", "Algorithmic market-analysis system", "Case study by Tejas Kothari"),
  "system-design-playground": ("System Design Playground", "Sketch a system. Send traffic. Watch it break.", "Case study by Tejas Kothari"),
}
for slug, (t, s, f) in cards.items():
    im = Image.new("RGB", (1200, 630), "#0b0d10"); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 12, 630], fill="#ffb454")
    d.text((80, 190), t, font=font(86, 1), fill="#eceae4")
    d.text((80, 320), s, font=font(40, 0), fill="#ffb454")
    d.text((80, 520), f, font=font(28, 0), fill="#9aa0ab")
    im.save(f"public/og/{slug}.png", optimize=True)
print("ok")
