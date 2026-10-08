<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import favicon from '#lib/assets/favicon.svg';
	import TopNav from '#lib/components/TopNav.svelte';
	import CommandPalette from '#lib/components/CommandPalette.svelte';
	import { progress } from '#lib/progress.svelte.ts';
	import { theme } from '#lib/theme.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	onMount(() => {
		progress.load();
		theme.load();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>ML Hub</title>
</svelte:head>

<TopNav />
<main>
	{@render children()}
</main>
<CommandPalette />

<style>
	main {
		min-height: calc(100dvh - var(--nav-h));
		padding-bottom: 96px;
	}
</style>
