#!/usr/bin/env python3
"""Prepare a raw product photo for the size-comparison renderer.

Takes a product shot on a white/near-white (or already transparent)
background, makes the background transparent, trims to the content's
bounding box, and writes a PNG. The tight trim is what makes calibration
easy: after trimming, the image content IS the object, so widthMM in
data.js is just the object's real width.

Usage:
  python3 tools/prep-image.py input.jpg images/fujifilm-x-t5-top.png
  python3 tools/prep-image.py input.png out.png --threshold 245
"""
import argparse
from PIL import Image

def prep(src: str, dest: str, threshold: int) -> None:
    im = Image.open(src).convert('RGBA')
    px = im.load()
    w, h = im.size
    # flood-ish: any near-white pixel becomes transparent (product shots
    # have clean backgrounds, so a global threshold is enough)
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0 or (r >= threshold and g >= threshold and b >= threshold):
                px[x, y] = (r, g, b, 0)
    bbox = im.getbbox()  # bounding box of non-transparent content
    if bbox is None:
        raise SystemExit(f'{src}: image is entirely background at threshold {threshold}')
    im = im.crop(bbox)
    im.save(dest, 'PNG')
    print(f'{dest}: {im.width}x{im.height} (trimmed from {w}x{h})')

if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('src')
    p.add_argument('dest')
    p.add_argument('--threshold', type=int, default=248,
                   help='RGB level above which a pixel counts as background (default 248)')
    a = p.parse_args()
    prep(a.src, a.dest, a.threshold)
