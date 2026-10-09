/**
 * k-NN explainer state and the actions shared by lesson steps and scene controls.
 */
import { flipLabels, memo, moons, type Data, type Pt } from '../_classifiers/data.ts';
import * as knn from './knn.ts';

/** 90 training points (51 A, 39 B): two noisy moons with about 8% of the labels flipped. */
export const TRAIN: Data = flipLabels(moons(11, 90, 0.2, 50), 0.08, 111);
export const TEST: Data = moons(211, 400, 0.2, 222);
export const N = TRAIN.X.length;
export const SCALE_STEPS = [1, 2, 3, 5, 10];

export interface KnnState {
	query: Pt;
	k: number;
	metric: knn.Metric;
	weights: knn.Weights;
	/** Factor applied to x₂ before measuring distance. */
	scaleY: number;
	show: { links: boolean; ball: boolean; allDist: boolean; regions: boolean; curve: boolean; test: boolean };
	ui: { query: boolean; k: boolean; metric: boolean; weights: boolean; scale: boolean; view: boolean };
	did: { flip: boolean; metric: boolean; scaled: boolean; standardized: boolean };
}

export const opts = (s: KnnState): knn.KnnOpts => ({ metric: s.metric, weights: s.weights, scale: [1, s.scaleY] });
export const voteAt = (s: KnnState, q: readonly number[] = s.query) => knn.vote(TRAIN, q, s.k, opts(s));

const curves = memo<{ train: number[]; test: number[] }>(40);
/** Train/test accuracy for k = 1..N under the current metric, weights and scaling. */
export const curve = (s: KnnState) =>
	curves(`${s.metric}|${s.weights}|${s.scaleY}`, () => ({
		train: knn.trainAccuracyByK(TRAIN, N, opts(s)),
		test: knn.accuracyByK(TRAIN, TEST, N, opts(s))
	}));
export const testAcc = (s: KnnState) => curve(s).test[s.k - 1];
export const trainAcc = (s: KnnState) => curve(s).train[s.k - 1];
export const bestK = (s: KnnState) => {
	const t = curve(s).test;
	let b = 0;
	t.forEach((v, i) => {
		if (v > t[b]) b = i;
	});
	return { k: b + 1, acc: t[b] };
};

/** A query position where the k-vote ends in an exact tie (searched on a fixed grid, deterministic). */
export function tieSpot(k: number, o: knn.KnnOpts = {}): Pt {
	let best: Pt = [0, 0];
	let bd = Infinity;
	for (let y = -0.8; y <= 0.8; y += 0.02)
		for (let x = -0.8; x <= 0.8; x += 0.02) {
			const v = knn.vote(TRAIN, [x, y], k, o);
			if (v.tie) {
				const d = Math.hypot(x - 0.1, y);
				if (d < bd) {
					bd = d;
					best = [+x.toFixed(2), +y.toFixed(2)];
				}
			}
		}
	return best;
}

export const QUERY_START: Pt = [0, -0.2];

export function setScale(s: KnnState, v: number) {
	s.scaleY = v;
	if (v > 1) s.did.scaled = true;
}

export function standardize(s: KnnState) {
	if (s.scaleY > 1) s.did.standardized = true;
	s.scaleY = 1;
}

export const off = { query: false, k: false, metric: false, weights: false, scale: false, view: false };

export function init(): KnnState {
	return {
		query: [QUERY_START[0], QUERY_START[1]],
		k: 5,
		metric: 'euclidean',
		weights: 'uniform',
		scaleY: 1,
		show: { links: true, ball: true, allDist: false, regions: false, curve: false, test: false },
		ui: { ...off },
		did: { flip: false, metric: false, scaled: false, standardized: false }
	};
}
