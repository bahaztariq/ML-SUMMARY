<script lang="ts">
	import Canvas from '#lib/viz/Canvas.svelte';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import { alpha, clamp, dot, label, mapper, ticks, type VizTheme } from '#lib/viz/canvas.ts';
	import type { SceneProps } from '../types.ts';
	import { local } from '#lib/i18n/index.svelte.ts';
	import Legend from '../_classifiers/Legend.svelte';
	import { axisNames, classColor, contour, grid, marker, pill, plotMapper, query, shade, type Grid, type Mapper } from '../_classifiers/plot.ts';
	import { memo } from '../_classifiers/data.ts';
	import * as knn from './knn.ts';
	import { N, SCALE_STEPS, TEST, TRAIN, bestK, curve, opts, setScale, standardize, testAcc, trainAcc, voteAt, type KnnState } from './state.ts';

	let { s = $bindable(), step }: SceneProps<KnnState> = $props();

	const L = local({
		en: {
			tie: ' (tie)',
			dragQuery: 'drag the ◆ query',
			scaleNote: 'distance uses {n} × x₂',
			accVsK: 'accuracy vs k',
			train: 'train',
			test: 'test',
			vote: 'vote',
			prediction: 'prediction',
			trainAcc: 'train acc',
			testAcc: 'test acc',
			x2scale: 'x₂ scale',
			queryLegend: 'query (colored by prediction)',
			neighbours: 'nearest neighbours',
			boundary: 'decision boundary',
			plotLabel: 'Training points, a draggable query point and its k nearest neighbours',
			curveLabel: 'Training and test accuracy for each k',
			kSlider: 'k (neighbours)',
			distance: 'Distance',
			euclidean: 'Euclidean',
			manhattan: 'Manhattan',
			chebyshev: 'Chebyshev',
			votes: 'Votes',
			equal: 'Equal',
			byDist: 'By 1/distance',
			scaleSlider: 'x₂ scale (unit change)',
			standardize: 'Standardize',
			showTest: 'Show test points',
			hideTest: 'Hide test points'
		},
		fr: {
			tie: ' (égalité)',
			dragQuery: 'faites glisser la requête ◆',
			scaleNote: 'la distance utilise {n} × x₂',
			accVsK: 'exactitude selon k',
			train: 'entr.',
			test: 'test',
			vote: 'vote',
			prediction: 'prédiction',
			trainAcc: 'exactitude entr.',
			testAcc: 'exactitude test',
			x2scale: 'échelle de x₂',
			queryLegend: 'requête (couleur = prédiction)',
			neighbours: 'plus proches voisins',
			boundary: 'frontière de décision',
			plotLabel: 'Points d’entraînement, un point requête déplaçable et ses k plus proches voisins',
			curveLabel: 'Exactitude d’entraînement et de test pour chaque k',
			kSlider: 'k (voisins)',
			distance: 'Distance',
			euclidean: 'Euclidienne',
			manhattan: 'Manhattan',
			chebyshev: 'Tchebychev',
			votes: 'Votes',
			equal: 'Égaux',
			byDist: 'Par 1/distance',
			scaleSlider: 'échelle de x₂ (changement d’unité)',
			standardize: 'Standardiser',
			showTest: 'Afficher les points de test',
			hideTest: 'Masquer les points de test'
		},
		ar: {
			tie: ' (تعادل)',
			dragQuery: 'اسحب نقطة الاستعلام ◆',
			scaleNote: 'المسافة تستخدم {n} × x₂',
			accVsK: 'الدقة مقابل k',
			train: 'تدريب',
			test: 'اختبار',
			vote: 'التصويت',
			prediction: 'التنبؤ',
			trainAcc: 'دقة التدريب',
			testAcc: 'دقة الاختبار',
			x2scale: 'مقياس x₂',
			queryLegend: 'الاستعلام (ملوّن حسب التنبؤ)',
			neighbours: 'أقرب الجيران',
			boundary: 'حد القرار',
			plotLabel: 'نقاط التدريب ونقطة استعلام قابلة للسحب وأقرب k جيران لها',
			curveLabel: 'دقة التدريب والاختبار لكل قيمة k',
			kSlider: 'k (الجيران)',
			distance: 'المسافة',
			euclidean: 'إقليدية',
			manhattan: 'مانهاتن',
			chebyshev: 'تشيبيشيف',
			votes: 'الأصوات',
			equal: 'متساوية',
			byDist: 'حسب 1/المسافة',
			scaleSlider: 'مقياس x₂ (تغيير الوحدة)',
			standardize: 'توحيد المقياس',
			showTest: 'إظهار نقاط الاختبار',
			hideTest: 'إخفاء نقاط الاختبار'
		}
	});

	const pct = (v: number) => `${Math.round(v * 100)}%`;
	const v = $derived(voteAt(s));
	const nbrSet = $derived(new Set(v.nbrs.map((n) => n.i)));

	/* ---- query dragging ---- */
	let dragging = $state(false);
	let startPred = 0;
	let map: Mapper | null = null;
	$effect(() => {
		step;
		dragging = false;
	});
	function place(p: { x: number; y: number }) {
		if (!map) return;
		s.query = [clamp(map.invX(p.x), -1.7, 1.7), clamp(map.invY(p.y), -1.3, 1.3)];
		if (voteAt(s).pred !== startPred) s.did.flip = true;
	}
	function down(p: { x: number; y: number }) {
		if (!s.ui.query) return;
		dragging = true;
		startPred = voteAt(s).pred;
		place(p);
	}
	function move(p: { x: number; y: number }) {
		if (dragging) place(p);
	}
	function up() {
		dragging = false;
	}

	/* ---- decision regions: neighbour order per grid sample, reused for every k ---- */
	interface OrderGrid {
		cols: number;
		rows: number;
		cell: number;
		order: Uint8Array;
		dist: Float32Array;
	}
	const orders = memo<OrderGrid>(3);
	const regionGrids = memo<Grid>(30);
	function regions(m: Mapper, w: number, h: number): Grid {
		const cell = 6;
		const o = opts(s);
		const base = `${s.metric}|${s.scaleY}|${w}|${h}`;
		const og = orders(base, () => {
			const cols = Math.ceil(w / cell) + 1;
			const rows = Math.ceil(h / cell) + 1;
			const order = new Uint8Array(cols * rows * N);
			const dist = new Float32Array(cols * rows * N);
			for (let j = 0; j < rows; j++)
				for (let i = 0; i < cols; i++) {
					const sorted = knn.sortedByDistance(TRAIN.X, [m.invX(i * cell), m.invY(j * cell)], o);
					const off = (j * cols + i) * N;
					sorted.forEach((nb, r) => {
						order[off + r] = nb.i;
						dist[off + r] = nb.d;
					});
				}
			return { cols, rows, cell, order, dist };
		});
		return regionGrids(`${base}|${s.k}|${s.weights}`, () => {
			const vals = new Float64Array(og.cols * og.rows);
			const nb: knn.Neighbour[] = Array.from({ length: s.k }, () => ({ i: 0, d: 0 }));
			for (let c = 0; c < og.cols * og.rows; c++) {
				for (let r = 0; r < s.k; r++) {
					nb[r].i = og.order[c * N + r];
					nb[r].d = og.dist[c * N + r];
				}
				const vt = knn.voteFrom(nb, TRAIN.y, s.weights);
				// ties go to A, as in scikit-learn
				vals[c] = vt.tie ? 0.49 : vt.pB;
			}
			return { cols: og.cols, rows: og.rows, cell: og.cell, v: vals };
		});
	}

	/** Outline of all points at distance r from the query under the current metric and scaling. */
	function ball(ctx: CanvasRenderingContext2D, m: Mapper, r: number) {
		const cx = m.x(s.query[0]);
		const cy = m.y(s.query[1]);
		const rx = m.x(s.query[0] + r) - cx;
		const ry = cy - m.y(s.query[1] + r / s.scaleY);
		ctx.beginPath();
		if (s.metric === 'euclidean') ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
		else if (s.metric === 'manhattan') {
			ctx.moveTo(cx + rx, cy);
			ctx.lineTo(cx, cy - ry);
			ctx.lineTo(cx - rx, cy);
			ctx.lineTo(cx, cy + ry);
			ctx.closePath();
		} else ctx.rect(cx - rx, cy - ry, 2 * rx, 2 * ry);
	}

	function draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const m = plotMapper(w, h);
		map = m;
		grid(ctx, m, w, h, t);
		const qx = m.x(s.query[0]);
		const qy = m.y(s.query[1]);

		if (s.show.regions) {
			const g = regions(m, w, h);
			shade(ctx, g, t, (x) => x, 0.3);
			contour(ctx, g, 0.5, alpha(t.text, 0.8), 1.75);
		}

		if (s.show.allDist) {
			ctx.strokeStyle = alpha(t.text, 0.09);
			ctx.lineWidth = 1;
			ctx.beginPath();
			TRAIN.X.forEach((p) => {
				ctx.moveTo(qx, qy);
				ctx.lineTo(m.x(p[0]), m.y(p[1]));
			});
			ctx.stroke();
		}

		if (s.show.test) {
			TEST.X.forEach((p, i) => marker(ctx, m.x(p[0]), m.y(p[1]), TEST.y[i], 2.3, alpha(classColor(t, TEST.y[i]), 0.4)));
		}

		const showQuery = s.ui.query || s.show.links;
		if (showQuery && s.show.ball && v.nbrs.length) {
			ball(ctx, m, v.nbrs[v.nbrs.length - 1].d);
			ctx.fillStyle = alpha(t.text, 0.05);
			ctx.fill();
			ctx.strokeStyle = alpha(t.text, 0.55);
			ctx.lineWidth = 1.5;
			ctx.setLineDash([5, 4]);
			ctx.stroke();
			ctx.setLineDash([]);
		}

		if (showQuery && s.show.links) {
			ctx.lineWidth = 1.5;
			for (const nb of v.nbrs) {
				const p = TRAIN.X[nb.i];
				ctx.strokeStyle = alpha(classColor(t, TRAIN.y[nb.i]), 0.8);
				ctx.beginPath();
				ctx.moveTo(qx, qy);
				ctx.lineTo(m.x(p[0]), m.y(p[1]));
				ctx.stroke();
			}
		}

		// training points (neighbours emphasised)
		TRAIN.X.forEach((p, i) => {
			const c = TRAIN.y[i];
			const isN = showQuery && s.show.links && nbrSet.has(i);
			marker(ctx, m.x(p[0]), m.y(p[1]), c, isN ? 5 : 3.8, alpha(classColor(t, c), isN ? 1 : 0.85), isN ? t.text : t.bg, isN ? 1.75 : 1.25);
		});

		if (showQuery) {
			query(ctx, qx, qy, 9, alpha(classColor(t, v.pred), 0.9), t.text);
			const [a, b] = v.votes;
			const vt = s.weights === 'distance' ? `A ${a.toFixed(1)} · B ${b.toFixed(1)}` : `${a} A · ${b} B`;
			const text = `k = ${s.k}: ${vt} → ${v.pred ? 'B' : 'A'}${v.tie ? L('tie') : ''}`;
			const right = qx < w - 190;
			pill(ctx, t, text, qx + (right ? 16 : -16), clamp(qy - 22, 14, h - 14), { align: right ? 'left' : 'right' });
		}
		if (s.ui.query && !s.did.flip && !dragging && step === 0) pill(ctx, t, L('dragQuery'), w - 14, h - 34, { align: 'right', color: t.text2 });
		if (s.scaleY > 1) label(ctx, t, L('scaleNote', { n: s.scaleY }), 12, h - 14, { color: t.text2, size: 11, weight: 600 });
		axisNames(ctx, w, h, t);
	}

	/* ---- accuracy vs k ---- */
	let curveMap: ReturnType<typeof mapper> | null = null;
	function drawCurve(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const c = curve(s);
		const box = { x: 40, y: 20, w: w - 84, h: h - 44 };
		const lo = 0.5;
		const m = mapper(box, [1, N], [lo, 1]);
		curveMap = m;
		for (const val of ticks(lo, 1, 3)) {
			ctx.strokeStyle = t.grid;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(box.x, m.y(val));
			ctx.lineTo(box.x + box.w, m.y(val));
			ctx.stroke();
			label(ctx, t, pct(val), box.x - 6, m.y(val), { align: 'right', color: t.text3, size: 10 });
		}
		for (const k of [1, 15, 30, 45, 60, 75, 90]) label(ctx, t, String(k), m.x(k), box.y + box.h + 11, { align: 'center', color: t.text3, size: 10 });
		label(ctx, t, L('accVsK'), 6, 3, { color: t.text3, size: 10, base: 'top' });
		ctx.strokeStyle = t.axis;
		ctx.beginPath();
		ctx.moveTo(m.x(s.k), box.y);
		ctx.lineTo(m.x(s.k), box.y + box.h);
		ctx.stroke();
		const series = (vals: number[], color: string, nm: 'train' | 'test') => {
			ctx.strokeStyle = color;
			ctx.lineWidth = 2;
			ctx.beginPath();
			vals.forEach((val, i) => (i ? ctx.lineTo(m.x(i + 1), m.y(val)) : ctx.moveTo(m.x(i + 1), m.y(val))));
			ctx.stroke();
			dot(ctx, m.x(s.k), m.y(vals[s.k - 1]), 4.5, color, t.bg, 1.5);
			label(ctx, t, L(nm), m.x(N) + 8, m.y(vals[N - 1]) + (nm === 'train' ? -7 : 7), { color, size: 10, weight: 700 });
		};
		series(c.train, t.text2, 'train');
		series(c.test, t.series[4], 'test');
	}
	let curveDrag = false;
	function pickK(p: { x: number }) {
		if (!curveMap || !s.ui.k) return;
		s.k = clamp(Math.round(curveMap.invX(p.x)), 1, N);
	}

	const readouts = $derived.by(() => {
		const items: { label: string; value: string; highlight?: boolean }[] = [{ label: 'k', value: String(s.k) }];
		if (s.ui.query || s.show.links) {
			items.push({ label: L('vote'), value: s.weights === 'distance' ? `${v.votes[0].toFixed(1)} : ${v.votes[1].toFixed(1)}` : `${v.votes[0]} A : ${v.votes[1]} B` });
			items.push({ label: L('prediction'), value: (v.pred ? 'B' : 'A') + (v.tie ? L('tie') : '') });
		}
		if (s.show.regions || s.show.curve) {
			items.push({ label: L('trainAcc'), value: pct(trainAcc(s)) });
			items.push({ label: L('testAcc'), value: pct(testAcc(s)), highlight: s.show.curve && testAcc(s) >= bestK(s).acc - 0.01 });
		}
		if (s.scaleY > 1 || s.ui.scale) items.push({ label: L('x2scale'), value: `×${s.scaleY}` });
		return items;
	});
	const extras = $derived.by(() => {
		const e: { kind: 'ring' | 'line' | 'dash' | 'query'; text: string }[] = [];
		if (s.ui.query || s.show.links) e.push({ kind: 'query', text: L('queryLegend') });
		if (s.show.links) e.push({ kind: 'ring', text: L('neighbours') });
		if (s.show.regions) e.push({ kind: 'line', text: L('boundary') });
		return e;
	});
	const scaleIdx = $derived(Math.max(0, SCALE_STEPS.indexOf(s.scaleY)));
	const anyUi = $derived(s.ui.k || s.ui.metric || s.ui.weights || s.ui.scale || s.ui.view);
