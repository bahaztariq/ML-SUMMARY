<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import Canvas from '#lib/viz/Canvas.svelte';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import { alpha, dot, fmt, label, squareMapper, ticks, mapper, type VizTheme } from '#lib/viz/canvas.ts';
	import type { SceneProps } from '../types';
	import * as km from './kmeans';
	import { currentInertia, doAssign, place, restart, setData, stepOnce, type KMeansState } from './state';

	let { s = $bindable(), step }: SceneProps<KMeansState> = $props();

	const DOMAIN: [number, number] = [-1.25, 1.25];
	const PAD = 10;

	/* ---- centroid animation: displayed positions ease toward the real ones ---- */
	let disp = $state<km.Pt[]>([]);
	let raf = 0;
	$effect(() => {
		const target = s.centroids;
		if (untrack(() => disp.length) !== target.length) disp = target.map((c) => [c[0], c[1]]);
		cancelAnimationFrame(raf);
		const tick = () => {
			let moving = false;
			disp = disp.map((d, j) => {
				const t = target[j];
				if (!t) return d;
				const dx = t[0] - d[0];
				const dy = t[1] - d[1];
				if (Math.abs(dx) + Math.abs(dy) < 1e-4) return [t[0], t[1]];
				moving = true;
				return [d[0] + dx * 0.22, d[1] + dy * 0.22];
			});
			if (moving) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
	});

	/* ---- autoplay ---- */
	let playing = $state(false);
	let timer: ReturnType<typeof setInterval> | undefined;
	function play() {
		if (playing) return stop();
		if (s.converged) restart(s, s.initSeed);
		playing = true;
		timer = setInterval(() => {
			if (!stepOnce(s)) stop();
		}, 420);
	}
	function stop() {
		playing = false;
		clearInterval(timer);
	}
	$effect(() => {
		step;
		return stop; // stop when the lesson step changes
	});
	onDestroy(stop);

	/* ---- dragging ---- */
	let dragging = $state(-1);
	let hover = $state(-1);
	let map: ReturnType<typeof squareMapper> | null = null;

	function hit(p: { x: number; y: number }) {
		if (!map || !s.ui.drag) return -1;
		let best = -1;
		let bd = 18 * 18;
		disp.forEach((c, j) => {
			const d = (map!.x(c[0]) - p.x) ** 2 + (map!.y(c[1]) - p.y) ** 2;
			if (d < bd) {
				bd = d;
				best = j;
			}
		});
		return best;
	}

	function down(p: { x: number; y: number }) {
		dragging = hit(p);
		if (dragging >= 0) stop();
	}
	function move(p: { x: number; y: number }) {
		if (dragging < 0) {
			hover = hit(p);
			return;
		}
		if (!map) return;
		const c: km.Pt = [map.invX(p.x), map.invY(p.y)];
		s.centroids[dragging] = c;
		disp[dragging] = c;
		s.trails[dragging] = [[c[0], c[1]]];
		s.converged = false;
		if (s.phase !== 'placed') {
			s.labels = km.assign(s.points, s.centroids);
			s.phase = 'assigned';
		}
		s.did.drag = true;
	}
	function up() {
		dragging = -1;
	}

	/* ---- drawing ---- */
	const color = (t: VizTheme, j: number) => t.series[j % t.series.length];

	function draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const box = { x: PAD, y: PAD, w: w - PAD * 2, h: h - PAD * 2 };
		const m = squareMapper(box, DOMAIN);
		map = m;
		const assigned = s.labels.length > 0 && s.labels[0] !== -1;

		// grid
		ctx.strokeStyle = t.grid;
		ctx.lineWidth = 1;
		for (const v of ticks(-2, 2, 8)) {
			ctx.beginPath();
			ctx.moveTo(m.x(v), 0);
			ctx.lineTo(m.x(v), h);
			ctx.moveTo(0, m.y(v));
			ctx.lineTo(w, m.y(v));
			ctx.stroke();
		}

		// territory of each centroid (coarse nearest-centroid raster)
		if (s.show.regions && disp.length && assigned) {
			const cell = 7;
			for (let py = 0; py < h; py += cell) {
				for (let px = 0; px < w; px += cell) {
					const j = km.nearest([m.invX(px + cell / 2), m.invY(py + cell / 2)], disp);
					ctx.fillStyle = alpha(color(t, j), 0.07);
					ctx.fillRect(px, py, cell, cell);
				}
			}
		}

		// point → centroid links
		if (s.show.links && assigned) {
			ctx.lineWidth = 1;
			s.points.forEach((p, i) => {
				const c = disp[s.labels[i]];
				if (!c) return;
				ctx.strokeStyle = alpha(color(t, s.labels[i]), 0.16);
				ctx.beginPath();
				ctx.moveTo(m.x(p[0]), m.y(p[1]));
				ctx.lineTo(m.x(c[0]), m.y(c[1]));
				ctx.stroke();
			});
		}

		// points
		s.points.forEach((p, i) => {
			const l = s.labels[i];
			dot(ctx, m.x(p[0]), m.y(p[1]), 3.4, l >= 0 ? alpha(color(t, l), 0.85) : alpha(t.text3, 0.55));
		});

		// centroid trails
		if (s.show.trails) {
			ctx.setLineDash([3, 4]);
			ctx.lineWidth = 1.5;
			s.trails.forEach((trail, j) => {
				if (trail.length < 2) return;
				ctx.strokeStyle = alpha(color(t, j), 0.7);
				ctx.beginPath();
				trail.forEach(([x, y], i) => (i ? ctx.lineTo(m.x(x), m.y(y)) : ctx.moveTo(m.x(x), m.y(y))));
				ctx.stroke();
				trail.slice(0, -1).forEach(([x, y]) => dot(ctx, m.x(x), m.y(y), 2.5, alpha(color(t, j), 0.6)));
			});
			ctx.setLineDash([]);
		}

		// centroids
		disp.forEach((c, j) => {
			const x = m.x(c[0]);
			const y = m.y(c[1]);
			const big = j === dragging || j === hover;
			dot(ctx, x, y, big ? 13 : 11, alpha(color(t, j), 0.18));
			dot(ctx, x, y, big ? 8 : 7, color(t, j), t.bg, 2.5);
			ctx.strokeStyle = t.bg;
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(x - 3, y);
			ctx.lineTo(x + 3, y);
			ctx.moveTo(x, y - 3);
			ctx.lineTo(x, y + 3);
			ctx.stroke();
		});

		if (s.ui.drag && dragging < 0 && hover < 0 && !s.did.drag && disp.length) {
			label(ctx, t, 'drag a centroid ↔', w - 12, h - 14, { align: 'right', color: t.text3, size: 11 });
		}
	}

	/* ---- elbow chart ---- */
	const elbowData = $derived(s.show.elbow ? km.elbow($state.snapshot(s.points) as km.Pt[]) : null);

	let elbowMap: ReturnType<typeof mapper> | null = null;
	function drawElbow(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		if (!elbowData) return;
		const box = { x: 44, y: 12, w: w - 58, h: h - 40 };
		const ymax = elbowData[0] * 1.08;
		const m = mapper(box, [0.6, elbowData.length + 0.4], [0, ymax]);
		elbowMap = m;
		ctx.strokeStyle = t.grid;
		for (const v of ticks(0, ymax, 3)) {
			ctx.beginPath();
			ctx.moveTo(box.x, m.y(v));
			ctx.lineTo(box.x + box.w, m.y(v));
			ctx.stroke();
			label(ctx, t, fmt(v, 0), box.x - 8, m.y(v), { align: 'right', color: t.text3, size: 10 });
		}
		elbowData.forEach((_, i) =>
			label(ctx, t, String(i + 1), m.x(i + 1), box.y + box.h + 12, {
				align: 'center',
				color: i + 1 === s.k ? t.text : t.text3,
				size: 11,
				weight: i + 1 === s.k ? 700 : 500
			})
		);
		label(ctx, t, 'K', box.x + box.w + 8, box.y + box.h + 12, { color: t.text3, size: 10 });
		ctx.strokeStyle = t.accent;
		ctx.lineWidth = 2;
		ctx.beginPath();
		elbowData.forEach((v, i) => (i ? ctx.lineTo(m.x(i + 1), m.y(v)) : ctx.moveTo(m.x(i + 1), m.y(v))));
		ctx.stroke();
		elbowData.forEach((v, i) => {
			const cur = i + 1 === s.k;
			dot(ctx, m.x(i + 1), m.y(v), cur ? 6 : 3.5, cur ? t.accent : t.bg, t.accent, 2);
		});
		label(ctx, t, 'inertia', box.x, 4, { color: t.text3, size: 10, base: 'top' });
	}

	function pickK(p: { x: number }) {
		if (!elbowMap || !s.ui.k) return;
		setK(Math.max(1, Math.min(8, Math.round(elbowMap.invX(p.x)))));
	}

	function setK(k: number) {
		stop();
		s.k = k;
		place(s);
		if (s.show.elbow) {
			// On the elbow step show the finished clustering for each K.
			for (let i = 0; i < 400 && stepOnce(s); i++);
		}
	}

	const statusText = $derived(
		s.converged
			? 'converged ✓'
			: s.phase === 'data'
				? 'no centroids yet'
				: s.phase === 'placed'
					? 'next: assign'
					: s.phase === 'assigned'
						? 'next: update'
						: 'next: assign'
	);
