<script lang="ts">
	import { onDestroy } from 'svelte';
	import Canvas from '#lib/viz/Canvas.svelte';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import { alpha, clamp, dot, label, mapper, ticks, type VizTheme } from '#lib/viz/canvas.ts';
	import type { SceneProps } from '../types.ts';
	import { local } from '#lib/i18n/index.svelte.ts';
	import Legend from '../_classifiers/Legend.svelte';
	import {
		arrow,
		axisNames,
		classColor,
		grid,
		levelLine,
		marker,
		pill,
		plotMapper,
		query,
		sampleGrid,
		shade,
		type Mapper
	} from '../_classifiers/plot.ts';
	import * as lr from './logistic.ts';
	import {
		C_STEPS,
		START,
		accuracyOf,
		best,
		confusionOf,
		converged,
		data,
		fitNow,
		lossOf,
		model,
		resetTraining,
		setC,
		setDataset,
		train,
		worstPoint,
		type Dataset,
		type LogState
	} from './state.ts';

	let { s = $bindable(), step }: SceneProps<LogState> = $props();

	const L = local({
		en: {
			loss: 'loss',
			dragProbe: 'drag the ◆ probe',
			scoreZ: 'score z',
			logLoss: 'log-loss',
			stepN: 'step {n}',
			bestPossible: 'best possible {v}',
			accuracy: 'accuracy',
			bMissed: 'B missed',
			falseAlarms: 'false alarms',
			probe: 'probe',
			decisionLine: 'decision line (p = t)',
			boundary: 'boundary (z = 0)',
			contours: 'probability contours',
			ringLoss: 'ring size = point loss',
			misclassified: 'misclassified',
			plotLabel: 'Scatter plot of two classes with the logistic regression boundary and probability shading',
			sigmoidLabel: 'Sigmoid curve with each training point placed at its score',
			lossLabel: 'Log-loss after each gradient descent step',
			step: 'Step',
			pause: '❚❚ Pause',
			run: '▶ Run',
			poorStart: '↺ Poor start',
			bestFit: 'Jump to best fit',
			threshold: 'threshold t',
			cSlider: 'C (inverse regularization)',
			dataset: 'Dataset',
			overlap: 'Overlapping',
			clear: 'Separable',
			moons: 'Moons'
		},
		fr: {
			loss: 'perte',
			dragProbe: 'faites glisser la sonde ◆',
			scoreZ: 'score z',
			logLoss: 'log-loss',
			stepN: 'pas {n}',
			bestPossible: 'meilleur possible {v}',
			accuracy: 'exactitude',
			bMissed: 'B manqués',
			falseAlarms: 'fausses alertes',
			probe: 'sonde',
			decisionLine: 'droite de décision (p = t)',
			boundary: 'frontière (z = 0)',
			contours: 'courbes de probabilité',
			ringLoss: 'taille de l’anneau = perte du point',
			misclassified: 'mal classé',
			plotLabel: 'Nuage de points de deux classes avec la frontière de la régression logistique et l’ombrage des probabilités',
			sigmoidLabel: 'Courbe sigmoïde avec chaque point d’entraînement placé selon son score',
			lossLabel: 'Log-loss après chaque pas de descente de gradient',
			step: 'Pas',
			pause: '❚❚ Pause',
			run: '▶ Lancer',
			poorStart: '↺ Mauvais départ',
			bestFit: 'Aller au meilleur ajustement',
			threshold: 'seuil t',
			cSlider: 'C (régularisation inverse)',
			dataset: 'Jeu de données',
			overlap: 'Chevauchement',
			clear: 'Séparable',
			moons: 'Lunes'
		},
		ar: {
			loss: 'الخسارة',
			dragProbe: 'اسحب المسبار ◆',
			scoreZ: 'الدرجة z',
			logLoss: 'الخسارة اللوغاريتمية',
			stepN: 'الخطوة {n}',
			bestPossible: 'أفضل قيمة ممكنة {v}',
			accuracy: 'الدقة',
			bMissed: 'B فائتة',
			falseAlarms: 'إنذارات كاذبة',
			probe: 'المسبار',
			decisionLine: 'خط القرار (p = t)',
			boundary: 'الحد (z = 0)',
			contours: 'خطوط تساوي الاحتمال',
			ringLoss: 'حجم الحلقة = خسارة النقطة',
			misclassified: 'مصنّفة خطأً',
			plotLabel: 'مخطط انتشار لفئتين مع حد الانحدار اللوجستي وتظليل الاحتمالات',
			sigmoidLabel: 'منحنى الدالة السينية مع وضع كل نقطة تدريب عند درجتها',
			lossLabel: 'الخسارة اللوغاريتمية بعد كل خطوة من الانحدار التدرجي',
			step: 'خطوة',
			pause: '❚❚ إيقاف مؤقت',
			run: '▶ تشغيل',
			poorStart: '↺ بداية سيئة',
			bestFit: 'انتقل إلى أفضل ملاءمة',
			threshold: 'العتبة t',
			cSlider: 'C (مقلوب التنظيم)',
			dataset: 'مجموعة البيانات',
			overlap: 'متداخلة',
			clear: 'قابلة للفصل',
			moons: 'أهلّة'
		}
	});

	const f2 = (v: number) => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2);
	const LEVELS = [0.1, 0.25, 0.75, 0.9];

	/* ---- autoplay training ---- */
	let playing = $state(false);
	let timer: ReturnType<typeof setInterval> | undefined;
	function play() {
		if (playing) return stop();
		if (converged(s)) resetTraining(s, START);
		playing = true;
		timer = setInterval(() => {
			if (!train(s, 3)) stop();
		}, 40);
	}
	function stop() {
		playing = false;
		clearInterval(timer);
	}
	$effect(() => {
		step;
		return stop;
	});
	onDestroy(stop);

	/* ---- probe dragging ---- */
	let dragging = $state(false);
	let startSign = 0;
	let map: Mapper | null = null;
	function placeProbe(p: { x: number; y: number }) {
		if (!map) return;
		s.probe = [clamp(map.invX(p.x), -1.6, 1.6), clamp(map.invY(p.y), -1.6, 1.6)];
		const sign = Math.sign(lr.score(model(s), s.probe));
		if (sign && startSign && sign !== startSign) s.did.flip = true;
	}
	function down(p: { x: number; y: number }) {
		if (!s.ui.probe) return;
		dragging = true;
		startSign = Math.sign(lr.score(model(s), s.probe)) || 1;
		placeProbe(p);
	}
	function move(p: { x: number; y: number }) {
		if (dragging) placeProbe(p);
	}
	function up() {
		dragging = false;
	}

	/* ---- main plot ---- */
	const linearLevel = (ctx: CanvasRenderingContext2D, m: Mapper, w: number, h: number, mm: lr.Model, z: number, stroke: string, lw: number, dash: number[] = []) =>
		levelLine(ctx, m, w, h, mm.w, mm.b, z, stroke, lw, dash);

	function draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const m = plotMapper(w, h);
		map = m;
		const mm = model(s);
		const d = data(s);
		grid(ctx, m, w, h, t);

		const key = `lr|${mm.w[0]}|${mm.w[1]}|${mm.b}`;
		if (s.show.regions) {
			const g = sampleGrid(key, m, w, h, 6, (x, y) => lr.score(mm, [x, y]));
			shade(ctx, g, t, lr.sigmoid, 0.3);
		} else if (s.show.sides) {
			const g = sampleGrid(key, m, w, h, 6, (x, y) => lr.score(mm, [x, y]));
			shade(ctx, g, t, (z) => (z > 0 ? 1 : 0), 0.13);
		}

		// probability contours
		if (s.show.contours) {
			for (const p of LEVELS) {
				const c = linearLevel(ctx, m, w, h, mm, lr.logit(p), alpha(t.text2, 0.55), 1, [4, 4]);
				if (c) {
					const lx = c.x0 + (c.x1 - c.x0) * 0.1;
					const ly = c.y0 + (c.y1 - c.y0) * 0.1;
					label(ctx, t, String(p), lx + 4, ly - 7, { color: t.text3, size: 10, weight: 600 });
				}
			}
		}

		// decision line(s)
		const thrZ = lr.logit(s.threshold);
		if (s.show.confusion && Math.abs(s.threshold - 0.5) > 1e-9) linearLevel(ctx, m, w, h, mm, 0, alpha(t.text, 0.35), 1.5, [2, 4]);
		const line = linearLevel(ctx, m, w, h, mm, s.show.confusion ? thrZ : 0, t.text, 2.25);
		if (line && s.show.confusion) {
			const lx = line.x0 + (line.x1 - line.x0) * 0.85;
			const ly = line.y0 + (line.y1 - line.y0) * 0.85;
			pill(ctx, t, `p = ${f2(s.threshold)}`, lx + 8, ly, { align: lx > w - 90 ? 'right' : 'left' });
		}

		// w arrow from the foot of the perpendicular through the plot centre
		if (s.show.normal) {
			const n2 = mm.w[0] ** 2 + mm.w[1] ** 2;
			if (n2 > 1e-9) {
				const k = -lr.score(mm, [0, 0]) / n2;
				const fx = k * mm.w[0];
				const fy = k * mm.w[1];
				const len = 0.32 / Math.sqrt(n2);
				const x0 = m.x(fx);
				const y0 = m.y(fy);
				const x1 = m.x(fx + mm.w[0] * len);
				const y1 = m.y(fy + mm.w[1] * len);
				if (x0 > 0 && x0 < w && y0 > 0 && y0 < h) {
					arrow(ctx, x0, y0, x1, y1, t.accent, 2.5);
					dot(ctx, x0, y0, 3, t.accent);
					label(ctx, t, 'w', x1 + (x1 - x0) * 0.25, y1 + (y1 - y0) * 0.25, { color: t.accent, size: 13, weight: 700, align: 'center' });
				}
			}
		}

		// loss rings
		const worst = s.show.rings ? worstPoint(s) : null;
		if (s.show.rings) {
			d.X.forEach((p, i) => {
				const l = lr.pointLoss(mm, p, d.y[i]);
				ctx.strokeStyle = alpha(t.text, 0.25 + Math.min(0.5, l * 0.2));
				ctx.lineWidth = 1.25;
				ctx.beginPath();
				ctx.arc(m.x(p[0]), m.y(p[1]), 5 + l * 7, 0, Math.PI * 2);
				ctx.stroke();
			});
		}

		// points
		d.X.forEach((p, i) => {
			const c = d.y[i];
			const wrong = s.show.confusion && lr.predict(mm, p, s.threshold) !== c;
			marker(ctx, m.x(p[0]), m.y(p[1]), c, 4, alpha(classColor(t, c), 0.92), wrong ? t.text : t.bg, wrong ? 2 : 1.5);
		});

		if (worst) {
			const p = d.X[worst.i];
			const x = m.x(p[0]);
			const y = m.y(p[1]);
			const text = `p = ${f2(worst.p)} → ${L('loss')} ${f2(worst.loss)}`;
			pill(ctx, t, text, x + (x > w / 2 ? -14 : 14), clamp(y - 24, 16, h - 16), { align: x > w / 2 ? 'right' : 'left' });
		}

		// probe
		if (s.show.probe) {
			const x = m.x(s.probe[0]);
			const y = m.y(s.probe[1]);
			const z = lr.score(mm, s.probe);
			query(ctx, x, y, 8, t.bg, t.text);
			const text = s.show.sigmoid ? `z = ${f2(z)} → p = ${f2(lr.sigmoid(z))}` : `z = ${f2(z)}`;
			const right = x < w - 150;
			pill(ctx, t, text, x + (right ? 14 : -14), clamp(y - 18, 14, h - 14), { align: right ? 'left' : 'right' });
		}

		if (s.ui.probe && s.show.sides && !s.did.flip && !dragging) {
			pill(ctx, t, L('dragProbe'), w - 14, h - 34, { align: 'right', color: t.text2 });
		}
		axisNames(ctx, w, h, t);
	}

	/* ---- sigmoid chart ---- */
	const ZMAX = 8;
	function drawSigmoid(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const box = { x: 34, y: 14, w: w - 48, h: h - 40 };
		const m = mapper(box, [-ZMAX, ZMAX], [0, 1]);
		const mm = model(s);
		const d = data(s);
		ctx.lineWidth = 1;
		for (const v of [0, 0.5, 1]) {
			ctx.strokeStyle = t.grid;
			ctx.beginPath();
			ctx.moveTo(box.x, m.y(v));
			ctx.lineTo(box.x + box.w, m.y(v));
			ctx.stroke();
			label(ctx, t, String(v), box.x - 6, m.y(v), { align: 'right', color: t.text3, size: 10 });
		}
		for (const v of ticks(-ZMAX, ZMAX, 8)) label(ctx, t, String(v), m.x(v), box.y + box.h + 11, { align: 'center', color: t.text3, size: 10 });
		label(ctx, t, L('scoreZ'), box.x + box.w, box.y + box.h + 22, { align: 'right', color: t.text3, size: 10 });
		label(ctx, t, 'P(B) = σ(z)', box.x + 4, 3, { color: t.text3, size: 10, base: 'top' });
		ctx.strokeStyle = t.axis;
		ctx.beginPath();
		ctx.moveTo(m.x(0), box.y);
		ctx.lineTo(m.x(0), box.y + box.h);
		ctx.stroke();

		// threshold
		if (s.show.confusion) {
			ctx.strokeStyle = t.text;
			ctx.setLineDash([4, 3]);
			ctx.beginPath();
			ctx.moveTo(box.x, m.y(s.threshold));
			ctx.lineTo(box.x + box.w, m.y(s.threshold));
			ctx.stroke();
			ctx.setLineDash([]);
			label(ctx, t, `t = ${f2(s.threshold)}`, box.x + box.w - 2, m.y(s.threshold) - 7, { align: 'right', color: t.text, size: 10, weight: 600 });
		}

		ctx.strokeStyle = t.accent;
		ctx.lineWidth = 2;
		ctx.beginPath();
		for (let i = 0; i <= 120; i++) {
			const z = -ZMAX + (2 * ZMAX * i) / 120;
			if (i) ctx.lineTo(m.x(z), m.y(lr.sigmoid(z)));
			else ctx.moveTo(m.x(z), m.y(lr.sigmoid(z)));
		}
		ctx.stroke();

		d.X.forEach((p, i) => {
			const z = clamp(lr.score(mm, p), -ZMAX, ZMAX);
			const c = d.y[i];
			marker(ctx, m.x(z), m.y(lr.sigmoid(z)), c, 3.4, alpha(classColor(t, c), 0.75), t.bg, 1);
		});

		if (s.show.probe) {
			const z = clamp(lr.score(mm, s.probe), -ZMAX, ZMAX);
			const x = m.x(z);
			const y = m.y(lr.sigmoid(z));
			ctx.strokeStyle = alpha(t.text, 0.5);
			ctx.setLineDash([3, 3]);
			ctx.beginPath();
			ctx.moveTo(x, box.y + box.h);
			ctx.lineTo(x, y);
			ctx.lineTo(box.x, y);
			ctx.stroke();
			ctx.setLineDash([]);
			query(ctx, x, y, 6, t.bg, t.text);
		}
	}

	/* ---- loss chart ---- */
	function drawLoss(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const box = { x: 40, y: 16, w: w - 56, h: h - 40 };
		const hist = s.history;
		const n = Math.max(hist.length - 1, 50);
		const floor = lr.loss(best(s.dataset, s.C), data(s), s.C);
		const top = Math.max(1, ...hist.slice(0, 1)) * 1.05;
		const m = mapper(box, [0, n], [0, top]);
		for (const v of ticks(0, top, 3)) {
			ctx.strokeStyle = t.grid;
			ctx.beginPath();
			ctx.moveTo(box.x, m.y(v));
			ctx.lineTo(box.x + box.w, m.y(v));
			ctx.stroke();
			label(ctx, t, v.toFixed(1), box.x - 6, m.y(v), { align: 'right', color: t.text3, size: 10 });
		}
		label(ctx, t, L('logLoss'), box.x + 4, 3, { color: t.text3, size: 10, base: 'top' });
		label(ctx, t, L('stepN', { n: s.iter }), box.x + box.w, box.y + box.h + 12, { align: 'right', color: t.text3, size: 10 });
		ctx.strokeStyle = t.text3;
		ctx.setLineDash([4, 4]);
		ctx.beginPath();
		ctx.moveTo(box.x, m.y(floor));
		ctx.lineTo(box.x + box.w, m.y(floor));
		ctx.stroke();
		ctx.setLineDash([]);
		label(ctx, t, L('bestPossible', { v: f2(floor) }), box.x + box.w, m.y(floor) - 7, { align: 'right', color: t.text3, size: 10 });
		if (!hist.length) return;
		ctx.strokeStyle = t.accent;
		ctx.lineWidth = 2;
		ctx.beginPath();
		hist.forEach((v, i) => (i ? ctx.lineTo(m.x(i), m.y(v)) : ctx.moveTo(m.x(i), m.y(v))));
		ctx.stroke();
		dot(ctx, m.x(hist.length - 1), m.y(hist[hist.length - 1]), 4, t.accent, t.bg, 1.5);
	}

	/* ---- readouts ---- */
	const readouts = $derived.by(() => {
		const items: { label: string; value: string; highlight?: boolean }[] = [
			{ label: 'w₁', value: f2(s.model.w[0]) },
			{ label: 'w₂', value: f2(s.model.w[1]) },
			{ label: 'b', value: f2(s.model.b) }
		];
		if (s.ui.C) items.push({ label: 'C', value: String(s.C) }, { label: '‖w‖', value: f2(Math.hypot(s.model.w[0], s.model.w[1])) });
		if (s.show.regions || s.ui.weights) items.push({ label: L('accuracy'), value: `${Math.round(accuracyOf(s) * 100)}%`, highlight: s.ui.weights && accuracyOf(s) >= 0.8 });
		if (s.show.rings || s.show.loss || s.ui.C) items.push({ label: L('logLoss'), value: f2(lossOf(s)), highlight: s.show.loss && converged(s) });
		if (s.show.confusion) {
			const c = confusionOf(s);
			items.push({ label: L('bMissed'), value: String(c.fn), highlight: c.fn === 0 }, { label: L('falseAlarms'), value: String(c.fp) });
		}
		return items;
	});

	const cIdx = $derived(Math.max(0, C_STEPS.indexOf(s.C)));
	const extras = $derived.by(() => {
		const e: { kind: 'ring' | 'line' | 'dash' | 'query'; text: string }[] = [];
		if (s.show.probe) e.push({ kind: 'query', text: L('probe') });
		e.push({ kind: 'line', text: s.show.confusion ? L('decisionLine') : L('boundary') });
		if (s.show.contours) e.push({ kind: 'dash', text: L('contours') });
		if (s.show.rings) e.push({ kind: 'ring', text: L('ringLoss') });
		else if (s.show.confusion) e.push({ kind: 'ring', text: L('misclassified') });
		return e;
	});
	const anyUi = $derived(s.ui.weights || s.ui.train || s.ui.threshold || s.ui.C || s.ui.dataset);
