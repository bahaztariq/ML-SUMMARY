<script lang="ts">
	import { i18n, lhref, t } from '#lib/i18n/index.svelte.ts';
	import { untrack } from 'svelte';
	import { browser } from '$app/env';
	import { page } from '$app/state';
	import {
		conceptById,
		formatKey,
		getConcepts,
		getDependents,
		learningChain,
		pathById,
		roadmapOrder,
		roadmapPosition,
		stageConceptIds,
		trackById
	} from '#lib/content.ts';
	import { progress } from '#lib/progress.svelte.ts';
	import { hasExplainer, hasPlayground, loadExplainer } from '#lib/explainers/registry.ts';
	import Player from '#lib/explainers/Player.svelte';
	import ConceptCard from '#lib/components/ConceptCard.svelte';
	import CodeBlock from '#lib/components/CodeBlock.svelte';
	import Diagram from '#lib/components/Diagram.svelte';
	import type { UiKey } from '#lib/i18n/ui/en.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const c = $derived(data.concept);
	const track = $derived(trackById[c.track]);
	const learned = $derived(progress.isLearned(c.id));

	const prereqs = $derived(getConcepts(c.prerequisites));
	const unlocks = $derived(getDependents(c.id));
	const related = $derived(getConcepts(c.related));
	const chain = $derived(learningChain(c, progress.isLearned));

	/*
	 * Where this concept sits: the learning path in ?path=<id> when the learner came from one,
	 * otherwise its stage in the roadmap. Previous/next follow that order.
	 */
	const ctx = $derived.by(() => {
		const wanted = browser ? page.url.searchParams.get('path') : null;
		const path = wanted ? pathById.get(wanted) : undefined;
		if (path && path.steps.includes(c.id)) {
			const index = path.steps.indexOf(c.id);
			return {
				label: `${path.icon} ${path.title}`,
				href: lhref(`/paths/${path.id}`),
				position: t('concept.stepOf', { i: index + 1, n: path.steps.length }),
				steps: path.steps,
				index,
				query: `?path=${path.id}`,
				prev: conceptById.get(path.steps[index - 1]),
				next: conceptById.get(path.steps[index + 1])
			};
		}
		const pos = roadmapPosition(c.id);
		if (!pos) return null;
		const at = roadmapOrder.indexOf(c.id);
		const stageLabel = pos.stage.kind === 'core' ? t('concept.stageN', { n: pos.stageIndex + 1 }) : t('concept.specialization');
		return {
			label: `${pos.stage.icon} ${stageLabel} · ${pos.stage.title}`,
			href: `${lhref('/roadmap')}#${pos.stage.id}`,
			position: t('concept.posInStage', { i: pos.index + 1, n: pos.size }),
			steps: stageConceptIds(pos.stage),
			index: pos.index,
			query: '',
			prev: conceptById.get(roadmapOrder[at - 1]),
			next: conceptById.get(roadmapOrder[at + 1])
		};
	});
	const nextUp = $derived(ctx?.next ?? unlocks.find((u) => !progress.isLearned(u.id)) ?? unlocks[0]);
	const pathHref = (id: string) => `${lhref(`/concept/${id}`)}${ctx?.query ?? ''}`;

	$effect(() => {
		const id = c.id;
		if (progress.ready) untrack(() => progress.visit(id));
	});

	const sections = $derived(
		[
			{ id: 'intuition', label: t('concept.intuition'), show: !!c.intuition },
			{ id: 'when', label: t('concept.whenToUse'), show: !!(c.whenToUse || c.whenToAvoid) },
			{ id: 'how', label: t('concept.howItWorks'), show: !!c.diagram },
			{ id: 'math', label: t('concept.math'), show: !!(c.math?.formula || c.math?.explanation) },
			{ id: 'params', label: t('concept.hyperparameters'), show: !!c.parameters?.length },
			{ id: 'tradeoffs', label: t('concept.tradeoffs'), show: !!(c.pros?.length || c.cons?.length) },
			{ id: 'code', label: t('concept.code'), show: !!c.codeSnippet },
			{ id: 'connections', label: t('concept.whereItFits'), show: true }
		].filter((s) => s.show)
	);

	let activeSection = $state('');
	$effect(() => {
		sections;
		const els = sections.map((s) => document.getElementById(s.id)).filter((x): x is HTMLElement => !!x);
		const io = new IntersectionObserver(
			(entries) => {
				const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible[0]) activeSection = visible[0].target.id;
			},
			{ rootMargin: '-80px 0px -60% 0px' }
		);
		els.forEach((el) => io.observe(el));
		return () => io.disconnect();
	});

	const METRIC_CONCEPTS = new Set(['confusion-matrix-concept', 'precision-recall-f1', 'roc-auc', 'pr-curve', 'class-imbalance']);

	const requirementValue = (v: boolean | string) => (v === true ? t('common.yes') : v === false ? t('common.no') : v);
	/** Known requirement keys are translated; others fall back to a readable form of the key. */
	const requirementLabel = (k: string) => {
		const key = `req.${k}` as UiKey;
		const label = t(key);
		return label === key ? formatKey(k) : label;
	};
