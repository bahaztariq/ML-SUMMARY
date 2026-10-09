/**
 * Small canvas toolkit shared by the explainer scenes: theme colors, seeded randomness,
 * domain↔pixel mapping and a few drawing primitives.
 */

export interface VizTheme {
	bg: string;
	grid: string;
	axis: string;
	text: string;
	text2: string;
	text3: string;
	surface: string;
	accent: string;
	/** Error / negative highlight. */
	danger: string;
	/** Positive / correct highlight. */
	success: string;
	series: string[];
	mono: string;
	sans: string;
}

/** Read the --viz-* tokens from the element's computed style (follows light/dark). */
export function readTheme(el: Element): VizTheme {
	const cs = getComputedStyle(el);
	const v = (name: string, fb: string) => cs.getPropertyValue(name).trim() || fb;
	return {
		bg: v('--viz-bg', '#fff'),
		grid: v('--viz-grid', 'rgba(0,0,0,.06)'),
		axis: v('--viz-axis', 'rgba(0,0,0,.25)'),
		text: v('--text', '#18181b'),
		text2: v('--text-2', '#52525b'),
		text3: v('--text-3', '#8a8a93'),
		surface: v('--surface-2', '#f4f4f2'),
		accent: v('--accent', '#4f46e5'),
		danger: v('--danger', '#dc2626'),
		success: v('--success', '#16a34a'),
		series: [1, 2, 3, 4, 5, 6].map((i) => v(`--viz-${i}`, '#4f46e5')),
		mono: v('--font-mono', 'monospace'),
		sans: v('--font-sans', 'sans-serif')
	};
}

/** Convert '#rgb', '#rrggbb' or 'rgb(a)(…)' to rgba() with alpha `a`. */
export function alpha(color: string, a: number): string {
	const c = color.trim();
	let r = 128,
		g = 128,
		b = 128;
	if (c[0] === '#') {
		let hex = c.slice(1);
		if (hex.length === 3) hex = [...hex].map((ch) => ch + ch).join('');
		const n = parseInt(hex.slice(0, 6), 16);
		r = (n >> 16) & 255;
		g = (n >> 8) & 255;
		b = n & 255;
	} else {
		const m = c.match(/rgba?\(([^)]+)\)/);
		if (m) [r, g, b] = m[1].split(',').map((s) => parseFloat(s));
	}
	return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Deterministic PRNG: same seed, same data, so lessons replay identically. */
export function mulberry32(seed: number) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export function gaussian(rand: () => number) {
	let spare: number | null = null;
	return () => {
		if (spare !== null) {
			const s = spare;
			spare = null;
			return s;
		}
		let u = 0;
		while (u === 0) u = rand();
		const v = rand();
		const r = Math.sqrt(-2 * Math.log(u));
		spare = r * Math.sin(2 * Math.PI * v);
		return r * Math.cos(2 * Math.PI * v);
	};
}

export interface Box {
	x: number;
	y: number;
	w: number;
	h: number;
}

/** Linear map from a data domain to a pixel box (y grows upwards in data space). */
export function mapper(box: Box, [x0, x1]: [number, number], [y0, y1]: [number, number]) {
	const sx = box.w / (x1 - x0);
	const sy = box.h / (y1 - y0);
	return {
		x: (v: number) => box.x + (v - x0) * sx,
		y: (v: number) => box.y + box.h - (v - y0) * sy,
		invX: (px: number) => x0 + (px - box.x) / sx,
		invY: (py: number) => y0 + (box.y + box.h - py) / sy
	};
}

/** Map a square data domain into the box with a 1:1 aspect ratio, widening the shorter side. */
export function squareMapper(box: Box, [lo, hi]: [number, number]) {
	const size = Math.min(box.w, box.h);
	const span = hi - lo;
	const extraX = ((box.w - size) / size) * span * 0.5;
	const extraY = ((box.h - size) / size) * span * 0.5;
	return mapper(box, [lo - extraX, hi + extraX], [lo - extraY, hi + extraY]);
}

export function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string, stroke?: string, lw = 1.5) {
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.fillStyle = fill;
	ctx.fill();
	if (stroke) {
		ctx.lineWidth = lw;
		ctx.strokeStyle = stroke;
		ctx.stroke();
	}
}

export function label(
	ctx: CanvasRenderingContext2D,
	t: VizTheme,
	text: string,
	x: number,
	y: number,
	{ color = t.text2, align = 'left', base = 'middle', size = 11, weight = 500 }: {
		color?: string;
		align?: CanvasTextAlign;
		base?: CanvasTextBaseline;
		size?: number;
		weight?: number;
	} = {}
) {
	ctx.font = `${weight} ${size}px ${t.sans}`;
	ctx.fillStyle = color;
	ctx.textAlign = align;
	ctx.textBaseline = base;
	ctx.fillText(text, x, y);
}

export function niceStep(span: number, n: number) {
	const raw = span / Math.max(1, n);
	const mag = 10 ** Math.floor(Math.log10(raw));
	const norm = raw / mag;
	return (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
}

export function ticks(a: number, b: number, n: number) {
	const step = niceStep(b - a, n);
	const out: number[] = [];
	for (let v = Math.ceil(a / step) * step; v <= b + step * 1e-9; v += step) out.push(+v.toFixed(10));
	return out;
}

export const fmt = (v: number, d = 2) =>
	!Number.isFinite(v) ? '—' : Math.abs(v) >= 1e5 ? v.toExponential(2) : v.toFixed(d);
