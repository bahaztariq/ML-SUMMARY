<script lang="ts">
	import { browser } from '$app/env';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { conceptsInTrack, tracks } from '#lib/content.ts';
	import { progress } from '#lib/progress.svelte.ts';
	import { prerequisiteGraph } from '#lib/map/graphs.ts';
	import Diagram from '#lib/components/Diagram.svelte';
	import type { TrackId } from '#lib/types.ts';

	let track = $state<TrackId>('ml-core');
	let external = $state(true);

	// Read ?track= after hydration (search params are unavailable while prerendering).
	$effect(() => {
		if (!browser) return;
		const t = page.url.searchParams.get('track');
		if (t && tracks.some((x) => x.id === t)) track = t as TrackId;
	});

	function setTrack(t: TrackId) {
		track = t;
		const url = new URL(page.url.href);
		url.searchParams.set('track', t);
		replaceState(url, {});
	}

	const graph = $derived(prerequisiteGraph(track, progress.isLearned, { external }));
	const ids = $derived(conceptsInTrack(track).map((c) => c.id));
</script>

<svelte:head>
	<title>Prerequisites · Map · ML Hub</title>
	<meta name="description" content="Prerequisite graph for each track: what to learn first and what it unlocks." />
</svelte:head>

<section>
	<div class="intro">
		<h2>Prerequisite graph</h2>
		<p>
			Arrows point from what you should learn first to what it unlocks; arrows already implied by a longer chain are
			left out. Pick a track, then start from the concepts on the left. Click any node to open it.
		</p>
	</div>

	<div class="tabs" role="tablist" aria-label="Tracks">
		{#each tracks as t (t.id)}
			<button
				role="tab"
				aria-selected={track === t.id}
				class:active={track === t.id}
				style:--tc={t.color}
				onclick={() => setTrack(t.id)}
			>
				<span class="dot"></span>
				{t.label}
				<span class="n">{conceptsInTrack(t.id).length}</span>
			</button>
		{/each}
	</div>

	<div class="bar">
		<ul class="legend" aria-label="Legend">
			<li><span class="swatch"></span>This track</li>
			{#if external}<li><span class="swatch ext"></span>From another track</li>{/if}
			<li><span class="swatch done"></span>Learned ✓</li>
		</ul>
		<span class="count">{progress.countIn(ids)}/{ids.length} learned</span>
		<label class="toggle"><input type="checkbox" bind:checked={external} /> Show other tracks</label>
	</div>

	{#if browser && progress.ready}
		<Diagram source={graph.source} links={graph.links} label="Prerequisite graph" />
	{:else}
		<div class="card diagram-placeholder">Rendering diagram…</div>
	{/if}
</section>

<style>
	.tabs {
		display: flex;
		gap: 4px;
		overflow-x: auto;
		padding-bottom: 2px;
		margin-bottom: 12px;
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
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 16px;
		margin-bottom: 12px;
		font-size: 0.8125rem;
		color: var(--text-2);
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 14px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.legend li {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.swatch {
		width: 18px;
		height: 12px;
		border: 1px solid var(--border-strong);
		border-radius: 3px;
		background: var(--surface-2);
	}
	.swatch.ext {
		border-style: dashed;
		border-radius: 6px;
	}
	.swatch.done {
		border-color: color-mix(in srgb, var(--success) 60%, var(--border));
		background: color-mix(in srgb, var(--success) 12%, var(--surface));
	}
	.count {
		margin-left: auto;
		color: var(--text-3);
		font-variant-numeric: tabular-nums;
	}
	.toggle {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 30px;
		padding: 0 10px;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: var(--surface);
		color: var(--text);
		cursor: pointer;
		user-select: none;
	}
	.toggle input {
		accent-color: var(--accent);
	}
</style>
