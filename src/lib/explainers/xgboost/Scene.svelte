<script lang="ts">
	import Canvas from '#lib/viz/Canvas.svelte';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import { alpha, clamp, dot, label, mapper, type VizTheme } from '#lib/viz/canvas.ts';
	import type { SceneProps } from '../types.ts';
	import { classColor, lineChart, marker, pill, pillWidth } from '../_ensembles/draw.ts';
	import { f2, f3, sgn } from '../_ensembles/memo.ts';
	import { arRounds } from '../_ensembles/i18n.ts';
	import { i18n, local } from '#lib/i18n/index.svelte.ts';
	import { leafWeight, leaves, score } from '../_ensembles/boost.ts';
	import * as x from './xgb.ts';
	import {
		CURVE_X,
		HISTORY,
		MAX_ROUNDS,
		GH,
		bestRoot,
		bestRound,
		curve,
		curveP,
		fullCurve,
		intervals,
		missingP,
		resampleTree,
		roundTree,
		sampleOf,
		sampleSplits,
		setThr,
		split,
		totals,
		train,
		trainLoss,
		validLoss,
		type XGBState
	} from './state.ts';

	let { s = $bindable(), step }: SceneProps<XGBState> = $props();

	const en = {
		missing: 'missing',
		missTo: 'missing → {side}',
		left: 'left',
		right: 'right',
		clickPoint: 'click a point',
		gainTitle: 'gain of x₁ ≤ t for every threshold t',
		best: 'best {v}',
		lossTitle: 'log-loss vs boosting rounds',
		train: 'train',
		valid: 'valid',
		rounds: 'rounds',
		trainLL: 'train log-loss',
		validLL: 'valid log-loss',
		leaves: 'leaves',
		rootGain: 'root gain',
		pruned: 'pruned',
		tree: 'tree',
		rowsUsed: 'rows used',
		colsUsed: 'columns used',
		gAll: 'G (all rows)',
		hAll: 'H (all rows)',
		gain: 'gain',
		ariaMain: 'Labels against x₁ with the model\'s probability curve, gradients and hessians',
		ariaGain: 'Split gain for every threshold on x₁',
		ariaLoss: 'Training and validation log-loss by round',
		label0: 'label 0',
		label1: 'label 1',
		curveAfter: 'model\'s p(y = 1) after {rounds}',
		noteStem: 'stem = gradient g = p − y',
		noteSize: 'size = hessian h = p(1 − p)',
		noteFaded: 'faded = rows this tree doesn\'t see',
		defaultDir: 'default direction',
		thFeature: 'feature',
		thMay: 'this tree may use it?',
		thBest: 'best root split',
		signal: 'signal',
		proxy: 'noisy proxy',
		noise: 'noise',
		yes: 'yes',
		no: 'no',
		roundsSlider: 'rounds (n_estimators)',
		ofCols: '{v} of 3 columns',
		nextSample: 'Next tree\'s sample',
		oneRound: '1 round',
		nRounds: '{n} rounds'
	};
	const L = local({
		en,
		fr: {
			missing: 'manquant',
			missTo: 'manquant → {side}',
			left: 'gauche',
			right: 'droite',
			clickPoint: 'cliquez sur un point',
			gainTitle: 'gain de x₁ ≤ t pour chaque seuil t',
			best: 'meilleur {v}',
			lossTitle: 'log-loss selon les tours de boosting',
			train: 'entr.',
			valid: 'valid.',
			rounds: 'tours',
			trainLL: 'log-loss entr.',
			validLL: 'log-loss valid.',
			leaves: 'feuilles',
			rootGain: 'gain de la racine',
			pruned: 'élaguée',
			tree: 'arbre',
			rowsUsed: 'lignes utilisées',
			colsUsed: 'colonnes utilisées',
			gAll: 'G (toutes les lignes)',
			hAll: 'H (toutes les lignes)',
			gain: 'gain',
			ariaMain: 'Étiquettes en fonction de x₁ avec la courbe de probabilité du modèle, les gradients et les hessiennes',
			ariaGain: 'Gain de la division pour chaque seuil sur x₁',
			ariaLoss: 'Log-loss d’entraînement et de validation par tour',
			label0: 'étiquette 0',
			label1: 'étiquette 1',
			curveAfter: 'p(y = 1) du modèle après {rounds}',
			noteStem: 'trait = gradient g = p − y',
			noteSize: 'taille = hessienne h = p(1 − p)',
			noteFaded: 'estompé = lignes que cet arbre ne voit pas',
			defaultDir: 'direction par défaut',
			thFeature: 'variable',
			thMay: 'cet arbre peut-il l’utiliser ?',
			thBest: 'meilleure division racine',
			signal: 'signal',
			proxy: 'substitut bruité',
			noise: 'bruit',
			yes: 'oui',
			no: 'non',
			roundsSlider: 'tours (n_estimators)',
			ofCols: '{v} colonnes sur 3',
			nextSample: 'Échantillon de l’arbre suivant',
			oneRound: '1 tour',
			nRounds: '{n} tours'
		},
		ar: {
			missing: 'مفقودة',
			missTo: 'المفقودة → {side}',
			left: 'اليسار',
			right: 'اليمين',
			clickPoint: 'انقر على نقطة',
			gainTitle: 'كسب x₁ ≤ t لكل عتبة t',
			best: 'الأفضل {v}',
			lossTitle: 'log-loss مقابل جولات التعزيز',
			train: 'تدريب',
			valid: 'تحقق',
			rounds: 'الجولات',
			trainLL: 'log-loss التدريب',
			validLL: 'log-loss التحقق',
			leaves: 'الأوراق',
			rootGain: 'كسب الجذر',
			pruned: 'مقلَّمة',
			tree: 'الشجرة',
			rowsUsed: 'الصفوف المستخدمة',
			colsUsed: 'الأعمدة المستخدمة',
			gAll: 'G (كل الصفوف)',
			hAll: 'H (كل الصفوف)',
			gain: 'الكسب',
			ariaMain: 'التسميات مقابل x₁ مع منحنى احتمال النموذج والتدرّجات والمشتقات الثانية',
			ariaGain: 'كسب التقسيم لكل عتبة على x₁',
			ariaLoss: 'log-loss التدريب والتحقق حسب الجولة',
			label0: 'التسمية 0',
			label1: 'التسمية 1',
			curveAfter: 'p(y = 1) للنموذج بعد {rounds}',
			noteStem: 'الخط = التدرّج g = p − y',
			noteSize: 'الحجم = المشتقة الثانية h = p(1 − p)',
			noteFaded: 'باهتة = صفوف لا تراها هذه الشجرة',
			defaultDir: 'الاتجاه الافتراضي',
			thFeature: 'الميزة',
			thMay: 'هل يمكن لهذه الشجرة استخدامها؟',
			thBest: 'أفضل تقسيم للجذر',
			signal: 'إشارة',
			proxy: 'بديل مشوّش',
			noise: 'ضجيج',
			yes: 'نعم',
			no: 'لا',
			roundsSlider: 'الجولات (n_estimators)',
			ofCols: '{v} من 3 أعمدة',
			nextSample: 'عيّنة الشجرة التالية',
			oneRound: 'جولة واحدة',
			nRounds: '{n} جولة'
		}
	});
	const roundsText = (n: number) => (i18n.current === 'ar' ? arRounds(n) : n === 1 ? L('oneRound') : L('nRounds', { n }));

	const d = train();
	const n = d.y.length;
	const jitter = d.y.map((_, i) => (((i * 0.6180339887) % 1) - 0.5) * 0.13);
	const gutterJitter = d.y.map((_, i) => ((i * 0.7548776662) % 1) * 0.8 + 0.1);
	const isMissing = (i: number) => Number.isNaN(d.X[i][0]);

	const c = $derived(split(s));
	const tree = $derived(s.show.tree ? roundTree(s) : null);
	const sample = $derived(s.show.sample ? sampleOf(s) : null);
	const inSample = $derived(sample ? new Set(sample.rows) : null);

	interface Layout {
		m: ReturnType<typeof mapper>;
		g0: number;
		g1: number;
		top: number;
		bottom: number;
	}
	let layout: Layout | null = null;

	function rowXY(L: Layout, i: number): [number, number] {
		const yv = d.y[i] + (d.y[i] ? -1 : 1) * Math.abs(jitter[i]) * 0.9;
		const px = isMissing(i) ? L.g0 + gutterJitter[i] * (L.g1 - L.g0) : L.m.x(d.X[i][0]);
		return [px, L.m.y(yv)];
	}

	function draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const strip = s.show.tree ? 30 : 0;
		const g0 = 40;
		const g1 = 88;
		const box = { x: g1 + 14, y: 14, w: w - g1 - 26, h: h - 40 - strip };
		const m = mapper(box, [x.X_MIN, x.X_MAX], [-0.08, 1.08]);
		const lay: Layout = { m, g0, g1, top: box.y, bottom: box.y + box.h };
		layout = lay;

		// axes and gutter
		ctx.lineWidth = 1;
		for (const v of [0, 0.5, 1]) {
			ctx.strokeStyle = t.grid;
			ctx.beginPath();
			ctx.moveTo(g0, m.y(v));
			ctx.lineTo(box.x + box.w, m.y(v));
			ctx.stroke();
			label(ctx, t, v === 0.5 ? '0.5' : String(v), g0 - 6, m.y(v), { align: 'right', color: t.text3, size: 10 });
		}
		ctx.fillStyle = alpha(t.text3, 0.08);
		ctx.fillRect(g0, box.y, g1 - g0, box.h);
		label(ctx, t, L('missing'), (g0 + g1) / 2, box.y + box.h + 12, { align: 'center', color: t.text3, size: 10 });
		for (const v of [0, 2, 4, 6, 8, 10]) label(ctx, t, String(v), m.x(v), box.y + box.h + 12, { align: 'center', color: t.text3, size: 10 });
		label(ctx, t, 'x₁ →', box.x + box.w, 4, { align: 'right', color: t.text3, size: 10, base: 'top' });
		label(ctx, t, 'p(y = 1)', 6, 4, { color: t.text3, size: 10, base: 'top' });

		// probability curve (current model, or the full booster)
		const full = s.mode === 'full' ? fullCurve(s) : null;
		const ps = full ? full.p : curveP();
		const pm = full ? full.missing : missingP();
		ctx.strokeStyle = t.series[0];
		ctx.lineWidth = 2.5;
		ctx.beginPath();
		CURVE_X.forEach((v, i) => (i ? ctx.lineTo(m.x(v), m.y(ps[i])) : ctx.moveTo(m.x(v), m.y(ps[i]))));
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(g0 + 4, m.y(pm));
		ctx.lineTo(g1 - 4, m.y(pm));
		ctx.stroke();

		// split line and leaf weights
		if (s.show.split && s.mode === 'round') {
			const sx = m.x(s.thr);
			ctx.fillStyle = alpha(t.text, 0.03);
			ctx.fillRect(box.x, box.y, sx - box.x, box.h);
			ctx.strokeStyle = t.text;
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(sx, box.y);
			ctx.lineTo(sx, box.y + box.h);
			ctx.stroke();
			if (s.ui.drag) {
				dot(ctx, sx, box.y + box.h / 2, 9, t.bg, t.text, 2);
				label(ctx, t, '↔', sx, box.y + box.h / 2 + 1, { align: 'center', color: t.text, size: 11, weight: 700 });
			}
			if (s.show.weights) {
				const wl = `w = ${sgn(leafWeight(c.GL, c.HL, s.lambda))}`;
				const wr = `w = ${sgn(leafWeight(c.GR, c.HR, s.lambda))}`;
				const ylab = m.y(0.38) + 28;
				const pl = pillWidth(ctx, t, wl);
				pill(ctx, t, wl, clamp(sx - 10 - pl, box.x + 2, w - pl - 4), ylab - 28, t.series[2]);
				pill(ctx, t, wr, clamp(sx + 10, box.x + 2, w - pillWidth(ctx, t, wr) - 4), ylab - 28, t.series[2]);
			}
			if (s.show.missing) {
				// arrow from the gutter to the chosen side
				const tx = c.missLeft ? (box.x + sx) / 2 : (sx + box.x + box.w) / 2;
				const y0 = m.y(0.62) - 8;
				ctx.strokeStyle = t.series[3];
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo((g0 + g1) / 2, y0 + 8);
				ctx.quadraticCurveTo(((g0 + g1) / 2 + tx) / 2, y0 - 26, tx, y0 + 8);
				ctx.stroke();
				ctx.fillStyle = t.series[3];
				ctx.beginPath();
				ctx.moveTo(tx, y0 + 13);
				ctx.lineTo(tx - 6, y0 + 3);
				ctx.lineTo(tx + 5, y0 + 5);
				ctx.fill();
				pill(ctx, t, L('missTo', { side: c.missLeft ? L('left') : L('right') }), clamp(tx - 50, box.x, w - 120), y0 + 26, t.series[3]);
			}
		}

		// points: label 1 on top, 0 at the bottom; stems = gradient, size = hessian
		const { g, h: hs } = GH();
		for (let i = 0; i < n; i++) {
			const [px, py] = rowXY(lay, i);
			const faded = inSample ? !inSample.has(i) : false;
			if (s.show.grad && s.mode === 'round') {
				const cy = m.y(isMissing(i) ? pm : ps[Math.round(((d.X[i][0] - x.X_MIN) / (x.X_MAX - x.X_MIN)) * (CURVE_X.length - 1))]);
				ctx.strokeStyle = alpha(g[i] > 0 ? t.series[3] : t.series[1], faded ? 0.12 : 0.55);
				ctx.lineWidth = 1.25;
				ctx.beginPath();
				ctx.moveTo(px, py);
				ctx.lineTo(px, cy);
				ctx.stroke();
			}
			const r = s.show.hess ? 1.6 + 5.4 * (hs[i] / 0.25) ** 2 : 3.6;
			const col = classColor(t, d.y[i]);
			marker(ctx, px, py, d.y[i], r, faded ? alpha(col, 0.15) : alpha(col, 0.9), faded ? undefined : t.bg, 1);
		}
		if (s.picked >= 0) {
			const [px, py] = rowXY(lay, s.picked);
			ctx.strokeStyle = t.text;
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.arc(px, py, 10, 0, Math.PI * 2);
			ctx.stroke();
			const txt = `g = ${sgn(g[s.picked], 3)} · h = ${f3(hs[s.picked])}`;
			pill(ctx, t, txt, clamp(px + 14, 4, w - pillWidth(ctx, t, txt) - 4), clamp(py, box.y + 12, box.y + box.h - 12));
		} else if (s.ui.pick) {
			const hint = L('clickPoint');
			pill(ctx, t, hint, box.x + box.w / 2 - pillWidth(ctx, t, hint) / 2, m.y(0.5));
		}

		// the inspected tree as bands along x₁
		if (tree) {
			const { parts, missing } = intervals(tree);
			const y0 = box.y + box.h + 22;
			const maxW = Math.max(0.3, ...leaves(tree).map((l) => Math.abs(l.w)));
			const band = (a: number, b: number, wv: number) => {
				ctx.fillStyle = alpha(wv > 0 ? t.series[2] : t.series[0], 0.15 + 0.5 * Math.min(1, Math.abs(wv) / maxW));
				ctx.fillRect(a + 1, y0, b - a - 2, 20);
				label(ctx, t, sgn(wv), (a + b) / 2, y0 + 10, { align: 'center', color: t.text, size: 10, weight: 700 });
			};
			for (const q of parts) band(m.x(q.x0), m.x(q.x1), q.leaf.w);
			band(g0, g1, missing.w);
		}

	}

	/* ---- interaction on the main plot ---- */
	let dragging = false;
	function down(p: { x: number; y: number }) {
		if (!layout) return;
		if (s.ui.drag && s.show.split) {
			dragging = true;
			setThr(s, layout.m.invX(p.x));
			return;
		}
		if (s.ui.pick) {
			let best = -1;
			let bd = 14 * 14;
			for (let i = 0; i < n; i++) {
				const [px, py] = rowXY(layout, i);
				const dd = (px - p.x) ** 2 + (py - p.y) ** 2;
				if (dd < bd) {
					bd = dd;
					best = i;
				}
			}
			if (best >= 0) {
				s.picked = best;
				s.did.pick = true;
			}
		}
	}
	function move(p: { x: number; y: number }) {
		if (dragging && layout) setThr(s, layout.m.invX(p.x));
	}

	/* ---- gain vs threshold ---- */
	let gainMap: ReturnType<typeof lineChart> | null = null;
	function drawGain(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const cs = curve(s);
		const best = bestRoot(s);
		const vals = cs.map((q) => q.gain - s.gamma);
		const lo = Math.min(0, ...vals);
		const hi = Math.max(...vals) * 1.15;
		gainMap = lineChart(ctx, w, h, t, {
			title: L('gainTitle'),
			x: [x.X_MIN, x.X_MAX],
			y: [Math.floor(lo), Math.ceil(hi)],
			xTicks: [0, 2, 4, 6, 8, 10],
			yFormat: (v) => v.toFixed(0),
			lines: [{ pts: cs.map((q, i) => [q.thr, vals[i]] as [number, number]), color: t.text, width: 1.75 }],
			marker: s.thr,
			points: [
				[best.thr, best.gain - s.gamma, t.series[1], L('best', { v: best.thr.toFixed(2) })],
				[s.thr, c.gain - s.gamma, t.series[2]]
			],
			right: 16
		});
	}
	let gainDrag = false;
	function gainPick(p: { x: number }) {
		if (!gainMap || !s.ui.drag) return;
		setThr(s, gainMap.invX(p.x));
	}

	/* ---- log-loss vs rounds ---- */
	let lossMap: ReturnType<typeof lineChart> | null = null;
	function drawLoss(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const tl = trainLoss(s);
		const vl = validLoss(s);
		const b = bestRound(s);
		const pts = (a: number[]) => a.map((v, i) => [i, v] as [number, number]);
		lossMap = lineChart(ctx, w, h, t, {
			title: L('lossTitle'),
			x: [0, MAX_ROUNDS],
			y: [0, Math.max(0.8, Math.ceil(Math.max(vl[0], ...vl) * 10) / 10)],
			lines: [
				{ pts: pts(tl), color: t.text2, label: L('train') },
				{ pts: pts(vl), color: t.series[4], label: L('valid') }
			],
			marker: s.rounds,
			markerLabel: String(s.rounds),
			points: [[b, vl[b], t.series[4], L('best', { v: b })]],
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
		if (s.mode === 'full') {
			return [
				{ label: L('rounds'), value: String(s.rounds) },
				{ label: L('trainLL'), value: f3(trainLoss(s)[s.rounds]) },
				{ label: L('validLL'), value: f3(validLoss(s)[s.rounds]), highlight: true }
			];
		}
		if (s.show.tree) {
			const t = roundTree(s);
			return [
				{ label: L('leaves'), value: String(leaves(t).length), highlight: leaves(t).length === 1 },
				{ label: L('rootGain'), value: t.split ? f3(t.split.gain) : L('pruned') },
				{ label: 'γ', value: s.gamma.toFixed(2) },
				{ label: 'λ', value: String(s.lambda) }
			];
		}
		if (s.show.sample) {
			const sm = sampleOf(s);
			return [
				{ label: L('tree'), value: `#${s.sampleTree + 1}` },
				{ label: L('rowsUsed'), value: `${sm.rows.length} / ${n}` },
				{ label: L('colsUsed'), value: sm.cols.map((f) => x.FEATURES[f]).join(', '), highlight: !sm.cols.includes(0) }
			];
		}
		const tt = totals();
		const items: { label: string; value: string; highlight?: boolean }[] = [
			{ label: L('gAll'), value: f2(tt.G) },
			{ label: L('hAll'), value: f2(tt.H) }
		];
		if (s.show.split) {
			items.push({ label: L('gain'), value: f3(c.gain - s.gamma), highlight: s.show.formula && c.gain >= 0.95 * bestRoot(s).gain });
			items.push({ label: 'λ', value: String(s.lambda) });
		}
		return items;
	});

	const tt = $derived(totals());
	const anyUi = $derived(Object.values(s.ui).some(Boolean));
	const splits = $derived(s.show.sample ? sampleSplits(s) : []);
	const bestFeat = $derived(splits.reduce<number>((a, q, f) => (q && (a < 0 || q.gain > splits[a]!.gain) ? f : a), -1));
</script>

<div class="scene">
	<Canvas
		{draw}
		aspect={0.52}
		minHeight={250}
		maxHeight={350}
		label={L('ariaMain')}
		cursor={s.ui.drag && s.show.split ? 'ew-resize' : s.ui.pick ? 'pointer' : 'default'}
		onpointerdown={down}
		onpointermove={move}
		onpointerup={() => (dragging = false)}
	/>
	<div class="legend">
		<span class="key"><i class="dot a"></i>{L('label0')}</span>
		<span class="key"><i class="sq b"></i>{L('label1')}</span>
		<span class="key"><i class="line"></i>{L('curveAfter', { rounds: roundsText(s.mode === 'full' ? s.rounds : HISTORY) })}</span>
		{#if s.show.grad && s.mode === 'round'}<span class="key note">{L('noteStem')}</span>{/if}
		{#if s.show.hess}<span class="key note">{L('noteSize')}</span>{/if}
		{#if s.show.sample}<span class="key note">{L('noteFaded')}</span>{/if}
	</div>

	<Readouts items={readouts} />

	{#if s.show.formula}
		<div class="formula" aria-live="polite">
			<div class="row">
				<span>G<sub>L</sub> = <b>{f2(c.GL)}</b></span><span>H<sub>L</sub> = <b>{f2(c.HL)}</b></span>
				<span>G<sub>R</sub> = <b>{f2(c.GR)}</b></span><span>H<sub>R</sub> = <b>{f2(c.HR)}</b></span>
				<span>λ = <b>{s.lambda}</b></span><span>γ = <b>{s.gamma}</b></span>
			</div>
			<div class="eq">
				gain = ½ [ {f2(c.GL)}²/({f2(c.HL)}+{s.lambda}) + {f2(c.GR)}²/({f2(c.HR)}+{s.lambda}) − {f2(tt.G)}²/({f2(tt.H)}+{s.lambda}) ] − {s.gamma}
			</div>
			<div class="eq">
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= ½ [ {f3(score(c.GL, c.HL, s.lambda))} + {f3(score(c.GR, c.HR, s.lambda))} − {f3(score(tt.G, tt.H, s.lambda))} ] − {s.gamma} = <b>{f3(c.gain - s.gamma)}</b>
			</div>
			{#if s.show.missing}
				<div class="row miss">
					<span>{L('missTo', { side: L('left') })}: <b>{f3(c.gainMissLeft - s.gamma)}</b></span>
					<span>{L('missTo', { side: L('right') })}: <b>{f3(c.gainMissRight - s.gamma)}</b></span>
					<span>{L('defaultDir')}: <b>{c.missLeft ? L('left') : L('right')}</b></span>
				</div>
			{/if}
		</div>
	{/if}

	{#if s.show.curve}
		<div class="chart">
			<Canvas
				draw={drawGain}
				aspect={0.28}
				minHeight={140}
				maxHeight={170}
				label={L('ariaGain')}
				cursor={s.ui.drag ? 'ew-resize' : 'default'}
				onpointerdown={(p) => {
					gainDrag = true;
					gainPick(p);
				}}
				onpointermove={(p) => gainDrag && gainPick(p)}
				onpointerup={() => (gainDrag = false)}
			/>
		</div>
	{/if}

	{#if s.show.sample}
		<table class="feats">
			<thead><tr><th>{L('thFeature')}</th><th>{L('thMay')}</th><th>{L('thBest')}</th><th>{L('gain')}</th></tr></thead>
			<tbody>
				{#each x.FEATURES as name, f (name)}
					{@const q = splits[f]}
					<tr class:best={f === bestFeat} class:off={!sampleOf(s).cols.includes(f)}>
						<td>{name} ({f === 0 ? L('signal') : f === 1 ? L('proxy') : L('noise')})</td>
						<td>{sampleOf(s).cols.includes(f) ? L('yes') : L('no')}</td>
						<td class="ltr">{q ? `${name} ≤ ${q.thr.toFixed(2)}` : '—'}</td>
						<td>{q ? f3(q.gain) : '—'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
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
			{#if s.ui.rounds}<Slider label={L('roundsSlider')} bind:value={s.rounds} min={1} max={MAX_ROUNDS} />{/if}
			{#if s.ui.lr}<Slider label="learning_rate η" bind:value={s.lr} min={0.05} max={1} step={0.05} format={(v) => v.toFixed(2)} />{/if}
			{#if s.ui.depth}<Slider label="max_depth" bind:value={s.maxDepth} min={1} max={6} />{/if}
			{#if s.ui.lambda}<Slider label="reg_lambda λ" bind:value={s.lambda} min={0} max={20} step={0.5} />{/if}
			{#if s.ui.gamma}<Slider label="gamma γ" bind:value={s.gamma} min={0} max={5} step={0.05} format={(v) => v.toFixed(2)} />{/if}
			{#if s.ui.subsample}<Slider label="subsample" bind:value={s.subsample} min={0.3} max={1} step={0.05} format={(v) => v.toFixed(2)} />{/if}
			{#if s.ui.colsample}<Slider label="colsample_bytree" bind:value={s.colsample} min={1} max={3} format={(v) => L('ofCols', { v })} />{/if}
			{#if s.ui.resample}
				<div class="buttons"><button class="btn btn-sm btn-primary" onclick={() => resampleTree(s)}>{L('nextSample')} <span class="flip-rtl" aria-hidden="true">→</span></button></div>
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
	.key i.line {
		width: 16px;
		height: 3px;
		border-radius: 2px;
		background: var(--viz-1);
	}
	.chart {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 4px;
	}
	.formula {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 10px 12px;
		display: grid;
		gap: 6px;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--text-2);
		overflow-x: auto;
	}
	.formula .row {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 14px;
	}
	.formula b {
		color: var(--text);
	}
	.formula .eq {
		white-space: nowrap;
	}
	.formula .miss b {
		color: var(--viz-4);
	}
	.feats {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8125rem;
	}
	.feats th,
	.feats td {
		text-align: start;
		padding: 5px 8px;
		border-bottom: 1px solid var(--border);
	}
	.feats th {
		font-weight: 500;
		color: var(--text-3);
		font-size: 0.75rem;
	}
	.feats td:nth-child(3),
	.feats td:nth-child(4) {
		font-family: var(--font-mono);
	}
	.feats tr.off td {
		color: var(--text-3);
	}
	.feats tr.best td {
		font-weight: 600;
		background: color-mix(in srgb, var(--acc, var(--accent)) 8%, transparent);
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
	.flip-rtl {
		display: inline-block;
	}
</style>
