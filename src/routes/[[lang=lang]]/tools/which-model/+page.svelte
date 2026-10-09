<script lang="ts">
	import { i18n, lhref, local, t } from '#lib/i18n/index.svelte.ts';
	import { browser } from '$app/env';
	import { conceptById, getConcepts } from '#lib/content.ts';
	import { isQuestion, treeFor, treeToMermaid, walk } from '#lib/tools/wizard.ts';
	import ConceptCard from '#lib/components/ConceptCard.svelte';
	import Diagram from '#lib/components/Diagram.svelte';

	// English is the source; its keys type the other languages.
	const en = {
		title: 'Which model?',
		description: 'Answer a few questions about your data and goal, and get the machine learning models and concepts that fit.',
		tools: 'Tools',
		heading: 'Which model should I use?',
		lead: 'Answer a few questions and get the concepts that fit your problem.',
		answers: 'Your answers',
		start: 'Start',
		question: 'Question {n}',
		recommended: 'Recommended for you',
		startWith: 'Start with {name}',
		theseConcepts: 'these concepts',
		topPick: 'Top pick',
		changeLast: 'Change last answer',
		startOver: 'Start over',
		treeTitle: 'The whole decision tree',
		treeLead: 'Every question and answer at once. Click a recommendation box to open its top concept.',
		hideTree: 'Hide tree',
		showTree: 'Show full tree',
		treeLabel: 'Model selection decision tree'
	};
	const L = local({
		en,
		fr: {
			title: 'Quel modèle\u00a0?',
			description: 'Répondez à quelques questions sur vos données et votre objectif, et obtenez les modèles et concepts d’apprentissage automatique adaptés.',
			tools: 'Outils',
			heading: 'Quel modèle choisir\u00a0?',
			lead: 'Répondez à quelques questions et obtenez les concepts adaptés à votre problème.',
			answers: 'Vos réponses',
			start: 'Début',
			question: 'Question {n}',
			recommended: 'Recommandé pour vous',
			startWith: 'Commencez par {name}',
			theseConcepts: 'ces concepts',
			topPick: 'Premier choix',
			changeLast: 'Modifier la dernière réponse',
			startOver: 'Recommencer',
			treeTitle: 'L’arbre de décision complet',
			treeLead: 'Toutes les questions et réponses d’un coup d’œil. Cliquez sur une recommandation pour ouvrir son concept principal.',
			hideTree: 'Masquer l’arbre',
			showTree: 'Afficher l’arbre complet',
			treeLabel: 'Arbre de décision pour choisir un modèle'
		},
		ar: {
			title: 'أي نموذج؟',
			description: 'أجب عن بضعة أسئلة حول بياناتك وهدفك، واحصل على نماذج ومفاهيم التعلم الآلي المناسبة.',
			tools: 'الأدوات',
			heading: 'أي نموذج يجب أن أستخدم؟',
			lead: 'أجب عن بضعة أسئلة واحصل على المفاهيم التي تناسب مشكلتك.',
			answers: 'إجاباتك',
			start: 'البداية',
			question: 'السؤال {n}',
			recommended: 'موصى به لك',
			startWith: 'ابدأ بـ{name}',
			theseConcepts: 'هذه المفاهيم',
			topPick: 'الخيار الأول',
			changeLast: 'تغيير الإجابة الأخيرة',
			startOver: 'البدء من جديد',
			treeTitle: 'شجرة القرار كاملة',
			treeLead: 'كل الأسئلة والإجابات دفعة واحدة. انقر على مربع توصية لفتح مفهومه الأول.',
			hideTree: 'إخفاء الشجرة',
			showTree: 'عرض الشجرة كاملة',
			treeLabel: 'شجرة قرار اختيار النموذج'
		}
	});

	let choices = $state<number[]>([]);
	let showTree = $state(false);

	const tree = $derived(treeFor(i18n.current));
	const pos = $derived(walk(choices, tree));
	const question = $derived(isQuestion(pos.node) ? pos.node : null);
	const result = $derived(isQuestion(pos.node) ? null : pos.node);
	const picks = $derived(result ? getConcepts(result.result) : []);
	const diagram = $derived(treeToMermaid((id) => conceptById.get(id)?.name, tree));

	function choose(i: number) {
		choices = [...choices, i];
	}
	function goTo(step: number) {
		choices = choices.slice(0, step);
	}

	function onkeydown(e: KeyboardEvent) {
		if (!question || e.metaKey || e.ctrlKey || e.altKey) return;
		const target = e.target as HTMLElement | null;
		if (target?.closest('input, textarea, select, [contenteditable]')) return;
		const n = Number(e.key);
		if (Number.isInteger(n) && n >= 1 && n <= question.options.length) {
			e.preventDefault();
			choose(n - 1);
		} else if (e.key === 'Backspace' && choices.length) {
			e.preventDefault();
			goTo(choices.length - 1);
		}
	}
