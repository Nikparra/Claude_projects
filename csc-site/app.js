/* Camera Size Comparison — app.js
   Static, no framework. Data comes from data/products.js (window.CSC_PRODUCTS).
   Physical specs (mm/g, manufacturer-published) are kept separate from visual
   calibration (image px anchors). Rendering guarantees: 1 mm on screen is the
   same number of px for every product (global scale S = px/mm).
*/
(function () {
  "use strict";

  // ---------- Data ----------
  const DB = window.CSC_PRODUCTS || { cameras: [], lenses: [], defaultComparison: [] };
  const LS = {
    CALIB: "csc:calib:v1",
    SAVES: "csc:saves:v1",
    LAST: "csc:last:v1"
  };

  // Merge calibration overrides saved from the admin page (per-browser).
  try {
    const ov = JSON.parse(localStorage.getItem(LS.CALIB) || "{}");
    [...DB.cameras, ...DB.lenses].forEach(p => {
      if (ov[p.id]) p.calibration = Object.assign({}, p.calibration, ov[p.id]);
    });
  } catch (e) { /* ignore corrupt overrides */ }

  const camById = new Map(DB.cameras.map(c => [c.id, c]));
  const lensById = new Map(DB.lenses.map(l => [l.id, l]));
  const byCode = new Map();
  [...DB.cameras, ...DB.lenses].forEach(p => { byCode.set(p.code, p); byCode.set(p.id, p); });

  // ---------- Constants ----------
  const PAD_MM = 13;          // horizontal padding per cell side, in mm
  const TOP_MARGIN_MM = 12;   // space above the longest setup
  const BOTTOM_MARGIN_MM = 14;// space below the deepest rear protrusion
  const MIN_CELL_PX = 176;    // so the stats card stays readable
  const PH_REAR_MM = 5;       // assumed rear protrusion for placeholder bodies

  // ---------- State ----------
  const state = {
    setups: [],          // [{camId, lensId|null, offset(mm, int)}]
    scale: 2.6,          // px per mm
    autoFit: true,
    selected: -1
  };

  // ---------- Helpers ----------
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = n => (Math.round(n * 10) / 10).toLocaleString("en-US");

  let toastTimer = null;
  function toast(msg, ms = 2600) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add("hidden"), ms);
  }

  function camOf(s) { return camById.get(s.camId); }
  function lensOf(s) { return s.lensId ? lensById.get(s.lensId) : null; }

  function hasImage(p) {
    return p.calibration && p.calibration.image && p.calibration.status !== "placeholder";
  }

  // ---------- Geometry ----------
  // Top view: image top = front of camera (lens side), image bottom = rear.
  // Body anchors (image px): lcdPlaneY (rear LCD surface), flangeY (lens mount
  // flange plane), mountX (optical axis).
  // Lens images are normalized to point UP: axisX (optical axis), mountY
  // (flange contact edge; content below it tucks into the mount).

  function setupExtents(s) {
    // Returns mm extents relative to the LCD baseline (before offset).
    const cam = camOf(s), lens = lensOf(s);
    let front, rear;
    if (hasImage(cam)) {
      const c = cam.calibration;
      front = c.lcdPlaneY / c.pxPerMm;               // front of body image above baseline
      rear = (c.imgH - c.lcdPlaneY) / c.pxPerMm;     // eyecup etc. behind baseline
      if (lens) {
        const flangeAbove = (c.lcdPlaneY - c.flangeY) / c.pxPerMm;
        front = Math.max(front, flangeAbove + lens.specs.lengthMm);
      }
    } else {
      front = cam.specs.depthMm + (lens ? lens.specs.lengthMm : 0);
      rear = PH_REAR_MM;
    }
    return { frontMm: front + s.offset, rearMm: rear - Math.min(0, s.offset) };
  }

  function cellWidthMm(s) {
    const cam = camOf(s), lens = lensOf(s);
    let w = cam.specs.widthMm;
    if (hasImage(cam)) w = cam.calibration.imgW / cam.calibration.pxPerMm; // incl. strap lugs etc.
    if (lens) w = Math.max(w, lens.specs.diameterMm);
    return w + PAD_MM * 2;
  }

  function layout() {
    const S = state.scale;
    let maxFront = 40, maxRear = 8;
    state.setups.forEach(s => {
      const e = setupExtents(s);
      maxFront = Math.max(maxFront, e.frontMm);
      maxRear = Math.max(maxRear, e.rearMm);
    });
    const baselineY = (maxFront + TOP_MARGIN_MM) * S;
    const compH = baselineY + (maxRear + BOTTOM_MARGIN_MM) * S;
    return { S, baselineY, compH };
  }

  // ---------- Rendering ----------
  function render() {
    const row = $("#row");
    row.innerHTML = "";
    const empty = state.setups.length === 0;
    $("#empty").classList.toggle("hidden", !empty);
    $("#stageWrap").classList.toggle("hidden", empty);
    if (empty) { persistLast(); return; }

    const { S, baselineY, compH } = layout();

    const bl = el("div", "baseline");
    bl.style.top = baselineY + "px";
    bl.appendChild(el("span", "baseline-label", "rear-LCD alignment"));
    row.appendChild(bl);

    state.setups.forEach((s, i) => row.appendChild(buildCell(s, i, S, baselineY, compH)));

    // ruler
    $("#rulerBar").style.width = (50 * S) + "px";
    $("#rulerLabel").textContent = "50 mm";
    $("#scaleRange").value = state.scale;

    persistLast();
  }

  function buildCell(s, i, S, baselineY, compH) {
    const cam = camOf(s), lens = lensOf(s);
    const cellW = Math.max(cellWidthMm(s) * S, MIN_CELL_PX);
    const cell = el("div", "cell");
    cell.style.width = cellW + "px";

    const comp = el("div", "composite" + (state.selected === i ? " selected" : ""));
    comp.style.height = compH + "px";
    comp.dataset.idx = i;

    const rig = el("div", "rig");
    rig.style.cssText = "position:absolute;inset:0;";
    rig.style.transform = `translateY(${-s.offset * S}px)`;

    const centerX = cellW / 2;
    let flangeCanvasY, mountCanvasX;

    if (hasImage(cam)) {
      const c = cam.calibration;
      const cs = S / c.pxPerMm;
      const w = c.imgW * cs, h = c.imgH * cs;
      const left = centerX - w / 2;
      const top = baselineY - c.lcdPlaneY * cs;
      flangeCanvasY = top + c.flangeY * cs;
      mountCanvasX = left + c.mountX * cs;
      const img = el("img", "body-img");
      img.src = c.image; img.alt = cam.name + " (top view)";
      img.style.cssText = `left:${left}px;top:${top}px;width:${w}px;`;
      rig.appendChild(img);
    } else {
      const w = cam.specs.widthMm * S, h = cam.specs.depthMm * S;
      const left = centerX - w / 2, top = baselineY - h;
      flangeCanvasY = top; mountCanvasX = centerX;
      const ph = el("div", "ph ph-body",
        `<span>${esc(cam.name)}<small>image pending — dimensions accurate</small></span>`);
      ph.style.cssText = `left:${left}px;top:${top}px;width:${w}px;height:${h}px;`;
      rig.appendChild(ph);
    }

    if (lens) {
      if (hasImage(lens)) {
        const lc = lens.calibration;
        const ls = S / lc.pxPerMm;
        const w = lc.imgW * ls;
        const left = mountCanvasX - lc.axisX * ls;
        const top = flangeCanvasY - lc.mountY * ls;
        const img = el("img", "lens-img");
        img.src = lc.image; img.alt = lens.name + " (side view)";
        img.style.cssText = `left:${left}px;top:${top}px;width:${w}px;`;
        rig.appendChild(img);
      } else {
        const w = lens.specs.diameterMm * S, h = lens.specs.lengthMm * S;
        const left = mountCanvasX - w / 2, top = flangeCanvasY - h;
        const ph = el("div", "ph",
          `<span>${esc(lens.name)}<small>image pending</small></span>`);
        ph.style.cssText = `left:${left}px;top:${top}px;width:${w}px;height:${h}px;`;
        rig.appendChild(ph);
      }
    }

    comp.appendChild(rig);
    comp.appendChild(el("div", "setup-title", esc(shortName(cam))));
    const badge = el("div", "offset-badge" + (s.offset === 0 ? " zero" : ""),
      (s.offset > 0 ? "+" : "") + s.offset + " mm");
    comp.appendChild(badge);
    attachDrag(comp, i, S, badge);
    cell.appendChild(comp);
    cell.appendChild(buildCard(s, i));
    return cell;
  }

  function shortName(p) { return p.shortName || p.name; }

  function buildCard(s, i) {
    const cam = camOf(s), lens = lensOf(s);
    const card = el("div", "card");
    const weight = cam.specs.weightG + (lens ? lens.specs.weightG : 0);
    const lb = weight / 453.592;
    const totalDepth = cam.specs.depthMm + (lens ? lens.specs.lengthMm : 0);

    const chips = [];
    chips.push(`<span class="chip mfr" title="Dimensions and weight from manufacturer specifications">mfr specs</span>`);
    const st = statusChip(cam);
    if (st) chips.push(st);
    if (lens) { const lst = statusChip(lens, true); if (lst) chips.push(lst); }

    card.innerHTML = `
      <h4>${esc(cam.name)}</h4>
      <p class="lens-name">${lens ? esc(lens.name) : "body only"}</p>
      <dl class="spec-rows">
        <dt>Body W×H×D</dt><dd>${fmt(cam.specs.widthMm)} × ${fmt(cam.specs.heightMm)} × ${fmt(cam.specs.depthMm)} mm</dd>
        ${lens ? `<dt>Lens Ø×L</dt><dd>${fmt(lens.specs.diameterMm)} × ${fmt(lens.specs.lengthMm)} mm</dd>` : ""}
        <dt>Front-to-LCD</dt><dd>≈ ${fmt(totalDepth + s.offset * 0)} mm</dd>
        <dt>Weight</dt><dd>${weight.toLocaleString()} g (${lb.toFixed(2)} lb)</dd>
        <dt>Alignment</dt><dd>${s.offset > 0 ? "+" : ""}${s.offset} mm</dd>
      </dl>
      <div class="chips">${chips.join("")}</div>
      <div class="card-actions">
        <div class="nudge" title="Nudge forward/back in 1 mm steps">
          <button class="btn small icon" data-act="back" aria-label="Nudge back 1 mm">−</button>
          <span class="val">${s.offset > 0 ? "+" : ""}${s.offset} mm</span>
          <button class="btn small icon" data-act="fwd" aria-label="Nudge forward 1 mm">+</button>
          <button class="btn small icon" data-act="zero" title="Reset alignment" aria-label="Reset alignment">⟲</button>
        </div>
        <span class="spacer"></span>
        <button class="btn small" data-act="lens">Lens ▾</button>
        <button class="btn small" data-act="remove" aria-label="Remove setup">✕</button>
      </div>`;

    card.addEventListener("click", e => {
      const b = e.target.closest("button[data-act]");
      if (!b) return;
      const act = b.dataset.act;
      if (act === "back") { s.offset -= 1; render(); }
      else if (act === "fwd") { s.offset += 1; render(); }
      else if (act === "zero") { s.offset = 0; render(); }
      else if (act === "remove") { state.setups.splice(i, 1); state.selected = -1; fitIfAuto(); render(); }
      else if (act === "lens") openPicker({ mode: "lens", setupIndex: i });
    });
    return card;
  }

  function statusChip(p, isLens) {
    const c = p.calibration;
    const what = isLens ? "lens image" : "image";
    if (!c || !c.image || c.status === "placeholder")
      return `<span class="chip pending" title="No verified product image yet — silhouette drawn from published dimensions">${what} pending</span>`;
    if (c.status === "verified")
      return `<span class="chip mfr" title="Image anchors visually verified against published dimensions">${what} verified</span>`;
    return `<span class="chip est" title="Image scaled from published dimensions; anchor positions are calibrated estimates">${what}: calibrated estimate</span>`;
  }

  // ---------- Drag ----------
  function attachDrag(comp, i, S, badge) {
    let startY = 0, startOffset = 0, dragging = false, moved = false, pid = null;
    const rig = comp.querySelector(".rig");

    comp.addEventListener("pointerdown", e => {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true; moved = false; pid = e.pointerId;
      startY = e.clientY; startOffset = state.setups[i].offset;
      comp.setPointerCapture(pid);
    });
    comp.addEventListener("pointermove", e => {
      if (!dragging) return;
      const dy = e.clientY - startY;
      if (Math.abs(dy) > 3) moved = true;
      if (!moved) return;
      const temp = startOffset - dy / S;
      const snapped = Math.round(temp);
      rig.style.transform = `translateY(${-temp * S}px)`;
      badge.classList.toggle("zero", false);
      badge.textContent = (snapped > 0 ? "+" : "") + snapped + " mm";
    });
    const finish = e => {
      if (!dragging) return;
      dragging = false;
      try { comp.releasePointerCapture(pid); } catch (_) {}
      if (moved) {
        const dy = e.clientY - startY;
        state.setups[i].offset = Math.round(startOffset - dy / S);
        render();
      } else {
        state.selected = state.selected === i ? -1 : i;
        render();
      }
    };
    comp.addEventListener("pointerup", finish);
    comp.addEventListener("pointercancel", () => { dragging = false; render(); });
  }

  // ---------- Scale / fit ----------
  function fitScale() {
    if (!state.setups.length) return;
    const avail = $("#stage").clientWidth - 24;
    const mm = state.setups.reduce((a, s) => a + cellWidthMm(s), 0);
    let S = avail / mm;
    // account for min cell width kicking in
    for (let k = 0; k < 3; k++) {
      let fixed = 0, mmFlex = 0;
      state.setups.forEach(s => {
        const w = cellWidthMm(s) * S;
        if (w < MIN_CELL_PX) fixed += MIN_CELL_PX; else mmFlex += cellWidthMm(s);
      });
      if (mmFlex === 0) break;
      S = (avail - fixed) / mmFlex;
    }
    state.scale = Math.min(6, Math.max(1.2, S));
  }
  function fitIfAuto() { if (state.autoFit) fitScale(); }

  // ---------- Serialization ----------
  function serialize() {
    const parts = state.setups.map(s => {
      const cam = camOf(s), lens = lensOf(s);
      return `${cam.code}.${lens ? lens.code : "-"}.${s.offset}`;
    });
    const sc = state.autoFit ? "a" : state.scale.toFixed(2);
    return `c=${parts.join("_")}&s=${sc}`;
  }
  function currentHash() { return "#" + serialize(); }

  function deserialize(str) {
    try {
      const h = str.replace(/^#/, "");
      const params = new URLSearchParams(h.replace(/&/g, "&"));
      const c = params.get("c");
      if (!c) return false;
      const setups = [];
      c.split("_").forEach(part => {
        const bits = part.split(".");
        // offset may contain a minus sign; camera/lens codes contain no dots
        if (bits.length < 2) return;
        const cam = byCode.get(bits[0]);
        if (!cam || !camById.has(cam.id)) return;
        let lens = null;
        if (bits[1] && bits[1] !== "-") {
          const l = byCode.get(bits[1]);
          if (l && lensById.has(l.id) && l.mount === cam.mount) lens = l;
        }
        const off = parseInt(bits[2], 10);
        setups.push({ camId: cam.id, lensId: lens ? lens.id : null, offset: Number.isFinite(off) ? off : 0 });
      });
      if (!setups.length) return false;
      state.setups = setups;
      const s = params.get("s");
      if (s === "a" || s === null) { state.autoFit = true; fitScale(); }
      else { const v = parseFloat(s); if (v >= 1.2 && v <= 6) { state.scale = v; state.autoFit = false; } }
      return true;
    } catch (e) { return false; }
  }

  function persistLast() {
    try { localStorage.setItem(LS.LAST, serialize()); } catch (e) {}
  }

  // ---------- Saves ----------
  function getSaves() {
    try { return JSON.parse(localStorage.getItem(LS.SAVES) || "[]"); } catch (e) { return []; }
  }
  function setSaves(v) { try { localStorage.setItem(LS.SAVES, JSON.stringify(v)); } catch (e) {} }

  function renderSaves() {
    const ul = $("#savesList");
    ul.innerHTML = "";
    const saves = getSaves();
    if (!saves.length) { ul.innerHTML = `<li class="muted">Nothing saved yet.</li>`; return; }
    saves.forEach((sv, idx) => {
      const li = el("li");
      const d = new Date(sv.ts);
      li.innerHTML = `<span class="s-name">${esc(sv.name)}</span>
        <span class="s-date">${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        <button class="btn small" data-load>Load</button>
        <button class="btn small" data-del aria-label="Delete">✕</button>`;
      li.querySelector("[data-load]").addEventListener("click", () => {
        if (deserialize(sv.state)) { closeModals(); fitIfAuto(); render(); toast(`Loaded “${sv.name}”`); }
      });
      li.querySelector("[data-del]").addEventListener("click", () => {
        saves.splice(idx, 1); setSaves(saves); renderSaves();
      });
      ul.appendChild(li);
    });
  }

  // ---------- Picker ----------
  const picker = { mode: "add", setupIndex: -1, camId: null };

  function openPicker(opts) {
    picker.mode = opts.mode || "add";
    picker.setupIndex = opts.setupIndex ?? -1;
    picker.camId = picker.mode === "lens" ? state.setups[picker.setupIndex].camId : null;
    $("#pickerTitle").textContent = picker.mode === "lens" ? "Change lens" : "Add a setup";
    $("#pickerCams").classList.toggle("hidden", picker.mode === "lens");
    renderPicker();
    $("#pickerModal").classList.remove("hidden");
  }

  function renderPicker() {
    const camGrid = $("#camGrid");
    camGrid.innerHTML = "";
    DB.cameras.forEach(cam => {
      const b = el("button", "pick" + (picker.camId === cam.id ? " active" : ""));
      b.type = "button";
      b.innerHTML = `<span class="p-name">${esc(cam.name)}</span>
        <span class="p-sub">${esc(cam.brand)} · ${fmt(cam.specs.widthMm)}×${fmt(cam.specs.heightMm)} mm · ${cam.specs.weightG} g</span>`;
      b.addEventListener("click", () => { picker.camId = cam.id; renderPicker(); });
      camGrid.appendChild(b);
    });

    const lensGrid = $("#lensGrid");
    lensGrid.innerHTML = "";
    const cam = picker.camId ? camById.get(picker.camId) : null;
    $("#lensMountNote").textContent = cam ? `(${mountLabel(cam.mount)})` : "(pick a camera first)";
    if (!cam) return;

    const addBtn = (label, sub, fn) => {
      const b = el("button", "pick");
      b.type = "button";
      b.innerHTML = `<span class="p-name">${label}</span><span class="p-sub">${sub}</span>`;
      b.addEventListener("click", fn);
      lensGrid.appendChild(b);
    };

    addBtn("Body only", "no lens mounted", () => commitPick(cam.id, null));
    DB.lenses.filter(l => l.mount === cam.mount).forEach(l => {
      addBtn(esc(l.name), `Ø${fmt(l.specs.diameterMm)} × ${fmt(l.specs.lengthMm)} mm · ${l.specs.weightG} g`,
        () => commitPick(cam.id, l.id));
    });
  }

  function mountLabel(m) {
    return DB.mounts && DB.mounts[m] ? DB.mounts[m].label : m;
  }

  function commitPick(camId, lensId) {
    if (picker.mode === "lens") {
      state.setups[picker.setupIndex].lensId = lensId;
    } else {
      state.setups.push({ camId, lensId, offset: 0 });
    }
    closeModals();
    fitIfAuto(); render();
  }

  // ---------- Command parser ----------
  const normStr = s => s.toLowerCase()
    .replace(/[–—−]/g, "-")
    .replace(/[^a-z0-9.\- ]+/g, " ")
    .replace(/\s+/g, " ").trim();
  const squash = s => s.replace(/[.\- ]/g, "");

  function findProduct(text, list) {
    const nt = normStr(text), st = squash(nt);
    let best = null;
    list.forEach(p => {
      const aliases = [p.name, p.shortName || "", ...(p.aliases || [])].filter(Boolean);
      aliases.forEach(a => {
        const na = normStr(a), sa = squash(na);
        if (!sa) return;
        let score = 0;
        if (nt.includes(na)) score = na.length + 4;
        else if (st.includes(sa)) score = sa.length;
        if (score > 0 && (!best || score > best.score)) best = { p, score };
      });
    });
    return best ? best.p : null;
  }

  function runCommand(raw) {
    const fb = $("#cmdFeedback");
    const say = (msg, cls) => { fb.textContent = msg; fb.className = "cmd-feedback " + (cls || ""); };
    const text = normStr(raw);
    if (!text) return;

    const mScale = text.match(/\bscale\s*(?:to\s*)?(\d+(?:\.\d+)?)/);
    if (mScale) {
      const v = Math.min(6, Math.max(1.2, parseFloat(mScale[1])));
      state.scale = v; state.autoFit = false; render();
      return say(`Scale set to ${v} px/mm.`, "ok");
    }
    if (/\bfit\b/.test(text)) { state.autoFit = true; fitScale(); render(); return say("Fitted to window.", "ok"); }
    if (/\b(clear|empty|start over)\b/.test(text)) { state.setups = []; render(); return say("Cleared.", "ok"); }
    if (/\breset\b.*\b(offsets?|alignment)\b/.test(text) || /\b(align|zero)\b.*\ball\b/.test(text)) {
      state.setups.forEach(s => s.offset = 0); render();
      return say("All alignments reset to 0 mm.", "ok");
    }

    const wantsRemove = /\b(remove|delete|drop|hide|take (off|out|away))\b/.test(text);
    const wantsChange = /\b(swap|change|switch|replace|put)\b/.test(text);
    const bodyOnly = /\b(body only|no lens|without (a )?lens|alone)\b/.test(text);

    const cam = findProduct(text, DB.cameras);
    const lens = findProduct(text, DB.lenses);

    if (wantsRemove) {
      if (!cam) return say("Which camera should I remove? e.g. “remove the OM-3”.", "err");
      const idx = state.setups.findIndex(s => s.camId === cam.id);
      if (idx < 0) return say(`${cam.name} isn’t on the stage.`, "err");
      const dupes = state.setups.filter(s => s.camId === cam.id).length;
      state.setups.splice(idx, 1); fitIfAuto(); render();
      return say(`Removed ${cam.name}${dupes > 1 ? " (first of " + dupes + ")" : ""}.`, "ok");
    }

    if (wantsChange && cam) {
      const idx = state.setups.findIndex(s => s.camId === cam.id);
      if (idx < 0) return say(`${cam.name} isn’t on the stage — say “add ${shortName(cam)} …” first.`, "err");
      if (bodyOnly) { state.setups[idx].lensId = null; render(); return say(`${cam.name}: lens removed.`, "ok"); }
      if (!lens) return say("Which lens? e.g. “put the Sigma 18-50 on the X-E5”.", "err");
      if (lens.mount !== cam.mount)
        return say(`${lens.name} is ${mountLabel(lens.mount)} — it doesn’t fit the ${mountLabel(cam.mount)} ${cam.name}.`, "err");
      state.setups[idx].lensId = lens.id; render();
      return say(`${cam.name} → ${lens.name}.`, "ok");
    }

    // default: add
    if (!cam) return say("Couldn’t find a camera in that. Try “add an X-T5 with the 16-55”.", "err");
    let lensId = null;
    if (!bodyOnly && lens) {
      if (lens.mount !== cam.mount)
        return say(`${lens.name} is ${mountLabel(lens.mount)} — it doesn’t fit the ${mountLabel(cam.mount)} ${cam.name}.`, "err");
      lensId = lens.id;
    }
    state.setups.push({ camId: cam.id, lensId, offset: 0 });
    fitIfAuto(); render();
    return say(`Added ${cam.name}${lensId ? " + " + lensById.get(lensId).name : " (body only)"}.`, "ok");
  }

  // ---------- Credits ----------
  function renderCredits() {
    const ul = $("#creditsList");
    ul.innerHTML = "";
    const items = [...DB.cameras, ...DB.lenses].filter(p => p.calibration && p.calibration.image && p.calibration.credit);
    if (!items.length) { ul.innerHTML = "<li class='muted'>No product images loaded yet — placeholders in use.</li>"; return; }
    items.forEach(p => {
      const cr = p.calibration.credit;
      ul.appendChild(el("li", "", `<span class="c-name">${esc(p.name)}</span> — ${esc(cr.source || "")}
        ${cr.page ? `· <a href="${esc(cr.page)}" target="_blank" rel="noopener">source page</a>` : ""}
        ${cr.note ? `<br><span class="muted small">${esc(cr.note)}</span>` : ""}`));
    });
  }

  // ---------- Modals ----------
  function closeModals() { $$(".modal").forEach(m => m.classList.add("hidden")); }
  $$(".modal").forEach(m => {
    m.addEventListener("click", e => {
      if (e.target === m || e.target.closest("[data-close]")) closeModals();
    });
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModals(); });

  // ---------- Wire up ----------
  $("#btnAdd").addEventListener("click", () => openPicker({ mode: "add" }));
  $("#btnAddEmpty").addEventListener("click", () => openPicker({ mode: "add" }));

  $("#cmdForm").addEventListener("submit", e => {
    e.preventDefault();
    runCommand($("#cmdInput").value);
    $("#cmdInput").select();
  });

  $("#scaleRange").addEventListener("input", e => {
    state.scale = parseFloat(e.target.value);
    state.autoFit = false;
    render();
  });
  $("#btnFit").addEventListener("click", () => { state.autoFit = true; fitScale(); render(); });

  $("#btnSaves").addEventListener("click", () => { renderSaves(); $("#savesModal").classList.remove("hidden"); $("#saveName").focus(); });
  $("#saveForm").addEventListener("submit", e => {
    e.preventDefault();
    const name = $("#saveName").value.trim();
    if (!name) return;
    const saves = getSaves();
    const existing = saves.findIndex(s => s.name === name);
    const rec = { name, state: serialize(), ts: Date.now() };
    if (existing >= 0) saves[existing] = rec; else saves.unshift(rec);
    setSaves(saves); $("#saveName").value = ""; renderSaves();
    toast(`Saved “${name}”`);
  });

  $("#btnShare").addEventListener("click", () => {
    const url = location.href.split("#")[0] + currentHash();
    $("#shareUrl").value = url;
    $("#shareModal").classList.remove("hidden");
    history.replaceState(null, "", currentHash());
  });
  $("#btnCopyShare").addEventListener("click", async () => {
    const inp = $("#shareUrl");
    inp.select();
    try { await navigator.clipboard.writeText(inp.value); toast("Link copied"); }
    catch (e) { document.execCommand("copy"); toast("Link copied"); }
  });

  $("#btnCredits").addEventListener("click", e => {
    e.preventDefault(); renderCredits(); $("#creditsModal").classList.remove("hidden");
  });

  $("#stage").addEventListener("keydown", e => {
    if (state.selected < 0 || state.selected >= state.setups.length) return;
    const s = state.setups[state.selected];
    if (e.key === "ArrowUp") { s.offset += 1; render(); e.preventDefault(); }
    else if (e.key === "ArrowDown") { s.offset -= 1; render(); e.preventDefault(); }
    else if (e.key === "Delete" || e.key === "Backspace") {
      state.setups.splice(state.selected, 1); state.selected = -1; fitIfAuto(); render(); e.preventDefault();
    }
  });

  let resizeT = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { if (state.autoFit) { fitScale(); render(); } }, 150);
  });

  window.addEventListener("hashchange", () => {
    if (location.hash.length > 2 && deserialize(location.hash)) { fitIfAuto(); render(); }
  });

  // rotating placeholder hints
  const hints = [
    'Try: “Add an X-E5 with the Sigma 18-50”',
    'Try: “Put the 16-55 II on the X-T5”',
    'Try: “Remove the OM-3”',
    'Try: “Add an OM-1 II with the 12-40”',
    'Try: “Reset offsets” or “scale 3”'
  ];
  let hintIdx = 0;
  setInterval(() => {
    const inp = $("#cmdInput");
    if (document.activeElement !== inp && !inp.value) {
      hintIdx = (hintIdx + 1) % hints.length;
      inp.placeholder = hints[hintIdx];
    }
  }, 5000);

  // ---------- Init ----------
  function init() {
    let loaded = false;
    if (location.hash.length > 2) loaded = deserialize(location.hash);
    if (!loaded) {
      const last = (() => { try { return localStorage.getItem(LS.LAST); } catch (e) { return null; } })();
      if (last) loaded = deserialize(last);
    }
    if (!loaded && DB.defaultComparison && DB.defaultComparison.length) {
      state.setups = DB.defaultComparison
        .filter(d => camById.has(d.camId) && (!d.lensId || lensById.has(d.lensId)))
        .map(d => ({ camId: d.camId, lensId: d.lensId || null, offset: d.offset || 0 }));
    }
    fitScale();
    render();
  }
  init();

  // debug/verification hook (harmless in production)
  window.__csc = { state, DB, render, layout, serialize, deserialize };
})();
