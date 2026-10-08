// @ts-nocheck — legacy vanilla JS, kept as-is until converted to explainers.
/**
 * Interactive Concept Visualizers
 * ---------------------------------
 * Vanilla canvas playgrounds carried over from the original app. Concepts without a guided
 * explainer show these instead; each one is a candidate for conversion to src/lib/explainers.
 *
 *   import { visualizerIds, renderVisualizer } from './visualizers.js';
 *   renderVisualizer('kmeans', someElement); // -> true | false
 *
 * Each call replaces the container contents and disposes whatever the previous
 * call left running (intervals, observers). Colors are read from CSS variables
 * so drawings follow the theme; the accent follows `--modal-accent` if present.
 */

/* =========================================================================
   Registry
   ========================================================================= */
const REGISTRY = {
  'what-is-gradient-descent': vizGradientDescent,
  'dl-optimizers': vizGradientDescent,
  'bias-variance-tradeoff': vizPolyFit,
  'overfitting-underfitting': vizPolyFit,
  'kmeans': vizKMeans,
  'knn': vizKnn,
  'roc-auc': vizRoc,
  'precision-recall-f1': vizRoc,
  'pr-curve': vizRoc,
  'activation-functions': vizActivations,
  'pca': vizPca,
  'decision-tree': vizDecisionTree,
};

export const visualizerIds = Object.keys(REGISTRY);

let activeCleanup = null;

/** Stop timers / observers left by the previous visualizer (safe to call anytime). */
export function destroyVisualizer() {
  if (activeCleanup) {
    const fn = activeCleanup;
    activeCleanup = null;
    fn();
  }
}

/**
 * Render the visualizer for `conceptId` into `container` (contents replaced).
 * @returns {boolean} true if a visualizer exists and was rendered.
 */
export function renderVisualizer(conceptId, container) {
  destroyVisualizer();
  const build = REGISTRY[conceptId];
  if (!build || !container) return false;
  container.innerHTML = '';
  const env = createEnv(container);
  try {
    build(container, env, conceptId);
  } catch (err) {
    console.error('[visualizers] failed to render', conceptId, err);
    env.dispose();
    container.innerHTML = '';
    return false;
  }
  activeCleanup = env.dispose;
  return true;
}

/* =========================================================================
   Small utilities
   ========================================================================= */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = (v, d = 2) => (!Number.isFinite(v) ? '—' : Math.abs(v) >= 1e5 ? v.toExponential(2) : v.toFixed(d));
const pct = (v, d = 1) => (Number.isFinite(v) ? (v * 100).toFixed(d) + '%' : '—');

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand) {
  let spare = null;
  return () => {
    if (spare !== null) { const s = spare; spare = null; return s; }
    let u = 0;
    while (u === 0) u = rand();
    const v = rand();
    const r = Math.sqrt(-2 * Math.log(u));
    spare = r * Math.sin(2 * Math.PI * v);
    return r * Math.cos(2 * Math.PI * v);
  };
}

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

/** Convert '#rgb', '#rrggbb' or 'rgb(a)(...)' to an rgba() string with alpha `a`. */
function alpha(color, a) {
  const c = (color || '').trim();
  let r = 255, g = 255, b = 255;
  if (c[0] === '#') {
    let hex = c.slice(1);
    if (hex.length === 3) hex = hex.split('').map((ch) => ch + ch).join('');
    const n = parseInt(hex.slice(0, 6), 16);
    r = (n >> 16) & 255; g = (n >> 8) & 255; b = n & 255;
  } else {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (m) [r, g, b] = m[1].split(',').map((s) => parseFloat(s));
  }
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/* =========================================================================
   Lifecycle environment
   ========================================================================= */
function createEnv(container) {
  const disposers = [];
  let disposed = false;
  const env = {
    onDispose(fn) { disposers.push(fn); },
    alive() {
      if (disposed) return false;
      if (!container.isConnected) { env.dispose(); return false; }
      return true;
    },
    interval(fn, ms) {
      const id = setInterval(() => { if (env.alive()) fn(); }, ms);
      const stop = () => clearInterval(id);
      disposers.push(stop);
      return stop;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      disposers.splice(0).forEach((fn) => { try { fn(); } catch (e) { /* ignore */ } });
      if (activeCleanup === env.dispose) activeCleanup = null;
    },
  };
  return env;
}

/** Interval-driven runner with start/stop/toggle and a state callback. */
function makeRunner(env, stepFn, ms, onState) {
  let stop = null;
  const runner = {
    get running() { return !!stop; },
    start() {
      if (stop) return;
      stop = env.interval(() => { if (stepFn() === false) runner.stop(); }, ms);
      onState(true);
    },
    stop() {
      if (!stop) return;
      stop(); stop = null;
      onState(false);
    },
    toggle() { stop ? runner.stop() : runner.start(); },
  };
  return runner;
}

/* =========================================================================
   Theme
   ========================================================================= */
function readTheme(node) {
  const cs = getComputedStyle(node);
  const v = (name, fb) => (cs.getPropertyValue(name) || '').trim() || fb;
  return {
    plotBg: v('--viz-bg', '#ffffff'),
    panel: v('--surface-2', '#f4f4f2'),
    text: v('--text', '#18181b'),
    text2: v('--text-2', '#52525b'),
    muted: v('--text-3', '#8a8a93'),
    grid: v('--viz-grid', 'rgba(0, 0, 0, 0.06)'),
    axis: v('--viz-axis', 'rgba(0, 0, 0, 0.25)'),
    cyan: v('--viz-5', '#0891b2'),
    green: v('--viz-2', '#059669'),
    violet: v('--viz-6', '#7c3aed'),
    amber: v('--viz-3', '#d97706'),
    rose: v('--viz-4', '#db2777'),
    indigo: v('--viz-1', '#4f46e5'),
    blue: v('--color-track-de', '#2563eb'),
    danger: v('--danger', '#dc2626'),
    accent: v('--viz-accent', '#4f46e5'),
    mono: v('--font-mono', 'monospace'),
    body: v('--font-sans', 'sans-serif'),
  };
}

/* =========================================================================
   DOM building blocks
   ========================================================================= */
function frame(container, { title, accentVar, subtitle }) {
  const root = el('div', 'viz');
  root.style.setProperty('--viz-accent', `var(--modal-accent, var(${accentVar}))`);
  const head = el('div', 'viz-head');
  head.append(el('span', 'viz-kicker', 'Interactive'), el('h4', 'viz-title', title));
  if (subtitle) head.append(el('p', 'viz-subtitle', subtitle));
  root.append(head);
  container.append(root);
  return root;
}

function makeCanvas(env, parent, opts = {}) {
  const { aspect = 0.6, minH = 180, maxH = 380 } = opts;
  const wrap = el('div', 'viz-canvas-wrap');
  const canvas = el('canvas', 'viz-canvas');
  wrap.append(canvas);
  parent.append(wrap);
  const S = { canvas, wrap, ctx: canvas.getContext('2d'), w: 0, h: 0, draw: null };
  let lastW = -1;
  S.fit = () => {
    const w = Math.max(160, Math.floor(wrap.clientWidth || 320));
    const h = Math.round(clamp(w * aspect, minH, maxH));
    const dpr = clamp(window.devicePixelRatio || 1, 1, 3);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.height = h + 'px';
    S.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    S.w = w; S.h = h; lastW = w;
  };
  S.redraw = () => { if (S.draw) S.draw(); };
  S.point = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  S.fit();
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => {
      const w = Math.floor(wrap.clientWidth);
      if (w > 0 && w !== lastW) { S.fit(); S.redraw(); }
    });
    ro.observe(wrap);
    env.onDispose(() => ro.disconnect());
  } else {
    const onResize = () => { S.fit(); S.redraw(); };
    window.addEventListener('resize', onResize);
    env.onDispose(() => window.removeEventListener('resize', onResize));
  }
  return S;
}

function controls(parent) {
  const box = el('div', 'viz-controls');
  parent.append(box);
  return box;
}

function slider(parent, { label, min, max, step, value, format = (v) => String(v), onInput }) {
  const row = el('label', 'viz-control');
  const top = el('div', 'viz-control-top');
  const valEl = el('span', 'viz-control-value');
  top.append(el('span', 'viz-control-label', label), valEl);
  const input = el('input', 'viz-range');
  input.type = 'range';
  input.min = min; input.max = max; input.step = step; input.value = value;
  const refresh = () => { valEl.textContent = format(+input.value); };
  input.addEventListener('input', () => { refresh(); onInput(+input.value); });
  refresh();
  row.append(top, input);
  parent.append(row);
  return {
    input,
    get value() { return +input.value; },
    set(v) { input.value = v; refresh(); },
  };
}

function buttonRow(parent) {
  const row = el('div', 'viz-buttons');
  parent.append(row);
  return row;
}

function button(parent, label, onClick, variant = '') {
  const b = el('button', 'viz-btn' + (variant ? ' viz-btn-' + variant : ''), label);
  b.type = 'button';
  b.addEventListener('click', onClick);
  parent.append(b);
  return b;
}

function segmented(parent, options, value, onChange) {
  const wrap = el('div', 'viz-segmented');
  const btns = options.map(([val, label]) => {
    const b = el('button', 'viz-seg-btn', label);
    b.type = 'button';
    b.addEventListener('click', () => { set(val); onChange(val); });
    wrap.append(b);
    return [val, b];
  });
  function set(v) { btns.forEach(([val, b]) => b.classList.toggle('active', val === v)); }
  set(value);
  parent.append(wrap);
  return { set };
}

