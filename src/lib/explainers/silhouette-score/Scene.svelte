<script lang="ts">
	import Canvas from '#lib/viz/Canvas.svelte';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import { alpha, dot, label, mapper, squareMapper, type VizTheme } from '#lib/viz/canvas.ts';
	import { clusterColor, grid, hitPoint, metricChart, type Mapper } from '../_clustering/draw';
	import type { Pt } from '../_clustering/data';
	import type { SceneProps } from '../types';
	import type { Dataset } from './silhouette';
	import { bestK, curveOf, labels, nClusters, points, select, setData, setK, sil, type SilState } from './state';
	import { local } from '#lib/i18n/index.svelte.ts';

	// Declared apart so local() infers `string` values, not the English literals.
	const en = {
		avg: 'avg',
		clickPoint: 'click a point',
		trueGroups: 'true groups',
		mean: 'mean {v}',
		curveY: 'mean silhouette (higher is better)',
		groups: 'groups',
		meanSil: 'mean silhouette',
		sceneLabel: 'Clustered points; lines from the selected point show the distances behind a(i) and b(i)',
		plotLabel: 'Silhouette plot: one bar per point, grouped by cluster',
		curveLabel: 'Mean silhouette for K from 2 to 8',
		dataset: 'Dataset',
		blobs: 'Blobs',
		moons: 'Moons',
		labels: 'Labels',
		trueGroupsOpt: 'True groups'
	};
	const L = local({
		en,
		fr: {
			avg: 'moy',
			clickPoint: 'cliquez sur un point',
			trueGroups: 'vrais groupes',
			mean: 'moy. {v}',
			curveY: 'silhouette moyenne (↑ = mieux)',
			groups: 'groupes',
			meanSil: 'silhouette moyenne',
			sceneLabel: 'Points regroupés en clusters ; les traits partant du point sélectionné montrent les distances derrière a(i) et b(i)',
			plotLabel: 'Diagramme de silhouette : une barre par point, regroupées par cluster',
			curveLabel: 'Silhouette moyenne pour K de 2 à 8',
			dataset: 'Données',
			blobs: 'Amas',
			moons: 'Lunes',
			labels: 'Étiquettes',
			trueGroupsOpt: 'Vrais groupes'
		},
		ar: {
			avg: 'متوسط',
			clickPoint: 'انقر على نقطة',
			trueGroups: 'المجموعات الحقيقية',
			mean: 'المتوسط {v}',
			curveY: 'متوسط الظل (الأعلى أفضل)',
			groups: 'المجموعات',
			meanSil: 'متوسط الظل',
			sceneLabel: 'نقاط مجمّعة في عناقيد؛ تُظهر الخطوط الخارجة من النقطة المحددة المسافات التي يُحسب منها a(i) و b(i)',
			plotLabel: 'مخطط الظل: شريط لكل نقطة، مجمّعة حسب العنقود',
			curveLabel: 'متوسط الظل لقيم K من 2 إلى 8',
			dataset: 'البيانات',
			blobs: 'كتل',
			moons: 'أهلّة',
			labels: 'التسميات',
			trueGroupsOpt: 'المجموعات الحقيقية'
		}
	});

	let { s = $bindable() }: SceneProps<SilState> = $props();

	const DOMAIN: [number, number] = [-1.1, 1.1];
	const PAD = 10;

	const r = $derived(sil(s));
	const lab = $derived(labels(s));
	const K = $derived(nClusters(s));

	let map: Mapper | null = null;
	let hover = $state(-1);
	function down(p: { x: number; y: number }) {
		if (!map || !s.ui.select) return;
		const i = hitPoint(points(s), map, p, 16);
		if (i >= 0) select(s, i);
	}
	function move(p: { x: number; y: number }) {
		hover = map && s.ui.select ? hitPoint(points(s), map, p, 16) : -1;
	}

	function centre(pts: Pt[], c: number): Pt {
		let x = 0;
		let y = 0;
		let n = 0;
		pts.forEach((p, i) => {
			if (lab[i] !== c) return;
			x += p[0];
			y += p[1];
			n++;
		});
		return [x / (n || 1), y / (n || 1)];
	}

	function tag(ctx: CanvasRenderingContext2D, t: VizTheme, txt: string, x: number, y: number, color: string, strong: boolean) {
		ctx.font = `${strong ? 700 : 500} 11px ${t.sans}`;
		const tw = ctx.measureText(txt).width;
		ctx.fillStyle = alpha(t.bg, 0.9);
		ctx.strokeStyle = strong ? color : alpha(color, 0.4);
		ctx.lineWidth = strong ? 1.5 : 1;
		ctx.beginPath();
		ctx.roundRect(x - tw / 2 - 6, y - 9, tw + 12, 18, 5);
		ctx.fill();
		ctx.stroke();
		label(ctx, t, txt, x, y, { align: 'center', color, size: 11, weight: strong ? 700 : 500 });
	}

	function draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const m = squareMapper({ x: PAD, y: PAD, w: w - PAD * 2, h: h - PAD * 2 }, DOMAIN);
		map = m;
		const pts = points(s);
		grid(ctx, m, w, h, t);
		const sel = s.selected >= 0 && s.selected < pts.length ? s.selected : -1;

		// distance lines for a(i) and b(i)
		if (sel >= 0) {
			const p = pts[sel];
			const own = lab[sel];
			const nb = r.nearest[sel];
			ctx.lineWidth = 1;
			pts.forEach((q, j) => {
				if (j === sel) return;
				const isOwn = lab[j] === own;
				const isNb = lab[j] === nb;
				if ((isOwn && s.show.a) || (isNb && s.show.b)) {
					ctx.strokeStyle = alpha(clusterColor(t, lab[j]), isOwn ? 0.4 : 0.32);
					ctx.setLineDash(isOwn ? [] : [3, 3]);
					ctx.beginPath();
					ctx.moveTo(m.x(p[0]), m.y(p[1]));
					ctx.lineTo(m.x(q[0]), m.y(q[1]));
					ctx.stroke();
				}
			});
			ctx.setLineDash([]);
		}

		// points
		pts.forEach((p, i) => {
			const col = clusterColor(t, lab[i]);
			const neg = s.show.plot && r.s[i] < 0;
			dot(ctx, m.x(p[0]), m.y(p[1]), 4, alpha(col, 0.88), neg ? t.text : undefined, 1.5);
		});

		// mean distance to each cluster, written at its centre
		if (sel >= 0 && (s.show.means || s.show.b || s.show.a)) {
			const own = lab[sel];
			const nb = r.nearest[sel];
			for (let c = 0; c < K; c++) {
				const isOwn = c === own;
				const isNb = c === nb;
				if (!s.show.means && !(isOwn && s.show.a) && !(isNb && s.show.b)) continue;
				const ctr = centre(pts, c);
				const d = isOwn ? r.a[sel] : meanDist(pts, sel, c);
				const name = isOwn ? 'a' : isNb ? 'b' : L('avg');
				tag(ctx, t, `${name} = ${d.toFixed(2)}`, m.x(ctr[0]), m.y(ctr[1]) - 22, clusterColor(t, c), isOwn || isNb);
			}
		}

		if (sel >= 0) {
			const p = pts[sel];
			dot(ctx, m.x(p[0]), m.y(p[1]), 7.5, t.bg, t.text, 2.5);
			dot(ctx, m.x(p[0]), m.y(p[1]), 4, clusterColor(t, lab[sel]));
		}
		if (hover >= 0 && hover !== sel) dot(ctx, m.x(pts[hover][0]), m.y(pts[hover][1]), 7, 'transparent', alpha(t.text, 0.5), 1.5);
		if (s.ui.select && sel < 0 && hover < 0) label(ctx, t, L('clickPoint'), w - 12, h - 14, { align: 'right', color: t.text3, size: 11 });
		if (s.mode === 'truth') label(ctx, t, L('trueGroups'), 14, h - 16, { color: t.text2, size: 11, weight: 600 });
	}

	function meanDist(pts: Pt[], i: number, c: number) {
		let sum = 0;
		let n = 0;
		pts.forEach((q, j) => {
			if (j === i || lab[j] !== c) return;
			sum += Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]);
			n++;
		});
		return n ? sum / n : NaN;
	}

	/* ---- silhouette plot ---- */
	/** Point index for each bar row, top to bottom (null rows are gaps between clusters). */
	let rows: (number | null)[] = [];
	let plotMap: { y0: number; rowH: number } | null = null;

	function drawPlot(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const box = { x: 30, y: 18, w: w - 44, h: h - 40 };
		rows = [];
		for (let c = 0; c < K; c++) {
			const idx = lab.map((l, i) => (l === c ? i : -1)).filter((i) => i >= 0);
			idx.sort((a, b) => r.s[b] - r.s[a]);
			if (c) rows.push(null, null, null);
			rows.push(...idx);
		}
		const lo = Math.min(-0.2, Math.min(...r.s) - 0.05);
		const m = mapper(box, [lo, 1], [0, 1]);
		const rowH = box.h / rows.length;
		plotMap = { y0: box.y, rowH };
		// axis
		ctx.strokeStyle = t.grid;
		ctx.lineWidth = 1;
		for (const v of [-0.5, 0, 0.5, 1]) {
			if (v < lo) continue;
			ctx.beginPath();
			ctx.moveTo(m.x(v), box.y);
			ctx.lineTo(m.x(v), box.y + box.h);
			ctx.stroke();
			label(ctx, t, v.toFixed(1), m.x(v), box.y + box.h + 12, { align: 'center', color: t.text3, size: 10 });
		}
		ctx.strokeStyle = t.axis;
		ctx.beginPath();
		ctx.moveTo(m.x(0), box.y);
		ctx.lineTo(m.x(0), box.y + box.h);
		ctx.stroke();
		// bars
		let start = 0;
		rows.forEach((i, k) => {
			if (i === null) return;
			const y = box.y + k * rowH;
			const c = lab[i];
			const x0 = m.x(0);
			const x1 = m.x(r.s[i]);
			ctx.fillStyle = alpha(clusterColor(t, c), i === s.selected ? 1 : 0.75);
			ctx.fillRect(Math.min(x0, x1), y, Math.max(1, Math.abs(x1 - x0)), Math.max(1, rowH - (rowH > 3 ? 0.6 : 0)));
			if (rows[k - 1] === null || k === 0) start = k;
			if (rows[k + 1] === null || k === rows.length - 1)
				label(ctx, t, String(c + 1), box.x - 12, box.y + ((start + k + 1) / 2) * rowH, { align: 'center', color: clusterColor(t, c), size: 11, weight: 700 });
		});
		// selected point marker
		const k = rows.indexOf(s.selected);
		if (k >= 0) {
			const y = box.y + (k + 0.5) * rowH;
			ctx.fillStyle = t.text;
			ctx.beginPath();
			ctx.moveTo(box.x + box.w + 2, y);
			ctx.lineTo(box.x + box.w + 10, y - 5);
			ctx.lineTo(box.x + box.w + 10, y + 5);
			ctx.fill();
			ctx.strokeStyle = t.text;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(m.x(0), y);
			ctx.lineTo(box.x + box.w, y);
			ctx.setLineDash([2, 3]);
			ctx.stroke();
			ctx.setLineDash([]);
		}
		// mean line
		ctx.strokeStyle = t.accent;
		ctx.lineWidth = 1.8;
		ctx.setLineDash([5, 4]);
		ctx.beginPath();
		ctx.moveTo(m.x(r.mean), box.y - 4);
		ctx.lineTo(m.x(r.mean), box.y + box.h);
		ctx.stroke();
		ctx.setLineDash([]);
		label(ctx, t, L('mean', { v: r.mean.toFixed(2) }), m.x(r.mean), 8, { align: 'center', color: t.accent, size: 10.5, weight: 700 });
		label(ctx, t, 's(i)', box.x, 8, { color: t.text3, size: 10 });
	}

	function pickBar(p: { x: number; y: number }) {
		if (!plotMap || !s.ui.select) return;
		const k = Math.floor((p.y - plotMap.y0) / plotMap.rowH);
		for (const d of [0, -1, 1, -2, 2]) {
			const i = rows[k + d];
			if (i !== null && i !== undefined) return select(s, i);
		}
	}

	/* ---- mean silhouette vs K ---- */
	const curve = $derived(s.show.curve ? curveOf(s.dataset) : null);
	let curveMap: Mapper | null = null;
	function drawCurve(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		if (!curve) return;
		curveMap = metricChart(ctx, w, h, t, {
			xs: curve.map((_, i) => i + 2),
			ys: curve,
			current: s.mode === 'kmeans' ? s.k : undefined,
			best: bestK(s),
			yLabel: L('curveY'),
			digits: 2
		});
	}
	function pickK(p: { x: number }) {
		if (!curveMap || !s.ui.k) return;
		chooseK(Math.max(2, Math.min(8, Math.round(curveMap.invX(p.x)))));
	}
	function chooseK(k: number) {
		setK(s, k);
		s.selected = -1;
	}

	const items = $derived.by(() => {
		const out: { label: string; value: string; highlight?: boolean; color?: string }[] = [
			{ label: s.mode === 'truth' ? L('groups') : 'K', value: String(K) },
			{ label: L('meanSil'), value: r.mean.toFixed(2), highlight: true }
		];
		const i = s.selected;
		if (i >= 0 && (s.show.a || s.show.b || s.show.plot)) {
			out.push({ label: 'a(i)', value: r.a[i].toFixed(2) });
			if (s.show.b || s.show.plot) out.push({ label: 'b(i)', value: r.b[i].toFixed(2) });
			if (s.show.b || s.show.plot) out.push({ label: 's(i)', value: r.s[i].toFixed(2), highlight: r.s[i] < 0 });
		}
		return out;
	});
