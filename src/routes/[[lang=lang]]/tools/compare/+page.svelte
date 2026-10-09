<script lang="ts">
	import { i18n, lhref, local, t } from '#lib/i18n/index.svelte.ts';
	import { untrack } from 'svelte';
	import { browser } from '$app/env';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { conceptById as metaById, trackById } from '#lib/content.ts';
	import { fullConceptById, localizeConcept } from '#lib/content-full.ts';
	import { MAX_SLOTS, parseSelection, requirementKeys, suggestions, writeSelection } from '#lib/tools/compare.ts';
	import { requirementLabel } from '#lib/tools/requirement-labels.ts';
	import ConceptPicker from '#lib/tools/ConceptPicker.svelte';
	import type { UiKey } from '#lib/i18n/ui/en.ts';
	import type { Concept } from '#lib/types.ts';

	// English is the source; its keys type the other languages.
	const en = {
		title: 'Compare concepts',
		description: 'Put two or three machine learning concepts side by side: when to use them, requirements, hyperparameters, pros and cons.',
		tools: 'Tools',
		lead: 'Pick two or three concepts and read them side by side. The URL updates so you can share a comparison.',
		change: 'Change',
		remove: 'Remove',
		removeName: 'Remove {name}',
		concept: 'Concept {slot}',
		pick: 'Pick concept {slot}',
		placeholderA: 'e.g. Random Forest',
		placeholderB: 'e.g. XGBoost',
		placeholderC: 'Add a third…',
		cancel: 'Cancel',
		removeSlot: 'Remove slot',
		pickFirst: 'Pick concept {slot} first.',
		trackCategory: 'Track & category',
		difficulty: 'Difficulty',
		summary: 'Summary',
		whenToUse: 'When to use',
		whenToAvoid: 'When to avoid',
		requirements: 'Requirements',
		hyperparameters: 'Hyperparameters',
		none: 'None',
		pros: 'Pros',
		cons: 'Cons',
		addThird: 'Add a third concept',
		popular: 'Popular comparisons',
		vs: 'vs'
	};
	const L = local({
		en,
		fr: {
			title: 'Comparer des concepts',
			description: 'Mettez deux ou trois concepts d’apprentissage automatique côte à côte\u00a0: quand les utiliser, prérequis, hyperparamètres, avantages et inconvénients.',
			tools: 'Outils',
			lead: 'Choisissez deux ou trois concepts et lisez-les côte à côte. L’URL se met à jour pour que vous puissiez partager la comparaison.',
			change: 'Changer',
			remove: 'Retirer',
			removeName: 'Retirer {name}',
			concept: 'Concept {slot}',
			pick: 'Choisir le concept {slot}',
			placeholderA: 'p.\u00a0ex. Random Forest',
			placeholderB: 'p.\u00a0ex. XGBoost',
			placeholderC: 'Ajouter un troisième…',
			cancel: 'Annuler',
			removeSlot: 'Retirer cet emplacement',
			pickFirst: 'Choisissez d’abord le concept {slot}.',
			trackCategory: 'Parcours et catégorie',
			difficulty: 'Difficulté',
			summary: 'Résumé',
			whenToUse: 'Quand l’utiliser',
			whenToAvoid: 'Quand l’éviter',
			requirements: 'Prérequis sur les données',
			hyperparameters: 'Hyperparamètres',
			none: 'Aucun',
			pros: 'Avantages',
			cons: 'Inconvénients',
			addThird: 'Ajouter un troisième concept',
			popular: 'Comparaisons populaires',
			vs: 'vs'
		},
		ar: {
			title: 'مقارنة المفاهيم',
			description: 'ضع مفهومين أو ثلاثة من مفاهيم التعلم الآلي جنبًا إلى جنب: متى تستخدمها، والمتطلبات، والمعاملات الفائقة، والمزايا والعيوب.',
			tools: 'الأدوات',
			lead: 'اختر مفهومين أو ثلاثة واقرأها جنبًا إلى جنب. يتحدّث الرابط تلقائيًا لتتمكن من مشاركة المقارنة.',
			change: 'تغيير',
			remove: 'إزالة',
			removeName: 'إزالة {name}',
			concept: 'المفهوم {slot}',
			pick: 'اختر المفهوم {slot}',
			placeholderA: 'مثلًا Random Forest',
			placeholderB: 'مثلًا XGBoost',
			placeholderC: 'أضف مفهومًا ثالثًا…',
			cancel: 'إلغاء',
			removeSlot: 'إزالة الخانة',
			pickFirst: 'اختر المفهوم {slot} أولًا.',
			trackCategory: 'المسار والفئة',
			difficulty: 'الصعوبة',
			summary: 'الملخص',
			whenToUse: 'متى تستخدمه',
			whenToAvoid: 'متى تتجنبه',
			requirements: 'المتطلبات',
			hyperparameters: 'المعاملات الفائقة',
			none: 'لا يوجد',
			pros: 'المزايا',
			cons: 'العيوب',
			addThird: 'أضف مفهومًا ثالثًا',
			popular: 'مقارنات شائعة',
			vs: 'مقابل'
		}
	});

	/** Full concepts in the current language (texts from content/i18n, ids and code unchanged). */
	const conceptById = {
		has: (id: string) => fullConceptById.has(id),
		get: (id: string) => {
			const c = fullConceptById.get(id);
			return c && localizeConcept(c, i18n.current);
		}
	};
	const slotName = (i: number) => String.fromCharCode(65 + i);

	let ids = $state<string[]>([]);
	let wantThird = $state(false);

	// Read ?a=&b=&c= after hydration (search params are unavailable while prerendering).
	$effect(() => {
		if (!browser) return;
		const next = parseSelection(page.url.searchParams, (id) => conceptById.has(id));
		untrack(() => {
			if (next.join() !== ids.join()) ids = next;
		});
	});

	function commit(next: string[]) {
		if (next.length !== ids.length) wantThird = false;
		ids = next;
		goto(writeSelection(new URL(page.url.href), next), { shallow: true, replace: true });
	}
	const add = (id: string) => commit([...ids, id].slice(0, MAX_SLOTS));
	const removeAt = (i: number) => commit(ids.filter((_, j) => j !== i));
	const replaceAt = (i: number, id: string) => commit(ids.map((x, j) => (j === i ? id : x)));

	const picked = $derived(ids.map((id) => conceptById.get(id)).filter((c): c is Concept => !!c));
	const slots = $derived(Math.min(MAX_SLOTS, Math.max(2, ids.length + (wantThird && ids.length === 2 ? 1 : 0))));
	const reqKeys = $derived(requirementKeys(picked));
	let changing = $state<number | null>(null);

	const reqValue = (c: Concept, k: string) => c.requirements?.[k];
	const pairs = suggestions.filter((p) => p.every((id) => conceptById.has(id)));
	// The light index has localized names without loading full concepts.
	const name = (id: string) => metaById.get(id)?.name ?? id;
	const compareHref = (a: string, b: string) => `${lhref('/tools/compare')}?a=${a}&b=${b}`;
