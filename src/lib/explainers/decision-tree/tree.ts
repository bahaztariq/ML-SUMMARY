/**
 * CART classification tree building blocks (two classes, two features). Pure functions over
 * plain arrays so they can be unit-tested and replayed deterministically by the explainer.
 */
import { mulberry32 } from '#lib/viz/canvas.ts';

export type Pt = [number, number];
/** Class counts: [class A, class B]. */
export type Counts = [number, number];
/** Feature index: 0 = x₁ (horizontal axis), 1 = x₂ (vertical axis). */
export type Feature = 0 | 1;

export interface Data {
	X: Pt[];
	y: number[];
}

export interface Split {
	f: Feature;
	/** Points with x[f] <= thr go left ("yes"), the rest go right. */
	thr: number;
}

export interface Node {
	id: number;
	depth: number;
	n: number;
	counts: Counts;
	gini: number;
	/** Majority class (ties go to A). */
	pred: number;
	split?: Split & { gain: number };
	left?: Node;
	right?: Node;
}

export interface SplitScore {
	left: Counts;
	right: Counts;
	giniLeft: number;
	giniRight: number;
	/** (nL·G_L + nR·G_R) / n */
	weighted: number;
	/** Parent impurity minus weighted child impurity. */
	gain: number;
}

/* ---------------- data ---------------- */

/** The "true" rule the data is drawn from: class B (1) in an L-shaped bottom region. */
export function truth([a, b]: Pt): number {
	return (a > -0.25 && b < 0.25) || (a < -0.25 && b < -0.55) ? 1 : 0;
}

/** Uniform points in [-0.95, 0.95]², labelled by `truth`, with a fraction `flip` of labels flipped. */
export function makeData(seed: number, n: number, flip: number): Data {
	const rand = mulberry32(seed);
	const X: Pt[] = [];
	const y: number[] = [];
	for (let i = 0; i < n; i++) {
		const p: Pt = [rand() * 1.9 - 0.95, rand() * 1.9 - 0.95];
		let c = truth(p);
		if (rand() < flip) c = 1 - c;
		X.push(p);
		y.push(c);
	}
	return { X, y };
}

/* ---------------- impurity ---------------- */

/** Gini impurity 1 − Σ pₖ²: 0 for a pure node, 0.5 for a 50/50 two-class node. */
export function gini(c: readonly number[]): number {
	const n = c.reduce((a, b) => a + b, 0);
	if (!n) return 0;
	return 1 - c.reduce((acc, k) => acc + (k / n) ** 2, 0);
}

const allIdx = (n: number) => Array.from({ length: n }, (_, i) => i);

export function countsOf(y: readonly number[], idx: readonly number[] = allIdx(y.length)): Counts {
	const c: Counts = [0, 0];
	for (const i of idx) c[y[i]]++;
	return c;
}

function score(parent: Counts, left: Counts): SplitScore {
	const right: Counts = [parent[0] - left[0], parent[1] - left[1]];
	const n = parent[0] + parent[1];
	const nL = left[0] + left[1];
	const giniLeft = gini(left);
	const giniRight = gini(right);
	const weighted = n ? (nL * giniLeft + (n - nL) * giniRight) / n : 0;
	return { left, right, giniLeft, giniRight, weighted, gain: gini(parent) - weighted };
}

/** Score one candidate split of the points in `idx` (default: all). */
export function scoreSplit(data: Data, split: Split, idx: readonly number[] = allIdx(data.y.length)): SplitScore {
	const parent = countsOf(data.y, idx);
	const left: Counts = [0, 0];
	for (const i of idx) if (data.X[i][split.f] <= split.thr) left[data.y[i]]++;
	return score(parent, left);
}

export interface CurvePoint extends SplitScore {
	thr: number;
	nLeft: number;
}

/**
 * Every candidate threshold on feature `f` (midpoints between consecutive distinct sorted values)
 * with its score, in increasing threshold order.
 */
export function impurityCurve(data: Data, f: Feature, idx: readonly number[] = allIdx(data.y.length)): CurvePoint[] {
	const sorted = [...idx].sort((a, b) => data.X[a][f] - data.X[b][f]);
	const parent = countsOf(data.y, idx);
	const left: Counts = [0, 0];
	const out: CurvePoint[] = [];
	for (let k = 0; k < sorted.length - 1; k++) {
		left[data.y[sorted[k]]]++;
		const v = data.X[sorted[k]][f];
		const next = data.X[sorted[k + 1]][f];
		if (next === v) continue;
		out.push({ thr: (v + next) / 2, nLeft: k + 1, ...score(parent, [left[0], left[1]]) });
	}
	return out;
}

