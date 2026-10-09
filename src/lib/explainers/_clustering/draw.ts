/**
 * Canvas helpers shared by the clustering scenes. All colours come from the theme.
 */
import { alpha, dot, fmt, label, mapper, ticks, type VizTheme } from '#lib/viz/canvas.ts';
import type { Pt } from './data';

export type Mapper = ReturnType<typeof mapper>;

/** Series colour for cluster j; noise / unassigned (-1) is muted. */
export const clusterColor = (t: VizTheme, j: number) => (j < 0 ? t.text3 : t.series[j % t.series.length]);

export function grid(ctx: CanvasRenderingContext2D, m: Mapper, w: number, h: number, t: VizTheme) {
	ctx.strokeStyle = t.grid;
	ctx.lineWidth = 1;
	for (const v of ticks(-2, 2, 8)) {
		ctx.beginPath();
		ctx.moveTo(m.x(v), 0);
		ctx.lineTo(m.x(v), h);
		ctx.moveTo(0, m.y(v));
		ctx.lineTo(w, m.y(v));
		ctx.stroke();
	}
}

export function rgb(color: string): [number, number, number] {
	const m = alpha(color, 1).match(/rgba\(([^)]+)\)/);
	if (!m) return [128, 128, 128];
	const [r, g, b] = m[1].split(',').map((v) => parseFloat(v));
	return [r, g, b];
}

/** Weighted mix of colours (weights should sum to 1). */
export function blend(colors: string[], weights: number[], a = 0.9): string {
	let r = 0;
	let g = 0;
	let b = 0;
	let total = 0;
	colors.forEach((c, i) => {
		const w = weights[i] ?? 0;
		const [cr, cg, cb] = rgb(c);
		r += cr * w;
		g += cg * w;
		b += cb * w;
		total += w;
	});
	total ||= 1;
	return `rgba(${Math.round(r / total)}, ${Math.round(g / total)}, ${Math.round(b / total)}, ${a})`;
}

/** Index of the point within `radius` px of the pointer, or -1. */
export function hitPoint(points: Pt[], m: Mapper, p: { x: number; y: number }, radius = 14): number {
	let best = -1;
	let bd = radius * radius;
	points.forEach((q, i) => {
		const d = (m.x(q[0]) - p.x) ** 2 + (m.y(q[1]) - p.y) ** 2;
		if (d < bd) {
			bd = d;
			best = i;
		}
	});
	return best;
}

/** Small "×" marker (used for noise points). */
export function cross(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, lw = 1.5) {
	ctx.strokeStyle = color;
	ctx.lineWidth = lw;
	ctx.beginPath();
	ctx.moveTo(x - r, y - r);
	ctx.lineTo(x + r, y + r);
	ctx.moveTo(x + r, y - r);
	ctx.lineTo(x - r, y + r);
	ctx.stroke();
}

/** Centroid / mean marker: filled disc with a white plus. */
export function centerMark(ctx: CanvasRenderingContext2D, t: VizTheme, x: number, y: number, color: string, r = 7) {
	dot(ctx, x, y, r + 4, alpha(color, 0.18));
	dot(ctx, x, y, r, color, t.bg, 2.5);
	ctx.strokeStyle = t.bg;
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(x - 3, y);
	ctx.lineTo(x + 3, y);
	ctx.moveTo(x, y - 3);
	ctx.lineTo(x, y + 3);
	ctx.stroke();
}

