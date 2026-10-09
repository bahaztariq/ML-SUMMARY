<!--
  Small generic x/y chart used by the classification lessons: ROC and PR curves, metric-vs-threshold
  lines, cost curves, the −log(p) penalty and reliability diagrams.
-->
<script lang="ts">
	import Canvas from '#lib/viz/Canvas.svelte';
	import { local } from '#lib/i18n/index.svelte.ts';
	import { alpha, clamp, dot, fmt, label, mapper, ticks, type VizTheme } from '#lib/viz/canvas.ts';
	import { ink, type Marker, type Rect, type Rule, type Series } from './ink.ts';

	interface Props {
		xDomain?: [number, number];
		yDomain?: [number, number];
		xLabel: string;
		yLabel: string;
		series?: Series[];
		markers?: Marker[];
		vlines?: Rule[];
		hlines?: Rule[];
		rects?: Rect[];
		/** Dashed y = x reference (ROC chance line, perfect calibration). */
		diagonal?: boolean;
		/** Keep a 1:1 aspect ratio for the plotting box. */
		square?: boolean;
		xFormat?: (v: number) => string;
		yFormat?: (v: number) => string;
		/** Text drawn in a corner of the plot area. */
		note?: string;
		noteAt?: 'top' | 'bottom';
		/** Called with the data x under the pointer while pressed. */
		onpick?: (x: number, y: number) => void;
		aspect?: number;
		minHeight?: number;
		maxHeight?: number;
		ariaLabel?: string;
	}

	let {
		xDomain = [0, 1],
		yDomain = [0, 1],
		xLabel,
		yLabel,
		series = [],
		markers = [],
		vlines = [],
		hlines = [],
		rects = [],
		diagonal = false,
		square = false,
		xFormat = (v) => fmt(v, 1),
		yFormat = (v) => fmt(v, 1),
		note = '',
		noteAt = 'bottom',
		onpick,
		aspect = 0.8,
		minHeight = 200,
		maxHeight = 300,
		ariaLabel
	}: Props = $props();

	const EN = { chart: 'Chart' };
	const L = local({ en: EN, fr: { chart: 'Graphique' }, ar: { chart: 'رسم بياني' } });

	let map: ReturnType<typeof mapper> | null = null;
	let pressed = false;

	function pick(p: { x: number; y: number }) {
		if (!map || !onpick) return;
		onpick(clamp(map.invX(p.x), xDomain[0], xDomain[1]), clamp(map.invY(p.y), yDomain[0], yDomain[1]));
	}

	function draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		let box = { x: 50, y: 14, w: w - 62, h: h - 46 };
		if (square) {
			const s = Math.min(box.w, box.h);
			box = { x: box.x + (box.w - s) / 2, y: box.y, w: s, h: s };
		}
		const m = mapper(box, xDomain, yDomain);
		map = m;
		const cx = (v: number) => clamp(m.x(v), box.x - 2, box.x + box.w + 2);
		const cy = (v: number) => clamp(m.y(v), box.y - 2, box.y + box.h + 2);

		// grid + tick labels
		ctx.lineWidth = 1;
		for (const v of ticks(xDomain[0], xDomain[1], square ? 5 : 6)) {
			ctx.strokeStyle = t.grid;
			ctx.beginPath();
			ctx.moveTo(m.x(v), box.y);
			ctx.lineTo(m.x(v), box.y + box.h);
			ctx.stroke();
			label(ctx, t, xFormat(v), m.x(v), box.y + box.h + 11, { align: 'center', color: t.text3, size: 10 });
		}
		for (const v of ticks(yDomain[0], yDomain[1], 5)) {
			ctx.strokeStyle = t.grid;
			ctx.beginPath();
			ctx.moveTo(box.x, m.y(v));
			ctx.lineTo(box.x + box.w, m.y(v));
			ctx.stroke();
			label(ctx, t, yFormat(v), box.x - 6, m.y(v), { align: 'right', color: t.text3, size: 10 });
		}
		ctx.strokeStyle = t.axis;
		ctx.strokeRect(box.x, box.y, box.w, box.h);
		label(ctx, t, xLabel, box.x + box.w / 2, box.y + box.h + 25, { align: 'center', color: t.text2, size: 11, weight: 600 });
		ctx.save();
		ctx.translate(box.x - 40, box.y + box.h / 2);
		ctx.rotate(-Math.PI / 2);
		label(ctx, t, yLabel, 0, 0, { align: 'center', color: t.text2, size: 11, weight: 600 });
		ctx.restore();

		ctx.save();
		ctx.beginPath();
		ctx.rect(box.x - 1, box.y - 6, box.w + 7, box.h + 7);
		ctx.clip();

		for (const r of rects) {
			const x0 = m.x(r.x0);
			const x1 = m.x(r.x1);
			const y0 = m.y(r.y0);
			const y1 = m.y(r.y1);
			ctx.fillStyle = alpha(ink(t, r.ink), r.a ?? 0.15);
			ctx.fillRect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0));
			ctx.strokeStyle = alpha(ink(t, r.ink), Math.min(1, (r.a ?? 0.15) * 2.5));
			ctx.lineWidth = 0.75;
			ctx.strokeRect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0));
		}

		if (diagonal) {
			ctx.strokeStyle = t.axis;
			ctx.setLineDash([4, 4]);
			ctx.beginPath();
			ctx.moveTo(m.x(Math.max(xDomain[0], yDomain[0])), m.y(Math.max(xDomain[0], yDomain[0])));
			ctx.lineTo(m.x(Math.min(xDomain[1], yDomain[1])), m.y(Math.min(xDomain[1], yDomain[1])));
			ctx.stroke();
			ctx.setLineDash([]);
		}

		const rule = (r: Rule, vertical: boolean) => {
			const c = ink(t, r.ink);
			ctx.strokeStyle = alpha(c, 0.8);
			ctx.lineWidth = 1.5;
			ctx.setLineDash(r.dash ?? [5, 4]);
			ctx.beginPath();
			if (vertical) {
				ctx.moveTo(m.x(r.at), box.y);
				ctx.lineTo(m.x(r.at), box.y + box.h);
			} else {
				ctx.moveTo(box.x, m.y(r.at));
				ctx.lineTo(box.x + box.w, m.y(r.at));
			}
			ctx.stroke();
			ctx.setLineDash([]);
			if (r.label) {
				if (vertical) label(ctx, t, r.label, m.x(r.at) + 4, box.y + 8, { color: c, size: 10, weight: 600 });
				else label(ctx, t, r.label, box.x + box.w - 4, m.y(r.at) - 8, { align: 'right', color: c, size: 10, weight: 600 });
			}
		};
		hlines.forEach((r) => rule(r, false));
		vlines.forEach((r) => rule(r, true));

		const path = (sr: Series) => {
			ctx.beginPath();
			sr.pts.forEach(([x, y], i) => {
				if (i === 0) return ctx.moveTo(cx(x), cy(y));
				if (sr.step) ctx.lineTo(cx(x), cy(sr.pts[i - 1][1]));
				ctx.lineTo(cx(x), cy(y));
			});
		};
		for (const sr of series) {
			if (sr.pts.length < 1) continue;
			const c = ink(t, sr.ink);
			if (sr.fill && sr.pts.length > 1) {
				path(sr);
				ctx.lineTo(cx(sr.pts[sr.pts.length - 1][0]), m.y(yDomain[0]));
				ctx.lineTo(cx(sr.pts[0][0]), m.y(yDomain[0]));
				ctx.closePath();
				ctx.fillStyle = alpha(c, sr.fill);
				ctx.fill();
			}
			if (sr.line !== false) {
				path(sr);
				ctx.strokeStyle = alpha(c, sr.opacity ?? 1);
				ctx.lineWidth = sr.width ?? 2;
				ctx.lineJoin = 'round';
				ctx.setLineDash(sr.dash ?? []);
				ctx.stroke();
				ctx.setLineDash([]);
			}
			if (sr.dots) sr.pts.forEach(([x, y]) => dot(ctx, cx(x), cy(y), sr.dotR ?? 2.6, alpha(c, sr.opacity ?? 1)));
		}
		ctx.restore();

		for (const sr of series) {
			if (!sr.label || !sr.pts.length) continue;
			const [x, y] = sr.pts[sr.pts.length - 1];
			label(ctx, t, sr.label, cx(x) - 4, cy(y) - 9, { align: 'right', color: ink(t, sr.ink), size: 10, weight: 700 });
		}

		for (const mk of markers) {
			if (!Number.isFinite(mk.x) || !Number.isFinite(mk.y)) continue;
			const c = ink(t, mk.ink);
			const x = cx(mk.x);
			const y = cy(mk.y);
			if (mk.ring) dot(ctx, x, y, (mk.r ?? 5) + 5, alpha(c, 0.18));
			dot(ctx, x, y, mk.r ?? 5, c, t.bg, 2);
			if (mk.label) {
				const right = mk.side ? mk.side === 'right' : x < box.x + box.w * 0.6;
				label(ctx, t, mk.label, x + (right ? 10 : -10), y + (y < box.y + 16 ? 10 : -10), {
					align: right ? 'left' : 'right',
					color: c,
					size: 11,
					weight: 700
				});
			}
		}

		if (note) label(ctx, t, note, box.x + box.w - 8, noteAt === 'top' ? box.y + 12 : box.y + box.h - 12, { align: 'right', color: t.text, size: 12, weight: 700 });
	}
</script>

<Canvas
	{draw}
	{aspect}
	{minHeight}
	{maxHeight}
	label={ariaLabel ?? L('chart')}
	cursor={onpick ? 'crosshair' : 'default'}
	onpointerdown={onpick
		? (p) => {
				pressed = true;
				pick(p);
			}
		: undefined}
	onpointermove={(p) => pressed && pick(p)}
	onpointerup={() => (pressed = false)}
/>