</script>

<div class="scene">
	<Canvas
		{draw}
		aspect={0.68}
		minHeight={280}
		maxHeight={430}
		label={L('sceneLabel')}
		cursor={hover >= 0 ? 'pointer' : 'default'}
		onpointerdown={s.ui.select ? down : undefined}
		onpointermove={move}
	/>

	<Readouts {items} />

	{#if s.show.plot || s.show.curve}
		<div class="charts">
			{#if s.show.plot}
				<div class="panel">
					<Canvas
						draw={drawPlot}
						aspect={0.62}
						minHeight={170}
						maxHeight={220}
						label={L('plotLabel')}
						onpointerdown={s.ui.select ? pickBar : undefined}
						cursor={s.ui.select ? 'pointer' : 'default'}
					/>
				</div>
			{/if}
			{#if s.show.curve}
				<div class="panel">
					<Canvas
						draw={drawCurve}
						aspect={0.62}
						minHeight={170}
						maxHeight={220}
						label={L('curveLabel')}
						onpointerdown={pickK}
						cursor={s.ui.k ? 'pointer' : 'default'}
					/>
				</div>
			{/if}
		</div>
	{/if}

	{#if s.ui.k || s.ui.dataset || s.ui.mode}
		<div class="controls">
			{#if s.ui.k}
				<Slider label="K (K-Means)" value={s.k} min={2} max={8} oninput={chooseK} />
			{/if}
			{#if s.ui.dataset}
				<Segmented
					label={L('dataset')}
					value={s.dataset}
					options={[
						{ value: 'blobs', label: L('blobs') },
						{ value: 'moons', label: L('moons') }
					] as { value: Dataset; label: string }[]}
					onchange={(d) => {
						setData(s, d);
						setK(s, d === 'moons' ? 2 : 4);
					}}
				/>
			{/if}
			{#if s.ui.mode}
				<Segmented
					label={L('labels')}
					value={s.mode}
					options={[
						{ value: 'kmeans', label: 'K-Means' },
						{ value: 'truth', label: L('trueGroupsOpt') }
					] as { value: 'kmeans' | 'truth'; label: string }[]}
					onchange={(v) => {
						s.mode = v;
						s.override = null;
					}}
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
	.charts {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
		gap: 8px;
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
