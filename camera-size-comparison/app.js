/* Camera Size Comparison — schematic renderer
 * All drawing is done in millimetres and scaled to px by state.zoom.
 * Geometry beyond published W×H×D (grip depth, EVF hump, eyecup) is
 * approximated from each camera's `grip` / `evf` classification — the
 * per-camera "nudge" slider exists to correct any residual misalignment.
 */

const COLORS = ['#4da3ff', '#ff8a5c', '#5fd0a0', '#e4c05c', '#c792ea', '#ff7fa5', '#6ee0e6', '#b7d96a'];
const NS = 'http://www.w3.org/2000/svg';
const GAP_MM = 16;           // gap between cameras, in mm at current scale
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const state = {
  slots: [],                 // {camId, lensId|null, nudge}
  align: 'lcd',
  zoom: 2.2,
  overlay: false,
  photoMode: true,           // use real photos where available
};

/* ---------- photo loading ----------
 * A photo spec ({src, widthMM?, ...}) may point at a remote URL or a local
 * file. We always try the local mirror (images/<id>-<view>.png|.jpg, which
 * tools/fetch-images.mjs populates) before the remote src, and fall back to
 * the schematic drawing when nothing loads.
 */
const IMG = new Map();       // url -> {status: 'loading'|'ok'|'fail', w, h}
let renderQueued = false;
function scheduleRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => { renderQueued = false; update(); });
}
function probeImage(url) {
  let rec = IMG.get(url);
  if (rec) return rec;
  rec = { status: 'loading', w: 0, h: 0 };
  IMG.set(url, rec);
  const im = new Image();
  im.onload = () => { rec.status = 'ok'; rec.w = im.naturalWidth; rec.h = im.naturalHeight; scheduleRender(); };
  im.onerror = () => { rec.status = 'fail'; scheduleRender(); };
  im.src = url;
  return rec;
}
/* Resolve a usable photo for `id` + `view`; null if none loaded (yet). */
function getPhoto(id, view, spec) {
  if (!state.photoMode || !spec || !spec.src) return null;
  const candidates = spec.src.startsWith('data:') ? [spec.src]
    : [`images/${id}-${view}.png`, `images/${id}-${view}.jpg`, spec.src];
  for (const url of candidates) {
    const rec = probeImage(url);
    if (rec.status === 'ok') return { url, w: rec.w, h: rec.h, spec };
    if (rec.status === 'loading') return null;   // wait; schematic in the meantime
  }
  return null;
}
function photoEl(ph, xPx, yPx, wPx, hPx, extra = {}) {
  return el('image', { href: ph.url, x: xPx, y: yPx, width: wPx, height: hPx,
    preserveAspectRatio: 'xMidYMid meet', ...extra });
}

const camById = id => CAMERAS.find(c => c.id === id);
const lensById = id => LENSES.find(l => l.id === id);

/* ---------- derived geometry (mm) ---------- */

function geom(cam) {
  const gripFrac = { deep: 0.58, medium: 0.70, small: 0.82, flat: 0.92 }[cam.grip] ?? 0.8;
  const fixedProt = cam.fixedLensProtrusionMM || 0;
  const depth = cam.depthMM - fixedProt;                       // body depth incl. grip
  // Slab depth without the grip: prefer the manufacturer's published
  // "minimum depth" (thinnest point) when available, else estimate.
  const core = cam.depthMinMM
    ? Math.min(cam.depthMinMM + 3, depth)
    : Math.max(depth * gripFrac, 26);
  const eyecup = { center: 9, corner: 4, none: 0 }[cam.evf] ?? 0;
  // Front-most point of the body/grip. Some makers (Fujifilm) quote depth
  // including the eyecup protrusion; others (OM System) exclude it.
  const gripFront = cam.depthInclEyecup ? depth - eyecup : depth;
  const humpH = cam.evf === 'center' ? Math.min(13, cam.heightMM * 0.15) : 0;
  const humpW = clamp(cam.widthMM * 0.28, 28, 42);
  const gripW = cam.grip === 'flat' ? 0 : clamp(cam.widthMM * 0.24, 24, 38);
  const mountX = cam.widthMM * 0.5 - (cam.grip === 'deep' ? 4 : cam.grip === 'medium' ? 2 : 0);
  const mountExt = cam.mount === 'X' ? 47 : cam.mount === 'MFT' ? 45 : (cam.fixedLensDiameterMM || 60) + 2;
  return { depth, core, eyecup, gripFront, humpH, humpW, gripW, mountX, mountExt, fixedProt };
}

