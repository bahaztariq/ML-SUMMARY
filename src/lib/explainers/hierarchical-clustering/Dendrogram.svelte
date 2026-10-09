<!--
  Dendrogram drawn as SVG with theme CSS variables. Shows the first `merged` merges,
  an optional draggable horizontal cut line, and syncs leaf hover with the scatter plot.
  The wrapper is always LTR (also on RTL pages): x positions are data coordinates, and
  text-anchor / tick placement assume left-to-right. The cut drag only uses clientY.
-->
<script lang="ts">
	import { ticks } from '#lib/viz/canvas.ts';
	import { local } from '#lib/i18n/index.svelte.ts';
	import { dendroLayout, type Merge } from './hclust';

	interface Props {
		merges: Merge[];
		n: number;
		merged: number;
		/** Colour index per cluster id (-1 = grey). */
		nodeColor: number[];
		/** Cut height, or null for no cut line. */
		cutH: number | null;
		k: number;
		/** Index of the merge to emphasise (-1 = none). */
		highlight?: number;
		hover?: number;
		oncut?: (h: number) => void;
		onhover?: (leaf: number) => void;
	}
	let { merges, n, merged, nodeColor, cutH, k, highlight = -1, hover = -1, oncut, onhover }: Props = $props();

	/* declared apart so values widen to string (fr/ar must not have to match the English literals) */
	const en = {
		aria: 'Dendrogram: each ∩ joins two clusters at the height (distance) where they merged',
		height: 'height',
		cut: 'cut · K = {k}'
	};
	const L = local({
		en,
		fr: {
			aria: 'Dendrogramme : chaque ∩ relie deux clusters à la hauteur (distance) où ils ont fusionné',
			height: 'hauteur',
			cut: 'coupe · K = {k}'
		},
		ar: {
			aria: 'مخطط شجري: كل ∩ يصل عنقودين عند الارتفاع (المسافة) الذي اندمجا عنده',
			height: 'الارتفاع',
			cut: 'القطع · K = {k}'
		}
	});

	let width = $state(0);
	const H = 210;
	const M = { l: 40, r: 14, t: 14, b: 18 };

	const layout = $derived(dendroLayout(merges, n));
	const yMax = $derived((merges[n - 2]?.height ?? 1) * 1.1);
	const plotW = $derived(Math.max(10, width - M.l - M.r));
	const X = (pos: number) => M.l + ((pos + 0.5) * plotW) / n;
	const Y = (h: number) => M.t + (1 - h / yMax) * (H - M.t - M.b);
	const heightOf = (id: number) => (id < n ? 0 : merges[id - n].height);
	const colorVar = (j: number) => (j < 0 ? 'var(--text-3)' : `var(--viz-${(j % 6) + 1})`);

	const links = $derived(
		merges.slice(0, merged).map((m, t) => {
			const xa = X(layout.x[m.a]);
			const xb = X(layout.x[m.b]);
			const y = Y(m.height);
			return {
				t,
				d: `M${xa},${Y(heightOf(m.a))} V${y} H${xb} V${Y(heightOf(m.b))}`,
				color: colorVar(nodeColor[n + t] ?? -1)
			};
		})
	);

	/* the cut tag grows with its (translated) label */
	const cutLabel = $derived(L('cut', { k }));
	let cutText = $state<SVGTextElement>();
	let tagW = $state(74);
	$effect(() => {
		cutLabel;
		if (cutText) tagW = Math.max(74, Math.ceil(cutText.getComputedTextLength()) + 14);
	});

	let svg = $state<SVGSVGElement>();
	let dragging = false;
	function toHeight(e: PointerEvent) {
		const r = svg!.getBoundingClientRect();
		const y = e.clientY - r.top;
		const h = (1 - (y - M.t) / (H - M.t - M.b)) * yMax;
		return Math.max(0.001, Math.min(yMax * 0.999, h));
	}
	function down(e: PointerEvent) {
		if (!oncut) return;
		dragging = true;
		svg!.setPointerCapture(e.pointerId);
		oncut(toHeight(e));
	}
	function move(e: PointerEvent) {
		if (dragging && oncut) oncut(toHeight(e));
	}
	function up() {
		dragging = false;
	}
</script>

<div class="wrap" bind:clientWidth={width}>
	{#if width}
		<svg
			bind:this={svg}
			width={width}
			height={H}
			viewBox="0 0 {width} {H}"
			class:cuttable={!!oncut}
			role="img"
			aria-label={L('aria')}
			onpointerdown={down}
			onpointermove={move}
			onpointerup={up}
			onpointercancel={up}
		>
			{#each ticks(0, yMax, 4) as v (v)}
				<line class="grid" x1={M.l} x2={width - M.r} y1={Y(v)} y2={Y(v)} />
				<text class="tick" x={M.l - 6} y={Y(v)} text-anchor="end" dominant-baseline="middle">{v.toFixed(yMax < 2 ? 2 : 1)}</text>
			{/each}
			<text class="axis" x={4} y={8} dominant-baseline="hanging">{L('height')}</text>

			{#each links as l (l.t)}
				<path class="link" class:hot={l.t === highlight} d={l.d} style:stroke={l.t === highlight ? 'var(--accent)' : l.color} />
			{/each}

			{#each layout.order as leaf, pos (leaf)}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<circle
					class="leaf"
					class:hot={hover === leaf}
					cx={X(pos)}
					cy={Y(0)}
					r={hover === leaf ? 4.5 : 2.8}
					style:fill={colorVar(nodeColor[leaf] ?? -1)}
					onpointerenter={() => onhover?.(leaf)}
					onpointerleave={() => onhover?.(-1)}
				/>
			{/each}

			{#if cutH !== null}
				{@const y = Y(cutH)}
				<line class="cut" x1={M.l} x2={width - M.r} y1={y} y2={y} />
				<rect class="cut-tag" x={width - M.r - tagW} y={y - 20} width={tagW} height="17" rx="4" />
				<text bind:this={cutText} class="cut-label" x={width - M.r - tagW / 2} y={y - 11.5} text-anchor="middle" dominant-baseline="middle">{cutLabel}</text>
				{#if oncut}<circle class="handle" cx={M.l} cy={y} r="5" />{/if}
			{/if}
		</svg>
	{/if}
</div>

<style>
	.wrap {
		direction: ltr;
		width: 100%;
		min-height: 210px;
	}
	svg {
		display: block;
		touch-action: none;
		user-select: none;
	}
	svg.cuttable {
		cursor: ns-resize;
	}
	.grid {
		stroke: var(--viz-grid);
	}
	.tick {
		font-size: 10px;
		fill: var(--text-3);
		font-family: var(--font-sans);
	}
	.axis {
		font-size: 10px;
		fill: var(--text-3);
		font-family: var(--font-sans);
	}
	.link {
		fill: none;
		stroke-width: 1.6;
		stroke-linejoin: round;
	}
	.link.hot {
		stroke-width: 3;
	}
	.leaf.hot {
		stroke: var(--text);
		stroke-width: 1.5;
	}
	.cut {
		stroke: var(--text);
		stroke-width: 1.5;
		stroke-dasharray: 6 4;
	}
	.cut-tag {
		fill: var(--text);
	}
	.cut-label {
		font-size: 10.5px;
		font-weight: 600;
		fill: var(--viz-bg);
		font-family: var(--font-sans);
	}
	.handle {
		fill: var(--viz-bg);
		stroke: var(--text);
		stroke-width: 2;
	}
</style>
