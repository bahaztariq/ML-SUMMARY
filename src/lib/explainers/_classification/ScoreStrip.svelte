<!--
  The shared "scores + threshold" picture: every sample is a dot placed at its score, in the
  lane of its true class, over a soft density curve. A draggable threshold splits the strip
  into predicted negative (left) and predicted positive (right).
-->
<script lang="ts">
	import Canvas from '#lib/viz/Canvas.svelte';
	import { local } from '#lib/i18n/index.svelte.ts';
	import { alpha, clamp, dot, label, mapper, ticks, type VizTheme } from '#lib/viz/canvas.ts';
	import { ink } from './ink.ts';
	import { outcome, type Outcome, type Sample } from './metrics.ts';

	interface Props {
		samples: Sample[];
		/** Decision threshold, or null to hide it. */
		thr: number | null;
		/** Color dots by true class, or by outcome (TP/FP/FN/TN) at the threshold. */
		colorBy?: 'class' | 'outcome';
		/** Outcomes to keep bright; the rest are dimmed. */
		focus?: Outcome[] | null;
		draggable?: boolean;
		onthr?: (v: number) => void;
		/** Indices of a (positive, negative) pair to highlight. */
		pair?: [number, number] | null;
		/** Per-sample dot size override (e.g. log-loss penalty). */
		radius?: ((s: Sample, i: number) => number) | null;
		/** Per-sample color override. */
		color?: ((s: Sample, i: number, t: VizTheme) => string) | null;
		posLabel?: string;
		negLabel?: string;
		xLabel?: string;
		hint?: string;
		/** Text on the threshold handle (followed by its value) and on each side of it. */
		thrLabel?: string;
		sideLabels?: [string, string];
		density?: boolean;
		aspect?: number;
		minHeight?: number;
		maxHeight?: number;
	}

	let {
		samples,
		thr,
		colorBy = 'class',
		focus = null,
		draggable = false,
		onthr,
		pair = null,
		radius = null,
		color = null,
		posLabel,
		negLabel,
		xLabel,
		hint = '',
		thrLabel,
		sideLabels,
		density = true,
		aspect = 0.4,
		minHeight = 200,
		maxHeight = 270
	}: Props = $props();

	/** English source strings (typed as plain strings so fr/ar can differ). */
	const EN = {
		pos: 'actually positive',
		neg: 'actually negative',
		x: 'model score',
		thr: 'threshold',
		sideNeg: '← predicted negative',
		sidePos: 'predicted positive →',
		aria: 'Strip plot of model scores for positive and negative examples with a decision threshold'
	};
	const L = local({
		en: EN,
		fr: {
			pos: 'réellement positif',
			neg: 'réellement négatif',
			x: 'score du modèle',
			thr: 'seuil',
			sideNeg: '← prédit négatif',
			sidePos: 'prédit positif →',
			aria: 'Bande des scores du modèle pour les exemples positifs et négatifs, avec un seuil de décision'
		},
		ar: {
			pos: 'إيجابي فعلياً',
			neg: 'سلبي فعلياً',
			x: 'درجة النموذج',
			thr: 'العتبة',
			sideNeg: '← التنبؤ: سلبي',
			sidePos: 'التنبؤ: إيجابي →',
			aria: 'مخطط شريطي لدرجات النموذج للأمثلة الإيجابية والسلبية مع عتبة القرار'
		}
	});

	let map: ReturnType<typeof mapper> | null = null;
	let dragging = $state(false);

	function setFrom(x: number) {
		if (!map || !draggable || !onthr) return;
		onthr(Math.round(clamp(map.invX(x), 0, 1) * 100) / 100);
	}

	/** Gaussian KDE evaluated on a grid; returns densities normalised to max 1. */
	function kde(xs: number[], grid: number[]) {
		const bw = 0.045;
		const out = grid.map((g) => {
			let d = 0;
			for (const x of xs) d += Math.exp(-0.5 * ((g - x) / bw) ** 2);
			return d;
		});
		const mx = Math.max(...out, 1e-9);
		return out.map((d) => d / mx);
	}

	function draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const posText = posLabel ?? L('pos');
		const negText = negLabel ?? L('neg');
		const xText = xLabel ?? L('x');
		const thrText = thrLabel ?? L('thr');
		const sides = sideLabels ?? [L('sideNeg'), L('sidePos')];
		const box = { x: 14, y: 26, w: w - 28, h: h - 52 };
		const m = mapper(box, [0, 1], [0, 1]);
		map = m;
		const laneH = box.h / 2;
		const lanes = { 1: box.y, 0: box.y + laneH } as const;
		// dot size by how crowded each lane is
		const size = (n: number) => (n <= 90 ? 3.6 : n <= 220 ? 2.8 : n <= 800 ? 2 : 1.4);
		let nPos = 0;
		for (const s of samples) nPos += s.y;
		const r0 = { 1: size(nPos), 0: size(samples.length - nPos) } as const;

		// threshold shading
		if (thr !== null) {
			const tx = m.x(thr);
			ctx.fillStyle = alpha(t.accent, 0.06);
			ctx.fillRect(tx, box.y, box.x + box.w - tx, box.h);
		}

		// lane divider + x grid
		ctx.lineWidth = 1;
		for (const v of ticks(0, 1, 10)) {
			ctx.strokeStyle = t.grid;
			ctx.beginPath();
			ctx.moveTo(m.x(v), box.y);
			ctx.lineTo(m.x(v), box.y + box.h);
			ctx.stroke();
			label(ctx, t, v.toFixed(1), m.x(v), box.y + box.h + 11, { align: 'center', color: t.text3, size: 10 });
		}
		ctx.strokeStyle = t.axis;
		ctx.setLineDash([3, 4]);
		ctx.beginPath();
		ctx.moveTo(box.x, box.y + laneH);
		ctx.lineTo(box.x + box.w, box.y + laneH);
		ctx.stroke();
		ctx.setLineDash([]);
		label(ctx, t, xText + ' →', box.x + box.w, box.y + box.h + 24, { align: 'right', color: t.text2, size: 11, weight: 600 });

		// density curves
		if (density) {
			const grid = Array.from({ length: 101 }, (_, i) => i / 100);
			for (const y of [1, 0] as const) {
				const d = kde(
					samples.filter((s) => s.y === y).map((s) => s.score),
					grid
				);
				const base = lanes[y] + laneH;
				const c = ink(t, y ? 'pos' : 'neg');
				ctx.beginPath();
				ctx.moveTo(m.x(0), base);
				grid.forEach((g, i) => ctx.lineTo(m.x(g), base - d[i] * laneH * 0.82));
				ctx.lineTo(m.x(1), base);
				ctx.closePath();
				ctx.fillStyle = alpha(c, 0.08);
				ctx.fill();
				ctx.beginPath();
				grid.forEach((g, i) => (i ? ctx.lineTo(m.x(g), base - d[i] * laneH * 0.82) : ctx.moveTo(m.x(g), base - d[i] * laneH * 0.82)));
				ctx.strokeStyle = alpha(c, 0.35);
				ctx.lineWidth = 1.2;
				ctx.stroke();
			}
		}

		// dots
		const pos = (s: Sample) => [m.x(s.score), lanes[s.y] + 7 + s.jit * (laneH - 14)] as const;
		samples.forEach((s, i) => {
			const [x, y] = pos(s);
			const o = thr === null ? null : outcome(s, thr);
			let c: string;
			if (color) c = color(s, i, t);
			else if (colorBy === 'outcome' && o) c = ink(t, o);
			else c = ink(t, s.y ? 'pos' : 'neg');
			const dim = focus && o && !focus.includes(o);
			dot(ctx, x, y, radius ? radius(s, i) : r0[s.y], alpha(c, dim ? 0.13 : r0[s.y] < 2 ? 0.6 : 0.85));
		});

		// highlighted pair
		if (pair) {
			const a = samples[pair[0]];
			const b = samples[pair[1]];
			if (a && b) {
				const [ax, ay] = pos(a);
				const [bx, by] = pos(b);
				const win = a.score > b.score;
				const c = win ? t.series[1] : t.series[3];
				ctx.strokeStyle = c;
				ctx.lineWidth = 2;
				ctx.setLineDash([4, 3]);
				ctx.beginPath();
				ctx.moveTo(ax, ay);
				ctx.lineTo(bx, by);
				ctx.stroke();
				ctx.setLineDash([]);
				dot(ctx, ax, ay, 7, alpha(ink(t, 'pos'), 0.9), t.bg, 2.5);
				dot(ctx, bx, by, 7, alpha(ink(t, 'neg'), 0.9), t.bg, 2.5);
			}
		}

		// lane labels
		const lab = (txt: string, y: number, c: string) => {
			ctx.font = `600 11px ${t.sans}`;
			const tw = ctx.measureText(txt).width;
			ctx.fillStyle = alpha(t.bg, 0.85);
			ctx.fillRect(box.x + 2, y + 3, tw + 10, 17);
			label(ctx, t, txt, box.x + 7, y + 12, { color: c, size: 11, weight: 600 });
		};
		lab(posText, lanes[1], ink(t, 'pos'));
		lab(negText, lanes[0], t.text2);

		// threshold line + handle
		if (thr !== null) {
			const tx = m.x(thr);
			ctx.strokeStyle = t.accent;
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(tx, box.y - 4);
			ctx.lineTo(tx, box.y + box.h);
			ctx.stroke();
			const txt = `${thrText} ${thr.toFixed(2)}`;
			ctx.font = `600 11px ${t.sans}`;
			const tw = ctx.measureText(txt).width + 14;
			const lx = clamp(tx - tw / 2, 2, w - tw - 2);
			ctx.fillStyle = t.accent;
			ctx.beginPath();
			ctx.roundRect(lx, 3, tw, 19, 9);
			ctx.fill();
			label(ctx, t, txt, lx + tw / 2, 13, { align: 'center', color: t.bg, size: 11, weight: 600 });
			const side = (txt2: string, x: number, align: CanvasTextAlign) => {
				ctx.font = `600 10px ${t.sans}`;
				const sw = ctx.measureText(txt2).width + 8;
				ctx.fillStyle = alpha(t.bg, 0.85);
				ctx.fillRect(align === 'right' ? x - sw + 4 : x - 4, box.y + box.h - 17, sw, 15);
				label(ctx, t, txt2, x, box.y + box.h - 9, { align, color: t.accent, size: 10, weight: 600 });
			};
			if (tx - box.x > 110) side(sides[0], tx - 6, 'right');
			if (box.x + box.w - tx > 110) side(sides[1], tx + 6, 'left');
			if (hint && draggable && !dragging && w >= 480) {
				const right = thr < 0.6;
				label(ctx, t, hint, right ? w - 6 : 6, 13, { align: right ? 'right' : 'left', color: t.text3, size: 11 });
			}
		}
	}
</script>

<Canvas
	{draw}
	{aspect}
	{minHeight}
	{maxHeight}
	label={L('aria')}
	cursor={draggable ? (dragging ? 'grabbing' : 'ew-resize') : 'default'}
	onpointerdown={draggable
		? (p) => {
				dragging = true;
				setFrom(p.x);
			}
		: undefined}
	onpointermove={(p) => dragging && setFrom(p.x)}
	onpointerup={() => (dragging = false)}
/>
