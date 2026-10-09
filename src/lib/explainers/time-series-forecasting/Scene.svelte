<script lang="ts">
	import Canvas from '#lib/viz/Canvas.svelte';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import { alpha, clamp, dot, label, mapper, ticks, type Box, type VizTheme } from '#lib/viz/canvas.ts';
	import type { SceneProps } from '../types.ts';
	import { local } from '#lib/i18n/index.svelte.ts';
	import {
		ACF_LAGS,
		DIFF_LABEL,
		HORIZON_MAX,
		N,
		PROC,
		P_MAX,
		SALES,
		TRAIN_END,
		acfOf,
		acfSeries,
		arErrors,
		arFit,
		arForecast,
		backtestOf,
		composed,
		differenced,
		drift,
		num,
		prophet,
		rollingOf,
		type Diff,
		type TSState,
		type View
	} from './state.ts';
	import { CHANGEPOINT, arMean } from './ts.ts';

	const L = local({
		en: {
			arOneStep: 'AR({p}) one-step prediction',
			band95: '95% band ±{v}',
			yr: 'yr {n}',
			allOff: 'all components off: switch one back on',
			sales: 'sales',
			trend: 'trend',
			season: 'season',
			seasonality: 'seasonality',
			noise: 'noise',
			rollingNote: '{n}-month mean ± std',
			origY: 'original y',
			both: 'both',
			speedsUp: 'trend speeds up',
			arSample: 'AR(2) sample',
			maSample: 'MA(1) sample',
			data: 'data',
			now: 'now',
			lrMean: 'long-run mean',
			history: 'history',
			forecast: 'forecast',
			heldOut: 'held out →',
			fit: 'fit g(t)+s(t)',
			trendG: 'trend g(t)',
			actual: 'actual',
			walkPreds: 'walk-forward predictions',
			heldPreds: 'predictions for held-out months',
			acfTitle: 'autocorrelation by lag',
			lagArrow: 'lag →',
			perrTitle: 'one-step error σ by order p',
			walkFolds: 'walk-forward folds',
			shuffledFolds: 'shuffled 5-fold',
			foldN: 'fold {n}',
			months: 'months',
			first2: 'first 2-yr mean',
			last2: 'last 2-yr mean',
			series: 'series',
			meanDrift: 'mean drift',
			process: 'process',
			horizon: 'horizon',
			changepoints: 'changepoints',
			on: 'on',
			off: 'off',
			heldMae: 'held-out MAE',
			shuffledMae: 'shuffled MAE',
			walkMae: 'walk-forward MAE',
			vDecompose: 'Decompose',
			vDiff: 'Difference + ACF',
			vProcess: 'AR vs MA',
			vAr: 'Fit AR(p)',
			vForecast: 'Forecast',
			vProphet: 'Prophet-style',
			vBacktest: 'Backtest',
			chartLabel: 'Time series chart',
			compLabel: 'Trend, seasonality and noise components',
			acfLabel: 'Autocorrelation bar chart for lags 1 to 24',
			perrLabel: 'Error of AR(p) fits for p from 1 to 6',
			foldsLabel: 'Cross-validation folds: grey training months, coloured test months',
			view: 'View',
			components: 'Components',
			differencing: 'Differencing',
			none: 'None',
			lag1: 'Lag 1',
			lag12: 'Lag 12',
			bothOpt: 'Both',
			processSeg: 'Process',
			pSlider: 'AR order p',
			hSlider: 'Horizon (steps ahead)',
			kSlider: 'Fourier pairs K',
			cpsSeg: 'Trend changepoints',
			offOpt: 'Off',
			onOpt: 'On',
			validation: 'Validation',
			shuffledOpt: 'Shuffled K-fold',
			walkOpt: 'Walk-forward'
		},
		fr: {
			arOneStep: 'AR({p}) : prévision à un pas',
			band95: 'bande à 95 % ±{v}',
			yr: 'an {n}',
			allOff: 'toutes les composantes sont coupées : réactivez-en une',
			sales: 'ventes',
			trend: 'tendance',
			season: 'saison',
			seasonality: 'saisonnalité',
			noise: 'bruit',
			rollingNote: 'moyenne ± écart-type sur {n} mois',
			origY: 'y d’origine',
			both: 'les deux',
			speedsUp: 'la tendance accélère',
			arSample: 'échantillon AR(2)',
			maSample: 'échantillon MA(1)',
			data: 'données',
			now: 'maint.',
			lrMean: 'moyenne de long terme',
			history: 'historique',
			forecast: 'prévision',
			heldOut: 'mis de côté →',
			fit: 'ajustement g(t)+s(t)',
			trendG: 'tendance g(t)',
			actual: 'réel',
			walkPreds: 'prédictions walk-forward',
			heldPreds: 'prédictions des mois mis de côté',
			acfTitle: 'autocorrélation par décalage',
			lagArrow: 'décalage →',
			perrTitle: 'erreur à un pas σ selon l’ordre p',
			walkFolds: 'plis walk-forward',
			shuffledFolds: '5 plis mélangés',
			foldN: 'pli {n}',
			months: 'mois',
			first2: 'moyenne 2 prem. années',
			last2: 'moyenne 2 dern. années',
			series: 'série',
			meanDrift: 'dérive de la moyenne',
			process: 'processus',
			horizon: 'horizon',
			changepoints: 'points de rupture',
			on: 'activés',
			off: 'désactivés',
			heldMae: 'MAE mis de côté',
			shuffledMae: 'MAE mélangé',
			walkMae: 'MAE walk-forward',
			vDecompose: 'Décomposer',
			vDiff: 'Différenciation + ACF',
			vProcess: 'AR ou MA',
			vAr: 'Ajuster AR(p)',
			vForecast: 'Prévision',
			vProphet: 'Façon Prophet',
			vBacktest: 'Backtest',
			chartLabel: 'Graphique de série temporelle',
			compLabel: 'Composantes de tendance, de saisonnalité et de bruit',
			acfLabel: 'Diagramme en barres de l’autocorrélation pour les décalages 1 à 24',
			perrLabel: 'Erreur des ajustements AR(p) pour p de 1 à 6',
			foldsLabel: 'Plis de validation croisée : mois d’entraînement en gris, mois de test en couleur',
			view: 'Vue',
			components: 'Composantes',
			differencing: 'Différenciation',
			none: 'Aucune',
			lag1: 'Décalage 1',
			lag12: 'Décalage 12',
			bothOpt: 'Les deux',
			processSeg: 'Processus',
			pSlider: 'ordre AR p',
			hSlider: 'Horizon (pas en avant)',
			kSlider: 'paires de Fourier K',
			cpsSeg: 'Points de rupture de la tendance',
			offOpt: 'Non',
			onOpt: 'Oui',
			validation: 'Validation',
			shuffledOpt: 'K-fold mélangé',
			walkOpt: 'Walk-forward'
		},
		ar: {
			arOneStep: 'AR({p}): تنبؤ بخطوة واحدة',
			band95: 'نطاق 95% ±{v}',
			yr: 'سنة {n}',
			allOff: 'كل المكوّنات مطفأة: أعد تشغيل واحد منها',
			sales: 'المبيعات',
			trend: 'الاتجاه',
			season: 'الموسم',
			seasonality: 'الموسمية',
			noise: 'الضجيج',
			rollingNote: 'المتوسط ± الانحراف المعياري لكل {n} شهرًا',
			origY: 'y الأصلية',
			both: 'كلاهما',
			speedsUp: 'الاتجاه يتسارع',
			arSample: 'عينة AR(2)',
			maSample: 'عينة MA(1)',
			data: 'البيانات',
			now: 'الآن',
			lrMean: 'المتوسط طويل الأمد',
			history: 'التاريخ',
			forecast: 'التنبؤ',
			heldOut: 'بيانات محجوبة →',
			fit: 'الملاءمة g(t)+s(t)',
			trendG: 'الاتجاه g(t)',
			actual: 'الفعلي',
			walkPreds: 'تنبؤات التقدم الزمني',
			heldPreds: 'تنبؤات الأشهر المحجوبة',
			acfTitle: 'الارتباط الذاتي حسب الإزاحة',
			lagArrow: 'الإزاحة →',
			perrTitle: 'خطأ الخطوة الواحدة σ حسب الرتبة p',
			walkFolds: 'طيّات التقدم الزمني',
			shuffledFolds: '5 طيّات مخلوطة',
			foldN: 'الطية {n}',
			months: 'الأشهر',
			first2: 'متوسط أول سنتين',
			last2: 'متوسط آخر سنتين',
			series: 'السلسلة',
			meanDrift: 'انجراف المتوسط',
			process: 'العملية',
			horizon: 'الأفق',
			changepoints: 'نقاط التغيّر',
			on: 'مفعّلة',
			off: 'معطّلة',
			heldMae: 'MAE على المحجوب',
			shuffledMae: 'MAE مخلوط',
			walkMae: 'MAE بالتقدم الزمني',
			vDecompose: 'التفكيك',
			vDiff: 'الفروق + ACF',
			vProcess: 'AR مقابل MA',
			vAr: 'ملاءمة AR(p)',
			vForecast: 'التنبؤ',
			vProphet: 'على طريقة Prophet',
			vBacktest: 'الاختبار الرجعي',
			chartLabel: 'مخطط السلسلة الزمنية',
			compLabel: 'مكوّنات الاتجاه والموسمية والضجيج',
			acfLabel: 'مخطط أعمدة للارتباط الذاتي للإزاحات من 1 إلى 24',
			perrLabel: 'خطأ نماذج AR(p) الملاءمة لقيم p من 1 إلى 6',
			foldsLabel: 'طيّات التحقق المتقاطع: أشهر التدريب بالرمادي وأشهر الاختبار بالألوان',
			view: 'العرض',
			components: 'المكوّنات',
			differencing: 'أخذ الفروق',
			none: 'بدون',
			lag1: 'إزاحة 1',
			lag12: 'إزاحة 12',
			bothOpt: 'كلاهما',
			processSeg: 'العملية',
			pSlider: 'رتبة AR p',
			hSlider: 'الأفق (خطوات للأمام)',
			kSlider: 'أزواج فورييه K',
			cpsSeg: 'نقاط تغيّر الاتجاه',
			offOpt: 'إيقاف',
			onOpt: 'تشغيل',
			validation: 'التحقق',
			shuffledOpt: 'K-fold مخلوط',
			walkOpt: 'التقدم الزمني'
		}
	});

	let { s = $bindable() }: SceneProps<TSState> = $props();

	/** DIFF_LABEL with its prose entries translated (the formulas stay as they are). */
	const diffLabel = (d: Diff) => (d === 'none' ? L('origY') : d === 'both' ? L('both') : DIFF_LABEL[d]);

	type M = ReturnType<typeof mapper>;

	/* ---------------------------------------------------------------- helpers */

	function range(arrs: number[][], pad = 0.08): [number, number] {
		let lo = Infinity;
		let hi = -Infinity;
		for (const a of arrs) for (const v of a) if (Number.isFinite(v)) (lo = Math.min(lo, v)), (hi = Math.max(hi, v));
		if (!Number.isFinite(lo)) return [-1, 1];
		if (hi - lo < 1e-9) (lo -= 1), (hi += 1);
		const p = (hi - lo) * pad;
		return [lo - p, hi + p];
	}

	/** Grid, y labels and x labels (`xl` turns an x tick into text). */
	function frame(ctx: CanvasRenderingContext2D, t: VizTheme, box: Box, m: M, xs: number[], ydom: [number, number], xl: (v: number) => string) {
		ctx.lineWidth = 1;
		for (const v of ticks(ydom[0], ydom[1], 4)) {
			ctx.strokeStyle = t.grid;
			ctx.beginPath();
			ctx.moveTo(box.x, m.y(v));
			ctx.lineTo(box.x + box.w, m.y(v));
			ctx.stroke();
			label(ctx, t, String(+v.toFixed(2)), box.x - 6, m.y(v), { align: 'right', color: t.text3, size: 10 });
		}
		for (const v of xs) {
			ctx.strokeStyle = t.grid;
			ctx.beginPath();
			ctx.moveTo(m.x(v), box.y);
			ctx.lineTo(m.x(v), box.y + box.h);
			ctx.stroke();
			label(ctx, t, xl(v), m.x(v), box.y + box.h + 11, { align: 'center', color: t.text3, size: 10 });
		}
	}

	function line(ctx: CanvasRenderingContext2D, m: M, ys: number[], t0: number, color: string, width = 1.8, dash: number[] = []) {
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.setLineDash(dash);
		ctx.beginPath();
		let pen = false;
		ys.forEach((v, i) => {
			if (!Number.isFinite(v)) return void (pen = false);
			const x = m.x(t0 + i);
			const y = m.y(v);
			if (pen) ctx.lineTo(x, y);
			else ctx.moveTo(x, y);
			pen = true;
		});
		ctx.stroke();
		ctx.setLineDash([]);
	}

	function band(ctx: CanvasRenderingContext2D, m: M, t0: number, lo: number[], hi: number[], fill: string) {
		ctx.fillStyle = fill;
		ctx.beginPath();
		hi.forEach((v, i) => (i ? ctx.lineTo(m.x(t0 + i), m.y(v)) : ctx.moveTo(m.x(t0 + i), m.y(v))));
		for (let i = lo.length - 1; i >= 0; i--) ctx.lineTo(m.x(t0 + i), m.y(lo[i]));
		ctx.closePath();
		ctx.fill();
	}

	function vline(ctx: CanvasRenderingContext2D, box: Box, x: number, color: string, text?: string, t?: VizTheme) {
		ctx.strokeStyle = color;
		ctx.setLineDash([3, 3]);
		ctx.lineWidth = 1.2;
		ctx.beginPath();
		ctx.moveTo(x, box.y);
		ctx.lineTo(x, box.y + box.h);
		ctx.stroke();
		ctx.setLineDash([]);
		if (text && t) label(ctx, t, text, x + 5, box.y + 8, { color, size: 10, weight: 600 });
	}

	const years = Array.from({ length: 10 }, (_, i) => i * 12);
	const yearLabel = (v: number) => (v % 24 === 0 ? L('yr', { n: v / 12 + 1 }) : '');

	/** Rolling-window mean ± std boxes. */
	function drawRolling(ctx: CanvasRenderingContext2D, t: VizTheme, m: M, d: Diff) {
		const t0 = differenced(d).t0;
		for (const r of rollingOf(d)) {
			const x0 = m.x(t0 + r.start);
			const x1 = m.x(t0 + r.end - 1);
			ctx.fillStyle = alpha(t.series[2], 0.1);
			ctx.fillRect(x0, m.y(r.mean + r.std), x1 - x0, m.y(r.mean - r.std) - m.y(r.mean + r.std));
			ctx.strokeStyle = t.series[2];
			ctx.lineWidth = 2.5;
			ctx.beginPath();
			ctx.moveTo(x0, m.y(r.mean));
			ctx.lineTo(x1, m.y(r.mean));
			ctx.stroke();
		}
	}

	/* ---------------------------------------------------------------- main chart */

	function drawMain(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const box = { x: 40, y: 14, w: w - 52, h: h - 38 };
		const v = s.view;
		if (v === 'sales') return drawSales(ctx, t, box);
		if (v === 'diff') return drawDiff(ctx, t, box);
		if (v === 'process') return drawProcess(ctx, t, box);
		if (v === 'ar') return drawAR(ctx, t, box);
		if (v === 'forecast') return drawForecast(ctx, t, box);
		if (v === 'prophet') return drawProphet(ctx, t, box);
		return drawBacktest(ctx, t, box);
	}

	function drawSales(ctx: CanvasRenderingContext2D, t: VizTheme, box: Box) {
		const y = composed(s);
		const all = s.comp.trend && s.comp.season && s.comp.noise;
		const ydom = range([y]);
		const m = mapper(box, [0, N - 1], ydom);
		frame(ctx, t, box, m, years, ydom, yearLabel);
		if (!s.comp.trend && !s.comp.season && !s.comp.noise) {
			label(ctx, t, L('allOff'), box.x + box.w / 2, box.y + box.h / 2, { align: 'center', color: t.text3, size: 12 });
			return;
		}
		if (s.show.rolling && all) drawRolling(ctx, t, m, 'none');
		line(ctx, m, y, 0, t.series[0], 2);
		label(ctx, t, all ? L('sales') : [s.comp.trend && L('trend'), s.comp.season && L('season'), s.comp.noise && L('noise')].filter(Boolean).join(' + '), box.x + 6, box.y + 8, {
			color: t.series[0],
			size: 11,
			weight: 600
		});
		if (s.show.rolling && all) label(ctx, t, L('rollingNote', { n: 24 }), box.x + box.w - 4, box.y + box.h - 10, { align: 'right', color: t.series[2], size: 11, weight: 600 });
	}

	function drawDiff(ctx: CanvasRenderingContext2D, t: VizTheme, box: Box) {
		const { t0, y } = differenced(s.diff);
		const ydom = range([y]);
		const m = mapper(box, [0, N - 1], ydom);
		frame(ctx, t, box, m, years, ydom, yearLabel);
		if (s.diff !== 'none' && ydom[0] < 0 && ydom[1] > 0) {
			ctx.strokeStyle = t.axis;
			ctx.beginPath();
			ctx.moveTo(box.x, m.y(0));
			ctx.lineTo(box.x + box.w, m.y(0));
			ctx.stroke();
		}
		if (s.show.rolling) drawRolling(ctx, t, m, s.diff);
		line(ctx, m, y, t0, t.series[0], s.diff === 'none' ? 2 : 1.6);
		label(ctx, t, DIFF_LABEL[s.diff] === 'both' ? '(yₜ − yₜ₋₁) − (yₜ₋₁₂ − yₜ₋₁₃)' : diffLabel(s.diff), box.x + 6, box.y + 8, {
			color: t.series[0],
			size: 11,
			weight: 600
		});
		if (s.diff === 'lag12') vline(ctx, box, m.x(CHANGEPOINT), t.text3, L('speedsUp'), t);
	}

	function drawProcess(ctx: CanvasRenderingContext2D, t: VizTheme, box: Box) {
		const y = PROC[s.proc];
		const ydom = range([PROC.ar, PROC.ma]);
		const m = mapper(box, [0, y.length], ydom);
		frame(ctx, t, box, m, ticks(0, y.length - 1, 5), ydom, (v) => `t=${v}`);
		ctx.strokeStyle = t.axis;
		ctx.beginPath();
		ctx.moveTo(box.x, m.y(0));
		ctx.lineTo(box.x + box.w, m.y(0));
		ctx.stroke();
		line(ctx, m, y, 0, s.proc === 'ar' ? t.series[0] : t.series[4], 1.6);
		label(ctx, t, s.proc === 'ar' ? L('arSample') : L('maSample'), box.x + 6, box.y + 8, {
			color: s.proc === 'ar' ? t.series[0] : t.series[4],
			size: 11,
			weight: 600
		});
	}

	const AR_SHOW = 90;
	function drawAR(ctx: CanvasRenderingContext2D, t: VizTheme, box: Box) {
		const y = PROC.ar;
		const t0 = y.length - AR_SHOW;
		const seg = y.slice(t0);
		const fit = arFit(s.p).fitted.slice(t0);
		const ydom = range([seg, fit]);
		const m = mapper(box, [t0, y.length], ydom);
		frame(ctx, t, box, m, ticks(t0, y.length - 1, 5), ydom, (v) => `t=${v}`);
		line(ctx, m, seg, t0, alpha(t.text2, 0.8), 1.4);
		seg.forEach((v, i) => dot(ctx, m.x(t0 + i), m.y(v), 2.2, t.text2));
		line(ctx, m, fit, t0, t.series[0], 2, [5, 3]);
		label(ctx, t, L('data'), box.x + 6, box.y + 8, { color: t.text2, size: 11, weight: 600 });
		label(ctx, t, L('arOneStep', { p: s.p }), box.x + 46, box.y + 8, { color: t.series[0], size: 11, weight: 600 });
	}

	const FC_PAST = 60;
	function drawForecast(ctx: CanvasRenderingContext2D, t: VizTheme, box: Box) {
		const y = PROC.ar;
		const n = y.length;
		const t0 = n - FC_PAST;
		const fc = arForecast(s.p);
		const h = s.horizon;
		const mean = fc.mean.slice(0, h);
		const se = fc.se.slice(0, h);
		// connect the forecast to the last observation
		const fy = [y[n - 1], ...mean];
		const lo95 = [y[n - 1], ...mean.map((v, i) => v - 1.96 * se[i])];
		const hi95 = [y[n - 1], ...mean.map((v, i) => v + 1.96 * se[i])];
		const lo80 = [y[n - 1], ...mean.map((v, i) => v - 1.28 * se[i])];
		const hi80 = [y[n - 1], ...mean.map((v, i) => v + 1.28 * se[i])];
		const allFc = arForecast(s.p);
		const ydom = range([y.slice(t0), allFc.mean.map((v, i) => v + 1.96 * allFc.se[i]), allFc.mean.map((v, i) => v - 1.96 * allFc.se[i])], 0.04);
		const m = mapper(box, [t0, n - 1 + HORIZON_MAX], ydom);
		frame(ctx, t, box, m, [-40, -20, 0, 10, 20, 30].map((o) => n - 1 + o), ydom, (v) => {
			const o = v - (n - 1);
			return o === 0 ? L('now') : o > 0 ? `+${o}` : `${o}`;
		});
		const lr = arMean(arFit(s.p));
		ctx.strokeStyle = alpha(t.text3, 0.8);
		ctx.setLineDash([2, 4]);
		ctx.beginPath();
		ctx.moveTo(box.x, m.y(lr));
		ctx.lineTo(box.x + box.w, m.y(lr));
		ctx.stroke();
		ctx.setLineDash([]);
		label(ctx, t, L('lrMean'), box.x + 6, m.y(lr) - 8, { color: t.text3, size: 10 });
		band(ctx, m, n - 1, lo95, hi95, alpha(t.series[0], 0.12));
		band(ctx, m, n - 1, lo80, hi80, alpha(t.series[0], 0.18));
		vline(ctx, box, m.x(n - 1), t.text3);
		line(ctx, m, y.slice(t0), t0, t.text2, 1.6);
		line(ctx, m, fy, n - 1, t.series[0], 2.2);
		const xe = m.x(n - 1 + h);
		dot(ctx, xe, m.y(mean[h - 1]), 4, t.series[0], t.bg, 1.5);
		label(ctx, t, L('band95', { v: num(1.96 * se[h - 1]) }), clamp(xe + 6, box.x, box.x + box.w - 100), m.y(mean[h - 1] + 1.96 * se[h - 1]) - 8, {
			color: t.series[0],
			size: 10,
			weight: 600
		});
		label(ctx, t, L('history'), box.x + 6, box.y + 8, { color: t.text2, size: 11, weight: 600 });
		label(ctx, t, L('forecast'), m.x(n + 1), box.y + 8, { color: t.series[0], size: 11, weight: 600 });
	}

	function drawProphet(ctx: CanvasRenderingContext2D, t: VizTheme, box: Box) {
		const r = prophet(s.K, s.changepoints);
		const yhat = r.pred.map((p) => p.y);
		const hi = r.pred.map((p, i) => (i >= TRAIN_END - 1 ? p.y + 1.96 * p.se : NaN));
		const lo = r.pred.map((p, i) => (i >= TRAIN_END - 1 ? p.y - 1.96 * p.se : NaN));
		const ydom = range([SALES.y, hi, lo], 0.04);
		const m = mapper(box, [0, N - 1], ydom);
		frame(ctx, t, box, m, years, ydom, yearLabel);
		band(ctx, m, TRAIN_END - 1, lo.slice(TRAIN_END - 1), hi.slice(TRAIN_END - 1), alpha(t.series[0], 0.13));
		vline(ctx, box, m.x(TRAIN_END - 0.5), t.text3, L('heldOut'), t);
		SALES.y.forEach((v, i) => {
			if (i < TRAIN_END) dot(ctx, m.x(i), m.y(v), 2.2, alpha(t.text2, 0.75));
			else if (s.show.test) dot(ctx, m.x(i), m.y(v), 2.6, t.bg, t.series[3], 1.4);
		});
		// trend component
		line(
			ctx,
			m,
			r.pred.map((p) => p.trend),
			0,
			alpha(t.series[2], 0.9),
			1.5,
			[4, 3]
		);
		line(ctx, m, yhat, 0, t.series[0], 2);
		if (s.changepoints) {
			const bends = r.fit.beta.slice(2, 2 + r.fit.cps.length);
			const big = Math.max(1e-9, ...bends.map(Math.abs));
			r.fit.cps.forEach((c, i) => {
				const hgt = 3 + 14 * (Math.abs(bends[i]) / big);
				ctx.strokeStyle = t.series[2];
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(m.x(c), box.y + box.h);
				ctx.lineTo(m.x(c), box.y + box.h - hgt);
				ctx.stroke();
			});
		}
		label(ctx, t, L('fit'), box.x + 6, box.y + 8, { color: t.series[0], size: 11, weight: 600 });
		label(ctx, t, L('trendG'), box.x + 20 + ctx.measureText(L('fit')).width, box.y + 8, { color: t.series[2], size: 11, weight: 600 });
	}

	function drawBacktest(ctx: CanvasRenderingContext2D, t: VizTheme, box: Box) {
		const r = backtestOf(s.cv);
		const ydom = range([SALES.y, r.preds]);
		const m = mapper(box, [0, N - 1], ydom);
		frame(ctx, t, box, m, years, ydom, yearLabel);
		line(ctx, m, SALES.y, 0, alpha(t.text2, 0.7), 1.4);
		if (s.cv === 'walk') {
			r.folds.forEach((f) =>
				line(
					ctx,
					m,
					f.test.map((i) => r.preds[i]),
					f.test[0],
					t.series[3],
					2
				)
			);
		}
		r.preds.forEach((p, i) => {
			if (!Number.isFinite(p)) return;
			ctx.strokeStyle = alpha(t.series[3], 0.5);
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(m.x(i), m.y(p));
			ctx.lineTo(m.x(i), m.y(SALES.y[i]));
			ctx.stroke();
			dot(ctx, m.x(i), m.y(p), 2.6, t.series[3]);
		});
		label(ctx, t, L('actual'), box.x + 6, box.y + 8, { color: t.text2, size: 11, weight: 600 });
		label(ctx, t, s.cv === 'walk' ? L('walkPreds') : L('heldPreds'), box.x + 18 + ctx.measureText(L('actual')).width, box.y + 8, {
			color: t.series[3],
			size: 11,
			weight: 600
		});
	}

	/* ---------------------------------------------------------------- side panels */

	const COMP_ROWS = [
		{ key: 'trend', name: 'trend', data: SALES.trend },
		{ key: 'season', name: 'seasonality', data: SALES.season },
		{ key: 'noise', name: 'noise', data: SALES.noise }
	] as const;

	function drawComponents(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const rowH = h / 3;
		COMP_ROWS.forEach((row, i) => {
			const on = s.comp[row.key];
			const box = { x: 92, y: i * rowH + 6, w: w - 102, h: rowH - 12 };
			const m = mapper(box, [0, N - 1], range([row.data], 0.1));
			const color = on ? t.series[[0, 2, 3][i]] : alpha(t.text3, 0.45);
			label(ctx, t, L(row.name), 8, i * rowH + rowH / 2, { color: on ? t.text : t.text3, size: 11, weight: 600 });
			if (i) {
				ctx.strokeStyle = t.grid;
				ctx.beginPath();
				ctx.moveTo(0, i * rowH);
				ctx.lineTo(w, i * rowH);
				ctx.stroke();
			}
			line(ctx, m, [...row.data], 0, color, 1.5);
		});
	}

	function drawAcf(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const r = acfOf(s);
		const n = acfSeries(s).length;
		const box = { x: 40, y: 18, w: w - 52, h: h - 38 };
		const m = mapper(box, [0.3, ACF_LAGS + 0.7], [-1, 1]);
		for (const v of [-1, -0.5, 0, 0.5, 1]) {
			ctx.strokeStyle = v === 0 ? t.axis : t.grid;
			ctx.beginPath();
			ctx.moveTo(box.x, m.y(v));
			ctx.lineTo(box.x + box.w, m.y(v));
			ctx.stroke();
			label(ctx, t, String(v), box.x - 6, m.y(v), { align: 'right', color: t.text3, size: 10 });
		}
		const ci = 1.96 / Math.sqrt(n);
		ctx.fillStyle = alpha(t.text3, 0.12);
		ctx.fillRect(box.x, m.y(ci), box.w, m.y(-ci) - m.y(ci));
		ctx.strokeStyle = alpha(t.text3, 0.7);
		ctx.setLineDash([3, 3]);
		for (const v of [ci, -ci]) {
			ctx.beginPath();
			ctx.moveTo(box.x, m.y(v));
			ctx.lineTo(box.x + box.w, m.y(v));
			ctx.stroke();
		}
		ctx.setLineDash([]);
		const bw = Math.max(3, (box.w / ACF_LAGS) * 0.55);
		for (let k = 1; k <= ACF_LAGS; k++) {
			const v = r[k];
			const sig = Math.abs(v) > ci;
			ctx.fillStyle = sig ? t.series[0] : alpha(t.text3, 0.6);
			const y0 = m.y(0);
			const y1 = m.y(v);
			ctx.fillRect(m.x(k) - bw / 2, Math.min(y0, y1), bw, Math.abs(y1 - y0));
			if (k % 6 === 0 || k === 1) label(ctx, t, String(k), m.x(k), box.y + box.h + 11, { align: 'center', color: t.text3, size: 10 });
		}
		label(ctx, t, L('acfTitle'), box.x, 6, { color: t.text2, size: 11, weight: 600, base: 'top' });
		label(ctx, t, L('lagArrow'), box.x + box.w, 6, { align: 'right', color: t.text3, size: 10, base: 'top' });
	}

	let perrMap: M | null = null;
	function drawPerr(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const e = arErrors();
		const box = { x: 44, y: 20, w: w - 56, h: h - 40 };
		const lo = Math.min(...e) * 0.9;
		const hi = Math.max(...e) * 1.04;
		const m = mapper(box, [0.4, P_MAX + 0.6], [lo, hi]);
		perrMap = m;
		for (const v of ticks(lo, hi, 3)) {
			ctx.strokeStyle = t.grid;
			ctx.beginPath();
			ctx.moveTo(box.x, m.y(v));
			ctx.lineTo(box.x + box.w, m.y(v));
			ctx.stroke();
			label(ctx, t, v.toFixed(2), box.x - 6, m.y(v), { align: 'right', color: t.text3, size: 10 });
		}
		const bw = Math.min(46, (box.w / P_MAX) * 0.6);
		e.forEach((v, i) => {
			const p = i + 1;
			const cur = p === s.p;
			ctx.fillStyle = cur ? t.series[0] : alpha(t.series[0], 0.3);
			ctx.fillRect(m.x(p) - bw / 2, m.y(v), bw, box.y + box.h - m.y(v));
			label(ctx, t, `p=${p}`, m.x(p), box.y + box.h + 11, { align: 'center', color: cur ? t.text : t.text3, size: 10, weight: cur ? 700 : 500 });
			label(ctx, t, v.toFixed(3), m.x(p), m.y(v) - 8, { align: 'center', color: cur ? t.text : t.text3, size: 10 });
		});
		label(ctx, t, L('perrTitle'), box.x, 4, { color: t.text2, size: 11, weight: 600, base: 'top' });
	}
	function pickP(p: { x: number }) {
		if (!perrMap || !s.ui.p) return;
		s.p = clamp(Math.round(perrMap.invX(p.x)), 1, P_MAX);
	}

	function drawFolds(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const r = backtestOf(s.cv);
		const box = { x: 70, y: 22, w: w - 80, h: h - 30 };
		const rowH = box.h / r.folds.length;
		const cw = box.w / N;
		label(ctx, t, s.cv === 'walk' ? L('walkFolds') : L('shuffledFolds'), box.x, 4, { color: t.text2, size: 11, weight: 600, base: 'top' });
		r.folds.forEach((f, i) => {
			const y = box.y + i * rowH;
			const test = new Set(f.test);
			const train = new Set(f.train);
			for (let k = 0; k < N; k++) {
				ctx.fillStyle = test.has(k) ? t.series[3] : train.has(k) ? alpha(t.text3, 0.45) : alpha(t.text3, 0.1);
				ctx.fillRect(box.x + k * cw + 0.3, y + 2, Math.max(1, cw - 0.6), rowH - 4);
			}
			label(ctx, t, L('foldN', { n: i + 1 }), 6, y + rowH / 2, { color: t.text3, size: 10 });
			label(ctx, t, num(r.maes[i]), box.x - 6, y + rowH / 2, { align: 'right', color: t.series[3], size: 10, weight: 600 });
		});
	}

	/* ---------------------------------------------------------------- readouts + controls */

	const readouts = $derived.by(() => {
		const v = s.view;
		if (v === 'sales') {
			const r = rollingOf('none');
			return [
				{ label: L('months'), value: String(N) },
				{ label: L('first2'), value: num(r[0].mean, 1) },
				{ label: L('last2'), value: num(r[r.length - 1].mean, 1), highlight: s.show.rolling }
			];
		}
		if (v === 'diff')
			return [
				{ label: L('series'), value: diffLabel(s.diff) },
				{ label: L('meanDrift'), value: num(drift(s.diff), 1), highlight: true },
				{ label: 'r₁', value: num(acfOf(s)[1]) },
				{ label: 'r₁₂', value: num(acfOf(s)[12]) }
			];
		if (v === 'process')
			return [
				{ label: L('process'), value: s.proc === 'ar' ? 'AR(2)' : 'MA(1)' },
				{ label: 'r₁', value: num(acfOf(s)[1]), highlight: true },
				{ label: 'r₂', value: num(acfOf(s)[2]), highlight: true },
				{ label: 'r₃', value: num(acfOf(s)[3]) }
			];
		if (v === 'ar') {
			const f = arFit(s.p);
			return [
				{ label: 'p', value: String(s.p) },
				{ label: 'φ̂', value: f.phi.map((x) => num(x)).join(', ') },
				{ label: 'σ', value: num(f.sigma, 3), highlight: true }
			];
		}
		if (v === 'forecast') {
			const fc = arForecast(s.p);
			return [
				{ label: L('horizon'), value: `${s.horizon}` },
				{ label: L('forecast'), value: num(fc.mean[s.horizon - 1]) },
				{ label: '95% ±', value: num(1.96 * fc.se[s.horizon - 1]), highlight: true }
			];
		}
		if (v === 'prophet') {
			const r = prophet(s.K, s.changepoints);
			return [
				{ label: 'K', value: String(s.K) },
				{ label: L('changepoints'), value: s.changepoints ? L('on') : L('off') },
				{ label: L('heldMae'), value: num(r.mae), highlight: true }
			];
		}
		return [
			{ label: L('shuffledMae'), value: num(backtestOf('shuffled').mae), highlight: s.cv === 'shuffled' },
			{ label: L('walkMae'), value: s.cv === 'walk' ? num(backtestOf('walk').mae) : '?', highlight: s.cv === 'walk' }
		];
	});

	const VIEWS: { value: View; label: string }[] = $derived([
		{ value: 'sales', label: L('vDecompose') },
		{ value: 'diff', label: L('vDiff') },
		{ value: 'process', label: L('vProcess') },
		{ value: 'ar', label: L('vAr') },
		{ value: 'forecast', label: L('vForecast') },
		{ value: 'prophet', label: L('vProphet') },
		{ value: 'backtest', label: L('vBacktest') }
	]);

	function toggle(k: 'trend' | 'season' | 'noise') {
		s.comp[k] = !s.comp[k];
		if (!s.comp[k]) s.did[k] = true;
	}

	const v = $derived(s.view);
	const showComp = $derived(v === 'sales' && s.show.components);
	const showAcf = $derived((v === 'diff' || v === 'process') && s.show.acf);
	const showPerr = $derived(v === 'ar' && s.show.perr);
	const showFolds = $derived(v === 'backtest' && s.show.folds);
	const anyUi = $derived(
		s.ui.view ||
			(s.ui.comp && v === 'sales') ||
			(s.ui.diff && v === 'diff') ||
			(s.ui.proc && v === 'process') ||
			(s.ui.p && (v === 'ar' || v === 'forecast')) ||
			(s.ui.horizon && v === 'forecast') ||
			((s.ui.K || s.ui.cps) && v === 'prophet') ||
			(s.ui.cv && v === 'backtest')
	);
