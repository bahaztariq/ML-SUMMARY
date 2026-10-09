<script lang="ts">
	import { lhref, local, t } from '#lib/i18n/index.svelte.ts';

	// English is the source; its keys type the other languages.
	const en = {
		title: 'Tools',
		lead: 'Small interactive helpers for choosing, evaluating and comparing models.',
		wizardTitle: 'Which model?',
		wizardDesc: 'Answer a few questions about your data and goal, and get the algorithms and concepts that fit your problem.',
		wizardCta: 'Start the wizard',
		labTitle: 'Metrics lab',
		labDesc: 'Drag the four cells of a confusion matrix and watch accuracy, precision, recall, F1 and MCC react in real time.',
		labCta: 'Open the lab',
		compareTitle: 'Compare concepts',
		compareDesc: 'Put two or three concepts side by side: when to use them, requirements, hyperparameters, pros and cons.',
		compareCta: 'Compare'
	};
	const L = local({
		en,
		fr: {
			title: 'Outils',
			lead: 'De petits outils interactifs pour choisir, évaluer et comparer des modèles.',
			wizardTitle: 'Quel modèle\u00a0?',
			wizardDesc: 'Répondez à quelques questions sur vos données et votre objectif, et obtenez les algorithmes et concepts adaptés à votre problème.',
			wizardCta: 'Lancer l’assistant',
			labTitle: 'Labo des métriques',
			labDesc: 'Faites varier les quatre cases d’une matrice de confusion et regardez l’exactitude, la précision, le rappel, le F1 et le MCC réagir en temps réel.',
			labCta: 'Ouvrir le labo',
			compareTitle: 'Comparer des concepts',
			compareDesc: 'Mettez deux ou trois concepts côte à côte\u00a0: quand les utiliser, prérequis, hyperparamètres, avantages et inconvénients.',
			compareCta: 'Comparer'
		},
		ar: {
			title: 'الأدوات',
			lead: 'أدوات تفاعلية صغيرة لاختيار النماذج وتقييمها ومقارنتها.',
			wizardTitle: 'أي نموذج أختار؟',
			wizardDesc: 'أجب عن بضعة أسئلة حول بياناتك وهدفك، واحصل على الخوارزميات والمفاهيم التي تناسب مشكلتك.',
			wizardCta: 'ابدأ المساعد',
			labTitle: 'مختبر المقاييس',
			labDesc: 'حرّك الخلايا الأربع لمصفوفة الالتباس (confusion matrix) وشاهد الدقة الإجمالية والضبط والاستدعاء وF1 وMCC تتغير في الوقت الحقيقي.',
			labCta: 'افتح المختبر',
			compareTitle: 'مقارنة المفاهيم',
			compareDesc: 'ضع مفهومين أو ثلاثة جنبًا إلى جنب: متى تستخدمها، والمتطلبات، والمعاملات الفائقة، والمزايا والعيوب.',
			compareCta: 'قارن'
		}
	});

	const tools = [
		{ path: '/tools/which-model', icon: '🧭', key: 'wizard' },
		{ path: '/tools/metrics-lab', icon: '🎯', key: 'lab' },
		{ path: '/tools/compare', icon: '⚖️', key: 'compare' }
	] as const;
</script>

<svelte:head><title>{L('title')} · {t('site.name')}</title></svelte:head>

<div class="container page">
	<header class="head">
		<h1>{L('title')}</h1>
		<p class="muted">{L('lead')}</p>
	</header>

	<div class="grid">
		{#each tools as tool (tool.path)}
			<a class="card tool" href={lhref(tool.path)}>
				<span class="icon" aria-hidden="true">{tool.icon}</span>
				<h2>{L(`${tool.key}Title`)}</h2>
				<p class="muted">{L(`${tool.key}Desc`)}</p>
				<span class="cta">{L(`${tool.key}Cta`)} <span aria-hidden="true">{t('common.arrowForward')}</span></span>
			</a>
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
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 14px;
	}
	.tool {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 22px;
		transition:
			border-color 0.15s var(--ease),
			box-shadow 0.15s var(--ease),
			transform 0.15s var(--ease);
	}
	.tool:hover {
		border-color: var(--border-strong);
		box-shadow: var(--shadow);
		transform: translateY(-1px);
	}
	.icon {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: var(--surface-2);
		font-size: 1.35rem;
	}
	h2 {
		font-size: 1.125rem;
		margin-top: 4px;
	}
	p {
		font-size: 0.9rem;
	}
	.cta {
		margin-top: auto;
		padding-top: 6px;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--accent);
	}
</style>
