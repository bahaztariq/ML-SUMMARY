<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import Canvas from '#lib/viz/Canvas.svelte';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import { alpha, clamp, dot, fmt, label, mapper, squareMapper, ticks, type VizTheme } from '#lib/viz/canvas.ts';
	import type { SceneProps } from '../types.ts';
	import * as gd from './gd.ts';
	import {
		LR_MAX,
		escaping,
		info,
		num,
		iterations,
		problem,
		reset,
		setLr,
		setStart,
		setView,
		stepOnce,
		stepsToMin,
		type BowlShape,
		type GDState,
		type View
	} from './state.ts';

	let { s = $bindable(), step }: SceneProps<GDState> = $props();

	/* ---- path animation: `shown` (fractional index) eases toward the last point ---- */
	let shown = $state(0);
	let lastS: GDState | null = null;
	let raf = 0;
	$effect(() => {
		const len = s.path.length;
		const fresh = s !== lastS;
		lastS = s;
		untrack(() => {
			if (fresh || shown > len - 1) shown = fresh && len > 1 ? 0 : Math.min(shown, len - 1);
		});
		cancelAnimationFrame(raf);
		const tick = () => {
			const target = s.path.length - 1;
			if (shown >= target) {
				shown = target;
				return;
			}
			shown = Math.min(target, shown + clamp((target - shown) / 28, 0.07, 1));
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
	});
	onDestroy(() => cancelAnimationFrame(raf));

	const settled = $derived(shown >= s.path.length - 1);
	/** Position of the ball, interpolated between two path points while animating. */
	function ballPos(): gd.Vec {
		const i = Math.floor(shown);
		const a = s.path[i] ?? s.path[0];
		const b = s.path[Math.min(i + 1, s.path.length - 1)];
		const f = shown - i;
		return a.map((v, k) => v + (b[k] - v) * f);
	}

	/* ---- autoplay ---- */
	let playing = $state(false);
	let timer: ReturnType<typeof setInterval> | undefined;
	function play() {
		if (playing) return stop();
		if (s.converged || s.diverged) reset(s);
		playing = true;
		timer = setInterval(() => {
			if (!stepOnce(s)) stop();
		}, 320);
	}
	function stop() {
		playing = false;
		clearInterval(timer);
	}
	$effect(() => {
		step;
		return stop; // stop when the lesson step changes
	});
	onDestroy(stop);

	/* ---- dragging the start ---- */
	let dragging = $state(false);
	let map: ReturnType<typeof mapper> | null = null;

	function placeAt(p: { x: number; y: number }) {
		if (!map) return;
		const pr = problem(s);
		const [lo, hi] = pr.domain;
		const w = pr.dim === 1 ? [clamp(map.invX(p.x), lo, hi)] : [clamp(map.invX(p.x), lo, hi), clamp(map.invY(p.y), lo, hi)];
		setStart(s, w.map((v) => Math.round(v * 100) / 100));
		shown = 0;
		s.did.drag = true;
	}
	function down(p: { x: number; y: number }) {
		if (!s.ui.drag) return;
		stop();
		dragging = true;
		placeAt(p);
	}
	function move(p: { x: number; y: number }) {
		if (dragging) placeAt(p);
	}
	function up() {
		dragging = false;
	}

	/* ---- drawing helpers ---- */
	function arrow(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string) {
		const len = Math.hypot(x1 - x0, y1 - y0);
		if (len < 3) return;
		const ux = (x1 - x0) / len;
		const uy = (y1 - y0) / len;
		const head = Math.min(9, len * 0.5);
		ctx.strokeStyle = color;
		ctx.fillStyle = color;
		ctx.lineWidth = 2.5;
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

	function clipTo(ctx: CanvasRenderingContext2D, box: { x: number; y: number; w: number; h: number }) {
		ctx.save();
		ctx.beginPath();
		ctx.rect(box.x, box.y, box.w, box.h);
		ctx.clip();
	}

	function drawStatus(ctx: CanvasRenderingContext2D, t: VizTheme, x: number, y: number) {
		if (escaping(s) && settled) label(ctx, t, 'diverging: loss is growing', x, y, { align: 'right', color: t.series[3], size: 12, weight: 600 });
		else if (s.converged && settled) label(ctx, t, 'converged: gradient ≈ 0', x, y, { align: 'right', color: t.series[1], size: 12, weight: 600 });
	}

	/* ---- 1-D: loss curve ---- */
	function draw1d(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const pr = problem(s);
		const box = { x: 44, y: 14, w: w - 58, h: h - 44 };
		const m = mapper(box, pr.domain, pr.range);
		map = m;
		const L = (x: number) => pr.loss([x]);

		// grid + axes labels
		ctx.lineWidth = 1;
		for (const v of ticks(Math.max(pr.range[0], pr.id === 'fit' ? 0 : -Infinity), pr.range[1], 5)) {
			ctx.strokeStyle = t.grid;
			ctx.beginPath();
			ctx.moveTo(box.x, m.y(v));
			ctx.lineTo(box.x + box.w, m.y(v));
			ctx.stroke();
			label(ctx, t, fmt(v, Number.isInteger(v) ? 0 : 1), box.x - 8, m.y(v), { align: 'right', color: t.text3, size: 10 });
		}
		for (const v of ticks(pr.domain[0], pr.domain[1], 8)) {
			ctx.strokeStyle = t.grid;
			ctx.beginPath();
			ctx.moveTo(m.x(v), box.y);
			ctx.lineTo(m.x(v), box.y + box.h);
			ctx.stroke();
			label(ctx, t, fmt(v, Number.isInteger(v) ? 0 : 1), m.x(v), box.y + box.h + 12, { align: 'center', color: t.text3, size: 10 });
		}
		label(ctx, t, 'w →', box.x + box.w, box.y + box.h + 26, { align: 'right', color: t.text2, size: 11, weight: 600 });
		label(ctx, t, 'loss', 6, box.y - 2, { color: t.text2, size: 11, weight: 600, base: 'top' });

		clipTo(ctx, box);

		// the landscape
		ctx.beginPath();
		const N = 320;
		for (let i = 0; i <= N; i++) {
			const x = pr.domain[0] + ((pr.domain[1] - pr.domain[0]) * i) / N;
			const px = m.x(x);
			const py = m.y(L(x));
			if (i) ctx.lineTo(px, py);
			else ctx.moveTo(px, py);
		}
		ctx.lineTo(box.x + box.w, box.y + box.h);
		ctx.lineTo(box.x, box.y + box.h);
		ctx.closePath();
		ctx.fillStyle = alpha(t.text3, 0.07);
		ctx.fill();
		ctx.beginPath();
		for (let i = 0; i <= N; i++) {
			const x = pr.domain[0] + ((pr.domain[1] - pr.domain[0]) * i) / N;
			if (i) ctx.lineTo(m.x(x), m.y(L(x)));
			else ctx.moveTo(m.x(x), m.y(L(x)));
		}
		ctx.strokeStyle = t.text2;
		ctx.lineWidth = 2;
		ctx.stroke();

		// minima
		if (s.show.minima) {
			for (const mn of pr.minima) {
				const x = m.x(mn.w[0]);
				const y = m.y(L(mn.w[0]));
				const col = mn.global ? t.series[1] : t.series[2];
				dot(ctx, x, y, 4, col);
				const text = pr.minima.length > 1 ? (mn.global ? 'global minimum' : 'local minimum') : 'minimum';
				label(ctx, t, text, x, y + 16, { align: 'center', color: col, size: 11, weight: 600 });
			}
		}

		if (s.show.fit && s.view === 'fit') drawFitInset(ctx, t, box);

		// path so far
		const upto = Math.floor(shown);
		const pts = s.path.slice(0, upto + 1).map(([x]) => [m.x(x), m.y(L(x))]);
		const ball = ballPos();
		const bx = m.x(ball[0]);
		const by =
			upto < s.path.length - 1
				? m.y(L(s.path[upto][0]) + (L(s.path[upto + 1][0]) - L(s.path[upto][0])) * (shown - upto))
				: m.y(L(ball[0]));
		if (pts.length > 0) {
			ctx.strokeStyle = alpha(t.series[0], 0.55);
			ctx.lineWidth = 1.5;
			ctx.setLineDash([4, 3]);
			ctx.beginPath();
			pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
			ctx.lineTo(bx, by);
			ctx.stroke();
			ctx.setLineDash([]);
			pts.forEach(([x, y], i) => dot(ctx, x, y, i === 0 ? 4 : 3, alpha(t.series[0], i === 0 ? 0.9 : 0.45), i === 0 ? t.bg : undefined));
		}

		const here = info(s, ball);
		// tangent: the local slope
		if (s.show.tangent && settled && !s.diverged) {
			const sx = box.w / (pr.domain[1] - pr.domain[0]);
			const sy = box.h / (pr.range[1] - pr.range[0]);
			const dx = 1;
			const dy = -here.grad[0] * (sy / sx);
			const n = Math.hypot(dx, dy);
			const r = 70;
			ctx.strokeStyle = t.series[2];
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(bx - (dx / n) * r, by - (dy / n) * r);
			ctx.lineTo(bx + (dx / n) * r, by + (dy / n) * r);
			ctx.stroke();
			const tx = bx + (dx / n) * r;
			const ty = by + (dy / n) * r;
			label(ctx, t, `slope ${num(here.grad[0])}`, tx + 6, ty, { color: t.series[2], size: 11, weight: 600 });
		}

		// next move −η·∇L
		if (s.show.arrow && settled && !s.diverged && !s.converged) {
			const nx = ball[0] + here.move[0];
			const x1 = clamp(m.x(nx), box.x, box.x + box.w);
			arrow(ctx, bx, by, x1, by, t.series[1]);
			if (Math.abs(x1 - bx) > 3) {
				const long = Math.abs(x1 - bx) > 34;
				ctx.setLineDash([2, 3]);
				ctx.strokeStyle = alpha(t.series[1], 0.7);
				ctx.lineWidth = 1.2;
				ctx.beginPath();
				ctx.moveTo(x1, by);
				ctx.lineTo(x1, m.y(L(nx)));
				ctx.stroke();
				ctx.setLineDash([]);
				dot(ctx, x1, m.y(L(nx)), 5, alpha(t.series[1], 0.25), t.series[1], 1.5);
				if (long) label(ctx, t, '−η·∇L', (bx + x1) / 2, by - 12, { align: 'center', color: t.series[1], size: 11, weight: 600 });
			}
		}

		// the ball
		dot(ctx, bx, by, 11, alpha(t.series[0], 0.18));
		dot(ctx, bx, by, 7, t.series[0], t.bg, 2.5);
		ctx.restore();

		// ball flew off the chart: pin a marker to the edge
		const ex = clamp(bx, box.x + 8, box.x + box.w - 8);
		const ey = clamp(by, box.y + 8, box.y + box.h - 8);
		if (ex !== bx || ey !== by) {
			dot(ctx, ex, ey, 6, t.bg, t.series[3], 2);
			label(ctx, t, `w = ${fmt(ball[0], 1)} is off the chart`, ex + (ex > box.x + box.w / 2 ? -12 : 12), ey + 16, {
				align: ex > box.x + box.w / 2 ? 'right' : 'left',
				color: t.series[3],
				size: 11,
				weight: 600
			});
		}

		drawStatus(ctx, t, box.x + box.w - 6, box.y + 12);
		if (s.ui.drag && !s.did.drag && !dragging) {
			label(ctx, t, 'drag along the curve to move w ↔', box.x + box.w - 6, box.y + box.h - 12, { align: 'right', color: t.text3, size: 11 });
		}
	}

	/** Inset: the data and the line y = w·x for the ball's current w. */
	function drawFitInset(ctx: CanvasRenderingContext2D, t: VizTheme, outer: { x: number; y: number; w: number; h: number }) {
		const iw = Math.min(230, outer.w * 0.36);
		const ih = Math.min(150, outer.h * 0.36);
		const box = { x: outer.x + outer.w / 2 - iw / 2, y: outer.y + 6, w: iw, h: ih };
		ctx.fillStyle = t.bg;
		ctx.strokeStyle = t.axis;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.roundRect(box.x, box.y, box.w, box.h, 8);
		ctx.fill();
		ctx.stroke();
		const { xs, ys } = gd.FIT_DATA;
		const inner = { x: box.x + 10, y: box.y + 22, w: box.w - 20, h: box.h - 30 };
		const xmax = Math.max(...xs) * 1.08;
		const ymax = Math.max(...ys) * 1.15;
		const m = mapper(inner, [0, xmax], [-0.4, ymax]);
		const w = ballPos()[0];
		ctx.save();
		ctx.beginPath();
		ctx.rect(box.x + 1, box.y + 1, box.w - 2, box.h - 2);
		ctx.clip();
		// residuals
		ctx.strokeStyle = alpha(t.series[3], 0.55);
		ctx.lineWidth = 1;
		xs.forEach((x, i) => {
			ctx.beginPath();
			ctx.moveTo(m.x(x), m.y(ys[i]));
			ctx.lineTo(m.x(x), m.y(w * x));
			ctx.stroke();
		});
		ctx.strokeStyle = t.series[0];
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(m.x(0), m.y(0));
		ctx.lineTo(m.x(xmax), m.y(w * xmax));
		ctx.stroke();
		xs.forEach((x, i) => dot(ctx, m.x(x), m.y(ys[i]), 2.8, t.text2));
		ctx.restore();
		label(ctx, t, `y = ${fmt(w)}·x`, box.x + 10, box.y + 12, { color: t.series[0], size: 11, weight: 600 });
		if (iw > 190) label(ctx, t, 'data', box.x + box.w - 10, box.y + 12, { align: 'right', color: t.text3, size: 10 });
	}

	/* ---- 2-D: contour map ---- */
	const LEVELS = [0.03, 0.15, 0.5, 1.2, 2.5, 5, 9, 15, 24, 36, 52, 72];

	function draw2d(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const pr = problem(s);
		const box = { x: 10, y: 10, w: w - 20, h: h - 20 };
		const m = squareMapper(box, pr.domain);
		map = m;
		const bowl = s.bowl === 'round' ? gd.ROUND : gd.STRETCHED;
		const px = m.x(1) - m.x(0);
		const cx = m.x(bowl.center[0]);
		const cy = m.y(bowl.center[1]);

		// grid
		ctx.strokeStyle = t.grid;
		ctx.lineWidth = 1;
		for (const v of ticks(-4, 4, 8)) {
			ctx.beginPath();
			ctx.moveTo(m.x(v), 0);
			ctx.lineTo(m.x(v), h);
			ctx.moveTo(0, m.y(v));
			ctx.lineTo(w, m.y(v));
			ctx.stroke();
		}

		// contours (level sets of ½·eᵀHe are ellipses along the eigenvectors)
		for (let i = LEVELS.length - 1; i >= 0; i--) {
			const c = LEVELS[i];
			const r1 = Math.sqrt((2 * c) / bowl.lambda[0]) * px;
			const r2 = Math.sqrt((2 * c) / bowl.lambda[1]) * px;
			ctx.beginPath();
			ctx.ellipse(cx, cy, r1, r2, -bowl.angle, 0, Math.PI * 2);
			ctx.fillStyle = alpha(t.series[0], 0.035);
			ctx.fill();
			ctx.strokeStyle = alpha(t.series[0], 0.32);
			ctx.lineWidth = 1;
			ctx.stroke();
		}

		// minimum
		ctx.strokeStyle = t.series[1];
		ctx.lineWidth = 2.5;
		ctx.beginPath();
		ctx.moveTo(cx - 6, cy - 6);
		ctx.lineTo(cx + 6, cy + 6);
		ctx.moveTo(cx + 6, cy - 6);
		ctx.lineTo(cx - 6, cy + 6);
		ctx.stroke();
		if (s.show.minima) label(ctx, t, 'minimum', cx + 10, cy + 14, { color: t.series[1], size: 11, weight: 600 });

		// path
		const upto = Math.floor(shown);
		const ball = ballPos();
		const bx = m.x(ball[0]);
		const by = m.y(ball[1]);
		const pts = s.path.slice(0, upto + 1).map(([x, y]) => [m.x(x), m.y(y)]);
		ctx.strokeStyle = t.series[0];
		ctx.lineWidth = 1.8;
		ctx.beginPath();
		pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
		ctx.lineTo(bx, by);
		ctx.stroke();
		pts.forEach(([x, y], i) => dot(ctx, x, y, i === 0 ? 4 : 2.6, i === 0 ? t.bg : t.series[0], i === 0 ? t.series[0] : undefined, 2));

		// next move −η·∇L
		if (s.show.arrow && settled && !s.diverged && !s.converged) {
			const mv = info(s, ball).move;
			arrow(ctx, bx, by, m.x(ball[0] + mv[0]), m.y(ball[1] + mv[1]), t.series[1]);
		}

		dot(ctx, bx, by, 11, alpha(t.series[0], 0.18));
		dot(ctx, bx, by, 7, t.series[0], t.bg, 2.5);

		label(ctx, t, 'w₁ →', box.x + box.w - 4, box.y + box.h - 8, { align: 'right', color: t.text2, size: 11, weight: 600 });
		label(ctx, t, '↑ w₂', box.x + 4, box.y + 10, { color: t.text2, size: 11, weight: 600 });
		drawStatus(ctx, t, box.x + box.w - 6, box.y + 12);
		if (s.ui.drag && !s.did.drag && !dragging) {
			label(ctx, t, 'click or drag to choose a start', box.x + box.w - 6, box.y + box.h - 26, { align: 'right', color: t.text3, size: 11 });
		}
	}

	function draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		if (problem(s).dim === 1) draw1d(ctx, w, h, t);
		else draw2d(ctx, w, h, t);
	}

	/* ---- readouts ---- */
	const readouts = $derived.by(() => {
		const i = Math.round(shown);
		const here = info(s, s.path[Math.min(i, s.path.length - 1)]);
		const k = stepsToMin(s);
		const status = escaping(s)
			? 'diverging'
			: s.converged
				? 'converged ✓'
				: k >= 0 && k <= i
					? `at min (step ${k})`
					: i === 0
						? 'at start'
						: 'descending';
		const items =
			problem(s).dim === 1
				? [
						{ label: 'w', value: fmt(here.w[0]) },
						{ label: 'loss', value: fmt(here.loss, 3), highlight: true },
						{ label: '∇L', value: num(here.grad[0]) },
						{ label: '−η·∇L', value: num(here.move[0], 3) }
					]
				: [
						{ label: 'w', value: `(${fmt(here.w[0])}, ${fmt(here.w[1])})` },
						{ label: 'loss', value: fmt(here.loss, 3), highlight: true },
						{ label: '|∇L|', value: num(here.gradNorm) }
					];
		return [...items, { label: 'step', value: String(Math.min(i, iterations(s))) }, { label: 'status', value: status }];
	});

	const lrMax = $derived(LR_MAX[s.view]);
</script>

<div class="scene">
	<Canvas
		{draw}
		aspect={0.62}
		minHeight={280}
		maxHeight={460}
		label={s.view === 'bowl'
			? 'Contour map of a two-weight loss with the gradient descent path'
			: 'Loss curve with a ball showing the current weight and its gradient descent path'}
		cursor={s.ui.drag ? (s.view === 'bowl' ? 'crosshair' : 'ew-resize') : 'default'}
		onpointerdown={down}
		onpointermove={move}
		onpointerup={up}
	/>

	<Readouts items={readouts} />

	{#if Object.values(s.ui).some(Boolean)}
		<div class="controls">
			{#if s.ui.step || s.ui.run || s.ui.reset}
				<div class="buttons">
					{#if s.ui.step}
						<button class="btn btn-sm" onclick={() => (stop(), stepOnce(s))} disabled={s.converged || s.diverged}>Step</button>
					{/if}
					{#if s.ui.run}
						<button class="btn btn-sm btn-primary" onclick={play}>{playing ? '❚❚ Pause' : '▶ Run'}</button>
					{/if}
					{#if s.ui.reset}
						<button class="btn btn-sm" onclick={() => (stop(), reset(s))}>↺ Reset</button>
					{/if}
				</div>
			{/if}
			{#if s.ui.lr}
				<Slider
					label="Learning rate η"
					bind:value={s.lr}
					min={0.01}
					max={lrMax}
					step={0.01}
					format={(v) => v.toFixed(2)}
					oninput={(v) => (stop(), setLr(s, v))}
				/>
			{/if}
			{#if s.ui.view}
				<Segmented
					label="Loss"
					bind:value={s.view}
					options={[
						{ value: 'fit', label: 'Line fit' },
						{ value: 'bumpy', label: 'Two valleys' },
						{ value: 'bowl', label: '2-D bowl' }
					] as { value: View; label: string }[]}
					onchange={(v) => (stop(), setView(s, v))}
				/>
			{/if}
			{#if s.ui.bowl && s.view === 'bowl'}
				<Segmented
					label="Bowl shape"
					bind:value={s.bowl}
					options={[
						{ value: 'stretched', label: 'Stretched' },
						{ value: 'round', label: 'Round (scaled)' }
					] as { value: BowlShape; label: string }[]}
					onchange={() => (stop(), reset(s))}
				/>
			{/if}
		</div>
	{/if}
</div>

<style>
	.scene {
		display: grid;
		gap: 12px;
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 14px 20px;
		padding-top: 12px;
		border-top: 1px solid var(--border);
	}
	.buttons {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}
</style>
