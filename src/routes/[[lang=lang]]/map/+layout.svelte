<script lang="ts">
	import { lhref, local, unlocalizedPath } from '#lib/i18n/index.svelte.ts';
	import { page } from '$app/state';
	import { concepts } from '#lib/content.ts';
	import { progress } from '#lib/progress.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	// English is the source; its keys type the other languages.
	const en = {
		eyebrow: 'Concept map',
		title: 'How it all fits together',
		lead: 'Four views of the same {n} concepts: where each technique sits in the field, what to learn before it, everything at a glance, and how the pieces chain into real-world pipelines.',
		learned: '✓ {n} learned',
		views: 'Map views',
		bigPicture: 'Big picture',
		prerequisites: 'Prerequisites',
		tree: 'Knowledge tree',
		pipelines: 'Pipelines'
	};
	const L = local({
		en,
		fr: {
			eyebrow: 'Carte des concepts',
			title: 'Comment tout s’articule',
			lead: 'Quatre vues des mêmes {n} concepts\u00a0: la place de chaque technique dans le domaine, ce qu’il faut apprendre avant, une vue d’ensemble, et la façon dont les briques s’enchaînent dans des pipelines réels.',
			learned: '✓ {n} appris',
			views: 'Vues de la carte',
			bigPicture: 'Vue d’ensemble',
			prerequisites: 'Prérequis',
			tree: 'Arbre des connaissances',
			pipelines: 'Pipelines'
		},
		ar: {
			eyebrow: 'خريطة المفاهيم',
			title: 'كيف يترابط كل شيء',
			lead: 'أربعة عروض لنفس المفاهيم الـ{n}: موقع كل تقنية في المجال، وما يجب تعلّمه قبلها، ونظرة شاملة على كل شيء، وكيف تتسلسل القطع في خطوط معالجة واقعية.',
			learned: '✓ تم تعلّم {n}',
			views: 'عروض الخريطة',
			bigPicture: 'الصورة الكبرى',
			prerequisites: 'المتطلبات المسبقة',
			tree: 'شجرة المعرفة',
			pipelines: 'خطوط المعالجة'
		}
	});

	const views = [
		{ href: '/map', key: 'bigPicture' },
		{ href: '/map/prerequisites', key: 'prerequisites' },
		{ href: '/map/tree', key: 'tree' },
		{ href: '/map/pipelines', key: 'pipelines' }
	] as const;

	// Compare without the base path and language prefix (/ar/map/tree → /map/tree).
	const current = $derived(unlocalizedPath(page.url.pathname).replace(/(.)\/$/, '$1'));

	// On narrow screens the view tabs scroll; keep the active one in sight.
	let nav = $state<HTMLElement>();
	$effect(() => {
		current;
		const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
		if (!nav || !active) return;
		// Rect-based so it works in both directions (RTL scrollLeft is negative).
		const a = active.getBoundingClientRect();
		const n = nav.getBoundingClientRect();
		nav.scrollLeft += a.left + a.width / 2 - (n.left + n.width / 2);
	});
</script>

<div class="container page">
	<header class="head">
		<span class="eyebrow">{L('eyebrow')}</span>
		<h1>{L('title')}</h1>
		<p class="muted">
			{L('lead', { n: concepts.length })}
			{#if progress.ready && progress.learned.size}
				<span class="learned">{L('learned', { n: progress.learned.size })}</span>
			{/if}
		</p>
	</header>

	<nav class="views" aria-label={L('views')} bind:this={nav}>
		{#each views as v (v.href)}
			<a href={lhref(v.href)} aria-current={current === v.href ? 'page' : undefined}>{L(v.key)}</a>
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
		inset-inline-start: 8px;
		inset-inline-end: 8px;
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
