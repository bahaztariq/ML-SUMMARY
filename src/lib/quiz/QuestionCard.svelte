<!--
  One quiz question. Layout is grid-based so nothing jumps:
  - options share one grid with `grid-auto-rows: 1fr` (equal heights) and each option is a
    subgrid spanning [letter | text], so letters and texts align across options;
  - the feedback row is always in the layout (hidden until answered), so answering never
    moves the Next button.
-->
<script lang="ts">
	import { i18n, lhref, pick, t } from '#lib/i18n/index.svelte.ts';
	import { conceptById } from '#lib/content.ts';
	import type { AnswerRecord, Drawn, Question } from './engine.ts';

	interface Props {
		question: Question;
		drawn: Drawn;
		index: number;
		total: number;
		/** Set once answered. */
		record?: AnswerRecord;
		onanswer: (chosenOriginalIndex: number) => void;
		onnext: () => void;
		last: boolean;
	}
	let { question, drawn, index, total, record, onanswer, onnext, last }: Props = $props();

	const options = $derived(question.options[i18n.current] ?? question.options.en);
	const concept = $derived(conceptById.get(question.concept));
	const answered = $derived(!!record);
	const letters = $derived([...t('common.optionLetters')]);
	const bonus = $derived(record && record.correct ? record.points - { 1: 10, 2: 20, 3: 30 }[question.difficulty] : 0);

	let nextBtn = $state<HTMLButtonElement>();
	$effect(() => {
		if (answered) queueMicrotask(() => nextBtn?.focus());
	});

	function onkeydown(e: KeyboardEvent) {
		if ((e.target as HTMLElement).closest('input, textarea')) return;
		const n = Number(e.key);
		if (!answered && n >= 1 && n <= drawn.order.length) {
			e.preventDefault();
			onanswer(drawn.order[n - 1]);
		}
	}
</script>

<svelte:window {onkeydown} />

