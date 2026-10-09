<script lang="ts">
	import Canvas from '#lib/viz/Canvas.svelte';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import { alpha, clamp, label, type VizTheme } from '#lib/viz/canvas.ts';
	import type { SceneProps } from '../types.ts';
	import { local } from '#lib/i18n/index.svelte.ts';
	import Legend from '../_classifiers/Legend.svelte';
	import { PAD, axisNames, classColor, contour, grid, marker, pill, plotMapper, query, sampleGrid, shade, type Mapper } from '../_classifiers/plot.ts';
	import * as nb from './nb.ts';
	import { wordLabel } from './words.ts';
	import { DATA, accuracyOf, activeWords, gnb, post, probeB, qda, toggle, type Dataset, type Mode, type NBState } from './state.ts';

	let { s = $bindable(), step }: SceneProps<NBState> = $props();

	const L = local({
		en: {
			pxClass: 'P(x₁ | class)',
			dragProbe: 'drag the ◆ probe',
			nbAcc: 'NB accuracy',
			fullAcc: 'full-covariance accuracy',
			probeP: 'probe P(B)',
			ellipses: 'fitted 1σ / 2σ ellipses',
			nbBoundary: 'NB boundary',
			fullBoundary: 'full-covariance boundary',
			probe: 'probe',
			view: 'View',
			spamFilter: 'Spam filter',
			gauss2d: 'Gaussian NB (2-D)',
			newEmail: 'New email',
			clickWords: 'Click words to add or remove them',
			noWords: 'No words read yet',
			spam: 'spam',
			ham: 'ham',
			prior: 'prior P(class)',
			cls: 'class',
			joint: '= prior × likelihoods',
			posterior: '÷ their sum → posterior',
			postAria: 'Posterior: {spam} spam, {ham} ham',
			logOdds: 'log-odds',
			priorRow: 'prior',
			total: 'total',
			alpha: 'Laplace smoothing α',
			plotLabel: 'Two classes with Gaussian naive Bayes ellipses, bell curves and decision boundary',
			dataset: 'Dataset',
			spreads: 'Different spreads',
			correlated: 'Correlated'
		},
		fr: {
			pxClass: 'P(x₁ | classe)',
			dragProbe: 'faites glisser la sonde ◆',
			nbAcc: 'exactitude NB',
			fullAcc: 'exactitude covariance complète',
			probeP: 'P(B) de la sonde',
			ellipses: 'ellipses ajustées 1σ / 2σ',
			nbBoundary: 'frontière NB',
			fullBoundary: 'frontière covariance complète',
			probe: 'sonde',
			view: 'Vue',
			spamFilter: 'Filtre anti-spam',
			gauss2d: 'NB gaussien (2D)',
			newEmail: 'Nouveau courriel',
			clickWords: 'Cliquez sur les mots pour les ajouter ou les retirer',
			noWords: 'Aucun mot lu pour l’instant',
			spam: 'spam',
			ham: 'ham',
			prior: 'a priori P(classe)',
			cls: 'classe',
			joint: '= a priori × vraisemblances',
			posterior: '÷ leur somme → a posteriori',
			postAria: 'A posteriori : {spam} spam, {ham} ham',
			logOdds: 'log-cote',
			priorRow: 'a priori',
			total: 'total',
			alpha: 'lissage de Laplace α',
			plotLabel: 'Deux classes avec les ellipses, les courbes en cloche et la frontière de décision du Bayes naïf gaussien',
			dataset: 'Jeu de données',
			spreads: 'Dispersions différentes',
			correlated: 'Corrélées'
		},
		ar: {
			pxClass: 'P(x₁ | الفئة)',
			dragProbe: 'اسحب المسبار ◆',
			nbAcc: 'دقة NB',
			fullAcc: 'دقة التغاير الكامل',
			probeP: 'P(B) للمسبار',
			ellipses: 'القطوع الناقصة الملائمة 1σ / 2σ',
			nbBoundary: 'حد NB',
			fullBoundary: 'حد التغاير الكامل',
			probe: 'المسبار',
			view: 'العرض',
			spamFilter: 'مرشح البريد المزعج',
			gauss2d: 'NB الغاوسي (ثنائي الأبعاد)',
			newEmail: 'بريد جديد',
			clickWords: 'انقر الكلمات لإضافتها أو إزالتها',
			noWords: 'لم تُقرأ أي كلمة بعد',
			spam: 'مزعج',
			ham: 'سليم',
			prior: 'الاحتمال المسبق P(الفئة)',
			cls: 'الفئة',
			joint: '= المسبق × الأرجحيات',
			posterior: '÷ مجموعهما ← الاحتمال اللاحق',
			postAria: 'الاحتمال اللاحق: {spam} مزعج، {ham} سليم',
			logOdds: 'لوغاريتم الأرجحية',
			priorRow: 'المسبق',
			total: 'المجموع',
			alpha: 'تمهيد لابلاس α',
			plotLabel: 'فئتان مع قطوع بايز الساذج الغاوسي الناقصة ومنحنيات الجرس وحد القرار',
			dataset: 'مجموعة البيانات',
			spreads: 'تشتت مختلف',
			correlated: 'مترابطة'
		}
	});

	const f2 = (v: number) => v.toFixed(2);
	const pct = (v: number, d = 0) => `${(v * 100).toFixed(d)}%`;
	const num = (v: number) => (v === 0 ? '0' : v < 0.0001 ? v.toExponential(1) : v < 0.01 ? v.toPrecision(2) : v.toFixed(3));

	/* ================= spam filter ================= */
	const P = $derived(post(s));
	const words = $derived(activeWords(s));
	/** Log-odds bar scale: this many log units fill half the width. */
	const LOG_SPAN = 6;
	const barPct = (v: number) => (Number.isFinite(v) ? clamp((Math.abs(v) / LOG_SPAN) * 50, 0, 50) : 50);
	const logText = (v: number) => (Number.isFinite(v) ? `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(2)}` : v > 0 ? '+∞' : '−∞');

	/* ================= Gaussian NB ================= */
	let dragging = $state(false);
	let map: Mapper | null = null;
	$effect(() => {
		step;
		dragging = false;
	});

	function placeProbe(p: { x: number; y: number }) {
		if (!map) return;
		s.probe = [clamp(map.invX(p.x), -1.3, 1.3), clamp(map.invY(p.y), -1.3, 1.3)];
		const pb = probeB(s);
		if (pb >= 0.35 && pb <= 0.65) s.did.probeEven = true;
	}
	function down(p: { x: number; y: number }) {
		if (!s.ui.probe) return;
		dragging = true;
		placeProbe(p);
	}
	function move(p: { x: number; y: number }) {
		if (dragging) placeProbe(p);
	}
	function up() {
		dragging = false;
	}

	function draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: VizTheme) {
		const m = plotMapper(w, h);
		map = m;
		const g = gnb(s);
		const d = DATA[s.dataset];
		grid(ctx, m, w, h, t);

		if (s.show.regions) {
			const grd = sampleGrid(`gnb|${s.dataset}`, m, w, h, 5, (x, y) => nb.gnbProbB(g, [x, y]));
			shade(ctx, grd, t, (v) => v, 0.3);
			contour(ctx, grd, 0.5, t.text, 2.25);
			if (s.show.full) {
				const q = qda(s);
				const gq = sampleGrid(`qda|${s.dataset}`, m, w, h, 5, (x, y) => nb.qdaProbB(q, [x, y]));
				contour(ctx, gq, 0.5, alpha(t.text, 0.75), 1.75, [6, 4]);
			}
		}

		// fitted axis-aligned Gaussians: 1σ and 2σ ellipses
		if (s.show.gaussians) {
			const sx = m.x(1) - m.x(0);
			const sy = m.y(0) - m.y(1);
			for (const c of [0, 1]) {
				const col = classColor(t, c);
				for (const k of [1, 2]) {
					ctx.strokeStyle = alpha(col, k === 1 ? 0.95 : 0.6);
					ctx.lineWidth = k === 1 ? 2 : 1.25;
					ctx.setLineDash(k === 1 ? [] : [5, 4]);
					ctx.beginPath();
					ctx.ellipse(m.x(g.mean[c][0]), m.y(g.mean[c][1]), k * Math.sqrt(g.var[c][0]) * sx, k * Math.sqrt(g.var[c][1]) * sy, 0, 0, Math.PI * 2);
					ctx.stroke();
				}
				ctx.setLineDash([]);
				ctx.strokeStyle = col;
				ctx.lineWidth = 2;
				const cx = m.x(g.mean[c][0]);
				const cy = m.y(g.mean[c][1]);
				ctx.beginPath();
				ctx.moveTo(cx - 5, cy - 5);
				ctx.lineTo(cx + 5, cy + 5);
				ctx.moveTo(cx + 5, cy - 5);
				ctx.lineTo(cx - 5, cy + 5);
				ctx.stroke();
			}
		}

		// marginal bell curves along the bottom (x₁) and left (x₂) edges
		if (s.show.marginals) {
			const band = Math.min(56, h * 0.16);
			for (const c of [0, 1]) {
				const col = classColor(t, c);
				const peakX = 1 / Math.sqrt(2 * Math.PI * Math.min(g.var[0][0], g.var[1][0]));
				const peakY = 1 / Math.sqrt(2 * Math.PI * Math.min(g.var[0][1], g.var[1][1]));
				ctx.fillStyle = alpha(col, 0.16);
				ctx.strokeStyle = col;
				ctx.lineWidth = 1.75;
				ctx.beginPath();
				for (let px = 0; px <= w; px += 3) {
					const y = h - PAD - (nb.normalPdf(m.invX(px), g.mean[c][0], g.var[c][0]) / peakX) * band;
					if (px) ctx.lineTo(px, y);
					else ctx.moveTo(px, y);
				}
				ctx.lineTo(w, h - PAD);
				ctx.lineTo(0, h - PAD);
				ctx.closePath();
				ctx.fill();
				ctx.beginPath();
				for (let py = 0; py <= h; py += 3) {
					const x = PAD + (nb.normalPdf(m.invY(py), g.mean[c][1], g.var[c][1]) / peakY) * band;
					if (py) ctx.lineTo(x, py);
					else ctx.moveTo(x, py);
				}
				ctx.lineTo(PAD, h);
				ctx.lineTo(PAD, 0);
				ctx.closePath();
				ctx.fill();
				// outline only (no closing edges)
				ctx.beginPath();
				for (let px = 0; px <= w; px += 3) {
					const y = h - PAD - (nb.normalPdf(m.invX(px), g.mean[c][0], g.var[c][0]) / peakX) * band;
					if (px) ctx.lineTo(px, y);
					else ctx.moveTo(px, y);
				}
				ctx.stroke();
				ctx.beginPath();
				for (let py = 0; py <= h; py += 3) {
					const x = PAD + (nb.normalPdf(m.invY(py), g.mean[c][1], g.var[c][1]) / peakY) * band;
					if (py) ctx.lineTo(x, py);
					else ctx.moveTo(x, py);
				}
				ctx.stroke();
			}
			label(ctx, t, L('pxClass'), w - 14, h - PAD - band - 8, { align: 'right', color: t.text3, size: 10 });
		}

		// points
		d.X.forEach((p, i) => {
			const c = d.y[i];
			marker(ctx, m.x(p[0]), m.y(p[1]), c, 3.8, alpha(classColor(t, c), 0.85), t.bg, 1.25);
		});

		if (s.show.probe) {
			const x = m.x(s.probe[0]);
			const y = m.y(s.probe[1]);
			query(ctx, x, y, 8, t.bg, t.text);
			const pb = probeB(s);
			const right = x < w - 160;
			pill(ctx, t, `P(B) = ${pct(pb)} · P(A) = ${pct(1 - pb)}`, x + (right ? 14 : -14), clamp(y - 18, 14, h - 14), { align: right ? 'left' : 'right' });
		}
		if (s.ui.probe && !s.did.probeEven && !dragging && step === 7) pill(ctx, t, L('dragProbe'), w - 14, 24, { align: 'right', color: t.text2 });
		axisNames(ctx, w, h, t);
	}

	const gaussReadouts = $derived.by(() => {
		const g = gnb(s);
		const items: { label: string; value: string; highlight?: boolean }[] = [
			{ label: 'P(A)', value: f2(g.prior[0]) },
			{ label: 'P(B)', value: f2(g.prior[1]) }
		];
		if (s.show.regions) items.push({ label: L('nbAcc'), value: pct(accuracyOf(s)) });
		if (s.show.full) items.push({ label: L('fullAcc'), value: pct(accuracyOf(s, 'qda')) });
		if (s.show.probe) items.push({ label: L('probeP'), value: pct(probeB(s)), highlight: probeB(s) >= 0.35 && probeB(s) <= 0.65 });
		return items;
	});
	const extras = $derived.by(() => {
		const e: { kind: 'ring' | 'line' | 'dash' | 'query'; text: string }[] = [];
		if (s.show.gaussians) e.push({ kind: 'ring', text: L('ellipses') });
		if (s.show.regions) e.push({ kind: 'line', text: L('nbBoundary') });
		if (s.show.full) e.push({ kind: 'dash', text: L('fullBoundary') });
		if (s.show.probe) e.push({ kind: 'query', text: L('probe') });
		return e;
	});
