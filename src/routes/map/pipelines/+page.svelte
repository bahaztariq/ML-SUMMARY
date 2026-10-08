<script lang="ts">
	import { browser } from '$app/env';
	import { pipelineGraph, pipelines } from '#lib/map/graphs.ts';
	import Diagram from '#lib/components/Diagram.svelte';

	const graphs = pipelines.map((p) => ({ ...p, graph: pipelineGraph(p) }));
</script>

<svelte:head>
	<title>Pipelines · Map · ML Hub</title>
	<meta name="description" content="End-to-end flows: the ML lifecycle, a modern data platform, leak-free preprocessing and the neural network training loop." />
</svelte:head>

<div class="intro">
	<h2>Pipelines</h2>
	<p>
		Concepts rarely live alone. These flows show how they chain together in practice, end to end. Every step that has
		its own concept page is clickable.
	</p>
</div>

<nav class="jump" aria-label="Pipelines">
	{#each graphs as p (p.id)}
		<a href="#{p.id}">{p.icon} {p.title}</a>
	{/each}
</nav>

{#each graphs as p (p.id)}
	<section id={p.id} class="pipeline">
		<div class="head">
			<h3><span aria-hidden="true">{p.icon}</span> {p.title}</h3>
			<p class="muted">{p.description}</p>
		</div>
		{#if browser}
			<Diagram source={p.graph.source} links={p.graph.links} label={p.title} />
		{:else}
			<div class="card diagram-placeholder">Rendering diagram…</div>
		{/if}
	</section>
{/each}

<style>
	.jump {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 28px;
	}
	.jump a {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 30px;
		padding: 0 12px;
		border: 1px solid var(--border);
		border-radius: var(--radius-full);
		background: var(--surface);
		color: var(--text-2);
		font-size: 0.8125rem;
		font-weight: 500;
	}
	.jump a:hover {
		color: var(--text);
		border-color: var(--border-strong);
	}
	.pipeline {
		margin-bottom: 40px;
	}
	.head {
		display: grid;
		gap: 4px;
		margin-bottom: 12px;
		max-width: 68ch;
	}
	h3 {
		font-size: 1.125rem;
	}
</style>
