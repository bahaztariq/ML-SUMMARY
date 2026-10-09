<script lang="ts">
	import { onDestroy } from 'svelte';
	import { local } from '#lib/i18n/index.svelte.ts';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import type { SceneProps } from '../types.ts';
	import ScoreStrip from '../_classification/ScoreStrip.svelte';
	import Plot from '../_classification/Plot.svelte';
	import Matrix from '../_classification/Matrix.svelte';
	import type { Pt, Rect, Rule } from '../_classification/ink.ts';
	import { averagePrecision, confusion, fpr, pct, precision, recall, rocAuc, sweep, tpr } from '../_classification/metrics.ts';
	import { N_POS, PREVALENCES, TARGET_PRECISION, nNegOf, prevalenceOf, samplesOf, setThr, startTrace, type PCState } from './state.ts';

	let { s = $bindable(), step }: SceneProps<PCState> = $props();

	/** English source strings (typed as plain strings so fr/ar can differ). */
	const EN = {
		baseline: 'baseline = prevalence {v}',
		target: 'precision target {v}',
		fraud: 'fraud ({n})',
		legitimate: 'legitimate ({n})',
		x: 'model score: P(fraud)',
		hint: 'drag the threshold ↔',
		recall: 'recall',
		precision: 'precision',
		prAria: 'Precision-recall curve',
		fprAxis: 'false positive rate',
		tprAxis: 'true positive rate',
		rocAria: 'ROC curve of the same model',
		fraudShort: 'fraud',
		legit: 'legit',
		threshold: 'threshold',
		fraudRate: 'fraud rate',
		pause: '❚❚ Pause',
		trace: '▶ Trace',
		Threshold: 'Threshold',
		FraudRate: 'Fraud rate',
		sep: 'Class separation'
	};
	const L = local({
		en: EN,
		fr: {
			baseline: 'référence = prévalence {v}',
			target: 'objectif de précision {v}',
			fraud: 'fraude ({n})',
			legitimate: 'légitimes ({n})',
			x: 'score du modèle : P(fraude)',
			hint: 'faites glisser le seuil ↔',
			recall: 'rappel',
			precision: 'précision',
			prAria: 'Courbe précision-rappel',
			fprAxis: 'taux de faux positifs',
			tprAxis: 'taux de vrais positifs',
			rocAria: 'Courbe ROC du même modèle',
			fraudShort: 'fraude',
			legit: 'légitime',
			threshold: 'seuil',
			fraudRate: 'taux de fraude',
			pause: '❚❚ Pause',
			trace: '▶ Tracer',
			Threshold: 'Seuil',
			FraudRate: 'Taux de fraude',
			sep: 'Séparation des classes'
		},
		ar: {
			baseline: 'خط الأساس = نسبة الانتشار {v}',
			target: 'هدف الضبط {v}',
			fraud: 'احتيال ({n})',
			legitimate: 'مشروعة ({n})',
			x: 'درجة النموذج: P(احتيال)',
			hint: 'اسحب العتبة ↔',
			recall: 'الاستدعاء',
			precision: 'الضبط',
			prAria: 'منحنى الضبط-الاستدعاء',
			fprAxis: 'معدل الإيجابيات الخاطئة',
			tprAxis: 'معدل الإيجابيات الصحيحة',
			rocAria: 'منحنى ROC للنموذج نفسه',
			fraudShort: 'احتيال',
			legit: 'مشروعة',
			threshold: 'العتبة',
			fraudRate: 'معدل الاحتيال',
			pause: '❚❚ إيقاف مؤقت',
			trace: '▶ ارسم',
			Threshold: 'العتبة',
			FraudRate: 'معدل الاحتيال',
			sep: 'الفصل بين الفئات'
		}
	});

	const samples = $derived(samplesOf(s));
	const pts = $derived(sweep(samples));
	const ap = $derived(averagePrecision(pts));
	const auc = $derived(rocAuc(pts));
	const c = $derived(confusion(samples, s.thr));
	const P = $derived(precision(c));
	const R = $derived(recall(c));
	const prev = $derived(prevalenceOf(s));

	const prCurve = $derived.by((): Pt[] => {
		if (s.show.curve === 'none') return [];
		const shown = (s.show.curve === 'trace' ? pts.filter((p) => p.thr >= s.reached) : pts).slice(1);
		return shown.map((p) => [p.recall, p.precision]);
	});
	const rocCurve = $derived<Pt[]>(pts.map((p) => [p.fpr, p.tpr]));

	const apRects = $derived.by((): Rect[] => {
		if (!s.show.ap) return [];
		const out: Rect[] = [];
		for (let i = 1; i < pts.length; i++) {
			if (pts[i].recall > pts[i - 1].recall) out.push({ x0: pts[i - 1].recall, x1: pts[i].recall, y0: 0, y1: pts[i].precision, ink: 'accent', a: 0.13 });
		}
		return out;
	});

	const hlines = $derived.by(() => {
		const h: Rule[] = [];
		if (s.show.baseline) h.push({ at: prev, ink: 'text3', label: L('baseline', { v: pct(prev, 0) }) });
		if (s.show.target) h.push({ at: TARGET_PRECISION, ink: 2, label: L('target', { v: pct(TARGET_PRECISION, 0) }) });
		return h;
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
		posLabel={L('fraud', { n: N_POS })}
		negLabel={L('legitimate', { n: nNegOf(s) })}
		xLabel={L('x')}
		hint={s.did.drag ? '' : L('hint')}
	/>

	<div class="row">
		<div class="panel">
			<Plot
				xLabel={L('recall')}
				yLabel={L('precision')}
				square
				series={prCurve.length ? [{ pts: prCurve, ink: 'accent', width: 2 }] : []}
				rects={apRects}
				{hlines}
				markers={[{ x: R, y: P, ink: 'accent', r: 5.5, ring: true }]}
				note={s.show.ap ? `AP = ${ap.toFixed(3)}` : ''}
				aspect={0.86}
				minHeight={230}
				maxHeight={300}
				ariaLabel={L('prAria')}
			/>
		</div>
		{#if s.show.roc}
			<div class="panel">
				<Plot
					xLabel={L('fprAxis')}
					yLabel={L('tprAxis')}
					square
					diagonal
					series={[{ pts: rocCurve, ink: 5, width: 2, fill: 0.1 }]}
					markers={[{ x: fpr(c), y: tpr(c), ink: 5, r: 5.5, ring: true }]}
					note={`ROC AUC = ${auc.toFixed(3)}`}
					aspect={0.86}
					minHeight={230}
					maxHeight={300}
					ariaLabel={L('rocAria')}
				/>
			</div>
		{/if}
		{#if s.show.matrix}
			<div class="panel matrix">
				<Matrix counts={c} posLabel={L('fraudShort')} negLabel={L('legit')} />
			</div>
		{/if}
	</div>

	<Readouts
		items={[
			{ label: L('threshold'), value: s.thr.toFixed(2) },
			{ label: L('precision'), value: pct(P), highlight: s.show.target && P >= TARGET_PRECISION },
			{ label: L('recall'), value: pct(R) },
			{ label: L('fraudRate'), value: pct(prev, 0) },
			...(s.show.ap ? [{ label: 'AP', value: ap.toFixed(3), highlight: true }] : []),
			...(s.show.roc ? [{ label: 'ROC AUC', value: auc.toFixed(3) }] : [])
		]}
	/>

	{#if Object.values(s.ui).some(Boolean)}
		<div class="controls">
			{#if s.ui.trace}
				<button class="btn btn-sm btn-primary" onclick={trace}>{playing ? L('pause') : L('trace')}</button>
			{/if}
			{#if s.ui.drag}
				<Slider label={L('Threshold')} bind:value={s.thr} min={0} max={1} step={0.01} format={(v) => v.toFixed(2)} oninput={(v) => (stop(), setThr(s, v))} />
			{/if}
			{#if s.ui.prev}
				<Slider label={L('FraudRate')} bind:value={s.prev} min={0} max={PREVALENCES.length - 1} format={(i) => pct(PREVALENCES[i], 0)} />
			{/if}
			{#if s.ui.sep}
				<Slider label={L('sep')} bind:value={s.sep} min={0} max={5} step={0.1} format={(v) => v.toFixed(1) + ' σ'} />
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
	.matrix {
		align-self: center;
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