/* Effective lens for a slot: real lens, built-in fixed lens, or null. */
function slotLens(slot, cam) {
  if (cam.mount === 'fixed') {
    return {
      name: cam.fixedLensName || 'built-in lens',
      diameterMM: cam.fixedLensDiameterMM || 60,
      lengthMM: cam.fixedLensProtrusionMM || 20,
      weightG: 0, builtIn: true,
    };
  }
  return slot.lensId ? lensById(slot.lensId) : null;
}

/* Depth (z) of the alignment anchor in camera-local coords: z=0 is the LCD
 * back plane, +z points out the front of the lens. */
function anchorZ(cam, g, lens, mode) {
  switch (mode) {
    case 'eyecup': return -g.eyecup;
    case 'mount': return g.core;
    case 'front': return g.core + (lens ? lens.lengthMM : 0);
    default: return 0; // 'lcd'
  }
}

/* ---------- tiny svg helpers ---------- */

function el(name, attrs = {}, children = []) {
  const n = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  for (const c of children) n.appendChild(c);
  return n;
}
function txt(x, y, s, attrs = {}) {
  const t = el('text', { x, y, fill: 'currentColor', 'font-size': 11, ...attrs });
  t.textContent = s;
  return t;
}
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

/* ---------- top view (width × depth, lens pointing up) ---------- */
/* Returns {group, above, below, widthMM} — extents in mm relative to the
 * slot's anchor plane (above = toward lens front, below = behind). */

function drawTop(slot, cam, lens, color) {
  const g = geom(cam);
  const s = state.zoom;
  const az = anchorZ(cam, g, lens, state.align) - slot.nudge;
  const zy = z => -(z - az) * s;                 // camera-local z -> group y (px)
  const grp = el('g');
  const W = cam.widthMM * s;
  const body = css('--bg-raised') || '#181d24';
  const line = color;

  const rect = (x, z0, z1, w, r, fill, extra = {}) =>
    el('rect', {
      x: x * s, y: zy(z1), width: w * s, height: (z1 - z0) * s, rx: r,
      fill, stroke: line, 'stroke-width': 1.4, ...extra,
    });

  // draws the mounted lens (photo if available, else schematic); returns its front z
  const drawLens = () => {
    if (!lens) return g.core;
    const lensPh = lens.builtIn ? null : getPhoto(slot.lensId, 'top', lens.photo);
    if (lensPh) {
      const dMM = lensPh.spec.diameterMM || lens.diameterMM;
      const lMM = lensPh.spec.lengthMM || lens.lengthMM;
      const img = photoEl(lensPh, (g.mountX - dMM / 2) * s, zy(g.core + lMM), dMM * s, lMM * s,
        { preserveAspectRatio: 'xMidYMax meet' });
      if (lensPh.spec.mountEnd === 'top') {
        const cx = g.mountX * s, cyPx = zy(g.core + lMM / 2);
        img.setAttribute('transform', `rotate(180 ${cx} ${cyPx})`);
      }
      grp.appendChild(img);
      return g.core + lMM;
    }
    const lx = g.mountX - lens.diameterMM / 2;
    if (!lens.builtIn) {
      grp.appendChild(rect(g.mountX - g.mountExt / 2, g.core, g.core + 2.5, g.mountExt, 1.5, body));
    }
    grp.appendChild(rect(lx, g.core, g.core + lens.lengthMM, lens.diameterMM, 3, body));
    // ring bands
    for (const f of [0.30, 0.58]) {
      const z0 = g.core + lens.lengthMM * f;
      grp.appendChild(rect(lx + 1, z0, Math.min(z0 + lens.lengthMM * 0.12, g.core + lens.lengthMM - 2), lens.diameterMM - 2, 1, line, { 'fill-opacity': 0.15, 'stroke-width': 0 }));
    }
    // front bevel
    grp.appendChild(rect(lx + 2, g.core + lens.lengthMM - 2.5, g.core + lens.lengthMM - 0.5, lens.diameterMM - 4, 1, line, { 'fill-opacity': 0.5, 'stroke-width': 0 }));
    return g.core + lens.lengthMM;
  };

  // photo body: a calibrated top-down shot replaces the schematic body
  const camPh = getPhoto(cam.id, 'top', cam.photos?.top);
  if (camPh) {
    const wMM = camPh.spec.widthMM || cam.widthMM;
    const hMM = wMM * camPh.h / camPh.w;
    const backFrac = camPh.spec.backFrac ?? Math.min(g.eyecup / hMM, 0.3);
    const zBottom = -backFrac * hMM;
    grp.appendChild(photoEl(camPh, (cam.widthMM - wMM) / 2 * s, zy(zBottom + hMM), wMM * s, hMM * s));
    const frontZ = camPh.spec.includesLens ? g.core : drawLens();
    const topZ = Math.max(zBottom + hMM, frontZ);
    return { group: grp, widthMM: Math.max(cam.widthMM, wMM),
      above: topZ - az, below: Math.max(az - zBottom, az + g.eyecup), W };
  }

  // eyecup / rear EVF protrusion
  if (g.eyecup > 0) {
    const ew = cam.evf === 'center' ? g.humpW * 0.7 : 18;
    const ex = cam.evf === 'center' ? g.mountX - ew / 2 : 6;
    grp.appendChild(rect(ex, -g.eyecup, 0.5, ew, 3, body));
  }
  // body slab
  grp.appendChild(rect(0, 0, g.core, cam.widthMM, 4, body));
  // grip bulge (right side, extends to the front of the grip)
  if (g.gripW > 0 && g.gripFront > g.core + 1) {
    grp.appendChild(rect(cam.widthMM - g.gripW, 0, g.gripFront, g.gripW, 7, body));
  }
  // LCD strip along the rear edge
  const lcdW = Math.min(64, cam.widthMM * 0.55);
  grp.appendChild(rect(cam.widthMM * 0.5 - lcdW * 0.62, 0, 2.5, lcdW, 1, line, { 'fill-opacity': 0.55, 'stroke-width': 0 }));

  const frontZ = drawLens();
  return { group: grp, widthMM: cam.widthMM, above: frontZ - az, below: az + g.eyecup, W };
}

