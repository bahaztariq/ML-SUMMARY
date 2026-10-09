<script lang="ts">
	import { onDestroy } from 'svelte';
	import { local } from '#lib/i18n/index.svelte.ts';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import type { SceneProps } from '../types.ts';
	import ScoreStrip from '../_classification/ScoreStrip.svelte';
	import Plot from '../_classification/Plot.svelte';
	import type { Marker, Pt } from '../_classification/ink.ts';
	import { confusion, fpr, pairAt, pct, rocAuc, sweep, tpr } from '../_classification/metrics.ts';
	import { MAX_PAIRS, N_NEG, N_POS, drawPairs, samplesOf, setSep, setThr, startTrace, type ROCState } from './state.ts';

	let { s = $bindable(), step }: SceneProps<ROCState> = $props();

	/** English source strings (typed as plain strings so fr/ar can differ). */
	const EN = {
		above: 'threshold above every score',
		below: 'below every score',
		perfect: 'perfect',
		defaulted: 'defaulted ({n})',
		repaid: 'repaid ({n})',
		x: 'model score: P(default)',
		hint: 'drag the threshold ↔',
		fprAxis: 'false positive rate (FPR)',
		tprAxis: 'true positive rate (TPR)',
		rocAria: 'ROC curve: true positive rate against false positive rate',
		pairsAxis: 'random pairs drawn',
		shareAxis: 'share ranked correctly',
		pairsAria: 'Running share of random positive-negative pairs ranked correctly',
		threshold: 'threshold',
		pairsCorrect: 'pairs correct',
		pause: '❚❚ Pause',
		trace: '▶ Trace',
		drawPair: 'Draw a pair',
		plus100: '+100 pairs',
		reset: 'Reset',
		Threshold: 'Threshold',
		sep: 'Class separation',
		scores: 'Scores',
		raw: 'raw',
		cubed: 'cubed'
	};
	const L = local({
		en: EN,
		fr: {
			above: 'seuil au-dessus de tous les scores',
			below: 'sous tous les scores',
			perfect: 'parfait',
			defaulted: 'défaut de paiement ({n})',
			repaid: 'remboursés ({n})',
			x: 'score du modèle : P(défaut)',
			hint: 'faites glisser le seuil ↔',
			fprAxis: 'taux de faux positifs (FPR)',
			tprAxis: 'taux de vrais positifs (TPR)',
			rocAria: 'Courbe ROC : taux de vrais positifs en fonction du taux de faux positifs',
			pairsAxis: 'paires tirées au hasard',
			shareAxis: 'part bien classée',
			pairsAria: 'Part cumulée des paires positif-négatif tirées au hasard qui sont bien classées',
			threshold: 'seuil',
			pairsCorrect: 'paires correctes',
			pause: '❚❚ Pause',
			trace: '▶ Tracer',
			drawPair: 'Tirer une paire',
			plus100: '+100 paires',
			reset: 'Réinitialiser',
			Threshold: 'Seuil',
			sep: 'Séparation des classes',
			scores: 'Scores',
			raw: 'bruts',
			cubed: 'au cube'
		},
		ar: {
			above: 'عتبة فوق كل الدرجات',
			below: 'تحت كل الدرجات',
			perfect: 'مثالي',
			defaulted: 'متعثّرون ({n})',
			repaid: 'سدّدوا ({n})',
			x: 'درجة النموذج: P(تعثّر)',
			hint: 'اسحب العتبة ↔',
			fprAxis: 'معدل الإيجابيات الخاطئة (FPR)',
			tprAxis: 'معدل الإيجابيات الصحيحة (TPR)',
			rocAria: 'منحنى ROC: معدل الإيجابيات الصحيحة مقابل معدل الإيجابيات الخاطئة',
			pairsAxis: 'الأزواج العشوائية المسحوبة',
			shareAxis: 'نسبة الترتيب الصحيح',
			pairsAria: 'النسبة المتراكمة للأزواج العشوائية (إيجابي، سلبي) المرتبة ترتيباً صحيحاً',
			threshold: 'العتبة',
			pairsCorrect: 'أزواج صحيحة',
			pause: '❚❚ إيقاف مؤقت',
			trace: '▶ ارسم',
			drawPair: 'اسحب زوجاً',
			plus100: '+100 زوج',
			reset: 'إعادة ضبط',
			Threshold: 'العتبة',
			sep: 'الفصل بين الفئات',
			scores: 'الدرجات',
			raw: 'خام',
			cubed: 'مكعّبة'
		}
	});

	const samples = $derived(samplesOf(s));
	const pts = $derived(sweep(samples));
	const auc = $derived(rocAuc(pts));
	const c = $derived(confusion(samples, s.thr));
	const TPR = $derived(tpr(c));
	const FPR = $derived(fpr(c));

	const curve = $derived.by((): Pt[] => {
		if (s.show.curve === 'none') return [];
		const shown = s.show.curve === 'trace' ? pts.filter((p) => p.thr >= s.reached) : pts;
		return shown.map((p) => [p.fpr, p.tpr]);
	});

	const markers = $derived.by(() => {
		const m: Marker[] = [];
		if (s.show.corners) {
			m.push(
				{ x: 0, y: 0, ink: 'text2', r: 3.5, label: L('above'), side: 'right' },
				{ x: 1, y: 1, ink: 'text2', r: 3.5, label: L('below'), side: 'left' },
				{ x: 0, y: 1, ink: 'tp', r: 3.5, label: L('perfect'), side: 'right' }
			);
		}
		m.push({ x: FPR, y: TPR, ink: 'accent', r: 5.5, ring: true, label: s.show.corners ? undefined : `t = ${s.thr.toFixed(2)}` });
		return m;
	});

	/* ---- random pairs: running estimate of P(positive outranks negative) ---- */
	const pairInfo = $derived.by(() => {
		const n = s.pairs;
		const every = Math.max(1, Math.floor(n / 300));
		const run: Pt[] = [];
		let w = 0;
		for (let k = 0; k < n; k++) {
			const [i, j] = pairAt(k, N_POS, N_NEG);
			const a = samples[i].score;
			const b = samples[j].score;
			w += a > b ? 1 : a === b ? 0.5 : 0;
			if ((k + 1) % every === 0 || k === n - 1) run.push([k + 1, w / (k + 1)]);
		}
		return { wins: w, run, last: n > 0 ? pairAt(n - 1, N_POS, N_NEG) : null };
	});

	/* ---- trace animation ---- */
	let playing = $state(false);
	let timer: ReturnType<typeof setInterval> | undefined;
	function trace() {
		if (playing) return stop();
		startTrace(s);
		playing = true;
		timer = setInterval(() => {
			const next = Math.max(0, Math.round((s.thr - 0.01) * 100) / 100);
			setThr(s, next);
			if (next <= 0) stop();
		}, 35);
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
</script>

<div class="scene">
	<ScoreStrip
		{samples}
		thr={s.thr}
		colorBy="outcome"
		draggable={s.ui.drag}
		onthr={(v) => (stop(), setThr(s, v))}
		pair={s.show.pairs ? pairInfo.last : null}
		posLabel={L('defaulted', { n: N_POS })}
		negLabel={L('repaid', { n: N_NEG })}
		xLabel={L('x')}
		hint={s.did.drag ? '' : L('hint')}
	/>

	{#if s.show.roc || s.show.pairs}
		<div class="row">
			{#if s.show.roc}
				<div class="panel">
					<Plot
						xLabel={L('fprAxis')}
						yLabel={L('tprAxis')}
						square
						diagonal
						series={curve.length ? [{ pts: curve, ink: 'accent', width: 2.5, fill: s.show.area ? 0.14 : 0 }] : []}
						{markers}
						note={s.show.area ? `AUC = ${auc.toFixed(3)}` : ''}
						aspect={0.86}
						minHeight={230}
						maxHeight={300}
						ariaLabel={L('rocAria')}
					/>
				</div>
			{/if}
			{#if s.show.pairs}
				<div class="panel">
					<Plot
						xLabel={L('pairsAxis')}
						yLabel={L('shareAxis')}
						xDomain={[0, Math.max(100, s.pairs)]}
						xFormat={(v) => v.toFixed(0)}
						yFormat={(v) => `${Math.round(v * 100)}%`}
						series={pairInfo.run.length ? [{ pts: pairInfo.run, ink: 1, width: 2 }] : []}
						hlines={[{ at: auc, ink: 'accent', label: `AUC ${auc.toFixed(3)}` }]}
						aspect={0.86}
						minHeight={230}
						maxHeight={300}
						ariaLabel={L('pairsAria')}
					/>
				</div>
			{/if}
		</div>
	{/if}

	<Readouts
		items={[
			{ label: L('threshold'), value: s.thr.toFixed(2) },
			{ label: 'TPR', value: pct(TPR) },
			{ label: 'FPR', value: pct(FPR) },
			...(s.show.area ? [{ label: 'AUC', value: auc.toFixed(3), highlight: true }] : []),
			...(s.show.pairs && s.pairs ? [{ label: L('pairsCorrect'), value: `${pairInfo.wins} / ${s.pairs}` }] : [])
		]}
	/>

	{#if Object.values(s.ui).some(Boolean)}
		<div class="controls">
			{#if s.ui.trace || s.ui.pairs}
				<div class="buttons">
					{#if s.ui.trace}
						<button class="btn btn-sm btn-primary" onclick={trace}>{playing ? L('pause') : L('trace')}</button>
					{/if}
					{#if s.ui.pairs}
						<button class="btn btn-sm" onclick={() => drawPairs(s, 1)} disabled={s.pairs >= MAX_PAIRS}>{L('drawPair')}</button>
						<button class="btn btn-sm" onclick={() => drawPairs(s, 100)} disabled={s.pairs >= MAX_PAIRS}>{L('plus100')}</button>
						<button class="btn btn-sm btn-ghost" onclick={() => (s.pairs = 0)} disabled={!s.pairs}>{L('reset')}</button>
					{/if}
				</div>
			{/if}
			{#if s.ui.drag}
				<Slider label={L('Threshold')} bind:value={s.thr} min={0} max={1} step={0.01} format={(v) => v.toFixed(2)} oninput={(v) => (stop(), setThr(s, v))} />
			{/if}
			{#if s.ui.sep}
				<Slider label={L('sep')} bind:value={s.sep} min={0} max={6} step={0.1} format={(v) => v.toFixed(1) + ' σ'} oninput={(v) => setSep(s, v)} />
			{/if}
			{#if s.ui.warp}
				<Segmented
					label={L('scores')}
					bind:value={s.warp}
					options={[
						{ value: 1, label: L('raw') },
						{ value: 3, label: L('cubed') }
					]}
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
	.row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 12px;
		align-items: start;
	}
	.panel {
		min-width: 0;
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
