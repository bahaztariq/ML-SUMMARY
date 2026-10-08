<script lang="ts">
	import { browser } from '$app/env';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { concepts, tracks } from '#lib/content.ts';
	import { progress } from '#lib/progress.svelte.ts';
	import { search } from '#lib/search.ts';
	import { isInteractive } from '#lib/explainers/registry.ts';
	import ConceptCard from '#lib/components/ConceptCard.svelte';
	import type { Difficulty, TrackId } from '#lib/types.ts';

	let track = $state<TrackId | 'all'>('all');
	let query = $state('');
	let difficulty = $state<Difficulty | 'all'>('all');
	let interactiveOnly = $state(false);
	let hideLearned = $state(false);

	// Read ?track= after hydration (search params are unavailable while prerendering).
	$effect(() => {
		if (!browser) return;
		const t = page.url.searchParams.get('track');
		if (t && tracks.some((x) => x.id === t)) track = t as TrackId;
	});

	function setTrack(t: TrackId | 'all') {
		track = t;
		const url = new URL(page.url.href);
		if (t === 'all') url.searchParams.delete('track');
		else url.searchParams.set('track', t);
		goto(url, { shallow: true, replace: true });
	}

	const base = $derived(query.trim() ? search(query, 200) : concepts);
	const filtered = $derived(
		base.filter(
			(c) =>
				(track === 'all' || c.track === track) &&
				(difficulty === 'all' || c.difficulty === difficulty) &&
				(!interactiveOnly || isInteractive(c.id)) &&
				(!hideLearned || !progress.isLearned(c.id))
		)
	);
	const groups = $derived(
		track === 'all' && !query.trim()
			? tracks.map((t) => ({ track: t, items: filtered.filter((c) => c.track === t.id) })).filter((g) => g.items.length)
			: [{ track: null, items: filtered }]
	);
	const countFor = (id: TrackId | 'all') => (id === 'all' ? concepts.length : concepts.filter((c) => c.track === id).length);
</script>

<svelte:head><title>Learn · ML Hub</title></svelte:head>

<div class="container page">
	<header class="head">
		<h1>All concepts</h1>
		<p class="muted">
			{concepts.length} concepts across machine learning, deep learning, data engineering and MLOps. Each one has an
			intuition, a diagram, the math, hyperparameters and code.
		</p>
	</header>

	<div class="tabs" role="tablist" aria-label="Tracks">
		{#each [{ id: 'all', label: 'All', color: 'var(--text-3)' }, ...tracks] as t (t.id)}
			<button
				role="tab"
				aria-selected={track === t.id}
				class:active={track === t.id}
				style:--tc={t.color}
				onclick={() => setTrack(t.id as TrackId | 'all')}
			>
				{#if t.id !== 'all'}<span class="dot"></span>{/if}
				{t.label}
				<span class="n">{countFor(t.id as TrackId | 'all')}</span>
			</button>
		{/each}
	</div>

	<div class="filters">
		<label class="field">
			<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"
				><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" /><path
					d="m20 20-3.5-3.5"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
				/></svg
			>
			<input bind:value={query} placeholder="Filter by name, topic or parameter…" aria-label="Filter concepts" />
		</label>
		<select bind:value={difficulty} aria-label="Difficulty">
			<option value="all">Any level</option>
			<option>Beginner</option>
			<option>Intermediate</option>
			<option>Advanced</option>
		</select>
		<label class="toggle"><input type="checkbox" bind:checked={interactiveOnly} /> Interactive</label>
		<label class="toggle"><input type="checkbox" bind:checked={hideLearned} /> Hide learned</label>
	</div>

	{#each groups as g (g.track?.id ?? 'flat')}
		<section class="group">
			{#if g.track}
				<h2 style:--tc={g.track.color}>
					<span class="dot"></span>{g.track.label}
					<span class="progress">{progress.countIn(g.items.map((c) => c.id))}/{g.items.length} learned</span>
				</h2>
			{/if}
			<div class="grid">
				{#each g.items as c (c.id)}
					<ConceptCard concept={c} />
				{/each}
			</div>
		</section>
	{:else}
		<div class="empty card">
			<p>No concepts match these filters.</p>
			<button
				class="btn btn-sm"
				onclick={() => {
					query = '';
					difficulty = 'all';
					interactiveOnly = false;
					hideLearned = false;
					setTrack('all');
				}}>Clear filters</button
			>
		</div>
	{/each}
</div>

<style>
	.page {
		padding-top: 36px;
	}
	.head {
		display: grid;
		gap: 8px;
		margin-bottom: 24px;
	}
	.head p {
		max-width: 60ch;
	}
	.tabs {
		display: flex;
		gap: 4px;
		overflow-x: auto;
		padding-bottom: 2px;
		margin-bottom: 14px;
		scrollbar-width: none;
	}
	.tabs button {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		height: 34px;
		padding: 0 12px;
		border: 1px solid transparent;
		border-radius: var(--radius-full);
		background: transparent;
		color: var(--text-2);
		font-size: 0.875rem;
		font-weight: 500;
		white-space: nowrap;
		cursor: pointer;
	}
	.tabs button:hover {
		background: var(--surface-2);
		color: var(--text);
	}
	.tabs button.active {
		background: var(--surface);
		border-color: var(--border);
		color: var(--text);
		box-shadow: var(--shadow-sm);
	}
	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--tc);
	}
	.n {
		font-size: 0.75rem;
		color: var(--text-3);
		font-variant-numeric: tabular-nums;
	}
	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
		margin-bottom: 28px;
	}
	.field {
		flex: 1;
		min-width: 220px;
		display: flex;
		align-items: center;
		gap: 8px;
		height: 36px;
		padding: 0 12px;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: var(--surface);
		color: var(--text-3);
	}
	.field:focus-within {
		border-color: var(--accent);
	}
	.field input {
		flex: 1;
		min-width: 0;
		border: 0;
		outline: 0;
		background: transparent;
		color: var(--text);
		font: inherit;
		font-size: 0.875rem;
	}
	select {
		height: 36px;
		padding: 0 10px;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: var(--surface);
		color: var(--text);
		font: inherit;
		font-size: 0.875rem;
	}
	.toggle {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 36px;
		padding: 0 12px;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: var(--surface);
		font-size: 0.875rem;
		cursor: pointer;
		user-select: none;
	}
	.toggle input {
		accent-color: var(--accent);
	}
	.group {
		margin-bottom: 40px;
	}
	.group h2 {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 14px;
		font-size: 1.125rem;
	}
	.progress {
		margin-left: auto;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--text-3);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 12px;
	}
	.empty {
		display: grid;
		justify-items: center;
		gap: 12px;
		padding: 48px 16px;
		color: var(--text-2);
	}
</style>
