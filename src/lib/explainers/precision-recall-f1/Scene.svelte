<script lang="ts">
	import { local } from '#lib/i18n/index.svelte.ts';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import type { SceneProps } from '../types.ts';
	import ScoreStrip from '../_classification/ScoreStrip.svelte';
	import Matrix from '../_classification/Matrix.svelte';
	import Plot from '../_classification/Plot.svelte';
	import type { Marker, Rule, Series } from '../_classification/ink.ts';
	import { arithmeticMean, confusion, fbeta, pct, precision, recall } from '../_classification/metrics.ts';
	import { TARGET_RECALL, curves, focusCells, samplesOf, setThr, type Beta, type PRState } from './state.ts';

	let { s = $bindable() }: SceneProps<PRState> = $props();

	/** English source strings (typed as plain strings so fr/ar can differ). */
	const EN = {
		defective: 'defective ({n})',
		good: 'good ({n})',
		x: 'model score: P(defective)',
		hint: 'drag the threshold ↔',
		defect: 'defect',
		goodShort: 'good',
		target: 'recall target {v}',
		Precision: 'Precision',
		Recall: 'Recall',
		arith: 'Arithmetic mean',
		harm: 'Harmonic mean ({f})',
		precision: 'precision',
		recall: 'recall',
		threshold: 'threshold',
		score: 'score',
		aria: 'Precision, recall and F-score at every threshold',
		Threshold: 'Threshold',
		beta: 'β (recall weight)'
	};
	const L = local({
		en: EN,
		fr: {
			defective: 'défectueuses ({n})',
			good: 'bonnes ({n})',
			x: 'score du modèle : P(défectueuse)',
			hint: 'faites glisser le seuil ↔',
			defect: 'défaut',
			goodShort: 'bonne',
			target: 'objectif de rappel {v}',
			Precision: 'Précision',
			Recall: 'Rappel',
			arith: 'Moyenne arithmétique',
			harm: 'Moyenne harmonique ({f})',
			precision: 'précision',
			recall: 'rappel',
			threshold: 'seuil',
			score: 'score',
			aria: 'Précision, rappel et F-score à chaque seuil',
			Threshold: 'Seuil',
			beta: 'β (poids du rappel)'
		},
		ar: {
			defective: 'معيبة ({n})',
			good: 'سليمة ({n})',
			x: 'درجة النموذج: P(معيبة)',
			hint: 'اسحب العتبة ↔',
			defect: 'معيبة',
			goodShort: 'سليمة',
			target: 'هدف الاستدعاء {v}',
			Precision: 'الضبط',
			Recall: 'الاستدعاء',
			arith: 'المتوسط الحسابي',
			harm: 'المتوسط التوافقي ({f})',
			precision: 'الضبط',
			recall: 'الاستدعاء',
			threshold: 'العتبة',
			score: 'القيمة',
			aria: 'الضبط والاستدعاء ومقياس F عند كل عتبة',
			Threshold: 'العتبة',
			beta: 'β (وزن الاستدعاء)'
		}
	});

	const samples = samplesOf();
	const c = $derived(confusion(samples, s.thr));
	const P = $derived(precision(c));
	const R = $derived(recall(c));
	const F = $derived(fbeta(c, s.beta));
	const fName = $derived(s.beta === 1 ? 'F1' : `F${s.beta}`);
	const lines = $derived(curves(s.beta));

	const series = $derived.by(() => {
		const out: Series[] = [
			{ pts: lines.P, ink: 0, width: 2 },
			{ pts: lines.R, ink: 2, width: 2 }
		];
		if (s.show.f) out.push({ pts: lines.F, ink: 1, width: 2.5 });
		return out;
	});
	const markers = $derived.by(() => {
		const m: Marker[] = [
			{ x: s.thr, y: P, ink: 0, r: 4.5 },
			{ x: s.thr, y: R, ink: 2, r: 4.5 }
		];
		if (s.show.f) m.push({ x: s.thr, y: F, ink: 1, r: 4.5 });
		return m;
	});
	const hlines = $derived<Rule[]>(s.show.target ? [{ at: TARGET_RECALL, ink: 2, label: L('target', { v: pct(TARGET_RECALL, 0) }) }] : []);

	const bars = $derived([
		{ id: 'p', name: L('Precision'), v: P, ink: 'var(--viz-1)' },
		{ id: 'r', name: L('Recall'), v: R, ink: 'var(--viz-3)' },
		{ id: 'am', name: L('arith'), v: arithmeticMean(P, R), ink: 'var(--text-3)' },
		{ id: 'hm', name: L('harm', { f: fName }), v: F, ink: 'var(--viz-2)' }
	]);
