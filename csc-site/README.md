# Camera Size Comparison

Visual, top-down size comparison of complete camera + lens setups at true
relative scale. Inspired by camerasize.com/compact, rebuilt as a clean,
mobile-friendly static app. Personal, non-commercial project.

**Launch coverage:** Fujifilm (X-E5, X-T5, X-H2S), OM System (OM-1 Mark II,
OM-3), lenses XF 16-50mm F2.8-4.8, XF 16-55mm F2.8 II, Sigma 18-50mm F2.8
DC DN (X-mount), M.Zuiko 12-40mm F2.8 PRO II.

## How it works

- **Physical specs vs. visual calibration are separate.** `data/products.js`
  stores manufacturer-published mm/g (with source URLs) apart from image
  calibration (px-per-mm, anchor positions, view orientation, status).
- **One global scale** (px per mm). Bodies are scaled from published width;
  lenses from published max diameter, with the front element placed exactly
  `lengthMm` ahead of the flange plane — so even an imperfect photo cannot
  distort the physical math.
- **Alignment** uses the rear LCD surface as the shared baseline. Each setup
  can be nudged ±1 mm (buttons, drag, or arrow keys).
- **Save/share:** comparisons persist in localStorage; the Share button
  encodes the full state in the URL fragment (no server).
- **Statuses:** every product shows chips — `mfr specs` (published numbers),
  image `verified` / `calibrated estimate` / `pending` (dimension-accurate
  placeholder drawn instead of a photo).

## Files

- `index.html`, `styles.css`, `app.js` — the app (no build step, no framework)
- `admin.html`, `admin.js` — visual anchor calibration; saves per-browser
  overrides and exports JSON to make permanent
- `data/products.js` — product database (specs + calibration + credits)
- `images/` — processed transparent PNGs (tight-cropped)
- `tools/` — Python utilities: `process_image.py` (background removal + crop),
  `overlay.py` (calibration overlays), `verify.py` (headless render checks +
  desktop/mobile screenshots)

## Adding a product

Ask Claude ("add the X100VI") — it will verify specs, source and process an
image, calibrate anchors, and update `data/products.js`. Manual route: drop a
processed PNG in `images/`, add a product entry, then fine-tune anchors on the
Calibrate page and export.

## Run locally

Open `index.html` directly, or `python3 -m http.server` for a local server.
Deploy by copying the folder to any static host (GitHub Pages, Cloudflare
Pages, Netlify, Vercel).

## Accuracy statement

Dimensions and weights are manufacturer specifications (sources in
`data/products.js`). Rendered proportions are exact for published dimensions;
anchor placement (LCD plane, mount position) is visually calibrated and
labeled per product. Product photos remain © their manufacturers/sources;
credits in-app.
