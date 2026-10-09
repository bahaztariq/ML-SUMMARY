<!--
  2×2 confusion matrix. Rows = true class, columns = prediction, positive first:
  [[TP, FN], [FP, TN]]. Cell colors match the dots in ScoreStrip.
-->
<script lang="ts">
	import { local } from '#lib/i18n/index.svelte.ts';
	import { outcomeVar } from './ink.ts';
	import type { Counts, Outcome } from './metrics.ts';

	interface Props {
		counts: Counts;
		posLabel?: string;
		negLabel?: string;
		/** Cells to keep bright; others are dimmed. */
		focus?: Outcome[] | null;
		/** Price of each kind of mistake: shows the cost in the error cells. */
		costs?: { fp: number; fn: number } | null;
		/** Show row/column totals. */
		totals?: boolean;
	}

	let { counts, posLabel, negLabel, focus = null, costs = null, totals = false }: Props = $props();

	/** English source strings (typed as plain strings so fr/ar can differ). */
	const EN = {
		positive: 'positive',
		negative: 'negative',
		actual: 'actual {c}',
		predicted: 'predicted {c}',
		total: 'total',
		tp: 'true positive',
		fn: 'false negative',
		fp: 'false positive',
		tn: 'true negative',
		aria: 'Confusion matrix'
	};
	const L = local({
		en: EN,
		fr: {
			positive: 'positif',
			negative: 'négatif',
			actual: 'réel : {c}',
			predicted: 'prédit : {c}',
			total: 'total',
			tp: 'vrai positif',
			fn: 'faux négatif',
			fp: 'faux positif',
			tn: 'vrai négatif',
			aria: 'Matrice de confusion'
		},
		ar: {
			positive: 'إيجابي',
			negative: 'سلبي',
			actual: 'فعلياً: {c}',
			predicted: 'التنبؤ: {c}',
			total: 'المجموع',
			tp: 'إيجابي صحيح',
			fn: 'سلبي خاطئ',
			fp: 'إيجابي خاطئ',
			tn: 'سلبي صحيح',
			aria: 'مصفوفة الالتباس'
		}
	});

	const ABBR: Record<Outcome, string> = { tp: 'TP', fn: 'FN', fp: 'FP', tn: 'TN' };
	const pos = $derived(posLabel ?? L('positive'));
	const neg = $derived(negLabel ?? L('negative'));
	const rows: [string, Outcome, Outcome][] = $derived([
		[L('actual', { c: pos }), 'tp', 'fn'],
		[L('actual', { c: neg }), 'fp', 'tn']
	]);
</script>

<div class="matrix" class:totals role="table" aria-label={L('aria')}>
	<div class="corner" role="presentation"></div>
	<div class="head" role="columnheader">{L('predicted', { c: pos })}</div>
	<div class="head" role="columnheader">{L('predicted', { c: neg })}</div>
	{#if totals}<div class="head tot" role="columnheader">{L('total')}</div>{/if}
	{#each rows as [name, a, b] (name)}
		<div class="rowhead" role="rowheader">{name}</div>
		{#each [a, b] as o (o)}
			<div class="cell" class:dim={focus && !focus.includes(o)} style:--c={outcomeVar[o]} role="cell">
				<span class="name"><b>{ABBR[o]}</b> <span class="long">{L(o)}</span></span>
				<span class="n">{counts[o]}</span>
				{#if costs && (o === 'fp' || o === 'fn')}
					<span class="cost"><span dir="ltr">× {costs[o]} = <b>{counts[o] * costs[o]}</b></span></span>
				{/if}
			</div>
		{/each}
		{#if totals}<div class="tot n-sm" role="cell">{counts[a] + counts[b]}</div>{/if}
	{/each}
	{#if totals}
		<div class="rowhead tot" role="rowheader">{L('total')}</div>
		<div class="tot n-sm" role="cell">{counts.tp + counts.fp}</div>
		<div class="tot n-sm" role="cell">{counts.fn + counts.tn}</div>
		<div class="tot n-sm" role="cell">{counts.tp + counts.fp + counts.fn + counts.tn}</div>
	{/if}
</div>

<style>
	.matrix {
		display: grid;
		grid-template-columns: auto 1fr 1fr;
		gap: 4px;
		font-size: 0.75rem;
		min-width: 0;
	}
	.matrix.totals {
		grid-template-columns: auto 1fr 1fr auto;
	}
	.head,
	.rowhead {
		color: var(--text-3);
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		line-height: 1.2;
		padding: 2px 4px;
	}
	.rowhead {
		justify-content: flex-end;
		text-align: end;
		max-width: 92px;
	}
	.cell {
		display: grid;
		gap: 2px;
		padding: 7px 9px;
		border-radius: var(--radius-sm);
		border: 1px solid color-mix(in srgb, var(--c) 45%, transparent);
		background: color-mix(in srgb, var(--c) 11%, var(--surface));
		transition:
			opacity 0.2s var(--ease),
			background 0.2s var(--ease);
		min-width: 0;
		container-type: inline-size;
	}
	@container (max-width: 125px) {
		.long {
			display: none;
		}
	}
	.cell.dim {
		opacity: 0.3;
	}
	.name {
		color: var(--text-2);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.name b {
		color: var(--c);
		filter: brightness(0.85);
	}
	:global([data-theme='dark']) .name b {
		filter: none;
	}
	.n {
		font-family: var(--font-mono);
		font-size: 1.35rem;
		font-weight: 600;
		line-height: 1.1;
		color: var(--text);
		font-variant-numeric: tabular-nums;
	}
	.cost {
		color: var(--text-2);
		font-family: var(--font-mono);
	}
	.tot {
		color: var(--text-3);
		display: grid;
		place-items: center;
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
		padding: 0 4px;
	}
	.n-sm {
		font-size: 0.8125rem;
	}
	.head.tot,
	.rowhead.tot {
		font-family: inherit;
	}
</style>
