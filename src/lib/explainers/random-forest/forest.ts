/**
 * Random forest building blocks: bootstrap samples, CART trees that look at a random subset of
 * features at every split, majority votes and out-of-bag scoring. Trees use the decision-tree
 * lesson's node type, so its prediction and region helpers apply unchanged.
 */
import { mulberry32 } from '#lib/viz/canvas.ts';
import * as dt from '../decision-tree/tree.ts';

export type { Data, Node, Pt } from '../decision-tree/tree.ts';

/* ---------------- data ---------------- */

/** The "true" rule: class B (1) below a wavy curve. A single tree can only approximate it with steps. */
export function truth([a, b]: dt.Pt): number {
	return b < 0.42 * Math.sin(2.6 * a + 0.5) - 0.05 ? 1 : 0;
}

/** Uniform points in [-0.95, 0.95]², labelled by `truth`, with a fraction `flip` of labels flipped. */
export function makeData(seed: number, n: number, flip: number): dt.Data {
	const rand = mulberry32(seed);
	const X: dt.Pt[] = [];
	const y: number[] = [];
	for (let i = 0; i < n; i++) {
		const p: dt.Pt = [rand() * 1.9 - 0.95, rand() * 1.9 - 0.95];
		let c = truth(p);
		if (rand() < flip) c = 1 - c;
		X.push(p);
		y.push(c);
	}
	return { X, y };
}

/* ---------------- bootstrap ---------------- */

/** n row indices drawn uniformly with replacement. */
export function bootstrap(n: number, rand: () => number): number[] {
	return Array.from({ length: n }, () => Math.floor(rand() * n));
}

/** How many times each row appears in a sample. */
export function multiplicity(n: number, idx: readonly number[]): number[] {
	const m = new Array(n).fill(0);
	for (const i of idx) m[i]++;
	return m;
}

/* ---------------- randomized CART ---------------- */

export interface ForestTreeOpts {
	/** Features examined at each split: 2 = all (plain CART), 1 = one feature drawn at random. */
	maxFeatures: 1 | 2;
	maxDepth?: number;
	minLeaf?: number;
}

/** Best Gini split on one feature for the (possibly repeated) rows in idx. */
function bestOnFeature(data: dt.Data, idx: readonly number[], f: dt.Feature, minLeaf: number) {
	const sorted = [...idx].sort((a, b) => data.X[a][f] - data.X[b][f]);
	const parent = dt.countsOf(data.y, idx);
	const n = idx.length;
	const pg = dt.gini(parent);
	const left: dt.Counts = [0, 0];
	let best: { f: dt.Feature; thr: number; gain: number } | null = null;
	for (let k = 0; k < n - 1; k++) {
		left[data.y[sorted[k]]]++;
		const v = data.X[sorted[k]][f];
		const next = data.X[sorted[k + 1]][f];
		if (next === v) continue;
		const nL = k + 1;
		if (nL < minLeaf || n - nL < minLeaf) continue;
		const right: dt.Counts = [parent[0] - left[0], parent[1] - left[1]];
		const weighted = (nL * dt.gini(left) + (n - nL) * dt.gini(right)) / n;
		const gain = pg - weighted;
		if (gain > 1e-12 && (!best || gain > best.gain + 1e-12)) best = { f, thr: (v + next) / 2, gain };
	}
	return best;
}

/**
 * Grow one forest tree on the rows in `idx` (repeats allowed). At every node only `maxFeatures`
 * randomly chosen features are searched; as in scikit-learn, if none of them gives a valid split the
 * search falls back to the remaining features before giving up.
 */