</script>

<svelte:window {onkeydown} />
<svelte:head>
	<title>{L('title')} · {t('site.name')}</title>
	<meta name="description" content={L('description')} />
</svelte:head>

<div class="container page">
	<a class="back" href={lhref('/tools')}><span aria-hidden="true">{t('common.arrowBack')}</span> {L('tools')}</a>
	<header class="head">
		<h1>{L('heading')}</h1>
		<p class="muted">{L('lead')}</p>
	</header>

	<section class="wizard card" aria-live="polite">
		<nav class="crumbs" aria-label={L('answers')}>
			<button class="crumb" class:current={choices.length === 0} onclick={() => goTo(0)}>{L('start')}</button>
			{#each pos.crumbs as c, i (i)}
				<span class="sep" aria-hidden="true">{i18n.rtl ? '‹' : '›'}</span>
				<button class="crumb" class:current={i === pos.crumbs.length - 1 && !question} title={c.question} onclick={() => goTo(i)}
					>{c.answer}</button
				>
			{/each}
		</nav>

		{#if question}
			{#key pos.key}
				<div class="step">
					<span class="eyebrow">{L('question', { n: pos.crumbs.length + 1 })}</span>
					<h2>{question.q}</h2>
					<div class="options">
						{#each question.options as o, i (o.next + i)}
							<button class="option" onclick={() => choose(i)}>
								<kbd aria-hidden="true">{i + 1}</kbd>
								<span>{o.label}</span>
								<span class="arrow" aria-hidden="true">{t('common.arrowForward')}</span>
							</button>
						{/each}
					</div>
					{#if choices.length}
						<button class="btn btn-ghost btn-sm" onclick={() => goTo(choices.length - 1)}
							><span aria-hidden="true">{t('common.arrowBack')}</span> {t('common.back')}</button
						>
					{/if}
				</div>
			{/key}
		{:else if result}
			<div class="step">
				<span class="eyebrow">{L('recommended')}</span>
				<h2>{L('startWith', { name: picks[0]?.name ?? L('theseConcepts') })}</h2>
				<p class="note">{result.note}</p>
				<div class="results">
					{#each picks as c, i (c.id)}
						<div class="pick" class:top={i === 0}>
							{#if i === 0}<span class="badge">{L('topPick')}</span>{/if}
							<ConceptCard concept={c} />
						</div>
					{/each}
				</div>
				<div class="actions">
					<button class="btn" onclick={() => goTo(choices.length - 1)}
						><span aria-hidden="true">{t('common.arrowBack')}</span> {L('changeLast')}</button
					>
					<button class="btn btn-primary" onclick={() => goTo(0)}><span aria-hidden="true">↺</span> {L('startOver')}</button>
				</div>
			</div>
		{/if}
	</section>
</div>

<div class="container">
	<section class="tree">
		<div class="tree-head">
			<div>
				<h2>{L('treeTitle')}</h2>
				<p class="muted">{L('treeLead')}</p>
			</div>
			<button class="btn" aria-expanded={showTree} onclick={() => (showTree = !showTree)}>
				{showTree ? L('hideTree') : L('showTree')}
			</button>
		</div>
		{#if browser && showTree}
			<Diagram source={diagram.source} links={diagram.links} highlight={diagram.nodeId(pos.key)} label={L('treeLabel')} />
		{/if}
	</section>
</div>

<style>
	.page {
		padding-top: 28px;
		max-width: 920px;
	}
	.back {
		font-size: 0.875rem;
		color: var(--text-3);
	}
	.back:hover {
		color: var(--text);
	}
	.head {
		display: grid;
		gap: 8px;
		margin: 16px 0 24px;
	}
	.wizard {
		padding: 20px 24px 26px;
	}
	.crumbs {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 6px;
		padding-bottom: 16px;
		margin-bottom: 22px;
		border-bottom: 1px solid var(--border);
	}
	.crumb {
		max-width: 100%;
		padding: 3px 10px;
		border: 1px solid var(--border);
		border-radius: var(--radius-full);
		background: var(--surface-2);
		color: var(--text-2);
		font-size: 0.8125rem;
		cursor: pointer;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.crumb:hover {
		border-color: var(--border-strong);
		color: var(--text);
	}
	.crumb.current {
		background: var(--accent-soft);
		border-color: transparent;
		color: var(--accent);
		font-weight: 600;
	}
	.sep {
		color: var(--text-3);
	}
	.step {
		display: grid;
		gap: 12px;
		justify-items: start;
		animation: rise 0.22s var(--ease);
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
	}
	.step h2 {
		font-size: clamp(1.25rem, 1.1rem + 0.8vw, 1.6rem);
		margin-bottom: 6px;
	}
	.options {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 10px;
		width: 100%;
	}
	.option {
		display: flex;
		align-items: center;
		gap: 12px;
		min-height: 72px;
		padding: 16px 18px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		text-align: start;
		font-size: 0.975rem;
		font-weight: 550;
		cursor: pointer;
		transition:
			border-color 0.15s var(--ease),
			box-shadow 0.15s var(--ease),
			transform 0.15s var(--ease);
	}
	.option:hover {
		border-color: var(--accent);
		box-shadow: var(--shadow);
		transform: translateY(-1px);
	}
	.option span:not(.arrow) {
		flex: 1;
	}
	.arrow {
		color: var(--text-3);
		transition: transform 0.15s var(--ease);
	}
	.option:hover .arrow {
		color: var(--accent);
		transform: translateX(2px);
	}
	:global([dir='rtl']) .option:hover .arrow {
		transform: translateX(-2px);
	}
	.note {
		max-width: 62ch;
		padding: 12px 14px;
		border-inline-start: 3px solid var(--accent);
		border-start-end-radius: var(--radius-sm);
		border-end-end-radius: var(--radius-sm);
		background: var(--accent-soft);
		color: var(--text);
		font-size: 0.925rem;
	}
	.results {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 12px;
		width: 100%;
		margin-top: 6px;
	}
	.pick {
		position: relative;
		display: grid;
	}
	.pick.top :global(.card) {
		border-color: var(--accent);
	}
	.badge {
		position: absolute;
		top: -9px;
		inset-inline-end: 12px;
		z-index: 1;
		padding: 1px 8px;
		border-radius: var(--radius-full);
		background: var(--accent);
		color: var(--text-on-accent);
		font-size: 0.6875rem;
		font-weight: 700;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 8px;
	}
	.tree {
		margin-top: 40px;
		display: grid;
		gap: 14px;
	}
	/* Wide trees overflow the panel: keep the left edge reachable when scrolling. */
	.tree :global(.host) {
		justify-content: safe center;
	}
	.tree-head {
		width: 100%;
		max-width: 880px;
		margin: 0 auto;
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: 12px;
	}
	.tree-head h2 {
		font-size: 1.125rem;
		margin-bottom: 4px;
	}
	.tree-head p {
		font-size: 0.875rem;
	}
	@media (max-width: 560px) {
		.wizard {
			padding: 16px 16px 20px;
		}
		.option {
			min-height: 60px;
		}
	}
</style>
