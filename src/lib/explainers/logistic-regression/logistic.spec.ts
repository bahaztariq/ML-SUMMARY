import { describe, expect, it } from 'vitest';
import { blobs } from '../_classifiers/data.ts';
import { confusion, fit, gdStep, gradient, gradNorm, logit, loss, pointLoss, prob, sigmoid, type Model } from './logistic.ts';
import { DATA, START, LR } from './state.ts';

describe('logistic regression', () => {
	const d = blobs(5, 60, { spread: [0.3, 0.3] });

	it('sigmoid is stable and symmetric', () => {
		expect(sigmoid(0)).toBe(0.5);
		expect(sigmoid(800)).toBe(1);
		expect(sigmoid(-800)).toBe(0);
		expect(sigmoid(2) + sigmoid(-2)).toBeCloseTo(1, 12);
		expect(sigmoid(logit(0.8))).toBeCloseTo(0.8, 12);
	});

	it('point loss is −log of the probability of the true class', () => {
		const m: Model = { w: [1.5, -0.5], b: 0.2 };
		const p = [0.3, 0.7];
		expect(pointLoss(m, p, 1)).toBeCloseTo(-Math.log(prob(m, p)), 12);
		expect(pointLoss(m, p, 0)).toBeCloseTo(-Math.log(1 - prob(m, p)), 12);
	});

	it('gradient matches finite differences (with and without the penalty)', () => {
		const m: Model = { w: [0.7, -1.3], b: 0.4 };
		for (const C of [Infinity, 0.5]) {
			const g = gradient(m, d, C);
			const h = 1e-6;
			const fd = (f: (e: number) => Model) => (loss(f(h), d, C) - loss(f(-h), d, C)) / (2 * h);
			expect(g.w[0]).toBeCloseTo(fd((e) => ({ w: [m.w[0] + e, m.w[1]], b: m.b })), 7);
			expect(g.w[1]).toBeCloseTo(fd((e) => ({ w: [m.w[0], m.w[1] + e], b: m.b })), 7);
			expect(g.b).toBeCloseTo(fd((e) => ({ w: [m.w[0], m.w[1]], b: m.b + e })), 7);
		}
	});

	it('gradient descent lowers the loss and approaches the Newton optimum', () => {
		const C = 1;
		let m = START;
		let prev = loss(m, d, C);
		for (let i = 0; i < 3000; i++) {
			m = gdStep(m, d, C, LR);
			const now = loss(m, d, C);
			expect(now).toBeLessThanOrEqual(prev + 1e-12);
			prev = now;
		}
		const best = fit(d, C);
		expect(gradNorm(gradient(best, d, C))).toBeLessThan(1e-8);
		expect(loss(m, d, C)).toBeCloseTo(loss(best, d, C), 4);
	});

	it('smaller C shrinks the weights', () => {
		const norms = [0.01, 0.1, 1, 10].map((C) => Math.hypot(...fit(DATA.overlap, C).w));
		for (let i = 1; i < norms.length; i++) expect(norms[i]).toBeGreaterThan(norms[i - 1]);
	});

	it('confusion counts add up and move with the threshold', () => {
		const m = fit(DATA.overlap, 1);
		const lo = confusion(m, DATA.overlap, 0.2);
		const hi = confusion(m, DATA.overlap, 0.8);
		expect(lo.tp + lo.fp + lo.fn + lo.tn).toBe(DATA.overlap.X.length);
		expect(lo.fn).toBeLessThanOrEqual(hi.fn);
		expect(lo.fp).toBeGreaterThanOrEqual(hi.fp);
	});
});
