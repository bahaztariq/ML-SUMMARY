<script lang="ts">
	import Canvas from '#lib/viz/Canvas.svelte';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import { alpha, clamp, dot, label, mapper, squareMapper, ticks, type VizTheme } from '#lib/viz/canvas.ts';
	import type { SceneProps } from '../types';
	import TreeDiagram from './TreeDiagram.svelte';
	import * as dt from './tree';
	import {
		UNLIMITED,
		accuracies,
		canGrow,
		depthCurve,
		depthLabel,
		featName,
		grow,
		manualScore,
		pct,
		resample,
		rootBest,
		rootCurve,
		rootGini,
		rule,
		setDepth,
		shownTree,
		test,
		train,
		type TreeState
	} from './state';

	let { s = $bindable(), step }: SceneProps<TreeState> = $props();

	const DOMAIN: [number, number] = [-1.05, 1.05];
	const PAD = 10;
	const BIG: dt.Rect = { x0: -20, x1: 20, y0: -20, y1: 20 };

	const tree = $derived(shownTree(s));
	const regionMap = $derived(dt.regions(tree, BIG));
	let hover = $state(-1);
	$effect(() => {
		step;
		hover = -1;
	});

	/* ---- dragging the split line ---- */
	let dragging = $state(false);
	let map: ReturnType<typeof squareMapper> | null = null;
	const canDrag = $derived(s.ui.drag && s.mode === 'manual');

	function setThr(p: { x: number; y: number }) {
		if (!map) return;
		const v = s.split.f === 0 ? map.invX(p.x) : map.invY(p.y);
		s.split.thr = Math.round(clamp(v, -1, 1) * 100) / 100;
		s.did.drag = true;
	}
	function down(p: { x: number; y: number }) {
		if (!canDrag) return;
		dragging = true;
		setThr(p);
	}
	function move(p: { x: number; y: number }) {
		if (dragging) return setThr(p);
		if (!map || s.mode !== 'tree' || !s.show.regions) return;
		const leaf = dt.leafOf(tree, [map.invX(p.x), map.invY(p.y)]);
		hover = leaf.id;
	}
	function up() {
		dragging = false;
	}

	/* ---- drawing ---- */
	const classColor = (t: VizTheme, c: number) => (c ? t.series[2] : t.series[0]);
	const purity = (k: dt.Counts) => {
		const n = k[0] + k[1];
		return n ? (Math.max(k[0], k[1]) / n - 0.5) * 2 : 0;
	};

	function marker(ctx: CanvasRenderingContext2D, x: number, y: number, c: number, r: number, fill: string, stroke?: string) {
		if (c === 0) return dot(ctx, x, y, r, fill, stroke, 1.6);
		const a = r * 0.9;
		ctx.fillStyle = fill;
		ctx.fillRect(x - a, y - a, 2 * a, 2 * a);
		if (stroke) {
			ctx.strokeStyle = stroke;
			ctx.lineWidth = 1.6;
			ctx.strokeRect(x - a, y - a, 2 * a, 2 * a);
		}
	}

	const pillW = (ctx: CanvasRenderingContext2D, t: VizTheme, text: string) => {
		ctx.font = `600 11px ${t.sans}`;
		return ctx.measureText(text).width + 12;
	};

	/** Text in a rounded box whose left edge is at x0. */
	function pill(ctx: CanvasRenderingContext2D, t: VizTheme, text: string, x0: number, y: number) {
		const w = pillW(ctx, t, text);
		ctx.fillStyle = alpha(t.bg, 0.9);
		ctx.strokeStyle = t.axis;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.roundRect(x0, y - 10, w, 20, 6);
		ctx.fill();
		ctx.stroke();
		label(ctx, t, text, x0 + 6, y, { color: t.text, size: 11, weight: 600 });
	}

	/** Round drag handle with two arrows pointing along the direction the line moves. */
	function handle(ctx: CanvasRenderingContext2D, t: VizTheme, x: number, y: number, vertical: boolean) {
		dot(ctx, x, y, dragging ? 10 : 9, t.bg, t.text, 2);
		ctx.fillStyle = t.text;
		for (const sgn of [-1, 1]) {
			ctx.beginPath();
			if (vertical) {
				ctx.moveTo(x + sgn * 6, y);
				ctx.lineTo(x + sgn * 2, y - 3.5);
				ctx.lineTo(x + sgn * 2, y + 3.5);
			} else {
				ctx.moveTo(x, y + sgn * 6);
				ctx.lineTo(x - 3.5, y + sgn * 2);
				ctx.lineTo(x + 3.5, y + sgn * 2);
			}
			ctx.fill();
		}
	}

	function sideText(k: dt.Counts, g: number, yes: boolean) {
		return `${yes ? 'yes' : 'no'}: ${k[0]} A · ${k[1]} B${s.show.gini ? ` · G ${g.toFixed(2)}` : ''}`;
	}

	function draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const box = { x: PAD, y: PAD, w: w - PAD * 2, h: h - PAD * 2 };
		const m = squareMapper(box, DOMAIN);
		map = m;
		const rx = (r: dt.Rect) => {
			const x0 = clamp(m.x(r.x0), -2, w + 2);
			const x1 = clamp(m.x(r.x1), -2, w + 2);
			const y0 = clamp(m.y(r.y1), -2, h + 2);
			const y1 = clamp(m.y(r.y0), -2, h + 2);
			return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
		};

		// grid
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

		const showRegions = (s.mode === 'tree' && s.show.regions) || (s.mode === 'manual' && s.show.counts);
		if (showRegions) {
			// leaf boxes, tinted by predicted class (stronger = purer)
			for (const { node, rect } of regionMap.values()) {
				if (!dt.isLeaf(node)) continue;
				const r = rx(rect);
				ctx.fillStyle = alpha(classColor(t, node.pred), 0.05 + 0.17 * purity(node.counts));
				ctx.fillRect(r.x, r.y, r.w, r.h);
			}
			// split lines, each drawn only inside its node's box
			for (const { node, rect } of regionMap.values()) {
				if (!node.split) continue;
				const r = rx(rect);
				const isManual = s.mode === 'manual';
				ctx.strokeStyle = isManual ? t.text : alpha(t.text, 0.55 - Math.min(0.3, node.depth * 0.06));
				ctx.lineWidth = isManual ? 2 : node.depth === 0 ? 2 : 1.25;
				ctx.beginPath();
				if (node.split.f === 0) {
					const x = m.x(node.split.thr);
					ctx.moveTo(x, r.y);
					ctx.lineTo(x, r.y + r.h);
				} else {
					const y = m.y(node.split.thr);
					ctx.moveTo(r.x, y);
					ctx.lineTo(r.x + r.w, y);
				}
				ctx.stroke();
			}
			// hovered node's box
			const hot = regionMap.get(hover);
			if (hot && s.mode === 'tree') {
				const r = rx(hot.rect);
				ctx.strokeStyle = t.text;
				ctx.lineWidth = 2;
				ctx.setLineDash([5, 3]);
				ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
				ctx.setLineDash([]);
			}
		}

		// points
		const isTest = s.view === 'test';
		const data = isTest ? test(s) : train(s);
		const fittedTree = s.mode === 'tree' && s.show.regions ? tree : null;
		data.X.forEach((p, i) => {
			const c = data.y[i];
			const wrong = fittedTree ? dt.predict(fittedTree, p) !== c : false;
			const x = m.x(p[0]);
			const y = m.y(p[1]);
			if (isTest) marker(ctx, x, y, c, wrong ? 3.2 : 2.6, alpha(classColor(t, c), wrong ? 0.95 : 0.5), wrong ? t.text : undefined);
			else marker(ctx, x, y, c, 4, alpha(classColor(t, c), 0.9), wrong ? t.text : t.bg);
		});

		// manual split: handle and side labels
		if (s.mode === 'manual' && s.show.counts) {
			const sc = manualScore(s);
			const { f, thr } = s.split;
			const yesText = sideText(sc.left, sc.giniLeft, true);
			const noText = sideText(sc.right, sc.giniRight, false);
			const wy = pillW(ctx, t, yesText);
			const wn = pillW(ctx, t, noText);
			if (f === 0) {
				const x = m.x(thr);
				// yes pill left of the line, no pill right of it; kept inside the canvas, stacked if they collide
				const xy = clamp(x - 8 - wy, 6, w - 6 - wy);
				const xn = clamp(x + 8, 6, w - 6 - wn);
				const stack = xy + wy > xn - 4;
				pill(ctx, t, yesText, xy, 22);
				pill(ctx, t, noText, xn, stack ? 48 : 22);
				handle(ctx, t, x, h / 2, true);
			} else {
				const y = m.y(thr);
				pill(ctx, t, noText, 14, clamp(y - 22, 14, h - 62));
				pill(ctx, t, yesText, 14, clamp(y + 22, 40, h - 36));
				handle(ctx, t, w / 2, y, false);
			}
			const ruleText = `${rule(s.split)} ?`;
			pill(ctx, t, ruleText, w - 14 - pillW(ctx, t, ruleText), h - 34);
			if (canDrag && !s.did.drag) {
				const hint = f === 0 ? '← drag to move the split →' : '↕ drag to move the split';
				pill(ctx, t, hint, (w - pillW(ctx, t, hint)) / 2, h - 62);
			}
		}

		// axis names
		label(ctx, t, 'x₁ →', w - 12, h - 8, { align: 'right', color: t.text3, size: 10, base: 'bottom' });
		label(ctx, t, '↑ x₂', 6, 8, { color: t.text3, size: 10, base: 'top' });
	}

	/* ---- impurity-vs-threshold chart ---- */
	let curveMap: ReturnType<typeof mapper> | null = null;
	function drawCurve(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const box = { x: 40, y: 22, w: w - 54, h: h - 50 };
		const parent = rootGini(s);
		const other: dt.Feature = s.split.f === 0 ? 1 : 0;
		const curves = [rootCurve(s, 0), rootCurve(s, 1)];
		const minW = Math.min(...curves.flat().map((c) => c.weighted));
		const lo = Math.max(0, Math.floor((minW - 0.03) * 20) / 20);
		const hi = Math.ceil((parent + 0.03) * 20) / 20;
		const m = mapper(box, [-1, 1], [lo, hi]);
		curveMap = m;
		ctx.strokeStyle = t.grid;
		ctx.lineWidth = 1;
		for (const v of ticks(lo, hi, 3)) {
			ctx.beginPath();
			ctx.moveTo(box.x, m.y(v));
			ctx.lineTo(box.x + box.w, m.y(v));
			ctx.stroke();
			label(ctx, t, v.toFixed(2), box.x - 6, m.y(v), { align: 'right', color: t.text3, size: 10 });
		}
		for (const v of [-1, -0.5, 0, 0.5, 1])
			label(ctx, t, String(v), m.x(v), box.y + box.h + 11, { align: 'center', color: t.text3, size: 10 });
		label(ctx, t, `threshold t`, box.x + box.w, box.y + box.h + 24, { align: 'right', color: t.text3, size: 10 });

		// title + legend
		label(ctx, t, 'weighted child Gini', 6, 4, { color: t.text3, size: 10, base: 'top' });
		const lx = Math.min(box.x + 110, w - 190);
		const swatch = (x: number, color: string, lw: number, text: string) => {
			ctx.strokeStyle = color;
			ctx.lineWidth = lw;
			ctx.beginPath();
			ctx.moveTo(x, 9);
			ctx.lineTo(x + 14, 9);
			ctx.stroke();
			label(ctx, t, text, x + 18, 9, { color: t.text2, size: 10 });
		};
		swatch(lx, t.text, 2, `${featName(s.split.f)} ≤ t`);
		swatch(lx + 70, alpha(t.text3, 0.7), 1.25, `${featName(other)} ≤ t`);

		// parent impurity
		ctx.setLineDash([4, 4]);
		ctx.strokeStyle = t.text3;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(box.x, m.y(parent));
		ctx.lineTo(box.x + box.w, m.y(parent));
		ctx.stroke();
		ctx.setLineDash([]);
		label(ctx, t, `parent ${parent.toFixed(3)}`, box.x + box.w, m.y(parent) - 7, { align: 'right', color: t.text3, size: 10 });

		const line = (f: dt.Feature, color: string, lw: number) => {
			ctx.strokeStyle = color;
			ctx.lineWidth = lw;
			ctx.beginPath();
			curves[f].forEach((c, i) => (i ? ctx.lineTo(m.x(c.thr), m.y(c.weighted)) : ctx.moveTo(m.x(c.thr), m.y(c.weighted))));
			ctx.stroke();
		};
		line(other, alpha(t.text3, 0.7), 1.25);
		line(s.split.f, t.text, 2);

		// best split over both features
		if (s.show.best) {
			const b = rootBest(s);
			const bx = m.x(b.thr);
			const by = m.y(b.weighted);
			ctx.strokeStyle = t.series[1];
			ctx.lineWidth = 1.5;
			ctx.beginPath();
			ctx.moveTo(bx, by);
			ctx.lineTo(bx, m.y(parent));
			ctx.stroke();
			dot(ctx, bx, by, 5, t.series[1], t.bg, 2);
			const right = bx < box.x + box.w - 110;
			label(ctx, t, `best: ${rule(b)}`, bx + (right ? 9 : -9), by + 4, {
				align: right ? 'left' : 'right',
				color: t.series[1],
				size: 10,
				weight: 700
			});
		}
		// current split
		const sc = manualScore(s);
		dot(ctx, m.x(clamp(s.split.thr, -1, 1)), m.y(sc.weighted), 5.5, t.bg, t.text, 2);
	}
	let curveDrag = false;
	function curvePick(p: { x: number }) {
		if (!curveMap || !canDrag) return;
		s.split.thr = Math.round(clamp(curveMap.invX(p.x), -1, 1) * 100) / 100;
		s.did.drag = true;
	}

	/* ---- accuracy-vs-depth chart ---- */
	let depthMap: ReturnType<typeof mapper> | null = null;
	function drawDepth(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const curve = depthCurve(s);
		const box = { x: 40, y: 22, w: w - 84, h: h - 44 };
		const lo = Math.max(0, Math.floor(Math.min(...curve.map((c) => Math.min(c.train, c.test))) * 10) / 10);
		const m = mapper(box, [0, UNLIMITED], [lo, 1]);
		depthMap = m;
		ctx.lineWidth = 1;
		for (const v of ticks(lo, 1, 3)) {
			ctx.strokeStyle = t.grid;
			ctx.beginPath();
			ctx.moveTo(box.x, m.y(v));
			ctx.lineTo(box.x + box.w, m.y(v));
			ctx.stroke();
			label(ctx, t, pct(v), box.x - 6, m.y(v), { align: 'right', color: t.text3, size: 10 });
		}
		for (let d = 0; d <= UNLIMITED; d++)
			label(ctx, t, d === UNLIMITED ? '∞' : String(d), m.x(d), box.y + box.h + 11, {
				align: 'center',
				color: d === s.maxDepth ? t.text : t.text3,
				size: 10,
				weight: d === s.maxDepth ? 700 : 500
			});
		label(ctx, t, 'accuracy vs max_depth', 6, 4, { color: t.text3, size: 10, base: 'top' });

		// current depth
		ctx.strokeStyle = t.axis;
		ctx.beginPath();
		ctx.moveTo(m.x(s.maxDepth), box.y);
		ctx.lineTo(m.x(s.maxDepth), box.y + box.h);
		ctx.stroke();

		const series = (key: 'train' | 'test', color: string, name: string) => {
			ctx.strokeStyle = color;
			ctx.lineWidth = 2;
			ctx.beginPath();
			curve.forEach((c, d) => (d ? ctx.lineTo(m.x(d), m.y(c[key])) : ctx.moveTo(m.x(d), m.y(c[key]))));
			ctx.stroke();
			curve.forEach((c, d) => dot(ctx, m.x(d), m.y(c[key]), d === s.maxDepth ? 4.5 : 2.5, color, t.bg, 1.5));
			const end = curve[curve.length - 1];
			const gap = m.y(end.test) - m.y(end.train);
			const dir = gap >= 0 ? 1 : -1;
			const nudge = Math.abs(gap) < 12 ? (12 - Math.abs(gap)) / 2 : 0; // keep the two end labels apart
			const y = m.y(end[key]) + (key === 'train' ? -dir : dir) * nudge;
			label(ctx, t, name, m.x(UNLIMITED) + 8, y, { color, size: 10, weight: 700 });
		};
		series('train', t.text2, 'train');
		series('test', t.series[4], 'test');
	}
	function depthPick(p: { x: number }) {
		if (!depthMap || !s.ui.depth) return;
		setDepth(s, Math.round(clamp(depthMap.invX(p.x), 0, UNLIMITED)));
	}

	/* ---- readouts ---- */
	const readouts = $derived.by(() => {
		if (s.mode === 'manual') {
			const items: { label: string; value: string; highlight?: boolean }[] = [
				{ label: 'root', value: `${tree.counts[0]} A · ${tree.counts[1]} B` }
			];
			if (s.show.gini) items.push({ label: 'root Gini', value: tree.gini.toFixed(3) });
			if (s.show.counts && s.show.gini) {
				const sc = manualScore(s);
				const best = rootBest(s);
				items.push({ label: 'weighted child Gini', value: sc.weighted.toFixed(3) });
				items.push({ label: 'gain', value: sc.gain.toFixed(3), highlight: sc.gain >= 0.9 * best.gain });
			}
			return items;
		}
		const a = accuracies(s);
		const items: { label: string; value: string; highlight?: boolean }[] = [
			{ label: 'depth', value: `${a.depth}${s.maxDepth < UNLIMITED ? ` / ${s.maxDepth}` : ''}` },
			{ label: 'leaves', value: String(a.leaves) },
			{ label: 'train acc', value: pct(a.train), highlight: a.train === 1 }
		];
		if (s.show.acc) items.push({ label: 'test acc', value: pct(a.test), highlight: true });
		return items;
	});

	const anyUi = $derived(Object.values(s.ui).some(Boolean));
