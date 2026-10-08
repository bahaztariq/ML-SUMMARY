<script lang="ts">
	interface Props {
		items: { label: string; value: string; color?: string; highlight?: boolean }[];
	}
	let { items }: Props = $props();
</script>

<dl class="readouts">
	{#each items as it (it.label)}
		<div class="item" class:highlight={it.highlight}>
			<dt>{it.label}</dt>
			<dd style:color={it.color}>{it.value}</dd>
		</div>
	{/each}
</dl>

<style>
	.readouts {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: 0;
	}
	.item {
		display: flex;
		align-items: baseline;
		gap: 6px;
		padding: 4px 10px;
		border-radius: var(--radius-full);
		background: var(--surface-2);
		border: 1px solid transparent;
		transition:
			border-color 0.2s var(--ease),
			background 0.2s var(--ease);
	}
	.item.highlight {
		border-color: color-mix(in srgb, var(--acc, var(--accent)) 50%, transparent);
		background: color-mix(in srgb, var(--acc, var(--accent)) 8%, var(--surface-2));
	}
	dt {
		font-size: 0.75rem;
		color: var(--text-3);
	}
	dd {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}
</style>