</script>

<svelte:head>
	<title>{c.name} · {t('site.name')}</title>
	<meta name="description" content={c.summary} />
</svelte:head>

<article style:--tc={track.color}>
	<header class="hero">
		<div class="container">
			<nav class="crumbs" aria-label={t('concept.breadcrumb')}>
				<a href={lhref('/learn')}>{t('nav.learn')}</a>
				<span>/</span>
				<a href="{lhref('/learn')}?track={track.id}">{track.label}</a>
			</nav>

			{#if ctx}
				<div class="path-bar">
					<a class="path-name" href={ctx.href}>{ctx.label}</a>
					<span class="path-pos">{ctx.position}</span>
					<div class="path-track" aria-hidden="true">
						{#each ctx.steps as sid, i (sid)}
							<span class:done={progress.isLearned(sid)} class:here={i === ctx.index}></span>
						{/each}
					</div>
				</div>
			{/if}

			<div class="title-row">
				<div>
					<h1>{c.name}</h1>
					<p class="summary">{c.summary}</p>
				</div>
			</div>

			<div class="chips">
				<span class="chip track-chip"><span class="dot"></span>{track.label}</span>
				<span class="chip">{c.category}</span>
				<span class="chip diff-{c.difficulty.toLowerCase()}">{t(`difficulty.${c.difficulty}`)}</span>
				{#each c.task ?? [] as task (task)}
					<span class="chip subtle">{task}</span>
				{/each}
			</div>

			<div class="actions">
				<button class="btn" class:learned onclick={() => progress.toggle(c.id)} aria-pressed={learned}>
					{learned ? t('concept.learned') : t('concept.markLearned')}
				</button>
				{#if hasExplainer(c.id)}
					<a class="btn btn-ghost" href="#lesson">{t('concept.startLesson')}</a>
				{/if}
				{#if METRIC_CONCEPTS.has(c.id)}
					<a class="btn btn-ghost" href={lhref('/tools/metrics-lab')}>{t('concept.openMetricsLab')}</a>
				{/if}
				<a class="btn btn-ghost" href="{lhref('/tools/compare')}?a={c.id}">{t('concept.compareWith')}</a>
			</div>
		</div>
	</header>

	{#if hasExplainer(c.id)}
		<section id="lesson" class="container lesson">
			{#await loadExplainer(c.id)}
				<div class="lesson-loading card">{t('concept.loadingLesson')}</div>
			{:then mod}
				{#if mod}
					<div class="section-head">
						<span class="eyebrow">{t('common.interactiveLesson')}</span>
						<h2>{(i18n.current !== 'en' && mod.i18n?.[i18n.current]?.title) || mod.title}</h2>
					</div>
					{#key c.id}
						<Player
							module={mod}
							accent={track.color}
							onfinish={() => {
								if (!learned) progress.toggle(c.id);
								document.getElementById('finish')?.scrollIntoView({ behavior: 'smooth' });
							}}
						/>
					{/key}
				{/if}
			{/await}
		</section>
	{:else if hasPlayground(c.id)}
		<section id="lesson" class="container lesson">
			<div class="section-head">
				<span class="eyebrow">{t('common.playground')}</span>
				<h2>{t('concept.tryIt')}</h2>
			</div>
			{#if browser}
				{#await import('#lib/viz/legacy/LegacyViz.svelte') then { default: LegacyViz }}
					{#key c.id}<LegacyViz id={c.id} accent={track.color} />{/key}
				{/await}
			{/if}
		</section>
	{/if}

	<div class="container body">
		<div class="main">
			{#if c.intuition}
				<section id="intuition">
					<h2>{t('concept.intuition')}</h2>
					<blockquote class="intuition">{c.intuition}</blockquote>
				</section>
			{/if}

			{#if c.whenToUse || c.whenToAvoid}
				<section id="when">
					<h2>{t('concept.whenToUse')}</h2>
					<div class="two">
						{#if c.whenToUse}
							<div class="card use">
								<h3><span class="icon">✓</span> {t('concept.useWhen')}</h3>
								<p>{c.whenToUse}</p>
							</div>
						{/if}
						{#if c.whenToAvoid}
							<div class="card avoid">
								<h3><span class="icon">✕</span> {t('concept.avoidWhen')}</h3>
								<p>{c.whenToAvoid}</p>
							</div>
						{/if}
					</div>
					{#if c.requirements && Object.keys(c.requirements).length}
						<div class="reqs">
							{#each Object.entries(c.requirements) as [k, v] (k)}
								<div class="req">
									<span class="req-k">{requirementLabel(k)}</span>
									<span class="req-v" class:yes={v === true} class:no={v === false}>{requirementValue(v)}</span>
								</div>
							{/each}
						</div>
					{/if}
				</section>
			{/if}

			{#if c.diagram}
				<section id="how">
					<h2>{t('concept.howItWorks')}</h2>
					{#if browser}
						<Diagram source={c.diagram} label={t('concept.howItWorksOf', { name: c.name })} />
					{/if}
				</section>
			{/if}

			{#if c.math?.formula || c.math?.explanation}
				<section id="math">
					<h2>{t('concept.math')}</h2>
					{#if c.math.formula}
						<div class="formula" dir="ltr">{c.math.formula}</div>
					{/if}
					{#if c.math.loss}
						<p class="loss"><span class="eyebrow">{t('concept.loss')}</span> {c.math.loss}</p>
					{/if}
					{#if c.math.explanation}
						<p class="prose">{c.math.explanation}</p>
					{/if}
				</section>
			{/if}

			{#if c.parameters?.length}
				<section id="params">
					<h2>{t('concept.hyperparameters')}</h2>
					<div class="params">
						{#each c.parameters as p (p.name)}
							<div class="param card">
								<div class="param-head">
									<code class="param-name">{p.name}</code>
									{#if p.type}<span class="param-type">{p.type}</span>{/if}
									{#if p.default}<span class="param-default">{t('concept.default')} <code>{p.default}</code></span>{/if}
								</div>
								{#if p.impact}<p>{p.impact}</p>{/if}
								{#if p.tuningTip}<p class="tip"><strong>{t('concept.tuningTip')}</strong> {p.tuningTip}</p>{/if}
							</div>
						{/each}
					</div>
				</section>
			{/if}

			{#if c.pros?.length || c.cons?.length}
				<section id="tradeoffs">
					<h2>{t('concept.tradeoffs')}</h2>
					<div class="two">
						<ul class="list pros">
							{#each c.pros ?? [] as p (p)}<li>{p}</li>{/each}
						</ul>
						<ul class="list cons">
							{#each c.cons ?? [] as p (p)}<li>{p}</li>{/each}
						</ul>
					</div>
				</section>
			{/if}

			{#if c.codeSnippet}
				<section id="code">
					<h2>{t('concept.code')}</h2>
					<CodeBlock code={c.codeSnippet} />
				</section>
			{/if}

			<section id="connections">
				<div class="h2-row">
					<h2>{t('concept.whereItFits')}</h2>
					<a class="map-link" href="{lhref('/map/prerequisites')}?track={c.track}">{t('concept.seeMap', { track: track.label })} {t('common.arrowForward')}</a>
				</div>
				{#if browser && (prereqs.length || unlocks.length)}
					<Diagram source={chain.source} links={chain.links} highlight={chain.current} label={t('concept.learningChain')} />
				{/if}
				<div class="link-groups">
					{#each [{ title: t('concept.learnFirst'), list: prereqs }, { title: t('concept.unlocks'), list: unlocks }, { title: t('concept.related'), list: related }] as g (g.title)}
						{#if g.list.length}
							<div>
								<h3 class="group-title">{g.title}</h3>
								<div class="mini-grid">
									{#each g.list as x (x.id)}<ConceptCard concept={x} compact />{/each}
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</section>

			<section id="finish" class="finish card">
				<div>
					<h2>{learned ? t('concept.niceWork') : t('concept.gotIt')}</h2>
					<p class="muted">
						{learned
							? t('concept.markedLearned')
							: t('concept.markToTrack')}
					</p>
				</div>
				<div class="finish-actions">
					<button class="btn" class:btn-primary={!learned} onclick={() => progress.toggle(c.id)}>
						{learned ? t('concept.unmark') : t('concept.markLearnedCta')}
					</button>
					{#if nextUp}
						<a class="btn next-btn" class:btn-primary={learned} href={pathHref(nextUp.id)}>{t('concept.nextName', { name: nextUp.name })} {t('common.arrowForward')}</a>
					{/if}
				</div>
			</section>

			{#if ctx}
				<nav class="pager" aria-label={t('concept.prevNext')}>
					{#if ctx.prev}
						<a class="card" href={pathHref(ctx.prev.id)}><span class="muted">{t('common.arrowBack')} {t('concept.previous')}</span>{ctx.prev.name}</a>
					{:else}<span></span>{/if}
					{#if ctx.next}
						<a class="card next" href={pathHref(ctx.next.id)}><span class="muted">{t('concept.next')} {t('common.arrowForward')}</span>{ctx.next.name}</a>
					{/if}
				</nav>
			{/if}
		</div>

		<aside class="toc" aria-label={t('concept.onThisPage')}>
			<span class="eyebrow">{t('concept.onThisPage')}</span>
			<ul>
				{#if hasExplainer(c.id) || hasPlayground(c.id)}
					<li><a href="#lesson">{hasExplainer(c.id) ? t('common.interactiveLesson') : t('common.playground')}</a></li>
				{/if}
				{#each sections as s (s.id)}
					<li><a href="#{s.id}" class:active={activeSection === s.id}>{s.label}</a></li>
				{/each}
			</ul>
		</aside>
	</div>
</article>

<style>
	.hero {
		padding: 28px 0 24px;
		border-bottom: 1px solid var(--border);
		background: linear-gradient(to bottom, color-mix(in srgb, var(--tc) 5%, var(--bg)), var(--bg));
	}
	.crumbs {
		display: flex;
		gap: 8px;
		font-size: 0.8125rem;
		color: var(--text-3);
		margin-bottom: 16px;
	}
	.crumbs a:hover {
		color: var(--text);
	}
	.path-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px 12px;
		margin-bottom: 18px;
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		font-size: 0.8125rem;
		width: fit-content;
		max-width: 100%;
	}
	.path-name {
		font-weight: 600;
	}
	.path-pos {
		color: var(--text-3);
	}
	.path-track {
		display: flex;
		gap: 3px;
	}
	.path-track span {
		width: 10px;
		height: 4px;
		border-radius: 2px;
		background: var(--surface-3);
	}
	.path-track span.done {
		background: var(--success);
	}
	.path-track span.here {
		background: var(--tc);
		width: 18px;
	}
	h1 {
		max-width: 22ch;
	}
	.summary {
		margin-top: 10px;
		max-width: var(--prose-w);
		font-size: 1.0625rem;
		color: var(--text-2);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 18px;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 3px 10px;
		border-radius: var(--radius-full);
		border: 1px solid var(--border);
		background: var(--surface);
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--text-2);
	}
	.chip.subtle {
		border-color: transparent;
		background: var(--surface-2);
		color: var(--text-3);
	}
	.track-chip .dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--tc);
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
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 20px;
	}
	.btn.learned {
		border-color: color-mix(in srgb, var(--success) 45%, var(--border));
		color: var(--success);
		background: color-mix(in srgb, var(--success) 8%, var(--surface));
	}

	.lesson {
		margin-top: 32px;
	}
	.lesson-loading {
		padding: 80px 0;
		text-align: center;
		color: var(--text-3);
	}
	.section-head {
		display: grid;
		gap: 4px;
		margin-bottom: 14px;
	}
	.section-head .eyebrow {
		color: var(--tc);
	}

	.body {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 200px;
		gap: 56px;
		margin-top: 40px;
	}
	.main {
		display: grid;
		/* minmax(0, …): otherwise the implicit track grows to the widest code line and sections spill under the TOC */
		grid-template-columns: minmax(0, 1fr);
		gap: 44px;
		min-width: 0;
	}
	section > h2 {
		margin-bottom: 14px;
	}
	.intuition {
		margin: 0;
		padding: 16px 20px;
		border-inline-start: 3px solid var(--tc);
		border-start-end-radius: var(--radius);
		border-end-end-radius: var(--radius);
		background: color-mix(in srgb, var(--tc) 6%, var(--surface));
		font-size: 1.0625rem;
		line-height: 1.65;
		max-width: var(--prose-w);
	}
	.prose {
		max-width: var(--prose-w);
		color: var(--text-2);
	}
	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}
	.use,
	.avoid {
		padding: 16px;
	}
	.use h3,
	.avoid h3 {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
		font-size: 0.9375rem;
	}
	.use p,
	.avoid p {
		color: var(--text-2);
		font-size: 0.9375rem;
	}
	.icon {
		display: grid;
		place-items: center;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		font-size: 0.6875rem;
	}
	.use .icon {
		background: color-mix(in srgb, var(--success) 15%, transparent);
		color: var(--success);
	}
	.avoid .icon {
		background: color-mix(in srgb, var(--danger) 13%, transparent);
		color: var(--danger);
	}
	.reqs {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 12px;
	}
	.req {
		display: inline-flex;
		gap: 8px;
		padding: 4px 10px;
		border-radius: var(--radius-sm);
		background: var(--surface-2);
		font-size: 0.8125rem;
	}
	.req-k {
		color: var(--text-3);
	}
	.req-v {
		font-weight: 600;
	}
	.req-v.yes {
		color: var(--success);
	}
	.req-v.no {
		color: var(--text-2);
	}
	.formula {
		padding: 16px 18px;
		border-radius: var(--radius);
		background: var(--surface-2);
		font-family: var(--font-mono);
		font-size: 0.9rem;
		line-height: 1.7;
		overflow-x: auto;
		white-space: pre-wrap;
		text-align: left;
		margin-bottom: 12px;
	}
	.loss {
		display: flex;
		gap: 10px;
		align-items: baseline;
		margin-bottom: 10px;
		font-size: 0.9375rem;
	}
	.params {
		display: grid;
		gap: 8px;
	}
	.param {
		padding: 14px 16px;
		display: grid;
		gap: 6px;
		font-size: 0.9375rem;
	}
	.param-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 8px 12px;
	}
	.param-name {
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--tc);
	}
	.param-type {
		font-size: 0.75rem;
		color: var(--text-3);
		padding: 1px 6px;
		border-radius: 4px;
		background: var(--surface-2);
	}
	.param-default {
		font-size: 0.8125rem;
		color: var(--text-3);
	}
	.param p {
		color: var(--text-2);
	}
	.tip {
		font-size: 0.875rem;
	}
	.tip strong {
		color: var(--text);
		font-weight: 600;
		margin-inline-end: 4px;
	}
	.list {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 8px;
		align-content: start;
	}
	.list li {
		position: relative;
		padding-block: 10px;
		padding-inline: 34px 12px;
		border-radius: var(--radius-sm);
		background: var(--surface);
		border: 1px solid var(--border);
		font-size: 0.9rem;
	}
	.list li::before {
		position: absolute;
		inset-inline-start: 12px;
		top: 10px;
		font-weight: 700;
	}
	.pros li::before {
		content: '+';
		color: var(--success);
	}
	.cons li::before {
		content: '−';
		color: var(--danger);
	}
	.h2-row {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 4px 16px;
		margin-bottom: 14px;
	}
	.map-link {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--accent);
	}
	.link-groups {
		display: grid;
		gap: 20px;
		margin-top: 16px;
	}
	.group-title {
		font-size: 0.875rem;
		color: var(--text-2);
		margin-bottom: 8px;
	}
	.mini-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
		gap: 8px;
	}
	.finish {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 22px 24px;
		background: color-mix(in srgb, var(--tc) 5%, var(--surface));
	}
	.finish h2 {
		margin-bottom: 4px;
	}
	.finish-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		min-width: 0;
	}
	/* Concept names can be long: let this button wrap instead of widening the page. */
	.next-btn {
		height: auto;
		min-height: 36px;
		padding-block: 7px;
		white-space: normal;
		text-align: start;
		max-width: 100%;
	}
	.pager {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}
	.pager a {
		display: grid;
		gap: 2px;
		padding: 14px 16px;
		font-weight: 600;
		font-size: 0.9375rem;
	}
	.pager a:hover {
		border-color: var(--border-strong);
	}
	.pager .muted {
		font-size: 0.8125rem;
		font-weight: 500;
	}
	.pager .next {
		text-align: end;
		grid-column: 2;
	}

	.toc {
		position: sticky;
		top: calc(var(--nav-h) + 24px);
		align-self: start;
		display: grid;
		gap: 10px;
	}
	.toc ul {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 2px;
		border-inline-start: 1px solid var(--border);
	}
	.toc a {
		display: block;
		margin-inline-start: -1px;
		padding: 4px 12px;
		border-inline-start: 2px solid transparent;
		font-size: 0.8125rem;
		color: var(--text-3);
	}
	.toc a:hover {
		color: var(--text);
	}
	.toc a.active {
		color: var(--text);
		border-inline-start-color: var(--tc);
		font-weight: 500;
	}

	@media (max-width: 960px) {
		.body {
			grid-template-columns: 1fr;
		}
		.toc {
			display: none;
		}
	}
	@media (max-width: 640px) {
		.two,
		.pager {
			grid-template-columns: 1fr;
		}
		.pager .next {
			grid-column: 1;
		}
	}
</style>
