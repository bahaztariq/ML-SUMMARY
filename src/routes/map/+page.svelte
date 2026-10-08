<script lang="ts">
	import { browser } from '$app/env';
	import { progress } from '#lib/progress.svelte.ts';
	import { taxonomyGraph } from '#lib/map/graphs.ts';
	import Diagram from '#lib/components/Diagram.svelte';

	const graph = $derived(taxonomyGraph(undefined, progress.isLearned));
</script>

<svelte:head>
	<title>Big picture · Map · ML Hub</title>
	<meta name="description" content="How the families of machine learning nest inside each other, from AI down to individual models." />
</svelte:head>

<section>
	<div class="intro">
		<h2>The big picture</h2>
		<p>
			How the major families of machine learning nest inside each other: from artificial intelligence down to the
			individual models you will actually train. Shaded pills are families, boxes are models. Click any node to open
			that concept.
		</p>
	</div>
	{#if browser && progress.ready}
		<Diagram source={graph.source} links={graph.links} label="Machine learning taxonomy" />
	{:else}
		<div class="card diagram-placeholder">Rendering diagram…</div>
	{/if}
</section>

