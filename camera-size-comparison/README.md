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
