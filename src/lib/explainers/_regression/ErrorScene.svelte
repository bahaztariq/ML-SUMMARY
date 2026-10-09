<!--
  Scene shared by the RMSE and MAE lessons: ten flats scored against a fixed model (or a constant),
  with a per-flat error chart underneath.
-->
<script lang="ts">
	import Canvas from '#lib/viz/Canvas.svelte';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import { alpha, clamp, dot, fmt, label, mapper, ticks, type VizTheme } from '#lib/viz/canvas.ts';
	import { local } from '#lib/i18n/index.svelte.ts';
	import * as rg from './regression.ts';
	import { axes, clip, curve, euro, nearestPoint, points, residualLines, squares, tag, type Plot } from './plot.ts';
	import {
		OUT,
		OUTLIER_MAX,
		X_DOM,
		Y_DOM,
		mean,
		median,
		metrics,
		moveRent,
		preds,
		resetRents,
		setC,
		setOutlier,
		type Bars,
		type ErrState
	} from './errors.ts';

	let { s = $bindable() }: { s: ErrState } = $props();

	const L = local({
		en: {
			size: 'size (m²) →',
			rent: 'rent (€ / month)',
			constant: 'constant',
			model: 'model',
			band: '±RMSE band (±{v})',
			residual: 'residual {v}',
			dragFlat: 'drag any flat up or down ↕',
			dragLine: 'drag the green line ↕',
			titleResidual: 'residual y − ŷ per flat (€)',
			titleAbs: 'absolute error |y − ŷ| per flat (€)',
			titleSquared: 'squared error (y − ŷ)² per flat (€²)',
			bySize: ', labelled by size in m²',
			average: 'average',
			shareAbs: 'share of total |error|  (MAE)',
			shareSq: 'share of total error²  (MSE, RMSE)',
			colOutlier: 'coloured = the outlier flat',
			colBiggest: 'coloured = the flat with the biggest error',
			constC: 'constant prediction c →',
			error: 'error (€)',
			median: 'median',
			mean: 'mean',
			meanResidual: 'mean residual',
			biggestShare: 'biggest flat’s share of error²',
			scatterLabel: "Ten flats: size against rent, with the model's predictions and residuals",
			barsLabel: 'Bar chart of the error for each flat',
			shareLabel: "Each flat's share of the total absolute and squared error",
			curvesLabel: 'MAE and RMSE of a constant prediction c, for every c',
			prediction: 'Prediction',
			modelLine: 'Model line',
			oneConstant: 'One constant',
			chart: 'Chart',
			residuals: 'Residuals',
			errors: '|errors|',
			squared: 'Squared',
			shares: 'Shares',
			outlier: "Outlier: the {x} m² flat's rent +",
			resetRents: '↺ Reset rents'
		},
		fr: {
			size: 'surface (m²) →',
			rent: 'loyer (€ / mois)',
			constant: 'constante',
			model: 'modèle',
			band: 'bande ±RMSE (±{v})',
			residual: 'résidu {v}',
			dragFlat: 'glissez un appartement vers le haut ou le bas ↕',
			dragLine: 'glissez la ligne verte ↕',
			titleResidual: 'résidu y − ŷ par appartement (€)',
			titleAbs: 'erreur absolue |y − ŷ| par appartement (€)',
			titleSquared: 'erreur au carré (y − ŷ)² par appartement (€²)',
			bySize: ', étiqueté par surface en m²',
			average: 'moyenne',
			shareAbs: 'part du total des |erreurs|  (MAE)',
			shareSq: 'part du total des erreurs²  (MSE, RMSE)',
			colOutlier: 'en couleur = l’appartement aberrant',
			colBiggest: 'en couleur = l’appartement avec la plus grosse erreur',
			constC: 'prédiction constante c →',
			error: 'erreur (€)',
			median: 'médiane',
			mean: 'moyenne',
			meanResidual: 'résidu moyen',
			biggestShare: 'part de l’erreur² du pire appart.',
			scatterLabel: 'Dix appartements : surface contre loyer, avec les prédictions du modèle et les résidus',
			barsLabel: 'Diagramme en barres de l’erreur de chaque appartement',
			shareLabel: 'Part de chaque appartement dans l’erreur absolue totale et l’erreur au carré totale',
			curvesLabel: 'MAE et RMSE d’une prédiction constante c, pour chaque c',
			prediction: 'Prédiction',
			modelLine: 'Droite du modèle',
			oneConstant: 'Une constante',
			chart: 'Graphique',
			residuals: 'Résidus',
			errors: '|erreurs|',
			squared: 'Carrés',
			shares: 'Parts',
			outlier: 'Aberrant : loyer de l’appart. de {x} m² +',
			resetRents: '↺ Réinitialiser les loyers'
		},
		ar: {
			size: 'المساحة (m²) →',
			rent: 'الإيجار (€ / شهر)',
			constant: 'ثابت',
			model: 'النموذج',
			band: 'نطاق ±RMSE (±{v})',
			residual: 'الباقي {v}',
			dragFlat: 'اسحب أي شقة لأعلى أو لأسفل ↕',
			dragLine: 'اسحب الخط الأخضر ↕',
			titleResidual: 'الباقي y − ŷ لكل شقة (€)',
			titleAbs: 'الخطأ المطلق |y − ŷ| لكل شقة (€)',
			titleSquared: 'مربع الخطأ (y − ŷ)² لكل شقة (€²)',
			bySize: '، مُعنوَن بالمساحة m²',
			average: 'المتوسط',
			shareAbs: 'الحصة من مجموع |الخطأ|  (MAE)',
			shareSq: 'الحصة من مجموع الخطأ²  (MSE، RMSE)',
			colOutlier: 'الملوّن = الشقة الشاذة',
			colBiggest: 'الملوّن = الشقة ذات الخطأ الأكبر',
			constC: 'تنبؤ ثابت c →',
			error: 'الخطأ (€)',
			median: 'الوسيط',
			mean: 'المتوسط',
			meanResidual: 'متوسط البواقي',
			biggestShare: 'حصة أكبر شقة من الخطأ²',
			scatterLabel: 'عشر شقق: المساحة مقابل الإيجار، مع تنبؤات النموذج والبواقي',
			barsLabel: 'مخطط أعمدة لخطأ كل شقة',
			shareLabel: 'حصة كل شقة من مجموع الخطأ المطلق ومجموع مربعات الخطأ',
			curvesLabel: 'MAE وRMSE لتنبؤ ثابت c، لكل قيمة c',
			prediction: 'التنبؤ',
			modelLine: 'خط النموذج',
			oneConstant: 'ثابت واحد',
			chart: 'المخطط',
			residuals: 'البواقي',
			errors: '|الأخطاء|',
			squared: 'المربعات',
			shares: 'الحصص',
			outlier: 'قيمة شاذة: إيجار شقة {x} m² +',
			resetRents: '↺ إعادة الإيجارات'
		}
	});

	const big = (v: number) => (Number.isFinite(v) ? Math.round(v).toLocaleString('en-US') : '—');
	const signedEuro = (v: number) => `${v < 0 ? '−' : v > 0 ? '+' : ''}€${Math.abs(Math.round(v)).toLocaleString('en-US')}`;
	const pct = (v: number) => `${Math.round(v * 100)}%`;

	const M = $derived(metrics(s));

	const isConst = $derived(s.mode === 'constant');

	/* ------------------------------------------------------------ scatter */
	let plot: Plot | null = null;
	let drag = $state<{ kind: 'point' | 'c'; i: number } | null>(null);
	let hover = $state<{ kind: 'point' | 'c'; i: number } | null>(null);

	/* The rent axis grows to make room for an outlier, but never while something is being dragged. */
	const wantTop = $derived(s.ui.outlier || s.outlier > 0 || s.mode === 'constant' || Math.max(...s.ys) > 1600 ? Y_DOM[1] : 1700);
	let frozenTop = $state(1700);
	const yDom = $derived<[number, number]>([Y_DOM[0], drag ? frozenTop : wantTop]);

	function hit(p: { x: number; y: number }) {
		if (!plot) return null;
		if (s.ui.drag) {
			const i = nearestPoint(plot, s.xs, s.ys, p.x, p.y, 15);
			if (i >= 0) return { kind: 'point' as const, i };
		}
		if (s.ui.dragC && isConst && Math.abs(plot.m.y(s.c) - p.y) < 12) return { kind: 'c' as const, i: -1 };
		return null;
	}
	function down(p: { x: number; y: number }) {
		frozenTop = wantTop;
		drag = hit(p);
	}
	function move(p: { x: number; y: number }) {
		if (!drag) {
			hover = hit(p);
			return;
		}
		if (!plot) return;
		const y = Math.round(clamp(plot.m.invY(p.y), yDom[0] + 20, yDom[1] - 20) / 5) * 5;
		if (drag.kind === 'point') {
			moveRent(s, drag.i, y);
			s.did.drag = true;
		} else {
			setC(s, y);
			s.did.dragC = true;
		}
	}
	function up() {
		drag = null;
	}

	function drawScatter(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const p = axes(ctx, w, h, t, {
			xDom: X_DOM,
			yDom,
			xLabel: L('size'),
			yLabel: L('rent'),
			yFmt: (v) => (v >= 1000 ? `€${v / 1000}k` : `€${v}`),
			pad: { left: 48, top: 26 }
		});
		plot = p;
		const pr = preds(s);
		const f = (x: number) => (isConst ? s.c : rg.lineAt(s.model, x));
		clip(ctx, p.box);
		if (s.show.band && !isConst) {
			const r = M.rmse;
			ctx.fillStyle = alpha(t.series[0], 0.08);
			ctx.beginPath();
			ctx.moveTo(p.m.x(X_DOM[0]), p.m.y(f(X_DOM[0]) + r));
			ctx.lineTo(p.m.x(X_DOM[1]), p.m.y(f(X_DOM[1]) + r));
			ctx.lineTo(p.m.x(X_DOM[1]), p.m.y(f(X_DOM[1]) - r));
			ctx.lineTo(p.m.x(X_DOM[0]), p.m.y(f(X_DOM[0]) - r));
			ctx.closePath();
			ctx.fill();
			curve(ctx, p, (x) => f(x) + r, alpha(t.series[0], 0.45), { width: 1, dash: [4, 4] });
			curve(ctx, p, (x) => f(x) - r, alpha(t.series[0], 0.45), { width: 1, dash: [4, 4] });
		}
		const act = drag?.kind === 'point' ? drag.i : hover?.kind === 'point' ? hover.i : -1;
		if (s.show.squares) squares(ctx, p, s.xs, s.ys, pr, t.series[0], { highlight: act });
		if (s.show.residuals) residualLines(ctx, p, s.xs, s.ys, pr, alpha(t.series[3], 0.75), 2);
		const hotC = drag?.kind === 'c' || hover?.kind === 'c';
		curve(ctx, p, f, t.series[1], { width: hotC ? 3.5 : 2.75 });
		if (isConst && s.ui.dragC) {
			const hx = p.box.x + p.box.w - 18;
			dot(ctx, hx, p.m.y(s.c), hotC ? 13 : 11, alpha(t.series[1], 0.16));
			dot(ctx, hx, p.m.y(s.c), hotC ? 7.5 : 6.5, t.bg, t.series[1], 2.5);
		}
		points(ctx, p, t, s.xs, s.ys, { color: alpha(t.text, 0.75), active: act, special: s.outlier !== 0 ? OUT : -1 });
		ctx.restore();

		tag(ctx, t, isConst ? `${L('constant')}: ŷ = ${euro(s.c)}` : `${L('model')}: ŷ = ${fmt(s.model.w, 0)}·size + ${s.model.b}`, p.box.x + 8, p.box.y + 14, t.series[1]);
		if (s.show.band && !isConst) label(ctx, t, L('band', { v: euro(M.rmse) }), p.box.x + p.box.w - 6, p.box.y + 14, { align: 'right', color: t.series[0], size: 11, weight: 600 });

		// details for the point under the pointer
		if (act >= 0) {
			const r = M.r[act];
			const text = s.show.squares || s.bars === 'squared' ? `${signedEuro(r)}  →  ² = ${big(r * r)}` : L('residual', { v: signedEuro(r) });
			const px = p.m.x(s.xs[act]);
			const left = px > p.box.x + p.box.w * 0.6;
			tag(ctx, t, text, px + (left ? -14 : 14), clamp(p.m.y(s.ys[act]), p.box.y + 40, p.box.y + p.box.h - 12), t.series[3], left ? 'right' : 'left');
		}
		const hint = s.ui.drag && !s.did.drag ? L('dragFlat') : s.ui.dragC && isConst && !s.did.dragC ? L('dragLine') : '';
		if (hint && !drag) label(ctx, t, hint, p.box.x + p.box.w - 6, p.box.y + p.box.h - 12, { align: 'right', color: t.text3, size: 11 });
	}

	/* --------------------------------------------------------- bar charts */
	function drawBars(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const kind = s.bars;
		const vals = kind === 'residual' ? M.r : kind === 'abs' ? M.ab : M.sq;
		const color = kind === 'residual' ? t.series[3] : kind === 'abs' ? t.series[2] : t.series[0];
		const mx = Math.max(...vals.map(Math.abs));
		const top = kind === 'squared' ? Math.max(60000, mx * 1.15) : Math.max(300, mx * 1.15);
		const yDom: [number, number] = kind === 'residual' ? [-top, top] : [0, top];
		const box = { x: 54, y: 24, w: w - 66, h: h - 46 };
		const m = mapper(box, [0, s.xs.length], yDom);
		const slot = box.w / s.xs.length;
		const title =
			(kind === 'residual' ? L('titleResidual') : kind === 'abs' ? L('titleAbs') : L('titleSquared')) + (slot > 34 ? L('bySize') : '');
		label(ctx, t, title, 4, 4, { color: t.text2, size: 11, weight: 600, base: 'top' });
		const yf = (v: number) => (kind === 'squared' ? (v === 0 ? '0' : `${Math.round(v / 1000)}k`) : String(Math.round(v)));
		for (const v of ticks(yDom[0], yDom[1], 4)) {
			ctx.strokeStyle = v === 0 ? t.axis : t.grid;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(box.x, m.y(v));
			ctx.lineTo(box.x + box.w, m.y(v));
			ctx.stroke();
			label(ctx, t, yf(v), box.x - 6, m.y(v), { align: 'right', color: t.text3, size: 10 });
		}
		const bw = Math.min(30, slot * 0.62);
		const act = drag?.kind === 'point' ? drag.i : hover?.kind === 'point' ? hover.i : -1;
		vals.forEach((v, i) => {
			const cx = box.x + slot * (i + 0.5);
			const y0 = m.y(0);
			const y1 = m.y(clamp(v, yDom[0], yDom[1]));
			const special = (s.outlier !== 0 && i === OUT) || i === act;
			ctx.fillStyle = alpha(color, special ? 0.95 : 0.6);
			ctx.fillRect(cx - bw / 2, Math.min(y0, y1), bw, Math.max(1, Math.abs(y1 - y0)));
			if (slot > 34) label(ctx, t, `${s.xs[i]}`, cx, box.y + box.h + 11, { align: 'center', color: t.text3, size: 9 });
		});
		if (s.show.meanLine) {
			const v = kind === 'residual' ? M.meanRes : kind === 'abs' ? M.mae : M.mse;
			const name = kind === 'residual' ? `${L('average')} = ${signedEuro(v)}` : kind === 'abs' ? `${L('average')} = MAE = ${euro(v)}` : `${L('average')} = MSE = ${big(v)}`;
			const y = m.y(v);
			ctx.strokeStyle = t.text;
			ctx.lineWidth = 2;
			ctx.setLineDash([6, 4]);
			ctx.beginPath();
			ctx.moveTo(box.x, y);
			ctx.lineTo(box.x + box.w, y);
			ctx.stroke();
			ctx.setLineDash([]);
			tag(ctx, t, name, box.x + box.w - 4, clamp(y - 14, box.y + 10, box.y + box.h - 10), t.text, 'right');
		}
	}

	/** Two 100% bars: each flat's share of the total absolute error and of the total squared error. */
	function drawShare(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const rows = [
			{ name: L('shareAbs'), vals: M.ab, color: t.series[2] },
			{ name: L('shareSq'), vals: M.sq, color: t.series[0] }
		];
		const x0 = 12;
		const bw = w - 24;
		const bh = Math.min(30, (h - 40) / 4);
		const hi = s.outlier !== 0 ? OUT : M.top;
		rows.forEach((row, k) => {
			const y = 22 + k * (bh + 30);
			label(ctx, t, row.name, x0, y, { color: t.text2, size: 11, weight: 600 });
			const total = rg.sum(row.vals) || 1;
			let x = x0;
			row.vals.forEach((v, i) => {
				const ww = (v / total) * bw;
				ctx.fillStyle = i === hi ? row.color : alpha(t.text3, i % 2 ? 0.28 : 0.42);
				ctx.fillRect(x, y + 10, Math.max(0, ww - 1), bh);
				if (i === hi && ww > 36) label(ctx, t, pct(v / total), x + ww / 2, y + 10 + bh / 2, { align: 'center', color: t.bg, size: 12, weight: 700 });
				x += ww;
			});
		});
		label(ctx, t, s.outlier !== 0 ? L('colOutlier') : L('colBiggest'), x0, h - 10, { color: t.text3, size: 10 });
	}

	/* -------------------------------------------- constant-model error curves */
	let cmap: ReturnType<typeof mapper> | null = null;
	let cdrag = $state(false);

	function drawCurves(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const ys = s.ys.slice();
		const cDom: [number, number] = [yDom[0], yDom[1]];
		const yTop = Math.max(rg.constRmse(ys, cDom[0]), rg.constRmse(ys, cDom[1]), rg.constMae(ys, cDom[1])) * 1.05;
		const p = axes(ctx, w, h, t, {
			xDom: cDom,
			yDom: [0, yTop],
			xLabel: L('constC'),
			yLabel: L('error'),
			xFmt: (v) => `€${v}`,
			yFmt: (v) => `€${v}`,
			pad: { left: 48, top: 24, bottom: 32 }
		});
		cmap = p.m;
		clip(ctx, p.box);
		curve(ctx, p, (c) => rg.constRmse(ys, c), t.series[0], { width: 2.5, samples: 240 });
		curve(ctx, p, (c) => rg.constMae(ys, c), t.series[2], { width: 2.5, samples: 480 });
		if (s.show.marks) {
			const mk = (v: number, color: string, text: string, row: number) => {
				ctx.setLineDash([3, 3]);
				ctx.strokeStyle = alpha(color, 0.8);
				ctx.lineWidth = 1.5;
				ctx.beginPath();
				ctx.moveTo(p.m.x(v), p.box.y);
				ctx.lineTo(p.m.x(v), p.box.y + p.box.h);
				ctx.stroke();
				ctx.setLineDash([]);
				label(ctx, t, text, p.m.x(v) + 5, p.box.y + p.box.h - 10 - row * 15, { color, size: 11, weight: 600 });
			};
			const mu = rg.mean(ys);
			const md = rg.median(ys);
			mk(md, t.series[2], `${L('median')} ${euro(md)}`, mu > md ? 0 : 1);
			mk(mu, t.series[0], `${L('mean')} ${euro(mu)}`, mu > md ? 1 : 0);
		}
		// current c
		const cx = p.m.x(s.c);
		ctx.strokeStyle = t.series[1];
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(cx, p.box.y);
		ctx.lineTo(cx, p.box.y + p.box.h);
		ctx.stroke();
		dot(ctx, cx, p.m.y(rg.constRmse(ys, s.c)), 5, t.series[0], t.bg, 2);
		dot(ctx, cx, p.m.y(rg.constMae(ys, s.c)), 5, t.series[2], t.bg, 2);
		ctx.restore();
		label(ctx, t, 'RMSE(c)', p.box.x + 8, p.box.y + 6, { color: t.series[0], size: 11, weight: 700, base: 'top' });
		label(ctx, t, 'MAE(c)', p.box.x + 72, p.box.y + 6, { color: t.series[2], size: 11, weight: 700, base: 'top' });
	}

	function pickC(p: { x: number }) {
		if (!cmap || !s.ui.dragC) return;
		setC(s, Math.round(clamp(cmap.invX(p.x), yDom[0] + 20, yDom[1] - 20) / 5) * 5);
		s.did.dragC = true;
	}

	/* ------------------------------------------------------------ readouts */
	const readouts = $derived.by(() => {
		const items: { label: string; value: string; highlight?: boolean }[] = [];
		if (isConst) items.push({ label: 'c', value: euro(s.c) });
		if (s.show.meanRes) items.push({ label: L('meanResidual'), value: signedEuro(M.meanRes) });
		if (s.show.mae) items.push({ label: 'MAE', value: euro(M.mae), highlight: true });
		if (s.show.mse) items.push({ label: 'MSE', value: `${big(M.mse)} €²` });
		if (s.show.rmse) items.push({ label: 'RMSE', value: euro(M.rmse), highlight: true });
		if (s.show.ratio) items.push({ label: 'RMSE / MAE', value: fmt(M.ratio, 2) });
		if (s.show.share) items.push({ label: L('biggestShare'), value: pct(M.topShareSq) });
		if (isConst && s.show.marks) items.push({ label: L('mean'), value: euro(mean(s)) }, { label: L('median'), value: euro(median(s)) });
		return items;
	});

	const barsShown = $derived(s.bars === 'residual' || s.bars === 'abs' || s.bars === 'squared');
