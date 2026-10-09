<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import Canvas from '#lib/viz/Canvas.svelte';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import { alpha, clamp, dot, fmt, label, mapper, squareMapper, type VizTheme } from '#lib/viz/canvas.ts';
	import type { SceneProps } from '../types.ts';
	import { grid2d, tag } from '../_dimred/draw.ts';
	import { local } from '#lib/i18n/index.svelte.ts';
	import * as F from './iforest.ts';
	import {
		CLUMP,
		GRID,
		NORMAL,
		OUT,
		clumpCaught,
		data,
		detection,
		flags,
		forest,
		grow,
		heat,
		inspect,
		isolateAll,
		mean,
		meanPaths,
		newTree,
		nextCut,
		path,
		pathLen,
		pct,
		scores,
		setDataset,
		type IFState
	} from './state.ts';

	let { s = $bindable() }: SceneProps<IFState> = $props();

	// `en` is declared on its own so its values widen to `string` (inline, local() infers literal types)
	const en = {
		isolatedIn: 'isolated in {n} cuts',
		cut1: '{n} cut',
		cutN: '{n} cuts',
		outlier: 'outlier',
		normal: 'normal point',
		scoreTag: 'score {v}',
		clickHint: 'click a point to inspect it',
		axis: 'cuts to isolate (path length h)',
		avg: 'avg {v}',
		isolating: 'isolating',
		cutsSoFar: 'cuts so far',
		left: 'points still in its cell',
		trees: 'trees',
		avgOut: 'avg h (outlier)',
		avgNormal: 'avg h (normal)',
		score: 'score',
		flagged: 'flagged',
		caught: 'planted anomalies caught',
		falseAlarms: 'false alarms',
		clumpFlagged: 'clump flagged',
		points: 'points',
		features: 'features',
		labels: 'labels',
		none: 'none',
		legendPlanted: 'planted anomaly',
		legendFlagged: 'flagged by the forest',
		legendThreshold: 'score threshold',
		sceneLabel: 'Scatter plot of points with random axis-aligned cuts and anomaly scores',
		historyLabel: 'Path lengths of the outlier and the normal point across random trees',
		nextCut: 'Next cut',
		isolate: 'Isolate',
		newTree: 'New random tree',
		grow: '+10 trees',
		data: 'Data',
		blobs: 'Two blobs',
		clump: 'Anomaly clump',
		local: 'Dense + sparse'
	};
	const L = local({
		en,
		fr: {
			isolatedIn: 'isolé en {n} coupes',
			cut1: '{n} coupe',
			cutN: '{n} coupes',
			outlier: 'valeur aberrante',
			normal: 'point normal',
			scoreTag: 'score {v}',
			clickHint: 'cliquez sur un point pour l’inspecter',
			axis: 'coupes pour isoler (longueur de chemin h)',
			avg: 'moy. {v}',
			isolating: 'point à isoler',
			cutsSoFar: 'coupes jusqu’ici',
			left: 'points encore dans sa cellule',
			trees: 'arbres',
			avgOut: 'h moyen (aberrant)',
			avgNormal: 'h moyen (normal)',
			score: 'score',
			flagged: 'signalés',
			caught: 'anomalies plantées détectées',
			falseAlarms: 'fausses alertes',
			clumpFlagged: 'amas signalé',
			points: 'points',
			features: 'variables',
			labels: 'étiquettes',
			none: 'aucune',
			legendPlanted: 'anomalie plantée',
			legendFlagged: 'signalé par la forêt',
			legendThreshold: 'seuil de score',
			sceneLabel: 'Nuage de points avec des coupes aléatoires parallèles aux axes et des scores d’anomalie',
			historyLabel: 'Longueurs de chemin de la valeur aberrante et du point normal sur des arbres aléatoires',
			nextCut: 'Coupe suivante',
			isolate: 'Isoler',
			newTree: 'Nouvel arbre aléatoire',
			grow: '+10 arbres',
			data: 'Données',
			blobs: 'Deux amas',
			clump: 'Amas d’anomalies',
			local: 'Dense + clairsemé'
		},
		ar: {
			isolatedIn: 'عُزلت بعد {n} من القطوع',
			cut1: 'القطوع: {n}',
			cutN: 'القطوع: {n}',
			outlier: 'قيمة شاذة',
			normal: 'نقطة عادية',
			scoreTag: 'الدرجة {v}',
			clickHint: 'انقر على نقطة لفحصها',
			axis: 'القطوع اللازمة للعزل (طول المسار h)',
			avg: 'المتوسط {v}',
			isolating: 'النقطة المراد عزلها',
			cutsSoFar: 'القطوع حتى الآن',
			left: 'نقاط ما زالت في خليتها',
			trees: 'الأشجار',
			avgOut: 'متوسط h (الشاذة)',
			avgNormal: 'متوسط h (العادية)',
			score: 'الدرجة',
			flagged: 'المُعلَّمة',
			caught: 'الشذوذات المزروعة المكتشفة',
			falseAlarms: 'الإنذارات الكاذبة',
			clumpFlagged: 'المُعلَّم من التكتل',
			points: 'النقاط',
			features: 'السمات',
			labels: 'التسميات',
			none: 'لا يوجد',
			legendPlanted: 'شذوذ مزروع',
			legendFlagged: 'علّمته الغابة',
			legendThreshold: 'عتبة الدرجة',
			sceneLabel: 'مخطط انتشار لنقاط مع قطوع عشوائية موازية للمحاور ودرجات الشذوذ',
			historyLabel: 'أطوال مسار القيمة الشاذة والنقطة العادية عبر أشجار عشوائية',
			nextCut: 'القطع التالي',
			isolate: 'اعزل',
			newTree: 'شجرة عشوائية جديدة',
			grow: '+10 أشجار',
			data: 'البيانات',
			blobs: 'تجمّعان',
			clump: 'تكتل شذوذات',
			local: 'كثيف + متناثر'
		}
	});
	const cutsText = (n: number) => L(n === 1 ? 'cut1' : 'cutN', { n });

	const DOMAIN: [number, number] = [-1.08, 1.08];

	/* ---- cut-by-cut animation ---- */
	let shown = $state(0);
	let lastS: IFState | null = null;
	let lastKey = '';
	let timer: ReturnType<typeof setInterval> | undefined;
	$effect(() => {
		const key = `${s.dataset}|${s.target}|${s.treeSeed}`;
		const want = s.cuts;
		const isNew = s !== lastS || key !== lastKey;
		lastS = s;
		lastKey = key;
		untrack(() => {
			if (isNew) shown = 0;
			if (shown > want) shown = want;
		});
		clearInterval(timer);
		const every = clamp(2600 / Math.max(1, want), 110, 420);
		timer = setInterval(() => {
			if (shown >= s.cuts) return clearInterval(timer);
			shown++;
		}, every);
	});
	onDestroy(() => clearInterval(timer));

	/* ---- inspecting a point ---- */
	let map: ReturnType<typeof squareMapper> | null = null;
	function down(p: { x: number; y: number }) {
		if (!s.ui.inspect || !map) return;
		const X = data(s.dataset).X;
		let best = -1;
		let bd = 14 * 14;
		X.forEach((q, i) => {
			const d = (map!.x(q[0]) - p.x) ** 2 + (map!.y(q[1]) - p.y) ** 2;
			if (d < bd) {
				bd = d;
				best = i;
			}
		});
		if (best >= 0) inspect(s, best);
	}

	/* ---- drawing ---- */
	let heatCanvas: HTMLCanvasElement | undefined;
	function drawHeat(ctx: CanvasRenderingContext2D, m: typeof map & {}, t: VizTheme) {
		const H = heat(s);
		const cw = (m.x(GRID.hi) - m.x(GRID.lo)) / GRID.nx;
		const ch = (m.y(GRID.lo) - m.y(GRID.hi)) / GRID.ny;
		const x0 = m.x(GRID.lo);
		const y0 = m.y(GRID.lo);
		// paint one pixel per cell off-screen, then scale it up smoothly
		const rgb = (c: string) => (alpha(c, 1).match(/[\d.]+/g) ?? ['0', '0', '0']).slice(0, 3).map(Number);
		const hot = rgb(t.series[3]);
		const cold = rgb(t.series[4]);
		heatCanvas ??= document.createElement('canvas');
		heatCanvas.width = GRID.nx;
		heatCanvas.height = GRID.ny;
		const hctx = heatCanvas.getContext('2d')!;
		const img = hctx.createImageData(GRID.nx, GRID.ny);
		for (let j = 0; j < GRID.ny; j++)
			for (let i = 0; i < GRID.nx; i++) {
				const v = H[j * GRID.nx + i];
				const a = v >= 0.5 ? Math.min(0.5, ((v - 0.5) / 0.22) * 0.5) : Math.min(0.14, ((0.5 - v) / 0.12) * 0.14);
				const c = v >= 0.5 ? hot : cold;
				const k = ((GRID.ny - 1 - j) * GRID.nx + i) * 4;
				img.data[k] = c[0];
				img.data[k + 1] = c[1];
				img.data[k + 2] = c[2];
				img.data[k + 3] = Math.round(a * 255);
			}
		hctx.putImageData(img, 0, 0);
		ctx.imageSmoothingEnabled = true;
		ctx.drawImage(heatCanvas, x0, y0 - GRID.ny * ch, GRID.nx * cw, GRID.ny * ch);
		if (s.show.flags) {
			const thr = flags(s).threshold;
			if (!Number.isFinite(thr)) return;
			const inside = (i: number, j: number) => i >= 0 && j >= 0 && i < GRID.nx && j < GRID.ny && H[j * GRID.nx + i] >= thr;
			ctx.strokeStyle = t.series[3];
			ctx.lineWidth = 1.6;
			ctx.beginPath();
			for (let j = 0; j < GRID.ny; j++)
				for (let i = 0; i < GRID.nx; i++) {
					if (!inside(i, j)) continue;
					const lx = x0 + i * cw;
					const B = y0 - j * ch;
					if (!inside(i - 1, j)) (ctx.moveTo(lx, B), ctx.lineTo(lx, B - ch));
					if (!inside(i + 1, j)) (ctx.moveTo(lx + cw, B), ctx.lineTo(lx + cw, B - ch));
					if (!inside(i, j - 1)) (ctx.moveTo(lx, B), ctx.lineTo(lx + cw, B));
					if (!inside(i, j + 1)) (ctx.moveTo(lx, B - ch), ctx.lineTo(lx + cw, B - ch));
				}
			ctx.stroke();
		}
	}

	function draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const m = squareMapper({ x: 8, y: 8, w: w - 16, h: h - 16 }, DOMAIN);
		map = m;
		const { X, truth } = data(s.dataset);
		if (s.show.heat) drawHeat(ctx, m, t);
		else grid2d(ctx, t, m, w, h, { n: 8 });

		const fl = s.show.flags ? flags(s).idx : null;
		X.forEach((p, i) => {
			const planted = s.show.truth && truth[i];
			dot(ctx, m.x(p[0]), m.y(p[1]), 3.2, planted ? t.series[3] : alpha(t.series[0], 0.78));
			if (fl?.has(i)) dot(ctx, m.x(p[0]), m.y(p[1]), 6.5, 'transparent', t.text, 1.6);
		});

		if (s.show.cuts) {
			const cuts = path(s).slice(0, shown);
			cuts.forEach((c, k) => {
				const last = k === cuts.length - 1;
				ctx.strokeStyle = last ? t.accent : alpha(t.text, 0.55);
				ctx.lineWidth = last ? 2.5 : 1.4;
				ctx.beginPath();
				if (c.f === 0) {
					ctx.moveTo(m.x(c.thr), m.y(c.box.y0));
					ctx.lineTo(m.x(c.thr), m.y(c.box.y1));
				} else {
					ctx.moveTo(m.x(c.box.x0), m.y(c.thr));
					ctx.lineTo(m.x(c.box.x1), m.y(c.thr));
				}
				ctx.stroke();
			});
			// dim everything outside the target's current cell
			const b = F.finalBox(cuts, X, s.target);
			const bx = m.x(Math.max(b.x0, DOMAIN[0]));
			const by = m.y(Math.min(b.y1, DOMAIN[1]));
			const bw = m.x(Math.min(b.x1, DOMAIN[1])) - bx;
			const bh = m.y(Math.max(b.y0, DOMAIN[0])) - by;
			if (cuts.length) {
				ctx.fillStyle = alpha(t.bg, 0.42);
				ctx.beginPath();
				ctx.rect(0, 0, w, h);
				ctx.rect(bx, by, bw, bh);
				ctx.fill('evenodd');
				ctx.strokeStyle = t.accent;
				ctx.lineWidth = 2;
				ctx.strokeRect(bx, by, bw, bh);
			}
			const tp = X[s.target];
			dot(ctx, m.x(tp[0]), m.y(tp[1]), 6, t.series[3], t.bg, 2);
			const done = shown >= pathLen(s);
			tag(ctx, t, done ? L('isolatedIn', { n: pathLen(s) }) : cutsText(shown), m.x(tp[0]) + 10, m.y(tp[1]) + (tp[1] > 0.7 ? 18 : -14), {
				color: done ? t.accent : t.text
			});
		}

		if (s.show.pair && s.dataset === 'blobs' && !s.show.cuts) {
			for (const [i, name] of [
				[OUT, L('outlier')],
				[NORMAL, L('normal')]
			] as const) {
				const p = X[i];
				dot(ctx, m.x(p[0]), m.y(p[1]), 6, t.series[3], t.bg, 2);
				tag(ctx, t, name, m.x(p[0]) + 10, m.y(p[1]) - 14);
			}
		}

		if (s.sel >= 0 && s.show.heat) {
			const p = X[s.sel];
			dot(ctx, m.x(p[0]), m.y(p[1]), 8, 'transparent', t.accent, 2.5);
			tag(ctx, t, L('scoreTag', { v: fmt(scores(s)[s.sel]) }), m.x(p[0]) + 11, m.y(p[1]) + (p[1] > 0.8 ? 16 : -15), { color: t.accent });
		}
		if (s.ui.inspect && s.sel < 0) tag(ctx, t, L('clickHint'), w - 12, h - 16, { align: 'right', color: t.text2 });
	}

	/* ---- path lengths over many trees ---- */
	function drawHistory(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		ctx.font = `500 11px ${t.sans}`;
		const nameW = Math.max(ctx.measureText(L('outlier')).width, ctx.measureText(L('normal')).width);
		const bx = Math.min(Math.max(92, Math.ceil(nameW) + 18), w * 0.4);
		const box = { x: bx, y: 10, w: w - bx - 16, h: h - 34 };
		const all = [...s.history.out, ...s.history.normal];
		const xmax = Math.max(22, ...all) + 1;
		const m = mapper(box, [0, xmax], [0, 2]);
		const rows: [number[], string, number, string][] = [
			[s.history.out, L('outlier'), 1.5, t.series[3]],
			[s.history.normal, L('normal'), 0.5, t.series[0]]
		];
		for (let v = 0; v <= xmax; v += 5) {
			ctx.strokeStyle = t.grid;
			ctx.beginPath();
			ctx.moveTo(m.x(v), box.y);
			ctx.lineTo(m.x(v), box.y + box.h);
			ctx.stroke();
			label(ctx, t, String(v), m.x(v), box.y + box.h + 11, { align: 'center', color: t.text3, size: 10 });
		}
		label(ctx, t, L('axis'), box.x + box.w, 6, { align: 'right', color: t.text3, size: 10, base: 'top' });
		for (const [vals, name, yv, col] of rows) {
			label(ctx, t, name, box.x - 10, m.y(yv), { align: 'right', color: t.text2, size: 11 });
			const count = new Map<number, number>();
			for (const v of vals) {
				const c = count.get(v) ?? 0;
				count.set(v, c + 1);
				dot(ctx, m.x(v), m.y(yv) + 10 - c * 5.5, 2.6, alpha(col, 0.85));
			}
			if (vals.length) {
				const a = mean(vals);
				ctx.strokeStyle = t.text;
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(m.x(a), m.y(yv) - 16);
				ctx.lineTo(m.x(a), m.y(yv) + 14);
				ctx.stroke();
				label(ctx, t, L('avg', { v: fmt(a, 1) }), m.x(a) + 5, m.y(yv) - 12, { color: t.text, size: 10, weight: 600 });
			}
		}
	}

	/* ---- readouts ---- */
	const readouts = $derived.by(() => {
		const items: { label: string; value: string; highlight?: boolean }[] = [];
		const cutsShown = shown;
		if (s.show.cuts) {
			const cuts = path(s);
			const left = cutsShown ? cuts[cutsShown - 1].left : data(s.dataset).X.length;
			items.push(
				{ label: L('isolating'), value: s.target === OUT ? L('outlier') : s.target === NORMAL ? L('normal') : `#${s.target}` },
				{ label: L('cutsSoFar'), value: String(cutsShown), highlight: cutsShown >= pathLen(s) },
				{ label: L('left'), value: String(left) }
			);
		}
		if (s.show.history) {
			items.push(
				{ label: L('trees'), value: String(s.history.out.length) },
				{ label: L('avgOut'), value: fmt(mean(s.history.out), 1) },
				{ label: L('avgNormal'), value: fmt(mean(s.history.normal), 1) }
			);
		}
		if (s.show.heat && s.sel >= 0) {
			const eh = meanPaths(s)[s.sel];
			const c = F.cFactor(forest(s).psi);
			items.push({ label: L('score'), value: `2^(−${fmt(eh)} / ${fmt(c)}) = ${fmt(scores(s)[s.sel])}`, highlight: true });
		}
		if (s.show.flags) {
			const d = detection(s);
			items.push(
				{ label: L('flagged'), value: String(d.flagged) },
				{ label: L('caught'), value: `${d.caught} / ${d.planted}`, highlight: d.caught === d.planted },
				{ label: L('falseAlarms'), value: String(d.falseAlarms) }
			);
			if (s.dataset === 'clump') items.push({ label: L('clumpFlagged'), value: `${clumpCaught(s)} / ${CLUMP.length}` });
		}
		if (!items.length) items.push({ label: L('points'), value: String(data(s.dataset).X.length) }, { label: L('features'), value: '2' }, { label: L('labels'), value: L('none') });
		return items;
	});

	const anyControls = $derived(Object.values(s.ui).some(Boolean) && (s.ui.cut || s.ui.newTree || s.ui.grow || s.ui.nTrees || s.ui.psi || s.ui.contamination || s.ui.dataset));
