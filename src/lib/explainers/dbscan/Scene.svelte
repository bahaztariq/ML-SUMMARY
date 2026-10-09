<script lang="ts">
	import { onDestroy } from 'svelte';
	import Canvas from '#lib/viz/Canvas.svelte';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import { alpha, clamp, dot, fmt, label, mapper, squareMapper, ticks, type VizTheme } from '#lib/viz/canvas.ts';
	import { clusterColor, cross, drawKMeansView, grid, hitPoint, type Mapper } from '../_clustering/draw';
	import type { SceneProps } from '../types';
	import type { Dataset } from './dbscan';
	import { local } from '#lib/i18n/index.svelte.ts';
	import { growDone, growNext, growStep, kdist, kmeansFor, naturalK, points, result, select, setData, type DbscanState } from './state';

	let { s = $bindable(), step }: SceneProps<DbscanState> = $props();

	// `en` is declared on its own so its values widen to `string` (inline, local() infers literal types)
	const en = {
		core: 'core',
		border: 'border',
		noise: 'noise',
		clickPoint: 'click a point',
		kth: 'distance to {k}th nearest neighbour',
		sorted: 'points, sorted →',
		method: 'method',
		clusters: 'clusters',
		inCircle: 'in circle',
		scatterLabel: 'Scatter plot of points with DBSCAN core, border and noise labels',
		kdistLabel: 'k-distance plot: sorted distance of every point to its nearest neighbours, with the ε line',
		expand: 'Expand',
		pause: 'Pause',
		play: 'Play',
		reset: 'Reset',
		radius: 'ε (radius)',
		dataset: 'Dataset',
		moons: 'Moons',
		rings: 'Rings',
		blobs: 'Blobs + noise',
		uneven: 'Uneven',
		methodTitle: 'Method'
	};
	const L = local({
		en,
		fr: {
			core: 'cœur',
			border: 'frontière',
			noise: 'bruit',
			clickPoint: 'cliquez sur un point',
			kth: 'distance au {k}e plus proche voisin',
			sorted: 'points, triés →',
			method: 'méthode',
			clusters: 'clusters',
			inCircle: 'dans le cercle',
			scatterLabel: 'Nuage de points avec les étiquettes DBSCAN cœur, frontière et bruit',
			kdistLabel: 'Graphique des k-distances : distance triée de chaque point à ses plus proches voisins, avec la ligne ε',
			expand: 'Étendre',
			pause: 'Pause',
			play: 'Lecture',
			reset: 'Réinitialiser',
			radius: 'ε (rayon)',
			dataset: 'Jeu de données',
			moons: 'Lunes',
			rings: 'Anneaux',
			blobs: 'Amas + bruit',
			uneven: 'Inégal',
			methodTitle: 'Méthode'
		},
		ar: {
			core: 'مركزية',
			border: 'حدّية',
			noise: 'ضوضاء',
			clickPoint: 'انقر على نقطة',
			kth: 'المسافة إلى أقرب جار رقم {k}',
			sorted: 'النقاط مرتّبة →',
			method: 'الطريقة',
			clusters: 'العناقيد',
			inCircle: 'داخل الدائرة',
			scatterLabel: 'مخطط انتشار للنقاط مع وسوم DBSCAN: مركزية وحدّية وضوضاء',
			kdistLabel: 'مخطط مسافة k: المسافة المرتّبة لكل نقطة إلى أقرب جيرانها، مع خط ε',
			expand: 'توسيع',
			pause: 'إيقاف مؤقت',
			play: 'تشغيل',
			reset: 'إعادة',
			radius: 'ε (نصف القطر)',
			dataset: 'البيانات',
			moons: 'أهلّة',
			rings: 'حلقات',
			blobs: 'كتل + ضوضاء',
			uneven: 'غير متساوية',
			methodTitle: 'الطريقة'
		}
	});

	const DOMAIN: [number, number] = [-1.15, 1.15];
	const PAD = 10;

	/* ---- growth autoplay ---- */
	let playing = $state(false);
	let timer: ReturnType<typeof setInterval> | undefined;
	function play() {
		if (playing) return stop();
		if (growDone(s)) s.grow = 0;
		playing = true;
		timer = setInterval(() => {
			if (!growStep(s, 3)) stop();
		}, 40);
	}
	function stop() {
		playing = false;
		clearInterval(timer);
	}
	$effect(() => {
		step;
		return stop;
	});
	onDestroy(stop);

	/* ---- picking points ---- */
	let map: Mapper | null = null;
	let hover = $state(-1);
	function down(p: { x: number; y: number }) {
		if (!map || !s.ui.select || s.view !== 'dbscan') return;
		const i = hitPoint(points(s), map, p, 16);
		if (i >= 0) select(s, i);
	}
	function move(p: { x: number; y: number }) {
		if (!map || !s.ui.select || s.view !== 'dbscan') return void (hover = -1);
		hover = hitPoint(points(s), map, p, 16);
	}

	/* ---- drawing ---- */
	function draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const m = squareMapper({ x: PAD, y: PAD, w: w - PAD * 2, h: h - PAD * 2 }, DOMAIN);
		map = m;
		const pts = points(s);
		grid(ctx, m, w, h, t);

		if (s.view === 'kmeans') {
			drawKMeansView(ctx, m, w, h, t, pts, kmeansFor(s.dataset, naturalK(s.dataset)));
			return;
		}

		const r = result(s);
		const rpx = m.x(s.eps) - m.x(0);
		const growing = s.show.growth;
		const rank = new Array(pts.length).fill(Infinity);
		r.order.forEach((e, k) => (rank[e.i] = k));
		const visible = (i: number) => !growing || rank[i] < s.grow;
		const finished = !growing || growDone(s);

		// density-reachability links
		if (growing) {
			ctx.lineWidth = 1.2;
			for (let k = 0; k < s.grow; k++) {
				const e = r.order[k];
				if (e.from < 0) continue;
				const a = pts[e.from];
				const b = pts[e.i];
				ctx.strokeStyle = alpha(clusterColor(t, e.c), 0.4);
				ctx.beginPath();
				ctx.moveTo(m.x(a[0]), m.y(a[1]));
				ctx.lineTo(m.x(b[0]), m.y(b[1]));
				ctx.stroke();
			}
			// circle of the core point currently being expanded
			const last = r.order[s.grow - 1];
			if (last && !growDone(s)) {
				const c = pts[last.from >= 0 ? last.from : last.i];
				ctx.beginPath();
				ctx.arc(m.x(c[0]), m.y(c[1]), rpx, 0, Math.PI * 2);
				ctx.fillStyle = alpha(clusterColor(t, last.c), 0.1);
				ctx.fill();
				ctx.strokeStyle = clusterColor(t, last.c);
				ctx.lineWidth = 1.5;
				ctx.stroke();
			}
		}

		// ε-neighbourhood of the selected point
		const sel = s.selected;
		if (s.show.circle && sel >= 0 && sel < pts.length) {
			const c = pts[sel];
			ctx.beginPath();
			ctx.arc(m.x(c[0]), m.y(c[1]), rpx, 0, Math.PI * 2);
			ctx.fillStyle = alpha(t.accent, 0.08);
			ctx.fill();
			ctx.strokeStyle = alpha(t.accent, 0.8);
			ctx.lineWidth = 1.5;
			ctx.setLineDash([4, 3]);
			ctx.stroke();
			ctx.setLineDash([]);
			ctx.strokeStyle = alpha(t.accent, 0.45);
			ctx.lineWidth = 1;
			for (const j of r.nbrs[sel]) {
				if (j === sel) continue;
				ctx.beginPath();
				ctx.moveTo(m.x(c[0]), m.y(c[1]));
				ctx.lineTo(m.x(pts[j][0]), m.y(pts[j][1]));
				ctx.stroke();
			}
			// radius marker
			ctx.strokeStyle = t.accent;
			ctx.lineWidth = 1.5;
			ctx.beginPath();
			ctx.moveTo(m.x(c[0]), m.y(c[1]));
			ctx.lineTo(m.x(c[0]) + rpx, m.y(c[1]));
			ctx.stroke();
			label(ctx, t, 'ε', m.x(c[0]) + rpx / 2, m.y(c[1]) - 8, { align: 'center', color: t.accent, size: 12, weight: 700 });
		}

		// points
		const kindColors = { core: t.series[0], border: t.series[2] };
		pts.forEach((p, i) => {
			const x = m.x(p[0]);
			const y = m.y(p[1]);
			const kind = r.kind[i];
			const hidden = s.show.mystery && i === sel;
			const mode = hidden ? 'none' : s.show.clusters ? 'clusters' : s.show.kinds ? 'kinds' : 'none';
			if (mode === 'none' || !visible(i)) {
				if (mode !== 'none' && kind === 'noise' && finished) return cross(ctx, x, y, 3, t.text3);
				return dot(ctx, x, y, 3.2, alpha(t.text3, 0.55));
			}
			if (kind === 'noise') return cross(ctx, x, y, 3, t.text3);
			const col = mode === 'clusters' ? clusterColor(t, r.labels[i]) : kindColors[kind];
			if (kind === 'core') dot(ctx, x, y, 4, alpha(col, 0.9));
			else dot(ctx, x, y, 3.4, t.bg, col, 2);
		});

		// selected / hovered point
		if (sel >= 0 && sel < pts.length && (s.show.circle || s.show.mystery)) {
			const c = pts[sel];
			dot(ctx, m.x(c[0]), m.y(c[1]), 7, 'transparent', t.text, 2);
			if (s.show.mystery) label(ctx, t, '?', m.x(c[0]) + 10, m.y(c[1]) - 10, { color: t.text, size: 15, weight: 700 });
		}
		if (hover >= 0 && hover !== sel) {
			const c = pts[hover];
			dot(ctx, m.x(c[0]), m.y(c[1]), 6.5, 'transparent', alpha(t.text, 0.5), 1.5);
		}

		// legend
		if (s.show.kinds || s.show.clusters) {
			const y = h - 16;
			const col = s.show.clusters ? t.text2 : kindColors.core;
			const bcol = s.show.clusters ? t.text2 : kindColors.border;
			// lay the items out from measured label widths so longer translations don't overlap
			ctx.font = `500 11px ${t.sans}`;
			const gap = 16;
			let x = 18;
			const item = (text: string, mark: (x: number) => void) => {
				mark(x);
				label(ctx, t, text, x + 9, y, { size: 11 });
				x += 9 + ctx.measureText(text).width + gap;
			};
			item(L('core'), (x) => dot(ctx, x, y, 4, col));
			item(L('border'), (x) => dot(ctx, x, y, 3.4, t.bg, bcol, 2));
			item(L('noise'), (x) => cross(ctx, x, y, 3, t.text3));
		}
		if (s.ui.select && sel < 0 && hover < 0) {
			label(ctx, t, L('clickPoint'), w - 12, h - 14, { align: 'right', color: t.text3, size: 11 });
		}
	}

	/* ---- k-distance chart ---- */
	const kd = $derived(s.show.kdist ? kdist(s.dataset, s.minPts) : null);
	let kdMap: ReturnType<typeof mapper> | null = null;
	const EPS_MIN = 0.03;
	const EPS_MAX = 0.4;

	function drawKdist(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		if (!kd) return;
		const box = { x: 44, y: 14, w: w - 58, h: h - 38 };
		const ymax = Math.max(EPS_MAX, kd[Math.floor(kd.length * 0.98)] * 1.1);
		const m = mapper(box, [0, kd.length - 1], [0, ymax]);
		kdMap = m;
		ctx.strokeStyle = t.grid;
		ctx.lineWidth = 1;
		for (const v of ticks(0, ymax, 4)) {
			ctx.beginPath();
			ctx.moveTo(box.x, m.y(v));
			ctx.lineTo(box.x + box.w, m.y(v));
			ctx.stroke();
			label(ctx, t, fmt(v, 2), box.x - 6, m.y(v), { align: 'right', color: t.text3, size: 10 });
		}
		kd.forEach((v, i) => {
			const core = v <= s.eps;
			dot(ctx, m.x(i), m.y(Math.min(v, ymax)), 1.8, core ? t.series[0] : t.text3);
		});
		const y = m.y(s.eps);
		ctx.strokeStyle = t.accent;
		ctx.lineWidth = 1.5;
		ctx.setLineDash([5, 4]);
		ctx.beginPath();
		ctx.moveTo(box.x, y);
		ctx.lineTo(box.x + box.w, y);
		ctx.stroke();
		ctx.setLineDash([]);
		label(ctx, t, `ε = ${s.eps.toFixed(2)}`, box.x + 6, y - 9, { color: t.accent, size: 11, weight: 700 });
		label(ctx, t, L('kth', { k: s.minPts - 1 }), box.x, 4, { color: t.text3, size: 10, base: 'top' });
		label(ctx, t, L('sorted'), box.x + box.w, box.y + box.h + 12, { align: 'right', color: t.text3, size: 10 });
	}

	let draggingEps = false;
	function setEpsFromChart(p: { y: number }) {
		if (!kdMap) return;
		s.eps = Math.round(clamp(kdMap.invY(p.y), EPS_MIN, EPS_MAX) * 100) / 100;
	}

	const r = $derived(result(s));
	const items = $derived(
		s.view === 'kmeans'
			? [
					{ label: L('method'), value: 'K-Means' },
					{ label: 'K', value: String(naturalK(s.dataset)) }
				]
			: [
					{ label: 'ε', value: s.eps.toFixed(2) },
					{ label: 'minPts', value: String(s.minPts) },
					...(s.show.clusters
						? [{ label: L('clusters'), value: String(s.show.growth && !growDone(s) ? '…' : r.nClusters), highlight: true }]
						: []),
					...(s.show.kinds || s.show.clusters
						? [
								{ label: L('core'), value: String(r.counts.core) },
								{ label: L('border'), value: String(r.counts.border) },
								{ label: L('noise'), value: String(r.counts.noise) }
							]
						: s.selected >= 0
							? [{ label: L('inCircle'), value: String(r.nbrs[s.selected]?.length ?? 0) }]
							: [])
				]
	);
