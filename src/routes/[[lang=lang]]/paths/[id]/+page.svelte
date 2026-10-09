<script lang="ts">
	import { lhref, t } from '#lib/i18n/index.svelte.ts';
	import { getConcepts, trackById } from '#lib/content.ts';
	import { progress } from '#lib/progress.svelte.ts';
	import { hasExplainer, isInteractive } from '#lib/explainers/registry.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const path = $derived(data.path);
	const steps = $derived(getConcepts(path.steps));
	const done = $derived(progress.countIn(path.steps));
	const nextIndex = $derived(steps.findIndex((c) => !progress.isLearned(c.id)));
	const href = (id: string) => `${lhref(`/concept/${id}`)}?path=${path.id}`;
</script>

<svelte:head><title>{path.title} · {t('site.name')}</title></svelte:head>

<div class="container page">
	<a class="back" href="{lhref('/roadmap')}?focus={path.id}">{t('common.arrowBack')} {t('path.backToRoadmap')}</a>
	<header class="head">
		<span class="icon" aria-hidden="true">{path.icon}</span>
		<div>
			<h1>{path.title}</h1>
			<p class="muted">{path.goal}</p>
		</div>
	</header>

	<div class="summary card">
		<div class="bar"><span style:width="{(done / steps.length) * 100}%"></span></div>
		<span class="count">{t('path.doneOf', { done, total: steps.length })}</span>
		{#if nextIndex >= 0}
			<a class="btn btn-primary" href={href(steps[nextIndex].id)}>
				{done ? t('path.continueName', { name: steps[nextIndex].name }) : t('path.startName', { name: steps[nextIndex].name })} {t('common.arrowForward')}
			</a>
		{:else}
			<span class="complete">{t('path.complete')}</span>
		{/if}
	</div>

	<ol class="timeline">
		{#each steps as c, i (c.id)}
			{@const learned = progress.isLearned(c.id)}
			<li class:learned class:next={i === nextIndex} style:--tc={trackById[c.track].color}>
				<span class="marker" aria-hidden="true">{learned ? '✓' : i + 1}</span>
				<a class="step card" href={href(c.id)}>
					<div class="step-top">
						<h3>{c.name}</h3>
						{#if hasExplainer(c.id)}
							<span class="tag lesson">▶ {t('common.lesson')}</span>
						{:else if isInteractive(c.id)}
							<span class="tag">{t('common.playground')}</span>
						{/if}
					</div>
					<p>{c.summary}</p>
					<span class="track">{trackById[c.track].label} · {t(`difficulty.${c.difficulty}`)}</span>
				</a>
				<button
					class="tick"
					class:on={learned}
					onclick={() => progress.toggle(c.id)}
					aria-label={learned ? t('path.unmarkAria', { name: c.name }) : t('path.markAria', { name: c.name })}
					aria-pressed={learned}>✓</button
				>
			</li>
		{/each}
	</ol>
</div>

<style>
	.page {
		padding-top: 28px;
		max-width: 860px;
	}
	.back {
		font-size: 0.875rem;
		color: var(--text-3);
	}
	.back:hover {
		color: var(--text);
	}
	.head {
		display: flex;
		gap: 16px;
		align-items: flex-start;
		margin: 16px 0 24px;
	}
	.icon {
		display: grid;
		place-items: center;
		flex-shrink: 0;
		width: 52px;
		height: 52px;
		border-radius: 14px;
		background: var(--surface-2);
		font-size: 1.6rem;
	}
	.head p {
		margin-top: 6px;
	}
	.summary {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px 16px;
		padding: 16px 18px;
		margin-bottom: 32px;
	}
	.bar {
		flex: 1 1 160px;
		height: 8px;
		border-radius: 4px;
		background: var(--surface-3);
		overflow: hidden;
	}
	.bar span {
		display: block;
		height: 100%;
		background: var(--success);
		transition: width 0.4s var(--ease);
	}
	.count {
		font-size: 0.875rem;
		color: var(--text-2);
	}
	.complete {
		color: var(--success);
		font-weight: 600;
	}
	.timeline {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 10px;
		position: relative;
	}
	.timeline::before {
		content: '';
		position: absolute;
		inset-inline-start: 15px;
		top: 16px;
		bottom: 16px;
		width: 2px;
		background: var(--border);
	}
	li {
		position: relative;
		display: grid;
		grid-template-columns: 32px 1fr 36px;
		gap: 14px;
		align-items: center;
	}
	.marker {
		position: relative;
		z-index: 1;
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 2px solid var(--border-strong);
		background: var(--bg);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--text-3);
	}
	li.learned .marker {
		border-color: var(--success);
		background: var(--success);
		color: var(--surface);
	}
	li.next .marker {
		border-color: var(--accent);
		color: var(--accent);
		box-shadow: 0 0 0 4px var(--accent-soft);
	}
	.step {
		display: grid;
		gap: 4px;
		padding: 14px 16px;
		transition:
			border-color 0.15s var(--ease),
			box-shadow 0.15s var(--ease);
	}
	.step:hover {
		border-color: var(--border-strong);
		box-shadow: var(--shadow);
	}
	li.next .step {
		border-color: color-mix(in srgb, var(--accent) 45%, var(--border));
	}
	.step-top {
		display: flex;
		align-items: center;
		gap: 8px;
		justify-content: space-between;
	}
	h3 {
		font-size: 0.975rem;
	}
	.step p {
		font-size: 0.875rem;
		color: var(--text-2);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.track {
		font-size: 0.75rem;
		color: var(--text-3);
	}
	.tag {
		flex-shrink: 0;
		font-size: 0.6875rem;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: var(--radius-full);
		background: var(--surface-2);
		color: var(--text-2);
	}
	.tag.lesson {
		background: var(--accent-soft);
		color: var(--accent);
	}
	.tick {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text-3);
		cursor: pointer;
	}
	.tick:hover {
		border-color: var(--success);
		color: var(--success);
	}
	.tick.on {
		background: color-mix(in srgb, var(--success) 12%, var(--surface));
		border-color: var(--success);
		color: var(--success);
	}
	@media (max-width: 560px) {
		li {
			grid-template-columns: 32px 1fr;
		}
		.tick {
			display: none;
		}
	}
</style>
