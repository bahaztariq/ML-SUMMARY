<script lang="ts">
	import { browser } from '$app/env';
	import { local, t } from '#lib/i18n/index.svelte.ts';
	import { progress } from '#lib/progress.svelte.ts';
	import { taxonomyGraph } from '#lib/map/graphs.ts';
	import Diagram from '#lib/components/Diagram.svelte';

	// English is the source; its keys type the other languages.
	const en = {
		title: 'Big picture',
		description: 'How the families of machine learning nest inside each other, from AI down to individual models.',
		heading: 'The big picture',
		intro: 'How the major families of machine learning nest inside each other: from artificial intelligence down to the individual models you will actually train. Shaded pills are families, boxes are models. Click any node to open that concept.',
		label: 'Machine learning taxonomy'
	};
	const L = local({
		en,
		fr: {
			title: 'Vue d’ensemble',
			description: 'Comment les familles de l’apprentissage automatique s’emboîtent, de l’IA jusqu’aux modèles individuels.',
			heading: 'La vue d’ensemble',
			intro: 'Comment les grandes familles de l’apprentissage automatique s’emboîtent les unes dans les autres : de l’intelligence artificielle jusqu’aux modèles que vous entraînerez réellement. Les pastilles colorées sont des familles, les rectangles des modèles. Cliquez sur un nœud pour ouvrir le concept.',
			label: 'Taxonomie de l’apprentissage automatique'
		},
		ar: {
			title: 'الصورة الكبرى',
			description: 'كيف تتداخل عائلات التعلم الآلي بعضها في بعض، من الذكاء الاصطناعي وصولًا إلى النماذج الفردية.',
			heading: 'الصورة الكبرى',
			intro: 'كيف تتداخل العائلات الكبرى للتعلم الآلي بعضها في بعض: من الذكاء الاصطناعي وصولًا إلى النماذج الفردية التي ستدرّبها فعلًا. الأشكال البيضاوية المظللة هي العائلات، والمستطيلات هي النماذج. انقر على أي عقدة لفتح ذلك المفهوم.',
			label: 'تصنيف التعلم الآلي'
		}
	});

	// Concept names and family labels read the current language, so this rebuilds when it changes.
	const graph = $derived(taxonomyGraph(undefined, progress.isLearned));
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
	{#if browser && progress.ready}
		<Diagram source={graph.source} links={graph.links} label={L('label')} />
	{:else}
		<div class="card diagram-placeholder">{t('common.renderingDiagram')}</div>
	{/if}
</section>
