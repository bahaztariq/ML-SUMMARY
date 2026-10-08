<script lang="ts">
	import { learningPaths } from '#lib/content.ts';
	import PathCard from '#lib/components/PathCard.svelte';
</script>

<svelte:head><title>Learning paths · ML Hub</title></svelte:head>

<div class="container page">
	<header class="head">
		<h1>Learning paths</h1>
		<p class="muted">
			Each path is an ordered sequence of concepts, from the basics to the goal. Progress is saved in your browser.
		</p>
	</header>
	<div class="grid">
		{#each learningPaths as p (p.id)}
			<PathCard path={p} />
		{/each}
	</div>
</div>

<style>
	.page {
		padding-top: 36px;
	}
	.head {
		display: grid;
		gap: 8px;
		margin-bottom: 28px;
	}
	.head p {
		max-width: 60ch;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 12px;
	}
</style>