</script>

<div class="scene">
	<Canvas
		{draw}
		aspect={0.72}
		minHeight={280}
		maxHeight={440}
		label={L('plotLabel')}
		cursor={s.ui.query ? (dragging ? 'grabbing' : 'crosshair') : 'default'}
		onpointerdown={down}
		onpointermove={move}
		onpointerup={up}
	/>
	<Legend extra={extras} note={s.show.test ? `faded markers: ${TEST.X.length} test points` : undefined} />
	<Readouts items={readouts} />

	{#if s.show.curve}
		<div class="chart">
			<Canvas
				draw={drawCurve}
				aspect={0.28}
				minHeight={130}
				maxHeight={170}
				label={L('curveLabel')}
				cursor={s.ui.k ? 'ew-resize' : 'default'}
				onpointerdown={(p) => {
					curveDrag = true;
					pickK(p);
				}}
				onpointermove={(p) => curveDrag && pickK(p)}
				onpointerup={() => (curveDrag = false)}
			/>
		</div>
	{/if}

	{#if anyUi}
		<div class="controls">
			{#if s.ui.k}
				<Slider label={L('kSlider')} bind:value={s.k} min={1} max={N} />
			{/if}
			{#if s.ui.metric}
				<Segmented
					label={L('distance')}
					bind:value={s.metric}
					options={[
						{ value: 'euclidean', label: L('euclidean') },
						{ value: 'manhattan', label: L('manhattan') },
						{ value: 'chebyshev', label: L('chebyshev') }
					] as { value: knn.Metric; label: string }[]}
					onchange={(m) => {
						if (m !== 'euclidean') s.did.metric = true;
					}}
				/>
			{/if}
			{#if s.ui.weights}
				<Segmented
					label={L('votes')}
					bind:value={s.weights}
					options={[
						{ value: 'uniform', label: L('equal') },
						{ value: 'distance', label: L('byDist') }
					] as { value: knn.Weights; label: string }[]}
				/>
			{/if}
			{#if s.ui.scale}
				<Slider label={L('scaleSlider')} value={scaleIdx} min={0} max={SCALE_STEPS.length - 1} format={(i) => `×${SCALE_STEPS[i]}`} oninput={(i) => setScale(s, SCALE_STEPS[i])} />
				<div class="buttons">
					<button class="btn btn-sm btn-primary" disabled={s.scaleY === 1} onclick={() => standardize(s)}>{L('standardize')}</button>
				</div>
			{/if}
			{#if s.ui.view}
				<div class="buttons">
					<button class="btn btn-sm" aria-pressed={s.show.test} onclick={() => (s.show.test = !s.show.test)}>{s.show.test ? L('hideTest') : L('showTest')}</button>
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
