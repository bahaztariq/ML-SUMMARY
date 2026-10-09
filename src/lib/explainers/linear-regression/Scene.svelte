<script lang="ts">
	import Canvas from '#lib/viz/Canvas.svelte';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import { alpha, clamp, dot, fmt, label, mapper, type VizTheme } from '#lib/viz/canvas.ts';
	import { local } from '#lib/i18n/index.svelte.ts';
	import type { SceneProps } from '../types.ts';
	import * as rg from '../_regression/regression.ts';
	import { axes, clip, curve, euro, handle, nearestPoint, points, residualLines, tag, type Plot } from '../_regression/plot.ts';
	import {
		B_DOM,
		HANDLE_X,
		LANDSCAPE_TOL,
		W_DOM,
		X_DOM,
		Y_DOM,
		alphaOf,
		best,
		bestMse,
		currentMse,
		fit,
		fmtAlpha,
		maxCoef,
		movePoint,
		mseRatio,
		polyTrainMse,
		resetData,
		setOutlier,
		zeros,
		type LRState,
		type View
	} from './state.ts';

	let { s = $bindable(), step }: SceneProps<LRState> = $props();

	const L = local({
		en: {
			sizeVar: 'size',
			size: 'size (m²) →',
			rent: 'rent (€ / month)',
			before: 'before',
			typo: 'typo: €150',
			dragHandles: 'drag the round handles ↕',
			dragPoint: 'drag any point',
			slopeW: 'slope w →',
			interceptB: 'intercept b',
			lowestMse: 'lowest MSE',
			pickLine: 'click or drag to pick a line',
			noData: 'no data',
			leastSquares: 'least squares',
			degreeTag: 'degree {d} · {name}',
			trueCurve: '- - true curve',
			coefs: 'coefficients wⱼ (log scale)',
			degree: 'degree',
			trainMse: 'train MSE',
			largestW: 'largest |w|',
			zeroWeights: 'zero weights',
			ofN: '{k} of {n}',
			slope: 'slope w',
			intercept: 'intercept b',
			fit: 'fit',
			lsDone: 'least squares ✓',
			aboveBest: '{p}% above best',
			lineLabel: 'Scatter plot of apartment size against rent with a regression line',
			landLabel: 'MSE landscape over slope and intercept; darker is lower error',
			polyLabel: 'Polynomial fit to noisy samples of a curve',
			coefLabel: 'Bar chart of the polynomial coefficients',
			data: 'Data',
			rentVsSize: 'Rent vs size',
			curve: 'Curve',
			fitBtn: 'Fit (least squares)',
			removeTypo: 'Remove the typo',
			addTypo: 'Add the €150 typo',
			resetData: '↺ Reset data',
			polyDegree: 'Polynomial degree',
			penalty: 'Penalty',
			none: 'None',
			strength: 'Strength α',
			xRange: 'x range',
			dataOnly: 'Data only',
			beyond: 'Beyond the data'
		},
		fr: {
			sizeVar: 'surface',
			size: 'surface (m²) →',
			rent: 'loyer (€ / mois)',
			before: 'avant',
			typo: 'faute de frappe : €150',
			dragHandles: 'faites glisser les poignées rondes ↕',
			dragPoint: 'faites glisser un point',
			slopeW: 'pente w →',
			interceptB: 'ordonnée b',
			lowestMse: 'MSE minimale',
			pickLine: 'cliquez ou glissez pour choisir une droite',
			noData: 'pas de données',
			leastSquares: 'moindres carrés',
			degreeTag: 'degré {d} · {name}',
			trueCurve: '- - vraie courbe',
			coefs: 'coefficients wⱼ (échelle log)',
			degree: 'degré',
			trainMse: 'MSE entraîn.',
			largestW: 'plus grand |w|',
			zeroWeights: 'poids nuls',
			ofN: '{k} sur {n}',
			slope: 'pente w',
			intercept: 'ordonnée b',
			fit: 'ajustement',
			lsDone: 'moindres carrés ✓',
			aboveBest: '{p} % au-dessus du min',
			lineLabel: 'Nuage de points surface/loyer des appartements avec une droite de régression',
			landLabel: 'Paysage de la MSE selon la pente et l’ordonnée à l’origine ; plus foncé = erreur plus faible',
			polyLabel: 'Ajustement polynomial sur des échantillons bruités d’une courbe',
			coefLabel: 'Diagramme en barres des coefficients du polynôme',
			data: 'Données',
			rentVsSize: 'Loyer / surface',
			curve: 'Courbe',
			fitBtn: 'Ajuster (moindres carrés)',
			removeTypo: 'Retirer la faute',
			addTypo: 'Ajouter la faute à €150',
			resetData: '↺ Réinitialiser',
			polyDegree: 'Degré du polynôme',
			penalty: 'Pénalité',
			none: 'Aucune',
			strength: 'Intensité α',
			xRange: 'Plage de x',
			dataOnly: 'Données seules',
			beyond: 'Au-delà des données'
		},
		ar: {
			sizeVar: 'المساحة',
			size: 'المساحة (m²) →',
			rent: 'الإيجار (€ / شهر)',
			before: 'قبل',
			typo: 'خطأ إدخال: €150',
			dragHandles: 'اسحب المقبضين الدائريين ↕',
			dragPoint: 'اسحب أي نقطة',
			slopeW: 'الميل w →',
			interceptB: 'المقطع b',
			lowestMse: 'أدنى MSE',
			pickLine: 'انقر أو اسحب لاختيار خط',
			noData: 'لا بيانات',
			leastSquares: 'المربعات الصغرى',
			degreeTag: 'الدرجة {d} · {name}',
			trueCurve: '- - المنحنى الحقيقي',
			coefs: 'المعاملات wⱼ (مقياس لوغاريتمي)',
			degree: 'الدرجة',
			trainMse: 'MSE التدريب',
			largestW: 'أكبر |w|',
			zeroWeights: 'أوزان صفرية',
			ofN: '{k} من {n}',
			slope: 'الميل w',
			intercept: 'المقطع b',
			fit: 'الملاءمة',
			lsDone: 'المربعات الصغرى ✓',
			aboveBest: 'أعلى من الأفضل بـ{p}%',
			lineLabel: 'مخطط انتشار لمساحة الشقق مقابل الإيجار مع خط انحدار',
			landLabel: 'تضاريس MSE حسب الميل والمقطع؛ الأغمق يعني خطأً أقل',
			polyLabel: 'ملاءمة متعددة حدود لعينات مشوّشة من منحنى',
			coefLabel: 'مخطط أعمدة لمعاملات متعددة الحدود',
			data: 'البيانات',
			rentVsSize: 'الإيجار مقابل المساحة',
			curve: 'منحنى',
			fitBtn: 'ملاءمة (المربعات الصغرى)',
			removeTypo: 'أزل خطأ الإدخال',
			addTypo: 'أضف خطأ €150',
			resetData: '↺ إعادة البيانات',
			polyDegree: 'درجة متعددة الحدود',
			penalty: 'العقوبة',
			none: 'بلا',
			strength: 'الشدة α',
			xRange: 'مدى x',
			dataOnly: 'البيانات فقط',
			beyond: 'ما بعد البيانات'
		}
	});

	const big = (v: number) => (Number.isFinite(v) ? Math.round(v).toLocaleString('en-US') : '—');

	/* ------------------------------------------------------------ line view */
	let plot: Plot | null = null;
	let drag = $state<{ kind: 'handle' | 'point'; i: number } | null>(null);
	let hover = $state<{ kind: 'handle' | 'point'; i: number } | null>(null);

	function handlePx(i: number) {
		if (!plot) return null;
		const x = HANDLE_X[i];
		return { x: plot.m.x(x), y: plot.m.y(rg.lineAt(s.line, x)) };
	}

	function hit(p: { x: number; y: number }) {
		if (!plot || s.view !== 'line') return null;
		if (s.ui.handles) {
			for (const i of [0, 1]) {
				const h = handlePx(i);
				if (h && (h.x - p.x) ** 2 + (h.y - p.y) ** 2 < 16 * 16) return { kind: 'handle' as const, i };
			}
		}
		if (s.ui.dragPoints) {
			const i = nearestPoint(plot, s.xs, s.ys, p.x, p.y, 14);
			if (i >= 0) return { kind: 'point' as const, i };
		}
		return null;
	}

	function down(p: { x: number; y: number }) {
		drag = hit(p);
	}
	function move(p: { x: number; y: number }) {
		if (!drag) {
			hover = hit(p);
			return;
		}
		if (!plot) return;
		if (drag.kind === 'handle') {
			const y = clamp(plot.m.invY(p.y), Y_DOM[0], Y_DOM[1]);
			const o = 1 - drag.i;
			const yo = rg.lineAt(s.line, HANDLE_X[o]);
			const pts: [number, number][] = [];
			pts[drag.i] = [HANDLE_X[drag.i], y];
			pts[o] = [HANDLE_X[o], yo];
			const l = rg.lineThrough(pts[0][0], pts[0][1], pts[1][0], pts[1][1]);
			s.line = { w: Math.round(l.w * 100) / 100, b: Math.round(l.b) };
			s.autoFit = false;
			s.did.handles = true;
		} else {
			const x = Math.round(clamp(plot.m.invX(p.x), X_DOM[0] + 3, X_DOM[1] - 3));
			const y = Math.round(clamp(plot.m.invY(p.y), Y_DOM[0] + 20, Y_DOM[1] - 20) / 5) * 5;
			movePoint(s, drag.i, x, y);
			s.did.dragPoint = true;
		}
	}
	function up() {
		drag = null;
	}

	function drawLine(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const p = axes(ctx, w, h, t, {
			xDom: X_DOM,
			yDom: Y_DOM,
			xLabel: L('size'),
			yLabel: L('rent'),
			yFmt: (v) => (v >= 1000 ? `€${v / 1000}k` : `€${v}`),
			pad: { left: 48, top: 26 }
		});
		plot = p;
		const pr = rg.predict(s.line, s.xs);
		const out = s.outlier ? s.xs.length - 1 : -1;
		clip(ctx, p.box);
		if (s.show.residuals) residualLines(ctx, p, s.xs, s.ys, pr, alpha(t.series[3], 0.6));
		if (s.ghost) curve(ctx, p, (x) => rg.lineAt(s.ghost!, x), alpha(t.text3, 0.8), { width: 2, dash: [6, 5] });
		curve(ctx, p, (x) => rg.lineAt(s.line, x), t.series[0], { width: 2.75 });
		const act = drag?.kind === 'point' ? drag.i : hover?.kind === 'point' ? hover.i : -1;
		points(ctx, p, t, s.xs, s.ys, { color: alpha(t.text2, 0.85), active: act, special: out });
		if (s.ui.handles) {
			for (const i of [0, 1]) {
				const hp = handlePx(i)!;
				const hot = (drag?.kind === 'handle' && drag.i === i) || (hover?.kind === 'handle' && hover.i === i);
				handle(ctx, t, hp.x, hp.y, t.series[0], hot);
			}
		}
		ctx.restore();

		// equation of the line
		const sign = s.line.b < 0 ? '−' : '+';
		tag(ctx, t, `ŷ = ${fmt(s.line.w)}·${L('sizeVar')} ${sign} ${big(Math.abs(s.line.b))}`, p.box.x + 8, p.box.y + 14, t.series[0]);
		if (s.ghost) tag(ctx, t, `${L('before')}: ŷ = ${fmt(s.ghost.w)}·${L('sizeVar')} + ${big(s.ghost.b)}`, p.box.x + 8, p.box.y + 40, t.text3);
		if (out >= 0) {
			const ox = p.m.x(s.xs[out]);
			const oy = p.m.y(s.ys[out]);
			label(ctx, t, L('typo'), ox - 10, oy - 14, { align: 'right', color: t.series[3], size: 11, weight: 600 });
		}

		const hint =
			s.ui.handles && !s.did.handles
				? L('dragHandles')
				: s.ui.dragPoints && !s.did.dragPoint
					? L('dragPoint')
					: '';
		if (hint && !drag) label(ctx, t, hint, p.box.x + p.box.w - 6, p.box.y + p.box.h - 12, { align: 'right', color: t.text3, size: 11 });
	}

	/* ------------------------------------------------------- MSE landscape */
	let lmap: ReturnType<typeof mapper> | null = null;
	let lbox = { x: 0, y: 0, w: 0, h: 0 };
	let ldrag = $state(false);

	/** Sufficient statistics so MSE(w, b) costs O(1) per cell. */
	const stats = $derived.by(() => {
		const xs = s.xs.slice();
		const ys = s.ys.slice();
		const n = xs.length;
		const m = (f: (i: number) => number) => xs.reduce((a, _, i) => a + f(i), 0) / n;
		return { x: m((i) => xs[i]), y: m((i) => ys[i]), xx: m((i) => xs[i] ** 2), xy: m((i) => xs[i] * ys[i]), yy: m((i) => ys[i] ** 2) };
	});
	const mseAt = (w: number, b: number) => {
		const st = stats;
		return st.yy - 2 * w * st.xy - 2 * b * st.y + w * w * st.xx + 2 * w * b * st.x + b * b;
	};

	function drawLandscape(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const p = axes(ctx, w, h, t, {
			xDom: W_DOM,
			yDom: B_DOM,
			xLabel: L('slopeW'),
			yLabel: L('interceptB'),
			yFmt: (v) => String(v),
			pad: { left: 48, top: 26 }
		});
		lmap = p.m;
		lbox = p.box;
		const lo = bestMse(s);
		const cell = 5;
		const top = Math.log(30);
		for (let py = p.box.y; py < p.box.y + p.box.h; py += cell) {
			for (let px = p.box.x; px < p.box.x + p.box.w; px += cell) {
				const v = mseAt(p.m.invX(px + cell / 2), p.m.invY(py + cell / 2));
				// sqrt stretches the scale near the bottom; discrete bands read like contours
				const f = Math.sqrt(clamp(Math.log(v / lo) / top, 0, 1));
				const band = Math.floor((1 - f) * 10) / 10;
				ctx.fillStyle = alpha(t.series[0], 0.03 + 0.72 * band ** 2);
				ctx.fillRect(px, py, cell, cell);
			}
		}
		// the minimum, once found (or once fitting is allowed)
		const opt = best(s);
		if (s.ui.fit || mseRatio(s) < LANDSCAPE_TOL) {
			const ox = p.m.x(opt.w);
			const oy = p.m.y(opt.b);
			ctx.strokeStyle = t.series[1];
			ctx.lineWidth = 2.5;
			ctx.beginPath();
			ctx.moveTo(ox - 6, oy - 6);
			ctx.lineTo(ox + 6, oy + 6);
			ctx.moveTo(ox + 6, oy - 6);
			ctx.lineTo(ox - 6, oy + 6);
			ctx.stroke();
			label(ctx, t, L('lowestMse'), ox + 10, oy + 14, { color: t.series[1], size: 11, weight: 600 });
		}
		// current line as a point
		const cx = clamp(p.m.x(s.line.w), p.box.x, p.box.x + p.box.w);
		const cy = clamp(p.m.y(s.line.b), p.box.y, p.box.y + p.box.h);
		dot(ctx, cx, cy, 12, alpha(t.series[3], 0.2));
		dot(ctx, cx, cy, 6.5, t.series[3], t.bg, 2.5);
		tag(ctx, t, `MSE ${big(currentMse(s))}`, p.box.x + 8, p.box.y + 14, t.series[3]);
		if (s.ui.landscape && !s.did.landscape)
			label(ctx, t, L('pickLine'), p.box.x + p.box.w - 6, p.box.y + p.box.h - 12, { align: 'right', color: t.text3, size: 11 });
	}

	function pickLine(p: { x: number; y: number }) {
		if (!lmap || !s.ui.landscape) return;
		s.line = {
			w: Math.round(clamp(lmap.invX(p.x), W_DOM[0], W_DOM[1]) * 100) / 100,
			b: Math.round(clamp(lmap.invY(p.y), B_DOM[0], B_DOM[1]))
		};
		s.autoFit = false;
		s.did.landscape = true;
	}

	/* ------------------------------------------------------- polynomial view */
	const pfit = $derived(s.view === 'poly' ? rg.fitPoly(s.px.slice(), s.py.slice(), s.degree, s.penalty, alphaOf(s)) : null);
	const PX: [number, number] = [-1.12, 1.12];
	const PX_WIDE: [number, number] = [-1.6, 1.6];
	const PY: [number, number] = [-2.4, 2.4];
	const PROBE = 1.3;

	function drawPoly(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		if (!pfit) return;
		const xDom = s.wide ? PX_WIDE : PX;
		const p = axes(ctx, w, h, t, { xDom, yDom: PY, xLabel: 'x →', yLabel: 'y', xFmt: (v) => fmt(v, 1), yFmt: (v) => fmt(v, 0), pad: { left: 40, top: 26 } });
		const lo = Math.min(...s.px);
		const hi = Math.max(...s.px);
		clip(ctx, p.box);
		if (s.wide) {
			ctx.fillStyle = alpha(t.text3, 0.1);
			ctx.fillRect(p.box.x, p.box.y, p.m.x(lo) - p.box.x, p.box.h);
			ctx.fillRect(p.m.x(hi), p.box.y, p.box.x + p.box.w - p.m.x(hi), p.box.h);
			label(ctx, t, L('noData'), p.m.x(hi) + 8, p.box.y + p.box.h - 12, { color: t.text3, size: 11 });
			label(ctx, t, L('noData'), p.m.x(lo) - 8, p.box.y + p.box.h - 12, { align: 'right', color: t.text3, size: 11 });
		}
		if (s.show.truth) curve(ctx, p, rg.curveTruth, alpha(t.series[1], 0.85), { width: 2, dash: [6, 5], samples: 200 });
		curve(ctx, p, (x) => rg.evalPoly(pfit, x), t.series[0], { width: 2.75, samples: 400 });
		points(ctx, p, t, s.px, s.py, { color: alpha(t.text2, 0.9) });
		ctx.restore();

		if (s.wide) {
			const v = rg.evalPoly(pfit, PROBE);
			const px = p.m.x(PROBE);
			const py = clamp(p.m.y(v), p.box.y + 6, p.box.y + p.box.h - 6);
			ctx.setLineDash([2, 3]);
			ctx.strokeStyle = alpha(t.series[3], 0.7);
			ctx.lineWidth = 1.2;
			ctx.beginPath();
			ctx.moveTo(px, p.box.y);
			ctx.lineTo(px, p.box.y + p.box.h);
			ctx.stroke();
			ctx.setLineDash([]);
			dot(ctx, px, py, 5.5, t.series[3], t.bg, 2);
			const off = p.m.y(v) !== py;
			tag(ctx, t, `ŷ(${PROBE}) = ${fmt(v, Math.abs(v) >= 10 ? 0 : 2)}${off ? (v > 0 ? ' ↑' : ' ↓') : ''}`, px - 8, clamp(py + (py < p.box.y + 40 ? 22 : -22), p.box.y + 12, p.box.y + p.box.h - 12), t.series[3], 'right');
		}
		const name = s.penalty === 'none' ? L('leastSquares') : s.penalty === 'ridge' ? 'Ridge' : 'Lasso';
		tag(ctx, t, L('degreeTag', { d: s.degree, name }), p.box.x + 8, p.box.y + 14, t.series[0]);
		if (s.show.truth) label(ctx, t, L('trueCurve'), p.box.x + 10, p.box.y + 38, { color: t.series[1], size: 11, weight: 600 });
	}

	/** Coefficient bars on a signed log scale, so 0.5 and 500 are both readable. */
	const symlog = (v: number) => Math.sign(v) * Math.log10(1 + Math.abs(v));
	function drawCoefs(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		if (!pfit) return;
		const box = { x: 46, y: 22, w: w - 58, h: h - 44 };
		const top = symlog(1000);
		const m = mapper(box, [0, 10], [-top, top]);
		label(ctx, t, L('coefs'), 4, 4, { color: t.text2, size: 11, weight: 600, base: 'top' });
		for (const v of [-1000, -100, -10, -1, 0, 1, 10, 100, 1000]) {
			const y = m.y(symlog(v));
			ctx.strokeStyle = v === 0 ? t.axis : t.grid;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(box.x, y);
			ctx.lineTo(box.x + box.w, y);
			ctx.stroke();
			if (Math.abs(v) !== 1 || box.h > 120) label(ctx, t, String(v), box.x - 6, y, { align: 'right', color: t.text3, size: 9 });
		}
		const slot = box.w / 10;
		const bw = Math.min(26, slot * 0.6);
		const sup = ['', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹', '¹⁰'];
		for (let j = 0; j < 10; j++) {
			const cx = box.x + slot * (j + 0.5);
			const used = j < pfit.coef.length;
			label(ctx, t, `x${sup[j]}`, cx, box.y + box.h + 12, { align: 'center', color: used ? t.text2 : alpha(t.text3, 0.5), size: 10 });
			if (!used) continue;
			const c = pfit.coef[j];
			const y0 = m.y(0);
			const y1 = m.y(clamp(symlog(c), -top, top));
			if (c === 0) {
				label(ctx, t, '0', cx, y0 - 8, { align: 'center', color: t.series[1], size: 10, weight: 700 });
				continue;
			}
			ctx.fillStyle = alpha(Math.abs(c) > 10 ? t.series[3] : t.series[0], 0.75);
			ctx.fillRect(cx - bw / 2, Math.min(y0, y1), bw, Math.max(1, Math.abs(y1 - y0)));
		}
	}

	/* ------------------------------------------------------------ readouts */
	const readouts = $derived.by(() => {
		if (s.view === 'poly' && pfit) {
			const items = [
				{ label: L('degree'), value: String(s.degree) },
				{ label: L('trainMse'), value: fmt(polyTrainMse(s, pfit), 4) },
				{ label: L('largestW'), value: fmt(maxCoef(pfit), 1), highlight: true }
			];
			if (s.penalty !== 'none') items.splice(1, 0, { label: 'α', value: fmtAlpha(s.logAlpha) });
			if (s.penalty === 'lasso') items.push({ label: L('zeroWeights'), value: L('ofN', { k: zeros(pfit), n: s.degree }) });
			return items;
		}
		const r = mseRatio(s);
		return [
			{ label: L('slope'), value: `${fmt(s.line.w)} €/m²` },
			{ label: L('intercept'), value: euro(s.line.b) },
			{ label: 'MSE', value: big(currentMse(s)), highlight: true },
			{ label: 'RMSE', value: euro(Math.sqrt(currentMse(s))) },
			{ label: L('fit'), value: r < 1.0001 ? L('lsDone') : L('aboveBest', { p: fmt((r - 1) * 100, 0) }) }
		];
	});
</script>

<div class="scene">
	{#if s.view === 'line'}
		<div class="plots" class:two={s.show.landscape}>
			<Canvas
				draw={drawLine}
				aspect={s.show.landscape ? 0.9 : 0.6}
				minHeight={260}
				maxHeight={440}
				label={L('lineLabel')}
				cursor={drag ? 'grabbing' : hover ? (hover.kind === 'handle' ? 'ns-resize' : 'grab') : 'default'}
				onpointerdown={down}
				onpointermove={move}
				onpointerup={up}
			/>
			{#if s.show.landscape}
				<Canvas
					draw={drawLandscape}
					aspect={0.9}
					minHeight={260}
					maxHeight={440}
					label={L('landLabel')}
					cursor={s.ui.landscape ? 'crosshair' : 'default'}
					onpointerdown={(p) => {
						ldrag = true;
						pickLine(p);
					}}
					onpointermove={(p) => ldrag && pickLine(p)}
					onpointerup={() => (ldrag = false)}
				/>
			{/if}
		</div>
	{:else}
		<Canvas draw={drawPoly} aspect={0.55} minHeight={250} maxHeight={400} label={L('polyLabel')} />
		<div class="coefs">
			<Canvas draw={drawCoefs} aspect={0.26} minHeight={140} maxHeight={180} label={L('coefLabel')} />
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
						{ value: 'line', label: L('rentVsSize') },
						{ value: 'poly', label: L('curve') }
					] as { value: View; label: string }[]}
				/>
			{/if}
			{#if s.view === 'line' && (s.ui.fit || s.ui.outlier || s.ui.dragPoints)}
				<div class="buttons">
					{#if s.ui.fit}
						<button
							class="btn btn-sm btn-primary"
							onclick={() => {
								s.autoFit = true;
								fit(s);
							}}>{L('fitBtn')}</button
						>
					{/if}
					{#if s.ui.outlier}
						<button class="btn btn-sm" onclick={() => setOutlier(s, !s.outlier)}>{s.outlier ? L('removeTypo') : L('addTypo')}</button>
					{/if}
					{#if s.ui.dragPoints}
						<button class="btn btn-sm" onclick={() => resetData(s)}>{L('resetData')}</button>
					{/if}
				</div>
			{/if}
			{#if s.view === 'poly'}
				{#if s.ui.degree}
					<Slider label={L('polyDegree')} bind:value={s.degree} min={1} max={10} />
				{/if}
				{#if s.ui.penalty}
					<Segmented
						label={L('penalty')}
						bind:value={s.penalty}
						options={[
							{ value: 'none', label: L('none') },
							{ value: 'ridge', label: 'Ridge (L2)' },
							{ value: 'lasso', label: 'Lasso (L1)' }
						] as { value: rg.Penalty; label: string }[]}
					/>
				{/if}
				{#if s.ui.alpha && s.penalty !== 'none'}
					<Slider label={L('strength')} bind:value={s.logAlpha} min={-8} max={1} step={0.1} format={fmtAlpha} />
				{/if}
				{#if s.ui.range}
					<Segmented
						label={L('xRange')}
						value={s.wide ? 'wide' : 'data'}
						options={[
							{ value: 'data', label: L('dataOnly') },
							{ value: 'wide', label: L('beyond') }
						]}
						onchange={(v) => (s.wide = v === 'wide')}
					/>
				{/if}
			{/if}
		</div>
	{/if}
</div>

<style>
	.scene {
		display: grid;
		gap: 12px;
	}
	.plots {
		display: grid;
		gap: 10px;
	}
	.plots.two {
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
	}
	.coefs {
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
