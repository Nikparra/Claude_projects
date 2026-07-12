# Task: populate real product cutout images

Goal: give every camera and lens in `data.js` camerasize.com-style imagery —
clean product cutouts, scaled to the millimeter. The renderer (`app.js`) is
finished and tested; this task is pure asset collection + calibration.
This file is written for a Claude session running WITH network access.

## What to collect, per camera (15 bodies in data.js)

| view  | shot                                            | used for              |
|-------|--------------------------------------------------|-----------------------|
| top   | top plate seen from directly above, body only    | depth comparison      |
| front | straight-on front                                | width × height        |
| rear  | straight-on back (LCD side)                      | width × height        |

Per lens (37 in data.js): one upright side profile (lens standing on its
mount, barrel vertical). Note whether the mount is at the bottom (typical) or
top of the image.

Sources, in order of preference:
1. Manufacturer product/press pages (fujifilm-x.com, fujifilm-dsc.com,
   explore.omsystem.com, sigma-global.com) — these publish exactly these
   angles on white backgrounds; it is what camerasize itself uses.
2. dpreview.com product pages.
3. Wikimedia Commons — verify the angle by actually viewing the image.

Do NOT download images from camerasize.com.

## Processing each image

```bash
pip install pillow   # once
python3 tools/prep-image.py raw.jpg images/<id>-<view>.png
```

`prep-image.py` makes the background transparent and trims to the content
bounding box. VIEW each result — if background remnants or shadows survive,
adjust `--threshold` (lower = more aggressive). File naming must be exactly
`images/<id>-<view>.png` using ids from data.js: e.g.
`images/fujifilm-x-t5-top.png`, `images/xf-16-55-ii-top.png` (lenses use
view name `top`). The app auto-prefers these local files.

## Calibration in data.js

Because prep-image.py trims to content, calibration is simple:

- **top**: `photos.top = { src: 'images/<id>-top.png', widthMM: <body width>,
  backFrac: <fraction of image height, from bottom, where the LCD back plane
  sits> }`. For a body-only top shot, content spans eyecup-rear → body-front:
  backFrac ≈ eyecup depth / total content depth (≈ 0.1–0.15 for center-EVF
  bodies, ≈ 0.05 for rangefinder style, 0 for no protrusion). Set
  `includesLens: true` only if a lens is mounted in the shot.
- **front / rear**: `{ src, widthMM: <body width> }` — add `baseFrac` only if
  the image content extends below the camera base (shadows should already be
  trimmed).
- **lens**: `photo = { src: 'images/<id>-top.png' }` — diameter/length default
  to the spec values; add `mountEnd: 'top'` if the mount is at the top of the
  image.

Widths: after trimming, content width = physical width, so `widthMM` is just
the spec width for straight-on shots. If a top shot includes a protruding
grip wider than the body plate, widthMM stays the body width spec (the spec
width includes the grip).

## Verify before pushing

1. `node tools/fetch-images.mjs` should report nothing to download (all local).
2. Open index.html with Playwright (chromium at /opt/pw-browsers/chromium),
   screenshot top/front/rear views for several camera+lens combos, and CHECK:
   silhouettes plausible, no giant/tiny outliers, lens sits on the mount,
   LCD-back alignment sensible. The per-camera nudge slider exists for small
   depth corrections — do not chase perfection, chase "obviously right".
3. Commit images + data.js calibration, push to the project branch —
   GitHub Pages redeploys automatically.

## Still missing (as of the first collection pass)

All Fujifilm XF lenses and these body views:

- `images/fujifilm-x-t50-rear.png`
- `images/fujifilm-x-h2-top.png`
- `images/fujifilm-x-h2s-top.png`
- `images/fujifilm-x-h2s-rear.png`
- `images/fujifilm-x-s20-top.png`
- `images/fujifilm-x-s20-front.png`
- `images/fujifilm-x-s20-rear.png`
- `images/fujifilm-x-pro3-top.png`
- `images/om-system-om-1-ii-rear.png`
- `images/om-system-om-5-rear.png`
- `images/xf-16-55-ii-top.png`
- `images/xf-18-55-top.png`
- `images/xf-16-80-top.png`
- `images/xf-70-300-top.png`
- `images/xf-50-140-top.png`
- `images/xf-10-24-top.png`
- `images/xf-150-600-top.png`
- `images/xf-18-f14-top.png`
- `images/xf-23-f14-top.png`
- `images/xf-33-f14-top.png`
- `images/xf-35-f14-top.png`
- `images/xf-56-f12-top.png`
- `images/xf-27-f28-top.png`
- `images/mz-12-100-top.png`
- `images/mz-40-150-f28-top.png`
- `images/sigma-16-f14-mft-top.png`
- `images/sigma-30-f14-mft-top.png`
- `images/sigma-56-f14-mft-top.png`