</script>

<div class="scene">
	<Canvas
		{draw}
		aspect={0.72}
		minHeight={280}
		maxHeight={460}
		label="Scatter plot of data points coloured by cluster, with draggable centroids"
		cursor={dragging >= 0 ? 'grabbing' : hover >= 0 ? 'grab' : 'default'}
		onpointerdown={down}
		onpointermove={move}
		onpointerup={up}
	/>

	<div class="bar">
		<Readouts
			items={[
				{ label: 'K', value: String(s.k) },
				{ label: 'iteration', value: String(s.iteration) },
				{ label: 'inertia', value: fmt(currentInertia(s)), highlight: s.phase === 'updated' || s.converged },
				{ label: 'status', value: statusText }
			]}
		/>
	</div>

	{#if s.show.elbow}
		<div class="elbow">
			<Canvas draw={drawElbow} aspect={0.28} minHeight={130} maxHeight={170} label="Elbow plot: inertia for K from 1 to 8" onpointerdown={pickK} cursor={s.ui.k ? 'pointer' : 'default'} />
		</div>
	{/if}

	{#if Object.values(s.ui).some(Boolean)}
		<div class="controls">
			{#if s.ui.step || s.ui.run || s.ui.restart}
				<div class="buttons">
					{#if s.ui.step}
						<button class="btn btn-sm" onclick={() => (stop(), stepOnce(s))} disabled={s.converged}>
							Step: {s.phase === 'assigned' ? 'update' : 'assign'}
						</button>
					{/if}
					{#if s.ui.run}
						<button class="btn btn-sm btn-primary" onclick={play}>{playing ? '❚❚ Pause' : '▶ Run'}</button>
					{/if}
					{#if s.ui.restart}
						<button class="btn btn-sm" onclick={() => (stop(), restart(s))}>↺ New start</button>
					{/if}
				</div>
			{/if}
			{#if s.ui.k}
				<Slider label="K (clusters)" bind:value={s.k} min={1} max={8} oninput={setK} />
			{/if}
			{#if s.ui.init}
				<Segmented
					label="Initialization"
					bind:value={s.initMethod}
					options={[
						{ value: 'random', label: 'Random' },
						{ value: 'plusplus', label: 'k-means++' }
					]}
					onchange={() => (stop(), place(s))}
				/>
			{/if}
			{#if s.ui.dataset}
				<Segmented
					label="Dataset"
					bind:value={s.dataset}
					options={[
						{ value: 'blobs', label: 'Blobs' },
						{ value: 'uneven', label: 'Uneven' },
						{ value: 'moons', label: 'Moons' }
					]}
					onchange={(d) => {
						stop();
						setData(s, d);
						if (!s.ui.k) s.k = d === 'moons' ? 2 : 4;
						place(s);
						if (!s.ui.run) for (let i = 0; i < 400 && stepOnce(s); i++);
						else doAssign(s);
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
	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}
	.elbow {
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