</script>

<div class="scene">
	<ScoreStrip
		{samples}
		thr={s.thr}
		colorBy="outcome"
		focus={focusCells(s)}
		draggable={s.ui.drag}
		onthr={(v) => setThr(s, v)}
		posLabel={L('defective', { n: 40 })}
		negLabel={L('good', { n: 80 })}
		xLabel={L('x')}
		hint={s.did.drag ? '' : L('hint')}
	/>

	<div class="row">
		<div class="panel">
			<Matrix counts={c} posLabel={L('defect')} negLabel={L('goodShort')} focus={focusCells(s)} />
		</div>
		{#if s.show.means}
			<div class="panel means">
				{#each bars as b (b.id)}
					<div class="m">
						<span class="mname">{b.name}</span>
						<span class="mv">{pct(b.v)}</span>
						<span class="meter"><span style:width="{(Number.isFinite(b.v) ? b.v : 0) * 100}%" style:background={b.ink}></span></span>
					</div>
				{/each}
			</div>
		{/if}
		{#if s.show.curves}
			<div class="panel">
				<div class="legend">
					<span style:--c="var(--viz-1)">{L('precision')}</span>
					<span style:--c="var(--viz-3)">{L('recall')}</span>
					{#if s.show.f}<span style:--c="var(--viz-2)">{fName}</span>{/if}
				</div>
				<Plot
					xLabel={L('threshold')}
					yLabel={L('score')}
					yFormat={(v) => `${Math.round(v * 100)}%`}
					{series}
					{markers}
					{hlines}
					vlines={[{ at: s.thr, ink: 'accent', dash: [2, 3] }]}
					onpick={(x) => setThr(s, Math.round(x * 100) / 100)}
					aspect={0.62}
					minHeight={180}
					maxHeight={230}
					ariaLabel={L('aria')}
				/>
			</div>
		{/if}
	</div>

	<Readouts
		items={[
			{ label: L('threshold'), value: s.thr.toFixed(2) },
			{ label: L('precision'), value: pct(P), highlight: s.focus === 'precision' },
			{ label: L('recall'), value: pct(R), highlight: s.focus === 'recall' || (s.show.target && R >= TARGET_RECALL) },
			...(s.show.means || s.show.f ? [{ label: fName, value: pct(F) }] : [])
		]}
	/>

	{#if s.ui.drag || s.ui.beta}
		<div class="controls">
			{#if s.ui.drag}
				<Slider label={L('Threshold')} bind:value={s.thr} min={0} max={1} step={0.01} format={(v) => v.toFixed(2)} oninput={(v) => setThr(s, v)} />
			{/if}
			{#if s.ui.beta}
				<Segmented
					label={L('beta')}
					bind:value={s.beta}
					options={[
						{ value: 0.5 as Beta, label: '0.5' },
						{ value: 1 as Beta, label: '1' },
						{ value: 2 as Beta, label: '2' }
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
	.means {
		display: grid;
		gap: 9px;
		padding: 4px 2px;
	}
	.m {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 3px 8px;
		font-size: 0.8125rem;
	}
	.mname {
		font-weight: 600;
	}
	.mv {
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
		font-weight: 600;
	}
	.meter {
		grid-column: 1 / -1;
		height: 6px;
		border-radius: 3px;
		background: var(--surface-3);
		overflow: hidden;
	}
	.meter span {
		display: block;
		height: 100%;
		transition: width 0.15s var(--ease);
	}
	.legend {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
		font-size: 0.75rem;
		color: var(--text-2);
		margin-bottom: 2px;
	}
	.legend span::before {
		content: '';
		display: inline-block;
		width: 12px;
		height: 3px;
		border-radius: 2px;
		margin-inline-end: 5px;
		vertical-align: middle;
		background: var(--c);
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
