import { describe, expect, it } from 'vitest';
import { accuracyByK, distance, neighbours, trainAccuracyByK, vote, voteFrom } from './knn.ts';
import { N, TEST, TRAIN, tieSpot } from './state.ts';
import type { Data } from '../_classifiers/data.ts';

const toy: Data = {
	X: [
		[0, 0],
		[1, 0],
		[0, 1],
		[5, 5],
		[6, 5]
	],
	y: [0, 0, 1, 1, 1]
};

describe('knn', () => {
	it('distance metrics', () => {
		expect(distance([0, 0], [3, 4])).toBe(5);
		expect(distance([0, 0], [3, 4], 'manhattan')).toBe(7);
		expect(distance([0, 0], [3, 4], 'chebyshev')).toBe(4);
		expect(distance([0, 0], [3, 4], 'euclidean', [1, 10])).toBeCloseTo(Math.hypot(3, 40), 12);
	});

	it('finds the nearest neighbours in order', () => {
		expect(neighbours(toy.X, [0.2, 0.1], 3).map((n) => n.i)).toEqual([0, 1, 2]);
	});

	it('counts votes and predicts the majority', () => {
		const v = vote(toy, [0.2, 0.1], 3);
		expect(v.votes).toEqual([2, 1]);
		expect(v.pred).toBe(0);
		expect(vote(toy, [4, 4], 3).pred).toBe(1);
	});

	it('breaks ties toward class A like scikit-learn, and distance weights resolve them', () => {
		const v = vote(toy, [0.4, 0.45], 2, { metric: 'euclidean' });
		expect(v.votes[0] + v.votes[1]).toBe(2);
		const tie = voteFrom([{ i: 0, d: 1 }, { i: 2, d: 1 }], toy.y);
		expect(tie.tie).toBe(true);
		expect(tie.pred).toBe(0);
		const weighted = voteFrom([{ i: 0, d: 2 }, { i: 2, d: 1 }], toy.y, 'distance');
		expect(weighted.pred).toBe(1);
		const exact = voteFrom([{ i: 0, d: 0 }, { i: 2, d: 0.5 }, { i: 3, d: 0.6 }], toy.y, 'distance');
		expect(exact.pred).toBe(0);
	});

	it('k = 1 memorises the training set; k = N predicts the majority everywhere', () => {
		const tr = trainAccuracyByK(TRAIN, N);
		expect(tr[0]).toBe(1);
		const nA = TRAIN.y.filter((c) => c === 0).length;
		expect(nA).toBeGreaterThan(N - nA);
		for (const q of [[-1, 1], [1, -1], [0, 0]]) expect(vote(TRAIN, q, N).pred).toBe(0);
	});

	it('accuracyByK agrees with predicting one k at a time', () => {
		const a = accuracyByK(TRAIN, TEST, 9);
		for (const k of [1, 4, 9]) {
			const direct = TEST.X.filter((q, i) => vote(TRAIN, q, k).pred === TEST.y[i]).length / TEST.X.length;
			expect(a[k - 1]).toBeCloseTo(direct, 12);
		}
	});

	it('a moderate k beats k = 1 and k = N on new data; stretching x₂ hurts', () => {
		const a = accuracyByK(TRAIN, TEST, N);
		const best = Math.max(...a);
		expect(best).toBeGreaterThan(a[0] + 0.05);
		expect(best).toBeGreaterThan(a[N - 1] + 0.3);
		const stretched = accuracyByK(TRAIN, TEST, 5, { scale: [1, 10] });
		expect(stretched[4]).toBeLessThan(a[4] - 0.1);
	});

	it('tieSpot really is a tie for k = 4', () => {
		expect(vote(TRAIN, tieSpot(4), 4).tie).toBe(true);
	});
});
