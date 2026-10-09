<script lang="ts">
	import '../app.css';
	import { onMount, untrack } from 'svelte';
	import { page } from '$app/state';
	import favicon from '#lib/assets/favicon.svg';
	import TopNav from '#lib/components/TopNav.svelte';
	import CommandPalette from '#lib/components/CommandPalette.svelte';
	import { progress } from '#lib/progress.svelte.ts';
	import { theme } from '#lib/theme.svelte.ts';
	import { i18n, isLang, LANG_INFO, LANGS, lhref, t, unlocalizedPath, type Lang } from '#lib/i18n/index.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const routeLang = (): Lang => (isLang(page.params.lang) ? page.params.lang : 'en');

	// Set synchronously so server rendering (one page at a time) uses the right language…
	i18n.current = untrack(routeLang);
	// …and keep it in sync on client-side navigation.
	$effect.pre(() => {
		const lang = routeLang();
		i18n.current = lang;
		document.documentElement.lang = lang;
		document.documentElement.dir = LANG_INFO[lang].dir;
	});

	onMount(() => {
		progress.load();
		theme.load();
	});

	const path = $derived(unlocalizedPath(page.url.pathname));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{t('site.name')}</title>
	{#each LANGS as l (l)}
		<link rel="alternate" hreflang={l} href={lhref(path, l)} />
	{/each}
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
