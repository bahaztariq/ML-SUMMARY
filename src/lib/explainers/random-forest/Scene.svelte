<script lang="ts">
	import Canvas from '#lib/viz/Canvas.svelte';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import { alpha, clamp, label, squareMapper, type VizTheme } from '#lib/viz/canvas.ts';
	import type { SceneProps } from '../types.ts';
	import * as dt from '../decision-tree/tree.ts';
	import { classColor, grid, lineChart, marker, niceRange, pill } from '../_ensembles/draw.ts';
	import { pct } from '../_ensembles/memo.ts';
	import { arTrees } from '../_ensembles/i18n.ts';
	import { i18n, local } from '#lib/i18n/index.svelte.ts';
	import {
		COMPARE_TREES,
		GALLERY,
		GRID,
		MAX_TREES,
		UNLIMITED,
		bagStats,
		browse,
		changed,
		correlation,
		forest,
		forestAcc,
		inBag,
		meanTreeAcc,
		oobCurve,
		oobVote,
		resample,
		setTrees,
		single,
		singleAcc,
		singleGrid,
		test,
		testCurve,
		train,
		tree,
		treeAcc,
		voteGrid,
		type RFState
	} from './state.ts';

	let { s = $bindable(), step }: SceneProps<RFState> = $props();

	const en = {
			tree: 'tree {n}',
			leftOut: 'left out by {n} trees · {a} A / {b} B',
			voting1: '1 tree voting',
			votingN: '{trees} voting',
			clickHint: 'click a training point',
			oneDeep: 'one deep tree',
			forestOf: 'forest of {n}',
			testAcc: 'test {v}',
			chartTitle: 'accuracy vs number of trees',
			oneTree: 'one tree',
			test: 'test',
			oob: 'OOB',
			nTrees: '{n} trees',
			leaves: 'leaves',
			trainAcc: 'train acc',
			testAccR: 'test acc',
			distinct: 'distinct rows',
			outOfBag: 'out-of-bag',
			treeTestAcc: 'tree test acc',
			avgTreeAcc: 'avg tree test acc',
			trees: 'trees',
			forestTestAcc: 'forest test acc',
			avgSingle: 'avg single tree',
			oobAcc: 'OOB acc',
			sample: 'sample',
			treeChanged: 'tree changed',
			forestChanged: 'forest changed',
			ariaMini: 'Tree {n} decision regions and its bootstrap sample',
			ariaSingle: 'Single deep tree trained on the current sample',
			ariaForest: 'Random forest trained on the current sample',
			ariaMain: "Two-class scatter plot with the model's decision regions",
			ariaChart: 'Test and out-of-bag accuracy as trees are added',
			classA: 'class A',
			classB: 'class B',
			noteGallery: "bigger = drawn more than once · faded = not in this tree's sample",
			noteBag: 'bigger = drawn 2+ times',
			noteOob: ' · faded ring = out-of-bag',
			noteFaded: ' · faded = not drawn',
			noteShade: 'shading = share of trees voting each class',
			noteTest: '600 test points · outlined = misclassified',
			shared: 'shared part',
			averaged: 'averaged part',
			ofVar: 'of σ²',
			prev: 'Previous tree',
			next: 'Next tree',
			perSplit: '1 per split',
			all: 'all',
			on: 'on',
			off: 'off',
			showPoints: 'Show points',
			train: 'Train',
			testBtn: 'Test',
			newSample: '↻ New training sample',
			none: 'none'
	};
	const L = local({
		en,
		fr: {
			tree: 'arbre {n}',
			leftOut: 'laissé de côté par {n} arbres · {a} A / {b} B',
			voting1: '1 arbre vote',
			votingN: '{trees} votent',
			clickHint: 'cliquez sur un point d’entraînement',
			oneDeep: 'un arbre profond',
			forestOf: 'forêt de {n}',
			testAcc: 'test {v}',
			chartTitle: 'exactitude selon le nombre d’arbres',
			oneTree: 'un arbre',
			test: 'test',
			oob: 'OOB',
			nTrees: '{n} arbres',
			leaves: 'feuilles',
			trainAcc: 'exact. entraînement',
			testAccR: 'exact. test',
			distinct: 'lignes distinctes',
			outOfBag: 'hors sac',
			treeTestAcc: 'exact. test de l’arbre',
			avgTreeAcc: 'exact. test moy. par arbre',
			trees: 'arbres',
			forestTestAcc: 'exact. test de la forêt',
			avgSingle: 'arbre seul (moy.)',
			oobAcc: 'exact. hors sac',
			sample: 'échantillon',
			treeChanged: 'arbre modifié',
			forestChanged: 'forêt modifiée',
			ariaMini: 'Régions de décision de l’arbre {n} et son échantillon bootstrap',
			ariaSingle: 'Arbre profond seul entraîné sur l’échantillon actuel',
			ariaForest: 'Forêt aléatoire entraînée sur l’échantillon actuel',
			ariaMain: 'Nuage de points à deux classes avec les régions de décision du modèle',
			ariaChart: 'Exactitude de test et hors sac à mesure qu’on ajoute des arbres',
			classA: 'classe A',
			classB: 'classe B',
			noteGallery: 'plus gros = tiré plusieurs fois · estompé = absent de l’échantillon de cet arbre',
			noteBag: 'plus gros = tiré 2 fois ou plus',
			noteOob: ' · anneau estompé = hors sac',
			noteFaded: ' · estompé = non tiré',
			noteShade: 'ombrage = part des arbres votant pour chaque classe',
			noteTest: '600 points de test · contour = mal classé',
			shared: 'part commune',
			averaged: 'part moyennée',
			ofVar: 'de σ²',
			prev: 'Arbre précédent',
			next: 'Arbre suivant',
			perSplit: '1 par division',
			all: 'toutes',
			on: 'activé',
			off: 'désactivé',
			showPoints: 'Points affichés',
			train: 'Entraînement',
			testBtn: 'Test',
			newSample: '↻ Nouvel échantillon d’entraînement',
			none: 'aucune'
		},
		ar: {
			tree: 'الشجرة {n}',
			leftOut: 'استبعدتها {n} شجرة · {a} A / {b} B',
			voting1: 'شجرة واحدة تصوّت',
			votingN: '{trees} تصوّت',
			clickHint: 'انقر على نقطة تدريب',
			oneDeep: 'شجرة عميقة واحدة',
			forestOf: 'غابة من {n}',
			testAcc: 'اختبار {v}',
			chartTitle: 'الدقة مقابل عدد الأشجار',
			oneTree: 'شجرة واحدة',
			test: 'اختبار',
			oob: 'OOB',
			nTrees: '{n} شجرة',
			leaves: 'الأوراق',
			trainAcc: 'دقة التدريب',
			testAccR: 'دقة الاختبار',
			distinct: 'صفوف مختلفة',
			outOfBag: 'خارج الكيس',
			treeTestAcc: 'دقة اختبار الشجرة',
			avgTreeAcc: 'متوسط دقة الشجرة',
			trees: 'الأشجار',
			forestTestAcc: 'دقة اختبار الغابة',
			avgSingle: 'متوسط الشجرة الواحدة',
			oobAcc: 'الدقة خارج الكيس',
			sample: 'العيّنة',
			treeChanged: 'تغيّر الشجرة',
			forestChanged: 'تغيّر الغابة',
			ariaMini: 'مناطق قرار الشجرة {n} وعيّنة bootstrap الخاصة بها',
			ariaSingle: 'شجرة عميقة واحدة مدرّبة على العيّنة الحالية',
			ariaForest: 'غابة عشوائية مدرّبة على العيّنة الحالية',
			ariaMain: 'مخطط انتشار بفئتين مع مناطق قرار النموذج',
			ariaChart: 'دقة الاختبار والدقة خارج الكيس مع إضافة الأشجار',
			classA: 'الفئة A',
			classB: 'الفئة B',
			noteGallery: 'أكبر = سُحبت أكثر من مرة · باهتة = ليست في عيّنة هذه الشجرة',
			noteBag: 'أكبر = سُحبت مرتين أو أكثر',
			noteOob: ' · حلقة باهتة = خارج الكيس',
			noteFaded: ' · باهتة = لم تُسحب',
			noteShade: 'التظليل = نسبة الأشجار المصوّتة لكل فئة',
			noteTest: '600 نقطة اختبار · المحاطة بخط = مصنّفة خطأ',
			shared: 'الجزء المشترك',
			averaged: 'الجزء الذي يزول بالمتوسط',
			ofVar: 'من σ²',
			prev: 'الشجرة السابقة',
			next: 'الشجرة التالية',
			perSplit: '1 لكل تقسيم',
			all: 'الكل',
			on: 'مفعّل',
			off: 'معطّل',
			showPoints: 'النقاط المعروضة',
			train: 'تدريب',
			testBtn: 'اختبار',
			newSample: '↻ عيّنة تدريب جديدة',
			none: 'بلا حد'
		}
	});
	/** "{n} trees", with Arabic number agreement. */
	const treesText = (n: number) => (i18n.current === 'ar' ? arTrees(n) : L('nTrees', { n }));

	const DOMAIN: [number, number] = [-1.05, 1.05];
	const PAD = 8;
	const BIG: dt.Rect = { x0: -20, x1: 20, y0: -20, y1: 20 };
	let map: ReturnType<typeof squareMapper> | null = null;

	/* ---- shared drawing pieces ---- */
	function tintRegions(ctx: CanvasRenderingContext2D, t: VizTheme, m: ReturnType<typeof squareMapper>, w: number, h: number, node: dt.Node) {
		for (const { node: n, rect } of dt.regions(node, BIG).values()) {
			if (!dt.isLeaf(n)) continue;
			const x0 = clamp(m.x(rect.x0), -2, w + 2);
			const x1 = clamp(m.x(rect.x1), -2, w + 2);
			const y0 = clamp(m.y(rect.y1), -2, h + 2);
			const y1 = clamp(m.y(rect.y0), -2, h + 2);
			ctx.fillStyle = alpha(classColor(t, n.pred), 0.2);
			ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
		}
	}

	function shadeGrid(ctx: CanvasRenderingContext2D, t: VizTheme, m: ReturnType<typeof squareMapper>, shares: ArrayLike<number>) {
		const cw = (GRID.x1 - GRID.x0) / GRID.nx;
		const ch = (GRID.y1 - GRID.y0) / GRID.ny;
		for (let iy = 0; iy < GRID.ny; iy++)
			for (let ix = 0; ix < GRID.nx; ix++) {
				const v = shares[iy * GRID.nx + ix];
				// integer edges shared by neighbours, so translucent cells never overlap
				const x0 = Math.round(m.x(GRID.x0 + ix * cw));
				const x1 = Math.round(m.x(GRID.x0 + (ix + 1) * cw));
				const y0 = Math.round(m.y(GRID.y0 + (iy + 1) * ch));
				const y1 = Math.round(m.y(GRID.y0 + iy * ch));
				if (x1 <= x0 || y1 <= y0) continue;
				ctx.fillStyle = alpha(classColor(t, v > 0.5 ? 1 : 0), 0.04 + 0.26 * Math.abs(2 * v - 1));
				ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
			}
	}

	function points(ctx: CanvasRenderingContext2D, t: VizTheme, m: ReturnType<typeof squareMapper>, predict: ((p: dt.Pt) => number) | null, size = 4) {
		const isTest = s.view === 'test';
		const data = isTest ? test() : train(s);
		data.X.forEach((p, i) => {
			const c = data.y[i];
			const wrong = predict ? predict(p) !== c : false;
			if (isTest) marker(ctx, m.x(p[0]), m.y(p[1]), c, wrong ? 3 : 2.4, alpha(classColor(t, c), wrong ? 0.95 : 0.45), wrong ? t.text : undefined, 1.2);
			else marker(ctx, m.x(p[0]), m.y(p[1]), c, size, alpha(classColor(t, c), 0.9), wrong ? t.text : t.bg, wrong ? 1.6 : 1);
		});
	}

	/** Training points sized by how often tree `ti` drew them; out-of-bag rows faded (and ringed). */
	function bagPoints(ctx: CanvasRenderingContext2D, t: VizTheme, m: ReturnType<typeof squareMapper>, ti: number, small = false) {
		const data = train(s);
		const mult = inBag(s, ti);
		data.X.forEach((p, i) => {
			const c = data.y[i];
			const k = mult[i];
			const x = m.x(p[0]);
			const y = m.y(p[1]);
			if (k === 0) {
				if (s.show.oob || small) marker(ctx, x, y, c, small ? 2 : 3.2, alpha(classColor(t, c), 0.15), s.show.oob ? alpha(t.text, 0.55) : undefined, 1);
				else marker(ctx, x, y, c, 3, alpha(classColor(t, c), 0.18));
				return;
			}
			const r = (small ? 1.6 : 3.2) + (small ? 0.8 : 1.6) * Math.min(3, k - 1);
			marker(ctx, x, y, c, r, alpha(classColor(t, c), 0.9), t.bg, 1);
		});
	}

	function axes(ctx: CanvasRenderingContext2D, t: VizTheme, w: number, h: number) {
		label(ctx, t, 'x₁ →', w - 10, h - 8, { align: 'right', color: t.text3, size: 10, base: 'bottom' });
		label(ctx, t, '↑ x₂', 6, 8, { color: t.text3, size: 10, base: 'top' });
	}

	/* ---- main plot ---- */
	function draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const m = squareMapper({ x: PAD, y: PAD, w: w - 2 * PAD, h: h - 2 * PAD }, DOMAIN);
		map = m;
		grid(ctx, t, m, w, h);
		if (s.mode === 'single') {
			const node = single(s);
			tintRegions(ctx, t, m, w, h, node);
			points(ctx, t, m, (p) => dt.predict(node, p));
		} else if (s.mode === 'tree') {
			const node = tree(s, s.focus);
			tintRegions(ctx, t, m, w, h, node);
			if (s.show.bag) bagPoints(ctx, t, m, s.focus);
			else points(ctx, t, m, null);
			pill(ctx, t, L('tree', { n: s.focus + 1 }), 12, h - 22);
		} else {
			const B = s.nTrees;
			shadeGrid(ctx, t, m, voteGrid(s, B));
			const trees = forest(s, B).trees;
			const shares = (p: dt.Pt) => {
				let v = 0;
				for (let k = 0; k < B; k++) v += dt.predict(trees[k], p);
				return v / B > 0.5 ? 1 : 0;
			};
			points(ctx, t, m, s.view === 'test' ? shares : null);
			if (s.picked >= 0 && s.view === 'train') {
				const p = train(s).X[s.picked];
				ctx.strokeStyle = t.text;
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.arc(m.x(p[0]), m.y(p[1]), 10, 0, Math.PI * 2);
				ctx.stroke();
				const v = oobVote(s, B, s.picked);
				const text = L('leftOut', { n: v.out, a: v.a, b: v.b });
				const px = clamp(m.x(p[0]) + 14, 6, w - 200);
				pill(ctx, t, text, px, clamp(m.y(p[1]) - 18, 14, h - 14));
			}
			pill(ctx, t, B === 1 ? L('voting1') : L('votingN', { n: B, trees: treesText(B) }), 12, h - 22);
		}
		if (s.ui.pick && s.picked < 0 && s.mode === 'forest' && s.view === 'train') {
			const hint = L('clickHint');
			ctx.font = `600 11px ${t.sans}`;
			pill(ctx, t, hint, (w - ctx.measureText(hint).width - 12) / 2, 22);
		}
		axes(ctx, t, w, h);
	}

	function down(p: { x: number; y: number }) {
		if (!map || !s.ui.pick || s.mode !== 'forest' || s.view !== 'train') return;
		const data = train(s);
		let best = -1;
		let bd = 16 * 16;
		data.X.forEach((q, i) => {
			const d = (map!.x(q[0]) - p.x) ** 2 + (map!.y(q[1]) - p.y) ** 2;
			if (d < bd) {
				bd = d;
				best = i;
			}
		});
		if (best >= 0) {
			s.picked = best;
			s.did.pick = true;
		}
	}

	/* ---- small multiples ---- */
	function drawMini(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme, ti: number) {
		const m = squareMapper({ x: 4, y: 4, w: w - 8, h: h - 8 }, DOMAIN);
		tintRegions(ctx, t, m, w, h, tree(s, ti));
		bagPoints(ctx, t, m, ti, true);
		pill(ctx, t, `${L('tree', { n: ti + 1 })} · ${pct(treeAcc(s, ti))}`, 6, 15, t.text, 10);
	}

	function drawCompare(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme, which: 'single' | 'forest') {
		const m = squareMapper({ x: 4, y: 4, w: w - 8, h: h - 8 }, DOMAIN);
		if (which === 'single') tintRegions(ctx, t, m, w, h, single(s));
		else shadeGrid(ctx, t, m, voteGrid(s, COMPARE_TREES));
		const data = train(s);
		data.X.forEach((p, i) => marker(ctx, m.x(p[0]), m.y(p[1]), data.y[i], 2.6, alpha(classColor(t, data.y[i]), 0.85)));
		const acc = which === 'single' ? singleAcc(s).test : forestAcc(s, COMPARE_TREES);
		pill(ctx, t, `${which === 'single' ? L('oneDeep') : L('forestOf', { n: COMPARE_TREES })} · ${L('testAcc', { v: pct(acc) })}`, 6, 15, t.text, 10);
	}

	/* ---- accuracy vs trees ---- */
	let chartMap: ReturnType<typeof lineChart> | null = null;
	function drawChart(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const N = s.curveTo;
		const tc = testCurve(s, N);
		const oc = s.show.oobCurve ? oobCurve(s, N) : [];
		const sa = singleAcc(s).test;
		const yr = niceRange([...tc, ...oc.filter(Number.isFinite), sa], 0.05, 0.01);
		chartMap = lineChart(ctx, w, h, t, {
			title: L('chartTitle'),
			x: [1, Math.max(N, 2)],
			y: yr,
			yFormat: (v) => pct(v),
			lines: [
				{ pts: [[1, sa], [Math.max(N, 2), sa]], color: t.text3, width: 1.25, dash: [4, 4], label: L('oneTree') },
				{ pts: tc.map((v, i) => [i + 1, v] as [number, number]), color: t.series[4], label: L('test') },
				...(s.show.oobCurve
					? [{ pts: oc.map((v, i) => [i + 1, v] as [number, number]).filter((p) => Number.isFinite(p[1])), color: t.series[1], label: L('oob') }]
					: [])
			],
			marker: s.nTrees,
			markerLabel: treesText(s.nTrees),
			right: 56
		});
	}
	let chartDrag = false;
	function chartPick(p: { x: number }) {
		if (!chartMap || !s.ui.nTrees) return;
		setTrees(s, clamp(chartMap.invX(p.x), 1, s.curveTo));
	}

	/* ---- readouts ---- */
	const readouts = $derived.by(() => {
		const items: { label: string; value: string; highlight?: boolean }[] = [];
		if (s.mode === 'single') {
			const a = singleAcc(s);
			const st = dt.stats(single(s));
			items.push({ label: L('leaves'), value: String(st.leaves) }, { label: L('trainAcc'), value: pct(a.train) }, { label: L('testAccR'), value: pct(a.test), highlight: true });
		} else if (s.mode === 'tree') {
			const b = bagStats(s);
			items.push({ label: L('distinct'), value: `${b.unique} / ${b.n}` });
			if (s.show.oob) items.push({ label: L('outOfBag'), value: `${b.out} (${pct(b.out / b.n)})`, highlight: true });
			items.push({ label: L('treeTestAcc'), value: pct(treeAcc(s, s.focus)) });
		} else if (s.mode === 'gallery') {
			items.push({ label: L('avgTreeAcc'), value: pct(meanTreeAcc(s)) }, { label: L('oneDeep'), value: pct(singleAcc(s).test) });
		} else if (s.mode === 'forest') {
			items.push(
				{ label: L('trees'), value: String(s.nTrees) },
				{ label: L('forestTestAcc'), value: pct(forestAcc(s, s.nTrees)), highlight: true },
				{ label: L('avgSingle'), value: pct(meanTreeAcc(s)) }
			);
			if (s.show.oobCurve) items.push({ label: L('oobAcc'), value: pct(oobCurve(s, s.nTrees)[s.nTrees - 1]) });
		} else {
			const c = changed(s);
			items.push(
				{ label: L('sample'), value: `#${s.did.resample + 1}` },
				{ label: L('treeChanged'), value: c ? pct(c.single) : '—' },
				{ label: L('forestChanged'), value: c ? pct(c.forest) : '—', highlight: !!c }
			);
		}
		return items;
	});

	const corr = $derived(s.show.corr ? correlation(s) : 0);
	const anyUi = $derived(Object.values(s.ui).some(Boolean));
	const gallery = Array.from({ length: GALLERY }, (_, i) => i);
