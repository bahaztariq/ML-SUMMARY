<script lang="ts">
	import Canvas from '#lib/viz/Canvas.svelte';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import { alpha, label, mapper, squareMapper, type VizTheme } from '#lib/viz/canvas.ts';
	import type { SceneProps } from '../types.ts';
	import { classColor, grid, marker, pill } from '../_ensembles/draw.ts';
	import { f2, f3, pct } from '../_ensembles/memo.ts';
	import { arLeaves } from '../_ensembles/i18n.ts';
	import { i18n, local } from '#lib/i18n/index.svelte.ts';
	import * as c from './cat.ts';
	import {
		MAX_DEPTH,
		WALK,
		aucTest,
		aucTrain,
		byFreq,
		cartStats,
		counts,
		encTest,
		encTrain,
		oblAcc,
		oblivious,
		prior,
		shuffle,
		test,
		train,
		treeTrain,
		walkRow,
		walkStep,
		type CatState
	} from './state.ts';

	let { s = $bindable(), step }: SceneProps<CatState> = $props();

	const en = {
		freqTitle: 'customers per city (training data), most common first',
		rareCities: '{n} cities with 1–2 customers',
		nCities: '{n} cities',
		ohTitle: 'one-hot matrix: first {rows} customers × {cols} city columns',
		rows: 'rows',
		bigCities: 'big cities',
		smallTowns: 'small towns',
		trainGreedy: 'training rows (greedy encoding)',
		trainOrdered: 'training rows (ordered encoding)',
		newCustomers: 'new customers (test set)',
		churned: 'churned',
		stayed: 'stayed',
		customers: 'customers',
		cities: 'cities',
		churnRate: 'churn rate',
		columns: 'columns',
		zeros: 'zeros',
		method: 'method',
		greedyAll: 'greedy (all rows)',
		orderedTs: 'ordered TS',
		priorA: 'prior a',
		trainAuc: 'train AUC',
		testAuc: 'test AUC',
		rowsEncoded: 'rows encoded',
		depth: 'depth',
		leaves: 'leaves',
		rules: 'rules',
		accSymReg: 'test acc symmetric / regular',
		ariaFreq: 'Number of customers per city',
		customer: 'customer',
		city: 'city',
		churnedQ: 'churned?',
		yes: 'yes',
		no: 'no',
		ariaOh: 'One-hot encoded matrix: one column per city',
		ariaTrainStrip: 'Training rows by encoded value and label',
		ariaTestStrip: 'Test rows by encoded value and label',
		noteDashed: 'dashed line = overall churn rate p',
		inCity: 'customers in city',
		encoding: 'encoding',
		order: 'order',
		earlier: 'earlier, same city',
		posOf: '{a} of {n}',
		ariaTree: 'Symmetric tree: each level is one cut across the whole plane',
		asked1: 'asked by the 1 node at this level',
		askedN: 'asked by all {n} nodes at this level',
		nLeaves: '{n} leaves',
		leafIndex: 'leaf index = the {n} answers read as a binary number (1 = above the threshold)',
		show: 'Show',
		catEnc: 'categorical encoding',
		symTrees: 'symmetric trees',
		encodingSeg: 'Encoding',
		greedyLeaky: 'greedy (leaky)',
		priorStrength: 'prior strength a',
		nextRow: 'Next row',
		all: 'All {n}',
		reset: 'Reset',
		newOrder: '↻ New random order'
	};
	const L = local({
		en,
		fr: {
			freqTitle: 'clients par ville (données d’entraînement), des plus fréquentes aux plus rares',
			rareCities: '{n} villes avec 1 ou 2 clients',
			nCities: '{n} villes',
			ohTitle: 'matrice one-hot : {rows} premiers clients × {cols} colonnes de villes',
			rows: 'lignes',
			bigCities: 'grandes villes',
			smallTowns: 'petites villes',
			trainGreedy: 'lignes d’entraînement (encodage glouton)',
			trainOrdered: 'lignes d’entraînement (encodage ordonné)',
			newCustomers: 'nouveaux clients (jeu de test)',
			churned: 'parti',
			stayed: 'resté',
			customers: 'clients',
			cities: 'villes',
			churnRate: 'taux d’attrition',
			columns: 'colonnes',
			zeros: 'zéros',
			method: 'méthode',
			greedyAll: 'glouton (toutes les lignes)',
			orderedTs: 'TS ordonnées',
			priorA: 'a priori a',
			trainAuc: 'AUC entr.',
			testAuc: 'AUC test',
			rowsEncoded: 'lignes encodées',
			depth: 'profondeur',
			leaves: 'feuilles',
			rules: 'règles',
			accSymReg: 'exact. test symétrique / classique',
			ariaFreq: 'Nombre de clients par ville',
			customer: 'client',
			city: 'ville',
			churnedQ: 'parti ?',
			yes: 'oui',
			no: 'non',
			ariaOh: 'Matrice encodée en one-hot : une colonne par ville',
			ariaTrainStrip: 'Lignes d’entraînement selon la valeur encodée et l’étiquette',
			ariaTestStrip: 'Lignes de test selon la valeur encodée et l’étiquette',
			noteDashed: 'ligne en pointillé = taux d’attrition global p',
			inCity: 'clients dans la ville',
			encoding: 'encodage',
			order: 'ordre',
			earlier: 'avant, même ville',
			posOf: '{a} sur {n}',
			ariaTree: 'Arbre symétrique : chaque niveau est une coupe sur tout le plan',
			asked1: 'posée par l’unique nœud de ce niveau',
			askedN: 'posée par les {n} nœuds de ce niveau',
			nLeaves: '{n} feuilles',
			leafIndex: 'indice de feuille = les {n} réponses lues comme un nombre binaire (1 = au-dessus du seuil)',
			show: 'Afficher',
			catEnc: 'encodage catégoriel',
			symTrees: 'arbres symétriques',
			encodingSeg: 'Encodage',
			greedyLeaky: 'glouton (fuite)',
			priorStrength: 'force de l’a priori a',
			nextRow: 'Ligne suivante',
			all: 'Les {n}',
			reset: 'Réinitialiser',
			newOrder: '↻ Nouvel ordre aléatoire'
		},
		ar: {
			freqTitle: 'العملاء لكل مدينة (بيانات التدريب)، الأكثر شيوعًا أولًا',
			rareCities: '{n} مدينة بعميل أو عميلين',
			nCities: '{n} مدينة',
			ohTitle: 'مصفوفة one-hot: أول {rows} عميلًا × {cols} عمود مدن',
			rows: 'الصفوف',
			bigCities: 'المدن الكبرى',
			smallTowns: 'البلدات الصغيرة',
			trainGreedy: 'صفوف التدريب (ترميز جشع)',
			trainOrdered: 'صفوف التدريب (ترميز مرتّب)',
			newCustomers: 'عملاء جدد (مجموعة الاختبار)',
			churned: 'غادر',
			stayed: 'بقي',
			customers: 'العملاء',
			cities: 'المدن',
			churnRate: 'معدل المغادرة',
			columns: 'الأعمدة',
			zeros: 'الأصفار',
			method: 'الطريقة',
			greedyAll: 'جشع (كل الصفوف)',
			orderedTs: 'TS مرتّبة',
			priorA: 'القبلي a',
			trainAuc: 'AUC التدريب',
			testAuc: 'AUC الاختبار',
			rowsEncoded: 'الصفوف المرمّزة',
			depth: 'العمق',
			leaves: 'الأوراق',
			rules: 'القواعد',
			accSymReg: 'دقة الاختبار متماثلة / عادية',
			ariaFreq: 'عدد العملاء لكل مدينة',
			customer: 'العميل',
			city: 'المدينة',
			churnedQ: 'غادر؟',
			yes: 'نعم',
			no: 'لا',
			ariaOh: 'مصفوفة مرمّزة بـone-hot: عمود لكل مدينة',
			ariaTrainStrip: 'صفوف التدريب حسب القيمة المرمّزة والتسمية',
			ariaTestStrip: 'صفوف الاختبار حسب القيمة المرمّزة والتسمية',
			noteDashed: 'الخط المتقطّع = معدل المغادرة العام p',
			inCity: 'عملاء المدينة',
			encoding: 'الترميز',
			order: 'الترتيب',
			earlier: 'سابقة، المدينة نفسها',
			posOf: '{a} من {n}',
			ariaTree: 'شجرة متماثلة: كل مستوى قطع واحد عبر المستوى كله',
			asked1: 'تطرحه العقدة الوحيدة في هذا المستوى',
			askedN: 'تطرحه كل العقد الـ{n} في هذا المستوى',
			nLeaves: '{n} ورقة',
			leafIndex: 'رقم الورقة = الإجابات الـ{n} مقروءة كعدد ثنائي (1 = فوق العتبة)',
			show: 'اعرض',
			catEnc: 'الترميز الفئوي',
			symTrees: 'الأشجار المتماثلة',
			encodingSeg: 'الترميز',
			greedyLeaky: 'جشع (مُسرِّب)',
			priorStrength: 'قوة القبلي a',
			nextRow: 'الصف التالي',
			all: 'كل الـ{n}',
			reset: 'إعادة تعيين',
			newOrder: '↻ ترتيب عشوائي جديد'
		}
	});

	const d = train();
	const jitter = (i: number) => ((i * 0.6180339887) % 1) * 0.7 + 0.15;
	const isBig = (k: number) => k < c.BIG_CITIES.length;

	/* ---- city frequency bars ---- */
	function drawFreq(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const cats = byFreq();
		const box = { x: 30, y: 24, w: w - 40, h: h - 50 };
		const max = cats[0][1];
		const m = mapper(box, [0, cats.length], [0, max]);
		label(ctx, t, L('freqTitle'), 6, 4, { color: t.text3, size: 10, base: 'top' });
		for (const v of [0, 20, 40]) {
			if (v > max) continue;
			ctx.strokeStyle = t.grid;
			ctx.beginPath();
			ctx.moveTo(box.x, m.y(v));
			ctx.lineTo(box.x + box.w, m.y(v));
			ctx.stroke();
			label(ctx, t, String(v), box.x - 5, m.y(v), { align: 'right', color: t.text3, size: 10 });
		}
		cats.forEach(([k, n], i) => {
			const x0 = m.x(i) + 0.5;
			const x1 = m.x(i + 1) - 0.5;
			ctx.fillStyle = isBig(k) ? t.series[0] : alpha(t.text3, 0.7);
			ctx.fillRect(x0, m.y(n), Math.max(1, x1 - x0), m.y(0) - m.y(n));
			if (isBig(k)) {
				ctx.save();
				ctx.translate((x0 + x1) / 2, m.y(n) - 4);
				ctx.rotate(-Math.PI / 4);
				label(ctx, t, c.catName(k), 0, 0, { color: t.text2, size: 9 });
				ctx.restore();
			}
		});
		const firstRare = cats.findIndex(([, n]) => n <= 2);
		if (firstRare > 0) {
			const x = m.x(firstRare);
			label(ctx, t, `← ${L('rareCities', { n: cats.length - firstRare })} →`, (x + box.x + box.w) / 2, m.y(max * 0.35), {
				align: 'center',
				color: t.text2,
				size: 10,
				weight: 600
			});
		}
		label(ctx, t, L('nCities', { n: cats.length }), box.x + box.w, box.y + box.h + 12, { align: 'right', color: t.text3, size: 10 });
	}

	/* ---- one-hot matrix ---- */
	function drawOneHot(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const cats = byFreq();
		const col = new Map(cats.map(([k], i) => [k, i]));
		const rows = 60;
		const box = { x: 36, y: 26, w: w - 44, h: h - 34 };
		const cw = box.w / cats.length;
		const rh = box.h / rows;
		label(ctx, t, L('ohTitle', { rows, cols: cats.length }), 6, 4, { color: t.text3, size: 10, base: 'top' });
		ctx.strokeStyle = t.grid;
		ctx.strokeRect(box.x, box.y, box.w, box.h);
		for (let r = 0; r < rows; r++) {
			const k = d.cat[r];
			const ci = col.get(k)!;
			ctx.fillStyle = isBig(k) ? t.series[0] : t.series[3];
			ctx.fillRect(box.x + ci * cw, box.y + r * rh + 0.5, Math.max(1.5, cw - 0.5), Math.max(1.5, rh - 1));
		}
		label(ctx, t, L('rows'), 6, box.y + box.h / 2, { color: t.text3, size: 10 });
		label(ctx, t, L('bigCities'), box.x, box.y - 2, { color: t.series[0], size: 9, base: 'bottom', weight: 600 });
		label(ctx, t, `${L('smallTowns')} →`, box.x + box.w, box.y - 2, { align: 'right', color: t.series[3], size: 9, base: 'bottom', weight: 600 });
	}

	/* ---- strip plots of the encoded value ---- */
	function strip(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme, which: 'train' | 'test') {
		const enc = which === 'train' ? encTrain(s) : encTest(s);
		const data = which === 'train' ? d : test();
		const box = { x: 62, y: 24, w: w - 76, h: h - 46 };
		const m = mapper(box, [0, 1], [0, 2]);
		const a = which === 'train' ? aucTrain(s) : aucTest(s);
		const title = which === 'train' ? (s.method === 'greedy' ? L('trainGreedy') : L('trainOrdered')) : L('newCustomers');
		label(ctx, t, title, 6, 4, { color: t.text3, size: 10, base: 'top' });
		pill(ctx, t, `AUC ${f2(a)}`, w - 80, 12, which === 'train' ? t.series[3] : t.series[4]);
		for (const lane of [0, 1]) {
			ctx.fillStyle = alpha(t.text3, 0.06);
			ctx.fillRect(box.x, m.y(lane + 1) + 2, box.w, m.y(lane) - m.y(lane + 1) - 4);
			label(ctx, t, lane ? L('churned') : L('stayed'), box.x - 6, m.y(lane + 0.5), { align: 'right', color: t.text2, size: 10 });
		}
		for (const v of [0, 0.25, 0.5, 0.75, 1]) label(ctx, t, String(v), m.x(v), box.y + box.h + 11, { align: 'center', color: t.text3, size: 10 });
		const n = data.y.length;
		const r = which === 'test' ? 1.8 : 2.8;
		for (let i = 0; i < n; i++) {
			const yv = data.y[i] + jitter(i);
			marker(ctx, m.x(enc[i]), m.y(yv), data.y[i], r, alpha(classColor(t, data.y[i]), which === 'test' ? 0.35 : 0.75));
		}
		// prior
		ctx.strokeStyle = t.axis;
		ctx.setLineDash([3, 3]);
		ctx.beginPath();
		ctx.moveTo(m.x(prior()), box.y);
		ctx.lineTo(m.x(prior()), box.y + box.h);
		ctx.stroke();
		ctx.setLineDash([]);
	}

	/* rows for the encoding table: a few big-city customers and a few one-customer towns */
	const sampleRows = $derived.by(() => {
		const big: number[] = [];
		const lone: number[] = [];
		for (let i = 0; i < d.y.length && (big.length < 4 || lone.length < 4); i++) {
			const n = counts().cnt.get(d.cat[i])!;
			if (isBig(d.cat[i]) && big.length < 4 && !big.some((j) => d.cat[j] === d.cat[i])) big.push(i);
			else if (n === 1 && lone.length < 4 && (lone.filter((j) => d.y[j]).length < 2 || !d.y[i])) lone.push(i);
		}
		return [...big, ...lone];
	});

	/* ---- symmetric tree ---- */
	const T_DOMAIN: [number, number] = [-1.05, 1.05];
	function drawTree(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const m = squareMapper({ x: 8, y: 8, w: w - 16, h: h - 16 }, T_DOMAIN);
		grid(ctx, t, m, w, h);
		const tree = oblivious(s.depth);
		// cells of the grid: evaluate on a fine raster
		const nx = 96;
		const ny = 70;
		for (let iy = 0; iy < ny; iy++)
			for (let ix = 0; ix < nx; ix++) {
				const px = m.invX(((ix + 0.5) / nx) * w);
				const py = m.invY(((iy + 0.5) / ny) * h);
				const v = tree.values[c.leafIndex(tree.levels, [px, py])];
				const a = Math.round((ix / nx) * w);
				const b = Math.round(((ix + 1) / nx) * w);
				const y0 = Math.round((iy / ny) * h);
				const y1 = Math.round(((iy + 1) / ny) * h);
				ctx.fillStyle = alpha(classColor(t, v > 0.5 ? 1 : 0), 0.05 + 0.25 * Math.abs(2 * v - 1));
				ctx.fillRect(a, y0, b - a, y1 - y0);
			}
		const td = treeTrain();
		td.X.forEach((p, i) => marker(ctx, m.x(p[0]), m.y(p[1]), td.y[i], 3, alpha(classColor(t, td.y[i]), 0.85), t.bg, 1));
		tree.levels.forEach((l, k) => {
			ctx.strokeStyle = t.text;
			ctx.lineWidth = 1.75;
			ctx.beginPath();
			if (l.f === 0) {
				ctx.moveTo(m.x(l.thr), 0);
				ctx.lineTo(m.x(l.thr), h);
			} else {
				ctx.moveTo(0, m.y(l.thr));
				ctx.lineTo(w, m.y(l.thr));
			}
			ctx.stroke();
			const lx = l.f === 0 ? m.x(l.thr) : 18 + k * 22;
			const ly = l.f === 0 ? 18 + k * 22 : m.y(l.thr);
			ctx.fillStyle = t.bg;
			ctx.beginPath();
			ctx.arc(lx, ly, 8, 0, Math.PI * 2);
			ctx.fill();
			ctx.strokeStyle = t.text;
			ctx.lineWidth = 1.25;
			ctx.stroke();
			label(ctx, t, String(k + 1), lx, ly + 0.5, { align: 'center', color: t.text, size: 9, weight: 700 });
		});
		label(ctx, t, 'x₁ →', w - 10, h - 8, { align: 'right', color: t.text3, size: 10, base: 'bottom' });
		label(ctx, t, '↑ x₂', 6, 8, { color: t.text3, size: 10, base: 'top' });
	}

	const tree = $derived(oblivious(s.depth));
	const featName = (f: number) => (f === 0 ? 'x₁' : 'x₂');

	/* ---- ordered walk-through table ---- */
	const walk = $derived(Array.from({ length: WALK }, (_, k) => walkRow(s, k)));
	const current = $derived(s.cursor > 0 ? walk[s.cursor - 1] : null);

	const readouts = $derived.by(() => {
		const items: { label: string; value: string; highlight?: boolean }[] = [];
		if (s.view === 'table') {
			const cats = byFreq();
			items.push(
				{ label: L('customers'), value: String(d.y.length) },
				{ label: L('cities'), value: String(cats.length) },
				{ label: L('churnRate'), value: pct(prior()) }
			);
		} else if (s.view === 'onehot') {
			const k = counts().cnt.size;
			items.push({ label: L('columns'), value: String(k) }, { label: L('zeros'), value: pct(1 - 1 / k, 1) });
		} else if (s.view === 'encode' || s.view === 'ordered') {
			items.push({ label: L('method'), value: s.method === 'greedy' ? L('greedyAll') : L('orderedTs') }, { label: L('priorA'), value: String(s.prior) });
			if (s.view === 'encode') {
				items.push({ label: L('trainAuc'), value: f2(aucTrain(s)) });
				if (s.showTest) items.push({ label: L('testAuc'), value: f2(aucTest(s)), highlight: true });
			} else items.push({ label: L('rowsEncoded'), value: `${s.cursor} / ${WALK}` });
		} else {
			const a = oblAcc(s.depth);
			const cs = cartStats(s.depth);
			items.push(
				{ label: L('depth'), value: String(s.depth) },
				{ label: L('leaves'), value: String(2 ** tree.levels.length) },
				{ label: L('rules'), value: String(tree.levels.length), highlight: true },
				{ label: L('accSymReg'), value: `${pct(a.test)} / ${pct(cs.test)}` }
			);
		}
		return items;
	});
	const anyUi = $derived(Object.values(s.ui).some(Boolean));