/** Convex hull (monotone chain), counter-clockwise. */
export function hull(pts: Pt[]): Pt[] {
	const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
	if (p.length < 3) return p;
	const cross2 = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
	const lower: Pt[] = [];
	for (const q of p) {
		while (lower.length >= 2 && cross2(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
		lower.push(q);
	}
	const upper: Pt[] = [];
	for (let i = p.length - 1; i >= 0; i--) {
		const q = p[i];
		while (upper.length >= 2 && cross2(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop();
		upper.push(q);
	}
	return lower.slice(0, -1).concat(upper.slice(0, -1));
}

let layer: HTMLCanvasElement | null = null;

/** Rounded blob around a group of points: a padded convex hull drawn at uniform opacity. */
export function groupOutline(ctx: CanvasRenderingContext2D, m: Mapper, pts: Pt[], color: string, pad = 9, fillA = 0.1) {
	if (!pts.length) return;
	const h = hull(pts);
	const W = ctx.canvas.width;
	const H = ctx.canvas.height;
	layer ??= document.createElement('canvas');
	if (layer.width !== W || layer.height !== H) {
		layer.width = W;
		layer.height = H;
	}
	const l = layer.getContext('2d')!;
	l.setTransform(1, 0, 0, 1, 0, 0);
	l.clearRect(0, 0, W, H);
	l.setTransform(ctx.getTransform());
	l.lineJoin = 'round';
	l.lineCap = 'round';
	l.beginPath();
	h.forEach(([x, y], i) => (i ? l.lineTo(m.x(x), m.y(y)) : l.moveTo(m.x(x), m.y(y))));
	l.closePath();
	l.lineWidth = pad * 2;
	l.strokeStyle = alpha(color, 1);
	l.fillStyle = alpha(color, 1);
	l.stroke();
	l.fill();
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.globalAlpha = fillA;
	ctx.drawImage(layer, 0, 0);
	ctx.restore();
}

export interface MetricChartOpts {
	/** x values (e.g. K = 1..8). */
	xs: number[];
	ys: number[];
	current?: number;
	/** Highlighted "best" x (drawn with a ring). */
	best?: number;
	yLabel: string;
	xLabel?: string;
	digits?: number;
}

/** Small line chart of a metric against K. Returns the mapper so callers can map clicks back to x. */
export function metricChart(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme, o: MetricChartOpts): Mapper {
	const box = { x: 48, y: 18, w: w - 64, h: h - 44 };
	const finite = o.ys.filter(Number.isFinite);
	let lo = Math.min(...finite);
	let hi = Math.max(...finite);
	const padY = (hi - lo) * 0.12 || 1;
	lo -= padY;
	hi += padY;
	const m = mapper(box, [o.xs[0] - 0.4, o.xs[o.xs.length - 1] + 0.4], [lo, hi]);
	ctx.strokeStyle = t.grid;
	ctx.lineWidth = 1;
	for (const v of ticks(lo, hi, 3)) {
		ctx.beginPath();
		ctx.moveTo(box.x, m.y(v));
		ctx.lineTo(box.x + box.w, m.y(v));
		ctx.stroke();
		label(ctx, t, fmt(v, o.digits ?? 0), box.x - 8, m.y(v), { align: 'right', color: t.text3, size: 10 });
	}
	o.xs.forEach((x) =>
		label(ctx, t, String(x), m.x(x), box.y + box.h + 13, {
			align: 'center',
			color: x === o.current ? t.text : t.text3,
			size: 11,
			weight: x === o.current ? 700 : 500
		})
	);
	label(ctx, t, o.xLabel ?? 'K', box.x + box.w + 10, box.y + box.h + 13, { color: t.text3, size: 10 });
	label(ctx, t, o.yLabel, box.x, 5, { color: t.text3, size: 10, base: 'top' });
	ctx.strokeStyle = t.accent;
	ctx.lineWidth = 2;
	ctx.beginPath();
	o.xs.forEach((x, i) => (i ? ctx.lineTo(m.x(x), m.y(o.ys[i])) : ctx.moveTo(m.x(x), m.y(o.ys[i]))));
	ctx.stroke();
	o.xs.forEach((x, i) => {
		const cur = x === o.current;
		if (x === o.best) dot(ctx, m.x(x), m.y(o.ys[i]), 10, alpha(t.series[1], 0.2), t.series[1], 1.5);
		dot(ctx, m.x(x), m.y(o.ys[i]), cur ? 6 : 3.5, cur ? t.accent : t.bg, t.accent, 2);
	});
	return m;
}

/** K-Means result drawn for comparison: shaded nearest-centroid regions, coloured points, centroids. */
export function drawKMeansView(
	ctx: CanvasRenderingContext2D,
	m: Mapper,
	w: number,
	h: number,
	t: VizTheme,
	pts: Pt[],
	res: { labels: number[]; centroids: Pt[] }
) {
	const cell = 7;
	for (let py = 0; py < h; py += cell)
		for (let px = 0; px < w; px += cell) {
			const q: Pt = [m.invX(px + cell / 2), m.invY(py + cell / 2)];
			let best = 0;
			let bd = Infinity;
			res.centroids.forEach((c, j) => {
				const d = (c[0] - q[0]) ** 2 + (c[1] - q[1]) ** 2;
				if (d < bd) {
					bd = d;
					best = j;
				}
			});
			ctx.fillStyle = alpha(clusterColor(t, best), 0.07);
			ctx.fillRect(px, py, cell, cell);
		}
	pts.forEach((p, i) => dot(ctx, m.x(p[0]), m.y(p[1]), 3.4, alpha(clusterColor(t, res.labels[i]), 0.85)));
	res.centroids.forEach((c, j) => centerMark(ctx, t, m.x(c[0]), m.y(c[1]), clusterColor(t, j)));
	label(ctx, t, `K-Means, K = ${res.centroids.length}`, 14, h - 16, { color: t.text2, size: 11, weight: 600 });
}
