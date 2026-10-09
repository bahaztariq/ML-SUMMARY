<script lang="ts">
	import Canvas from '#lib/viz/Canvas.svelte';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import { alpha, clamp, label, mapper, mulberry32, type VizTheme } from '#lib/viz/canvas.ts';
	import type { SceneProps } from '../types.ts';
	import { local } from '#lib/i18n/index.svelte.ts';
	import Legend from '../_classifiers/Legend.svelte';
	import {
		axisNames,
		classColor,
		contour,
		grid,
		hitPoint,
		levelLine,
		marker,
		paint,
		pill,
		plotMapper,
		rgb,
		sampleGrid,
		shade,
		type Mapper
	} from '../_classifiers/plot.ts';
	import { ptsKey } from '../_classifiers/data.ts';
	import * as svm from './svm.ts';
	import {
		CANDIDATES,
		C_STEPS,
		GAMMA_STEPS,
		TEST,
		fit,
		lineMargin,
		roleCounts,
		setC,
		setData,
		setGamma,
		testAcc,
		trainAcc,
		type Dataset,
		type KernelName,
		type SvmState
	} from './state.ts';

	let { s = $bindable(), step }: SceneProps<SvmState> = $props();

	const L = local({
		en: {
			thrCorrect: 'threshold: {pct} correct',
			margin: '{i}: margin {v}',
			lineN: 'line {i}',
			dragAny: 'drag any point',
			lift: 'x₃ = x₁² + x₂²  (squared distance from the center)',
			lineErrors: 'line {i} errors',
			kernel: 'kernel',
			linear: 'linear',
			width: 'width 2/‖w‖',
			sv: 'support vectors',
			violations: 'violations',
			trainAcc: 'train acc',
			testAcc: 'test acc',
			boundary: 'boundary f = 0',
			street: 'street (|f| < 1)',
			svOne: 'support vector',
			testNote: 'small faded markers: {n} test points',
			plotLabel: 'Scatter plot of two classes with the SVM boundary, margin street and support vectors',
			liftLabel: 'Points placed by their squared distance from the center, separated by one threshold',
			cSlider: 'C (violation cost)',
			gSlider: 'γ (kernel reach)',
			kernelSeg: 'Kernel',
			linearOpt: 'Linear',
			dataset: 'Dataset',
			separable: 'Separable',
			overlap: 'Overlap',
			circles: 'Circles',
			moons: 'Moons',
			showTest: 'Show test points',
			hideTest: 'Hide test points',
			reset: '↺ Reset points'
		},
		fr: {
			thrCorrect: 'seuil : {pct} de bonnes réponses',
			margin: '{i} : marge {v}',
			lineN: 'droite {i}',
			dragAny: 'faites glisser un point',
			lift: 'x₃ = x₁² + x₂²  (distance au centre, au carré)',
			lineErrors: 'erreurs droite {i}',
			kernel: 'noyau',
			linear: 'linéaire',
			width: 'largeur 2/‖w‖',
			sv: 'vecteurs de support',
			violations: 'violations',
			trainAcc: 'exactitude entr.',
			testAcc: 'exactitude test',
			boundary: 'frontière f = 0',
			street: 'rue (|f| < 1)',
			svOne: 'vecteur de support',
			testNote: 'petits marqueurs pâles : {n} points de test',
			plotLabel: 'Nuage de points de deux classes avec la frontière du SVM, la rue de la marge et les vecteurs de support',
			liftLabel: 'Points placés selon le carré de leur distance au centre, séparés par un seul seuil',
			cSlider: 'C (coût d’une violation)',
			gSlider: 'γ (portée du noyau)',
			kernelSeg: 'Noyau',
			linearOpt: 'Linéaire',
			dataset: 'Jeu de données',
			separable: 'Séparable',
			overlap: 'Chevauchement',
			circles: 'Cercles',
			moons: 'Lunes',
			showTest: 'Afficher les points de test',
			hideTest: 'Masquer les points de test',
			reset: '↺ Réinitialiser les points'
		},
		ar: {
			thrCorrect: 'العتبة: {pct} صحيحة',
			margin: '{i}: الهامش {v}',
			lineN: 'الخط {i}',
			dragAny: 'اسحب أي نقطة',
			lift: 'x₃ = x₁² + x₂²  (مربع المسافة عن المركز)',
			lineErrors: 'أخطاء الخط {i}',
			kernel: 'النواة',
			linear: 'خطية',
			width: 'العرض 2/‖w‖',
			sv: 'متجهات الدعم',
			violations: 'الانتهاكات',
			trainAcc: 'دقة التدريب',
			testAcc: 'دقة الاختبار',
			boundary: 'الحد f = 0',
			street: 'الشارع (|f| < 1)',
			svOne: 'متجه دعم',
			testNote: 'العلامات الباهتة الصغيرة: {n} نقطة اختبار',
			plotLabel: 'مخطط انتشار لفئتين مع حد SVM وشارع الهامش ومتجهات الدعم',
			liftLabel: 'نقاط موضوعة حسب مربع مسافتها عن المركز، تفصل بينها عتبة واحدة',
			cSlider: 'C (تكلفة الانتهاك)',
			gSlider: 'γ (مدى النواة)',
			kernelSeg: 'النواة',
			linearOpt: 'خطية',
			dataset: 'مجموعة البيانات',
			separable: 'قابلة للفصل',
			overlap: 'متداخلة',
			circles: 'دوائر',
			moons: 'أهلّة',
			showTest: 'إظهار نقاط الاختبار',
			hideTest: 'إخفاء نقاط الاختبار',
			reset: '↺ إعادة النقاط'
		}
	});

	const pct = (v: number) => `${Math.round(v * 100)}%`;
	const model = $derived(fit(s));

	/* ---- dragging points ---- */
	let dragging = $state(-1);
	let hover = $state(-1);
	let wasSV = false;
	let moved = 0;
	let map: Mapper | null = null;
	$effect(() => {
		step;
		dragging = -1;
		hover = -1;
	});

	function down(p: { x: number; y: number }) {
		if (!s.ui.drag || !map) return;
		dragging = hitPoint(map, s.points, p.x, p.y);
		if (dragging >= 0) {
			wasSV = model.alpha[dragging] > 1e-9;
			moved = 0;
		}
	}
	function move(p: { x: number; y: number }) {
		if (!map) return;
		if (dragging < 0) {
			hover = s.ui.drag ? hitPoint(map, s.points, p.x, p.y) : -1;
			return;
		}
		const q: [number, number] = [clamp(map.invX(p.x), -1.3, 1.3), clamp(map.invY(p.y), -1.3, 1.3)];
		const old = s.points[dragging];
		moved += Math.hypot(q[0] - old[0], q[1] - old[1]);
		s.points[dragging] = q;
		if (moved > 0.05) {
			if (wasSV) s.did.dragSV = true;
			else s.did.dragOther = true;
		}
	}
	function up() {
		dragging = -1;
	}

	/* ---- main plot ---- */
	const CAND_COLORS = (t: VizTheme) => [t.series[1], t.series[3], t.series[4]];

	function draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const m = plotMapper(w, h);
		map = m;
		const fm = model;
		grid(ctx, m, w, h, t);
		const key = `svm|${ptsKey(s.points, s.labels)}|${s.kernel}|${s.C}|${s.gamma}`;
		const linear = fm.w !== null;

		if (s.show.model) {
			const g = sampleGrid(key, m, w, h, 5, (x, y) => svm.decision(fm, [x, y]));
			if (s.show.regions || !linear) shade(ctx, g, t, (f) => 0.5 + 0.5 * Math.tanh(f), 0.28);
			else shade(ctx, g, t, (f) => (f >= 0 ? 0.75 : 0.25), 0.1);
			if (s.show.street) {
				const [r, gg, b] = rgb(t.text);
				paint(ctx, g, (f) => (Math.abs(f) < 1 ? [r, gg, b, 0.07] : [r, gg, b, 0]));
			}
			if (linear) {
				if (s.show.street) {
					levelLine(ctx, m, w, h, fm.w!, fm.b, 1, alpha(t.text, 0.6), 1.25, [5, 4]);
					levelLine(ctx, m, w, h, fm.w!, fm.b, -1, alpha(t.text, 0.6), 1.25, [5, 4]);
				}
				levelLine(ctx, m, w, h, fm.w!, fm.b, 0, t.text, 2.25);
			} else {
				if (s.show.street) {
					contour(ctx, g, 1, alpha(t.text, 0.55), 1.25, [5, 4]);
					contour(ctx, g, -1, alpha(t.text, 0.55), 1.25, [5, 4]);
				}
				contour(ctx, g, 0, t.text, 2.25);
			}
		}

		// candidate lines (opening question)
		if (s.show.candidates) {
			const cols = CAND_COLORS(t);
			CANDIDATES.forEach((l, i) => {
				const n = Math.hypot(l.w[0], l.w[1]);
				if (s.show.candidateMargins) {
					const mg = lineMargin(l, { X: s.points, y: s.labels }) * n;
					const lo = levelLine(ctx, m, w, h, l.w, l.b, -mg, alpha(cols[i], 0.7), 1, [3, 3]);
					const hi = levelLine(ctx, m, w, h, l.w, l.b, mg, alpha(cols[i], 0.7), 1, [3, 3]);
					if (lo && hi) {
						ctx.fillStyle = alpha(cols[i], 0.12);
						ctx.beginPath();
						ctx.moveTo(lo.x0, lo.y0);
						ctx.lineTo(lo.x1, lo.y1);
						ctx.lineTo(hi.x1, hi.y1);
						ctx.lineTo(hi.x0, hi.y0);
						ctx.closePath();
						ctx.fill();
					}
				}
				const c = levelLine(ctx, m, w, h, l.w, l.b, 0, cols[i], 2.5);
				if (c) {
					// line 1 labelled at its upper end, line 2 at its lower end, line 3 at its right end
					const ends: [number, number][] = [
						[c.x0, c.y0],
						[c.x1, c.y1]
					];
					const pick = i === 0 ? (c.y0 < c.y1 ? 0 : 1) : i === 1 ? (c.y0 > c.y1 ? 0 : 1) : c.x0 > c.x1 ? 0 : 1;
					const [ex, ey] = ends[pick];
					const [ox, oy] = ends[1 - pick];
					const len = Math.hypot(ex - ox, ey - oy) || 1;
					const x = ex + ((ox - ex) / len) * 40;
					const y = ey + ((oy - ey) / len) * 40;
					const txt = s.show.candidateMargins ? L('margin', { i: i + 1, v: lineMargin(l, { X: s.points, y: s.labels }).toFixed(3) }) : L('lineN', { i: i + 1 });
					pill(ctx, t, txt, clamp(x, 70, w - 70), clamp(y, 16, h - 16), { align: 'center', color: cols[i], border: cols[i] });
				}
			});
		}

		// test points
		if (s.show.test) {
			const d = TEST[s.dataset];
			d.X.forEach((p, i) => marker(ctx, m.x(p[0]), m.y(p[1]), d.y[i], 2.4, alpha(classColor(t, d.y[i]), 0.45)));
		}

		// slack segments (linear): from a violating point to its own edge of the street
		if (s.show.model && s.show.slack && linear) {
			const n2 = fm.w![0] ** 2 + fm.w![1] ** 2;
			ctx.strokeStyle = alpha(t.text, 0.7);
			ctx.lineWidth = 1.25;
			ctx.setLineDash([2, 3]);
			ctx.beginPath();
			fm.X.forEach((p, i) => {
				const f = svm.decision(fm, p);
				const yi = fm.y[i];
				if (yi * f >= 1 - 1e-6) return;
				const k = (yi - f) / n2;
				ctx.moveTo(m.x(p[0]), m.y(p[1]));
				ctx.lineTo(m.x(p[0] + k * fm.w![0]), m.y(p[1] + k * fm.w![1]));
			});
			ctx.stroke();
			ctx.setLineDash([]);
		}

		// points
		s.points.forEach((p, i) => {
			const c = s.labels[i];
			const big = i === dragging || i === hover;
			marker(ctx, m.x(p[0]), m.y(p[1]), c, big ? 5.5 : 4.2, alpha(classColor(t, c), 0.92), t.bg, 1.5);
		});

		// support-vector rings
		if (s.show.model && s.show.sv) {
			fm.sv.forEach((i) => {
				const r = svm.role(fm, i);
				const p = fm.X[i];
				ctx.strokeStyle = r === 'wrong' ? t.text : alpha(t.text, 0.85);
				ctx.lineWidth = r === 'margin' ? 2 : 1.5;
				ctx.setLineDash(r === 'margin' ? [] : [3, 2.5]);
				ctx.beginPath();
				ctx.arc(m.x(p[0]), m.y(p[1]), 9, 0, Math.PI * 2);
				ctx.stroke();
			});
			ctx.setLineDash([]);
		}

		if (s.ui.drag && dragging < 0 && hover < 0 && !(s.did.dragOther && s.did.dragSV) && step === 2) {
			pill(ctx, t, L('dragAny'), w - 14, h - 34, { align: 'right', color: t.text2 });
		}
		axisNames(ctx, w, h, t);
	}

	/* ---- lifted feature strip: x₃ = x₁² + x₂² ---- */
	const liftThreshold = $derived.by(() => {
		const r = s.points.map((p, i) => ({ r: p[0] ** 2 + p[1] ** 2, c: s.labels[i] })).sort((a, b) => a.r - b.r);
		let best = { acc: -1, thr: 0 };
		const nB = r.filter((q) => q.c === 1).length;
		let bBelow = 0;
		for (let i = 0; i <= r.length; i++) {
			// predict B below the threshold
			const acc = (bBelow + (r.length - i - (nB - bBelow))) / r.length;
			if (acc > best.acc) best = { acc, thr: i === 0 ? r[0].r - 0.01 : i === r.length ? r[i - 1].r + 0.01 : (r[i - 1].r + r[i].r) / 2 };
			if (i < r.length) {
				if (r[i].c) bBelow++;
			}
		}
		return best;
	});

	function drawLift(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const box = { x: 16, y: 18, w: w - 32, h: h - 46 };
		const max = Math.max(...s.points.map((p) => p[0] ** 2 + p[1] ** 2)) * 1.05;
		const m = mapper(box, [0, max], [0, 1]);
		const rand = mulberry32(7);
		ctx.strokeStyle = t.axis;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(box.x, box.y + box.h);
		ctx.lineTo(box.x + box.w, box.y + box.h);
		ctx.stroke();
		for (let v = 0; v <= max; v += 0.25) label(ctx, t, v.toFixed(2), m.x(v), box.y + box.h + 11, { align: 'center', color: t.text3, size: 10 });
		label(ctx, t, L('lift'), box.x, 4, { color: t.text3, size: 10, base: 'top' });
		const thr = liftThreshold;
		ctx.fillStyle = alpha(classColor(t, 1), 0.08);
		ctx.fillRect(box.x, box.y, m.x(thr.thr) - box.x, box.h);
		ctx.fillStyle = alpha(classColor(t, 0), 0.08);
		ctx.fillRect(m.x(thr.thr), box.y, box.x + box.w - m.x(thr.thr), box.h);
		s.points.forEach((p, i) => {
			const r = p[0] ** 2 + p[1] ** 2;
			marker(ctx, m.x(r), m.y(0.12 + 0.76 * rand()), s.labels[i], 3.4, alpha(classColor(t, s.labels[i]), 0.85), t.bg, 1);
		});
		ctx.strokeStyle = t.text;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(m.x(thr.thr), box.y - 2);
		ctx.lineTo(m.x(thr.thr), box.y + box.h);
		ctx.stroke();
		pill(ctx, t, L('thrCorrect', { pct: pct(thr.acc) }), Math.min(m.x(thr.thr) + 8, w - 150), box.y + 12);
	}

	/* ---- readouts ---- */
	const readouts = $derived.by(() => {
		const items: { label: string; value: string; highlight?: boolean }[] = [];
		if (s.show.candidates) {
			return CANDIDATES.map((l, i) => ({ label: L('lineErrors', { i: i + 1 }), value: '0' }));
		}
		if (!s.show.model) return items;
		const r = roleCounts(s);
		items.push({ label: L('kernel'), value: s.kernel === 'linear' ? L('linear') : `RBF γ=${s.gamma}` });
		if (s.ui.C || s.show.slack || s.ui.gamma) items.push({ label: 'C', value: String(s.C) });
		if (model.w) items.push({ label: L('width'), value: svm.marginWidth(model).toFixed(3) });
		items.push({ label: L('sv'), value: String(model.sv.length) });
		if (s.show.slack || s.ui.C) items.push({ label: L('violations'), value: String(r.inside + r.wrong) });
		items.push({ label: L('trainAcc'), value: pct(trainAcc(s)) });
		if (s.ui.C || s.ui.gamma || s.show.test) items.push({ label: L('testAcc'), value: pct(testAcc(s)), highlight: s.ui.gamma && testAcc(s) >= 0.95 });
		return items;
	});

	const extras = $derived.by(() => {
		const e: { kind: 'ring' | 'line' | 'dash' | 'band'; text: string }[] = [];
		if (s.show.model) {
			e.push({ kind: 'line', text: L('boundary') });
			if (s.show.street) e.push({ kind: 'band', text: L('street') });
			if (s.show.sv) e.push({ kind: 'ring', text: L('svOne') });
		}
		return e;
	});

	const cIdx = $derived(Math.max(0, C_STEPS.indexOf(s.C)));
	const gIdx = $derived(Math.max(0, GAMMA_STEPS.indexOf(s.gamma)));
	const anyUi = $derived(s.ui.C || s.ui.gamma || s.ui.kernel || s.ui.dataset || s.ui.reset || s.ui.view);