/* ---------- front view (width × height, mirrored L/R) ---------- */

function drawFront(slot, cam, lens, color) {
  const g = geom(cam);
  const s = state.zoom;
  const grp = el('g');            // origin: bottom-left of body, y up handled by caller via transform of rects
  const H = cam.heightMM;
  const body = css('--bg-raised') || '#181d24';
  const mx = (cam.widthMM - g.mountX);          // mirror: front view flips left/right

  const rect = (x, yTop, w, h, r, fill, extra = {}) =>
    el('rect', { x: x * s, y: (yTop - H) * s, width: w * s, height: h * s, rx: r, fill, stroke: color, 'stroke-width': 1.4, ...extra });
  const circ = (cx, cy, rMM, fill, extra = {}) =>
    el('circle', { cx: cx * s, cy: (cy - H) * s, r: rMM * s, fill, stroke: color, 'stroke-width': 1.4, ...extra });

  const camPh = getPhoto(cam.id, 'front', cam.photos?.front);
  if (camPh) {
    const wMM = camPh.spec.widthMM || cam.widthMM;
    const hMM = wMM * camPh.h / camPh.w;
    const baseFrac = camPh.spec.baseFrac || 0;   // image padding below the camera base
    const layoutW = Math.max(cam.widthMM, wMM);
    grp.appendChild(photoEl(camPh, (layoutW - wMM) / 2 * s, -hMM * (1 - baseFrac) * s, wMM * s, hMM * s));
    return { group: grp, widthMM: layoutW, heightMM: hMM * (1 - baseFrac) };
  }

  // main body below the hump line
  grp.appendChild(rect(0, g.humpH, cam.widthMM, H - g.humpH, 5, body));
  if (g.humpH > 0) {
    const hw = g.humpW, hx = mx - hw / 2;
    const p = `M ${(hx + 4) * s} ${-H * s} L ${(hx + hw - 4) * s} ${-H * s} L ${(hx + hw) * s} ${(g.humpH - H) * s} L ${hx * s} ${(g.humpH - H) * s} Z`;
    grp.appendChild(el('path', { d: p, fill: body, stroke: color, 'stroke-width': 1.4 }));
    grp.appendChild(rect(mx - 9, -1.5, 18, 1.8, 1, color, { 'fill-opacity': 0.5, 'stroke-width': 0 })); // hot shoe
  }
  // grip contour hint (viewer-left)
  if (g.gripW > 0) {
    grp.appendChild(el('path', {
      d: `M ${g.gripW * 0.9 * s} ${(g.humpH + 4 - H) * s} Q ${g.gripW * 0.55 * s} ${(H * 0.45 - H) * s} ${g.gripW * 0.9 * s} ${(H - 6 - H) * s}`,
      fill: 'none', stroke: color, 'stroke-width': 1, 'stroke-opacity': 0.45,
    }));
  }
  // viewfinder window for rangefinder bodies (front top-right)
  if (cam.evf === 'corner') {
    grp.appendChild(rect(cam.widthMM - 26, 6, 15, 9, 1.5, color, { 'fill-opacity': 0.35 }));
  }
  // lens stack: mount ring, barrel, front element
  const cy = g.humpH + (H - g.humpH) * 0.52;
  if (cam.mount !== 'fixed') grp.appendChild(circ(mx, cy, g.mountExt / 2, body));
  if (lens) {
    grp.appendChild(circ(mx, cy, lens.diameterMM / 2, body));
    grp.appendChild(circ(mx, cy, lens.diameterMM / 2 - 3, 'none', { 'stroke-opacity': 0.5, 'stroke-width': 1 }));
    grp.appendChild(circ(mx, cy, lens.diameterMM * 0.26, color, { 'fill-opacity': 0.25 }));
  }
  return { group: grp, widthMM: cam.widthMM, heightMM: H };
}

