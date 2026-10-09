<script lang="ts">
	import { lhref, t } from '#lib/i18n/index.svelte.ts';
	import { concepts, conceptById, conceptsInTrack, learningPaths, roadmap, roadmapOrder, stageConceptIds, tracks } from '#lib/content.ts';
	import { progress } from '#lib/progress.svelte.ts';
	import { palette } from '#lib/palette.svelte.ts';
	import { hasExplainer, isInteractive } from '#lib/explainers/registry.ts';
	import ConceptCard from '#lib/components/ConceptCard.svelte';
	import type { ConceptMeta } from '#lib/types.ts';

	/** A hand-picked sample of lessons across the roadmap (only those that exist are shown). */
	const FEATURED = ['kmeans', 'what-is-gradient-descent', 'linear-regression', 'decision-tree', 'roc-auc', 'random-forest', 'pca', 'q-learning'];
	const lessons = FEATURED.filter(hasExplainer)
		.map((id) => conceptById.get(id))
		.filter((c): c is ConceptMeta => !!c);

	/** Resume the most recent unfinished concept, or the next unlearned one in the roadmap. */
	const resume = $derived.by(() => {
		if (!progress.ready) return null;
		const last = progress.recent.map((id) => conceptById.get(id)).find((c) => c && !progress.isLearned(c.id));
		if (last) return { concept: last, why: t('home.resumeLast') };
		if (progress.learned.size === 0) return null;
		const next = roadmapOrder.find((id) => !progress.isLearned(id));
		return next ? { concept: conceptById.get(next)!, why: t('home.resumeRoadmap') } : null;
	});

	const coreStages = roadmap.filter((s) => s.kind === 'core');
	const specializations = roadmap.filter((s) => s.kind === 'specialization');

	const interactiveCount = concepts.filter((c) => isInteractive(c.id)).length;
	const total = concepts.length;
	const learnedPct = $derived(Math.round((progress.learned.size / total) * 100));
</script>

<svelte:head>
	<title>{t('site.name')} · {t('site.tagline')}</title>
	<meta
		name="description"
		content={t('site.description')}
	/>
</svelte:head>

