<script lang="ts">
	import Canvas from '#lib/viz/Canvas.svelte';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import { alpha, clamp, dot, fmt, label, mapper, ticks, type VizTheme } from '#lib/viz/canvas.ts';
	import { local } from '#lib/i18n/index.svelte.ts';
	import type { SceneProps } from '../types.ts';
	import * as rg from '../_regression/regression.ts';
	import { axes, clip, curve, euro, handle, points, residualLines, squares, tag, type Plot } from '../_regression/plot.ts';
	import {
		FEATURES,
		HANDLE_X,
		K_MAX,
		NOISE_RANGE,
		SCORES,
		X_DOM,
		Y_DOM,
		fit,
		num,
		preds,
		setK,
		setNoise,
		stats,
		type R2State,
		type View
	} from './state.ts';

	let { s = $bindable() }: SceneProps<R2State> = $props();

	const L = local({
		en: {
			size: 'size (m²) →',
			rent: 'rent (€ / month)',
			model: 'model',
			dragHandles: 'drag the round handles ↕',
			actual: 'actual rent →',
			predicted: 'predicted rent',
			perfect: 'perfect = on the dashed line',
			trainFlats: 'training flats ({n})',
			newFlats: 'new flats (test)',
			junkAxis: 'useless features added →',
			r2Train: 'R² (training)',
			adjR2: 'adjusted R²',
			r2New: 'R² on new flats',
			features: 'features',
			sizeJunk: 'size + {k} junk',
			r2TrainShort: 'R² (train)',
			r2NewShort: 'R² (new flats)',
			noise: 'noise σ',
			lineLabel: 'Rent against size with the mean baseline, a regression line and their squared errors',
			ssLabel: 'Comparison of total and residual sums of squares',
			predictMean: '(predict ȳ)',
			modelSmall: '(model)',
			explains: '· explains {p}% of the variation',
			worse: '· worse than predicting the mean',
			pvaLabel: 'Predicted against actual rent for training and new flats',
			scoresLabel: 'Training R², adjusted R² and test R² against the number of useless features',
			data: 'Data',
			oneFeature: 'One feature',
			uselessFeatures: 'Useless features',
			fitBtn: 'Fit (least squares)',
			noiseSlider: 'Noise σ'
		},
		fr: {
			size: 'surface (m²) →',
			rent: 'loyer (€ / mois)',
			model: 'modèle',
			dragHandles: 'faites glisser les poignées rondes ↕',
			actual: 'loyer réel →',
			predicted: 'loyer prédit',
			perfect: 'parfait = sur la ligne pointillée',
			trainFlats: 'appartements d’entraînement ({n})',
			newFlats: 'nouveaux appartements (test)',
			junkAxis: 'variables inutiles ajoutées →',
			r2Train: 'R² (entraînement)',
			adjR2: 'R² ajusté',
			r2New: 'R² sur nouveaux apparts',
			features: 'variables',
			sizeJunk: 'surface + {k} inutiles',
			r2TrainShort: 'R² (entraîn.)',
			r2NewShort: 'R² (nouveaux)',
			noise: 'bruit σ',
			lineLabel: 'Loyer selon la surface, avec la référence de la moyenne, une droite de régression et leurs erreurs au carré',
			ssLabel: 'Comparaison des sommes des carrés totale et résiduelle',
			predictMean: '(prédire ȳ)',
			modelSmall: '(modèle)',
			explains: '· explique {p} % de la variation',
			worse: '· pire que prédire la moyenne',
			pvaLabel: 'Loyer prédit contre loyer réel pour les appartements d’entraînement et les nouveaux',
			scoresLabel: 'R² d’entraînement, R² ajusté et R² de test selon le nombre de variables inutiles',
			data: 'Données',
			oneFeature: 'Une variable',
			uselessFeatures: 'Variables inutiles',
			fitBtn: 'Ajuster (moindres carrés)',
			noiseSlider: 'Bruit σ'
		},
		ar: {
			size: 'المساحة (m²) →',
			rent: 'الإيجار (€ / شهر)',
			model: 'النموذج',
			dragHandles: 'اسحب المقبضين الدائريين ↕',
			actual: 'الإيجار الفعلي →',
			predicted: 'الإيجار المتنبأ به',
			perfect: 'مثالي = على الخط المتقطع',
			trainFlats: 'شقق التدريب ({n})',
			newFlats: 'شقق جديدة (اختبار)',
			junkAxis: 'ميزات عديمة الفائدة مضافة →',
			r2Train: 'R² (التدريب)',
			adjR2: 'R² المعدَّل',
			r2New: 'R² على شقق جديدة',
			features: 'الميزات',
			sizeJunk: 'المساحة + {k} عديمة الفائدة',
			r2TrainShort: 'R² (تدريب)',
			r2NewShort: 'R² (شقق جديدة)',
			noise: 'الضجيج σ',
			lineLabel: 'الإيجار مقابل المساحة مع خط أساس المتوسط وخط انحدار ومربعات أخطائهما',
			ssLabel: 'مقارنة مجموع المربعات الكلي ومجموع مربعات البواقي',
			predictMean: '(تنبؤ بـȳ)',
			modelSmall: '(النموذج)',
			explains: '· يفسّر {p}% من التباين',
			worse: '· أسوأ من التنبؤ بالمتوسط',
			pvaLabel: 'الإيجار المتنبأ به مقابل الفعلي لشقق التدريب والشقق الجديدة',
			scoresLabel: 'R² التدريب وR² المعدَّل وR² الاختبار مقابل عدد الميزات عديمة الفائدة',
			data: 'البيانات',
			oneFeature: 'ميزة واحدة',
			uselessFeatures: 'ميزات عديمة الفائدة',
			fitBtn: 'ملاءمة (المربعات الصغرى)',
			noiseSlider: 'الضجيج σ'
		}
	});

	const big = (v: number) => (Number.isFinite(v) ? Math.round(v).toLocaleString('en-US') : '—');
	const st = $derived(stats(s));

	/* ------------------------------------------------------------ line view */
	let plot: Plot | null = null;
	let drag = $state(-1);
	let hover = $state(-1);

	function handlePx(i: number) {
		if (!plot) return null;
		return { x: plot.m.x(HANDLE_X[i]), y: plot.m.y(rg.lineAt(s.line, HANDLE_X[i])) };
	}
	function hit(p: { x: number; y: number }) {
		if (!s.ui.handles || !s.show.model) return -1;
		for (const i of [0, 1]) {
			const h = handlePx(i);
			if (h && (h.x - p.x) ** 2 + (h.y - p.y) ** 2 < 16 * 16) return i;
		}
		return -1;
	}
	function down(p: { x: number; y: number }) {
		drag = hit(p);
	}
	function move(p: { x: number; y: number }) {
		if (drag < 0) {
			hover = hit(p);
			return;
		}
		if (!plot) return;
		const y = clamp(plot.m.invY(p.y), Y_DOM[0], Y_DOM[1]);
		const o = 1 - drag;
		const yo = rg.lineAt(s.line, HANDLE_X[o]);
		const l = drag === 0 ? rg.lineThrough(HANDLE_X[0], y, HANDLE_X[1], yo) : rg.lineThrough(HANDLE_X[0], yo, HANDLE_X[1], y);
		s.line = { w: Math.round(l.w * 100) / 100, b: Math.round(l.b) };
		s.autoFit = false;
		s.did.handles = true;
	}
	function up() {
		drag = -1;
	}

	function drawLine(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const p = axes(ctx, w, h, t, {
			xDom: X_DOM,
			yDom: Y_DOM,
			xLabel: L('size'),
			yLabel: L('rent'),
			yFmt: (v) => (Math.abs(v) >= 1000 ? `€${v / 1000}k` : `€${v}`),
			pad: { left: 48, top: 26 }
		});
		plot = p;
		const base = s.xs.map(() => st.ybar);
		const pr = preds(s);
		clip(ctx, p.box);
		if (s.show.totSquares) squares(ctx, p, s.xs, s.ys, base, t.series[2], { side: 'left', fill: 0.12 });
		if (s.show.model && s.show.resSquares) squares(ctx, p, s.xs, s.ys, pr, t.series[0], { side: 'right', fill: 0.16 });
		if (s.show.totRes) residualLines(ctx, p, s.xs, s.ys, base, alpha(t.series[2], 0.8), 1.5);
		if (s.show.model && s.show.resSquares) residualLines(ctx, p, s.xs, s.ys, pr, alpha(t.series[0], 0.8), 1.5);
		if (s.show.meanLine) curve(ctx, p, () => st.ybar, t.series[2], { width: 2, dash: [7, 5] });
		if (s.show.model) curve(ctx, p, (x) => rg.lineAt(s.line, x), t.series[0], { width: 2.75 });
		points(ctx, p, t, s.xs, s.ys, { color: alpha(t.text, 0.75) });
		if (s.show.model && s.ui.handles) for (const i of [0, 1]) handle(ctx, t, handlePx(i)!.x, handlePx(i)!.y, t.series[0], drag === i || hover === i);
		ctx.restore();

		if (s.show.meanLine) label(ctx, t, `ȳ = ${euro(st.ybar)}`, p.box.x + p.box.w - 6, p.m.y(st.ybar) + 14, { align: 'right', color: t.series[2], size: 11, weight: 700 });
		if (s.show.model) tag(ctx, t, `${L('model')}: ŷ = ${fmt(s.line.w)}·size ${s.line.b < 0 ? '−' : '+'} ${big(Math.abs(s.line.b))}`, p.box.x + 8, p.box.y + 14, t.series[0]);
		if (s.ui.handles && s.show.model && !s.did.handles && drag < 0)
			label(ctx, t, L('dragHandles'), p.box.x + p.box.w - 6, p.box.y + p.box.h - 12, { align: 'right', color: t.text3, size: 11 });
	}

	/** Bars for SS_tot and SS_res, on the same scale. */
	const bars = $derived.by(() => {
		const scale = Math.max(st.tot, st.res);
		return {
			tot: (st.tot / scale) * 100,
			res: (st.res / scale) * 100,
			ratio: st.res / st.tot
		};
	});

	/* -------------------------------------------------------- features view */
	const score = $derived(SCORES[s.k]);

	function drawPredVsActual(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const dom: [number, number] = [0, 2000];
		const p = axes(ctx, w, h, t, {
			xDom: dom,
			yDom: dom,
			xLabel: L('actual'),
			yLabel: L('predicted'),
			xFmt: (v) => (v >= 1000 ? `€${v / 1000}k` : `€${v}`),
			yFmt: (v) => (v >= 1000 ? `€${v / 1000}k` : `€${v}`),
			pad: { left: 48, top: 26 }
		});
		clip(ctx, p.box);
		ctx.strokeStyle = t.axis;
		ctx.lineWidth = 1.5;
		ctx.setLineDash([5, 4]);
		ctx.beginPath();
		ctx.moveTo(p.m.x(dom[0]), p.m.y(dom[0]));
		ctx.lineTo(p.m.x(dom[1]), p.m.y(dom[1]));
		ctx.stroke();
		ctx.setLineDash([]);
		FEATURES.test.y.forEach((y, i) => dot(ctx, p.m.x(y), p.m.y(score.predTest[i]), 2.4, alpha(t.series[2], 0.45)));
		FEATURES.train.y.forEach((y, i) => dot(ctx, p.m.x(y), p.m.y(score.predTrain[i]), 4.5, t.series[0], t.bg, 1.5));
		ctx.restore();
		label(ctx, t, L('perfect'), p.box.x + p.box.w - 6, p.box.y + p.box.h - 12, { align: 'right', color: t.text3, size: 11 });
		dot(ctx, p.box.x + 12, p.box.y + 10, 4.5, t.series[0], t.bg, 1.5);
		label(ctx, t, L('trainFlats', { n: FEATURES.train.y.length }), p.box.x + 22, p.box.y + 10, { color: t.series[0], size: 11, weight: 600 });
		dot(ctx, p.box.x + 12, p.box.y + 28, 3, alpha(t.series[2], 0.8));
		label(ctx, t, L('newFlats'), p.box.x + 22, p.box.y + 28, { color: t.series[2], size: 11, weight: 600 });
	}

	let kmap: ReturnType<typeof mapper> | null = null;
	let kdrag = $state(false);
	function drawScores(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const box = { x: 44, y: 26, w: w - 58, h: h - 56 };
		const lo = Math.min(0, ...SCORES.map((x) => Math.min(x.r2Test, x.adjR2)));
		const m = mapper(box, [-0.4, K_MAX + 0.4], [Math.floor(lo * 10) / 10, 1]);
		kmap = m;
		for (const v of ticks(Math.floor(lo * 10) / 10, 1, 4)) {
			ctx.strokeStyle = v === 0 ? t.axis : t.grid;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(box.x, m.y(v));
			ctx.lineTo(box.x + box.w, m.y(v));
			ctx.stroke();
			label(ctx, t, fmt(v, 1), box.x - 6, m.y(v), { align: 'right', color: t.text3, size: 10 });
		}
		for (let k = 0; k <= K_MAX; k++)
			label(ctx, t, String(k), m.x(k), box.y + box.h + 12, { align: 'center', color: k === s.k ? t.text : t.text3, size: 10, weight: k === s.k ? 700 : 500 });
		label(ctx, t, L('junkAxis'), box.x + box.w, box.y + box.h + 26, { align: 'right', color: t.text2, size: 11, weight: 600 });
		const series: [keyof (typeof SCORES)[number], string, string][] = [
			['r2Train', t.series[0], L('r2Train')],
			['adjR2', t.series[1], L('adjR2')],
			['r2Test', t.series[2], L('r2New')]
		];
		ctx.strokeStyle = alpha(t.text3, 0.5);
		ctx.beginPath();
		ctx.moveTo(m.x(s.k), box.y);
		ctx.lineTo(m.x(s.k), box.y + box.h);
		ctx.stroke();
		let lx = box.x;
		for (const [key, color, name] of series) {
			ctx.strokeStyle = color;
			ctx.lineWidth = 2;
			const seen = SCORES.slice(0, s.kSeen + 1);
			ctx.beginPath();
			seen.forEach((sc, k) => (k ? ctx.lineTo(m.x(k), m.y(sc[key] as number)) : ctx.moveTo(m.x(k), m.y(sc[key] as number))));
			ctx.stroke();
			seen.forEach((sc, k) => dot(ctx, m.x(k), m.y(sc[key] as number), k === s.k ? 5.5 : 2.5, k === s.k ? color : alpha(color, 0.8), k === s.k ? t.bg : undefined, 2));
			label(ctx, t, name, lx, 8, { color, size: 11, weight: 700 });
			ctx.font = `700 11px ${t.sans}`;
			lx += ctx.measureText(name).width + 16;
		}
	}
	function pickK(p: { x: number }) {
		if (!kmap || !s.ui.k) return;
		const k = clamp(Math.round(kmap.invX(p.x)), 0, K_MAX);
		if (k !== s.k) setK(s, k);
	}

	/* ------------------------------------------------------------ readouts */
	const readouts = $derived.by(() => {
		if (s.view === 'features')
			return [
				{ label: L('features'), value: L('sizeJunk', { k: s.k }) },
				{ label: L('r2TrainShort'), value: fmt(score.r2Train, 3), highlight: true },
				{ label: L('adjR2'), value: fmt(score.adjR2, 3) },
				{ label: L('r2NewShort'), value: fmt(score.r2Test, 3) }
			];
		const items = [{ label: 'SS_tot', value: big(st.tot) }];
		if (s.show.model) {
			items.push({ label: 'SS_res', value: big(st.res) });
			items.push({ label: 'R²', value: num(st.r2, 3) });
		}
		if (s.ui.noise) items.push({ label: L('noise'), value: euro(s.noise) });
		return items.map((it) => ({ ...it, highlight: it.label === 'R²' }));
	});