</script>

<div class="scene">
	{#if s.ui.mode}
		<Segmented
			label={L('view')}
			bind:value={s.mode}
			options={[
				{ value: 'text', label: L('spamFilter') },
				{ value: 'gauss', label: L('gauss2d') }
			] as { value: Mode; label: string }[]}
		/>
	{/if}

	{#if s.mode === 'text'}
		<div class="email">
			<div class="email-head">
				<span class="tag">{L('newEmail')}</span>
				<span class="hint">{s.ui.words ? L('clickWords') : L('noWords')}</span>
			</div>
			<div class="chips">
				{#each s.vocab as id (id)}
					{@const w = nb.wordById.get(id)!}
					<button class="chip" class:on={s.on[id]} aria-pressed={!!s.on[id]} disabled={!s.ui.words} onclick={() => toggle(s, id)}>
						<span class="word">{wordLabel(id)}</span>
						<span class="counts">{L('spam')} {w.spam}/{nb.N_SPAM} · {L('ham')} {w.ham}/{nb.N_HAM}</span>
					</button>
				{/each}
			</div>
		</div>

		<div class="table-wrap">
			<table class="calc">
				<thead>
					<tr><th></th><th class="spam">{L('spam')}</th><th class="ham">{L('ham')}</th></tr>
				</thead>
				<tbody>
					<tr><td>{L('prior')}</td><td>{f2(P.prior[0])}</td><td>{f2(P.prior[1])}</td></tr>
					{#each words as w, i (w.id)}
						<tr class:zero={P.lik[i][0] === 0 || P.lik[i][1] === 0}>
							<td><span class="ltr">× P(<b>{wordLabel(w.id)}</b> | {L('cls')})</span></td>
							<td>{num(P.lik[i][0])}</td>
							<td>{num(P.lik[i][1])}</td>
						</tr>
					{/each}
					<tr class="sum"><td>{L('joint')}</td><td>{num(P.joint[0])}</td><td>{num(P.joint[1])}</td></tr>
					<tr class="sum"><td>{L('posterior')}</td><td><b>{pct(P.post[0], 1)}</b></td><td><b>{pct(P.post[1], 1)}</b></td></tr>
				</tbody>
			</table>
		</div>

		<div class="post" role="img" aria-label={L('postAria', { spam: pct(P.post[0], 1), ham: pct(P.post[1], 1) })}>
			<div class="seg spam" style:width="{P.post[0] * 100}%">{#if P.post[0] > 0.12}{L('spam')} {pct(P.post[0])}{/if}</div>
			<div class="seg ham" style:width="{P.post[1] * 100}%">{#if P.post[1] > 0.12}{L('ham')} {pct(P.post[1])}{/if}</div>
		</div>

		{#if s.show.logs}
			<div class="logs" dir="ltr">
				<div class="logs-head"><span>← {L('ham')}</span><span>{L('logOdds')}</span><span>{L('spam')} →</span></div>
				{#each [{ name: L('priorRow'), v: P.priorLogOdds }, ...words.map((w, i) => ({ name: wordLabel(w.id), v: P.wordLogOdds[i] }))] as row (row.name)}
					<div class="lrow">
						<span class="lname">{row.name}</span>
						<div class="track">
							<div class="axis"></div>
							<div class="bar" class:pos={row.v >= 0} class:inf={!Number.isFinite(row.v)} style:width="{barPct(row.v)}%" style:left={row.v >= 0 ? '50%' : `${50 - barPct(row.v)}%`}></div>
						</div>
						<span class="lval">{logText(row.v)}</span>
					</div>
				{/each}
				<div class="lrow total">
					<span class="lname">{L('total')}</span>
					<div class="track">
						<div class="axis"></div>
						<div class="bar" class:pos={P.logOdds >= 0} class:inf={!Number.isFinite(P.logOdds)} style:width="{barPct(P.logOdds)}%" style:left={P.logOdds >= 0 ? '50%' : `${50 - barPct(P.logOdds)}%`}></div>
					</div>
					<span class="lval">{logText(P.logOdds)}</span>
				</div>
			</div>
		{/if}

		{#if s.ui.alpha}
			<div class="controls">
				<Slider label={L('alpha')} bind:value={s.alpha} min={0} max={3} step={0.5} format={(v) => v.toFixed(1)} />
			</div>
		{/if}
	{:else}
		<Canvas
			{draw}
			aspect={0.72}
			minHeight={280}
			maxHeight={440}
			label={L('plotLabel')}
			cursor={s.ui.probe ? (dragging ? 'grabbing' : 'crosshair') : 'default'}
			onpointerdown={down}
			onpointermove={move}
			onpointerup={up}
		/>
		<Legend extra={extras} />
		<Readouts items={gaussReadouts} />
		{#if s.ui.dataset}
			<div class="controls">
				<Segmented
					label={L('dataset')}
					bind:value={s.dataset}
					options={[
						{ value: 'blobs', label: L('spreads') },
						{ value: 'tilted', label: L('correlated') }
					] as { value: Dataset; label: string }[]}
					onchange={(d) => (s.show.full = d === 'tilted')}
				/>
			</div>
		{/if}
	{/if}
</div>

<style>
	.scene {
		display: grid;
		gap: 12px;
		min-width: 0;
	}
	.email {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 12px;
		background: var(--surface);
	}
	.email-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 8px;
		margin-bottom: 10px;
		font-size: 0.75rem;
		color: var(--text-3);
	}
	.tag {
		font-weight: 600;
		color: var(--text-2);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.chip {
		display: grid;
		gap: 2px;
		text-align: start;
		padding: 7px 12px;
		border-radius: var(--radius);
		border: 1px solid var(--border-strong);
		background: var(--surface-2);
		color: var(--text-2);
		cursor: pointer;
		font: inherit;
		transition:
			background 0.15s var(--ease),
			border-color 0.15s var(--ease);
	}
	.chip:disabled {
		cursor: default;
	}
	.chip .word {
		font-weight: 600;
		font-size: 0.9375rem;
		text-decoration: line-through;
		text-decoration-color: color-mix(in srgb, var(--text-3) 60%, transparent);
	}
	.chip .counts {
		font-size: 0.6875rem;
		font-family: var(--font-mono);
		color: var(--text-3);
	}
	.chip.on {
		background: color-mix(in srgb, var(--acc, var(--accent)) 10%, var(--surface));
		border-color: var(--acc, var(--accent));
		color: var(--text);
	}
	.chip.on .word {
		text-decoration: none;
	}
	.table-wrap {
		overflow-x: auto;
	}
	.calc {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8125rem;
	}
	.calc th,
	.calc td {
		padding: 5px 10px;
		text-align: end;
		border-bottom: 1px solid var(--border);
		font-variant-numeric: tabular-nums;
	}
	.calc td:first-child,
	.calc th:first-child {
		text-align: start;
		color: var(--text-2);
	}
	.calc td:not(:first-child) {
		font-family: var(--font-mono);
	}
	.calc th.spam {
		color: var(--viz-3);
	}
	.calc th.ham {
		color: var(--viz-1);
	}
	.calc tr.sum td {
		border-bottom: 0;
	}
	.calc tr.zero td {
		color: var(--viz-4);
		font-weight: 600;
	}
	.post {
		display: flex;
		height: 30px;
		border-radius: var(--radius);
		overflow: hidden;
		border: 1px solid var(--border);
		font-size: 0.8125rem;
		font-weight: 600;
	}
	.seg {
		display: flex;
		align-items: center;
		justify-content: center;
		white-space: nowrap;
		transition: width 0.35s var(--ease);
		color: var(--viz-bg);
	}
	.seg.spam {
		background: var(--viz-3);
	}
	.seg.ham {
		background: var(--viz-1);
	}
	.logs {
		display: grid;
		gap: 6px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 10px 12px;
	}
	.logs-head {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		color: var(--text-3);
		padding: 0 52px 0 78px;
	}
	.lrow {
		display: grid;
		grid-template-columns: 70px 1fr 48px;
		align-items: center;
		gap: 8px;
		font-size: 0.8125rem;
	}
	.lrow.total {
		border-top: 1px solid var(--border);
		padding-top: 6px;
		font-weight: 600;
	}
	.lname {
		color: var(--text-2);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.lval {
		font-family: var(--font-mono);
		text-align: end;
		font-variant-numeric: tabular-nums;
	}
	.track {
		position: relative;
		height: 14px;
	}
	.axis {
		position: absolute;
		inset-inline-start: 50%;
		top: -3px;
		bottom: -3px;
		width: 1px;
		background: var(--border-strong);
	}
	.bar {
		position: absolute;
		top: 0;
		height: 100%;
		border-radius: 3px;
		background: var(--viz-1);
		transition:
			width 0.3s var(--ease),
			left 0.3s var(--ease);
	}
	.bar.pos {
		background: var(--viz-3);
	}
	.bar.inf {
		background-image: repeating-linear-gradient(45deg, transparent 0 4px, color-mix(in srgb, var(--viz-bg) 45%, transparent) 4px 7px);
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