<article class="card q" aria-labelledby="q-text">
	<header class="q-head">
		<span class="q-num">{t('quiz.questionOf', { i: index + 1, n: total })}</span>
		<span class="q-diff d{question.difficulty}">{t(`quiz.difficulty${question.difficulty}`)}</span>
	</header>

	<h2 id="q-text" class="q-text">{pick(question.q)}</h2>

	<div class="options" role="group" aria-labelledby="q-text">
		{#each drawn.order as orig, pos (orig)}
			{@const chosen = record?.chosen === orig}
			{@const right = orig === question.answer}
			<button
				class="option"
				class:chosen
				class:right={answered && right}
				class:wrong={answered && chosen && !right}
				class:faded={answered && !right && !chosen}
				disabled={answered}
				aria-pressed={chosen}
				onclick={() => onanswer(orig)}
			>
				<span class="letter" aria-hidden="true">{answered && right ? '✓' : answered && chosen ? '✕' : letters[pos]}</span>
				<span class="text">{options[orig]}</span>
			</button>
		{/each}
	</div>

	<div class="feedback" class:shown={answered} class:ok={record?.correct} aria-live="polite">
		{#if record}
			<p class="verdict">
				<strong>{record.correct ? t('quiz.correct') : t('quiz.wrong')}</strong>
				{#if record.correct}
					<span class="pts">{t('quiz.plusPoints', { n: record.points })}</span>
					{#if bonus > 0}<span class="bonus">{t('quiz.bonus', { n: bonus })}</span>{/if}
				{/if}
			</p>
			<p class="explain">{pick(question.explain)}</p>
			{#if concept}
				<a class="review" href={lhref(`/concept/${concept.id}`)} target="_blank" rel="noopener">{t('quiz.learnMore', { name: concept.name })} <span aria-hidden="true">{t('common.external')}</span></a>
			{/if}
		{:else}
			<p class="hint">{t('quiz.keyboard')}</p>
		{/if}
	</div>

	<footer class="q-foot">
		<button class="btn btn-primary" bind:this={nextBtn} disabled={!answered} onclick={onnext}>
			{last ? t('quiz.seeResults') : t('quiz.nextQuestion')} {t('common.arrowForward')}
		</button>
	</footer>
</article>

<style>
	.q {
		display: grid;
		/* head | question | options | feedback | footer — feedback keeps its space when empty */
		grid-template-rows: auto minmax(3.2em, auto) auto minmax(10em, auto) auto;
		gap: 18px;
		padding: 24px;
	}
	.q-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
	}
	.q-num {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--text-3);
	}
	.q-diff {
		font-size: 0.75rem;
		font-weight: 600;
		padding: 2px 9px;
		border-radius: var(--radius-full);
	}
	.d1 {
		color: var(--success);
		background: color-mix(in srgb, var(--success) 10%, transparent);
	}
	.d2 {
		color: var(--warning);
		background: color-mix(in srgb, var(--warning) 12%, transparent);
	}
	.d3 {
		color: var(--danger);
		background: color-mix(in srgb, var(--danger) 10%, transparent);
	}
	.q-text {
		font-size: 1.2rem;
		line-height: 1.45;
		align-self: center;
	}

	/* Options: [letter | text] columns shared by every option through subgrid. */
	.options {
		display: grid;
		grid-template-columns: [letter] auto [text] minmax(0, 1fr) [letter2] auto [text2] minmax(0, 1fr);
		grid-auto-rows: 1fr;
		gap: 10px;
	}
	.option {
		grid-column: span 2;
		display: grid;
		grid-template-columns: subgrid;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;
		text-align: start;
		border: 1.5px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		font-size: 0.95rem;
		line-height: 1.45;
		cursor: pointer;
		transition:
			border-color 0.15s var(--ease),
			background 0.15s var(--ease),
			opacity 0.2s var(--ease);
	}
	.option:hover:not(:disabled) {
		border-color: var(--accent);
		background: color-mix(in srgb, var(--accent) 5%, var(--surface));
	}
	.option:disabled {
		cursor: default;
	}
	.letter {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border-radius: 8px;
		background: var(--surface-2);
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--text-2);
	}
	.option.right {
		border-color: var(--success);
		background: color-mix(in srgb, var(--success) 9%, var(--surface));
	}
	.option.right .letter {
		background: var(--success);
		color: var(--surface);
	}
	.option.wrong {
		border-color: var(--danger);
		background: color-mix(in srgb, var(--danger) 8%, var(--surface));
	}
	.option.wrong .letter {
		background: var(--danger);
		color: var(--surface);
	}
	.option.faded {
		opacity: 0.5;
	}

	.feedback {
		display: grid;
		align-content: start;
		gap: 6px;
		padding: 14px 16px;
		border-radius: var(--radius);
		background: var(--surface-2);
		border: 1px solid transparent;
		font-size: 0.925rem;
	}
	.feedback:not(.shown) {
		background: transparent;
	}
	.feedback.shown {
		border-color: color-mix(in srgb, var(--danger) 30%, var(--border));
	}
	.feedback.shown.ok {
		border-color: color-mix(in srgb, var(--success) 35%, var(--border));
	}
	.verdict {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 4px 10px;
	}
	.verdict strong {
		color: var(--danger);
	}
	.ok .verdict strong {
		color: var(--success);
	}
	.pts {
		font-weight: 700;
		color: var(--accent);
	}
	.bonus {
		font-size: 0.8125rem;
		color: var(--text-3);
	}
	.explain {
		color: var(--text-2);
	}
	.review {
		justify-self: start;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--accent);
	}
	.hint {
		align-self: end;
		font-size: 0.8125rem;
		color: var(--text-3);
	}
	.q-foot {
		display: flex;
		justify-content: flex-end;
	}

	@media (max-width: 720px) {
		.q {
			padding: 18px 16px;
		}
		.options {
			grid-template-columns: [letter] auto [text] minmax(0, 1fr);
		}
	}
</style>