function selectBox(parent, label, options, value, onChange) {
  const row = el('label', 'viz-control');
  const top = el('div', 'viz-control-top');
  top.append(el('span', 'viz-control-label', label));
  const sel = el('select', 'viz-select');
  options.forEach(([val, text]) => {
    const o = el('option', '', text);
    o.value = val;
    sel.append(o);
  });
  sel.value = value;
  sel.addEventListener('change', () => onChange(sel.value));
  row.append(top, sel);
  parent.append(row);
  return sel;
}

function checkbox(parent, label, checked, onChange, swatch) {
  const row = el('label', 'viz-check');
  const input = el('input');
  input.type = 'checkbox';
  input.checked = checked;
  input.addEventListener('change', () => onChange(input.checked));
  row.append(input);
  if (swatch) {
    const sw = el('span', 'viz-swatch');
    sw.style.background = swatch;
    row.append(sw);
  }
  row.append(el('span', '', label));
  parent.append(row);
  return input;
}

function readouts(parent, defs) {
  const grid = el('div', 'viz-readouts');
  const map = {};
  defs.forEach(([key, label]) => {
    const cell = el('div', 'viz-readout');
    const v = el('span', 'viz-readout-value', '—');
    cell.append(el('span', 'viz-readout-label', label), v);
    grid.append(cell);
    map[key] = v;
  });
  parent.append(grid);
  return {
    set(key, text, tone) {
      const n = map[key];
      if (!n) return;
      n.textContent = text;
      n.dataset.tone = tone || '';
    },
  };
}

function caption(parent, text) {
  const p = el('p', 'viz-caption');
  p.append(el('strong', '', 'What to notice: '), document.createTextNode(text));
  parent.append(p);
  return p;
}

/* =========================================================================
   Plot helpers
   ========================================================================= */
function plotBox(S, pad = {}) {
  const p = { l: 36, r: 10, t: 12, b: 24, ...pad };
  return { x: p.l, y: p.t, w: Math.max(10, S.w - p.l - p.r), h: Math.max(10, S.h - p.t - p.b) };
}

function mapper(box, xd, yd) {
  return {
    box, xd, yd,
    X: (x) => box.x + ((x - xd[0]) / (xd[1] - xd[0])) * box.w,
    Y: (y) => box.y + box.h - ((y - yd[0]) / (yd[1] - yd[0])) * box.h,
    invX: (px) => xd[0] + ((px - box.x) / box.w) * (xd[1] - xd[0]),
    invY: (py) => yd[0] + ((box.y + box.h - py) / box.h) * (yd[1] - yd[0]),
  };
}

/** Equal-scale domain: y in [0,1] and x widened to match the box aspect. */
function equalMapper(box, pad = 0.04) {
  const ratio = box.w / box.h;
  const yd = [-pad, 1 + pad];
  const span = (yd[1] - yd[0]) * ratio;
  return mapper(box, [0.5 - span / 2, 0.5 + span / 2], yd);
}

function niceStep(span, n) {
  const raw = span / Math.max(1, n);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const r = raw / mag;
  return (r < 1.5 ? 1 : r < 3 ? 2 : r < 7 ? 5 : 10) * mag;
}

function ticks(a, b, n) {
  const step = niceStep(b - a, n);
  const out = [];
  for (let v = Math.ceil(a / step) * step; v <= b + step * 1e-6; v += step) out.push(+v.toFixed(10));
  return out;
}

function clearCanvas(S, T) {
  const { ctx } = S;
  ctx.clearRect(0, 0, S.w, S.h);
  ctx.fillStyle = T.plotBg;
  ctx.fillRect(0, 0, S.w, S.h);
}

function drawAxes(S, T, m, o = {}) {
  const { ctx } = S;
  const { box, xd, yd } = m;
  const xt = o.xTicks ?? ticks(xd[0], xd[1], Math.max(2, Math.floor(box.w / 70)));
  const yt = o.yTicks ?? ticks(yd[0], yd[1], Math.max(2, Math.floor(box.h / 45)));
  const fx = o.fmtX || ((v) => String(+v.toFixed(2)));
  const fy = o.fmtY || ((v) => String(+v.toFixed(2)));
  ctx.save();
  ctx.lineWidth = 1;
  ctx.font = `10px ${T.mono}`;
  ctx.fillStyle = T.muted;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  xt.forEach((v) => {
    const x = Math.round(m.X(v)) + 0.5;
    ctx.strokeStyle = Math.abs(v) < 1e-9 && o.zeroLines ? T.axis : T.grid;
    ctx.beginPath(); ctx.moveTo(x, box.y); ctx.lineTo(x, box.y + box.h); ctx.stroke();
    if (!o.hideXLabels) ctx.fillText(fx(v), x, box.y + box.h + 6);
  });
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  yt.forEach((v) => {
    const y = Math.round(m.Y(v)) + 0.5;
    ctx.strokeStyle = Math.abs(v) < 1e-9 && o.zeroLines ? T.axis : T.grid;
    ctx.beginPath(); ctx.moveTo(box.x, y); ctx.lineTo(box.x + box.w, y); ctx.stroke();
    if (!o.hideYLabels) ctx.fillText(fy(v), box.x - 6, y);
  });
  ctx.strokeStyle = T.axis;
  ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1);
  if (o.xLabel) {
    ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillStyle = T.text2;
    ctx.fillText(o.xLabel, box.x + box.w - 4, box.y + box.h - 4);
  }
  if (o.yLabel) {
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillStyle = T.text2;
    ctx.fillText(o.yLabel, box.x + 5, box.y + 4);
  }
  ctx.restore();
}

function clipTo(ctx, box) {
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.w, box.h);
  ctx.clip();
}

function plotFn(ctx, m, f, { color, width = 2, dash = null, samples } = {}) {
  const n = samples || Math.max(80, Math.round(m.box.w));
  ctx.save();
  clipTo(ctx, m.box);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  let pen = false;
  for (let i = 0; i <= n; i++) {
    const x = m.xd[0] + ((m.xd[1] - m.xd[0]) * i) / n;
    const y = f(x);
    if (!Number.isFinite(y)) { pen = false; continue; }
    const py = clamp(m.Y(y), m.box.y - 1000, m.box.y + m.box.h + 1000);
    if (pen) ctx.lineTo(m.X(x), py); else ctx.moveTo(m.X(x), py);
    pen = true;
  }
  ctx.stroke();
  ctx.restore();
}

function dot(ctx, x, y, r, fill, stroke, lw = 1.5) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

function cross(ctx, x, y, s, color, lw = 3) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = lw + 3;
  ctx.beginPath();
  ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s);
  ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.stroke();
  ctx.restore();
}

function label(ctx, T, text, x, y, { color, align = 'left', base = 'middle', size = 10 } = {}) {
  ctx.save();
  ctx.font = `${size}px ${T.mono}`;
  ctx.fillStyle = color || T.text2;
  ctx.textAlign = align;
  ctx.textBaseline = base;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/* =========================================================================
   Shared math
   ========================================================================= */
/** Solve A x = b (Gaussian elimination, partial pivoting). A, b are copied. */
export function solveLinear(A0, b0) {
  const n = b0.length;
  const A = A0.map((r) => r.slice());
  const b = b0.slice();
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    if (Math.abs(A[p][c]) < 1e-300) continue;
    [A[c], A[p]] = [A[p], A[c]];
    [b[c], b[p]] = [b[p], b[c]];
    for (let r = c + 1; r < n; r++) {
      const f = A[r][c] / A[c][c];
      if (f === 0) continue;
      for (let k = c; k < n; k++) A[r][k] -= f * A[c][k];
      b[r] -= f * b[c];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = b[r];
    for (let k = r + 1; k < n; k++) s -= A[r][k] * x[k];
    x[r] = Math.abs(A[r][r]) < 1e-300 ? 0 : s / A[r][r];
  }
  return x;
}

/** Chebyshev basis T_0..T_d at x in [-1,1] (same polynomial space as 1, x, ..., x^d; far better conditioned). */
function polyBasis(x, d) {
  const r = new Array(d + 1);
  r[0] = 1;
  if (d >= 1) r[1] = x;
  for (let k = 2; k <= d; k++) r[k] = 2 * x * r[k - 1] - r[k - 2];
  return r;
}

/** Least-squares polynomial fit via ridge-regularised normal equations (xs already in [-1,1]). */
export function fitPolynomial(xs, ys, degree, ridge = 1e-8) {
  const n = degree + 1;
  const A = Array.from({ length: n }, () => new Array(n).fill(0));
  const b = new Array(n).fill(0);
  for (let i = 0; i < xs.length; i++) {
    const phi = polyBasis(xs[i], degree);
    for (let r = 0; r < n; r++) {
      b[r] += phi[r] * ys[i];
      for (let c = 0; c < n; c++) A[r][c] += phi[r] * phi[c];
    }
  }
  for (let r = 0; r < n; r++) A[r][r] += ridge;
  const w = solveLinear(A, b);
  return (x) => {
    const phi = polyBasis(x, degree);
    let s = 0;
    for (let k = 0; k <= degree; k++) s += w[k] * phi[k];
    return s;
  };
}

function mse(f, xs, ys) {
  let s = 0;
  for (let i = 0; i < xs.length; i++) { const e = f(xs[i]) - ys[i]; s += e * e; }
  return s / xs.length;
}

/** ROC points + AUC (trapezoid with tie grouping) for scores where higher = positive. */
export function rocCurve(pos, neg) {
  const all = pos.map((s) => [s, 1]).concat(neg.map((s) => [s, 0])).sort((a, b) => b[0] - a[0]);
  const P = pos.length, N = neg.length;
  const roc = [[0, 0]];
  const pr = [];
  let tp = 0, fp = 0, auc = 0, ap = 0, prevR = 0;
  for (let i = 0; i < all.length;) {
    const s = all[i][0];
    let dtp = 0, dfp = 0;
    while (i < all.length && all[i][0] === s) { if (all[i][1]) dtp++; else dfp++; i++; }
    const x0 = fp / N, y0 = tp / P;
    tp += dtp; fp += dfp;
    const x1 = fp / N, y1 = tp / P;
    auc += (x1 - x0) * (y0 + y1) / 2;
    roc.push([x1, y1]);
    const prec = tp / (tp + fp);
    pr.push([y1, prec]);
    ap += (y1 - prevR) * prec;
    prevR = y1;
  }
  return { roc, pr, auc, ap };
}

/** Two-moons dataset scaled into roughly [0.06, 0.94]^2. */
function makeMoons(seed, n, noise = 0.16) {
  const rand = mulberry32(seed);
  const g = gaussian(rand);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const cls = i % 2;
    const t = rand() * Math.PI;
    let x, y;
    if (cls === 0) { x = Math.cos(t); y = Math.sin(t); } else { x = 1 - Math.cos(t); y = 0.45 - Math.sin(t); }
    x += g() * noise; y += g() * noise;
    pts.push({ x: clamp((x + 1.35) / 3.7, 0.02, 0.98), y: clamp((y + 0.95) / 2.1, 0.02, 0.98), c: cls });
  }
  return pts;
}

