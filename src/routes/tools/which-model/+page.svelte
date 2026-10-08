<script lang="ts">
	import { browser } from '$app/env';
	import { resolve } from '$app/paths';
	import { conceptById, getConcepts } from '#lib/content.ts';
	import { isQuestion, treeToMermaid, walk } from '#lib/tools/wizard.ts';
	import ConceptCard from '#lib/components/ConceptCard.svelte';
	import Diagram from '#lib/components/Diagram.svelte';

	let choices = $state<number[]>([]);
	let showTree = $state(false);

	const pos = $derived(walk(choices));
	const question = $derived(isQuestion(pos.node) ? pos.node : null);
	const result = $derived(isQuestion(pos.node) ? null : pos.node);
	const picks = $derived(result ? getConcepts(result.result) : []);
	const diagram = treeToMermaid((id) => conceptById.get(id)?.name);

	function choose(i: number) {
		choices = [...choices, i];
	}
	function goTo(step: number) {
		choices = choices.slice(0, step);
	}

	function onkeydown(e: KeyboardEvent) {
		if (!question || e.metaKey || e.ctrlKey || e.altKey) return;
		const t = e.target as HTMLElement | null;
		if (t?.closest('input, textarea, select, [contenteditable]')) return;
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
<svelte:head><title>Which model? · ML Hub</title></svelte:head>

<div class="container page">
	<a class="back" href={resolve('/tools')}>← Tools</a>
	<header class="head">
		<h1>Which model should I use?</h1>
		<p class="muted">Answer a few questions and get the concepts that fit your problem.</p>
	</header>

	<section class="wizard card" aria-live="polite">
		<nav class="crumbs" aria-label="Your answers">
			<button class="crumb" class:current={choices.length === 0} onclick={() => goTo(0)}>Start</button>
			{#each pos.crumbs as c, i (i)}
				<span class="sep" aria-hidden="true">›</span>
				<button class="crumb" class:current={i === pos.crumbs.length - 1 && !question} title={c.question} onclick={() => goTo(i)}
					>{c.answer}</button
				>
			{/each}
		</nav>

		{#if question}
			{#key pos.key}
				<div class="step">
					<span class="eyebrow">Question {pos.crumbs.length + 1}</span>
					<h2>{question.q}</h2>
					<div class="options">
						{#each question.options as o, i (o.next + i)}
							<button class="option" onclick={() => choose(i)}>
								<kbd aria-hidden="true">{i + 1}</kbd>
								<span>{o.label}</span>
								<span class="arrow" aria-hidden="true">→</span>
							</button>
						{/each}
					</div>
					{#if choices.length}
						<button class="btn btn-ghost btn-sm" onclick={() => goTo(choices.length - 1)}>← Back</button>
					{/if}
				</div>
			{/key}
		{:else if result}
			<div class="step">
				<span class="eyebrow">Recommended for you</span>
				<h2>Start with {picks[0]?.name ?? 'these concepts'}</h2>
				<p class="note">{result.note}</p>
				<div class="results">
					{#each picks as c, i (c.id)}
						<div class="pick" class:top={i === 0}>
							{#if i === 0}<span class="badge">Top pick</span>{/if}
							<ConceptCard concept={c} />
						</div>
					{/each}
				</div>
				<div class="actions">
					<button class="btn" onclick={() => goTo(choices.length - 1)}>← Change last answer</button>
					<button class="btn btn-primary" onclick={() => goTo(0)}>↺ Start over</button>
				</div>
			</div>
		{/if}
	</section>
</div>

<div class="container">
	<section class="tree">
		<div class="tree-head">
			<div>
				<h2>The whole decision tree</h2>
				<p class="muted">Every question and answer at once. Click a recommendation box to open its top concept.</p>
			</div>
			<button class="btn" aria-expanded={showTree} onclick={() => (showTree = !showTree)}>
				{showTree ? 'Hide tree' : 'Show full tree'}
			</button>
		</div>
		{#if browser && showTree}
			<Diagram source={diagram.source} links={diagram.links} highlight={diagram.nodeId(pos.key)} label="Model selection decision tree" />
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
		text-align: left;
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
	.note {
		max-width: 62ch;
		padding: 12px 14px;
		border-left: 3px solid var(--accent);
		border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
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
		right: 12px;
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