</script>

<svelte:head>
	<title>{L('title')} · {t('site.name')}</title>
	<meta name="description" content={L('description')} />
</svelte:head>

{#snippet text(v: string | undefined)}
	{#if v}<p>{v}</p>{:else}<span class="none">—</span>{/if}
{/snippet}

{#snippet list(items: string[] | undefined, kind: 'pro' | 'con')}
	{#if items?.length}
		<ul class="bullets {kind}">
			{#each items as it, i (i)}<li>{it}</li>{/each}
		</ul>
	{:else}<span class="none">—</span>{/if}
{/snippet}

<div class="container page">
	<a class="back" href={lhref('/tools')}><span aria-hidden="true">{t('common.arrowBack')}</span> {L('tools')}</a>
	<header class="head">
		<h1>{L('title')}</h1>
		<p class="muted">{L('lead')}</p>
	</header>

	<!-- Scroll horizontally only when all three slots are filled, so picker dropdowns are never clipped. -->
	<div class="scroller" class:scroll={slots === 3 && picked.length === 3 && changing === null}>
		<div class="cmp" style:--cols={slots} class:three={slots === 3}>
			{#each Array.from({ length: slots }, (_, i) => i) as i (i)}
				{@const c = picked[i]}
				<div class="slot" class:filled={!!c}>
					{#if c && changing !== i}
						<div class="slot-head card" style:--tc={trackById[c.track].color}>
							<span class="track"><span class="dot"></span>{trackById[c.track].label}</span>
							<a class="slot-name" href={lhref(`/concept/${c.id}`)}>{c.name}</a>
							<div class="slot-actions">
								<button class="btn btn-ghost btn-sm" onclick={() => (changing = i)}>{L('change')}</button>
								<button class="btn btn-ghost btn-sm" aria-label={L('removeName', { name: c.name })} onclick={() => removeAt(i)}
									>{L('remove')}</button
								>
							</div>
						</div>
					{:else if c || i === ids.length}
						<div class="slot-pick">
							<span class="eyebrow">{L('concept', { slot: slotName(i) })}</span>
							<ConceptPicker
								exclude={ids}
								label={L('pick', { slot: slotName(i) })}
								placeholder={i === 0 ? L('placeholderA') : i === 1 ? L('placeholderB') : L('placeholderC')}
								onpick={(id) => {
									if (c) replaceAt(i, id);
									else add(id);
									changing = null;
								}}
							/>
							{#if c}
								<button class="btn btn-ghost btn-sm" onclick={() => (changing = null)}>{L('cancel')}</button>
							{:else if i === 2}
								<button class="btn btn-ghost btn-sm" onclick={() => (wantThird = false)}>{L('removeSlot')}</button>
							{/if}
						</div>
					{:else}
						<div class="slot-pick waiting">
							<span class="eyebrow">{L('concept', { slot: slotName(i) })}</span>
							<p class="muted">{L('pickFirst', { slot: slotName(i - 1) })}</p>
						</div>
					{/if}
				</div>
			{/each}

			{#if picked.length}
				<div class="row-h">{L('trackCategory')}</div>
				{#each Array.from({ length: slots }, (_, i) => picked[i]) as c, i (i)}
					<div class="cell">
						{#if c}
							<strong>{trackById[c.track].label}</strong>
							<span class="sub">{c.category}</span>
							{#if c.task?.length}
								<div class="chips">{#each c.task as task (task)}<span class="chip">{task}</span>{/each}</div>
							{/if}
						{/if}
					</div>
				{/each}

				<div class="row-h">{L('difficulty')}</div>
				{#each Array.from({ length: slots }, (_, i) => picked[i]) as c, i (i)}
					<div class="cell">
						{#if c}<span class="diff diff-{c.difficulty.toLowerCase()}">{t(`difficulty.${c.difficulty}` as UiKey)}</span
							>{/if}
					</div>
				{/each}

				<div class="row-h">{L('summary')}</div>
				{#each Array.from({ length: slots }, (_, i) => picked[i]) as c, i (i)}
					<div class="cell">{#if c}{@render text(c.summary)}{/if}</div>
				{/each}

				<div class="row-h">{L('whenToUse')}</div>
				{#each Array.from({ length: slots }, (_, i) => picked[i]) as c, i (i)}
					<div class="cell">{#if c}{@render text(c.whenToUse)}{/if}</div>
				{/each}

				<div class="row-h">{L('whenToAvoid')}</div>
				{#each Array.from({ length: slots }, (_, i) => picked[i]) as c, i (i)}
					<div class="cell">{#if c}{@render text(c.whenToAvoid)}{/if}</div>
				{/each}

				{#if reqKeys.length}
					<div class="row-h">{L('requirements')}</div>
					{#each reqKeys as k (k)}
						<div class="row-sub">{requirementLabel(k, i18n.current)}</div>
						{#each Array.from({ length: slots }, (_, i) => picked[i]) as c, i (i)}
							<div class="cell req">
								{#if c}
									{@const v = reqValue(c, k)}
									<span class="req-v" class:yes={v === true} class:na={v === undefined}
										>{v === undefined ? '—' : v === true ? t('common.yes') : v === false ? t('common.no') : v}</span
									>
								{/if}
							</div>
						{/each}
					{/each}
				{/if}

				<div class="row-h">{L('hyperparameters')}</div>
				{#each Array.from({ length: slots }, (_, i) => picked[i]) as c, i (i)}
					<div class="cell">
						{#if c}
							{#if c.parameters?.length}
								<strong>{c.parameters.length}</strong>
								<div class="chips">
									{#each c.parameters as p (p.name)}<code class="chip mono" title={p.impact}>{p.name}</code>{/each}
								</div>
							{:else}<span class="none">{L('none')}</span>{/if}
						{/if}
					</div>
				{/each}

				<div class="row-h">{L('pros')}</div>
				{#each Array.from({ length: slots }, (_, i) => picked[i]) as c, i (i)}
					<div class="cell">{#if c}{@render list(c.pros, 'pro')}{/if}</div>
				{/each}

				<div class="row-h">{L('cons')}</div>
				{#each Array.from({ length: slots }, (_, i) => picked[i]) as c, i (i)}
					<div class="cell">{#if c}{@render list(c.cons, 'con')}{/if}</div>
				{/each}
			{/if}
		</div>
	</div>

	{#if ids.length === 2 && slots === 2}
		<button class="btn add" onclick={() => (wantThird = true)}><span aria-hidden="true">＋</span> {L('addThird')}</button>
	{/if}

	{#if picked.length < 2}
		<section class="suggest">
			<span class="eyebrow">{L('popular')}</span>
			<div class="pairs">
				{#each pairs as [a, b] (a + b)}
					<a class="btn btn-sm" href={compareHref(a, b)}>{name(a)} <span class="vs">{L('vs')}</span> {name(b)}</a>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.page {
		padding-top: 28px;
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
	.scroller.scroll {
		margin-inline: -20px;
		padding-block: 0 4px;
		padding-inline: 20px;
		overflow-x: auto;
	}
	.cmp {
		display: grid;
		grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
		column-gap: 16px;
	}
	.scroll .cmp.three {
		grid-template-columns: repeat(3, minmax(220px, 1fr));
	}
	.slot {
		display: grid;
		align-content: start;
		padding-bottom: 8px;
	}
	.slot-head {
		display: grid;
		gap: 4px;
		padding: 14px 14px 8px;
		border-top: 3px solid var(--tc);
	}
	.track {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--text-3);
	}
	.dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--tc);
	}
	.slot-name {
		font-size: 1.0625rem;
		font-weight: 650;
		line-height: 1.3;
	}
	.slot-name:hover {
		color: var(--accent);
	}
	.slot-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 2px;
		margin-inline-start: -8px;
	}
	.slot-actions .btn {
		color: var(--text-3);
	}
	.slot-actions .btn:hover {
		color: var(--text);
	}
	.slot-pick {
		display: grid;
		gap: 8px;
		justify-items: start;
		padding: 14px;
		border: 1px dashed var(--border-strong);
		border-radius: var(--radius);
	}
	.slot-pick.waiting {
		opacity: 0.6;
	}
	.slot-pick p {
		font-size: 0.875rem;
	}
	.row-h {
		grid-column: 1 / -1;
		margin-top: 22px;
		padding-bottom: 8px;
		border-bottom: 1px solid var(--border);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	/* Letter-spacing breaks Arabic joining. */
	:global([dir='rtl']) .row-h {
		letter-spacing: 0;
		color: var(--text-3);
	}
	.row-sub {
		grid-column: 1 / -1;
		padding-top: 8px;
		font-size: 0.8125rem;
		color: var(--text-2);
	}
	.cell {
		min-width: 0;
		padding-top: 10px;
		font-size: 0.875rem;
		color: var(--text-2);
		overflow-wrap: anywhere;
	}
	.cell strong {
		color: var(--text);
		font-weight: 600;
	}
	.cell.req {
		padding-top: 2px;
		padding-bottom: 6px;
		border-bottom: 1px dashed var(--border);
	}
	.sub {
		display: block;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin-top: 6px;
	}
	.chip {
		padding: 1px 8px;
		border-radius: var(--radius-full);
		background: var(--surface-2);
		font-size: 0.75rem;
		color: var(--text-2);
	}
	.chip.mono {
		font-family: var(--font-mono);
		font-size: 0.72rem;
	}
	.none {
		color: var(--text-3);
	}
	.req-v {
		font-weight: 600;
		color: var(--text-2);
	}
	.req-v.yes {
		color: var(--success);
	}
	.req-v.na {
		font-weight: 400;
		color: var(--text-3);
	}
	.diff {
		display: inline-block;
		font-size: 0.75rem;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: var(--radius-full);
	}
	.diff-beginner {
		color: var(--success);
		background: color-mix(in srgb, var(--success) 10%, transparent);
	}
	.diff-intermediate {
		color: var(--warning);
		background: color-mix(in srgb, var(--warning) 12%, transparent);
	}
	.diff-advanced {
		color: var(--danger);
		background: color-mix(in srgb, var(--danger) 10%, transparent);
	}
	.bullets {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 6px;
	}
	.bullets li {
		position: relative;
		padding-inline-start: 18px;
	}
	.bullets li::before {
		position: absolute;
		inset-inline-start: 0;
		font-weight: 700;
	}
	.bullets.pro li::before {
		content: '+';
		color: var(--success);
	}
	.bullets.con li::before {
		content: '−';
		color: var(--danger);
	}
	.add {
		margin-top: 20px;
	}
	.suggest {
		margin-top: 32px;
		display: grid;
		gap: 10px;
	}
	.pairs {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.vs {
		color: var(--text-3);
		font-weight: 400;
	}
	@media (max-width: 560px) {
		.cmp {
			column-gap: 10px;
		}
		.slot-head {
			padding: 12px 10px 6px;
		}
		.slot-pick {
			padding: 10px;
		}
	}
</style>