/* =========================================================================
   1. Gradient descent (+ optimizers)
   ========================================================================= */
function vizGradientDescent(container, env, id) {
  const withOpt = id === 'dl-optimizers';
  const root = frame(container, {
    title: withOpt ? 'Optimizers on a non-convex loss' : 'Gradient descent on a 1D loss',
    accentVar: withOpt ? '--color-track-dl' : '--color-track-fundamentals',
    subtitle: 'Click the curve to choose a start position.',
  });

  const f = (x) => 0.25 * x ** 4 + 0.2 * x ** 3 - x * x + 1;
  const df = (x) => x ** 3 + 0.6 * x * x - 2 * x;
  const XD = [-3, 2.6], YD = [-1.4, 5.2];
  const GLOBAL = -1.7456, LOCAL = 1.1456;
  const lrFromT = (t) => 0.01 * Math.pow(120, t / 100);
  const tFromLr = (lr) => (100 * Math.log(lr / 0.01)) / Math.log(120);

  const S = makeCanvas(env, root, { aspect: 0.55, minH: 200, maxH: 340 });
  const st = { lr: 0.05, x0: 2.2, opt: 'sgd', x: 2.2, trail: [], steps: 0, v: 0, m: 0, s: 0, status: 'ready' };

  const ctr = controls(root);
  let optSel = null;
  if (withOpt) {
    optSel = selectBox(ctr, 'Optimizer', [['sgd', 'SGD'], ['momentum', 'Momentum (β = 0.9)'], ['adam', 'Adam']], st.opt, (v) => {
      st.opt = v;
      if (v === 'adam' && st.lr < 0.05) { st.lr = 0.1; lrSlider.set(tFromLr(0.1)); }
      reset();
    });
  }
  const lrSlider = slider(ctr, {
    label: 'Learning rate η', min: 0, max: 100, step: 0.5, value: tFromLr(st.lr),
    format: (t) => { const lr = lrFromT(t); return lr < 0.1 ? lr.toFixed(3) : lr.toFixed(2); },
    onInput: (t) => { st.lr = lrFromT(t); reset(); },
  });
  const startSlider = slider(ctr, {
    label: 'Start position x₀', min: XD[0], max: XD[1], step: 0.05, value: st.x0, format: (v) => v.toFixed(2),
    onInput: (v) => { st.x0 = v; reset(); },
  });
  const btns = buttonRow(root);
  button(btns, 'Step', () => { runner.stop(); step(); });
  const runBtn = button(btns, 'Run', () => {
    if (st.status === 'diverged' || st.status === 'converged' || st.status === 'max steps') reset();
    runner.toggle();
  }, 'primary');
  button(btns, 'Reset', () => reset());

  const ro = readouts(root, [['step', 'Step'], ['x', 'x'], ['loss', 'Loss f(x)'], ['grad', 'Gradient'], ['status', 'Status']]);
  caption(root, withOpt
    ? 'From x₀ = 2.2, plain SGD settles in the local dip on the right; Momentum builds speed and can roll over the hump into the global minimum, while Adam takes steps of roughly η regardless of how steep the slope is.'
    : 'Tiny η crawls and settles in whichever valley it starts in (start at 2.2 → local minimum). Near the global minimum the curvature is ≈ 5, so η above ≈ 0.4 (= 2 / curvature) overshoots and diverges.');

  const runner = makeRunner(env, step, 110, (on) => { runBtn.textContent = on ? 'Pause' : 'Run'; });

  function reset() {
    runner.stop();
    Object.assign(st, { x: st.x0, trail: [st.x0], steps: 0, v: 0, m: 0, s: 0, status: 'ready' });
    render();
  }

  function step() {
    if (['diverged', 'converged', 'max steps'].includes(st.status)) return false;
    const g = df(st.x);
    let dx;
    if (st.opt === 'momentum') {
      st.v = 0.9 * st.v - st.lr * g;
      dx = st.v;
    } else if (st.opt === 'adam') {
      const t = st.steps + 1;
      st.m = 0.9 * st.m + 0.1 * g;
      st.s = 0.999 * st.s + 0.001 * g * g;
      const mh = st.m / (1 - 0.9 ** t);
      const sh = st.s / (1 - 0.999 ** t);
      dx = (-st.lr * mh) / (Math.sqrt(sh) + 1e-8);
    } else {
      dx = -st.lr * g;
    }
    st.x += dx;
    st.steps++;
    st.trail.push(st.x);
    if (st.trail.length > 500) st.trail.shift();
    if (!Number.isFinite(st.x) || Math.abs(st.x) > 25) st.status = 'diverged';
    else if (Math.abs(dx) < 1e-4 && Math.abs(df(st.x)) < 2e-3) st.status = 'converged';
    else if (st.steps >= 300) st.status = 'max steps';
    else st.status = 'running';
    render();
    return st.status === 'running';
  }

  S.canvas.addEventListener('click', (e) => {
    if (!S.m) return;
    const p = S.point(e);
    const x = clamp(S.m.invX(p.x), XD[0], XD[1]);
    st.x0 = Math.round(x * 20) / 20;
    startSlider.set(st.x0);
    reset();
  });

  S.draw = () => {
    const T = readTheme(root);
    const { ctx } = S;
    clearCanvas(S, T);
    const m = mapper(plotBox(S, { l: 30 }), XD, YD);
    S.m = m;
    drawAxes(S, T, m, { zeroLines: true, xLabel: 'parameter x', yLabel: 'loss' });

    // area + curve
    ctx.save();
    clipTo(ctx, m.box);
    ctx.beginPath();
    ctx.moveTo(m.X(XD[0]), m.Y(YD[0]));
    for (let i = 0; i <= 200; i++) { const x = XD[0] + ((XD[1] - XD[0]) * i) / 200; ctx.lineTo(m.X(x), m.Y(f(x))); }
    ctx.lineTo(m.X(XD[1]), m.Y(YD[0]));
    ctx.closePath();
    ctx.fillStyle = alpha(T.accent, 0.07);
    ctx.fill();
    ctx.restore();
    plotFn(ctx, m, f, { color: alpha(T.text, 0.85), width: 2 });

    // minima labels
    [[GLOBAL, 'global min'], [LOCAL, 'local min']].forEach(([x, txt]) => {
      dot(ctx, m.X(x), m.Y(f(x)), 3, T.muted);
      label(ctx, T, txt, m.X(x), m.Y(f(x)) + 8, { align: 'center', base: 'top', color: T.muted });
    });

    // trail
    ctx.save();
    clipTo(ctx, m.box);
    const tr = st.trail;
    const n = tr.length;
    for (let i = 1; i < n; i++) {
      const a = 0.15 + 0.7 * (i / n);
      ctx.strokeStyle = alpha(T.accent, a);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(m.X(tr[i - 1]), m.Y(f(tr[i - 1])));
      ctx.lineTo(m.X(tr[i]), m.Y(f(tr[i])));
      ctx.stroke();
    }
    for (let i = 0; i < n - 1; i++) {
      if (!Number.isFinite(tr[i])) continue;
      dot(ctx, m.X(tr[i]), m.Y(f(tr[i])), 2.5, alpha(T.accent, 0.3 + 0.6 * (i / n)));
    }
    ctx.restore();

    // ball / off-chart marker
    const x = st.x;
    const inView = Number.isFinite(x) && x >= XD[0] && x <= XD[1] && f(x) <= YD[1];
    if (inView) {
      const px = m.X(x), py = m.Y(f(x));
      const g = df(x);
      // tangent segment
      const L = 0.45;
      ctx.save();
      clipTo(ctx, m.box);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = alpha(T.amber, 0.8);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(m.X(x - L), m.Y(f(x) - g * L));
      ctx.lineTo(m.X(x + L), m.Y(f(x) + g * L));
      ctx.stroke();
      ctx.restore();
      dot(ctx, px, py, 7, T.accent, '#fff', 2);
    } else {
      const right = !Number.isFinite(x) || x > 0;
      const ax = right ? m.box.x + m.box.w - 12 : m.box.x + 12;
      const ay = m.box.y + 14;
      ctx.save();
      ctx.fillStyle = T.danger;
      ctx.beginPath();
      if (right) { ctx.moveTo(ax + 8, ay); ctx.lineTo(ax - 4, ay - 7); ctx.lineTo(ax - 4, ay + 7); }
      else { ctx.moveTo(ax - 8, ay); ctx.lineTo(ax + 4, ay - 7); ctx.lineTo(ax + 4, ay + 7); }
      ctx.fill();
      ctx.restore();
      label(ctx, T, 'off the chart', right ? ax - 10 : ax + 10, ay, { align: right ? 'right' : 'left', color: T.danger });
    }
  };

  function render() {
    S.redraw();
    const finite = Number.isFinite(st.x);
    ro.set('step', String(st.steps));
    ro.set('x', finite ? fmt(st.x, 3) : '∞');
    ro.set('loss', finite && Math.abs(st.x) < 1e3 ? fmt(f(st.x), 3) : '∞');
    ro.set('grad', finite && Math.abs(st.x) < 1e3 ? fmt(df(st.x), 3) : '∞');
    const tone = st.status === 'diverged' ? 'bad' : st.status === 'converged' ? 'good' : '';
    let text = st.status;
    if (st.status === 'converged') text = Math.abs(st.x - GLOBAL) < 0.05 ? 'global min ✓' : Math.abs(st.x - LOCAL) < 0.05 ? 'stuck: local min' : 'converged';
    ro.set('status', text, st.status === 'converged' && text.startsWith('stuck') ? 'warn' : tone);
  }

  void optSel;
  reset();
}

