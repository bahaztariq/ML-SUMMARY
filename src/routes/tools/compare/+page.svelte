<script lang="ts">
	import { untrack } from 'svelte';
	import { browser } from '$app/env';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { formatKey, trackById } from '#lib/content.ts';
	import { fullConceptById as conceptById } from '#lib/content-full.ts';
	import { MAX_SLOTS, parseSelection, requirementKeys, suggestions, writeSelection } from '#lib/tools/compare.ts';
	import ConceptPicker from '#lib/tools/ConceptPicker.svelte';
	import type { Concept } from '#lib/types.ts';

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

	const reqValue = (c: Concept, k: string) => {
		const v = c.requirements?.[k];
		return v === undefined ? '—' : v === true ? 'Yes' : v === false ? 'No' : v;
	};
	const pairs = suggestions.filter((p) => p.every((id) => conceptById.has(id)));
	const name = (id: string) => conceptById.get(id)!.name;
	const compareHref = (a: string, b: string) => `${resolve('/tools/compare')}?a=${a}&b=${b}`;
</script>

<svelte:head><title>Compare concepts · ML Hub</title></svelte:head>

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
	<a class="back" href={resolve('/tools')}>← Tools</a>
	<header class="head">
		<h1>Compare concepts</h1>
		<p class="muted">Pick two or three concepts and read them side by side. The URL updates so you can share a comparison.</p>
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
							<a class="slot-name" href={resolve('/concept/[id]', { id: c.id })}>{c.name}</a>
							<div class="slot-actions">
								<button class="btn btn-ghost btn-sm" onclick={() => (changing = i)}>Change</button>
								<button class="btn btn-ghost btn-sm" aria-label="Remove {c.name}" onclick={() => removeAt(i)}>Remove</button>
							</div>
						</div>
					{:else if c || i === ids.length}
						<div class="slot-pick">
							<span class="eyebrow">Concept {String.fromCharCode(65 + i)}</span>
							<ConceptPicker
								exclude={ids}
								label="Pick concept {String.fromCharCode(65 + i)}"
								placeholder={i === 0 ? 'e.g. Random Forest' : i === 1 ? 'e.g. XGBoost' : 'Add a third…'}
								onpick={(id) => {
									if (c) replaceAt(i, id);
									else add(id);
									changing = null;
								}}
							/>
							{#if c}
								<button class="btn btn-ghost btn-sm" onclick={() => (changing = null)}>Cancel</button>
							{:else if i === 2}
								<button class="btn btn-ghost btn-sm" onclick={() => (wantThird = false)}>Remove slot</button>
							{/if}
						</div>
					{:else}
						<div class="slot-pick waiting">
							<span class="eyebrow">Concept {String.fromCharCode(65 + i)}</span>
							<p class="muted">Pick concept {String.fromCharCode(64 + i)} first.</p>
						</div>
					{/if}
				</div>
			{/each}

			{#if picked.length}
				<div class="row-h">Track & category</div>
				{#each Array.from({ length: slots }, (_, i) => picked[i]) as c, i (i)}
					<div class="cell">
						{#if c}
							<strong>{trackById[c.track].label}</strong>
							<span class="sub">{c.category}</span>
							{#if c.task?.length}
								<div class="chips">{#each c.task as t (t)}<span class="chip">{t}</span>{/each}</div>
							{/if}
						{/if}
					</div>
				{/each}

				<div class="row-h">Difficulty</div>
				{#each Array.from({ length: slots }, (_, i) => picked[i]) as c, i (i)}
					<div class="cell">
						{#if c}<span class="diff diff-{c.difficulty.toLowerCase()}">{c.difficulty}</span>{/if}
					</div>
				{/each}

				<div class="row-h">Summary</div>
				{#each Array.from({ length: slots }, (_, i) => picked[i]) as c, i (i)}
					<div class="cell">{#if c}{@render text(c.summary)}{/if}</div>
				{/each}

				<div class="row-h">When to use</div>
				{#each Array.from({ length: slots }, (_, i) => picked[i]) as c, i (i)}
					<div class="cell">{#if c}{@render text(c.whenToUse)}{/if}</div>
				{/each}

				<div class="row-h">When to avoid</div>
				{#each Array.from({ length: slots }, (_, i) => picked[i]) as c, i (i)}
					<div class="cell">{#if c}{@render text(c.whenToAvoid)}{/if}</div>
				{/each}

				{#if reqKeys.length}
					<div class="row-h">Requirements</div>
					{#each reqKeys as k (k)}
						<div class="row-sub">{formatKey(k)}</div>
						{#each Array.from({ length: slots }, (_, i) => picked[i]) as c, i (i)}
							<div class="cell req">
								{#if c}
									{@const v = reqValue(c, k)}
									<span class="req-v" class:yes={v === 'Yes'} class:na={v === '—'}>{v}</span>
								{/if}
							</div>
						{/each}
					{/each}
				{/if}

				<div class="row-h">Hyperparameters</div>
				{#each Array.from({ length: slots }, (_, i) => picked[i]) as c, i (i)}
					<div class="cell">
						{#if c}
							{#if c.parameters?.length}
								<strong>{c.parameters.length}</strong>
								<div class="chips">
									{#each c.parameters as p (p.name)}<code class="chip mono" title={p.impact}>{p.name}</code>{/each}
								</div>
							{:else}<span class="none">None</span>{/if}
						{/if}
					</div>
				{/each}

				<div class="row-h">Pros</div>
				{#each Array.from({ length: slots }, (_, i) => picked[i]) as c, i (i)}
					<div class="cell">{#if c}{@render list(c.pros, 'pro')}{/if}</div>
				{/each}

				<div class="row-h">Cons</div>
				{#each Array.from({ length: slots }, (_, i) => picked[i]) as c, i (i)}
					<div class="cell">{#if c}{@render list(c.cons, 'con')}{/if}</div>
				{/each}
			{/if}
		</div>
	</div>

	{#if ids.length === 2 && slots === 2}
		<button class="btn add" onclick={() => (wantThird = true)}>＋ Add a third concept</button>
	{/if}

	{#if picked.length < 2}
		<section class="suggest">
			<span class="eyebrow">Popular comparisons</span>
			<div class="pairs">
				{#each pairs as [a, b] (a + b)}
					<a class="btn btn-sm" href={compareHref(a, b)}>{name(a)} <span class="vs">vs</span> {name(b)}</a>
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
		margin: 0 -20px;
		padding: 0 20px 4px;
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
		margin-left: -8px;
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
		padding-left: 18px;
	}
	.bullets li::before {
		position: absolute;
		left: 0;
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
