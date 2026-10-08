<script lang="ts">
	import { resolve } from '$app/paths';
	import { progress } from '#lib/progress.svelte.ts';
	import { knowledgeTree } from '#lib/map/graphs.ts';

	const tree = knowledgeTree();
	const keys = tree.flatMap((t) => [t.track.id, ...t.categories.map((c) => `${t.track.id}/${c.name}`)]);

	let open = $state<Record<string, boolean>>(Object.fromEntries(keys.map((k) => [k, true])));
	const allOpen = $derived(keys.every((k) => open[k]));

	function setAll(value: boolean) {
		for (const k of keys) open[k] = value;
	}

	const count = (ids: { id: string }[]) => progress.countIn(ids.map((c) => c.id));
</script>

<svelte:head>
	<title>Knowledge tree · Map · ML Hub</title>
	<meta name="description" content="Every concept organised by track and category, with your learning progress." />
</svelte:head>

<section>
	<div class="intro">
		<h2>Knowledge tree</h2>
		<p>
			Every concept, organised by track and category, with your progress alongside. Use it as a checklist: collapse
			what you have covered and see what is left.
		</p>
	</div>

	<div class="bar">
		<button class="btn btn-sm" onclick={() => setAll(!allOpen)} aria-pressed={allOpen}>
			{allOpen ? 'Collapse all' : 'Expand all'}
		</button>
	</div>

	<ul class="tree">
		{#each tree as t (t.track.id)}
			<li style:--tc={t.track.color}>
				<details bind:open={open[t.track.id]}>
					<summary class="track">
						<span class="dot"></span>
						<span class="name">{t.track.label}</span>
						<span class="count">{count(t.concepts)}/{t.concepts.length}</span>
					</summary>
					<ul>
						{#each t.categories as cat (cat.name)}
							{@const key = `${t.track.id}/${cat.name}`}
							<li>
								<details bind:open={open[key]}>
									<summary class="category">
										<span class="name">{cat.name}</span>
										<span class="count">{count(cat.items)}/{cat.items.length}</span>
									</summary>
									<ul class="leaves">
										{#each cat.items as c (c.id)}
											{@const learned = progress.isLearned(c.id)}
											<li>
												<a href={resolve('/concept/[id]', { id: c.id })} class:learned>
													<span class="check" aria-label={learned ? 'Learned' : undefined}>{learned ? '✓' : ''}</span>
													<span class="name">{c.name}</span>
													<span class="diff diff-{c.difficulty.toLowerCase()}">{c.difficulty}</span>
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
		margin-left: auto;
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
		margin: 0 0 6px 21px;
		padding-left: 10px;
		border-left: 1px solid var(--border);
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
