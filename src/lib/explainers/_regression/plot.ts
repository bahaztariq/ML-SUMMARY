/**
 * Canvas helpers shared by the regression lesson scenes: axes, points, lines, residuals and
 * the "squared error" squares. Colors always come from the VizTheme.
 */
import { alpha, dot, label, mapper, ticks, type Box, type VizTheme } from '#lib/viz/canvas.ts';

export type Mapper = ReturnType<typeof mapper>;

export interface Plot {
	box: Box;
	m: Mapper;
	xDom: [number, number];
	yDom: [number, number];
}

export interface AxesOpts {
	xDom: [number, number];
	yDom: [number, number];
	xLabel?: string;
	yLabel?: string;
	xFmt?: (v: number) => string;
	yFmt?: (v: number) => string;
	xTicks?: number;
	yTicks?: number;
	pad?: Partial<{ left: number; right: number; top: number; bottom: number }>;
}

export const euro = (v: number) => `€${Math.round(v).toLocaleString('en-US')}`;

/** Grid, tick labels and axis titles. Returns the mapping for the plot area. */
export function axes(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme, o: AxesOpts): Plot {
	const pad = { left: 50, right: 14, top: 16, bottom: 34, ...o.pad };
	const box = { x: pad.left, y: pad.top, w: Math.max(10, w - pad.left - pad.right), h: Math.max(10, h - pad.top - pad.bottom) };
	const m = mapper(box, o.xDom, o.yDom);
	const xFmt = o.xFmt ?? ((v: number) => String(v));
	const yFmt = o.yFmt ?? ((v: number) => String(v));
	ctx.lineWidth = 1;
	const nx = o.xTicks ?? Math.max(3, Math.round(box.w / 90));
	const ny = o.yTicks ?? Math.max(3, Math.round(box.h / 60));
	for (const v of ticks(o.yDom[0], o.yDom[1], ny)) {
		ctx.strokeStyle = t.grid;
		ctx.beginPath();
		ctx.moveTo(box.x, m.y(v));
		ctx.lineTo(box.x + box.w, m.y(v));
		ctx.stroke();
		label(ctx, t, yFmt(v), box.x - 7, m.y(v), { align: 'right', color: t.text3, size: 10 });
	}
	for (const v of ticks(o.xDom[0], o.xDom[1], nx)) {
		ctx.strokeStyle = t.grid;
		ctx.beginPath();
		ctx.moveTo(m.x(v), box.y);
		ctx.lineTo(m.x(v), box.y + box.h);
		ctx.stroke();
		label(ctx, t, xFmt(v), m.x(v), box.y + box.h + 12, { align: 'center', color: t.text3, size: 10 });
	}
	ctx.strokeStyle = t.axis;
	ctx.beginPath();
	ctx.moveTo(box.x, box.y);
	ctx.lineTo(box.x, box.y + box.h);
	ctx.lineTo(box.x + box.w, box.y + box.h);
	ctx.stroke();
	if (o.xLabel) label(ctx, t, o.xLabel, box.x + box.w, box.y + box.h + 26, { align: 'right', color: t.text2, size: 11, weight: 600 });
	if (o.yLabel) label(ctx, t, o.yLabel, 4, 6, { color: t.text2, size: 11, weight: 600, base: 'top' });
	return { box, m, xDom: o.xDom, yDom: o.yDom };
}

export function clip(ctx: CanvasRenderingContext2D, box: Box) {
	ctx.save();
	ctx.beginPath();
	ctx.rect(box.x, box.y, box.w, box.h);
	ctx.clip();
}

/** Plot y = f(x) across [x0, x1] (defaults to the whole x-domain). */
export function curve(
	ctx: CanvasRenderingContext2D,
	p: Plot,
	f: (x: number) => number,
	color: string,
	{ width = 2.5, dash, x0 = p.xDom[0], x1 = p.xDom[1], samples = 2 }: { width?: number; dash?: number[]; x0?: number; x1?: number; samples?: number } = {}
) {
	ctx.strokeStyle = color;
	ctx.lineWidth = width;
	ctx.setLineDash(dash ?? []);
	ctx.beginPath();
	const n = Math.max(1, samples - 1);
	const lim = (p.box.h + p.box.y) * 4;
	for (let i = 0; i <= n; i++) {
		const x = x0 + ((x1 - x0) * i) / n;
		const py = Math.max(-lim, Math.min(lim, p.m.y(f(x))));
		if (i) ctx.lineTo(p.m.x(x), py);
		else ctx.moveTo(p.m.x(x), py);
	}
	ctx.stroke();
	ctx.setLineDash([]);
}