/**
 * Greedy CART step: the split (over both features and all thresholds) with the lowest weighted
 * child impurity, keeping at least `minLeaf` points on each side. Null if nothing improves impurity.
 */
export function bestSplit(
	data: Data,
	idx: readonly number[] = allIdx(data.y.length),
	minLeaf = 1
): (Split & SplitScore) | null {
	let best: (Split & SplitScore) | null = null;
	for (const f of [0, 1] as const) {
		for (const c of impurityCurve(data, f, idx)) {
			if (c.nLeft < minLeaf || idx.length - c.nLeft < minLeaf) continue;
			if (c.gain <= 1e-12) continue;
			if (!best || c.weighted < best.weighted - 1e-12) {
				best = { f, thr: c.thr, left: c.left, right: c.right, giniLeft: c.giniLeft, giniRight: c.giniRight, weighted: c.weighted, gain: c.gain };
			}
		}
	}
	return best;
}

/* ---------------- tree ---------------- */

export interface FitOptions {
	maxDepth?: number;
	minLeaf?: number;
}

/** Grow a tree greedily, top-down: find the best split, partition, recurse on both sides. */
export function fit(data: Data, { maxDepth = Infinity, minLeaf = 1 }: FitOptions = {}): Node {
	let nextId = 0;
	const grow = (idx: number[], depth: number): Node => {
		const counts = countsOf(data.y, idx);
		const node: Node = {
			id: nextId++,
			depth,
			n: idx.length,
			counts,
			gini: gini(counts),
			pred: counts[1] > counts[0] ? 1 : 0
		};
		if (depth >= maxDepth || node.gini === 0 || idx.length < 2 * minLeaf) return node;
		const s = bestSplit(data, idx, minLeaf);
		if (!s) return node;
		node.split = { f: s.f, thr: s.thr, gain: s.gain };
		node.left = grow(
			idx.filter((i) => data.X[i][s.f] <= s.thr),
			depth + 1
		);
		node.right = grow(
			idx.filter((i) => data.X[i][s.f] > s.thr),
			depth + 1
		);
		return node;
	};
	return grow(allIdx(data.y.length), 0);
}

export function leafOf(node: Node, p: Pt): Node {
	while (node.split && node.left && node.right) node = p[node.split.f] <= node.split.thr ? node.left : node.right;
	return node;
}

export const predict = (node: Node, p: Pt) => leafOf(node, p).pred;

export function accuracy(node: Node, data: Data): number {
	if (!data.y.length) return NaN;
	let ok = 0;
	data.X.forEach((p, i) => {
		if (predict(node, p) === data.y[i]) ok++;
	});
	return ok / data.y.length;
}

export function stats(node: Node): { depth: number; leaves: number } {
	if (!node.left || !node.right) return { depth: node.depth, leaves: 1 };
	const l = stats(node.left);
	const r = stats(node.right);
	return { depth: Math.max(l.depth, r.depth), leaves: l.leaves + r.leaves };
}

export interface Rect {
	x0: number;
	x1: number;
	y0: number;
	y1: number;
}

/** The axis-aligned box every node owns, keyed by node id. Leaves' boxes tile `bounds`. */
export function regions(node: Node, bounds: Rect): Map<number, { node: Node; rect: Rect }> {
	const out = new Map<number, { node: Node; rect: Rect }>();
	const walk = (n: Node, r: Rect) => {
		out.set(n.id, { node: n, rect: r });
		if (!n.split || !n.left || !n.right) return;
		const { f, thr } = n.split;
		if (f === 0) {
			walk(n.left, { ...r, x1: Math.min(r.x1, thr) });
			walk(n.right, { ...r, x0: Math.max(r.x0, thr) });
		} else {
			walk(n.left, { ...r, y1: Math.min(r.y1, thr) });
			walk(n.right, { ...r, y0: Math.max(r.y0, thr) });
		}
	};
	walk(node, bounds);
	return out;
}

export const isLeaf = (n: Node) => !n.left || !n.right;
