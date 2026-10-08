<script lang="ts">
	interface Props {
		label: string;
		value: number;
		min: number;
		max: number;
		step?: number;
		format?: (v: number) => string;
		oninput?: (v: number) => void;
	}
	let { label, value = $bindable(), min, max, step = 1, format = String, oninput }: Props = $props();
	const pct = $derived(((value - min) / (max - min)) * 100);
</script>

<label class="slider">
	<span class="top">
		<span class="label">{label}</span>
		<span class="value">{format(value)}</span>
	</span>
	<input
		type="range"
		{min}
		{max}
		{step}
		bind:value
		style:--pct="{pct}%"
		oninput={() => oninput?.(value)}
	/>
</label>

<style>
	.slider {
		display: grid;
		gap: 4px;
		min-width: 150px;
		flex: 1;
	}
	.top {
		display: flex;
		justify-content: space-between;
		font-size: 0.8125rem;
	}
	.label {
		color: var(--text-2);
	}
	.value {
		font-family: var(--font-mono);
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}
	input {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 18px;
		margin: 0;
		background: transparent;
		cursor: pointer;
	}
	input::-webkit-slider-runnable-track {
		height: 4px;
		border-radius: 2px;
		background: linear-gradient(to right, var(--acc, var(--accent)) var(--pct), var(--surface-3) var(--pct));
	}
	input::-moz-range-track {
		height: 4px;
		border-radius: 2px;
		background: linear-gradient(to right, var(--acc, var(--accent)) var(--pct), var(--surface-3) var(--pct));
	}
	input::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 16px;
		height: 16px;
		margin-top: -6px;
		border-radius: 50%;
		background: var(--surface);
		border: 2px solid var(--acc, var(--accent));
		box-shadow: var(--shadow-sm);
	}
	input::-moz-range-thumb {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--surface);
		border: 2px solid var(--acc, var(--accent));
	}
</style>
