<script lang="ts">
	import { resolve } from '$app/paths';
	import { concepts, conceptById, conceptsInTrack, learningPaths, tracks } from '#lib/content.ts';
	import { progress } from '#lib/progress.svelte.ts';
	import { palette } from '#lib/palette.svelte.ts';
	import { explainerIds, isInteractive } from '#lib/explainers/registry.ts';
	import ConceptCard from '#lib/components/ConceptCard.svelte';
	import PathCard from '#lib/components/PathCard.svelte';
	import type { ConceptMeta } from '#lib/types.ts';

	const lessons = explainerIds.map((id) => conceptById.get(id)).filter((c): c is ConceptMeta => !!c);

	/** Resume the most recent unfinished concept, or suggest the next step of the first path that has progress. */
	const resume = $derived.by(() => {
		if (!progress.ready) return null;
		const last = progress.recent.map((id) => conceptById.get(id)).find((c) => c && !progress.isLearned(c.id));
		if (last) return { concept: last, why: 'Pick up where you left off' };
		for (const p of learningPaths) {
			const next = p.steps.find((id) => !progress.isLearned(id));
			if (next && progress.countIn(p.steps) > 0) return { concept: conceptById.get(next)!, why: `Next in ${p.title}` };
		}
		return null;
	});

	const interactiveCount = concepts.filter((c) => isInteractive(c.id)).length;
	const total = concepts.length;
	const learnedPct = $derived(Math.round((progress.learned.size / total) * 100));
</script>

<svelte:head>
	<title>ML Hub · Learn machine learning interactively</title>
	<meta
		name="description"
		content="Learn machine learning, deep learning, data engineering and MLOps through interactive lessons, diagrams and code."
	/>
</svelte:head>

<section class="hero">
	<div class="container hero-inner">
		<div class="intro">
			<span class="eyebrow">ML · Deep Learning · Data Engineering · MLOps</span>
			<h1>Understand machine learning by <em>playing</em> with it.</h1>
			<p class="lead">
				{total} concepts, each with an intuition, a diagram, the math and working code. Start with an interactive lesson
				where you drag, tweak and predict while each idea plays out live.
			</p>
			<div class="cta">
				{#if resume}
					<a class="btn btn-primary btn-lg" href={resolve('/concept/[id]', { id: resume.concept.id })}>
						Continue: {resume.concept.name} →
					</a>
				{:else}
					<a class="btn btn-primary btn-lg" href={resolve('/paths/[id]', { id: 'ml-beginner' })}>Start the beginner path →</a>
				{/if}
				<button class="btn btn-lg" onclick={palette.open}>Search concepts <kbd>⌘K</kbd></button>
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
					<span>of {total} learned</span>
				</div>
			</div>
			<ul class="track-bars">
				{#each tracks as t (t.id)}
					{@const ids = conceptsInTrack(t.id).map((c) => c.id)}
					{@const done = progress.countIn(ids)}
					<li style:--tc={t.color}>
						<a href="{resolve('/learn')}?track={t.id}">
							<span class="tl">{t.label}</span>
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
				<h2>Interactive lessons</h2>
				<p class="muted">Step-by-step, with a live visualization you control.</p>
			</div>
			<a class="more" href="{resolve('/learn')}">{interactiveCount} interactive concepts →</a>
		</div>
		<div class="grid">
			{#each lessons as c (c.id)}
				<ConceptCard concept={c} />
			{/each}
		</div>
	</section>

	<section class="block">
		<div class="block-head">
			<div>
				<h2>Learning paths</h2>
				<p class="muted">Ordered routes through the material for a specific goal.</p>
			</div>
			<a class="more" href={resolve('/paths')}>All paths →</a>
		</div>
		<div class="grid">
			{#each learningPaths as p (p.id)}
				<PathCard path={p} />
			{/each}
		</div>
	</section>

	<section class="block">
		<div class="block-head">
			<div>
				<h2>Browse by track</h2>
			</div>
		</div>
		<div class="tracks">
			{#each tracks as t (t.id)}
				{@const items = conceptsInTrack(t.id)}
				<a class="card track" href="{resolve('/learn')}?track={t.id}" style:--tc={t.color}>
					<span class="ticon" aria-hidden="true">{t.icon}</span>
					<span class="tname">{t.label}</span>
					<span class="tcount">{items.length} concepts</span>
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
		text-align: right;
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
