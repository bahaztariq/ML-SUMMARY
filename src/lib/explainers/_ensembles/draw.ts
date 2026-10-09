/**
 * Canvas drawing helpers shared by the ensemble lesson scenes: class markers, pills and a small
 * line chart. Colors always come from the theme passed in.
 */
import { alpha, dot, label, mapper, ticks, type VizTheme } from '#lib/viz/canvas.ts';

/** Class 0 = circle (series 1), class 1 = square (series 3), as in the decision-tree lesson. */
export const classColor = (t: VizTheme, c: number) => (c ? t.series[2] : t.series[0]);

export function marker(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	c: number,
	r: number,
	fill: string | null,
	stroke?: string,
	lw = 1.5
) {
	if (c === 0) {
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		if (fill) {
			ctx.fillStyle = fill;
			ctx.fill();
		}
		if (stroke) {
			ctx.lineWidth = lw;
			ctx.strokeStyle = stroke;
			ctx.stroke();
		}
		return;
	}
	const a = r * 0.9;
	if (fill) {
		ctx.fillStyle = fill;
		ctx.fillRect(x - a, y - a, 2 * a, 2 * a);
	}
	if (stroke) {
		ctx.strokeStyle = stroke;
		ctx.lineWidth = lw;
		ctx.strokeRect(x - a, y - a, 2 * a, 2 * a);
	}
}

export function pillWidth(ctx: CanvasRenderingContext2D, t: VizTheme, text: string, size = 11) {
	ctx.font = `600 ${size}px ${t.sans}`;
	return ctx.measureText(text).width + 12;
}

/** Text in a rounded box whose left edge is at x0, vertically centred on y. */
export function pill(ctx: CanvasRenderingContext2D, t: VizTheme, text: string, x0: number, y: number, color = t.text, size = 11) {
	const w = pillWidth(ctx, t, text, size);
	ctx.fillStyle = alpha(t.bg, 0.92);
	ctx.strokeStyle = t.axis;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.roundRect(x0, y - 10, w, 20, 6);
	ctx.fill();
	ctx.stroke();
	label(ctx, t, text, x0 + 6, y, { color, size, weight: 600 });
	return w;
}

export function grid(ctx: CanvasRenderingContext2D, t: VizTheme, m: ReturnType<typeof mapper>, w: number, h: number, lo = -2, hi = 2) {
	ctx.strokeStyle = t.grid;
	ctx.lineWidth = 1;
	for (const v of ticks(lo, hi, 8)) {
		ctx.beginPath();
		ctx.moveTo(m.x(v), 0);
		ctx.lineTo(m.x(v), h);
		ctx.moveTo(0, m.y(v));
		ctx.lineTo(w, m.y(v));
		ctx.stroke();
	}
}

export interface Line {
	pts: [number, number][];
	color: string;
	label?: string;
	width?: number;
	dash?: number[];
	dots?: boolean;
}

export interface ChartOpts {
	title: string;
	x: [number, number];
	y: [number, number];
	lines: Line[];
	xLabel?: string;
	xTicks?: number[];
	xFormat?: (v: number) => string;
	yFormat?: (v: number) => string;
	/** Vertical marker at this x (e.g. the current number of trees). */
	marker?: number;
	markerLabel?: string;
	/** Highlighted points: [x, y, color, label?]. */
	points?: [number, number, string, string?][];
	/** Right padding reserved for end-of-line labels. */
	right?: number;
}