/* =========================================================================
   2. Bias–variance via polynomial degree
   ========================================================================= */
function vizPolyFit(container, env, id) {
  const root = frame(container, {
    title: id === 'overfitting-underfitting' ? 'Underfitting vs overfitting' : 'Bias–variance tradeoff',
    accentVar: '--color-track-ml-core',
    subtitle: 'Fit a polynomial to 20 noisy samples of sin(2πx); judge it on 100 held-out points.',
  });
  const NTRAIN = 20, NTEST = 100, NOISE = 0.3, MAXDEG = 15;
  const truth = (u) => Math.sin(Math.PI * (u + 1)); // u in [-1,1] ⇔ x in [0,1]

  const st = { seed: 7, degree: 3, showTruth: true, train: null, test: null, fits: [], err: [] };

  function sample(seed) {
    const rand = mulberry32(seed);
    const g = gaussian(rand);
    const mk = (n) => {
      const xs = [], ys = [];
      for (let i = 0; i < n; i++) { const u = rand() * 2 - 1; xs.push(u); ys.push(truth(u) + g() * NOISE); }
      return { xs, ys };
    };
    st.train = mk(NTRAIN);
    st.test = mk(NTEST);
    st.fits = [null];
    st.err = [null];
    for (let d = 1; d <= MAXDEG; d++) {
      const fit = fitPolynomial(st.train.xs, st.train.ys, d);
      st.fits.push(fit);
      st.err.push({ train: mse(fit, st.train.xs, st.train.ys), test: mse(fit, st.test.xs, st.test.ys) });
    }
  }

  const S = makeCanvas(env, root, { aspect: 0.55, minH: 200, maxH: 320 });
  const S2 = makeCanvas(env, root, { aspect: 0.3, minH: 120, maxH: 170 });
  S2.wrap.classList.add('viz-canvas-mini');

  const ctr = controls(root);
  slider(ctr, {
    label: 'Polynomial degree', min: 1, max: MAXDEG, step: 1, value: st.degree, format: (v) => String(v),
    onInput: (v) => { st.degree = v; render(); },
  });
  const btns = buttonRow(root);
  button(btns, 'New sample', () => { st.seed += 1; sample(st.seed); render(); }, 'primary');
  checkbox(btns, 'True function', true, (v) => { st.showTruth = v; render(); });

  const ro = readouts(root, [['deg', 'Degree'], ['train', 'Train MSE'], ['test', 'Test MSE'], ['verdict', 'Diagnosis']]);
  caption(root, 'Train error only ever falls as the degree grows, but test error is U-shaped: low degrees miss the curve (high bias), high degrees chase the noise and swing wildly between points (high variance).');

  S.draw = () => {
    const T = readTheme(root);
    const { ctx } = S;
    clearCanvas(S, T);
    const m = mapper(plotBox(S, { l: 30 }), [-1.05, 1.05], [-2.2, 2.2]);
    drawAxes(S, T, m, { zeroLines: true, fmtX: (v) => String(+((v + 1) / 2).toFixed(2)), xLabel: 'x', yLabel: 'y' });
    if (st.showTruth) plotFn(ctx, m, truth, { color: alpha(T.text2, 0.6), width: 1.5, dash: [5, 5] });
    st.test.xs.forEach((x, i) => dot(ctx, m.X(x), m.Y(st.test.ys[i]), 2.5, null, alpha(T.text2, 0.45), 1));
    plotFn(ctx, m, st.fits[st.degree], { color: T.accent, width: 2.5, samples: 400 });
    st.train.xs.forEach((x, i) => dot(ctx, m.X(x), m.Y(st.train.ys[i]), 4, T.accent, '#000', 1.5));
    // legend
    const lx = m.box.x + m.box.w - 8;
    label(ctx, T, '● train   ○ test' + (st.showTruth ? '   - - true' : ''), lx, m.box.y + 10, { align: 'right', color: T.text2 });
  };

  S2.draw = () => {
    const T = readTheme(root);
    const { ctx } = S2;
    clearCanvas(S2, T);
    const vals = [];
    for (let d = 1; d <= MAXDEG; d++) vals.push(st.err[d].train, st.err[d].test);
    const lo = Math.log10(Math.max(1e-4, Math.min(...vals)) * 0.7);
    const hi = Math.min(2, Math.log10(Math.max(...vals) * 1.4));
    const m = mapper(plotBox(S2, { l: 40, b: 22, t: 16 }), [0.5, MAXDEG + 0.5], [lo, Math.max(hi, lo + 1)]);
    drawAxes(S2, T, m, {
      xTicks: [1, 3, 5, 7, 9, 11, 13, 15],
      yTicks: ticks(m.yd[0], m.yd[1], 3).filter((v) => Number.isInteger(v)),
      fmtY: (v) => (v >= 0 ? String(10 ** v) : '1e' + v),
    });
    // current degree marker
    ctx.fillStyle = alpha(T.accent, 0.12);
    const bw = m.box.w / MAXDEG;
    ctx.fillRect(m.X(st.degree) - bw / 2, m.box.y, bw, m.box.h);
    const line = (key, color) => {
      ctx.save();
      clipTo(ctx, m.box);
      ctx.strokeStyle = color; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let d = 1; d <= MAXDEG; d++) {
        const y = m.Y(Math.log10(Math.max(1e-6, st.err[d][key])));
        d === 1 ? ctx.moveTo(m.X(d), y) : ctx.lineTo(m.X(d), y);
      }
      ctx.stroke();
      for (let d = 1; d <= MAXDEG; d++) dot(ctx, m.X(d), m.Y(Math.log10(Math.max(1e-6, st.err[d][key]))), d === st.degree ? 4 : 2, color);
      ctx.restore();
    };
    line('train', T.accent);
    line('test', T.rose);
    label(ctx, T, 'MSE (log) vs degree', m.box.x, 7, { color: T.text2 });
    label(ctx, T, '— train', m.box.x + m.box.w - 60, 7, { color: T.accent, align: 'right' });
    label(ctx, T, '— test', m.box.x + m.box.w, 7, { color: T.rose, align: 'right' });
  };

  function render() {
    S.redraw(); S2.redraw();
    const e = st.err[st.degree];
    let best = 1;
    for (let d = 2; d <= MAXDEG; d++) if (st.err[d].test < st.err[best].test) best = d;
    const bestTest = st.err[best].test;
    let verdict = 'Good balance', tone = 'good';
    if (e.test > 1.25 * bestTest + 0.01) {
      if (st.degree < best) { verdict = 'Underfit (bias)'; tone = 'warn'; } else { verdict = 'Overfit (variance)'; tone = 'bad'; }
    }
    ro.set('deg', `${st.degree}  (best ${best})`);
    ro.set('train', e.train.toFixed(3));
    ro.set('test', e.test > 999 ? e.test.toExponential(1) : e.test.toFixed(3));
    ro.set('verdict', verdict, tone);
  }

  sample(st.seed);
  render();
}

/* =========================================================================
   3. K-Means
   ========================================================================= */
