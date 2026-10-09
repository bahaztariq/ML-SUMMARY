<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import Canvas from '#lib/viz/Canvas.svelte';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import { alpha, dot, fmt, label, mapper, squareMapper, ticks, type VizTheme } from '#lib/viz/canvas.ts';
	import { blend, centerMark, clusterColor, drawKMeansView, grid, hitPoint, metricChart, rgb, type Mapper } from '../_clustering/draw';
	import type { SceneProps } from '../types';
	import { density, ellipse, type Comp, type Dataset } from './gmm';
	import { bicOf, kmeansFor, place, points, resp, setData, setK, stepOnce, type GmmState } from './state';
	import { local } from '#lib/i18n/index.svelte.ts';

	const en = {
		clickPoint: 'click a point',
		logLik: 'log-likelihood',
		iterAxis: 'iteration →',
		bicLabel: 'BIC (lower is better)',
		converged: 'converged ✓',
		nextE: 'next: E-step',
		nextM: 'next: M-step',
		ariaScatter: 'Scatter plot coloured by Gaussian mixture responsibilities, with an ellipse per component',
		ariaLL: 'Log-likelihood after each EM iteration',
		ariaBIC: 'BIC for 1 to 6 components',
		points: 'points',
		method: 'method',
		iteration: 'iteration',
		logLikShort: 'log-lik',
		status: 'status',
		stepBtn: 'Step: {p}',
		pause: '❚❚ Pause',
		run: '▶ Run',
		newStart: '↺ New start',
		kSlider: 'K (components)',
		dataset: 'Dataset',
		stretched: 'Stretched',
		blobs: 'Blobs',
		moons: 'Moons',
		methodLabel: 'Method',
		colour: 'Colour',
		soft: 'Soft γ',
		hard: 'Hard label'
	};
	const L = local({
		en,
		fr: {
			clickPoint: 'cliquez sur un point',
			logLik: 'log-vraisemblance',
			iterAxis: 'itération →',
			bicLabel: 'BIC (plus bas = meilleur)',
			converged: 'convergé ✓',
			nextE: 'suite\u00a0: étape E',
			nextM: 'suite\u00a0: étape M',
			ariaScatter: 'Nuage de points coloré selon les responsabilités du mélange gaussien, avec une ellipse par composante',
			ariaLL: 'Log-vraisemblance après chaque itération EM',
			ariaBIC: 'BIC pour 1 à 6 composantes',
			points: 'points',
			method: 'méthode',
			iteration: 'itération',
			logLikShort: 'log-vrais.',
			status: 'état',
			stepBtn: 'Étape\u00a0: {p}',
			pause: '❚❚ Pause',
			run: '▶ Lancer',
			newStart: '↺ Nouveau départ',
			kSlider: 'K (composantes)',
			dataset: 'Jeu de données',
			stretched: 'Étirés',
			blobs: 'Amas',
			moons: 'Lunes',
			methodLabel: 'Méthode',
			colour: 'Couleur',
			soft: 'γ souple',
			hard: 'Étiquette stricte'
		},
		ar: {
			clickPoint: 'انقر على نقطة',
			logLik: 'لوغاريتم الأرجحية',
			iterAxis: 'التكرار →',
			bicLabel: 'BIC (الأقل أفضل)',
			converged: 'تقارب ✓',
			nextE: 'التالي: خطوة E',
			nextM: 'التالي: خطوة M',
			ariaScatter: 'مخطط انتشار ملوّن بحسب مسؤوليات خليط غاوس، مع قطع ناقص لكل مكوّن',
			ariaLL: 'لوغاريتم الأرجحية بعد كل تكرار من EM',
			ariaBIC: 'قيمة BIC من مكوّن واحد إلى 6 مكوّنات',
			points: 'النقاط',
			method: 'الطريقة',
			iteration: 'التكرار',
			logLikShort: 'لوغ. الأرجحية',
			status: 'الحالة',
			stepBtn: 'خطوة: {p}',
			pause: '❚❚ إيقاف مؤقت',
			run: '▶ تشغيل',
			newStart: '↺ بداية جديدة',
			kSlider: 'K (المكوّنات)',
			dataset: 'مجموعة البيانات',
			stretched: 'ممدودة',
			blobs: 'كتل',
			moons: 'أهلّة',
			methodLabel: 'الطريقة',
			colour: 'التلوين',
			soft: 'γ مرن',
			hard: 'تسمية صارمة'
		}
	});

	let { s = $bindable(), step }: SceneProps<GmmState> = $props();

	const DOMAIN: [number, number] = [-1.1, 1.1];
	/*
	 * Fixed chart height: a width-derived height lags one frame behind when the BIC panel
	 * appears beside the log-likelihood chart, which briefly made the playground step taller.
	 */
	const CHART_H = 132;
	const PAD = 10;

	/* ---- displayed components ease toward the real ones ---- */
	let disp = $state.raw<Comp[]>([]);
	let raf = 0;
	const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
	$effect(() => {
		const target: Comp[] = JSON.parse(JSON.stringify(s.comps));
		if (untrack(() => disp.length) !== target.length) {
			disp = target;
			return;
		}
		cancelAnimationFrame(raf);
		let frames = 0;
		const tick = () => {
			frames++;
			const t = frames >= 14 ? 1 : 0.25;
			disp = disp.map((d, j) => {
				const g = target[j];
				return {
					w: lerp(d.w, g.w, t),
					mu: [lerp(d.mu[0], g.mu[0], t), lerp(d.mu[1], g.mu[1], t)],
					cov: [lerp(d.cov[0], g.cov[0], t), lerp(d.cov[1], g.cov[1], t), lerp(d.cov[2], g.cov[2], t)]
				};
			});
			if (t < 1) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});

	/* ---- EM autoplay ---- */
	let playing = $state(false);
	let timer: ReturnType<typeof setInterval> | undefined;
	function play() {
		if (playing) return stop();
		if (s.converged) place(s);
		playing = true;
		timer = setInterval(() => {
			if (!stepOnce(s)) stop();
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

	/* ---- picking ---- */
	let map: Mapper | null = null;
	let hover = $state(-1);
	function down(p: { x: number; y: number }) {
		if (!map || !s.ui.select || s.view !== 'gmm') return;
		const i = hitPoint(points(s), map, p, 16);
		if (i < 0) return;
		s.selected = i;
		if (!s.did.picked.includes(i)) s.did.picked.push(i);
	}
	function move(p: { x: number; y: number }) {
		hover = map && s.ui.select && s.view === 'gmm' ? hitPoint(points(s), map, p, 16) : -1;
	}

	const gamma = $derived(resp(s));
	let heat: HTMLCanvasElement | null = null;

	function draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const m = squareMapper({ x: PAD, y: PAD, w: w - PAD * 2, h: h - PAD * 2 }, DOMAIN);
		map = m;
		const pts = points(s);
		grid(ctx, m, w, h, t);
		if (s.view === 'kmeans') {
			drawKMeansView(ctx, m, w, h, t, pts, kmeansFor(s.dataset, s.k));
			return;
		}
		const comps = disp;
		const colors = comps.map((_, j) => clusterColor(t, j));

		// mixture density as soft spotlights, rendered at low resolution and smoothed
		if (s.show.heat && comps.length) {
			const step = 4;
			const cw = Math.ceil(w / step);
			const ch = Math.ceil(h / step);
			heat ??= document.createElement('canvas');
			heat.width = cw;
			heat.height = ch;
			const hctx = heat.getContext('2d')!;
			const img = hctx.createImageData(cw, ch);
			const rgbs = colors.map(rgb);
			const dens = new Float64Array(cw * ch * comps.length);
			let peak = 0;
			for (let yy = 0; yy < ch; yy++)
				for (let xx = 0; xx < cw; xx++) {
					const q: [number, number] = [m.invX((xx + 0.5) * step), m.invY((yy + 0.5) * step)];
					let tot = 0;
					comps.forEach((c, j) => {
						const v = c.w * density(q, c);
						dens[(yy * cw + xx) * comps.length + j] = v;
						tot += v;
					});
					peak = Math.max(peak, tot);
				}
			for (let p = 0; p < cw * ch; p++) {
				let tot = 0;
				let r = 0;
				let g = 0;
				let b = 0;
				for (let j = 0; j < comps.length; j++) {
					const v = dens[p * comps.length + j];
					tot += v;
					r += rgbs[j][0] * v;
					g += rgbs[j][1] * v;
					b += rgbs[j][2] * v;
				}
				if (tot <= 0) continue;
				img.data[p * 4] = r / tot;
				img.data[p * 4 + 1] = g / tot;
				img.data[p * 4 + 2] = b / tot;
				img.data[p * 4 + 3] = 255 * 0.2 * Math.min(1, Math.sqrt(tot / (peak || 1)) * 1.3);
			}
			hctx.putImageData(img, 0, 0);
			ctx.imageSmoothingEnabled = true;
			ctx.drawImage(heat, 0, 0, cw * step, ch * step);
		}

		// points coloured by responsibility
		pts.forEach((p, i) => {
			const g = gamma?.[i];
			let fill = alpha(t.text3, 0.6);
			if (g) fill = s.show.soft ? blend(colors, g, 0.9) : alpha(colors[g.indexOf(Math.max(...g))], 0.9);
			dot(ctx, m.x(p[0]), m.y(p[1]), 3.4, fill);
		});

		// component ellipses (1σ and 2σ) and means
		if (s.show.ellipses) {
			const scale = m.x(1) - m.x(0);
			comps.forEach((c, j) => {
				const e = ellipse(c.cov);
				for (const k of [1, 2]) {
					ctx.beginPath();
					ctx.ellipse(m.x(c.mu[0]), m.y(c.mu[1]), e.rx * k * scale, e.ry * k * scale, -e.angle, 0, Math.PI * 2);
					ctx.strokeStyle = alpha(colors[j], k === 1 ? 0.95 : 0.55);
					ctx.lineWidth = k === 1 ? 2 : 1.3;
					if (k === 2) ctx.setLineDash([5, 4]);
					ctx.stroke();
					ctx.setLineDash([]);
				}
			});
			comps.forEach((c, j) => {
				const x = m.x(c.mu[0]);
				const y = m.y(c.mu[1]);
				centerMark(ctx, t, x, y, colors[j], 6);
				const txt = `π${j + 1} = ${c.w.toFixed(2)}`;
				ctx.font = `600 11px ${t.sans}`;
				const tw = ctx.measureText(txt).width;
				// put the label on the side facing away from the other components
				const ax = comps.reduce((a, d) => a + d.mu[0], 0) / comps.length;
				const ay = comps.reduce((a, d) => a + d.mu[1], 0) / comps.length;
				const right = c.mu[0] >= ax;
				const below = c.mu[1] < ay && comps.length > 2;
				const lx = right ? x + 11 : x - 11 - tw - 8;
				const ly = below ? y + 6 : y - 21;
				ctx.fillStyle = alpha(t.bg, 0.85);
				ctx.fillRect(lx, ly, tw + 8, 16);
				label(ctx, t, txt, lx + 4, ly + 8, { color: colors[j], weight: 600 });
			});
		}

		// selected point and its responsibilities
		const sel = s.selected;
		if (sel >= 0 && pts[sel]) {
			const x = m.x(pts[sel][0]);
			const y = m.y(pts[sel][1]);
			dot(ctx, x, y, 8, 'transparent', t.text, 2);
			const g = gamma?.[sel];
			if (g && s.show.gamma) {
				const bw = 92;
				const rowH = 15;
				const bh = g.length * rowH + 10;
				let bx = x + 14;
				let by = y - bh / 2;
				if (bx + bw + 40 > w) bx = x - 14 - bw - 40;
				by = Math.max(4, Math.min(h - bh - 4, by));
				ctx.fillStyle = alpha(t.bg, 0.94);
				ctx.strokeStyle = t.axis;
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.roundRect(bx, by, bw + 40, bh, 6);
				ctx.fill();
				ctx.stroke();
				g.forEach((v, j) => {
					const ry = by + 5 + j * rowH;
					label(ctx, t, `γ${j + 1}`, bx + 6, ry + rowH / 2, { size: 10, color: t.text2 });
					ctx.fillStyle = alpha(colors[j] ?? t.text3, 0.2);
					ctx.fillRect(bx + 26, ry + 3, bw - 30, rowH - 6);
					ctx.fillStyle = colors[j] ?? t.text3;
					ctx.fillRect(bx + 26, ry + 3, (bw - 30) * v, rowH - 6);
					label(ctx, t, `${Math.round(v * 100)}%`, bx + bw + 34, ry + rowH / 2, { size: 10, align: 'right', color: t.text, weight: 600 });
				});
			}
		}
		if (hover >= 0 && hover !== sel && pts[hover]) dot(ctx, m.x(pts[hover][0]), m.y(pts[hover][1]), 6.5, 'transparent', alpha(t.text, 0.5), 1.5);
		if (s.ui.select && sel < 0 && hover < 0) label(ctx, t, L('clickPoint'), w - 12, h - 14, { align: 'right', color: t.text3, size: 11 });
	}

	/* ---- log-likelihood chart ---- */
	function drawLL(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const ll = s.ll;
		const box = { x: 52, y: 16, w: w - 66, h: h - 40 };
		label(ctx, t, L('logLik'), box.x, 4, { color: t.text3, size: 10, base: 'top' });
		label(ctx, t, L('iterAxis'), box.x + box.w, box.y + box.h + 13, { align: 'right', color: t.text3, size: 10 });
		if (ll.length < 1) return;
		const lo = Math.min(...ll);
		const hi = Math.max(...ll);
		const pad = (hi - lo) * 0.1 || 1;
		const m = mapper(box, [0, Math.max(8, ll.length - 1)], [lo - pad, hi + pad]);
		ctx.strokeStyle = t.grid;
		ctx.lineWidth = 1;
		for (const v of ticks(lo - pad, hi + pad, 3)) {
			ctx.beginPath();
			ctx.moveTo(box.x, m.y(v));
			ctx.lineTo(box.x + box.w, m.y(v));
			ctx.stroke();
			label(ctx, t, fmt(v, 0), box.x - 6, m.y(v), { align: 'right', color: t.text3, size: 10 });
		}
		ctx.strokeStyle = t.accent;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ll.forEach((v, i) => (i ? ctx.lineTo(m.x(i), m.y(v)) : ctx.moveTo(m.x(i), m.y(v))));
		ctx.stroke();
		const last = ll.length - 1;
		dot(ctx, m.x(last), m.y(ll[last]), 4, t.accent, t.bg, 1.5);
	}

	/* ---- BIC chart ---- */
	const bic = $derived(s.show.bic ? bicOf(s.dataset) : null);
	let bicMap: Mapper | null = null;
	function drawBIC(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		if (!bic) return;
		const xs = bic.map((_, i) => i + 1);
		bicMap = metricChart(ctx, w, h, t, { xs, ys: bic, current: s.k, best: bic.indexOf(Math.min(...bic)) + 1, yLabel: L('bicLabel') });
	}
	function pickK(p: { x: number }) {
		if (!bicMap || !s.ui.k) return;
		chooseK(Math.max(1, Math.min(6, Math.round(bicMap.invX(p.x)))));
	}
	function chooseK(k: number) {
		stop();
		s.selected = -1;
		setK(s, k);
	}

	const status = $derived(
		s.converged ? L('converged') : s.phase === 'e' ? L('nextM') : L('nextE')
	);
</script>

<div class="scene">
	<Canvas
		{draw}
		aspect={0.72}
		minHeight={280}
		maxHeight={460}
		label={L('ariaScatter')}
		cursor={hover >= 0 ? 'pointer' : 'default'}
		onpointerdown={s.ui.select ? down : undefined}
		onpointermove={move}
	/>

	<Readouts
		items={!s.show.ellipses && s.view === 'gmm'
			? [{ label: L('points'), value: String(points(s).length) }]
			: s.view === 'kmeans'
			? [
					{ label: L('method'), value: 'K-Means' },
					{ label: 'K', value: String(s.k) }
				]
			: [
					{ label: 'K', value: String(s.k) },
					{ label: L('iteration'), value: String(s.iteration) },
					{ label: L('logLikShort'), value: s.ll.length ? s.ll[s.ll.length - 1].toFixed(1) : '—', highlight: s.converged },
					{ label: L('status'), value: status }
				]}
	/>

	{#if s.show.llChart || s.show.bic}
		<div class="charts">
			{#if s.show.llChart}
				<div class="panel">
					<Canvas draw={drawLL} aspect={0.42} minHeight={CHART_H} maxHeight={CHART_H} label={L('ariaLL')} />
				</div>
			{/if}
			{#if s.show.bic}
				<div class="panel">
					<Canvas
						draw={drawBIC}
						aspect={0.42}
						minHeight={CHART_H}
						maxHeight={CHART_H}
						label={L('ariaBIC')}
						onpointerdown={pickK}
						cursor={s.ui.k ? 'pointer' : 'default'}
					/>
				</div>
			{/if}
		</div>
	{/if}

	{#if s.ui.em || s.ui.restart || s.ui.k || s.ui.dataset || s.ui.view || s.ui.colour}
		<div class="controls">
			{#if s.ui.em || s.ui.restart}
				<div class="buttons">
					{#if s.ui.em}
						<button class="btn btn-sm" onclick={() => (stop(), stepOnce(s))} disabled={s.converged}>
							{L('stepBtn', { p: s.phase === 'e' ? 'M' : 'E' })}
						</button>
						<button class="btn btn-sm btn-primary" onclick={play}>{playing ? L('pause') : L('run')}</button>
					{/if}
					{#if s.ui.restart}
						<button class="btn btn-sm" onclick={() => (stop(), s.seed++, place(s))}>{L('newStart')}</button>
					{/if}
				</div>
			{/if}
			{#if s.ui.k}
				<Slider label={L('kSlider')} value={s.k} min={1} max={6} oninput={chooseK} />
			{/if}
			{#if s.ui.dataset}
				<Segmented
					label={L('dataset')}
					value={s.dataset}
					options={[
						{ value: 'stretched', label: L('stretched') },
						{ value: 'blobs', label: L('blobs') },
						{ value: 'moons', label: L('moons') }
					] as { value: Dataset; label: string }[]}
					onchange={(d) => (stop(), setData(s, d))}
				/>
			{/if}
			{#if s.ui.view}
				<Segmented
					label={L('methodLabel')}
					bind:value={s.view}
					options={[
						{ value: 'gmm', label: 'GMM' },
						{ value: 'kmeans', label: 'K-Means' }
					] as { value: 'gmm' | 'kmeans'; label: string }[]}
				/>
			{/if}
			{#if s.ui.colour}
				<Segmented
					label={L('colour')}
					value={s.show.soft ? 'soft' : 'hard'}
					options={[
						{ value: 'soft', label: L('soft') },
						{ value: 'hard', label: L('hard') }
					]}
					onchange={(v) => (s.show.soft = v === 'soft')}
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
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
	.buttons {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}
</style>
