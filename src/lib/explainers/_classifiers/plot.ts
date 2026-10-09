/**
 * Canvas helpers shared by the classifier scenes: class colours and markers, the square plot
 * mapper, decision-region rasters and level-set contours (marching squares).
 */
import { alpha, clamp, dot, label, squareMapper, ticks, type VizTheme } from '#lib/viz/canvas.ts';
import { memo } from './data.ts';

export const DOMAIN: [number, number] = [-1.2, 1.2];
export const PAD = 10;
export type Mapper = ReturnType<typeof squareMapper>;

export const plotMapper = (w: number, h: number, domain = DOMAIN): Mapper =>
	squareMapper({ x: PAD, y: PAD, w: w - PAD * 2, h: h - PAD * 2 }, domain);

/** Class A = first series colour (circles), class B = third (squares), as in the decision-tree lesson. */
export const classColor = (t: VizTheme, c: number) => (c ? t.series[2] : t.series[0]);
export const CLASS_NAME = ['A', 'B'] as const;

/** Circle for class A, square for class B. */
export function marker(ctx: CanvasRenderingContext2D, x: number, y: number, c: number, r: number, fill: string, stroke?: string, lw = 1.5) {
	if (c === 0) return dot(ctx, x, y, r, fill, stroke, lw);
	const a = r * 0.9;
	ctx.fillStyle = fill;
	ctx.fillRect(x - a, y - a, 2 * a, 2 * a);
	if (stroke) {
		ctx.strokeStyle = stroke;
		ctx.lineWidth = lw;
		ctx.strokeRect(x - a, y - a, 2 * a, 2 * a);
	}
}

export function grid(ctx: CanvasRenderingContext2D, m: Mapper, w: number, h: number, t: VizTheme) {
	ctx.strokeStyle = t.grid;
	ctx.lineWidth = 1;
	for (const v of ticks(-3, 3, 12)) {
		ctx.beginPath();
		ctx.moveTo(m.x(v), 0);
		ctx.lineTo(m.x(v), h);
		ctx.moveTo(0, m.y(v));
		ctx.lineTo(w, m.y(v));
		ctx.stroke();
	}
}

export function axisNames(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme, xName = 'x₁', yName = 'x₂') {
	label(ctx, t, `${xName} →`, w - 12, h - 8, { align: 'right', color: t.text3, size: 10, base: 'bottom' });
	label(ctx, t, `↑ ${yName}`, 6, 8, { color: t.text3, size: 10, base: 'top' });
}

/** A function sampled at the corners of square cells covering the canvas. */
export interface Grid {
	cols: number;
	rows: number;
	cell: number;
	v: Float64Array;
}

const grids = memo<Grid>(24);

/**
 * Sample f(x₁, x₂) on a pixel grid. `key` must identify f completely (model + settings); the
 * canvas size and cell are appended, so redraws that don't change the model reuse the raster.
 */
export function sampleGrid(key: string, m: Mapper, w: number, h: number, cell: number, f: (x: number, y: number) => number): Grid {
	return grids(`${key}|${w}|${h}|${cell}|${m.invX(0).toFixed(5)}|${m.invY(0).toFixed(5)}`, () => {
		const cols = Math.ceil(w / cell) + 1;
		const rows = Math.ceil(h / cell) + 1;
		const v = new Float64Array(cols * rows);
		for (let j = 0; j < rows; j++) {
			const y = m.invY(j * cell);
			for (let i = 0; i < cols; i++) v[j * cols + i] = f(m.invX(i * cell), y);
		}
		return { cols, rows, cell, v };
	});
}

export function rgb(color: string): [number, number, number] {
	const c = color.trim();
	if (c[0] === '#') {
		let hex = c.slice(1);
		if (hex.length === 3) hex = [...hex].map((ch) => ch + ch).join('');
		const n = parseInt(hex.slice(0, 6), 16);
		return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
	}
	const m = c.match(/rgba?\(([^)]+)\)/);
	if (m) {
		const [r, g, b] = m[1].split(',').map((v) => parseFloat(v));
		return [r, g, b];
	}
	return [128, 128, 128];
}

let scratch: HTMLCanvasElement | null = null;

/**
 * Paint a sampled grid: `color(value)` returns [r, g, b, alpha 0–1]. The grid is drawn one pixel
 * per sample and scaled up with smoothing, so the result has no seams and soft edges.
 */