/* ---------- rear view (width × height) ---------- */

function drawRear(slot, cam, lens, color) {
  const g = geom(cam);
  const s = state.zoom;
  const grp = el('g');
  const H = cam.heightMM;
  const body = css('--bg-raised') || '#181d24';

  const rect = (x, yTop, w, h, r, fill, extra = {}) =>
    el('rect', { x: x * s, y: (yTop - H) * s, width: w * s, height: h * s, rx: r, fill, stroke: color, 'stroke-width': 1.4, ...extra });

  const camPh = getPhoto(cam.id, 'rear', cam.photos?.rear);
  if (camPh) {
    const wMM = camPh.spec.widthMM || cam.widthMM;
    const hMM = wMM * camPh.h / camPh.w;
    const baseFrac = camPh.spec.baseFrac || 0;   // image padding below the camera base
    const layoutW = Math.max(cam.widthMM, wMM);
    grp.appendChild(photoEl(camPh, (layoutW - wMM) / 2 * s, -hMM * (1 - baseFrac) * s, wMM * s, hMM * s));
    return { group: grp, widthMM: layoutW, heightMM: hMM * (1 - baseFrac) };
  }

  grp.appendChild(rect(0, g.humpH, cam.widthMM, H - g.humpH, 5, body));
  if (g.humpH > 0) {
    const hw = g.humpW, hx = g.mountX - hw / 2;
    const p = `M ${(hx + 4) * s} ${-H * s} L ${(hx + hw - 4) * s} ${-H * s} L ${(hx + hw) * s} ${(g.humpH - H) * s} L ${hx * s} ${(g.humpH - H) * s} Z`;
    grp.appendChild(el('path', { d: p, fill: body, stroke: color, 'stroke-width': 1.4 }));
  }
  // EVF eyepiece
  if (cam.evf === 'center') {
    grp.appendChild(rect(g.mountX - 12, g.humpH - 8, 24, 10, 3, color, { 'fill-opacity': 0.4 }));
  } else if (cam.evf === 'corner') {
    grp.appendChild(rect(7, 5, 20, 11, 3, color, { 'fill-opacity': 0.4 }));
  }
  // LCD
  const lcdW = Math.min(64, cam.widthMM - 26);
  const lcdH = lcdW * (cam.sensor === 'Micro Four Thirds' ? 0.70 : 0.66);
  const lcdY = g.humpH + (cam.evf === 'corner' ? 19 : 7);
  grp.appendChild(rect(cam.widthMM * 0.5 - lcdW * 0.62, lcdY, lcdW, Math.min(lcdH, H - lcdY - 6), 2, color, { 'fill-opacity': 0.22 }));
  // buttons column
  const bx = cam.widthMM * 0.5 + lcdW * 0.38 + 7;
  for (let i = 0; i < 4; i++) {
    grp.appendChild(el('circle', {
      cx: bx * s, cy: (lcdY + 8 + i * 9 - H) * s, r: 2.4 * s,
      fill: 'none', stroke: color, 'stroke-width': 1, 'stroke-opacity': 0.5,
    }));
  }
  return { group: grp, widthMM: cam.widthMM, heightMM: H };
}

