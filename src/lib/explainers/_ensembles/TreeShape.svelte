<!--
  The shape of a binary tree: one dot per node, internal nodes labelled with the order in which they
  were split (if known), leaves tinted by the sign of their weight. Always fits its box.
-->
<script lang="ts">
	import { pick } from '#lib/i18n/index.svelte.ts';

	interface ShapeNode {
		id: number;
		depth: number;
		w: number;
		order?: number;
		left?: ShapeNode;
		right?: ShapeNode;
	}
	interface Props {
		root: ShapeNode;
		/** Fixed number of depth levels to reserve (so two trees can share a scale). */
		levels?: number;
		label?: string;
	}
	let { root, levels, label }: Props = $props();
	const aria = $derived(label ?? pick({ en: 'Tree shape', fr: 'Forme de l’arbre', ar: 'شكل الشجرة' }));

	interface Placed {
		n: ShapeNode;
		x: number;
		y: number;
	}

	const layout = $derived.by(() => {
		const out: Placed[] = [];
		let leaf = 0;
		let depth = 0;
		const walk = (n: ShapeNode): Placed => {
			const p: Placed = { n, x: 0, y: n.depth };
			depth = Math.max(depth, n.depth);
			out.push(p);
			if (n.left && n.right) {
				const l = walk(n.left);
				const r = walk(n.right);
				p.x = (l.x + r.x) / 2;
			} else p.x = leaf++;
			return p;
		};
		walk(root);
		return { nodes: out, leaves: leaf, depth };
	});

	const W = 300;
	const rows = $derived(Math.max(levels ?? 0, layout.depth) + 1);
	const H = $derived(Math.max(60, rows * 26 + 8));
	const xOf = (x: number) => (layout.leaves <= 1 ? W / 2 : 14 + (x / (layout.leaves - 1)) * (W - 28));
	const yOf = (d: number) => 12 + d * 26;
	const edges = $derived.by(() => {
		const out: { x0: number; y0: number; x1: number; y1: number }[] = [];
		const byId = new Map(layout.nodes.map((p) => [p.n.id, p]));
		for (const p of layout.nodes) {
			for (const c of [p.n.left, p.n.right]) {
				if (!c) continue;
				const q = byId.get(c.id)!;
				out.push({ x0: xOf(p.x), y0: yOf(p.y), x1: xOf(q.x), y1: yOf(q.y) });
			}
		}
		return out;
	});
</script>

<svg viewBox="0 0 {W} {H}" role="img" aria-label={aria}>
	{#each edges as e, i (i)}
		<line x1={e.x0} y1={e.y0} x2={e.x1} y2={e.y1} />
	{/each}
	{#each layout.nodes as p (p.n.id)}
		{#if p.n.left && p.n.right}
			<circle class="inner" cx={xOf(p.x)} cy={yOf(p.y)} r="8" />
			{#if p.n.order}<text x={xOf(p.x)} y={yOf(p.y) + 3.5}>{p.n.order}</text>{/if}
		{:else}
			<rect class="leaf" class:pos={p.n.w > 0} x={xOf(p.x) - 4.5} y={yOf(p.y) - 4.5} width="9" height="9" rx="2" />
		{/if}
	{/each}
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: auto;
		max-height: 220px;
	}
	line {
		stroke: var(--border-strong);
		stroke-width: 1.25;
	}
	.inner {
		fill: var(--surface);
		stroke: var(--text-2);
		stroke-width: 1.25;
	}
	text {
		font-size: 9px;
		font-weight: 700;
		text-anchor: middle;
		fill: var(--text);
		font-family: var(--font-mono);
	}
	.leaf {
		fill: var(--viz-1);
		opacity: 0.8;
	}
	.leaf.pos {
		fill: var(--viz-3);
	}
</style>
