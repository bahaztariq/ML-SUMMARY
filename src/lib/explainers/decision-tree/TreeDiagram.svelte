<!--
  Small rendered decision tree: each node shows its split rule, sample count and class counts.
  Big trees switch to a compact view (one dot per node) so the whole shape stays visible.
-->
<script lang="ts">
	import type { Node } from './tree';
	import { CLASS, featName } from './state';

	interface Props {
		root: Node;
		/** Draw the children with a dashed border (a split being previewed, not yet made). */
		preview?: boolean;
		hover?: number;
		onhover?: (id: number) => void;
	}
	let { root, preview = false, hover = -1, onhover }: Props = $props();

	const W = 92;
	const H = 58;
	const GAP = 10;
	const LEVEL = 84;
	const CW = 16;
	const CLEVEL = 26;

	interface Placed {
		node: Node;
		x: number;
		y: number;
		parent?: Placed;
		yes?: boolean;
	}

	let width = $state(0);

	const layout = $derived.by(() => {
		const out: Placed[] = [];
		let leaf = 0;
		let maxDepth = 0;
		const walk = (n: Node, parent?: Placed, yes?: boolean): Placed => {
			const p: Placed = { node: n, x: 0, y: n.depth, parent, yes };
			out.push(p);
			maxDepth = Math.max(maxDepth, n.depth);
			if (n.left && n.right) {
				const l = walk(n.left, p, true);
				const r = walk(n.right, p, false);
				p.x = (l.x + r.x) / 2;
			} else p.x = leaf++;
			return p;
		};
		walk(root);
		return { nodes: out, leaves: leaf, depth: maxDepth };
	});

	const compact = $derived(layout.leaves > 8);
	const vbW = $derived(compact ? layout.leaves * CW + 8 : layout.leaves * (W + GAP) + GAP);
	const vbH = $derived(compact ? layout.depth * CLEVEL + 20 : layout.depth * LEVEL + H + 24);
	/** Full view keeps text legible (scrolls sideways if needed); compact view always fits. */
	const pxW = $derived(compact || !width ? Math.min(width || vbW, vbW * 1.4) : Math.max(Math.min(width, vbW), vbW * 0.72));
	const pxH = $derived((vbH * pxW) / vbW);

	const cx = (p: Placed) => (compact ? 4 + CW / 2 + p.x * CW : GAP + p.x * (W + GAP) + W / 2);
	const cy = (p: Placed) => (compact ? 10 + p.y * CLEVEL : 12 + p.y * LEVEL);
	const classVar = (c: number) => (c ? 'var(--viz-3)' : 'var(--viz-1)');
	const purity = (n: Node) => (n.n ? Math.max(n.counts[0], n.counts[1]) / n.n : 0.5);
	const isLeaf = (n: Node) => !n.left || !n.right;

	/* When the tree is wider than the box, scroll so the root is centred. */
	let wrapEl = $state<HTMLDivElement>();
	$effect(() => {
		const rootX = layout.nodes.length ? cx(layout.nodes[0]) : 0;
		const scale = pxW / vbW;
		if (wrapEl && wrapEl.scrollWidth > wrapEl.clientWidth) wrapEl.scrollLeft = rootX * scale - wrapEl.clientWidth / 2;
	});
</script>