</script>

<div class="scene">
	<Canvas
		{draw}
		aspect={0.72}
		minHeight={280}
		maxHeight={440}
		label={L('plotLabel')}
		cursor={s.ui.probe ? (dragging ? 'grabbing' : 'crosshair') : 'default'}
		onpointerdown={down}
		onpointermove={move}
		onpointerup={up}
	/>
	<Legend extra={extras} />

	<Readouts items={readouts} />

	{#if s.show.sigmoid}
		<div class="chart">
			<Canvas draw={drawSigmoid} aspect={0.3} minHeight={140} maxHeight={170} label={L('sigmoidLabel')} />
		</div>
	{/if}

	{#if s.show.loss}
		<div class="chart">
			<Canvas draw={drawLoss} aspect={0.26} minHeight={120} maxHeight={150} label={L('lossLabel')} />
		</div>
	{/if}

	{#if anyUi}
		<div class="controls">
			{#if s.ui.train}
				<div class="buttons">
					<button class="btn btn-sm" onclick={() => (stop(), train(s, 1))} disabled={converged(s)}>{L('step')}</button>
					<button class="btn btn-sm btn-primary" onclick={play}>{playing ? L('pause') : L('run')}</button>
					<button class="btn btn-sm" onclick={() => (stop(), resetTraining(s, START))}>{L('poorStart')}</button>
					{#if s.ui.dataset}
						<button class="btn btn-sm" onclick={() => (stop(), fitNow(s), (s.history = [lossOf(s)]), (s.iter = 0))}>{L('bestFit')}</button>
					{/if}
				</div>
			{/if}
			{#if s.ui.weights}
				<div class="sliders">
					<Slider label="w₁" bind:value={s.model.w[0]} min={-12} max={12} step={0.1} format={f2} oninput={() => (stop(), (s.did.weights = true))} />
					<Slider label="w₂" bind:value={s.model.w[1]} min={-12} max={12} step={0.1} format={f2} oninput={() => (stop(), (s.did.weights = true))} />
					<Slider label="b" bind:value={s.model.b} min={-3} max={3} step={0.05} format={f2} oninput={() => (stop(), (s.did.weights = true))} />
				</div>
			{/if}
			{#if s.ui.threshold}
				<Slider label={L('threshold')} bind:value={s.threshold} min={0.01} max={0.99} step={0.01} format={f2} />
			{/if}
			{#if s.ui.C}
				<Slider label={L('cSlider')} value={cIdx} min={0} max={C_STEPS.length - 1} format={(i) => String(C_STEPS[i])} oninput={(i) => (stop(), setC(s, C_STEPS[i]))} />
			{/if}
			{#if s.ui.dataset}
				<Segmented
					label={L('dataset')}
					bind:value={s.dataset}
					options={[
						{ value: 'overlap', label: L('overlap') },
						{ value: 'clear', label: L('clear') },
						{ value: 'moons', label: L('moons') }
					] as { value: Dataset; label: string }[]}
					onchange={(d) => (stop(), setDataset(s, d))}
				/>
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
	.sliders {
		display: flex;
		flex-wrap: wrap;
		gap: 14px 20px;
		flex: 1 1 100%;
	}
</style>
