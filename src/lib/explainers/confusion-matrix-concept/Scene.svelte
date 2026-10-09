<script lang="ts">
	import { local } from '#lib/i18n/index.svelte.ts';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import Segmented from '#lib/viz/controls/Segmented.svelte';
	import Readouts from '#lib/viz/controls/Readouts.svelte';
	import type { SceneProps } from '../types.ts';
	import ScoreStrip from '../_classification/ScoreStrip.svelte';
	import Matrix from '../_classification/Matrix.svelte';
	import Plot from '../_classification/Plot.svelte';
	import { accuracy, confusion, pct, precision, recall, specificity } from '../_classification/metrics.ts';
	import { cheapest, costCurve, costOf, samplesOf, setThr, words, type CMState, type DataKind, type Scenario } from './state.ts';

	let { s = $bindable() }: SceneProps<CMState> = $props();

	/** English source strings (typed as plain strings so fr/ar can differ). */
	const EN = {
		'medical.pos': 'sick',
		'medical.neg': 'healthy',
		'medical.x': 'model score: P(sick)',
		'medical.flagged': 'flagged sick',
		'spam.pos': 'spam',
		'spam.neg': 'legit',
		'spam.x': 'model score: P(spam)',
		'spam.flagged': 'flagged spam',
		actually: 'actually {c} ({n})',
		hint: 'drag the threshold ↔',
		accuracy: 'Accuracy',
		precision: 'Precision',
		recall: 'Recall',
		specificity: 'Specificity',
		all: 'all',
		threshold: 'threshold',
		totalCost: 'total cost',
		cheapest: 'cheapest',
		costAria: 'Total cost of mistakes at each threshold',
		accuracyLow: 'accuracy',
		Threshold: 'Threshold',
		quality: 'Model quality',
		scenario: 'Scenario',
		screening: 'Screening',
		spamFilter: 'Spam filter',
		positives: 'Positives'
	};
	const L = local({
		en: EN,
		fr: {
			'medical.pos': 'malade',
			'medical.neg': 'sain',
			'medical.x': 'score du modèle : P(malade)',
			'medical.flagged': 'signalés malades',
			'spam.pos': 'spam',
			'spam.neg': 'légitime',
			'spam.x': 'score du modèle : P(spam)',
			'spam.flagged': 'signalés spam',
			actually: 'réellement {c} ({n})',
			hint: 'faites glisser le seuil ↔',
			accuracy: 'Exactitude',
			precision: 'Précision',
			recall: 'Rappel',
			specificity: 'Spécificité',
			all: 'total',
			threshold: 'seuil',
			totalCost: 'coût total',
			cheapest: 'le moins cher',
			costAria: 'Coût total des erreurs à chaque seuil',
			accuracyLow: 'exactitude',
			Threshold: 'Seuil',
			quality: 'Qualité du modèle',
			scenario: 'Scénario',
			screening: 'Dépistage',
			spamFilter: 'Filtre anti-spam',
			positives: 'Positifs'
		},
		ar: {
			'medical.pos': 'مريض',
			'medical.neg': 'سليم',
			'medical.x': 'درجة النموذج: P(مريض)',
			'medical.flagged': 'المُصنَّفون مرضى',
			'spam.pos': 'مزعج',
			'spam.neg': 'سليم',
			'spam.x': 'درجة النموذج: P(spam)',
			'spam.flagged': 'المُصنَّفة مزعجة',
			actually: '{c} فعلياً ({n})',
			hint: 'اسحب العتبة ↔',
			accuracy: 'الدقة',
			precision: 'الضبط',
			recall: 'الاستدعاء',
			specificity: 'النوعية',
			all: 'الكل',
			threshold: 'العتبة',
			totalCost: 'التكلفة الإجمالية',
			cheapest: 'الأقل تكلفة',
			costAria: 'التكلفة الإجمالية للأخطاء عند كل عتبة',
			accuracyLow: 'الدقة',
			Threshold: 'العتبة',
			quality: 'جودة النموذج',
			scenario: 'السيناريو',
			screening: 'الفحص الطبي',
			spamFilter: 'مرشّح البريد المزعج',
			positives: 'الإيجابيات'
		}
	});
	const pos = $derived(L(`${s.scenario}.pos`));
	const neg = $derived(L(`${s.scenario}.neg`));

	const samples = $derived(samplesOf(s));
	const c = $derived(confusion(samples, s.thr));
	const w = $derived(words(s));
	const curve = $derived(s.show.cost ? costCurve(s) : []);
	const best = $derived(s.show.cost ? cheapest(s) : null);
	const total = $derived(c.tp + c.fp + c.fn + c.tn);

	const metrics = $derived([
		{ id: 'acc', name: L('accuracy'), f: `(TP+TN) / ${L('all')}`, v: accuracy(c) },
		{ id: 'p', name: L('precision'), f: 'TP / (TP+FP)', v: precision(c) },
		{ id: 'r', name: L('recall'), f: 'TP / (TP+FN)', v: recall(c) },
		{ id: 'spec', name: L('specificity'), f: 'TN / (TN+FP)', v: specificity(c) }
	]);
