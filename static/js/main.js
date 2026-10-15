/* =====================================================================
 *  main.js — page behaviour + interactive figures
 *  Depends on: Plotly (global), KaTeX auto-render (deferred), data.js
 * ===================================================================== */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  const C = {
    text: css("--c-text"), image: css("--c-image"), fused: css("--c-fused"), neg: css("--c-neg"),
    accent: css("--accent"), ink: css("--ink"), ink2: css("--ink-2"), ink3: css("--ink-3"),
    line: css("--line"), good: css("--good"), bad: css("--bad")
  };

  const baseLayout = (extra = {}) => Object.assign({
    paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "rgba(0,0,0,0)",
    font: { family: "Inter, sans-serif", size: 13, color: C.ink2 },
    margin: { l: 56, r: 20, t: 20, b: 50 },
    xaxis: { gridcolor: C.line, zerolinecolor: C.line, linecolor: C.line },
    yaxis: { gridcolor: C.line, zerolinecolor: C.line, linecolor: C.line },
    legend: { orientation: "h", y: 1.12, x: 0 },
    hoverlabel: { font: { family: "Inter, sans-serif" } }
  }, extra);
  const PCFG = { displayModeBar: false, responsive: true };
  const hasPlotly = typeof window.Plotly !== "undefined";
  // Run each widget in isolation: one failing widget must not blank the rest of the page.
  const safe = (name, fn) => { try { fn(); } catch (err) { console.error(`[${name}] widget failed:`, err); } };

  /* ---------------- NAV / SCROLL ---------------- */
  const navToggle = $("#navToggle"), navLinks = $("#navLinks");
  navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
  $$("#navLinks a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));

  const sections = $$("main section[id]");
  const progress = $("#navProgress"), toTop = $("#toTop");
  function onScroll() {
    const h = document.documentElement;
    progress.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + "%";
    toTop.classList.toggle("show", h.scrollTop > 800);
    let cur = "";
    sections.forEach(s => { if (s.getBoundingClientRect().top < 120) cur = s.id; });
    $$("#navLinks a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + cur));
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  toTop.addEventListener("click", () => window.scrollTo({ top: 0 }));
  onScroll();

  /* ---------------- REVEAL + COUNT-UP ---------------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      $$("[data-count]", e.target).forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach(el => io.observe(el));

  function countUp(el) {
    const end = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0, suf = el.dataset.suffix || "";
    const t0 = performance.now(), dur = 1100;
    (function tick(t) {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = (end * e).toFixed(dec) + suf;
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* ---------------- IMAGE PLACEHOLDERS ----------------
   * Any <img data-ph="..."> whose file is missing is swapped for a
   * labelled box telling you which paper figure belongs there.        */
  function makePh(label, src) {
    const d = document.createElement("div");
    d.className = "ph-box";
    d.innerHTML = `<span class="ph-title">📌 ${label}</span><code>${src}</code>`;
    return d;
  }
  function guardImg(img) {
    const swap = () => { if (img.dataset.swapped) return; img.dataset.swapped = 1; img.replaceWith(makePh(img.dataset.ph, img.getAttribute("src"))); };
    if (img.complete && img.naturalWidth === 0) swap();
    else img.addEventListener("error", swap);
  }
  $$("img[data-ph]").forEach(guardImg);

  /* Teaser: video if present, else Fig. 1 image */
  const vid = $(".teaser-video");
  if (vid) {
    const fallback = () => { vid.remove(); const w = $("#" + vid.dataset.fallback); if (w) w.hidden = false; };
    const src = $("source", vid);
    src.addEventListener("error", fallback);
    vid.addEventListener("error", fallback);
    // Some browsers fire no error for a 404'd <source>; check after a beat.
    setTimeout(() => { if (vid.isConnected && vid.readyState === 0 && vid.networkState === 3) fallback(); }, 1500);
  }

  /* ---------------- KaTeX ---------------- */
  window.addEventListener("load", () => {
    if (window.renderMathInElement) {
      renderMathInElement(document.body, {
        delimiters: [{ left: "$$", right: "$$", display: true }, { left: "\\(", right: "\\)", display: false }],
        throwOnError: false
      });
    }
  });

  /* ---------------- COPY BIBTEX ---------------- */
  $("#copyBib").addEventListener("click", async (e) => {
    try { await navigator.clipboard.writeText($("#bibText").innerText); e.target.textContent = "Copied ✓"; }
    catch { e.target.textContent = "Select & copy"; }
    setTimeout(() => (e.target.textContent = "Copy"), 1600);
  });

  if (!hasPlotly) { console.warn("Plotly failed to load — interactive charts disabled."); }

  /* =================================================================
   *  WIDGET 1 — V-curve slider
   * ================================================================= */
  safe("vCurve", function vCurve() {
    const V = window.V_CURVE, grid = $("#corpusGrid"), slider = $("#textRatio");
    if (!grid) return;
    const N = 60;
    const order = Array.from({ length: N }, (_, i) => i).sort((a, b) => ((a * 37) % N) - ((b * 37) % N));
    const docs = [];
    for (let i = 0; i < N; i++) { const d = document.createElement("div"); d.className = "doc img"; grid.appendChild(d); docs.push(d); }

    const interp = (x) => {
      for (let i = 1; i < V.x.length; i++) if (x <= V.x[i]) {
        const t = (x - V.x[i - 1]) / (V.x[i] - V.x[i - 1]); return V.y[i - 1] + t * (V.y[i] - V.y[i - 1]);
      }
      return V.y[V.y.length - 1];
    };

    /* ---------- right: SVG plot (no Plotly needed) ---------- */
    const host = $("#vcurvePlot");
    const IMG_END = 0.08, TXT_START = 0.67;           // zones match Fig. 1(a); keep in sync with the readout
    const W = 560, H = 400, M = { l: 54, r: 22, t: 22, b: 54 };
    const Y0 = 0.58, Y1 = 1.0, BW = 128, BH = 44;
    const sx = v => M.l + v * (W - M.l - M.r);
    const sy = v => H - M.b - (v - Y0) / (Y1 - Y0) * (H - M.t - M.b);
    const pathOf = pts => pts.map((p, i) => (i ? "L" : "M") + sx(p[0]).toFixed(1) + " " + sy(p[1]).toFixed(1)).join(" ");
    const full = V.x.map((x, i) => [x, V.y[i]]);
    const minI = V.y.indexOf(Math.min(...V.y));
    const yTicks = [0.6, 0.7, 0.8, 0.9, 1.0], xTicks = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
    const zones = [
      [0, IMG_END, C.image, "Image"],
      [IMG_END, TXT_START, null, "Mixed-modal"],
      [TXT_START, 1, C.text, "Text"]
    ];

    host.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Mean NDCG@10 versus text document ratio">
      <style>
        .vp-axis text{fill:var(--ink-3);font-size:11px}
        .vp-title{fill:var(--ink-3);font-size:12px}
        .vp-grid{stroke:var(--line);stroke-dasharray:3 4}
        .vp-pulse{transform-box:fill-box;transform-origin:center;animation:vpPulse 1.8s ease-out infinite}
        @keyframes vpPulse{0%{transform:scale(1);opacity:.55}100%{transform:scale(2.6);opacity:0}}
        @media (prefers-reduced-motion:reduce){.vp-pulse{animation:none;opacity:0}}
      </style>
      <defs>
        <marker id="vpArrowHead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="${C.accent}"/>
        </marker>
      </defs>

      ${zones.map(z => `
        <rect x="${sx(z[0])}" y="${M.t}" width="${sx(z[1]) - sx(z[0])}" height="${H - M.t - M.b}"
              fill="${z[2] || "var(--ink-3)"}" opacity="${z[2] ? 0.09 : 0.05}"/>
        <text x="${(sx(z[0]) + sx(z[1])) / 2}" y="${H - M.b - 10}" text-anchor="middle"
              font-size="11" font-weight="600" fill="${z[2] || "var(--ink-3)"}">${z[3]}</text>`).join("")}

      <g class="vp-axis">
        ${yTicks.map(t => `
          <line class="vp-grid" x1="${M.l}" x2="${W - M.r}" y1="${sy(t)}" y2="${sy(t)}"/>
          <text x="${M.l - 8}" y="${sy(t) + 4}" text-anchor="end">${t.toFixed(1)}</text>`).join("")}
        ${xTicks.map(t => `<text x="${sx(t)}" y="${H - M.b + 18}" text-anchor="middle">${Math.round(t * 100)}%</text>`).join("")}
      </g>
      <text class="vp-title" x="${(M.l + W - M.r) / 2}" y="${H - 8}" text-anchor="middle">Text document ratio in corpus</text>
      <text class="vp-title" transform="translate(14 ${(M.t + H - M.b) / 2}) rotate(-90)" text-anchor="middle">Mean NDCG@10</text>

      <!-- 全曲线（暗）+ 已走过部分（亮） -->
      <path d="${pathOf(full)}" fill="none" stroke="var(--ink-3)" stroke-opacity=".35" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
      <path id="vpDone" fill="none" stroke="${C.accent}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>

      <!-- 最低点 "Chaos in the Text" -->
      <circle cx="${sx(V.x[minI])}" cy="${sy(V.y[minI])}" r="4.5" fill="${C.bad}"/>
      <text x="${sx(V.x[minI])}" y="${sy(V.y[minI]) + 22}" text-anchor="middle" font-size="12" font-weight="700" fill="${C.bad}">Chaos in the Text · ${V.y[minI].toFixed(2)}</text>
      <text x="${sx(V.x[0]) + 8}" y="${sy(V.y[0]) - 8}" font-size="12" font-weight="700" fill="${C.image}">${V.y[0].toFixed(2)}</text>
      <text x="${sx(1)}" y="${sy(V.y[V.y.length - 1]) - 12}" text-anchor="end" font-size="12" font-weight="700" fill="${C.text}">${V.y[V.y.length - 1].toFixed(2)}</text>

      <!-- 当前位置：十字虚线 + 箭头 + 标注框 + 点 -->
      <line id="vpDropV" stroke="${C.accent}" stroke-opacity=".5" stroke-dasharray="4 4"/>
      <line id="vpDropH" stroke="${C.accent}" stroke-opacity=".5" stroke-dasharray="4 4"/>
      <line id="vpArrow" stroke="${C.accent}" stroke-width="2" marker-end="url(#vpArrowHead)"/>
      <g>
        <rect id="vpBox" width="${BW}" height="${BH}" rx="10" fill="var(--bg-alt)" stroke="${C.accent}" stroke-width="1.5"/>
        <text id="vpT1" font-size="10" text-anchor="middle" fill="var(--ink-3)" letter-spacing=".06em">YOU ARE HERE</text>
        <text id="vpT2" font-size="14" font-weight="700" text-anchor="middle" fill="var(--ink)"></text>
      </g>
      <circle id="vpPulse" class="vp-pulse" r="7" fill="${C.accent}"/>
      <circle id="vpDot" r="7" fill="${C.accent}" stroke="#fff" stroke-width="2.5"/>
    </svg>`;

    const q = id => host.querySelector("#" + id);
    const el = { done: q("vpDone"), dv: q("vpDropV"), dh: q("vpDropH"), arrow: q("vpArrow"),
                box: q("vpBox"), t1: q("vpT1"), t2: q("vpT2"), dot: q("vpDot"), pulse: q("vpPulse") };
    const set = (node, o) => Object.keys(o).forEach(k => node.setAttribute(k, o[k]));

    function updatePlot(r, y) {
      const px = sx(r), py = sy(y);
      const pts = full.filter(p => p[0] < r); pts.push([r, y]);
      el.done.setAttribute("d", pathOf(pts));
      set(el.dot, { cx: px, cy: py }); set(el.pulse, { cx: px, cy: py });
      set(el.dv, { x1: px, x2: px, y1: py, y2: H - M.b });
      set(el.dh, { x1: M.l, x2: px, y1: py, y2: py });

      // 标注框避开曲线：左半边放右上，高分处放右侧，右半边放左上
      let dx, dy;
      if (r >= 0.5)     { dx = -95; dy = -64; }
      else if (y > 0.8) { dx = 100; dy = 6; }
      else              { dx = 66;  dy = -68; }
      const cx = Math.min(W - M.r - BW / 2, Math.max(M.l + BW / 2, px + dx));
      const cy = Math.min(H - M.b - BH / 2 - 34, Math.max(M.t + BH / 2, py + dy));
      set(el.box, { x: cx - BW / 2, y: cy - BH / 2 });
      set(el.t1, { x: cx, y: cy - 6 });
      set(el.t2, { x: cx, y: cy + 12 });
      el.t2.textContent = "NDCG@10  " + y.toFixed(3);

      const vx = px - cx, vy = py - cy, len = Math.hypot(vx, vy) || 1;
      set(el.arrow, { x1: cx, y1: cy, x2: px - vx / len * 12, y2: py - vy / len * 12 });
    }

    /* ---------- left: 原逻辑 ---------- */
    function update(pct) {
      const r = pct / 100, k = Math.round(r * N), y = interp(r);
      order.forEach((idx, j) => { docs[idx].className = j < k ? "doc txt" : "doc img"; });
      $("#roRatio").textContent = pct + "%";
      $("#roScore").textContent = y.toFixed(3);
      $("#roZone").textContent = r < IMG_END ? "Image-dominant" : r > TXT_START ? "Text-dominant" : "Mixed-modal";
      $("#roScore").style.color = y < 0.75 ? C.bad : "";
      updatePlot(r, y);
    }
    slider.addEventListener("input", () => update(+slider.value));
    update(0);

    let timer = null;
    $("#vcurvePlay").addEventListener("click", (e) => {
      if (timer) { clearInterval(timer); timer = null; e.target.textContent = "▶ Play sweep"; return; }
      let v = 0; slider.value = 0; e.target.textContent = "⏸ Pause";
      timer = setInterval(() => {
        v += 1; slider.value = v; update(v);
        if (v >= 100) { clearInterval(timer); timer = null; e.target.textContent = "▶ Play sweep"; }
      }, 45);
    });
  });


  /* =================================================================
   *  WIDGET 2 — 3D composition surface explorer
   * ================================================================= */
  safe("surface", function surface() {
    if (!hasPlotly || !$("#surfacePlot")) return;
    const S = window.SURFACES;
    if (!S || !S.settings) { $("#surfacePlot").innerHTML = '<div class="ph-box">Surface data missing — run <code>python tools/npy_to_js.py</code></div>'; return; }
    // <select> values are the model keys used in surface-data.js
    const tr = { "Jina-CLIP-v2": "Trident-JinaCLIP", "Qwen3-VL-E-2B": "Trident-Qwen3VL-2B" };
    const pretty = { "Qwen3-VL-E-2B": "Qwen3-VL-Embedding-2B" };
    let mode = "before";
    const gridFor = (key) => S.settings[key] || null;

    const scaleBefore = [[0, "#7b3b5b"], [0.5, "#d9826b"], [1, "#f7d29a"]];
    const scaleAfter = [[0, "#3b2a8c"], [0.5, "#7a63e0"], [1, "#c9bdff"]];

    function render() {
      const m = $("#surfModel").value, d = $("#surfData").value;
      const before = gridFor(`${m}|${d}`), aKey = tr[m] ? `${tr[m]}|${d}` : null, after = aKey ? gridFor(aKey) : null;
      if (!before) { console.warn(`no surface grid for ${m}|${d}`); return; }
      $$("#surfMode button").forEach(b => { if (b.dataset.mode !== "before") b.disabled = !after; b.style.opacity = (b.dataset.mode !== "before" && !after) ? .4 : 1; });
      const useMode = after ? mode : "before";
      const traces = [];
      const mk = (g, scale, name, op) => ({
        type: "surface", x: g.text, y: g.fused, z: g.z, colorscale: scale, opacity: op, name, showscale: false,
        hovertemplate: `${name}<br>text %{x:.2f} · fused %{y:.2f} · image %{customdata:.2f}<br>NDCG@10 %{z:.3f}<extra></extra>`,
        customdata: g.fused.map(f => g.text.map(t => Math.max(0, 1 - t - f))),
        contours: { z: { show: true, usecolormap: true, project: { z: true }, width: 1 } }
      });
      const mName = pretty[m] || m;
      if (useMode !== "after") traces.push(mk(before, scaleBefore, mName, useMode === "both" ? 0.75 : 1));
      if (useMode !== "before") traces.push(mk(after, scaleAfter, tr[m], useMode === "both" ? 0.85 : 1));
      const n = before.text.length;
      $("#surfaceNote").textContent = `${n}×${n} grid · step ${(1 / (n - 1)).toFixed(3)} · ${d}`;
      Plotly.react("surfacePlot", traces, baseLayout({
        margin: { l: 0, r: 0, t: 0, b: 0 },
        scene: {
          xaxis: { title: "Text ratio", range: [0, 1], gridcolor: C.line, color: C.ink2 },
          yaxis: { title: "Fused ratio", range: [0, 1], gridcolor: C.line, color: C.ink2 },
          zaxis: { title: "NDCG@10", gridcolor: C.line, color: C.ink2 },
          camera: { eye: { x: -1.6, y: -1.5, z: 0.9 } }, aspectratio: { x: 1, y: 1, z: 0.7 }
        }
      }), PCFG);
    }
    $("#surfModel").addEventListener("change", render);
    $("#surfData").addEventListener("change", render);
    $$("#surfMode button").forEach(b => b.addEventListener("click", () => {
      if (b.disabled) return; mode = b.dataset.mode;
      $$("#surfMode button").forEach(x => x.classList.toggle("active", x === b)); render();
    }));
    render();
  });

  /* =================================================================
   *  WIDGET 3 — modality preference bars
   * ================================================================= */
  safe("preference", function preference() {
    if (!hasPlotly || !$("#prefPlot")) return;
    const P = window.PREFERENCE;
    let metric = "intf";
    const label = (r) => r.family === "Ours" ? `<b style="color:${C.accent}">${r.model}</b>` : r.model;
    function render() {
      const isI = metric === "intf", key = isI ? "intf" : "pos";
      const names = ["Text", "Image", "Fused"], cols = [C.text, C.image, C.fused];
      const traces = names.map((n, k) => ({
        type: "bar", name: `${n} positive`, x: P.map(label), y: P.map(r => r[key][k]), marker: { color: cols[k] },
        hovertemplate: `%{x}<br>${n} positive: %{y${isI ? ":.1f}%" : ":.3f}"}<extra></extra>`
      }));
      Plotly.react("prefPlot", traces, baseLayout({
        barmode: "group", bargap: 0.25, margin: { l: 56, r: 10, t: 30, b: 110 },
        xaxis: { tickangle: -35, gridcolor: "rgba(0,0,0,0)" },
        yaxis: { title: isI ? "Interference rate (%)" : "Mean positive cosine sim.", range: isI ? [0, 105] : [0, 0.85], gridcolor: C.line },
        shapes: [{ type: "rect", xref: "x", yref: "paper", x0: P.length - 1.5, x1: P.length - 0.5, y0: 0, y1: 1, fillcolor: C.accent, opacity: 0.08, line: { width: 0 } }]
      }), PCFG);
      $("#prefCaption").innerHTML = isI
        ? "<b>Interference rate</b> = % of queries (SlideVQA) where a text hard negative scores higher than the relevant document. Image positives are hit hardest — up to 100% for CLIP models. Trident brings all three modalities down to ≈ 10–12%."
        : "<b>Mean positive similarity</b> for the same queries and semantically identical documents in each modality. Baselines score text ≫ fused > image; Trident aligns them (0.674 / 0.672 / 0.670).";
    }
    $$("#prefMetric button").forEach(b => b.addEventListener("click", () => {
      metric = b.dataset.metric; $$("#prefMetric button").forEach(x => x.classList.toggle("active", x === b)); render();
    }));
    render();
  });

  /* =================================================================
   *  WIDGET 4 — Multi-Positive View InfoNCE playground
   * ================================================================= */
  safe("playground", function playground() {
    if (!$("#pgBars")) return;
    const OTHER_N = 30;                       // aggregated easy in-batch negatives
    const items = [
      { id: "sT", label: "Text +", c: C.text, pos: true },
      { id: "sI", label: "Image +", c: C.image, pos: true },
      { id: "sF", label: "Fused +", c: C.fused, pos: true },
      { id: "sN1", label: "Irrel. text", c: C.neg, pos: false },
      { id: "sN2", label: "Irrel. image", c: "#b8bcc8", pos: false },
      { id: null, label: `Other ×${OTHER_N}`, c: "#d6d9e1", pos: false, other: true }
    ];
    const defaults = { sT: 0.66, sI: 0.48, sF: 0.51, sN1: 0.58, sN2: 0.30 };
    let sOther = 0.15;
    const M = 3;

    const bars = $("#pgBars");
    bars.style.gridTemplateColumns = `repeat(${items.length}, 1fr)`;
    bars.style.position = "relative";
    bars.innerHTML = items.map((it, k) => `<div class="pg-bar ${it.pos ? "pos" : ""}" style="--c:${it.c}">
      <span class="grad" id="g${k}"></span><span class="pv" id="pv${k}"></span><div class="fill" id="f${k}"></div></div>`).join("")
      + `<div class="pg-uniform" id="pgU"></div>`;
    const lab = document.createElement("div");
    lab.className = "pg-labels"; lab.style.gridTemplateColumns = `repeat(${items.length}, 1fr)`;
    lab.innerHTML = items.map(it => `<div>${it.label}</div>`).join("");
    bars.after(lab);

    const scores = () => items.map(it => it.other ? sOther : +$("#" + it.id).value);
    function compute() {
      const tau = +$("#tau").value, s = scores();
      const w = items.map((it, k) => Math.exp(s[k] / tau) * (it.other ? OTHER_N : 1));
      const Z = w.reduce((a, b) => a + b, 0);
      const pAgg = w.map(x => x / Z);                         // aggregated prob per bar
      const pEach = pAgg.map((p, k) => items[k].other ? p / OTHER_N : p); // prob per single candidate
      const rho = pAgg[0] + pAgg[1] + pAgg[2];
      const r = [0, 1, 2].map(k => pAgg[k] / rho);
      const kl = r.reduce((a, rk) => a + (1 / M) * Math.log((1 / M) / rk), 0);
      const loss = -Math.log(rho) + kl + Math.log(M);
      const grad = items.map((it, k) => (pEach[k] - (it.pos ? 1 / M : 0)) / tau); // dL/ds per candidate
      return { s, tau, pAgg, rho, kl, loss, grad };
    }

    function render() {
      const R = compute();
      $("#vSt").textContent = R.s[0].toFixed(2); $("#vSi").textContent = R.s[1].toFixed(2); $("#vSf").textContent = R.s[2].toFixed(2);
      $("#vSn1").textContent = R.s[3].toFixed(2); $("#vSn2").textContent = R.s[4].toFixed(2); $("#vTau").textContent = R.tau.toFixed(3);
      items.forEach((it, k) => {
        $("#f" + k).style.height = (R.pAgg[k] * 100 * 0.82) + "%";
        $("#pv" + k).textContent = R.pAgg[k] < 0.001 ? "<.001" : R.pAgg[k].toFixed(3);
        const g = -R.grad[k], mag = Math.abs(g), el = $("#g" + k);
        el.className = "grad " + (g > 0 ? "up" : "down");
        el.textContent = mag < 0.05 ? "" : (g > 0 ? "▲" : "▼").repeat(mag > 6 ? 3 : mag > 2 ? 2 : 1);
        el.title = `−∂L/∂s = ${g.toFixed(2)}`;
      });
      $("#pgU").style.bottom = (100 / 3 * 0.82) + "%";
      $("#pgU").title = "target p = 1/M for each positive";
      $("#mRho").textContent = R.rho.toFixed(3);
      $("#mRel").textContent = (-Math.log(R.rho)).toFixed(3);
      $("#mKL").textContent = R.kl.toFixed(3);
      $("#mLoss").textContent = R.loss.toFixed(3);
      // ranking
      const ranked = items.map((it, k) => ({ it, s: R.s[k] })).sort((a, b) => b.s - a.s);
      const imgRank = ranked.findIndex(x => x.it.id === "sI") + 1;
      $("#pgRank").innerHTML = `<b>Ranking for this query:</b> ` + ranked.map(x =>
        `<span class="${x.it.pos ? "rk-pos" : ""}" style="color:${x.it.pos ? x.it.c : ""}">${x.it.label} (${x.s.toFixed(2)})</span>`).join(" › ")
        + (R.s[3] > R.s[1] ? ` <br><span style="color:${C.bad}">⚠ the irrelevant text outranks the relevant image (image at #${imgRank}).</span>`
                            : ` <br><span style="color:${C.good}">✓ all relevant views rank above the irrelevant text.</span>`);
    }

    function step() {
      const R = compute(), lr = 0.004;
      items.forEach((it, k) => {
        const nv = Math.max(-0.2, Math.min(1, R.s[k] - lr * R.grad[k]));
        if (it.other) sOther = nv; else $("#" + it.id).value = nv;
      });
      render();
    }
    $$(".pg-controls input").forEach(i => i.addEventListener("input", render));
    $("#pgStep").addEventListener("click", step);
    $("#pgReset").addEventListener("click", () => { Object.entries(defaults).forEach(([k, v]) => ($("#" + k).value = v)); sOther = 0.15; render(); });
    let timer = null;
    $("#pgTrain").addEventListener("click", (e) => {
      if (timer) { clearInterval(timer); timer = null; e.target.textContent = "▶ Train (gradient steps)"; return; }
      let n = 0; e.target.textContent = "⏸ Stop";
      timer = setInterval(() => { step(); if (++n >= 80) { clearInterval(timer); timer = null; e.target.textContent = "▶ Train (gradient steps)"; } }, 50);
    });
    render();
  });

  /* =================================================================
   *  WIDGET 5 — results tables
   * ================================================================= */
  safe("tables", function tables() {
    const wrap = $("#tableWrap");
    if (!wrap) return;
    let which = "doc", setting = "mix";

    function render() {
      const T = which === "doc" ? window.DOC_TABLE : window.NAT_TABLE;
      const nD = T.datasets.length;
      const subs = setting === "both" ? [0, 1] : setting === "origin" ? [0] : [1];
      const cols = []; T.datasets.forEach((d, di) => subs.forEach(si => cols.push(di * 2 + si)));

      let h = `<table class="res"><thead><tr><th rowspan="${subs.length > 1 ? 2 : 1}">Model</th>`;
      T.datasets.forEach((d, di) => { h += `<th colspan="${subs.length}" class="${di === nD - 1 ? "avg" : ""}">${d}${subs.length === 1 ? ` <span style="font-weight:500;color:var(--ink-3)">(${subs[0] ? "Mix" : "Origin"})</span>` : ""}</th>`; });
      h += `</tr>`;
      if (subs.length > 1) { h += `<tr class="sub">`; T.datasets.forEach((d, di) => subs.forEach((si, j) => h += `<th class="${di === nD - 1 && j === 0 ? "avg" : ""}">${si ? "Mix" : "Origin"}</th>`)); h += `</tr>`; }
      h += `</thead><tbody>`;

      T.groups.forEach(g => {
        const base = g.rows.find(r => r.base);
        const rank = {};
        cols.forEach(c => {
          const vals = [...new Set(g.rows.map(r => r.v[c]))].sort((a, b) => b - a);
          rank[c] = { best: vals[0], second: vals[1] };
        });
        h += `<tr class="grp"><td colspan="${cols.length + 1}">${g.name}</td></tr>`;
        g.rows.forEach(r => {
          const cls = r.ours ? "ours" : r.ablation ? "abl" : r.sub ? "subrow" : "";
          h += `<tr class="${cls}"><td>${r.model}</td>`;
          cols.forEach(c => {
            const v = r.v[c], isAvg = Math.floor(c / 2) === nD - 1 && (subs.length === 1 || c % 2 === 0);
            const k = v === rank[c].best ? "best" : v === rank[c].second ? "second" : "";
            let delta = "";
            if (r.ours && base) { const dv = v - base.v[c]; delta = `<span class="delta" style="color:${dv >= 0 ? C.good : C.bad}">${dv >= 0 ? "+" : ""}${dv.toFixed(1)}</span>`; }
            h += `<td class="${k} ${isAvg ? "avg" : ""}">${v.toFixed(2)}${delta}</td>`;
          });
          h += `</tr>`;
        });
      });
      wrap.innerHTML = h + `</tbody></table>`;
    }
    $$("#tblBench button").forEach(b => b.addEventListener("click", () => { which = b.dataset.t; $$("#tblBench button").forEach(x => x.classList.toggle("active", x === b)); render(); }));
    $$("#tblSetting button").forEach(b => b.addEventListener("click", () => { setting = b.dataset.s; $$("#tblSetting button").forEach(x => x.classList.toggle("active", x === b)); render(); }));
    render();
  });

  /* =================================================================
   *  WIDGET 6 — Origin → Mix dumbbell
   * ================================================================= */
  safe("dumbbell", function dumbbell() {
    if (!hasPlotly || !$("#dumbbellPlot")) return;
    const rows = [];
    window.DOC_TABLE.groups.forEach(g => {
      let parent = "";
      g.rows.forEach(r => {
        if (r.ablation) return;
        const name = r.sub ? `${parent} + GR-CLIP` : r.model.replace(" (Ours)", "");
        if (!r.sub) parent = r.model;
        rows.push({ name, ours: !!r.ours, o: r.v[12], m: r.v[13] });
      });
    });
    rows.sort((a, b) => a.m - b.m);
    const y = rows.map(r => r.ours ? `<b>${r.name}</b>` : r.name);
    const traces = rows.map((r, i) => ({
      x: [r.o, r.m], y: [y[i], y[i]], mode: "lines", showlegend: false, hoverinfo: "skip",
      line: { color: r.ours ? C.accent : (r.m < r.o ? C.bad : C.good), width: r.ours ? 4 : 2.5 }
    }));
    traces.push({ x: rows.map(r => r.o), y, mode: "markers", name: "Origin", marker: { size: 10, color: "#fff", line: { color: C.ink3, width: 2 } }, hovertemplate: "%{y}<br>Origin %{x:.2f}<extra></extra>" });
    traces.push({ x: rows.map(r => r.m), y, mode: "markers", name: "Mix", marker: { size: 11, color: rows.map(r => r.ours ? C.accent : C.ink2) }, hovertemplate: "%{y}<br>Mix %{x:.2f}<extra></extra>" });
    Plotly.newPlot("dumbbellPlot", traces, baseLayout({
      height: 520, margin: { l: 250, r: 20, t: 30, b: 46 },
      xaxis: { title: "Average NDCG@10", range: [0, 90], gridcolor: C.line },
      yaxis: { automargin: true, gridcolor: "rgba(0,0,0,0)" }
    }), PCFG);
  });

  /* =================================================================
   *  Before / after comparison sliders
   * ================================================================= */
  $$(".compare").forEach(box => {
    const mkLayer = (cls, src, ph) => {
      const l = document.createElement("div"); l.className = "layer " + cls;
      const img = new Image(); img.src = src; img.alt = cls; img.dataset.ph = ph;
      l.appendChild(img); box.appendChild(l); guardImg(img); return l;
    };
    mkLayer("before", box.dataset.before, box.dataset.phBefore);
    const after = mkLayer("after", box.dataset.after, box.dataset.phAfter);
    box.insertAdjacentHTML("beforeend", `<span class="lbl l">Before</span><span class="lbl r">After Trident</span><div class="handle"></div>`);
    const handle = $(".handle", box);
    const set = (clientX) => {
      const r = box.getBoundingClientRect(), p = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
      after.style.clipPath = `inset(0 0 0 ${p * 100}%)`; handle.style.left = p * 100 + "%";
    };
    let drag = false;
    box.addEventListener("pointerdown", e => { drag = true; box.setPointerCapture(e.pointerId); set(e.clientX); });
    box.addEventListener("pointermove", e => drag && set(e.clientX));
    box.addEventListener("pointerup", () => (drag = false));
  });
})();