function vizKMeans(container, env) {
  const root = frame(container, {
    title: 'K-Means clustering, step by step',
    accentVar: '--color-track-models',
    subtitle: 'Each step alternates: assign points to the nearest centroid, then move centroids to the mean.',
  });
  const st = { seed: 3, k: 3, pts: [], trueK: 0, cents: [], hist: [], assign: [], phase: 'assign', iter: 0, converged: false };

  function genData() {
    const rand = mulberry32(st.seed);
    const g = gaussian(rand);
    st.trueK = 3 + Math.floor(rand() * 3);
    const centers = [];
    let guard = 0;
    while (centers.length < st.trueK && guard++ < 500) {
      const c = { x: 0.15 + rand() * 0.7, y: 0.15 + rand() * 0.7 };
      if (centers.every((o) => Math.hypot(o.x - c.x, o.y - c.y) > 0.24)) centers.push(c);
    }
    st.trueK = centers.length;
    st.pts = [];
    centers.forEach((c) => {
      const n = 32 + Math.floor(rand() * 16);
      const sd = 0.045 + rand() * 0.04;
      for (let i = 0; i < n; i++) st.pts.push({ x: clamp(c.x + g() * sd, 0.01, 0.99), y: clamp(c.y + g() * sd, 0.01, 0.99) });
    });
  }

  function initCentroids() {
    runner.stop();
    const idx = new Set();
    while (idx.size < st.k) idx.add(Math.floor(Math.random() * st.pts.length));
    st.cents = [...idx].map((i) => ({ x: st.pts[i].x, y: st.pts[i].y }));
    st.hist = st.cents.map((c) => [{ ...c }]);
    st.assign = new Array(st.pts.length).fill(-1);
    st.phase = 'assign';
    st.iter = 0;
    st.converged = false;
    render();
  }

  function nearest(p) {
    let best = 0, bd = Infinity;
    st.cents.forEach((c, j) => { const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2; if (d < bd) { bd = d; best = j; } });
    return best;
  }

  function inertia() {
    let s = 0;
    st.pts.forEach((p, i) => { const c = st.cents[st.assign[i] >= 0 ? st.assign[i] : nearest(p)]; s += (p.x - c.x) ** 2 + (p.y - c.y) ** 2; });
    return s;
  }

  function step() {
    if (st.converged) return false;
    if (st.phase === 'assign') {
      let changed = 0;
      st.pts.forEach((p, i) => { const j = nearest(p); if (j !== st.assign[i]) { changed++; st.assign[i] = j; } });
      if (changed === 0 && st.iter > 0) st.converged = true;
      st.phase = 'update';
    } else {
      const sx = new Array(st.k).fill(0), sy = new Array(st.k).fill(0), n = new Array(st.k).fill(0);
      st.pts.forEach((p, i) => { const j = st.assign[i]; sx[j] += p.x; sy[j] += p.y; n[j]++; });
      st.cents = st.cents.map((c, j) => (n[j] ? { x: sx[j] / n[j], y: sy[j] / n[j] } : c));
      st.cents.forEach((c, j) => st.hist[j].push({ ...c }));
      st.iter++;
      st.phase = 'assign';
    }
    render();
    return !st.converged;
  }

  const S = makeCanvas(env, root, { aspect: 0.62, minH: 220, maxH: 380 });
  const ctr = controls(root);
  slider(ctr, { label: 'Number of clusters k', min: 2, max: 6, step: 1, value: st.k, onInput: (v) => { st.k = v; initCentroids(); } });
  const btns = buttonRow(root);
  button(btns, 'Step', () => { runner.stop(); step(); });
  const runBtn = button(btns, 'Run', () => { if (st.converged) initCentroids(); runner.toggle(); }, 'primary');
  button(btns, 'Reset', () => initCentroids());
  button(btns, 'Regenerate', () => { st.seed = Math.floor(Math.random() * 1e6); genData(); initCentroids(); });
  const runner = makeRunner(env, step, 450, (on) => { runBtn.textContent = on ? 'Pause' : 'Run'; });

  const ro = readouts(root, [['iter', 'Iteration'], ['next', 'Next step'], ['inertia', 'Inertia (WCSS)'], ['blobs', 'True blobs']]);
  caption(root, 'Inertia never increases from one step to the next. Set k ≠ the true number of blobs, or hit Reset a few times, to see k-means split a blob or merge two — it only finds a local optimum that depends on the starting centroids.');

  S.draw = () => {
    const T = readTheme(root);
    const { ctx } = S;
    clearCanvas(S, T);
    const box = plotBox(S, { l: 8, r: 8, t: 8, b: 8 });
    const m = equalMapper(box);
    const pal = [T.cyan, T.amber, T.rose, T.green, T.violet, T.blue];
    // faint Voronoi regions
    if (st.iter > 0 || st.assign[0] >= 0) {
      const cell = 10;
      for (let px = box.x; px < box.x + box.w; px += cell) {
        for (let py = box.y; py < box.y + box.h; py += cell) {
          const j = nearest({ x: m.invX(px + cell / 2), y: m.invY(py + cell / 2) });
          ctx.fillStyle = alpha(pal[j], 0.07);
          ctx.fillRect(px, py, cell, cell);
        }
      }
    }
    ctx.strokeStyle = T.axis;
    ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1);
    st.pts.forEach((p, i) => {
      const j = st.assign[i];
      dot(ctx, m.X(p.x), m.Y(p.y), 3.2, j >= 0 ? alpha(pal[j], 0.85) : alpha(T.text2, 0.55));
    });
    st.hist.forEach((h, j) => {
      if (h.length < 2) return;
      ctx.save();
      ctx.strokeStyle = alpha(pal[j], 0.7);
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      h.forEach((c, i) => (i ? ctx.lineTo(m.X(c.x), m.Y(c.y)) : ctx.moveTo(m.X(c.x), m.Y(c.y))));
      ctx.stroke();
      ctx.restore();
    });
    st.cents.forEach((c, j) => cross(ctx, m.X(c.x), m.Y(c.y), 7, pal[j]));
  };

  function render() {
    S.redraw();
    ro.set('iter', String(st.iter));
    ro.set('next', st.converged ? 'Converged ✓' : st.phase === 'assign' ? 'Assign points' : 'Move centroids', st.converged ? 'good' : '');
    ro.set('inertia', inertia().toFixed(3));
    ro.set('blobs', String(st.trueK), st.trueK === st.k ? 'good' : '');
  }

  genData();
  initCentroids();
}

/* =========================================================================
   4. k-Nearest Neighbours
   ========================================================================= */
function vizKnn(container, env) {
  const root = frame(container, {
    title: 'k-NN decision boundary',
    accentVar: '--color-track-models',
    subtitle: 'Click the canvas to add a point of the selected class.',
  });
  const st = { k: 5, cls: 0, pts: [] };
  const reset = () => { st.pts = makeMoons(11, 70, 0.2); render(); };

  function knnVote(x, y, k, skip = -1) {
    const best = []; // [d, cls] sorted ascending, length ≤ k
    for (let i = 0; i < st.pts.length; i++) {
      if (i === skip) continue;
      const p = st.pts[i];
      const d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (best.length < k || d < best[best.length - 1][0]) {
        let j = best.length < k ? best.length : best.length - 1;
        best[j] = [d, p.c];
        while (j > 0 && best[j - 1][0] > best[j][0]) { [best[j - 1], best[j]] = [best[j], best[j - 1]]; j--; }
      }
    }
    if (!best.length) return { p: 0.5, nearest: 0 };
    const ones = best.reduce((s, b) => s + b[1], 0);
    return { p: ones / best.length, nearest: best[0][1] };
  }

  const S = makeCanvas(env, root, { aspect: 0.62, minH: 220, maxH: 380 });
  const ctr = controls(root);
  slider(ctr, { label: 'Neighbours k', min: 1, max: 31, step: 2, value: st.k, onInput: (v) => { st.k = v; render(); } });
  const btns = buttonRow(root);
  const seg = segmented(btns, [[0, 'Add class A'], [1, 'Add class B']], st.cls, (v) => { st.cls = v; });
  button(btns, 'Reset data', reset);
  button(btns, 'Clear', () => { st.pts = []; render(); });
  void seg;

  const ro = readouts(root, [['k', 'k'], ['n', 'Points'], ['loo', 'Leave-one-out acc.']]);
  caption(root, 'k = 1 draws a jagged boundary that wraps around every single point (low bias, high variance); larger k smooths it out until, with very large k, it ignores the moon shape entirely.');

  S.canvas.addEventListener('click', (e) => {
    if (!S.m || st.pts.length >= 400) return;
    const p = S.point(e);
    const x = S.m.invX(p.x), y = S.m.invY(p.y);
    if (x < 0 || x > 1 || y < 0 || y > 1) return;
    st.pts.push({ x, y, c: st.cls });
    render();
  });

  S.draw = () => {
    const T = readTheme(root);
    const { ctx } = S;
    clearCanvas(S, T);
    const box = plotBox(S, { l: 8, r: 8, t: 8, b: 8 });
    const m = equalMapper(box, 0);
    S.m = m;
    const colA = T.cyan, colB = T.amber;
    if (st.pts.length) {
      const cell = S.w < 420 ? 7 : 8;
      const cols = Math.ceil(box.w / cell), rows = Math.ceil(box.h / cell);
      const grid = [];
      for (let r = 0; r < rows; r++) {
        grid.push([]);
        for (let c = 0; c < cols; c++) {
          const px = box.x + c * cell + cell / 2, py = box.y + r * cell + cell / 2;
          const { p } = knnVote(m.invX(px), m.invY(py), Math.min(st.k, st.pts.length));
          grid[r].push(p);
          const conf = Math.abs(p - 0.5) * 2;
          ctx.fillStyle = p === 0.5 ? alpha(T.muted, 0.06) : alpha(p > 0.5 ? colB : colA, 0.06 + 0.3 * conf);
          ctx.fillRect(box.x + c * cell, box.y + r * cell, cell, cell);
        }
      }
      // boundary edges between cells with different majority
      ctx.strokeStyle = alpha(T.text, 0.75);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const side = (p) => (p > 0.5 ? 1 : p < 0.5 ? 0 : 0.5);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const s = side(grid[r][c]);
          if (c + 1 < cols && side(grid[r][c + 1]) !== s) {
            const x = box.x + (c + 1) * cell; ctx.moveTo(x, box.y + r * cell); ctx.lineTo(x, box.y + (r + 1) * cell);
          }
          if (r + 1 < rows && side(grid[r + 1][c]) !== s) {
            const y = box.y + (r + 1) * cell; ctx.moveTo(box.x + c * cell, y); ctx.lineTo(box.x + (c + 1) * cell, y);
          }
        }
      }
      ctx.stroke();
    } else {
      label(ctx, T, 'Click to add points', box.x + box.w / 2, box.y + box.h / 2, { align: 'center', color: T.muted, size: 12 });
    }
    ctx.strokeStyle = T.axis;
    ctx.lineWidth = 1;
    ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1);
    st.pts.forEach((p) => dot(ctx, m.X(p.x), m.Y(p.y), 4, p.c ? colB : colA, '#000', 1.5));
  };

  function render() {
    S.redraw();
    let correct = 0;
    const k = Math.min(st.k, Math.max(1, st.pts.length - 1));
    st.pts.forEach((p, i) => {
      const { p: pr, nearest } = knnVote(p.x, p.y, k, i);
      const pred = pr > 0.5 ? 1 : pr < 0.5 ? 0 : nearest;
      if (pred === p.c) correct++;
    });
    const nA = st.pts.filter((p) => p.c === 0).length;
    ro.set('k', String(st.k));
    ro.set('n', `${nA} A · ${st.pts.length - nA} B`);
    ro.set('loo', st.pts.length > 1 ? pct(correct / st.pts.length) : '—');
  }

  reset();
}

