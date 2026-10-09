<script lang="ts">
	import { browser } from '$app/env';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { conceptsInTrack, tracks } from '#lib/content.ts';
	import { progress } from '#lib/progress.svelte.ts';
	import { prerequisiteGraph } from '#lib/map/graphs.ts';
	import Diagram from '#lib/components/Diagram.svelte';
	import { local, t } from '#lib/i18n/index.svelte.ts';
	import type { TrackId } from '#lib/types.ts';

	// English is the source; its keys type the other languages.
	const en = {
		title: 'Prerequisites',
		description: 'Prerequisite graph for each track: what to learn first and what it unlocks.',
		heading: 'Prerequisite graph',
		intro: 'Arrows point from what you should learn first to what it unlocks; arrows already implied by a longer chain are left out. Pick a track, then start from the concepts on the left. Click any node to open it.',
		tracks: 'Tracks',
		legend: 'Legend',
		thisTrack: 'This track',
		otherTrack: 'From another track',
		learned: 'Learned ✓',
		count: '{done}/{total} learned',
		showOther: 'Show other tracks'
	};
	const L = local({
		en,
		fr: {
			title: 'Prérequis',
			description: 'Le graphe des prérequis de chaque parcours : ce qu’il faut apprendre d’abord et ce que cela débloque.',
			heading: 'Graphe des prérequis',
			intro: 'Les flèches vont de ce qu’il faut apprendre d’abord vers ce que cela débloque ; les flèches déjà impliquées par une chaîne plus longue sont omises. Choisissez un parcours, puis commencez par les concepts de gauche. Cliquez sur un nœud pour l’ouvrir.',
			tracks: 'Parcours',
			legend: 'Légende',
			thisTrack: 'Ce parcours',
			otherTrack: 'D’un autre parcours',
			learned: 'Appris ✓',
			count: '{done}/{total} appris',
			showOther: 'Afficher les autres parcours'
		},
		ar: {
			title: 'المتطلبات المسبقة',
			description: 'مخطط المتطلبات المسبقة لكل مسار: ما يجب تعلّمه أولًا وما الذي يفتحه.',
			heading: 'مخطط المتطلبات المسبقة',
			intro: 'تشير الأسهم مما يجب أن تتعلمه أولًا إلى ما يفتحه؛ وتُحذف الأسهم التي تتضمنها سلسلة أطول. اختر مسارًا، ثم ابدأ من المفاهيم على اليسار. انقر على أي عقدة لفتحها.',
			tracks: 'المسارات',
			legend: 'مفتاح الألوان',
			thisTrack: 'هذا المسار',
			otherTrack: 'من مسار آخر',
			learned: 'تم تعلّمه ✓',
			count: 'تم تعلّم {done} من {total}',
			showOther: 'إظهار المسارات الأخرى'
		}
	});

	let track = $state<TrackId>('ml-core');
	let external = $state(true);

	// Read ?track= after hydration (search params are unavailable while prerendering).
	$effect(() => {
		if (!browser) return;
		const q = page.url.searchParams.get('track');
		if (q && tracks.some((x) => x.id === q)) track = q as TrackId;
	});

	function setTrack(id: TrackId) {
		track = id;
		const url = new URL(page.url.href);
		url.searchParams.set('track', id);
		replaceState(url, {});
	}

	const graph = $derived(prerequisiteGraph(track, progress.isLearned, { external }));
	const ids = $derived(conceptsInTrack(track).map((c) => c.id));
</script>

<svelte:head>
	<title>{L('title')} · {t('nav.map')} · {t('site.name')}</title>
	<meta name="description" content={L('description')} />
</svelte:head>

<section>
	<div class="intro">
		<h2>{L('heading')}</h2>
		<p>{L('intro')}</p>
	</div>

	<div class="tabs" role="tablist" aria-label={L('tracks')}>
		{#each tracks as tr (tr.id)}
			<button
				role="tab"
				aria-selected={track === tr.id}
				class:active={track === tr.id}
				style:--tc={tr.color}
				onclick={() => setTrack(tr.id)}
			>
				<span class="dot"></span>
				{tr.label}
				<span class="n">{conceptsInTrack(tr.id).length}</span>
			</button>
		{/each}
	</div>

	<div class="bar">
		<ul class="legend" aria-label={L('legend')}>
			<li><span class="swatch"></span>{L('thisTrack')}</li>
			{#if external}<li><span class="swatch ext"></span>{L('otherTrack')}</li>{/if}
			<li><span class="swatch done"></span>{L('learned')}</li>
		</ul>
		<span class="count">{L('count', { done: progress.countIn(ids), total: ids.length })}</span>
		<label class="toggle"><input type="checkbox" bind:checked={external} /> {L('showOther')}</label>
	</div>

	{#if browser && progress.ready}
		<Diagram source={graph.source} links={graph.links} label={L('heading')} />
	{:else}
		<div class="card diagram-placeholder">{t('common.renderingDiagram')}</div>
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
		margin-inline-start: auto;
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
