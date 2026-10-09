import { describe, expect, it } from 'vitest';
import * as rc from './rec.ts';
import { FEATS, START } from './state.ts';

const R = START.slice(0, 6).map((row) => row.slice(0, 6));
const opts = { k: 2, lr: 0.03, lambda: 0.05, epochs: 150, seed: 1, every: 1 };

describe('recommender helpers', () => {
	it('similarity is symmetric, bounded and separates the two taste groups', () => {
		for (let u = 0; u < 6; u++)
			for (let v = 0; v < 6; v++) {
				const a = rc.similarity(R, u, v).sim;
				expect(a).toBeCloseTo(rc.similarity(R, v, u).sim, 12);
				expect(Math.abs(a)).toBeLessThanOrEqual(1 + 1e-9);
			}
		expect(rc.similarity(R, 0, 1).sim).toBeGreaterThan(0.5); // Ana ~ Ben (sci-fi fans)
		expect(rc.similarity(R, 0, 2).sim).toBeLessThan(-0.5); // Ana vs Cara (romance fan)
	});

	it('user-based CF predicts low for the romance film and high for the popular one', () => {
		expect(rc.cfPredict(R, 0, 4).pred).toBeLessThan(2.5);
		expect(rc.cfPredict(R, 0, 5).pred).toBeGreaterThan(3.5);
	});

	it('a user with no ratings has no similarity (cold start)', () => {
		const cold = [...R, [null, null, null, null, null, null]];
		expect(rc.similarity(cold, 6, 0).sim).toBeNaN();
		expect(rc.cfPredict(cold, 6, 0).pred).toBeNaN();
	});

	it('matrix factorisation training loss decreases and is reproducible', () => {
		const snaps = rc.trainMF(R, opts);
		expect(snaps.length).toBe(151);
		expect(snaps.at(-1)!.rmse).toBeLessThan(snaps[0].rmse / 4);
		expect(snaps.at(-1)!.rmse).toBeLessThan(0.3);
		expect(snaps[30].rmse).toBeLessThan(snaps[3].rmse);
		expect(rc.trainMF(R, opts).at(-1)).toEqual(snaps.at(-1));
	});

	it('MF item embedding puts sci-fi films together, away from romance', () => {
		const m = rc.trainMF(R, opts).at(-1)!;
		const sim = (a: number, b: number) => rc.cosine(m.Q[a], m.Q[b]);
		expect(sim(0, 2)).toBeGreaterThan(sim(0, 3));
		expect(sim(3, 4)).toBeGreaterThan(sim(3, 0));
	});

	it('content-based scores a brand-new sci-fi item for a sci-fi fan', () => {
		const withNew = R.map((row) => [...row, null]);
		expect(rc.contentScore(withNew, FEATS, 0, 6)).toBeGreaterThan(0.5);
		expect(rc.contentScore(withNew, FEATS, 0, 4)).toBeLessThan(0);
	});
});