/* =========================================================================
   5. ROC / PR curves & thresholds
   ========================================================================= */
function vizRoc(container, env, id) {
  const prMode = id !== 'roc-auc';
  const root = frame(container, {
    title: prMode ? 'Threshold, precision & recall' : 'ROC curve & AUC',
    accentVar: '--color-track-ml-core',
    subtitle: 'A classifier outputs a score; everything at or above the threshold is predicted positive.',
  });
  const NPOOL = 300;
  const rand = mulberry32(42);
  const g = gaussian(rand);
  const zNeg = Array.from({ length: NPOOL }, g);
  const zPos = Array.from({ length: NPOOL }, g);
  const st = { sep: 1.5, thr: 0.75, ratio: prMode ? 0.25 : 0.5, view: prMode ? 'pr' : 'roc' };

  const split = el('div', 'viz-split');
  root.append(split);
  const S = makeCanvas(env, split, { aspect: 0.62, minH: 180, maxH: 300 });
  const S2 = makeCanvas(env, split, { aspect: 0.85, minH: 200, maxH: 300 });

  const ctr = controls(root);
  slider(ctr, { label: 'Threshold', min: -3, max: 7, step: 0.05, value: st.thr, format: (v) => v.toFixed(2), onInput: (v) => { st.thr = v; render(); } });
  slider(ctr, { label: 'Class separation', min: 0, max: 4, step: 0.05, value: st.sep, format: (v) => v.toFixed(2) + ' σ', onInput: (v) => { st.sep = v; render(); } });
  slider(ctr, { label: 'Positive share', min: 0.05, max: 0.5, step: 0.01, value: st.ratio, format: (v) => pct(v, 0), onInput: (v) => { st.ratio = v; render(); } });
  const btns = buttonRow(root);
  segmented(btns, [['roc', 'ROC curve'], ['pr', 'Precision–Recall']], st.view, (v) => { st.view = v; render(); });

  const ro = readouts(root, [
    ['tp', 'TP'], ['fp', 'FP'], ['fn', 'FN'], ['tn', 'TN'],
    ['prec', 'Precision'], ['rec', 'Recall (TPR)'], ['fpr', 'FPR'], ['f1', 'F1'],
    ['auc', 'ROC AUC'], ['ap', 'PR AUC (AP)'],
  ]);
  caption(root, prMode
    ? 'Raising the threshold trades recall for precision. Shrink the positive share: ROC AUC barely moves, but precision and the PR curve drop sharply — that is why PR curves are preferred for rare positives.'
    : 'Sliding the threshold only moves the dot along the curve — the curve and AUC depend on how well the two distributions are separated. Separation 0 gives the diagonal (AUC 0.5); changing the positive share leaves ROC almost untouched.');

  let data = null;
  function compute() {
    const nPos = Math.max(5, Math.min(NPOOL, Math.round((NPOOL * st.ratio) / (1 - st.ratio))));
    const pos = zPos.slice(0, nPos).map((z) => z + st.sep);
    const neg = zNeg.slice();
    let tp = 0, fp = 0;
    pos.forEach((s) => { if (s >= st.thr) tp++; });
    neg.forEach((s) => { if (s >= st.thr) fp++; });
    const fn = pos.length - tp, tn = neg.length - fp;
    const curves = rocCurve(pos, neg);
    data = { pos, neg, tp, fp, fn, tn, ...curves };
  }

  S.draw = () => {
    if (!data) return;
    const T = readTheme(root);
    const { ctx } = S;
    clearCanvas(S, T);
    const lo = -3.5, hi = 7.5, bw = 0.35;
    const nb = Math.ceil((hi - lo) / bw);
    const hp = new Array(nb).fill(0), hn = new Array(nb).fill(0);
    const bin = (s) => clamp(Math.floor((s - lo) / bw), 0, nb - 1);
    data.pos.forEach((s) => hp[bin(s)]++);
    data.neg.forEach((s) => hn[bin(s)]++);
    const ymax = Math.max(...hp, ...hn) * 1.15;
    const m = mapper(plotBox(S, { l: 30, t: 22 }), [lo, hi], [0, ymax]);
    drawAxes(S, T, m, { yTicks: ticks(0, ymax, 3), xLabel: 'score' });
    // predicted-positive region
    ctx.fillStyle = alpha(T.accent, 0.06);
    ctx.fillRect(m.X(st.thr), m.box.y, m.box.x + m.box.w - m.X(st.thr), m.box.h);
    const bars = (h, color) => {
      ctx.beginPath();
      ctx.moveTo(m.X(lo), m.Y(0));
      h.forEach((c, i) => { ctx.lineTo(m.X(lo + i * bw), m.Y(c)); ctx.lineTo(m.X(lo + (i + 1) * bw), m.Y(c)); });
      ctx.lineTo(m.X(hi), m.Y(0));
      ctx.closePath();
      ctx.fillStyle = alpha(color, 0.3); ctx.fill();
      ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
    };
    ctx.save(); clipTo(ctx, m.box);
    bars(hn, T.blue);
    bars(hp, T.green);
    ctx.restore();
    // threshold
    ctx.save();
    ctx.strokeStyle = T.text; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(m.X(st.thr), m.box.y); ctx.lineTo(m.X(st.thr), m.box.y + m.box.h); ctx.stroke();
    ctx.restore();
    label(ctx, T, '■ negatives', m.box.x, 10, { color: T.blue });
    label(ctx, T, '■ positives', m.box.x + 84, 10, { color: T.green });
    label(ctx, T, 'predict + →', clamp(m.X(st.thr) + 4, m.box.x, m.box.x + m.box.w - 70), m.box.y + 10, { color: T.text2 });
  };

  S2.draw = () => {
    if (!data) return;
    const T = readTheme(root);
    const { ctx } = S2;
    clearCanvas(S2, T);
    const full = plotBox(S2, { l: 34, b: 26, t: 10, r: 10 });
    const side = Math.min(full.w, full.h);
    const box = { x: full.x + (full.w - side) / 2, y: full.y, w: side, h: side };
    const m = mapper(box, [0, 1], [0, 1]);
    const isRoc = st.view === 'roc';
    drawAxes(S2, T, m, { xTicks: [0, 0.5, 1], yTicks: [0, 0.5, 1] });
    label(ctx, T, isRoc ? 'FPR' : 'Recall', box.x + box.w, box.y + box.h + 8, { align: 'right', base: 'top', color: T.text2 });
    label(ctx, T, isRoc ? 'TPR' : 'Precision', box.x + 5, box.y + 8, { color: T.text2 });
    // baseline
    ctx.save();
    ctx.strokeStyle = alpha(T.text2, 0.4); ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
    ctx.beginPath();
    if (isRoc) { ctx.moveTo(m.X(0), m.Y(0)); ctx.lineTo(m.X(1), m.Y(1)); }
    else { const b = data.pos.length / (data.pos.length + data.neg.length); ctx.moveTo(m.X(0), m.Y(b)); ctx.lineTo(m.X(1), m.Y(b)); }
    ctx.stroke();
    ctx.restore();
    const pts = isRoc ? data.roc : data.pr;
    ctx.save();
    clipTo(ctx, box);
    ctx.beginPath();
    ctx.moveTo(m.X(pts[0][0]), m.Y(0));
    pts.forEach(([x, y]) => ctx.lineTo(m.X(x), m.Y(y)));
    ctx.lineTo(m.X(pts[pts.length - 1][0]), m.Y(0));
    ctx.closePath();
    ctx.fillStyle = alpha(T.accent, 0.1); ctx.fill();
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(m.X(x), m.Y(y)) : ctx.moveTo(m.X(x), m.Y(y))));
    ctx.strokeStyle = T.accent; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.restore();
    const { tp, fp, fn, tn } = data;
    const tpr = tp / (tp + fn), fpr = fp / (fp + tn), prec = tp + fp ? tp / (tp + fp) : 1;
    const [ox, oy] = isRoc ? [fpr, tpr] : [tpr, prec];
    dot(ctx, m.X(ox), m.Y(oy), 9, alpha(T.text, 0.15));
    dot(ctx, m.X(ox), m.Y(oy), 5, T.text, '#000', 1.5);
    const txt = isRoc ? `AUC = ${data.auc.toFixed(3)}` : `AP = ${data.ap.toFixed(3)}`;
    label(ctx, T, txt, box.x + box.w - 6, isRoc ? box.y + box.h - 12 : box.y + 12, { align: 'right', color: T.accent, size: 12 });
  };

  function render() {
    compute();
    S.redraw(); S2.redraw();
    const { tp, fp, fn, tn } = data;
    const prec = tp + fp ? tp / (tp + fp) : NaN;
    const rec = tp / (tp + fn);
    const f1 = prec + rec ? (2 * prec * rec) / (prec + rec) : NaN;
    ro.set('tp', String(tp), 'good'); ro.set('fp', String(fp), 'bad');
    ro.set('fn', String(fn), 'warn'); ro.set('tn', String(tn));
    ro.set('prec', fmt(prec, 3)); ro.set('rec', fmt(rec, 3));
    ro.set('fpr', fmt(fp / (fp + tn), 3)); ro.set('f1', fmt(f1, 3));
    ro.set('auc', data.auc.toFixed(3)); ro.set('ap', data.ap.toFixed(3));
  }

  render();
}

