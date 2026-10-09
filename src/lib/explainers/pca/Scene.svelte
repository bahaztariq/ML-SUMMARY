<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import Canvas from '#lib/viz/Canvas.svelte';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import { alpha, clamp, dot, fmt, label, mapper, squareMapper, type VizTheme } from '#lib/viz/canvas.ts';
	import { local } from '#lib/i18n/index.svelte.ts';
	import type { SceneProps } from '../types.ts';
	import * as la from '../_dimred/linalg.ts';
	import { arrow, grid2d, tag } from '../_dimred/draw.ts';
	import { drawAxes, drawCloud, projector, rotator, type P3 } from '../_dimred/view3d.ts';
	import * as P from './pca.ts';
	import {
		bestShare,
		bodyData,
		bodyFit,
		corrData,
		corrFit,
		deg,
		pancake,
		pancakeFit,
		pancakeRecon,
		pancakeShadow,
		pc1Angle,
		pct,
		projVar,
		reconError,
		screenShare,
		setAngle,
		setDataset,
		setUnits,
		totalVar2,
		type Dataset,
		type PCAState
	} from './state.ts';

	let { s = $bindable(), step }: SceneProps<PCAState> = $props();

	const en = {
		variance: 'variance {v}',
		mean: 'mean',
		meanAt: 'mean ({x}, {y})',
		dragLine: 'drag to rotate the line',
		dragRotate: 'drag to rotate',
		heightMm: 'height (mm)',
		heightM: 'height (m)',
		heightZ: 'height (z-score)',
		weightKg: 'weight (kg)',
		weightZ: 'weight (z-score)',
		pc1Share: 'PC1: {p} of variance',
		spread: 'spread: height {h} · weight {w}',
		varAlong: 'variance along the line',
		cumulative: 'cumulative',
		angle: 'angle',
		varOnLine: 'variance on line',
		shareTotal: 'share of total',
		pc1Formula: '{a}·height + {b}·weight',
		pc1Explains: 'PC1 explains',
		visible: 'variance visible on screen',
		kept: 'kept',
		keptOf: '{k} of 3',
		explained: 'explained',
		reconError: 'reconstruction error',
		aria3d: 'Rotatable 3-D scatter of three groups lying close to a tilted plane',
		ariaBody: 'Scatter of height against weight with the first principal component',
		ariaCorr: 'Scatter of a correlated 2-D cloud with a rotatable projection line',
		ariaShadow: 'The data in PC1–PC2 coordinates',
		cap: 'The same points in PC1/PC2 coordinates: the 2-D result.',
		ariaCurve: 'Variance of the projection for every angle',
		ariaScree: 'Scree plot: share of variance per principal component',
		data: 'Data',
		cloud2d: '2-D cloud',
		groups3d: '3-D groups',
		heightWeight: 'Height & weight',
		lineAngle: 'Line angle',
		componentsKept: 'Components kept',
		all3: '3 (all)',
		units: 'Units',
		unitMm: 'height in mm',
		unitM: 'height in m',
		unitZ: 'standardized'
	};
	const L = local({
		en,
		fr: {
			variance: 'variance {v}',
			mean: 'moyenne',
			meanAt: 'moyenne ({x}, {y})',
			dragLine: 'glissez pour faire tourner la droite',
			dragRotate: 'glissez pour faire tourner',
			heightMm: 'taille (mm)',
			heightM: 'taille (m)',
			heightZ: 'taille (score z)',
			weightKg: 'poids (kg)',
			weightZ: 'poids (score z)',
			pc1Share: 'PC1 : {p} de la variance',
			spread: 'étendue : taille {h} · poids {w}',
			varAlong: 'variance le long de la droite',
			cumulative: 'cumulée',
			angle: 'angle',
			varOnLine: 'variance sur la droite',
			shareTotal: 'part du total',
			pc1Formula: '{a}·taille + {b}·poids',
			pc1Explains: 'PC1 explique',
			visible: 'variance visible à l’écran',
			kept: 'conservées',
			keptOf: '{k} sur 3',
			explained: 'expliquée',
			reconError: 'erreur de reconstruction',
			aria3d: 'Nuage 3-D orientable de trois groupes proches d’un plan incliné',
			ariaBody: 'Nuage taille-poids avec la première composante principale',
			ariaCorr: 'Nuage 2-D corrélé avec une droite de projection orientable',
			ariaShadow: 'Les données dans les coordonnées PC1–PC2',
			cap: 'Les mêmes points en coordonnées PC1/PC2 : le résultat en 2-D.',
			ariaCurve: 'Variance de la projection pour chaque angle',
			ariaScree: 'Éboulis des valeurs propres : part de variance par composante principale',
			data: 'Données',
			cloud2d: 'Nuage 2-D',
			groups3d: 'Groupes 3-D',
			heightWeight: 'Taille et poids',
			lineAngle: 'Angle de la droite',
			componentsKept: 'Composantes conservées',
			all3: '3 (toutes)',
			units: 'Unités',
			unitMm: 'taille en mm',
			unitM: 'taille en m',
			unitZ: 'standardisées'
		},
		ar: {
			variance: 'التباين {v}',
			mean: 'المتوسط',
			meanAt: 'المتوسط ({x}, {y})',
			dragLine: 'اسحب لتدوير الخط',
			dragRotate: 'اسحب للتدوير',
			heightMm: 'الطول (mm)',
			heightM: 'الطول (m)',
			heightZ: 'الطول (درجة z)',
			weightKg: 'الوزن (kg)',
			weightZ: 'الوزن (درجة z)',
			pc1Share: 'PC1: {p} من التباين',
			spread: 'المدى: الطول {h} · الوزن {w}',
			varAlong: 'التباين على طول الخط',
			cumulative: 'تراكمي',
			angle: 'الزاوية',
			varOnLine: 'التباين على الخط',
			shareTotal: 'الحصة من الكلي',
			pc1Formula: '{a}·الطول + {b}·الوزن',
			pc1Explains: 'يفسّر PC1',
			visible: 'التباين المرئي على الشاشة',
			kept: 'المحتفَظ بها',
			keptOf: '{k} من 3',
			explained: 'المفسَّر',
			reconError: 'خطأ إعادة البناء',
			aria3d: 'مخطط تشتت ثلاثي الأبعاد قابل للتدوير لثلاث مجموعات قريبة من مستوى مائل',
			ariaBody: 'مخطط تشتت للطول مقابل الوزن مع المكوّن الرئيسي الأول',
			ariaCorr: 'مخطط تشتت لسحابة ثنائية الأبعاد مترابطة مع خط إسقاط قابل للتدوير',
			ariaShadow: 'البيانات في إحداثيات PC1–PC2',
			cap: 'النقاط نفسها في إحداثيات PC1/PC2: النتيجة ثنائية الأبعاد.',
			ariaCurve: 'تباين الإسقاط لكل زاوية',
			ariaScree: 'مخطط الانحدار: حصة التباين لكل مكوّن رئيسي',
			data: 'البيانات',
			cloud2d: 'سحابة ثنائية الأبعاد',
			groups3d: 'مجموعات ثلاثية الأبعاد',
			heightWeight: 'الطول والوزن',
			lineAngle: 'زاوية الخط',
			componentsKept: 'المكونات المحتفَظ بها',
			all3: '3 (الكل)',
			units: 'الوحدات',
			unitMm: 'الطول بالمليمتر',
			unitM: 'الطول بالمتر',
			unitZ: 'معياري'
		}
	});

	/* ---- centring animation: 1 = raw position, 0 = centred ---- */
	let shift = $state(untrack(() => (s.centered ? 0 : 1)));
	let raf = 0;
	$effect(() => {
		const target = s.centered ? 0 : 1;
		cancelAnimationFrame(raf);
		const tick = () => {
			const d = target - shift;
			if (Math.abs(d) < 0.003) {
				shift = target;
				return;
			}
			shift += d * 0.12;
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
	});
	onDestroy(() => cancelAnimationFrame(raf));

	const is3d = $derived(s.dataset === 'pancake');

	/* ---- 2-D interaction: drag to aim the projection line ---- */
	let map2: ReturnType<typeof mapper> | null = null;
	let aiming = $state(false);
	function aim(p: { x: number; y: number }) {
		if (!map2) return;
		const x = map2.invX(p.x);
		const y = map2.invY(p.y);
		if (x * x + y * y < 0.04) return;
		setAngle(s, Math.round(P.angleOf([x, y])));
	}

	/* ---- 3-D interaction: drag to rotate ---- */
	const rot = rotator(
		() => (s.ui.rotate ? s.view : null),
		() => (s.did.rotate = true)
	);

	function down2(p: { x: number; y: number }) {
		if (s.dataset !== 'corr' || !s.ui.angle || !s.show.proj) return;
		aiming = true;
		aim(p);
	}
	function move2(p: { x: number; y: number }) {
		if (aiming) aim(p);
	}

	/* ---- drawing: 2-D cloud ---- */
	const C0 = (t: VizTheme) => t.series[0];

	function drawCorr(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const m = squareMapper({ x: 10, y: 10, w: w - 20, h: h - 20 }, [-3.6, 4.4]);
		map2 = m;
		grid2d(ctx, t, m, w, h, { axes: true });
		label(ctx, t, 'x₁', w - 14, m.y(0) - 10, { align: 'right', color: t.text3 });
		label(ctx, t, 'x₂', m.x(0) + 8, 16, { color: t.text3 });

		const X = corrData();
		const fit = corrFit();
		const off = fit.mean.map((v) => v * (1 - shift));
		const pts = X.map((r) => [r[0] - off[0], r[1] - off[1]]);
		const mu = [fit.mean[0] - off[0], fit.mean[1] - off[1]];

		const u = P.unit(s.angle);
		const span = 9;
		if (s.show.proj) {
			// the line and each point's drop onto it
			ctx.strokeStyle = alpha(t.accent, 0.55);
			ctx.lineWidth = 1.5;
			ctx.beginPath();
			ctx.moveTo(m.x(-u[0] * span), m.y(-u[1] * span));
			ctx.lineTo(m.x(u[0] * span), m.y(u[1] * span));
			ctx.stroke();
			ctx.strokeStyle = alpha(t.text3, 0.28);
			ctx.lineWidth = 1;
			ctx.beginPath();
			for (const p of pts) {
				const z = p[0] * u[0] + p[1] * u[1];
				ctx.moveTo(m.x(p[0]), m.y(p[1]));
				ctx.lineTo(m.x(z * u[0]), m.y(z * u[1]));
			}
			ctx.stroke();
		}

		pts.forEach((p) => dot(ctx, m.x(p[0]), m.y(p[1]), 3.3, alpha(C0(t), 0.75)));

		if (s.show.proj) {
			for (const p of pts) {
				const z = p[0] * u[0] + p[1] * u[1];
				dot(ctx, m.x(z * u[0]), m.y(z * u[1]), 2.6, alpha(t.accent, 0.75));
			}
			// ±2 standard deviations of the projected values
			const sd = Math.sqrt(projVar(s));
			ctx.strokeStyle = t.accent;
			ctx.lineWidth = 5;
			ctx.lineCap = 'round';
			ctx.beginPath();
			ctx.moveTo(m.x(-2 * sd * u[0]), m.y(-2 * sd * u[1]));
			ctx.lineTo(m.x(2 * sd * u[0]), m.y(2 * sd * u[1]));
			ctx.stroke();
			ctx.lineCap = 'butt';
			const end = [3.3 * u[0], 3.3 * u[1]];
			const hx = m.x(end[0]);
			const hy = m.y(end[1]);
			if (s.ui.angle) dot(ctx, hx, hy, aiming ? 9 : 8, t.bg, t.accent, 2.5);
			tag(ctx, t, L('variance', { v: fmt(projVar(s)) }), m.x(-2 * sd * u[0]) + 8, m.y(-2 * sd * u[1]) + 16, { color: t.accent });
		}

		const ev = fit.vectors;
		const lam = fit.values;
		const pcs: [boolean, number, string][] = [
			[s.show.pc1, 0, 'PC1'],
			[s.show.pc2, 1, 'PC2']
		];
		for (const [on, k, name] of pcs) {
			if (!on) continue;
			const len = 2 * Math.sqrt(lam[k]);
			const ex = m.x(mu[0] + ev[k][0] * len);
			const ey = m.y(mu[1] + ev[k][1] * len);
			arrow(ctx, m.x(mu[0]), m.y(mu[1]), ex, ey, t.text, 2.5);
			tag(ctx, t, name, ex + 6, ey - 4);
		}

		if (s.show.mean) {
			const x = m.x(mu[0]);
			const y = m.y(mu[1]);
			ctx.strokeStyle = t.text;
			ctx.lineWidth = 2.5;
			ctx.beginPath();
			ctx.moveTo(x - 7, y - 7);
			ctx.lineTo(x + 7, y + 7);
			ctx.moveTo(x + 7, y - 7);
			ctx.lineTo(x - 7, y + 7);
			ctx.stroke();
			if (!s.show.proj) tag(ctx, t, L('meanAt', { x: fmt(mu[0], 1), y: fmt(mu[1], 1) }), x + 12, y - 12);
		}

		if (s.show.proj && s.ui.angle && !s.did.angle) {
			label(ctx, t, L('dragLine'), w - 12, h - 14, { align: 'right', color: t.text3 });
		}
	}

	/* ---- drawing: body measurements (equal-aspect, in the chosen units) ---- */
	const UNIT_NAMES: Record<P.Units, () => [string, string]> = {
		mm: () => [L('heightMm'), L('weightKg')],
		m: () => [L('heightM'), L('weightKg')],
		z: () => [L('heightZ'), L('weightZ')]
	};

	function drawBody(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const X = bodyData(s.units);
		const fit = bodyFit(s.units);
		let M = 0;
		for (const r of X) M = Math.max(M, Math.abs(r[0]), Math.abs(r[1]));
		const m = squareMapper({ x: 14, y: 14, w: w - 28, h: h - 28 }, [-M * 1.12, M * 1.12]);
		grid2d(ctx, t, m, w, h, { axes: true });
		const [nx, ny] = UNIT_NAMES[s.units]();
		label(ctx, t, nx, w - 12, m.y(0) - 10, { align: 'right', color: t.text3 });
		label(ctx, t, ny, m.x(0) + 8, 16, { color: t.text3 });
		X.forEach((p) => dot(ctx, m.x(p[0]), m.y(p[1]), 3.2, alpha(t.series[1], 0.75)));
		if (s.show.pc1) {
			fit.vectors.forEach((v, k) => {
				const len = Math.max(2 * Math.sqrt(fit.values[k]), M * 0.08);
				const ex = m.x(v[0] * len);
				const ey = m.y(v[1] * len);
				arrow(ctx, m.x(0), m.y(0), ex, ey, k ? t.text3 : t.text, k ? 2 : 2.5);
				if (!k) tag(ctx, t, L('pc1Share', { p: pct(fit.ratio[0], 1) }), ex + 6, ey + (v[1] > 0.5 ? 12 : -12));
			});
		}
		const cardRange = (j: number) => {
			let lo = Infinity;
			let hi = -Infinity;
			for (const r of X) {
				lo = Math.min(lo, r[j]);
				hi = Math.max(hi, r[j]);
			}
			return hi - lo;
		};
		label(ctx, t, L('spread', { h: fmt(cardRange(0), s.units === 'm' ? 2 : 1), w: fmt(cardRange(1), 1) }), 12, h - 12, {
			color: t.text3,
			size: 11
		});
	}

	/* ---- drawing: 3-D pancake ---- */
	function draw3(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const { X, y } = pancake();
		const fit = pancakeFit();
		const scale = Math.min(w, h) / (s.show.shadow ? 6 : 6.6);
		const proj = projector(s.view, w / 2, h / 2, scale);
		drawAxes(ctx, t, proj, 2.6);
		const color = (i: number) => t.series[y[i]];
		const recon = s.show.recon && s.k < 3;

		if (recon) {
			const R = pancakeRecon(s.k);
			// the kept subspace: a plane (k = 2) or a line (k = 1)
			const len = fit.values.map((v) => 1.9 * Math.sqrt(v));
			const v = fit.vectors;
			ctx.fillStyle = alpha(t.accent, 0.08);
			ctx.strokeStyle = alpha(t.accent, 0.5);
			ctx.lineWidth = 1.2;
			if (s.k === 2) {
				const corners = [
					[1, 1],
					[1, -1],
					[-1, -1],
					[-1, 1]
				].map(([a, b]) => proj(v[0].map((x, j) => a * len[0] * x + b * len[1] * v[1][j]) as P3));
				ctx.beginPath();
				corners.forEach((c, i) => (i ? ctx.lineTo(c.x, c.y) : ctx.moveTo(c.x, c.y)));
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
			} else {
				const a = proj(v[0].map((x) => -len[0] * x) as P3);
				const b = proj(v[0].map((x) => len[0] * x) as P3);
				ctx.beginPath();
				ctx.moveTo(a.x, a.y);
				ctx.lineTo(b.x, b.y);
				ctx.stroke();
			}
			ctx.strokeStyle = alpha(t.series[3], 0.55);
			ctx.lineWidth = 1;
			ctx.beginPath();
			X.forEach((p, i) => {
				const a = proj(p as P3);
				const b = proj(R[i] as P3);
				ctx.moveTo(a.x, a.y);
				ctx.lineTo(b.x, b.y);
			});
			ctx.stroke();
			drawCloud(ctx, proj, X, (i) => alpha(color(i), 0.35), 2.6);
			drawCloud(ctx, proj, R, color, 2.6);
		} else {
			drawCloud(ctx, proj, X, color, 3.2);
		}

		if (s.show.pc1) {
			const o = proj([0, 0, 0]);
			fit.vectors.forEach((v, k) => {
				if (recon && k >= s.k) return;
				const len = 1.9 * Math.sqrt(fit.values[k]) + 0.2;
				const e = proj(v.map((x) => x * len) as P3);
				arrow(ctx, o.x, o.y, e.x, e.y, k === 0 ? t.text : k === 1 ? t.text2 : t.text3, 2.5);
				tag(ctx, t, `PC${k + 1}`, e.x + 5, e.y - 6);
			});
		}
		if (s.ui.rotate && !s.did.rotate) label(ctx, t, L('dragRotate'), w - 12, h - 14, { align: 'right', color: t.text3 });
	}

	/* ---- the 2-D result: coordinates along PC1 and PC2 ---- */
	function drawShadow(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const Z = pancakeShadow();
		const { y } = pancake();
		const m = squareMapper({ x: 10, y: 10, w: w - 20, h: h - 20 }, [-3.3, 3.3]);
		grid2d(ctx, t, m, w, h, { axes: true, n: 6 });
		label(ctx, t, 'PC1', w - 10, m.y(0) - 10, { align: 'right', color: t.text3 });
		label(ctx, t, 'PC2', m.x(0) + 6, 14, { color: t.text3 });
		const flat = s.show.recon && s.k === 1;
		Z.forEach((z, i) => dot(ctx, m.x(z[0]), m.y(flat ? 0 : z[1]), 3, alpha(t.series[y[i]], 0.8)));
		label(ctx, t, flat ? 'Z = X·W₁ (n × 1)' : 'Z = X·W₂ (n × 2)', 10, h - 12, { color: t.text3, size: 11 });
	}

	/* ---- variance vs angle ---- */
	let curveMap: ReturnType<typeof mapper> | null = null;
	function drawCurve(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const fit = corrFit();
		const box = { x: 40, y: 12, w: w - 54, h: h - 38 };
		const ymax = fit.values[0] * 1.15;
		const m = mapper(box, [0, 180], [0, ymax]);
		curveMap = m;
		ctx.strokeStyle = t.grid;
		ctx.lineWidth = 1;
		for (const a of [0, 45, 90, 135, 180]) {
			ctx.beginPath();
			ctx.moveTo(m.x(a), box.y);
			ctx.lineTo(m.x(a), box.y + box.h);
			ctx.stroke();
			label(ctx, t, `${a}°`, m.x(a), box.y + box.h + 12, { align: 'center', color: t.text3, size: 10 });
		}
		for (const v of [0, ymax / 2]) label(ctx, t, fmt(v, 1), box.x - 6, m.y(v), { align: 'right', color: t.text3, size: 10 });
		label(ctx, t, L('varAlong'), box.x + 4, 6, { color: t.text3, size: 10, base: 'top' });
		ctx.strokeStyle = t.accent;
		ctx.lineWidth = 2;
		ctx.beginPath();
		for (let a = 0; a <= 180; a += 2) {
			const v = la.varianceAlong(fit.cov, P.unit(a));
			if (a) ctx.lineTo(m.x(a), m.y(v));
			else ctx.moveTo(m.x(a), m.y(v));
		}
		ctx.stroke();
		if (s.show.pc1) {
			const a1 = pc1Angle();
			dot(ctx, m.x(a1), m.y(fit.values[0]), 4, t.text);
			label(ctx, t, `PC1 · λ₁ = ${fmt(fit.values[0])}`, m.x(a1) + 7, m.y(fit.values[0]) - 2, { color: t.text, size: 10, weight: 600 });
		}
		if (s.show.pc2) {
			const a2 = P.angleOf(fit.vectors[1]);
			dot(ctx, m.x(a2), m.y(fit.values[1]), 4, t.text);
			label(ctx, t, `PC2 · λ₂ = ${fmt(fit.values[1])}`, m.x(a2) - 7, m.y(fit.values[1]) - 12, { color: t.text, size: 10, weight: 600, align: 'right' });
		}
		const v = projVar(s);
		ctx.strokeStyle = alpha(t.accent, 0.5);
		ctx.setLineDash([3, 3]);
		ctx.beginPath();
		ctx.moveTo(m.x(s.angle), box.y + box.h);
		ctx.lineTo(m.x(s.angle), m.y(v));
		ctx.stroke();
		ctx.setLineDash([]);
		dot(ctx, m.x(s.angle), m.y(v), 6, t.bg, t.accent, 2.5);
	}
	let curveDrag = false;
	function curveDown(p: { x: number }) {
		if (!s.ui.angle || !curveMap) return;
		curveDrag = true;
		setAngle(s, Math.round(clamp(curveMap.invX(p.x), 0, 179)));
	}
	function curveMove(p: { x: number }) {
		if (curveDrag && curveMap) setAngle(s, Math.round(clamp(curveMap.invX(p.x), 0, 179)));
	}

	/* ---- scree plot ---- */
	let screeMap: ReturnType<typeof mapper> | null = null;
	function drawScree(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const r = pancakeFit().ratio;
		const box = { x: 40, y: 14, w: w - 54, h: h - 40 };
		const m = mapper(box, [0.4, 3.6], [0, 1]);
		screeMap = m;
		for (const v of [0, 0.5, 1]) {
			ctx.strokeStyle = t.grid;
			ctx.beginPath();
			ctx.moveTo(box.x, m.y(v));
			ctx.lineTo(box.x + box.w, m.y(v));
			ctx.stroke();
			label(ctx, t, pct(v), box.x - 6, m.y(v), { align: 'right', color: t.text3, size: 10 });
		}
		const bw = Math.min(70, box.w / 5);
		let cum = 0;
		const cums: [number, number][] = [];
		r.forEach((v, k) => {
			const kept = !s.show.recon || k < s.k;
			ctx.fillStyle = kept ? alpha(t.accent, 0.85) : alpha(t.accent, 0.18);
			const x = m.x(k + 1);
			ctx.fillRect(x - bw / 2, m.y(v), bw, m.y(0) - m.y(v));
			const inside = m.y(0) - m.y(v) > 24;
			label(ctx, t, pct(v, 1), x, inside ? m.y(v) + 11 : m.y(v) - 8, { align: 'center', color: inside ? t.bg : t.text, size: 11, weight: 600 });
			label(ctx, t, `PC${k + 1}`, x, box.y + box.h + 12, { align: 'center', color: kept ? t.text : t.text3, size: 11 });
			cum += v;
			cums.push([x, cum]);
		});
		ctx.strokeStyle = t.text2;
		ctx.lineWidth = 1.5;
		ctx.setLineDash([4, 3]);
		ctx.beginPath();
		cums.forEach(([x, c], i) => (i ? ctx.lineTo(x, m.y(c)) : ctx.moveTo(x, m.y(c))));
		ctx.stroke();
		ctx.setLineDash([]);
		cums.forEach(([x, c]) => dot(ctx, x, m.y(c), 3, t.text2));
		label(ctx, t, L('cumulative'), cums[2][0] - 10, m.y(cums[2][1]) + 12, { color: t.text2, size: 10, align: 'right' });
	}
	function screeDown(p: { x: number }) {
		if (!s.ui.k || !screeMap) return;
		s.k = clamp(Math.round(screeMap.invX(p.x)), 1, 3);
		s.show.recon = true;
	}

	/* ---- canvas dispatch ---- */
	function draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		if (s.dataset === 'corr') drawCorr(ctx, w, h, t);
		else if (s.dataset === 'body') drawBody(ctx, w, h, t);
		else draw3(ctx, w, h, t);
	}
	function down(p: { x: number; y: number }) {
		if (is3d) {
			if (s.ui.rotate) rot.down(p);
		} else down2(p);
	}
	function move(p: { x: number; y: number }) {
		if (is3d) rot.move(p);
		else move2(p);
	}
	function up() {
		rot.up();
		aiming = false;
		curveDrag = false;
	}

	const readouts = $derived.by(() => {
		if (s.dataset === 'corr') {
			const items = [{ label: L('mean'), value: shift > 0.5 ? `(${fmt(corrFit().mean[0], 1)}, ${fmt(corrFit().mean[1], 1)})` : '(0, 0)' }];
			if (s.show.proj)
				items.push(
					{ label: L('angle'), value: deg(s.angle) },
					{ label: L('varOnLine'), value: fmt(projVar(s)) },
					{ label: L('shareTotal'), value: pct(projVar(s) / totalVar2()) }
				);
			return items.map((it, i) => ({ ...it, highlight: i === 3 && projVar(s) / corrFit().values[0] > 0.995 }));
		}
		if (s.dataset === 'body') {
			const f = bodyFit(s.units);
			const v = f.vectors[0];
			return [
				{ label: 'PC1', value: L('pc1Formula', { a: fmt(v[0]), b: fmt(v[1]) }) },
				{ label: L('pc1Explains'), value: pct(f.ratio[0], 1), highlight: true }
			];
		}
		const items = [{ label: L('visible'), value: pct(screenShare(s.view)), highlight: screenShare(s.view) > bestShare() - 0.02 }];
		if (s.show.recon) {
			const kept = pancakeFit().ratio.slice(0, s.k).reduce((a, b) => a + b, 0);
			items.push(
				{ label: L('kept'), value: L('keptOf', { k: s.k }), highlight: false },
				{ label: L('explained'), value: pct(kept, 1), highlight: false },
				{ label: L('reconError'), value: fmt(reconError(s.k), 3), highlight: s.k < 3 }
			);
		}
		return items;
	});

	$effect(() => {
		step;
		aiming = false;
	});
