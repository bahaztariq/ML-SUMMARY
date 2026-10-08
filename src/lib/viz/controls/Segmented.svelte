<script lang="ts" generics="T extends string | number">
	interface Props {
		label?: string;
		value: T;
		options: { value: T; label: string }[];
		onchange?: (v: T) => void;
	}
	let { label, value = $bindable(), options, onchange }: Props = $props();
</script>

<div class="seg-wrap">
	{#if label}<span class="label">{label}</span>{/if}
	<div class="seg" role="radiogroup" aria-label={label}>
		{#each options as o (o.value)}
			<button
				role="radio"
				aria-checked={o.value === value}
				class:active={o.value === value}
				onclick={() => {
					value = o.value;
					onchange?.(o.value);
				}}>{o.label}</button
			>
		{/each}
	</div>
</div>

<style>
	.seg-wrap {
		display: grid;
		gap: 4px;
	}
	.label {
		font-size: 0.8125rem;
		color: var(--text-2);
	}
	.seg {
		display: inline-flex;
		padding: 2px;
		border-radius: var(--radius-sm);
		background: var(--surface-2);
		border: 1px solid var(--border);
	}
	button {
		height: 26px;
		padding: 0 10px;
		border: 0;
		border-radius: 5px;
		background: transparent;
		color: var(--text-2);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		white-space: nowrap;
	}
	button:hover {
		color: var(--text);
	}
	button.active {
		background: var(--surface);
		color: var(--text);
		box-shadow: var(--shadow-sm);
	}
</style>
