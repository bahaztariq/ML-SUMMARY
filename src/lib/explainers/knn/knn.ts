/**
 * k-nearest-neighbours classification on 2-D points. Pure functions over plain arrays.
 */
import type { Data, Pt } from '../_classifiers/data.ts';

export type Metric = 'euclidean' | 'manhattan' | 'chebyshev';
export type Weights = 'uniform' | 'distance';

export interface KnnOpts {
	metric?: Metric;
	weights?: Weights;
	/** Multiplies each feature before measuring distance (unit changes / scaling). */
	scale?: readonly [number, number];
}

export function distance(a: readonly number[], b: readonly number[], metric: Metric = 'euclidean', scale: readonly [number, number] = [1, 1]): number {
	const dx = Math.abs(a[0] - b[0]) * scale[0];
	const dy = Math.abs(a[1] - b[1]) * scale[1];
	if (metric === 'manhattan') return dx + dy;
	if (metric === 'chebyshev') return Math.max(dx, dy);
	return Math.hypot(dx, dy);
}

export interface Neighbour {
	i: number;
	d: number;
}

/** All training points sorted by distance to q (ties broken by index, so results are deterministic). */
export function sortedByDistance(X: readonly (readonly number[])[], q: readonly number[], o: KnnOpts = {}): Neighbour[] {
	return X.map((p, i) => ({ i, d: distance(p, q, o.metric, o.scale) })).sort((a, b) => a.d - b.d || a.i - b.i);
}

export const neighbours = (X: readonly (readonly number[])[], q: readonly number[], k: number, o: KnnOpts = {}) =>
	sortedByDistance(X, q, o).slice(0, Math.max(1, Math.min(k, X.length)));

export interface Vote {
	/** Vote totals for A and B (counts, or summed 1/d weights). */
	votes: [number, number];
	/** Share of the vote for B. */
	pB: number;
	pred: number;
	tie: boolean;
	nbrs: Neighbour[];
}

/**
 * Majority vote of the k nearest neighbours. Like scikit-learn, a tie goes to the class with the
 * lowest label (A). With distance weights each vote counts 1/d; a neighbour at distance 0 decides alone.
 */
export function voteFrom(nbrs: Neighbour[], y: readonly number[], weights: Weights = 'uniform'): Vote {
	const votes: [number, number] = [0, 0];
	const exact = weights === 'distance' && nbrs.some((n) => n.d === 0);
	for (const n of nbrs) {
		const wgt = weights === 'uniform' ? 1 : exact ? (n.d === 0 ? 1 : 0) : 1 / n.d;
		votes[y[n.i]] += wgt;
	}
	const total = votes[0] + votes[1];
	const tie = Math.abs(votes[0] - votes[1]) <= 1e-12 * Math.max(1, total);
	return { votes, pB: total ? votes[1] / total : 0.5, pred: !tie && votes[1] > votes[0] ? 1 : 0, tie, nbrs };
}

export function vote(d: Data, q: readonly number[], k: number, o: KnnOpts = {}): Vote {
	return voteFrom(neighbours(d.X, q, k, o), d.y, o.weights);
}

export const predict = (d: Data, q: readonly number[], k: number, o: KnnOpts = {}) => vote(d, q, k, o).pred;

/** Accuracy on `test` for every k in 1..kMax at once (one sort per test point). */
export function accuracyByK(train: Data, test: Data, kMax: number, o: KnnOpts = {}): number[] {
	const ok = new Array(kMax).fill(0);
	test.X.forEach((q, t) => {
		const order = sortedByDistance(train.X, q, o);
		for (let k = 1; k <= kMax; k++) {
			const v = voteFrom(order.slice(0, k), train.y, o.weights);
			if (v.pred === test.y[t]) ok[k - 1]++;
		}
	});
	return ok.map((c) => c / test.X.length);
}

/** Training accuracy (each point is its own nearest neighbour, so k = 1 always scores 100%). */
export const trainAccuracyByK = (train: Data, kMax: number, o: KnnOpts = {}) => accuracyByK(train, train, kMax, o);

export type { Pt };