/* ---------- view assembly ---------- */

function slotEntries() {
  return state.slots
    .map((slot, i) => {
      const cam = camById(slot.camId);
      if (!cam) return null;
      return { slot, cam, lens: slotLens(slot, cam), color: COLORS[i % COLORS.length], i };
    })
    .filter(Boolean);
}

function legendBlock(x, y, entries) {
  const g = el('g');
  entries.forEach((e, k) => {
    const line = `${e.cam.name}${e.lens ? ' + ' + e.lens.name : ''}`;
    g.appendChild(el('rect', { x, y: y + k * 16 - 8, width: 9, height: 9, rx: 2, fill: e.color }));
    g.appendChild(txt(x + 15, y + k * 16, line, { 'font-size': 11 }));
  });
  return g;
}

function labelBlock(x, entry, s) {
  const g = el('g');
  const { cam, lens } = entry;
  g.appendChild(txt(x, 16, `${cam.brand} ${cam.name}`, { 'font-weight': 600, fill: entry.color, 'font-size': 12, 'text-anchor': 'middle' }));
  g.appendChild(txt(x, 31, lens ? (lens.builtIn ? lens.name : `${lens.brand} ${lens.name}`) : 'body only', { 'text-anchor': 'middle', 'fill-opacity': 0.65, 'font-size': 10.5 }));
  g.appendChild(txt(x, 45, `${cam.widthMM} × ${cam.heightMM} × ${cam.depthMM} mm`, { 'text-anchor': 'middle', 'fill-opacity': 0.5, 'font-size': 10 }));
  return g;
}

function renderTop() {
  const svg = document.getElementById('svg-top');
  svg.replaceChildren();
  const entries = slotEntries();
  if (!entries.length) { svg.setAttribute('width', 0); svg.setAttribute('height', 0); return; }
  const s = state.zoom;
  const parts = entries.map(e => ({ e, d: drawTop(e.slot, e.cam, e.lens, e.color) }));
  const above = Math.max(...parts.map(p => p.d.above), 10) * s;
  const below = Math.max(...parts.map(p => p.d.below), 6) * s;
  const RULER = 56, PAD = 20, LABELS = state.overlay ? entries.length * 16 + 26 : 56;
  const baseY = PAD + above;

  let widths;
  if (state.overlay) {
    const maxW = Math.max(...parts.map(p => p.d.widthMM)) * s;
    widths = parts.map(() => maxW);
  }
  const totalW = state.overlay
    ? RULER + Math.max(...parts.map(p => p.d.widthMM)) * s + PAD * 2
    : RULER + parts.reduce((a, p) => a + p.d.widthMM * s + GAP_MM * s, 0) + PAD;
  const totalH = baseY + below + LABELS + PAD;
  svg.setAttribute('width', totalW);
  svg.setAttribute('height', totalH);
  svg.style.color = css('--text');

  drawDepthRuler(svg, RULER, baseY, above, below, s);
  // alignment plane
  svg.appendChild(el('line', { x1: RULER - 8, y1: baseY, x2: totalW - 6, y2: baseY, stroke: css('--text-dim'), 'stroke-dasharray': '5 5', 'stroke-width': 1 }));

  let x = RULER + PAD / 2;
  for (const { e, d } of parts) {
    const gx = state.overlay ? RULER + PAD / 2 + (Math.max(...parts.map(p => p.d.widthMM)) - d.widthMM) * s / 2 : x;
    const wrap = el('g', { transform: `translate(${gx}, ${baseY})` });
    if (state.overlay) { wrap.setAttribute('opacity', 0.82); d.group.querySelectorAll('rect,path').forEach(n => { if (n.getAttribute('fill') !== 'none') n.setAttribute('fill-opacity', 0.14); }); }
    wrap.appendChild(d.group);
    svg.appendChild(wrap);
    if (!state.overlay) {
      const lbl = labelBlock(gx + d.widthMM * s / 2, e, s);
      lbl.setAttribute('transform', `translate(0, ${baseY + below + 10})`);
      svg.appendChild(lbl);
    }
    x += d.widthMM * s + GAP_MM * s;
  }
  if (state.overlay) svg.appendChild(legendBlock(RULER + 12, baseY + below + 20, entries));
}

