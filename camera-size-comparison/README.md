# Camera Size Comparison

A single-page, dependency-free web app for comparing camera body and lens sizes
to scale — inspired by camerasize.com, rebuilt with a cleaner UI and one key
difference: in the top-down view, cameras are aligned at the **back of the LCD**
(not the eyecup), with a per-camera **nudge slider** for manual fine-tuning.

Open `index.html` in any browser — no build step, no server, no dependencies.

## Features

- **Top view (body + lens)** — the depth comparison. All cameras share an
  alignment plane (back of LCD by default; eyecup, mount flange, or lens front
  also available) with a mm ruler and a ±20 mm nudge slider per camera.
- **Front view** and **rear view** — width × height to scale, with EVF hump,
  grip hint, LCD and control schematics.
- **Overlay mode** — superimposes silhouettes instead of side-by-side.
- **Spec table** — dimensions, weights, kit weight, and LCD-to-lens-front depth.
- **Shareable links** — the full comparison state lives in the URL hash
  (`Copy link` button).
- Dark/light theme follows the system preference.

## Photos

The app renders **real product photos to scale** wherever a photo is defined,
and falls back to the schematic drawing for anything missing, still loading,
or broken — so partial photo coverage is always safe. Toggle between the two
with the **Photos** checkbox.

For each photo the app tries, in order:

1. `images/<id>-<view>.png` / `.jpg` — a local copy in this repo
2. the remote `src` URL from `data.js` (loaded by *your* browser)
3. the schematic drawing

Run `node tools/fetch-images.mjs` once (on a machine with normal internet
access) to download every remote photo into `images/`, making the site
self-contained and independent of third-party hosts.

### Photo schema and calibration

```js
// on a camera:
photos: {
  top:   { src: 'images/… or https://…',
           widthMM: 129.5,      // real-world width the image spans (default: body width)
           backFrac: 0.07,      // fraction of image height (from the bottom) where the
                                //   LCD-back plane sits — this is the alignment anchor
           includesLens: false  // true if the shot already has a lens mounted
         },
  front: { src: '…', widthMM: 129.5 },
  rear:  { src: '…', widthMM: 129.5 },
},

// on a lens (upright side profile, mount at the bottom):
photo: { src: '…', diameterMM: 78.3, lengthMM: 95, mountEnd: 'bottom' /* or 'top' */ },
```

Calibration tips: `widthMM` is the physical width of what the image actually
shows edge-to-edge — if the photo has padding around the camera, increase it
proportionally (a photo where the body occupies 90% of the width needs
`widthMM = bodyWidth / 0.9`). Get depth alignment right with `backFrac`, or
just eyeball it with the per-camera nudge slider. Photos should be straight-on
shots (top plate from directly above; front/rear straight on), ideally with a
transparent or white background.

To add photos, the easiest path is a Claude session on your own machine:

> "Find clean top-down and front product photos for the X-T5 and OM-3, download
> them into camera-size-comparison/images/, and wire them into data.js with
> calibrated widthMM/backFrac."

## Data

All dimensions and weights come from manufacturer-published specifications
(sources recorded per entry in `data.js`). Renderings are schematic:
width/height/depth, lens diameter/length and — where published — minimum body
depth are exact; grip curves, hump shapes and control positions are stylized.

Current coverage: Fujifilm X + X100VI, OM System / Olympus Micro Four Thirds
bodies; Fujifilm XF, OM System / Olympus M.Zuiko, and Sigma lenses for both
mounts.

## Adding cameras or lenses

Everything lives in `data.js` as plain JSON-style objects — ask Claude (or edit
by hand):

> "Add the Fujifilm X-T30 II and the XF 90mm F2 to the camera size comparison
> project, using manufacturer specs."

### Camera schema

```js
{
  id: 'fujifilm-x-t5',        // unique kebab-case id (used in share URLs)
  brand: 'Fujifilm',
  name: 'X-T5',
  mount: 'X',                 // 'X' | 'MFT' | 'fixed' (fixed-lens compacts)
  sensor: 'APS-C',
  widthMM: 129.5, heightMM: 91, depthMM: 63.8,
  depthMinMM: 35,             // optional: published minimum depth (thinnest point)
  weightG: 557,               // with battery + card
  evf: 'center',              // 'center' | 'corner' | 'none'
  grip: 'small',              // 'deep' | 'medium' | 'small' | 'flat'
  // fixed-lens cameras only:
  // fixedLensName: '23mm f/2', fixedLensProtrusionMM: 22.1, fixedLensDiameterMM: 55,
  source: 'https://…',
}
```

### Lens schema

```js
{
  id: 'xf-33mm-f1-4',
  brand: 'Fujifilm',          // 'Fujifilm' | 'Sigma' | 'OM System' | 'Olympus'
  mount: 'X',                 // must match a camera mount to appear in its picker
  name: 'XF 33mm F1.4 R LM WR',
  focal: '33mm', aperture: 'F1.4',
  diameterMM: 67, lengthMM: 73.5, weightG: 360, filterMM: 58,
  source: 'https://…',
}
```

`DEFAULT_SLOTS` at the bottom of `data.js` controls what loads when the page is
opened without a share URL.
