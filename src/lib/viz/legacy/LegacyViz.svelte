<!-- Mounts one of the original canvas playgrounds and re-renders it when the theme changes. -->
<script lang="ts">
	import { theme } from '#lib/theme.svelte.ts';
	import { renderVisualizer, destroyVisualizer } from './visualizers.js';
	import './legacy.css';

	let { id, accent }: { id: string; accent: string } = $props();
	let host = $state<HTMLDivElement>();

	$effect(() => {
		theme.version;
		if (host) renderVisualizer(id, host);
		return destroyVisualizer;
	});
</script>

<div class="legacy-viz" style:--modal-accent={accent} bind:this={host}></div>
