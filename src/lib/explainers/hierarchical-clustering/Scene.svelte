<script lang="ts">
	import { onDestroy } from 'svelte';
	import { local } from '#lib/i18n/index.svelte.ts';
	import Canvas from '#lib/viz/Canvas.svelte';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import { alpha, dot, label, squareMapper, type VizTheme } from '#lib/viz/canvas.ts';
	import { clusterColor, grid, groupOutline, hitPoint, hull, type Mapper } from '../_clustering/draw';
	import type { Pt } from '../_clustering/data';
	import type { SceneProps } from '../types';
	import Dendrogram from './Dendrogram.svelte';
	import { extremePair, type Dataset, type Linkage } from './hclust';
	import { finish, groups, k, mergeNext, n, points, setCutK, setData, setLinkage, tree, view, type HcState } from './state';

	let { s = $bindable(), step }: SceneProps<HcState> = $props();

	/* declared apart so values widen to string (fr/ar must not have to match the English literals) */
	const en = {
		scatterLabel: 'Scatter plot: points outlined by the cluster they currently belong to',
		linkage: 'linkage',
		clusters: 'clusters',
		merges: 'merges',
		cutHeight: 'cut height',
		lastHeight: 'last height',
		mergeNext: 'Merge next',
		pause: '❚❚ Pause',
		play: '▶ Play',
		reset: '↺ Reset',
		linkageLabel: 'Linkage',
		kCut: 'K (cut)',
		dataset: 'Dataset',
		single: 'Single',
		complete: 'Complete',
		average: 'Average',
		blobs: 'Blobs',
		chain: 'Bridge + outlier'
	};
	const L = local({
		en,
		fr: {
			scatterLabel: 'Nuage de points : chaque point est entouré selon le cluster auquel il appartient actuellement',
			linkage: 'liaison',
			clusters: 'clusters',
			merges: 'fusions',
			cutHeight: 'hauteur de coupe',
			lastHeight: 'dernière hauteur',
			mergeNext: 'Fusion suivante',
			pause: '❚❚ Pause',
			play: '▶ Lecture',
			reset: '↺ Réinitialiser',
			linkageLabel: 'Liaison',
			kCut: 'K (coupe)',
			dataset: 'Jeu de données',
			single: 'Simple',
			complete: 'Complète',
			average: 'Moyenne',
			blobs: 'Amas',
			chain: 'Pont + point aberrant'
		},
		ar: {
			scatterLabel: 'مخطط انتشار: النقاط محاطة بحسب العنقود الذي تنتمي إليه حاليًا',
			linkage: 'الربط',
			clusters: 'العناقيد',
			merges: 'عمليات الدمج',
			cutHeight: 'ارتفاع القطع',
			lastHeight: 'آخر ارتفاع',
			mergeNext: 'الدمج التالي',
			pause: '❚❚ إيقاف مؤقت',
			play: '▶ تشغيل',
			reset: '↺ إعادة تعيين',
			linkageLabel: 'الربط',
			kCut: 'K (القطع)',
			dataset: 'مجموعة البيانات',
			single: 'أحادي',
			complete: 'كامل',
			average: 'متوسط',
			blobs: 'كتل',
			chain: 'جسر + قيمة شاذة'
		}
	});
	/** Wrap in an LTR isolate (U+2066 … U+2069) so "done / total" keeps its order on RTL pages. */
	const ltr = (v: string) => String.fromCharCode(0x2066) + v + String.fromCharCode(0x2069);
	const linkName = (l: Linkage) => (l === 'ward' ? 'Ward' : L(l));

	const DOMAIN: [number, number] = [-1.05, 1.05];
	const PAD = 10;

	/* ---- merge autoplay ---- */
	let playing = $state(false);
	let timer: ReturnType<typeof setInterval> | undefined;
	function play() {
		if (playing) return stop();
		if (s.merged >= n(s) - 1 || s.cut) {
			s.cut = false;
			s.merged = 0;
		}
		playing = true;
		timer = setInterval(() => {
			if (!mergeNext(s)) stop();
		}, 260);
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

	let hover = $state(-1);
	let map: Mapper | null = null;

	const v = $derived(view(s));
	const merges = $derived(tree(s));
	const N = $derived(n(s));
	const kNow = $derived(k(s));
	const latest = $derived(s.show.pair && !s.cut && s.merged > 0 ? s.merged - 1 : -1);

	const centroid = (pts: Pt[], idx: number[]): Pt => [
		idx.reduce((a, i) => a + pts[i][0], 0) / idx.length,
		idx.reduce((a, i) => a + pts[i][1], 0) / idx.length
	];

	function draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const m = squareMapper({ x: PAD, y: PAD, w: w - PAD * 2, h: h - PAD * 2 }, DOMAIN);
		map = m;
		const pts = points(s);
		const mem = groups(s);
		grid(ctx, m, w, h, t);

		// current clusters as soft outlines
		if (s.show.hulls)
			for (const id of v.current) {
				const idx = mem[id];
				// the latest merge is drawn as its two halves below
				if (idx.length < 2 || (latest >= 0 && id === N + latest)) continue;
				groupOutline(ctx, m, idx.map((i) => pts[i]), clusterColor(t, v.pointColor[idx[0]]), 10, 0.12);
			}

		// the latest merge and the linkage distance it used
		if (latest >= 0) {
			const mg = merges[latest];
			const A = mem[mg.a];
			const B = mem[mg.b];
			for (const half of [A, B]) groupOutline(ctx, m, half.map((i) => pts[i]), t.accent, 10, 0.08);
			for (const half of [A, B]) outlineStroke(ctx, m, half.map((i) => pts[i]), t.accent);
			let p: Pt;
			let q: Pt;
			if (s.linkage === 'single' || s.linkage === 'complete') {
				const [i, j] = extremePair(pts, A, B, s.linkage === 'complete');
				p = pts[i];
				q = pts[j];
			} else {
				p = centroid(pts, A);
				q = centroid(pts, B);
			}
			ctx.strokeStyle = t.accent;
			ctx.lineWidth = 2;
			if (s.linkage === 'average' || s.linkage === 'ward') ctx.setLineDash([5, 4]);
			ctx.beginPath();
			ctx.moveTo(m.x(p[0]), m.y(p[1]));
			ctx.lineTo(m.x(q[0]), m.y(q[1]));
			ctx.stroke();
			ctx.setLineDash([]);
			if (s.linkage === 'average' || s.linkage === 'ward') {
				dot(ctx, m.x(p[0]), m.y(p[1]), 4, t.accent, t.bg, 1.5);
				dot(ctx, m.x(q[0]), m.y(q[1]), 4, t.accent, t.bg, 1.5);
			}
			const mx = (m.x(p[0]) + m.x(q[0])) / 2;
			const my = (m.y(p[1]) + m.y(q[1])) / 2;
			const txt = `h = ${mg.height.toFixed(2)}`;
			ctx.font = `600 11px ${t.sans}`;
			const tw = ctx.measureText(txt).width;
			ctx.fillStyle = alpha(t.bg, 0.85);
			ctx.fillRect(mx + 6, my - 18, tw + 8, 16);
			label(ctx, t, txt, mx + 10, my - 10, { color: t.accent, weight: 600 });
		}

		// points
		pts.forEach((p, i) => {
			const c = v.pointColor[i];
			dot(ctx, m.x(p[0]), m.y(p[1]), i === hover ? 6.5 : 4.5, c >= 0 ? clusterColor(t, c) : alpha(t.text3, 0.75), t.bg, 1.5);
		});
		if (hover >= 0 && pts[hover]) dot(ctx, m.x(pts[hover][0]), m.y(pts[hover][1]), 9, 'transparent', t.text, 1.5);
	}

	/** Thin accent ring around a group (or a circle around a single point). */
	function outlineStroke(ctx: CanvasRenderingContext2D, m: Mapper, pts: Pt[], color: string) {
		ctx.strokeStyle = color;
		ctx.lineWidth = 1.5;
		ctx.setLineDash([4, 3]);
		ctx.beginPath();
		if (pts.length === 1) ctx.arc(m.x(pts[0][0]), m.y(pts[0][1]), 11, 0, Math.PI * 2);
		else {
			// offset the hull outward by ~11px around its centre
			const h = hull(pts);
			const cx = h.reduce((a, p) => a + m.x(p[0]), 0) / h.length;
			const cy = h.reduce((a, p) => a + m.y(p[1]), 0) / h.length;
			h.forEach((p, i) => {
				const x = m.x(p[0]);
				const y = m.y(p[1]);
				const d = Math.hypot(x - cx, y - cy) || 1;
				const ox = x + ((x - cx) / d) * 11;
				const oy = y + ((y - cy) / d) * 11;
				if (i) ctx.lineTo(ox, oy);
				else ctx.moveTo(ox, oy);
			});
			ctx.closePath();
		}
		ctx.stroke();
		ctx.setLineDash([]);
	}

	function move(p: { x: number; y: number }) {
		hover = map ? hitPoint(points(s), map, p, 14) : -1;
	}

	function oncut(h: number) {
		stop();
		finish(s);
		s.cut = true;
		s.cutH = h;
		s.did.cutDrag = true;
	}

	const linkOpts: { value: Linkage; label: string }[] = $derived(
		(['single', 'complete', 'average', 'ward'] as Linkage[]).map((value) => ({ value, label: linkName(value) }))
	);