</script>

<div class="scene">
	{#if s.mode === 'gallery'}
		<div class="gallery">
			{#each gallery as ti (ti)}
				<div class="mini">
					<Canvas draw={(c, w, h, t) => drawMini(c, w, h, t, ti)} aspect={1} minHeight={110} maxHeight={220} label={L('ariaMini', { n: ti + 1 })} />
				</div>
			{/each}
		</div>
		<div class="legend">
			<span class="key"><i class="dot a"></i>{L('classA')}</span>
			<span class="key"><i class="sq b"></i>{L('classB')}</span>
			<span class="key note">{L('noteGallery')}</span>
		</div>
	{:else if s.mode === 'compare'}
		<div class="pair">
			<Canvas draw={(c, w, h, t) => drawCompare(c, w, h, t, 'single')} aspect={1} minHeight={150} maxHeight={320} label={L('ariaSingle')} />
			<Canvas draw={(c, w, h, t) => drawCompare(c, w, h, t, 'forest')} aspect={1} minHeight={150} maxHeight={320} label={L('ariaForest')} />
		</div>
	{:else}
		<Canvas
			{draw}
			aspect={0.72}
			minHeight={260}
			maxHeight={430}
			label={L('ariaMain')}
			cursor={s.ui.pick && s.mode === 'forest' ? 'pointer' : 'default'}
			onpointerdown={down}
		/>
		<div class="legend">
			<span class="key"><i class="dot a"></i>{L('classA')}</span>
			<span class="key"><i class="sq b"></i>{L('classB')}</span>
			{#if s.mode === 'tree' && s.show.bag}<span class="key note">{L('noteBag')}{s.show.oob ? L('noteOob') : L('noteFaded')}</span>{/if}
			{#if s.mode === 'forest'}<span class="key note">{L('noteShade')}</span>{/if}
			{#if s.view === 'test'}<span class="key note">{L('noteTest')}</span>{/if}
		</div>
	{/if}

	<Readouts items={readouts} />

	{#if s.show.corr}
		<div class="varbox">
			<div class="eq ltr">Var(forest) = <b>ρ</b>·σ² + (1 − <b>ρ</b>)·σ²/<b>B</b></div>
			<div class="nums">
				<span class="ltr">ρ = <b>{corr.toFixed(2)}</b></span>
				<span class="ltr">B = <b>100</b></span>
				<span>{L('shared')} ρ = <b class="ltr">{pct(corr)}</b> {L('ofVar')}</span>
				<span>{L('averaged')} = <b class="ltr">{pct((1 - corr) / 100, 1)}</b> {L('ofVar')}</span>
			</div>
		</div>
	{/if}

	{#if s.show.curve}
		<div class="chart">
			<Canvas
				draw={drawChart}
				aspect={0.3}
				minHeight={150}
				maxHeight={180}
				label={L('ariaChart')}
				cursor={s.ui.nTrees ? 'ew-resize' : 'default'}
				onpointerdown={(p) => {
					chartDrag = true;
					chartPick(p);
				}}
				onpointermove={(p) => chartDrag && chartPick(p)}
				onpointerup={() => (chartDrag = false)}
			/>
		</div>
	{/if}

	{#if anyUi}
		<div class="controls">
			{#if s.ui.browse}
				<div class="buttons">
					<button class="btn btn-sm" onclick={() => browse(s, -1)}><span class="flip-rtl" aria-hidden="true">←</span> {L('prev')}</button>
					<button class="btn btn-sm btn-primary" onclick={() => browse(s, 1)}>{L('next')} <span class="flip-rtl" aria-hidden="true">→</span></button>
				</div>
			{/if}
			{#if s.ui.nTrees}
				<Slider label="n_estimators" bind:value={s.nTrees} min={1} max={MAX_TREES} oninput={(v) => setTrees(s, v)} />
			{/if}
			{#if s.ui.maxFeatures}
				<Segmented
					label="max_features"
					bind:value={s.maxFeatures}
					options={[
						{ value: 1, label: L('perSplit') },
						{ value: 2, label: L('all') }
					]}
				/>
			{/if}
			{#if s.ui.bootstrap}
				<Segmented
					label="bootstrap"
					value={s.bootstrap ? 'on' : 'off'}
					onchange={(v) => (s.bootstrap = v === 'on')}
					options={[
						{ value: 'on', label: L('on') },
						{ value: 'off', label: L('off') }
					]}
				/>
			{/if}
			{#if s.ui.depth}
				<Slider label="max_depth" bind:value={s.maxDepth} min={1} max={UNLIMITED} format={(d) => (d >= UNLIMITED ? L('none') : String(d))} />
			{/if}
			{#if s.ui.view}
				<Segmented
					label={L('showPoints')}
					bind:value={s.view}
					options={[
						{ value: 'train', label: L('train') },
						{ value: 'test', label: L('testBtn') }
					]}
				/>
			{/if}
			{#if s.ui.resample}
				<div class="buttons">
					<button class="btn btn-sm btn-primary" onclick={() => resample(s)}>{L('newSample')}</button>
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
	.gallery {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 8px;
	}
	.pair {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 8px;
	}
	@media (max-width: 520px) {
		.gallery {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	.mini {
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
	.chart,
	.varbox {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 4px;
	}
	.varbox {
		padding: 10px 12px;
		display: grid;
		gap: 6px;
		font-size: 0.8125rem;
		color: var(--text-2);
	}
	.eq {
		font-family: var(--font-mono);
		color: var(--text);
	}
	.nums {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 16px;
		font-family: var(--font-mono);
		font-size: 0.75rem;
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 14px 20px;
		padding-top: 12px;
		border-top: 1px solid var(--border);
	}
	.flip-rtl {
		display: inline-block;
	}
	.buttons {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}
</style>