</script>

<div class="scene">
	<Canvas
		{draw}
		aspect={0.72}
		minHeight={280}
		maxHeight={440}
		label={L('plotLabel')}
		cursor={dragging >= 0 ? 'grabbing' : hover >= 0 ? 'grab' : 'default'}
		onpointerdown={down}
		onpointermove={move}
		onpointerup={up}
	/>
	<Legend extra={extras} note={s.show.test ? L('testNote', { n: TEST[s.dataset].X.length }) : undefined} />

	<Readouts items={readouts} />

	{#if s.show.lift}
		<div class="chart">
			<Canvas draw={drawLift} aspect={0.24} minHeight={120} maxHeight={150} label={L('liftLabel')} />
		</div>
	{/if}

	{#if anyUi}
		<div class="controls">
			{#if s.ui.C}
				<Slider label={L('cSlider')} value={cIdx} min={0} max={C_STEPS.length - 1} format={(i) => String(C_STEPS[i])} oninput={(i) => setC(s, C_STEPS[i])} />
			{/if}
			{#if s.ui.gamma}
				<Slider label={L('gSlider')} value={gIdx} min={0} max={GAMMA_STEPS.length - 1} format={(i) => String(GAMMA_STEPS[i])} oninput={(i) => setGamma(s, GAMMA_STEPS[i])} />
			{/if}
			{#if s.ui.kernel}
				<Segmented
					label={L('kernelSeg')}
					bind:value={s.kernel}
					options={[
						{ value: 'linear', label: L('linearOpt') },
						{ value: 'rbf', label: 'RBF' }
					] as { value: KernelName; label: string }[]}
				/>
			{/if}
			{#if s.ui.dataset}
				<Segmented
					label={L('dataset')}
					bind:value={s.dataset}
					options={[
						{ value: 'separable', label: L('separable') },
						{ value: 'overlap', label: L('overlap') },
						{ value: 'circles', label: L('circles') },
						{ value: 'moons', label: L('moons') }
					] as { value: Dataset; label: string }[]}
					onchange={(d) => setData(s, d)}
				/>
			{/if}
			{#if s.ui.reset || s.ui.view}
				<div class="buttons">
					{#if s.ui.view}
						<button class="btn btn-sm" aria-pressed={s.show.test} onclick={() => (s.show.test = !s.show.test)}>{s.show.test ? L('hideTest') : L('showTest')}</button>
					{/if}
					{#if s.ui.reset}
						<button class="btn btn-sm" onclick={() => setData(s, s.dataset)}>{L('reset')}</button>
					{/if}
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