function drawDepthRuler(svg, x, baseY, above, below, s) {
  const dim = css('--text-dim');
  const g = el('g');
  g.appendChild(el('line', { x1: x, y1: baseY - above - 4, x2: x, y2: baseY + below + 4, stroke: dim, 'stroke-width': 1 }));
  const maxUp = Math.ceil(above / s / 10) * 10, maxDn = Math.ceil(below / s / 10) * 10;
  for (let mm = -maxDn; mm <= maxUp; mm += 10) {
    const y = baseY - mm * s;
    if (y < baseY - above - 4 || y > baseY + below + 4) continue;
    const major = mm % 50 === 0;
    g.appendChild(el('line', { x1: x - (major ? 8 : 4), y1: y, x2: x, y2: y, stroke: dim, 'stroke-width': 1 }));
    if (major) g.appendChild(txt(x - 11, y + 3.5, `${mm}`, { 'text-anchor': 'end', fill: dim, 'font-size': 9.5 }));
  }
  g.appendChild(txt(12, baseY - above - 10, 'mm', { fill: dim, 'font-size': 9.5 }));
  svg.appendChild(g);
}

function renderElevation(svgId, drawFn) {
  const svg = document.getElementById(svgId);
  svg.replaceChildren();
  const entries = slotEntries();
  if (!entries.length) { svg.setAttribute('width', 0); svg.setAttribute('height', 0); return; }
  const s = state.zoom;
  const parts = entries.map(e => ({ e, d: drawFn(e.slot, e.cam, e.lens, e.color) }));
  const maxH = Math.max(...parts.map(p => p.d.heightMM)) * s;
  const RULER = 56, PAD = 20, LABELS = state.overlay ? entries.length * 16 + 26 : 56;
  const baseY = PAD + maxH;
  const totalW = state.overlay
    ? RULER + Math.max(...parts.map(p => p.d.widthMM)) * s + PAD * 2
    : RULER + parts.reduce((a, p) => a + p.d.widthMM * s + GAP_MM * s, 0) + PAD;
  const totalH = baseY + LABELS + PAD;
  svg.setAttribute('width', totalW);
  svg.setAttribute('height', totalH);
  svg.style.color = css('--text');

  const dim = css('--text-dim');
  // height ruler + faint gridlines
  const rg = el('g');
  rg.appendChild(el('line', { x1: RULER, y1: PAD - 4, x2: RULER, y2: baseY, stroke: dim, 'stroke-width': 1 }));
  for (let mm = 0; mm <= maxH / s + 5; mm += 10) {
    const y = baseY - mm * s;
    if (y < PAD - 4) break;
    const major = mm % 50 === 0;
    rg.appendChild(el('line', { x1: RULER - (major ? 8 : 4), y1: y, x2: RULER, y2: y, stroke: dim, 'stroke-width': 1 }));
    if (major && mm > 0) {
      rg.appendChild(txt(RULER - 11, y + 3.5, `${mm}`, { 'text-anchor': 'end', fill: dim, 'font-size': 9.5 }));
      rg.appendChild(el('line', { x1: RULER, y1: y, x2: totalW - 6, y2: y, stroke: dim, 'stroke-width': 0.5, 'stroke-opacity': 0.25 }));
    }
  }
  svg.appendChild(rg);
  // ground line
  svg.appendChild(el('line', { x1: RULER - 8, y1: baseY, x2: totalW - 6, y2: baseY, stroke: dim, 'stroke-width': 1.2 }));

  let x = RULER + PAD / 2;
  const maxWmm = Math.max(...parts.map(p => p.d.widthMM));
  for (const { e, d } of parts) {
    const gx = state.overlay ? RULER + PAD / 2 + (maxWmm - d.widthMM) * s / 2 : x;
    const wrap = el('g', { transform: `translate(${gx}, ${baseY})` });
    if (state.overlay) { wrap.setAttribute('opacity', 0.82); d.group.querySelectorAll('rect,path,circle').forEach(n => { if (n.getAttribute('fill') !== 'none') n.setAttribute('fill-opacity', 0.14); }); }
    wrap.appendChild(d.group);
    svg.appendChild(wrap);
    if (!state.overlay) {
      const lbl = labelBlock(gx + d.widthMM * s / 2, e, s);
      lbl.setAttribute('transform', `translate(0, ${baseY + 10})`);
      svg.appendChild(lbl);
    }
    x += d.widthMM * s + GAP_MM * s;
  }
  if (state.overlay) svg.appendChild(legendBlock(RULER + 12, baseY + 20, entries));
}