</script>

<div class="scene">
	<Canvas
		{draw}
		aspect={0.7}
		minHeight={280}
		maxHeight={460}
		label={L('sceneLabel')}
		cursor={s.ui.inspect ? 'pointer' : 'default'}
		onpointerdown={down}
	/>

	<Readouts items={readouts} />

	{#if s.show.flags || (s.show.truth && s.show.heat)}
		<p class="legend">
			{#if s.show.truth}<span class="sw planted"></span> {L('legendPlanted')}{/if}
			{#if s.show.flags}<span class="sw ring"></span> {L('legendFlagged')} <span class="sw line"></span> {L('legendThreshold')}{/if}
		</p>
	{/if}

	{#if s.show.history}
		<div class="panel">
			<Canvas draw={drawHistory} aspect={0.24} minHeight={120} maxHeight={150} label={L('historyLabel')} />
		</div>
	{/if}

	{#if anyControls}
		<div class="controls">
			{#if s.ui.cut || s.ui.newTree || s.ui.grow}
				<div class="buttons">
					{#if s.ui.cut}
						<button class="btn btn-sm" onclick={() => nextCut(s)} disabled={s.cuts >= pathLen(s)}>{L('nextCut')}</button>
						<button class="btn btn-sm btn-primary" onclick={() => isolateAll(s)} disabled={s.cuts >= pathLen(s)}>▶ {L('isolate')}</button>
					{/if}
					{#if s.ui.newTree}
						<button class="btn btn-sm" onclick={() => newTree(s)}>{L('newTree')}</button>
					{/if}
					{#if s.ui.grow}
						<button class="btn btn-sm" onclick={() => grow(s, 10)}>{L('grow')}</button>
					{/if}
				</div>
			{/if}
			{#if s.ui.dataset}
				<Segmented
					label={L('data')}
					bind:value={s.dataset}
					options={[
						{ value: 'blobs', label: L('blobs') },
						{ value: 'clump', label: L('clump') },
						{ value: 'local', label: L('local') }
					] as { value: F.Dataset; label: string }[]}
					onchange={(d) => setDataset(s, d)}
				/>
			{/if}
			{#if s.ui.psi}
				<Segmented
					label="max_samples ψ"
					bind:value={s.psi}
					options={[16, 32, 64, 128, 256].map((v) => ({ value: v, label: String(v) }))}
				/>
			{/if}
			{#if s.ui.nTrees}
				<Slider label="n_estimators" bind:value={s.nTrees} min={1} max={200} />
			{/if}
			{#if s.ui.contamination}
				<Slider label="contamination" bind:value={s.contamination} min={0} max={0.15} step={0.005} format={(v) => pct(v, 1)} />
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
	.legend {
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 8px;
		font-size: 0.75rem;
		color: var(--text-3);
	}
	.sw {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		margin-inline-start: 6px;
	}
	.sw.planted {
		background: var(--viz-4);
	}
	.sw.ring {
		border: 1.6px solid var(--text);
	}
	.sw.line {
		width: 14px;
		height: 0;
		border-radius: 0;
		border-top: 2px solid var(--viz-4);
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
