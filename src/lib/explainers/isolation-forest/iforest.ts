/**
 * Isolation Forest building blocks (two features). Pure functions over plain arrays,
 * deterministic for a seed, so the explainer replays identically.
 */
import { gaussian, mulberry32 } from '#lib/viz/canvas.ts';

export type Pt = [number, number];
export type Feature = 0 | 1;
export type Dataset = 'blobs' | 'clump' | 'local';

export interface Data {
	X: Pt[];
	/** Planted anomalies (for checking the detector; the algorithm never sees this). */
	truth: boolean[];
}

export interface Rect {
	x0: number;
	x1: number;
	y0: number;
	y1: number;
}

const OUTLIERS: Pt[] = [
	[0.82, 0.78],
	[-0.85, -0.7],
	[0.9, -0.85],
	[-0.2, -0.88],
	[-0.9, 0.85],
	[0.2, 0.88],
	[0.88, 0.18],
	[-0.8, -0.12]
];

/** Points live in [-1, 1]². */
export function makeData(kind: Dataset, seed = 9): Data {
	const g = gaussian(mulberry32(seed));
	const X: Pt[] = [];
	const truth: boolean[] = [];
	const blob = (cx: number, cy: number, sd: number, n: number, anomaly = false) => {
		for (let i = 0; i < n; i++) {
			X.push([cx + g() * sd, cy + g() * sd]);
			truth.push(anomaly);
		}
	};
	const add = (p: Pt, anomaly: boolean) => {
		X.push([p[0], p[1]]);
		truth.push(anomaly);
	};
	if (kind === 'blobs') {
		blob(-0.42, 0.3, 0.15, 110);
		blob(0.38, -0.28, 0.19, 110);
		OUTLIERS.forEach((p) => add(p, true));
	} else if (kind === 'clump') {
		blob(-0.35, 0.05, 0.2, 200);
		blob(0.72, 0.68, 0.04, 25, true); // a tight group of anomalies: they mask each other
		add([-0.2, -0.85], true);
		add([0.85, -0.6], true);
	} else {
		blob(-0.45, 0.25, 0.06, 130); // dense cluster
		blob(0.4, -0.3, 0.24, 90); // sparse cluster
		add([-0.2, 0.3], true); // local anomalies: near the dense cluster, but clearly outside it
		add([-0.47, 0.02], true);
	}
	return { X, truth };
}

/** Average path length of an unsuccessful BST search over n points: normalises h(x). */
export function cFactor(n: number): number {
	if (n > 2) return 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1)) / n;
	return n === 2 ? 1 : 0;
}

export function bbox(X: Pt[], idx?: number[]): Rect {
	const r: Rect = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };
	for (const i of idx ?? X.keys()) {
		r.x0 = Math.min(r.x0, X[i][0]);
		r.x1 = Math.max(r.x1, X[i][0]);
		r.y0 = Math.min(r.y0, X[i][1]);
		r.y1 = Math.max(r.y1, X[i][1]);
	}
	return r;
}

/* ---------------- isolating one point ---------------- */

export interface Cut {
	f: Feature;
	thr: number;
	/** Box the cut is made in (the target's cell before the cut). */
	box: Rect;
	/** Points still sharing the target's cell after the cut. */
	left: number;
}

/**
 * Follow one random isolation tree down to `target`: pick a random feature and a random split
 * between the min and max of the points still in the target's cell, keep the target's side, and
 * repeat until it is alone. The number of cuts is its path length h(x) in that tree.
 */
export function isolate(X: Pt[], target: number, seed: number, maxCuts = 200): Cut[] {
	const rand = mulberry32(seed);
	let idx = X.map((_, i) => i);
	let box: Rect = { x0: -1.08, x1: 1.08, y0: -1.08, y1: 1.08 };
	const cuts: Cut[] = [];
	while (idx.length > 1 && cuts.length < maxCuts) {
		let f: Feature = rand() < 0.5 ? 0 : 1;
		let lo = Infinity;
		let hi = -Infinity;
		for (const i of idx) {
			lo = Math.min(lo, X[i][f]);
			hi = Math.max(hi, X[i][f]);
		}
		if (hi - lo < 1e-12) {
			f = f === 0 ? 1 : 0;
			lo = Infinity;
			hi = -Infinity;
			for (const i of idx) {
				lo = Math.min(lo, X[i][f]);
				hi = Math.max(hi, X[i][f]);
			}
			if (hi - lo < 1e-12) break; // duplicates can't be separated
		}
		const thr = lo + rand() * (hi - lo);
		const goLeft = X[target][f] < thr;
		idx = idx.filter((i) => X[i][f] < thr === goLeft);
		cuts.push({ f, thr, box, left: idx.length });
		box =
			f === 0
				? goLeft
					? { ...box, x1: thr }
					: { ...box, x0: thr }
				: goLeft
					? { ...box, y1: thr }
					: { ...box, y0: thr };
	}
	return cuts;
}

