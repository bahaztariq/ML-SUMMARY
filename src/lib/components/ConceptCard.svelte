<script lang="ts">
	import { lhref, t } from '#lib/i18n/index.svelte.ts';
	import { trackById } from '#lib/content.ts';
	import { progress } from '#lib/progress.svelte.ts';
	import { hasExplainer, isInteractive } from '#lib/explainers/registry.ts';
	import type { ConceptMeta } from '#lib/types.ts';

	let { concept, compact = false }: { concept: ConceptMeta; compact?: boolean } = $props();
	const track = $derived(trackById[concept.track]);
	const learned = $derived(progress.isLearned(concept.id));
</script>

<a
	class="card concept"
	class:compact
	class:learned
	href={lhref(`/concept/${concept.id}`)}
	style:--tc={track.color}
>
	<div class="top">
		<span class="track"><span class="dot"></span>{track.label}</span>
		{#if learned}
			<span class="check" title={t('common.learned')}>✓</span>
		{/if}
	</div>
	<h3>{concept.name}</h3>
	{#if !compact}
		<p class="summary">{concept.summary}</p>
	{/if}
	<div class="meta">
		<span class="diff diff-{concept.difficulty.toLowerCase()}">{t(`difficulty.${concept.difficulty}`)}</span>
		{#if hasExplainer(concept.id)}
			<span class="tag lesson">▶ {t('common.interactiveLesson')}</span>
		{:else if isInteractive(concept.id)}
			<span class="tag">{t('common.playground')}</span>
		{/if}
	</div>
</a>

<style>
	.concept {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 16px 16px 14px;
		transition:
			border-color 0.15s var(--ease),
			box-shadow 0.15s var(--ease),
			transform 0.15s var(--ease);
	}
	.concept::before {
		content: '';
		position: absolute;
		inset-block: 0;
		inset-inline-start: 0;
		width: 3px;
		border-start-start-radius: var(--radius);
		border-end-start-radius: var(--radius);
		background: var(--tc);
		opacity: 0;
		transition: opacity 0.15s var(--ease);
	}
	.concept:hover {
		border-color: var(--border-strong);
		box-shadow: var(--shadow);
		transform: translateY(-1px);
	}
	.concept:hover::before {
		opacity: 1;
	}
	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.track {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--text-3);
	}
	.dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--tc);
	}
	.check {
		display: grid;
		place-items: center;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: color-mix(in srgb, var(--success) 15%, transparent);
		color: var(--success);
		font-size: 0.75rem;
		font-weight: 700;
	}
	h3 {
		font-size: 0.975rem;
		font-weight: 600;
	}
	.summary {
		font-size: 0.875rem;
		color: var(--text-2);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: auto;
		padding-top: 4px;
	}
	.diff,
	.tag {
		font-size: 0.6875rem;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: var(--radius-full);
		background: var(--surface-2);
		color: var(--text-2);
	}
	.diff-beginner {
		color: var(--success);
		background: color-mix(in srgb, var(--success) 10%, transparent);
	}
	.diff-intermediate {
		color: var(--warning);
		background: color-mix(in srgb, var(--warning) 12%, transparent);
	}
	.diff-advanced {
		color: var(--danger);
		background: color-mix(in srgb, var(--danger) 10%, transparent);
	}
	.tag.lesson {
		color: var(--accent);
		background: var(--accent-soft);
	}
	.compact {
		padding: 12px 14px;
		gap: 6px;
	}
	.compact h3 {
		font-size: 0.9rem;
	}
</style>
