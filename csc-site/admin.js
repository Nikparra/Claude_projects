/* Calibration page. Lets Nik (or Claude) fine-tune image anchors visually.
   Saves overrides to localStorage (merged by app.js at load) and exports JSON
   for making the change permanent in data/products.js. */
(function () {
  "use strict";
  const DB = window.CSC_PRODUCTS || { cameras: [], lenses: [] };
  const LS_CALIB = "csc:calib:v1";
  const $ = s => document.querySelector(s);

  const all = [...DB.cameras.map(c => ({ ...c, kind: "camera" })),
               ...DB.lenses.map(l => ({ ...l, kind: "lens" }))];
  const overrides = (() => { try { return JSON.parse(localStorage.getItem(LS_CALIB) || "{}"); } catch (e) { return {}; } })();

  let cur = null;          // current product (with merged calibration)
  let cal = null;          // working calibration copy
  let zoom = 1;

  // ---- product select ----
  const sel = $("#prodSel");
  all.forEach(p => {
    const o = document.createElement("option");
    o.value = p.id;
    o.textContent = `${p.kind === "camera" ? "📷" : "🔭"} ${p.name}${p.calibration && p.calibration.image ? "" : "  (no image)"}`;
    sel.appendChild(o);
  });
  sel.addEventListener("change", () => load(sel.value));

  const qid = new URLSearchParams(location.search).get("id");
  load(qid && all.find(p => p.id === qid) ? qid : (all[0] && all[0].id));

  function load(id) {
    cur = all.find(p => p.id === id);
    if (!cur) return;
    sel.value = id;
    const base = cur.calibration ? JSON.parse(JSON.stringify(cur.calibration)) : {};
    const ov = overrides[cur.id] ? JSON.parse(JSON.stringify(overrides[cur.id])) : null;
    cal = Object.assign({}, base, ov || {});
    $("#prodName").textContent = cur.name;
    const st = document.querySelector(`#statusSel input[value="${cal.status || "estimate"}"]`);
    if (st) st.checked = true;
    draw();
  }

  // ---- canvas ----
  function draw() {
    const box = $("#canvasBox");
    box.innerHTML = "";
    if (!cal || !cal.image) {
      box.style.height = "220px";
      box.innerHTML = "<p style='padding:20px;color:#6b7280'>No image for this product yet — it renders as a dimension-accurate placeholder in the app.</p>";
      $("#imgMeta").textContent = "";
      refreshPanel();
      return;
    }
    const img = new Image();
    img.src = cal.image;
    img.draggable = false;
    box.appendChild(img);
    img.onload = () => {
      // trust stored imgW/imgH; warn if they disagree with the actual file
      if (cal.imgW && Math.abs(img.naturalWidth - cal.imgW) > 1) {
        $("#imgMeta").textContent = `⚠ stored imgW ${cal.imgW} ≠ file ${img.naturalWidth}px`;
      } else {
        $("#imgMeta").textContent = `${img.naturalWidth}×${img.naturalHeight}px · ${cal.pxPerMm ? cal.pxPerMm.toFixed(2) + " px/mm" : ""}`;
      }
      cal.imgW = cal.imgW || img.naturalWidth;
      cal.imgH = cal.imgH || img.naturalHeight;
      sizeBox();
      placeAnchors();
      refreshPanel();
    };
  }

  function sizeBox() {
    const box = $("#canvasBox");
    const wrap = box.parentElement;
    const maxW = wrap.clientWidth || 700;
    box.style.width = Math.round(maxW * zoom) + "px";
  }
  $("#zoom").addEventListener("input", e => { zoom = parseFloat(e.target.value); sizeBox(); placeAnchors(); });
  window.addEventListener("resize", () => { sizeBox(); placeAnchors(); });

  function pxToPct(v, total) { return (v / total * 100) + "%"; }

  function anchorDefs() {
    if (!cur) return [];
    if (cur.kind === "camera") {
      return [
        { key: "lcdPlaneY", axis: "h", cls: "a-lcd", label: "rear LCD plane" },
        { key: "flangeY", axis: "h", cls: "a-flange", label: "mount flange" },
        { key: "mountX", axis: "v", cls: "a-mount", label: "lens axis" }
      ];
    }
    return [
      { key: "mountY", axis: "h", cls: "a-mounty", label: "flange contact" },
      { key: "axisX", axis: "v", cls: "a-axis", label: "optical axis" }
    ];
  }

  function placeAnchors() {
    const box = $("#canvasBox");
    box.querySelectorAll(".anchor,.ghost-line").forEach(n => n.remove());
    if (!cal || !cal.image) return;

    anchorDefs().forEach(def => {
      if (cal[def.key] === undefined || cal[def.key] === null) {
        cal[def.key] = def.axis === "h" ? (cal.imgH / 2) : (cal.imgW / 2);
      }
      const a = document.createElement("div");
      a.className = `anchor ${def.axis} ${def.cls}`;
      a.innerHTML = `<span class="tag">${def.label}</span>`;
      position(a, def);
      attachDrag(a, def);
      box.appendChild(a);
    });

    // ghost: where the spec says the far edge should land
    if (cur.kind === "camera" && cal.pxPerMm) {
      const g = document.createElement("div");
      g.className = "ghost-line";
      const y = cal.lcdPlaneY - cur.specs.depthMm * cal.pxPerMm;
      g.style.top = pxToPct(y, cal.imgH);
      g.innerHTML = `<span class="tag">LCD − ${cur.specs.depthMm} mm (spec depth)</span>`;
      $("#canvasBox").appendChild(g);
    }
    if (cur.kind === "lens" && cal.pxPerMm) {
      const g = document.createElement("div");
      g.className = "ghost-line";
      const y = cal.mountY - cur.specs.lengthMm * cal.pxPerMm;
      g.style.top = pxToPct(y, cal.imgH);
      g.innerHTML = `<span class="tag">flange − ${cur.specs.lengthMm} mm (spec length)</span>`;
      $("#canvasBox").appendChild(g);
    }
  }

  function position(a, def) {
    if (def.axis === "h") a.style.top = pxToPct(cal[def.key], cal.imgH);
    else a.style.left = pxToPct(cal[def.key], cal.imgW);
  }

  function attachDrag(a, def) {
    let dragging = false, pid = null;
    a.addEventListener("pointerdown", e => {
      dragging = true; pid = e.pointerId; a.setPointerCapture(pid); e.preventDefault();
    });
    a.addEventListener("pointermove", e => {
      if (!dragging) return;
      const box = $("#canvasBox").getBoundingClientRect();
      if (def.axis === "h") {
        const frac = Math.min(1, Math.max(0, (e.clientY - box.top) / box.height));
        cal[def.key] = Math.round(frac * cal.imgH * 10) / 10;
      } else {
        const frac = Math.min(1, Math.max(0, (e.clientX - box.left) / box.width));
        cal[def.key] = Math.round(frac * cal.imgW * 10) / 10;
      }
      position(a, def);
      refreshPanel();
    });
    const up = () => { if (dragging) { dragging = false; placeAnchors(); refreshPanel(); } };
    a.addEventListener("pointerup", up);
    a.addEventListener("pointercancel", up);
  }

  // ---- side panel ----
  function refreshPanel() {
    const kv = $("#kv");
    const rows = [];
    const mm = v => cal.pxPerMm ? (v / cal.pxPerMm).toFixed(1) + " mm" : "—";
    if (cur.kind === "camera") {
      rows.push(["Spec W×D", `${cur.specs.widthMm} × ${cur.specs.depthMm} mm`]);
      if (cal.image) {
        rows.push(["px/mm (from width)", cal.pxPerMm ? cal.pxPerMm.toFixed(3) : "—"]);
        const d = cal.lcdPlaneY !== undefined && cal.flangeY !== undefined ? (cal.lcdPlaneY - cal.flangeY) : null;
        if (d !== null) {
          const dMm = cal.pxPerMm ? d / cal.pxPerMm : null;
          const delta = dMm !== null ? dMm - cur.specs.depthMm : null;
          rows.push(["flange→LCD", dMm !== null ? dMm.toFixed(1) + " mm" : "—"]);
          rows.push(["vs spec depth", delta !== null ? (delta > 0 ? "+" : "") + delta.toFixed(1) + " mm" : "—",
            Math.abs(delta) <= 1.5 ? "good" : "bad"]);
        }
        rows.push(["image height", mm(cal.imgH)]);
      }
    } else {
      rows.push(["Spec Ø×L", `${cur.specs.diameterMm} × ${cur.specs.lengthMm} mm`]);
      if (cal.image) {
        rows.push(["px/mm (from Ø)", cal.pxPerMm ? cal.pxPerMm.toFixed(3) : "—"]);
        if (cal.mountY !== undefined) {
          const lenMm = cal.pxPerMm ? cal.mountY / cal.pxPerMm : null; // top(front)=0 after crop
          rows.push(["front→flange in image", lenMm !== null ? lenMm.toFixed(1) + " mm" : "—"]);
          const delta = lenMm !== null ? lenMm - cur.specs.lengthMm : null;
          rows.push(["vs spec length", delta !== null ? (delta > 0 ? "+" : "") + delta.toFixed(1) + " mm" : "—",
            delta !== null && Math.abs(delta) <= 2 ? "good" : "bad"]);
        }
      }
    }
    kv.innerHTML = rows.map(r => `<dt>${r[0]}</dt><dd class="${r[2] || ""}">${r[1]}</dd>`).join("");
    $("#jsonOut").value = snippet();
    $("#calibNote").textContent = cal.credit ? `Image: ${cal.credit.source || ""} ${cal.credit.page ? "· " + cal.credit.page : ""}` : "";
  }

  function currentStatus() {
    const r = document.querySelector("#statusSel input:checked");
    return r ? r.value : "estimate";
  }
  document.querySelectorAll("#statusSel input").forEach(r =>
    r.addEventListener("change", () => { cal.status = currentStatus(); refreshPanel(); }));

  function snippet() {
    const c = Object.assign({}, cal, { status: currentStatus() });
    return `"${cur.id}": ` + JSON.stringify({ calibration: c }, null, 2);
  }

  // ---- actions ----
  $("#btnSave").addEventListener("click", () => {
    cal.status = currentStatus();
    overrides[cur.id] = cal;
    try {
      localStorage.setItem(LS_CALIB, JSON.stringify(overrides));
      alertToast("Saved to this browser — the main page now uses these anchors.");
    } catch (e) { alertToast("Could not save (localStorage unavailable)."); }
  });
  $("#btnRevert").addEventListener("click", () => {
    delete overrides[cur.id];
    try { localStorage.setItem(LS_CALIB, JSON.stringify(overrides)); } catch (e) {}
    load(cur.id);
    alertToast("Reverted to shipped calibration.");
  });
  $("#btnCopy").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(snippet()); alertToast("JSON copied — paste it to Claude to make it permanent."); }
    catch (e) { $("#jsonOut").select(); document.execCommand("copy"); alertToast("JSON copied."); }
  });
  $("#btnFull").addEventListener("click", () => {
    const db = JSON.parse(JSON.stringify(window.CSC_PRODUCTS));
    [...db.cameras, ...db.lenses].forEach(p => {
      if (overrides[p.id]) p.calibration = Object.assign({}, p.calibration, overrides[p.id]);
      if (p.id === cur.id) p.calibration = Object.assign({}, p.calibration, cal, { status: currentStatus() });
    });
    const blob = new Blob(["window.CSC_PRODUCTS = " + JSON.stringify(db, null, 2) + ";\n"], { type: "text/javascript" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "products.js";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  let tmr = null;
  function alertToast(msg) {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.remove("hidden");
    clearTimeout(tmr); tmr = setTimeout(() => t.classList.add("hidden"), 2600);
  }
})();