/** A compact line chart. Returns the mapper so callers can turn clicks into x values. */
export function lineChart(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme, o: ChartOpts) {
	const right = o.right ?? 44;
	const box = { x: 42, y: 22, w: Math.max(10, w - 42 - right), h: Math.max(10, h - 46) };
	const m = mapper(box, o.x, o.y);
	const yf = o.yFormat ?? ((v: number) => v.toFixed(2));
	const xf = o.xFormat ?? ((v: number) => String(v));
	ctx.lineWidth = 1;
	for (const v of ticks(o.y[0], o.y[1], 3)) {
		ctx.strokeStyle = t.grid;
		ctx.beginPath();
		ctx.moveTo(box.x, m.y(v));
		ctx.lineTo(box.x + box.w, m.y(v));
		ctx.stroke();
		label(ctx, t, yf(v), box.x - 6, m.y(v), { align: 'right', color: t.text3, size: 10 });
	}
	for (const v of o.xTicks ?? ticks(o.x[0], o.x[1], 5))
		label(ctx, t, xf(v), m.x(v), box.y + box.h + 11, { align: 'center', color: t.text3, size: 10 });
	label(ctx, t, o.title, 6, 4, { color: t.text3, size: 10, base: 'top' });
	if (o.xLabel) label(ctx, t, o.xLabel, w - 6, 4, { align: 'right', color: t.text3, size: 10, base: 'top' });

	if (o.marker !== undefined) {
		const x = m.x(Math.min(o.x[1], Math.max(o.x[0], o.marker)));
		ctx.strokeStyle = t.axis;
		ctx.beginPath();
		ctx.moveTo(x, box.y);
		ctx.lineTo(x, box.y + box.h);
		ctx.stroke();
		if (o.markerLabel) {
			const leftSide = x > box.x + box.w * 0.7;
			label(ctx, t, o.markerLabel, x + (leftSide ? -4 : 4), box.y + 2, {
				align: leftSide ? 'right' : 'left',
				color: t.text2,
				size: 10,
				base: 'top',
				weight: 600
			});
		}
	}

	ctx.save();
	ctx.beginPath();
	ctx.rect(box.x - 2, box.y - 4, box.w + 4, box.h + 8);
	ctx.clip();
	for (const l of o.lines) {
		if (!l.pts.length) continue;
		ctx.strokeStyle = l.color;
		ctx.lineWidth = l.width ?? 2;
		ctx.setLineDash(l.dash ?? []);
		ctx.beginPath();
		l.pts.forEach(([x, y], i) => (i ? ctx.lineTo(m.x(x), m.y(y)) : ctx.moveTo(m.x(x), m.y(y))));
		ctx.stroke();
		ctx.setLineDash([]);
		if (l.dots) for (const [x, y] of l.pts) dot(ctx, m.x(x), m.y(y), 2.5, l.color, t.bg, 1);
	}
	ctx.restore();

	// end labels, nudged apart
	const ends = o.lines
		.filter((l) => l.label && l.pts.length)
		.map((l) => ({ l, y: m.y(Math.min(o.y[1], Math.max(o.y[0], l.pts[l.pts.length - 1][1]))) }))
		.sort((a, b) => a.y - b.y);
	for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 12) ends[i].y = ends[i - 1].y + 12;
	for (const e of ends) {
		const last = e.l.pts[e.l.pts.length - 1];
		label(ctx, t, e.l.label!, Math.min(m.x(last[0]), box.x + box.w) + 6, e.y, { color: e.l.color, size: 10, weight: 700 });
	}

	for (const [x, y, color, text] of o.points ?? []) {
		dot(ctx, m.x(x), m.y(y), 4.5, color, t.bg, 1.5);
		if (text) {
			const leftSide = m.x(x) > box.x + box.w * 0.6;
			label(ctx, t, text, m.x(x) + (leftSide ? -8 : 8), m.y(y) - 9, { align: leftSide ? 'right' : 'left', color, size: 10, weight: 700 });
		}
	}
	return m;
}

/** Round a [lo, hi] range outward to a step, with a little padding. */
export function niceRange(values: number[], step = 0.05, pad = 0.01): [number, number] {
	const v = values.filter(Number.isFinite);
	if (!v.length) return [0, 1];
	let lo = Math.floor((Math.min(...v) - pad) / step) * step;
	let hi = Math.ceil((Math.max(...v) + pad) / step) * step;
	if (hi - lo < step) hi = lo + step;
	return [+lo.toFixed(6), +hi.toFixed(6)];
}