</script>

<div class="scene">
	<Canvas
		{draw}
		aspect={0.62}
		minHeight={260}
		maxHeight={380}
		label={L('scatterLabel')}
		onpointermove={move}
	/>

	<div class="panel">
		<Dendrogram
			{merges}
			n={N}
			merged={s.merged}
			nodeColor={v.nodeColor}
			cutH={s.cut ? s.cutH : null}
			k={kNow}
			highlight={latest}
			{hover}
			oncut={s.ui.cut ? oncut : undefined}
			onhover={(l) => (hover = l)}
		/>
	</div>

	<Readouts
		items={[
			{ label: L('linkage'), value: linkName(s.linkage) },
			{ label: L('clusters'), value: String(kNow), highlight: true },
			{ label: L('merges'), value: ltr(`${s.merged} / ${N - 1}`) },
			s.cut
				? { label: L('cutHeight'), value: s.cutH.toFixed(2) }
				: { label: L('lastHeight'), value: s.merged ? merges[s.merged - 1].height.toFixed(2) : '—' }
		]}
	/>

	{#if Object.values(s.ui).some(Boolean)}
		<div class="controls">
			{#if s.ui.merge}
				<div class="buttons">
					<button class="btn btn-sm" onclick={() => (stop(), mergeNext(s))} disabled={s.merged >= N - 1}>{L('mergeNext')}</button>
					<button class="btn btn-sm btn-primary" onclick={play}>{playing ? L('pause') : L('play')}</button>
					<button class="btn btn-sm" onclick={() => (stop(), (s.cut = false), (s.merged = 0))}>{L('reset')}</button>
				</div>
			{/if}
			{#if s.ui.linkage}
				<Segmented label={L('linkageLabel')} value={s.linkage} options={linkOpts} onchange={(l) => setLinkage(s, l)} />
			{/if}
			{#if s.ui.cut}
				<Slider label={L('kCut')} value={kNow} min={1} max={Math.max(8, kNow)} oninput={(kk) => setCutK(s, kk)} />
			{/if}
			{#if s.ui.dataset}
				<Segmented
					label={L('dataset')}
					value={s.dataset}
					options={[
						{ value: 'blobs', label: L('blobs') },
						{ value: 'chain', label: L('chain') }
					] as { value: Dataset; label: string }[]}
					onchange={(d) => setData(s, d)}
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
		padding-block-start: 12px;
		border-block-start: 1px solid var(--border);
	}
	.buttons {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}
</style>