<section class="hero">
	<div class="container hero-inner">
		<div class="intro">
			<span class="eyebrow">{t('home.eyebrow')}</span>
			<h1>{t('home.titleBefore')} <em>{t('home.titleEm')}</em> {t('home.titleAfter')}</h1>
			<p class="lead">{t('home.lead', { n: total })}</p>
			<div class="cta">
				{#if resume}
					<a class="btn btn-primary btn-lg" href={lhref(`/concept/${resume.concept.id}`)}>
						{t('home.continue', { name: resume.concept.name })} {t('common.arrowForward')}
					</a>
				{:else}
					<a class="btn btn-primary btn-lg" href={lhref('/roadmap')}>{t('home.startRoadmap')} {t('common.arrowForward')}</a>
				{/if}
				<button class="btn btn-lg" onclick={palette.open}>{t('nav.searchConcepts')} <kbd>⌘K</kbd></button>
			</div>
			{#if resume}<p class="why">{resume.why}</p>{/if}
		</div>

		<div class="stats card">
			<div class="ring-wrap">
				<svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">
					<circle cx="60" cy="60" r="52" fill="none" stroke="var(--surface-3)" stroke-width="10" />
					<circle
						cx="60"
						cy="60"
						r="52"
						fill="none"
						stroke="var(--accent)"
						stroke-width="10"
						stroke-linecap="round"
							stroke-opacity={learnedPct > 0 ? 1 : 0}
						stroke-dasharray="{(learnedPct / 100) * 326.7} 326.7"
						transform="rotate(-90 60 60)"
						style="transition: stroke-dasharray .6s var(--ease)"
					/>
				</svg>
				<div class="ring-label">
					<strong>{progress.ready ? progress.learned.size : 0}</strong>
					<span>{t('home.learnedOf', { total })}</span>
				</div>
			</div>
			<ul class="track-bars">
				{#each tracks as tr (tr.id)}
					{@const ids = conceptsInTrack(tr.id).map((c) => c.id)}
					{@const done = progress.countIn(ids)}
					<li style:--tc={tr.color}>
						<a href="{lhref('/learn')}?track={tr.id}">
							<span class="tl">{tr.label}</span>
							<span class="tbar"><span style:width="{(done / ids.length) * 100}%"></span></span>
							<span class="tn">{done}/{ids.length}</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<div class="container">
	<section class="block">
		<div class="block-head">
			<div>
				<h2>{t('home.roadmapTitle')}</h2>
				<p class="muted">{t('home.roadmapLead')}</p>
			</div>
			<a class="more" href={lhref('/roadmap')}>{t('home.openRoadmap')} {t('common.arrowForward')}</a>
		</div>
		<ol class="stages">
			{#each coreStages as stage, i (stage.id)}
				{@const ids = stageConceptIds(stage)}
				{@const done = progress.countIn(ids)}
				<li>
					<a class="card stage" class:complete={done === ids.length} href="{lhref('/roadmap')}#{stage.id}">
						<span class="stage-num">{done === ids.length ? '✓' : i + 1}</span>
						<span class="stage-text">
							<span class="stage-title">{stage.icon} {stage.title}</span>
							<span class="stage-bar"><span style:width="{(done / ids.length) * 100}%"></span></span>
						</span>
						<span class="stage-count">{done}/{ids.length}</span>
					</a>
				</li>
			{/each}
		</ol>
		<div class="specs-row">
			<span class="specs-label">{t('home.thenSpecialize')}</span>
			{#each specializations as stage (stage.id)}
				<a class="spec-chip" href="{lhref('/roadmap')}#{stage.id}">{stage.icon} {stage.title}</a>
			{/each}
		</div>
		<div class="specs-row">
			<span class="specs-label">{t('home.orFocus')}</span>
			{#each learningPaths as p (p.id)}
				<a class="spec-chip" href="{lhref('/roadmap')}?focus={p.id}">{p.icon} {p.title}</a>
			{/each}
		</div>
	</section>

	<section class="block">
		<div class="block-head">
			<div>
				<h2>{t('home.lessonsTitle')}</h2>
				<p class="muted">{t('home.lessonsLead')}</p>
			</div>
			<a class="more" href="{lhref('/learn')}">{t('home.interactiveCount', { n: interactiveCount })} {t('common.arrowForward')}</a>
		</div>
		<div class="grid">
			{#each lessons as c (c.id)}
				<ConceptCard concept={c} />
			{/each}
		</div>
	</section>

	<section class="block">
		<a class="card quiz-cta" href={lhref('/quiz')}>
			<span class="quiz-icon" aria-hidden="true">?</span>
			<span class="quiz-text">
				<strong>{t('home.quizTitle')}</strong>
				<span class="muted">{t('home.quizLead', { n: '300+' })}</span>
			</span>
			<span class="btn btn-primary">{t('home.quizCta')} {t('common.arrowForward')}</span>
		</a>
	</section>

	<section class="block">
		<div class="block-head">
			<div>
				<h2>{t('home.tracksTitle')}</h2>
			</div>
		</div>
		<div class="tracks">
			{#each tracks as tr (tr.id)}
				{@const items = conceptsInTrack(tr.id)}
				<a class="card track" href="{lhref('/learn')}?track={tr.id}" style:--tc={tr.color}>
					<span class="ticon" aria-hidden="true">{tr.icon}</span>
					<span class="tname">{tr.label}</span>
					<span class="tcount">{t('home.trackCount', { n: items.length })}</span>
				</a>
			{/each}
		</div>
	</section>
</div>

<style>
	.hero {
		padding: 56px 0 48px;
		border-bottom: 1px solid var(--border);
		background:
			radial-gradient(60% 80% at 15% 0%, color-mix(in srgb, var(--accent) 7%, transparent), transparent 70%),
			var(--bg);
	}
	:global([dir='rtl']) .hero {
		background:
			radial-gradient(60% 80% at 85% 0%, color-mix(in srgb, var(--accent) 7%, transparent), transparent 70%),
			var(--bg);
	}
	.hero-inner {
		display: grid;
		grid-template-columns: minmax(0, 1.4fr) minmax(280px, 1fr);
		gap: 48px;
		align-items: center;
	}
	.intro {
		display: grid;
		gap: 16px;
	}
	h1 {
		font-size: clamp(2rem, 1.4rem + 2.6vw, 3.1rem);
		line-height: 1.1;
		max-width: 16ch;
	}
	h1 em {
		font-style: normal;
		color: var(--accent);
	}
	.lead {
		font-size: 1.0625rem;
		color: var(--text-2);
		max-width: 56ch;
	}
	.cta {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 8px;
	}
	.btn-lg {
		height: 44px;
		padding: 0 18px;
		font-size: 0.9375rem;
	}
	.why {
		font-size: 0.8125rem;
		color: var(--text-3);
	}
	.stats {
		padding: 22px;
		display: grid;
		gap: 20px;
		justify-items: center;
		box-shadow: var(--shadow);
	}
	.ring-wrap {
		position: relative;
		display: grid;
		place-items: center;
	}
	.ring-label {
		position: absolute;
		display: grid;
		justify-items: center;
		line-height: 1.2;
	}
	.ring-label strong {
		font-size: 1.75rem;
		font-variant-numeric: tabular-nums;
	}
	.ring-label span {
		font-size: 0.75rem;
		color: var(--text-3);
	}
	.track-bars {
		width: 100%;
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 4px;
	}
	.track-bars a {
		display: grid;
		grid-template-columns: 130px 1fr 40px;
		align-items: center;
		gap: 10px;
		padding: 4px 6px;
		border-radius: var(--radius-sm);
		font-size: 0.8125rem;
	}
	.track-bars a:hover {
		background: var(--surface-2);
	}
	.tl {
		color: var(--text-2);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.tbar {
		height: 6px;
		border-radius: 3px;
		background: var(--surface-3);
		overflow: hidden;
	}
	.tbar span {
		display: block;
		height: 100%;
		background: var(--tc);
		border-radius: 3px;
		transition: width 0.5s var(--ease);
	}
	.tn {
		text-align: end;
		color: var(--text-3);
		font-variant-numeric: tabular-nums;
		font-size: 0.75rem;
	}
	.block {
		margin-top: 52px;
	}
	.block-head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 16px;
	}
	.block-head h2 {
		margin-bottom: 4px;
	}
	.more {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--accent);
		white-space: nowrap;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 12px;
	}
	.stages {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 10px;
	}
	.stage {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;
		transition:
			border-color 0.15s var(--ease),
			box-shadow 0.15s var(--ease);
	}
	.stage:hover {
		border-color: var(--border-strong);
		box-shadow: var(--shadow);
	}
	.stage-num {
		display: grid;
		place-items: center;
		flex-shrink: 0;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: 2px solid var(--border-strong);
		font-size: 0.8125rem;
		font-weight: 650;
		color: var(--text-2);
	}
	.stage.complete .stage-num {
		border-color: var(--success);
		background: var(--success);
		color: var(--surface);
	}
	.stage-text {
		flex: 1;
		min-width: 0;
		display: grid;
		gap: 6px;
	}
	.stage-title {
		font-size: 0.9rem;
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.stage-bar {
		height: 4px;
		border-radius: 2px;
		background: var(--surface-3);
		overflow: hidden;
	}
	.stage-bar span {
		display: block;
		height: 100%;
		background: var(--success);
		transition: width 0.4s var(--ease);
	}
	.stage-count {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-3);
		font-variant-numeric: tabular-nums;
	}
	.specs-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		margin-top: 12px;
	}
	.specs-label {
		font-size: 0.8125rem;
		color: var(--text-3);
		margin-inline-end: 4px;
	}
	.spec-chip {
		padding: 4px 11px;
		border: 1px solid var(--border);
		border-radius: var(--radius-full);
		background: var(--surface);
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--text-2);
	}
	.spec-chip:hover {
		border-color: var(--border-strong);
		color: var(--text);
	}
	.quiz-cta {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 16px;
		padding: 20px 22px;
		background: color-mix(in srgb, var(--accent) 5%, var(--surface));
		transition: box-shadow 0.15s var(--ease);
	}
	.quiz-cta:hover {
		box-shadow: var(--shadow);
	}
	.quiz-icon {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: var(--accent);
		color: var(--text-on-accent);
		font-size: 1.4rem;
		font-weight: 700;
	}
	.quiz-text {
		display: grid;
		gap: 2px;
	}
	.quiz-text strong {
		font-size: 1.0625rem;
	}
	@media (max-width: 600px) {
		.quiz-cta {
			grid-template-columns: auto minmax(0, 1fr);
		}
		.quiz-cta .btn {
			grid-column: 1 / -1;
		}
	}
	.tracks {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
		gap: 12px;
	}
	.track {
		display: grid;
		gap: 4px;
		padding: 16px;
		border-top: 3px solid var(--tc);
		transition: box-shadow 0.15s var(--ease);
	}
	.track:hover {
		box-shadow: var(--shadow);
	}
	.ticon {
		font-size: 1.25rem;
	}
	.tname {
		font-weight: 600;
	}
	.tcount {
		font-size: 0.8125rem;
		color: var(--text-3);
	}
	@media (max-width: 860px) {
		.hero {
			padding: 36px 0 32px;
		}
		.hero-inner {
			grid-template-columns: 1fr;
			gap: 28px;
		}
	}
</style>