</script>

<div class="scene">
	<Canvas
		{draw}
		aspect={0.72}
		minHeight={280}
		maxHeight={440}
		label="Scatter plot of two classes with the tree's split lines and rectangular decision regions"
		cursor={canDrag ? (s.split.f === 0 ? 'ew-resize' : 'ns-resize') : 'default'}
		onpointerdown={down}
		onpointermove={move}
		onpointerup={up}
	/>

	<div class="legend">
		<span class="key"><i class="dot a"></i>class A</span>
		<span class="key"><i class="sq b"></i>class B</span>
		{#if s.mode === 'tree' && s.show.regions}<span class="key"><i class="ring"></i>misclassified</span>{/if}
		{#if s.view === 'test'}<span class="key note">showing the {test(s).y.length} held-out test points</span>{/if}
	</div>

	<Readouts items={readouts} />

	<div class="tree" onpointerleave={() => (hover = -1)} role="presentation">
		<TreeDiagram root={tree} preview={s.mode === 'manual'} {hover} onhover={(id) => (hover = id)} />
	</div>

	{#if s.show.curve}
		<div class="chart">
			<Canvas
				draw={drawCurve}
				aspect={0.3}
				minHeight={150}
				maxHeight={180}
				label="Weighted child impurity for every threshold on the current feature"
				cursor={canDrag ? 'ew-resize' : 'default'}
				onpointerdown={(p) => {
					curveDrag = true;
					curvePick(p);
				}}
				onpointermove={(p) => curveDrag && curvePick(p)}
				onpointerup={() => (curveDrag = false)}
			/>
		</div>
	{/if}

	{#if s.show.depthChart}
		<div class="chart">
			<Canvas
				draw={drawDepth}
				aspect={0.3}
				minHeight={150}
				maxHeight={180}
				label="Train and test accuracy for each max_depth"
				cursor={s.ui.depth ? 'pointer' : 'default'}
				onpointerdown={depthPick}
			/>
		</div>
	{/if}

	{#if anyUi}
		<div class="controls">
			{#if s.ui.axis}
				<Segmented
					label="Split on"
					bind:value={s.split.f}
					options={[
						{ value: 0, label: 'x₁ (vertical line)' },
						{ value: 1, label: 'x₂ (horizontal line)' }
					]}
				/>
			{/if}
			{#if s.ui.grow}
				<div class="buttons">
					<button class="btn btn-sm btn-primary" onclick={() => grow(s)} disabled={!canGrow(s)}>+ Grow one level</button>
					<button class="btn btn-sm" onclick={() => setDepth(s, Math.max(0, Math.min(s.maxDepth, accuracies(s).depth) - 1))} disabled={s.maxDepth === 0}
						>− Prune a level</button
					>
				</div>
			{/if}
			{#if s.ui.depth}
				<Slider label="max_depth" bind:value={s.maxDepth} min={0} max={UNLIMITED} format={depthLabel} oninput={(d) => setDepth(s, d)} />
			{/if}
			{#if s.ui.minLeaf}
				<Slider label="min_samples_leaf" bind:value={s.minLeaf} min={1} max={30} />
			{/if}
			{#if s.ui.view}
				<Segmented
					label="Show points"
					bind:value={s.view}
					options={[
						{ value: 'train', label: 'Train' },
						{ value: 'test', label: 'Test' }
					]}
				/>
			{/if}
			{#if s.ui.dataset}
				<Segmented
					label="Labels"
					bind:value={s.dataset}
					options={[
						{ value: 'noisy', label: '10% noisy' },
						{ value: 'clean', label: 'Clean' }
					]}
				/>
			{/if}
			{#if s.ui.resample}
				<div class="buttons">
					<button class="btn btn-sm" onclick={() => resample(s)}>↻ New training sample</button>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.scene {
		display: grid;
		gap: 12px;
		min-width: 0;
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 14px;
		font-size: 0.75rem;
		color: var(--text-3);
		margin-top: -4px;
	}
	.key {
		display: inline-flex;
		align-items: center;
		gap: 5px;
	}
	.key i {
		display: inline-block;
		width: 9px;
		height: 9px;
	}
	.dot.a {
		border-radius: 50%;
		background: var(--viz-1);
	}
	.sq.b {
		background: var(--viz-3);
	}
	.ring {
		border-radius: 50%;
		border: 1.5px solid var(--text);
	}
	.tree {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 8px 4px;
		min-width: 0;
	}
	.chart {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 4px;
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