<div class="wrap" bind:this={wrapEl} bind:clientWidth={width} role="img" aria-label="Decision tree diagram">
	<svg viewBox="0 0 {vbW} {vbH}" width={pxW} height={pxH} class:compact>
		{#each layout.nodes as p (p.node.id)}
			{#if p.parent}
				{@const x0 = cx(p.parent)}
				{@const y0 = cy(p.parent) + (compact ? 0 : H)}
				{@const x1 = cx(p)}
				{@const y1 = cy(p)}
				<path
					class="edge"
					class:dashed={preview}
					d={compact ? `M${x0},${y0} L${x1},${y1}` : `M${x0},${y0} C${x0},${(y0 + y1) / 2} ${x1},${(y0 + y1) / 2} ${x1},${y1}`}
				/>
				{#if !compact}
					<text class="edge-label" x={(x0 + x1) / 2 + (p.yes ? -6 : 6)} y={(y0 + y1) / 2} text-anchor={p.yes ? 'end' : 'start'}
						>{p.yes ? 'yes' : 'no'}</text
					>
				{/if}
			{/if}
		{/each}

		{#each layout.nodes as p (p.node.id)}
			{@const n = p.node}
			{@const hot = hover === n.id}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<g
				class="node"
				class:hot
				transform="translate({cx(p)},{cy(p)})"
				onpointerenter={() => onhover?.(n.id)}
				onpointerleave={() => onhover?.(-1)}
			>
				<title
					>{n.split ? `${featName(n.split.f)} ≤ ${n.split.thr.toFixed(2)}?` : `Leaf → class ${CLASS[n.pred]}`} · {n.n} samples · {n.counts[0]} A / {n.counts[1]} B · Gini {n.gini.toFixed(3)}</title
				>
				{#if compact}
					<circle
						r={isLeaf(n) ? 5 : 4}
						fill={isLeaf(n) ? classVar(n.pred) : 'var(--surface)'}
						fill-opacity={isLeaf(n) ? 0.35 + 0.65 * (purity(n) - 0.5) * 2 : 1}
						stroke={isLeaf(n) ? classVar(n.pred) : 'var(--text-3)'}
						stroke-width={hot ? 2.5 : 1.2}
					/>
				{:else}
					{@const leafNode = isLeaf(n)}
					<rect
						x={-W / 2}
						y="0"
						width={W}
						height={H}
						rx="7"
						class="box"
						class:dashed={preview && p.parent}
						style:--c={classVar(n.pred)}
						class:leaf={leafNode && !(preview && !p.parent)}
					/>
					<text class="rule" x="0" y="15" text-anchor="middle">
						{#if n.split}{featName(n.split.f)} ≤ {n.split.thr.toFixed(2)}{:else if preview && !p.parent}root{:else}→ class {CLASS[n.pred]}{/if}
					</text>
					<text class="meta" x="0" y="30" text-anchor="middle">n={n.n} · G {n.gini.toFixed(2)}</text>
					<!-- class proportion bar -->
					{@const bw = W - 16}
					{@const aw = n.n ? (bw * n.counts[0]) / n.n : bw / 2}
					<rect x={-bw / 2} y="38" width={aw} height="5" rx="1.5" fill="var(--viz-1)" />
					<rect x={-bw / 2 + aw} y="38" width={bw - aw} height="5" rx="1.5" fill="var(--viz-3)" />
					<text class="counts" x={-bw / 2} y="53" fill="var(--viz-1)">{n.counts[0]} A</text>
					<text class="counts" x={bw / 2} y="53" text-anchor="end" fill="var(--viz-3)">{n.counts[1]} B</text>
				{/if}
			</g>
		{/each}
	</svg>
</div>

<style>
	.wrap {
		width: 100%;
		overflow-x: auto;
		display: flex;
	}
	svg {
		display: block;
		margin: 0 auto;
		flex: none;
		max-height: 320px;
	}
	.edge {
		fill: none;
		stroke: var(--text-3);
		stroke-width: 1.2;
	}
	.edge.dashed {
		stroke-dasharray: 4 3;
	}
	.edge-label {
		font-size: 10px;
		fill: var(--text-3);
		font-family: var(--font-sans);
	}
	.box {
		fill: var(--surface);
		stroke: var(--border);
		stroke-width: 1.2;
	}
	.box.leaf {
		fill: color-mix(in srgb, var(--c) 9%, var(--surface));
		stroke: color-mix(in srgb, var(--c) 45%, var(--border));
	}
	.box.dashed {
		stroke-dasharray: 4 3;
	}
	.node.hot .box {
		stroke: var(--text);
		stroke-width: 2;
	}
	.node {
		cursor: default;
	}
	.rule {
		font-size: 12px;
		font-weight: 600;
		fill: var(--text);
		font-family: var(--font-mono);
	}
	.meta {
		font-size: 10px;
		fill: var(--text-2);
		font-family: var(--font-mono);
	}
	.counts {
		font-size: 9.5px;
		font-weight: 600;
		font-family: var(--font-mono);
	}
</style>