/** Cell the target ends up in after `cuts`. */
export function finalBox(cuts: Cut[], X: Pt[], target: number): Rect {
	if (!cuts.length) return { x0: -1.08, x1: 1.08, y0: -1.08, y1: 1.08 };
	const c = cuts[cuts.length - 1];
	const left = X[target][c.f] < c.thr;
	return c.f === 0 ? (left ? { ...c.box, x1: c.thr } : { ...c.box, x0: c.thr }) : left ? { ...c.box, y1: c.thr } : { ...c.box, y0: c.thr };
}

/* ---------------- the forest ---------------- */

export interface Node {
	size: number;
	f?: Feature;
	thr?: number;
	left?: Node;
	right?: Node;
}

function build(X: Pt[], idx: number[], rand: () => number, depth: number, limit: number): Node {
	if (idx.length <= 1 || depth >= limit) return { size: idx.length };
	const order: Feature[] = rand() < 0.5 ? [0, 1] : [1, 0];
	for (const f of order) {
		let lo = Infinity;
		let hi = -Infinity;
		for (const i of idx) {
			lo = Math.min(lo, X[i][f]);
			hi = Math.max(hi, X[i][f]);
		}
		if (hi - lo < 1e-12) continue;
		const thr = lo + rand() * (hi - lo);
		const L = idx.filter((i) => X[i][f] < thr);
		const R = idx.filter((i) => X[i][f] >= thr);
		return { size: idx.length, f, thr, left: build(X, L, rand, depth + 1, limit), right: build(X, R, rand, depth + 1, limit) };
	}
	return { size: idx.length };
}

export interface Forest {
	trees: Node[];
	/** Subsample size ψ each tree was grown on. */
	psi: number;
}

/** n_estimators trees, each grown on ψ rows drawn without replacement, depth limit ⌈log₂ ψ⌉. */
export function fitForest(X: Pt[], nTrees: number, maxSamples: number, seed: number): Forest {
	const rand = mulberry32(seed);
	const psi = Math.min(maxSamples, X.length);
	const limit = Math.ceil(Math.log2(Math.max(2, psi)));
	const trees: Node[] = [];
	for (let t = 0; t < nTrees; t++) {
		const all = X.map((_, i) => i);
		for (let i = 0; i < psi; i++) {
			const j = i + Math.floor(rand() * (all.length - i));
			[all[i], all[j]] = [all[j], all[i]];
		}
		trees.push(build(X, all.slice(0, psi), rand, 0, limit));
	}
	return { trees, psi };
}

/** h(x) in one tree: edges to the leaf, plus c(size) for the points the depth limit left unsplit. */
export function pathLength(node: Node, p: Pt, depth = 0): number {
	while (node.left && node.right && node.f !== undefined && node.thr !== undefined) {
		node = p[node.f] < node.thr ? node.left : node.right;
		depth++;
	}
	return depth + cFactor(node.size);
}

export function meanPath(F: Forest, p: Pt): number {
	return F.trees.reduce((acc, t) => acc + pathLength(t, p), 0) / F.trees.length;
}

/** Anomaly score s = 2^(−E[h(x)] / c(ψ)): near 1 = anomaly, well below 0.5 = normal. */
export function score(F: Forest, p: Pt): number {
	return 2 ** (-meanPath(F, p) / cFactor(F.psi));
}

/** Indices flagged when a fraction `contamination` of the data is declared anomalous. */
export function flagged(scores: number[], contamination: number): { idx: Set<number>; threshold: number } {
	const k = Math.round(contamination * scores.length);
	if (k <= 0) return { idx: new Set(), threshold: Infinity };
	const order = scores.map((_, i) => i).sort((a, b) => scores[b] - scores[a]);
	const top = order.slice(0, k);
	return { idx: new Set(top), threshold: scores[top[top.length - 1]] };
}
