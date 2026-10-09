<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import Canvas from '#lib/viz/Canvas.svelte';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import { alpha, dot, fmt, label, squareMapper, type VizTheme } from '#lib/viz/canvas.ts';
	import type { SceneProps } from '../types.ts';
	import { grid2d, tag } from '../_dimred/draw.ts';
	import { drawAxes, drawCloud, projector, rotator, type P3 } from '../_dimred/view3d.ts';
	import * as T from './tsne.ts';
	import { local } from '#lib/i18n/index.svelte.ts';
	import {
		N,
		affinities,
		data,
		dist,
		effectiveNeighbours,
		graph,
		inputRatio,
		mapRatio,
		maxIter,
		members,
		neighbourRow,
		pcaMap,
		pcaShare,
		reseed,
		run,
		runKey,
		setMethod,
		setNeighbors,
		setPerplexity,
		type Method,
		type TSState
	} from './state.ts';

	let { s = $bindable(), step }: SceneProps<TSState> = $props();

	const en = {
		input: 'Input: 3 features',
		dragRotate: 'drag to rotate',
		clickPoint: 'click a point',
		pcaTitle: 'PCA: best flat shadow (PC1, PC2)',
		stacked: 'indigo + green, stacked',
		mapRandom: '{name} map: random start',
		mapIter: '{name} map · iteration {n}',
		mapEpoch: '{name} map · epoch {n}',
		exag: 'early exaggeration: clumping',
		perplexity: 'perplexity',
		sigma: 'σ of this point',
		held90: 'neighbours holding 90%',
		pcaVar: 'variance kept by PCA',
		iteration: 'iteration',
		epoch: 'epoch',
		kept: '10 nearest neighbours kept',
		widthRatio: 'amber ÷ pink width',
		widthVal: 'input {a}× · map {b}×',
		points: 'points',
		features: 'features',
		clusters: 'clusters',
		run: 'Run',
		replay: 'Replay',
		newStart: 'New random start',
		method: 'Method',
		perplexitySlider: 'Perplexity',
		cloudAria: 'Rotatable 3-D scatter of five coloured clusters',
		pcaAria: 'PCA projection of the clusters onto two dimensions',
		embedAria: 'Two-dimensional embedding being optimised'
	};
	const L = local({
		en,
		fr: {
			input: 'Entrée : 3 variables',
			dragRotate: 'faites glisser pour tourner',
			clickPoint: 'cliquez sur un point',
			pcaTitle: 'ACP : meilleure ombre plane (PC1, PC2)',
			stacked: 'indigo + vert, superposés',
			mapRandom: 'Carte {name} : départ aléatoire',
			mapIter: 'Carte {name} · itération {n}',
			mapEpoch: 'Carte {name} · époque {n}',
			exag: 'exagération précoce : agglomération',
			perplexity: 'perplexité',
			sigma: 'σ de ce point',
			held90: 'voisins portant 90 %',
			pcaVar: 'variance conservée par l’ACP',
			iteration: 'itération',
			epoch: 'époque',
			kept: '10 plus proches voisins conservés',
			widthRatio: 'largeur ambre ÷ rose',
			widthVal: 'entrée {a}× · carte {b}×',
			points: 'points',
			features: 'variables',
			clusters: 'clusters',
			run: 'Lancer',
			replay: 'Rejouer',
			newStart: 'Nouveau départ aléatoire',
			method: 'Méthode',
			perplexitySlider: 'Perplexité',
			cloudAria: 'Nuage de points 3D orientable de cinq clusters colorés',
			pcaAria: 'Projection ACP des clusters sur deux dimensions',
			embedAria: 'Plongement bidimensionnel en cours d’optimisation'
		},
		ar: {
			input: 'المدخلات: 3 ميزات',
			dragRotate: 'اسحب للتدوير',
			clickPoint: 'انقر على نقطة',
			pcaTitle: 'PCA: أفضل ظل مسطح (PC1، PC2)',
			stacked: 'النيلي + الأخضر، متراكبان',
			mapRandom: 'خريطة {name}: بداية عشوائية',
			mapIter: 'خريطة {name} · التكرار {n}',
			mapEpoch: 'خريطة {name} · الحقبة {n}',
			exag: 'المبالغة المبكرة: تكتّل',
			perplexity: 'الحيرة (perplexity)',
			sigma: 'σ لهذه النقطة',
			held90: 'جيران يحملون 90%',
			pcaVar: 'التباين المحفوظ في PCA',
			iteration: 'التكرار',
			epoch: 'الحقبة (epoch)',
			kept: 'المحفوظ من أقرب 10 جيران',
			widthRatio: 'عرض الكهرماني ÷ الوردي',
			widthVal: 'المدخلات {a}× · الخريطة {b}×',
			points: 'النقاط',
			features: 'الميزات',
			clusters: 'العناقيد',
			run: 'تشغيل',
			replay: 'إعادة',
			newStart: 'بداية عشوائية جديدة',
			method: 'الطريقة',
			perplexitySlider: 'الحيرة (perplexity)',
			cloudAria: 'مخطط انتشار ثلاثي الأبعاد قابل للتدوير لخمسة عناقيد ملونة',
			pcaAria: 'إسقاط PCA للعناقيد على بعدين',
			embedAria: 'تضمين ثنائي الأبعاد قيد التحسين'
		}
	});

	/* ---------------- the optimisation runner ---------------- */
	let runner: T.Run | null = null;
	let curKey = '';
	let lastS: TSState | null = null;
	let frame = $state(0);
	let raf = 0;
	/** Smoothed half-width of the map so the view zooms gently while points spread out. */
	let ext = 1;
	let ctr = [0, 0];

	function fresh() {
		runner = s.method === 'tsne' ? T.initRun(N, s.seed) : T.initUmap(N, s.seed);
		curKey = runKey(s) + `|${s.replay}`;
		ext = 0;
		publish(true);
	}

	function stepOnce() {
		if (!runner) return;
		if (s.method === 'tsne') T.tsneStep(runner, affinities(s.perplexity));
		else T.umapEpoch(runner, graph(s.nNeighbors), s.seed);
	}

	function publish(done = false) {
		if (!runner) return;
		const Y = runner.Y;
		const end = runner.iter >= maxIter(s);
		s.live = {
			iter: runner.iter,
			kl: s.method === 'tsne' ? T.kl(affinities(s.perplexity), Y, N) : NaN,
			ratio: runner.iter > 0 ? mapRatio(Y) : NaN,
			kept: end || done ? (runner.iter > 0 ? T.neighbourKept(dist(), Y, N) : NaN) : NaN
		};
	}

	function loop() {
		cancelAnimationFrame(raf);
		const tick = () => {
			if (!runner) return;
			const t0 = performance.now();
			const target = s.target;
			while (runner.iter < target && performance.now() - t0 < 12) stepOnce();
			publish();
			frame++;
			if (runner.iter < target) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
	}

	$effect(() => {
		const key = runKey(s) + `|${s.replay}`;
		const target = s.target;
		const isNew = s !== lastS;
		lastS = s;
		untrack(() => {
			if (isNew || key !== curKey || !runner || target < runner.iter) fresh();
			frame++;
			loop();
		});
	});
	onDestroy(() => cancelAnimationFrame(raf));

	/* ---------------- 3-D input view ---------------- */
	let proj3: ((p: P3) => { x: number; y: number; depth: number }) | null = null;
	let dragStart: { x: number; y: number } | null = null;
	const rot = rotator(
		() => (s.ui.rotate ? s.view : null),
		() => (s.did.rotate = true)
	);

	const COLORS = (t: VizTheme, k: number) => t.series[k % t.series.length];

	function draw3(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const { X, y } = data();
		const scale = Math.min(w / 15, h / 11);
		const proj = projector(s.view, w / 2, h / 2 + 6, scale);
		proj3 = proj;
		drawAxes(ctx, t, proj, 4.5);

		if (s.show.graph && s.method === 'umap') {
			const G = graph(s.nNeighbors);
			ctx.strokeStyle = alpha(t.text3, 0.22);
			ctx.lineWidth = 0.8;
			ctx.beginPath();
			G.knn.forEach((nb, i) => {
				const a = proj(X[i] as P3);
				for (const j of nb) {
					const b = proj(X[j] as P3);
					ctx.moveTo(a.x, a.y);
					ctx.lineTo(b.x, b.y);
				}
			});
			ctx.stroke();
		}

		const neigh = s.show.neigh && s.sel >= 0;
		let rel: (i: number) => number = () => 1;
		if (neigh) {
			const { p } = neighbourRow(s.sel, s.perplexity);
			let pmax = 0;
			for (const v of p) pmax = Math.max(pmax, v);
			rel = (i) => (i === s.sel ? 1 : p[i] / pmax);
			const a = proj(X[s.sel] as P3);
			ctx.lineWidth = 1.2;
			for (let j = 0; j < N; j++) {
				const r = rel(j);
				if (j === s.sel || r < 0.03) continue;
				ctx.strokeStyle = alpha(t.text, 0.08 + 0.55 * r);
				const b = proj(X[j] as P3);
				ctx.beginPath();
				ctx.moveTo(a.x, a.y);
				ctx.lineTo(b.x, b.y);
				ctx.stroke();
			}
		}

		drawCloud(ctx, proj, X, (i) => (neigh ? alpha(COLORS(t, y[i]), 0.2 + 0.8 * Math.sqrt(rel(i))) : COLORS(t, y[i])), 3.2);

		if (neigh) {
			const a = proj(X[s.sel] as P3);
			dot(ctx, a.x, a.y, 7, 'transparent', t.text, 2.5);
		}
		if (s.show.sizes) {
			for (const k of [T.WIDE, T.TIGHT]) {
				const idx = members(k);
				const c = [0, 1, 2].map((d) => idx.reduce((acc, i) => acc + X[i][d], 0) / idx.length);
				const r = 1.4 * T.spread(X.flat(), 3, idx) * scale;
				const p = proj(c as P3);
				ctx.setLineDash([4, 3]);
				dot(ctx, p.x, p.y, r, 'transparent', COLORS(t, k), 1.8);
				ctx.setLineDash([]);
			}
		}
		label(ctx, t, L('input'), 10, 14, { color: t.text2, size: 12, weight: 600 });
		if (s.ui.rotate && !s.did.rotate) label(ctx, t, L('dragRotate'), w - 10, h - 12, { align: 'right', color: t.text3 });
		else if (s.ui.pick && !s.did.pick) label(ctx, t, L('clickPoint'), w - 10, h - 12, { align: 'right', color: t.text3 });
	}

	function down3(p: { x: number; y: number }) {
		dragStart = p;
		if (s.ui.rotate) rot.down(p);
	}
	function move3(p: { x: number; y: number }) {
		rot.move(p);
	}
	function up3(p: { x: number; y: number }) {
		rot.up();
		const start = dragStart;
		dragStart = null;
		if (!start || !s.ui.pick || !proj3) return;
		if (Math.hypot(p.x - start.x, p.y - start.y) > 4) return;
		const { X } = data();
		let best = -1;
		let bd = 20 * 20;
		X.forEach((x, i) => {
			const q = proj3!(x as P3);
			const d = (q.x - p.x) ** 2 + (q.y - p.y) ** 2;
			if (d < bd) {
				bd = d;
				best = i;
			}
		});
		if (best >= 0) {
			s.sel = best;
			s.did.pick++;
		}
	}

	/* ---------------- 2-D panels ---------------- */
	function scatter2(
		ctx: CanvasRenderingContext2D,
		w: number,
		h: number,
		t: VizTheme,
		Y: ArrayLike<number>,
		half: number,
		center: number[],
		title: string
	) {
		const m = squareMapper({ x: 12, y: 24, w: w - 24, h: h - 36 }, [-half, half]);
		const mx = (v: number) => m.x(v - center[0]);
		const my = (v: number) => m.y(v - center[1]);
		grid2d(ctx, t, { x: mx, y: my, invX: (p) => m.invX(p) + center[0], invY: (p) => m.invY(p) + center[1] }, w, h, { n: 6 });
		const { y } = data();
		const neigh = s.show.neigh && s.sel >= 0 && s.right === 'embed';
		const p = neigh ? neighbourRow(s.sel, s.perplexity).p : null;
		let pmax = 0;
		if (p) for (const v of p) pmax = Math.max(pmax, v);
		for (let i = 0; i < N; i++) {
			const a = p ? 0.2 + 0.8 * Math.sqrt(i === s.sel ? 1 : p[i] / pmax) : 0.85;
			dot(ctx, mx(Y[2 * i]), my(Y[2 * i + 1]), 2.8, alpha(COLORS(t, y[i]), a));
		}
		if (neigh) dot(ctx, mx(Y[2 * s.sel]), my(Y[2 * s.sel + 1]), 7, 'transparent', t.text, 2.5);
		if (s.show.sizes) {
			for (const k of [T.WIDE, T.TIGHT]) {
				const idx = members(k);
				const c = [0, 1].map((d) => idx.reduce((acc, i) => acc + Y[2 * i + d], 0) / idx.length);
				const r = 1.4 * T.spread(Y, 2, idx) * ((m.x(1) - m.x(0)) || 1);
				ctx.setLineDash([4, 3]);
				dot(ctx, mx(c[0]), my(c[1]), r, 'transparent', COLORS(t, k), 1.8);
				ctx.setLineDash([]);
			}
		}
		label(ctx, t, title, 10, 14, { color: t.text2, size: 12, weight: 600 });
	}

	function drawPca(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		scatter2(ctx, w, h, t, pcaMap(), 5.6, [0, 0], L('pcaTitle'));
		const [a, b] = T.STACKED;
		const idx = [...members(a), ...members(b)];
		const Z = pcaMap();
		const c = [0, 1].map((d) => idx.reduce((acc, i) => acc + Z[2 * i + d], 0) / idx.length);
		const m = squareMapper({ x: 12, y: 24, w: w - 24, h: h - 36 }, [-5.6, 5.6]);
		tag(ctx, t, L('stacked'), m.x(c[0]), m.y(c[1]) + 30, { color: t.text, align: 'center' });
	}

	function drawEmbed(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		frame; // redraw every optimisation frame
		if (!runner) return;
		const Y = runner.Y;
		let lo = [Infinity, Infinity];
		let hi = [-Infinity, -Infinity];
		for (let i = 0; i < N; i++)
			for (let d = 0; d < 2; d++) {
				lo[d] = Math.min(lo[d], Y[2 * i + d]);
				hi[d] = Math.max(hi[d], Y[2 * i + d]);
			}
		const target = Math.max(hi[0] - lo[0], hi[1] - lo[1]) * 0.56 + 1e-9;
		const c = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2];
		if (!ext || runner.iter >= maxIter(s) || runner.iter === 0) {
			ext = target;
			ctr = c;
		} else {
			ext += (target - ext) * 0.3;
			ctr = [ctr[0] + (c[0] - ctr[0]) * 0.3, ctr[1] + (c[1] - ctr[1]) * 0.3];
		}
		const name = s.method === 'tsne' ? 't-SNE' : 'UMAP';
		const it = runner.iter;
		const title = it === 0 ? L('mapRandom', { name }) : L(s.method === 'tsne' ? 'mapIter' : 'mapEpoch', { name, n: it });
		scatter2(ctx, w, h, t, Y, ext, ctr, title);
		if (s.method === 'tsne' && it > 0 && it < T.EXAG_ITERS)
			label(ctx, t, L('exag'), w - 10, h - 12, { align: 'right', color: t.text3 });
	}

	/* ---------------- readouts & controls ---------------- */
	const readouts = $derived.by(() => {
		const items: { label: string; value: string; highlight?: boolean }[] = [];
		if (s.show.neigh && s.sel >= 0) {
			items.push(
				{ label: L('perplexity'), value: String(s.perplexity) },
				{ label: L('sigma'), value: fmt(neighbourRow(s.sel, s.perplexity).sigma) },
				{ label: L('held90'), value: String(effectiveNeighbours(s.sel, s.perplexity)), highlight: true }
			);
		}
		if (s.right === 'pca') items.push({ label: L('pcaVar'), value: `${(pcaShare() * 100).toFixed(0)}%` });
		if (s.right === 'embed') {
			items.push({ label: L(s.method === 'tsne' ? 'iteration' : 'epoch'), value: `${s.live.iter} / ${maxIter(s)}` });
			if (s.method === 'tsne') items.push({ label: 'KL(P‖Q)', value: fmt(s.live.kl, 3), highlight: s.live.iter >= maxIter(s) });
			if (Number.isFinite(s.live.kept)) items.push({ label: L('kept'), value: `${Math.round(s.live.kept * 100)}%` });
		}
		if (s.show.sizes)
			items.push({ label: L('widthRatio'), value: L('widthVal', { a: fmt(inputRatio(), 1), b: fmt(s.live.ratio, 1) }), highlight: true });
		if (!items.length) items.push({ label: L('points'), value: String(N) }, { label: L('features'), value: '3' }, { label: L('clusters'), value: '5' });
		return items;
	});

	const twoUp = $derived(s.right !== 'none');
	const anyControls = $derived(s.ui.run || s.ui.seed || s.ui.method || (s.ui.perplexity && s.method === 'tsne') || (s.ui.neighbors && s.method === 'umap'));

	$effect(() => {
		step;
		untrack(() => {
			dragStart = null;
		});
	});