</script>

<div class="scene">
	{#if s.view === 'line'}
		<Canvas
			draw={drawLine}
			aspect={0.56}
			minHeight={260}
			maxHeight={410}
			label={L('lineLabel')}
			cursor={drag >= 0 ? 'grabbing' : hover >= 0 ? 'ns-resize' : 'default'}
			onpointerdown={down}
			onpointermove={move}
			onpointerup={up}
		/>
		{#if s.show.bars}
			<div class="ss" aria-label={L('ssLabel')}>
				<div class="row">
					<span class="name">SS_tot <small>{L('predictMean')}</small></span>
					<span class="track"><span class="bar tot" style:width="{bars.tot}%"></span></span>
					<span class="num">{big(st.tot)}</span>
				</div>
				{#if s.show.model}
					<div class="row">
						<span class="name">SS_res <small>{L('modelSmall')}</small></span>
						<span class="track"><span class="bar res" style:width="{bars.res}%"></span></span>
						<span class="num">{big(st.res)}</span>
					</div>
					<p class="eq">
						<span class="ltr">R² = 1 − {big(st.res)} / {big(st.tot)} = <strong class:neg={st.r2 < -0.0005}>{num(st.r2, 3)}</strong></span>
						{#if st.r2 >= -0.0005}<span class="note">{L('explains', { p: Math.round(st.r2 * 100) })}</span>
						{:else}<span class="note neg">{L('worse')}</span>{/if}
					</p>
				{/if}
			</div>
		{/if}
	{:else}
		<div class="two">
			<Canvas draw={drawPredVsActual} aspect={0.9} minHeight={240} maxHeight={360} label={L('pvaLabel')} />
			<Canvas
				draw={drawScores}
				aspect={0.9}
				minHeight={240}
				maxHeight={360}
				label={L('scoresLabel')}
				cursor={s.ui.k ? 'pointer' : 'default'}
				onpointerdown={(p) => {
					kdrag = true;
					pickK(p);
				}}
				onpointermove={(p) => kdrag && pickK(p)}
				onpointerup={() => (kdrag = false)}
			/>
		</div>
	{/if}

	<Readouts items={readouts} />

	{#if Object.values(s.ui).some(Boolean)}
		<div class="controls">
			{#if s.ui.view}
				<Segmented
					label={L('data')}
					bind:value={s.view}
					options={[
						{ value: 'line', label: L('oneFeature') },
						{ value: 'features', label: L('uselessFeatures') }
					] as { value: View; label: string }[]}
				/>
			{/if}
			{#if s.view === 'line'}
				{#if s.ui.fit}
					<button
						class="btn btn-sm btn-primary"
						onclick={() => {
							s.autoFit = true;
							fit(s);
						}}>{L('fitBtn')}</button
					>
				{/if}
				{#if s.ui.noise}
					<Slider label={L('noiseSlider')} bind:value={s.noise} min={NOISE_RANGE[0]} max={NOISE_RANGE[1]} step={10} format={(v) => `€${v}`} oninput={(v) => setNoise(s, v)} />
				{/if}
			{:else if s.ui.k}
				<Slider label={L('uselessFeatures')} bind:value={s.k} min={0} max={K_MAX} oninput={(v) => setK(s, v)} />
			{/if}
		</div>
	{/if}
</div>

<style>
	.scene {
		display: grid;
		gap: 12px;
	}
	.two {
		display: grid;
		gap: 10px;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
	}
	.ss {
		display: grid;
		gap: 6px;
		padding: 10px 12px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		font-size: 0.8125rem;
	}
	.row {
		display: grid;
		grid-template-columns: 9.5em 1fr 6.5em;
		align-items: center;
		gap: 10px;
	}
	.name {
		color: var(--text-2);
		font-weight: 600;
	}
	.name small {
		font-weight: 400;
		color: var(--text-3);
	}
	.track {
		height: 14px;
		border-radius: 4px;
		background: var(--surface-2);
		overflow: hidden;
	}
	.bar {
		display: block;
		height: 100%;
		border-radius: 4px;
		transition: width 0.15s var(--ease);
	}
	.bar.tot {
		background: color-mix(in srgb, var(--viz-3) 75%, transparent);
	}
	.bar.res {
		background: color-mix(in srgb, var(--viz-1) 75%, transparent);
	}
	.num {
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
		text-align: end;
	}
	.eq {
		margin: 2px 0 0;
		font-size: 0.8125rem;
	}
	.eq .ltr {
		font-family: var(--font-mono);
	}
	.note {
		font-family: var(--font-sans);
		color: var(--text-3);
	}
	.neg {
		color: var(--viz-4);
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 14px 20px;
		padding-top: 12px;
		border-top: 1px solid var(--border);
	}
	@media (max-width: 480px) {
		.row {
			grid-template-columns: 6.5em 1fr 5.5em;
		}
		.name small {
			display: none;
		}
	}
</style>
