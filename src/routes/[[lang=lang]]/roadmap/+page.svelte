<script lang="ts">
	import { lhref, t } from '#lib/i18n/index.svelte.ts';
	import { untrack } from 'svelte';
	import { browser } from '$app/env';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { conceptById, learningPaths, pathById, roadmap, roadmapOrder, stageConceptIds, trackById } from '#lib/content.ts';
	import { progress } from '#lib/progress.svelte.ts';
	import { hasExplainer } from '#lib/explainers/registry.ts';
	import type { RoadmapStage } from '#lib/types.ts';

	/* Focus: '' shows the whole roadmap; a path id highlights that goal's concepts. */
	let focus = $state('');
	$effect(() => {
		if (!browser) return;
		const f = page.url.searchParams.get('focus') ?? '';
		untrack(() => (focus = pathById.has(f) ? f : ''));
	});

	function setFocus(id: string) {
		focus = id;
		const url = new URL(page.url.href);
		if (id) url.searchParams.set('focus', id);
		else url.searchParams.delete('focus');
		goto(url, { shallow: true, replace: true });
	}

	const focusPath = $derived(focus ? pathById.get(focus) : undefined);
	const focusSet = $derived(focusPath ? new Set(focusPath.steps) : null);
	const inFocus = (id: string) => !focusSet || focusSet.has(id);

	/** The order "Continue" follows: the focused path's own order, or the roadmap. */
	const order = $derived(focusPath ? focusPath.steps : roadmapOrder);
	const nextId = $derived(progress.ready ? order.find((id) => !progress.isLearned(id)) : order[0]);
	const nextConcept = $derived(nextId ? conceptById.get(nextId) : undefined);
	const done = $derived(progress.countIn(order));

	const core = roadmap.filter((s) => s.kind === 'core');
	const specializations = roadmap.filter((s) => s.kind === 'specialization');

	function stageStats(stage: RoadmapStage) {
		const ids = stageConceptIds(stage).filter(inFocus);
		const learned = progress.countIn(ids);
		return { total: ids.length, learned, complete: ids.length > 0 && learned === ids.length };
	}

	const conceptHref = (id: string) =>
		focusPath ? `${lhref(`/concept/${id}`)}?path=${focusPath.id}` : lhref(`/concept/${id}`);
</script>

<svelte:head>
	<title>{t('nav.roadmap')} · {t('site.name')}</title>
	<meta name="description" content={t('roadmap.description')} />
</svelte:head>

