/**
 * Canvas drawing helpers shared by the dimensionality-reduction and anomaly lessons.
 */
import { alpha, label, ticks, type VizTheme } from '#lib/viz/canvas.ts';

export function arrow(
	ctx: CanvasRenderingContext2D,
	x0: number,
	y0: number,
	x1: number,
	y1: number,
	color: string,
	lw = 2.5,
	head = 9
) {
	const a = Math.atan2(y1 - y0, x1 - x0);
	ctx.strokeStyle = color;
	ctx.fillStyle = color;
	ctx.lineWidth = lw;
	ctx.lineCap = 'round';
	ctx.beginPath();
	ctx.moveTo(x0, y0);
	ctx.lineTo(x1 - Math.cos(a) * head * 0.6, y1 - Math.sin(a) * head * 0.6);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x1 - Math.cos(a - 0.42) * head, y1 - Math.sin(a - 0.42) * head);
	ctx.lineTo(x1 - Math.cos(a + 0.42) * head, y1 - Math.sin(a + 0.42) * head);
	ctx.closePath();
	ctx.fill();
	ctx.lineCap = 'butt';
}

/** Light grid every nice step across the whole canvas, plus stronger axes through 0. */
export function grid2d(
	ctx: CanvasRenderingContext2D,
	t: VizTheme,
	m: { x: (v: number) => number; y: (v: number) => number; invX: (p: number) => number; invY: (p: number) => number },
	w: number,
	h: number,
	opts: { axes?: boolean; n?: number } = {}
) {
	const x0 = m.invX(0);
	const x1 = m.invX(w);
	const y0 = m.invY(h);
	const y1 = m.invY(0);
	ctx.strokeStyle = t.grid;
	ctx.lineWidth = 1;
	ctx.beginPath();
	for (const v of ticks(x0, x1, opts.n ?? 8)) {
		ctx.moveTo(m.x(v), 0);
		ctx.lineTo(m.x(v), h);
	}
	for (const v of ticks(y0, y1, Math.round(((opts.n ?? 8) * h) / Math.max(1, w)) + 1)) {
		ctx.moveTo(0, m.y(v));
		ctx.lineTo(w, m.y(v));
	}
	ctx.stroke();
	if (opts.axes && x0 < 0 && x1 > 0 && y0 < 0 && y1 > 0) {
		ctx.strokeStyle = t.axis;
		ctx.beginPath();
		ctx.moveTo(m.x(0), 0);
		ctx.lineTo(m.x(0), h);
		ctx.moveTo(0, m.y(0));
		ctx.lineTo(w, m.y(0));
		ctx.stroke();
	}
}

/** Small rounded label box. */
export function tag(
	ctx: CanvasRenderingContext2D,
	t: VizTheme,
	text: string,
	x: number,
	y: number,
	{ color = t.text, align = 'left' as CanvasTextAlign, size = 11 } = {}
) {
	ctx.font = `600 ${size}px ${t.sans}`;
	const w = ctx.measureText(text).width + 10;
	const cw = ctx.canvas.clientWidth || Infinity;
	const x0 = Math.max(2, Math.min(cw - w - 2, align === 'center' ? x - w / 2 : align === 'right' ? x - w : x));
	ctx.fillStyle = alpha(t.bg, 0.88);
	ctx.beginPath();
	ctx.roundRect(x0, y - 9, w, 18, 5);
	ctx.fill();
	label(ctx, t, text, x0 + 5, y, { color, size, weight: 600 });
}