export function paint(ctx: CanvasRenderingContext2D, g: Grid, color: (v: number) => readonly [number, number, number, number]) {
	const { cols, rows, cell, v } = g;
	scratch ??= document.createElement('canvas');
	scratch.width = cols;
	scratch.height = rows;
	const sctx = scratch.getContext('2d')!;
	const img = sctx.createImageData(cols, rows);
	for (let k = 0; k < cols * rows; k++) {
		const c = color(v[k]);
		img.data[4 * k] = c[0];
		img.data[4 * k + 1] = c[1];
		img.data[4 * k + 2] = c[2];
		img.data[4 * k + 3] = Math.round(255 * c[3]);
	}
	sctx.putImageData(img, 0, 0);
	ctx.save();
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = 'high';
	ctx.drawImage(scratch, -cell / 2, -cell / 2, cols * cell, rows * cell);
	ctx.restore();
}

/** Tint the plane by P(class B) = toP(value): colour of the likelier class, stronger the more confident. */
export function shade(ctx: CanvasRenderingContext2D, g: Grid, t: VizTheme, toP: (v: number) => number = (v) => v, strength = 0.26) {
	const c0 = rgb(classColor(t, 0));
	const c1 = rgb(classColor(t, 1));
	paint(ctx, g, (v) => {
		const p = toP(v);
		const c = p >= 0.5 ? c1 : c0;
		return [c[0], c[1], c[2], 0.035 + strength * Math.pow(Math.abs(2 * p - 1), 0.8)];
	});
}

/** Draw the level set {f = level} of a sampled grid with marching squares. */
export function contour(ctx: CanvasRenderingContext2D, g: Grid, level: number, stroke: string, lw = 2, dash: number[] = []) {
	const { cols, rows, cell, v } = g;
	ctx.strokeStyle = stroke;
	ctx.lineWidth = lw;
	ctx.setLineDash(dash);
	ctx.lineJoin = 'round';
	ctx.beginPath();
	const lerp = (a: number, b: number) => {
		const d = b - a;
		return d === 0 ? 0.5 : clamp((level - a) / d, 0, 1);
	};
	for (let j = 0; j < rows - 1; j++) {
		for (let i = 0; i < cols - 1; i++) {
			const k = j * cols + i;
			const a = v[k]; // top-left
			const b = v[k + 1]; // top-right
			const c = v[k + cols + 1]; // bottom-right
			const d = v[k + cols]; // bottom-left
			const idx = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
			if (idx === 0 || idx === 15) continue;
			const x = i * cell;
			const y = j * cell;
			const top: [number, number] = [x + lerp(a, b) * cell, y];
			const right: [number, number] = [x + cell, y + lerp(b, c) * cell];
			const bottom: [number, number] = [x + lerp(d, c) * cell, y + cell];
			const left: [number, number] = [x, y + lerp(a, d) * cell];
			const seg = (p: [number, number], q: [number, number]) => {
				ctx.moveTo(p[0], p[1]);
				ctx.lineTo(q[0], q[1]);
			};
			switch (idx) {
				case 1:
				case 14:
					seg(left, bottom);
					break;
				case 2:
				case 13:
					seg(bottom, right);
					break;
				case 3:
				case 12:
					seg(left, right);
					break;
				case 4:
				case 11:
					seg(top, right);
					break;
				case 6:
				case 9:
					seg(top, bottom);
					break;
				case 7:
				case 8:
					seg(left, top);
					break;
				case 5:
					seg(left, top);
					seg(bottom, right);
					break;
				case 10:
					seg(top, right);
					seg(left, bottom);
					break;
			}
		}
	}
	ctx.stroke();
	ctx.setLineDash([]);
}

/** Clip a segment given in data coordinates to the inner plot box; returns pixel end points. */
export function clipSegment(m: Mapper, seg: [number, number, number, number], w: number, h: number) {
	const x0 = m.x(seg[0]);
	const y0 = m.y(seg[1]);
	const dx = m.x(seg[2]) - x0;
	const dy = m.y(seg[3]) - y0;
	let t0 = 0;
	let t1 = 1;
	const edges: [number, number][] = [
		[-dx, x0 - PAD],
		[dx, w - PAD - x0],
		[-dy, y0 - PAD],
		[dy, h - PAD - y0]
	];
	for (const [p, q] of edges) {
		if (p === 0) {
			if (q < 0) return null;
			continue;
		}
		const r = q / p;
		if (p < 0) t0 = Math.max(t0, r);
		else t1 = Math.min(t1, r);
	}
	if (t0 > t1) return null;
	return { x0: x0 + t0 * dx, y0: y0 + t0 * dy, x1: x0 + t1 * dx, y1: y0 + t1 * dy };
}

