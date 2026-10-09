<!-- Small legend row under a classifier plot: class markers plus optional extra keys. -->
<script lang="ts">
	import { local } from '#lib/i18n/index.svelte.ts';

	const L = local({
		en: { a: 'class A', b: 'class B' },
		fr: { a: 'classe A', b: 'classe B' },
		ar: { a: 'الفئة A', b: 'الفئة B' }
	});

	interface Props {
		names?: [string, string];
		extra?: { kind: 'ring' | 'line' | 'dash' | 'query' | 'band'; text: string }[];
		note?: string;
	}
	let { names, extra = [], note }: Props = $props();
	const shown = $derived(names ?? [L('a'), L('b')]);
</script>

<div class="legend">
	<span class="key"><i class="dot a"></i>{shown[0]}</span>
	<span class="key"><i class="sq b"></i>{shown[1]}</span>
	{#each extra as e (e.text)}
		<span class="key"><i class={e.kind}></i>{e.text}</span>
	{/each}
	{#if note}<span class="key note">{note}</span>{/if}
</div>

<style>
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 14px;
		font-size: 0.75rem;
		color: var(--text-3);
		margin-top: -4px;
	}
	.key {
		display: inline-flex;
		align-items: center;
		gap: 5px;
	}
	.key i {
		display: inline-block;
		width: 9px;
		height: 9px;
		flex: none;
	}
	.dot.a {
		border-radius: 50%;
		background: var(--viz-1);
	}
	.sq.b {
		background: var(--viz-3);
	}
	.ring {
		border-radius: 50%;
		border: 1.5px solid var(--text);
	}
	.line {
		height: 2px !important;
		width: 14px !important;
		background: var(--text);
	}
	.dash {
		height: 0 !important;
		width: 14px !important;
		border-top: 1.5px dashed var(--text-2);
	}
	.band {
		width: 14px !important;
		background: color-mix(in srgb, var(--text) 10%, transparent);
		border-top: 1.5px dashed var(--text-2);
		border-bottom: 1.5px dashed var(--text-2);
	}
	.query {
		width: 8px !important;
		height: 8px !important;
		transform: rotate(45deg);
		border: 2px solid var(--text);
		background: var(--viz-bg);
	}
</style>