</script>

<div class="scene">
	<div class="views" class:split={is3d && s.show.shadow}>
		<div class="main">
			<Canvas
				{draw}
				aspect={is3d && s.show.shadow ? 0.95 : 0.66}
				minHeight={is3d && s.show.shadow ? 240 : 280}
				maxHeight={440}
				label={is3d
					? L('aria3d')
					: s.dataset === 'body'
						? L('ariaBody')
						: L('ariaCorr')}
				cursor={is3d && s.ui.rotate ? 'grab' : s.dataset === 'corr' && s.ui.angle && s.show.proj ? 'crosshair' : 'default'}
				onpointerdown={down}
				onpointermove={move}
				onpointerup={up}
			/>
		</div>
		{#if is3d && s.show.shadow}
			<div class="side">
				<Canvas draw={drawShadow} aspect={0.95} minHeight={240} maxHeight={440} label={L('ariaShadow')} />
				<span class="cap">{L('cap')}</span>
			</div>
		{/if}
	</div>

	<Readouts items={readouts} />

	{#if s.dataset === 'corr' && s.show.curve}
		<div class="panel">
			<Canvas
				draw={drawCurve}
				aspect={0.26}
				minHeight={120}
				maxHeight={160}
				label={L('ariaCurve')}
				cursor={s.ui.angle ? 'ew-resize' : 'default'}
				onpointerdown={curveDown}
				onpointermove={curveMove}
				onpointerup={up}
			/>
		</div>
	{/if}

	{#if is3d && s.show.scree}
		<div class="panel">
			<Canvas
				draw={drawScree}
				aspect={0.26}
				minHeight={130}
				maxHeight={170}
				label={L('ariaScree')}
				cursor={s.ui.k ? 'pointer' : 'default'}
				onpointerdown={screeDown}
			/>
		</div>
	{/if}

	{#if s.ui.dataset || (s.ui.angle && s.dataset === 'corr') || (s.ui.k && is3d) || (s.ui.units && s.dataset === 'body')}
		<div class="controls">
			{#if s.ui.dataset}
				<Segmented
					label={L('data')}
					bind:value={s.dataset}
					options={[
						{ value: 'corr', label: L('cloud2d') },
						{ value: 'pancake', label: L('groups3d') },
						{ value: 'body', label: L('heightWeight') }
					] as { value: Dataset; label: string }[]}
					onchange={(d) => setDataset(s, d)}
				/>
			{/if}
			{#if s.ui.angle && s.dataset === 'corr'}
				<Slider label={L('lineAngle')} bind:value={s.angle} min={0} max={179} format={deg} oninput={(v) => setAngle(s, v)} />
			{/if}
			{#if s.ui.k && is3d}
				<Segmented
					label={L('componentsKept')}
					bind:value={s.k}
					options={[
						{ value: 1, label: '1' },
						{ value: 2, label: '2' },
						{ value: 3, label: L('all3') }
					]}
					onchange={() => (s.show.recon = true)}
				/>
			{/if}
			{#if s.ui.units && s.dataset === 'body'}
				<Segmented
					label={L('units')}
					bind:value={s.units}
					options={[
						{ value: 'mm', label: L('unitMm') },
						{ value: 'm', label: L('unitM') },
						{ value: 'z', label: L('unitZ') }
					] as { value: P.Units; label: string }[]}
					onchange={(u) => setUnits(s, u)}
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
	.views.split {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 10px;
	}
	.side {
		display: grid;
		gap: 4px;
		align-content: start;
	}
	.cap {
		font-size: 0.75rem;
		color: var(--text-3);
	}
	@media (max-width: 560px) {
		.views.split {
			grid-template-columns: 1fr;
		}
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