</script>

<div class="scene">
	<Canvas draw={drawMain} aspect={0.5} minHeight={240} maxHeight={360} label={L('chartLabel')} />

	<Readouts items={readouts} />

	{#if showComp}
		<div class="panel">
			<Canvas draw={drawComponents} aspect={0.3} minHeight={150} maxHeight={190} label={L('compLabel')} />
		</div>
	{/if}
	{#if showAcf}
		<div class="panel">
			<Canvas draw={drawAcf} aspect={0.3} minHeight={150} maxHeight={190} label={L('acfLabel')} />
		</div>
	{/if}
	{#if showPerr}
		<div class="panel">
			<Canvas
				draw={drawPerr}
				aspect={0.28}
				minHeight={140}
				maxHeight={170}
				label={L('perrLabel')}
				onpointerdown={pickP}
				cursor={s.ui.p ? 'pointer' : 'default'}
			/>
		</div>
	{/if}
	{#if showFolds}
		<div class="panel">
			<Canvas draw={drawFolds} aspect={0.24} minHeight={130} maxHeight={160} label={L('foldsLabel')} />
		</div>
	{/if}

	{#if anyUi}
		<div class="controls">
			{#if s.ui.view}
				<div class="chips wide" role="radiogroup" aria-label={L('view')}>
					{#each VIEWS as o (o.value)}
						<button class="chip" role="radio" aria-checked={s.view === o.value} class:on={s.view === o.value} onclick={() => (s.view = o.value)}>{o.label}</button>
					{/each}
				</div>
			{/if}
			{#if s.ui.comp && v === 'sales'}
				<div class="group">
					<span class="lbl">{L('components')}</span>
					<div class="chips">
						{#each COMP_ROWS as row (row.key)}
							<button class="chip toggle" aria-pressed={s.comp[row.key]} class:on={s.comp[row.key]} onclick={() => toggle(row.key)}>
								{s.comp[row.key] ? '✓ ' : ''}{L(row.name)}
							</button>
						{/each}
					</div>
				</div>
			{/if}
			{#if s.ui.diff && v === 'diff'}
				<Segmented
					label={L('differencing')}
					bind:value={s.diff}
					options={[
						{ value: 'none', label: L('none') },
						{ value: 'lag1', label: L('lag1') },
						{ value: 'lag12', label: L('lag12') },
						{ value: 'both', label: L('bothOpt') }
					]}
				/>
			{/if}
			{#if s.ui.proc && v === 'process'}
				<Segmented
					label={L('processSeg')}
					bind:value={s.proc}
					options={[
						{ value: 'ar', label: 'AR(2)' },
						{ value: 'ma', label: 'MA(1)' }
					]}
					onchange={(p) => {
						if (p === 'ma') s.did.ma = true;
					}}
				/>
			{/if}
			{#if s.ui.p && (v === 'ar' || v === 'forecast')}
				<Slider label={L('pSlider')} bind:value={s.p} min={1} max={P_MAX} />
			{/if}
			{#if s.ui.horizon && v === 'forecast'}
				<Slider label={L('hSlider')} bind:value={s.horizon} min={1} max={HORIZON_MAX} />
			{/if}
			{#if s.ui.K && v === 'prophet'}
				<Slider label={L('kSlider')} bind:value={s.K} min={1} max={6} />
			{/if}
			{#if s.ui.cps && v === 'prophet'}
				<Segmented
					label={L('cpsSeg')}
					value={s.changepoints ? 'on' : 'off'}
					options={[
						{ value: 'off', label: L('offOpt') },
						{ value: 'on', label: L('onOpt') }
					]}
					onchange={(c) => (s.changepoints = c === 'on')}
				/>
			{/if}
			{#if s.ui.cv && v === 'backtest'}
				<Segmented
					label={L('validation')}
					bind:value={s.cv}
					options={[
						{ value: 'shuffled', label: L('shuffledOpt') },
						{ value: 'walk', label: L('walkOpt') }
					]}
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
	.group {
		display: grid;
		gap: 4px;
	}
	.lbl {
		font-size: 0.8125rem;
		color: var(--text-2);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.chips.wide {
		flex-basis: 100%;
	}
	.chip {
		height: 28px;
		padding: 0 11px;
		border-radius: var(--radius-full);
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text-2);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		white-space: nowrap;
	}
	.chip:hover {
		color: var(--text);
		border-color: var(--border-strong);
	}
	.chip.on {
		border-color: color-mix(in srgb, var(--acc, var(--accent)) 55%, transparent);
		background: color-mix(in srgb, var(--acc, var(--accent)) 10%, var(--surface));
		color: var(--text);
	}
</style>
