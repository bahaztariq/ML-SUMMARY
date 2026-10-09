<script lang="ts">
	import { lhref, local, t } from '#lib/i18n/index.svelte.ts';
	import { progress } from '#lib/progress.svelte.ts';
	import { knowledgeTree } from '#lib/map/graphs.ts';
	import type { UiKey } from '#lib/i18n/ui/en.ts';

	// English is the source; its keys type the other languages.
	const en = {
		title: 'Knowledge tree',
		description: 'Every concept organised by track and category, with your learning progress.',
		intro: 'Every concept, organised by track and category, with your progress alongside. Use it as a checklist: collapse what you have covered and see what is left.',
		collapseAll: 'Collapse all',
		expandAll: 'Expand all',
		learned: 'Learned'
	};
	const L = local({
		en,
		fr: {
			title: 'Arbre des connaissances',
			description: 'Tous les concepts classés par parcours et par catégorie, avec votre progression.',
			intro: 'Tous les concepts, classés par parcours et par catégorie, avec votre progression à côté. Utilisez-le comme une liste de contrôle\u00a0: repliez ce que vous avez couvert et voyez ce qui reste.',
			collapseAll: 'Tout replier',
			expandAll: 'Tout déplier',
			learned: 'Appris'
		},
		ar: {
			title: 'شجرة المعرفة',
			description: 'كل المفاهيم مرتبة حسب المسار والفئة، مع تقدّمك في التعلّم.',
			intro: 'كل المفاهيم مرتبة حسب المسار والفئة، مع تقدّمك بجانبها. استخدمها كقائمة مراجعة: اطوِ ما أنهيته وشاهد ما تبقّى.',
			collapseAll: 'طيّ الكل',
			expandAll: 'توسيع الكل',
			learned: 'تم تعلّمه'
		}
	});

	// Category names are localized getters: rebuild the tree when the language changes.
	const tree = $derived(knowledgeTree());
	// Open state is keyed by track and category position, so it survives a language switch.
	const keys = $derived(tree.flatMap((tt) => [tt.track.id, ...tt.categories.map((_, i) => `${tt.track.id}/${i}`)]));

	let open = $state<Record<string, boolean>>({});
	const isOpen = (k: string) => open[k] ?? true;
	const allOpen = $derived(keys.every(isOpen));

	function setAll(value: boolean) {
		for (const k of keys) open[k] = value;
	}

	const count = (ids: { id: string }[]) => progress.countIn(ids.map((c) => c.id));
</script>

<svelte:head>
	<title>{L('title')} · {t('nav.map')} · {t('site.name')}</title>
	<meta name="description" content={L('description')} />
</svelte:head>

<section>
	<div class="intro">
		<h2>{L('title')}</h2>
		<p>{L('intro')}</p>
	</div>

	<div class="bar">
		<button class="btn btn-sm" onclick={() => setAll(!allOpen)} aria-pressed={allOpen}>
			{allOpen ? L('collapseAll') : L('expandAll')}
		</button>
	</div>

	<ul class="tree">
		{#each tree as tt (tt.track.id)}
			<li style:--tc={tt.track.color}>
				<details bind:open={() => isOpen(tt.track.id), (v) => (open[tt.track.id] = v)}>
					<summary class="track">
						<span class="dot"></span>
						<span class="name">{tt.track.label}</span>
						<span class="count">{count(tt.concepts)}/{tt.concepts.length}</span>
					</summary>
					<ul>
						{#each tt.categories as cat, ci (ci)}
							{@const key = `${tt.track.id}/${ci}`}
							<li>
								<details bind:open={() => isOpen(key), (v) => (open[key] = v)}>
									<summary class="category">
										<span class="name">{cat.name}</span>
										<span class="count">{count(cat.items)}/{cat.items.length}</span>
									</summary>
									<ul class="leaves">
										{#each cat.items as c (c.id)}
											{@const learned = progress.isLearned(c.id)}
											<li>
												<a href={lhref(`/concept/${c.id}`)} class:learned>
													<span class="check" aria-label={learned ? L('learned') : undefined}>{learned ? '✓' : ''}</span>
													<span class="name">{c.name}</span>
													<span class="diff diff-{c.difficulty.toLowerCase()}">{t(`difficulty.${c.difficulty}` as UiKey)}</span>
												</a>
											</li>
										{/each}
									</ul>
								</details>
							</li>
						{/each}
					</ul>
				</details>
			</li>
		{/each}
	</ul>
</section>

<style>
	.bar {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 12px;
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.tree {
		columns: 2 420px;
		column-gap: 12px;
	}
	.tree > li {
		break-inside: avoid;
		margin-bottom: 12px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		overflow: hidden;
	}
	summary {
		display: flex;
		align-items: center;
		gap: 10px;
		cursor: pointer;
		list-style: none;
		user-select: none;
	}
	summary::-webkit-details-marker {
		display: none;
	}
	summary::before {
		content: '';
		flex: none;
		width: 6px;
		height: 6px;
		margin: 0 2px;
		border-right: 1.5px solid var(--text-3);
		border-bottom: 1.5px solid var(--text-3);
		transform: rotate(-45deg);
		transition: transform 0.15s var(--ease);
	}
	/* Closed chevrons point toward the reading direction: › in LTR, ‹ in RTL. */
	:global([dir='rtl']) summary::before {
		transform: rotate(135deg);
	}
	details[open] > summary::before {
		transform: rotate(45deg);
	}
	summary:hover {
		background: var(--surface-2);
	}
	.track {
		padding: 12px 16px;
		font-weight: 600;
		font-size: 1rem;
	}
	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--tc);
	}
	.count {
		margin-inline-start: auto;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--text-3);
		font-variant-numeric: tabular-nums;
	}
	.track + ul {
		padding: 0 8px 8px;
		border-top: 1px solid var(--border);
	}
	.category {
		padding: 8px 8px;
		border-radius: var(--radius-sm);
		font-size: 0.875rem;
		font-weight: 550;
		color: var(--text-2);
	}
	.leaves {
		margin-block: 0 6px;
		margin-inline: 21px 0;
		padding-inline-start: 10px;
		border-inline-start: 1px solid var(--border);
	}
	.leaves a {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 5px 8px;
		border-radius: var(--radius-sm);
		font-size: 0.875rem;
	}
	.leaves a:hover {
		background: var(--surface-2);
	}
	.check {
		flex: none;
		display: inline-grid;
		place-items: center;
		width: 16px;
		height: 16px;
		border: 1px solid var(--border-strong);
		border-radius: 4px;
		font-size: 0.6875rem;
		line-height: 1;
	}
	.learned .check {
		border-color: var(--success);
		background: var(--success);
		color: var(--text-on-accent);
	}
	.learned .name {
		color: var(--text-2);
	}
	.leaves .name {
		flex: 1;
		min-width: 0;
	}
	.diff {
		font-size: 0.75rem;
		color: var(--text-3);
	}
	.diff-beginner {
		color: var(--success);
	}
	.diff-intermediate {
		color: var(--warning);
	}
	.diff-advanced {
		color: var(--danger);
	}
</style>