/** Vertical residual segments from each point to its prediction. */
export function residualLines(
	ctx: CanvasRenderingContext2D,
	p: Plot,
	xs: number[],
	ys: number[],
	preds: number[],
	color: string,
	width = 1.6
) {
	ctx.strokeStyle = color;
	ctx.lineWidth = width;
	xs.forEach((x, i) => {
		ctx.beginPath();
		ctx.moveTo(p.m.x(x), p.m.y(ys[i]));
		ctx.lineTo(p.m.x(x), p.m.y(preds[i]));
		ctx.stroke();
	});
}

/**
 * One square per point whose side is the residual drawn in pixels, so its area is
 * proportional to the squared error (the same y-scale is used for every square).
 */
export function squares(
	ctx: CanvasRenderingContext2D,
	p: Plot,
	xs: number[],
	ys: number[],
	preds: number[],
	color: string,
	{ side = 'right', fill = 0.13, highlight = -1 }: { side?: 'left' | 'right'; fill?: number; highlight?: number } = {}
) {
	xs.forEach((x, i) => {
		const px = p.m.x(x);
		const y0 = p.m.y(ys[i]);
		const y1 = p.m.y(preds[i]);
		const s = Math.abs(y1 - y0);
		if (s < 0.5) return;
		const left = side === 'right' ? px : px - s;
		ctx.fillStyle = alpha(color, i === highlight ? fill * 2.2 : fill);
		ctx.fillRect(left, Math.min(y0, y1), s, s);
		ctx.strokeStyle = alpha(color, i === highlight ? 0.95 : 0.55);
		ctx.lineWidth = i === highlight ? 2 : 1;
		ctx.strokeRect(left, Math.min(y0, y1), s, s);
	});
}

export function points(
	ctx: CanvasRenderingContext2D,
	p: Plot,
	t: VizTheme,
	xs: number[],
	ys: number[],
	{ color = t.text2, r = 4.5, active = -1, special = -1, specialColor = t.series[3] }: {
		color?: string;
		r?: number;
		active?: number;
		special?: number;
		specialColor?: string;
	} = {}
) {
	xs.forEach((x, i) => {
		const c = i === special ? specialColor : color;
		if (i === active) dot(ctx, p.m.x(x), p.m.y(ys[i]), r + 6, alpha(c, 0.18));
		dot(ctx, p.m.x(x), p.m.y(ys[i]), i === active ? r + 1.5 : r, c, t.bg, 1.5);
	});
}

/** Index of the point within `max` px of (px, py), or -1. */
export function nearestPoint(p: Plot, xs: number[], ys: number[], px: number, py: number, max = 16) {
	let best = -1;
	let bd = max * max;
	xs.forEach((x, i) => {
		const d = (p.m.x(x) - px) ** 2 + (p.m.y(ys[i]) - py) ** 2;
		if (d < bd) {
			bd = d;
			best = i;
		}
	});
	return best;
}

/** A round draggable handle. */
export function handle(ctx: CanvasRenderingContext2D, t: VizTheme, x: number, y: number, color: string, hot = false) {
	dot(ctx, x, y, hot ? 13 : 11, alpha(color, 0.16));
	dot(ctx, x, y, hot ? 7.5 : 6.5, t.bg, color, 2.5);
}

/** Small pill label with a background so it stays readable over the data. */
export function tag(
	ctx: CanvasRenderingContext2D,
	t: VizTheme,
	text: string,
	x: number,
	y: number,
	color: string,
	align: CanvasTextAlign = 'left'
) {
	ctx.font = `600 11px ${t.sans}`;
	const w = ctx.measureText(text).width + 12;
	const left = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
	ctx.fillStyle = alpha(t.bg, 0.88);
	ctx.strokeStyle = alpha(color, 0.5);
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.roundRect(left, y - 10, w, 20, 6);
	ctx.fill();
	ctx.stroke();
	label(ctx, t, text, left + 6, y, { color, size: 11, weight: 600 });
}
