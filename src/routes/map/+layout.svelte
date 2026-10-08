<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { concepts } from '#lib/content.ts';
	import { progress } from '#lib/progress.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const views = [
		{ href: '/map', label: 'Big picture' },
		{ href: '/map/prerequisites', label: 'Prerequisites' },
		{ href: '/map/tree', label: 'Knowledge tree' },
		{ href: '/map/pipelines', label: 'Pipelines' }
	] as const;

	const current = $derived(page.url.pathname.replace(/\/$/, ''));

	// On narrow screens the view tabs scroll; keep the active one in sight.
	let nav = $state<HTMLElement>();
	$effect(() => {
		current;
		const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
		if (nav && active) nav.scrollLeft = active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
	});
</script>

<div class="container page">
	<header class="head">
		<span class="eyebrow">Concept map</span>
		<h1>How it all fits together</h1>
		<p class="muted">
			Four views of the same {concepts.length} concepts: where each technique sits in the field, what to learn before
			it, everything at a glance, and how the pieces chain into real-world pipelines.
			{#if progress.ready && progress.learned.size}
				<span class="learned">✓ {progress.learned.size} learned</span>
			{/if}
		</p>
	</header>

	<nav class="views" aria-label="Map views" bind:this={nav}>
		{#each views as v (v.href)}
			<a href={resolve(v.href)} aria-current={current === v.href ? 'page' : undefined}>{v.label}</a>
		{/each}
	</nav>

	<div class="view">
		{@render children()}
	</div>
</div>

<style>
	.page {
		padding-top: 36px;
	}
	.head {
		display: grid;
		gap: 8px;
		margin-bottom: 20px;
	}
	.head p {
		max-width: 64ch;
	}
	.learned {
		white-space: nowrap;
		color: var(--success);
		font-weight: 550;
	}
	.views {
		position: relative;
		display: flex;
		gap: 2px;
		margin-bottom: 28px;
		border-bottom: 1px solid var(--border);
		overflow-x: auto;
		scrollbar-width: none;
	}
	.views a {
		position: relative;
		padding: 10px 12px;
		color: var(--text-2);
		font-size: 0.9375rem;
		font-weight: 550;
		white-space: nowrap;
	}
	.views a:hover {
		color: var(--text);
	}
	.views a[aria-current='page'] {
		color: var(--text);
	}
	.views a[aria-current='page']::after {
		content: '';
		position: absolute;
		left: 8px;
		right: 8px;
		bottom: -1px;
		height: 2px;
		border-radius: 2px;
		background: var(--accent);
	}

	@media (max-width: 480px) {
		.views a {
			padding: 10px 8px;
			font-size: 0.875rem;
		}
	}

	/* Wide diagrams scroll horizontally; `safe` keeps their left edge reachable instead of centring it off-screen. */
	.view :global(.diagram .host) {
		justify-content: safe center;
	}

	/* Shared section intro used by every map view. */
	.view :global(.intro) {
		display: grid;
		gap: 6px;
		margin-bottom: 16px;
		max-width: 68ch;
	}
	.view :global(.intro p) {
		color: var(--text-2);
	}

	.view :global(.diagram-placeholder) {
		padding: 48px 16px;
		text-align: center;
		color: var(--text-3);
		font-size: 0.875rem;
	}

	/* Node classes emitted by #lib/map/graphs.ts, themed with tokens. */
	.view :global(g.node.group rect),
	.view :global(g.node.group path) {
		fill: var(--accent-soft) !important;
		stroke: color-mix(in srgb, var(--accent) 45%, var(--border)) !important;
	}
	.view :global(g.node.learned rect),
	.view :global(g.node.learned path) {
		fill: color-mix(in srgb, var(--success) 12%, var(--surface)) !important;
		stroke: color-mix(in srgb, var(--success) 60%, var(--border)) !important;
	}
	.view :global(g.node.external rect),
	.view :global(g.node.external path) {
		stroke-dasharray: 4 3 !important;
	}
	.view :global(g.node.external .nodeLabel) {
		color: var(--text-2) !important;
	}
</style>