</script>

<div class="scene">
	<ScoreStrip
		{samples}
		thr={s.show.threshold ? s.thr : null}
		colorBy={s.show.outcomes ? 'outcome' : 'class'}
		draggable={s.ui.drag}
		onthr={(v) => setThr(s, v)}
		posLabel={L('actually', { c: pos, n: c.tp + c.fn })}
		negLabel={L('actually', { c: neg, n: c.fp + c.tn })}
		xLabel={L(`${s.scenario}.x`)}
		hint={s.did.drag ? '' : L('hint')}
	/>

	{#if s.show.matrix || s.show.metrics || s.show.cost}
		<div class="row">
			{#if s.show.matrix}
				<div class="panel">
					<Matrix counts={c} posLabel={pos} negLabel={neg} costs={s.show.cost ? w.costs : null} />
				</div>
			{/if}
			{#if s.show.metrics}
				<div class="panel metrics">
					{#each metrics as m (m.id)}
						<div class="metric">
							<span class="mname">{m.name}</span>
							<span class="mf" dir="ltr">{m.f}</span>
							<span class="mv">{pct(m.v)}</span>
							<span class="meter"><span style:width="{(Number.isFinite(m.v) ? m.v : 0) * 100}%"></span></span>
						</div>
					{/each}
				</div>
			{/if}
			{#if s.show.cost && best}
				<div class="panel">
					<Plot
						xLabel={L('threshold')}
						yLabel={L('totalCost')}
						yDomain={[0, Math.max(...curve.map((p) => p[1])) * 1.05]}
						yFormat={(v) => v.toFixed(0)}
						series={[{ pts: curve, ink: 'accent', fill: 0.08 }]}
						vlines={[{ at: s.thr, ink: 'accent', dash: [2, 3] }]}
						markers={[
							{ x: best.thr, y: best.cost, ink: 'tp', r: 4, label: L('cheapest'), side: best.thr > 0.6 ? 'left' : 'right' },
							{ x: s.thr, y: costOf(s), ink: 'accent', r: 5, ring: true }
						]}
						onpick={(x) => setThr(s, Math.round(x * 100) / 100)}
						aspect={0.62}
						minHeight={170}
						maxHeight={220}
						ariaLabel={L('costAria')}
					/>
				</div>
			{/if}
		</div>
	{/if}

	<div class="bar">
		<Readouts
			items={[
				...(s.show.threshold ? [{ label: L('threshold'), value: s.thr.toFixed(2) }] : []),
				...(s.show.threshold ? [{ label: L(`${s.scenario}.flagged`), value: `${c.tp + c.fp} / ${total}` }] : []),
				...(s.show.outcomes ? [{ label: L('accuracyLow'), value: pct(accuracy(c)) }] : []),
				...(s.show.cost ? [{ label: L('totalCost'), value: String(costOf(s)), highlight: best !== null && costOf(s) <= best.cost }] : [])
			]}
		/>
	</div>

	{#if s.ui.drag || s.ui.scenario || s.ui.data || s.ui.sep}
		<div class="controls">
			{#if s.ui.drag}
				<Slider label={L('Threshold')} bind:value={s.thr} min={0} max={1} step={0.01} format={(v) => v.toFixed(2)} oninput={(v) => setThr(s, v)} />
			{/if}
			{#if s.ui.sep}
				<Slider label={L('quality')} bind:value={s.sep} min={0} max={4} step={0.1} format={(v) => v.toFixed(1) + ' σ'} />
			{/if}
			{#if s.ui.scenario}
				<Segmented
					label={L('scenario')}
					bind:value={s.scenario}
					options={[
						{ value: 'medical' as Scenario, label: L('screening') },
						{ value: 'spam' as Scenario, label: L('spamFilter') }
					]}
				/>
			{/if}
			{#if s.ui.data}
				<Segmented
					label={L('positives')}
					bind:value={s.data}
					options={[
						{ value: 'balanced' as DataKind, label: '50%' },
						{ value: 'rare' as DataKind, label: '5%' }
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
	.metrics {
		display: grid;
		gap: 8px;
		padding: 4px 2px;
	}
	.metric {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: baseline;
		gap: 2px 8px;
		font-size: 0.8125rem;
	}
	.mname {
		font-weight: 600;
	}
	.mf {
		color: var(--text-3);
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.mv {
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
		font-weight: 600;
	}
	.bar {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.meter {
		grid-column: 1 / -1;
		height: 4px;
		border-radius: 2px;
		background: var(--surface-3);
		overflow: hidden;
		display: block;
	}
	.meter span {
		display: block;
		height: 100%;
		background: var(--acc, var(--accent));
		transition: width 0.15s var(--ease);
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