</script>

<div class="scene">
	<div class="views" class:two={twoUp}>
		<Canvas
			draw={draw3}
			aspect={twoUp ? 0.95 : 0.62}
			minHeight={240}
			maxHeight={440}
			label={L('cloudAria')}
			cursor={s.ui.rotate ? 'grab' : s.ui.pick ? 'pointer' : 'default'}
			onpointerdown={down3}
			onpointermove={move3}
			onpointerup={up3}
		/>
		{#if s.right === 'pca'}
			<Canvas draw={drawPca} aspect={0.95} minHeight={240} maxHeight={440} label={L('pcaAria')} />
		{:else if s.right === 'embed'}
			<Canvas draw={drawEmbed} aspect={0.95} minHeight={240} maxHeight={440} label={L('embedAria')} />
		{/if}
	</div>

	<Readouts items={readouts} />

	{#if anyControls}
		<div class="controls">
			{#if s.ui.run || s.ui.seed}
				<div class="buttons">
					{#if s.ui.run}
						{#if s.target === 0}
							<button class="btn btn-sm btn-primary" onclick={() => run(s)}>▶ {L('run')}</button>
						{:else}
							<button class="btn btn-sm" onclick={() => (s.replay++, run(s))}>↺ {L('replay')}</button>
						{/if}
					{/if}
					{#if s.ui.seed}
						<button class="btn btn-sm" onclick={() => reseed(s)}>{L('newStart')}</button>
					{/if}
				</div>
			{/if}
			{#if s.ui.method}
				<Segmented
					label={L('method')}
					bind:value={s.method}
					options={[
						{ value: 'tsne', label: 't-SNE' },
						{ value: 'umap', label: 'UMAP' }
					] as { value: Method; label: string }[]}
					onchange={(m) => setMethod(s, m)}
				/>
			{/if}
			{#if s.ui.perplexity && s.method === 'tsne'}
				<Slider label={L('perplexitySlider')} bind:value={s.perplexity} min={2} max={80} oninput={(v) => setPerplexity(s, v)} />
			{/if}
			{#if s.ui.neighbors && s.method === 'umap'}
				<Slider label="n_neighbors" bind:value={s.nNeighbors} min={3} max={80} oninput={(v) => setNeighbors(s, v)} />
			{/if}
		</div>
	{/if}
</div>

<style>
	.scene {
		display: grid;
		gap: 12px;
	}
	.views.two {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 10px;
	}
	@media (max-width: 560px) {
		.views.two {
			grid-template-columns: 1fr;
		}
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
