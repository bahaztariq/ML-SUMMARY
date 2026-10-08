<script lang="ts">
	import { resolve } from '$app/paths';
	import { getConcepts } from '#lib/content.ts';
	import { computeMetrics, formatMetric, metricInfo, presets, type Counts, type MetricKey } from '#lib/tools/metrics.ts';
	import Slider from '#lib/viz/controls/Slider.svelte';
	import ConceptCard from '#lib/components/ConceptCard.svelte';

	const MAX = 1000;
	let counts = $state<Counts>({ ...presets[2].counts });
	let presetId = $state<string | null>(presets[2].id);

	const m = $derived(computeMetrics(counts));
	const preset = $derived(presets.find((p) => p.id === presetId) ?? null);
	const modified = $derived(
		!!preset && (Object.keys(preset.counts) as (keyof Counts)[]).some((k) => preset.counts[k] !== counts[k])
	);
	const focus = $derived(new Set<MetricKey>(preset?.focus ?? []));

	function load(id: string) {
		const p = presets.find((x) => x.id === id)!;
		counts = { ...p.counts };
		presetId = id;
	}

	const cells = [
		{ key: 'tp', abbr: 'TP', name: 'True positive', desc: 'Actually positive, predicted positive', good: true },
		{ key: 'fn', abbr: 'FN', name: 'False negative', desc: 'Missed case (Type II error)', good: false },
		{ key: 'fp', abbr: 'FP', name: 'False positive', desc: 'False alarm (Type I error)', good: false },
		{ key: 'tn', abbr: 'TN', name: 'True negative', desc: 'Actually negative, predicted negative', good: true }
	] as const;

	const fractions = $derived<Partial<Record<MetricKey, string>>>({
		accuracy: `${counts.tp + counts.tn} / ${m.total}`,
		precision: `${counts.tp} / ${counts.tp + counts.fp}`,
		recall: `${counts.tp} / ${counts.tp + counts.fn}`,
		specificity: `${counts.tn} / ${counts.tn + counts.fp}`,
		f1: `${2 * counts.tp} / ${2 * counts.tp + counts.fp + counts.fn}`
	});

	const shade = (n: number) => `${Math.round(6 + 38 * Math.sqrt(m.total ? n / m.total : 0))}%`;
	const nf = new Intl.NumberFormat('en-US');
	const related = getConcepts(['confusion-matrix-concept', 'precision-recall-f1', 'pr-curve', 'roc-auc', 'class-imbalance', 'log-loss']);
</script>

<svelte:head><title>Metrics lab · ML Hub</title></svelte:head>