export function fitTree(data: dt.Data, idx: readonly number[], opts: ForestTreeOpts, rand: () => number): dt.Node {
	const maxDepth = opts.maxDepth ?? Infinity;
	const minLeaf = opts.minLeaf ?? 1;
	let nextId = 0;
	const grow = (rows: number[], depth: number): dt.Node => {
		const counts = dt.countsOf(data.y, rows);
		const node: dt.Node = { id: nextId++, depth, n: rows.length, counts, gini: dt.gini(counts), pred: counts[1] > counts[0] ? 1 : 0 };
		if (depth >= maxDepth || node.gini === 0 || rows.length < 2 * minLeaf) return node;
		let best: { f: dt.Feature; thr: number; gain: number } | null = null;
		if (opts.maxFeatures === 2) {
			for (const f of [0, 1] as const) {
				const b = bestOnFeature(data, rows, f, minLeaf);
				if (b && (!best || b.gain > best.gain + 1e-12)) best = b;
			}
		} else {
			const order: dt.Feature[] = rand() < 0.5 ? [0, 1] : [1, 0];
			best = bestOnFeature(data, rows, order[0], minLeaf) ?? bestOnFeature(data, rows, order[1], minLeaf);
		}
		if (!best) return node;
		node.split = best;
		node.left = grow(
			rows.filter((i) => data.X[i][best.f] <= best.thr),
			depth + 1
		);
		node.right = grow(
			rows.filter((i) => data.X[i][best.f] > best.thr),
			depth + 1
		);
		return node;
	};
	return grow([...idx], 0);
}

export interface ForestOpts extends ForestTreeOpts {
	nTrees: number;
	bootstrap: boolean;
	seed: number;
}

export interface Forest {
	trees: dt.Node[];
	/** inBag[t][i] = how many times row i is in tree t's sample. */
	inBag: number[][];
}

export function fitForest(data: dt.Data, o: ForestOpts): Forest {
	const rand = mulberry32(o.seed);
	const n = data.y.length;
	const all = Array.from({ length: n }, (_, i) => i);
	const trees: dt.Node[] = [];
	const inBag: number[][] = [];
	for (let t = 0; t < o.nTrees; t++) {
		const idx = o.bootstrap ? bootstrap(n, rand) : all;
		inBag.push(multiplicity(n, idx));
		trees.push(fitTree(data, idx, o, rand));
	}
	return { trees, inBag };
}

/** Fraction of the first B trees voting class 1 at point p. */
export function voteShare(trees: readonly dt.Node[], p: dt.Pt, B = trees.length) {
	let v = 0;
	for (let t = 0; t < B; t++) v += dt.predict(trees[t], p);
	return v / B;
}

/** Majority vote (ties go to class 0, as a 50/50 vote is a coin flip anyway). */
export const vote = (share: number) => (share > 0.5 ? 1 : 0);

export function accuracyOf(pred: readonly number[], y: readonly number[]) {
	let ok = 0;
	for (let i = 0; i < y.length; i++) if (pred[i] === y[i]) ok++;
	return y.length ? ok / y.length : NaN;
}

/**
 * Out-of-bag accuracy using the first B trees: each training row is predicted only by the trees
 * whose bootstrap sample left it out. Rows that every tree saw are skipped.
 */
export function oobAccuracy(forest: Forest, data: dt.Data, B = forest.trees.length) {
	let ok = 0;
	let counted = 0;
	data.X.forEach((p, i) => {
		let votes = 0;
		let k = 0;
		for (let t = 0; t < B; t++) {
			if (forest.inBag[t][i]) continue;
			votes += dt.predict(forest.trees[t], p);
			k++;
		}
		if (!k) return;
		counted++;
		if (vote(votes / k) === data.y[i]) ok++;
	});
	return { acc: counted ? ok / counted : NaN, counted };
}

/** Mean pairwise Pearson correlation between the trees' 0/1 predictions on a set of points. */
export function meanCorrelation(preds: readonly (readonly number[])[]) {
	const k = preds.length;
	const stats = preds.map((p) => {
		const m = p.reduce((a, b) => a + b, 0) / p.length;
		const sd = Math.sqrt(p.reduce((a, b) => a + (b - m) ** 2, 0) / p.length);
		return { m, sd };
	});
	let sum = 0;
	let pairs = 0;
	for (let a = 0; a < k; a++)
		for (let b = a + 1; b < k; b++) {
			if (!stats[a].sd || !stats[b].sd) {
				sum += 1;
				pairs++;
				continue;
			}
			let c = 0;
			for (let i = 0; i < preds[a].length; i++) c += (preds[a][i] - stats[a].m) * (preds[b][i] - stats[b].m);
			sum += c / preds[a].length / (stats[a].sd * stats[b].sd);
			pairs++;
		}
	return pairs ? sum / pairs : 1;
}