</script>

<div class="scene">
	<Canvas
		{draw}
		aspect={0.72}
		minHeight={280}
		maxHeight={460}
		label={L('scatterLabel')}
		cursor={hover >= 0 ? 'pointer' : 'default'}
		onpointerdown={s.ui.select ? down : undefined}
		onpointermove={move}
	/>

	<Readouts {items} />

	{#if s.show.kdist}
		<div class="panel">
			<Canvas
				draw={drawKdist}
				aspect={0.3}
				minHeight={140}
				maxHeight={180}
				label={L('kdistLabel')}
				cursor="ns-resize"
				onpointerdown={(p) => ((draggingEps = true), setEpsFromChart(p))}
				onpointermove={(p) => draggingEps && setEpsFromChart(p)}
				onpointerup={() => (draggingEps = false)}
			/>
		</div>
	{/if}

	{#if s.ui.grow || s.ui.eps || s.ui.minPts || s.ui.dataset || s.ui.view}
		<div class="controls">
			{#if s.ui.grow}
				<div class="buttons">
					<button class="btn btn-sm" onclick={() => (stop(), growNext(s))} disabled={growDone(s)}>{L('expand')}</button>
					<button class="btn btn-sm btn-primary" onclick={play}>{playing ? `❚❚ ${L('pause')}` : `▶ ${L('play')}`}</button>
					<button class="btn btn-sm" onclick={() => (stop(), (s.grow = 0))}>↺ {L('reset')}</button>
				</div>
			{/if}
			{#if s.ui.eps}
				<Slider label={L('radius')} bind:value={s.eps} min={EPS_MIN} max={EPS_MAX} step={0.01} format={(v) => v.toFixed(2)} />
			{/if}
			{#if s.ui.minPts}
				<Slider label="minPts" bind:value={s.minPts} min={2} max={12} />
			{/if}
			{#if s.ui.dataset}
				<Segmented
					label={L('dataset')}
					bind:value={s.dataset}
					options={[
						{ value: 'moons', label: L('moons') },
						{ value: 'rings', label: L('rings') },
						{ value: 'blobs', label: L('blobs') },
						{ value: 'density', label: L('uneven') }
					] as { value: Dataset; label: string }[]}
					onchange={(d) => setData(s, d)}
				/>
			{/if}
			{#if s.ui.view}
				<Segmented
					label={L('methodTitle')}
					bind:value={s.view}
					options={[
						{ value: 'dbscan', label: 'DBSCAN' },
						{ value: 'kmeans', label: 'K-Means' }
					] as { value: 'dbscan' | 'kmeans'; label: string }[]}
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
	.buttons {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}
</style>