/** Straight line {w₁x₁ + w₂x₂ + b = level}, clipped to the plot box. Returns its pixel end points. */
export function levelLine(
	ctx: CanvasRenderingContext2D,
	m: Mapper,
	w: number,
	h: number,
	wv: readonly number[],
	b: number,
	level: number,
	stroke: string,
	lw = 2,
	dash: number[] = []
) {
	const [w1, w2] = wv;
	if (Math.abs(w1) < 1e-9 && Math.abs(w2) < 1e-9) return null;
	const big = 50;
	const seg: [number, number, number, number] =
		Math.abs(w2) >= Math.abs(w1)
			? [-big, (level - b + w1 * big) / w2, big, (level - b - w1 * big) / w2]
			: [(level - b + w2 * big) / w1, -big, (level - b - w2 * big) / w1, big];
	const c = clipSegment(m, seg, w, h);
	if (!c) return null;
	ctx.strokeStyle = stroke;
	ctx.lineWidth = lw;
	ctx.setLineDash(dash);
	ctx.beginPath();
	ctx.moveTo(c.x0, c.y0);
	ctx.lineTo(c.x1, c.y1);
	ctx.stroke();
	ctx.setLineDash([]);
	return c;
}

/** Text in a rounded box. `x` is the left edge (or right edge with align 'right'). */
export function pill(
	ctx: CanvasRenderingContext2D,
	t: VizTheme,
	text: string,
	x: number,
	y: number,
	{ align = 'left', color = t.text, border = t.axis }: { align?: 'left' | 'right' | 'center'; color?: string; border?: string } = {}
) {
	ctx.font = `600 11px ${t.sans}`;
	const w = ctx.measureText(text).width + 12;
	const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
	ctx.fillStyle = alpha(t.bg, 0.92);
	ctx.strokeStyle = border;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.roundRect(x0, y - 10, w, 20, 6);
	ctx.fill();
	ctx.stroke();
	label(ctx, t, text, x0 + 6, y, { color, size: 11, weight: 600 });
	return w;
}

/** A diamond-shaped "query" marker. */
export function query(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string, stroke: string) {
	ctx.beginPath();
	ctx.moveTo(x, y - r);
	ctx.lineTo(x + r, y);
	ctx.lineTo(x, y + r);
	ctx.lineTo(x - r, y);
	ctx.closePath();
	ctx.fillStyle = fill;
	ctx.fill();
	ctx.lineWidth = 2;
	ctx.strokeStyle = stroke;
	ctx.stroke();
}

/** Arrow from (x0,y0) to (x1,y1). */
export function arrow(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, lw = 2) {
	const len = Math.hypot(x1 - x0, y1 - y0);
	if (len < 3) return;
	const ux = (x1 - x0) / len;
	const uy = (y1 - y0) / len;
	const head = Math.min(9, len * 0.5);
	ctx.strokeStyle = color;
	ctx.fillStyle = color;
	ctx.lineWidth = lw;
	ctx.beginPath();
	ctx.moveTo(x0, y0);
	ctx.lineTo(x1 - ux * head * 0.8, y1 - uy * head * 0.8);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x1 - ux * head - uy * head * 0.55, y1 - uy * head + ux * head * 0.55);
	ctx.lineTo(x1 - ux * head + uy * head * 0.55, y1 - uy * head - ux * head * 0.55);
	ctx.closePath();
	ctx.fill();
}

/** Index of the point within `radius` px of (px, py), or -1. */
export function hitPoint(m: Mapper, X: readonly (readonly number[])[], px: number, py: number, radius = 14): number {
	let best = -1;
	let bd = radius * radius;
	X.forEach((p, i) => {
		const d = (m.x(p[0]) - px) ** 2 + (m.y(p[1]) - py) ** 2;
		if (d < bd) {
			bd = d;
			best = i;
		}
	});
	return best;
}

/** Log-scale slider helpers: slider position (integer) ↔ value. */
export function logScale(lo: number, hi: number, stepsPerDecade = 4) {
	const a = Math.log10(lo);
	const n = Math.round((Math.log10(hi) - a) * stepsPerDecade);
	const toValue = (i: number) => {
		const v = 10 ** (a + i / stepsPerDecade);
		const mag = 10 ** Math.floor(Math.log10(v) - 1);
		return Math.round(v / mag) * mag;
	};
	const toIndex = (v: number) => clamp(Math.round((Math.log10(v) - a) * stepsPerDecade), 0, n);
	return { n, toValue, toIndex };
}

export const pct = (v: number, d = 0) => (Number.isFinite(v) ? `${(v * 100).toFixed(d)}%` : '—');
export const num = (v: number) => {
	if (!Number.isFinite(v)) return '—';
	if (v >= 100) return v.toFixed(0);
	if (v >= 1) return String(+v.toPrecision(3));
	return String(+v.toPrecision(2));
};