/* ---------- spec table ---------- */

function renderTable() {
  const tbl = document.getElementById('specTable');
  const entries = slotEntries();
  const rows = [
    ['Camera', e => `<span class="swatch" style="background:${e.color}"></span>${e.cam.brand} ${e.cam.name}`],
    ['Sensor', e => e.cam.sensor],
    ['Body W × H × D', e => `${e.cam.widthMM} × ${e.cam.heightMM} × ${e.cam.depthMM} mm`],
    ['Body weight', e => `${e.cam.weightG} g`],
    ['Lens', e => e.lens ? (e.lens.builtIn ? e.lens.name : `${e.lens.brand} ${e.lens.name}`) : '—'],
    ['Lens Ø × length', e => e.lens && !e.lens.builtIn ? `${e.lens.diameterMM} × ${e.lens.lengthMM} mm` : '—'],
    ['Lens weight', e => e.lens && !e.lens.builtIn ? `${e.lens.weightG} g` : '—'],
    ['Kit weight', e => `${e.cam.weightG + (e.lens && !e.lens.builtIn ? e.lens.weightG : 0)} g`],
    ['Kit depth (LCD → lens front)', e => {
      const g = geom(e.cam);
      return `${Math.round(g.core + (e.lens ? e.lens.lengthMM : 0))} mm`;
    }],
  ];
  tbl.innerHTML = rows.map(([label, fn]) =>
    `<tr><th>${label}</th>${entries.map(e => `<td>${fn(e)}</td>`).join('')}</tr>`
  ).join('');
}

/* ---------- slot UI ---------- */

function cameraOptions(selected) {
  const groups = {};
  for (const c of CAMERAS) (groups[c.brand] ??= []).push(c);
  return Object.entries(groups).map(([brand, cams]) =>
    `<optgroup label="${brand}">` + cams.map(c =>
      `<option value="${c.id}" ${c.id === selected ? 'selected' : ''}>${c.name}</option>`).join('') + '</optgroup>'
  ).join('');
}

function lensOptions(cam, selected) {
  if (cam.mount === 'fixed') return `<option>${cam.fixedLensName || 'Built-in lens'}</option>`;
  const opts = [`<option value="">— body only —</option>`];
  const groups = {};
  for (const l of LENSES.filter(l => l.mount === cam.mount)) (groups[l.brand] ??= []).push(l);
  for (const [brand, lenses] of Object.entries(groups)) {
    opts.push(`<optgroup label="${brand}">` + lenses.map(l =>
      `<option value="${l.id}" ${l.id === selected ? 'selected' : ''}>${l.name}</option>`).join('') + '</optgroup>');
  }
  return opts.join('');
}

function renderSlots() {
  const wrap = document.getElementById('slots');
  wrap.replaceChildren();
  state.slots.forEach((slot, i) => {
    const cam = camById(slot.camId);
    const lens = slotLens(slot, cam);
    const color = COLORS[i % COLORS.length];
    const div = document.createElement('div');
    div.className = 'slot';
    div.style.setProperty('--slot-color', color);
    const kitW = cam.weightG + (lens && !lens.builtIn ? lens.weightG : 0);
    div.innerHTML = `
      <div class="slot-head">
        <span class="slot-title">Camera ${i + 1}</span>
        <button class="slot-remove" title="Remove">✕</button>
      </div>
      <select class="sel-cam">${cameraOptions(slot.camId)}</select>
      <select class="sel-lens" ${cam.mount === 'fixed' ? 'disabled' : ''}>${lensOptions(cam, slot.lensId)}</select>
      <label class="slot-nudge" title="Shift this camera along the depth axis in the top view">
        <span>Nudge</span>
        <input type="range" min="-20" max="20" step="0.5" value="${slot.nudge}">
        <span class="nudge-val">${slot.nudge > 0 ? '+' : ''}${slot.nudge} mm</span>
      </label>
      <div class="slot-kit">Kit: <strong>${kitW} g</strong>${lens && !lens.builtIn ? ` (${cam.weightG} + ${lens.weightG})` : ''}</div>`;
    div.querySelector('.sel-cam').addEventListener('change', ev => {
      slot.camId = ev.target.value;
      const newCam = camById(slot.camId);
      if (newCam.mount === 'fixed' || (slot.lensId && lensById(slot.lensId)?.mount !== newCam.mount)) slot.lensId = null;
      update();
    });
    div.querySelector('.sel-lens').addEventListener('change', ev => { slot.lensId = ev.target.value || null; update(); });
    const range = div.querySelector('.slot-nudge input');
    range.addEventListener('input', ev => {
      slot.nudge = parseFloat(ev.target.value);
      div.querySelector('.nudge-val').textContent = `${slot.nudge > 0 ? '+' : ''}${slot.nudge} mm`;
      renderTop(); writeHash();
    });
    div.querySelector('.slot-remove').addEventListener('click', () => { state.slots.splice(i, 1); update(); });
    wrap.appendChild(div);
  });
  const add = document.createElement('button');
  add.className = 'slot-add';
  add.textContent = '+ Add camera';
  add.addEventListener('click', () => {
    state.slots.push({ camId: CAMERAS[0].id, lensId: null, nudge: 0 });
    update();
  });
  wrap.appendChild(add);
}

