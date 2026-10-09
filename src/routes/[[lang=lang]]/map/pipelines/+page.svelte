<script lang="ts">
	import { browser } from '$app/env';
	import { i18n, local, t } from '#lib/i18n/index.svelte.ts';
	import { localizePipeline, pipelineGraph, pipelines } from '#lib/map/graphs.ts';
	import Diagram from '#lib/components/Diagram.svelte';

	// English is the source; its keys type the other languages.
	const en = {
		title: 'Pipelines',
		description: 'End-to-end flows: the ML lifecycle, a modern data platform, leak-free preprocessing and the neural network training loop.',
		intro: 'Concepts rarely live alone. These flows show how they chain together in practice, end to end. Every step that has its own concept page is clickable.'
	};
	const L = local({
		en,
		fr: {
			title: 'Pipelines',
			description: 'Des flux de bout en bout : le cycle de vie du ML, une plateforme de données moderne, un prétraitement sans fuite et la boucle d’entraînement d’un réseau de neurones.',
			intro: 'Les concepts vivent rarement seuls. Ces flux montrent comment ils s’enchaînent en pratique, de bout en bout. Chaque étape qui a sa propre page de concept est cliquable.'
		},
		ar: {
			title: 'خطوط المعالجة',
			description: 'تدفقات من البداية إلى النهاية: دورة حياة التعلم الآلي، ومنصة بيانات حديثة، ومعالجة مسبقة دون تسرّب، وحلقة تدريب الشبكة العصبية.',
			intro: 'نادرًا ما تعيش المفاهيم منفردة. تُظهر هذه التدفقات كيف تتسلسل عمليًا من البداية إلى النهاية. كل خطوة لها صفحة مفهوم خاصة بها قابلة للنقر.'
		}
	});

	const graphs = $derived(
		pipelines.map((raw) => {
			const p = localizePipeline(raw, i18n.current);
			return { ...p, graph: pipelineGraph(p) };
		})
	);
</script>

<svelte:head>
	<title>{L('title')} · {t('nav.map')} · {t('site.name')}</title>
	<meta name="description" content={L('description')} />
</svelte:head>

<div class="intro">
	<h2>{L('title')}</h2>
	<p>{L('intro')}</p>
</div>

<nav class="jump" aria-label={L('title')}>
	{#each graphs as p (p.id)}
		<a href="#{p.id}"><span aria-hidden="true">{p.icon}</span> {p.title}</a>
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
			<div class="card diagram-placeholder">{t('common.renderingDiagram')}</div>
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