/* =========================================================================
   6. Activation functions
   ========================================================================= */
function vizActivations(container, env) {
  const root = frame(container, {
    title: 'Activation functions',
    accentVar: '--color-track-dl',
    subtitle: 'Drag or tap on the plot to probe a value of x.',
  });
  const sig = (x) => 1 / (1 + Math.exp(-x));
  const geluF = (x) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3)));
  const FUNCS = [
    { key: 'sigmoid', name: 'Sigmoid', color: 'cyan', f: sig, d: (x) => sig(x) * (1 - sig(x)), on: true },
    { key: 'tanh', name: 'Tanh', color: 'violet', f: Math.tanh, d: (x) => 1 - Math.tanh(x) ** 2, on: true },
    { key: 'relu', name: 'ReLU', color: 'green', f: (x) => Math.max(0, x), d: (x) => (x > 0 ? 1 : 0), on: true },
    { key: 'leaky', name: 'Leaky ReLU (α=0.1)', color: 'amber', f: (x) => (x > 0 ? x : 0.1 * x), d: (x) => (x > 0 ? 1 : 0.1), on: false },
    { key: 'gelu', name: 'GELU', color: 'rose', f: geluF, d: (x) => (geluF(x + 1e-4) - geluF(x - 1e-4)) / 2e-4, on: false },
  ];
  const st = { deriv: false, probe: 1 };

  const S = makeCanvas(env, root, { aspect: 0.58, minH: 210, maxH: 340 });
  const ctr = controls(root);
  const T0 = readTheme(root);
  const toggles = el('div', 'viz-toggles');
  ctr.append(toggles);
  FUNCS.forEach((fn) => checkbox(toggles, fn.name, fn.on, (v) => { fn.on = v; render(); }, T0[fn.color]));
  const probe = slider(ctr, { label: 'Probe x', min: -5, max: 5, step: 0.05, value: st.probe, format: (v) => v.toFixed(2), onInput: (v) => { st.probe = v; render(); } });
  const btns = buttonRow(root);
  checkbox(btns, 'Show derivatives (dashed)', st.deriv, (v) => { st.deriv = v; render(); });

  const table = el('table', 'viz-table');
  root.append(table);
  caption(root, 'Turn on derivatives: Sigmoid and Tanh gradients shrink toward 0 once |x| > 3 (saturation → vanishing gradients). ReLU keeps a gradient of exactly 1 for x > 0 but 0 for x < 0 ("dead" units); Leaky ReLU and GELU keep a little gradient on the negative side.');

  let dragging = false;
  const setProbe = (e) => {
    if (!S.m) return;
    const x = clamp(S.m.invX(S.point(e).x), -5, 5);
    st.probe = Math.round(x * 20) / 20;
    probe.set(st.probe);
    render();
  };
  S.canvas.addEventListener('pointerdown', (e) => { dragging = true; setProbe(e); });
  S.canvas.addEventListener('pointermove', (e) => { if (dragging) setProbe(e); });
  const stopDrag = () => { dragging = false; };
  window.addEventListener('pointerup', stopDrag);
  env.onDispose(() => window.removeEventListener('pointerup', stopDrag));

  S.draw = () => {
    const T = readTheme(root);
    const { ctx } = S;
    clearCanvas(S, T);
    const m = mapper(plotBox(S, { l: 30 }), [-5, 5], [-1.5, 3]);
    S.m = m;
    drawAxes(S, T, m, { zeroLines: true, xLabel: 'x' });
    FUNCS.filter((fn) => fn.on).forEach((fn) => {
      plotFn(ctx, m, fn.f, { color: T[fn.color], width: 2.5 });
      if (st.deriv) plotFn(ctx, m, fn.d, { color: alpha(T[fn.color], 0.85), width: 1.5, dash: [5, 4], samples: 600 });
    });
    const px = m.X(st.probe);
    ctx.save();
    ctx.strokeStyle = alpha(T.text, 0.45); ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(px, m.box.y); ctx.lineTo(px, m.box.y + m.box.h); ctx.stroke();
    ctx.restore();
    FUNCS.filter((fn) => fn.on).forEach((fn) => {
      const y = fn.f(st.probe);
      if (y <= 3) dot(ctx, px, m.Y(y), 4.5, T[fn.color], '#000', 1.5);
      if (st.deriv) dot(ctx, px, m.Y(fn.d(st.probe)), 3.5, '#000', T[fn.color], 1.5);
    });
  };

  function render() {
    S.redraw();
    const T = readTheme(root);
    table.innerHTML = '';
    const head = el('tr');
    ['Function', 'f(x)', "f′(x)"].forEach((h) => head.append(el('th', '', h)));
    table.append(head);
    const on = FUNCS.filter((fn) => fn.on);
    if (!on.length) {
      const tr = el('tr'); const td = el('td', '', 'Enable a function above'); td.colSpan = 3; tr.append(td); table.append(tr);
    }
    on.forEach((fn) => {
      const tr = el('tr');
      const name = el('td');
      const sw = el('span', 'viz-swatch'); sw.style.background = T[fn.color];
      name.append(sw, document.createTextNode(fn.name));
      const dv = fn.d(st.probe);
      const dcell = el('td', '', dv.toFixed(3));
      if (Math.abs(dv) < 0.05) dcell.dataset.tone = 'bad';
      tr.append(name, el('td', '', fn.f(st.probe).toFixed(3)), dcell);
      table.append(tr);
    });
  }

  render();
}

/* =========================================================================
   7. PCA
   ========================================================================= */