<div class="container page">
	<header class="head">
		<span class="eyebrow">{t('nav.roadmap')}</span>
		<h1>{t('roadmap.title')}</h1>
		<p class="muted lead">{t('roadmap.lead')}</p>

		<div class="summary card">
			<div class="summary-progress">
				<div class="bar" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={order.length} aria-label={t('roadmap.progress')}>
					<span style:width="{(done / order.length) * 100}%"></span>
				</div>
				<span class="count">{focusPath ? t('roadmap.countPath', { done, total: order.length, path: focusPath.title }) : t('roadmap.countAll', { done, total: order.length })}</span>
			</div>
			{#if nextConcept}
				<a class="btn btn-primary" href={conceptHref(nextConcept.id)}>
					{done ? t('path.continueName', { name: nextConcept.name }) : t('path.startName', { name: nextConcept.name })} {t('common.arrowForward')}
				</a>
			{:else}
				<span class="complete">{t('roadmap.allDone')}</span>
			{/if}
		</div>
	</header>

	<div class="focus" role="group" aria-label={t('roadmap.focus')}>
		<span class="focus-label">{t('roadmap.focus')}</span>
		<div class="chips">
			<button class:active={!focus} onclick={() => setFocus('')}>{t('roadmap.everything')}</button>
			{#each learningPaths as p (p.id)}
				<button class:active={focus === p.id} onclick={() => setFocus(p.id)}>{p.icon} {p.title}</button>
			{/each}
		</div>
		{#if focusPath}
			<p class="focus-note">
				{focusPath.goal} {t('roadmap.focusNote')}
				<a href={lhref(`/paths/${focusPath.id}`)}>{t('roadmap.timeline')} {t('common.arrowForward')}</a>
			</p>
		{/if}
	</div>

	{#snippet stageBody(stage: RoadmapStage)}
		{#each stage.milestones as m (m.title)}
			<div class="milestone">
				<h4>{m.title}</h4>
				<div class="steps">
					{#each m.steps as id (id)}
						{@const c = conceptById.get(id)}
						{#if c}
							<a
								class="step"
								class:learned={progress.isLearned(id)}
								class:next={id === nextId}
								class:dim={!inFocus(id)}
								href={conceptHref(id)}
								style:--tc={trackById[c.track].color}
								title={c.summary}
							>
								<span class="mark" aria-hidden="true">{progress.isLearned(id) ? '✓' : ''}</span>
								<span class="name">{c.name}</span>
								{#if hasExplainer(id)}<span class="lesson" title={t('common.interactiveLesson')}>▶</span>{/if}
								{#if id === nextId}<span class="up-next">{t('roadmap.upNext')}</span>{/if}
							</a>
						{/if}
					{/each}
				</div>
			</div>
		{/each}
	{/snippet}

	<ol class="trunk">
		{#each core as stage, i (stage.id)}
			{@const st = stageStats(stage)}
			<li class="stage" class:complete={st.complete} class:empty={st.total === 0}>
				<div class="rail" aria-hidden="true">
					<span class="node">{st.complete ? '✓' : i + 1}</span>
				</div>
				<section class="card stage-card" id={stage.id}>
					<div class="stage-head">
						<span class="icon" aria-hidden="true">{stage.icon}</span>
						<div class="stage-title">
							<span class="eyebrow">{t('concept.stageN', { n: i + 1 })}</span>
							<h2>{stage.title}</h2>
						</div>
						{#if st.total}
							<span class="stage-count" class:done={st.complete}>{st.learned}/{st.total}</span>
						{/if}
					</div>
					<p class="goal">{stage.goal}</p>
					{#if st.total}
						<div class="stage-bar"><span style:width="{(st.learned / st.total) * 100}%"></span></div>
					{/if}
					{@render stageBody(stage)}
				</section>
			</li>
		{/each}
	</ol>

	<section class="fork">
		<div class="fork-head">
			<span class="fork-node" aria-hidden="true">⑂</span>
			<div>
				<h2>{t('roadmap.thenSpecialize')}</h2>
				<p class="muted">{t('roadmap.specializeLead')}</p>
			</div>
		</div>
		<div class="specs">
			{#each specializations as stage (stage.id)}
				{@const st = stageStats(stage)}
				<section class="card stage-card spec" class:complete={st.complete} class:empty={st.total === 0} id={stage.id}>
					<div class="stage-head">
						<span class="icon" aria-hidden="true">{stage.icon}</span>
						<div class="stage-title">
							<span class="eyebrow">{t('concept.specialization')}</span>
							<h2>{stage.title}</h2>
						</div>
						{#if st.total}<span class="stage-count" class:done={st.complete}>{st.learned}/{st.total}</span>{/if}
					</div>
					<p class="goal">{stage.goal}</p>
					{#if st.total}
						<div class="stage-bar"><span style:width="{(st.learned / st.total) * 100}%"></span></div>
					{/if}
					{@render stageBody(stage)}
				</section>
			{/each}
		</div>
	</section>
</div>

<style>
	.page {
		padding-top: 36px;
	}
	.head {
		display: grid;
		gap: 10px;
		margin-bottom: 24px;
	}
	.head .eyebrow {
		color: var(--accent);
	}
	.lead {
		max-width: 62ch;
		font-size: 1.0625rem;
	}
	.summary {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px 20px;
		margin-top: 10px;
		padding: 16px 18px;
	}
	.summary-progress {
		flex: 1 1 260px;
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.bar,
	.stage-bar {
		flex: 1;
		height: 8px;
		border-radius: 4px;
		background: var(--surface-3);
		overflow: hidden;
	}
	.bar span,
	.stage-bar span {
		display: block;
		height: 100%;
		border-radius: 4px;
		background: var(--success);
		transition: width 0.4s var(--ease);
	}
	.count {
		font-size: 0.875rem;
		color: var(--text-2);
		white-space: nowrap;
	}
	.complete {
		color: var(--success);
		font-weight: 600;
	}
	.summary .btn {
		height: auto;
		min-height: 36px;
		padding-block: 7px;
		white-space: normal;
		text-align: start;
		max-width: 100%;
	}

	.focus {
		display: grid;
		gap: 8px;
		margin-bottom: 36px;
	}
	.focus-label {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--text-3);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.chips button {
		height: 32px;
		padding: 0 12px;
		border: 1px solid var(--border);
		border-radius: var(--radius-full);
		background: var(--surface);
		color: var(--text-2);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
	}
	.chips button:hover {
		border-color: var(--border-strong);
		color: var(--text);
	}
	.chips button.active {
		background: var(--text);
		border-color: var(--text);
		color: var(--bg);
	}
	.focus-note {
		font-size: 0.875rem;
		color: var(--text-2);
		max-width: 70ch;
	}
	.focus-note a {
		color: var(--accent);
		font-weight: 500;
	}

	/* ---- trunk ---- */
	.trunk {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 16px;
	}
	.stage {
		display: grid;
		grid-template-columns: 44px minmax(0, 1fr);
		gap: 16px;
	}
	.rail {
		position: relative;
		display: flex;
		justify-content: center;
	}
	.rail::before {
		content: '';
		position: absolute;
		top: 0;
		bottom: -16px;
		width: 2px;
		background: var(--border);
	}
	.stage:first-child .rail::before {
		top: 22px;
	}
	.node {
		position: relative;
		z-index: 1;
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		margin-top: 14px;
		border-radius: 50%;
		border: 2px solid var(--border-strong);
		background: var(--bg);
		font-weight: 650;
		color: var(--text-2);
	}
	.stage.complete .node {
		border-color: var(--success);
		background: var(--success);
		color: var(--surface);
	}
	.stage-card {
		padding: 20px 22px;
		display: grid;
		/* minmax(0, …) lets long concept chips shrink instead of widening the card */
		grid-template-columns: minmax(0, 1fr);
		align-content: start;
		gap: 12px;
		min-width: 0;
	}
	.stage.empty .stage-card,
	.spec.empty {
		opacity: 0.55;
	}
	.stage-head {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.icon {
		display: grid;
		place-items: center;
		flex-shrink: 0;
		width: 38px;
		height: 38px;
		border-radius: 10px;
		background: var(--surface-2);
		font-size: 1.15rem;
	}
	.stage-title {
		flex: 1;
		min-width: 0;
		display: grid;
		gap: 1px;
	}
	.stage-title h2 {
		font-size: 1.125rem;
	}
	.stage-count {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--text-3);
		font-variant-numeric: tabular-nums;
	}
	.stage-count.done {
		color: var(--success);
	}
	.goal {
		color: var(--text-2);
		font-size: 0.9375rem;
	}
	.stage-bar {
		flex: none;
		height: 4px;
	}
	.milestone {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 8px;
		padding-top: 4px;
	}
	.milestone h4 {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--text-3);
	}
	.steps {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.step {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		max-width: 100%;
		padding-block: 6px;
		padding-inline: 7px 11px;
		border: 1px solid var(--border);
		border-radius: var(--radius-full);
		background: var(--surface);
		font-size: 0.875rem;
		font-weight: 500;
		transition:
			border-color 0.15s var(--ease),
			background 0.15s var(--ease),
			opacity 0.2s var(--ease);
	}
	.step:hover {
		border-color: var(--tc);
		background: color-mix(in srgb, var(--tc) 6%, var(--surface));
	}
	.mark {
		display: grid;
		place-items: center;
		flex-shrink: 0;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		border: 2px solid color-mix(in srgb, var(--tc) 55%, var(--border));
		font-size: 0.625rem;
		font-weight: 800;
		color: var(--surface);
	}
	.name {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.step.learned {
		background: color-mix(in srgb, var(--success) 7%, var(--surface));
		border-color: color-mix(in srgb, var(--success) 35%, var(--border));
	}
	.step.learned .mark {
		border-color: var(--success);
		background: var(--success);
	}
	.step.next {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-soft);
	}
	.step.dim {
		opacity: 0.32;
	}
	.step.dim:hover {
		opacity: 0.8;
	}
	.lesson {
		font-size: 0.625rem;
		color: var(--accent);
	}
	.up-next {
		font-size: 0.6875rem;
		font-weight: 600;
		padding: 1px 7px;
		border-radius: var(--radius-full);
		background: var(--accent);
		color: var(--text-on-accent);
	}

	/* ---- fork ---- */
	.fork {
		margin-top: 16px;
	}
	.fork-head {
		display: grid;
		grid-template-columns: 44px minmax(0, 1fr);
		gap: 16px;
		align-items: center;
		margin-bottom: 16px;
	}
	.fork-node {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		border: 2px dashed var(--border-strong);
		background: var(--bg);
		font-size: 1.25rem;
		color: var(--text-2);
	}
	.fork-head h2 {
		margin-bottom: 2px;
	}
	.specs {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 14px;
	}
	.spec.complete {
		border-color: color-mix(in srgb, var(--success) 40%, var(--border));
	}

	@media (max-width: 1020px) {
		.specs {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 600px) {
		.stage {
			grid-template-columns: 28px minmax(0, 1fr);
			gap: 10px;
		}
		.node {
			width: 28px;
			height: 28px;
			margin-top: 18px;
			font-size: 0.8125rem;
		}
		.stage:first-child .rail::before {
			top: 18px;
		}
		.fork-head {
			grid-template-columns: 28px minmax(0, 1fr);
			gap: 10px;
		}
		.fork-node {
			width: 28px;
			height: 28px;
			font-size: 0.9rem;
		}
		.stage-card {
			padding: 16px;
		}
	}
</style>
