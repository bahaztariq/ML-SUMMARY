<script lang="ts">
	import Canvas from '#lib/viz/Canvas.svelte';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import { alpha, clamp, label, squareMapper, type VizTheme } from '#lib/viz/canvas.ts';
	import type { SceneProps } from '../types.ts';
	import { classColor, grid, lineChart, marker, pill, pillWidth } from '../_ensembles/draw.ts';
	import { f2, f3, pct } from '../_ensembles/memo.ts';
	import { arRounds } from '../_ensembles/i18n.ts';
	import { i18n, local } from '#lib/i18n/index.svelte.ts';
	import TreeShape from '../_ensembles/TreeShape.svelte';
	import * as l from './lgb.ts';
	import {
		GRID,
		LEAF_STEPS,
		MAX_ROUNDS,
		UNLIMITED,
		bestBinned,
		bestExact,
		big,
		bigFull,
		bigGH,
		binned,
		featName,
		firstTree,
		gossSample,
		gossSplit,
		hist,
		leafCurve,
		probGrid,
		randomSplit,
		samplerStats,
		scanOf,
		train,
		trainLoss,
		treeDepth,
		validLoss,
		type LGBState
	} from './state.ts';

	let { s = $bindable(), step }: SceneProps<LGBState> = $props();

	const en = {
		exactPill: 'exact: {split} · gain {gain}',
		binsPill: '{n} bins: {split} · gain {gain}',
		histTitle: 'gradient histogram of {f}: sum of g per bin (bars) and gain at each bin edge (line)',
		gainV: 'gain {v}',
		nBins: '{n} bins',
		low: 'low',
		leafTitle: 'leaf-wise (LightGBM)',
		levelTitle: 'level-wise (depth-wise)',
		fullData: 'full data',
		randomSample: 'random sample',
		leafCurveTitle: 'validation log-loss after {n} rounds vs num_leaves',
		noDepth: 'no depth limit',
		current: 'current',
		lossTitle: 'log-loss vs boosting rounds',
		train: 'train',
		valid: 'valid',
		thresholds: 'thresholds x₁ / x₂',
		gainKept: 'gain kept',
		bestGain: 'best gain (any feature)',
		leaves: 'leaves',
		depthLL: 'depth leaf / level',
		gainLL: 'total gain leaf / level',
		rounds: 'rounds',
		trainLL: 'train log-loss',
		validLL: 'valid log-loss',
		rowsUsed: 'rows used',
		weightSampled: 'weight of sampled',
		sameSplit: 'same split: GOSS / random',
		ofN: '{a} / {b} of {n}',
		ariaLeafPart: 'Leaf-wise tree partition',
		ariaLeafShape: 'Leaf-wise tree shape',
		ariaLevelPart: 'Level-wise tree partition',
		ariaLevelShape: 'Level-wise tree shape',
		ariaGoss: 'GOSS: large-gradient rows kept, a few small-gradient rows sampled',
		kept: 'kept: large |g| (size = |g|)',
		sampledRest: 'sampled from the rest (up-weighted)',
		dropped: 'dropped this round',
		ariaMain: 'Two-class scatter plot with histogram bin edges',
		class0: 'class 0',
		class1: 'class 1',
		binEdges: 'bin edges',
		shading: 'shading = predicted probability after {rounds}',
		ariaHist: 'Gradient histogram and the gain at each bin edge',
		ariaLeafCurve: 'Validation loss by num_leaves',
		ariaLoss: 'Training and validation log-loss by round',
		histOf: 'Histogram of',
		growth: 'Growth',
		leafWise: 'leaf-wise',
		levelWise: 'level-wise',
		noLimit: '-1 (none)',
		rowsPerTree: 'Rows per tree',
		allRows: 'all rows',
		newSample: '↻ New sample',
		oneRound: '1 round',
		nRounds: '{n} rounds'
	};
	const L = local({
		en,
		fr: {
			exactPill: 'exact : {split} · gain {gain}',
			binsPill: '{n} intervalles : {split} · gain {gain}',
			histTitle: 'histogramme des gradients de {f} : somme de g par intervalle (barres) et gain à chaque borne (ligne)',
			gainV: 'gain {v}',
			nBins: '{n} intervalles',
			low: 'bas',
			leafTitle: 'feuille par feuille (LightGBM)',
			levelTitle: 'niveau par niveau (en profondeur)',
			fullData: 'toutes les données',
			randomSample: 'échantillon aléatoire',
			leafCurveTitle: 'log-loss de validation après {n} tours selon num_leaves',
			noDepth: 'sans limite de profondeur',
			current: 'actuel',
			lossTitle: 'log-loss selon les tours de boosting',
			train: 'entr.',
			valid: 'valid.',
			thresholds: 'seuils x₁ / x₂',
			gainKept: 'gain conservé',
			bestGain: 'meilleur gain (toute variable)',
			leaves: 'feuilles',
			depthLL: 'profondeur feuille / niveau',
			gainLL: 'gain total feuille / niveau',
			rounds: 'tours',
			trainLL: 'log-loss entr.',
			validLL: 'log-loss valid.',
			rowsUsed: 'lignes utilisées',
			weightSampled: 'poids des échantillonnées',
			sameSplit: 'même division : GOSS / aléatoire',
			ofN: '{a} / {b} sur {n}',
			ariaLeafPart: 'Partition de l’arbre feuille par feuille',
			ariaLeafShape: 'Forme de l’arbre feuille par feuille',
			ariaLevelPart: 'Partition de l’arbre niveau par niveau',
			ariaLevelShape: 'Forme de l’arbre niveau par niveau',
			ariaGoss: 'GOSS : lignes à grand gradient conservées, quelques lignes à petit gradient échantillonnées',
			kept: 'conservées : grand |g| (taille = |g|)',
			sampledRest: 'échantillonnées parmi le reste (repondérées)',
			dropped: 'écartées à ce tour',
			ariaMain: 'Nuage de points à deux classes avec les bornes des intervalles d’histogramme',
			class0: 'classe 0',
			class1: 'classe 1',
			binEdges: 'bornes des intervalles',
			shading: 'ombrage = probabilité prédite après {rounds}',
			ariaHist: 'Histogramme des gradients et gain à chaque borne d’intervalle',
			ariaLeafCurve: 'Perte de validation selon num_leaves',
			ariaLoss: 'Log-loss d’entraînement et de validation par tour',
			histOf: 'Histogramme de',
			growth: 'Croissance',
			leafWise: 'feuille par feuille',
			levelWise: 'niveau par niveau',
			noLimit: '-1 (aucune)',
			rowsPerTree: 'Lignes par arbre',
			allRows: 'toutes les lignes',
			newSample: '↻ Nouvel échantillon',
			oneRound: '1 tour',
			nRounds: '{n} tours'
		},
		ar: {
			exactPill: 'الدقيق: {split} · الكسب {gain}',
			binsPill: '{n} فئة: {split} · الكسب {gain}',
			histTitle: 'المدرّج التكراري للتدرّجات لـ{f}: مجموع g لكل فئة (أعمدة) والكسب عند كل حدّ (خط)',
			gainV: 'الكسب {v}',
			nBins: '{n} فئة',
			low: 'منخفض',
			leafTitle: 'ورقةً بورقة (LightGBM)',
			levelTitle: 'مستوًى بمستوى (حسب العمق)',
			fullData: 'كل البيانات',
			randomSample: 'عيّنة عشوائية',
			leafCurveTitle: 'log-loss التحقق بعد {n} جولة مقابل num_leaves',
			noDepth: 'بلا حدّ للعمق',
			current: 'الحالي',
			lossTitle: 'log-loss مقابل جولات التعزيز',
			train: 'تدريب',
			valid: 'تحقق',
			thresholds: 'العتبات x₁ / x₂',
			gainKept: 'الكسب المحفوظ',
			bestGain: 'أفضل كسب (أي ميزة)',
			leaves: 'الأوراق',
			depthLL: 'العمق ورقة / مستوى',
			gainLL: 'الكسب الكلي ورقة / مستوى',
			rounds: 'الجولات',
			trainLL: 'log-loss التدريب',
			validLL: 'log-loss التحقق',
			rowsUsed: 'الصفوف المستخدمة',
			weightSampled: 'وزن المسحوبة',
			sameSplit: 'التقسيم نفسه: GOSS / عشوائي',
			ofN: '{a} / {b} من {n}',
			ariaLeafPart: 'تقسيم الشجرة ورقةً بورقة',
			ariaLeafShape: 'شكل الشجرة ورقةً بورقة',
			ariaLevelPart: 'تقسيم الشجرة مستوًى بمستوى',
			ariaLevelShape: 'شكل الشجرة مستوًى بمستوى',
			ariaGoss: 'GOSS: الإبقاء على الصفوف ذات التدرّج الكبير، وسحب عيّنة صغيرة من الصفوف ذات التدرّج الصغير',
			kept: 'محفوظة: |g| كبير (الحجم = |g|)',
			sampledRest: 'مسحوبة من الباقي (بوزن مضاعَف)',
			dropped: 'مستبعدة في هذه الجولة',
			ariaMain: 'مخطط انتشار بفئتين مع حدود فئات المدرّج التكراري',
			class0: 'الفئة 0',
			class1: 'الفئة 1',
			binEdges: 'حدود الفئات',
			shading: 'التظليل = الاحتمال المتوقَّع بعد {rounds}',
			ariaHist: 'المدرّج التكراري للتدرّجات والكسب عند كل حدّ فئة',
			ariaLeafCurve: 'خسارة التحقق حسب num_leaves',
			ariaLoss: 'log-loss التدريب والتحقق حسب الجولة',
			histOf: 'المدرّج التكراري لـ',
			growth: 'النمو',
			leafWise: 'ورقةً بورقة',
			levelWise: 'مستوًى بمستوى',
			noLimit: '-1 (بلا حد)',
			rowsPerTree: 'الصفوف لكل شجرة',
			allRows: 'كل الصفوف',
			newSample: '↻ عيّنة جديدة',
			oneRound: 'جولة واحدة',
			nRounds: '{n} جولة'
		}
	});
	const roundsText = (n: number) => (i18n.current === 'ar' ? arRounds(n) : n === 1 ? L('oneRound') : L('nRounds', { n }));

	const DOMAIN: [number, number] = [-1.05, 1.05];
	type M = ReturnType<typeof squareMapper>;

	function axes(ctx: CanvasRenderingContext2D, t: VizTheme, w: number, h: number) {
		label(ctx, t, 'x₁ →', w - 10, h - 8, { align: 'right', color: t.text3, size: 10, base: 'bottom' });
		label(ctx, t, '↑ x₂', 6, 8, { color: t.text3, size: 10, base: 'top' });
	}

	function splitLine(ctx: CanvasRenderingContext2D, m: M, w: number, h: number, f: number, thr: number, color: string, width: number, dash: number[] = []) {
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.setLineDash(dash);
		ctx.beginPath();
		if (f === 0) {
			ctx.moveTo(m.x(thr), 0);
			ctx.lineTo(m.x(thr), h);
		} else {
			ctx.moveTo(0, m.y(thr));
			ctx.lineTo(w, m.y(thr));
		}
		ctx.stroke();
		ctx.setLineDash([]);
	}

	function points(ctx: CanvasRenderingContext2D, t: VizTheme, m: M, r = 3.4) {
		const d = train();
		d.X.forEach((p, i) => marker(ctx, m.x(p[0]), m.y(p[1]), d.y[i], r, alpha(classColor(t, d.y[i]), 0.85), t.bg, 1));
	}

	/* ---- scatter with bin edges (data / hist / model modes) ---- */
	function draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const m = squareMapper({ x: 8, y: 8, w: w - 16, h: h - 16 }, DOMAIN);
		if (s.mode === 'model') {
			const pg = probGrid(s);
			const x0 = m.x(GRID.lo);
			const x1 = m.x(GRID.hi);
			const y0 = m.y(GRID.hi);
			const y1 = m.y(GRID.lo);
			for (let iy = 0; iy < GRID.ny; iy++)
				for (let ix = 0; ix < GRID.nx; ix++) {
					const p = pg[iy * GRID.nx + ix];
					const a = Math.round(x0 + (ix / GRID.nx) * (x1 - x0));
					const b = Math.round(x0 + ((ix + 1) / GRID.nx) * (x1 - x0));
					const c = Math.round(y1 - ((iy + 1) / GRID.ny) * (y1 - y0));
					const d = Math.round(y1 - (iy / GRID.ny) * (y1 - y0));
					ctx.fillStyle = alpha(classColor(t, p > 0.5 ? 1 : 0), 0.05 + 0.3 * Math.abs(2 * p - 1));
					ctx.fillRect(a, c, b - a, d - c);
				}
		} else grid(ctx, t, m, w, h);

		if (s.show.edges && s.mode !== 'model') {
			const e = binned(s.maxBin).edges;
			for (const f of s.mode === 'hist' ? [s.feat] : [0, 1])
				for (const v of e[f]) splitLine(ctx, m, w, h, f, v, alpha(t.text3, 0.35), 1);
		}
		points(ctx, t, m);
		if (s.show.compare && s.mode === 'data') {
			const ex = bestExact();
			const bb = bestBinned(s.maxBin);
			splitLine(ctx, m, w, h, ex.f, ex.thr, t.text2, 1.5, [5, 4]);
			splitLine(ctx, m, w, h, bb.f, bb.thr, t.series[3], 2.5);
			pill(ctx, t, L('exactPill', { split: `${featName(ex.f)} ≤ ${f2(ex.thr)}`, gain: f2(ex.gain) }), 12, h - 48, t.text2, 10);
			pill(ctx, t, L('binsPill', { n: s.maxBin, split: `${featName(bb.f)} ≤ ${f2(bb.thr)}`, gain: f2(bb.gain) }), 12, h - 24, t.series[3], 10);
		}
		if (s.mode === 'hist' && s.pickBin >= 0) {
			const sc = scanOf(s.maxBin, s.feat);
			if (s.pickBin < sc.length) splitLine(ctx, m, w, h, s.feat, sc[s.pickBin].thr, t.series[3], 2.5);
		}
		axes(ctx, t, w, h);
	}

	/* ---- gradient histogram for the chosen feature ---- */
	let histBox: { x: number; w: number; k: number } | null = null;
	function drawHist(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const H = hist(s.maxBin, s.feat);
		const sc = scanOf(s.maxBin, s.feat);
		const k = H.G.length;
		const box = { x: 40, y: 22, w: w - 52, h: h - 44 };
		histBox = { x: box.x, w: box.w, k };
		const gmax = Math.max(...Array.from(H.G, Math.abs), 1e-9);
		const best = Math.max(...sc.map((c) => c.gain));
		const mid = box.y + box.h * 0.62;
		const barH = box.h * 0.36;
		const bw = box.w / k;
		label(ctx, t, L('histTitle', { f: featName(s.feat) }), 6, 4, {
			color: t.text3,
			size: 10,
			base: 'top'
		});
		ctx.strokeStyle = t.axis;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(box.x, mid);
		ctx.lineTo(box.x + box.w, mid);
		ctx.stroke();
		label(ctx, t, 'ΣG 0', box.x - 4, mid, { align: 'right', color: t.text3, size: 9 });
		for (let i = 0; i < k; i++) {
			const v = H.G[i] / gmax;
			ctx.fillStyle = alpha(v > 0 ? t.series[0] : t.series[2], 0.7);
			const y = v > 0 ? mid - v * barH : mid;
			ctx.fillRect(box.x + i * bw + 1, y, Math.max(1, bw - 2), Math.abs(v) * barH);
		}
		// gain line at the edges (between bars)
		const gy = (g: number) => box.y + box.h * 0.95 - (g / best) * box.h * 0.9;
		ctx.strokeStyle = t.text;
		ctx.lineWidth = 1.75;
		ctx.beginPath();
		sc.forEach((c, i) => {
			const x = box.x + (i + 1) * bw;
			if (i) ctx.lineTo(x, gy(c.gain));
			else ctx.moveTo(x, gy(c.gain));
		});
		ctx.stroke();
		const bi = sc.findIndex((c) => c.gain === best);
		const bx = box.x + (bi + 1) * bw;
		if (s.pickBin === bi) {
			ctx.fillStyle = t.series[1];
			ctx.beginPath();
			ctx.arc(bx, gy(best), 4, 0, Math.PI * 2);
			ctx.fill();
		}
		if (s.pickBin >= 0 && s.pickBin < sc.length) {
			const x = box.x + (s.pickBin + 1) * bw;
			ctx.strokeStyle = t.series[3];
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(x, box.y);
			ctx.lineTo(x, box.y + box.h);
			ctx.stroke();
			const text = `≤ ${f2(sc[s.pickBin].thr)} · ${L('gainV', { v: f2(sc[s.pickBin].gain) })}`;
			pill(ctx, t, text, clamp(x + 6, box.x, w - pillWidth(ctx, t, text, 10) - 4), box.y + 8, t.series[3], 10);
		}
		label(ctx, t, L('nBins', { n: k }), box.x + box.w, box.y + box.h + 12, { align: 'right', color: t.text3, size: 10 });
		label(ctx, t, L('low'), box.x, box.y + box.h + 12, { color: t.text3, size: 10 });
	}
	function histPick(p: { x: number }) {
		if (!histBox || !s.ui.pickBin) return;
		const bw = histBox.w / histBox.k;
		const i = Math.round((p.x - histBox.x) / bw) - 1;
		s.pickBin = clamp(i, 0, histBox.k - 2);
		s.did.pick = true;
	}

	/* ---- leaf-wise vs level-wise partitions ---- */
	interface Rect {
		x0: number;
		x1: number;
		y0: number;
		y1: number;
	}
	function walk(n: l.LNode, r: Rect, leaf: (n: l.LNode, r: Rect) => void, split: (n: l.LNode, r: Rect) => void) {
		if (!n.split || !n.left || !n.right) return leaf(n, r);
		split(n, r);
		const { f, thr } = n.split;
		if (f === 0) {
			walk(n.left, { ...r, x1: thr }, leaf, split);
			walk(n.right, { ...r, x0: thr }, leaf, split);
		} else {
			walk(n.left, { ...r, y1: thr }, leaf, split);
			walk(n.right, { ...r, y0: thr }, leaf, split);
		}
	}
	function drawTree(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme, policy: 'leaf' | 'level') {
		const m = squareMapper({ x: 4, y: 22, w: w - 8, h: h - 26 }, DOMAIN);
		const tree = firstTree(s, policy);
		const B: Rect = { x0: -3, x1: 3, y0: -3, y1: 3 };
		const px = (r: Rect) => {
			const x0 = clamp(m.x(r.x0), 0, w);
			const x1 = clamp(m.x(r.x1), 0, w);
			const y0 = clamp(m.y(r.y1), 22, h);
			const y1 = clamp(m.y(r.y0), 22, h);
			return { x0, x1, y0, y1 };
		};
		const maxW = 2;
		walk(
			tree,
			B,
			(n, r) => {
				const q = px(r);
				ctx.fillStyle = alpha(classColor(t, n.w > 0 ? 1 : 0), 0.06 + 0.3 * Math.min(1, Math.abs(n.w) / maxW));
				ctx.fillRect(q.x0, q.y0, q.x1 - q.x0, q.y1 - q.y0);
			},
			() => {}
		);
		const d = train();
		d.X.forEach((p, i) => marker(ctx, m.x(p[0]), m.y(p[1]), d.y[i], 2.2, alpha(classColor(t, d.y[i]), 0.75)));
		walk(
			tree,
			B,
			() => {},
			(n, r) => {
				const q = px(r);
				ctx.strokeStyle = t.text;
				ctx.lineWidth = 1.5;
				ctx.beginPath();
				let lx: number, ly: number;
				if (n.split!.f === 0) {
					const x = m.x(n.split!.thr);
					ctx.moveTo(x, q.y0);
					ctx.lineTo(x, q.y1);
					lx = x;
					ly = (Math.max(q.y0, 22) + Math.min(q.y1, h)) / 2;
				} else {
					const y = m.y(n.split!.thr);
					ctx.moveTo(q.x0, y);
					ctx.lineTo(q.x1, y);
					lx = (q.x0 + q.x1) / 2;
					ly = y;
				}
				ctx.stroke();
				if (n.order) {
					ctx.fillStyle = t.bg;
					ctx.beginPath();
					ctx.arc(lx, ly, 8, 0, Math.PI * 2);
					ctx.fill();
					ctx.strokeStyle = t.text;
					ctx.lineWidth = 1.25;
					ctx.stroke();
					label(ctx, t, String(n.order), lx, ly + 0.5, { align: 'center', color: t.text, size: 9, weight: 700 });
				}
			}
		);
		label(ctx, t, policy === 'leaf' ? L('leafTitle') : L('levelTitle'), 6, 4, { color: t.text, size: 11, base: 'top', weight: 600 });
	}

	/* ---- GOSS view ---- */
	function drawGoss(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const m = squareMapper({ x: 8, y: 8, w: w - 16, h: h - 16 }, DOMAIN);
		grid(ctx, t, m, w, h);
		const d = big();
		const g = bigGH().g;
		const smp = gossSample(s, s.gossDraw);
		const top = new Set(smp.top);
		const sampled = new Set(smp.sampled);
		d.X.forEach((p, i) => {
			if (top.has(i) || sampled.has(i)) return;
			marker(ctx, m.x(p[0]), m.y(p[1]), d.y[i], 1.1, alpha(t.text3, 0.3));
		});
		for (const i of smp.sampled) {
			const p = d.X[i];
			marker(ctx, m.x(p[0]), m.y(p[1]), d.y[i], 2.4, null, alpha(classColor(t, d.y[i]), 0.9), 1.2);
		}
		for (const i of smp.top) {
			const p = d.X[i];
			marker(ctx, m.x(p[0]), m.y(p[1]), d.y[i], 1.6 + 2.6 * Math.abs(g[i]), alpha(classColor(t, d.y[i]), 0.9));
		}
		const full = bigFull();
		const gs = gossSplit(s, s.gossDraw);
		const rs = randomSplit(s, s.gossDraw);
		splitLine(ctx, m, w, h, full.f, full.thr, t.text2, 1.5, [6, 4]);
		if (rs) splitLine(ctx, m, w, h, rs.f, rs.thr, t.series[4], 2, [2, 3]);
		if (gs) splitLine(ctx, m, w, h, gs.f, gs.thr, t.series[3], 2.5);
		pill(ctx, t, `${L('fullData')}: ${featName(full.f)} ≤ ${f2(full.thr)}`, 12, h - 70, t.text2, 10);
		if (gs) pill(ctx, t, `GOSS: ${featName(gs.f)} ≤ ${f2(gs.thr)}`, 12, h - 46, t.series[3], 10);
		if (rs) pill(ctx, t, `${L('randomSample')}: ${featName(rs.f)} ≤ ${f2(rs.thr)}`, 12, h - 22, t.series[4], 10);
		axes(ctx, t, w, h);
	}

	/* ---- charts ---- */
	function drawLeafCurve(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const c = leafCurve(s);
		const cur = validLoss(s)[MAX_ROUNDS];
		const lg = (n: number) => Math.log2(n);
		const vals = [...c, cur];
		const lo = Math.floor(Math.min(...vals) * 20) / 20 - 0.05;
		const hi = Math.ceil(Math.max(...vals) * 20) / 20 + 0.05;
		lineChart(ctx, w, h, t, {
			title: L('leafCurveTitle', { n: MAX_ROUNDS }),
			x: [1, 6],
			y: [Math.max(0, lo), hi],
			xTicks: [1, 2, 3, 4, 5, 6],
			xFormat: (v) => String(2 ** v),
			lines: [{ pts: LEAF_STEPS.map((n, i) => [lg(n), c[i]] as [number, number]), color: t.text3, width: 1.75, dots: true, label: L('noDepth') }],
			points: [[clamp(lg(s.numLeaves), 1, 6), cur, t.series[3], L('current')]],
			right: 90
		});
	}

	let lossMap: ReturnType<typeof lineChart> | null = null;
	function drawLoss(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const tl = trainLoss(s);
		const vl = validLoss(s);
		const pts = (a: number[]) => a.map((v, i) => [i, v] as [number, number]);
		lossMap = lineChart(ctx, w, h, t, {
			title: L('lossTitle'),
			x: [0, MAX_ROUNDS],
			y: [0, Math.ceil(Math.max(tl[0], vl[0]) * 10) / 10],
			lines: [
				{ pts: pts(tl), color: t.text2, label: L('train') },
				{ pts: pts(vl), color: t.series[4], label: L('valid') }
			],
			marker: s.rounds,
			markerLabel: String(s.rounds),
			right: 50
		});
	}
	let lossDrag = false;
	function lossPick(p: { x: number }) {
		if (!lossMap || !s.ui.rounds) return;
		s.rounds = Math.round(clamp(lossMap.invX(p.x), 1, MAX_ROUNDS));
	}

	/* ---- readouts ---- */
	const readouts = $derived.by(() => {
		const items: { label: string; value: string; highlight?: boolean }[] = [];
		if (s.mode === 'data' || s.mode === 'hist') {
			const e = binned(s.maxBin).edges;
			items.push({ label: 'max_bin', value: String(s.maxBin) }, { label: L('thresholds'), value: `${e[0].length} / ${e[1].length}` });
			if (s.show.compare) items.push({ label: L('gainKept'), value: pct(bestBinned(s.maxBin).gain / bestExact().gain, 1), highlight: true });
			if (s.mode === 'hist') items.push({ label: L('bestGain'), value: s.did.pick ? f2(bestBinned(s.maxBin).gain) : '?' });
		} else if (s.mode === 'pair') {
			const leafTree = firstTree(s, 'leaf');
			const levelTree = firstTree(s, 'level');
			items.push({ label: L('leaves'), value: String(s.numLeaves) }, { label: L('depthLL'), value: `${treeDepth(leafTree)} / ${treeDepth(levelTree)}` });
			if (s.show.gains) items.push({ label: L('gainLL'), value: `${f2(l.totalGain(leafTree))} / ${f2(l.totalGain(levelTree))}`, highlight: true });
		} else if (s.mode === 'model') {
			items.push(
				{ label: L('rounds'), value: String(s.rounds) },
				{ label: L('trainLL'), value: f3(trainLoss(s)[s.rounds]) },
				{ label: L('validLL'), value: f3(validLoss(s)[s.rounds]), highlight: true }
			);
		} else {
			const g = gossSample(s, s.gossDraw);
			const st = samplerStats(s);
			items.push(
				{ label: L('rowsUsed'), value: `${g.rows.length} (${pct(g.rows.length / big().y.length)})` },
				{ label: L('weightSampled'), value: `×${f2(g.amp)}` },
				{ label: L('sameSplit'), value: L('ofN', { a: st.gSame, b: st.rSame, n: 20 }), highlight: true }
			);
		}
		return items;
	});

	const levels = $derived(s.mode === 'pair' ? Math.max(treeDepth(firstTree(s, 'leaf')), treeDepth(firstTree(s, 'level'))) : 0);
	const anyUi = $derived(Object.values(s.ui).some(Boolean));