function vizPca(container, env) {
  const root = frame(container, {
    title: 'Principal Component Analysis in 2D',
    accentVar: '--color-track-models',
    subtitle: 'Axes are drawn ±2√λ along each eigenvector of the covariance matrix.',
  });
  const N = 220;
  const rand = mulberry32(5);
  const g = gaussian(rand);
  const Z = Array.from({ length: N }, () => [g(), g()]);
  const st = { rho: 0.8, rot: 0, project: false, pts: [], eig: null };

  function compute() {
    const r = st.rho, th = (st.rot * Math.PI) / 180, c = Math.cos(th), s = Math.sin(th);
    st.pts = Z.map(([z1, z2]) => {
      const x = 1.1 * z1, y = 0.9 * (r * z1 + Math.sqrt(1 - r * r) * z2);
      return [c * x - s * y, s * x + c * y];
    });
    let mx = 0, my = 0;
    st.pts.forEach(([x, y]) => { mx += x; my += y; });
    mx /= N; my /= N;
    let a = 0, b = 0, d = 0;
    st.pts.forEach(([x, y]) => { a += (x - mx) ** 2; b += (x - mx) * (y - my); d += (y - my) ** 2; });
    a /= N - 1; b /= N - 1; d /= N - 1;
    const tr = (a + d) / 2, disc = Math.sqrt(((a - d) / 2) ** 2 + b * b);
    const l1 = tr + disc, l2 = Math.max(0, tr - disc);
    const ang = 0.5 * Math.atan2(2 * b, a - d);
    st.eig = { mx, my, l1, l2, ang, v1: [Math.cos(ang), Math.sin(ang)], v2: [-Math.sin(ang), Math.cos(ang)] };
  }

  const S = makeCanvas(env, root, { aspect: 0.62, minH: 220, maxH: 380 });
  const ctr = controls(root);
  slider(ctr, { label: 'Correlation ρ', min: -0.95, max: 0.95, step: 0.05, value: st.rho, format: (v) => v.toFixed(2), onInput: (v) => { st.rho = v; render(); } });
  slider(ctr, { label: 'Rotate cloud', min: 0, max: 180, step: 1, value: st.rot, format: (v) => v + '°', onInput: (v) => { st.rot = v; render(); } });
  const btns = buttonRow(root);
  checkbox(btns, 'Project onto PC1 (1D reduction)', false, (v) => { st.project = v; render(); });

  const bar = el('div', 'viz-evbar');
  const seg1 = el('div', 'viz-evbar-pc1'), seg2 = el('div', 'viz-evbar-pc2');
  bar.append(seg1, seg2);
  root.append(bar);
  const ro = readouts(root, [['pc1', 'PC1 explains'], ['pc2', 'PC2 explains'], ['lam', 'λ₁ / λ₂'], ['ang', 'PC1 angle']]);
  caption(root, 'As |ρ| → 1 the cloud flattens toward a line and PC1 alone explains almost all the variance, so dropping PC2 loses little. Rotating the data rotates the axes with it but never changes the % explained.');

  S.draw = () => {
    const T = readTheme(root);
    const { ctx } = S;
    clearCanvas(S, T);
    const box = plotBox(S, { l: 30, b: 22 });
    const half = 4.2, ratio = box.w / box.h;
    const m = mapper(box, [-half * ratio, half * ratio], [-half, half]);
    drawAxes(S, T, m, { zeroLines: true });
    const { mx, my, l1, l2, v1, v2 } = st.eig;
    ctx.save();
    clipTo(ctx, box);
    if (st.project) {
      const L = 10;
      ctx.strokeStyle = alpha(T.accent, 0.35); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(m.X(mx - v1[0] * L), m.Y(my - v1[1] * L)); ctx.lineTo(m.X(mx + v1[0] * L), m.Y(my + v1[1] * L)); ctx.stroke();
      ctx.strokeStyle = alpha(T.text2, 0.2);
      ctx.beginPath();
      st.pts.forEach(([x, y]) => {
        const t = (x - mx) * v1[0] + (y - my) * v1[1];
        ctx.moveTo(m.X(x), m.Y(y)); ctx.lineTo(m.X(mx + t * v1[0]), m.Y(my + t * v1[1]));
      });
      ctx.stroke();
    }
    st.pts.forEach(([x, y]) => dot(ctx, m.X(x), m.Y(y), 2.6, alpha(T.text2, st.project ? 0.35 : 0.65)));
    if (st.project) {
      st.pts.forEach(([x, y]) => {
        const t = (x - mx) * v1[0] + (y - my) * v1[1];
        dot(ctx, m.X(mx + t * v1[0]), m.Y(my + t * v1[1]), 2.4, alpha(T.accent, 0.8));
      });
    }
    const arrow = (v, len, color, txt) => {
      const x0 = m.X(mx - v[0] * len), y0 = m.Y(my - v[1] * len);
      const x1 = m.X(mx + v[0] * len), y1 = m.Y(my + v[1] * len);
      ctx.strokeStyle = '#000'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.strokeStyle = color; ctx.lineWidth = 3;
      ctx.stroke();
      const a = Math.atan2(y1 - y0, x1 - x0);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x1 + 4 * Math.cos(a), y1 + 4 * Math.sin(a));
      ctx.lineTo(x1 - 9 * Math.cos(a - 0.45), y1 - 9 * Math.sin(a - 0.45));
      ctx.lineTo(x1 - 9 * Math.cos(a + 0.45), y1 - 9 * Math.sin(a + 0.45));
      ctx.fill();
      label(ctx, T, txt, x1 + 10 * Math.cos(a), y1 + 10 * Math.sin(a), { color, align: Math.cos(a) >= 0 ? 'left' : 'right', size: 11 });
    };
    arrow(v2, 2 * Math.sqrt(l2), T.amber, 'PC2');
    arrow(v1, 2 * Math.sqrt(l1), T.accent, 'PC1');
    ctx.restore();
  };

  function render() {
    compute();
    S.redraw();
    const { l1, l2, ang } = st.eig;
    const p1 = l1 / (l1 + l2);
    seg1.style.width = (p1 * 100).toFixed(1) + '%';
    seg2.style.width = ((1 - p1) * 100).toFixed(1) + '%';
    seg1.textContent = p1 > 0.18 ? 'PC1 ' + pct(p1, 0) : '';
    seg2.textContent = 1 - p1 > 0.18 ? 'PC2 ' + pct(1 - p1, 0) : '';
    ro.set('pc1', pct(p1), p1 > 0.9 ? 'good' : '');
    ro.set('pc2', pct(1 - p1));
    ro.set('lam', `${l1.toFixed(2)} / ${l2.toFixed(2)}`);
    let deg = (ang * 180) / Math.PI;
    if (deg < 0) deg += 180;
    ro.set('ang', deg.toFixed(0) + '°');
  }

  render();
}

/* =========================================================================
   8. Decision tree (axis-aligned splits, Gini)
   ========================================================================= */
function buildTree(pts, depth, maxDepth) {
  const n = pts.length;
  const ones = pts.reduce((s, p) => s + p.c, 0);
  const node = { n, ones, pred: ones * 2 >= n ? 1 : 0, leaf: true };
  if (depth >= maxDepth || n < 2 || ones === 0 || ones === n) return node;
  const gini = (a, t) => (t ? 1 - (a / t) ** 2 - ((t - a) / t) ** 2 : 0);
  const parent = gini(ones, n);
  let best = null;
  ['x', 'y'].forEach((f) => {
    const sorted = pts.slice().sort((a, b) => a[f] - b[f]);
    let lo = 0;
    for (let i = 1; i < n; i++) {
      lo += sorted[i - 1].c;
      if (sorted[i][f] === sorted[i - 1][f]) continue;
      const imp = (i / n) * gini(lo, i) + ((n - i) / n) * gini(ones - lo, n - i);
      if (!best || imp < best.imp - 1e-12) best = { f, thr: (sorted[i][f] + sorted[i - 1][f]) / 2, imp };
    }
  });
  if (!best || best.imp >= parent - 1e-12) return node;
  const L = pts.filter((p) => p[best.f] <= best.thr), R = pts.filter((p) => p[best.f] > best.thr);
  return { ...node, leaf: false, f: best.f, thr: best.thr, left: buildTree(L, depth + 1, maxDepth), right: buildTree(R, depth + 1, maxDepth) };
}

function predictTree(node, p) {
  while (!node.leaf) node = p[node.f] <= node.thr ? node.left : node.right;
  return node.pred;
}

function vizDecisionTree(container, env) {
  const root = frame(container, {
    title: 'Decision tree regions',
    accentVar: '--color-track-models',
    subtitle: 'Every split is a yes/no question on one feature, so regions are axis-aligned boxes.',
  });
  const st = { depth: 3, seed: 21, train: [], test: [], tree: null };
  const gen = () => { st.train = makeMoons(st.seed, 90, 0.22); st.test = makeMoons(st.seed + 1000, 300, 0.22); };

  const S = makeCanvas(env, root, { aspect: 0.62, minH: 220, maxH: 380 });
  const ctr = controls(root);
  slider(ctr, { label: 'Max depth', min: 1, max: 12, step: 1, value: st.depth, onInput: (v) => { st.depth = v; render(); } });
  const btns = buttonRow(root);
  button(btns, 'New data', () => { st.seed = Math.floor(Math.random() * 1e6); gen(); render(); }, 'primary');

  const ro = readouts(root, [['depth', 'Depth used'], ['leaves', 'Leaves'], ['train', 'Train acc.'], ['test', 'Test acc.']]);
  caption(root, 'Shallow trees are too coarse to follow the moons (underfit). As depth grows, train accuracy climbs to 100% by carving tiny boxes around individual noisy points, while test accuracy stalls or drops — classic overfitting.');

  S.draw = () => {
    const T = readTheme(root);
    const { ctx } = S;
    clearCanvas(S, T);
    const box = plotBox(S, { l: 8, r: 8, t: 8, b: 8 });
    const m = equalMapper(box, 0);
    const colA = T.cyan, colB = T.amber;
    const regions = [];
    (function walk(node, x0, x1, y0, y1) {
      if (node.leaf) { regions.push({ node, x0, x1, y0, y1 }); return; }
      if (node.f === 'x') { walk(node.left, x0, node.thr, y0, y1); walk(node.right, node.thr, x1, y0, y1); }
      else { walk(node.left, x0, x1, y0, node.thr); walk(node.right, x0, x1, node.thr, y1); }
    })(st.tree, m.xd[0], m.xd[1], m.yd[0], m.yd[1]);
    ctx.save();
    clipTo(ctx, box);
    regions.forEach(({ node, x0, x1, y0, y1 }) => {
      const purity = node.n ? Math.max(node.ones, node.n - node.ones) / node.n : 0.5;
      ctx.fillStyle = alpha(node.pred ? colB : colA, 0.08 + 0.25 * (purity - 0.5) * 2);
      const px0 = m.X(x0), px1 = m.X(x1), py0 = m.Y(y1), py1 = m.Y(y0);
      ctx.fillRect(px0, py0, px1 - px0, py1 - py0);
      ctx.strokeStyle = alpha(T.text, 0.35);
      ctx.lineWidth = 1;
      ctx.strokeRect(px0 + 0.5, py0 + 0.5, px1 - px0 - 1, py1 - py0 - 1);
    });
    st.test.forEach((p) => dot(ctx, m.X(p.x), m.Y(p.y), 1.6, alpha(p.c ? colB : colA, 0.35)));
    st.train.forEach((p) => dot(ctx, m.X(p.x), m.Y(p.y), 4, p.c ? colB : colA, '#000', 1.5));
    ctx.restore();
    ctx.strokeStyle = T.axis;
    ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1);
  };

  function render() {
    st.tree = buildTree(st.train, 0, st.depth);
    S.redraw();
    let leaves = 0, maxD = 0;
    (function walk(n, d) { if (n.leaf) { leaves++; maxD = Math.max(maxD, d); } else { walk(n.left, d + 1); walk(n.right, d + 1); } })(st.tree, 0);
    const acc = (set) => set.filter((p) => predictTree(st.tree, p) === p.c).length / set.length;
    const tr = acc(st.train), te = acc(st.test);
    ro.set('depth', `${maxD} / ${st.depth}`);
    ro.set('leaves', String(leaves));
    ro.set('train', pct(tr), tr === 1 ? 'warn' : '');
    ro.set('test', pct(te));
  }

  gen();
  render();
}
