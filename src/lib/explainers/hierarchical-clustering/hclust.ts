/**
 * Agglomerative (bottom-up) hierarchical clustering. Pure functions so the merge order
 * can be unit-tested and replayed one merge at a time by the lesson.
 *
 * Cluster ids follow SciPy: leaves are 0..n-1, merge t creates cluster n + t.
 */
import { blobs, concat, dist, segment, type Labelled, type Pt } from '../_clustering/data';

export type Linkage = 'single' | 'complete' | 'average' | 'ward';
export type Dataset = 'blobs' | 'chain';

export interface Merge {
	/** The two clusters joined (a < b). */
	a: number;
	b: number;
	/** Linkage distance at which they were joined: the dendrogram height. */
	height: number;
	/** Points in the new cluster. */
	size: number;
}

/** Full merge sequence using Lance–Williams distance updates. Ward heights match SciPy. */
export function linkage(points: Pt[], method: Linkage): Merge[] {
	const n = points.length;
	const total = 2 * n - 1;
	const D: number[][] = Array.from({ length: total }, () => new Array(total).fill(Infinity));
	for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) D[i][j] = dist(points[i], points[j]);
	const size = new Array(total).fill(1);
	const active = new Set<number>(points.map((_, i) => i));
	const merges: Merge[] = [];
	for (let t = 0; t < n - 1; t++) {
		let a = -1;
		let b = -1;
		let best = Infinity;
		const ids = [...active];
		for (let x = 0; x < ids.length; x++)
			for (let y = x + 1; y < ids.length; y++) {
				const d = D[ids[x]][ids[y]];
				if (d < best - 1e-12) {
					best = d;
					a = ids[x];
					b = ids[y];
				}
			}
		const id = n + t;
		const na = size[a];
		const nb = size[b];
		size[id] = na + nb;
		active.delete(a);
		active.delete(b);
		for (const k of active) {
			const dak = D[a][k];
			const dbk = D[b][k];
			const nk = size[k];
			let d: number;
			if (method === 'single') d = Math.min(dak, dbk);
			else if (method === 'complete') d = Math.max(dak, dbk);
			else if (method === 'average') d = (na * dak + nb * dbk) / (na + nb);
			else d = Math.sqrt(((na + nk) * dak ** 2 + (nb + nk) * dbk ** 2 - nk * best ** 2) / (na + nb + nk));
			D[id][k] = D[k][id] = d;
		}
		active.add(id);
		merges.push({ a: Math.min(a, b), b: Math.max(a, b), height: best, size: na + nb });
	}
	return merges;
}

/** Leaves (point indices) under each cluster id. */
export function members(merges: Merge[], n: number): number[][] {
	const out: number[][] = Array.from({ length: n }, (_, i) => [i]);
	merges.forEach((m) => out.push([...out[m.a], ...out[m.b]]));
	return out;
}

export interface Cut {
	/** Label per point, 0..k-1. */
	labels: number[];
	/** Cluster id of each label. */
	nodes: number[];
}

/**
 * Undo the top k−1 merges to get k clusters. Labels are stable as k grows: each time a
 * cluster splits, its larger half keeps the label and the smaller half gets the next one.
 */
export function cutK(merges: Merge[], n: number, k: number): Cut {
	k = Math.max(1, Math.min(n, k));
	const sizeOf = (id: number) => (id < n ? 1 : merges[id - n].size);
	const nodes = [2 * n - 2];
	if (n === 1) nodes[0] = 0;
	for (let t = 0; t < k - 1; t++) {
		const id = 2 * n - 2 - t;
		const at = nodes.indexOf(id);
		const m = merges[id - n];
		const [big, small] = sizeOf(m.a) >= sizeOf(m.b) ? [m.a, m.b] : [m.b, m.a];
		nodes[at] = big;
		nodes.push(small);
	}
	const mem = members(merges, n);
	const labels = new Array(n).fill(0);
	nodes.forEach((id, l) => mem[id].forEach((i) => (labels[i] = l)));
	return { labels, nodes };
}

/** Number of clusters left when every merge at or below `h` is applied (heights are monotone). */
export function kAtHeight(merges: Merge[], n: number, h: number): number {
	return n - merges.filter((m) => m.height <= h).length;
}

/** A cut height in the middle of the gap that gives exactly k clusters. */
export function heightForK(merges: Merge[], n: number, k: number): number {
	k = Math.max(1, Math.min(n, k));
	const lo = k === n ? 0 : merges[n - k - 1].height;
	const hi = k === 1 ? merges[n - 2].height * 1.08 : merges[n - k].height;
	return (lo + hi) / 2;
}

/** k whose cut sits in the largest vertical gap of the dendrogram (k ≥ 2). */
export function largestGapK(merges: Merge[], n: number): number {
	let best = 2;
	let gap = -1;
	for (let k = 2; k < n; k++) {
		const g = merges[n - k].height - merges[n - k - 1].height;
		if (g > gap) {
			gap = g;
			best = k;
		}
	}
	return best;
}

/** Leaf order for drawing (children left to right) and the x position of every cluster id. */
export function dendroLayout(merges: Merge[], n: number): { order: number[]; x: number[] } {
	const x = new Array(2 * n - 1).fill(0);
	const order: number[] = [];
	const walk = (id: number) => {
		if (id < n) {
			x[id] = order.length;
			order.push(id);
			return;
		}
		const m = merges[id - n];
		walk(m.a);
		walk(m.b);
		x[id] = (x[m.a] + x[m.b]) / 2;
	};
	walk(2 * n - 2);
	return { order, x };
}

/** The pair of points that defines a linkage distance (closest / farthest) between two groups. */
export function extremePair(points: Pt[], A: number[], B: number[], far: boolean): [number, number] {
	let best: [number, number] = [A[0], B[0]];
	let bd = far ? -Infinity : Infinity;
	for (const i of A)
		for (const j of B) {
			const d = dist(points[i], points[j]);
			if (far ? d > bd : d < bd) {
				bd = d;
				best = [i, j];
			}
		}
	return best;
}

export function makeData(kind: Dataset): Labelled {
	if (kind === 'blobs')
		return blobs(
			[
				{ c: [-0.55, 0.45], sx: 0.13, n: 10 },
				{ c: [0.5, 0.5], sx: 0.1, n: 9 },
				{ c: [0.05, -0.5], sx: 0.16, n: 11 }
			],
			17
		);
	// Two blobs joined by a thin bridge, plus one far-away outlier.
	return concat(
		blobs(
			[
				{ c: [-0.64, 0.05], sx: 0.13, n: 11 },
				{ c: [0.64, 0.05], sx: 0.13, n: 11 }
			],
			5
		),
		segment([-0.42, 0.05], [0.42, 0.05], 6, 2, 0.015, 2),
		{ points: [[0.05, -0.85]], truth: [3] }
	);
}