</script>

<div class="scene">
	{#if s.view === 'table'}
		<div class="chart"><Canvas draw={drawFreq} aspect={0.4} minHeight={180} maxHeight={240} label={L('ariaFreq')} /></div>
		<table class="rows">
			<thead><tr><th>{L('customer')}</th><th>{L('city')}</th><th>{L('churnedQ')}</th></tr></thead>
			<tbody>
				{#each Array.from({ length: 8 }, (_, i) => i) as i (i)}
					<tr><td>#{i + 1}</td><td>{c.catName(d.cat[i])}</td><td>{d.y[i] ? L('yes') : L('no')}</td></tr>
				{/each}
			</tbody>
		</table>
	{:else if s.view === 'onehot'}
		<div class="chart"><Canvas draw={drawOneHot} aspect={0.55} minHeight={220} maxHeight={340} label={L('ariaOh')} /></div>
	{:else if s.view === 'encode'}
		<div class="chart"><Canvas draw={(cx, w, h, t) => strip(cx, w, h, t, 'train')} aspect={0.3} minHeight={150} maxHeight={190} label={L('ariaTrainStrip')} /></div>
		{#if s.showTest}
			<div class="chart"><Canvas draw={(cx, w, h, t) => strip(cx, w, h, t, 'test')} aspect={0.3} minHeight={150} maxHeight={190} label={L('ariaTestStrip')} /></div>
		{/if}
		<div class="legend">
			<span class="key"><i class="dot a"></i>{L('stayed')}</span>
			<span class="key"><i class="sq b"></i>{L('churned')}</span>
			<span class="key note">{L('noteDashed')}</span>
		</div>
		{#if s.show.table}
			<table class="rows">
				<thead><tr><th>{L('city')}</th><th>{L('inCity')}</th><th>{L('churnedQ')}</th><th>{L('encoding')}</th></tr></thead>
				<tbody>
					{#each sampleRows as i (i)}
						{@const n = counts().cnt.get(d.cat[i]) ?? 0}
						<tr class:leak={n === 1}>
							<td>{c.catName(d.cat[i])}</td>
							<td>{n}</td>
							<td>{d.y[i] ? L('yes') : L('no')}</td>
							<td class="num">{f3(encTrain(s)[i])}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	{:else if s.view === 'ordered'}
		<table class="rows walk">
			<thead><tr><th>{L('order')}</th><th>{L('city')}</th><th>{L('churnedQ')}</th><th>{L('earlier')}</th><th>TS</th></tr></thead>
			<tbody>
				{#each walk as r, k (k)}
					<tr class:cur={k === s.cursor - 1} class:used={!!current && k < s.cursor - 1 && current.before.includes(r.i)} class:todo={k >= s.cursor}>
						<td>{k + 1}</td>
						<td>{c.catName(r.cat)}</td>
						<td>{r.y ? L('yes') : L('no')}</td>
						<td>{k < s.cursor ? L('posOf', { a: r.pos, n: r.n }) : ''}</td>
						<td class="num">{k < s.cursor ? f3(r.value) : '?'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if current}
			<div class="formula">
				TS = ({current.pos} + {s.prior}·{f2(prior())}) / ({current.n} + {s.prior}) = <b>{f3(current.value)}</b>
			</div>
		{/if}
	{:else}
		<Canvas draw={drawTree} aspect={0.72} minHeight={240} maxHeight={400} label={L('ariaTree')} />
		<div class="levels">
			{#each tree.levels as l, k (k)}
				<div class="level">
					<span class="badge">{k + 1}</span>
					<span class="rule ltr">{featName(l.f)} ≤ {f2(l.thr)}</span>
					<span class="dots" aria-hidden="true">{#each Array.from({ length: Math.min(2 ** k, 32) }, (_, j) => j) as j (j)}<i></i>{/each}{2 ** k > 32 ? '…' : ''}</span>
					<span class="count">{k ? L('askedN', { n: 2 ** k }) : L('asked1')}</span>
				</div>
			{/each}
			<div class="level leaves"><span class="badge">◼</span><span class="rule">{i18n.current === 'ar' ? arLeaves(2 ** tree.levels.length) : L('nLeaves', { n: 2 ** tree.levels.length })}</span><span class="count">{L('leafIndex', { n: tree.levels.length })}</span></div>
		</div>
	{/if}

	<Readouts items={readouts} />

	{#if anyUi}
		<div class="controls">
			{#if s.ui.view}
				<Segmented
					label={L('show')}
					value={s.view === 'trees' ? 'trees' : 'encode'}
					onchange={(v) => (s.view = v === 'trees' ? 'trees' : 'encode')}
					options={[
						{ value: 'encode', label: L('catEnc') },
						{ value: 'trees', label: L('symTrees') }
					]}
				/>
			{/if}
			{#if s.view !== 'trees'}
				{#if s.ui.method}
					<Segmented
						label={L('encodingSeg')}
						bind:value={s.method}
						options={[
							{ value: 'greedy', label: L('greedyLeaky') },
							{ value: 'ordered', label: L('orderedTs') }
						]}
					/>
				{/if}
				{#if s.ui.prior}<Slider label={L('priorStrength')} bind:value={s.prior} min={0} max={100} />{/if}
				{#if s.ui.walk}
					<div class="buttons">
						<button class="btn btn-sm btn-primary" onclick={() => walkStep(s, 1)} disabled={s.cursor >= WALK}>{L('nextRow')} <span class="flip-rtl" aria-hidden="true">→</span></button>
						<button class="btn btn-sm" onclick={() => walkStep(s, WALK)} disabled={s.cursor >= WALK}>{L('all', { n: WALK })}</button>
						<button class="btn btn-sm btn-ghost" onclick={() => (s.cursor = 0)} disabled={s.cursor === 0}>{L('reset')}</button>
					</div>
				{/if}
				{#if s.ui.shuffle}
					<div class="buttons"><button class="btn btn-sm" onclick={() => shuffle(s)}>{L('newOrder')}</button></div>
				{/if}
			{:else if s.ui.depth}
				<Slider label={L('depth')} bind:value={s.depth} min={1} max={MAX_DEPTH} />
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
	table.rows {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8125rem;
	}
	.rows th,
	.rows td {
		text-align: start;
		padding: 4px 8px;
		border-bottom: 1px solid var(--border);
	}
	.rows th {
		font-weight: 500;
		color: var(--text-3);
		font-size: 0.75rem;
	}
	.rows td.num {
		font-family: var(--font-mono);
	}
	.rows tr.leak td {
		background: color-mix(in srgb, var(--viz-4) 9%, transparent);
	}
	.walk tr.todo td {
		color: var(--text-3);
	}
	.walk tr.cur td {
		background: color-mix(in srgb, var(--acc, var(--accent)) 12%, transparent);
		font-weight: 600;
	}
	.walk tr.used td {
		background: color-mix(in srgb, var(--viz-2) 12%, transparent);
	}
	.formula {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 8px 12px;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--text-2);
	}
	.formula b {
		color: var(--text);
	}
	.levels {
		display: grid;
		gap: 4px;
		font-size: 0.8125rem;
	}
	.level {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}
	.badge {
		display: inline-grid;
		place-items: center;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		border: 1.25px solid var(--text);
		font-size: 0.6875rem;
		font-weight: 700;
	}
	.rule {
		font-family: var(--font-mono);
		font-weight: 600;
	}
	.dots {
		display: inline-flex;
		gap: 2px;
		color: var(--text-3);
	}
	.dots i {
		display: inline-block;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--text-2);
	}
	.count {
		color: var(--text-3);
		font-size: 0.75rem;
	}
	.leaves .badge {
		border: none;
		color: var(--viz-3);
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
