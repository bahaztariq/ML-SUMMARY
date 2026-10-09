import { describe, expect, it } from 'vitest';
import type { Pt } from '../_clustering/data';
import { bicCurve, density, eStep, ellipse, fit, hardLabels, initComps, logLikelihood, makeData, mStep, type Comp } from './gmm';
import explainer from './index';
import { GOOD_SEED } from './state';

describe('gmm', () => {
	it('density matches the standard bivariate normal', () => {
		const c: Comp = { w: 1, mu: [0, 0], cov: [1, 0, 1] };
		expect(density([0, 0], c)).toBeCloseTo(1 / (2 * Math.PI), 10);
		expect(density([1, 0], c)).toBeCloseTo(Math.exp(-0.5) / (2 * Math.PI), 10);
	});

	it('responsibilities sum to 1 for every point', () => {
		const { points } = makeData('stretched');
		const r = eStep(points, initComps(points, 3, 1));
		for (const row of r) expect(row.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9);
	});

	it('M-step with hard responsibilities gives the per-group mean and covariance', () => {
		const pts: Pt[] = [
			[0, 0],
			[2, 0],
			[0, 2],
			[2, 2]
		];
		const [c] = mStep(pts, pts.map(() => [1]), 0);
		expect(c.w).toBe(1);
		expect(c.mu).toEqual([1, 1]);
		expect(c.cov).toEqual([1, 0, 1]);
	});

	it('EM never decreases the log-likelihood', () => {
		for (const d of ['stretched', 'blobs', 'moons'] as const) {
			const { points } = makeData(d);
			let comps = initComps(points, 3, 7);
			let prev = logLikelihood(points, comps);
			for (let i = 0; i < 40; i++) {
				comps = mStep(points, eStep(points, comps));
				const now = logLikelihood(points, comps);
				expect(now).toBeGreaterThanOrEqual(prev - 1e-5); // reg_covar perturbs exact EM by ~1e-6
				prev = now;
			}
		}
	});

	it('recovers the stretched groups where K-Means fails, and BIC picks K = 3', () => {
		const { points, truth } = makeData('stretched');
		const f = fit(points, initComps(points, 3, GOOD_SEED));
		const labels = hardLabels(eStep(points, f.comps));
		const map = new Map<number, number>();
		truth.forEach((t, i) => map.set(t, labels[i]));
		const agree = truth.filter((t, i) => labels[i] === map.get(t)).length / truth.length;
		expect(agree).toBeGreaterThan(0.97);
		const bic = bicCurve(points, 5, 2);
		expect(bic.indexOf(Math.min(...bic)) + 1).toBe(3);
	});

	it('ellipse axes come from the covariance eigen-decomposition', () => {
		const e = ellipse([4, 0, 1]);
		expect(e.rx).toBeCloseTo(2);
		expect(e.ry).toBeCloseTo(1);
		const tilted = ellipse([1, 0.9, 1]); // stretched along y = x
		expect(tilted.angle).toBeCloseTo(Math.PI / 4);
	});
});

describe('gmm lesson', () => {
	it('every step replays and tasks are achievable', () => {
		const s = explainer.init();
		explainer.steps.forEach((st, i) => {
			st.enter?.(s);
			const text = typeof st.body === 'function' ? st.body(s) : st.body;
			expect(text.length, `step ${i}`).toBeGreaterThan(20);
			st.quiz?.reveal?.(s);
		});
		expect(s.converged).toBe(true);
		expect(s.k).toBe(3);
	});
});