<div class="container page">
	<a class="back" href={resolve('/tools')}>← Tools</a>
	<header class="head">
		<h1>Confusion matrix & metrics lab</h1>
		<p class="muted">
			Drag the four counts of a binary classifier's confusion matrix and see how every evaluation metric responds.
		</p>
	</header>

	<div class="presets" role="group" aria-label="Scenarios">
		<span class="eyebrow">Scenarios</span>
		{#each presets as p (p.id)}
			<button class="btn btn-sm" class:active={presetId === p.id} aria-pressed={presetId === p.id} onclick={() => load(p.id)}>
				<span aria-hidden="true">{p.icon}</span>
				{p.label}
			</button>
		{/each}
	</div>

	{#if preset}
		<div class="scenario card">
			<div class="scenario-top">
				<strong>{preset.icon} {preset.label}{modified ? ' (modified)' : ''}</strong>
				<span class="focus-tags">
					Watch:
					{#each preset.focus as f (f)}
						<span class="tag">{metricInfo.find((x) => x.key === f)?.name}</span>
					{/each}
				</span>
				{#if modified}
					<button class="btn btn-ghost btn-sm" onclick={() => load(preset.id)}>Reset</button>
				{/if}
			</div>
			<p class="muted">{preset.why}</p>
		</div>
	{/if}

	<div class="lab">
		<section class="matrix-wrap card" aria-label="Confusion matrix">
			<div class="matrix-meta">
				<span>Total <strong>{nf.format(m.total)}</strong></span>
				<span>Actual positives <strong>{formatMetric(m.prevalence)}</strong></span>
			</div>
			<div class="matrix">
				<span class="corner"></span>
				<span class="col-h">Predicted <b>positive</b></span>
				<span class="col-h">Predicted <b>negative</b></span>
				{#each cells as c, i (c.key)}
					{#if i % 2 === 0}
						<span class="row-h">Actual <b>{i === 0 ? 'positive' : 'negative'}</b></span>
					{/if}
					<div class="cell" class:good={c.good} class:bad={!c.good} style:--p={shade(counts[c.key])}>
						<div class="cell-top">
							<span class="abbr">{c.abbr}</span>
							<span class="count">{nf.format(counts[c.key])}</span>
						</div>
						<span class="cell-name">{c.name}</span>
						<span class="cell-desc">{c.desc}</span>
						<div class="cell-slider">
							<Slider label="Adjust {c.abbr}" bind:value={counts[c.key]} min={0} max={MAX} />
						</div>
					</div>
				{/each}
			</div>
		</section>

		<section class="metrics" aria-label="Metrics" aria-live="polite">
			{#each metricInfo as info (info.key)}
				{@const v = m[info.key]}
				<div class="metric card" class:focus={focus.has(info.key)}>
					<div class="metric-top">
						<span class="name">
							{info.name}
							{#if info.alias}<span class="alias">{info.alias}</span>{/if}
						</span>
						<span class="value">{formatMetric(v, info.signed)}</span>
					</div>
					<div class="bar" class:signed={info.signed}>
						{#if v !== null}
							{#if info.signed}
								<span
									class="fill"
									class:neg={v < 0}
									style:left="{v < 0 ? 50 + v * 50 : 50}%"
									style:width="{Math.abs(v) * 50}%"
								></span>
							{:else}
								<span class="fill" style:width="{v * 100}%"></span>
							{/if}
						{/if}
					</div>
					<div class="formula">
						<code>{info.formula}</code>
						{#if fractions[info.key]}<code class="plug">= {fractions[info.key]}</code>{/if}
					</div>
					<p>{info.question}{v === null ? ' Undefined here: its denominator is zero.' : ''}</p>
				</div>
			{/each}
		</section>
	</div>

	<section class="related">
		<h2>Learn the concepts</h2>
		<div class="grid">
			{#each related as c (c.id)}
				<ConceptCard concept={c} compact />
			{/each}
		</div>
	</section>
</div>

<style>
	.page {
		padding-top: 28px;
	}
	.back {
		font-size: 0.875rem;
		color: var(--text-3);
	}
	.back:hover {
		color: var(--text);
	}
	.head {
		display: grid;
		gap: 8px;
		margin: 16px 0 22px;
	}
	.head p {
		max-width: 62ch;
	}
	.presets {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		margin-bottom: 14px;
	}
	.presets .eyebrow {
		margin-right: 4px;
	}
	.presets .active {
		background: var(--accent-soft);
		border-color: var(--accent);
		color: var(--accent);
	}
	.scenario {
		display: grid;
		gap: 6px;
		padding: 14px 16px;
		margin-bottom: 18px;
		border-left: 3px solid var(--accent);
	}
	.scenario-top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 14px;
	}
	.scenario p {
		font-size: 0.9rem;
		max-width: 80ch;
	}
	.focus-tags {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		font-size: 0.8125rem;
		color: var(--text-3);
	}
	.tag {
		padding: 1px 8px;
		border-radius: var(--radius-full);
		background: var(--accent-soft);
		color: var(--accent);
		font-size: 0.75rem;
		font-weight: 600;
	}
	.lab {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
		gap: 16px;
		align-items: start;
	}
	.matrix-wrap {
		padding: 18px;
		display: grid;
		gap: 14px;
	}
	.matrix-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 18px;
		font-size: 0.8125rem;
		color: var(--text-3);
	}
	.matrix-meta strong {
		color: var(--text);
		font-family: var(--font-mono);
		font-weight: 600;
	}
	.matrix {
		display: grid;
		grid-template-columns: 28px 1fr 1fr;
		gap: 8px;
	}
	.col-h,
	.row-h {
		font-size: 0.75rem;
		color: var(--text-3);
		text-align: center;
	}
	.col-h b,
	.row-h b {
		color: var(--text-2);
		font-weight: 600;
	}
	.row-h {
		writing-mode: vertical-rl;
		transform: rotate(180deg);
		align-self: center;
	}
	.cell {
		--tone: var(--success);
		display: grid;
		gap: 2px;
		padding: 14px;
		border-radius: var(--radius);
		border: 1px solid color-mix(in srgb, var(--tone) 30%, var(--border));
		background: color-mix(in srgb, var(--tone) var(--p), var(--surface));
		transition: background 0.2s var(--ease);
	}
	.cell.bad {
		--tone: var(--danger);
	}
	.cell-top {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 8px;
	}
	.abbr {
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--tone);
	}
	.count {
		font-family: var(--font-mono);
		font-size: 1.6rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		line-height: 1.2;
	}
	.cell-name {
		font-weight: 600;
		font-size: 0.875rem;
	}
	.cell-desc {
		font-size: 0.75rem;
		color: var(--text-2);
		min-height: 2.4em;
	}
	.cell-slider {
		display: flex;
		margin-top: 8px;
		--acc: var(--tone);
	}
	.cell-slider :global(.slider) {
		min-width: 0;
	}
	.metrics {
		display: grid;
		gap: 10px;
	}
	.metric {
		display: grid;
		gap: 8px;
		padding: 14px 16px;
		transition: border-color 0.15s var(--ease);
	}
	.metric.focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 1px var(--accent);
	}
	.metric-top {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 10px;
	}
	.name {
		font-weight: 600;
	}
	.alias {
		margin-left: 6px;
		font-size: 0.75rem;
		font-weight: 400;
		color: var(--text-3);
	}
	.value {
		font-family: var(--font-mono);
		font-size: 1.125rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}
	.focus .value {
		color: var(--accent);
	}
	.bar {
		position: relative;
		height: 6px;
		border-radius: 3px;
		background: var(--surface-3);
		overflow: hidden;
	}
	.bar.signed::after {
		content: '';
		position: absolute;
		left: 50%;
		top: 0;
		bottom: 0;
		width: 1px;
		background: var(--text-3);
	}
	.fill {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		background: var(--accent);
		border-radius: 3px;
		transition:
			width 0.2s var(--ease),
			left 0.2s var(--ease);
	}
	.fill.neg {
		background: var(--danger);
	}
	.formula {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 10px;
		font-size: 0.75rem;
		color: var(--text-2);
	}
	.plug {
		color: var(--text-3);
	}
	.metric p {
		font-size: 0.8125rem;
		color: var(--text-2);
	}
	.related {
		margin-top: 40px;
	}
	.related h2 {
		font-size: 1.125rem;
		margin-bottom: 14px;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 10px;
	}
	@media (max-width: 860px) {
		.lab {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 480px) {
		.matrix {
			grid-template-columns: 20px 1fr 1fr;
			gap: 6px;
		}
		.cell {
			padding: 10px;
		}
		.count {
			font-size: 1.25rem;
		}
		.cell-desc {
			display: none;
		}
		.matrix-wrap {
			padding: 12px;
		}
	}
</style>