/* ---------- state <-> url ---------- */

function writeHash() {
  const c = state.slots.map(s => `${s.camId}~${s.lensId || ''}~${s.nudge}`).join(',');
  const h = `#c=${c}&align=${state.align}&z=${state.zoom}&ov=${state.overlay ? 1 : 0}&ph=${state.photoMode ? 1 : 0}`;
  history.replaceState(null, '', h);
}

function readHash() {
  if (!location.hash.startsWith('#c=')) return false;
  try {
    const p = new URLSearchParams(location.hash.slice(1));
    const slots = (p.get('c') || '').split(',').filter(Boolean).map(part => {
      const [camId, lensId, nudge] = part.split('~');
      return camById(camId) ? { camId, lensId: lensId && lensById(lensId) ? lensId : null, nudge: parseFloat(nudge) || 0 } : null;
    }).filter(Boolean);
    if (!slots.length) return false;
    state.slots = slots;
    if (['lcd', 'eyecup', 'mount', 'front'].includes(p.get('align'))) state.align = p.get('align');
    const z = parseFloat(p.get('z')); if (z >= 1.2 && z <= 4) state.zoom = z;
    state.overlay = p.get('ov') === '1';
    if (p.has('ph')) state.photoMode = p.get('ph') === '1';
    return true;
  } catch { return false; }
}

/* ---------- boot ---------- */

const ALIGN_LABELS = { lcd: 'back of the LCD', eyecup: 'rear of the eyecup', mount: 'lens mount flange', front: 'front of the lens' };

function update() {
  renderSlots();
  renderTop();
  renderElevation('svg-front', drawFront);
  renderElevation('svg-rear', drawRear);
  renderTable();
  document.getElementById('alignLabel').textContent = ALIGN_LABELS[state.align];
  writeHash();
}

function init() {
  if (!readHash() && typeof DEFAULT_SLOTS !== 'undefined') {
    state.slots = DEFAULT_SLOTS.map(d => ({ ...d }));
  }
  document.getElementById('alignMode').value = state.align;
  document.getElementById('zoom').value = state.zoom;
  document.getElementById('overlayToggle').checked = state.overlay;
  document.getElementById('photoToggle').checked = state.photoMode;

  document.getElementById('alignMode').addEventListener('change', ev => { state.align = ev.target.value; update(); });
  document.getElementById('zoom').addEventListener('input', ev => { state.zoom = parseFloat(ev.target.value); update(); });
  document.getElementById('overlayToggle').addEventListener('change', ev => { state.overlay = ev.target.checked; update(); });
  document.getElementById('photoToggle').addEventListener('change', ev => { state.photoMode = ev.target.checked; update(); });
  document.getElementById('shareBtn').addEventListener('click', async () => {
    writeHash();
    try { await navigator.clipboard.writeText(location.href); } catch { /* http fallback below */ }
    const b = document.getElementById('shareBtn');
    b.textContent = 'Copied!';
    setTimeout(() => (b.textContent = 'Copy link'), 1400);
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', update);
  // re-render SVGs (they bake in theme colors) when a host theme toggle flips data-theme
  new MutationObserver(update).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.__csrRender = update;   // console/testing hook: re-render after mutating data
  update();
}

init();