</script>

<div class="scene">
	<Canvas
		draw={drawScatter}
		aspect={0.56}
		minHeight={250}
		maxHeight={400}
		label={L('scatterLabel')}
		cursor={drag ? 'grabbing' : hover ? 'ns-resize' : 'default'}
		onpointerdown={down}
		onpointermove={move}
		onpointerup={up}
	/>

	{#if barsShown}
		<div class="panel">
			<Canvas draw={drawBars} aspect={0.3} minHeight={150} maxHeight={200} label={L('barsLabel')} />
		</div>
	{:else if s.bars === 'share'}
		<div class="panel">
			<Canvas draw={drawShare} aspect={0.22} minHeight={120} maxHeight={140} label={L('shareLabel')} />
		</div>
	{:else if s.bars === 'curves'}
		<div class="panel">
			<Canvas
				draw={drawCurves}
				aspect={0.36}
				minHeight={170}
				maxHeight={230}
				label={L('curvesLabel')}
				cursor={s.ui.dragC ? 'ew-resize' : 'default'}
				onpointerdown={(p) => {
					cdrag = true;
					pickC(p);
				}}
				onpointermove={(p) => cdrag && pickC(p)}
				onpointerup={() => (cdrag = false)}
			/>
		</div>
	{/if}

	{#if readouts.length}<Readouts items={readouts} />{/if}

	{#if Object.values(s.ui).some(Boolean)}
		<div class="controls">
			{#if s.ui.mode}
				<Segmented
					label={L('prediction')}
					bind:value={s.mode}
					options={[
						{ value: 'line', label: L('modelLine') },
						{ value: 'constant', label: L('oneConstant') }
					] as { value: 'line' | 'constant'; label: string }[]}
					onchange={(v) => {
						if (v === 'constant') s.bars = 'curves';
						else if (s.bars === 'curves') s.bars = 'squared';
					}}
				/>
			{/if}
			{#if s.ui.bars && s.mode === 'line'}
				<Segmented
					label={L('chart')}
					bind:value={s.bars}
					options={[
						{ value: 'residual', label: L('residuals') },
						{ value: 'abs', label: L('errors') },
						{ value: 'squared', label: L('squared') },
						{ value: 'share', label: L('shares') }
					] as { value: Bars; label: string }[]}
				/>
			{/if}
			{#if s.ui.outlier}
				<Slider
					label={L('outlier', { x: s.xs[OUT] })}
					bind:value={s.outlier}
					min={0}
					max={OUTLIER_MAX}
					step={10}
					format={(v) => `€${v}`}
					oninput={(v) => setOutlier(s, v)}
				/>
			{/if}
			{#if s.ui.reset}
				<button class="btn btn-sm" onclick={() => resetRents(s)}>{L('resetRents')}</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.scene {
		display: grid;
		gap: 12px;
	}
	.panel {
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
</style>