</script>

<div class="scene">
	{#if s.mode === 'pair'}
		<div class="pair">
			<div>
				<Canvas draw={(c, w, h, t) => drawTree(c, w, h, t, 'leaf')} aspect={1.05} minHeight={160} maxHeight={330} label={L('ariaLeafPart')} />
				<div class="shape"><TreeShape root={firstTree(s, 'leaf')} {levels} label={L('ariaLeafShape')} /></div>
			</div>
			<div>
				<Canvas draw={(c, w, h, t) => drawTree(c, w, h, t, 'level')} aspect={1.05} minHeight={160} maxHeight={330} label={L('ariaLevelPart')} />
				<div class="shape"><TreeShape root={firstTree(s, 'level')} {levels} label={L('ariaLevelShape')} /></div>
			</div>
		</div>
	{:else if s.mode === 'goss'}
		<Canvas draw={drawGoss} aspect={0.72} minHeight={260} maxHeight={430} label={L('ariaGoss')} />
		<div class="legend">
			<span class="key"><i class="dot a"></i>{L('kept')}</span>
			<span class="key"><i class="ring"></i>{L('sampledRest')}</span>
			<span class="key"><i class="dot faint"></i>{L('dropped')}</span>
		</div>
	{:else}
		<Canvas {draw} aspect={0.72} minHeight={260} maxHeight={430} label={L('ariaMain')} />
		<div class="legend">
			<span class="key"><i class="dot a"></i>{L('class0')}</span>
			<span class="key"><i class="sq b"></i>{L('class1')}</span>
			{#if s.show.edges && s.mode !== 'model'}<span class="key"><i class="edge"></i>{L('binEdges')}</span>{/if}
			{#if s.mode === 'model'}<span class="key note">{L('shading', { rounds: roundsText(s.rounds) })}</span>{/if}
		</div>
	{/if}

	<Readouts items={readouts} />

	{#if s.mode === 'hist'}
		<div class="chart">
			<Canvas
				draw={drawHist}
				aspect={0.32}
				minHeight={150}
				maxHeight={190}
				label={L('ariaHist')}
				cursor="pointer"
				onpointerdown={histPick}
			/>
		</div>
	{/if}
	{#if s.show.leafCurve}
		<div class="chart"><Canvas draw={drawLeafCurve} aspect={0.28} minHeight={140} maxHeight={170} label={L('ariaLeafCurve')} /></div>
	{/if}
	{#if s.show.loss}
		<div class="chart">
			<Canvas
				draw={drawLoss}
				aspect={0.28}
				minHeight={140}
				maxHeight={170}
				label={L('ariaLoss')}
				cursor={s.ui.rounds ? 'ew-resize' : 'default'}
				onpointerdown={(p) => {
					lossDrag = true;
					lossPick(p);
				}}
				onpointermove={(p) => lossDrag && lossPick(p)}
				onpointerup={() => (lossDrag = false)}
			/>
		</div>
	{/if}

	{#if anyUi}
		<div class="controls">
			{#if s.ui.bins}<Slider label="max_bin" bind:value={s.maxBin} min={2} max={255} />{/if}
			{#if s.ui.feat}
				<Segmented
					label={L('histOf')}
					bind:value={s.feat}
					onchange={() => (s.pickBin = -1)}
					options={[
						{ value: 0, label: 'x₁' },
						{ value: 1, label: 'x₂' }
					]}
				/>
			{/if}
			{#if s.ui.policy}
				<Segmented
					label={L('growth')}
					bind:value={s.policy}
					options={[
						{ value: 'leaf', label: L('leafWise') },
						{ value: 'level', label: L('levelWise') }
					]}
				/>
			{/if}
			{#if s.ui.leaves}<Slider label="num_leaves" bind:value={s.numLeaves} min={2} max={64} />{/if}
			{#if s.ui.depth}<Slider label="max_depth" bind:value={s.maxDepth} min={1} max={UNLIMITED} format={(d) => (d >= UNLIMITED ? L('noLimit') : String(d))} />{/if}
			{#if s.ui.minData}<Slider label="min_data_in_leaf" bind:value={s.minData} min={1} max={40} />{/if}
			{#if s.ui.rounds}<Slider label={L('rounds')} bind:value={s.rounds} min={1} max={MAX_ROUNDS} />{/if}
			{#if s.ui.goss}
				{#if s.mode === 'model'}
					<Segmented
						label={L('rowsPerTree')}
						value={s.useGoss ? 'goss' : 'all'}
						onchange={(v) => (s.useGoss = v === 'goss')}
						options={[
							{ value: 'all', label: L('allRows') },
							{ value: 'goss', label: 'GOSS' }
						]}
					/>
				{/if}
				{#if s.mode === 'goss' || s.useGoss}
					<Slider label="top_rate (a)" bind:value={s.top} min={0.05} max={0.5} step={0.05} format={(v) => v.toFixed(2)} />
					<Slider label="other_rate (b)" bind:value={s.other} min={0.05} max={0.5} step={0.05} format={(v) => v.toFixed(2)} />
				{/if}
			{/if}
			{#if s.ui.redraw}
				<div class="buttons">
					<button
						class="btn btn-sm btn-primary"
						onclick={() => {
							s.gossDraw = (s.gossDraw + 1) % 20;
							s.did.redraw++;
						}}>{L('newSample')}</button
					>
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
	.pair {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 10px;
	}
	.shape {
		margin-top: 6px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 4px;
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
	.dot {
		border-radius: 50%;
	}
	.dot.a {
		background: var(--viz-1);
	}
	.dot.faint {
		background: var(--text-3);
		opacity: 0.4;
		width: 5px;
		height: 5px;
	}
	.ring {
		border-radius: 50%;
		border: 1.5px solid var(--viz-1);
	}
	.sq.b {
		background: var(--viz-3);
	}
	.key i.edge {
		width: 1px;
		height: 11px;
		background: var(--text-3);
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
