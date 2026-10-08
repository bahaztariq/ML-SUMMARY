<script lang="ts">
	import { resolve } from '$app/paths';
	import { progress } from '#lib/progress.svelte.ts';
	import type { LearningPath } from '#lib/types.ts';

	let { path }: { path: LearningPath } = $props();
	const done = $derived(progress.countIn(path.steps));
	const pct = $derived(Math.round((done / path.steps.length) * 100));
</script>

<a class="card path" href={resolve('/paths/[id]', { id: path.id })}>
	<div class="icon" aria-hidden="true">{path.icon}</div>
	<div class="text">
		<h3>{path.title}</h3>
		<p>{path.goal}</p>
	</div>
	<div class="foot">
		<div class="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="{path.title} progress">
			<span style:width="{pct}%"></span>
		</div>
		<span class="count">{done}/{path.steps.length}</span>
	</div>
</a>

<style>
	.path {
		display: grid;
		grid-template-rows: auto 1fr auto;
		gap: 10px;
		padding: 18px;
		transition:
			border-color 0.15s var(--ease),
			box-shadow 0.15s var(--ease);
	}
	.path:hover {
		border-color: var(--border-strong);
		box-shadow: var(--shadow);
	}
	.icon {
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		border-radius: 10px;
		background: var(--surface-2);
		font-size: 1.125rem;
	}
	h3 {
		font-size: 1rem;
		margin-bottom: 4px;
	}
	p {
		font-size: 0.875rem;
		color: var(--text-2);
	}
	.foot {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.bar {
		flex: 1;
		height: 6px;
		border-radius: 3px;
		background: var(--surface-3);
		overflow: hidden;
	}
	.bar span {
		display: block;
		height: 100%;
		border-radius: 3px;
		background: var(--accent);
		transition: width 0.4s var(--ease);
	}
	.count {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-3);
		font-variant-numeric: tabular-nums;
	}
</style>
